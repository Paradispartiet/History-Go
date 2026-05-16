# SET_MAL_README – Psykologi v4.3

Denne mappen inneholder den kanoniske fagpakken for `psykologi` i History Go.

Psykologipakken skal brukes som styringslag for psykologiske quizzer, psykologsteder og psykologipersoner. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal fortsatt bygge på konkrete institusjoner, klinikker, sykehus, fagmiljøer, behandlingsformer, diagnosehistorie, teorier, utviklingscase, kognitive prosesser, sosialpsykologiske prosesser, traume-, krise- og omsorgscase, forskningskilder, institusjonshistorie, kliniske praksiser eller dokumenterte psykologiske prosesser.

## Filer

```text
fagkart_psykologi_canonical_v4_5.json
methods_psykologi_canonical_v4_5.json
emner_psykologi_canonical_v4_5.json
emnemapping_psykologi_canonical_v4_5.json
psykologipensum_canonical_v4_5.json
quiz_generator_rules_psykologi_v5_1_source_priority_patch.json
supersetQUIZMAL_psykologi.json
SET_MAL_README_psykologi_v4_3.md
```

## Grunnmodell

```text
merke_psykologi / psykologiteori
↓
fagkart_psykologi
↓
methods_psykologi
↓
emner_psykologi
↓
emnemapping_psykologi
↓
psykologipensum
↓
quiz_generator_rules_psykologi
↓
supersetQUIZMAL_psykologi
↓
places_psykologi / people_psykologi
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For psykologifiler betyr det:

```text
places_psykologi / people_psykologi skal bruke em_psy_*
```

De skal ikke bruke:

```text
em_by_*
em_his_*
em_kunst_*
em_lit_*
em_media_*
em_musikk_*
em_pop_*
em_vit_*
em_pol_*
em_naering_*
em_natur_*
```

## Hva hører hjemme i psykologi

Et sted eller en person hører hjemme i `psykologi` når hovedpoenget er psykisk helse, klinikk, sykehus, institusjon, behandling, omsorg, pasientrolle, terapi, krisehjelp, psykologisk fagtradisjon, psykoanalyse, kognitiv psykologi, behaviorisme, humanistisk psykologi, nevropsykologi, personlighet, bevissthet, diagnosemodell, psykometri, utvikling, oppvekst, tilknytning, læring, skole, familie, ungdom, livsløp, sosial utvikling, risiko, beskyttelse, persepsjon, oppmerksomhet, hukommelse, beslutning, følelse, affektregulering, stress, mestring, vaner, bias, hverdagspsykologi, sosialpsykologi, grupper, roller, normer, stigma, normalitet, avvik, fordommer, ensomhet, tilhørighet, sosial kontroll, traume, krise, sorg, vold, regulering, resiliens, trygghet, omsorg etter belastning eller kollektiv krise.

Et sted eller en person skal ikke ligge i `psykologi` bare fordi stedet har helse-, skole-, byroms- eller samfunnstilknytning. Det må finnes en dokumenterbar kobling til psykisk helse, institusjon, fagtradisjon, behandling, diagnosehistorie, utviklingsprosess, kognitiv prosess, sosialpsykologisk prosess, norm, stigma, traume, omsorg eller psykologifaglig kilde.

Hvis hovedrollen er medisin som somatikk, politikk, historie, vitenskap, by, media, kunst, litteratur, sport, natur, næringsliv, musikk eller populærkultur, skal hovedkategori være den kategorien. Psykologi kan da være tag eller sekundærlag.

## Viktig sikkerhetsregel

Psykologipakken skal aldri brukes til å diagnostisere historiske personer, nålevende personer, brukere eller navngitte enkeltpersoner.

Quizspørsmål skal handle om dokumenterte fagtradisjoner, institusjoner, behandlingsformer, begreper, praksiser, historiske utviklingslinjer, forskningsspor eller samfunnsprosesser.

Ikke skriv spørsmål som:

```text
Hvilken diagnose passer best på denne personen?
Hva føler du selv?
Hva burde man gjøre hvis man har dette problemet?
```

Skriv heller spørsmål som starter i dokumentert fag, sted eller praksis:

```text
Hvilken institusjonshistorisk rolle har dette stedet hatt?
Hvilken behandlingsform eller fagtradisjon er dette knyttet til?
Hvilket psykologisk begrep forklarer denne dokumenterte praksisen?
Hvordan viser dette stedet forholdet mellom omsorg, behandling og institusjon?
```

## Eksempler på riktig sortering

```text
Gaustad sykehus → psykologi hvis hovedvinkel er psykisk helse, psykiatrihistorie, institusjon, behandling eller omsorgssystem
Dikemark → psykologi hvis hovedvinkel er psykiatrihistorie, institusjon, behandling, omsorg eller normalitet/avvik
Psykologisk institutt / Blindern → psykologi hvis hovedvinkel er fagtradisjon, forskning, undervisning, teori eller psykologifaglig miljø
Familievernkontor → psykologi hvis hovedvinkel er familie, samspill, relasjon, terapi, omsorg eller konfliktarbeid
Krisesenter → psykologi hvis hovedvinkel er traume, krise, vold, trygghet, omsorg eller resiliens
Helsestasjon → psykologi hvis hovedvinkel er utvikling, oppvekst, foreldreveiledning, tidlig innsats eller omsorg
Skole → psykologi hvis hovedvinkel er læring, motivasjon, utvikling, sosialpsykologi, trivsel, normer eller mestring
Tøyen / Grønland / Groruddalen → psykologi hvis hovedvinkel er stigma, tilhørighet, sosialpsykologi, oppvekstmiljø, psykisk helse eller levekår som psykologisk kontekst
22. juli-minnesteder → psykologi hvis hovedvinkel er traume, sorg, kollektiv krise, trygghet eller bearbeiding
Oslo S → psykologi hvis hovedvinkel er hverdagspsykologi, stress, oppmerksomhet, trygghet, sosial tilhørighet eller byrom og psykisk helse
```

```text
Sykehus som somatisk medisinsk institusjon → vitenskap/medisin hvis psykisk helse ikke er hovedvinkel
Rådhus, Storting, NAV som styring og rettigheter → politikk
Gamle institusjoner som ren historisk utvikling uten psykologifaglig vinkel → historie
Universitet som generell forskning eller vitenskapshistorie → vitenskap
Skole som byinstitusjon, arkitektur eller skolehistorie uten psykologisk lærings-/utviklingsvinkel → by/historie
Parker, torg og gater som byrom → by
Presse, offentlig debatt og journalistikk → media
Kunstverk, museer og gallerirom → kunst
Forfattersteder og bibliotek → litteratur
Idrettsanlegg og sportsarenaer → sport
Bedrifter, kapital, butikker og varehandel → næringsliv
```

## Kildeprioritet

```text
1. Konkrete institusjoner, klinikker, sykehus, fagmiljøer, behandlingsformer, diagnosehistorie, teorier, utviklingscase, kognitive prosesser, sosialpsykologiske prosesser, traume-, krise- eller omsorgscase
2. Offisielle helse-, universitets-, institusjons-, arkiv-, museums-, fagmiljø-, forsknings-, behandlings-, rapport- eller historiske kilder
3. Psykologihistorie, klinisk forskning, utviklingspsykologi, kognitiv psykologi, sosialpsykologi, nevropsykologi, traumeforskning, diagnosehistorie, behandlingsforskning og psykologifaglige kilder
4. Dokumentert psykologisk prosess: opplevelse, følelse, tenkning, handling, læring, utvikling, tilknytning, regulering, stigma, normalitet, mestring, krise, traume, sorg eller omsorg
5. Dokumentert sosial og institusjonell kontekst: pasientrolle, omsorgssystem, velferd, offentlighet, stigma, skole, familie, gruppe, arbeidsplass, byrom eller tjenesteapparat
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i psykologiankeret

