import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('Litteraturens narrativhistorie er registrert og knyttet til canonical emner', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  const literature = registry.subjects.litteratur;
  const chapterMeta = literature.chapters.find((entry) => entry.id === 'arketyper_grunnfortellinger_narrativhistorie');
  assert.ok(chapterMeta);
  assert.equal(chapterMeta.primary_domain_id, 'tekst_form_fortelling');

  const canonical = new Set(read('data/fag/litteratur/emner_litteratur_canonical_v4_5.json').map((emne) => emne.emne_id));
  for (const id of chapterMeta.emne_ids) assert.ok(canonical.has(id), `Ukjent emne: ${id}`);

  const chapter = read(chapterMeta.file);
  assert.equal(chapter.schema, 'history_go_fagverk_chapter_v1');
  assert.equal(chapter.subject, 'litteratur');
  assert.equal(chapter.sections.length, 6);
  assert.ok(chapter.sections.every((section) => section.paragraphs.length >= 2 && section.keyPoints.length > 0));
  assert.ok(chapter.concepts.some((item) => item.id === 'arketype_litteratur'));
  assert.ok(chapter.concepts.some((item) => item.id === 'grunnfortelling'));
  assert.ok(chapter.concepts.some((item) => item.id === 'narratologi'));
  assert.ok(chapter.sources.length >= 7);
  assert.ok(chapter.sources.every((source) => /^https:\/\//.test(source.url)));
  assert.ok(chapter.commonMisconceptions.some((item) => /sju/.test(item.claim)));
});

test('Symposium-dokumentet holder den redaksjonelle broen adskilt fra spillmotoren', () => {
  const doc = fs.readFileSync(path.join(root, 'docs/CIVICATION_SYMPOSIUM_NARRATIVE_PRINCIPLES.md'), 'utf8');
  for (const required of ['Mira', 'Lea', 'Arvid', 'Propp', 'Campbell', 'Booker', 'state', 'Ingen ny runtime']) {
    assert.ok(doc.includes(required), `Mangler: ${required}`);
  }
  assert.match(doc, /lagret[e]? historie|lagrede valg|arkiv/i);
  assert.match(doc, /ikke en ny parallell motor|ingen ny parallell motor/i);
});

test('Generert Fagverk-release har den registrerte litteraturteksten', () => {
  const release = read('data/fagverk/fagverk_release.json');
  const lit = release.subjects.litteratur;
  const chapter = lit.chapters.find((entry) => entry.chapter_id === 'arketyper_grunnfortellinger_narrativhistorie');
  assert.ok(chapter);
  assert.equal(lit.chapter_count, 2);
  assert.equal(chapter.module_file_count, 0);
  assert.equal(release.registry.version, read('data/fagverk/fagverk_registry.json').version);
});
