"""Local CRM server. Private import files never enter the public website tree."""
import json
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
PRIVATE = ROOT / '.local'
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
        if origin and origin not in ('http://localhost:3000', 'http://127.0.0.1:3000'):
            self.send_error(403)
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 <= length <= 32_000_000:
                self.send_error(413)
                return
            connection = http.client.HTTPConnection('127.0.0.1', 8788, timeout=120)
            headers = {key: value for key, value in self.headers.items()
                       if key.lower() not in ('host', 'origin', 'connection', 'content-length')}
            headers['Origin'] = 'http://127.0.0.1:8788'
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

    def do_POST(self):
        path = urlsplit(self.path).path
        if path.startswith('/api/crm/'):
            self.proxy_cloud()
            return
        if path not in ('/__local/documents/render', '/__local/downloads', '/__local/tikkie/create', '/__local/tikkie/check'):
            self.send_error(404)
            return
        if self.headers.get('Origin') not in ('http://localhost:3000', 'http://127.0.0.1:3000'):
            self.send_error(403)
            return
        if not self.headers.get('Content-Type', '').startswith('application/json'):
            self.send_error(415)
            return
        status = 200
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= (44_000_000 if path == '/__local/downloads' else 1_000_000):
                raise ValueError('Het documentverzoek is te groot of leeg.')
            payload = json.loads(self.rfile.read(length))
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
                    result = subprocess.run([runtime['python'], str(ROOT / 'document-generator.py')],
                                            input=json.dumps(payload), text=True, capture_output=True, timeout=60)
                response = json.loads(result.stdout)
                if result.returncode or response.get('error'):
                    status = 400
                else:
                    number = payload['number']
                    response['downloads'] = {fmt: cache_download(base64.b64decode(response[fmt]),
                        response.get('filename', 'Orderbevestiging_' + number) + '.' + fmt, content_type)
                        for fmt, content_type in [('pdf', 'application/pdf'), ('docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')]}
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
        path = unquote(urlsplit(self.path).path)
        if path.startswith('/api/crm/'):
            self.proxy_cloud()
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
        private_roots = [PRIVATE, ROOT / '.wrangler', ROOT / 'node_modules', ROOT / 'cloudflare', ROOT / 'functions', ROOT / 'migrations', ROOT / 'tests']
        if any(target == root or root in target.parents for root in private_roots) or path.startswith(('/__local/', '/.dev.vars', '/.env')):
            self.send_error(404)
            return
        super().do_GET()


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 3000), partial(Handler, directory=str(ROOT)))
    print('CRM: http://localhost:3000/admin/', flush=True)
    server.serve_forever()
