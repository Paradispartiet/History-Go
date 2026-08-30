# Content i18n places batch 23

## Status
- Data-only translation batch.
- **14 of 20** worklist placeIds translated to en/es/pt.
- **6 placeIds deliberately held back** — see "Held back for Norwegian expansion".
- Builds on batch 22.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Changed files:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-23.md`

## Selection method
- Worklist generated with
  `node dist/scripts/i18n-worklist-places.js en --only=stale --limit=5000 --out=tmp/i18n/places-en-worklist-batch-23.json`.
- Selected the first 20 Oslo entries with status `stale`, continuing the
  priority established in batch 19.
- Source volume for the batch: 2382 Norwegian words.
- The batch is the Akerselva read as a continuous route — Bjølsen down
  through Sagene, Grünerløkka, Vaterland and out into Bjørvika — then the
  Alna's source and Groruddalen. That coherence falls out of the worklist
  order, not from curation.

## Held back for Norwegian expansion

Six records in this batch have unusually thin Norwegian masters. They are
**not translated in this batch** and remain `stale`, by decision: the
Norwegian source is to be expanded first, which will change each
`_sourceHash` and make any translation written now immediately stale
again.

| placeId | source words |
| --- | --- |
| `fossveien_elvestrekning` | 63 |
| `hausmannsomradet_elvelop` | 67 |
| `alnsjoen_alna_kilde` | 68 |
| `elvestrekning_bla_brenneriveien` | 74 |
| `groruddammen` | 84 |
| `vaterland_historisk_elvelop` | 89 |

For comparison, the fourteen translated records run 105–219 source words.

### Research gathered for those six

Collected while the batch was still scoped as "expand in translation",
before that approach was dropped. Recorded here so the work is not lost
when the Norwegian masters are expanded. **None of this is in the
translations** — every translated record in this batch is a faithful
rendering of its Norwegian master and adds nothing.

**`fossveien_elvestrekning`** — Grünerbrua is the Akerselva's oldest
bridge crossing, known from the 1200s and the only crossing over the
river until 1654; originally Akers Bro, later Møllebroen, a private
bridge leading to Kongens Mølle; the present name comes from Friedrich
Grüner, who bought Nedre Foss and Kongens mølle in 1672; the timber
bridge was burned by Charles XII in 1716; the current concrete bridge
dates from 1953. Christiania Seildugsfabrik at Fossveien 24 was founded
as a joint-stock company in 1856, began operating in 1858, red brick
complex by architect Peter H. Holtermann. Kunsthøgskolen i Oslo: the
administration and the performing arts faculty moved in 2003 (inaugurated
3 December 2003), the design and visual arts faculties in summer 2010;
conversion by Samark AS, interiors by Snøhetta.

**`hausmannsomradet_elvelop`** — Hausmannskvartalene is 15 quarters
bounded by Hausmanns gate, Storgata, Hammersborggata and Møllergata; a
flat grid between Hammersborghøyden and Akerselva, dominated by 1860s–70s
masonry buildings, low structures and tight streets. Fredrik Ferdinand
Hausmann (1693–1757) owned Ankerløkken from 1732. Hausmanns gate is about
750 metres long, running from Nylandsveien over Hausmanns bru to
Møllergata.

**`alnsjoen_alna_kilde`** — Alnsjøen lies in Lillomarka west of Ammerud
at 238 metres above sea level. It was dammed in 1927 as a drinking water
source and serves as a reserve drinking water source for Oslo; bathing,
fishing and other contamination are not permitted. (One source dates the
completion/commissioning to 1930 instead — the discrepancy should be
resolved before the year is used.) The Alna is 22.2 km long in total,
main watercourse 16.5 km, with inflow from Breisjøen via Breisjøelva,
Steinbruvann, Tokerudbekken and Østensjøvannet.

**`elvestrekning_bla_brenneriveien`** — Brenneriveien was laid out in
1854 and runs from Møllergata/Maridalsveien down a steep hill to
Grünerbrua; long also called Brenneribakken after that slope. **The
origin of the name is unknown** — Oslo byleksikon states this explicitly,
so the apparently obvious distillery etymology must not be asserted.
Industrial use: Halvor Schou ran a cotton weaving mill 1849–56; a textile
factory was rebuilt in 1913 for Nordisk Tekstil A/S; there were also a
brewery and a mechanical workshop. The textile building later became an
arts and culture venue and houses Blå.

**`groruddammen`** — Grorudparken opened 26 September 2013 and measures
119 decares, running along the Alnaelva from Grorud Senter under
Trondheimsveien, past Groruddammen and down towards Hølaløkka. Landscape
architect Link Landskap AS; main contractor Braathen landskapsentreprenør
AS. The technically demanding parts were flood protection of the river
course, cleaning of stormwater from Kalbakkveien and handling of
contaminated masses at Groruddammen.

**`vaterland_historisk_elvelop`** — the culverts were built 1964–1969 and
are roughly 600 metres long, as two parallel concrete and steel culverts.
Vaterlands bru was built around 1650 and was the only bridge into
Christiania for 175 years. The culvert work ended boat traffic in the
lower Akerselva, and over 200 mooring places belonging to Revierhavnens
Baatforening were moved to Hovedøya. Schweigaards bru and Bispebrua were
both demolished in 1962.

Sources consulted: Oslo byleksikon (`oslobyleksikon.no`),
lokalhistoriewiki.no, Norwegian Wikipedia, Akerselvas Venner
(`akerselvasvenner.no`).

### Naming discrepancy noted, not acted on

The master for `alnsjoen_alna_kilde` uses the display name **Alungsjøen**,
and `alnaelva` likewise says the river runs "fra Alungsjøen". Consulted
sources consistently spell the lake **Alnsjøen**. This was left untouched:
the translation track does not rename canonical places, per the
`alias/oversettelse endrer ikke objektets identitet` rule in
`docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md` § 14. It needs a
decision on the Norwegian side.

## Status before batch
Identical for all three languages:
- Master places: 1543
- OK: 471
- Missing: 816
- Stale: 256
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

## Worklist IDs
Translated in this batch:
1. bjoelsenparken_elvenaer
2. glads_molle
3. voienfossen
4. voien_gard_voienvolden
5. myralokka
6. kuba_parken
7. beierbrua
8. nedre_foss
9. vulkan_industriomrade
10. hausmannsbrua
11. ankerbrua
12. nybrua_vaterlandsparken
13. akerselva_utlop_bjorvika
14. alnaparken

Held back (see above):
15. elvestrekning_bla_brenneriveien
16. fossveien_elvestrekning
17. hausmannsomradet_elvelop
18. vaterland_historisk_elvelop
19. alnsjoen_alna_kilde
20. groruddammen

## IDs translated/updated
**Worklist IDs processed: 14/20 × 3 languages = 42 entries.**
The remaining 6 × 3 = 18 entries are intentionally left `stale`.

Verified with the completeness check introduced in batch 19: every
translated ID's `sourceHash` was compared against the hash now stored in
each dictionary, in all three languages, and each entry was checked for a
non-empty `name`, `desc` and `popupDesc`. The six held-back IDs were
checked in the opposite direction — confirmed still carrying their old
hashes, so none was updated by accident. Result: 0 problems.

## Entry counts
Unchanged at 731 in each of en.json, es.json and pt.json — this batch
refreshed existing stale entries rather than adding new IDs.

## Stamp result
From `node dist/scripts/i18n-stamp-places.js <lang>`, identical for all
three:
- entries: 731
- hashes changed: 0
- translation IDs without master place: 4
- stale hashes left untouched: 242

## Audit result after batch
Identical for en, es and pt:
- OK: 485
- Missing: 816
- Stale: 242
- Missing `_sourceHash`: 0
- Extra translation IDs: 4

Stale fell by exactly 14, matching the number translated. The six held
back are part of the remaining 242.

## Quality result after batch
All 14 translated IDs are clean in all three languages — no errors, no
warnings.

## Note on scope change mid-batch
This batch was briefly scoped to expand thin records with researched
facts in the translations only. That was reversed: it would have made
en/es/pt assert facts the Norwegian master does not carry, in a repo
where `data/places/**` is the source of truth. One sentence that had
already been merged into `myralokka` (municipal purchase from Myrens
Verksted in 1931, park laid out in the 1970s) was reverted in all three
languages before the batch was closed. No expanded text survives in the
committed dictionaries.

## Write/merge method
- Used **tmp JSON + merge script** method, as in batches 4–22.
- Per-language batch files written to the scratchpad in three parts, then
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
