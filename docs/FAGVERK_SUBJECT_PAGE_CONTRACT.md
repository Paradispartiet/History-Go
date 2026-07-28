# History GO - kontrakt for bygging og ferdigstilling av alle fagsider

Status: **canonical og bindende fagsidekontrakt v1**
Eier: `fagverk_subject_page_contract`
Gjelder: alle canonicale fag i `data/categories/category_contract.json`
Sist kontrollert: **2026-07-28**

Dette dokumentet er den bindende produksjonskontrakten for hvordan History GO skal bygge, materialisere, kvalitetssikre og ferdigstille fagsidene i Fagverket.

Dokumentet oppretter ikke en ny fagmodell. Det bestemmer hvordan eksisterende canonicale fagdata skal leses og presenteres som én sammenhengende, kildebelagt og etterprøvbar læringsflate.

---

## 1. Bindende hovedbeslutning

History GO skal ha:

> **Én generell fagsidemotor, én canonical fagpakke per fag og én offentlig fagsiderute per fag.**

Alle fagsider skal åpnes gjennom samme side og samme runtimekontrakt:

```text
fagverk.html?subject=<subject_id>
```

Eksempler:

```text
fagverk.html?subject=natur
fagverk.html?subject=historie
fagverk.html?subject=teknologi
fagverk.html?subject=kunst
```

Det er forbudt å løse oppgaven ved å:

- kopiere `fagverk.html` til én HTML-fil per fag;
- kopiere politikkens canonicale fagdata inn i andre fag;
- opprette parallelle emne-, fagkart-, metode- eller pensumregistre for fagsiden;
- hardkode ett fag som fallback når et annet fag ikke kan lastes;
- markere en side som ferdig fordi URL-en åpner eller schemaet passerer;
- fylle kapitler, eksempler, steder eller kilder for å oppnå kunstig completeness.

Politikk er referanseimplementasjonen og regresjonsgrunnlaget. Politikk er ikke en mal som skal kopieres uendret til alle fag.

---

## 2. Hva denne kontrakten eier

Denne kontrakten eier:

- målarkitekturen for den generelle fagsidemotoren;
- den normaliserte runtime-modellen for alle fag;
- adapterfamiliene som leser ulike canonicale fagpakker;
- skillet mellom teknisk materialisering og redaksjonell ferdigstilling;
- produksjonsstatusene for fagsider og lærekapitler;
- obligatorisk sideinnhold og ferdigkriterier;
- claim-, kilde- og reviewkrav for sammenhengende lærestoff;
- rekkefølgen for motor-, adapter-, materialiserings- og kapittelarbeid;
- PR-grenser og permanente QA-porter for fagsidene.

Denne kontrakten eier ikke:

- hvilke fag-ID-er som finnes;
- selve fagområdene, emnene, metodene, teoriene eller begrepene;
- badgeidentitet, poenggrenser eller nivånavn;
- quizproduksjon;
- personlig Knowledge eller progresjonslagring;
- stedets egen artikkel eller tverrfaglige stedshistorie;
- designkontrakten for stedets fagverkside.

Disse ansvarsområdene eies av kildene i autoritetskartet nedenfor.

---

## 3. Begreper og sideroller

| Begrep | Bindende betydning |
|---|---|
| **Fagverkforsiden** | Felles inngang til alle fag og merker: `fagverk-forside.html`. |
| **Merkeside** | Spill- og progresjonsside for badge, poeng, nivåer, undermerker, quiz og steder. |
| **Fagside** | Læreside for fagstruktur, fagområder, emner, metoder og lærekapitler. |
| **Fagområdeside** | Dynamisk visning av ett canonicalt domene eller fagområde innen faget. |
| **Emneside** | Dynamisk visning av ett canonicalt `emne_id`. |
| **Lærekapittel** | Sammenhengende, redigert og kildebelagt tekst som forklarer deler av faget. |
| **Stedets fagverkside** | Selvstendig side for ett konkret sted: `fagverk-sted.html?place=<place_id>`. |
| **Materialisert** | Offentlig rute, dataflyt og navigasjon fungerer og er validert. |
| **Redaksjonelt ferdig** | Hele fagets nødvendige lærestoff har bestått claim-, kilde-, fag- og redaksjonsportene. |

Merkesiden og fagsiden skal alltid ha forskjellige adresser og tydelige navn. Detaljert siderollekontrakt ligger i [`FAGVERK_NAVIGATION.md`](./FAGVERK_NAVIGATION.md).

---

## 4. Autoritetskart og obligatorisk leserekkefølge

