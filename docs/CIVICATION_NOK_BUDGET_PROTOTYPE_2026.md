# Civication: kroneøkonomi – første budsjettprototype

Status: arbeidsutkast, ikke aktivert. Kontrollerte kilder 16.11.2026.

1 PC skal tilsvare 1 NOK. Denne første leveransen er et kjørbart, frakoblet beregningsgrunnlag for én voksen aleneboende i Oslo og én butikkjobb. Den er ikke en ny økonomimotor: ingen spillstate leses, ingen penger utbetales, og eksisterende økonomimotor skal eie senere integrasjon.

Kilder og forutsetninger finnes per felt i JSON-filen. Virkes trinn 1 fra april 2026 gir 31 694 kroner brutto månedlig ved heltid; tariff er ikke universell minstelønn for alle butikker. Skattemodellen bruker årsinntekt, standardfradrag, trinnskatt og trygdeavgift for ordinær voksen lønnstaker. Den illustrerer gjennomsnittlig årsskatt, ikke faktisk månedlig skattekorttrekk. Feriepenger, trekkfrie perioder, gjeldsrenter, fagforening, formue, andre inntekter og individuelle fradrag er ikke modellert.

SSBs 2025-referanse for ettroms i Oslo/Bærum er 10 090 kroner månedlig; dette er statistikk, ikke en tilgjengelig bolig eller en verifisert 2026-markedspris. Oslo-satsen 9406 for livsopphold er en normbasert budsjettproxy, ikke en SIFO-beregning. Mat, klær og kommunikasjon ligger i denne samleposten og må ikke legges til en gang til. Strøm og transport på 1000 hver er eksplisitte scenarioantakelser som fortsatt må erstattes av dokumenterte forbruks-/prisprofiler.

| Scenario | Netto lønn/mnd | Innvilget støtte | Utgifter | Rest |
|---|---:|---:|---:|---:|
| Butikkmedarbeider 100 % | 25 829,60 | 0 | 21 496 | 4 333,60 |
| Arbeidsledig uten vedtak | 0 | 0 | 21 496 | −21 496 |
| Kun illustrert innvilget livsopphold | 0 | 9 406 | 21 496 | −12 090 |

Støttescenarioet er ikke et løfte om NAV-utbetaling. Arbeidsledighet alene utløser ingen fast sats. Sosialhjelp vurderes individuelt, bolig/strøm kan vurderes separat, og dagpenger krever egen opptjenings-/rettighetsmodell. Modellen skal senere skille søknad, vedtak, beløp og utbetalingsdato. Den statlige satsen 8300 og Oslo-satsen 9406 må ikke blandes.

## Videre implementasjon før aktivering

- Koble konkret jobb og stillingsprosent til eksisterende dagsopptjening. Badge-nivå alene skal ikke fastsette realistisk yrkeslønn.
- Bruk 12 måneder eller faktisk kalender; fire uker er ikke en måned. Ukentlig opptjening kan vises med år/52, men er ikke en ekstra månedslønn.
- Avklar én eier av bolig, andre utgifter og skatt; boligmodulen belaster i dag kapital, som ikke må dobbelbelastes fra wallet ved ny kobling.
- Del opp butikkpakker i konkrete varer; boligkjøp, husleie og bundet depositum er ulike poster. Dokumenter faktisk pris/kilde/dato før aktivering.
- Bevar gamle saldoer og oppgjørsmarkører uten vilkårlig oppskalering. Ny økonomiversjon må starte ved tydelig grense, bevare gamle kjøp og kunne gjenopprettes.
- Vis brutto, estimert skatt, netto, forfall, innvilget støtte og udekket behov i eksisterende UI.
- Kontroller tre spillmåneder med jobbskifte, deltid, kjøp, støttevedtak, reload og ingen doble trekk.

Kjørbar kontroll: node tests/civication-nok-budget-preview.test.js. Beregningen bruker ingen nettverk eller brukerdata. Prototype og aktiveringskrav må ikke omtales som publisert kroneøkonomi.
