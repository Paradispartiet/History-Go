# DomainRegistry — praktisk bruk

Status: **operational runtime-guide**  
Runtimefil: `js/DomainRegistry.js`  
Maskinkontrakt: `data/categories/category_contract.json`  
Beslutningskontrakt: `docs/DOMAIN_CONTRACT.md`  
Sist kontrollert: **2026-08-13**

Denne guiden forklarer hvordan eksisterende kode bruker DomainRegistry. Den oppretter ikke egne kategoribeslutninger.

## Kjerneprinsipp

History GO har to bruksretninger:

```text
fag-/redaksjonell subject-id → emner, pensum, fagkart, methods
runtime category-id          → place.category, quiz categoryId, badges, merits og profilprogresjon
```

I dagens canonical kontrakt er id-en den samme i begge retninger for alle toppkategorier.

## Hvilken metode skal brukes?

### `toFagSubjectId()`

Brukes for:

- `data/fag/<subjectId>/`
- fagmanifestnøkler
- emner, pensum, fagkart og methods
- lærings- og kursstruktur

Eksempler:

```js
DomainRegistry.toFagSubjectId("filosofi");      // "filosofi"
DomainRegistry.toFagSubjectId("philosophy");    // "filosofi"
DomainRegistry.toFagSubjectId("teater");         // "scenekunst"
DomainRegistry.toFagSubjectId("film");           // "film_tv"
DomainRegistry.toFagSubjectId("journalistikk");  // "media"
DomainRegistry.toFagSubjectId("technology");     // "vitenskap"
```

### `toRuntimeCategoryId()`

Brukes for:

- `place.category`
- quiz `categoryId`
- `merits_by_category`
- badges og badgebilder
- profil- og progresjonsstatistikk

Eksempler:

```js
DomainRegistry.toRuntimeCategoryId("filosofi");     // "filosofi"
DomainRegistry.toRuntimeCategoryId("philosophy");   // "filosofi"
DomainRegistry.toRuntimeCategoryId("teater");        // "scenekunst"
DomainRegistry.toRuntimeCategoryId("film");          // "film_tv"
DomainRegistry.toRuntimeCategoryId("journalistikk"); // "media"
```

Runtime-writes skal normaliseres eksplisitt ved kilden. Storage skal ikke monkey-patches for å skjule manglende normalisering.

## Canonical lister

`DomainRegistry.list()` og `DomainRegistry.listRuntimeCategories()` skal samsvare med henholdsvis `fagSubjects` og `runtimeCategories` i maskinkontrakten.

Begge listene består nå av:

```text
by
historie
kunst
litteratur
media
musikk
naeringsliv
natur
politikk
psykologi
religion
scenekunst
sport
subkultur
vitenskap
filosofi
film_tv
```

Dersom denne listen avviker fra runtimekoden, fagmanifestet, quizprofilregisteret, badgeindeksen, kategori-UI eller place-policyen, skal `npm run audit:categories` feile.

## Legacy populærkultur-kompatibilitet

`populaerkultur` og `popkultur` er ikke canonical toppkategorier og returneres ikke av listemetodene.

`js/DomainRegistry.js` kan fortsatt inneholde eksplisitte aliaser for eldre dataflyt:

```js
DomainRegistry.toFagSubjectId("populaerkultur"); // legacy: "popkultur"
DomainRegistry.toRuntimeCategoryId("popkultur"); // legacy: "populaerkultur"
```

Disse returverdiene er kompatibilitetsgrenser, ikke tillatelse til å lage nye place-, badge-, quiz- eller fagdata med id-ene. Nye produksjonsfiler skal følge maskinkontrakten; populærkultur uttrykkes som tagg/linse eller innen relevant faglig domene, særlig media.

## Låste kategoribeslutninger

- `kunst` betyr visuell og materiell kunst.
- `scenekunst` er egen kategori for teater, dans, musikal, revy, standup, improvisasjon og live performance.
- `musikk` betyr musikk, artister, konserter, scener, lyd og produksjon.
- `kultur` er ikke kategori-id.
- `film_tv` og `media` er separate kategorier.
- `religion` er selvstendig kategori.
- `vitenskap` omfatter også teknologi, ingeniørfag og IT.
- `filosofi` er selvstendig fag- og runtimekategori og skal ikke normaliseres til `vitenskap`.
- `sosial_laering` er ikke en canonical kategori eller badge. Eventuelle legacy-forekomster er interne HG Social/Civication-namespaces og skal ikke registreres i badgeindeksen.
- `populaerkultur`/`popkultur` er ikke toppkategori.

## Før en kategori legges til eller endres

1. Oppdater `data/categories/category_contract.json`.
2. Oppdater `docs/DOMAIN_CONTRACT.md`.
3. Oppdater `js/DomainRegistry.js`.
4. Oppdater badges, fagmanifest, quizprofilregister, kategori-UI og place-policy.
5. Kjør `npm run audit:categories`.

Dersom auditen feiler, skal det ikke legges inn en lokal fallback eller et ekstra alias-kart et annet sted.
