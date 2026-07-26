# History GO — people-popup-system

Status: **canonical**  
Eier: `people_popup_presentation_contract`  
Runtime: `js/ui/person-popup-v2.js`  
Design: `css/person-popup-v2.css`  
Sist kontrollert: **2026-07-26**

Dette dokumentet definerer hvordan den rike people-popupen skal bygges. Popupen skal være en informativ personprofil, ikke en stor quizflate og ikke en samling tomme bokser.

## 1. Rolle

People-popupen er fordypningsflaten for en person som er oppdaget gjennom et sted, en relasjon, en fortelling, et verk eller et søk.

Den skal:

- forklare hvem personen er og hvorfor vedkommende er relevant;
- vise `popupDesc` som hovedtekst og `desc` som kort ingress;
- samle rolle, livsdata, virke, utdanning, materialer eller arbeidsfelt;
- vise faktiske verk og bidrag;
- vise steder, relasjoner, fortellinger, kunnskap og kilder når de finnes;
- bruke ett kontrollert portrett med en god initialfallback;
- skjule tomme seksjoner fullstendig;
- holde quiz som en liten sekundær handling;
- ha tydelig margin mot skjermkanten på mobil, iPad og desktop.

Canonical persondata ligger fortsatt i de manifest-lastede filene under `data/people/**`. Popupen er en presentasjon av disse dataene og oppretter ingen parallell personidentitet.

## 2. Informasjonsrekkefølge

1. **Header** — kategori, navn og rolle.
2. **Hero** — portrett eller initialfallback, kort ingress og nøkkelfakta.
3. **Kompakte handlinger** — quiz bare når personen faktisk har quiz, samtale og notat.
4. **Om personen** — hele `popupDesc`, avsnittsbevart.
5. **Verk og bidrag** — bare når konkrete verk finnes.
6. **Fagprofil** — utdanning, materialer og relevante temaer.
7. **Steder** — canonical steder personen er koblet til.
8. **Tilknytninger** — kuraterte relations.
9. **Fortellinger og kunnskap** — eksisterende History GO-systemer.
10. **Kilder og videre lesning** — verifiserte lenker.
11. **Observasjoner** — bare når brukeren faktisk har registrert observasjoner.

## 3. Presentasjonsregler

1. Popupen skal ikke ligge helt ut til skjermkanten.
2. Det skal være én intern vertikal scrollflate.
3. Lukkeknappen skal være tilgjengelig uten scrolling.
4. Quizknappen skal aldri være en fullbredde gul blokk i people-popupen.
5. Manglende quiz skal fjerne quizknappen, ikke gi en blind handling.
6. Manglende bilde skal gi initialer og navn, aldri et ødelagt bildeikon.
7. `image`, `portrait`, `portraitImage`, `imageCard`, `cardImage`, `photo` og `frontImage` kan prøves som bildekandidater i denne rekkefølgen.
8. `popupDesc` skal prioriteres foran eldre `wiki` og `description`.
9. Tomme verk-, sted-, relasjons-, kilde- eller observasjonsseksjoner skal ikke vises.
10. Interne ID-er, auditstatus og researchgjeld skal ikke vises som brukerinnhold.

## 4. Anbefalte personfelt

```json
{
  "id": "kjersti_wexelsen_goksoyr",
  "name": "Kjersti Wexelsen Goksøyr",
  "initials": "KWG",
  "category": "kunst",
  "kindLabel": "Billedhugger / offentlig kunst",
  "desc": "Kort ingress.",
  "popupDesc": "Lengre, avsnittsdelt personartikkel.",
  "birth_date": "1945-12-15",
  "birth_place": "Oslo",
  "active_place": "Nittedal",
  "occupation": "Billedhugger",
  "education": [],
  "materials": [],
  "works": [],
  "places": [],
  "tags": [],
  "externalLinks": [],
  "source_urls": []
}
```

Feltlisten er en anbefalt presentasjonskontrakt, ikke et krav om at alle eksisterende personer må migreres samtidig.

## 5. Feltsemantikk

### `desc`

Kort ingress på én til tre setninger. Den skal raskt svare på hvem personen er og hvilken kobling som gjør vedkommende relevant i History GO.

### `popupDesc`

Hovedartikkel med biografi, virke, betydning og stedskobling. Den skal ikke være en gjentakelse av `desc`.

### Livsdata

Foretrukne felt er `birth_date`, `death_date`, `birth_place` og eventuelt `active_place`. ISO-dato brukes når full dato er kjent. År alene er tillatt når kilden bare støtter år.

### `works`

