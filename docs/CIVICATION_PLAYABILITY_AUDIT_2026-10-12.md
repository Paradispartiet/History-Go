# Civication – spillbarhetsrevisjon, 12. oktober 2026

**Status:** Kode- og testrevisjon gjennomført. Ikke erklært produksjonsakseptert. Ingen nye fortellingskapitler er en del av dette arbeidet.

**Omfang:** `Civication.html`, Civication-skallet, Min dag / Life Story, jobb/arbeidsdag, innboks, livsposisjoner, økonomi, relasjoner, spillerprogresjon og de eksisterende testene. Det er **ikke** utført en full, manuell gjennomspilling med en ekte spillerprofil i nettleser i denne revisjonen. Dette skillet er avgjørende.

## Samlet dom

**Civication har flere reelle spillmotorer, men de 34 dagene med nye Life Story-fortellinger dokumenterer ikke en sammenhengende livssimulator.** Vi må slutte å måle fremdrift i antall scener, valg og grønne tester alene. Før neste fortellingsproduksjon må vi bevise én integrert spillerreise uten utviklerflagg, kunstige merkepoeng og programmerte rollebytter.

### Det som faktisk fungerer i kode og eksisterende tester

| Spilldel | Bekreftet grunnlag | Avgrensning |
| --- | --- | --- |
| Oppstart og Min dag | `Civication.html` laster egen Life Story UI; `tests/civication-v2-min-dag-ui.test.js` spiller en hel dag med knapper og lagring | Isolert test bruker eksplisitt pilotrolle via URL, ikke et helt liv |
| Dag 1–7 i nettleser | `scripts/verify-civication-arbeidsledig-browser.ts` har 20 UI-scenarier med reelle valg, omstart og utvalgte kapitteloverganger | For videreføringsscenarier seedes `merits_by_category` med høye poengverdier; dette er ikke organisk badge-progresjon |
| Fortellingsprogresjon dag 8–34 | Life Story-runner har deterministiske valg, journal, flagg, relasjoner, rolleporter og kapittelarkiv. PR #6275 hadde 706 grønne Civication-testfiler | De nye testene setter `CivicationLifePositions.getLifeContext().primary_life_position` fra testkode før hvert kapittel |
| Formelt arbeid og hverdagsrytme | `civicationDayFlow.js`, `civicationWorkdayRuntime.js`, `CivicationJobs`, NextAction og ChoiceDirector har egne motorer og tester | Ikke testet her som ett kombinert løp med Life Story dag 1–34 |
| Meldinger | `civicationIncomingFlow.js` og `CivicationInboxTopActionUI.js` skiller jobb, privat og system i innboks | Ingen dokumentert samlet 34-dagers akseptanse for overgangene mellom kanalene |
| Økonomi | Eget ParadiseCoin-wallet brukes i produktdashboardet; Livelihoods har en separat mulighets-/akseptflyt | Life Story `meters.penger` er **ikke** wallet |
| Life Story → Civication | `lifestoryShellBridge.js` kobler utvalgte psykemålere, livsstilstags og eksplisitte livelihood-muligheter via enveisbro | De fleste nye kapitlene bruker ikke disse virkningstypene |

## Bekreftede avvik

### A1 – Høy alvorlighet: jobbrollebytte kan erstatte fortellingsprogresjonen

**Observasjon:** `js/Civication/ui/CivicationLifestoryUI.js` bruker `loadRole(roleId)`. Den leser bare én nøkkel fra `CivicationLifestoryState.load()` og oppretter `State.createInitialState(base)` dersom `saved.rolle !== roleId`. Samtidig kan `maybeAdoptShellRole()` automatisk kalle `loadRole(mapped)` når spilleren får en jobbrolle i skallet. `lifestoryState.js` lagrer under én nøkkel: `civication_lifestory_v1`.

**Konsekvens:** Et ordinært jobbrollebytte kan overskrive den aktive Life Story-historien med en ny rolles dag 1. Dette er ikke bare et teoretisk kontinuitetsspørsmål for en livssimulator; det følger av lagrings- og byttelogikken. Ingen gjenoppretting av tidligere rolleprogresjon er påvist her.

