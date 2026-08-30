# History GO — canonical kontrakt for Fagverket og alle fagsider

Status: **canonical og bindende fagverkskontrakt v10**
Eier: `fagverk_subject_page_architecture` og `fagverk_subject_page_production`
Gjelder: alle canonicale fag i `data/categories/category_contract.json`
Sist kontrollert: **2026-08-30**

Dette er den **eneste samlede kontrakten** for hvordan History GO bygger, materialiserer, kvalitetssikrer og ferdigstiller fagsidene i Fagverket.

Dokumentet eier:

- den felles fagsidearkitekturen;
- skillet mellom fagverkforside, integrert fagside, globale læringsflater, compatibility-ruter og stedsside;
- den normaliserte runtime-modellen som alle fag skal vises gjennom;
- produksjonsrekkefølgen fra planlagt fag til fullverdig læreverk;
- statusbetydningene for teknisk materialisering og redaksjonell ferdigstillelse;
- kvalitetskravene til fagområder, emner, metoder, kapitler, progresjon, steder, kilder og QA;
- heldekningsregelen som krever alle faglig relevante emner uten forhåndsbestemte tallkvoter;
- teori-, teoretiker- og modellintegritet som en kvalitativ hovedfelt-for-hovedfelt-port;
- PR- og batchreglene for å ferdigstille alle fagsidene uten parallelle systemer.

Dokumentet eier **ikke** selve fagdefinisjonene, pensuminnholdet, quizreglene, Knowledge-lagringen, kategori-ID-ene eller faktapåstandene. Disse eies av kildene som er listet nedenfor.

---

## 1. Absolutt hovedregel

> **History GO skal ha én felles fagsidemotor, én normalisert runtime-modell og én manifest-resolvert canonical fagpakke per fag.**

Det skal ikke bygges én separat teknisk fagside per kategori, og politikksiden skal ikke kopieres og omskrives nitten ganger.

Alle fag åpnes gjennom samme sidekontrakt:

```text
fagverk.html?subject=<subject_id>
```

Eksempler:

```text
fagverk.html?subject=natur
fagverk.html?subject=historie
fagverk.html?subject=vitenskap&specialization=teknologi
fagverk.html?subject=kunst
```

Fagspesifikke adaptere er tillatt når source-formatet faktisk avviker, men adapteren skal ende i samme normaliserte modell og samme semantiske UI.

---

## 2. Bindende leserekkefølge og dokumenteierskap

Arbeid med Fagverket skal starte i denne rekkefølgen:

1. [`documentation_registry.json`](./documentation_registry.json) — dokumentstatus, canonicalt eierskap og prioritet.
2. [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) — faktisitet, inspectable kilder, påstandssporing og forbud mot gjetting.
3. [`DOMAIN_CONTRACT.md`](./DOMAIN_CONTRACT.md) og [`../data/categories/category_contract.json`](../data/categories/category_contract.json) — canonical fag-ID-er, rekkefølge, visningsnavn og kategoriavgrensning.
4. [`SUBJECT_FILE_CONTRACT.md`](./SUBJECT_FILE_CONTRACT.md) — én universell fagmodell per fag og separate geografiske produksjonslag.
5. [`../data/fag/fagverk_theory_quality_contract_v1.json`](../data/fag/fagverk_theory_quality_contract_v1.json) — maskinlesbar teori-, teoretiker- og modellstandard, fagtypeprofiler og strict integrity-gate.
6. **Dette dokumentet** — fagsidearkitektur, materialisering, status, produksjonsrekkefølge og ferdigkrav.
7. [`FAGVERK_NAVIGATION.md`](./FAGVERK_NAVIGATION.md) — den smale navigasjonskontrakten for portal, fagsider, integrert merkeprogresjon, compatibility-ruter, dypkoblinger og stedssider.
8. [`../README/README.pensum.md`](../README/README.pensum.md) — forholdet mellom merke, fagkart, emner, quiz, Knowledge, learning log og pensumprogresjon.
9. [`../README/fagstrukturREADME.md`](../README/fagstrukturREADME.md) — operativ guide til manifest-resolverte fagpakker og filstruktur.
10. [`DATA_PRODUCTION_CONTRACT.md`](./DATA_PRODUCTION_CONTRACT.md) — produksjon og integrasjon av canonical data.
11. [`KNOWLEDGE_ARCHITECTURE.md`](./KNOWLEDGE_ARCHITECTURE.md), [`../data/knowledge/knowledge_system_policy_v1.json`](../data/knowledge/knowledge_system_policy_v1.json) og [`../data/knowledge/knowledge_unit_schema_v1.json`](../data/knowledge/knowledge_unit_schema_v1.json) — Knowledge-eierskap og kunnskapsenheter.
12. [`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md), [`../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json`](../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json) og [`../data/quiz/quiz_knowledge_delivery_contract_v1.json`](../data/quiz/quiz_knowledge_delivery_contract_v1.json) — quizproduksjon, kategori-profiler og kunnskapsleveranse.
13. [`PROGRESSION_MODEL.md`](./PROGRESSION_MODEL.md) — progresjons-read-model og grensen mot eide lagringskilder.
14. [`FAGVERK_PLACE_DESIGN.md`](./FAGVERK_PLACE_DESIGN.md) — kategoridesign og bildekrav for fagverkets stedssider.
15. [`PLACE_PRODUCTION_CHECKLIST.md`](./PLACE_PRODUCTION_CHECKLIST.md) og [`PLACE_STANDARD.md`](./PLACE_STANDARD.md) — produksjon og ferdigstilling av konkrete steder som fagsiden lenker til.
16. [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) og [`HISTORY_GO_PRODUCT_MAP.md`](./HISTORY_GO_PRODUCT_MAP.md) — overordnede ferdigbegreper og produktprioritet.
17. [`TYPESCRIPT_FIRST_POLICY.md`](./TYPESCRIPT_FIRST_POLICY.md) og [`HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](./HISTORY_GO_TECHNICAL_ARCHITECTURE.md) — språkvalg, runtime-eierskap og målarkitektur.
18. [`../README/README_DEV.md`](../README/README_DEV.md) og [`../README/TEAM_WORKFLOW.md`](../README/TEAM_WORKFLOW.md) — kjøring, validering, branch-, PR- og mergeflyt.

