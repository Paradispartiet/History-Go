# Oslo place-audit batch 07 — klassifisert rapport for manglende emne_ids

**Dato:** 2026-05-26

## Kjørte kommandoer
- `npm run places:emner:check`
- `npm run places:index:check`
- `npm run health:places`

## Nøkkeltall
- Totalt manglende emne_ids (forekomster): **510**
- Unike manglende emne_ids: **86**

## Gruppering etter place-fil
- `data/places/by/oslo/places_by.json`: **124**
- `data/places/naeringsliv/oslo/places_naeringsliv.json`: **79**
- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json`: **63**
- `data/places/natur/oslo/places_oslo_natur_akerselvarute.json`: **46**
- `data/places/litteratur/oslo/places_litteratur.json`: **35**
- `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`: **30**
- `data/places/vitenskap/oslo/places_vitenskap.json`: **25**
- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json`: **21**
- `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json`: **21**
- `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json`: **14**
- `data/places/musikk/oslo/places_musikk.json`: **8**
- `data/places/natur/oslo/places_oslo_natur_hovedsteder.json`: **7**
- `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json`: **7**
- `data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json`: **6**
- `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json`: **6**
- `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json`: **5**
- `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json`: **4**
- `data/places/media/oslo/places_oslo_media.json`: **3**
- `data/places/natur/oslo/places_oslo_alna.json`: **3**
- `data/places/psykologi/oslo/places_psykologi.json`: **3**

## Gruppering etter emne_id-prefix
- `em`: **510**

## Gruppering etter sannsynlig fagområde
- `by`: **187**
- `naeringsliv`: **100**
- `natur`: **70**
- `litteratur`: **35**
- `sport`: **34**
- `vitenskap`: **31**
- `subkultur`: **21**
- `musikk`: **8**
- `historie`: **7**
- `politikk`: **6**
- `kunst`: **5**
- `media`: **3**
- `psykologi`: **3**

## Topp 20 mest brukte manglende emne_ids
- `em_naer_felt_arbeid_verdiskaping` (33) — prefix `em`, fag `naeringsliv`
- `em_naer_geografi_infrastruktur` (33) — prefix `em`, fag `naeringsliv`
- `em_by_historiske_lag_i_hverdagsrom` (27) — prefix `em`, fag `by`
- `em_by_infrastruktur_mobilitet` (26) — prefix `em`, fag `by`
- `em_by_offentlige_rom_motesteder` (24) — prefix `em`, fag `by`
- `em_by_symbolsk_makt_og_representasjon` (23) — prefix `em`, fag `by`
- `em_by_transformasjon_ombruk` (23) — prefix `em`, fag `by`
- `em_by_industri_havn_logistikk` (21) — prefix `em`, fag `natur`
- `em_by_gentrifisering_eiendom` (19) — prefix `em`, fag `by`
- `em_by_kommersielle_gater` (18) — prefix `em`, fag `naeringsliv`
- `em_sport_idrettsgeografi` (17) — prefix `em`, fag `sport`
- `em_sport_kropp_konkurranse` (17) — prefix `em`, fag `sport`
- `em_by_parker_som_sosial_infrastruktur` (16) — prefix `em`, fag `natur`
- `em_by_torg_plasser_som_scene` (12) — prefix `em`, fag `by`
- `em_by_styring_forvaltning_planmakt` (11) — prefix `em`, fag `by`
- `em_by_lavterskel_moteplasser_uten_kjopspress` (10) — prefix `em`, fag `by`
- `em_by_vannpromenader_fjordliv` (9) — prefix `em`, fag `by`
- `em_by_barrierer_forbindelser` (8) — prefix `em`, fag `by`
- `em_by_materialitet_og_sanseerfaring` (7) — prefix `em`, fag `by`
- `em_by_navneskilt_plaketter_minner` (7) — prefix `em`, fag `litteratur`

## Eksempelsteder per hovedgruppe
### canonical_missing
- `em_naer_felt_arbeid_verdiskaping` → akerselva_industri, akershus_energi, akershus_kaier
- `em_naer_geografi_infrastruktur` → akerselva_industri, akershus_energi, akershus_kaier
- `em_by_historiske_lag_i_hverdagsrom` → akerselva, alexander_kiellands_plass, bjoelsenfossen
- `em_by_infrastruktur_mobilitet` → ankerbrua, beierbrua, bispelokket
- `em_by_offentlige_rom_motesteder` → bankplassen, bjoelsenparken_elvenaer, christiania_torv
### mapping_missing
- Ingen i denne batchen.
### legacy_place_id
- `em_by_opphold_vs_gjennomgang` → birkelunden, botsparken, slottsparken
### wrong_subject
- Ingen i denne batchen.
### unknown_needs_review
- Ingen i denne batchen.

## Klassifisering (vektet på forekomster)
- `canonical_missing`: **505**
- `mapping_missing`: **0**
- `legacy_place_id`: **5**
- `wrong_subject`: **0**
- `unknown_needs_review`: **0**

## Anbefalt batch 08-rekkefølge
1. Rette én kategori/fagfamilie av gangen.
2. Starte med den gruppen som gir mest effekt og lavest risiko.
3. Ikke masseendre alle 510 i én PR.
4. Ikke opprette nye canonical emner før det er verifisert at de faktisk mangler.
5. Ikke slette emne_ids uten semantisk erstatning eller tydelig grunn.
