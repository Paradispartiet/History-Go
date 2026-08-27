# History GO — canonical Objects-kontrakt

Status: **canonical object-production contract**  
Eier: `history_go_place_objects`  
Sist kontrollert: **2026-08-27**

Denne kontrakten eier hvilke fysiske gjenstander som kan bli canonical Objects hos et Place, hvordan de velges, og når Objects-samlingen skal holdes tilbake.

## 1. Grunndefinisjon

Et Object er en fysisk, identifiserbar gjenstand med dokumentert tilknytning til det konkrete stedet. Gjenstanden må ha en egen historisk funksjon eller forklaringsverdi og kunne vises med et bilde av selve gjenstanden.

Observasjonstekst, bygningsdeler uten selvstendig objektidentitet, generiske illustrasjoner og løse temaord er ikke Objects.

## 2. Hovedfunksjonen og kategorien styrer utvalget

Objects-utvalget skal først forklare stedets primære eller mest karakteristiske funksjon. Et kjent sidespor får ikke dominere fordi personen, verket eller bildet er enklere å finne.

For et industri- eller produksjonssted undersøkes kandidatene i denne rekkefølgen:

1. former, støpeverktøy, matriser og annet produksjonsverktøy;
2. maskiner og dokumentert produksjonsteknologi;
3. veie-, måle-, laboratorie- og kvalitetsutstyr;
4. emballasje-, håndterings-, lager- og distribusjonsutstyr;
5. representative fysiske produkter eller emballasjegjenstander når de er stedsspesifikke;
6. stedsspesifikt verneutstyr, arbeidsklær eller arbeidsredskaper.

Listen er en researchrekkefølge, ikke en kvote. Hvert medlem må dokumenteres selvstendig.

Andre kategorier bruker tilsvarende hovedfunksjonsstyrte kandidatfamilier:

| Kategori | Prioriterte Object-familier |
| --- | --- |
| By | skilt, byinventar, lykter, fontener, modeller og monumentobjekter |
| Historie | artefakter, dokumenteksemplarer, redskaper, faner og personlige eiendeler |
| Kunst | kunstnerverktøy, materialgjenstander, arbeidsmodeller og katalogobjekter |
| Litteratur | manuskripter, brev, skrivemaskiner, skrivebord og konkrete bokeksemplarer |
| Media | presser, kameraer, mikrofoner, sendere og fysiske aviseksemplarer |
| Musikk | instrumenter, lydutstyr, sceneutstyr, kostymer og billetter |
| Næringsliv | maskiner, former, verktøy, emballasje, produkter og butikk-/kontorutstyr |
| Politikk | valgurner, faner, segl, kampanjemateriell og dokumenteksemplarer |
| Psykologi | testutstyr, skjemaer, forsøksapparater og terapiredskaper |
| Helse | instrumenter, behandlingsutstyr, medisinemballasje og uniformer |
| Utdanning | læremidler, pulter, laboratorieutstyr, diplomer og bokeksemplarer |
| Religion | ritualgjenstander, tekstiler, relikvier, klokker og liturgiske bøker |
| Scenekunst | rekvisitter, kostymer, scenemodeller, teatermaskineri og billetter |
| Sport | sportsutstyr, drakter, pokaler, billetter og tidtakingsutstyr |
| Subkultur | klær, merker, fanziner, instrumenter, brett og sceneutstyr |
| Vitenskap | instrumenter, prøver, modeller, prototyper og laboratoriebøker |
| Filosofi | manuskripter, brev, annoterte bøker og forelesningsmateriale |
| Film og TV | kameraer, rekvisitter, kostymer, scenografimodeller og fysiske manuskripter |

Natur bruker den faste Map/Flora/Fauna/Destinations-profilen og har ikke ordinær Objects-samling.

## 3. Riktig entity-eier

