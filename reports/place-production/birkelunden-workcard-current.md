# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv 7G baseline `main`: `090c299adba3d6a39f5f45f4ab930b2504e9200f`
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
- Fase 7D merge: #5272 / `506540cfff848178017e387bfb33d8da8d7336f7`
- Fase 7E merge: #5276 / `1cdb905970aa900ebfede38e9b5a9ae851820461`
- Fase 7F merge: #5280 / `090c299adba3d6a39f5f45f4ab930b2504e9200f`
- Fase 7F review: `reports/place-production/birkelunden-phase7f-reading-trail-audit-v1.md`
- Fase 7G review: `reports/place-production/birkelunden-phase7g-sources-audit-v1.md`
- Fase 7G regression: `tests/birkelunden-phase7g-sources.test.mjs`
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
| 7D Før/etter | **FERDIG OG MERGET** (#5272) |
| 7E Nyheter | **FERDIG OG MERGET** (#5276) |
| 7F Lesespor | **FERDIG OG MERGET** (#5280) |
| 7G Kilder | **KLAR FOR REVIEW / CI** |
| 7H Språk | **NESTE – REELL NAVNEHISTORIEKANDIDAT** |
| 8–24 | **ÅPENT** etter canonical rekkefølge |

## 7A – Om, låst

- fase-5 `popupDesc` er hovedartikkel;
- `spatial_profile.area_m2=16300`;
- park/kulturmiljø-grensen er eksplisitt;
- synlig Nature-tekst er kildeauditert mot Birkelundens faktiske bjørkelunder/trehistorie;
- canonical Leksikon-owner har `suppress_untitled_legacy_articles: true` og tomme `wikiText`, `facts`, `chronology`;
- permanent 7A-test kjøres fra `scripts/check-places.sh`.

## 7B – Historie, låst

Canonical Historie-eier er fire `history_layers`. Lag 3 dekker navnesporet 1926 `Bjerkelunden` → 1955 `Birkelunden`. Ingen parallell Leksikon-chronology eller generell temporal-renderer.

## 7C – Fortellinger, låst

Aktiv Story er `st_birkelunden_bench_to_association`, «Da parkbenken ble en forening», `episode_v1`, `turning_point`, 1937. Narrativ akse: 10–12 pensjonister på benk → hvilebrakke → 18 personer → organisering i 1937 → Jack Johnsen-bysten 1984. Kildevarianten `Venner i Bjerkelunden` / `Venner i Birkelund` er eksplisitt bevart. Superlativet `Norges/landets eldste pensjonistforening` er fortsatt held back.

## 7D – Før/etter, låst

Canonical `for_na` er `Birkelunden ca. 1930 og 2013`, med Oslo Museum / Mittet & Co / OB.Z02741 som førbilde og Carsten R D / Wikimedia Commons som 2013-bilde. Paviljongen, vannområdet og parkrommet er felles ankre; bildene fremstilles ikke som identisk kamerastandpunkt eller som dokumentasjon av eksakt 2026-tilstand.

## 7E – Nyheter, låst

To ferskverifiserte 2026-notiser er manifest-lastet: gratis Oslo Pix-utekino 25.–26. august og Bondens marked 13. september, 18. oktober, 14. november og 13. desember. Static parkfakta og proxy-steder brukes ikke som kunstige nyheter.

## 7F – Lesespor, låst

Canonical eier er `data/lesespor/oslo/lesespor_oslo_by.json`. Tre åpne, place-linkede, `link_only`-spor er publisert:

1. Riksantikvaren – `Birkelunden – Murbyens hjerte`;
2. Oslo Byarkiv / TOBIAS – Ellen Røsjø, `Birkelunden – «distancerer Studenterlunden i Trivsel!»`, 2006, trykksider 42–45;
3. Oslo byleksikon – `Birkelunden`.

Alle tre har `place_ids: [birkelunden]`, `verifiedAt: 2026-08-23` og ingen fulltekstkopiering. Duplikat-PR #5278 ble lukket uten merge; #5280 er canonical 7F-fasit fordi den bevarer filformatet og bruker den dypere Byarkiv-lesningen uten bred reformatteringschurn.

## 7G – Kilder

Canonical brukerrettet Kilder-owner er:

`data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden.json`

Owner oppgraderes til `version: 3` og får syv unike HTTPS `externalLinks`.

### Fem kjerne-evidenskilder

1. `Oslo kommune – Birkelunden`;
2. `Oslo byleksikon – Birkelunden`;
3. `Riksantikvaren – Birkelunden, Murbyens hjerte`;
4. `Pensjonistforbundet – Vår historie`;
5. `OpenStreetMap way 3236549 – Birkelunden`.

Disse dekker alle fem labels i `place.source_summary.safe_sources`.

### To navngitte Før/etter-bildekilder

6. `Oslo Museum / Oslobilder – Birkelunden ca. 1930 (OB.Z02741)`;
7. `Wikimedia Commons – Birkelunden fontene og musikkpaviljong (2013)`.

`for_na.sources` inneholder også byleksikon og Riksantikvaren; disse overlapper kjernesettet og materialiseres ikke på nytt. Eksisterende runtime kombinerer configured links før generiske Før/etter-links og dedupliserer på URL.

### Kildegrense

Ingen interne audit-, report-, production-, claim-bank-, source-pack- eller coordinate-filer gjøres brukerrettede. `article.sources` beholdes som evidensobjekter; `externalLinks` er bare inspectable navigasjon i Kilder-fanen.

### Permanent 7G-port

`tests/birkelunden-phase7g-sources.test.mjs` krever:

- version 3 og syv dedupliserte HTTPS-lenker;
- full mapping av fem `safe_sources`;
- full mapping av fire `for_na.sources` og begge image source pages;
- meningsfulle Oslobilder-/Commons-labels;
- fravær av interne kilder;
- eksisterende runtime-deduplisering;
- uendrede fase-5 description-hasher og `area_m2=16300`.

Testen kjøres permanent fra `scripts/check-places.sh` etter 7F.

Produksjonsmodell/API-kreditter i 7G: **0 eksterne modellkall**. Fasen gjenbruker allerede godkjent Birkelunden-evidence uten redusert kvalitet eller innhold.

## Scope 7G

Endres:

1. Birkelunden Leksikon-owner – kun version + `externalLinks`;
2. `tests/birkelunden-phase7g-sources.test.mjs`;
3. `scripts/check-places.sh` – permanent 7G-test;
4. `reports/place-production/birkelunden-phase7g-sources-audit-v1.md`;
5. dette workcardet.

Canonical Place JSON, descriptions, profiler, Story, Før/etter-data, News, Lesespor, People, Objects, Nature og popup-runtime endres ikke.

## Neste

Etter grønn 7G-merge starter **7H – Språk** fra fersk `main`. Språkleksikon-kontrakten skal leses før materialisering. Kandidaten er det dokumenterte navnesporet `Birkelunden → Bjerkelunden (1926) → Birkelunden (1955)`. Ingen generisk park-etymologi eller oppfunnet dialekt.
