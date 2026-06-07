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
