# VisitOSLO Galleries — full source classification closure

Date: 2026-07-23

The exact current VisitOSLO Galleries source snapshot contains **66 entries**. All **66/66 are now classified**.

## Final classification

| Outcome | Count |
|---|---:|
| Machine exact canonical coverage | 18 |
| Manual canonical reuse / parent enrichment | 4 |
| Policy-deferred private/commercial venues | 30 |
| Approved distinct Oslo candidates | 12 |
| Approved distinct candidate outside Oslo | 1 |
| Approved coordinate-only backlog | 1 |
| Unresolved classification items | 0 |

This closes **source classification**, not production completeness.

## Manual canonical reuse

- **Purenkel** → `purenkel_galleri`
- **Oslo Kunstforening** → institutional/current-use enrichment on `radmannsgarden_og_anatomibygget`
- **BO Billedkunstnerne i Oslo** → institutional/current-use enrichment on `radmannsgarden_og_anatomibygget`
- **Atelier Nord** → institutional/current-use enrichment on `hauges_minde`

## Approved distinct Oslo candidates

1. Format Oslo
2. Edvard Munchs atelier på Ekely
3. Tegnerforbundet – senter for tegnekunst
4. Unge Kunstneres Samfund
5. Galleri Norske Grafikere
6. Galleri ROM for kunst og arkitektur
7. The Mini Bottle Gallery
8. Galleri LNM
9. RAM galleri
10. Galleri Schaeffers Gate 5
11. Grafill
12. SKOG Art Space

These are scope candidates only. Each must still pass a fresh current-main duplicate audit, physical-identity review, coordinate source contract and overlap gate before production.

## Outside Oslo

**Henie Onstad Kunstsenter** is a distinct approved candidate, but belongs to **Bærum/Akershus**, not an Oslo coordinate batch.

## Coordinate backlog

**SOFT galleri** remains approved but coordinate-blocked. Its ordinary official address marker overlaps the existing `fotografiens_hus` marker. No synthetic offset or guessed alternate point may be used; production requires a separately documented authoritative entrance or site anchor.

## Policy-deferred venues

Thirty private commercial galleries, sales galleries, auction houses, shops, showrooms and high-churn art venues are classified as non-mandatory canonical gaps under the existing bounded completeness policy. This is not a permanent exclusion: they can be reconsidered together under a dedicated inclusion framework based on durability, independent physical identity, cultural significance and coordinate stability.

## Closure guards

- Classification is complete: **66/66**.
- Production coverage is **not** complete.
- Proximity and fuzzy-name leads never count as identity.
- Shared-building institutions should enrich an existing parent where that best represents the physical place.
- Every approved new candidate must be re-audited against the then-current `main` before creating a canonical record.

## Next production step

Run one fresh current-main duplicate and physical-identity audit across the **12 approved Oslo candidates**, then separate them into:

1. coordinate-ready production candidates,
2. coordinate-research candidates,
3. parent-reuse/enrichment outcomes discovered on current main.

Only the surviving coordinate-ready candidates should enter bounded production batches with dynamically assigned Oslo batch numbers.
