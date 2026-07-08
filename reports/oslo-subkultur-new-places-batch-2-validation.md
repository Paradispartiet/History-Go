# Oslo subkultur new places batch 2 — validation

Dato: 2026-07-08

## Scope-bekreftelse

- Nye places opprettet: `revolver_oslo`, `the_villa`, `jaeger_oslo`, `sub_scene`, `mir_grunerlokka_lufthavn`.
- Skipped: `chateau_neuf_betong`, `jordal_skatepark`, `voldslokka_pumptrack`.
- Ingen people ble opprettet.
- Ingen people-filer ble endret.
- Ingen navngitte personer ble lagt inn som people.
- Ingen quiz-filer, UI-/loader-/relation-filer eller unrelated kategori-/Lisboa-filer ble endret.
- `data/places/places_index.json` ble regenerert med `npm run places:index:build`, ikke håndredigert.

## Filer lest før endring

- `data/places/manifest.json`
- `data/places/places_index.json`
- `data/places/subkultur/oslo/places_subkultur.json`
- `reports/subkultur-oslo-new-place-candidates-batch-01.md`
- `reports/oslo-subkultur-new-places-batch-1-validation.md`
- `package.json`

## Candidate IDs og søketermer sjekket repo-wide

Kommando brukt før append:

```bash
rg -n "jordal_skatepark|voldslokka_pumptrack|revolver_oslo|the_villa|jaeger_oslo|sub_scene|mir_grunerlokka_lufthavn|chateau_neuf_betong|Revolver|The Villa|Jæger|Jaeger|Sub Scene|MIR|Grünerløkka Lufthavn|Betong|Chateau Neuf" . -g '!node_modules'
```

Resultat:

- `revolver_oslo`, `the_villa`, `jaeger_oslo`, `sub_scene` og `mir_grunerlokka_lufthavn` fantes ikke som eksisterende place-ID-er før append.
- `the_villa`, `jaeger` og `chateau_neuf` finnes som brand-/popkulturdata, ikke som subkultur-place med ønsket ID.
- `chateau_neuf` finnes allerede som place i `data/places/popkultur/oslo/places_oslo_populaerkultur.json`, og `places_index.json` hadde allerede Chateau Neuf før denne batchen.
- `jordal_skatepark` og `voldslokka_pumptrack` fantes ikke som place-ID-er, men ble ikke lagt inn i denne batchen fordi de lavere prioriterte kandidatene ble vurdert etter at fem tryggere scene-/klubbkandidater var klare.

## Kandidatklassifisering

| Kandidat | Status | Begrunnelse |
| --- | --- | --- |
| `revolver_oslo` | `candidate_place_ready` | Adresse og scene-/bar-/klubbprofil verifisert; lagt inn som rock-/indie-/punk-/klubbscene, ikke generisk bar. |
| `the_villa` | `candidate_place_ready` | Adresse og elektronika-/dance-/undergrunnsprofil verifisert; lagt inn som klubbkultur/rave/elektronika-sted. |
| `jaeger_oslo` | `candidate_place_ready` | Adresse, DJ-/klubb-/bakgårdsprofil og elektronisk musikkprofil verifisert; ID skrevet uten æ. |
| `sub_scene` | `candidate_place_ready` | Adresse, konsertscene/kafé, rusfri/all-ages- og lavterskelprofil verifisert. |
| `mir_grunerlokka_lufthavn` | `candidate_place_ready` | Adresse og kobling mellom MIR og Grünerløkka Lufthavn verifisert; formulert med historisk/statusmessig forbehold. |
| `chateau_neuf_betong` | `skipped_existing_place` | Chateau Neuf finnes allerede som `chateau_neuf` i popkultur-place-data. Betong-rommet ble ikke opprettet separat i subkultur uten sterkere behov for duplisering av samme adresse. |
| `jordal_skatepark` | `rejected_wrong_category` | Oslo kommune verifiserer skatefunksjon, men kandidaten er primært kommunalt idrettsanlegg/skateanlegg. Bør eventuelt vurderes i sport/byrom senere. |
| `voldslokka_pumptrack` | `skipped_insufficient_source` | Ikke behandlet videre etter at fem høyere prioriterte scene-/klubbkandidater var klare; bør vurderes i senere sport/byrom-/urban bevegelseskultur-batch med egen kildegate. |

## Kildegrunnlag per lagt kandidat

### `revolver_oslo`

- Offisiell side oppgir `Møllergata 32, 0179 OSLO` og kommende arrangementer.
- Oslo World omtaler Revolver som liten rød bar og venue i Møllergata 32.
- Visit Norway beskriver Revolver med rock/indie-DJs, filmvisninger, pop-up food, trivia og konserter.
- Setlist.fm og festival-/venuekilder støtter bruken som konsertsted.

