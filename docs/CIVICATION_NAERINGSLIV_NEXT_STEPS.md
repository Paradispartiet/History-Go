# Civication Næringsliv – neste integrasjonssteg

Denne branchen etablerer formål, schema, arbeidsmodell, generator, validator og første ekspeditørpakke.

## Det som er gjort

- Mailformål er definert i `docs/CIVICATION_MAIL_PURPOSE.md`.
- Mail-schema er definert i `docs/CIVICATION_MAIL_SCHEMA.md`.
- Næringsliv har fått arbeidsmodell i `data/Civication/workModels/naeringsliv_work_model.json`.
- Generator er lagt til i `scripts/generate-civication-mails.js`.
- Validator er lagt til i `scripts/validate-civication-mails.js`.
- Første ekspeditør-plan er lagt til i `data/Civication/mailPlans/naeringsliv/ekspeditor_plan.json`.
- Første ekspeditør-familier er lagt til under `data/Civication/mailFamilies/naeringsliv/`.
- Runtime-test for ekspeditør er lagt til i `tests/civication-ekspeditor-workmodel.test.js`.

## Viktig integrasjonsbeslutning

Dagens `badges.json` for Næringsliv starter med:

1. Arbeider
2. Fagarbeider
3. Mellomleder

Den nye arbeidsmodellen sier at Næringsliv bør starte slik i Civication:

1. Ekspeditør / butikkmedarbeider
2. Erfaren butikkmedarbeider
3. Vareansvarlig / områdeansvarlig
4. Skiftansvarlig
5. Fagarbeider salg/service
6. Assisterende leder
7. Mellomleder
8. Driftsleder / formann

Det bør derfor gjøres en separat, kontrollert badge-integrasjon etter at ekspeditørpakken er validert.

## Hvorfor badge-integrasjon bør være separat

`badges.json` styrer jobbtilbud direkte gjennom `merits-and-jobs.js` og `CivicationJobs.acceptOffer()`.

Hvis vi endrer badge-labels uten å justere rolleoppløsningen samtidig, kan appen lage en aktiv rolle som ikke finner riktig `mailPlan`.

For å merge badge-integrasjonen trygt må følgende gjøres i samme PR:

1. Endre Næringsliv-tier labels i `data/badges.json`.
2. Oppdatere rolleoppløsning i:
   - `js/Civication/systems/civicationMailRuntime.js`
   - `js/Civication/mailPlanBridge.js`
   - `js/Civication/systems/civicationRoleModelRuntime.js`
   - eventuelt `js/Civication/core/civicationJobs.js` sin `slugify()` for æ/ø/å.
3. Sikre at `Ekspeditør / butikkmedarbeider` resolves til `ekspeditor`.
4. Sikre at `Erfaren butikkmedarbeider` resolves til `erfaren_butikkmedarbeider`.
5. Sikre at `Vareansvarlig / områdeansvarlig` resolves til `vareansvarlig`.
6. Sikre at `Skiftansvarlig` resolves til `skiftansvarlig`.
7. Kjøre `tests/civication-ekspeditor-workmodel.test.js`.
8. Kjøre `tests/civication-mail-loop.test.js`.
9. Kjøre `node scripts/validate-civication-mails.js`.

## Midlertidig testrolle

Ekspeditørpakken kan allerede testes direkte ved å sette aktiv posisjon til:

```js
CivicationState.setActivePosition({
  career_id: "naeringsliv",
  career_name: "Næringsliv & industri",
  title: "Ekspeditør / butikkmedarbeider",
  role_key: "ekspeditor",
  role_id: "naer_ekspeditor"
});
```

Deretter bør `CivicationMailRuntime.inspect()` vise:

```js
role_scope: "ekspeditor"
plan_path: "data/Civication/mailPlans/naeringsliv/ekspeditor_plan.json"
```

Hvis den ikke gjør det, må rolleoppløsningen oppdateres før badge-stigen endres.

## Produksjonsmål etter denne PR-en

Neste innholdsutbygging bør være:

- 120 ekspeditør-mails totalt
- 120 erfaren butikkmedarbeider-mails
- 100 vareansvarlig-mails
- 100 skiftansvarlig-mails
- 150 fagarbeider-mails
- 200 mellomleder-mails
- 150 driftsleder/formann-mails

Hver ny mail skal bygges fra arbeidsmodellen, ikke fra fri tekst.
