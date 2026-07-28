# History GO — definisjoner av fullført

Status: **canonical produktmodell for ferdigtilstander**  
Eier: `history_go_completion_model`  
Sist kontrollert: **2026-07-28**

Dette dokumentet definerer hva ord som **besøkt, samlet, fullført og mestret** betyr på produktnivå. Det skal ikke lage nye lagringsnøkler eller overstyre implementert runtime.

Leses sammen med:

- `docs/HISTORY_GO_PRODUCT_MAP.md`
- `docs/PROGRESSION_MODEL.md`
- `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md`
- `docs/PROFILE_PROGRESS_READER_RUNTIME.md`
- `docs/DATA_PRODUCTION_CONTRACT.md`
- `data/places/README_place_rounds.md`

## 1. Hovedregel

History GO skal vite **hva spilleren faktisk har gjort**, og forskjellige handlinger skal ikke kollapses til samme status.

Følgende begreper er forskjellige:

- oppdaget;
- åpnet;
- fysisk besøkt;
- sjekket inn, der det finnes;
- quiz forsøkt;
- quiz fullført;
- observert;
- samlet;
- favorittmarkert;
- fullført;
- mestret.

En status er bare implementert når den kan spores til faktisk lagring/read-model/runtime og leses i relevant UI.

## 2. Besøkt er fysisk

`visited` betyr fysisk besøksstatus.

I dagens runtime kommer fysisk besøksstatus fra den fysiske visit-tjenesten og kompatibel `visited_places`-persistens. Å åpne PlaceCard eller fullføre quiz skal **ikke** registrere fysisk besøk.

Canonical grense:

> Quiz og kunnskapsprogresjon kan aldri brukes som bevis for fysisk besøk.

Se `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md`.

## 3. Samlet sted er ikke det samme som besøkt sted

Et sted kan være samlet gjennom flere gyldige spillhandlinger.

Implementert profil-read-model skiller nå:

- `visited_places` — fysisk besøkte steder;
- `places_collected` — steder samlet gjennom quiz/target-unlock;
- profilsamlingen — unionen av disse to kildene.

Dermed kan et sted være:

- fysisk besøkt, men ikke quiz-samlet;
- quiz-samlet, men ikke fysisk besøkt;
- begge deler.

UI skal ikke merke et quiz-samlet sted som fysisk besøkt.

## 4. Place-status skal leses som flere akser

Ikke press alle stedstilstander inn i én ordinal statusstige.

Et place-progress snapshot bør kunne uttrykke separate akser som:

```text
opened
physicalVisited
quizAttempted
quizCompleted
collected
favorite
observed
routeProgress
```

Den smale `HGPlaceProgress`-runtime kan fortsatt bruke sine implementerte statusnavn. Produktmodellen overstyrer ikke runtime-navn; den hindrer bare at forskjellige handlinger blandes semantisk.

## 5. Fullført sted

`completed` er en **produktstatus**, ikke automatisk synonym med fysisk besøk eller quiz.

Et sted kan kalles fullført bare når en definert History GO-regel for det stedet/den flaten faktisk er oppfylt og resultatet er lagret og lesbart.

Minimumskrav for å hevde en implementert fullføring:

1. stedet er et aktivt canonical place;
2. den utløsende handlingen finnes i runtime;
3. handlingen har en eksplisitt completion-regel;
4. resultatet lagres i eksisterende system;
5. relevant UI/read-model kan lese resultatet;
6. `updateProfile` eller tilsvarende oppdateringsmekanisme utløses der det kreves.

Hvis ingen eksplisitt completion-regel finnes, skal vi vise de konkrete aksene (`Besøkt`, `Quiz fullført`, `Samlet`) i stedet for å oppfinne «Fullført».

## 6. Mestret

`mastered` er en høyere dybdestatus enn `completed` og må ha en konkret implementert regel.

Det er ikke lov å utlede «mestret» bare fordi:

- stedet er besøkt;
- en quiz er fullført;
- alle rundinger finnes;
- data-QA er grønn.

