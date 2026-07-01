# 🧭 History GO — hoved-README

History GO er et offline-first, stedbasert kunnskaps- og samlespill der byen fungerer som spillbrett.

Spilleren oppdager steder, sjekker inn, tar quiz/oppgaver, låser opp kunnskap, personer, funn, badges og ruter, og bygger sin egen samling gjennom profil og Wonderkammer.

Dette dokumentet er hovedoversikten for **History GO-spillet**. Civication er eget prosjekt og skal ikke styre denne README-en.

---

## 1. Produktkjerne

History GO skal fullføres som ett stort spillunivers, ikke som løse moduler.

Kjerneløype:

```text
Kart → Sted / PlaceCard → Innsjekk/quiz/observasjon → Belønning/status → Profil/Wonderkammer → Neste sted/rute
```

Steder er navet. Profilen er spillerkortet. Wonderkammer er samlingen. Ruter er kampanjer. Social Meet og Spotmeeting skal kobles til steder, ruter, funn og trygg offentlig møtebruk.

---

## 2. Status / sider

- **Hovedapp:** `index.html` — kart, nearby, place card, quiz, popups, ruter, progresjon og miniProfile
- **Profil:** `profile.html` — full profilside for samling, merker, historikk og profilpaneler
- **Kunnskap:** `knowledge.html`
- **Notater:** `notater.html`
- **Emner / pensum:** `emner.html`
- **AHA:** `AHA/index.html` — import, innsiktskammer og meta

`index.html` er hoved-app-shell for kart, nearby, PlaceCard, quiz og miniProfile.

Index bruker split boot:

- `bootCritical()` for raskt kart/places
- `bootBackground()` for people/relations/Wonderkammer/nature/stories/events/brands

Index-routeren eier:

- `#/map`
- `#/place/:id`
- `#/quiz/:id`

`profile.html` er full profilside. `#/profile` skal ikke bli en intern summary-view uten egen fase.

---

## 3. Hovedsystemer

### Kart / steder

Kartet er verdenen. Steder er spillobjektene.

Kartet skal vise steder, kategorier, status, ruter, nearby og relevante stedbaserte moduser.

### PlaceCard

PlaceCard er stedets kontrollrom.

Et komplett PlaceCard bør kunne vise:

- kjerneinfo
- bilde / cardImage
- status, medalje eller badge
- primær handling
- quiz / observation / relevant handling
- personer / relasjoner
- ruter
- fortellinger
- leksikon
- Wonderkammer-innhold gjennom leksikon/hub der relevant
- favorittstatus
- Social Meet / Spotmeeting der trygt og manuelt initiert

`rounds` er UI, ikke kategori- eller progresjonslogikk. Se `data/places/README_place_rounds.md`.

### Quiz / badges

Quiz gir evidens, progresjon og belønning.

Rewards/hooks kan gi:

- HGInsights
- Knowledge
- Trivia
- learning log-events
- badges/merits
- profiloppdatering
- Wonderkammer/leksikon-funn der relevant

### Profil

Profilen er spillerkortet.

Den skal samle:

- besøkte/fullførte steder
- badges
- kategori- og kursprogresjon
- opplåste personer
- Wonderkammer-funn
- favoritter
- ruter
- offentlig hjemsted
- Social Meet / Spotmeeting-status der relevant
- NextUp

### Wonderkammer

Wonderkammer er samlingen og arkivet.

Det bør samle konkrete stedsskatter, personer, badges, funn, ruter, kuriositeter, kunstverk, litterære spor, naturfunn, sportshistorie, musikksteder, politiske hendelser, næringslivshistorie og byfenomener.

I PlaceCard ligger Wonderkammer-innhold under `leksikon`-flowen / leksikon-huben, ikke som egen canonical runding.

### Nearby / favoritter

Nearby svarer på: Hva kan jeg gjøre nå?

Nearby bør prioritere steder nær spilleren, steder i aktiv rute, ufullførte quizzer, steder som låser opp personer/funn, og favoritter i nærheten.

### Ruter

Ruter er kampanjer.

En rute bør ha startsted, stopp, anbefalt rekkefølge, progresjon, belønning, sluttbadge, profilvisning og Wonderkammer-kobling.

Historiske ruter kan i tillegg skille mellom online historisk reise og fysisk rutesamling.

### People / relations

People skal være unlock-system, ikke bare datalag.

Spilleren bør møte personer gjennom steder, ruter, funn og kategorier.

### HG Social / Social Meet

HG Social er teknisk/arkitektonisk navn. Social Meet er brukerrettet produktnavn for sosial fane/opplevelse.

Dette laget skal handle om kunnskapsbasert sosialitet rundt steder, funn, ruter, profiler, trygg deling og felles aktivitet.

Se også `docs/HG_SOCIAL_README.md`.

### Spotmeeting

Spotmeeting er en konkret møteforespørsel inne i Social Meet.

Det skal ikke være en generell møteapp. Det skal handle om preset-baserte, private, manuelt initierte møteforespørsler rundt History GO-objekter eller temaer.

