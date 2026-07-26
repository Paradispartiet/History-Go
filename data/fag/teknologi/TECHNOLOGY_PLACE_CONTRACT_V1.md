# TECHNOLOGY PLACE CONTRACT V1

## Purpose

This contract defines when a geographic place may receive a Technology subject layer inside the primary History Go category **Vitenskap**.

Technology is not assigned because a building, service or urban system uses advanced equipment. The technology itself must be the documented object of research, development, production, testing, preservation or public interpretation at the place.

## Required gates

A candidate must pass every gate:

1. **Primary technological identity**  
   A concrete technology, artefact, production process, laboratory or engineering environment is central to why the place is educationally relevant.

2. **Physical anchor**  
   The candidate has an identifiable building, workshop, laboratory, production structure, exhibit collection or marked microplace.

3. **Place-specific knowledge**  
   The core claims and quiz material cannot be moved unchanged to an arbitrary building.

4. **Evidence**  
   Authoritative sources document the technological activity and the location.

5. **Canonical connection**  
   At least one `em_tek_*` topic describes the actual technology at the site.

6. **Playable anchor**  
   A visitor can reach a legitimate public exterior or public interior anchor. Restricted laboratories may qualify only when the card does not imply public access to restricted areas.

## Category boundary

- Primary place category: `vitenskap`
- Technology subject and secondary layer: `teknologi`
- Urban infrastructure remains under `by`

A station, road, tunnel, bridge, transport hub, power grid or water network is not a Technology place merely because it contains technical systems. A factory that designed or manufactured signalling equipment, cables, radios, sensors or machines may qualify because technology production is the place's identity.

## Automatic rejection

Reject:

- ordinary stations and transport hubs
- smart buildings and ordinary office buildings
- company headquarters without a documented development or production anchor
- universities and research parks without a concrete publicly identifiable laboratory or technology site
- generic infrastructure whose main significance is how the city functions

## Candidate states

- `canonical_existing`: already a canonical place
- `approved_candidate`: evidence is sufficient; coordinate production remains
- `approved_microplace_candidate`: a small marked invention or development site
- `approved_candidate_access_review`: technologically valid, but public access and map wording must be constrained
- `rejected`: fails one or more required gates
