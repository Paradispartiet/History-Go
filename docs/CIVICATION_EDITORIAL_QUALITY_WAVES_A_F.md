# Civication – redaksjonell kvalitetsrevisjon A–F

Status: under redaksjonell gjennomgang. PR #6382 skal stå som **draft**, uten automatisk merge.

## Mål

Civication skal fortelle troverdige livshistorier, ikke være en løpende saksrapport. Spilleren skal møte personer med navn og særpreg, konkrete situasjoner, et forståelig dilemma og minst to genuint forskjellige måter å reagere på. Fortellingen kan være lavmælt, men den må bevege seg.

Sporbarhet, tidligere valg, dager mellom hendelser, rettigheter og kildegrenser håndteres av data og spillmotor. Synlig tekst forklarer bare forbehold når et menneske faktisk trenger å forstå dem for å velge.

## Utført på Wave F-grenen

- Alle 68 scener / 136 valg i Wave F er redaksjonelt omskrevet, med uendrede scene-ID-er, choice-ID-er, inngangsvilkår og effektflagg. Gjennomgang på PR-grenen; ingen merge.
- 12 Wave E-scener i C05 er omskrevet for å binde ventingen hos NAV til vanlige gjøremål, økonomisk usikkerhet og forholdet til andre mennesker.
- Gjentatte rollebetegnelser er erstattet av eksisterende/tilknyttede navn i de eldre historieløpene: Mira (musikk), Lea (prosjekt), Arvid (miljø). Disse er kun presentasjonsendringer; tekniske rollekoder, relasjonsnøkler og scene-ID-er beholdes.
- Den gamle NAV-scenen der en telefonsamtale løste både meldekort og arbeidsdokumentasjon er korrigert. Samtalen kan gi veiledning, men utløser ikke flagg for dokumenter som ikke er sendt. En målrettet regresjonstest dekker dette.
- I Wave F har 38 av 136 valg fått en tilleggsvirkning utover flagg, i 35 av 68 scener, med nøkterne utslag der en handling faktisk påvirker energi, psyke, relasjon eller integritet. Andre valg er bevisst uten tallverdi; ikke gi kunstige målerutslag for å oppnå 100 prosent.
- Andelen Wave F-beskrivelser med ordet «ikke», «ingen», «uten» eller «aldri» er redusert fra 62 til 41 av 68. Dette er kun en indikator på språkendringen, ikke en litterær kvalitetstest.

## Redaksjonell sjekkliste for neste pass

1. **Hendelse:** Hva skjer med spilleren i akkurat denne scenen? En ny sansning, samtale, handling, bekymring eller praktisk hindring må bære teksten.
2. **Person:** Navngitte mennesker skal ha forskjellig motivasjon og talemåte. Ikke la rollebetegnelsen erstatte et menneske.
3. **Valg:** To valg skal være reelt ulike i kostnad, prioritet eller forhold til andre. «Skriv et notat» vs. «skriv et annet notat» er ikke nok.
4. **Utvikling:** Et uløst problem kan følge spilleren over tid, men en ny scene må tilføre en opplevelse, kostnad, sidevirkning eller relasjonell forskyvning.
5. **Logikk:** Ingen møtebekreftelse, godkjenning, betaling, jobb, kvittering, fysisk utbedring eller forsoning kan oppstå retroaktivt. Nye faktiske hendelser må framgå av en scene eller en eksplisitt valgt handling.
6. **Tid:** Replikker bruker «i morgen», ukedager eller konkrete datoer i stedet for interne livsdager. Dager i data brukes til å styre løypa, ikke som naturlig talespråk.
7. **Naturlig språk:** Les scenen og begge valgene høyt. Kutt forklaringer på registerstatus når innsatsen kan vises gjennom situasjonen.
8. **Konsekvens:** Kontroller både de umiddelbare målerutslagene, den faktisk valgte handlingen og om senere oppfølging bygger på denne – uten å late som en etterfølgende scene er en bekreftelse fra tredjepart.

## Andre redaksjonelle pass – kontinuitet gjennom åtte forløp

Denne runden gjennomgikk Wave A–F som **betingede fortellingskjeder**, ikke bare løse scener. Følgende konkrete rettelser ble gjort på PR-grenen:

