# Place Data Invalid Reference Fix

Dato: 2026-04-30

## Oppsummering

Denne endringen retter de 2 ugyldige place-referansene som ble introdusert etter PR #128, uten å endre assets, UI/runtime eller place-felter utover ren referanseintegritet.

## Funnet i audit

Basert på `node tools/audit-place-data.mjs` og `reports/place-data-audit.md`:

1. `data/Civication/place_contexts.json`
   - felt: `contexts[5].matches_place_ids`
   - gammel verdi (ugyldig referanse): `frognerbadet`
   - ny verdi: **fjernet fra listen**

2. `data/Civication/place_contexts.json`
   - felt: `contexts[7].matches_place_ids`
   - gammel verdi (ugyldig referanse): `torshovparken`
   - ny verdi: **fjernet fra listen**

## Hvorfor rettingen er trygg

- Begge id-ene (`frognerbadet`, `torshovparken`) finnes ikke i aktivt place-univers fra `data/places/manifest.json`.
- Det finnes ingen 100 % sikker aktiv erstatnings-id for disse i manifesterte place-filer.
- Å fjerne kun de ugyldige elementene fra `matches_place_ids` er den minste mulige integritetsfiksen som:
  - stopper dangling references,
  - unngår gjetting på semantisk erstatning,
  - og bevarer resten av kontekstdatastrukturen uendret.

## Verifisering etter retting

Kjøring etter endring:

- `node tools/audit-place-data.mjs`

Resultat i `reports/place-data-audit.md`:

- Globale ugyldige place-referanser: **2 -> 0**
- Ødelagte asset paths: **117 (uendret)**

## Bekreftelser

- Globale ugyldige place-referanser er nå **0**.
- Ingen asset paths ble endret i denne fiksen.
- Ingen `image`/`cardImage`-verdier ble endret.
- Ingen JS/CSS/HTML/UI/runtime/Wonderkammer-filer ble endret.
