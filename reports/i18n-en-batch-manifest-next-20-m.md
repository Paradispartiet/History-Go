# EN i18n batch M (manifest next 20)

Date: 2026-05-03

## Pre-batch checks
- `git status --short`: clean
- Confirmed exists: `reports/i18n-en-batch-manifest-next-20-l.md`
- Confirmed missing: `reports/i18n-en-batch-manifest-next-20-m.md` (before creation)

## Actual status before batch
From `node scripts/i18n-audit-places.js en` and `node scripts/i18n-quality-places.js en`:
- OK: 322
- Missing: 42
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0
- Quality errors: 0
- Quality warnings: 0

## Worklist command
`node scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=20 --out=tmp/i18n/places-en-worklist-manifest-next-20-m.json`

## Worklist IDs (20)
1. lisbon_hemeroteca_municipal
2. lisbon_gremio_literario
3. lisbon_casa_dos_estudantes_do_imperio
4. lisbon_mouraria_fado
5. lisbon_hot_clube_de_portugal
6. lisbon_museu_do_fado
7. lisbon_coliseu_dos_recreios
8. lisbon_teatro_tivoli_bbva
9. lisbon_clube_de_fado
10. lisbon_tasca_do_chico
11. lisbon_bairro_alto
12. lisbon_pink_street
13. lisbon_galeria_ze_dos_bois
14. lisbon_musicbox
15. lisbon_fabrica_braco_de_prata
16. lisbon_crew_hassan
17. lisbon_village_underground
18. lisbon_desterro
19. lisbon_anjos70
20. lisbon_lx_factory

## IDs translated/updated
- lisbon_hemeroteca_municipal
- lisbon_gremio_literario
- lisbon_casa_dos_estudantes_do_imperio
- lisbon_mouraria_fado
- lisbon_hot_clube_de_portugal
- lisbon_museu_do_fado
- lisbon_coliseu_dos_recreios
- lisbon_teatro_tivoli_bbva
- lisbon_clube_de_fado
- lisbon_tasca_do_chico
- lisbon_bairro_alto
- lisbon_pink_street
- lisbon_galeria_ze_dos_bois
- lisbon_musicbox
- lisbon_fabrica_braco_de_prata
- lisbon_crew_hassan
- lisbon_village_underground
- lisbon_desterro
- lisbon_anjos70
- lisbon_lx_factory

All worklist IDs processed: yes (20/20)

## en.json entries before/after
- Before: 322
- After: 342
- Net change: +20

## Stamp result
From `node scripts/i18n-stamp-places.js en`:
- entries: 342
- hashes changed: 0
- translation IDs without master place: 0

## Audit after batch
From `node scripts/i18n-audit-places.js en`:
- OK: 342
- Missing: 22
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0

## Quality after batch
From `node scripts/i18n-quality-places.js en`:
- Entries checked: 342
- Entries with issues: 0
- Errors: 0
- Warnings: 0

## Write/merge method
- Method used: tmp JSON + merge script
- Temporary file used: `tmp/i18n/batch-m-translations.json` (not committed)
- Merge was performed via a small Node script reading JSON from disk (no inline large quote block in shell JS).

## Scope confirmation
- data/places not changed
- data/places/manifest.json not changed
- runtime/CSS not changed
- scripts not changed
- leksikon not changed
- place_image_candidates not changed
- Civication files not changed
- coordinate files/reports not changed
