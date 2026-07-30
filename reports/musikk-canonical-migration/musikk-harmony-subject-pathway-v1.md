# Musikk – harmoni subject pathway v1

Dato: 2026-07-30

## Leveranse

Denne batchen materialiserer `em_musikk_vit_harmoni_tonalitet_modalitet` som Musikk subject-pathway sett 3.

- target: `subject_musikk_harmoni_tonalitet_modalitet`
- released claim: `claim_musikk_harmony_caplin_dominant_pedal_new_key_41_63`
- direct object: `obj_beethoven_tempest_op31_2_dcml_v2_5_17_1`
- metode: `notasjons_kildeanalyse`
- profil: `subject_pathway_pilot_3x5`

Aktiv Musikk-pathway etter materialisering:

- 3 sett
- 15 spørsmål
- 3 released claims
- 3 direct objects
- 45 canonicale temaer fortsatt blokkert

Settet følger `observe → explain → evaluate_evidence → diagnose_failure → decide_and_justify`. Spørsmål 1–4 peker til det ene frigitte Caplin-claimet. Spørsmål 5 er en rettighets-/gjenbruksbeslutning uten `claim_id`.

## Evidens og rettigheter

Caplin 2010 er analysegrunnlaget. DCML v2.5 `17-1` er versjonert direct object. Hentschel mfl. 2024 dokumenterer DCML-korpusets proveniens og reviewprosess.

Objektvinduer:

- `MS3/17-1.mscx + harmonies/17-1.harmonies.tsv, mm. 41–63`
- `MS3/17-1.mscx + harmonies/17-1.harmonies.tsv, mm. 72–88`

DCML er CC BY-NC-SA 4.0. Kommersiell kompatibilitet med History Go er ikke avklart, så bruksmodusen er `external_link_and_metadata_only`. History Go kopierer, renderer, redistribuerer eller modifiserer ikke DCML-filene i denne produksjonen.

Caplins funksjonsanalyse og DCML-annotasjonene behandles som separate analytiske representasjoner. De brukes ikke til å hevde én modelluavhengig harmonisk fasit eller dokumentert komponistintensjon.

## Knowledge

Canonical Knowledge-materialisering rapporterte:

- 2918 globale quizspørsmål
- 4068 Knowledge units
- 144 eksisterende unresolved emne-links
- 0 Knowledge-kontraktfeil
- 0 aktive legacy Knowledge-referanser

De fem nye spørsmålene har deterministiske Knowledge-, concept- og term-ID-er og canonical source metadata.

## Validatorer

- Musikk source dossiers: `6520 PASS / 0 FAIL`
- Musikk fulltekstevidens: `567 PASS / 0 FAIL`
- Musikk subject pathway: `878 PASS / 0 FAIL`
- pathway source metadata: `194 PASS / 0 FAIL`
- registreringsbuilder: `0 avvik`

## CI-governance

Bootstrap-jobben ble brukt kun til deterministisk materialisering og ble deretter fjernet. Permanent `Fagverk Musikk` står med `permissions: contents: read`.

På første låste read-only-head `3c2622558187443f7f470d7d09074f86e20b8e8c` var alle 14 triggete workflowene grønne, inkludert Knowledge checks, Data checks, TypeScript guard, Fagverk Musikk og Musikk scientific quality.

Den permanente Musikk-gaten inkluderer semantic pathway canonicalization, registreringscheck, fulltekstevidens, 3×5-validator, source-metadata-validator og Fagverk-kontrakttester.

## Neste gate

De øvrige 45 Musikk-temaene forblir blokkert. Et fjerde pathway-sett skal ikke åpnes før neste emne har egen fulltekst-, direct-object- og rights-gate.
