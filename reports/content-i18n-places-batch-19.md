# Content i18n places batch 19

## Status
- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Builds on batch 18 and on the resumed work documented in
  `reports/i18n-en-resume-2026-08.md`.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Changed files:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-19.md`

## Selection method
- Worklist generated with
  `node dist/scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=5000 --out=tmp/i18n/places-en-worklist-batch-19.json`.
- Selected the first 20 Oslo entries with status `stale`.
- **Deviation from batches 4–18, deliberate:** those batches selected
  `missing` placeIds and explicitly excluded stale translation-only IDs.
  That exclusion made sense when stale was 0. It no longer is: the place
  data has grown and 336 entries per language carried translations far
  shorter than their current Norwegian source (typically ~120 English
  words against ~400 Norwegian). Stale entries are already visible in the
  app in a degraded form, so they were prioritised over missing ones,
  which fall back to Norwegian. Oslo was taken first because it is the
  main game board.

## Status before batch
From `node dist/scripts/i18n-audit-places.js <lang>`, identical for all
three languages:
- Master places: 1543
- OK: 391
- Missing: 816
- Stale: 336
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

## Worklist IDs
1. gamlebyen_gravlund
2. akershus_festning
3. gamle_aker_kirke
4. var_frelsers_gravlund
5. hovedoya_kloster
6. villa_grande
7. bogstad_gard
8. mollergata_19
9. sagene_skole
10. oslo_domkirke
11. damstredet_telthusbakken
12. gamle_trikkestallen
13. slottet
14. sofienberg_kirke
15. trefoldighetskirken
16. nonneseter_kloster
17. oslo_ladegard
18. galgeberg
19. oslo_hospital
20. botsfengselet

## IDs translated/updated
All 20 worklist IDs above were translated/updated in en.json, es.json
and pt.json.

**All worklist IDs processed: yes (20/20 × 3 languages = 60 entries)**

`gamle_aker_kirke` was initially skipped in the middle of the batch and
caught by a completeness check against the worklist before the batch was
closed. The check compares every worklist `sourceHash` against the hash
now stored in each dictionary; it is worth repeating at the end of a
batch rather than trusting the running order.

## Entry counts
Unchanged at 731 in each of en.json, es.json and pt.json — this batch
refreshed existing stale entries rather than adding new IDs.

## Stamp result
From `node dist/scripts/i18n-stamp-places.js <lang>`, identical for all
three:
- entries: 731
- hashes changed: 0
- translation IDs without master place: 4
- stale hashes left untouched: 316

`hashes changed: 0` confirms the merge wrote the correct `_sourceHash`
for every entry. See `reports/i18n-en-resume-2026-08.md` for why the
stamper no longer overwrites a mismatched hash without `--restamp-stale`.

## Audit result after batch
Identical for en, es and pt:
- OK: 411
- Missing: 816
- Stale: 316
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

## Quality result after batch
All 20 batch IDs are clean in all three languages — no errors, no
warnings. Paragraph structure and length follow the Norwegian source, so
`popup_much_shorter` and `paragraphs_collapsed` are not triggered.

## Write/merge method
- Used **tmp JSON + merge script** method, as in batches 4–18.
- Per-language batch files written to the scratchpad, then merged into
  the dictionaries with a small Node script.
- No large inline translation text injected directly via JS command
  arguments.

## Scope confirmation
- `data/places` not changed.
- `data/places/manifest.json` not changed.
- runtime/CSS not changed.
- scripts not changed.
- leksikon not changed.
- `data/places/place_image_candidates.json` not changed.
- Civication files not changed.
- coordinate files/reports/scripts not changed.
