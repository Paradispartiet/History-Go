# Oppdag Kvadraturen – Stil og arkitektur batch 1

## Scope

This batch audits and completes the seven-stop walk `Stil og arkitektur` from Oppdag Kvadraturen.

The earlier Oppdag Kvadraturen core batches had already created or confirmed canonical coverage for almost every physical building and square used by the walk. The remaining task was therefore primarily to add the route's comparative architecture interpretations without turning multi-building comparisons into artificial single places.

## Physical gap audit

The stop `Fire stilperioder` compares four buildings around the Rådhusgata / Kirkegata intersection:

1. `stattholdergarden`
2. Kirkegata 5
3. `sjofartsbygningen`
4. `norges_bank_bankplassen_2`

The checkout-level duplicate audit established that `sjofartsbygningen` already exists as an active canonical place. It was added in the earlier `Hovedstaden Christiania` work and uses Kongens gate 6 as the documented main coordinate anchor for the large building complex that also includes Kirkegata 7.

No active canonical place was found for Kirkegata 5.

### Kirkegata 5 coordinate

The repository's normative address-first finder returned one clear official Geonorge address candidate:

- query: `Kirkegata 5 Oslo`
- source object: `geonorge-adresser-v1:0301:13707:5`
- coordinate: `59.90929426367078, 10.742588024864189`
- address: Kirkegata 5, 0153 Oslo
- accuracy: rooftop / official address point

The raw terminal output is retained at:

- `coordinates/kirkegata_5.json`

The batch therefore adds exactly one new canonical place:

- `kirkegata_5`

## Route representation

### 1. Christiania Torv → `christiania_torv`

New architecture chamber:

- `wk_christiania_torv_renessansebyplan_og_torgform`

The existing 1624 foundation chamber explains the relocation and founding narrative. This new layer is narrower: it focuses on Renaissance planning theory, the square geometry, the crossing street grid and the later attempt to restore the historic spatial effect without copying old architecture.

### 2. Wessels plass → `wessels_plass`

New comparative architecture chamber:

- `wk_wessels_plass_arkitektur_fra_nasjonsbygg_til_forretningsgard`

The square is used as a route viewpoint for several separate buildings and periods, including the Storting, the Freemasons' lodge, Skreddergården and the 1958 parliamentary extension. The chamber is therefore route context rather than a claim that these buildings are one complex.

### 3. Telegrafbygget og Steen & Strøm → `telegrafbygningen`

New comparative architecture chamber:

- `wk_telegrafbygningen_nybarokk_moter_art_deco`

The route compares two distinct canonical places:

- `telegrafbygningen`
- `steen_og_strom`

The layer keeps both physical identities separate while comparing Nordic Neo-Baroque and Art Deco as two different responses to early twentieth-century modernity.

### 4. Hovedpostkontoret → `oslo_posthus`

New architecture chamber:

- `wk_oslo_posthus_monument_for_postvesenet_og_nybarokken`

The layer focuses on institutional architecture, function and the monumental Nordic Neo-Baroque expression. It remains distinct from the already merged `Festningsbyen` chamber about the 1716 siege and cannonball story.

### 5. Bankpalassene → `centralbanken_kirkegata`

New architecture chamber:

- `wk_centralbanken_kirkegata_bankpalasset_som_maktarkitektur`

Centralbanken is the concrete route anchor for the broader bank-palace type. Other former bank buildings in Kvadraturen remain separate canonical places; the thematic category is not converted into a fake common map marker.

### 6. Fire stilperioder → `kirkegata_5`

New comparative architecture chamber:

- `wk_kirkegata_5_fire_stilperioder_i_ett_kryss`

The layer compares four separate canonical buildings:

- `stattholdergarden`
- `kirkegata_5`
- `sjofartsbygningen`
- `norges_bank_bankplassen_2`

Kirkegata 5 is used as the route parent because it was the only missing physical building in the four-building comparison. The chamber explicitly preserves all four as separate places.

### 7. Bankplassen → `bankplassen`

New comparative architecture chamber:

- `wk_bankplassen_tre_generasjoner_norges_bank`

The layer compares three generations of Norges Bank architecture, all already represented as separate canonical places:

- `grunnlovsbygget_bankplassen`
- `norges_bank_bankplassen_4`
- `norges_bank_bankplassen_2`

Bankplassen itself is the public-space route anchor for the comparison.

## Result

Canonical places added:

1. `kirkegata_5`

Wonderkammer chambers added:

1. `wk_christiania_torv_renessansebyplan_og_torgform`
2. `wk_wessels_plass_arkitektur_fra_nasjonsbygg_til_forretningsgard`
3. `wk_telegrafbygningen_nybarokk_moter_art_deco`
4. `wk_oslo_posthus_monument_for_postvesenet_og_nybarokken`
5. `wk_centralbanken_kirkegata_bankpalasset_som_maktarkitektur`
6. `wk_kirkegata_5_fire_stilperioder_i_ett_kryss`
7. `wk_bankplassen_tre_generasjoner_norges_bank`

## Representation safeguards

- Multi-building route stops remain comparative `route_context`; they do not become synthetic canonical places.
- Existing canonical `sjofartsbygningen` is reused rather than duplicated at Kirkegata 7.
- `kirkegata_5` represents only the standing 1895 business building.
- The four-style intersection and the three-generations-of-Norges-Bank stop explicitly reference separate canonical place IDs.
- Architecture layers are kept distinct from previously merged archaeology, siege and social-history chambers on the same parents.

## Primary sources

- Oppdag Kvadraturen / Byantikvaren – `Stil og arkitektur` walk and its seven stop pages
- Oppdag Kvadraturen – `Fire stilperioder`
- Oppdag Kvadraturen – `Bankplassen`
- Oppdag Kvadraturen – `Telegrafbygget og Steen og Strøm`
- Oppdag Kvadraturen – `Bankpalassene`
- Geonorge Adresser API v1 – Kirkegata 5 coordinate
- Existing History Go canonical place data and previous Oppdag Kvadraturen audit reports

## Validation target

The finalizer must fail if:

- the new place source is not registered in `data/places/manifest.json`;
- `kirkegata_5` is missing from the generated `places_index.json`;
- strict-new coordinate intake reports a blocking error or warning for the new place;
- the canonical emne gate introduces missing or duplicate IDs;
- the existing 40-error place-health baseline increases;
- the Wonderkammer batch is not registered;
- any of the seven route parents is missing;
- the batch does not contain exactly seven unique new chamber IDs;
- a new chamber ID collides with existing registered Wonderkammer data;
- any of the referenced comparison places is missing from the generated place index;
- the saved audit no longer proves that `sjofartsbygningen` was already canonical;
- or `git diff --check` fails.
