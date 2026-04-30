# Place data content report – subkultur

Dato: 2026-04-30

## Ferdigstilte steder
- `sofienbergparken_subkultur`
- `hausmania`
- `skur13`
- `torggata_blad`
- `stovnertarnet`

## Felter lagt til/ferdigstilt
For alle fem steder er følgende felter nå utfylt:
- `popupDesc`
- `emne_ids`
- `quiz_profile`

## Brukte `emne_ids`
- `sofienbergparken_subkultur`: `em_sub_grunnbegreper`, `em_sub_stil_kropp_symboler`
- `hausmania`: `em_sub_grunnbegreper`, `em_sub_musikkscener`
- `skur13`: `em_sub_grunnbegreper`, `em_sub_stil_kropp_symboler`
- `torggata_blad`: `em_sub_grunnbegreper`, `em_sub_stil_kropp_symboler`
- `stovnertarnet`: `em_sub_grunnbegreper`

Alle `emne_ids` er verifisert mot eksisterende id-er i `data/fag/subkultur/emner_subkultur.json`.

## Asset-status (ikke rettet i denne runden)
Følgende asset-problemer står igjen i `places_subkultur.json`:
- `sofienbergparken_subkultur`: ødelagt `cardImage` path
- `hausmania`: mangler `image` og `cardImage`
- `skur13`: mangler `image` og `cardImage`
- `torggata_blad`: mangler `image` og `cardImage`
- `stovnertarnet`: mangler `image` og `cardImage`

Ingen nye bildebaner er lagt til i denne runden.

## Audit før/etter (`places_subkultur.json`)
Før (audit kjørt før innholdsarbeid):
- Manglende `popupDesc`: 4 av 5 steder
- Manglende `emne_ids`: 5 av 5 steder
- Manglende `quiz_profile`: 5 av 5 steder

Etter (audit kjørt etter innholdsarbeid):
- Manglende `popupDesc`: 0 av 5 steder
- Manglende `emne_ids`: 0 av 5 steder
- Manglende `quiz_profile`: 0 av 5 steder

## Globale place-referanser
- Bekreftet: globale ugyldige place-referanser er fortsatt **0**.
