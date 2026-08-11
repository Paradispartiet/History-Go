#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = 'data/fag/psykologi/metode_statistikk_psykologi_university_v1.json';
const MATRIX = 'data/fag/psykologi/psykologi_university_readiness_v1.json';
const REQUIRED = [
  'eksperimentelt_design','observasjon','korrelasjon','longitudinelt_design','tverrsnittdesign','kvalitativ_metode',
  'utvalg_og_representativitet','operasjonalisering','reliabilitet','validitet','deskriptiv_statistikk','statistisk_inferens',
  'hypotesetesting','effektstorrelse','konfidensintervall_og_usikkerhet','regresjon','kausalitet_og_konfundering',
  'replikasjon','apen_vitenskap','forskningsetikk'
];
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

export function auditPsykologiMethodsStatistics() {
  const registry = read(REGISTRY);
  const matrix = read(MATRIX);
  assert(registry.schema === 'history_go_psykologi_methods_statistics_university_v1', 'Feil metode/statistikk-schema');
  assert(registry.subject_id === 'psykologi' && registry.status === 'complete', 'Metode/statistikkregisteret må være complete');
  assert(Array.isArray(registry.sources) && registry.sources.length >= 6, 'Metode/statistikk krever minst seks autoritative kilder');
  const sourceIds = new Set(registry.sources.map((source) => source.source_id));
  assert(sourceIds.size === registry.sources.length, 'Dupliserte source_id-er i metode/statistikk');
  assert(registry.sources.every((source) => source.publisher && source.title && /^https:\/\//.test(source.url) && source.verified_at && source.source_location), 'Ufullstendig kildemetadata i metode/statistikk');

  const topics = registry.topics || [];
  const ids = topics.map((topic) => topic.topic_id);
  assert(topics.length === 20 && new Set(ids).size === 20, 'Metode/statistikk må ha 20 unike emner');
  assert(isDeepStrictEqual(ids, REQUIRED), 'Metode/statistikk avviker fra bindende 20-emners rekkefølge');
  for (const topic of topics) {
    assert(typeof topic.label === 'string' && topic.label.trim().length >= 3, `${topic.topic_id} mangler label`);
    for (const field of ['definition','core_question','method_move','common_misinterpretation']) {
      assert(typeof topic[field] === 'string' && topic[field].trim().length >= 20, `${topic.topic_id} mangler utfyllende ${field}`);
    }
    assert(Array.isArray(topic.source_ids) && topic.source_ids.length >= 1, `${topic.topic_id} mangler kilder`);
    assert(topic.source_ids.every((id) => sourceIds.has(id)), `${topic.topic_id} peker til ukjent kilde`);
  }
  for (const source of registry.sources) {
    assert(Array.isArray(source.supports) && source.supports.length > 0, `${source.source_id} mangler supports`);
    assert(source.supports.every((id) => REQUIRED.includes(id)), `${source.source_id} støtter ukjent metodeemne`);
  }

  assert(isDeepStrictEqual(matrix.required_methods_statistics_topics, REQUIRED), 'University-readiness og metode/statistikk er ute av sync');
  const row = matrix.university_core_matrix.find((entry) => entry.area_id === 'research_methods_statistics');
  assert(row?.current_status === 'complete', 'University-readiness må markere metode/statistikk complete når registeret er materialisert');
  assert(row?.registry_path === REGISTRY, 'University-readiness mangler eksplisitt registry_path for metode/statistikk');

  return {
    topicCount: topics.length,
    sourceCount: registry.sources.length,
    allTopicsSourced: true,
    matrixStatus: row.current_status,
    registryPath: REGISTRY
  };
}

function main() {
  try {
    const result = auditPsykologiMethodsStatistics();
    console.log(`Psykologi metode/statistikk OK: ${result.topicCount}/20 emner, ${result.sourceCount} autoritative kilder, matrixStatus=${result.matrixStatus}.`);
  } catch (error) {
    console.error(`Psykologi metode/statistikk FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
