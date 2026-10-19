"""Real route handlers, fake converter/runtime; no sockets or credentials."""
import base64, importlib.util, io, json, sys, tempfile
from pathlib import Path
from types import SimpleNamespace
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
spec = importlib.util.spec_from_file_location('local', ROOT / 'dev-server.py')
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)
calls = []
def fake_run(command, **kwargs):
    calls.append((command, kwargs))
    if command[-1] == '--preview':
        return SimpleNamespace(returncode=0, stdout=json.dumps({'page': 1, 'pages': 2, 'image': 'fake-png'}))
    return SimpleNamespace(returncode=0, stdout=json.dumps({'pdf': base64.b64encode(b'%PDF fake').decode(), 'docx': base64.b64encode(b'PK fake').decode(), 'pages': 1, 'previews': [], 'filename': 'Pakbon_CONCEPT'}))
server.subprocess.run = fake_run
class Request(server.Handler):
    def __init__(self, path, body=None, origin='http://localhost:3011', host='localhost:3011'):
        self.path = path
        data = json.dumps(body).encode() if body is not None else b''
        self.headers = {'Host': host, 'Origin': origin, 'Content-Type': 'application/json', 'Content-Length': str(len(data))}
        self.rfile, self.wfile = io.BytesIO(data), io.BytesIO()
        self.status = None
    def send_response(self, status): self.status = status
    def send_error(self, status, *args): self.status = status
    def send_header(self, *args): pass
    def end_headers(self): pass
with tempfile.TemporaryDirectory(prefix='packing-local-test-') as directory:
    server.COMPANY = 'maatwerkkunststof'
    server.LOCAL_ORIGINS = ('http://localhost:3011', 'http://127.0.0.1:3011')
    server.PRIVATE = Path(directory)
    (server.PRIVATE / 'document-runtime.json').write_text(json.dumps({'python': 'fake-python'}))
    for kind in ['invoice', 'confirmation', 'quote', 'proforma', 'unknown']:
        request = Request('/__local/documents/render', {'kind': kind}); request.do_POST()
        assert request.status == 503 and not calls
    for path in ['/__local/tikkie/create', '/__local/tikkie/check', '/__local/tikkie/journal', '/__local/imports', '/__local/files/private']:
        request = Request(path, {})
        request.do_POST() if path.endswith(('create', 'check')) else request.do_GET()
        assert request.status == 503 and not calls
    for kwargs in [{'origin': 'http://localhost:3010'}, {'host': 'evil.invalid'}, {'origin': 'https://evil.invalid'}]:
        request = Request('/__local/documents/render', {'kind': 'packing'}, **kwargs); request.do_POST()
        assert request.status == 403 and not calls
    request = Request('/__local/documents/render', []); request.do_POST()
    assert request.status == 400 and not calls
    request = Request('/__local/documents/render', {'kind': 'packing', 'number': 'CONCEPT'}); request.do_POST()
    assert request.status == 200 and len(calls) == 1
    assert calls[0][1]['env']['CRM_DOCUMENT_RUNTIME'] == str(server.PRIVATE / 'document-runtime.json')
    response = json.loads(request.wfile.getvalue())
    download = Request(response['downloads']['pdf']); download.do_GET()
    assert download.status == 200 and download.wfile.getvalue() == b'%PDF fake'
    wrong = Request(response['downloads']['pdf'], host='localhost:3010'); wrong.do_GET()
    assert wrong.status == 403
    before = len(server.DOWNLOADS)
    request = Request('/__local/documents/preview', {'data': 'fictitious', 'page': 1}); request.do_POST()
    assert request.status == 200 and calls[-1][0][-1] == '--preview'
    assert 'downloads' not in json.loads(request.wfile.getvalue()) and len(server.DOWNLOADS) == before
    wrong = Request('/__local/documents/preview', {}, origin='https://evil.invalid'); wrong.do_POST()
    assert wrong.status == 403
print('Pakbon local routes: own runtime/download, allowed packing only, finance/private routes and wrong origin/host blocked.')
