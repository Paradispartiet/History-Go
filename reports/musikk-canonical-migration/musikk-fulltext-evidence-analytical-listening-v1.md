# Musikk – fulltekstevidens for analytisk lytting og presis beskrivelse v1

Dato: 2026-07-30

## Leveranse

Batchen verifiserer `em_musikk_vit_analytisk_lytting_beskrivelse` med ett avgrenset `sonic_observation`-claim og ett artikkelbundet lyd-/videoobjekt.

Forskningsgrunnlag:

- Leonardo Labrada, Fernando Chaib og Charles Augusto Braga Leandro, *Tornando possível o impossível: ideias e soluções performativas em algumas obras percussivas de Iannis Xenakis*, Per Musi 42, publisert 2023-07-19, DOI `10.35699/2317-6377.2022.42072`
- Ben Duinker, *Rebonds: Structural Affordances, Negotiation, and Creation*, Music Theory Online 27(4), 2021, DOI `10.30535/mto.27.4.5`

## Direct object

`obj_rebonds_b_authors_illustrative_video_oseu0xr6bss`

Objektet er det samme YouTube-mediet som Per Musi-artikkelen peker til gjennom video-ID:

`OsEU0xr6bSs`

Artikkelen sier eksplisitt at videoene er tatt opp av forfatterne og har en illustrativ, ikke-normerende rolle.

Tre artikkelstyrte locatorer frigis:

1. `00:31` – Figure 3-eksempel / fire-baquette-kontekst for drag
2. `01:00` – Figure 4 / foreslått alternerende to-baquette-løsning
3. `01:29` – Figure 5 / sammenligning av tidligere løsninger langsomt og raskt rundt mm. 61–64

Objektidentiteten er låst til artikkelens YouTube-ID og tidsparametre. Artikkelen oppgir ikke eksakt opptaksdato, individuell utøverattribusjon eller kildefil-master/checksum. Det dokumenteres som en begrensning; History Go finner ikke opp slike metadata.

## Released claim

`claim_musikk_analytical_listening_rebonds_drag_solutions_timecoded_2023`

Released claim er bare at artikkelens egne framføringsløsninger er gjort direkte sammenlignbare gjennom de tre tidskodene, med særskilt fokus på `01:29` rundt mm. 61–64.

Claim type:

`sonic_observation`

Metode:

`kritisk_lytteanalyse`

Det released claimet sier ikke:

- at én løsning er den riktige
- at eksemplene representerer Rebonds-praksis generelt
- at Xenakis hadde en bestemt dokumentert intensjon
- at én segmentering eller strukturell lesning er universell

## Metodologisk støtte

Duinker analyserer ti innspillinger av *Rebonds* på tempo, instrumentvalg/tuning, aksent, gruppering og score fidelity.

Det brukes her som metodegrense: innspillinger kan avdekke analytiske forhold en ren scorelesning ikke viser, men en enkelt innspilling skal ikke oppgraderes til én autoritativ struktur.

## Rights

Per Musi-artikkelen er CC BY 4.0.

Det er ikke tilstrekkelig dokumentert at den separat YouTube-hostede mediefilen kan kopieres, ekstraheres, rehostes eller embeddes av History Go.

Leveransemodus er derfor:

`external_link_and_metadata_only`

History Go lagrer bare:

- video-ID
- artikkelproveniens
- tidskoder
- avgrensede beskrivelser
- ekstern lenke

## Aggregert status

Fulltekstevidensvalidatoren bekrefter:

- 6 fulltekstevidenstemaer av 48
- 14 fulltekstgjennomganger, hvorav 3 canonicale og 11 produksjonsutvidelser
- 6 direct objects
- 13 claim-klare funn
- 19 slutningsgrenser
- 6 question-ready emner
- 6 question-ready claims

Resultat:

`965 PASS / 0 FAIL`

Musikk source dossiers forblir:

`6520 PASS / 0 FAIL`

Den aktive subject pathwayen endres ikke i denne batchen og forblir:

- 5 sett
- 25 spørsmål
- `1480 PASS / 0 FAIL`
- source metadata `328 PASS / 0 FAIL`

De øvrige 42 canonicale Musikk-temaene forblir blokkert.

## CI

På første firefil-head var alle workflowene som denne avgrensede diffen faktisk trigget grønne:

- Data checks
- Musikk scientific quality
- Fagverk Musikk
- Fagverk subject inventory

`Fagverk Musikk` bekreftet samtidig source dossiers `6520/0`, fulltekstevidens `965/0`, eksisterende pathway `1480/0` og pathway source metadata `328/0`.

## Neste gate

Analysedomenets seks canonicale temaer er nå fulltekst-/object-verifisert. Neste produksjon kan materialisere det eksplisitt frigitte claimet som subject-pathway sett 6. Pathway-validatoren er allerede evidensdrevet, så utvidelsen skal kunne gå fra 5 sett / 25 spørsmål til 6 sett / 30 spørsmål uten ny emnehardkoding.
