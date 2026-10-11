# Psykoteori – produksjonsgruppe 4: psykometri, arbeidsminne og identitetsutvikling

**Dato:** 2026-10-11. **Omfang:** Tre nye pedagogiske kort, seks emnekoblinger (tre primære og tre sekundære). **Vitenskapelig status:** Kilder og publikasjonsopplysninger er kontrollert innen begrenset scope; ingen full originalfulltekstverifisering eller individuell diagnostikk.

## Psykometri: Spearman, Cronbach og Meehl
- 1904: Spearmans originalarbeid om generell intelligens og prestasjonskorrelasjoner: https://www.jstor.org/stable/1412107
- 1951: Cronbach om alfa og intern struktur: https://www.ets.org/research/policy_research_reports/publications/article/1951/dblr.html
- 1955: Cronbach og Meehl om konstruktvaliditet: https://psychclassics.yorku.ca/Cronbach/construct.htm
- Fagverkets prøvestandard (fti-03 / src-testing-standards): https://www.testingstandards.net/about.html
- **Avgrensning:** Reliabilitet er ikke bevis på validitet, objektiv rangering av mennesker eller klinisk anvendbarhet.

## Arbeidsminne: Baddeley og Hitch
- 1974: Opprinnelig dual-task-forskning i Working Memory: https://www.sciencedirect.com/science/article/pii/S0079742108604521
- 2000: episodisk buffer foreslått: https://pubmed.ncbi.nlm.nih.gov/11058819/
- 2012: teorihistorisk gjennomgang og alternative modeller: https://pubmed.ncbi.nlm.nih.gov/21961947/
- Oppmerksomhetens kobling til kognitiv kontroll og arbeidsminne (kfa-07 / src-attention-system): https://pmc.ncbi.nlm.nih.gov/articles/PMC3413263/
- **Avgrensning:** Delsystemene er teoretiske konstruksjoner; oppgavemålene kan ikke brukes som globale personskårer.

## Identitetsutvikling: Erikson og Marcia
- 1968: Eriksons Identity: Youth and Crisis: https://search.worldcat.org/title/Identity-%3A-youth-and-crisis/oclc/204288
- 1966: Marcias Development and Validation of Ego-Identity Status: https://pubmed.ncbi.nlm.nih.gov/5939604/
- Abstractet oppgir 86 mannlige studenter og intervjuer: https://www.tandfonline.com/servlet/linkout?type=Scholix&url=https%3A%2F%2Fdx.doi.org%2F10.1037%252Fh0023281
- Langsgående forskningsoversikt (uol-22/uol-23/uol-25 / src-identity-review): https://pubmed.ncbi.nlm.nih.gov/34820948/
- **Avgrensning:** Marcias identitetsstatuser er analytiske kategorier, ingen diagnoser eller fast alderssekvens.

## Emnekoblinger
| Kort | Primært emne | Sekundært emne | Begrenset canonical kildeankring |
| --- | --- | --- | --- |
| psykometri_validitet | em_psy_psykometri_maling | em_psy_forskning_metode | fti-03 / src-testing-standards |
| arbeidsminne_flerkomponent | em_psy_kognisjon_tenkning | em_psy_oppmerksomhet_fokus | kfa-07 / src-attention-system |
| identitetsutvikling_erikson_marcia | em_psy_identitet_selv | em_psy_livslop_overganger | uol-25 / src-identity-review |

Tre forskjellige teorihistoriske forløp og seks forskjellige hypotetiske undervisningsscenarioer. Ingen fagverkstekster, spillmotor, Civication, brukerskårer eller andre eksisterende kort endres. Status `linked_unreviewed` og `not_reviewed` beholdes. Nye primærkort merkes `partial_historical_method_review`, ikke `source_verified`.

## Verifikasjon og kvalitetsport
Maskinell preflight av endringsgrunnlaget: 22 teorikort; 43/58 kanoniske emner direkte koblet; 15 ukoblede; 44 unike undervisningsscenarioer; 21 sekundærkoblinger totalt. Eksisterende 14-korts evidensmatrise er uendret.

Kvalitetsvurdering for den avtalte produksjonsgruppen, etter retting av et registeravvik og grønn relevant CI på PR-head `7d806e7`:
| Dimensjon | Score / 5 | Evidens og begrensning |
| --- | ---: | --- |
| Korrekthet og evidens | 4 | Historiske originalpublikasjoner og presise claim-/source-ID-er; ingen ny uttømmende originalfulltekstgjennomgang |
| Dekning av avtalt gruppe | 5 | Tre ulike kort, tre primære og tre kildeankrede sekundæremner, seks forskjellige scenarioer |
| Faglig/redaksjonell kvalitet | 4 | Særskilt historisk metode og begrensning for statistisk testvaliditet, arbeidsminnemodell og identitetsintervju |
| Teknisk integritet | 5 | Psykoteori workflow 38170773551 og repository hygiene 38170773603 bestod; theory navigation, competence og structure audit inkludert |
| Sikkerhet og ansvarlighet | 5 | Ingen diagnostikk, personlig skåring, personklassifisering eller behandlingsråd |
| Vedlikeholdbarhet og etterprøvbarhet | 5 | Kanoniske ID-er, kildelenker, fem avgrensede filer og regresjonstester |

**Samlet: 28/30.** Alle seks dimensjoner er minst 4/5. Kvalitetsporten gjelder *produksjonsgruppe 4*, ikke vitenskapelig sluttgodkjenning av alle 22 kort eller alle 58 emner. Registeravviket `fti-01` i psykometri-kandidater ble funnet av første CI og korrigert til artikkelens `fti-03`; begge workflowene bestod på etterfølgende commit. Endelig PR-head etter denne rapportendringen skal også ha grønn CI før merge.
