# People Oslo sport Bislett Stadion batch 3 validation

## Scope

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch3.json`
- `data/people/manifest.json`
- `reports/people-oslo-sport-bislett-stadion-batch-3-validation.md`
- `reports/people-oslo-sport-bislett-stadion-batch-3-research-notes.md`
- `reports/people-oslo-sport-bislett-stadion-batch-3-image-todo.md`

## People entries

| id | name | primary anchor | year | images |
| --- | --- | --- | --- | --- |
| `steve_cram` | Steve Cram | `bislett_stadion` | 1985 | empty strings |
| `said_aouita` | Saïd Aouita | `bislett_stadion` | 1985 | empty strings |
| `meseret_defar` | Meseret Defar | `bislett_stadion` | 2007 | empty strings |
| `tirunesh_dibaba` | Tirunesh Dibaba | `bislett_stadion` | 2008 | empty strings |
| `eric_heiden` | Eric Heiden | `bislett_stadion` | 1978 | empty strings |

## Local validation

- `python3 -m json.tool data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch3.json >/tmp/bislett_people_batch3.json`
- `python3 -m json.tool data/people/manifest.json >/tmp/people_manifest.json`
- `bash scripts/check-people.sh`

## Fix notes

- Batch 3 is listed immediately after Bislett Stadion batch 2 in `data/people/manifest.json`.
- The clean people check failure was the duplicate people ID guard. The manifest no longer includes standalone Nationaltheatret files for people already present in aggregate people files.
- All batch 3 entries keep `placeId` and first `places` item as `bislett_stadion`.
