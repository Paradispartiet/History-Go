# Oslo urban movement places batch 1 — validation

Dato: 2026-07-08

## Scope

Denne batchen er research gjort manuelt i ChatGPT, ikke av Codex. Codex skal ikke brukes til research for denne typen datainnhold.

Batchen legger inn to nye Oslo-steder som egne place-filer under sport/urban movement:

- `data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json`
- `data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json`

Manifest er oppdatert:

- `data/places/manifest.json`

Ingen people-, quiz-, UI- eller loader-filer er endret.

## Researchbeslutning

### Added

| placeId | kategori | beslutning |
|---|---|---|
| `verdensparken_parkour` | `sport` | added som parkour / urban movement |
| `furuset_aktivitetspark` | `sport` | added som aktivitetspark / nærmiljøanlegg |

### Skipped / holdt tilbake

| kandidat | beslutning | årsak |
|---|---|---|
| `jordal_skatepark` | `needs_more_research` | Jeg fant bare svakt indirekte grunnlag for skatepark; sterke kilder dokumenterer Jordal Idrettspark, men ikke egen skatepark godt nok. |
| `voldslokka_pumptrack` | `needs_more_research` | Jeg fant ikke en god nok kilde for eget fysisk pumptrack-anlegg og presis lokasjon. |
| `torshovdalen_skatepark` | `needs_more_research` | Jeg fant ikke god nok kilde for egen skatepark/skatespot med presis koordinat. |

## Kildegrunnlag

### `verdensparken_parkour`

Kilde:

- https://en.wikipedia.org/wiki/Verdensparken

Grunnlag:

- Verdensparken er en park på Furuset i Oslo, åpnet i 2013 og fullført i 2014.
- Kilden oppgir koordinat `59.94467306, 10.89619500`.
- Kilden sier at Verdensparken har et område for parkour.
- Kilden beskriver parkourområdet/freerunning-området som et prosjekt med betongvegger, trapper, gummierte flater, plater og rails.
- Kilden oppgir at parkourområdet ble åpnet 31. mai 2013.

Kategori:

- Valgt `sport`, ikke `subkultur`, fordi dette er et fysisk aktivitetsanlegg i offentlig park.
- Popupen tar likevel med urban bevegelseskultur og selvorganisert byromsbruk.

Koordinat:

- `lat: 59.94467306`
- `lon: 10.896195`
- `coordType: park_activity_area_center`
- `coordPrecisionM: 80`
- Merk: koordinat er parkkoordinat/parkourområde-anker, ikke nødvendigvis mikrokoordinat for hvert enkelt hinder.

### `furuset_aktivitetspark`

Kilde:

- https://en.wikipedia.org/wiki/Furuset_Aktivitetspark

Grunnlag:

- Furuset Aktivitetspark ligger på Furuset i Oslo.
- Kilden oppgir koordinat `59.9404, 10.8935`.
- Kilden sier at parken åpnet i november 2008.
- Kilden beskriver parken som del av utvikling av Groruddalen under Oslo kommune og statlige myndigheter.
- Kilden sier at parken ligger mindre enn 200 meter sørvest for Furuset senter.
- Kilden beskriver fasiliteter: klatrenett, karuseller/rundkjøringer, treningsapparater, 40 x 60 meter kunstgressbane, sandvolleyballbane, grusløpebane, sirkulær labyrint, lekeplass og skøyteis om vinteren.

Kategori:

- Valgt `sport`, ikke `subkultur`.
- Entryen er uttrykkelig ikke skrevet som skatepark.
- Popup og `avoid_angles` sier at skate/pumptrack ikke skal tillegges stedet uten egen kilde.

Koordinat:

- `lat: 59.9404`
- `lon: 10.8935`
- `coordType: park_center`
- `coordPrecisionM: 80`

## Eksisterende dekning i repo

Før denne batchen var disse urban/skate-lignende stedene allerede dekket:

| placeId | kategori | dekning |
|---|---|---|
| `skur13` | `subkultur` | skate/graffiti/urban aktivitet |
| `gamlebyen_sport_og_fritid` | `subkultur` | skate, bowl, scene, bandrom, dugnad |
| `oslo_skatehall` | `subkultur` | innendørs skatehall på Voldsløkka |

## Repo-søk / duplicate-vurdering

Repo-søk før opprettelse fant ingen eksisterende treff på:

- `verdensparken_parkour`
- `furuset_aktivitetspark`

De nye ID-ene er derfor valgt som nye canonical placeIds.

## Manifest

Følgende nye manifest paths er lagt til:

- `places/sport/europa/norway/urban_movement/verdensparken_parkour.json`
- `places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json`

## Index

`data/places/places_index.json` er ikke oppdatert i denne connector-økten, fordi index skal bygges av repoets script og ikke håndredigeres.

Før merge må denne kommandoen kjøres lokalt/CI/Codex-som-script, ikke som research:

```bash
npm run places:index:build
```

Deretter må `data/places/places_index.json` inkluderes i PR-en hvis scriptet endrer den.

## Validering som må kjøres før merge

```bash
node -e "for (const f of ['data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json','data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json','data/places/manifest.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run places:index:build
npm run build:tools
npm run places:index:check
npm run places:emner:check
npm run places:coords:check
```

Forventet:

- nye active source place files: 2
- new place IDs: 2
- duplicate place IDs for these IDs: 0
- `verdensparken_parkour` og `furuset_aktivitetspark` finnes i `places_index.json` etter index-build
- no people files changed
- no quiz files changed
- no UI files changed

## Endrede filer i denne PR-en

- `data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json`
- `data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json`
- `data/places/manifest.json`
- `reports/oslo-urban-movement-places-batch-1-validation.md`
