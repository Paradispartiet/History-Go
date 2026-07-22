import fs from 'node:fs';

const quizPath = 'data/quiz/historie/stodle_kyrkje_sets.json';
const manifestPath = 'data/quiz/manifest.json';
const parts = [1, 2, 3, 4].map((number) => `.tmp/stodle-quiz-part-0${number}`);

function assemble() {
  fs.mkdirSync('data/quiz/historie', { recursive: true });
  const quiz = JSON.parse(parts.map((file) => fs.readFileSync(file, 'utf8')).join(''));
  const questions = quiz.sets.flatMap((set) => set.questions);
  const byId = new Map(questions.map((question) => [question.id, question]));
  const replaceOptions = (id, options) => {
    const question = byId.get(id);
    if (!question) throw new Error(`Missing question ${id}`);
    question.options = options;
    question.answerIndex = 0;
    question.answer = options[0];
  };

  replaceOptions('stodle_kyrkje_quiz_2', [
    'Rundboga portalar av hoggen kleberstein',
    'Spissboga portalar av hoggen kleberstein',
    'Rundboga portalar av tilhoggen granitt'
  ]);
  replaceOptions('stodle_kyrkje_quiz_4', [
    'Stødle-ætta knyter staden til Erling Skakke og kong Magnus Erlingsson',
    'Stødle var bispesete for Vestlandet gjennom heile mellomalderen',
    'Stødle-ætta stod utanfor både kyrkjeleg og kongeleg makt'
  ]);
  replaceOptions('stodle_kyrkje_quiz_11', [
    'Det vart kor i den større kyrkja',
    'Det vart våpenhus i den større kyrkja',
    'Det vart ståande som eit eige kapell ved sida av tømmerdelen'
  ]);
  replaceOptions('stodle_kyrkje_quiz_13', [
    'At delar frå ulike tider er bevarte i den same bygningen',
    'At steinmurane er sette saman av fleire geologiske bergartar',
    'At kyrkja har skifta eigar utan at bygningen har endra seg'
  ]);
  replaceOptions('stodle_kyrkje_quiz_14', [
    'Overgangen mellom den eldre steindelen og den yngre tømmerdelen',
    'Overgangen mellom to like tømmerdelar frå 1690-åra',
    'Skiljet mellom to steindelar som begge vart bygde i 1879'
  ]);

  fs.writeFileSync(quizPath, `${JSON.stringify(quiz, null, 2)}\n`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const file = quizPath;
  if (!manifest.sets.some((entry) => entry.targetId === 'stodle_kyrkje' && entry.file === file)) {
    manifest.sets.push({ targetId: 'stodle_kyrkje', file });
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function validate() {
  const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const questions = quiz.sets.flatMap((set) => set.questions);
  const required = ['id','quiz_id','categoryId','placeId','targetId','question_scope','question','options','answer','answerIndex','knowledge','difficulty','question_type','emne_id','source'];
  const allowedTypes = new Set(['fact','context','analysis','concept','observation','comparison']);
  if (quiz.sets.length !== 3 || questions.length !== 15) throw new Error('Expected 3 sets and 15 questions');
  if (!manifest.sets.some((entry) => entry.targetId === 'stodle_kyrkje' && entry.file === quizPath)) throw new Error('Manifest entry missing');
  for (const question of questions) {
    for (const field of required) if (!(field in question) || question[field] === '' || question[field] == null) throw new Error(`${question.id}: missing ${field}`);
    if (question.targetId !== 'stodle_kyrkje' || question.placeId !== 'stodle_kyrkje' || question.categoryId !== 'historie') throw new Error(`${question.id}: target mismatch`);
    if (!Array.isArray(question.options) || question.options.length !== 3) throw new Error(`${question.id}: expected three options`);
    if (question.answer !== question.options[question.answerIndex]) throw new Error(`${question.id}: answer mismatch`);
    if (!allowedTypes.has(question.question_type)) throw new Error(`${question.id}: invalid question type`);
    if (!question.emne_id.startsWith('em_his_')) throw new Error(`${question.id}: invalid emne`);
    if (question.knowledge_link_status !== 'linked') throw new Error(`${question.id}: knowledge link not generated`);
  }
  const concrete = questions.filter((q) => ['fact','observation'].includes(q.question_type)).length;
  const context = questions.filter((q) => ['context','analysis'].includes(q.question_type)).length;
  const concepts = questions.filter((q) => q.question_type === 'concept').length;
  if (concrete !== 8 || context !== 4 || concepts !== 3) throw new Error(`Unexpected balance ${concrete}/${context}/${concepts}`);
  console.log('Stødle quiz contract OK: 3 sets, 15 questions, balance 8/4/3');
}

const command = process.argv[2];
if (command === 'assemble') assemble();
else if (command === 'validate') validate();
else throw new Error('Use assemble or validate');
