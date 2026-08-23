# Youngstorget – sted-for-sted nullmåling V1

- Dato: 2026-08-23
- Place ID: `youngstorget`
- Snapshot av `main`: `3ee60d3bec6de6cf519a1df0b3d17cafecc63b53`
- Canonical place-fil: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Place-manifest: `data/places/manifest.json`
- Koordinat-evidence: `data/coordinate-evidence/oslo/politikk/youngstorget.json`
- Stories: `data/stories/youngstorget.json`, `data/stories/stories_youngstorget.json`
- Quiz: `data/quiz/politikk/youngstorget_sets.json`
- Lesespor: `data/lesespor/lesespor_oslo_batch1.json`, `data/lesespor/lesespor_oslo_batch2.json`
- Brands: `data/brands/brands_by_place.json`
- Primærkategori: `politikk`
- Produksjonsmetode: `data/places/regler/content_factory_v1.json`
- Status: **NULLMÅLING FERDIG – ingen brukerrettet innholdsflate er godkjent som komplett av denne rapporten**

Denne rapporten er opprettet før første nye Youngstorget-innholdsendring i Content Factory Pilot 01. Den er en behold/saner/produser-plan, ikke en readiness-erklæring. Eksisterende innhold skal gjenbrukes når det består dagens kontrakter; det skal ikke genereres på nytt bare fordi piloten starter. Samtidig skal tidligere grønn teknisk status aldri brukes som erstatning for dagens faktisitets-, placegrense- eller slutt-QA.

## 1. Canonical identitet og klyngegrense

| Kontroll | Nullmåling | Beslutning |
| --- | --- | --- |
| Canonical ID | `youngstorget` | **BEHOLD** |
| Manifest-loadet source | `places/politikk/oslo/places_politikk/youngstorget.json` er registrert i `data/places/manifest.json` | **BEHOLD** |
| Objektidentitet | Selve Youngstorget som offentlig torg/byrom, ikke Folkets Hus, Folketeaterbygningen, Møllergata 19, Youngstorgets basar eller virksomhetene rundt torget | **BEHOLD OG LÅS** |
| Primærkategori | `politikk` | **BEHOLD inntil egen fase-4 audit eventuelt dokumenterer noe annet** |
| Historisk navn | `Nytorvet` var offisielt navn 1852–1951; Youngstorget var folkelig navn og ble offisielt i 1951 | **KILDEBELEGGES I SOURCE PACK** |
| Anleggsår | Eksterne institusjonelle kilder oppgir at torget ble anlagt/etablert i 1846 | **CANONICAL TEKSTREGRESJON FUNNET** |
| Klynge | Torggata → Youngstorget → Storgata / Brugata–Storgata | **RESEARCHKLYNGE, IKKE SAMMENSLÅTT PLACE** |

### Klyngeobjekter som skal holdes adskilt

Piloten har allerede funnet separate canonical objekter som blokkerer proxy-produksjon:

- `torggata` – canonical gate og referanse-/ankersted; skal ikke produseres på nytt i denne piloten;
- `youngstorget` – første faktiske fullproduksjonsmål;
- `storgata` – canonical gate med egen verifisert gategeometri og rik place-record;
- `brugata_storgata_rusmiljo` – eget Subkultur-place for et dokumentert sosialt territorium i krysset Brugata/Storgata;
- `folkets_hus_oslo`, `folketeateret` og `mollergata_19` finnes som egne relevante nærobjekter og skal behandles som relasjoner der de er dokumentert, ikke som erstatning for Youngstorget.

Geografisk nærhet gir aldri evidensscope. Et claim kan deles i klyngen bare når kilden faktisk omtaler flere av objektene eller samme historiske/romlige sammenheng eksplisitt.

## 2. Blokkerende faktaavvik i dagens place-record

Dagens `desc` sier at Youngstorget «ble anlagt som Nytorvet i 1852». Dette kan ikke beholdes som godkjent faktatekst.

Kilder kontrollert 2026-08-23:

1. Oslo kommune, `https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/` – oppgir at Youngstorget ble etablert i 1846.
2. Oslo byleksikon, `https://oslobyleksikon.no/side/Youngstorget` – oppgir at torget ble anlagt i 1846, at offisielt navn 1852–1951 var Nytorvet, og at navnet Youngstorget ble offisielt i 1951.
3. Arbeiderbevegelsens arkiv og bibliotek, Lill-Ann Jensen, «Det røde torg», `https://www.arbark.no/eldok/Arbeiderhistorie1996_9.pdf` – oppgir at kommunen kjøpte Youngsløkka sist i 1830-årene, at torget ble anlagt i 1846, og at Nytorvet var offisielt navn 1852–1951.

