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

## Music unlocks v1

History Go turns AHA Music relations into collectible unlock objects at runtime, without creating a second place index. The source of truth remains `window.HGAhaMusic.state.musicByPlace` / `window.HG_MUSIC_BY_PLACE`, keyed as `placeId → artists/tracks`.

Unlockable object types:

- `music_artist`: artist relation with `id`, `artistId`, `artistName`, `spotifyArtistId`, `placeId`, `relationType`, `confidence`, `status`, `sourceNote` and `unlockText`.
- `music_track`: track relation with `id`, `trackId`, `trackTitle`, `artistId`, `artistName`, `placeId`, `relationType`, `confidence`, `status` and `unlockText`.

IDs are deterministic so the same place/music relation cannot be counted twice:

- `music_artist__{placeId}__{artistId}`
- `music_track__{placeId}__{trackId}`

If AHA Music lacks `artistId` or `trackId`, runtime falls back to `name_{normalizedName}`. This fallback is deterministic, but the preferred stable key is still the AHA/Spotify-side id.

Only relations with a valid `historyGoPlaceId`/`placeId` and status `verified`, `auto_matched`, `automatic` or `matched` are unlockable. `rejected` and missing-place relations are not unlockable. `suggested` relations can remain visible as bridge data later, but this MVP does not grant full collection progress for them.

Unlocked music is stored in localStorage under:

```json
{
  "music_artist__oslo__aha": {
    "id": "music_artist__oslo__aha",
    "type": "music_artist",
    "title": "a-ha",
    "placeId": "oslo",
    "unlockedAt": "ISO_DATE",
    "source": "aha_music"
  }
}
```

The key is `hg_unlocked_music_objects_v1`. Runtime helpers are exposed on `window.HGAhaMusic`:

- `getUnlockableObjectsForPlace(placeId)`
- `unlockMusicObject(musicObject)`
- `isMusicObjectUnlocked(id)`
- `getUnlockedMusicObjects()`
- `getMusicUnlockSummary()`

A new unlock writes storage and dispatches `window.dispatchEvent(new Event("updateProfile"))`, so the mini/profile UI can refresh live. Duplicate unlocks return the existing object and do not dispatch a second profile update.

Profile v1 shows a compact music status: “Musikkfunn”, artists unlocked, tracks unlocked and places with music. The existing collection tab also has a small “Musikk” group for artists and songs. Later extensions can reuse the same object ids for music quizzes, route steps and canon/music-history paths without changing the storage contract.
