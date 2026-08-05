from pathlib import Path

path = Path('tests/vitenskap-teknologi-category-contract.test.mjs')
text = path.read_text()
replacements = {
    "technology?.pensum === 'vitenskap/teknologi/teknologipensum_canonical_v2_4.json'": "technology?.pensum === 'teknologi/teknologipensum_canonical_v3.json'",
    "technology?.emner === 'vitenskap/teknologi/emner_teknologi_canonical_v2_4.json'": "technology?.emner === 'teknologi/emner_teknologi_canonical_v3.json'",
    "technology?.scientificPackage === 'vitenskap/teknologi/teknologi_scientific_v2/index.json'": "technology?.scientificPackage === 'teknologi/teknologi_scientific_v2/index.json'",
}
for old, new in replacements.items():
    if old not in text and new not in text:
        raise SystemExit(f'Could not locate expected Technology contract assertion: {old}')
    text = text.replace(old, new)
path.write_text(text)
