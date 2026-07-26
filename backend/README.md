# History GO backend

Status: **FastAPI-foundation, sju servereide Social Meet-slices og typed browsergrense er implementert. Participant-facing production rollout er fail-closed til eksplisitte gates aktiveres.**  
Sist kontrollert: **2026-07-25**

Canonical målarkitektur:

- [`../docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](../docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md)

Social-produkt og privacy:

- [`../docs/HG_SOCIAL_README.md`](../docs/HG_SOCIAL_README.md)
- [`../docs/HG_SOCIAL_PRIVACY_RULES.md`](../docs/HG_SOCIAL_PRIVACY_RULES.md)
- [`../docs/HG_SPOTMEETING.md`](../docs/HG_SPOTMEETING.md)

Dette er produksjonsservergrensen for History GO. Backend skal ikke duplisere lokal gameplay-state eller opprette parallelle domene- og datamodeller.

## Technology contract

- Python
- FastAPI
- Pydantic / pydantic-settings
- SQLAlchemy + psycopg 3
- PostgreSQL
- Supabase Auth/PostgreSQL/Storage der det er avgrenset
- pytest
- Ruff
- mypy strict mode

Klient og Node-tooling forblir TypeScript-/JavaScript-ansvar. Nye serverdomener skal ikke bygges som ad-hoc Node-tjenester uten egen arkitekturbeslutning.

## Shared foundation

Backendgrunnlaget omfatter:

- FastAPI application factory og `/api/v1`-grense;
- validert `HG_BACKEND_*`-konfigurasjon;
- liveness og dependency-aware readiness;
- lazy PostgreSQL/SQLAlchemy connection boundary;
- Supabase-tokenverifisering;
- request IDs;
- moderator-/adminroller fra verifisert serverkontrollert `app_metadata`;
- Ruff, strict mypy og pytest/coverage i CI.

## Social Meet implementation map

| Slice | Status | Migration / hoveddokument |
|---|---|---|
| Supabase foundation | Implementert grunnlag | `001_social_meet.sql`, [`../docs/social-meet-backend.md`](../docs/social-meet-backend.md) |
| Identity & Public Profile | Servereid | `002_social_meet_identity_profiles.sql`, identity-kravkontrakten |
| Participant safety, export & deletion | Servereid | `003_social_meet_safety.sql`, safety-kravkontrakten |
| Moderation & appeals | Servereid | `004_social_meet_moderation.sql`, [`../docs/HG_SOCIAL_MEET_MODERATION_BACKEND.md`](../docs/HG_SOCIAL_MEET_MODERATION_BACKEND.md) |
| Invite abuse controls | Servereid policy | `005_social_meet_abuse_indexes.sql`, [`../docs/HG_SOCIAL_MEET_ABUSE_CONTROLS.md`](../docs/HG_SOCIAL_MEET_ABUSE_CONTROLS.md) |
| Durable Spotmeeting invites | Servereid lifecycle | `006_spotmeeting_invites_server.sql`, [`../docs/HG_SPOTMEETING_INVITE_BACKEND.md`](../docs/HG_SPOTMEETING_INVITE_BACKEND.md) |
| Candidate discovery | Implementert, rollout-gated | `007_social_meet_candidate_discovery.sql`, [`../docs/HG_SOCIAL_MEET_CANDIDATE_DISCOVERY_BACKEND.md`](../docs/HG_SOCIAL_MEET_CANDIDATE_DISCOVERY_BACKEND.md) |
| Retention & observability | Servereid operations-slice | `008_social_meet_retention_observability.sql`, [`../docs/HG_SOCIAL_MEET_RETENTION_OBSERVABILITY.md`](../docs/HG_SOCIAL_MEET_RETENTION_OBSERVABILITY.md) |

De tre kravkontraktene eier sikkerhets- og produktkravene:

- [`../docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`](../docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md)
- [`../docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`](../docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md)
- [`../docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`](../docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md)

De opprinnelige statusavsnittene i kravfilene er tidsbundne. Denne filen og de konkrete slice-dokumentene eier gjeldende implementasjonsstatus.

## Production client boundary

Migrerte Spotmeeting-operasjoner følger:

```text
History GO / Social Meet UI
            ↓
HGSocialMeetAdapter.js
            ↓
HGSocialMeetFastApiClient.ts
            ↓
FastAPI /api/v1
            ↓
PostgreSQL Social Meet state
```

Aktive klientfiler:

- `js/social/HGSocialMeetAdapter.js`
- `js/social/HGSocialMeetFastApiClient.ts`
- `dist/web/hgSocialMeetFastApiClient.js`
- [`../docs/HG_SOCIAL_MEET_FASTAPI_CLIENT.md`](../docs/HG_SOCIAL_MEET_FASTAPI_CLIENT.md)

FastAPI-klienten bruker Supabase-browserøkten kun som tokenbro. Migrerte discovery-, invite-, inbox- og lifecycle-operasjoner går gjennom FastAPI. Produksjonsfeil skal ikke opprette lokale fake invites eller falle tilbake til demo-candidates.

## Rollout state

Implementert kode gir ikke automatisk produksjonsaktivering.

- Discovery krever deployment-kill-switch og privat database-/cohort-/percentage-rollout.
- Invite writes krever eksplisitt backendkonfigurasjon og serverpolicy.
- Destruktiv retention krever eget production-apply-flagg og godkjent operativ prosedyre.
- Manglende eller deaktivert konfigurasjon skal feile lukket.
- Discovery-resultater er advisory og revalideres ved autoritativ invite creation.
- `HG_TEST_MODE` beholder en separat lokal demo-flow.

## Remaining transitions

Følgende er fortsatt egne, eksplisitte oppgaver:

1. godkjent production rollout/rollback med moderasjonskapasitet og kill-switch-rehearsal;
2. jurisdiksjons- og policygjennomgang av retention-vinduer før løpende destructive apply;
3. deploymenteid scheduler/operator-flow for retention dersom kontinuerlig kjøring godkjennes;
4. participant-safe notifications dersom varslinger innføres;
5. serverautoritativ beslutning for learning circles og legacy `hg_social_activity`;
6. utfasing av resterende direkte Supabase-kompatibilitetsflater etter migrering.

## Permanent privacy boundary

Social Meet-backend skal ikke innføre GPS, live location, nearby/distance, presence/last-seen, followers/feed, offentlig visit history, passiv tracking eller fri chat.

## Local setup

Fra repo-roten:

```bash
python -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e './backend[dev]'
cp backend/.env.example backend/.env
fastapi dev backend/app/main.py
```

OpenAPI er tilgjengelig utenfor production og slås av automatisk når `HG_BACKEND_ENVIRONMENT=production`.

## Validation

```bash
python -m ruff check backend
python -m ruff format --check backend
python -m mypy backend/app
cd backend && python -m pytest --cov=app --cov-report=term-missing --cov-fail-under=80
```

Klientgrensen valideres i tillegg av TypeScript web typecheck, bundle-sync og Social Meet adapter-/smoke-tester.

## Ownership rule

Backend eier mutable, flerbruker- og sikkerhetskritisk Social Meet-state som eksplisitt er migrert. Editorial places, people, quiz og curriculum forblir JSON-/manifeststyrt til en egen dataarkitekturbeslutning sier noe annet.
