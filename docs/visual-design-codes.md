# Visual design codes

Et felles **designCode-system** for hele History Go / Civication-universet. Det
gjør at places, people og artikler/leksikon/stories/lesespor kan peke til en
standardisert *visuell* kode som ulike renderere (Three.js-kart, Canvas-kart,
kort, ikoner, leksikon, AHA-galleri) kan tegne hver på sin måte.

- Register: [`data/visualDesignCodes.json`](../data/visualDesignCodes.json)
- Resolver: [`js/visualDesignCodes.js`](../js/visualDesignCodes.js) →
  `window.HGVisualDesignCodes`
- Audit: `npm run test:visual-design-codes`
  ([`tools/audit-visual-design-codes.mts`](../tools/audit-visual-design-codes.mts))

## Hva er en designCode?

En designCode er en **stabil, navngitt visuell identitet** – ikke geometri, ikke
en tekstur og ikke et bilde. Eksempler: `stadium_miniature`, `museum_miniature`,
`person_runner_miniature`, `article_history_miniature`.

Hver kode i registeret har:

| Felt | Beskrivelse |
| --- | --- |
| `id` | Kodens navn (lik nøkkelen). |
| `entityTypes` | Hvilke entiteter koden gjelder for: `place`, `person`, `article`, `story`, `leksikon`, `lesespor`. |
| `family` | Tematisk gruppe (`sport`, `culture`, `music`, `history` …). |
| `label` / `description` | Menneskelesbar tekst. |
| `renderHints` | Hint til de fire renderertypene: `threeType`, `canvasType`, `cardType`, `iconType`. |
| `visualTraits` | Abstrakte trekk (`silhouette`, `primaryMaterial`, `accent`, `detailLevel`). |
| `tags` | Frie søke-/audit-tagger. |

## Hvorfor peker data til designCode i stedet for geometri?

Data skal beskrive **hva** noe er, ikke **hvordan** det tegnes. Hvis en place-fil
inneholdt Three.js-primitiver eller en SVG, ville den vært låst til én motor og
én visning. Ved å peke til en designCode kan:

- samme datapunkt rendres som 3D-miniatyr i kartet, som flatt ikon i en liste,
  og som kort i leksikonet – uten at dataene endres,
- den visuelle stilen oppdateres ett sted (registeret + renderere) i stedet for
  i hundrevis av datafiler,
- vi drive audit og søk på visuell identitet på tvers av places, people og
  artikler.

Dette er bevisst et **metadata-/resolver-system**, ikke en masseendring av
datafiler. De aller fleste entiteter får designCode *implisitt* via resolveren;
kun spesialtilfeller trenger en eksplisitt `visual.designCode`.

## Forskjellen mellom designCode og renderer

- **designCode** = identitet/intensjon («dette er en stadion-miniatyr»).
- **renderer** = den konkrete tegningen i én visning.

Registeret kobler de to via `renderHints`. En renderer slår opp koden og bruker
sitt eget hint:

| Renderer | Hint den leser | Eksempel for `stadium_miniature` |
| --- | --- | --- |
| Three.js-kart | `renderHints.threeType` | `"stadium"` → `PLACE_MINIATURE_TYPES.stadium` |
| Canvas-kart | `renderHints.canvasType` | `"stadium_miniature"` |
| Kort-UI | `renderHints.cardType` | `"place_stadium"` |
| Ikon-UI | `renderHints.iconType` | `"stadium"` |

Samme kode, fire forskjellige tegninger. En renderer som ikke kjenner et hint
faller tilbake til sin egen `default`.

## Resolver-API

`window.HGVisualDesignCodes` (lastes via `js/visualDesignCodes.js`):

```js
HGVisualDesignCodes.init();                 // laster registeret (idempotent, krasjer aldri)
HGVisualDesignCodes.get("museum_miniature");// entry | null
HGVisualDesignCodes.all();                  // { code: entry, ... }
HGVisualDesignCodes.resolveForPlace(place); // { designCode, entry, source }
HGVisualDesignCodes.resolveForPerson(person);
HGVisualDesignCodes.resolveForArticle(article);
HGVisualDesignCodes.normalizeDesignCode(x); // string | null
HGVisualDesignCodes.getRenderHint(code, "threeType");
HGVisualDesignCodes.isValidCode(code);      // boolean
```

Returformat fra `resolveFor*`:

```json
{
  "designCode": "museum_miniature",
  "entry": { "id": "museum_miniature", "renderHints": { "...": "..." } },
  "source": "explicit | assetType | category | heuristic | default"
}
```

