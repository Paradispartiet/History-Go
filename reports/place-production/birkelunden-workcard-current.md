# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv 7D baseline `main`: `fe97609bb188f2170845bce22c6dcb93b0732f16`
- Fase 0 merge: #5236 / `d3945c43f10b1f5b4e1b758f915818342f95d240`
- Fase 1 merge: #5239 / `2dbc70a4984e01487a2dd7289d2e93bcbb0d6217`
- Fase 2 merge: #5241 / `61bcf3e1dc0156582eb1e3bd9bfcee6d9ba05c06`
- Fase 3 merge: #5243 / `6983331fd2be89dd6ae9aad51f660503809a305e`
- Fase 4 merge: #5244 / `ffca364854dcf4dec37b5129595f13017d5a7589`
- Fase 5 merge: #5251 / `7ef7d80a334f80f44d48bbbdec60ac8ccf9db6cd`
- Fase 6 merge: #5254 / `735a7490072adc8b7decb133a0aebdd8fb33de36`
- Fase 7 audit merge: #5255 / `72622da7b7e0074c3de6966c1b0f0da35b7b9e7d`
- Fase 7A merge: #5257 / `2f43748cb4c07f31abfb07200f740121084d7ef5`
- Fase 7B merge: #5262 / `54e7177a5a3b4563eafe4b0c40e8667348cbe67e`
- Fase 7C merge: #5266 / `8fbdbaf703b8987956eae9ca9576d68839447982`
- Fase 7D review: `reports/place-production/birkelunden-phase7d-before-after-audit-v1.md`
- Fase 7D regression: `tests/birkelunden-phase7d-before-after.test.mjs`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`

## Bevaringslås

```text
park: 16,3 dekar / 16 300 m²
kulturmiljø: ca. 116 dekar
coordinate: verified_geometry / osm-way:3236549 / park_anchor
desc SHA-256: ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe
popupDesc SHA-256: 670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7
```

## Fasestatus

| Fase | Status |
| --- | --- |
| 0–6 | **FERDIG OG MERGET** |
| 7 popup-audit | **FERDIG OG MERGET** (#5255) |
| 7A Om | **FERDIG OG MERGET** (#5257) |
| 7B Historie | **FERDIG OG MERGET** (#5262) |
| 7C Fortellinger | **FERDIG OG MERGET** (#5266) |
| 7D Før/etter | **KLAR FOR REVIEW / CI** |
| 7E Nyheter | **FERSK RESEARCH KREVES** |
| 7F Lesespor | **REELT RESEARCHHULL** |
| 7G Kilder | **LABELS READY / KLIKKBARE LENKER MANGLER** |
| 7H Språk | **REELL NAVNEHISTORIEKANDIDAT** |
| 8–24 | **ÅPENT** etter canonical rekkefølge |

## 7A – Om, låst

- fase-5 `popupDesc` er hovedartikkel;
- `spatial_profile.area_m2=16300`;
- park/kulturmiljø-grensen er eksplisitt;
- synlig Nature-tekst er kildeauditert mot Birkelundens faktiske bjørkelunder/trehistorie;
- canonical Leksikon-owner har `suppress_untitled_legacy_articles: true` og tomme `wikiText`, `facts`, `chronology`;
- `tests/birkelunden-phase7a-about.test.mjs` kjøres permanent fra `scripts/check-places.sh`.

## 7B – Historie, låst

Canonical Historie-eier er fire `history_layers`. Lag 3 dekker navnesporet:

```text
1926: Bjerkelunden blir offisiell navneform
1955: Birkelunden kommer tilbake
```

Ingen parallell Leksikon-chronology eller generell temporal-renderer. `tests/birkelunden-phase7b-history.test.mjs` kjøres permanent fra `scripts/check-places.sh`.

## 7C – Fortellinger, låst

Aktiv Story:

```text
id: st_birkelunden_bench_to_association
title: Da parkbenken ble en forening
quality_profile: episode_v1
type: turning_point
year: 1937
place_id: birkelunden
person_id: null
related_people: []
related_places: []
next_scenes: []
```

Narrativ akse: 10–12 pensjonister på benk → hvilebrakke → 18 personer → organisering i 1937 → Jack Johnsen-bysten 1984.

Kildevarianten `Venner i Bjerkelunden` / `Venner i Birkelund` er eksplisitt bevart. Superlativet `Norges/landets eldste pensjonistforening` er fortsatt held back. Storyen ligger i canonical Stories-manifest og strict episode-v1-manifest. Permanent 7C-test kjøres i `Stories governance`.

## 7D – Før/etter

Canonical `for_na` er nå materialisert som et datert parkpar:

```text
title: Birkelunden ca. 1930 og 2013
før: Oslo Museum / Mittet & Co / OB.Z02741 / ca. 1930
etter: Carsten R D / Wikimedia Commons / 2013-10-13
```

### Før

- medie-URL: `https://ems.dimu.org/image/012sB3HjP2a4?dimension=1200x1200`;
- kilde: `https://oslobilder.no/OMU/OB.Z02741`;
- kredit: `Mittet & Co / Oslo Museum (OB.Z02741)`;
- Oslobilder oppgir: `Creative Commons 3.0`;
- katalogisert motiv: selve Birkelunden med park, musikkpaviljong, lekeplass, lekeapparater og benker.

