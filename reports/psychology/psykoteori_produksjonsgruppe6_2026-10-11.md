# Psykoteori – produksjonsgruppe 6

**Dato:** 11. oktober 2026. **Omfang:** diagnosehistorie, hverdagspsykologi og ensomhet/tilhørighet.

## Diagnose og klassifikasjon – forskningshistorie
Emil Kraepelins sykdomsforløpsorienterte klassifikasjon rundt 1899 er historisk ulik amerikansk DSM-I (1952), DSM-III (1980), WHOs ICD-11 (vedtatt 2019; internasjonalt i kraft 2022) og kliniske CDDR (2024). Kategorisering gir et felles språk, men dokumenterer ikke enhetlige biologiske årsaker, og gir ikke grunnlag for diagnostikk fra ett inntrykk. Kildene skiller reliabilitet fra validitet.

- Historisk oversikt: https://pmc.ncbi.nlm.nih.gov/articles/PMC4421901/
- American Psychiatric Association, DSM-historie: https://www.psychiatry.org/psychiatrists/practice/dsm/about-dsm/history-of-the-dsm
- WHO, ICD-kronologi: https://www.who.int/standards/classifications/classification-of-diseases
- WHO, ICD-11 CDDR: https://www.who.int/publications/b/68103 ; canonical fti-06 / fti-07 / src-who-icd11-cddr
- Testing Standards: https://www.testingstandards.net/about.html ; fti-03 / src-testing-standards

## Hverdagspsykologi – attribusjon, heuristikker og vane
Fritz Heider (1958) analyserte hverdagslige årsaksforklaringer om mennesker, Tversky og Kahneman (1974) undersøkte vurdering under usikkerhet, mens senere forskning analyserer når heuristikker fungerer, og hvordan vane og situasjonsbetingelser samspiller. Hverdagslige personforklaringer er ikke kausalt dokumenterte uten systematiske alternativer.

- Heider, *The Psychology of Interpersonal Relations*: https://books.google.com/books/about/The_Psychology_of_Interpersonal_Relation.html?id=A23uUgziTKAC
- Tversky/Kahneman (1974): https://www.science.org/doi/10.1126/science.185.4157.1124 ; kfa-17 / src-judgment-uncertainty
- Oversikt om heuristikker: https://pmc.ncbi.nlm.nih.gov/articles/PMC3341653/ ; kfa-10 / src-heuristics
- Vaneforskning: https://pmc.ncbi.nlm.nih.gov/articles/PMC4566897/ ; kfa-17 / kfa-18 / src-habit-review
- Biasmåling og reliabilitet: https://pmc.ncbi.nlm.nih.gov/articles/PMC7930832/ ; kfa-14 / src-bias-measurement

## Ensomhet og tilhørighet – sosiale og subjektive mål
Robert S. Weiss (1973) skilte mellom emosjonell og sosial ensomhet; Baumeister og Leary (1995) drøftet behovet for positive og varige relasjoner. WHO skiller opplevd ensomhet fra objektiv sosial isolasjon og fra relasjonell kvalitet. Kontakttall alene beviser ikke ensomhet, og korrelasjoner kan ikke brukes som garanti for effekten av ett konkret tiltak.

- Weiss, originalbok, NLM-bibliografi: https://www.ncbi.nlm.nih.gov/nlmcatalog/416375
- Baumeister/Leary (1995): https://pubmed.ncbi.nlm.nih.gov/7777651/
- WHO, social connection: https://www.who.int/news-room/questions-and-answers/item/social-connection ; sns-25 / sns-26 / src-who-social-connection
- WHO Commission: https://www.who.int/publications/b/79027 ; sns-25 / sns-26 / sns-27 / src-who-commission
- Oversikt over intervensjoner: https://pmc.ncbi.nlm.nih.gov/articles/PMC12857015/ ; sns-27 / src-loneliness-interventions

## Produksjonsmatrise

| Nytt kort | Primæremne | Sammenlignes med |
| --- | --- | --- |
| diagnostisk_klassifikasjon_historie | em_psy_diagnose_klassifikasjon | psykometri_validitet |
| hverdagsattribusjon_og_vaner | em_psy_hverdagspsykologi | heuristikker |
| ensomhet_sosial_tilhorighet | em_psy_ensomhet_tilhorighet | sosial_identitet |

**Dekning:** 28 kort, 51/58 kanoniske emner med kildekoblet teori, 7 ukoblet, 56 unike hypotetiske undervisningsscenarioer. Ingen nye sekundærkoblinger uten dokumentert claim-/source-støtte. Tidligere 25 kort, historisk 14-korts-matrise, Fagverket, History Go-kjernen og Civication uendret.

**Kildestatus:** `partial_historical_method_review` på tre nye kort, `linked_unreviewed` på tilhørende emner, `source_review_status=not_reviewed` og `editorial_review_status=not_reviewed`. Historisk og pedagogisk utvikling er ikke det samme som komplett originalfulltekstkontroll eller medisinsk godkjenning.

## Seksdimensjonal kvalitetsvurdering

Faglig kvalitetsport er **28/30**. Kjøringene på head `a3c2171f34d40760ee56e0015c0556eb9473bedb`: Psykoteori workflow **38173060061: SUCCESS**, repository hygiene workflow **38173060054: SUCCESS**. Etter rapportoppdatering kreves de samme to kontrollene grønne også på **endelig** PR-head før merge.

| Dimensjon | Score (av 5) | Kontrollgrunnlag og avgrensning |
| --- | ---: | --- |
| Korrekthet og evidens | 4 | Historiske årstall og forfatterverk kontrollert med institusjonskilder, PubMed og historiske oversikter; alle 15 referanser kontrollert mot eksisterende canonical claim/source-forhold; ikke samtlige bøker lest i originalfulltekst |
| Dekning og ferdigstillelse | 5 | Tre kort med to separate scenarioer hver; tre primæremner; 28 kort / 51 koblet / 7 ukoblet; 56 unike scenarioer |
| Faglig/redaksjonell kvalitet | 4 | Særskilt diagnostikkhistorie, attribusjon/vaneforskning og relasjonskvalitet; forskjellen mellom modell, funn og anvendelse forklart |
| Teknisk integritet | 5 | Relevante Psykoteori source/navigation/audit og repository hygiene Actions bestått på første PR-head; siste head verifiseres før merge |
| Sikkerhet og ansvarlighet | 5 | Ingen individklassifisering, klinisk diagnose, påstander om faktiske pasienter eller ubegrunnet behandlingseffekt |
| Vedlikeholdbarhet og etterprøvbarhet | 5 | Fem avgrensede filer, canonical claim/source-ID-er, historiske kilder, målrettede regresjonstester og datert produksjonsrapport |

**Sum: 28/30.** Leveransen er pedagogisk og strukturelt ferdig innenfor gruppe 6, men de nye primærkortenes kildestatus forblir `partial_historical_method_review`, og emnene står fortsatt som `source_review_status=not_reviewed`. Grønn CI er ikke lik full vitenskapelig godkjenning.
