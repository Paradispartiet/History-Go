# Birkelunden – sted-for-sted nullmåling V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Snapshot av `main`: `5f988ef475a8d84287b5d8db3d34ec1acc80ec03`
- Canonical place-fil: `data/places/by/oslo/places/birkelunden.json`
- Place-manifest: `data/places/manifest.json`
- Koordinat-evidence: `data/coordinate-evidence/oslo/by/birkelunden.json`
- Legacy Leksikon: `data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json`
- Quizmanifest: `data/quiz/manifest.json`
- Stories kontrollert: `data/stories/places_by.json`, `data/stories/narratives.json` og `data/stories/`
- Lesespor kontrollert: `data/lesespor/manifest.json`, `data/lesespor/oslo/lesespor_oslo_by.json`, `data/lesespor/oslo/lesespor_oslo_historie.json`, `data/lesespor/oslo/lesespor_oslo_natur.json`
- Brands: `data/brands/brands_by_place.json`
- People: `data/people/historie/oslo/people_historie_oslo.json`
- Ruter: `data/routes.json`, `data/routes_walks.json`
- Språk: `data/leksikon/sprak/manifest.json`
- Primærkategori: `by`
- Produksjonsmetode: `data/places/regler/content_factory_v1.json`
- Klynge: **Birkelunden → Olaf Ryes plass**
- Status: **NULLMÅLING FERDIG – ingen brukerrettet innholdsflate er godkjent som komplett av denne rapporten**

Denne rapporten er opprettet før første nye Birkelunden-innholdsendring i Content Factory Pilot 02. Den er en behold/saner/produser-plan, ikke en readiness-erklæring. Eksisterende arbeid skal gjenbrukes når det består dagens kontrakter. Ingen gammel tekst, relasjon eller teknisk grønnstatus får automatisk godkjenningsstatus bare fordi den allerede finnes.

## 1. Canonical identitet og klyngegrense

| Kontroll | Nullmåling | Beslutning |
| --- | --- | --- |
| Canonical ID | `birkelunden` | **BEHOLD** |
| Manifest-loadet source | `places/by/oslo/places/birkelunden.json` finnes i `data/places/manifest.json` | **BEHOLD** |
| Objektidentitet | Selve det avgrensede parkrommet Birkelunden på Grünerløkka | **BEHOLD OG LÅS** |
| Koordinatidentitet | OSM way `3236549`, `verified_geometry`, parkanker | **ALLEREDE FERDIG** med mindre konkret regresjon finnes |
| Primærkategori | `by` | **BEHOLD inntil egen kategori/Fagverk-audit dokumenterer noe annet** |
| Researchklynge | Birkelunden → Olaf Ryes plass | **DELT RESEARCH KAN BRUKES, MEN PLACE-APPROVAL ER SEPARAT** |

Koordinatevidensen avgrenser eksplisitt Birkelunden fra Birkelunden holdeplass, Paulus plass og Paulus kirke. Den grensen gjelder hele videre produksjonen: nabobygg og naboplass kan være dokumenterte relasjoner, men kan ikke bære Birkelundens hovedtekst, Story, Før/etter, Objects eller andre flater som stedfortreder.

### Viktig scope-funn: park vs. Birkelunden kulturmiljø

Dagens `popupDesc` går fra selve parken til det større fredede **Birkelunden kulturmiljø**, og omtaler blant annet et område på 116 dekar, 15 kvartaler og 139 leiegårder. Dette kan være relevant kontekst, men det er ikke automatisk samme canonical objekt som park-place `birkelunden`.

Beslutning: **PLACE-SCOPE RE-AUDIT ER BLOKKERENDE i source/claim- og description-fasen.** Det større kulturmiljøet kan ikke restemples som parkens egen fysiske utstrekning. Source pack skal skille:

1. claims om selve parken;
2. claims om det større verne-/kulturmiljøet;
3. relasjonsclaims om Paulus kirke, omkringliggende leiegårder, Thorvald Meyers gate og Olaf Ryes plass.

## 2. Tidligere arbeid som skal gjenbrukes, ikke produseres på nytt

Repo- og PR-audit viser betydelig tidligere delarbeid:

- tidligere description-revisjon har gitt Birkelunden en relativt fyldig `desc` og `popupDesc`;
- koordinatkontroll har materialisert parkgeometri og identitetsgrense;
- Nature-arbeid har materialisert `nature_profile`;
- eldre Leksikon-batch inneholder en Birkelunden-artikkel;
- People-systemet har minst Thorvald Meyer som primær Birkelunden-person og Olaf Rye som sekundær kobling;
- Grünerløkka/Birkelunden har vært brukt i fag-/feltarbeid og eldre research;
- kulturmiljøarbeid har identifisert offisielt vernegrunnlag som relevant forskningsspor.

Dette er råstoff og tidligere arbeid, ikke bevis på at dagens komplette checklist er lukket.

## 3. Dagens place-record – sterke flater og teknisk baseline

Canonical `birkelunden.json` har allerede:

- `lat: 59.92634`, `lon: 10.76013`, `r: 190`;
- `coordType: park_anchor`;
- `coordStatus: verified_geometry`;
- `coordSourceId: osm-way:3236549`;
- en historisk orientert `desc`;
- en `popupDesc` på om lag 300 ord med parkhistorie, paviljong, nabolagskontekst og vern;
- `nature_profile` med terreng-/vegetasjonsbeskrivelse, temaer og nærliggende natur-/parksteder;
- `quiz_profile` som redaksjonell produksjonsretning;
- to `em_by_*`-koblinger:
  - `em_by_parker_som_sosial_infrastruktur`;
  - `em_by_opphold_vs_gjennomgang`;
- relasjonsfelt til `daelenenga_idrettspark`.

Ingen av disse punktene alene betyr at subsystemet er ferdig etter dagens kontrakt.

## 4. Eksisterende innhold – behold, saner eller produser

| Flate/system | Dagens data | Nullmålingsstatus | Neste krav |
| --- | --- | --- | --- |
| Canonical identitet | Park-place er manifest-loadet og eksplisitt avgrenset | **ALLEREDE FERDIG / BEHOLD** | Identitetsgrensen låses i fase 1 |
| Koordinater | `verified_geometry`, OSM way 3236549, applied evidence | **ALLEREDE FERDIG** | Ikke geokod på nytt uten regresjon |
| `desc` | Finnes og er stedsspesifikk | **RE-AUDIT** | Dagens v4.2 claim-first-kontrakt, scope og fakta |
| `popupDesc` | Finnes og er fyldig | **RE-AUDIT / MULIG OMSKRIVNING** | Source→claim→sentence, park/kulturmiljø-grense, superlativ-/vernclaims |
| Description production package | `data/places/production/birkelunden.json` finnes ikke | **MANGLER** | Må materialiseres i description-fasen dersom teksten godkjennes/revideres |
| Fagverk/emner | To `em_by_*` finnes | **EKSISTERER, RE-AUDIT** | By-fagverk og stedsevidens kontrolleres separat |
| Underbadges | Ingen eksplisitte `underbadge_ids` i canonical place | **MÅ VURDERES** | Bare kilde-/fagbegrunnede underbadges |
| Nature | `nature_profile` finnes | **EKSISTERER, RE-AUDIT** | Kilder, arts-/habitatnivå, brukerrettet verdi og By-vs-Natur-eierskap |
| Quiz | `quiz_profile` finnes, men `data/quiz/manifest.json` har ingen `targetId: birkelunden` | **REELT PRODUKSJONSHULL** | Quiz-kontrakten; profile ≠ aktiv quiz |
| Stories | Ingen Birkelunden-eid canonical Story/narrative funnet i aktiv Stories-kjerne | **REELT PRODUKSJONSHULL** | Research etter reell episode/narrativ akse; ikke chronology som Story |
| Leksikon | Version 1-post i `leksikon_oslo_by_batch3.json` | **LEGACY / SANERINGSBEHOV** | Generisk tekst, `medium` facts/chronology og tomme `sources`; må ikke konkurrere ukritisk med godkjent Om/Historie |
| People | Thorvald Meyer har `placeId: birkelunden`; Olaf Rye har Birkelunden i `places` | **EKSISTERER, RE-AUDIT** | Own-place-evidens, profiler, bilder og round-scope; naboplassrelasjon er ikke filler |
| Objects | Ingen canonical `place.objects` | **REELT PRODUKSJONSHULL** | Kandidater som musikkpaviljongen vurderes source-first; nabobygg med egen Place-ID er ikke Objects |
| Brands | `brands_by_place.json` har ingen `birkelunden`-mapping | **RESEARCHHULL, IKKE N/A** | Brand-reglene krever faktisk kandidataudit før N/A kan vurderes |
| Rundinger | Ingen auditert `round_profile` i place-record | **IKKE FERDIG** | `by`-standard er people · objects · brands · structures, eventuelt dokumentert fallback/overstyring; alle fire må ha substans |
| Structures | Ingen auditert samling | **RESEARCHHULL** | Bare navngitte bygg/anlegg som faktisk tilhører park-place; canonical naboplaces ekskluderes |
| Før/etter | Ingen `for_na` | **REELT PRODUKSJONSHULL** | Samme parkrom gjennom tid, rettighetsklar bildepar og observerbar endring |
| Nyheter | Ingen godkjent Birkelunden-current/news-flate identifisert | **RESEARCHHULL** | Fersk, stedsspesifikk research senere |
| Lesespor | Ingen Birkelunden-kobling i kontrollerte By-, Historie- eller Natur-filer | **REELT PRODUKSJONSHULL** | Åpne, direkte stedsspesifikke tekster research-es; tilgang/status må eies item-for-item |
| Kilder | Ingen `source_summary.safe_sources` og ingen inspectable sourcepakke i place | **REELT PRODUKSJONSHULL** | Bygges fra source/claim pack; tekniske IDs vises ikke som brukerrettede kilder |
| Språk | Ingen `birkelunden` i Språkleksikon-manifestet | **MÅ RESEARCHES, IKKE BEVIST N/A** | Navnehistorie/etymologi og dokumentert lokalt språkstoff vurderes etter Språkleksikon-kontrakten |
| Ruter | Ingen Birkelunden-stopp funnet i `data/routes.json` eller `data/routes_walks.json` | **RESEARCHHULL** | Lokal Grünerløkka-rute vurderes source-/opplevelsesmessig senere |
| Relasjoner | Place har `related_place_ids`/sportskobling til Dælenenga; ingen Birkelunden-treff i legacy `data/relations.json` | **EKSISTERER DELVIS / RE-AUDIT** | Dokumenterte place↔place-relasjoner bygges i riktig system |
| Images | Canonical hovedbilde finnes | **EKSISTERER, IKKE SLUTT-QA** | Lisens/proveniens, rundingspreview og eventuelle historiske/før-nå-bilder kontrolleres senere |
| På stedet | Ikke re-auditert etter dagens onsite-kontrakt | **IKKE STARTET** | Ingen legacy tasks-fyll; kategori-/stedstypepolicy avgjør |
| Knowledge/observations | Ikke bevist som place-eid, publiserbart lag | **IKKE STARTET** | Materialiseres bare med source-eid innhold |

