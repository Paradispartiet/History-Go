# Minimal datastruktur

Dette er en dokumentert JSON-struktur for første Kunstakademiet-seed. Repoet bruker TypeScript i roten, men denne spillmappen innfører ikke ny TypeScript-runtime nå.

## Artwork

- `id`: stabil seed-id.
- `title`: visningsnavn.
- `artistIds`: lokale artist-referanser.
- `placeIds`: lokale eller framtidige History Go placeId-referanser.
- `eraIds`: epoker/stilarter.
- `techniqueIds`: teknikker spilleren kan øve på.
- `description`: kort dev-beskrivelse.
- `sourceNote`: markerer at dette er seed-/dev-data.

## Artist

- `id`
- `name`
- `personId`: valgfri framtidig History Go-personreferanse.
- `eraIds`
- `techniqueIds`
- `linkedPlaceIds`
- `description`

## ArtPlace

- `id`
- `name`
- `placeId`: valgfri framtidig History Go-stedsreferanse.
- `kind`: museum, park, offentlig kunststed eller annet.
- `unlocks`: oppgaver, kunstnere eller verk som kan åpnes.

## Technique

- `id`
- `name`
- `progressAxis`: `blikk`, `teknikk` eller `kunsthistorie`.
- `levelWords`: korte nivåord for progresjon.

## Era

- `id`
- `name`
- `periodHint`
- `description`

## ArtTask

- `id`
- `title`
- `type`: `observation`, `analysis` eller `sketch`.
- `placeIds`, `artistIds`, `artworkIds`
- `prompt`
- `steps`
- `rewards`: poeng i progresjonsaksene.
- `portfolioOutputType`: `note`, `sketch-note` eller `analysis-note`.
- `unlocksTaskIds`

## ProgressState

- `playerId`
- `currentTaskId`
- `completedTaskIds`
- `unlockedTaskIds`
- `axes`: poeng i `blikk`, `teknikk`, `kunsthistorie`.
- `portfolioItemIds`

## PortfolioItem

- `id`
- `taskId`
- `artworkId`
- `artistId`
- `placeId`
- `createdAt`
- `outputType`
- `title`
- `playerText`
- `rewardedAxes`
