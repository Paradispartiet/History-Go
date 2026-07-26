#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const contractPath = path.join(historyDir, 'historie_v5_contract.json');
const readinessPath = path.join(reportDir, 'historie-v5-6-readiness.json');
const manifestPath = path.join(historyDir, 'historie_v5_6_freeze_manifest.json');
const jsonReportPath = path.join(reportDir, 'historie-v5-6-quality-depth.json');
const markdownReportPath = path.join(reportDir, 'historie-v5-6-quality-depth.md');
const writeFreeze = process.argv.includes('--write-freeze');
const reasonArg = process.argv.find((arg) => arg.startsWith('--reason='));
const freezeReason = reasonArg ? reasonArg.slice('--reason='.length) : 'V5.6 quality freeze after adding the universal prehistory and archaeology domain.';
const A = (value) => Array.isArray(value) ? value : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9æøå]+/g, ' ').trim();
const stopwords = new Set(['og','eller','som','for','med','til','fra','ved','mot','uten','etter','under','over','mellom','gjennom','den','det','de','en','et','av','på','i','er','var','blir','kan','skal','må','historisk','historie']);
const significantTokens = (value) => normalize(value).split(/\s+/).filter((token) => token.length >= 4 && !stopwords.has(token));
const unique = (values) => [...new Set(values)];
const countBy = (items, keyFn) => items.reduce((map, item) => { const key = keyFn(item); map.set(key, (map.get(key) || 0) + 1); return map; }, new Map());
const percentile = (numbers, p) => { if (!numbers.length) return 0; const sorted = [...numbers].sort((a,b)=>a-b); return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))]; };

fs.mkdirSync(reportDir, { recursive: true });
const contract = readJson(contractPath);
const readiness = readJson(readinessPath);
const files = Object.fromEntries(Object.entries(contract.authoritative_files).map(([key, rel]) => [key, path.join(historyDir, rel)]));
const concepts = readJson(files.concepts);
const theories = readJson(files.theories);
const emner = readJson(files.emner);
const mappings = readJson(files.emnemapping);
const pensum = readJson(files.pensum);
const methodsFile = readJson(files.methods);
const methods = A(methodsFile.methods);

const errors = [];
const warnings = [];
const fail = (code, id, detail) => errors.push({ code, id, detail });
const warn = (code, id, detail) => warnings.push({ code, id, detail });

if (readiness.status !== 'FREEZE_READY') fail('readiness_status', 'global', `Expected FREEZE_READY, got ${readiness.status}`);
if (readiness.v6_allowed !== true) fail('v6_gate_closed', 'global', 'v6_allowed must be true after the V5.6 freeze.');
for (const [key, expected] of Object.entries(contract.coverage_counts || {})) {
  const actual = key === 'domains' ? A(pensum.domains).length
    : key === 'emner' ? emner.length
    : key === 'mappings' ? mappings.length
    : key === 'concepts' ? concepts.length
    : key === 'theories' || key === 'theory_hooks' ? theories.length
    : key === 'methods' ? methods.length
    : null;
  if (actual != null && actual !== expected) fail('coverage_count', key, `${actual} != ${expected}`);
}
if (readiness.quality_issue_totals?.concepts !== 0 || readiness.quality_issue_totals?.theories !== 0 || readiness.quality_issue_totals?.emner !== 0 || readiness.quality_issue_totals?.domains_not_freeze_ready !== 0) {
  fail('readiness_issues', 'global', JSON.stringify(readiness.quality_issue_totals));
}
if (!A(readiness.domains).every((domain) => domain.freeze_ready && domain.coverage_complete)) fail('domain_not_frozen', 'global', 'Every domain must be coverage_complete and freeze_ready.');

