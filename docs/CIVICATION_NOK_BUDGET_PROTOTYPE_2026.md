# Civication: kroneøkonomi – første budsjettprototype

Status: arbeidsutkast, ikke aktivert. Kontrollerte kilder 16.11.2026.

1 PC skal tilsvare 1 NOK. Beregningsgrunnlaget gjelder én voksen aleneboende i Oslo og én butikkjobb. Beregningene er delt mellom testverktøy og eksisterende økonomimotor. Forhåndsvisning kan lese faktisk saldo, men utbetaler ikke penger. Kroneøkonomien er ikke aktivert for spillere.

Kilder og forutsetninger finnes per felt i JSON-filen. Virkes trinn 1 fra april 2026 gir 31 694 kroner brutto månedlig ved heltid; tariff er ikke universell minstelønn for alle butikker. Skattemodellen bruker årsinntekt, standardfradrag, trinnskatt og trygdeavgift for ordinær voksen lønnstaker. Den illustrerer gjennomsnittlig årsskatt, ikke faktisk månedlig skattekorttrekk. Feriepenger, trekkfrie perioder, gjeldsrenter, fagforening, formue, andre inntekter og individuelle fradrag er ikke modellert.

SSBs 2025-referanse for ettroms i Oslo/Bærum er 10 090 kroner månedlig; dette er statistikk, ikke en tilgjengelig bolig eller en verifisert 2026-markedspris. Oslo-satsen 9406 for livsopphold er en normbasert budsjettproxy, ikke en SIFO-beregning. Mat, klær og kommunikasjon ligger i denne samleposten og må ikke legges til en gang til. Strøm på 1000 kroner er fortsatt en eksplisitt scenarioantakelse. Transport bygger nå på Ruters voksenbillett for sone 1: 655 kroner for 30 dager, kontrollert 16.11.2026 mot https://ruter.no/aktuelt/produkter/prisen-gar-ned. Budsjettposten 664,10 kroner per måned er en normalisert årsekvivalent (655 × 365 / 30 / 12), ikke en faktisk månedsbillett eller månedlig regning. En transportbetaling må senere få 30-dagers intervall; dagens månedsregninger skal ikke brukes som erstatning.

| Scenario | Netto lønn/mnd | Innvilget støtte | Utgifter | Rest |
|---|---:|---:|---:|---:|
| Butikkmedarbeider 100 % | 25 829,60 | 0 | 21 160,10 | 4 669,50 |
| Arbeidsledig uten vedtak | 0 | 0 | 21 160,10 | −21 160,10 |
| Kun illustrert innvilget livsopphold | 0 | 9 406 | 21 160,10 | −11 754,10 |

Støttescenarioet er ikke et løfte om NAV-utbetaling. Arbeidsledighet alene utløser ingen fast sats. Sosialhjelp vurderes individuelt, bolig/strøm kan vurderes separat, og dagpenger krever egen opptjenings-/rettighetsmodell. Modellen skal senere skille søknad, vedtak, beløp og utbetalingsdato. Den statlige satsen 8300 og Oslo-satsen 9406 må ikke blandes.

## Videre implementasjon før aktivering

### Tre måneders kontrollgrunnlag

`projectMonths` beregner separate månedsscenarier i hele øre. Testen bruker eksplisitte sparepenger på 15 000 kroner, én måned med illustrert innvilget støtte på 9406 og deretter to måneder i butikkjobb. Sluttsaldo blir 3245,90, 7915,40 og 12584,90 kroner etter oppdatert transportgrunnlag. Støtte videreføres ikke automatisk. Uten inntekt vises udekket behov; negativ prosjektert saldo er ikke en innvilget kreditt eller en faktisk wallet-transaksjon. Skatt årsberegnes separat per scenario og må ikke fremstilles som samlet skatteoppgjør for et år med jobbskifte.

