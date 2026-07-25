import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const STANDARD_PATH = 'data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md';
const POLICY_PATH = 'data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json';
const REGISTRY_PATH = 'data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json';
const DEICHMAN_PATH = 'data/quiz/by/deichman_bjorvika_sets.json';

const standard = fs.readFileSync(STANDARD_PATH, 'utf8');
const policy = JSON.parse(fs.readFileSync(POLICY_PATH, 'utf8'));
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
const deichman = JSON.parse(fs.readFileSync(DEICHMAN_PATH, 'utf8'));
let pass = 0;

function ok(value, message) {
  if (!value) throw new Error(`FAIL | ${message}`);
  console.log(`PASS | ${message}`);
  pass += 1;
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  ok(result.status === 0, `${command} ${args.join(' ')} består`);
}

ok(standard.includes('**Versjon:** 3.2'), 'Produksjonsstandarden er versjon 3.2');
ok(standard.includes(POLICY_PATH), 'Produksjonsstandarden registrerer global åpningspolicy');
ok(standard.includes('sett 1 og sett 2'), 'Produksjonsstandarden navngir begge absolutte åpningssett');
ok(standard.includes('sju normale'), 'Produksjonsstandarden krever sju normale spørsmål per sett');
ok(standard.includes('fjorten normale'), 'Produksjonsstandarden krever fjorten normale spørsmål totalt');
ok(standard.includes('Kategoriens profil kan skjerpe'), 'Kategori-profiler kan bare skjerpe globalregelen');
ok(standard.includes('tidligst introduseres i sett 3'), 'Teori kan ikke starte før sett 3');
ok(!standard.includes('Teori er aldri låst til absolutte settnumre'), 'Utdatert fullt relativ teoriregel er fjernet');
ok(standard.includes('2 × 7-åpningen har alltid forrang'), '2 × 7 går foran prosentbalansen');

ok(policy.version === '1.1', 'Global policy er versjon 1.1');
ok(policy.status === 'canonical_global_invariant', 'Global policy er kanonisk invariant');
ok(policy.opening_block?.sets === 2, 'Global policy krever to sett');
ok(policy.opening_block?.questions_per_set === 7, 'Global policy krever sju spørsmål per sett');
ok(policy.opening_block?.total_questions === 14, 'Global policy krever fjorten spørsmål');
ok(policy.exceptions_allowed === false, 'Målspesifikke unntak er forbudt');
ok(Object.keys(policy.grandfathered_targets || {}).length === 0, 'Ingen grandfathered mål står igjen');
ok(policy.progression?.bridge_earliest_set === 3, 'Brostoff kan tidligst starte i sett 3');
ok(policy.progression?.method_earliest_set === 3, 'Metode kan tidligst starte i sett 3');
ok(policy.progression?.theory_earliest_set === 3, 'Teori kan tidligst starte i sett 3');
ok(Boolean(policy.progression?.category_tightening_rule), 'Kategoriens skjerpingsregel er dokumentert');
ok(Boolean(policy.opening_block?.surface_rule), 'Synlig normalspørsmålsoverflate er definert');
ok(policy.opening_block?.metadata_rule?.includes('Klassifikasjonsmetadata'), 'Tillatt klassifikasjonsmetadata er avgrenset');
for (const ruleId of ['mechanism_pick', 'distinction_pick', 'illustrates_place', 'what_place_shows']) {
  ok(policy.opening_block?.forbidden_surface_rule_ids?.includes(ruleId), `Global policy blokkerer ${ruleId}`);
}

const expectedAuthorityOrder = [
  STANDARD_PATH,
  POLICY_PATH,
  'data/fag/fag_manifest.json',
  'data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json',
  'data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json',
  'category_profile'
];
ok(registry.version === '3.2', 'Registry er versjon 3.2');
ok(JSON.stringify(registry.authority_order) === JSON.stringify(expectedAuthorityOrder), 'Registry plasserer åpningspolicy rett etter standarden');
ok(registry.global_invariants?.normal_opening?.policy === POLICY_PATH, 'Registry peker til global åpningspolicy');
ok(registry.global_invariants?.normal_opening?.rule?.includes('målspesifikke unntak er ikke tillatt'), 'Registry forbyr målspesifikke unntak');

const openingSets = deichman.sets.slice(0, 2);
ok(openingSets.length === 2, 'Deichman har to åpningssett');
ok(openingSets.every((set) => set.questions.length === 7), 'Deichman har sju spørsmål i begge åpningssett');
const deichmanQ5 = openingSets[0].questions.find((question) => question.quiz_id === 'by_deichman_bjorvika_set_1_q5');
ok(deichmanQ5?.question_type === 'context', 'Deichmans tidligere begrepsspørsmål er et normalt kontekstspørsmål');
ok(deichmanQ5?.question === 'Hvorfor er Deichman et møtested for mange grupper?', 'Deichman-spørsmålet har direkte normalquizform');
ok(Array.isArray(deichmanQ5?.source) && deichmanQ5.source.length > 0, 'Deichman-spørsmålet har ekstern kilde');
ok(!Object.prototype.hasOwnProperty.call(deichmanQ5, 'claim_basis'), 'Deichman-spørsmålet arver godkjent claim basis fra kildegrunnlaget');

run('node', ['scripts/audit-quiz-template-governance.mjs']);
run('node', ['scripts/audit-quiz-progression.mjs']);

console.log(`PASS: ${pass}`);
console.log('RESULTAT: PASS');
