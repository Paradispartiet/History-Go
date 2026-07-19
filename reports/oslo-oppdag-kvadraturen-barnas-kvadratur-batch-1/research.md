# Oppdag Kvadraturen – Barnas kvadratur batch 1

## Scope

This batch audits and completes the eight-stop family walk `Barnas kvadratur`.

All eight physical stops already existed as canonical History Go places before the batch. The work therefore focuses on content reuse and missing place-specific family-history layers rather than new map markers.

## Duplicate audit method

Before writing new Wonderkammer data, the batch:

1. listed every already registered chamber on the eight route parents;
2. searched the complete `data/` tree for the route's strongest potentially duplicated stories;
3. verified all eight canonical parent IDs against `data/places/places_index.json`.

The audit established three direct reuse cases and five content gaps.

## Stop representation

### 1. Christiania Torv → `christiania_torv`

No new chamber.

The family route's founding story is already represented by:

- `wk_christiania_torv_her_skal_byen_ligge_1624`

That chamber already covers the 1624 fire aftermath, the relocation, the planned new city and Christian IV foundation narrative at the correct place.

### 2. Kontraskjæret → `kontraskjaeret`

No new chamber.

The family route's visible house foundations and the 1686 transition from town houses to fortress defences are already represented by:

- `wk_kontraskjaeret_1600_talls_bygardene`

Creating another child-labelled version would duplicate the same archaeological place story.

### 3. Akershus festning → `akershus_festning`

New chamber:

- `wk_akershus_festning_barnas_kvadratur_beleiringen_1716`

Existing Festningsbyen chambers cover the fortress transformation, building work, administration, law and artillery logistics. None of them represents the family route's direct story of Karl XII's 1716 attack from the fortress viewpoint.

The new layer remains distinct from:

- `wk_oslo_posthus_beleiringen_1716`

The Posthus chamber explains the city in the firing line and the cannonball trace. The new Akershus chamber explains why the fortress held out, the strategic pressure on the Swedish army and the experience of a city caught around a besieged fortress.

### 4. Waisenhuset → `waisenhuset_kongens_gate`

No new chamber.

The family route's orphanage history is already directly represented by:

- `wk_waisenhuset_barnehjem_1778_1918`

That chamber covers children, institutional life and the Waisenhus period while keeping the older building history separate.

### 5. Norges Bank / Ole Høiland → `grunnlovsbygget_bankplassen`

New chamber:

- `wk_grunnlovsbygget_bankplassen_ole_hoiland_bankranet_1835`

The duplicate audit found existing quiz material about Ole Høiland and an existing canonical person record tied to his imprisonment at Akershus festning. It did **not** find a registered Wonderkammer layer on Bankplassen 3 for the actual bank robbery.

The new chamber therefore adds the missing place-specific event layer without duplicating the person record or quiz content.

### 6. Bankplassen og Christiania Theater → `norges_bank_bankplassen_4`

New chamber:

- `wk_norges_bank_bankplassen_4_teaterslaget_1838`

The vanished theatre itself is already represented by:

- `wk_norges_bank_bankplassen_4_christiania_theater`

The new chamber is narrower: it represents the 1838 conflict around the performance of Wergeland's `Campbellerne`, with whistles, disruption, thrown objects and fighting inside and outside the theatre.

The repository search also found existing content called `Teaterslaget` about the opening of **Det Norske Teatret in 1913**. That is a different event at a different theatre and is not reused for this stop.

### 7. Grev Wedels plass → `grev_wedels_plass`

New chamber:

- `wk_grev_wedels_plass_barnas_kvadratur_havn_logen_hospital`

The canonical place popup already mentions the relocated Militærhospitalet in its broader chronology, but the parent had no registered Wonderkammer chambers at all.

The family route adds a distinct discovery narrative combining:

- the older shoreline and land reclamation;
- Gamle Logen;
- the surprising wooden Militærhospitalet;
- the building's dismantling, storage and reconstruction by the square.

### 8. Garmanngården → `garmanngarden`

New chamber:

- `wk_garmanngarden_johan_garmann_trelasthandel_herskapshus`

The existing chamber on the parent is:

- `wk_garmanngarden_byens_grenser_og_utvidelser`

That layer is citywide route context about changing urban boundaries. It does not represent the family route's concrete story about a wealthy household, Johan Garmann, proximity to the old harbour and the timber economy behind early Christiania wealth.

## Result

### Reused chambers

1. `wk_christiania_torv_her_skal_byen_ligge_1624`
2. `wk_kontraskjaeret_1600_talls_bygardene`
3. `wk_waisenhuset_barnehjem_1778_1918`

### New chambers

1. `wk_akershus_festning_barnas_kvadratur_beleiringen_1716`
2. `wk_grunnlovsbygget_bankplassen_ole_hoiland_bankranet_1835`
3. `wk_norges_bank_bankplassen_4_teaterslaget_1838`
4. `wk_grev_wedels_plass_barnas_kvadratur_havn_logen_hospital`
5. `wk_garmanngarden_johan_garmann_trelasthandel_herskapshus`

### New canonical places

None.

## Representation safeguards

- A route marketed to children does not automatically receive duplicate child-specific copies of stories already represented accurately at the same place.
- The 1716 Akershus chamber and the 1716 Posthus chamber keep two different physical viewpoints on the same siege.
- Ole Høiland's bank robbery is added as a place event while the existing person record remains the canonical person identity.
- The 1838 Christiania Theater conflict is kept separate from the unrelated 1913 `Teaterslaget` at Det Norske Teatret.
- Grev Wedels plass retains the difference between the current park, the old shoreline and the relocated Militærhospitalet.
- Garmanngården's household/timber layer remains distinct from the existing city-boundary route context.

## Primary sources

- Oppdag Kvadraturen / Byantikvaren – `Barnas kvadratur` walk
- Oppdag Kvadraturen – Christiania Torv, Barnas kvadratur
- Oppdag Kvadraturen – Kontraskjæret, Barnas kvadratur
- Oppdag Kvadraturen – Akershus festning, Barnas kvadratur
- Oppdag Kvadraturen – Waisenhuset, Barnas kvadratur
- Oppdag Kvadraturen – Norges Bank / Ole Høiland, Barnas kvadratur
- Oppdag Kvadraturen – Bankplassen og Christiania Theater, Barnas kvadratur
- Oppdag Kvadraturen – Grev Wedels plass, Barnas kvadratur
- Oppdag Kvadraturen – Garmanngården, Barnas kvadratur
- Existing History Go registered Wonderkammer data, quiz data and people data

## Validation target

The batch must fail if:

- the new Wonderkammer file is not registered;
- any of the five new parent IDs is missing from the place index;
- the batch does not contain exactly five unique new chamber IDs;
- a new chamber ID collides with pre-existing registered Wonderkammer data;
- any of the three reused chamber IDs is missing from the pre-existing registered corpus;
- the existing-parent audit no longer records the expected prior chambers;
- the route-parent audit no longer confirms all eight physical canonical parents;
- or `git diff --check` fails.
