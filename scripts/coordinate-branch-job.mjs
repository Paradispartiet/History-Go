import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const preFalseFreezeRef = '9d4d06fa003f6497b0d49a7a0b78589bcb74efc0';
const economyRef = 'origin/agent/oslo-coordinate-history-v5-5-economy-curation';
const economyDomainId = 'his_okonomi_handel_materielle_systemer';
const reportDir = path.join(root, 'reports', 'historie-v5');
const commandLogPath = path.join(reportDir, 'historie-v5-5-freeze-correction-command.log');
const resultPath = path.join(reportDir, 'historie-v5-5-freeze-correction-result.json');
const validationPath = path.join(reportDir, 'historie-v5-5-freeze-correction-validation.txt');
fs.mkdirSync(reportDir, { recursive: true });

const commandLog = [];
function run(command, args, maxBuffer = 256 * 1024 * 1024) {
  const label = `$ ${command} ${args.join(' ')}`;
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer,
    env: process.env
  });
  commandLog.push(label, result.stdout || '', result.stderr || '');
  fs.writeFileSync(commandLogPath, `${commandLog.join('\n')}\n`);
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error || result.status !== 0) {
    throw new Error(`${label} feilet med kode ${result.status}`);
  }
  return result.stdout;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}
function gitShow(ref, relativePath, encoding = null) {
  const result = spawnSync('git', ['show', `${ref}:${relativePath}`], {
    cwd: root,
    encoding,
    maxBuffer: 512 * 1024 * 1024
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Kunne ikke hente ${relativePath} fra ${ref}\n${String(result.stderr || '')}`);
  }
  return result.stdout;
}
function gitShowJson(ref, relativePath) {
  return JSON.parse(gitShow(ref, relativePath, 'utf8'));
}
function restoreFile(ref, relativePath) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, gitShow(ref, relativePath, null));
  console.log(`Tilbakestilte ${relativePath} fra ${ref}`);
}
function belongsToDomain(object, domainId) {
  return object?.domain_id === domainId ||
    object?.domain_ids?.includes(domainId) ||
    object?.explanatory_scope?.includes(domainId);
}

const restoredPaths = [
  'data/fag/historie/concepts_historie_canonical_v5_5.json',
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/fagkart_historie_canonical_v4_5.json',
  'data/fag/historie/historie_v5_contract.json',
  'data/fag/historie/theory_objects_historie_canonical_v5_5.json',
  'reports/historie-v5/historie-v5-5-readiness.json',
  'reports/historie-v5/quality-review-queue.json',
  'reports/historie-v5/validation.txt'
];
for (const relativePath of restoredPaths) restoreFile(preFalseFreezeRef, relativePath);

const falseFreezeArtifacts = [
  'data/fag/historie/historie_v5_5_freeze_manifest.json',
  'reports/historie-v5/historie-v5-5-final-curation-result.json',
  'reports/historie-v5/historie-v5-5-final-curation-validation.txt',
  'reports/historie-v5/historie-v5-5-final-freeze-command.log'
];
for (const relativePath of falseFreezeArtifacts) {
  fs.rmSync(path.join(root, relativePath), { force: true });
  console.log(`Fjernet falskt fryseartefakt: ${relativePath}`);
}

const conceptsPath = 'data/fag/historie/concepts_historie_canonical_v5_5.json';
const theoriesPath = 'data/fag/historie/theory_objects_historie_canonical_v5_5.json';
const emnerPath = 'data/fag/historie/emner_historie_canonical_v4_5.json';
const concepts = readJson(conceptsPath);
const theories = readJson(theoriesPath);
const emner = readJson(emnerPath);
const sourceConcepts = gitShowJson(economyRef, conceptsPath).filter((item) => belongsToDomain(item, economyDomainId));
const sourceTheories = gitShowJson(economyRef, theoriesPath).filter((item) => belongsToDomain(item, economyDomainId));
if (sourceConcepts.length !== 36) throw new Error(`Forventet 36 økonomibegreper, fant ${sourceConcepts.length}`);
if (sourceTheories.length !== 10) throw new Error(`Forventet 10 økonomiteorier, fant ${sourceTheories.length}`);

const conceptIndex = new Map(concepts.map((item, index) => [item.concept_id, index]));
for (const sourceConcept of sourceConcepts) {
  const index = conceptIndex.get(sourceConcept.concept_id);
  if (index === undefined) throw new Error(`Mangler begrep ${sourceConcept.concept_id}`);
  concepts[index] = sourceConcept;
}
const theoryIndex = new Map(theories.map((item, index) => [item.theory_id, index]));
for (const sourceTheory of sourceTheories) {
  const index = theoryIndex.get(sourceTheory.theory_id);
  if (index === undefined) throw new Error(`Mangler teori ${sourceTheory.theory_id}`);
  theories[index] = sourceTheory;
}

const economyEmneIds = [
  'em_his_okonomi_handel_markeder_og_markedsintegrasjon',
  'em_his_okonomi_handel_handel_sjofart_og_kommersielle_nettverk',
  'em_his_okonomi_handel_penger_kreditt_bank_og_finans',
  'em_his_okonomi_handel_eiendom_kapital_og_akkumulering',
  'em_his_okonomi_handel_jordbruk_fiske_og_ressursokonomi',
  'em_his_okonomi_handel_skatt_offentlig_okonomi_og_infrastruktur',
  'em_his_okonomi_handel_forbruk_priser_og_levestandard',
  'em_his_okonomi_handel_kriser_konjunkturer_og_global_arbeidsdeling',
  'em_his_okonomi_handel_teknologi_produktivitet_og_materielle_standarder',
  'em_his_okonomi_handel_global_arbeidsdeling_ravarer_og_avhengighet'
];
const sourceEmners = gitShowJson(economyRef, emnerPath);
const sourceEmneIndex = new Map(sourceEmners.map((item) => [item.emne_id, item]));
const emneIndex = new Map(emner.map((item, index) => [item.emne_id, index]));
for (const emneId of economyEmneIds) {
  const sourceEmne = sourceEmneIndex.get(emneId);
  const index = emneIndex.get(emneId);
  if (!sourceEmne || index === undefined) throw new Error(`Mangler økonomiemne ${emneId}`);
  emner[index] = sourceEmne;
}
writeJson(conceptsPath, concepts);
writeJson(theoriesPath, theories);
writeJson(emnerPath, emner);

const quizContextPaths = [
  'data/quiz/production_context/historie/grindheim_runestein.json',
  'data/quiz/production_context/historie/grindheim_steinkross.json',
  'data/quiz/production_context/historie/grindheimsveien_nord_gravfelt.json',
  'data/quiz/production_context/historie/hoyland_gravhaug_etne.json'
];
for (const relativePath of quizContextPaths) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, gitShow(economyRef, relativePath, null));
}

run('node', ['tools/validate-historie-v5.mjs', '--write']);
run('node', ['tools/validate-historie-okonomi-handel-materielle-systemer.mjs']);
run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'knowledge:canonical:check']);
run('npm', ['run', 'knowledge:legacy:check']);
for (const targetId of [
  'grindheim_runestein',
  'grindheim_steinkross',
  'grindheimsveien_nord_gravfelt',
  'hoyland_gravhaug_etne'
]) {
  run('node', [
    'scripts/build-quiz-production-context.mjs',
    '--category', 'historie',
    '--target', targetId,
    '--output', `data/quiz/production_context/historie/${targetId}.json`
  ]);
}
run('node', [
  'scripts/build-quiz-production-context.mjs',
  '--category', 'by',
  '--target', 'deichman_bjorvika',
  '--output', 'data/quiz/production_context/by/deichman_bjorvika.json'
]);
run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-progression']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('git', ['diff', '--check']);

const readiness = readJson('reports/historie-v5/historie-v5-5-readiness.json');
const economyDomain = readiness.domains.find((item) => item.domain_id === economyDomainId);
const freezeReadyDomains = readiness.domains.filter((item) => item.freeze_ready).length;
if (!economyDomain?.freeze_ready ||
    economyDomain.issue_counts?.concepts !== 0 ||
    economyDomain.issue_counts?.theories !== 0 ||
    economyDomain.issue_counts?.emner !== 0) {
  throw new Error(`Økonomidomenet er ikke fryseklart: ${JSON.stringify(economyDomain, null, 2)}`);
}
if (freezeReadyDomains !== 10) throw new Error(`Forventet 10 fryseklare domener, fant ${freezeReadyDomains}`);
if (readiness.v6_allowed !== false || readiness.status === 'FREEZE_READY') {
  throw new Error(`V6-sperren ble ikke gjenopprettet: status=${readiness.status}, v6_allowed=${readiness.v6_allowed}`);
}
if (readiness.quality_issue_totals?.concepts !== 446 || readiness.quality_issue_totals?.theories !== 100 || readiness.quality_issue_totals?.emner !== 0) {
  throw new Error(`Uventede resttall: ${JSON.stringify(readiness.quality_issue_totals)}`);
}
const contract = readJson('data/fag/historie/historie_v5_contract.json');
if (contract.quality_freeze_complete === true || contract.v6_allowed === true) {
  throw new Error('Historiekontrakten erklærer fortsatt falsk fullfrys');
}

const result = {
  version: 'historie-v5.5-false-global-freeze-correction-1',
  generated_at: new Date().toISOString(),
  status: 'QUALITY_REVIEW_REQUIRED',
  false_freeze_pr_reverted: 3889,
  removed_false_freeze_artifacts: falseFreezeArtifacts,
  preserved_curated_economy_domain: economyDomain,
  freeze_ready_domains: freezeReadyDomains,
  quality_issue_totals: readiness.quality_issue_totals,
  v6_allowed: readiness.v6_allowed,
  reason: 'PR #3889 brukte repeterte domenemaler for ulike teoriobjekter og tilfredsstilte dermed validatoren uten individuell kvalitativ kuratering.'
};
writeJson(path.relative(root, resultPath), result);
const validation = [
  'Historie V5.5 – korrigering av falsk global kvalitetsfrys',
  'Status: QUALITY_REVIEW_REQUIRED',
  'Falsk fullfrys fra PR #3889 er tilbakeført',
  'Individuelt kuratert økonomidomene er bevart',
  `Fryseklare domener: ${freezeReadyDomains}/20`,
  `Resterende kvalitetsfeil: begreper=${readiness.quality_issue_totals.concepts}, teorier=${readiness.quality_issue_totals.theories}, emner=${readiness.quality_issue_totals.emner}`,
  `V6 tillatt: ${readiness.v6_allowed}`
].join('\n');
fs.writeFileSync(validationPath, `${validation}\n`);
console.log(validation);
