# History Go – fagverk, merker og egne stedssider

Status: canonical politikk-integrasjon v3  
Runtime: `js/politikk-fag-model.js`, `js/politikk-fagportal.js`, `js/fagverk-canonical-integration.js`, `js/fagverk-place-canonical-integration.js`, `js/ui/place-learning-canonical.js`  
Data: `data/fag/politikk/politikk_runtime_manifest.json`, canonical politikkfiler, `data/fagverk/fagverk_registry.json`, `data/fagverk/<fag>/<kapittel>.json`  
Sider: `data/fag/politikk/merke_politikk.html`, `fagverk.html`, `fagverk-sted.html?place=<place_id>`

## Én fagmodell, flere visninger

Politikk skal ikke bestå av parallelle, usynkroniserte teorisider.

```text
POLITIKKMERKET
badge, undermerker, poeng og nivå
        │
        ▼
CANONICAL POLITIKKFAG
pensum → fagkart → emner → metoder → mapping
        │
        ├── quiz og spørsmålsproduksjon
        ├── emne- og kursprogresjon
        └── fagverkstruktur
                │
                ▼
FAGVERK
redigerte lærekapitler og dynamiske fagområde-/emnevisninger
                │
                ▼
STEDSSIDENE
konkrete steder koblet gjennom emne_ids og underbadge_ids
```

`data/fag/politikk/politikk_runtime_manifest.json` er runtime-kontrakten som peker til alle autoritative kilder. UI skal lese denne kontrakten i stedet for å hardkode filstier eller kopiere emnetitler og begreper.

## Politikkforsiden

`data/fag/politikk/merke_politikk.html` er forsiden for hele politikkfaget. Den viser brukerens politikkmerke, alle elleve undermerker, koblingen til tretten canonicale fagområder, fullverdige lærekapitler, alle 123 emner og emnedekning, politikkquiz, politikksteder og et begrepsregister generert fra canonicale emner.

Den gamle statiske «full teori»-teksten er erstattet. Fagforsiden presenterer faktisk runtime-data og progresjon.

## Eierforhold

### Badgefilen eier

- merkenavn, ikon og farger;
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
- canonicale ruter mellom politikkforside, fagverk, progresjon og stedssider.

### Fagverkregisteret eier

- hvilke ferdigskrevne lærekapitler som finnes;
- stedsspesifikke ekstra emne-ID-er;
- kuraterte linser og spørsmål for enkelte steder.

Fagverkregisteret skal ikke håndkopiere emnetitler, definisjoner eller begrepslister fra politikkfaget.

## Fagverket

`fagverk.html` har to nivåer:

1. Canonicale fagområdesider finnes dynamisk for alle tretten politikkdomener.
2. Fullverdige lærekapitler gir sammenhengende, redigert lærestoff der kapitler er materialisert.

Et canonicalt emne kan åpnes med:

```text
fagverk.html?subject=politikk&domain=<domain_id>&emne=<emne_id>
```

De fullverdige kapitlene beholder ingress, forkunnskapsspørsmål, læringsmål, sammenhengende seksjoner, arbeidseksempler, misoppfatninger, begreper, anvendelsesoppgaver, kontrollspørsmål, selvstendige stedssider og inspectable kilder.

`emner.html` beholder rollen som brukerens tverrfaglige progresjonsoversikt. Det er ikke en erstatning for læreverket.

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
node --check js/politikk-fag-model.js
node --check js/politikk-fagportal.js
node --check js/fagverk-canonical-integration.js
node --check js/fagverk-place-canonical-integration.js
node --check js/ui/place-learning-canonical.js
node --test tests/politikk-fag-integration.test.mjs
node --test tests/fagverk-content.test.mjs
node --test tests/fagverk-place-pages.test.mjs
node --test tests/place-learning-surface.test.js
```
