# EN i18n batch D (manifest next 20)

Date: 2026-05-02
Language: en

## Worklist command

```bash
node scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=20 --out=tmp/i18n/places-en-worklist-manifest-next-20-d.json
```

## Worklist IDs

1. ulven_handelspark
2. akershus_energi
3. sagene_kvernhus
4. ovre_foss
5. oslo_mek
6. schous_bryggeri
7. ringnes_bryggeri
8. st_halvard_bryggeri
9. oslo_kornmagasin
10. akershus_slott_bakeriet
11. jernbanetorget_trafikknutepunkt
12. oslo_kraftselskap
13. grensen_kjopesenter
14. vippetangen_fisketorg
15. frysja_industriomrade
16. norges_varemesse
17. bryn_industriomrade
18. gronlikaia
19. myrens_verksted
20. christiania_seildugsfabrik

## IDs translated/updated in `en.json`

1. ulven_handelspark
2. akershus_energi
3. sagene_kvernhus
4. ovre_foss
5. oslo_mek
6. schous_bryggeri
7. ringnes_bryggeri
8. st_halvard_bryggeri
9. oslo_kornmagasin
10. akershus_slott_bakeriet
11. jernbanetorget_trafikknutepunkt
12. oslo_kraftselskap
13. grensen_kjopesenter
14. vippetangen_fisketorg
15. frysja_industriomrade
16. norges_varemesse
17. bryn_industriomrade
18. gronlikaia
19. myrens_verksted
20. christiania_seildugsfabrik

All worklist IDs processed: yes (20/20)

## `en.json` entries before/after

- Before batch D: 122
- After batch D: 142
- Net change: +20

## Stamp result

Command:

```bash
node scripts/i18n-stamp-places.js en
```

Result:
- entries: 142
- hashes changed: 0
- translation IDs without master place: 0

## Audit result

Command:

```bash
node scripts/i18n-audit-places.js en
```

- OK: 142
- Missing: 140
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0

## Quality result

Command:

```bash
node scripts/i18n-quality-places.js en
```

- Entries checked: 142
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
