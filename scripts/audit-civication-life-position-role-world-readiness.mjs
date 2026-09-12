#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = 'data/Civication/lifePositionRoleWorldReadiness.json';
const REPORT = 'reports/civication-life-position-role-world-readiness.md';

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const clone = (value) => JSON.parse(JSON.stringify(value));
const uniq = (values) => [...new Set(values.filter(Boolean).map(String))].sort((a,b)=>a.localeCompare(b,'nb'));

function walk(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(rel, entry.name).replaceAll(path.sep, '/');
    return entry.isDirectory() ? walk(next) : [next];
  });
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function collectStrings(value, out = []) {
  if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, out));
  else if (typeof value === 'string') out.push(value);
  return out;
}

const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const roleWorldIndex = readJson('data/Civication/roleWorlds/index.json');
const badgeIndex = readJson('data/badges/index.json');
const catalog = readJson('data/Civication/lifePositionCatalog.json');
const overlayIndex = readJson('data/Civication/badgeCareerContracts/index.json');

const completedLifePositionWorlds = new Map(
  (roleWorldIndex.roles || [])
    .filter((entry) => entry.subject_type === 'life_position' && entry.status === 'role_world_complete')
    .map((entry) => [String(entry.life_position_key || ''), entry])
    .filter(([key]) => key)
);

const overlays = new Map((overlayIndex.files || []).map((rel) => {
  const overlay = readJson(rel);
  return [String(overlay.badge_id || ''), overlay];
}));

function applyOverlay(raw) {
  const badge = clone(raw);
  const overlay = overlays.get(String(badge.id || ''));
  if (!overlay) return badge;
  for (const patch of overlay.tiers || []) {
    const tier = badge.tiers.find((candidate) => candidate.label === patch.label);
    if (!tier) throw new Error(`${badge.id}: unknown overlay tier ${patch.label}`);
    for (const key of ['life_position','life_positions','career_offer','career_unlock']) {
      if (patch[key] != null) tier[key] = clone(patch[key]);
    }
  }
  return badge;
}

const badges = badgeIndex.files.map((rel) => applyOverlay(readJson(rel)));
const maxMerits = Object.fromEntries(badges.map((badge) => [
  badge.id,
  { points: Math.max(...badge.tiers.map((tier) => Number(tier.threshold))) }
]));
const storage = new Map([['merits_by_category', JSON.stringify(maxMerits)]]);
const sandbox = {
  console,
  Date,
  Event: function Event(type) { this.type = type; },
  localStorage: {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value))
  },
  window: {
    BADGES: badges,
    CIVI_LIFE_POSITION_CATALOG: catalog,
    CivicationState: { getActivePosition: () => null },
    dispatchEvent: () => {}
  },
  module: { exports: {} }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readText('js/Civication/systems/civicationLifePositionRuntime.js'), sandbox, {
  filename: 'civicationLifePositionRuntime.js'
});
const lifeApi = sandbox.window.CivicationLifePositions;
const positions = lifeApi.getAllUnlockedPositions()
  .map((position) => ({
    badge_id: String(position.badge_id || ''),
    badge_name: String(position.badge_name || position.badge_id || ''),
    id: String(position.id || '').trim() || null,
    label: String(position.label || ''),
    threshold: Number(position.threshold || 0),
    kind: String(position.kind || 'life_position'),
    source: String(position.source || 'unknown'),
    description: position.description || null,
    hooks: Array.isArray(position.hooks) ? position.hooks.map(String) : [],
    employment_independent: position.employment_independent !== false
  }))
  .sort((a,b) => a.badge_id.localeCompare(b.badge_id,'nb') || a.threshold-b.threshold || a.label.localeCompare(b.label,'nb'));

if (positions.length !== taxonomy.canonical_counts.selectable_life_positions_total) {
  throw new Error(`Life-position count drift: taxonomy=${taxonomy.canonical_counts.selectable_life_positions_total}, runtime=${positions.length}`);
}

const livelihood = readJson('data/Civication/livelihoodOpportunityTemplates.json');
const livelihoodByKey = new Map();
for (const template of livelihood.templates || []) {
  const key = `${template.badge_id}::${template.life_position_label}`;
  const rows = livelihoodByKey.get(key) || [];
  rows.push(template);
  livelihoodByKey.set(key, rows);
}

