# Kunstnerforbundet — source review v1

Status: **R4 DESCRIPTION + FAGVERK + PLACE IMAGE + REQUIRED GENERATED OUTPUTS + SPRÅKLEKSIKON MATERIALISERT / FULLPRODUKSJON IKKE LUKKET**  
Place: `kunstnerforbundet`  
Kategori: `kunst`  
R2 base: `d37909288fb1bc5214b1c38d5513a1f7b4679604`  
Tidligere research-checkpoint: `87263139033b8963f244831afe367090227c86f7`  
Kontrollert: 2026-09-13

## 1. Avgrensning

Kunstnerforbundet behandles som den varige kunstnerstyrte visnings- og formidlingsinstitusjonen i egen bygård i Kjeld Stubs gate 3.

Denne fasen oppretter ikke egne Places for skiftende utstillinger, enkeltverk eller Atelier Kunstnerforbundet. Identitet og koordinater fra PR #3476 beholdes uendret.

## 2. Canonical baseline som bevares

Følgende eksisterende felt beholdes:

- `lat`: `59.91286247033279`
- `lon`: `10.735585135946035`
- `r`: `65`
- `coordRole`: `display_marker`
- `coordType`: `address_point`
- `coordStatus`: `verified`
- `coordSource`: `geonorge_adresser_v1`
- `coordSourceId`: `geonorge-adresser-v1:0301:13743:3`

Det finnes ingen dokumentert koordinatregresjon som begrunner ny geokoding.

## 3. Badge og produksjonsprofil

Hovedbadge er `kunst`.

Canonicale underbadges er kontrollert mot `data/badges/kunst.json` og materialiseres som:

- `kunstinstitusjoner`
- `samtidskunst`
- `kunsthistorie`

Produksjonsprofilen er `standard`.

## 4. Kilder brukt i r2

### Kunstnerforbundet — Om Kunstnerforbundet

https://kunstnerforbundet.no/om-kunstnerforbundet

Brukes for dagens kunstnerstyrte og ikke-kommersielle institusjonsmodell, formål, eierskap, rom og funksjoner i Kjeld Stubs gate 3.

### Kunstnerforbundet — Arkiv

https://kunstnerforbundet.no/arkiv

Brukes for verkslister og dokumentert arkivmateriale fra utstillingshistorien.

### Kunstnerforbundet — Jubileumsutstillingen HUNDRE

https://kunstnerforbundet.no/utstillinger/964/jubileumsutstillingen-hundre

Brukes for opprettelsen i 1910, desemberutstillingen, opphavskretsen og arkitektoppdraget for Overlyssalen i 1918.

### Kunstnerforbundet — Nerver, spenning og glede

https://kunstnerforbundet.no/nyheter/nerver-spenning-og-glede

Brukes for eksplisitt dokumentasjon av tilholdet i Kjeld Stubs gate 3 siden 1917.

### Kunstnerforbundet — Atelier Kunstnerforbundet

https://kunstnerforbundet.no/atelier

Brukes for oppstart i 2018, plassering i samme bygård og programareal med fire atelierer, fellesrom og loft.

### Kunstnerforbundet — Lyset blinker

https://kunstnerforbundet.no/utstillinger/1404

Brukes for Oluf Wold-Torne i Overlyssalen i mars 1919.

## 5. Place Description v4.2.1

`data/places/production/kunstnerforbundet.json` materialiserer:

- resolved identity gate;
- 11 verifiserte claims;
- setningsdekning for både `desc` og `popupDesc`;
- SHA-256-hasher for den faktakontrollerte teksten;
- separat factual review og editorial review;
- 10 direkte quiz-readiness-spørsmål;
- `status: ready_v4_2`;
- `validatorVersion: 4.2.1`.

Teksten bruker ingen brukerrettede superlativer, enerpåstander, årsaksforklaringer eller rangeringer som krever strong-claim-dobbeltkilde.

`desc` SHA-256:

`e4590578ffa183eac585422dfa47e70640af6acec1e54405638aebd5f1043101`

`popupDesc` SHA-256:

`027387bf4430a0c981f09c23c75e64aa1a9a2cf3c5130fee5f6836c67786d164`

## 6. Fagverk v2

Stedet får Place-eid `history_go_place_fagverk_v2` på `standard`-nivå.

Canonical subject:

- `kunst`

Canonical emner:

- `em_kunst_institusjonskritikk_og_representasjon`
- `em_kunst_kvalitet_kritikk_og_symbolsk_kapital`
- `em_kunst_okonomi_og_finansiering`

Canonical kapitler:

- `makt-og-legitimitet`
- `felt-og-institusjon`

