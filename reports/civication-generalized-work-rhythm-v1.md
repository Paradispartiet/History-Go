# Civication generalized work rhythm v1

Dato: 2026-08-24
Status: implementert capability-slice; bred rolle-rollout er ikke åpnet

## Resultat

Denne endringen legger realistisk arbeidsrytme inn i den eksisterende Scene Pipeline uten en ny dagmotor, scene-eier eller state-store.

`work_context` kan nå deklarere:

- frist som dag/fase;
- eksplisitt blocker-objekt;
- venting på en aktør;
- håndoff til en aktør;
- lav/normal/høy/urgent prioritet;
- avbrudd;
- rework av en tidligere scene eller work-object-transition.

`CivicationWorkRhythm` evaluerer signalene rent og deterministisk. SceneDirector beholder eierskapet til kandidater. Daily- og workday-adapterne bruker samme evaluator, slik at en eksplisitt blokkert scene ikke kan lekke inn som daily extra mens deadline, priority og interrupts gir stabil rangering blant kvalifiserte scener.

## Semantiske grenser

- `blocked_by_object_id` holder scenen utilgjengelig til blocker-objektet er lukket. Manglende blocker feiler lukket.
- `waiting_for_actor_id` gjør en authored waiting-beat tilgjengelig bare mens minst ett referert arbeidsobjekt faktisk er `pending`, `waiting` eller `awaiting_*`.
- rework blir tilgjengelig bare når referert scene/event finnes i samme arbeidsobjekts append-only historikk.
- handoff beskriver arbeidsflyt, men gir ingen myndighet; authority-resolveren er fortsatt eneste eier av formelt handlingsrom.
- frist, priority og interrupts endrer rekkefølge, ikke sceneinnhold, autoritet eller persistent object state.
- scener uten rhythm-signaler og gamle saves uten `work_world` beholder tidligere adferd.

## Produksjonsbevis

Den eksisterende By-rådgiver-piloten bruker canonical role-owned kataloger til å bevise:

1. godkjenningsforespørselen har dag/fase-frist og eksplisitt lederhandoff;
2. History Go-arbeidet blir en reell waiting-beat mens Lillebekk-saken står `awaiting_approval`;
3. lederens svar er et prioritert avbrudd;
4. retur til saken krever både tidligere godkjenningsscene og den konkrete `ready_after_approval`-transitionen;
5. formell oversendelse får deadline-pressure, men authority-kontrakten må fortsatt tillate handlingen.

Ingen `_realism_`-sidekatalog eller ny Scene Pipeline er opprettet.

## Verifikasjon

Permanente kontroller:

- `tests/civication-generalized-work-rhythm.test.js` — schema/compiler-parity, legacy default, blocker, waiting, handoff, rework, deadline, interrupt, stabil rangering og faktisk By-pilotsekvens;
- `tests/civication-compiled-scene-registry.test.js`;
- `tests/civication-compiled-scene-registry-parity.test.js`;
- `tests/civication-scene-director-daily-catalog.test.js`;
- `tests/civication-by-radgiver-role-world-realism-pilot.test.js`;
- full `tests/run-civication-tests.mjs` i CI med installerte avhengigheter;
- TypeScript/typecheck-baseline og repository hygiene i CI.

Registry-materialisering er deterministisk og beholder 1115 scener, 44 roller, 345 compiled source-filer og 0 shadowed duplicates.

## Seksdelt kvalitetsvurdering

| Dimensjon | Score | Evidens |
|---|---:|---|
| Korrekthet og evidens | 5/5 | Runtime-reglene testes mot ekte work-object-status/historikk og den fullførte By-pilotsekvensen. |
| Dekning og ferdigstillelse | 5/5 | Alle avtalte v1-signaler valideres, kompileres, bevares i compatibility projection og konsumeres av primary/daily selection. |
| Faglig/redaksjonell kvalitet | 4/5 | Pilotmetadata følger den konkrete Lillebekk-sakens lederlinje, frister og rework; ingen generisk masseproduksjon er lagt til. |
| Teknisk integritet | 5/5 | Ren evaluator, fail-closed referanser, stable sort, registry parity og eksisterende SceneDirector-eierskap. |
| Sikkerhet og ansvarlighet | 4/5 | Handoff/rhythm gir ikke autoritet; gamle saves tåles; ingen sensitive eller virkelige persondata introduseres. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Ett lite UMD-helperlag, strengt schema/compiler-sett, eksplisitt loaderrekkefølge og permanent semantisk test. |

Total: **28/30 — høy kvalitet**, forutsatt grønn clean-head CI. Automatiske tester beviser kontrakt og determinisme, men ikke at framtidige roller har yrkesspesifikk rytme; det krever den planlagte strukturelt annerledes piloten før programfasens fulle exit.

## Neste steg

Neste separate capability-slice er situert omdømme/relasjonell tillit. Deretter skal en strukturelt annerledes pilot bevise ulik arbeidsrytme før Role World Realism Matrix og bred rollout vurderes.
