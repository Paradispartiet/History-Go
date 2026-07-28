# History GO — quiz, samling og fysisk besøksstatus

Status: **operational runtimeguide**  
Canonical ferdigmodell: `docs/COMPLETION_DEFINITIONS.md`  
Fysisk visit: `js/visits/physicalVisits.ts` og `js/ui/placeVisitButton.ts`  
Quiz-adapter: `js/quiz/quizAccess.ts`  
Place unlock/samling: `js/hg_unlocks.js`  
Profil place-samling: `js/profile-place-collection.js`  
Sist kontrollert: **2026-07-28**

Dette dokumentet beskriver den implementerte grensen mellom **digital quiz**, **quiz-basert place-samling** og **fysisk besøksregistrering**.

> **Quiz kan samle et sted uten å registrere fysisk besøk. Fysisk besøkt og samlet er forskjellige akser.**

## 1. Autoritetsrekkefølge

1. `docs/COMPLETION_DEFINITIONS.md` — produktbetydningen av besøkt/samlet/fullført.
2. faktisk runtime og tester.
3. `js/visits/physicalVisits.ts` — fysisk visit.
4. `js/quiz/quizAccess.ts` — digital quiztilgang uten fysisk visit-write.
5. `js/hg_unlocks.js` — target-unlocks og `places_collected`.
6. `js/profile-place-collection.js` — profilsamling som union av visited + quiz-collected.
7. `js/progress/placeProgress.ts` — smal beregnet place-snapshotmodell.
8. denne menneskelesbare guiden.

Ved konflikt gjelder kode/tester foran denne teksten.

## 2. Digital quiz er uavhengig av fysisk besøk

Quiz-adapteren gjør at eldre besøksgate ikke blokkerer digital quiz og deaktiverer quiz-veien som tidligere kunne skrive besøksstatus.

Derfor:

- quiz kan åpnes digitalt;
- quizåpning er ikke fysisk besøk;
- quizfullføring er ikke fysisk besøk;
- quiz skal ikke skrive fysisk visited-state.

Regresjonsgrensen kontrolleres av quiz/visit-testene.

## 3. Fysisk besøksservice

`HGPhysicalVisits` eier fysisk besøksregistrering.

Den:

- normaliserer place-ID;
- bruker fysisk persistens;
- krever godkjent posisjonsgate utenom testmodus;
- er idempotent for allerede besøkt sted;
- sender fysisk visit-event ved nytt vellykket besøk.

Et fysisk besøk skal kunne leses som fysisk besøkt i relevant PlaceCard/read-model.

## 4. Posisjonsgate

Fysisk besøk krever nåværende posisjon og minst ett gyldig avstandsmål, med mindre eksplisitt testmodus brukes.

Gaten skiller blant annet mellom:

- manglende posisjon;
- manglende anker;
- for stor avstand;
- godkjent fysisk nærhet.

Stedets koordinat/radius skal derfor være korrekt etter coordinate-kontraktene.

## 5. PlaceCard-knappen

Visit-knappen kan vise tilstander som:

- `Henter posisjon…`;
- `Gå nærmere`;
- `Registrer besøk`;
- `Registrer besøk (test)`;
- `Besøkt ✅`.

Knappen skal ikke markere et quiz-samlet, men fysisk ubesøkt sted som `Besøkt`.

## 6. Quiz-basert place-samling

Place-samling gjennom quiz eies **ikke** av fysisk visit-tjenesten.

Når et faktisk place-target unlock utløses, kan `js/hg_unlocks.js` registrere stedet i:

```text
places_collected
```

Denne write-pathen er separat fra:

```text
visited_places
```

Et target-unlock betyr derfor:

```text
quiz-unlock → samlet sted
```

ikke:

```text
quiz-unlock → fysisk besøkt sted
```

Det er særlig viktig at legacy «perfect quiz/all configured sets»-unlock ikke brukes som fysisk besøksbevis.

## 7. Profilens place-samling

`js/profile-place-collection.js` leser minst to place-kilder:

```text
visited_places
places_collected
```

Profilens samlede place-liste er unionen av disse.

Kildelabelen kan fortsatt skille:

- `Besøkt` for fysisk visit;
- `Quiz` for quiz-samlet place.

Dermed kan profilen vise begge som samlet uten å forfalske hva spilleren faktisk gjorde.

## 8. Smal `HGPlaceProgress`

`HGPlaceProgress.createSnapshot()` er en smal beregnet adapter og kan bruke egne statusnavn som `unopened`, `opened`, `visited`, `quiz_completed`, `explored` og `mastered`.

Disse statusene:

- lagrer ikke automatisk ny state;
- erstatter ikke skillet mellom fysisk visit og quiz collection;
- er ikke en full canonical spillerstate-modell.

`explored` og `mastered` må derfor forstås innenfor denne helperens egne inputregler, ikke som bevis for at alle completion-/belønningssystemer er implementert.

## 9. Ikke garantert av fysisk visit-subsystemet

Fysisk visit-tjenesten tildeler ikke automatisk:

- quizresultat;
- quiz collection;
- People unlock;
- badge/merit;
- Bronse/Sølv/Gull;
- route completion;
- observations;
- generiske Objects/Details/Spots-unlocks.

Andre subsystemer kan reagere på fysisk visit-event, men slike downstream-effekter må ha egen dokumentert runtime/test.

## 10. Ikke garantert av quiz collection

`places_collected` betyr ikke automatisk:

- fysisk visit;
- fysisk check-in;
- rutevisit;
- mastery;
- badge/merit;
- People-/Object-unlock utover det target-unlock-systemet faktisk skriver.

## 11. Forholdet til completion/progresjon

Canonical begreper eies av:

- `docs/COMPLETION_DEFINITIONS.md`.

Samlet read-model eies av:

- `docs/PROGRESSION_MODEL.md`.

Denne guiden dokumenterer bare runtimegrensen mellom quiz, place-collection og fysisk visit.

## 12. Validering

Relevante kontroller omfatter minst:

```bash
node --test tests/quiz-physical-visit-separation.test.js
node --test tests/quiz-place-collection.test.js
node --test tests/profile-place-collection.test.js
npm run typecheck:web
```

Bruk faktiske package-scripts når navnene er registrert der; filtestene over uttrykker kontraktene som skal holdes grønne.

## 13. Endringsregel

Når noen av disse grensene endres, skal denne guiden oppdateres i samme PR:

- fysisk visited-write;
- quiz-adapterens visit-separasjon;
- `places_collected`;
- target-unlock for places;
- profile collection union/kildelabel;
- offentlig API i de aktuelle runtimehelperne.