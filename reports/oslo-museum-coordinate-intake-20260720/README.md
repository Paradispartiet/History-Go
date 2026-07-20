# Oslo museum completeness — coordinate intake closure

Date: 2026-07-20

## Status

**COMPLETE.**

The museum/visitor-source coordinate queue has been fully executed and every approved candidate has passed the required coordinate/identity production gate.

- Standard address-first candidates: **14 / 14 completed**
- Special coordinate-review candidates: **4 / 4 completed**
- Total approved candidate places: **18 / 18 produced**

The old queue instructions are retained conceptually by the committed result files and coordinate evidence. This document now records the completed state rather than presenting the work as pending.

## Standard Geonorge address-first result

All 14 standard candidates were run through the repository's normative command:

```bash
npm run places:coords:find:address -- --address "<address>"
```

Exact terminal output and parsed results are stored under:

`reports/oslo-museum-coordinate-intake-20260720/results/`

Every standard query returned a `verified_candidate` before canonical production:

1. `norsk_folkemuseum` — Museumsveien 10
2. `norsk_maritimt_museum` — Bygdøynesveien 37
3. `historisk_museum` — Frederiks gate 2
4. `frogner_hovedgard` — Halvdan Svartes gate 58
5. `arbeidermuseet` — Sagveien 28
6. `nobels_fredssenter` — Brynjulf Bulls plass 1
7. `kunstnernes_hus` — Wergelandsveien 17
8. `vigelandmuseet` — Nobels gate 32
9. `mollergata_skole` — Møllergata 49
10. `jodisk_museum_oslo` — Calmeyers gate 15B
11. `det_internasjonale_barnekunstmuseet` — Lille Frøens vei 4
12. `tbs_gallery` — Oscars gate 23
13. `viking_planet_oslo` — Fridtjof Nansens plass 4
14. `the_salmon_vitensenter` — Strandpromenaden 11

A `verified_candidate` was promoted only after address identity, intended physical place and duplicate/overlap scope were checked.

## Special coordinate-review result

### `ibsen_museum_teater`

- Current public visitor address: Henrik Ibsens gate 26.
- Historical apartment address: Arbins gate 1.
- Normative Geonorge result: `geonorge-adresser-v1:0301:21471:26`.
- Decision: use Henrik Ibsens gate 26 as display/unlock marker; preserve Arbins gate 1 explicitly as the historical apartment layer.
- Final production: Oslo coordinate batch 50.

The dedicated intake evidence is stored under:

`reports/oslo-museum-special-coordinate-audit-20260720/ibsen-geonorge/`

### `norges_hjemmefrontmuseum`

- Physical identity: Akershus festning, building 21 / Det dobbelte batteri.
- Coordinate source: exact OSM building geometry `osm-way:111833902` cross-checked against the official building identity.
- Decision: use the internal building anchor, not the broad `akershus_festning` marker.
- Final production: recorded through the museum special-coordinate production and after-registered in Oslo coordinate batch 41.

### `forsvarsmuseet`

- Physical identity: Akershus festning, building 62 / Hovedarsenalet.
- Coordinate source: exact OSM building geometry `osm-way:54830211` cross-checked against the official building identity.
- Decision: use the internal building anchor, not the broad `akershus_festning` marker.
- Final production: recorded through the museum special-coordinate production and after-registered in Oslo coordinate batch 41.

### `roseslottet`

- Coordinate source: named site geometry `osm-way:1004591108`.
- Decision: use the installation site center, not Frognerseteren station as a proxy.
- Current-status rule: the installation is time-limited and should not be assumed permanent beyond the currently documented 2026 plan.
- Final production: recorded through the museum special-coordinate production and after-registered in Oslo coordinate batch 41.

## Status-sensitive production rules retained

Coordinate verification describes a physical place and source identity; it does not guarantee that a venue is currently open.

- `jodisk_museum_oslo`: physical location verified; museum building closed for renovation from 1 May 2026 with estimated reopening autumn 2028.
- `det_internasjonale_barnekunstmuseet`: physical location verified; ordinary opening suspended since 8 December 2025 with no fixed reopening date as of 20 July 2026.
- `roseslottet`: verified time-limited installation, currently planned through the end of 2026.
- `ibsen_museum_teater`: public entrance and historical-home address remain separate semantic layers.

## Validation gates completed

The production batches were accepted only after the relevant repository checks passed, including:

1. source/runtime place-index parity;
2. split-manifest synchronization;
3. coordinate source contract;
4. coordinate quality gate;
5. strict-new coordinate intake;
6. coordinate-evidence audit;
7. place health;
8. diff whitespace validation;
9. coordinate-control protocol update in the completed batch sequence.

## Final state

The queue that originally contained 14 standard candidates and 4 special-coordinate candidates is now exhausted.

The last approved candidate, `ibsen_museum_teater`, was produced in Oslo coordinate batch 50. The coordinate-control protocol reports **196 verified or source-controlled canonical Oslo places** after completion of this museum pass.

Future Oslo completeness work should move to a different source family rather than re-running this completed museum queue.
