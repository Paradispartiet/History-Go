# Alnaelva duplicate retirement

This cleanup retires the runtime duplicate `alnaelva_hovedsteder` after canonical `alnaelva` was verified as a multi-anchor river route in batch 157.

The legacy source/evidence records are retained as audit history. Active Civication and leksikon references are migrated to canonical `alnaelva`, while the legacy place ID is added to `data/places/place_exclusions.json` so it no longer appears in the active place index.
