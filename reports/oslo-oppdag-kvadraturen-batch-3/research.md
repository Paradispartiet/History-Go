# Oslo completeness — Oppdag Kvadraturen batch 3

Date: 2026-07-19

## Result

Batch 3 adds six physically distinct canonical places from five remaining straightforward stops in the Oppdag Kvadraturen core guide:

- `wessels_plass`
- `egertorget`
- `stortorget`
- `grev_wedels_plass`
- `amerikalinjen`
- `dfds_bygget`

The official source presents Amerikalinjen and DFDS together as one interpretive stop, but they are two separate buildings with separate addresses, architects and histories. History Go therefore represents them as two canonical places.

## Coordinate method

### Amerikalinjen

Normative address-first lookup:

- query: `Jernbanetorget 2 Oslo`
- official Geonorge object: `geonorge-adresser-v1:0301:13444:2`
- coordinate: `59.91076457251223, 10.749568439161244`

Saved evidence:
`coordinates/amerikalinjen.json`

### DFDS-bygget

Normative address-first lookup:

- query: `Karl Johans gate 1 Oslo`
- official Geonorge object: `geonorge-adresser-v1:0301:13630:1`
- coordinate: `59.91137749505985, 10.749403964838672`

Saved evidence:
`coordinates/dfds_bygget.json`

### Wessels plass

Kartverket Stedsnavn returned no place-name object for the square. The secondary OSM/Nominatim identity check returned two named objects:

1. OSM way `942267111`, `place=square`, polygon for Wessels plass
2. OSM node `6373811546`, bus stop named Wessels plass

The bus stop is explicitly rejected. The canonical place uses the exact square polygon and its geometric centre:

- `59.9124425, 10.7399720`
- source: `osm-way:942267111`

Saved evidence:
- `coordinates/wessels_plass_kartverket_stedsnavn.json`
- `coordinates/wessels_plass_nominatim.json`

### Egertorget

Kartverket Stedsnavn returned no place-name object. The OSM/Nominatim identity check returned one exact named polygon:

- OSM relation `4546219`
- named `Egertorget`
- pedestrian-area geometry
- geometric centre: `59.9129076, 10.7418830`

Saved evidence:
- `coordinates/egertorget_kartverket_stedsnavn.json`
- `coordinates/egertorget_nominatim.json`

### Stortorget

Kartverket Stedsnavn returned no place-name object. The OSM/Nominatim identity check returned one exact square polygon:

- OSM way `179095465`
- main OSM name: `Stortorvet`
- `alt_name`: `Stortorget`
- `place=square`
- geometric centre: `59.9127766, 10.7451906`

History Go keeps the canonical name `Stortorget`, matching Oppdag Kvadraturen and current common usage, while documenting the OSM main-name variant.

Saved evidence:
- `coordinates/stortorget_kartverket_stedsnavn.json`
- `coordinates/stortorget_nominatim.json`

### Grev Wedels plass

Kartverket Stedsnavn returned one active object, but it is an `Adressenavn` geometry spanning road segments. Its representational point is therefore not a defensible centre for the park itself and is rejected as the canonical map anchor.

The OSM/Nominatim identity check returned:

1. OSM way `33610051`, `leisure=park`, exact named polygon for Grev Wedels plass
2. two road/service segments carrying the same name

The road segments are rejected. The canonical place uses the exact park polygon and its geometric centre:

- `59.9073388, 10.7429473`
- source: `osm-way:33610051`

Saved evidence:
- `coordinates/grev_wedels_plass_kartverket_stedsnavn.json`
- `coordinates/grev_wedels_plass_nominatim.json`

No batch 3 place uses a guessed neighbour address or an arbitrary map-centre point.

## Historical/source decisions

### Wessels plass

