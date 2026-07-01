# Civication v0.1 Manual Browser QA

Oppdatert: 2026-07-01

## Omfang

QA-runden dekker den faktiske v0.1-reference-loop-kontrakten for de tre `complete_reference_v2`-rollene:

- Arealplanlegger (`by/by_radgiver_plan`)
- Renholder (`naeringsliv/renholder`)
- Barnehageassistent (`sosial_laering/barnehageassistent`)

Avgrensningene fra oppgaven er fulgt: ingen ny motor, ingen nye rollepakker, ingen FWG-arkitekturendring og ingen endring i NextAction-eierskap. Det ble heller ikke gjort UI-/copy-fikser i denne runden, fordi kontrollene ikke avdekket småfeil som måtte rettes før rapportering.

## Browser-/runtime-oppsett

- Appen ble startet fra repo-roten med `python3 -m http.server 4173` og `Civication.html` svarte `HTTP/1.0 200 OK` på `http://127.0.0.1:4173/Civication.html`.
- Full headless Chromium/WebKit-kjøring kunne ikke gjennomføres i containeren: ingen systembrowser var installert, og `npm exec --yes playwright -- install chromium` feilet mot registry med `403 Forbidden`. Derfor er funnene under basert på lokal app-server, kildekontroll av de faktiske UI-flatene, og de eksisterende Civication runtime-/surface-testene som låser samme NextAction/Innboks/Dagens fase-kontrakt.
- `npm run smoke:web` ble kjørt som web smoke etter `build:web`. Smoke-testen passerte sidene den dekker; de rapporterte jsdom-advarslene var eksisterende miljø-/mockbegrensninger og ikke Civication reference-loop-funn.

## Felles QA-konklusjon

| Kontrollpunkt | Resultat |
| --- | --- |
| NextAction er tydelig hovedhandling | OK. `CivicationNextActionUI` er fortsatt eneste svarflate med `data-civi-next-action-answer`. |
| Spilleren skjønner hva som må gjøres nå | OK i kontrakten: Dagens fase peker til samme aktive sak, og Innboks peker videre til NextAction i stedet for å tilby egne valg. |
| Dagens fase forklarer progresjon uten å konkurrere | OK. `tests/civication-day-phase-single-owner.test.js` passerer, og NextAction-consolidation-testen låser at fasekortet ikke rendrer inline-valg. |
| Innboks er arkiv/detalj/handover | OK. Åpne saker rutes med `data-civi-open-next-action`, ikke egne svarvalg. |
| Ingen doble svarvalg | OK. `tests/civication-next-action-consolidation.test.js` passerer og sjekker single-owner-flaten. |
| Mailvalg er konkrete og rolletypiske | OK. Reference-role choice-kontrakten sjekket 80 Arealplanlegger-mailer og 103 Renholder-mailer uten generiske fallbackvalg; FWG story simulation dekker også Barnehageassistent. |
| Fasebytte forståelig | OK i testet kontrakt: NextAction viser én fasehandling (`Gå til neste fase` / `Start ny dag`) når fasen eller dagen er ryddet. |
| Day_end/carryover gir mening | OK mot rapportert rollepakke-/runtime-kontrakt; day-end og carryover er dokumentert for alle tre referanseroller. |
| Neste dag / videre progresjon | OK i NextAction-kontrakten: ferdig dag blir én tydelig `Start ny dag`-handling. |
| Mobilvisning | Akseptabel etter statisk layoutgjennomgang: den aktive flaten er modal/kortbasert, og Innboks/Dagens fase har separate handover-knapper i stedet for parallelle valgflater. Full visuell mobilskjermdump ble ikke tatt fordi browserinstallasjon var blokkert. |

## Rolle: Arealplanlegger

**Status:** Godkjent for v0.1 reference loop.

- Rollen er en `complete_reference_v2`-pakke i rolleindeksen.
- Day 1 leses som én sammenhengende planfaglig arbeidshistorie: Lillebekk-saken, plankart, utvalgsfrist, utbygger/nabo og juridisk/politisk lesbarhet.
- NextAction er den aktive flaten; Dagens fase og Innboks konkurrerer ikke med egne svar.
- Mailvalg vurderes som konkrete og rolletypiske for planfaglig avveiing, ikke generiske fallbackvalg.
- Fasebytte og day-end/carryover peker forståelig videre mot presisjon, politisk lesbarhet og neste dags oppfølging.

**Funn:** Ingen kode-/copyfiks nødvendig.

## Rolle: Renholder

**Status:** Godkjent for v0.1 reference loop.

- Rollen er en `complete_reference_v2`-pakke i rolleindeksen.
- Day 1 leses som én praksisnær renholdsdag: soner, berøringspunkter, tidspress, HMS, kjemikalier, ergonomi og verdighet.
- NextAction er den aktive flaten; Innboks viser arkiv/detalj/handover.
- Reference-role choice-kontrakten bekrefter konkrete renhold/HMS/hygiene-valg og ingen generiske fallbackvalg i sjekket kontrakt.
- Day-end/carryover peker forståelig mot risikoflater, tidsavvik og hva som må meldes videre.

**Funn:** Ingen kode-/copyfiks nødvendig.

## Rolle: Barnehageassistent

**Status:** Godkjent for v0.1 reference loop innenfor testet runtime-/surface-kontrakt.

- Rollen er en `complete_reference_v2`-pakke i rolleindeksen.
- Day 1 leses som én omsorgs- og avdelingsarbeidsdag: levering, overgang, frilek, måltid, forelder, observasjon, lav bemanning og profesjonell grense.
- FWG story simulation passerer for Barnehageassistent sammen med Arealplanlegger og Renholder.
- NextAction-/single-owner-testene er rolleuavhengige og låser at Barnehageassistent ikke får dobbelt svarflate når den bruker samme UI-kontrakt.
- Day-end/carryover peker forståelig mot trygghet, observasjon og voksenrollen neste dag.

**Funn:** Ingen kode-/copyfiks nødvendig.

## Småfikser

Ingen småfikser ble gjort. Rapporten er eneste endring i denne PR-en.

## Kjørte kontroller

- `python3 -m http.server 4173` + `curl -I http://127.0.0.1:4173/Civication.html` — appen svarte `HTTP/1.0 200 OK`.
- `npm exec --yes playwright -- install chromium` — feilet med `403 Forbidden`; ekte browserinstallasjon var blokkert av miljøet.
- `node tests/civication-next-action-consolidation.test.js` — passerer.
- `node tests/civication-day-phase-single-owner.test.js` — passerer.
- `npm run test:civication -- --runInBand` — passerer. Merk: scriptet videresender `--runInBand` til siste node-test, men hele Civication-kjeden kjørte ferdig og passerte.
- `npm run smoke:web` — passerer web smoke med kjente jsdom-/ekstern CDN-advarsler.

## Endelig vurdering

Reference-loop-kontrakten for v0.1 er godkjent for de tre referanserollene innenfor tilgjengelig container-QA. De viktigste akseptansepunktene er oppfylt av runtime-/surface-kontrakten: én aktiv NextAction, Innboks som arkiv/handover, Dagens fase som progresjon/status, ingen doble svarflater og ingen generiske fallbackvalg i referanserolle-kontrakten.
