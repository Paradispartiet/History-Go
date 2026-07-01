# History GO — definisjoner av fullført

Dette dokumentet definerer hva “fullført” betyr i History GO.

Det skal ikke erstatte eksisterende kontrakter. Det samler ferdigtilstander på tvers av de kontraktene som allerede finnes.

Leses sammen med:

- `docs/HISTORY_GO_PRODUCT_MAP.md`
- `docs/APP_STRUCTURE_INDEX.md`
- `docs/DATA_PRODUCTION_CONTRACT.md`
- `data/places/README_place_rounds.md`
- `data/wonderkammer/README.md`
- `docs/HG_SOCIAL_README.md`
- `README/quizREADME.md`
- `README/README.pensum.md`
- `README/fagstrukturREADME.md`

Gjelder History GO-spillet. Civication er eget prosjekt og inngår ikke i denne ferdigmodellen, selv om eksisterende data/UI-kontrakter fortsatt kan ha historiske eller tekniske koblingspunkter.

---

## 1. Grunnprinsipp

History GO skal vite hva spilleren faktisk har gjort, ikke bare hva som finnes i data.

Derfor skilles det mellom:

- sett
- åpnet
- besøkt
- sjekket inn
- forsøkt
- observert
- fullført
- mestret
- samlet
- delt / invitert, der privacy-reglene tillater det

En ferdigtilstand må gi synlig eller beregnbar status i relevante flater:

- PlaceCard / popup
- profil / miniProfile
- Wonderkammer / leksikon-hub
- Nearby / NextUp
- ruter
- Social Meet / Spotmeeting der relevant og trygt

---

## 2. Eksisterende kontrakter som styrer ferdigmodellen

### Appstruktur

`index.html` er hoved-app-shell og eier kart, nearby/left panel, PlaceCard/bottom sheet, quiz modal flow, miniProfile og index-routeren. `profile.html` er full profilside og skal ikke flyttes inn i index uten egen fase.

### Data

`DATA_PRODUCTION_CONTRACT` gjelder:

- én place ID, ett canonical place object
- `category` er primært badge/domain
- `underbadge_ids` er underbadgefeltet
- `rounds` er UI, ikke kategori- eller progresjonslogikk
- places og people må komme fra manifest-loadede source-filer
- quiz og people-referanser må validere mot eksisterende data
- progresjonsendrende kode må dispatch’e `updateProfile`

### PlaceCard-rundinger

`rounds` er et UI-grid. Det er ikke ferdigmodell, ikke badge-system og ikke kategori-logikk.

Viktig: `wonderkammer` er ikke canonical PlaceCard-runding. Wonderkammer-innhold skal nå ligge under `leksikon`-flowen / leksikon-huben, selv om Wonderkammer fortsatt er en innholdstype og samlingsmodell.

### Quiz / learning

Quiz-systemet har allerede viktige lagringskilder:

- `quiz_history`
- `knowledge_universe`
- `trivia_universe`
- `hg_learning_log_v1`

Learning log er append-only. Observations ligger i learning log, ikke i `knowledge_universe`.

### Social / Spotmeeting

Social Meet er brukerrettet sosial fane/opplevelse. HG Social er teknisk/arkitektonisk navn. Spotmeeting er én konkret møteforespørsel rundt et History GO-objekt eller tema.

Spotmeeting er ikke egen sosial app, ikke dating, ikke GPS-discovery, ikke feed og ikke fri chat.

---

## 3. Fullført sted

Et sted er fullført når spilleren har gjort en reell History GO-handling ved eller rundt stedet, og resultatet er lagret/vises konsekvent.

Minimum:

1. Stedet finnes som canonical place object i manifest-loadet source-fil.
2. Stedet har gyldig `id`, `name`, `category`, `lat` og `lon`.
3. PlaceCard/popup kan åpnes.
4. Spilleren har gjort en gyldig handling: innsjekk, quiz, observasjon, rute-stopp eller annen definert stedshandling.
5. Progresjon er lagret i eksisterende History GO-lagring/read-model.
6. `updateProfile` dispatches der profilen må oppdateres.
7. PlaceCard/profil/Nearby/rute kan lese statusen.

Fullere fullføring kan i tillegg gi:

- stedsmerke
- quiz fullført
- person låst opp
- Wonderkammer-funn under leksikon/samling
- ruteprogresjon
- kategori-progresjon

---

## 4. Stedstatus

Anbefalt statusmodell for read-model/profil/PlaceCard:

