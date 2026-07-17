# Address-first coordinate batch 4: runtime repair

Dato: 2026-07-17

## Metode og runtime-kjede

Arbeidet brukte utelukkende de fem lagrede resultatene under `reports/geonorge-address-batch-4/`; ingen live Geonorge-forespørsler ble utført. Alle resultatene har `ok: true` og `status: "verified_candidate"`, og hele `coordinate`-objektet er brukt som fasit. `data/places/manifest.json` er rotmanifestet for indexbyggeren og fallback-loaderen. For split-datasett peker kategoriens split-manifest videre til enkeltfilen; for direkte manifestoppføringer er filen selv canonical. `data/places/places_index.json` bekrefter valget med `sourceFile`.

Søk i `data/places/coordinate_overrides.json`, `js/geo/place-coordinate-overrides.js`, øvrige JavaScript-koordinatpatcher, lokale split-indekser, runtime-indeksen og Civication-mappingene fant ingen lat/lon-overrides for de fem ID-ene. Civication-treffene er bare modell-, kartkalibrerings- eller scene-ID-koblinger og erstatter ikke runtime-koordinatene.

## operahuset — Operahuset

- **Lagret Geonorge-resultat:** `reports/geonorge-address-batch-4/operahuset.json` (`ok: true`, `status: verified_candidate`).
- **Filer som definerer ID-en:** `data/places/by/oslo/places/operahuset.json` (canonical split-kilde) og `data/places/by/oslo/places_by.json` (gammel aggregate-duplikat). Den genererte lightweight-indeksen `data/places/by/oslo/places_by_index.json` og runtime-indeksen inneholder også ID-en, men er ikke fagkilder.
- **Valgt canonical runtime-kilde:** `data/places/by/oslo/places/operahuset.json`.
- **Hvorfor aktiv:** Rotmanifestet aktiverer `places/by/oslo/places_by.json`; sibling-manifestet `places_by_manifest.json` erklærer one-file-per-place og peker `operahuset` til `places/operahuset.json`. Indexbyggeren valgte samme fil, og fallback-kjeden kan finne den via split-manifest/-index.
- **Resultat:** `updated`.
- **Tidligere canonical lat/lon:** `59.9075, 10.7527`.
- **Endelig canonical lat/lon:** `59.90777660297918, 10.752057851974856`.
- **Tidligere koordinatkilde:** `Wikidata (Q43280) + OpenStreetMap`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:21493:1`.
- **Full adresse:** Kirsten Flagstads plass 1, 0150 Oslo, NO.
- **Runtime-index lat/lon:** `59.90777660297918, 10.752057851974856`.
- **Runtime sourceObjectId:** `geonorge-adresser-v1:0301:21493:1`.
- **Runtime sourceFile:** `places/by/oslo/places/operahuset.json`.
- **Override-resultat:** Ingen stale lat/lon-override. Aggregate-duplikatet var allerede Geonorge-korrekt og ble dokumentert, men ikke endret fordi split-kilden er canonical.
- **Kontroll:** **PASS**.

## oslo_domkirke — Oslo domkirke

- **Lagret Geonorge-resultat:** `reports/geonorge-address-batch-4/oslo_domkirke.json` (`ok: true`, `status: verified_candidate`).
- **Filer som definerer ID-en:** `data/places/by/oslo/oslo_domkirke.json` (én-elements array). Runtime-indeksen inneholder en generert representasjon.
- **Valgt canonical runtime-kilde:** `data/places/by/oslo/oslo_domkirke.json`.
- **Hvorfor aktiv:** Filen står direkte i rotmanifestet, etter kategoriaggregatet, og indexbyggerens `sourceFile` peker til den. Ingen sibling split-manifest overstyrer denne direkte enkeltfilen.
- **Resultat:** `updated` (koordinatene var riktige; gammel/motstridende presisjons- og kilde-ID-proveniens ble fjernet og verifikasjonsdatoen oppdatert).
- **Tidligere canonical lat/lon:** `59.91198982723361, 10.746574591052143`.
- **Endelig canonical lat/lon:** `59.91198982723361, 10.746574591052143`.
- **Tidligere koordinatkilde:** `geonorge_adresser_v1`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:13630:11`.
- **Full adresse:** Karl Johans gate 11, 0154 Oslo, NO.
- **Runtime-index lat/lon:** `59.91198982723361, 10.746574591052143`.
- **Runtime sourceObjectId:** `geonorge-adresser-v1:0301:13630:11`.
- **Runtime sourceFile:** `places/by/oslo/oslo_domkirke.json`.
- **Override-resultat:** Ingen stale lat/lon-override.
- **Kontroll:** **PASS**.

## slottet — Det kongelige slott

