# History GO — Wonderkammer

Status: **legacy migreringskontrakt**  
Sist kontrollert: **2026-07-28**

Wonderkammer har hatt flere konkurrerende betydninger i repoet. Det skal ikke lenger være en egen canonical PlaceCard-runding eller en ny produksjonsmodell.

## Beslutning

> **Det skal ikke produseres nye Wonderkammer-entries. Eksisterende Wonderkammer-data beholdes som migreringsgrunnlag til hver entry er flyttet til riktig canonical system.**

Den nye visuelle PlaceCard-paletten er dokumentert i `data/places/README_place_rounds.md`.

Fysiske ting som tidligere kunne blitt kalt Wonderkammer skal nå klassifiseres etter hva de faktisk er:

- fysisk gjenstand → `objects`;
- liten synlig detalj eller fysisk spor → `details`;
- konkret delpunkt/delsted → `spots`;
- person → `people`;
- verk → `works`;
- naturentitet → `nature`;
- eksisterende Brand-oppføring → `brands`;
- handling → **På stedet**;
- navigasjon → relations/NextUp;
- chronology/hendelse → **Historie**;
- narrativ fortelling → Stories når storykontrakten er oppfylt.

## Hvorfor Wonderkammer pensjoneres

Repoet inneholder historisk minst tre forskjellige Wonderkammer-modeller som ikke bør fortsette under ett navn.

### 1. Navigasjons-Wonderkammer

Tidlige data brukte blant annet:

- `place`
- `person`
- `institution`
- `practice`
- `work`
- `trace`

Hovedverdien var «gå videre til X».

**Canonical destinasjon:** relations/NextUp eller den relevante People/Works/Brands-/stedskoblingen.

Eksisterende Brands-data og Brands-oppføringer skal ikke omskrives som del av denne migreringen.

### 2. Aktivitets-Wonderkammer

Senere data brukte blant annet:

- `play_zone`
- `open_play_area`
- `exploration_zone`
- `activity`
- `activityText`
- `ageHint`
- `adultRole`
- `microMission`
- trenings- og lekeinstruksjoner

**Canonical destinasjon:**

- lek → `play_profile` / **På stedet → Gjør på stedet**;
- trening → `training_profile` / **På stedet → Gjør på stedet**;
- oppgaver → `tasks_profile` / **På stedet → Gjør på stedet**;
- observasjonshandling → Observer-flow eller annen riktig handlingsflate.

### 3. `actual_site_treasure`

Nyere Wonderkammer-produksjon brukte blant annet:

- `treasureScope: "actual_site_treasure"`
- `treasureTitle`
- `treasureType`
- `cabinetCategory`
- `curiosity`
- `whereToFind`
- `whatToNotice`
- `material`
- `rarity`
- `collectible`
- `collectionNote`

Denne modellen var nærmest den nye rundingarkitekturen, men inneholdt flere forskjellige objekttyper.

**Canonical destinasjon avgjøres entry for entry:**

- kanon, maskin, funn, instrument, dokumentobjekt → `objects`;
- inskripsjon, skilt, ornament, skadespor → `details`;
- port, tårn, tunnel, rom, utsiktspunkt → `spots`;
- selvstendig kunstverk → `works`;
- art eller naturfenomen → `nature`.

Det skal ikke opprettes en ny restkategori kalt Wonderkammer for det som ikke passer andre steder.

## Objects og Civication

Civication Store / Thingstore består som spillsystem, men er ikke en egen canonical PlaceCard-runding.

Når et Store-element også representerer en virkelig stedsspesifikk gjenstand kan det presenteres gjennom `objects` uten at Store-dataene flyttes eller dupliseres.

Skillet er:

- `objects` beskriver **hva den fysiske tingen er**;
- Civication beskriver **kjøp, eierskap og bruk i spillet**.

Ikke alle Objects skal være kjøpbare.

## Migreringsregler

For hver eksisterende Wonderkammer-entry:

1. identifiser hvilken historisk modell entryen tilhører;
2. identifiser hva entryen faktisk representerer;
3. velg én canonical destinasjon;
4. behold kilde/provenance gjennom migreringen;
5. ikke kopier samme element inn i flere rundinger uten en eksplisitt semantisk grunn;
6. slett legacy-entry først når den nye representasjonen er validert;
7. ikke endre eksisterende Brands-oppføringer som del av Wonderkammer-migreringen.

## Produksjonsstopp

Fra denne revisjonen skal det ikke produseres nye data med Wonderkammer som målmodell.

Dette gjelder både:

- generisk lek;
- trening;
- aktivitet;
- oppgave;
- navigasjonspekere;
- `actual_site_treasure`;
- generisk «utforsk dette stedet»-tekst;
- tilfeldige kuriositeter uten klassifisert canonical destinasjon.

## Kvalitetsregel for fysisk innhold

Fysiske Wonderkammer-kandidater som migreres til `objects`, `details` eller `spots` skal:

- være stedsspesifikke;
- være identifiserbare;
- kunne dokumenteres;
- ha eller kunne få et meningsfullt visuelt bilde/kort;
- ikke bare være en hendelse, artikkel eller handling;
- plasseres i den smaleste riktige av de tre hovedgruppene.

Praktisk skille:

- **Objects:** en ting;
- **Details:** noe lite du ser på eller oppdager;
- **Spots:** et fysisk punkt/delsted du går bort til.

## UI-status

Wonderkammer skal ikke vises som canonical PlaceCard-runding.

Legacy DOM-hooks kan bestå midlertidig for bakoverkompatibilitet, men brukerrettet rundingpresentasjon skal skjule dem.

## Neste migreringsarbeid

`data/wonderkammer/index.json` må fortsatt auditeres fil for fil. En nyttig migreringsklassifikasjon er:

- `migrate_to_objects`
- `migrate_to_details`
- `migrate_to_spots`
- `migrate_to_people`
- `migrate_to_works`
- `migrate_to_nature`
- `migrate_to_relations_navigation`
- `migrate_to_actions`
- `migrate_to_history`
- `reject_or_duplicate`

Ingen legacy-data skal masseslettes bare fordi Wonderkammer ikke lenger er en produktflate.
