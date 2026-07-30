# Musikk: periodisering, stil, epoke og anakronisme — evidensport v1

Dato: 2026-07-30

## Avgrensning

Denne produksjonen åpner bare `em_musikk_vit_periodisering_anakronisme` gjennom et avgrenset korpus fra osmansk-tyrkisk musikkhistoriografi. Den materialiserer ikke et nytt subject-pathway-sett.

- claim: `claim_musikk_history_periodization_ottoman_turkish_models_source_dependency`
- claim-type: `historical_claim`
- metode: `historiografisk_analyse`
- direct object: `obj_firat_periodization_ottoman_turkish_2019_article`

## Sammenlignede periodiseringer

1. Berker 1985 organiserer historien gjennom komponistgrenser og etiketter som forberedende/klassisk/neoklassisk/romantisk/reform.
2. Uslu 2015 organiserer en alternativ kronologi rundt kilderegimer og historiografiske kriterier: arkeologisk, paleografisk, systematikere, klassisk tyrkisk musikk og popularisering.
3. Fırat 2019 dokumenterer i tillegg Feldmans stil-/repertoaranalytiske periodisering av peşrev-tradisjonen og viser at kildegrunnlaget påvirker overgangspunktene.

## Kildemotbevis

Fırat viser at deler av Feldman/Wrights 1700-tallsslutninger bygde på noen få publiserte stykker fra Kevserî-mecmuaen. Etter at et større notekorpus ble tilgjengelig gjennom senere arbeid måtte enkelte slutninger revurderes.

Dette brukes ikke til å hevde at alle tidligere modeller er feil. Poenget er mer presist: periodiseringsgrenser er avhengige av hva slags materiale som faktisk er tilgjengelig og analysert.

## Released claim

Det som frigis er at ulike periodiseringsvalg gjør ulike aktører, praksiser, kildetyper og overgangspunkter synlige i dette avgrensede korpuset. Periodisering behandles som en kildeavhengig analytisk modell, ikke som en nøytral kalender eller én universelt riktig kronologi.

## Inferensgrenser

- Periodenavn og grenser er historiografiske modeller, ikke naturgitte tidsavsnitt.
- Berkers institusjonelle og praktiske utbredelse er ikke i seg selv bevis på empirisk gyldighet.
- Utvidelse av Kevserî-korpuset krever revisjon av enkelte slutninger, men nullstiller ikke alle langsiktige stilobservasjoner.
- Modellene har ulikt geografisk, repertoarmessig og kildemessig omfang og kan ikke generaliseres til alle osmanske/tyrkiske regioner, grupper, sjangre eller muntlige praksiser.

## Rights

Fırat-artikkelen er tilgjengelig som åpen fulltekst, men direct-object-gaten er konservativt låst til `external_link_and_metadata_only`. History Go viser bibliografisk identitet, DOI, lokatorer og parafraserte funn, men republiserer ikke PDF, tabeller eller figurer.

## Validatorresultat

Grønn Musikk-kjøring på den firefil-avgrensede evidensbranchen ga:

- Musikk source dossiers: **6520 PASS / 0 FAIL**
- Musikk fulltekstevidens: **1690 PASS / 0 FAIL**
  - 10 emner
  - 28 fulltekster
  - 3 canonical fulltekster
  - 25 produksjonsutvidelser
  - 10 direct objects
  - 17 claim-klare funn
  - 35 slutningsgrenser
  - 10 question-ready emner / 10 claims
- Musikk subject pathway: **2671 PASS / 0 FAIL**
  - fortsatt 9 sett / 45 spørsmål
  - 9 released pathway-claims
  - 9 pathway direct objects
  - 39 temaer fortsatt blokkert i pathwayen
- Musikk pathway source metadata: **660 PASS / 0 FAIL**

Dette bekrefter at evidenslaget går 9 → 10 released emner uten at pathwayen åpnes automatisk.

## Kontraktretting under CI

Første CI-runde viste at evidensfila brukte ikke-canonical emne- og metode-ID-er. Dette ble rettet uten å endre kildene, claimteksten eller inferensgrensene:

- emne: `em_musikk_vit_periodisering_anakronisme`
- metode: `historiografisk_analyse`
- accepted direct-object types ble synkronisert med canonical modulkontrakt

## Produksjonsgrense

Nøyaktig fire filer skal endres:

1. `data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/periodisering_stil_epoke_anakronisme.json`
2. `data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json`
3. `data/fag/musikk/scientific_package.json`
4. `reports/musikk-canonical-migration/musikk-history-periodization-ottoman-turkish-evidence-v1.md`

Ingen pathway- eller Knowledge-materialisering inngår i denne PR-en. Neste gate er separat materialisering av det frigitte periodiseringsclaimet som et nytt femtrinnssett.
