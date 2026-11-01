# Oslo sentrum – bolk 05: stedstekst og kildegrunnlag (Stage A)

**Dato:** 1. november 2026  
**Produksjonsrekkefølge:** (1) kildeført tekst og redaksjonell kontroll → (2) rettighetsklarerte bilder/utsnitt → (3) fullquiz, QuizCard, Knowledge og appgodkjenning.  
**Status:** seks **tekstutkast**, ikke aktiv v1-leveranse. Eksisterende canonical ID-er, koordinater, kategorier og andres Oslo-bolker er urørt. Ingen bilder eller quizfasiter er oppfunnet.

## Innledende preflight mot gjeldende `main`

| Canonical Place | Kategori | Kildesti på main | Mangel per 1.11.2026 |
|---|---|---|---|
| `folketeateret` | scenekunst | `data/places/scenekunst/oslo/places_scenekunst/folketeateret.json` | Kort desc/popup, mangler image/frontImage/cardImage og Fagverk; quizfil registrert – **må leses før ny quiz** |
| `kunstnernes_hus` | kunst | `data/places/kunst/oslo/places_kunst/kunstnernes_hus.json` | Kort desc/popup, mangler bilder, Fagverk og aktiv quizmanifest-binding |
| `historisk_museum` | historie | `data/places/historie/oslo/places_historie/historisk_museum.json` | Eksisterende historisk tekst, men mangler bilder, Fagverk og aktiv quizmanifest-binding |
| `ibsen_museum_teater` | litteratur | `data/places/litteratur/oslo/places_litteratur/ibsen_museum_teater.json` | Historisk tekst finnes; mangler bilder, Fagverk og aktiv quizmanifest-binding |
| `blitzhuset` | subkultur | `data/places/subkultur/oslo/places_subkultur/blitzhuset.json` | Kort desc/popup, mangler bilder, Fagverk og aktiv quizmanifest-binding |
| `kulturkirken_jakob_litteratur` | musikk | `data/places/musikk/oslo/places_musikk/kulturkirken_jakob_litteratur.json` | Betydelig eksisterende tekst, bilde og kuratert Fagverk **bevares**; mangler frontImage/cardImage og aktiv quizmanifest-binding |

