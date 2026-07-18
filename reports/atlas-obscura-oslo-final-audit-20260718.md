# Atlas Obscura Oslo — final completeness audit

Date: 2026-07-18

Atlas Obscura list audited: 32 Oslo entries.

## Summary

| Outcome | Count |
| --- | ---: |
| Already represented by a canonical History Go place | 5 |
| Added as a new canonical History Go place | 12 |
| Added as a Wonderkammer `actual_site_treasure` under an existing parent place | 11 |
| Intentionally deferred or excluded | 4 |
| **Total** | **32** |

The central finding from the audit was that History Go already covered many of Oslo's major institutions and areas, but had weaker coverage of small, named, physically discoverable objects and unusual site-specific places. The audit therefore produced both new canonical places and a new set of Wonderkammer microplace batches rather than creating unnecessary duplicate map markers.

## 1. Already represented before the audit

| Atlas Obscura entry | History Go representation | Decision |
| --- | --- | --- |
| Vigeland Sculpture Park | `vigelandsparken` | Existing canonical place retained. |
| Oslo Opera House | `operahuset` | Existing canonical place retained. |
| Holmenkollen Ski Jump | `holmenkollen_nasjonalanlegg` / existing Holmenkollen coverage | Existing canonical place retained. |
| Damstredet & Telthusbakken | `damstredet_telthusbakken` | Existing canonical place retained. |
| Neseblod Records | `helvete_neseblod_records` | Existing canonical place retained; duplicate explicitly avoided. |

## 2. Added as new canonical places

| Atlas Obscura entry | New History Go ID | Representation notes |
| --- | --- | --- |
| Emanuel Vigeland Mausoleum | `emanuel_vigeland_mausoleum` | Kunst: artist mausoleum, fresco total artwork and acoustic space. |
| Kon-Tiki Museum | `kon_tiki_museet` | Historie: expedition history with explicit source criticism around Heyerdahl's disputed theories. |
| Forest of the Future Library | `framtidsbiblioteket_nordmarka` | Kunst: century-long conceptual work connecting forest, literature and future readers. |
| Gol Stave Church | `gol_stavkirke_bygdoy` | Historie: medieval building plus 19th-century relocation and reconstruction history. |
| Fram Museum | `frammuseet` | Historie: polar exploration, ship technology, science and expedition history. |
| Korketrekkeren | `korketrekkeren` | Sport: route-start anchor at Frognerseteren; 2.7 km route and competitive luge history. |
| St. Hallvard's Church and Monastery | `st_hallvard_kirke_kloster` | Historie: modern Catholic history and major Lund & Slaatto architecture. |
| Kjærlighetskarusellen | `kjaerlighetskarusellen` | Historie: protected functionalist structure and concrete queer urban history. |
| FLOP Museum | `flop_museum` | Næringsliv: innovation, product-market fit, design choices, risk and learning from failure. |
| Nordisk Bibelmuseum | `nordisk_bibelmuseum` | Historie: book, source, print and translation history rather than devotional framing. |
| Black Death Monument / Peststøtten | `peststotten_krist_kirkegard` | Historie: epidemic history and material memory at Krist kirkegård. |
| Villa Stenersen | `villa_stenersen` | Historie: functionalism, art collecting, state ownership and cultural-heritage preservation. |

## 3. Added as Wonderkammer microplaces

These Atlas entries are physically discoverable and named, but belong inside stronger existing parent places. They are represented as `actual_site_treasure` chambers rather than duplicate map markers.

