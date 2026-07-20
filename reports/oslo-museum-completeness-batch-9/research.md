# Oslo museum completeness batch 9 — research audit

Date: 2026-07-20

## Scope

This batch resolves the final museum-list items surfaced in the systematic VisitOSLO closure pass:

1. The Salmon – knowledge centre
2. Fotohuset Deich / Fotografiska Oslo
3. Akershus slott

## 1. The Salmon – knowledge centre

### Existing-place audit

No canonical The Salmon place was found on current `main`.

The venue at Strandpromenaden 11 combines a restaurant with a free, independently visitable knowledge centre about Norwegian salmon farming and aquaculture. Its official material presents the knowledge centre as an educational destination and identifies the Norwegian University of Life Sciences (NMBU) as an academic partner.

### Source basis

Official source:
- https://www.thesalmon.com/

Address: Strandpromenaden 11, 0252 Oslo.

Key learning case:
- aquaculture as a major Norwegian industry;
- production from sea to plate;
- coastal geography, technology, food production and industry;
- explicit school and learning-centre use.

### Representation decision

**Create one canonical candidate: `the_salmon_vitensenter`.**

The place should be framed primarily as a knowledge centre about aquaculture and Norwegian industry, not as a restaurant marker. The strongest canonical category is likely `naeringsliv`, with science/environmental links handled through subject content rather than creating a duplicate place.

Status: **APPROVED FOR COORDINATE INTAKE.**

Coordinate method: normative address-first query for `Strandpromenaden 11 Oslo`, followed by verification of the visitor entrance/building point.

## 2. Fotohuset Deich / Fotografiska Oslo

### Existing-place audit

The physical building at Arne Garborgs plass 4 is already canonical as `gamle_deichman`, with a verified Geonorge building coordinate.

The current canonical record contains an incorrect building-era framing: it dates the Hammersborg place to 1890 and describes it as the old main library from the late 1800s. The official Fotohuset Deich project states that the building housed Deichman's main library from 1933 to 2019.

### Current/future status

The building is being transformed into Fotohuset Deich. Current official project information states that the photography house, including Fotografiska Oslo, is planned to open in 2028.

This is a future use, not a currently open museum.

### Source basis

Official sources:
- https://www.deich.no/no/fotohuset-deich
- https://www.deich.no/
- https://oslo.fotografiska.com/no

### Representation decision

**Do not create a new active Fotohuset/Fotografiska marker.**

Retain the existing physical canonical place `gamle_deichman`, correct its Hammersborg building chronology, and add the planned 2028 photography-house reuse as explicitly future metadata/content.

Status: **EXISTING CANONICAL BUILDING; DATA CORRECTION AND FUTURE-USE ENRICHMENT.**

## 3. Akershus slott

### Existing-place audit

Akershus slott is already represented in the repository through the legacy `akerhus_slott` place target, while a later compatibility fix also introduced `akershus_festning` as a canonical resolving target without removing the older references.

The current visitor-list entry therefore does not expose a missing physical place.

The separate museum audit has already identified Forsvarsmuseet and Norges Hjemmefrontmuseum as distinct internal destinations deserving their own building-level candidates.

### Representation decision

**No new Akershus slott place from this source pass.**

Status: **ALREADY REPRESENTED; LEGACY ID/COMPATIBILITY STATE IS A SEPARATE DATA-CLEANUP ISSUE.**

## Batch result

| Candidate | Decision |
| --- | --- |
| The Salmon – Vitensenter | New canonical `the_salmon_vitensenter`; coordinate intake |
| Fotohuset Deich / Fotografiska Oslo | No new active marker; correct/enrich existing `gamle_deichman`; planned opening 2028 |
| Akershus slott | Already represented; no new place |

This batch adds one final museum-list candidate and corrects one existing canonical building while preventing premature creation of a future museum marker.
