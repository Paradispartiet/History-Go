# Naturmapping i History Go

Dette dokumentet beskriver arbeidsflyten for å koble arter til steder i History Go.

## Mål

History Go skal bruke eksisterende flora- og faunadata i `data/natur` som kandidatbank, og eksterne artsdatabaser som kontrollgrunnlag for hvilke arter som faktisk passer til bestemte steder i Oslo.

Målet er ikke å råimportere alle artsfunn, men å bygge et kurert stedskart:

```text
placeId → flora[] / fauna[] → kildegrunnlag → confidence → visning i PlaceCard/Natur-runding
```

## Hovedfiler

```text
data/natur/nature_place_map.json
```

Aktiv place-level mapping som PlaceCard kan bruke til å vise naturinnhold per sted.

```text
data/natur/nature_place_map_candidates.json
```

Generert kandidatfil fra Artskart-scriptet. Denne skal ikke brukes direkte i appen før den er kontrollert.

```text
data/natur/nature_unlock_map.json
```

Eksisterende quiz-unlock-map. Denne skal fortsatt brukes til belønning/opplåsing etter quiz.

```text
js/nature_place_map_bridge.js
```

Bridge mellom `nature_place_map.json` og PlaceCard/Natur-rundingen.

```text
tools/build_nature_place_candidates.mjs
```

Dev-script som henter Artskart-observasjoner per sted og matcher dem mot eksisterende arter i repoet.

## Datakilder

### Artskart / Artsdatabanken

Brukes til konkrete artsfunn. Artskart viser hvor arter er funnet eller observert, og kan søkes geografisk, blant annet med polygon.

Viktig begrensning: Artskart er ikke en fullstendig fasit. Manglende funn betyr ikke at arten ikke finnes, og gamle funn kan gjelde arter som har forsvunnet fra lokaliteten.

### Naturbase / Miljødirektoratet

Brukes som støtte for naturtyper, verneområder og forvaltningsinformasjon.

### Oslo Naturkart

Brukes som lokal kontrollkilde for naturverdier, grøntdrag, restaurerte naturmiljøer og byøkologiske strukturer.

## Arbeidsflyt

1. Kjør kandidatbyggeren lokalt:

```bash
node tools/build_nature_place_candidates.mjs
```

2. Scriptet skriver:

```text
data/natur/nature_place_map_candidates.json
```

3. Gå gjennom kandidater sted for sted.

4. Flytt bare gode, relevante og pedagogisk nyttige arter inn i:

```text
data/natur/nature_place_map.json
```

5. Hold `nature_unlock_map.json` separat. Den styrer quizbelønning, ikke stedets komplette naturprofil.

## Confidence-regler

Kandidat-scriptet bruker foreløpig:

```text
high   = minst 5 funn og siste funn fra 2020 eller senere
medium = minst 2 funn og siste funn fra 2015 eller senere
low    = svakere grunnlag
```

Dette er ikke endelig biologisk vurdering, bare et teknisk sorteringsfilter.

## Kvalitetsregler

Arter bør bare legges inn i aktiv mapping hvis minst ett av disse kriteriene er oppfylt:

- arten har flere nyere funn nær stedet
- arten er økologisk typisk for stedets habitat
- arten er pedagogisk nyttig i appen
- arten finnes allerede i repoets flora/fauna-modell
- arten kan forklares godt i Wonderkammer/Natur-rundingen

Unngå:

- svært gamle enkeltfunn uten nyere støtte
- funn med høy koordinatusikkerhet
- arter som bare er rapportert i nærheten, men ikke passer stedet
- sensitive arter der presis lokasjon bør skjermes
- råimport av lange artslister uten pedagogisk verdi

## Prioriterte steder

Første runde bør kjøres på:

```text
botanisk_hage
sognsvann
vigelandsparken
slottsparken
ekebergparken
st_hanshaugen_park
birkelunden
stensparken
botsparken
sofienbergparken_subkultur
holmenkollen
olaf_ryes_plass
inger_hagerups_plass
ullevål_hageby
nydalen
```

Neste runde bør inkludere flere naturtunge Oslo-steder som Østensjøvannet, Hovedøya, Gressholmen, Bygdøy, Alnaelva, Ljanselva, Mærradalen, Maridalsvannet, Nøklevann og Østmarka når de er riktig representert som `placeId` i `data/places`.

## Viktig arkitekturregel

Ikke legg midlertidig filtrering i UI-koden for å skjule dårlige data. Rett dataene i kildene:

```text
data/natur/nature_place_map.json
data/natur/flora/*.json
data/natur/fauna/*.json
data/places/*.json
```

UI skal bare vise det datamodellen sier.
