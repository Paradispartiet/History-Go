# Villa Stenersen people batch 1 validation

Dato: 2026-07-20

## Eksisterende dekning før batchen

- Ingen eksisterende people-ankere for `villa_stenersen` ble funnet ved materialisering.

## Canonical audit og faktiske handlinger

- `arne_korsmo` — **updated_existing** — `data/people/by/oslo/people_by_oslo.json`
- `rolf_stenersen` — **updated_existing** — `data/people/filantroper/oslo/people_filantroper_oslo.json`

Ingen nye personfiler eller manifestendringer var nødvendige. Arne Korsmo beholder `vigelandsparken` som primæranker. Rolf Stenersen beholder `tjuvholmen` som primæranker. `villa_stenersen` er lagt til som dokumentert sekundærrelasjon hos begge.

## Streng stedsgate

- Arne Korsmo: dokumentert arkitekt for selve Villa Stenersen.
- Rolf Stenersen: dokumentert oppdragsgiver, eier og kunstsamler; huset ble tegnet for ham og familien.

Begge koblingene gjelder selve huset. Odvar Nordlis korte botid er bevisst ikke tatt inn i denne kjernebatches første pass.

## Kilder

- Riksantikvaren: fredningen av Villa Stenersen.
- Nasjonalmuseet: Villa Stenersen-tegninger med Arne Korsmo som arkitekt og Rolf Stenersen som oppdragsgiver.

## Materialisering og validering

Materializeren:

- fant ingen eksisterende people-ankere for stedet
- fant entydig canonical gjenbruk for Korsmo og Stenersen
- opprettet ingen duplikatpersoner
- krevde ingen manifestendring
- regenererte Civication history people index uten nødvendig slutt-diff
- kjørte `bash scripts/check-people.sh` med success
- kjørte `git diff --check`
- fjernet one-shot-scriptet og gjenopprettet ordinær `data-checks.yml` før publisering

Den publiserte data-headen skal i tillegg passere ordinær GitHub Actions `People data` og `Places data` før merge.
