#!/usr/bin/env node
import fs from "node:fs";

const file = "tools/finalize-radhusplassen-completion.mjs";
let s = fs.readFileSync(file, "utf8");
const replaceOnce = (from, to, label) => {
  if (!s.includes(from)) throw new Error(`Patch-anchor mangler: ${label}`);
  s = s.replace(from, to);
};

replaceOnce(
  '};\n\nconst placeFile = "data/places/by/oslo/places/radhusplassen.json";',
  `};
Object.assign(sourceRegistry, {
  byleksikon_radhusplassen: { url: "https://oslobyleksikon.no/side/R%C3%A5dhusplassen", source_type: "institutional_reference", review_status: "reviewed", review_note: "Kontrollert for Havnebanen 1907–80, Festningstunnelen 1990, Vestbanekrysset 1994, festplass, sporvogn 1994–95, fontener, Tordenskiold, 17. mai og 22. juli-markeringen." },
  byleksikon_radhuset: { url: "https://oslobyleksikon.no/index.php/R%C3%A5dhuset", source_type: "institutional_reference", review_status: "reviewed", review_note: "Kontrollert for rådhusets arkitekter, funksjon og innvielse i 1950." },
  mela_about: { url: "https://www.mela.no/festival/om-oslo-melafestival/", source_type: "primary_organization", review_status: "reviewed", review_note: "Kontrollert for første Oslo Mela i 2001, Rådhusplassen som festivalsted og fri adgang." },
  nobel_ceremony: { url: "https://www.nobelpeaceprize.org/nobel-peace-prize/about-the-nobel-peace-prize/nobel-peace-prize-celebrations/award-ceremony", source_type: "primary_institutional", review_status: "reviewed", review_note: "Kontrollert for at fredsprisseremonien holdes i Oslo rådhus 10. desember." }
});

const placeFile = "data/places/by/oslo/places/radhusplassen.json";`,
  "source registry extension"
);

replaceOnce(
  'if (!Array.isArray(quiz.sets) || quiz.sets.length !== 5 || quiz.sets.some(set => !Array.isArray(set.questions) || set.questions.length !== 7)) throw new Error("Rådhusplassen legacy quiz er ikke 5x7; stopper fail-closed.");',
  'if (!Array.isArray(quiz.sets) || quiz.sets.length !== 6 || quiz.sets.some(set => !Array.isArray(set.questions) || set.questions.length !== 7)) throw new Error("Rådhusplassen legacy quiz er ikke canonical 6x7; stopper fail-closed.");',
  "6x7 guard"
);
replaceOnce(
  'const phases = ["opening", "middle", "middle", "bridge", "final"];',
  'const phases = ["opening", "middle", "middle", "middle", "bridge", "final"];',
  "phases"
);
replaceOnce(
  'const titles = ["Rådhuset, plassen og fjorden", "Fra trafikkflate til byrom", "Brygger, trikk og forbindelser", "Arrangement og offentlig scene", "Les plassens makt og spor"];',
  'const titles = ["Rådhuset, plassen og fjorden", "Fra trafikkflate til byrom", "Midlertidighet og offentlig scene", "Historiske lag og markeringer", "Symbolsk makt og representasjon", "Begreper, metode og teori"];',
  "titles"
);
replaceOnce(
  '  const text = `${q.question || ""} ${q.knowledge || ""}`.toLowerCase();\n  const sourceId = /arrangement|festival|konsert|strøm|vann|leie/.test(text) ? "utleie" : /trikk|1995|e18|1994|bilfri|motorvei|trafikk/.test(text) ? "tobias" : /rådhus/.test(text) ? "radhuset" : "fjordbyen";\n  const type = index < 21 ? "fact" : index < 28 ? "context" : "concept";',
  `  if (index === 5) Object.assign(q, { question: "Omtrent hvor stort beskriver Oslo kommune Rådhusplassen-området som?", options: ["Nesten 67 dekar", "Omtrent 7 dekar", "Over 300 dekar"], answer: "Nesten 67 dekar", answerIndex: 0, dimension: "størrelse", topic: "Plassens omfang", knowledge: "Oslo kommune beskriver Rådhusplassen-området som nesten 67 dekar stort.", year: null });
  if (index === 11) Object.assign(q, { question: "Når ble den nye trikkelinjen over Rådhusplassen etablert?", options: ["1995", "1961", "2005"], answer: "1995", answerIndex: 0, dimension: "transport", topic: "Ny trikkelinje", knowledge: "Oslo kommune oppgir at ny trikkelinje over den bilfrie Rådhusplassen ble etablert i 1995.", year: 1995 });
  if (index === 13) Object.assign(q, { question: "Hva går fra Rådhusbryggene i sommerhalvåret ifølge Oslo kommune?", options: ["En rekke turist- og cruisebåter", "T-banetog", "Flybusser"], answer: "En rekke turist- og cruisebåter", answerIndex: 0, dimension: "mobilitet", topic: "Rådhusbryggene", knowledge: "Oslo kommune oppgir at en rekke turist- og cruisebåter går fra Rådhusbryggene i sommerhalvåret.", year: null });
  if (index === 24) Object.assign(q, { question: "Hvilket element danner plassens direkte forbindelse til sjøtransport?", options: ["Rådhusbryggene", "Festningstunnelen", "Rådhustårnene"], answer: "Rådhusbryggene", answerIndex: 0, dimension: "transport", topic: "Bryggefronten", knowledge: "Rådhusbryggene ligger ytterst på Rådhusplassen og knytter plassrommet direkte til sjøtransport og fjorden.", year: null });
  const text = `${q.question || ""} ${q.knowledge || ""}`.toLowerCase();
  let sourceId = "byleksikon_radhusplassen";
  if (/mela/.test(text)) sourceId = "mela_about";
  else if (/nobel|fredspris/.test(text)) sourceId = "nobel_ceremony";
  else if (/nesten 67 dekar|turist- og cruisebåter|1995|bilfri|motorvei|e18/.test(text)) sourceId = "fjordbyen";
  else if (/rådhus.*1950|innviet|arkitekt/.test(text)) sourceId = "byleksikon_radhuset";
  const type = index < 25 ? "fact" : index < 35 ? "context" : "concept";`,
  "quiz repair and source mapping"
);
replaceOnce('  if (index >= 28) {', '  if (index >= 35) {', "theory start");