const governedFiles = uniq([
  ...walk('data/Civication/narratives').filter((rel)=>rel.endsWith('.json')),
  ...walk('data/Civication/lifestory/life').filter((rel)=>rel.endsWith('.json')),
  ...walk('data/Civication/privatePhaseMailFamilies').filter((rel)=>rel.endsWith('.json')),
  ...walk('data/Civication/social').filter((rel)=>rel.endsWith('.json')),
  'data/Civication/lifestory/livelihoodOpportunityOverlays.json'
]).filter(exists);

const fileRecords = governedFiles.map((rel) => {
  const text = readText(rel);
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return {
    rel,
    text,
    normalized: normalizeText(text),
    json,
    strings: json ? collectStrings(json).map(normalizeText) : []
  };
});

function semanticMode(kind) {
  const k = String(kind || '').toLowerCase();
  if (/(reputation|achievement|fame|legacy|selection_status|booking_status|influence_status|market_reputation|career_status|team_appointment_status|elected_mandate|leadership_mandate|competition_status)/.test(k)) {
    return 'overlay_or_outcome_status';
  }
  if (/(education_stage|learning_stage|doctoral_study_stage)/.test(k)) return 'education_or_learning_position';
  if (/(livelihood|self_employment|business_ownership|capital_ownership|industrial_ownership)/.test(k)) return 'livelihood_or_ownership_identity';
  return 'lived_identity_or_practice';
}

function canonicalNeedles(position) {
  return uniq([
    position.id && normalizeText(position.id),
    normalizeText(position.label)
  ]).filter((value)=>value.length >= 4);
}

const canonicalNeedleOwners = new Map();
for (const position of positions) {
  for (const needle of canonicalNeedles(position)) {
    const badges = canonicalNeedleOwners.get(needle) || new Set();
    badges.add(normalizeText(position.badge_id));
    canonicalNeedleOwners.set(needle, badges);
  }
}

function needleNeedsBadgeScope(needle) {
  return (canonicalNeedleOwners.get(String(needle || ''))?.size || 0) > 1;
}

function badgeScopedTokens(position) {
  const badge = normalizeText(position.badge_id);
  return uniq([
    position.id && `${badge}:${normalizeText(position.id)}`,
    position.label && `${badge}:${normalizeText(position.label)}`
  ]).filter(Boolean);
}

function regexEscape(value) {
  const specials = new Set('\\^$.*+?()[]{}|/'.split(''));
  return [...String(value || '')]
    .map((char) => specials.has(char) ? '\\' + char : char)
    .join('');
}

function containsCanonicalNeedle(haystack, needle) {
  const text = String(haystack || '');
  const token = String(needle || '');
  if (!text || !token) return false;
  return new RegExp('(^|[^a-z0-9])' + regexEscape(token) + '($|[^a-z0-9])').test(text);
}

function narrativeMetadataMatch(record, position) {
  if (!record.json || !record.rel.startsWith('data/Civication/narratives/')) return false;
  const meta = normalizeText(JSON.stringify({
    id: record.json.id,
    type: record.json.type,
    title: record.json.title,
    sociological_theme: record.json.sociological_theme,
    applies_when: record.json.applies_when
  }));
  const rel = normalizeText(record.rel);
  const scoped = badgeScopedTokens(position).some((token) => containsCanonicalNeedle(meta, token));
  return canonicalNeedles(position).some((needle) => {
    const matched = containsCanonicalNeedle(meta, needle) || containsCanonicalNeedle(rel, needle);
    if (!matched) return false;
    return needleNeedsBadgeScope(needle) ? scoped : true;
  });
}

function structuredLifePositionBinding(value, position) {
  if (!value || typeof value !== 'object') return false;
  const wantedLabel = normalizeText(position.label);
  const wantedId = normalizeText(position.id || '');
  const wantedBadge = normalizeText(position.badge_id);
  if (Array.isArray(value)) return value.some((item) => structuredLifePositionBinding(item, position));

  const objectBadge = normalizeText(
    value.badge_id || value.life_position_badge_id || value.life_position_badge || ''
  );

  for (const [key, child] of Object.entries(value)) {
    const k = normalizeText(key);
    if (['life_position_label','life_position_id','life_position'].includes(k)) {
      const v = normalizeText(typeof child === 'string' ? child : JSON.stringify(child));
      const matchedNeedle = canonicalNeedles(position).find((needle) => v === needle) || null;
      if (matchedNeedle) {
        if (!needleNeedsBadgeScope(matchedNeedle) || objectBadge === wantedBadge) return true;
      }
      if ((wantedId && v === wantedId) || v === wantedLabel) {
        const ambiguous = [wantedId, wantedLabel].filter(Boolean).some(needleNeedsBadgeScope);
        if (!ambiguous || objectBadge === wantedBadge) return true;
      }
    }
    if (child && typeof child === 'object' && structuredLifePositionBinding(child, position)) return true;
  }
  return false;
}