Kilder brukt:

- https://www.revolveroslo.no/
- https://osloworld.no/en/venue/revolver
- https://www.visitnorway.com/listings/revolver/4762/
- https://www.setlist.fm/venue/revolver-oslo-norway-33d61c29.html

Koordinatkilde:

- Koordinat: `59.91655, 10.74953`.
- Kilde: Manuell bygg-/gatepunktsplassering etter offisiell adresse `Møllergata 32`.
- `coordSourceUrl`: https://www.revolveroslo.no/

### `the_villa`

- Resident Advisor oppgir The Villa på `Møllergata 23, 0179 Oslo`.
- Visit Norway beskriver stedet som høyt rangert elektronika-klubb med underground music: house, techno, dubstep, drum'n'bass, electro og innovative sjangre.
- Supplerende venue-/reviewkilder bekrefter elektronisk dansemusikkprofil og dansegulv-/klubbfunksjon.

Kilder brukt:

- https://ra.co/clubs/5879
- https://www.visitnorway.com/listings/the-villa/7827/
- https://www.tripadvisor.com/Restaurant_Review-g190479-d3822802-Reviews-The_Villa-Oslo_Eastern_Norway.html

Koordinatkilde:

- Koordinat: `59.91555, 10.74870`.
- Kilde: Manuell bygg-/gatepunktsplassering etter verifisert adresse `Møllergata 23`.
- `coordSourceUrl`: https://ra.co/clubs/5879

### `jaeger_oslo`

- Visit Norway oppgir Jaeger som klubb i Grensen, med DJs hver kveld, klubbkvelder, konserter, afterparties og bakgård i sommersesongen.
- Facebook-/event-/RA-kilder oppgir `Grensen 9, 0159 Oslo`.
- Jaegers egne artikler og arrangementsflater dokumenterer DJ-/dansegulv-/elektronika-profilen.

Kilder brukt:

- https://www.visitnorway.com/listings/jaeger/7743/
- https://ra.co/events/1208673
- https://jaegeroslo.no/oslo-and-electronic-music-in-conversation-with-redrum/
- https://www.facebook.com/jaegeroslo/

Koordinatkilde:

- Koordinat: `59.91383, 10.74355`.
- Kilde: Manuell bygg-/gatepunktsplassering etter verifisert adresse `Grensen 9`.
- `coordSourceUrl`: https://www.visitnorway.com/listings/jaeger/7743/

### `sub_scene`

- Visit Oslo beskriver Sub Scene som konsertscene og kafé med konserter, festivaler og tema-/klubbkvelder, uten alkoholservering og med arrangementer åpne for alle aldre.
- JamBase/Crescat oppgir adresse `Rosenkrantz' gate 17, 0160 Oslo`.
- Ticketmaster/konsertlister viser fortsatt venuebruk i 2026.

Kilder brukt:

- https://www.visitoslo.com/en/product/?name=Sub-Scene&tlp=2980733
- https://www.jambase.com/venue/sub-scene-oslo-no
- https://crescat.io/venues/sub-scene
- https://www.ticketmaster.no/venue/sub-scene-oslo-tickets/ssch/18?language=en-us

Koordinatkilde:

- Koordinat: `59.91379, 10.73879`.
- Kilde: Manuell bygg-/gatepunktsplassering etter verifisert adresse `Rosenkrantz' gate 17`.
- `coordSourceUrl`: https://www.visitoslo.com/en/product/?name=Sub-Scene&tlp=2980733

### `mir_grunerlokka_lufthavn`

- Lufthavna.no oppgir at Grünerløkka Lufthavn er en ikke-kommersiell organisasjon som driver scenen og baren MIR, Galleri 69 og øvings-/arbeidsrom for musikere og kunstnere.
- Lufthavna.no oppgir `Toftes gate 69, 0552 Oslo`.
- Visit Løkka beskriver MIR Scene / Lufthavna som lokal kulturinstitusjon der Mir bar og scene, Galleri 69 og arbeids-/studiorom er samlet.
- Promogogo beskriver Café MIR som `Mir Scene på Grünerløkka Lufthavn` med livemusikk, bar, DJs, `(u)kultur` og undergrunn siden 1997.
- Visit Oslo omtaler MIR som bakgårdskafé med alternativ Grünerløkka-sjarm, improjazz, DJs og quiz.

Kilder brukt:

