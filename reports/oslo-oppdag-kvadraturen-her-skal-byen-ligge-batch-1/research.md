# Oppdag Kvadraturen – Her skal byen ligge! batch 1

## Scope

This batch audits the seven-stop walk `Her skal byen ligge!`, which interprets daily life and urban development in seventeenth- and eighteenth-century Christiania.

All physical parent places already exist in History Go. No new map marker is needed.

## Stop representation

### 1. Her skal byen ligge! → `christiania_torv`

New historical Wonderkammer layer:

- `wk_christiania_torv_her_skal_byen_ligge_1624`

The layer explains the 1624 relocation of the city, the planned grid, Christiania Torv, the first church and the role of masonry regulations. The famous phrase is treated as a foundation narrative rather than presented as a verbatim documented quotation from one precisely located moment.

### 2. Straff på Christiania torv → `christiania_torv`

New historical Wonderkammer layer:

- `wk_christiania_torv_straff_og_offentlig_skamm`

The layer covers public punishment, shame, honour and social control. It remains distinct from the separate canonical histories of Gamle Rådhus and Akershus festning.

### 3. Rådmannsgården → `radmannsgarden_og_anatomibygget`

New historical Wonderkammer layer:

- `wk_radmannsgarden_1626_lauritz_hansen_og_gipstaket`

This route-specific layer focuses on Lauritz Hansen, the 1626 owner marks and the surviving plaster ceiling with the seven virtues. It deliberately does not merge this early Rådmannsgården material with the separate history of Anatomibygget even though both buildings share one canonical parent.

### 4. Byens grenser → `garmanngarden`

New historical context layer:

- `wk_garmanngarden_byens_grenser_og_utvidelser`

Oppdag Kvadraturen locates the route stop at Rådhusgata 7. The content itself is a citywide story about boundaries, suburbs, expansion and the 1948 Oslo–Aker merger. The Wonderkammer entry therefore uses `route_context` scope and explicitly does not claim that a historical city boundary ran through Garmanngården itself.

### 5. Nye smaker og lukter → `havnelageret`

New historical Wonderkammer layer:

- `wk_havnelageret_nye_smaker_lukter_sadelmakerhullet`

The layer represents Sadelmakerhullet and the trade in food, tobacco, coffee, spices, porcelain and other imported goods. It complements rather than duplicates the `Under bakken` archaeological layer about the buried wharves and boat wreck.

### 6. Waisenhuset → `waisenhuset_kongens_gate`

New historical Wonderkammer layer:

- `wk_waisenhuset_barnehjem_1778_1918`

This layer is restricted to the orphanage period. The canonical building is older and has other historical phases, so the text does not make its whole history synonymous with the Waisenhus institution.

### 7. Ruiner og arkeologiske funn → `kontraskjaeret`

No new chamber.

This stop substantially overlaps the already merged `Under bakken` archaeology entry:

- `wk_kontraskjaeret_1600_talls_bygardene`

Creating a second near-identical chamber would duplicate the same visible house foundations, seventeenth-century rental housing and archaeological interpretation. The existing chamber is therefore intentionally reused as the representation for this stop.

## Result

The seven route stops are represented by six new Wonderkammer layers plus one reused archaeological chamber. The canonical places themselves were already complete before this batch.

## Primary sources

- Oppdag Kvadraturen – `Her skal byen ligge!` walk
- Oppdag Kvadraturen – `Her skal byen ligge!` / Christiania Torv
- Oppdag Kvadraturen – `Straff på Christiania torv`
- Oppdag Kvadraturen – `Rådmannsgården`
- Oppdag Kvadraturen – `Byens grenser`
- Oppdag Kvadraturen – `Nye smaker og lukter`
- Oppdag Kvadraturen – `Waisenhuset`
- Oppdag Kvadraturen – `Ruiner og arkeologiske funn`

## Validation target

The batch should fail if:

- any of the five parent IDs does not exist in `places_index.json`;
- any new chamber ID collides with registered Wonderkammer data;
- the reused Kontraskjæret chamber is missing from the registered Wonderkammer corpus;
- or the batch is not registered in `data/wonderkammer/index.json`.
