# EN i18n batch N (manifest next 20)

## Pre-batch verification
- `git status --short`: clean working tree.
- Confirmed exists: `reports/i18n-en-batch-manifest-next-20-m.md`.
- Confirmed missing before run: `reports/i18n-en-batch-manifest-next-20-n.md`.

## Actual status before batch
From `node scripts/i18n-audit-places.js en` and `node scripts/i18n-quality-places.js en`:
- OK: 342
- Missing: 22
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0
- Quality errors: 0
- Quality warnings: 0

## Worklist command
`node scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=20 --out=tmp/i18n/places-en-worklist-manifest-next-20-n.json`

## Worklist IDs
1. lisbon_mercado_da_ribeira
2. lisbon_parque_das_nacoes
3. lisbon_cordoaria_nacional
4. lisbon_doca_de_alcantara
5. lisbon_mercado_de_campo_de_ourique
6. lisbon_armazens_do_chiado
7. lisbon_terminal_de_cruzeiros
8. lisbon_estadio_da_luz
9. lisbon_estadio_jose_alvalade
10. lisbon_jardim_botanico
11. lisbon_tapada_das_necessidades
12. lisbon_miradouro_sao_pedro_de_alcantara
13. lisbon_miradouro_da_graca
14. lisbon_monsanto
15. lisbon_jardim_da_estrela
16. lisbon_jardim_do_torel
17. lisbon_miradouro_da_senhora_do_monte
18. lisbon_tapada_da_ajuda
19. lisbon_jardim_gulbenkian
20. lisbon_jardim_do_principe_real

## IDs translated/updated
All 20 worklist IDs above were translated/updated in `data/i18n/content/places/en.json`.

**All worklist IDs processed: yes (20/20)**

## en.json entry count
- Before: 342
- After: 362

## Stamp result
From `node scripts/i18n-stamp-places.js en`:
- entries: 362
- hashes changed: 0
- translation IDs without master place: 0

## Audit result after batch
From `node scripts/i18n-audit-places.js en`:
- OK: 362
- Missing: 2
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0

## Quality result after batch
From `node scripts/i18n-quality-places.js en`:
- Entries checked: 362
- Entries with issues: 0
- Errors: 0
- Warnings: 0

## Write/merge method
- Used **tmp JSON + merge script** method.
- Created `tmp/i18n/batch-n-translations.json` locally, then merged into `data/i18n/content/places/en.json` with a small Node script.
- No large inline translation text was injected directly via JS command arguments.

## Scope confirmation
- `data/places` not changed.
- `data/places/manifest.json` not changed.
- runtime/CSS not changed.
- scripts not changed.
- leksikon not changed.
- `data/places/place_image_candidates.json` not changed.
- Civication files not changed.
- coordinate files/reports/scripts not changed.
