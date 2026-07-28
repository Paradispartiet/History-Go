# PlaceCard-rundinger (`rounds`)

Status: **canonical presentasjonskontrakt**  
Sist kontrollert: **2026-07-28**

PlaceCard-rundinger er små, visuelle samlingsinnganger. De skal ikke brukes som en ekstra meny for alt som finnes om et sted.

## Hovedregel

> **Rundinger viser ting brukeren kan se, bla i, åpne eller samle. Stedspopupen viser kunnskap om stedet.**

Dette skiller to produktroller:

- **PlaceCard-rundinger** = visuelle samlinger av entiteter eller objekter;
- **stedspopupfaner** = artikkel, historie, Stories, før/etter, nyheter, Lesespor, kilder og øvrig stedskunnskap.

Den tidligere 3×3-modellen blandet entiteter, kunnskapsflater, tidsvisninger og handlinger i samme grid. Den modellen er nå compatibility-input, ikke produktkontrakten.

## Canonical visuelle rundinger

Nye data skal bruke disse rundingene når de er relevante:

- `people`
- `nature`
- `badges`
- `works`
- `civication`
- `brands`

Det finnes **ikke lenger noe krav om ni rundinger**. Et sted kan ha tre, fire, fem eller seks relevante visuelle samlinger. Et tomt felt skal ikke fylles med en tilfeldig runding for å oppnå et geometrisk mål.

### `people`

Navngitte personer med canonical personprofil og visuelt kort/portrett når bilde finnes. Koblingen skal være stedsspesifikk og dokumentert.

### `nature`

Observerbare naturentiteter og naturfaglige samleobjekter knyttet til stedet, for eksempel arter, planter, dyr, geologiske detaljer og andre konkrete naturspor.

`nature` skal ikke opprette en kopi av et canonical place. Akerselva, Øyungen eller Stensparken er steder; en art, bergart eller konkret naturdetalj ved stedet kan være innhold i Nature-rundingen.

### `badges`

Merker, faglige samlinger og progresjonsobjekter. Rundingen kan vise hovedbadge, underbadges og andre eksplisitte collectible-progresjonsobjekter.

### `works`

Visuelle eller identifiserbare verk og produksjoner knyttet til stedet: kunstverk, bøker, sanger, album, filmer, sceniske verk, arkitekturverk og andre canonical works.

Sportsresultater eller abstrakte statistikkposter skal ikke presses inn som bilder bare fordi eldre `works`-data tillot en bredere definisjon. Hvis innholdet ikke fungerer som et identifiserbart verk/objekt i en visuell samling, hører det normalt hjemme i en annen flate.

### `civication`

Civication Store / Thingstore. Stedsspesifikke fysiske objekter som kan samles, kjøpes eller brukes videre i Civication.

Dette er en integrasjonsflate, ikke et synonym for Wonderkammer eller alle fysiske ting i History Go. Et Civication-objekt skal miste mye av meningen sin dersom det flyttes til et vilkårlig annet sted.

### `brands`

Navngitte systemaktører med egen identitet: institusjoner, organisasjoner, klubber, bedrifter, museer, scener, medier, butikker, offentlige aktører og andre canonical brands/actors.

`brands` betyr fortsatt ikke bare kommersielle merkevarer.

## Flyttet ut av runding-gridet

Følgende er kunnskaps- eller presentasjonsflater og skal ikke lenger vises som canonical rundinger:

- `leksikon` / `lexicon`
- `fortellinger` / `stories` / `story`
- `før_nå`
- `routes` som tidligere alias for `før_nå`

De presenteres i stedspopupen:

- Leksikonets hovedartikkel og fakta → **Om**
- `chronology`, historiske lag og bruksspor → **Historie**
- canonical Stories → **Fortellinger**
- `for_na` → **Før/etter**
- gamle nyheter og nyere notiser → **Nyheter**
- Lesespor → **Lesespor**
- `externalLinks` og source summaries → **Kilder**
- språk, observasjoner og smalere kunnskapsinnhold → **Mer**

## Handlinger er ikke samlingsrundinger

