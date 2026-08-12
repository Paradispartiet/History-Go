# History GO — domenekontrakt

Status: **canonical og bindende kategoribeslutning**  
Eier: History GO data/runtime  
Sist kontrollert: **2026-08-13**

Maskinlesbar sannhetskilde: `data/categories/category_contract.json`.

Runtime-, UI- og redaksjonelle filer skal samsvare med maskinkontrakten. `scripts/audit-category-governance.mjs` håndhever samsvaret.

## Kjerneprinsipp

Ett toppdomene har én runtime-id, én fag-id og ett toppmerke. Store spesialiseringer kan eie egne fagpakker, metoder, emner og quizforløp uten å bli egne toppmerker.

## Canonicale toppkategorier

| Runtime-id | Fag-id | Visningsnavn |
|---|---|---|
| `by` | `by` | By & arkitektur |
| `historie` | `historie` | Historie |
| `kunst` | `kunst` | Kunst |
| `litteratur` | `litteratur` | Litteratur |
| `media` | `media` | Medier |
| `musikk` | `musikk` | Musikk |
| `naeringsliv` | `naeringsliv` | Økonomi og næringsliv |
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

## Vitenskap & teknologi

`vitenskap` er det samlede toppdomenet for empirisk og formell kunnskapsproduksjon, naturvitenskap, medisin, matematikk, modeller, vitenskapelige institusjoner, teknologi, ingeniørfag, maskiner, materialer, energi, elektronikk, programvare, algoritmer, data, kunstig intelligens, nettverk, robotikk, cybersikkerhet og digital infrastruktur.

Teknologi er en **canonical faglig spesialisering under `vitenskap`**. Den komplette V2.4-pakken ligger under `data/fag/teknologi/`, men registreres i `fag_manifest.json` som `vitenskap.specializations.teknologi`. Den eier ikke en toppkategori eller et eget toppmerke.

`technology`, `teknologi`, `tech`, `it` og `informasjonsteknologi` normaliseres til `vitenskap`. Interne `em_tek_*`, `met_tek_*`, teknologiquizer og teknologiressurser beholdes som stabile spesialiserings-ID-er.

Grenseflater:

- Bedriften som virksomhet, marked og eierskap hører normalt til `naeringsliv`; teknologiens mekanisme, arkitektur og tekniske løsning hører til `vitenskap`.
- Medieinnhold og journalistikk hører til `media`; plattformens programvare, algoritmer og nettverk hører til `vitenskap`.
- Arkitektur, byrom og areal hører til `by`; byggets tekniske systemer kan gi `vitenskap` som primær eller sekundær kategori.
- Naturfenomenet eller økosystemet hører til `natur`; måling, forskning og konstruerte løsninger kan høre til `vitenskap`.
- Vitenskaps- og teknologifilosofi hører til `filosofi` når argumentet står i sentrum.

## Andre låste beslutninger

`filosofi` er selvstendig runtime- og fagkategori. `kultur` er ikke toppkategori. `populaerkultur` og `popkultur` brukes som tagg, linse og mediefaglig analysefelt. `sosial_laering` er **ikke** et canonical badge, toppdomene eller fag. Eventuelle forekomster av ID-en i eldre HG Social- eller Civication-innhold er kun legacy interne namespaces og gir ikke tillatelse til å registrere et nytt merke eller en ny kategori.

## Primær og sekundær badgebruk

Hvert sted har én primær kategori. `secondaryBadgeIds` uttrykker reell tverrfaglighet. Et datasenter, teknisk museum eller teknisk system bruker `vitenskap`; et teknologiselskap bruker `naeringsliv` når virksomheten står i sentrum.

## Fileierskap og migrering

- Canonical maskinkontrakt: `data/categories/category_contract.json`
- Alias og runtimekonvertering: `js/DomainRegistry.js`
- Kategori-UI: `js/core/categories.ts`
- Badges: `data/badges/index.json`
- Fag- og quizregister: `data/fag/fag_manifest.json` og `data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json`
- Place-validering: `tools/placeSchemaPolicy.mts`

Legacy `teknologi`-verdier kan finnes i steder, quizhistorikk og lokale lag mens migreringen pågår. De normaliseres til `vitenskap` ved runtime- og importgrenser. Interne spesialiserings-ID-er skal ikke masseomdøpes.
