"""Fill the retained Word template; run with the configured document runtime."""
import base64
import binascii
import copy
import json
import io
from collections import Counter
import os
import re
import subprocess
import sys
import tempfile
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from zipfile import ZipFile, BadZipFile
from lxml import etree

ROOT = Path(__file__).resolve().parent
COMPANY = os.environ.get('CRM_COMPANY_ID', 'spatlappen')
if COMPANY not in ('spatlappen','maatwerkkunststof'): raise ValueError('Onbekend bedrijf')
def company_templates(company_id=COMPANY):
    if company_id not in ('spatlappen', 'maatwerkkunststof'):
        raise ValueError('Onbekend bedrijf')
    # Hosted conversion uses versioned templates. Retain the existing local
    # Spatlappen template path so private template customizations stay intact.
    configured = os.environ.get('CRM_DOCUMENT_TEMPLATES')
    if configured:
        base = Path(configured)
        return base if company_id == 'spatlappen' else base / company_id
    return ROOT / '.local/templates' if company_id == 'spatlappen' else ROOT / 'document-service/templates' / company_id

TEMPLATE_ROOT = company_templates()
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS = {'w': W}
TAG = lambda name: '{' + W + '}' + name
DOCUMENT_TYPES = {
    'confirmation': {'title': 'Orderbevestiging', 'prefix': 'OB', 'label': 'OB-nummer', 'file': 'Orderbevestiging'},
    'quote': {'title': 'Offerte', 'prefix': 'OF', 'label': 'Offertenummer', 'file': 'Offerte'},
    'proforma': {'title': 'Proforma factuur', 'prefix': 'PF', 'label': 'Proformanummer', 'file': 'Proforma_factuur'},
    'invoice': {'title': 'Factuur', 'prefix': 'F', 'label': 'Factuurnummer', 'file': 'Factuur'},
    'packing': {'title': 'Pakbon', 'prefix': 'PB', 'label': 'Pakbonnummer', 'file': 'Pakbon'},
}


def money(value):
    whole, fraction = f'{value / 100:,.2f}'.split('.')
    return '€ ' + whole.replace(',', '.') + ',' + fraction


def amount(value):
    if isinstance(value, bool) or not isinstance(value, int) or not 0 <= value <= 100_000_000:
        raise ValueError('Controleer de verkoopbedragen in de order.')
    return value


def text(value):
    if not isinstance(value, str) or len(value) > 500 or any(ord(c) < 32 and c not in '\n\t' for c in value):
        raise ValueError('Controleer de documenttekst; maximaal 500 tekens per veld.')
    return value.strip()


def paragraph_properties(paragraph):
    properties = paragraph.find('w:pPr', NS)
    if properties is None:
        properties = etree.Element(TAG('pPr'))
        paragraph.insert(0, properties)
    return properties


def grow_row(row):
    height = row.find('w:trPr/w:trHeight', NS)
    if height is not None:
        height.set(TAG('hRule'), 'atLeast')
    # Allow wrapping without the inherited spacing hidden by fixed-height rows.
    for paragraph in row.findall('.//w:p', NS):
        properties = paragraph_properties(paragraph)
        spacing = properties.find('w:spacing', NS)
        if spacing is None:
            spacing = etree.SubElement(properties, TAG('spacing'))
        for key, value in [('before', '0'), ('after', '0'), ('line', '200'), ('lineRule', 'exact')]:
            spacing.set(TAG(key), value)


def keep_row_with_next(row):
    for paragraph in row.findall('.//w:p', NS):
        properties = paragraph_properties(paragraph)
        if properties.find('w:keepNext', NS) is None:
            etree.SubElement(properties, TAG('keepNext'))


def table_with_rows(original, rows):
    table = copy.deepcopy(original)
    for row in table.findall('w:tr', NS):
        table.remove(row)
    for row in rows:
        table.append(copy.deepcopy(row))
    return table


def table_separator():
    # Word merges adjacent tables without a separating paragraph.
    paragraph = etree.Element(TAG('p'))
    properties = etree.SubElement(paragraph, TAG('pPr'))
    etree.SubElement(properties, TAG('spacing'), {TAG('before'): '0', TAG('after'): '0',
                                                 TAG('line'): '1', TAG('lineRule'): 'exact'})
    etree.SubElement(properties, TAG('keepNext'))
    run = etree.SubElement(paragraph, TAG('r'))
    style = etree.SubElement(run, TAG('rPr'))
    etree.SubElement(style, TAG('sz'), {TAG('val'): '2'})
    return paragraph


def move_top_border(source, target):
    separator = source.find('.//w:tcBorders/w:top', NS)
    if separator is None:
        return
    for cell in target.findall('w:tc', NS):
        properties = cell.find('w:tcPr', NS)
        if properties is None:
            properties = etree.Element(TAG('tcPr'))
            cell.insert(0, properties)
        borders = properties.find('w:tcBorders', NS)
        if borders is None:
            borders = etree.SubElement(properties, TAG('tcBorders'))
        for border in borders.findall('w:top', NS):
            borders.remove(border)
        borders.insert(0, copy.deepcopy(separator))


