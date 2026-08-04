#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/subkultur-foundation-audit.json';
const PATHS = Object.freeze({
  contract: 'data/fag/subkultur/subkultur_fagverk_contract_v1.json',
  fagkart: 'data/fag/subkultur/fagkart_subkultur_canonical_v4_5.json',
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json',
  methods: 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  mapping: 'data/fag/subkultur/emnemapping_subkultur_canonical_v4_5.json',
  pensum: 'data/fag/subkultur/subkulturpensum_canonical_v4_5.json',
  subjectStatus: 'data/fagverk/subject_status.json',
  portal: 'data/fagverk/fagverk_portal.json',
  registry: 'data/fagverk/fagverk_registry.json',
  placeManifest: 'data/places/manifest.json',
  peopleManifest: 'data/people/manifest.json',
  quizLegacy: 'data/quiz/quiz_subkultur.json',
  quizFromBy: 'data/quiz/quiz_subkultur_from_by.json'
});

// Public emne-ID-er skal beholde den faglige betydningen de hadde før
// åttedomenemigrasjonen. Presisering av definisjoner er tillatt; gjenbruk av en
// etablert ID for et annet begrep er ikke tillatt.
const LEGACY_TITLE_BY_ID = Object.freeze(
{
  "em_sub_arrangorer_dugnad": "Arrangører og dugnad",
  "em_sub_autentisitet_tap": "Autentisitet og tap",
  "em_sub_autonomi_motstand": "Autonomi og motstand",
  "em_sub_avvik_normalitet": "Avvik og normalitet",
  "em_sub_byutvikling_regulering": "Byutvikling og regulering",
  "em_sub_cosplay_fandom": "Cosplay og fandom",
  "em_sub_deltakelse_laring": "Deltakelse og læring",
  "em_sub_digitale_miljoer": "Digitale miljøer",
  "em_sub_diy_praksis": "DIY-praksis",
  "em_sub_dokumentasjon_arkiv": "Dokumentasjon og arkiv",
  "em_sub_estetikk_affekt": "Estetikk og affekt",
  "em_sub_fandom_nisjer": "Fandom og nisjer",
  "em_sub_fanziner_plakater": "Fanziner og plakater",
  "em_sub_gaming_lan": "Gaming og LAN",
  "em_sub_gentrifisering_tap": "Gentrifisering og tap",
  "em_sub_graffiti_gatekunst": "Graffiti og gatekunst",
  "em_sub_grensearbeid_autentisitet": "Grensearbeid og autentisitet",
  "em_sub_historiemakt": "Historiemakt",
  "em_sub_historisering_revival": "Historisering og revival",
  "em_sub_institusjonalisering": "Institusjonalisering",
  "em_sub_klaer_kropp_identitet": "Klær, kropp og identitet",
  "em_sub_klasse_urban_stil": "Klasse og urban stil",
  "em_sub_klubbkultur_natt": "Klubbkultur og natt",
  "em_sub_kommersialisering": "Kommersialisering",
  "em_sub_kriminalisering": "Kriminalisering",
  "em_sub_kropp_modifikasjon": "Kropp og modifikasjon",
  "em_sub_kulturarv_undergrunn": "Kulturarv og undergrunn",
  "em_sub_kulturpolitikk_subkultur": "Kulturpolitikk og subkultur",
  "em_sub_marginalisering_synlighet": "Marginalisering og synlighet",
  "em_sub_merkevare_stil": "Merkevare og stil",
  "em_sub_moralpanikk": "Moralpanikk",
  "em_sub_motkultur": "Motkultur",
  "em_sub_musikkobjekter": "Musikkobjekter",
  "em_sub_nettforum_memer": "Nettforum og memer",
  "em_sub_nostalgi_revival": "Nostalgi og revival",
  "em_sub_objekter_merker": "Objekter og merker",
  "em_sub_okkuperte_rom": "Okkuperte rom",
  "em_sub_ovingsrom_kjeller": "Øvingsrom og kjeller",
  "em_sub_plakater_stickers": "Plakater og stickers",
  "em_sub_politi_kontroll": "Politi og kontroll",
  "em_sub_portvoktere_innvielse": "Portvoktere og innvielse",
  "em_sub_regulering_eiendom": "Regulering og eiendom",
  "em_sub_remix_stil": "Remix og stil",
  "em_sub_rett_til_byen": "Rett til byen",
  "em_sub_ritualer_praksis": "Ritualer og praksis",
  "em_sub_samlerobjekter": "Samlerobjekter",
  "em_sub_scene_fellesskap": "Scene og fellesskap",
  "em_sub_scene_konflikt": "Scenekonflikt",
  "em_sub_skate_byrom": "Skate og byrom",
  "em_sub_skeive_miljoer": "Skeive miljøer",
  "em_sub_smak_distinksjon": "Smak og distinksjon",
  "em_sub_sosial_kontroll": "Sosial kontroll",
  "em_sub_sosial_organisering": "Sosial organisering",
  "em_sub_sprak_slang_koder": "Språk, slang og koder",
  "em_sub_sted_scene": "Sted og scene",
  "em_sub_stil_sprak": "Stil som språk",
  "em_sub_symboler_koder": "Symboler og koder",
  "em_sub_synlighet_kontroll": "Synlighet og kontroll",
  "em_sub_tapte_steder": "Tapte steder",
  "em_sub_territoriale_koder": "Territoriale koder",
  "em_sub_tilhorighet_miljo": "Tilhørighet og miljø",
  "em_sub_trygghet_eksklusjon": "Trygghet og eksklusjon",
  "em_sub_uavhengige_medier": "Uavhengige medier",
  "em_sub_uformelle_moteplasser": "Uformelle møteplasser",
  "em_sub_undergrunn_mainstream": "Undergrunn og mainstream",
  "em_sub_undergrunn_miljo": "Undergrunnsmiljø",
  "em_sub_ungdomskultur_identitet": "Ungdomskultur og identitet",
  "em_sub_vennegjenger_lojalitet": "Vennegjenger og lojalitet",
  "em_sub_visuelle_grenser": "Visuelle grenser",
  "em_sub_grunnbegreper": "Grunnbegreper i subkultur",
  "em_sub_musikkscener": "Musikkscener og subkulturmiljøer",
  "em_sub_stil_kropp_symboler": "Stil, kropp og symboler i subkulturer"
}
);
const EXPECTED_NEW_EMNE_IDS = Object.freeze(
[
  "em_sub_innenfra_utenfrablikk",
  "em_sub_apne_rusmiljoer_gatefellesskap",
  "em_sub_skadereduksjon_lavterskeltiltak",
  "em_sub_hjemloshet_ustabile_boforhold",
  "em_sub_gjensidig_hjelp_omsorg",
  "em_sub_stigma_representasjon",
  "em_sub_personvern_forskningsetikk",
  "em_sub_tjenestemoter_rettigheter"
]
);

