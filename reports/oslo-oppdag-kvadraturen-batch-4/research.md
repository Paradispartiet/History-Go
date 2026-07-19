# Oslo completeness — Oppdag Kvadraturen batch 4

Date: 2026-07-19

## Purpose

This batch resolves the remaining Oppdag Kvadraturen core stops that required an explicit representation decision rather than a simple name/address lookup.

The guiding rule is physical specificity:

- create a canonical marker when a separate standing building, park or defensible historical site can be identified;
- do not duplicate an existing broad area marker for the same physical object;
- route vanished structures at an already represented address to a historical time layer when a second map marker would falsely imply two standing buildings;
- do not turn thematic multi-building interpretation stops into one artificial map point.

## Canonical additions

### `kontraskjaeret`

Kontraskjæret is physically distinct from the main `akershus_festning` area anchor and is a named park with its own visible archaeological remains.

Oppdag Kvadraturen documents several layers:

- dense town-house development after the founding of Christiania in 1624;
- destruction in the 1686 fire;
- incorporation into the fortress defences after the fire;
- removal of defensive works during the nineteenth century;
- the Rådhusgata cutting in 1881;
- Skansen restaurant from 1926 until demolition in 1970;
- archaeological excavations in 1979–1981 revealing five town houses and about 60,000 objects.

Coordinate decision:

- exact named OSM park polygon: way `545698008`
- polygon centre: `59.9102177, 10.7364883`
- same-name tram-stop node explicitly rejected

Official source:
https://www.oppdagkvadraturen.no/stoppesteder/kontraskjaeret

## Toll area: three separate physical layers

The existing canonical `tollbukaia` record is a verified semantic line anchor for the historical quay. It does not represent either of the two standing toll buildings.

The generic address query `Tollbugata 1 Oslo` returned multiple Geonorge hits and was therefore rejected for new building placement.

### `tollboden_oslo`

The current administrative Tollbod was completed in 1896 and designed by Adolf Schirmer.

Coordinate decision:

- exact named OSM building: way `112195502`, `Tollboden`
- geometric centre: `59.9093125, 10.7494445`
- Riksantikvaren independently documents the historic toll complex at Tollbugata 1A and distinguishes the 1896 administration building from the 1850 Steinpakkhuset.

### `tollpakkhuset`

Tollpakkhuset / Steinpakkhuset was built in 1846–1850 by Johan Henrik Nebelong and is documented by Oppdag Kvadraturen as the oldest surviving building at the old harbour front.

Coordinate decision:

- exact named OSM building: way `112195503`, `Stenpakkhuset`
- geometric centre: `59.9096073, 10.7497695`
- `Tollpakkhuset`, `Steinpakkhuset` and `Norsk Tollmuseum` did not all resolve as searchable OSM names; the exact mapped name is the older spelling `Stenpakkhuset`.
- the generic address point is not used.

Sources:
- https://www.oppdagkvadraturen.no/stoppesteder/tollpakkhuset
- https://riksantikvaren.no/eksempelsamling/nytt-inngangsparti/

## `ostbanestasjonen`

The existing `oslo_s` record represents the modern transport complex and currently uses the official address point for Jernbanetorget 1. `jernbanetorget` separately represents the public square.

Østbanestasjonen is nevertheless a separate surviving historic building with its own mapped footprint. Oppdag Kvadraturen documents the current station building as completed in 1882 by Georg Bull, integrating parts of the earlier 1854 station. Railway operations moved to Oslo S from 1987 and the old station was gradually closed by 1990.

Coordinate decision:

- do not reuse the shared Jernbanetorget 1 address point;
- exact named OSM building: way `131419741`, `Østbanehallen`
- geometric centre: `59.9108317, 10.7514325`

This allows History Go to distinguish:

- `ostbanestasjonen` — the preserved historic building;
- `oslo_s` — the modern transport complex;
- `jernbanetorget` — the public square.

Official source:
https://www.oppdagkvadraturen.no/stoppesteder/ostbanehallen

## `palehaven_paleet`

Paleet no longer stands, and the historical garden no longer survives in its original form. A normal building marker would therefore be misleading.

Oppdag Kvadraturen places the stop at Christian Frederiks plass and documents:

- Paléhaven as an early public park associated with the Anker family's palace from around 1760;
- Paleet as a royal residence from 1814 until the Royal Palace took over that role;
- demolition after the 1942 fire;
- major later transformation of the area.

Representation decision:

- canonical historical-site record, not a standing-building record;
- exact current OSM square relation `13360195`, `Christian Frederiks plass`, used as a documented semantic site anchor;
- centre: `59.9100099, 10.7516267`;
- coordinate metadata explicitly states that this is not claimed as the precise footprint centre of the demolished palace or the full historical garden.

Official source:
https://www.oppdagkvadraturen.no/stoppesteder/palehaven-og-paleet

## Bankplassen 4: canonical building + historical time layer

### `norges_bank_bankplassen_4`

The standing building at Bankplassen 4 was taken into use as Norges Bank's new headquarters on 1 January 1906. It is physically distinct from the existing `grunnlovsbygget_bankplassen` record, which represents the earlier 1828 bank building at Bankplassen 3.

Coordinate decision:

- normative address-first Geonorge lookup: `Bankplassen 4 Oslo`
- official object: `geonorge-adresser-v1:0301:10412:4`
- coordinate: `59.90866481462448, 10.741285328997623`

### Christiania Theater

Christiania Theater stood at approximately the same site from 1837 to 1899 and was demolished before the 1906 bank building was erected.

Creating a second canonical marker at the same site would visually imply two concurrent buildings. The theatre is therefore represented as an `actual_site_treasure` / historical time layer attached to `norges_bank_bankplassen_4` in Wonderkammer.

This preserves key site history, including:

- Grosch's 1837 theatre building;
- its gradual role as a national theatrical institution;
- the first performance of `Peer Gynt` there in 1876;
- the replacement of the theatre by Norges Bank's new headquarters.

Official source:
https://www.oppdagkvadraturen.no/stoppesteder/bankplassen-4-christiania-theater-og-norges-bank

## Thematic stop: `Forretningspalasser fra 1890-årene`

Decision: no single canonical marker.

This is a thematic interpretation stop covering multiple separate commercial buildings. Turning it into one coordinate would violate the physical-identity rule. Individual buildings can be audited separately in a later source-driven pass if any are missing, while the collective theme belongs in route/knowledge content rather than a fake place record.

## Batch output

Canonical places:

1. `kontraskjaeret`
2. `palehaven_paleet`
3. `ostbanestasjonen`
4. `tollboden_oslo`
5. `tollpakkhuset`
6. `norges_bank_bankplassen_4`

Wonderkammer:

- `wk_norges_bank_bankplassen_4_christiania_theater`

The result closes the remaining representation decisions from the historical 33-stop Oppdag Kvadraturen core without turning thematic content or vanished overlapping buildings into misleading map markers.
