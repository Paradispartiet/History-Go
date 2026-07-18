# Koordinatfinner – metode og arbeidsflyt

Denne dokumentasjonen er den normative arbeidsflyten for å finne, kontrollere og dokumentere koordinater til History Go-steder.

Målet er ikke bare å finne et punkt som ser riktig ut på kartet. Målet er å bruke riktig koordinatkilde for riktig type sted, bevare sporbarhet og unngå at et adressepunkt, et tilfeldig POI-treff eller et visuelt anslag blir behandlet som et verifisert fysisk anker.

## Hovedregel

Velg metode ut fra hva slags fysisk objekt stedet faktisk er.

- Har stedet en konkret og relevant norsk gateadresse som representerer selve stedet, bruk alltid Geonorge Adresser API først via `places:coords:find:address`.
- Har stedet ikke en egnet adresse, eller er adressen bare en administrativ/postal tilknytning til et større område, skal adressepunktet ikke brukes som snarvei.
- Parker, idrettsflater, utebaner, skytebaner, strender, kaier, stier, natursteder, monumenter, ruiner og andre areal- eller objektbaserte steder må forankres i det faktiske fysiske objektet.
- Er kilden eller det fysiske ankeret ikke entydig, skal stedet stå som `needs_review`. Ikke gjett koordinater.

## Beslutningsrekkefølge

### 1. Auditér eksisterende place-record først

Før nye koordinater finnes eller endres:

1. Finn eksisterende canonical `placeId`.
2. Kontroller navn og navnevarianter.
3. Kontroller eksisterende `lat`, `lon`, `r`, `locatorType`, `coordSource`, `coordType`, `coordStatus`, `sourceProvider` og `sourceObjectId` når feltene finnes.
4. Kontroller om stedet allerede overlapper fysisk med en annen canonical record.
5. Avklar hvilket konkret fysisk objekt markøren skal representere.

Ikke opprett et nytt sted eller nytt koordinatanker bare fordi et søketreff finnes.

### 2. Konkret norsk adresse: bruk Geonorge først

Når stedet har en kjent, konkret norsk gateadresse som faktisk representerer stedet, bruk:

```bash
mkdir -p reports/<coordinate-batch>

npm run places:coords:find:address -- --address "<full adresse>" \
  | tee reports/<coordinate-batch>/<place-id>.json
```

Bruk `tee` når output både skal vises og lagres. Bruk `>` når output bare skal lagres.

Eksempel:

```bash
mkdir -p reports/geonorge-address-batch-1

npm run places:coords:find:address -- --address "Langkaia 1 Oslo" \
  | tee reports/geonorge-address-batch-1/havnelageret.json
```

Terminaloutput som senere skal brukes av Codex, PR eller rapport skal alltid lagres til fil i samme bash-blokk. Ikke kjør bare kommandoen uten `>` eller `tee` når resultatet skal brukes videre.

`places:coords:find:address` bruker Geonorge Adresser API og produserer en Coordinate Source Contract-kandidat. Verktøyet endrer ikke place-data automatisk.

### 3. Kontroller om adressepunktet faktisk er riktig type anker

Et gyldig adressetreff er ikke automatisk et gyldig History Go-punkt.

Adressepunkt kan normalt brukes når markøren skal representere:

- en bestemt bygning
- en institusjon i den aktuelle bygningen
- et museum, kulturhus, skole, stadionbygg eller annet sted der adressens representasjonspunkt samsvarer med stedet brukeren skal finne

Adressepunkt skal ikke brukes blindt for:

- parker
- fotballbaner og andre utendørs idrettsflater
- pumptracks, skateparker eller andre anlegg som ligger på samme eiendom som en større bygning
- skytebaner ute
- strender og badeplasser
- kaier og brygger
- vannflater
- stier og utsiktspunkter
- natursteder
- store områder og bydeler
- monumenter eller objekter som står et annet sted enn adressens bygningspunkt

I slike tilfeller må koordinatet forankres i det faktiske fysiske objektet.

### 4. Sted uten egnet adresse: bruk objektets faktiske fysiske anker

Når adresse-first ikke passer, finn koordinatet fra en kilde som faktisk identifiserer objektet.

Prioriter, når relevant:

1. offisiell objekt- eller anleggsdata fra kommune, stat eller annen ansvarlig myndighet
2. offisielt kartverk eller fagregister som identifiserer det konkrete objektet
3. dokumentert anleggskart, reguleringskart eller tilsvarende presis geografisk kilde
4. verifisert OSM/POI-geometri når den tydelig representerer det samme fysiske objektet
5. manuell kartkontroll bare som kontrollsteg, ikke som eneste kilde når en bedre kilde finnes

