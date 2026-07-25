# History GO — domenekontrakt

Status: **canonical og bindende kategoribeslutning**  
Eier: History GO data/runtime  
Sist kontrollert: **2026-07-25**

Maskinlesbar sannhetskilde:

```text
data/categories/category_contract.json
```

Runtime-, UI- og redaksjonelle filer skal samsvare med maskinkontrakten. `scripts/audit-category-governance.mjs` håndhever samsvaret.

## 1. Kjerneprinsipp

Ett domene har én runtime-id og én fag-id.

I dagens kontrakt er runtime-id og fag-id identiske for alle canonical toppkategorier. Alias er bare tillatt ved eksplisitte import-, migrerings- og normaliseringsgrenser.

Samme kategoriidentitet skal være konsistent i:

- `place.category`
- `merits_by_category`
- badge-id og badgeindeks
- quiz `categoryId`
- `data/fag/fag_manifest.json`
- `data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json`
- `js/DomainRegistry.js`
- `js/core/categories.ts`
- place-valideringspolicyen

## 2. Canonical toppkategorier

| Runtime-id | Fag-id | Visningsnavn |
|---|---|---|
| `by` | `by` | By & arkitektur |
| `historie` | `historie` | Historie |
| `kunst` | `kunst` | Kunst |
| `litteratur` | `litteratur` | Litteratur |
| `media` | `media` | Medier |
| `musikk` | `musikk` | Musikk |
| `naeringsliv` | `naeringsliv` | Næringsliv |
| `natur` | `natur` | Natur & miljø |
| `politikk` | `politikk` | Politikk & samfunn |
| `psykologi` | `psykologi` | Psykologi |
| `religion` | `religion` | Religion |
| `scenekunst` | `scenekunst` | Scenekunst |
| `sport` | `sport` | Sport & lek |
| `subkultur` | `subkultur` | Subkultur |
| `vitenskap` | `vitenskap` | Vitenskap & teknologi |
| `filosofi` | `filosofi` | Filosofi |
| `film_tv` | `film_tv` | Film & TV |

Listen skal ikke vedlikeholdes manuelt i andre dokumenter. Ved tvil gjelder `data/categories/category_contract.json`.

## 3. Låste domenebeslutninger

### Kunst

`kunst` dekker visuell og materiell kunst: maleri, skulptur, tegning, grafikk, fotografi, samtidskunst, design, offentlig kunst, museer, gallerier og samlinger.

### Scenekunst

`scenekunst` dekker teater, drama, dans, koreografi, musikal, revy, standup, improvisasjon, performance og sceneinstitusjoner. `teater`, `theatre` og `theater` normaliseres til `scenekunst` ved kompatibilitetsgrenser.

### Musikk

`musikk` dekker artister, ensembler, konserter, scener, sjangre, komposisjon, framføring, lyd og produksjon.

### Kultur

`kultur` er ikke toppkategori eller badge. Begrepet brukes som tverrfaglig beskrivelse.

### Film & TV

`film_tv` er selvstendig toppkategori. Legacy-id-ene `film` og `tv` normaliseres til `film_tv`.

### Media

`media` dekker journalistikk, redaksjonelle institusjoner, pressehistorie, medieetikk, offentlighet, plattformer og distribusjon. `journalistikk` normaliseres til `media`.

### Religion

`religion` dekker religion, tro, ritualpraksis, aktive hellige steder og religiøse institusjoner. Dagens primærfunksjon styrer place-klassifiseringen.

### Vitenskap & teknologi

`vitenskap` dekker empirisk og formell kunnskapsproduksjon samt teknologi, ingeniørfag og IT: observasjon, måling, eksperimenter, matematiske modeller, forskning, maskiner, elektronikk, programvare, algoritmer, data, nettverk, datasentre, cybersikkerhet og digital infrastruktur.

Bedriften som virksomhet hører normalt til `naeringsliv`; medieinnholdet hører til `media`; den tekniske løsningen og kunnskapen hører til `vitenskap`.

