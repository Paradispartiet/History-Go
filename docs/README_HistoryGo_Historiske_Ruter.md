# History GO — Historiske ruter

Status: **operational runtimeguide**  
Canonical schema: [`../data/routes/historical/schema_historical_route.json`](../data/routes/historical/schema_historical_route.json)  
Aktiveringsmanifest: [`../data/routes/historical/manifest.json`](../data/routes/historical/manifest.json)  
Runtime: [`../js/historical-routes.js`](../js/historical-routes.js)  
Sist kontrollert: **2026-07-26**

Historiske ruter er narrative History GO-reiser der en rute organiserer kapitler, historiske stopp og progresjon. Dette dokumentet beskriver det som faktisk er implementert. Den tidligere konsept-, idé- og faseplanen er bevart byte-identisk i rapportarkivet og er ikke nåstatus.

## Autoritetsrekkefølge

1. [`../data/routes/historical/schema_historical_route.json`](../data/routes/historical/schema_historical_route.json) — maskinlesbart ruteskjema.
2. [`../data/routes/historical/manifest.json`](../data/routes/historical/manifest.json) — aktiverte route-filer.
3. Route-dataene som manifestet laster, for tiden [`../data/routes/historical/routes_historical_oslo.json`](../data/routes/historical/routes_historical_oslo.json).
4. [`../js/historical-routes.js`](../js/historical-routes.js) — online-spiller, progresjonslagring og events.
5. `HGNextUpHistoricalRoutes` i [`../js/nextUpRuntime.js`](../js/nextUpRuntime.js) — NextUp-forslag og handoff til spilleren.
6. [`../tools/audit-historical-routes.mts`](../tools/audit-historical-routes.mts) og rutetestene — maskinell kontroll.
7. Dette dokumentet — menneskelesbar implementasjonsguide.

Ved konflikt gjelder schema, manifest, aktive data, runtime og tester foran denne teksten.

## Implementert nå

### Data og aktivering

- `data/routes/historical/manifest.json` laster route-filer under samme mappe.
- Aktive objekter bruker `type: "historical_route"` og `feature: "historiske_ruter"`.
- Hver rute har arketype, periode, fortelling, kapitler, play modes og rewards-metadata.
- Kapitler kan peke til et canonical `placeId` eller være tekstlige etapper uten fysisk sted.
- Fysiske kapitler har `physical.enabled`, `placeId` og positiv `gpsRadius` i data.
- Auditen kontrollerer route- og chapter-ID-er, manifestlastingen og at alle place-referanser finnes i aktive place-source-filer.

### Online-spiller

`window.HGHistoricalRoutes` eksponerer:

- `load()`
- `getAll()`
- `getProgress(routeId)`
- `startRoute(routeId)`
- `completeCurrentChapter(routeId)`
- `getRouteArchetypeLabel(routeArchetype)`
- `renderCards()`
- `bindCards(container)`
- `open(routeId)`
- `close()`

Runtime bruker `DataHub.loadHistoricalRoutes()` når helperen finnes, ellers manifestbasert fetch. Bare ruter med gyldig type, feature, online-modus og minst ett kapittel tas inn i spilleren.

Spilleren viser ruteintro, kapittel, periode, fortelling, første task-prompt, tilknyttet place-ID og progresjon. Brukeren kan starte, gå videre kapittel for kapittel, fullføre online og starte reisen på nytt.

### Progresjon

Canonical runtime-key for denne modulen er:

```txt
hg_historical_routes_progress_v1
```

Per rute lagres blant annet:

```txt
status
online.started
online.completed
online.currentStopId
online.completedStopIds
physical.visitedStopIds
physical.completed
updatedAt
```

Aktive online-statuser er:

```txt
not_started
started
online_in_progress
online_completed
```

Online-fullføring setter ikke fysisk fullføring.

### Events og NextUp

Ved progresjonsendring sender runtime:

