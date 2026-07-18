# Etne People of Places batch 3 — House of Blues

Date: 2026-07-18

## Scope

Adds five named people with direct, documented physical or operational connections to `house_of_blues_skanevik`:

- `alf_warloe_christophersen`
- `frode_ronli`
- `anders_bru`
- `oystein_eldoy`
- `knut_konigsberg`

## Alf Warloe Christophersen

Bergens Tidende documents Alf Warloe Christophersen as the festival director who started Skånevik Bluesfestival in 1997. Etne municipality lists him as contact for the combined organization entry `Skånevik Bluesfestival/House of Blues`. Company records also identify him in the leadership of House of Blues AS.

Decision:

- include as a direct organizer/operator anchor for the permanent House of Blues venue
- category `musikk`
- primary place `house_of_blues_skanevik`

## Stavangerensemblet members

Skånevik Bluesfestival's own historical artist pages explicitly state that Stavangerensemblet repeatedly performed major shows at House of Blues. The same official source identifies the relevant lineup:

- Frode Rønli — vocals
- Anders Bru — guitar/vocals
- Øystein Eldøy — bass/vocals
- Knut Kønigsberg — drums

These are explicit physical performance links to the canonical venue, not generic festival appearances.

Decision:

- add the four named musicians with `house_of_blues_skanevik` as primary and only place in this batch
- do not add every artist who has appeared at the wider festival
- use only artists with source text explicitly tying their performance history to House of Blues

## Duplicate gate

Current `main` was searched before creation for:

- `alf_warloe_christophersen`
- `frode_ronli`
- `anders_bru`
- `oystein_eldoy`
- `knut_konigsberg`

No existing canonical people records were found for the five candidates.

## Sources

1. Bergens Tidende — Blues gir håp i Skånevik
   - https://www.bt.no/kultur/i/lK6W9/blues-gir-haap-i-skaanevik
2. Etne kommune — Skånevik Bluesfestival/House of Blues
   - https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=12
3. Brønnøysundregistrene — HOUSE OF BLUES AS
   - https://virksomhet.brreg.no/nb/oppslag/enheter/991458395
4. Skånevik Bluesfestival — Artistar 2012
   - https://www.skaanevik-blues.com/historie/artistar-2012/
5. Skånevik Bluesfestival — Artistar 2009
   - https://www.skaanevik-blues.com/historie/artistar-2009/

## Validation plan

- register the single batch file exactly once in `data/people/manifest.json`
- run full people checks and People of Places gate
- verify all five IDs occur exactly once globally
- verify `house_of_blues_skanevik` is active
- verify each candidate has one primary and one `places` link to House of Blues
- remove temporary workflow before merge
