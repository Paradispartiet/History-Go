# Content i18n places batch 22

## Status
- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Builds on batch 21.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Changed files:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-22.md`

## Selection method
- Worklist generated with
  `node dist/scripts/i18n-worklist-places.js en --only=stale --limit=5000 --out=tmp/i18n/places-en-worklist-batch-22.json`.
- Selected the first 20 Oslo entries with status `stale`, continuing the
  priority established in batch 19: stale entries are already visible in
  the app in a degraded form, while missing ones fall back to Norwegian.
- Source volume for the batch: 1997 Norwegian words — noticeably lighter
  than batch 21 (6374), because these records are short factual place
  anchors rather than long source-critical essays.
- Themes fall out of the worklist order, not from curation: industry and
  commerce in the city centre, then the Alna river and Groruddalen, then
  Nydalen and the Akerselva.

## Remaining stale by region
Checked while generating the worklist, since batches 19–21 had drawn
down the Oslo stale pool:
- oslo: 114
- innlandet: 71
- ostfold: 44
- akershus: 38
- buskerud: 5
- europa/europe: 4

Oslo still has enough stale entries for several more batches at this
size.

## Status before batch
Identical for all three languages:
- Master places: 1543
- OK: 451
- Missing: 816
- Stale: 276
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

## Worklist IDs
1. grunnlovsbygget_bankplassen
2. oslo_mek
3. st_halvard_bryggeri
4. oslo_kornmagasin
5. oslo_kraftselskap
6. grensen_kjopesenter
7. vippetangen_fisketorg
8. norges_varemesse
9. lilleborg_fabrikker
10. alnaelva
11. alnaelvstien
12. trosterud_friomrade
13. furuset_haugerud_skogbelte
14. hellerud_gard
15. alnabru_jernbane_og_logistikk
16. frysjadammen
17. seilduksfabrikken_nydalen
18. nydalsdammen
19. stilla_nydalen
20. bjoelsenfossen

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
- stale hashes left untouched: 256

`hashes changed: 0` confirms the merge wrote the correct master hashes
directly, so the stamper had nothing to correct.

## Audit result after batch
Identical for en, es and pt:
- OK: 471
- Missing: 816
- Stale: 256
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

Stale fell by exactly 20, matching the batch size.

## Quality result after batch
All 20 batch IDs are clean in all three languages — no errors, no
warnings.

## Note on anchor and naming caveats
A large share of this batch consists of records whose Norwegian source
exists mainly to state what the marker does and does not claim, and
those caveats were translated in full rather than trimmed as
boilerplate:

- **Address point ≠ preserved building** — `st_halvard_bryggeri` uses
  the official address point as a historical anchor, explicitly not as
  a claim that a 1877 building survives there.
- **Building ≠ institution** — `oslo_kraftselskap` is the 1931
  headquarters, not Oslo Lysverker as an abstraction, the grid, or the
  1892 power station.
- **Building ≠ area** — `vippetangen_fisketorg` is the Fish Hall at
  Akershusstranda 23, not the whole of Vippetangen.
- **Gate as display anchor** — `lilleborg_fabrikker` anchors on the
  documented factory gate, not the geometric centre of the former
  industrial area.
- **Internal anchor ≠ centre** — `furuset_haugerud_skogbelte` anchors on
  a mapped cycle track inside Haugerudparken.
- **Register anchor ≠ provenance** — `hellerud_gard` documents where the
  historical farm site sits in today's land register, explicitly not
  that the standing building is the eighteenth-century original.
- **Segment ≠ whole route** — `alnaelvstien` models a mapped 1.64 km
  component, not every path along the Alna.
- **Period-bounded record** — `norges_varemesse` covers the Sjølyst site
  1962–2002, not the foundation since 1920 nor today's NOVA Spektrum.

Three records additionally carry a correction where the technical ID no
longer matches the true place name, and the Norwegian source says so
explicitly. Those explanations are translated intact, since dropping
them would leave the ID looking like an error:

- `seilduksfabrikken_nydalen` is the Upper Spinning Mill of Nydalens
  Compagnie, **not** Christiania Seildugsfabrik at Øvre Foss.
- `stilla_nydalen` is the river stretch below Nydalsdammen; the name
  *Stilla* belongs to the upper Akerselva bathing pools. The display
  name was corrected without moving the coordinate.
- `trosterud_friomrade` is Lille Wembley, a real named place, replacing
  a synthetic area name.

Alternative names are handled the same way: `alnaelva` states that
*Loelva* is a historical name for the same river and not a separate
watercourse.

## Write/merge method
- Used **tmp JSON + merge script** method, as in batches 4–21.
- Per-language batch files written to the scratchpad in two parts of ten,
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
