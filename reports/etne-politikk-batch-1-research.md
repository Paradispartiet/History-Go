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

Coordinate intake:

- query the repository's Kartverket/Geonorge address-first tool for `Sjoarvegen 2, 5590 Etne`
- save the raw result in the integration report directory
- reject Sjoarvegen 20 as a permanent Tinghuset substitute; it is a temporary reception during renovation

## 2. Etne brannstasjon

Etne municipality lists Etne brann og redning with visiting address Stadionvegen 4, 5590 Etne and separately documents the equipment and operational role of Etne brannstasjon. The municipality also identifies the station as the current base for Etne brann og redning.

Sources:

- https://www.etne.kommune.no/bustad-og-eigedom/brann-og-redningsteneste/
- https://www.etne.kommune.no/aktuelt/informasjon-om-omorganisering-pa-sektor-utvikling-og-drift-i-etne-kommune.15557.aspx

Coordinate intake:

- query the repository's Kartverket/Geonorge address-first tool for `Stadionvegen 4, 5590 Etne`
- save the raw result in the integration report directory

## 3. Skånevik brannstasjon

Etne municipality documents Skånevik brannstasjon as the second operational fire station in the municipality and describes its dedicated vehicles and equipment. A 2025 municipal update documents a new fire engine at Skånevik station, confirming active current use.

Sources:

- https://www.etne.kommune.no/bustad-og-eigedom/brann-og-redningsteneste/
- https://www.etne.kommune.no/aktuelt/ny-brannbil-til-etne-brann-og-redning-ved-skanevik-stasjon.15462.aspx

The current source pass has not found a sufficiently explicit civic address from the municipality. OpenStreetMap-derived mapping places the station at approximately `59.72875, 5.93592`, but that point must be treated only as a candidate until the repository's coordinate workflow resolves or independently verifies the physical anchor.

Coordinate intake:

1. Search for a precise civic address using the repository's address-first coordinate tooling and official/local address evidence.
2. If no address can be established, use a separately documented facility-point workflow rather than inventing an address.
3. Do not finalize the OSM-derived point without a coordinate-evidence note.

## Category decision

- `etne_tinghus`: primary category `politikk`; underbadge `kommune_og_byraad`.
- `etne_brannstasjon`: primary category `politikk`; underbadge `politi_og_beredskap`.
- `skanevik_brannstasjon`: primary category `politikk`; underbadge `politi_og_beredskap`.

The batch is limited to concrete physical institutions. It does not create generic political-area records, duplicate existing cross-domain places, or create a police-station record for a service whose current physical station is in Ølen.
