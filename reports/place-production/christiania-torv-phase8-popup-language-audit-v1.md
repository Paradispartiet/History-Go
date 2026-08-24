# Christiania Torv – fase 8 popup / legacy / språk audit v1

Dato: 2026-08-24  
Place ID: `christiania_torv`  
Baseline: Phase-7 merge `cf41f032bb2be8286d24f4c0ca08d0980147db4d`  
Status: **PASS – klar for permanente porter**

## Eierskap og popupfaner

- **Om:** canonical `popupDesc` og `spatial_profile` forblir hovedkilde. Den tidligere source-tomme batch3-artikkelen er erstattet med kildebundet, stedseid innhold.
- **Historie:** fire canonical `history_layers` beholdes. Leksikon-chronology er begrenset til fem korte, daterte og eksplisitt kildebelagte milepæler; den er ikke en Story-kopi.
- **Fortellinger:** den aktive Phase-6 `episode_v1` beholdes hos Stories-systemet.
- **Før/etter, Nyheter og Lesespor:** ikke fylt med proxyinnhold eller filler. Intet nabobygg brukes som stedfortreder.
- **Kilder:** fem inspectable HTTPS-lenker er materialisert i `externalLinks`, med OSM tydelig avgrenset til geometri.
- **Språk:** tre dokumenterte navnespor er materialisert i Språkleksikon: `Byens gamle Torv`, `Gammel-Torvet` og navnevedtaket `Christiania Torv` fra 1958. Ingen dialekt, uttale eller etymologi er diktet opp.
- **Spor & objekter / relasjoner:** holdes hos Phase 9-eierne; de er ikke improvisert i popupen.

## Place-grense

`gamle_radhus` forblir et separat canonical Place. Rådhuset omtales bare som bygget ved torget og overtar ikke torgets artikkel, chronology eller språkspor.

## Endrede canonical eiere

- `data/places/by/oslo/places/christiania_torv.json`
- `data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json`
- `data/leksikon/sprak/places/europe/norway/oslo/christiania_torv.json`
- `data/leksikon/sprak/manifest.json`

Sluttstatus settes bare til merget etter permanente place-, popup-, leksikon- og Språkleksikonporter.