Ved konflikt gjelder dokumentet som eier det aktuelle ansvarsområdet. Ingen lokal README, runtime-adapter eller fagside kan overstyre canonical kategori-, faktisitets-, fagfil-, quiz- eller Knowledge-kontrakt.

---

## 3. Entydige sideroller

Fagverket består av tre canonicale produktflater. Merket er integrert gameplay- og progresjonsidentitet på fagsiden, ikke en fjerde parallell innholdsflate:

```text
FAGVERKFORSIDEN
alle canonicale fag
        │
        └── FAGSIDEN
            Oversikt · Emner · Lærestoff · Utforsk · Progresjon
            fagstruktur, pensum, kapitler, steder og integrert merkeidentitet
                    │
                    └── STEDSSIDEN
                        konkret sted koblet til fag gjennom canonical ID-er
```

### 3.1 Fagverkforsiden

Adresse:

```text
fagverk-forside.html
```

Rolle:

- felles inngang fra headerens **Fagverket**;
- viser alle canonicale fag i canonical rekkefølge;
- bruker **Åpne faget** som primær handling for materialiserte fag;
- kan under migreringen vise en sekundær compatibility-lenke, men aldri som en likestilt faglig hovedvei;
- viser ikke en klikkbar fagsidelenke før siden er teknisk materialisert.

### 3.2 Fagsiden

Adresse:

```text
fagverk.html?subject=<subject_id>
```

Rolle:

- presenterer den universelle fagmodellen gjennom **Oversikt**, **Emner**, **Lærestoff**, **Utforsk** og **Progresjon**;
- viser fagområder, emner, begreper, metoder og redigerte lærekapitler der de finnes;
- beholder merket som integrert spill- og progresjonsidentitet med badge, undermerker, poeng, nivå, fagområdedekning og quizhistorikk;
- kobler videre til stedssider uten å kopiere stedets innhold inn i faget;
- bruker eksisterende progresjons-read-model uten å opprette ny lagring.

Faglig struktur og lærestoff eies av Fagverket. Merket beskriver brukerens gameplay- og progresjonsidentitet og skal ikke opprette en parallell fagstruktur.

### 3.3 Stedssiden

Adresse:

```text
fagverk-sted.html?place=<place_id>
```

Rolle:

- viser hvordan ett konkret sted kobles til fag, undermerker og emner;
- bruker canonical `underbadge_ids`, `emne_ids`, steder, personer, Works, kilder og andre eide systemer;
- er selvstendig og kan være tverrfaglig;
- skal ikke reduseres til et kopiert «casekapittel» i én fagside.

### 3.4 Compatibility-ruter og globale læringsflater

Gamle merkeside-URL-er kan bestå midlertidig som compatibility-ruter. De skal auditeres for unik gyldig kunnskap og aktiv funksjonalitet før de redirectes til fagets integrerte Progresjon. De er ikke canonicale produktflater.

`emner.html` er en personlig, tverrfaglig **Min læring**-/progresjonsflate. Den eier ikke fagets canonicale emnekatalog; alle canonicale emner skal kunne finnes på fagsiden uavhengig av brukerprogresjon.

---

## 4. Source of truth og eiermatrise

| Ansvar | Autoritativ kilde |
|---|---|
| Canonical fag-ID-er, rekkefølge og labels | `data/categories/category_contract.json` |
| Fagets aktive filpekere | `data/fag/fag_manifest.json` |
| Universell fagstruktur | fagets `pensum`, `emner`, `fagkart`, `methods` og tilhørende canonical filer |
| Teori-, teoretiker- og modellintegritet | `data/fag/fagverk_theory_quality_contract_v1.json`, subject-evidens og permanent theory-integrity-audit |
| Merkenavn, bilde, ikon, nivåer og undermerker | `data/badges/<subject_id>.json` og aktive badgekilder |
| Fagverkportalens navigasjonsmål | `data/fagverk/fagverk_portal.json` |
| Ferdigskrevne lærekapitler | `data/fagverk/fagverk_registry.json` og `data/fagverk/<subject_id>/<chapter_id>.json` |
| Fagsidens tekniske renderer | `fagverk.html` og felles Fagverk-runtime |
| Stedssider | `fagverk-sted.html`, canonical place-data og fagverkets stedssideruntime |
| Brukerens Knowledge | canonical Knowledge-policy, schema og runtime |
| Quizregler og quizleveranse | canonical quizkontrakter og aktive quizmanifester |
| Faktapåstander og kilder | canonical source-data og inspectable kildeevidens |
| Dokumentstatus og prioritet | `docs/documentation_registry.json` |

`data/fagverk/fagverk_portal.json` skal bare eie navigasjon og teknisk materialiseringsstatus. Det skal aldri kopiere pensum, emner, metoder, badgeinnhold eller brukerprogresjon.

`data/fag/fag_manifest.json` er filresolveren. Runtime skal ikke opprette en parallell hardkodet liste over fagfilstier.

---

## 5. Canonical fagomfang

Fagsidemotoren skal støtte alle fag-ID-er som til enhver tid finnes i `category_contract.json` og `fag_manifest.json`.

