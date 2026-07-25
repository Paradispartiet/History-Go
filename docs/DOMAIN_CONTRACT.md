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

Ett domene har én runtime-id og én fag-id. Runtime-id og fag-id er identiske for alle canonical toppkategorier. Alias er bare tillatt ved eksplisitte import-, migrerings- og normaliseringsgrenser.

Samme kategoriidentitet skal være konsistent i `place.category`, `merits_by_category`, badge-id, quiz `categoryId`, fagmanifest, quizregister, DomainRegistry, kategori-UI og place-valideringspolicy.

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
| `vitenskap` | `vitenskap` | Vitenskap |
| `teknologi` | `teknologi` | Teknologi |
| `filosofi` | `filosofi` | Filosofi |
| `film_tv` | `film_tv` | Film & TV |

Ved tvil gjelder `data/categories/category_contract.json`.

## 3. Låste domenebeslutninger

### Vitenskap

`vitenskap` dekker empirisk og formell kunnskapsproduksjon: observasjon, måling, eksperimenter, matematikk, modeller, naturvitenskap, medisin, klima- og miljøvitenskap, forskning og vitenskapelige institusjoner.

Et laboratorium, observatorium eller forskningsinstitutt er normalt primært `vitenskap` når kunnskapsproduksjonen står i sentrum.

### Teknologi

`teknologi` er en selvstendig runtime- og fagkategori. Den dekker:

- ingeniørprosess, design, prototyper og systemavveininger
- maskiner, energi, materialer og produksjon
- elektronikk, sensorer, robotikk og automatisering
- datamaskinarkitektur, operativsystemer og programvare
- data, algoritmer og kunstig intelligens
- nettverk, internett, cybersikkerhet og digital infrastruktur
- teknologihistorie, standarder, vedlikehold, etikk og risiko

`technology`, `tech`, `it` og `informasjonsteknologi` normaliseres til `teknologi`. `science` og `sci` normaliseres til `vitenskap`.

Grenseflater:

- Bedriften som virksomhet, marked og eierskap hører normalt til `naeringsliv`; den tekniske løsningen hører til `teknologi`.
- Medieinnhold og journalistikk hører til `media`; plattformens programvare, algoritmer eller nettverk hører til `teknologi`.
- Arkitektur, byrom og areal hører til `by`; byggets tekniske systemer kan gi `teknologi` som primær eller sekundær kategori.
- Naturfenomenet eller økosystemet hører til `natur`; målingen og forskningen kan høre til `vitenskap`; den konstruerte løsningen hører til `teknologi`.
- Vitenskaps- og teknologifilosofi hører til `filosofi` når argumentet står i sentrum.

### Filosofi

`filosofi` er selvstendig runtime- og fagkategori for argumentasjon, epistemologi, metafysikk, etikk, politisk filosofi, estetikk, fenomenologi, idéhistorie og vitenskaps- og teknologifilosofi.

### Kultur, film, media, religion og scenekunst

`kultur` er ikke toppkategori. `film_tv`, `media`, `religion`, `scenekunst`, `kunst` og `musikk` er selvstendige domener i henhold til maskinkontrakten.

### Populærkultur

`populaerkultur` og `popkultur` er ikke canonical toppkategorier. Populærkultur brukes som tagg, linse og mediefaglig analysefelt.

### Sosial læring

`sosial_laering` er et non-place progression badge og skal ikke forekomme i runtime-kategorilister eller fagmanifest.

## 4. Primær og sekundær badgebruk

Hvert sted har én primær kategori. `secondaryBadgeIds` uttrykker reell tverrfaglighet og erstatter ikke primærbeslutningen.

Eksempler:

- Et laboratorium er normalt `vitenskap`.
- Et datasenter er normalt `teknologi`, eventuelt med `naeringsliv` eller `by` sekundært.
- Et teknologiselskap er `naeringsliv` når virksomheten står i sentrum og `teknologi` når det tekniske systemet står i sentrum.
- Et teknisk museum kan være `teknologi`, med `historie` og `vitenskap` sekundært.
- En institusjon for teknologifilosofi er normalt `filosofi`, med `teknologi` sekundært.

## 5. Fileierskap

- Canonical maskinkontrakt: `data/categories/category_contract.json`
- Alias og runtimekonvertering: `js/DomainRegistry.js`
- Kategori-UI: `js/core/categories.ts`
- Badges: `data/badges/index.json` og `data/badges/<runtime-id>.json`
- Fag- og quizregister: `data/fag/fag_manifest.json` og `data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json`
- Place-validering: `tools/placeSchemaPolicy.mts`

## 6. Migreringsregel

Eksisterende steder, quiz og `em_vit_it_*`-koblinger flyttes ikke automatisk. Migrering skal skje i evidensbaserte batcher:

1. Behold `vitenskap` når hovedsaken er forskning, observasjon, måling, modell eller natur-/medisinsk kunnskapsproduksjon.
2. Bruk `teknologi` når hovedsaken er et konstruert system, maskin, materiale, programvare, algoritme, nettverk eller infrastruktur.
3. Bruk sekundærbadges når begge lag er reelt sentrale.
4. Dokumenter hver flytting og oppdater sted, emnekobling og quizprofil samlet.

## 7. Produksjonsregel

Når en ny toppkategori opprettes, skal maskinkontrakt, DomainRegistry, badges, fagmanifest, quizprofilregister, kategori-UI, place-policy og denne kontrakten oppdateres i samme endring. Kjør `npm run audit:categories`.
