# Glads mølle / `sagene_kvernhus` source-first research

Date: 2026-07-23

## Decision

The legacy label `Sagene mølle og kvernhus` is too broad to support one coordinate. The bounded canonical identity is **Glads mølle (Nedre Papirmølle)**, the surviving physical building at **Sandakerveien 10A**.

The existing placeId `sagene_kvernhus` should be preserved for relationship compatibility, while the visible identity, year and descriptive scope are corrected to the concrete building.

## Sources

- Oslo kommune Byplan: https://magasin.oslo.kommune.no/byplan/sagene-et-unikt-omrade
  - identifies Glads mølle as a surviving wooden factory building from 1736.
- Oslo byleksikon, Glads mølle: https://oslobyleksikon.no/side/Glads_m%C3%B8lle
  - identifies the building as Sandakerveien 10A and the former Nedre Papirmølle.
- Oslo byleksikon, Hjula Væverier: https://oslobyleksikon.no/side/Hjula_V%C3%A6verier
  - documents the later relationship between Hjula and Glads mølle while preserving their distinct physical identities.
- Kartverket / Geonorge Adresser API v1:
  - query: `Sandakerveien 10A Oslo`
  - source object: `geonorge-adresser-v1:0301:16161:10A`
  - coordinate: `59.931850362845985, 10.757873019733754`

## Production constraint

Do not use the old broad Sagene-area point and do not reuse the existing `ovre_foss` / Hjula anchor. Production must rerun the exact address lookup and a fresh current-main collision check before applying the coordinate.
