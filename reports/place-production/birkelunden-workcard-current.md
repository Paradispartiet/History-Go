# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv 7E baseline `main`: `87343213dae6eb4ab17720463f68334184395c68`
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
- Fase 7D review: `reports/place-production/birkelunden-phase7d-before-after-audit-v1.md`
- Fase 7D regression: `tests/birkelunden-phase7d-before-after.test.mjs`
- Fase 7E review: `reports/place-production/birkelunden-phase7e-news-audit-v1.md`
- Fase 7E regression: `tests/birkelunden-phase7e-news.test.mjs`
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
| 7E Nyheter | **KLAR FOR REVIEW / CI** |
| 7F Lesespor | **NESTE – REELT RESEARCHHULL** |
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

## 7D – Før/etter, låst

Canonical `for_na` er materialisert som et datert parkpar:

```text
title: Birkelunden ca. 1930 og 2013
før: Oslo Museum / Mittet & Co / OB.Z02741 / ca. 1930
etter: Carsten R D / Wikimedia Commons / 2013-10-13
```

Felles visuelle ankre er musikkpaviljongen fra 1926, vann-/fonteneområdet og det sentrale åpne parkrommet. Paret er ikke fremstilt som identisk kamerastandpunkt, og 2013-bildet er eksplisitt ikke dokumentasjon av parkens eksakte 2026-tilstand.

`tests/birkelunden-phase7d-before-after.test.mjs` låser datoer, kilder, lisens-/attribusjonskjeder, substansielle before/now/change-felt, own-place-grensen, description-hashene og `area_m2=16300`. Testen kjøres permanent fra `scripts/check-places.sh`.

## 7E – Nyheter

Canonical eier er manifest-lastede Leksikon-oppføringer, samme runtimekontrakt som Torggatta. Canonical Place får ikke et parallelt `news`-felt.

Ny fil:

```text
data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden_news.json
```

### Publisert notis 1 – Oslo Pix

```text
id: birkelunden_news_oslo_pix_utekino_2026
date: 2026-08-25
valid_through: 2026-08-26
status: scheduled
```

Oslo Pix sitt offisielle 2026-program oppgir gratis utekino i Birkelunden 25. og 26. august kl. 19.00: `The Truman Show` tirsdag og `Thelma & Louise` onsdag.

Kilde: `https://www.oslopix.no/no/arrangement/2026/kveldsvisninger-p%C3%A5-birkelunden-gratis-utekino`.

### Publisert notis 2 – Bondens marked

```text
id: birkelunden_news_bondens_marked_host_2026
date: 2026-09-13
valid_through: 2026-12-13
status: scheduled
```

Bondens marked oppgir fire kommende Birkelunden-datoer etter 23. august: 13. september, 18. oktober, 14. november og 13. desember 2026. Produsentantall og andre detaljer som kan endres er bevisst ikke låst inn i notisen.

Kilde: `https://bondensmarked.no/markedsplasser/birkelunden-gr-nerloekka`.

### Holdbacks og own-place

- Oslo kommunes parkside brukes som basis-/identitetskilde, ikke som kunstig nyhet uten ny 2026-hendelse;
- VisitOSLOs løpende søndagsmarked er kontrollert, men holdes ute av denne fasen for å unngå generell kalenderfeed;
- Tankesmien Agendas «Blokka»-side har dato-/ukedagkonflikt og brukes ikke som selvstendig nyhetskilde;
- Paulus' plass, Paulus kirke, Grünerløkka skole, Olaf Ryes plass, Sofienbergparken og området generelt brukes ikke som stedfortredere for Birkelunden.

### Permanent 7E-port

`tests/birkelunden-phase7e-news.test.mjs` krever:

- nøyaktig to proporsjonale `news_note`-oppføringer;
- `place_id: birkelunden`, dato, status, `verifiedAt` og `valid_through`;
- direkte HTTPS-kilde til begge primærarrangører;
- de publiserte Oslo Pix- og Bondens marked-datoene;
- én manifestregistrering rett etter canonical Birkelunden-Leksikon;
- eksisterende runtimeklassifisering/kildevisning;
- own-place-dokumentasjon;
- uendrede fase-5 description-hasher og `area_m2=16300`.

Testen kjøres permanent fra `scripts/check-places.sh` etter 7D-testen.

Produksjonsmodell/API-kreditter i 7E: **0 eksterne modellkall**. Fersk research ble gjort mot åpne primærkilder og kontrollkilder; ingen kvalitetsterskel ble redusert.

## Scope 7E

Endres:

1. ny Birkelunden news Leksikon-fil;
2. `data/leksikon/manifest.json`;
3. `tests/birkelunden-phase7e-news.test.mjs`;
4. `scripts/check-places.sh` – permanent 7E-teststeg;
5. `reports/place-production/birkelunden-phase7e-news-audit-v1.md`;
6. dette workcardet.

Ikke endret: canonical Birkelunden Place, `desc`, `popupDesc`, koordinater, profiler, `for_na`, Story, People, Objects, Nature eller popup-runtime.

## Neste

Etter grønn 7E-merge starter **7F – Lesespor** fra fersk `main`. Fase-7-auditen klassifiserte Lesespor som et reelt researchhull; det skal derfor gjennomføres et nytt strengt søk etter place-linkede åpne lesespor før noe kan markeres ferdig eller begrunnet N/A.