Disse eldre rundingene beskriver handling, ikke en visuell samling:

- `play`
- `training`
- `tasks`

De skal derfor ikke vises i det canonical visuelle runding-gridet.

Eksisterende `tasks_profile`, `training_profile` og eventuelle `play_profile` beholdes som source-data og vises i overgangsmodellen under **Mer → Gjør på stedet**. En senere egen handlingsflate kan overta uten å endre dataformatene.

Quiz, Observer, Notat, Rute og andre konkrete handlinger kan fortsatt ha egne knapper/flows. De skal ikke gjøres til visuelle samleobjekter.

## Wonderkammer

`wonderkammer` er **ikke en canonical PlaceCard-runding mens modellen konsolideres**.

Repoet inneholder historisk tre ulike Wonderkammer-idéer:

1. navigasjonsnett som leder videre til personer, steder, praksiser og institusjoner;
2. aktivitets-/leke-/treningssoner med `activityText`, alder og instruksjoner;
3. nyere stedsspesifikke kuriositeter og `actual_site_treasure`-oppføringer.

Disse skal ikke blandes i én runding. Den aktive Wonderkammer-kontrakten dokumenteres i `data/wonderkammer/wonderkammer.md`. Generiske aktivitetsoppføringer skal migreres til handlingsoverflater; relasjons-/navigasjonsinnhold skal bruke relations/NextUp; bare den konsoliderte Wonderkammer-typen kan eventuelt bli en visuell runding senere.

## `rounds` og `rounds_exclude`

`place.rounds` / `rundinger` finnes fortsatt for bakoverkompatibilitet og manuell kuratering.

For nye eller reviderte steder:

- bruk bare canonical visuelle ID-er i `rounds`;
- bruk `rounds_exclude` når en ellers relevant standardrunding ikke passer stedet;
- ikke legg inn kunnskapsfaner eller handlinger for å fylle plass;
- ikke krev et bestemt antall rundinger.

Eksempel:

```json
{
  "id": "eksempel_sted",
  "rounds": ["people", "works", "brands", "badges"],
  "rounds_exclude": ["nature"]
}
```

## Runtime og kompatibilitet

Den eldre PlaceCard-runtimekoden kjenner fortsatt flere historiske round-ID-er og kategori-profiler. `js/ui/place-rounds-visual-collections.js` er presentasjonsgrensen som snevrer den brukerrettede flaten inn til canonical visuelle samlinger uten å slette legacy-data.

Det betyr:

- gammel JSON trenger ikke massemigreres for at UI-et skal bli ryddig;
- legacy round-ID-er kan fortsatt leses under migrering;
- brukerflaten viser bare relevante visuelle rundinger;
- source-data kan migreres separat og kontrollert senere.

## Kuratoriske kvalitetsporter

En foreslått ny runding består testen når svaret på alle disse er ja:

1. Representerer den **ting**, ikke en artikkel, en fane eller en handling?
2. Kan hvert element få et meningsfullt visuelt kort, bilde, ikon eller tydelig collectible-uttrykk?
3. Har elementene egen identitet som brukeren kan forstå og åpne?
4. Er koblingen til stedet dokumentert og stedsspesifikk?
5. Gir samlingen mening selv om stedspopupens brødtekst ikke vises?

Hvis nei, skal innholdet normalt inn i stedspopupen eller en egen handlingsflyt.

## Minneskilt og små markører

Tidligere regel om å ekskludere tilfeldig natur på minneskilt gjelder fortsatt. Et minneskilt skal ikke få Nature-runding bare fordi det står ute. Bruk `rounds_exclude: ["nature"]` når naturinnholdet ikke handler om selve objektet eller et dokumentert, stedsspesifikt naturspor.

## Filer

- Presentasjonsruntime: `js/ui/place-rounds-visual-collections.js`
- Legacy round registry og source-renderere: `js/ui/place-card.js`
- Popupfaner: `js/ui/place-popup-tabs.js`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Wonderkammer-kontrakt: `data/wonderkammer/wonderkammer.md`
