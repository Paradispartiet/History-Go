# History Go – canonical regler for `desc` og `popupDesc`

Status: aktiv og bindende  
Versjon: 4.1 – dokumenterte stedfakta, ingen redaksjonell fylltekst  
Maskinlesbar mal: `data/places/regler/place_description_templates_v1.json`

## 1. Hovedregel

`desc` og `popupDesc` er brukerrettet kunnskapsinnhold. De skal fortelle **dokumenterte fakta om det konkrete stedet**.

Arbeidsrekkefølgen er alltid:

> inspectable kilder → konkrete stedfakta → prioritering → sammenhengende tekst

Aldri:

> kategori eller læringsmål → ønsket budskap → konstruert tekst

Teksten skal svare på spørsmål som:

- Hva er dette stedet?
- Når ble det etablert, bygget, brukt, endret eller avviklet?
- Hvem gjorde hva her?
- Hva ble produsert, besluttet, oppført, fremført, oppdaget eller ødelagt?
- Hvilke bygninger, verk, arter, gjenstander, mål eller fysiske spor finnes?
- Hva skjedde senere?

En setning som ikke kan støttes av en kildebelagt stedspåstand, skal ikke stå i `desc` eller `popupDesc`.

## 2. Hard fakta-port

Før en tekst kan godkjennes, skal følgende være sant:

1. Hver faktisk påstand kan føres tilbake til en inspectable kilde eller annet godkjent kildegrunnlag.
2. Hvert avsnitt inneholder konkrete holdepunkter som navn, dato, handling, objekt, funksjon, mål, resultat eller dokumentert endring.
3. Sammenheng og årsaksforklaringer brukes bare når kildene faktisk dokumenterer dem.
4. Manglende stoff løses med mer research, aldri med analysefyll, moralske konklusjoner eller redaksjonelle forklaringer.
5. Teksten kan leses som en selvstendig stedartikkel uten kjennskap til History Go, datastrukturen eller produksjonsprosessen.

Abstrakte ord som «betydning», «spenning», «rolle», «identitet», «åpenhet», «sikkerhet», «transformasjon» og «samfunn» er ikke fakta alene. De kan bare brukes når de knyttes til en konkret beslutning, hendelse, aktør, bygning, plan eller dokumentert konflikt.

Svakt:

> Sikkerhet og åpenhet skaper en spenning som blir synlig i området.

Sterkere:

> Reguleringsplanen fra 2017 la inn perimetersikring, nye byrom og forbindelser for gående og syklende.

## 3. `desc`

`desc` er et konsentrert, faktabasert hovedsammendrag.

Normal målramme:

- 40–80 ord;
- normalt 2–4 setninger;
- normalt minst fire konkrete fakta eller opplysninger når kildegrunnlaget tillater det.

`desc` bør vanligvis fortelle:

1. hva stedet er;
2. når det ble oppført, åpnet, etablert eller tatt i bruk;
3. hvem eller hva som er sentralt;
4. hva som gjør stedet spesielt.

Unngå åpninger som:

- «Stedet viser hvordan …»
- «Stedet symboliserer …»
- «Stedet knytter … sammen»
- «Stedet gjør det mulig å forstå …»
- «Stedet spiller en viktig rolle i …»

## 4. `popupDesc`

`popupDesc` er en fullverdig, selvstendig stedartikkel.

### Bindende lengderegel

- minst 300 ord;
- normalt 300–600 ord;
- minst tre avsnitt;
- normalt 12–30 setninger;
- normalt minst tolv konkrete fakta eller opplysninger;
- minst to tredeler av opplysningene skal være nye sammenlignet med `desc`.

Lengden skal aldri oppnås gjennom gjentakelse, generell analyse, oppramsing uten sammenheng eller interne produksjonsforklaringer.

### Relevante innholdslag

Bruk bare de lagene kildene gir godt stoff til:

1. grunnfakta og sentralt tidsrom;
2. opprinnelse, etablering eller første dokumenterte bruk;
3. navngitte aktører, institusjoner, virksomheter eller arter;
4. faktisk bruk, produksjon, aktivitet eller funksjon;
5. hendelser, konflikter, resultater og funksjonsskifter;
6. fysiske detaljer, materialer, mål, teknikk, landskap eller observerbare spor;
7. en minneverdig dokumentert detalj;
8. dagens faktiske bruk, bevarte spor eller det som forsvant.

Dette er en researchsjekkliste, ikke en fortellermal.

## 5. Forbudt brukerrettet metatekst

Følgende hører aldri hjemme i `desc` eller `popupDesc`:

- «History Go kan bruke stedet til …»;
- «I History Go …»;
- «Se hvordan …» eller «Husk at …» som spillerinstruksjon;
- hva spilleren skal, bør eller kan forstå;
- hvilken kategori, quizvinkel eller pedagogisk funksjon stedet har;
- hvorfor redaksjonen har valgt stedet;
- kartpunkt, områdeanker, markøridentitet eller representasjonslogikk;
- koordinatstatus, geometri, kildeinnhenting, validering eller auditstatus;
- canonical-ID-er, interne felt, datamodell eller produsentinstruksjoner;
- forklaringer om at ett sted «må holdes adskilt» fra et annet i datasettet;
- formuleringer som forsvarer hvorfor teksten eller markøren er laget på en bestemt måte.

Slike opplysninger skal ligge i egne felt som `coordNote`, `sourceHint`, produksjonsbrief, auditrapport eller dokumentasjon.

Forbudt eksempel:

