# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv 7A-baseline `main`: `72622da7b7e0074c3de6966c1b0f0da35b7b9e7d`
- Fase 0 merge: #5236 / `d3945c43f10b1f5b4e1b758f915818342f95d240`
- Fase 1 merge: #5239 / `2dbc70a4984e01487a2dd7289d2e93bcbb0d6217`
- Fase 2 merge: #5241 / `61bcf3e1dc0156582eb1e3bd9bfcee6d9ba05c06`
- Fase 3 merge: #5243 / `6983331fd2be89dd6ae9aad51f660503809a305e`
- Fase 4 merge: #5244 / `ffca364854dcf4dec37b5129595f13017d5a7589`
- Fase 5 merge: #5251 / `7ef7d80a334f80f44d48bbbdec60ac8ccf9db6cd`
- Fase 6 merge: #5254 / `735a7490072adc8b7decb133a0aebdd8fb33de36`
- Fase 7 audit merge: #5255 / `72622da7b7e0074c3de6966c1b0f0da35b7b9e7d`
- Fase 7A review: `reports/place-production/birkelunden-phase7a-about-audit-v1.md`
- Fase 7A regression: `tests/birkelunden-phase7a-about.test.mjs`
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
| 7A Om | **KLAR FOR REVIEW / CI** |
| 7B Historie | **NESTE** – forventet smal preservation-QA etter 7A |
| 7C Fortellinger | **REELT PRODUKSJONSHULL** – Jack Johnsen/Venner i Bjerkelunden kandidat |
| 7D Før/etter | **REELT PRODUKSJONSHULL** |
| 7E Nyheter | **FERSK RESEARCH KREVES** |
| 7F Lesespor | **REELT RESEARCHHULL** |
| 7G Kilder | **LABELS READY / KLIKKBARE LENKER MANGLER** |
| 7H Språk | **REELL NAVNEHISTORIEKANDIDAT** |
| 8–24 | **ÅPENT** etter canonical rekkefølge |

## 7A – eksakt filscope

7A kan endre:

1. `data/places/by/oslo/places/birkelunden.json` — kun `nature_profile`;
2. `data/leksikon/manifest.json` — registrere canonical Birkelunden Leksikon-owner;
3. `data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden.json` — ny compatibility main-owner;
4. `tests/birkelunden-phase7a-about.test.mjs`;
5. `reports/place-production/birkelunden-phase7a-about-audit-v1.md`;
6. dette workcardet.

Ingen popup-JS, descriptions, spatial/temporal/history/source-profiler, images, coordinates, category/emner, Nature mapping/unlocks, Stories, Before/After, News, Lesespor, Språk eller rounds endres.

## Om – status etter 7A-endringene

### Hovedartikkel

Beholdt byte-for-byte. Production packet-hash låses i permanent test.

### Spatial

Beholdt:

- `area_m2: 16300` → runtime viser 16,3 daa;
- park/kulturmiljø-grensen;
- ingen bruk av `r=190` som areal.

### Temporal

Ingen ny temporal renderer. Tidsfakta har allerede eier i hovedartikkel/Historie.

### Legacy Leksikon

Ny manifest-lastet main-owner:

`data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden.json`

Den har:

```text
title: Birkelunden
type: main
version: 2
suppress_untitled_legacy_articles: true
wikiText: []
facts: []
chronology: []
```

Dette bruker eksisterende runtime-mekanisme. Den gamle untitled batch3-recorden kan fortsatt eksistere for legacy compatibility, men filtreres ut av popupens visible article set og konkurrerer ikke med Om/Historie.

### Nature i Om

Gamle udokumenterte formuleringer om:

- pollinatorer;
- mildere lokalklima;
- leveområde;
- generisk naturkontakt

er fjernet fra synlig summary.

Ny kildeauditert profil bygger på:

- Oslo kommune: autentiske bjørkelunder; bjørkelundene er fredet som del av historisk miljø; de eldste trærne var oppgitt til rundt 140 år i 2022;
- Oslo byleksikon: trærne ble delvis fornyet i 1984–86.

Profilen har `review_status: source_audited_visible_layer`, `verified_at: 2026-08-23` og inspectable HTTPS-kilder.

Dette lukker den synlige Nature-blockeren i Om. Dyp flora/fauna-mapping-QA står fortsatt åpen og blir ikke falskt godkjent.

## Permanent 7A-port

`tests/birkelunden-phase7a-about.test.mjs` krever:

- phase-5 hash-parity;
- `ready_v4_2`;
- 16,3 daa via `area_m2`;
- kildeauditert Nature summary;
- fravær av gamle unsupported nature claims;
- manifest-lastet named Leksikon main-owner;
- suppression av untitled legacy Birkelunden-records;
- ingen parallelle Leksikon facts/chronology;
- eksisterende `area_m2`-renderer;
- ingen `renderTemporalSection()` i Om.

## Neste

Etter grønn 7A-merge starter **7B Historie** fra fersk `main`.

7B skal ikke produsere ny chronology med mindre en konkret mangel finnes. Den skal først bevise at:

- fire `history_layers` er eneste sterke timeline-eier;
- den untitled legacy chronologyen ikke lenger er popup-synlig etter 7A;
- temporal_profile ikke dobbeltrendres;
- Historie-fanen har korrekt rekkefølge og substans.