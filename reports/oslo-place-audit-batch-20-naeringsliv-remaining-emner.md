# Oslo place-audit batch 20 — næringsliv remaining emner

**Dato:** 2026-05-29

## Formål

Batch 20 verifiserer de gjenværende `em_naering_*`-manglene etter Batch 19. Scope er konservativt: avgjøre om ID-ene er fullverdige næringslivsemner som bør gjøres canonical nå, eller om de er legacy/place-varianter som bør vente på en senere, eksplisitt place-migrering eller alias-/mapping-struktur.

## Kommandoer kjørt

- `npm run places:emner:check`
- `jq '.missing[] | select(.emne_id|startswith("em_naering_"))' reports/place-emne-missing-audit-batch-12.json 2>/dev/null || head -80 reports/place-emne-missing-audit-batch-12.json`
- `rg -n "em_naering_(logistikk_handel_flyt|lager_terminal_infrastruktur|havn_sjofart|telekom_infrastruktur|modernisering_teknologi|transport_infrastruktur)" data/fag/naeringsliv reports data/places/naeringsliv/oslo/places_naeringsliv.json`
- `sed -n '1,220p' reports/oslo-place-audit-batch-09-naeringsliv-emner.md`
- `sed -n '1,220p' reports/oslo-place-audit-batch-10b-revert-naeringsliv-aliases.md`
- `sed -n '1,240p' tools/check_place_emne_ids.mjs`
- `python3 - <<'PY' ...` for å liste canonical `emne_id`-er i `data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json`
- `rg -n "canonical_alias|alias_of|canonical_status|em_naering_" data/fag/naeringsliv tools/check_place_emne_ids.mjs reports/oslo-place-audit-batch-10b-revert-naeringsliv-aliases.md reports/oslo-place-audit-batch-09-naeringsliv-emner.md`
- `npm run places:index:check`
- `npm run health:places`
- `git status --short`

## Filer undersøkt

- `reports/oslo-place-audit-batch-12-current-missing-emne-ids.md`
- `reports/place-emne-missing-audit-batch-12.json`
- `reports/oslo-place-audit-batch-09-naeringsliv-emner.md`
- `reports/oslo-place-audit-batch-10b-revert-naeringsliv-aliases.md`
- `reports/oslo-place-audit-batch-19-media-remaining-emner.md`
- `tools/check_place_emne_ids.mjs`
- `data/fag/naeringsliv/SET_MAL_README_naeringsliv_v4_3.md`
- `data/fag/naeringsliv/emnemapping_naeringsliv_canonical_v4_5.json`
- `data/fag/naeringsliv/emner_naeringsliv2.json`
- `data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json`
- `data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json`
- `data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json`
- `data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json`
- `data/fag/naeringsliv/quiz_generator_rules_naeringsliv_v5_1_source_priority_patch.json`
- `data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json`
- `data/places/naeringsliv/oslo/places_naeringsliv.json` — kun brukt som kontekst, ikke endret.

## Missing `em_naering_*` før batchen

Før batchen rapporterte `npm run places:emner:check` 16 missing `emne_ids` totalt. Av disse var sju forekomster i næringsliv-familien, fordelt på seks unike ID-er:

