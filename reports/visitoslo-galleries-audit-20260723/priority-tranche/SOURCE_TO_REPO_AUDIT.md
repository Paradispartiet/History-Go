# VisitOSLO Galleries — curated priority tranche source-to-repo audit

Date: 2026-07-23

Source: https://www.visitoslo.com/no/artikler/kunsthovedstaden/

This audit covers the **13 galleries explicitly surfaced in VisitOSLO's current “Flere kunstgallerier” editorial carousel**. It is a bounded fallback tranche, not a claim that the client-rendered Galleries category itself has been completely snapshotted.

## Machine summary

```json
{
  "deferred_by_existing_gallery_policy": 2,
  "existing_canonical": 5,
  "manual_review_potential_institutional_gap": 4,
  "commercial_gallery_policy_review_not_auto_gap": 2
}
```

| # | Source item | Policy class | Machine status | Exact canonical hit | Top fuzzy candidates |
|---|---|---|---|---|---|
| 1 | Fineart Oslo | already_deferred_private_commercial | deferred_by_existing_gallery_policy | — | oslo_s (0.333); oslo_bussterminal (0.333); oslo_domkirke (0.333); oslo_ladegard (0.333); oslo_hospital (0.333) |
| 2 | Fotografiens Hus | institutional_public_interest | existing_canonical | `fotografiens_hus` | fotografiens_hus (1.5); hoyesteretts_hus (0.333); kunstnernes_hus (0.333); dramatikkens_hus (0.333); dansens_hus_oslo (0.25) |
| 3 | Fotogalleriet | institutional_public_interest | manual_review_potential_institutional_gap | — | — |
| 4 | Kunsthall Oslo | institutional_public_interest | existing_canonical | `kunsthall_oslo` | kunsthall_oslo (1.5); oslo_s (0.333); oslo_bussterminal (0.333); oslo_domkirke (0.333); oslo_ladegard (0.333) |
| 5 | Kunstnerforbundet | institutional_public_interest | manual_review_potential_institutional_gap | — | — |
| 6 | Soft galleri: Norske tekstilkunstnere | institutional_public_interest | manual_review_potential_institutional_gap | — | galleri_map (0.2); purenkel_galleri (0.2); norske_love_horten (0.167); det_norske_teatret (0.167); galleri_mini_oslo (0.167) |
| 7 | Oslo Kunstforening | institutional_public_interest | manual_review_potential_institutional_gap | — | oslo_s (0.333); oslo_bussterminal (0.333); oslo_domkirke (0.333); oslo_ladegard (0.333); oslo_hospital (0.333) |
| 8 | VI, VII | private_commercial_review | existing_canonical | `vi_vii_gallery` | vi_vii_gallery (1.167); lisbon_parque_eduardo_vii (0.2) |
| 9 | Galleri K | private_commercial_review | commercial_gallery_policy_review_not_auto_gap | — | galleri_map (0.333); purenkel_galleri (0.333); galleri_mini_oslo (0.25) |
| 10 | Galleri Haaken | already_deferred_private_commercial | deferred_by_existing_gallery_policy | — | galleri_map (0.333); purenkel_galleri (0.333); galleri_mini_oslo (0.25) |
| 11 | Buer Gallery | private_commercial_review | commercial_gallery_policy_review_not_auto_gap | — | tbs_gallery (0.333); vi_vii_gallery (0.25); the_oslo_gallery (0.25) |
| 12 | KÖSK | institutional_or_scene_space | existing_canonical | `kosk_oslo` | kosk_oslo (1) |
| 13 | Van Etten | private_commercial_review | existing_canonical | `van_etten` | van_etten (1.5) |

## Manual review gate

Only potential institutional gaps proceed to independent research. Private/commercial galleries are never auto-approved as missing canonical places. Existing defer decisions remain binding until a consistent gallery-inclusion policy explicitly changes them.
