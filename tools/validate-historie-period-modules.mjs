#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const list = (value) => Array.isArray(value) ? value : [];
const readJson = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function validateHistoryPeriodModules({ root = DEFAULT_ROOT } = {}) {
  const document = readJson(root, 'data/fag/historie/period_modules_historie_v1.json');
  const architecture = readJson(root, 'data/fag/historie/curriculum_architecture_historie_v1.json');
  const manifest = readJson(root, 'data/fag/fag_manifest.json');
  assert(document.schema === 'history_go_history_period_modules_v1', 'Feil schema for periodemodulene');
  assert(document.status === 'evidence_ready', 'Periodemodulene er ikke evidensklare');
  assert(document.editorial_policy?.fixed_unit_quota_forbidden === true, 'Periodemodulene forbyr ikke faste enhetskvoter');
  assert(document.editorial_policy?.source_and_case_trace_required === true, 'Kilde- og casespor er ikke påkrevd');
  assert(manifest.historie?.periodModules === 'historie/period_modules_historie_v1.json', 'Fagmanifestet laster ikke periodemodulene');

  const sources = list(document.sources);
  const cases = list(document.cases);
  const modules = list(document.modules);
  assert(modules.length === 3, 'De tre tidligere kronologiske gapene må ha egne moduler');
  assert(sources.length >= 18, 'Periodemodulene trenger minst atten kontrollerbare kilder');
  assert(cases.length === 9, 'Periodemodulene trenger tre fysiske cases hver');
  const sourceById = new Map(sources.map((source) => [source.source_id, source]));
  const caseById = new Map(cases.map((item) => [item.case_id, item]));
  assert(sourceById.size === sources.length, 'Dupliserte kilde-id-er i periodemodulene');
  assert(caseById.size === cases.length, 'Dupliserte case-id-er i periodemodulene');
  for (const source of sources) {
    assert(/^https:\/\//.test(source.url), `${source.source_id}: mangler https-kilde`);
    assert(source.title && source.publisher && source.source_type && source.source_location, `${source.source_id}: ufullstendig kildebeskrivelse`);
    assert(list(source.limitations).length >= 2, `${source.source_id}: trenger to kildebegrensninger`);
  }
  for (const item of cases) {
    assert(fs.existsSync(path.join(root, item.place_file)), `${item.case_id}: place-filen finnes ikke`);
    const place = readJson(root, item.place_file);
    assert(place.id === item.place_id, `${item.case_id}: place_id stemmer ikke med canonical place-fil`);
    assert(item.use?.length >= 100, `${item.case_id}: faglig bruk er for kort`);
    assert(list(item.source_ids).length >= 2, `${item.case_id}: trenger minst to kilder`);
    for (const sourceId of item.source_ids) assert(sourceById.has(sourceId), `${item.case_id}: ukjent kilde ${sourceId}`);
  }

  const expectedPeriods = new Set(['antikken_eldre_sivilisasjoner', 'tidlig_moderne_1500_1814', 'samtid_etter_1991']);
  assert(new Set(modules.map((module) => module.period_id)).size === modules.length, 'Dupliserte periodemoduler');
  assert(modules.every((module) => expectedPeriods.has(module.period_id)), 'Periodemodul utenfor de tre tidligere gapene');
  const unitCounts = [];
  const usedSources = new Set();
  let unitCount = 0;
  for (const module of modules) {
    assert(module.status === 'evidence_ready', `${module.period_id}: er ikke evidensklar`);
    assert(module.thesis?.length >= 120, `${module.period_id}: mangler hovedpåstand`);
    assert(module.historiographical_problem?.length >= 120, `${module.period_id}: mangler historiografisk kildeproblem`);
    const moduleCases = cases.filter((item) => item.period_id === module.period_id);
    assert(moduleCases.length === 3, `${module.period_id}: må ha nøyaktig tre kuraterte fysiske cases`);
    const units = list(module.units);
    assert(units.length >= 6, `${module.period_id}: trenger minst seks faglig begrunnede enheter`);
    assert(new Set(units.map((unit) => unit.unit_id)).size === units.length, `${module.period_id}: dupliserte enhets-id-er`);
    unitCounts.push(units.length);
    unitCount += units.length;
    for (const unit of units) {
      assert(unit.summary?.length >= 130, `${unit.unit_id}: sammendrag er for kort`);
      assert(list(unit.claims).length >= 2 && unit.claims.every((claim) => claim.length >= 50), `${unit.unit_id}: trenger to substansielle påstander`);
      assert(list(unit.source_ids).length >= 2, `${unit.unit_id}: trenger minst to kilder`);
      assert(list(unit.case_ids).length >= 1, `${unit.unit_id}: trenger minst ett fysisk case`);
      for (const sourceId of unit.source_ids) {
        assert(sourceById.has(sourceId), `${unit.unit_id}: ukjent kilde ${sourceId}`);
        usedSources.add(sourceId);
      }
      for (const caseId of unit.case_ids) {
        const item = caseById.get(caseId);
        assert(item, `${unit.unit_id}: ukjent case ${caseId}`);
        assert(item.period_id === module.period_id, `${unit.unit_id}: bruker case fra feil periode`);
      }
      assert(unit.knowledge_check?.question?.endsWith('?'), `${unit.unit_id}: kunnskapssjekken mangler spørsmål`);
      assert(unit.knowledge_check?.answer?.length >= 80, `${unit.unit_id}: kunnskapssjekken mangler forklarende svar`);
      assert(unit.knowledge_check?.distractor_rule?.length >= 100, `${unit.unit_id}: distraktorregelen er ikke streng nok`);
    }
  }
  assert(new Set(unitCounts).size === unitCounts.length, 'Modulene har fått en ny skjult fast enhetskvote');
  assert(usedSources.size === sources.length, 'Minst én registrert kilde brukes ikke av en læringsenhet');
  assert(unitCount === 21, 'Periodemodulinventaret er endret uten eksplisitt revisjon');

  const periods = new Map(list(architecture.chronological_spine).map((period) => [period.id, period]));
  for (const module of modules) {
    const period = periods.get(module.period_id);
    assert(period?.coverage_status === 'covered', `${module.period_id}: er ikke markert dekket i arkitekturen`);
    assert(period.period_module_id === module.module_id, `${module.period_id}: arkitekturen peker ikke til riktig modul`);
    assert(!period.gap_action, `${module.period_id}: gammelt gap_action står igjen`);
  }
  assert(list(architecture.known_curriculum_gaps).length === 0, 'Lukkede perioder står fortsatt som kjente pensumgap');
  assert(document.summary.module_count === modules.length, 'Feil modultall i sammendraget');
  assert(document.summary.unit_count === unitCount, 'Feil enhetstall i sammendraget');
  assert(document.summary.source_count === sources.length, 'Feil kildetall i sammendraget');
  assert(document.summary.case_count === cases.length, 'Feil casetall i sammendraget');
  return { modules: modules.length, units: unitCount, sources: sources.length, cases: cases.length, unitCounts };
}

function main() {
  try {
    const result = validateHistoryPeriodModules();
    console.log(`Historie-periodemoduler OK: ${result.modules} moduler, ${result.units} enheter, ${result.sources} kilder og ${result.cases} stedscaser.`);
  } catch (error) {
    console.error(`Historie-periodemoduler FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
