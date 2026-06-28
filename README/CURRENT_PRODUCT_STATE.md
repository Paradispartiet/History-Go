# Current Product State – History Go

This document summarizes what History Go currently is after HG Social v3, Civication Home/Nabolag gameplay, Runtime Health, Min dag, and the Norge før 1500 quiz activation.

It is a product/state README only. It does not define new features, runtime behavior, gameplay rules, or data manifests.

## 1. What History Go is now

History Go is a playable, local-first history learning app. The core product combines a map of places and people, quiz-driven knowledge progression, profile/progress surfaces, Civication life/career systems, and privacy-safe social read-models.

The app is currently best understood as:

- a **map and knowledge game** where players explore places, people, routes, quizzes, observations, badges, and learning logs;
- a **local Civication layer** where career, role, economy, home/nabolag, daily workday, psyche, shop/profile, and mail/storylet systems affect the player's status;
- a **safe dashboard layer** through `Min dag`, which summarizes suggested next actions from existing read-models without mutating gameplay;
- a **backend-ready but not backend-enabled social layer** where HG Social is knowledge-based, privacy-guarded, and currently local/demo for visible discovery surfaces;
- a **runtime diagnostics layer** that reports readiness and smoke-test status without creating gameplay state.

## 2. What the player can currently do

A player can currently:

- open the main app, view the map, and interact with places, people, routes, profile, and quiz entry points;
- complete manifest-based quizzes and build local knowledge/progression state;
- earn or inspect learning-related progress through profile, badges/merits, concepts, observations, and learning logs;
- use Civication systems for role/career progression, mail/workday interactions, economy/capital context, profile/shop visibility, and Home/Nabolag status;
- choose and inspect Home/Nabolag state where rent pressure, housing status, unlocks, move rules, rent due/paid state, and support eligibility are real gameplay state;
- open `Min dag` as a player-facing hub that reads current state and suggests safe next actions;
- inspect runtime health and subsystem readiness through read-only debug helpers;
- in TEST_MODE/demo contexts, inspect seeded HG Social demo matches, profiles, invites, circles, and smoke-test panels.

## 3. What is real gameplay

Real gameplay currently includes:

- **Map/place/person exploration:** runtime `PLACES`, `PEOPLE`, map markers, PlaceCard/popup surfaces, nearby/collection/gallery/profile views, and route viewing/activation where implemented.
- **Quiz/knowledge/progression:** `QuizEngine`, manifest-based quiz loading, quiz history/progress, learning logs, knowledge/trivia saving, insights, unlock hooks, badge/merit/profile updates, and Norge før 1500 quiz batches where active through the quiz manifest.
- **Civication:** career/roles/jobs, merits, task results, mail/storylets, workday/day phases, calendar, economy/capital, identity/psyche, shop/profile visibility, and local progression state.
- **Home/Nabolag:** `civi_home_v1` state for current district, unlocked districts, movement eligibility, move history, rent due/payment markers, rent pressure, housing status, eviction warnings, and support eligibility.
- **Min dag:** a real product surface for reading current state and routing to safe existing surfaces. It is not a gameplay owner; it coordinates what already exists.
- **Runtime health:** a real diagnostic system for readiness and playability interpretation. It is not gameplay.

## 4. What is read-only/debug/demo

The following are read-only, debug, or demo surfaces rather than gameplay owners:

- `HG_RuntimeHealth` snapshots and health reports. They aggregate readiness from map/core/profile/learning/Civication/HG Social without mutating state.
- `HG_CiviDebug` snapshots and health reports. They inspect Civication state and readiness without changing wallet, home, inbox, profile, shop, economy, DOM, or localStorage.
- `CivicationHome.getHomeSnapshot()` and `CivicationHome.getDistrictViewModels()`. They inspect Home/Nabolag state and district models without changing rent, moves, prices, or capital.
- HG Social public-profile preview, match graph, surface contract, and signal summaries. These are privacy-safe local read-models, not backend discovery.
- HG Social demo profiles/matches/invites/circles/shared activities. These are seeded local demo objects, not real users or production social graph state.
- `Min dag` snapshots, explanations, and safe action cards. They read and route; they do not complete quizzes/routes, run economy ticks, buy items, move homes, publish profiles, create real invites, or unlock places.

## 5. What is TEST_MODE only

TEST_MODE-only surfaces are enabled by `localStorage.getItem("HG_TEST_MODE") === "1"` unless a document names a narrower demo flag.

TEST_MODE-only includes:

- `HG_RuntimeSmokeRunner` manual smoke checks;
- `HG_RuntimeHealthPanel` in-app runtime health panel;
- HG Social demo sandbox, demo adapter, demo PlaceCard social block, demo profile card, demo panel, and seeded demo candidates;
- TEST_MODE-only clear/reset helpers such as social demo action reset, match graph cache reset, public profile preview clear controls, agenda reset, and daily progress clear;
- safe demo routes such as `open_social_demo` from `Min dag` / action routing.

These tools must not create real users, real social graph edges, production invites, route completions, quiz completions, observations, economy ticks, home moves, unlocks, or backend publication.

## 6. Current major systems

### Map / place / person

The map and place/person layer is the main exploration surface. It owns map rendering, markers, place/person cards, nearby/collection/gallery/profile views, routes, geo helpers, and related UI interactions. Runtime data is loaded through manifest/data systems and exposed through the app's existing globals and read-models.

### Quiz / knowledge / progression

