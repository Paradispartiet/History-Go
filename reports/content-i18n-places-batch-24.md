# Content i18n places batch 24

## Status
- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Builds on batch 23.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Changed files:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-24.md`

## Selection method
- Worklist generated with
  `node dist/scripts/i18n-worklist-places.js en --only=stale --limit=5000 --out=tmp/i18n/places-en-worklist-batch-24.json`.
- Selected the first 20 Oslo entries with status `stale` **whose Norwegian
  master is 90 source words or longer**, continuing the priority
  established in batch 19 and the thin-source hold-back introduced in
  batch 23.
- Source volume for the batch: 4052 Norwegian words — the heaviest batch
  so far, roughly double batch 23.

## Thin-source hold-back, continued from batch 23

Batch 23 established that records with very short Norwegian masters
should not be translated yet, because the Norwegian is to be expanded
first and any translation written now would go stale again immediately.
That rule is applied as a filter here rather than as a mid-batch
discovery.

- Threshold used: **under 90 source words** (`desc` + `popupDesc`).
- Records skipped by the filter in this batch's Oslo pool: **29**,
  in addition to the 6 already held back in batch 23.
- All 20 records translated here run 95–369 source words.

The 35 held-back Oslo records are still counted as `stale` and are not
lost; they return to the worklist as soon as their Norwegian masters are
expanded and re-hashed.

## Status before batch
Identical for all three languages:
- Master places: 1543
- OK: 485
- Missing: 816
- Stale: 242
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

## Worklist IDs
1. svartdalen
2. kvaernerbyen_alna
3. alna_utlop_bjorvika
4. stortinget
5. oslo_radhus
6. eidsvolls_plass
7. tinghuset
8. hoyesteretts_hus
9. politihuset_gronland
10. blitzhuset
11. kafe_haerverk
12. brenneriveien_ingens_gate
13. gamlebyen_sport_og_fritid
14. oslo_skatehall
15. xray_ungdomskulturhus
16. vaterland_bar_scene
17. helvete_neseblod_records
18. sub_scene
19. universitetets_gamle_hovedbygning
20. universitetets_gamle_kjemi

## IDs translated/updated
All 20 worklist IDs above were translated/updated in en.json, es.json
and pt.json.

**All worklist IDs processed: yes (20/20 × 3 languages = 60 entries)**

Verified with the completeness check introduced in batch 19: every
worklist `sourceHash` was compared against the hash now stored in each
dictionary, in all three languages, and each entry was checked for a
non-empty `name`, `desc` and `popupDesc`. Result: 0 problems across 60
entries.

## Entry counts
Unchanged at 731 in each of en.json, es.json and pt.json — this batch
refreshed existing stale entries rather than adding new IDs.

## Stamp result
From `node dist/scripts/i18n-stamp-places.js <lang>`, identical for all
three:
- entries: 731
- hashes changed: 0
- translation IDs without master place: 4
- stale hashes left untouched: 222

## Audit result after batch
Identical for en, es and pt:
- OK: 505
- Missing: 816
- Stale: 222
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

Stale fell by exactly 20, matching the batch size. OK passes 500 for the
first time.

## Quality result after batch
All 20 batch IDs are clean in all three languages — no errors, no
warnings.

## Note on the institutional records
Six records in this batch (`stortinget`, `oslo_radhus`,
`eidsvolls_plass`, `tinghuset`, `hoyesteretts_hus`,
`politihuset_gronland`) plus the two university records are long,
carefully argued civics texts of roughly 350 words each. Three features
of that register were preserved rather than smoothed:

- **The separation-of-powers boundaries are load-bearing, not filler.**
  Each record states explicitly what it is *not*: the Storting building
  is not Eidsvolls plass, Oslo City Hall is not the national institutions,
  the Supreme Court Building is not Oslo Courthouse, the police
  headquarters is neither the borough of Grønland nor the courts. Several
  sources say the distinction must be kept clear "in text and quiz". These
  cross-references form a small network and were translated consistently
  across all six records so the network survives in each language.
- **The self-critical turn.** Each institutional record ends by
  undercutting its own monument: architecture "proves no scholarly claim",
  the courts' legitimacy "depends on more than monumental architecture",
  the police's legitimacy "must be continually maintained, not merely
  assumed". This is the editorial point of the records and was kept in
  full.
- **Explicit conduct limits.** `politihuset_gronland` forbids asking for
  personal data, photographing security-critical details and speculating
  about particular criminal cases, and forbids using the site to
  stigmatise the borough. `helvete_neseblod_records` states that questions
  must not glorify violence, killings, church burnings or extremism.
  These are instructions to the content, not description, and were
  translated as instructions.

`tinghuset` also carries unusually concrete physical detail — 32
projecting Fauske marble blocks, Lex Portalis at 32 × 4 metres over more
than 2,000 porcelain panels, around 60 courtrooms, the separate accessible
gate, the café on the second floor. All figures were carried across
unchanged.

## Write/merge method
- Used **tmp JSON + merge script** method, as in batches 4–23.
- Per-language batch files written to the scratchpad in five parts, sized
  to the source length (6 + 6 short records, then 3 + 3 + 2 long ones),
  then merged into the dictionaries with a small Node script.
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
