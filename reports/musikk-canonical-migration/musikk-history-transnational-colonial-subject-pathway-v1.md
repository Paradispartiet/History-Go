# Musikk: transnasjonal sirkulasjon og kolonihistorie — subject pathway sett 12

Dato: 2026-07-30

## Avgrensning

Denne produksjonen materialiserer bare det frigitte claimet for `em_musikk_vit_transnasjonal_sirkulasjon_kolonihistorie` som ett femtrinns subject-pathway-sett.

- claim: `claim_musikk_history_transnational_colonial_oran_postcard_circuit`
- metode: `historisk_kildekritikk`
- direct object: `obj_oran_promenade_etang_concert_postcard_1906`
- object-type: `kritikk_eller_resepsjonskilde`
- rights: `external_link_and_metadata_only`

Produksjonen åpner ikke nye evidenstemaer og endrer ikke claimets kilder eller slutningsgrenser.

## Femtrinn

1. **Observe:** identifiser den dokumenterte 1906-ruten fra Oran via Jacques til Madame Rigole i Oms.
2. **Explain:** analyser hvordan fotografering, trykking, salg og post gjorde arrangementet til en bærbar kolonial representasjon.
3. **Evaluate evidence:** skill LL-merke og dokumentert postrute fra uløst fotografidentitet, komplett produksjonskjede og mottakerreaksjon.
4. **Diagnose failure:** avvis overgangen fra visuelt motiv til påstander om lyd, repertoar, lån eller total representativitet.
5. **Decide and justify:** lever postkortet som ekstern artikkellenke og metadata uten å republisere bildet.

De fire første spørsmålene peker bare til det frigitte claimet. Rights-spørsmålet har ingen `claim_id`.

## Faktiske materialiseringsresultater

Materialiseringen produserte og validerte:

- Musikk source dossiers: **6520 PASS / 0 FAIL**
- Musikk fulltekstevidens: **1924 PASS / 0 FAIL**
  - 12 emner
  - 30 fulltekster
  - 3 canonical + 27 produksjonsutvidelser
  - 12 direct objects
  - 19 claim-klare funn
  - 43 slutningsgrenser
- Musikk subject pathway: **3545 PASS / 0 FAIL**
  - 12 sett
  - 60 spørsmål
  - 12 released claims
  - 12 direct objects
  - 36 temaer fortsatt blokkert
- Musikk pathway source metadata: **853 PASS / 0 FAIL**
- pathway canonicalisering: **12 sett / 60 spørsmål**
- subject-pathway-registrering: **0 avvik**

## Knowledge

Canonical Knowledge-materialisering ga:

- **2963** globale quizspørsmål
- **4116** Knowledge units
- **144** eksisterende unresolved emne-links
- **0** Knowledge-kontraktfeil
- **480** eksisterende advarsler
- **0** aktive legacy Knowledge-referanser

## CI-governance

Permanent `Fagverk Musikk` beholder:

- `permissions: contents: read`
- permanent path-trigger for set-12-builderen
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
8. `reports/musikk-canonical-migration/musikk-history-transnational-colonial-subject-pathway-v1.md`
9. `tools/build-musikk-history-transnational-colonial-subject-pathway-v1.mjs`

Historisk musikkvitenskap er dermed materialisert gjennom alle seks planlagte emner. De øvrige 36 Musikk-temaene forblir blokkert til deres egne evidensporter er løst.
