# Oslo People zero-gap batch 8 – validation

Generated: 2026-07-25T10:42:11.019Z

## Audit correction

- Place JSON and People JSON now use separate shape parsers.
- Single-record People objects are resolved as people before their `places` relation array is inspected.
- Regression coverage explicitly verifies Elina Krantz, Aud Schønemann and Harald Eia from manifest-listed single-record files.

## Fresh bounded baseline

- Required non-nature Oslo places: **428**
- Covered required places: **197**
- Uncovered required places: **231**
- Logical People: **1358**
- Uncovered scenekunst places: **9**

## Target mapping

- `black_box_teater` → new `inger_buresund`
- `dansens_hus_oslo` → new `randi_urdal`
- `det_andre_teatret_intimscenen` → existing `nils_petter_morland` extended
- `kloden_teater_pilotscenen` → new `aadne_sekkelsten`
- `oslo_nye_teater_hovedscenen` → existing `toralv_maurstad` extended
- `riksscenen` → new `jan_lothe_eriksen`
- `rommen_scene` → new `erik_aldner`
- `salt_oslo` → new `erlend_mogard_larsen`
- `vega_scene` → new `katinka_rydin_berge`

## Final state

- Required non-nature Oslo places: **428**
- Covered required places: **206**
- Uncovered required places: **222**
- Logical People: **1365**
- Scenekunst coverage: **complete (0 uncovered)**
- New canonical People: **7**
- Reused canonical People: **2**
- Duplicate candidate IDs/names before materialization: **0**
- Invalid People refs: **0**

## Research gate

- Inger Buresund developed Black Box teater into a programming theatre and became its first theatre director.
- Randi Urdal led the long institutional process that realized Dansens Hus.
- Ådne Sekkelsten led the Kloden theatre project and its Pilotscenen phase.
- Jan Lothe Eriksen was the initiator and first director of Riksscenen.
- Erik Aldner was the general manager at Rommen Scene during its opening phase.
- Erlend Mogård-Larsen co-founded SALT and leads the Langkaia culture arena.
- Katinka Rydin Berge co-founded the theatre at Vega Scene and serves in its artistic leadership.
- Nils Petter Mørland and Toralv Maurstad are reused only for explicitly documented institutional subscene relations.

## Validation gates

- `scripts/check-people.sh`: **pass**
- `audit:categories`: **pass**
- `civication:history-people:check`: **pass**
- `typecheck:tools`: **pass**
- `typecheck:scripts`: **pass**
- single-record parser regression: **pass**
- `health:data`: **pass**
- `git diff --check`: **pass**
- changed coordinate/place source files: **0**

## Runner scope note

- The repository-wide coordinate-evidence audit is recorded by the runner but is non-blocking for this People-only batch because the branch changes no place or coordinate-evidence source files.
