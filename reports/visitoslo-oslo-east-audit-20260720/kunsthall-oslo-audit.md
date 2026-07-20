# VisitOSLO Oslo East — Kunsthall Oslo candidate audit

Date: 2026-07-20

## Candidate

- Proposed canonical id: `kunsthall_oslo`
- Name: Kunsthall Oslo
- Proposed primary category: `kunst`
- Current documented visitor address: Kjølberggata 21 / Factory Tøyen, 0653 Oslo
- Former VisitOSLO-listed address: Rostockgata 2–4, Bjørvika

## Existing-place gate

The current VisitOSLO Oslo East source-to-repo audit found no exact canonical or alias match for Kunsthall Oslo. Repository pull-request and commit searches likewise found no dedicated canonical production under the Kunsthall Oslo name after that audit.

Nearby or similarly named Oslo art places represent separate institutions and physical sites. Kunsthall Oslo should therefore be treated as its own candidate rather than absorbed into a generic Oslo art, Bjørvika or Tøyen marker.

## Source basis

The bounded VisitOSLO Oslo East source pass identified Kunsthall Oslo as a distinct non-commercial contemporary-art venue and listed it at Rostockgata 2–4 in Bjørvika.

Kunsthall Oslo's own current site now states that the institution is located in the Tøyen area and gives the visitor address as **Kjølberggata 21 / Factory Tøyen, 0653 Oslo**. The official page describes the institution as a non-commercial art space showing international contemporary art with an emphasis on new commissions and on the social and historical context of art production.

The address difference is therefore not a minor formatting discrepancy. The VisitOSLO source represents an older physical phase, while the institution's own current source identifies the active venue at Tøyen.

Sources:
- VisitOSLO — Kunsthall Oslo
- Kunsthall Oslo — Om oss / About

## Representation decision

**Approve one canonical candidate: `kunsthall_oslo`.**

The canonical place should represent the institution's current physical exhibition venue at Kjølberggata 21 / Factory Tøyen, not its former Bjørvika location.

Recommended primary category: `kunst`.

Core History Go angles:

- non-commercial contemporary-art institution rather than commercial gallery retail
- international contemporary art and new commissions
- the relationship between artistic production and social/historical context
- institutional relocation as part of Oslo's changing art geography
- contrast between the former Bjørvika phase and the current Tøyen location
- the role of independent exhibition spaces alongside larger museums and commercial galleries

## Source-critical guardrails

Do not:

- use Rostockgata 2–4 as the active canonical coordinate merely because it remains on the VisitOSLO page
- create separate active places for the former and current Kunsthall Oslo addresses without a distinct historical-site reason
- merge Kunsthall Oslo into a generic Tøyen or Bjørvika place
- describe the venue as a commercial gallery when its own current institutional description is non-commercial
- infer an exact relocation date unless directly documented by a reliable source

## Coordinate gate

This is a fixed, addressable current venue. The locked coordinate method is **current-address first**:

1. Query the normative Geonorge address source for `Kjølberggata 21, Oslo` and save both raw and parsed terminal output in the same command workflow.
2. Require an exact or otherwise unambiguous address result before production.
3. Cross-check the returned point against the current Kunsthall Oslo / Factory Tøyen entrance or building identity.
4. Treat Rostockgata 2–4 only as a former location layer unless later source work establishes a separate canonical historical-place reason.
5. Run the ordinary canonical proximity and physical-overlap gates against current main before production.

Status: **APPROVED FOR CURRENT-ADDRESS-FIRST COORDINATE INTAKE.**
