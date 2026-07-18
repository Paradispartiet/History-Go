# Oslo kultureiendommer completeness pass — batch 10

Date: 2026-07-19

## Result

The pass adds seven canonical Oslo building places in one batch:

| Canonical ID | Official address | Coordinate status |
| --- | --- | --- |
| `sporveismuseet` | Gardeveien 15 | verified candidate |
| `saxegarden` | Saxegaardsgata 17 | verified candidate |
| `ovre_fossum_gard` | Olaus Fjørtofts vei 130 | verified candidate |
| `lambertseter_gard` | Langbølgen 2B | verified candidate |
| `nordre_skoyen_hovedgard` | Peter Aas' vei 17 | verified candidate |
| `lokomotivverkstedet` | Bispegata 16 | verified candidate |
| `tveten_gard` | Tvetenveien 101 | verified candidate |

## Canonical audit

A fresh audit of the current canonical place index (1,195 records at selection time) found no existing ID, normalized-name or address match for the seven integrated records.

The audit also checked their physical scope. Every record represents a distinct building or building complex, not a general district, park or historical landholding. In particular:

- Sporveismuseet is anchored to surviving Vognhall 5, not the demolished depot complex.
- Saxegården is anchored to the standing main building on the precisely known historical site.
- The four farms are anchored to their preserved buildings or farmyards, not their former agricultural land.
- Lokomotivverkstedet is modeled separately from Middelalderparken because it is a distinct protected building with its own function and address.

## Candidate replacement

The initial seven-place candidate set included Bånkall gård at Trondheimsveien 640. The normative address-first finder returned multiple results without one exact match and therefore set `needs_review`. No coordinate was guessed or selected.

Bånkall remains outside canonical data. Its saved result is retained as negative evidence. Tveten gård replaced it after a new canonical audit found no duplicate and the exact official address Tvetenveien 101 produced one clear Geonorge candidate.

## Official historical sources

### Sporveismuseet

Oslo kommune documents Vognhall 5 as a 1913 tram depot built for Kristiania elektriske Sporvei. The surrounding depot buildings were demolished in 1983; Lokaltrafikkhistorisk forening has used the surviving hall since 1984, and the museum opened in 1985.

Source: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/sporveismuseet/

### Saxegården

Oslo kommune documents a precisely located medieval urban farm known from 1334–1414. The medieval building burned in 1624, later buildings reused the site, and the present main house was erected around 1800.

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

### Tveten gård

Oslo kommune documents one of Oslo's best-preserved farmyards, with eight buildings. The farm is first mentioned in writing in 1408. Important surviving structures include the distillery building from around 1800 and the granary from 1858. Oslo municipality acquired the building complex in 2006.

Source: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/tveten-gard/

## Coordinate method and decisions

The repository's normative command was run for every candidate:

```bash
npm run places:coords:find:address -- --address "<official address>" \
  | tee reports/oslo-kultureiendommer-batch-10/coordinates/<place>.json
```

Each accepted output has `status: verified_candidate`, one official Geonorge address object and a building representation point. The saved files preserve the source URL, source-object ID, raw address hit and coordinate contract. The canonical `coordNote` further narrows each marker to the physical building or farmyard.

## Validation path

The source is registered in the place manifest and the global index is rebuilt. Pull-request validation covers:

- place-index/source sync and coordinate parity
- strict-new coordinate intake
- canonical emne IDs and duplicate place IDs
- place health
- JSON and whitespace integrity

Temporary coordinate workflow files are not part of the final branch.

