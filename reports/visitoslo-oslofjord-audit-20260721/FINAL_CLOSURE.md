# VisitOSLO Oslofjorden — final source closure

Date: 2026-07-21

Source: https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/omraader/oslofjorden/attraksjoner

## Final status

The bounded VisitOSLO Oslofjorden attractions audit is **closed**.

- Source rows captured: **12**
- Source rows resolved: **12 / 12**
- Physical canonical identities resolving the source rows: **15**
- Existing canonical identities reused: **4**
- New canonical identities produced: **11**
- Unresolved source rows: **0**
- Unresolved coordinate decisions: **0**
- Remaining canonical gaps: **0**

The canonical-identity count is larger than the source-row count because VisitOSLO bundles several separately named islands into two presentation rows. History Go preserves the actual physical identities instead of creating synthetic combined markers.

## Existing canonical coverage

- `gressholmen`
- `hovedoya_kloster`
- `hovedoya`
- `aker_brygge`

## New canonical coverage

### Oslo municipality — merged as coordinate batch 116 in PR #3114

- `heggholmen`
- `rambergoya`
- `ormoya`
- `malmoya`
- `nakholmen`
- `lindoya`
- `bleikoya`
- `ulvoya`

### Akershus — merged in county-correct paths in PR #3116

- `steilene` — Nesodden
- `langoyene` — Nesodden
- `ingierstrand_bad` — Nordre Follo

## Complete source-row resolution

| VisitOSLO row | Canonical resolution |
|---|---|
| Gressholmen, Heggholmen og Rambergøya | `gressholmen`, `heggholmen`, `rambergoya` |
| Klosterruinene på Hovedøya | `hovedoya_kloster` |
| Ormøya og Malmøya | `ormoya`, `malmoya` |
| Nakholmen | `nakholmen` |
| Steilene | `steilene` |
| Langøyene | `langoyene` |
| Lindøya | `lindoya` |
| Hovedøya | `hovedoya` |
| Aker Brygge | `aker_brygge` |
| Ingierstrand bad | `ingierstrand_bad` |
| Bleikøya | `bleikoya` |
| Ulvøya | `ulvoya` |

## Audit chain

1. **PR #3086** — physical scope closed: 12/12 source rows classified and 11 new stable physical candidates approved.
2. **PR #3101** — coordinate intake closed: 11/11 approved candidates coordinate-ready, 0 unresolved decisions.
3. **PR #3105** — History Go taxonomy and source roles locked.
4. **PR #3114** — eight Oslo municipality places produced and validated as Oslo coordinate batch 116.
5. **PR #3116** — three places outside Oslo municipality produced and validated in county-correct Akershus paths.

## Durable decisions

- Combined VisitOSLO rows are not copied as synthetic combined places when the source names several distinct physical islands.
- Heggholmen and Rambergøya remain separate named canonical identities even though the present landform is connected to neighbouring islands.
- Steilene remains one archipelago-level place in this source pass; individual islets require their own future inclusion case.
- Ingierstrand bad represents the complete named bathing complex, not merely the restaurant building.
- VisitOSLO's marketing geography never overrides physical county placement in the data tree.

Status: **SOURCE CLOSED — 12/12 RESOLVED, 0 GAPS.**
