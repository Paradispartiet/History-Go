# Civication: kroneøkonomi – budsjettprototype

Status 17.11.2026: implementert på arbeidsgren, produksjonsprofil ikke aktivert.
Dette dokumentet beskriver gjeldende tilstand og erstatter tidligere etappevise
statusavsnitt. Kilde-/prisgrunnlag finnes per felt i
`data/Civication/economy/nok-budget-prototype-2026.json`.

## Omfang og beregningsgrunnlag

1 PC tilsvarer 1 NOK. Startprofilen gjelder én voksen aleneboende i Oslo og tre
konkrete lønnsprofiler. Bredere yrkesdekning, boligprofiler og fullstendig livsopphold gjenstår.
Forhåndsvisningen beregner scenarioer uten å betale penger eller opprette regninger.

| Post | Grunnlag | Avgrensning |
| --- | --- | --- |
| Butikklønn, heltid | Virke/HK trinn 1, 31 694 kr brutto/mnd fra april 2026 | Tariffreferanse, ikke universell minstelønn |
| Skatt | 2026-regler i profilens kildebelagte skattefelt | Årsberegnet anslag, ikke skattekort |
| Netto i heltidsscenario | 25 829,60 kr/mnd | Standardfradrag og ordinær voksen lønnstaker |
| Leie | SSB 09895, Oslo/Bærum ettroms 2025: 10 090 kr/mnd | Statistikk, ikke boligannonse eller verifisert 2026-bydelspris |
| Livsopphold | Oslo-norm 9 406 kr/mnd | Samlet budsjettproxy, ikke SIFO-handlekurv, stønad eller faktura |
| Strøm | SSB tredje kvartal 2026: 1,234 kr/kWh × antatt 500 kWh = 617 kr/hel måned | Samlet effektiv pris etter støtte, inkludert nettleie/avgifter; forbruket er en spillantakelse |
| Transport | Ruter voksen sone 1, 655 kr/30 dager | Budsjettets 664,10 kr/mnd er bare årsekvivalent |

Skatteanslaget modellerer ikke feriepenger, trekkfrie perioder, gjeldsrenter,
fagforeningsfradrag, formue, andre inntekter eller individuelle fradrag. Ved skifte
mellom deltid/heltid brukes årsberegning per kontraktsscenario; dette er ikke et
samlet skatteoppgjør for et blandet inntektsår. Arbeidsledighet gir ingen automatisk
NAV-utbetaling. Innvilget stønad krever senere egen søknads-/vedtaksmodell.

## Aktivering, kalender og lønn

`migrateNokEconomy(config)` krever uttrykkelig godkjent konfigurasjon med
`status: active`, `migration.activated: true` og 1:1-kurs. Produksjonsfilen har
`prototype_not_activated` og `false`; økonomipanelet viser derfor ingen
aktiveringsknapp. Godkjent testprofil kan aktiveres via eksisterende UI. Ingen
aktivering eller økonomisk migrering skjer ved innlasting.

Eksisterende saldo, også null/gjeld, kjøp, historikk og oppgjørsmarkører bevares uten
multiplikator. Uavregnede gamle lønnsdager, ugyldig kalender/saldo eller aktiv jobb
uten støttet lønnskontrakt blokkerer før skriving. Et eksisterende NOK-oppsett
initialiseres ikke på nytt; profilens priser og vilkår fryses i walleten.
Nye katalogoppføringer oppdaterer derfor ikke tidligere frosne profiler automatisk.

Starttilbudet «Ekspeditør / butikkmedarbeider» krever fem faktisk lagrede meritter
og eksisterende kunnskaps-, karriere- og arbeidsgiverporter. Terskelen er
spillprogresjon, ikke yrkeskvalifikasjon. Rolletittelen følger canonical katalog;
den gamle korttittelen kan ikke brukes som lønnskobling. Standalone-skallet
initialiserer HGBrands før tilbud/UI; utilgjengelig register åpner ikke jobbporten.
Tilbudet har stabil nøkkel, gjenoppstår ikke etter avslag og kontrolleres på nytt
ved aksept. Stillingsprosent, brutto, anslått skatt og netto vises før aksept.
Aksept binder kontrakt/kilde og gir ingen pengebonus.

