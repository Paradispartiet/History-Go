# Civication Subkultur Arrangementsdrift Role World rollout — source first

Dato: **2026-08-28**

Rolle: `subkultur/subkultur_arrangementsdrift`

## Canonical utgangspunkt

Readiness-gaten klassifiserer rollen som `rollout_ready` med nøyaktig én authored gjeld: `situated_reputation`.

Eksisterende career-pakke beholdes uendret:

- role model: `data/Civication/roleModels/subkultur/subkultur_arrangementsdrift.json`
- work grammar: `data/Civication/workGrammars/subkultur/subkultur_arrangementsdrift.json`
- mail plan: `data/Civication/mailPlans/subkultur/subkultur_arrangementsdrift_plan.json`
- eksisterende mailtyper: `job`, `people`, `conflict`, `event`, `followup`, `knowledge`, `consequence`
- eksisterende Scene Pipeline forblir eneste runtime

Den fire-trinns planen skal ikke utvides bare for å få en lengre Role World. Followup, knowledge og consequence beholdes som eksisterende authored provenance uten å omskrive planens dramaturgiske kontrakt.

## Hva situert omdømme betyr i denne rollen

Arrangementsdrift skjer i et miljø der sosial status, vennskap, subkulturell troverdighet og praktisk arbeid lett kan blandes sammen. Rollouten skal derfor uttrykkelig holde flere standings adskilt:

1. **Arrangementsansvarlig / skiftledelse** vurderer om spilleren leverer presis status, følger kjøreplan, logger avvik og eskalerer riktig.
2. **Crew og frivillige** vurderer rettferdig belastning, pauser, støtte, kreditt og om lojalitet misbrukes som gratis arbeidsplikt.
3. **Teknisk ansvarlig** vurderer om spilleren respekterer kompetansegrenser og sikkerhetsplan selv når åpningstid eller sosialt press trekker motsatt vei.
4. **Artister og akkrediterte deltakere** vurderer tydelighet, respekt og forutsigbarhet i backstage- og adgangsarbeid, men kan aldri gi spilleren ekstra mandat.
5. **Publikum og personer med tilgjengelighetsbehov** vurderer om regler og ruter faktisk er synlige, like og brukbare uten innsidekunnskap.
6. **Venner og subkulturelle jevnaldrende** kan oppleve spilleren som lojal eller rigid, men deres standing kan aldri fungere som akkreditering, jobbautorisasjon eller teknisk kompetansebevis.

Det finnes **ingen global reputation-score**. En beslutning kan forbedre standing hos teknisk ansvarlig og publikum samtidig som den svekker standing hos venner eller et utålmodig crew. Det er en tilsiktet egenskap, ikke et avvik.

## Authority-grense

Eksisterende authority-kontrakt er bindende gjennom hele rollouten. Rollen kan håndheve avtalte adgangsregler i egen vakt, styre enkel publikumsflyt innen sikkerhetsplanen, stoppe og eskalere utenfor egen kompetanse og loggføre/overlevere avvik.

Rollouten kan ikke gjøre noen av følgende handlinger legitime gjennom standing:

- `overstyre_sikkerhetsplan`
- `utføre_teknisk_arbeid_uten_opplaring`
- `gi_venner_skjult_saertilgang`
- `inngaa_avtaler_uten_mandat`

Sosial anerkjennelse er derfor aldri privilege.

## Cross-role vurdering

Readiness sier `candidate_when_shared_work_is_real`. Repoet har ingen eksisterende `work_object_id` eller runtime-bevist shared work-object for `subkultur_arrangementsdrift`.

Denne PR-en skal derfor **ikke fabrikkere cross-role-koblinger**. Cross-role-materialisering forblir `false` til et reelt delt arbeidsobjekt finnes i canonical Scene Pipeline.

## 14-dagers verden

Role World-en materialiseres som 14 dager × fire faser = 56 dramaturgiske beats. Den eksisterende arrangementsdagen brukes som provenance, men verden undersøker hvordan lignende arbeid og relasjoner akkumulerer standing over flere vakter:

- åpning og tilgjengelig publikumsflyt
- crewbelastning og mentoransvar
- backstage- og adgangspress
- sikkerhetskritisk rigg og kompetansegrenser
- avvik, vaktoverlevering og senere presedens
- privat etterspill når vennskap og miljøstatus kolliderer med synlige arbeidsregler

## Fail-closed krav

Materialisering får først bli permanent etter at følgende passerer på samme branch-head:

- streng Arrangementsdrift Role World-test
- eksisterende career/playability-gater gjennom career audit
- generisk Role World-kontrakt
- broad-rollout policy gate
- scene-registry `--check`
- career gameplay audit `--check`
- rollout-readiness `--check`
- full `npm run test:civication`

TEMP-materializer og TEMP-workflow skal fjernes før den verifiserte permanente committen pushes.

Endelig status skal bare rapporteres fra GitHub etter exact-head PR-CI, SHA-låst merge, Main integrity og Pages.