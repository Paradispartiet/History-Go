# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv 7B-baseline `main`: `2f43748cb4c07f31abfb07200f740121084d7ef5`
- Fase 0 merge: #5236 / `d3945c43f10b1f5b4e1b758f915818342f95d240`
- Fase 1 merge: #5239 / `2dbc70a4984e01487a2dd7289d2e93bcbb0d6217`
- Fase 2 merge: #5241 / `61bcf3e1dc0156582eb1e3bd9bfcee6d9ba05c06`
- Fase 3 merge: #5243 / `6983331fd2be89dd6ae9aad51f660503809a305e`
- Fase 4 merge: #5244 / `ffca364854dcf4dec37b5129595f13017d5a7589`
- Fase 5 merge: #5251 / `7ef7d80a334f80f44d48bbbdec60ac8ccf9db6cd`
- Fase 6 merge: #5254 / `735a7490072adc8b7decb133a0aebdd8fb33de36`
- Fase 7 audit merge: #5255 / `72622da7b7e0074c3de6966c1b0f0da35b7b9e7d`
- Fase 7A merge: #5257 / `2f43748cb4c07f31abfb07200f740121084d7ef5`
- Fase 7A review: `reports/place-production/birkelunden-phase7a-about-audit-v1.md`
- Fase 7A regression: `tests/birkelunden-phase7a-about.test.mjs`
- Fase 7B review: `reports/place-production/birkelunden-phase7b-history-audit-v1.md`
- Fase 7B regression: `tests/birkelunden-phase7b-history.test.mjs`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Leksikonkontrakt: `data/leksikon/README_LEKSIKON.md`
- Content Factory: `data/places/regler/content_factory_v1.json`

## Identitet og bevaringslås

Birkelunden er den avgrensede offentlige parken på Grünerløkka.

```text
park: 16,3 dekar / 16 300 m²
kulturmiljø: ca. 116 dekar
coordinate: verified_geometry / osm-way:3236549 / park_anchor
```

Fase-5 description forblir:

```text
status: ready_v4_2
claims: 17/17 verified
desc SHA-256: ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe
popupDesc SHA-256: 670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7
```

## Fasestatus

| Fase | Status |
| --- | --- |
| 0–6 | **FERDIG OG MERGET** |
| 7 popupaudit | **FERDIG OG MERGET** (#5255) |
| 7A Om | **FERDIG OG MERGET** (#5257) |
| 7B Historie | **KLAR FOR REVIEW / CI** |
| 7C Fortellinger | **REELT PRODUKSJONSHULL** – Jack Johnsen/Venner i Bjerkelunden kandidat |
| 7D Før/etter | **REELT PRODUKSJONSHULL** |
| 7E Nyheter | **FERSK RESEARCH KREVES** |
| 7F Lesespor | **REELT RESEARCHHULL** |
| 7G Kilder | **LABELS READY / KLIKKBARE LENKER MANGLER** |
| 7H Språk | **REELL NAVNEHISTORIEKANDIDAT** |
| 8–24 | **ÅPENT** etter canonical rekkefølge |

## 7A – låst tilstand

Om-fanen har nå:

- uendret fase-5 `popupDesc` som hovedartikkel;
- `spatial_profile.area_m2=16300` og korrekt park/kulturmiljø-grense;
- kildeauditert synlig `nature_profile` om Birkelundens bjørker, vern og trehistorie;
- navngitt canonical Leksikon-owner med `suppress_untitled_legacy_articles: true`;
- tomme `wikiText`, `facts` og `chronology`, slik at legacy-data ikke konkurrerer med canonical place-data.

`tests/birkelunden-phase7a-about.test.mjs` kjøres permanent fra `scripts/check-places.sh`.

## 7B – Historie

Canonical Historie-eier forblir `history_layers`; det bygges ingen parallell Leksikon-chronology og ingen generell temporal-renderer.

De fire lagene er:

1. `birkelunden_parken_blir_til` – 1860-årene–1882;
2. `birkelunden_aktivitetspark` – 1916–1928;
3. `birkelunden_moter_og_minnespor` – tidlig 1900-tall–1989;
4. `birkelunden_kulturmiljo` – 1996–2006.

Fase 7B lukker ett konkret dekninghull i lag 3. Tittelen blir **Navn, organisering og minnespor**, og sammendraget inkluderer den allerede verifiserte navnehistorien:

```text
1926: Bjerkelunden blir offisiell navneform
1955: Birkelunden kommer tilbake
```

Dette gjør at de strukturelle hovedmarkørene i `temporal_profile` er representert i den brukerrettede Historie-flaten uten chronology-filler.

Canonical Leksikon-owner forblir:

```text
title: Birkelunden
type: main
suppress_untitled_legacy_articles: true
chronology: []
```

Den gamle untitled legacy chronologyen kan ligge fysisk i batchdata for kompatibilitet, men skal ikke være popup-synlig.

## Permanent 7B-port

`tests/birkelunden-phase7b-history.test.mjs` krever:

- nøyaktig fire canonical history-lag i rekkefølge 10/20/30/40;
- substansielt periode-/tittel-/summary-innhold;
- dekning av 1860-årene, 1882, 1916, 1926, 1955, 1996 og 2006;
- eksplisitt Bjerkelunden → Birkelunden-navnespor i lag 3;
- tom canonical Leksikon chronology;
- legacy chronology ikke synlig ved siden av history_layers;
- runtime-eierskap gjennom `renderHistoryTimeline(place)` og Historie-fanen;
- ingen `renderTemporalSection()`.

Testen er koblet permanent inn i `scripts/check-places.sh` etter 7A-testen.

## Scope 7B

Endres:

1. `data/places/by/oslo/places/birkelunden.json` – kun tredje `history_layers`-tittel/sammendrag;
2. `tests/birkelunden-phase7b-history.test.mjs`;
3. `scripts/check-places.sh` – permanent 7B-teststeg;
4. `reports/place-production/birkelunden-phase7b-history-audit-v1.md`;
5. dette workcardet.

Ikke endret: descriptions/hashes, koordinater, spatial/temporal/nature-profiler, Leksikon-data, popup-JS, Stories, Før/etter, Nyheter, Lesespor, Kilder, Språk, People, Objects, Brands eller Quiz.

Produksjonsmodell/API-kreditter i 7B: **0**, fordi godkjent Birkelunden-evidence allerede dekker endringen fullt ut. Ingen kvalitets- eller innholdsreduksjon er gjort.

## Neste

Etter grønn 7B-merge starter **7C Fortellinger** fra fersk `main`.

7C er reelt innholdsarbeid og skal velge en dokumentert, konkret episode med sterk Birkelunden-eierskap; Jack Johnsen / Venner i Bjerkelunden er første kandidat, men må source-auditeres mot Story-kontrakten før materialisering.