Et psykologispørsmål skal starte i minst ett av disse ankrene:

```text
psykisk helse
klinikk
sykehus
institusjon
behandling
terapi
omsorgssystem
pasientrolle
psykologisk teori
psykoanalyse
kognitiv psykologi
behaviorisme
humanistisk psykologi
nevropsykologi
diagnosehistorie
psykometri
utvikling
tilknytning
barndom
familie
skole
læring
livsløp
persepsjon
oppmerksomhet
hukommelse
beslutning
følelse
affektregulering
stress
mestring
vane
bias
gruppe
norm
stigma
normalitet
identitet
ensomhet
sosial kontroll
traume
krise
sorg
vold
resiliens
trygghet
omsorg
arkiv
forskningskilde
klinisk kilde
institusjonshistorie
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Migrering av eksisterende psykologifiler

Når `places_psykologi.json` og `people_psykologi.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med psykologikoblinger.

Eksempel på feil hovedemner i psykologifil:

```json
"emne_ids": [
  "em_vit_medisinhistorie",
  "em_his_institusjonshistorie"
]
```

skal erstattes med relevante `em_psy_*`, for eksempel:

```json
"emne_ids": [
  "em_psy_institusjoner_psykiatri",
  "em_psy_psykisk_helse",
  "em_psy_behandling_omsorg"
]
```

