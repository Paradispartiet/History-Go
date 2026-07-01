# History GO — spillbarhets-gaprapport

Dette dokumentet samler nåværende kjent gap mellom History GO som bygget system og History GO som ferdig spillbar app.

Det er ikke en ny datakontrakt. Det er en produkt-/ferdigstillingsrapport som leser eksisterende dokumentasjon sammen:

- `docs/HISTORY_GO_PRODUCT_MAP.md`
- `docs/COMPLETION_DEFINITIONS.md`
- `docs/PROGRESSION_MODEL.md`
- `docs/PLACE_STANDARD.md`
- `reports/place-data-remaining-work.md`
- `reports/place-data-audit.md`
- `docs/APP_STRUCTURE_INDEX.md`
- `docs/DATA_PRODUCTION_CONTRACT.md`
- `data/places/README_place_rounds.md`
- `data/wonderkammer/README.md`
- `docs/HG_SOCIAL_README.md`
- `README/quizREADME.md`
- `README/CURRENT_PRODUCT_STATE.md`

Civication er eget prosjekt og inngår ikke i denne gaprapporten.

---

## 1. Kort konklusjon

History GO har en spillbar lokal kjerne, men mangler fortsatt produktforsegling.

Det betyr:

- Kart/place/person/quiz/profile finnes.
- Kunnskap, learning log, observations, badges/merits og profile update hooks finnes.
- Wonderkammer finnes som innholdstype og samling.
- HG Social / Social Meet og Spotmeeting har privacy-guarded lokal/demo- og backend-ready kontrakt.
- Steddata er omfattende, men ferdiggrad og assetdekning er ujevn.
- Fullført-begrepet må nå brukes aktivt i UI, read-models og QA.

Den viktigste overgangen er:

```text
bygde systemer → samlet spillbar loop
```

Kjerneløypen som må bli tydelig overalt:

```text
Kart → Sted / PlaceCard → Handling → Belønning/status → Profil/Wonderkammer → Neste sted/rute
```

---

## 2. Eksisterende auditstatus

`reports/place-data-remaining-work.md` oppsummerer en audit kjørt 2026-04-30 basert på `node tools/audit-place-data.mjs` og `reports/place-data-audit.md`.

Kjent totalsammendrag derfra:

| Felt | Status |
|---|---:|
| Totalt antall places i manifest | 228 |
| Mangler `year` | 48 |
| Mangler `popupDesc` | 49 |
| Mangler `emne_ids` | 49 |
| Mangler `quiz_profile` | 49 |
| Mangler `image` | 136 |
| Mangler `cardImage` | 136 |
| Ødelagte asset paths | 120 |
| Globale ugyldige place-referanser | 0 |

Viktig tolkning:

- De største hullene er ikke bare tekstfelt.
- Assetdekning er et stort ferdigstillingsgap.
- Globalt finnes fortsatt 49 steder uten sentrale innholdsfelt.
- Ugyldige place-referanser var 0 i den auditen, som er et godt tegn for datakonsistens.

---

## 3. Elleve prioriterte place-filer fra eksisterende audit

Eksisterende audit sier at disse elleve filene var ferdige på innholdsfeltene `year`, `popupDesc`, `emne_ids` og `quiz_profile`, men fortsatt hadde assetarbeid:

| Fil | Places | Image/cardImage-mangler | Ødelagte asset paths |
|---|---:|---:|---:|
| `data/places/places_historie.json` | 10 | 2 | 2 |
| `data/places/places_kunst.json` | 7 | 7 | 0 |
| `data/places/places_litteratur.json` | 24 | 1 | 12 |
| `data/places/places_vitenskap.json` | 5 | 1 | 1 |
| `data/places/places_politikk.json` | 6 | 6 | 0 |
| `data/places/places_musikk.json` | 6 | 6 | 0 |
| `data/places/places_sport.json` | 3 | 3 | 0 |
| `data/places/places_subkultur.json` | 5 | 4 | 1 |
| `data/places/places_natur.json` | 2 | 2 | 0 |
| `data/places/places_naeringsliv.json` | 33 | 27 | 3 |
| `data/places/oslo/places_oslo_natur_akerselvarute.json` | 24 | 24 | 0 |

