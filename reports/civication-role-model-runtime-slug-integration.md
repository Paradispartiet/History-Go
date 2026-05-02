# Civication role-model runtime slug integration

## Hva som ble lest
- `data/badges.json` (tier-labels per badge/career).
- `data/Civication/roleModels/manifest.json` (rollemodell-filer som faktisk finnes).
- `reports/civication-role-models-from-badges.md` (generator-status: 244 filer).
- `js/Civication/systems/civicationRoleModelRuntime.js` (runtime som dekorerer mailer).
- `js/Civication/mailPlanBridge.js` (eksisterende role-scope-resolver i mail-plans).
- `js/Civication/core/civicationJobs.js` (hvordan aktiv rolle settes ved akseptert tilbud).
- `js/Civication/core/civicationState.js` (hvordan aktiv rolle lagres/leses fra state).
- `js/Civication/core/civicationEventEngine.js` (bruk av aktiv `title` som tier_label i konfliktflyt).

## Hva som ble endret
Kun `js/Civication/systems/civicationRoleModelRuntime.js` ble oppdatert.

### Endringer i runtime
1. Beholdt legacy-mapping for gamle næringslivsroller (`naer_*` / arbeider/fagarbeider/mellomleder/formann).
2. Lagt til slug-basert fallback med aktiv rolle-tittel (`active.title`) og sekundært `tier_label`/`role_key`.
3. Lagt til path-resolusjon via:
   - `data/Civication/roleModels/{career_id}/{resolved_role_scope}.json`
4. Lagt til manifest-oppslag (`data/Civication/roleModels/manifest.json`) for å vise om forventet fil er registrert.
5. Lagt til robust `resolveRoleModelPath(active)` som returnerer:
   - `category` (career_id)
   - `role_scope`
   - `path`
   - `strategy` (`legacy_mapping` eller `badge_tier_slug`)
   - `manifest_has_path`
6. Oppdatert `inspect()` til å vise:
   - aktiv rolle
   - løst category/career_id
   - løst role_scope
   - forventet path
   - strategi brukt
   - om path finnes i manifest
   - om fil ble lastet

## Hvilke felter aktiv rolle faktisk bruker
Fra dagens state/job-flow:
- `career_id` (kategori for roleModel-mappe)
- `career_name`
- `title` (tier-label / stillingstittel)
- `threshold`
- `achieved_at`
- `role_key` (slugget ved aksept av offer)
- valgfri employer/brand-kontekst (`brand_id`, `brand_name`, `brand_type`, `brand_group`, `sector`, `place_id`, `employer_context`)

Merk:
- `role_id` finnes ikke i standard `setActivePosition` i `civicationJobs.js`, men kan finnes i andre flows.
- `civicationEventEngine.ensureConflictState` bruker eksplisitt `active.title` som `tier_label`.

## Testede roleModel-paths som fungerer
Verifisert mot manifest og slug-regler:
- `data/Civication/roleModels/media/journalist.json`
- `data/Civication/roleModels/by/byplanlegger.json`
- `data/Civication/roleModels/politikk/politisk_radgiver.json`
- `data/Civication/roleModels/sport/trener.json`
- legacy: `data/Civication/roleModels/naeringsliv/arbeider.json`

## Hva som gjenstår for full mailintegrasjon
- Mail runtime/bridge er fortsatt hovedsakelig plan-/family-styrt for eldre næringslivsoppsett.
- Full integrasjon av alle nye badge-tier-roller i faktisk mail-utvalg krever senere arbeid i mail-plan/mail-family lagene.
- Denne endringen er begrenset til roleModel-dekorering av mailer og påvirker ikke planvalg, økonomi, NAV, wallet, unlock eller UI.
