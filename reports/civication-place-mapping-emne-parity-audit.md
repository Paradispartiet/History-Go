# Civication: 13 avvik i speilede stedsemner

Auditgrunnlag: `d23ac94c08b8a4b21eb36c78918fc479d1eafef0` etter #6125. Alle 13 avvik er lest mot de faktiske canonicale kildefilene, valgt gjennom `data/places/places_index.json` (Git-blob `09ce7be5073013411a641c52e1a375fa77cc3339`). Indeksen gir kildepekeren; emnene kommer fra selve stedskilden.

## Kontrakt og avgrensning

Begge stedsauditene og `tests/civication-place-mapping-split-manifest.test.mjs` krever nøyaktig likhet i den ordnede `emne_ids`-listen. Feltet er et speil av History Go-stedet, ikke en egen Civication-emnekuratering. Civication-kategori, byggtype, kartrolle, sosiale funksjoner og faser er separate kart-/spillfelt. Kategori kan avvike fra den canonicale Place-kategorien etter split-manifest-migreringen. Historisk gruppesti er fortsatt tillatt som `historyGoSourceFile`.

Alle 13 rader har korrekt navn og eksakte koordinater. De gjelder 12 canonicale steder i seks mappingfiler: Nydalen er representert både i bylaget og Akerselva-ruta. Syv lister mangler emner; seks må erstatte eldre emner. Rettingen speiler kildearrayet, også rekkefølgen.

## Matrise