| Historie | Kontroll av utvikling og rettelse |
| --- | --- |
| C01 – Jonas og økonomien | Tidlige invitasjoner bruker naturlige tidsuttrykk. Å bevare grenser og å kontakte Jonas gir forskjellige sosiale eller psykiske utslag som kan følge spilleren inn i Wave F. |
| C02 – Mira og musikken | Konsert uten dato behandles ikke som oppdrag. Eldre prøvetekster fikk naturlige tidsuttrykk og musikervalg fikk virkninger på overskudd eller integritet. |
| C03 – Lea og prototypen | Et visuelt overbevisende utkast må ikke bli til dokumentert effekt. Personvern, testing og fritid gir forskjellige konsekvenser. |
| C05 – NAV og dokumentasjon | Telefonsamtalen sender ikke automatisk arbeidsdokumenter. Fristen omtales naturlig; papirarbeid og venting påvirker energi eller overskudd. |
| C06 – Skoleveien | Fire nesten identiske kartleggingsscener er differensiert. Plansjefen Eirik og skolekontakten Ragnhild er navngitt. Det finnes bare en dokumentert 15-minutters observasjon, fra 07.45 til 08.00; senere scene er korrigert fra «tre morgener». |
| C07 – Frivillighet og Arvid | Personnavnet står i rolledata uten å endre lagret person-ID; framdrift skiller fellesskap fra arbeid på andres vilkår. Varselro og avstand gir utslag på overskudd. |
| C17 – Kari, Amina og renholdet | Fire tidligere, nesten identiske oppfølgingsscener har nå hver sin reelle arbeidssituasjon. Driftens faktiske besøk er skilt fra en utbedring. Arbeidspress, sikkerhet og planlegging påvirker spillverdier. |
| C23 – Lea og feilinformasjonen | En skisse kan skape en misforståelse uten å være en avtale. Mottak, forståelse og forsoning er forskjellige hendelser, og valg om ansvar og videre oppfølging får beskjedne virkninger. |

Alle **68 siste forgjengervalg** i Wave E (C01/C05) eller Wave D (seks andre historieløp) har nå en begrunnet umiddelbar måler- eller relasjonsvirkning. Wave F beholder de 38 tidligere tilleggsvirkningene fordelt på 35 scener. Effektene legges til eksisterende flagg; identifikatorene endres ikke.

Målrettede Node-tester er utvidet for å simulere **136 Wave F-alternativer** og **68 forgjengervalg**, sjekke at flagg, arkiv, verdier og relasjoner består når livsdager går, og kontrollere den registrerte skoleveisobservasjonen. Dette er en maskinell simulering av grenpunktene i fortellingsmotoren, **ikke** det samme som en full menneskelig gjennomspilling av alle scener i den kjørende appen. Testene må først bestå på siste commit før dette kan regnes som teknisk verifisert.

Fortsatt redaksjonelt arbeid: Sjekk komplette tidlige reiser i faktisk brukergrensesnitt, tonefall og om flere episoder over uker føles troverdige, ikke bare om korrekt gren åpnes. Unngå å skape flere oppfølgingskapitler bare for å dokumentere at noe fortsatt er uavklart.

## Tredje redaksjonelle pass – hele fortellingskjeder og konkrete arbeidssituasjoner (19. oktober 2026)

En samlet tekstbolk på **26 eldre scener** er skrevet om på PR-grenen, 13 i C06 og 13 i C17 (Wave A–D). Formålet er **dramatisk handling, personlige prioriteringer og særpreg**, ikke å øke antallet scener. Tidligere redaksjonelle endringer i C01, C02, C03, C05, C07 og C23 er beholdt.

**C06 – skoleveien:** Ragnhilds telling fra snarveien, Eiriks tidspress, ubemannet registrering ved nedkjørselen, den faktisk utførte observasjonen 07.45–08.00 og senere bruk av tallet sju framstår nå som én fortelling. De fire Wave B-inngangene har ulike utgangssituasjoner og mer personlige replikker. Kun én faktisk observasjon er gjennomført, med sju gående hvorav tre med skolesekk. Den dekker ikke 08.00–08.15, angir ikke alder eller reisemål, og sier ikke hvordan en framtidig nedkjørsel vil fungere. Ingen faglig anbefaling framstilles som en politisk avgjørelse.

