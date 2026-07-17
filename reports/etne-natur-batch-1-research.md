# Etne nature batch 1 — research and scope

## Scope

This batch starts the northward Rogaland/Haugalandet coverage around Etne with five nature places. Etne municipality is administratively in Vestland, so the canonical place files are stored under `data/places/natur/vestland/` and use `fylke: "vestland"`.

Included place ids:

- `langfoss_etne`
- `akrafjorden`
- `jettegrytene_rullestad`
- `etneelva`
- `stordalsvatnet_etne`

The batch deliberately avoids generic hiking points and near-duplicate viewpoints. Each place represents a different natural system: waterfall, fjord, Quaternary geology, salmon river, and lake/watershed.

## Main audit

Before creating the files, repository searches were run for `Etne` and the five candidate names/ids against current `main`; no existing canonical matches were found in the available GitHub search results. Recent pull requests and commits were also searched for Etne without finding an existing Etne place batch.

Because the repository code-search index is not guaranteed to be complete, the final integration step must still run the repository's normal duplicate-place and manifest/index validation gates after manifest registration.

## Sources and coordinate basis

### Langfoss

- NVE, `042/1 Vaulaelva m Langfossen`: describes the protected watershed, its largely undisturbed character, the high-mountain lakes, the fall into Åkrafjorden, and the 1980/2005 protection history.
- Coordinate anchor: public OSM/GeoNames mapping of the waterfall, approximately `59.84409, 6.33989`.

### Åkrafjorden

- Store norske leksikon, `Åkrafjorden`: 32 km long, deepest point about 635 m, steep inner fjord, geographic position between the Folgefonna peninsula and the Etne/Sauda mountain areas.
- Kartverket, Den norske los / SSR: official named-place coordinate `59.7476, 5.99829`.

### Jettegrytene på Rullestad

- Geopark Sunnhordland: identifies the potholes as major glacial meltwater features formed during rapid deglaciation around 11,000 years ago.
- Etne municipality, nature management/friluft pages: lists the Rullestad potholes as a geologically distinctive locality and a signed detour from the restored old road.
- Coordinate anchor: mapped viewpoint/locality approximately `59.87541, 6.44963`.

### Etneelva

- NVE, `041/1 Etnevassdraget`: describes the protected catchment from mountains through valley to fjord, the river morphology, salmon values and broader natural diversity.
- Store norske leksikon, `Etneelva`: documents the confluence of Stordalselva and Litledalselva, the outlet to Etnepollen, national salmon-watercourse status since 2003, and the research/monitoring trap.
- Coordinate anchor: SSR/Wikidata named-place coordinate near the lower river/mouth, approximately `59.66611, 5.94722`.

### Stordalsvatnet

- NVE, `041/1 Etnevassdraget`: identifies Stordalsvatnet as the catchment's largest lake, about 8.5 km², within the protected Etnevassdraget.
- Etne municipality, inland fishing/friluft pages: documents fish diversity and established public recreation use around the lake.
- Kartverket SSR: official named-place coordinate `59.70957, 6.11296`.

## Integration follow-up

The five source files need to be registered through the repository's canonical place-manifest path and the generated global places index rebuilt before merge. Run the normal places index/coordinate/duplicate validation gates after registration.
