import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = 'agent/history-medieval-v5-5';
const emnePath = 'data/fag/historie/emner_historie_canonical_v4_5.json';
const readinessPath = 'reports/historie-v5/historie-v5-5-readiness.json';
const domainId = 'his_middelalder_kirke_kongemakt';

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

const distinctions = {
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

const emner = JSON.parse(fs.readFileSync(emnePath, 'utf8'));
const byId = new Map(emner.map((item) => [item.emne_id, item]));
for (const [emneId, update] of Object.entries(distinctions)) {
  const emne = byId.get(emneId);
  if (!emne) throw new Error(`Missing medieval emne ${emneId}`);
  emne.distinguish_from_emners = update.ids;
  emne.overlap_resolution_note = update.note;
}
fs.writeFileSync(emnePath, `${JSON.stringify(emner, null, 2)}\n`);

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
    '--output', `data/quiz/production_context/historie/${targetId}.json`
  ]);
}

run(process.execPath, ['tools/validate-historie-middelalder-kirke-kongemakt.mjs']);
run(process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
const medieval = readiness.domains.find((item) => item.domain_id === domainId);
if (!medieval?.freeze_ready || medieval.emne_gaps?.length) {
  throw new Error(`Medieval domain is not freeze-ready: ${JSON.stringify(medieval)}`);
}
run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('npm', ['run', 'test:quiz-production']);
run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'knowledge:canonical:check']);
run('npm', ['run', 'knowledge:legacy:check']);
run('git', ['diff', '--check']);

fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });
const reportDir = process.env.RUNNER_REPORT_DIR;
if (reportDir) {
  const excludePath = path.join('.git', 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const rule = `/${reportDir.replaceAll('\\', '/')}/`;
  const existing = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  if (!existing.split(/\r?\n/).includes(rule)) fs.appendFileSync(excludePath, `${existing.endsWith('\n') || !existing ? '' : '\n'}${rule}\n`);
}
run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Freeze medieval church and kingship vertical']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log('Medieval V5.5 domain is freeze-ready and published.');
