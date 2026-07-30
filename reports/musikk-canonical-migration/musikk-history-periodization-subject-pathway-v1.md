# Musikk: periodisering og anakronisme — subject pathway sett 10

Dato: 2026-07-30

## Avgrensning

Denne produksjonen materialiserer bare det frigitte claimet for `em_musikk_vit_periodisering_anakronisme` som ett femtrinns subject-pathway-sett.

- claim: `claim_musikk_history_periodization_ottoman_turkish_models_source_dependency`
- metode: `historiografisk_analyse`
- direct object: `obj_firat_periodization_ottoman_turkish_2019_article`
- object-type: `fagpublikasjon`
- rights: `external_link_and_metadata_only`

Produksjonen åpner ikke nye evidenstemaer og endrer ikke periodiseringsclaimets kilder eller slutningsgrenser.

## Femtrinn

1. **Observe:** identifiser Berkers komponist- og stilbaserte periodemodell.
2. **Explain:** forklar hvorfor Uslus kilde- og historiografibaserte kronologi er en reell alternativ modell.
3. **Evaluate evidence:** bruk Kevserî-korpusets utvidelse til å vurdere kildeutvalgets betydning for periodiseringsgrenser.
4. **Diagnose failure:** avvis universalisering av én modell til alle regioner, sjangre, grupper og muntlige praksiser.
5. **Decide and justify:** lever Fırat-artikkelen som ekstern lenke og metadata, med parafraserte funn og presise lokatorer.

De fire første spørsmålene peker bare til det frigitte claimet. Rights-spørsmålet har ingen `claim_id`.

## Faktiske materialiseringsresultater

Bootstrap-kjøringen produserte og validerte:

- Musikk source dossiers: **6520 PASS / 0 FAIL**
- Musikk fulltekstevidens: **1690 PASS / 0 FAIL**
  - 10 emner
  - 28 fulltekster
  - 3 canonical + 25 produksjonsutvidelser
  - 10 direct objects
  - 17 claim-klare funn
  - 35 slutningsgrenser
- Musikk subject pathway: **2961 PASS / 0 FAIL**
  - 10 sett
  - 50 spørsmål
  - 10 released claims
  - 10 direct objects
  - 38 temaer fortsatt blokkert
- Musikk pathway source metadata: **723 PASS / 0 FAIL**
- pathway canonicalisering: **10 sett / 50 spørsmål**
- subject-pathway-registrering: **0 avvik**

## Knowledge

Canonical Knowledge-materialisering ga:

- **2953** globale quizspørsmål
- **4106** Knowledge units
- **144** eksisterende unresolved emne-links
- **0** Knowledge-kontraktfeil
- **480** eksisterende advarsler
- **0** aktive legacy Knowledge-referanser

## CI-governance

Bootstrap-jobben var branch-avgrenset og kunne bare skrive de seks etablerte generated-outputfilene. Exact-surface-garden passerte før bot-push.

Etter materialisering ble bootstrap-jobben fjernet. Permanent `Fagverk Musikk` står igjen med:

- `permissions: contents: read`
- permanent path-trigger for set-10-builderen
- permanent `node --check` av builderen
- ingen skrivende jobb

## Produksjonsgrense

Sluttdiffen skal være nøyaktig ni filer:

1. `.github/workflows/fagverk-musikk.yml`
2. `data/fagverk/subject_status.json`
3. `data/knowledge/concepts.generated.json`
4. `data/knowledge/knowledge_units.generated.json`
5. `data/knowledge/terms.generated.json`
6. `data/quiz/musikk/musikk_subject_pathways_v1.json`
7. `reports/knowledge-id-backfill.json`
8. `reports/musikk-canonical-migration/musikk-history-periodization-subject-pathway-v1.md`
9. `tools/build-musikk-history-periodization-subject-pathway-v1.mjs`

Verkbegrep/forfatterskap/kanon og transnasjonal sirkulasjon/kolonihistorie forblir blokkert til egne fulltekst-, direct-object-, inferens- og rights-porter er løst.
