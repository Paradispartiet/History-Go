# Content i18n places batch 25

## Status
- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Builds on batch 24.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Changed files:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-25.md`

## Selection method
- Worklist generated with
  `node dist/scripts/i18n-worklist-places.js en --only=stale --limit=5000 --out=tmp/i18n/places-en-worklist-batch-25.json`.
- Selected the first 20 Oslo entries with status `stale` and a Norwegian
  master of **90 source words or longer**, continuing the priority from
  batch 19 and the thin-source hold-back from batch 23, applied as a
  filter since batch 24.
- Source volume: **7245 Norwegian words** — by far the heaviest batch so
  far, close to double batch 24 (4052) and three times batch 23 (2382).
- Sixteen of twenty records are `vitenskap`, one `psykologi`, three `by`.
  Every record runs 340–394 source words. That concentration is not
  curation: the science records were written as a single long-form set
  and therefore all cleared the 90-word filter together.

## Oslo is nearly exhausted

Measured after this batch, on the same worklist:

| region | stale |
| --- | --- |
| innlandet | 71 |
| ostfold | 44 |
| oslo | 40 |
| akershus | 38 |
| buskerud | 5 |
| europa/europe | 4 |

Of the 40 Oslo records still stale, **only 5 are 90 source words or
longer**; the other 35 are the thin masters held back since batch 23.

**Batch 26 will therefore have to leave Oslo.** The non-Oslo stale pool
holds 162 records, of which 106 are ≥90 words — Innlandet, Østfold and
Akershus are the natural next regions. This is a change of scope from
batches 19–25 and should be a deliberate decision rather than a silent
drift, since the Oslo focus has been consistent for seven batches.

## Status before batch
Identical for all three languages:
- Master places: 1543
- OK: 505
- Missing: 816
- Stale: 222
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

## Worklist IDs
1. tvergastein
2. gamlebyen_skole
3. abelhaugen
4. universitetet_i_oslo_blindern
5. naturhistorisk_museum
6. botanisk_hage
7. teknisk_museum
8. forskningsparken
9. rikshospitalet
10. radiumhospitalet
11. meteorologisk_institutt
12. oslo_met_pilestredet
13. arkitektur_og_designhogskolen
14. bi_nydalen
15. nobelinstituttet
16. observatoriet
17. psykologisk_institutt_uio
18. frognerparken
19. torshovdalen
20. kampen_park

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
- stale hashes left untouched: 202

## Audit result after batch
Identical for en, es and pt:
- OK: 525
- Missing: 816
- Stale: 202
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

Stale fell by exactly 20, matching the batch size, and drops below 210
for the first time.

## Quality result after batch
All 20 batch IDs are clean in all three languages — no errors, no
warnings.

## Note on the epistemological register
The science records in this batch share a single argumentative move,
repeated with variation: each one states what its site does **not**
prove. That is the editorial substance of the set, not padding, and was
translated in full rather than compressed.

- `abelhaugen` — the monument "is a source for commemorative culture, not
  an explanation of equations", and can turn mathematics into innate
  genius while hiding collaboration and institutions.
- `tvergastein` — "experience can open questions, while the arguments
  must still be assessed independently of the site's symbolic value";
  deep ecology is normative philosophy, not a theory provable by one
  measurement.
- `botanisk_hage` — a single cultivated plant does not prove how the
  whole species behaves in nature; bed placement is pedagogical, not
  ecological.
- `naturhistorisk_museum` — a specimen becomes evidence only when
  identity, find site, date, collector and treatment are traceable.
- `observatoriet` — "a measurement needs a reference system"; precision
  is a collective arrangement, not the property of one instrument.
- `arkitektur_og_designhogskolen` — "a beautiful visualisation can
  conceal resource use, inaccessibility or weak premises".
- `bi_nydalen` — where research ends and decision begins; a popular
  management idea "can be persuasive without being robust".
- `forskningsparken` — a promising experiment is not automatically a
  working product.
- `meteorologisk_institutt` — a forecast must be judged by what was
  knowable when it was made, not by the weather that later occurred.

Three records carry explicit conduct limits, translated as instructions
rather than description: `rikshospitalet` and `radiumhospitalet` both
state that History Go gives context and **not** diagnosis or treatment
advice, and that claims of breakthroughs must be checked against study
design, comparison group, publication and approval;
`psykologisk_institutt_uio` states that the app's psychology room is a
voluntary layer for learning and reflection, "not diagnosis, screening or
treatment", and that short exercises must not be used as a medical
conclusion.

## Note on two-time-layer records
Several records separate an institutional founding year from the age of
the standing buildings, and say so explicitly: `rikshospitalet` (1826 vs.
today's Gaustad complex — "two different layers of time"),
`psykologisk_institutt_uio` (1909 vs. the present building),
`gamlebyen_skole` (1881 as the school's own documented opening year,
distinct from the medieval cathedral school on the same ground). The same
containment logic seen in earlier batches also recurs:
`frognerparken` is not Vigelandsparken, `torshovdalen` is not
Torshovparken, `kampen_park` is not Plaskedammen alone, and
`universitetet_i_oslo_blindern` is not the whole university. All of these
were kept intact.

## Note on a scope flag left untouched
`tvergastein` states in its own Norwegian source that the file sits under
`vitenskap/oslo` while the coordinates and the Norwegian Mapping
Authority place the cabin in Hol municipality, and that the scope
classification must be checked separately. The translation carries that
statement across unchanged. It is a flag for the Norwegian side, not
something the translation track resolves.

## Write/merge method
- Used **tmp JSON + merge script** method, as in batches 4–24.
- Per-language batch files written to the scratchpad in seven parts of
  two or three records each, sized to the unusually long sources, then
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