Beslutning: **REGRESJON SOM SKAL RETTES i description-fasen etter claim-first production package.** Nullmålingsfasen endrer ikke teksten.

`year: 1852` kan heller ikke automatisk behandles som korrekt etableringsår. Feltets semantikk må avklares mot place-/description-kontrakten før metadata endres. Tekstfeilen skal uansett ikke videreføres.

## 3. Tidligere arbeid – hovedhistorikk

Søk på Youngstorget i commit-historikken viser at stedet har vært aktivt produsert tidligere. Følgende arbeider er derfor baseline, ikke noe piloten skal lage på nytt uten regresjonsbevis:

- `bfd35a72312a4fe71c74e1deb55083ef7beb9290` – politikk-emnet `em_pol_mediert_offentlighet` ble etablert og koblet faglig til Youngstorget;
- `0247c5349d527550e6887f2b079eddc8731e9dd9` – Youngstorget place-data ble beriket;
- `10635585ffeb3efd0953103742f7154427eea7e6` – rundingsinnhold ble lagt til etter eldre rundingsmodell;
- `634a707937ad5d514f005e3a233eb067e59a347a` og `78b108a8e265a4ba1d047d507875985385612408` – aktører/skapere ble lagt til;
- `ac40c58e21d9b15ffedfe3f043d8e76c8254f3f3`, `fd0127f7e409837ee3b89aa3b06dc5c329c988f6` og `5db8f758d5f5eb5d7b4c618e38cf20e500201ff4` – strukturert quiz ble opprettet, migrert og aktivert;
- `ec8ee6f89beccba2cbd4cf8caa80a0897e41f299` – eldre nature-runding ble erstattet med tasks.

Disse commitene viser reelt arbeid, men dagens canonical kontrakter har senere endret blant annet rundinger, tasks og popup-eierskap. Tidligere arbeid må derfor klassifiseres per subsystem som `ALLEREDE FERDIG`, `REGRESJON` eller `REELT NYTT ARBEID`.

## 4. Eksisterende innhold – behold, saner eller re-auditer

| Flate/system | Dagens data | Nullmålingsstatus | Neste krav |
| --- | --- | --- | --- |
| `desc` | Finnes, men inneholder 1852/anlagt-feilen | **REGRESJON** | Claim-first description package og faktakorreksjon |
| `popupDesc` | Finnes og beskriver marked → arbeiderbevegelse → mediert offentlighet | **RE-AUDIT / UTVID** | Full source→claim→sentence-paritet; rikere stedshistorie |
| Description production package | Ingen `data/places/production/youngstorget.json` identifisert i preflight | **MANGLER** | Opprettes først i description-fasen etter source pack |
| Koordinater | `verified_geometry`, OSM relation, kontrollert 2026-07-21 | **ALLEREDE FERDIG med mindre konkret regresjon finnes** | Ikke geokod på nytt |
| Emner | 3 `em_pol_*`: arbeidsliv/kollektiv kamp, demonstrasjoner/protest, mediert offentlighet | **EKSISTERER, RE-AUDIT FASE 4** | Behold når fag- og stedsevidens består |
| Underbadges | arbeiderbevegelse; aktivisme og protest | **EKSISTERER, RE-AUDIT FASE 4** | Ikke legg til fyll |
| Stories | Tre korte research/story-snutter + én canonical Story om 1. mai | **EKSISTERER, RE-AUDIT** | Story-governance; chronology og Story må skilles |
| Quiz | Ett aktivt sett med 5 stedsspesifikke spørsmål | **EKSISTERER, RE-AUDIT** | Quiz-kontrakten avgjør om det beholdes/utvides; ikke regenerer uten behov |
| People | Permanent test låser minimum 22 People-koblinger til `youngstorget`; Jørgen Young er eksplisitt canonical kobling | **EKSISTERER, IKKE GODKJENT SOM RUNDE ENNÅ** | Own-place/evidens, profiler, bilder og faktisk popup-antall må auditeres |
| Brands | `internasjonalen`, `mono`, `sentrum_scene`, `stratos` | **EKSISTERER, OWN-PLACE-RISIKO** | Brand-regler + kontroll av om identiteten faktisk tilhører torget, egen nearby-place eller bygning |
| Objects | Ingen canonical `place.objects` identifisert | **REELT PRODUKSJONSHULL** | Kandidater som Pioneren/Fredsmonumentet vurderes mot Objects-kontrakten og kilder |
| Related | Politikk-kategorien forventer `related` som fjerde runding | **MÅ PRODUSERES/AUDITERES** | Bare faktiske andre History GO-places med dokumentert relasjon |
| Legacy `rounds` | `people · badges · civication · brands · leksikon · routes · music` | **REGRESJON MOT DAGENS RUNDEKONTRAKT** | Migreres til 4+1 etter dataaudits; Civication/Leksikon/routes/music er ikke canonicale rundinger |
| Leksikon | Ingen egen Youngstorget-place-leksikonfil identifisert i preflight | **REELT HULL / MÅ AVKLARES** | Historie/facts/chronology skal eies riktig, ikke presses inn i place-filen |
| Før/etter | Ingen `for_na`-entry identifisert | **REELT HULL** | Samme sted gjennom tid, rettigheter, kilder, own-place-grense |
| Nyheter | Ingen godkjent Youngstorget-nyhetsflate identifisert | **REELT HULL / fersk research** | 2026-status og dokumenterte utviklingstiltak vurderes |
| Lesespor | Minst fire eksisterende entries (`lesespor_youngstorget_001`–`004`) | **EKSISTERER, RE-AUDIT** | Relevans, tilgang, rettighet og direkte stedstilknytning |
| Kilder | Place mangler full brukerrettet `source_summary` | **REELT HULL** | Bygg safe_sources fra source pack; interne audits skjules |
| Språk | Ingen egen Youngstorget-språkfil identifisert | **IKKE BEVIST N/A** | Stedsnavnet Nytorvet/Youngstorget og eventuelt dokumentert torv-/arbeiderbevegelsesspråk må vurderes etter Språkleksikon-kontrakten |
| Images | Ingen Youngstorget-bildeasset ble funnet ved direkte assets-/filnavnsøk i preflight, og place-recorden mangler hovedbilde-felt | **REELT HULL / MÅ SOURCE-ES** | Bildekontrakter, lisens/proveniens, hovedbilde + relevante rundingsbilder |
| På stedet | Dagens canonical product sier tasks ikke skal produseres/presenteres; eldre commit erstattet nature med tasks | **LEGACY / SANERINGSBEHOV** | `PLACE_ONSITE_SYSTEM` + kategori-policy; Social Meet/Knowledge Meet/events vurderes etter data |
| Routes/relations | Legacy `routes` finnes som rundingsidé, men route/relations må være egne canonical systemer | **RE-AUDIT** | Faktiske historiske/narrative relasjoner, ikke nærhetsfyll |

