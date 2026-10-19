"""Local CRM server. Private import files never enter the public website tree."""
import json
import os
import base64
import secrets
import time
import subprocess
import threading
import http.client
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote, quote, parse_qs
from tikkie_local import create_request, saved_requests, check_payments, journal, LOCK as TIKKIE_LOCK, TikkieError

ROOT = Path(__file__).resolve().parent
COMPANY = os.environ.get('CRM_COMPANY_ID', 'spatlappen')
if COMPANY not in ('spatlappen','maatwerkkunststof'): raise ValueError('Onbekend bedrijf')
LOCAL_PORT = int(os.environ.get('CRM_PORT', '3010' if COMPANY == 'spatlappen' else '3011'))
CLOUD_PORT = int(os.environ.get('CRM_CLOUD_PORT', '8788' if COMPANY == 'spatlappen' else '8789'))
LOCAL_ORIGINS = (f'http://localhost:{LOCAL_PORT}', f'http://127.0.0.1:{LOCAL_PORT}')
PRIVATE = ROOT / '.local' if COMPANY == 'spatlappen' else ROOT / '.local' / COMPANY
DOCUMENT_LOCK = threading.Lock()
DOWNLOAD_LOCK = threading.Lock()
DOWNLOADS = {}


def cache_download(body, name, content_type):
    if not isinstance(name, str) or not name or len(name) > 200 or any(c in name for c in '\r\n/\\'):
        raise ValueError('Ongeldige bestandsnaam.')
    if len(body) > 32_000_000:
        raise ValueError('Het bestand is te groot om lokaal te downloaden.')
    token = secrets.token_urlsafe(24)
    with DOWNLOAD_LOCK:
        now = time.time()
        for old in list(DOWNLOADS):
            if DOWNLOADS[old]['expires'] < now:
                del DOWNLOADS[old]
        while DOWNLOADS and sum(len(file['body']) for file in DOWNLOADS.values()) + len(body) > 100_000_000:
            del DOWNLOADS[next(iter(DOWNLOADS))]
        DOWNLOADS[token] = {'body': body, 'name': name, 'type': content_type, 'expires': now + 3600}
    return '/__local/downloads/' + token


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # During local development every reload must receive the current CRM code.
        path = urlsplit(self.path).path
        if path.startswith('/admin') or path in ('/spatlap-preview.html', '/number-inputs.js'):
            self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def proxy_cloud(self):
        # Same localhost origin keeps the existing browser data available for an
        # explicit migration. This proxy only connects to the loopback emulator.
        origin = self.headers.get('Origin')
        if origin and origin not in LOCAL_ORIGINS:
            self.send_error(403)
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 <= length <= 32_000_000:
                self.send_error(413)
                return
            connection = http.client.HTTPConnection('127.0.0.1', CLOUD_PORT, timeout=120)
            headers = {key: value for key, value in self.headers.items()
                       if key.lower() not in ('host', 'origin', 'connection', 'content-length')}
            headers['Origin'] = f'http://127.0.0.1:{CLOUD_PORT}'
            body = self.rfile.read(length) if length else None
            connection.request(self.command, self.path, body=body, headers=headers)
            response = connection.getresponse()
            data = response.read()
            self.send_response(response.status)
            for key, value in response.getheaders():
                if key.lower() not in ('content-length', 'connection', 'transfer-encoding'):
                    self.send_header(key, value)
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            connection.close()
        except (OSError, ValueError, http.client.HTTPException):
            data = json.dumps({'error': 'Start de lokale Cloudflare-server met npm run dev:cloud. Je browsergegevens blijven behouden.'}).encode()
            self.send_response(503)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)

    def proxy_assistant(self):
        allowed = {'feedback-list': 'GET', 'feedback-create': 'POST', 'feedback-import': 'POST', 'feedback-status': 'POST', 'status': 'GET', 'models': 'GET', 'login': 'POST', 'cancel': 'POST', 'select': 'POST', 'logout': 'POST', 'chat': 'POST', 'stop': 'POST', 'gmail-actions-capabilities': 'GET', 'gmail-actions-list': 'GET', 'gmail-actions-propose': 'POST', 'gmail-actions-review': 'POST', 'gmail-actions-confirm': 'POST', 'gmail-actions-cancel': 'POST', 'gmail-status': 'GET', 'gmail-configure': 'POST', 'gmail-login': 'POST', 'gmail-disconnect': 'POST', 'gmail-list': 'POST', 'gmail-message': 'POST', 'gmail-thread': 'POST', 'gmail-attachment': 'POST', 'mail-status': 'GET', 'mail-journal': 'GET', 'mail-configure': 'POST', 'mail-send': 'POST', 'speech-status': 'GET', 'speech-diagnostics': 'GET', 'speech-report': 'POST', 'transcribe': 'POST'}
        endpoint = urlsplit(self.path).path.removeprefix('/__local/assistant/')
        if allowed.get(endpoint) != self.command:
            self.send_error(404)
            return
        if self.command == 'POST' and self.headers.get('Origin') not in LOCAL_ORIGINS:
            self.send_error(403)
            return
        token = os.environ.get('CRM_ASSISTANT_KEY', '')
        if not token:
            body = json.dumps({'error': 'Start de CRM-versies opnieuw via Start beide CRM’s om de assistent te activeren.'}).encode()
            self.send_response(503)
        else:
            try:
                length = int(self.headers.get('Content-Length', '0'))
                if not 0 <= length <= (15_000_000 if endpoint == 'mail-send' else 4_000_000):
                    raise ValueError('Request size')
                if self.command == 'POST' and not self.headers.get('Content-Type', '').startswith('application/json'):
                    self.send_error(415)
                    return
                headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json',
                           'X-CRM-Company': COMPANY, 'X-CRM-Origin': f'http://localhost:{LOCAL_PORT}/'}
                conn = http.client.HTTPConnection('127.0.0.1', int(os.environ.get('CRM_ASSISTANT_PORT', '3030')), timeout=500)
                conn.request(self.command, '/' + endpoint, body=self.rfile.read(length) if length else None, headers=headers)
                response = conn.getresponse()
                body = response.read(8_000_001)
                if len(body) > 8_000_000:
                    raise ValueError('Response size')
                self.send_response(response.status)
                conn.close()
            except (OSError, ValueError, http.client.HTTPException):
                body = json.dumps({'error': 'De lokale assistentdienst reageert niet. Start beide CRM-versies opnieuw.'}).encode()
                self.send_response(503)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.headers.get('Host') not in tuple(url.removeprefix('http://') for url in LOCAL_ORIGINS):
            self.send_error(403)
            return
        path = urlsplit(self.path).path
        if path.startswith('/__local/assistant/'):
            self.proxy_assistant()
            return
        if path.startswith('/api/crm/'):
            self.proxy_cloud()
            return
        if COMPANY!='spatlappen' and path.startswith('/__local/') and path not in ('/__local/documents/render', '/__local/documents/preview', '/__local/downloads'):
            self.send_error(503, 'Eigen document- en betaalconfiguratie nog niet ingesteld')
            return
        if path not in ('/__local/documents/render', '/__local/documents/preview', '/__local/downloads', '/__local/tikkie/create', '/__local/tikkie/check'):
            self.send_error(404)
            return
        if self.headers.get('Origin') not in LOCAL_ORIGINS:
            self.send_error(403)
            return
        if not self.headers.get('Content-Type', '').startswith('application/json'):
            self.send_error(415)
            return
        status = 200
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= (44_000_000 if path == '/__local/downloads' else 16_000_000 if path == '/__local/documents/preview' else 1_000_000):
                raise ValueError('Het documentverzoek is te groot of leeg.')
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise ValueError('Controleer de documentgegevens.')
            # Only the company's own packing slip is configured yet. Do not
            # fall back to Spatlappen invoices, payment services or credentials.
            if COMPANY != 'spatlappen' and path == '/__local/documents/render' and payload.get('kind') != 'packing':
                self.send_error(503, 'Eigen documentconfiguratie nog niet ingesteld')
                return
            if path == '/__local/tikkie/create':
                response = create_request(payload)
            elif path == '/__local/tikkie/check':
                response = check_payments(payload)
            elif path == '/__local/downloads':
                name = payload['name']
                url = cache_download(base64.b64decode(payload['data'], validate=True), name, self.guess_type(name))
                response = {'url': url}
            else:
                runtime = json.loads((PRIVATE / 'document-runtime.json').read_text())
                with DOCUMENT_LOCK:
                    result = subprocess.run([runtime['python'], str(ROOT / 'document-generator.py')] + (['--preview'] if path == '/__local/documents/preview' else []),
                                            input=json.dumps(payload), text=True, capture_output=True, timeout=60,
                                            env={**os.environ, 'CRM_DOCUMENT_RUNTIME': str(PRIVATE / 'document-runtime.json')})
                response = json.loads(result.stdout)
                if result.returncode or response.get('error'):
                    status = 400
                elif path != '/__local/documents/preview':
                    number = payload['number']
                    response['downloads'] = {fmt: cache_download(base64.b64decode(response[fmt]),
                        response.get('filename', 'Orderbevestiging_' + number) + '.' + fmt, content_type)
                        for fmt, content_type in [('pdf', 'application/pdf'), ('docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')] if fmt in response}
        except TikkieError as error:
            status, response = error.status, {'error': str(error)}
        except (ValueError, KeyError, TypeError):
            status, response = 400, {'error': 'Controleer de documentgegevens.'}
        except (OSError, subprocess.TimeoutExpired):
            status, response = 503, {'error': 'De lokale documentgenerator is niet beschikbaar. Start de CRM-server opnieuw.'}
        body = json.dumps(response).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.headers.get('Host') not in tuple(url.removeprefix('http://') for url in LOCAL_ORIGINS):
            self.send_error(403)
            return
        path = unquote(urlsplit(self.path).path)
        if path.startswith('/__local/assistant/'):
            self.proxy_assistant()
            return
        if COMPANY == 'maatwerkkunststof' and path.startswith('/spatlap-preview') or COMPANY == 'spatlappen' and path.startswith('/tools/costing/'):
            self.send_error(404)
            return
        if path == '/crm-runtime.json':
            body = json.dumps({'mode':'local','localServices':COMPANY=='spatlappen','companyId':COMPANY,'release':'2.0.0'}).encode()
            self.send_response(200)
            self.send_header('Content-Type','application/json')
            self.send_header('Cache-Control','no-store')
            self.send_header('Content-Length',str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path.startswith('/api/crm/'):
            self.proxy_cloud()
            return
        if COMPANY!='spatlappen' and path.startswith('/__local/') and not path.startswith('/__local/downloads/'):
            self.send_error(503, 'Lokale services voor dit bedrijf zijn niet ingesteld')
            return
        if path in ('/__local/tikkie/requests', '/__local/tikkie/journal'):
            order_id = parse_qs(urlsplit(self.path).query).get('orderId', [''])[0]
            try:
                if path.endswith('/journal'):
                    with TIKKIE_LOCK:
                        body = json.dumps(journal()).encode()
                else:
                    body = json.dumps(saved_requests(order_id)).encode()
            except (OSError, ValueError):
                self.send_error(503)
                return
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path.startswith('/__local/downloads/'):
            token = path.removeprefix('/__local/downloads/')
            with DOWNLOAD_LOCK:
                file = DOWNLOADS.get(token)
                if file and file['expires'] < time.time():
                    del DOWNLOADS[token]
                    file = None
            if not file:
                self.send_error(404, 'Download verlopen. Maak het voorbeeld opnieuw.')
                return
            self.send_response(200)
            self.send_header('Content-Type', file['type'])
            fallback = ''.join(c if 32 <= ord(c) < 127 and c not in '"\\' else '_' for c in file['name'])
            self.send_header('Content-Disposition', 'attachment; filename="' + fallback + '"; filename*=UTF-8\'\'' + quote(file['name']))
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(file['body'])))
            self.end_headers()
            self.wfile.write(file['body'])
            return
        if path == '/__local/imports':
            manifest = PRIVATE / 'imports.json'
            body = manifest.read_bytes() if manifest.exists() else b'{"version":1,"orders":[]}'
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path.startswith('/__local/files/'):
            name = path.removeprefix('/__local/files/')
            if not name or Path(name).name != name:
                self.send_error(404)
                return
            target = PRIVATE / 'files' / name
            if not target.is_file():
                self.send_error(404)
                return
            body = target.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', self.guess_type(str(target)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        target = Path(self.translate_path(self.path)).resolve()
        private_roots = [ROOT / '.local', ROOT / '.git', ROOT / '.github', ROOT / 'assistant', PRIVATE, ROOT / '.wrangler', ROOT / 'node_modules', ROOT / 'cloudflare', ROOT / 'functions', ROOT / 'migrations', ROOT / 'tests']
        if any(target == root or root in target.parents for root in private_roots) or path.startswith(('/__local/', '/.dev.vars', '/.env')):
            self.send_error(404)
            return
        super().do_GET()


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', LOCAL_PORT), partial(Handler, directory=str(ROOT)))
    print(f'{COMPANY}: http://localhost:{LOCAL_PORT}/admin/', flush=True)
    server.serve_forever()