Boliggjennomgang: `CivicationHome.applyRentTick` bruker virkelige kalenderuker, mens `applyHousingPeriodCosts` bruker virkelige kalendermåneder. Begge gamle funksjoner belaster økonomisk kapital. På grenen returnerer begge nå uten trekk eller lagringsskriv for eksplisitt aktive NOK-v1-lommebøker. `civication-nok-home-charge-owner.test.js` kontrollerer uendret kapital, boligdata og wallet, samt at gamle spillere beholder gammel oppførsel. Ingen produksjonsaktivering gjøres av sperren. Full avstemming av boligpress, gammel betalingsknapp og øvrige boligtekster gjenstår før aktivering.

### Gjenstående runtimearbeid

Regningsgrensen `CivicationEconomyEngine.payNokInvoice(id)` er implementert på grenen. Den krever `wallet.nok_v1.active === true` og `version === 1`, én entydig lagret regning med kilde-ID, gyldig spillforfall og et ikke-negativt beløp med ørepresisjon. Beløp kan ikke leveres fra UI til betalingskallet. Saldo og regningens betalt-status skrives sammen gjennom eksisterende `CivicationState.updateWallet`. Ubetalte regninger uten dekning beholdes; betaling oppretter ingen kreditt. Opptjente dager og tidligere uke-/leveveisoppgjør bevares. Testene bruker eksplisitte versjonerte wallet-fixturer og beviser betaling/reload/avslag, ikke produksjonsaktivering eller faktisk bokostnad.

Automatisk regningsopprettelse fra allerede lagrede avtaler er implementert på grenen. `nok_v1.recurringBills` lagrer entydig avtale-ID, kilde-ID, månedsbeløp, første forfallsdato og valgfri sluttdato. Kalenderen oppretter én regning per avtale og måned fra aktiveringsdatoen til gjeldende spillmåned, også etter utsatt tick. Den opprinnelige forfallsdagen beholdes som regel: den 31. blir siste dag i februar og den 31. igjen i mars. Ingen regning før aktivering etterfaktureres. Opprettelse trekker ingen penger, og betalte regninger bevares ved reload. Endrede vilkår som strider mot en utstedt regning stoppes; nye avtalevilkår trenger en egen versjonert avtale-ID. Ugyldige eller dupliserte avtaler/regninger avvises før nye regninger skrives.

Regningene genereres før lønnsoppgjøret, og lønnsoppgjøret leser den ferske lommeboken slik at det ikke overskriver nye regninger med en gammel kopi. Samkjørt 90-dagerstest kontrollerer bevarte regninger gjennom alle tre lønnsoppgjør og betaling fra den opptjente saldoen. Egen `civication-nok-recurring-bills.test.js` dekker korte måneder, forsinket kjøring, utløpt avtale, konflikter, reload og ingen etterfakturering før migrasjonsdato.

Økonomivisningen `CivicationEconomyUI` er implementert under Kommers. Den viser faktisk saldo, opptjent brutto/estimert skatt/netto, siste lønnsoppgjør, regningsforfall, betalt-status og betaling via eksisterende `payNokInvoice(id)`. Fremtidige regninger og regninger uten dekning har deaktivert knapp; motoren kontrollerer fersk saldo igjen ved klikk. Resultatet varsles med `role=status`, og fokus beholdes i panelet etter oppdatering. Lagret tekst rendres som tekst, ikke HTML. Inaktive lommebøker viser PC-saldo og tydelig beskjed om at kroneøkonomien ikke er aktivert, uten betalingsknapper. Butikkvisningen leser samme kanoniske saldo og håndterer eldre numerisk saldo korrekt.

DOM-testen `civication-nok-economy-ui.test.js` bruker den faktiske kalenderen, økonomimotoren og UI-modulen med eksplisitt NOK-wallet-fixture: betaling endrer saldo/betalt-status én gang, reload/tegning gjør ingen writes, og endret saldo mellom visning og klikk avvises. Dette er ikke fysisk mobil-/Safari-QA eller en organisk aktivert spillerreise. Egen butikkvisningstest dekker korrekt saldokilde.

