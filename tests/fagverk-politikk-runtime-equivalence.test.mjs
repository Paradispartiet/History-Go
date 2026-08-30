import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { auditPolitikkRuntimeEquivalence } from '../scripts/audit-fagverk-politikk-runtime-equivalence.mjs';

test('Politikk rich runtime er fullt eid av Fagverket før legacy-ruten pensjoneres', () => {
  const audit = auditPolitikkRuntimeEquivalence();
  assert.equal(audit.status, 'passed');
  assert.equal(audit.archive.gitBlob, '9529684894ff913bc350f64b2a553b0288c7abff');
  assert.equal(audit.target, 'fagverk.html?subject=politikk#fagverkIaProgresjon');
  assert.deepEqual(audit.canonicalCounts, { underbadges: 11, domains: 13, concepts: 962 });
  assert.deepEqual(Object.keys(audit.owners).sort(), ['badgeProgress', 'concepts', 'domainsAndChapters', 'emneProgress', 'places', 'quizHistory', 'underbadges']);
});

test('Politikk Progresjon og Utforsk rendrer de migrerte runtime-funksjonene', async () => {
  const dom = new JSDOM(fs.readFileSync('fagverk.html', 'utf8'), {
    url: 'https://history-go.test/fagverk.html?subject=politikk#fagverkIaProgresjon',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const { window } = dom;
  const domain = { id: 'styring', label: 'Styring', definition: 'Hvordan styring virker.', emneIds: ['em_pol_styring'], methodIds: [] };
  const emne = { id: 'em_pol_styring', domainId: domain.id, title: 'Styring og institusjoner', definition: 'Institusjonell styring.', whyItMatters: '', concepts: [] };
  const model = {
    subject: { id: 'politikk', title: 'Politikk & samfunn', routes: { subject: 'fagverk.html?subject=politikk', badge: 'fagverk.html?subject=politikk#fagverkIaProgresjon' } },
    summary: { domainCount: 1, emneCount: 1 },
    domains: [domain],
    domainsById: new Map([[domain.id, domain]]),
    emners: [emne],
    emnersById: new Map([[emne.id, emne]]),
    chapters: [],
    methods: [],
    places: [
      { id: 'tinghuset', title: 'Tinghuset', intro: 'Rett og styring.', route: 'fagverk-sted.html?place=tinghuset', emneIds: [emne.id], source: {} },
      { id: 'stortinget', title: 'Stortinget', intro: 'Representasjon.', route: 'fagverk-sted.html?place=stortinget', emneIds: [emne.id], source: {} }
    ],
    source: { runtimeManifest: { underbadgeLabels: { storting_og_regjering: 'Storting og regjering' }, underbadgeDomains: { storting_og_regjering: [domain.id] } } }
  };
  const coverage = [{ emne_id: emne.id, percent: 100 }];
  const progress = {
    points: 12,
    tier: { label: 'Aktivist', next: { label: 'Tillitsvalgt', threshold: 15 } },
    coverage,
    coverageById: new Map([[emne.id, coverage[0]]]),
    domainProgress: [{ domainId: domain.id, percent: 100 }],
    quizHistory: [{ id: 'quiz-1', name: 'Institusjonsquiz', date: '2026-08-29T12:00:00Z', correctCount: 4, total: 5 }],
    visited: new Set(['tinghuset']),
    visitedPlaces: 1
  };
  window.HGFagverkSubjectModel = {
    load: async () => model,
    readProgress: () => progress,
    domainUrl: (_subjectId, domainId) => `fagverk.html?subject=politikk&domain=${domainId}`,
    emneUrl: (_subjectId, domainId, emneId) => `fagverk.html?subject=politikk&domain=${domainId}&emne=${emneId}`,
    chapterUrl: () => '',
    placePageUrl: (placeId) => `fagverk-sted.html?place=${placeId}`
  };
  window.fetch = async () => ({
    ok: true,
    json: async () => ({ id: 'politikk', name: 'Politikk & samfunn', description: 'Politikkmerket.', icon: '🏛️', sub: ['storting_og_regjering'], tiers: [{ label: 'Aktivist', threshold: 10 }] })
  });
  window.document.getElementById('fagverkContent').hidden = false;
  window.eval(fs.readFileSync('js/fagverk-ia-v3.js', 'utf8'));
  window.eval(fs.readFileSync('js/fagverk-ia-v3-badge-progress.js', 'utf8'));
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  await new Promise((resolve) => window.setTimeout(resolve, 40));

  assert.equal(window.document.getElementById('fagverkIaProgresjon').hidden, false);
  assert.match(window.document.querySelector('.fagverk-ia-quiz-history').textContent, /Institusjonsquiz/);
  assert.match(window.document.querySelector('.fagverk-ia-quiz-history').textContent, /4\/5 riktige/);
  assert.ok(window.document.querySelector('.fagverk-ia-progress-actions a[href="profile.html#merker"]'));
  assert.match(window.document.getElementById('underbadge-storting_og_regjering').textContent, /Storting og regjering/);
  assert.ok(window.document.querySelector('#underbadge-storting_og_regjering a[href*="domain=styring"]'));
  assert.ok(window.document.querySelector('.fagverk-ia-place[data-place-id="tinghuset"].is-visited'));
  assert.equal(window.document.querySelector('.fagverk-ia-place[data-place-id="stortinget"]').classList.contains('is-visited'), false);
  dom.window.close();
});