Egenskaper:

- **Eksplisitt vinner alltid.** `visual.designCode` (eller `designCode`) brukes
  hvis satt.
- **Krasjer aldri appen.** Hvis `data/visualDesignCodes.json` ikke kan hentes,
  fortsetter resolveren i heuristikk-modus (`entry: null`).
- **Muterer aldri data.** Den leser bare feltene den får inn.

### Prioritert oppslag per entitet

**Places:** `visual.designCode` → `civiMap.assetType` / `mapAssetType` /
`assetType` → nøkkelord-heuristikk (id/navn/`quiz_profile.place_type`/`subtype`)
→ `category` → `default_miniature`.

**People:** `visual.designCode` → `role` / `profession` / `sport` / `tags` /
id/navn-heuristikk → `category` → `person_default_miniature`.

**Articles/stories/leksikon/lesespor:** `visual.designCode` → `type` / `topic` /
`tags` / `themes` / tittel/id-heuristikk → `category` →
`article_default_miniature`.

## Integrasjon i kartet

`CivicationThreeMap.resolvePlaceMiniatureType(place)` prøver den delte
resolveren først:

```js
const reg = window.HGVisualDesignCodes;
if (reg && reg.resolveForPlace) {
  const r = reg.resolveForPlace(place);
  const threeType = r.entry && r.entry.renderHints && r.entry.renderHints.threeType;
  if (threeType && PLACE_MINIATURE_TYPES[threeType]) return threeType;
}
// ellers: eksisterende legacy-resolver (assetType → nøkkelord → kategori → default)
```

Kartet er **aldri avhengig** av at `js/visualDesignCodes.js` er lastet. Hvis
resolveren ikke finnes, eller registeret ikke er klart ved første render, brukes
den eksisterende logikken uendret (inkludert `populaerkultur`-mapping,
Bislett/ice_arena-skillet og landmark-dedup).

## Hvordan entiteter kan bruke `visual.designCode`

Eksplisitt kode er valgfritt og brukes kun når heuristikken ikke treffer riktig.

**Place:**

```json
{
  "id": "nasjonalmuseet",
  "name": "Nasjonalmuseet",
  "category": "kunst",
  "visual": { "designCode": "museum_miniature" }
}
```

**Person:**

```json
{
  "id": "grete_waitz",
  "name": "Grete Waitz",
  "category": "sport",
  "visual": { "designCode": "person_runner_miniature" }
}
```

**Artikkel / leksikon / lesespor:**

```json
{
  "id": "bislett_stadion_hovedartikkel",
  "title": "Bislett Stadion",
  "visual": { "designCode": "article_groundhopper_miniature" }
}
```

> Avgrensning: designCodes legges ikke på i bulk. De fleste entiteter løser kode
> implisitt via resolveren; eksplisitt kode brukes punktvis der det trengs.

## Pilot batch 1

Første pilot merker bare et **lite, trygt utvalg** entiteter med eksplisitt
`visual.designCode` – steder, personer og artikler der riktig kode er helt
åpenbar (stadioner, ishaller, museer, bibliotek, teater, universiteter, kinoer,
torg/civic; forfattere, poeter, fotballspillere, løpere, skiløpere, musikere,
politikere; historie-, sports- og kunstartikler).

Pilotens omfang (batch 1):

| entityType | eksplisitt merket | eksempler på koder |
| --- | --- | --- |
| places | 28 | `stadium_miniature`, `ice_arena_miniature`, `museum_miniature`, `library_miniature`, `theatre_miniature`, `university_miniature`, `cinema_miniature`, `civic_miniature`, `square_miniature` |
| people | 30 | `person_writer_miniature`, `person_poet_miniature`, `person_footballer_miniature`, `person_runner_miniature`, `person_skier_miniature`, `person_musician_miniature`, `person_politician_miniature` |
| articles | 15 | `article_history_miniature`, `article_sports_history_miniature`, `article_art_miniature`, `article_groundhopper_miniature` |

Prinsipper for piloten:

- **Resolveren håndterer fortsatt resten heuristisk.** Eksplisitt kode er kun
  lagt på der den uansett ville vært åpenbar; alle andre entiteter løser kode
  implisitt (assetType → nøkkelord → kategori → default) som før.
- **Kvalitet før full batch.** Målet er å verifisere at eksplisitt merking,
  resolver og audit fungerer på et kontrollert utvalg – ikke å dekke alt.
- **Ingen masseendring.** Bare `visual.designCode` er lagt til; tekst, quiz,
  relasjoner, bilder og schema er urørt.
