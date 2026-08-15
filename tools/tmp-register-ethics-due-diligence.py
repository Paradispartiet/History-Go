import json
from pathlib import Path

registry_path = Path('docs/documentation_registry.json')
data = json.loads(registry_path.read_text(encoding='utf-8'))

ethics_path = 'docs/ETHICAL_GUIDELINES_V1.md'
due_path = 'docs/DUE_DILIGENCE_ASSESSMENT_V1.md'

priority = data.setdefault('priority_order', [])
for path in (ethics_path, due_path):
    while path in priority:
        priority.remove(path)

anchor = 'docs/FACTUALITY_CONTRACT.md'
insert_at = priority.index(anchor) + 1 if anchor in priority else 0
priority[insert_at:insert_at] = [ethics_path, due_path]

entries = {
    ethics_path: {
        'path': ethics_path,
        'status': 'canonical',
        'role': 'Overordnede etiske retningslinjer for ansvarlig virksomhet, personvern, AI, rettigheter, ikke-diskriminering, antikorrupsjon, leverandører, barn, tilgjengelighet og innholdsproduksjon',
        'owns': ['history_go_ethics_and_responsible_business'],
        'last_verified': '2026-08-15',
    },
    due_path: {
        'path': due_path,
        'status': 'canonical',
        'role': 'Risikobasert aktsomhetsvurdering for virksomhet og leverandørkjede med konkrete risikoer, tiltak, ansvar, oppfølging og revisjon',
        'owns': ['history_go_due_diligence'],
        'last_verified': '2026-08-15',
    },
}

documents = data.setdefault('documents', [])
seen = set()
new_documents = []
for item in documents:
    path = item.get('path') if isinstance(item, dict) else None
    if path in entries:
        if path not in seen:
            new_documents.append(entries[path])
            seen.add(path)
    else:
        new_documents.append(item)
for path in (ethics_path, due_path):
    if path not in seen:
        new_documents.append(entries[path])
data['documents'] = new_documents
data['last_verified'] = '2026-08-15'
registry_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

readme_path = Path('docs/README.md')
readme = readme_path.read_text(encoding='utf-8')
readme = readme.replace('Sist kontrollert: **2026-08-03**', 'Sist kontrollert: **2026-08-15**', 1)
heading = '### Etikk, ansvarlig næringsliv og aktsomhet'
block = '''### Etikk, ansvarlig næringsliv og aktsomhet

1. [`ETHICAL_GUIDELINES_V1.md`](./ETHICAL_GUIDELINES_V1.md) — canonical etiske retningslinjer for personvern, kildebruk/opphavsrett, AI, ikke-diskriminering, antikorrupsjon, leverandører, barn/unge, tilgjengelighet og ansvarlig innholdsproduksjon
2. [`DUE_DILIGENCE_ASSESSMENT_V1.md`](./DUE_DILIGENCE_ASSESSMENT_V1.md) — canonical risikobasert aktsomhetsvurdering for egen virksomhet og leverandørkjede med tiltak, ansvar, oppfølging og revisjon
3. [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) — bindende faglig sannhets- og kildeverifikasjonsregel for brukerrettet innhold

Etikkpolicyen eier de overordnede virksomhetsprinsippene. Aktsomhetsvurderingen eier risikoregisteret og oppfølgingen. Mer spesifikke privacy-, safety-, bilde-, data- og produksjonskontrakter kan stille strengere krav, men ikke svekke disse grensene.

'''
if heading not in readme:
    marker = '## Leserekkefølge\n\n'
    if marker not in readme:
        raise SystemExit('docs/README.md: expected Leserekkefølge marker not found')
    readme = readme.replace(marker, marker + block, 1)
readme_path.write_text(readme, encoding='utf-8')

json.loads(registry_path.read_text(encoding='utf-8'))
assert ethics_path in registry_path.read_text(encoding='utf-8')
assert due_path in registry_path.read_text(encoding='utf-8')
assert 'ETHICAL_GUIDELINES_V1.md' in readme_path.read_text(encoding='utf-8')
assert 'DUE_DILIGENCE_ASSESSMENT_V1.md' in readme_path.read_text(encoding='utf-8')
