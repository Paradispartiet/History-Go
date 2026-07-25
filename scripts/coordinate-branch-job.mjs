import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const parts = [
  'scripts/.phase8-builder.gz.b64.00',
  'scripts/.phase8-builder.gz.b64.01'
];
const encoded = parts.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('');
let source = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');

const testMarker = "run('npm',['run','test:quiz-production']);";
if (!source.includes(testMarker)) throw new Error('Could not find exact quiz-production marker in phase 8 builder');

const migration = String.raw`
{
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

  const findObject = (value, key, expected) => {
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
  };

  for (const item of migrations) {
    const quiz = j(item.quiz);
    const question = findObject(quiz, 'id', item.questionId);
    if (!question) throw new Error('Missing target question ' + item.questionId);
    question.topic_hook_id = memorySiteHook;
    question.emne_id = memorySiteEmne;
    if (question.theory_ref) question.theory_ref.topic_hook_id = memorySiteHook;
    w(item.quiz, quiz);

    const brief = j(item.brief);
    const claim = findObject(brief, 'claim_id', item.claimId);
    if (!claim) throw new Error('Missing target claim ' + item.claimId);
    claim.topic_hook_id = memorySiteHook;
    claim.emne_id = memorySiteEmne;
    brief.selected_curriculum.topic_hook_ids = [...new Set(
      brief.selected_curriculum.topic_hook_ids.map((id) => id === legacyHook ? memorySiteHook : id)
    )];
    brief.selected_curriculum.emne_ids = [...new Set([
      ...brief.selected_curriculum.emne_ids,
      memorySiteEmne
    ])];
    w(item.brief, brief);

    const quizCheck = fs.readFileSync(item.quiz, 'utf8');
    const briefCheck = fs.readFileSync(item.brief, 'utf8');
    if (quizCheck.includes(legacyHook) || briefCheck.includes(legacyHook)) {
      throw new Error('Legacy memory hook remains in ' + item.quiz + ' or ' + item.brief);
    }
  }

  for (const target of [
    'grindheim_runestein',
    'grindheim_steinkross',
    'grindheimsveien_nord_gravfelt',
    'hoyland_gravhaug_etne'
  ]) {
    run('node',[
      'scripts/build-quiz-production-context.mjs',
      '--category','historie',
      '--target',target,
      '--output','data/quiz/production_context/historie/' + target + '.json'
    ]);
  }
  console.log('Migrated legacy memory bindings after phase 8 materialization.');
}
`;
source = source.replace(testMarker, `${migration}\n${testMarker}`);

const target = path.join('/tmp', 'history-phase8-builder.mjs');
fs.writeFileSync(target, source);
for (const file of parts) fs.rmSync(path.join(root, file));
await import(`file://${target}?v=${Date.now()}`);
