# Christiania Torv – sted-for-sted nullmåling V1

- Dato: 2026-08-23
- Place ID: `christiania_torv`
- Canonical place-fil: `data/places/by/oslo/places/christiania_torv.json`
- Place-manifest: `data/places/manifest.json`
- Koordinat-evidence: `data/coordinate-evidence/oslo/by/christiania_torv.json`
- People: `data/people/kunst/oslo/christiania_torv/wenche_gulbransen.json`
- Brands: `data/brands/brands_by_place.json`
- Leksikon: `data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json`
- Content Factory source pack: `reports/place-production/content-factory-pilot-03-kvadraturen-source-pack-v1.json`
- Primærkategori: `by`
- Produksjonsmetode: `data/places/regler/content_factory_v1.json`
- Status: **NULLMÅLING FERDIG – ingen brukerrettet flate godkjennes som komplett av denne rapporten**

Denne rapporten opprettes før første nye brukerrettede Christiania Torv-endring i Pilot 03. Eksisterende arbeid skal beholdes når det består dagens kontrakter. Research kan gjenbrukes fra Kvadraturen-klyngen, men godkjenning skjer bare for `christiania_torv` og én fase om gangen.

## 1. Canonical identitet og grense

| Kontroll | Nullmåling | Beslutning |
| --- | --- | --- |
| Canonical ID | `christiania_torv` | **BEHOLD** |
| Manifest | `places/by/oslo/places/christiania_torv.json` er manifest-loadet | **BEHOLD** |
| Objekt | Selve det navngitte torget/plassrommet i Kvadraturen | **LÅS** |
| Primærkategori | `by` | **BEHOLD, re-auditer faglig** |
| Koordinat | `verified_geometry`, OSM way `594329484`, area anchor | **ALLEREDE FERDIG med mindre regresjon påvises** |
| Separate canonical steder | Bl.a. `gamle_radhus` og andre bygg/institusjoner skal ikke absorberes inn i torget | **RELATION, IKKE PROXY** |
| Klynge | Christiania Torv → Bankplassen → Grev Wedels plass | **RESEARCHKLYNGE, IKKE SAMMENSLÅING** |

Canonical place-recorden skiller eksplisitt torgets area-anchor fra Gamle Rådhus. Denne grensen skal bevares i beskrivelse, Stories, rundinger, bilder og relasjoner.

## 2. Eksisterende faktagrunnlag og usikkerheter

Dagens `desc` og `popupDesc` er innholdsrike, men de mangler dagens fullstendige source→claim→sentence-produksjonspakke. Kvadraturen source pack dokumenterer allerede blant annet:

- torgets rolle som politisk, sivilt og handelsmessig sentrum etter byflyttingen i 1624;
- den regulerte renessanseformen og senere formendringer;
- rådhus, kirke, marked, vannpost og offentlig straff som funksjoner i/ved torget;
- Christianiamarkedet fra 1640-årene til flyttingen i 1736;
- Wenche Gulbransens `Christian IVs hanske` fra 1997.

Tre grenser er blokkerende:

1. Fortellingen om at Christian IV bokstavelig kastet en hanske skal **ikke** publiseres som etablert historisk faktum. Hansken kan omtales som kunstnerisk/historieformidlende motiv.
2. Mulig Livorno-forbilde skal ikke gjøres til sikker direkte modell.
3. `year: 1648` skal ikke automatisk tolkes som torgets grunnleggelsesår. Tekstlig tidslinje bruker dokumenterte 1624+-milepæler; metadatafeltet endres bare etter egen semantikkontroll.

## 3. Eksisterende innhold – behold, re-auditer eller produser