### Filosofi

`filosofi` er selvstendig runtime- og fagkategori. Det dekker:

- argumentasjon, logikk og begrepsanalyse
- epistemologi, metafysikk og bevissthetsfilosofi
- etikk og anvendt etikk
- politisk filosofi og offentlig fornuft
- estetikk og hermeneutikk
- vitenskaps- og teknologifilosofi
- eksistensialisme og fenomenologi
- idéhistorie og miljøfilosofi

`philosophy` normaliseres til `filosofi`. Et sted er primært `filosofi` når filosofisk tenkning, en dokumentert tenker, en intellektuell tradisjon eller en filosofisk offentlig praksis er stedets sentrale relevans. Empiriske forskningsinstitusjoner forblir normalt `vitenskap`. Reell tverrfaglighet uttrykkes med `secondaryBadgeIds`.

### Populærkultur

`populaerkultur` og `popkultur` er ikke canonical toppkategorier. Populærkultur brukes som tagg, linse og mediefaglig analysefelt.

Legacy-kode kan fortsatt ha eksplisitte kompatibilitetsaliaser for eldre lagring eller filer. Disse aliasene:

- skal ikke returneres av canonical kategori-lister
- skal ikke brukes i nye places, badges, quizpakker eller fagmanifest
- skal ikke tolkes som et ekstra domene
- skal fases ut gjennom kontrollerte migreringer, ikke skjult monkey-patching

### Sosial læring

`sosial_laering` er et non-place progression badge. Det skal ikke forekomme i `place.category`, runtime-kategorilister eller fagmanifestet.

## 4. Primær og sekundær badgebruk

Hvert sted har én primær kategori:

```json
{
  "category": "filosofi",
  "secondaryBadgeIds": ["natur", "vitenskap"]
}
```

Regler:

- `category` er obligatorisk og entall.
- `secondaryBadgeIds` er valgfritt.
- Sekundærbadges må være aktive runtimekategorier.
- Primærkategorien skal ikke gjentas som sekundær.
- Sekundærbadges uttrykker reell tverrfaglighet; de erstatter ikke primærbeslutningen.

Eksempler:

- Et dokumentert filosofisk tenkested kan være primært `filosofi`, med `natur` sekundært.
- En institusjon for vitenskapsfilosofi kan være primært `filosofi`, med `vitenskap` sekundært.
- Et laboratorium er normalt primært `vitenskap`.
- Et teater er primært `scenekunst`, med `litteratur` sekundært når dramatisk litteratur er sentral.
- En redaksjon er primært `media`.
- En kino eller et filmstudio er primært `film_tv`.

## 5. Fileierskap

Canonical maskinkontrakt:

```text
data/categories/category_contract.json
```

Alias og runtimekonvertering:

```text
js/DomainRegistry.js
```

Kategori-UI:

```text
js/core/categories.ts
```

Badges:

```text
data/badges/index.json
data/badges/<runtime-id>.json
```

Fag- og quizprofilregister:

```text
data/fag/fag_manifest.json
data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json
```

Place-validering:

```text
tools/placeSchemaPolicy.mts
```

## 6. Produksjonsregel

Før kategori-data opprettes eller flyttes:

1. Kontroller `data/categories/category_contract.json`.
2. Ikke opprett en ny toppnivå-id lokalt i place-, people-, quiz- eller fagdata.
3. Dersom en ny kategori ønskes, endres maskinkontrakten først.
4. Oppdater DomainRegistry, badges, fagmanifest, quizprofilregister, kategori-UI og validering i samme endring.
5. Oppdater denne beslutningskontrakten.
6. Kjør `npm run audit:categories`.

Eksisterende data skal bare flyttes mellom domener i kontrollerte, evidensbaserte batcher. Universiteter, skoler og forskningsinstitusjoner flyttes for eksempel ikke automatisk til `filosofi` bare fordi filosofi undervises der; den primære stedshistorien må være filosofisk.
