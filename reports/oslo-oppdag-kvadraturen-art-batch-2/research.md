# Oslo completeness — Oppdag Kvadraturen art batch 2

Date: 2026-07-19

## Purpose

This batch resolves the two art stops deliberately deferred from Wonderkammer art batch 1 because neither had a physically correct existing canonical parent.

The representation rule remains physical specificity:

- a permanent artwork tied to one exact building can be a canonical art place when no suitable parent exists;
- a deliberately designed public exhibition zone can be a canonical art area when the place itself persists independently of rotating works;
- historical exhibition contents must not be presented as current permanent inventory without current evidence;
- neighbouring buildings are not used as proxy parents merely to avoid creating a justified place.

## `den_rode_prikk`

### Identity

Oppdag Kvadraturen documents Otto Künzli's `Den røde prikk` high on the facade of Kongens gate 3. The work was installed in 1996 in connection with Künzli's first Norwegian exhibition at Ram Galleri, then located in the building.

The red dot enlarges the small gallery mark traditionally used to indicate that an artwork has been sold. Oppdag Kvadraturen describes Künzli's plan to attach similar dots to buildings where he exhibited, turning the building itself into the apparent sold object.

Ram Galleri occupied Kongens gate 3 from 1989 to 2016 and later returned to Kongens gate at number 15. The facade work remained at number 3. The canonical marker therefore represents the permanent artwork at its original building, not the gallery's current location.

Official source:

- https://www.oppdagkvadraturen.no/stoppesteder/den-rode-prikk-otto-kunzli

### Coordinate decision

The repository's normative address-first finder was run for `Kongens gate 3 Oslo` and returned one unambiguous Geonorge address candidate:

- source object: `geonorge-adresser-v1:0301:13846:3`
- coordinate: `59.90925646800815, 10.740826309073695`
- accuracy: `rooftop`

The address point is used as a display marker for the building carrying the facade work. It is not claimed to be a point measurement of the elevated red circle itself.

Raw evidence:

- `reports/oslo-oppdag-kvadraturen-art-batch-2/coordinates/den_rode_prikk_address.json`

### Representation decision

Create canonical `kunst` place `den_rode_prikk`.

Reason: this is a stable, physically specific public artwork at one exact address and no existing canonical place correctly represents Kongens gate 3.

## `skulptursonen_ovre_slottsgate`

### Identity

Oppdag Kvadraturen locates Skulptursonen in Øvre Slottsgate specifically between Prinsens gate and Tollbugata. The sculpture zone was launched in August 2019 together with the conversion of Øvre Slottsgate to a pedestrian street.

The project is a collaboration between Norsk Billedhoggerforening, Oslo kommune Kulturetaten and Oslo kommune Bymiljøetaten. The block received an architect-designed exhibition field with seating, planting and five specially adapted sculpture zones.

Oslo kommune records that Øvre Slottsgate was completed as a new pedestrian street with trees, paving and a sculpture zone in June 2019.

Norsk Billedhoggerforening documents successive exhibition periods through 2024. This means the individual works are rotating programme content rather than permanent inventory. The physical exhibition infrastructure and the bounded street site are the stable place layer.

Sources:

- https://www.oppdagkvadraturen.no/stoppesteder/skulptursonen-i-ovre-slottsgate
- https://www.oslo.kommune.no/byutvikling/bilfritt-byliv-2016-2023/
- https://www.norskbilledhoggerforening.no/prosjektkunst

### Coordinate decision

A Nominatim search for `Øvre Slottsgate, Oslo, Norge` returned several separate mapped pedestrian segments rather than one continuous object for the sculpture-zone block.

The two relevant adjacent named OSM pedestrian ways are:

- way `972903959`, ending north at `59.9112499, 10.7405978`
- way `37046993`, beginning south at `59.91191, 10.741264`

The official sculpture zone lies in the intervening block identified by Oppdag Kvadraturen as Tollbugata–Prinsens gate. The canonical marker therefore uses the semantic midpoint between those two documented boundary anchors:

- `59.91157995, 10.7409309`

This is a `line_anchor`, not a claimed location for any one sculpture.

Raw evidence:

- `reports/oslo-oppdag-kvadraturen-art-batch-2/coordinates/skulptursonen_ovre_slottsgate_nominatim.json`
- `reports/oslo-oppdag-kvadraturen-art-batch-2/coordinates/skulptursonen_ovre_slottsgate_candidates.tsv`

### Representation decision

Create canonical `kunst` place `skulptursonen_ovre_slottsgate`.

Reason: the five-zone exhibition field is a deliberately designed and geographically bounded public-art destination. The place remains meaningful even as individual exhibitions rotate. Historical works from 2019–2024 are not asserted as current unless separately verified.

## Batch output

Canonical places:

1. `den_rode_prikk`
2. `skulptursonen_ovre_slottsgate`

No Wonderkammer child is required merely to make either place visible. Future source-driven passes can add documented individual exhibition works as time-bounded Wonderkammer layers without changing the canonical site identities.