Ved arbeid på fagsider skal dokumentene leses i denne rekkefølgen. Hvert dokument eier bare ansvarsområdet som er oppgitt.

| Rekkefølge | Kilde | Eier |
|---:|---|---|
| 1 | [`documentation_registry.json`](./documentation_registry.json) | Dokumentstatus, eierskap og prioritet. |
| 2 | [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) | Faktisitet, inspectable kilder, usikkerhet og forbud mot gjetting. |
| 3 | [`HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](./HISTORY_GO_TECHNICAL_ARCHITECTURE.md) | Målarkitektur, språk- og plattformeierskap. |
| 4 | [`DOMAIN_CONTRACT.md`](./DOMAIN_CONTRACT.md) og [`../data/categories/category_contract.json`](../data/categories/category_contract.json) | Canonicale fag-ID-er, rekkefølge, navn og kategoribeslutninger. |
| 5 | [`SUBJECT_FILE_CONTRACT.md`](./SUBJECT_FILE_CONTRACT.md) | Én universell fagmodell per fag og separate geografiske produksjonslag. |
| 6 | [`../README/README.pensum.md`](../README/README.pensum.md) | Forholdet mellom merke, fagkart, emner, quiz, Knowledge og progresjon. |
| 7 | [`../README/fagstrukturREADME.md`](../README/fagstrukturREADME.md) | Operativ guide til fagpakkens lag og manifest-resolverte filer. |
| 8 | [`FAGVERK_NAVIGATION.md`](./FAGVERK_NAVIGATION.md) | Navigasjon, sideroller og portalregler. |
| 9 | **Dette dokumentet** | Bygging, status, kvalitet og ferdigstilling av alle fagsider. |
| 10 | [`FAGVERK.md`](./FAGVERK.md) | Operativ beskrivelse av dagens politikkimplementasjon og eksisterende runtime. |
| 11 | [`DATA_PRODUCTION_CONTRACT.md`](./DATA_PRODUCTION_CONTRACT.md) | Generelle regler for canonical data, manifester, kildeverifikasjon og CI. |
| 12 | [`KNOWLEDGE_ARCHITECTURE.md`](./KNOWLEDGE_ARCHITECTURE.md) | Knowledge-eierskap, storage og grensen mot fagstruktur og progresjon. |
| 13 | [`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md) | Eneste bindende produksjonsprosedyre for quiz. |
| 14 | [`../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json`](../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json) | Globale quiz-invariants og kategori-profiler. |
| 15 | [`PLACE_PRODUCTION_CHECKLIST.md`](./PLACE_PRODUCTION_CHECKLIST.md) og [`PLACE_STANDARD.md`](./PLACE_STANDARD.md) | Produksjon og ferdigstilling av konkrete steder. |
| 16 | [`FAGVERK_PLACE_DESIGN.md`](./FAGVERK_PLACE_DESIGN.md) | Kategoridesign og bildekrav for stedets fagverkside, ikke den generelle fagsiden. |
| 17 | [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) | Overordnet produktbetydning av ferdig-, fullført- og mestringsnivåer. |
| 18 | [`HISTORY_GO_PRODUCT_MAP.md`](./HISTORY_GO_PRODUCT_MAP.md) | Produktprioritet og samlet ferdigstillelseskontekst. |
| 19 | [`TYPESCRIPT_FIRST_POLICY.md`](./TYPESCRIPT_FIRST_POLICY.md) | Språkpolicy for ny og vesentlig endret runtime og tooling. |
| 20 | [`../README/TEAM_WORKFLOW.md`](../README/TEAM_WORKFLOW.md) | Branch-, PR-, review-, kontroll- og mergeflyt. |

### Konfliktregel

Ved konflikt gjelder:

1. `FACTUALITY_CONTRACT.md` for fakta og kilder;
2. `category_contract.json` for fag-ID-er og kategorier;
3. `SUBJECT_FILE_CONTRACT.md` for universell fagdataarkitektur;
4. dette dokumentet for fagsideproduksjon og ferdigstatus;
5. `FAGVERK_NAVIGATION.md` for navigasjon og sideroller;
6. runtime source-data, manifester, loadere og validering for faktisk implementert dataflyt.

En operativ guide kan aldri overstyre en canonical kontrakt. Dokumentasjonen skal korrigeres dersom den avviker fra gyldig canonical source-data og validering.

---

## 5. Maskinelle sannhetskilder

