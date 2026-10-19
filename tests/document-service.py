"""Exercise the HTTP handler and real local converter, without opening a browser/socket."""
import base64
import importlib.util
import io
import json
import os
import secrets
from pathlib import Path
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]
os.environ['CRM_DOCUMENT_SERVICE_TOKEN'] = secrets.token_hex(32)
spec = importlib.util.spec_from_file_location('service', ROOT / 'document-service/server.py')
service = importlib.util.module_from_spec(spec)
spec.loader.exec_module(service)


class Request(service.Handler):
    def __init__(self, path, payload=None, authorized=True):
        self.path = path
        data = json.dumps(payload).encode() if payload is not None else b''
        self.headers = {'Content-Type': 'application/json', 'Content-Length': str(len(data))}
        if authorized:
            self.headers['Authorization'] = 'Bearer ' + service.TOKEN
        self.rfile, self.wfile = io.BytesIO(data), io.BytesIO()
        self.connection = SimpleNamespace(settimeout=lambda _: None)
        self.status, self.response_headers = None, {}

    def send_response(self, status):
        self.status = status

    def send_header(self, name, value):
        self.response_headers[name] = value

    def end_headers(self):
        pass


blocked = Request('/render', {}, authorized=False)
blocked.do_POST()
assert blocked.status == 401
health = Request('/health', authorized=False)
health.do_GET()
assert health.status == 200
payload = {'kind': 'invoice', 'number': 'F-2026-3452', 'preview': True,
           'fields': {'document_date': '10-10-2026', 'billing_company': 'Synthetic example BV',
                      'billing_street': 'Example 1', 'billing_postal_city': '1234 AB Example',
                      'billing_country': 'Nederland'},
           'items': [{'description': 'Synthetic product', 'details': ['Afmeting: 100 × 20 cm'], 'quantity': 1, 'price': 10000}],
           'shippingCharge': 0, 'vat': 21, 'paidAmount': 0}
render = Request('/render', payload)
render.do_POST()
assert render.status == 200, render.wfile.getvalue()
result = json.loads(render.wfile.getvalue())
assert base64.b64decode(result['pdf']).startswith(b'%PDF')
assert base64.b64decode(result['docx']).startswith(b'PK')
assert result['pages'] == 1 and len(result['previews']) == 1
for fmt in ['pdf', 'docx']:
    path = result['downloads'][fmt].replace('/__local', '')
    download = Request(path)
    download.do_GET()
    assert download.status == 200
    assert download.wfile.getvalue() == base64.b64decode(result[fmt])
    assert 'attachment;' in download.response_headers['Content-Disposition']
    unauthorized = Request(path, authorized=False)
    unauthorized.do_GET()
    assert unauthorized.status == 401
    service.DOWNLOADS[path.removeprefix('/downloads/')]['expires'] = 0
    expired = Request(path)
    expired.do_GET()
    assert expired.status == 404
bad = Request('/render', {})
bad.do_POST()
assert bad.status == 400
pdf_data = base64.b64encode((ROOT / 'tests/fixtures/document-preview-two-pages.pdf').read_bytes()).decode()
blocked = Request('/preview', {'data': pdf_data, 'page': 1}, authorized=False)
blocked.do_POST()
assert blocked.status == 401
before = len(service.DOWNLOADS)
preview = Request('/preview', {'data': pdf_data, 'page': 2})
preview.do_POST()
result = json.loads(preview.wfile.getvalue())
assert preview.status == 200 and result['page'] == 2 and result['pages'] == 2
assert 'downloads' not in result and len(service.DOWNLOADS) == before
assert base64.b64decode(result['image']).startswith(b'\x89PNG\r\n\x1a\n')
print('Document service: real Word/PDF + preview, authenticated downloads, expired cache and invalid input passed. Local runtime; Docker/Render not deployed.')
