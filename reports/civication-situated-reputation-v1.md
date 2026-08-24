# Civication situert omdømme og relasjonell tillit v1

Dato: 2026-08-24
Status: implementert capability-slice; bred rolle-rollout er ikke åpnet

## Resultat

Denne endringen legger et avgrenset, situert tillitskart til eksisterende Civication-state uten å erstatte `career.reputation`, NPC-karaktertråder, SceneDirector eller myndighetsmodellen.

Canonical audience-IDs må være authored og tilhøre én av fire tillatte kontekster:

- `manager:<id>`;
- `team:<id>`;
- `professional:<id>`;
- `public:<context>`.

`CivicationSocialStanding` lagrer bare akser som en scene faktisk bruker. Verdier er begrenset til `-100…100`; hver endring har stabil `event_id`, årsak, tidspunkt og valgfri aktørreferanse. Replay er idempotent, historikken er begrenset, og ukjente audience-prefikser feiler før state muteres.

## Runtime og grenser

- `social_standing_ops` er en additiv choice/scene-effekt som kjøres gjennom eksisterende `dayConsequences`-handler.
- `social_standing_context.requirements` porter primary work scenes og daily extras gjennom samme rene evaluator.
- `reaction_audience_id` lar `dayNpcReactions` lese den relevante relasjonen etter at konsekvensen er anvendt.
- `career.reputation` beholdes urørt som legacy/globalt sammendrag; situert standing summeres ikke til en sosial score.
- standing påvirker ikke authority-resolveren og kan derfor verken gi godkjenning, mandat eller utvidet formell myndighet.
- gamle saves får et tomt additivt map og beholder tidligere sceneadferd når ingen standing-krav finnes.

## Produksjonsbevis — Lillebekk

By-rådgiverpiloten legger to nye plansteg mellom kunnskapsforankret rework og formell oversendelse:

1. Spilleren velger hvordan faglig uenighet skal følge Lillebekk-saken.
2. Synlig, navngitt dissens gir `team:lillebekk_planteam = +3` og `manager:elin_plansjef = -2`.
3. Et samordnet notat med full uenighet i intern historikk gir leder `+3` og team `-3`.
4. Første gren åpner bare Signes teamtillits-scene.
5. Andre gren åpner bare Elins ledertillits-scene.
6. Begge scenene sier eksplisitt at tillit gir informasjonsflyt eller tidligere arbeidsansvar, ikke ny myndighet.
7. Den eksisterende godkjennings- og oversendelseskontrakten forblir eneste eier av formell handling.

## Verifikasjon

Permanente kontroller:

- `tests/civication-situated-reputation.test.js` — additive defaults, idempotens, bounded state, ugyldig audience, motstridende branch-resultater, sceneporting, faktisk consequence-handler, faktisk NPC-reaksjon, compiler/parity og planrekkefølge;
- `tests/civication-by-radgiver-role-world-realism-pilot.test.js` — eksisterende work-object/authority/History Go-vertikal;
- `tests/civication-by-radgiver-role-world.test.js` — canonical rolledybde, plan og career matrix;
- compiled scene registry og parity;
- full Civication-suite, TypeScript/typecheck-baseline, repository hygiene og documentation governance i clean-head CI.

Registry-materialisering: 1118 scener, 44 roller, 345 compiled source-filer og 0 shadowed duplicates. Career Gameplay Matrix forblir 5 `reference_complete`, 35 `playable`, 0 `partial` og 45 `architecture_only`; denne capability-slicen utgir seg ikke for bred rollout.

## Seksdelt kvalitetsvurdering

| Dimensjon | Score | Evidens |
|---|---:|---|
| Korrekthet og evidens | 5/5 | To isolerte playthrough-grener gir eksakt motsatte manager/team-verdier og eksakt én kvalifisert senere scene. |
| Dekning og ferdigstillelse | 5/5 | State, schema, compiler, compatibility projection, consequence-handler, primary/daily selection, NPC-reaksjon og canonical pilot er dekket. |
| Faglig/redaksjonell kvalitet | 5/5 | Lillebekk-konflikten skiller legitim leveransekontroll fra legitim faglig dissens uten å gjøre leder eller kolleger til karikaturer. |
| Teknisk integritet | 5/5 | Ren evaluator, stabil idempotens, preflight, bounds, fail-closed audience-taksonomi og eksisterende runtime-eiere. |
| Sikkerhet og ansvarlighet | 5/5 | Ingen sosial score, authority leakage, sensitive data eller oppdiktede virkelige personer; global reputation beholdes urørt. |
| Vedlikeholdbarhet og etterprøvbarhet | 4/5 | Kontrakten er liten og auditérbar, men audience-taksonomien bør bevises i en strukturelt annerledes pilot før den utvides. |

Total: **29/30 — svært høy kvalitet**, forutsatt grønn clean-head CI.

## Neste steg

Neste separate PR skal være en strukturelt annerledes rollepilot. Den må bevise en annen arbeidsrytme og andre relasjonelle konsekvenser før en Role World Realism Matrix eller bred rollout opprettes.
