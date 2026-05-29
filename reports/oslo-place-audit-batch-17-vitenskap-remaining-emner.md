# Oslo place-audit batch 17 — vitenskap remaining emner

**Dato:** 2026-05-29

## Formål
Batch 17 kartla alle gjenværende `em_vit_*` som fortsatt var missing etter Batch 16, og gjorde bare vitenskap-emner med konkret stedlig og faglig forankring synlige i canonical vitenskap-emnefil.

## Kommandoer kjørt
- `npm run places:emner:check` (før)
- `rg -n "em_vit_" ...` i rapporter og vitenskap-fagdata
- `node -e "JSON.parse(require('fs').readFileSync('data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json','utf8')); console.log('json ok')"`
- `npm run places:emner:check` (etter)
- `npm run places:index:check`
- `npm run health:places`
- `git diff --name-only`
- `git status --short`

## Filer undersøkt
- `reports/oslo-place-audit-batch-12-current-missing-emne-ids.md`
- `reports/place-emne-missing-audit-batch-12.json`
- `reports/oslo-place-audit-batch-11-vitenskap-emner.md`
- `reports/oslo-place-audit-batch-16-musikk-canonical-emner.md`
- `tools/check_place_emne_ids.mjs`
- `data/fag/vitenskap/SET_MAL_README_vitenskap_v4_3.md`
- `data/fag/vitenskap/vitenskappensum_canonical_v4_5.json`
- `data/fag/vitenskap/fagkart_vitenskap_canonical_v4_5.json`
- `data/fag/vitenskap/supersetQUIZMAL_vitenskap.json`
- `data/fag/vitenskap/quiz_generator_rules_vitenskap_v5_1_source_priority_patch.json`
- `data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json`
- `data/fag/vitenskap/emnemapping_vitenskap_canonical_v4_5.json`
- `data/fag/vitenskap/methods_vitenskap_canonical_v4_5.json`
- `data/places/vitenskap/oslo/places_vitenskap.json` kun som kontekst

## Missing `em_vit_*` før batchen
Før endring rapporterte `npm run places:emner:check` **44** missing `emne_ids` totalt. Av disse var **20 forekomster / 9 unike** `em_vit_*` i `data/places/vitenskap/oslo/places_vitenskap.json`:

| Emne-ID | Forekomster | Place-fil | Eksempel-place-id-er | Sannsynlig årsak |
| --- | ---: | --- | --- | --- |
| `em_vit_kunnskap_formidling_utdanning` | 6 | `data/places/vitenskap/oslo/places_vitenskap.json` | `gamlebyen_skole`, `naturhistorisk_museum`, `teknisk_museum`, `rikshospitalet`, `oslo_met_pilestredet`, `arkitektur_og_designhogskolen` | Stedlig vitenskapsformidling/utdanning fantes som praksis i places, men ikke som eksakt canonical emne-ID. |
| `em_vit_feltarbeid_observasjon` | 3 | `data/places/vitenskap/oslo/places_vitenskap.json` | `tvergastein`, `botanisk_hage`, `meteorologisk_institutt` | Fullverdig felt-/observasjonsbehov, nær eksisterende `em_vit_feltarbeid`, men place-ID-en manglet canonical objekt. |
| `em_vit_miljo_okologi_system` | 3 | `data/places/vitenskap/oslo/places_vitenskap.json` | `tvergastein`, `naturhistorisk_museum`, `botanisk_hage` | Stedlig miljø-/økologisystem koblet til naturvitenskapelige institusjoner; eksakt ID manglet. |
| `em_vit_teknologi_innovasjon` | 2 | `data/places/vitenskap/oslo/places_vitenskap.json` | `forskningsparken`, `arkitektur_og_designhogskolen` | Reversert navnevariant av eksisterende `em_vit_innovasjon_teknologi`, men brukt som egen place-ID. |
| `em_vit_medisin_helse` | 2 | `data/places/vitenskap/oslo/places_vitenskap.json` | `rikshospitalet`, `radiumhospitalet` | Medisin/helse som stedlig forsknings- og institusjonsemne manglet eksakt canonical ID. |
| `em_vit_kjemi_laboratorium` | 1 | `data/places/vitenskap/oslo/places_vitenskap.json` | `universitetets_gamle_kjemi` | Konkret kjemilaboratorium-emne med tydelig stedlig forankring manglet canonical objekt. |
| `em_vit_eksperiment_maling` | 1 | `data/places/vitenskap/oslo/places_vitenskap.json` | `universitetets_gamle_kjemi` | Konkret eksperiment-/måleemne manglet canonical objekt. |
| `em_vit_matematikk_modellering` | 1 | `data/places/vitenskap/oslo/places_vitenskap.json` | `abelhaugen` | Matematikk/modellering som stedlig vitenskapshistorisk og metodisk emne manglet eksakt canonical ID. |
| `em_vit_vitenskapshistorie_personer` | 1 | `data/places/vitenskap/oslo/places_vitenskap.json` | `abelhaugen` | Person-/minnested-orientert vitenskapshistorie manglet eksakt canonical ID. |

