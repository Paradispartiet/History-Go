# Blaker skanse – produksjonsrapport for koordinat

Dato: 2026-07-26  
Place ID: `blaker_skanse`  
Canonical fil: `data/places/historie/akershus/places_historie_akershus_batch1/blaker_skanse.json`

## Resultat

Blaker skanse flyttes fra legacy-punktet `60.00361, 11.30611` til den deterministiske polygoncentroiden i den navngitte OpenStreetMap-geometrien `way 555936228`:

- ny breddegrad: `60.00480674815603`
- ny lengdegrad: `11.307093580848898`
- forskyvning: omtrent `143,9 m`
- koordinatstatus: `verified_geometry`
- rolle: `area_anchor`
- radius: `240 m`

Radiusen beholdes. Den navngitte polygonens ytterste vertex ligger omtrent `222,3 m` fra centroiden, slik at gameplay-sirkelen dekker hele geometrien med omtrent `17,7 m` margin.

## Representasjonsbeslutning

Canonical representerer det samlede historiske skanse- og bygningsmiljøet, ikke én bestemt bygning.

Den anvendte polygonen er navngitt `Blaker skanse` og omfatter det sammenhengende anleggsområdet. Polygoncentroiden brukes derfor som fysisk områdeanker. Den fremstilles ikke som:

- juridisk fredningsgrense
- reguleringsplangrense
- eiendomsgrense
- centroid for vollene alene
- centroid for Kommandantboligen, Krutthuset eller Artilleri- og magasinbygningen

Den separate OSM-geometrien `way 1224855213` avvises. Den er en fotballbane med navnet `Blaker Skanse`, ikke det historiske forsvarsanlegget.

## Adressekontroll

Lillestrøm kommune oppgir Blaker skanse på `Skanseveien 43, 1925 Blaker`.

Kartverket returnerer:

- kommunenummer: `3205`
- gårds- og bruksnummer: `318/3`
- adressekode: `18175`
- punkt: `60.00487275932726, 11.305801586453896`
- `stedfestingverifisert`: `false`

Adressepunktet ligger omtrent `72,2 m` fra polygoncentroiden og omtrent `2,1 m` fra Riksantikvarens punkt for Kommandantboligen. Det brukes som besøks- og identitetskryssjekk, ikke som canonical koordinat for hele skansen.

## Fredede bygninger

Riksantikvarens data gir tre uavhengige kontrollpunkter i anlegget:

| Objekt | Lokal-ID | Punkt | Avstand til områdeanker |
|---|---|---|---:|
| Kommandantboligen | `235846-2` | `60.00486129259215, 11.305830655028492` | `70,5 m` |
| Krutthuset | `235846-3` | `60.00536400351639, 11.307047327178173` | `62,0 m` |
| Artilleri- og magasinbygningen | `235846-4` | `60.00544880301114, 11.306438251384696` | `80,2 m` |

Krutthuset ble reist i perioden 1740–1759. Artilleri- og magasinbygningen ble oppført omkring 1740–1750. Kommandantboligen fra 1811–1814 brant i 1973 og ble gjenoppført i 1976–1977 med kopiert ytre form, men moderne konstruksjon og planløsning.

Bygningspunktene bekrefter at polygoncentroiden ligger sentralt i det militærhistoriske miljøet, men ingen enkeltbygning opphøyes til canonical for hele stedet.

## Historisk og funksjonell avgrensning

Stedet formidler tre hovedlag:

1. Forsvarsanlegget etablert i 1683 og den strategiske plasseringen ved Glomma.
2. De bevarte militærbygningene for krutt, artilleri, proviant og offisersliv.
3. Ombruken til husflids- og lærerutdanning fra 1917, da militære rom ble verksteder, undervisningssaler, internat og administrasjon.

## Råmateriale

Følgende kildemateriale er lagret i repoet:

- `reports/akershus-coordinate-blaker-skanse-source-probe/geonorge-skanseveien-43.json`
- `reports/akershus-coordinate-blaker-skanse-source-probe/nominatim-blaker-skanse.json`
- `reports/akershus-coordinate-blaker-skanse-source-probe/osm-way-555936228-full.xml`
- `reports/akershus-coordinate-blaker-skanse-source-probe/osm-blaker-skanse-bbox.xml`
- `reports/akershus-coordinate-blaker-skanse-source-probe/riksantikvaren-freda-bygning-exact-1877018.json`
- `reports/akershus-coordinate-blaker-skanse-source-probe/riksantikvaren-freda-bygning-exact-1877181.json`
- `reports/akershus-coordinate-blaker-skanse-source-probe/riksantikvaren-freda-bygning-exact-1876987.json`
- `reports/akershus-coordinate-blaker-skanse-source-probe/source-summary.txt`
- `reports/akershus-coordinate-blaker-skanse-source-probe/protected-summary.txt`

## Produksjonsomfang

Produksjonsendringen består av:

- oppdatert canonical sted
- oppdatert Coordinate Evidence
- denne produksjonsrapporten
- allerede lagret råmateriale fra kildeproben

Ingen kategori-, quiz-, people-, runtime- eller workflowfil skal ligge i sluttdiffen.
