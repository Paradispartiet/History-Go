# Etne politikk batch 1 — research and coordinate intake

## Scope

First dedicated `politikk` batch for Etne.

Selected candidates:

- `etne_tinghus`
- `etne_brannstasjon`
- `skanevik_brannstasjon`

## Duplicate gate

Current `main` was searched before file creation for the selected IDs and obvious name variants:

- Etne Tinghus / Tinghuset i Etne / `tinghuset_etne`
- Etne brannstasjon
- Skånevik brannstasjon

No existing canonical place records were found for the three selected candidates.

Existing nearby/cross-domain records must remain separate:

- `etnesjoen_tettstad` is an area-level settlement record, not the municipal administration building.
- `skakke_kultursenter_etne` is a canonical `kunst` place even though current political meetings can temporarily be held there; it must not be duplicated into `politikk`.
- The current Etne and Vindafjord police station is in Ølen, outside Etne municipality. No new Etne police-station record should be created.

## 1. Etne Tinghus

Etne municipality identifies Tinghuset as the municipality's administration building at Sjoarvegen 2, 5590 Etne. The building is currently under renovation, with the public reception temporarily moved to Sjoarvegen 20. The temporary reception address must not replace the canonical Tinghuset anchor.

The municipality's political pages document the elected municipal council and the municipal political structure. Tinghuset is therefore a direct physical anchor for municipal administration and local democratic governance.

Sources:

- https://www.etne.kommune.no/om-kommunen/
- https://www.etne.kommune.no/politikk/
- https://www.etne.kommune.no/politikk/politisk-styring/kommunestyret/

Coordinate result:

- Geonorge address-first query: `Sjoarvegen 2, 5590 Etne`
- source object: `geonorge-adresser-v1:4611:1032:2`
- WGS84: `59.66489494369154, 5.934465720587056`
- status: `verified`
- source report: `reports/etne-politikk-batch-1-coordinate-intake/etne_tinghus.json`

Sjoarvegen 20 is rejected as a permanent Tinghuset substitute; it is a temporary reception during renovation.

## 2. Etne brannstasjon

Etne municipality lists Etne brann og redning with visiting address Stadionvegen 4, 5590 Etne and separately documents the equipment and operational role of Etne brannstasjon. The municipality also identifies the station as the current base for Etne brann og redning.

Sources:

- https://www.etne.kommune.no/bustad-og-eigedom/brann-og-redningsteneste/
- https://www.etne.kommune.no/aktuelt/informasjon-om-omorganisering-pa-sektor-utvikling-og-drift-i-etne-kommune.15557.aspx

Coordinate result:

- Geonorge address-first query: `Stadionvegen 4, 5590 Etne`
- source object: `geonorge-adresser-v1:4611:1033:4`
- WGS84: `59.668576636879024, 5.943861929172312`
- status: `verified`
- source report: `reports/etne-politikk-batch-1-coordinate-intake/etne_brannstasjon.json`

## 3. Skånevik brannstasjon

Etne municipality documents Skånevik brannstasjon as the second operational fire station in the municipality and describes its dedicated vehicles and equipment. A 2025 municipal update documents a new fire engine at Skånevik station, confirming active current use.

Sources:

- https://www.etne.kommune.no/bustad-og-eigedom/brann-og-redningsteneste/
- https://www.etne.kommune.no/aktuelt/ny-brannbil-til-etne-brann-og-redning-ved-skanevik-stasjon.15462.aspx
- https://www.openstreetmap.org/node/5459109296

No sufficiently explicit civic address for the station was found in the municipal sources. The source pass therefore does not promote a nearby address into a station address.

Coordinate result:

- identified facility object: OpenStreetMap node `5459109296`
- object tags identify `amenity=fire_station`, name `Skånevik brannstasjon`, operator `Etne brannvesen`
- WGS84 facility point: `59.72875, 5.93592`
- canonical source identity: `osm:node:5459109296`
- `sourceProvider`: `osm`
- `locatorType`: `poi`
- `geocodeAccuracy`: `geometric_center`
- `coordStatus`: `verified`

Geonorge `punktsok` was run around the facility point as a proximity check. The nearest official address points are around 5 metres away at Milja allé 37 and 39, but neither is claimed as the fire station's official civic address because no explicit source establishes that relation. The Geonorge proximity evidence is saved at:

- `reports/etne-politikk-batch-1-coordinate-intake/skanevik_brannstasjon_punktsok.json`

This preserves the address-first rule: official address search is preferred where a concrete address exists, while an identified physical facility object is used when no civic address can be responsibly established.

## Category decision

- `etne_tinghus`: primary category `politikk`; underbadge `kommune_og_byraad`.
- `etne_brannstasjon`: primary category `politikk`; underbadge `politi_og_beredskap`.
- `skanevik_brannstasjon`: primary category `politikk`; underbadge `politi_og_beredskap`.

The batch is limited to concrete physical institutions. It does not create generic political-area records, duplicate existing cross-domain places, or create a police-station record for a service whose current physical station is in Ølen.

## Final integration gate

All three source records were registered exactly once in the places manifest and the runtime index was regenerated through the canonical repository path.

Validation results:

- `places:coords:intake --strict-new`: 0 blocking, 0 warnings
- active runtime occurrence: exactly one for each new place
- global duplicate active place IDs: 0
- source/index coordinate parity: PASS for all three
- missing `emne_ids`: 0
- duplicate place IDs across active files: 0
- split-manifest sync: PASS
- coordinate quality gate: PASS
- `git diff --check`: PASS

Physical-anchor checks against nearby canonical records were also completed and logged in `reports/etne-politikk-batch-1-integration/anchor-audit.txt`.
