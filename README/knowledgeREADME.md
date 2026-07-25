# History GO — Knowledge

Status: **operational compatibility-pointer**  
Sist kontrollert: **2026-07-25**

Denne filstien beholdes som inngang for eldre lenker. Den eier ingen selvstendig Knowledge-, ontology-, knagge- eller quizmodell.

## Les i denne rekkefølgen

1. [`../docs/KNOWLEDGE_ARCHITECTURE.md`](../docs/KNOWLEDGE_ARCHITECTURE.md) — canonical menneskelesbar arkitektur, eierskap og runtimeavgrensning
2. [`../data/knowledge/knowledge_system_policy_v1.json`](../data/knowledge/knowledge_system_policy_v1.json) — maskinlesbar systempolicy
3. [`../data/knowledge/knowledge_unit_schema_v1.json`](../data/knowledge/knowledge_unit_schema_v1.json) — canonical knowledge-unit-schema
4. [`../data/quiz/quiz_knowledge_delivery_contract_v1.json`](../data/quiz/quiz_knowledge_delivery_contract_v1.json) — quizens kunnskaps- og evidenskontrakt
5. [`../js/knowledgeV2.ts`](../js/knowledgeV2.ts) — varig personlig read-model og legacy-migrering
6. [`../js/knowledgeQuizMemory.ts`](../js/knowledgeQuizMemory.ts) — quiz-bundles, lesing, vurdering og synkronisering til V2

## Aktiv storage

- `hg_knowledge_entries_v2` — varig, søkbar personlig Knowledge-read-model
- `hg_knowledge_memory_v1` — quizens bundle- og evidenslager; synkroniseres til V2
- `knowledge_universe` — legacy-importkilde som fjernes etter migrering, ikke parallell storage

## Kontrakttester

Storage- og integrasjonskravene håndheves blant annet av:

- `tests/knowledge-canonical-storage-contract.test.js`
- `tests/quiz-knowledge-memory.test.js`
- `tests/knowledge-profile-memory-integration.test.js`
- `tests/knowledge-browser-e2e.test.mjs`

## Historikk

De tidligere parallelle dokumentene om minnekammer, quiz-kompatibilitet, seksnivå-ontologi, knaggeregister og People/Places/Relations-arkitektur er arkivert byte-identisk under:

- [`../reports/archive/2026-07/knowledge/`](../reports/archive/2026-07/knowledge/)

Historikkfilene kan ikke overstyre canonical policy, schema, TypeScript-runtime eller tester.