Fagverk-blokken inneholder tre stedsspesifikke linser, fire undersøkelsesspørsmål, seks begreper, to observerbare spor og fem kontrollerte kilder.

Registryet får kun den smale `placeLinks.kunstnerforbundet`-indeksen med sourcefil, felt, schema, nivå og status. Ingen stedstekst flyttes inn i registryet.

## 7. Opprinnelig atomisk r2-scope

Den opprinnelige r2-materialiseringen besto av nøyaktig disse fem filene:

1. `data/places/kunst/oslo/places_kunst/kunstnerforbundet.json`
2. `data/places/production/kunstnerforbundet.json`
3. `data/fagverk/fagverk_registry.json`
4. `reports/place-production/kunstnerforbundet-workcard-current.json`
5. `reports/place-production/kunstnerforbundet-source-review-v1.md`

Fagverk-blokk og registry-rad skal være i samme commit. En Place med `fagverk` uten registry-rad er en bevisst rød tilstand og skal ikke publiseres.

## 8. Ikke del av r2

Følgende holdes eksplisitt utenfor denne fasen:

- `frontImage`;
- People-, Objects-, Brands- og Productions-medlemmer;
- Språkleksikon;
- chronology/epoke-materialisering;
- full canonical quiz production brief/context/package;
- QuizCard;
- Stories, før/etter og nyheter;
- runtime/generated indexes utover det som eventuelt må rematerialiseres senere;
- full closeout.

Ingen av disse skal fylles med placeholder eller spekulativt innhold.

## 9. Status etter r2

Etter en korrekt femfilers r2 er følgende gates lukket:

- identitet: `PASS_EXISTING`
- koordinater: `PASS_EXISTING`
- underbadges: `PASS`
- Place Description v4.2.1: `PASS`
- Place-eid Fagverk v2: `PASS`

Stedet er likevel **ikke fullprodusert**. `frontImage`, Språkleksikon, de fire obligatoriske PlaceCard-samlingene, canonical quiz og manuell slutt-QA står fortsatt åpne.

## 10. R3 CI-follow-up — dokumentarfoto og deterministic materialisering

Changed-place-bildeporten krevde et inspectable lokalt stedbilde. Kunstnerforbundet får derfor dokumentarfotoet `Kunstnerforbundet2.jpg` av Anne-Sophie Ofrim fra Wikimedia Commons, lisensiert CC BY-SA 4.0. Filen beholdes som original JPEG uten generativ endring og krediteres i canonical Place-data.

Description-packeten er samtidig korrigert mot validator 4.2.1: den ugyldige `metadataSnapshot.placeType`-kopien er fjernet, og 1917- og 2018-claims med `timelineYear` er eksplisitt historiske. Repoets egne generatorer materialiserer deretter epokeindeks, `place-open` og Fagverk-release. READ-FIRST-evidensen registreres med den autoritative preflight-generatoren etter full lesing av de ti påkrevde regel-/badgefilene.

Dette er en CI-påkrevd materialisering av dokumenterte data, ikke filler. Full produksjonslukking krever fortsatt de åpne samlingene, Språkleksikon, canonical quiz, `frontImage` og slutt-QA.

## 11. R4 — Språkleksikon

Språkleksikon-gaten lukkes med canonical stedfil:

`data/leksikon/sprak/places/europe/norway/oslo/kunstnerforbundet.json`

og manifestbinding i:

`data/leksikon/sprak/manifest.json`

Det opprettes ikke et spekulativt dialektlag for dette enkeltstedet. Alle tre oppføringer ligger på `layer: language` og er direkte dokumentert av Kunstnerforbundets egne kilder:

- `kunstnerstyrt` — institusjonsbegrep brukt om Kunstnerforbundets egen styringsmodell;
- `Atelier Kunstnerforbundet` — institusjonens eget programnavn for atelierordningen i bygården;
- `Overlyssalen` — institusjonens eget navn på utstillingssalen med historisk dokumentasjon tilbake til arkitektoppdraget i 1918.

Språkmanifestet inngår i `place-open`-payloaden. Etter første exact-head-kjøring krevde derfor `npm run place-open:build` en deterministisk rematerialisering av `data/runtime/place-open/kunstnerforbundet.json`. En egen scope-guard bekreftet at generatoren endret nøyaktig denne ene runtimefilen og ingen andre genererte filer.

R4-scope er dermed språkfil, manifestbinding, det påkrevde genererte `place-open`-payloadet og oppdatering av workcard/source-review. R4 lukker ikke `frontImage`, People, Objects, Brands, Productions/Kunstverk, canonical quiz, øvrige runtime-/sluttindekser eller manuell slutt-QA.