- https://www.lufthavna.no/
- https://www.lufthavna.no/mir-events
- https://visitlokka.no/directory-visitlokka/listing/lufthavna-mir-scene-galleri-69/
- https://promogogo.com/venue/1ff9d07b-27d3-4366-8b11-911c48f52846
- https://www.visitoslo.com/en/product/?name=MIR&tlp=2980743

Koordinatkilde:

- Koordinat: `59.92340, 10.75982`.
- Kilde: Manuell bygg-/gatepunktsplassering etter verifisert adresse `Toftes gate 69`.
- `coordSourceUrl`: https://www.lufthavna.no/

## Skipped-kandidater

### `chateau_neuf_betong`

Status: `skipped_existing_place`.

- Chateau Neuf finnes allerede som `chateau_neuf` i `data/places/popkultur/oslo/places_oslo_populaerkultur.json`.
- Eksisterende entry beskriver studentdrevet kulturarena med flere saler for revy, konserter, debatter og humor.
- Leksikon-/wonderkammer-data dekker også Chateau Neuf som studenthus, storsal, sceneinfrastruktur, konsert og debatt.
- Betong kan kildeverifiseres som scene-/romnavn via Chateau Neuf/DNS-flater, men batchen unngikk å duplisere samme bygning med ny subkultur-place uten et tydeligere rom-spesifikt behov.

### `jordal_skatepark`

Status: `rejected_wrong_category`.

- Oslo kommune verifiserer Jordal skatepark som stort skateanlegg, åpnet i august 2022, 2200 kvadratmeter, med skateelementer for flere ferdighetsnivåer.
- Vurderingen i denne batchen er at kandidaten primært er idrettsanlegg/skateanlegg. Den kan vurderes senere i sport/byrom eller en eksplisitt urban bevegelseskultur-batch, men ble ikke brukt som scene-/subkultur-place her.

Kilde:

- https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/jordal-skatepark/

### `voldslokka_pumptrack`

Status: `skipped_insufficient_source`.

- Ikke lagt inn i denne batchen fordi fem høyere prioriterte kandidater passerte research-gate.
- Bør eventuelt vurderes senere med egen gate for adresse/lokasjon, pumptrack-/sykkel-/skatefunksjon og redaksjonell avklaring om sport/idrett vs. urban bevegelseskultur.

## Post-append audits

Kommandoer kjørt:

```bash
node -e "JSON.parse(require('fs').readFileSync('data/places/subkultur/oslo/places_subkultur.json','utf8')); console.log('json ok')"
npm run places:index:build
npm run build:tools
npm run places:index:check
npm run places:emners:check || npm run places:emner:check
npm run places:coords:check
node duplicate-place-id-check for new IDs
```

Resultater:

- JSON parse: pass.
- `places:index:build`: pass; `data/places/places_index.json` regenerert med etablert script, ikke håndredigert.
- `build:tools`: pass.
- `places:index:check`: pass; index er i sync.
- `places:emners:check`: scriptet finnes ikke; fallback til `places:emner:check` ble kjørt.
- `places:emner:check`: pass; 0 missing emne IDs, 0 duplikate emne-ID-er per sted og 0 duplikate place-ID-er i aktive place-filer.
- `places:coords:check`: pass; quality gate ok, med eksisterende globale varsler/review-kandidatsignaler rapportert i genererte koordinatrapporter.
- Duplicate-ID-sjekk: alle fem nye ID-er finnes nøyaktig én gang i aktive place-filer.

## Bekreftelser

- Ingen people ble lagt inn.
- Ingen people-filer ble endret.
- Ingen navngitte personer ble lagt inn.
- Alle nye entries har `category: "subkultur"`.
- Alle nye entries har ikke-null `lat` og `lon`.
- Alle nye entries har `coordStatus: "verified"`, `coordType`, `coordSource`, `coordSourceId`, `coordSourceUrl`, `coordPrecisionM`, `coordVerifiedAt` og `coordNote`.
- Alle nye entries bruker eksisterende underbadge-ID-er fra subkultur-systemet: `underground_scener` og/eller `rave_og_klubbkultur`.
- Subkultur-vinkelen er reell og stedsspesifikk: rock-/indie-/punk-/klubbscene, elektronika-/rave-/DJ-kultur, rusfri ungdoms-/konsertscene og historisk undergrunns-/Grünerløkka-scene, ikke generisk nattliv/idrett/servering.

## Endrede filer

- `data/places/subkultur/oslo/places_subkultur.json`
- `data/places/places_index.json`
- `reports/oslo-subkultur-new-places-batch-2-validation.md`
- `reports/place-coordinate-audit.json`
- `reports/place-coordinate-audit.md`
- `reports/place-coordinate-quality-gate.md`
