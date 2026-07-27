# Place description production packets

Denne mappen inneholder interne produksjonspakker for nye eller reviderte `desc`/`popupDesc` under canonical standard 4.2.

Filnavn:

`<place_id>.json`

Hver pakke skal følge:

`data/places/regler/place_description_production_v4_2.schema.json`

Pakken skal ikke lastes av brukergrensesnittet. Den dokumenterer identitetsport, claims, setning–claim-dekning, teksthash, metadata-snapshot, faktareview, redaksjonell review, quiz-readiness og versjonert ferdigstatus.

Produksjonsstatuser:

- `ready_v4_2`
- `needs_research`
- `source_conflict`
- `identity_unresolved`
- `blocked_insufficient_sources`
- `metadata_correction_required`

Kjør full kontroll:

```bash
node scripts/validate-place-description-production-v4_2.mjs --all
```

Kjør PR-port mot base og head:

```bash
node scripts/validate-place-description-production-v4_2.mjs --changed --base <base-sha> --head <head-sha>
```
