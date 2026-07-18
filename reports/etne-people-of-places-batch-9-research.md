# Etne People of Places batch 9 — litterære minnestader

Date: 2026-07-18

## Scope

Adds three named people with explicit, documented connections to three existing canonical literary places in Etne. No new place records are created:

- `ingvar_moe` → `ingvar_moe_byste_etne`
- `olav_vik` → `olav_vik_garden_osnes`
- `johan_ebne` → `gurine_johan_ebnes_minde`

## Ingvar Moe

Etne municipality and Store norske leksikon document Moe as an author whose work was closely tied to his home village. Norske barne- og ungdomsbokforfattere documents both the planned placement and the completed unveiling of his bust in December 2006. The sculpture stands by the quay in Etne, near his birthplace.

Decision:

- include as the person represented by the concrete public bust
- primary place `ingvar_moe_byste_etne`
- category `litteratur`

## Olav Vik

Friluftsrådet Vest states that Vik had his farm on the Olav Vik foundation's Osnes property and found inspiration for his writing there. Etne Sogelag documents his poetry collections and local literary legacy. Brønnøysundregistrene confirms the active Olav Vik foundation and its historical-site purpose.

Decision:

- include through the direct farm, residence and writing-landscape connection
- use the source-dominant display name `Olav Vik`
- primary place `olav_vik_garden_osnes`
- category `litteratur`

## Johan Ebne

Etne municipality publishes the relevant part of the 1944 marriage agreement and testament. Johan Ebne directed that his remaining separate property should fund a book collection for Ebne school district, named Gurine og Johan Ebnes Minde. His 1953 supplementary testament required the collection to remain separate from Skånevik's municipal library.

Decision:

- include as the documented testator and creator of the collection
- primary place `gurine_johan_ebnes_minde`
- retain the place record's disclosed representative locality-anchor limitation
- category `litteratur`

## Gurine exclusion

The municipal source documents Gurine in the collection's name, but the reproduced legal text attributes the testamentary action to Johan Ebne and identifies Ingeborg Ebne in the marriage agreement. It does not document Gurine as donor, founder, manager or collection user.

Decision:

- do not create `gurine_ebne` in this batch
- being an eponym alone is not treated as a strong enough People of Places role
- revisit only if a stronger source establishes her direct relationship to the collection or the testamentary gift

## Duplicate gate

Fresh `main` at `0d9931f` was searched for IDs, exact names and relevant variants after rebasing over the concurrent Holmenkollen people-manifest updates:

- `ingvar_moe`
- `olav_vik`
- `olav_berner_vik`
- `johan_ebne`
- `gurine_ebne`

No existing canonical people records were found for the three included candidates.

## Sources

1. Etne kommune — Ingvar Moe
   - https://www.etne.kommune.no/kultur-og-fritid/historiske-namn-og-boker/ingvar-moe/
2. Norske barne- og ungdomsbokforfattere — Ingvar Moe på sokkel
   - https://www.nbuforfattere.no/2006/12/02/ingvar-moe-p-sokkel/
3. Norske barne- og ungdomsbokforfattere — Ingvar Moe hedret
   - https://www.nbuforfattere.no/2006/12/11/ingvar-moe-hedret/
4. Store norske leksikon — Ingvar Moe
   - https://snl.no/Ingvar_Moe
5. Friluftsrådet Vest — Osnes
   - https://www.frivest.no/lokalt/etne/osnes
6. Etne Sogelag — Det liv som gror or draumen av Olav Vik
   - https://www.etne-sogelag.no/enkeltboker/det-liv-som-gror-or-draumen-av-olav-vik
7. Brønnøysundregistrene — Olav Vik Stiftelsen Osnes
   - https://virksomhet.brreg.no/nb/oppslag/enheter/971354550
8. Etne kommune — Ebne skulekrins legatmidlar
   - https://www.etne.kommune.no/kultur-og-fritid/legat/ebne-skulekrins-legatmidlar/

## Validation plan

- register the batch exactly once in `data/people/manifest.json`
- verify the three IDs are globally unique
- verify all three existing place IDs are active
- verify each person has one matching primary and `places` link
- run the permanent batch test and the full people gate
- run the places gate to catch unrelated index drift before publication
