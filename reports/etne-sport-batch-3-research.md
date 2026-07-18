# Etne sport batch 3 — research and duplicate gate

## Scope

Final completeness pass for additional canonical `sport` places in Etne municipality after sport batches 1–2.

Selected:

- `etne_pumptrack`
- `skakkeringen_etne`
- `osnes_discgolfbane`
- `skanevik_discgolf`

Current `main` was searched for these IDs, names and close variants before branch creation. No existing canonical place records were found.

## 1. Etne pumptrack

Sources:

- Shapers project page: https://www.shapers.no/prosjekter/etne-pumptrack
- Grannar, 15 June 2024: https://www.grannar.no/nyhende/flyg-hogt-pa-bmx-sykkel/153573
- Etne Cup activity programme: https://www.etnecup.no/helga/aktivitetar

Evidence:

- Shapers documents a dedicated pumptrack of more than 1,200 m² for bicycle, scooter and skateboard use.
- The project page gives the visitor address `Stadionvegen 12, 5590 Etne` and a dedicated Google Maps pin: https://maps.app.goo.gl/hiw8sPwALHFA8E5s8
- Grannar documents the official opening in June 2024 and explicitly says the new pumptrack/BMX facility lies close to both the skatepark and the artificial-turf pitch. This is important evidence that the pumptrack is a separate physical facility rather than merely another name for the skatepark.

Canonical decision:

Create a separate `sport` record. The integration must try to resolve the published Google Maps pin. If the pin cannot be resolved to a distinct geometry, the shared Stadionvegen 12 address anchor may only be used with explicit disclosure and a physical-overlap note.

## 2. Skakkeringen

Sources:

- Etne municipality, 2025 project presentation: https://www.etne.kommune.no/aktuelt/nyskapande-aktivitetsanlegg-i-fokus-da-etne-kommune-presenterte-skakkeringen-i-bergen.15502.aspx
- Norwegian Association of Landscape Architects project page: https://landskapsarkitektur.no/prosjekter/skakkeringen-i-etne
- More Sports project page: https://moresports.network/skakkeringen/?lang=en
- Tverga: https://tverga.no/et-loft-for-ungdommene-i-etne/

Evidence:

- NLA categorises the project as `Idrettsanlegg, sport, fritid`, gives build year 2024 and an area of about 3,000 m².
- The project is an outdoor activity facility with climbing/gymnastic elements, ball-game areas and flexible public-space functions.
- It is physically adjacent to, but not identical with, Skakke cultural centre.
- More Sports provides a dedicated Google Maps pin: https://maps.app.goo.gl/TV8s91piZFby7hDA8

Canonical decision:

Create a separate `sport` record for the outdoor activity facility. Do not merge it into `skakke_kultursenter_etne`, because the existing canonical place represents the building/institution while Skakkeringen is a separately designed outdoor activity landscape.

## 3. Osnes Discgolfbane

Source:

- UDisc course directory: https://udisc.com/courses/osnes-discgolfbane-R9iX

Evidence:

- 18-hole course.
- Established in 2022.
- Course begins in the Olav Vik foundation park and continues through mixed park/forest terrain.
- Documented course/start coordinate: `59.65026805681819, 5.900616945851397`.

Canonical decision:

Create a separate `sport` record despite the overlap with the wider Olav Vik property. `olav_vik_garden_osnes` represents literary heritage; the disc-golf course is a distinct recreational infrastructure layer.

## 4. Skånevik discgolf

Sources:

- UDisc course directory: https://udisc.com/courses/skanevik-discgolf-KnPP
- Etne municipality leisure listing: https://www.etne.kommune.no/mittetne/framside/fritidstilbod.14232.aspx

Evidence:

- 18-hole course.
- Established in 2023.
- Current course activity and 2026 league events are documented by UDisc.
- Documented course/start coordinate: `59.731508487142236, 5.91873060466142`.

Canonical decision:

Create a separate `sport` record, subject to integration-time distance checks against `skanevik_idrettsanlegg` and `skanevik_skatepark`.

## Deferred / rejected in this pass

### Skånevik outdoor shooting range

The outdoor range clearly exists: Skånevik Skyttarlag documents summer training on the outdoor range, and DFS/skytebaneguide lists an outdoor facility. However, an adequately precise and trustworthy physical anchor has not yet been located. Defer rather than invent coordinates.

### Etne Golfsimulator

Brønnøysund registers the organisation and subunit at `Strondavegen 30`, the same address as Skakke. No evidence found in this pass proves a physically distinct, independently mappable facility outside the already canonical Skakke complex. Consolidate for now.

### Etne pumptrack overlap note

The existing `etne_bmx_og_skatepark` record must remain distinct only if the published pumptrack pin resolves away from the existing skate/BMX anchor or if the shared-address relationship is explicitly documented. Grannar provides direct evidence that the new pumptrack/BMX course is close to the skatepark, supporting physical distinction.

## Batch-size decision

A four-place batch is justified. These are concrete, currently documented facilities with stable place-level identity. No additional weaker sports organisations or future/planned facilities are included.