Ved innføringen av denne kontrakten omfatter programmet:

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
helse
utdanning
religion
scenekunst
sport
subkultur
vitenskap
filosofi
film_tv
```

Teknologi er ikke et eget toppfag. Den komplette fagpakken registreres som `vitenskap.specializations.teknologi` og skal vises som en spesialisering inne i Vitenskap & teknologi.

Denne listen er en kontrollert baseline, ikke en ny kategori-sannhetskilde. Ved endring gjelder `category_contract.json`, kategori-auditen og fagmanifestet.

Det utvidede målbildet er **19 toppfag + Teknologi som nested spesialisering = 20 auditerte enheter**. Den historiske sluttbaselinen på 17 toppfag + Teknologi = 18/18 strict skal bevares som et etterprøvbart resultat, men kan ikke brukes til å påstå at de to nye fagene allerede er ferdige.

Seks underkategorier er eksplisitt canonicale i `category_contract.json`: Natur → Geografi, Språk & litteratur → Språk & lingvistikk, Politikk & samfunn → Juss & rettsvitenskap, Politikk & samfunn → Sosiologi & antropologi, Helse & medisin → Medisin & helsevitenskap og Skole & utdanning → Pedagogikk & utdanningsvitenskap. Tverrfaglige emner skal ha én canonical eier og eksplisitte secondary bindings; hele fagfelt skal ikke dupliseres.

### 5.1 Faglig heldekning uten tallkvoter

Alle fag skal dekke **alle faglig relevante emner** innenfor sin dokumenterte avgrensning. Relevans og vesentlige faglige hull avgjør om et fag er komplett; et forhåndsbestemt antall gjør det ikke.

Det finnes derfor ingen felles redaksjonell kvote for:

- antall fagområder eller emner i et fag;
- antall emner i et fagområde;
- antall kapitler, moduler eller seksjoner;
- antall avsnitt, claims, kilder, eksempler, oppgaver eller kontrollspørsmål;
- lik størrelse mellom fag, fagområder eller kapitler.

Noen fagområder kan kreve få brede emner, andre mange smalere emner. Ett fagområde kan trenge flere kapitler, mens flere nært sammenhengende fagområder kan behandles i samme kapittel. Strukturen skal følge fagets faktiske kunnskapslandskap og en god læringsrekkefølge.

Tall kan brukes til:

- inventar og fremdriftsrapportering;
- kontroll av at oppgitte summer stemmer med faktiske arrays og registre;
- kontroll av unike ID-er, referanseintegritet og manglende filer;
- formatspesifikke produktkrav som er uavhengige av fagets redaksjonelle bredde.

Tall kan ikke brukes som:

- målkvote for å erklære et fag eller kapittel komplett;
- grunn til å splitte ett naturlig emne i flere kunstige emner;
- grunn til å slå sammen vesensforskjellige emner;
- grunn til å produsere fyllstoff, gjentakelser eller svake stedscase;
- erstatning for en dokumentert faglig completeness-audit.

Et emne skal normalt få egen canonical identitet når det har en selvstendig faglig problemstilling eller kunnskapsenhet, kan avgrenses fra nabotemaer og tilfører noe som ikke allerede er dekket. Overlappende betegnelser skal relateres, slås sammen eller modelleres som underpunkter i stedet for å beholdes for å fylle et tall.

Før `complete` må fagets dekningsgrunnlag dokumentere:

1. fagets formål, avgrensning og forhold til nabofag;
2. hvilke relevante områder, emner, begreper, teorier, metoder og fagtradisjoner som er vurdert;
3. hvorfor kandidater er inkludert, slått sammen, splittet, plassert i et nabofag eller utelatt;
4. hvor hvert inkluderte emne faktisk undervises i fagverket;
5. at sentrale perspektiver, uenigheter, historiske utviklingslinjer og praksisformer er med der de er relevante;
6. at gap-, overlapps- og fyllstoffaudit ikke finner vesentlige mangler eller kunstig produksjon;
7. at påstander, eksempler og metodebruk har tilstrekkelig inspectable evidens for innholdet de bærer.

Det finnes ikke ett universelt emnetall som kan bevise disse punktene. Den maskinlesbare dekningsrapporten skal derfor rapportere faktiske tall og konkrete hull, mens pass/fail avgjøres av dokumentert dekning og integritet.

`popkultur`/`populaerkultur` er ikke en egen toppkategori når kategorikontrakten behandler feltet som underfelt eller legacy-alias. Fagsidemotoren skal ikke gjeninnføre avviklede toppdomener gjennom lokal hardkoding.

### 5.2 Teori-, teoretiker- og modellintegritet

Teori-/modellkvalitet er en del av faglig heldekning, men skal aldri reduseres til et krav om et bestemt antall teoretikere. Den bindende maskinstandarden ligger i `data/fag/fagverk_theory_quality_contract_v1.json`.

Fag behandles etter tre profiler:

- **humaniora og teori-/fortolkningstunge samfunnsfag:** teorier, skoler, sentrale teoretikere/forskere, konkrete verk eller forskningsbidrag, rivaliserende perspektiver og tolkningskonsekvens;
- **naturvitenskap og formelle fag:** modeller, lover, mekanismer, paradigmer, forutsetninger, evidens og gyldighetsområder; forskernavn bare der de bærer reell faglig provenance;
- **teknologi, profesjonsfag og anvendte/sammensatte fag:** teorier, modeller, standarder, empiriske rammeverk og sentrale forskningsbidrag med eksplisitt evidensnivå og anvendelsesbegrensning.

Sluttintegritet vurderes **per canonicalt hovedfelt, ikke bare aggregert per fag**. For hvert relevant hovedfelt skal den permanente porten kunne dokumentere:

1. minst ett faglig bærende teori-, modell-, mekanisme-, lov-, paradigme- eller rammeverkgrunnlag;
2. `scope` og kjernepåstand/mekanisme;
3. forutsetninger eller preconditions der de er faglig relevante;
4. evidens-/observasjonsgrunnlag;
5. hva teorien eller modellen forklarer, predikerer eller gjør mulig å tolke;
6. eksplisitte begrensninger eller gyldighetsområde;
7. reell rival, alternativ forklaring eller rivaliserende lesning når feltet er omstridt;
8. person→verk/forskningsbidrag når en navngitt teoretiker eller forsker brukes som provenance;
9. faglig passende scholarly sources;
10. binding til canonicale emner/claims og faktisk substansiell bruk i prosa.

Følgende teller ikke som sluttbevis:

- en liste med navn uten konkrete verk/bidrag;
- teori som bare finnes i metadata, quiz eller registry uten innholdsbruk;
- en universitets-, kurs- eller programside som eneste dokumentasjon for selve teorien;
- samme generiske teorisett brukt som pynt på tvers av urelaterte hovedfelt;
- mange teoriobjekter eller mange navn uten kvalitativ hovedfeltdekning;
- aggregerte tellergrenser som ikke kan vise hvilket hovedfelt, teoriobjekt, kilde og innholdsbinding som bærer godkjenningen.

Teori skal brukes til å forklare et fenomen, tolke et verk, teste en mekanisme, sammenligne forklaringer eller avgrense en slutning. Spørsmål av typen «hvem mente X?» skal ikke være hovedformen for læring.

Manglende **auditbevis** er ikke automatisk et substansielt innholdshull. Eksisterende `complete`-status skal ikke nedgraderes eller åpnes bare fordi en strengere reconciliation-port ennå mangler proof. Faget repareres redaksjonelt først når auditen påviser en faktisk substansiell mangel. Proof-gap og content-gap skal derfor rapporteres separat.

### 5.3 Lukket teori-/modellkvalitetsprogram

Dette underprogrammet skal gjennomføres som én lukket kjede og kan ikke omtales som ferdig etter baseline alene:

1. **Felles standard:** lås én teori-/modellstandard som varierer med fagtype og unngår kunstige teoretikerkvoter.
2. **Read-only cross-audit:** mål alle canonicale fag og hovedfelt uten å skrive faginnhold.
3. **Kvalitative minimum:** vurder bærende teori/modell, evidens, begrensninger, rivaler og faktisk bruk; mange navn alene teller ikke.
4. **Baseline før reparasjon:** skill mellom allerede sterke fag, eksisterende men ustrukturert evidens og reelle faglige hull.
5. **Fagvis reparasjon:** behold canonicale emner/kapitler og reparer ett fag om gangen; skriv bare om prosa når en substansiell mangel krever det.
6. **Fast teori-/modellmal:** identitet, hovedfelt, scope, kjernepåstand/mekanisme, forutsetninger, evidens, forklarings-/tolkningsstyrke, begrensninger, rival/alternativ, verk/bidrag, scholarly sources og faktisk innholdsbinding.
7. **Permanent integritetsport:** feile på pynteteori, manglende verk/bidrag, generisk teori-gjenbruk, manglende rival i omstridte felt og metadata-/quiz-only teori.
8. **Ingen navnetrivia:** teori er et analyseverktøy; teoretikeren er provenance, ikke sluttmålet for læringen.
9. **Sluttreconciliation:** koble subject-auditer til én global, maskinlesbar og permanent read-only port.
10. **Strict main-gate:** programmet er først ferdig når alle canonicale hovedfelt har relevant teori-/modellgrunnlag, nødvendige rivaler, faglig riktig provenance/kilder, faktisk prosa-/claim-binding og global port er grønn på `main`.

---

## 6. Felles runtimearkitektur

Fagsiden skal bygges som denne kjeden:

```text
subject fra URL
      ↓