def fill_table(table, slots):
    for control in table.findall('.//w:sdt', NS):
        tag = control.find('w:sdtPr/w:tag', NS)
        if tag is None:
            continue
        key = tag.get(TAG('val'))
        if key not in slots:
            raise ValueError('Onbekende templatevariabele: ' + key)
        if key == 'page_number':
            # Real page fields also stay correct if longer custom text flows
            # onto an extra page. Preserve the template's original run style.
            content = control.find('w:sdtContent', NS)
            first_run = content.find('.//w:r', NS)
            style = first_run.find('w:rPr', NS) if first_run is not None else None
            for child in list(content):
                content.remove(child)
            for instruction, cached in [('PAGE', slots['_page']), (None, ' / '), ('NUMPAGES', slots['_pages'])]:
                parent = content if instruction is None else etree.SubElement(content, TAG('fldSimple'), {TAG('instr'): instruction})
                run = etree.SubElement(parent, TAG('r'))
                if style is not None:
                    run.append(copy.deepcopy(style))
                etree.SubElement(run, TAG('t'), {'{http://www.w3.org/XML/1998/namespace}space': 'preserve'}).text = str(cached)
            for marker in control.findall('.//w:showingPlcHdr', NS):
                marker.getparent().remove(marker)
            continue
        nodes = control.findall('.//w:sdtContent//w:t', NS)
        if not nodes:
            raise ValueError('Lege templatevariabele: ' + key)
        nodes[0].text = slots[key] or ('' if key in slots.get('_blank_slots', set()) else '-')
        nodes[0].set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        for node in nodes[1:]:
            node.text = ''
        # Keep the existing control and its original run styling intact.
        for marker in control.findall('.//w:showingPlcHdr', NS):
            marker.getparent().remove(marker)
    for node in table.findall('.//w:t', NS):
        if node.text == 'BTW 21%':
            node.text = 'BTW ' + slots['_vat_label'] + '%'


def fill_invoice_text(element, slots):
    # Word can split one placeholder across several styled runs. Replace only
    # its text, keeping the source paragraph/run properties and package parts.
    for paragraph in list(element.findall('.//w:p', NS)):
        nodes = paragraph.findall('.//w:t', NS)
        combined = ''.join(node.text or '' for node in nodes)
        matches = list(re.finditer(r'\{\{(\w+)\}\}', combined))
        ranges, offset = [], 0
        for node in nodes:
            end = offset + len(node.text or '')
            ranges.append((node, offset, end))
            offset = end
        for match in reversed(matches):
            key = match.group(1)
            if key not in slots:
                raise ValueError('Onbekende factuurvariabele: ' + key)
            touched = [(node, start, end) for node, start, end in ranges
                       if start < match.end() and end > match.start()]
            for index, (node, start, end) in enumerate(touched):
                prefix = (node.text or '')[:max(0, match.start() - start)] if index == 0 else ''
                suffix = (node.text or '')[match.end() - start:] if index == len(touched) - 1 else ''
                node.text = prefix + (str(slots[key]) if index == 0 else '') + suffix
                node.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        if matches and not ''.join(paragraph.xpath('.//w:t/text()', namespaces=NS)).strip():
            parent = paragraph.getparent()
            if parent.tag != TAG('tc') or len(parent.findall('w:p', NS)) > 1:
                parent.remove(paragraph)
                continue
        for node in list(paragraph.findall('.//w:t', NS)):
            if '\n' not in (node.text or ''):
                continue
            lines = node.text.split('\n')
            node.text = lines[0]
            parent, position = node.getparent(), node.getparent().index(node) + 1
            for line in lines[1:]:
                parent.insert(position, etree.Element(TAG('br')))
                extra = etree.Element(TAG('t'), {'{http://www.w3.org/XML/1998/namespace}space': 'preserve'})
                extra.text = line
                parent.insert(position + 1, extra)
                position += 2


def invoice_payment_stamp(paid, total):
    if paid is None:
        return 'BETAALSTATUS\nONBEKEND'
    if total == 0:
        return 'GEEN BEDRAG\nTE VOLDOEN'
    if paid >= total:
        return 'VOLDAAN'
    return 'AANBETALING\nVOLDAAN' if paid > 0 else 'NOG NIET\nVOLDAAN'


def prepare_payment_stamp(table):
    # Only the stamp cell changes. The existing frame/width and all other
    # invoice styling remain intact; a second line grows the cell naturally.
    for paragraph in table.findall('.//w:p', NS):
        if '{{payment_stamp}}' not in ''.join(paragraph.xpath('.//w:t/text()', namespaces=NS)):
            continue
        properties = paragraph_properties(paragraph)
        for name in ['spacing', 'jc']:
            for child in properties.findall('w:' + name, NS):
                properties.remove(child)
        etree.SubElement(properties, TAG('spacing'), {TAG('before'): '0', TAG('after'): '0',
                                                    TAG('line'): '240', TAG('lineRule'): 'auto'})
        etree.SubElement(properties, TAG('jc'), {TAG('val'): 'center'})
        cell = paragraph.xpath('ancestor::w:tc[1]', namespaces=NS)[0]
        cell_properties = cell.find('w:tcPr', NS)
        if cell_properties is not None:
            for child in cell_properties.findall('w:noWrap', NS):
                cell_properties.remove(child)
        row = cell.getparent()
        for height in row.findall('w:trPr/w:trHeight', NS):
            height.getparent().remove(height)
        for run in paragraph.findall('w:r', NS):
            style = run.find('w:rPr', NS)
            if style is None:
                style = etree.Element(TAG('rPr'))
                run.insert(0, style)
            for name in ['sz', 'szCs']:
                size = style.find('w:' + name, NS)
                if size is None:
                    size = etree.SubElement(style, TAG(name))
                size.set(TAG('val'), '24')  # 12 pt, including longer two-line stamps.


