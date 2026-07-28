# History GO - kontrakt for bygging og ferdigstilling av alle fagsider

Status: **canonical og bindende fagsidekontrakt v1**
Eier: `fagverk_subject_page_contract`
Gjelder: alle canonicale fag i `data/categories/category_contract.json`
Sist kontrollert: **2026-07-28**

Dette dokumentet er den eneste bindende produksjonskontrakten for hvordan History GO skal bygge, materialisere, kvalitetssikre og ferdigstille fagsidene i Fagverket.

Det oppretter ikke en ny fagmodell. Det bestemmer hvordan eksisterende canonicale fagdata skal vises som èn sammenhengende, kildebelagt og etterprøvbar læringsflate.

---

## 1. Bindende hovedbeslutning

History GO skal ha:

> **��n generell fagsidemotor, én canonical fagpakke per fag og én offentlig fagsiderute per fag.**

Fagsidene skal æpnes gjennom samme side og samme runtimekontrakt:

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

Det er forbudt tå løse oppgaven ved å:

- kopiere `fagverk.html` til én HTML-fil per fag;
- kopiere politikkens canonicale fagdata inn i andre fag;
- opprette parallelle emne-, fagkart-, metode- eller pensumregistre for fagsiden;
- markere en side som ferdig fordi URL-en æpner eller schemaet passerer;
- fylle kapitler, eksempler, steder eller kilder for å oppneå kunstig completeness.

Politikk er referanseimplementasjonen, ikke malen som skal kopieres uendret til alle fag.

---

## 2. Hva denne kontrakten eier

Denne kontrakten eier:

- målarkitekturen for den generelle fagsidemotoren;
- normalisert runtime-modell for alle fag;
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

Disse ansvarsomådene eies av kildene i autoritetskartet nedenfor.

---

## 3. Begreper og sideroller

| Begrep | Bindende betydning |
|---|---|
| **Fagverkforsiden** | Felles inngang til alle fag og merker: `fagverk-forside.html`. |
| **Merkeside** | Spill- og progresjonsside for badge, poeng, nivåer, undermerker, quiz og steder. |
| **Fagside** | Læreside for fagstruktur, fagomåder, emner, metoder og lærekapitler. |
| **Fagomådeside** | Dynamisk visning av ett canonicalt domene/fagomåde innen faget. |
| **Emneside** | Dynamisk visning av ett canonicalt `emne_id`. |
| **Lærekapittel** | Sammenhengende, redigert og kildebelagt tekst som forklarer deler av faget. |
| **Stedets fagverkside** | Selvstendig side for ett konkret sted: `fagverk-sted.html?place=<place_id>`. |
| **Materialisert** | Offentlig rute, dataflyt og navigasjon fungerer og er validert. |
| **Redaksjonelt ferdig** | Hele fagets nødvendige lærestoff har beståt claim-, kilde-, fag- og redaksjonsportene. |

Merkesiden og fagsiden skal alltid ha forskjellige adresser og tydelige navn. Detaljert siderollekontrakt ligger i [`FAGVERK_NAVIGATION.md`](./FAGVERK_NAVIGATION.md).

---

## 4. Autoritetskart og obligatorisk leserekkefølge

Ved arbeid på fagsider skal dokumentene leses i denne rekkefølgen. Hvert dokument eier bare det ansvarsområdet som er oppgitt.

