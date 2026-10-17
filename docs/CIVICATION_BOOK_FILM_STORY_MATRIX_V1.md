# Civication – Goodreads × IMDb × Film Producer: historieplan og synopsismatrise v1

**Oppdatering 17. oktober (etter opprinnelig v1-status):** Alle 24 typenes primære bokkandidater er nå kontrollert mot den private kuraterte arbeidsboken med 159 Goodreads-verk. Korrekt felt er `goodreads_primary` i [dataregisteret](../data/Civication/lifestory/editorial/storyInspirationCoverageV1.json); `literary_inspiration.work` er fremdeles en selvstendig klassiker-/tradisjonsreferanse som **ikke** er kontrollert som Goodreads-medlem. IMDb og Film Producer er koblet fra før. De første åtte har fått [kildeforankret produksjonsbolk A](CIVICATION_SOURCE_GROUNDED_WAVE_A_V1.md), ikke spillbare scener. Tidligere «0 verifiserte» nedenfor gjelder **den opprinnelige registreringen før denne oppdateringen**, ikke nåstatus.

**Skjema først:** Bruk [produksjonsstandarden og de fire dataskjemaene](CIVICATION_BOOK_FILM_STORY_SCHEMAS_V1.md) før videre historieforfatting. Denne 24-raders matrisen er en **kandidatbank**, ikke et godkjent sett av rollespesifikke blueprints. Faktisk status for kilder, roller og spillbarhet står i [dekningsregisteret](../data/Civication/lifestory/editorial/inspiration/storyCoverageInventoryV1.json).

**Status 17. oktober 2026:** Redaksjonell produksjonsplan, ikke publiserte spillscener. Kartleggingen er delvis utført: 24 samtidige fortellingstyper (`C01–C24`), 24 litterære spor (`L01–L24`) og 7 mulige plottlinser (`P01–P07`) finnes allerede i `narrativeCrosswalkV1.json`. Her får **alle 24 C-typer** et konkret synopsisutkast og en sporbart knyttet film fra Film Producers 161-filmers IMDb-grunnlag. Verken Goodreads-importen eller direkte rolle-/spillerstate-binding for disse 24 utkastene er bekreftet.

## Kildene og regelen vi har avtalt

- **Bøker / Goodreads:** kun titler faktisk merket `read` med personlig vurdering minst 4. Eksisterende importskript filtrerer slik, fjerner private rating-, notat- og dato-felt og sender barne- og ungdomsbøker til separat spill. Arbeidene i tabellen nedenfor er **litterære inspirasjonskandidater fra eksisterende crosswalk**, ikke bekreftede Goodreads-treff. Match først mot kanonen; erstatt eller suppler kandidaten hvis den ikke oppfyller utvalget. Ikke legg personlig Goodreads-rangering i dette offentlige registeret.
- **Filmer / IMDb:** Film Producer har den faktiske `imdb_ls000064637`-listen med 161 titler; `film_scenarios_seed.json` inneholder IMDb-ID og ett produksjonsscenario per film. Disse scenariene er fremdeles importerte seeds med eget behov for filmspesifikk berikelse. Filmenes tematiske bruk her er en **redaksjonell tolkning**, ikke kvalitetssikret analyse fra Film Producer.
- **History Go:** personer, steder og verk forblir felles kanon; Film Producer og Skrivekunstakademiet er selvstendige spill. Civication skriver **egne originale** livsfortellinger og lenker til referanser, ikke gjenbrukte scener eller produksjonssimulering.

## Synopsis-ID og de tre kildene

[Direkte koblingsregister for synopsisene](../data/Civication/lifestory/editorial/inspiration/synopsisThreeSourceLinksV1.json) oppgir for hver C01–C24 **Goodreads-kandidat, IMDb-ID og Film Producer-scenario-ID** i ett samlet datasett, med tre uavhengige statusfelt. [Koblingsskjemaet](../data/Civication/lifestory/editorial/inspiration/synopsisThreeSourceLinksV1.schema.json) definerer formatet.

**Viktig avgrensning:** Dette er foreløpig **24 synopsis-kandidater**, ikke 24 utgitte fortellinger. I samme register er de **tre registrerte private NPC-historiene** Stein, Frode og Inger dokumentert med synopsis og eksisterende scene-kildesti, men uten påstått kildeattribusjon. Vi må analysere hver av disse tre historiene før vi velger film- og bokinspirasjon i ettertid. Ingen Goodreads-kandidat er ennå bekreftet mot faktisk `read`/4+-utvalg.

