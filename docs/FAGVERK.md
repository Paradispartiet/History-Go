# History Go – fagverk, merker og egne stedssider

Status: **operational politikk-implementasjon v4**
Runtime: `js/fagverk-forside.js`, `js/politikk-fag-model.js`, `js/politikk-fagportal.js`, `js/fagverk.js`, `js/fagverk-canonical-integration.js`, `js/fagverk-place-canonical-integration.js`, `js/ui/place-learning-canonical.js`
Data: `data/fagverk/fagverk_portal.json`, `data/fag/politikk/politikk_runtime_manifest.json`, canonical politikkfiler, `data/fagverk/fagverk_registry.json`, `data/fagverk/<fag>/<kapittel>.json`
Sider: `fagverk-forside.html`, `data/fag/politikk/merke_politikk.html`, `fagverk.html?subject=politikk`, `fagverk-sted.html?place=<place_id>`

Canonical kontrakt for bygging og ferdigstilling av alle fagsider: [`FAGVERK_SUBJECT_PAGE_CONTRACT.md`](./FAGVERK_SUBJECT_PAGE_CONTRACT.md)
Navigasjon og sideroller: [`FAGVERK_NAVIGATION.md`](./FAGVERK_NAVIGATION.md)

Dette dokumentet beskriver dagens politikkimplementasjon og eksisterende runtime. Det eier ikke den generelle produksjons- eller ferdigstatusmodellen for alle fag.

## Én fagmodell, flere tydelige sideroller

History Go skal ikke bruke «fagverk», «merke» og «fag» som navn på den samme flaten.

```text
FAGVERKFORSIDEN
alle canonicale fagområder
        │
        ├── MERKESIDEN
        │   badge, undermerker, poeng, nivå, quiz og steder
        │
        └── FAGSIDEN
            pensum, fagkart, emner, metoder og lærekapitler
                    │
                    └── STEDSSIDENE
                        konkrete steder koblet gjennom emne_ids og underbadge_ids
```

De to fagspesifikke inngangene kan bruke de samme canonicale dataene, men de har forskjellige oppgaver og forskjellige adresser.

## Fagverkforsiden

`fagverk-forside.html` er målet for **Fagverket** i hovedmenyen. Headeren skal aldri sende brukeren direkte til politikk eller et annet enkeltfag.

Forsiden leser:

- canonical fagrekkefølge og visningsnavn fra `data/categories/category_contract.json`;
- navigasjonsmål og materialiseringsstatus fra `data/fagverk/fagverk_portal.json`;
- navn, ikon, bilde, beskrivelse, nivåer og poeng fra badgefilene og brukerens merit-lagring.

Hvert fagkort skiller eksplisitt mellom:

- **Åpne merket** – spill- og progresjonssiden;
- **Åpne faget** – læresiden.

En planlagt fagside skal vises som ikke-klikkbar status. Portalen skal aldri sende brukeren til en side som bare ender i «ukjent fag».

## Politikkmerket

`data/fag/politikk/merke_politikk.html` er merkesiden for Politikk & samfunn.

Den viser:

- politikkmerket, poeng og nivå;
- undermerker;
- politikkquiz og politikksteder;
- emne- og fagområdedekning som progresjonsoversikt;
- tydelige lenker videre til politikkfaget.

Siden kan vise hvordan merket er koblet til canonicale fagområder og emner. Den er likevel ikke selve fagsiden og skal merkes som **Politikkmerket** i toppfelt, sidetittel og navigasjon.

## Politikkfaget

`fagverk.html?subject=politikk` er fagsiden og læreverket for politikk.

Den har to nivåer:

1. Canonicale fagområdesider finnes dynamisk for alle tretten politikkdomener.
2. Fullverdige lærekapitler gir sammenhengende, redigert lærestoff der kapitler er materialisert.

Et canonicalt emne kan åpnes med:

```text
fagverk.html?subject=politikk&domain=<domain_id>&emne=<emne_id>
```

De fullverdige kapitlene beholder ingress, forkunnskapsspørsmål, læringsmål, sammenhengende seksjoner, arbeidseksempler, misoppfatninger, begreper, anvendelsesoppgaver, kontrollspørsmål, selvstendige stedssider og inspectable kilder.

`emner.html` beholder rollen som brukerens tverrfaglige progresjonsoversikt. Det er ikke en erstatning for læreverket.

## Eierforhold

### Kategorikontrakten eier

- canonical fag-ID-er;
- canonical rekkefølge;
- visningsnavn for fagene.

### Fagverkportalregisteret eier

- lenken til hvert fags merkeside;
- lenken til materialiserte fagsider;
- statusen `materialized` eller `planned`.

Registeret skal ikke kopiere pensum, emner, badgeinnhold eller progresjon.

### Badgefilen eier

- merkenavn, ikon, bilde og farger;
- beskrivelse;
- poenggrenser og nivåer;
- listen over undermerke-ID-er.

### Canonicale politikkfiler eier

- tretten fagområder;
- 123 emner;
- emnetitler, definisjoner og begreper;
- metoder, hooks og mappinger;
- quiz- og kildekrav.

### Runtime-manifestet eier

- filpekere til source of truth;
- koblingen mellom undermerker og fagområder;
- koblingen mellom canonicale fagområder/emner og eksisterende lærekapitler;
- canonicale ruter mellom politikkmerket, politikkfaget, progresjon og stedssider.

### Fagverkregisteret eier

- hvilke ferdigskrevne lærekapitler som finnes;
- stedsspesifikke ekstra emne-ID-er;
- kuraterte linser og spørsmål for enkelte steder.

Fagverkregisteret skal ikke håndkopiere emnetitler, definisjoner eller begrepslister fra politikkfaget.

## Egne stedssider

Alle canonicale steder har en stabil sideadresse:

```text
fagverk-sted.html?place=<place_id>
```

For politikksteder brukes begge koblingene:

```text
underbadge_ids → merke, undermerker og spillprogresjon
emne_ids       → fagområder, emner, begreper, quiz og læreverk
```

Stedssiden viser artikkel, relevante undermerker, emneprogresjon, faglige linser, canonicale fagområder, fullverdige lærekapitler, emner, begreper, kilder og lenke tilbake til kartet.

Et sted skal ikke bygges inn som et kapittel eller et «case» i selve faget. Fagområdet kan lenke til stedet, men stedets historie og tverrfaglige perspektiver eies av stedets egen side.

## Stedspopup

Seksjonen **Fag og begreper** åpner alltid stedets egen fagverkside. For politikksteder viser popupen også relevante undermerker, canonicale fagområder, fullverdige lærekapitler, emner og begreper. Tilknytningskort og separate kildelenker beholder den eksisterende interaksjonsmodellen.

## Emnelaster

Den felles loaderen skal peke politikk direkte til:

```text
data/fag/politikk/emner_politikk_canonical_v4_5.json
```

Både `js/emnerLoader.ts` og `dist/web/emnerLoader.js` skal være synkronisert.

## QA

```bash
node --check js/fagverk-forside.js
node --check js/merke-fallback.js
node --check js/politikk-fag-model.js
node --check js/politikk-fagportal.js
node --check js/fagverk.js
node --check js/fagverk-canonical-integration.js
node --check js/fagverk-place-canonical-integration.js
node --check js/ui/place-learning-canonical.js
node --test tests/fagverk-portal.test.mjs
node --test tests/politikk-fag-integration.test.mjs
node --test tests/fagverk-content.test.mjs
node --test tests/fagverk-place-pages.test.mjs
node --test tests/fagverk-link-audit.test.mjs
node --test tests/place-learning-surface.test.js
node tests/header-search-menu.test.js
```
