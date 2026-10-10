// Session-only history: never written to IndexedDB, D1, R2 or localStorage.
const copy = value => value === undefined ? undefined : structuredClone(value);
const json = value => JSON.stringify(value);

function externalAddition(before, after) {
  const oldOrders = new Map((before?.orders || []).map(o => [o.id, o]));
  for (const o of after?.orders || []) {
    const links = new Map((oldOrders.get(o.id)?.paymentLinks || []).map(l => [l.id, json(l)]));
    if ((o.paymentLinks || []).some(l => links.get(l.id) !== json(l))) return true;
  }
  const oldPayments = new Map((before?.payments || []).map(p => [p.id, json(p)]));
  return (after?.payments || []).some(p => String(p.externalId || '').startsWith('tikkie:') && oldPayments.get(p.id) !== json(p));
}

export function retainNumberCounters(previous, current) {
  const restored = copy(previous);
  restored.customerSequence = Math.max(restored.customerSequence || 0, current.customerSequence || 0);
  for (const [key, value] of Object.entries(current.documentSequences || {})) {
    restored.documentSequences ??= {};
    restored.documentSequences[key] = Math.max(restored.documentSequences[key] || 0, value);
  }
  return restored;
}

export function createSessionUndo(database, {onChange = () => {}, getRoute = () => '', maxSteps = 20, maxBytes = 16 * 1024 * 1024} = {}) {
  let entries = [], bytes = 0, enabled = false, busy = false, note = '';
  const status = () => ({count: entries.length, bytes, busy, label: entries.at(-1)?.label || '', note, maxSteps});
  const changed = () => onChange(status());
  function clear(reason = '') {entries = []; bytes = 0; note = reason; changed();}
  function observe(value) {
    if (entries.length && entries.at(-1).after !== json(value)) clear('Nieuwe gegevens uit een ander tabblad; geschiedenis opnieuw gestart.');
  }
  function remember({before, after, files, route, tooLarge, boundary}) {
    if (after === undefined) return;
    if (before === after && !files.size && !boundary) return;
    if (boundary) return clear('Na het terugzetten van een back-up begint een nieuwe geschiedenis.');
    const oldState = before === undefined ? undefined : JSON.parse(before), newState = JSON.parse(after);
    if (!oldState) return clear();
    if (externalAddition(oldState, newState)) return clear('Tikkie bijgewerkt; betaalverzoeken en ontvangsten blijven behouden.');
    observe(oldState);
    let size = (before.length + after.length) * 2;
    for (const [id, file] of files) size += id.length * 2 + (file?.blob?.size || 0) + 256;
    if (tooLarge || size > maxBytes) return clear('Deze wijziging is te groot voor Stap terug. Gebruik hiervoor een back-up.');
    const activity = newState.activities?.[0];
    const label = activity && activity.id !== oldState.activities?.[0]?.id ? activity.message : 'Gegevens gewijzigd';
    entries.push({before, after, files, route, size, label}); bytes += size; note = '';
    while (entries.length > maxSteps || bytes > maxBytes) bytes -= entries.shift().size;
    changed();
  }

  function transaction(names, mode = 'readonly') {
    if (busy && mode === 'readwrite') throw Error('Stap terug wordt opgeslagen. Wacht even met een nieuwe wijziging.');
    const tx = database.transaction(names, mode), stores = typeof names === 'string' ? [names] : Array.from(names);
    if (!enabled || mode !== 'readwrite' || !stores.includes('state')) return tx;
    const capture = {before: undefined, after: undefined, files: new Map(), route: getRoute(), tooLarge: false, boundary: stores.some(name => !['state', 'files'].includes(name))};
    const stateStore = tx.objectStore('state');
    // Cloud peek does not count as a form read: stale-write protection stays intact.
    const previous = stateStore.peek ? stateStore.peek('main') : stateStore.get('main');
    previous.onsuccess = () => {capture.before = json(previous.result ?? {customers: [], orders: [], payments: [], documents: [], activities: [], purchases: []});};
    let retainedBytes = 0;
    function captureFile(store, id) {
      if (capture.files.has(id) || capture.tooLarge || capture.boundary) return;
      capture.files.set(id, undefined);
      const request = store.peek ? store.peek(id, {maxBytes: maxBytes - retainedBytes, budget: maxBytes}) : store.get(id);
      request.onsuccess = () => {
        const file = request.result;
        retainedBytes += file?.blob?.size || 0;
        if (file?.undoTooLarge || retainedBytes > maxBytes) {capture.tooLarge = true; capture.files.clear();}
        else if (!capture.tooLarge && !capture.boundary) capture.files.set(id, copy(file));
      };
    }
    const facade = {
      get error() {return tx.error;},
      abort() {tx.abort();},
      objectStore(name) {
        const store = tx.objectStore(name);
        return {
          get: key => store.get(key), getAll: () => store.getAll(),
          put(value, key) {
            if (name === 'state' && key === 'main') capture.after = json(value);
            if (name === 'files') captureFile(store, key ?? value.id);
            return key === undefined ? store.put(value) : store.put(value, key);
          },
          delete(key) {
            if (name === 'files') captureFile(store, key);
            if (name === 'state' && key === 'main') capture.boundary = true;
            return store.delete(key);
          },
          clear() {capture.boundary = true; capture.files.clear(); return store.clear();}
        };
      }
    };
    tx.oncomplete = event => {
      try {remember(capture);}
      catch {clear('Deze wijziging is opgeslagen, maar kon niet aan Stap terug worden toegevoegd.');}
      finally {facade.oncomplete?.(event);}
    };
    tx.onerror = event => facade.onerror?.(event);
    tx.onabort = event => facade.onabort?.(event);
    return facade;
  }

  async function undo() {
    if (busy || !entries.length) throw Error('Er is geen wijziging om terug te draaien.');
    const entry = entries.at(-1); let restored, failure;
    busy = true; changed();
    try {
      await new Promise((resolve, reject) => {
        const tx = database.transaction(['state', 'files'], 'readwrite'), ss = tx.objectStore('state'), fs = tx.objectStore('files'), request = ss.get('main');
        request.onsuccess = () => {
          try {
            if (json(request.result) !== entry.after) {
              clear('Nieuwe gegevens uit een ander tabblad; geschiedenis opnieuw gestart.');
              throw Error('Er zijn nieuwere gegevens. Stap terug is niet uitgevoerd; de nieuwste gegevens blijven behouden.');
            }
            restored = retainNumberCounters(JSON.parse(entry.before), request.result);
            for (const [id, file] of entry.files) file ? fs.put(file) : fs.delete(id);
            ss.put(restored, 'main');
          } catch (error) {failure = error; tx.abort();}
        };
        tx.oncomplete = resolve;
        tx.onerror = () => reject(failure || tx.error || Error('Terugzetten mislukt.'));
        tx.onabort = () => reject(failure || tx.error || Error('Terugzetten afgebroken.'));
      });
      bytes -= entries.pop().size;
      // Counters remain monotonic, including when undoing several steps in a row.
      if (entries.length) {
        const next = entries.at(-1), after = json(restored), extra = (after.length - next.after.length) * 2;
        next.after = after; next.size += extra; bytes += extra;
        while (bytes > maxBytes && entries.length) bytes -= entries.shift().size;
      }
      return {state: restored, route: entry.route, label: entry.label};
    } finally {busy = false; changed();}
  }
  return {db: {transaction, close: () => database.close()}, status, observe, undo, enable() {enabled = true;}, clear};
}