Økonomien bruker spillkalender med faktiske 28/29/30/31 dager og skuddår, ikke
virkelig klokke eller fireukersmåneder. Bare fullførte dager gir opptjening. Hele
månedens øre fordeles nøyaktig mellom dagene og utbetales ved månedsskifte gjennom
ledger. Gjentatte dagskall, tick og reload gir ingen ny utbetaling. Gamle ukelønns-
og automatiske stønadstrekk/-utbetalinger brukes ikke i NOK-modus. Ustøttede jobber
og leveveier får ingen oppdiktet kronekontrakt.

## Bolig, regninger og transport

Faktisk boligvalg via Home oppretter kildebundet leieavtale i samme wallet. Sagene
er en uttrykkelig fiktiv plassering av SSB-startprofilen, ikke en dokumentert
Sagene-pris. Vilkår vises før valg; andre bydeler uten priskobling er sperret.
Depositum, prorata og refusjon er ikke modellert. Første hele leieperiode forfaller
på valgdatoen; videre perioder følger samme dag i måneden, med kortmånedsjustering.
Ved flytting avsluttes gammel avtale og fremtidige ubetalte regninger kanselleres;
eldre forfalte og betalte regninger bevares. Gamle kapitalbaserte leietrekk er
sperret for NOK-spillere, og bolig-UI delegerer til samme avtaleeier.

Strøm knyttes til valgt boligprofil. Hver fullført dag med bolig registrerer sin
andel av månedens antatte forbruk/pris. Regning opprettes etterskuddsvis med forfall
første dag neste måned. Innflytting 10. januar gir 437,88 kr / 354,839 kWh i januar,
deretter 617 kr / 500 kWh per hel måned. Ingen ekstra nettleie, avgift eller
støttekreditt legges oppå effektiv pris. Gamle profiler uten strømkobling får ingen
retroaktiv fakturering.

Regningsopprettelse trekker ingenting. `payNokInvoice(id)` leser kildebundet beløp,
forfall og fersk saldo fra wallet; UI kan ikke sende et alternativt beløp. Saldo og
betalt-status lagres samlet. Ingen betaling før forfall, dobbeltbetaling eller
kreditt ved manglende dekning. Ubetalte krav bevares. Kontrakt-/regningskonflikter
stopper før nye skriver, og lønnsoppgjøret bevarer ferskt opprettede regninger.

Ruter-billetten kjøpes uttrykkelig og er gyldig i nøyaktig 30 × 1440 spillminutter
fra kjøpet. Ingen automatisk fornyelse, overlappende kjøp eller månedsfaktura.
Prisgrunnlaget er et datert 2026-scenario, ikke historisk pris for hver spilledato.
Prisreduksjonen må kontrolleres på nytt før april 2027. Kjøpet registrerer billett,
men innfører ingen ny port for kartreiser.

## Dagligvarer, kjøp og forbruk

Følgende pakningspriser er kontrollert på Odas produktsider 16.11.2026. De er daterte
spillreferanser uten levering/gebyrer, ikke sanntidspriser eller tilgjengelighetsløfter.

| Vare | Pakning | Kr | Kilde |
| --- | --- | ---: | --- |
| Tine Lettmelk 1 % | 1 l | 19,40 | https://oda.com/no/products/430-tine-tine-lettmelk-1-fett/ |
| AXA Bjørn Havregryn Store | 1,1 kg | 30,90 | https://oda.com/no/products/5953-axa-bjorn-havregryn-store/ |
| R Grovbrød, lettstekt | 750 g | 43,60 | https://oda.com/no/products/13753-r-grovbrod-lettstekt/ |
| Sopps Spaghetti | 500 g | 17,90 | https://oda.com/no/products/693-sopps-spaghetti/ |
| Gulrøtter 2. Sortering | 1 kg | 19,90 | https://oda.com/no/products/9212-gulrotter-2-sortering-norge/ |
| Bananer | 1 kg | 24,90 | https://oda.com/no/products/24854-bananer-ecuador-costa-rica/ |
| SEVAN Tørkede røde linser, hele | 900 g | 44,90 | https://oda.com/no/products/67920-sevan-torkede-rode-linser-hele/ |

