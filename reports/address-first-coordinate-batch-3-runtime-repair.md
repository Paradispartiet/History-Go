# Address-first coordinate batch 3 – runtime repair

Dato: 2026-07-17

## Kilde- og runtimekontroll

Arbeidet brukte **bare** de fem lagrede filene i `reports/geonorge-address-batch-3/`; ingen live Geonorge-forespørsel ble gjort. Hver fil ble kontrollert for `ok: true` og `status: "verified_candidate"`, og hele `coordinate`-objektet ble kopiert til den valgte én-stedsfilen. `coordVerifiedAt` ble satt til `2026-07-17`.

Den aktive kjeden er den samme for alle fem steder:

1. `data/places/manifest.json` velger `places/by/oslo/places_by.json`.
2. Runtime-loaderen i `js/dataHub.js` og indexbyggeren foretrekker søskenmanifestet `data/places/by/oslo/places_by_manifest.json` fremfor legacy-aggregatet.
3. Split-manifestet har nøyaktig én rad per placeId og velger den oppgitte filen under `data/places/by/oslo/places/`.
4. `data/places/by/oslo/places_by_index.json` er regenerert fra de manifest-valgte split-filene.
5. `data/places/places_index.json` er regenerert av `npm run places:index:build` og er den map-facing primærkilden i `DataHub.loadPlacesBase`; loaderens fallback følger samme split-manifestkjede.

Det ble ikke funnet mer enn én manifest-valgt aktiv kilde for noen av ID-ene. `data/places/by/oslo/places_by.json` inneholder legacy-poster, men velges ikke når det gyldige søskenmanifestet finnes og er derfor ikke en ekstra aktiv kilde.

Override-søket omfattet `data/places/coordinate_overrides.json`, `js/geo/place-coordinate-overrides.js`, andre JavaScript-treff og Civication-mappingene. Ingen av de fem ID-ene finnes som lat/lon-overstyring i override-data. Civication-radene i `data/Civication/map/historyGoPlaceMapping.by.json` er bare modell-/scene-mapping og erstatter ikke koordinater. `js/Civication/ui/CivicationOsloMapCalibration.js` har en separat Civication-kalibreringsankerrad for `oslo_s`; dette er kartgeometri/kalibrering, ikke en History Go place-koordinatoverride, og ble ikke endret.

## Steder

### oslo_s — Oslo S

- Lagret Geonorge-resultat: `reports/geonorge-address-batch-3/oslo_s.json` (`ok: true`, `status: verified_candidate`).
- Filer i source-/manifest-/indexkjeden med posten: `data/places/by/oslo/places_by.json` (legacy), `data/places/by/oslo/places_by_manifest.json`, `data/places/by/oslo/places/oslo_s.json`, `data/places/by/oslo/places_by_index.json`, `data/places/places_index.json`; overordnet valg: `data/places/manifest.json`; mapping: `data/Civication/map/historyGoPlaceMapping.by.json`.
- Valgt canonical aktiv kilde: `data/places/by/oslo/places/oslo_s.json`, fordi den eneste `oslo_s`-raden i det aktive split-manifestet peker til `places/oslo_s.json`.
- Tidligere canonical lat/lon: `59.9111, 10.7508`.
- Ny canonical lat/lon: `59.91087480164096, 10.750736725832216`.
- Tidligere koordinatkilde/status: `Wikipedia (Oslo Central Station) + Bane NOR` / `verified`; gammel `transit_anchor`-proveniens er fjernet.
- Geonorge sourceObjectId: `geonorge-adresser-v1:0301:13444:1`.
- Full adresse: Jernbanetorget 1, 0154 Oslo, NO.
- Runtime-index: `59.91087480164096, 10.750736725832216`; sourceObjectId `geonorge-adresser-v1:0301:13444:1`; sourceFile `places/by/oslo/places/oslo_s.json`.
- Override-resultat: ingen lat/lon-override; Civication-mapping/kalibrering er ikke runtime place-koordinatpatch.
- Resultat: **PASS**.

### vulkan_energisentral — Vulkan energisentral

- Lagret Geonorge-resultat: `reports/geonorge-address-batch-3/vulkan_energisentral.json` (`ok: true`, `status: verified_candidate`).
- Filer i source-/manifest-/indexkjeden med posten: `data/places/by/oslo/places_by.json` (legacy), `data/places/by/oslo/places_by_manifest.json`, `data/places/by/oslo/places/vulkan_energisentral.json`, `data/places/by/oslo/places_by_index.json`, `data/places/places_index.json`; overordnet valg: `data/places/manifest.json`; mapping: `data/Civication/map/historyGoPlaceMapping.by.json`.
- Valgt canonical aktiv kilde: `data/places/by/oslo/places/vulkan_energisentral.json`, fordi den eneste manifest-raden peker dit.
- Tidligere canonical lat/lon: `59.9233, 10.7518`.
- Ny canonical lat/lon: `59.92225253860743, 10.751749415749577`.
- Tidligere koordinatkilde/status: ingen kilde / `needs_review`; gammel `building_center` og usikker proveniens er erstattet.
- Geonorge sourceObjectId: `geonorge-adresser-v1:0301:21649:5`.
- Full adresse: Vulkan 5, 0178 Oslo, NO.
- Runtime-index: `59.92225253860743, 10.751749415749577`; sourceObjectId `geonorge-adresser-v1:0301:21649:5`; sourceFile `places/by/oslo/places/vulkan_energisentral.json`.
- Override-resultat: ingen lat/lon-override; Civication-mapping er ikke koordinatoverride.
- Resultat: **PASS**.

