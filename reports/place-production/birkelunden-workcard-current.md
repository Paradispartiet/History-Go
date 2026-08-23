# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv 7C branch-baseline `main`: `847a2e8ca3e71a3bfdd9bc41e7029a41e1c9dec4`
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
- Fase 7A review: `reports/place-production/birkelunden-phase7a-about-audit-v1.md`
- Fase 7B review: `reports/place-production/birkelunden-phase7b-history-audit-v1.md`
- Fase 7C review: `reports/place-production/birkelunden-phase7c-story-audit-v1.md`
- Fase 7C evidence: `reports/place-production/birkelunden-phase7c-story-source-addendum-v1.json`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Story governance: `docs/STORIES_DATA_GOVERNANCE.md`

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
| 7C Fortellinger | **KLAR FOR REVIEW / CI** |
| 7D Før/etter | **REELT PRODUKSJONSHULL** |
| 7E Nyheter | **FERSK RESEARCH KREVES** |
| 7F Lesespor | **REELT RESEARCHHULL** |
| 7G Kilder | **LABELS READY / KLIKKBARE LENKER MANGLER** |
| 7H Språk | **REELL NAVNEHISTORIEKANDIDAT** |
| 8–24 | **ÅPENT** etter canonical rekkefølge |

## 7A – Om, låst

- fase-5 `popupDesc` forblir hovedartikkel;
- `spatial_profile.area_m2=16300`;
- park/kulturmiljø-grensen er eksplisitt;
- synlig Nature-tekst er kildeauditert mot Birkelundens faktiske bjørkelunder/trehistorie;
- canonical Leksikon-owner har `suppress_untitled_legacy_articles: true` og tomme `wikiText`, `facts`, `chronology`;
- `tests/birkelunden-phase7a-about.test.mjs` kjøres permanent fra `scripts/check-places.sh`.

## 7B – Historie, låst

Canonical Historie-eier er fire `history_layers` i sorteringsrekkefølge 10/20/30/40. Lag 3 heter nå **Navn, organisering og minnespor** og dekker den verifiserte navneperioden:

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

Runtime/governance:

- `data/stories/stories_birkelunden.json`;
- registrert i canonical `data/stories/stories_manifest.json`;
- registrert i `data/stories/stories_episode_v1_manifest.json`;
- `data/stories/stories_manifest_by_batch_01.json` forblir uendret for å unngå dobbel runtime-fetch.

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
- låser episode, kilder, navnevariant, held-back superlativ, tomme relasjoner, canonical manifest + episode-manifest og score.

Modell/API-kreditter i 7C: **0 eksterne modellkall**. Evidence ble gjenbrukt og offentlige kilder verifisert uten kvalitetsreduksjon.

## Scope 7C

Endres bare Story-system, faseaudit og dette workcardet. Canonical Birkelunden Place, descriptions, history/spatial/temporal/nature-profiler, People, Objects, Leksikon og popup-runtime endres ikke.

## Neste

Etter grønn 7C-merge: **7D – Før/etter**. Det krever rettighetsklare historiske og nå-bilder av selve Birkelunden med meningsfull visuell sammenligning; Paulus kirke, skole eller kulturmiljøets bygårder skal ikke brukes som proxy for parken.