De tre nye oppføringene bruker åpnet produktside, ikke eldre søkeresultater eller
kampanjepriser for andre pakninger. Gulrøttene er andre sortering, bananene selges
som 1 kg og linsene er tørre. Forbruk følger kjøpt pakningsvekt; det beregner ikke
bananskall, tilberedt vekt, kalorier eller en ernæringsmessig anbefalt porsjon.
Knappene registrerer valgte spillmengder: 250 ml melk eller 100 g av de øvrige varene.

Begge eksisterende butikkvisninger bruker samme HG_CiviShop og canonical wallet.
NOK-modus blokkerer gamle generiske pakkepriser og bruker bare frosset vareliste.
Hvert kjøp gjelder én pakning; fersk saldo/tilgang kontrolleres igjen ved klikk.
Saldo, kvittering med kilde/prisdato og beholdning lagres samlet. Gjentatt handlings-
ID skriver ikke på nytt, mens ny ID kan kjøpe samme vare igjen. Ingen stilbelønning
eller separat legacy-wallet-saldospeiling gis for mat.

Manuelt forbruk åpner pakninger ved behov og lagrer rest og forbrukshistorikk samlet
uten pengetrekk. Eksempel: to melkepakninger minus 250 ml gir én uåpnet pakning og
750 ml åpen rest. Siste mindre rest kan brukes. Fersk beholdning og felles kjøps-/
forbruks-ID-kontroll hindrer overforbruk og kollisjoner. Eide varer kan brukes etter
tapt butikktilgang; dette åpner ikke nye kjøp. Fokus beholdes eller flyttes til
panelets overskrift når varen blir tom. Innhold rendres som tekst, ikke HTML.

Dette er syv enkeltvarer og manuelt registrert pakningsforbruk, ikke et fullstendig
matbudsjett eller en daglig ernæringsmodell. Oslo-proxyen belastes ikke i tillegg
til varekjøp. Ingen automatisk bedervelse eller spiselig-andelmodell er innført.

## Gjenoppretting og verifikasjon

CloudSave bevarer versjonert wallet med kontrakt, lønnsledger, regninger, billetter,
matvarer og kvitteringer. `hg_job_offers_v1`, `quiz_progress`, `hg_learning_log_v1`
og `hg_pc_inventory_v1` inngår også uttrykkelig i backup. Konflikter sperrer
opplasting og bevarer begge kopier. Tidligere eiendeler/stiler bevares.

Målrettede kontroller dekker beregning, kalender, lønn, migrering/aktivering,
regninger/betaling, bolig, strøm, billett, tilbud/arbeidsgiver, butikk/forbruk,
fersk saldo/tilgang, fokus, inert tekst og legacy-atferd. `civication-nok-shop.test.js`
handler alle tre nye produkter gjennom begge UI-er, kontrollerer kvitteringer,
89,70 kr samlet pris, 100 g forbruk fra hver og bevart saldo/rest ved innlasting.

`acceptance-civication-nok-three-month-cloud-journey.test.js` besvarer 30 publiserte
Akerselva-spørsmål via faktisk QuizEngine/DOM, tjener fem meritter og aksepterer jobb
via UI. Den følger 90 dager, tre leier, tre strømregninger, to billetter, tre
varekjøp, fire forbruk, jobbtap i mars og tre gjenopprettinger på tom enhet.
Kontrollsaldoene er 9 376,56 / 13 723,26 / 12 451,26 kr. Aprilhusleien er generert,
men ubetalt utenfor de tre kontrollerte månedene. Ved slutt finnes én uåpnet melk,
500 ml åpen rest og 900 g havregryn. Ingen marslønn eller automatisk stønad.
Besøkt geografi, 125,25 kr inngående saldo og godkjent aktivering er fixtures;
dager fullføres ved økonomigrensen og CloudSave-backend er i minnet. Dette beviser
ikke 90 dagers private handlingsvalg eller en virkelig produksjonskonto.

