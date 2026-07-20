# Relativt antall quizsett – Sport & lek v1

Denne filen er den menneskelesbare forklaringen til `quiz_generator_rules_sport_v5_2_relative_set_scope_patch.json`.

## Hovedregel

Åtte sett er sportpakkens **fullmodell og øvre ramme**. Det er ikke et krav om at alle steder eller personer skal ha åtte sett.

Antall sett skal bestemmes av objektets:

- historiske dybde og tidsmessige spenn
- idrettslige bredde
- lokale, regionale, nasjonale eller internasjonale betydning
- dokumenterte klubber, personer, hendelser, rekorder og praksiser
- endringer i arena, anlegg, bruk og samfunnsrolle
- tilgjengelige eksterne kilder

## Omfangsnivåer

```text
Kompakt objekt: 1–2 sett
Standard objekt: 3–4 sett
Omfattende objekt: 5–6 sett
Svært betydningsfullt eller komplekst objekt: 7–8 sett
```

Nivåene er faglige vurderingsrammer, ikke et mekanisk poengsystem.

## Kildene setter taket

Betydning alene er ikke nok til å øke antall sett. Hvert sett må bygge på et eget, klart dokumentert læringsspor. Et kjent sted skal derfor ikke få åtte sett dersom materialet bare støtter tre tydelig forskjellige sett.

Det skal aldri lages fyllsett for å nå et bestemt antall.

## Hvordan de åtte settfasene brukes

Settveiledningen i basisfilen er et modulbibliotek:

1. Settveiledning 1 er grunnlaget.
2. Settveiledning 2–7 velges etter hva som faktisk er relevant for stedet eller personen.
3. Settveiledning 8 er en syntesemodul for omfattende objekter og er ikke obligatorisk.

Valgte veiledningsfaser trenger ikke være sammenhengende. En quiz kan for eksempel bruke veiledningsfase 1, 4 og 7, men produksjonssettene nummereres fortsatt 1, 2 og 3.

## Metadata som skal følge quizen

Quizroten skal oppgi:

```text
selected_set_count
scope_tier
set_count_basis
selected_set_guidance_ids
omitted_set_guidance_ids
source_coverage_note
```

Hvert sett skal oppgi:

```text
set_number
set_guidance_id
set_title
learning_purpose
```

## Eksisterende tosettsquizzer

En quiz med to sett er ikke automatisk feil. Den skal vurderes mot stedets faktiske omfang og dokumentasjon. Den utvides bare når stedet støtter flere selvstendige læringsspor.

Målet er ikke likt antall sett overalt. Målet er at hvert sted får riktig faglig dybde.