function narrativeDepth(record, position) {
  if (!narrativeMetadataMatch(record, position)) return 0;
  if (Array.isArray(record.json.storylets)) return record.json.storylets.length;
  if (Array.isArray(record.json.scenes)) return record.json.scenes.length;
  if (Array.isArray(record.json.events)) return record.json.events.length;
  return 1;
}

function sourceEvidence(position) {
  const key = `${position.badge_id}::${position.label}`;
  const livelihoodRows = livelihoodByKey.get(key) || [];
  const strongNeedles = uniq([
    position.id && normalizeText(position.id),
    normalizeText(position.label)
  ]).filter((value)=>value.length >= 4);
  const hookNeedles = uniq(position.hooks.map(normalizeText)).filter((value)=>value.length >= 5);

  const exact = [];
  const thematic = [];
  let maxNarrativeDepth = 0;

  for (const record of fileRecords) {
    const depth = narrativeDepth(record, position);
    if (depth > maxNarrativeDepth) maxNarrativeDepth = depth;

    const directBinding = structuredLifePositionBinding(record.json, position) || narrativeMetadataMatch(record, position);
    if (directBinding) exact.push(record.rel);
    else if (hookNeedles.length >= 2 && hookNeedles.filter((needle)=>record.normalized.includes(needle)).length >= 2) thematic.push(record.rel);
  }

  return {
    livelihood_templates: livelihoodRows.map((row)=>row.id),
    livelihood_ref: livelihoodRows.length ? 'data/Civication/livelihoodOpportunityTemplates.json' : null,
    exact_source_refs: uniq(exact),
    thematic_source_refs: uniq(thematic),
    max_narrative_depth: maxNarrativeDepth
  };
}

function positionKey(position) {
  return `${position.badge_id}/${position.id || normalizeText(position.label).replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')}`;
}

function classify(position, evidence) {
  const key = positionKey(position);
  const completedEntry = completedLifePositionWorlds.get(key);
  if (completedEntry) {
    if (!exists(completedEntry.path)) throw new Error(`${key}: completed life-position Role World path missing: ${completedEntry.path}`);
    const world = readJson(completedEntry.path);
    if (world.status !== 'role_world_complete' || world.subject_type !== 'life_position') {
      throw new Error(`${key}: indexed completed life-position Role World has invalid subject/status`);
    }
    if (world.life_position_ref?.badge_id !== position.badge_id || world.life_position_ref?.id !== position.id) {
      throw new Error(`${key}: Role World life_position_ref does not match canonical selectable position`);
    }
  }

  const mode = semanticMode(position.kind);
  const hasDeepNarrative = evidence.max_narrative_depth >= 4;
  const exactNonEconomic = evidence.exact_source_refs.filter((rel)=>!rel.includes('livelihood')).length;

  if (hasDeepNarrative && exactNonEconomic >= 1) return 'ready';
  if (mode === 'overlay_or_outcome_status' && exactNonEconomic === 0 && evidence.livelihood_templates.length === 0) {
    return 'not_a_standalone_world';
  }
  return 'needs_authored_depth';
}

const rows = positions.map((position) => {
  const evidence = sourceEvidence(position);
  const completedWorld = position.id
    ? completedLifePositionWorlds.get(positionKey(position)) || null
    : null;
  const classification = classify(position, evidence);
  const mode = semanticMode(position.kind);
  let priority = completedWorld ? 0
    : classification === 'ready' ? 1000
    : classification === 'needs_authored_depth' ? 500 : 200;
  priority += evidence.max_narrative_depth * 25;
  priority += evidence.exact_source_refs.length * 15;
  priority += evidence.livelihood_templates.length * 30;
  priority += Math.min(position.hooks.length, 5) * 5;
  if (mode === 'lived_identity_or_practice') priority += 25;
  if (mode === 'overlay_or_outcome_status') priority -= 50;

  return {
    key: positionKey(position),
    badge_id: position.badge_id,
    badge_name: position.badge_name,
    id: position.id,
    label: position.label,
    threshold: position.threshold,
    kind: position.kind,
    semantic_mode: mode,
    runtime_source: position.source,
    classification,
    role_world_status: completedWorld?.status || 'role_world_not_started',
    role_world_path: completedWorld?.path || null,
    priority_score: priority,
    authored_depth: {
      description_present: Boolean(position.description),
      hook_count: position.hooks.length,
      exact_source_ref_count: evidence.exact_source_refs.length,
      thematic_source_ref_count: evidence.thematic_source_refs.length,
      livelihood_template_count: evidence.livelihood_templates.length,
      max_narrative_depth: evidence.max_narrative_depth
    },
    evidence: {
      exact_source_refs: evidence.exact_source_refs,
      thematic_source_refs: evidence.thematic_source_refs.slice(0,8),
      livelihood_templates: evidence.livelihood_templates,
      livelihood_ref: evidence.livelihood_ref
    },
    next_work: completedWorld
      ? []
      : classification === 'ready'
        ? ['inventory_existing_scene_provenance','author_role_world_14x4','bind_primary_threads_and_private_aftermath']
      : classification === 'not_a_standalone_world'
        ? ['keep_as_context_or_outcome_status','promote_only_if_future_authored_world_proves_independent_social_life']
        : ['author_role_specific_private_life_social_or_narrative_sources','then_reaudit_before_role_world_production']
  };
}).sort((a,b)=>a.key.localeCompare(b.key,'nb'));