`scripts/verify-civication-nok-browser.cjs` bruker faktisk Civication.html og vanlige
footer-/popup-/handlingsknapper i Chromium 390 px og WebKit 390/820 px. Den følger
aktivering, tilbudsvilkår, aksept, bolig, betaling, innkjøp, forbruk og reload,
kontrollerer horisontal plass, minst 44 px trykkhøyde, fokus og bevart wallet.
Godkjenning, 20 000 kr sparepenger, kvalifikasjoner og Tronsmo-besøk er uttrykkelige
fixtures. Ingen virkelig konto eller fysisk Safari-enhet testes. Scenariet venter
på kildeinnlasting før navigasjon og beholder feilbilder/navigasjonsdiagnostikk.

På head c64f450 bestod alle åtte workflows, inkludert full Civication-regresjon,
og alle tre nettleseroppsett. Seks skjermbilder ble manuelt inspisert. En tidligere
tom WebKit 820-side lot seg ikke gjenskape; årsaken er ikke entydig avklart.
Den utvidede nettleserreisen kjøper også de tre nye varene, bruker 100 g av hver og
forventer 9 800,90 kr, 750 ml melk og 900/900/800 g rest etter siste reload.
På head 2fcf255 bestod også alle åtte workflows og alle tre utvidede nettleseroppsett
med forventet saldo og beholdning. Alle seks lønns-/beholdningsbilder ble inspisert.
Produksjonsaktivering er fortsatt av. Tidligere grønn head beviser ikke en senere endring.

## Faktiske betalinger per spillmåned

`CivicationNokBudget.monthlyCashFlow` leser bare eksisterende kvitteringer og
oppgjør. Økonomipanelet viser utbetalt nettolønn, betalte regninger, varekjøp,
billettkjøp, samlet utgift og inn minus ut i gjeldende spillmåned. En sammenleggbar
liste viser betalingsdato, tekst og beløp per post. Dette er registrert kontantstrøm,
ikke en ny belastning eller beregnet inngående/utgående kontosaldo.

Lønn plasseres etter `paidDateISO`, selv når opptjeningsmåneden er en annen.
Regninger inngår bare når status er betalt, etter faktisk betalingsdato. Varer
føres etter kjøpskvitteringens spilldato og transport etter kjøpets spillminutt,
omregnet med samme spillkalender. Billettens utløpsdato bestemmer ikke kjøpsmåneden.
Opptjent, ubetalt lønn, ventende/kansellerte regninger, Oslo-proxyen, anslått
månedstransport og manuelt vareforbruk legges ikke til som ekstra betalinger.

Summer beregnes i hele øre. Ugyldig dato/beløp, doble oppgjørs-/kvitteringsnøkler,
ugyldige historikklister og overløp gir utilgjengelig oversikt uten delsummer.
Rendring endrer ingen spillerdata, og lagret tekst settes som tekst, ikke HTML.

`civication-nok-monthly-cash-flow.test.js` bruker faktiske State, Calendar, Engine,
Shop og EconomyUI med uttrykkelige historikk-/åpningssaldo-fixturer. Januaropptjening
utbetalt 3. februar vises i februar. Faktisk Betal-klikk, varekjøp og billettkjøp
gir 11 381,40 kr betalt og 14 448,20 kr inn minus ut i testens februar; forbruk,
ny tegning og modulinnlasting gjentar ingenting. Tidligere måneder, ugyldige data,
duplikater, ørepresisjon, overløp og inert tekst kontrolleres også.

Nettleserreisen er utvidet til å kontrollere 10 199,10 kr betalt (10 090 kr leie
og 109,10 kr varer) samt null utbetalt lønn på første spilledag. Den tar et eget
bilde av månedsoversikten i hvert nettleseroppsett. Resultat og visuell kontroll må
registreres for endringens faktiske head. På 0eb12c9 bestod alle åtte workflows,
alle tre nettleseroppsett og manuell kontroll av samtlige ni bilder.

## Tre yrker med deltids- og heltidstilbud

