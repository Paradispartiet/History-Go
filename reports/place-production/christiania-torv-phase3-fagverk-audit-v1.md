# Christiania Torv – fase 3 Fagverk/kategori/emne audit v1

Dato: 2026-08-23  
Place ID: `christiania_torv`  
Baseline: `main` etter fase-2-merge `fe97609bb188f2170845bce22c6dcb93b0732f16`  
Styrende kontrakter: `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/FAGVERK_NAVIGATION.md`, `data/categories/category_contract.json`

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: #5268 / fe97609bb188f2170845bce22c6dcb93b0732f16
SISTE GODKJENTE TILSTAND: identity/source/coordinate låst; ingen canonical mutation.
KONKRET REGRESJONSEVIDENS: ingen mot kategori eller de to eksisterende emne-ID-ene.
BESLUTNING: BEHOLD eksisterende faglige eiere; ikke legg til emner/underbadges for volum.
```

## 1. Primærkategori – PASS

`category: by` beholdes.

Christiania Torv er først og fremst et byrom/plassobjekt: den regulerte renessansebyen, plassgeometri, offentlig møte-/handelsrom, historiske funksjonsskifter og dagens bruk leses gjennom By-faget. Historie er et sterkt innholdslag, men det er ikke nødvendig å flytte canonical Place til kategorien `historie` for å produsere historiske lag, Story eller relasjoner.

## 2. Emner – PASS

Eksisterende emner beholdes:

- `em_by_torg_plasser_som_scene`;
- `em_by_offentlige_rom_motesteder`.

Begge eies eksplisitt av det `chapter_ready` Fagverk-kapittelet `data/fagverk/by/byliv-offentlige-rom.json`. Kapittelet lærer nettopp forskjellen mellom torg som fysisk rom og torg som faktisk brukt marked-, møte-, demonstrasjons- og arrangementsrom.

Christiania Torv har sterk place-spesifikk evidens for begge:

- marked og offentlig møtefunksjon i den tidlige byen;
- civic funksjoner rundt rådhus/kirke/vannpost/straff;
- senere endret bruk og gjenoppretting av plassrommet.

Ingen ekstra emne-ID legges til bare fordi stedet også har arkitektur-, kunst- eller historieinnhold. Slike lag kan kobles gjennom Story, People, Objects, relations og senere popupinnhold uten å gjøre emnelisten kunstig bred.

## 3. Fagverk-status – PASS

`data/fagverk/fagverk_portal.json` har `by.subjectStatus = materialized`. Christiania Torv trenger derfor ikke et nytt parallelt By-fag eller særkapittel for å være faglig brukbart.

Fase 3 produserer heller ikke nye `em_by_*`-definisjoner. Eksisterende canonical emner og kapittel er tilstrekkelige eiere.

## 4. Underbadges – BEGRUNNET INGEN NYE

Canonical Place har ingen eksplisitte underbadges. Fase 3 finner ikke et kvalitetsbehov som rettferdiggjør å opprette underbadges bare for checklist-dekning.

Historisk betydning, grunnlegging, byplan, marked og offentlig makt skal uttrykkes gjennom place-tekst, profiler, Story, Objects/relations og Quiz/Knowledge – ikke gjennom nye merker uten egen kontraktsmessig eier.

## 5. Nature og andre fag – ikke tvangskoblet

Christiania Torv er ikke et natursted. Vegetasjon, fontene eller byromsopphold åpner ikke i seg selv et `nature_profile`. Tilsvarende skal Kunst, Historie eller Næringsliv ikke få parallelle canonical Place-eiere uten at deres egne stedsgater eksplisitt krever det.

## Bevaring

Fase 3 endrer ikke:

- canonical Place-data;
- kategori eller `emne_ids`;
- koordinater;
- `desc`/`popupDesc`;
- People, Objects, Brands, Story, Quiz eller rundinger;
- popupfaner.

## Fase-3-konklusjon

**KLAR FOR REVIEW.** `by` + de to eksisterende bylivsemnene er riktig og allerede faglig materialisert. Ingen filler-emner eller underbadges er lagt til. Etter grønn merge går stedet videre til fase 4 – `desc`/`popupDesc` med v4.2 description production packet og eksplisitt source→claim→sentence-sporbarhet.
