import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const WORKFLOW_SCHEMA_ID = 'history_go_place_production_workflow_v3';
export const DECISION_STATUSES = new Set(['PASS', 'BEGRUNNET_NA', 'BLOCKED']);
export const PRODUCTION_PROFILES = new Set(['major', 'standard', 'focused', 'micro']);
export const PROFILE_STATUSES = new Set(['confirmed', 'provisional']);
export const MANUAL_REVIEW_STATUSES = new Set(['PENDING', 'PASS']);

const REQUIRED_KEYS = [
  'schema',
  'place_id',
  'category',
  'contracts',
  'sources',
  'profile',
  'source_review',
  'collections',
  'modules',
  'blockers',
  'manual_reviews',
  'state',
];

export const DEFAULT_REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function workflowPath(placeId, repoRoot = DEFAULT_REPO_ROOT) {
  return path.join(repoRoot, 'data', 'places', 'workflow', `${placeId}.json`);
}

export function deriveSelectedCollections(record) {
  return Object.entries(record.collections ?? {})
    .filter(([, value]) => value?.status === 'PASS')
    .map(([id]) => id);
}

export function deriveWorkflowState(record) {
  const decisions = [
    ...Object.values(record.collections ?? {}),
    ...Object.values(record.modules ?? {}),
  ];
  if ((record.blockers ?? []).length || decisions.some((item) => item?.status === 'BLOCKED')) return 'blocked';
  if (record.source_review?.status !== 'complete') return 'in_progress';
  if (record.manual_reviews?.images?.status !== 'PASS') return 'in_progress';
  if (record.manual_reviews?.final_ui?.status !== 'PASS') return 'in_progress';
  return 'complete';
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateDecisionMap(name, value, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${name} must be an object`);
    return;
  }
  for (const [id, decision] of Object.entries(value)) {
    if (!decision || typeof decision !== 'object' || Array.isArray(decision)) {
      errors.push(`${name}.${id} must be an object`);
      continue;
    }
    if (!DECISION_STATUSES.has(decision.status)) {
      errors.push(`${name}.${id}.status must be PASS, BEGRUNNET_NA or BLOCKED`);
      continue;
    }
    if ((decision.status === 'BEGRUNNET_NA' || decision.status === 'BLOCKED') && !nonEmptyString(decision.reason)) {
      errors.push(`${name}.${id}.reason is required for ${decision.status}`);
    }
  }
}

export function validateWorkflowRecord(record) {
  const errors = [];
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return { ok: false, errors: ['workflow record must be an object'] };
  }

  for (const key of REQUIRED_KEYS) {
    if (!(key in record)) errors.push(`missing required key: ${key}`);
  }

  if (record.schema !== WORKFLOW_SCHEMA_ID) errors.push(`schema must be ${WORKFLOW_SCHEMA_ID}`);
  if (!nonEmptyString(record.place_id)) errors.push('place_id must be a non-empty string');
  if (!nonEmptyString(record.category)) errors.push('category must be a non-empty string');

  if (!record.contracts || typeof record.contracts !== 'object') {
    errors.push('contracts must be an object');
  } else {
    if (record.contracts.place_production !== 'v3') errors.push('contracts.place_production must be v3');
    if (!nonEmptyString(record.contracts.place_card_collections)) errors.push('contracts.place_card_collections is required');
    if (!nonEmptyString(record.contracts.quiz_production)) errors.push('contracts.quiz_production is required');
  }

  if (!record.sources || typeof record.sources !== 'object' || !nonEmptyString(record.sources.factuality_record)) {
    errors.push('sources.factuality_record is required');
  }

  if (!record.profile || typeof record.profile !== 'object') {
    errors.push('profile must be an object');
  } else {
    if (!PRODUCTION_PROFILES.has(record.profile.id)) errors.push('profile.id must be major, standard, focused or micro');
    if (!PROFILE_STATUSES.has(record.profile.status)) errors.push('profile.status must be confirmed or provisional');
    if (!nonEmptyString(record.profile.reason)) errors.push('profile.reason is required');
  }

  if (!record.source_review || typeof record.source_review !== 'object') {
    errors.push('source_review must be an object');
  } else if (!['pending', 'in_progress', 'complete'].includes(record.source_review.status)) {
    errors.push('source_review.status must be pending, in_progress or complete');
  }

  validateDecisionMap('collections', record.collections, errors);
  validateDecisionMap('modules', record.modules, errors);

  if (!Array.isArray(record.blockers) || record.blockers.some((item) => !nonEmptyString(item))) {
    errors.push('blockers must be an array of non-empty strings');
  }

  if (!record.manual_reviews || typeof record.manual_reviews !== 'object') {
    errors.push('manual_reviews must be an object');
  } else {
    for (const id of ['images', 'final_ui']) {
      const review = record.manual_reviews[id];
      if (!review || typeof review !== 'object' || !MANUAL_REVIEW_STATUSES.has(review.status)) {
        errors.push(`manual_reviews.${id}.status must be PENDING or PASS`);
      }
    }
  }

  if (!['in_progress', 'blocked', 'complete'].includes(record.state)) {
    errors.push('state must be in_progress, blocked or complete');
  } else {
    const derived = deriveWorkflowState(record);
    if (record.state !== derived) errors.push(`state ${record.state} contradicts derived state ${derived}`);
  }

  return { ok: errors.length === 0, errors };
}

export function loadWorkflowRecord(placeId, repoRoot = DEFAULT_REPO_ROOT) {
  const file = workflowPath(placeId, repoRoot);
  if (!fs.existsSync(file)) throw new Error(`Place Production v3 workflow record not found: ${file}`);
  let record;
  try {
    record = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON in Place Production v3 workflow record ${file}: ${error.message}`);
  }
  const validation = validateWorkflowRecord(record);
  if (!validation.ok) {
    throw new Error(`Invalid Place Production v3 workflow record ${file}: ${validation.errors.join('; ')}`);
  }
  return record;
}

export function renderWorkcardProjection(record) {
  return {
    schema: 'history_go_place_workcard_projection_v3',
    generated: true,
    source: `data/places/workflow/${record.place_id}.json`,
    place_id: record.place_id,
    category: record.category,
    state: deriveWorkflowState(record),
    profile: record.profile,
    selected_collections: deriveSelectedCollections(record),
    collections: record.collections,
    modules: record.modules,
    blockers: record.blockers,
    manual_reviews: record.manual_reviews,
  };
}

export function renderQualityGateProjection(record) {
  return {
    schema: 'history_go_place_quality_gate_projection_v3',
    generated: true,
    source: `data/places/workflow/${record.place_id}.json`,
    place_id: record.place_id,
    derived_state: deriveWorkflowState(record),
    selected_collections: deriveSelectedCollections(record),
    blockers: record.blockers,
    manual_reviews: record.manual_reviews,
  };
}

export function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function projectionPaths(placeId, repoRoot = DEFAULT_REPO_ROOT) {
  const slug = placeId.replaceAll('_', '-');
  return {
    workcard: path.join(repoRoot, 'reports', 'place-production', `${slug}-workcard-current.json`),
    qualityGate: path.join(repoRoot, 'reports', 'place-production', `${slug}-quality-gate-current.json`),
  };
}
