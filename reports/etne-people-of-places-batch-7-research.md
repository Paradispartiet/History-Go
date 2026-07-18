# Etne People of Places batch 7 — Fugl Fønix

Date: 2026-07-18

## Scope

Adds five new canonical people and extends one existing canonical person with a documented Fugl Fønix place link.

New people:

- `audun_stene`
- `jan_terje_rafdal`
- `vidar_lund`
- `asbjorn_moe`
- `carina_vevang`

Existing person updated in place:

- `stig_morten_sorheim` → add `fugl_fonix_etne`

## Physical and historical gate

Stavanger Aftenbladet's 2003 feature documents the concrete early team operating Fugl Fønix in Etne. The article identifies Audun Stene and Jan Terje Rafdal as the originators of the café project, Vidar Lund as part of the expansion and hotel takeover, Carina Vevang as kitchen manager/co-owner, Asbjørn Moe as administrator and daily hotel leader, and Stig Morten Sørheim as the sound engineer who joined the six-person core.

The same article describes Fugl Fønix as a physical combination of hotel, café, gallery, concert venue and meeting place. Bergens Tidende likewise documents the core group and names Audun Stene and Jan Terje Rafdal as the original seed behind the project.

This is therefore a direct work/founder connection to the canonical place `fugl_fonix_etne`, not a general association with Etne culture.

## Duplicate gate

Current `main` was searched before creation for:

- `audun_stene`
- `jan_terje_rafdal`
- `vidar_lund`
- `asbjorn_moe`
- `carina_vevang`
- exact name variants

No existing canonical people records were found for the five new candidates.

`stig_morten_sorheim` already exists canonically in:

- `data/people/musikk/vestland/etne/abc_studio/stig_morten_sorheim.json`

Decision:

- do not create a duplicate Stig Morten Sørheim
- preserve primary `placeId: abc_studio_etne`
- add `fugl_fonix_etne` exactly once to `places`
- expand the existing description/source basis to include the documented early Fugl Fønix role

## Category decision

The five new records use category `kunst` because their inclusion is specifically grounded in the creation and operation of Fugl Fønix as a cultural venue and creative meeting place, not simply in generic hotel ownership.

Stig Morten Sørheim remains category `musikk`; only his additional physical Fugl Fønix link is added.

## Sources

1. Stavanger Aftenblad — Friends i Etne
   - https://www.aftenbladet.no/lokalt/i/ymB4a/friends-i-etne
2. Bergens Tidende — Norges hippeste hotell
   - https://www.bt.no/kultur/i/oKn1W/norges-hippeste-hotell
3. Fugl Fønix — official site
   - https://www.fuglfonix.com/
4. Fjord Norway — Fugl Fønix i Etne: et 25 år langt bidrag til ei levende bygd
   - https://www.fjordnorway.com/no/reiseinspirasjon/fugl-fonix-i-etne-et-25-ar-langt-bidrag-til-ei-levende-bygd--

## Validation plan

- register the new Fugl Fønix people batch exactly once in `data/people/manifest.json`
- patch the existing Stig Morten Sørheim record in place
- preserve `abc_studio_etne` as Stig's primary place
- add `fugl_fonix_etne` exactly once to Stig's `places`
- run full people checks and People of Places audit
- verify all five new IDs and Stig each occur exactly once globally
- verify both target places are active
- remove temporary workflow before merge
