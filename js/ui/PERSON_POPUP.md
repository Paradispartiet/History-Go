# People popup V2

Status: **local subsystem documentation**  
Runtime: `js/ui/person-popup-v2.js`  
Design: `css/person-popup-v2.css`  
Test: `tests/person-popup-v2.test.js`

People-popupen er personens fordypningsflate. Den skal være en informativ profil, ikke en stor quizflate og ikke en samling tomme bokser.

## Informasjonsrekkefølge

1. Kategori, navn og rolle.
2. Portrett eller initialfallback.
3. Kort ingress og nøkkelfakta.
4. Kompakte handlinger: quiz når quiz finnes, samtale og notat.
5. `popupDesc` under «Om personen».
6. Verk og bidrag når `works` finnes.
7. Utdanning, materialer og temaer når feltene finnes.
8. Canonical steder og kuraterte relations.
9. Stories, knowledge, kilder og observasjoner når de finnes.

## Designregler

- Popupen skal ha synlig margin mot skjermkanten på mobil, iPad og desktop.
- Popupen skal ha én intern vertikal scrollflate.
- Den globale fullbredde gule `.hg-quiz-btn` skal overstyres til en liten sekundær knapp.
- Manglende quiz skal fjerne quizknappen.
- Manglende bilde skal vise initialer og navn, aldri et ødelagt bildeikon.
- Tomme verk-, sted-, relasjons-, kilde- og observasjonsseksjoner skal ikke vises.
- `popupDesc` prioriteres foran `wiki`, `description` og `desc`.
- Runtime skal ikke gjette manglende biografi eller verk.

## Støttede datafelt

```json
{
  "id": "person_id",
  "name": "Personnavn",
  "initials": "PN",
  "category": "kunst",
  "kindLabel": "Billedhugger / offentlig kunst",
  "desc": "Kort ingress.",
  "popupDesc": "Lengre personartikkel.",
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

Feltlisten er en presentasjonskontrakt, ikke et krav om at alle personer må migreres samtidig. Seksjoner forsvinner når data mangler.

## Persontyper

- Kunstner, arkitekt og designer: rolle, materialer, utdanning, verk, oppdrag og steder der arbeidet kan observeres.
- Forfatter og journalist: sjanger, verk, publikasjoner, redaksjoner, bosteder og litterære miljøer.
- Politiker og samfunnsaktør: verv, perioder, beslutninger, reformer, konflikter og handlingssteder.
- Forsker og oppfinner: fagfelt, institusjoner, oppdagelser, publikasjoner, metoder og instrumenter.
- Musiker og scenekunstner: instrument eller rolle, ensembler, verk, produksjoner, scener og samarbeid.
- Idrettsutøver og trener: gren, lag, konkurranser, medaljer, rekorder og anlegg.
- Næringslivsperson og institusjonsbygger: virksomheter, roller, innovasjoner, arbeidsliv og organisatoriske milepæler.

`kind` beskriver spillrollen ikon, institusjonsbærer eller kontekstperson. Det erstatter ikke personens konkrete yrke eller rolle.

## Kjersti Wexelsen Goksøyr som regresjonseksempel

Den eksisterende Kjersti-posten kontrollerer at popupen:

- viser `KWG` når portrett mangler;
- viser rollen «Offentlig kunst / skulptur»;
- viser nøkkelåret 1991;
- bruker eksisterende `popupDesc`;
- viser Stensparken som klikkbart canonical sted;
- viser tags som temaer;
- ikke viser en tom «Verk»-boks;
- ikke viser et ødelagt bildeikon.

Mer biografi og konkrete verk må legges i canonical people-data gjennom vanlig kildebasert produksjon.

## QA

```bash
node --check js/ui/person-popup-v2.js
node --test tests/person-popup-v2.test.js
bash scripts/check-people.sh
npm run build:web:check
```

Kontroller i tillegg minst én person med bilde, én uten bilde, én med verk, én uten verk og en person uten quiz.