| Kilde | Ansvar |
|---|---|
| `data/categories/category_contract.json` | Fag-ID-er, rekkefølge og visningsnavn. |
| `data/fag/fag_manifest.json` | Filresolver for aktiv fagpakke per `subjectId`. |
| Manifest-resolverte `pensum`-filer | Fagområder, progresjonsstruktur og faglig orden der feltet finnes. |
| Manifest-resolverte `emner`-filer | Canonicale emner, definisjoner, begreper og spørsmål. |
| Manifest-resolverte `fagkart`-filer | Faglig struktur, relasjoner, teorier og hooks. |
| Manifest-resolverte `methods`-filer | Canonicale metoder og analyseformer. |
| `data/badges/<subject_id>.json` | Merkenavn, ikon, bilde, farger, nivåer og undermerker. |
| `data/fagverk/fagverk_portal.json` | Merkesider, offentlige fagsideruter og navigasjonsstatus. |
| `data/fagverk/fagverk_registry.json` | Materialiserte lærekapitler og stedsspesifikk kuratering. |
| `data/fagverk/<subject>/...` | Redigerte lærekapitler, claims og kilder. |
| Knowledge- og quizkontraktene | Personlig kunnskap, vurdering og læringsevidens. |

Fagverkregisteret og fagsiden skal referere til canonicale emne-, metode- og fagområde-ID-er. De skal ikke kopiere hele fagdefinisjoner for å lage en parallell sannhet.

---

## 6. Målarkitektur

```text
category_contract.json
          |
          v
   fag_manifest.json
          |
          +--> pensum
          +--> emner
          +--> fagkart
          +--> methods
          |
          v
  generell fagmodell + adapter
          |
          v
fagverk.html?subject=<subject_id>
          |
          +--> fagområdesider
          +--> emnesider
          +--> lærekapitler
          +--> steder og videre utforskning
```

Den generelle motoren skal bestå av ett felles modellag og ett felles presentasjonslag, for eksempel:

```text
js/fagverk-subject-model.js
js/fagverk-subject-page.js
```

eller TypeScript-ekvivalenter i tråd med `TYPESCRIPT_FIRST_POLICY.md`.

Fagspesifikke adaptere kan finnes, men de skal bare oversette canonicale felt til den normaliserte modellen. De skal ikke eie kopier av faginnholdet.

---

## 7. Normalisert runtime-modell

Alle adaptere skal produsere samme semantiske modell:

```js
{
  subject: {
    id,
    title,
    description,
    badge
  },
  domains: [],
  emners: [],
  methods: [],
  mappings: [],
  chapters: [],
  places: [],
  progress: {},
  sourceFiles: {},
  diagnostics: []
}
```

### Obligatoriske invariants

- `subject.id` er en canonical `fagSubjects`-ID.
- Alle `domain_id`-er er unike innen faget.
- Alle `emne_id`-er er unike og tilhører riktig fag.
- Alle emnereferanser fra domener og kapitler løser til eksisterende emner.
- Alle metodereferanser løser til canonicale metoder.
- Ukjente eller manglende filer gir eksplisitt feil, ikke stille politikkfallback.
- Et fag uten materialiserte kapitler skal fortsatt kunne vise canonical struktur når adapteren er gyldig.
- Brukerprogresjon leses fra eide progresjonskilder og skrives aldri inn i fagdata.
- Adapteren skal bevare source paths i `sourceFiles` slik at feilsøking og audit kan spore dataflyten.

---

## 8. Adapterfamilier

Motoren skal støtte følgende adapterfamilier. Nye familier krever en dokumentert, reell schemaforskjell.

### A. Standard canonical fagpakke

Gjelder fag med manifest-resolverte `pensum`, `emner`, `fagkart` og `methods`, normalt canonical v4.5 eller tilsvarende.

Typiske fag:

- `historie`;
- `kunst`;
- `litteratur`;
- `media`;
- `musikk`;
- `naeringsliv`;
- `natur`;
- `psykologi`;
- `sport`;
- `subkultur`;
- `vitenskap`;
- `film_tv`.

### B. Foundation v1

Gjelder mindre, aktive grunnpakker med samme faglige ansvar, men mindre datamengde:

- `religion`;
- `scenekunst`;
- `filosofi`.

Mindre datamengde er tillatt. Parallelle UI-regler eller lavere kildekrav er ikke tillatt.

### C. By-modulformat

`by` har eldre kurs- og modulstruktur. Adapteren skal normalisere moduler, mål, emner, konsepter, steder og oppdrag uten å omskrive source-filen til en ny parallell universell fagmodell.

### D. Vitenskapelig utvidet format

`teknologi` har scientific package, pathway-data og utvidet dekningsmodell. Adapteren skal bevare den ekstra dybden gjennom normaliserte tilleggsfelt og egne visningsseksjoner, ikke gjennom en separat HTML-side.