Lisensen lagres med akkurat den spesifisiteten kilden gir. Ingen CC-undertype gjettes.

### Etter / moderne sammenligningslag

- medie-URL: `https://upload.wikimedia.org/wikipedia/commons/c/ca/Birkelunden_fountain_and_music_pavilion.jpg`;
- kilde: `https://commons.wikimedia.org/wiki/File:Birkelunden_fountain_and_music_pavilion.jpg`;
- fotograf: Carsten R D;
- lisens: `CC BY-SA 4.0`;
- dato: 2013-10-13;
- kamera-posisjon: `59.926374, 10.760091`.

2013 beskrives ikke som parkens eksakte 2026-tilstand. Det er et moderne, datert sammenligningslag.

### Felles visuelle ankre

1. den runde musikkpaviljongen fra 1926;
2. vann-/fonteneområdet, etablert som basseng 1927–28;
3. det sentrale åpne parkrommet.

Paret er ikke påstått å være fotografert fra identisk kamera-posisjon. Verdien er at de samme fysiske parkankrene gjør tidsforskjellen lesbar.

### Avviste 7D-spor

- Riksantikvaren ca. 1905: sterk kandidat, men ikke fullstendig verifisert gjenbruksrett for akkurat nettsidefilen;
- Commons Birkelunden 2022: full filside-/forfatter-/lisenskjede lot seg ikke stabilt verifisere i denne kjøringen;
- Journalen/OsloMet 2025: nyere, men ingen etablert fri gjenbrukslisens;
- Thorvald Meyers gate 2024: gaten nedenfor parken, ikke selve canonical place;
- canonical hovedbilde 2015: rettighetsklart, men svakere motivsamsvar med 1930-bildet.

### Permanent 7D-port

`tests/birkelunden-phase7d-before-after.test.mjs` krever:

- eksakte datoer og bildekilder;
- begge krediterings-/lisenskjeder;
- paviljong og vannområde som felles ankre;
- substansielle `before`, `now`, `change`;
- eksplisitt begrensning mot å fremstille 2013 som 2026;
- fire inspectable HTTPS-kilder;
- uendrede fase-5 description-hasher og `area_m2=16300`;
- eksisterende `for_na`- og attribusjonsruntime.

Testen er koblet permanent inn i `scripts/check-places.sh` etter 7A og 7B.

Produksjonsmodell/API-kreditter i 7D: **0 eksterne modellkall**. Repo-evidence, offentlige kataloger, Commons-metadata og bilde-QA var tilstrekkelig; ingen kvalitetsreduksjon.

## Scope 7D

Endres:

1. canonical Birkelunden JSON – kun ny `for_na`;
2. `tests/birkelunden-phase7d-before-after.test.mjs`;
3. `scripts/check-places.sh` – permanent 7D-teststeg;
4. 7D-audit;
5. dette workcardet.

Ikke endret: `desc`, `popupDesc`, koordinater, profiler, Story, People, Objects, Leksikon eller popup-runtime.

## Neste

Etter grønn 7D-merge starter **7E – Nyheter** fra fersk `main`. Nyhetsfasen skal bruke fersk 2026-research, date-stemple notiser og bare materialisere Birkelunden-relevante aktuelle hendelser/forvaltningsforhold som består freshness-gaten.
