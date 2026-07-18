# Etne by batch 1 — research and audit

## Scope

First dedicated `by` batch for Etne. The batch intentionally separates broad settlement/urban-area records from concrete transport and public-space anchors.

Selected IDs:

- `etnesjoen_tettstad`
- `etnesjoen_torg_og_kai`
- `skanevik_sentrum`
- `skanevik_ferjekai`
- `kyrping_handelsstad`

## Duplicate gate

Current `main` was searched before file creation for the selected IDs and for the name variants Etnesjøen / Etne sentrum, Skånevik sentrum / tettstad / ferjekai and Kyrping / handelsstad. No existing canonical `by` records for these five candidates were found.

Existing nearby records are intentionally different objects:

- `folgefonden_minnesmerke_skanevik` is a memorial at the quay area, not the ferry terminal as transport infrastructure.
- `skanevik_kyrkjestad` is the historical church site, not the town-centre environment.
- `skanevik_gjestgjevargarden` is a specific historic property, not the full centre.
- `etnesjoen_forromersk_landsby` is an archaeological landscape, not the modern town.

## Sources and editorial basis

### Etnesjøen / Etne sentrum

Store norske leksikon, “Etne (tettstad)” (updated 2 March 2026): identifies Etne/Etnesjøen as the administrative centre, located by E134 and Etnepollen, and the largest settlement in the municipality.

Source: https://snl.no/Etne_-_tettstad

The place record is an area-level settlement anchor. During integration, the marker should use the official Kartverket/Geonorge address point for Etne tinghus, Sjoarvegen 20, as a representative civic-centre point. It must not be described as the formal boundary of the settlement.

### Etnesjøen torg og kai

Etne municipality describes the Etnesjøen waterfront as historically tied to boat calls, market trade and transport, with the fjord formerly serving as a main artery. The current planning project covers transformation of the square, quay and waterfront promenade.

Sources:

- https://www.etne.kommune.no/aktuelt/sjoparken-i-etne-ein-framtidsretta-moteplass.12597.aspx
- https://www.etne.kommune.no/aktuelt/detaljregulering-for-etnesjoen-torg-og-kaiomrade.12894.aspx

The integration should resolve Sjoarvegen 2 through Kartverket/Geonorge as a representative point inside the documented torg/kai planning area; the point is not claimed as the exact plan boundary.

### Skånevik sentrum

Store norske leksikon identifies Skånevik as one of Etne municipality's two settlements and notes long traditions of boat production and associated woodworking/workshop industry. The municipality/SNL also describes Skånevik as having distinctive older and well-preserved building traditions.

Sources:

- https://snl.no/Sk%C3%A5nevik_-_tettstad
- https://snl.no/Etne

The centre record is intentionally an area-level built-environment/town-centre anchor. The integration should use the official address point for Skånevikvegen 8 as a representative central point, not as a formal culture-environment boundary.

### Skånevik ferjekai

Skyss lists Skånevik–Matre–Utåker among the county ferry services operated by Boreal Sjø. The ferry quay is therefore a current regional transport node distinct from the town-centre area record.

Source: https://www.skyss.no/en/about/job-opportunities/the-ferry-companies/

The anchor uses the documented ferry-terminal/quayfront location around 59.7334, 5.9327. It must be cross-checked against `folgefonden_minnesmerke_skanevik`; overlap is expected because the memorial stands at the same quayfront, but the two records represent different physical/function objects.

### Kyrping handelsstad

Store norske leksikon describes Kyrping as an old trading place in Etne municipality on the south side of Åkrafjorden.

Source: https://snl.no/Kyrping

No single surviving building is used as a proxy for the entire historical trading place. The record therefore uses an explicitly representative locality anchor at approximately 59.7500, 6.11667 with a broad radius.

## Coordinate-confidence rules

- `etnesjoen_tettstad`: official address point, representative settlement/civic-centre anchor.
- `etnesjoen_torg_og_kai`: official address point, representative torg/quay-area anchor.
- `skanevik_sentrum`: official address point, representative centre/built-environment anchor.
- `skanevik_ferjekai`: concrete ferry-terminal/quayfront anchor, cross-checked against existing memorial location.
- `kyrping_handelsstad`: representative locality/trading-place anchor; uncertainty explicitly disclosed.

## Category rationale

All five records belong in `by` because their primary function is settlement structure, public urban space, built environment or transport-node geography. Historical context remains a quiz angle but is not the primary category.
