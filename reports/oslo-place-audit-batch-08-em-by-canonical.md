# Oslo place-audit batch 08 — em_by canonical

**Dato:** 2026-05-26

## Formål
Verifisere `em_by_*`-emner fra batch 07 mot canonical by-emnekilde, og gjøre en additiv canonical-opprydding uten endring av place-filer.

## Undersøkte filer
- `reports/oslo-place-audit-batch-07-missing-emne-ids.md`
- `reports/place-emne-missing-audit-batch-07.json`
- `tools/check_place_emne_ids.mjs`
- `data/fag/by/emner_by.json` (aktiv by-emnekilde i repo)
- `data/fag/by/fagkart_by.json`
- `data/fag/by/bypensum_matrix.json`
- `data/fag/by/emnemapping.json`
- `data/fag/by/methods_by.json`
- `data/fag/by/supersetQUIZMAL_by.json` (finnes ikke i repo)
- `data/places/manifest.json`
- Relevante place-filer via batch-07 rapporten (kun kontekst, ingen endringer)

## Endrede filer
- `data/fag/by/emner_by_canonical_v4_5.json` (ny canonical by-emnefil, additiv)
- `reports/oslo-place-audit-batch-08-em-by-canonical.md`

## Verifikasjon av em_by fra batch 07
Kriterium brukt: unike `em_by_*` med `classification` = `canonical_missing` eller `legacy_place_id` i batch-07 JSON.

- Unike `em_by_*` i batch-07 utvalg: **40**
- Allerede fullverdig til stede i by-emnedata (`data/fag/by/emner_by.json`): **40**
- Manglet som canonical-kilde for checker (`emner*_canonical*.json`): **ja**, fordi by manglet en fil som matcher canonical-pattern.

### `em_by_*` som allerede fantes
Alle prioriterte emner fantes allerede i by-emnedata:
- `em_by_historiske_lag_i_hverdagsrom`
- `em_by_infrastruktur_mobilitet`
- `em_by_offentlige_rom_motesteder`
- `em_by_symbolsk_makt_og_representasjon`
- `em_by_transformasjon_ombruk`
- `em_by_industri_havn_logistikk`
- `em_by_gentrifisering_eiendom`
- `em_by_kommersielle_gater`
- `em_by_parker_som_sosial_infrastruktur`
- `em_by_torg_plasser_som_scene`
- `em_by_styring_forvaltning_planmakt`
- `em_by_lavterskel_moteplasser_uten_kjopspress`
- `em_by_vannpromenader_fjordliv`
- `em_by_barrierer_forbindelser`
- `em_by_materialitet_og_sanseerfaring`
- `em_by_navneskilt_plaketter_minner`

I tillegg fantes de øvrige 24 `em_by_*` fra batch-07 også i `emner_by.json`.

## `em_by_*` som ble opprettet
- Ingen nye enkelt-emner ble skrevet manuelt.
- I stedet ble canonical filen opprettet additivt (`emner_by_canonical_v4_5.json`) med eksisterende by-emner, slik at valideringen bruker by-emnene som canonical kilde uten å endre semantikk eller place-data.

## `em_by_*` utsatt
- Ingen `em_by_*` utsatt i denne batchen, fordi alle 40 relevante fra batch-07 allerede var definert i eksisterende by-emnefil.

## Antatt reduksjon i Missing emne_ids
- Før (batch 07): **510**
- Etter batch 08 validering: **179**
- Reduksjon: **331** (tilsvarer `em_by`-familien som tidligere manglet i canonical-scan)

## Validering etter endring
Kjørte kommandoer:
- `npm run places:emner:check` → feiler fortsatt pga øvrige fagfamilier, men missing gikk ned til 179.
- `npm run places:index:check` → OK.
- `npm run health:places` → OK (warnings forventet), unknown emne_ids = 179.

## Kontrollpunkter
- JSON gyldig: ja (filen er gyldig JSON-array, kopi av eksisterende struktur).
- Duplikate emne-id-er i by canonical: ingen introdusert i denne batchen.
- Place-filer endret: nei.
- Andre fagfiler endret: nei.
- Diff er additiv og begrenset til by canonical-emnefil + batch-08 rapport: ja.

## Anbefalt batch 09
Ta neste største familie, sannsynligvis `em_naer` / `em_naering`, med samme metode:
1. Verifiser mot eksisterende naeringsliv-emnedata.
2. Opprett/juster canonical emnefil for naeringsliv slik at checker inkluderer emnene.
3. Hold endringer additive og uten place-endringer.
