"""Repeat Murai combined-book hierarchy extraction from pinned public HTML.

Structure labels/relationships only: Bible quotation cells are never copied.
Download URLs and SHA-256 pins live in murai-hierarchy.json; use HTTP as published,
without weakening TLS verification. Requires only the Python standard library.
"""
import hashlib
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / 'scripts/structure-sources/murai-hierarchy.json'
CACHE = ROOT / 'scripts/cache/structures'
reviewed = json.loads(TARGET.read_text(encoding='utf-8'))
records, inventory, inputs = [], [], []


def clean(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', value))).strip()


def letter(index):
    result = ''
    while index >= 0:
        result = chr(65 + index % 26) + result
        index = index // 26 - 1
    return result


for source in reviewed['inputs']:
    filename = source['file']
    if Path(filename).name != filename:
        raise ValueError('Unsafe source filename')
    raw = (CACHE / filename).read_bytes()
    if hashlib.sha256(raw).hexdigest() != source['sha256']:
        raise ValueError('Source changed; review before updating pins: ' + filename)
    inputs.append(source)
    text = raw.decode('utf-8')
    for section in re.finditer(r'<h3><a name="([^"]+)">[\s\S]*?</h3>([\s\S]*?)(?=<h3>|<h2>|$)', text):
        locator, body = section.groups()
        sequence = body.split('<table')[0]
        nodes = []
        for item in re.finditer(r'<a href="[^"]*pericope_e\.html#(\d+)">([\s\S]*?)</a>\s*\(<a\b[^>]*>([\s\S]*?)</a>\)<br\s*/?\s*>', sequence):
            pericope, title, reference = item.groups()
            nodes.append({'sourcePericope': int(pericope), 'title': re.sub(r'^\d+\s*', '', clean(title)), 'ref': clean(reference)})
        if not nodes:
            raise ValueError('No outline nodes: ' + filename + '#' + locator)
        prefixes = list(dict.fromkeys(re.sub(r'\d$', '', prefix) for node in nodes for prefix in re.findall(r'(?:[12](?:S|K|Ch)|Ezr|Ne)\d', node['ref'])))
        table = re.search(r'<table\b[^>]*>([\s\S]*?)</table>', body, re.I)
        if table is None:
            raise ValueError('Missing explicit relationship table')
        assigned, relationships, relation_count = {}, {}, 0
        for row in re.finditer(r'<tr\b[^>]*>([\s\S]*?)</tr>', table[1], re.I):
            cells = re.findall(r'<td\b[^>]*>([\s\S]*?)</td>', row[1], re.I)
            if len(cells) != 3:
                continue
            left = re.search(r'pericope_e\.html#(\d+)', cells[0])
            right = re.search(r'pericope_e\.html#(\d+)', cells[2])
            if not left or not right:
                continue
            first, last = int(left[1]), int(right[1])
            relation_count += 1
            if first in assigned:
                label = assigned[first]
                if assigned.get(last) != label + '′':
                    raise ValueError('Conflicting source relationship')
                relationships[label] += '; ' + clean(cells[1])
                continue
            if last in assigned:
                raise ValueError('Conflicting latter source relationship')
            label = letter(len(relationships))
            assigned[first], assigned[last] = label, label + '′'
            relationships[label] = clean(cells[1])
        unmatched = [node for node in nodes if node['sourcePericope'] not in assigned]
        if len(unmatched) > 1:
            raise ValueError('Unresolved grouping: ' + filename + '#' + locator)
        if unmatched:
            assigned[unmatched[0]['sourcePericope']] = letter(len(relationships))
        inventory.append({'file': filename, 'locator': locator, 'count': len(nodes), 'prefixes': prefixes, 'relations': relation_count, 'unmatched': len(unmatched)})
        base = re.sub(r'_e_\d+\.html$', '', filename)
        name = re.sub(r'^\d+_', '', base)
        record = {
            'id': 'murai-web-' + name.lower() + '-' + locator,
            'title': name.replace('EzraNehemiah', 'Ezra–Nehemiah') + ' · ' + ('whole-book fold' if locator == '1-1' else 'division ' + locator),
            'sourceFile': filename, 'sourceUrl': source['url'] + '#' + locator, 'locator': locator,
            'kind': 'Concentric structure' if unmatched else 'Chiasm',
            'nodes': [dict(node, label=assigned[node['sourcePericope']]) for node in nodes],
            'relationships': relationships,
            'boundaries': nodes[0]['ref'] + ' … ' + nodes[-1]['ref'],
            'note': 'Complete source outline ' + locator + ' from Murai’s hierarchy page. Source pericope numbers and references are retained; ChiFold supplies letter labels following the explicit Former half / Latter half relationship table. Quoted Bible text is excluded. Source-reference numbering requires edition-specific verification; no automatic identity mapping is asserted.',
        }
        if unmatched:
            record['centerLabel'] = assigned[unmatched[0]['sourcePericope']]
        records.append(record)

seen, duplicate_count = {}, 0
for record in records:
    fingerprint = tuple((node['ref'], node['label']) for node in record['nodes'])
    if fingerprint in seen:
        earlier = seen[fingerprint]
        record['duplicateOf'] = earlier['id']
        duplicate_count += 1
        earlier.setdefault('additionalSourceLocators', []).append({key: record[key] for key in ('sourceFile', 'sourceUrl', 'locator')})
    else:
        seen[fingerprint] = record

output = {'sourceOutlines': len(inventory), 'sourceInventory': inventory, 'sourceId': 'murai-web', 'inputs': inputs, 'records': records,
          'readingCrosswalkNotes': reviewed.get('readingCrosswalkNotes', []), 'uniqueOutlines': len(seen), 'duplicateOccurrences': duplicate_count}
TARGET.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
cross_book = [record for record in records if len(next(item['prefixes'] for item in inventory if item['file'] == record['sourceFile'] and item['locator'] == record['locator'])) > 1 and 'duplicateOf' not in record]
print(json.dumps({'sourceOccurrences': len(records), 'uniqueOutlines': len(seen), 'duplicateOccurrences': duplicate_count, 'multiBookUnique': len(cross_book)}))

