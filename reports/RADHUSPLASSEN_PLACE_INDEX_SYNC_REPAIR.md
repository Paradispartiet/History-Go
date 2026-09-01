# Rådhusplassen place-index sync repair

Exact base: `126c1f310daeab7752b2b3bce82f4cc53ec6a505`.

Post-merge Main integrity exposed two stale generated fields in `data/places/places_index.json`: `radhusplassen.image` and `radhusplassen.cardImage` still pointed to the old local assets after the canonical Place source moved both to the sourced Wikimedia image. The canonical `npm run places:index:build` changes exactly those two fields.

Verification performed locally:

- `npm run places:index:build`: wrote 1,533 active places
- `npm run places:index:check`: PASS
- no active Place uses `lng`: PASS
- place coordinate index parity: PASS
- `git diff --check`: PASS
- diff scope: one generated file, two value replacements

## Six-part quality gate

1. **Correctness and evidence — 5/5.** The generated values now equal the canonical Rådhusplassen source values reported by the failing sync audit.
2. **Coverage and completion — 5/5.** Both and only both reported mismatches are repaired; the full 1,533-place sync check passes.
3. **Professional/editorial quality — 4/5.** No authored Place claim is changed; the generated index faithfully mirrors the already-reviewed canonical source.
4. **Technical integrity — 5/5.** Canonical build, index sync, coordinate parity and the composed Main integrity sequence are exercised.
5. **Safety and responsibility — 5/5.** No runtime logic, coordinates, ownership, people or unrelated Place data changes.
6. **Maintainability and auditability — 5/5.** The canonical generator produces the repair deterministically; the temporary workflow removes itself.

**Total: 29/30 — high-quality gate passes**, subject to workflow reproduction, exact-head CI and SHA-locked merge.
