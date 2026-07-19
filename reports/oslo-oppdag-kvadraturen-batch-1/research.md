# Oslo completeness — Oppdag Kvadraturen batch 1

Date: 2026-07-19

## Source

This completeness pass uses **Oppdag Kvadraturen**, the mobile historical interpretation platform operated by Oslo kommune through Kulturetaten and Byantikvaren.

The live service currently presents 60 stops and 10 themed walks. The printable core guide contains 33 historical/architectural stops and is used as the bounded first audit set.

Sources:

- https://www.oppdagkvadraturen.no/
- https://www.oppdagkvadraturen.no/stoppesteder
- https://www.oppdagkvadraturen.no/uploads/system/Oppdag-Kvadraturen-A4-pdf.pdf
- https://www.oppdagkvadraturen.no/om-oss

## Audit method

For each core stop:

1. search current canonical place IDs, names, aliases and address references on `main`;
2. distinguish canonical coverage from quiz/story/Wonderkammer-only mentions;
3. reject thematic grouping stops that do not represent one spatially distinct place;
4. avoid new markers where an existing place already represents the same physical object or complex;
5. for new addressable places, run the repository's normative address-first Geonorge finder and save the full terminal result before writing canonical data.

## Batch 1 additions

Seven physically distinct, addressable stops were absent as active canonical places and are added in this batch:

| ID | Oppdag Kvadraturen stop | Address | Category | Decision |
| --- | --- | --- | --- | --- |
| `steen_og_strom` | Steen & Strøm | Kongens gate 23 | `naeringsliv` | new canonical place |
| `centralbanken_kirkegata` | Centralbanken | Kirkegata 18 | `naeringsliv` | new canonical place |
| `kirkeristen_basarene_brannvakten` | Kirkeristen, Basarene og Brannvakten | Dronningens gate 27 | `historie` | one shared canonical marker for the connected complex |
| `kafe_grei` | Kafé Grei | Skippergata 3 | `naeringsliv` | new canonical place for the surviving building / former venue |
| `borsen_oslo` | Børsen | Tollbugata 2 | `naeringsliv` | new canonical place |
| `treschowgarden` | Treschowgården | Fred. Olsens gate 2 | `naeringsliv` | new canonical place |
| `den_gamle_krigsskolen` | Den gamle Krigsskolen | Tollbugata 10 | `historie` | new canonical place |

All seven produced a clear official address candidate in the saved Geonorge outputs under `reports/oslo-oppdag-kvadraturen-batch-1/coordinates/`.

## Core stops already represented before this batch

The first audit pass confirms existing canonical coverage for at least:

- Akershus festning
- Christiania Torv
- Gamle Rådhus
- Rådmannsgården og Anatomibygget
- Oslo domkirke
- Oslo Havnelager
- Hovedpostkontoret
- Magistratgården
- Nasjonalmuseet Arkitektur / den første Norges Bank-bygningen at Bankplassen 3 (`grunnlovsbygget_bankplassen`)

These should not receive duplicate canonical markers.

## Stops needing a separate overlap or representation decision

- **Kontraskjæret** — the name already occurs in Wonderkammer material, but canonical coverage still needs a direct place-level audit.
- **Forretningspalasser fra 1890-årene** — thematic multi-building stop; likely route/knowledge content rather than one canonical place.
- **Tollboden, Tollpakkhuset og havna** — partly represented by `tollbukaia`; requires a physical overlap audit before deciding whether the surviving Tollpakkhuset deserves a separate building marker.
- **Østbanestasjonen** — physically distinct historic station building, but already deeply embedded in the `oslo_s` / `jernbanetorget` content; needs an explicit overlap decision rather than an automatic marker.
- **Paléhaven og Paleet** — combines a surviving place layer with a demolished royal residence; may require a historical-site anchor or a time-layer representation instead of a normal building marker.
- **Christiania Theater og Norges Bank** — combines a demolished theatre with the later Bankplassen 4 bank building and must be split conceptually before representation.

## Next core-stop queue

Pending full duplicate/address audit after batch 1:

- Wessels plass
- Egertorget
- Stortorget
- Amerikalinjen og DFDS
- Hotel du Nord
- Garmanngården
- Café Engebret
- Stattholdergården
- Grev Wedels plass
- Waisenhuset
- Myntgatakvartalet

The live service also contains newer art and thematic stops beyond the original 33-stop core. These should be audited after the core historical places, with small artworks and facade details normally routed to Wonderkammer rather than new map markers.

## Coordinate evidence

Saved normative address results:

- `coordinates/steen_og_strom.json`
- `coordinates/centralbanken.json`
- `coordinates/kirkeristen_basarene_brannvakten.json`
- `coordinates/kafe_grei.json`
- `coordinates/borsen.json`
- `coordinates/treschowgarden.json`
- `coordinates/den_gamle_krigsskolen.json`

No coordinate in the canonical records was invented or copied from a generic map-centre guess.
