# Oslo kultureiendommer completeness pass — batch 9

Date: 2026-07-18

## Frysja 33 / Brekke kraftstasjon — representation and coordinate audit

Current `main` already contains `frysja_industriomrade`, an area-scale `naeringsliv` place at `59.9608, 10.7726` with radius 260 metres. Its content broadly covers water-powered mills and sawmills at upper Akerselva and later industrial transformation.

Oslo kommune documents Frysja 33 as the former Brekke power station beside Brekkefossen and the only surviving part of Brekke Bruk. The official page states that the Nordre Aker activity house Frysja 33 has occupied the building since 1978.

The same official source documents:
- timber transport and water power at the upper Akerselva before the seventeenth century
- Brekkesagen established around 1740 under Christian Anker
- railway-driven growth after the Gjøvik Line opened in 1900
- 90 employees at the sawmill in the 1930s
- closure of Brekke Bruk in 1965 as the last sawmill on the Akerselva
- later industrial, residential, recreation and bathing-area uses around Brekkedammen

Official and supporting sources:
- https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/frysja-33/
- https://www.frysja33.no/
- https://oslobyleksikon.no/side/Kjelsåsveien

## Address correction

Oslo kommune's cultural-property page gives the visitor address `Kjelsåsveien 145`. The raw Geonorge response shows that this resolves to `145A` and `145B`. Oslo byleksikon identifies number 145 as the former Kjelsås Bruk / O. Mustad & Søn factory complex and number 151 as Brekke power station.

Frysja 33's own current website also gives `Kjelsåsveien 151`, and Oslo byleksikon identifies number 151 as the 1892 power station and the activity house used by the borough since 1978. The History Go lookup must therefore not use the 145A/145B points for Brekke power station.

## Physical-overlap decision

The corrected 151 candidates are about 660–676 metres from the existing `frysja_industriomrade` area marker, outside its 260-metre radius. Frysja 33 is also the surviving power-station building with a long independent activity-house function. A future separate canonical record can therefore be editorially justified; it would not merely duplicate the broad industrial-area marker.

## Coordinate status: needs_review

The normative finder for `Kjelsåsveien 151 0491 Oslo` still returns multiple candidates. Raw official Geonorge data identifies:

- `Kjelsåsveien 151B` — `59.96640389288337, 10.776507610858287`
- `Kjelsåsveien 151C` — `59.96652761473437, 10.776657553367157`

The two points share the same property and are about 16 metres apart. Frysja 33 documents two rentable facilities, Hovedhuset and Hallen, but the available sources do not map those named facilities to B or C. Neither address candidate can therefore be selected as the canonical marker without an additional object/building source.

No compromise midpoint is constructed. No new place record, manifest entry or runtime-index change is made in batch 9.

## Required follow-up

Resolve the facility through one of:
1. official municipal building/object geometry naming the power-station building
2. an official Frysja 33 source mapping Hovedhuset/kraftstasjonen to 151B or 151C
3. a documented site-compound geometry that justifies a representative facility anchor

Until then the candidate remains `needs_review`.
