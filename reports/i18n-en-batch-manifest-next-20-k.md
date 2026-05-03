# EN i18n batch K (manifest-based next 20)

Date: 2026-05-03

## Pre-flight checks
- `git status --short`: clean.
- Exists: `reports/i18n-en-batch-manifest-next-20-j.md` (yes).
- Exists: `reports/i18n-en-batch-manifest-next-20-k.md` before work (no).

## Actual status before batch
From `node scripts/i18n-audit-places.js en` and `node scripts/i18n-quality-places.js en`:

- OK: 282
- Missing: 82
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0
- Quality errors: 0
- Quality warnings: 0

## Worklist command
`node scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=20 --out=tmp/i18n/places-en-worklist-manifest-next-20-k.json`

## Worklist IDs
1. lisbon_chiado
2. lisbon_campo_de_ourique
3. lisbon_estrela
4. lisbon_lapa
5. lisbon_ajuda
6. lisbon_campo_pequeno
7. lisbon_entrecampos
8. lisbon_oriente_station
9. lisbon_martim_moniz_mouraria_axis
10. lisbon_gare_do_cais_do_sodre
11. lisbon_igreja_de_santo_antonio
12. lisbon_igreja_de_sao_roque
13. lisbon_museu_do_aljube
14. lisbon_igreja_de_sao_domingos
15. lisbon_museu_de_marinha
16. lisbon_museu_nacional_dos_coches
17. lisbon_praca_do_municipio
18. lisbon_tribunal_constitucional
19. lisbon_fundacao_mario_soares_maria_barroso
20. lisbon_avenida_24_de_julho

## IDs translated/updated
All 20 IDs above were added to `data/i18n/content/places/en.json` with `_status`, `name`, `desc`, `popupDesc`, then stamped.

All worklist IDs processed: yes (20/20)

## en.json entries before/after
- Before: 282
- After: 302

## Stamp result
From `node scripts/i18n-stamp-places.js en`:
- entries: 302
- hashes changed: 0
- translation IDs without master place: 0

## Audit result after batch
From `node scripts/i18n-audit-places.js en`:
- OK: 302
- Missing: 62
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0

## Quality result after batch
From `node scripts/i18n-quality-places.js en`:
- Entries checked: 302
- Entries with issues: 0
- Errors: 0
- Warnings: 0

## Write/merge method
- Method used: tmp JSON + merge-script.
- Temporary file used: `tmp/i18n/batch-k-translations.json` (not committed).
- Merge was done with a small Node command reading file content from disk (no large inline text blocks).

## Scope confirmation
- `data/places` not changed.
- `data/places/manifest.json` not changed.
- runtime/CSS not changed.
- scripts not changed.
- `data/leksikon` not changed.
- `data/places/place_image_candidates.json` not changed.
- Civication files not changed.