def build_invoice(payload, target, slots, items, package, template_root=TEMPLATE_ROOT):
    from datetime import date
    fields = payload.get('fields', {})
    for key in ['billing_attention', 'payment_method', 'date_label', 'transaction_date', 'invoice_note']:
        slots[key] = text(fields.get(key, ''))
    slots['customer_reference'] = slots['customer_reference'] or '-'
    if slots['transaction_date']:
        slots['transaction_date'] = date.fromisoformat(slots['transaction_date']).strftime('%d-%m-%Y')
    else:
        slots['date_label'] = ''
    paid = amount(payload['paidAmount']) if 'paidAmount' in payload else None
    total = slots['_grand_total']
    slots.update(invoice_number=payload['number'], invoice_date=slots['document_date'],
                 vat_rate=slots['vat_percentage'], payment_stamp=invoice_payment_stamp(paid, total))
    # Only an explicitly entered customer note is printed; accounting comments
    # about receipts, shortfalls or overpayments belong in the CRM.
    slots['payment_note'] = slots['invoice_note']
    with ZipFile(template_root / 'invoice.docx') as source:
        doc = etree.fromstring(source.read('word/document.xml'))
        body = doc.find('w:body', NS)
        tables = body.findall('w:tbl', NS)
        if len(tables) != 5:
            raise ValueError('De factuurtemplate heeft een onverwachte indeling.')
        if not slots['payment_method']:
            for paragraph in tables[1].findall('.//w:p', NS):
                if '{{payment_method}}' in ''.join(paragraph.xpath('.//w:t/text()', namespaces=NS)):
                    row = paragraph.xpath('ancestor::w:tr[1]', namespaces=NS)[0]
                    row.getparent().remove(row)
        articles = tables[2]
        heading, prototype = articles.findall('w:tr', NS)
        articles.remove(prototype)
        properties = heading.find('w:trPr', NS)
        if properties is None:
            properties = etree.Element(TAG('trPr'))
            heading.insert(0, properties)
        etree.SubElement(properties, TAG('tblHeader'))
        keep_row_with_next(heading)
        # Leave breathing room between the retained top rule and column titles.
        for cell in heading.findall('w:tc', NS):
            margins = cell.find('w:tcPr/w:tcMar', NS)
            top = margins.find('w:top', NS)
            top.set(TAG('w'), '160')
        for index, item in enumerate(items, 1):
            row = copy.deepcopy(prototype)
            row.find('w:tc', NS).find('.//w:t', NS).text = str(index)
            details = item['details']
            fill_invoice_text(row, dict(slots, item_description=item['description'],
                                       item_details=details[0] if details else '',
                                       item_notes='\n'.join(details[1:]), qty=str(item['quantity']),
                                       item_total='Inbegrepen' if package is not None else money(item['price'] * item['quantity'])))
            # The source row already grows naturally; retain its paragraph rhythm.
            articles.append(row)
        prepare_payment_stamp(tables[4])
        fill_invoice_text(body, slots)
        # Keep totals/payment together on the final page without repeating the
        # company and billing blocks when the article table spans several pages.
        closing = False
        for child in body:
            if child is tables[3]:
                closing = True
            if closing:
                for paragraph in child.findall('.//w:p', NS) if child.tag != TAG('p') else [child]:
                    properties = paragraph_properties(paragraph)
                    if properties.find('w:keepNext', NS) is None:
                        etree.SubElement(properties, TAG('keepNext'))
        paragraphs = body.findall('w:p', NS)
        if paragraphs:
            last_keep = paragraphs[-1].find('w:pPr/w:keepNext', NS)
            if last_keep is not None:
                last_keep.getparent().remove(last_keep)
        if '{{' in ''.join(doc.xpath('//w:t/text()', namespaces=NS)):
            raise ValueError('Er staan nog onverwerkte factuurvariabelen in de template.')
        settings = etree.fromstring(source.read('word/settings.xml'))
        update = settings.find('w:updateFields', NS)
        if update is None:
            update = etree.SubElement(settings, TAG('updateFields'))
        update.set(TAG('val'), 'true')
        changed = {'word/document.xml': doc, 'word/settings.xml': settings}
        with ZipFile(target, 'w') as output:
            for info in source.infolist():
                output.writestr(info, etree.tostring(changed[info.filename], xml_declaration=True, encoding='UTF-8', standalone=True)
                                if info.filename in changed else source.read(info.filename))


