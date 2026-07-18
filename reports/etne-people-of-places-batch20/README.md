# Etne People of Places batch 20 — initiativtakarane bak Osnes discgolfbane

## Resultat

Batchen legg til tre namngjevne personar med eksplisitt dokumentert idé-, initiativ- og fysisk banebyggingskopling til `osnes_discgolfbane`:

- `erling_bjarte_rullestad`
- `bjornar_aastvedt`
- `lars_kristian_aastvedt`

## Kjeldegrunnlag

Grannar publiserte 15. september 2022 ei detaljert sak om den nystarta banen på Osnes. Artikkelen og biletteksten dokumenterer at Erling Bjarte Rullestad og brørne Bjørnar og Lars Kristian Aastvedt stod bak banen.

Tidslinja i kjelda er konkret:

- våren 2021 arrangerte Lars Kristian ei turnering med flyttbare korger
- trioen fekk ideen om å lage ein fast lokal bane
- Olav Vik-området på Osnes peika seg ut som stad
- bygginga starta 21. mai 2022
- gjennom sommaren arbeidde dei med skogs- og stirydding, bygging av rampar og utplassering av korger
- banen var klar for spel i juli 2022

Kjelda understrekar samtidig at mange andre bidrog med pengar, utstyr og dugnadsarbeid. Kortene presenterer derfor trioen som dokumenterte initiativtakarar og banebyggjarar, ikkje som dei einaste som bygde anlegget.

Primærkjelde:
- https://www.grannar.no/nyhende/stort-trykk-for-veksande-sport/173496

## Duplikatport

Før skriving vart fersk repo-state søkt etter både ID-ar og fulle namn:

- `erling_bjarte_rullestad` / Erling Bjarte Rullestad
- `bjornar_aastvedt` / Bjørnar Aastvedt
- `lars_kristian_aastvedt` / Lars Kristian Aastvedt

Ingen eksisterande canonical people-identitetar vart funne.

Batchtesten skal gjenta normalisert ID-, namn- og variantkontroll på tvers av heile people-manifestet etter integrasjon.

## Årsval

Alle tre bruker `year: 2022` fordi dette er året den dokumenterte fysiske banebygginga starta og banen vart opna. Kjelda plasserer idéfasen våren 2021, men batchen bruker byggeåret som det sterkaste fysiske place-ankeret.

## Dekning

Etter batch 19 er Etne-dekninga 60 av 81 aktive stader, med 21 udekte. `osnes_discgolfbane` står framleis på restlista.

Batch 20 dekkjer eitt nytt fysisk place og skal, dersom ingen parallelle Etne-place-endringar kjem inn før merge, flytte dekninga til 61/81 og restgjelda til 20.

## Integrasjonskontrakt

- `people/sport/vestland/etne/people_osnes_discgolfbane_batch1.json` skal stå nøyaktig éin gong i people-manifestet.
- Alle tre people-ID-ar skal vere globalt unike ved normalisert ID-, namn- og variantkontroll.
- Alle tre skal berre peike på `osnes_discgolfbane`.
- `tests/etne-people-of-places-batch20.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-, story-, UI-, bilete- eller quizdata.

## Lagra valideringsbevis

Dei faktiske jobb-loggane som vart brukte ved integrasjonen er lagra saman med rapporten:

- `clean-validation-workflow.log` — full read-only validering, run `29663081132`, jobb `88128914740`
- `final-people-data-ci.log` — endeleg People data-CI, run `29663129703`, jobb `88129041295`
- `final-typescript-guard-ci.log` — endeleg TypeScript guard-CI, run `29663129702`, jobb `88129041331`

Alle tre jobbane enda med `success`.
