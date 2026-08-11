# Torggata – fase 8A People closeout V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Baseline: 8A1 PR #4831 · 8A2 PR #4840 · 8A3 PR #4842
- Status: **GODKJENT**

## Hva closeout kontrollerer

Dette er ikke en ny People-produksjonsbatch. Closeout verifiserer at den ferdige canonical People-samlingen faktisk eier den synlige People-rundingen i PlaceCard.

1. Runtime-testen laster hele `data/people/manifest.json` og kjører den virkelige `getPeopleForPlace('torggata')`-funksjonen.
2. Alle personer som ble besluttet og produsert i 8A1–8A3 må finnes i resultatet uten duplikater.
3. Testen bruker et forventet identitetssett, ikke et makstall; flere senere kildebårne personer er tillatt.
4. Ingen av de ferdige 8A-personene kan ha `torggata` i `roundHoldbacks`.
5. PlaceCard-koden må fortsatt hente `persons` via `getPeopleForPlace(place.id)`, rendre `data-person`-rader og bruke samme `persons`-samling til previewet.
6. Category-four-runtime må vise People som første innholdsrunding for et vanlig `by`-sted og fortsatt ha nøyaktig fire innholdsrundinger med Badges utenfor gridet.

## Resultat

People-rundingen er en reell canonical samling. Den er ikke avhengig av legacy `place.rounds`, `people_ids`, en hardkodet Torggata-liste eller tilgjengelige portrettbilder. Manglende bilde gir et ærlig People-ikon med count; selve personlisten er fortsatt tilgjengelig.

Fase 8A kan derfor lukkes. Fase 8 som helhet fortsetter med **8B Objects**, deretter 8C Brands, 8D Bygg og anlegg og 8E legacy-rounds/slutt-UI.
