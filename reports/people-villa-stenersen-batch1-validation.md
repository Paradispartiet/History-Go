# Villa Stenersen people batch 1 validation

Dato: 2026-07-20

## Eksisterende dekning før batchen

- Ingen eksisterende people-ankere funnet ved materialisering.

## Canonical audit og handlinger

- `arne_korsmo` — **updated_existing** — `data/people/by/oslo/people_by_oslo.json`
- `rolf_stenersen` — **updated_existing** — `data/people/filantroper/oslo/people_filantroper_oslo.json`

## Streng stedsgate

- Arne Korsmo: dokumentert arkitekt for selve Villa Stenersen.
- Rolf Stenersen: dokumentert oppdragsgiver, eier og kunstsamler; huset ble tegnet for ham og familien.

Begge koblingene gjelder selve huset. Odvar Nordlis korte botid er bevisst ikke tatt inn i denne kjernebatches første pass.

## Kilder

- Riksantikvaren: fredningen av Villa Stenersen.
- Nasjonalmuseet: Villa Stenersen-tegninger med Arne Korsmo som arkitekt og Rolf Stenersen som oppdragsgiver.

## Runtime-gater

Materializeren stopper ved tvetydig canonical match. Nye personer opprettes bare når ingen canonical match finnes; ellers oppdateres eksisterende person. Etter materialisering regenereres Civication history people index og repoets ordinære People- og Places-gater skal passere.
