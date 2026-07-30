# Musikk – fulltekstevidens for historisk kildekritikk v1

Dato: 2026-07-30

## Leveranse

Batchen åpner det første fulltekstevidenstemaet utenfor analysedomenet:

`em_musikk_vit_kildekritikk_musikkhistorie`

Domenet er:

`historisk_musikkvitenskap_historiografi`

Produksjonen er avgrenset til ett case: Edvard Griegs egen gramofoninnspilling av *Brudefølget drar forbi* / *Norwegian Bridal Procession*, Op. 19 nr. 2.

## Forsknings- og kontrollkilder

### Mattes 2020

Arnulf Christian Mattes, *What Else Can Grieg’s Historical Recordings Tell Us? Performance Practice as Musical Poetry*, Studia Musicologica Norvegica 46(1), 25–40, DOI `10.18261/issn.1504-2960-2020-01-04`.

Mattes brukes som fagfellevurdert hovedkilde fordi artikkelen eksplisitt behandler historiske lydopptak som kildekritiske objekter. Den:

- drøfter tapte/ utilgjengelige mastere og senere kopier
- forklarer at matrixnumre normalt gjør original opptaksidentitet sporbar gjennom kopier
- bruker *Norwegian Bridal Procession* som hovedcase
- vurderer teknisk transmisjon og senere reissue som alternative forklaringer
- sammenholder lydopptaket med skriftlige kilder i stedet for å behandle opptaket som et transparent vindu til 1903

### Marston Records

Marston 52054-2 brukes som uavhengig diskografisk kontrollspor.

Katalogen identifiserer:

- Gramophone and Typewriter Limited
- Paris, 2. mai 1903
- *Bridal Procession*, Op. 19 nr. 2
- matrix `2151F`
- katalognummer `35517`
- varighet `3:00`

Samme produksjon dokumenterer Ward Marston som audio-conservation engineer og Dimitrios Antsos for digital pitch stabilization, og viser dermed at den moderne utgaven selv er et senere conservation-/restoration-lag.

### Chasing the Butterfly

Sigurd Slåttebrekk og Tony Harrisons prosjekt brukes som transfer-/restaureringsdokumentasjon og som ekstern inspeksjonsflate.

Prosjektet dokumenterer blant annet:

- ni voks-mastere fra Paris-opptakene 2. mai 1903
- svært få overlevende kommersielle kopier
- ustabil skjærehastighet og dermed pitch-/speed-problemer i originalprosessen
- senere SIMAX- og Marston-lag
- ulike valg ved pitchstabilisering og equalization
- at informasjon som den akustiske prosessen aldri registrerte, ikke kan rekonstrueres i ettertid
- at tidligere noise-reduction-/declicking-metoder kan endre musikalsk informasjon

På siden *Ambiguity and Multi-layeredness* ligger dessuten et direkte webeksempel merket `Brudefølget1.mp3`, presentert som eksempel fra Griegs egen *Bridal Procession*-framføring.

## Direct object

`obj_grieg_bridal_procession_2151f_chasing_web_derivative`

Det er med vilje definert som et senere webtilgangsderivat, ikke som «1903-masteren».

Den historiske opptaksidentiteten kontrolleres separat:

- G&T
- Paris 2. mai 1903
- matrix `2151F`
- catalog `35517`

Direct-object-lokatorene skiller tre lag:

1. Marston 52054-2 / CD 1 track 4 / matrix- og katalogidentitet
2. Chasing the Butterfly / `Brudefølget1.mp3` / direkte webtilgangsderivat
3. Mattes / Table 1 og source-provenance-/transmisjonsdiskusjon

Det eksakte fysiske shellac-eksemplaret og den komplette fil-/transferkjeden bak akkurat webutdraget er ikke dokumentert i de gjennomgåtte sidene. Det er lagret som en eksplisitt kildekritisk begrensning, ikke fylt ut med antakelser.