data/categories/category_contract.json
      ↓
data/fagverk/fagverk_portal.json
      ↓
data/fag/fag_manifest.json
      ↓
subject-adapter
      ↓
normalisert fagmodell
      ↓
felles renderer
      ↓
fagområde, emne, kapittel, progresjon og stedskoblinger
```

### 6.1 URL-gate

`subject` skal:

- være en eksplisitt canonical ID;
- finnes i kategorikontrakten;
- finnes i fagmanifestet;
- være markert teknisk materialisert før portalen tilbyr lenken;
- feile tydelig og uten falskt fallbackinnhold når kontrakten ikke er oppfylt.

### 6.2 Manifest-first

Runtime skal først lese `data/fag/fag_manifest.json` og deretter de filene manifestet peker til.

Forbudt:

- hardkodede filstier per fag i hovedrendereren;
- kopierte fagdata i `data/fagverk/`;
- egne komplette HTML-filer per kategori;
- skjulte aliaser som omgår kategorikontrakten;
- fallback til politikkdata når et annet fag mangler filer.

### 6.3 Adaptere

Adaptere normaliserer reelle schemaforskjeller. De skal ikke endre faglig betydning eller skape manglende innhold.

Følgende inputfamilier må minst håndteres:

1. **Standard canonical fagpakker** — pensum, emner, fagkart og methods i den etablerte canonicale modellen.
2. **Foundation-pakker** — aktive v1-fag med mindre faglig omfang, men samme presentasjonskontrakt.
3. **By-pakken** — eksisterende modul-/kursstruktur og compatibility-felt som må oversettes eksplisitt.
4. **Teknologi-pakken** — canonical vitenskapelig pakke med egne moduler og utvidet dekningsmodell.

Politikkadapteren kan beholdes under migrering, men politikk skal være en referanseimplementasjon, ikke en permanent særmotor.

---

## 7. Normalisert fagmodell

Alle adaptere skal levere samme semantiske modell til rendereren:

```js
{
  subject: {
    id,
    title,
    description,
    badge,
    routes
  },
  summary: {
    domainCount,
    emneCount,
    methodCount,
    mappingCount,
    hookCount
  },
  domains: [],
  emners: [],
  methods: [],
  mappings: [],
  chapters: [],
  places: [],
  progress: {}
}
```

### 7.1 Minimumsfelt

`subject` skal gi stabil identitet og ruter.

`domains` skal minst kunne gi:

- canonical ID;
- label;
- definisjon eller faglig beskrivelse;
- emne-ID-er;
- relevante metode-ID-er når source har dem.

`emners` skal minst kunne gi:

- canonical `emne_id`;
- `subject_id`;
- fagområde/domain;
- tittel;
- definisjon;
- hvorfor emnet betyr noe;
- begreper;
- faglige spørsmål eller tilsvarende analyseinnganger når source har dem.

`methods` skal minst kunne gi:

- canonical metode-ID;
- navn;
- beskrivelse eller formål;
- gyldige koblinger til emner/fagområder når source definerer dem.

`chapters` skal bare inneholde faktisk materialiserte, registerførte lærekapitler.

`progress` er avledet brukerstatus. Det er aldri del av de universelle fagfilene.

### 7.2 Ingen språklig utfylling

Adapter eller renderer skal ikke konstruere definisjoner, metodeforklaringer, emneinnhold eller kilder når source mangler dem.

Manglende felt skal:

- utelates;
- vises som ærlig manglende status når produktet trenger en statusflate;
- aldri fylles med generell, plausibel eller politikkavledet tekst.

---

## 8. Felles semantisk innholdsstruktur på alle fagsider

Alle teknisk materialiserte fagsider skal ha samme semantiske hovedstruktur. Dette standardiserer navigasjon og innholdstyper, ikke mengden innhold. Antall fagområder, emner, kapitler og underdeler skal variere med faglig behov.

### 8.1 Fagets identitet

Skal vise:

- fagets canonicale navn;
- fagets badgeidentitet;
- kort fagbeskrivelse fra eiet source;
- antall fagområder, emner, metoder, mappings og hooks når de finnes.

### 8.2 Din progresjon

Skal vise avledet status for:

- poeng og nivå;
- fullførte eller dekkede emner;
- dekning per fagområde;
- relevante fullførte quizer;
- eventuelle Knowledge-signaler som den canonicale progresjonsmodellen faktisk støtter.

Fagsiden skal ikke opprette ny progresjonsstorage.

### 8.3 Fagområder

Skal vise alle canonicale fagområder i source-definert rekkefølge med:

- navn;
- definisjon eller faglig avgrensning;
- antall emner;
- relevante metoder;
- brukerens beregnede dekning.

### 8.4 Emnesider

Canonical dypkobling:

```text
fagverk.html?subject=<subject_id>&domain=<domain_id>&emne=<emne_id>
```

Emnesiden skal, når source støtter det, vise:

- definisjon;
- hvorfor emnet betyr noe;
- kjernebegreper;
- nøkkelspørsmål;
- metoder;
- konflikter, akser eller analytiske skiller;
- relevante kapitler;
- relevante steder;
- relevant quiz- og Knowledge-progresjon.

### 8.5 Metoder

Metoder skal ikke være en løs navneliste. Presentasjonen skal forklare, fra canonical source:

- hva metoden undersøker;
- hva slags materiale eller observasjon den bruker;
- hvilke fagområder og emner den er koblet til;
- hvilke konkrete steder den kan anvendes på når dokumenterte mappings finnes.

### 8.6 Lærekapitler

Fullverdige kapitler skal være redigerte læringstekster, ikke renderer-genererte sammendrag av emnefilene.

### 8.7 Steder å utforske

Fagsiden kan lenke til steder som er koblet gjennom canonicale fag- og emne-ID-er.

Stedet skal åpnes på egen side. Fagsiden skal ikke kopiere hele stedets historie, popupDesc, Stories eller tverrfaglige innhold inn i ett fagkapittel.

---

## 9. Lærekapittelkontrakt

Et materialisert lærekapittel skal ligge i den eide fagverkstrukturen og registreres i `data/fagverk/fagverk_registry.json`.

Kapittelinndelingen skal følge sammenhengende læringsproblemer og stoffets faktiske omfang. Kravene nedenfor beskriver hvilke innholdstyper et fullverdig kapittel må ivareta; de fastsetter ikke et likt antall seksjoner, eksempler, claims, kilder, oppgaver eller selvtester i hvert kapittel. Omfanget skal være så stort som nødvendig og så lite som faglig forsvarlig.

Et fullverdig kapittel skal minst ha:

- stabil `chapter_id`;
- `subject_id`;
- ett primært canonicalt fagområde;
- eksplisitte `emne_ids`;
- tittel og ingress;
- forkunnskapsspørsmål;
- læringsmål;
- flere sammenhengende, redigerte seksjoner;
- arbeidseksempler;
- vanlige misoppfatninger;
- begreper;
- anvendelsesoppgaver;
- kontrollspørsmål eller selvtest;
- relevante stedssider;
- inspectable kilder;
- påstandssporing som tilfredsstiller `FACTUALITY_CONTRACT.md`;
- faktisk teori-/modellbruk i forklaring eller analyse der fagområdet krever det, med provenance, rivaler og begrensninger etter theory-quality-kontrakten.

### 9.1 Kapitler skal ikke kopiere canonicale emneobjekter

Fagfilen eier emnedefinisjonen. Kapittelet skal forklare, sammenstille, eksemplifisere og lære bort.

Forbudt:

- å kopiere hele emneobjekter inn i kapittelfilen;
- å opprette nye lokale emne-ID-er bare for kapittelet;
- å bruke renderer-generert tekst som redigert lærestoff;
- å legge inn påstander uten inspectable kilde;
- å bruke steder som filler for å nå et ønsket antall eksempler.

---

## 10. To uavhengige statusakser

Teknisk materialisering og redaksjonell ferdigstillelse er forskjellige ting og skal aldri blandes.

### 10.1 Navigasjonsstatus

Eies av `data/fagverk/fagverk_portal.json`.

Gyldige betydninger:

- `planned` — fagsiden tilbys ikke som klikkbar lenke;
- `materialized` — den generelle fagsidemotoren kan laste og vise faget uten feil.

`materialized` betyr ikke at læreverket er ferdigskrevet.

### 10.2 Redaksjonell status

Skal måle innholdets faktiske dybde:

- `not_started` — ingen godkjent strukturell fagsidegjennomgang;
- `structure_ready` — det nåværende canonicale inventaret av fagområder, emner og metoder kan vises korrekt; statusen beviser ikke at inventaret er faglig heldekkende;
- `chapters_in_progress` — kapittelproduksjon og completeness-audit pågår, og ett eller flere relevante emner mangler fortsatt fullverdig behandling;
- `complete` — alle ferdigkrav og heldekningskrav i denne kontrakten er oppfylt uten vesentlige faglige hull.

Redaksjonell status skal materialiseres i et eget maskinlesbart statusregister når implementasjonsprogrammet starter. Den skal ikke presses inn i portalens navigasjonsfelt eller badgefilene.

### 10.3 Forbudte statuspåstander

Det er ikke lov å kalle et fag:

- komplett fordi URL-en åpnes;
- kildeverifisert fordi schema og CI er grønne;
- heldekkende fordi det finnes mange lokale steder;
- ferdig fordi alle emner vises som kort;
- et læreverk fordi rendereren kan gjengi definisjoner;
- komplett fordi et forhåndsbestemt antall fagområder, emner, kapitler, moduler, seksjoner, claims, kilder eller oppgaver er nådd;
- teoriintegrert bare fordi en aggregert audit finner mange teorinavn eller objekter.

---

## 11. Krav til `structure_ready`

Et fag kan først settes til `structure_ready` når:

1. `subject_id` finnes i kategori- og fagmanifestkontrakten;
2. alle required manifestpekere finnes og kan lastes;
3. fagets adapter leverer den normaliserte modellen;
4. alle canonicale fagområder vises i riktig rekkefølge;
5. alle aktive emner vises og peker til gyldig fagområde;
6. alle viste metode-ID-er finnes;
7. mappings peker bare til eksisterende objekter;
8. fagets badgekilde og integrerte Progresjon-rute løses gjennom eide registre;
9. progresjon leses uten ny lokal storage;
10. dypkobling til fagområde og emne fungerer;
11. sideinnholdet inneholder ingen politikkspesifikk resttekst;
12. siden har tydelig lenke tilbake til fagverkforsiden, integrert Progresjon og globale **Min læring**;
13. alle permanente tester og audits er grønne.

`structure_ready` er en teknisk og referensiell integritetsstatus. Den sier at det registrerte inventaret virker, ikke at fagets relevante kunnskapsområde er ferdig kartlagt.

---

## 12. Krav til `complete`

Et fag kan først settes til `complete` når alle krav til `structure_ready` er oppfylt og:

1. en eksplisitt completeness-audit viser at alle faglig relevante områder, emner, begreper, teorier, metoder og fagtradisjoner innenfor fagets avgrensning er vurdert;
2. alle inkluderte relevante emner har fullverdig, redaksjonelt godkjent behandling i ett eller flere kapitler, uavhengig av kapittelantall;
3. inkluderinger, sammenslåinger, oppsplittinger, nabofagplasseringer og utelatelser er begrunnet, slik at det finnes et etterprøvbart svar på hvorfor inventaret ser ut som det gjør;
4. gap-auditen finner ingen vesentlige faglige mangler, og overlapps-/fyllstoffauditen finner ingen emner eller innholdsdeler som bare finnes for å nå et tall;
5. alle faktapåstander har inspectable kildegrunnlag, med så mange og så egnede kilder som påstanden og emnet krever;
6. kapitlene har de læringselementene som er nødvendige for stoffet, blant annet konkrete læringsmål, forklaring, eksempler, misoppfatninger, anvendelse og kontroll av forståelse;
7. metodepresentasjonen er faglig konkret, ikke bare en navneliste;
8. relevante stedskoblinger er canonicale og kildebelagte, uten stedscase brukt som fyllstoff;
9. quiz- og Knowledge-koblinger bruker eksisterende kontrakter og ID-er;
10. full fag-, link-, schema-, TypeScript-, browser- og dokumentasjonsaudit passerer;
11. det finnes ingen uavklarte duplikater, døde ruter, ukjente ID-er eller lokale fagkopier;
12. statusregisteret og dekningsrapporten er synkronisert med faktisk materialisert innhold og rapporterer tall som inventar, ikke som målkvoter;
13. relevant teori-/modellgrunnlag er dokumentert per canonicalt hovedfelt etter fagets profil, med nødvendige rivaler/alternativer, begrensninger, provenance, scholarly sources og faktisk emne-/claim-/prosabinding;
14. ingen teoriintegritetsgodkjenning bygger bare på aggregerte tellergrenser, navnelister, metadata-only eller quiz-only evidens.

`complete` er en streng publiseringsstatus, ikke en fremdriftsmarkør. Ved innføring av en strengere global teori-integritetsport skal eksisterende completion-status likevel behandles read-only inntil en faktisk substansiell mangel er bevist; manglende reconciliation-proof alene er ikke grunnlag for nedgradering.

---

## 13. Implementasjonsprogram

Programmet skal gjennomføres i faste faser.

### Fase 0 — baseline og inventar

Før runtime endres:

- les kategori- og fagmanifestet;
- inventer alle aktive fagpakker og schemafamilier;
- bygg en faglig kandidatliste for områder, emner, begreper, teorier, metoder og fagtradisjoner uten å fastsette et ønsket sluttantall;
- dokumenter fagets avgrensning, nabofag og kriterier for inkludering, sammenslåing, splitting og utelatelse;
- registrer required og optional sourcefelt per fag;
- identifiser politikkspesifikk hardkoding;
- mål hvilke fag som allerede kan normaliseres;
- dokumenter manglende filer, ugyldige referanser og schemaavvik;
- opprett maskinlesbar strukturell og redaksjonell status uten å markere utestede fag som klare.

Leveranse: én reproduserbar baseline-rapport og permanent audit, ikke en håndskrevet statusliste.

### Fase 1 — generell fagsidemotor

Bygg:

- generell subject-resolver;
- manifest-first loader;
- adaptergrense;
- normalisert fagmodell;
- generell renderer;
- generell badge- og progresjonsresolver;
- generelle dypkoblinger;
- feilflate som aldri faller tilbake til politikkinnhold;
- permanent all-subject audit.

Politikk skal fortsette å fungere gjennom den nye grensen før andre fag materialiseres.

### Fase 2 — fire representativt ulike piloter

Pilotene skal dekke de viktigste schemafamiliene:

1. `natur` — standard canonical v4.5-fagpakke;
2. `religion` — foundation-pakke;
3. `by` — modul-/kursbasert compatibility-pakke;
4. `vitenskap` — standard vitenskapelig fagpakke med den utvidede `teknologi`-pakken som nested spesialisering.

Pilotfasen er godkjent først når alle fire toppfag bruker samme renderer, og Teknologi-spesialiseringen kan normaliseres gjennom samme modell uten å opprette en attende toppside eller fagspesifikk DOM-kopi.

### Fase 3 — strukturell materialisering av alle fag

De resterende fagene materialiseres ett fag om gangen.

For hvert fag:

- adapter og normalisering;
- strukturell audit;
- UI- og lenkekontroll;
- oppdatering fra `planned` til `materialized` først etter grønn gate;
- `structure_ready` bare når alle krav i kapittel 11 er oppfylt.

Det skal ikke åpnes en stor masse-PR som setter alle fag til materialized uten individuell evidens.

### Fase 4 — redaksjonell kapittelproduksjon

Arbeidet gjøres fag for fag og i faglig sammenhengende produksjonsenheter. En produksjonsenhet kan følge ett fagområde, en del av et stort fagområde eller flere tett sammenhengende områder:

```text
faglig produksjonsenhet
  → kapittelbrief
  → claims og kilder
  → redigert lærestoff
  → emne- og metodekoblinger
  → steder og eksempler
  → oppgaver og kontrollspørsmål
  → audit
  → merge