Kilden skal passe til objektet. Et punkt for en bygning skal ikke uten videre brukes for en bane, park eller kai som bare deler adresse eller eiendom.

### 5. Flere mulige treff: stopp og avklar

Hvis Geonorge eller en annen kilde gir flere plausible treff uten én entydig fysisk match:

- ikke velg det første treffet
- ikke velg det nærmeste treffet uten dokumentasjon
- ikke konstruer et kompromisspunkt mellom treffene
- marker arbeidet som `needs_review`
- dokumenter hvilke kandidater som ble vurdert og hva som mangler for å avgjøre saken

### 6. Fysisk overlap-audit

Før en ny place-record opprettes for et anlegg som deler adresse, eiendom eller kompleks med et eksisterende sted:

1. kontroller om objektet er fysisk selvstendig
2. kontroller om det har en egen funksjon som History Go faktisk skal modellere separat
3. kontroller om eksisterende record allerede dekker samme fysiske anker
4. kontroller om separat markør vil gi to canonical steder på praktisk talt samme punkt

Felles adresse er ikke i seg selv grunn til å slå sammen steder. Men felles adresse er heller ikke bevis på at to steder har hvert sitt riktige koordinatpunkt.

### 7. Før place-data endres

En koordinatkandidat skal ikke automatisk behandles som verifisert bare fordi et verktøy returnerer et treff.

Kontroller:

- at kilden gjelder riktig sted
- at punktet ligger på riktig fysisk objekt
- at `coordRole` passer til bruken
- at `locatorType` beskriver objektet riktig
- at radius `r` er rimelig for stedet
- at kildereferansen er sporbar

For Geonorge-adressefinneren betyr `verified_candidate` at adressetreffet er entydig nok til å brukes som kandidat. Det betyr ikke at en park, utebane eller et annet ikke-bygningsobjekt automatisk skal flyttes til adressepunktet.

### 8. Etter endring: valider på kartet

Etter at koordinatene er endret:

1. kjør relevante data- og schema-valideringer
2. kontroller markøren visuelt i History Go-kartet
3. bekreft at kartet zoomer til riktig fysiske sted
4. kontroller nærliggende canonical steder for feil overlap
5. kontroller at PlaceCard og eventuell routing åpner riktig sted

Et koordinat er ikke ferdig bare fordi JSON validerer.

## Metodekort

| Stedstype | Første metode | Viktig kontroll |
| --- | --- | --- |
| Bygning med kjent norsk adresse | Geonorge Adresser API | Representerer adressepunktet faktisk stedet? |
| Institusjon i bestemt bygning | Geonorge Adresser API | Er inngang/bygningspunkt riktig display-marker? |
| Stadionbygg | Geonorge først ved konkret adresse | Skal markøren være på bygget eller selve banen? |
| Fotballbane / utebane | Offisiell anleggs-/objektkilde | Ikke bruk klubbhusets adressepunkt automatisk |
| Park | Offisielt kart/objektgeometri | Velg et representativt punkt i selve parken |
| Pumptrack / skatepark | Anleggsdata eller presis objektgeometri | Auditér overlap med andre anlegg på samme adresse |
| Skytebane ute | Offisiell anleggsdata/kart | Skill utebane fra innendørs adresse |
| Kai / brygge | Offisiell havne-/kartkilde | Ikke bruk nærmeste bygningsadresse |
| Natursted / utsiktspunkt | Offisielt kart eller dokumentert objektpunkt | Ikke konstruer adresseanker |
| Bydel / større område | Områdebasert representativt anker | Dokumenter at punktet er et display-anker, ikke et eksakt objektpunkt |

## Absolutte regler

- Ikke gjett koordinater.
- Ikke bruk Nominatim/OSM/POI-søk før Geonorge når stedet har en konkret, relevant norsk adresse.
- Ikke bruk Geonorge-adressepunkt når stedet egentlig er et annet fysisk objekt enn adressens bygning.
- Ikke opprett duplikat av eksisterende canonical place-record.
- Ikke godta fysisk overlap uten å auditere om stedene faktisk skal være separate.
- Ikke la viktig terminaloutput forsvinne i terminalhistorikken; bruk `tee` eller `>` i samme bash-blokk.
- Ikke marker noe som verifisert uten sporbar kilde og fysisk kontroll.

## Verktøy

Adresse-first-verktøyet ligger i:

```text
tools/address-first-coordinate-finder.mts
```

Kommando:

```bash
npm run places:coords:find:address -- --address "<adresse>"
```

For arbeid som skal dokumenteres eller brukes videre, bruk alltid den lagrede varianten:

```bash
mkdir -p reports/<coordinate-batch>

npm run places:coords:find:address -- --address "<adresse>" \
  | tee reports/<coordinate-batch>/<place-id>.json
```
