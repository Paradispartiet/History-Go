# History GO — people-popup-system

Status: **operational**  
Runtime: `js/ui/person-popup-v2.js`  
Design: `css/person-popup-v2.css`  
Test: `tests/person-popup-v2.test.js`  
Sist kontrollert: **2026-07-26**

Dette dokumentet beskriver den rike people-popupen. Popupen skal være en informativ personprofil, ikke en stor quizflate og ikke en samling tomme bokser.

## 1. Rolle

People-popupen er fordypningsflaten for en person som åpnes fra et sted, en relasjon, en fortelling, et verk eller et søk.

Den skal:

- forklare hvem personen er og hvorfor personen er relevant;
- vise `popupDesc` som hovedtekst og `desc` som kort ingress;
- samle rolle, livsdata, virke, verk, fagprofil og steder når slike data finnes;
- gjenbruke canonical places, relations, stories, knowledge og observations;
- bruke ett kontrollert portrett med initialfallback;
- skjule tomme seksjoner fullstendig;
- holde quiz som en liten sekundær handling;
- ha tydelig margin mot skjermkanten på mobil, iPad og desktop.

Canonical persondata ligger i de manifest-lastede filene under `data/people/**`. Popupen presenterer disse dataene og skal ikke dikte opp manglende verk, biografi eller bilder.

## 2. Informasjonsrekkefølge

1. **Header** — kategori, navn og rolle.
2. **Hero** — portrett eller initialfallback, kort ingress og nøkkelfakta.
3. **Kompakte handlinger** — quiz bare når personen faktisk har quiz, samtale og notat.
4. **Om personen** — hele `popupDesc`, avsnittsbevart.
5. **Verk og bidrag** — bare når konkrete verk finnes.
6. **Fagprofil** — utdanning, materialer og temaer når feltene finnes.
7. **Steder** — canonical steder personen er koblet til.
8. **Tilknytninger** — kuraterte relations.
9. **Fortellinger og kunnskap** — eksisterende History GO-systemer.
10. **Kilder og videre lesning** — kildefelter fra persondata.
11. **Observasjoner** — bare når brukeren faktisk har registrert observasjoner.

## 3. Faste designregler

1. Popupen skal ikke ligge helt ut til skjermkanten.
2. Det skal være én intern vertikal scrollflate.
3. Lukkeknappen skal være tilgjengelig uten scrolling.
4. Quizknappen skal aldri være en fullbredde gul blokk i people-popupen.
5. Manglende quiz skal fjerne quizknappen, ikke gi en blind handling.
6. Manglende bilde skal gi initialer og navn, aldri et ødelagt bildeikon.
7. `image`, `portrait`, `portraitImage`, `imageCard`, `cardImage`, `photo` og `frontImage` prøves som bildekandidater.
8. `popupDesc` prioriteres foran eldre `wiki` og `description`.
9. Tomme verk-, sted-, relasjons-, kilde- eller observasjonsseksjoner skal ikke vises.
10. Interne ID-er, auditstatus og researchgjeld skal ikke vises som brukerinnhold.

## 4. Felter popupen støtter

```json
{
  "id": "person_id",
  "name": "Personnavn",
  "initials": "PN",
  "category": "kunst",
  "kindLabel": "Billedhugger / offentlig kunst",
  "desc": "Kort ingress.",
  "popupDesc": "Lengre, avsnittsdelt personartikkel.",
  "birth_date": "1945-12-15",
  "death_date": null,
  "birth_place": "Oslo",
  "active_place": "Nittedal",
  "occupation": "Billedhugger",
  "education": [],
  "materials": [],
  "themes": [],
  "works": [],
  "places": [],
  "tags": [],
  "externalLinks": [],
  "source_urls": []
}
```

Feltlisten er en presentasjonskontrakt, ikke et krav om at alle eksisterende personer må migreres samtidig. Når et felt mangler, forsvinner den tilhørende seksjonen.

## 5. Feltsemantikk

### `desc`

Kort ingress på én til tre setninger. Den skal raskt svare på hvem personen er og hvorfor personen hører hjemme i History GO.

### `popupDesc`

Hovedartikkel med biografi, virke, betydning og stedskobling. Den skal ikke bare gjenta `desc`.

### Livsdata

Foretrukne felt er `birth_date`, `death_date`, `birth_place` og `active_place`. ISO-dato brukes når full dato er kjent. År alene er tillatt når kilden bare støtter år.