### E. Politikkovergang

Politikkens eksisterende runtime er referanse og regresjonsgrunnlag. Den skal migreres til den generelle motoren uten å miste:

- tretten canonicale fagområder;
- 123 emner;
- progresjon;
- underbadge-til-fagområde-mapping;
- kapittel- og emnedypkoblinger;
- stedskontekst;
- eksisterende lærekapitler.

Politikkspesifikk kode skal reduseres til en adapter eller utvidelse der dataformatet faktisk krever det.

---

## 9. Obligatorisk fagsidestruktur

En materialisert fagside skal minst ha følgende brukerflater.

### 9.1 Fagidentitet

- canonical navn og fag-ID;
- badge, ikon eller bilde fra badgefilen;
- fagbeskrivelse fra canonical kilde;
- tydelig lenke til riktig merkeside;
- tydelig lenke tilbake til Fagverkforsiden.

### 9.2 Fagoversikt

- antall fagområder;
- antall emner;
- antall metoder;
- relevante hooks eller mappinger der faget har dem;
- eksplisitt forklaring når en datatype ikke finnes i fagpakken.

### 9.3 Personlig progresjon

- poeng og nivå;
- fullførte eller dekkede emner;
- dekning per fagområde;
- relevante quizresultater;
- ingen lokal kopi av progresjonsdata.

### 9.4 Canonicale fagområder

Hvert fagområde skal kunne åpnes og vise:

- navn og definisjon;
- faglig rolle eller spørsmål;
- tilknyttede emner;
- metoder og hooks;
- brukerens dekning;
- relevante lærekapitler;
- relevante steder når koblingen er dokumentert.

### 9.5 Canonicale emner

Hvert emne skal kunne åpnes og vise tilgjengelige canonicale felt, blant annet:

- tittel og definisjon;
- hvorfor emnet betyr noe;
- kjernespørsmål;
- begreper;
- metoder;
- konflikter eller analytiske skiller;
- kobling til fagområde;
- progresjonsstatus.

Manglende felt skal utelates eller forklares. De skal ikke fylles med generisk tekst.

### 9.6 Metoder

Metoder skal presenteres som faglige arbeidsmåter, ikke bare som ID-lister. Når source-data finnes, skal siden vise:

- hva metoden undersøker;
- hvordan den brukes;
- hvilke emner den er koblet til;
- hvilke kildetyper eller observasjoner den krever;
- relevante steder eller oppgaver.

### 9.7 Lærekapitler

Materialiserte kapitler skal inngå i samme fagside og følge kapittelkontrakten i seksjon 12.

### 9.8 Steder og videre utforskning

Fagsiden kan lenke til konkrete steder gjennom canonicale koblinger. Stedene er selvstendige objekter og skal åpnes i `fagverk-sted.html?place=<place_id>`.

Et sted skal ikke kopieres inn som et uavhengig fagkapittel. Fagsiden forklarer faget; stedssiden eier stedets konkrete og tverrfaglige innhold.

---

## 10. Teknisk status og redaksjonell status

Teknisk materialisering og redaksjonell ferdigstilling er to forskjellige ting. De skal aldri slås sammen til ett uklart `complete`-felt.

### 10.1 Teknisk status

| Status | Betydning |
|---|---|
| `planned` | Faget er registrert, men har ingen offentlig fungerende fagside. |
| `adapter_ready` | Adapteren leser og validerer fagpakken, men siden er ikke offentlig materialisert. |
| `structure_ready` | Fagområder, emner, metoder og navigasjon kan vises i testmiljø. |
| `materialized` | Offentlig rute, portal, dypkoblinger, progresjon og permanent QA fungerer. |
| `blocked` | En navngitt data-, schema-, kilde- eller arkitekturfeil stopper videre materialisering. |

### 10.2 Redaksjonell status

| Status | Betydning |
|---|---|
| `not_started` | Ingen fullverdige lærekapitler er godkjent. |
| `in_progress` | Minst ett kapittel er under produksjon eller godkjent, men fagdekningen er ufullstendig. |
| `review` | Nødvendige kapitler finnes, men minst én fag-, kilde- eller redaksjonsport gjenstår. |
| `complete` | Alle nødvendige fagområder er dekket av godkjent lærestoff og alle porter er bestått. |
| `blocked` | Utilstrekkelig kildegrunnlag eller uavklart faglig konflikt hindrer forsvarlig ferdigstilling. |

### 10.3 Kapittelstatus

