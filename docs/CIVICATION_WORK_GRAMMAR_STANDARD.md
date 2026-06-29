# Civication Work Grammar / FWG Standard v1

Oppdatert: 2026-06-29

FWG står for **Faglig Work Grammar** / **stillingsgrammatikk**. En FWG-fil beskriver hvordan en stilling fungerer som arbeid: hvilke saker som kommer inn, hvilke fagbegreper som brukes, hvilke konflikter som oppstår, hvem som presser, hvilke metoder som er gode, og hvilke feil som skaper etterspill.

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
