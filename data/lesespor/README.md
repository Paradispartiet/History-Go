# Lesespor data

Lesespor er kuraterte eksterne leseforslag knyttet til History Go-steder og fagkategorier. Lesespor-filer skal registreres i `data/lesespor/manifest.json` og følge `history_go_lesespor_v1`-kontrakten.

## Viktige regler

- Lagre metadata og ekstern lenke, ikke kopiert artikkelfulltekst uten eksplisitte rettigheter.
- Bruk eksplisitte `place_ids` og eventuelle verifiserte `person_ids`.
- Aktive oppføringer skal bruke en godkjent kildekvalitet og kurateringsstatus.
- Nye steder/byområder organiseres som `<scope>/lesespor_<scope>_<category>.json`.
- `city`/scope og `category` skal samsvare med filnavnet.

## Validering

Den automatiske workflowen `Lesespor checks` bygger verktøyene og kjører:

```bash
node dist/tools/validate_lesespor.mjs
```

Workflowen trigges av endringer i Lesespor-data, validatoren, relevante badge-/place-indekser og selve workflowen.
