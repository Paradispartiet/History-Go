# Psykoteori – kildegjennomgang, batch 04

**Dato:** 2026-10-09  
**Kort:** `sosial_identitet`, `konformitet`, `resiliens`, `kognitiv_terapi`, `biopsykososial_modell`  
**Status:** Delleveranse for primærverk, relevante fagstudier og konkrete kildegrenser; **ingen kort regnes ennå som fullt kildeverifisert eller faglig ferdig**.

## 1. Sosial identitetsteori

- [Tajfel, Billig, Bundy og Flament (1971)](https://doi.org/10.1002/ejsp.2420010202): tidlige minimumsgruppe-eksperimenter og inngruppefavorisering. Dette er en historisk forløper til senere sosial identitets- og selvkategoriseringsteori, ikke i seg selv full dokumentasjon av alle senere teoripåstander.
- [Spears (2021), *Social Influence and Group Identity*](https://pubmed.ncbi.nlm.nih.gov/32931718/): review om identifikasjon, normer, kontekst og rivaliserende forklaringer. Canonical `sns-01` / `src-social-identity-influence`.
- **Grense:** Gruppegjennomsnitt er ikke personkarakteristikker. Kortets `founders`-felt må skilles fra historiesporet for minimumsgruppeforskning.

## 2. Konformitet og sosial påvirkning

- [Solomon Asch (1956)](https://doi.org/10.1037/h0093718): originalverk om uavhengighet og konformitet under laboratoriebetingelser.
- [Spears (2021)](https://pubmed.ncbi.nlm.nih.gov/32931718/): normativ påvirkning, identifikasjon, anonymitet og gruppeforskjeller. Canonical `sns-06` / `src-social-identity-influence`.
- **Grense:** Verken én historisk Asch-studie eller en bred review beviser ubegrenset overførbarhet til enhver kultur eller digital gruppe.

### Oppdaget kildefeil i canonical fagverk (krever separat retting)

I `data/fagverk/psykologi/sosialpsykologi-normalitet-og-stigma/claims.json` står `src-descriptive-injunctive` med PubMed-lenken `https://pubmed.ncbi.nlm.nih.gov/18163950/` og tittelen *A focus theory of normative conduct: recycling the concept of norms to reduce littering in public places*. **Lenken tilhører faktisk** Smith og Louis, *Do as we say and as we do: the interplay of descriptive and injunctive group norms in the attitude-behaviour relationship* (2008). Canonical kildetittel må korrigeres i egen dokumentert endring, eller URL må byttes til riktig publisering etter kildekontroll. Denne mismatchede katalogposten **brukes ikke som validerte teorikortclaims i batch 04**. Ikke endre andre canonical claims via Psykoteori-auditen.

## 3. Resiliens og beskyttelsesfaktorer

- [Ann Masten (2001), *Ordinary Magic*](https://pubmed.ncbi.nlm.nih.gov/11315249/): historisk forskningsperspektiv med resiliens knyttet til fungerende beskyttelsessystemer, ikke en uforanderlig personlig egenskap.
- [Zalta mfl. (2021), metaanalyse](https://pubmed.ncbi.nlm.nih.gov/33271023/): 139 studier med 62 803 personer i tverrsnittsanalyser og 37 studier med 25 792 personer i longitudinelle analyser; sammenheng mellom sosial støtte og selvrapportert PTSD-symptombyrde i traumeeksponerte ikke-kliniske voksne, med stor heterogenitet. Canonical `tkr-20` og `tkr-24` / `src-social-support-meta`.
- **Grense:** Korrelasjon er ikke alene kausalitet. Materialet gir ikke grunnlag for å rangere enkeltmenneskers motstandskraft eller plassere ansvar for belastning hos den utsatte.

## 4. Kognitiv terapi og kognitiv atferdsterapi

- [Guilford Press – *Cognitive Therapy of Depression*](https://www.guilford.com/books/Cognitive-Therapy-of-Depression/Beck-Rush-Shaw-Emery/9781572305823/prior-editions): forlaget dokumenterer originalutgaven fra 1979, bidragsyterne og senere 2. utgave. Dette er historisk/bibliografisk belegg, ikke klinisk effektmetaanalyse.
- [Helsenorge – eBehandling](https://www.helsenorge.no/psykisk-helse/hjelp-og-behandling/ebehandling/): viser reelle norske veiledede behandlingsforløp basert på kognitiv atferdsterapi, med henvisning og kontakt med behandler. Canonical `phi-07` / `src-helsenorge-ebehandling`.
- **Grense:** Behandlingsstudier, diagnose-/indikasjonsspesifikk effekt, mulig skade og individuell egnethet skal fremdeles gjennomgås. Ingen History Go-øvelse presenteres som profesjonell behandling.

## 5. Biopsykososial modell

- [George L. Engel (1977), *The Need for a New Medical Model*](https://pubmed.ncbi.nlm.nih.gov/847460/): originalartikkel om biologiske, psykologiske og sosiale dimensjoner av helse og sykdom.
- [WHO (2021), person- og rettighetsbaserte psykiske helsetjenester](https://www.who.int/publications/i/item/9789240025707): normativ veiledning om integrerte og menneskelige tjenester. Canonical `phi-03` / `src-who-guidance` for systemperspektivet, **ikke** empirisk bevis for Engels teoretiske modell.
- **Grense:** Bred modell er et analyse- og integrasjonsrammeverk og forklarer ikke automatisk årsaken til en konkret sykdom eller behandlingseffekt.

## Oppsummert auditstatus for hele Psykoteori-v1

- **14/14** opprinnelige teorikort har nå minst to inspiserbare referanselenker med forklaring på kildens rekkevidde, totalt **32 lenker** fordelt på fire kildebatches.
- **14/58** emner har direkte kortkobling; **44/58** gjenstår for full Psykoteori-dekning. Alle 58 har allerede canonical fagverksartikler.
- **14/14** kort er nå markert `partial_historical_method_review`. **0/14** er fullstendig source-verified eller editorial-approved.
- Neste nødvendige fase er full **felt-for-felt-review** (`founders`, `period`, `idea`, `method`, `limit`, `contrast`, eksempler) og kilde–påstand-samsvar. Deretter utvides de 44 manglende koblingene etter produksjonsplanen, med gjenbruk av gode teorier og ingen kunstig én-teori-per-emne-kvote.
- Maskinell test kontrollerer at hver canonical claim-ID finnes i riktig kapittels claims, og at source-ID faktisk ligger på minst én av de refererte claimene. Den tester **ikke** vitenskapelig sannhetsverdi. `source_review_status` forblir derfor `not_reviewed`.
