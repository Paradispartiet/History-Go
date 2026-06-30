# Civication Role Pack Standard v1

Oppdatert: 2026-06-29

> Inngangsdokument: [`CIVICATION_ROLE_PACK.md`](CIVICATION_ROLE_PACK.md) rammer de
> fem lagene inn som **én** rollepakke og eier dedup-kontrakten (hvem eier hvilken
> sannhet). Les den først; dette dokumentet er den detaljerte innholdsstandarden.

Denne standarden beskriver hva en komplett Civication-rollepakke skal inneholde når en jobb bygges som en liten historie. Standarden bruker Arealplanlegger-pakken som første ferdige referansemodell, men den kopierer ikke datapakken.

> Referanserolle: **Arealplanlegger** / runtime-scope `by_radgiver_plan`.
> Referansefortelling: **«Linjen på kartet»** — et komplett rolleplot der én kartlinje flytter verdi, ansvar, risiko, nabolagsliv og politisk lesbarhet.

## Avgrensning

Denne standarden er for innhold, dokumentasjon, maler og QA. Den skal ikke kreve ny motor, UI-endringer eller runtime-endringer.

En rollepakke skal passe inn i kjeden der FWG ligger som stillingens arbeidslogikk mellom badge/faggrunnlag og presentasjon/dramaturgi:

```text
badge tier / fagfiler
  -> workGrammar / FWG
  -> roleModel
  -> mailPlan
  -> mailFamilies
  -> DailyMailBuilder / MailRuntime
  -> Day 1-test og QA
```

## Komplett rollepakke

En komplett rollepakke består av følgende deler.

### 1. workGrammar / FWG

**Fil:** `data/Civication/workGrammars/{category}/{role_scope}.json`

WorkGrammar/FWG er stillingens arbeidslogikk. Den skal ikke erstatte roleModel, mailPlan eller mailFamilies, men gjøre koblingen mellom badge, fagfiler og mailproduksjon presis. En FWG-fil skal forklare:

- badge-binding og progresjon
- fag-binding, nødvendige begreper og metoder
- jobbens identitet, hovedpress og arbeidsrytme
- stereotypiske arbeidsoppgaver, problemer og konflikter
- gode løsningsmønstre og vanlige feilmønstre
- aktørtyper, steder og kunnskapsavhengigheter
- mail generation contract, Day 1 contract og test contract

Schemaet er `civication_work_grammar_v1`, dokumentert i `docs/CIVICATION_WORK_GRAMMAR_STANDARD.md`. Nye komplette referanseroller skal være `complete_reference_v2` og krever FWG. Eldre komplette referanseroller uten FWG beholdes som legacy `complete_reference`. RoleModel alene er derfor ikke lenger nok for en ny komplett referansepakke.

### 2. roleModel

**Fil:** `data/Civication/roleModels/{category}/{role}.json`

RoleModel er rollebibelen. Den skal forklare stillingen før mailene skrives:

- tittel, kategori, `role_scope`, `role_id` og kilde fra badge/tier
- kjernefortelling: hva står på spill i rollen?
- hverdagsarbeid, ansvar, arbeidsmiljø og statusposisjon
- karrierevei, risiko og mulige overganger
- nødvendig fagkunnskap og History Go-koblinger
- personer, steder, dilemmaer og typiske utfordringer
- kompetanseakser og idealtypiske problemer
- mail-integrasjon: hvilke mailtyper rollen trenger

### 3. mailPlan

**Fil:** `data/Civication/mailPlans/{category}/{role_scope}_plan.json`

MailPlan er sesongplanen/plottet. Den skal beskrive progresjonen i saken, ikke selve mailtekstene:

- `category` og `role_scope` må matche runtime-scope
- `arc.from`, `arc.to` og kjernefragen(e) må gjøre rollen lesbar som historie
- `sequence` må angi steg, type, fase, mål, `allowed_families` og fallback
- progresjonen må gå fra introduksjon via arbeid/personer/konflikt til konsekvens eller politisk/faglig landing
- `outcome_rules` bør beskrive hva som teller som mestring, stagnasjon eller kollaps når rollen bruker slike utfall

