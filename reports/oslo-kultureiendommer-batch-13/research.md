# Oslo kultureiendommer completeness pass — batch 13

Date: 2026-07-19

## Result

This pass resolves the two remaining explicit candidates from the earlier Oslo kommune / Kulturetaten cultural-properties audit:

- `bankall_gard`
- `frysja_33_brekke_kraftstasjon`

Both are physically distinct from existing canonical History Go places and can now be represented without guessing a coordinate.

## Bånkall gård

Oslo kommune documents Bånkall as a preserved farm complex at Trondheimsveien 640 with roots in the medieval Aker landscape. The surviving site includes residential buildings from the eighteenth and nineteenth centuries together with a barn, storehouse, brewhouse and potato cellar. The farm also served as a stagecoach station and tavern from 1836 to 1846 and remained a stopping place until the main road was relocated around 1860. Oslo municipality acquired the approximately eight-decare farm complex in 1994.

The earlier normative address-first lookup for Trondheimsveien 640 produced multiple lettered address candidates. None was selected as an arbitrary centre for the whole farm complex.

### Representation and coordinate decision

Bånkall is modeled as one canonical `historie` place representing the surviving farm complex, not one individual building and not the wider residential district carrying the same name.

The marker uses the explicit place coordinate published for Bånkall gård, gnr. 98/1, by Lokalhistoriewiki:

- `59.975215, 10.921884`
- source identity: `lokalhistoriewiki:bankall-oslo-gnr-98-1`
- `coordRole: area_anchor`
- `geocodeAccuracy: semantic_anchor`
- `coordStatus: verified_historical_source`

This is cross-checked against Oslo kommune's official cultural-property identity and visitor address. The decision follows the coordinate contract for a documented historical site/area anchor and deliberately does not convert an ambiguous address hit into a fake building-centre coordinate.

### Sources

- Oslo kommune — Bånkall gård: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/bankall-gard
- Oslo byleksikon — Bånkall gård: https://oslobyleksikon.no/side/B%C3%A5nkall_g%C3%A5rd
- Lokalhistoriewiki — Bånkall: https://lokalhistoriewiki.no/wiki/B%C3%A5nkall

## Frysja 33 / Brekke kraftstasjon

Batch 9 established that the official cultural-property address shown as Kjelsåsveien 145 could not represent Brekke kraftstasjon: the Geonorge result for 145 points to the former Kjelsås Bruk / Mustad complex, while both Frysja 33 and Oslo byleksikon place the power station at number 151.

The raw official Geonorge lookup for Kjelsåsveien 151 produced two address objects, 151B and 151C, only about 16 metres apart. Batch 9 therefore correctly left the candidate as `needs_review` rather than guessing which building was the former power station.

A later identity pass resolves that ambiguity. Lokalhistoriewiki's address history for Kjelsåsveien identifies `151C` specifically as Brekke kraftstasjon by Brekkefossen, the only surviving part of Brekke Bruk and the later Frysja 33 activity house. Oslo byleksikon independently identifies number 151 as the 1892 power station, and Frysja 33's current site identifies the old power-station building as today's venue.

### Representation and coordinate decision

Create one canonical `naeringsliv` place for the standing industrial building:

- `frysja_33_brekke_kraftstasjon`
- address: Kjelsåsveien 151C, 0491 Oslo
- coordinate: `59.96652761473437, 10.776657553367157`
- official Geonorge object: `geonorge-adresser-v1:0301:13747:151C`

The place is distinct from the existing broad `frysja_industriomrade` record. The older place represents upper-Akerselva industry at area scale; the new record represents the surviving power-station building and its later adaptive reuse.

### Date note

The standing building is dated to 1892 by Oslo byleksikon and the address-history source used to resolve 151C. Some Frysja 33 presentation material refers more broadly to an older power-station history. The canonical `year: 1892` is therefore tied specifically to the identified surviving building, not to the first use of water power or power-generation activity at Brekke.

### Sources

- Oslo kommune — Frysja 33: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/frysja-33/
- Frysja 33: https://www.frysja33.no/
- Oslo byleksikon — Kjelsåsveien / Brekke kraftstasjon: https://oslobyleksikon.no/side/Kjels%C3%A5sveien
- Lokalhistoriewiki — Kjelsåsveien address history: https://lokalhistoriewiki.no/wiki/Kjels%C3%A5sveien_(Oslo)
- Saved raw Geonorge lookup from batch 9: `reports/oslo-kultureiendommer-batch-9/coordinates/frysja-33-151-raw.json`

## Integration and validation

The two source files must be registered in `data/places/manifest.json`, followed by a rebuild of the generated global place index. Validation must cover:

- source/runtime index sync and coordinate parity
- strict-new coordinate intake
- canonical emne IDs and duplicate place IDs
- place health
- JSON and whitespace integrity

No temporary workflow file belongs in the final branch.
