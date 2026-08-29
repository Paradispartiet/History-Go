# Content i18n places batch 20

## Status
- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Builds on batch 19.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Changed files:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-20.md`

## Selection method
- Worklist generated with
  `node dist/scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=5000 --out=tmp/i18n/places-en-worklist-batch-20.json`.
- Selected the first 20 Oslo entries with status `stale`, continuing the
  priority established in batch 19 and documented there: stale entries
  are already visible in the app in a degraded form, while missing ones
  fall back to Norwegian.
- The batch turned out to be thematically coherent without being chosen
  for theme — culture and literature institutions, museums, theatres,
  bookshops, libraries and author monuments. That follows from the order
  of the worklist, not from a curatorial decision.

## Status before batch
Identical for all three languages:
- Master places: 1543
- OK: 411
- Missing: 816
- Stale: 316
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

## Worklist IDs
1. prinds_christian_augusts_minde
2. gamle_radhus
3. nationaltheatret
4. det_norske_teatret
5. latter
6. folketeateret
7. nasjonalmuseet
8. munch_museet
9. astrup_fearnley
10. ekebergparken
11. ibsen_quotes
12. nasjonalbiblioteket
13. camilla_collett_statue
14. henrik_wergeland_statue
15. grotta
16. litteraturhuset
17. tronsmo_bokhandel
18. eldorado_bokhandel
19. gamle_deichman
20. deichman_grunerlokka

## IDs translated/updated
All 20 worklist IDs above were translated/updated in en.json, es.json
and pt.json.

**All worklist IDs processed: yes (20/20 × 3 languages = 60 entries)**

Verified with the completeness check introduced in batch 19: every
worklist `sourceHash` was compared against the hash now stored in each
dictionary, in all three languages, before the batch was closed.

## Entry counts
Unchanged at 731 in each of en.json, es.json and pt.json — this batch
refreshed existing stale entries rather than adding new IDs.

## Stamp result
From `node dist/scripts/i18n-stamp-places.js <lang>`, identical for all
three:
- entries: 731
- hashes changed: 0
- translation IDs without master place: 4
- stale hashes left untouched: 296

## Audit result after batch
Identical for en, es and pt:
- OK: 431
- Missing: 816
- Stale: 296
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

## Quality result after batch
All 20 batch IDs are clean in all three languages — no errors, no
warnings.

## Note on source register
Several entries in this batch are written in an explicitly
source-critical register, addressing the reader directly and warning
against confusing a monument with a workplace, a plan with a completed
project, or a curated selection with a complete canon. That register was
preserved in translation rather than flattened into neutral description,
since it carries the editorial intent of the Norwegian source.

## Write/merge method
- Used **tmp JSON + merge script** method, as in batches 4–19.
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