def build_packing_slip(payload, target, template_root=TEMPLATE_ROOT):
    from datetime import date
    fields = payload.get('fields', {})
    if not isinstance(fields, dict):
        raise ValueError('Controleer de pakbonvelden.')
    keys = ['shipping_company', 'shipping_attention', 'shipping_street', 'shipping_postal_city',
            'shipping_country', 'customer_reference', 'order_number', 'delivery_notes']
    slots = {key: text(fields.get(key, '')) for key in keys}
    if not slots['shipping_company'] or not slots['shipping_street'] or not slots['shipping_postal_city']:
        raise ValueError('Vul naam, straat en postcode/plaats van het afleveradres in.')
    slots['packing_slip_number'] = payload['number']
    try:
        slots['packing_slip_date'] = date.fromisoformat(text(fields.get('document_date', ''))).strftime('%d-%m-%Y')
        day = text(fields.get('delivery_date', ''))
        slots['delivery_date'] = date.fromisoformat(day).strftime('%d-%m-%Y') if day else ''
    except ValueError:
        raise ValueError('Controleer de pakbon- en leverdatum.')
    items = payload.get('items', [])
    if not isinstance(items, list) or not 1 <= len(items) <= 40:
        raise ValueError('Een pakbon heeft 1 tot 40 productregels nodig.')
    clean_items = []
    for item in items:
        if not isinstance(item, dict):
            raise ValueError('Controleer de productregels op de pakbon.')
        description = text(item.get('description', ''))
        quantity, delivered = item.get('quantity'), item.get('deliveredQuantity')
        if not description or len(description) > 200:
            raise ValueError('Gebruik een productomschrijving van maximaal 200 tekens.')
        if isinstance(quantity, bool) or not isinstance(quantity, int) or not 1 <= quantity <= 100_000:
            raise ValueError('Controleer de bestelde aantallen.')
        if isinstance(delivered, bool) or not isinstance(delivered, int) or not 0 <= delivered <= quantity:
            raise ValueError('Het geleverde aantal moet tussen 0 en het bestelde aantal liggen.')
        details = item.get('details', [])
        if not isinstance(details, list) or len(details) > 100:
            raise ValueError('Gebruik maximaal 100 tekstregels per artikel.')
        clean_items.append({'description': description, 'quantity': quantity, 'delivered': delivered,
                            'details': [value for raw in details if (value := text(raw))]})
    if not any(item['delivered'] for item in clean_items):
        raise ValueError('Vul bij minstens één product een geleverd aantal in.')
    with ZipFile(template_root / 'packing-slip.docx') as source:
        doc = etree.fromstring(source.read('word/document.xml'))
        body = doc.find('w:body', NS)
        tables = body.findall('w:tbl', NS)
        if len(tables) != 3 or len(tables[2].findall('w:tr', NS)) != 2:
            raise ValueError('De pakbontemplate heeft een onverwachte indeling.')
        if not slots['delivery_date']:
            for paragraph in list(tables[0].findall('.//w:p', NS)):
                if '{{delivery_date}}' in ''.join(paragraph.xpath('.//w:t/text()', namespaces=NS)):
                    paragraph.getparent().remove(paragraph)
        articles = tables[2]
        heading, prototype = articles.findall('w:tr', NS)
        articles.remove(prototype)
        properties = heading.find('w:trPr', NS)
        if properties is None:
            properties = etree.Element(TAG('trPr'))
            heading.insert(0, properties)
        if properties.find('w:tblHeader', NS) is None:
            etree.SubElement(properties, TAG('tblHeader'))
        keep_row_with_next(heading)
        for index, item in enumerate(clean_items, 1):
            row = copy.deepcopy(prototype)
            row.find('w:tc', NS).find('.//w:t', NS).text = str(index)
            row_properties = row.find('w:trPr', NS)
            if row_properties is None:
                row_properties = etree.Element(TAG('trPr'))
                row.insert(0, row_properties)
            if row_properties.find('w:cantSplit', NS) is None:
                etree.SubElement(row_properties, TAG('cantSplit'))
            height = row.find('w:trPr/w:trHeight', NS)
            if height is not None:
                height.set(TAG('hRule'), 'atLeast')
            fill_invoice_text(row, dict(slots, item_description=item['description'],
                                       item_details=item['details'][0] if item['details'] else '',
                                       item_notes='\n'.join(item['details'][1:]),
                                       qty=str(item['quantity']), delivered_qty=str(item['delivered'])))
            articles.append(row)
        if not slots['delivery_notes']:
            for paragraph in list(body.findall('w:p', NS)):
                if '{{delivery_notes}}' in ''.join(paragraph.xpath('.//w:t/text()', namespaces=NS)):
                    heading = paragraph.getprevious()
                    if heading is not None and heading.tag == TAG('p') and ''.join(heading.xpath('.//w:t/text()', namespaces=NS)).strip() == 'Opmerkingen voor ontvanger':
                        body.remove(heading)
                    body.remove(paragraph)
        fill_invoice_text(body, slots)
        if '{{' in ''.join(doc.xpath('//w:t/text()', namespaces=NS)):
            raise ValueError('Er staan nog onverwerkte pakbonvariabelen in de template.')
        with ZipFile(target, 'w') as output:
            for info in source.infolist():
                output.writestr(info, etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
                                if info.filename == 'word/document.xml' else source.read(info.filename))


