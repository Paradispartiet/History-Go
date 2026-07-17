# People of Places — Eidsvollsbygningen batch 6 validation

## Intended scope

Base: current `main` after Eidsvollsbygningen batch 5 was merged.

Batch 6 changes only:

- `data/people/manifest.json`
- five new canonical person files under `data/people/politikk/akershus/eidsvollsbygningen/`
- `reports/people-eidsvollsbygningen-batch6-research.md`
- `reports/people-eidsvollsbygningen-batch6-validation.md`

No place data, place indexes, quiz data, Civication data, or unrelated people records are changed.

## Canonical audit

The following exact names and proposed IDs were searched before creation and produced no canonical person matches:

- `Valentin Christian Wilhelm Sibbern` / `valentin_sibbern`
- `Christopher Frimann Omsen` / `christopher_frimann_omsen`
- `Frederik Wilhelm Bruenech Stabell` / `frederik_wilhelm_stabell`
- `Hans Haslum` / `hans_haslum`
- `Poul Steenstrup` / `poul_steenstrup`

## Research gate

All five new records have explicit documented participation in the Riksforsamlingen at Eidsvoll in 1814. See `reports/people-eidsvollsbygningen-batch6-research.md` for candidate-specific roles and source notes.

## Repository-local validation

The connected GitHub environment used for this batch does not provide a runnable repository checkout. The following commands therefore have **not** been falsely reported as passing locally:

```bash
mkdir -p reports/people-eidsvollsbygningen-batch6-runtime
npm run audit:people-of-places \
  | tee reports/people-eidsvollsbygningen-batch6-runtime/audit-people-of-places.txt
npm run tools:check \
  | tee reports/people-eidsvollsbygningen-batch6-runtime/tools-check.txt
```

Expected People of Places audit invariants remain:

- `duplicatePeopleIds: 0`
- `invalidPlaceRefs: 0`
- `peopleWithoutValidPrimaryAnchor: 0`
- `peopleWithEmptyPlacesArray: 0`

## Structural validation

A branch comparison against current `main` must contain exactly:

- one manifest update adding the five new file paths
- five new canonical person files
- the batch-6 research report
- this validation report

No changes to place data, place indexes, quiz data, Civication data, or unrelated people files are permitted.