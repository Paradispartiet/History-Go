# History GO — faktisitetskontrakt

Status: **canonical**  
Eier: `factuality_and_source_verification_contract`  
Gjelder: alle brukerrettede fakta i History GO  
Sist kontrollert: **2026-08-20**

## 1. Absolutt grunnregel

> History GO skal aldri fylle inn, publisere eller presentere en opplysning fordi den virker sannsynlig, passer narrativet eller gjør profilen mer komplett.

Ingen produsent, agent, modell, importjobb eller runtime-komponent har lov til å dikte, gjette, interpolere eller presentere usikker informasjon som etablert fakta.

**En språkmodell er aldri en faktakilde.** Den kan hjelpe med struktur, språk og kontrollarbeid, men alle faktapåstander må komme fra kilder som kan åpnes, leses og etterprøves.

Dette gjelder blant annet:

- navn, identitet og navnevarianter;
- fødsels- og dødsdata;
- roller, titler, ansettelser og verv;
- utdanning og opplæring;
- verk, produksjoner, resultater og hendelser;
- årstall, datoer, perioder og rekkefølge;
- stedstilknytninger og koordinater;
- sitater, årsaksforklaringer og historisk betydning;
- arter, naturforekomster og geografisk utbredelse;
- quizfasit, svaralternativer og forklaringer;
- bilder, portrettidentitet og attribusjon.

Manglende informasjon skal forbli manglende. Et tomt eller utelatt felt er alltid bedre enn en oppdiktet eller uavklart opplysning.

## 2. Ingen absolutt feilfrihetsgaranti

History GO kan ikke love at mennesker, kilder eller systemer aldri gjør feil. Kontrakten lover i stedet en streng arbeidsmåte:

1. Vi skal aldri bevisst finne på innhold.
2. Vi skal aldri bruke gjetning som erstatning for research.
3. Vi skal aldri skjule usikkerhet bak sikker formulering.
4. Vi skal korrigere dokumenterte feil i canonical source-data, ikke bare i UI.
5. Vi skal være åpne om hva som ikke er verifisert.

En opplysning kan først behandles som publiserbar fakta når den er støttet av en inspectable kilde og passer kildens faktiske utsagn.

## 3. Kildekrav

Kilder prioriteres slik:

1. primærkilder, offentlige registre, arkiver og samtidige dokumenter;
2. institusjonens egne historikk-, samlings- eller produksjonsregistre;
3. faglig anerkjente oppslagsverk, kataloger og forskningspublikasjoner;
4. etablerte redaksjonelle medier og fagmedier;
5. andre kilder bare når opplysningen kan kryssjekkes mot mer autoritativ dokumentasjon.

Kilden må være inspectable: en reviewer skal kunne åpne den og finne støtte for opplysningen. En lenke til en generell forside er ikke dokumentasjon for en konkret påstand.

Antall kilder alene beviser ikke sannhet. Fire irrelevante lenker er svakere enn én kilde som direkte dokumenterer påstanden.

## 4. Påstand-for-påstand-regel

Hver brukerrettet faktapåstand skal kunne spores til kildegrunnlaget som ble brukt i produksjonen.

Dette betyr:

- en dato må støttes av en kilde som faktisk oppgir datoen;
- en rolle må støttes av en kilde som faktisk oppgir rollen;
- et verk eller en produksjon må støttes av katalog, program, database eller annen konkret dokumentasjon;
- en person–sted-kobling må støttes av dokumentert arbeid, opphold, rolle, verk, hendelse eller institusjonstilknytning;
- en årsaksforklaring eller vurdering må enten være kildebelagt eller tydelig merket som analyse;
- en kilde skal ikke strekkes lenger enn den faktisk sier.

`popupDesc`, `desc`, quizforklaringer og stories kan skrive sammen flere verifiserte fakta, men de kan ikke legge til nye detaljer gjennom språklig utfylling.

### 4.1 Virkelige personer som People- og oppgavemål

Virkelige historiske og offentlige personer kan være førsteklasses `People` i History GO og kildeforankrede profil-, kunnskaps-, quiz- og oppgavemål i Civication. Det endrer ikke faktakravet: identitet, profesjon, kronologi, verk, steder og andre påstander skal bygge på inspectable kilder og canonical People-data.

En virkelig person-record er **ikke** en fri NPC-persona. History GO og Civication skal derfor ikke opptre i personens navn med oppdiktet direkte dialog, e-post eller meldinger, private tanker eller motiver, fiktive relasjoner eller løpende NPC-drama. Slike narrative funksjoner skal legges til fiktive eller tydelig fiksjonaliserte karakterer som holdes adskilt fra factual People-data.

Faglig eller narrativ kontekst kan ikke utvide en persons dokumenterte profesjon. En person blir for eksempel ikke psykolog bare fordi vedkommende brukes i et psykologi-forløp. Tilsvarende skal person–sted-koblinger være kildebeviste og aldri utledes bare fordi et sted er tematisk relevant.

