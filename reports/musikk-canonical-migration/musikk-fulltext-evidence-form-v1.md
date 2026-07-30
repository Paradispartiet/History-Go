# Musikk – fulltekstevidens for form, prosess og improvisasjon v1

Dato: 2026-07-30

## Leveranse

Batchen verifiserer `em_musikk_vit_form_prosess_improvisasjon` på objektnivå for ett avgrenset formcase.

Forskningskilde:

- Joan Huguet, *Post-Recapitulatory Organization in Beethoven’s Early Sonata-Rondo Finales*, Music Theory Online 30(3), 2024, DOI `10.30535/mto.30.3.2`

Direkte objekt:

- Beethoven, Piano Sonata No. 7 in D major, Op. 10 No. 3, sats 4
- DCML v2.5 `MS3/07-4.mscx`
- 113 takter, score standard 2.3.0
- DCML metadata registrerer 268 harmoniannotasjoner

Objektvinduer:

- mm. 84–92
- mm. 93–113

## Claims

To formclaims er claim-klare redaksjonelt:

1. Huguets immediate-A4-analyse: komplett A4 i mm.84–92 med tonic PAC, etterfulgt av A-basert coda og ny I:PAC ved m.106.
2. Fordi A4 allerede lukker formen ved m.92, klassifiserer Huguet den påfølgende A-baserte enheten som after-the-end/coda og ikke som ny formåpning.

Bare claim 1 frigjøres til spørsmål i denne produksjonen.

## Grenser

- Huguets A4/coda/after-the-end-kategorier er modellbaserte formfunksjoner, ikke rå score-fakta.
- DCML er det versjonerte noterte objektet, ikke uavhengig validering av Huguets formmodell.
- DCML v2.5 er CC BY-NC-SA 4.0; kommersiell kompatibilitet med History Go er ikke løst, så objektet brukes som `external_link_and_metadata_only`.
- Produksjonen dekker form/prosess i ett klassisk sonata-rondo-case. Improvisasjonsbeslutninger og andre formtradisjoner forblir blokkert.

## Canonical metodekobling

Temaet og blueprintet tillater allerede `notert_kilde` og `score_or_representation_claim`, men manglet `notasjons_kildeanalyse`. Metoden finnes allerede i Musikk-kontrakten og er eksplisitt kompatibel med `notert_kilde`.

Batchen legger derfor bare denne eksisterende metode-ID-en til temaet og blueprintet. Ingen ny metode, claim-type, emne eller domene opprettes.

## Aggregert status

Fulltekstevidensvalidatoren bekrefter:

- 4 fulltekstevidenstemaer
- 10 fulltekstgjennomganger, hvorav 3 canonicale og 7 produksjonsutvidelser
- 4 direct objects
- 11 claim-klare funn
- 13 slutningsgrenser
- 4 question-ready emner
- 4 question-ready claims

Resultat:

`714 PASS / 0 FAIL`

Fagdybdevalidatoren etter metodekoblingen:

`1909 PASS / 0 FAIL`

Musikk source dossiers forblir:

`6520 PASS / 0 FAIL`

Den eksisterende aktive subject pathwayen endres ikke i denne batchen og forblir 3 sett / 15 spørsmål. De øvrige 44 canonicale temaene forblir blokkert av fulltekstevidenslaget.

## CI

På første låste read-only-head var alle workflowene som denne femfil-diffen faktisk trigget grønne:

- Data checks
- Musikk scientific quality
- Fagverk Musikk
- Fagverk subject inventory

Data checks bekreftet også grønne Knowledge V2-, category/quiz-governance-, Places- og People-jobber.

Den midlertidige bootstrap-jobben som la eksisterende `notasjons_kildeanalyse` til formtema og blueprint er fjernet. Permanent `Fagverk Musikk` står igjen med `permissions: contents: read`.

## Neste gate

Det fjerde analyseemnet er question-ready i evidenslaget, men ikke materialisert som pathway-sett. Neste produksjon kan legge form/prosess inn som sett 4 uten å åpne de øvrige 44 temaene.