- `updateProfile`
- `hg:historicalRouteProgress`

Ved online-fullføring sender den også:

- `hg:routeCompleted` med route-ID og `strength: 2`

NextUp-integrasjonen er implementert. Den kan foreslå en ikke startet eller påbegynt rute, åpne riktig route-player og vise handlingsetiketter som «Start reisen», «Fortsett reisen», «Samle fysiske stopp senere» eller «Spill reisen på nytt» ut fra faktisk progresjon og om ruten har fysiske kapitler.

## Ikke implementert eller ikke garantert

Følgende må ikke omtales som ferdig runtime:

- GPS-basert registrering av fysiske routestopp.
- Automatisk oppdatering av `physical.visitedStopIds` fra vanlige place-besøk.
- Fysisk route-fullføring eller fysisk route-badge.
- Direkte tildeling av points eller badges i `historical-routes.js`; rewards-feltene er metadata, og runtime viser dem ved fullføring.
- Faktiske quiz-, valg- eller oppgaveporter. Dagens task-felt vises som refleksjons-/placeholdertekst, og Neste-knappen håndhever ikke et svar.
- Route objects, Wonderkammer-unlocks, creator-publisering eller ekstern route-import.
- Automatisk profilseksjon med full route-statistikk utover events og lagret read-model.

`playModes.physical.enabled: true` betyr derfor at ruten er modellert for framtidig fysisk samling. Det betyr ikke at GPS-innsamlingen er implementert.

## Datakrav

En aktiv rute skal minst ha:

```txt
id
title
type = historical_route
feature = historiske_ruter
routeArchetype
narrativeText
playModes.online
playModes.physical
chapters
rewards
```

Et kapittel skal minst ha:

```txt
sequence
id
chapterTitle
narrativeText
tasks
physical
```

Når `chapter.placeId` finnes:

- ID-en skal finnes i aktive place-source-filer.
- `chapter.physical.placeId` skal peke til samme canonical sted.
- `physical.enabled` skal være `true` og `gpsRadius` skal være positiv.

Når et kapittel ikke har `placeId`:

- det er en tekstlig etappe;
- `physical.enabled` skal være `false`;
- det skal ikke oppgis fysisk place-ID eller radius.

`physicalCollected` i canonical route-data skal være `false`. Brukerens tilstand skal ligge i progress store, ikke skrives tilbake til route-dataene.

## Redaksjonell arbeidsflyt

1. Gjenbruk eksisterende canonical places når kapitlet representerer et faktisk History GO-sted.
2. Opprett ikke et nytt place bare for å fylle et route-kapittel dersom et tekstlig kapittel er mer presist.
3. Legg nye ruter i en manifestlastet route-fil og behold stabile route- og chapter-ID-er.
4. Skille mellom dokumentert historisk bevegelseslogikk og moderne turforslag.
5. Ikke erklær fysisk samling, badges, points eller quiz som implementert før runtime og tester håndhever det.
6. Kjør alle route-kontroller før merge.

## Validering

```bash
npm run test:historical-routes
npm run test:nextup-historical-routes
npm run test:historical-routes:audit
```

Testene kontrollerer blant annet:

- minst fem aktive eksempelruter;
- gyldige place-referanser;
- konsistente fysiske chapter-felter;
- online progresjon og separat fysisk status;
- `updateProfile` ved progresjonsendring;
- route-arketypelabels;
- NextUp-status, handlingsetiketter og åpning av riktig rute.

## Historisk planmateriale

Den opprinnelige 1 198-linjers feature-, mekanikk- og faseplanen er bevart i:

```txt
reports/archive/2026-07/historical-routes/README_HistoryGo_Historiske_Ruter_PRE_CONSOLIDATION_2026-07-26.md
```

Planen kan brukes som idéhistorikk. Den kan ikke brukes til å hevde at foreslåtte v0.2–v0.7-funksjoner er implementert.
