# History GO — Wonderkammer

Status: **canonical konsolideringskontrakt**  
Sist kontrollert: **2026-07-28**

Wonderkammer har hatt flere konkurrerende betydninger i repoet. Denne kontrakten rydder begrepet og definerer hva nye Wonderkammer-data skal være.

## 1. Canonical definisjon

> **Wonderkammer er en kuratert samling av konkrete, stedsspesifikke kuriositeter, detaljer, spor og «skatter» som brukeren kan oppdage ved et faktisk sted.**

Et Wonderkammer-element skal gjøre brukeren mer oppmerksom på noe som finnes, har eksistert eller kan leses fysisk på akkurat dette stedet.

Typiske eksempler:

- en arkitektonisk detalj;
- et uvanlig materiale eller konstruksjonsspor;
- et konkret historisk lag;
- et fysisk minnespor;
- en særpreget romlig relasjon;
- et skjult eller oversett objekt;
- en stedsspesifikk kuriositet;
- et dokumentert tidligere bruksspor som kan forstås gjennom det fysiske stedet.

Den nyere `actual_site_treasure`-modellen ligger nærmest denne definisjonen.

## 2. Hva Wonderkammer ikke er

Wonderkammer er ikke:

- en generell kunnskapsartikkel;
- en chronology;
- en Story;
- en liste over personer eller steder å klikke videre til;
- et synonym for relations eller NextUp;
- en aktivitetsbank;
- et treningsprogram;
- en lekeplassguide;
- et sett med generiske «hva kan man gjøre her?»-tekster;
- Civication Store / Thingstore;
- en restkategori for innhold som ikke passer andre steder.

Hvis innholdet først og fremst forklarer, tidsfester, trener, instruerer eller navigerer, hører det normalt hjemme et annet sted.

## 3. Audit: tre historiske Wonderkammer-modeller

Repoet inneholder minst tre ulike generasjoner.

### A. Navigasjons-Wonderkammer

Den tidlige kontrakten brukte typer som:

- `place`
- `person`
- `institution`
- `practice`
- `work`
- `trace`

Målet var at brukeren skulle føle «her kan jeg gå videre», med flere klikk gjennom et kuratert nettverk.

Denne ideen overlapper nå med:

- canonical relations;
- NextUp / Fortsett reisen;
- People-rundingen;
- Brands-rundingen;
- Works-rundingen;
- stedskoblinger og ruter.

**Beslutning:** Navigasjonsgrafen er ikke lenger canonical Wonderkammer. Nye Wonderkammer-data skal ikke produseres som generelle pekere til andre entiteter.

Eksisterende navigasjonsdata beholdes som migreringsgrunnlag til de er flyttet til riktig relasjons-/navigasjonssystem.

### B. Aktivitets-Wonderkammer

Senere data brukte Wonderkammer til blant annet:

- `play_zone`;
- `open_play_area`;
- `exploration_zone`;
- `activity`;
- `activityText`;
- `ageHint`;
- `adultRole`;
- `microMission`;
- trenings- og lekeinstruksjoner.

Dette er den modellen som gjør Wonderkammer til en «undrings-/gjør noe her»-flate.

**Beslutning:** Denne modellen er ikke canonical Wonderkammer.

- lek → `play_profile` / **På stedet → Gjør på stedet**;
- trening → `training_profile` / **På stedet → Gjør på stedet**;
- oppgaver → `tasks_profile` / **På stedet → Gjør på stedet**;
- observasjon → observations / Observer-flow;
- generelle familieaktiviteter → egen handlings-/ruteproduktflate når relevant.

Aktivitetsdata skal migreres gradvis; de skal ikke slettes blindt.

### C. Actual-site-treasure / kuriositets-Wonderkammer

Nyere produksjon har brukt felt som:

- `treasureScope: "actual_site_treasure"`;
- `treasureTitle`;
- `treasureType`;
- `cabinetCategory`;
- `curiosity`;
- `whereToFind`;
- `whatToNotice`;
- `material`;
- `rarity`;
- `collectible`;
- `collectionNote`.

Denne modellen er fysisk, stedsspesifikk og samlingsorientert.

**Beslutning:** Dette er basis for canonical Wonderkammer videre.

## 4. Canonical Wonderkammer-element

Et nytt Wonderkammer-element bør normalt ha:

```json
{
  "id": "wk_sted_objekt",
  "title": "Kort tydelig tittel",
  "type": "architectural_feature",
  "description": "Hva dette faktisk er.",
  "placeSpecificDetail": "Hvorfor akkurat dette stedet er nødvendig.",
  "treasureTitle": "Samletittel",
  "treasureType": "detalj",
  "treasureScope": "actual_site_treasure",
  "cabinetCategory": "artificialia",
  "curiosity": "Én dokumentert kuriositet.",
  "whereToFind": "Hvor på stedet brukeren kan finne det.",
  "whatToNotice": "Hva brukeren konkret kan legge merke til.",
  "rarity": "uvanlig",
  "collectible": "stedsobservasjon",
  "collectionNote": "Du samlet ...",
  "sourceNote": "Kort kilde-/proveniensnotat"
}
```