## 5. Popup – separat nullstatus

| Fane | Nullmålingsstatus | Evidens / blokkering |
| --- | --- | --- |
| Om | **EKSISTERER, IKKE GODKJENT** | Fyldig `popupDesc`, men ingen v4.2 production package og park/kulturmiljø-scope må skilles |
| Historie | **EKSISTERER SOM RÅSTOFF, IKKE GODKJENT** | Historiske milepæler finnes i popuptekst; legacy chronology er generisk og ukildet |
| Fortellinger | **IKKE STARTET** | Ingen canonical Birkelunden-Story funnet |
| Før/etter | **IKKE STARTET** | Ingen `for_na` |
| Nyheter | **IKKE STARTET** | Ingen godkjent current/news-pakke funnet |
| Lesespor | **IKKE STARTET** | Ingen Birkelunden-entry i kontrollerte aktive Oslo-filer |
| Kilder | **IKKE FERDIG** | Ingen `source_summary` / brukerrettet kildepakke |
| Språk | **IKKE STARTET / MÅ VURDERES** | Ingen Språkleksikon-fil |
| Spor & objekter | **IKKE STARTET** | Ingen canonical Objects |
| Legg merke til | **IKKE GODKJENT** | Må komme fra kilde-/observasjonsgrunnlag, ikke generisk parkprosa |
| Betydning | **IKKE GODKJENT** | Faglig betydning finnes som tema, men trenger source-eid materialisering |
| Motpunkter | **IKKE GODKJENT** | Ingen godkjent kontrast-/inferensflate |
| Relasjoner | **DELVIS DATA, IKKE GODKJENT FANE** | Dælenenga og nabosteder må auditeres for faktisk forklaringsverdi |
| Kunnskap | **IKKE STARTET** | Quiz er ikke aktiv; ingen shortcut fra `quiz_profile` |
| Observasjoner | **IKKE STARTET** | Skal være dokumentert og faktisk nyttig på stedet |

