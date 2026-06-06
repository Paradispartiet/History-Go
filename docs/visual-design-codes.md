# Visual design codes

Et felles **designCode-system** for hele History Go / Civication-universet. Det
gjør at places, people og artikler/leksikon/stories/lesespor kan peke til en
standardisert *visuell* kode som ulike renderere (Three.js-kart, Canvas-kart,
kort, ikoner, leksikon, AHA-galleri) kan tegne hver på sin måte.

- Register: [`data/visualDesignCodes.json`](../data/visualDesignCodes.json)
- Resolver: [`js/visualDesignCodes.js`](../js/visualDesignCodes.js) →
  `window.HGVisualDesignCodes`
- Audit: `npm run test:visual-design-codes`
  ([`tools/audit-visual-design-codes.mjs`](../tools/audit-visual-design-codes.mjs))

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

## Audit

`npm run test:visual-design-codes` kjører resolveren (uten DOM) mot place-,
people-, leksikon- og lesespor-data og skriver:

- `reports/visual-design-codes-audit.json`
- `reports/visual-design-codes-audit.md`

Rapporten viser antall koder per `entityType`, hvor mange entiteter som løses via
hver kilde (`explicit`/`assetType`/`category`/`heuristic`/`default`), topp brukte
koder, ubrukte koder, ugyldige eksplisitte koder og koder med manglende
`renderHints`.
