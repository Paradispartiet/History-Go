# Content i18n places batch 21

## Status
- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Builds on batch 20.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Changed files:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-21.md`

## Selection method
- Worklist generated with
  `node dist/scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash --limit=5000 --out=tmp/i18n/places-en-worklist-batch-21.json`.
- Selected the first 20 Oslo entries with status `stale`, continuing the
  priority established in batch 19 and documented there: stale entries
  are already visible in the app in a degraded form, while missing ones
  fall back to Norwegian.
- Source volume for the batch: 6374 Norwegian words.
- As in batch 20, the batch is thematically coherent without being
  chosen for theme — author monuments, press newsrooms, concert venues
  and large infrastructure buildings. That follows from the order of the
  worklist, not from a curatorial decision.

## Status before batch
Identical for all three languages:
- Master places: 1543
- OK: 431
- Missing: 816
- Stale: 296
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

## Worklist IDs
1. kulturkirken_jakob_litteratur
2. norli_universitetsgata
3. sigrid_undset_statue
4. ruth_maier_minne
5. inger_hagerups_plass
6. oscar_braaten_statuen
7. alexander_kiellands_plass
8. vg_huset
9. nrk_huset_marienlyst
10. aftenposten_akersgata
11. dagbladet_akersgata
12. klassekampen_redaksjon
13. salt
14. blaa
15. rockefeller
16. john_dee
17. sentrum_scene
18. havnelageret
19. oslo_posthus
20. telegrafbygningen

## IDs translated/updated
All 20 worklist IDs above were translated/updated in en.json, es.json
and pt.json.

**All worklist IDs processed: yes (20/20 × 3 languages = 60 entries)**

Verified with the completeness check introduced in batch 19: every
worklist `sourceHash` was compared against the hash now stored in each
dictionary, in all three languages, and each entry was checked for a
non-empty `name`, `desc` and `popupDesc` before the batch was closed.
Result: 0 problems across 60 entries.

## Entry counts
Unchanged at 731 in each of en.json, es.json and pt.json — this batch
refreshed existing stale entries rather than adding new IDs.

## Stamp result
From `node dist/scripts/i18n-stamp-places.js <lang>`, identical for all
three:
- entries: 731
- hashes changed: 0
- translation IDs without master place: 4
- stale hashes left untouched: 276

`hashes changed: 0` confirms the merge wrote the correct master hashes
directly, so the stamper had nothing to correct.

## Audit result after batch
Identical for en, es and pt:
- OK: 451
- Missing: 816
- Stale: 276
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

Stale fell by exactly 20, matching the batch size.

## Quality result after batch
All 20 batch IDs are clean in all three languages — no errors, no
warnings.

## Note on venue identity in this batch
Six entries in the batch (salt, blaa, rockefeller, john_dee,
sentrum_scene and the three newsroom entries) carry an explicit
instruction in the Norwegian source about what the map marker anchors
to: the named venue rather than the surrounding district, and separate
canonical places rather than one merged marker even where venues share
an address, a promoter or infrastructure. Mariboes gate 5A and 5B
(John Dee and Rockefeller) are the clearest case. Those distinctions
are carried through in all three translations rather than smoothed away,
because collapsing them would contradict the repo's no-normalisation
rule.

## Note on source register
As in batch 20, several sources are written in an explicitly
source-critical register, addressing the reader directly and warning
against confusing a monument with a workplace, a plan with a completed
project, or a curated selection with a complete canon. The last three
entries (havnelageret, oslo_posthus, telegrafbygningen) additionally
separate documented facts from the quiz's explicit NOK scenarios. Both
registers were preserved in translation rather than flattened into
neutral description, since they carry the editorial intent of the
Norwegian source.

## Write/merge method
- Used **tmp JSON + merge script** method, as in batches 4–20.
- Per-language batch files written to the scratchpad in six parts, then
  merged into the dictionaries with a small Node script.
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
