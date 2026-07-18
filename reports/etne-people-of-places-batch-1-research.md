# Etne People of Places batch 1 — research and duplicate gate

Date: 2026-07-18

## Scope

This batch is deliberately small and contains only person-place links with explicit physical documentation:

1. New canonical person: `ivar_aasen` → `skanevik_gjestgjevargarden`
2. Existing canonical person update: `erling_skakke` → add `stodle_kyrkje`

`magnus_erlingsson` is deliberately not updated in this batch because the available Stødle source presents his baptism in the church as an assumption rather than directly documented physical presence.

## Audit before creation

Current `main` was searched for:

- `ivar_aasen`
- `Ivar Aasen`
- `erling_skakke`
- `Erling Skakke`
- `magnus_erlingsson`
- `Magnus Erlingsson`

Findings:

- No canonical people record for Ivar Aasen was found.
- `erling_skakke` already exists in `data/people/historie/norge/people_historie_norge_for_1500_to_add_47.json`; no duplicate is created.
- `magnus_erlingsson` already exists in the same aggregate file; no duplicate is created and no Stødle link is added without stronger physical documentation.

The existing six Etne history people batches on `main` were also audited before selecting candidates. They mainly contain collective archaeology, church-community and historical-environment anchors plus the named Grindheim runestone figures; neither Ivar Aasen nor a dedicated Stødle link on the existing Erling Skakke record is duplicated there.

## Ivar Aasen ↔ Skånevik Gjestgjevargard

Kringom documents that Ivar Aasen lodged at the guesthouse of Nils Nilsen Sjøe in Skånevik in 1844 while carrying out dialect studies in Sunnhordland.

This is a direct physical stay at the canonical place `skanevik_gjestgjevargarden`, not a generic association with Skånevik, Sunnhordland or nynorsk history.

Decision:

- create new canonical person ID `ivar_aasen`
- category: `litteratur`
- primary `placeId`: `skanevik_gjestgjevargarden`
- `places`: only `skanevik_gjestgjevargarden` in this batch

Primary source:

- Kringom — Skånevik, handelsstaden
- https://www.kringom.no/nb/sunnhordland/etne/skanevik-handelsstaden

## Erling Skakke ↔ Stødle kyrkje

`erling_skakke` already exists and currently points to `kalvskinnet_slagsted` and `kristkirken_bergenhus`.

The Stødle connection is strong enough for an additional `places` link:

- Store norske leksikon documents that Erling had his seat at Stødle in Etne.
- Kringom states that the medieval stone church was probably built as the Stødle clan's private chapel and that it is likely Erling Skakke built it.
- Store norske leksikon's Etne overview states more directly that Stødle church was begun by Erling Skakke around 1160.

Decision:

- do not create a second Erling Skakke record
- preserve existing primary `placeId: kalvskinnet_slagsted`
- append `stodle_kyrkje` exactly once to `places`
- add `stodle_kyrkje: active_verified_place` to `placeIdStatus`
- leave existing historical connections intact

Sources:

- https://snl.no/Erling_Skakke
- https://snl.no/Etne
- https://www.kringom.no/nb/stole-kyrkje

## Magnus Erlingsson — deferred Stødle link

Kringom describes Magnus as the young boy from Etne and says one must assume that he was baptized in the private church at Stødle. Because this is explicitly framed as an assumption, the batch does not add `stodle_kyrkje` to the existing `magnus_erlingsson` record.

This follows the project rule that People of Places links should be based on explicit documented physical connection rather than general historical association.

## Integration plan

- register `people/litteratur/vestland/etne/ivar_aasen.json` exactly once in `data/people/manifest.json`
- modify the existing `erling_skakke` object programmatically in its canonical aggregate file
- preserve its existing primary place and all current places
- append `stodle_kyrkje` only if absent
- run the full people validation/audit track
- verify `ivar_aasen` and `erling_skakke` each have exactly one canonical people ID in the active manifest
- verify both new Etne place references are valid
