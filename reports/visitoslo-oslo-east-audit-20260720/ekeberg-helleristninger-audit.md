# VisitOSLO Oslo East — Helleristningene på Ekeberg candidate audit

Date: 2026-07-20

## Candidate

- Proposed canonical id: `ekeberg_helleristninger`
- Name: Helleristningene på Ekeberg
- Registered identity: Ekeberg 2 helleristningsfelt, Sjømannsskolen
- Kulturminne ID: `41907`
- Proposed primary category: `historie`

## Existing-place gate

The current VisitOSLO Oslo East source-to-repo audit found no canonical Ekeberg helleristningsfelt identity. Repository PR and commit searches likewise found no earlier dedicated place production under the Ekeberg, helleristning or Karlsborgveien names.

Nearby Ekeberg records represent other physical scales and identities, including the broader Ekeberg area, Ekebergparken and other visitor sites. The rock-carving field is a distinct archaeological object and should not be absorbed into a generic park or viewpoint marker.

## Source basis

VisitOSLO describes the rock carvings as an accessible prehistoric site at Ekeberg, located near Karlsborgveien/Kongsveien and discovered in 1915. The field contains 13 figures, including animal figures, a human figure and other motifs, and is dated to the end of the Stone Age in the destination source.

The identity is cross-linked as **Ekeberg 2 helleristningsfelt, Sjømannsskolen** with **Kulturminne ID 41907**. Kulturminnesøk explicitly supports lookup by Kulturminne-ID and exposes the registered cultural-heritage object's coordinates and geometry on its object page. This makes the archaeological object, rather than a nearby road address, the correct coordinate authority.

Sources:
- VisitOSLO — Helleristningene på Ekeberg
- Oslo byleksikon — Helleristningene på Ekeberg
- Kulturminnesøk — object lookup by Kulturminne-ID `41907`
- Wikidata/Commons cross-link for identity `Ekeberg 2 helleristningsfelt, Sjømannsskolen` → Kulturminne ID `41907`

## Representation decision

**Approve one canonical candidate: `ekeberg_helleristninger`.**

The place should represent the actual archaeological rock-carving field. It should not represent Ekeberg as a district, Ekebergparken as a sculpture park, the nearby viewpoint, or Karlsborgveien/Kongsveien as road features.

Recommended primary category: `historie`.

Core History Go angles:

- prehistoric rock art as material historical evidence
- what can and cannot be inferred from carved motifs
- archaeological dating and uncertainty
- landscape, visibility and changing interpretation of prehistoric sites
- discovery in 1915 and later cultural-heritage protection
- preservation of exposed rock surfaces in a modern urban landscape

## Source-critical guardrails

Do not:

- present modern interpretations of individual motifs as certain prehistoric meanings
- turn every animal figure into a specific species without a source
- use a road midpoint, Ekebergparken centroid or viewpoint marker as a proxy coordinate
- merge the site into `ekebergparken` merely because both lie on Ekeberg

## Coordinate gate

This is an archaeological outdoor object without a unique postal address. The locked coordinate method is therefore **object-type first**, not address first:

1. Look up Kulturminne ID `41907` in Kulturminnesøk.
2. Use the registered archaeological object/geometry as the primary identity and coordinate source.
3. Cross-check the object against the named Ekeberg 2 / Sjømannsskolen field and the known public-access location near Karlsborgveien/Kongsveien.
4. Use a stable object or geometry anchor according to the coordinate contract; do not substitute a nearby road address.
5. Run the ordinary canonical proximity and overlap gates against current main.

Status: **APPROVED FOR OBJECT-FIRST CULTURAL-HERITAGE COORDINATE INTAKE.**
