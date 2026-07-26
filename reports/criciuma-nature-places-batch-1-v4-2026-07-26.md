# Criciúma natursteder – produksjonsbatch 1

Dato: 2026-07-26

## Omfang

Denne batchen implementerer fem nye natursteder fra den mergede kandidatrapporten:

1. Parque Ecológico Municipal José Milanese e Horto Florestal Antônio José Tolé Guglielmi
2. Rio Criciúma
3. Morro Casagrande – antigo Morro do Céu
4. APA Municipal Bosque do Repouso
5. APA Morro Albino e Estevão

## Innholdskontrakt

Alle fem steder følger `history_go_place_description_templates_v4`:

- `desc` mellom 40 og 80 ord
- `popupDesc` på minst 300 ord
- minst tre avsnitt
- stedsspesifikke årstall, lover, naturtyper, prosesser, arter, mål og arealendringer
- quizprofiler som kan gi normale faktaspørsmål
- `nature_profile` med dokumenterte temaer og arter
- ingen oppdiktede eller uverifiserte `flora`/`fauna`-ID-er

## Koordinatmodell

Alle fem steder beholder `coordStatus: needs_source`.

- Parken bruker en grov vitenskapelig områdekoordinat og trenger parkpolygon eller dokumentert hovedinngang.
- Rio Criciúma bruker et dokumentert observasjonspunkt ved Rua Henrique Lage og trenger linjegeometri, kildeanker og sammenløp.
- Morro Casagrande bruker et beregnet kandidatanker fra publiserte forskningstransekter og trenger dagens Z-APA-polygon og offentlig trailhead.
- Bosque do Repouso bruker et grovt bydels-/gateanker og trenger polygonet etter soneendringene i 2022–2024.
- Morro Albino e Estevão bruker et beregnet arealanker fra publiserte UTM-grensekontekster og trenger gjeldende polygon og lovlig tilgangspunkt.

Ingen kandidatkoordinat er oppgradert til verifisert.

## Manifest

Criciúma-pakken går fra 45 til 50 steder:

- `natur`: 2 → 7
- Coordinate Evidence-filer: 45 → 50
- `needsSource`: 45 → 50
- `verified`: 0

## Validering

- alle fem place-filer parser som JSON
- alle fem evidence-filer parser som JSON
- place-ID og evidence-ID samsvarer én-til-én
- alle evidence-filer peker til riktig `places_criciuma_10`-fil
- alle `desc` ligger innenfor 40–80 ord
- alle `popupDesc` er minst 300 ord og har minst tre avsnitt
- alle steder har `category: natur`, `nature_profile`, `quiz_profile`, `wonderkammer`, kilder og koordinatnotat
- manifestet inneholder 50 unike place-filer
- kategorisummen er 50