Kan være en liste med strenger eller objekter. Objekter kan bruke `title`, `year`, `material`, `place`, `summary` og `id`. Bare reelle verk, verv, oppfinnelser, publikasjoner eller dokumenterte bidrag skal føres her.

### `education`

Kort liste over dokumentert utdanning, læresteder eller faglig skolering. Ikke bruk generiske kompetanseord som er utledet fra yrkestittelen.

### `materials`

For kunstnere og håndverkere: faktiske materialer eller medier. For andre persontyper kan tilsvarende arbeidsfelt ligge i `themes` eller `tags`.

### `externalLinks` og `source_urls`

Kilde- og videre-lesningslenker. `externalLinks` bør ha tydelig `label`, `url`, `type` og ved behov `verifiedAt`.

## 6. Ulike persontyper

### Kunstner, arkitekt og designer

Prioriter kunstnerrolle, materialer, utdanning, verk, offentlige oppdrag, stil, teknikk, institusjoner og steder der verk kan observeres.

### Forfatter, dramatiker og journalist

Prioriter sjanger, verk, publikasjoner, redaksjoner, teatre, bosteder, arbeidssteder, litterære miljøer og historiske hendelser knyttet til tekstene.

### Politiker og samfunnsaktør

Prioriter verv, perioder, partier eller organisasjoner, beslutninger, institusjoner, konflikter, reformer, taler og steder der handlingene fant sted.

### Forsker, oppfinner og fagperson

Prioriter fagfelt, utdanning, institusjoner, teorier, oppdagelser, publikasjoner, metoder, instrumenter og steder for forskning eller formidling.

### Musiker, komponist og scenekunstner

Prioriter instrument eller rolle, ensembler, verk, produksjoner, scener, innspillinger, perioder og kunstneriske samarbeid.

### Idrettsutøver og trener

Prioriter gren, lag, konkurranser, medaljer, rekorder, perioder, trenere, anlegg og avgjørende hendelser.

### Næringslivsperson og institusjonsbygger

Prioriter virksomheter, roller, innovasjoner, produkter, arbeidsliv, bygg, fabrikker, markeder og organisatoriske milepæler.

### Ikon, institusjonsbærer og kontekstperson

`kind` beskriver personens spillrolle, ikke vedkommendes yrke. Popupen skal fortsatt vise den konkrete rollen og hvorfor personen er med. En kontekstperson skal ikke få kunstige verk eller en overdrevet helteprofil.

## 7. Handlinger

Quiz, samtale og notat ligger i en kompakt handlingsrad i hero-området.

- Quiz vises bare når `QuizEngine` finner innhold for personen.
- Quizstatus kan endre teksten til «Fortsett quiz» eller «Ta quiz igjen».
- Samtale og notat beholder de eksisterende `data-chat-person`- og `data-note-person`-kontraktene.
- Handlingene skal ikke skyve biografi og verk nedover siden.

## 8. Kjersti Wexelsen Goksøyr som pilot

Kjersti Wexelsen Goksøyr demonstrerer en kunstnerprofil uten registrert portrett:

- initialfallback i stedet for ødelagt bilde;
- fødselsdato og fødested;
- billedhuggerrolle og virkested;
- utdanning ved Statens håndverks- og kunstindustriskole og Statens kunstakademi;
- materialer som stein, tre, metall og bronse;
- Sigrid Undset-monumentet og andre offentlige verk;
- Stensparken som klikkbart canonical sted;
- kilder fra Store norske leksikon, Norsk kunstnerleksikon, kunstnerens nettsted og Oslo byleksikon.

Piloten skal ikke bli en personspesial i runtime-koden. Alle feltene er generiske og kan brukes av andre personer.

## 9. QA

Ved endringer i people-popupen:

1. kjør `node --check js/ui/person-popup-v2.js`;
2. kjør regresjonstestene for people-popupen;
3. kontroller en person med bilde og en person uten bilde;
4. kontroller en person med verk og en person uten verk;
5. kontroller at person uten quiz ikke får quizknapp;
6. kontroller at popupen har margin på mobil og iPad;
7. kontroller at steder åpner canonical stedspopup;
8. kjør people-data-, dokumentasjons- og web-build-kontrollene når relevante filer endres.

## 10. Eierskap

- `docs/PEOPLE_POPUP_SYSTEM.md` eier presentasjonskontrakten.
- people JSON eier personens faktiske innhold.
- `js/ui/person-popup-v2.js` eier runtime-renderingen.
- `css/person-popup-v2.css` eier utformingen.
- `js/ui/popup-utils.js` eier den generelle popupmotoren og legacy-fallbacken.
- people-image-kontrakten eier kilde-, lisens- og attribusjonsreglene for portretter.
