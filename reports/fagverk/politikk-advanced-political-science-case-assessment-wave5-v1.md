# Statsvitenskap – målrettet begrepsaudit og første empiriske vurderingskandidat (bølge 5)

**Dato:** 21. oktober 2026  
**Grunnlag:** PR #6493 (kanonisk metodeberikelse), `advanced_political_science_wave5_targeted_concept_audit_v1.json`, `advanced_political_science_wave5_election_case_assessment_v1.json`

## Verifisert registerkontroll

GitHub-filhandlingen returnerte ingen tekst for det store begrepsregisteret selv med linjeavgrensning. Hele innholdet ble derfor hentet som Git-blob fra kjent SHA og JSON-strukturen analysert programmatisk. Samme metode ble brukt på emneregisteret.

- **962/962 kanoniske begreper lest**, 962 unike begreps-ID-er og ingen dubletter etter normalisering av etiketter.
- **123/123 emner lest**, ingen uoppløste `source_emne_ids` fra begrepsregisteret.
- Det relevante, allerede aktive emnet er `em_pol_institusjonsfordypning_demokratisk_tilbakegang`.
- Den eksisterende metoden er `met_pol_institusjonell_tilbakegangsanalyse`.
- Relevante, allerede eksisterende begreper: demokratisk tilbakegang, institusjonell kapring, selektiv håndheving, mediekontroll, rettsstatsuthuling og competitive authoritarianism.
- Ingen nye domener, metoder, begreper eller claim-ID-er introdusert.

**Avgrensning:** Dette er full *maskinell* gjennomlesning av de to registrene og *målrettet* semantisk deduplisering for dette emnet, **ikke** en full ekstern faglig kvalitetsrevisjon av samtlige 962 begrepsdefinisjoner. At et begrep finnes, innebærer ikke at fenomenet er dokumentert i Polen.

## Empirisk case: Polen, parlamentsvalget 15. oktober 2023

ODIHRs offisielle oppsummering av sluttrapporten fra **27. mars 2024** og den felles valgobservasjonen fra **16. oktober 2023** (publisert av ODIHR 17. oktober) gir følgende kildebelagte skiller:

1. **Valgavvikling:** Valget hadde reell partipolitisk konkurranse, bredt valgtilbud og effektiv administrasjon; valgadministrasjonens beslutningsprosesser var imidlertid ikke tilstrekkelig åpne.
2. **Konkurransevilkår:** Regjeringspartiet hadde ifølge observatørene et klart fortrinn ved sammenfall mellom statlige informasjonskampanjer og partibudskap, bruk av statlige ressurser og partisk dekning i offentlig kringkasting.
3. **Slutningsgrense:** Ingen av disse nettsammendragene beregner et årsaksestimat for endrede stemmetall, beviser manipulert opptelling eller fastslår at valget juridisk var ugyldig.

**Casekilder:**
- [ODIHR, sluttrapportens offisielle oppsummering, 27. mars 2024](https://odihr.osce.org/odihr/elections/poland/565426).
- [ODIHR / OSCE PA / PACE, felles valgobservasjon, 16. oktober 2023](https://odihr.osce.org/odihr/elections/poland/555072).
- Faglig analysebakgrunn: Rosalind Dixon og David Landau, [*Constitutions and Abusive Electoral Regulation*](https://www.cambridge.org/core/books/entrenchment-of-democracy/constitutions-and-abusive-electoral-regulation/ADE7BE2B536CAF2D3C37B985126AC5D7), 2024, kap. 3. Brukes til metodisk distinksjon, **ikke** som faktakilde for Polen.

## Første kildebelagte vurderingskandidat

**Oppgave:** ODIHR fant at parlamentsvalget i Polen i 2023 var konkurransepreget og effektivt administrert, men at regjeringspartiet fikk fordeler gjennom statlige ressurser og offentlig mediedekning. Hvilken statsvitenskapelig slutning støttes best?

**Fasit:** Et valg kan være konkurransepreget og effektivt avviklet selv om statlig ressursbruk og partisk dekning gir sittende makthavere en fordel.

Distraktorene kontrollerer tre vanlige feilslutninger: effektiv administrasjon som garanti for lik konkurranse, skjev konkurranse som automatisk bevis for manipulert opptelling, og observasjon som automatisk kausalt estimat for stemmeendringer. Kandidatfilen inneholder fullstendig ordlyd, fire svaralternativer, respons til hvert svar, en faglig forklaring, dokumentert analyseenhet og kildelinker.

## Publiseringsstatus og sperrer

**Én konkret oppgave er skrevet, men null quizoppgaver er publisert.** Kandidaten er bevisst holdt utenfor runtime. Den kan ikke telles som et ferdig fagområdeforløp: `QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json` krever fem oppgaver med progresjonssekvens og kunnskapsenheter; kildebank, produksjonskontekst, metodisk kildegrense, Knowledge-bindinger og full publiseringsaudit må kontrolleres før integrasjon. Ingen canonic manifest, quizpakke eller kildeclaim-register er endret i denne etappen.

Kvalitetsport: `node --test tests/politikk-advanced-political-science-case-assessment-v5.test.mjs`.
