# Musikkvitenskap: kildegrunnlag for lydmedier, teknologi og beregning v1

Dato: 2026-07-28  
Samlet kilderevisjon: `musikkvitenskap-kildegrunnlag-fem-domener-v6-2026-07-28`  
Teknologibatch: `musikkvitenskap-kildegrunnlag-lydmedier-teknologi-v1-2026-07-28`

## Resultat

Domenet `lydmedier_teknologi_beregning` har fått et kontrollert bibliografisk grunnlag og seks temavise dossierer. Pakken er vitenskapelig kilde- og evidensgovernance, ikke pensum, undervisningsopplegg eller systematisk litteraturgjennomgang.

Ny batch:

- 4 modulære kilderegistre
- 6 temadossierer
- 20 verifiserte forskningspublikasjoner
- 863 lokale batchkontroller
- 0 feil

Samlet pakke etter aktivering:

- 5 kildedomener
- 17 kilderegistre
- 30 temadossierer
- 96 unike forskningspublikasjoner

## Kilderegistre

### Studio, opptak og lydmedier

Registeret dekker lydreproduksjon, record production, studioprosess, miks, master og kreative produksjonsroller.

### Instrumenter, grensesnitt og systemer

Registeret dekker elektroniske og digitale musikkinstrumenter, mapping, kontroll, signalvei, materialitet, programvare og faktisk bruk.

### Plattform, sampling og rettigheter

Registeret dekker digitale musikkformater, metadata, strømmeplattformer, kuratering, sampling, remiks, attribusjon og opphavsrett.

### MIR, anbefaling og reproduserbarhet

Registeret dekker musikkprosessering, datasett, annotasjon, evalueringsvaliditet, musikkanbefaling, fairness og reproduserbar beregning.

## Seks aktive dossierer

1. `em_musikk_vit_opptak_studio_som_instrument`
2. `em_musikk_vit_instrument_grensesnitt_lydsystem`
3. `em_musikk_vit_radio_plate_streaming_plattform`
4. `em_musikk_vit_sampling_remiks_opphavsrett`
5. `em_musikk_vit_mir_features_datasett_evaluering`
6. `em_musikk_vit_algoritmer_anbefaling_bias_reproduserbarhet`

## Teknologievidens

Dossierene skiller eksplisitt mellom:

- session, take, edit, miks, master, utgivelse, remaster og strømmeversjon
- fysisk instrument, maskinvarerevisjon, firmware, programvare, plugin, patch og mapping
- lydfil, codec, sample rate, bitdybde, spor, stem og filhash
- kodebase, commit eller release, runtime-miljø, avhengigheter, konfigurasjon og seed
- datasett, versjon, utvalg, avledningskjede, lisens og tilgang
- annotasjonsskjema, annotatører, uenighet og usikkerhet
- train-, validation- og test-splitt, lekkasjekontroll, baseline, målvariabel og metrikk
- plattformgrensesnitt, policy, API, marked, konto- og observasjonsvindu
- hørbar likhet, produksjonsproveniens og juridisk rettighetsstatus som separate evidensformer

## Sperre før spørsmålsproduksjon

Alle seks dossierer bruker regelen:

`blocked_unless_version_provenance_evaluation_and_rights_resolved`

Spørsmål kan ikke frigis før følgende er avklart:

- objekt-, fil-, system- eller versjonsidentitet
- kode, miljø, avhengigheter og konfigurasjon når beregning bærer påstanden
- datasett- og annotasjonsproveniens
- evalueringsdesign, baseline, mål og feilanalyse
- opptaks-, data-, kode- og gjenbruksrettigheter
- plattform-, policy-, jurisdiksjons- og institusjonskontekst
- generaliseringsområde og relevante bias-/feilgrupper

## Temaspesifikke slutningsgrenser

### Opptak og studio

Den ferdige stereomiksen dokumenterer ikke alene session, mikrofonering, redigering, plugin, aktør eller intensjon. Master, remaster og strømmeversjon behandles som ulike signalobjekter når de faktisk er ulike versjoner.

### Instrumenter og grensesnitt

Teknisk kapasitet, designintensjon og faktisk musikerbruk er separate evidensledd. Affordans forstås relasjonelt mellom system, kropp, ferdighet og situasjon.

### Radio, plate, streaming og plattform

Et grensesnitt, en policytekst eller selskapets egen forklaring dokumenterer ikke alene algoritmisk effekt. Plattformpåstander må dateres og knyttes til definert marked, konto, datainnsamling og observasjonsvindu.

### Sampling, remiks og opphavsrett

Hørbar likhet alene dokumenterer ikke direkte digital sampling, lisens, tillatelse, krenkelse eller kunstnerisk intensjon. Kildeopptak, målverk, produksjonsspor og juridiske dokumenter har ulike evidensroller.

### MIR: features, datasett og evaluering

Benchmarkresultat avgrenses til datasett, annotasjon, målvariabel, split, baseline, metrikk og evalueringskode. Høy score er ikke i seg selv dokumentasjon av musikalsk forståelse eller kulturell gyldighet.

### Algoritmer, anbefaling, bias og reproduserbarhet

Rangering og anbefaling behandles ikke som nøytral relevans. Åpen kildekode alene er ikke tilstrekkelig for reproduserbarhet uten identisk eller dokumentert data-, miljø-, konfigurasjons- og seed-kontekst.

## Verifikasjonsnivå

Fullføringsnivået er `publisher_verified_bibliographic_basis`.

Bibliografisk identitet, offisiell forlags- eller tidsskriftmetadata og tilgjengelig abstract eller beskrivelse er kontrollert. Pakken hevder ikke at fulltekst er gjennomgått. Detaljpåstander krever relevant fulltekst og presis side-, kapittel-, tidskode-, fil-, commit-, datasett-, eksperiment- eller objektlokator.

Record-level RILM-søk er ikke gjennomført fordi abonnementstilgang kreves. Dette er registrert som et åpent hull.

## Validering

Den domene-spesifikke preflighten kontrollerer:

- alle fire registre og seks dossierer
- 20 unike og faktisk brukte kilde-ID-er
- offisielle kildeverter og bibliografiske identifikatorer
- nyere forskning og metodekilder
- objekttyper mot aktiv v2-modul
- minst åtte identitets- og kontekstfelt per dossier
- teknologi- og beregningsevidenskjede
- versjons-, proveniens-, evaluerings- og rettighetsport
- søkelogg, dekningsskjevhet og kjente hull

Resultat: **863 PASS, 0 FAIL**.

Den kumulative validatoren er oppdatert til fem manifestdrevne batcher og passerer syntakskontroll lokalt. Autoritativ samlet PASS-telling fastsettes i GitHub Actions etter publisering.

## Neste produksjonsfase

Neste naturlige kildedomene er `persepsjon_kognisjon_akustikk`. Der bør eksperimentprotokoll, stimulusidentitet, apparatur, deltakerutvalg, psykoakustisk måling, statistisk modell, effektstørrelse og generalisering gjøres bindende før spørsmål frigis.