## Released claim

`claim_musikk_history_grieg_2151f_provenance_derivative_chain`

Claim type:

`historical_claim`

Metode:

`arkiv_diskografisk_metode`

Claimet sier bare at den historiske opptakssiden kan identifiseres som G&T Paris 2. mai 1903 / matrix 2151F / catalog 35517, samtidig som moderne lytteadgang gjennom restaureringer og webfiler utgjør senere tekniske/redaksjonelle lag.

Det betyr at hørbare trekk i et moderne derivat ikke uten dokumentert transferkjede kan likestilles med den umedierte lydhendelsen i 1903.

Claimet sier ikke:

- at webutdraget er en bitperfekt eller nøytral kopi av en 1903-master
- at exact original pitch kan bestemmes fra webfilen alene
- at én moderne restaurering er «den riktige»
- at matrixidentitet beviser Griegs intensjon
- at dette ene opptaket representerer all Grieg-framføringspraksis

## Fire inferensgrenser

1. **Matrixidentitet ≠ umediert lyd.** `2151F` kontrollerer opptaksidentiteten, ikke studioets ufiltrerte akustiske hendelse.
2. **Reissue/restoration er egne redaksjonelle lag.** SIMAX, Marston og Chasing representerer ulike transfer-/restaureringsvalg.
3. **Webutdragets source-copy-chain er ufullstendig.** Det eksakte fysiske eksemplaret, checksum og komplette processing chain bak `Brudefølget1.mp3` er ikke dokumentert i de gjennomgåtte sidene.
4. **Rights er separat port.** Chasing the Butterfly oppgir ©2010 Sigurd Slåttebrekk og Tony Harrison; ingen gjenbrukslisens for weblyden er identifisert.

## Rights

Direct object står derfor på:

`external_link_and_metadata_only`

History Go kan lagre og vise:

- ekstern HTTPS-prosjektside
- matrix-/katalogidentitet
- filename-level locator
- bibliografisk og diskografisk proveniens
- dokumenterte inferensgrenser

History Go frigir ikke:

- kopiering
- audio extraction
- rehosting
- modifikasjon
- embedding

## Aggregert status

Fulltekstevidensvalidatoren bekrefter:

- 7 fulltekstevidenstemaer av 48
- 17 fulltekstgjennomganger (3 canonical + 14 produksjonsutvidelser)
- 7 direct objects
- 14 claim-klare funn
- 23 slutningsgrenser
- 7 question-ready emner
- 7 question-ready claims

Resultat:

`1140 PASS / 0 FAIL`

Musikk source dossiers forblir:

`6520 PASS / 0 FAIL`

Den eksisterende subject pathwayen er urørt og forblir:

- 6 sett
- 30 spørsmål
- `1768 PASS / 0 FAIL`
- source metadata `386 PASS / 0 FAIL`

De øvrige **41 canonicale Musikk-temaene** forblir blokkert av fulltekstevidenslaget.

## CI

På første firefil-head var alle workflowene denne avgrensede evidensdiffen faktisk trigget grønne:

- Data checks
- Musikk scientific quality
- Fagverk Musikk
- Fagverk subject inventory

`Fagverk Musikk` bekreftet samtidig source dossiers `6520/0`, fulltekstevidens `1140/0`, eksisterende pathway `1768/0` og pathway source metadata `386/0`.

## Neste gate

Denne evidens-PR-en materialiserer ikke et globalt sett 7.

`tools/validate-musikk-subject-pathway-v1.mjs` er fortsatt analyse-hardkodet til `musikalsk_analyse_lyd_struktur`. Etter en grønn evidensport må pathway-validatoren generaliseres til alle canonicale domener på samme måte som fulltekstevidensvalidatoren nettopp ble generalisert.

Først deretter kan det eksplisitt frigitte Grieg-provenance-claimet vurderes som første historiske subject-pathway-sett.