| emne_id | Forekomster | Place-filer | Eksempel-place-id-er | Sannsynlig årsak | Berørt av PR #663 / Batch 10b? |
| --- | ---: | --- | --- | --- | --- |
| `em_naering_logistikk_handel_flyt` | 2 | `data/places/naeringsliv/oslo/places_naeringsliv.json` | `havnelageret`, `tollbukaia` | Legacy/place-variant for logistikk og vareflyt. Det finnes allerede bredere canonical dekning i `em_naering_logistikk_verdikjeder` og Batch 09-emnet `em_naer_geografi_infrastruktur`, men samme ID finnes ikke som fullverdig objekt. | Ja |
| `em_naering_lager_terminal_infrastruktur` | 1 | `data/places/naeringsliv/oslo/places_naeringsliv.json` | `havnelageret` | Legacy/place-variant for lager-/terminalfunksjoner. Dekkes faglig av `em_naer_geografi_infrastruktur` og delvis `em_naering_havn_transport`, men samme ID finnes ikke som fullverdig objekt. | Ja |
| `em_naering_havn_sjofart` | 1 | `data/places/naeringsliv/oslo/places_naeringsliv.json` | `tollbukaia` | Legacy/place-variant med smalere/eldre navn enn canonical `em_naering_havn_transport`. | Ja |
| `em_naering_telekom_infrastruktur` | 1 | `data/places/naeringsliv/oslo/places_naeringsliv.json` | `telegrafbygningen` | Legacy/place-variant for telekom som underkategori av teknologi- og informasjonsinfrastruktur. Dekkes bredere av `em_naering_teknologi_infrastruktur`, men samme ID finnes ikke som fullverdig objekt. | Ja |
| `em_naering_modernisering_teknologi` | 1 | `data/places/naeringsliv/oslo/places_naeringsliv.json` | `telegrafbygningen` | Legacy/place-variant / navnevariant for teknologisk modernisering. Overlapper `em_naering_innovasjon_teknologisk_skift` og `em_naering_teknologi_infrastruktur`, men samme ID finnes ikke som fullverdig objekt. | Ja |
| `em_naering_transport_infrastruktur` | 1 | `data/places/naeringsliv/oslo/places_naeringsliv.json` | `jernbaneverkstedet_lodalen` | Legacy/place-variant for transportinfrastruktur. Dekkes bredere av `em_naering_havn_transport` og `em_naer_geografi_infrastruktur`, men samme ID finnes ikke som fullverdig objekt. | Ja |

## Kontroll mot PR #663 / Batch 10b

Alle seks gjenværende `em_naering_*`-ID-er er de samme ID-ene som Batch 10b eksplisitt fjernet som korte `canonical_alias`-poster etter PR #663:

- `em_naering_havn_sjofart`
- `em_naering_lager_terminal_infrastruktur`
- `em_naering_logistikk_handel_flyt`
- `em_naering_modernisering_teknologi`
- `em_naering_telekom_infrastruktur`
- `em_naering_transport_infrastruktur`

Batch 20 gjeninnfører derfor ikke disse som aliaser, korte canonical-poster eller mini-schema. `tools/check_place_emne_ids.mjs` er fortsatt en enkel canonical-sjekk uten aliaslogikk.

## Søk i næringsliv-fagdata

- Alle seks ID-er ble søkt i `data/fag/naeringsliv/**`.
- Ingen av ID-ene finnes som fullverdig objekt med samme `emne_id` i `emner_naeringsliv2.json` eller `emner_naeringsliv_canonical_v4_5.json`.
- ID-ene forekommer i næringsliv-scope som tidligere rapporterte/tilbakeførte alias- eller missing-ID-er, og som place-referanser i `data/places/naeringsliv/oslo/places_naeringsliv.json`.
- Eksisterende fullverdige canonical mål som er relevante, men ikke identiske, er særlig:
  - `em_naering_havn_transport`
  - `em_naering_logistikk_verdikjeder`
  - `em_naering_teknologi_infrastruktur`
  - `em_naering_innovasjon_teknologisk_skift`
  - `em_naer_geografi_infrastruktur`

## Fullverdige emner fra før

Ingen av de seks undersøkte `em_naering_*`-ID-ene fantes fullverdig fra før med samme ID. Det fantes derimot fullverdige bredere canonical-emner som faglig overlapper flere av place-variantene. Siden place-data ikke skal migreres i denne batchen, ble disse ikke brukt til å endre `emne_ids` i place-filene.

## Gjort canonical

Ingen eksisterende ikke-canonical fullobjekter ble gjort canonical i Batch 20. Å legge inn disse seks ID-ene som korte canonical poster ville gjentatt alias-retningen fra PR #663, og å splitte dem til seks nye fullverdige emner ville gitt kunstig smale emner som allerede er dekket av eksisterende canonical struktur.

## Opprettet som fullverdige nye emner

Ingen nye canonical næringsliv-emner ble opprettet i Batch 20. Vurderingen er at alle seks ID-er er legacy/place-varianter eller eldre navnevarianter, ikke selvstendige fullverdige emner som bør etableres uten samtidig place-migrering.

## Utsatt

Alle seks `em_naering_*`-ID-er ble utsatt:

| emne_id | Hvorfor utsatt | Mulig senere håndtering |
| --- | --- | --- |
| `em_naering_logistikk_handel_flyt` | Samme ID finnes ikke som fullverdig emne; overlapper eksisterende logistikk-/geografi-emner. | Vurder place-migrering til `em_naering_logistikk_verdikjeder` og/eller `em_naer_geografi_infrastruktur`. |
| `em_naering_lager_terminal_infrastruktur` | Smal place-variant for lager/terminal; ikke fullverdig eksisterende objekt. | Vurder place-migrering til `em_naer_geografi_infrastruktur` eventuelt sammen med `em_naering_havn_transport`. |
| `em_naering_havn_sjofart` | Eldre/smalere navn enn canonical havn/transport-emne. | Vurder place-migrering til `em_naering_havn_transport`. |
| `em_naering_telekom_infrastruktur` | Underkategori av teknologi-/informasjonsinfrastruktur, men ikke fullverdig canonical objekt. | Vurder place-migrering til `em_naering_teknologi_infrastruktur`. |
| `em_naering_modernisering_teknologi` | Navnevariant som overlapper modernisering/innovasjon/teknologisk skift. | Vurder place-migrering til `em_naering_innovasjon_teknologisk_skift` og/eller `em_naering_teknologi_infrastruktur`. |
| `em_naering_transport_infrastruktur` | Infrastrukturvariant som overlapper eksisterende transport-, havn- og økonomisk geografi-emner. | Vurder place-migrering til `em_naering_havn_transport` og/eller `em_naer_geografi_infrastruktur`. |

## Legacy/place-variant eller feil prefix

Alle seks vurderes som legacy/place-varianter, ikke feil fagfamilie-prefix. De peker på reelle næringslivstema, men ID-navnene ser ut til å være eldre place-spesifikke varianter som bør ryddes ved senere migrering av place-data, ikke ved å gjeninnføre alias- eller placeholder-emner.

## Bekreftelse: ingen place-filer endret

Ingen filer under `data/places/**` ble endret i Batch 20. `data/places/places_index.json`, manifest, UI, CSS, HTML og JS ble heller ikke endret. `git status --short` viste kun den nye Batch 20-rapporten som sporbar endring, samt en urelatert, utracket `node_modules/`-katalog som ikke er del av batchen.

## Bekreftelse: alias-schema ikke gjeninnført

Batch 20 la ikke inn `canonical_alias`, `alias_of`, `canonical_alias`-poster eller korte placeholder-emner. PR #663-aliasretningen ble ikke gjeninnført.

## Før/etter — `npm run places:emner:check`

### Før

- Active place files: 40
- Canonical emne files scanned: 15
- Canonical emne ids loaded: 991
- Missing emne_ids: 16
- Gjenværende `em_naering_*`: 7 forekomster / 6 unike ID-er
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

### Etter

- Active place files: 40
- Canonical emne files scanned: 15
- Canonical emne ids loaded: 991
- Missing emne_ids: 16
- Gjenværende `em_naering_*`: 7 forekomster / 6 unike ID-er
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

`npm run places:emner:check` avslutter fortsatt med exit code 1 fordi 16 missing ID-er gjenstår utenfor det som ble trygt canonical-ryddet i denne batchen. Næringsliv-ID-ene ble med vilje ikke redusert, fordi de seks gjenstående ID-ene er de tidligere PR #663 / Batch 10b-aliasvariantene.

## Resultat — `npm run places:index:check`

Resultat: OK — `places_index.json is in sync with source place files.`

## Resultat — `npm run health:places`

Resultat:

- Files checked: 40
- Places checked: 470
- Hidden places: 0
- Stub places: 0
- Canonical emne files checked: 16
- emne_ids checked: 1049
- Canonical emne_ids: 1033
- Unknown emne_ids: 16
- Wrong-prefix emne_ids: 306
- Errors: 0
- Warnings: 1339

## Anbefalt Batch 21

Anbefalt Batch 21: ta en av de gjenværende ikke-næringsliv-klyngene som ikke krever place-migrering. Natur-klyngen peker seg ut med flere Oslo-forekomster (`em_nat_by_natur_motepunkt`, `em_nat_okologi_grenser`, `em_natur_kyst_okosystemer`, `em_natur_friluftsliv_helse`) og bør verifiseres konservativt mot eksisterende natur-canonical før eventuelle fullverdige emner opprettes. Næringslivsvariantene bør vente til en egen, eksplisitt place-migreringsbatch der place-`emne_ids` kan byttes til eksisterende canonical mål uten alias-schema.
