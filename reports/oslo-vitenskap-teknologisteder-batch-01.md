# Oslo Vitenskap: ekte teknologisteder – batch 01

Dato: 2026-07-26

## Beslutning

Teknologisteder produseres med **Vitenskap som primær kartkategori**. Teknologi er et faglig emne- og sekundærlag. Dette hindrer at ordinær byinfrastruktur feilaktig blir behandlet som teknologi.

Batchen etablerer en streng opptakskontrakt og et maskinlesbart kandidatregister. Den oppdaterer også det eksisterende stedet Norsk Teknisk Museum slik at den dokumenterte teknologidimensjonen er eksplisitt i stedets sekundærbadge, emner og underbadges.

## Godkjent kandidatsett

| Kandidat | Type | Beslutning | Neste produksjonstrinn |
| --- | --- | --- | --- |
| Norsk Teknisk Museum | Offentlig teknologimuseum | Eksisterende canonical sted, faglig beriket | Source brief, produksjonskontekst og lokal quiz |
| Bitraf | Aktivt makerspace og prototypeverksted | Godkjent | Coordinate Evidence v1, stedsfil og source brief |
| Tandbergs Radiofabrikk, Kjelsås | Historisk elektronikkfabrikk og forskningsanlegg | Godkjent | Coordinate Evidence v1, stedsfil og source brief |
| Radionettes fødested, Bygdøy allé 67 | Merket oppfinnelses- og etableringssted | Godkjent mikroplass | Bygnings-/skiltanker, Coordinate Evidence og mikroplassfil |
| STK Kabeltårnet | Historisk produksjonstårn for høyspentkabel | Godkjent | Eksakt tårngeometri, stedsfil og source brief |
| SINTEF MiNaLab | Aktivt laboratorium for mikrobrikkeutvikling og -fabrikasjon | Godkjent med tilgangskontroll | Offentlig inngangsanker og tilgangssikker stedstekst |

## Hvorfor stedene kvalifiserer

### Norsk Teknisk Museum

Teknologi og industrielle artefakter er en kjerne i institusjonens offentlige samlings- og formidlingsoppdrag. Museet har utstillinger knyttet til blant annet energi, industri, kjøretøy og informasjonsteknologi.

Kilder:
- https://www.tekniskmuseum.no/om-museet
- https://www.tekniskmuseum.no/museet/finnveien

### Bitraf

Bitraf er ikke et generisk kontorbygg. Det er et aktivt skaperverksted der elektronikk, maskinering, CNC-arbeid, laserskjæring, 3D-printing og prototyping gjennomføres i det dokumenterte verkstedet.

Kilder:
- https://bitraf.no/
- https://bitraf.no/hvor-er-bitraf/

### Tandbergs Radiofabrikk

Kjelsås-anlegget var et konkret produksjons-, laboratorie- og forskningssted for radio, båndopptakere, fjernsyn, profesjonell elektronikk og senere datateknologi. Den tidligere fabrikken er markert med et blått kulturhistorisk skilt.

Kilder:
- https://snl.no/Tandbergs_Radiofabrikk
- https://oslobyleksikon.no/side/Tandbergs_Radiofabrikk

### Radionettes fødested

Jan Wessel startet Radionette-produksjonen i bygningen i 1927. Stedet er knyttet til en konkret produktutviklingshistorie og er markert med blått skilt. Det kvalifiserer derfor som en teknologisk mikroplass, ikke som en generell boligadresse.

Kilder:
- https://oslobyleksikon.no/side/Radionette
- https://snl.no/Radionette
- https://www.oslobyesvel.no/blaaskilt

### STK Kabeltårnet

Tårnet ble reist for Standard Telefon og Kabelfabrikk og brukt ved framstilling av avanserte høyspentkabler. Det omkringliggende industrimiljøet produserte telekabler, telefonsentraler og elektronikk.

Kilder:
- https://magasin.oslo.kommune.no/byplan/kabelfabrikk-blir-kulturfabrikk
- https://snl.no/Standard_Telefon_og_Kabelfabrik

### SINTEF MiNaLab

MiNaLab driver Norges eneste uavhengige komplette linje for utvikling og fabrikasjon av mikrobrikker, med renrom, sensorer, prosessutvikling og småskalaproduksjon. Laboratoriet er teknologisk entydig, men stedskortet må ikke antyde fri adgang til adgangsbegrensede renrom.

Kilder:
- https://www.sintef.no/laboratorier/minalab/
- https://www.sintef.no/globalassets/upload/konsern/kjoreanvisninger/how-to-get-to-minalab.pdf

## Eksplisitte avgrensninger

Følgende er ikke teknologisteder etter kontrakten:

- Oslo S og Nationaltheatret stasjon: `by` → infrastruktur og mobilitet
- ordinære veier, tunneler, broer og transportknutepunkter
- Deichman Bjørvika: bibliotek og offentlig institusjon, ikke teknologistedsidentitet
- generelle forskningsparker og universitetsbygg uten et konkret teknologisk anker
- bygg som bare kvalifiserer fordi de bruker automasjon, sensorer eller digitale tjenester

## Repository-endringer

- Opprettet `data/fag/teknologi/TECHNOLOGY_PLACE_CONTRACT_V1.md`
- Opprettet `data/fag/teknologi/geographic/oslo_teknologisteder_candidates_v1.json`
- Beriket `teknisk_museum` uten å endre `category: "vitenskap"`
- La til canonical Teknologi-emner og `secondaryBadgeIds: ["teknologi"]` på Norsk Teknisk Museum

## Bevisst utsatt

Batchen oppretter ikke fem uverifiserte kartmarkører i ett steg. Nye stedsfiler krever repositoryets ordinære Coordinate Evidence v1-produksjon, manifest-/indeksrebuild og stedshelseporter. Kandidatregisteret låser først faktagrunnlaget, kategorigrensen og produksjonsrekkefølgen.
