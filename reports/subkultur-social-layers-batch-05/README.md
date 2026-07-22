# Subkultur – sosiale og historiske lag batch 05

Dato: 2026-07-22

## Oppdatert uten nye markører

- `slottsparken` – beholder category `by`, får `secondaryBadgeIds: ["subkultur"]` og et dokumentert historisk lag om den åpne russcenen fra 1966 og Nissebergets senere fortrengningshistorie.
- `vaterlandsparken` – beholder category `by`, får `secondaryBadgeIds: ["subkultur"]` og et dokumentert nåtidslag om rus-/ungdomsmiljø, oppsøkende sosialt arbeid og retten til offentlig byrom.

## Canonical regel

Ingen nye place-ID-er opprettes. Begge fysiske steder finnes allerede som verified canonical parksteder, og Subkultur legges derfor som sekundært fag- og innholdslag. Koordinater, coordinate source contract og fysisk place-identitet endres ikke.

## Kilder

Slottsparken-laget bygger på NOU 2019: 26 og NRKs arkiverte dokumentaromtale av fortrengningshistorien fra Nisseberget videre gjennom sentrum. Vaterlandsparken-laget bygger på Oslo kommunes dokumentasjon av åpne rusmiljøer og Uteseksjonens forsterkede innsats for unge tilknyttet Vaterlandsmiljøet.

## Endelig QA

Sluttsettet er regenerert på fersk `main` og passerer split-manifest-sync, global place-index-kontroll, canonical emne-kontroll og strict-new koordinat-intake. `health:places` er lagret som ikke-blokkerende repo-rapport fordi den inneholder kjent global backlog utenfor denne batchen.