The quiz layer is manifest-based and ID-based. It records quiz history/progress and drives knowledge, trivia, insights, unlocks, profile updates, and learning logs through existing hooks. Quiz activation, including Norge før 1500 batches, should remain manifest-driven and must not be bypassed by ad-hoc loading.

### Civication

Civication is the local life/career simulation layer. It covers roles, jobs, merits, capital/economy, identity, psyche, lifestyle/shop/profile context, calendar, tasks, mail/storylets, workday/day phases, and debug health. The workday has one authoritative day rhythm and phase ownership model.

#### Civication daily phase bundles

Civication now uses a phase-bundle day rhythm for the existing workday/day-phase flow. A phase bundle can deliver multiple required or optional mail/workday items in the same phase, and the UI surfaces those bundle items as cards with actions for opening, answering, skipping optional items, marking generated read-only items handled, or advancing only when the phase is ready. Required items can block phase advancement until they are opened and answered or otherwise handled. Read-only generated items can be marked handled, while choice items still require answers through the normal mail/action flow. This fix did not add a new engine, calendar, runtime, manifest path, or parallel day rhythm; it only makes the existing phase-bundle flow visible and actionable in the UI.

### Home / Nabolag

Home/Nabolag is implemented gameplay inside Civication. District choice affects rent pressure, housing status, movement eligibility, weekly rent due/paid state, and support/eviction warnings. It reads existing PC/economic capital and stores home state in `civi_home_v1`.

### HG Social

HG Social v3 is backend-ready and privacy-guarded, but visible discovery is currently local/demo rather than production backend discovery. It is a knowledge graph social layer, not a location graph. It supports signals, public-profile preview, match graph, demo profiles/matches/invites/circles/shared activities, moderation/privacy contracts, and smoke checks.

### Runtime Health

Runtime Health is a top-level read-only readiness system. It reports whether the app is playable by checking core globals, map readiness, data counts, profile/learning-log availability, Civication diagnostics, and HG Social diagnostics. The smoke runner and health panel are TEST_MODE-only.

### Min dag

`Min dag` is the player-facing daily hub. It reads existing state from Today Hub, Civication, learning, social, route, observation, profile, runtime health, agenda, and daily progress systems. Its action router only allows safe read-only or navigation-style actions and blocks mutating actions.

### Norge før 1500 quiz batches

Norge før 1500 quiz batches are treated as active quiz content when present through the existing quiz manifest and QuizEngine path. They are part of the real quiz/knowledge/progression loop, not a separate gameplay rule system.

## 7. Privacy rules

History Go's current social/product privacy rules are strict:

- no GPS social graph;
- no live location;
- no nearby-people discovery;
- no followers/following metrics;
- no public activity feed;
- no public visit history;
- no last-seen/presence status;
- no backend user discovery until a production social backend explicitly implements the privacy contract;
- no demo users inserted into `PEOPLE`, real profile storage, real social storage, or production data.

Social matching and public profile previews must remain knowledge-based and explainable through themes, concepts, badges, routes, quizzes, observations, and explicit settings.

## 8. Current status

- **Playable core:** yes. The app has a playable local core across map/place/person exploration, quiz/knowledge/progression, profile/progress surfaces, Civication, Home/Nabolag, Min dag, and runtime readiness checks.
- **Local/demo social:** yes. HG Social has backend-ready contracts, privacy rules, local signals/read-models, demo profiles/matches/invites/circles, and TEST_MODE smoke/debug panels.
- **Backend not enabled for real social discovery:** yes. Production social discovery is not enabled. Outside TEST_MODE/demo, match graph discovery returns an explicit backend-not-enabled status unless future safe public candidates are provided.

## 9. Next recommended product steps

Recommended next steps, without adding them in this document:

1. Decide the production launch scope for `Min dag`: which read-only cards are default, which stay debug, and what the first-time player sees.
2. Add a product QA checklist for the playable core: map load, quiz completion, knowledge save, profile update, Civication health, Home/Nabolag state, Min dag open, and runtime health.
3. Define acceptance criteria for Norge før 1500 quiz batches: manifest inclusion, ID validity, quiz completion, knowledge logging, and profile/progression visibility.
4. Keep HG Social backend work behind the existing privacy/backend contract until real authentication, consent, public profile publishing, moderation, and discovery rules are implemented.
5. Separate production UI from TEST_MODE/demo panels so demo social and diagnostics remain useful but impossible to confuse with live social discovery.
6. Maintain the read-only boundary for Runtime Health, Civication debug helpers, Min dag read-models, and social preview/match graph surfaces.

## Source docs

- [SYSTEM_MAP.md](./SYSTEM_MAP.md)
- [SYSTEM_REGISTRY.md](./SYSTEM_REGISTRY.md)
- [IMPLEMENTATION_STATUS.md](../docs/IMPLEMENTATION_STATUS.md)
- [HG_SOCIAL_ARCHITECTURE.md](../docs/HG_SOCIAL_ARCHITECTURE.md)
- [HG_SOCIAL_DEMO_MODE.md](../docs/HG_SOCIAL_DEMO_MODE.md)

## HG Spotmeeting v1

HG Spotmeeting is the productized knowledge-meeting flow for the former HG Social meet-invite demo layer. It is a voluntary, private-by-default request to meet around a History Go place, route, quiz, observation, circle, or topic. It uses preset Norwegian messages only and remains knowledge/activity based, not location based.

Production discovery is not backend-enabled yet: real spotmeeting requires a future privacy-reviewed backend. In `HG_TEST_MODE`, seeded HG Social demo candidates can be used for local QA without adding demo users to `PEOPLE`.
