# Etne People of Places batch 22 — rehabiliteringa av Etne tennisanlegg

## Resultat

Batchen legg til to namngjevne personar med eksplisitt dokumentert initiativ- og fysisk arbeidskopling til `etne_tennisanlegg`:

- `morten_goa_aadnoy`
- `ole_storhaug`

## Kjeldegrunnlag

Norsk Tennis dokumenterer at Morten Goa Aadnøy og Ole Storhaug sommaren 2020 bestemte seg for å køyre til Etne med maling. Dei tok initiativ til å gi dei då forfalne kommunale asfaltbanene eit ansiktsløft. Bilettekstene dokumenterer begge i arbeidet og omtalar resultatet som dugnad.

Etne IL stadfestar at den same sentrale anleggsstaden i dag har to Playrite Clayrite-kunstgrusbaner. Grannar dokumenterer at dei nye banene opna i oktober 2025, at den nye giva starta i 2020, og at stort dugnadsarbeid gjorde det nye anlegget mogleg.

Kjelder:

- https://norsktennis.no/entusiasme-i-etne/
- https://www.etneil.no/aktuelt/onsker-du-a-spille-tennis
- https://www.grannar.no/nyhende/stor-folkefest-pa-opninga-av-dei-nye-tennisbanane-i-etne/175247

## Avgrensing

People-korta gjeld den konkret dokumenterte målings- og rehabiliteringsinnsatsen i 2020. Dei påstår ikkje at Aadnøy eller Storhaug bygde dei nye kunstgrusbanene som opna i 2025, finansierte prosjektet, eller utførte heile dugnaden.

Frode Berge og Laila Frette er synlege i biletteksten frå oppussinga, men blir haldne utanfor denne vesle batchen fordi brødteksten gir Aadnøy og Storhaug den sterkaste eksplisitte initiativrolla for sjølve anleggsarbeidet.

## Duplikatport

Før skriving vart fersk repo-state søkt etter ID-ar, fulle namn og normaliserte variantar:

- `morten_goa_aadnoy` / Morten Goa Aadnøy / Morten Goa Aadnoy
- `ole_storhaug` / Ole Storhaug

Ingen eksisterande canonical people-identitetar vart funne. Batchtesten gjentek normalisert ID-, namn- og variantkontroll på tvers av heile people-manifestet etter integrasjon.

## Årsval

Begge bruker `year: 2020`, fordi kjelda plasserer målings- og oppussingsinitiativet sommaren 2020.

## Dekning

Etter batch 21 er 62 av 81 aktive Etne-stader dekte, med 19 udekte. Batch 22 dekkjer `etne_tennisanlegg` og skal gi 63/81 med 18 udekte dersom hovudlinja ikkje endrar seg før merge.

## Integrasjonskontrakt

- batchfila skal stå nøyaktig éin gong i people-manifestet
- begge identitetane skal vere globalt unike ved normalisert ID-, namn- og variantkontroll
- begge skal berre peike på `etne_tennisanlegg`
- `etne_tennisanlegg` skal få nøyaktig desse to people-lenkjene i batch 22
- batchtesten skal køyre frå `scripts/check-people.sh`
- batchen skal ikkje endre place-, story-, UI-, bilete- eller quizdata
