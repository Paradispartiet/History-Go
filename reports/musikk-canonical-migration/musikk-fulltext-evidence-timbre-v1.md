# Musikk – fulltekstevidens for klang, tekstur og instrumentasjon v1

Dato: 2026-07-30

## Leveranse

Batchen verifiserer `em_musikk_vit_klang_tekstur_instrumentasjon` med en beregningspåstand og et versjonert lydobjekt.

Forskningsgrunnlag:

- Yubiry Gonzalez og Ronaldo C. Prati, *Comparative Study of Musical Timbral Variations: Crescendo and Vibrato Using FFT-Acoustic Descriptor*, Eng 4(3), 2023, DOI `10.3390/eng4030140`
- TinySOL v6 repository documentation, DOI `10.5281/zenodo.3685367`

## Direct object

`obj_tinysol_v6_flute_c4_pp_ff`

TinySOL v6:

- 2913 isolerte enkelttoner fra 14 instrumenter
- originale IRCAM Studio On Line-opptak fra 1996–1999
- ordinary playing style, uten mute
- mono WAV, 44,1 kHz, 16-bit
- klipplengde 2–10 sekunder
- archive MD5 `36030a7fe389da86c3419e5ee48e3b7f`
- metadata MD5 `a86c9bb115f69e61f2f25872e397fc4a`

To matched inspection windows holder instrument, pitch og teknikk fast og varierer dynamikk:

1. `Winds/Flute/ordinario/Fl-ord-C4-pp-N-N.wav :: 0.000–2.000 s`
2. `Winds/Flute/ordinario/Fl-ord-C4-ff-N-N.wav :: 0.000–2.000 s`

Begge metadata-radene har C4/MIDI 60, ordinario og ingen digital retuning. To-sekundersvinduet er gyldig fordi TinySOL dokumenterer at alle klipp er minst to sekunder.

## Released claim

`claim_musikk_timbre_gonzalez_prati_tinysol_dynamics_classification_2023`

Gonzalez og Prati bruker TinySOL via mirdata i Random-Forest-klassifikasjon med blant annet dynamikkklassene pp, mf og ff. Ved 99 prosent signifikansnivå rapporterer de at FFT-Acoustic-koeffisientene er bedre for klassifikasjon etter dynamikk enn de sammenlignede Librosa-trekkene.

Claim type:

`computational_measurement`

Metode:

`klang_spektralanalyse`

History Go har ikke rerunnet klassifikatoren. De to C4-fløytefilene gjør datasettet og sample-designet inspeksjonsbart, men er ikke en selvstendig replikasjon av aggregate performance.

## Metode- og slutningsgrenser

Tre grenser er eksplisitte:

1. Klassifiserbar dynamikk og FFT-/Librosa-feature-rom er operative kategorier i et bestemt datasett og modelloppsett, ikke universelle naturgitte klangkategorier.
2. Resultatet er avhengig av TinySOL, feature-definisjoner, FFT-behandling, Random Forest og statistisk sammenligning; History Go har ikke gjort en uavhengig rerun.
3. De to C4-fløyteklippene er inspection anchors og kan ikke alene generaliseres til alle instrumenter, pitches eller dynamikker i TinySOL.

## Rights

TinySOL v6 er CC BY 4.0. Zenodo-dokumentasjonen tillater kreativ, forsknings- og utdanningsmessig bruk under attribusjon; lisensen er kommersielt kompatibel med korrekt attribusjon.

Denne batchen velger likevel:

`external_link_and_metadata_only`

Det betyr at evidenslaget lagrer identitet, checksums, filstier, analysevinduer og ekstern lenke. Eventuell innebygd avspilling under CC BY kan behandles i en separat audio-delivery-produksjon.

## Aggregert status

Fulltekstevidensvalidatoren bekrefter:

- 5 fulltekstevidenstemaer av 48
- 12 fulltekstgjennomganger, hvorav 3 canonicale og 9 produksjonsutvidelser
- 5 direct objects
- 12 claim-klare funn
- 16 slutningsgrenser
- 5 question-ready emner
- 5 question-ready claims

Resultat:

`837 PASS / 0 FAIL`

Musikk source dossiers forblir:

`6520 PASS / 0 FAIL`

Den aktive subject pathwayen endres ikke i denne batchen og forblir:

- 4 sett
- 20 spørsmål
- `1191 PASS / 0 FAIL`
- source metadata `265 PASS / 0 FAIL`

De øvrige 43 canonicale Musikk-temaene forblir blokkert av fulltekstevidenslaget.

## CI

På første firefil-head var alle workflowene som denne avgrensede diffen faktisk trigget grønne:

- Data checks
- Musikk scientific quality
- Fagverk Musikk
- Fagverk subject inventory

`Fagverk Musikk` bekreftet samtidig source dossiers `6520/0`, fulltekstevidens `837/0`, eksisterende pathway `1191/0` og pathway source metadata `265/0`.

Slutt-head etter denne rapportoppdateringen skal kjøre de samme path-baserte kontrollene før ready/merge.

## Neste gate

Klang/tekstur/instrumentasjon er nå question-ready i evidenslaget, men ikke materialisert som pathway-sett. Neste produksjon kan legge klang inn som sett 5 uten å åpne de øvrige 43 temaene.
