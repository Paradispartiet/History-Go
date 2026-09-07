# Natur / Politisk myndighet — Role World rollout source-first

## Scope lock

Denne rollouten lukker bare **situated_reputation** for `natur/natur_politisk_myndighet`. Statsråd (klima og miljø) forblir **appointment_required** med `public_office_appointment` som eneste autoritative adgangsport. Eksisterende role model, 16-stegs mailplan, fire prerequisite-People, fire arbeids-/beslutningsrom, to work loops, persistent work object, waiting/handoff/rework og authority boundary gjenbrukes uten ny runtime.

## Source inventory

- role model: `data/Civication/roleModels/natur/natur_politisk_myndighet.json`
- work grammar: `data/Civication/workGrammars/natur/natur_politisk_myndighet.json`
- mail plan: `data/Civication/mailPlans/natur/natur_politisk_myndighet_plan.json`
- **15 canonical** mailkilder fordelt på alle ni mailtypene
- History Go / Natur-kunnskap brukes bare som læringsstøtte og bedre spørsmål

## Sociological design

World-bibelen gjør standing situert hos syv publikum: embetsverk/departementsledelse, fagmiljø, regjeringssamordning/politiske partnere, juridisk/parlamentarisk kontroll, offentlighet/berørte/medier, forvaltning/implementeringslinje og private relasjoner. Det finnes **no global reputation score**. Standing kan divergere: en åpen korrigering kan koste mediemomentum og samtidig styrke kontrollstanding; et lovlig politisk kompromiss kan styrke regjeringsstanding og samtidig svekke tillit hos berørte.

## Authority boundary

Standing kan aldri materialisere embete, hjemmel, budsjettvedtak, regjeringsbeslutning, Stortingets myndighet eller saksbehandlet evidens. History Go og Natur-badge kan ikke erstatte feltdata, konsekvensutredning, juridisk vurdering eller `public_office_appointment`. Politiske valg kan avvike fra faglige råd, men rådet, vesentlig usikkerhet, naturkostnad, hjemmel og korrekt beslutningseier skal stå synlig.

## Season and continuity

Sesongen er **14 days × 4 phases = 56** unike dramaturgiske beats. Hver canonical mailkilde brukes minst tre ganger. Syv fler-dagers relasjonstråder binder sammen fag–politikk, mandat/hjemmel, regjeringssamordning, Storting/kontroll, offentlighet/berørte, implementering/etterkontroll og privat rolleavgrensning. Åtte delayed consequences returnerer senere i job, relationship, reputation, economy, psyche og narrative-domener.

## Cross-role

Readiness sier `not_required_for_rollout`. Det materialiseres **no cross-role link** og ingen ny shared-work runtime. Sosiale møter med regjering, Storting og forvaltning er dramaturgiske relasjoner rundt statsrådens eksisterende work object.

## Editorial uniqueness

Role World-en er ikke en kopi av Miljøledelse, By-saksbehandler eller Controller. Den er særskilt bygget rundt statsrådsutnevnelse, demokratisk ansvar, fag–politikk-skille, regjeringssamordning, parlamentarisk kontroll, offentlig begrunnelse, natur-/fordelingskostnad og implementering.

## No new runtime

Ingen ny runtime, sceneformat, global reputation-state eller parallell work-object-struktur introduseres. Eksisterende Scene Pipeline og prerequisite-artifacts forblir authoritative.
