# Place duplicate IDs – modellbeslutning for siste 8

## 1) Beslutning

For de siste 8 gjenværende duplicate place IDs velges **modell A**:

> Én autoritativ master-place per fysisk sted, med flere faglige perspektiver koblet gjennom `emne_ids`, relations, quiz, overlays, personer, Wonderkammer og eventuelle kategori-/badge-koblinger.

Det betyr at vi ikke skal lage nye parallelle place-IDs som `barcode_by` / `barcode_kunst` nå.

## 2) Hvorfor modell A er valgt

History Go bør behandle et fysisk sted som én stabil node i kartet og progresjonssystemet. Flere faglige perspektiver skal ligge oppå denne noden, ikke splitte stedet i flere nesten-identiske kartpunkter.

Fordeler:

- Ett sted gir én stabil kartmarkør.
- Unlock/progresjon blir enklere og mindre feilutsatt.
- i18n/sourceHash får én norsk mastertekst per place-ID.
- Relations/personkoblinger blir ryddigere.
- Quiz kan fortsatt ha flere faglige vinkler via `emne_ids`, `quiz_profile`, overlays eller category-specific quiz.
- Det hindrer at brukeren ser samme sted flere ganger som ulike objekter.

## 3) Gjenværende duplicate IDs

Etter batch 1 og batch 2 gjenstår 8 semantiske duplikater:

- `barcode`
- `damstredet_telthusbakken`
- `deichman_bjorvika`
- `tjuvholmen`
- `ullevål_hageby`
- `var_frelsers_gravlund`
- `vigelandsparken`
- `voienvolden`

Disse finnes i flere kategorifiler fordi de er reelle flerfaglige steder, ikke bare kopier.

## 4) Overordnet regel

For hvert av de 8 stedene skal det velges én masterfil og én master-entry.

Andre faglige perspektiver skal ikke ligge som full duplikat med samme `id` i en annen place-fil. De skal flyttes/overføres til ett eller flere av disse lagene:

- `emne_ids`
- `quiz_profile.primary_angles`
- `quiz_profile.question_families`
- `quiz_profile.contrast_targets`
- relations/personkoblinger
- fag-/kategori-overlays hvis de finnes eller opprettes senere
- Wonderkammer hvis relevant
- quizinnhold knyttet til samme place-ID
- i18n content basert på mastertekst

## 5) Foreslått master per sted

| ID | Foreslått masterfil | Begrunnelse | Perspektiver som må bevares |
|---|---|---|---|
| `barcode` | `data/places/places_by.json` | Primært byutviklings-/arkitektur- og eiendomscase. | Kunst/arkitekturperspektiv fra `places_kunst.json` må bevares som emne/quiz/overlay. |
| `damstredet_telthusbakken` | `data/places/places_historie.json` eller `data/places/places_by.json` etter innholdssammenligning | Stedet er både historisk trehusmiljø og by-/arkitekturcase. | Historisk trehusmiljø, bystruktur, bevaring, materialitet. |
| `deichman_bjorvika` | `data/places/places_litteratur.json` eller `data/places/places_by.json` etter innholdssammenligning | Biblioteket er både litteraturinstitusjon og del av Bjørvika-transformasjonen. | Litteratur/bibliotek/offentlighet og Bjørvika/bytransformasjon må begge bevares. |
| `tjuvholmen` | `data/places/places_by.json` | Primært byutvikling/eiendom/vannfront, men med sterk kunstkobling. | Kunst-, galleri- og offentlig kunst-perspektiv fra `places_kunst.json`. |
| `ullevål_hageby` | `data/places/places_by.json` | Primært byplanlegging, hageby og boligmodell. | Litterær kobling må bevares via relations/overlay. |
| `var_frelsers_gravlund` | `data/places/places_historie.json` | Primært historisk minnested/gravlund med mange personkoblinger. | Litteraturperspektiv må bevares via personrelations og quiz/emner. |
| `vigelandsparken` | `data/places/places_kunst.json` eller `data/places/places_by.json` etter innholdssammenligning | Både park/byrom og Norges viktigste skulpturanlegg. | Kunst/skulptur må ikke svekkes hvis byfil velges; park/byrom må ikke svekkes hvis kunstfil velges. |
| `voienvolden` | `data/places/places_by.json` eller `data/places/places_litteratur.json` etter innholdssammenligning | Historisk gård/bystruktur med litterær kobling. | Gård/kulturminne/byhistorie og Wergeland-/litteraturkobling må bevares. |

## 6) Viktig: ikke velg master blindt

Før datarydding må hver duplicate-entry sammenlignes felt for felt:

- `name`
- `category`
- `year`
- `lat`
- `lon`
- `r`
- `desc`
- `popupDesc`
- `emne_ids`
- `quiz_profile`
- `image`
- `cardImage`
- eventuelle ekstra felt

Master skal ikke bare være første fallback. Master skal være den mest faglig komplette og strukturelt riktige posten.

## 7) Foreslått oppryddingsmetode

For hvert sted:

1. Les alle forekomster av ID-en.
2. Velg master-entry.
3. Slå inn relevante `emne_ids` fra duplikaten hvis de mangler i master.
4. Slå inn relevante quiz_profile-vinkler hvis de mangler.
5. Bevar beste `desc` og `popupDesc`, eventuelt flett tekstene forsiktig.
6. Bevar beste bilde-/kortkobling hvis master mangler assets.
7. Fjern duplikat-entry fra sekundærfilen.
8. Kjør data-audit, duplicate-scan, i18n-audit og relevante app-syntax checks.
9. Oppdater rapport med hva som ble flyttet/flettet/fjernet.

## 8) Risiko for i18n/sourceHash

Når mastertekst endres ved fletting, vil `_sourceHash` for berørte oversettelser kunne bli stale. Det er riktig og ønsket.

Etter hver oppryddingsbatch må dette kjøres:

```bash
node scripts/i18n-audit-places.js en
node scripts/i18n-worklist-places.js en --only=stale,missingSourceHash --out=tmp/i18n/places-en-stale-after-duplicates.json
```

Ikke rett i18n i samme PR som duplicate-opprydding med mindre endringen er minimal. Helst: først dataopprydding, deretter egen i18n-stale-fix.

## 9) Neste trygge PR

Neste PR bør ta kun 1–2 av de 8 stedene, ikke alle.

Anbefalt start:

1. `barcode`
2. `tjuvholmen`

Grunn:

- Begge har tydelig by-master i `places_by.json`.
- Begge har kunstperspektiv som kan bevares i master via emner/quiz_profile/overlay i stedet for duplicate place-ID.
- De er enklere enn `var_frelsers_gravlund`, `deichman_bjorvika` og `vigelandsparken`, som har sterkere institusjonell/personhistorisk kompleksitet.

## 10) Ikke gjør automatisk

Ikke:

- lag nye place IDs nå
- endre visited/localStorage-nøkler
- endre unlock-logikk
- endre quiz-resultatlogikk
- endre kartlogikk
- endre i18n-runtime
- slette sekundærperspektiv uten å bevare faglig innhold

Denne rapporten er en modellbeslutning og arbeidsinstruks for videre rydding, ikke selve dataryddingen.
