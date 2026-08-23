# Birkelunden – fase 7A Om V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Baseline `main`: fase-7-audit merge `72622da7b7e0074c3de6966c1b0f0da35b7b9e7d`
- Canonical Place: `data/places/by/oslo/places/birkelunden.json`
- Canonical Leksikon-owner: `data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden.json`
- Popup runtime: `js/ui/place-popup-v2.js`, `js/ui/place-popup-tabs.js`
- Regression: `tests/birkelunden-phase7a-about.test.mjs`
- Status: **KLAR FOR REVIEW / CI**

## 1. Faseoppgave

Fase-7-auditen identifiserte to blockers i Om:

1. den gamle untitled Birkelunden-posten i `leksikon_oslo_by_batch3.json` kunne injisere source-tom `wikiText` og facts i Om;
2. det eldre `nature_profile.summary` kunne rendres synlig selv om biologisk provenance ikke var sluttgodkjent.

7A løser begge uten å omskrive fase-5 `desc`/`popupDesc`, uten å lage ny popup-runtime og uten å korte ned innholdet.

## 2. Om-hovedartikkel – bevart

Fase 5 forblir canonical hovedartikkel:

```text
status: ready_v4_2
claims: 17/17 verified
desc SHA-256: ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe
popupDesc SHA-256: 670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7
```

Regresjonstesten beregner hashene direkte fra canonical Place og krever parity mot `data/places/production/birkelunden.json`.

Det betyr at 7A ikke bruker Nature-/Leksikon-sanering som anledning til å endre den allerede godkjente artikkelen.

## 3. Spatial Om-profil – bevart og runtime-kompatibel

`spatial_profile.area_m2` forblir:

```text
16300 m² = 16,3 daa
```

`place-popup-v2.js` leser `area_m2` og formatterer dette som 16,3 daa.

Fortsatt hard grense:

- 16,3 daa = Birkelunden park;
- ca. 116 daa = større Birkelunden kulturmiljø;
- `r=190` = gameplay-/kartparameter, ikke areal.

Ingen temporal milestone-komponent er lagt til i Om. `temporal_profile` får ikke en parallell visuell eier når tidsfakta allerede finnes i hovedartikkelen og Historie.

## 4. Legacy Leksikon – sanitert med eksisterende migrasjonsmekanisme

### Problemet

Den eldre batch3-posten er untitled og inneholder blant annet:

- generisk parkbruk;
- udokumentert «en av de mest brukte nærparkene»;
- `facts` med `confidence: medium` og `sources: []`;
- generic chronology med `sources: []`;
- article-level `sources: []`.

Popuphydratoren velger én `mainArticle()` og kan legge dens `wikiText`/facts til Om og chronology til Historie.

### Løsningen

7A bruker **allerede eksisterende Torggata-migrasjonsmekanisme**, ikke ny runtime:

Ny manifest-lastet fil:

`data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden.json`

Den har:

- `title: Birkelunden`;
- `type: main`;
- `version: 2`;
- `suppress_untitled_legacy_articles: true`;
- to inspectable Birkelunden-kilder;
- `wikiText: []`;
- `facts: []`;
- `chronology: []`.

Fordi `mainArticle()` prioriterer artikkel med title/name lik place-navnet, blir denne posten canonical Leksikon-main. `visibleArticlesForPopup()` filtrerer da bort untitled legacy-artikler for samme sted.

### Hvorfor legacy-posten ikke slettes

`README_LEKSIKON.md` dokumenterer at Leksikon-loaderen fortsatt støtter legacy compatibility-paths og leseregistreringer. Å slette batchrecorden uten å kjenne alle kompatibilitetskall ville være unødvendig destruktivt.

Den nye main-posten gjør derfor to ting samtidig:

- bevarer legacy resolution uten datatap;
- hindrer source-tomt legacy-innhold i å konkurrere med canonical Om/Historie.

Dette er samme migrasjonsmodell som allerede brukes for Torggata.

## 5. Nature-laget – forbedret, ikke fjernet

### Gammel synlig summary

Det gamle feltet hevdet blant annet:

- mildere lokalklima;
- mat og skjul for pollinatorer og andre byarter;
- leveområde;
- daglig naturkontakt.

Disse formuleringene manglet Birkelunden-spesifikk source→claim-dekning og ble derfor blokkert i fase 7-auditen.

### Ny source-auditert summary

7A erstatter dette med dokumentert Birkelunden-spesifikk natur-/parkhistorie:

- Oslo kommune trekker fram **Birkelundens autentiske bjørkelunder** som karakteristiske parktrær;
- kommunens 2022-artikkel sier at bjørkelundene er fredet som del av det historiske miljøet;
- samme kilde oppga at de eldste trærne da var rundt **140 år**;
- Oslo byleksikon dokumenterer at trærne ble delvis fornyet under parkopprustingen **1984–86**.

