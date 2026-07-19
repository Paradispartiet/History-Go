# Kuba-parken – Nature rounds batch 1

Dato: 2026-07-19

## Avgrensning

Denne batchen fyller de manglende PlaceCard-rundingene for canonical `kuba_parken` uten å endre koordinat, radius eller coordinate-source metadata.

## Kildegrunnlag

- Oslo kommune, **Kubaparken**: parken ligger på begge sider av Akerselva, ble anlagt i 1928 og har paviljong samt dokumentert sosial/kulturell bruk.
- Oslo byleksikon, **Kuba**: plaskedammen ligger på fundamentet etter gassklokken som stod 1925–1973; parkdelene forbindes av Kuba bru; navnets opphav er usikkert.
- Oslo kommune, **Fyrhuset Kuba**: bygget ble oppført i 1924 som fyrhus for gassbeholderen og er tegnet av Thorvald Astrup.
- `data/natur/nature_oslo_expansion_place_map.json`: eneste aktive Artskart-baserte arter for stedet er snøbær og honningbie.

## Databeslutninger

- `year` rettes fra `2007` til `1928`. 2007 hadde ikke kildegrunnlag som parkens etableringsår.
- Koordinatene `59.92472, 10.75244`, radius `180` og all eksisterende koordinatmetadata beholdes eksakt.
- Natur-rundingen viser bare de to aktivt kartlagte artene. Det legges ikke inn generiske byfugler eller andre sannsynlige arter som ikke er aktive for place-id-en.
- Navneopprinnelsen presenteres eksplisitt som usikker. Ingen av de konkurrerende teoriene løftes til canonical sannhet.
- Fyrhuset behandles som et nærliggende fysisk/historisk lag i parkens gasshistorie, ikke som om bygningen er identisk med selve parken.

## Rundinger

Canonical naturprofil:

1. Oppgaver
2. Natur
3. Merker
4. Trening
5. Civication
6. Aktører
7. Før / nå
8. Fortellinger
9. Leksikon

Batchen tilfører eller oppgraderer stedsspesifikt innhold for alle ni.