const absolute = (relative) => path.join(ROOT, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(absolute(relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? '').trim();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].filter(([, count]) => count > 1).map(([value]) => value).sort();
}

function collectEmneReferences(value, target = new Set()) {
  if (typeof value === 'string') {
    if (value.startsWith('em_sub_')) target.add(value);
    return target;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectEmneReferences(entry, target);
    return target;
  }
  if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) collectEmneReferences(entry, target);
  }
  return target;
}

function manifestDocuments(relative) {
  const manifest = readJson(relative);
  return list(manifest.files).flatMap((entry) => {
    const file = text(entry).startsWith('data/') ? text(entry) : `data/${text(entry)}`;
    return fs.existsSync(absolute(file)) ? [readJson(file)] : [];
  });
}

function activeExternalReferences() {
  const values = [
    ...manifestDocuments(PATHS.placeManifest),
    ...manifestDocuments(PATHS.peopleManifest),
    readJson(PATHS.quizLegacy),
    readJson(PATHS.quizFromBy)
  ];
  return [...collectEmneReferences(values)].sort();
}

export function buildFoundationReport() {
  const contract = readJson(PATHS.contract);
  const fagkart = readJson(PATHS.fagkart);
  const emner = list(readJson(PATHS.emner));
  const methods = list(readJson(PATHS.methods).methods);
  const mapping = list(readJson(PATHS.mapping));
  const pensum = readJson(PATHS.pensum);
  const domains = list(fagkart.categories);
  const hooks = domains.flatMap((domain) => list(domain.topic_hooks));
  const domainIds = domains.map((domain) => text(domain.id));
  const contractDomainIds = list(contract.domains).map((domain) => text(domain.id));
  const emneIds = emner.map((emne) => text(emne.emne_id));
  const hookIds = hooks.map((hook) => text(hook.id));
  const methodIds = methods.map((method) => text(method.method_id));
  const mappingIds = mapping.map((entry) => text(entry.emne_id));
  const mappedHookIds = mapping.flatMap((entry) => list(entry.mappings).map((item) => text(item.topic_hook)));
  const usedMethodIds = new Set([
    ...emner.flatMap((emne) => list(emne.method_ids)),
    ...mapping.flatMap((entry) => list(entry.mappings).flatMap((item) => list(item.recommended_method_ids)))
  ]);
  const currentIds = new Set(emneIds);
  const emneById = new Map(emner.map((emne) => [text(emne.emne_id), emne]));
  const externalRefs = activeExternalReferences();
  const preservedLegacyIds = list(pensum.emne_migration?.preserved_legacy_ids).map(text).sort();
  const retiredIds = Object.keys(pensum.emne_migration?.retired_ids ?? {}).sort();
  const status = list(readJson(PATHS.subjectStatus).subjects).find((entry) => entry.id === 'subkultur');
  const portal = list(readJson(PATHS.portal).categories).find((entry) => entry.id === 'subkultur');
  const registry = readJson(PATHS.registry);

  return {
    schema: 'history_go_subkultur_foundation_audit_v1',
    version: '1.0.0',
    subject_id: 'subkultur',
    audited_at: '2026-08-04',
    status: 'FOUNDATION_READY_NOT_MATERIALIZED',
    counts: {
      domains: domains.length,
      hooks: hooks.length,
      emner: emner.length,
      mappings: mapping.length,
      methods: methods.length,
      pensum_domains: list(pensum.domains).length,
      preserved_legacy_ids: preservedLegacyIds.length,
      retired_legacy_ids: retiredIds.length,
      new_emne_ids: emneIds.filter((id) => !Object.hasOwn(LEGACY_TITLE_BY_ID, id)).sort(),
      active_external_emne_references: externalRefs.length
    },
    per_domain: domains.map((domain) => ({
      id: domain.id,
      hooks: list(domain.topic_hooks).length,
      emner: emner.filter((emne) => emne.domain === domain.id).length,
      methods: methods.filter((method) => list(method.domain_ids).includes(domain.id)).length,
      mappings: mapping.filter((entry) => list(entry.mappings).some((item) => item.fagkart_kategori === domain.id)).length
    })),
    integrity: {
      domain_order_matches_contract: isDeepStrictEqual(domainIds, contractDomainIds),
      duplicate_domain_ids: duplicates(domainIds),
      duplicate_hook_ids: duplicates(hookIds),
      duplicate_emne_ids: duplicates(emneIds),
      duplicate_method_ids: duplicates(methodIds),
      duplicate_mapping_ids: duplicates(mappingIds),
      duplicate_mapped_hook_ids: duplicates(mappedHookIds),
      unmapped_emne_ids: emneIds.filter((id) => !mappingIds.includes(id)).sort(),
      orphan_mapping_ids: mappingIds.filter((id) => !currentIds.has(id)).sort(),
      unmapped_hook_ids: hookIds.filter((id) => !mappedHookIds.includes(id)).sort(),
      orphan_mapped_hook_ids: mappedHookIds.filter((id) => !hookIds.includes(id)).sort(),
      missing_method_ids: [...usedMethodIds].filter((id) => !methodIds.includes(id)).sort(),
      unused_method_ids: methodIds.filter((id) => !usedMethodIds.has(id)).sort(),
      generic_definitions: emnersWith(emner, (emne) => text(emne.definition).startsWith('Emnet studerer')),
      missing_definitions: emnersWith(emner, (emne) => !text(emne.definition)),
      missing_mechanisms: emnersWith(emner, (emne) => !text(emne.mechanism)),
      missing_limitations: emnersWith(emner, (emne) => !text(emne.limitation)),
      non_unique_method_operations: duplicates(methods.map((method) => text(method.operation))),
      missing_legacy_emne_ids: Object.keys(LEGACY_TITLE_BY_ID).filter((id) => !currentIds.has(id)).sort(),
      preserved_legacy_id_mismatch: isDeepStrictEqual(preservedLegacyIds, Object.keys(LEGACY_TITLE_BY_ID).sort())
        ? []
        : ['pensum.emne_migration.preserved_legacy_ids'],
      legacy_semantic_title_drift: Object.entries(LEGACY_TITLE_BY_ID)
        .filter(([id, title]) => text(emneById.get(id)?.title) !== title)
        .map(([id]) => id)
        .sort(),
      unexpected_new_emne_ids: emneIds
        .filter((id) => !Object.hasOwn(LEGACY_TITLE_BY_ID, id) && !EXPECTED_NEW_EMNE_IDS.includes(id))
        .sort(),
      dangling_external_emne_ids: externalRefs.filter((id) => !currentIds.has(id) && !retiredIds.includes(id)),
      referenced_retired_emne_ids: externalRefs.filter((id) => retiredIds.includes(id))
    },
    status_guard: {
      navigation_status: status?.navigationStatus ?? null,
      assessment_status: status?.assessmentStatus ?? null,
      editorial_status: status?.editorialStatus ?? null,
      portal_subject_status: portal?.subjectStatus ?? null,
      registry_subject_exists: Boolean(registry.subjects?.subkultur)
    },
    next_gate: pensum.next_gate
  };
}

