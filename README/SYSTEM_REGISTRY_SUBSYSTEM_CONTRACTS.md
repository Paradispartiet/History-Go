# History GO — aktive subsystemkontrakter

Status: **canonical subsystem contracts**  
Owner: History GO runtime subsystems  
Last verified: **2026-07-25**

Dette dokumentet inneholder aktive kontrakter som tidligere lå etter legacyblokken i `SYSTEM_REGISTRY.md`. De er flyttet hit for å bevare gjeldende regler uten å gjøre den historiske pre-split-filen bindende.

Les også:

- [`SYSTEM_REGISTRY.md`](./SYSTEM_REGISTRY.md) — overordnet runtime-eierskap og kjernegrenser
- [`SYSTEM_MAP.md`](./SYSTEM_MAP.md) — runtime-flyt og modulkjeder
- [`archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md`](./archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md) — historisk pre-split-snapshot, ikke bindende

---

## Observations (`HGObservations`)

**Status:** Aktiv  
**Type:** Brukerobservasjoner / feltarbeid  
**Lagring:** `localStorage → hg_learning_log_v1`

Observations gir brukeren mulighet til å registrere **egne tolkninger og inntrykk** av steder og personer som supplement til quiz-basert kunnskap.

Dette er **empirisk, situert data** – ikke verifisert fakta.

### Dataskjema (learning log event)

```json
{
  "schema": 1,
  "type": "observation",
  "ts": 1730000000000,
  "subject_id": "by",
  "categoryId": "by",
  "targetType": "place | person",
  "targetId": "place_id | person_id",
  "lens_id": "by_brukere_hvem",
  "selected": ["barnefamilier", "pendlere"],
  "note": "Valgfri tekst"
}
```

## Knowledge, fagstruktur og progresjon

Aktiv ansvarsdeling:

- Merker: toppnivå-fagfelt/kategori.
- Fagkart og pensum: faglig struktur, progresjon og produksjonsgrunnlag.
- Emner: faglige beholdere for knowledge units, begreper, termer, metoder og historier.
- Quiz/observasjon/notat: formidlings- og evidensgeneratorer med ulike sannhetsnivåer.
- `hg_learning_log_v1`: supplerende hendelses-/evidenslogg.
- `hg_knowledge_memory_v1`: quizens bundle-, lesings- og vurderingslager; synkroniseres til V2.
- `hg_knowledge_entries_v2`: varig, søkbar personlig Knowledge-read-model.
- Courses (`HGCourses`): tolker evidens og beregner modulstatus/diplom uten å opprette ny fagstruktur.
- Profile/Knowledge UI: leser eksisterende modeller og skal ikke definere nye storage- eller progresjonssannheter.

Canonical Knowledge-rekkefølge:

1. [`../docs/KNOWLEDGE_ARCHITECTURE.md`](../docs/KNOWLEDGE_ARCHITECTURE.md)
2. [`../data/knowledge/knowledge_system_policy_v1.json`](../data/knowledge/knowledge_system_policy_v1.json)
3. [`../data/knowledge/knowledge_unit_schema_v1.json`](../data/knowledge/knowledge_unit_schema_v1.json)
4. [`../data/quiz/quiz_knowledge_delivery_contract_v1.json`](../data/quiz/quiz_knowledge_delivery_contract_v1.json)
5. `js/knowledgeV2.ts` og `js/knowledgeQuizMemory.ts`
6. relevante storage- og browsertester

`knowledge_universe` er en legacy-importkilde. Den migreres til `hg_knowledge_entries_v2` og skal ikke gjeninnføres som parallell aktiv storage. Eldre UI kan få en avledet legacy-projeksjon fra V2.

`structure_*.json`, den gamle seksnivå-ontologien og knaggeregistermodellen er tatt ut av aktiv Knowledge-arkitektur. Historiske kopier ligger i rapportarkivet og kan ikke overstyre canonical policy, schema, runtime eller tester.

Reading og mastery er separate påstander. Et feil svar kan dokumentere at innholdet er møtt/lest og markere repetisjonsbehov, men kan ikke gi mestring.

---

## Civication wallet and shop inventory contracts

- Canonical PC wallet: `CivicationState` using `hg_civi_wallet_v1`.
- Legacy PC wallet: `hg_pc_wallet_v1` is a mirror only and must not be treated as canonical.
- Canonical shop inventory: `HG_CiviShop` using `hg_pc_inventory_v1`.
- Inventory shape: `packs`, `ownedItems`, and `style_counts`.
- Profile/shop renderers may read these contracts but must not redefine wallet logic, inventory logic, badge gating, prices, or data.

