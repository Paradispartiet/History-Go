# Oppdag Kvadraturen – Festningsbyen batch 1

## Scope

This batch audits the eight-stop walk `Festningsbyen` and completes its representation in History Go without creating a dense cluster of mixed-confidence map markers inside Akershus festning.

## Representation result

The route is represented by:

- **7 new Wonderkammer chambers** across 3 existing canonical parents;
- **1 reused Wonderkammer chamber** for the already represented 1624 relocation story;
- **0 new canonical place markers**.

The five named stops inside Akershus remain distinct microplaces in content, but they are attached to canonical `akershus_festning` rather than becoming five overlapping or inconsistently geocoded map markers.

## Stop mapping

### 1. Byen flyttes → `christiania_torv`

No new chamber.

The route stop reuses the already registered foundation and 1624 relocation chamber:

- `wk_christiania_torv_her_skal_byen_ligge_1624`

This avoids creating a duplicate version of the same city-relocation narrative that was added for the `Her skal byen ligge!` walk.

### 2. Beleiringen 1716 → `oslo_posthus`

New chamber:

- `wk_oslo_posthus_beleiringen_1716`

The layer follows Oppdag Kvadraturen's route stop and its preserved cannonball story while avoiding an unsupported reconstruction of the cannonball's exact trajectory or impact point.

### 3. Garnisonsbyen → `den_gamle_krigsskolen`

New chamber:

- `wk_den_gamle_krigsskolen_garnisonsbyen`

The route uses the old military-school building as its physical anchor, but the seventeenth-century quartering system affected households across Christiania. The chamber is therefore explicitly `route_context` rather than an event claimed to have happened only in Tollbugata 10.

### 4. Fra borg til festning / Hovedporten → `akershus_festning`

New chamber:

- `wk_akershus_festning_hovedporten_fra_borg_til_festning`

Hovedporten remains the named route microplace and physical threshold into the fortress, while the narrative correctly covers the larger transformation from medieval castle to artillery fortress.

### 5. Festningsbyggingen / Festningsplassen → `akershus_festning`

New chamber:

- `wk_akershus_festning_festningsplassen_festningsbyggingen`

The layer covers construction labour, taxation, compulsory work and the older Hovedtangen political landscape. It explicitly avoids claiming that the present-day Festningsplassen had the same historical extent throughout the sixteenth and seventeenth centuries.

### 6. Styre og vanstyre / Michael von Sundts plass → `akershus_festning`

New chamber:

- `wk_akershus_festning_michael_von_sundts_plass_styre_og_vanstyre`

The stop is retained as the route anchor, but the stattholder, administration, residence and prison history concerns multiple parts of the Akershus complex. It is therefore represented as route context rather than falsely concentrated on the square itself.

### 7. Lov og rett / Stallgården → `akershus_festning`

New chamber:

- `wk_akershus_festning_stallgarden_lov_og_rett`

The layer treats Stallgården as the route anchor for the longer legal history of Akershus. It explicitly keeps documented court locations such as Margretesalen distinct instead of relocating all court activity to Stallgården.

### 8. Moderne festningsverk / Arkeliggården → `akershus_festning`

New chamber:

- `wk_akershus_festning_arkeliggarden_moderne_festningsverk`

The chamber represents the historical Arkeliggården area and its connection to artillery, military storage and the modernization of the fortress after the attacks of the sixteenth century.

## Coordinate and microplace audit

The batch ran a dedicated coordinate audit before deciding how the five internal Akershus stops should be represented.

### Exact open-map geometry found

Two route subplaces have exact named OpenStreetMap geometry:

- `Festningsplassen`
- `Michael von Sundts plass`

The raw Nominatim and Overpass responses are retained in the batch report directory.

### No exact Nominatim match found

The same bounded exact-name search returned no result for:

- `Hovedporten`
- `Stallgården`
- `Arkeliggården`

Broader Overpass discovery was attempted, but the external query endpoint did not complete reliably. The original exact-search evidence was already persisted and is sufficient for the representation decision.

### Representation decision

Creating canonical markers only for the two subplaces with exact open-map geometry would produce an inconsistent route model: two internal microplaces would become standalone map places while three equivalent named stops would remain unresolved or require weaker hand-picked coordinates.

Instead, all five internal stops are kept as distinct Wonderkammer microplaces under the already verified canonical fortress parent:

- `akershus_festning`

This preserves the route's granularity without adding a dense cluster of overlapping map markers or pretending to have equal coordinate certainty where the source data does not support it.

The saved coordinate evidence remains useful if History Go later introduces a dedicated subplace/microplace map layer separate from canonical place markers.

## Primary sources

- Oppdag Kvadraturen / Byantikvaren – `Festningsbyen` walk and its individual stop pages
- Forsvarsbygg – Akershus festning, Hovedporten, Festningsplassen and protected fortress structures
- Lovdata – protection regulations and named protected structures at Akershus festning
- OpenStreetMap / Nominatim / Overpass – bounded coordinate and geometry audit only

## Validation target

The batch must fail if:

- the new Wonderkammer file is not registered in `data/wonderkammer/index.json`;
- any of the three canonical parent IDs is missing from `data/places/places_index.json`;
- the Akershus parent does not contain exactly five new route microplace chambers;
- the batch does not contain exactly seven unique new chamber IDs;
- any new chamber ID collides with pre-existing registered Wonderkammer data;
- the reused `wk_christiania_torv_her_skal_byen_ligge_1624` chamber is not present in the pre-existing registered Wonderkammer corpus;
- the persisted exact coordinate evidence for Festningsplassen and Michael von Sundts plass is missing or empty;
- or `git diff --check` fails.
