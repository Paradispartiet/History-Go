# Evidence sync rerun

The first production validation isolated four coordinate-evidence parity mismatches. The canonical coordinates and source identities were already accepted by all preceding gates; the mismatch was limited to `currentCoordinate.coordNote` not being byte-for-byte identical to the corresponding canonical place field.

The follow-up one-shot runner synchronizes the full `currentCoordinate` field set directly from each canonical place before rerunning all blocking coordinate and manifest gates.
