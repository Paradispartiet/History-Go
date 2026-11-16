# Civication: kroneøkonomi – første budsjettprototype

Status: arbeidsutkast, ikke aktivert. Kontrollerte kilder 16.11.2026.

1 PC skal tilsvare 1 NOK. Beregningsgrunnlaget gjelder én voksen aleneboende i Oslo og én butikkjobb. Beregningene er delt mellom testverktøy og eksisterende økonomimotor. Forhåndsvisning kan lese faktisk saldo, men utbetaler ikke penger. Kroneøkonomien er ikke aktivert for spillere.

Kilder og forutsetninger finnes per felt i JSON-filen. Virkes trinn 1 fra april 2026 gir 31 694 kroner brutto månedlig ved heltid; tariff er ikke universell minstelønn for alle butikker. Skattemodellen bruker årsinntekt, standardfradrag, trinnskatt og trygdeavgift for ordinær voksen lønnstaker. Den illustrerer gjennomsnittlig årsskatt, ikke faktisk månedlig skattekorttrekk. Feriepenger, trekkfrie perioder, gjeldsrenter, fagforening, formue, andre inntekter og individuelle fradrag er ikke modellert.

SSBs 2025-referanse for ettroms i Oslo/Bærum er 10 090 kroner månedlig; dette er statistikk, ikke en tilgjengelig bolig eller en verifisert 2026-markedspris. Oslo-satsen 9406 for livsopphold er en normbasert budsjettproxy, ikke en SIFO-beregning. Mat, klær og kommunikasjon ligger i denne samleposten og må ikke legges til en gang til. Strøm og transport på 1000 hver er eksplisitte scenarioantakelser som fortsatt må erstattes av dokumenterte forbruks-/prisprofiler.

| Scenario | Netto lønn/mnd | Innvilget støtte | Utgifter | Rest |
|---|---:|---:|---:|---:|
| Butikkmedarbeider 100 % | 25 829,60 | 0 | 21 496 | 4 333,60 |
| Arbeidsledig uten vedtak | 0 | 0 | 21 496 | −21 496 |
| Kun illustrert innvilget livsopphold | 0 | 9 406 | 21 496 | −12 090 |

Støttescenarioet er ikke et løfte om NAV-utbetaling. Arbeidsledighet alene utløser ingen fast sats. Sosialhjelp vurderes individuelt, bolig/strøm kan vurderes separat, og dagpenger krever egen opptjenings-/rettighetsmodell. Modellen skal senere skille søknad, vedtak, beløp og utbetalingsdato. Den statlige satsen 8300 og Oslo-satsen 9406 må ikke blandes.

## Videre implementasjon før aktivering

### Tre måneders kontrollgrunnlag

`projectMonths` beregner separate månedsscenarier i hele øre. Testen bruker eksplisitte sparepenger på 15 000 kroner, én måned med illustrert innvilget støtte på 9406 og deretter to måneder i butikkjobb. Sluttsaldo blir 2910, 7243,60 og 11577,20 kroner. Støtte videreføres ikke automatisk. Uten inntekt vises udekket behov; negativ prosjektert saldo er ikke en innvilget kreditt eller en faktisk wallet-transaksjon. Skatt årsberegnes separat per scenario og må ikke fremstilles som samlet skatteoppgjør for et år med jobbskifte.

Statisk boliggjennomgang: `CivicationHome.applyRentTick` bruker virkelige kalenderuker, mens `applyMonthlyRent` bruker virkelige kalendermåneder. Begge belaster økonomisk kapital. Ny kroneintegrasjon må eksplisitt overta boligbetaling for versjonerte spillere og deaktivere begge gamle betalingsveier for dem; forhåndsvisningen endrer ingen av disse funksjonene. Dette funnet beviser ikke at begge funksjoner faktisk er kjørt for samme spiller.

### Gjenstående runtimearbeid

Regningsgrensen `CivicationEconomyEngine.payNokInvoice(id)` er implementert på grenen. Den krever `wallet.nok_v1.active === true` og `version === 1`, én entydig lagret regning med kilde-ID, gyldig spillforfall og et ikke-negativt beløp med ørepresisjon. Beløp kan ikke leveres fra UI til betalingskallet. Saldo og regningens betalt-status skrives sammen gjennom eksisterende `CivicationState.updateWallet`. Ubetalte regninger uten dekning beholdes; betaling oppretter ingen kreditt. Opptjente dager og tidligere uke-/leveveisoppgjør bevares. Testene bruker eksplisitte versjonerte wallet-fixturer og beviser betaling/reload/avslag, ikke produksjonsaktivering eller faktisk bokostnad.

Automatisk regningsopprettelse fra avtaler, UI-handling, konto-migrasjon og avvikling av gamle boligtrekk er fortsatt ikke implementert. Ingen produksjonskode oppretter aktiveringsmarkøren ennå.

Månedslønn er koblet til eksisterende `recordCompletedDay` og `tickWeekly` på grenen for eksplisitt aktive `nok_v1`-lommebøker. Hver fullførte dag lagrer sin andel av brutto og estimert skatt fra en kildebundet `activePosition.nok_salary_contract` som matcher budsjettets jobb-ID og kilde. Stillingsprosent er eksplisitt. Månedens øre fordeles over dens faktiske antall dager; samlet måned er nøyaktig lik månedsbeløpet. Lønnsledger og saldo skrives samlet først etter månedsskiftet. Dobbelt dagskall, tick og reload gir ingen ny opptjening eller utbetaling. Ukjente jobber uten kontrakt stoppes i stedet for å få antatt lønn.

`tests/civication-nok-payroll.test.js` bruker eksplisitt aktiverings-/jobbfixture og spiller 90 kalenderdager: januar heltid, fjorten lønnsdager i februar og arbeidsledighet resten. Fra 125,25 kroner blir saldoene 25 954,85, 38 869,65 og 38 869,65. Dette er en økonomisk runtime-test, ikke en organisk jobb-/brukerreise. Den gamle ukelønnen og automatiske NAV-grenen kjøres ikke i NOK-modus. Gamle oppgjørsmarkører bevares, så dagens leveveisbro utbetaler heller ikke gamle småbeløp automatisk; levevei trenger egen kronekontrakt før aktivering. Jobbtilbud/aksept, lønnskontrakt-generering og produksjonsaktivering gjenstår.

- Koble konkret jobb og stillingsprosent til eksisterende dagsopptjening. Badge-nivå alene skal ikke fastsette realistisk yrkeslønn.
- Bruk 12 måneder eller faktisk kalender; fire uker er ikke en måned. Ukentlig opptjening kan vises med år/52, men er ikke en ekstra månedslønn.
- Avklar én eier av bolig, andre utgifter og skatt; boligmodulen belaster i dag kapital, som ikke må dobbelbelastes fra wallet ved ny kobling.
- Del opp butikkpakker i konkrete varer; boligkjøp, husleie og bundet depositum er ulike poster. Dokumenter faktisk pris/kilde/dato før aktivering.
- Bevar gamle saldoer og oppgjørsmarkører uten vilkårlig oppskalering. Ny økonomiversjon må starte ved tydelig grense, bevare gamle kjøp og kunne gjenopprettes.
- Vis brutto, estimert skatt, netto, forfall, innvilget støtte og udekket behov i eksisterende UI.
- Kontroller tre spillmåneder med jobbskifte, deltid, kjøp, støttevedtak, reload og ingen doble trekk.

Kjørbar kontroll: node tests/civication-nok-budget-preview.test.js. Beregningen bruker ingen nettverk eller brukerdata. Prototype og aktiveringskrav må ikke omtales som publisert kroneøkonomi.