`migrateNokEconomy(config)` er implementert i eksisterende økonomimotor. Den krever en eksplisitt aktiv/godkjent 1:1-konfigurasjon; dagens prototypekonfigurasjon avvises. Eksisterende saldo i ørepresisjon, null og gjeld bevares uten multiplikator. Alle eldre wallet-felt beholdes; nye NOK-lister starter tomme uten retroaktiv inntekt eller oppdiktet leie. Uavregnede gamle lønnsdager, ukjent NOK-state, ugyldig saldo/kalender eller aktiv jobb uten støttet kontrakt stopper migreringen før skriving. Et eksisterende NOK-v1-oppsett initialiseres ikke på nytt. Testen bruker en uttrykkelig godkjenningsfixture; dataene i repoet er fortsatt ikke godkjent for aktivering. UI-/boot-kall til migreringen gjenstår.

Faktisk `CivicationHome.selectDistrict`/flytting kaller nå `acceptNokHousing(districtId)` for NOK-spillere. Motoren krever én eksplisitt `config.housingOffers`-oppføring med ID, districtId, kilde-ID og månedlig leie i kroner. Manglende mapping avvises, uten å omtolke gamle 3–14-PC-priser som markedsleie. Første fulle leieperiode forfaller på valgt dato, senere perioder følger samme dag i måneden. Det genereres ikke depositum, prorata eller refusjon automatisk. Gjentatt valg oppretter ikke ny avtale. Ved flytting avsluttes gammel avtale på spilledatoen og ubetalte regninger med forfall fra denne datoen kanselleres; eldre forfalte og betalte regninger bevares. Ny bolig lagres sammen med kontrakten i wallet og er autoritativ over en foreldet `civi_home_v1`-projeksjon. Kortene viser konfigurert kroneleie per måned. Oppføringer i boligtesten er uttrykkelige leie-fixturer, ikke annonser eller dokumenterte bydelspriser. Katalogen har nå én kildebelagt statistisk startprofil: ettroms til 10 090 kroner fra SSB 09895, Oslo/Bærum 2025. Den er plassert på Sagene som et eksplisitt fiktivt spillvalg, ikke som dokumentert Sagene-pris eller en faktisk annonse. UI viser skillet og første hele leieperiodes forfall før valg; valg uten prisgrunnlag deaktiveres. Ytterligere boligprofiler og 2026-annonser er ikke dokumentert. Prototypen er fortsatt ikke aktivert.

`CivicationJobs.acceptOffer` oppretter nå `nok_salary_contract` ved faktisk aksept av et støttet jobbtilbud for aktive NOK-spillere. Katalogens konkrete karriere og rolletittel må samsvare nøyaktig, og tilbudet må oppgi eksplisitt numerisk stillingsprosent over 0 og høyst 100. `pushOffer` bevarer dette feltet. Kontrakten binder jobb-ID, tariffkilde, stillingsprosent og tilbudsnøkkel. Ingen lønn betales ved aksept. Jobber uten mapping eller med manglende/ugyldig stillingsprosent avvises før jobb-/tilbudsstatus endres. Canonical State og Jobs brukes i testen; tilbud/eligibilitet er uttrykkelige boundary-fixturer, ikke organisk quizopptjening. Starttilbud og kontraktsvisning er lagt til, se kontrollene nedenfor.

Månedslønn er koblet til eksisterende `recordCompletedDay` og `tickWeekly` på grenen for eksplisitt aktive `nok_v1`-lommebøker. Hver fullførte dag lagrer sin andel av brutto og estimert skatt fra en kildebundet `activePosition.nok_salary_contract` som matcher budsjettets jobb-ID og kilde. Stillingsprosent er eksplisitt. Månedens øre fordeles over dens faktiske antall dager; samlet måned er nøyaktig lik månedsbeløpet. Lønnsledger og saldo skrives samlet først etter månedsskiftet. Dobbelt dagskall, tick og reload gir ingen ny opptjening eller utbetaling. Ukjente jobber uten kontrakt stoppes i stedet for å få antatt lønn.

