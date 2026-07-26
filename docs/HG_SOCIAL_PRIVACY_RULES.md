# HG Social Privacy Rules

Status: **canonical Social privacy-policy**  
Sist kontrollert: **2026-07-25**

History GO Social er kunnskapsbasert og manuelt initiert. Det skal ikke bli en lokasjons-, popularitets- eller passiv aktivitetsflate.

Denne filen eier privacy-defaults og de permanente grensene for Social Meet. Aktiv håndheving dokumenteres i subsystemregisteret, backendinngangen og de konkrete Social Meet-slicene.

## Privacy defaults

Alle Social-innstillinger er av som standard, bortsett fra Public Profile:

- Public Profile: ON
- Visible in Match Lists: OFF
- Allow Meet Invites: OFF
- Allow Circle Invites: OFF
- Show Social Reputation: OFF

En serverprofil kan ikke bli `discoverable` uten gjeldende samtykke, eksplisitt publisering og beståtte eligibility-kontroller.

## Permission rules

- Profilvisning krever aktiv synlighet og ingen block eller moderation restriction.
- Matchvisning krever at begge profiler er kvalifiserte og at serverens suppression-policy tillater paret.
- Invitasjoner krever recipient opt-in, gyldig context, servereid preset og bestått block-, moderation-, duplicate-, cooldown- og rate-limit-policy.
- Learning circles er medlems- eller invite-scoped.
- Social history er privat og participant-scoped; den er ikke en offentlig aktivitetsfeed.

Lokale JavaScript-guards er compatibility-/demo-grenser. Serveren er autoritativ for servereide operasjoner.

## Blocking effects

Aktiv blokkering gir gjensidig usynlighet og skal stoppe discovery, nye invitasjoner, levering og usikre lifecycle-overganger. Private safety-årsaker skal ikke kunne utledes gjennom candidate-, invite- eller inbox-responser.

## Retention

Retention følger datagrensen som eier objektet:

- lokal demo-/compatibility-state kan bruke korte oppryddingsvinduer, blant annet 30 dager for lokalt avslåtte eller avbrutte invitasjoner og 14 dager for midlertidige varsler;
- servereid state følger den versjonerte retention-policyen i [`HG_SOCIAL_MEET_RETENTION_OBSERVABILITY.md`](./HG_SOCIAL_MEET_RETENTION_OBSERVABILITY.md);
- safety- og moderation-state kan beholdes lenger når policy, klage, incident review eller gyldig hold krever det;
- deployed retention-vinduer må vurderes for faktisk jurisdiksjon og produktbruk før destruktiv production apply aktiveres.

Lokale demotall skal ikke overstyre serverpolicy.

## Permanent forbidden behavior

Social Meet og Spotmeeting skal aldri bruke eller eksponere:

- GPS, live location, nearby eller distance-to-person;
- last seen, online status, presence eller availability;
- offentlig visit history eller passive route traces;
- followers, popularity score eller offentlig feed;
- fri chat eller fritekstinvitasjoner;
- passiv tracking eller inferred co-presence;
- private konto-, sikkerhets- eller moderatorfelt i public/participant APIs.

Et valgt History GO-sted kan være eksplisitt møtecontext. Det er ikke brukerens nåværende posisjon.

## Production rollout

Implementert backend betyr ikke automatisk bred produksjonsaktivering. Discovery, invite writes og destruktiv retention skal være fail-closed bak deployment-konfigurasjon, private rollout-flagg, cohort controls og testet rollback.

`HG_TEST_MODE` og seedede demo-profiler skal forbli adskilt fra ekte profiler, `PEOPLE` og servereid Social Meet-state.