**Neste kodeoppgave:** Definer før endring en eksplisitt bevaringsmodell for historie, aktiv rolle, per-rolle-kapitler og global livstid. Lag en reproducerbar jobbaksept→rollebytte→reload-test før migrering. Ikke løs dette ved å skru av den eksisterende jobb-resolveren.

### A2 – Høy alvorlighet: to atskilte dagrytmer er ikke samstemt

**Observasjon:** `onNextDay()` i Life Story UI kaller `CivicationLifestoryRunner.startNextDay` og lagrer Life Story-state. `CivicationDayFlow` bruker derimot `CivicationCalendar`, aktiv jobb og fullført arbeidsdag. De er uavhengige dagprogresjoner. `CivicationDayPhaseUI` deaktiverer egen eldre faseflate når Life Story-panelet finnes.

**Risiko:** Spilleren kan oppleve dagprogresjon i en fortelling uten at arbeidsdag, innboks, kalender og økonomisk ukesyklus nødvendigvis følger samme tid. Konkret drift med ulike tidsverdier må testes ende til ende, ikke bare utledes fra isolerte enhetstester.

**Akseptansekriterium:** Én observerbar dagsovergang med dokumentert eierskap; arbeidskrav, kveld, post og uketick registreres én gang. Bevis dette med et virkelig nettleserløp både uten og med jobb.

### A3 – Høy produktprioritet: de nye fortellingene produserer nesten bare narrativ tilstand

Måling av **de fem dag-32–34-kapitlene på `main`**:

| Målepunkt | Verdi |
| --- | ---: |
| Scener | 75 |
| Valg | 145 |
| Scener med `stedId: "hjem"` | 75 |
| Valg med konkret `handling` | 0 |
| Valg med `livsstil`-tag | 0 |
| Valg med inline livelihood-mulighet | 0 |
| Valg med målereffekt | 145 |
| Valg med intern relasjonseffekt | 140 |

Målingen gjelder disse fem kapitlene, ikke alle Civication-roller. Innholdet er spillbart som interaktiv fortelling, men tilfører ingen nye konkrete handlinger i jobb-, sted-, sosial- eller økonomiflytene i disse 145 valgene. Ingen `moter` er produsert i disse fem fortsettelsene.

**Neste redaksjonelle krav:** Et nytt kapittel må demonstrere en identifiserbar spillhandling, en kontrollerbar endring i relevant kanonisk spillsystem og en konsekvens spilleren møter senere. Flere interne relasjonspoeng alene kvalifiserer ikke.

### A4 – Høy produktprioritet: fortellingsrelasjoner er ikke nødvendigvis spillets relasjoner

`lifestoryState.js` eier `relasjoner` som et eget tallsett. `lifestoryShellBridge.js` har eksplisitte overføringer av noen **metermål** til CivicationPsyche, livsstilstags til HG_Lifestyle og livelihood-tilbud til CivicationLivelihoods. Ingen generell kobling fra Life Story-relasjonsendringer til spillets øvrige sosiale relasjonsmotor er dokumentert her. En score som øker inne i Life Story er derfor ikke bevis på at NPC-er, meldinger eller andre scener faktisk reagerer.

**Akseptansekriterium:** Ett spillervalg påvirker en faktisk person-/relasjonstilstand som en senere, separat spillsituasjon leser og viser, uten dobbel belønning.

### A5 – Konkret visningsfeil: narrativ økonomi ble presentert som ekte PC

`CivicationDashboardUI.getHeaderStatusChips` prioriterte `lifeState.meters.penger` og satte på `PC`. Life Story-panelet gjorde det samme. Men shell-broen sier uttrykkelig at dette er en separat narrativ skala, mens dashboardets lommebok bruker `getPCWallet()` / `hg_pc_wallet_v1`.

