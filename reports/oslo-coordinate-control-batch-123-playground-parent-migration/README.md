# Oslo coordinate control batch 123 – playground/training parent migration

Seven pure playground/training subfeature records are removed as independent active places and their Wonderkammer content is retargeted to existing canonical parent places.

## Migrated
- `lekeplass_sofienbergparken` → Wonderkammer under `sofienbergparken_subkultur`
- `lekeplass_st_hanshaugen` → Wonderkammer under `st_hanshaugen_park`
- `lekeplass_birkelunden` → Wonderkammer under `birkelunden`
- `lekeplass_olaf_ryes_plass` → Wonderkammer under `olaf_ryes_plass`
- `lekeplass_botsparken` → Wonderkammer under `botsparken`
- `lekeplass_stensparken` → Wonderkammer under `stensparken`
- `treningssted_skur13` → Wonderkammer under `skur13`

## Still requires manual identity/parent review
- `lekeplass_kirsebarlunden`
- `lekeplass_snippen`
- `lekeplass_frognerborgen`
- `lekeplass_kampen_park`
- `aktivitet_rudolf_nilsens_plass`
- `treningssted_torshovdalen`
- `treningssted_kampen_park`
- `treningssted_sognsvann`

Frognerborgen and both Kampen activity layers remain open because the older audit referenced non-existent current parent IDs. Korketrekkeren remains already controlled. The affected Civication mapping and all exact active legacy-ID references are validated in scope.
