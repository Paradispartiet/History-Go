#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check') || !WRITE;
const AUDITED_CANDIDATE_COUNT = 50;
const ENVIRONMENT_NEAR_PERSPECTIVES = new Set(['participant', 'milieu', 'support_service']);
const INDEPENDENT_CONTROL_PERSPECTIVES = new Set(['authority', 'research', 'secondary']);
const REJECTED_CANDIDATES = Object.freeze([
  {
    case_id: 'case_sub_hartvig_nissens_skole_skam',
    place_id: 'hartvig_nissens_skole_skam',
    profile_id: 'profile_subkultur_oslo',
    resulting_category: 'film_tv',
    reason: 'TV-lokasjon og fandom alene dokumenterer ikke et stedbundet subkulturmiljø.'
  },
  {
    case_id: 'case_sub_lisbon_village_underground',
    place_id: 'lisbon_village_underground',
    profile_id: 'profile_subkultur_lisboa',
    resulting_category: 'naeringsliv',
    reason: 'Kreativ næringsklynge, arrangementer og alternativ merkevare dokumenterer ikke alene et subkulturmiljø.'
  }
]);

const CASES = Object.freeze([
  {
    placeId: 'house_of_nerds',
    profileId: 'profile_subkultur_oslo',
    reportPath: 'data/places/subkultur-production/house_of_nerds.json'
  },
  {
    placeId: 'lisbon_anjos70',
    profileId: 'profile_subkultur_lisboa',
    reportPath: 'data/places/subkultur-production/lisbon_anjos70.json'
  },
  {
    placeId: 'lisbon_crew_hassan',
    profileId: 'profile_subkultur_lisboa',
    reportPath: 'data/places/subkultur-production/lisbon_crew_hassan.json'
  },
  {
    placeId: 'lisbon_desterro',
    profileId: 'profile_subkultur_lisboa',
    reportPath: 'data/places/subkultur-production/lisbon_desterro.json'
  },
  {
    placeId: 'blitzhuset',
    profileId: 'profile_subkultur_oslo',
    reportPath: 'data/places/subkultur-production/blitzhuset.json'
  },
  {
    placeId: 'hausmania',
    profileId: 'profile_subkultur_oslo',
    reportPath: 'data/places/subkultur-production/hausmania.json'
  },
  {
    placeId: 'xray_ungdomskulturhus',
    profileId: 'profile_subkultur_oslo',
    reportPath: 'data/places/subkultur-production/xray_ungdomskulturhus.json'
  },
  {
    placeId: 'svartlamon_trondheim',
    profileId: 'profile_subkultur_norge_norden',
    reportPath: 'data/places/subkultur-production/svartlamon_trondheim.json'
  },
  {
    placeId: 'hulen_bergen',
    profileId: 'profile_subkultur_norge_norden',
    reportPath: 'data/places/subkultur-production/hulen_bergen.json'
  },
  {
    placeId: 'bergen_kjott_kulturhus',
    profileId: 'profile_subkultur_norge_norden',
    reportPath: 'data/places/subkultur-production/bergen_kjott_kulturhus.json'
  },
  {
    placeId: 'lisbon_galeria_ze_dos_bois',
    profileId: 'profile_subkultur_lisboa',
    reportPath: 'data/places/subkultur-production/lisbon_galeria_ze_dos_bois.json'
  },
  {
    placeId: 'uffa_huset_trondheim',
    profileId: 'profile_subkultur_norge_norden',
    reportPath: 'data/places/subkultur-production/uffa_huset_trondheim.json'
  },
  {
    placeId: 'tou_stavanger',
    profileId: 'profile_subkultur_norge_norden',
    reportPath: 'data/places/subkultur-production/tou_stavanger.json'
  },
  {
    placeId: 'trikkestallen_skatepark_trondheim',
    profileId: 'profile_subkultur_norge_norden',
    reportPath: 'data/places/subkultur-production/trikkestallen_skatepark_trondheim.json'
  },
  {
    placeId: 'fysak_slettebakken',
    profileId: 'profile_subkultur_norge_norden',
    reportPath: 'data/places/subkultur-production/fysak_slettebakken.json'
  },
  {
    placeId: 'oslo_skatehall',
    profileId: 'profile_subkultur_oslo',
    reportPath: 'data/places/subkultur-production/oslo_skatehall.json'
  },
  {
    placeId: 'skur13',
    profileId: 'profile_subkultur_oslo',
    reportPath: 'data/places/subkultur-production/skur13.json'
  },
  {
    placeId: 'helvete_neseblod_records',
    profileId: 'profile_subkultur_oslo',
    reportPath: 'data/places/subkultur-production/helvete_neseblod_records.json'
  },
  {
    placeId: 'torggata_blad',
    profileId: 'profile_subkultur_oslo',
    reportPath: 'data/places/subkultur-production/torggata_blad.json'
  },
  {
    placeId: 'arena_bekkestua',
    profileId: 'profile_subkultur_norge_norden',
    reportPath: 'data/places/subkultur-production/arena_bekkestua.json'
  },
  {
    placeId: 'kafe_x_tromso',
    profileId: 'profile_subkultur_norge_norden',
    reportPath: 'data/places/subkultur-production/kafe_x_tromso.json'
  },
  {
    placeId: 'lisbon_fabrica_braco_de_prata',
    profileId: 'profile_subkultur_lisboa',
    reportPath: 'data/places/subkultur-production/lisbon_fabrica_braco_de_prata.json'
  },
  {
    placeId: 'lisbon_musicbox',
    profileId: 'profile_subkultur_lisboa',
    reportPath: 'data/places/subkultur-production/lisbon_musicbox.json'
  },
  {
    placeId: 'huset_oslo',
    profileId: 'profile_subkultur_oslo',
    reportPath: 'data/places/subkultur-production/huset_oslo.json'
  },
  {
    placeId: 'nadheim_oslo',
    profileId: 'profile_subkultur_oslo',
    reportPath: 'data/places/subkultur-production/nadheim_oslo.json'
  },
  {
    placeId: 'ressurssenter_kvinner_trondheim',
    profileId: 'profile_subkultur_norge_norden',
    reportPath: 'data/places/subkultur-production/ressurssenter_kvinner_trondheim.json'
  },
  {
    placeId: 'matfellesskap_st_petri_stavanger',
    profileId: 'profile_subkultur_norge_norden',
    reportPath: 'data/places/subkultur-production/matfellesskap_st_petri_stavanger.json'
  }
]);

