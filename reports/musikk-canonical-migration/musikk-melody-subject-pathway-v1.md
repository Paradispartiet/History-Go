# Musikk – subject pathway for melodi, motiv og frasering v1

Dato: 2026-07-30

Status: produksjonsaudit under ferdigstilling. Sluttresultater og CI-tall oppdateres før ready/merge.

## Formål

Denne batchen materialiserer det andre evidensstyrte Musikk-fagområdesettet.

Nytt sett:

- emne: `em_musikk_vit_melodi_motiv_frasering`
- target: `subject_musikk_melodi_motiv_frasering`
- released claim: `claim_musikk_melody_boss_alpha_salience_development`
- direct object: `obj_beethoven_op10_1_dcml_v2_5_05_1`
- metode: `notasjons_kildeanalyse`

Rytme/meter/groove/timing forblir sett 1. Melodi/motiv/frasering blir sett 2.

## Planlagt pathway

Fem canonicale trinn:

1. `observe` – lokalisere alpha i Boss sin analyse ved konkrete takter.
2. `explain` – forklare økt overflatesaliens i mm. 136–141 innen Boss sin modell.
3. `evaluate_evidence` – skille Boss sin analyse, DCML-scoreobjektet og Hentschel mfl. sin proveniensdokumentasjon.
4. `diagnose_failure` – blokkere komponistintensjon og modelluavhengig segmentering.
5. `decide_and_justify` – bruke DCML-objektet som `external_link_and_metadata_only` så lenge kommersiell lisenskompatibilitet ikke er avklart.

De fire første spørsmålene skal peke til det ene frigitte forskningsclaimet. Rights/reuse-trinnet skal med vilje ikke ha `claim_id`.

## Canonical avgrensning

Uendret:

- 8 domener
- 48 temaer
- 18 metodeprotokoller
- 156 canonicale forskningspublikasjoner

Etter materialisering skal aktiv Musikk-pathway være:

- 2 sett
- 10 spørsmål
- 2 released emner
- 2 question-ready claims
- 2 direct objects
- 46 temaer fortsatt blokkert

## Generering og governance

Materialisering skjer deterministisk gjennom:

- `tools/build-musikk-melody-subject-pathway-v1.mjs`
- `tools/build-musikk-subject-pathway-v1.mjs`
- `tools/build-musikk-subject-pathway-registration-v1.mjs`
- repositoryets canonical Knowledge-pipeline

Sluttformen eies av pathway-canonicalisering og Knowledge-pipelinen. Builderen for melodi-settet er en materialiseringsbuilder; derived Knowledge-linkfelter skal ikke overskrives etter canonical Knowledge-synk.

## Sluttkontroller

Oppdateres før merge med faktiske resultater for:

- Musikk source dossiers
- Musikk fulltekstevidens
- Musikk subject pathway
- Knowledge canonical sync
- Data checks
- TypeScript guard
- Fagverk Musikk
- øvrige triggete globale guards