- **Senere batcher kan utvide dekningen** gradvis, kategori for kategori, etter
  hvert som flere åpenbare tilfeller verifiseres.

Effekten kan leses i [`reports/visual-design-codes-audit.md`](../reports/visual-design-codes-audit.md)
(seksjonen «Eksplisitt pilot-merkede designCodes»). Etter batch 1 er det 73
eksplisitte koder, 0 ugyldige eksplisitte koder og 0 koder med manglende
`renderHints`.

## Pilot batch 2

Pilot batch 2 er en kontrollert utvidelse etter batch 1, fortsatt med **høy
nytte fremfor bred dekning** som prinsipp. Batch 1 var en trygg grunnpilot med
de mest opplagte kodene; batch 2 utvider utvalget til flere entiteter som
forventes å være ofte synlige i kart, PlaceCard/Groundhopper og kunnskapslag.

Batch 2 prioriterer:

- sentrale kartsteder som gater, torg, parker, stasjoner, kirker, bibliotek,
  waterfront-steder og historiske anlegg,
- personer som allerede er koblet til steder, særlig innen sport, musikk,
  politikk og vitenskap,
- leksikon-/artikkeloppføringer som bærer stedshistorie, lokalhistorie,
  politisk historie, objektfortellinger og place essays.

Dette er fortsatt **ikke en full batch**. Full dekning bør vente til audit,
renderer-erfaring og faktisk bruk viser at designCode-systemet fungerer godt på
tvers av kart, kort, Canvas fallback og kunnskapsflater.

Effekten etter batch 2 kan leses i
[`reports/visual-design-codes-audit.md`](../reports/visual-design-codes-audit.md)
(seksjonen «Pilot batch 2»).

## Pilot batch 3

Pilot batch 3 er den **første batchen som er bygget direkte fra auditens
`batch3Suggestions`**, ikke ved manuell gjetting. Kandidatene ble plukket fra
`reports/visual-design-codes-audit.json` og kryssjekket mot rapportens øvrige
seksjoner før de ble låst som eksplisitt `visual.designCode`.

Prinsipper for batch 3:

- **P5/P4 ble prioritert.** Kun forslag med `priority` 5 eller 4 fra
  `batch3Suggestions.places`, `.people` og `.articles` ble tatt med. Lavere
  prioritet (P1–P3) ble bevisst utsatt.
- **`semanticReviewCandidates` ble bevisst ikke endret.** Steder og personer som
  `slottsparken`, `operahuset`, `ronny_deila`, `oscar_mathisen`,
  `hjalmar_andersen`, `johann_olav_koss` og `ole_gunnar_solskjaer` ble stående
  urørt – de venter på en eventuell mer presis kode (f.eks. opera-, skøyte- eller
  trener-kode) eller en manuell konseptbeslutning.
- **Ingen nye designCodes.** Registeret (`data/visualDesignCodes.json`) ble ikke
  utvidet; batch 3 bruker kun koder som allerede finnes.
- **Tvilsomme heuristikk-treff ble luket ut.** Kandidater der auditens `reason`
  var svak (f.eks. «park» som egentlig er handels-/teknologipark, eller
  `article_sports_history_miniature` på rene transport-/knutepunktartikler) ble
  ikke tatt med, selv om de hadde høy prioritet.

Batch 3 prioriterte å redusere default-hull der riktig kode var åpenbar, og å få
to tidligere ubrukte artikkelkoder i bruk:

- **places (+30):** kirker, kinoer, teatre, museer, bibliotek, stasjoner,
  stadioner, universitetsbygg og parker i Oslo, supplert med åpenbare P5-steder i
  Lisboa (inkludert tidligere `default_miniature`-steder som
  `lisbon_sao_vicente_de_fora` og `lisbon_palacio_ajuda`).
- **people (+23):** forfattere, politikere, forskere, en komponist og utøvere med
  tydelig individuell rolle/profesjon, alle med høy-konfidens heuristikk-treff.
- **articles (+27):** tok i bruk de tidligere ubrukte kodene
  `article_architecture_miniature` og `article_literature_miniature`, i tillegg
  til `article_art_miniature` og `article_sports_history_miniature`.

Formålet var å **øke presis eksplisitt dekning uten å gjøre en full batch**.
Ubrukte koder uten konkrete audit-kandidater (`gallery_miniature`,
`article_people_portrait_miniature`, `article_wonderkammer_miniature`) ble latt
ligge til en senere batch, siden `batch3Suggestions` ikke pekte ut trygge,
konkrete entiteter for dem.