function emnersWith(emner, predicate) {
  return emner.filter(predicate).map((emne) => text(emne.emne_id)).sort();
}

export function auditFoundation({ writeReport = false, checkReport = true } = {}) {
  const report = buildFoundationReport();
  assert(report.counts.domains === 8, 'Fagkartet må ha åtte domener');
  assert(report.counts.hooks === 80, 'Fagkartet må ha 80 hooks');
  assert(report.counts.emner === 80, 'Emneregisteret må ha 80 emner');
  assert(report.counts.mappings === 80, 'Mappingen må ha 80 poster');
  assert(report.counts.methods >= 35 && report.counts.methods <= 50, 'Metoderegisteret må ha 35–50 operative metoder');
  assert(report.counts.pensum_domains === 8, 'Pensum må ha åtte domener');
  assert(report.counts.preserved_legacy_ids === 72, 'Migrasjonen skal bevare alle 72 etablerte emne-ID-er');
  assert(report.counts.retired_legacy_ids === 0, 'Etablerte emne-ID-er skal ikke pensjoneres i canonical-migrasjonen');
  assert(isDeepStrictEqual(report.counts.new_emne_ids, [...EXPECTED_NEW_EMNE_IDS].sort()), 'Canonical-laget skal ha nøyaktig åtte godkjente nye emne-ID-er');
  for (const domain of report.per_domain) {
    assert(domain.hooks === 10, `${domain.id} må ha ti hooks`);
    assert(domain.emner === 10, `${domain.id} må ha ti emner`);
    assert(domain.methods >= 5, `${domain.id} må ha minst fem operative metoder`);
    assert(domain.mappings === 10, `${domain.id} må ha ti mappinger`);
  }
  assert(report.integrity.domain_order_matches_contract, 'Domeneorden avviker fra kontrakten');
  for (const [name, values] of Object.entries(report.integrity)) {
    if (typeof values === 'boolean') continue;
    assert(values.length === 0, `${name} må være tom, fikk: ${values.join(', ')}`);
  }
  assert(report.status_guard.navigation_status === 'materialized', 'navigationStatus skal være materialized etter sluttporten');
  assert(report.status_guard.assessment_status === 'audited', 'assessmentStatus skal være audited etter sluttporten');
  assert(report.status_guard.editorial_status === 'complete', 'editorialStatus skal være complete etter sluttporten');
  assert(report.status_guard.portal_subject_status === 'materialized', 'portalstatus skal være materialized');
  assert(report.status_guard.registry_subject_exists === true, 'Subkultur mangler i fagverkregisteret');
  assert(report.next_gate === 'theory_claim_source_evidence', 'Neste port skal være teori, claims, kilder og evidens');

  if (writeReport) {
    fs.mkdirSync(path.dirname(absolute(REPORT)), { recursive: true });
    fs.writeFileSync(absolute(REPORT), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }
  if (checkReport) {
    assert(fs.existsSync(absolute(REPORT)), `${REPORT} mangler. Kjør --write-report`);
    assert(isDeepStrictEqual(readJson(REPORT), report), `${REPORT} er utdatert. Kjør --write-report`);
  }
  return report;
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditFoundation({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report') || args.has('--check-report')
    });
    console.log(`Subkultur foundation OK: ${report.counts.domains} domener, ${report.counts.emner} emner, ${report.counts.methods} metoder; ${report.status}.`);
  } catch (error) {
    console.error(`Subkultur foundation FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
