import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const runtime = fs.readFileSync('js/fagverk-sted.js', 'utf8');
const registry = JSON.parse(fs.readFileSync('data/fagverk/fagverk_registry.json', 'utf8'));

function subjectUrl(subject, extras = {}) {
  const params = new URLSearchParams({ subject });
  for (const [key, value] of Object.entries(extras)) if (value) params.set(key, value);
  return `fagverk.html?${params}`;
}

function modelFixture(subject, emners) {
  const domains = [...new Map(emners.map((emne) => [emne.domainId, {
    id: emne.domainId,
    label: `Fagområde ${emne.domainId}`,
    definition: `Canonical beskrivelse av ${emne.domainId}.`
  }])).values()];
  return {
    subject: { id: subject, title: subject === 'politikk' ? 'Politikk & samfunn' : 'By & arkitektur', description: 'Canonical fagbeskrivelse.' },
    emners,
    emnersById: new Map(emners.map((emne) => [emne.id, emne])),
    domains,
    domainsById: new Map(domains.map((domain) => [domain.id, domain])),
    chapters: [{ id: `${subject}_kapittel`, title: 'Canonical kapittel', subtitle: 'Et redigert lærekapittel.', emneIds: emners.map((emne) => emne.id) }]
  };
}

async function render(place, subjectModel) {
  const html = fs.readFileSync('fagverk-sted.html', 'utf8').replace(/<script[\s\S]*?<\/body>/u, '</body>');
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: `https://history-go.test/fagverk-sted.html?place=${place.id}` });
  const { window } = dom;
  window.fetch = async () => ({ ok: true, json: async () => registry });
  window.DataHub = { loadFullPlace: async () => place, loadPlacesBase: async () => [place] };
  window.HGFagverkSubjectModel = {
    load: async () => subjectModel,
    subjectUrl,
    domainUrl: (subject, domain, extras) => subjectUrl(subject, { domain, ...extras }),
    emneUrl: (subject, domain, emne, extras) => subjectUrl(subject, { domain, emne, ...extras }),
    chapterUrl: (subject, chapter, extras) => subjectUrl(subject, { chapter, ...extras })
  };
  const ready = new Promise((resolve) => window.addEventListener('hg:fagverk-place-ready', resolve, { once: true }));
  window.eval(runtime);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  await ready;
  return dom;
}

test('kuratert sted gjør linser, fagområder, begreper og emner til presise lenker', async () => {
  const curated = registry.placeLinks.regjeringskvartalet;
  const emners = curated.emneIds.map((id, index) => ({
    id,
    domainId: `dom_${index % 2}`,
    title: `Emne ${index + 1}`,
    definition: `Canonical definisjon ${index + 1}.`,
    concepts: [`Begrep ${index + 1}`],
    keyQuestions: [`Canonical spørsmål ${index + 1}?`]
  }));
  const dom = await render({
    id: 'regjeringskvartalet',
    name: 'Regjeringskvartalet',
    category: 'politikk',
    desc: 'Redigert ingress.',
    popupDesc: 'Redigert artikkel.',
    emne_ids: emners.slice(0, 3).map((emne) => emne.id),
    underbadge_ids: ['storting_og_regjering']
  }, modelFixture('politikk', emners));
  const { document } = dom.window;
  assert.equal(document.querySelectorAll('#fagverkPlaceLenses a').length, curated.lenses.length);
  assert.ok([...document.querySelectorAll('#fagverkPlaceLenses a')].every((link) => link.href.includes('subject=politikk') && link.href.includes('emne=')));
  assert.ok(document.querySelectorAll('#fagverkPlaceChapters a').length >= 2);
  assert.ok([...document.querySelectorAll('#fagverkPlaceConcepts a, #fagverkPlaceEmner a')].every((link) => link.href.includes('subject=politikk')));
  assert.equal(document.querySelectorAll('#fagverkPlaceConcepts span, #fagverkPlaceEmner span').length, 0);
  dom.window.close();
});

test('ordinært sted bruker source-eide emner som unike klikkbare linser', async () => {
  const emners = [{
    id: 'em_by_gentrifisering_eiendom',
    domainId: 'by_transformasjon',
    title: 'Gentrifisering og eiendom',
    definition: 'Canonical definisjon fra By-faget.',
    concepts: ['gentrifisering'],
    keyQuestions: ['Hvordan endrer eierskap og investering stedet?']
  }];
  const dom = await render({
    id: 'torggata',
    name: 'Torggata',
    category: 'by',
    desc: 'Redigert ingress for Torggata.',
    popupDesc: 'Redigert stedsartikkel for Torggata.',
    emne_ids: emners.map((emne) => emne.id)
  }, modelFixture('by', emners));
  const { document } = dom.window;
  assert.equal(document.querySelectorAll('#fagverkPlaceLenses a').length, 1);
  assert.match(document.querySelector('#fagverkPlaceLenses a').href, /subject=by.*domain=by_transformasjon.*emne=em_by_gentrifisering_eiendom/);
  assert.equal(document.querySelector('#fagverkPlaceQuestions li').textContent, 'Hvordan endrer eierskap og investering stedet?');
  assert.match(document.querySelector('#fagverkPlaceCoverageStatus').textContent, /1 canonicale emnekoblinger/);
  dom.window.close();
});
