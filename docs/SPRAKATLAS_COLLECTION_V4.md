# Språkatlas → samling v4

Status: canonical produktkontrakt for eksplisitt samling av dokumenterte atlasbelegg.

## Mål

Språkatlaset skal kunne bidra direkte til History Go som samleapp uten å få en ny database, et nytt fag eller en separat AHA-eksport. Brukeren kan samle ett dokumentert `feature_evidence`-belegg fra en lokal atlasprofil ved en eksplisitt handling.

## Canonical eierskap

Atlasprofilen i `data/leksikon/sprak/norge_atlas_v1.json` er fortsatt eier av `local_varieties[].feature_evidence`. Samling lager bare brukerens Knowledge V2-representasjon av det valgte belegget. Belegget kopieres ikke til en Place-fil, og et enkelt-Place får aldri eierskap til en dialekt gjennom samling.

Dialektinnhold i Språkleksikonet følger fortsatt den harde regelen om `placeScope: "area"`. v4 endrer ikke denne regelen.

## Samlingslager

v4 bruker bare den eksisterende canonicale Knowledge V2-butikken:

`hg_knowledge_entries_v2`

Runtime leser via `HGKnowledgeV2.getEntries()` når API-et er tilgjengelig og bruker samme canonical key ved persist. Det opprettes ingen `language_collection`, `dialect_collection`, `sprakatlas_collection`, atlas-store eller annen parallell localStorage-kilde.

`collection_kind: "language"` gjenbrukes som samlingsfasett. Dette er ikke et fag.

## Eksplisitt brukerhandling

Å åpne et Place, Språkatlaset, en lokal profil eller et atlasbelegg samler ingenting.

For `evidence_materialized` lokale profiler viser hvert canonical `feature_evidence` en egen **Samle kunnskapen**-handling når runtime kan løse en sikker canonical fagkobling. Først når brukeren trykker denne knappen skrives en Knowledge V2-entry.

`documented_seed` og `local_research_required` får ingen konstruert samleinnhold. De kan fortsatt vises i forsknings-/atlasnavigasjonen etter eksisterende regler.

## Fagkobling

Atlaset oppretter aldri `sprak` som nytt History Go-subject.

Et atlasbelegg kan bare samles når v4 kan løse `subject_id` / `fagkart_category_id` til en faktisk ID som finnes i `HGKnowledgeV2.SUBJECT_LABELS`. Fagkonteksten må komme fra et eksplisitt canonical Place-spor for den lokale atlasprofilen:

- først brukes det åpne Place dersom dette Place eksplisitt har profil-ID-en i `atlas_local_ids` og har en gyldig fagkobling;
- ellers kan runtime bruke koblingen når alle gyldige eksplisitte Place-spor peker til samme canonical fag;
- ved tvetydig eller manglende fagkobling samles ikke belegget.

Det gjøres ingen geografisk inferens, nærmeste-sted-logikk eller koordinatbasert gjetning.

## Stabil dedupe

Knowledge-ID-en bygges deterministisk av:

- atlasprofil-ID;
- `feature_evidence.id`.

Samme belegg får derfor samme `knowledge_unit_id` uansett hvor mange ganger brukeren åpner profilen. Før persist sjekkes både Knowledge-ID og kombinasjonen `atlas_profile_id` + `feature_evidence_id`. Gjentatt samling lager ikke en ny entry.

## Provenance

Den samlede Knowledge V2-entryen beholder minst:

- `source.type: "language_atlas"`;
- `source.source_file: "data/leksikon/sprak/norge_atlas_v1.json"`;
- `source.atlas_profile_id`;
- `source.feature_evidence_id`;
- `source.source_urls`;
- claim som `text`;
- label som term;
- `profile_status`;
- `evidence_last_verified` når tilgjengelig;
- `time_scope` når tilgjengelig;
- macro-/region-ID og navn;
- alle eksplisitt koblede canonical Place-ID-er og navn;
- relevante Språkleksikon-kildefiler for Place-relasjonene.

`atlas_provenance.owner` er alltid `local_varieties.feature_evidence`, slik at Knowledge-entryen ikke kan tolkes som om Place-filen har overtatt eierskapet.

## AHA

Ingen ny Språkatlas→AHA-eksport opprettes. History Go eksporterer allerede `hg_knowledge_entries_v2` gjennom `aha_import_payload_v1`, og kontrakten tillater Knowledge-entryene som hele objekter. Atlas-provenance følger derfor den eksisterende private importgrensen sammen med annen samlet kunnskap.

## UI

v4 utvider bare den eksisterende Språkatlas-seleksjonen. Det opprettes ingen ny PlaceCard-runding.

For et samleklart atlasbelegg vises claim, tids-/verifiseringsmetadata, kilder og **Samle kunnskapen**. Etter samling skifter knappen til **Samlet**.

Kartopplevelse v3 og vanlig `HGMapView.openPlace()`-navigasjon forblir urørt.

## Permanente porter

`tests/sprakatlas-collection-v4.test.mjs` låser at:

- samling bare skjer ved eksplisitt knappetrykk;
- bare `hg_knowledge_entries_v2` brukes;
- `sprak` ikke kan bli et Subject;
- ID og dedupe er stabile;
- atlasprofil-ID, feature-evidence-ID, claim, kilder, tid og geografi beholdes;
- `documented_seed` ikke får filler eller konstruerte Place-relasjoner;
- `evidence_materialized` profiler bruker eksplisitte Place-relasjoner;
- dialekteierskap fortsatt ligger i atlasprofilen eller et `placeScope: "area"`-Place;
- AHA bruker eksisterende Knowledge V2-grense;
- language CI kjører v4 syntax og regressjoner permanent.
