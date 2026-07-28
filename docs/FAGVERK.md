# History Go – fagverk og egne stedssider

Status: canonical pilot v2  
Runtime: `js/fagverk.js`, `js/fagverk-sted.js`, `js/ui/place-learning-surface.js`  
Data: `data/fagverk/fagverk_registry.json`, `data/fagverk/<fag>/<kapittel>.json`  
Sider: `fagverk.html`, `fagverk-sted.html?place=<place_id>`

## Grunnskille

History Go har nå to forskjellige kunnskapsflater:

1. **Fagsider** forklarer generell og overførbar kunnskap.
2. **Stedets fagverkside** undersøker ett konkret sted gjennom flere faglige linser.

Et sted skal ikke bygges inn som et kapittel eller et «case» i selve faget. Fagkapitlet kan lenke til relevante steder, men stedets historie, spørsmål, begreper og tverrfaglige perspektiver eies av stedets egen side.

## Fagsider

`fagverk.html` viser et sammenhengende læreverk. Et kapittel skal ha:

- en tydelig ingress;
- forkunnskapsspørsmål;
- læringsmål;
- sammenhengende seksjoner;
- hovedpoenger;
- arbeidseksempler;
- vanlige misforståelser;
- begrepsregister;
- anvendelsesoppgaver;
- kontrollspørsmål;
- lenker til selvstendige stedssider;
- inspectable kilder.

`emner.html` beholder rollen som progresjonsoversikt og skal ikke være en erstatning for læreverket.

## Egne stedssider

Alle canonical steder har en stabil sideadresse:

```text
fagverk-sted.html?place=<place_id>
```

Siden lastes generisk fra canonical place-data. Det betyr at et sted har sin egen fagverkside også før det har fått en kuratert oppføring i `fagverk_registry.json`.

En stedsside viser:

- stedets navn, kategori, periode og adresse;
- `desc` som inngang og `popupDesc` som stedartikkel;
- faglige linser;
- spørsmål å ta med til stedet;
- relevante fagsider;
- begreper og emner;
- inspectable eksterne stedskilder når de finnes;
- lenke tilbake til kartet.

`placeLinks` i registryet tilfører kuraterte linser, spørsmål, begreper og kapittelkoblinger. Det erstatter ikke canonical place-data.

## Regjeringskvartalet

Regjeringskvartalet er første kuraterte stedsside. Stedet kobles til offentlig forvaltning og parlamentarisme, men er fjernet som eget casekapittel fra begge fagtekstene.

Stedssiden undersøker blant annet:

- den historiske samlingen av statsforvaltningen;
- arkitektur, kunst og byrom;
- regjering, departementer og embetsverk;
- forbindelsen til Stortingets vedtak og kontroll;
- sikkerhet, åpenhet og minne etter 22. juli.

## Stedspopup

Seksjonen **Fag og begreper** skal alltid kunne åpne stedets egen fagverkside.

For steder med registrerte fagkoblinger viser popupen i tillegg:

- relevante begreper;
- relevante emner;
- relevante fagkapitler.

Tilknytningskort og separate kildelenker beholder den eksisterende interaksjonsmodellen.

## QA

Kjør:

```bash
node --check js/fagverk.js
node --check js/fagverk-sted.js
node --check js/ui/place-learning-surface.js
node --test tests/fagverk-content.test.mjs
node --test tests/fagverk-place-pages.test.mjs
node --test tests/place-learning-surface.test.js
```
