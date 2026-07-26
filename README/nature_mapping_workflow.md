# Naturmapping i History GO

Status: **operational**
Sist kontrollert: **2026-07-26**

Dette dokumentet beskriver arbeidsflyten for å koble flora og fauna til eksisterende History GO-steder. Det er en produksjonsguide, ikke en biologisk fasit eller en erstatning for runtimekoden.

## Autoritetsgrenser

- Canonical place-ID-er og koordinater eies av aktive place-filer og manifester under `data/places/`.
- Naturarter eies av aktive flora-/faunafiler og deres manifester under `data/natur/`.
- Place-level naturkoblinger eies av de aktive mappingfilene som lastes av `js/nature_place_map_bridge.js`.
- Quiz-unlocks eies separat av `data/natur/nature_unlock_map.json` og tilhørende runtime.
- Denne guiden eier bare arbeidsmåten.

Ved konflikt gjelder source-data, manifester, bridge/runtime og validering.

## Aktiv runtimeflate

`js/nature_place_map_bridge.js` laster og slår sammen disse mappingfilene:

```text
data/natur/nature_place_map.json
data/natur/nature_bird_place_map.json
data/natur/nature_oslo_expansion_place_map.json
data/natur/nature_routes_place_map.json
data/natur/nature_etne_place_map.json
```

Ikke legg samme place–art-kobling i flere filer uten en uttrykkelig grunn. Bridge-laget dedupliserer ID-er, men duplisert eierskap gjør kildesporing og vedlikehold vanskeligere.

## Kandidatbygger

Kildefil:

```text
tools/build_nature_place_candidates.mts
```

Kjør fra repo-roten:

```bash
npm run build:tools && node dist/tools/build_nature_place_candidates.mjs
```

Scriptet:

1. leser aktive places fra `data/places/manifest.json`;
2. leser aktive flora- og faunafiler fra deres manifester;
3. spør Artskart per prioritert sted;
4. matcher observasjoner mot arter som allerede finnes i repoet;
5. skriver kandidater til `data/natur/nature_place_map_candidates.json`.

Kandidatfila er et generert arbeidsartefakt og kan være tom før en lokal kjøring. Den skal aldri lastes direkte i appen eller behandles som godkjent mapping.

## Datakilder

### Artskart / Artsdatabanken

Brukes til konkrete registrerte observasjoner. Fravær av funn beviser ikke fravær av arten, og eldre funn kan være utdaterte eller geografisk upresise.

### Naturbase / Miljødirektoratet

Brukes som støtte for naturtyper, verneområder, forvaltning og sensitivitet.

### Lokale naturkilder

Lokale naturkart, forvaltningsplaner, institusjoner og fagmiljøer kan brukes til å kontrollere habitat, restaurering, grøntdrag og stedsspesifikke naturverdier.

## Kurateringsflyt

1. Kontroller at `placeId` finnes i et aktivt place-manifest og peker til riktig fysisk sted.
2. Kjør kandidatbyggeren eller gjør dokumentert manuell research.
3. Kontroller artsidentitet mot aktive flora-/faunadata.
4. Vurder habitat, avstand, observasjonsdato, koordinatusikkerhet og pedagogisk verdi.
5. Velg én passende aktiv mappingfil med tydelig geografisk eller funksjonelt ansvar.
6. Legg bare inn canonical arts-ID-er som runtime kan resolve.
7. Behold quiz-unlocks separat.
8. Test bridge-/PlaceCard-visning og relevante dataaudits.

## Confidence

Kandidatbyggerens tekniske sortering bruker foreløpig:

```text
high   = minst 5 funn og siste funn fra 2020 eller senere
medium = minst 2 funn og siste funn fra 2015 eller senere
low    = svakere grunnlag
```

Dette er bare et prioriteringsfilter. `high` er ikke automatisk redaksjonell godkjenning, og `low` er ikke automatisk biologisk avvisning.

## Kvalitetsgate

En kobling bør normalt ha flere av disse egenskapene:

- nyere eller gjentatte observasjoner med rimelig presisjon;
- habitat som faktisk passer stedet;
- canonical arts-ID som allerede finnes i repoet;
- tydelig pedagogisk eller stedlig relevans;
- kildegrunnlag som kan forklares og etterprøves;
- ingen konflikt med skjerming av sensitive arter.

Unngå:

- råimport av lange artslister;
- gamle enkeltfunn uten støtte;
- observasjoner med høy koordinatusikkerhet;
- arter som bare er registrert i nærheten uten relevant habitat;
- presis eksponering av sensitive arter eller lokaliteter;
- UI-filtrering som permanent løsning på dårlige source-data.

## Viktig arkitekturregel

Rett mappingen i source-dataene. Ikke legg midlertidige artsunntak eller skjulte kvalitetsfiltre i PlaceCard eller andre UI-flater for å kompensere for svak kuratering.

> Kandidater er research. Aktiv mapping er en eksplisitt redaksjonell beslutning.
