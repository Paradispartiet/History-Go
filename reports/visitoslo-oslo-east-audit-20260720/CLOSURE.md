# VisitOSLO Oslo East — closure audit

Date: 2026-07-20

This is the current-main closure pass for the bounded 30-entry VisitOSLO Oslo East source audit. The old preliminary audit is superseded by this resolution table.

- Source entries: **30**
- Resolved to an existing canonical physical place/area: **29**
- Deliberately classified as non-place itinerary: **1**
- Unresolved canonical gaps: **0**

## Important stale-audit corrections

- **Gamlebyen kirke** is now its own canonical active church place (`gamlebyen_kirke`), distinct from the broader historic `oslo_hospital` complex.
- **Jordal skøytebane** is resolved to the public-skating use of `jordal_ungdomshall`, not `jordal_amfi` and not a third standalone venue.
- **Ekebergsletta parkrun** remains an activity on the stable physical place `ekebergsletta`; no event pseudo-place is created.
- **Sykkelrute: Utsiktspunkt Ekeberg** is a route/itinerary entry and is intentionally not materialized as a place named “Sykkelrute”.

## Final resolution table

| VisitOSLO source entry | Final classification | Canonical place | Runtime category | Status |
| --- | --- | --- | --- | --- |
| Tøyenbadet | canonical_place | `toyenbadet` | sport | resolved |
| EKT Rideskole og Husdyrpark | canonical_place | `ekt_rideskole_husdyrpark` | sport | resolved |
| Naturhistorisk museum | canonical_place | `naturhistorisk_museum` | vitenskap | resolved |
| Ekebergparken skulpturpark | canonical_place | `ekebergparken` | kunst | resolved |
| Ekebergparken museum | canonical_place | `ekebergparken_museum` | historie | resolved |
| Middelalder-Oslo | canonical_place | `middelalder_oslo` | historie | resolved |
| Ekebergsletta parkrun | activity_covered_by_existing_place | `ekebergsletta` | sport | resolved |
| Oslo ladegård | canonical_place | `oslo_ladegard` | historie | resolved |
| Kunsthall Oslo | canonical_place | `kunsthall_oslo` | kunst | resolved |
| Gamlebyen kirke | canonical_place | `gamlebyen_kirke` | religion | resolved |
| St. Hallvard kirke | canonical_place | `st_hallvard_kirke_kloster` | religion | resolved |
| Jordal skøytebane | activity_use_of_canonical_place | `jordal_ungdomshall` | sport | resolved |
| Arbeiderbolig i Tøyengata 38 | canonical_place | `museumsleiligheten_grabein` | historie | resolved |
| Sykkelrute: Utsiktspunkt Ekeberg | activity_itinerary_not_canonical_place | — | — | intentionally_no_place |
| Mariakirkeruinen | canonical_place | `mariakirken_ruin_oslo` | historie | resolved |
| Kampen Økologiske Barnebondegård | canonical_place | `kampen_okologiske_barnebondegard` | by | resolved |
| Helleristningene på Ekeberg | canonical_place | `ekeberg_helleristninger` | historie | resolved |
| Tøyen hovedgård | canonical_place | `toyen_hovedgard` | historie | resolved |
| Grønland kirke | canonical_place | `gronland_kirke` | religion | resolved |
| Vålerenga kirke | canonical_place | `valerenga_kirke` | religion | resolved |
| Klimahuset | canonical_place | `klimahuset` | vitenskap | resolved |
| KÖSK | canonical_place | `kosk_oslo` | kunst | resolved |
| Clemenskirkeruinen | canonical_place | `clemenskirken_ruin_oslo` | historie | resolved |
| FRIGO - Friluftssenter | canonical_place | `frigo_friluftssenteret` | sport | resolved |
| Galleri Mini | canonical_place | `galleri_mini_oslo` | kunst | resolved |
| Brannmuseet i Oslo | canonical_place | `brannmuseet_oslo` | historie | resolved |
| Central Jam-e-Mosque | canonical_place | `central_jam_e_mosque` | religion | resolved |
| Biblo Tøyen | canonical_place | `biblo_toyen` | litteratur | resolved |
| Sørenga | canonical_place | `sorenga` | by | resolved |
| Van Etten | canonical_place | `van_etten` | kunst | resolved |

## Closure rule

The bounded source pass is closed only when every non-null expected canonical place ID exists in the current runtime index and every remaining source row has an explicit non-place classification. This audit satisfies that rule.