## Civication shell/day/debug loader contract

- `Civication.html` loads Life Story / Min dag first, then `js/Civication/civicationShellLoader.js` as the standard Civication loader.
- Civication shell is the main product: map, dashboard, capital, psyche, identity, home/neighborhood, public layer, people, store, role panel, footer/panel navigation, and robust empty panel states. These surfaces are not legacy.
- Life Story / Min dag is the primary storytelling panel inside the shell, not the whole app.
- Day/mail is a separate layer inside the shell, loaded from `DAY_SCRIPTS` after shell boot; failures there must not show the shell boot-error state after the shell is up.
- Full legacy/debug is explicit via `Civication.html?civicationLegacy=1`, which enables heavy canvas/3D/debug scripts from `LEGACY_DEBUG_SCRIPTS`.
- `js/Civication/civicationLegacyLoader.js` remains only as a compatibility wrapper/alias for older tests or console usage.

## Civication debug helper contract

- `window.HG_CiviDebug` is an allowed global exposed by `js/Civication/CivicationBoot.js` for browser-console inspection only.
- Allowed methods: `snapshot()`, `print()`, `health()`, and `printHealth()`. These may be asynchronous and must be safe to call with `await`.
- Debug helpers must be read-only. They must not mutate Civication state, wallet state, shop inventory, inbox, profile state, localStorage contents, UI, gameplay flow, or create new storage keys.
- Debug helpers must handle missing runtimes, malformed localStorage, and failed visible-pack/store loading defensively.
- `HG_CiviDebug.health()` reuses the debug snapshot and returns `{ ok, score, checks, blockers, warnings, summary, timestamp }`.
- `HG_CiviDebug.printHealth()` prints the health report compactly and returns the same object; it must not add UI, mutate state, or change rendering.

## Civication economy snapshot contract

- `window.HG_CiviEconomySnapshot` is an allowed read-only global exposed by `js/Civication/core/civicationEconomyEngine.js` for browser-console and debug inspection.
- The snapshot may combine wallet/job/home/shop data to explain current PC economy, but it must not mutate wallet, home, capital, shop, career state, localStorage contents, or gameplay flow.
- Economy snapshots must handle missing runtimes and unavailable visible packs defensively.

## Civication Home / Nabolag gameplay v1

**Status:** implemented  
**Purpose:** makes district/home choice affect rent pressure, housing status and progression.

- `window.CivicationHome.unlockDistrict(districtId, reason)` records district unlocks in `civi_home_v1`.
- `window.CivicationHome.canMoveToDistrict(districtId)` returns whether a district can be moved into and why it is blocked.
- `window.CivicationHome.moveToDistrict(districtId)` updates current home district and move history when the district is unlocked/available.
- `window.CivicationHome.applyRentTick(force)` applies weekly rent using existing PC/economic capital and updates rent due/housing status.
- `window.CivicationHome.getHomeSnapshot()` includes current district, rent pressure, rent due, unlocked ids, available/blocked moves, housing status, and support eligibility.

---

## HG Social Demo visible surfaces

`window.HG_SocialDemo` is a TEST_MODE-only, demo-only, privacy-safe sandbox API.

- `HG_SocialDemo.sendDemoInvite({ toUserId, placeId, presetMessageId })` writes or updates only demo invites in `hg_social_demo_state_v1`; it is not production data and not a real social graph invite.
- `HG_SocialDemo.getPresetMessages()` returns the allowed preset demo invitation messages; no free text is accepted.

`window.HG_SocialDemoAdapter` is TEST_MODE-only and seeded-demo-only. It exposes `isEnabled`, place match readers, panel summary helpers, `renderPlaceSocialBlock`, `attachToPlaceCard`, and `detachFromPlaceCard` without mutating `PEOPLE`, `PLACES`, or real social storage.

`window.HG_SocialDemoProfile` is TEST_MODE-only and renders fake demo users only through `open`, `close`, and `renderCard`.

## HG Social Surface Contract Registry

- `window.HG_SocialSurfaceContract` is a read-only contract global exposed by `js/social/HGSocialSurfaceContract.js`.
- It exposes `getContract`, `getLabels`, `getActions`, `getPrivacyRules`, `validateSurfaceItem`, `normalizeReason`, and `normalizeAction`.
- Production social surfaces must follow this contract.
- Demo adapter, profile and panel remain TEST_MODE-only and must never mutate `PEOPLE`, real social storage, real profile storage, production auth, or production place/person data.
- `HG_SocialDemo.getActions()` returns the deterministic demo action log from `hg_social_demo_actions_v1`.
- `HG_SocialDemo.clearActions()` clears only the demo action log key.
- Demo invitations are preset-only and reject free text.