## Hvor mye er faktisk kartlagt?

| Lag | Verifisert grunnlag | Nåværende status |
| --- | --- | --- |
| Moderne fortellingstyper | C01–C24, 24 av 24 | Begrepskart + 24 konkrete nye synopser, **ikke spillbare** |
| Litterære spor og Booker-linser | L01–L24 og P01–P07 | Koblet i eldre crosswalk; ulik grad av produksjon |
| Filmgrunnlag | IMDb-liste med 161 filmer og 161 Film Producer-seeds | 24 presise filmkoblinger med IMDb-ID og scenario-ID nedenfor |
| Goodreads voksenkanon | Filter/CSV-importskript finnes | **Ingen av de 24 bokkandidatene er kontrollert mot privat `read`/4+-kanon i denne runden** |
| Karakterer og roller | Eksisterende Civication-katalog og role-pack-indeks | Utkast knyttet til eksisterende redaksjonelle rolle/person-spor; krever state-/rolleforankring |
| Publisering | Life Story Runner / Civication Narrative | **0 av disse 24 utkastene er aktivert** |

## Oversikt – 24 ulike historier

| Type | Rolle/person | Litterært grep (Goodreads: ikke avstemt) | Film / Film Producer | Samfunnsproblem |
| --- | --- | --- | --- | --- |
| **C01 Jobbtap og verdighet** | arbeidsledig | Ellison – Invisible Man (L03) | [I, Daniel Blake (2016)](https://www.imdb.com/title/tt5168192/) | tap av arbeidsrolle, økonomisk knapphet og sosial verdighet |
| **C02 Muligheten uten garanti** | Mira / musikk_frilansmusiker | Munro – Runaway (L17) | [Searching for Sugar Man (2012)](https://www.imdb.com/title/tt2125608/) | kunstnerisk ambisjon, uforpliktende tilbud og tid brukt uten garanti |
| **C03 Drømmen og regningene** | Lea / naeringsliv_sideprosjektbygger | Balzac – Tapte illusjoner (L06) | [Paterson (2016)](https://www.imdb.com/title/tt5247022/) | ambisjon mot ordinær økonomi og begrenset kapasitet |
| **C04 Forespørselen som ikke er en kontrakt** | Lea / naeringsliv_frilanser | Ford – The Good Soldier (L12) | [Clerks (1994)](https://www.imdb.com/title/tt0109445/) | løse forventninger, avtaleforståelse og ulønnet arbeid |
| **C05 Byråkratiet og personen** | arbeidsledig / NAV | Kafka – Prosessen (L18) | [Brazil (1985)](https://www.imdb.com/title/tt0088846/) | forvaltningssystem, dokumentasjon og ulik tilgang til informasjon |
| **C06 Faglig integritet under press** | arealplanlegger | Camus – Pesten (L07) | [12 Angry Men (1957)](https://www.imdb.com/title/tt0050083/) | faglig integritet, tidsfrister og politiske beslutningsgrunnlag |
| **C07 Tilhørighet mot frihet** | Arvid / sosialt miljø | Ellison – Invisible Man (L03) | [Dheepan (2015)](https://www.imdb.com/title/tt4082068/) | tilhørighet, uformell makt og retten til egne grenser |
| **C08 Tjenesten som blir en gjeld** | Arvid / bekjentskap | Tsjekhov – Damen med hunden (L17) | [Dogville (2003)](https://www.imdb.com/title/tt0276919/) | gjensidighet, usagt motytelse og frivillighet |
| **C09 Vennskapet som glir fra** | Jonas / vennskap | Fosse – Septologien (L09) | [Lost in Translation (2003)](https://www.imdb.com/title/tt0335266/) | vennskapets endrede rytme, stillhet og uavklarte forventninger |
| **C10 Kjærlighet på feil tidspunkt** | ny privatlivstråd / gjensidig interesse | Austen – Stolthet og fordom (L10) | [Before Sunrise (1995)](https://www.imdb.com/title/tt0112471/) | nærhet, livsvalg og samtykke uten skjebnebestemt romantikk |
| **C11 Familien som trenger deg** | søsteren / familierelasjon | Ernaux – Årene (L08) | [The Savages (2007)](https://www.imdb.com/title/tt0775529/) | omsorgsarbeid, arbeidstid og fordeling av ansvar |
| **C12 Grensen du ikke satte** | Sara / frivillig klubb | Munro – Runaway (L17) | [The Square (2017)](https://www.imdb.com/title/tt4995790/) | usynlig arbeid, forventninger og ansvar uten mandat |
| **C13 Hjemmet på usikker grunn** | ny boligtråd / arbeidsledig | Vesaas – Fuglane (L22) | [The Florida Project (2017)](https://www.imdb.com/title/tt5649144/) | boligusikkerhet, forhandlingsmakt og knappe alternativer |
| **C14 Ryktet løper fra deg** | sosiale medier / kollegarelasjon | Ford – The Good Soldier (L12) | [The Hunt (2012)](https://www.imdb.com/title/tt2106476/) | rykte, fragmentert kontekst og hvem som eier forklaringen |
| **C15 Det digitale dobbeltlivet** | digital identitet / privatliv | Borges – Ficciones (L14) | [The Truman Show (1998)](https://www.imdb.com/title/tt0120382/) | selviscenesettelse, offentlig tolkning og samtykke |
| **C16 Klassereisen og kodene** | Daniel / kulturmiljø | Smith – White Teeth (L23) | [The Class (2008)](https://www.imdb.com/title/tt1068646/) | klassekoder, adgang og uuttalte fellesskapskrav |
| **C17 Å arbeide seg tom** | renholder / driftsleder | Balzac – Tapte illusjoner (L06) | [The Machinist (2004)](https://www.imdb.com/title/tt0361862/) | arbeidspress, HMS, fagstolthet og begrenset kapasitet |
| **C18 Ensom midt blant folk** | Jonas / Daniel / sosialt liv | Beckett – Mens vi venter på Godot (L09) | [Virgin Mountain (2015)](https://www.imdb.com/title/tt2611652/) | ensomhet, sosial synlighet og usikkerhet om andres hensikter |
| **C19 Å begynne på nytt** | arbeidsledig / opplæringsspor | Homer – Odysseen (L04) | [The Man Without a Past (2002)](https://www.imdb.com/title/tt0311519/) | ny orientering etter tap, mestring og usikre overganger |
| **C20 Fellesskapet uten helt** | Sara og Nora / lokalt fellesskap | Dickens – Bleak House (L11) | [Antonia's Line (1995)](https://www.imdb.com/title/tt0112379/) | kollektivt ansvar, usynlige bidrag og fellesskap uten redningshelt |
| **C21 Byen som skifter ansikt** | Ivar / arealplanlegger | Thoreau – Walden (L22) | [Smoke (1995)](https://www.imdb.com/title/tt0114478/) | byendring, stedstilhørighet, minne og representasjon |
| **C22 Kunnskap du ikke kan bekrefte** | Nora / natur og undersøkelse | Didion – The White Album (L20) | [The Guilty (2018)](https://www.imdb.com/title/tt6742252/) | kunnskapsusikkerhet, offentlig beslutning og kildekrav |
| **C23 Den lille feilen som ikke forsvinner** | Lea / arbeid og privatliv | Kafka – Forvandlingen (L01) | [Fargo (1996)](https://www.imdb.com/title/tt0116282/) | små feil, informasjonsforskyvning og ansvar over flere dager |
| **C24 Den ufullstendige forsoningen** | Mira, Lea og Arvid / relasjoner | Fosse – Septologien (L09) | [Manchester by the Sea (2016)](https://www.imdb.com/title/tt4034228/) | ettervirkninger, tillit og forsoning uten total avslutning |

## Synopsis og valgdilemma for hver historietype

### C01 – Jobbtap og verdighet
**Rolle/person:** arbeidsledig. **Bokreferanse (foreløpig):** Ellison – Invisible Man. **Film:** [I, Daniel Blake](https://www.imdb.com/title/tt5168192/) / Film Producer `scenario_i_daniel_blake_2016`.

Etter at arbeidsforholdet opphører, får spilleren en invitasjon til en gammel kollegasamling samme dag som et økonomisk krav må besvares. Jonas spør om spilleren vil bli med; svaret handler like mye om selvrespekt som om penger.

**Valg A:** Fortelle Jonas at økonomien er trang, og foreslå en gratis gåtur i stedet.
**Valg B:** Takke ja til samlingen og utsette svaret på kravet til neste dag.

### C02 – Muligheten uten garanti
**Rolle/person:** Mira / musikk_frilansmusiker. **Bokreferanse (foreløpig):** Munro – Runaway. **Film:** [Searching for Sugar Man](https://www.imdb.com/title/tt2125608/) / Film Producer `scenario_searching_for_sugar_man_2012`.

En arrangør sier at Mira kan få spille dersom en annen artist trekker seg. Mira blir bedt om å holde lørdagen ledig, men hun har allerede lovet å øve med en kollega. Spilleren blir spurt om å hjelpe med et svar som ikke skaper en falsk booking.

**Valg A:** Be arrangøren om frist og skriftlig avklaring før Mira endrer avtalen sin.
**Valg B:** Beholde øvingen og svare at Mira bare er tilgjengelig ved en konkret bekreftelse.

### C03 – Drømmen og regningene
**Rolle/person:** Lea / naeringsliv_sideprosjektbygger. **Bokreferanse (foreløpig):** Balzac – Tapte illusjoner. **Film:** [Paterson](https://www.imdb.com/title/tt5247022/) / Film Producer `scenario_paterson_2016`.

Lea har laget en første demonstrasjon av en idé etter jobben. Samme uke kommer en nødvendig regning, og en venn ber om mer arbeid uten honorar. Spilleren kan hjelpe henne å avgrense prosjektet, men kan ikke love at ideen blir en bedrift.

**Valg A:** Be Lea velge én liten forbedring som kan prøves innenfor tiden hun har.
**Valg B:** Anbefale henne å legge demonstrasjonen i skuffen til økonomien er mer stabil.

### C04 – Forespørselen som ikke er en kontrakt
**Rolle/person:** Lea / naeringsliv_frilanser. **Bokreferanse (foreløpig):** Ford – The Good Soldier. **Film:** [Clerks](https://www.imdb.com/title/tt0109445/) / Film Producer `scenario_clerks_1994`.

Lea får en melding fra en bekjent som vil ha «en rask tekst» før fredag. Etter to meldinger vokser oppgaven fra korrektur til å skrive alt. Ingen har nevnt honorar, rettigheter eller hvor mange runder som forventes.

**Valg A:** Be om konkret omfang, pris og frist før hun svarer ja.
**Valg B:** Tilby en kort engangslesning uten betaling og takke nei til større arbeid.

### C05 – Byråkratiet og personen
**Rolle/person:** arbeidsledig / NAV. **Bokreferanse (foreløpig):** Kafka – Prosessen. **Film:** [Brazil](https://www.imdb.com/title/tt0088846/) / Film Producer `scenario_brazil_1985`.

En digital søknad ber om et vedlegg spilleren allerede har levert. Fristen går ut i morgen, og veilederen kan ikke se dokumentet i sitt system. Spilleren må velge hvordan dette dokumenteres uten å anta at saken er avgjort.

**Valg A:** Sende vedlegget på nytt med kvittering og be om bekreftelse.
**Valg B:** Ringe veilederen for å avklare hva som faktisk mangler før noe sendes igjen.

### C06 – Faglig integritet under press
**Rolle/person:** arealplanlegger. **Bokreferanse (foreløpig):** Camus – Pesten. **Film:** [12 Angry Men](https://www.imdb.com/title/tt0050083/) / Film Producer `scenario_12_angry_men_1957`.

Et saksnotat om en skolevei skal legges frem samme ettermiddag. Plansjefen ønsker en kort konklusjon, men trafikkmålingen fra morgenrushet mangler. Spilleren må svare på hva notatet kan hevde før en beslutning tas.

**Valg A:** Levere notatet med en tydelig begrensning og foreslå ny måling.
**Valg B:** Be om utsettelse av saken til observasjonen er gjort.

### C07 – Tilhørighet mot frihet
**Rolle/person:** Arvid / sosialt miljø. **Bokreferanse (foreløpig):** Ellison – Invisible Man. **Film:** [Dheepan](https://www.imdb.com/title/tt4082068/) / Film Producer `scenario_dheepan_2015`.

Arvid inviterer spilleren til å bli med i en lokal arrangørgruppe. Første møtet handler om musikk og fellesskap; etterpå blir spilleren bedt om å stille gratis på tre vakter. Et ja til invitasjonen var aldri et ja til alle vaktene.

**Valg A:** Takke ja til én konkret vakt og be gruppa fordele resten.
**Valg B:** Avslå vaktene, men si at spilleren gjerne deltar som gjest.

### C08 – Tjenesten som blir en gjeld
**Rolle/person:** Arvid / bekjentskap. **Bokreferanse (foreløpig):** Tsjekhov – Damen med hunden. **Film:** [Dogville](https://www.imdb.com/title/tt0276919/) / Film Producer `scenario_dogville_2003`.

En bekjent hjelper spilleren med å få låne et rom til en øvelse. Uken etter omtaler han hjelpen som en grunn til at spilleren bør skaffe frivillige til arrangementet hans. Spilleren har takket for lånet, ikke avtalt motytelser.

**Valg A:** Takke for rommet og forklare at videre arbeid må avtales separat.
**Valg B:** Tilby en avgrenset praktisk tjeneste og presisere at den avslutter saken.

### C09 – Vennskapet som glir fra
**Rolle/person:** Jonas / vennskap. **Bokreferanse (foreløpig):** Fosse – Septologien. **Film:** [Lost in Translation](https://www.imdb.com/title/tt0335266/) / Film Producer `scenario_lost_in_translation_2003`.

Jonas og spilleren pleide å møtes på søndager. Nå har to avtaler blitt flyttet, og Jonas skriver «vi tar det senere» uten nytt forslag. Spilleren vet ikke om Jonas trenger avstand eller bare har det travelt.

**Valg A:** Spørre om Jonas fortsatt ønsker å møtes, uten å kreve en forklaring.
**Valg B:** Si at døren er åpen og la Jonas foreslå neste treff.

### C10 – Kjærlighet på feil tidspunkt
**Rolle/person:** ny privatlivstråd / gjensidig interesse. **Bokreferanse (foreløpig):** Austen – Stolthet og fordom. **Film:** [Before Sunrise](https://www.imdb.com/title/tt0112471/) / Film Producer `scenario_before_sunrise_1995`.

To personer som nylig har møtt hverandre, ønsker å treffes igjen. Den ene vurderer flytting for jobb; den andre vil ikke innlede noe med uklare forventninger. Ingen av dem har gitt løfter om et forhold.

**Valg A:** Foreslå et nytt møte og være åpen om at fremtiden ennå er usikker.
**Valg B:** Si at timingen er vanskelig og la forbindelsen forbli et godt møte.

### C11 – Familien som trenger deg
**Rolle/person:** søsteren / familierelasjon. **Bokreferanse (foreløpig):** Ernaux – Årene. **Film:** [The Savages](https://www.imdb.com/title/tt0775529/) / Film Producer `scenario_the_savages_2007`.

Søsteren spør om spilleren kan hjelpe en forelder til en undersøkelse mens hun selv er på jobb. Spilleren har en viktig arbeidsavtale samme formiddag. Begge ønsker å bidra, men ingen kan være to steder samtidig.

**Valg A:** Spørre om familien kan dele kjøring og oppfølging mellom seg.
**Valg B:** Be søsteren finne et alternativ og tilby hjelp senere samme kveld.

### C12 – Grensen du ikke satte
**Rolle/person:** Sara / frivillig klubb. **Bokreferanse (foreløpig):** Munro – Runaway. **Film:** [The Square](https://www.imdb.com/title/tt4995790/) / Film Producer `scenario_the_square_2017`.

Sara minner spilleren om nøkkelen til et klubblokale og sier at «du pleier jo å ordne» stoler og oppvask. Spilleren sa ja til å åpne lokalet én gang, men oppgaven har blitt stående på vaktplanen uten en ny samtale.

**Valg A:** Si at spilleren kan åpne denne gangen, men be om ny turnus fra neste møte.
**Valg B:** Avslå den nye vakten og la styret finne en person med avtalt ansvar.

### C13 – Hjemmet på usikker grunn
**Rolle/person:** ny boligtråd / arbeidsledig. **Bokreferanse (foreløpig):** Vesaas – Fuglane. **Film:** [The Florida Project](https://www.imdb.com/title/tt5649144/) / Film Producer `scenario_the_florida_project_2017`.

En utleier sier at husleien øker fra neste måned. Spilleren kan ikke se at endringen følger kontrakten, men trenger et sted å bo og har lite økonomisk handlingsrom. En venn tilbyr en midlertidig sofa uten klare betingelser.

**Valg A:** Be utleier om skriftlig grunnlag og undersøke rettigheter før spilleren svarer.
**Valg B:** Spørre vennen konkret om varighet og grenser for et mulig kort opphold.

### C14 – Ryktet løper fra deg
**Rolle/person:** sosiale medier / kollegarelasjon. **Bokreferanse (foreløpig):** Ford – The Good Soldier. **Film:** [The Hunt](https://www.imdb.com/title/tt2106476/) / Film Producer `scenario_the_hunt_2012`.

Et utsnitt av en intern samtale legges ut i en gruppechat uten det opprinnelige spørsmålet. Flere tolker spillerens svar som at en kollega har fått skylden. Spilleren har tilgang til sin egen melding, men ikke til alle andres samtaler.

**Valg A:** Vise hele egen melding og forklare hva den faktisk gjaldt.
**Valg B:** Ta kontakt med kollegaen først og spørre hva vedkommende ønsker avklart.

### C15 – Det digitale dobbeltlivet
**Rolle/person:** digital identitet / privatliv. **Bokreferanse (foreløpig):** Borges – Ficciones. **Film:** [The Truman Show](https://www.imdb.com/title/tt0120382/) / Film Producer `scenario_the_truman_show_1998`.

Spilleren bruker en offentlig profil der alt ser vellykket ut. En venn leser innleggene som tegn på at spilleren har lovet å støtte et prosjekt, selv om bildene bare viser et besøk. Vennen ber nå om å bruke spillerens navn i en annonse.

**Valg A:** Avklare offentlig at besøket ikke var et løfte eller et samarbeid.
**Valg B:** Be vennen fjerne navnet privat før noe nytt publiseres.

### C16 – Klassereisen og kodene
**Rolle/person:** Daniel / kulturmiljø. **Bokreferanse (foreløpig):** Smith – White Teeth. **Film:** [The Class](https://www.imdb.com/title/tt1068646/) / Film Producer `scenario_the_class_2008`.

Daniel tar spilleren med til et arrangement der mange kjenner de uuttalte reglene. Etterpå spør verten hvorfor spilleren ikke deltok i en innsamlingsrunde som ingen hadde forklart på forhånd. Daniel mener det var opplagt.

**Valg A:** Si at forventningen var ukjent, og spørre hva pengene skal brukes til.
**Valg B:** Takke for kvelden og velge å ikke gå inn i gruppas faste forpliktelser.

### C17 – Å arbeide seg tom
**Rolle/person:** renholder / driftsleder. **Bokreferanse (foreløpig):** Balzac – Tapte illusjoner. **Film:** [The Machinist](https://www.imdb.com/title/tt0361862/) / Film Producer `scenario_the_machinist_2004`.

En renholder får stadig flere områder på samme vakt fordi en kollega er borte. Arbeidet ser ferdig ut på rapporten, men pausen er falt bort og en tung oppgave er ikke risikovurdert. Driftslederen ber om bekreftelse før vaktens slutt.

**Valg A:** Opplyse hvilke områder som ble gjort, og be om prioritering av resten.
**Valg B:** Be om en felles gjennomgang av bemanning og arbeidsbelastning neste vakt.

### C18 – Ensom midt blant folk
**Rolle/person:** Jonas / Daniel / sosialt liv. **Bokreferanse (foreløpig):** Beckett – Mens vi venter på Godot. **Film:** [Virgin Mountain](https://www.imdb.com/title/tt2611652/) / Film Producer `scenario_virgin_mountain_2015`.

Venner deler bilder fra en kveld spilleren ikke ble invitert til. Spilleren vet ikke om det var bevisst, og er usikker på om det er ønskelig å ta kontakt. En gammel avtale om å møtes henger fortsatt ubesvart.

**Valg A:** Sende en konkret invitasjon til én venn uten å kreve forklaring på bildene.
**Valg B:** Gi det litt tid og finne et annet sosialt fellesskap denne uken.

### C19 – Å begynne på nytt
**Rolle/person:** arbeidsledig / opplæringsspor. **Bokreferanse (foreløpig):** Homer – Odysseen. **Film:** [The Man Without a Past](https://www.imdb.com/title/tt0311519/) / Film Producer `scenario_the_man_without_a_past_2002`.

Et kort kurs åpner for et nytt fagområde, men gir ingen jobbgaranti. Spilleren har erfaring fra tidligere arbeid som kan være nyttig, men mangler noen formelle krav. Veilederen spør om det er verdt tiden.

**Valg A:** Søke kurset og undersøke nøyaktig hvilke ferdigheter og krav som gjelder.
**Valg B:** Velge en kortere praksisnær aktivitet og beholde muligheten for kurset senere.

### C20 – Fellesskapet uten helt
**Rolle/person:** Sara og Nora / lokalt fellesskap. **Bokreferanse (foreløpig):** Dickens – Bleak House. **Film:** [Antonia's Line](https://www.imdb.com/title/tt0112379/) / Film Producer `scenario_antonia_s_line_1995`.

Et lokalt møtested mister en av sine faste frivillige rett før et åpent arrangement. Sara foreslår at én person tar ansvar for alt; Nora vil heller redusere programmet slik at flere kan bidra uten å bli uunnværlige.

**Valg A:** Foreslå et mindre arrangement med navngitte, avgrensede oppgaver.
**Valg B:** Avlyse denne gangen og invitere til et nytt planleggingsmøte.

### C21 – Byen som skifter ansikt
**Rolle/person:** Ivar / arealplanlegger. **Bokreferanse (foreløpig):** Thoreau – Walden. **Film:** [Smoke](https://www.imdb.com/title/tt0114478/) / Film Producer `scenario_smoke_1995`.

Ivar oppdager at den gamle møteplassen hans blir omtalt som «ubrukt areal» i et forslag til ny gateplan. Han har bilder og minner, mens saksbehandleren har trafikkdata. Spørsmålet er hvilke erfaringer som faktisk må frem i høringen.

**Valg A:** Hjelpe Ivar å levere dokumenterbare minner som innspill, adskilt fra måledata.
**Valg B:** Foreslå et møte der flere berørte beskriver dagens bruk før Ivar uttaler seg for alle.

### C22 – Kunnskap du ikke kan bekrefte
**Rolle/person:** Nora / natur og undersøkelse. **Bokreferanse (foreløpig):** Didion – The White Album. **Film:** [The Guilty](https://www.imdb.com/title/tt6742252/) / Film Producer `scenario_the_guilty_2018`.

Nora har en observasjon som kan tyde på at et grøntområde brukes av en sårbar art. Et gammelt bilde sirkulerer allerede som «bevis», men ingen vet når det ble tatt. Kommunens svarfrist nærmer seg.

**Valg A:** Levere det som faktisk er observert, med dato og tydelig usikkerhet.
**Valg B:** Bruke tiden på et nytt feltbesøk og si fra at grunnlaget ennå ikke er godt nok.

### C23 – Den lille feilen som ikke forsvinner
**Rolle/person:** Lea / arbeid og privatliv. **Bokreferanse (foreløpig):** Kafka – Forvandlingen. **Film:** [Fargo](https://www.imdb.com/title/tt0116282/) / Film Producer `scenario_fargo_1996`.

Lea sender ved en feil et tidlig prosjektutkast til en større mottakergruppe. Én person svarer som om planen allerede er vedtatt, og en annen har satt av arbeidstid. Hun kan ikke trekke tilbake at meldingen er lest.

**Valg A:** Rette opp misforståelsen til alle mottakere og oppgi hva som fortsatt er uavklart.
**Valg B:** Kontakte dem som har svart, én for én, før hun sender felles presisering.

### C24 – Den ufullstendige forsoningen
**Rolle/person:** Mira, Lea og Arvid / relasjoner. **Bokreferanse (foreløpig):** Fosse – Septologien. **Film:** [Manchester by the Sea](https://www.imdb.com/title/tt4034228/) / Film Producer `scenario_manchester_by_the_sea_2016`.

Etter en offentlig misforståelse har Mira og Lea begynt å snakke igjen. Arvid har rettet sin egen melding, men Mira vil fortsatt ikke bruke prosjektgruppen som møtested. Lea ønsker et nytt samarbeid; hun vet ikke om de andre er klare.

**Valg A:** Foreslå en privat samtale uten krav om nytt prosjekt eller full tilgivelse.
**Valg B:** Respektere avstanden nå og avtale at ingen bruker hverandres navn uten samtykke.

## Produksjonsrekkefølge – store bolker, ikke administrasjon

1. **Kildematch én gang:** Finn gyldige voksne Goodreads-titler i faktisk `read`/4+-utvalg, behold skillet mot YA/barnebøker; match mot eksisterende litteraturverk, personer og steder i History Go. Samkjør filmene mot IMDb-ID og Film Producers faktiske kildelag, og skriv tematiske notater om verkene. Prioriter dekning og variasjon, ikke bare kjente titler.
2. **Synopsispakke C01–C24:** Fullfør kildebegrunnelse, særskilt samtid/historisk ramme, karakterens bakgrunn, realistiske motstridende mål, startscene, utløser, minst to valgbaserte følger og en senere tilbakekomst. Registrer om fakta finnes, blir introdusert eller er ukjent. Utkastene her er startgrunnlag, ikke kanoniserte nye biografier.
3. **Koble til Civication-roller:** Match mot faktisk role-pack-/life-story-manifest og NPC-ID der den finnes. Begynn med eksisterende spillbare roller/figurer; senere gjenbrukes samme universelle problem i andre roller med **ny, rollespesifikk hendelse**, ikke navnebytte. Skill jobbmyndighet, personlighet, dokumentert kompetanse, relasjon og privatliv. Utsnitt må aldri anta et valg spilleren ikke har gjort.
4. **Produser innhold i bolker:** Skriv og registrer 8–12 hele historiebuer per bolk der premiss, NPC-er, flere kapitler, avgrensede konsekvenser og forgreninger faktisk henger sammen. Én PR per bolk. Ikke lag én PR per inspirasjonsverk, og ikke blokker resten på vanskelige Goodreads-/film-matcher; marker dem `pending`.
5. **Målrettet kontroll etter ferdig bolk:** Verifiser kilde-ID-er, C01–C24-dekning, konkrete aktør- og rollekrav, grenavhengige minner og at valgt løsning gir ulike senere hendelser. Kjør bare relevant scenetest før merge; full regresjon kun ved milepæler eller motorendringer.

## Felles synopsisstandard for videre produksjon

**En synopsis skal kunne leses som en faktisk fortelling:** bestemt hovedperson/rolle, konkret sted og tidspunkt, hendelsen som endrer situasjonen, hva hver aktør vil, hva som kan tapes, hvilke to troverdige handlinger spilleren kan velge, og hva som skjer senere i hver gren. Film- og bokinspirasjonen skal peke på **allmenngyldig konflikt og samfunnsforhold**, eventuelt form/fortellerperspektiv – aldri kopierte karakterer, replikkvekslinger, særpregede handlingskjeder eller filmens avsløring.

**Status skal alltid skilles:** `editorial_synopsis_not_playable` → `reviewed_with_source_match` → `authored_unregistered` → `registered_playable`. Goodreads-koblingen kan først stå som verifisert når faktiske CSV-/kanonfelt bekrefter dette; Film Producer-scenarioets importerstatus er ikke synonymt med filmfaglig validering. Målet er **24/24 typer med minst én ferdig fortelling**, deretter breddedekning på rollefamilier og 24/24 litterære spor.

## Maskinlesbare kilder

- [Koblingsregister JSON](../data/Civication/lifestory/editorial/storyInspirationCoverageV1.json) – 24 typekart med synopser, to valg, ISBN-frie bokkandidater, presise IMDb-/Film Producer-ID-er og produksjonsstatus.
- [JSON-skjema](../data/Civication/lifestory/editorial/storyInspirationCoverageSchemaV1.json) – felter og formkrav.
- [Opprinnelig crosswalk](../data/Civication/lifestory/editorial/narrativeCrosswalkV1.json) og [samtidige fortellingstyper](CIVICATION_CONTEMPORARY_STORY_PATTERNS_V1.md).
- [Goodreads-import](../scripts/import-goodreads-literature-canon.mjs) og [Civication personmodell](CIVICATION_PERSON_MODEL_V1.md).
- Ekstern Film Producer-kilde: `Paradispartiet/HG_Film_Producer/data/film/scenarios/film_scenarios_seed.json` samt `data/film/imdb_ls000064637_titles.md`.