Denne oversikten beskriver bare kontrollerte felter og manifestkoblinger, **ikke** full kilde-, bilde-, People- eller v4.2-preflight. Folketeaterets eksisterende quizfil skal ikke erstattes uten systematisk audit. Kulturkirken Jakobs eldre litteraturfil er bevisst avregistrert i tidligere PR-er (#5994–#5997): ikke gjenopprett den eller flytt primærkategori.

---

## 1. Folketeateret — `folketeateret`

### Foreslått `desc`
Folketeateret var først kino, deretter taleteater og i nesten femti år hjem for Den Norske Opera. Bak scenen ligger også historien om arbeiderbevegelsens store Folketeaterbygning: et hus skapt for både offentlig kultur og organisasjonsliv. I dag er scenen særlig knyttet til musikaler.

### Foreslått `popupDesc`
Folketeateret ligger inne i Folketeaterbygningen mellom Storgata og Youngstorget. Huset var mer enn en teatersal: da det ble tatt i bruk på 1930-tallet, flyttet både Arbeiderpartiet, aviser, forlag og organisasjoner fra arbeiderbevegelsen inn. Kontorene og passasjen gjennom bygningen knyttet arbeidsliv, politikk og kultur til samme byrom.

Planen om et folketeater hadde røtter i ønsket om å gjøre scenekunst tilgjengelig for flere. Men økonomiske og politiske konflikter gjorde at teaterdriften ikke kom i gang da bygningen sto ferdig. Salen åpnet i stedet som kinoen Verdensteatret i 1935. Først i 1952 kunne Folketeatret åpne som egen teaterscene. Den historien minner oss om at et kulturbygg kan være ferdig lenge før den opprinnelige planen blir virkelighet.

Fra 1959 ble scenen hjem for Den Norske Opera, som holdt til her frem til flyttingen til Bjørvika i 2008. Etter ombygging ble lokalene gjenåpnet som musikalscene i 2009. Slik kan ett og samme rom fortelle om endringer i publikums ønsker, økonomi, teaterformer og hvordan byen bruker sine kulturhus.

Ser du mot Youngstorget, møter du Folketeaterbygningens politiske historie; går du inn i passasjen, møter du teaterets egen historie. Bygningen, institusjonene og forestillingene må ikke blandes sammen, selv om de deler adresse.

### Dokumenterte kilder og kontrollpåstander
- Oslo byleksikon, [Folketeatret](https://oslobyleksikon.no/side/Folketeatret): kino i 1935, teater fra 1952, opera, musikalscene og lokalisering.
- Oslo byleksikon, [Folketeaterbygningen](https://oslobyleksikon.no/side/Folketeaterbygningen): bygningens arkitekter, arbeiderbevegelsens bruk og passasjen.
- **Redaksjonell grense:** skille Folketeateret (scene) fra Folketeaterbygningen (bygg) og Arbeidersamfunnets plass (egen canonical Place).

### Fagverk og quizretning
Fagverk: kulturpolitikk og publikumsadgang; ombruk av en scene; institusjonens plass i byens arbeidermiljø. Spørsmål bør knytte årsak og funksjon til sal, passasje og endrede bruksformer – ikke en rekke isolerte premieredatoer.

---

## 2. Kunstnernes Hus — `kunstnernes_hus`

### Foreslått `desc`
Kunstnernes Hus ved Slottsparken ble bygd som kunstnernes eget utstillingssted og åpnet med Høstutstillingen i 1930. Bak fasaden ligger historien om kunstnerstyrt offentlighet, internasjonale utstillinger og en bygning formet for kunst. Løvene ved inngangen og maleriet i trappen er spor av denne ambisjonen.

### Foreslått `popupDesc`
Kunstnernes Hus ble til gjennom kunstnernes ønske om en permanent arena for utstillinger og faglig fellesskap. Etter en arkitektkonkurranse i 1928 ble forslaget til Gudolf Blakstad og Herman Munthe-Kaas valgt. Byggearbeidet startet året etter, og huset åpnet med Høstutstillingen i 1930. Det ga kunstnerne egne rom i et Oslo der nye kunstuttrykk og internasjonale forbindelser var viktige diskusjonstemaer.

Bygningen ble utformet for å vise kunst, ikke bare for å oppbevare den. Overlyssalene ga utstillingene et spesielt lys; huset hadde også undervisningsrom for Statens Kunstakademi. Før publikum går inn, møter de to bronseløver av Ørnulf Bast. I trappehallen ligger et annet spor: Per Krohgs store takmaleri, laget som en fortelling om kunstnerens arbeid og utvikling.

Historien handler samtidig om hvilke verk og kunstnere som får plass i offentligheten. Kunstnernes Hus viste blant annet internasjonal modernisme på 1930-tallet, og Picassos «Guernica» ble vist i Oslo i 1938. Under den tyske okkupasjonen ble bygningen beslaglagt i 1942; kunsten og institusjonen mistet da sine egne rom. Etter krigen fortsatte huset som arena for norske og internasjonale kunstdebatter.

Når vi ser på fasaden, løvene og trappen i dag, møter vi ikke bare arkitektur, men en institusjon som ble skapt for å gjøre kunst synlig og diskutert. Hvem velger ut kunsten, hvem slipper til, og hvem er utstillingen for?

### Dokumenterte kilder og kontrollpåstander
- Kunstnernes Hus, [Vår historie](https://kunstnerneshus.no/om/historie): konkurransen, arkitekter, åpningen, løvene, Krohgs maleri, internasjonale utstillinger og beslagleggelsen.
- **Redaksjonell grense:** kunsten kan omtales som historiske utstillinger, men ikke som verk som fremdeles finnes utstilt i huset.

### Fagverk og quizretning
Fagverk: kunstinstitusjon og juryering; rom/lys/arkitektur; okkupasjon og fri kunst. Bruk observerbare spor: løvene, trappeløpet og fasaden. Ikke gjør spørsmålene til årstallsprøver.

---

## 3. Historisk museum — `historisk_museum`

### Foreslått `desc`
Historisk museum på Tullinløkka er et museum som også forteller historie gjennom selve bygningen. Arkitekt Henrik Bull ga den en jugendpreget form med ornamenter og rom som skulle oppleves som en helhet. Bygningen sto ferdig før museet åpnet i 1904, og viser hvordan nasjonal identitet og nye kunstformer møttes.

### Foreslått `popupDesc`
Historisk museum ligger på Tullinløkka mellom byens universitets- og kulturinstitusjoner. Bygningen ble til i en tid da museer ikke bare skulle samle gjenstander, men også formidle forestillinger om historie, kunst og nasjonen. Den gir derfor to fortellinger samtidig: om utstillingene innenfor veggene og om hva bygningen skulle uttrykke utad.

Arkitekten Karl August Henriksen hadde vunnet den opprinnelige konkurransen, men døde før byggearbeidet kom i gang. Oppdraget gikk videre til Henrik Bull, som også arbeidet med Nationaltheatret. Museet sto ferdig i 1902 og åpnet for publikum i 1904. Bull kombinerte internasjonal jugendstil med referanser som skulle gi besøkende en opplevelse av norsk historie.

Jugendpreget viser seg blant annet i inngangspartiet og detaljene i fasaden. Når du står foran museet, kan du spørre hvordan utsmykningen forsøker å påvirke måten en besøkende møter historien på. Bygningen er ikke en nøytral eske for samlinger; arkitekturen var selv del av formidlingen.

Et museum arbeider med tolkning. Gjenstander fra tidligere samfunn får ny mening når de stilles ut sammen, gis tekster og settes inn i historiske fortellinger. Derfor må en skille mellom det en gjenstand faktisk kan dokumentere, og den større historien museet bygger rundt den. Historisk museum er et godt sted å undersøke akkurat dette skillet.

### Dokumenterte kilder og kontrollpåstander
- Universitetet i Oslo / Historisk museum, [Historien til museumsbygget](https://www.historiskmuseum.no/om-museet/om-bygningane/index.html): 1902/1904, Karl August Henriksen, Henrik Bull og arkitektur.
- **Redaksjonell grense:** unngå å påstå at bestemte museumsgjenstander er utstilt nå uten eget, datert utstillingsbevis.

### Fagverk og quizretning
Fagverk: museumsformidling; stilhistorie og offentlig arkitektur; kilde versus tolkning. Spørsmål om bygg og utstillinger skal holdes adskilt.

---

## 4. IBSEN Museum & Teater — `ibsen_museum_teater`

### Foreslått `desc`
Bak døren til Ibsens leilighet i Arbins gate 1 møter vi det private livet til en forfatter med et verdensomspennende teaterpublikum. Henrik og Suzannah Ibsen bodde her fra 1895. Leiligheten er senere tilbakeført og inngår nå i IBSEN Museum & Teater, med inngang knyttet til Henrik Ibsens gate 26.

### Foreslått `popupDesc`
I hjørnegården ved Arbins gate bodde Henrik Ibsen de siste elleve årene av sitt liv sammen med Suzannah Ibsen. Familien flyttet inn i 1895, etter Ibsens mange år i utlandet. Her ble leiligheten et hjem, arbeidssted og møtepunkt mellom privat hverdag og en allerede internasjonalt kjent dramatikers offentlige liv.

Ibsens arbeidsværelse står sentralt i museets fortelling. Her arbeidet han med sene skuespill, blant annet «John Gabriel Borkman» og «Når vi døde vågner». At et arbeidsrom kan bevares, er ikke det samme som at vi kan lese alle forfatterens tanker ut av møblene. Rommet gir materielle spor av arbeidslivet hans, mens tekstene og andre samtidige kilder må brukes for å forstå dramatikken.

Museet ble bygget opp gjennom et langvarig arbeid for å ta vare på leiligheten og inventaret. Norsk Folkemuseum overtok ansvaret, og publikum fikk tilgang til en tilbakeført leilighet i 1994. Senere restaureringer og ombygginger har endret museets formidling. Etter et nytt ombyggingsarbeid ble stedet gjenåpnet som IBSEN Museum & Teater i 2022.

Bygningens adressehistorie kan være forvirrende: den historiske leiligheten er Arbins gate 1, mens dagens museumsadresse oppgis som Henrik Ibsens gate 26. Det er ikke to ulike Ibsen-hjem. Ved å gå mellom huset, fortauet og nærområdet kan en undersøke hvordan en forfatters liv blir gjort til kulturarv i byen.

### Dokumenterte kilder og kontrollpåstander
- Oslo byleksikon, [Ibsenmuseet](https://oslobyleksikon.no/side/Ibsen-museet): adressene, Ibsen og Suzannah, museumshistorie, åpning og ombygging.
- Norsk Folkemuseum, [IBSEN Museum & Teater](https://stillinger.norskfolkemuseum.no/locations/ibsen-museum-teater): museumsansvar, hjemmet og ombruk.
- **Redaksjonell grense:** museet er ikke identisk med Henrik Ibsen som personprofil; eksisterende People-anker skal bevares.

### Fagverk og quizretning
Fagverk: litterært arbeidssted; gjenstand og autentisitet; musealisering og Ibsens dramatiske etterliv. Spørsmål om årsak, tolkning og autentiske spor, ikke fødsels-/dødsår.

---

## 5. Blitzhuset — `blitzhuset`

### Foreslått `desc`
Blitzhuset i Pilestredet er et selvstyrt ungdoms- og kulturhus med røtter i husokkupasjonene tidlig på 1980-tallet. Her har kafé, konserter, øvingsrom og radio vært del av et politisk og kulturelt miljø. Historien handler om hvem som får bruke byen, og hvordan uenighet om byrom og eiendom blir synlig.

### Foreslått `popupDesc`
Blitzhuset har røtter i ungdommenes okkupasjon av Skippergata 6 i 1981–82. Etter strid om lokaler inngikk miljøet en avtale med Oslo kommune om å bruke en kommunal bygård i Pilestredet. Dermed fikk en del av Oslos alternative musikk- og aktivistmiljø en fast adresse.

Blitz er ikke bare navnet på en gruppe eller et politisk standpunkt. I huset har det vært kafé, øvingslokaler, konsertscene, kvinnekulturvirksomhet og RadiOrakel. Disse funksjonene viser hvordan rom, frivillig arbeid og medieproduksjon kan gjøre det mulig å bygge et miljø utenfor de vanlige kommersielle kulturarenaene.

Stedets historie rommer også uenighet. Kommunen, naboer, aktivister og andre har gjennom årene diskutert støy, støtteordninger, politiske aksjoner og retten til å bruke bygget. Et vedtak om riving i 1990 ble møtt med protester. I 2000 ble det lagt til rette for fortsatt bruk som brukerstyrt ungdomshus. Bygningen ble rehabilitert, og kafévirksomheten ble gjenåpnet i 2009.

Når du står ved huset, kan du undersøke hvordan fasade, inngang og bruken av lokalene uttrykker en annen kulturhistorie enn de store institusjonene. Blitz forteller om motkultur, men også om forhandlinger med kommunen og om vedlikehold av et hus som fellesskapsarena. En historisk framstilling må skille dokumentert drift fra samtidens uenighet om politiske metoder og virkninger.

### Dokumenterte kilder og kontrollpåstander
- Oslo byleksikon, [Blitz](https://oslobyleksikon.no/side/Blitz): Skippergata, avtalen, lokaler, debatt, rivingsforslag, videre drift.
- Oslo byleksikon, [Pilestredet](https://oslobyleksikon.no/index.php?title=Pilestredet): bygnings-/adressekontekst og historisk utvikling.
- **Redaksjonell grense:** oppfør uenige samtidsperspektiver med kilde, unngå ukritiske generaliseringer om aktivister, naboer og politisk vold. Kontroller oppdatert nummerering av Pilestredet før stedskort godkjennes.

### Fagverk og quizretning
Fagverk: subkultur og infrastruktur; offentlig/kommunalt rom og konflikt; alternativ musikk- og medieproduksjon. Ingen ideologiske fasitsvar. Quiz skal teste dokumenterbare hendelser og strukturer.

---

## 6. Kulturkirken Jakob — `kulturkirken_jakob_litteratur`

### Foreslått `desc`
Kulturkirken Jakob i Hausmanns gate ble reist som sognekirke, men fant nytt liv som konsert-, kultur- og arrangementssted. Kirkerommet fra 1880 viser hvordan den samme arkitekturen kan brukes til andre typer fellesskap når byen endrer seg. Kirken har fortsatt også religiøs bruk.

### Foreslått `popupDesc`
Kulturkirken Jakob ligger ved det tidligere Ankertorget. Den nygotiske kirken sto ferdig i 1880, med spissbuer og teglarkitektur som ga bygningen et tydelig kirkelig uttrykk. I mange år var den sognekirke for Jakob menighet. Senere endret både befolkningsmønster og behovene i byen seg, og menigheten ble nedlagt i 1985.

I stedet for at bygningen bare skulle stå som et monument over en tidligere funksjon, fikk den en ny rolle. Fra 2000 ble den etablert som Kulturkirken Jakob. Kirkelig Kulturverksted flyttet inn med konserter, forestillinger, utstillinger og innspillingsvirksomhet. Samtidig har kirken fortsatt vært brukt til kirkelige handlinger. Det er et eksempel på ombruk der nye aktiviteter tar plass uten at alle spor etter den gamle funksjonen forsvinner.

Kirkerommet har høyde, lys og akustikk som preger publikums opplevelse. Men et roms virkning kan ikke forklares bare med arkitektur; lydanlegg, musikere, publikum og type arrangement er også viktige. Det gjør Kulturkirken Jakob til et godt sted å spørre hvordan en bygning kan skifte kulturell betydning.

Plassen utenfor fikk i 2011 navnet Ingrid Bjerkås' plass, etter Norges første kvinnelige prest. Navnevalget legger enda et lag til historien om religion, likestilling og offentlig kultur i Oslo.

### Dokumenterte kilder og kontrollpåstander
- Oslo byleksikon, [Kulturkirken Jakob](https://oslobyleksikon.no/side/Jakob_kirke): 1880, 1985, 2000, Kirkelig Kulturverksted og navngiving.
- **Vern:** canonical ID beholdes; primærkategori `musikk`, kunst som sekundært perspektiv. Ikke gjenopprett gammel litteraturquiz eller lag ny parallell Place.

### Fagverk og quizretning
Eksisterende kuratert Fagverk skal kontrolleres og forbedres **bare ved dokumenterte avvik**, ikke omskrives ukritisk. Quiz: ombruk av kulturbygninger, lydrom/konsertproduksjon og byens offentlige minner – ikke generisk religionsquiz eller årstallspugging.

---

## Før neste produksjonstrinn

1. **Kilde-/påstandsrevisjon av alle seks tekster** mot de oppgitte kildene og eksisterende canonical Place. Dette er tekstutkast, ikke signert publiseringsgrunnlag. Ved motstrid skal original kildeavvik stå dokumentert.
2. Deretter bilde-/rettighetsproduksjon for sted, stående PlaceCard og QuizCard; kontroller at foto viser riktig bygning/tid, med lisens og kilde. Ingen arkivfoto presenteres som nåtid.
3. Først etter kilde- og bildeport: fullquiz (eksisterende quiz auditeres før gjenbruk), 10-spørsmåls QuizCard, Knowledge, Fagverk, source brief, v4.2, preflight og faktisk 390/1440-px app-QA.
4. Andre kontoens **Oslo-bolk 04 (#6553–#6570)**, Kvadraturen (#6578), og eksisterende sentrumsspor (#6579, #6586, #6622) berøres ikke. Ingen nye Place-ID-er og ingen endring av felles validatorer for å få grønne tester.

**Konklusjon:** Stage A er et konkret, avgrenset kilde-/tekstgrunnlag for seks eksisterende sentrumsteder; **0/6 nye steder er v1-godkjent av denne PR-en.**
