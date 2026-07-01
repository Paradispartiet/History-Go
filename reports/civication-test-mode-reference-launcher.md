# Civication Test Mode — Reference Role Launcher Polish

Dato: 2026-07-01

## Formål

CivicationTestMode er videreført som én samlet QA- og v0.1-demo-inngang. Det er ikke lagt til en separat Demo Mode, ny motor, endret FWG-arkitektur eller flyttet eierskap for NextAction.

## Endringer

- Testpanelet laster fortsatt roller datadrevet fra `data/Civication/roleModels/manifest.json`.
- Panelet leser nå status og dekningsdata fra `docs/CIVICATION_ROLE_PACK_INDEX.md` og beriker rollelisten med:
  - `status`
  - `workGrammar` finnes/mangler
  - `mailPlan` finnes/mangler
  - kort `mailFamilies`-dekning
  - tydelig markering av v0.1-referanseroller
- Rollelisten grupperes etter:
  - `complete_reference_v2`
  - `partial_pack`
  - `role_model_only`
- Filterknapper er lagt til:
  - Referanseroller
  - Alle roller
  - Complete
  - Partial
  - Role model only
- Handlingsrekken er tydeliggjort:
  - Start rolle
  - Start dag
  - Åpne Neste handling
  - Nullstill Civication test-state

## Referanseroller

Følgende v0.1-referanseroller markeres og kan startes direkte fra TestMode:

| Rolle | role_scope / role_key | role_id | status |
| --- | --- | --- | --- |
| Arealplanlegger | `by_radgiver_plan` | `by_arealplanlegger` | `complete_reference_v2` |
| Renholder | `renholder` | `naer_renholder` | `complete_reference_v2` |
| Barnehageassistent / pedagogisk medarbeider | `barnehageassistent` | `sosial_laering_barnehageassistent` | `complete_reference_v2` |

## Bevarte eierskap og runtime-kontrakter

- `Start rolle` bruker fortsatt eksisterende `CivicationRoleStarter.startRole(...)`.
- `Start dag` bruker fortsatt `CivicationDailyMailBuilder.startToday({ forceNew: true, ignorePending: true })`.
- `Åpne Neste handling` kaller kun eksisterende `CivicationNextActionUI.open()` og lager ingen ny svarflate.
- Innboks og Dagens fase er ikke endret.
- Ingen `DemoMode`-global er introdusert.

## Testdekning

`tests/civication-test-mode-ui.test.js` er oppdatert for å verifisere at:

- testmodusknappen finnes uten query-param eller localStorage-flagg
- rollelisten bygges datadrevet fra manifest
- alle tre referanseroller finnes og markeres
- Referanseroller-filteret viser Arealplanlegger, Renholder og Barnehageassistent
- alle tre referanseroller kan startes via RoleStarter
- startDay bruker DailyMailBuilder med testmodus-flagg
- ingen egen DemoMode-global introduseres
- NextAction-eierskap forblir hos `CivicationNextActionUI`
- `broken_mapping` forblir 0

## Verifisering

Kjørt:

```bash
npm run test:civication -- --runInBand
```

Resultat: passerte.
