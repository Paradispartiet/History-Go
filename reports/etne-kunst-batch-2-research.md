# Etne kunst/kultur batch 2 – research

## Scope

This batch adds three concrete Etne culture-production and live-culture anchors under the repository's canonical `kunst` category:

- `old_river_saloon_etne`
- `abc_studio_etne`
- `fugl_fonix_etne`

Current `main` was searched for the selected IDs, names and relevant variants before creation. No existing canonical place records were found.

## 1. Old River Saloon

**Decision:** include as `kunst`.

The venue's own site documents a permanent indoor stage, live music, dance floor and the public visiting address `Stadionvegen 35, 5590`. The canonical justification is the physical live-music and event function, not pub or restaurant operations.

Sources:
- https://www.saloon.no/
- https://www.saloon.no/kontakt

Editorial gate:
- ask about live music, concert culture, country/dance culture and the physical stage
- avoid reducing the place to a generic pub
- coordinate must be resolved against Kartverket/Geonorge before merge

## 2. ABC Studio

**Decision:** include as `kunst`.

Brønnøysundregistrene lists ABC Studio AS at `Enge gamle skule, 5590 Etne` with industry code 59.200, production and publishing of music and sound recordings. Company data dates establishment to 1987. A 2023 profile describes the studio environment as a professional sound-technology hub working with studio production, tours, concerts and stage productions.

Sources:
- https://virksomhet.brreg.no/nb/oppslag/enheter/945883472
- https://utdanning.no/finnlarebedrift/bedrift/872699252/
- https://medvind24.no/aktuelt/lydstudio-opp-av-oska
- https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=151

Editorial gate:
- treat the physical studio as a music-production place
- do not duplicate modern Enge skule as an education place
- resolve the physical anchor through Kartverket/Geonorge; use the documented Enge gamle skule location and test `Sillavegen 2` as the street-address fallback

## 3. Fugl Fønix

**Decision:** include as `kunst` despite the venue also operating as a hotel.

The venue's own site states that it is especially known for evening events including stand-up, theatre and hundreds of concerts over the years. Fjord Norway describes Fugl Fønix as a meeting place with art, music and people at the centre and as an arena for creativity and culture. This gives the physical place a substantial independent cultural function beyond accommodation.

Sources:
- https://www.fuglfonix.com/the-hotel
- https://www.fuglfonix.com/contact
- https://www.fjordnorway.com/no/reiseinspirasjon/fugl-fonix-i-etne-et-25-ar-langt-bidrag-til-ei-levende-bygd--
- https://virksomhet.brreg.no/nb/oppslag/enheter/989144944

Editorial gate:
- ask about the documented cultural programme and meeting-place role
- avoid generic hotel/restaurant questions
- use the official address `Torget 1, 5590 Etne`
- audit proximity to `etnesjoen_torg_og_kai`; nearby coordinates are acceptable only because the objects/functions are distinct

## Batch-level decisions

- No generic festival-only marker is added.
- No separate restaurant or accommodation records are created.
- The three records represent distinct physical cultural functions: live performance, music production, and a mixed cultural meeting place.
- All source files must be registered exactly once in `data/places/manifest.json` and included exactly once in the active runtime index before merge.
