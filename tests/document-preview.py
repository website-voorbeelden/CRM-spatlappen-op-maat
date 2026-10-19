"""Render retained fictional PDF bytes; never reads a CRM dossier."""
import base64
import hashlib
import importlib.util
import tempfile
from pathlib import Path
from unittest.mock import patch
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('generator', ROOT / 'document-generator.py')
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)
fixture = ROOT / 'tests/fixtures/document-preview-two-pages.pdf'
data = fixture.read_bytes()
before = hashlib.sha256(data).hexdigest()
payload = {'data': base64.b64encode(data).decode(), 'page': 1}
qa = ROOT.parents[1] / 'work/document-preview'
qa.mkdir(parents=True, exist_ok=True)
created = []
original = tempfile.TemporaryDirectory
def directory(*args, **kwargs):
    item = original(*args, **kwargs)
    created.append(Path(item.name))
    return item
with patch.object(generator.tempfile, 'TemporaryDirectory', directory):
    for page in [1, 2]:
        result = generator.preview_pdf(dict(payload, page=page))
        assert result['page'] == page and result['pages'] == 2 and 'downloads' not in result
        image = base64.b64decode(result['image'])
        assert image.startswith(b'\x89PNG\r\n\x1a\n')
        (qa / f'page-{page}.png').write_bytes(image)
    for invalid in [{'page': 0}, {'page': 3}, {'page': 201}, {'page': True}, {'data': base64.b64encode(b'<html>bad</html>').decode()}, {'data': 'not base64'}, {'data': base64.b64encode(b'%PDF-'+b'x'*10_000_000).decode()}, {'data': base64.b64encode(b'%PDF-broken').decode()}]:
        try:
            generator.preview_pdf(dict(payload, **invalid))
            raise AssertionError('Invalid PDF/page accepted')
        except ValueError:
            pass
assert all(not p.exists() for p in created)
assert hashlib.sha256(fixture.read_bytes()).hexdigest() == before
print('Saved PDF preview: real pages 1/2, PNG output, exact unchanged fixture, size/type/page validation and temporary file cleanup passed.')
