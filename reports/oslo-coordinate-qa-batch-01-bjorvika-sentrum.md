# Koordinat-QA: Bjørvika / Langkaia / Oslo sentrum øst

Dato: 2026-07-09

## Avgrensning

Dette er koordinatarbeid. Source-filer er brukt som eneste sannhet, og genererte index-filer skal bare oppdateres via sync-kommando.

Området og stedene kontrollert i denne batchen:

- `salt`
- `bispelokket`
- `bjorvika`
- `operahuset`
- `deichman_bjorvika`
- `barcode`
- `oslo_s`
- `jernbanetorget`
- `tigeren`
- `oslo_bussterminal`
- `sorenga`
- `radhusplassen`
- `bankplassen`
- `christiania_torv`

## Endringstabell

| id | gammel lat/lon | ny lat/lon | status | begrunnelse | filer endret |
|---|---|---|---|---|---|
| `salt` | `59.90705, 10.74218` | `59.90705, 10.74218` | Kontrollert, ikke flyttet | SALT-punktet ligger på Langkaia-anlegget og var allerede manuelt verifisert i source. | Ingen |
| `bispelokket` | `59.90806, 10.75528` | `59.90806, 10.75528` | Kontrollert, ikke flyttet | Historisk anker for revet Bispelokket/trafikkmaskinen ligger ved tidligere anleggsområde og var allerede manuelt verifisert som `historic_site_anchor`. | Ingen |
| `bjorvika` | `59.9075, 10.7531` | `59.9075, 10.7531` | Metadata kontrollert, ikke flyttet | Utstrakt område uten ett eksakt byggpunkt. Punktet beholdes som semantisk områdeanker sentralt i Bjørvika; `coordSource`/`coordVerifiedAt` er lagt til etter manuell kartkontroll. | `data/places/by/oslo/places_by.json`; genererte index-filer via sync |
| `operahuset` | `59.9075, 10.7527` | `59.9075, 10.7527` | Kontrollert, ikke flyttet | Bygningspunktet ligger på Operahuset i Bjørvika og var allerede verifisert mot kart-/datakilder. | Ingen |
| `deichman_bjorvika` | `59.9087, 10.7527` | `59.9087, 10.7527` | Kontrollert, ikke flyttet | Bygningspunktet ligger på Deichman Bjørvika ved Anne-Cath. Vestlys plass og var allerede verifisert. | Ingen |
| `barcode` | `59.908, 10.7602` | `59.908, 10.7602` | Metadata kontrollert, ikke flyttet | Barcode er en bygningsrekke/område. Punktet beholdes som semantisk midtanker langs Dronning Eufemias gate; `coordSource`/`coordVerifiedAt` er lagt til etter manuell kartkontroll. | `data/places/by/oslo/places_by.json`; genererte index-filer via sync |
| `oslo_s` | `59.9111, 10.7508` | `59.9111, 10.7508` | Kontrollert, ikke flyttet | Transitanker for Oslo S/hovedhallen er skilt fra både Jernbanetorget og Tigerstatuen og virker riktig. | Ingen |
| `jernbanetorget` | `59.911, 10.75` | `59.911, 10.75` | Kontrollert, ikke flyttet | Torgets anker foran Oslo S virker riktig og er skilt fra Oslo S og Tigerstatuen. | Ingen |
| `tigeren` | `59.9113, 10.7514` | `59.9112, 10.75` | Flyttet og verifisert | Tidligere punkt lå for langt øst mot forplass-/stasjonsbyggsonen. Markøren er flyttet til monumentankeret på forplassen ved Jernbanetorget foran Oslo S. | `data/places/by/oslo/places_by.json`; genererte index-filer via sync |
| `oslo_bussterminal` | `59.9112, 10.7585` | `59.9112, 10.7585` | Kontrollert, ikke flyttet | Terminalankeret ligger ved Oslo bussterminal/Galleri Oslo og var allerede verifisert. | Ingen |
| `sorenga` | `59.9029, 10.7586` | `59.9029, 10.7586` | Metadata kontrollert, ikke flyttet | Sørenga er et utstrakt sjøfront-/boligområde. Punktet beholdes som semantisk områdeanker ved Sørenga sjøbad/boligfront; `coordSource`/`coordVerifiedAt` er lagt til etter manuell kartkontroll. | `data/places/by/oslo/places_by.json`; genererte index-filer via sync |
| `radhusplassen` | `59.9109, 10.7326` | `59.9109, 10.7326` | Kontrollert, ikke flyttet | Plassankeret mellom Rådhuset og fjorden virker riktig og var allerede verifisert. | Ingen |
| `bankplassen` | `59.9089, 10.7415` | `59.9089, 10.7415` | Kontrollert, ikke flyttet | Plassankeret i Kvadraturen ved Nasjonalmuseet – Arkitektur virker riktig og var allerede verifisert. | Ingen |
| `christiania_torv` | `59.9104, 10.7397` | `59.9104, 10.7397` | Kontrollert, ikke flyttet | Torvankeret i Kvadraturen virker riktig og var allerede verifisert. | Ingen |

## Kontrollert, men ikke flyttet

- `salt`
- `bispelokket`
- `bjorvika`
- `operahuset`
- `deichman_bjorvika`
- `barcode`
- `oslo_s`
- `jernbanetorget`
- `oslo_bussterminal`
- `sorenga`
- `radhusplassen`
- `bankplassen`
- `christiania_torv`

## Flyttet

- `tigeren` — flyttet fra `59.9113, 10.7514` til `59.9112, 10.75` og satt til `verified` med `coordSource: manual_map_check` etter manuell kartkontroll.

## Trenger ny manuell vurdering senere

Ingen i denne batchen er satt i ny manuell vurderingskø. `bjorvika`, `barcode` og `sorenga` er fortsatt semantiske områdeankre, ikke eksakte bygningspunkter.

## Index-håndtering

- Index-filer er ikke håndredigert.
- `npm run places:coords:sync` er kjørt etter source-endringene for å regenerere index og kontrollere parity.
