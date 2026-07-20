# Det Norske Teatret People of Places — clean reconstruction of batches 11–15

Generated: 2026-07-20

## Purpose

Rebuild the useful content from the stale Det Norske Teatret people batch 11–15 stack against the current canonical people structure without reintroducing old stacked batch files or duplicate person IDs.

## Audit result

The original five batches contained 25 candidates.

- 18 candidates did not have an existing canonical person record on the audited `main` state and are added as dedicated one-person files under `data/people/musikk/oslo/det_norske_teatret/`.
- 7 candidates already existed as canonical people elsewhere in the people tree. Their existing primary anchors are preserved and `det_norske_teatret` is added as a documented secondary place relation instead of creating duplicates.

## New canonical people files

- `rut_tellefsen`
- `tom_tellefsen`
- `bjarne_andersen`
- `elsa_lystad`
- `reidar_sorensen`
- `rolf_just_nilsen`
- `per_jansen`
- `merete_skavlan`
- `ola_b_johannessen`
- `astrid_folstad`
- `bjorn_sundquist`
- `iren_reppen`
- `vidar_magnussen`
- `ulrikke_hansen_dovigen`
- `pia_tjelta`
- `ingrid_bolso_berdal`
- `jannike_kruse`
- `lena_kristin_ellingsen`

## Existing canonical people updated without duplication

- `per_sunderland` — primary anchor remains `nationaltheatret`; DNT relation added.
- `lise_fjeldstad` — primary anchor remains `nationaltheatret`; DNT relation added.
- `bab_christensen` — primary anchor remains `nationaltheatret`; DNT relation added.
- `nils_ole_oftebro` — primary anchor remains `nationaltheatret`; DNT relation added.
- `jan_gronli` — primary anchor remains `nationaltheatret`; DNT relation added.
- `ole_jorgen_nilsen` — primary anchor remains `nationaltheatret`; DNT relation added.
- `jon_eikemo` — primary anchor remains `edderkoppen_scene`; DNT relation added.

## Manifest

`data/people/manifest.json` receives exactly 18 new paths, one for each newly created canonical person file.

## Scope audit

A GitHub compare against the then-current `main` showed exactly the intended data scope before this report was added:

- 18 added single-person DNT files
- 7 modified existing canonical people files
- 1 modified people manifest
- manifest diff: 18 additions, 0 deletions
- no place, place-index, quiz, UI, runtime or Civication files changed

The branch was behind newer unrelated `main` commits from the coordinate work, but the repository compare showed no inherited or unrelated file changes. The people manifest blob on current `main` was also unchanged from the branch base, so the scoped diff remains safe to review and squash onto current `main`.

## Validation note

This work was performed through the GitHub connector without a local executable checkout, so repository-local commands such as `npm run audit:people-of-places` and `npm run tools:check` are not falsely reported as run. JSON files were written through GitHub's contents API, and the final PR should use repository CI for executable validation.
