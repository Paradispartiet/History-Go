# Rockefeller – fullquizkvalitet for v1 (1. november 2026)

Denne pakken reviderer eksisterende fullquiz i stedet for å opprette nye quiz-ID-er. 30/30 spørsmål og 10/10 QuizCard-spørsmål bevares, inkludert `rockefeller_quiz_1`–`30`.

Endret: q4 bruker nå arrangørens 1300-plassers kapasitet, q26 bruker arrangørens 500-plassers kapasitet for John Dee, q6/q24/q30 har direkte historiske og stedsspesifikke spørsmål, og q28 spør direkte om scene- og størrelsesforskjellen. QuizCard q4 synkroniseres fra samme spørsmål. Ingen dato- eller årstallskvote introduseres.

Kildene er Rockefellers offisielle Om oss og utleiesider samt Oslo byleksikon. Kildetallene 1350 (Oslo World) og 400 (Gateforening) erstattes av arrangørens oppdaterte tall, uten å endre kapasitetene til andre steder.

**Utført på PR-grenen:** `npm run knowledge:canonical:write` regenererte `data/knowledge/knowledge_units.generated.json`, `data/knowledge/concepts.generated.json` og Knowledge-kontraktrapporten. Målrettet 30/10-quiztest bestod. Den midlertidige skriverettighets-workflowen er fjernet etter generering. Før merge kontrolleres vanlig PR-CI og Knowledge-kontrakt. Quiz-ID-er og eksisterende primære Knowledge-ID-er er bevart. Appvisning på mobil/desktop kreves fortsatt før `v1`-godkjenning. Gjeldende status: `v1_candidate`.

Kilder:
- https://www.rockefeller.no/om-oss
- https://www.rockefeller.no/booking-utleie-rockefeller
- https://www.rockefeller.no/booking-utleie-johndee
- https://www.rockefeller.no/booking-utleie-sentrumscene
- https://oslobyleksikon.no/side/Rockefeller