Konklusjon:

- Innholdsstruktur er langt på vei ryddet i disse filene.
- Asset/jobben er fortsatt stor.
- Musikk, natur, sport og politikk er små kategorier med 100 % image/cardImage-mangel i denne auditen.
- Næringsliv er innholdsrik, men har tung assetjobb.
- Litteratur har lite image-mangel, men mange ødelagte paths.

---

## 4. Gap mot stedstandarden

`docs/PLACE_STANDARD.md` definerer nivåene:

| Nivå | Navn |
|---|---|
| 0 | Stub |
| 1 | Basis |
| 2 | Presentabelt |
| 3 | Spillbart |
| 4 | Rikt |
| 5 | Kampanje |
| 6 | Premium |

Eksisterende place-audit må nå oversettes fra feltmangler til spillbarhetsnivå.

Det betyr at neste faktiske data-audit bør måle:

- hvor mange steder er bare basis?
- hvor mange er presentable?
- hvor mange er spillbare?
- hvor mange er rike samlingsobjekter?
- hvor mange inngår i ruter?
- hvor mange kan regnes som premium?

Feltdekning alene er ikke nok. Et sted kan ha `popupDesc` og `quiz_profile`, men fortsatt mangle tydelig handling, reward eller profil/Wonderkammer-kobling.

---

## 5. Hva mangler før appen føles ferdig spillbar?

### A. Progression Read Model v1

Mangler:

- samlet lesemodell for stedstatus
- felles status for quiz, observations, badges, people, Wonderkammer og routes
- tydelig mapping fra eksisterende localStorage/logg til profil/PlaceCard/Nearby

Viktig: dette skal være read-model over eksisterende lagring, ikke ny sannhetskilde.

Første output bør være et read-only snapshot som kan svare:

```text
Hva har spilleren gjort?
Hva er fullført?
Hva er neste anbefalte handling?
```

### B. PlaceCard fullført-status

Mangler:

- tydelig status per sted
- tydelig primær handling
- tydelig ferdig/belønning etter quiz/observation
- tydelig inngang til leksikon/Wonderkammer-funn
- tydelig route-status der relevant
- trygg og manuell Spotmeeting-inngang der relevant

### C. Profil som samler alt

Mangler:

- samlet stedstatus
- kategori-progresjon
- ruteprogresjon
- people-unlocks
- Wonderkammer-funn
- favoritter
- offentlig hjemsted
- Social Meet / Spotmeeting status uten privacy-stack først

### D. Wonderkammer/leksikon-hub

Mangler:

- klar visning av låste/opplåste funn
- tydelig kobling tilbake til steder/personer/ruter
- samlingsstatus som føles som belønning

### E. Nearby / NextUp

Mangler:

- anbefaling basert på faktisk progresjon
- ufullførte steder i nærheten
- aktiv rute
- steder som låser opp person/funn
- steder nær offentlig hjemsted

### F. Ruter

Mangler:

- tydelig rute-state
- stoppstatus
- online/fysisk status for historiske ruter
- rute-belønning i profil/Wonderkammer

### G. Assetdekning

Mangler:

- mange image/cardImage-felt
- mange ødelagte asset paths
- særlig tung jobb i næringsliv, Akerselva/natur-rute, kunst, politikk, musikk, sport og natur

---

## 6. Prioritert ferdigstillingsrekkefølge nå

### 1. Progression Read Model v1

Hvorfor først:

Alt annet må vite status.

Må kunne lese:

- `quiz_history`
- `knowledge_universe`
- `trivia_universe`
- `hg_learning_log_v1`
- badges/merits
- favorites
- routes
- people
- Wonderkammer

Output:

- read-only snapshot
- ingen migrering først
- ingen nye localStorage-sannheter først

### 2. PlaceCard status pass

