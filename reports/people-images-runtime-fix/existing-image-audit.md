# Existing people image audit findings

## Duplicate/colliding local image path

The single duplicate/collision is `bilder/kort/people/filantrop_placeholder.svg` in `data/people/filantroper/oslo/people_filantroper_oslo.json`.

It is shared by these entries: `carl_deichman`, `alfred_nobel`, `hans_rasmus_astrup`, `christian_ringnes`, `rolf_stenersen`, `niels_onstad`, `institusjonen_fritt_ord`, `sparebankstiftelsen_dnb`, `eckbos_legat`, `olav_thon`, `fred_kavli`, `anders_jahre`, `jens_henrik_nordlie`, `jens_christian_hauge`, `finn_skedsmo`, `kavlifondet`, and `gjensidigestiftelsen`.

This appears to be an intentional shared placeholder, but the audit correctly counts it as one colliding image path because multiple people/entities point to the same local image.

## Missing local images

The audit found 299 people entries with non-URL `image` paths that do not exist on disk. The first missing paths include `bilder/kort/people/carl_berner.PNG`, `bilder/kort/people/christian_heinrich_grosch.PNG`, `bilder/kort/people/harald_hals.PNG`, and many other `.PNG` paths.

This is not an audit-script counting bug: each missing count corresponds to an `image` field whose target file is absent from the repository at the referenced path. The pattern suggests stale/missing assets or historical paths, not primarily case-only mismatches. This PR does not mass-migrate or recreate the 299 assets.
