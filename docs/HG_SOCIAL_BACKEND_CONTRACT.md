# HG Social — backend documentation entry

Status: **operational compatibility-pointer**  
Sist kontrollert: **2026-07-25**

Denne filstien beholdes som inngang for eldre lenker. Den eier ikke en egen API-kontrakt og skal ikke brukes som bevis på at Social Meet er enten «bare demo» eller bredt produksjonsaktivert.

## Dagens sannhet

History GO har en implementert Python/FastAPI- og PostgreSQL-grense for Social Meet med:

- autentisert identitet og eksplisitt publisert læringsprofil;
- participant safety, block, report, export og deletion;
- moderator-/admin-kø, restrictions og appeals;
- abuse controls, rate limits, duplicate suppression og cooldowns;
- serverautoritativ Spotmeeting invite-lifecycle og cross-device sync;
- privacy-safe candidate discovery;
- typed FastAPI-klient og adaptergrense i nettleseren;
- retention, holds og privacy-safe observability.

Implementasjon betyr ikke automatisk bred produksjonsaktivering. Discovery, invite writes og destruktiv retention er fail-closed og krever eksplisitt deployment-konfigurasjon, private rollout-flagg og godkjent operativ prosedyre.

Aktiv implementasjonsinngang:

- [`../backend/README.md`](../backend/README.md)
- [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md)

## Kravkontrakter

Disse dokumentene definerer sikkerhets- og produktkrav. De implementerer ikke kode alene:

- [`HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`](./HG_SOCIAL_MEET_IDENTITY_CONTRACT.md)
- [`HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`](./HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md)
- [`HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`](./HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md)

Statusavsnitt i de opprinnelige kontraktene beskriver tidspunktet de ble skrevet. Gjeldende implementasjonsstatus leses fra backendinngangen og de konkrete slice-dokumentene nedenfor.

## Implementerte server- og klientslices

- [`HG_SOCIAL_MEET_MODERATION_BACKEND.md`](./HG_SOCIAL_MEET_MODERATION_BACKEND.md)
- [`HG_SOCIAL_MEET_ABUSE_CONTROLS.md`](./HG_SOCIAL_MEET_ABUSE_CONTROLS.md)
- [`HG_SPOTMEETING_INVITE_BACKEND.md`](./HG_SPOTMEETING_INVITE_BACKEND.md)
- [`HG_SOCIAL_MEET_CANDIDATE_DISCOVERY_BACKEND.md`](./HG_SOCIAL_MEET_CANDIDATE_DISCOVERY_BACKEND.md)
- [`HG_SOCIAL_MEET_FASTAPI_CLIENT.md`](./HG_SOCIAL_MEET_FASTAPI_CLIENT.md)
- [`HG_SOCIAL_MEET_RETENTION_OBSERVABILITY.md`](./HG_SOCIAL_MEET_RETENTION_OBSERVABILITY.md)

Identity- og participant-safety-slicene dokumenteres samlet i [`../backend/README.md`](../backend/README.md) og i migrasjonene `002_social_meet_identity_profiles.sql` og `003_social_meet_safety.sql`.

## Produkt- og privacyinnganger

- [`HG_SOCIAL_README.md`](./HG_SOCIAL_README.md) — produktoversikt og terminologi
- [`HG_SOCIAL_PRIVACY_RULES.md`](./HG_SOCIAL_PRIVACY_RULES.md) — bindende privacy-policy
- [`HG_SPOTMEETING.md`](./HG_SPOTMEETING.md) — Spotmeeting-produkt og lifecycle
- [`HG_SOCIAL_QA.md`](./HG_SOCIAL_QA.md) — privacy guards og QA
- [`HG_SOCIAL_DEMO_MODE.md`](./HG_SOCIAL_DEMO_MODE.md) — eksplisitt lokal TEST_MODE/demo

## Historiske overgangsdokumenter

- `docs/HG_SOCIAL_MEET_BACKEND_ROADMAP.md` er roadmap-snapshotet fra før slicene ble implementert.
- `docs/social-meet-backend.md` beskriver den tidlige direkte Supabase-foundationen før FastAPI-strangleren ble hovedgrensen for migrerte Spotmeeting-operasjoner.

De kan brukes som historikk, men skal ikke overstyre dagens backendinngang, kravkontrakter, implementasjonsdokumenter eller runtimekode.

## Hard grense

Social Meet skal fortsatt ikke bruke eller eksponere GPS, live location, nearby people, distance-to-person, last seen/presence, followers/feed, offentlig besøkshistorikk, passiv tracking eller fri chat.