| Rekkefølge | Kilde | Eier |
|---:|---|---|
| 1 | [`documentation_registry.json`](./documentation_registry.json) | Dokumentstatus, eierskap og prioritet. |
| 2 | [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) | Faktisitet, inspectable kilder, usikkerhet og forbud mot gjetting. |
| 3 | [`HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](./HISTORY_GO_TECHNICAL_ARCHITECTURE.md) | Målarkitektur, språk- og plattformeierskap. |
| 4 | [`DOMAIN_CONTRACT.md` ](./DOMAIN_CONTRACT.md) og [``../data/categories/category_contract.json`](../data/categories/category_contract.json) | Canonicale fag-ID-er, rekkefølge, navn og kategoribeslutninger. |
| 5 | [`SUBJECT_FILE_CONTRACT.md`](./SUBJECT_FILE_CONTRACT.md) | Én universell fagmodell per fag og separate geografiske produksjonslag. |
| 6 | [``../README/README.pensum.md` ](../README/README.pensum.md) | Forholdet mellom merke, fagkart, emner, quiz, Knowledge og progresjon. |
| 7 | [``../README/fagstrukturREADME.md`](../README/fagstrukturREADME.md) | Operativ guide til fagpakkens lag og manifest-resolverte filer. |
| 8 | [`FAGVERK_NAVIGATION.md`](./FAGVERK_NAVIGATION.md) | Navigasjon, sideroller og portalregler. |
| 9 | **Dette dokumentet** | Bygging, status, kvalitet og ferdigstilling av alle fagsider. |
| 10 | [`FAGVERK.md` ](./FAGVERK.n^md) | Operativ beskrivelse av dagens politikkimplementasjon og eksisterende runtime. |
| 11 | [`DATA_PRODUCTION_CONTRACT.md`](./DATA_PRODUCTION_CONTRACT.md) | Generelle regler for canonical data, manifester, kildeverifikasjon og CI. |
| 12 | [`KNOWLEDGE_ARCHITECTURE.md` ](./KNOWLEDGE_ARCHITECTURE.md) | Knowledge-eierskap, storage og grensen mot fagstruktur og progresjon. |
| 13 | [`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md) | Eneste bindende produksjonsprosedyre for quiz. |
| 14 | [``../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json`](../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json) | Globale quiz-invariants og kategori-profiler. |
| 15 | [`PLACE_PRODUCTION_CHECKLIST.md` ](./PLACE_PRODUCTION_CHECKLIST.md) og [`PLACE_STANDARD.md`](./PLACE_STANDARD.md) | Produksjon og ferdigstilling av konkrete steder. |
| 16 | [`FAGVERK_PLACE_DESIGN.md` ](./FAGVERK_PLACE_DESIGN.md) | Kategoridesign og bildekrav for stedets fagverkside, ikke den generelle fagsiden. |
| 17 | [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) | Overordnet produktbetydning av ferdig-, fullført- og mestringsnivåer. |
| 18 | [`HISTORY_GO_PRODUCT_MAP.md`](./HISTORY_GO_PRODUCT_MAP.md) | Produktprioritet og samlet ferdigstillelseskontekst. |
| 19 | [`TYPESCRIPT_FIRST_POLICY.md` ](./TYPESCRIPT_FIRST_POLICY.md) | Språkpolicy for ny og vesentlig endret runtime/tooling. |
| 20 | [`../README/TEAM_WORKFLOW.md`](../README/TEAM_WORKFLOW.md) | Branch-, PR-, review-, kontroll- og mergeflyt. |

### Konfliktregel

Ved konflikt gjelder:

1. `FACTUALITY_CONTRACT.md` for fakta og kilder;
2. `category_contract.json` for fag-ID-er og kategorier;
2. `SUBJECT_FILE_CONTRACT.md` for universell fagdataarkitektur;
4. dette dokumentet for fagsideproduksjon og ferdigstatus;
5. `FAGVERK_NAVIGATION.md` for navigasjon og sideroller;
6. runtime source-data, manifester, loadere og validering for faktisk implementert dataflyt.

En operativ guide kan aldri overstyre en canonical kontrakt. Dokumentasjonen skal korrigeres dersom den avviker fra gyldig canonical source-data og validering.

---

## 5. Maskinelle sannhetpkilder