`tests/civication-nok-payroll.test.js` bruker eksplisitt aktiverings-/jobbfixture og spiller 90 kalenderdager: januar heltid, fjorten lønnsdager i februar og arbeidsledighet resten. Fra 125,25 kroner blir saldoene 25 954,85, 38 869,65 og 38 869,65. Dette er en økonomisk runtime-test, ikke en organisk jobb-/brukerreise. Den gamle ukelønnen og automatiske NAV-grenen kjøres ikke i NOK-modus. Gamle oppgjørsmarkører bevares, så dagens leveveisbro utbetaler heller ikke gamle småbeløp automatisk; levevei trenger egen kronekontrakt før aktivering. Organisk jobbtilbud og produksjonsaktivering gjenstår.

- Koble konkret jobb og stillingsprosent til eksisterende dagsopptjening. Badge-nivå alene skal ikke fastsette realistisk yrkeslønn.
- Bruk 12 måneder eller faktisk kalender; fire uker er ikke en måned. Ukentlig opptjening kan vises med år/52, men er ikke en ekstra månedslønn.
- Avklar én eier av bolig, andre utgifter og skatt; boligmodulen belaster i dag kapital, som ikke må dobbelbelastes fra wallet ved ny kobling.
- Del opp butikkpakker i konkrete varer; boligkjøp, husleie og bundet depositum er ulike poster. Dokumenter faktisk pris/kilde/dato før aktivering.
- Bevar gamle saldoer og oppgjørsmarkører uten vilkårlig oppskalering. Ny økonomiversjon må starte ved tydelig grense, bevare gamle kjøp og kunne gjenopprettes.
- Vis brutto, estimert skatt, netto, forfall, innvilget støtte og udekket behov i eksisterende UI.
- Kontroller tre spillmåneder med jobbskifte, deltid, kjøp, støttevedtak, reload og ingen doble trekk.

Kjørbar kontroll: node tests/civication-nok-budget-preview.test.js. Beregningen bruker ingen nettverk eller brukerdata. Prototype og aktiveringskrav må ikke omtales som publisert kroneøkonomi.


### Starttilbud og vilkår før aksept

NOK-profilen kan produsere et eget butikkmedarbeidertilbud etter fem faktisk lagrede
næringslivsmeritter, med eksisterende jobbport tilgjengelig og åpen. Terskelen følger
første inngang i karrierekatalogen; dette er spillprogresjon, ikke en yrkeskvalifikasjon.
Tilbudet har egen stabil nøkkel og gjenskapes ikke etter avslag. Meritter og jobbport
kontrolleres igjen ved aksept. Aksept oppretter kontrakten uten å betale lønn.
Stillingsprosent, brutto, årsberegnet skatteanslag og netto vises foran akseptknappen.
Ukjente lønnsvilkår sperrer aksept i NOK-modus. Produksjonsaktivering er fortsatt av.

Målrettet kontroll: `node tests/civication-nok-starter-offer.test.js`, eksisterende
jobbkontrakttest, pris-/budsjettkontroller og JavaScript-syntaks. Starttilbudstesten
bruker faktisk jobbport og lagrede kategorilåser; den beviser ikke organisk quizopptjening
eller visuell godkjenning i nettleser. Disse akseptansesjekkene gjenstår.

### Sammenheng mellom jobb- og boligvisningene

Den gamle UI-oppsummeringen og jobbkortet viser nå kontraktens månedlige brutto,
estimert skatt/netto og stillingsprosent for NOK-spillere. Et eldre weekly-snapshot
kan ikke overstyre dette. Manglende kontrakt vises eksplisitt, og arbeidsledighet
viser null lønn uten å etablere noen stønad. Legacy-spillere beholder ukebeløpene.