**C17 – renholdet:** Scenene viser mer av hvordan arbeidspresset treffer spilleren gjennom Kari og Amina: 45 minutter igjen av vakta, et uavklart lager, kollegaens advarsel, arbeidslista som må sendes og drift som kommer uten å flytte hylla. Ulike Wave B-forløp beholder hvert sitt perspektiv. Bare den faktisk gjennomførte nye runden i inngangspartiet kan beskrives som ferdig; lageret forblir utilgjengelig i alle disse grenene.

I begge historiene er **scene-ID-er, choice-ID-er, inngangsvilkår, tråder, eksisterende flagg og tall-/relasjonseffekter bevart** under omskrivingen ved strukturell sammenligning av original- og sluttobjektene i redigeringsrunden. Dette er en avgrenset datakontroll, **ikke** en dokumentert sluttkjøring av spillmotoren eller en fullstendig lesning av 217 scener.

**Oppdagede redaksjonelle mønstre:** Samme administrative problem kunne gjentas over fire grener med bare én endret setning. Karakterenes reaksjoner, tidspress og konsekvenser var til tider gjemt bak formuleringer som «ikke registrert», «ingen avgjørelse» og «plan må avklares». Disse opplysningene beholdes når de er nødvendige, men selve scenen skal bæres av en handling, et menneske og et valg.

**Neste port:** Les overgangen fra Wave D til E/F i alle åtte historiene, særlig om tidligere ja, nei, avlysning og grenser får gjenkjennelige følger. Kjør én endringsrelevant kontroll på siste commit, og spill alle åtte forløpene i faktisk norsk UI før PR-en godkjennes. Wave G er fortsatt utsatt.


## Fjerde redaksjonelle pass – Wave F, vendepunkter og foreløpige avslutninger (19. oktober 2026)

En samlet bolk på **32 Wave F-scener i alle åtte historieløp** er omskrevet, med **64 tilhørende valgtekster og konsekvenstekster**. Fordeling: C01 4, C02 4, C03 4, C05 4, C06 4, C07 4, C17 4, C23 4. Dette er ny tekst i eksisterende scener, ikke flere scener eller kapitler.

**Redaksjonelt grep:** Konfliktene vises gjennom konkrete øyeblikk: Jonas og den tomme helgen, Miras lydfil og musikernes tidsbruk, Leas sene prototypkveld, strømregningen ved NAV-papirene, skoleveiens sju passeringer på ett kvarter, grensene mot Arvids gruppe, den blokkerte lagerdøren og ansvar for en misvisende prosjektmelding. Alle åtte løpene får tydeligere menneskelige konsekvenser og foreløpig følelsesmessig avslutning selv om den ytre saken fortsatt kan være uavklart.

**Kontinuitetsgrenser:** Ingen nye svar fra NAV, Jonas, arrangører, politiske organer eller andre er diktet inn. Ingen avtale, betaling, teknisk utbedring eller offentlig avgjørelse oppstår uten tidligere kildegrunnlag eller valgt handling. C06 omtaler fortsatt kun den ene observasjonen 07.45–08.00 med sju passeringer, tre med skolesekk, uten å slutte alder, reisemål eller effekt av parkeringsnedkjørsel. C17 lar lagerhindringen bestå.

**Maskinell strukturkontroll før lagring:** Før- og etterobjektene ble sammenlignet per scene etter at bare `tittel`, `tekst`, `valg[].tekst` og `valg[].konsekvensTekst` ble utelatt. Eksakt 32 scenestrukturer har tekstendring; øvrige scener og samtlige identifikatorer, forutsetninger, flagg, tall, relasjonseffekter, tråder og tidsgrenser er identiske. Dette er ikke en utført nettlesergjennomspilling eller Node-regresjonstest.

**Fortsatt arbeid:** Wave F alene er nå bedre avsluttet, men hele A–F må leses og spilles i norsk grensesnitt før den samlede litterære kvaliteten kan godkjennes. PR #6382 forblir draft. Wave G startes ikke.

## Femte redaksjonelle pass – resterende Wave F-scener (19. oktober 2026)

