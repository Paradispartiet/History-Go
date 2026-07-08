# HG Football Manager — Club Operations Pass v1

Denne flaten gjør managerrollen tydeligere som klubbdrift, ikke bare laguttak.

## Hva klubbdrift består av nå

- **Managerkontor:** samler signaler fra assistent, styre, fysio, speider, neste kamp og neste beslutning.
- **Stab:** viser assistenttrener, tre trenere, fysio og keepertrener som personer med navn, rolle, klubbtilknytning og råd.
- **Klubb:** samler styret, fasiliteter, administrasjon/marked, speiding/rekruttering og klubbidentitet.
- **Navigasjon:** toppnivået er Kontor, Lag, Taktikk, Kampdag, Stab og Klubb. Klubb har underflater for Styret, Fasiliteter, Administrasjon, Speiding og Identitet.

## Hva som er ekte data

- Flaten er laget for å lese eksisterende History Go-kontekst: steder, personer, institusjoner, badges, relasjoner og unlocks.
- Speiding/rekruttering beskrives eksplisitt som History Go-unlocks: spillere, klubbtilknyttede personer, steder og mulige staff-unlocks.
- Låst eller manglende innhold forklares som `Ikke funnet i History Go ennå`, ikke som teknisk datamangel.

## Hva som er forenklet v0.1

- Fasiliteter er atmosfære, forklaring og framtidig krok: `Forenklet i v0.1` og påvirker foreløpig råd/copy, ikke kampmotor direkte.
- Styret, supporterstemning og administrasjon er enkle manager-signaler, ikke en økonomimodell.
- Assistentens kampanalyse er enkel post-match copy og kobles ikke til en ny matchmotor.

## Bevisst ikke bygget ennå

- Ingen tung økonomimotor.
- Ingen transfermarked eller parallell rekrutteringsflyt utenom History Go-unlocks.
- Ingen ny tactics-/match-motor.
- Ingen endring i History Go unlock-dataflyt.
