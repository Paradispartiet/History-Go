# Set-mal for stedsknyttede quizfiler i History Go v4.4

Denne malen gjelder for `*_sets.json`-filer og skal leses sammen med:

- `QUIZ_INNHOLDSSTANDARD_V1.md`
- `quiz_generator_rules_by_v1.md`
- `quiz_generator_rules_by_v5_1_source_priority_patch.json`

Ved motstrid er `QUIZ_INNHOLDSSTANDARD_V1.md` bindende.

## Hovedprinsipp

History Go skal først og fremst være **historie og kunnskap gjennom sted**.

Prioritert rekkefølge:

1. lokale og historiske kilder
2. personer, hendelser, bygninger, verk og tidligere funksjoner
3. konkrete arkitektoniske, tekniske og synlige trekk
4. årsak, endring og sammenheng
5. emner, teori og begreper som metadata og dybdelag

Generatoren skal ikke starte med et emne og deretter konstruere et stedsspørsmål som demonstrerer emnet.

## Obligatorisk quizbalanse

For quizpakker med minst ti spørsmål:

- 60–70 % konkrete faktaspørsmål
- 20–30 % årsak, endring og sammenheng
- maks 10–15 % teori og begreper

Teoriandelen er et maksimum, ikke et mål. En quiz kan ha null synlige teorispørsmål.

## Forbudt generatorstil

- «Hvorfor passer stedet til emnet …»
- «Hva gjør stedet relevant for emnet …»
- «Hvordan kan stedet leses som …»
- «Hva er den mest presise faglige lesningen …»
- «Hvilket begrep beskriver best …» når oppgaven bare velger et emneord
- spørsmål som nevner fagplan, fagkart, emnekart, mapping eller hooks
- ett langt akademisk fasitsvar mot to korte tullesvar

## Riktig stil

- hvem, hva, når og hvor
- hva som lå der før
- hva som ble bygget, flyttet, revet eller endret
- personer, verk, konflikter, funksjoner og hendelser
- hvordan en konkret konstruksjon eller løsning virker
- hvorfor en dokumentert beslutning ble tatt
- hvilke synlige spor som viser historien
- reelle sammenligninger som bygger på kilder

Et normalt faktaspørsmål er bedre enn en kunstig analyseoppgave.

## Adaptiv størrelse

Quizlengde skal følge stoffmengden, ikke et produksjonsmål.

- **minimal_place** = 4 sett × 5 spørsmål
- **normal_place** = 5 sett × 6 spørsmål
- **rich_place** = 8 sett × 7 spørsmål
- **major_place** = 10 sett × 7 spørsmål

Disse er øvre produksjonsrammer, ikke krav om fylling. Et rikt sted kan få en kortere quiz dersom de ekstra spørsmålene ellers blir svake eller gjentakende.

## Settstruktur

### Sett 1 — opprinnelse og hovedhistorie

Grunnleggelse, tidligere funksjon, sentrale personer, datoer og stedets viktigste fortelling.

### Sett 2 — bygninger, verk og hendelser

Arkitektur, konstruksjon, historiske hendelser, ombygginger og synlige spor.

### Sett 3 — bruk, liv og kuriositeter

Faktisk bruk, brukergrupper, aktiviteter, teknologi, hverdagsliv og minneverdige detaljer.

### Sett 4 — stedsspesifikke fakta og løsninger

Materialer, funksjoner, miljøløsninger, teknikk, priser og dokumenterbare kjennetegn.

### Sett 5 — årsak og utvikling

Hvorfor stedet ble slik, hva endringer førte til, og hvilke konflikter eller valg som hadde betydning.

### Sett 6 og videre — bare ved nok stoff

Dypere sammenhenger, sammenligninger og i begrenset grad teori. Senere sett fritar aldri generatoren fra balansekravet for hele quizen.

## Banality guard

Hvis generatoren ikke finner nok sterke spørsmål om:

- personer
- hendelser
- bygninger eller verk
- tidligere funksjoner
- konflikter
- konstruksjon
- synlige spor
- dokumentert bruk

skal den korte ned quizen.

Den skal ikke fylle med:

- emneparafraser
- gjentatte begrepsvalg
- isolerte årstall uten sammenheng
- konstruerte kontraster
- fagplanspråk i spørsmålsform

## Theory rule

Teori og begreper skal som hovedregel:

- ligge i metadata
- utdype `knowledge`
- hjelpe progresjon og læringskobling
- ikke være selve motoren i synlige spørsmål

## Kontroll

Kjør:

```bash
npm run audit:quiz-content
npm run test:quiz-content-audit
```

Auditen kontrollerer balanse, forbudte språkmønstre, gjentatte åpninger og avslørende svarlengde.