const classCounts = Object.fromEntries(['ready','needs_authored_depth','not_a_standalone_world']
  .map((id)=>[id, rows.filter((row)=>row.classification===id).length]));

const queue = rows
  .filter((row)=>row.classification !== 'not_a_standalone_world' && row.role_world_status !== 'role_world_complete')
  .sort((a,b)=>b.priority_score-a.priority_score || a.key.localeCompare(b.key,'nb'))
  .map((row,index)=>({
    rank:index+1,
    key:row.key,
    label:row.label,
    badge_id:row.badge_id,
    classification:row.classification,
    priority_score:row.priority_score,
    exact_source_ref_count:row.authored_depth.exact_source_ref_count,
    livelihood_template_count:row.authored_depth.livelihood_template_count,
    max_narrative_depth:row.authored_depth.max_narrative_depth
  }));

const output = {
  schema:'civication_life_position_role_world_readiness_v2',
  version:2,
  reviewed_at:'2026-09-11',
  generated_by:'scripts/audit-civication-life-position-role-world-readiness.mjs',
  source_contracts:{
    taxonomy:'data/Civication/nonCareerRoleTaxonomy.json',
    life_position_catalog:'data/Civication/lifePositionCatalog.json',
    badge_index:'data/badges/index.json',
    badge_career_overlays:'data/Civication/badgeCareerContracts/index.json',
    livelihood_templates:'data/Civication/livelihoodOpportunityTemplates.json',
    role_world_index:'data/Civication/roleWorlds/index.json',
    role_world_standard:'docs/CIVICATION_ROLE_WORLD_STANDARD.md',
    scene_pipeline:'data/Civication/SCENE_PIPELINE_V1.md'
  },
  semantics:{
    audit_only_no_new_runtime:true,
    all_positions_come_from_CivicationLifePositions:true,
    role_world_completion_semantics_unchanged:true,
    readiness_classification_is_independent_of_role_world_lifecycle:true,
    one_life_position_per_role_world_pr:true,
    livelihood_opportunity_alone_is_not_role_world_depth:true,
    generic_private_life_content_is_supporting_context_not_role_specific_completion:true,
    status_or_achievement_positions_default_to_context_until_independent_authored_world_is_proven:true,
    duplicate_life_position_ids_or_labels_require_badge_scoped_governed_binding:true
  },
  classification_contract:{
    ready:'Existing governed authored sources provide a multi-scene role-specific narrative foundation. Readiness is independent of lifecycle, so an already completed Role World may remain classified ready while role_world_status is role_world_complete and it is excluded from the pending queue.',
    needs_authored_depth:'Canonical selectable life position, but current governed sources are too thin for Role World production. Author role-specific private/life/social/narrative material before 14x4 materialization.',
    not_a_standalone_world:'Primarily achievement, fame, legacy, mandate, selection or reputation status with no independent authored social world. Keep it as context/outcome by default; reconsider only if future governed source depth proves a standalone world.'
  },
  summary:{
    selectable_life_positions:rows.length,
    classifications:classCounts,
    completed_life_position_role_worlds:rows.filter((row)=>row.role_world_status==='role_world_complete').length,
    queue_length:queue.length,
    livelihood_backed_positions:rows.filter((row)=>row.authored_depth.livelihood_template_count>0).length,
    positions_with_exact_governed_sources:rows.filter((row)=>row.authored_depth.exact_source_ref_count>0).length,
    positions_with_multi_scene_narrative_foundation:rows.filter((row)=>row.authored_depth.max_narrative_depth>=4).length,
    life_position_role_world_complete:rows.filter((row)=>row.role_world_status==='role_world_complete').length,
    pending_ready_positions:queue.filter((row)=>row.classification==='ready').length
  },
  first_ready:queue.find((row)=>row.classification==='ready') || null,
  queue,
  positions:rows
};

