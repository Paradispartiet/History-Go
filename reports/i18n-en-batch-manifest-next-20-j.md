# EN i18n batch J (manifest next 20)

## Pre-batch verification
- `git status --short`: clean working tree.
- Confirmed exists: `reports/i18n-en-batch-manifest-next-20-i.md`.
- Confirmed missing before work: `reports/i18n-en-batch-manifest-next-20-j.md`.

## Actual status before batch
From `node scripts/i18n-audit-places.js en` and `node scripts/i18n-quality-places.js en`:
- OK: 262
- Missing: 50
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0
- Quality errors: 0
- Quality warnings: 0

## Worklist command
`node scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=20 --out=tmp/i18n/places-en-worklist-manifest-next-20-j.json`

## Worklist IDs
1. lisbon_mosteiro_dos_jeronimos
2. lisbon_castelo_de_sao_jorge
3. lisbon_aqueduto_das_aguas_livres
4. lisbon_se_de_lisboa
5. lisbon_convento_do_carmo
6. lisbon_padrao_dos_descobrimentos
7. lisbon_estacao_do_rossio
8. lisbon_teatro_romano
9. lisbon_panteao_nacional
10. lisbon_sao_vicente_de_fora
11. lisbon_palacio_ajuda
12. lisbon_palacio_fronteira
13. lisbon_museu_de_lisboa
14. lisbon_assembleia_da_republica
15. lisbon_largo_do_carmo
16. lisbon_praca_dos_restauradores
17. lisbon_praca_marques_de_pombal
18. lisbon_museu_nacional_do_azulejo
19. lisbon_fundacao_calouste_gulbenkian
20. lisbon_maat

## IDs translated/updated
All 20 IDs above were translated/updated in `data/i18n/content/places/en.json`.

**All worklist IDs processed: yes (20/20)**

## en.json entry counts
- Before batch: 262 entries
- After batch (before/after stamp): 282 entries

## Write/merge method
- Used **tmp JSON + merge-script** method.
- Created `tmp/i18n/batch-j-translations.json` locally, merged with a short Node script, not committed.
- No inline shell quote block with large translation text was used for direct JSON injection.

## Stamp result
From `node scripts/i18n-stamp-places.js en`:
- entries: 282
- hashes changed: 0
- translation IDs without master place: 0

## Audit result after batch
From `node scripts/i18n-audit-places.js en`:
- OK: 282
- Missing: 30
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0

## Quality result after batch
From `node scripts/i18n-quality-places.js en`:
- Entries checked: 282
- Entries with issues: 0
- Errors: 0
- Warnings: 0

## Scope confirmation
- `data/places` not changed.
- `data/places/manifest.json` not changed.
- Runtime/CSS not changed.
- Scripts not changed.
- `data/leksikon` not changed.
- `data/places/place_image_candidates.json` not changed.
- Civication files not changed.