Effekten etter batch 3 kan leses i
[`reports/visual-design-codes-audit.md`](../reports/visual-design-codes-audit.md):
eksplisitt `visual.designCode` økte fra 169 til 249 (places 68 → 98, people
65 → 88, articles 36 → 63), fortsatt med 0 ugyldige eksplisitte koder og 0 koder
med manglende `renderHints`.


## Register precision expansion

Register precision expansion er en ren register-/resolver-/audit-utvidelse. Den
legger til mer presise designCodes for kjente presisjonshull som audit har vist
etter de tre kontrollerte pilotene: opera-/scenekunstbygg, slott/palasser,
gravlunder/minnesteder, monumenter, historiske gårds-/eiendomssteder, fengsler,
trenere, skøyteløpere, arkitekter, byplanleggere, næringslivsprofiler og mer
spissede artikkeltyper for biografi, institusjon og minnesteder.

Dette er **ikke en ny data-batch** og ikke «batch 4». Ingen nye
`visual.designCode`-verdier legges inn i place-, people-, leksikon- eller
lesespor-data som del av selve registerutvidelsen. Poenget er å gjøre systemet
klart for senere kontrollerte batcher, slik at framtidige eksplisitte merkinger
kan bruke en presis kode i stedet for å presse entiteter inn i brede fallbacker
som `theatre_miniature`, `civic_miniature`, `person_athlete_miniature` eller
`person_default_miniature`.

De gamle brede kodene fungerer fortsatt som fallback. Resolveren prøver nå mer
spesifikke nøkkelord først (for eksempel opera før teater, slott før festning,
coach før footballer og skøyteløper før generisk athlete), men ender fortsatt i
eksisterende brede koder eller default-koder når den ikke har et trygt treff.
Audit-scriptet speiler samme rekkefølge, slik at rapportene viser de samme
heuristiske mulighetene som runtime-resolveren.

`renderHints.threeType` og andre renderer-hint for de nye kodene kan foreløpig
peke til eksisterende primitive archetypes. For eksempel kan `opera_miniature`
bruke samme Three.js-type som teater, og `palace_miniature` kan bruke civic-
primitive, mens kort- og ikonhint allerede er mer semantisk presise. En egen
renderer eller egne 3D-/Canvas-varianter for disse kodene kan komme senere uten
at datafilene må endres på nytt.

## Precision batch 4

