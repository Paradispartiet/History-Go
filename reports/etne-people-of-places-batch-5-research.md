# Etne People of Places batch 5 — forskningsplattformen i Etneelva

Date: 2026-07-18

## Scope

Adds two named people with explicit physical work connections to `etneelva_forskningsplattform`:

- `per_tommy_fjeldheim`
- `oystein_skaala`

## Per Tommy Fjeldheim

Havforskningsinstituttet identifies Per Tommy Fjeldheim as research technician/senior engineer and operations manager for the Fjord- and River Laboratory in Etne. HI quotes him from "the station here" and repeatedly connects him to the trap, fish registration and interpretation of the Etne time series.

Decision:

- include with `etneelva_forskningsplattform` as primary place
- category `vitenskap`
- physical basis: direct operations responsibility and documented work at the field station

## Øystein Skaala

Havforskningsinstituttet identifies Øystein Skaala as project leader in coverage of the Etne field platform and documents his role in trap upgrades, the photo tunnel and machine-learning work. HI also publishes imagery credited to him from fish moving through the trap.

Decision:

- include with `etneelva_forskningsplattform` as primary place
- category `vitenskap`
- physical basis: documented project/infrastructure work tied directly to the trap and field platform

## Deferred candidates

Current report authors such as Alison Harvey, Kaja Christine Andersen and Kevin Glover are not included solely from authorship. Authorship, contact responsibility or analysis of Etne data is not treated as sufficient proof of physical presence at the canonical field platform.

## Duplicate gate

Current `main` was searched for:

- `per_tommy_fjeldheim`
- `oystein_skaala`

No existing canonical people records were found.

## Sources

### Per Tommy Fjeldheim

- https://www.hi.no/hi/nyheter/2025/april/ei-froken-kom-forst-heim-sja-kven-som-folgjer-etter
- https://www.hi.no/hi/nyheter/2024/august/etneelva-den-storste-og-eldste-laksen-er-vekke-i-ar
- https://www.hi.no/hi/nyheter/2024/juli/etneelva-lakseinnsiget-minner-om-krisearet-2014-sa-langt

### Øystein Skaala

- https://www.hi.no/hi/nyheter/2024/april/direkte-fra-etneelva
- https://www.hi.no/hi/nyheter/2020/april/ferre-romlingar-i-laksefella-i-etneelva
- https://www.hi.no/hi/om-oss/ansatte/oystein-skaala

## Validation plan

- register the batch source exactly once in `data/people/manifest.json`
- run full people checks and People of Places audit
- verify both IDs occur exactly once globally
- verify `etneelva_forskningsplattform` is active
- verify both records contain exactly one matching place link
- remove temporary workflow before merge