| Status | Betydning |
|---|---|
| `planned` | Kapittelbehovet er definert. |
| `claims_ready` | Påstandsregister og kildetilgang er kontrollert. |
| `draft` | Tekst er skrevet, men ikke godkjent. |
| `source_review` | Påstander kontrolleres mot kildene. |
| `editorial_review` | Struktur, språk, pedagogikk og faglig helhet kontrolleres. |
| `approved` | Begge reviewporter er bestått. |
| `blocked` | Kapittelet kan ikke ferdigstilles uten bedre kilder eller avklaring. |

---

## 11. Maskinlesbar status

En senere implementasjonsfase skal opprette:

```text
data/fagverk/fagverk_subject_status.json
```

Statusregisteret skal være avledet og etterprøvbart. Det skal minst inneholde:

```json
{
  "subjectId": "natur",
  "technicalStatus": "materialized",
  "editorialStatus": "in_progress",
  "adapterFamily": "standard_canonical",
  "route": "fagverk.html?subject=natur",
  "domainCount": 6,
  "emneCount": 33,
  "approvedChapterCount": 2,
  "requiredChapterCount": 6,
  "blockingIssues": [],
  "verifiedAt": "2026-07-28"
}
```

Regler:

- status skal ikke håndskrives uten validatorgrunnlag;
- `materialized` krever fungerende rute og permanent QA;
- `complete` krever godkjent kapitteldekning, ikke bare antall filer;
- `blockingIssues` skal navngi reelle hindringer;
- portalregisteret eier fortsatt navigasjonsmålet, ikke redaksjonell ferdigstatus;
- statusregisteret må ha nøyaktig én post per canonicalt fag.

---

## 12. Kontrakt for lærekapitler

Et fullverdig lærekapittel skal minst ha:

- stabil kapittel-ID;
- fag-ID;
- tittel, undertittel og ingress;
- eksplisitte canonicale fagområde- og emne-ID-er;
- forkunnskapsspørsmål;
- læringsmål;
- sammenhengende seksjoner;
- hovedpoenger;
- arbeidseksempler;
- vanlige misforståelser med korrigering;
- begreper;
- anvendelsesoppgaver;
- kontrollspørsmål med svar;
- relevante steder som eksterne videreinnganger;
- inspectable kilder;
- claimregister;
- source review-status;
- editorial review-status.

Kapittelet skal være sammenhengende lærestoff. Det skal ikke være en automatisk sammenliming av emnedefinisjoner, quizforklaringer eller stedstekster.

Det finnes ingen bindende fast prosa-mal for alle fag. Kapittelets form skal følge fagets egen forklaringslogikk, men alle faktapåstander og pedagogiske funksjoner skal være etterprøvbare.

---

## 13. Claims, kilder og inspectability

### 13.1 Påstandsregister før publisering

Hvert kapittel skal ha et påstandsregister, for eksempel:

```text
data/fagverk/<subject_id>/claims/<chapter_id>.json
```

Minimumsformat:

```json
{
  "subjectId": "natur",
  "chapterId": "okosystemer",
  "claims": [
    {
      "id": "claim_001",
      "claim": "En presis faktapåstand som brukes i kapittelet.",
      "sourceId": "source_001",
      "sourceLocation": "kapittel, side eller avsnitt",
      "claimType": "documented_fact",
      "status": "verified",
      "verifiedAt": "2026-07-28"
    }
  ]
}
```

Ingen faktapåstand kan publiseres i sammenhengende lærestoff uten at den kan spores til relevant claim og inspectable kilde.

### 13.2 Kilderegister

Faget bør ha ett deduplisert kilderegister:

```text
data/fagverk/<subject_id>/sources.json
```

En kildepost skal minst angi:

- stabil `sourceId`;
- tittel og utgiver;
- URL eller repository path;
- kildetype;
- hvilke kapitler eller claims den brukes til;
- dato for kontroll;
- eventuell tilgangs- eller avgrensningsmerknad.

En generell forside er ikke dokumentasjon for en konkret påstand. Kildelisten skal ikke brukes som pynt eller antallsmål.

### 13.3 Faktakategorier

Påstander skal skilles mellom:

- `documented_fact` - direkte støttet av kilden;
- `source_based_synthesis` - forsiktig syntese av flere dokumenterte fakta;
- `analysis` - faglig analyse som er tydelig skilt fra historisk eller empirisk fakta;
- `uncertain` - skal normalt ikke publiseres som etablert innhold.

### 13.4 Ingen intern selvreferanse som eneste bevis

Følgende kan ikke alene bevise en påstand:

- en annen History GO-tekst;
- en quizforklaring;
- et eksisterende popupfelt;
- en språkmodell;
- en gammel rapport uten inspectable grunnkilde;
- en grønn test eller readiness-score.

