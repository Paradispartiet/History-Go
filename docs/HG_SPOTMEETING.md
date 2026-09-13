# HG Spotmeeting

Status: **canonical produkt- og lifecycle-kontrakt**  
Sist kontrollert: **2026-07-25**

HG Spotmeeting er produktnavnet for frivillige, privacy-safe møteforespørsler rundt History GO-kunnskap. Spotmeeting er ikke et separat sosialt produkt; det er den konkrete invite-flowen inne i Social Meet.

## Definition

En spotmeeting er en manuelt startet forespørsel om å møtes rundt et History GO-sted, en rute, quiz, observasjon, sirkel eller et tema. Candidate discovery og matchforklaringer skal bygge på eksplisitte, grove kunnskaps- og interessesignaler, aldri på hvor noen befinner seg nå.

## Allowed contexts

Alle contexts må inneholde:

```text
contextType
contextId
title
reason
sourceSurface
```

Tillatte `contextType`-verdier:

- `place`
- `quiz`
- `route`
- `observation`
- `topic`
- `circle`

## Lifecycle

1. Brukeren åpner **PlaceCard → Utforsk → Møtes** eller en annen eksplisitt Spotmeeting-inngang.
2. For Place-context åpner UI-et direkte på **Folk å møte her**; dette er opt-in kunnskaps-/interessematcher, ikke fysisk tilstedeværelse.
3. Systemet validerer context og privacy-felter.
4. Discovery kan foreslå kvalifiserte profiler når FastAPI og rollout-gatene er aktivert, eller seedede demo-profiler i eksplisitt TEST_MODE.
5. Brukeren velger én kandidat og sender én servereid preset-melding.
6. En invite opprettes som `pending` gjennom den autoritative datagrensen.
7. Mottakeren kan godta eller avslå.
8. Avsenderen kan avbryte.
9. Enten deltaker kan avbryte en akseptert invite etter policy.
10. En akseptert invite kan markeres `completed` én gang; gjentatt completion er idempotent.
11. Block, moderation restriction, expiry, cooldown eller annen safety-state skal stoppe handlingen når policyen krever det.

Serverens lifecycle omfatter også tekniske/safety-stater som `expired`, `reported` og `blocked`. Produktets primære deltakerstater er:

```text
pending
accepted
declined
cancelled
completed
```

## Privacy rules

Spotmeeting skal alltid være:

- manuelt initiert;
- knowledge/activity-based;
- context-bound;
- preset-only;
- cancellable;
- block-/report-aware;
- privat og participant-scoped.

Spotmeeting skal aldri bruke eller eksponere GPS, live location, last seen, nearby users, distance-to-person, followers/feed, offentlig visit history, passive tracking eller fri chat. Derfor skal UI-et bruke formuleringen **Folk å møte her**, ikke «folk som er her nå», med mindre produktets privacy-arkitektur en dag endres eksplisitt.

## Implemented boundaries

History GO har implementert:

- FastAPI/PostgreSQL identity og eksplisitt public-profile opt-in;
- participant block/report, export og deletion;
- moderation queue, restrictions og appeals;
- abuse controls, rate limits, duplicate suppression og cooldowns;
- durable server-owned invite creation, lifecycle, inbox og sync;
- privacy-safe candidate discovery;
- typed FastAPI client og browser-adapter;
- retention, holds og privacy-safe observability.

Aktiv implementasjonsoversikt ligger i [`../backend/README.md`](../backend/README.md).

## Production rollout

Implementert kode er ikke det samme som automatisk bred aktivering.

Uten eksplisitt FastAPI-konfigurasjon eller når rollout-gatene er av, skal produksjonsflaten feile lukket med en backend-disabled/unavailable-tilstand. Candidate discovery krever både deployment-kill-switch og privat server-/database-rollout. Invite writes og destructive retention har egne eksplisitte gates.

Et discovery-resultat er bare et advisory snapshot. Invite creation skal alltid revalidere gjeldende identity, consent, block, moderation, abuse, cooldown, rate-limit og duplicate-state før insert.

## TEST_MODE

`HG_TEST_MODE` beholder en tydelig lokal/demo-flow for QA. Demo-profiler og demo-invites skal ikke skrives til `PEOPLE`, ekte profilstate eller servereid Social Meet-state. Produksjonsfeil skal ikke falle tilbake til fake invites eller demo-candidates.

## Server-side requirements

Kravene eies av:

- [`HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`](./HG_SOCIAL_MEET_IDENTITY_CONTRACT.md)
- [`HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`](./HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md)
- [`HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`](./HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md)

Gjeldende implementasjonsstatus leses fra:

- [`HG_SOCIAL_BACKEND_CONTRACT.md`](./HG_SOCIAL_BACKEND_CONTRACT.md)
- [`../backend/README.md`](../backend/README.md)

## Non-goals

Spotmeeting innfører ikke datingmekanikk, åpne meldinger, public feeds, follower graphs, presence maps, location ranking eller automatisk kontakt.
