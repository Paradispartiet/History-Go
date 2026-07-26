# Oscarsborg festning – koordinat- og representasjonsprobe

Dato: 2026-07-26  
Place ID: `oscarsborg_festning`  
Canonical fil: `data/places/historie/akershus/places_historie_akershus_batch1/oscarsborg_festning.json`

## Resultat

Ingen canonical koordinat endres i denne proben.

Legacy-markøren beholdes midlertidig:

- koordinat: `59.676, 10.606`
- radius: `360 m`
- status: uten Coordinate Source Contract

Proben løser stedets identitet og avdekker hvorfor et enkelt navnetreff ikke kan brukes som produksjonskoordinat.

## Identitet og omfang

Forsvarsbygg beskriver Oscarsborg som et sammensatt festningsanlegg med sentrale historiske og publikumsrettede deler på Kaholmene og flere tilknyttede områder og anlegg utenfor den umiddelbare øykjernen.

Riksantikvarens fredning omfatter et langt større militærhistorisk landskap med mer enn hundre objekter på øyer og fastland. Denne juridiske avgrensningen er autoritativ som vernekontekst, men er for omfattende til å brukes som ett gameplay-punkt eller én radius.

Canonical-posten bør derfor utvikles etter en flerankermodell:

1. ett dokumentert områdeanker for den sentrale besøks- og festningskjernen på Kaholmene
2. sekundære ankere for de viktigste historiske delobjektene
3. egne canonical poster eller fjernkontekst for komponenter som ligger langt utenfor øyradiusen

## Oppdagede kartkandidater

To generiske navnepunkter er funnet gjennom en OSM-basert oppdagelseskilde:

| Objekt | Kandidatpunkt | Avstand fra legacy | Beslutning |
|---|---|---:|---|
| `osm-node:6463615980` | `59.67353, 10.60708` | `281,3 m` | Ikke anvendbar uten rådata og avklart fysisk rolle |
| `osm-node:582909475` | `59.67346, 10.60716` | `289,8 m` | Ikke anvendbar uten rådata og avklart fysisk rolle |

Begge ligger sør for legacy-markøren. Ingen av dem er dokumentert som deterministisk sentrum for hovedfortet, besøksområdet eller hele festningen. Navnelikhet er derfor ikke tilstrekkelig for produksjon.

Flere navngitte delobjekter er også identifisert, blant annet et sentralt batteriobjekt og et fastlandsobjekt. Disse støtter flerankermodellen, men kan ikke erstatte det sentrale canonical-punktet.

Det fjerntliggende fastlandsobjektet ligger omtrent `1 052,2 m` fra legacy-markøren og kan ikke dekkes ærlig av dagens radius på `360 m`.

## Blokkering

Følgende mangler før produksjon:

- rå geometri for hovedfortet eller et autoritativt avgrenset besøksområde på Kaholmene
- deterministisk centroid eller annet dokumentert interiørpunkt for denne kjernen
- rå geometri og korrekt identitet for de viktigste sekundære ankerne
- eksplisitt radiusbegrunnelse etter at hovedankeret er valgt
- visuell kontroll av at punktet ligger på riktig fysisk sted og ikke på et navnepunkt, et fotografi eller et enkelt delobjekt

## Beslutning

`coordinateDecision` settes til:

`needs_core_geometry_and_multi_anchor_policy`

`evidenceStatus` settes til:

`candidate_sources_collected`

Canonical JSON forblir uendret. Dette er en kilde- og representasjonsaudit, ikke en koordinatproduksjon.

## Lagret materiale

- `data/coordinate-evidence/akershus/historie/oscarsborg_festning.json`
- `reports/akershus-coordinate-oscarsborg-source-probe/official-source-summary.json`
- `reports/akershus-coordinate-oscarsborg-source-probe/osm-candidate-summary.json`

Den OSM-baserte kandidatfilen er uttrykkelig merket som oppdagelsesmateriale. Den er ikke rå OSM-geometri og kan ikke alene verifisere en koordinat.

## Neste steg

Hent og lagre rå geometri for den sentrale Kaholmene-kjernen og de relevante delobjektene. Deretter velges eller beholdes hovedmarkøren gjennom en reproduserbar derivation, og sekundære ankere legges til uten å presse fjerntliggende komponenter inn i samme gameplay-radius.
