# Psykoteori – kildegjennomgang, batch 02

**Dato:** 2026-10-09  
**Produksjon:** PR #6173, avhengig av grunnutvidelsen i PR #6168  
**Kort:** `humanistisk_psykologi`, `femfaktormodellen`, `heuristikker`  
**Konklusjon:** Delvis gjennomgått og dokumentert, **ikke** full kildegodkjenning.

Denne batchen kontrollerer seks kort totalt etter batch 01. Kildesporene i de tre nye kortene bygger på faktisk inspiserte publiseringsopplysninger, sammendrag eller profesjonelle fagdefinisjoner, og hver lenke sier eksplisitt hva den underbygger. Et sammendrag gir ikke automatisk grunnlag for å godkjenne all teori, metode, kritikk eller effekt.

## 1. Humanistisk psykologi — `em_psy_selv_utvikling_mening`

**Kontrollert:**

- [APA Dictionary: humanistic perspective](https://dictionary.apa.org/humanistic-perspective): humanistisk perspektiv, selvaktualisering, Rogers og Maslow. APA har en **annen** canonical `humanistic-psychology`-lenke i fagverket (`fti-15` / `src-apa-humanistic`), så denne alternative fagdefinisjonen er **ikke** gitt samme claim-ID uten eksakt kildeidentitet.
- [Rogers (1957), *The Necessary and Sufficient Conditions of Therapeutic Personality Change*](https://doi.org/10.1037/h0045357): originalartikkel om terapeutiske relasjonsbetingelser. Rogers' påstand om «necessary and sufficient» er en historisk **teoripåstand**, ikke bevist ved at artikkelen er publisert.
- [Maslow (1943), *A Theory of Human Motivation*](https://doi.org/10.1037/h0054346): originalt verk om menneskelig motivasjon, ikke belegg for at alle mennesker følger en rigid universell behovspyramide.
- [APA Handbook of Humanistic and Existential Psychology](https://www.apa.org/pubs/books/apa-handbook-humanistic-existential-psychology): februar 2026, to bind, 61 kapitler; dokumenterer at perspektivet fortsatt har et aktivt akademisk forsknings- og anvendelsesfelt. Canonical: `fti-16` / `src-apa-humanistic-handbook`.

**Avgrensning:** Humanisme omfatter flere retninger. Intervjuer, subjektive erfaringer og klinisk terapi er forskjellige evidenstyper; tilstedeværelsen av en APA-håndbok dokumenterer ikke effektstørrelser eller sannheten til hver mekanisme.

## 2. Femfaktormodellen — `em_psy_personlighet_individ`

**Kontrollert:**

- [McCrae og John (1992), *An Introduction to the Five-Factor Model and Its Applications*](https://pubmed.ncbi.nlm.nih.gov/1635039/): fem brede domener, hierarkiske trekk, adjektiv-/spørreskjemagrunnlag og kryssobservatør-/kulturstudier. Canonical `fti-21`, `fti-22` og `src-pubmed-ffm`.
- [Widiger og Crego (2019), *The Five Factor Model of Personality Structure: An Update*](https://pmc.ncbi.nlm.nih.gov/articles/PMC6732674/): fagfellevurdert oversikt over de fem domenene. Canonical `fti-21`, `fti-22` og `src-pmc-ffm`.

**Avgrensning:** Trekkdimensjoner er målmodeller for variasjon, ikke fem mennesketyper og ikke diagnostikk. Kildene gir ikke grunnlag for å slutte fra én svarskår til et enkeltmenneskes atferd i en konkret situasjon. Historien om alle aktører i modellutviklingen må ettergås særskilt; kortets navnefelt er ikke fullt evaluert.

## 3. Heuristikker — `em_psy_kognitive_bias`

**Kontrollert:**

- [Tversky og Kahneman (1974), *Judgment under Uncertainty: Heuristics and Biases*](https://doi.org/10.1126/science.185.4157.1124): originalartikkel i *Science* 185(4157), 1124–1131; tilgjengelighet, representativitet og ankring. Canonical `kfa-13` / `src-judgment-uncertainty`.
- [Berthet (2021), *The Measurement of Individual Differences in Cognitive Biases: A Review and Improvement*](https://pmc.ncbi.nlm.nih.gov/articles/PMC7930832/): review med egne metodestudier, viser at reliabilitet varierer mellom biasmål, at noen mål er forbedret og at ytterligere validering er nødvendig. Canonical `kfa-14` / `src-bias-measurement`.

**Avgrensning:** En dokumentert gruppeskjevhet i et kontrollert eksperiment er ikke automatisk et stabilt personlighetstrekk. Unngå å kalle alle heuristikker feil, og unngå å bruke korte selvtester som diagnose eller profilering. Tversky/Kahnemans 1974-artikkel dokumenterer heller ikke alene påstanden om *framing-effekter* i det hypotetiske eksemplet; det trenger separat relevant litteratur, f.eks. deres senere arbeid, før eksempelteksten får egen claimkobling.

## Data og QA

- Hvert av de tre kortene har `source_review_state: "partial_historical_method_review"`, med direkte URL, presis kilderolle, og validerbare `canonical_claim_ids` / `canonical_source_ids` der samme publikasjon finnes i fagverkets claim-register.
- `data/psychology/psychology_theory_coverage_v1.json` har **58/58** canonical emner, **14** direkte koblet, **44** uten direkte kortkobling, **6** *delvis* kildegjennomgått i batch 01–02, **0** fullt kildeverifiserte og **0** redaksjonelt godkjente.
- Den eksisterende read-only-auditen og Civication-testen validerer at kildereferansene er strukturelt gyldige og at delkontroller ikke forfalskes til ferdigstatus. Schema- og test-PASS er ikke lik faglig PASS.
- Neste redaksjonelle arbeid er feltvis kontroll av `founders`, `period`, `idea`, `method`, `limit`, `contrast` og undervisningseksempel for hvert kort. Manglende empirisk støtte skal enten avgrenses i teksten eller beholdes som uverifisert.