```

Ett fag skal få sammenhengende fremdrift før produksjonen spres tilfeldig over alle kategorier.

### Fase 5 — fullføring og frysing

Når et fag når `complete`:

- materialiser full dekningsrapport;
- frys et eksplisitt og faglig begrunnet inventar av fagområder, emner, metoder og kapitler;
- koble status til permanent CI;
- behold mulighet for kildekorrigering og faglig revisjon;
- gjenåpne heldekningsvurderingen når ny kunnskap, nye faglige felt eller dokumenterte hull gjør inventaret utilstrekkelig;
- unngå at en kvalitetsfrys blir tolket som garanti mot fremtidige feil.

---

## 14. Fag-for-fag arbeidskort

Kopier dette inn i hver strukturelle fag-PR:

```text
Fag: <subject_id>

[ ] Finnes i category_contract.json
[ ] Finnes i data/fag/fag_manifest.json
[ ] Badgekilde og integrert Progresjon-rute er løst
[ ] Pensum kan lastes
[ ] Emner kan lastes
[ ] Fagkart kan lastes
[ ] Methods kan lastes
[ ] Eventuelle mappings/hooks kan lastes
[ ] Schemafamilie er identifisert
[ ] Adapter leverer normalisert modell
[ ] Fagets avgrensning og nabofag er dokumentert
[ ] Relevante faglige kandidater er vurdert uten forhåndsbestemt sluttantall
[ ] Inkluderinger, sammenslåinger, splittinger og utelatelser er begrunnet
[ ] Alle fagområder er med
[ ] Alle aktive emner har gyldig fagområde
[ ] Alle viste metode-ID-er finnes
[ ] Teori-/modellprofil er identifisert og canonicale hovedfelt kan auditeres
[ ] Ingen politikkspesifikk resttekst
[ ] Fagforside fungerer
[ ] Domain-dypkobling fungerer
[ ] Emne-dypkobling fungerer
[ ] Integrert Progresjon-rute fungerer
[ ] Stedssider åpnes separat
[ ] Progresjon bruker eksisterende read-model
[ ] Portalstatus er fortsatt planned før grønn gate
[ ] Permanente tester og audits er grønne
[ ] Portalstatus settes til materialized i samme godkjente PR
[ ] Redaksjonell status er ærlig
[ ] Tall rapporteres som inventar og integritet, ikke som completeness-kvote
```

Kopier dette inn i hver kapittel-PR:

```text
Fag: <subject_id>
Fagområde: <domain_id>
Kapittel: <chapter_id>

