# EN i18n batch manifest next 20 B

## Worklist command
`node scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=20 --out=tmp/i18n/places-en-worklist-manifest-next-20-b.json`

## Worklist IDs
1. camilla_collett_statue
2. henrik_wergeland_statue
3. grotta
4. nationaltheatret
5. litteraturhuset
6. tronsmo_bokhandel
7. eldorado_bokhandel
8. gamle_deichman
9. deichman_grunerlokka
10. kulturkirken_jakob_litteratur
11. norli_universitetsgata
12. sigrid_undset_statue
13. ruth_maier_minne
14. alf_proysen_statue_nittedal
15. proysenhuset_rudshogda
16. inger_hagerups_plass
17. oscar_braaten_statuen
18. alexander_kiellands_plass
19. eldorado_esport
20. good_game_redaksjon

## IDs translated/updated
1. camilla_collett_statue
2. henrik_wergeland_statue
3. grotta
4. nationaltheatret
5. litteraturhuset
6. tronsmo_bokhandel
7. eldorado_bokhandel
8. gamle_deichman
9. deichman_grunerlokka
10. kulturkirken_jakob_litteratur
11. norli_universitetsgata
12. sigrid_undset_statue
13. ruth_maier_minne
14. alf_proysen_statue_nittedal
15. proysenhuset_rudshogda
16. inger_hagerups_plass
17. oscar_braaten_statuen
18. alexander_kiellands_plass
19. eldorado_esport
20. good_game_redaksjon

All worklist IDs processed: yes (20/20)

## en.json entries before/after
- Before: 82
- After: 102

## Stamp result
Command: `node scripts/i18n-stamp-places.js en`
- entries: 102
- hashes changed: 0
- translation IDs without master place: 0

## Audit result
Command: `node scripts/i18n-audit-places.js en`
- OK: 102
- Missing: 180
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0

## Quality result
Command: `node scripts/i18n-quality-places.js en`
- Entries checked: 102
- Entries with issues: 0
- Errors: 0
- Warnings: 0

## Scope checks
- data/places ikke endret
- manifest ikke endret
- runtime/CSS ikke endret
- scripts ikke endret
- leksikon ikke endret
- place_image_candidates ikke endret