Precision batch 4 er den første **data-batchen som tar i bruk presisjonskodene
fra register precision expansion** (PR #1192). Der pilotene 1–3 brukte de brede
kodene, bruker batch 4 de nye, mer spissede kodene på åpenbare eksisterende
entiteter. Kandidatene ble plukket direkte fra
`reports/visual-design-codes-audit.json` (`heuristicCandidates`,
`defaultCandidates`, `batch3Suggestions` og `semanticReviewCandidates`) – ikke
ved gjetting.

Formålet er å **erstatte grove koder/default der riktig ny kode er åpenbar**, og
å redusere default-hull og review-kandidater der en presis kode nå finnes.

Prinsipper for batch 4:

- **Kun åpenbare, trygge treff.** `semanticReviewCandidates` ble ikke brukt
  blindt; de ble vurdert manuelt og bare tatt med når den nye presise koden gjorde
  valget klart (f.eks. `operahuset` → `opera_miniature`, skøyteløpere →
  `person_skater_miniature`, Ronny Deila → `person_coach_miniature`).
- **Tvilstilfeller ble utelatt.** Steder/personer der den nye koden ikke var klar
  ble stående urørt – for eksempel `akerhus_slott` (fortress er fortsatt riktig),
  `slottsparken` (er en park), Gamle rådhus/Galgeberg/Prindsen (ingen åpenbar ny
  place-kode), Ole Gunnar Solskjær (spiller-rollen er den tydelige i data) og
  Kristian Birkeland (vitenskap, ikke næringsliv).
- **Registeret og resolveren ble ikke endret.** `data/visualDesignCodes.json`,
  `js/visualDesignCodes.js` og audit-scriptet er urørt; batch 4 bruker kun koder
  som allerede finnes. Ingen renderer, kartmotor, UI, quiz, relasjoner eller
  innholdstekster ble rørt – kun `visual.designCode` ble lagt til/endret.
- **Dette er ikke en full batch.** `article_biography_miniature` ble bevisst latt
  ligge fordi audit ikke pekte ut trygge biografi-artikler (kun svake
  «liv»-treff på stedsartikler). Videre batcher skal fortsatt bygges på audit.

Batch 4 traff i hovedsak:

- **places (+25, samt `operahuset` reklassifisert fra `theatre_miniature`):**
  `opera_miniature` (Operahuset), `palace_miniature` (Det kongelige slott,
  Palácio da Ajuda, Fronteira, Belém), `cemetery_miniature`
  (Gamlebyen/Vår Frelsers gravlund, Cemitério dos Prazeres), `monument_miniature`
  (forfatterstatuer, Tigerstatuen, Abelhaugen, Padrão dos Descobrimentos),
  `farm_estate_miniature` (Eidsvollsbygningen, Villa Grande, Bogstad/Oslo
  ladegård/Hellerud/Vøien gård) og `prison_miniature` (Grini, Møllergata 19,
  Botsfengselet).
- **people (+30, samt 5 reklassifiseringer):** `person_architect_miniature`
  (Grosch, Arneberg, Poulsson, Fehn m.fl. + Lisboa-arkitekter),
  `person_urban_planner_miniature` (Harald Hals, Sverre Pedersen),
  `person_business_miniature` (Sam Eyde, Ringnes, Schou, Olav Thon, Petter
  Stordalen m.fl.), `person_coach_miniature` (Ronny Deila, Nils Arne Eggen,
  Mário Moniz Pereira) og `person_skater_miniature` (Sonja Henie, Oscar Mathisen,
  Hjalmar Andersen, Johann Olav Koss).
- **articles (+9, samt 3 reklassifiseringer):** `article_institution_miniature`
  (Cinemateket, Deichman Bjørvika/Schous, NRK-huset, Gulbenkian-stiftelsen,
  Oslo hospital) og `article_memory_place_miniature` (Gamlebyen/Vår Frelsers
  gravlund, Grini fangeleir).

Effekten etter batch 4 kan leses i
[`reports/visual-design-codes-audit.md`](../reports/visual-design-codes-audit.md):
eksplisitt `visual.designCode` økte fra 249 til 312 (places 98 → 122 inkl.
reklassifisering, people 88 → 118, articles 63 → 72), fortsatt med 0 ugyldige
eksplisitte koder og 0 koder med manglende `renderHints`. Default-kandidatene
falt for alle tre entitetstyper (places 6 → 4, people 14 → 8, articles 250 →
241), og review-kandidatene gikk ned (operahuset, trenere og skøyteløpere er nå
mer presist merket).

## Article batch 5

Article batch 5 er en **smal artikkelbatch** som fokuserer utelukkende på
artikkel-/leksikon-/lesesporlaget. Etter pilotene 1–3 og Precision batch 4 hadde
places og people fått god eksplisitt presisjon, mens det største gjenværende
hullet var artiklene: hele 241 leksikon-/lesespor-oppføringer falt fortsatt til
`article_default_miniature`. Målet med batch 5 er å **redusere
`article_default_miniature`** ved å merke tydelige leksikon-, stedsessay- og
lesespor-artikler med eksplisitt `visual.designCode`.

Prinsipper for batch 5:

- **Audit som kilde.** Kandidatene ble plukket fra
  `reports/visual-design-codes-audit.json` (`defaultCandidates.articles`,
  `batch3Suggestions.articles`, `heuristicCandidates.articles` og
  `unusedDesignCodeDetails`), og deretter verifisert mot artiklenes egne
  `id`/`title`/`popupDesc`/`summary.themes` før de ble låst. Svake
  dyp-tekst-treff (f.eks. «liv» → biografi på elver, «løp» → sport på elveløp,
  «parti» → politikk på naturpunkter) ble bevisst forkastet.
- **Bare tydelige artikler.** Det ble kun merket der artikkeltypen var klar fra
  innholdet – ikke fordi en artikkel lå i en bestemt mappe. Usikre artikler (rene
  natur-/elveoppføringer, kirker uten egen artikkelkode, tvetydige
  populærkultur-spor) ble stående urørt.
- **Places og people ble bevisst ikke utvidet.** Ingen ny `visual.designCode` ble
  lagt på place- eller person-data i denne batchen; explicit places (122) og
  people (118) er uendret.
- **Eksisterende register fra #1192.** Batch 5 bruker kun artikkelkoder som
  allerede finnes i `data/visualDesignCodes.json`. Registeret, resolveren,
  audit-scriptet, renderere, kartmotor, UI, quiz, relasjoner, bilder og
  tekstinnhold er urørt – kun `visual.designCode` ble lagt til.

Batch 5 traff i hovedsak (≈66 nye eksplisitte artikkelkoder):

- **`article_architecture_miniature` (+17):** bygnings-, byroms- og
  transformasjonsartikler (Aker Brygge, Barcode, Vøienvolden gårdsanlegg,
  Ullevål Hageby, Romsås, trehusmiljøene på Damstredet/Rodeløkka/Vålerenga/Kampen,
  Tjuvholmen, Sørenga, Schous plass byrom, Grorud boligstruktur) samt Lisboa-bygg
  (Estação do Rossio, Convento do Carmo, Aqueduto das Águas Livres).
- **`article_place_essay_miniature` (+19):** brede stedsessays/hovedartikler om
  bydeler, gater og knutepunkt (Tøyen torg, Grünerløkka, Majorstukrysset,
  Bogstadveien, Storgata, Sagene, Kampen, Skøyen, Økern, Torshov, Gamlebyen,
  Grorud m.fl.).
- **`article_institution_miniature` (+16):** redaksjoner og kulturinstitusjoner
  (Klassekampen, Aftenposten, Dagbladet, NRK-huset, Good Game-redaksjonen,
  Psykologisk institutt UiO, Det Norske Studentersamfund, Torshov teater) og
  Lisboa-institusjoner (Centro Cultural de Belém, Culturgest, Museu do Oriente,
  Teatro Nacional D. Maria II, Teatro São Luiz).
- **`article_art_miniature` (+11):** Lisboas kunstmuseer (MAAT, MAC/CCB, MUDE,
  Arpad Szenes/Vieira da Silva, Bordalo Pinheiro, Museu Nacional de Arte Antiga,
  Chiado, Azulejo), Ekebergparken som offentlig kunst og to lesespor om Astrup
  Fearnley.
- **`article_history_miniature` (+2)** for Lisboas historiske monumenter
  (Castelo de São Jorge, Padrão dos Descobrimentos) og
  **`article_language_miniature` (+1)** for Hellerud som stedsnavn/språklig
  landskap (første gangs bruk av språk-koden).

Effekten etter batch 5 kan leses i
[`reports/visual-design-codes-audit.md`](../reports/visual-design-codes-audit.md):
eksplisitt `visual.designCode` økte fra 312 til 378 (places 122 og people 118
uendret, articles 72 → 138), `article_default_miniature` falt fra 241 til 175,
fortsatt med 0 ugyldige eksplisitte koder og 0 koder med manglende `renderHints`.
Dette er bevisst **ikke en full batch** – de resterende defaults (rene
natur-/elveoppføringer og tvetydige artikler) venter på senere, audit-baserte
batcher.

## Article default audit

«Article default audit» (#1236) var en ren analyse-utvidelse av audit-scriptet,
ikke en data-batch. Den klassifiserte de 175 `article_default_miniature` som
stod igjen etter Article batch 5, slik at senere artikkelbatcher kunne bygges
fra eksisterende metadata i stedet for gjetting. Analysen merket ingen
leksikon-, lesespor- eller story-data, endret ikke registeret og endret ikke
resolveren.

## Remaining article default audit

Etter Article batch 6 (#1262) gjenstår bare **61** artikler som fortsatt løser
til `article_default_miniature`. Denne PR-en analyserer disse 61 som
audit-only: den leser eksisterende metadata og rapporterer klassifisering, men
setter **ingen** nye `visual.designCode` i `data/leksikon`, `data/lesespor` eller
`data/stories`.

Resultatet ligger i `reports/visual-design-codes-audit.json` under
`articleDefaultAnalysis`, med fem grupper:

- **`safeBatch7Candidates`** – eksisterende artikkelkode er tydelig støttet av
  metadata og kan vurderes for en eventuell batch 7.
- **`needsMetadata`** – artikkelen mangler nok struktur til trygg klassifisering,
  for eksempel `summary.themes`, `classification.tags`, konkret tittel eller en
  informativ `popupDesc`.
- **`needsNewDesignCode`** – temaet ser reelt ut, men dagens register dekker det
  ikke godt nok; auditen foreslår mulige fremtidige koder uten å legge dem til.
- **`keepDefaultForNow`** – default er foreløpig best fordi temaet er bredt,
  blandet, teknisk/nøytralt eller mangler tydelig visuell identitet.
- **`manualReview`** – to eller flere koder er like sannsynlige, eller metadata
  peker i ulike retninger.

`articleBatch7Plan` i samme rapport er bare en plan. Den inkluderer kun
`safeBatch7Candidates` med high/medium confidence, og skal bare brukes hvis
auditen viser nok trygge kandidater. Hvis kandidatgrunnlaget er lite, skal vi
ikke presse frem Article batch 7. Noen av de 61 artiklene bør kanskje forbli
`article_default_miniature`, mens andre bør få bedre metadata eller nye
artikkelkoder i senere, separate PR-er.

Den lesbare oppsummeringen (med korte tabeller og full liste i JSON) ligger i
[`reports/visual-design-codes-audit.md`](../reports/visual-design-codes-audit.md)
under «Remaining article default audit» og «Article batch 7 plan».

## Article register expansion

«Article register expansion» er en ren **register-/resolver-/audit-utvidelse** –
ikke Article batch 6. Article default audit (#1236) viste at den klart største
gruppen gjenværende `article_default_miniature` ikke bare manglet en batch, men
manglet **presise artikkelkoder**: 118 av de 175 defaultene ble klassifisert som
`needsNewDesignCode`, hovedsakelig natur-/elve-, transport-/knutepunkt-, medie-
og infrastrukturartikler uten en dekkende eksisterende kode.

Denne PR-en legger derfor til ni nye presise artikkelkoder i registeret før vi
bygger en data-batch:

| designCode | family | dekker |
| --- | --- | --- |
| `article_nature_route_miniature` | nature | naturstier, elver, bekker, vann, grøntdrag, turveier, naturkorridorer, marka-/park-/elveforløp |
| `article_media_history_miniature` | media | avisredaksjoner, NRK, mediehus, pressehistorie, journalistikk, medieoffentlighet |
| `article_transport_miniature` | transport | trikk, t-bane, tog, buss, stasjon, knutepunkt, kollektivsystem, mobilitet, terminaler |
| `article_urban_infrastructure_miniature` | urbanism | veier, bruer, tunneler, vannforsyning, kraft, teknisk infrastruktur, store urbane systemer |
| `article_industry_miniature` | industry | bryggeri, fabrikk, verksted, produksjon, industrihistorie |
| `article_religion_miniature` | religion | kirkerom, menighet, trosliv, kirkehistorie (religion mer enn bygning) |
| `article_science_history_miniature` | science | forskning, vitenskapshistorie, fagmiljøer, laboratorier, metode |
| `article_food_market_miniature` | food_market | matmarked, torghandel, mathall, serverings- og matkultur |
| `article_childhood_play_miniature` | childhood | lekeplasser, barndom, lek, barns bruk av sted |

Prinsipper for utvidelsen:

- **Ingen data merkes i denne PR-en.** Det legges ikke `visual.designCode` på
  noen leksikon-, lesespor- eller story-data. Place- og people-data er heller
  ikke rørt. Eksplisitt `article`-merking forblir 138 og `article_default_miniature`
  forblir 175.
- **Dette er ikke Article batch 6.** Selve merkingen skjer i en senere,
  kontrollert data-batch som plukkes fra `articleBatch6Plan` i
  `reports/visual-design-codes-audit.json`.
- **Gamle brede koder og default er fortsatt fallback.** De nye kodene er nye
  presise alternativer; resolveren ender fortsatt i brede koder eller
  `article_default_miniature` når den ikke har et trygt, presist treff.
- **Resolveren får kapasitet, ikke ny oppførsel på eksisterende data.** De nye
  artikkelreglene i `js/visualDesignCodes.js` er *topical-only*: de matches kun
  mot strukturert tematisk metadata (`type`/`topic`/`category`/`tags`/`themes`/
  `subject`), ikke mot fritekst `id`/`title`. Dermed reklassifiseres ingen
  eksisterende artikkel (som bare nevner et tema i sin id/tittel) før den merkes
  eksplisitt i batch 6. De nye kodene er derfor foreløpig **ubrukte** og listes i
  `unusedDesignCodeDetails` med søkeforslag.
- **Audit speiler resolveren.** `tools/audit-visual-design-codes.mts` bruker
  samme regelrekkefølge og samme topical-only-skille. I tillegg avgjør
  artikkel-default-analysen nå `needsNewDesignCode` **dynamisk** mot registeret:
  en foreslått kode regnes som «ny» kun hvis den mangler i registeret. Siden de
  ni kodene nå finnes, flyttes treffene fra `needsNewDesignCode` til trygge
  `safeBatch6Candidates`.

Effekten etter utvidelsen (regenerert audit): registeret økte fra 72 til **81**
designCodes (article-familien 18 → 27), `needsNewDesignCode` falt fra 118 til
**0**, `safeBatch6Candidates` økte fra 16 til **134**, og `articleBatch6Plan`
peker nå på trygge kandidater med de nye kodene (bl.a. `article_nature_route_miniature`,
`article_transport_miniature` og `article_media_history_miniature`).
`article_default_miniature` er fortsatt **175**, eksplisitt `article`-merking
fortsatt **138**, med 0 ugyldige eksplisitte koder og 0 koder med manglende
`renderHints`. `renderHints.threeType` for de nye kodene peker foreløpig til den
eksisterende `article_marker`-archetypen; egne kort-/ikon-hint er allerede mer
semantisk presise, og egne renderere kan komme senere uten at datafiler må endres.


## Article batch 6

Article batch 6 bruker `articleBatch6Plan` fra auditrapporten etter PR #1246
som kilde for trygg merking av gjenværende `article_default_miniature`-artikler.
Batchen låser kun kandidater med tydelig audit-grunnlag, med hovedvekt på de nye
presise artikkelkodene som `article_nature_route_miniature`,
`article_transport_miniature`, `article_media_history_miniature`,
`article_urban_infrastructure_miniature`, `article_religion_miniature` og
`article_industry_miniature`.

Registeret (`data/visualDesignCodes.json`) og resolveren er ikke endret i denne
batchen; alle merkede artikler bruker eksisterende designCodes. Places- og
people-data er heller ikke endret. Målet var å redusere bruken av
`article_default_miniature` uten å tvinge usikre kandidater fra `needsMetadata`,
`keepDefaultForNow` eller `manualReview` inn i eksplisitt merking. Etter
regenerert audit er eksplisitt artikkelmerking økt til **252**, mens
artikkel-default er redusert til **61**, fortsatt med 0 ugyldige eksplisitte
koder og 0 manglende `renderHints`.

## Audit

`npm run test:visual-design-codes` kjører resolveren (uten DOM) mot place-,
people-, leksikon- og lesespor-data og skriver:

- `reports/visual-design-codes-audit.json`
- `reports/visual-design-codes-audit.md`

Rapporten viser antall koder per `entityType`, hvor mange entiteter som løses via
hver kilde (`explicit`/`assetType`/`category`/`heuristic`/`default`), topp brukte
koder, ubrukte koder, ugyldige eksplisitte koder og koder med manglende
`renderHints`.

## Audit quality pass

Audit-rapporten viser **ikke bare dekning, men også konkrete kandidater**. Den er
arbeidslisten neste batch skal bygges på, ikke en oppsummering vi leser én gang.
JSON-rapporten er den fulle, uavkortede kilden; Markdown-rapporten er den lesbare
versjonen med avkortede lister (totalsummer + topp-N, full liste i JSON).

Rapporten har følgende kandidat- og kvalitetsseksjoner:

- **`defaultCandidates`** – entiteter som fortsatt løses via default-fallback
  (`default_miniature` / `person_default_miniature` / `article_default_miniature`).
  Dette er **neste ryddeliste**: de mest opplagte hullene i dekningen, gruppert
  per places / people / artikler med id, navn/tittel, kategori og filsti.
- **`heuristicCandidates`** – entiteter uten eksplisitt kode der resolveren
  likevel gir en konkret kode via heuristikk. Hver kandidat har `confidence`
  (`high`/`medium`/`low`) og en `reason` (triggerordet). High-confidence treff
  **kan få eksplisitt designCode senere** – de er trygge å låse.
- **`unusedDesignCodeDetails`** – ubrukte koder med `family`, `entityTypes`,
  `suggestedSearchTerms` og `suggestedNextAction`, slik at det er lett å lete opp
  entiteter som burde dekke koden (f.eks. `article_architecture_miniature`).
- **`semanticReviewCandidates`** – eksplisitte koder som kan være riktige, men
  bør vurderes manuelt (f.eks. `opera` på `theatre_miniature`, `trener` på
  `person_footballer_miniature`). Dette er **review candidates, ikke feil** –
  bare manuelle vurderingspunkter for senere, mer presise koder.
- **`batch3Suggestions`** – en prioritert (P1–P5) liste som kombinerer
  high-confidence heuristikk, default-kandidater med tydelige dyp-tekst-treff og
  dekning av ubrukte koder. Markdown viser P3 og oppover, gruppert per
  `suggestedDesignCode`.

Prinsippet: **batch 3 skal baseres på audit, ikke manuell gjetting.** Når neste
batch bygges, plukkes entiteter fra `batch3Suggestions` (start med P5/P4),
kryssjekkes mot `semanticReviewCandidates`, og dekning av ubrukte koder hentes fra
`unusedDesignCodeDetails`. Dette holder hver batch verifiserbar og sporbar tilbake
til rapporten.
