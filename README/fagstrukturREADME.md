# History GO — operativ guide til fagstruktur

Status: **operational**
Sist kontrollert: **2026-07-26**

Dette dokumentet forklarer hvordan aktive fagpakker henger sammen. Det er ikke en selvstendig fagkontrakt og oppretter ikke nye datalag.

## Autoritetsrekkefølge

1. [`../docs/SUBJECT_FILE_CONTRACT.md`](../docs/SUBJECT_FILE_CONTRACT.md) eier den bindende arkitekturen: én universell fagmodell per fag og separate geografiske produksjonslag.
2. [`../docs/FAGVERK.md`](../docs/FAGVERK.md) eier heldekningsregelen, produksjonsrekkefølgen og ferdigkravene uten redaksjonelle tallkvoter.
3. [`README.pensum.md`](./README.pensum.md) eier den canonical kunnskaps- og pensumarkitekturen.
4. [`../data/fag/fag_manifest.json`](../data/fag/fag_manifest.json) eier hvilke filer som er aktive for hvert `subjectId`.
5. De manifest-resolverte JSON-filene eier det faktiske faginnholdet.
6. Quizproduksjon styres av [`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md) og de maskinlesbare quizkontraktene.

Ved konflikt skal denne guiden korrigeres. Den kan ikke overstyre kontrakt, manifest, schema, runtime eller validator.

## Aktiv fagpakke

`data/fag/fag_manifest.json` peker per fag til en pakke som normalt består av:

```text
pensum
emner
fagkart
methods
supersetQuizMal
quizStandard
quizQuestionSchema
```

Noen fag har i tillegg versjons-, coverage-, quality- eller quizproduksjonskontrakter. Manifestet er resolveren; filnavn skal ikke gjettes eller kopieres fra eldre README-er.

## Lagene

### 1. Fagkart

Fagkartet beskriver fagets struktur, kategorier, begreper, teorier, konflikter, spørsmål og faglige koblinger.

Fagkartet skal:

- bruke stabile canonical ID-er;
- være gjenbrukbart på tvers av geografier;
- gi emner, quiz og geografiske produksjonslag en felles referanseramme;
- ikke inneholde brukerens progresjon eller læringshistorikk.

Eldre fagfiler kan fortsatt inneholde geografisk profilblanding, for eksempel lokalt `scope` eller anbefalte cases. Det er compatibility-gjeld, ikke presedens for komplette land-, region- eller bykopier.

### 2. Emner

Emner er konkrete faglige kunnskapsenheter. De kan bære blant annet:

- `emne_id`;
- `subject_id`;
- beskrivelser;
- concepts og nøkkelbegreper;
- dimensjoner og relasjoner;
- koblinger til teorier og metoder.

Emner er fagdata. De er ikke quizresultater, besøkslogg eller personlig Knowledge.

### 3. Pensum

Pensum grupperer emner i moduler, rekkefølge og progresjonskrav. Pensum skal referere til emner fremfor å kopiere dem og skal ikke endres når en bruker lærer noe.

### 4. Metoder

Metodefila beskriver hvordan faget undersøker, vurderer eller produserer kunnskap. Metoder skal ha faglig mening og kunne refereres fra emner, quiz og andre produksjonslag.

### 5. Superset-quizmal

Superset-malen er en faglig spørsmåls- og variasjonsflate. Den erstatter ikke quizproduksjonskontrakten, schemas eller target-bundne quizsett.

### 6. Quiz og vurdering

Quiz bruker fagpakken, men skal ikke eie faglogikken. En quiz kan koble spørsmål til fag, emner, concepts og et konkret target og kan produsere Knowledge og progresjonsevidens etter de aktive kontraktene.

### 7. Geografiske produksjonslag

Land, regioner, byer og steder skal realisere faget gjennom:

- profiler og mappings;
- lokale cases og dokumenterte claims;
- kilder;
- steder og personer;
- target-bundet quizinnhold.

De skal referere til canonical fag-ID-er, ikke opprette komplette parallelle fagpakker.

## To separate dekningsmål

### Universell fagdekning

Måler om faget dekker nødvendige områder, emner, begreper, teorier og metoder.

Dekningen skal bygges fra et dokumentert faglig kandidatgrunnlag og avsluttes med gap-, overlapps-, fyllstoff- og utelatelsesaudit. Det finnes ikke et felles riktig antall områder, emner, kapitler, moduler eller andre innholdsenheter. Tallene er inventar; den faglige begrunnelsen og den faktiske dekningen avgjør status.

### Geografisk produksjonsdekning

Måler om en geografi har tilstrekkelige cases, kilder, claims, steder, personer og quizer til å realisere fagmodellen.

Mange lokale cases beviser ikke at fagmodellen er heldekkende. Manglende lokalt innhold skal heller ikke løses ved å kopiere hele fagpakken.

## By-faget som eksempel

Aktive filer skal leses fra `data/fag/fag_manifest.json`. På kontrolltidspunktet peker `by` blant annet til:

```text
data/fag/by/pensum_by.json
data/fag/by/emner_by.json
data/fag/by/fagkart_by.json
data/fag/by/methods_by.json
data/fag/by/supersetQUIZMAL_by.json
```

Den eldre kombinerte teksten i `README/byFagplan.md` er erstattet av en compatibility-pointer. Pre-consolidation-teksten er arkivert og eier ingen aktiv fagregel.

## Praktisk endringsregel

Når fagdata endres:

1. finn aktive paths i `data/fag/fag_manifest.json`;
2. fastslå hvilket relevant faglig spørsmål endringen dekker, og kontroller duplikater og nabofag;
3. endre riktig fagfil, ikke denne guiden som erstatning for data;
4. oppdater mappings, quizproduksjon og rapporter som faktisk avhenger av endringen;
5. rapporter faktiske antall uten å behandle dem som målkvoter;
6. kjør relevante schemas, heldekningsaudits og tester;
7. oppdater dokumentasjonen bare når ansvar, struktur eller arbeidsmåte er endret.

> Ett ansvar per lag. Fagdata i fagpakken, geografisk realisering i produksjonslagene og brukerstatus i runtime-eide stores.