---

## 14. To separate reviewporter

Et kapittel kan ikke bli `approved` før begge portene er bestått.

### 14.1 Source review

Source review kontrollerer:

- at hver faktisk bestanddel har et claim;
- at kilden faktisk støtter formuleringen;
- at datoer, tall, navn og årsaksforklaringer ikke strekkes;
- at analysen er skilt fra dokumentert fakta;
- at kildene kan åpnes og inspiseres;
- at usikkerhet og uenighet er dokumentert;
- at avviste påstander ikke er kommet tilbake gjennom omskriving.

Source reviewer skal være en annen kontrollhandling enn selve tekstproduksjonen, også når samme person utfører arbeidet i ulike faser.

### 14.2 Editorial review

Editorial review kontrollerer:

- faglig struktur og progresjon;
- lesbarhet uten å gjøre teksten generisk;
- at eksempler faktisk forklarer teorien;
- at misoppfatninger er reelle og ikke karikerte;
- at oppgaver tester forståelse;
- at kapitlet ikke repeterer emnefilene;
- at faget har egen stemme og metode;
- at stedskoblinger er relevante og ikke filler;
- at UI-seksjonene får nok innhold uten kunstig utfylling.

Source review og editorial review skal ha separate statuser og datoer.

---

## 15. Ferdigkriterier

### 15.1 Et fag er teknisk materialisert når

- canonical fag-ID finnes i kategorikontrakten;
- fagpakken løses gjennom `data/fag/fag_manifest.json`;
- riktig adapter er valgt og validert;
- alle nødvendige source paths finnes;
- normalisert modell passerer invariants;
- fagområder, emner og metoder kan åpnes;
- brukerprogresjon vises fra riktig kilde;
- riktig merkeside og Fagverkforside er tilgjengelig;
- portalregisteret peker til riktig fagsiderute;
- lenker, tilgjengelighet og mobilvisning er kontrollert;
- permanent fagverk-CI er grønn.

### 15.2 Et fag er redaksjonelt komplett når

- fagets nødvendige kapittelplan er eksplisitt godkjent;
- alle canonicale fagområder har tilstrekkelig lærestoff;
- alle nødvendige kapitler er `approved`;
- alle publiserte faktapåstander er claim- og kildebelagt;
- source review og editorial review er bestått;
- relevante metoder, begreper, eksempler og oppgaver er dekket;
- steder brukes som dokumenterte videreinnganger, ikke fyllstoff;
- ingen blokkerende faglige eller kildebaserte hull er skjult;
- fagets statusregister er regenerert og validert.

### 15.3 Et fag er ikke ferdig når

- bare forsiden åpner;
- bare emnelisten vises;
- en adapter bruker stille fallback;
- kapitler mangler claims eller inspectable kilder;
- én pilotdel er god mens resten av faget er uregistrert;
- portalstatus er endret uten fungerende route;
- UI er fullstendig, men faginnholdet er generisk eller kopiert;
- tekniske tester er grønne, men redaksjonell dekning mangler.

---

## 16. Produksjonsrekkefølge

Arbeidet skal utføres i følgende rekkefølge.

### Fase 0 - kontrakt og inventar

- lås dette dokumentet;
- registrer dokumenteierskap;
- mål alle 18 fag mot manifest, portal, adapterbehov og kapittelstatus;
- opprett permanent status- og avviksrapport.

### Fase 1 - generell motor

- bygg felles subject-loader;
- bygg normalisert modell;
- bygg felles sidepresentasjon;
- fjern hardkodet politikkfallback;
- legg inn eksplisitte diagnostics;
- lås route- og lenkekontrakten.

### Fase 2 - fire adapterpiloter

Pilotene skal dekke fire ulike datafamilier:

1. `natur` - standard canonical fagpakke;
2. `religion` - foundation v1;
3. `by` - eldre modulformat;
4. `teknologi` - vitenskapelig utvidet format.

Motoren kan ikke erklæres generell før alle fire virker uten parallelle HTML-systemer.

### Fase 3 - politikkmigrering

- migrer politikk til felles motor;
- behold dagens funksjonalitet og dypkoblinger;
- fjern unødvendig politikkspesifikk presentasjonskode;
- bruk eksisterende politikktester som regresjonsvern.

### Fase 4 - strukturell materialisering av alle fag

Materialiser ett eller en liten kompatibel gruppe fag per PR. Oppdater portalen først når hvert fag har bestått den tekniske porten.

### Fase 5 - redaksjonell ferdigstilling

