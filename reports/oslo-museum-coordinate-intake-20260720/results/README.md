# Oslo museum coordinate intake — Geonorge results

Date: 2026-07-20

This pass executes the repository's normative address-first finder for all 14 standard museum/place candidates from the merged intake queue. Every command's terminal output is saved alongside a parsed JSON result. No place coordinates are changed by this pass.

## Result

- Candidates checked: **14**
- Geonorge verified candidates: **14**
- Needs review / not found / errors: **0**

| placeId | address query | finder status | source object | reason |
|---|---|---|---|---|
| `norsk_folkemuseum` | Museumsveien 10 Oslo | verified_candidate | `geonorge-adresser-v1:0301:14899:10` | Geonorge returnerte ett tydelig adressetreff. |
| `norsk_maritimt_museum` | Bygdøynesveien 37 Oslo | verified_candidate | `geonorge-adresser-v1:0301:10977:37` | Geonorge returnerte ett tydelig adressetreff. |
| `historisk_museum` | Frederiks gate 2 Oslo | verified_candidate | `geonorge-adresser-v1:0301:11941:2` | Geonorge returnerte flere treff, men ett eksakt adressetreff. |
| `frogner_hovedgard` | Halvdan Svartes gate 58 Oslo | verified_candidate | `geonorge-adresser-v1:0301:12613:58` | Geonorge returnerte ett tydelig adressetreff. |
| `arbeidermuseet` | Sagveien 28 Oslo | verified_candidate | `geonorge-adresser-v1:0301:16135:28` | Geonorge returnerte ett tydelig adressetreff. |
| `nobels_fredssenter` | Brynjulf Bulls plass 1 Oslo | verified_candidate | `geonorge-adresser-v1:0301:18199:1` | Geonorge returnerte ett tydelig adressetreff. |
| `kunstnernes_hus` | Wergelandsveien 17 Oslo | verified_candidate | `geonorge-adresser-v1:0301:18496:17` | Geonorge returnerte ett tydelig adressetreff. |
| `vigelandmuseet` | Nobels gate 32 Oslo | verified_candidate | `geonorge-adresser-v1:0301:15080:32` | Geonorge returnerte ett tydelig adressetreff. |
| `mollergata_skole` | Møllergata 49 Oslo | verified_candidate | `geonorge-adresser-v1:0301:14943:49` | Geonorge returnerte ett tydelig adressetreff. |
| `jodisk_museum_oslo` | Calmeyers gate 15B Oslo | verified_candidate | `geonorge-adresser-v1:0301:11019:15B` | Geonorge returnerte ett tydelig adressetreff. |
| `det_internasjonale_barnekunstmuseet` | Lille Frøens vei 4 Oslo | verified_candidate | `geonorge-adresser-v1:0301:14283:4` | Geonorge returnerte ett tydelig adressetreff. |
| `tbs_gallery` | Oscars gate 23 Oslo | verified_candidate | `geonorge-adresser-v1:0301:15439:23` | Geonorge returnerte ett tydelig adressetreff. |
| `viking_planet_oslo` | Fridtjof Nansens plass 4 Oslo | verified_candidate | `geonorge-adresser-v1:0301:11993:4` | Geonorge returnerte ett tydelig adressetreff. |
| `the_salmon_vitensenter` | Strandpromenaden 11 Oslo | verified_candidate | `geonorge-adresser-v1:0301:21458:11` | Geonorge returnerte ett tydelig adressetreff. |

## Production gate

A `verified_candidate` means the address finder found an unambiguous official address representation point. Before a new canonical place is created, the point must still be checked against the intended physical building/institution and the no-duplicate/overlap decision from the museum completeness audit. Candidates that are temporarily closed or have uncertain reopening remain subject to their recorded status flags even when the coordinate is valid.
