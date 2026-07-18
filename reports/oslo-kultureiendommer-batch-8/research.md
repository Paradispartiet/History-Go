# Oslo kultureiendommer completeness pass — batch 8

Date: 2026-07-18

## Trosterudvillaen

No canonical History Go record was found for `Trosterudvillaen`, `doktorvillaen`, Henrik Dedichen's residence or Dr. Dedichens vei 28D. The only existing Trosterud name match on current `main` is `trosterud_friomrade`, a separate nature place about 1.4 km from the villa point.

Oslo kommune documents that psychiatrist Henrik Dedichen founded and ran a private psychiatric institution at Trosterud from 1901 to 1933 and worked for reforms in care and legislation. Trosterudvillaen was his home and was completed in 1901, surrounded by a romantic garden used by both patients and employees. The institution's operation ended in 1964, and Oslo kommune took over the buildings in 1966.

The canonical record distinguishes the residence from the institution's separate treatment buildings while explaining their shared historical landscape. Historical terminology is contextualized rather than repeated uncritically.

Oslo kommune also documents that the garden was comprehensively rehabilitated and reopened as an accessible local culture park in 2024, including the restored pond, stage, lighting and historical paths. Kulturetaten's current atelier page identifies the villa specifically as Dr. Dedichens vei 28D and documents seven artist studios on the second floor.

Representation: canonical `historie` place focused on psychiatric-care reform history, the relationship between residence, treatment institution and landscape, and later neighbourhood/cultural reuse.

Official sources:
- https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/trosterudvillaen/
- https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/lokaler-til-lan-og-leie-for-kunstnere/kulturetatens-atelier/atelierene-i-trosterudvillaen/

## Coordinate decision

The first Geonorge lookup using `Dr. Dedichens vei 28 Oslo` returned multiple plausible hits. A second lookup with the postcode remained ambiguous. Both results were correctly rejected under the repository's coordinate-finder rules.

The current official atelier page resolves the villa to house letter 28D. The exact address-first query was therefore rerun and saved with `tee`:

- query: `Dr. Dedichens vei 28D Oslo`
- status: `verified_candidate`
- coordinate: `59.92348778601233, 10.866602631958953`
- source object: `geonorge-adresser-v1:0301:11287:28D`

The coordinate is used as a building display marker for the villa. It is not an area centre for the former institution, the rehabilitated garden or Trosterud friområde.

## Validation path

The dedicated integration workflow registers the history source, rebuilds the global place index and runs coordinate parity, strict coordinate intake, canonical emne validation and the place-health report. Temporary workflows are removed before merge.
