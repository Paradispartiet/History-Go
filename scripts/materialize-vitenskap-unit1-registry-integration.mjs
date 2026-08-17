#!/usr/bin/env node
import fs from 'node:fs';

const PATHS = Object.freeze({
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  chapter: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json'
});

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const writeJson = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const registry = readJson(PATHS.registry);
const status = readJson(PATHS.status);
const readiness = readJson(PATHS.readiness);
const chapter = readJson(PATHS.chapter);

const registryScience = registry.subjects?.vitenskap;
const statusScience = (status.subjects || []).find((row) => row.id === 'vitenskap');

assert(registryScience, 'Mangler vitenskap i fagverk_registry');
assert(Array.isArray(registryScience.chapters), 'Vitenskap registry mangler chapters-array');
assert(registryScience.chapters.length === 0, `Forventet 0 registrerte Vitenskap-kapitler, fant ${registryScience.chapters.length}`);
assert(statusScience?.editorialStatus === 'structure_ready', `Forventet structure_ready, fant ${statusScience?.editorialStatus}`);
assert(readiness.complete_ready === false, 'Vitenskap readiness må fortsatt blokkere complete');
assert(readiness.current_inventory?.vitenskap?.registered_chapter_count === 0, 'Forventet 0 registrerte kapitler i readiness');
assert(readiness.first_production_unit?.status === 'ready_for_chapter_brief', 'Første produksjonsenhet har uventet pre-integrasjonsstatus');
assert(chapter.chapter_id === readiness.first_production_unit.chapter_id, 'Kapittel-ID matcher ikke readiness');
assert(chapter.editorialStatus === 'chapter_ready', 'Unit 1 er ikke chapter_ready');

registry.version = '3.04.0';
registry.updatedAt = '2026-08-17';
registryScience.canonicalModel.note = 'Vitenskapsfagets seks fagområder eier toppstrukturen. Teknologi er en nested technology_scientific_v2_4-spesialisering under samme fag og badge, ikke et eget toppfag. Første fulltekstkapittel er nå canonicalt registrert med paragraph-level claims og inspectable kilder; videre kapittelproduksjon kan fortsette, men fire universitetsbreddegap må fortsatt reconciles før complete.';
registryScience.chapters = [
  {
    id: chapter.chapter_id,
    title: chapter.title,
    subtitle: chapter.subtitle,
    file: PATHS.chapter,
    primary_domain_id: chapter.primary_domain_id,
    chapter_role: 'core',
    emne_ids: chapter.emne_ids,
    claimsFile: chapter.claimsFile,
    briefFile: chapter.briefFile
  }
];

status.version = '1.97.0';
status.updatedAt = '2026-08-17';
statusScience.editorialStatus = 'chapters_in_progress';
statusScience.nextGate = 'university_breadth_gap_reconciliation_and_remaining_chapter_production';
statusScience.note = 'Vitenskap har startet canonical kapittelproduksjon. Unit 1 «Fra observasjon til etterprøvbar kunnskap» er fulltekstmaterialisert og registrert med 8 canonicale emner, 5 metoder, 3 moduler, 9 seksjoner, 27 claimsporede fagavsnitt, 18 verifiserte claims og 10 inspiserbare eksterne kilder. Faget er ikke complete: readiness-kontrakten holder matematikk/formelle fag, fysikk/astronomi, kjemi/materialvitenskap og medisin/biomedisin/folkehelse åpne som blocking gaps, og øvrige canonicale Vitenskap-emner mangler fortsatt full redaksjonell kapittelbehandling. Teknologi forblir canonical nested spesialisering under Vitenskap, ikke eget toppfag.';

readiness.version = '1.1.0';
readiness.status = 'chapter_production_in_progress_gaps_open';
readiness.current_inventory.vitenskap.registered_chapter_count = 1;
readiness.first_production_unit.status = 'materialized_and_registered';
readiness.first_production_unit.chapter_file = PATHS.chapter;
readiness.first_production_unit.brief_file = chapter.briefFile;
readiness.first_production_unit.claims_file = chapter.claimsFile;
readiness.first_production_unit.materialized_evidence = {
  method_count: chapter.method_ids.length,
  module_count: chapter.moduleFiles.length,
  section_count: 9,
  paragraph_count: 27,
  source_count: 10,
  claim_count: 18
};
readiness.first_production_unit.reason = 'Produksjonsenheten bruker bare allerede canonicale emner i et sterkt eksisterende område og er nå fulltekstmaterialisert, claimsporet, kildebelagt, permanent auditert og registrert i Fagverk-registryen. Den dokumenterer reell kapittelproduksjon, men kan ikke brukes som bevis for at hele faget er complete så lenge de fire breddehullene og resterende redaksjonell behandling står åpne.';
readiness.next_gate = 'reconcile_blocking_coverage_gaps_and_continue_chapter_production';

writeJson(PATHS.registry, registry);
writeJson(PATHS.status, status);
writeJson(PATHS.readiness, readiness);

console.log(JSON.stringify({
  status: 'materialized',
  registry_version: registry.version,
  subject_status_version: status.version,
  readiness_version: readiness.version,
  registered_chapter_count: readiness.current_inventory.vitenskap.registered_chapter_count,
  editorial_status: statusScience.editorialStatus,
  blocking_gaps: readiness.blocking_gaps
}, null, 2));
