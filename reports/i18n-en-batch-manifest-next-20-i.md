# EN i18n Batch I (manifest next 20)

Date: 2026-05-03

## Pre-batch status
Commands run:
- `node scripts/i18n-audit-places.js en`
- `node scripts/i18n-quality-places.js en`

Audit before batch:
- OK: 242
- Missing: 70
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0

Quality before batch:
- Entries checked: 242
- Entries with issues: 0
- Errors: 0
- Warnings: 0

## Worklist
Command:
- `node scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=20 --out=tmp/i18n/places-en-worklist-manifest-next-20-i.json`

Worklist IDs (20):
1. tvergastein
2. gamlebyen_skole
3. abelhaugen
4. lisbon_city
5. lisbon_praca_do_comercio
6. lisbon_alfama
7. lisbon_elevador_de_santa_justa
8. lisbon_ponte_25_de_abril
9. lisbon_rossio
10. lisbon_avenida_da_liberdade
11. lisbon_parque_eduardo_vii
12. lisbon_cais_do_sodre
13. lisbon_principe_real
14. lisbon_baixa_pombalina
15. lisbon_bica
16. lisbon_graca
17. lisbon_belem_bydel
18. lisbon_alcantara
19. lisbon_intendente
20. lisbon_torre_de_belem

Translated/updated IDs (20):
- tvergastein
- gamlebyen_skole
- abelhaugen
- lisbon_city
- lisbon_praca_do_comercio
- lisbon_alfama
- lisbon_elevador_de_santa_justa
- lisbon_ponte_25_de_abril
- lisbon_rossio
- lisbon_avenida_da_liberdade
- lisbon_parque_eduardo_vii
- lisbon_cais_do_sodre
- lisbon_principe_real
- lisbon_baixa_pombalina
- lisbon_bica
- lisbon_graca
- lisbon_belem_bydel
- lisbon_alcantara
- lisbon_intendente
- lisbon_torre_de_belem

All worklist IDs processed: yes (20/20)

## Write/merge method
- Method used: tmp JSON + merge script
- Created `tmp/i18n/batch-i-translations.json` with all translations as valid JSON.
- Ran a small merge script that reads the tmp JSON file and updates `data/i18n/content/places/en.json`.
- No inline Node script with long translation text blocks was used.

## Post-batch checks
Commands run:
- `node scripts/i18n-stamp-places.js en`
- `node scripts/i18n-audit-places.js en`
- `node scripts/i18n-quality-places.js en`

Entries in `en.json`:
- Before: 242
- After: 262

Stamp result:
- entries: 262
- hashes changed: 0
- translation IDs without master place: 0

Audit after batch:
- OK: 262
- Missing: 50
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0

Quality after batch:
- Entries checked: 262
- Entries with issues: 0
- Errors: 0
- Warnings: 0

## Scope confirmation
- data/places not changed
- manifest not changed
- runtime/CSS not changed
- scripts not changed
- leksikon not changed
- place_image_candidates not changed
- Civication not changed
