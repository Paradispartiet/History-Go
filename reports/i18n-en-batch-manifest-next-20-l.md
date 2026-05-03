# EN i18n batch L (manifest next 20)

Date: 2026-05-03
Language: en

## Pre-batch status (actual)
From:
- `node scripts/i18n-audit-places.js en`
- `node scripts/i18n-quality-places.js en`

- OK: 302
- Missing: 62
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0
- Quality errors: 0
- Quality warnings: 0

## Worklist command
`node scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=20 --out=tmp/i18n/places-en-worklist-manifest-next-20-l.json`

## Worklist IDs (20)
1. lisbon_palacio_de_belem
2. lisbon_museu_nacional_de_arte_antiga
3. lisbon_centro_cultural_de_belem
4. lisbon_museu_do_oriente
5. lisbon_mac_ccb_berardo
6. lisbon_museu_nacional_de_arte_contemporanea_do_chiado
7. lisbon_mude
8. lisbon_teatro_nacional_d_maria_ii
9. lisbon_teatro_sao_luiz
10. lisbon_culturgest
11. lisbon_museu_arpad_szenes_vieira_da_silva
12. lisbon_museu_bordalo_pinheiro
13. lisbon_casa_dos_bicos
14. lisbon_a_brasileira
15. lisbon_livraria_bertrand
16. lisbon_casa_fernando_pessoa
17. lisbon_biblioteca_nacional_de_portugal
18. lisbon_cemiterio_dos_prazeres
19. lisbon_praca_luis_de_camoes
20. lisbon_estatua_eca_de_queiros

## IDs translated/updated
All 20 worklist IDs above were translated and added in `data/i18n/content/places/en.json`.

All worklist IDs processed: yes (20/20)

## en.json entry count
- Before batch: 302
- After batch: 322

## Write/merge method
- Method used: tmp JSON + merge script
- Temporary file created (not committed): `tmp/i18n/batch-l-translations.json`
- Merge script read temp JSON from disk and merged into `data/i18n/content/places/en.json`

## Stamp result
From `node scripts/i18n-stamp-places.js en`:
- entries: 322
- hashes changed: 0
- translation IDs without master place: 0

## Post-batch audit status
From `node scripts/i18n-audit-places.js en`:
- OK: 322
- Missing: 42
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0

## Post-batch quality status
From `node scripts/i18n-quality-places.js en`:
- Entries checked: 322
- Entries with issues: 0
- Errors: 0
- Warnings: 0

## Scope confirmation
- data/places not changed
- data/places/manifest.json not changed
- runtime/CSS not changed
- scripts not changed
- data/leksikon not changed
- data/places/place_image_candidates.json not changed
- Civication files not changed