## 5. Popup – separat nullstatus

Dagens popupkontrakt har sju faste grunnfaner og datastyrte direktefaner. Det finnes ingen brukerrettet generell `Mer`-fane.

| Fane | Nullmålingsstatus | Evidens / blokkering |
| --- | --- | --- |
| Om | **IKKE GODKJENT** | `popupDesc` finnes, men mangler dagens production package og full claim-sporbarhet; `desc` har faktafeil |
| Historie | **IKKE GODKJENT** | Rik historisk råstofftilgang finnes, men egen canonical chronology/history-layer er ikke bevist komplett |
| Fortellinger | **EKSISTERER, IKKE GODKJENT** | Én canonical Story + eldre snippets må re-auditeres mot Story-kontrakten |
| Før/etter | **IKKE STARTET** | Ingen canonical Youngstorget-pakke funnet |
| Nyheter | **IKKE STARTET** | Oslo kommune har fersk 2026-relevant utviklingsstatus, men den er ikke materialisert som godkjent nyhetsflate |
| Lesespor | **EKSISTERER, IKKE GODKJENT** | Minst fire entries i to Oslo-batcher |
| Kilder | **IKKE FERDIG** | Eksterne kilder finnes spredt, men `source_summary.safe_sources` er ikke etablert |
| Språk | **IKKE STARTET / MÅ VURDERES** | Ingen aktiv place-spesifikk språkoppføring funnet |
| Spor & objekter | **IKKE STARTET** | Fysiske kandidatobjekter finnes i kildene, men canonical Objects mangler |
| Legg merke til / Betydning / Motpunkter / Relasjoner / Kunnskap / Observasjoner | **MÅ AUDITERES INDIVIDUELT** | Skal bare materialiseres når source-eid innhold finnes |

## 6. Foreløpig source inventory for Content Factory

Kildepakken bygges i egen researchfase. Nullmålingen har likevel kontrollert at følgende kilder har faktisk Youngstorget-scope:

