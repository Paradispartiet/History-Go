# People expansion — Oslo subkultur batch 4 named persons validation

Dato: 2026-07-08

## Scope-bekreftelse

- Batchen oppretter navngitte people entries med eksplisitt stedskobling.
- Batchen oppretter ingen nye places.
- Batchen endrer ingen place-filer og endrer ikke `data/places/places_index.json`.
- Batchen legger ikke inn band som personer.
- Batchen legger ikke inn Kenneth “Neseblod” Nilsen eller Jens Bjørneboe.
- Batchen bruker nøktern historisk språkføring for Helvete/Euronymous og unngår true-crime-/sensasjonalisme.

## Implementeringsvalg

Denne batchen er lagt som egen manifest-registrert people-fil:

- `data/people/subkultur/oslo/people_subkultur_oslo_named_batch4.json`

Årsak: `data/people/subkultur/oslo/people_subkultur_oslo.json` er stor og aktivt endret gjennom flere batcher. Egen batchfil reduserer risiko for utilsiktet full-file rewrite og følger mønsteret som allerede brukes for nyere dedikerte people-batcher i repoet.

Manifest er oppdatert med den nye filen i `data/people/manifest.json`.

## Filer lest/sjekket før endring

- `data/people/manifest.json`
- `data/people/subkultur/oslo/people_subkultur_oslo.json`
- `reports/people-oslo-subkultur-batch-3-validation.md`

Batch 3-rapporten bekrefter at target placeIds finnes i `places_index.json`:

| placeId | Status i batch 3-rapport |
|---|---|
| `helvete_neseblod_records` | finnes i `places_index.json` |
| `club_7_vika` | finnes i `places_index.json` |

## Candidate peopleIds sjekket repo-wide

Repo-søk før opprettelse fant ingen eksisterende treff på:

| peopleId | Resultat |
|---|---|
| `oystein_euronymous_aarseth` | ikke funnet |
| `kate_naess` | ikke funnet |
| `sossen_krohg` | ikke funnet |
| `attila_horvath` | ikke funnet |

## Entries lagt til

| peopleId | primary placeId | Status |
|---|---|---|
| `oystein_euronymous_aarseth` | `helvete_neseblod_records` | added |
| `kate_naess` | `club_7_vika` | added |
| `sossen_krohg` | `club_7_vika` | added |
| `attila_horvath` | `club_7_vika` | added |

## Research-gate per kandidat

### `oystein_euronymous_aarseth`

Grunnlag:

- Euronymous/Øystein Aarseth er oppgitt som den som åpnet platebutikken Helvete i 1991.
- Helvete er oppgitt som lokalisert i Schweigaards gate 56 i Oslo.
- Helvete beskrives som fysisk samlingspunkt for tidlig norsk black metal.

Kilder brukt:

- https://en.wikipedia.org/wiki/Euronymous
- https://en.wikipedia.org/wiki/Early_Norwegian_black_metal_scene

Dataformulering:

- Entryen knyttes til `helvete_neseblod_records` som platebutikk, undergrunnssted og sceneinfrastruktur.
- Popupen er nøktern og sier eksplisitt at entryen ikke skal glorifisere vold, kriminalitet, kirkebranner eller ekstremisme.

### `kate_naess`

Grunnlag:

- Kate Næss omtales som poet og en av pionerene i Club 7-miljøet.
- Hun krediteres for navnet Club 7.
- Koblingen er til Club 7 som motkulturell offentlighet, ikke generell Oslo-litteratur alene.

Kilder brukt:

- https://en.wikipedia.org/wiki/Kate_N%C3%A6ss
- https://en.wikipedia.org/wiki/Club_7

Dataformulering:

- Entryen knyttes til `club_7_vika` som person med dokumentert Club 7-kobling.
- Popupen vektlegger poesi, eksperimenterende kultur og alternativ offentlighet.

### `sossen_krohg`

Grunnlag:

- Sossen Krohg knyttes til Club 7 gjennom Scene 7.
- Scene 7 beskrives som avantgardeteater startet i 1966 med Sossen Krohg som kunstnerisk leder.
- Koblingen er til Club 7s scenekunstmiljø, ikke generell teaterhistorie alene.

Kilder brukt:

- https://en.wikipedia.org/wiki/Sossen_Krohg
- https://en.wikipedia.org/wiki/Club_7

Dataformulering:

- Entryen knyttes til `club_7_vika` gjennom Scene 7 / Club 7-miljøet.
- Popupen vektlegger eksperimenterende teater og motkulturell sceneoffentlighet.

### `attila_horvath`

Grunnlag:

- Club 7 beskrives som etablert i 1963 av Attila Horvath og Odd Schou.
- Club 7 beskrives som sentrum for norsk motkultur på 1960- og 1970-tallet.
- Koblingen er eksplisitt til Club 7.

Kilder brukt:

- https://en.wikipedia.org/wiki/Club_7

Dataformulering:

- Entryen knyttes til `club_7_vika` som initiativtaker og miljøbygger i Club 7s tidlige historie.
- Popupen begrenser seg til etablering, miljøbygging og motkulturell offentlighet.

## Skipped kandidater

Ingen av de fire mål-kandidatene ble skippet.

Ikke inkludert i denne batchen:

| Kandidat | Årsak |
|---|---|
| Kenneth “Neseblod” Nilsen | krever egen vurdering og sterkere kildegrunnlag |
| Jens Bjørneboe | bør eventuelt vurderes i egen litteratur-/teater-/Club 7-batch |
| Mayhem/Burzum/Darkthrone/andre band | band skal ikke legges inn som personer i denne batchen |

## Manuelle valideringer utført i denne endringen

- JSON-formen i ny people-fil er én array med fire entries.
- Alle entries har `id`, `name`, `initials`, `desc`, `tags`, `placeId`, `category`, `year`, `popupDesc`, `places`, `image`, `cardImage`.
- Alle entries har `category: "subkultur"`.
- Alle entries har `places[]` med primary placeId.
- Det er ikke opprettet nye places.
- Det er ikke endret filer under `data/places/**`.
- Det er ikke endret `data/places/places_index.json`.

## Audits som bør kjøres før merge

Dette PR-arbeidet ble gjort via GitHub connector og kunne ikke kjøre repoets lokale npm-/Node-audits direkte i denne økten. Kjør derfor før merge:

```bash
node -e "for (const f of ['data/people/subkultur/oslo/people_subkultur_oslo_named_batch4.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Forventet:

- nye named people: 4
- nye places: 0
- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0

Merk: `geographicPeopleFiles` vil trolig øke fra 29 til 30 fordi batchen er lagt som egen manifest-registrert people-fil.

## Endrede filer

- `data/people/subkultur/oslo/people_subkultur_oslo_named_batch4.json`
- `data/people/manifest.json`
- `reports/people-oslo-subkultur-batch-4-named-persons-validation.md`
