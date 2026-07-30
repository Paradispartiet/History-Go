# Musikk: verkbegrep, forfatterskap og kanon — subject pathway sett 11

Dato: 2026-07-30

## Avgrensning

Denne produksjonen materialiserer bare det frigitte claimet for `em_musikk_vit_verkbegrep_forfatterskap_kanon` som ett femtrinns subject-pathway-sett.

- claim: `claim_musikk_history_work_canon_oxford_degree_exercise_institutional_status`
- metode: `historiografisk_analyse`
- direct object: `obj_crotch_o_sing_bmus_exercise_1794`
- object-type: `manuskript_eller_trykk`
- rights: `external_link_and_metadata_only`

Produksjonen åpner ikke nye evidenstemaer og endrer ikke claimets kilder eller slutningsgrenser.

## Femtrinn

1. **Observe:** identifiser Crotch-manuskriptet gjennom attribusjon, år, gradskontekst og Bodleian-signatur.
2. **Explain:** skill stabil attribusjon fra verkstatusene som produseres gjennom eksamen, arkiv, analyse og framføring.
3. **Evaluate evidence:** bruk manglende dokumentasjon av publisering og senere framføring som avgrenset negativ evidens, ikke som estetisk eller absolutt fraværsbevis.
4. **Diagnose failure:** avvis substitusjonen fra arkiv- og analyseverdi til offentlig innflytelse eller framføringskanon.
5. **Decide and justify:** lever manuskriptet som ekstern Bodleian-lenke og metadata, uten redistribusjon av manuskriptbilder eller partitur.

De fire første spørsmålene peker bare til det frigitte claimet. Rights-spørsmålet har ingen `claim_id`.

## Faktiske materialiseringsresultater

Materialiseringen produserte og validerte:

- Musikk source dossiers: **6520 PASS / 0 FAIL**
- Musikk fulltekstevidens: **1807 PASS / 0 FAIL**
  - 11 emner
  - 29 fulltekster
  - 3 canonical + 26 produksjonsutvidelser
  - 11 direct objects
  - 18 claim-klare funn
  - 39 slutningsgrenser
- Musikk subject pathway: **3253 PASS / 0 FAIL**
  - 11 sett
  - 55 spørsmål
  - 11 released claims
  - 11 direct objects
  - 37 temaer fortsatt blokkert
- Musikk pathway source metadata: **788 PASS / 0 FAIL**
- pathway canonicalisering: **11 sett / 55 spørsmål**
- subject-pathway-registrering: **0 avvik**

## Knowledge

Canonical Knowledge-materialisering ga:

- **2958** globale quizspørsmål
- **4111** Knowledge units
- **144** eksisterende unresolved emne-links
- **0** Knowledge-kontraktfeil
- **480** eksisterende advarsler
- **0** aktive legacy Knowledge-referanser

## CI-governance

Permanent `Fagverk Musikk` beholder:

- `permissions: contents: read`
- permanent path-trigger for set-11-builderen
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
8. `reports/musikk-canonical-migration/musikk-history-work-canon-subject-pathway-v1.md`
9. `tools/build-musikk-history-work-canon-subject-pathway-v1.mjs`

Transnasjonal sirkulasjon og kolonihistorie forblir blokkert til en egen fulltekst-, direct-object-, inferens- og rights-port er løst.
