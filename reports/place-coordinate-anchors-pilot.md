# Place coordinate anchors pilot

## Endrede filer
- `js/ui/popup-utils.js`
- `js/core/pos.js`
- `data/places/places_by.json`

## Pilotsteder som fikk `anchors`
- `akerselva`
- `ring_3`
- `trikk_17_18`
- `karl_johan`

## Hvorfor anchor-punktene er valgt
- **Akerselva**: Tre punkter (Frysja, Vulkan, utløp) dekker nord/midt/sør i en lang elvekorridor, slik at unlock skjer der brukeren faktisk møter elva.
- **Ring 3**: Punkter ved Smestad, Sinsen og Helsfyr dekker vest/sentralt/øst i en lineær trafikkstruktur.
- **Trikkelinje 17/18**: Punkter ved Rikshospitalet, Stortorvet og Sinsen dekker en representativ del av den tverrgående traseen.
- **Karl Johans gate**: Punkter ved Jernbanetorget, Stortinget og Slottsplassen dekker gateaksen fra øst til vest.

## Bakoverkompatibilitet
- Eksisterende `lat`/`lon`/`r` er beholdt uendret for alle pilotsteder.
- Ingen felt er fjernet.
- `anchors` er valgfritt, og brukes kun i unlock/distance-sjekk.

## Fallback-logikk
- Ny helper `getPlaceUnlockAnchors(place)` returnerer:
  1. gyldige `place.anchors` (kun støttede typer + gyldige tallverdier), eller
  2. ett fallback-anchor basert på `place.lat`/`place.lon`/`place.r`.
- Dermed fortsetter steder uten `anchors` å fungere identisk med tidligere logikk.

## Scope-begrensning
- Ingen endringer i quiz-logikk.
- Ingen endringer i profil-logikk.
- Ingen endringer i place-card layout.
- Ingen tekst-/bilde-/faginnhold er endret utover ny valgfri koordinatstruktur.
