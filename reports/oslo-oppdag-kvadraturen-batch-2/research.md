# Oslo completeness — Oppdag Kvadraturen batch 2

Date: 2026-07-19

## Result

Batch 2 adds six physically distinct stops from the official Oppdag Kvadraturen core guide that were absent as active canonical History Go places:

- `hotel_du_nord` — Dronningens gate 13
- `garmanngarden` — Rådhusgata 7
- `cafe_engebret` — Bankplassen 1B (public visitor address: Bankplassen 1)
- `stattholdergarden` — Rådhusgata 11
- `waisenhuset_kongens_gate` — Kongens gate 1
- `myntgatakvartalet` — Myntgata 2

## Coordinate method

All candidates were run through the repository's normative address-first coordinate finder and the terminal output is saved under `reports/oslo-oppdag-kvadraturen-batch-2/coordinates/`.

Five candidates resolved directly from the addresses used by Oppdag Kvadraturen. `Bankplassen 1 Oslo` returned several Geonorge candidates and was therefore not accepted. A building-identity check established that the historic Engebret Café building is Bankplassen 1B. The normative finder was rerun with `Bankplassen 1B Oslo` and returned one clear official address point.

No coordinate was selected manually from an ambiguous result.

## Representation notes

### Hotel du Nord

Represented in `naeringsliv` because the surviving place tells a continuous economic history from elite residence and hotel to a large late-nineteenth-century commercial and warehouse complex. The canonical year `1859` marks the rebuilding after the fire; older layers remain explicit in the text.

Official source:
https://www.oppdagkvadraturen.no/stoppesteder/dronningensgate-13-hotel-du-nord

### Garmanngården

Represented in `historie` as a multi-layered civic site: one of the oldest surviving Kvadraturen buildings, the city's second town hall, court and performance venue, and a police station for more than two centuries. The canonical year `1647` marks the phase when the building received much of its present form; earlier remains and the 1625–1630 construction period are preserved in the description.

Official source:
https://www.oppdagkvadraturen.no/stoppesteder/radhusgata-7-garmanngarden

### Café Engebret

Represented in `naeringsliv` as a still-living historic restaurant and long-term cultural/political meeting place. The primary Oppdag Kvadraturen source dates the Bankplassen opening to 1862; other historical sources use 1863. The record states this source difference rather than hiding it.

The canonical map marker uses the unambiguous official address point for Bankplassen 1B. This is the building identified as Engebret Café in the address-history cross-check; the business itself and Oppdag Kvadraturen use the simplified visitor address Bankplassen 1.

Sources:
- https://www.oppdagkvadraturen.no/stoppesteder/bankplassen-1-cafe-engebret
- https://www.engebret-cafe.no/
- https://oslobyleksikon.no/side/Engebrets_Caf%C3%A9

### Stattholdergården

Represented in `historie` as a 1640s town house tied to royal administration, the Grüner mint-master family, the 1716 siege and later restaurant history.

Official source:
https://www.oppdagkvadraturen.no/stoppesteder/stattholdergarden

### Waisenhuset

Represented in `historie` as both an exceptionally old town house and a major social-history institution. The main Oppdag Kvadraturen stop dates the building to 1683; later alterations and the orphanage period 1778–1918 are kept separate from that construction date.

Official source:
https://www.oppdagkvadraturen.no/stoppesteder/kongens-gate-1-waisenhuset

### Myntgatakvartalet

Represented in `historie` as one place with several explicit time layers. The current address marker is for the standing nineteenth-century complex and must not be read as an exact coordinate for the vanished seventeenth-century mint workshop. The canonical year `1861` marks the Artillery Stable, the earliest principal standing building highlighted by the official source, while the site history back to the royal mint of 1628 is retained in the text.

Official source:
https://www.oppdagkvadraturen.no/stoppesteder/myntgata-2-myntgatakvartalet

## Next queue

The remaining core-guide audit should continue with the next physically distinct candidates and the overlap cases kept out of batches 1–2:

- Wessels plass
- Egertorget
- Stortorget
- Amerikalinjen and DFDS
- Grev Wedels plass
- Kontraskjæret
- Tollpakkhuset / Tollboden overlap with `tollbukaia`
- Østbanestasjonen overlap with `oslo_s` and `jernbanetorget`
- Paléhaven / Paleet historical-site representation
- Christiania Theater / later Norges Bank representation
- thematic multi-building stop `Forretningspalasser fra 1890-årene`

Small artworks and facade details from the wider 60-stop live service remain candidates for Wonderkammer rather than separate map markers.
