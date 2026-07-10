# Address-first coordinate batch 1 apply real

Applied Geonorge address batch 1 coordinates using only `reports/geonorge-address-batch-1/*.json` as source.

Validation requirements:

- `ok: true`
- `status: verified_candidate`
- `coordinate` object used as authority
- `coordVerifiedAt: 2026-07-10` added to each updated place

| placeId | source file | lat | lon | sourceObjectId |
|---|---|---:|---:|---|
| `astrup_fearnley` | `data/places/kunst/oslo/places_kunst.json` | 59.90679078788014 | 10.721563360663236 | `geonorge-adresser-v1:0301:21458:2` |
| `deichman_bjorvika` | `data/places/by/oslo/places_by.json` | 59.90868907082338 | 10.75212918471088 | `geonorge-adresser-v1:0301:21670:1` |
| `deichman_grunerlokka` | `data/places/litteratur/oslo/places_litteratur.json` | 59.920789784433865 | 10.760221823170998 | `geonorge-adresser-v1:0301:16240:10` |
| `munch_museet` | `data/places/kunst/oslo/places_kunst.json` | 59.90610626117622 | 10.75534950637971 | `geonorge-adresser-v1:0301:21680:1` |
| `nasjonalbiblioteket` | `data/places/litteratur/oslo/places_litteratur.json` | 59.91429565254146 | 10.717362462417718 | `geonorge-adresser-v1:0301:21471:110` |
| `nasjonalmuseet` | `data/places/kunst/oslo/places_kunst.json` | 59.91149437954434 | 10.729109219868187 | `geonorge-adresser-v1:0301:18199:3` |
| `nrk_huset_marienlyst` | `data/places/media/oslo/places_oslo_media.json` | 59.934722555717045 | 10.719662425687908 | `geonorge-adresser-v1:0301:10722:1` |
| `vg_huset` | `data/places/media/oslo/places_oslo_media.json` | 59.91512243824226 | 10.743666267309775 | `geonorge-adresser-v1:0301:10069:55` |

No live Geonorge lookups were performed. `data/places/places_index.json` was not hand-edited.