### gronland_kirke — Grønland kirke

- Lagret Geonorge-resultat: `reports/geonorge-address-batch-3/gronland_kirke.json` (`ok: true`, `status: verified_candidate`).
- Filer i source-/manifest-/indexkjeden med posten: `data/places/by/oslo/places_by.json` (legacy), `data/places/by/oslo/places_by_manifest.json`, `data/places/by/oslo/places/gronland_kirke.json`, `data/places/by/oslo/places_by_index.json`, `data/places/places_index.json`; overordnet valg: `data/places/manifest.json`; mapping: `data/Civication/map/historyGoPlaceMapping.by.json`.
- Valgt canonical aktiv kilde: `data/places/by/oslo/places/gronland_kirke.json`, fordi den eneste manifest-raden peker dit.
- Tidligere canonical lat/lon: `59.9111, 10.7677`.
- Ny canonical lat/lon: `59.9110993638745, 10.767560036280734`.
- Tidligere koordinatkilde/status: `Wikidata (Q5612884)` / `verified`; gammel Wikidata- og `building_center`-proveniens er fjernet.
- Geonorge sourceObjectId: `geonorge-adresser-v1:0301:12450:34`.
- Full adresse: Grønlandsleiret 34, 0190 Oslo, NO.
- Runtime-index: `59.9110993638745, 10.767560036280734`; sourceObjectId `geonorge-adresser-v1:0301:12450:34`; sourceFile `places/by/oslo/places/gronland_kirke.json`.
- Override-resultat: ingen lat/lon-override; Civication-mapping er ikke koordinatoverride.
- Resultat: **PASS**.

### kampen_kirke — Kampen kirke

- Lagret Geonorge-resultat: `reports/geonorge-address-batch-3/kampen_kirke.json` (`ok: true`, `status: verified_candidate`).
- Filer i source-/manifest-/indexkjeden med posten: `data/places/by/oslo/places_by.json` (legacy), `data/places/by/oslo/places_by_manifest.json`, `data/places/by/oslo/places/kampen_kirke.json`, `data/places/by/oslo/places_by_index.json`, `data/places/places_index.json`; overordnet valg: `data/places/manifest.json`; mapping: `data/Civication/map/historyGoPlaceMapping.by.json`.
- Valgt canonical aktiv kilde: `data/places/by/oslo/places/kampen_kirke.json`, fordi den eneste manifest-raden peker dit.
- Tidligere canonical lat/lon: `59.912, 10.782`.
- Ny canonical lat/lon: `59.911907208292654, 10.781606997031624`.
- Tidligere koordinatkilde/status: `Wikidata (Q10297259)` / `verified`; gammel Wikidata- og `building_center`-proveniens er fjernet.
- Geonorge sourceObjectId: `geonorge-adresser-v1:0301:10988:1`.
- Full adresse: Bøgata 1, 0655 Oslo, NO.
- Runtime-index: `59.911907208292654, 10.781606997031624`; sourceObjectId `geonorge-adresser-v1:0301:10988:1`; sourceFile `places/by/oslo/places/kampen_kirke.json`.
- Override-resultat: ingen lat/lon-override; Civication-mapping er ikke koordinatoverride.
- Resultat: **PASS**.

### oslo_bussterminal — Oslo bussterminal

- Lagret Geonorge-resultat: `reports/geonorge-address-batch-3/oslo_bussterminal.json` (`ok: true`, `status: verified_candidate`).
- Filer i source-/manifest-/indexkjeden med posten: `data/places/by/oslo/places_by.json` (legacy), `data/places/by/oslo/places_by_manifest.json`, `data/places/by/oslo/places/oslo_bussterminal.json`, `data/places/by/oslo/places_by_index.json`, `data/places/places_index.json`; overordnet valg: `data/places/manifest.json`; mapping: `data/Civication/map/historyGoPlaceMapping.by.json`.
- Valgt canonical aktiv kilde: `data/places/by/oslo/places/oslo_bussterminal.json`, fordi den eneste manifest-raden peker dit.
- Tidligere canonical lat/lon: `59.9112, 10.7585`.
- Ny canonical lat/lon: `59.911683292287975, 10.758147862149471`.
- Tidligere koordinatkilde/status: `Wikidata (Q7107012) + Wikipedia` / `verified`; gammel Wikidata/Wikipedia- og `transit_anchor`-proveniens er fjernet.
- Geonorge sourceObjectId: `geonorge-adresser-v1:0301:16260:10`.
- Full adresse: Schweigaards gate 10, 0185 Oslo, NO.
- Runtime-index: `59.911683292287975, 10.758147862149471`; sourceObjectId `geonorge-adresser-v1:0301:16260:10`; sourceFile `places/by/oslo/places/oslo_bussterminal.json`.
- Override-resultat: ingen lat/lon-override; Civication-mapping er ikke koordinatoverride.
- Resultat: **PASS**.

## Sluttresultat

| placeId | canonical source updated | runtime index matches | no stale override | final result |
|---|---:|---:|---:|---|
| oslo_s | yes | yes | yes | PASS |
| vulkan_energisentral | yes | yes | yes | PASS |
| gronland_kirke | yes | yes | yes | PASS |
| kampen_kirke | yes | yes | yes | PASS |
| oslo_bussterminal | yes | yes | yes | PASS |