### `works`

Kan være en liste med strenger eller objekter. Objekter kan bruke `title`, `year`, `material`, `place`, `summary` og `id`. Bare reelle verk, verv, publikasjoner, oppfinnelser eller dokumenterte bidrag skal føres her.

### `education`, `materials` og `themes`

Disse feltene gir en kompakt fagprofil. De skal være dokumenterte og personspesifikke, ikke generiske ord fylt inn for å gjøre popupen større.

### `externalLinks` og `source_urls`

Brukes til kilde- og videre-lesningslenker. `externalLinks` bør ha tydelig `label`, `url`, `type` og ved behov `verifiedAt`.

## 6. Ulike persontyper

### Kunstner, arkitekt og designer

Prioriter rolle, materialer, utdanning, verk, offentlige oppdrag, stil, teknikk, institusjoner og steder der arbeidet kan observeres.

### Forfatter, dramatiker og journalist

Prioriter sjanger, verk, publikasjoner, redaksjoner, teatre, bosteder, arbeidssteder og litterære miljøer.

### Politiker og samfunnsaktør

Prioriter verv, perioder, partier eller organisasjoner, beslutninger, reformer, konflikter, taler og steder der handlingene fant sted.

### Forsker, oppfinner og fagperson

Prioriter fagfelt, utdanning, institusjoner, teorier, oppdagelser, publikasjoner, metoder og instrumenter.

### Musiker og scenekunstner

Prioriter instrument eller rolle, ensembler, verk, produksjoner, scener, innspillinger og samarbeid.

### Idrettsutøver og trener

Prioriter gren, lag, konkurranser, medaljer, rekorder, perioder, trenere og anlegg.

### Næringslivsperson og institusjonsbygger

Prioriter virksomheter, roller, innovasjoner, produkter, arbeidsliv, bygg, fabrikker og organisatoriske milepæler.

### Ikon, institusjonsbærer og kontekstperson

`kind` beskriver personens spillrolle, ikke yrket. En kontekstperson skal ikke få kunstige verk eller en overdrevet helteprofil.

## 7. Handlinger

Quiz, samtale og notat ligger i en kompakt handlingsrad i hero-området.

- Quiz vises bare når `QuizEngine` finner innhold for personen.
- Quizstatus kan endre teksten til «Fortsett quiz» eller «Ta quiz igjen».
- Samtale og notat beholder `data-chat-person`- og `data-note-person`-kontraktene.
- Handlingene skal ikke skyve biografi og steder langt ned i popupen.

## 8. Kjersti Wexelsen Goksøyr som regresjonseksempel

Den eksisterende Kjersti-posten brukes til å kontrollere at popupen:

- viser initialene `KWG` når portrett mangler;
- viser rollen «Offentlig kunst / skulptur»;
- viser nøkkelåret 1991;
- bruker den eksisterende `popupDesc`-teksten;
- viser Stensparken som klikkbart canonical sted;
- viser relevante tags som temaer;
- ikke viser en tom «Verk»-boks;
- ikke viser et ødelagt bildeikon.

Mer biografisk innhold og konkrete verk skal legges i canonical persondata gjennom ordinær, kildebasert people-produksjon. Popup-runtime skal ikke kompensere ved å gjette.

## 9. QA

Ved endringer i people-popupen:

1. kjør `node --check js/ui/person-popup-v2.js`;
2. kjør `node --test tests/person-popup-v2.test.js`;
3. kontroller en person med bilde og en person uten bilde;
4. kontroller en person med verk og en person uten verk;
5. kontroller at person uten quiz ikke får quizknapp;
6. kontroller margin på mobil og iPad;
7. kontroller at steder åpner canonical stedspopup;
8. kjør relevante people-data- og web-build-kontroller.

## 10. Eierskap

- `docs/PEOPLE_POPUP_SYSTEM.md` beskriver presentasjonskontrakten.
- people JSON eier personens faktiske innhold.
- `js/ui/person-popup-v2.js` eier runtime-renderingen.
- `css/person-popup-v2.css` eier utformingen.
- `js/config.js` laster V2-runtime og stil tidlig.
- `js/ui/popup-utils.js` eier den generelle popupmotoren og legacy-fallbacken.
- people-image-kontrakten eier kilde-, lisens- og attribusjonsreglene for portretter.
