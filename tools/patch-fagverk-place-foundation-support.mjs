#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const auditFile = path.join(ROOT, 'scripts/audit-fagverk-place-pages.mjs');
let source = fs.readFileSync(auditFile, 'utf8');

const schemaNeedle = "const schema = readJson('data/places/regler/place_fagverk_v2.schema.json');\n";
if (!source.includes("const fagManifest = readJson('data/fag/fag_manifest.json');")) {
  if (!source.includes(schemaNeedle)) throw new Error('Audit patch: schema anchor not found');
  source = source.replace(schemaNeedle, `${schemaNeedle}const fagManifest = readJson('data/fag/fag_manifest.json');\n`);
}

const oldBuilder = `function buildSubjectTargets() {\n  const targets = new Map();\n  for (const [subjectId, subject] of Object.entries(registry.subjects || {})) {\n    const emneIds = new Set();\n    const chapterIds = new Set();\n    for (const chapter of list(subject.chapters)) {\n      if (text(chapter.id)) chapterIds.add(chapter.id);\n      for (const emneId of list(chapter.emne_ids)) emneIds.add(emneId);\n    }\n    targets.set(subjectId, { emneIds, chapterIds });\n  }\n  return targets;\n}\n`;

const newBuilder = `function foundationEmneIds(subjectId, subject) {\n  if (text(subject?.canonicalModel?.schemaFamily) !== 'foundation_v1') return [];\n  const pointer = text(fagManifest?.[subjectId]?.emner);\n  if (!pointer) return [];\n  const document = readJson(\`data/fag/\${pointer}\`);\n  const rows = Array.isArray(document) ? document : list(document.emners || document.emner || document.items);\n  return rows.map((row) => text(row?.emne_id || row?.id)).filter(Boolean);\n}\n\nfunction buildSubjectTargets() {\n  const targets = new Map();\n  for (const [subjectId, subject] of Object.entries(registry.subjects || {})) {\n    const emneIds = new Set();\n    const chapterIds = new Set();\n    for (const chapter of list(subject.chapters)) {\n      if (text(chapter.id)) chapterIds.add(chapter.id);\n      for (const emneId of list(chapter.emne_ids)) emneIds.add(emneId);\n    }\n    for (const emneId of foundationEmneIds(subjectId, subject)) emneIds.add(emneId);\n    const chapterlessFoundation = text(subject?.canonicalModel?.schemaFamily) === 'foundation_v1' && chapterIds.size === 0;\n    targets.set(subjectId, { emneIds, chapterIds, chapterlessFoundation });\n  }\n  return targets;\n}\n`;

if (!source.includes('function foundationEmneIds(')) {
  if (!source.includes(oldBuilder)) throw new Error('Audit patch: subject target builder anchor not found');
  source = source.replace(oldBuilder, newBuilder);
}

const oldChapterCheck = "  if (list(fagverk.chapter_ids).length < requirements.chapters) errors.push(`${prefix} mangler relevante canonicale kapitler`);\n";
const newChapterCheck = "  const selectedTargets = list(fagverk.subject_ids).map((subjectId) => subjectTargets.get(subjectId)).filter(Boolean);\n  const chapterlessFoundation = selectedTargets.length > 0 && selectedTargets.every((target) => target.chapterlessFoundation);\n  const requiredChapters = fagverk.level === 'standard' && chapterlessFoundation ? 0 : requirements.chapters;\n  if (list(fagverk.chapter_ids).length < requiredChapters) errors.push(`${prefix} mangler relevante canonicale kapitler`);\n";
if (!source.includes('const chapterlessFoundation = selectedTargets.length > 0')) {
  if (!source.includes(oldChapterCheck)) throw new Error('Audit patch: chapter requirement anchor not found');
  source = source.replace(oldChapterCheck, newChapterCheck);
}

fs.writeFileSync(auditFile, source);
console.log('Patched Place Fagverk audit with canonical foundation_v1 emne support and honest chapterless standard handling');