Hvorfor:

PlaceCard er stedet der spilleren faktisk spiller.

Må vise:

- status
- primær handling
- belønning
- neste steg

### 3. Profil summary pass

Hvorfor:

Belønningene må bli synlige.

Må vise:

- steder
- badges
- kategorier
- ruter
- funn
- people
- favoritter

### 4. Nearby / NextUp pass

Hvorfor:

Spilleren trenger retning.

Må vise:

- hva kan jeg gjøre nå?
- hva mangler jeg i nærheten?
- hva fortsetter ruten min?

### 5. Asset pass

Hvorfor:

Appen blir ikke ferdig følt uten bilder/kortbilder.

Bruk eksisterende auditrekkefølge:

1. `places_natur`, `places_sport`, `places_politikk`, `places_musikk`
2. `places_historie`, `places_vitenskap`, `places_subkultur`
3. `places_kunst`
4. `places_litteratur`
5. `places_naeringsliv`
6. `places_oslo_natur_akerselvarute` + samlet asset-verifikasjon

### 6. Rute pass

Hvorfor:

Ruter gjør appen langtidsspillbar.

Må kobles til:

- stedstatus
- profil
- Wonderkammer/leksikon
- Nearby/NextUp

### 7. Social Meet / Spotmeeting pass

Hvorfor senere:

Social må bygge på trygge, fullførte objektkontekster.

Må følge:

- ingen GPS/social graph
- ingen nearby people
- ingen fri chat
- preset-only Spotmeeting
- context-bound invites

---

## 7. Hva vi ikke bør gjøre nå

Ikke start med:

- ny backend før read-model er klar
- ny sosial feed
- nye store spillmoduser
- nye datalagringsnøkler uten migrering
- manuell redigering av `places_index.json`
- duplisering av cross-domain places
- egne PlaceCard-rundinger for kategorier eller Wonderkammer
- store router/app-shell-endringer

---

## 8. Neste konkrete PR-er

### PR A — Progression Read Model v1

Dokumentasjon + read-only runtime hvis ønsket.

Mål:

- bygge én read-only progresjonsadapter
- lese eksisterende lagring
- gi status per place/category/route
- ingen migrering

### PR B — PlaceCard status surface

Mål:

- vise status fra read-model
- gjøre primær handling tydelig
- vise fullført/neste steg

### PR C — Profile summary alignment

Mål:

- profil leser samme read-model
- kategori og stedstatus vises samlet
- Wonderkammer/favoritter/ruter kobles tydeligere

### PR D — Content maturity audit script/report

Mål:

- utvide eksisterende `tools/audit-place-data.mjs` eller lage separat read-only audit
- beregne stedmodenhetsnivå etter `PLACE_STANDARD.md`
- output til `reports/history-go-content-maturity.md`

### PR E — Asset cleanup batch 1

Mål:

- små kategorier først: natur, sport, politikk, musikk
- fyll image/cardImage eller dokumenter fallback

---

## 9. Definisjon av “klar for spillbar v1”

History GO er klar som spillbar v1 når:

1. En ny bruker kan åpne kartet og finne et sted.
2. PlaceCard viser tydelig handling og status.
3. Quiz/observation gir belønning/status.
4. Profilen oppdateres etter handling.
5. Wonderkammer/leksikon viser funn der relevant.
6. Nearby/NextUp foreslår neste handling.
7. Minst ett sett ruter har tydelig progresjon.
8. Steddata har kjent modenhetsnivå.
9. Assetmangler er enten fikset eller eksplisitt håndtert med fallback.
10. Social Meet/Spotmeeting er trygg, manuell og context-bound.
11. Lokal progresjon tåler reload.

---

## 10. Arbeidsregel

Neste arbeid skal måles mot denne setningen:

> Gjør det eksisterende History GO-spillet ferdig lesbart, spillbart og målbarbart før nye store systemer bygges.

Det betyr ikke å kutte History GO ned. Det betyr å gjøre hele spillet ferdig nok til at systemene henger sammen.