> Den autoritative kartidentiteten må være stabil nok til å romme videre utvikling.

Tillatt faktatekst:

> Planområdet ble fastsatt i den statlige reguleringsplanen fra 2017 og avgrenses av Akersgata og Møllergata.

## 6. Ingen oppkonstruert «mest interessant»-konklusjon

Et avsnitt skal ikke konstrueres for å gi stedet en generell faglig «spenning» eller lesning. Påstander om konflikt, debatt eller motsetning må knyttes til dokumenterte aktører, vedtak og hendelser.

Ikke skriv:

> Åpenhet betyr ikke fravær av beskyttelse; sikkerhet betyr heller ikke utilgjengelighet.

Skriv det kildene faktisk dokumenterer:

> Reguleringsplanen la til rette for perimetersikring, offentlige byrom og ferdsel for gående og syklende.

## 7. Innhold før analyse

Prioriter:

- egennavn;
- årstall og tydelige tidsrom;
- hendelser og handlinger;
- bygninger, verk, produkter, arter og gjenstander;
- materialer, mål og tekniske løsninger;
- konkrete funksjoner og bruk;
- endringer, konflikter og resultater;
- overraskende, dokumenterte detaljer.

Hver setning skal helst tilføre minst én ny opplysning. Setninger som bare hevder at et sted er viktig, sentralt, komplekst eller betydningsfullt, skal erstattes med det som faktisk gjør det slik.

## 8. Sammenheng uten fortellertvang

Fakta kan organiseres gjennom:

- kronologi;
- virksomhet eller institusjon;
- bygg eller anlegg;
- hendelse eller konflikt;
- person eller verk;
- naturprosess;
- faktisk kontrast mellom før og nå.

Det er ikke et krav at alle steder ender i samfunnsanalyse, maktteori, identitet, metode, bevegelse eller kobling til vår tid.

## 9. Underholdning uten oppdiktning

Underholdning skal komme fra virkeligheten og kildene:

- presise tall og størrelser;
- uventede hendelser;
- konkrete menneskelige valg;
- rekorder, feil, konflikter og tilfeldigheter;
- dramatiske funksjonsskifter;
- detaljer som er lette å huske.

Ikke dikt opp dialog, tanker, publikumsreaksjoner, vær, lyder eller stemning.

## 10. Rollefordeling

`popupDesc` skal være rik og selvstendig. Mer info kan romme:

- full kronologi;
- lange årsaks- og konsekvensforklaringer;
- konkurrerende tolkninger og teori;
- forbindelser til andre steder og emner;
- kildeapparat og videre lesning.

People-popup er riktig sted for en full biografi og forbindelser utenfor det aktuelle stedet.

Dette skal aldri brukes som begrunnelse for å gjøre `popupDesc` kort eller generisk.

## 11. Kategoriene velger relevante fakta

Kategorimalene er researchhjelp, ikke fortellermotorer.

- `by`: bygg, arkitekt, byggeår, funksjon, materiale, mål, transportløsning og ombygging;
- `historie`: hendelse, dato, aktør, handling, gjenstand og bevarte spor;
- `kunst`: verk, kunstner, år, materiale, størrelse, teknikk og plassering;
- `litteratur`: forfatter, verk, stedstilknytning, arbeidsperiode, utgivelse og episode;
- `musikk`: artist, konsert, innspilling, scene, instrument, teknologi og publikumshendelse;
- `naeringsliv`: bedrift, grunnlegger, produkt, etableringsår, produksjon, marked og omstilling;
- `natur`: arter, naturtype, geologi, habitat, sesong, atferd og observerbare kjennetegn;
- `politikk`: institusjon, beslutning, møte, aksjon, aktører, konflikt og resultat;
- `sport`: lag, utøver, kamp, turnering, rekord, resultat, arena og rivalisering;
- `vitenskap`: forsker, institusjon, spørsmål, instrument, metode, funn og anvendelse.

Det mest interessante og best dokumenterte ved stedet skal komme først.

## 12. Ingen generisk kobling til i dag

`popupDesc` trenger ikke avsluttes med hvorfor stedet er relevant nå.

Avslutt heller med:

- dagens faktiske bruk;
- hva som er bevart;
- hva som forsvant;
- et konkret resultat;
- siste dokumenterte tidslag;
- en minneverdig stedsspesifikk detalj.

## 13. Variasjon

- Ikke bruk samme åpning på alle stedene.
- Ikke avslutt alle popuptekster med en generell konklusjon.
- Ingen tekst skal kunne flyttes til et annet sted ved bare å bytte egennavnet.
- Hvert sted skal inneholde flere opplysninger som ikke passer på et lignende nabosted.
- Lange popuptekster skal variere mellom kronologi, hendelser, aktører, fysisk beskrivelse og minneverdige detaljer.

## 14. Ferdigkriterium per sted

Et sted er ferdig når:

1. `desc` gir et konsentrert faktasammendrag;
2. `popupDesc` er minst 300 ord;
3. teksten har minst tre avsnitt;
4. hver faktisk påstand er kildebelagt;
5. hvert avsnitt inneholder konkrete stedsholdepunkter;
6. teksten tilfører vesentlig ny informasjon;
7. spilleren lærer navn, hendelser, årstall, funksjoner og særegne detaljer;
8. flere normale quizspørsmål kan lages direkte fra teksten;
9. teksten er interessant uten oppdiktning;
10. ingen redaksjonell, pedagogisk, kartteknisk eller intern metatekst står i brukerinnholdet.
