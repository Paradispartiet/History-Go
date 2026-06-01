# Batch 33 — smal health-allowlist for film/TV-sekundærlag

Dato: 2026-06-01

## Formål

Batch 33 er en **script-/policybatch**. Den innfører de to smale, dokumenterte
film/TV-parene som Batch 32 (read-only policyrapport) anbefalte som Tier A —
trygt å allowliste:

- `by → film_tv` (10 forekomster: Sagene, Kampen)
- `populaerkultur → film_tv` (5 forekomster: kinoer + SKAM-lokasjon)

Endringen gjøres kun i health-scriptet (`tools/placeHealthReport.mjs`). Det er
**ikke** gjort endringer i place-data, canonical emne-filer, manifest, index, UI,
CSS, HTML, JS eller assets. Det er **ikke** innført alias-schema, blind
prefix-rewrite eller datafix, og ingen tverrfaglige koblinger er fjernet.

## Kommandoer kjørt

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
node --check tools/placeHealthReport.mjs
```

## Filer og scripts undersøkt

Rapporter:
- `reports/oslo-place-audit-batch-32-film-popkultur-policy-audit.md`
- `reports/oslo-place-audit-batch-31-health-cross-disciplinary-allowlist.md`

Scripts / config:
- `tools/placeHealthReport.mjs` (eneste endrede script)
- `tools/check_place_emne_ids.mjs`
- `package.json`
- `data/places/manifest.json`

Read-only kontekst:
- `data/places/by/oslo/places_by.json`
- `data/places/film/oslo/places_oslo_film.json`
- `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json`
- `data/fag/popkultur/emner_populaerkultur_canonical_v4_5.json`

## Baseline før endring

`npm run places:emner:check`:
- Exit code: 0
- Missing emne_ids: 0
- Unknown emne_ids: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

`npm run places:index:check`:
- `places_index.json is in sync with source place files.`

`npm run health:places`:
- Errors: 0
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 43
- Allowlisted cross-disciplinary emne_ids: 191
- Warnings: 1060

Baseline er bekreftet identisk med Batch 32s sluttstatus.

## Par som ble allowlistet i denne batchen

### `by → film_tv` (10 forekomster)

**Begrunnelse:** Gjelder byrom (`category: by`) med eksplisitt dokumentert film-/
TV-location eller representasjonslag i place-teksten. De ti forekomstene fordeler
seg på to bydeler i `data/places/by/oslo/places_by.json`:

- **Sagene** (5 emner): one_liner «Sagene er en bydel som ofte spilles som seg
  selv i norsk TV», tags `film_location`, `tv_serier`, `norsk_tv`.
- **Kampen** (5 emner): desc/one_liner «brukt … som gjenkjennelig
  fortellingslandskap i film og TV», tags `film_location`, `tv_serier`,
  `sosialrealisme`, `norsk_film`.

Begge er ekte, levde byrom der film/TV er et **sekundærlag**, ikke deres
kategori. Koblingen er konseptuelt smal og veldokumentert (location/
representasjon). Den skal ikke løses ved å gi stedene `category: film`/`film_tv`.

### `populaerkultur → film_tv` (5 forekomster)

**Begrunnelse:** Gjelder kinoer og film-/TV-steder så lenge film/TV ligger under
populærkultur i place-data. Alle fem ligger i
`data/places/film/oslo/places_oslo_film.json` med `category: populaerkultur`:

- 4 kinoer (saga_kino, klingenberg_kino, gimle_kino, vika_kino) med
  `em_film_tv_kino_fellesrom`.
- hartvig_nissens_skole_skam (SKAM-lokasjon) med `em_film_tv_location_filmsted`.

Dette er korrekt kategori-policy, ikke et emnevalgproblem: i dagens place-data er
film/TV redaksjonelt underlagt populærkultur, så `em_film_tv_`-emner er et
legitimt fagfamilie-sekundærlag på et populærkultursted.

## Par som bevisst IKKE ble allowlistet

- **`by → populaerkultur`**: Holdes utenfor til etter en målrettet datafix som
  rydder de 6 feilkategoriserte popkultur-stedene (frognerstranda, grand_hotel,
  slottsplassen → `category: populaerkultur`) og de svake trend-/digital-/
  influencer-koblingene. `by → populaerkultur` skal fortsatt være warning etter
  Batch 33. `populaerkultur` er derfor **ikke** lagt til under `by`.
- **`politikk → populaerkultur`**: Kun ett sted (Youngstorget), to emner — for
  tynt grunnlag til å allowliste hele paret.
- **`natur → kunst`**: Mismatchet emnevalg (botanisk/vitenskapelig hage med
  `em_kunst_institusjoner_kanon`) — datafix, ikke allowlist.
- **`subkultur → naeringsliv`**: Ett sted, tynt belagt; transformasjonslaget er
  allerede dekket av allowlistet `em_by_transformasjon_ombruk` — hold/datafix.

## Scriptendringen som ble gjort

I `tools/placeHealthReport.mjs`, utvidet `ALLOWED_CROSS_DISCIPLINARY_EMNE_FAMILIES`:

Før:
```js
  by: ["kunst", "historie"],
  kunst: ["by", "historie"],
  subkultur: ["by", "musikk", "historie", "kunst"]
