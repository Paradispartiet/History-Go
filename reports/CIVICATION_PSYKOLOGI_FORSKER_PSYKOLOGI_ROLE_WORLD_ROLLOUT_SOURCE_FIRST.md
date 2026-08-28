# Civication Psykologi Forsker Role World rollout — source-first

Dato: **2026-08-28**

## Canonical inngang

- Rolle: `psykologi/forsker_psykologi`
- Readiness: `rollout_ready`
- Canonical `next_required_pr`: `Role World rollout: psykologi/forsker_psykologi`
- Gjenstående authored dimension: **kun `situated_reputation`**
- Cross-role: `not_required_for_rollout`
- Eksisterende Scene Pipeline og runtime beholdes uendret.

## Kilder i den eksisterende rollepakken

Rollouten bygger på allerede canonicalt innhold og endrer ikke rollemodell, arbeidsgrammatikk, mailplan eller mailfamilier:

- `data/Civication/roleModels/psykologi/forsker_psykologi.json`
- `data/Civication/workGrammars/psykologi/forsker_psykologi.json`
- `data/Civication/mailPlans/psykologi/forsker_psykologi_plan.json`
- `data/Civication/psychologyAcademicCareerEvidence.json`
- `tests/civication-psychology-academic-career-ladder.test.js`

Eksisterende ni mail-scener brukes som provenance:

1. `job`: `psykologi_forsker_psykologi_job_analyseplan_001`
2. `people`: `psykologi_forsker_psykologi_people_metodekritikk_001`
3. `conflict`: `psykologi_forsker_psykologi_conflict_sterkere_resultat_001`
4. `knowledge`: `psykologi_forsker_psykologi_knowledge_planlagt_utforskende_001`
5. `event`: `psykologi_forsker_psykologi_event_frist_data_001`
6. `micro`: `psykologi_forsker_psykologi_micro_figur_usikkerhet_001`
7. `followup`: `psykologi_forsker_psykologi_followup_analyseavvik_001`
8. `story`: `psykologi_forsker_psykologi_story_sluttrapport_001`
9. `consequence`: `psykologi_forsker_psykologi_consequence_robusthet_001`

`conflict`, `followup` og `consequence` viderefører den eksisterende tråden `psykologi_forsker_psykologi_analyseintegritet_001`.

## Autoritets- og integritetsgrenser som skal overleve rollouten

Forskerstatus eller sosial standing kan aldri:

- bli psykologautorisasjon;
- gi diagnose- eller behandlingsmyndighet;
- gjøre et post hoc analysevalg forhåndsdefinert;
- gjøre et ønsket funn sannere eller sterkere enn evidensen;
- gi rett til å dele eller behandle persondata uten nødvendig grunnlag, dataminimering og sikkerhet;
- gi prosjektleder, partner, reviewer eller forsker rett til å omskrive analysehistorikken.

Den eksisterende akademiske runtime-gaten `academic_qualification_and_employment` beholdes. Badge-poeng alene oppretter ikke forskerrollen.

## Situated reputation

Role World-en skal eksplisitt skille minst disse audience-aksene:

- prosjektledelse og leveranse;
- metodekolleger og medforfattere;
- etikk/personvern/datastyring;
- eksterne partnere og interessenter;
- forskningsmiljø, fagfellevurdering og publisering;
- private relasjoner.

Standing skal kunne divergere. Eksempler:

- Et åpent nullfunn kan svekke kortsiktig leveransestatus hos prosjekt/partner, men styrke metode- og forskningsintegritetsstanding.
- En sensitivitetsanalyse som svekker effekten kan oppleves som rework og forsinkelse, men øke standing hos metodekolleger og reviewers.
- Å nekte rådata før dataminimering er avklart kan skape kortsiktig partnerfriksjon, men styrke etikk-/personvernstanding.

Det skal **ikke** finnes én global reputation-score.

## Materialiseringskontrakt

- 14 dager × 4 faser = 56 Role World-beats.
- Alle beats bruker eksisterende mail-scener som provenance.
- Ingen ny runtime-state.
- Ingen ny cross-role work object.
- Eksisterende åtte-trinns mailplan og alle ni mailkataloger beholdes byte-for-byte av rollouten.
- Nye standing-aksjer er editorial-only til eventuell senere eksplisitt governance.
- Fiktive/generiske arbeidsrelasjoner brukes; det opprettes ingen påstander om konkrete forskere eller arbeidsgivere.

## Fail-closed proof

Permanent materialisering skal først skrives etter at TEMP-gaten har:

1. materialisert Role World-en;
2. regenerert scene registry, Career Gameplay Matrix og rollout readiness;
3. passert academic-career-gaten, ny strict Forsker-rollout-test og generic Role World/policy-gates;
4. passert full `npm run test:civication`;
5. fjernet TEMP-materializer og TEMP-workflow før permanent commit.
