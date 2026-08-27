# Civication Role World rollout — Næringsliv Finansanalytiker

Status: Materialisert på kontrollert rollout-branch; completion gjelder først etter fail-closed generatorer, streng rolleport, full Civication-suite, exact-head CI og post-merge-verifisering.

## Scope

- Lukker bare de dokumenterte authored debt-punktene `rhythm_waiting_handoff_rework` og `situated_reputation`.
- Gjenbruker eksisterende ni mailtyper og eksisterende sterke finansscener; bare fem nye scener materialiseres der vedvarende caseflyt faktisk manglet.
- Ett arbeidsobjekt følger analyse fra baseline gjennom Theo-handoff, waiting, markedsdrevet rework, komitehandoff og beslutningsetterspill.
- Audience-spesifikk standing skilles mellom Elin, Theo og investeringskomiteen. Standing påvirker tillit og tolkning, aldri formell investeringsmyndighet.
- Work grammar beholdes uendret: Finansanalytiker kan analysere og anbefale, men kan ikke godkjenne investering, flytte kapital eller overstyre beslutningsorgan.
- Ingen ny runtime eller parallell scenemotor.

## Materialisering

- 14 dager × 4 faser = 56 dramaturgiske beats.
- 5 nye rolle-spesifikke scener: case-open, senior-handoff/waiting, market-rework, committee-waiting og committee-aftermath.
- Eksisterende story, knowledge, micro og conflict-scener brukes som provenance i sesonggridet.
- Mailplan utvides fra 8 til 13 steg uten å skrive om den eksisterende faglige buen.
- Fail-closed materialization run `33105152353` passerte generatorene, den fokuserte Finansanalytiker-/Role World-porten og hele `test:civication` før TEMP-flatene ble fjernet og den verifiserte permanente diffen ble pushet.

## Kvalitetsgrense

Rollouten skal feile lukket hvis persistent work object, waiting/handoff/rework, audience-spesifikk standing, myndighetsgrense, provenance, compiled registry, Career Gameplay Matrix eller readiness ikke kan bevises samlet.
