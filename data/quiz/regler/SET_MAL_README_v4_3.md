# Set-mal for stedsknyttede quizfiler i History Go

Denne malen gjelder for `*_sets.json`-filer i History Go og skal leses sammen med:

- `quiz_generator_rules_by_v4_3.json`

## Hovedprinsipp

History Go skal først og fremst være **historie gjennom sted**.

Prioritert rekkefølge i quizene:

1. lokalhistorie  
2. historier, personer, bygninger og hendelser  
3. humor, kuriositeter og minneverdige detaljer  
4. konkrete fakta om stedet  
5. fag, emner og begreper

Det betyr at quiz generatoren aldri skal starte med emner eller teori hvis stedet ennå ikke har fått en sterk historisk og stedlig quizkjerne.

## Viktig regel

Quiz generatoren kan bruke emner, mapping og teori i bakgrunnen, men spørsmålene skal **ikke** se ut som generator-spørsmål.

### Forbudt stil
- «Hvilken topic hook fra fagkartet passer best …»
- «Hvilken teoretiker fra fagplanen er særlig nyttig når …»
- «Hvilken hook fra fagkartet …»
- «Når stedet analyseres gjennom fagplanen …»

### Riktig stil
- spørsmål om hva som lå her før
- spørsmål om hva som ble bygget, flyttet, revet eller endret
- spørsmål om personer, bygninger, konflikter, spor og konkrete hendelser
- dype analytiske spørsmål som fortsatt handler om stedet, ikke om fagplanspråk

## Adaptiv størrelse

Quiz generatoren skal velge størrelse etter stoffmengde.

- **minimal_place** = 4 sett × 5 spørsmål
- **normal_place** = 5 sett × 6 spørsmål
- **rich_place** = 8 sett × 7 spørsmål
- **major_place** = 10 sett × 7 spørsmål

Små og mellomstore steder kan derfor stoppe før emnesettene.

## Settstruktur i v4.3

### Set 1 — `history_intro_story`
Sterk åpning med opprinnelse, lokal historie og stedets viktigste fortelling.

### Set 2 — `local_history_buildings_events`
Bygninger, tidligere funksjoner, personer, hendelser og synlige historiske spor.

### Set 3 — `humor_curiosities_life`
Kuriositeter, humor, visual hooks og hverdagsliv.

### Set 4 — `place_facts_architecture`
Konkrete og verifiserbare spørsmål om bygninger, arkitektur, materialitet og synlige trekk.

### Set 5 — `place_concrete_advanced`
Dypere, men fortsatt stedsnære spørsmål om utvikling, institusjoner, konflikter og sammenligninger.

### Set 6 — `emne_based_foundation`
Første analytiske sett. Akademisk språk er lov, men spørsmålene må fortsatt handle om stedet.

### Set 7 — `emne_based_advanced`
Dypere analyse. Teori kan brukes som motor i bakgrunnen, men ikke som synlig «hvilken teoretiker»-quiz.

### Set 8 — `concept_based`
Begreper som faktisk hjelper spilleren å lese stedet.

### Set 9 — `deep_history_conflict`
Kun for store steder. Krig, rivning, makt, konflikt, omstridt utvikling.

### Set 10 — `synthesis_comparison`
Kun for store steder. Sammenligner og samler stedets historiske og analytiske lag uten å bli en ren teoriquiz.

## Banality guard

Hvis quiz generatoren ikke finner nok sterke spørsmål om:
- lokalhistorie
- bygninger
- personer
- hendelser
- konflikter
- synlige spor

skal den **korte ned quizen**.

Den skal ikke fylle med:
- opplagte «hva heter»-spørsmål
- isolerte årstall uten kontekst
- tekniske spørsmål uten interesse
- fagplanspråk i spørsmålsform

## Theory rule

Teori og teoretikere kan brukes i generatoren som støtte og dybdelag, men de skal som hovedregel:
- ligge i metadata
- eventuelt nevnes i `knowledge`
- ikke være selve quizspørsmålet

Spørsmålet skal fortsatt være om **stedet**.

## Praktisk tommelfingerregel

Hvis et spørsmål ikke lærer spilleren noe om:
- hva stedet var før
- hva som skjedde der
- hvem som var knyttet til det
- hvilke bygninger eller spor som betyr noe
- hvordan stedet ble slik det er

så er spørsmålet for svakt og bør byttes ut eller kuttes.