## HG Social Signals Registry

- `window.HG_SocialSignals` is the real, local, privacy-safe learning/social signal API. It exposes `recordSignal`, typed record helpers, `getSignals`, `getSummary`, `getPublicProfileSeed`, `clearSignalsForTestMode`, and `health`.
- `window.HG_SocialSignalBridge` is the event bridge for explicit player actions. It exposes `bind`, `unbind`, `isBound`, typed record-from-event helpers, and `health`.
- Storage: `hg_social_signals_v1` only. The model uses deterministic `seq` values, not exact timestamps.
- These APIs are not geolocation tracking, do not use passive proximity, and must not store live status, follower/following data, GPS/coordinates, backend users, or demo users.

Registered privacy-safe CustomEvents, all explicit-action only:

- `hg:quizCompleted` — emitted after successful quiz/set completion payloads with quiz/place/domain/concept/tag fields only.
- `hg:routeCompleted` — emitted only after an explicit route completion, never on route open.
- `hg:observationAdded` — emitted after a saved observation with tags/concepts/title-safe fields only, not raw note bodies.
- `hg:badgeEarned` — reserved for earned badge/merit tier payloads.
- `hg:placeAffinity` — reserved for explicit place unlock/visited/quiz-completion affinity, not GPS or passive map movement.

## HG Public Profile Read-model registry

- `window.HG_PublicProfileReadModel` provides `getSettings`, `saveSettings`, `isPublicEnabled`, `setPublicEnabled`, `getReadModel`, `getPreview`, `validate`, `health`, and `clearSettingsForTestMode`.
- `window.HG_PublicProfilePreviewPanel` provides `render`, `refresh`, `remove`, and `isEnabled` for the current user's local preview only.
- `hg_public_profile_settings_v1` stores local-only settings. It is not backend storage and is not global publication.
- Events `hg:publicProfileSettingsChanged` and `hg:publicProfilePreviewRefreshed` dispatch privacy-safe payloads containing only enabled state, signal count, and visible section flags.
- The model blocks GPS/live status/followers/last-seen/feed tracking fields and forbidden visible wording.

## HG Social Match Graph

### `window.HG_SocialMatchGraph`

Local-only, privacy-safe public-profile matching API.

- `buildSelfProfile()` reads `HG_PublicProfileReadModel.getReadModel()` and normalizes the local preview profile.
- `getCandidateProfiles()` uses seeded HG Social demo profiles only in `HG_TEST_MODE`; production returns `backend_not_enabled` unless future safe public local profiles are provided.
- `buildMatchGraph()`, `getMatches()`, `getMatchesForPlace()`, `getMatchReasons()`, `getSuggestedActivities()`, and `explainMatch()` produce deterministic knowledge-based suggestions.
- No backend, GPS, presence, follower/following metrics, last-seen values, distance, or real user discovery.
- Demo candidates remain `demoOnly:true` and must never be inserted into `PEOPLE`.

`window.HG_SocialMatchGraphPanel` is an optional local preview/debug panel. It does not call a backend.

`hg_social_match_graph_cache_v1` is reserved for derived, privacy-safe match results. It must not store raw private profile data, observations, exact timestamps, GPS/coordinates, presence, follower/following metrics, last-seen values, or visit logs.

---

## HG Today Hub / Min dag registry

- `window.HG_TodayHub` is exposed by `js/today/HGTodayHub.js`.
- Methods: `snapshot`, `getSections`, `getActions`, `getPriorityActions`, `health`, `explain`, and `refresh`.
- `window.HG_TodayHubPanel` exposes `render`, `refresh`, `remove`, and `isEnabled`.
- Status: read-only, local, no backend, no production auto-open.
- The hub reads existing models only and must not run economy ticks, start or complete routes/workdays, create observations, create invites, publish profiles, unlock anything, seed demo data, or alter localStorage during snapshot/health/render.
- Privacy status: local and knowledge-based. The hub blocks GPS, live status, followers/following, last-seen, passive tracking, and distance language.

## Min dag product surface / safe action router

- `window.HG_TodayActionRouter` is exposed by `js/today/HGTodayActionRouter.js`.
- The normal app entry point is `#btnMinDag` in `index.html`; it calls `window.HG_TodayHubPanel.render()`.
- `window.HG_TodayHubPanel.render(options?)` accepts optional context such as `{ context: { placeId, domain, sourceSurface } }` and remains local/read-only.