const conceptIds = new Set();
const conceptDefinitionCounts = countBy(concepts, (item) => normalize(item.definition));
const misuseCounts = countBy(concepts, (item) => normalize(A(item.common_misuse).join('|')));
const conceptDefinitionLengths = [];
let conceptIndicatorReady = 0;
let conceptSourceReady = 0;
let lexicalAnchored = 0;
let semanticRelationCount = 0;
for (const concept of concepts) {
  const id = concept.concept_id || '(missing)';
  if (!concept.concept_id || conceptIds.has(concept.concept_id)) fail('concept_id', id, 'Missing or duplicate concept_id.');
  conceptIds.add(concept.concept_id);
  const label = String(concept.label || '').trim();
  const definition = String(concept.definition || '').trim();
  const misuse = A(concept.common_misuse).map(String).filter(Boolean);
  const relations = unique([...A(concept.broader_concepts), ...A(concept.narrower_concepts), ...A(concept.related_concepts), ...A(concept.distinguish_from)]);
  const indicators = A(concept.indicators).map(String).filter(Boolean);
  const sourceRequirements = A(concept.source_requirements).map(String).filter(Boolean);
  conceptDefinitionLengths.push(definition.length);
  semanticRelationCount += relations.length;
  if (!label) fail('concept_label', id, 'Missing label.');
  if (/^\d+$/.test(label) && concept.concept_type === 'analytical_concept') fail('numeric_concept', id, 'Numeric reference is still typed as analytical_concept.');
  if (definition.length < 70) fail('concept_definition_short', id, `${definition.length} characters.`);
  if (/^I .+ betegner «.+» en historisk avgrenset relasjon/i.test(definition)) fail('concept_generator_template', id, 'Synthetic generator definition remains.');
  if ((conceptDefinitionCounts.get(normalize(definition)) || 0) > 1) fail('concept_definition_duplicate', id, 'Exact normalized definition is shared by multiple concepts.');
  if (!relations.length) fail('concept_relations_missing', id, 'No semantic relation.');
  for (const relation of relations) {
    if (relation === id) fail('concept_self_relation', id, relation);
  }
  if (!misuse.length || misuse.some((value) => value.length < 35)) fail('concept_misuse_weak', id, 'Missing or too-short misuse guard.');
  if ((misuseCounts.get(normalize(misuse.join('|'))) || 0) > 1) fail('concept_misuse_duplicate', id, 'Exact normalized misuse profile is shared.');
  if (!A(concept.domain_ids).length || !A(concept.source_emne_ids).length) fail('concept_provenance', id, 'Missing domain or emne provenance.');
  if (indicators.length >= 2) conceptIndicatorReady += 1; else fail('concept_indicators', id, `${indicators.length} indicators; expected at least 2.`);
  if (sourceRequirements.length >= 2) conceptSourceReady += 1; else fail('concept_source_requirements', id, `${sourceRequirements.length} source requirements; expected at least 2.`);
  const tokens = significantTokens(label);
  if (!tokens.length || tokens.some((token) => normalize(definition).includes(token))) lexicalAnchored += 1;
  else warn('concept_lexical_anchor', id, `Definition does not repeat a significant label token: ${tokens.join(', ')}`);
}
for (const concept of concepts) {
  for (const relation of unique([...A(concept.broader_concepts), ...A(concept.narrower_concepts), ...A(concept.related_concepts), ...A(concept.distinguish_from)])) {
    if (!conceptIds.has(relation)) fail('concept_unknown_relation', concept.concept_id, relation);
  }
}

