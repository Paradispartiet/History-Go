# VisitOSLO Oslo East — Vålerenga kirke candidate audit

Date: 2026-07-20

## Candidate

- Proposed canonical id: `valerenga_kirke`
- Name: Vålerenga kirke
- Proposed primary category: `religion`
- Documented address: Hjaltlandsgata 3, Oslo

## Existing-place gate

The current VisitOSLO Oslo East source-to-repo audit found no exact canonical or alias match for Vålerenga kirke. The only fuzzy repository candidate was the broader `vaalerenga` place, which represents the neighbourhood rather than the church building.

Repository pull-request and commit searches likewise found no dedicated canonical production for Vålerenga kirke after the source audit. The church is therefore still a genuine physical-place gap rather than a duplicate of the wider Vålerenga area.

## Source basis

VisitOSLO lists Vålerenga kirke as a distinct attraction and describes the church as dating from 1902, with its asymmetrically placed tower as a defining architectural feature.

Vålerenga menighet documents the church at Hjaltlandsgata 3 and gives the central continuity-and-rebuilding story: the church was consecrated in 1902, was devastated by fire on 18 September 1979 so that essentially the masonry walls remained, and was rebuilt and reconsecrated in 1984. The parish also documents the original Emanuel Vigeland decoration, the later Håkon Bleken glass, and the church's continuing religious and local-community use.

Oslo byleksikon independently identifies the same building at Hjaltlandsgata 3, documents the 1902 opening, the 1979 fire and the 1984 reopening, and describes the building's granite and soapstone materiality and unusual orientation.

Sources:
- VisitOSLO — Vålerenga kirke
- Vålerenga menighet / Den norske kirke — Om Vålerenga kirke
- Oslo byleksikon — Vålerenga kirke

## Representation decision

**Approve one canonical candidate: `valerenga_kirke`.**

The place should represent the physical church building and its continuous role as Vålerenga's parish church. It must remain distinct from the broader `vaalerenga` neighbourhood place and from Vålerenga park as surrounding public space.

Recommended primary category: `religion`.

This follows the current History Go primary-function rule: an active church whose main present-day function is worship and parish life belongs in the Religion badge, even when it also carries major architectural, art-historical and local-history significance.

Core History Go angles:

- parish church established in the rapid urban growth of eastern Oslo around 1900
- 1902 church architecture, granite construction and asymmetrically placed tower
- the 1979 fire as a major rupture in local memory
- rebuilding and reconsecration in 1984
- lost and surviving church art, including the Emanuel Vigeland and later Håkon Bleken layers
- the strong relationship between church, neighbourhood identity and Vålerenga supporter culture after the fire
- continuity of religious use across destruction, reconstruction and changing local culture

## Source-critical guardrails

Do not:

- merge the church into the broader `vaalerenga` neighbourhood record
- classify it primarily as `historie` or `kunst` while its active main function remains a church
- treat the 1984 interior as a literal reconstruction of everything lost in 1979
- state that all original Emanuel Vigeland decoration survived; the documented fire destroyed the glass paintings and nearly all of the fresco work
- overstate architectural attribution without resolving the source discrepancy: Oslo byleksikon names Heinrich Jürgensen and Holger Sinding-Larsen after a competition, while the parish history page names Holger Sinding-Larsen
- use the surrounding park or neighbourhood centroid as a coordinate proxy

## Coordinate gate

This is a fixed, addressable building. The locked coordinate method is therefore **address first**:

1. Query the normative Geonorge address source for `Hjaltlandsgata 3, Oslo` and save both raw and parsed terminal output in the same command workflow.
2. Require an exact or otherwise unambiguous address result before production.
3. Cross-check the returned point against the named church building and the documented location in Vålerenga park.
4. Run the ordinary canonical proximity and physical-overlap gates against current main, specifically distinguishing the church from `vaalerenga` and any park-level place.
5. Produce the canonical place only after the coordinate evidence and identity gate pass.

Status: **APPROVED FOR ADDRESS-FIRST COORDINATE INTAKE.**