Supported safe route keys:

- `open_public_profile_preview`
- `open_match_graph`
- `open_social_demo` (TEST_MODE only)
- `open_runtime_health`
- `open_civication_summary`
- `open_workday`
- `open_home`
- `open_place`
- `open_route`
- `open_observation`
- `read_only`

Forbidden mutating route keys:

- `start_workday`
- `run_economy_tick`
- `complete_route`
- `complete_quiz`
- `save_observation`
- `send_real_invite`
- `publish_profile_backend`
- `unlock_place`
- `buy_item`
- `move_home`

Safety markers: safety-first, local-only, no GPS/live/followers, and no automatic gameplay mutation.

## HG Daily Objectives / Agenda registry

- `window.HG_DailyObjectives` is exposed by `js/objectives/HGDailyObjectives.js`.
- Local storage key: `hg_daily_objectives_v1`.
- Event: `hg:dailyObjectivesChanged` with a privacy-safe payload containing objective, completed, active, and blocker counts.
- Methods: `generate`, `getAgenda`, `saveAgenda`, `resetAgendaForTestMode`, `getObjectiveStatus`, `refreshStatus`, `completeObjectiveFromSignals`, `getSummary`, `health`, `pinObjective`, `dismissObjective`, and `restoreObjective`.
- Status: local-only, privacy-safe, no backend, and no gameplay mutation.
- Safe route keys include `open_public_profile_preview`, `open_match_graph`, `open_runtime_health`, `open_social_demo`, `open_today_explanation`, `open_place`, `open_route_viewer`, `open_observation_ui`, and `read_only`.

## HG Daily Progress / Dagens framgang

- `window.HG_DailyProgress` exposes `bind`, `unbind`, `isBound`, `recordProgressEvent`, `refreshFromSignals`, `getProgress`, `getSummary`, `clearProgressForTestMode`, and `health`.
- `window.HG_DailyProgressToast` exposes `show`, `hide`, and `isVisible`; it is non-blocking UI only, with no modal and no sound.
- Storage key: `hg_daily_progress_v1`.
- It stores deterministic sequence-based progress events only; no exact timestamps, GPS/coordinates, live status, relation lists/counts, or raw observation text.
- Event: `hg:dailyProgressChanged`, with payload `{ eventCount, completedObjectiveCount, lastEventType }`.
- Local-only, privacy-safe, no gameplay mutation, no backend.

---

## `window.HG_Spotmeeting`

`window.HG_Spotmeeting` is exposed by `js/social/HGSpotmeeting.js` for HG Spotmeeting v1. It owns local spotmeeting state in `hg_spotmeeting_v1` and provides config/state readers, context-based suggestions, preset-only invite creation, cancel/accept/decline/completion transitions, inbox/timeline readers, privacy scanning, and `health()` diagnostics. Production discovery is backend-not-enabled; TEST_MODE may use isolated HG Social demo candidates.

## `window.HG_SpotmeetingUI`

`window.HG_SpotmeetingUI` is the canonical user surface for starting a Kunnskapsmøte. It owns `#hgSpotmeetingSheet`, delegates all state to `window.HG_Spotmeeting`, shows demo candidates only in TEST_MODE, renders a backend-disabled state in production, and dispatches `hg:spotmeetingChanged` + `updateProfile` after an invite.

`window.openSpotMatchList` is a legacy wrapper into `HG_SpotmeetingUI.open(...)`. `window.HG_SpotmeetingPlaceCardDemo` is only a compatibility/demo wrapper. The footer has no Spotmeeting entry; follow-up runs through `window.HG_SocialMeetUI`.

## `window.HG_SocialMeetUI`

`window.HG_SocialMeetUI` is the canonical Social Meet surface for following up invitations, answers and meeting status. It owns `#hgSocialMeetSheet`, with status tabs read from `window.HG_Spotmeeting`'s inbox.

There is no chat, free text, live location, nearby, followers, feed, distance, last seen or auto-invites.

Product split:

- **Kunnskapsmøte** (`HG_SpotmeetingUI`) starts a concrete meeting.
- **Social Meet** (`HG_SocialMeetUI`) follows it up.
- **Profile** keeps settings/privacy/history and may link to Social Meet, but is not the only surface.

`HG_SocialMeetUI.open({ filter, placeId, sourceSurface })` supports the global menu, PlaceCard on-site context and Spotmeeting follow-up. It also renders the on-site status card under «På stedet».

Status: local-only, privacy-safe, no gameplay mutation, no backend.
