# Youngstorget – fase 1 canonical identity/source V1

- Dato: 2026-08-23
- Place ID: `youngstorget`
- Baseline `main`: `0b62e1c96bbddcf9c8574f10e0d041bba90ca48e`
- Canonical place-fil: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Nullmåling: `reports/place-production/youngstorget-nullmaaling-v1.md`
- Metode: `data/places/regler/content_factory_v1.json`
- Status: **IDENTITY RESOLVED – SOURCE OWNER RESOLVED – INGEN BRUKERRETTET TEKST ENDRET**

## 1. Identitetsport

Canonical identitetssetning:

> Denne oppføringen representerer **selve Youngstorget som navngitt offentlig torg/byrom i Oslo sentrum, fra torget ble anlagt i 1846 og gjennom de senere navne-, markeds-, organisasjons- og arrangementsfasene fram til dagens torg**, ikke bygningene, virksomhetene, organisasjonene, scenene eller gatene rundt plassen.

Status: `resolved`.

### Inkludert i place-identiteten

- den åpne plassflaten og dens historiske bruk som marked, møteplass, arrangementsrom og politisk samlingssted;
- dokumenterte fysiske omforminger av selve torget;
- dokumenterte hendelser som faktisk fant sted på torget;
- dokumenterte navn og navneskifter for torget;
- fysiske objekter på selve torget når de eies av korrekt subsystem og ikke allerede er egne Places;
- relasjoner til nabobygg/-institusjoner når relasjonen forklarer torget uten å overføre naboens historie til torget.

### Ekskludert som egen identitet

Følgende er ikke Youngstorget-place bare fordi de ligger ved eller har sterk historisk relasjon til torget:

- `folkets_hus_oslo` – egen canonical politikk-Place;
- `folketeateret` – egen canonical scenekunst-Place;
- `mollergata_19` – egen canonical historie-Place;
- `torggata` – egen canonical gate og Pilot 01-ankersted;
- `storgata` – egen canonical gate;
- `brugata_storgata_rusmiljo` – eget canonical Subkultur-place for et sosialt territorium i Brugata/Storgata-krysset.

Youngstorgets basar og konkrete monumenter/kunstverk må før materialisering kontrolleres mot hele canonical Place-registeret og sine respektive Object/kunst/systemkontrakter. Denne fasen erklærer dem ikke automatisk som place-eid innhold.

## 2. Canonical source-owner

`data/places/manifest.json` laster `places/politikk/oslo/places_politikk/youngstorget.json`. Det finnes derfor ingen grunn til å opprette eller flytte en parallell Youngstorget-place.

Beslutning:

- canonical ID beholdes: `youngstorget`;
- canonical source beholdes;
- `category: politikk` beholdes som eksisterende identitet fram til egen fag-/kategorifase;
- koordinater og geometri eies fortsatt av coordinate-systemet og røres ikke i denne fasen;
- description-tekst eies av description-kontrakten og røres ikke i denne fasen.

## 3. Tidsidentitet – tre fakta som ikke skal blandes

Tre tidslag er nå eksplisitt skilt:

1. **1846:** torget ble anlagt/etablert.
2. **1852–1951:** det offisielle navnet var `Nytorvet`.
3. **1951:** `Youngstorget` ble offisielt navn; navnet var knyttet til Jørgen Young og hadde vært brukt før det ble offisielt.

Disse opplysningene er støttet av institusjonelle/kommunale kilder som skal inn i Content Factory source pack i fase 2:

- Oslo kommune – `https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/`;
- Oslo byleksikon – `https://oslobyleksikon.no/side/Youngstorget`;
- Arbeiderbevegelsens arkiv og bibliotek, Lill-Ann Jensen, «Det røde torg» – `https://www.arbark.no/eldok/Arbeiderhistorie1996_9.pdf`.

### Konsekvens for dagens data

Dagens `desc`/`popupDesc` sier at torget «ble anlagt som Nytorvet i 1852». Det er en dokumentert sammensmelting av to ulike fakta og er fortsatt markert som regressjon.

Dagens `year: 1852` endres **ikke** i fase 1. Repoets generelle place-schema beskriver `year` som anbefalt felt, men gir ikke feltet en universell semantikk som alltid betyr etableringsår. Description-kontrakten krever derimot metadata–tekst-konsistens. Derfor skal fase 5 velge og dokumentere primærårssemantikken etter at claims/temporal profile er bygget, i stedet for å foreta en blind metadata-rewrite nå.

Før dette er løst kan description-produksjonen ikke få `ready_v4_2`; metadata-/tekstspørsmålet skal behandles eksplisitt i production package.

## 4. Own-place-regel for hele produksjonen

En kilde eller et claim om en naboinstitusjon kan bare brukes i Youngstorget-innhold når den dokumenterer en faktisk Youngstorget-relasjon.

Tillatt eksempel:

- en kilde dokumenterer at et møte på Youngstorget ble organisert fra Folkets Hus; claimet kan beskrive relasjonen mellom organisasjonen/bygget og torget.

Ikke tillatt eksempel:

- en person arbeidet i Folkets Hus; dette alene gjør ikke personen til Youngstorget-People;
- en forestilling gikk i Folketeateret; dette alene er ikke en Youngstorget-Story;
- en virksomhet har adresse i en bygning ved torget; dette alene gjør den ikke til Youngstorget-Brand;
- et bilde viser primært en nabobygning; det kan ikke brukes som hovedbevis/bilde for selve torget uten eksplisitt place-scope.

Samme regel skal brukes på People, Brands, Objects, Stories, før/etter, bilder, relations og source-summary.

## 5. Content Factory-klyngegrense

Pilotens researchklynge forblir:

`Torggata → Youngstorget → Storgata / Brugata–Storgata`

Men klyngen er en **research-effektivitetsenhet**, ikke en innholdsenhet.

- `torggata` = ferdig referanse-/ankersted; ingen ny fullproduksjon.
- `youngstorget` = aktivt fullproduksjonsmål.
- `storgata` = separat downstream canonical Place.
- `brugata_storgata_rusmiljo` = separat downstream canonical Place.
- en eventuell separat `brugata`-Place skal bare tas inn dersom canonical register faktisk viser en slik eier; fase 1 oppretter ingen ny Place ut fra klyngenavnet alene.

## 6. Identity/source gates

| Gate | Resultat |
| --- | --- |
| Én canonical `youngstorget`-eier | **PASS** |
| Manifest-loadet canonical source | **PASS** |
| Torg vs. nabobygg/institusjoner skilt | **PASS** |
| Torg vs. Torggata/Storgata skilt | **PASS** |
| Torg vs. Brugata/Storgata-rusmiljø skilt | **PASS** |
| 1846/1852/1951 tidsfakta separert | **PASS** |
| Blind `year`-rewrite unngått | **PASS** |
| Koordinater rørt i identity-PR | **NEI** |
| Brukerrettet description rørt i identity-PR | **NEI** |
| Nye Places opprettet | **NEI** |

## 7. Beslutning

Fase 1 klassifiseres **FERDIG** når denne rapporten og workcard-oppdateringen er grønne/merget.

Neste fase er **2 – Content Factory source/claim pack**. Den skal materialisere de kontrollerte kildene i en delt source registry med eksplisitt `applicable_place_ids`, og deretter bygge Youngstorget-claims med per-claim scope. Torggata-/Storgata-/Brugata-fakta får ikke Youngstorget-scope uten eksplisitt kildebevis.

Ingen brukerrettet Place-data skal produseres før source/claim-pakken gir tilstrekkelig evidens til den aktuelle checklist-fasen.