- Oslo kommune – Youngstorget: etablering, dagens bruk, kunst, permanent historisk fotoutstilling, fasiliteter, pågående bylivs-/utleiearbeid og gjennomførte/planlagte oppgraderinger;
- Oslo byleksikon – Youngstorget: identitet, 1846-anlegg, 1852–1951 Nytorvet, markedshistorie, basar, arbeiderbevegelse, krigsårene, Lilletinget, 1990-tallsopprustning og monumenter;
- Arbeiderbevegelsens arkiv og bibliotek – «Det røde torg»: Youngsløkka, anlegg 1846, navn, marked, fysisk opparbeidelse og arbeiderbevegelsens møtehistorie;
- eksisterende Torggata source base: enkelte kilder kan deles i klyngen bare når de eksplisitt omfatter flere steder. TØI-kilden om Torggata og Brugata er et konkret eksempel på delbar klyngeevidens, men er ikke automatisk Youngstorget-evidens.

## 7. Anti-generisk baseline

Følgende skal være eksplisitte porter i senere faser:

- `name-swap`: et Youngstorget-avsnitt skal feile dersom det fungerer like godt på et annet sentrumssted etter navnebytte;
- `specific-evidence-anchor`: hvert avsnitt skal ha minst ett konkret fysisk, kronologisk, sosialt eller institusjonelt Youngstorget-anker;
- `cross-place duplicate`: ingen lange setninger/avsnitt kopieres fra Torggata eller neste cluster-place;
- `source → claim → text`: every factual element in revised place text is traceable;
- `local experience`: brukeren skal kunne se/forstå noe konkret på eller rundt selve torget;
- `fullness`: rikt kildemateriale skal gi rikt innhold; Content Factory skal ikke brukes til å forkorte.

## 8. Sanerings- og produksjonsplan

| Fase | Status | Avgrenset leveranse |
| --- | --- | --- |
| 0. Nullmåling | **KLAR FOR REVIEW** | Denne rapporten + arbeidskort; ingen canonical innholdsendring |
| 1. Canonical identity/source | **NESTE** | Lås torget vs nærobjekter, manifest/source og metadata-semantikk; dokumenter 1846/1852-konflikten |
| 2. Content Factory source/claim pack | **IKKE STARTET** | Felles cluster source registry + claim scopes + Youngstorget-gap; ingen claim deles via nærhet alene |
| 3. Koordinater/geometri | **FORVENTET ALLEREDE FERDIG** | Tidligere-arbeid-gate skal bekrefte verified geometry; ingen ny geokoding uten regresjonsbevis |
| 4. Kategori/Badges/emner/Fagverk | **IKKE STARTET** | Re-audit politikk + 3 emner + underbadges og fagverk-runtime |
| 5. `desc` / `popupDesc` | **BLOKKERES AV SOURCE PACK** | Rett 1846/1852, skriv full kildebåret artikkel, production package, hashes/reviews |
| 6. Strukturerte profiler | **IKKE STARTET** | Temporal/spatial/history layers der substans finnes |
| 7. Popupfaner | **IKKE STARTET** | Om, Historie, Stories, Før/etter, Nyheter, Lesespor, Kilder + relevante direktefaner |
| 8. Rundinger | **BLOKKERENDE LEGACY-AVVIK** | 4+1; People · Objects · Brands · Related eller auditert koherensprofil; ingen filler |
| 9+. På stedet, quiz, relations, images, Data/UI/content QA, CI, ett-sted-gate | **IKKE STARTET / RE-AUDIT** | Full checklist, én fase av gangen |

## 9. Content Factory-måling

Pilotens økonomimåling skal registreres separat fra kvalitetsporten:

- antall kilder gjenbrukt fra Torggata-/cluster-research;
- antall claims som lovlig kunne deles med eksakt scope;
- antall source fetch/research-operasjoner som slapp å gjentas;
- antall claims som **ikke** kunne deles og derfor krevde Youngstorget-spesifikk research.

Ingen av tallene kan brukes som ferdigkriterium. Suksess er at Youngstorget blir minst like rikt, stedsspesifikt og kildebåret som separat produksjon, samtidig som duplisert research reduseres.

## 10. Fase-0 beslutning

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: Flere delsystemcommits identifisert; ingen tidligere full checklist-closeout for Youngstorget funnet
SISTE GODKJENTE TILSTAND: Canonical Place, verified geometry, eksisterende politikk-emner, Stories, quiz, 22+ People-koblinger, Brands og Lesespor
KONKRET REGRESJONSEVIDENS: desc blander 1846-anlegget med 1852-navnet; legacy rounds bryter dagens 4+1-kontrakt; tasks/Civication/Leksikon/routes/music ligger i eldre rundingsmodell
BESLUTNING: REELT FULLPRODUKSJONSARBEID MED MÅLRETTET BEVARING AV FERDIGE SUBSYSTEMER
```

Neste aktive fase er **1 – Canonical identity/source**. Ingen annen fase skal markeres `PÅGÅR` samtidig.