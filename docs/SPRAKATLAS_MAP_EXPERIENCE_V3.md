# Språkatlas → kartopplevelse v3

Status: permanent produktkontrakt for kartfokus fra Språkatlas.  
Canonical språkdata: `data/leksikon/sprak/`.  
Canonical Place-data: eksisterende History Go Places / `window.PLACES`.  
Presentasjon: `js/ui/sprakatlas-map-experience-v3.js` over eksisterende `HGMap` / MapLibre.

## Produktregel

**Språkatlas Norge eies nå av den separate siden `sprakatlas.html` og skal ikke renderes inne i PlaceCard.** Normal atlasbruk skjer derfor uten et samtidig MapLibre-kart i samme DOM.

De eksplisitte atlas→Place-relasjonene er fortsatt canonical. For lokale profiler er regelen hard: et Place kan bare kobles når språkfilen eksplisitt har profilens ID i `atlas_local_ids`. Region- og makrofokus bygger tilsvarende bare på canonical `atlas_region_ids` og atlasets eksisterende region→makro-relasjon. Runtime får ikke finne nærmeste Place, gjette fra koordinater eller tilordne et sted fordi det ligger innenfor en antatt dialektgrense.

`js/ui/sprakatlas-map-experience-v3.js` beholdes fail-closed som kompatibilitetsruntime for en eventuell atlas-seleksjon som faktisk sameksisterer med hovedkartet, men standalone-siden laster den ikke. Den skal ikke brukes til å trekke atlaset tilbake inn i PlaceCard.

## Brukerflyt

Den eksisterende listen **«Utforsk steder med dokumenterte språkspor»** beholdes som tekstlig og tastaturvennlig navigasjon på `sprakatlas.html`. Et Place-treff åpner hovedappen på det canonical Place-et; det opprettes ingen separat språk-popup eller konkurrerende PlaceCard-rute.

Place → **«Se talemålet i Språkatlas»** navigerer til `sprakatlas.html?focus=<atlas-id>`. Standalone-siden aktiverer den samme canonical atlas-seleksjonen og viser dokumenterte Place-koblinger. Hovedinngangen er **Header Menu → Læring → Språkatlas Norge**.

Kompatibilitetsruntime v3 kan fortsatt bruke `HGMapView.openPlace()` når den kjører i en hovedkartkontekst, men dette er ikke lenger atlasets normale brukerflate.

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