Ny profil handler derfor om:

- autentiske bjørkelunder;
- gamle parktrær;
- vern;
- tre-fornyelse;
- langsiktig parkforvaltning.

Den hevder ikke lokale habitat-/pollinator-/lokalklimaeffekter som kildene ikke dokumenterer.

## 6. Nature-kilder

`nature_profile.sources` materialiseres med inspectable HTTPS:

1. Oslo kommune – «Vi må plante trær i hodet og i hjertet på folk»;
2. Oslo byleksikon – Birkelunden.

Profilen får:

```text
review_status: source_audited_visible_layer
verified_at: 2026-08-23
```

Dette betyr at **den synlige Om-summaryen** nå er kildeauditert.

Det betyr ikke at hele flora/fauna-mappingen er biologisk sluttgodkjent. Separat Nature-mapping-QA står fortsatt åpen for artskoblinger, observasjonsgrunnlag og habitatvurdering.

## 7. Bevisst ikke endret

7A endrer ikke:

- `desc`;
- `popupDesc`;
- description production packet;
- `spatial_profile`;
- `temporal_profile`;
- `history_layers`;
- `source_summary`;
- image/provenance;
- coordinates/radius;
- category/emner;
- Nature mapping/unlocks;
- Stories;
- Før/etter;
- News;
- Lesespor;
- Språk;
- Objects/rounds;
- popup JS-runtime.

Canonical Place-endringen er bare revisjon av det allerede synlige `nature_profile`.

## 8. Permanent regresjonstest

`tests/birkelunden-phase7a-about.test.mjs` låser:

- `area_m2: 16300`;
- fase-5 text hashes;
- `ready_v4_2`;
- Nature reviewstatus og verified date;
- Birkelunden-spesifikke Nature-ankere;
- fravær av `pollinator`, `mildere lokalklima` og `leveområde` i synlig Nature-summary;
- minst to HTTPS Nature-kilder;
- manifest-loadet canonical Leksikon-owner;
- `suppress_untitled_legacy_articles: true`;
- tom `wikiText`, facts og chronology på canonical Leksikon-owner;
- at untitled legacy Birkelunden-artikler filtreres ut av popupens visible article set;
- eksisterende runtime-suppressionmekanisme;
- at spatialrenderer bruker `area_m2`;
- fravær av en ny `renderTemporalSection()` i Om.

## 9. 7B-konsekvens

Ved å filtrere bort untitled legacy-artikler løser 7A også **selve legacy chronology-forurensningen** som blokkerte Historie.

Men 7B hoppes ikke over.

7B skal separat QA-e:

- at de fire `history_layers` er eneste sterke timeline-eier;
- at ingen chronology fra manifest-lastede visible Birkelunden-artikler blir rendret;
- at `temporal_profile` ikke dobbeltrendres;
- at Historie-fanen har reell substans og riktig rekkefølge.

Hvis dette allerede er bevist av 7A + eksisterende runtime, kan 7B klassifiseres ALLEREDE FERDIG gjennom en smal permanent Historie-regresjonstest/audit, uten å produsere ny chronology.

## 10. Modell-/kredittmåling

Repo-/runtimesaneringen krevde ingen modell/API-research.

Den nødvendige Nature-kvalitetskontrollen brukte fersk offentlig webresearch mot Oslo kommune og Oslo byleksikon. Ingen kvote eller kostgrense ble brukt til å stoppe researchen.

## 11. Fasebeslutning før CI

```text
SUBPHASE: 7A Om
V4.2 MAIN ARTICLE: BEVART / HASH-PARITY
SPATIAL 16,3 DAA: BEVART / RUNTIME-PARITY
TEMPORAL DUPLICATE UI: NEI
LEGACY LEKSIKON WIKITEXT/FACTS VISIBLE: BLOKKERT VIA EXISTING SUPPRESSION
LEGACY CHRONOLOGY VISIBLE: BLOKKERT VIA SAME SUPPRESSION
NATURE VISIBLE SUMMARY: SOURCE-AUDITERT OG REVIDERT
UNSUPPORTED POLLINATOR/LOCAL-CLIMATE/HABITAT CLAIMS: FJERNET
POPUP RUNTIME CHANGED: NEI
CANONICAL PLACE CHANGED: KUN NATURE_PROFILE
LEKSIKON MIGRATION OWNER: MATERIALISERT
PERMANENT REGRESSION: MATERIALISERT
STATUS: KLAR FOR REVIEW / CI
NEXT AFTER MERGE: 7B Historie
```
