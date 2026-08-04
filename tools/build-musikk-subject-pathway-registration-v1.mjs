#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
if (!WRITE && !CHECK) throw new Error('Bruk --write eller --check');

const PATHS = Object.freeze({
  package: 'data/quiz/musikk/musikk_subject_pathways_v1.json',
  fagManifest: 'data/fag/fag_manifest.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  quizManifest: 'data/quiz/manifest.json',
  knowledgeManifest: 'data/knowledge/knowledge_manifest.json'
});

const text = (value) => String(value ?? '').trim();
const list = (value) => Array.isArray(value) ? value : [];
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const changed = [];

function expected(relative, value) {
  const next = jsonText(value);
  let current = '';
  try { current = fs.readFileSync(path.join(ROOT, relative), 'utf8'); } catch {}
  if (current === next) return;
  changed.push(relative);
  if (WRITE) fs.writeFileSync(path.join(ROOT, relative), next, 'utf8');
}

const pkg = readJson(PATHS.package);
if (pkg.schema !== 'history_go_subject_pathway_package_v1' || pkg.categoryId !== 'musikk' || pkg.targetId !== 'subject_musikk') {
  throw new Error('Musikk subject-pathway-pakken har uventet identitet');
}
const sets = list(pkg.sets);
if (!sets.length || sets.some((set) => list(set?.questions).length !== 5)) {
  throw new Error('Musikk subject-pathway-piloten må inneholde minst ett komplett femtrinnssett');
}
const releasedEmner = list(pkg.production_context?.released_emne_ids);
const releasedClaims = list(pkg.production_context?.question_ready_claim_ids);
const directObjects = list(pkg.production_context?.direct_object_ids);
const blockedTopics = Number(pkg.production_context?.blocked_canonical_topic_count);
if (releasedEmnerMismatch()) throw new Error('released_emne_ids må matche aktive sett');
if (blockedTopics !== 48 - releasedEmner.length) throw new Error('blocked_canonical_topic_count må være 48 minus released emner');
function releasedEmnerMismatch() {
  const setEmner = sets.map((set) => text(set?.emne_id));
  return releasedEmner.length !== setEmner.length || releasedEmner.some((id, index) => id !== setEmner[index]);
}

const fagManifest = readJson(PATHS.fagManifest);
if (!fagManifest.musikk) throw new Error('fag_manifest mangler musikk');
fagManifest.musikk = {
  ...fagManifest.musikk,
  quizPackageSchema: '../quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json',
  subjectPathwaySchema: '../quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json',
  subjectPathwayPackage: '../quiz/musikk/musikk_subject_pathways_v1.json'
};
expected(PATHS.fagManifest, fagManifest);

const inventory = readJson(PATHS.inventory);
const musikkInventory = list(inventory.subjects).find((item) => item?.id === 'musikk');
if (!musikkInventory) throw new Error('subject_inventory mangler musikk');
for (const field of ['quizPackageSchema', 'subjectPathwaySchema', 'subjectPathwayPackage']) {
  if (!list(musikkInventory.optionalManifestFields).includes(field)) musikkInventory.optionalManifestFields.push(field);
}
expected(PATHS.inventory, inventory);

const status = readJson(PATHS.status);
const musikkStatus = list(status.subjects).find((item) => item?.id === 'musikk');
if (!musikkStatus) throw new Error('subject_status mangler musikk');
musikkStatus.nextGate = 'phase_4_expand_fulltext_evidence_and_chapters';
musikkStatus.note = `Musikk er strukturelt materialisert fra den aktive musikkvitenskapelige pakken med 8 domener, 48 canonicale temaer og 18 metodeprotokoller. Kildegrunnlaget har 48 dossierer og 156 canonicale forskningskilder. Fulltekstlaget har frigitt ${releasedEmner.length} emner til subject pathways. Aktiv pathway inneholder ${sets.length} sett / ${sets.length * 5} spørsmål, ${releasedClaims.length} question-ready claims og ${directObjects.length} verifiserte direct objects. De øvrige ${blockedTopics} temaene er fortsatt blokkert for fagområdespørsmål til deres egne evidensporter er løst; redigerte hovedkapitler gjenstår.`;
expected(PATHS.status, status);

const quizManifest = readJson(PATHS.quizManifest);
quizManifest.subjectPackages = list(quizManifest.subjectPackages).filter((entry) => entry?.subjectId !== 'musikk');
quizManifest.subjectPackages.push({
  subjectId: 'musikk',
  targetId: 'subject_musikk',
  packageKind: 'subject_pathway',
  file: PATHS.package,
  schema: 'data/quiz/regler/QUIZ_SUBJECT_PATHWAY_PACKAGE_SCHEMA_V1.json',
  status: 'active'
});
quizManifest.subjectPackages.sort((a, b) => text(a?.subjectId).localeCompare(text(b?.subjectId), 'nb'));
expected(PATHS.quizManifest, quizManifest);

const knowledgeManifest = readJson(PATHS.knowledgeManifest);
knowledgeManifest.runtime = knowledgeManifest.runtime || {};
knowledgeManifest.runtime.subjectPathwaySources = {
  ...(knowledgeManifest.runtime.subjectPathwaySources || {}),
  musikk: '../quiz/musikk/musikk_subject_pathways_v1.json'
};
knowledgeManifest.runtime.subjectPathwaySources = Object.fromEntries(
  Object.entries(knowledgeManifest.runtime.subjectPathwaySources).sort(([a], [b]) => a.localeCompare(b, 'nb'))
);
expected(PATHS.knowledgeManifest, knowledgeManifest);

if (CHECK && changed.length) {
  console.error('Musikk subject-pathway-registrering er utdatert:');
  for (const file of changed) console.error(`- ${file}`);
  process.exitCode = 1;
} else {
  console.log(`Musikk subject-pathway-registrering ${WRITE ? 'skrevet' : 'OK'}: ${changed.length ? changed.length : 0} avvik.`);
}
