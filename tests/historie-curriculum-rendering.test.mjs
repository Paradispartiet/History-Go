import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));

function shell() {
  return `<!doctype html><html><body>
    <a id="fagverkBadgeLink"></a>
    <div id="fagverkLoading"></div><div id="fagverkContent" hidden></div><div id="fagverkError" hidden></div>
    <h1 id="fagverkSubjectTitle"></h1><p id="fagverkSubjectDescription"></p>
    <div id="fagverkSubjectProgress"></div><nav id="fagverkDomainNav"></nav><nav id="fagverkChapterNav"></nav><aside id="fagverkPlaceContext"></aside>
    <p id="fagverkChapterKicker"></p><h2 id="fagverkChapterTitle"></h2><p id="fagverkChapterSubtitle"></p><p id="fagverkLead"></p>
    <main id="fagverkSubjectOverview"></main><main id="fagverkCanonicalDomain"></main><main id="fagverkCanonicalEmne"></main><main id="fagverkMethods"></main>
    <section class="fagverk-diagnostic"></section><section class="fagverk-objectives"></section><section class="fagverk-contents"></section>
    <section id="fagverkSections"></section><section class="fagverk-examples"></section><section class="fagverk-misconceptions"></section>
    <section class="fagverk-concepts"></section><section class="fagverk-application"></section><section class="fagverk-selfcheck"></section>
    <section class="fagverk-cases"></section><section class="fagverk-sources"></section>
  </body></html>`;
}

test('Historie-oversikten renderer studieløpet og skjuler det flate registeret', async () => {
  const dom = new JSDOM(shell(), {
    url: 'https://history-go.test/fagverk.html?subject=historie',
    runScripts: 'dangerously'
  });
  const { window } = dom;
  window.eval(read('js/fagverk-subject-core.js'));
  const model = window.HGFagverkSubjectCore.normalizeSubject({
    subjectId: 'historie',
    schemaFamily: 'standard_canonical',
    categoryLabel: 'Historie',
    categoryDescription: 'Historiefaget',
    portalEntry: { subjectStatus: 'materialized', badgePage: 'data/fag/historie/merke_historie.html' },
    statusEntry: { assessmentStatus: 'audited', editorialStatus: 'chapters_in_progress' },
    source: {
      pensum: json('data/fag/historie/historiepensum_canonical_v4_5.json'),
      emners: json('data/fag/historie/emner_historie_canonical_v4_5.json'),
      fagkart: json('data/fag/historie/fagkart_historie_canonical_v4_5.json'),
      methods: json('data/fag/historie/methods_historie_canonical_v4_5.json'),
      curriculum: json('data/fag/historie/curriculum_architecture_historie_v1.json'),
      concepts: json('data/fag/historie/concepts_historie_canonical_v5_5.json'),
      periodGuides: json('data/fag/historie/period_guides_historie_v1.json')
    }
  });
  const coverage = model.emners.map((emne) => ({ emne_id: emne.id, percent: 0 }));
  const progress = {
    points: 0,
    tier: { label: 'Nybegynner' },
    coverage,
    coverageById: new Map(coverage.map((row) => [row.emne_id, row])),
    domainProgress: model.domains.map((domain) => ({ domainId: domain.id, percent: 0 })),
    quizHistory: []
  };
  window.HGFagverkSubjectModel = {
    load: async () => model,
    readProgress: () => progress,
    domainUrl: (_subjectId, domainId) => `fagverk.html?subject=historie&domain=${domainId}`,
    emneUrl: (_subjectId, domainId, emneId) => `fagverk.html?subject=historie&domain=${domainId}&emne=${emneId}`,
    chapterUrl: () => '#chapter',
    placePageUrl: (placeId) => `fagverk-sted.html?place=${placeId}`
  };

  window.eval(read('js/fagverk.js'));
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  await new Promise((resolve) => window.setTimeout(resolve, 25));

  const overview = window.document.getElementById('fagverkSubjectOverview');
  const navigation = window.document.getElementById('fagverkDomainNav');
  assert.equal(overview.hidden, false);
  assert.match(overview.textContent, /Slik lærer du faget/);
  assert.match(overview.textContent, /Historie er studiet av forandring over tid/);
  assert.match(overview.textContent, /Historisk kunnskap bygger på spor som er bevart, valgt ut og tolket/);
  assert.match(overview.textContent, /Antikken og eldre globale sivilisasjoner/);
  assert.match(overview.textContent, /Mangler fagfelt/);
  assert.equal(overview.querySelectorAll('.fagverk-curriculum-article').length, 40);
  assert.equal(overview.querySelectorAll('.fagverk-curriculum-overview').length, 40);
  assert.equal(overview.querySelectorAll('.fagverk-curriculum-outcomes').length, 40);
  assert.equal(overview.querySelectorAll('.fagverk-curriculum-questions').length, 40);
  assert.equal(overview.querySelectorAll('.fagverk-history-timeline > article').length, 9);
  assert.equal(overview.querySelectorAll('.is-covered').length, 6);
  assert.equal(overview.querySelectorAll('.is-partial').length, 2);
  assert.equal(overview.querySelectorAll('.is-missing').length, 1);
  assert.equal(overview.querySelectorAll('.fagverk-period-guide').length, 9);
  assert.match(overview.textContent, /Alle 976 canonicale begreper er søkbare/);
  assert.equal(overview.querySelectorAll('.fagverk-history-concept').length, 36);
  const conceptSearch = overview.querySelector('#historieConceptSearch');
  conceptSearch.value = 'imperium';
  conceptSearch.dispatchEvent(new window.Event('input'));
  assert.match(overview.querySelector('#historieConceptCount').textContent, /begrep/);
  assert.ok(overview.querySelectorAll('.fagverk-history-concept').length > 0);
  assert.match(overview.querySelector('#historieConceptResults').textContent.toLocaleLowerCase('nb-NO'), /imperium/);
  assert.match(navigation.textContent, /Canonicalt fagregister \(23\)/);
  assert.equal(navigation.querySelector('.fagverk-domain-registry').open, false);
  assert.equal(window.document.getElementById('fagverkError').hidden, true);
});
