# Statsvitenskap – kilde- og overlappsaudit, bølge 2 (21. oktober 2026)

## Beslutning og avgrensning

Viderefører [godkjent lesekanon](../../docs/superpowers/specs/2026-09-16-political-science-reading-canon-design.md) i de 13 eksisterende Politikk-domenene. Bøkene brukes til å avdekke reelle innholdshull, ikke som direkte grunnlag for nye teorier, metoder eller vurderingsoppgaver. Kildeverifikasjon av en bok er **ikke** fulltekstverifikasjon av en bestemt påstand.

Denne etappen:
- Verifiserer de syv aktive verkene som ikke var bibliografisk kontrollert i bølge 1. Dermed er **alle ni aktive verk kontrollert mot utgiver** (åtte sentrale og ett debattverk).
- Bevarer tre utsatte støtteverk som `pending_publisher_verification`.
- Dokumenterer syv preliminære mulige berikelser eller faglige kontraster mot eksisterende Politikk-metoder, uten å opprette nye kanoniske enheter.
- Promoterer **0** fulltekstbaserte claims og **0** vurderingsoppgaver. **0** nye domener og **0** nye metoder.

## Forlagsspor (bølge 2)

| Verk | Utgiveroppføring | Eksisterende faglig eier | Kontrollgrense |
| --- | --- | --- | --- |
| Ginsburg / Huq / Khaitan (red.), *The Entrenchment of Democracy* (2024) | [Cambridge](https://www.cambridge.org/core/books/entrenchment-of-democracy/55D38BD4680EA780B109ADD4A9844730) | `met_pol_institusjonell_tilbakegangsanalyse` | Volum og innholdsfortegnelse; kapittelbidrag ikke fulltekstkontrollert |
| Poguntke / Hofmeister (red.), *Political Parties and the Crisis of Democracy* (2024) | [Oxford](https://academic.oup.com/book/58013) | `met_pol_partisystemanalyse` | Bokabstrakt og kapitteloversikt |
| Brierley, *The Co-opted State* (2026) | [Cambridge](https://www.cambridge.org/core/books/coopted-state/coopted-state/EB9EBDDC38F28AD3FE375B8076773594) | `met_pol_forvaltningsanalyse` | Utgiveroppføring/innholdsfortegnelse, ikke forskningsdesign-revisjon |
| Nathan, *The Scarce State* (2023) | [Cambridge](https://www.cambridge.org/core/books/scarce-state/D382CEF9C02EFC54E9B8C3525F377A24) | `met_pol_makt_og_ulikhetsanalyse` | Forlagets kapitler, ikke full argumentkontroll |
| Farrell / Newman, *Underground Empire* (2023) | [Henry Holt / Macmillan](https://us.macmillan.com/books/9781250840554/undergroundempire/) | `met_pol_politisk_okonomianalyse` | Forlagsbeskrivelse og tilgjengelig utdrag |
| Kuzemko, *Climate Politics* (2026) | [Cambridge](https://www.cambridge.org/core/books/climate-politics/FE5D7432C2E2343F0FF17DBA50044362) | `met_pol_policyprosessanalyse` | Bok og kapitler lokalisert; selv om boken er åpent tilgjengelig, er fulltekstaudit ikke gjennomført |
| Mearsheimer / Rosato, *How States Think* (2023) | [Yale](https://yalebooks.yale.edu/book/9780300269307/how-states-think/) | `met_pol_utenrikspolitisk_analyse` | Debattverk; foreløpig bokbeskrivelse |

## Kontroll mot allerede registrerte 71 metoder

Politikk har allerede `met_pol_institusjonell_tilbakegangsanalyse`, `met_pol_partisystemanalyse`, `met_pol_forvaltningsanalyse`, `met_pol_makt_og_ulikhetsanalyse`, `met_pol_politisk_okonomianalyse`, `met_pol_policyprosessanalyse` og `met_pol_utenrikspolitisk_analyse`. Ingen av de syv verkene legitimerer derfor automatisk en ny metode-ID.

Hva som fortsatt må avgjøres:
1. **Demokrati og partier:** Om valgregulering, partiregulering og partiorganisatorisk motstandskraft allerede er presist dekket. Kapittelforfattere i redigerte bøker skal identifiseres særskilt.
2. **Byråkrati og lokalsamfunn:** Om styring av byråkratkarrierer (Brierley) og geografisk ujevnt statlig nærvær (Nathan) tilfører observerbare mekanismer utover det eksisterende.
3. **Politisk økonomi og klima:** Om økonomiske nettverksknutepunkter (Farrell/Newman) og politisering, institusjoner og feedback i klimapolitikk (Kuzemko) mangler nødvendig forklaring og begrensninger.
4. **Utenrikspolitisk rasjonalitet:** Mearsheimer/Rosato er et eksplisitt teoretisk standpunkt, ikke en avgjort beskrivelse. Kontrast til organisasjonsprosess, byråkratisk politikk, politisk psykologi og konstruktivisme er en sperre før formidling.

## Neste faglige kontroll

Begynn med de åpent tilgjengelige kapitlene hos Cambridge for Ginsburg/Huq/Khaitan og Kuzemko, og lag en dokumentert **kapittel–eksisterende-begrep–manglende-mekanisme**-matrise. For de øvrige: undersøk tilgjengelige kapitteltekster, metodebeskrivelser og rivalforklaringer. Først etter faktisk tekstkontroll kan én avgrenset eksisterende fagtekst berikes, med spesifikke henvisninger og vurderingsoppgave som prøver en dokumentert forskjell.

## Integritetsregler

`advanced_political_science_wave2_gap_matrix_v1.json` er en redaksjonell oppgave- og kildeoversikt, ikke et alternativt pensum. Testene krever fortsatt 13 domener, 71 metoder, riktig bokrolle og ingen ubegrunnet promotering. **Fulltekst-audit: 0 av syv bølge-2-spor.**