TEMPLATE_FILES = {'packing': 'packing-slip.docx', 'invoice': 'invoice.docx', 'confirmation': 'order-confirmation.docx'}

def template_kind(kind):
    key = 'confirmation' if kind in ('quote', 'proforma') else kind
    if key not in TEMPLATE_FILES:
        raise ValueError('Kies een bekend documenttype.')
    return key

def validated_template(template, kind, company_id):
    """Bounded OOXML inspection, no extraction, conversion, links or writes."""
    if not isinstance(template, dict) or template.get('companyId') != company_id:
        raise ValueError('Deze template hoort niet bij dit bedrijf.')
    encoded = template.get('data')
    if not isinstance(encoded, str) or not 0 < len(encoded) <= 533336:
        raise ValueError('Kies een Word-template van maximaal 400 kB.')
    try:
        data = base64.b64decode(encoded, validate=True)
        if not 0 < len(data) <= 400000:
            raise ValueError('Kies een Word-template van maximaal 400 kB.')
        with ZipFile(io.BytesIO(data)) as upload, ZipFile(company_templates(company_id) / TEMPLATE_FILES[kind]) as original:
            entries = upload.infolist()
            names = [i.filename for i in entries]
            if len(entries) > 300 or len(set(names)) != len(names) or sum(i.file_size for i in entries) > 8000000:
                raise ValueError('Deze Word-template is te groot of onbruikbaar.')
            if not {'word/document.xml', '[Content_Types].xml', 'word/settings.xml'}.issubset(names):
                raise ValueError('Dit is geen bruikbare Word-template (.docx).')
            def xml(package, name):
                raw = package.read(name)
                if b'<!DOCTYPE' in raw.upper() or b'<!ENTITY' in raw.upper():
                    raise ValueError('Deze template bevat niet-ondersteunde XML.')
                return etree.fromstring(raw, parser=etree.XMLParser(resolve_entities=False, no_network=True, load_dtd=False))
            def fields(root):
                tokens = re.findall(r'{{.*?}}', ''.join(root.xpath('.//w:t/text()', namespaces=NS)))
                tags = root.xpath('.//w:sdtPr/w:tag/@w:val', namespaces=NS)
                return Counter(tokens), Counter(tags)
            for entry in entries:
                name = entry.filename
                if entry.flag_bits & 1 or name.startswith('/') or '\\' in name or '..' in name.split('/') or name.lower().endswith(('.bin', '.exe', '.js')) or any(x in name.lower() for x in ('activex/', 'embeddings/', 'vbaproject')):
                    raise ValueError('Gebruik een gewone .docx zonder macro’s of ingesloten bestanden.')
                if name.endswith(('.xml', '.rels')):
                    root = xml(upload, name)
                    if root.xpath('//*[local-name()="altChunk"]') or any('macroenabled' in str(v).lower() for node in root.iter() for v in node.attrib.values()):
                        raise ValueError('Actieve Word-inhoud wordt niet ondersteund.')
                    instructions = [''.join(paragraph.xpath('.//w:instrText/text()', namespaces=NS)) for paragraph in root.xpath('.//w:p[.//w:instrText]', namespaces=NS)] + root.xpath('.//w:fldSimple/@w:instr', namespaces=NS)
                    if any(not re.match(r'^\s*(PAGE|NUMPAGES|SECTIONPAGES|DATE|TIME)\b', instruction, re.I) for instruction in instructions):
                        raise ValueError('Gebruik alleen gewone tekst, CRM-invulvelden en eenvoudige pagina-/datumvelden; gekoppelde of uitvoerbare Word-velden zijn niet toegestaan.')
                    if name.endswith('.rels'):
                        for relationship in root:
                            if relationship.get('TargetMode') == 'External':
                                target = relationship.get('Target', '')
                                if not relationship.get('Type', '').endswith('/hyperlink') or not target.lower().startswith(('https://', 'mailto:')):
                                    raise ValueError('Externe afbeeldingen, bestanden en koppelingen naar lokale bestanden zijn niet toegestaan. Voeg afbeeldingen in Word in het document in.')
                    if name.startswith('word/') and (name == 'word/document.xml' or re.fullmatch(r'word/(header|footer)\d+\.xml', name)):
                        old = xml(original, name) if name in original.namelist() else etree.Element(TAG('p'))
                        if fields(root) != fields(old):
                            raise ValueError('Behoud de oorspronkelijke invulvelden en inhoudsbesturingselementen.')
            body = xml(upload, 'word/document.xml').find('w:body', NS)
            old_body = xml(original, 'word/document.xml').find('w:body', NS)
            if body is None:
                raise ValueError('De Word-template heeft geen documentinhoud.')
            # The existing generator addresses specific table rows/cells. Keep
            # those slots and their fields in place; typography remains editable.
            def structure(root):
                return [[[(bool(cell.find('.//w:t', NS) is not None), fields(cell)) for cell in row.findall('w:tc', NS)] for row in table.findall('w:tr', NS)] for table in root.findall('w:tbl', NS)]
            if structure(body) != structure(old_body):
                raise ValueError('De producttabellen of invulvelden zijn verplaatst. Behoud rijen, kolommen en invulvelden van de gedownloade template.')
        return data
    except (BadZipFile, KeyError, etree.XMLSyntaxError, TypeError, binascii.Error):
        raise ValueError('Dit bestand is geen geldige Word-template (.docx).')

