#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = Object.freeze({
  emners: 'data/fag/historie/emner_historie_canonical_v4_5.json',
  mappings: 'data/fag/historie/emnemapping_historie_canonical_v4_5.json',
  fagkart: 'data/fag/historie/fagkart_historie_canonical_v4_5.json',
  theories: 'data/fag/historie/theory_objects_historie_canonical_v5_5.json',
  architecture: 'data/fag/historie/curriculum_architecture_historie_v1.json',
  periodModules: 'data/fag/historie/period_modules_historie_v1.json',
  report: 'reports/fagverk/historie-canonical-emne-identity-audit.json'
});
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const normalize = (value) => String(value || '').toLocaleLowerCase('nb-NO').normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
  .replace(/[^a-z0-9]+/g, ' ').trim();
const stop = new Set(['em', 'his', 'historie', 'og', 'som', 'med', 'for', 'til', 'fra', 'eller']);
const tokens = (value) => normalize(value).split(/\s+/).filter((token) => token.length > 2 && !stop.has(token));
const tokenMatches = (left, right) => left === right
  || left.startsWith(right.slice(0, Math.min(6, right.length)))
  || right.startsWith(left.slice(0, Math.min(6, left.length)));

export function buildHistoryCanonicalEmneIdentityAudit() {
  const emners = list(readJson(PATHS.emners));
  const mappings = list(readJson(PATHS.mappings));
  const fagkart = readJson(PATHS.fagkart);
  const theories = list(readJson(PATHS.theories));
  const architecture = readJson(PATHS.architecture);
  const periodModules = readJson(PATHS.periodModules);
  assert(emners.length === 230, 'Det canonicale emneinventaret er endret');
  assert(new Set(emners.map((emne) => emne.emne_id)).size === emners.length, 'Dupliserte emne-id-er');
  const duplicateGroups = (field) => {
    const groups = new Map();
    for (const emne of emners) {
      const value = normalize(emne[field]);
      if (!groups.has(value)) groups.set(value, []);
      groups.get(value).push(emne.emne_id);
    }
    return [...groups.entries()].filter(([value, ids]) => value && ids.length > 1).map(([value, ids]) => ({ value, emne_ids: ids }));
  };
  const duplicateTitles = duplicateGroups('title');
  const duplicateDefinitions = duplicateGroups('definition');
  const duplicateShortLabels = duplicateGroups('short_label');
  assert(duplicateTitles.length === 0, 'Canonicale emner har dupliserte fulltitler');
  assert(duplicateDefinitions.length === 0, 'Canonicale emner har dupliserte definisjoner');

  const hookIds = new Set(list(fagkart.categories).flatMap((category) => list(category.topic_hooks).map((hook) => hook.id)));
  const theoryHookIds = new Set(theories.map((theory) => theory.source_hook_id));
  const mappingByEmne = new Map(mappings.map((mapping) => [mapping.emne_id, mapping]));
  const semanticIdentity = emners.map((emne) => {
    const semanticKey = list(emne.primary_theory_hooks)[0];
    assert(semanticKey && hookIds.has(semanticKey), `${emne.emne_id}: mangler canonical semantisk hook`);
    assert(theoryHookIds.has(semanticKey), `${emne.emne_id}: semantisk hook mangler teoriobjekt`);
    assert(list(mappingByEmne.get(emne.emne_id)?.mappings).some((mapping) => mapping.topic_hook === semanticKey), `${emne.emne_id}: mappingen bekrefter ikke semantisk hook`);
    const idTokens = tokens(emne.emne_id);
    const titleTokens = tokens(emne.title);
    const legacyIdTitleDrift = !idTokens.some((idToken) => titleTokens.some((titleToken) => tokenMatches(idToken, titleToken)));
    return {
      emne_id: emne.emne_id,
      title: emne.title,
      area_id: emne.area_id,
      semantic_key: semanticKey,
      identity_resolution: legacyIdTitleDrift
        ? 'stable_opaque_id_locked_to_title_by_semantic_key'
        : 'id_and_title_lexically_aligned'
    };
  });
  const driftRows = semanticIdentity.filter((row) => row.identity_resolution === 'stable_opaque_id_locked_to_title_by_semantic_key');
  assert(new Set(semanticIdentity.map((row) => row.semantic_key)).size === emners.length, 'Semantiske emnenøkler er ikke unike');
  assert(architecture.curation_policy?.fixed_emne_quotas_forbidden === true, 'Arkitekturen forbyr ikke faste emnekvoter');
  const unitCounts = list(periodModules.modules).map((module) => list(module.units).length);
  assert(unitCounts.length === 3 && new Set(unitCounts).size === unitCounts.length, 'De aktive periodemodulene har en skjult fast kvote');

  return {
    schema: 'history_go_history_canonical_emne_identity_audit_v1',
    version: '1.0.0',
    status: 'passed_with_legacy_ids_documented',
    policy: {
      emne_ids_are_stable_opaque_compatibility_keys: true,
      semantic_key_is_primary_theory_hook: true,
      full_title_is_user_facing_identity: true,
      fixed_emne_quota_is_not_editorial_target: true,
      renaming_stable_ids_without_reference_migration_forbidden: true
    },
    summary: {
      emne_count: emners.length,
      unique_emne_ids: new Set(emners.map((emne) => emne.emne_id)).size,
      unique_titles: new Set(emners.map((emne) => normalize(emne.title))).size,
      unique_definitions: new Set(emners.map((emne) => normalize(emne.definition))).size,
      unique_semantic_keys: new Set(semanticIdentity.map((row) => row.semantic_key)).size,
      legacy_id_title_drift_count: driftRows.length,
      duplicate_short_label_groups: duplicateShortLabels.length,
      unresolved_blockers: 0,
      active_period_module_unit_counts: unitCounts
    },
    accepted_short_label_collisions: duplicateShortLabels.map((group) => ({
      ...group,
      resolution: 'Fulltitlene er unike og brukes som brukeridentitet; kortetiketten er bare sekundær visning.'
    })),
    legacy_id_title_drift: driftRows,
    semantic_identity: semanticIdentity
  };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const report = buildHistoryCanonicalEmneIdentityAudit();
    const reportPath = path.join(ROOT, PATHS.report);
    if (args.has('--write-report')) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    } else {
      assert(fs.existsSync(reportPath) && isDeepStrictEqual(readJson(PATHS.report), report), `${PATHS.report} er utdatert`);
    }
    console.log(`Historie-emneidentitet OK: ${report.summary.emne_count} emner, ${report.summary.legacy_id_title_drift_count} dokumenterte legacy-id-er og ${report.summary.unresolved_blockers} uløste blokkere.`);
  } catch (error) {
    console.error(`Historie-emneidentitet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
