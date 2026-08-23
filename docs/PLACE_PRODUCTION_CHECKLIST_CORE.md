# History GO — Place Production Checklist Core

Status: **compatibility pointer**  
Eier: `place_by_place_production_workflow`

Den canonical arbeidsflyten og mergekadensen ligger nå i:

- **`docs/PLACE_PRODUCTION_CHECKLIST.md`** — Place Production Checklist v2.

Den komplette detaljerte sjekklisten som tidligere lå både her og i hovedfilen er bevart byte-for-byte i:

- **`docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`**.

## Bindende regel

Alle faglige, faktuelle, redaksjonelle, UI-, source-, subsystem- og slutt-QA-krav i v1-referansen består. Det som er erstattet av v2 er bare prosessoverheaden rundt GitHub:

- én fase trenger ikke én separat PR;
- et audit-only checkpoint som konkluderer `ALLEREDE FERDIG`, `BEHOLD` eller `BEGRUNNET N/A` trenger normalt ingen egen merge;
- flere sekvensielt reviewede checkpoints kan leve på samme fokuserte arbeidsgren;
- mergegrenser skal følge reell risiko, ikke faseantall;
- branch-status og live-status skal fortsatt rapporteres eksplisitt, og ingen checkpoint kan omtales som publisert før den faktisk er merget/live.

Bruk `PLACE_PRODUCTION_CHECKLIST.md` for arbeidsmåten og `PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md` for den uttømmende detaljrutingen. Denne filen skal ikke lenger vedlikeholde en tredje kopi av sjekklisten.
