# Musikk – fulltekstevidens for harmoni, tonalitet og modalitet v1

Dato: 2026-07-30

Status: produksjonsaudit før CI.

## Formål

Denne batchen fulltekst- og object-verifiserer det tredje analyseemnet i Musikk:

`em_musikk_vit_harmoni_tonalitet_modalitet`

Canonical domene-, emne-, metode- og kildeinventar endres ikke.

## Forskningskjede

### Fulltekst

Produksjonen bruker William E. Caplin, *Beethoven’s “Tempest” Exposition: A Response to Janet Schmalfeldt*, Music Theory Online 16(2), 2010.

To fulltekstlokatorer er lagt til:

1. paras. [12]–[14] – halvslutning i ny toneart ved m.41, dominantpedal gjennom m.54, tonika i første omvending ved m.55, naboneapolitanske harmonier, IV ved m.62 og kadensdominant/PAC ved m.63.
2. paras. [20]–[25] – Caplins argument for tonikaforlengelse i mm.75–87 og hans plassering av den siste levedyktige avsluttende kadensen ved m.75.

Hentschel mfl. 2024 gjenbrukes som fulltekstverifisert produksjonskilde for proveniens, annotasjons- og reviewworkflow og DCML-formatene. Den brukes ikke som støtte for Caplins konkrete funksjonsanalyse.

## Direkte objekt

Objekt:

`obj_beethoven_tempest_op31_2_dcml_v2_5_17_1`

Identitet:

- Beethoven, Piano Sonata No. 17 in D minor, Op. 31 No. 2 («Tempest»), sats 1
- DCML v2.5
- score: `MS3/17-1.mscx`
- harmoniannotasjon: `harmonies/17-1.harmonies.tsv`
- 228 takter
- 352 annotasjonslabels
- score standard 2.3.0

To direkte objektvinduer:

- mm. 41–63
- mm. 72–88

DCML v2.5 er CC BY-NC-SA 4.0. Kommersiell kompatibilitet med History Go er ikke løst. Objektet forblir derfor:

`external_link_and_metadata_only`

History Go kopierer, renderer, redistribuerer eller modifiserer ikke score- eller harmonifilen i denne batchen.

## Claims

To claims er claim-klare redaksjonelt:

1. `claim_musikk_harmony_caplin_dominant_pedal_new_key_41_63`
2. `claim_musikk_harmony_caplin_tonic_prolongation_cadence_75_87`

Bare claim 1 frigjøres til spørsmål.

Claim 2 beholdes redaksjonelt fordi det eksplisitt inngår i en analytisk uenighet om kadens og tonikaforlengelse og egner seg best som modellkritisk støtte før en egen question-pathway-utforming.

## Slutningsgrenser

Tre grenser er eksplisitte:

1. Caplins formfunksjonelle og harmoniske kategorier er modellavhengige og kan ikke presenteres som score-fakta uten analytisk ramme.
2. DCML-annotasjonene og Caplins analyse er separate representasjoner. DCML brukes ikke som om det uavhengig «beviser» Caplins lesning.
3. DCML-objektet forblir eksternt-only så lenge kommersiell lisenskompatibilitet ikke er løst.

## Aggregert fulltekststatus etter batchen

Forventet canonical status når validatoren er grønn:

- 3 fulltekstevidenstemaer av 48
- 8 fulltekstgjennomganger
- 3 canonicale fulltekstgjennomganger
- 5 produksjonsutvidelser
- 3 direct objects
- 9 claim-klare funn
- 10 slutningsgrenser
- 3 question-ready emner
- 3 question-ready claims

De øvrige 45 canonicale temaene er fortsatt ikke frigitt av dette evidenslaget.

## CI-gate

Før ready/merge skal minst følgende være grønne på låst head:

- `node tools/validate-musikk-fulltext-evidence-v1.mjs`
- Musikk source-dossier-validator
- Musikk scientific quality
- Fagverk Musikk
- Data checks
- TypeScript guard

Sluttall for fulltekstevidensvalidatoren og faktisk trigget CI oppdateres i PR-beskrivelsen etter kjøring.
