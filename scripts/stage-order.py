"""Prepare an order and PDFs for local import, without browser form automation."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('order_json', type=Path)
parser.add_argument('--document', nargs=2, action='append', default=[], metavar=('CATEGORY', 'PATH'))
args = parser.parse_args()
data = json.loads(args.order_json.read_text())
if data.get('format') not in ('spatlappen-crm-order', 'spatlappen-crm-purchase-invoice') or data.get('version') != 1:
    parser.error('Expected a supported CRM import version 1 file')
if data['format'] == 'spatlappen-crm-purchase-invoice':
    source = data['invoice']['reference'].strip()
    identity = 'purchase-invoice\n' + data['purchaseId'] + '\n' + source
else:
    source = data['order']['sourceNumber'].strip()
    identity = data['customer']['company'].lower() + '\n' + source
if not source:
    parser.error('An original document number is required to prevent duplicates')
key = hashlib.sha256(identity.encode()).hexdigest()[:24]
private = Path(__file__).resolve().parents[1] / '.local'
(private / 'files').mkdir(parents=True, exist_ok=True)
documents = []
for category, name in args.document:
    if category not in ('confirmation', 'invoice', 'other'):
        parser.error('Unknown document category')
    original = Path(name).resolve(strict=True)
    digest = hashlib.sha256(original.read_bytes()).hexdigest()[:24]
    filename = digest + original.suffix.lower()
    shutil.copyfile(original, private / 'files' / filename)
    documents.append({'name': original.name, 'category': category, 'file': filename})
manifest = private / 'imports.json'
queue = json.loads(manifest.read_text()) if manifest.exists() else {'version': 1, 'orders': []}
entry = {'key': key, 'data': data, 'documents': documents}
queue['orders'] = [row for row in queue['orders'] if row['key'] != key] + [entry]
temporary = manifest.with_suffix('.tmp')
temporary.write_text(json.dumps(queue, ensure_ascii=False, indent=2))
temporary.replace(manifest)
print('Local import prepared:', source)
