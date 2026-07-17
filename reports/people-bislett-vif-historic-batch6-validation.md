# Bislett Stadion – historiske Vålerenga-profiler, batch 6: validering

## Valgt historisk femmer

- `roy_helge_olsen` er inkludert som klubbikon fra laget som ga Vålerenga det første seriegullet i 1965.
- `rolf_aaberg` er inkludert for cupgullet i 1980 og seriegullet i 1981, to sentrale Bislett-meritter.
- `lars_bohinen` er inkludert for en sammenhengende Vålerenga-periode i den sene Bislett-epoken før den videre landslags- og utenlandskarrieren.
- `ronny_johnsen` er inkludert fordi seniorgjennombruddet i Vålerenga 1992–1995 fant sted mens Bislett var klubbens sentrale hjemmebane.
- `stale_solbakken` er inkludert som historisk krysskobling: Kapteinsperioden i Vålerenga 1989–1994 er lagt til Bislett, mens Ullevaal beholdes som hans eksisterende og sterkere primæranker for landslaget.

## Nye ID-er

- `roy_helge_olsen`
- `rolf_aaberg`
- `lars_bohinen`
- `ronny_johnsen`

Alle fire nye filer bruker `category: "sport"`, `placeId: "bislett_stadion"` og `places: ["bislett_stadion"]`.

## Cross-link

- Den kanoniske filen `stale_solbakken` under `ullevaal_stadion` er oppdatert. `placeId` forblir `ullevaal_stadion`; `bislett_stadion` er bare lagt til i `places`, med Vålerenga-perioden forklart i beskrivelsene.
- Ingen duplikatfil for Ståle Solbakken er opprettet.

## Kontroller

| Kontroll | Resultat |
| --- | ---: |
| `duplicatePeopleIds` | 0 |
| `invalidPlaceRefs` | 0 |
| `peopleWithoutValidPrimaryAnchor` | 0 |
| `peopleWithEmptyPlacesArray` | 0 |
| `tools:check-status` | bestått |

`npm run audit:people-of-places` og `npm run tools:check` ble kjørt etter siste endring. `tools:check` fullførte uten ny urelatert feil.
