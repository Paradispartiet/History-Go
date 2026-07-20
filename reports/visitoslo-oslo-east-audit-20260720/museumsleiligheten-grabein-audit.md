# VisitOSLO Oslo East — Museumsleiligheten Gråbein candidate audit

Date: 2026-07-20

## Candidate

- Proposed canonical id: `museumsleiligheten_grabein`
- Current official name: Museumsleiligheten Gråbein
- VisitOSLO source name: Arbeiderbolig / museumsleilighet i Tøyengata 38
- Address: Tøyengata 38, 0578 Oslo
- Proposed primary category: `historie`

## Existing-place gate

The current VisitOSLO Oslo East source-to-repo audit found no canonical identity match for the museumsleilighet in Tøyengata 38. The repository also has no dedicated place representing this preserved apartment under the Gråbein, Tøyengata 38 or worker-apartment names.

This is therefore a genuine candidate rather than a known alias of `arbeidermuseet` or a generic Tøyen place.

## Source basis

Oslo Museum currently presents the site as **Museumsleiligheten Gråbein** at Tøyengata 38. The museum describes it as a period apartment showing how a working-class family could live around 1900. The Bjørklund family, seven people who migrated from Sweden for work, lived in the apartment from 1891. The apartment is one room and kitchen, and the museum uses the site to interpret overcrowding, housing standards, work, migration and everyday life.

Oslo Museum states that the apartment lies in the Gråbein complex, was renovated and restored in 1987 by Oslo Byfornyelse, and was taken over by Oslo Museum in 1990.

Oslo byleksikon describes Tøyengata 38b as part of the Gråbeingårdene, a group of seven tenement buildings erected in 1888 with 212 small apartments in total. It identifies the preserved original apartment in 38b as the museum apartment owned by Bymuseet.

VisitOSLO describes the museum apartment as a preserved working-class apartment in an old Gråbein tenement and uses it to interpret east-side working-class housing around 1910–1920. VisitOSLO gives 1887 for the building, while Oslo byleksikon gives 1888 for the Gråbein complex; canonical production should therefore use 1888 as the conservative building-year value unless a stronger primary building-history source resolves the one-year discrepancy.

Primary/current source:
- https://www.oslomuseum.no/besok-oss/museumsleiligheten-grabein/

Current destination source:
- https://www.visitoslo.com/en/product/?tlp=2986423

Strong historical/reference source:
- https://oslobyleksikon.no/side/T%C3%B8yengata

## Representation decision

**Approve one canonical candidate: `museumsleiligheten_grabein`.**

The place should represent the preserved museum apartment as a stable historical interior and public-history site inside the Gråbein tenement complex. It should not represent all Gråbeingårdene, all working-class housing on Tøyen or Oslo Museum as an institution.

Recommended primary category: `historie`.

Core History Go angles:

- working-class housing and overcrowding around 1900
- the Bjørklund family's Swedish labour-migration history
- the one-room-and-kitchen dwelling as material social history
- the Gråbein tenement-building project and changing housing standards
- preservation, restoration and museum use from the late 20th century
- the difference between reconstructed period interpretation and claims about every resident who lived in the complex

## Scope guardrails

Keep distinct:

- `arbeidermuseet` — the broader labour and industrial-history museum at Sagveien 28
- the wider Gråbein tenement complex — the museum apartment is one preserved interior within it
- Tøyen as a neighbourhood — this record is an exact apartment/site identity

Do not:

- use the apartment to generalise all working-class families in Oslo
- treat every furnishing detail as an original Bjørklund-family object unless specifically sourced
- create separate overlapping place markers for the apartment and its museum name

## Coordinate gate

Run the normative address-first lookup for `Tøyengata 38 Oslo` first. If Geonorge returns a clear building address, use it as the stable building/display marker for the museum apartment, while the content and evidence must make clear that the canonical identity is the preserved apartment inside the building rather than the whole residential complex.

Status: **APPROVED FOR NORMATIVE ADDRESS-FIRST COORDINATE INTAKE.**
