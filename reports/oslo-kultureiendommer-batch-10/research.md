# Oslo kultureiendommer completeness pass — batch 10

Date: 2026-07-19

## Scope and canonical audit

This pass follows the repository's normative address-first coordinate workflow and groups seven Oslo cultural-property gaps into one batch.

A fresh audit of the current canonical place index (1,195 records at selection time) found no existing ID, normalized-name or address match for:

1. `sporveismuseet` — Gardeveien 15
2. `bankall_gard` — Trondheimsveien 640
3. `saxegarden` — Saxegaardsgata 17
4. `ovre_fossum_gard` — Olaus Fjørtofts vei 130
5. `lambertseter_gard` — Langbølgen 2B
6. `nordre_skoyen_hovedgard` — Peter Aas' vei 17
7. `lokomotivverkstedet` — Bispegata 16

Each candidate is a concrete building or building complex with an official municipal page and a specific Norwegian street address. The batch does not use area midpoints or nearby POIs. A candidate is only integrated if the saved Geonorge result is an unambiguous `verified_candidate` and the address point represents the documented building.

## Source notes

### Sporveismuseet

Oslo kommune documents Vognhall 5 as a 1913 tram depot built for Kristiania elektriske Sporvei. The surrounding depot buildings were demolished in 1983; Lokaltrafikkhistorisk forening has used the surviving hall since 1984, and the museum opened in 1985.

Source: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/sporveismuseet/

### Bånkall gård

Oslo kommune describes Bånkall as a medieval `rud` farm, later used as a coaching station and inn from 1836 to 1846. The surviving complex includes farm buildings from several periods. The municipality acquired the property in 1994; it was restored after a 1996 fire.

Source: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/bankall-gard/

### Saxegården

Oslo kommune documents a precisely located medieval urban farm known from 1334–1414. The medieval building burned in 1624, later buildings reused the site, and the present main house was erected around 1800. It has since undergone major rehabilitation.

Source: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/saxegarden/

### Øvre Fossum gård

Oslo kommune links the farm name to `Fossheimr`, describes the mid-eighteenth-century division into Øvre and Nedre Fossum, and documents farming until Oslo's 1965 expropriation and later neighbourhood development.

Source: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/ovre-fossum-gard/

### Lambertseter gård

Oslo kommune documents a farm known from the sixteenth century, a main building from 1825 and the transfer of most farmland to Aker municipality after the Second World War before the postwar housing development.

Source: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/lambertseter-gard/

### Nordre Skøyen hovedgård

Oslo kommune traces the farm through medieval monastic ownership and documents the present complex's main development after Jess Carlsen bought the property in 1750. Aker municipality acquired it in 1910; it has been used as a meeting and event venue since 1953.

Source: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/nordre-skoyen-hovedgard/

### Lokomotivverkstedet

Oslo kommune documents the red neo-Gothic brick locomotive workshop built by NSB in 1893. It now stands within Middelalderparken, is protected, and partly overlies ruins of the medieval royal castle.

Source: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/lokomotivverkstedet/

## Coordinate method

All seven address queries are run in one workflow with `npm run places:coords:find:address -- --address ...`. Each command is piped through `tee` into `reports/oslo-kultureiendommer-batch-10/coordinates/`.

No result is copied into canonical place data until its saved output has been audited for ambiguity, source-object identity and physical-object fit.
