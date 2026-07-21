# VisitOSLO Oslofjorden — final physical-scope resolution

Date: 2026-07-21

Source: https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/omraader/oslofjorden/attraksjoner

## Result

The current visible VisitOSLO Oslofjorden attractions pass contains **12 source rows**. All 12 now have a physical-scope decision.

- **4 existing canonical resolutions** across the source rows: `gressholmen`, `hovedoya_kloster`, `hovedoya`, `aker_brygge`
- **11 approved new canonical candidates**
- **0 unresolved scope decisions**

The number of approved candidates is larger than the number of unresolved source rows because two VisitOSLO entries bundle several separately named physical islands. History Go should preserve those real identities rather than inventing synthetic combined markers.

## Source decisions

| VisitOSLO row | Decision |
|---|---|
| Gressholmen, Heggholmen og Rambergøya | Reuse `gressholmen` for Gressholmen; approve separate `heggholmen` and `rambergoya` candidates. |
| Klosterruinene på Hovedøya | Existing `hovedoya_kloster`. |
| Ormøya og Malmøya | Approve separate `ormoya` and `malmoya` candidates. |
| Nakholmen | Approve `nakholmen`. |
| Steilene | Approve one archipelago-level `steilene` candidate for this source pass. |
| Langøyene | Approve `langoyene`. |
| Lindøya | Approve `lindoya`. |
| Hovedøya | Existing `hovedoya`. |
| Aker Brygge | Existing `aker_brygge`. |
| Ingierstrand bad | Approve `ingierstrand_bad` as the protected bathing complex, not just the restaurant business. |
| Bleikøya | Approve `bleikoya`. |
| Ulvøya | Approve `ulvoya`. |

## Why the combined island rows are split

The existing `gressholmen` canonical record is anchored to the exact named Gressholmen island polygon and explicitly describes Gressholmen as its place identity. It therefore does not silently cover Heggholmen or Rambergøya. Current Oslo municipal material likewise distinguishes the connected islands: Rambergøya has its own bathing and former shooting-range landscape, while Heggholmen has a separate lighthouse and industrial-history layer.

The same principle applies to Ormøya and Malmøya. VisitOSLO presents them together for visitor convenience, but they are two named physical islands. Malmøya additionally has protected coastal nature and Solvikbukta, while Ormøya is a separate inhabited island. One combined marker would erase the physical identities that the source itself names.

## Approved coordinate queue

1. `heggholmen` — exact named island geometry; lighthouse remains a content layer unless separately audited later.
2. `rambergoya` — exact named island geometry.
3. `ormoya` — exact named island geometry.
4. `malmoya` — exact named island geometry.
5. `nakholmen` — exact named island geometry.
6. `steilene` — exact named archipelago/group geometry or another documented stable group anchor; never an arbitrary single-islet proxy.
7. `langoyene` — exact present named island geometry.
8. `lindoya` — exact named island geometry.
9. `ingierstrand_bad` — exact documented bathing-complex or heritage geometry preferred; a restaurant-only address cannot redefine the whole complex.
10. `bleikoya` — exact named island geometry.
11. `ulvoya` — exact named island geometry.

All island records use **object-type-first** coordinate intake. No nearest/first-hit or arbitrary ferry-stop logic is permitted.

## Representation locks

- `hovedoya_kloster` and `hovedoya` remain separate place identities.
- Heggholmen and Rambergøya are not folded into `gressholmen` merely because the islands are physically connected.
- Steilene is one source-level archipelago candidate in this pass; individual islands or buildings require their own later inclusion case.
- Langøyene represents the present connected recreation island, while its former two-island form and landfill history remain historical layers.
- Ingierstrand bad represents the complete protected functionalist bathing complex, including the relationship between landscape, diving tower and restaurant architecture.
- Places outside Oslo municipality are not excluded when the current VisitOSLO Oslofjorden source explicitly includes them. This applies particularly to Steilene, Langøyene and Ingierstrand bad.

## Source basis

Current VisitOSLO and Oslo municipal sources establish the source identities and physical distinctions used here. Oslo municipality describes Gressholmen, Rambergøya and Heggholmen as connected but separately named islands, documents Rambergøya's separate landscape and Heggholmen's lighthouse, and describes Langøyene as a present connected island formed from Nordre and Søndre Langøy. Current municipal documentation also treats Ingierstrand as a protected 1934 functionalist bathing complex managed by Oslo despite its location in Nordre Follo.

Status: **PHYSICAL SCOPE CLOSED — 11 CANDIDATES READY FOR COORDINATE INTAKE.**
