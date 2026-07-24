import fs from 'node:fs';

const QUIZ_PATH = 'data/quiz/by/deichman_bjorvika_sets.json';
const quiz = JSON.parse(fs.readFileSync(QUIZ_PATH, 'utf8'));
const question = quiz.sets?.[0]?.questions?.find((item) => item.quiz_id === 'by_deichman_bjorvika_set_1_q5');
if (!question) throw new Error('Fant ikke Deichman set 1 q5');
question.question = 'Hvorfor er Deichman et møtested for mange grupper?';
question.question_type = 'context';
delete question.claim_basis;
delete question.source_origin;
fs.writeFileSync(QUIZ_PATH, `${JSON.stringify(quiz, null, 2)}\n`);
console.log('Normaliserte Deichman-spørsmålet uten å overstyre godkjent claim basis.');
console.log('Klar for deterministisk Knowledge-regenerering og kontraktdiagnostikk.');