def template_request(payload, company_id=COMPANY):
    kind = template_kind(payload.get('templateKind'))
    action = payload.get('templateRequest')
    if action == 'download':
        data = (company_templates(company_id) / TEMPLATE_FILES[kind]).read_bytes()
        return {'templateProtocol': 1, 'data': base64.b64encode(data).decode()}
    if action == 'validate':
        validated_template(payload.get('template'), kind, company_id)
        return {'templateProtocol': 1, 'valid': True}
    raise ValueError('Onbekende templateactie.')


def build(payload, target, company_id=COMPANY, template_root=None):
    template_root = template_root or company_templates(company_id)
    spec = DOCUMENT_TYPES.get(payload.get('kind'))
    if spec is None:
        raise ValueError('Kies offerte, orderbevestiging, proforma, factuur of pakbon.')
    number = text(payload.get('number', ''))
    if number != 'CONCEPT' and not re.fullmatch(spec['prefix'] + r'-\d{4}-\d{4,}', number):
        raise ValueError('Ongeldig documentnummer.')
    if payload['kind'] == 'packing':
        return build_packing_slip(payload, target, template_root)
    fields = payload.get('fields', {})
    keys = ['billing_company', 'billing_street', 'billing_postal_city', 'billing_country',
            'shipping_company', 'shipping_street', 'shipping_postal_city', 'shipping_country',
            'customer_number', 'payment_terms', 'document_date', 'customer_reference',
            'ordered_by', 'delivery_method', 'delivery_terms', 'handled_by', 'customer_phone',
            'customer_email', 'printing_details', 'production_tolerance', 'expected_lead_time']
    slots = {key: text(fields.get(key, '')) for key in keys}
    for key, default in [('production_tolerance', '7%'), ('handled_by', 'Philippe'),
                         ('delivery_method', 'Afhalen of verzenden'), ('expected_lead_time', '2 tot 8 weken')]:
        slots[key] = slots[key] or default
    slots['document_number'] = number
    items = payload.get('items', [])
    if not isinstance(items, list) or not 1 <= len(items) <= 40:
        raise ValueError('Een document heeft 1 tot 40 productregels nodig.')
    package = payload.get('packagePrice')
    if package is not None:
        package = amount(package)
    subtotal = 0
    for item in items:
        item['description'] = text(item.get('description', ''))
        details = item.get('details', [item.get('detail1', ''), item.get('detail2', '')])
        if not isinstance(details, list) or len(details) > 100:
            raise ValueError('Gebruik maximaal 100 extra tekstregels per artikel.')
        item['details'] = [clean for value in details if (clean := text(value))]
        if not item['description'] or len(item['description']) > 200:
            raise ValueError('Gebruik een productomschrijving van maximaal 200 tekens.')
        qty = item.get('quantity')
        if isinstance(qty, bool) or not isinstance(qty, int) or not 1 <= qty <= 100_000:
            raise ValueError('Controleer de productaantallen.')
        if package is None:
            subtotal += amount(item.get('price')) * qty
    subtotal = package if package is not None else subtotal
    shipping = amount(payload.get('shippingCharge', 0))
    vat = Decimal(str(payload.get('vat')))
    if not vat.is_finite() or not 0 <= vat <= 100:
        raise ValueError('Controleer het btw-percentage.')
    net = subtotal + shipping
    tax = int((Decimal(net) * vat / 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
    slots['vat_percentage'] = str(vat).rstrip('0').rstrip('.') if '.' in str(vat) else str(vat)
    slots.update(shipping_fee=money(shipping), small_order_fee=money(0), credit_surcharge=money(0),
                 diesel_surcharge=money(0), subtotal=money(subtotal), total_surcharges=money(shipping),
                 total_ex_vat=money(net), vat_amount=money(tax), grand_total=money(net + tax),
                 _vat_label=str(vat).rstrip('0').rstrip('.') if '.' in str(vat) else str(vat))
    if payload['kind'] == 'invoice':
        slots['_grand_total'] = net + tax
        return build_invoice(payload, target, slots, items, package, template_root)
    template = template_root / 'order-confirmation.docx'
    with ZipFile(template) as source:
        doc = etree.fromstring(source.read('word/document.xml'))
        body = doc.find('w:body', NS)
        original = body.find('w:tbl', NS)
        insertion = list(body).index(original)
        rows = original.findall('w:tr', NS)
        body.remove(original)
        local = dict(slots, page_number='1 / 1', _page=1, _pages=1)

        # Separate tables allow just the article column headings to repeat.
        # The company/customer block appears once, at the start of the document.
        header = table_with_rows(original, rows[:15])
        title = header.find('w:tr', NS).findall('w:tc', NS)[-1].findall('.//w:t', NS)
        title[0].text = spec['title']
        for node in title[1:]:
            node.text = ''
        for node in header.findall('.//w:t', NS):
            if node.text in ('Nummer', 'OB-nummer'):
                node.text = spec['label']
            elif node.text == 'Klantverwijzing':
                node.text = 'Orderreferentie'
        fill_table(header, local)
        for row_index, row in enumerate(header.findall('w:tr', NS)):
            if 2 <= row_index <= 13:
                grow_row(row)
            keep_row_with_next(row)

        articles = table_with_rows(original, [rows[15]])
        heading = articles.find('w:tr', NS)
        etree.SubElement(heading.find('w:trPr', NS), TAG('tblHeader'))
        grow_row(heading)
        keep_row_with_next(heading)
        for index, item in enumerate(items, 1):
            main = copy.deepcopy(rows[17])
            for control in main.findall('.//w:sdt', NS):
                tag = control.find('w:sdtPr/w:tag', NS)
                key = tag.get(TAG('val'))
                tag.set(TAG('val'), key.replace('_1', f'_{index}'))
            local.update({f'item_{index}_description': item['description'],
                          f'qty_{index}': str(item['quantity']),
                          f'unit_{index}': 'Inbegrepen' if package is not None else money(item['price']),
                          f'line_total_{index}': 'Inbegrepen' if package is not None else money(item['price'] * item['quantity'])})
            position = main.xpath('.//w:t[text()="1"]', namespaces=NS)
            if position:
                position[0].text = str(index)
            grow_row(main)
            if item['details']:
                keep_row_with_next(main)
            articles.append(main)
            for detail, value in enumerate(item['details'], 1):
                row = copy.deepcopy(rows[18])
                control = row.find('.//w:sdt', NS)
                key = f'item_{index}_detail_{detail}'
                control.find('w:sdtPr/w:tag', NS).set(TAG('val'), key)
                local[key] = value
                grow_row(row)
                articles.append(row)
            if index < len(items):
                articles.append(copy.deepcopy(rows[20]))
        fill_table(articles, local)

        # One closing block, kept together on the final page. Keep the source
        # total cells contiguous: their left-hand conditions use vertical merges.
        closing = table_with_rows(original, rows[24:])
        closing_rows = closing.findall('w:tr', NS)
        if not slots['printing_details']:
            move_top_border(closing_rows[1], closing_rows[2])
            closing.remove(closing_rows[1])
        # Footer text and its two-line layout come directly from the template.
        # Replace the fixed space of the original one-page form with a short gap.
        closing_rows[9].find('w:trPr/w:trHeight', NS).set(TAG('val'), '200')
        fill_table(closing, local)
        final_rows = closing.findall('w:tr', NS)
        for row in final_rows:
            grow_row(row)
        for row in final_rows[:-1]:
            keep_row_with_next(row)

        body.insert(insertion, header)
        body.insert(insertion + 1, table_separator())
        body.insert(insertion + 2, articles)
        body.insert(insertion + 3, table_separator())
        body.insert(insertion + 4, closing)
        # Give naturally flowing content some space above the page edge.
        margins = body.find('w:sectPr/w:pgMar', NS)
        if margins is not None:
            margins.set(TAG('bottom'), '600')
        if '{{' in ''.join(doc.xpath('//w:t/text()', namespaces=NS)):
            raise ValueError('Er staan nog onverwerkte variabelen in de template.')
        settings = etree.fromstring(source.read('word/settings.xml'))
        update_fields = settings.find('w:updateFields', NS)
        if update_fields is None:
            update_fields = etree.SubElement(settings, TAG('updateFields'))
        update_fields.set(TAG('val'), 'true')
        changed_parts = {'word/document.xml': doc, 'word/settings.xml': settings}
        with ZipFile(target, 'w') as output:
            for info in source.infolist():
                output.writestr(info, etree.tostring(changed_parts[info.filename], xml_declaration=True, encoding='UTF-8', standalone=True)
                                if info.filename in changed_parts else source.read(info.filename))


def preview_pdf(payload):
    """Render one page of the actual saved PDF. No regeneration or persistence."""
    encoded, page = payload.get('data'), payload.get('page', 1)
    if not isinstance(encoded, str) or len(encoded) > 14_000_000:
        raise ValueError('Een PDF-voorbeeld ondersteunt bestanden tot 10 MB.')
    data = base64.b64decode(encoded, validate=True)
    if not data.startswith(b'%PDF-') or not 5 <= len(data) <= 10_000_000:
        raise ValueError('Kies een geldige PDF van maximaal 10 MB.')
    if isinstance(page, bool) or not isinstance(page, int) or not 1 <= page <= 200:
        raise ValueError('Kies een geldige paginanummer tussen 1 en 200.')
    runtime_path = Path(os.environ.get('CRM_DOCUMENT_RUNTIME', str(ROOT / '.local/document-runtime.json')))
    runtime = json.loads(runtime_path.read_text())
    with tempfile.TemporaryDirectory(prefix='crm-pdf-preview-') as directory:
        work = Path(directory)
        pdf = work / 'document.pdf'
        pdf.write_bytes(data)
        try:
            info = subprocess.run([runtime['pdfinfo'], str(pdf)], capture_output=True, text=True, check=True, timeout=15).stdout
            match = re.search(r'^Pages:\s+(\d+)', info, re.M)
            pages = int(match.group(1)) if match else 0
            if not 1 <= pages <= 200 or page > pages:
                raise ValueError('Dit PDF-voorbeeld ondersteunt maximaal 200 pagina’s; controleer de gekozen pagina.')
            subprocess.run([str(Path(runtime['pdfinfo']).with_name('pdftoppm')), '-f', str(page), '-l', str(page),
                            '-scale-to', '1800', '-singlefile', '-png', str(pdf), str(work / 'page')],
                           capture_output=True, check=True, timeout=30)
        except subprocess.CalledProcessError:
            raise ValueError('Deze PDF kan niet worden weergegeven. Mogelijk is hij beschadigd of met een wachtwoord beveiligd.')
        image = (work / 'page.png').read_bytes()
        if not image.startswith(b'\x89PNG\r\n\x1a\n') or len(image) > 5_000_000:
            raise ValueError('Deze pagina is te groot om weer te geven.')
        return {'page': page, 'pages': pages, 'image': base64.b64encode(image).decode()}


def render(payload, company_id=COMPANY):
    if payload.get('templateRequest'):
        return template_request(payload, company_id)
    runtime_path = Path(os.environ.get('CRM_DOCUMENT_RUNTIME', str(ROOT / '.local/document-runtime.json')))
    runtime = json.loads(runtime_path.read_text())
    with tempfile.TemporaryDirectory(prefix='spatlappen-document-') as directory:
        work = Path(directory)
        docx = work / 'orderbevestiging.docx'
        template_root = None
        if payload.get('template') is not None:
            kind = template_kind(payload.get('kind'))
            data = validated_template(payload['template'], kind, company_id)
            template_root = work / 'templates'
            template_root.mkdir()
            (template_root / TEMPLATE_FILES[kind]).write_bytes(data)
        build(payload, docx, company_id, template_root)
        profile = (work / 'office-profile').as_uri()
        env = dict(os.environ)
        if runtime.get('fontDirectories'):
            font_config = etree.Element('fontconfig')
            for directory in runtime['fontDirectories']:
                etree.SubElement(font_config, 'dir').text = directory
            etree.SubElement(font_config, 'cachedir').text = str(work / 'font-cache')
            config_path = work / 'fonts.conf'
            config_path.write_bytes(etree.tostring(font_config, xml_declaration=True, encoding='UTF-8'))
            env['FONTCONFIG_FILE'] = str(config_path)
        subprocess.run([runtime['soffice'], '-env:UserInstallation=' + profile, '--headless',
                        '--convert-to', 'pdf', '--outdir', str(work), str(docx)],
                       check=True, capture_output=True, timeout=45, env=env)
        pdf = docx.with_suffix('.pdf')
        if not pdf.exists():
            raise ValueError('De Word-template kon niet naar PDF worden omgezet.')
        info = subprocess.run([runtime['pdfinfo'], str(pdf)], capture_output=True, text=True, check=True).stdout
        match = re.search(r'^Pages:\s+(\d+)', info, re.M)
        if not match:
            raise ValueError('Het aantal PDF-pagina’s kon niet worden bepaald.')
        actual_pages = int(match.group(1))
        previews = []
        if payload.get('preview') or payload.get('number') == 'CONCEPT':
            subprocess.run([str(Path(runtime['pdfinfo']).with_name('pdftoppm')), '-scale-to', '1400',
                            '-png', str(pdf), str(work / 'page')],
                           check=True, capture_output=True, timeout=30)
            previews = [base64.b64encode(path.read_bytes()).decode()
                        for path in sorted(work.glob('page-*.png'), key=lambda p: int(p.stem.split('-')[-1]))]
        return {'templateProtocol': 1, 'pdf': base64.b64encode(pdf.read_bytes()).decode(),
                **({'docx': base64.b64encode(docx.read_bytes()).decode()} if payload.get('formats') != ['pdf'] else {}), 'pages': actual_pages, 'previews': previews,
                'filename': DOCUMENT_TYPES[payload['kind']]['file'] + '_' + payload['number']}


if __name__ == '__main__':
    try:
        payload = json.load(sys.stdin)
        print(json.dumps(preview_pdf(payload) if sys.argv[1:] == ['--preview'] else render(payload)))
    except (ValueError, KeyError) as error:
        print(json.dumps({'error': str(error)}))
        sys.exit(1)
    except Exception:
        print(json.dumps({'error': 'Document maken lukt niet. Controleer de lokale PDF-omzetter.'}))
        sys.exit(1)
