import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const targetBranch = 'agent/oslo-coordinate-history-medieval-v5-5-clean';
const parts = [
  'scripts/.medieval-builder.gz.b64.02',
  'scripts/.medieval-builder.gz.b64.03'
];
const encoded = parts.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('');
let source = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');

source = source.replace(
  "const branch = 'agent/history-medieval-v5-5';",
  `const branch = '${targetBranch}';`
);

const marker = `run(process.execPath, [paths.validator]);
run(process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('npm', ['run', 'test:quiz-production']);`;

const replacement = `const overlapDistinctions = {
  em_his_lov_ting_jurisdiksjon_middelalder: {
    ids: ['em_his_kongemakt_kirke_konflikt', 'em_his_jord_eiendom_patronasje_middelalder'],
    note: 'Avgrens mot kongemakt og kirkekonflikt ved å la lovtekst, tingsted, domsmyndighet eller dokumentert rettshåndheving bære spørsmålet; avgrens mot eiendomshistorie når rettigheten til jord er hovedsaken.'
  },
  em_his_jord_eiendom_patronasje_middelalder: {
    ids: ['em_his_lov_ting_jurisdiksjon_middelalder', 'em_his_handel_handverk_bynettverk_middelalder'],
    note: 'Avgrens mot rettshistorie ved å følge eierskap, landskyld, gave, disposisjon og faktisk kontroll over ressurser; avgrens mot handel når vareflyt og marked er hovedkjeden.'
  },
  em_his_handel_handverk_bynettverk_middelalder: {
    ids: ['em_his_middelalder_oslo', 'em_his_jord_eiendom_patronasje_middelalder'],
    note: 'Avgrens mot generell bydannelse ved å kreve dokumentert vare, produksjon, håndverk, havnefunksjon eller forbindelsesnett; avgrens mot eiendom når jord og rettigheter, ikke utveksling, bærer spørsmålet.'
  },
  em_his_hushold_arbeid_hverdagsliv_middelalder: {
    ids: ['em_his_handel_handverk_bynettverk_middelalder', 'em_his_kirke_kloster_middelalder'],
    note: 'Avgrens mot handel ved å la hushold, arbeid, kosthold, bolig eller kjønnet praksis bære analysen; avgrens mot kirkehistorie når institusjonen fremfor menneskenes hverdagsliv er hovedobjektet.'
  },
  em_his_pest_demografi_senmiddelalder: {
    ids: ['em_his_hushold_arbeid_hverdagsliv_middelalder', 'em_his_middelalder_oslo'],
    note: 'Avgrens mot hverdagsliv ved å kreve dokumentert epidemi, dødelighet, bosettingsendring, arbeidskraft eller demografisk ettervirkning; avgrens mot byhistorie når generell urban endring er hovedsaken.'
  },
  em_his_skrift_diplom_muntlighet_middelalder: {
    ids: ['em_his_lov_ting_jurisdiksjon_middelalder', 'em_his_kirke_kloster_middelalder'],
    note: 'Avgrens mot rettshistorie ved å undersøke tekstproduksjon, skriftpraksis, diplomform, paleografi eller forholdet mellom muntlighet og skrift; innholdets rettsvirkning alene hører til rettssporet.'
  },
  em_his_samiske_kontaktsoner_middelalder: {
    ids: ['em_his_handel_handverk_bynettverk_middelalder', 'em_his_kongemakt_kirke_konflikt'],
    note: 'Avgrens mot generell handel og statsbygging ved å la samiske aktører, kontaktsoner, ressursbruk, skattlegging eller historisk kategorisering bære spørsmålet; senere fornorskning og rettighetskamp hører til det egne samiske domenet.'
  }
};
const finalizedEmner = readJson(paths.emner);
const finalizedById = new Map(finalizedEmner.map((item) => [item.emne_id, item]));
for (const [emneId, update] of Object.entries(overlapDistinctions)) {
  const emne = finalizedById.get(emneId);
  if (!emne) throw new Error('Missing medieval emne for overlap finalization: ' + emneId);
  emne.distinguish_from_emners = update.ids;
  emne.overlap_resolution_note = update.note;
}
writeJson(paths.emner, finalizedEmner);

run(process.execPath, [paths.validator]);
run(process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
const readiness = readJson(path.join(root, 'reports/historie-v5/historie-v5-5-readiness.json'));
const medievalReadiness = readiness.domains.find((item) => item.domain_id === domainId);
if (!medievalReadiness?.freeze_ready || medievalReadiness.emne_gaps?.length) {
  throw new Error('Medieval domain did not become freeze-ready: ' + JSON.stringify(medievalReadiness));
}

const quizProductionTestPath = path.join(root, 'tests/quiz-production-pipeline.test.mjs');
let quizProductionTest = fs.readFileSync(quizProductionTestPath, 'utf8');
const originalQuizProductionTest = quizProductionTest;
quizProductionTest = quizProductionTest
  .replaceAll('context.considered_curriculum.counts.emner, 92', 'context.considered_curriculum.counts.emner, 99')
  .replaceAll('context.considered_curriculum.counts.topic_hooks, 84', 'context.considered_curriculum.counts.topic_hooks, 93')
  .replaceAll('context.considered_curriculum.counts.methods, 54', 'context.considered_curriculum.counts.methods, 58');
if (quizProductionTest === originalQuizProductionTest) {
  throw new Error('Quiz production expectations did not match the pre-medieval baseline');
}
fs.writeFileSync(quizProductionTestPath, quizProductionTest);

for (const targetId of [
  'grindheim_runestein',
  'grindheim_steinkross',
  'grindheimsveien_nord_gravfelt',
  'hoyland_gravhaug_etne'
]) {
  run(process.execPath, [
    'scripts/build-quiz-production-context.mjs',
    '--category', 'historie',
    '--target', targetId,
    '--output', 'data/quiz/production_context/historie/' + targetId + '.json'
  ]);
}

run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('npm', ['run', 'test:quiz-production']);`;

if (!source.includes(marker)) throw new Error('Could not find medieval validation marker');
source = source.replace(marker, replacement);

const target = path.join('/tmp', 'history-medieval-v5-5-clean-builder.mjs');
fs.writeFileSync(target, source);
for (const file of parts) fs.rmSync(path.join(root, file), { force: true });
await import(`file://${target}?v=${Date.now()}`);