Alle de **36 gjenværende Wave F-scenene** er redaksjonelt omskrevet, med **72 valgtekster og 72 konsekvenstekster**, fordelt slik: C01 4, C05 4, C02 4, C03 4, C06 4, C07 4, C17 4, C23 8. Sammen med forrige bolk på 32 scener innebærer dette at **samtlige 68 Wave F-scener** har fått et nytt pass rettet mot personlige erfaringer, naturlig språk og meningsfulle forskjeller mellom valg. Ingen nye scener ble opprettet.

**Grep i denne bolken:** Jonas-grenene handler om grenser, savn og egen kalender; NAV om hverdagsøkonomi, ventetid og dokumenter som ikke får overta hjemmet; Mira om eierskap til musikken, honorar og samarbeid; Lea og prototypen om samtykke og å tåle manglende bevis; skoleveien om én begrenset telling og presset fra Eirik; Arvid om forskjellen på fellesskap og vaktforventninger; renhold om arbeid som faktisk ble gjort og en blokkert lagerdør; prosjektmeldingen om ansvar, stillhet og retten til ikke å svare. Valgene er gjennomgående mer konkrete og legger ikke til usannsynlig bekreftelse fra andre.

**Kontinuitetsvern:** C06 har fremdeles bare én observasjon (07.45–08.00, sju passeringer, tre med skolesekk). C17 har fortsatt en utilgjengelig lagerdør, ikke dokumentert utbedring. Ingen nye NAV-vedtak, spillejobber, brukerforsøk, møtebekreftelser, utbetalinger eller mottakersvar er oppfunnet. Etter-valg-dager, scene-ID-er, choice-ID-er, valgkrav, effekter, relasjoner, flagg, tids- og trådmetadata er uendret.

**Avgrenset intern strukturkontroll:** Originalen og den redigerte scenelisten er sammenlignet objekt for objekt. Eksakt 36 eksisterende sceneobjekter ble endret; når feltene `tittel`, `tekst`, `valg[].tekst` og `valg[].konsekvensTekst` utelates, er alle objekter identiske. Dette erstatter verken Node-test på siste commit eller norsk gjennomspilling av de 217 A–F-scenene.

**Redaksjonelt gjenstående:** Ikke erklær 217 scener godkjent bare fordi Wave F er omskrevet. Les Wave A–E mot inngangene til F, sjekk at valgene føles forskjellige i faktisk UI, og rett resterende sjargong, repetisjon og ulogiske mellomledd. PR #6382 forblir draft; Wave G er fortsatt utsatt.

## Sjette redaksjonelle pass – overganger fra Wave D/E til F (19. oktober 2026)

**16 forløperscener** er omskrevet og **32 valg/konsekvenspar** er språklig bearbeidet: to per historieløp, med C01 og C05 fra Wave E og C02, C03, C06, C07, C17 og C23 fra Wave D. Gjennomgangen binder de tidligere beslutningene tettere til de nå reviderte Wave F-scenene. Særlig skal Jonas-relasjonen oppleves som et forhold mellom venner fremfor en kalenderstatus, NAV-saken som en byrde i hverdagsøkonomien fremfor en dokumentliste, og arbeidssituasjonene i skoleveien og renholdet ha merkbare menneskelige kostnader.

Bevart i samtlige filer: scene- og valg-ID-er, betingelser, tidskrav, flagg, meter- og relasjonseffekter og oppfølgingsstatus. I hver fil ble original og ferdig JSON sammenlignet med de fire tillatte tekstfeltene utelatt. Det er **ikke** gjort full CI/regresjon eller nettlesergjennomspilling i denne runden. Ingen avtale, NAV-avgjørelse, politisk avgjørelse, gjennomført fagkontroll, samtykke, lagerutbedring eller forsoning oppstår gjennom omskriving.

Samlet revidert i disse to siste produksjonsrundene: 36 Wave F-scener samt 16 direkte forgjengerscener i D/E, totalt 52 ytterligere reviderte scener. Hele Wave F har fått et helhetlig språkpass (68/68), men A–E er fortsatt **ikke** fullstendig kvalitetsgodkjent. PR forblir draft. Wave G holdes tilbake.

## Sjuende redaksjonelle pass – karakterer og tidlige konflikter i Wave A/B (19. oktober 2026)