## Søk og verifisering mot vitenskap-fagdata
Eksakte fullverdige objekter for disse 9 ID-ene fantes ikke fra før i `data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json` eller øvrige undersøkte vitenskap-filer. Søk fant ID-ene i tidligere auditrapporter og place-kontekst, men ikke som fullverdige emneobjekter.

Faglig grunnlag og nærliggende fullverdige canonical vitenskap-emner fantes likevel:

| Ny canonical ID | Nærliggende eksisterende canonical grunnlag |
| --- | --- |
| `em_vit_kjemi_laboratorium` | `em_vit_laboratorium_praksis`, `em_vit_instrumenter_maling`, `em_vit_eksperiment_variabler` |
| `em_vit_eksperiment_maling` | `em_vit_eksperiment_variabler`, `em_vit_instrumenter_maling`, `em_vit_kalibrering_presisjon` |
| `em_vit_feltarbeid_observasjon` | `em_vit_feltarbeid`, `em_vit_datasett`, `em_vit_instrumenter_maling` |
| `em_vit_miljo_okologi_system` | `em_vit_okologi_system`, `em_vit_systemtenkning`, `em_vit_miljokunnskap_politikk` |
| `em_vit_kunnskap_formidling_utdanning` | `em_vit_vitenskapsformidling`, `em_vit_universitet_kunnskapsproduksjon`, `em_vit_byens_vitenskapssteder` |
| `em_vit_matematikk_modellering` | `em_vit_modeller_simulering`, `em_vit_beregning`, `em_vit_abstraksjon_forenkling` |
| `em_vit_medisin_helse` | `em_vit_medisin_forskning`, `em_vit_klinisk_evidens`, `em_vit_epidemiologi` |
| `em_vit_teknologi_innovasjon` | `em_vit_innovasjon_teknologi`, `em_vit_forskning_industri`, `em_vit_forskningsinfrastruktur` |
| `em_vit_vitenskapshistorie_personer` | `em_vit_kunnskapsarv`, `em_vit_vitenskapelige_revolusjoner`, `em_vit_institusjonell_autoritet` |

## Fantes fullverdig fra før
Ingen av de 9 gjenværende `em_vit_*`-ID-ene fantes som eksakte fullverdige emneobjekter fra før. Derfor ble ingen objekter kopiert direkte uendret fra en ikke-canonical vitenskap-fil.

## Gjort canonical / opprettet som fullverdige nye emner
Følgende 9 ID-er ble opprettet som fullverdige canonical vitenskap-emner i `data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json` med samme brede canonical schema/stil som eksisterende vitenskap-emner, `emne_id`-felt, stedlig avgrensning, relevante metoder, related-emner, Oslo-cases og generator-guardrails:

| Emne-ID | Handling | Avgrensning |
| --- | --- | --- |
| `em_vit_kjemi_laboratorium` | Opprettet | Kjemilaboratoriet som sted for eksperimenter, målinger, stoffanalyse, instrumenter, sikker praksis og undervisning. |
| `em_vit_eksperiment_maling` | Opprettet | Eksperimenter, måleinstrumenter, variabler, kalibrering, feilkilder og etterprøvbar evidens. |
| `em_vit_feltarbeid_observasjon` | Opprettet | Feltarbeid, observasjon, prøvetaking og stedfestede natur-, vær- og miljødata. |
| `em_vit_miljo_okologi_system` | Opprettet | Miljø og økologi som systemer, med arter, klima, landskap, observasjoner og menneskelig påvirkning. |
| `em_vit_kunnskap_formidling_utdanning` | Opprettet | Vitenskapelig kunnskap som formidles, undervises og kurateres gjennom skoler, museer, høgskoler, sykehus og institusjoner. |
| `em_vit_matematikk_modellering` | Opprettet | Matematikk som språk for bevis, beregning, modeller, abstraksjon og modellkritikk. |
| `em_vit_medisin_helse` | Opprettet | Medisinsk forskning, klinisk kunnskap, behandling, helseutfall, sykehus og evidenspraksis. |
| `em_vit_teknologi_innovasjon` | Opprettet | Forskning, design, prototyper, innovasjonsmiljøer og koblingen mellom vitenskap, teknologi og samfunnsansvar. |
| `em_vit_vitenskapshistorie_personer` | Opprettet | Navngitte forskere, minnesteder, institusjoner, kanon, faglig autoritet og vitenskapshistoriske fortellinger. |

## Utsatt
Ingen av de 9 undersøkte `em_vit_*`-emnene ble utsatt i denne batchen. Alle hadde tydelig vitenskapsfaglig avgrensning og konkret støtte i eksisterende Oslo-place-kontekst.

## Legacy/place-variant eller feil prefix
- `em_vit_teknologi_innovasjon` virker som en navnevariant av eksisterende `em_vit_innovasjon_teknologi`. Siden place-data ikke skulle migreres i denne PR-en, ble ID-en ikke endret i place-fil. Den ble i stedet etablert som eget canonical emne med avgrensning mot teknologi- og innovasjonssteder.
- Ingen av de øvrige ID-ene virker som feil prefix. De er vitenskapelige place-emner, ikke natur-, politikk-, litteratur- eller andre fagfamilier.

## Ikke endret
- Ingen filer under `data/places/**` ble endret.
- `data/places/places_index.json` ble ikke endret.
- Manifest ble ikke endret.
- UI, CSS, HTML og JS ble ikke endret.
- Ingen alias-schema eller mini-placeholder-schema ble innført.
- Ingen andre fagfamilier ble endret.

`git diff --name-only` etter endring viste bare:
- `data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json`
- `reports/oslo-place-audit-batch-17-vitenskap-remaining-emner.md`

`node_modules/` ligger fortsatt som lokal untracked arbeidskatalog og inngår ikke i endringen.

## Før/etter-resultat fra `npm run places:emner:check`

### Før
- Kommando: `npm run places:emner:check`
- Resultat: non-zero fordi det allerede fantes missing emne_ids utenfor denne batchen.
- `Canonical emne ids loaded: 977`
- `Missing emne_ids: 44`
- Gjenværende `em_vit_*`: 20 forekomster / 9 unike.

### Etter
- Kommando: `npm run places:emner:check`
- Resultat: non-zero fordi andre fagfamilier fortsatt har missing emne_ids.
- `Canonical emne ids loaded: 986`
- `Missing emne_ids: 24`
- Gjenværende `em_vit_*`: 0 forekomster.

Reduksjon i total missing: **44 → 24**.
Reduksjon i vitenskap missing: **20 → 0**.

## Resultat fra `npm run places:index:check`
- OK: `places_index.json is in sync with source place files.`

## Resultat fra `npm run health:places`
- `Files checked: 40`
- `Places checked: 470`
- `Canonical emne files checked: 16`
- `emne_ids checked: 1049`
- `Canonical emne_ids: 1025`
- `Unknown emne_ids: 24`
- `Wrong-prefix emne_ids: 306`
- `Errors: 0`
- `Warnings: 1347`

## Anbefalt Batch 18
Fortsett med `em_lit_*` i Oslo litteratur, siden Batch 17 fjernet alle gjenværende `em_vit_*` uten place-migrering. Litteraturgruppen er begrenset til én place-fil og har få unike ID-er, så samme strategi bør brukes: verifiser først om fullverdige litteratur-emner finnes, opprett bare fullverdige canonical emner der stedlig og faglig avgrensning er tydelig, og ikke endre place-data i canonical-batchen.