- **Lagret Geonorge-resultat:** `reports/geonorge-address-batch-4/slottet.json` (`ok: true`, `status: verified_candidate`).
- **Filer som definerer ID-en:** `data/places/politikk/oslo/slottet.json` (én-elements array). Runtime-indeksen inneholder en generert representasjon.
- **Valgt canonical runtime-kilde:** `data/places/politikk/oslo/slottet.json`.
- **Hvorfor aktiv:** Filen står direkte i rotmanifestet og er indexbyggerens `sourceFile`; den eldre politikk-aggregatoppføringen kommer senere i manifestet og definerer ikke denne ID-en.
- **Resultat:** `updated` (koordinatene var riktige; gammel/motstridende presisjons- og kilde-ID-proveniens ble fjernet og verifikasjonsdatoen oppdatert).
- **Tidligere canonical lat/lon:** `59.917063045432855, 10.727724636631736`.
- **Endelig canonical lat/lon:** `59.917063045432855, 10.727724636631736`.
- **Tidligere koordinatkilde:** `geonorge_adresser_v1`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:21608:1`.
- **Full adresse:** Slottsplassen 1, 0010 Oslo, NO.
- **Runtime-index lat/lon:** `59.917063045432855, 10.727724636631736`.
- **Runtime sourceObjectId:** `geonorge-adresser-v1:0301:21608:1`.
- **Runtime sourceFile:** `places/politikk/oslo/slottet.json`.
- **Override-resultat:** Ingen stale lat/lon-override. Civication-kalibreringen er scenegeometri, ikke en History Go-koordinatpatch.
- **Kontroll:** **PASS**.

## sofienberg_kirke — Sofienberg kirke

- **Lagret Geonorge-resultat:** `reports/geonorge-address-batch-4/sofienberg_kirke.json` (`ok: true`, `status: verified_candidate`).
- **Filer som definerer ID-en:** `data/places/by/oslo/sofienberg_kirke.json` (én-elements array). Runtime-indeksen inneholder en generert representasjon.
- **Valgt canonical runtime-kilde:** `data/places/by/oslo/sofienberg_kirke.json`.
- **Hvorfor aktiv:** Filen står direkte i rotmanifestet og er indexbyggerens `sourceFile`; den er ikke medlem av `places_by_manifest.json` sitt eldre split-sett.
- **Resultat:** `updated` (koordinatene var riktige; gammel `coordPrecision: building` ble fjernet og verifikasjonsdatoen oppdatert).
- **Tidligere canonical lat/lon:** `59.922239531059745, 10.765987821107696`.
- **Endelig canonical lat/lon:** `59.922239531059745, 10.765987821107696`.
- **Tidligere koordinatkilde:** `geonorge_adresser_v1`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:15821:18`.
- **Full adresse:** Rathkes gate 18, 0558 Oslo, NO.
- **Runtime-index lat/lon:** `59.922239531059745, 10.765987821107696`.
- **Runtime sourceObjectId:** `geonorge-adresser-v1:0301:15821:18`.
- **Runtime sourceFile:** `places/by/oslo/sofienberg_kirke.json`.
- **Override-resultat:** Ingen stale lat/lon-override.
- **Kontroll:** **PASS**.

## gamle_aker_kirke — Gamle Aker kirke

- **Lagret Geonorge-resultat:** `reports/geonorge-address-batch-4/gamle_aker_kirke.json` (`ok: true`, `status: verified_candidate`).
- **Filer som definerer ID-en:** `data/places/historie/oslo/places_historie/gamle_aker_kirke.json` (canonical split-kilde) og `data/places/historie/oslo/places_historie.json` (gammel aggregate-duplikat). Den genererte lightweight-indeksen `data/places/historie/oslo/places_historie_index.json` og runtime-indeksen inneholder også ID-en.
- **Valgt canonical runtime-kilde:** `data/places/historie/oslo/places_historie/gamle_aker_kirke.json`.
- **Hvorfor aktiv:** Rotmanifestet aktiverer historieaggregatet; sibling-manifestet erklærer one-file-per-place, at aggregatet er beholdt uendret, og peker ID-en til enkeltfilen. Indexbyggerens `sourceFile` bekrefter enkeltfilen.
- **Resultat:** `updated` (koordinatene var riktige; gammel `coordPrecision: building` ble fjernet og verifikasjonsdatoen oppdatert).
- **Tidligere canonical lat/lon:** `59.923779239528116, 10.74681853984208`.
- **Endelig canonical lat/lon:** `59.923779239528116, 10.74681853984208`.
- **Tidligere koordinatkilde:** `geonorge_adresser_v1`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:10057:26`.
- **Full adresse:** Akersbakken 26, 0172 Oslo, NO.
- **Runtime-index lat/lon:** `59.923779239528116, 10.74681853984208`.
- **Runtime sourceObjectId:** `geonorge-adresser-v1:0301:10057:26`.
- **Runtime sourceFile:** `places/historie/oslo/places_historie/gamle_aker_kirke.json`.
- **Override-resultat:** Ingen stale lat/lon-override. Aggregate-duplikatet var allerede Geonorge-korrekt og ble ikke endret fordi manifestet uttrykkelig velger split-filen.
- **Kontroll:** **PASS**.

## Sluttkontroll

| placeId | canonical correct | runtime index matches | no stale override | final result |
|---|---:|---:|---:|---|
| operahuset | yes | yes | yes | PASS |
| oslo_domkirke | yes | yes | yes | PASS |
| slottet | yes | yes | yes | PASS |
| sofienberg_kirke | yes | yes | yes | PASS |
| gamle_aker_kirke | yes | yes | yes | PASS |