### 4. job-mails

**Fil:** `data/Civication/mailFamilies/{category}/job/{role_scope}_job.json`

Job-mails er de stereotype arbeidsoppgavene. De skal lære spilleren hva rollen faktisk gjør: lese, vurdere, skrive, prioritere, kvalitetssikre eller sende videre. Hver mail må ha et konkret arbeidspress, et valg og en konsekvensakse.

### 5. people-mails

**Fil:** `data/Civication/mailFamilies/{category}/people/{role_scope}_people.json`

People-mails gjør personkartet spillbart. De skal introdusere konkrete aktører med navn, rolle, agenda og press. En komplett pakke bør ha både støttespillere, motparter, interne fagfolk, ledelse og berørte borgere/kunder/brukere.

### 6. conflict-mails

**Fil:** `data/Civication/mailFamilies/{category}/conflict/{role_scope}_conflict.json`

Conflict-mails viser målkonfliktene i rollen. De skal ikke bare være drama; de skal tvinge spilleren til å velge mellom reelle hensyn, for eksempel tempo mot kvalitet, økonomi mot legitimitet eller juridisk presisjon mot politisk signal.

### 7. story-mails

**Fil:** `data/Civication/mailFamilies/{category}/story/{role_scope}_story.json`

Story-mails bærer hovedfortellingen. De skal forklare hvorfor denne jobben er en liten historie, og gi rollen en identitet som spilleren kan mestre eller miste.

### 8. event-mails

**Fil:** `data/Civication/mailFamilies/{category}/event/{role_scope}_event.json`

Event-mails er frister, møter, avbrudd, kriser eller ytre hendelser som presser saken framover. De skal gi rytme i dagen og gjøre mailPlanens dramatikk spillbar.

### 9. micro-mails

**Fil:** `data/Civication/mailFamilies/{category}/micro/{role_scope}_micro.json`

Micro-mails er korte avklaringer som viser at små svar kan flytte store konsekvenser. De egner seg til normer, tall, begreper, praktiske avklaringer og små valg under tidspress.

### 10. followup-mails

**Fil:** `data/Civication/mailFamilies/{category}/followup/{role_scope}_followup.json`

Followup-mails reagerer på tidligere valg eller åpne spørsmål. De skal ha branch-flagg, `next_bias` eller annen styring som gjør at spilleren ser at valg får etterspill.

### 11. knowledge-mails

**Fil:** `data/Civication/mailFamilies/{category}/knowledge/{role_scope}_knowledge.json`

Knowledge-mails lærer fagbegreper gjennom saken. De skal ikke være leksikon alene; begrepene må knyttes til et konkret valg, en avveiing eller en risiko i rollen.

### 12. consequence-mails

**Fil:** `data/Civication/mailFamilies/{category}/consequence/{role_scope}_consequence.json`

Consequence-mails viser hva tidligere valg gjorde med tillit, kvalitet, risiko, tempo, legitimitet eller karriere. De skal være tydelige på konsekvensakse og bør kunne brukes i dagsslutt eller senere dager.

### 13. Day 1-test

En komplett rolle må ha minst én test som bygger en spillbar dag med `DailyMailBuilder`.

Testen skal verifisere at:

- roleModel, mailPlan og mailFamilies finnes
- alle nødvendige mailtyper har innhold
- `allowed_families` i mailPlan finnes i katalogene
- `role_scope` er konsekvent
- full dag kan bygges med forventede faser
- dagen inneholder mer enn bare job-mails
- Day 1 har en dramaturgisk åpning, arbeid, person/konflikt og landing

Arealplanlegger bruker `tests/civication-arealplanlegger-mail-plan.test.js` som referanse.

### 14. QA-test

QA skal fungere som en lesbar kvalitetskontroll i tillegg til teknisk test. Den bør sjekke:

- om rollepakken har hovedcase og plot
- om mailene har konkrete personer og steder
- om konfliktene er faglige, ikke bare generelle
- om læringsmål og kompetanseakser går igjen i mailene
- om followup/consequence faktisk peker tilbake på valg
- om Day 1 er auditerbar som én sammenhengende arbeidsdag

