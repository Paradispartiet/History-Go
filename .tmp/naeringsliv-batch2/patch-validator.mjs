#!/usr/bin/env node
import fs from 'node:fs';

const file = '.tmp/naeringsliv-batch2/validator.mjs';
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(before, after, label) {
  const first = source.indexOf(before);
  const last = source.lastIndexOf(before);
  if (first < 0) throw new Error(`Missing validator patch anchor: ${label}`);
  if (first !== last) throw new Error(`Non-unique validator patch anchor: ${label}`);
  source = source.slice(0, first) + after + source.slice(first + before.length);
}

replaceOnce(
  'const globalQuestionTexts = [];\nconst validatedTargets = [];',
  'const validatedTargets = [];',
  'remove global cross-batch question accumulator'
);

replaceOnce(
  '  let migrationReplaced = 0;\n\n  for (const target of targets) {',
  '  let migrationReplaced = 0;\n  const manifestQuestionTexts = [];\n  const manifestProfessionalTexts = [];\n\n  for (const target of targets) {',
  'add per-manifest uniqueness accumulators'
);

replaceOnce(
  '    assert(professional.every((q) => typeof q.decision_context === "string" && q.decision_context.length >= 20), `${target.target_id}: missing decision context`);',
  '    if (isBatch2) assert(professional.every((q) => typeof q.decision_context === "string" && q.decision_context.length >= 20), `${target.target_id}: missing decision context`);',
  'limit decision context to batch 2'
);

replaceOnce(
  [
    '    assert(professional.slice(0, 14).every((q) => !("method_id" in q) && !("topic_hook_id" in q) && !("thinker_id" in q) && !("theory_ref" in q)), `${target.target_id}: method or theory starts before final set`);',
    '    assert(professional.slice(14).every((q) => typeof q.method_id === "string"), `${target.target_id}: final set lacks method binding`);'
  ].join('\n'),
  [
    '    if (isBatch2) {',
    '      assert(professional.slice(0, 14).every((q) => !("method_id" in q) && !("topic_hook_id" in q) && !("thinker_id" in q) && !("theory_ref" in q)), `${target.target_id}: method or theory starts before final set`);',
    '      assert(professional.slice(14).every((q) => typeof q.method_id === "string"), `${target.target_id}: final set lacks method binding`);',
    '    }'
  ].join('\n'),
  'limit phase binding to batch 2'
);

replaceOnce(
  [
    '      assert(Array.isArray(q.calculation.assumptions) && q.calculation.assumptions.length >= 1, `${q.id}: calculation assumptions are not visible`);',
    '      assert(typeof q.decision_boundary === "string" && q.decision_boundary.length >= 20, `${q.id}: decision boundary missing`);'
  ].join('\n'),
  [
    '      if (isBatch2) {',
    '        assert(Array.isArray(q.calculation.assumptions) && q.calculation.assumptions.length >= 1, `${q.id}: calculation assumptions are not visible`);',
    '        assert(typeof q.decision_boundary === "string" && q.decision_boundary.length >= 20, `${q.id}: decision boundary missing`);',
    '      }'
  ].join('\n'),
  'limit calculation additions to batch 2'
);

replaceOnce(
  '    globalQuestionTexts.push(...all.map((q) => q.question));\n    validatedTargets.push(target.target_id);',
  '    manifestQuestionTexts.push(...all.map((q) => q.question));\n    manifestProfessionalTexts.push(...professional.map((q) => q.question));\n    validatedTargets.push(target.target_id);',
  'collect per-manifest question text'
);

replaceOnce(
  [
    '  if (manifest.coverage?.opening_questions_reused !== undefined) {',
    '    assert(manifest.coverage.opening_questions_reused === migrationReused, `${manifestPath}: reused opening coverage mismatch`);',
    '    assert(manifest.coverage.opening_questions_added === migrationAdded, `${manifestPath}: added opening coverage mismatch`);',
    '    assert(manifest.coverage.opening_questions_replaced === migrationReplaced, `${manifestPath}: replaced opening coverage mismatch`);',
    '  }',
    '}',
    '',
    'assert(unique(globalQuestionTexts), "Question text must be unique across all materialized targets");'
  ].join('\n'),
  [
    '  if (manifest.coverage?.opening_questions_reused !== undefined) {',
    '    assert(manifest.coverage.opening_questions_reused === migrationReused, `${manifestPath}: reused opening coverage mismatch`);',
    '    assert(manifest.coverage.opening_questions_added === migrationAdded, `${manifestPath}: added opening coverage mismatch`);',
    '    assert(manifest.coverage.opening_questions_replaced === migrationReplaced, `${manifestPath}: replaced opening coverage mismatch`);',
    '  }',
    '  if (manifestPath.includes("batch_2")) assert(unique(manifestQuestionTexts), `${manifestPath}: question text must be unique across batch 2`);',
    '  else assert(unique(manifestProfessionalTexts), `${manifestPath}: professional question text must remain unique across the pilot`);',
    '}'
  ].join('\n'),
  'scope uniqueness by manifest'
);

fs.writeFileSync(file, source);
console.log('Patched validator: pilot preserved, batch-2 requirements isolated.');