## 6. Rundings-nullmåling

Birkelunden er canonical kategori `by`, ikke `natur`. Etter dagens rundingskontrakt er normalprofilen derfor:

```text
people · objects · brands · structures
```

`nature_profile` gjør ikke automatisk stedet til et Nature-round-place. Samtidig er dagens baseline for `objects`, `brands` og `structures` for tynn til å godkjenne standardprofilen.

Fase 8 skal derfor ikke fylle fire plasser mekanisk. Før rundingsvalget låses må vi:

1. own-place-auditere People;
2. research-e Objects;
3. auditere Brand-kandidater etter brand-reglene;
4. skille park-eide structures fra Paulus kirke/andre canonical naboplaces;
5. bare bruke `images` eller annen tillatt overstyring dersom faktisk innhold gjør det bedre og kontrakten tillater det.

## 7. Content Factory Pilot 02 – hva kan deles med Olaf Ryes plass

Følgende researchfamilier er reelle kandidater for delt researchpass:

- Grünerløkkas 1800-talls byutvikling og kvartalsstruktur;
- Thorvald Meyer og privat grunneierskap/byutvikling;
- parker/plasser som sosial infrastruktur;
- kommunal/vernefaglig dokumentasjon om Birkelunden kulturmiljø;
- forholdet mellom parkrom, gatestruktur og omkringliggende leiegårdsby;
- mulige Grünerløkka-ruter og historiske lesespor.

Men claims må ha eksplisitt place-scope. Eksempler:

- Et claim om Birkelundens gave-/parkhistorie kan **ikke** automatisk brukes på Olaf Ryes plass.
- Et claim om Olaf Rye-navnet kan **ikke** automatisk bli Birkelunden-språkinnhold.
- Et områdeclaim om Grünerløkka kan bare brukes i Birkelunden-tekst når kilden faktisk støtter den konkrete sammenhengen med parken.
- Paulus kirke kan være en relasjon/visuell nabo; den skal ikke brukes som Birkelundens Object eller Før/etter-proxy dersom den har egen canonical place-identitet.

## 8. Faseplan etter nullmålingen

Produksjonen skal følge én-fase-om-gangen-regelen:

1. **Fase 1 – canonical identity/source boundary**: lås park vs. større kulturmiljø og naboplaces.
2. **Fase 2 – Content Factory source/claim pack**: delt Grünerløkka-kildebase + Birkelunden-spesifikke gaps.
3. **Fase 3 – koordinater**: forventet `ALLEREDE FERDIG`, dokumenter kun dersom evidensen fortsatt består.
4. **Fase 4 – kategori/Badges/emner/Fagverk/Nature-eierskap**.
5. **Fase 5 – `desc`/`popupDesc` v4.2**: behold så mye god tekst som claim-/scope-gaten tillater; ingen omskriving for omskrivingens skyld.
6. **Fase 6 – strukturerte place-profiler**.
7. **Fase 7 – popupfaner**, separat per fane.
8. **Fase 8 – 4+1-rundinger** etter People/Objects/Brands/Structures-audit.
9. **Fase 9–19 – onsite, Quiz, flows, People, Brands, discovery/relations, progresjon, bilder og øvrige relevante checklistflater**.
10. **Fase 20–24 – data/UI/innhold/CI/slutt-QA og ett-sted-gate**.

Faseplanen kan fininndeles når subsystemkontraktene krever det, men ingen senere fase får status ferdig før den er separat reviewet og merget.

## 9. Pilotens kvalitetsporter

Hver brukerrettet produksjonsfase må fortsatt bestå:

- name-swap-test;
- cross-place duplicate-check;
- place-specific evidence anchors;
- source → claim → text;
- local experience-test;
- fullness-test;
- own-place-grense mot nabo-/delsteder;
- relevante subsystemtester og manuell slutt-QA.

**Efficiency er aldri ferdigstatus.** Dersom shared research ikke dekker Birkelunden godt nok, er neste handling mer Birkelunden-spesifikk research.

## 10. Fase-0 beslutning

Birkelunden er et godt Pilot-02-sted fordi repoet allerede har verdifullt grunnarbeid, samtidig som dagens komplette checklist avdekker reelle hull. Det gjør det mulig å måle om Content Factory faktisk reduserer dobbelt researcharbeid uten å redusere sluttkvaliteten.

Fase 0 endrer **ingen canonical place-data**. Neste fase etter grønn review/merge er **fase 1 – canonical identity/source boundary**.