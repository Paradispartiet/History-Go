# History GO — index-appstruktur

Status: **canonical kontrakt for `index.html`-appen**  
Sist kontrollert: **2026-07-25**

Dette dokumentet beskriver dagens `index.html`-struktur etter app-shell-, fast-boot-, router- og MapView-arbeidet.

Målet er å holde index-appen forståelig og hindre utilsiktede storskalaomskrivinger. Dokumentet eier bare index-appens struktur og grenser; overordnet runtime-eierskap ligger fortsatt i `README/SYSTEM_REGISTRY.md` og `README/SYSTEM_MAP.md`.

## Dagens eierskap

`index.html` er History GOs hoved-app-shell.

Det eier:

- kartflaten
- headeren
- Nearby-/venstrepanelet
- PlaceCard/bottom sheet
- quiz-overlayen
- miniProfile som rask profilstatus
- den lette hash-routeren for index-interne ruter

`index.html` beholder miniProfile for rask status. `profile.html` er canonical full profilside. `#/profile` er ikke en intern index-visning; routeren navigerer til `profile.html`.

`Civication.html` er fortsatt en separat side. `#/civication` navigerer dit og er ikke en intern index-visning.

## Entry- og bootmodell

`index.html` laster den minimale app-shell-flaten og starter modul-entryen:

```html
<script type="module" src="./js/app.js"></script>
```

`js/app.js` eier eksplisitt lastrekkefølge for index-runtime. Den laster kritiske avhengigheter, `js/boot-fast.js`, `js/views/MapView.js` og `js/router/AppRouter.js`, kaller `bootCritical()`, markerer appen klar, starter routeren og planlegger `bootBackground()`.

`js/boot-fast.js` eier selve splitten mellom kritisk og ikke-kritisk dataarbeid.

### Critical boot

`bootCritical()` skal bare gjøre arbeidet som trengs for å få første brukbare kartskjerm:

- initialisere kjerne-/runtimegrunnlag som boot-funksjonen selv eier
- initialisere open/test mode
- initialisere viewport og kart
- laste den lette place-basen via DataHub/manifest
- eksponere `window.PLACES`
- sette kartets places og marker-click
- rendre første brukbare shell-/kartstatus

Critical boot skal holdes liten og skal ikke vente på tunge sekundærdata.

### Background boot

`bootBackground()` laster og indekserer ikke-kritiske data etter at kartet allerede er brukbart, blant annet:

- people
- relations
- Wonderkammer/leksikon-grunnlag
- tags
- nature
- Lesespor
- stories
- events
- brands
- sekundære badge-/UI-data der det er relevant

Bakgrunnsboot skal være defensiv. Én sviktende bakgrunnsmodul skal ikke gjøre kartskallet ubrukelig.

## Routermodell

`js/router/AppRouter.js` eier index-interne hash-ruter.

Aktive index-ruter:

```txt
#/map
#/place/:id
#/quiz/:id
#/debate/:id
```

Eksterne sidegrenser:

```txt
#/profile     → profile.html
#/civication → Civication.html
```

Bruk route-helperne i stedet for å spre manuelle hash-strenger i UI-filer:

```js
window.HGAppRouter?.toMap?.();
window.HGAppRouter?.toPlace?.(placeId);
window.HGAppRouter?.toQuiz?.(targetId);
window.HGAppRouter?.toDebate?.(debateId);
```

## MapView-modell

`js/views/MapView.js` eier det tynne view-state-laget for index-rutene.

Det koordinerer:

- grunnkartet for `#/map`
- kartflytting og PlaceCard for `#/place/:id`
- quiz-overlay for `#/quiz/:id`
- debattåpning for `#/debate/:id`
- lukking/skjuling av rutespesifikk UI ved retur til kartet
- felles pending-navigation slik at søk, Nearby og place-ruter venter på ferdig kartbevegelse før PlaceCard vises

MapView skal forbli tynt. Det skal koordinere eksisterende DOM-/runtimeadferd, ikke erstatte kartmotoren, PlaceCard, QuizEngine eller debattmotoren.

## Skal ikke flyttes uten egen migreringsfase

Ikke flytt disse inn i index-routeren som del av en urelatert endring:

- `profile.html`
- `js/profile.js`
- `Civication.html`
- `js/Civication/**`

Sidene har egne boot-/runtimeforutsetninger og skal forbli separate til en eksplisitt migreringsplan vedtas.

## Sikker endringsregel

Gode neste steg:

- behold grensen mellom `bootCritical()` og `bootBackground()`
- hold route-helperne sentralisert i `AppRouter`
- gjør små route-/state-korreksjoner i `MapView`
- oppdater dette dokumentet når en index-rute, sidegrense eller boot-eier endres
- behold miniProfile som rask status og `profile.html` som full profil

Unngå:

- store routeromskrivinger
- å flytte profile/Civication inn i index som del av andre patches
- å endre bootrekkefølge uten å kontrollere første brukbare kartskjerm og bakgrunnslasting
- å blande appstruktur med dataflytting eller visuell redesign

## Tommelfingerregel

Hvis en endring er nødvendig for første brukbare kartskjerm, hører den til den kritiske entry-/bootkjeden.

Hvis en endring beriker cards, people, stories, relations, brands, nature eller sekundærpaneler, hører den til bakgrunnsboot, eventdrevet refresh eller et avgrenset subsystem.
