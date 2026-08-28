# Civication Media Redaksjonell Ledelse Role World rollout — source-first

Dato: **2026-08-28**

Rolle: `media/media_redaksjonell_ledelse`

Canonical base ved branch-opprettelse: `d7df63338836d32281e5a5a272bdfa3c62729a03`

## Readiness

Canonical readiness peker på rollen som `next_required_pr` og krever kun:

- `situated_reputation`

Rollen er allerede `rollout_ready`; ingen blockers er registrert. Cross-role-status er `proven_when_shared_work_is_material`.

## Eksisterende canonical grunnlag som skal gjenbrukes

Rollen har allerede:

- work grammar for Redaktør, Sjefredaktør og Nyhetsleder;
- 8-trinns mailplan;
- authored mail i alle ni mailtyper;
- konkret prioritering, status/ansvar, uavhengighet, evidens, reprioritering, versjonskontroll, rettelse og konsekvens;
- runtime-gate `playable`;
- tre canonicale media-arbeidsflater;
- et allerede runtime-bevist cross-role shared publication case med `media/media_redaksjon`, der samme `media_redaksjon_publication_case_001` kan vurderes fra lederrollen uten privilege leakage.

Cross-role-piloten er derfor provenance og institusjonell realisme, ikke ny rollout-gjeld. Denne PR-en skal ikke lage en ny shared-world-motor, et nytt work object eller nye myndighetsregler.

## Presis mangel

Det som mangler er at omdømme/tillit eksplisitt er **situert**. En redaksjonell leder skal ikke ha ett globalt reputation-tall som gjør alle relasjoner like. Den samme beslutningen kan øke tilliten hos én aktør og svekke den hos en annen:

- reportere vurderer om mandat, rework og kreditt håndteres redelig;
- desk/vaktsjef vurderer om status, kapasitet og beslutninger kommer tidsnok;
- sjefredaktør/øverste redaktørnivå vurderer om risiko, uavhengighet og beslutningsspor er styrbare;
- kilder og berørte vurderer redaksjonell uavhengighet og om ledermakt brukes til å gjøre svakt belegg sterkere;
- publikum vurderer åpenhet, presisjon og rettelseskultur;
- privat relasjon møter personen bak lederrollen, ikke den formelle statusen.

Standing skal være editorial-only fram til eventuell separat runtime-governance. Den skal aldri erstatte formell redaktørmyndighet, evidensstyrke eller authority-resolveren.

## Scope-beslutning

Denne rollouten skal derfor:

1. beholde eksisterende 8-trinns plan uendret;
2. beholde eksisterende mailkataloger uendret;
3. gjenbruke de ni ordinære authored mailene samt den eksisterende cross-role shared-case-scenen som provenance;
4. materialisere 14 dager × 4 faser med situated reputation som eneste nye authored realism-dimensjon;
5. beskrive minst fire uavhengige standing-akser med konkrete audiences og forskjellige tegn på tillit;
6. bevare shared work ≠ shared privilege;
7. bevare Scene Pipeline og eksisterende runtime uendret.

## Authority-grense

Rollen kan prioritere, kreve dokumentasjon og koordinere publisering/rettelser innen faktisk rolle. Badge-poeng eller sosial standing kan ikke utvide mandatet, gjøre offentlig status til jobb eller hoppe over etablerte beslutningslinjer. I shared publication case kan lederen returnere saken for rework eller flytte den til redaksjonell beslutningsberedskap, men kan ikke overskrive reporterens evidens.

## Fail-closed plan

TEMP-materializer + streng rollout-test + TEMP-workflow skal først:

1. materialisere Role World-en;
2. regenerere scene registry, Career Gameplay Matrix og rollout readiness;
3. kjøre eksisterende media-redaksjonell-ledelse playability;
4. kjøre cross-role shared-world-testen;
5. kjøre ny streng situated-reputation rollout-test;
6. kjøre generiske Role World-/policy-gates;
7. kjøre full `npm run test:civication`;
8. fjerne TEMP-materializer og TEMP-workflow;
9. committe/pushe bare eksakt verifisert permanent resultat.

Ingen permanent canonical Role World skrives av agenten før denne gaten er grønn.