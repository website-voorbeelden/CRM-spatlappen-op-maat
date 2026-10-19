"""Template structure/privacy checks with fictitious data; no CRM writes."""
import copy
import importlib.util
import tempfile
from pathlib import Path
from zipfile import ZipFile
from lxml import etree

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('generator', ROOT / 'document-generator.py')
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)
NS = {'w': generator.W}
payload = {'kind': 'packing', 'number': 'PB-2026-3452', 'fields': {
    'document_date': '2026-10-13', 'delivery_date': '', 'shipping_company': 'Synthetic BV',
    'shipping_attention': '', 'shipping_street': 'Example 1', 'shipping_postal_city': '1234 AB Example',
    'shipping_country': 'Nederland', 'customer_reference': 'Client ref', 'order_number': '3001', 'delivery_notes': ''},
    'items': [{'description': 'Synthetic product', 'details': ['Afmeting: 200 × 100 mm'], 'quantity': 4,
               'deliveredQuantity': 3, 'price': None, 'cost': 'PRIVATE_COST', 'notes': 'PRIVATE_NOTE'}],
    'shippingCharge': None, 'vat': 'INVALID_IGNORED', 'paidAmount': 'PRIVATE_PAYMENT'}

with tempfile.TemporaryDirectory(prefix='packing-test-') as directory:
    target = Path(directory) / 'packing.docx'
    for company in ['spatlappen', 'maatwerkkunststof']:
        generator.TEMPLATE_ROOT = ROOT / '.local/templates' / ('maatwerkkunststof' if company == 'maatwerkkunststof' else '')
        template = generator.TEMPLATE_ROOT / 'packing-slip.docx'
        generator.build(copy.deepcopy(payload), target)
        with ZipFile(template) as source, ZipFile(target) as output:
            doc = etree.fromstring(output.read('word/document.xml'))
            text = '|'.join(doc.xpath('//w:t/text()', namespaces=NS))
            assert 'PB-2026-3452' in text and '13-10-2026' in text and '3001' in text
            assert '{{' not in text and 'PRIVATE_' not in text and '€' not in text
            assert 'Leverdatum' not in text and 'Opmerkingen:' not in text
            cells = doc.findall('w:body/w:tbl', NS)[2].findall('w:tr', NS)[1].findall('w:tc', NS)
            assert ''.join(cells[2].xpath('.//w:t/text()', namespaces=NS)) == '4'
            assert ''.join(cells[3].xpath('.//w:t/text()', namespaces=NS)) == '3'
            assert doc.find('w:body/w:tbl[3]/w:tr/w:trPr/w:tblHeader', NS) is not None
            for part in source.namelist():
                if part != 'word/document.xml':
                    assert source.read(part) == output.read(part), part
            all_visible = text + ''.join(etree.fromstring(output.read('word/footer1.xml')).xpath('//w:t/text()', namespaces=NS))
            media = [part for part in output.namelist() if part.startswith('word/media/')]
            if company == 'maatwerkkunststof':
                assert not media and not doc.findall('.//w:drawing', NS)
                assert 'Maatwerkkunststof.nl' in all_visible and 'spatlappenopmaat' not in all_visible.lower()
                assert '93627149' not in all_visible and 'NL866472411B01' not in all_visible
            else:
                assert media and doc.findall('.//w:drawing', NS)
        for value in [-1, 5, 1.5, True, None]:
            invalid = copy.deepcopy(payload)
            invalid['items'][0]['deliveredQuantity'] = value
            try:
                generator.build(invalid, target)
                raise AssertionError('Invalid delivered quantity accepted')
            except ValueError:
                pass
    invalid = copy.deepcopy(payload)
    invalid['items'][0]['deliveredQuantity'] = 0
    try:
        generator.build(invalid, target)
        raise AssertionError('Empty delivery accepted')
    except ValueError:
        pass
print('Pakbon Word: company template/logo separation, retained package parts, quantity/date validation, no money/private fields, blank optionals and repeating table headers passed.')