**40 eksisterende tidligscener** er omskrevet og **80 valg og 80 konsekvenstekster** er språklig bearbeidet: fem scener i hver av C01, C02, C03, C05, C06, C07, C17 og C23. Endringene er lagret i sju faktiske historiefiler i PR #6382. Ingen scener er lagt til.

| Historie | Hovedgrep i denne bolken |
| --- | --- |
| C01 – Jonas og økonomien | En kaféinvitasjon møter strømregningen på 280 kroner. Det menneskelige valget er hvor mye av egen økonomi spilleren vil dele med Jonas, og hvordan det påvirker vennskapet. |
| C02 – Mira og musikken | Håpet om en spillejobb må veies mot tid, honorar og eget musikalsk arbeid. Mira bestemmer over sine valg; ingen udokumentert konsertavtale oppstår. |
| C03 – Lea og prototypen | Pappforsøket har synlige begrensninger; avlysninger og avsluttede bidrag får sosial kostnad. Gjennomført mini-test beholder eksakt den tidligere registrerte forskjellen mellom tynt og tykt kort. |
| C05 – NAV og dokumentasjon | Fristen, den manglende arbeidstidssiden og ventetiden vises gjennom frokostbord og hverdagsplaner. Å sende, spørre og motta kvittering er forskjellige handlinger. |
| C06 – Skoleveien | Ragnhilds snarvei, Eiriks tidsfrist og den udekkede kryssingen ved nedkjørselen er den dramatiske konflikten. Observasjon gjennomføres først i senere scene; ingen nye målinger eller beslutninger er oppfunnet. |
| C07 – Arvid og fellesskapet | Tidligere vakt, gjestebesøk, avlysning, hjemmekveld og avslag gir forskjellige utgangspunkt. Spilleren kan søke fellesskap uten automatisk å bli frivillig. |
| C17 – Renholdet | 45 minutter igjen av vakta, Karis rapport og Aminas advarsel gjør ansvarsfordelingen konkret. Lageret er fortsatt sperret og ikke rengjort. |
| C23 – Feilinformasjonen | Rettelsen, hvem som faktisk mottok den, og tapt planleggingstid får menneskelig vekt. Bekreftet forståelse er ikke det samme som tilgivelse. |

**Strukturkontroll:** Før hvert GitHub-lagrepass er den gamle og den nye scenelisten sammenlignet med kun `tittel`, `tekst`, `valg[].tekst` og `valg[].konsekvensTekst` unntatt. Nøyaktig 40 eksisterende scener har endringer; alle tekniske identifikatorer, betingelser, effekter, flagg, relasjoner, tidskrav og øvrige scener er uendret i disse sju filene. Dette er ikke en utført Node-/UI-test eller full litterær godkjenning.

**Neste redaksjonelle port:** Les de resterende Wave A–E-scenene som hele fortellinger, særlig overgangen fra B til C og repetisjoner i NAV-/prosjektløpene. Tydelige karakterer og meningsfulle valg må finnes også utenfor denne utvalgte bolken. Før godkjenning: én relevant teknisk test av siste commit og faktisk norsk gjennomspilling på tvers av de åtte historieløpene. PR #6382 skal forbli draft til dette er gjort. Wave G er ikke startet.

## Åttende redaksjonelle pass – overgangene mellom Wave B og C (19. oktober 2026)

**33 eksisterende scener omskrevet, med 66 reviderte valg og 66 konsekvenstekster**, fordelt på alle åtte historieløp. Bolken inneholder **16 Wave B-scener og 17 Wave C-scener**. Endringene ligger i sju historiefiler; ingen scener er lagt til.

