"""Private local Tikkie proxy; the public CRM never receives credentials."""
import json
import os
import threading
import uuid
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit, quote
from urllib.request import Request, urlopen

PRIVATE = Path(__file__).resolve().parent / '.local'
LOCK = threading.Lock()


class TikkieError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def journal():
    path = PRIVATE / 'tikkie-requests.json'
    return json.loads(path.read_text()) if path.exists() else {}


def write_journal(records):
    PRIVATE.mkdir(exist_ok=True)
    temp = PRIVATE / 'tikkie-requests.tmp'
    with open(temp, 'w', encoding='utf-8') as handle:
        os.chmod(temp, 0o600)
        json.dump(records, handle, ensure_ascii=False)
        handle.flush()
        os.fsync(handle.fileno())
    temp.replace(PRIVATE / 'tikkie-requests.json')


def saved_requests(order_id):
    with LOCK:
        records = [r for r in journal().values() if r['orderId'] == order_id]
        return {'links': [r['result'] for r in records if r.get('result')],
                'pending': any(r['state'] == 'pending' for r in records)}


def connection():
    try:
        config = json.loads((PRIVATE / 'tikkie.json').read_text())
        base = config['base_url'].rstrip('/')
        if base not in ('https://api.abnamro.com/v2/tikkie', 'https://api-sandbox.abnamro.com/v2/tikkie'):
            raise ValueError()
        headers = {'API-Key': config['api_key'], 'X-App-Token': config['app_token'],
                   'Content-Type': 'application/json', 'Accept': 'application/json'}
        if not headers['API-Key'] or not headers['X-App-Token']:
            raise ValueError()
        return base, headers
    except (OSError, ValueError, KeyError):
        raise TikkieError('De lokale Tikkie-koppeling is nog niet ingesteld.', 503)


def check_payments(payload):
    """Read payments only for requests previously created by this CRM."""
    try:
        order_id = str(uuid.UUID(payload['orderId']))
        link_id = payload.get('linkId')
        if link_id:
            link_id = str(uuid.UUID(link_id))
    except (ValueError, KeyError, TypeError, AttributeError):
        raise TikkieError('Kies een geldige order en betaallink.')
    with LOCK:
        links = [r['result'].copy() for r in journal().values()
                 if r['orderId'] == order_id and r.get('result') and
                 (not link_id or r['result']['id'] == link_id)]
    if not links:
        raise TikkieError('Er is nog geen lokale Tikkie-betaallink voor deze order.')
    base, headers = connection()
    checked = []
    def get(path):
        with urlopen(Request(base + path, headers=headers, method='GET'), timeout=25) as response:
            return json.load(response)
    try:
        for link in links:
            path = '/paymentrequests/' + quote(link['paymentRequestToken'], safe='')
            details = get(path)
            payments, seen = [], set()
            for page in range(100):
                data = get(path + '/payments?pageNumber=' + str(page) + '&pageSize=50')
                rows = data['payments']
                if not isinstance(rows, list):
                    raise ValueError()
                for row in rows:
                    token, amount, when = row['paymentToken'], row['amountInCents'], row['createdDateTime']
                    if not isinstance(token, str) or not token or type(amount) is not int or amount <= 0:
                        raise ValueError()
                    datetime.fromisoformat(when.replace('Z', '+00:00'))
                    if token not in seen:
                        payments.append({'paymentToken': token, 'amountInCents': amount,
                                         'createdAt': when, 'description': row.get('description', '')})
                        seen.add(token)
                if len(rows) < 50 or len(payments) >= data.get('totalElementCount', 2**31):
                    break
            else:
                raise TikkieError('Er zijn te veel betalingen om in één keer te controleren.', 503)
            # Use actual transaction rows; OPEN is a link status, not an unpaid status.
            link.update(status=details['status'], payments=payments,
                        paidInCents=sum(p['amountInCents'] for p in payments),
                        checkedAt=datetime.now(timezone.utc).isoformat())
            checked.append(link)
    except HTTPError as error:
        message = {401: 'Tikkie weigert de toegang. Controleer de API-key en app-token.',
                   403: 'Deze Tikkie-app mag de betalingen niet ophalen.',
                   404: 'Deze betaallink is niet gevonden bij Tikkie.'}.get(error.code,
                   'Tikkie kon de betalingen niet ophalen. Probeer later opnieuw.')
        raise TikkieError(message, 503)
    except (URLError, TimeoutError, OSError, ValueError, KeyError, TypeError):
        raise TikkieError('De Tikkie-betalingen konden niet betrouwbaar worden opgehaald. De bestaande betalingen blijven behouden.', 503)
    with LOCK:
        records = journal()
        for link in checked:
            records[link['id']]['result'] = link
        write_journal(records)
    return {'links': checked}


