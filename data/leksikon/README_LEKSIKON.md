# History GO — Leksikon for steder

Status: **operativ datakilde for stedspopup og samlingspopuper**  
Sist kontrollert: **2026-08-25**

Leksikon er ikke lenger en egen canonical PlaceCard-runding. Leksikon-dataene er et strukturert kunnskapslag som brukerflatene kan lese inn hos riktig semantisk eier.

## Hovedregel

> **Leksikon eier kunnskapsdata. Stedspopupen og samlingspopupene eier presentasjonen.**

Det betyr at data under `data/leksikon/` beholdes og fortsatt lastes gjennom `data/leksikon/manifest.json`, men brukeren skal ikke måtte gå gjennom:

`PlaceCard → Leksikon-runding → Leksikon-hub → Sted`

for å lese om et sted.

Den canonical brukerflyten er enten:

`PlaceCard → stedspopup → riktig kunnskapsfane/seksjon`

eller, når opplysningen beskriver en konkret samlingsenhet:

`PlaceCard → riktig samling → eiet underseksjon`.

## Hva Leksikon-data kan inneholde

Eksisterende stedspakker kan blant annet inneholde:

- hovedartikkel (`wikiText`, `popupDesc`, `summary`);
- `facts`;
- `chronology`;
- `built_environment`;
- hendelser og samfunn;
- historiske bruksspor;
- gamle nyheter;
- nyere notiser;
- objekter / `artifacts`;
- tolkning / ting å legge merke til;
- klassifikasjon;
- Språkleksikon;
- `externalLinks`.

Disse er ikke én brukerrettet «Leksikon-hub» lenger. De fordeles etter semantisk rolle.

## Mapping til brukerflater

| Leksikon-data | Brukerrettet eier |
| --- | --- |
| hovedartikkel, fakta, bygd miljø | stedspopup → **Om** |
| `chronology`, historie, bruksspor, historiske hendelser | stedspopup → **Historie** |
| canonical Stories | stedspopup → **Fortellinger** via Stories-systemet |
| `historical_news` / gamle avisnotiser | stedspopup → **Nyheter → Gamle nyheter** |
| `news_notes` / nyere notiser | stedspopup → **Nyheter → Nyere notiser** |
| Lesespor | stedspopup → **Lesespor** |
| `externalLinks`, source summaries | stedspopup → **Kilder** |
| Språkleksikon | valgfri direkte **Språk**-fane når stedet har språkstoff |
| `interpretation.what_to_notice` | **Objects/Gjenstander-popup → Legg merke til** når det gjelder fysiske spor |
| `interpretation.why_it_matters` | stedspopup → **Om → Betydning** |
| `interpretation.counterpoints` | stedspopup → **Om → Motpunkter** |
| legacy-objekter / `artifacts` / object-like oppføringer | **Objects/Gjenstander-popup → Spor og objekter** |

Personrelasjoner som kommer fra andre canonical place-/People-kilder vises i **People-popupen**. Rene place→place-relasjoner eies av **Relaterte steder (`related`)**. Leksikon skal ikke gjøre en place-relasjon om til en personrelasjon.

`for_na` kommer fra place-data og vises i den separate **Før/etter**-fanen.

### Ingen parallelle direktefaner

`Spor & objekter`, `Legg merke til`, `Betydning`, `Motpunkter`, `Relasjoner`, `Kunnskap` og `Observasjoner` er ikke lenger generelle direktefaner i stedspopupen. Legacy-`Mer` kan eksistere som intern staging i runtime, men staging-innholdet skal rutes til eieren ovenfor uten sletting eller duplisering.

**Språk** er den eneste definerte valgfrie direktefanen utover de sju faste grunnfanene.

## Hovedartikkel og place-tekst

Leksikonets hovedartikkel kan supplere place `popupDesc`, men skal ikke automatisk duplisere identisk tekst.

Place-data eier fortsatt stedets canonical identitet og hovedbeskrivelse. Leksikon kan tilføre:

- flere dokumenterte fakta;
- eksplisitt chronology;
- funksjons- og bygningshistorie;
- egne oppslag og kilder.

Runtime skal ikke skrive Leksikon-data tilbake til place-objektet.

## Chronology

`chronology` er tidslinjedata og vises i **Historie**.

Den skal ikke produseres om til Stories bare fordi et årstall er viktig. Se `docs/STORIES_DATA_GOVERNANCE.md` for skillet mellom chronology og narrativ Story.

## Nyheter og notiser

Leksikon har reelle separate nyhetstyper, og disse skal bevares som korte spor:

- `historical_news`, `gamle_nyheter`, avisnotiser og tilsvarende → Gamle nyheter;
- `news_note`, `nyere_notis`, moderne hendelsesnotiser og tilsvarende → Nyere notiser.

Nyhetsfanen skal være proporsjonal: en liten brann-, politi- eller driftsnotis skal ikke automatisk bli en Story eller del av hovedartikkelen.

## Objects-supplementer

Leksikon kan levere kunnskapsseksjoner til Objects/Gjenstander-popupen uten å overta canonical Objects-registeret.

- `artifacts`, `objects` og object-like Leksikon-oppføringer kan vises som **Spor og objekter**;
- `interpretation.what_to_notice` kan vises som **Legg merke til** når det handler om fysiske, observerbare spor;
- et slikt supplement endrer ikke Objects-antallet med mindre elementet faktisk materialiseres som canonical Object etter Objects-kontrakten;
- samme element skal dedupliseres mot canonical `place.objects` / `place.artifacts`;
- teksten skal aldri konstrueres om til en falsk gjenstand for å fylle samlingen.

