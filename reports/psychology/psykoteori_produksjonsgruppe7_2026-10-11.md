# Psykoteori – produksjonsgruppe 7

**Dato:** 11. oktober 2026. **Omfang:** Tre nye kort om kollektiv krise, trygghet/tillit og vold/belastning. Ingen endringer i appmotor, Civication, quiz eller fagverkets kanoniske emneartikler.

## Forskningshistorie og kilder

### 1. Kollektive kriser – Lindemann, Hobfoll og 22. juli
- Erich Lindemann (1944), *Symptomatology and Management of Acute Grief*, American Journal of Psychiatry 101:141–148: https://psychiatryonline.org/doi/full/10.1176/ajp.101.2.141 – tidlig klinisk observasjon, ikke representativ universell krise- eller traumeundersøkelse.
- Stevan E. Hobfoll mfl. (2007), *Five Essential Elements of Immediate and Mid–Term Mass Trauma Intervention*: https://pubmed.ncbi.nlm.nih.gov/18181708/ – forskningssyntese og internasjonal ekspertkonsensus, ikke bevis for virkning av ett bestemt program.
- WHO: https://www.who.int/news-room/fact-sheets/detail/mental-health-in-emergencies – `tkr-13` / `src-who-emergencies`.
- NKVTS, Utøya tredje intervjurunde: https://www.nkvts.no/rapport/opplevelser-og-reaksjoner-hos-de-som-var-pa-utoya-22-juli-2011-en-oppsummering-av-tredje-intervjurunde/ – `tkr-14` / `src-nkvts-utoya3`.
- 22. juli-senterets mandat: https://www.22julisenteret.no/no/om-senteret/mandat – `tkr-15` / `src-22july-mandate`.
- Nyere kollektiv traumeforskning: https://pubmed.ncbi.nlm.nih.gov/41255188/ – `tkr-23` / `src-collective-resilience-meta`.

**Skille:** Hendelse, sosial kontekst, oppfølging, opplevelse og diagnose er separate analysenivåer. Ikke tilskriv individuelle deltakere eller senterbesøkende bestemte reaksjoner.

### 2. Trygghet og tillit etter krise
- Hobfoll mfl. (2007) fem prinsipper: trygghet, ro, egen-/kollektiv mestring, tilhørighet og håp: https://pubmed.ncbi.nlm.nih.gov/18181708/
- WHO mfl. (2011), *Psychological First Aid: Guide for Field Workers*: https://www.who.int/publications/i/item/9789241548205 – `tkr-08` / `src-who-pfa`. Veiledning, ikke eksponeringsterapi eller dokumentert effekt for enhver situasjon.
- WHO kriser og tjenestebehov: https://www.who.int/news-room/fact-sheets/detail/mental-health-in-emergencies – `tkr-07`, `tkr-16` / `src-who-emergencies`.
- NKVTS, proaktiv kontakt etter 22. juli: https://www.nkvts.no/english/academic-article/early-outreach-to-survivors-of-the-shootings-in-norway-on-the-22nd-of-july-2011/ – `tkr-09` / `src-nkvts-outreach`.

**Skille:** Objektiv sikkerhet, subjektiv trygghet, pålitelig informasjon, kontakt og oppfylt hjelpebehov er ulike mål. Retningslinjer må ikke framstilles som en kausal klinisk effektstudie.

### 3. Vold og belastning – tvangskontroll og vedvarende eksponering
- Evan Stark (2007), *Coercive Control*, Oxford University Press: https://academic.oup.com/book/54159 – originalbok om gjentatte kontrollmønstre, materiell begrensning og isolasjon; ingen påstand om navngitte individers straffskyld.
- NKVTS, forskning på fortsettelsesvold: https://www.nkvts.no/vitenskapelig-artikkel/fortsettelsesvold-etter-samlivsbrudd-konsekvenser-for-modres-helse-og-livskvalitet/ – `tkr-05` / `src-nkvts-continuing-violence`.
- WHO om krisers psykiske og materielle konsekvenser: https://www.who.int/news-room/fact-sheets/detail/mental-health-in-emergencies – `tkr-04`, `tkr-21` / `src-who-emergencies`.
- NKVTS om traumer: https://www.nkvts.no/tv/traumer-og-posttraumatisk-stresslidelse/ – `tkr-06` / `src-nkvts-trauma`.

**Skille:** Uspesifikke reaksjoner fastslår ikke voldshistorie, klinisk diagnose eller rettslig ansvar. Studien av gruppemønstre gjelder ikke automatisk enhver familie eller person.

## Kanonisk dekningsmatrise

| Nytt kort | Primæremne | Sammenligningskort |
| --- | --- | --- |
| `kollektiv_krise_flerniva` | `em_psy_kollektiv_krise` | `resiliens` |
| `trygghet_tillit_krisehjelp` | `em_psy_trygghet_tillit` | `kollektiv_krise_flerniva` |
| `vold_belastning_tvangskontroll` | `em_psy_vold_belastning` | `stressvurdering` |

**Resultat i branchen:** 31 kort / 54 av 58 emner koblet / 4 gjenstående / 62 distinkte hypotetiske undervisningsscenarioer. Seks nye scenarioer er særskilt skrevet for temaene. Ingen sekundærkoblinger er brukt som dekningstall.

De fire som står igjen er `em_psy_behandling_omsorg`, `em_psy_krise_intervensjon`, `em_psy_pasientrolle_erfaring`, `em_psy_terapirom_relasyon`.

## Redaksjonell og vitenskapelig status

`source_review_state=partial_historical_method_review` for de tre nye kortene. Alle tre emner: `link_status=linked_unreviewed`, `source_review_status=not_reviewed`, `editorial_review_status=not_reviewed`. Bibliografisk kontroll av historiske originalarbeider og kanoniske kilder er **ikke** det samme som full originalfulltekstgjennomgang eller vitenskapelig sluttgodkjenning.

## Seksdimensjonal kvalitetsport

| Dimensjon | Foreløpig score / 5 | Faktisk grunnlag |
| --- | ---: | --- |
| Korrekthet/evidens | 4 | Faglig originale forskningshistorier, 14 avgrensede referanser og eksisterende claim-/sourcekoblinger; originalfulltekster ikke alle lest |
| Dekning/ferdigstilling | 5 | Alle tre primæremner og to undervisningsscenarioer per kort; 31/54/4/62-kontroll |
| Faglig/redaksjonell kvalitet | 4 | Ulike spørsmål for samfunnskrise, sikkerhet/tjenester og løpende voldsbelastning |
| Teknisk integritet | 5 | Psykoteori workflow 38174385492 (success) og Repository hygiene workflow 38174385487 (success) på head 33b0b584; ny CI kreves på endelig rapportcommit |
| Sikkerhet/ansvarlighet | 5 | Ingen navngitt individuelt påstått voldsutøver, diagnose eller behandlingsanbefaling |
| Vedlikeholdbarhet | 5 | Avgrenset femfilsdiff, daterte kilder, canonical IDs, regresjonstester |

**Kvalitetsvurdering: 28/30.** Alle seks dimensjoner scorer minst 4/5; tre kildeavgrensede kort, tre emner og seks undervisningsscenarioer er kontrollert. Relevant CI er grønn på første PR-head. Endelig rapportcommit skal også være grønn før merge. Ingen historisk/klinisk fullkildegodkjenning registreres automatisk.