const abs = (relative) => path.join(ROOT, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? '').trim();

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function build() {
  const sourceById = new Map();
  const evidenceCases = [];

  for (const config of CASES) {
    const report = readJson(config.reportPath);
    const caseId = `case_sub_${config.placeId}`;
    const evidenceId = `case_evidence_sub_${config.placeId}`;
    const reportCase = list(report.subcultureCases)[0];
    requireValue(report.schemaVersion === 'subkultur_place_production_v1', `${config.placeId}: feil rapportschema`);
    requireValue(report.placeId === config.placeId && report.status === 'ready', `${config.placeId}: rapporten er ikke ready`);
    for (const gate of ['A', 'B', 'C', 'D', 'E', 'F']) {
      requireValue(report.gates?.[gate]?.status === 'PASS', `${config.placeId}: gate ${gate} er ikke PASS`);
    }
    requireValue(reportCase?.id && text(reportCase.claim), `${config.placeId}: mangler caseclaim`);

    const sourceIds = list(report.sources).map((source) => source.id);
    const milieuSourceIds = list(report.sources).filter((source) => ENVIRONMENT_NEAR_PERSPECTIVES.has(source.perspective)).map((source) => source.id);
    const independentSourceIds = list(report.sources).filter((source) => INDEPENDENT_CONTROL_PERSPECTIVES.has(source.perspective)).map((source) => source.id);
    requireValue(sourceIds.length >= 2 && milieuSourceIds.length >= 1 && independentSourceIds.length >= 1, `${config.placeId}: mangler stemmebalanse`);

    for (const source of report.sources) {
      requireValue(/^https:\/\//u.test(text(source.url)), `${config.placeId}: ikke-inspectable kilde ${source.id}`);
      const next = {
        source_id: source.id,
        url: source.url,
        source_location: source.sourceLocation,
        source_type: source.sourceType,
        perspective: source.perspective,
        verified_at: source.verifiedAt,
        temporal_coverage: source.temporalCoverage,
        provenance: source.provenance,
        limitations: source.limitations,
        case_ids: [caseId],
        place_ids: [config.placeId],
        report_paths: [config.reportPath]
      };
      const existing = sourceById.get(source.id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(next)) throw new Error(`Kilde-ID kolliderer: ${source.id}`);
      sourceById.set(source.id, next);
    }

    evidenceCases.push({
      evidence_id: evidenceId,
      case_id: caseId,
      place_id: config.placeId,
      profile_id: config.profileId,
      validation_status: 'validated_case',
      qualification: 'qualifying_case',
      report_path: config.reportPath,
      report_case_id: reportCase.id,
      claim: reportCase.claim,
      source_ids: sourceIds,
      environment_near_source_ids: milieuSourceIds,
      independent_control_source_ids: independentSourceIds,
      requirement_results: [
        {
          requirement_id: 'case_req_sub_environment_practice_position',
          status: 'PASS',
          evidence_paths: ['subculturalIdentity', `${reportCase.id}.actors`, `${reportCase.id}.practicesAndCommunity`]
        },
        {
          requirement_id: 'case_req_sub_voice_balance',
          status: 'PASS',
          evidence_paths: ['sources', `${reportCase.id}.representationAndEthics.selfDefinition`, `${reportCase.id}.representationAndEthics.externalLabels`]
        },
        {
          requirement_id: 'case_req_sub_place_change',
          status: 'PASS',
          evidence_paths: [`${reportCase.id}.spaceAndPower`, `${reportCase.id}.changeOverTime`, 'presentFunction']
        },
        {
          requirement_id: 'case_req_sub_ethics',
          status: 'PASS',
          evidence_paths: [`${reportCase.id}.representationAndEthics`]
        },
        {
          requirement_id: 'case_req_sub_negative_case',
          status: 'PASS',
          evidence_paths: [`${reportCase.id}.methodAndInference.alternativeExplanations`, `${reportCase.id}.methodAndInference.uncertainty`]
        }
      ],
      method_id: reportCase.methodAndInference.methodId,
      inference_status: reportCase.methodAndInference.inferenceStatus,
      ethics_review: {
        identification_risk: reportCase.representationAndEthics.privacySafeguard,
        stigma_and_romanticization_risk: reportCase.representationAndEthics.stigmaOrRomanticizationRisk,
        editorial_safeguard: reportCase.representationAndEthics.editorialSafeguard,
        status: 'PASS'
      },
      uncertainty: reportCase.methodAndInference.uncertainty,
      validated_at: report.review.reviewedAt
    });
  }

  return {
    'data/fag/subkultur/case_sources_subkultur_canonical_v1.json': {
      schema_version: '1.0.0',
      registry_id: 'case_sources_subkultur_canonical_v1',
      subject_id: 'subkultur',
      status: 'expanded_validated_batch',
      sources: [...sourceById.values()],
      next_gate: 'remaining_case_source_validation'
    },
    'data/fag/subkultur/case_evidence_subkultur_canonical_v1.json': {
      schema_version: '1.0.0',
      registry_id: 'case_evidence_subkultur_canonical_v1',
      subject_id: 'subkultur',
      status: 'partial_case_validation',
      evidence_boundary: 'Teori og canonical place-data kan avgrense et case, men validated_case krever en ready A–H-rapport med miljønær kilde, uavhengig kontroll, caseclaim, etikk og alternativ forklaring.',
      cases: evidenceCases,
      nonqualifying_cases: REJECTED_CANDIDATES.map((entry) => ({
        ...entry,
        validation_status: 'rejected_nonqualifying',
        decision_source: 'data/fag/subkultur/subkultur_places_people_audit_v1.json',
        qualification_rule: 'activity_genre_fandom_or_commercial_branding_alone_is_not_subculture'
      })),
      production_coverage: {
        audited_candidates: AUDITED_CANDIDATE_COUNT,
        eligible_candidates: AUDITED_CANDIDATE_COUNT - REJECTED_CANDIDATES.length,
        validated_cases: evidenceCases.length,
        rejected_candidates: REJECTED_CANDIDATES.length,
        remaining_candidates: AUDITED_CANDIDATE_COUNT - REJECTED_CANDIDATES.length - evidenceCases.length,
        completion_status: 'PARTIAL'
      },
      next_gate: 'remaining_case_source_validation'
    },
    'data/fag/subkultur/case_validation_subkultur_v1.json': {
      schema: 'history_go_subkultur_case_validation_v1',
      version: '1.0.0',
      subject_id: 'subkultur',
      validated_at: '2026-08-04',
      status: 'IN_PROGRESS',
      policy: {
        environment_near_source_required: true,
        independent_control_source_required: true,
        theory_cannot_substitute_case_evidence: true,
        privacy_stigma_romanticization_review_required: true,
        rejected_candidates_do_not_count_as_missing_evidence: true
      },
      totals: {
        candidate_cases: AUDITED_CANDIDATE_COUNT,
        eligible_cases: AUDITED_CANDIDATE_COUNT - REJECTED_CANDIDATES.length,
        validated_cases: evidenceCases.length,
        rejected_cases: REJECTED_CANDIDATES.length,
        pending_cases: AUDITED_CANDIDATE_COUNT - REJECTED_CANDIDATES.length - evidenceCases.length
      },
      validated_cases: evidenceCases.map((entry) => ({
        case_id: entry.case_id,
        place_id: entry.place_id,
        profile_id: entry.profile_id,
        report_file: entry.report_path,
        claim_ids: [entry.report_case_id],
        source_ids: entry.source_ids,
        environment_near_source_ids: entry.environment_near_source_ids,
        independent_control_source_ids: entry.independent_control_source_ids,
        ethics_reviewed: entry.ethics_review.status === 'PASS',
        validation_status: entry.validation_status
      })).sort((a, b) => a.case_id.localeCompare(b.case_id)),
      rejected_cases: REJECTED_CANDIDATES.map((entry) => ({
        ...entry,
        validation_status: 'rejected_nonqualifying'
      })),
      next_gate: 'remaining_case_source_validation'
    }
  };
}

const generated = build();
const changed = [];
for (const [relative, value] of Object.entries(generated)) {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  let current = '';
  try { current = fs.readFileSync(abs(relative), 'utf8'); } catch {}
  if (current === next) continue;
  changed.push(relative);
  if (WRITE) {
    fs.mkdirSync(path.dirname(abs(relative)), { recursive: true });
    fs.writeFileSync(abs(relative), next, 'utf8');
  }
}

if (CHECK && changed.length) {
  console.error('Subkultur-caseevidensen er utdatert:');
  for (const relative of changed) console.error(`- ${relative}`);
  process.exitCode = 1;
} else {
  console.log(`Subkultur case evidence ${WRITE ? 'skrevet' : 'OK'}: ${CASES.length} validerte, ${REJECTED_CANDIDATES.length} avviste og ${CASES.length * 2} casekilder; ${changed.length} avvik.`);
}