Oppdag Kvadraturen documents the square as the meeting point of Stortingsgata, Akersgata, Prinsens gate and Nedre Vollgate. Before the modern square, the site included the rocky `Bukkebjerget`, associated with the old fortification line. The municipality acquired and cleared the Huitfeldt property in 1873, the park was established around 1880, and the current name was adopted in 1891 after Johan Herman Wessel.

Canonical `year: 1880` marks the establishment of the park/square form represented on the map. The later 1891 renaming remains explicit in the text.

Source:
https://www.oppdagkvadraturen.no/stoppesteder/wessels-plass

### Egertorget

Oppdag Kvadraturen identifies 1846 as the year when the old eastern street of Kvadraturen was connected to the new Slottsveien across the square, forming the continuous axis later known as Karl Johans gate. The square also sits at the high point of that street, with sight lines east toward Jernbanetorget and west toward the Royal Palace.

Canonical `year: 1846` therefore represents the physical urban connection that created the modern square condition.

Source:
https://www.oppdagkvadraturen.no/stoppesteder/egertorget

### Stortorget

The new market square was prepared in the 1730s. Oppdag Kvadraturen states that the annual Christiania market moved here in 1737, after the square had been formally inaugurated the previous year. The site lay at the former main entrance through the town fortifications and became the principal meeting point between urban residents and goods arriving from the surrounding countryside.

Canonical `year: 1737` marks the start of Stortorget's role as the city's principal market square.

Source:
https://www.oppdagkvadraturen.no/stoppesteder/stortorget

### Grev Wedels plass

After parts of Akershus festning's outer defensive works were removed, the area was considered for major state institutions. Plans included buildings for the Storting and the Supreme Court, but they were never realised. The area was instead established as a park in 1869. Later layers include early petrol infrastructure, parking and wartime use, followed by the reconstruction of Militærhospitalet nearby in the 1980s.

Canonical `year: 1869` marks the establishment of the park represented by the canonical place.

Sources:
- https://www.oppdagkvadraturen.no/stoppesteder/grev-wedels-plass
- https://www.oppdagkvadraturen.no/stoppesteder/grev-wedels-plass-bankplassen

### Amerikalinjen

The Den Norske Amerikalinje building at Jernbanetorget 2 was erected in 1916–1919 after an architectural competition won by Andreas Bjercke and Georg Eliassen. It combined headquarters functions with passenger-facing spaces for travellers using the company's transatlantic routes.

Canonical `year: 1919` marks completion of the building.

### DFDS-bygget

The neighbouring DFDS building at Karl Johans gate 1 was designed by Magnus Poulsson and completed in 1918. The building is architecturally distinct from Amerikalinjen and has its own maritime facade programme and separate address. Its setback also records an unrealised plan to widen the lower part of Karl Johans gate.

Canonical `year: 1918` marks completion of the building.

Shared official source:
https://www.oppdagkvadraturen.no/stoppesteder/amerikalinjen-og-dfds

## Remaining core-guide representation cases

After batches 1–3, the straightforward physically distinct gaps from the 33-stop historical core have largely been exhausted. The remaining work is primarily representation and overlap analysis:

- `Kontraskjæret` — canonical place-level audit versus existing Wonderkammer references and Akershus-festning coverage
- `Tollboden, Tollpakkhuset og havna` — determine whether the surviving Tollpakkhuset needs a separate building marker from `tollbukaia`
- `Østbanestasjonen` — determine whether the historic station building should be separated from `oslo_s` and `jernbanetorget`
- `Paléhaven og Paleet` — surviving garden/place layer plus demolished royal residence; likely historical-site/time-layer decision
- `Christiania Theater og Norges Bank` — demolished theatre versus standing Bankplassen 4 building; must be split conceptually before representation
- `Forretningspalasser fra 1890-årene` — thematic multi-building stop and likely knowledge/route content rather than one canonical map marker

The wider live Oppdag Kvadraturen service contains additional art, facade and detail stops beyond the historical core. Small physical details should normally be routed to Wonderkammer rather than create dense overlapping map markers.
