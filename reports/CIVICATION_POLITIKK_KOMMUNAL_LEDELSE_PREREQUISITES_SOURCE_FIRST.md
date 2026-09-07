# Politikk / Kommunal ledelse — prerequisite source-first

## Scope

Denne pakken materialiserer det spillbare prerequisite-laget for `politikk_kommunal_ledelse` uten å materialisere Role World-status. Den eksisterende rollemodellen og work grammarens kjernebegrenser beholdes, men utvides med første dag, fire fiktive scenarioaktører, fire kommunale arbeidsflater, persistent work object, rytme/venting/rework, knowledge boundary, 15 rolle-spesifikke mails og 16-stegs plan.

## Autoritetsgrense

- Ordfører er `appointment_required` med `election_or_mandate`.
- Politikk-badge og terskel 85 er læringsprogresjon, ikke valgresultat eller konstituering.
- Møteledelse kan ikke sette kollegiale vedtak til side.
- Politisk ledelse kan ikke omskrive administrativ faglighet eller oppheve habilitet, delegasjon eller hjemmel.
- Kommunale kanaler og ressurser er ikke partiets private ressurser.
- History Go gir kontekst, ikke saksutredning, mandat eller vedtak.

## Playable loop

Sak → administrativt grunnlag → habilitet/hjemmel → politisk behandling → møte/votering → protokollert vedtak → offentlig forklaring → implementering → etterkontroll/rework.

## Materialisering

- 4 scenarioaktører
- 4 arbeidsflater
- 23 work-object states
- 7 waiting states
- 9 mailtyper / 15 mails
- 16 plansteg
- no generic fallback

Role World forblir separat og skal først materialiseres etter at prerequisite-pakken er grønn og merget.
