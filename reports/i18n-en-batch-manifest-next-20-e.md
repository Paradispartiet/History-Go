# EN i18n batch E (manifest next 20)

Date: 2026-05-02
Language: en

## Worklist command

```bash
node scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=20 --out=tmp/i18n/places-en-worklist-manifest-next-20-e.json
```

## Worklist IDs

1. lilleborg_fabrikker
2. akerselva_industri
3. alnaelva
4. alnaelvstien
5. loelva_historisk
6. trosterud_friomrade
7. furuset_haugerud_skogbelte
8. hellerud_gard
9. alnabru_jernbane_og_logistikk
10. frysjadammen
11. nydalen_industristed
12. seilduksfabrikken_nydalen
13. nydalsdammen
14. stilla_nydalen
15. bjoelsenfossen
16. bjoelsenparken_elvenaer
17. glads_molle
18. voienfossen
19. voien_gard_voienvolden
20. myralokka

## IDs translated/updated

1. lilleborg_fabrikker
2. akerselva_industri
3. alnaelva
4. alnaelvstien
5. loelva_historisk
6. trosterud_friomrade
7. furuset_haugerud_skogbelte
8. hellerud_gard
9. alnabru_jernbane_og_logistikk
10. frysjadammen
11. nydalen_industristed
12. seilduksfabrikken_nydalen
13. nydalsdammen
14. stilla_nydalen
15. bjoelsenfossen
16. bjoelsenparken_elvenaer
17. glads_molle
18. voienfossen
19. voien_gard_voienvolden
20. myralokka

All worklist IDs processed: yes (20/20)

## en.json entries count

- Before batch E: 142
- After batch E: 162

## Stamp result

Command:
```bash
node scripts/i18n-stamp-places.js en
```

Result:
- entries: 162
- hashes changed: 0
- translation IDs without master place: 0

## Audit result

Command:
```bash
node scripts/i18n-audit-places.js en
```

- OK: 162
- Missing: 120
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0

## Quality result

Command:
```bash
node scripts/i18n-quality-places.js en
```

- Entries checked: 162
- Entries with issues: 0
- Errors: 0
- Warnings: 0

## Scope checks

- data/places not changed
- manifest not changed
- runtime/CSS not changed
- scripts not changed
- leksikon not changed
- place_image_candidates not changed
