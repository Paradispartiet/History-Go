# Etne People of Places batch 6 — Old River Saloon

Date: 2026-07-18

## Scope

Adds three named people with direct founder, ownership or management connections to `old_river_saloon_etne`:

- `aslaug_olden_mala`
- `rune_kringlebotten`
- `amalie_kringlebotten`

## Aslaug Olden Mala

Grannar documents that Aslaug Mala opened Old River Saloon in 1999. The article describes how the old Marknadsfjosen was moved to the present Saloon site and fitted out as the venue. Earlier Grannar coverage names her as Aslaug Olden Mala in connection with booking artists at Old River Saloon.

Decision:

- include as founder/venue builder
- primary place `old_river_saloon_etne`
- category `musikk`

## Rune Kringlebotten

Grannar documents that Rune Kringlebotten bought Old River Saloon in 2024 with the explicit goal of restoring pub and live-concert activity. Later coverage continues to identify him as owner and initiator of new event concepts at the venue.

Decision:

- include as owner/reopener and event initiator
- primary place `old_river_saloon_etne`
- category `musikk`

## Amalie Kringlebotten

Grannar identifies Amalie Kringlebotten as daily manager in the new operation and documents her together with the owner in the development of new events. Current company-role information also identifies her as daily manager.

Decision:

- include as direct operational manager of the venue
- primary place `old_river_saloon_etne`
- category `musikk`

## Duplicate gate

Current `main` was searched before creation for IDs and name variants:

- `aslaug_olden_mala`
- `aslaug_mala`
- `rune_kringlebotten`
- `amalie_kringlebotten`
- exact full names

No existing canonical people records were found.

## Sources

1. Grannar — Ny eigar skal puste nytt liv i Saloonen
   - https://www.grannar.no/nyhende/ny-eigar-skal-puste-nytt-liv-i-saloonen/297799
2. Grannar — Lothepus-feber i Etne
   - https://grannar.no/2017/02/sikra-rikskjendis/
3. Grannar — No får Etne sin eigen festival
   - https://www.grannar.no/nyhende/no-far-etne-sin-eigen-festival-me-satsar-mykje/276804
4. Brønnøysundregistrene — OLD RIVER SALOON AS
   - https://virksomhet.brreg.no/nb/oppslag/enheter/824330522

## Validation plan

- register the batch exactly once in `data/people/manifest.json`
- run full people checks and People of Places audit
- verify all three IDs occur exactly once globally
- verify `old_river_saloon_etne` is active
- verify each candidate has one primary and one `places` link to the venue
- remove temporary integration workflow before merge
