#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { buildCanonicalLayer } from './materialize-subkultur-canonical-v2.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  contract: 'data/fag/subkultur/subkultur_fagverk_contract_v1.json',
  fagkart: 'data/fag/subkultur/fagkart_subkultur_canonical_v4_5.json',
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json',
  methods: 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  mappings: 'data/fag/subkultur/emnemapping_subkultur_canonical_v4_5.json',
  pensum: 'data/fag/subkultur/subkulturpensum_canonical_v4_5.json',
  quizRules: 'data/fag/subkultur/quiz_generator_rules_subkultur_v5_1_source_priority_patch.json',
  quizTemplate: 'data/fag/subkultur/supersetQUIZMAL_subkultur.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/subkultur-canonical-layer-audit.json'
});

const LEGACY_EMNE_IDS = new Set(`
em_sub_arrangorer_dugnad em_sub_autentisitet_tap em_sub_autonomi_motstand em_sub_avvik_normalitet
em_sub_byutvikling_regulering em_sub_cosplay_fandom em_sub_deltakelse_laring em_sub_digitale_miljoer
em_sub_diy_praksis em_sub_dokumentasjon_arkiv em_sub_estetikk_affekt em_sub_fandom_nisjer
em_sub_fanziner_plakater em_sub_gaming_lan em_sub_gentrifisering_tap em_sub_graffiti_gatekunst
em_sub_grensearbeid_autentisitet em_sub_grunnbegreper em_sub_historiemakt em_sub_historisering_revival
em_sub_institusjonalisering em_sub_klaer_kropp_identitet em_sub_klasse_urban_stil em_sub_klubbkultur_natt
em_sub_kommersialisering em_sub_kriminalisering em_sub_kropp_modifikasjon em_sub_kulturarv_undergrunn
em_sub_kulturpolitikk_subkultur em_sub_marginalisering_synlighet em_sub_merkevare_stil em_sub_moralpanikk
em_sub_motkultur em_sub_musikkobjekter em_sub_musikkscener em_sub_nettforum_memer em_sub_nostalgi_revival
em_sub_objekter_merker em_sub_okkuperte_rom em_sub_ovingsrom_kjeller em_sub_plakater_stickers
em_sub_politi_kontroll em_sub_portvoktere_innvielse em_sub_regulering_eiendom em_sub_remix_stil
em_sub_rett_til_byen em_sub_ritualer_praksis em_sub_samlerobjekter em_sub_scene_fellesskap
em_sub_scene_konflikt em_sub_skate_byrom em_sub_skeive_miljoer em_sub_smak_distinksjon
em_sub_sosial_kontroll em_sub_sosial_organisering em_sub_sprak_slang_koder em_sub_sted_scene
em_sub_stil_kropp_symboler em_sub_stil_sprak em_sub_symboler_koder em_sub_synlighet_kontroll
em_sub_tapte_steder em_sub_territoriale_koder em_sub_tilhorighet_miljo em_sub_trygghet_eksklusjon
em_sub_uavhengige_medier em_sub_uformelle_moteplasser em_sub_undergrunn_mainstream em_sub_undergrunn_miljo
em_sub_ungdomskultur_identitet em_sub_vennegjenger_lojalitet em_sub_visuelle_grenser
`.trim().split(/\s+/u));

