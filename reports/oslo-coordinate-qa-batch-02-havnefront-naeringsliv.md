# Koordinat-QA: Oslo havnefront / næringsliv

Dato: 2026-07-09

## Avgrensning

Dette er koordinat-QA for fem visuelt rapporterte havne-/næringslivspunkter i Oslo havn. Source-filer er brukt som sannhet; index-filer er ikke håndredigert, men regenerert/synkronisert etter source-endring.

Kontrollerte steder:

- `havnelageret`
- `oslo_mek`
- `salt`
- `tollbukaia`
- `akershus_kaier`

## Endringstabell

| id | gammel lat/lon | ny lat/lon | status | begrunnelse | filer endret |
|---|---|---|---|---|---|
| `havnelageret` | `59.9092, 10.7429` | `59.90845, 10.74305` | Flyttet og verifisert | Flyttet fra generelt havne-/kaiområde til bygganker på selve Oslo Havnelager-bygget ved Langkaia 1. | `data/places/naeringsliv/oslo/places_naeringsliv.json`; `data/places/naeringsliv/oslo/places_naeringsliv/havnelageret.json`; genererte index-filer via sync |
| `oslo_mek` | `59.9055, 10.7469` | `59.90745, 10.75195` | Flyttet og verifisert som historisk anleggspunkt | Eksisterende tekst beskriver historisk verksted/industri i Bjørvika, ikke dagens bar-navnebruk. Punktet er derfor flyttet fra vann-/feil kaiområde til historisk anker på land ved tidligere verksted-/industriområde under dagens Bjørvika/Opera-område og merket `historic_site_anchor`. | `data/places/naeringsliv/oslo/places_naeringsliv.json`; `data/places/naeringsliv/oslo/places_naeringsliv/oslo_mek.json`; genererte index-filer via sync |
| `salt` | `59.90705, 10.74218` | `59.90765, 10.7449` | Flyttet og verifisert | Flyttet fra veisystem/Tollbukaia-sone til selve SALT-anlegget på Langkaia/kaikanten øst for Havnelageret, og holdt skilt fra Bjørvika-/Opera-/Bispelokket-klyngen. | `data/places/musikk/oslo/places_musikk.json`; `data/places/musikk/oslo/places_musikk/salt.json`; genererte index-filer via sync |
| `tollbukaia` | `59.9078, 10.7421` | `59.90825, 10.74105` | Flyttet og verifisert som semantisk kaianker | Flyttet fra feil side av kvartal-/havnefronten til et semantisk anker for Tollbukaia/tollområdet langs kai- og gatefronten vest for Havnelageret; ikke inne i Grev Wedels plass. | `data/places/naeringsliv/oslo/places_naeringsliv.json`; `data/places/naeringsliv/oslo/places_naeringsliv/tollbukaia.json`; genererte index-filer via sync |
| `akershus_kaier` | `59.9059, 10.7423` | `59.90715, 10.73705` | Flyttet og verifisert som semantisk kaianker | Flyttet fra Vippetangen-/feil havnebassengsone til semantisk anker for den lineære Akershuskaiene-fronten langs Akershus festning/Pipervika. | `data/places/naeringsliv/oslo/places_naeringsliv.json`; `data/places/naeringsliv/oslo/places_naeringsliv/akershus_kaier.json`; genererte index-filer via sync |

## Flyttet

Alle fem kontrollerte steder ble flyttet:

- `havnelageret`
- `oslo_mek`
- `salt`
- `tollbukaia`
- `akershus_kaier`

## Kontrollert, men ikke flyttet

Ingen i denne batchen ble beholdt uendret.

## Trenger fortsatt manuell vurdering

Ingen i denne batchen er satt til ny manuell vurdering. `tollbukaia` og `akershus_kaier` er likevel bevisst semantiske kaiankre fordi de beskriver lineære kaiområder, ikke ett byggpunkt.

## Index-håndtering

- Index-filer ble ikke håndredigert som fasit.
- `npm run places:coords:sync` ble kjørt etter source-endringene.
- Runtime-index matcher source etter sync: `places:coords:check` rapporterte at runtime index-koordinatfeltene matcher source-filene.
