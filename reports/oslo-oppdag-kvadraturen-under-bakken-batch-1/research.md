# Oppdag Kvadraturen – Under bakken batch 1

## Scope

This batch audits and represents all six stops in Byantikvaren's `Under bakken` walk:

1. Akershus slott
2. Kontraskjæret
3. Bankplassen 3
4. Revierstredet 5–7 / current Norges Bank
5. Havnelageret
6. Paléhaven

The route is an archaeological interpretation layer. The representation rule is therefore:

- use an existing canonical place as parent when the archaeological material belongs under an already represented building or area;
- add a new canonical marker only when the current physical parent itself is missing;
- keep archaeological claims in Wonderkammer instead of duplicating map markers for buried or excavated remains.

## Parent audit

### Akershus slott

Existing canonical parent: `akerhus_slott`.

The Under bakken stop presents ongoing archaeological research into early masonry and the first phases of the medieval castle. Because the research is ongoing, the Wonderkammer text explicitly avoids presenting a new construction date as settled fact.

### Kontraskjæret

Existing canonical parent: `kontraskjaeret`.

The archaeological layer covers the five excavated seventeenth-century townhouses, approximately 60,000 finds, visible marked foundations and the later palisade line.

### Bankplassen 3

Existing canonical parent: `grunnlovsbygget_bankplassen`.

This is the standing former Norges Bank building from 1828. The archaeological layer concerns the older residential structure, floor layers and household finds discovered under the building during renovation.

### Revierstredet 5–7 / current Norges Bank

No canonical current Norges Bank building existed in the repository before this batch.

New canonical parent:

- `norges_bank_bankplassen_2`

Current official identity:

- Norges Bank gives the head office visiting address as Bankplassen 2.
- Norges Bank describes the building as occupying the full block bounded by Rådhusgata, Dronningens gate, Revierstredet and Kirkegata.
- The building was designed by Kjell Lund and Nils Slaatto and dedicated in 1986.

Oppdag Kvadraturen names the archaeological stop `Revierstredet 5-7` and identifies it as the site of the current Norges Bank. The new canonical record therefore follows the institution's current official address, while the Wonderkammer layer preserves the historical excavation-area naming.

Coordinate evidence:

- Geonorge Adresser API
- `geonorge-adresser-v1:0301:10412:2`
- `59.90862371981983, 10.742356165353511`

The raw lookup output is persisted in `coordinates/norges_bank_bankplassen_2.json`.

### Havnelageret

Existing canonical parent: `havnelageret`.

The archaeological layer covers excavated phases of Revierbrygga, Sadelmakerbrygga and Olsens brygge, traces of boathouses, and the vessel known as Havnelageret I, dated by dendrochronology to construction between 1588 and 1598.

### Paléhaven

Existing canonical parent: `palehaven_paleet`.

Oppdag Kvadraturen states that ship parts were found in 2014 in a sheet-pile trench in Prinsens gate near Paléhaven. Because the stop summary does not establish that the find was inside the historical garden footprint itself, the Wonderkammer text deliberately says `ved Paléhaven` and does not claim a more exact archaeological position.

## Representation result

| Under bakken stop | History Go representation |
|---|---|
| Akershus slott | Archaeological Wonderkammer layer under `akerhus_slott` |
| Kontraskjæret | Archaeological Wonderkammer layer under `kontraskjaeret` |
| Bankplassen 3 | Archaeological Wonderkammer layer under `grunnlovsbygget_bankplassen` |
| Revierstredet 5–7 | New canonical `norges_bank_bankplassen_2` + archaeological Wonderkammer layer |
| Havnelageret | Archaeological Wonderkammer layer under `havnelageret` |
| Paléhaven | Archaeological Wonderkammer layer under `palehaven_paleet` |

## Primary sources

- Oppdag Kvadraturen – `Under bakken` walk and individual stop pages
- Oppdag Kvadraturen – `Revierstredet 5-7`
- Oppdag Kvadraturen – `Bankplassen 3`
- Oppdag Kvadraturen – `Havnelageret`
- Oppdag Kvadraturen – `Kontraskjæret`
- Oppdag Kvadraturen – `Akershus slott`
- Norges Bank – `Norges Bank-bygget`
- Norges Bank – current contact/visiting-address information

## Coordinate workflow rule

The Bankplassen 2 coordinate lookup was produced and persisted in the same workflow command with `tee`; no coordinate used in the canonical record came from unsaved terminal-only output.