const theoryIds = new Set();
const theoryDefinitionCounts = countBy(theories, (item) => normalize(item.definition));
const limitationSignatures = countBy(theories, (item) => A(item.limitations).map(normalize).sort().join('|'));
const theoryDefinitionLengths = [];
let theoriesWithThreeLimits = 0;
for (const theory of theories) {
  const id = theory.theory_id || '(missing)';
  if (!theory.theory_id || theoryIds.has(theory.theory_id)) fail('theory_id', id, 'Missing or duplicate theory_id.');
  theoryIds.add(theory.theory_id);
  const definition = String(theory.definition || '').trim();
  const limitations = A(theory.limitations).map(String).filter(Boolean);
  theoryDefinitionLengths.push(definition.length);
  if (definition.length < 110) fail('theory_definition_short', id, `${definition.length} characters.`);
  if ((theoryDefinitionCounts.get(normalize(definition)) || 0) > 1) fail('theory_definition_duplicate', id, 'Exact normalized theory definition is shared.');
  if (limitations.length >= 3) theoriesWithThreeLimits += 1; else fail('theory_limitations_count', id, `${limitations.length}; expected at least 3.`);
  if (limitations.some((value) => value.length < 45)) fail('theory_limitation_short', id, 'At least one limitation is shorter than 45 characters.');
  if ((limitationSignatures.get(limitations.map(normalize).sort().join('|')) || 0) > 1) fail('theory_limitation_duplicate', id, 'Exact normalized limitation profile is shared.');
  if (!A(theory.method_links).length) fail('theory_methods', id, 'Missing method links.');
  if (!A(theory.thinker_ids).length) fail('theory_thinkers', id, 'Missing thinker path.');
  if (!theory.source_hook_id) fail('theory_hook', id, 'Missing source hook.');
  if (theory.evidence_ready !== false) fail('theory_evidence_state', id, 'V5.6 theory must remain evidence_ready=false.');
}

const emneIds = new Set(emner.map((item) => item.emne_id));
for (const emne of emner) {
  const id = emne.emne_id;
  const core = A(emne.core_concepts).length ? A(emne.core_concepts) : A(emne.core_concept_ids);
  const sub = A(emne.sub_concepts).length ? A(emne.sub_concepts) : A(emne.sub_concept_ids);
  if (String(emne.definition || '').length < 80) fail('emne_definition', id, 'Definition shorter than 80 characters.');
  if (String(emne.why_it_matters || '').length < 80) fail('emne_rationale', id, 'Rationale shorter than 80 characters.');
  if (core.length < 4 || sub.length < 4) fail('emne_concepts', id, `core=${core.length}, sub=${sub.length}`);
  if (A(emne.key_questions).length < 3 || A(emne.analysis_axes).length < 3) fail('emne_analysis_model', id, 'Thin questions or analysis axes.');
  if (A(emne.anti_patterns).length < 3) fail('emne_antipatterns', id, 'Fewer than three anti-patterns.');
  for (const other of A(emne.distinguish_from_emners)) if (!emneIds.has(other)) fail('emne_unknown_distinction', id, other);
}

const authoritativeFiles = [contractPath, ...unique(Object.values(files))];
const fileHashes = Object.fromEntries(authoritativeFiles.map((file) => [path.relative(root, file), sha256(file)]));
let manifest = fs.existsSync(manifestPath) ? readJson(manifestPath) : null;
if (!writeFreeze) {
  if (!manifest) fail('freeze_manifest_missing', 'global', path.relative(root, manifestPath));
  else {
    if (manifest.status !== 'FROZEN') fail('freeze_manifest_status', 'global', String(manifest.status));
    for (const [file, digest] of Object.entries(manifest.files || {})) {
      const absolute = path.join(root, file);
      if (!fs.existsSync(absolute)) fail('freeze_file_missing', file, 'Frozen file is missing.');
      else if (sha256(absolute) !== digest) fail('freeze_hash_mismatch', file, 'Canonical V5.6 file changed without refreshing the freeze manifest.');
    }
    for (const file of Object.keys(fileHashes)) if (!manifest.files?.[file]) fail('freeze_file_untracked', file, 'Authoritative file is not tracked by the freeze manifest.');
  }
}

const metrics = {
  counts: { domains:A(pensum.domains).length, emner:emner.length, mappings:mappings.length, methods:methods.length, concepts:concepts.length, theories:theories.length },
  concepts: {
    indicator_ready: conceptIndicatorReady,
    source_requirement_ready: conceptSourceReady,
    lexical_anchor_ready: lexicalAnchored,
    semantic_relations_total: semanticRelationCount,
    definition_length: { min:Math.min(...conceptDefinitionLengths), median:percentile(conceptDefinitionLengths,0.5), p10:percentile(conceptDefinitionLengths,0.1), average:Math.round(conceptDefinitionLengths.reduce((a,b)=>a+b,0)/conceptDefinitionLengths.length) }
  },
  theories: {
    with_at_least_three_limitations: theoriesWithThreeLimits,
    definition_length: { min:Math.min(...theoryDefinitionLengths), median:percentile(theoryDefinitionLengths,0.5), p10:percentile(theoryDefinitionLengths,0.1), average:Math.round(theoryDefinitionLengths.reduce((a,b)=>a+b,0)/theoryDefinitionLengths.length) }
  }
};

