# Skimuseet i Holmenkollen — clean coordinate intake

Date: 2026-07-21

`oslo_golfklubb_bogstad` is already canonical and was removed from the retry. The remaining approved Holmenkollen candidate is now coordinate-ready:

- placeId: `holmenkollen_skimuseum`
- category: `historie`
- exact official address: Kongeveien 40, Oslo
- coordinate: 59.96471254074996, 10.666572782635253
- source object: `geonorge-adresser-v1:0301:13850:40`
- status: `verified`

No exact named Ski Museum OSM object was resolved, so the repository's address-first fallback rule selects the exact official Geonorge address point. The point is 239 meters from the existing `holmenkollen_nasjonalanlegg` marker. This is expected parent/child proximity, not identity duplication: Skimuseet is a persistent museum institution with its own collections, entrance and history, while the jump tower and broader arena remain represented by `holmenkollen_nasjonalanlegg`.

Full raw search and validation output remains in source PR #3130. The retry passed the full coordinate runner after the already-canonical golf candidate was removed.