QA kan være en egen testfil, en utvidelse av Day 1-testen eller en dokumentert audit-liste når rollen fortsatt er under produksjon.

### 15. History Go targets

RoleModel og mailinnhold skal peke mot History Go-mål der det er relevant:

- badge/kategori
- steder og place IDs
- kunnskapsmål og begreper
- mulige kart-, rute- eller stedskoblinger
- progresjonsmål som gjør jobben relevant for History Go, ikke bare Civication

### 16. personkart

Personkartet skal definere rollens cast:

- leder/bestiller
- intern fagperson
- ekstern motpart
- bruker/borger/kunde/nabo
- juridisk/økonomisk/politisk kontrollpunkt der relevant
- person-IDer som brukes konsekvent i roleModel og people-mails

### 17. konfliktkart

Konfliktkartet skal navngi hovedkonfliktene og knytte dem til mailtyper:

- hovedcase
- primær konflikt
- sekundære konflikter
- hvem som presser på hver side
- hvilke valgaks(er) konflikten bruker
- hvilke konsekvenser den kan få

### 18. kompetanseakser

Kompetanseakser beskriver hva spilleren øver på. De bør finnes i roleModel og komme igjen i mailene som `competency`, `learning_focus` eller tilsvarende felt.

Eksempler på akser:

- faglig presisjon
- integritet under press
- analyse og dokumentasjon
- kommunikasjon med berørte aktører
- risikovurdering
- politisk/organisatorisk lesbarhet

### 19. konsekvensmodell

Konsekvensmodellen forklarer hva valg påvirker. Den bør koble mailenes `choice_axis`, `consequence_axis`, branch-flagg og planens `outcome_rules` sammen.

En rollepakke bør tydeliggjøre:

- hva god mestring ser ut som
- hva stagnasjon ser ut som
- hva varsler, tap av tillit eller kollaps betyr
- hvilke konsekvenser som kommer samme dag
- hvilke konsekvenser som bæres videre til senere dager

## Arealplanlegger som første referanserolle

Arealplanlegger-pakken er første referanserolle fordi den viser hvordan en jobb kan bygges som en liten historie uten ny motor eller UI.

**«Linjen på kartet»** fungerer som komplett rollefortelling:

- hovedcase: reguleringssak i Lillebekk
- plot: en tilsynelatende liten kartlinje flytter boligverdi, grøntdrag, skolevei, støy, overvann, juridisk risiko og politisk ansvar
- personer: plansjef, utbygger, beboerrepresentant, byøkolog, skole-/trafikkontakt, utvalgssekretær, planjurist, plankonsulent og interne fagkontakter
- stereotypiske oppgaver: plankart, bestemmelser, stedsanalyse, medvirkning, rekkefølgekrav, saksframlegg og politisk lesbarhet
- konflikter: fortetting mot grøntdrag, framdrift mot medvirkning, politisk tempo mot juridisk presisjon
- Day 1: bygger en full arbeidsdag med åpning, arbeid, konflikt/personpress, kunnskap/konsekvens og carryover

Nye roller bør bruke Arealplanlegger som kvalitetsnivå og strukturreferanse, men skrive egen rollefortelling, egne personer, egne konflikter og egne faglige valg.

## Sjekkliste for nye roller

Bruk denne før en rolle regnes som komplett:

- [ ] Har rollen FWG/workGrammar for runtime-scope?
- [ ] Har rollen badge-binding og fag-binding?
- [ ] Har rollen et hovedcase?
- [ ] Har rollen et plot?
- [ ] Har rollen konkrete personer?
- [ ] Har rollen stereotypiske arbeidsoppgaver?
- [ ] Har rollen konflikter?
- [ ] Har rollen minst én spillbar dag?
- [ ] Kan `DailyMailBuilder` bygge full dag?
- [ ] Er `role_scope` konsekvent i roleModel, mailPlan, mailFamilies og test?
- [ ] Finnes alle mailtyper: `job`, `people`, `conflict`, `story`, `event`, `micro`, `followup`, `knowledge`, `consequence`?
- [ ] Finnes test?
