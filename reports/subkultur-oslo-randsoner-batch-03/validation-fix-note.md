# Batch 03 validation fix note

The follow-up validation workflow was corrected on 2026-07-22 to call the repository's actual canonical place-emne command: `npm run places:emner:check`.

The Brugata/Storgata record is also patched before validation to use coordinate-contract values allowed by `tools/coordinate-source-contract.mts`:

- `locatorType: "current_place"`
- `coordRole: "area_anchor"`

All validation steps use `pipefail` so `tee` cannot hide a failing command exit code.