| Status | Betydning |
|---|---|
| `unknown` | stedet finnes i data, men er ikke eksponert for spilleren |
| `discovered` | stedet er vist gjennom kart, Nearby, rute eller søk |
| `opened` | PlaceCard/popup er åpnet |
| `visited` | brukeren har registrert besøk eller relevant stedskontakt |
| `checked_in` | innsjekk er fullført der innsjekk brukes |
| `quiz_attempted` | quiz er startet/forsøkt |
| `quiz_completed` | quiz er bestått/fullført |
| `observed` | observasjon/minioppdrag er lagret i learning log |
| `completed` | stedet er fullført etter History GO-reglene |
| `mastered` | høyeste nivå på stedet er oppnådd |

`completed` er spillbar ferdigtilstand. `mastered` er ekstra dybde.

---

## 5. Bronse / sølv / gull

Bronse, sølv og gull bør tolkes konsekvent, men må ikke bryte eksisterende badge-data.

Anbefalt produktmodell:

| Nivå | Betydning |
|---|---|
| Bronse | besøkt, åpnet eller sjekket inn |
| Sølv | quiz/oppgave/observasjon fullført |
| Gull | sølv + ekstra kobling, for eksempel person, rute-stopp, Wonderkammer-funn eller perfekt quiz |

Dette er produktlogikk. Implementasjon må respektere eksisterende badgefiler og `underbadge_ids`.

---

## 6. Fullført quiz

En quiz er fullført når:

1. Quiz startes fra gyldig kontekst, normalt PlaceCard, person, rute eller relevant quiz-entry.
2. Quizdata kommer fra manifest/aktiv quizload, ikke ad-hoc path.
3. Alle nødvendige spørsmål er besvart.
4. Resultat beregnes.
5. `quiz_history` og relevante quiz/progresjonslag oppdateres.
6. Knowledge/trivia/learning log hooks kjøres der de finnes.
7. `updateProfile` dispatches.
8. Reward-popupen får være first-class og overskrives ikke umiddelbart av ny popup.

Quiz bør skille mellom:

- forsøkt
- fullført
- perfekt
- repetert

---

## 7. Fullført observation / minioppdrag

Observations og minioppdrag skal behandles som situerte learning-log-events.

Fullført observation betyr:

1. Brukeren starter observasjon fra gyldig target: place, person eller generic.
2. `lensId` matcher en faktisk `lens_id` i observations-data.
3. Brukeren velger chips og eventuelt note.
4. Event skrives append-only til `hg_learning_log_v1`.
5. Eventen kan vises i place/person-popup.
6. Eventen kan telle i kurs/progresjon dersom kursmotoren bruker den.

Observations skal ikke skrives inn i `knowledge_universe`.

---

## 8. Fullført badge / merke

Et badge er fullført når:

1. Regelen for badget er oppfylt.
2. Badget kan spores til source: sted, quiz, rute, person, kategori eller Wonderkammer-funn.
3. Badget lagres i eksisterende badge/progresjonsmodell.
4. Badget vises i profil eller relevant samlingsflate.
5. Badget følger kategori/underbadge-kontrakten.

Badge må svare på: hvorfor fikk spilleren dette?

---

## 9. Fullført person

En person bør ha flere nivåer:

| Nivå | Betydning |
|---|---|
| Oppdaget | personen er vist via sted/rute/søk |
| Låst opp | spilleren har gjort handlingen som låser opp personen |
| Samlet | personen vises i profil/Wonderkammer/samling |
| Ferdig utforsket | nøkkelsteder, relasjoner, quiz eller rute er fullført |

Minimum:

1. Personen finnes i manifest-loadet people-fil.
2. Personen har stabil `personId`/`id`.
3. `placeId` eller `places[]` peker til eksisterende places.
4. Spilleren gjør en handling som låser personen opp.
5. Profil/samling kan vise personen.

Personer skal ikke dupliseres på tvers av people-filer.

---

## 10. Fullført Wonderkammer-funn

Wonderkammer er History GOs stedlige forundringskammer.

Et Wonderkammer-funn er fullført når:

1. Funnobjektet har stabil id, tittel/type og konkret stedlig forankring.
2. Funnobjektet svarer på: hva er tingen, hvor finnes den, hva er forunderlig, hva kan brukeren gjøre, hva samles den som?
3. `treasureScope` brukes på nye entries der relevant.
4. Funnobjektet er fortrinnsvis `actual_site_treasure`, ikke generisk `category_object`.
5. Spilleren gjør handlingen som låser det opp eller samler det.
6. Funnobjektet vises i Wonderkammer/leksikon-hub/samling.

Wonderkammer-funn uten konkret ting eller handling er innhold, men ikke ferdig spillobjekt.

---

## 11. Fullført rute

En rute er fullført når:

1. Ruten er startet.
2. Ruten har tydelig type: vanlig geografisk rute eller historisk rute.
3. Alle obligatoriske stopp/kapitler er fullført.
4. Eventuelle quizzer, valg, objekter eller sluttoppgaver er fullført.
5. Ruteprogresjon oppdateres.
6. Profil viser status.
7. Ruten kan gi badge, Wonderkammer-funn eller annen samlingsstatus.

