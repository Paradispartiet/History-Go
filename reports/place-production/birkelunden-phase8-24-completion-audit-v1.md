# Birkelunden – fase 8–24 completion audit V1

- Dato: 2026-08-24
- Place ID: `birkelunden`
- Canonical Place: `data/places/by/oslo/places/birkelunden.json`
- Status: **CANONICAL CONTENT MATERIALIZED – FINAL CI/MAIN GATE PENDING**

## Bevaringslås

- Park: **16,3 dekar / 16 300 m²**.
- Større fredet kulturmiljø: **ca. 116 dekar** – aldri brukt som parkareal.
- `desc`: `ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe`.
- `popupDesc`: `670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7`.
- Coordinate owner og park-anchor beholdes.

## Fase 8 – rundinger og canonical collections

**PASS.** People eies av direkte personkoblinger, Objects av tre fysiske parkobjekter, Brand av Bondens marked, Structures av musikkpaviljong og vannbasseng. Den synlige 4-rundingen er `people → images → brands → structures`. Objects beholdes som canonical eget innhold, men velges ikke som visuell runding før tre separate rettighetsavklarte objektbilder finnes. Dette er en kvalitetsgrense, ikke N/A.

Jack Johnsen materialiseres som canonical People-profil med tre claim-mappede opplysninger og uten oppfunnet portrett, fødselsdata eller biografisk filler. Thorvald Meyer beholdes som eksisterende direkte parkperson.

## Fase 9 – full stedsgjennomgang

**PASS.** Popupfasene 7A–7H, People/Objects/Brands/Structures, Story, Før/etter, Nyheter, Lesespor, Kilder, Språk, Nature-eierskap, Fagverk og Quiz er gjennomgått samlet mot parkens own-place-grense.

Rute: **BEGRUNNET N/A i denne place-produksjonen.** Det finnes ingen canonical Birkelunden-rute, og en ny flerstoppsrute ville måtte eies som Grünerløkka-klynge med egne steder. Nabosteder gjøres ikke til Birkelunden-proxy for å fylle en flate.

## Fase 10 – Quiz

**PASS.** Eksisterende aktiv/arkiv/alternativt quizmateriale er auditet før profilvalg. Ingen package-eid Birkelunden-quiz fantes. Ny canonical pakke er `rich 5×7`: 35 spørsmål, de første 14 er direkte normale spørsmål, source_brief har 35 reviewede claims, og hvert spørsmål peker til claim + ekstern source-id. Major avvises fordi flere sett ville splitte samme stoff kunstig.

## Fase 11–15 – runtime, integrasjon og brukerflate

**PASS ved final CI-head når de navngitte gates er grønne.** Rounds kjøres gjennom eksisterende generisk runtime; ingen Birkelunden-spesialrenderer er lagt til. Språk, popup, quiz, People og Brand bruker eksisterende canonical resolvere/manifester. Slutt-QA skal gjenåpnes ved faktisk runtimeavvik.

## Fase 16 – repetisjon

**PASS.** Chronology/history_layers, Story, Objects og Quiz bruker samme kildegrunnlag til ulike produktjobber: datooversikt, narrativ episode, fysiske spor og læringsspørsmål. De er ikke kopiert som identiske tekstflater.

## Fase 17 – history_profile

**PASS.** `history_profile` er materialisert med sentral intensjon, geografi, plan/funksjon, fire tidslag, lokal kunnskap og eksplisitt own-place-grense. Park/kulturmiljø-skillet er skrevet inn som en invariant.

## Fase 18–19 – visuelle kilder

**PASS.** Eksisterende hovedbilde og Før/etter-evidens beholdes med tidligere godkjent proveniens. Bondens marked-logoen kommer fra organisasjonens NTB Kommunikasjon-mediebank og brukes referensielt uten endorsement. Ingen objektbilder er oppfunnet eller hentet fra uklar søkemotorproveniens.

## Fase 20–24 – sluttporter

Ferdigstatus krever grønn final PR-head for data, People, Quiz, place rounds, language, Stories, Knowledge/Fagverk og øvrige berørte workflows samt etterfølgende kontroll på `main`. Completion-reporten står derfor som `production_ready_ci_pending` fram til dette faktisk er bevist; audit eller schema alene brukes ikke som bevis for live-status.

## Seksdelt kvalitetsvurdering før merge

| Dimensjon | Score | Etterprøvbar evidens |
| --- | ---: | --- |
| Korrekthet og evidens | 5/5 | 35 spørsmål peker til reviewede claims og eksterne kilder; areal-, geometri-, tekst- og kildekonfliktlåsene består. |
| Dekning og ferdigstillelse | 5/5 | Fase 7H og 8–24 er gjennomgått; People, Objects, Brand, Structures, rundinger, Quiz og integrasjoner har eksplisitt status eller begrunnet route-N/A. |
| Faglig/redaksjonell kvalitet | 5/5 | Innholdet er Birkelunden-spesifikt; filler, nabostedsproxy, oppdiktet dialekt og udokumenterte superlativer er holdt ute. |
| Teknisk integritet | 5/5 | Permanente språk-, quiz-, manifest-, progresjons-, teori-, People-, rounds- og bevaringsporter skal være grønne på endelig PR-head før merge. |
| Sikkerhet og ansvarlighet | 4/5 | Ingen sensitive personopplysninger eller risikodomene; varemerket brukes kun referensielt fra offisiell mediebank med no-endorsement og full proveniens. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Canonical owners og eksisterende generiske resolvere brukes; one-shot tooling fjernes; audit, workcard og completion-report gjør valgene reproducerbare. |

**Samlet: 29/30 – høy kvalitet**, betinget av at endelig PR-head og etterfølgende `main`-kontroll er grønne. Automatiske porter beviser kontraktintegritet, men ikke alene historisk sannhet eller visuell kvalitet; disse er derfor også manuelt kontrollert mot claim-/kildepakken og det offisielle logoassetet.

## Held back

- SNL-varianten `1889` for Spaniamonumentet; canonical år her er 1989.
- superlativer om «eldste» pensjonistforening;
- Paulus kirke/Grünerløkka skole/Olaf Ryes plass som park-eide objekter eller strukturer;
- 2013-bildet som påstand om eksakt 2026-tilstand;
- kunstig route- eller Objects-runding bare for å fylle fire visuelle felt.