## 5. Forbudte produksjonsmåter

Følgende er alltid forbudt:

- å fylle ut manglende datoer fra et antatt tidsrom;
- å tilskrive en person en produksjon bare fordi vedkommende arbeidet ved institusjonen;
- å koble en person til et sted bare fordi forbindelsen virker naturlig;
- å gjøre en sekundær rolle større enn kildene viser;
- å lage plausible verkstitler, sitater, materialer, utdanningsløp eller resultater;
- å bruke en språkmodell som faktakilde;
- å bruke en annen History GO-tekst som eneste bevis for samme faktapåstand;
- å kopiere feil eller usikkerhet fra en kandidatrapport inn i canonical data;
- å merke en profil som verifisert bare fordi JSON, schema eller CI passerer;
- å bruke genererte bilder som portretter av virkelige personer.

## 6. Usikkerhet, uenighet og manglende data

Når kildene er uenige:

- ikke velg automatisk den mest detaljerte opplysningen;
- prioriter den mest autoritative og nærmeste kilden;
- dokumenter uenigheten i research- eller PR-materialet;
- utelat opplysningen fra appen når konflikten ikke kan løses;
- bruk en tydelig kvalifisering bare når usikkerheten i seg selv er faglig relevant og kildebelagt.

Når full dato, rolle, sted eller verk ikke kan dokumenteres, skal feltet utelates eller begrenses til den delen som faktisk er kjent. `ca.`, intervaller og usikre attribusjoner skal bare brukes når kildene selv gir grunnlag for dem.

## 7. Analyse versus fakta

History GO kan forklare betydning og sammenheng, men skal skille mellom:

- **dokumentert fakta** — direkte støttet av kilder;
- **kildebasert tolkning** — en forsiktig syntese av dokumenterte fakta;
- **usikker hypotese** — skal normalt ikke publiseres som brukerrettet innhold.

Tolkninger må ikke formuleres som sikre historiske hendelser. Formuleringer som «viser», «beviser», «førte til» og «var årsaken til» krever sterkere kildegrunnlag enn formuleringer som beskriver dokumenterte samtidigheter eller institusjonelle forbindelser.

## 8. Produksjonsgate

Før en innholdsbatch kan merges skal produsenten dokumentere:

1. hvilke canonical objekter som endres;
2. hvilke konkrete kilder som er lest;
3. hvilke faktapåstander kildene brukes til;
4. at navn, datoer, roller, verk, steder og relasjoner er kontrollert;
5. at kilden faktisk støtter formuleringen i appen;
6. hvilke kandidater eller detaljer som ble avvist som uverifiserte;
7. at ingen felt er fylt for å oppnå høyere readiness, dekning eller visuell fylde;
8. at canonical data, genererte indekser og rapporter er synkronisert.

En batch skal stoppes når kildedekningen er utilstrekkelig. Produksjonsmål, batchstørrelse og framdrift er alltid underordnet sannhet.

## 9. Readiness er ikke faktaverifikasjon

Teknisk eller redaksjonell completeness betyr ikke automatisk at innholdet er sant.

- Schema-validering beviser struktur, ikke fakta.
- En grønn test beviser det testen faktisk kontrollerer, ikke historisk korrekthet.
- En readiness-score måler feltdekning, ikke kildebevis.
- `verifiedAt` beviser bare at en kontroll er registrert, ikke at kontrollen var god nok.
- En kilde-liste beviser ikke at alle påstander støttes av kildene.

Derfor skal «complete», «green» eller «valid» aldri omtales som `source_verified` uten en egen faglig kildekontroll.

## 10. Korrigering av feil

Når en mulig feil oppdages:

1. stopp videre gjenbruk av opplysningen;
2. åpne og les kildene på nytt;
3. rett canonical source-data;
4. regenerer avledede indekser og rapporter;
5. oppdater tester når de har låst feil innhold;
6. dokumenter korrigeringen i PR-en;
7. søk etter samme feil i andre objekter.

Historiske feil skal ikke bevares av hensyn til stabilitet. Stabil ID og schema er viktig; feil faktainnhold skal korrigeres.

## 11. Ansvar

- `docs/FACTUALITY_CONTRACT.md` eier den overordnede faktisitets- og kildeverifikasjonsregelen.
- Fag-, place-, people-, quiz-, stories-, natur-, bilde- og koordinatkontrakter kan stille strengere lokale krav, men aldri svakere krav.
- Canonical source-data eier det publiserte innholdet.
- Rapporter og researchfiler er sporbarhet, ikke automatisk publiserbar sannhet.
- Runtime skal presentere canonical data uten å dikte fallbackinnhold.

Ved konflikt gjelder den strengeste regelen som beskytter faktisitet og sporbarhet.