For historiske ruter skal online og fysisk progresjon skilles:

- online = du reiser historien
- fysisk = du samler sporene etter den

Mulige rute-statuser:

- ikke startet
- påbegynt online
- fullført online
- delvis samlet fysisk
- fullført fysisk
- komplett historisk rute

---

## 12. Fullført kategori

En kategori er fullført i nivåer, ikke bare ja/nei.

Eksempel:

| Nivå | Krav |
|---|---|
| Startet | minst ett sted åpnet |
| Bronse | flere steder eller quizzer fullført |
| Sølv | rute, emnedekning eller flere steder fullført |
| Gull | flere ruter/steder/personer/funn fullført |
| Mestergrad | større kategori-prøve, diplom eller definert hovedmål fullført |

Kategori-progresjon må respektere fag-/pensumarkitekturen:

- emner er mikro-kunnskap
- quiz tester emner
- knowledge er erfaring
- pensum/courses tolker erfaring til progresjon
- status kan være beregnet, ikke nødvendigvis lagret

---

## 13. Fullført Nearby-handling

Nearby er fullført som handling når:

1. Nearby anbefaler et sted eller en rute.
2. Brukeren åpner anbefalingen.
3. Brukeren gjør en faktisk spillhandling: PlaceCard, quiz, observasjon, innsjekk eller rute-stopp.
4. Nearby oppdaterer anbefalingsgrunnlaget.

Nearby skal ikke bare vise avstand. Det skal skape neste handling.

---

## 14. Fullført favoritt

Favoritt er fullført når:

1. Sted, person eller rute markeres som favoritt.
2. Favoritten lagres.
3. Favoritten vises i profil/Nearby/samling der relevant.
4. Favoritten kan fjernes igjen.

---

## 15. Fullført Social Meet-handling

En Social Meet-handling er fullført når:

1. Den er manuelt initiert.
2. Den er knyttet til et History GO-objekt eller læringskontekst: sted, quiz, rute, observation, topic eller circle.
3. Privacy-regler og forbidden-field-regler er sjekket.
4. Handlingen bruker ikke live-posisjon, nearby people, feed, fri chat eller follower-logikk.
5. Handlingen lagres lokalt/demo eller sendes til backend når backend finnes.
6. Brukeren får tydelig resultat.

Social Meet er kunnskapsbasert sosialitet, ikke sosialt medium.

---

## 16. Fullført Spotmeeting

Spotmeeting er en konkret møteforespørsel inne i Social Meet.

Et Spotmeeting er fullført når:

1. Brukeren starter flowen manuelt.
2. `contextType` er tillatt: `place`, `quiz`, `route`, `observation`, `topic` eller `circle`.
3. Context har `contextType`, `contextId`, `title`, `reason` og `sourceSurface`.
4. Meldingen er preset-only.
5. Invitasjon er privat som standard.
6. Mottaker kan godta eller avslå.
7. Avsender kan avbryte.
8. Akseptert møte kan markeres gjennomført.
9. Blokkering/rapportering stopper videre synlighet.

Gyldige lifecycle-statuser:

- `pending`
- `accepted`
- `completed`
- `declined`
- `cancelled`

Spotmeeting skal ikke bruke GPS/live/nearby-signaler.

---

## 17. Fullført offentlig hjemsted

Offentlig hjemsted er fullført når:

1. Brukeren velger et eksisterende History GO-sted.
2. Appen lagrer `placeId`, navn, kategori, lat/lon og radius.
3. Det lagres ikke privat adresse.
4. Brukeren kan se og endre hjemstedet.
5. Nearby/ruter/anbefalinger kan bruke hjemstedet.
6. Synlighet/privacy er tydelig.

---

## 18. Definisjon av spillbar modul

En modul er spillbar når den har:

1. tydelig inngang
2. tydelig handling
3. tydelig lagring eller beregning
4. tydelig belønning/status
5. tydelig visning i profil/Wonderkammer/PlaceCard/Nearby/ruter der relevant
6. tydelig neste steg
7. tydelige grenser mot debug/demo/testmodus

Hvis en modul mangler flere av disse, er den bygget, men ikke ferdig spillbar.

---

## 19. Arbeidsregel

Alle nye eller videreførte systemer bør svare på:

- Hva gjør spilleren?
- Hvilken eksisterende kontrakt gjelder?
- Hva lagres, og hvor?
- Hva er beregnet, ikke lagret?
- Hva låses opp?
- Hvor vises resultatet?
- Hva er neste steg?

Hvis svaret ikke finnes, er systemet ikke ferdig definert.
