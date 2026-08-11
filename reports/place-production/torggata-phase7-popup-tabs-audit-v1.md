# Torggata – fase 7 popupfaner audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Canonical place: `data/places/by/oslo/places/torggata.json`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Produksjonsrekkefølge: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Runtime: `js/ui/place-popup-v2.js` + `js/ui/place-popup-tabs.js`
- Baseline: fase 6 merget i PR #4816, merge `e155aea8b0717c623a1de9904dcc253e8820f356`
- Status: **AUDIT FERDIG – fase 7 er ikke samlet godkjent**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: fase 5 description package + fase 6 strukturerte profiler er merget og skal bevares
EKSISTERENDE POPUPARBEID: tab-runtime, Torggata-leksikon, én canonical Story, for_na, Lesespor og externalLinks finnes allerede
BESLUTNING: REELT AUDITARBEID – ikke produser åtte nye faner; klassifiser eksisterende canonical eiere og rett bare konkrete hull
```

## Korrigert runtimeforståelse

Fase-6-profilene er **ikke generelt frakoblet popupen**.

`place-popup-v2.js` renderer allerede:

- `spatial_profile` via `renderSpatialSection()`;
- `subplaces` via `renderSubplacesSection()`;
- `history_layers` via `renderHistoryTimeline()`;
- `source_summary` via `renderSourceSummary()`.

`place-popup-tabs.js` flytter deretter disse seksjonene til korrekt panel: spatial/subplaces til Om, history_layers til Historie og source_summary til Kilder.

Det konkrete runtimehullet er smalere: `temporalProfile(place)` finnes som helper i `place-popup-v2.js`, men dagens popupkode har ingen egen renderer som bruker `temporal_profile`.

## Fanestatus

| Fane | Status etter audit | Evidens / beslutning |
| --- | --- | --- |
| Om | **TRENGER ARBEID – 7A** | Fase-5 `popupDesc` og fase-6 spatial/subplaces vises, men Torggatas legacy Leksikon-hovedartikkel/fact er ukildet og generisk og blir lagt inn som ekstra Om-innhold. `temporal_profile` presenteres ikke. |
| Historie | **TRENGER ARBEID – 7B** | Fase-6 `history_layers` vises, men Leksikons chronology består av én generisk, ukildet «Senmodernitet»-post. Canonical chronology må re-auditeres/kildebygges uten å gjøre Stories til tidslinje. |
| Fortellinger | **TRENGER ARBEID – 7C** | `data/stories/stories_torggata.json` er aktivt manifestregistrert og har en tydelig narrativ transformasjonsakse, men bruker legacy-type `urban_change`, som ikke finnes i dagens `story_types.json`, og `next_scenes` til Markveien er tematisk snarere enn klart narrativt. Storyen må re-auditeres mot dagens governance; ikke erstattes med mange milepæl-Stories. |
| Før/etter | **TRENGER ARBEID – 7D** | `for_na` finnes, men kildene inkluderer interne History GO-/Wonderkammer-formuleringer som ikke kan være selvstendig faktabevis. Ingen kontrollert før-/nå-bildepar med attribusjon er registrert. |
| Nyheter | **BEGRUNNET N/A** | Repo- og Leksikon-søk fant ingen canonical Torggata-notiser som bør produseres som Nyheter nå. Tomtilstand er bedre enn filler. Nyheter gjenåpnes bare ved dokumentert relevant notis. |
| Lesespor | **BEGRUNNET N/A** | Eksisterende Torggata-koblinger i Oslo-Lesespor er Aftenposten-tekster med `access: subscription`. Runtime filtrerer betalingsmur/subscription fra den stedlige åpne Lesespor-flaten. Ingen åpent, direkte lesbart Torggata-spor er dokumentert i denne auditen. |
| Kilder | **TRENGER ARBEID – 7E** | Fase 6 gir sikre source labels og place har to HTTPS `externalLinks`, men flere sikre fase-5/6-kilder er bare labels i UI og ikke direkte inspectable lenker. Kilder-fanen skal få dedupliserte brukerrettede HTTPS-lenker uten interne audit-/researchspor. |
| Mer | **BEGRUNNET N/A** | Torggata finnes ikke i Språkleksikon-manifestet, og auditen fant ingen særskilt canonical observations-/språk-/interpretation-pakke som må vises her. Mer skal ikke fylles med handlinger, legacy Wonderkammer eller fysiske Objects. |

## 7A – Om: konkret restarbeid

Om-fanen har allerede riktig hovedartikkel fra fase 5 og relevante place-profiler fra fase 6. Restarbeidet er derfor **sanering og presentasjon**, ikke ny stedsartikkel:

1. behold `desc`/`popupDesc` uendret;
2. behold `spatial_profile` og `subplaces`;
3. hindre ukildet/generisk legacy-Leksikonstoff i å svekke den godkjente Om-flaten;
4. avgjør minste korrekte presentasjon av `temporal_profile` uten å bygge en parallell chronology;
5. legg regresjonstest som viser at Torggatas Om-fane inneholder canonical stedartikkel/profil og ikke den gamle generiske gentrifiseringsteksten som selvstendig faktalag.

## 7B – Historie: konkret restarbeid

- behold fase-6 `history_layers`;
- erstatt eller fjern den ukildede generiske Leksikon-chronology-posten;
- bygg chronology bare av korte, daterte og kildebårne milepæler;
- ikke kopier Storyen mekanisk inn i chronology.

## 7C – Fortellinger: konkret restarbeid

- behold den dokumenterte narrative hovedideen om gateombyggingen;
- vurder migrasjon til dagens canonical story-type og `episode_v1` bare dersom det gjøres som en reell story-revisjon;
- vurder/fjern `next_scenes` dersom Markveien ikke er en faktisk narrativ fortsettelse;
- kjør `npm run check:stories` ved enhver endring.

## 7D – Før/etter: konkret restarbeid

- ekstern kildebase må erstatte interne History GO/Wonderkammer-kilder som faktagrunnlag;
- før-/nå-bilder skal vise samme meningsfulle stedssammenligning;
- kilde, lisens/attribusjon og `change` må være inspectable.

## 7E – Kilder: konkret restarbeid

Kilder-fanen skal samle sikre, dedupliserte HTTPS-oppslag fra canonical brukerrettede felter. Aktuelle allerede verifiserte eksterne familier inkluderer Oslo byleksikon, Oslo kommune/Bymiljøetaten, Sceneweb, Oslo Byarkiv, SNL, Eldorado/ARK og OSM for ren geometri. Interne place-production-rapporter skal ikke vises som brukerrettede kilder.

## Delstegrekkefølge

Fase 7 deles videre i små PR-er:

```text
7 audit → 7A Om → 7B Historie → 7C Fortellinger → 7D Før/etter → 7E Kilder
```

Nyheter, Lesespor og Mer er allerede vurdert og får begrunnet N/A i denne fasen. De skal ikke produseres bare for å fylle faner.

Fase 7 som helhet settes først **GODKJENT** når 7A–7E er ferdige, relevante CI-/runtimeporter er grønne, og siste resultat er kontrollert på faktisk `main`.
