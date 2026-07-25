# HG Social — backend target contract

Status: **transitional contract-only target**  
Sist kontrollert: **2026-07-25**

Dette dokumentet beskriver en mulig framtidig backendgrense for HG Social. Det implementerer ikke backend, produksjonsdiscovery, autentisering, database, varslinger eller moderasjonsruntime.

Dagens aktive Social-runtime er lokal og privacy-safe. Produksjonsdiscovery skal fortsatt returnere `backend_not_enabled` fram til identity-, invite-, block/report/moderation-, retention-, deletion- og privacykravene er implementert og verifisert server-side.

`backend-ready` skal bare forstås som at lokale objekter og planlagte API-felter kan brukes som migreringsgrunnlag. Det betyr ikke at en produksjonsbackend finnes.

## Hard boundaries

En framtidig backend må aldri lagre eller eksponere GPS, live presence, visit history, last seen, nearby people, follower graph eller public activity feed. Sosiale objekter skal være knyttet til eksplisitte kunnskapshandlinger: profilvalg, matchforespørsler, meet invites, circles, blocks og reports.

## Målendepunkter

Endepunktene nedenfor er kontraktskisser. De finnes ikke som aktiv History GO-backend gjennom dette dokumentet.

### `POST /profile`

Oppretter eller oppdaterer brukerens kunnskapsprofil og privacy settings etter autentisering, samtykke og server-side validering.

Planlagt request body: `displayName`, `bio`, `avatar`, `badges`, `completedEmner`, `coreConcepts`, `interests`, `privacySettings`.

### `GET /profile/:id`

Returnerer en profil bare når server-side `canSeeProfile(viewerId, id)` består.

### `POST /match/query`

Returnerer kunnskapsmatcher bare når begge sider tillater `visibleInMatchLists`, ingen blokkering finnes og moderation/discovery-policyen tillater paret.

### `POST /meet/invite`

Oppretter en context-bound, preset-only pending invite bare når identity-, privacy-, block-, moderation-, duplicate- og rate-limit-kontroller består.

### `POST /meet/respond`

Aksepterer, avslår eller avbryter en invitasjon etter server-side lifecycle-validering. Retention og sletting skal følge den vedtatte serverpolicyen, ikke bare lokale demo-regler.

### `POST /circle/create`

Oppretter en learning circle med eksplisitte medlemmer, focus domains og eventuelle valgte knowledge contexts. Context er tematisk og skal ikke brukes som lokasjonssporing.

### `POST /circle/join`

Legger til et medlem bare når privacy, block, moderation, invite og membership-regler består.

### `POST /block`

Oppretter en privat block-relasjon og håndhever gjensidig usynlighet server-side.

### `POST /report`

Oppretter en privat moderation report med strukturerte reason codes. Reporteridentitet, private notater og sikkerhetsmetadata skal ikke lekke til deltakeroverflater.

## Lokal overgangsmodell

Klienten eksponerer `window.HG_SOCIAL_INDEX` som en lokal overgangs-/demomodell for profiler, matcher, invites, confirmed meets, trust, circles, shared routes, shared quiz, shared observations, blocks, reports og privacy settings.

Denne indeksen er ikke backend-storage, ikke produksjonsdiscovery og ikke en autoritativ serverdatabase.

## Relaterte kontrakter

- [`HG_SOCIAL_README.md`](./HG_SOCIAL_README.md) — produktoversikt og terminologi
- [`HG_SOCIAL_PRIVACY_RULES.md`](./HG_SOCIAL_PRIVACY_RULES.md) — bindende privacy-policy
- [`HG_SPOTMEETING.md`](./HG_SPOTMEETING.md) — aktiv Spotmeeting-produktkontrakt
- [`HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`](./HG_SOCIAL_MEET_IDENTITY_CONTRACT.md) — framtidig identity-grense
- [`HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`](./HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md) — framtidig invite/persistence-grense
- [`HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`](./HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md) — framtidig safety- og moderation-grense
- [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md) — dagens aktive lokale runtimekontrakt
