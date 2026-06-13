# AHA Music → History Go

History Go leser stedskoblinger fra AHA Music som statiske JSON-filer i
`data/integrations/aha-music/`:

- `musicArtistPlaceRelations.json`
- `musicTrackPlaceRelations.json`
- `musicHistoryGoBridgeReport.json`

De to relasjonsfilene er obligatoriske. Bridge-rapporten er valgfri i runtime.
Filene kan være en JSON-liste eller et objekt med henholdsvis
`artistPlaceRelations` og `trackPlaceRelations`.

## Koblingsregel

Bare relasjoner med en ikke-tom `historyGoPlaceId` blir indeksert og vist.
Verdien må være en eksisterende `id` i `data/places/places_index.json`.
Relasjoner uten placeId beholdes i `HGAhaMusic.state.candidates`, men vises ikke
på PlaceCard eller i «Musikk»-fanen.

Runtime-indeksen finnes som `window.HGAhaMusic.state.musicByPlace` og
`window.HG_MUSIC_BY_PLACE`. Hvert sted inneholder normaliserte `artists`,
`tracks`, `relationTypes`, `statuses` og `confidenceSummary`. Loaderen støtter
både camelCase- og snake_case-felter fra bridge-eksporten.

## Oppdatere data

1. Eksporter bridge-filene fra AHA Music.
2. Erstatt filene i `data/integrations/aha-music/`.
3. Kjør `npm run audit:aha-music`.

Auditen er read-only. Den rapporterer antall artist- og sangrelasjoner, unike
steder, manglende/ukjente placeId-er og topplister for steder med flest artister
og sanger.

## Brukerflate

Steder med gyldige musikkrelasjoner får en «Musikk»-runding på PlaceCard, en
detaljvisning med relasjon/status/confidence og en oppføring i Utforsk-panelets
«Musikk»-fane. Steder uten gyldige relasjoner viser ingen musikkrunding eller tom
musikkseksjon.