**Rettet i denne PR-en:** Hovedheaderens PC-verdi hentes nå fra den kanoniske wallet-kilden. Life Story-merket heter **Fortellingsøkonomi** og viser ingen PC-enhet. Ingen wallet-, lønns- eller valutalogikk er endret. Regresjonstester kontrollerer at narrativ verdi og ekte PC kan være forskjellige uten å vises som samme valuta.

### A6 – Testdekningen må gjelde en organisk spiller, ikke bare en oppsatt historie

Nettleserskriptet `verify-civication-arbeidsledig-browser.ts` bruker faktiske UI-knapper, men setter eksempelvis `naeringsliv: 85`, `musikk: 85` og `subkultur: 60` i `merits_by_category` når en rolle skal aktiveres. Kapitteltestene for dag 17–34 bytter tilsvarende aktiv hovedlivsposisjon ved å sette testverdier. Dette er fornuftig for **innholdsregresjon**, men er ikke en akseptansetest av hvordan en spiller fortjener posisjonen fra faktisk History Go-progresjon.

Life Story-kapittelporten krever eksakt `badge_id` **og** `label` fra `CivicationLifePositions.getLifeContext().primary_life_position`. Denne bindingen er reell. Den må testes gjennom ekte opplåsing, spillerens valg i livsprofilen, kapittelstart, jobbrollebytte og reload.

## Prioritert verifisering på en frisk profil

| Trinn | Spillerhandling | Hva må bevises | Dagens dokumentasjon |
| --- | --- | --- | --- |
| 1 | Åpne Civication uten data, fullfør onboarding og spill første dag | Korrekt rolle, startøkonomi og spillbar neste handling | Delvis testet |
| 2 | Les jobbmail og personlig melding, gjennomfør jobb-/fritidsfaser | Én eier av valg og dagsovergang, korrekt innbokskanal | Separate tester; ikke full helhet |
| 3 | Spill til dag 7 uten preseedede poeng | Riktig avslutning og troverdig sperre ved låst livsposisjon | UI-testet i grunnløp |
| 4 | Tjen et faktisk merke i History Go, aktiver oppnådd livsposisjon | Samme oppnåelse låser opp rett rolle og dag 8 i Civication | **Ikke bevist i denne revisjonen** |
| 5 | Fortsett 8–14, behold arkiv, ta deretter en ekte jobb | Life Story-historikk og relasjoner forsvinner ikke ved jobbaksept | **Risiko funnet i A1** |
| 6 | Fullfør arbeidsdag, kveld, neste dag og uketick | Én faktisk kalender-/økonomiutvikling; ingen dobbeltskriving | **Ikke bevist i denne revisjonen** |
| 7 | Velg en sosial konsekvens, møt personen senere i en annen kanal | Senere melding/scener leser samme sosialtilstand | **Ikke bevist i denne revisjonen** |
| 8 | Reload og fortsett etter mange valg, også mobil | Ingen tap, feil rolle eller dobbelt svar | Kapittelreloader er testet; ikke full produktaksept |
| 9 | Fullfør et sammensatt livsløp med jobb, fritid og Life Story til dag 34 | Spilleren kan nå innholdet uten manuell rolleinjeksjon | **Ikke bevist i denne revisjonen** |

## Beslutning

**Stans produksjonen av dag 35 og senere inntil A1 og A2 er løst og testet som én naturlig spillerreise.** Begynn med A1 fordi et jobbvalg ellers kan kollidere med hele historikkmodellen. Deretter samordnes dag/tid og konsekvensbroer. Først når disse akseptansekravene er grønne, gir det mening å produsere mer fortellingsinnhold.

## Begrensning i revisjonen

Dette dokumentet er en kildekode- og testrevisjon, støttet av eksisterende CI- og nettlesertester, pluss konkret inspeksjon av fem kapittelpakker. Det er **ikke** et bevis for at en ekte bruker har fullført hele samspillet mellom History Go, jobb, privatliv, økonomi og Life Story. Der bevis mangler, er det uttrykkelig oppgitt.