| Løp | B | C | Konkrete redaksjonelle endringer |
| --- | ---: | ---: | --- |
| C01 Jonas og økonomien | 2 | 2 | Sen avlysning får personlig pris for Jonas; det åpne forslaget om te handler om tillit, ikke ny kalenderadministrasjon. |
| C02 Mira og musikken | 2 | 2 | Manglende tilbud får følelsesmessig konsekvens; Mira setter grenser for arrangørens ubestemte forespørsler og beholder eierskap til låten. |
| C03 Lea og prototypen | 2 | 2 | Sorg over å stå utenfor samarbeidet, konkret forskjell mellom tynne og tykke kort, og spenning mellom stolthet og korrekt formidling av testbegrensninger. |
| C05 NAV | 2 | 2 | Registrert dokument, forsinket innsending og etatenes manglende lesbarhetskontroll får faktisk betydning for hverdagen og økonomisk usikkerhet. |
| C06 Skoleveien | 2 | 2 | Funn fra **én telling 07.45–08.00, sju gående, tre med skolesekk** settes opp mot Eiriks press på å gjøre teksten konkluderende; grener uten observasjon får fortsatt ingen fiktive tall. |
| C07 Arvid og fellesskapet | 2 | 2 | Sen avlysning, savn etter miljøet og uønskede gruppeinvitasjoner gjør sosial kontakt og frivillig arbeid til to forskjellige ting. |
| C17 Renholdet | 2 | 2 | Drift undersøker den tunge hylla uten å flytte den; rapporteringspress, Karis rolle og misforståtte arbeidsresultater blir konkret konflikt. |
| C23 Feilinformasjonen | 2 | 3 | Sendt rettelse er ikke tilgivelse; brukte arbeidstimer kan ikke hentes tilbake; bedre mal er ikke dokumentasjon på gjenopprettet tillit. |

**Kontroll ved redigering:** For hver av de sju JSON-filene ble alle sceneobjekter sammenlignet før lagring etter at kun `tittel`, `tekst`, `valg[].tekst` og `valg[].konsekvensTekst` var utelatt. Antallet endrede scener var eksakt 33; scene-ID-er, valg-ID-er, flagg, forutsetninger, meter- og relasjonseffekter, dager og trådføring er bevart. To språkfeil i bolken ble rettet etter lagring. Ingen Node-/UI-tester eller full litterær godkjenning er påstått.

**Neste steg:** Redaksjonell helhetslesning av alle A–F-overganger, særlig gjentakelser av samme handlingsmønster i C05, C06 og C23 og hvorvidt spillerens valgte retning merkes i den samlede fortellingen. Deretter én målrettet teknisk kontroll og norsk spillgjennomgang før draft-PR vurderes for publisering. Wave G holdes tilbake.

## Gjenstående før redaksjonell godkjenning

Denne revisjonen er **ikke** en full litterær godkjenning av alle 217 scener i A–F. Flere tidligere scener, spesielt i C01–C07, trenger fortsatt sammenhengende gjennomspilling og selektiv omskriving. Forutgående scenevalg og deres konsekvenstekster må leses samlet mot nye Wave F-scener for å fange overgangsfeil. De faktiske meter-effektene må verifiseres i spillmotoren, og hele løpene bør spilles av mennesker på norsk. Ingen av de automatiske testene kan bevise naturlig dialog eller god dramatikk.

**Publiseringskrav:** Én relevant teknisk kontroll på siste commit, samt en faktisk redaksjonell gjennomspilling av de åtte hele historieløpene. Ikke start Wave G før kvaliteten i A–F er tilfredsstillende. Ikke utvid administrative QA-systemer i stedet for å forbedre historiene.

## Niende redaksjonelle pass – fra saksstatus til opplevd hverdag (19. oktober 2026)

**30 eksisterende scener** i Wave D/E er skrevet om med **60 valgtekster og 60 konsekvenstekster**. Fordeling: C01 10, C05 12, C03 2, C07 2 og C23 4. Endringene ligger i fem eksisterende historiefiler. Ingen scener, valg eller tidsporter er lagt til.

**Hovedfunn:** I de senere kapitlene kunne karakterene bli redusert til statusfelt og avventende dokumentasjon. Jonas-forløpet hadde særlig mange nesten identiske scener om ubestemt kontakt; NAV-løpet gjentok «mottatt, men ikke avgjort» uten nok hverdagslig bevegelse; C03 og C23 beskrev ofte rutiner og maler snarere enn menneskene som måtte leve med dem. Arvid-historien trengte tydeligere skille mellom savnet etter fellesskapet og press om å stille opp. Revisjonen bruker konkrete, beskjedne hendelser – kollektivtransport, kjøkken, butikker, en venns optimisme, prototypen ved bordet – uten å skape oppdiktede svar fra tredjepart.