```

Etter:
```js
  by: ["kunst", "historie", "film_tv"],
  kunst: ["by", "historie"],
  populaerkultur: ["film_tv"],
  subkultur: ["by", "musikk", "historie", "kunst"]
```

Resulterende struktur:
- `by` inneholder nå: `kunst`, `historie`, `film_tv`
- `populaerkultur` inneholder nå: `film_tv`

`by → populaerkultur` ble bevisst **ikke** lagt til. `politikk: ["populaerkultur"]`,
`natur: ["kunst"]` og `subkultur: ["naeringsliv"]` ble bevisst **ikke** lagt til.

En kort kommentarblokk over allowlisten forklarer hvert nytt par og hvorfor
`by → populaerkultur` holdes utenfor til etter datafix.

## Ny health-summary etter endring

`npm run health:places`:
- Files checked: 40
- Places checked: 470
- emne_ids checked: 1051
- Canonical emne_ids: 1051
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 28
- Allowlisted cross-disciplinary emne_ids: 206
- Errors: 0
- Warnings: 1045

## Før/etter

| Metrikk | Før (Batch 32) | Etter (Batch 33) | Endring |
| --- | ---: | ---: | ---: |
| Wrong-prefix emne_ids | 43 | 28 | −15 |
| Allowlisted cross-disciplinary emne_ids | 191 | 206 | +15 |
| Warnings | 1060 | 1045 | −15 |
| Errors | 0 | 0 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |

De 15 dempede warningene tilsvarer nøyaktig de 10 `by → film_tv`- og 5
`populaerkultur → film_tv`-forekomstene fra Batch 32s beslutningstabell.

## Bekreftelser

- Unknown/missing emne_ids valideres fortsatt: Unknown emne_ids 0, Missing
  emne_ids 0 etter endringen. Allowlisten leser canonical familie først etter et
  registry-treff, så ukjente/manglende emne_ids kan aldri allowlistes.
- `npm run places:emner:check` er fortsatt grønn (exit code 0; Missing 0, alle
  duplikater 0).
- `npm run places:index:check` er fortsatt grønn (`places_index.json is in sync
  with source place files.`).
- Ingen filer under `data/places/**` ble endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen canonical emne-filer ble endret.
- `data/places/places_index.json` ble ikke endret.
- `data/places/manifest.json` ble ikke endret.
- Ingen `emne_ids` ble endret.
- Ingen `category`-verdier ble endret.
- Ingen UI, CSS, HTML, JS eller assets ble endret.
- Ingen alias-schema, blind prefix-rewrite eller datafix ble innført.
- Eneste endrede script er `tools/placeHealthReport.mjs`; eneste nye fil er denne
  rapporten.

## Validering (kjørt i denne batchen)

- `node --check tools/placeHealthReport.mjs`: OK (ingen syntaksfeil).
- `npm run places:emner:check`: exit code 0; Missing 0, Unknown 0, alle duplikater 0.
- `npm run places:index:check`: `places_index.json is in sync with source place files.`
- `npm run health:places`: Errors 0, Unknown emne_ids 0, Wrong-prefix 28,
  Allowlisted cross-disciplinary 206, Warnings 1045.

## Anbefalt Batch 34

**Batch 34 — kategori-/datafix-batch (rører place-data):**

1. Datafiks de 6 feilkategoriserte popkultur-stedene (#19–24: frognerstranda,
   grand_hotel, slottsplassen): sett `category: by → populaerkultur`. Da faller 6
   warnings bort uten allowlist.
2. Gjennomgå og evt. fjern/bytt de svake `em_pop_`-koblingene som ikke er
   dokumentert i teksten (majorstuen_krysset trend/digital, barcode influencer,
   vaterland, bjorvika film_tv_format, toyen_torg remix).
3. Når #1–2 er ryddet: allowlist `by → populaerkultur` (Tier B) med streng
   policytekst som krever eksplisitt dokumentert ikonstatus/fellesskap/
   offentlighet/representasjon i place-teksten.
4. Ta stilling til om `film_tv` bør bli egen place category (egen
   strukturell beslutning som rører manifest/index/UI).
5. Vurder emnevalg for `natur → kunst` (#42) og `subkultur → naeringsliv` (#43).
