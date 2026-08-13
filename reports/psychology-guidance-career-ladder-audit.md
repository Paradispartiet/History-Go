# Psychology guidance career ladder audit

Reviewed: 2026-08-13

## Scope

This audit covers Psychology Badge tiers 5–7:

- Veileder — 40 points
- Rådgiver — 60 points
- Seniorrådgiver — 85 points

The labels remain canonical progression titles. Their playable work meaning is now narrowed to one documented Norwegian work family: **arbeids-, jobb- og karriereveiledning**. This avoids pretending that the generic words `Veileder`, `Rådgiver` and `Seniorrådgiver` by themselves describe a psychology profession.

## Evidence

The machine-readable evidence registry is `data/Civication/psychologyGuidanceEvidence.json`.

Primary sources:

1. Utdanning.no — **Jobbveileder**. Documents mapping of situation and opportunities, motivation, work/education guidance, action plans, job-related assistance and collaboration with employers, NAV and other professionals.
2. Utdanning.no — **Karriereveileder**. Documents guidance toward independent and conscious education/career choices, CV/application/interview support, transitions, labor-market and education knowledge, and the NAV/Aa-register title **Karriererådgiver**.

The sources support the work family, not a claim that Badge points grant a formal degree, clinical authority or a protected professional title.

## Canonical architecture

All three tiers resolve through `CivicationCareerRoleResolver` to:

- `role_scope`: `psykologi_arbeids_og_karriereveiledning`
- representative `role_id`: `psykologi_karriereveileder`
- FWG: `data/Civication/workGrammars/psykologi/psykologi_arbeids_og_karriereveiledning.json`
- canonical roleModel: `data/Civication/roleModels/psykologi/psykologi_arbeids_og_karriereveiledning.json`
- Life Story: `data/Civication/lifestory/roles/psykologi_arbeids_og_karriereveiledning/`

The three legacy tier roleModels remain as tier-specific editorial views, but all point to the same canonical `role_scope` and evidence registry.

## Professional boundary

The role may:

- map interests, competence, resources and goals together with the person;
- explore education and work opportunities;
- support CV, applications and interviews;
- create and follow up action plans together;
- motivate without taking ownership of the decision;
- cooperate with employers, NAV and relevant professionals inside consent and mandate.

The role may **not**:

- diagnose mental disorders;
- provide psychotherapy;
- make medical or clinical work-capacity assessments;
- present interest/mapping tools as clinical tests or diagnoses;
- share sensitive information without legal basis or clarified consent;
- decide education or career choices on behalf of the person.

This boundary is repeated in the evidence registry, FWG, canonical roleModel, tier roleModels and Life Story role data so it is inspectable at every layer.

## Playability

The shared Life Story package contains five work threads and five decision scenes across two days:

1. **Målet som ikke er ditt** — autonomy versus steering.
2. **Kartleggingen som blir dom** — exploration versus pseudo-diagnostic certainty.
3. **Arbeidsgiveren vil vite mer** — job matching versus privacy.
4. **Rask jobb eller bærekraftig valg** — placement pressure versus sustainable choice.
5. **NAV-planen og mennesket** — system deadline versus a usable, person-owned plan.

The ending contract is calibrated so a consistently autonomy-supportive route and a consistently system-steering route produce different endings.

## Gates preserved

Tier 8 `Psykolog` remains outside this scope and continues to require `no_psychologist_authorization_or_license`. The guidance scope must never be inherited by Psykolog, Spesialistpsykolog, clinical leadership or academic Psychology roles.

## Permanent regression gates

`tests/civication-psychology-guidance-career-ladder.test.js` locks:

- exact 40/60/85 thresholds;
- direct, non-regulated offer policy for the three existing tiers;
- shared resolver scope and role id;
- machine-readable source evidence;
- clinical authority boundary;
- tier roleModel alignment;
- FWG depth;
- active shared Life Story binding;
- validation through the real Life Story content validator;
- preservation of the Psykolog authorization gate.

`tests/civication-lifestory-endings.test.js` additionally requires an explicit, distinct ending calibration for the new active Life Story role.