`job` bevarer den opprinnelige butikkprofilen; `jobs` inneholder tilleggsprofiler.
Felles resolver bruker entydig ID, kilde og canonical karriere/rolletittel. Ukjent
eller duplisert ID gir ingen lønn, og butikkens lønn brukes ikke for et annet yrke.
Gamle frosne profiler med bare `job` virker fortsatt, uten å få nye profiler automatisk.

| Profil | 100 % brutto/mnd | 50 % brutto/mnd | Grunnlag |
| --- | ---: | ---: | --- |
| Ekspeditør / butikkmedarbeider | 31 694,00 | 15 847,00 | Virke/HK trinn 1, fra 01.04.2026 |
| Renholder | 40 184,63 | 20 092,32 | Virke/NAF dagtid voksen 0–2 år, 247,29 kr/time fra 01.05.2026 |
| Lager- og driftsmedarbeider | 45 617,00 | 22 808,50 | Virke/Fellesforbundet voksen, 280,72 kr/time / 10 527 kr/uke fra 01.04.2026 |

Kilder kontrollert 17.11.2026:

- https://www.virke.no/tariff-og-lonn/finn-tariffavtale/landsoverenskomsten-hk/
- https://www.virke.no/tariff-og-lonn/finn-tariffavtale/renholdsoverenskomsten/
- https://www.virke.no/tariff-og-lonn/finn-tariffavtale/grossistoverenskomsten-ff/

Renhold og lager normaliseres med uttrykkelig antatt heltid på 37,5 t/uke og 52/12,
avrundet til månedlige øre. Dette er en avtalt månedsreferanse, ikke faktisk
timeregnskap. Renholdstilbudet gjelder et fiktivt tariffbundet renholdsfirma,
lagertilbudet en fiktiv tariffbundet grossist; ingen ekte bedrift påstås å ha gitt
tilbudet. Tillegg, feriepenger og individuell vaktplan er ikke modellert.
Renholdssatsen er tariffgrunnlag fra mai, ikke universell lovbestemt sats gjennom
hele 2026. Satsene brukes som datert scenario, ikke historisk tarifftidslinje.

Canonical spillgrenser er 5/8/10 meritter. Eksisterende knowledge-, karriere- og
reentry-porter beholdes; butikk krever fortsatt åpnet ekte arbeidsgiver gjennom
eksisterende bridge. Ferske meritter og tilbud kontrolleres igjen ved aksept.
Nøkkel per profil/prosent hindrer gjentakelser og bevarer gamle 100 %-nøkler.
Avslag/aksept gjøres ikke om av ny rendring; aktiv jobb sperrer ny aksept.

En velger i jobbkortet viser tilgjengelige tilbud. Prosent, brutto, skatt/netto,
kilde og avgrensninger vises før aksept; velgeren beholder fokus. Kontrakt, daglig
opptjening og migrering bruker samme profilresolver. Felles beregning avrunder
månedlig brutto og skatt i øre før netto fastsettes, slik at visning og oppgjør
stemmer også ved deltid. Årsskatten er fortsatt et anslag, ikke skattekort.

`civication-nok-multiple-jobs.test.js` kjører alle tre profiler × begge prosenter
gjennom faktiske canonical materialiserere, knowledge-/livs-/arbeidsgiverporter,
UI-velger, aksept og deretter 31 fullførte dager og månedslønn. Alle seks består
lokalt med samsvar i øre og ingen betaling ved aksept eller gjentatt tick.
Meritter, quizprogresjon, geografi og åpningssaldo er uttrykkelige testgrenser;
dette er ikke organisk quizopptjening eller 31 dagers private handlingsvalg.
Eksisterende starter-, wrapped-offer-, kontrakt-, migrering-, budsjett- og lønns-
kontroller brukes som regresjon. Nettleserreisen prøver alle seks tilbud gjennom
velgeren i hvert oppsett, tar renhold-/lagerbilder i 50 % og aksepterer deretter
den opprinnelige butikkjobben. Ti meritter er nå en eksplisitt nettleserfixture.
Ny nettleser-/CI-status må registreres for den faktiske headen.


