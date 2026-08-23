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
- Fase 7D review: `reports/place-production/birkelunden-phase7d-before-after-audit-v1.md`
- Fase 7E review: `reports/place-production/birkelunden-phase7e-news-audit-v1.md`
- Fase 7F review: `reports/place-production/birkelunden-phase7f-reading-trail-audit-v1.md`
- Fase 7F regression: `tests/birkelunden-phase7f-reading-trail.test.mjs`
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
- `tests/birkelunden-phase7a-about.test.mjs` kjøres permanent fra `scripts/check-places.sh`.

## 7B – Historie, låst

Canonical Historie-eier er fire `history_layers`. Lag 3 heter **Navn, organisering og minnespor** og dekker den verifiserte navneperioden:

```text
1926: Bjerkelunden blir offisiell navneform
1955: Birkelunden kommer tilbake
```

Det bygges ingen parallell Leksikon-chronology og ingen generell temporal-renderer. `tests/birkelunden-phase7b-history.test.mjs` kjøres permanent fra `scripts/check-places.sh`.

## 7C – Fortellinger

Ny active Story:

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

Narrativ akse:

```text
10–12 pensjonister på benk
→ låner hvilebrakke
→ 18 personer
→ organiserer seg i 1937
→ senere fysisk minnespor: Jack Johnsen-bysten 1984
```

Tre inspectable kilder:

1. Pensjonistforbundet – Vår historie;
2. Oslo Byarkiv – TOBIAS 2–3/2006;
3. Oslo byleksikon – Birkelunden.

Kildevarianten er eksplisitt bevart:

```text
Pensjonistforbundet: «Venner i Bjerkelunden»
Oslo Byarkiv:        «Venner i Birkelund»
```

Storyen normaliserer ikke disse til én historisk form.

Held-back:

```text
«Norges/landets eldste pensjonistforening» → IKKE PROMOTERT
```

Jack Johnsen har ingen canonical People-ID i dagens repo. Han kan derfor være dokumentert aktør i teksten og `episode.actors`, men får ingen oppfunnet `person_id`/`related_people`.

Maskinscore etter aktiv `runtimeScore()`:

```json
{
  "narrative": 3,
  "historical": 2,
  "source": 5,
  "play_value": 3,
  "originality": 3,
  "total": 16
}
```

Scoren er ikke keyword-optimalisert; den skal være eksakt mot motoren. Narrativ kvalitet vurderes separat gjennom Story-governance.

Permanent 7C-port:

- `tests/birkelunden-phase7c-story.test.mjs`;
- kjøres i `.github/workflows/stories-governance.yml`;
- låser episode, kilder, navnevariant, held-back superlativ, tomme relasjoner, manifests og score.

Modell/API-kreditter i 7C: **0 eksterne modellkall**. Evidence ble gjenbrukt og offentlige kilder verifisert uten kvalitetsreduksjon.

## 7D – Før/etter, låst

Canonical `for_na` er materialisert som et datert parkpar:

```text
title: Birkelunden ca. 1930 og 2013
før: Oslo Museum / Mittet & Co / OB.Z02741 / ca. 1930
etter: Carsten R D / Wikimedia Commons / 2013-10-13
```

Felles visuelle ankre er musikkpaviljongen fra 1926, vann-/fonteneområdet og det sentrale åpne parkrommet. Paret er ikke fremstilt som identisk kamerastandpunkt, og 2013-bildet er eksplisitt ikke dokumentasjon av parkens eksakte 2026-tilstand.

`tests/birkelunden-phase7d-before-after.test.mjs` låser datoer, kilder, lisens-/attribusjonskjeder, substansielle before/now/change-felt, own-place-grensen, description-hashene og `area_m2=16300`.

## 7E – Nyheter, låst

Nyhetsfil:

`data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden_news.json`

Publisert:

1. `birkelunden_news_oslo_pix_utekino_2026` – gratis Oslo Pix-utekino 25.–26. august 2026, `valid_through: 2026-08-26`;
2. `birkelunden_news_bondens_marked_host_2026` – Bondens marked 13. september, 18. oktober, 14. november og 13. desember 2026, `valid_through: 2026-12-13`.

