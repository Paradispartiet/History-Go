# Rockefeller – fullquizkvalitet for v1 (1. november 2026)

Denne pakken reviderer eksisterende fullquiz i stedet for å opprette nye quiz-ID-er. 30/30 spørsmål og 10/10 QuizCard-spørsmål bevares, inkludert `rockefeller_quiz_1`–`30`.

Endret: q4 bruker nå arrangørens 1300-plassers kapasitet, q26 bruker arrangørens 500-plassers kapasitet for John Dee, q6/q24/q30 har direkte historiske og stedsspesifikke spørsmål, og q28 spør direkte om scene- og størrelsesforskjellen. QuizCard q4 synkroniseres fra samme spørsmål. Ingen dato- eller årstallskvote introduseres.

Kildene er Rockefellers offisielle Om oss og utleiesider samt Oslo byleksikon. Kildetallene 1350 (Oslo World) og 400 (Gateforening) erstattes av arrangørens oppdaterte tall, uten å endre kapasitetene til andre steder.

**Må kjøres før merge:** `npm run knowledge:canonical:write` for å synkronisere Knowledge-enheter, konsepter og rapporter med oppdaterte `knowledge`-tekster; deretter `npm run knowledge:canonical:check` og målrettet 30/10-kontroll. Identifikatorene skal bevares. Appvisning på mobil/desktop kreves fortsatt før `v1`-godkjenning. Gjeldende status: `v1_candidate`.

Kilder:
- https://www.rockefeller.no/om-oss
- https://www.rockefeller.no/booking-utleie-rockefeller
- https://www.rockefeller.no/booking-utleie-johndee
- https://www.rockefeller.no/booking-utleie-sentrumscene
- https://oslobyleksikon.no/side/Rockefeller