| Atlas Obscura entry | Parent place | Wonderkammer representation |
| --- | --- | --- |
| Grass Roots Square | `regjeringskvartalet` | Current 2026 placement at Einar Gerhardsens plass; old Teatergata Atlas location explicitly treated as outdated. |
| Edvard Munch's Grave | `var_frelsers_gravlund` | Physical memorial trace handled respectfully as a grave and cultural-history object. |
| She Lies | `operahuset` | Floating Monica Bonvicini sculpture and changing relationship to water, light and Opera architecture. |
| The Devil of Oslo | `oslo_domkirke` | Medieval relief interpreted cautiously; popular devil name not presented as certain iconography. |
| Santa | `ekebergparken` | Paul McCarthy work framed through ambiguity, popular icons and consumer-culture criticism. |
| The Scream View | `ekebergparken` | Viewpoint plus Marina Abramović frame; explicitly does not claim a proven exact Munch standing point. |
| Myth (Sphinx)—Kate Moss | `folketeateret` | Public sculpture in Folketeaterpassasjen; source-confidence note retained for Oslo provenance. |
| Glory Glory with Crutches | `akershus_festning` | War, vulnerability and the contrast with the military setting; Oslo provenance marked for future institutional-source strengthening. |
| French Toilets of Spikersuppa / Liberté | `spikersuppa` | Lars Ramberg's public-art/toilet architecture and political symbolism. |
| Donald Trump Bench | `oslo_bussterminal` | 1980s New York-themed Galleri Oslo furniture; not described as an originally presidential monument. |
| Untuned Bell | `radhusplassen` | Interactive A K Dolven sound artwork using the former out-of-tune City Hall bell. |

Wonderkammer source files created during the audit:

- `data/wonderkammer/atlas_obscura_oslo_microplaces_batch_1.json`
- `data/wonderkammer/atlas_obscura_oslo_microplaces_batch_2.json`
- `data/wonderkammer/atlas_obscura_oslo_microplaces_batch_3.json`
- `data/wonderkammer/atlas_obscura_oslo_microplaces_batch_4.json`

All are registered in `data/wonderkammer/index.json` and merge into existing parent-place chambers at runtime.

## 4. Intentionally deferred or excluded

| Atlas Obscura entry | Decision | Reason |
| --- | --- | --- |
| Viking Ship Museum | Deferred | The old museum listing is outdated. The ships and sleds have been moved into the new Viking Age Museum, which is still under construction and planned to open to the public in 2027. A future `vikingtidsmuseet_bygdoy` record should carry explicit opening-status metadata. |
| The Mini Bottle Gallery | Deferred, low priority | The collection remains active, but the venue is also strongly positioned as an event and hospitality venue. It is a weaker History Go addition than the cultural-history, art and innovation gaps addressed first. |
| Hrimnir Ramen | Excluded from this place pass | Primarily a restaurant. It should only become a place if History Go deliberately establishes a food/cuisine category or a broader culinary-culture place policy. |
| Norwegian Museum of Magic | Excluded as active place | Atlas Obscura marks it permanently closed. It should not be represented as a currently visitable canonical place without a separate historical-closed-place model. |

## Important corrections to Atlas Obscura

### Grass Roots Square

The old Atlas location at Teatergata/R6 is no longer current. The work has been restored, recomposed and moved to Einar Gerhardsens plass in the new Government Quarter. History Go records the current placement.

### Viking Ship Museum

The Atlas name represents the former museum state. History Go should not add it as a currently open attraction. The successor is the new Viking Age Museum, planned to open in 2027.

## Coordinate and data-integrity approach

- Concrete institutions with Norwegian visitor addresses used the repository's normative address-first method with Geonorge before other coordinate sources.
- Korketrekkeren uses an explicit `route_start` at Frognerseteren instead of an arbitrary midpoint along the 2.7 km route.
- Small artworks, graves, reliefs and urban details attached to existing places were represented in Wonderkammer instead of receiving duplicate canonical map points.
- Existing canonical records were audited before additions to avoid duplicates, most notably `helvete_neseblod_records`.
- Generated `places_index.json`, split data and validation reports were rebuilt through repository workflows where required.

## Pull requests produced by the audit

- #2286 — history batch 1
- #2290 — art batch 2
- #2304 — history batch 3
- #2307 — Korketrekkeren sport batch
- #2311 — Bygdøy history batch
- #2312 — Nordisk Bibelmuseum
- #2313 — FLOP Museum
- #2315 — Wonderkammer microplaces batch 1
- #2319 — Wonderkammer microplaces batch 2
- #2321 — Wonderkammer microplaces batch 3
- #2322 — Wonderkammer microplaces batch 4

All of the above were merged during the audit.

## Result

The Atlas Obscura Oslo list is now fully classified against History Go as of 2026-07-18. No Atlas entry remains unaudited. Future work should focus on independent Oslo completeness beyond Atlas Obscura rather than repeatedly reprocessing this 32-entry list.