Valg av `em_psy_*` skal alltid gjøres ut fra faktisk sted/person/institusjon/fagtradisjon/behandling/diagnosehistorie/utviklingsprosess/kognitiv prosess/erfaring/norm/traume/omsorg, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_psy_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

```text
id
name
category
desc
popupDesc
year
quiz_profile.place_type
quiz_profile.subtype
quiz_profile.signature_features
quiz_profile.must_include
quiz_profile.notes
```

Deretter velges 2–4 presise `em_psy_*`.

## Faste kontrollspørsmål før et sted legges i psykologi

```text
Er hovedpoenget psykologifaglig?
Finnes det konkret institusjon, fagtradisjon, behandling, diagnosehistorie, utviklingsprosess, kognitiv prosess, sosialpsykologisk prosess, norm, stigma, traume, omsorg eller dokumentert psykologisk kilde?
Kan quizen bygges fra psykologifaglige, kliniske, institusjonshistoriske, forskningsmessige, behandlingsmessige, utviklingsmessige eller dokumenterte erfarings-/prosesskilder?
Er dette egentlig medisin/somatikk, politikk, historie, vitenskap, by, media, kunst, litteratur, sport, natur, næringsliv, musikk eller populærkultur?
Vil spørsmålet risikere å diagnostisere en person?
```

Hvis svaret på siste spørsmål er ja, skal spørsmålet skrives om eller avvises.

## Viktige kategorigrenser

```text
Psykiatrisk institusjon som psykisk helse, behandling, omsorg eller pasientrolle → psykologi
Sykehus som somatisk behandling, kirurgi eller medisinsk teknologi → vitenskap/medisin
Universitet som psykologisk fagtradisjon, institutt eller forskning → psykologi
Universitet som generell vitenskapshistorie → vitenskap
Familievernkontor som relasjon, samspill og terapi → psykologi
Familievernkontor som rettighet, forvaltning eller offentlig tjeneste → politikk hvis styring/rett er hovedvinkel
Skole som læring, motivasjon, sosial utvikling og oppvekstpsykologi → psykologi
Skole som bygg, skolehistorie eller kommunal institusjon → by/historie/politikk etter hovedvinkel
Minnested som traume, sorg og kollektiv bearbeiding → psykologi
Minnested som historisk hendelse eller minnepolitikk → historie/politikk etter hovedvinkel
Byrom som stress, oppmerksomhet, trygghet eller sosialpsykologi → psykologi
Byrom som arkitektur, gatebruk eller byutvikling → by
```

## Status

Psykologipakken inneholder per nå:

```text
6 domener
58 emner
58 metoder
58 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 psykologi-supersetmal
```

Neste arbeid etter denne pakken er å migrere `places_psykologi.json` og `people_psykologi.json` slik at de bruker `em_psy_*` og ikke gamle `em_by_*`, `em_his_*`, `em_kunst_*`, `em_lit_*`, `em_media_*`, `em_musikk_*`, `em_pop_*`, `em_vit_*`, `em_pol_*`, `em_naering_*`, `em_natur_*` eller andre fagpakker som hovedemner.
