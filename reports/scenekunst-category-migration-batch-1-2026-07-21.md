# Scenekunst category migration — Oslo batch 1

Dato: 2026-07-21

## Beslutning

Scenekunst er etablert som egen toppkategori i History Go.

- `kunst` dekker billedkunst, visuell kunst, design og kunstinstitusjoner.
- `musikk` dekker musikk, konserter, artister og musikkproduksjon.
- `scenekunst` dekker teater, dans, musikal, revy, standup, improvisasjon og levende sceneproduksjon.
- `kultur` er ikke en egen badge; ordet brukes tverrfaglig.

## Første sikre Oslo-batch

Følgende steder har levende scenekunst som sin tydelige nåværende hovedfunksjon:

| Place id | Tidligere kategori | Ny runtime-kategori | Begrunnelse |
|---|---|---|---|
| `nationaltheatret` | litteratur | scenekunst | Aktiv nasjonal teaterinstitusjon; dramatisk litteratur er sekundær kobling. |
| `det_norske_teatret` | musikk | scenekunst | Aktiv nynorsk teaterinstitusjon; musikkteater og litteratur er sekundære lag. |
| `chat_noir` | populaerkultur | scenekunst | Aktiv kabaret- og revyscene. |
| `edderkoppen_scene` | populaerkultur | scenekunst | Aktiv revy-, komedie- og musikalscene. |
| `latter` | populaerkultur | scenekunst | Dedikert standup- og humorscene. |
| `folketeateret` | populaerkultur | scenekunst | Aktiv stor scene for musikal, teater og levende underholdning. |

Batchen ligger i:

```text
data/places/category_overrides/scenekunst_oslo_batch_1.json
```

Den er registrert i:

```text
data/places/category_overrides/index.json
```

## Hvorfor override brukes nå

Stedskildene og `data/places/places_index.json` må regenereres samlet når fysiske kildefiler flyttes eller primærkategori endres. Denne arbeidsøkten har GitHub-tilgang gjennom connector, men ingen lokal nettverkstilgang til å klone repoet og kjøre indeksbyggeren.

Den eksisterende kategori-override-mekanismen er derfor brukt som kontrollert migreringsflate. Runtime, full place loading, enriched place loading og quizkategori får den nye kategorien uten håndredigering av den genererte indeksen.

Neste kildebatch skal:

1. flytte eller oppdatere de kanoniske place-kildene,
2. legge inn relevante `secondaryBadgeIds`,
3. koble eksisterende litteratur-, musikk- og populærkultur-emner som sekundære spor,
4. bygge Scenekunst-fagkart og emner,
5. regenerere `places_index.json`,
6. fjerne de tilsvarende override-radene etter vellykket migrering.

## Ikke flyttet i batch 1

Disse krever egen vurdering og er ikke automatisk flyttet:

- opera- og konserthus med både musikk og scenekunst,
- flerbrukshus og kulturhus,
- festivalsteder,
- kinoer med sporadisk sceneprogram,
- historiske teaterbygg uten aktiv scenedrift,
- steder der en enkelt forestilling er viktigere enn stedets nåværende hovedfunksjon.
