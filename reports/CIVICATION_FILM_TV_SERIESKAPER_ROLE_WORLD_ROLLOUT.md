# Civication Role World rollout — Film/TV Serieskaper

Status: Materialisert som kontrollert Role World med eksisterende Scene Pipeline. Completion gjelder først etter streng rolleport, full Civication-suite, exact-head CI og post-merge-verifisering.

## Scope

- Canonical readiness krevde `rhythm_waiting_handoff_rework` og `situated_reputation`.
- Eksisterende 9/9 mailtyper og eksakt 9-trinns mailplan beholdes uten nye mails eller plansteg.
- Samme sesongrygg, noteskonflikt, rollefravær, locationbortfall, seriebibel, Arne Skouen-kildeoppgave, oppfølging og finalegjeld får en 14-dagers sammenhengende arbeidsverden.
- Standing er audience-spesifikk: executive, writers room og produksjon kan huske samme handling forskjellig. Standing gir aldri formell bestiller-, budsjett-, sikkerhets-, rettighets- eller krediteringsmyndighet.
- Ingen ny runtime eller parallell scenemotor introduseres.

## Materialisering

- 14 dager × 4 faser = 56 dramaturgiske beats.
- 0 nye mail-scener; alle beats peker til de ni eksisterende canonical Serieskaper-mails.
- 5 primære tråder, 5 recurring people-archetypes, 8 slow axes, 5 private aftermath og 6 delayed consequences.
- Waiting er legitim når beslutningseier mangler; handoff må angi versjon/eier/mottaker/avhengighet; rework må bevare historisk beslutningsspor.

## Fail-closed verification

- Serieskaper-materialisering og canonical generatorer passerte samlet i TEMP-run #3.
- Den strenge Serieskaper-porten, eksisterende Serieskaper-playability, progresjonssikker Programleder-port og generiske Role World-policyporter passerte før fullsuite.
- Hele `test:civication` passerte før TEMP-materializer og TEMP-workflow ble fjernet og den permanente canonical committen ble skrevet.
- Dokumentasjonscommitten endrer ikke generator-output; den brukes bare til å få ordinær exact-head PR-CI kjørt av repo-eieren før merge.

## Kvalitetsgrense

Rollouten skal feile lukket hvis provenance, eksakt mailplan, readiness-gjeld, audience-spesifikk standing, handoff/rework, authority boundaries, History Go-kildegrense, compiled registry, Career Gameplay Matrix eller full Civication-suite ikke kan bevises samlet.