Arbeid ett fag av gangen:

```text
kapittelplan
  -> kilder og claims
  -> tekst og pedagogiske lag
  -> source review
  -> editorial review
  -> fagområdedekning
  -> statusoppdatering
```

Ikke produser ett tilfeldig kapittel i alle fag samtidig. Ett fag skal få en målbar, sammenhengende progresjon mot ferdigstatus.

---

## 17. Fagmatrise

Dette er den bindende startmatrisen. Antall og innhold skal måles fra source-data av validatoren; tabellen bestemmer adapterfamilie og produksjonsrekkefølge, ikke permanente hardkodede tellinger.

| Fag | Adapterfamilie | Teknisk startstatus | Redaksjonell startstatus | Første handling |
|---|---|---|---|---|
| `by` | `by_module` | `planned` | `not_started` | Pilotadapter og modulnormalisering. |
| `historie` | `standard_canonical` | `planned` | `not_started` | Materialiser etter pilotene; behold universell V5-modell. |
| `kunst` | `standard_canonical` | `planned` | `not_started` | Materialiser struktur og lag kapittelplan. |
| `litteratur` | `standard_canonical` | `planned` | `not_started` | Materialiser struktur og lag kapittelplan. |
| `media` | `standard_canonical` | `planned` | `not_started` | Bevar populærkultur som mediefaglig delfelt. |
| `musikk` | `standard_canonical` | `planned` | `not_started` | Materialiser struktur og metodevisning. |
| `naeringsliv` | `standard_canonical_extended` | `planned` | `not_started` | Bevar universitets- og handelshøgskoleutvidelser. |
| `natur` | `standard_canonical` | `planned` | `not_started` | Første standardpilot. |
| `politikk` | `politics_transition` | `materialized` | `in_progress` | Migrer til felles motor uten regresjon. |
| `psykologi` | `standard_canonical` | `planned` | `not_started` | Materialiser struktur og lag kapittelplan. |
| `religion` | `foundation_v1` | `planned` | `not_started` | Første foundation-pilot. |
| `scenekunst` | `foundation_v1` | `planned` | `not_started` | Materialiser etter religionadapteren. |
| `sport` | `standard_canonical` | `planned` | `not_started` | Materialiser med Knowledge-grensen bevart. |
| `subkultur` | `standard_canonical` | `planned` | `not_started` | Materialiser struktur og stedskoblinger. |
| `vitenskap` | `standard_canonical` | `planned` | `not_started` | Materialiser struktur og metodevisning. |
| `teknologi` | `scientific_extended` | `planned` | `not_started` | Første vitenskapelig utvidede pilot. |
| `filosofi` | `foundation_v1` | `planned` | `not_started` | Materialiser etter foundation-piloten. |
| `film_tv` | `standard_canonical` | `planned` | `not_started` | Materialiser som eget fag, adskilt fra media. |

Portalens eksisterende status er navigasjonsstatus. Politikk er per startdato eneste materialiserte fagside; de andre fagene skal ikke få klikkbar fagsidelenke før den tekniske porten er bestått.

---

## 18. PR-grenser

### 18.1 Motor-PR

En motor-PR kan endre:

- generell loader og modell;
- felles fagsidepresentasjon;
- adaptergrensesnitt;
- diagnostics;
- generelle schemas, audits og tester;
- dokumentasjon som beskriver den implementerte motoren.

Den skal ikke samtidig skrive store lærekapitler i flere fag.

### 18.2 Adapter-PR

En adapter-PR skal normalt gjelde én adapterfamilie eller én pilot. Den skal dokumentere:

- hvilke source schemas som ble lest;
- hvilke felt som ble normalisert;
- hvilke felt som ble bevart som utvidelser;
- hvilke mangler som blokkerer materialisering;
- at ingen source-of-truth-data ble kopiert inn i adapteren.

### 18.3 Materialiserings-PR

En materialiserings-PR skal gjelde ett fag eller en liten gruppe med samme ferdige adapter. Den skal inneholde:

- portaloppdatering;
- route- og dypkoblingskontroll;
- riktig merkesidelenke;
- progresjonskontroll;
- statusoppdatering;
- skjerm- og mobilkontroll;
- permanente tester.

### 18.4 Kapittel-PR

En kapittel-PR skal normalt gjelde ett kapittel eller én sammenhengende kapittelgruppe i ett fag. Den skal inneholde:

- kapitteldata;
- claims;
- kilder;
- source review;
- editorial review;
- relevante ID-koblinger;
- avviste eller blokkerte påstander;
- målbar endring i fagets redaksjonelle dekning.

