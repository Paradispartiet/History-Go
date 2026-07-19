# Oslo completeness — Oppdag Kvadraturen art sites batch 1

Date: 2026-07-19

## Purpose

This pass resolves the two candidates deliberately deferred from the first Oppdag Kvadraturen art-microplace batch:

1. `Den røde prikk` at Kongens gate 3 needed a physically correct canonical parent before it could be added to Wonderkammer.
2. `Skulptursonen i Øvre Slottsgate` is not one small artwork but a permanent public-art exhibition infrastructure and therefore needs to be evaluated as a place in its own right.

## `mustadgarden_kongens_gate_3`

### Representation decision

Create a canonical `historie` place for the building itself.

The house at Kongens gate 3 has independent historical value beyond the artwork on its facade. Heritage and architectural sources describe an older building core traditionally dated to around 1640, while later nineteenth-century reconstruction substantially changed the building's expression. Jacob Wilhelm Nordan is connected to alteration and extension work in 1883. Because the sources do not support one unambiguous construction year for the building as it stands today, the canonical record uses:

- `year: null`
- `period: ca. 1640–`

The text explicitly separates the older core from the later facade and reconstruction history instead of collapsing them into one false precise date.

### Coordinate decision

Normative address-first lookup:

- query: `Kongens gate 3 Oslo`
- status: `verified_candidate`
- one clear Geonorge address hit
- source object: `geonorge-adresser-v1:0301:13846:3`
- coordinate: `59.90925646800815, 10.740826309073695`

Saved evidence:

- `coordinates/mustadgarden_kongens_gate_3.json`

### Sources

- Oppdag Kvadraturen — Den røde prikk: https://www.oppdagkvadraturen.no/stoppesteder/den-rode-prikk-otto-kunzli
- Lokalhistoriewiki — Jacob Wilhelm Nordan: https://lokalhistoriewiki.no/Jacob_Wilhelm_Nordan
- Cultural-heritage metadata for Kongens gate 3 / Riksantikvaren monument 163490, used only as supporting date/context evidence

## `Den røde prikk`

### Representation decision

Add as a Wonderkammer `actual_site_treasure` under `mustadgarden_kongens_gate_3`.

This is now a physically exact parent relationship: the artwork is mounted on the facade of the canonical building itself.

The official Oppdag Kvadraturen material documents:

- artist: Otto Künzli
- year: 1996
- location: high on the facade of Kongens gate 3
- created in connection with an exhibition at Ram Galleri
- the red dot refers to the gallery convention of marking a sold artwork
- Künzli planned similar dots on buildings where he exhibited, while the total surviving number is uncertain
- the work belongs to Ram Galleri

New chamber ID:

- `wk_mustadgarden_kongens_gate_3_den_rode_prikk_otto_kunzli`

## `skulptursonen_ovre_slottsgate`

### Representation decision

Create a canonical `kunst` place.

The stable destination is the purpose-built public-art exhibition zone in the pedestrian street, not one fixed set of sculptures. The zone was launched in 2019 as part of the redesign of Øvre Slottsgate and was developed through collaboration between Norsk Billedhoggerforening, Oslo municipality's cultural administration and the urban-environment administration.

The site includes five specially adapted sculpture positions integrated with the pedestrian street. Documented later exhibition rounds show that the artworks rotate. The canonical place therefore describes:

- the permanent exhibition infrastructure;
- the five sculpture positions;
- the relationship between curation and ordinary street life;
- changing exhibitions over time.

It deliberately does **not** claim that works from any one documented exhibition round are still installed today.

### Coordinate decision

Oppdag Kvadraturen defines the art zone as the stretch of Øvre Slottsgate between Tollbugata and Prinsens gate.

The initial interpretation incorrectly treated OSM way `972903959` as the whole block. The saved Overpass response shows that the complete continuous pedestrian geometry between the two documented street boundaries is instead a four-way chain:

1. way `972903959`
2. way `995344351`
3. way `995344352`
4. way `306572322`

The chain runs continuously from:

- Tollbugata-side boundary: `59.9105601, 10.7399039`
- Prinsens-gate-side boundary: `59.9119100, 10.7412640`

Using the saved OSM geometry, the combined chain is approximately 168 metres long. The canonical coordinate is the length-weighted midpoint along the full four-way polyline:

- `59.9112353280587, 10.740582917313654`

Metadata:

- `sourceProvider: manual_research`
- `sourceObjectId: oppdag-kvadraturen:skulptursonen-i-ovre-slottsgate`
- `coordRole: line_anchor`
- `geocodeAccuracy: semantic_anchor`
- `coordType: exhibition_street_segment_midpoint`
- `coordStatus: verified_geometry`

The source identity is the officially bounded art zone; the OSM ways provide the physical street geometry used to calculate its line anchor. No single OSM way is claimed to represent the entire sculpture zone.

Saved evidence:

- `coordinates/skulptursonen_nominatim.json`
- `coordinates/ovre_slottsgate_overpass.json`

### Source-status note

The current Oppdag Kvadraturen service still presents the Skulptursonen as a stop. Norsk Billedhoggerforening documents rotating exhibition periods through 2024, and Oslo municipality documents the sculpture zone as part of the pedestrian-street conversion completed in 2019. Because individual works can change, the place record is intentionally programme-agnostic.

Official/source pages:

- Oppdag Kvadraturen — Skulptursonen i Øvre Slottsgate: https://www.oppdagkvadraturen.no/stoppesteder/skulptursonen-i-ovre-slottsgate
- Oslo kommune — Bilfritt byliv 2016–2023: https://www.oslo.kommune.no/byutvikling/bilfritt-byliv-2016-2023/
- Norsk Billedhoggerforening — project material for Øvre Slottsgate: https://www.norskbilledhoggerforening.no/prosjektkunst

## Output

Canonical places:

1. `mustadgarden_kongens_gate_3`
2. `skulptursonen_ovre_slottsgate`

Wonderkammer:

- `wk_mustadgarden_kongens_gate_3_den_rode_prikk_otto_kunzli`

This closes both deferred representation cases without assigning the facade artwork to a neighbouring building and without freezing a rotating art programme into a falsely permanent list of works. The corrected Skulptursonen anchor covers the full officially bounded Tollbugata–Prinsens gate street segment rather than only one constituent OSM way.
