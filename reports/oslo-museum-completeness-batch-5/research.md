# Oslo museum completeness batch 5 — research audit

Date: 2026-07-20

## Scope

This batch audits:

1. Jødisk Museum i Oslo
2. Norges Hjemmefrontmuseum
3. Sporveismuseet

## 1. Jødisk Museum i Oslo

### Existing-place audit

No canonical Jødisk Museum / Calmeyers gate synagogue place record was found on current `main`.

The museum occupies the former synagogue at Calmeyers gate 15B. The building itself is a historically significant physical site from Oslo's pre-war Jewish life, and the museum explicitly preserves traces from the former synagogue.

### Current status

The museum is temporarily closed from 1 May 2026 for renovation, with estimated completion in autumn 2028. The institution remains active through teaching and off-site activities. This is therefore not a permanent-closure case like Popsenteret.

### Source basis

Official sources:
- https://www.jodiskmuseumoslo.no/
- https://www.jodiskmuseumoslo.no/museets-historie
- https://www.jodiskmuseumoslo.no/kontakt

Address: Calmeyers gate 15B, 0183 Oslo.

### Representation decision

**Create one canonical candidate: `jodisk_museum_oslo`.**

The place record must foreground the former synagogue as the physical and historical anchor and carry explicit temporary-closure / reopening-status metadata so it is not presented as currently open during renovation.

Status: **APPROVED FOR COORDINATE INTAKE WITH TEMPORARY-CLOSURE METADATA.**

Coordinate method: address-first query for `Calmeyers gate 15B Oslo`, followed by verification of the museum/former-synagogue building point.

## 2. Norges Hjemmefrontmuseum

### Existing-place audit

No canonical `norges_hjemmefrontmuseum` record was found on current `main`.

Akershus festning is already a broader parent place, but the museum is a distinct, named and independently visitable destination in building 21. The official museum site gives its own opening hours, admission, collection and visitor address. This is analogous to other substantial sub-sites that justify separate collection markers inside large complexes.

The museum occupies a historic double battery and timber-framed building adapted for museum, archive, library and reading-room use. It is therefore not merely an exhibition room inside the general fortress marker.

### Source basis

Official sources:
- https://www.forsvarshistoriskmuseum.no/norges-hjemmefrontmuseum
- https://www.forsvarshistoriskmuseum.no/akershus-festning

Visitor address: Akershus festning, building 21, 0015 Oslo.

### Representation decision

**Create one canonical candidate: `norges_hjemmefrontmuseum`.**

Link it to `akershus_festning` as a related/parent place rather than collapsing it into the broad fortress marker.

Status: **APPROVED FOR COORDINATE INTAKE WITH INTERNAL-FORTRESS BUILDING REVIEW.**

Because the official address is an internal building number rather than a normal street address, the coordinate workflow should first test the repository's appropriate official-site / building-source method. Do not invent a generic fortress midpoint and do not silently reuse the parent marker.

## 3. Sporveismuseet

### Existing-place audit

`sporveismuseet` already exists as a canonical History Go place.

The existing record correctly models the preserved Vognhall 5 at Gardeveien 15, includes the museum's opening in 1985, and has a verified Geonorge address point for the building.

### Representation decision

**No new place. Existing canonical record retained.**

Status: **ALREADY REPRESENTED.**

## Batch result

| Candidate | Decision |
| --- | --- |
| Jødisk Museum i Oslo | New canonical `jodisk_museum_oslo`; temporary closure must be explicit |
| Norges Hjemmefrontmuseum | New canonical `norges_hjemmefrontmuseum`; distinct building inside Akershus festning |
| Sporveismuseet | Already canonical and coordinate-verified |

This batch produces two new place candidates and confirms one previously completed museum record.