UI-innstegene for hjem/nabolagsvelger delegerer til CivicationHome i NOK-modus;
leievilkår og sperrede prisprofiler overlever dermed også den gamle popupflyten.
NOK-boligkort viser ikke kapitalpris/gratis eller råd beregnet fra gammel kapital.
Valgt bolig peker til regningene under Kommers fremfor den gamle husleieknappen.

`civication-nok-display-integration.test.js` kjører State, Jobs, delt beregning,
Home og UI i JSDOM: vilkår før aksept, faktisk aksept uten utbetaling, deltidslønn,
legacy-snapshot som ikke overstyrer, begge boliginnsteg og legacy-fallback.
Start-prices, housing-contract, home-charge-owner og starter-offer består også.
Nettleserens visuelle sluttkontroll og produksjonsaktivering gjenstår.

### Eksplisitt aktiveringsflyt

Økonomipanelet laster profilen uten å skrive spillerdata. Bare en profil med både
`status: active`, `migration.activated: true` og 1 PC = 1 NOK kan vise «Ta i bruk
kroneøkonomi». Repoets nåværende prototype er fortsatt sperret og viser ingen
aktiveringsknapp. Knappen bruker den eksisterende migreringsfunksjonen, forklarer
uavregnet gammel lønn eller manglende lønnskontrakt og oppdaterer øvrige paneler
etter vellykket overgang. Ingen aktivering skjer ved oppstart eller innlasting.

`civication-nok-activation-ui.test.js` bruker faktiske State/Calendar/Budget/Engine/UI
med en uttrykkelig godkjenningsfixture: ingen writes ved lasting, gammel lønn og
ustøttet jobb stopper, saldo/historikk/kjøp bevares, gjentatt klikk gjentar ikke
overgangen og fokus beholdes. Produksjonsfilen forblir inaktiv i samme test.
Aktiverings-UI er dermed implementert; datagrunnlag, organisk ende-til-ende-reise
og visuell mobilkontroll må avklares før profilen kan gjøres aktiv.

### Transport: faktisk 30-dagerskjøp

Ruters offisielle prisoversikt er kontrollert 16.11.2026: voksen sone 1 koster
655 kr for 30 dager (oppdatert 16.09.2026). Transportprofilen har nå produkt-ID,
kontrolldato og eksplisitt valgfritt forhåndsbetalt kjøp uten automatisk fornyelse.
Budsjettets 664,10 kr/mnd er fortsatt bare en årsekvivalent, aldri en belastning.

`purchaseNokTransportPass` leser pris og kilde fra spillerens frosne profil,
kontrollerer fersk saldo og gyldig spillklokke og lagrer saldo/kvittering samlet.
Billetten starter ved kjøpet og utløper etter nøyaktig 30 × 1440 spillminutter.
Aktiv billett sperrer et nytt kjøp; utløp, månedsskifte og innlasting trekker ingenting.
Gyldighet og kjøpsknapp vises under Transport i økonomipanelet. Dette registrerer
billettens kjøp/gyldighet i spillet, men innfører ingen nye porter for kartreiser.
Prisgrunnlaget er et datert 2026-scenario; det er ikke historiske billettpriser for
hver dato på spillkalenderen. Prisreduksjonen må kontrolleres på nytt før april 2027.

`civication-nok-transport-pass.test.js` kjører faktiske State/Calendar/Engine/UI:
31. januar til 2. mars ved samme klokkeslett, grenseminutt, skuddår, tre separate
kjøp uten månedsregning, dobbeltkjøp, manglende dekning, endret saldo etter tegning,
ugyldige priser, bevart gammel historikk og innlasting. Eksisterende økonomi-UI,
aktivering, månedlige regninger, 90-dagers lønn og budsjettberegning består også.
Produksjonsaktivering er fortsatt av.