### 18.5 Forbudte PR-er

- alle 18 fag i én uoversiktlig runtime- og innholds-PR;
- dokumentasjon, motor, adaptere og full kapittelproduksjon samtidig;
- portalstatus uten route og test;
- kapitler uten claims;
- automatiske massekapitler uten faglig og kildebasert review;
- lokale hotfixer som oppretter parallelle sannhetskilder.

---

## 19. Permanente kvalitetsporter

Fagverk-workflowen skal etter hvert håndheve minst følgende porter.

### 19.1 Kategoriparitet

- nøyaktig alle canonicale `fagSubjects` finnes i statusregisteret;
- ingen legacy-aliaser opptrer som nye fag;
- rekkefølgen følger kategorikontrakten.

### 19.2 Manifestintegritet

- hvert fag har en manifestpost;
- alle deklarerte source paths finnes;
- `subject_id` stemmer;
- adapterfamilien er eksplisitt;
- ingen adapter bruker skjult fallback.

### 19.3 Modellintegritet

- unike fagområde- og emne-ID-er;
- gyldige emne- og metodereferanser;
- mappinger peker til eksisterende objekter;
- tellinger beregnes fra source og er konsistente;
- diagnostics er tomme eller eksplisitt akseptert som blocking issue.

### 19.4 Route- og portalintegritet

- merkeside og fagside er forskjellige mål;
- `subjectPage` finnes før status blir materialized;
- alle statiske og genererte lenker løser;
- Fagverkforsiden sender aldri til et ukjent fag;
- dypkoblinger til fagområde, emne, kapittel og sted bevares.

### 19.5 Kapittel- og kildeintegritet

- kapitlet har nødvendige pedagogiske felt;
- alle factual claims er registrert;
- alle kilde-ID-er løser;
- alle kilder er inspectable eller eksplisitt repository-bundne;
- source review og editorial review er separate;
- `approved` kan ikke settes når en port mangler;
- `complete` kan ikke settes når nødvendig fagområdedekning mangler.

### 19.6 Dokumentasjonsintegritet

- dette dokumentet er registrert som canonical eier;
- `FAGVERK_NAVIGATION.md` eier bare navigasjon og sideroller;
- `FAGVERK.md` er operativ politikkimplementasjon;
- `FAGVERK_PLACE_DESIGN.md` eier bare stedssidedesign;
- dokumentasjonsinngangene peker hit;
- ingen duplicate ownership finnes i dokumentasjonsregisteret.

### 19.7 Regresjonsvern

Politikksidens eksisterende funksjoner skal være regresjonsgrunnlag til felles motor er ferdig. Etter migrering skal de generelle testene erstatte politikkspesifikke duplikater, men ikke før funksjonsparitet er dokumentert.

---

## 20. Stoppregler

Arbeidet skal stoppes og status settes til `blocked` når:

- fagpakken ikke kan løses entydig fra manifestet;
- source schemas motsier hverandre;
- et nødvendig fagområde mangler canonical identitet;
- kapittelclaims ikke kan kildebelegges;
- kildene er utilgjengelige eller uenige på en måte som påvirker publisert innhold;
- materialisering krever kopiering eller ny parallell fagmodell;
- progresjon ikke kan leses uten å endre eide storage-kontrakter;
- et fag ikke kan skilles tydelig fra merkesiden;
- testene bare kan gjøres grønne ved å svekke en canonical regel.

En blokkering skal beskrive årsak, berørte filer, hva som er forsøkt og hva som kreves for å fortsette. Den skal ikke skjules som `planned` eller omgås med generisk fallbackinnhold.

---

## 21. Nåstatus og neste bindende byggesteg

Ved kontraktens startpunkt gjelder:

- Fagverkforsiden og skillet mellom merkeside og fagside er materialisert;
- politikk har en fungerende fagside og er referanseimplementasjon;
- portalregisteret markerer de andre fagene som planlagt;
- alle fag har aktive eller deklarerte fagpakker i fagmanifestet;
- dataformatene krever minst fire reelle adapterfamilier;
- politikk har bare delvis redaksjonell kapitteldekning og er ikke komplett som samlet læreverk.

Neste bindende implementasjonssteg er:

> **Bygg den generelle fagsidemotoren, statusregisteret og permanent all-subject audit, og valider motoren med pilotene Natur, Religion, By og Teknologi før flere fagsider markeres som materialisert.**

Første motor-PR skal ikke samtidig erklære alle fag ferdige. Den skal bevise at én motor kan lese de fire ulike datamodellene uten kopiering, stille fallback eller tap av fagspesifikk dybde.