Ikke alle felt er alltid nødvendige, men følgende prinsipper er obligatoriske:

1. fysisk eller historisk konkret objekt/spor;
2. tydelig stedsspesifisitet;
3. ingen generisk aktivitetstekst som hovedinnhold;
4. ingen ren navigasjonslenke som hovedinnhold;
5. ingen erstatning for Story, chronology eller Leksikon;
6. dokumenterbar påstand.

## 5. `whatToDo` er ikke hovedidentiteten

Noen nyere `actual_site_treasure`-oppføringer har `whatToDo`, for eksempel «gå rundt», «se mot», «følg med blikket».

Dette kan beholdes som en **mikrohandling for observasjon**, men bare når den tjener selve kuriositeten.

Godt:

> «Se på skjøten mellom to murpartier og legg merke til skiftet i stein.»

Ikke godt:

> «Løp opp bakken tre ganger og ta tiden.»

Det siste er trening og hører hjemme under På stedet.

## 6. Forholdet til andre systemer

### Leksikon / stedspopup

Leksikon forklarer. Wonderkammer peker ut en konkret kuriositet eller detalj.

### Historie / chronology

Historie tidsfester og kontekstualiserer. Wonderkammer kan vise et fysisk spor etter historien, men skal ikke bli en tidslinje.

### Stories

Stories forteller. Wonderkammer samler konkrete ting/spor. En sterk Story kan forklare hvorfor et Wonderkammer-objekt er viktig, men de skal ikke duplisere hverandre.

### People / Brands / Works

Hvis hovedverdien er en navngitt person, institusjon eller et canonical verk, bruk den relevante visuelle samlingen i stedet for å kopiere objektet inn i Wonderkammer.

### Relations / NextUp

Hvis hovedverdien er «gå videre til X», bruk relations/NextUp. Wonderkammer er ikke navigasjonsgraf.

### På stedet

Hvis hovedverdien er «gjør X», bruk **På stedet**.

### Civication Store

Hvis objektet primært er et spillobjekt som kan kjøpes/samles/brukes i Civication, hører det i Civication Store. Wonderkammer kan beskrive den virkelige kuriositeten, men skal ikke være butikkdata.

## 7. UI-status

Wonderkammer er midlertidig **ikke** en canonical PlaceCard-runding og vises ikke automatisk i den nye stedspopupen mens datamigreringen pågår.

Dette er med vilje: dagens `data/wonderkammer/index.json` laster både navigasjons-, aktivitets- og treasure-generasjoner i samme runtime.

Før Wonderkammer får ny brukerflate skal dataene klassifiseres og legacy-typene skilles ut.

## 8. Migreringsregler

For hver eksisterende Wonderkammer-entry:

1. identifiser hvilken av de tre modellene den tilhører;
2. behold `actual_site_treasure`/stedsspesifikke kuriositeter som Wonderkammer-kandidater;
3. flytt aktivitet/lek/trening/oppgave til riktig På stedet-profil;
4. flytt navigasjonspekere til relations/NextUp/People/Brands/Works;
5. flytt chronology-aktige oppføringer til Historie når hovedverdien er dato/hendelse;
6. flytt narrative historier til Stories bare hvis de består storytesten;
7. behold provenance/kildegrunnlag gjennom migreringen;
8. slett først legacy-entry når ny canonical representasjon er validert.

## 9. Produksjonsstopp for legacy-typer

Fra denne revisjonen skal det ikke produseres nye Wonderkammer-entries der hovedtypen er:

- generisk lek;
- trening;
- aktivitet;
- oppgave;
- ren person-/sted-/institusjonspeker;
- generisk «utforsk dette stedet»-tekst uten konkret skatt/spor.

Eksisterende filer kan fortsatt være aktive inntil migrering er gjennomført.

## 10. Kvalitetstest

Et nytt Wonderkammer-element er godt nok når:

- det ikke kunne vært flyttet til et tilfeldig annet sted uten å miste mening;
- brukeren kan finne, se eller forstå et konkret spor/objekt;
- teksten beskriver selve kuriositeten før den foreslår handling;
- den ikke dupliserer en bedre People/Works/Brands/Story/History-representasjon;
- kilden eller provenance kan etterprøves;
- det føles som noe man **oppdager og samler**, ikke noe man må lese ferdig eller gjennomføre som treningsøkt.

## 11. Neste migreringsarbeid

`data/wonderkammer/index.json` må auditeres fil for fil og klassifiseres i minst:

- `canonical_treasure_candidate`;
- `migrate_to_actions`;
- `migrate_to_relations_navigation`;
- `migrate_to_history`;
- `migrate_to_other_collection`;
- `reject_or_duplicate`.

Dette bør gjøres som en egen databatch etter at den nye popup-/rundingsarkitekturen er stabil, slik at ingen legacy-data mistes ved UI-endringen.
