"""Stateless, authenticated Word/PDF service. No CRM database or Tikkie keys."""
import base64
import hashlib
import hmac
import importlib.util
import json
import mimetypes
import os
import secrets
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('document_generator', ROOT / 'document-generator.py')
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)
RENDER_LOCK = threading.Lock()
CACHE_LOCK = threading.Lock()
DOWNLOADS = {}
TOKEN = os.environ.get('CRM_DOCUMENT_SERVICE_TOKEN', '')
MAAT_TOKEN = os.environ.get('CRM_DOCUMENT_MAATWERKKUNSTSTOF_TOKEN', '')
if not MAAT_TOKEN and generator.COMPANY == 'spatlappen' and len(TOKEN) >= 32:
    # Give the second CRM its own credential without a second operator-managed
    # Render secret. A versioned context separates it from the root credential.
    MAAT_TOKEN = hmac.new(TOKEN.encode('utf-8'), b'crm-document-service:maatwerkkunststof:v1', hashlib.sha256).hexdigest()


def token_companies():
    tokens = [(generator.COMPANY, TOKEN)]
    if len(MAAT_TOKEN) >= 32:
        if generator.COMPANY != 'spatlappen' or hmac.compare_digest(TOKEN, MAAT_TOKEN):
            raise ValueError('Gebruik een eigen documenttoken per bedrijf.')
        tokens.append(('maatwerkkunststof', MAAT_TOKEN))
    return tokens


def cache_download(body, name, content_type, company_id):
    token = secrets.token_urlsafe(24)
    with CACHE_LOCK:
        now = time.time()
        for old in list(DOWNLOADS):
            if DOWNLOADS[old]['expires'] < now:
                del DOWNLOADS[old]
        while DOWNLOADS and sum(len(f['body']) for f in DOWNLOADS.values()) + len(body) > 64_000_000:
            del DOWNLOADS[next(iter(DOWNLOADS))]
        if len(body) > 32_000_000:
            raise ValueError('Het document is te groot.')
        DOWNLOADS[token] = {'body': body, 'name': name, 'type': content_type, 'expires': now + 3600, 'companyId': company_id}
    return '/__local/downloads/' + token


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        # Do not log request bodies, bearer tokens or private download URLs.
        pass

    def send_bytes(self, status, body, content_type, filename=None):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        if filename:
            fallback = ''.join(c if 32 <= ord(c) < 127 and c not in '"\\' else '_' for c in filename)
            self.send_header('Content-Disposition', 'attachment; filename="' + fallback + '"; filename*=UTF-8\'\'' + quote(filename))
        self.end_headers()
        self.wfile.write(body)

    def json(self, status, data):
        self.send_bytes(status, json.dumps(data).encode(), 'application/json; charset=utf-8')

    def authorized(self):
        supplied = self.headers.get('Authorization', '').encode()
        self.company_id = None
        for company_id, token in token_companies():
            if len(token) >= 32 and hmac.compare_digest(supplied, ('Bearer ' + token).encode()):
                self.company_id = company_id
        if self.company_id is not None:
            return True
        self.json(401, {'error': 'Geen toegang tot de documentservice.'})
        return False

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/health':
            self.json(200 if len(TOKEN) >= 32 else 503, {'ready': len(TOKEN) >= 32})
            return
        if not self.authorized():
            return
        if path.startswith('/downloads/'):
            with CACHE_LOCK:
                file = DOWNLOADS.get(path.removeprefix('/downloads/'))
                if file and file['expires'] < time.time():
                    del DOWNLOADS[path.removeprefix('/downloads/')]
                    file = None
            if file and file.get('companyId') == self.company_id:
                self.send_bytes(200, file['body'], file['type'], file['name'])
            else:
                self.json(404, {'error': 'Dit voorbeeld is verlopen. Maak een nieuw voorbeeld. Opgeslagen documenten staan bij Documenten in het CRM.'})
            return
        self.json(404, {'error': 'Onbekend verzoek.'})

    def do_POST(self):
        if not self.authorized():
            return
        preview = urlsplit(self.path).path == '/preview'
        if urlsplit(self.path).path not in ('/render', '/preview'):
            self.json(404, {'error': 'Onbekend verzoek.'})
            return
        if not self.headers.get('Content-Type', '').startswith('application/json'):
            self.json(415, {'error': 'JSON verwacht.'})
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= (16_000_000 if preview else 1_000_000):
                self.json(413, {'error': 'Het documentverzoek is te groot of leeg.'})
                return
            self.connection.settimeout(30)
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise ValueError('Controleer de documentgegevens.')
            if not RENDER_LOCK.acquire(timeout=5):
                self.json(503, {'error': 'De omzetter maakt al een document. Probeer zo opnieuw.'})
                return
            try:
                # The authenticated backend token selects the company. Ignore
                # any company claimed by an untrusted browser document payload.
                result = generator.preview_pdf(payload) if preview else generator.render(payload, self.company_id)
                if not preview and not payload.get('templateRequest'):
                    result['downloads'] = {fmt: cache_download(base64.b64decode(result[fmt], validate=True),
                        result['filename'] + '.' + fmt, mimetypes.guess_type('document.' + fmt)[0] or 'application/octet-stream', self.company_id)
                        for fmt in ('pdf', 'docx') if fmt in result}
            finally:
                RENDER_LOCK.release()
            self.json(200, result)
        except (ValueError, KeyError, TypeError) as error:
            self.json(400, {'error': str(error) if isinstance(error, ValueError) else 'Controleer de documentgegevens.'})
        except Exception:
            self.json(503, {'error': 'Word/PDF maken lukt niet. Probeer opnieuw.'})


if __name__ == '__main__':
    if len(TOKEN) < 32:
        raise SystemExit('Stel CRM_DOCUMENT_SERVICE_TOKEN in voordat je de service start.')
    token_companies()
    ThreadingHTTPServer(('0.0.0.0', int(os.environ.get('PORT', '10000'))), Handler).serve_forever()