const abs = (relative) => path.join(ROOT, relative);
const json = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const unique = (values) => new Set(values).size === values.length;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function auditSubkulturCanonicalLayer({ writeReport = false, checkReport = true } = {}) {
  const contract = json(P.contract);
  const fagkart = json(P.fagkart);
  const emner = list(json(P.emner));
  const methods = list(json(P.methods).methods);
  const mappings = list(json(P.mappings));
  const pensum = json(P.pensum);
  const quizRules = json(P.quizRules);
  const quizTemplate = json(P.quizTemplate);
  const status = list(json(P.status).subjects).find((entry) => entry.id === 'subkultur');
  const built = buildCanonicalLayer();

  for (const [relative, expected] of Object.entries(built)) {
    assert(isDeepStrictEqual(json(relative), expected), `${relative} avviker fra deterministisk V2-materialisering`);
  }

  const expectedDomains = list(contract.domains).map((entry) => entry.id);
  const categories = list(fagkart.categories);
  const domainIds = categories.map((entry) => entry.id);
  const hooks = categories.flatMap((entry) => list(entry.topic_hooks));
  const emneIds = emner.map((entry) => entry.emne_id);
  const methodIds = methods.map((entry) => entry.method_id);
  const mappingIds = mappings.map((entry) => entry.emne_id);
  const hookIds = hooks.map((entry) => entry.id);
  const definitions = emner.map((entry) => entry.definition);
  const questions = emner.map((entry) => entry.analytical_question);

  assert(isDeepStrictEqual(domainIds, expectedDomains), 'Fagkartet følger ikke kontraktens åtte domener i riktig rekkefølge');
  assert(categories.length === 8 && categories.every((entry) => list(entry.topic_hooks).length === 10), 'Hvert av åtte domener skal ha ti hooks');
  assert(emner.length === 80 && unique(emneIds), 'Emnelaget skal ha 80 unike emner');
  assert([...LEGACY_EMNE_IDS].every((id) => emneIds.includes(id)), 'Ett eller flere av de 72 tidligere canonical-emnene er fjernet');
  assert(definitions.every((value) => String(value).length >= 90) && unique(definitions), 'Alle 80 emner skal ha en individuell, substansiell definisjon');
  assert(questions.every((value) => String(value).length >= 45) && unique(questions), 'Alle 80 emner skal ha et individuelt analytisk spørsmål');
  assert(emner.every((entry) => !entry.definition.startsWith('Emnet studerer')), 'Generisk definisjonsmal er fortsatt aktiv');
  assert(methods.length >= 35 && methods.length <= 50, 'Metodelaget skal være konsolidert til 35–50 operative metoder');
  assert(unique(methodIds) && unique(methods.map((entry) => entry.description)), 'Metode-ID-er og beskrivelser skal være unike');
  assert(methods.every((entry) => list(entry.procedure).length === 4 && list(entry.limitations).length >= 2), 'Hver metode trenger fire prosedyrer og minst to begrensninger');
  assert(emner.every((entry) => list(entry.method_ids).length >= 1 && entry.method_ids.every((id) => methodIds.includes(id))), 'Alle emner må bruke kjent operativ metode');
  assert(methodIds.every((id) => emner.some((entry) => entry.method_ids.includes(id))), 'Alle aktive metoder må brukes av minst ett emne');
  assert(mappings.length === 80 && unique(mappingIds) && isDeepStrictEqual([...mappingIds].sort(), [...emneIds].sort()), 'Mappinglaget må være én-til-én med emnelaget');
  assert(hooks.length === 80 && unique(hookIds), 'Fagkartet skal ha 80 unike hooks');
  assert(hooks.every((hook) => list(hook.emne_ids).length === 1 && emneIds.includes(hook.emne_ids[0])), 'Hvert hook skal peke til ett kjent emne');
  assert(list(pensum.domains).length === 8 && pensum.domains.every((entry) => list(entry.emne_ids).length === 10), 'Pensum må materialisere 8 × 10');
  assert(pensum.scope === 'universal' && fagkart.scope === 'universal' && json(P.methods).scope === 'universal', 'Teorikjernen skal være universell');
  assert(quizRules.scope === 'universal' && quizRules.canonical_inputs.domain_count === 8 && quizRules.canonical_inputs.emne_count === 80, 'Quizreglene er ikke synkronisert til åttedomenelaget');
  assert(quizRules.canonical_inputs.method_count === methods.length && quizRules.canonical_inputs.mapping_count === 80, 'Quizreglenes produksjonstall er usynkrone');
  assert(Object.keys(quizRules.set_guidance).length === 8, 'Quizreglene skal ha ett styringssett per domene');
  assert(quizTemplate.canonical_layer?.domains === 8 && quizTemplate.canonical_layer?.emner === 80, 'Quizmalen mangler canonical åttedomenestatus');
  assert(status.navigationStatus === 'planned' && status.assessmentStatus === 'pending' && status.editorialStatus === 'not_started', 'Canonical grunnlag må ikke forskuttere runtime- eller ferdigstatus');

  const report = {
    schema: 'history_go_subkultur_canonical_layer_audit_v1',
    version: '1.0.0',
    subject_id: 'subkultur',
    status: 'PASSED_CANONICAL_LAYER_THEORY_PENDING',
    summary: {
      domain_count: categories.length,
      hooks_per_domain: categories.map((entry) => list(entry.topic_hooks).length),
      hook_count: hooks.length,
      emne_count: emner.length,
      preserved_legacy_emne_count: [...LEGACY_EMNE_IDS].filter((id) => emneIds.includes(id)).length,
      new_emne_count: emner.length - LEGACY_EMNE_IDS.size,
      method_count: methods.length,
      mapping_count: mappings.length,
      unique_definition_count: new Set(definitions).size,
      unique_analytical_question_count: new Set(questions).size,
      theory_objects_evidence_ready: 0,
      chapters: 0,
      navigation_status: status.navigationStatus,
      assessment_status: status.assessmentStatus,
      editorial_status: status.editorialStatus
    },
    gates: {
      contract_domain_order: true,
      exactly_ten_emner_per_domain: true,
      all_legacy_emne_ids_preserved: true,
      individual_emne_definitions: true,
      operational_methods_only: true,
      one_to_one_emne_hook_mapping: true,
      universal_scope: true,
      quiz_governance_synchronized: true,
      premature_completion_blocked: true
    },
    next_gate: 'theory_claim_source_evidence_production'
  };

  if (writeReport) fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  if (checkReport) assert(isDeepStrictEqual(json(P.report), report), `${P.report} er utdatert`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditSubkulturCanonicalLayer({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Subkultur canonical layer OK: ${report.summary.domain_count} domener, ${report.summary.emne_count} emner, ${report.summary.method_count} metoder.`);
  } catch (error) {
    console.error(`Subkultur canonical layer FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
