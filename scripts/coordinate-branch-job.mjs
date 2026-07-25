import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const legacyHook = 'his_historiebruk_minne';
const memorySiteHook = 'his_minnested_ritual_offentlig_sorg';
const memorySiteEmne = 'em_his_minnesteder_historiebruk';

const migrations = [
  {
    quiz: 'data/quiz/historie/grindheim_runestein_sets.json',
    questionId: 'grindheim_runestein_quiz_21',
    brief: 'data/quiz/production_briefs/historie/grindheim_runestein.json',
    claimId: 'claim_grindheim_runestein_21'
  },
  {
    quiz: 'data/quiz/historie/grindheim_steinkross_sets.json',
    questionId: 'grindheim_steinkross_quiz_21',
    brief: 'data/quiz/production_briefs/historie/grindheim_steinkross.json',
    claimId: 'claim_grindheim_steinkross_21'
  },
  {
    quiz: 'data/quiz/historie/grindheimsveien_nord_gravfelt_sets.json',
    questionId: 'grindheimsveien_nord_gravfelt_quiz_12',
    brief: 'data/quiz/production_briefs/historie/grindheimsveien_nord_gravfelt.json',
    claimId: 'claim_grindheimsveien_nord_gravfelt_16'
  }
];

function findObject(value, key, expected) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findObject(item, key, expected);
      if (found) return found;
    }
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  if (value[key] === expected) return value;
  for (const child of Object.values(value)) {
    const found = findObject(child, key, expected);
    if (found) return found;
  }
  return null;
}

for (const migration of migrations) {
  const quizPath = path.join(root, migration.quiz);
  const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
  const question = findObject(quiz, 'id', migration.questionId);
  if (!question || question.topic_hook_id !== legacyHook || question.emne_id !== 'em_his_kulturminner_bevaring') {
    throw new Error(`Unexpected legacy question contract in ${migration.quiz}`);
  }
  question.topic_hook_id = memorySiteHook;
  question.emne_id = memorySiteEmne;
  if (question.theory_ref?.topic_hook_id === legacyHook) question.theory_ref.topic_hook_id = memorySiteHook;
  fs.writeFileSync(quizPath, JSON.stringify(quiz, null, 2) + '\n');

  const briefPath = path.join(root, migration.brief);
  const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
  const claim = findObject(brief, 'claim_id', migration.claimId);
  if (!claim || claim.topic_hook_id !== legacyHook || claim.emne_id !== 'em_his_kulturminner_bevaring') {
    throw new Error(`Unexpected legacy claim contract in ${migration.brief}`);
  }
  claim.topic_hook_id = memorySiteHook;
  claim.emne_id = memorySiteEmne;
  brief.selected_curriculum.topic_hook_ids = [...new Set(
    brief.selected_curriculum.topic_hook_ids.map((id) => id === legacyHook ? memorySiteHook : id)
  )];
  brief.selected_curriculum.emne_ids = [...new Set([
    ...brief.selected_curriculum.emne_ids,
    memorySiteEmne
  ])];
  fs.writeFileSync(briefPath, JSON.stringify(brief, null, 2) + '\n');
}

const parts = [
  'scripts/.phase8-builder.gz.b64.00',
  'scripts/.phase8-builder.gz.b64.01'
];
const encoded = parts.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('');
const source = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
const target = path.join('/tmp', 'history-phase8-builder.mjs');
fs.writeFileSync(target, source);
for (const file of parts) fs.rmSync(path.join(root, file));
await import(`file://${target}?v=${Date.now()}`);
