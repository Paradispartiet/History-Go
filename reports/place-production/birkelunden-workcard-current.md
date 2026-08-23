# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv fase-7-baseline `main`: `735a7490072adc8b7decb133a0aebdd8fb33de36`
- Fase 0 merge: PR #5236 / `d3945c43f10b1f5b4e1b758f915818342f95d240`
- Fase 1 merge: PR #5239 / `2dbc70a4984e01487a2dd7289d2e93bcbb0d6217`
- Fase 2 merge: PR #5241 / `61bcf3e1dc0156582eb1e3bd9bfcee6d9ba05c06`
- Fase 3 merge: PR #5243 / `6983331fd2be89dd6ae9aad51f660503809a305e`
- Fase 4 merge: PR #5244 / `ffca364854dcf4dec37b5129595f13017d5a7589`
- Fase 5 merge: PR #5251 / `7ef7d80a334f80f44d48bbbdec60ac8ccf9db6cd`
- Fase 6 merge: PR #5254 / `735a7490072adc8b7decb133a0aebdd8fb33de36`
- Fase 5 production package: `data/places/production/birkelunden.json`
- Fase 6 audit: `reports/place-production/birkelunden-phase6-structured-profiles-audit-v1.md`
- Fase 7 audit: `reports/place-production/birkelunden-phase7-popup-tabs-audit-v1.md`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Klynge: **Birkelunden → Olaf Ryes plass**
- Approval unit: **Birkelunden alene**

## Canonical identitet

Birkelunden-place er **selve den avgrensede offentlige parken Birkelunden på Grünerløkka**.

```text
Birkelunden park:              16,3 dekar / 16 300 m²
Birkelunden kulturmiljø:     ca. 116 dekar
Paulus' plass:                  4,4 dekar
```

Parken er ikke synonym med kulturmiljøet, Paulus' plass, Paulus kirke, Grünerløkka skole, holdeplassen, omkringliggende bygårder eller hele Grünerløkka.

Coordinate identity: `verified_geometry / osm-way:3236549 / park_anchor`.

## Fasestatus

| Fase | Status | Beslutning |
| --- | --- | --- |
| 0. Nullmåling | **FERDIG OG MERGET** | #5236 |
| 1. Identity/source boundary | **FERDIG OG MERGET** | #5239 |
| 2. Content Factory source/claim pack | **FERDIG OG MERGET** | #5241 |
| 3. Koordinater | **ALLEREDE FERDIG OG MERGET** | #5243 |
| 4. Kategori/Fagverk/Nature-eierskap | **FERDIG OG MERGET** | #5244; biologisk Nature-QA fortsatt separat |
| 5. `desc` + `popupDesc` v4.2 + image gate | **FERDIG OG MERGET** | #5251; `ready_v4_2`, 17/17 claims, lisensiert bilde |
| 6. Strukturerte place-profiler | **FERDIG OG MERGET** | #5254; `area_m2: 16300`, temporal/history/source materialisert |
| 7. Popupfaner audit | **KLAR FOR REVIEW** | audit-only; ingen brukerdata/runtime endret |
| 7A. Om | **NESTE / BLOCKED** | core ready; legacy Leksikon + ikke-godkjent Nature må løses |
| 7B. Historie | **BLOCKED** | history_layers ready; source-tom legacy chronology må ut |
| 7C. Fortellinger | **REELT PRODUKSJONSHULL** | Jack Johnsen/Venner i Bjerkelunden er sterk kandidat |
| 7D. Før/etter | **REELT PRODUKSJONSHULL** | source-bårne change axes finnes; image pair mangler |
| 7E. Nyheter | **FERSK RESEARCH KREVES** | current market/events ikke godkjent |
| 7F. Lesespor | **REELT RESEARCHHULL** | ingen Birkelunden-items i kontrollerte Oslo-filer |
| 7G. Kilder | **LABELS READY / LINKS MANGLER** | fem safe labels; inspectable externalLinks mangler |
| 7H. Språk | **REELL KANDIDAT** | Birkelunden/Bjerkelunden 1926–1955; Språkleksikon-kontrakt må brukes |
| 8. Rundinger | **IKKE FERDIG** | People/Objects/Brands/Structures må eierauditeres |
| 9. På stedet | **IKKE STARTET** | egen kontrakt |
| 10. Quiz | **REELT PRODUKSJONSHULL** | ingen aktiv Birkelunden-quiz |
| 11–24 | **ÅPENT** | rute, People, Brands, progression, bilder, UI/slutt-QA m.m. |

## Fase 7 audit – eksakt filscope

Kun:

1. `reports/place-production/birkelunden-phase7-popup-tabs-audit-v1.md`;
2. `reports/place-production/birkelunden-workcard-current.md`.