---

## 4. Ferdigstillelseskart og ferdigdefinisjoner

Det operative produktkartet ligger her:

- [`docs/HISTORY_GO_PRODUCT_MAP.md`](../docs/HISTORY_GO_PRODUCT_MAP.md)

Ferdigmodellen er delt i tre dokumenter:

- [`docs/COMPLETION_DEFINITIONS.md`](../docs/COMPLETION_DEFINITIONS.md) — hva “fullført” betyr
- [`docs/PROGRESSION_MODEL.md`](../docs/PROGRESSION_MODEL.md) — felles read-model over eksisterende progresjon
- [`docs/PLACE_STANDARD.md`](../docs/PLACE_STANDARD.md) — hva et komplett/spillbart sted bør ha

Disse dokumentene skal leses sammen med eksisterende kontrakter. De skal ikke erstatte `DATA_PRODUCTION_CONTRACT`, `README_place_rounds`, quiz-README, fag/pensum eller HG Social-dokumentene.

Kort prioritet:

1. Felles progresjons-read-model
2. PlaceCard-standard
3. Profil
4. Wonderkammer/leksikon-hub
5. Nearby / favoritter
6. Ruter
7. Innholdsstandard per kategori
8. Innholdshull i svake kategorier
9. Social Meet / HG Social
10. Spotmeeting
11. Backend / login / sync

---

## 5. Fag / knowledge / progresjon

History GO bruker fagkart, emner, steder, quiz og evidens for å bygge kunnskap.

Grunnstruktur:

```text
Merke → Fagkart/fagplan → Emner → Quiz/steder/observasjon → Learning log → Courses/pensum → UI
```

Kunnskap bør ikke ligge tilfeldig i UI. Fagtekst og dybde skal ligge i fagkart/emner/steder/personer og vises gjennom knowledge/profil/PlaceCard/Wonderkammer.

Se også:

- [`README.pensum.md`](./README.pensum.md)
- [`fagstrukturREADME.md`](./fagstrukturREADME.md)
- [`emnepackREADME`](./emnepackREADME)
- [`quizREADME.md`](./quizREADME.md)

---

## 6. Lokal kjøring

Bruk lokal webserver, ikke `file://`:

```bash
python -m http.server
```

Åpne:

- `index.html`
- `profile.html`
- `knowledge.html`
- `notater.html`
- `emner.html`

Service worker fungerer best via lokal server.

Se også:

- [`README_DEV.md`](./README_DEV.md)

---

## 7. Data og build-output

`data/places/places_index.json` er generert build-output.

Regel:

- Source-filene under `data/places/...` er sannhetskilden.
- `data/places/manifest.json` styrer hvilke source-filer som inngår.
- `places_index.json` skal regenereres, ikke håndredigeres.

Ved endring av places-data:

```bash
node tools/build_places_index.mjs
node tools/check_places_index_sync.mjs
```

---

## 8. Daglige utviklerregler

1. Ikke endre localStorage-keys uten migrering.
2. Ikke endre domene/alias uten å oppdatere DomainRegistry.
3. Kjør DomainHealthReport og QuizAudit ved større dataendringer.
4. Ikke fjern gating for knowledge/trivia uten bevisst produktvalg.
5. Ikke legg nye idébibler inn i rot-README.
6. Ikke kopier gamle README-blokker videre; konsolider dem i riktig dokument.
7. Ikke legg nye progresjonssannheter ved siden av `quiz_history`, `knowledge_universe`, `trivia_universe`, `hg_learning_log_v1`, courses/pensum og eksisterende profile/update-hooks uten migreringsplan.

---

## 9. Dokumentasjonskart

- `README.md` i repo-rot: kort inngang
- `README/README.md`: denne hovedoversikten
- `docs/HISTORY_GO_PRODUCT_MAP.md`: produktkart og ferdigstillelseskart
- `docs/COMPLETION_DEFINITIONS.md`: definisjon av fullført
- `docs/PROGRESSION_MODEL.md`: progresjons-read-model
- `docs/PLACE_STANDARD.md`: stedstandard
- `README/README_DEV.md`: daglig drift, lokal kjøring, validering og debugging
- `README/README.pensum.md`: fagkart, emner, pensum og progresjon
- `README/quizREADME.md`: quiz, learning log, observations og rewards
- `data/places/README_place_rounds.md`: PlaceCard-rundinger
- `data/wonderkammer/README.md`: Wonderkammer-datastandard
- `docs/HG_SOCIAL_README.md`: Social Meet / HG Social / Spotmeeting
- `docs/DOMAIN_REGISTRY_README.md`: domene- og aliasstruktur
- `docs/README_HistoryGo_Historiske_Ruter.md`: historiske ruter

README-regel:

> Én sannhet per dokument. Rot-README er inngang. Hoved-README er oversikt. Produktkartet eier ferdigstillelsesstatus. Fag-, data-, quiz-, social- og place-rounds-kontrakter skal ikke overstyres av nye planleggingsdokumenter.
