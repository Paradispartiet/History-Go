# Musikk: institusjoner, patronat og offentlighet — Rikskonsertene evidensport v1

Dato: 2026-07-30

## Avgrensning

Denne produksjonen åpner bare `em_musikk_vit_institusjoner_patronat_offentlighet` gjennom et avgrenset Rikskonsertene-case for 2007–2008, med 2011 som kontinuitetskontroll. Den materialiserer ikke et nytt subject-pathway-sett.

- claim: `claim_musikk_history_rikskonsertene_public_patronage_2007_2008`
- claim-type: `institutional_policy_claim`
- metode: `institusjons_policyanalyse`
- direct object: `obj_rikskonsertene_stmeld21_2007_2008_institutional_financing`

## Evidenskjede

1. `St.meld. nr. 21 (2007–2008)` dokumenterer ressurs- og kontraktsleddet: statlig bevilgning, DKS-midler, institusjonsrolle og skolekonserthonorarer.
2. `St.prp. nr. 1 (2008–2009)` dokumenterer faktisk 2007-gjennomføring: 10 114 konserter totalt, 9 100 skolekonserter, 1 306 335 besøk, om lag 800 turnerende musikere og om lag 60 prosent regional produksjon.
3. Langdalen 2008 gir et separat arbeidsmarkeds-/praksisspor: informanter beskriver skolekonsertoppdrag som en betydelig inntektskilde for musikere som fikk innpass.
4. `Prop. 1 S (2012–2013)` brukes bare som kontinuitetskontroll for 2011, ikke som kausalt bevis for 2007–2008-bevilgningen.

## Inferensgrenser

- Bevilgning og mandat er ikke i seg selv bevis på effekt.
- Konsert- og besøkstall måler aktivitet, ikke lik faktisk tilgang, lik kvalitet, representativ programmering eller frivillig etterspørsel.
- Langdalens arbeidsfunn gjelder informanter og musikere med oppdrag; det kan ikke generaliseres til alle musikere eller langsiktig karrieresuksess.
- Kontinuitet i 2011 dokumenterer fortsatt institusjonell drift, ikke at ett bestemt budsjettvedtak alene forårsaket senere resultater.

## Rights

Direct object er et offentlig parlamentarisk dokument, men den canonicale object-gaten er bevisst streng: objektet leveres som `external_link_and_metadata_only`. History Go viser ekstern lenke og dokumentmetadata; offentlige tall og parafraserte funn bæres av source-evidensen. Ingen tredjepartsbilder eller hele dokumenter republiseres. Langdalen-rapporten brukes kun via bibliografisk identitet, sidelokator og parafrase.

## Validatorresultat

Grønn Musikk-kjøring på den firefil-avgrensede evidensbranchen ga:

- Musikk source dossiers: **6520 PASS / 0 FAIL**
- Musikk fulltekstevidens: **1519 PASS / 0 FAIL**
  - 9 emner
  - 25 fulltekster
  - 3 canonical fulltekster
  - 22 produksjonsutvidelser
  - 9 direct objects
  - 16 claim-klare funn
  - 31 slutningsgrenser
  - 9 question-ready emner / 9 claims
- Musikk subject pathway: **2376 PASS / 0 FAIL**
  - fortsatt 8 sett / 40 spørsmål
  - 8 released pathway-claims
  - 8 pathway direct objects
  - 40 temaer fortsatt blokkert i pathwayen
- Musikk pathway source metadata: **580 PASS / 0 FAIL**

Dette bekrefter at evidenslaget går 8 → 9 released emner uten at pathwayen åpnes automatisk.

## Kontraktrettinger under CI

To CI-funn ble rettet uten å utvide evidensgrunnlaget:

1. `scientific_package.source_revision` ble beholdt på canonical V9 fordi ingen source-dossier eller canonical kilderegister ble endret; kun fulltext-evidence-revisjonen økes.
2. Direct object ble låst til nøyaktig `external_link_and_metadata_only`, slik validatoren krever når `redistribution_allowed` er `false`.

## Produksjonsgrense

Nøyaktig fire filer skal endres:

1. `data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/institusjoner_patronat_offentlighet.json`
2. `data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json`
3. `data/fag/musikk/scientific_package.json`
4. `reports/musikk-canonical-migration/musikk-history-institutions-rikskonsertene-evidence-v1.md`

Ingen pathway- eller Knowledge-materialisering inngår i denne PR-en. Neste gate er separat materialisering av det frigitte institusjonsclaimet som et nytt femtrinnssett.
