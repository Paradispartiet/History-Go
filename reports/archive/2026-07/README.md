# Dokumentarkiv — juli 2026

Denne mappen inneholder tidsbundne dokumentasjonssnapshots som tidligere lå i aktive dokumentasjonsflater.

Filene bevares for sporbarhet, men er **ikke** nåstatus og kan ikke overstyre registrerte canonical eller operational dokumenter.

## Arkiverte snapshots

- [`TYPESCRIPT_CORE_MIGRATION_STATUS_2026-07-20.md`](./TYPESCRIPT_CORE_MIGRATION_STATUS_2026-07-20.md) — datert statuspunkt for TypeScript-migreringen
- [`AHA_IMPLEMENTATION_STATUS.md`](./AHA_IMPLEMENTATION_STATUS.md) — tidsbundet AHA-implementasjonsstatus
- [`CIVICATION_BADGE_ROLE_MAPPING_AUDIT.md`](./CIVICATION_BADGE_ROLE_MAPPING_AUDIT.md) — badge → role_scope-status
- [`CIVICATION_FLOW_AUDIT.md`](./CIVICATION_FLOW_AUDIT.md) — kode- og flytsnapshot
- [`CIVICATION_FUNCTIONALITY_REVIEW.md`](./CIVICATION_FUNCTIONALITY_REVIEW.md) — funksjonsgjennomgang fra 2. juli 2026
- [`CIVICATION_RUNTIME_OWNERSHIP_AUDIT.md`](./CIVICATION_RUNTIME_OWNERSHIP_AUDIT.md) — runtime-eierskapsaudit
- [`CIVICATION_WORKDAY_PHASE_INTEGRATION_AUDIT.md`](./CIVICATION_WORKDAY_PHASE_INTEGRATION_AUDIT.md) — arbeidsdags-/faseintegrasjon fra 22. juni 2026
- [`civication-status-audit.md`](./civication-status-audit.md) — merge-status fra 3. juni 2026
- [`PROFILE_PROGRESS_REUSE_AUDIT.md`](./PROFILE_PROGRESS_REUSE_AUDIT.md) — beslutningsaudit før aktiv progress-reader-runtime
- [`knowledge/`](./knowledge/) — seks tidligere Knowledge-, ontology-, knagge- og quiz-memory-modeller, bevart byte-identisk
- [`legacy-readmes/`](./legacy-readmes/) — fire gamle globale relations-, oppgave-, BY-fag- og badge-modeller, bevart byte-identisk
- [`historical-routes/`](./historical-routes/) — tidligere konsept-, mekanikk- og faseplan for Historiske ruter, bevart byte-identisk

## Aktive kilder

TypeScript:

- [`../../../docs/TYPESCRIPT_FIRST_POLICY.md`](../../../docs/TYPESCRIPT_FIRST_POLICY.md)
- [`../../../docs/typescript-migration-plan.md`](../../../docs/typescript-migration-plan.md)
- [`../../../docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](../../../docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md)

Civication:

- [`../../../docs/CIVICATION_README.md`](../../../docs/CIVICATION_README.md)
- [`../../../README/SYSTEM_REGISTRY.md`](../../../README/SYSTEM_REGISTRY.md)
- [`../../../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../../../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md)
- [`../../../README/SYSTEM_MAP.md`](../../../README/SYSTEM_MAP.md)
- [`../../../js/Civication/README.md`](../../../js/Civication/README.md)

Profil og progresjon:

- [`../../../docs/PROGRESSION_MODEL.md`](../../../docs/PROGRESSION_MODEL.md)
- [`../../../docs/PROFILE_PROGRESS_READER_RUNTIME.md`](../../../docs/PROFILE_PROGRESS_READER_RUNTIME.md)

Knowledge:

- [`../../../docs/KNOWLEDGE_ARCHITECTURE.md`](../../../docs/KNOWLEDGE_ARCHITECTURE.md)
- [`../../../data/knowledge/knowledge_system_policy_v1.json`](../../../data/knowledge/knowledge_system_policy_v1.json)
- [`../../../data/knowledge/knowledge_unit_schema_v1.json`](../../../data/knowledge/knowledge_unit_schema_v1.json)
- [`../../../data/quiz/quiz_knowledge_delivery_contract_v1.json`](../../../data/quiz/quiz_knowledge_delivery_contract_v1.json)

AHA:

- bruk de spesifikke AHA-kontraktene under `docs/`
- verifiser runtime og testsuiter før status hevdes

Nye daterte audits, reviews og statuspunkter skal normalt legges under `reports/` eller `reports/archive/YYYY-MM/`, ikke opprettes som nye globale styringsdokumenter under `docs/`.
