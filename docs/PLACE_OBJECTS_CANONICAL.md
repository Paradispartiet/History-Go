# History GO — canonical Objects-kontrakt

Status: **canonical object-production contract**  
Eier: `history_go_place_objects`  
Sist kontrollert: **2026-08-27**

Denne kontrakten eier hvilke fysiske gjenstander som kan bli canonical Objects hos et Place, hvordan de velges, og når Objects-samlingen skal holdes tilbake.

## 1. Grunndefinisjon

Et Object er en fysisk, identifiserbar gjenstand med dokumentert tilknytning til det konkrete stedet. Gjenstanden må ha en egen historisk funksjon eller forklaringsverdi og kunne vises med et bilde av selve gjenstanden.

Observasjonstekst, bygningsdeler uten selvstendig objektidentitet, generiske illustrasjoner og løse temaord er ikke Objects.

## 2. Hovedfunksjonen styrer utvalget

Objects-utvalget skal først forklare stedets primære eller mest karakteristiske funksjon. Et kjent sidespor får ikke dominere fordi personen, verket eller bildet er enklere å finne.

For et industri- eller produksjonssted undersøkes kandidatene i denne rekkefølgen:

1. former, støpeverktøy, matriser og annet produksjonsverktøy;
2. maskiner og dokumentert produksjonsteknologi;
3. veie-, måle-, laboratorie- og kvalitetsutstyr;
4. emballasje-, håndterings-, lager- og distribusjonsutstyr;
5. representative fysiske produkter eller emballasjegjenstander når de er stedsspesifikke;
6. stedsspesifikt verneutstyr, arbeidsklær eller arbeidsredskaper.

Listen er en researchrekkefølge, ikke en kvote. Hvert medlem må dokumenteres selvstendig.

## 3. Riktig entity-eier

| Kandidat | Canonical eier |
| --- | --- |
| Person | People |
| Navngitt bygg eller fast anlegg | Structures |
| Kunstverk, bok, sang, film, forestilling eller utgivelse | Productions/Works, eller stedets kulturfortelling når verket er sekundært |
| Logo, ordmerke eller kvalifisert virksomhetsidentitet | Brands |
| Et annet canonical sted | Related |
| Detalj, fysisk spor eller observasjon uten selvstendig objektidentitet | Stedets detalj-/tolkningsflate |
| Fysisk, identifiserbar og stedsspesifikk gjenstand | Objects |

Samme entity skal ikke dupliseres mellom Objects og en annen samling.

## 4. Samlingskoherens

Objects skal normalt bestå av minst to tydelig forskjellige, representative gjenstander som til sammen danner en forståelig gruppe. Ett enkelt Object kan bare bære samlingen når det er et dokumentert signaturobjekt for stedets hovedfunksjon; unntaket skal begrunnes i arbeidskortet.

Et enkelt pent bilde, en tilfeldig bevart gjenstand eller et taksonomisk mulig medlem er ikke nok. Når kandidatgruppen ikke består, utelates Objects fra `place_card_profile` og føres som source-bounded holdback. Et fullført adaptivt Place kan derfor ha færre samlinger uten å være uferdig.

## 5. Minimumsevidens per Object

Arbeidskortet og dataene skal dokumentere:

- canonical identitet, objekttype og fysisk avgrensning;
- historisk funksjon;
- presis grunn til at gjenstanden tilhører dette stedet;
- datering eller ærlig dateringspresisjon;
- hvor gjenstanden finnes eller hva som er dokumentert om statusen;
- kilde-URL-er som dekker identitet, funksjon og stedstilknytning;
- lokalt medlemsbilde med proveniens, lisens og utsnitt;
- kontroll mot People, Structures, Productions/Works, Brands og Related.

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
OBJECTS-SAMLINGSSTATUS — PRODUSER / SOURCE-BOUNDED HOLDBACK / BEGRUNNET N/A:
```

`SOURCE-BOUNDED HOLDBACK` betyr at Objects er relevant, men at publiserbar medlemsevidens ennå ikke er tilstrekkelig. Det skal ikke maskeres som `BEGRUNNET N/A`, og samlingen skal ikke fylles med et sekundært tema.

## 7. Freia-fabrikken som mønstereksempel

Freia-fabrikkens Objects-research skal prioritere sjokoladeformer, produksjons- og pakkemaskiner, veie-/kvalitetsutstyr og annet dokumentert fabrikkutstyr. Dette er kandidatkategorier, ikke godkjente objekter før hvert medlem har stedsspesifikke kilder og publiserbart medlemsbilde.

Edvard Munch og Freiafrisen er et legitimt kultur- og velferdsspor i historien om Freiasalen. De skal ikke være fabrikkstedets primære People-/Objects-utvalg. Freiasalen og Freiaparken eies av Structures; Freias ordmerke eies av Brands.

Inntil en sammenhengende gruppe produksjonsgjenstander består denne kontrakten, vises Freia med People, Brands og Structures, mens Objects står som source-bounded holdback.