## 7. Bronse / sølv / gull

Bronse, sølv og gull er tillatte produktnivåer, men skal bare vises eller tildeles når aktuell badge-/merit-/place-runtime faktisk implementerer reglene.

Det finnes ingen global automatisk regel som sier:

```text
besøkt = bronse
quiz = sølv
ekstra handling = gull
```

En slik mapping kan brukes først når den er eksplisitt materialisert og testet for systemet det gjelder.

Sted-for-sted-sjekklisten skal derfor merke dette som **implementert / N/A**, ikke anta at nivåene finnes overalt.

## 8. Quiz

Quizproduksjon eies av `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`.

En quiz kan ha flere separate statuser:

- forsøkt;
- fullført;
- perfekt;
- repetert.

Quiz kan oppdatere eksisterende quiz-/learning-/unlock-systemer og kan samle et place-target gjennom `places_collected` når target-unlock faktisk utløses.

Quiz skal aldri skrive fysisk besøksstatus.

## 9. People

People kan ha separate spillstatuser der runtime støtter dem:

- oppdaget;
- låst opp;
- samlet;
- ferdig utforsket.

Canonical persondata og person–sted-koblinger er uavhengige av spillerstatus. En People-record blir ikke «låst opp» bare fordi den finnes i data eller vises i en runding.

## 10. Objects, Details, Spots, Works, Nature og Brands

Disse er canonical innholdstyper/rundinger, ikke automatisk spillerprogress.

Det er lov å implementere unlock/samling for konkrete entiteter, men completion-modellen skal ikke finne på en generell lagringsmodell før runtime gjør det.

Hvis et Object kan kjøpes/eies i Civication, er det Civication-state og ikke automatisk History GO-completion.

## 11. Ruter

Rute-completion følger rutens egen implementerte kontrakt.

For historiske ruter skal online og fysisk progresjon holdes adskilt. `playModes.physical.enabled` betyr ikke at GPS-basert fysisk fullføring er implementert.

Se `docs/README_HistoryGo_Historiske_Ruter.md`.

## 12. Favoritter

Favoritt er en separat brukerpreferanse/status.

Favoritt:

- betyr ikke besøkt;
- betyr ikke samlet;
- betyr ikke fullført;
- skal kunne leses konsistent av flater som faktisk bruker favorittstatus, for eksempel Nearby og profil.

## 13. Profil og miniProfile

Når en spillhandling hevdes å påvirke progresjon, skal resultatet kunne gjenfinnes i relevant profil/read-model der dette er implementert.

For places er den nåværende profilsamlingen en union av:

```text
fysisk besøkte places + quiz-samlede places
```

Kilden skal fortsatt kunne skilles slik at UI ikke forfalsker fysisk besøk.

## 14. Wonderkammer

Wonderkammer er legacy og har **ingen egen canonical completion-type for ny produksjon**.

Gamle Wonderkammer-funn migreres etter faktisk innhold til Objects, Details, Spots, People, Works, Nature, På stedet, Historie, Stories eller relations/NextUp.

Ikke opprett nye `Wonderkammer-funn`, `wonderItemIds` eller Wonderkammer-badges som del av den nye sted-for-sted-modellen uten en separat eksplisitt produktbeslutning og runtimeendring.

## 15. Ferdig produktdata vs spillerens ferdigstatus

Disse må aldri blandes:

- **produksjonsklart sted** = data, kilder, bilder, popup, rundinger, subsystemkoblinger og QA er ferdige etter `PLACE_PRODUCTION_CHECKLIST.md`;
- **spillerens completed/mastered** = spilleren har oppfylt en implementert progresjonsregel.

Grønn CI eller komplett place-data gir aldri automatisk spilleren completion.

## 16. Autoritetsregel

Ved konflikt gjelder:

1. faktisk runtime/persistens og tester;
2. subsystemets canonical runtimekontrakt;
3. denne completion-modellen;
4. eldre roadmaps og arkivdokumentasjon.

Dette dokumentet skal beskrive implementerte skiller presist og merke planlagte modeller som planlagte.