import fs from 'node:fs';

const quizPath = 'data/quiz/by/tullin_sets.json';
const briefPath = 'data/quiz/production_briefs/by/tullin.json';
const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
const questions = quiz.sets.flatMap((set) => set.questions || []);

const rossiQuestion = questions.find((item) => item.id === 'tullin_quiz_41');
if (!rossiQuestion) throw new Error('Missing tullin_quiz_41');

const theoryExplanation = 'Aldo Rossi skiller mellom relativt varige byartefakter og programmene eller funksjonene som kan skifte over tid. På Tullinløkka gjør dette det mulig å undersøke den vedvarende åpne byflaten og museumskantene opp mot skiftende bruk som utstilling, parkering, kunsthall og park, uten å bruke teorien som kilde til de historiske faktaene.';

rossiQuestion.knowledge = theoryExplanation;
rossiQuestion.theory_explanation = theoryExplanation;
rossiQuestion.topic_hook_id = 'ark_bygningstyper';
rossiQuestion.thinker_id = 'aldo_rossi';
rossiQuestion.work = 'The Architecture of the City';
rossiQuestion.theory_ref = {
  ...(rossiQuestion.theory_ref && typeof rossiQuestion.theory_ref === 'object' ? rossiQuestion.theory_ref : {}),
  topic_hook_id: 'ark_bygningstyper',
  thinker_id: 'aldo_rossi',
  work: 'The Architecture of the City',
  why_it_helps: theoryExplanation,
  theory_explanation: theoryExplanation
};

// The Rossi rewrite changes the sentence-level canonical claims. Any pre-existing
// Knowledge IDs were derived from the old prose and must be regenerated from the
// new claims by knowledge-canonical-data rather than reused across different claims.
delete rossiQuestion.primary_knowledge_unit_id;
delete rossiQuestion.knowledge_unit_ids;

if (!rossiQuestion.claim_basis || !rossiQuestion.source?.includes('riksantikvaren_nasjonalgalleriet')) {
  throw new Error('tullin_quiz_41 lost its source-backed claim binding');
}

const geniusLociQuestion = questions.find((item) => item.id === 'tullin_quiz_42');
if (!geniusLociQuestion) throw new Error('Missing tullin_quiz_42');
if (geniusLociQuestion.topic_hook_id !== 'ark_materialbruk') {
  throw new Error(`Unexpected tullin_quiz_42 hook: ${geniusLociQuestion.topic_hook_id}`);
}
if (geniusLociQuestion.thinker_id !== 'christian_norberg_schulz' || geniusLociQuestion.work !== 'Genius Loci') {
  throw new Error('tullin_quiz_42 lost its canonical Norberg-Schulz / Genius Loci binding');
}
if (!geniusLociQuestion.claim_basis || !geniusLociQuestion.source?.includes('statsbygg_stedsanalyse')) {
  throw new Error('tullin_quiz_42 lost its source-backed claim binding');
}

// The canonical ark_materialbruk hook is bound to materiality/sensory experience,
// not the separate history-layer emne. Preserve the theory and source claim while
// correcting only the curriculum binding.
geniusLociQuestion.emne_id = 'em_by_materialitet_og_sanseerfaring';

const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
const geniusLociClaim = (brief.claims || []).find((claim) => claim.claim_id === 'claim_tullin_quiz_42');
if (!geniusLociClaim) throw new Error('Missing claim_tullin_quiz_42 in production brief');
if (!geniusLociClaim.source_ids?.includes('statsbygg_stedsanalyse')) {
  throw new Error('claim_tullin_quiz_42 lost its Statsbygg source binding');
}
geniusLociClaim.emne_id = 'em_by_materialitet_og_sanseerfaring';

fs.writeFileSync(quizPath, `${JSON.stringify(quiz, null, 2)}\n`);
fs.writeFileSync(briefPath, `${JSON.stringify(brief, null, 2)}\n`);
console.log(JSON.stringify({
  status: 'tullin-theory-bindings-repaired',
  rossi: {
    questionId: rossiQuestion.id,
    topicHook: rossiQuestion.topic_hook_id,
    thinker: rossiQuestion.thinker_id,
    work: rossiQuestion.work,
    knowledgeIdsReset: true,
    source: rossiQuestion.source
  },
  geniusLoci: {
    questionId: geniusLociQuestion.id,
    emneId: geniusLociQuestion.emne_id,
    topicHook: geniusLociQuestion.topic_hook_id,
    thinker: geniusLociQuestion.thinker_id,
    work: geniusLociQuestion.work,
    source: geniusLociQuestion.source,
    briefClaimUpdated: true
  }
}, null, 2));