**Kontinuitet:** C01 innfører ingen bekreftet avtale eller ny respons fra Jonas. C05 lar mottak, lesbarhet, vurdering og vedtak forbli forskjellige forhold. C03 gjennomfører ingen ny test eller deling med personopplysninger. C07 oppretter ingen vakt eller bekreftet utmelding. C23 gjør ikke en sendt rettelse til forståelse eller forsoning. De godt differensierte C06- og C17-scenene er beholdt uten nye tekstendringer i denne bolken; C06 har fortsatt bare én faktisk telling fra 07.45 til 08.00 (sju personer, tre med skolesekk), og lagerhindringen i C17 står fast.

**Kontroll før commit:** Maskinell sammenligning av hver endret scene mot originalen med bare `tittel`, `tekst`, `valg[].tekst` og `valg[].konsekvensTekst` utelatt. Antall scener, scene- og valg-ID-er, alle tekniske betingelser, effekter, flagg, målere, relasjoner, låser, tidsgrenser og øvrige felter skal være identiske. Dette er datakontroll av omskrivingen, **ikke** full Node-test eller norsk UI-gjennomspilling.

**Videre port:** Les fortellingskjeder med varierende valgretning i Wave A–F, særlig dialogrytmen og konsekvenstekstene der samme situasjon gjentas. Kjør én målrettet teknisk test på endelig commit, og gjennomfør faktisk norsk gjennomspilling av alle åtte løp før PR #6382 vurderes for merge. PR beholdes som draft; Wave G avventes.

## Tiende redaksjonelle pass – scener som opplevelser og reelle veivalg (19. oktober 2026)

**25 eksisterende scener i Wave A–E** er skrevet om, med **50 reviderte valgtekster og 50 konsekvenstekster**, fordelt på alle åtte historieløp: C01 4, C02 2, C03 3, C05 2, C06 3, C07 2, C17 3 og C23 6. Endringene ligger i sju eksisterende JSON-filer. Det er ikke opprettet nye scener.

**Hva som ble bedre:** Jonas får mer hverdagslig stillhet og tvetydighet mellom kontakt og pause. Mira får konkrete musikalske øyeblikk, uten å miste eierskapet til låten eller godta en ubekreftet jobb. Leas prototype følger kostnaden ved avlysninger og et samarbeid som har opphørt. NAV-papirene er fortsatt viktige, men blir satt opp mot middag, uro og retten til en vanlig kveld. Skoleveien viser presset fra Eirik uten å la en anbefaling bli til et vedtak eller et kart bli til en observasjon. Arvid-sporet skiller savn etter menneskene fra frivillige oppgaver. Renholderen må forholde seg til Karis rapporteringspress uten å registrere en sperret lagerdør som ferdig rengjort. C23 får mer naturlig dialog og færre repetisjoner av «Lea» og registreringsstatus, med tydelig forskjell mellom en sendt rettelse, et mottatt svar og reparert tillit.

**Faktagrensene er bevart:** C06 inneholder fortsatt bare den ene observerte perioden 07.45–08.00, med sju passeringer og tre med skolesekk; grener uten telling har ikke fått nye tall. C17 har ingen flyttet hylle og ingen ferdigvasket lager. C23 skaper ingen oppdiktede svar, forsoning eller ny leveringsavtale. C05 skaper ingen NAV-avgjørelse. C02 skaper ingen bekreftet konsert. C03 skaper ingen ny prøve. Endrede dialogreplikker i allerede etablerte samtaler endrer ikke registrerte tredjepartssvar.

**Maskinell kontroll før commit:** Alle endrede JSON-objekter er sammenlignet med utgangspunktet etter at bare `tittel`, `tekst`, `valg[].tekst` og `valg[].konsekvensTekst` er fjernet. Dermed er scene- og valg-ID-er, effekter, forutsetninger, flagg, relasjoner, dager, tråder og øvrige strukturfelt identiske. Dette er en strukturkontroll, ikke en full Node-regresjon eller faktisk norsk nettlesergjennomspilling.

**Neste port:** En samlet litterær lesning med alternative valg over A–F, én relevant teknisk kontroll på siste commit og faktisk norsk UI-gjennomspilling av de åtte historiene må til før PR #6382 kan vurderes for merge. PR beholdes som draft. Wave G utsettes fortsatt.