if (writeFreeze && errors.length === 0) {
  manifest = {
    schema_version: '1.0',
    subject_id: 'historie',
    version: 'v5.6',
    status: 'FROZEN',
    frozen_at: new Date().toISOString(),
    reason: freezeReason,
    readiness: { status:readiness.status, v6_allowed:readiness.v6_allowed, quality_issue_totals:readiness.quality_issue_totals },
    counts: metrics.counts,
    files: fileHashes,
    update_policy: 'Any mutation of an authoritative V5.6 file requires a reviewed PR, a green depth audit, and an intentionally refreshed manifest with an explicit reason.'
  };
  writeJson(manifestPath, manifest);
}

const report = {
  schema_version: '1.0',
  subject_id: 'historie',
  version: 'v5.6',
  generated_at: new Date().toISOString(),
  status: errors.length ? 'FAILED' : 'PASSED',
  freeze_mode: writeFreeze ? 'write' : 'verify',
  freeze_manifest: manifest ? { path:path.relative(root, manifestPath), status:manifest.status, frozen_at:manifest.frozen_at, reason:manifest.reason } : null,
  metrics,
  errors,
  warnings
};
writeJson(jsonReportPath, report);
const lines = [
  '# Historie V5.6 quality depth audit','',
  `- Status: **${report.status}**`,
  `- Mode: \`${report.freeze_mode}\``,
  `- Domains: ${metrics.counts.domains}/20`,
  `- Emner: ${metrics.counts.emner}/200`,
  `- Concepts: ${metrics.counts.concepts}/826`,
  `- Theories: ${metrics.counts.theories}/200`,
  `- Concepts with ≥2 indicators: ${metrics.concepts.indicator_ready}/${metrics.counts.concepts}`,
  `- Concepts with ≥2 source requirements: ${metrics.concepts.source_requirement_ready}/${metrics.counts.concepts}`,
  `- Semantic concept relations: ${metrics.concepts.semantic_relations_total}`,
  `- Theories with ≥3 limitations: ${metrics.theories.with_at_least_three_limitations}/${metrics.counts.theories}`,
  `- Errors: ${errors.length}`,
  `- Warnings: ${warnings.length}`,'',
  '## Definition depth','',
  `Concept definitions: min ${metrics.concepts.definition_length.min}, p10 ${metrics.concepts.definition_length.p10}, median ${metrics.concepts.definition_length.median}, average ${metrics.concepts.definition_length.average} characters.`,
  `Theory definitions: min ${metrics.theories.definition_length.min}, p10 ${metrics.theories.definition_length.p10}, median ${metrics.theories.definition_length.median}, average ${metrics.theories.definition_length.average} characters.`,'',
  '## Errors','',
  ...(errors.length ? errors.map((item)=>`- \`${item.code}\` — \`${item.id}\`: ${item.detail}`) : ['None.']),'',
  '## Warnings','',
  ...(warnings.length ? warnings.map((item)=>`- \`${item.code}\` — \`${item.id}\`: ${item.detail}`) : ['None.']),'',
  '## Freeze policy','',
  manifest ? `Manifest: \`${path.relative(root, manifestPath)}\`, frozen ${manifest.frozen_at}.` : 'No freeze manifest loaded.',
  'Authoritative V5.6 files may only change through an explicit manifest refresh after a green depth audit.'
];
fs.writeFileSync(markdownReportPath, `${lines.join('\n')}\n`);
console.log(`Historie V5.6 quality depth audit: ${report.status}`);
console.log(`Concepts ${metrics.counts.concepts}, theories ${metrics.counts.theories}, errors ${errors.length}, warnings ${warnings.length}`);
if (errors.length) process.exit(1);
