# Oslo coordinate control batch 142 – Ljanselva ved Skullerud

- Canonical place: `ljanselva_skullerud`
- Valgt kildeobjekt: OSM way 27271638 – Ljanselva, alternativnavn Skullerudbekken
- Råkilde: https://api.openstreetmap.org/api/0.6/way/27271638/full
- Tidligere kandidatsett: `reports/oslo-coordinate-control-batch-112-ljanselva-route/nominatim-ljanselva_skullerud.json`
- Identitetskryssjekk: https://snl.no/Ljanselva

## Metode

Batch 112 fant fem eksakt navngitte Ljanselva-segmenter i den forhåndsdefinerte lokale scope-boksen og lot derfor stedet stå `needs_source`. Batch 142 bruker det eksisterende legacy-punktet bare til å disambiguere hvilken av de fem eksakte kildegeometriene den allerede definerte Skullerud-recorden viser til. Way 27271638 er den eneste kandidatens bounding box som omslutter dette scopepunktet, og way-en er i tillegg eksplisitt tagget med alternativnavnet `Skullerudbekken`.

Det nye canonical kartankeret er ikke legacy-punktet og ikke et nearest/first-hit-resultat. Det beregnes deterministisk som lengdemidtpunkt langs den fullstendige OSM way-geometrien og lagres som `verified_geometry`, `semantic_anchor` og `line_anchor`.
