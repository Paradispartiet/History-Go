# Oslo kultureiendommer completeness pass — batch 9

Date: 2026-07-18

## Frysja 33 / Brekke kraftstasjon — representation audit

Current `main` already contains `frysja_industriomrade`, an area-scale `naeringsliv` place at `59.9608, 10.7726` with radius 260 metres. Its content broadly covers water-powered mills and sawmills at upper Akerselva and later industrial transformation.

Oslo kommune documents Frysja 33 as the former Brekke power station beside Brekkefossen and the only surviving part of Brekke Bruk. The official page gives the current visitor address Kjelsåsveien 145 and states that the Nordre Aker activity house Frysja 33 has occupied the building since 1978.

The same official source documents:
- timber transport and water power at the upper Akerselva before the seventeenth century
- Brekkesagen established around 1740 under Christian Anker
- railway-driven growth after the Gjøvik Line opened in 1900
- 90 employees at the sawmill in the 1930s
- closure of Brekke Bruk in 1965 as the last sawmill on the Akerselva
- later industrial, residential, recreation and bathing-area uses around Brekkedammen

Official source:
- https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/frysja-33/

## Physical-overlap gate

A second canonical record is not justified merely because Kulturetaten uses a specific property name. Before any place data is written, batch 9 must determine:

1. whether Kjelsåsveien 145 resolves to the surviving power-station building
2. the distance from the existing Frysja area marker
3. whether the building's surviving material history and current activity-house function are sufficiently distinct from the broad industrial-area record
4. whether a separate point would create confusing practical overlap in the map

The address-first Geonorge result is saved under `coordinates/frysja-33.json`. No canonical record is written until the result and physical representation are inspected.
