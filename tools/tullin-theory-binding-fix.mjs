import fs from 'node:fs';

const path = 'data/quiz/by/tullin_sets.json';
const quiz = JSON.parse(fs.readFileSync(path, 'utf8'));
const questions = quiz.sets.flatMap((set) => set.questions || []);
const question = questions.find((item) => item.id === 'tullin_quiz_41');
if (!question) throw new Error('Missing tullin_quiz_41');

const theoryExplanation = 'Aldo Rossi skiller mellom relativt varige byartefakter og programmene eller funksjonene som kan skifte over tid. På Tullinløkka gjør dette det mulig å undersøke den vedvarende åpne byflaten og museumskantene opp mot skiftende bruk som utstilling, parkering, kunsthall og park, uten å bruke teorien som kilde til de historiske faktaene.';

question.knowledge = theoryExplanation;
question.theory_explanation = theoryExplanation;
question.topic_hook_id = 'ark_bygningstyper';
question.thinker_id = 'aldo_rossi';
question.work = 'The Architecture of the City';
question.theory_ref = {
  ...(question.theory_ref && typeof question.theory_ref === 'object' ? question.theory_ref : {}),
  topic_hook_id: 'ark_bygningstyper',
  thinker_id: 'aldo_rossi',
  work: 'The Architecture of the City',
  why_it_helps: theoryExplanation,
  theory_explanation: theoryExplanation
};

if (!question.claim_basis || !question.source?.includes('riksantikvaren_nasjonalgalleriet')) {
  throw new Error('tullin_quiz_41 lost its source-backed claim binding');
}

fs.writeFileSync(path, `${JSON.stringify(quiz, null, 2)}\n`);
console.log(JSON.stringify({
  status: 'tullin-rossi-binding-repaired',
  questionId: question.id,
  topicHook: question.topic_hook_id,
  thinker: question.thinker_id,
  work: question.work,
  source: question.source
}, null, 2));
