# Etne sport batch 1 — research and editorial audit

## Scope

This batch adds five concrete, physically distinct sport anchors in Etne municipality:

- `etne_idrettsanlegg`
- `steinsvollen_fotballanlegg`
- `engebanen_etne`
- `skanevik_idrettsanlegg`
- `etne_bmx_og_skatepark`

Current `main` was searched before creation for the selected IDs, names and relevant variants. No existing canonical place records were found.

## Sources and candidate decisions

### Etne idrettsanlegg

Sources:

- Norges Fotballforbund, Etne idrettsanlegg: https://www.fotball.no/fotballdata/anlegg/hjem/?fiksId=10592
- Norges Fotballforbund, Etne stadion: https://www.fotball.no/fotballdata/anlegg/hjem/?fiksId=5963
- Etne Cup, Banar: https://www.etnecup.no/cup-info/banar
- Etne IL, Om Etne IL: https://www.etneil.no/om-etne-il
- Etne IL, Anlegg i Etne 2035: https://www.etneil.no/verktoykasse/anlegg-2035

NFF registers Etne stadion and Etne kunstgress as parts of the same main facility, with address Stadionvegen 36. Etne Cup likewise uses the grass and artificial-turf surfaces as core tournament pitches. Etne IL's facility planning also treats the running track around the stadium as part of the same activity environment.

Editorial decision: one canonical `etne_idrettsanlegg` record represents the main physical complex. Do not create separate canonical places for every 7er/9er subdivision, Etne stadion and Etne kunstgress.

Coordinate plan: resolve Stadionvegen 36 through Kartverket/Geonorge address API.

### Steinsvollen fotballanlegg

Sources:

- Etne Cup, Banar: https://www.etnecup.no/cup-info/banar
- Etne Cup, Turneringsreglar: https://www.etnecup.no/cup-info/turneringsreglar

Etne Cup lists several match surfaces on Steinsvollen and describes the area as a separate tournament location about five minutes from the main area.

Editorial decision: one canonical Steinsvollen football-area record, not one record per tournament pitch marking.

Coordinate plan: resolve the local Steinsvollen through Kartverket Stedsnavn API with municipality number 4611. Reject unrelated namesakes outside Etne.

### Engebanen

Sources:

- Etne Cup, Banar: https://www.etnecup.no/cup-info/banar
- Etne IL, Anlegg i Etne 2035: https://www.etneil.no/verktoykasse/anlegg-2035

Etne Cup lists Enge as a separate grass-pitch area with several match surfaces. Etne IL's 2035 facility work also refers separately to Engebanen.

Editorial decision: one canonical Enge football-area record. Do not split temporary tournament subdivisions into separate places.

Coordinate plan: first search Kartverket Stedsnavn for Engebanen or Enge-related sport names inside Etne municipality. If no unambiguous pitch point exists, an official Enge-area/address point may only be used as an explicitly disclosed representative anchor.

### Skånevik idrettsanlegg

Sources:

- NFF, Skånevik stadion: https://www.fotball.no/fotballdata/anlegg/hjem/?fiksId=789
- NFF, Skånevik Kunstgras 9er: https://www.fotball.no/fotballdata/anlegg/hjem/?fiksId=792

NFF registers both the natural-grass Skånevik stadion and the artificial-turf pitches under the same main facility, `Skånevik idrettsanlegg`, on Strondavegen.

Editorial decision: consolidate the outdoor football complex into one canonical record. This is a different physical/function object from the already canonical indoor `skanevik_kultur_og_idrettshall` record.

Coordinate plan: resolve Skånevik idrettsanlegg / Skånevik stadion through Kartverket Stedsnavn in municipality 4611. If only a representative area point is available, disclose that explicitly. Never silently reuse the indoor hall address as an exact outdoor-pitch coordinate.

### Etne BMX- og skatepark

Sources:

- Brønnøysundregistrene: https://virksomhet.brreg.no/nb/oppslag/enheter/899086112
- Etne kommune, fritidstilbod: https://www.etne.kommune.no/mittetne/framside/fritidstilbod.14232.aspx
- Etne kommune, idrett og friluftsliv: https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/
- Etne IL, Anlegg i Etne 2035: https://www.etneil.no/verktoykasse/anlegg-2035

Brønnøysund registers Etne BMX og Skatepark at Stadionvegen 12 with industry code for operation of sports facilities. Municipal and local-sport sources also treat BMX/skate as a distinct activity environment.

Editorial decision: retain as a separate canonical sport place even though it is in the broader Stadionvegen corridor, because it is a distinct physical facility and activity type from the football/friidrett main complex.

Coordinate plan: resolve Stadionvegen 12 through Kartverket/Geonorge address API and audit its distance from `etne_idrettsanlegg`.

## Wider sport context

Etne municipality currently describes a local facility landscape including two sports halls, two skate parks, one pumptrack, two outdoor sports facilities and an artificial-turf pitch. Etne IL describes football, gymnastics, tennis, climbing, athletics, floorball and handball as part of its activity portfolio and identifies Etne Cup as a major recurring local sports event.

Sources:

- https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/
- https://www.etneil.no/om-etne-il

## Deferred candidate

`Etne tennisanlegg` is a credible possible batch-2 candidate. Etne IL documents two Playrite Clayrite courts, but this batch prioritizes the five strongest and most distinct sport environments first.

## Integration gates

Before merge:

1. Resolve the two exact address anchors through Kartverket/Geonorge.
2. Resolve or explicitly disclose representative anchors for Steinsvollen, Engebanen and Skånevik idrettsanlegg.
3. Register exactly the five source files in `data/places/manifest.json`.
4. Rebuild `data/places/places_index.json`.
5. Run full place validation, split-manifest audit and coordinate-quality gate.
6. Verify every new ID appears exactly once in active runtime and global duplicate active place IDs remain zero.
7. Audit that the five places remain physically/functionally distinct and that Skånevik outdoor facilities are not duplicated by the existing indoor hall record.