|` | |
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

Fagverkregisteret og fagsiden skal referere til canonicale emne-, metode- og fagomåde-ID-er. De skal ikke kopiere hele fagdefinisjoner for å lage en parallell sannhet.

---

## 6. Målarkitektur

```text
category_contract.json
          │
          ✶
   fag_manifest.json
          │
          ├──������մ(�����������Rs�R�R�V��W �)��)))�٘Y��\��8�'8� 8� > methods
          │                     │
          │                    ✶
          │           generell fagmodell + adapter
          │                    ✜
          │         fagverk.html?subject=<id>
          │          ✜              │
          │          │                  └8� �8�'8� 8�h8�h> lærekapitler
          │          │                  │
          │          │                  └8� �8�'8� 8�h8�h> emnesider
          ✜─①①����������ͥ���(���������������������R(���������������������R�(�����������ѕ���́��������ٕɭͥ���)���()�������ɕ������ѽɕ��ͭ������������()���ѕ��)�̽���ٕɬ��Չ���е��������)�̽���ٕɬ��Չ���е�������)���()����ȁQ���M�ɥ�е��٥م���ѕȁ������������QeAMI%AQ}%IMQ}A=1%d�����()�����ͥ����������ѕɔ����������̰��������ͭ�����ɔ��ٕ�͕�є���������������Ёѥ��������ɵ���͕�є�������������ͭ�����������������ȁ�؁�����������и((���((���ܸ�9�ɵ���͕�Ё�չѥ���������()��������ѕɔ�ͭ����ɽ��͕ɔ�ͅ����͕���ѥͭ���������()�����)�(���Չ������(�������(����ѥѱ��(������͍ɥ�ѥ���(���������(����(����������mt�(���������mt�(����ѡ����mt�(�����������mt�(������ѕ���mt�(���������mt�(���ɽ�ɕ������(��ͽ�ɍ���������(���������ѥ���mt)�)���((����=�����ѽɥͭ����مɥ����((����Չ���й�����ȁ�����������������MՉ����̀�%�(�������������}�����ȁչ��������������и(�����������}�����ȁչ�������ѥ���ɕȁɥ�ѥ������(����������ɕ��Ʌ�͕ȁ�Ʉ�������ȁ�������ѱ�ȁ��͕ȁѥ����ͥ�ѕɕ��������ȸ(��������ѽ��ɕ��Ʌ�͕ȁ��͕ȁѥ���������������ѽ��ȸ(��U����є�����ȁ��������������ȁ��ȁ������ͥ�Ё������������ѥ��������ѥ�����������(��Ё�����ѕ����ѕɥ���͕�є�����ѱ�ȁͭ�������ͅ�Ё�չ���٥͔��������������խ��ȁ��ȁ����ѕɕ���ȁم����(��	�խ���ɽ�ɕͩ���ͭ�����͕́�Ʉ�������ɽ�ɕͩ��ͭ�����쁑���ͭ��������ͭɥٕ́�����������ф�((���((���ก���ѕə�������()�������ɕ������ѽɕ��ͭ�������є���ɔ���ٕ��������ȁ�������ѥ�����́�ٕɝ����((������Mх���ɐ�������������������()�����ȁ���������������еɕͽ�ٕ�є������յ��������ɀ���������р�������ѡ��̀����ɵ��Ё�иԵ��ɵ�и((�������չ��ѥ�����()�����ȁ����ɔ����ѥٔ���չ������ȁͽ��ɕ��������͍����չ�Ё�������ͽ����5���ɔ���х��������ȁѥ��������Ʌ�������U$�ɕ���ȁ�ȁ�����ѥ����и((������	䵵��ձ��ɵ��()	䁡�ȁ���ɔ����̴����ձ���խ��ȸ����ѕɕ��ͭ�����ɵ���͕ɔ����ձ�Ȱ����������Ȱ����͕�ѕȰ��ѕ��ȁ�������Ʌ���ѕ�������ɔ����ձ������ѥ�������չ�ٕ�͕�������������((������Y�ѕ�ͭ���������٥��Ё��ɵ��()Q�����������ȁ͍���ѥ���������������ѡ݅䵑�ф������٥��Ё�������͵����������ѕɕ��ͭ�����مɔ���������Ʉ��剑�������������ɵ���͕�є�ѥ�����͙��а����������������������!Q50�ͥ���((������A���ѥ���ٕɝ���()A���ѥ����́��ͥ�ѕɕ�����չѥ����ȁɕ��Ʌ�͔����ɕ�ɕͩ��͝�չ���������ͭ������ɕɕ́ѥ����������ɕ������ѽɕ���ѕ�������є�((���ɕ�ѕ������������������������(����́������(���ɽ�ɕͩ���(��չ��ɉ�����M������������������(�������ѕ�����������������������(���ѕ�ͭ��ѕ����(����ͥ�ѕɕ������ɕ����ѱ�ȸ((���((���丁=�����ѽɥͬ����ͥ�����խ���()����ѕɥ���͕�Ё���ͥ���ͭ�������Ё���((ĸ���������ѥѕШ�(�������ٸ����ɭ����������ͭɥٕ�͔�(������呕����������ѥ��ɥ�ѥ����ɭ�ͥ���(������呕����������ѥ������ѥ����ٕɭ���ͥ����((���
