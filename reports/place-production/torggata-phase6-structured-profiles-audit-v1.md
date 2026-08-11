# Torggata – fase 6 strukturerte place-profiler v1

Dato: 2026-08-11  
Place ID: `torggata`  
Styrende kontrakter: `docs/PLACE_PRODUCTION_CHECKLIST.md` fase 6 og `docs/PLACE_STANDARD.md` §10

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: Ingen tidligere Torggata-PR funnet som eier fase 6 etter dagens checklist
SISTE GODKJENTE TILSTAND: canonical place hadde popupDesc, for_na, tasks_profile, works og verifisert routeSegments-geometri, men ingen spatial_profile, temporal_profile, subplaces, history_layers eller source_summary
KONKRET REGRESJONSEVIDENS: ingen
BESLUTNING: REELT NYTT ARBEID – bygg bare dokumenterte profiler som tilfører struktur, uten filler
```

## Profilbeslutninger

### `spatial_profile` — PASS

Torggata er en gate, så profilen beskriver fysisk avgrensning og skillet mellom canonical identitet og operativ geometri.

- canonical scope: Stortorvet → Youngstorget → Ankertorget/Ankerbrua;
- verifisert `routeSegments`-scope: Youngstorget → Ankertorget;
- 574,5 meter fra routeSegments lagres **ikke** som hele Torggatas `linear_extent_m`, fordi den operative kjeden ikke dekker hele den historiske/canonicale gateidentiteten;
- `measurement_status` er derfor `verified_partial_geometry`;
- gameplay-radius `r=180` brukes ikke som areal eller fysisk utstrekning.

### `temporal_profile` — PASS

Seks hovedmilepæler brukes, ikke detaljert chronology:

- 1846: første opparbeidede strekning;
- 1852: navneformen Torvegaden vedtatt;
- 1876: gaten ført fram til Ankerbrua;
- 1929: Eldorado som lydfilmkino;
- 1986: Rockefeller åpner i det tidligere badet;
- 2014: ny gateutforming med prioritet for gående og syklende åpner.

### `subplaces` — PASS

Kun reelle gatesegmenter legges inn:

1. Stortorvet–Youngstorget — den eldste opparbeidede delen;
2. Youngstorget–Ankertorget — den nordlige fortsettelsen og området dagens verifiserte routeSegments dekker.

Eldorado, Torggata bad, Rockefeller og andre egne bygg/institusjoner gjøres ikke til kunstige subplaces bare fordi de ligger langs gaten.

### `history_layers` — PASS

Fem korte lag brukes til Historie-flaten uten å lage ny chronology:

1. gateløpet blir til, 1846–1876;
2. handel, varieté og teater, 1870-årene–1911;
3. lydfilm og kommunalt bad, 1920-årene–1980;
4. kulturbruk i det tidligere badet, fra 1986;
5. gågate-/miljøgateomforming, 2009–2014.

### `source_summary` — PASS

Brukerrettet kildeoversikt inneholder bare eksterne, lesbare kilder som allerede er kontrollert i fase 2 og 5. Interne audits, History GO som selvkilde og researchnotater legges ikke i `safe_sources`.

### `nature_profile` — N/A

Begrunnelse: Torggata er et urbant gateløp uten dokumentert naturfaglig hovedrolle i dagens stedspakke. Et naturfelt ville her vært completeness-filler og kunne feilaktig signalisere Nature-innhold.

## Bevaringskontroll

Fase 6 endrer ikke:

- `desc` eller `popupDesc`;
- `data/places/production/torggata.json` eller fase-5-hashene;
- kategori, underbadges eller `emne_ids`;
- koordinater, radius, anchors eller routeSegments;
- `for_na`, `tasks_profile`, `civication_store` eller `works`;
- quiz, People, Brands, Stories eller senere checklist-faser.

## Fase-6-konklusjon før CI

Fase 6 er innholdsmessig **KLAR FOR REVIEW** på branch. Den settes først **GODKJENT** etter relevant CI, squash-merge og verifikasjon på faktisk `main`. Fase 7 starter ikke før dette er gjort.