def create_request(payload):
    try:
        request_id = str(uuid.UUID(payload['requestId']))
        order_id = str(uuid.UUID(payload['orderId']))
        amount = payload['amountInCents']
        description = payload['description'].strip()
        expiry = date.fromisoformat(payload['expiryDate'])
        if type(amount) is not int or not 0 < amount <= 2_147_483_647:
            raise ValueError()
        if not description or len(description) > 35 or any(ord(c) < 32 for c in description):
            raise ValueError()
        if expiry <= date.today():
            raise ValueError()
        document_id = payload.get('documentId', '')
        if document_id:
            document_id = str(uuid.UUID(document_id))
    except (ValueError, KeyError, TypeError, AttributeError):
        raise TikkieError('Controleer bedrag, omschrijving en vervaldatum.')
    body = {'amountInCents': amount, 'description': description,
            'expiryDate': expiry.isoformat(), 'referenceId': 'CRM' + request_id.replace('-', '')}
    identity = {'orderId': order_id, 'documentId': document_id, 'body': body}
    with LOCK:
        records = journal()
        old = records.get(request_id)
        if old:
            if any(old[k] != identity[k] for k in identity):
                raise TikkieError('Dit verzoek is al gebruikt. Open Betaallink maken opnieuw.', 409)
            if old.get('result'):
                return old['result']
            if old['state'] == 'pending':
                raise TikkieError('Tikkie heeft nog geen zeker antwoord gegeven. Controleer eerst je Tikkie-portaal; we maken geen tweede link aan.', 409)
        if any(r['orderId'] == order_id and r['state'] == 'pending' for r in records.values()):
            raise TikkieError('Een eerder verzoek voor deze order heeft geen zeker antwoord. Controleer je Tikkie-portaal voordat je een nieuwe link maakt.', 409)
        base, headers = connection()
        records[request_id] = {**identity, 'state': 'pending'}
        # Write intent before the external call. An interrupted/uncertain call is never blindly retried.
        write_journal(records)
        try:
            request = Request(base + '/paymentrequests', data=json.dumps(body).encode(), headers=headers, method='POST')
            with urlopen(request, timeout=25) as response:
                result = json.load(response)
                if response.status != 201:
                    raise ValueError()
            parsed = urlsplit(result['url'])
            if parsed.scheme != 'https' or parsed.hostname != 'tikkie.me' or not result.get('paymentRequestToken'):
                raise ValueError()
            link = {'id': request_id, 'documentId': document_id, 'amountInCents': amount,
                    'description': description, 'expiryDate': expiry.isoformat(),
                    'url': result['url'], 'paymentRequestToken': result['paymentRequestToken'],
                    'referenceId': body['referenceId'], 'status': result.get('status', 'OPEN'),
                    'createdAt': result.get('createdDateTime') or datetime.now(timezone.utc).isoformat()}
            records[request_id].update(state='created', result=link)
            write_journal(records)
            return link
        except HTTPError as error:
            if error.code < 500:
                records[request_id]['state'] = 'rejected'
                write_journal(records)
                message = {401: 'Tikkie weigert de API-key of app-token. Controleer de toegang in het ABN Developer Portal.',
                           403: 'Deze Tikkie-app heeft geen toestemming om betaalverzoeken te maken.',
                           429: 'Tikkie krijgt te veel verzoeken. Probeer later opnieuw.'}.get(error.code,
                           'Tikkie heeft het verzoek geweigerd. Controleer het bedrag en de limiet in je Tikkie-portaal.')
                raise TikkieError(message, 400)
            raise TikkieError('Tikkie gaf geen zeker antwoord. Controleer je Tikkie-portaal; dit verzoek wordt niet opnieuw verstuurd.', 503)
        except (URLError, TimeoutError, OSError, ValueError, KeyError):
            raise TikkieError('Er is geen zeker antwoord van Tikkie ontvangen. Controleer je Tikkie-portaal; we voorkomen een dubbele betaallink.', 503)
