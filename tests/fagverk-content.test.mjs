import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function readChapter(path) {
  const chapter = readJson(path);
  const merged = { ...chapter };
  for (const file of chapter.moduleFiles || []) {
    const module = readJson(file);
    for (const [key, value] of Object.entries(module)) {
      if (Array.isArray(value)) merged[key] = [...(Array.isArray(merged[key]) ? merged[key] : []), ...value];
      else if (value && typeof value === 'object') merged[key] = { ...(merged[key] || {}), ...value };
      else merged[key] = value;
    }
  }
  return merged;
}

const registry = readJson('data/fagverk/fagverk_registry.json');
const forvaltning = readChapter('data/fagverk/politikk/forvaltning.json');
const parlamentarisme = readChapter('data/fagverk/politikk/parlamentarisme.json');

function assertChapter(chapter) {
  assert.equal(chapter.schema, 'history_go_fagverk_chapter_v1');
  assert.equal(chapter.subject, 'politikk');
  assert.ok(String(chapter.lead).length > 200);
  assert.ok(Array.isArray(chapter.moduleFiles) && chapter.moduleFiles.length >= 3);
  assert.ok(Array.isArray(chapter.diagnosticQuestions) && chapter.diagnosticQuestions.length >= 3);
  assert.ok(Array.isArray(chapter.learningObjectives) && chapter.learningObjectives.length >= 6);
  assert.ok(Array.isArray(chapter.sections) && chapter.sections.length >= 8);
  assert.ok(chapter.sections.every((section) => Array.isArray(section.paragraphs) && section.paragraphs.length >= 3));
  assert.ok(chapter.sections.every((section) => !/case/i.test(String(section.id))));
  assert.ok(chapter.sections.every((section) => !/\bsom case\b/i.test(`${section.title} ${section.paragraphs.join(' ')}`)));
  assert.ok(Array.isArray(chapter.workedExamples) && chapter.workedExamples.length >= 2);
  assert.ok(Array.isArray(chapter.commonMisconceptions) && chapter.commonMisconceptions.length >= 4);
  assert.ok(Array.isArray(chapter.applicationTasks) && chapter.applicationTasks.length >= 3);
  assert.ok(Array.isArray(chapter.concepts) && chapter.concepts.length >= 15);
  assert.ok(Array.isArray(chapter.selfCheck) && chapter.selfCheck.length >= 6);
  assert.ok(Array.isArray(chapter.relatedPlaces) && chapter.relatedPlaces.length >= 4);
  assert.ok(Array.isArray(chapter.sources) && chapter.sources.length >= 5);
  assert.ok(chapter.sources.every((source) => /^https:\/\//.test(source.url)));
}

test('politikkfagverket registrerer forvaltning og parlamentarisme', () => {
  const chapters = registry.subjects.politikk.chapters.map((chapter) => chapter.id);
  assert.deepEqual(chapters, ['forvaltning', 'parlamentarisme']);
});

test('alle canonical steder har en generisk egen fagverkside', () => {
  assert.equal(registry.placePage.genericForAllCanonicalPlaces, true);
  assert.equal(registry.placePage.route, 'fagverk-sted.html?place={placeId}');
});

test('Regjeringskvartalet er en egen stedsside, ikke et casekapittel', () => {
  const link = registry.placeLinks.regjeringskvartalet;
  assert.deepEqual(link.chapters, ['forvaltning', 'parlamentarisme']);
  assert.ok(link.lenses.length >= 5);
  assert.ok(link.guidingQuestions.length >= 4);
  assert.ok(link.concepts.includes('offentlig forvaltning'));
  assert.ok(link.concepts.includes('parlamentarisme'));
  assert.ok(!forvaltning.sections.some((section) => /regjeringskvartalet/i.test(section.id)));
  assert.ok(!parlamentarisme.sections.some((section) => /regjeringskvartalet/i.test(section.id)));
});

test('forvaltningskapittelet er et fullverdig læreverkskapittel', () => {
  assertChapter(forvaltning);
  assert.ok(forvaltning.sections.some((section) => section.id === 'analysemodell'));
  assert.ok(forvaltning.concepts.some((concept) => concept.id === 'instruksjonsmyndighet'));
});

test('parlamentarismekapittelet er et fullverdig læreverkskapittel', () => {
  assertChapter(parlamentarisme);
  assert.ok(parlamentarisme.sections.some((section) => section.id === 'mistillit-kabinettssporsmal'));
  assert.ok(parlamentarisme.concepts.some((concept) => concept.id === 'negativ-parlamentarisme'));
});
