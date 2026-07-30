# Musikk: resepsjon, kritikk og opptakshistorie — evidensport v1

Dato: 2026-07-30

## Avgrensning

Denne produksjonen åpner bare `em_musikk_vit_resepsjon_kritikk_opptakshistorie` gjennom ett eksplisitt avgrenset Grieg-korpus. Den materialiserer ikke et nytt subject-pathway-sett.

Tema:

- domene: `historisk_musikkvitenskap_historiografi`
- emne: `em_musikk_vit_resepsjon_kritikk_opptakshistorie`
- claim-type: `historical_claim`
- metode: `diskurs_representasjonsanalyse`
- direct object: `obj_grieg_chasing_butterfly_levi_review_2012`
- released claim: `claim_musikk_history_grieg_chasing_2010_reception_uptake`

## Korpus

Produksjonen bruker fire identifiserte og daterte spor:

1. Slåttebrekk/Harrison, *Chasing the Butterfly* — produsentenes egen problemformulering og remediation-/forskningsmål.
2. Erik Levi, *Chasing the Butterfly*, publisert 20. januar 2012 — profesjonell anmeldelse av SIMAX PSC 1299.
3. Daniel Leech-Wilkinson, *Compositions, Scores, Performances, Meanings*, Music Theory Online 18(1), 2012 — fagfellevurdert analytisk bruk av Chasing-nettstudien og CD-en i et eksplisitt Grieg-case.
4. Arnulf Christian Mattes, *What Else Can Grieg’s Historical Recordings Tell Us?*, Studia Musicologica Norvegica 46(1), 2020 — senere fagfellevurdert bruk av de remastrede historiske Grieg-opptakene som forskningskilder.

## Released claim

Det som kan frigis er ikke en fortelling om «Griegs samlede resepsjon». Det avgrensede claimet er at Chasing the Butterfly / SIMAX PSC 1299 kan dokumenteres som et resepsjons- og remedieringsledd der Griegs 1903-opptak blir aktive objekter i disse identifiserte profesjonelle og akademiske kanalene.

Kjeden er:

`produsent-framing → profesjonell anmeldelse → fagfellevurdert analytisk uptake → senere fagfellevurdert forskningsbruk`

Denne kjeden dokumenterer forekomst og bruk i et avgrenset korpus. Den dokumenterer ikke samlet publikum, markedsresultat, konsensus blant kritikere eller musikere, estetisk verdi eller at Chasing alene forårsaket en bred statusendring.

## Direct object

Valgt direct object er Erik Levis anmeldelse, ikke selve lydfilen:

`obj_grieg_chasing_butterfly_levi_review_2012`

Objektet har:

- persistent HTTPS-side
- navngitt forfatter
- publiseringsdato 20. januar 2012
- label Simax
- katalog PSC 1299
- direkte tekstlig lokator der restaureringen av de ni Grieg-opptakene fra 1903 gjøres til et sentralt vurderingspunkt
- uavhengig kontroll mot MTO 2012s bruk av det samme Chasing-prosjektet som analytisk evidens

## Inferensgrenser

Fire grenser følger claimet:

1. Prosjektets utsagn om lav status er produsentens egen problemformulering, ikke en populasjonsmåling.
2. Levi-anmeldelsen er ett profesjonelt resepsjonsspor, ikke samlet kritiker- eller publikumsresepsjon.
3. MTO 2012 og Mattes 2020 dokumenterer faglig uptake, men ikke kausalitet for en bred statusendring.
4. Ingen gjenbrukslisens for Levi-anmeldelsens tekst er identifisert; objektet må være `external_link_and_metadata_only`.

## Rights

History Go kan lagre og vise bibliografisk metadata, kildeidentitet, paraphraserte funn og ekstern lenke. Review-tekst eller tilknyttet medieinnhold skal ikke kopieres, rehostes, modifiseres eller embeddes.

## Validatorresultat

Første fullstendige CI-kjøring på den firefil-avgrensede evidensbranchen ga:

- Musikk source dossiers: **6520 PASS / 0 FAIL**
- Musikk fulltekstevidens: **1330 PASS / 0 FAIL**
  - 8 emner
  - 21 fulltekster
  - 3 canonical fulltekster
  - 18 produksjonsutvidelser
  - 8 direct objects
  - 15 claim-klare funn
  - 27 slutningsgrenser
  - 8 question-ready emner / 8 claims
- Musikk subject pathway: **2069 PASS / 0 FAIL**
  - fortsatt 7 sett / 35 spørsmål
  - 7 released pathway-claims
  - 7 pathway direct objects
  - 41 temaer fortsatt blokkert i pathwayen
- Musikk pathway source metadata: **473 PASS / 0 FAIL**

Dette bekrefter at evidenslaget går 7 → 8 released emner uten at pathwayen åpnes automatisk.

## Produksjonsgrense

Denne PR-en endrer bare:

1. `data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/resepsjon_kritikk_opptakshistorie.json`
2. `data/fag/musikk/musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json`
3. `data/fag/musikk/scientific_package.json`
4. `reports/musikk-canonical-migration/musikk-history-reception-recording-evidence-v1.md`

Neste gate etter grønn evidens-PR er separat materialisering av et eventuelt subject-pathway sett 8 fra det frigitte claimet. Ingen slik materialisering inngår her.
