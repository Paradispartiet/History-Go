# Gamle Aker kirke people batch 1 validation

Dato: 2026-07-20

## Canonical audit og handlinger

- `heinrich_ernst_schirmer` — **created_new** — `people/by/oslo/gamle_aker_kirke/heinrich_ernst_schirmer.json`
- `wilhelm_von_hanno` — **updated_existing** — `data/people/historie/oslo/people_historie_oslo.json`
- `torvald_moseid` — **created_new** — `people/kunst/oslo/gamle_aker_kirke/torvald_moseid.json`

## Streng stedsgate

- Heinrich Ernst Schirmer og Wilhelm von Hanno: dokumentert restaurering av kirkens eksteriør og tårn fram mot 1861.
- Torvald Moseid: dokumentert glassmaleri i Gamle Aker kirke fra 1955.

Alle tre koblingene gjelder konkret arbeid på eller i den fysiske kirken. Generelle Oslo-, kirkekunst- eller arkitekturassosiasjoner er ikke nok.

## Bevisst utsatt kandidat

Thomas Blix er ikke med i denne batchen. Kildene er enige om en direkte inventarkobling, men spriker om dateringen av prekestol/døpefont (1715/1725). Personen kan tas i en senere batch etter en egen kildeavklaring, uten at denne batchen låser inn en usikker datering.

## Kilder

- Pilegrimsleden / St. Hanshaugen sokn: restaureringen ved Schirmer og von Hanno.
- Norsk kunstnerleksikon / Store norske leksikon: Torvald Moseids glassmaleri fra 1955.
- St. Hanshaugen sokn og Norsk biografisk leksikon ble sammenlignet for Thomas Blix-dateringen.

## Runtime-gater

Materializer stopper dersom `gamle_aker_kirke` allerede har en people-lenke på fersk main, eller dersom en kandidat matcher mer enn én canonical record. Etter materialisering skal repoets ordinære People- og Places-gater passere.
