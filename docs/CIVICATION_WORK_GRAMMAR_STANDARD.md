# Civication Work Grammar / FWG Standard v1

Oppdatert: 2026-06-30

FWG står for **Faglig Work Grammar** / **stillingsgrammatikk**. En FWG-fil beskriver hvordan en stilling fungerer som arbeid: hvilke saker som kommer inn, hvilke fagbegreper som brukes, hvilke konflikter som oppstår, hvem som presser, hvilke metoder som er gode, og hvilke feil som skaper etterspill.

En FWG er ikke bare audit og minimumsvolum — den skal også beskrive stillingen som en **story simulation**: en praktisk arbeidssimulering, en liten narrativ verden, et kunnskapsfelt, et nettverk av personer og en serie små stories. Dette laget bæres av `story_world` og `practice_stories` og er forklart i [FWG as Story Simulation](#fwg-as-story-simulation).

Dette er et nytt datalag, ikke en ny motor. Standarden krever ingen UI-endring og ingen endring i `DailyMailBuilder`.

## Plass i arkitekturen

```text
badge tier
  -> category fagfiles
  -> role workGrammar / FWG
  -> roleModel
  -> mailPlan
  -> mailFamilies
  -> DailyMailBuilder / MailRuntime
```

FWG er arbeidslogikken. `roleModel` er rollebeskrivelsen. `mailPlan` er dramaturgien. `mailFamilies` er scenene.

## Filplassering

```text
data/Civication/workGrammars/{category}/{role_scope}.json
```

Eksempel:

```text
data/Civication/workGrammars/by/by_radgiver_plan.json
```

`role_scope` skal normalt følge runtime-scope brukt av mailPlan og mailFamilies.

## Schema

Alle FWG-filer skal bruke:

```json
{
  "schema": "civication_work_grammar_v1",
  "version": 1,
  "category": "by",
  "role_scope": "by_radgiver_plan",
  "role_id": "by_arealplanlegger",
  "title": "Arealplanlegger",
  "badge_binding": {},
  "fag_bindings": {},
  "work_identity": {},
  "story_world": {},
  "practice_stories": [],
  "task_grammar": [],
  "problem_grammar": [],
  "conflict_grammar": [],
  "solution_patterns": [],
  "failure_patterns": [],
  "actor_grammar": [],
  "place_grammar": [],
  "knowledge_dependencies": [],
  "mail_generation_contract": {},
  "day_one_contract": {},
  "test_contract": {}
}
```

## Feltkrav

### `badge_binding`

Kobler stillingen til badge-/tier-systemet. Skal angi badge-kategori, badge-ID, tier-label, terskel og progresjon inn/ut av rollen der dette finnes.

### `fag_bindings`

Kobler rollen til faguniverset. Skal angi primærfag, relevante kildefiler, nødvendige begreper og metoder. Dette er grunnlaget for at knowledge-, job- og conflict-mails ikke finner opp fag løsrevet fra kategoriens kunnskapsgrunnlag.

### `work_identity`

Beskriver jobbens kjerne: én setning, skjult ansvar, statusspenning, hovedpress og arbeidsrytme. Alle mailtyper bør kunne spores tilbake til denne identiteten.

### `story_world`

Beskriver stillingen som en liten narrativ verden, ikke bare et datasett. Se [FWG as Story Simulation](#fwg-as-story-simulation) for hvorfor og hvordan. Feltet bør inneholde:

- `simulation_promise`: hva rollen lar spilleren oppleve.
- `everyday_world`: hvordan arbeidshverdagen ser ut konkret.
- `hidden_complexity`: hva folk utenfor jobben ikke forstår.
- `recurring_situations`: gjentakende situasjoner som kan bli mailer.
- `small_story_seeds`: små historier som kan bli tråder/followups.
- `relationship_web`: relasjoner som skaper press, hjelp, misforståelser og lojalitet.
- `knowledge_in_practice`: fagbegreper koblet til konkrete situasjoner (se [Situert kunnskap](#situert-kunnskap)).
- `emotional_costs`: slitasje, stolthet, skam, usikkerhet, ansvar.
- `status_illusions`: hva jobben ser ut som utenfra vs hva den krever.
- `player_learning_arc`: hva spilleren gradvis skal skjønne.

Alle `complete_reference_v2`-roller bør ha eller få et `story_world`.

### `practice_stories`

En strukturert liste over små, spillbare arbeidsscener som kan bli mailtråder, followups og konsekvenser. Se [Practice stories](#practice-stories) for full kontrakt. Hver `complete_reference_v2`-rolle bør ha minst 12 practice_stories for første gode versjon, og 20–30 for en rolle som skal bære mange spilldager.

### `task_grammar`

Definerer stereotypiske arbeidsoppgaver som kan bli job-, micro- og knowledge-mails. Hver oppgave bør ha `id`, `label`, `task_type`, typiske input, godt arbeid, dårlig arbeid og relevante mailtyper.

### `problem_grammar`

Definerer typiske arbeidsproblemer. Hvert problem bør ha symptom, underliggende problem, kilder, fagbegreper og mulige mailtyper.

### `conflict_grammar`

Definerer konfliktmotoren for rollen. Hver konflikt bør ha akse, side A/side B, gode/dårlige oppløsninger og hvilke mailfamilier som bør bære konflikten.

### `solution_patterns`

Definerer faglig gode løsningsmønstre: steg, hvilke konflikter mønsteret passer for, valg-tags og effekter på tillit, tempo, risiko eller synlighet.

### `failure_patterns`

Definerer vanlige feil og etterspill: kortsiktig gevinst, langsiktig risiko og followup-hooks.

### `actor_grammar`

Definerer persontypene rundt rollen. Aktører skal være strukturelle: leder, fagperson, berørt borger, ekstern motpart, kontrollpunkt eller tilsvarende.

### `place_grammar`

Kobler rollen til steder og arbeidsflater i History Go/Civication. Steder bør angi funksjon og relevante mailtyper.

### `knowledge_dependencies`

Definerer faglige avhengigheter som mailene må respektere, for eksempel hvilke begreper som må være kjent for å forstå et valg.

### `mail_generation_contract`

Definerer hvilke mailtyper rollen må ha, minimumsteller for komplett pakke, og hvilke akser mailene skal bruke. Dette er auditgrunnlag, ikke runtime-kontrakt.

### `day_one_contract`

Definerer deterministiske forventninger til første spilldag: beats, tema og carryover.

### `test_contract`

Definerer hvilke tester og audits som beviser at rollen er spillbar som FWG-basert rollepakke.

## FWG as Story Simulation

En FWG er ikke bare en audit-kontrakt med oppgaver, problemer, konfliktakser, `minimum_counts` og mailtyper. Det tekniske er nyttig, men ikke nok. Hvis mailene bare blir «du får en sak, velg A/B/C», føles Civication som en quiz, ikke som en jobb.

**Prinsipp: Civication simulerer ikke CV-titler. Civication simulerer arbeidshverdager. Hver rolle skal være en liten fortelling om hva arbeidet krever i praksis.**

En FWG skal derfor være rollepakkenes «stillingsbibel»: den skal samle kunnskap, arbeidsrytme, personer, konflikter, relasjoner, fagbegreper, typiske situasjoner, små historier og konsekvensmønstre. Beskriv stillingen som fem ting samtidig:

1. en praktisk arbeidssimulering
2. en liten narrativ verden
3. et kunnskapsfelt
4. et nettverk av personer og relasjoner
5. en serie små stories som kan bli mailtråder, followups og konsekvenser

En god FWG svarer på:

- Hva gjør denne jobben i praksis?
- Hva må spilleren lære for å gjøre jobben godt?
- Hvilke situasjoner gjentar seg?
- Hvilke små stories finnes i rollen?
- Hvem møter spilleren?
- Hva vil de ulike personene?
- Hva skjuler seg bak de tilsynelatende enkle oppgavene?
- Hva er lavstatusarbeidet som egentlig har høy betydning?
- Hva er faglig vanskelig?
- Hva er sosialt vanskelig?
- Hva er emosjonelt slitsomt?
- Hva skjer hvis spilleren velger tempo, unngåelse, faglighet, kontroll, omsorg, lojalitet eller konflikt?

Dette laget bæres konkret av `story_world` og `practice_stories`.

### story_world-laget

```json
"story_world": {
  "simulation_promise": "...",
  "everyday_world": "...",
  "hidden_complexity": "...",
  "recurring_situations": [],
  "small_story_seeds": [],
  "relationship_web": [],
  "knowledge_in_practice": [],
  "emotional_costs": [],
  "status_illusions": [],
  "player_learning_arc": []
}
```

- `simulation_promise`: hva rollen lar spilleren oppleve.
- `everyday_world`: hvordan arbeidshverdagen ser ut konkret.
- `hidden_complexity`: hva folk utenfor jobben ikke forstår.
- `recurring_situations`: gjentakende situasjoner som kan bli mailer.
- `small_story_seeds`: små historier som kan bli tråder/followups.
- `relationship_web`: relasjoner som skaper press, hjelp, misforståelser og lojalitet.
- `knowledge_in_practice`: fagbegreper koblet til konkrete situasjoner.
- `emotional_costs`: slitasje, stolthet, skam, usikkerhet, ansvar.
- `status_illusions`: hva jobben ser ut som utenfra vs hva den krever.
- `player_learning_arc`: hva spilleren gradvis skal skjønne.

### Practice stories

`practice_stories` er små, spillbare arbeidsscener — ikke romaner. Hver scene kan senere bli en mailtråd, en followup eller en konsekvens.

```json
"practice_stories": [
  {
    "id": "story_id",
    "title": "Kort tittel",
    "story_type": "everyday|conflict|relationship|knowledge|failure|consequence|identity",
    "premise": "Hva skjer?",
    "people": [],
    "place_id": "...",
    "work_knowledge": [],
    "conflict_axes": [],
    "mail_types": [],
    "thread_potential": true,
    "possible_choices": [],
    "possible_followups": [],
    "learning_point": "Hva lærer spilleren om jobben?"
  }
]
```

Krav til en `complete_reference_v2`-rolle:

- minst 12 practice_stories for første gode versjon (20–30 for roller som skal bære mange spilldager).
- hver story har `id`, `title`, `premise`, `people`/`place_id`, `work_knowledge`, `conflict_axes`, `mail_types` og `learning_point`.
- minst noen stories har `thread_potential: true`.
- `work_knowledge` peker på begreper som finnes i `fag_bindings` eller `knowledge_dependencies` — ikke oppfunne begreper.
- `conflict_axes` bør gjenbruke aksene i `conflict_grammar`, og `place_id` bør finnes i `place_grammar`.

Eksempel (Barnehageassistent):

```json
{
  "id": "barnet_slipper_ikke_handen",
  "title": "Barnet slipper ikke hånden",
  "story_type": "everyday",
  "premise": "Et barn holder fast i forelderen ved levering mens resten av gruppa allerede trekker mot garderoben.",
  "people": ["barn_som_strever_med_overgang", "forelder_som_trenger_stotte", "pedagogisk_leder"],
  "place_id": "garderobe",
  "work_knowledge": ["tilknytning", "overgangssituasjon", "trygg base", "egenregulering"],
  "conflict_axes": ["omsorg_vs_tidsklemme", "trygghet_vs_flyt"],
  "mail_types": ["job", "people", "conflict", "followup", "consequence"],
  "thread_potential": true,
  "possible_choices": [
    "lage rolig og forutsigbar overgang",
    "få forelderen raskt ut for å holde flyt",
    "overlate situasjonen til pedagogisk leder"
  ],
  "possible_followups": [
    "forelder spør hvordan overgangen faktisk gikk",
    "pedagogisk leder ber om konkret observasjon",
    "barnet søker eller unngår samme voksen senere"
  ],
  "learning_point": "Overgang er ikke logistikk alene; det er tilknytning, rytme og voksenregulering i praksis."
}
```

### Situert kunnskap

Kunnskap skal ikke bare listes som begreper. En ren begrepsliste forteller ikke spilleren hva begrepet betyr i arbeidet.

Dårlig:

```json
"required_concepts": ["tilknytning", "observasjon", "grensesetting"]
```

Bedre — `knowledge_in_practice` (lever i `story_world`):

```json
"knowledge_in_practice": [
  {
    "concept": "tilknytning",
    "practical_scene": "barnet slipper ikke forelder ved levering",
    "what_player_must_notice": "barnets kropp, forelders uro, gruppas tempo og egen stemmebruk",
    "bad_misread": "barnet manipulerer eller er vanskelig",
    "good_use": "skape trygg overgang med samme voksen og konkret observasjon"
  }
]
```

Regler:

- FWG skal fortsatt ha `fag_bindings`, men også vise hvordan begrepene opptrer i praksis.
- Knowledge-mails skal kunne hentes fra `knowledge_in_practice`.
- Practice stories skal koble kunnskap til konkrete scener via `work_knowledge`.

### Mailer er scener, ikke bare prompts

En mail er ikke bare et spørsmål. **En mail er en scene i stillingen.**

En scene skal normalt inneholde:

- noen som vil noe
- et konkret arbeidspress
- en relasjon
- et faglig eller praktisk problem
- en risiko
- en kostnad ved alle valg
- en mulig senere konsekvens

### MailThreads og practice_stories

Thread-mailer bør kunne spores tilbake til en `practice_story`. For nye `complete_reference_v2`-mails anbefales et valgfritt felt:

```json
"practice_story_id": "barnet_slipper_ikke_handen"
```

Dette er ikke påkrevd for alle legacy-mails, men nye `complete_reference_v2`-mails bør bruke det, slik at MailThreads-arbeidet senere kan skrive bedre trådmailer som henger sammen med en kjent arbeidsscene.

## Status og audit

- `complete_reference_v2`: komplett referanserolle med roleModel, workGrammar/FWG, mailPlan, alle mailFamilies og test.
- `complete_reference`: legacy referanserolle uten FWG, men ellers komplett etter rollepakke-standarden.
- `playable_v1`: spillbar rolle med roleModel, mailPlan, alle mailFamilies og test, men ikke referanse.
- `partial_pack`: noe produksjonsdata finnes, men pakken er ikke komplett.
- `role_model_only`: kun roleModel finnes.
- `broken_mapping`: mailPlan finnes uten matchende roleModel i manifestet.

Ny byggeregel: ingen ny `complete_reference_v2` uten FWG-fil. Gamle komplette roller uten FWG behandles som legacy `complete_reference` til de får stillingsgrammatikk.

## Første referanse

Arealplanlegger har første FWG-fil:

```text
data/Civication/workGrammars/by/by_radgiver_plan.json
```

Den dekker plankart, bestemmelser, stedsanalyse, medvirkning, skolevei, grøntdrag, støy, overvann, rekkefølgekrav, politisk lesbarhet, utbyggerpress og juridisk presisjon.

### Status: ferdig referanse

Arealplanlegger er nå den første rollen der FWG faktisk styrer hele mailpakken. `node scripts/audit-civication-fwg-governance.mjs` rapporterer **null avvik** for `by/by_radgiver_plan` på alle deklarerte dimensjoner (`minimum_counts`, `required_axes`, `place_grammar`, `actor_grammar`, `conflict_grammar`, `solution_patterns`, `failure_patterns`).

Konkret betyr det at `mail_generation_contract.minimum_counts` er oppfylt for alle mailtyper. Innholdet utover dag 1 ligger i egne uke-2-familier som bærer den senere delen av rollebuen (eskalering, klage, omkamp, konsekvens):

```text
conflict: lillebekk_week2_konflikter
event:    lillebekk_week2_frister
people:   lillebekk_week2_aktorer
story:    lillebekk_week2_fortellinger
```

Disse mailene er bevisst merket som uke-2-innhold (id/family inneholder `_week2_`), slik at `CivicationDailyMailBuilder` holder dem utenfor den deterministiske dag-1-rytmen til rolleplanen når dem. Hver mail er forankret i en `practice_story` via `practice_story_id`, slik at framtidig MailThreads-arbeid kan skrive trådmailer som henger sammen med en kjent arbeidsscene.