Auditfasen endrer ikke canonical Place, runtime, Leksikon, Nature, Stories, Lesespor, Språk, `for_na`, externalLinks eller andre subsystemdata.

## Popup-runtime – låste eierfunn

- `popupDesc` er Om-hovedartikkel;
- `spatial_profile.area_m2` rendres i Om; `16300` blir `16,3 daa`;
- `history_layers` rendres og flyttes til Historie;
- `temporal_profile` skal ikke få en ekstra milepælrad når samme fakta allerede har visuell eier;
- `source_summary.safe_sources` gir etiketter i Kilder;
- klikkbare Kilder krever `externalLinks`/Før-etter-sources;
- legacy `Mer` fjernes av `place-popup-direct-tabs.js` og eventuelt innhold flyttes til navngitte direktefaner.

## Kritiske blockers før 7A/7B kan ferdigmeldes

### Legacy Leksikon

`data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json` har Birkelunden `version: 1` med:

- generic/source-tom `wikiText`;
- `medium` fact med `sources: []`;
- `medium` chronology «Utviklingsløp» med `sources: []`;
- article-level `sources: []`.

Popuphydratoren kan injisere dette i både Om og Historie. Det skal sanitiseres/retireres, **ikke** oppgraderes ved å kopiere v4.2-artikkelen inn i en parallell Leksikon-eier.

### Nature i Om

Eksisterende `nature_profile.summary` kan rendres synlig, men fase 4 godkjente ikke den biologiske proveniensen. 7A må derfor gjennomføre riktig Nature QA/revisjon eller utelate unsupported Nature-lag fra Om til det er dokumentert.

## Fanestatus

### Om

**CORE READY, BLOCKED**

Behold:
- v4.2 popupDesc;
- desc;
- spatial_profile / 16,3 daa;
- image/provenance;
- én visuell eier per opplysning.

Ikke:
- duplicate temporal timeline;
- source-tom legacy Leksikon;
- ikke-godkjent Nature som ferdig kunnskap.

### Historie

**CORE READY, BLOCKED**

Fire `history_layers` er source-bårne og klare. Legacy chronology må bort. `temporal_profile` skal ikke dobbeltrendres.

### Fortellinger

Ingen canonical Birkelunden Story/narrative funnet. Jack Johnsen/Venner i Bjerkelunden 1937 er primær episodekandidat, men må gjennom Stories governance.

### Før/etter

Ingen `for_na`. Kandidatendringer: 1916–20, 1926-paviljong, 1984–86. Bilder må vise selve parken og ha rettighetsklar provenance.

### Nyheter

Ikke N/A. Krever fersk 2026-research; gamle/current-volatile marked/event-claims kan ikke restemples.

### Lesespor

Ingen `birkelunden` i By-/Historie-filen; Natur-Lesespor er tom. Krever åpne place-spesifikke tekstkandidater.

### Kilder

Safe labels:
- Oslo kommune;
- Oslo byleksikon;
- Riksantikvaren;
- Pensjonistforbundet;
- OSM geometry.

Klikkbare HTTPS externalLinks mangler.

### Språk

Ingen manifestfil, men navnehistorien er reell:
- Birkelunden fra starten;
- Bjerkelunden 1926–1955;
- Birkelunden igjen fra 1955.

Ingen dialekt/etymologi skal oppfinnes.

## Direktefaner

Ingen nye materialiseres nå.

- Object-kandidatene går først gjennom canonical Object/round-eierskap;
- generic legacy interpretation promoteres ikke;
- `related_place_ids` er ikke automatisk curated Relations-fane;
- `quiz_profile` er ikke Knowledge;
- ingen godkjent Birkelunden-observasjonspakke er bevist.

## Fase 5–6 bevaringslås

```text
description status: ready_v4_2
claims: 17/17 verified
desc SHA-256: ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe
popupDesc SHA-256: 670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7
spatial_profile.area_m2: 16300
image: Tore Sætre / Wikimedia Commons / CC BY-SA 4.0
```

## Modell-/kredittmåling i audit

```text
nye eksterne researchkall: 0
modell-/API-kreditter til ny research: 0
```

Repo/runtimen ga nok evidens til selve auditen. Dette gjelder ikke 7C–7H: der audit har funnet researchhull skal de fylles med nødvendig research, aldri med kortere eller generisk innhold.

## Neste fase

Etter grønn merge av audit-PR-en starter **7A – Om** fra fersk `main`.

7A har to konkrete blockeroppgaver:

1. fjern/sanitér Birkelundens source-tomme legacy Leksikon-bidrag til Om;
2. bring synlig Nature-lag gjennom korrekt kilde-QA eller hold unsupported Nature ute til det er dokumentert.

Deretter regression-QA av popupDesc + spatial 16,3 daa + én-visuell-eier-regelen.