Begge ble ferskverifisert 23. august 2026 mot primærarrangør. Static parkfakta, løpende kalenderfeed og proxy-steder brukes ikke som kunstige nyheter. `tests/birkelunden-phase7e-news.test.mjs` kjøres permanent fra `scripts/check-places.sh`.

## 7F – Lesespor

Canonical eier er den eksisterende kategorifilen:

`data/lesespor/oslo/lesespor_oslo_by.json`

7F materialiserer tre åpne, direkte og place-linkede spor:

### 1. Riksantikvaren

```text
id: lesespor_birkelunden_riksantikvaren_001
title: Birkelunden – Murbyens hjerte
author: Synne Vik Torsdottir
publication: Riksantikvaren
date: 2022-04-08
access: open
rights: link_only
source_quality: institutional
```

Lesesporet gir langlesing om byplan, murby, Thorvald Meyer, park/kulturmiljø-grensen og fredningshistorien. Riksantikvarens sterke «første»-formulering restemples ikke som egen History Go-claim.

### 2. Oslo Byarkiv / TOBIAS

```text
id: lesespor_birkelunden_byarkiv_2006_001
title: Birkelunden – «distancerer Studenterlunden i Trivsel!»
author: Ellen Røsjø
publication: Oslo Byarkiv – TOBIAS
year: 2006
trykksider: 42–45
access: open
rights: link_only
source_quality: institutional
```

Dette er den rikeste historiske lesningen: parkplanlegging, fysisk omlegging, paviljong/vannbasseng, sosial og politisk bruk og minnespor i samme artikkel.

### 3. Oslo byleksikon

```text
id: lesespor_birkelunden_byleksikon_001
title: Birkelunden
publication: Oslo byleksikon
access: open
rights: link_only
source_quality: recognized
```

Dette er et kortere direkte stedsoppslag som kompletterer de to langlesningene.

Alle tre har:

```text
place_ids: [birkelunden]
verifiedAt: 2026-08-23
curation_status: strong_candidate
```

Ingen oppføring bruker Paulus' plass, Paulus kirke, Grünerløkka skole, Olaf Ryes plass eller Sofienbergparken som proxy. Fulltekst kopieres ikke; History Go publiserer metadata, egen kort beskrivelse/relevans og ekstern lenke.

Oslohistorie-kandidatene ble kontrollert, men ikke valgt fordi de tre publiserte sporene gir sterkere institusjonelt/etablert kildeeierskap og allerede dekker byplan-, arkiv- og oppslagsbehovet.

### Permanent 7F-port

`tests/birkelunden-phase7f-reading-trail.test.mjs` krever:

- nøyaktig tre Birkelunden-spor og stabile ID-er;
- `place_ids: [birkelunden]` uten proxy-steder;
- `access: open`, `rights: link_only`, `verifiedAt: 2026-08-23`;
- korrekte direkte HTTPS-lenker, forfatter-/publikasjonsmetadata og source quality;
- TOBIAS-sider 42–45;
- at Riksantikvaren-Lesesporet ikke restempler held-back «første»-claim i vår beskrivelse;
- ingen kontraktstridig Birkelunden-spesialfil i manifestet;
- eksisterende runtime-filter for place og betalingsmur;
- uendrede fase-5 description-hasher og `area_m2=16300`.

Testen kjøres permanent fra `scripts/check-places.sh` etter 7E-testen.

Produksjonsmodell/API-kreditter i 7F: **0 eksterne modellkall**. Åpne kilder ble kontrollert direkte; ingen kvalitetsterskel eller innholdsmengde ble redusert.

## Scope 7F

Endres:

1. `data/lesespor/oslo/lesespor_oslo_by.json` – tre nye Birkelunden-items + `generated_at`;
2. `tests/birkelunden-phase7f-reading-trail.test.mjs`;
3. `scripts/check-places.sh` – permanent 7F-teststeg;
4. `reports/place-production/birkelunden-phase7f-reading-trail-audit-v1.md`;
5. dette workcardet.

Ikke endret: canonical Birkelunden Place, descriptions, profiler, `for_na`, Story, Leksikon/News, People, Objects, Nature, popup-runtime eller Lesespor-manifestets filsett.

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