| Flate/system | Dagens data | Nullmålingsstatus | Neste krav |
| --- | --- | --- | --- |
| `desc` | Finnes og er rik | **RE-AUDIT** | Description v4.2 claim-first-pakke; behold bare kildebåret tekst |
| `popupDesc` | Finnes, sju avsnitt | **RE-AUDIT** | Full source→claim→sentence-paritet og place-grense |
| Description production package | Ingen `data/places/production/christiania_torv.json` funnet i preflight | **MANGLER** | Opprettes i egen fase |
| Koordinater | Verifisert geometrisk square-anchor | **ALLEREDE FERDIG** | Ikke geokod på nytt |
| `emne_ids` | `em_by_torg_plasser_som_scene`, `em_by_offentlige_rom_motesteder` | **EKSISTERER, RE-AUDIT** | Fagverk-gate før eventuell endring |
| Structured profiles | Ingen `spatial_profile`, `temporal_profile`, `history_layers`, `source_summary` | **REELT HULL** | Materialiser bare det kildepakken bærer |
| People | Wenche Gulbransen finnes som direkte, kildebelagt place-person | **EKSISTERER, RE-AUDIT** | Finn/reuse andre canonical People; ingen duplikater |
| Brands | Åtte eksisterende brand-koblinger | **CURRENT-VOLATILE / RE-AUDIT** | Brand-regler + fersk own-place/verifisering |
| Objects | Hanskefontenen er sterk kandidat, men ingen canonical Object ble funnet i preflight | **REELT HULL** | Object-kontrakt; ikke dupliser Wonderkammer-mikrosted |
| Rundinger | Ingen godkjent 4+1-profil i place-recorden | **REELT HULL** | Nøyaktig fire innholdsrundinger + fast Badge; ingen filler |
| Story | Ingen square-owned `christiania_torv` Story identifisert | **REELT HULL** | Story-governance; ikke stjel `gamle_radhus`-Story |
| Quiz | Ingen Christiania Torv-sett identifisert ved quiz-id/target-søk | **REELT HULL** | Produser etter Quiz-kontrakten og source claims |
| Leksikon | Eksisterer i `leksikon_oslo_by_batch3.json`, men eldre oppføring har tomme `sources` | **RE-AUDIT** | Kilder og stedsspesifisitet før godkjenning |
| Språk/navn | Ingen egen språkprofil i place-recorden | **REELT HULL / RESEARCH** | Christiania-navn/navnehistorie; ingen oppdiktet dialekt |
| Lesespor | Ingen `lesespor_christiania*` identifisert i preflight | **REELT HULL** | Kilde-/lesespor vurderes og materialiseres når kontrakten bærer det |
| Før/etter | Ingen source-safe place-eid par identifisert | **IKKE GODKJENT** | Rettighet + samme motiv/retning; ellers begrunnet N/A |
| Routes/relations | Oppdag Kvadraturen-materiale finnes, men intern canonical rute er ikke bevist | **RE-AUDIT** | Reuse canonical route bare hvis faktisk ID finnes |
| Nyheter | Ingen evergreen nyhet skal fylles inn uten fersk relevant sak | **RESEARCH/N/A** | Current-volatile gate |
| Natur | Historisk bytorg uten dokumentert naturfaglig hovedrolle | **FORELØPIG N/A** | Ikke lag naturfiller |

## 4. Popupflater – nullstatus

| Fane | Status | Krav |
| --- | --- | --- |
| Om | **IKKE GODKJENT** | Description-pakke og claim-paritet |
| Historie | **IKKE GODKJENT** | Structured history layers + kilder |
| Fortellinger | **IKKE STARTET** | Square-owned Story |
| Før/etter | **IKKE STARTET / MULIG N/A** | Source-safe bildepar |
| Nyheter | **IKKE STARTET / MULIG N/A** | Fersk, varig relevant sak |
| Lesespor | **IKKE STARTET** | Reelt kildespor, ikke generisk leseliste |
| Kilder | **IKKE FERDIG** | `source_summary.safe_sources` |
| Språk | **IKKE STARTET** | Dokumentert navn-/språkhistorie |
| Spor og objekter | **IKKE STARTET** | Canonically owned fysisk Object |
| Legg merke til | **IKKE STARTET** | Stedsspesifikke observerbare spor |
| Betydning | **IKKE STARTET** | Kildebåret tolkning |
| Motpunkter | **IKKE STARTET** | Faktiske sammenligningssteder |
| Relasjoner | **IKKE STARTET** | Separate canonical places/entities |
| Kunnskap | **IKKE STARTET** | Fagverk/quiz hooks |
| Observasjoner | **IKKE STARTET** | Fysiske, trygge observasjoner på torget |

## 5. Behold/saner/produser-plan

**Behold uten ny research når dagens kontrakt består:** canonical ID, manifest-eierskap, verifisert OSM-geometri, lokal place-grense og Wenche Gulbransen som eksisterende People-kandidat.

**Re-auditer før godkjenning:** `desc`, `popupDesc`, `year`, emner, quiz/leksikon-fravær, brand-koblinger, People-dekning, relasjoner, local images og alle popupflater.

**Produser der reelle hull består:** description package, structured profiles, source summary, square-owned Story, Quiz, språk/navnprofil, relevant Object/round profile, lesespor/observasjon/knowledge-hooks og final completion packet.

**Ikke produser:** generisk natur, kunstige subplaces, påstått historisk hanskekast, proxyinnhold fra Gamle Rådhus eller andre nabobygg, stale virksomheter eller filler bare for å nå felt-/rundetall.

## 6. Faseplan

1. **Fase 1 – denne nullmålingen og arbeidskortet.**
2. **Fase 2 – identity/source/coordinate prior-work gate.** Ingen koordinatendring uten regresjonsbevis.
3. **Fase 3 – Fagverk/kategori/emne audit.**
4. **Fase 4 – description v4.2 package + nødvendig tekstkorreksjon.**
5. **Fase 5 – structured profiles og brukerrettet source summary.**
6. **Fase 6 – Story + historisk opplevelse.**
7. **Fase 7 – Quiz/Knowledge.**
8. **Fase 8 – People/Objects/Brands/Related og 4+1-rundinger.**
9. **Fase 9 – språk, lesespor, observasjoner, ruter og øvrige popupflater; Før/etter/Nyheter bare hvis evidens og rettigheter bærer det.**
10. **Fase 10 – helhetlig slutt-QA, anti-generic gate og production completion packet.**

Bare én fase skal være aktiv. Neste fase starter først etter grønn merge og kontroll på faktisk `main`.
