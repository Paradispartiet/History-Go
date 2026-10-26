# Statsvitenskap – første avgrensede berikelse av den kanoniske Politikk-teksten (bølge 4)

Dato: 21. oktober 2026  
Forarbeid: PR #6483, #6489 og #6492

## Utført

Dette er første endring av **eksisterende, kanoniske læremateriale** i dette statsvitenskapsarbeidet. Den er målrettet og konservativ:

| Endret kanonisk eier | Før | Ny presisering |
| --- | --- | --- |
| `met_pol_institusjonell_tilbakegangsanalyse` | Regelendring, institusjonell kapring, selektiv håndheving | Skille legitime grep for valgintegritet fra misbruk av kontrollmyndighet ved å undersøke uavhengighet, lik behandling, tidsrekkefølge og dokumenterte konkurransevirkninger |
| `met_pol_policyprosessanalyse` | Dagsorden, beslutning, implementering og feedback | Undersøk kollektivt valg, aktørers kapasitet, deliberasjon og sosial samhandling over tid; test rivalforklaringer |
| `met_pol_policy_design_og_virkemiddelanalyse` | Mål, virkemidler, insentiver, regulering og kapasitet | Skille langvarige klimamål fra revisjon av tidsavgrensede støtte- og reguleringsvirkemidler; krev dokumenterte effekter |
| `curriculum_architecture_politikk_v1.json`, komparativ politikk | Generell fagoversikt | Nytt forklarende avsnitt om valgtilsyn, valgkontroll og demokratisk tilbakegang |
| `curriculum_architecture_politikk_v1.json`, offentlig politikk | Generell fagoversikt | Nytt avsnitt om klimapolitikkens ulike former for politisering og mål–virkemiddel-skillet |

Kun allerede eksisterende metode-ID-er og `disciplinary_fields` er endret. Beholdt: **13 domener, 71 metoder, 7 fagfelt**. Nye domener, metode-ID-er, claims, vurderingsoppgaver eller teori-ID-er: **0**.

## Dokumentert kildegrunnlag

Kilder er åpne Cambridge-tekster, ikke bokomtaler alene.

1. Rosalind Dixon og David Landau, *Constitutions and Abusive Electoral Regulation*, i *The Entrenchment of Democracy* (2024), kap. 3, s. 46–60. [Cambridge, DOI 10.1017/9781009447713.004](https://www.cambridge.org/core/books/entrenchment-of-democracy/constitutions-and-abusive-electoral-regulation/ADE7BE2B536CAF2D3C37B985126AC5D7). Forfatterne undersøker hvordan valgorganers myndighet både kan forsvare valgintegritet og misbrukes ved kapring eller selektiv håndheving.
2. Caroline Kuzemko, *Conceptualising Climate Change Mitigation Politics*, i *Climate Politics* (2026), kap. 3, s. 45–71. [Cambridge, DOI 10.1017/9781009455725.003](https://www.cambridge.org/core/books/climate-politics/conceptualising-climate-change-mitigation-politics/641C6340D3256BFBDD9B2E688FBE6EB4). Kuzemko videreutvikler særlig Colin Hays forståelse av politikk som kollektivt valg, kapasitet, deliberasjon og sosial samhandling.
3. Caroline Kuzemko, *Politicising Climate Change Mitigation Policy*, kap. 8, s. 208–227. [Cambridge, DOI 10.1017/9781009455725.008](https://www.cambridge.org/core/books/climate-politics/politicising-climate-change-mitigation-policy/B599075D5190D07E5DF1F306BF5C8AB6). Argumentet skiller opprettholdelse av klimapolitikkens overordnede mål fra varigheten av hvert enkelt virkemiddel.

Kildeattribusjon: Dixon og Landau er kapittelforfattere. Ginsburg, Huq og Khaitan er redaktører for volumet, ikke opphavspersoner til hvert enkelt kapittel. Kuzemkos rammeverk har en eksplisitt gjeld til Hay.

## Hva denne revisjonen ikke viser

- Dette er **en kontrollert berikelse av eksisterende metodeveiledning**, ikke utvinning av nye bekreftede empiriske claims fra forfatternes casestudier.
- Hele `concepts_politikk_canonical_v1.json` og `emner_politikk_canonical_v4_5.json` er store og kunne ikke hentes gjennom tilgjengelig GitHub-filhandling i denne arbeidsøkten. Det er derfor ikke riktig å hevde at en fullstendig begreps- eller emneaudit er ferdig. Den konkrete dedupliseringen gjelder tre fullt undersøkte metodeposter, tilknyttede kanoniske domeneoversikter og to eksisterende fagoversikter.
- Yasmin Dawoods diskusjon av grunnlovsfestet stemmerett står fortsatt i kilde-/redaksjonssjiktet inntil begrepskontroll mot stemmerett og rettighetsanalyse kan gjøres.
- Ingen ny oppgave er lagt til quizmotoren. Dette arbeidet krever også empiriske kilder og tilfredsstillende motforklaringer før nye casebaserte spørsmål publiseres.

## Kvalitetsport

Testen `tests/politikk-advanced-political-science-canonical-enrichment-v4.test.mjs` skal verifisere beholdte ID-er, de konkrete nye tekstskillene, kapittel–DOI–URL-samsvar og at fulltekst- og konseptaudit ikke fremstilles som fullført.

## Neste trinn

Fullføre målrettet begreps-/emnesøk gjennom et verifiserbart filuttak, deretter skrive en kildebelagt, caseforankret vurderingsoppgave til eksisterende metode og domene. Skill kildenes faglige forklaring fra primærkilder til empiriske caser.
