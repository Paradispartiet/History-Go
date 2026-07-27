# Etne – closure for øvrige PlaceCard-rundinger

## Omfang

Kontrollen dekker alle **79 aktive Etne-steder utenfor naturkategorien**, funnet direkte gjennom aktivt place-manifest og `kommune: Etne`.

Kategorier:

- historie: 33
- sport: 15
- kunst: 8
- by: 5
- næringsliv: 5
- litteratur: 3
- politikk: 3
- religion: 3
- psykologi: 2
- vitenskap: 1
- media: 1

De 26 naturstedene er ikke del av dette omfanget fordi de allerede har en egen fullført kvalitetsaudit.

## Før / etter

| Målepunkt | Før | Etter |
|---|---:|---:|
| Aktive steder | 79 | 79 |
| Blockers | 51 | 0 |
| Warnings | 213 | 0 |
| Gjennomsnittsscore | 86,1 | 100 |
| Steder under 90 | 20 | 0 |
| Steder med blockers | 18 | 0 |

`badge_depth` og `brand_depth` beholdes som rådgivende signaler. De beskriver lavere mengde enn et ambisiøst kvalitetsmål, men er ikke feil når rundingen er gyldig, stedsspesifikk og fylt.

## Produksjonsløft

- normaliserte eldre før/nå-objekter til runtime-kompatible tekstfelt
- la til eksplisitte kilde-URL-er på før/nå, verk og Civication-objekter
- korrigerte to Civication-objekter til eksplisitte fysiske samlingsobjekter
- styrket svak stedsspesifikk begrunnelse
- gjorde sportsøvelser lokalt forankret og skilte Engebanen fra Steinsvollen
- erstattet ugyldig psykologi-relasjon `etne_senter` med canonical `etnesjoen_tettstad`
- fylte alle ni rundinger for Etne kyrkje, Frette kapell og Skånevik kyrkje
- opprettet tre kollektive trosmiljøankre uten å konstruere navngitte enkeltpersoner
- gjorde `religion` og `psykologi` eksplisitte i PlaceCard-runtimeprofilen

## Religion – redaksjonelle skiller

- **Etne kyrkje:** moderne aktiv soknekyrkje tatt i bruk i 2013; ikke framstilt som middelalderkirke.
- **Frette kapell:** Betania bedehus fra 1910 holdes tydelig skilt fra ombygging og vigsling som kapell i 1959.
- **Skånevik kyrkje:** dagens aktive bygg fra 1900 holdes fysisk og historisk skilt fra `skanevik_kyrkjestad`.

## Koordinatkontrakt

Ingen koordinat-, radius- eller koordinatdokumentasjonsfelt er endret. Materialiseringen sammenlignet følgende felt før og etter hver berørt place-post og stoppet ved avvik:

- `lat`
- `lon`
- `r`
- `coordStatus`
- `coordSource`
- `coordType`
- `coordNote`

Religion-regresjonen låser i tillegg de eksakte koordinatene og canonical årstallene for alle tre religionstedene.

## Permanente kontroller

- `tools/audit-etne-non-nature-round-quality.mjs`
- `tests/etne-religion-round-content.test.js`
- `reports/etne-non-nature-quality-audit/report.json`
- `reports/etne-non-nature-quality-audit/report.md`

Sluttstatus: **79 steder, 0 blockers, 0 warnings, gjennomsnittsscore 100**.