| Kandidat | Canonical eier |
| --- | --- |
| Person | People |
| Navngitt bygg eller fast anlegg | Structures |
| Kunstverk, bok, sang, film, forestilling eller utgivelse som verk | Kategoriuttrykk/Productions, eller stedets kulturfortelling når verket er sekundært |
| Logo, ordmerke eller kvalifisert virksomhetsidentitet | Brands |
| Et annet canonical sted | Relasjonssystemet; aldri PlaceCard-samling |
| Detalj, fysisk spor eller observasjon uten selvstendig objektidentitet | Stedets detalj-/tolkningsflate |
| Fysisk, identifiserbar og stedsspesifikk gjenstand | Objects |

Samme entity skal ikke dupliseres mellom Objects og en annen samling. Et fysisk eksemplar og det abstrakte verket, metoden eller hendelsen er likevel forskjellige entities: et instrument er Object og sangen en produksjon; en valgurne er Object og valget en politisk hendelse; kunstnerverktøyet er Object og kunstverket hører i Kunstverk.

## 4. Samlingskoherens

Objects skal normalt bestå av minst to tydelig forskjellige, representative gjenstander som til sammen danner en forståelig gruppe. Ett enkelt Object kan bare bære samlingen når det er et dokumentert signaturobjekt for stedets hovedfunksjon; unntaket skal begrunnes i arbeidskortet.

Et enkelt pent bilde, en tilfeldig bevart gjenstand eller et taksonomisk mulig medlem er ikke nok. Når kandidatgruppen ikke består, føres Objects som source-bounded holdback og ordinær fullproduksjon forblir blokkert. Objects utelates ikke fra en ordinær fullprofil, og mangelen kan ikke løses med et sekundært kulturspor eller en annen samlingstype.

## 5. Minimumsevidens per Object

Arbeidskortet og dataene skal dokumentere:

- canonical identitet, objekttype og fysisk avgrensning;
- historisk funksjon;
- presis grunn til at gjenstanden tilhører dette stedet;
- datering eller ærlig dateringspresisjon;
- hvor gjenstanden finnes eller hva som er dokumentert om statusen;
- kilde-URL-er som dekker identitet, funksjon og stedstilknytning;
- lokalt medlemsbilde med proveniens, lisens og utsnitt;
- kontroll mot People, Structures, kategoriuttrykk/Productions, Brands og relasjonssystemet.

Previewet skal vise den faktiske gjenstanden. Stedets `frontImage`, et kunstnerportrett eller et generisk miljøbilde er ikke et ferdig Object-preview.

## 6. Arbeidskort

For hvert sted føres:

```text
OBJECTS-HOVEDFUNKSJON:
OBJECTS-KANDIDATFAMILIER:
OBJECTS-AKSEPTERT:
OBJECTS-HOLDT TILBAKE + GRUNN:
OBJECTS-KILDER/BILDER:
OBJECTS-EIERKONTROLL:
OBJECTS-SAMLINGSSTATUS — PRODUSER / SOURCE-BOUNDED HOLDBACK / BLOCKED:
```

`SOURCE-BOUNDED HOLDBACK` betyr at publiserbar medlemsevidens ennå ikke er tilstrekkelig. Det skal ikke maskeres som `BEGRUNNET N/A`, og samlingen skal ikke fylles med et sekundært tema. Et ordinært fullprodusert Place kan ikke closeoutes mens Objects står i holdback.

## 7. Freia-fabrikken som mønstereksempel

Freia-fabrikkens Objects-research skal prioritere sjokoladeformer, produksjons- og pakkemaskiner, veie-/kvalitetsutstyr og annet dokumentert fabrikkutstyr. Dette er kandidatkategorier, ikke godkjente objekter før hvert medlem har stedsspesifikke kilder og publiserbart medlemsbilde.

Edvard Munch og Freiafrisen er et legitimt kultur- og velferdsspor i historien om Freiasalen. De skal ikke være fabrikkstedets primære People-/Objects-utvalg. Freiasalen og Freiaparken eies av Structures; Freias ordmerke og kvalifiserte produktidentiteter eies av Brands.

Freias fullprofil er People, Objects, Brands og Structures. Objects skal produseres fra dokumenterte sjokoladeformer, produksjons-/pakkemaskiner, veie-/kvalitetsutstyr, historisk emballasje og konkrete Freia-produkter. Den fysiske emballasjen eller produktenheten er Object; Freia- eller produktidentiteten er Brand.
