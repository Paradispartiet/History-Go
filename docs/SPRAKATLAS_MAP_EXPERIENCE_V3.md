# Språkatlas → kartopplevelse v3

Status: permanent produktkontrakt for kartfokus fra Språkatlas.  
Canonical språkdata: `data/leksikon/sprak/`.  
Canonical Place-data: eksisterende History Go Places / `window.PLACES`.  
Presentasjon: `js/ui/sprakatlas-map-experience-v3.js` over eksisterende `HGMap` / MapLibre.

## Produktregel

Når en lokal talemålsprofil, dialektregion eller makroregion velges i Språkatlaset, kan History Go markere de **allerede eksplisitt koblede canonical Places** på hovedkartet. Kartlaget er transient presentasjon. Det oppretter ingen nye språkdata, koordinater, Places, kartdatabase eller atlasrelasjoner.

For lokale profiler er regelen hard: et kartpunkt kommer bare fra et språk-Place som eksplisitt har profilens ID i `atlas_local_ids`. Region- og makrofokus bygger tilsvarende bare på canonical `atlas_region_ids` og atlasets eksisterende region→makro-relasjon. Runtime får ikke finne nærmeste Place, gjette fra koordinater eller tilordne et sted fordi det ligger innenfor en antatt dialektgrense.

## Brukerflyt

Den eksisterende listen **«Utforsk steder med dokumenterte språkspor»** beholdes som tekstlig og tastaturvennlig navigasjon. Når listen har eksplisitte Place-treff får den i tillegg **«Vis stedet på kartet»** eller **«Vis N steder på kartet»**.

Atlasvalget markerer treffene transient på det eksisterende History Go-kartet. Ett dokumentert sted sentreres; flere får et felles kartutsnitt. Kartmarkørene åpner samme canonical Place gjennom `HGMapView.openPlace()` og dermed vanlig PlaceCard. Det opprettes ingen separat språk-popup eller konkurrerende PlaceCard-rute.

Place → **«Se talemålet i Språkatlas»** bruker atlasets eksisterende `data-atlas-place-selection`. v3 observerer den samme selection-hosten som atlaslisten bruker, slik at reverse navigasjon aktiverer samme dokumenterte kartsett uten en parallell relasjonsmodell.

## Eierskap og evidens

Dialekteierskapet endres ikke. Bare `placeScope: "area"` kan eie dialektinnhold. Konkrete `local_varieties[].feature_evidence` forblir eid av atlasprofilen og kopieres ikke inn i Place-data.

Profiler med `profile_status: "documented_seed"` eller `local_research_required` får ikke konstruerte kartpunkter. De kommer inn i kartflyten først når canonical research/materialisering har gitt dem eksplisitte Place-relasjoner etter de eksisterende Språkatlas-reglene.

## Teknisk kontrakt

- `HGLanguageLayer.loadAtlasPlaceLinks()` er eneste kilde til atlas→Place-rader i v3.
- Lokal seleksjon matcher bare `row.localIds`.
- Regionseleksjon matcher bare `row.regionIds`.
- Makroseleksjon går bare via eksplisitte region-ID-er og atlasets canonical `macro_region_id`.
- Koordinater leses fra det canonical Place-objektet; `lon` er primær lengdegrad.
- Markørene er transient MapLibre-presentasjon og lagrer ingen ny state-/databasekopi.
- Ny atlas-seleksjon erstatter forrige transient markørsett.
- Den eksisterende atlaslisten beholdes selv om kartpresentasjonen er tilgjengelig.

Regresjonsport: `tests/sprakatlas-map-v3.test.mjs` og den permanente `Language layer checks`-workflowen.
