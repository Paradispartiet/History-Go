# Oslo museum completeness batch 6 — research audit

Date: 2026-07-20

## Scope

This batch audits three major museum names from the current Oslo visitor-museum landscape:

1. Forsvarsmuseet
2. Naturhistorisk museum
3. Skimuseet i Holmenkollen

The same physical-place and duplicate gates used in the previous batches are applied here.

## 1. Forsvarsmuseet

### Existing-place audit

No canonical `forsvarsmuseet` record was found on current `main`.

Akershus festning is a broader parent site. Official visitor information explicitly treats Forsvarsmuseet, Norges Hjemmefrontmuseum and Akershus slott as separate museum destinations on the same fortress grounds. Forsvarsmuseet is independently visitable and occupies the old arsenal building on the lower fortress area.

The official school-visit information identifies the precise visitor location as:

- Forsvarsmuseet, building 62, Akershus festning.

### Source basis

Official sources:
- https://www.forsvarshistoriskmuseum.no/forsvarsmuseet
- https://www.forsvarshistoriskmuseum.no/forsvarsmuseet/undervisning
- https://www.forsvarshistoriskmuseum.no/akershus-festning

Key claims:
- The main museum of the Norwegian Armed Forces has been located at Akershus festning since 1860.
- It occupies the old arsenal building.
- Its exhibitions cover Norwegian defence history from the 1400s to the present, including strategy, technology and politics.
- Visitor location is building 62 inside Akershus festning.

### Representation decision

**Create one canonical candidate: `forsvarsmuseet`.**

Link it to `akershus_festning` as parent/related place, but do not reuse the broad fortress marker as the museum marker.

Status: **APPROVED FOR COORDINATE INTAKE WITH INTERNAL-FORTRESS BUILDING REVIEW.**

Coordinate method: resolve building 62 from an authoritative fortress/building source. Do not invent an address point and do not silently use the parent fortress coordinate.

## 2. Naturhistorisk museum

### Existing-place audit

`naturhistorisk_museum` already exists as a canonical History Go place in the Oslo science-place index. `botanisk_hage` also exists separately, which is the correct physical modeling: the museum institution and garden are related but independently collectible places.

Existing canonical IDs:
- `naturhistorisk_museum`
- `botanisk_hage`

### Representation decision

**No new place. Existing canonical records retained.**

The current record still has legacy/unverified coordinate metadata in the generated science index, but that is coordinate-quality debt rather than a museum completeness gap and belongs in the coordinate-control workstream.

Status: **ALREADY REPRESENTED; COORDINATE CONTROL REMAINS A SEPARATE TASK.**

## 3. Skimuseet i Holmenkollen

### Existing-place audit

History Go already has `holmenkollen_nasjonalanlegg` as the canonical physical destination. The record explicitly describes the destination as a combined national winter-sports complex containing the ski jump, stadium, museum and tower.

The current official Skimuseet site likewise presents the museum and tower as parts of the same Holmenkollen destination and states that all admission tickets include both Skimuseet and Hopptårnet.

The museum has been located in the Holmenkollen ski-jump complex since 1951. It was founded in 1923 and reopened with renewed spaces for its centenary in 2023.

### Source basis

Official sources:
- https://holmenkollen.com/
- https://holmenkollen.com/om-skimuseet/
- https://holmenkollen.com/apningstider/

### Representation decision

**Do not create a separate `skimuseet_holmenkollen` canonical marker.**

Retain `holmenkollen_nasjonalanlegg` as the physical parent destination and treat Skimuseet as one of its major institution/content layers. A second marker at the same visitor complex would create unnecessary map duplication.

Status: **ALREADY REPRESENTED THROUGH CANONICAL PARENT PLACE.**

## Batch result

| Candidate | Decision |
| --- | --- |
| Forsvarsmuseet | New canonical `forsvarsmuseet`; internal building 62 coordinate review |
| Naturhistorisk museum | Already canonical |
| Skimuseet i Holmenkollen | No new marker; represented through `holmenkollen_nasjonalanlegg` |

This batch produces one new place candidate, confirms one existing canonical museum, and classifies one major museum as a correctly modeled parent-place layer.