function renderReport(data) {
  const lines=[];
  lines.push('# Civication life-position Role World readiness','');
  lines.push(`**Selectable life positions audited:** ${data.summary.selectable_life_positions}`);
  lines.push(`**Classification:** ${data.summary.classifications.ready} ready / ${data.summary.classifications.needs_authored_depth} needs_authored_depth / ${data.summary.classifications.not_a_standalone_world} not_a_standalone_world`);
  lines.push(`**Livelihood-backed:** ${data.summary.livelihood_backed_positions}`);
  lines.push(`**Exact governed-source matches:** ${data.summary.positions_with_exact_governed_sources}`);
  lines.push(`**Multi-scene narrative foundations:** ${data.summary.positions_with_multi_scene_narrative_foundation}`);
  lines.push(`**Completed life-position Role Worlds:** ${data.summary.life_position_role_world_complete}`);
  lines.push(`**Pending ready positions:** ${data.summary.pending_ready_positions}`,'');
  lines.push('## Decision','');
  if (data.first_ready) lines.push(`First pending ready Role World position: **${data.first_ready.key} — ${data.first_ready.label}**.`,'');
  else lines.push(`No unfinished life position is currently ready for Role World production. Source-ready positions that are already role_world_complete remain visible in the ${data.summary.selectable_life_positions}-position audit but are excluded from the pending queue; remaining standalone-capable positions require authored depth first.`,'');
  lines.push('Livelihood templates count as provenance for an economic opportunity, but never as sufficient Role World depth on their own.','');
  lines.push('## Top queue','');
  lines.push('| Rank | Position | Class | Exact refs | Livelihood | Narrative depth |');
  lines.push('| ---: | --- | --- | ---: | ---: | ---: |');
  for (const row of data.queue.slice(0,30)) lines.push(`| ${row.rank} | \`${row.key}\` | ${row.classification} | ${row.exact_source_ref_count} | ${row.livelihood_template_count} | ${row.max_narrative_depth} |`);
  lines.push('','## Boundaries','');
  lines.push(`- Readiness classification is separate from Role World lifecycle status; completed worlds stay visible in the ${data.summary.selectable_life_positions}-position audit but leave the pending queue.`);
  lines.push('- This audit does not create a NonCareerRoleEngine or new scene format.');
  lines.push('- Circumstances, relationships and livelihood remain separate runtime layers.');
  lines.push('- Generic private-life scenes may support aftermath, but cannot prove a specific life-position world by themselves.');
  lines.push('- Achievement/fame/legacy/mandate statuses are not standalone worlds by default unless later governed evidence proves an independent social world.');
  lines.push('- Every actual Role World remains one subject per PR and must pass the normal Role World + Scene Pipeline gates.','');
  return lines.join('\n')+'\n';
}

const jsonText = JSON.stringify(output,null,2)+'\n';
const reportText = renderReport(output);
const writeMode = process.argv.includes('--write');
const checkMode = process.argv.includes('--check') || !writeMode;

if (writeMode) {
  fs.writeFileSync(path.join(ROOT,OUTPUT),jsonText);
  fs.writeFileSync(path.join(ROOT,REPORT),reportText);
  console.log(`WROTE: ${OUTPUT}`);
  console.log(`WROTE: ${REPORT}`);
}
if (checkMode) {
  if (!exists(OUTPUT) || !exists(REPORT)) throw new Error('Readiness outputs missing; run with --write.');
  if (readText(OUTPUT)!==jsonText) throw new Error(`${OUTPUT} is stale; run with --write.`);
  if (readText(REPORT)!==reportText) throw new Error(`${REPORT} is stale; run with --write.`);
  const expectedSelectable = Number(taxonomy.canonical_counts?.selectable_life_positions_total);
  if (!Number.isInteger(expectedSelectable) || expectedSelectable < 1) throw new Error('Canonical selectable life-position count missing from taxonomy.');
  if (rows.length!==expectedSelectable) throw new Error(`Expected ${expectedSelectable} selectable life positions, got ${rows.length}`);
  console.log(`PASS: ${rows.length} life positions audited; ${classCounts.ready} ready, ${classCounts.needs_authored_depth} needs depth, ${classCounts.not_a_standalone_world} not standalone; ${output.summary.life_position_role_world_complete} Role World complete.`);
}
