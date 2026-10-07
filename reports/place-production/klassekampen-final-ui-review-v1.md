# Klassekampen-redaksjonen — final interactive UI review v1

Dato: 2026-10-07  
Place ID: `klassekampen_redaksjon`  
PR: #6137  
Status: **PASS**

## Scope

Denne reviewen lukker bare den manuelle/interaktive UI-gaten etter Phase 2-materialiseringen. Den endrer ikke governance for den separate 1997 Story-kandidaten eller før/etter-modulen.

Kontrollert på både desktop (1440×1000) og mobil (390×844):

- exact place-route og synlig PlaceCard;
- canonical collection mode `place-card-collections-v2`;
- nøyaktig fire samlinger i rekkefølgen People → Objects → Brands → Productions;
- lastbare collection-previews;
- interaktiv åpning av alle fire collection-popups;
- forventede canonical medlemmer/innhold;
- materialisert QuizCard og faktisk flip begge veier;
- quizinngang til `#/quiz/klassekampen_redaksjon`;
- ingen horisontal overflow;
- ingen page errors;
- ingen ødelagte synlige bilder;
- korrekt nåværende stedsidentitet/adresse i den øvrige PlaceCard-flaten.

## Fail-closed funn under reviewen

Første browser-QA viste at funksjonene var operative, men avslørte en stale engelsk i18n-tittel med «Hausmanns gate». `final_ui` ble derfor ikke godkjent.

Etter i18n-rettingen fant den strengere QA-en ytterligere stale Hausmann-tekst i `data/stories/stories_klassekampen_redaksjon.json`. Dette ble også holdt fail-closed. Kildeteksten ble rettet til dagens dokumenterte adresse Grønland 4, og `place-open`/story-runtime ble regenerert med den canonicale generatoren.

Quizens «Hausmanns gate 16» beholdes som et bevisst feilalternativ i spørsmålet om dokumentert besøksadresse og er uttrykkelig ekskludert fra stale-adressekontrollen.

## Endelig exact-head evidence

Exact head: `eb12503e649d1608b673bd8bd99b8fe46ca0b2ea`  
Workflow: `TEMP Klassekampen final UI QA`  
Run ID: `37672921605`  
Artifact ID: `11505139384`  
Artifact: `klassekampen-final-ui-eb12503e649d1608b673bd8bd99b8fe46ca0b2ea`  
Artifact SHA-256: `a8e6b945b84373939419f886699399ea911abcfe1e7687e5dc26c080535b621f`

Både desktop og mobil rapporterte følgende som `true`:

- `exactPlace`
- `title`
- `noLegacyHausmann`
- `canonicalAddressVisible`
- `visible`
- `canonicalCollectionMode`
- `fourCollections`
- `collectionIdsAndOrder`
- `collectionCounts`
- `collectionPreviewsLoaded`
- `collectionPopups`
- `quizCardMaterialized`
- `quizCardFlip`
- `quizEntry`
- `noHorizontalOverflow`
- `noPageErrors`
- `noBrokenVisibleImages`

Collection counts i den endelige kjøringen:

- People: 2
- Objects: 1
- Brands: 1
- Productions: 4

Popup-evidence bekreftet blant annet Bjørgulv Braanen, førsteutgaven av Klassekampen, Klassekampen-brandet, Bokmagasinet, Musikkmagasinet og Klassekampen e-avis.

## Governance-konklusjon

`manual_reviews.final_ui` kan settes til **PASS** med denne reviewen som permanent evidence.

Følgende forblir separate og **BLOCKED**:

1. 1997-redaktørkrisen som Story-kandidat inntil den har bestått Stories-governance.
2. Før/etter inntil et lisensiert historisk/nåværende bildepar med dokumentert motiv- og synsvinkelmatch finnes.

Place Production-workflowen skal derfor fortsatt ha samlet state `blocked` etter at `final_ui` lukkes.
