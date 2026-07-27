import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const registry = readJson('data/fagverk/fagverk_registry.json');
const forvaltning = readJson('data/fagverk/politikk/forvaltning.json');
const parlamentarisme = readJson('data/fagverk/politikk/parlamentarisme.json');

function assertChapter(chapter) {
  assert.equal(chapter.schema, 'history_go_fagverk_chapter_v1');
  assert.equal(chapter.subject, 'politikk');
  assert.ok(String(chapter.lead).length > 200);
  assert.ok(Array.isArray(chapter.learningObjectives) && chapter.learningObjectives.length >= 5);
  assert.ok(Array.isArray(chapter.sections) && chapter.sections.length >= 8);
  assert.ok(chapter.sections.every((section) => Array.isArray(section.paragraphs) && section.paragraphs.length >= 3));
  assert.ok(Array.isArray(chapter.concepts) && chapter.concepts.length >= 12);
  assert.ok(Array.isArray(chapter.selfCheck) && chapter.selfCheck.length >= 5);
  assert.ok(Array.isArray(chapter.relatedPlaces) && chapter.relatedPlaces.some((place) => place.id === 'regjeringskvartalet'));
  assert.ok(Array.isArray(chapter.sources) && chapter.sources.length >= 5);
  assert.ok(chapter.sources.every((source) => /^https:\/\//.test(source.url)));
}

test('politikkfagverket registrerer forvaltning og parlamentarisme', () => {
  const chapters = registry.subjects.politikk.chapters.map((chapter) => chapter.id);
  assert.deepEqual(chapters, ['forvaltning', 'parlamentarisme']);
});

test('Regjeringskvartalet er koblet til begge kapitler og sentrale begreper', () => {
  const link = registry.placeLinks.regjeringskvartalet;
  assert.deepEqual(link.chapters, ['forvaltning', 'parlamentarisme']);
  assert.ok(link.concepts.includes('offentlig forvaltning'));
  assert.ok(link.concepts.includes('parlamentarisme'));
  assert.ok(link.emneIds.includes('em_pol_byrakrati_forvaltning'));
  assert.ok(link.emneIds.includes('em_pol_parlamentarisme_maktbalanse'));
});

test('forvaltningskapittelet er et fullverdig læreverkskapittel', () => {
  assertChapter(forvaltning);
  assert.ok(forvaltning.sections.some((section) => section.id === 'regjeringskvartalet-case'));
});

test('parlamentarismekapittelet er et fullverdig læreverkskapittel', () => {
  assertChapter(parlamentarisme);
  assert.ok(parlamentarisme.sections.some((section) => section.id === 'mistillit'));
  assert.ok(parlamentarisme.sections.some((section) => section.id === 'kabinettssporsmal'));
});