Full presentasjonsgrense ligger i `data/places/README_place_rounds.md` og `docs/PLACE_POPUP_SYSTEM.md`.

## Lesespor

Lesespor er en egen datakilde og egen stedspopupfane.

Fra et sted skal bare Lesespor med eksplisitt matching `place_ids` vises. Stedspopupen prioriterer åpne tekster og filtrerer bort oppføringer som eksplisitt er merket som betalingsmur/abonnement.

Global Lesespor-visning kan fortsatt finnes separat.

## `externalLinks`

`externalLinks` er fortsatt et valgfritt array på place- eller Leksikon-artikler.

Eksempel:

```json
"externalLinks": [
  {
    "type": "official",
    "label": "Bislett stadion – offisiell nettside",
    "url": "https://www.bislettstadion.no/"
  },
  {
    "type": "stats",
    "label": "World Athletics – Oslo Bislett Games",
    "url": "https://worldathletics.org/competition/calendar-results/"
  },
  {
    "type": "wikipedia",
    "label": "Wikipedia – Bislett stadion",
    "url": "https://no.wikipedia.org/wiki/Bislett_stadion"
  }
]
```

Tillatte/forventede typer omfatter:

- `official`
- `stats`
- `wikipedia`
- `source`
- `archive`
- `database`
- `map`
- `other`

Brukerrettet runtime viser bare validerbare HTTPS-lenker.

Lenkene vises nå i **Kilder**-fanen, ikke i en egen Leksikon-popup.

## Kildekvalitet

Lenker skal fortsatt kurateres:

1. offisiell/institusjonell kilde når relevant;
2. faglig database eller statistikkilde;
3. arkiv eller seriøs sekundærkilde;
4. Wikipedia når siden faktisk gjelder riktig sted;
5. andre lenker bare når de tilfører dokumentert verdi.

Ikke legg inn lenker for completeness.

## Språkleksikon

Språkleksikonet er det canonicale laget for stedbundet språk. Full kontrakt ligger i:

`docs/SPRAKLEKSIKON.md`

Datakildene beholdes under:

- `data/leksikon/sprak/manifest.json`;
- `data/leksikon/sprak/schema_v2.json`;
- stedsspesifikke filer under `data/leksikon/sprak/places/`.

Når et sted har minst én språkoppføring eller en dokumentert atlasprofil etter Språkleksikon-kontrakten, fremhever `js/ui/place-language-layer.js` materialet med en valgfri, direkte **Språk**-fane i den horisontalt scrollbar fanestripen og en kompakt «Språk på stedet»-forhåndsvisning i Om. Tomme språkflater vises ikke.

Språkleksikon er fortsatt ikke en PlaceCard-runding. Det er et kunnskapslag. En bruker kan eksplisitt samle enkeltoppføringer inn i den eksisterende Knowledge V2-butikken; runtime skal ikke opprette et parallelt dialekt-/språklager.

## Wonderkammer

Wonderkammer skal ikke lenger ligge «under Leksikon» som en generell restkategori.

Dette var en senere sammenslåing som blandet flere produktidéer. Wonderkammer har nå egen konsolideringskontrakt i `data/wonderkammer/wonderkammer.md`.

Leksikon-loaderen kan fortsatt ha legacy-kobling til `WK_BY_PLACE` under migrering, men den koblingen er **ikke** den canonical nye brukerflyten.

## Runtime

`js/leksikon/leksikon_loader.js` fortsetter å:

- laste manifestet;
- indeksere artikler per `place_id`;
- støtte legacy `HGLeksikon.openPlace`;
- levere `read_leksikon`-grunnlag;
- laste stedsspesifikt Språkleksikon;
- støtte global Lesespor-flyt.

`js/ui/place-popup-tabs.js` er den primære adapteren for de sju faste stedspopupfanene. `js/ui/place-popup-direct-tabs.js` ruter legacy staging til canonical eierflater, `js/ui/place-collection-knowledge-routing.js` kobler Objects-/People-supplementer inn i samlingspopupene, og `js/ui/place-language-layer.js` fremhever Språkleksikonet som valgfri Språk-fane når data finnes.

Legacy Leksikon-hub skal beholdes midlertidig som compatibility-path mens andre kallere migreres. Nye UI-innganger skal ikke bygges mot den.

## Validering

Ved nye eller reviderte Leksikon-data skal det fortsatt kontrolleres:

- unik og stabil oppførings-ID;
- gyldig `place_id`;
- korrekt JSON;
- ingen duplikate leksikon-ID-er;
- HTTPS for brukerrettede eksterne lenker;
- tydelig skille mellom historie, nyhet/notis, objekt og språk;
- riktig eierflate for object-spor, tolkning og språk;
- ingen fiktive completeness-oppføringer.

Språkdata følger i tillegg kvalitetskravene i `docs/SPRAKLEKSIKON.md`.

## Ikke gjør dette

- Ikke gjeninnfør Leksikon som PlaceCard-runding.
- Ikke gjeninnfør Språkleksikon som egen PlaceCard-runding.
- Ikke gjeninnfør `Mer`, «Annet» eller en serie faste direktefaner for Leksikonets tilleggslag.
- Ikke opprett en separat dialektdatabase ved siden av `data/leksikon/sprak/`.
- Ikke flytt alle Leksikon-records fysisk inn i place-filene.
- Ikke dupliser canonical Stories i Leksikon for å fylle Fortellinger-fanen.
- Ikke bruk `chronology` som Story-generator.
- Ikke legg Wonderkammer tilbake under Leksikon før Wonderkammer-migreringen er avklart.
- Ikke hardkod stedsspesifikke lenker i JS.
