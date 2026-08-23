# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv 7F baseline `main`: `1cdb905970aa900ebfede38e9b5a9ae851820461`
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
- Fase 7D review: `reports/place-production/birkelunden-phase7d-before-after-audit-v1.md`
- Fase 7D regression: `tests/birkelunden-phase7d-before-after.test.mjs`
- Fase 7E review: `reports/place-production/birkelunden-phase7e-news-audit-v1.md`
- Fase 7E regression: `tests/birkelunden-phase7e-news.test.mjs`
- Fase 7F review: `reports/place-production/birkelunden-phase7f-reading-trail-audit-v1.md`
- Fase 7F regression: `tests/birkelunden-phase7f-reading-trail.test.mjs`
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
| 7F Lesespor | **KLAR FOR REVIEW / CI** |
| 7G Kilder | **NESTE – LABELS READY / KLIKKBARE LENKER MANGLER** |
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

## 7D – Før/etter, låst

Canonical `for_na` er materialisert som et datert parkpar:

```text
title: Birkelunden ca. 1930 og 2013
før: Oslo Museum / Mittet & Co / OB.Z02741 / ca. 1930
etter: Carsten R D / Wikimedia Commons / 2013-10-13
```

Felles visuelle ankre er musikkpaviljongen fra 1926, vann-/fonteneområdet og det sentrale åpne parkrommet. Paret er ikke fremstilt som identisk kamerastandpunkt, og 2013-bildet er eksplisitt ikke dokumentasjon av parkens eksakte 2026-tilstand.

`tests/birkelunden-phase7d-before-after.test.mjs` låser datoer, kilder, lisens-/attribusjonskjeder, substansielle before/now/change-felt, own-place-grensen, description-hashene og `area_m2=16300`. Testen kjøres permanent fra `scripts/check-places.sh`.

## 7E – Nyheter, låst

Canonical eier er manifest-lastede Leksikon-oppføringer, samme runtimekontrakt som Torggata. Canonical Place har ikke et parallelt `news`-felt.

Publisert:

```text
birkelunden_news_oslo_pix_utekino_2026
2026-08-25 → 2026-08-26

birkelunden_news_bondens_marked_host_2026
2026-09-13 → 2026-12-13
```

Oslo Pix-notisen gjelder gratis utekino 25. og 26. august. Bondens marked-notisen låser bare de fire kommende Birkelunden-datoene 13. september, 18. oktober, 14. november og 13. desember 2026. Begge har direkte primærkilder, `verifiedAt: 2026-08-23` og eksplisitt freshness-grense.

`tests/birkelunden-phase7e-news.test.mjs` kjøres permanent fra `scripts/check-places.sh`.

## 7F – Lesespor

Canonical eier er manifest-lastede `history_go_lesespor_v1`-filer. Ny stedsspesifikk fil:

```text
data/lesespor/oslo/lesespor_oslo_birkelunden.json
```

Tre åpne `link_only`-spor er materialisert:

```text
lesespor_birkelunden_byleksikon_001
Oslo byleksikon – Birkelunden

lesespor_birkelunden_riksantikvaren_001
Riksantikvaren – Birkelunden – Murbyens hjerte

lesespor_birkelunden_pensjonistforbundet_001
Pensjonistforbundet – Vår historie
```

### Perspektivdeling

- Oslo byleksikon: sammenhengende parkhistorie og anlegg;
- Riksantikvaren: murby, offentlig rom og kulturmiljø som kontekst;
- Pensjonistforbundet: Jack Johnsen, benken, møteplassen og organiseringen i 1937.

Alle tre har eksakt `place_ids: ["birkelunden"]`, `access: open`, `rights: link_only`, `verifiedAt: 2026-08-23` og direkte HTTPS-lenke. Artikkeltekst kopieres ikke.

### Own-place og holdbacks

- park og større kulturmiljø skilles eksplisitt i de to første sporene;
- Paulus kirke, Paulus' plass, Grünerløkka skole, Olaf Ryes plass og andre naboplaces brukes ikke som stedfortredere;
- Store norske leksikon er kontrollert, men holdes tilbake fordi det overlapper Oslo byleksikon mer enn det tilfører et fjerde perspektiv;
- tre spor er valgt framfor en generell lenkekatalog.

### Permanent 7F-port

`tests/birkelunden-phase7f-reading-trail.test.mjs` krever:

- nøyaktig tre Birkelunden-spor;
- eksakte IDs, `place_ids`, åpen tilgang og `link_only`;
- direkte URL-er og `verifiedAt`;
- manifestregistrering rett etter den generelle Oslo By-filen;
- eksisterende runtimefilter for place-ID og betalingsmur;
- auditert perspektivbredde/own-place;
- uendrede fase-5 description-hasher og `area_m2=16300`.

Testen kjøres permanent fra `scripts/check-places.sh` etter 7E-testen.

Produksjonsmodell/API-kreditter i 7F: **0 eksterne modellkall**. Åpne nettsider og repo-/runtimekontrakter var tilstrekkelige; ingen kvalitetsterskel ble redusert.

## Scope 7F

Endres:

1. ny Birkelunden Lesespor-fil;
2. `data/lesespor/manifest.json`;
3. `tests/birkelunden-phase7f-reading-trail.test.mjs`;
4. `scripts/check-places.sh` – permanent 7F-teststeg;
5. `reports/place-production/birkelunden-phase7f-reading-trail-audit-v1.md`;
6. dette workcardet.

Ikke endret: canonical Birkelunden Place, `desc`, `popupDesc`, koordinater, profiler, `for_na`, Story, People, Objects, Nature, news-data eller popup-runtime.

## Neste

Etter grønn 7F-merge starter **7G – Kilder** fra fersk `main`. Fase-2 source/claim-pakken og `source_summary.safe_sources` har allerede sterke source-labels, men den brukerrettede Kilder-fanen skal få dedupliserte, inspectable HTTPS-lenker og eksplisitt source-eierskap uten å vise tekniske kontroll-ID-er som kilder.
