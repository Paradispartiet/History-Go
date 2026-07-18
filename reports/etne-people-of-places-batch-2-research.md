# Etne People of Places batch 2 — ABC Studio

Date: 2026-07-18

## Scope

Adds five named people with direct documented work/founder connections to the physical `abc_studio_etne` place:

- `nils_osmund_halleland`
- `stig_morten_sorheim`
- `reinhardt_toresen`
- `knut_bjarne_bjorkhaug`
- `kjetil_ulland`

All five use `abc_studio_etne` as their primary and only place in this batch.

## Physical connection gate

Medvind24 documents the origin of the ABC Studio environment: Stig Morten Sørheim and Nils Halleland moved back to Etne and joined forces with Reinhardt Toresen, Knut Bjarne Bjørkhaug and Kjetil Ulland from the Lydloftet environment. The article states that this resulted in ABC Studio.

The same source documents the continued professional sound-engineering environment and identifies Nils Halleland as daily manager. Grannar later documents the group physically at the studio in Enge gamle skule, including Kjetil Ulland at the mixing desk and Stig Morten Sørheim in a management role.

Brønnøysundregistrene confirms ABC STUDIO AS at Enge gamle skule, Etne, with business activity in production and publishing of music and sound recordings and Nils Osmund Halleland as current daily manager.

These are therefore direct place/work connections, not generic associations with Etne music life.

## Duplicate gate

Current `main` was searched before creation for exact and normalized candidate IDs/names:

- `stig_morten_sorheim`
- `nils_halleland` / `nils_osmund_halleland`
- `reinhardt_toresen`
- `knut_bjarne_bjorkhaug`
- `kjetil_ulland`

No existing canonical people records were found for the five candidates.

## Canonical decision

Category: `musikk`

Primary place for all five:

- `abc_studio_etne`

The records focus on sound engineering, studio production and the concrete professional audio environment. They do not treat corporate board membership alone as sufficient place evidence; the inclusion is grounded in the documented studio-building and work history.

## Sources

1. Medvind24 — Lydstudio opp av oska
   - https://medvind24.no/aktuelt/lydstudio-opp-av-oska
2. Grannar — Herrar i eige hus
   - https://www.grannar.no/nyhende/herrar-i-eige-hus/149157
3. Brønnøysundregistrene — ABC STUDIO AS
   - https://virksomhet.brreg.no/nb/oppslag/enheter/945883472

## Validation plan

- register all five source paths exactly once in `data/people/manifest.json`
- run `scripts/check-people.sh`
- run the People of Places audit gate
- verify all five canonical IDs occur exactly once globally
- verify `abc_studio_etne` is an active place
- verify each new person has `placeId: abc_studio_etne` and exactly one matching `places` link
- remove temporary integration workflow before merge
