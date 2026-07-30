# Musikk – generalisering av subject-pathway-validator til alle canonicale domener v1

Dato: 2026-07-30

## Formål

Denne infrastrukturen åpner ingen nye Musikk-sett, spørsmål, claims, direct objects eller Knowledge-data.

Etter at `em_musikk_vit_kildekritikk_musikkhistorie` ble frigitt av fulltekstevidenslaget, var `tools/validate-musikk-subject-pathway-v1.mjs` siste strukturelle analyse-hardkoding før et historisk pathway-sett kunne materialiseres.

Validatoren leste tidligere bare:

`modules_v2/musikalsk_analyse_lyd_struktur.json`

og krevde eksplisitt:

- `evidence.domain_id === musikalsk_analyse_lyd_struktur`
- canonical topic `domain_id === musikalsk_analyse_lyd_struktur`
- pathway-sett `area_id === musikalsk_analyse_lyd_struktur`

Det var korrekt for den opprinnelige 6×5-analysepiloten, men ville avvise ethvert korrekt sett i et annet canonicalt Musikk-domene.

## Ny canonical modell

Validatoren leser nå canonical modulfilene fra:

`data/fag/musikk/musikkvitenskap_canonical_v1/index.json#files.canonical_modules`

og bygger:

- sett av alle canonicale `domain_id`-er
- samlet `topicById` for alle canonicale emner

Tre nye strukturelle kontroller krever at:

1. antall canonicale modulfiler matcher `scientific_package.summary.domain_count`
2. antall unike domain IDs matcher samme domain count
3. antall unike topic IDs på tvers av modulene matcher canonical `topic_count`

Med dagens pakke betyr dette 8 domener / 48 emner.

## Per released evidence config

For hvert aktivt pathway-sett valideres nå:

- evidensfilens `domain_id` må finnes blant canonicale domener
- `emne_id` må finnes i globalt canonical topic-oppslag
- canonical topic `domain_id` må matche evidensfilens `domain_id`
- set `area_id` må matche samme evidensdomene

Dermed er domeneinformasjonen fortsatt streng, men den avledes fra canonical data i stedet for en analyse-spesifikk konstant.

## Regler som ikke endres

Alle tidligere release-regler er bevart:

- pathway bygges bare fra `production_context.released_evidence_files`
- upstream evidence må være `question_release_ready`
- nøyaktig ett claim per sett
- nøyaktig én metodeprotokoll per released claim
- primær fulltekstkilde må være production extension
- selected direct object må matche claimets object scope
- object type og metode må være tillatt av canonical topic
- object rights mode må matche pakke-/spørsmålsbruk
- package sources kan bare være released claim sources + object provenance + direct object
- fem spørsmål per sett
- canonical femtrinnsrekkefølge
- spørsmål 1–4 må bruke released claim
- spørsmål 5 skal være rights/reuse-metadata uten falsk `claim_id`
- deterministiske concept-, term- og Knowledge-unit-ID-er
- minst tre ulike answer-index-posisjoner per sett

## Andre pathway-komponenter

Gjennomgangen bekrefter at ingen ytterligere generalisering er nødvendig før første historiske sett:

- `tools/build-musikk-subject-pathway-v1.mjs` canonicaliserer alle eksisterende sett uten domenekonstant
- `tools/validate-musikk-subject-pathway-source-metadata-v1.mjs` validerer source metadata uavhengig av domene
- `tools/build-musikk-subject-pathway-registration-v1.mjs` registrerer aktive sett og blocked count uavhengig av domene

Det kommende spesialiserte historiske buildersteget må selv sette korrekt `area_id = historisk_musikkvitenskap_historiografi`, slik de eksisterende analysebuilderne setter sitt canonicale område.

## Produksjonsflate

Denne PR-en skal bestå av nøyaktig to filer:

1. `tools/validate-musikk-subject-pathway-v1.mjs`
2. `reports/musikk-canonical-migration/musikk-subject-pathway-validator-all-domains-v1.md`

Ingen quizpakke, Knowledge-data, statusfil eller fulltekstevidens endres.

## Neste gate

Når regresjonen er grønn og denne infrastrukturen er merget, kan det allerede frigitte historiske claimet

`claim_musikk_history_grieg_2151f_provenance_derivative_chain`

materialiseres som globalt Musikk pathway-sett 7 med fem spørsmål. Da skal aktiv pathway gå fra 6×5 til 7×5, og `blocked_canonical_topic_count` fra 42 til 41, uten ny validator-hardkoding.
