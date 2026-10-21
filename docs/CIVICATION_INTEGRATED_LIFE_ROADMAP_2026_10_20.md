# Civication – integrert livsreise: gjennomføringsplan og kontrollregister

Opprettet: 2026-10-20. Eier: Civication. Status: **aktiv plan; ikke godkjent som ferdig spillerreise**.

## Formål og fasit
Spilleren skal kunne leve 14 ekte spilldager der arbeid, privatliv, relasjoner, økonomi, psyke, energi og integritet henger sammen. Et valg fra dag 2 må kunne få observerbare, kausalt begrunnede følger på dag 14. En grønn unit-test alene beviser ikke at dette skjer i nettleseren.

Dette er **arbeidsplan og akseptansekriterier**, ikke en ny runtime-kontrakt. Følg `CIVICATION_README.md`, `CIVICATION_PATCH_ORDER.md`, Scene Pipeline, Life Story og eksisterende økonomi-/relasjonskontrakter. Opprett ingen parallelle motorer.

## Faktisk publiseringsstatus – 21. oktober 2026

- [#6400](https://github.com/Paradispartiet/History-Go/pull/6400) er merget: idempotent dagsplan og aktiviteter knyttet til riktig spilldag.
- [#6408](https://github.com/Paradispartiet/History-Go/pull/6408) er merget: én eier av toppkort, tydelige innboksstatuser og sikker dagslutt.
- [#6481](https://github.com/Paradispartiet/History-Go/pull/6481) og [#6490](https://github.com/Paradispartiet/History-Go/pull/6490) er merget: syv spilldager per uke og lønn etter faktisk jobb hver spilldag.
- [#6496](https://github.com/Paradispartiet/History-Go/pull/6496) er merget: jobbhistorikk følger kontosikkerhetskopi.
- [#6500](https://github.com/Paradispartiet/History-Go/pull/6500) korrigerer at NPC-relasjonene `civi.socialRelationships.v1`, tidligere svar `civi.socialResponses.v1` og samtaletråder `civi.socialConversations.v1` falt utenfor kontoens nøkkelutvalg. Fire mock-baserte regresjoner følger PR-en; merge krever grønn CI.
- [#6382](https://github.com/Paradispartiet/History-Go/pull/6382) er fremdeles et **utkast**: røde tester og gjeninnføring av faste Mira/Lea/Arvid-navn i brukerrettet tekst er ikke godkjent. De skal være fiktive typer med kanonisk intern-ID, ikke faste personer eller virkelige History Go-personer.
- Dette er **ikke** en gjennomført 14-dagers nettlesertest; fysisk kontogjenoppretting, NPC-etterspill og reelle History Go-opplåsinger er fortsatt åpne porter.

## Én prioritert leveranse
**PR #6437** (`fa223ed75547212edbc33792d705e79287527d2c`) er merget til `main` med seks beståtte CI-arbeidsflyter. Vitalitets-/Life Story-koden og regressjonene er publisert; dette er **ikke** full 14-dagers browser-/kontoakseptanse. PR #6415 og #6427 er også merget. Ukeavregningen etter **syv faktiske spilldager** er merget i PR #6481 (`dacbd7270bbf41f7bfb90ac1996f1d92a95d7ed8`). Denne feilen ved jobbbytte er lukket i #6490. Leveveiavregning og nye nettverkstilbud følger spilluker gjennom #6498 og #6504 (begge merget). NPC-relasjoner, svar og samtaler sikkerhetskopieres gjennom #6500 (merget). Full 14-dagers gjennomspilling gjenstår.

### Fase 1: verifiser publisert PR #6437
- [ ] Les fersk CI for nøyaktig siste head-commit; rett feil i samme PR, ikke ved å ignorere tester.
- [ ] Kontroller at restitusjon skjer nøyaktig én gang ved gyldig dagbytte, og at lav psyke/energi ikke fører til utilsiktede eller dobbelte effekter.
- [ ] Kontroller at psyke, energi, integritet, relasjoner, private valg og tidsankre følger spilleren gjennom jobbbytte; rollespesifikke verdier beholdes separat.
- [ ] Test at dag 2-hendelsen og alle tre dag 3-oppfølgingene faktisk kan nås i montert UI med riktige vilkår, uten duplisering.
- [ ] Sjekk norsk språk, brukerforklaring, skjermleservarsel og konsekvenstekst; ingen diagnoseaktige påstander eller urimelige straffer.
- [ ] Kontroller økonomi, History Go og cloud-save regresjoner. Merge først ved grønne relevante kontroller og bekreftet fungerende spillflyt.

### Fase 2: balanse og konsekvensmatrise
- [ ] Lag målbar oversikt over alle psyke-/energi-/integritets-/handlingsrom-deltaer fra faktiske scener (fordeling, daglig netto, ytterpunkter, frekvens, null/100-metning).
- [ ] Kalibrer med dokumenterte scenarier: rolig dag, tung vakt, flere tunge dager, restitusjon, støtte fra andre, arbeidsledighet, jobbbytte. Vurder 0–100-skala og terskler som hypoteser; ingen påstått medisinsk presisjon.
- [ ] Konsekvenser må være synlige og begrunnede: valg → lagret state → respons → senere scene. Gi rom for bedring og alternativer; unngå deterministiske straffespiraler.
- [ ] Test at effekter verken trigges dobbelt i Life Story og psyke/livsstil-broen eller forsvinner ved reload.

### Fase 3: samordne eksisterende spillmotorer
- [ ] Kartlegg hvem som eier lommebok/transaksjoner, fortellingsøkonomi, kalenderuke, livsdag, sosial relasjon og Life Story-relasjon. Lag konkret mapping før endringer.
- [ ] Bekreft om fiktive utgifter i historiene faktisk belastes kanonisk lommebok. Ingen dobbeltbelastning eller falsk transaksjon.
- [ ] Kontroller at ukentlig økonomi utløses av korrekt spilltid, ikke uventet av veggklokke alene.
- [ ] Synkroniser relasjonelle hendelser til relevante sosiale reaksjoner uten å blande fiktive NPC-er med virkelige History Go-personer.
- [ ] Gjenbruk eksisterende Scene Pipeline, ChoiceDirector, livelihood, History Go completion bridge og cloud save.

### Fase 4: organisk 14-dagers akseptanse
- [ ] Start med fersk, ordinær bruker uten kunstig badge, jobb, lønn, flagg eller testopplåsinger.
- [ ] Dag 1–3: arbeidssituasjon, bolig, penger, første relasjoner og konsekvenser.
- [ ] Dag 4–7: autentiske oppgaver, søknader, vennskap, konflikter og restitusjon.
- [ ] Dag 8–10: senere hendelser ut fra faktiske tidligere valg og ekte progresjon.
- [ ] Dag 11–14: arbeid/levevei, økonomi, fritid, sosialt etterspill, psyke og energi.
- [ ] Test utlogging, ny innlogging, nettleserbytte og cloud save. Spillhistorikk og private valg må bevares.
- [ ] Hvis ekte History Go-opplåsing eller progresjon blokkerer løpet: dokumenter nøyaktig blokkering og rett årsaken. Ikke omgå med testdata.
- [ ] Gjennomfør minst to ulike valgruter, inkludert krevende valg og rehabilitering. Observer faktisk UI, ikke bare unit-tests.

### Fase 5: produktkontroll
- [ ] Samle «Min dag», én innboks, tydelig navigasjon, NPC-reaksjoner, kart og oppgaver uten dupliserte handlinger.
- [ ] Gjennomgå tekster redaksjonelt: naturlig motivasjon, rolletroverdighet, valgfrihet og ingen karikatur.
- [ ] Dokumenter akseptansestatus med bevis: testnavn, commit, scenario, forventet/faktisk, avvik, PR og beslutning.

## Kontrollregister – oppdater etter hvert arbeid
| ID | Område | Akseptansekriterium | Status per 2026-10-21 |
| --- | --- | --- | --- |
| C1 | PR #6437 | Grønn CI og reell spillflyt før merge | Merget, 6/6 CI; full E2E-spillflyt ikke godkjent |
| C2 | Energi | Gradvis restitusjon uten dobbeltelling | Implementert i #6437 (main); full spillerreise ikke godkjent |
| C3 | Psyke | Små, forutsigbare utslag med synlige følger | Implementert i #6437 (main); bred balansekalibrering mangler |
| C4 | Jobbbytte | Personlige målere bevares; rollespesifikke verdier isoleres | Merget i #6437; komplett spillreise må regresjonstestes |
| C5 | Etterspill | Dag 2-valg endrer dag 3-hendelse | Oppfølgingsscene merget; full nettlesergjennomspilling mangler |
| C6 | Økonomi | Fortellingstransaksjoner og faktisk lommebok samstemmer | Åpent |
| C7 | Kalender | Livsdager og økonomiuker gir forventet progresjon | #6481, #6490, #6498 og #6504 merget; lønn og tilbud følger spilluker, full E2E ikke godkjent |
| C8 | Relasjoner | Personer reagerer senere på tidligere valg | NPC-relasjoner, sosiale svar og samtaler sikkerhetskopieres gjennom #6500 (merget); faktisk senere sosialt etterspill ikke bevist |
| C9 | Skylagring | Samme progresjon etter reload/ny enhet | #6395/#6496/#6500 merget; mock restore av Life Story, jobb og NPC-minne testet. Spillerens egne fasesnapshots undersøkes separat; fysisk konto-/enhetsbytte ikke godkjent |
| C10 | 14 dager | Autentisk brukerreise med kausale konsekvenser | Ikke godkjent |
| C11 | UI | Én tydelig innboks, naturlig dagflyt og tilbakemelding | Dagsplan #6400 og toppkort/innboks #6408 merget; integrert nettleserkontroll gjenstår |

## Helhetlig progresjon: Life Stories × History Go × skills (beslutning 21.10.2026)

Dette er det operative implementeringssporet for den besluttede [Civication-spillerutviklingskontrakten](CIVICATION_PLAYER_GROWTH_AND_HISTORY_GO_CONTRACT.md). Ved tvil om skillet mellom eksisterende state, nye ferdigheter og samlingens evidens: følg kontrakten og dagens faktiske runtime, ikke anta at roadmap-punkter er levert.

Dette er **produktkrav og prioritert implementeringsplan**, ikke bevis på at systemene allerede fungerer fra ende til ende. Arbeidsledig skal være en faktisk arbeids- og inntektssituasjon som kan vare utover både dag 7, dag 14 og dag 30. Den skal korrespondere med **rolleuavhengige Life Stories**, ikke først og fremst med jobbrettede rollehistorier. Nye jobber er muligheter, ikke obligatorisk progresjon. Eksisterende `Runner.canStartContinuation` kan bevare gater for *spesialkapitler*, men må ikke brukes som global dag-8-/livsport.

### Hvilke skalaer har vi, og hva mangler?

| Lag | Gjeldende status | Produktregel |
| --- | --- | --- |
| Psyke/energi/integritet/synlighet/handlingsrom og fortellingspenger | Eksisterende `lifestoryState.js`, med psyke/energi også i øvrige systemer | Midlertidig tilstand; behold riktig eier og overføring, unngå dobbeltelling/forveksling med wallet |
| Psykologi og autonomi/tillit | Eksisterende `CivicationPsyche`, inkludert egen psykologikompetanse | Bevar; ikke opprett kopi av eksisterende psykeskår |
| Syv kapitalakser | `economic`, `cultural`, `social`, `symbolic`, `political`, `institutional`, `subculture` i `capitalEngine.js` | Ressurser/posisjon, ikke direkte ferdighet eller XP |
| Identitet og livsstil | Eksisterende `identityCore`, `civiLifestyle` | Preferanser og observerte vaner, ikke tvungne identiteter |
| Sosial status/anseelse | Karriereomdømme, relasjoner og `civicationSocialStanding` | Situert vurdering, ikke universell streetkred |
| Fagmeritter, besøk, kunnskap og samling | Eksisterende History Go-stores og `civicationProfileSignalBridge` | Bevis for forskjellige typer fremdrift; ingen automatisk jobb/skill |
| Seks varige skillscores | **Planlagt; ikke implementert felles ferdighetsmodell** | 0–100, dokumenterte, idempotente aktiviteter og konsekvenser |

### Seks skillscores (langsiktig kompetanse, ikke dagsform)

| Skår (visning 0–100) | Kvalifiserende erfaring – krever faktisk handling/konsekvens | Eksempel på Life Story-virkning |
| --- | --- | --- |
| **Visdom / dømmekraft** | Bruke reell kunnskap/kildekritikk i et valg der mulige følger vurderes | Oppdage hull i en påstand, unngå forhastet konklusjon |
| **Sosial teft** | Håndtere en faktisk misforståelse, lytte, kommunisere og avklare grenser | Få en ny dialoggren eller reparere en relasjon |
| **Kreativitet** | Utvikle en idé eller prøvbar løsning, lage kunst/prototype | Åpne en alternativ idé i et prosjekt eller møte |
| **Praktisk mestring** | Utføre, øve og fullføre konkret praktisk arbeid | Løse et avgrenset hverdagsproblem |
| **Formidling** | Lage en etterprøvbar forklaring, debattbidrag eller presentasjon | Forklare fagstoff, bedre forståelsen i en samtale |
| **Handlekraft** | Følge et tatt initiativ opp med en handling og bære konsekvensen | Gjennomføre avtaler/prosjekt uten gratis suksess |

Foreslått intervall 0–100 er en **spillbalansebeslutning**, ikke en medisinsk eller psykologisk måling. Ulike ferdigheter har egne hendelseskilder. Ikke skriv XP for bare å laste siden, besøke et sted, motta en People-oppføring eller gjenta samme quiz. Først ved implementasjon vedtas kanonisk stateeier, initialverdier, opptjeningstakt, event-ID/proveniens, migrasjon og gjenopprettingskontrakt. Eksisterende `CivicationState.player.competence.psychology` og `job_learning_progress` skal ikke nullstilles eller dupliseres.

### History Go-samlingen skal få konkrete konsekvenser

1. **Besøk/sted:** `visited_places` skal gi faktisk besøkshistorikk, lokal interesse, nye samtale- og sceneinnganger. Ikke likestill med `places_collected` eller fasit på en quiz.
2. **Kunnskap og visdom:** Knowledge V2, loggede læringsaktiviteter og quizmeritter kan gi dokumentert faginnsikt. Når spilleren *bruker* innsikten i en relevant Civication-beslutning, kan dette kvalifisere for dømmekraft; kunnskapspoeng og ferdighetsskår er ulike størrelser.
3. **People og samling:** `people_collected`, merker, notater og bidrag kan åpne emner, interesser og invitasjoner, men aldri automatisk gjøre en historisk person til fiktiv NPC, eller skape vennskap uten et faktisk møte og valg.
4. **Frivillige livsposisjoner:** `merits_by_category` og katalogens dokumenterte krav kan låse opp **muligheten til å velge** nye hobby-/sosial-/kunnskapsroller. Livsposisjon, jobb, inntekt, autorisasjon og mandat er adskilte tilstander.
5. **Streetkred:** ikke en generisk score. Tilstedeværelse kan gjøre spilleren synlig for et bestemt miljø, men respekt, innpass og rykteskifte må følge konkrete sosiale handlinger og dokumenteres per miljø/aktør. Undersøk bevisst utvidelse av `civicationSocialStanding` og bruk eksisterende `subculture`-kapital som separat ressurs.
6. **Livsverdensreaksjoner:** de samme kanoniske History Go-bevisene skal kunne vekte nye private historier, samtaler, miljøkontakt og valg gjennom `civicationProfileSignalBridge` og eksisterende Scene/Knowledge/Relationship-motorer. Fagdomene, tidligere personlige valg, handling og relasjon må samsvare; ingen oppdiktet tidligere opplevelse.

### Prioritert gjennomføring uten parallelle motorer

1. **Dag 7:** Gjør History Go-veiledningen frivillig ved siden av «Fortsett privatlivet». Gjennomfør ekte 7-dagers test uten fiktiv opptjening. PR #6516 er *ikke merget* per denne dokumentrevisjonen; bare grønn CI + faktisk appkontroll kan godkjenne.
2. **Dag 8–14:** Bevis nye ordinære private dager for fortsatt arbeidsledig *uten* et krav om badge, jobbtilbud eller livsposisjon. Test også lønn/ytelser, økonomi, energi, NPC-etterspill og vedvarende valg.
3. **Samling → liv:** Bruk eksisterende History Go-signaler; innfør minst én kildebelagt, domain-spesifikk scene med forskjellig utfall for besøkt/ikke besøkt, lært/ikke lært og korrekt tidligere valg.
4. **Skillscores:** Definer én autoritativ ferdighetsstate/adapter i Civications eksisterende arkitektur; lag kildehendelser, minne, idempotens, skårbalanse, profilsynlighet og test for alle seks ferdigheter. Skill fremdrift fra kompetansekrav i jobbkontrakter.
5. **Streetkred:** kvalifiserte miljøhendelser, positivt/negativt situert rykte, ulike reaksjoner fra ulike aktører, men ingen automatisk globale kapital-/ansettelsesendringer.
6. **Langtidsprøve:** Prøv en organisk 30-dagers arbeidsledig spillerreise med flere private historier, interesser, nye valg og bevarte relasjoner/økonomiske realiteter. Test reload, to entry-points, skykopiering, konto-/enhetsbytte og ingen dupliserte belønninger.

### Akseptanseregel

Ikke rapporter en ferdighet, miljøscore, dag-14-/dag-30-reise eller samlingskonsekvens som ferdig før både eier, dataflyt, faktisk UI-hendelse, kanonisk persistert bevis og relevant regresjon er kontrollert. All dokumentasjon må skille **implementert**, **på gren**, **testet**, **merget** og **planlagt**. Kilder: `CIVICATION_DATA_LAYERS.md`, `civication-life-story-system.md`, `CIVICATION_PERSON_MODEL_V1.md`, `CIVICATION_NONCAREER_ROLE_TAXONOMY.md`, `PERSONAL_COLLECTION_V1.md`, `PROGRESSION_MODEL.md` og akseptansedokumentet `CIVICATION_ORGANIC_14_DAY_AND_VITALITY_ACCEPTANCE_2026_10_20.md`.

## Arbeidsregler
1. Oppdater dette registeret ved hver vesentlige leveranse; skill mellom «kode på gren», «CI bestått», «merget» og «spilltest godkjent».
2. Én arbeidsbolk om gangen. Prioriter feil som bryter spillerreisen før nye historier eller bred innholdsproduksjon.
3. Hold `docs/CIVICATION_README.md` som kanonisk inngang; denne planen er operativt sporingsdokument, ikke alternativ fasit.
4. Bruk eksakte GitHub-lenker: [aktiv PR #6437](https://github.com/Paradispartiet/History-Go/pull/6437), [PR #6415](https://github.com/Paradispartiet/History-Go/pull/6415), [PR #6427](https://github.com/Paradispartiet/History-Go/pull/6427).

## Neste spesifikke 14-dagers lagringskontroll (2026-10-21)

`civi.playerPhaseSnapshots.v1` er spillerens sist lagrede aktivitet og tilgjengelighet i hver sosial fase. Den bruker en egen prikk-notasjon og falt utenfor skybackup selv etter at NPC-samtaler ble rettet i #6500. En avgrenset oppfølging inkluderer nøyaktig denne kanoniske nøkkelen, uten å åpne for vilkårlige `civi.*`-nøkler. Ny regresjon kontrollerer samtidig `hg_civi_calendar_v1`, `hg_civi_livelihood_v1`, Life Story og wallet ved simulert kontogjenoppretting etter spilldag 14. Dette er **ikke** en ekte fjorten dagers nettleserreise og godkjenner ikke C8–C10 alene.


## Dag 7 → History Go → kapittel 2: veiledning (2026-10-21)

Problem: Etter dag 7 kan private Life Stories fortsatt følges gjennom «Fortsett privatlivet» selv om ingen livsposisjon er aktivert. Den valgfrie History Go-veiledningen må derfor aldri skjules eller feilaktig framstilles som en nødvendighet for å leve videre. Ingen meritter, jobb, penger eller kapittel tildeles automatisk.

Løsning i eksisterende systemer:
- «Min dag» viser **Veien videre** når siste dag er avsluttet og intet ekstra kapittel er tilgjengelig, også når private scener venter. «Fortsett privatlivet» beholdes samtidig. Arbeidsledighet er en jobbstatus, ikke et krav om en ny livsidentitet etter syv dager. Valgt *valgfri* retning og dokumenterte poengkrav vises fra eksisterende `rollebroer` og `merits_by_category`.
- Knappen **Utforsk History Go** bruker eksisterende `CivicationLifestoryActions` til kartet og gjenbruker `CivicationHistoryGoDeepLink.startLifePositionGuidance` for en eksplisitt læringssesjon.
- History Go sitt eksisterende permanente **Civication-modus-kort** i `js/ui/toast.js` viser mål og relevante steder, følger faktisk poengprogresjon til livsposisjonens fullstendige terskel og har **Tilbake til Civication**.
- Ved retur velger spilleren selv om vedkommende vil aktivere en opptjent livsposisjon for et ekstra kapittel; ordinære private Life Stories fortsetter uavhengig. Først ordinær `Runner.canStartContinuation` kan åpne det betingede kapitlet. Quiz eller velkomsttoast er ikke et automatisk jobbtilbud. Ubesvart inbox og dagsporter beholdes.
- Uten valgt/gyldig poengkrav vises bare utforskingsveien og livsprofilen, uten en falsk «oppdrag fullført»-indikator.
- Testdekning: `civication-lifestory-week7-guidance.test.js` (syv forfattede dager; både privatlivet og valgfri oppdragsveiledning synlig), `civication-history-go-deeplink-session.test.js` (sesjonsdata) og `civication-history-go-mission-badge-points.test.js` (opptjente meritter). Alle skal kjøres i eksisterende Civication-regresjon.
- **Avgrensning:** Dette er gjenfunnet veiledning og reelle gating-regler, ikke dokumentasjon på at en fersk spiller faktisk har opptjent poengene eller gjennomført 14 dager og kontogjenoppretting i en nettleser.

## Ny kontrollport: dag 1–21 og valgfri jobb (21.10.2026)

Oppdatert produktmål: **21 sammenhengende spilldager** som første hovedkapittel. Dag 14 er en milepæl, ikke slutten. Et valg om jobb skal kunne tas når spilleren har et faktisk tilbud, enten før eller etter dag 21. Spillerens interesser, private historikk og frivillige livsposisjon skal ikke slettes eller erstattes av jobb.

| Kontroll | Implementasjon på 21-dagersgren | Gjenstående akseptanse |
| --- | --- | --- |
| Tre uker privatliv | Forfattede scener dag 8–21, fem spor og dag-21-profil | Reell skjerm- og dagsynk, arbeids-/privatinnboks |
| Frivillig arbeid | Karriere-handling i konkrete scener; eksisterende tilbudssystem eier jobben | Ekte tilbud, aksept, lønn og videre jobbspill |
| Livsposisjon etter handling | Dag-21-arkiv gir én mulig egenvalgt retning i eksisterende livsprofil | Kontogjenoppretting, endring og reell bruk av retningen |
| Jobbbytte | Personlige \`life21_\`-flagger og \`wave_e_life21_\`-valg følger spilleren i \`privatHistorie\` | 21-dagers nettleserløp med overgang og retur |
| Idempotens | Eksisterende Life Story-scene-ID og kanonisk lagring, ingen ny valuta | Full belastnings-/konto-/NPC-test |

Ikke erklær dette som godkjent 21-dagers ende-til-ende-test før alle åpne porter består. Den gamle 14-dagers akseptansetabellen er nå et delkrav under 21-dagersløpet, ikke produktets endelige mål.