| Mappingfil | Mapping-ID / History Go-ID | Før | Canonical liste | Klassifisering |
|---|---|---|---|---|
| `historyGoPlaceMapping.by.json` | `map_oslo_s` / `oslo_s` | `em_by_infrastruktur_mobilitet`<br>`em_by_sosiale_knutepunkt` | `em_by_infrastruktur_mobilitet`<br>`em_by_sosiale_knutepunkt`<br>`em_by_regional_skala_pendling_omland` | Tillegg |
| `historyGoPlaceMapping.by.json` | `map_vulkan_energisentral` / `vulkan_energisentral` | `em_by_transformasjon_ombruk`<br>`em_by_risiko_beredskap_robusthet` | `em_by_urban_metabolisme_vann_energi_avfall_mat`<br>`em_by_klima_blagronn_klimatilpasning`<br>`em_by_transformasjon_ombruk`<br>`em_by_risiko_beredskap_robusthet` | Tillegg |
| `historyGoPlaceMapping.by.json` | `map_gronland_kirke` / `gronland_kirke` | `em_by_bydelsforskjeller_segregering`<br>`em_by_sosial_miks_i_offentlige_rom` | `em_religion_hellige_rom`<br>`em_religion_ritualer_praksis`<br>`em_religion_religionshistorie_lokalt`<br>`em_religion_kristendom`<br>`em_religion_religion_og_samfunn` | Erstatning |
| `historyGoPlaceMapping.by.json` | `map_nydalen` / `nydalen` | `em_by_transformasjon_ombruk`<br>`em_by_gentrifisering_eiendom`<br>`em_by_industri_havn_logistikk` | `em_by_transformasjon_ombruk`<br>`em_by_historiske_lag_i_hverdagsrom`<br>`em_by_infrastruktur_mobilitet`<br>`em_by_industri_havn_logistikk` | Erstatning |
| `historyGoPlaceMapping.historie.json` | `map_trefoldighetskirken` / `trefoldighetskirken` | `em_his_modernisering_1800`<br>`em_his_kulturminner_bevaring`<br>`em_his_historiske_lag_i_byrom` | `em_religion_hellige_rom`<br>`em_religion_ritualer_praksis`<br>`em_religion_religionshistorie_lokalt`<br>`em_religion_kristendom`<br>`em_religion_religion_og_samfunn` | Erstatning |
| `historyGoPlaceMapping.historie_added_batch_01.json` | `map_prinds_christian_augusts_minde` / `prinds_christian_augusts_minde` | `em_his_sosialhistorie_hverdagsliv`<br>`em_his_tilhorighet_ekskludering`<br>`em_his_stat_institusjoner`<br>`em_his_historiske_lag_i_byrom` | `em_his_sosialhistorie_hverdagsliv`<br>`em_his_velferd_hverdagsliv`<br>`em_his_tilhorighet_ekskludering`<br>`em_his_stat_institusjoner`<br>`em_his_historiske_lag_i_byrom`<br>`em_his_spor_materialitet`<br>`em_his_kulturminner_bevaring` | Tillegg |
| `historyGoPlaceMapping.litteratur.json` | `map_tronsmo_bokhandel` / `tronsmo_bokhandel` | `em_lit_bokhistorie_trykk_forlag`<br>`em_lit_lesning_formidling_offentlighet` | `em_lit_litteraturfelt_institusjoner`<br>`em_lit_lesere_offentlighet_formidling`<br>`em_lit_litteraere_steder_og_bytekst` | Erstatning |
| `historyGoPlaceMapping.litteratur.json` | `map_gamle_deichman` / `gamle_deichman` | `em_by_offentlige_rom_motesteder`<br>`em_by_historiske_lag_i_hverdagsrom` | `em_by_offentlige_rom_motesteder`<br>`em_by_historiske_lag_i_hverdagsrom`<br>`em_lit_litteraturfelt_institusjoner`<br>`em_lit_lesere_offentlighet_formidling`<br>`em_lit_litteraere_steder_og_bytekst`<br>`em_lit_nordisk_bibliotek_leserhistorie_formidling` | Tillegg |
| `historyGoPlaceMapping.litteratur.json` | `map_kulturkirken_jakob_litteratur` / `kulturkirken_jakob_litteratur` | `em_by_offentlige_rom_motesteder`<br>`em_by_midlertidige_installasjoner` | `em_musikk_scene_live_performativitet`<br>`em_musikk_rom_akustikk_lydlandskap`<br>`em_musikk_festival_sceneinfrastruktur`<br>`em_musikk_publikum_fellesskap`<br>`em_musikk_kirke_kor_seremoni`<br>`em_musikk_konsertokonomi_arrangorledd` | Erstatning |
| `historyGoPlaceMapping.subkultur.json` | `map_hausmania` / `hausmania` | `em_sub_autonomi_motstand`<br>`em_sub_diy_praksis` | `em_sub_autonomi_motstand`<br>`em_sub_diy_praksis`<br>`em_sub_sted_scene`<br>`em_sub_rett_til_byen` | Tillegg |
| `historyGoPlaceMapping.subkultur.json` | `map_torggata_blad` / `torggata_blad` | `em_sub_fanziner_plakater`<br>`em_sub_dokumentasjon_arkiv` | `em_sub_diy_praksis`<br>`em_sub_uavhengige_medier`<br>`em_sub_fanziner_plakater`<br>`em_sub_dokumentasjon_arkiv` | Tillegg |
| `historyGoPlaceMapping.natur_akerselvarute.json` | `map_nydalen_industristed` / `nydalen` | `em_by_transformasjon_ombruk`<br>`em_by_gentrifisering_eiendom`<br>`em_by_industri_havn_logistikk` | `em_by_transformasjon_ombruk`<br>`em_by_historiske_lag_i_hverdagsrom`<br>`em_by_infrastruktur_mobilitet`<br>`em_by_industri_havn_logistikk` | Erstatning |
| `historyGoPlaceMapping.natur_akerselvarute.json` | `map_hausmannsbrua` / `hausmannsbrua` | `em_by_infrastruktur_mobilitet`<br>`em_by_historiske_lag_i_hverdagsrom`<br>`em_by_barrierer_forbindelser` | `em_by_infrastruktur_mobilitet`<br>`em_by_historiske_lag_i_hverdagsrom`<br>`em_by_barrierer_forbindelser`<br>`em_by_materialitet_og_sanseerfaring` | Tillegg |

Eksakte kildepekere, kildeblob-SHA-er, Civication-ID-er og differanser finnes i [JSON-matrisen](civication-place-mapping-emne-parity-audit.json).

## Etterprøving

Kjør i full checkout:

```sh
node --test tests/civication-place-mapping-split-manifest.test.mjs
npm run audit:civication-place-mapping
npm run audit:civication-city-map-entries
```

Den eksisterende regresjonstesten er lagt inn i `test:civication-map` og kontrollerer alle per-place-mappinger mot faktiske canonicale kilder. Kjøringsresultater og final head registreres i PR-en. Lokalt er alle 13 rettede array kontrollert mot de 12 kildefilene og resten av de seks JSON-objektene kontrollert uendret.

Dette er en avgrenset synkronisering av speilede emner. Det er ingen vurdering av den redaksjonelle kvaliteten i hvert Place, og det dokumenterer ikke full kartdekning. Eksisterende `needsEnrichment`-poster og godkjente `retired_source_snapshot`-poster består. History Go-kilder og runtime er uendret.
