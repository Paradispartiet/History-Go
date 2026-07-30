# Musikk – første evidensstyrte subject pathway

Dato: 2026-07-30

## Formål

Denne produksjonen materialiserer det første universelle Musikk-fagområdeforløpet etter at source foundation, fulltekstport og direct-object-port er etablert.

Produksjonen gjelder kun:

- domene: `musikalsk_analyse_lyd_struktur`
- emne: `em_musikk_vit_rytme_meter_groove_timing`
- pathway target: `subject_musikk_rytme_meter_groove_timing`
- frigitt claim: `claim_musikk_rhythm_sioros2014_moderate_syncopation_and_structure`
- direct object: `obj_sioros_2014_zenodo_1221315`

De øvrige 47 canonicale Musikk-temaene er fortsatt blokkert for subject-area-spørsmål til deres egne fulltekst-, claim-, locator- og objektporter er løst.

## Upstream evidens

Produksjonen bygger på de allerede etablerte lagene:

1. PR #4526: åtte canonicale kildeområder, 29 registre, 48 dossierer og 156 canonicale forskningskilder.
2. PR #4530: første fulltekstpilot for rytme, meter, groove og timing.
3. PR #4531: første komplette direct-object-kjede og første `question_release_ready`-claim.

Canonical fagstruktur er uendret:

- 8 domener
- 48 temaer
- 18 metodeprotokoller
- 156 canonicale forskningspublikasjoner

Produksjonsutvidelsen Sioros mfl. 2014 endrer ikke denne 156-posters basistellingen.

## Frigitt evidenskjede

Kjeden som faktisk kan drive spørsmål er:

`Frontiers-fulltekst → presise artikkellokatorer → computational_measurement-claim → Zenodo direct object → dataset-lokatorer → eksplisitt rettighetsmodus → subject pathway`

Forskningskilde:

- `prod_src_sioros_syncopation_synthesized_2014`
- George Sioros, Marius Miron, Matthew E. P. Davies, Fabien Gouyon og Guy Madison
- *Syncopation creates the sensation of groove in synthesized music examples*
- Frontiers in Psychology 5:1036 (2014)
- DOI `10.3389/fpsyg.2014.01036`

Direct object:

- `obj_sioros_2014_zenodo_1221315`
- Zenodo record `1221315`
- `Sioros_et_al.zip`
- MD5 `df685fb58b982b7729dc0fca2576247f`
- `musical_stimuli/expA/`
- `ratings/GrooveSynthExptA.XLS`
- `musical_stimuli/expB/`
- `ratings/GrooveSynthExptB.XLS`

Rettighetsmodus:

- `external_link_and_metadata_only`
- redistribusjon: ikke tillatt
- endring: ikke tillatt
- History Go lagrer derfor metadata, persistent ekstern lenke og locatorer, men kopierer ikke stimulus- eller ratingfilene inn i repo eller app.

## Subject pathway

Pakken ligger i:

`data/quiz/musikk/musikk_subject_pathways_v1.json`

Pilotprofil:

`subject_pathway_pilot_1x5`

Pakken inneholder ett sett med fem canonicale trinn:

1. `observe` – identifisere stimulusdesignet presist.
2. `explain` – forklare det avgrensede groove-resultatet uten å redusere funnet til synkopemengde alene.
3. `evaluate_evidence` – velge evidenskjeden som gjør påstanden etterprøvbar.
4. `diagnose_failure` – identifisere en universell overgeneralisering som evidensen ikke støtter.
5. `decide_and_justify` – velge rettighetsmessig korrekt History Go-bruk av Zenodo-objektet.

De fire første spørsmålene peker eksplisitt til det ene frigitte forskningsclaimet. Det femte spørsmålet har med vilje ikke `claim_id`, fordi det tester dokumentert rights/reuse-metadata og ikke skal forkles som et forskningsfunn.

## Knowledge-integrasjon

Pathwayen er registrert som `subject_pathway` i:

- `data/fag/fag_manifest.json`
- `data/quiz/manifest.json`
- `data/knowledge/knowledge_manifest.json`
- `data/fagverk/subject_inventory.json`
- `data/fagverk/subject_status.json`

Knowledge-pipelinen har generert canonicale IDs og registre for de fem nye spørsmålene:

- knowledge units
- concepts
- terms

Pathway-kildene canonicaliseres fra toppnivåets source records, slik at de genererte Knowledge-enhetene beholder den fagfellevurderte Frontiers-artikkelen som eksplisitt ekstern kilde og Zenodo som separat direct-object-kilde. Q4 er dermed `reviewed`, ikke en draft-enhet basert bare på intern quizreferanse.

Deterministiske builders:

- `tools/build-musikk-subject-pathway-v1.mjs --check`
- `tools/build-musikk-subject-pathway-registration-v1.mjs --check`

## Validatorresultater

Musikkens etablerte kildevalidator:

- `6520 PASS, 0 FAIL`

Fulltekstevidens:

- `271 PASS, 0 FAIL`
- 1 emne
- 4 fulltekster: 3 canonicale + 1 produksjonsutvidelse
- 1 direct object
- 5 claim-klare funn
- 4 slutningsgrenser
- 1 question-ready emne
- 1 question-ready claim

Subject pathway:

- `307 PASS, 0 FAIL`
- 1 sett
- 5 spørsmål
- 1 released claim
- 1 direct object
- 47 temaer fortsatt blokkert

## CI og governance

På read-only produksjonshead etter canonical Knowledge-synk passerte blant annet:

- Fagverk Musikk
- Musikk scientific quality
- Data checks
- Knowledge canonical data guard
- Knowledge legacy-reader guard
- Knowledge core/storage tests
- Knowledge browser E2E
- Knowledge link audit
- Knowledge contract audit
- TypeScript guard
- Fagverk subject inventory
- Fagverk general subject engine
- Technology scientific quality
- Vitenskap and technology category contract
- øvrige triggete Fagverk-/fagkontroller

Den endelige `Fagverk Musikk`-workflowen har `contents: read` og ingen bootstrap- eller skrivejobb. Alle genereringssteg som var nødvendige under draftarbeidet er fjernet fra workflowen før ready-status.

## Konklusjon

Musikk har nå sitt første aktive, evidensstyrte subject-area-forløp fra vitenskapelig kilde helt fram til quiz og Knowledge:

`fulltekst → claim → direct object → locatorer → rettigheter → spørsmål → Knowledge`

Dette åpner ikke resten av faget. Neste produksjonsarbeid skal utvide fulltekst- og direct-object-dekningen tema for tema, eller bygge det første redigerte hovedkapitlet på de temaene som faktisk har tilstrekkelig evidensdekning.
