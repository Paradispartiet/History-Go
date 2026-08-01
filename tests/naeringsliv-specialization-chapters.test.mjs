import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditNaeringslivSpecializations } from '../scripts/audit-naeringsliv-specialization-chapters.mjs';

test('seks Næringsliv-fordypninger passerer permanent fullkapittelgate', () => {
  const report = auditNaeringslivSpecializations();
  assert.equal(report.totals.chapters, 6);
  assert.equal(report.totals.sections, 54);
  assert.equal(report.totals.paragraphs, 162);
  assert.equal(report.totals.claims, 162);
  assert.equal(report.totals.sources, 54);
  assert.equal(report.gates.rendererContractsComplete, true);
  assert.equal(report.gates.subjectCompleteAtTwelveChapters, true);
});

test('makrokapittelet beholder hele fagbegreper etter materialisering', () => {
  const chapter = JSON.parse(fs.readFileSync(new URL('../data/fagverk/naeringsliv/makrookonomi-konjunkturer-okonomisk-politikk.json', import.meta.url), 'utf8'));
  const terms = new Set(chapter.concepts.map((concept) => concept.term));
  for (const expected of ['nasjonalregnskap', 'bnp', 'sysselsetting', 'arbeidsledighet']) assert.ok(terms.has(expected), `mangler helt begrep: ${expected}`);
  for (const corrupted of ['nasj', 'nalre', 'nskap', 'sysselsettin', 'arbeidsledi', 'het']) assert.ok(!terms.has(corrupted), `korrumpert begrep finnes fortsatt: ${corrupted}`);
});

test('begreps-ID-er translittererer norske bokstaver uten å miste dem', () => {
  const chapter = JSON.parse(fs.readFileSync(new URL('../data/fagverk/naeringsliv/forretningsjus-skatt-compliance.json', import.meta.url), 'utf8'));
  const idsByTerm = new Map(chapter.concepts.map((concept) => [concept.term, concept.id]));
  assert.equal(idsByTerm.get('misligholdsbeføyelser'), 'misligholdsbefoyelser');
  assert.equal(idsByTerm.get('økonomisk substans'), 'okonomisk-substans');
});

test('stedscasene bruker canonicale visningsnavn fra places-indeksen', () => {
  const registry = JSON.parse(fs.readFileSync(new URL('../data/fagverk/fagverk_registry.json', import.meta.url), 'utf8'));
  const placeIndex = JSON.parse(fs.readFileSync(new URL('../data/places/places_index.json', import.meta.url), 'utf8'));
  const names = new Map(placeIndex.map((place) => [place.id, place.name]));
  const specializations = registry.subjects.naeringsliv.chapters.filter((chapter) => chapter.chapter_role === 'specialization');
  for (const chapter of specializations) {
    for (const moduleFile of chapter.moduleFiles) {
      const module = JSON.parse(fs.readFileSync(new URL(`../${moduleFile}`, import.meta.url), 'utf8'));
      for (const place of module.relatedPlaces || []) assert.equal(place.name, names.get(place.id), `${place.id}: ikke canonicalt visningsnavn`);
    }
  }
  assert.equal(names.get('bjorvika'), 'Bjørvika');
  assert.equal(names.get('gronlikaia'), 'Grønlikaia');
  assert.equal(names.get('steen_og_strom'), 'Steen & Strøm');
});