replaceOnce('set_count: 5, questions_per_set: 7, total_questions: 35, normal_opening_questions: 21', 'set_count: 6, questions_per_set: 7, total_questions: 42, normal_opening_questions: 14', "brief scope");
replaceOnce('"Legacybanken hadde riktig volum, men manglet rich-metadata, produksjonskontekst og 21/7/7-progresjon."', '"Legacybanken hadde riktig 6×7-volum, men manglet dagens rich-metadata, produksjonskontekst og canonical 6×7-progresjon."', "brief legacy finding");
replaceOnce('"Normaliser kildereferanser til source registry.", "Lås finalfasen til metode- og teoribinding."', '"Behold alle 42 spørsmål, men reparer tre tids-/kildesensitive formuleringer.", "Normaliser kildereferanser til source registry.", "Lås bare finalsettet til metode- og teoribinding."', "brief decisions");
replaceOnce('profile: "rich", set_count: 5, questions_per_set: 7, justification: "Fem læringsjobber dekker orientering, trafikkendring, transport/fjord, arrangementsbruk og kildekritisk stedsanalyse uten fyllspørsmål."', 'profile: "rich", set_count: 6, questions_per_set: 7, justification: "Seks eksisterende læringsjobber er kildebelagt og beholdes: orientering, trafikkendring, midlertidighet, historiske lag, symbolsk representasjon og begreps-/teoriforståelse."', "profile decision");
replaceOnce('normal_opening_questions: 21, contexts: 7, concepts: 7, theory_start_phase: "final", method_start_phase: "final"', 'normal_opening_questions: 14, facts: 25, contexts: 10, concepts: 7, theory_start_phase: "final", method_start_phase: "final"', "production context counts");
replaceOnce('profile: "rich_5x7", sets: 5, questions: 35, facts: 21, contexts: 7, concepts: 7', 'profile: "rich_6x7", sets: 6, questions: 42, facts: 25, contexts: 10, concepts: 7', "production report quiz");
replaceOnce('quiz_profile: { profile: "rich_5x7", set_count: 5, question_count: 35, fact: 21, context: 7, concept: 7 }', 'quiz_profile: { profile: "rich_6x7", set_count: 6, question_count: 42, fact: 25, context: 10, concept: 7 }', "workcard quiz");

replaceOnce('assert.equal(q.sets.length,5);', 'assert.equal(q.sets.length,6);', "test set count");
replaceOnce('assert.equal(qs.filter(x=>x.question_type==="fact").length,21);', 'assert.equal(qs.filter(x=>x.question_type==="fact").length,25);', "test fact count");
replaceOnce('assert.equal(qs.filter(x=>x.question_type==="context").length,7);', 'assert.equal(qs.filter(x=>x.question_type==="context").length,10);', "test context count");
replaceOnce('assert.ok(qs.slice(0,28).every(x=>!x.method_id&&!x.thinker_id&&!x.theory_ref));', 'assert.ok(qs.slice(0,35).every(x=>!x.method_id&&!x.thinker_id&&!x.theory_ref));', "test theory absence");
replaceOnce('assert.ok(qs.slice(28).every(x=>x.method_id&&x.thinker_id&&x.theory_ref));', 'assert.ok(qs.slice(35).every(x=>x.method_id&&x.thinker_id&&x.theory_ref));', "test theory presence");
replaceOnce('assert.equal(q.production_context.normal_opening_questions,21);', 'assert.equal(q.production_context.normal_opening_questions,14);', "test opening count");

fs.writeFileSync(file, s);
console.log("Patched Rådhusplassen finalizer to canonical rich 6x7 without dropping legacy questions.");
