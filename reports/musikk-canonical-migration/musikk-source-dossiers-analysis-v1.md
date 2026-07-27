# Musikkvitenskap: kildegrunnlag for musikalsk analyse v1

Dato: 2026-07-27  
Kilderevisjon: `musikkvitenskap-kildegrunnlag-analyse-v1-2026-07-27`

## Formål

Denne produksjonsfasen legger et eksplisitt og kontrollerbart forsknings- og kildegrunnlag under de seks aktive temaene i domenet `musikalsk_analyse_lyd_struktur`.

Arbeidet er ikke et undervisningsopplegg, en pensumliste eller en systematisk litteraturgjennomgang. Det etablerer et publisher-verifisert bibliografisk grunnlag, en bindende dossierkontrakt og konkrete sperrer mot at brede fagpåstander eller quizspørsmål produseres uten et identifisert direkte musikk- eller kildeobjekt.

## Omfang

Følgende seks temaer har fått canonicale kildedossierer:

1. Analytisk lytting og presis beskrivelse
2. Rytme, meter, groove og timing
3. Melodi, motiv og frasering
4. Harmoni, tonalitet og modalitet
5. Klang, tekstur og instrumentasjon
6. Form, prosess og improvisasjon

Fire modulære kilderegistre inneholder til sammen 21 verifiserte forskningspublikasjoner fra akademiske forlag og fagfellevurderte tidsskrifter. Registeret skiller mellom canonicale arbeider, nyere forskningsstatus og metodekilder, og dokumenterer for hver kilde:

- bibliografisk identitet
- DOI eller ISBN
- offisiell forlags- eller tidsskriftadresse
- verifikasjons- og fulltekststatus
- faglig rekkevidde
- tillatt bruk
- forbudt overtolkning

## Dossierkontrakt

Hvert temadossier må inneholde:

- minst to canonicale forskningskilder
- minst én nyere forskningskilde fra 2018 eller senere
- minst én metodekilde
- et direkte objektkrav før spørsmålsfrigivelse
- tillatte objekttyper og minimumsmetadata
- minst to presise lokatorer, som tidskode, takt, side, figur eller datasettversjon
- dokumenterte faglige spenninger
- avgrensede tillatte påstander
- eksplisitte forbud mot overtolkning
- søkelogg, søkedato og søkeavgrensning
- språk- og geografiske dekningsskjevheter
- kjente hull i kildegrunnlaget

Detaljpåstander kan ikke produseres bare fra forlagsmetadata eller et bok- eller artikkelsammendrag. De krever relevant fulltekst, presis lokator og et identifisert forskningsobjekt.

## Søke- og verifikasjonsnivå

Kildene er kontrollert mot offisielle sider hos akademiske forlag eller fagfellevurderte tidsskrifter. DOI-er, ISBN-er, publikasjonsidentitet og beskrevet faglig omfang er registrert der dette var tilgjengelig.

RILMs offentlige klassifikasjonssystem ble brukt til faglig søkeavgrensning. Følgende klasser ble dokumentert:

- 56 Improvisation
- 61 Rhythm, meter, tempo
- 63 Harmony, counterpoint, voice-leading
- 64 Form and genre
- 65 Sound color, texture, register
- 67 Structural analysis
- 69 Melody and motive

Record-level søk i RILM ble ikke gjennomført fordi abonnementstilgang kreves. Dette er registrert som et eksplisitt tilgangs- og dekningsgap i hvert dossier. Pakken hevder derfor ikke at søket er uttømmende eller systematisk.

## Autoritet og kompatibilitet

Hovedrevisjonen `musikkvitenskap-emnemigrasjon-v2-2026-07-27` beholdes uendret. Kildegrunnlaget eksponeres separat gjennom:

- `source_revision`
- `source_dossier_contract_v1.json`
- `scholarly_source_registries_v1/*.json`
- `source_dossiers_v1/musikalsk_analyse_lyd_struktur/*.json`

Dette gjør kildeutvidelsen kompatibel med den eksisterende emnevalidatoren samtidig som nye kildedossierer kan utvikles domenevis.

## Validering

Permanent validator: `tools/validate-musikk-source-dossiers-v1.mjs`

Resultat:

- 1 kildedomene
- 6 temadossierer
- 21 verifiserte forskningskilder
- 7 RILM-klasser brukt til søkeavgrensning
- alle 21 kilder brukt av minst ett tema
- direkte musikk- eller kildeobjekt påkrevd før spørsmålsfrigivelse
- ingen undervisningsnøkler
- fullføringsnivå tydelig satt til `publisher_verified_bibliographic_basis`
- systematisk litteraturreview: nei
- record-level RILM-søk: ikke utført
- fire modulære kilderegistre og seks separate dossierfiler
- **863 PASS, 0 FAIL**

GitHub Actions-jobben `Musikk scientific quality` kjører både den eksisterende emnevalidatoren og den nye kildevalidatoren.

## Neste produksjonsfase

Neste batch bør bygge tilsvarende dossierer for `historisk_musikkvitenskap_historiografi`. Kildegrunnlaget skal fortsatt produseres domenevis, slik at kildeidentitet, rekkevidde, tilgangsgap og direkte objektkrav kan kontrolleres faglig før pakken utvides videre.
