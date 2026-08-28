#!/usr/bin/env node
// One-time idempotent materializer retained as the reproducible record of the Kunst legacy gatekunst migration.
// Final invariant: gatekunst is canonical at emne level while the authored six-concept chapter contract stays byte-stable.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EMNERS_FILE = 'data/fag/kunst/emner_kunst_canonical_v4_5.json';
const CHAPTER_MODULE = 'data/fagverk/kunst/publikum-og-offentlighet/01-grunnlag.json';
const TARGET_EMNE = 'em_kunst_offentlig_kunst_monumenter';

const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const unique = (values) => [...new Set(values)];
const appendUnique = (current, additions) => unique([...(Array.isArray(current) ? current : []), ...additions]);

const emners = readJson(EMNERS_FILE);
if (!Array.isArray(emners) || emners.length !== 21) throw new Error(`Kunst skal ha 21 canonicale emner før gatekunst-migrering, fant ${Array.isArray(emners) ? emners.length : 'ukjent'}.`);
const emne = emners.find((item) => item.emne_id === TARGET_EMNE);
if (!emne) throw new Error(`Mangler canonicalt eieremne ${TARGET_EMNE}.`);
if (emne.domain !== 'publikum_offentlighet') throw new Error(`${TARGET_EMNE} har flyttet fagområde; gatekunst-migrering må revurderes.`);

const baseDefinition = 'Kunst i offentlig rom fungerer som minnepolitikk, identitetsmarkør og konfliktflate. Emnet analyserer monumenter, temporære installasjoner og hvordan offentlig kunst forhandler mellom estetikk, makt og kollektiv hukommelse.';
if (emne.definition !== baseDefinition && !String(emne.definition || '').includes('gatekunst')) {
  throw new Error(`${TARGET_EMNE} har uventet definisjon; nekter å overskrive nyere redaksjonelt arbeid.`);
}
emne.definition = 'Kunst i offentlig rom fungerer som minnepolitikk, identitetsmarkør og konfliktflate. Emnet analyserer monumenter, temporære installasjoner, gatekunst og veggmalerier, og hvordan offentlig kunst forhandler mellom estetikk, makt og kollektiv hukommelse.';
emne.keywords = appendUnique(emne.keywords, ['gatekunst', 'veggmaleri', 'graffiti']);
emne.key_concepts = appendUnique(emne.key_concepts, ['gatekunst', 'veggmaleri', 'graffiti']);
emne.core_concepts = appendUnique(emne.core_concepts, ['gatekunst og veggmaleri']);
emne.sub_concepts = appendUnique(emne.sub_concepts, ['gatekunst', 'veggmaleri', 'graffiti', 'sjablong', 'midlertidig intervensjon']);

const module = readJson(CHAPTER_MODULE);
if (!Array.isArray(module.concepts)) throw new Error(`${CHAPTER_MODULE} mangler concepts-array.`);
const migrationConcept = module.concepts.find((concept) => concept?.id === 'gatekunst');
if (migrationConcept) {
  const expectedDefinition = 'Visuelle kunstuttrykk i gater og andre offentlige rom, blant annet graffiti, sjablonger og veggmalerier. Analysen må skille form og plassering fra dokumentert opphav, tillatelse, varighet og bruk.';
  if (migrationConcept.term !== 'Gatekunst' || migrationConcept.definition !== expectedDefinition) {
    throw new Error('Fant et redaksjonelt Gatekunst-kapittelbegrep som ikke stammer fra denne migreringen; nekter å fjerne det.');
  }
  module.concepts = module.concepts.filter((concept) => concept?.id !== 'gatekunst');
}
if (module.concepts.length !== 6) {
  throw new Error(`Publikum og offentlighet skal beholde seks authored concepts; fant ${module.concepts.length}.`);
}

if (emners.length !== 21) throw new Error('Gatekunst skal materialiseres i eksisterende emne, ikke opprette et nytt canonicalt emne.');
if (emners.some((item) => item.emne_id !== TARGET_EMNE && /gatekunst/i.test(item.emne_id || ''))) {
  throw new Error('Fant separat gatekunst-emne; migreringen skal ikke skape en parallell emnestruktur.');
}

writeJson(EMNERS_FILE, emners);
writeJson(CHAPTER_MODULE, module);
console.log(`Kunst gatekunst-gap materialisert i ${TARGET_EMNE}; seksbegrepskontrakten i ${CHAPTER_MODULE} er bevart.`);
