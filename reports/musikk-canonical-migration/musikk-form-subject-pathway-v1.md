# Musikk – subject pathway for form, prosess og improvisasjon v1

Dato: 2026-07-30

## Leveranse

Denne batchen materialiserer `em_musikk_vit_form_prosess_improvisasjon` som Musikk subject-pathway sett 4.

- target: `subject_musikk_form_prosess_improvisasjon`
- released claim: `claim_musikk_form_huguet_op10_3_a4_close_84_106`
- direct object: `obj_beethoven_op10_3_dcml_v2_5_07_4`
- metode: `notasjons_kildeanalyse`
- profil: `subject_pathway_pilot_4x5`

Aktiv Musikk-pathway etter materialisering:

- 4 sett
- 20 spørsmål
- 4 released emner
- 4 question-ready claims
- 4 direct objects
- 44 canonicale temaer fortsatt blokkert

Alle settene følger `observe → explain → evaluate_evidence → diagnose_failure → decide_and_justify`.

## Form-settet

1. `observe` – lokaliserer Huguets komplette A4-refrengparti i mm. 84–92.
2. `explain` – følger den A-baserte codaen og ny I:PAC ved m. 106.
3. `evaluate_evidence` – skiller Huguet som analysegrunnlag, DCML 07-4 som versjonert partitur og Hentschel mfl. som korpusproveniens.
4. `diagnose_failure` – blokkerer slutningen at tematisk A-retur alene fastsetter ny refrengfunksjon eller modelluavhengig form.
5. `decide_and_justify` – holder DCML som `external_link_and_metadata_only` så lenge kommersiell lisenskompatibilitet ikke er avklart.

Spørsmål 1–4 peker bare til det eksplisitt frigitte Huguet-claimet. Spørsmål 5 har med vilje ingen `claim_id`.

## Evidens og rettigheter

Forskningsgrunnlag:

- Joan Huguet 2024 som fulltekstverifisert formanalyse
- `obj_beethoven_op10_3_dcml_v2_5_07_4` som versjonert notert direct object
- Hentschel mfl. 2024 som proveniens- og reviewgrunnlag for DCML-korpuset

Objektvinduer:

- `MS3/07-4.mscx, mm. 84–92`
- `MS3/07-4.mscx, mm. 93–113`

DCML v2.5 er CC BY-NC-SA 4.0. Kommersiell kompatibilitet med History Go er ikke løst. Objektet brukes derfor bare via identitet, versjon, taktlokatorer og ekstern lenke; scorefilen kopieres, rendres, redistribueres eller modifiseres ikke.

Huguets formfunksjoner og DCML-objektet holdes analytisk atskilt. Direct object brukes ikke som uavhengig bevis for Huguets modell.

## Evidensdrevet pathway-validator

`tools/validate-musikk-subject-pathway-v1.mjs` er generalisert slik at release-kontrakten avledes fra `production_context.released_evidence_files`.

For hvert frigitt evidenstema leser validatoren:

- `emne_id`
- nøyaktig ett `question_ready_claim_id`
- selected direct object og persistent URL
- claimets metodeprotokoll
- claimets source IDs
- objektets provenance-source IDs
- object type og rights mode

Bare unionen av claimets egne kilder, object provenance og selve direct object kan brukes som pathway-kilder. Andre fulltekster som finnes i evidensfilen blir ikke automatisk frigitt.

Canonical topic-count leses fra `data/fag/musikk/scientific_package.json`, slik at blocked-topic-count avledes som total topic-count minus antall frigjorte evidensfiler.

Dette fjerner behovet for én hardkodet validatorblokk per nytt sett uten å svekke release-gaten.

## Knowledge

Canonical Knowledge-materialisering etter sett 4 rapporterte:

- 2923 globale quizspørsmål
- 4074 Knowledge units
- 144 eksisterende unresolved emne-links
- 0 Knowledge-kontraktfeil
- 0 aktive legacy Knowledge-referanser

De fem nye spørsmålene har deterministiske Knowledge-, concept- og term-ID-er og canonical source metadata.

## Validatorer

- Musikk source dossiers: `6520 PASS / 0 FAIL`
- Musikk fulltekstevidens: `714 PASS / 0 FAIL`
- Musikk subject pathway: `1191 PASS / 0 FAIL`
- Musikk pathway source metadata: `265 PASS / 0 FAIL`
- registreringsbuilder: `0 avvik`

## CI-governance

Bootstrap-jobben ble brukt bare til deterministisk materialisering og ble deretter fjernet. Permanent `Fagverk Musikk` står med `permissions: contents: read`.

På første låste read-only-head `f6a82d405b11c737e9d75145960138a7b020b1c4` var alle 14 triggete workflowene grønne, inkludert Knowledge checks, Data checks, TypeScript guard, Fagverk Musikk og Musikk scientific quality.

Permanent workflow inkluderer nå form-builderens path-trigger og syntakskontroll, semantic pathway canonicalization, registreringscheck, fulltekstevidens, evidensdrevet pathway-validator, source-metadata-validator og Fagverk-kontrakttester.

## Neste gate

De øvrige 44 Musikk-temaene forblir blokkert. De to gjenværende temaene i analyse-domenet — analytisk lytting/beskrivelse og klang/tekstur/instrumentasjon — krever ekte lydobjekter med tidskoder, avspillings-/målekjede og rights-gate før sett 5 eller 6 kan åpnes.
