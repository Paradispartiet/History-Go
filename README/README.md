# 🧭 History GO — hoved-README

History GO er et offline-first, stedbasert kunnskaps- og samlespill der byen fungerer som spillbrett.

Spilleren oppdager steder, sjekker inn, tar quiz/oppgaver, låser opp kunnskap, personer, funn, badges og ruter, og bygger sin egen samling gjennom profil og Wonderkammer.

Dette dokumentet er hovedoversikten for **History GO-spillet**. Civication er eget prosjekt og skal ikke styre denne README-en.

---

## 1. Produktkjerne

History GO skal fullføres som ett stort spillunivers, ikke som løse moduler.

Kjerneløype:

```text
Kart → Sted / PlaceCard → Innsjekk → Quiz / oppgave → Belønning → Profil / Wonderkammer → Neste sted / rute
```

Steder er navet. Profilen er spillerkortet. Wonderkammer er samlingen. Ruter er kampanjer. HG Social og Spotmeeting skal kobles til steder, ruter, funn og trygg offentlig møtebruk.

---

## 2. Status / sider

- **Hovedapp:** `index.html` — kart, nearby, place card, quiz, popups, ruter, progresjon og miniProfile
- **Profil:** `profile.html` — full profilside for samling, merker, historikk og profilpaneler
- **Kunnskap:** `knowledge.html`
- **Notater:** `notater.html`
- **Emner / pensum:** `emner.html`
- **AHA:** `AHA/index.html` — import, innsiktskammer og meta

`index.html` er hoved-app-shell for kart, nearby, place card, quiz og miniProfile.

Index bruker split boot:

- `bootCritical()` for raskt kart/places
- `bootBackground()` for people/relations/wonderkammer/nature/stories/events/brands

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
- innsjekkstatus
- quizstatus
- badge / belønning
- personer / relasjoner
- relaterte steder
- ruter
- Wonderkammer-funn
- favorittstatus
- social / Spotmeeting der relevant

### Quiz / badges

Quiz gir evidens, progresjon og belønning.

Rewards/hooks kan gi:

- HGInsights
- Knowledge
- Trivia
- badges
- profiloppdatering
- Wonderkammer-funn

### Profil

Profilen er spillerkortet.

Den skal samle:

- besøkte/fullførte steder
- badges
- kategoriprogresjon
- opplåste personer
- Wonderkammer-funn
- favoritter
- ruter
- offentlig hjemsted
- social/Spotmeeting-status der relevant
- NextUp

### Wonderkammer

Wonderkammer er samlingen og arkivet.

Det bør samle steder, personer, badges, funn, ruter, kuriositeter, kunstverk, litterære spor, naturfunn, sportshistorie, musikksteder, politiske hendelser, næringslivshistorie og byfenomener.

### Nearby / favoritter

Nearby svarer på: Hva kan jeg gjøre nå?

Nearby bør prioritere steder nær spilleren, steder i aktiv rute, ufullførte quizzer, steder som låser opp personer/funn, og favoritter i nærheten.

### Ruter

Ruter er kampanjer.

En rute bør ha startsted, stopp, anbefalt rekkefølge, progresjon, belønning, sluttbadge, profilvisning og Wonderkammer-kobling.

### People / relations

People skal være unlock-system, ikke bare datalag.

Spilleren bør møte personer gjennom steder, ruter, funn og kategorier.

### HG Social

HG Social skal handle om steder, funn, ruter, profiler, trygg deling og felles aktivitet.

Se også `docs/HG_SOCIAL_README.md`.

### Spotmeeting

Spotmeeting skal være en trygg, stedbasert møtefunksjon knyttet til offentlige History GO-steder.

Det skal ikke være en generell møteapp. Det skal handle om å møtes ved History GO-steder for ruter, funn, samtaler og aktiviteter.

---

## 4. Ferdigstillelseskart

Det operative produktkartet ligger her:

- [`docs/HISTORY_GO_PRODUCT_MAP.md`](../docs/HISTORY_GO_PRODUCT_MAP.md)

Der står:

- hva som mangler
- hva som bør fullføres først
- hva som bør videreutvikles
- hvilke systemer som må kobles
- hvordan kategoriene bør spille ulikt
- hvordan progresjon, PlaceCard, profil, Wonderkammer, ruter, social og Spotmeeting bør fullføres

Kort prioritet:

1. Felles progresjonssystem
2. PlaceCard-standard
3. Profil
4. Wonderkammer
5. Nearby / favoritter
6. Ruter
7. Innholdsstandard per kategori
8. Innholdshull i svake kategorier
9. HG Social
10. Spotmeeting
11. Backend / login / sync

---

## 5. Fag / knowledge / progresjon

History GO bruker fagkart, emner, steder, quiz og evidens for å bygge kunnskap.

Grunnstruktur:

```text
Merke → Gren / type → Temaområde → Emne → Quiz → Instanser / steder / personer / hendelser
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

---

## 9. Dokumentasjonskart

- `README.md` i repo-rot: kort inngang
- `README/README.md`: denne hovedoversikten
- `docs/HISTORY_GO_PRODUCT_MAP.md`: produktkart og ferdigstillelseskart
- `README/README_DEV.md`: daglig drift, lokal kjøring, validering og debugging
- `README/README.pensum.md`: fagkart, emner, pensum og progresjon
- `docs/HG_SOCIAL_README.md`: sosial kontrakt og social layer
- `docs/DOMAIN_REGISTRY_README.md`: domene- og aliasstruktur
- `docs/README_HistoryGo_Historiske_Ruter.md`: ruter der relevant

README-regel:

> Én sannhet per dokument. Rot-README er inngang. Hoved-README er oversikt. Produktkartet eier ferdigstillelsesstatus.
