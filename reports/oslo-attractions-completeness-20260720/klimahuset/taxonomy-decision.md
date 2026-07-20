# Klimahuset — canonical taxonomy decision

Date: 2026-07-20

## Decision

**Primary category: `vitenskap`**  
**Secondary category: `natur`**  
**Hybrid: `true`**

Model Klimahuset as one canonical physical place, `klimahuset`, at the verified Monrads gate 12 building anchor.

## Why `vitenskap` is primary

- Klimahuset is a dedicated exhibition and knowledge building for climate and climate change within Naturhistorisk museum.
- Its public role is research-based science communication: the climate system, global warming, evidence, consequences and possible solutions are the core subject matter.
- The building contains exhibitions and event/teaching functions designed to translate current scientific knowledge to a broad public, with young people as an important target group.
- This makes the institution's primary History Go identity scientific knowledge production and communication rather than a generic attraction, architecture site or nature area.

## Why `natur` is secondary

- Climate, ecosystems, environmental change and human influence are substantive content, not decorative context.
- A secondary nature layer is therefore justified, but questions must distinguish climate science from direct local field observations. The building itself is not a natural habitat and must not be populated with invented local species claims.
- Nature content should be anchored in documented climate-system relationships, environmental processes and the site's explicit climate communication.

## Why not `by` as a separate primary or overlapping place

- The architecture is unusually important: timber structures, low-carbon materials, natural ventilation, energy measures and the surrounding rain garden make the building itself part of the climate story.
- These features should be used as a concrete built-environment and technology case inside the same place record, not as a second overlapping architecture marker.
- `botanisk_hage` remains the enclosing garden/campus place and `naturhistorisk_museum` the broader institution. Klimahuset is a distinct sub-place because it is a separately named public building with its own exact address and visitor identity.

## Recommended canonical emne path

Primary vitenskap-emner:

- `em_vit_kunnskap_formidling_utdanning`
- `em_vit_miljo_okologi_system`
- `em_vit_sannhet_maling_modeller`

Optional later quiz/theory support may use the broader scientific-societal role, but the visible question content must remain externally grounded and place-specific.

## Representation rules

1. Create one map marker for the Klimahuset building at Monrads gate 12.
2. Do not use Sars gate 1 as a shortcut for the building when the exact Monrads gate 12 anchor is available.
3. Do not merge Klimahuset into `naturhistorisk_museum` or `botanisk_hage`; those records represent broader institution/campus identities.
4. Do not split the exhibition, auditorium, architecture or climate garden into overlapping place markers.
5. Treat the sustainable building design as evidence-bearing climate/technology content within Klimahuset.
6. Do not generate generic climate questions detached from the documented exhibition, building or institutional sources.

## Coordinate production gate

The coordinate is validated through the locked address-first workflow:

- Address: Monrads gate 12, 0562 Oslo
- Source object: `geonorge-adresser-v1:0301:14797:12`
- Latitude: `59.919394833984754`
- Longitude: `10.772833068414897`
- Status: `verified`
- Named building QA: `osm-way:762832690`
- Approximate address-point distance to named building candidate: `13.2 m`

With this taxonomy decision, Klimahuset is ready for canonical production on a fresh coordinate-runner branch.