[ ] Canonical emne-ID-er er valgt
[ ] Emneutvalget følger faglig relevans, ikke et ønsket antall
[ ] Kapittelbrief er godkjent
[ ] Faktapåstander er registrert og kildebelagt
[ ] Avviste/usikre detaljer er dokumentert
[ ] Læringsmål er konkrete
[ ] Sammenhengende seksjoner er redigert
[ ] Arbeidseksempler er dokumenterte
[ ] Misoppfatninger er faglig reelle
[ ] Begreper peker til canonicale objekter
[ ] Relevant teori/modell brukes faktisk i forklaring eller analyse, ikke bare metadata
[ ] Teoretiker/forsker er bundet til konkret verk/bidrag når navn brukes
[ ] Rival/alternativ og begrensninger er med der fagfeltet krever det
[ ] Oppgaver og kontrollspørsmål er med
[ ] Steder er relevante og canonicale
[ ] Kapittelet er registrert i fagverkregisteret
[ ] Ingen emneobjekter er kopiert inn
[ ] Kilde- og fagverkaudit er grønn
[ ] Kapittelet har nødvendig omfang uten fyllstoff eller kunstig oppsplitting
```

### 14.1 Theory-quality programchecklist

Bruk denne når teori-/modellintegriteten auditeres eller reconciles på tvers av Fagverket:

```text
[ ] 1. Felles teori-/modellstandard er låst per fagtype
[ ] 2. Read-only cross-Fagverk audit dekker alle canonicale fag og hovedfelt
[ ] 3. Minimumskrav er kvalitative; navne- og objekttelling alene kan ikke bestå
[ ] 4. Baseline er kjørt før reparasjon og skiller proof-gap fra content-gap
[ ] 5. Reelle reparasjoner gjøres fag for fag uten å produsere fagene på nytt
[ ] 6. Hver teori/modell følger fast kvalitetsmal med scope, mekanisme, evidens, begrensninger, rival og provenance der relevant
[ ] 7. Permanent integritetsport feiler på pynteteori, metadata-only og manglende hovedfeltbevis
[ ] 8. Teori brukes som analyseverktøy, ikke som navnetrivia
[ ] 9. Subject-auditer er reconcilet til én global maskinlesbar read-only port
[ ] 10. Global strict gate er grønn på main før hele theory-quality-programmet kalles ferdig
```

---

## 15. PR- og batchregel

### 15.1 Fundament

Den generelle motoren, adaptergrensen, statusmodellen og permanent audit skal inn i én avgrenset foundation-PR.

### 15.2 Strukturelle fag-PR-er

Standard er ett fag per PR.

En PR skal ikke kombinere:

- flere urelaterte fagadaptere;
- stor redaksjonell kapittelproduksjon;
- endringer i kategoriarkitektur;
- quizproduksjon for mange steder;
- redesign av merkesidene.

### 15.3 Kapittel-PR-er

Standard er én liten, faglig sammenhengende produksjonsenhet per PR. PR-grensen er en arbeids- og mergegrense, ikke en regel om hvor mange emner eller kapitler et fagområde skal ha.

Hver PR skal ha:

- tydelig source of truth;
- eksakt filinventar;
- kilde- og claimoversikt;
- dokumentert dekningsendring;
- ren diff;
- relevante tester;
- låst head-SHA ved merge.

### 15.4 Ingen falsk fremdrift

Det er ikke fremdrift å:

- opprette tomme kapittelfiler;
- vise emnekort uten fungerende dypkobling;
- sette status til materialized før siden kan lastes;
- duplisere politikkrendereren;
- skrive generiske introduksjoner uten kilder;
- øke coverage-tall ved å senke kravene;
- nå et forventet tall ved å splitte, slå sammen eller gjenta innhold uten faglig grunn;
- bruke den historiske 18/18-baselinen som ferdigbevis for 19+1-utvidelsen når Helse og Utdanning fortsatt mangler produksjon og strict hovedfelt-proof.

---

## 16. Permanente kvalitetsporter

Fagverk-workflowen skal etter hvert håndheve minst:

### 16.1 Kategori og manifest

- alle canonicale fag finnes i fagmanifestet;
- ingen ukjente eller avviklede toppdomener materialiseres;
- alle required filpekere finnes;
- `subject_id` stemmer med manifestnøkkelen;
- badge- og portalreferanser er gyldige.

### 16.2 Normalisert modell

- alle adaptere leverer samme kontrakt;
- domain- og emne-ID-er er unike;
- alle aktive emner har gyldig fagområde;
- alle metode- og mappingreferanser kan løses;
- ingen adapter produserer oppdiktet fallbacktekst.

### 16.3 Sider og lenker

- alle `materialized` fag åpnes;
- alle `planned` fag er ikke-klikkbare i portalen;
- badgeidentitet rendres i fagsidens Progresjon uten parallell fagstruktur;
- domain- og emnedypkoblinger virker;
- stedssider åpnes separat;
- ingen fagside har hardkodet politikk- eller legacy-merkerute.

### 16.4 Kapitler

- alle registrerte kapittelfiler finnes;
- alle chapter-, subject-, domain- og emne-ID-er er gyldige;
- required læringsfelt finnes;
- inspectable kilder finnes;
- `complete` krever dokumentert dekning av alle faglig relevante emner og perspektiver innenfor fagets avgrensning;
- dekningsrapporten viser konkrete inkluderinger, utelatelser, sammenslåinger, gap og overlapp;
- ingen fast emne-, kapittel-, modul-, seksjons-, claim-, kilde- eller oppgavekvote brukes som redaksjonelt ferdigbevis;
- emnedefinisjoner og begrepslister er ikke håndkopiert som parallelle sannheter.

### 16.5 Dokumentasjon

- dette dokumentet finnes og beholder canonical status;
- navigasjonsdokumentet peker hit for full produksjonsarkitektur;
- dokumentasjonskartet og den korte repo-inngangen peker hit;
- alle eksplisitte dokument- og datareferanser i denne kontrakten finnes;
- politikkspesifikk implementasjonsstatus kan ikke igjen bli omtalt som kontrakt for alle fag.

### 16.6 Teori-, teoretiker- og modellintegritet

Den globale read-only theory-integrity-porten skal:

- dekke 19 canonicale toppfag + Teknologi som nested spesialisering;
- beholde baseline og strict proof som forskjellige nivåer;
- måle hvert canonicalt hovedfelt, ikke bare fagets totalsummer;
- kreve bærende teori/modellgrunnlag, relevante rivaler/alternativer og eksplisitte begrensninger/gyldighetsområder;
- kreve person→verk/forskningsbidrag når navngitte personer brukes som provenance;
- kreve academically appropriate scholarly sources;
- kreve canonical emne-/claim-binding og faktisk substansiell prosa-bruk;
- feile på generisk teori-padding, navnelister og metadata-/quiz-only teori;
- rapportere manglende auditbevis separat fra beviste substansielle innholdshull;
- holde completion-status read-only med mindre en faktisk substansiell kvalitetsfeil er dokumentert;
- produsere én deterministisk maskinlesbar global rapport og en eksplisitt reconciliation-kø;
- først sette `strictCompletionGateReady=true` når alle canonicale profiler er strengt bevist.

---

## 17. Nåværende baseline

Per 2026-08-20 er den historiske 17+1-leveransen bevist med **18/18 `strictly_proven`**. Utvidelsesprogrammet har deretter etablert to nye canonicale toppfag, `helse` og `utdanning`, med kjernefilene pensum, emner, fagkart og methods. Begge står ærlig som `planned` / `pending` / `not_started` og har ingen fulltekst- eller strict-completion-status.

Gjeldende utvidelsesstatus skal derfor uttrykkes som **19 toppfag + én nested Teknologi-spesialisering, 18/20 strictly proven, to expansion-production-fag og null content-repair-fag**. `reports/fagverk/fagverk-expansion-19-plus-1-reconciliation-v1.json` eier den første reuse/move/secondary-link/gap-auditen. Gjeldende navigasjonsstatus leses alltid fra `data/fagverk/fagverk_portal.json`, redaksjonell status fra `data/fagverk/subject_status.json`, og strict-status fra den deterministiske theory-integrity-rapporten.

---

## 18. Hele programmet er ferdig når

Fagverksprogrammet kan først omtales som ferdig når:

1. alle canonicale fag bruker samme fagsidemotor;
2. alle fag er teknisk materialisert og individuelt auditert;
3. alle fag har korrekt merke-, fagområde-, emne-, metode-, progresjons- og stedspresentasjon;
4. alle faglig relevante emner i alle fag har fullverdig redigert behandling, med kapittelinndeling bestemt av stoffet og ikke av en tallmal;
5. alle brukerrettede faktapåstander er kildebelagte;
6. quiz og Knowledge bruker canonicale ID-er og eide systemer;
7. ingen kategori har en parallell HTML-, data- eller progresjonsarkitektur;
8. alle navigation-, data-, content-, TypeScript-, browser-, link- og dokumentasjonsporter er grønne;
9. teknisk og redaksjonell status er maskinlesbar, etterprøvbar og synkronisert;
10. portalens **Åpne faget** leder til et reelt læreverk for hvert canonicalt fag;
11. den permanente theory-integrity-porten har strict hovedfelt-for-hovedfelt-proof for alle canonicale fagprofiler, tom proof-reconciliation-kø og er grønn på `main`.
12. alle 19 toppfag er materialized og audited, 20/20 enheter inkludert Teknologi er `strictly_proven`, alle seks ekspansjonsunderkategoriene er reelt produsert og re-proven, og proof-, expansion-production- og content-repair-køene er tomme.

---

## 19. Endringsregel

Endringer i fagsidearkitektur, statusbetydning, produksjonsrekkefølge eller ferdigkrav skal gjøres her først.

Andre dokumenter kan:

- eie smalere kontrakter;
- peke hit;
- beskrive implementasjonsstatus;
- dokumentere ett fag eller ett subsystem.

De skal ikke opprette et konkurrerende samlet regelverk for hvordan alle fagsidene bygges.
