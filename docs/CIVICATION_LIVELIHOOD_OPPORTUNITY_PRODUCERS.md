# Civication — livelihood opportunity producers

Status: runtime-kontrakt v1, 2026-08-13.

## Hvorfor dette laget finnes

`CivicationLivelihoods` kan motta og avregne kildeførte inntektsmuligheter. Dette laget svarer på neste spørsmål: **hvor kommer mulighetene fra i selve livet?**

Produksjonsreglen er:

`hendelse / menneske / sted / livsmiljø → opportunity → spillerens eksplisitte aksept → livelihood stream → økonomisk avregning`

Ingen produsent får skrive direkte til wallet.

## 1. Løste hendelsesvalg

`CivicationLivelihoodOpportunityBridge.attachToEngine()` wrapper en konkret `CivicationEventEngine`-instans uten å endre selve Event Engine-klassen.

Før et svar løses fanger broen den pending hendelsen og det valgte svaret. Etter `answer()` opprettes livelihood opportunity bare når:

- svaret faktisk returnerer `ok: true`;
- den valgte choice/eventen eksplisitt inneholder `livelihood_opportunity` eller `livelihood_opportunities`;
- opportunity-dataene passer den canonicale `CivicationLivelihoods.createOpportunity()`-kontrakten.

Choice-metadata på svar A kan dermed aldri lekke hvis spilleren velger B. Et feilet svar kan heller aldri materialisere et økonomisk tilbud.

Hvis metadata ikke har egen `source`, avleder broen kildeproveniens fra selve hendelsen: event-ID, source/source_type og subject/title. Det er fortsatt inspiserbart hvorfor tilbudet eksisterer.

## 2. Livsposisjonsnettverk

`data/Civication/livelihoodOpportunityTemplates.json` inneholder et første sett små sideinntektsmuligheter som kan dukke opp fordi spilleren faktisk deltar i et miljø.

Dette er **ikke** automatisk lønn fra livsposisjonen. Forløpet er:

1. spilleren har selv valgt en livsposisjon;
2. én template matcher badge + aktiv livsposisjon;
3. en deterministisk ukessjanse avgjør om miljøet gir et tilbud;
4. tilbudet dukker opp som pending livelihood opportunity;
5. spilleren kan ta eller avslå;
6. først etter aksept kan økonomien avregne det.

Samme template + uke har deterministisk ID og deterministic chance. Reload kan derfor verken rerolle eller spamme tilbud.

## Startersett

Første sett dekker ulike måter et levd fag-/interesseliv kan gi små, realistiske økonomiske muligheter:

- Historievandrer → hjelp på lokalhistorisk vandring;
- Maker → liten prototype;
- Sofafilosof → samtalekveld;
- Gallerivanker → ekstravakt på åpning;
- Scenehenger (scenekunst) → praktisk riggehjelp;
- Nabolagskjenner → enkel byromsregistrering;
- Scenehenger (musikk) → praktisk konsertcrew;
- Skrivebordspoet → kort introduksjonstekst;
- Artsjeger → avgrenset feltregistrering;
- Klubbmenneske → klubbarrangement/kiosk/materiell;
- Frilanser → lite kundeoppdrag;
- Gangster → **lovlig** flyer-/riggjobb i undergrunnsmiljøet;
- Filmklubbmenneske → praktisk visningshjelp;
- Medievaktbikkje → avgrenset researchnotat fra åpne kilder.

Psykologi er bevisst ikke i startersettet. En ikke-klinisk psykologi-livsposisjon skal ikke bli en snarvei til betalt quasi-klinisk arbeid.

## Økonomisk skala

Startertilbudene ligger med små beløp relativt til ordinære Civication-lønninger. De skal føles som sideinntekt, ikke som en skjult karrierestige.

Direkte utgifter ligger separat der materialer, transport eller arrangementskostnader er relevante.

## Grenser

Opportunity-produsenter kan aldri:

- gi formell jobb;
- gi autorisasjon eller profesjonsmyndighet;
- gi folkevalgt eller utnevnt verv;
- betale før spilleren aksepterer tilbudet;
- skrive direkte til wallet;
- gjøre en livsposisjon til en automatisk inntektskilde;
- opprette ulovlig inntektsmekanikk bare fordi en livsposisjon er «sprø» eller subkulturell.

Alternative liv skal kunne være ville og morsomme uten at Civication forveksler det med tilfeldig kriminalitet eller gratis penger.

## Neste utvidelse

Samme kontrakt kan nå brukes av:

- konkrete Life Story-scener;
- venn-/nettverkshendelser;
- stedshendelser;
- festival, kamp, premiere og sesong;
- publisering, salg og produksjon;
- prosjekt-/støttehendelser.

Nye produsenter skal sende opportunities gjennom denne broen eller direkte til `CivicationLivelihoods.createOpportunity()` med eksplisitt provenance, aldri lage egne økonomilag.
