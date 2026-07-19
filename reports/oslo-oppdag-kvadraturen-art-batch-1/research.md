# Oslo completeness — Oppdag Kvadraturen art microplaces batch 1

Date: 2026-07-19

## Scope

This pass begins the audit of the newer art/detail layer in the full Oppdag Kvadraturen service after the historical 33-stop core was completed in canonical place batches 1–4.

Primary source tours:

- `Kunst i Kvadraturen- Vandring i kunst og historie`
- `Kunst i Kvadraturen - "Nysgjerrigperens vandring"`
- `BaBYvandring Kunst`

The representation rule is deliberately conservative:

- stable artworks at already represented places become Wonderkammer `actual_site_treasure` entries;
- no extra map marker is created merely because an artwork has its own stop page;
- an artwork without a physically correct canonical parent is deferred rather than attached to a nearby-but-wrong place;
- a permanent art zone may be considered as its own canonical art place if the zone itself is the destination.

## Added Wonderkammer art microplaces

### Parent: `stortorget`

1. `wk_stortorget_christian_iv_carl_ludvig_jacobsen`
   - Christian IV monument by Carl Ludvig Jacobsen
   - completed 1878, unveiled 1880
   - physically and semantically part of Stortorget

Source:
https://www.oppdagkvadraturen.no/stoppesteder/christian-iv-carl-ludvig-jacobsen

### Parent: `christiania_torv`

2. `wk_christiania_torv_hansken_wenche_gulbransen`
   - `Hansken` by Wenche Gulbransen
   - fountain sculpture from 1997
   - direct artistic dialogue with the Christian IV monument on Stortorget

Source:
https://www.oppdagkvadraturen.no/stoppesteder/hansken-wenche-gulbransen

### Parent: `kontraskjaeret`

3. `wk_kontraskjaeret_marriage_tony_smith`
   - Tony Smith's `Marriage`
   - installed on Kontraskjæret in 1994 as a gift to Norway
   - source material connects the gift to Norway's peace/diplomacy role during the Oslo-process period

Source:
https://www.oppdagkvadraturen.no/stoppesteder/marriage-tony-smith

4. `wk_kontraskjaeret_franklin_d_roosevelt_stinius_fredriksen`
   - Franklin D. Roosevelt monument by Stinius Fredriksen
   - 1950 monument in the Skansen slope below Akershus
   - appropriate as a local art/minnespor under the Kontraskjæret landscape rather than a new map point

Source:
https://www.oppdagkvadraturen.no/stoppesteder/franklin-d-roosevelt-stinius-fredriksen

### Parent: `myntgatakvartalet`

5. `wk_myntgatakvartalet_politihesten_tor_kirsten_kokkin`
   - `Politihesten Tor` by Kirsten Kokkin
   - unveiled 2009 outside the mounted police riding facilities
   - the physical context is the historic military/stable landscape represented by Myntgatakvartalet

Source:
https://www.oppdagkvadraturen.no/stoppesteder/politihesten-tor-kirsten-kokkin-3

### Parent: `tollboden_oslo`

6. `wk_tollboden_oslo_hermopolis_marius_engh`
   - `Hermopolis` by Marius Engh
   - 2019 frieze in the modern glass connection between Tollboden and Stenpakkhuset
   - artwork is physically integrated into the toll complex, so a new marker would duplicate the already separated canonical toll buildings

Source:
https://www.oppdagkvadraturen.no/stoppesteder/hermopolis-marius-engh

### Parent: `bankplassen`

7. `wk_bankplassen_sittende_pike_hodetelefon_marit_krogh`
   - `Sittende pike med hodetelefon – et bilde på vår tid` by Marit Krogh
   - 2014 sculpture integrated with the granite security blocks on Bankplassen

Source:
https://www.oppdagkvadraturen.no/stoppesteder/sittende-pike-med-hodetelefon-et-bilde-pa-var-tid-marit-krogh

8. `wk_bankplassen_johannes_brun_brynjulf_bergslien`
   - Johannes Brun monument by Brynjulf Bergslien
   - sculpture from 1894, now positioned by Café Engebret close to the former Christiania Theater site

Source:
https://www.oppdagkvadraturen.no/stoppesteder/johannes-brun-brynjulf-bergslien

9. `wk_bankplassen_mann_med_liten_handbevegelse_istvan_lisztes`
   - `Mann med liten håndbevegelse` by István Lisztes
   - three-figure sculpture group in Revierstredet, associated with Norges Bank's area-security project

Source:
https://www.oppdagkvadraturen.no/stoppesteder/mann-med-liten-handbevegelse-istvan-lisztes-2

10. `wk_bankplassen_lyttende_istvan_lisztes`
    - `Lyttende` by István Lisztes
    - low, easily overlooked sculpture between benches in Revierstredet
    - part of the same art/security landscape around Norges Bank and Bankplassen

Source:
https://www.oppdagkvadraturen.no/stoppesteder/lyttende-istvan-lisztes

### Parent: `telegrafbygningen`

11. `wk_telegrafbygningen_bygningsintegrert_skulptur_finn_christensen`
    - geometric sculpture by Finn Christensen
    - integrated directly into the 1967 installation-building corner

Source:
https://www.oppdagkvadraturen.no/stoppesteder/bygningsintegrert-skulptur-finn-christensen

12. `wk_telegrafbygningen_freske_alf_rolfsen`
    - Alf Rolfsen's large 1922 fresco in the former expedition hall
    - depicts construction and operation of telegraph and telephone infrastructure

Source:
https://www.oppdagkvadraturen.no/stoppesteder/freske-telegrafbygget-alf-rolfsen

## Explicitly deferred from this microplace batch

### `Den røde prikk - Otto Künzli`

Location: Kongens gate 3.

The artwork is a small facade object and should not receive a standalone map marker. However, History Go currently has no canonical place representing the actual Kongens gate 3 building. Attaching it to Waisenhuset (`Kongens gate 1`) or another nearby place would create a false physical parent relationship.

Decision: defer until the building/site context has been audited. If Kongens gate 3 is not independently place-worthy, a future area-level Kvadraturen art anchor or another explicit microplace-parent mechanism is preferable to a wrong parent.

Source:
https://www.oppdagkvadraturen.no/stoppesteder/den-rode-prikk-otto-kunzli

### `Skulptursonen i Øvre Slottsgate`

This is not one small artwork but a permanent public-art exhibition zone launched in 2019, with five dedicated sculpture positions in the pedestrian street between Prinsens gate and Tollbugata.

Decision: candidate for its own canonical `kunst` place in the next pass, because the zone itself is a distinct destination and the displayed sculptures may change over time. It should not be forced under a nearby building parent.

Source:
https://www.oppdagkvadraturen.no/stoppesteder/skulptursonen-i-ovre-slottsgate

## Duplicate audit

Repository search found no existing canonical or Wonderkammer records for the twelve added artwork titles or artist/title combinations before this batch.

## Next pass

1. Resolve `Skulptursonen i Øvre Slottsgate` as a possible canonical art place with an explicit street-zone anchor.
2. Audit the physical/site context of Kongens gate 3 before deciding how `Den røde prikk` should be represented.
3. Continue through the remaining newer Oppdag Kvadraturen stops and thematic tours, separating:
   - canonical places;
   - Wonderkammer microplaces;
   - route/knowledge-only thematic stops;
   - duplicates of already completed historical places.
