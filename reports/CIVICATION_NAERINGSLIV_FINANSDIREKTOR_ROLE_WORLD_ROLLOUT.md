# Civication Role World rollout — Næringsliv Finansdirektør

Status: Materialisert på kontrollert rollout-branch; completion gjelder først etter fail-closed generatorer, streng rolleport, full Civication-suite, exact-head CI og post-merge-verifisering.

## Scope

- Lukker bare de dokumenterte authored debt-punktene `rhythm_waiting_handoff_rework` og `situated_reputation`.
- Gjenbruker eksisterende ni mailtyper og det etablerte refinansierings-/covenantsporet; bare fem nye scener materialiseres der vedvarende caseflyt faktisk manglet.
- Ett arbeidsobjekt følger kapitalbehov fra baseline via bank-handoff, waiting, rente-/covenantdrevet rework, styrehandoff og beslutningsetterspill.
- Audience-spesifikk standing skilles mellom Nora, bankkontakten, styret og eierperspektivet. Standing påvirker tillit og tolkning, aldri bindende fullmakt.
- Work grammar beholdes uendret: Finansdirektør kan analysere, forhandle og anbefale, men kan ikke signere eller love finansiering eller andre kapitalforpliktelser uten nødvendig mandat.
- Ingen ny runtime eller parallell scene-/reputation-/work engine.

## Materialisering

- 14 dager × 4 faser = 56 dramaturgiske beats.
- 5 nye rolle-spesifikke scener: case-open, bank-handoff/waiting, rente-/covenant-rework, styre-waiting og styre-aftermath.
- Eksisterende story, knowledge, micro og conflict-scener brukes som provenance i sesonggridet.
- Mailplan utvides fra 8 til 13 steg uten å skrive om den eksisterende faglige buen.

## Kvalitetsgrense

Rollouten skal feile lukket hvis persistent work object, waiting/handoff/rework, audience-spesifikk standing, fullmaktsgrense, provenance, compiled registry, Career Gameplay Matrix eller readiness ikke kan bevises samlet.

Verified fail-closed materialization gate: GitHub Actions run `33114586061` completed successfully before TEMP cleanup and permanent commit.
