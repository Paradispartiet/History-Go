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
    load: async (subject) => subjectModel instanceof Map ? subjectModel.get(subject) : subjectModel,
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

test('kuratert Place-eid fagverk gjør linser, fagområder, begreper og emner til presise lenker', async () => {
  const canonical = JSON.parse(fs.readFileSync('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json','utf8'));
  const curated = canonical.fagverk;
  const emners = curated.emne_ids.map((id, index) => ({
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
    fagverk: curated,
    externalLinks: curated.source_urls.map((url, index) => ({ label: `Kontrollert kilde ${index + 1}`, url })),
    emne_ids: emners.slice(0, 3).map((emne) => emne.id),
    underbadge_ids: ['storting_og_regjering']
  }, modelFixture('politikk', emners));
  const { document } = dom.window;
  assert.equal(document.querySelectorAll('#fagverkPlaceLenses a').length, curated.lenses.length);
  assert.ok([...document.querySelectorAll('#fagverkPlaceLenses a')].every((link) => link.href.includes('subject=politikk') && link.href.includes('emne=')));
  assert.ok(document.querySelectorAll('#fagverkPlaceChapters a').length >= 1);
  assert.ok([...document.querySelectorAll('#fagverkPlaceConcepts a, #fagverkPlaceEmner a')].every((link) => link.href.includes('subject=politikk')));
  assert.equal(document.querySelectorAll('#fagverkPlaceConcepts span, #fagverkPlaceEmner span').length, 0);
  assert.equal(document.querySelectorAll('#fagverkPlaceSources a').length, curated.source_urls.length);
  assert.ok([...document.querySelectorAll('#fagverkPlaceSources a, #fagverkPlaceTraces a')].every((link) => link.target === '_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer')));
  assert.equal(document.querySelector('#fagverkPlaceUnfinished').hidden, true);
  dom.window.close();
});

test('Torggata renderer fire stedsegne linser og bare operative, navngitte kilder', async () => {
  const place = JSON.parse(fs.readFileSync('data/places/by/oslo/places/torggata.json', 'utf8'));
  const emners = place.fagverk.emne_ids.map((id, index) => ({
    id,
    domainId: `by_dom_${index}`,
    title: `By-emne ${index + 1}`,
    definition: `Canonical By-definisjon ${index + 1}.`,
    concepts: [place.fagverk.concepts[index]],
    keyQuestions: []
  }));
  const dom = await render(place, modelFixture('by', emners));
  const { document } = dom.window;
  assert.match(document.querySelector('#fagverkPlaceCoverageStatus').textContent, /kuratert stedsfagverk/i);
  assert.equal(document.querySelector('#fagverkPlaceUnfinished').hidden, true);
  assert.equal(document.querySelectorAll('#fagverkPlaceLenses a').length, 4);
  assert.equal(document.querySelectorAll('#fagverkPlaceQuestions li').length, 5);
  assert.equal(document.querySelectorAll('#fagverkPlaceTraces article').length, 3);
  assert.equal(document.querySelectorAll('#fagverkPlaceSources a').length, 4);
  assert.ok([...document.querySelectorAll('#fagverkPlaceLenses a')].every((link) => (
    link.href.includes('subject=by') && link.href.includes('place=torggata') && link.href.includes('emne=em_by_')
  )));
  assert.deepEqual(
    [...document.querySelectorAll('#fagverkPlaceSources a')].map((link) => link.href),
    place.fagverk.source_urls
  );
  assert.ok([...document.querySelectorAll('#fagverkPlaceSources a, #fagverkPlaceTraces a')].every((link) => (
    link.target === '_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer')
  )));
  dom.window.close();
});

test('Bispelokket renderer stedsegne undersøkelser med operative fag- og kildelenker', async () => {
  const place = JSON.parse(fs.readFileSync('data/places/by/oslo/places/bispelokket.json', 'utf8'));
  const emners = place.fagverk.emne_ids.map((id, index) => ({
    id,
    domainId: `bispelokket_dom_${index}`,
    title: `By-emne ${index + 1}`,
    definition: `Canonical By-definisjon ${index + 1}.`,
    concepts: [place.fagverk.concepts[index]],
    keyQuestions: []
  }));
  const dom = await render(place, modelFixture('by', emners));
  const { document } = dom.window;
  assert.match(document.querySelector('#fagverkPlaceCoverageStatus').textContent, /kuratert stedsfagverk/i);
  assert.equal(document.querySelector('#fagverkPlaceUnfinished').hidden, true);
  assert.equal(document.querySelectorAll('#fagverkPlaceLenses a').length, 4);
  assert.equal(document.querySelectorAll('#fagverkPlaceQuestions li').length, 5);
  assert.equal(document.querySelectorAll('#fagverkPlaceTraces article').length, 3);
  assert.equal(document.querySelectorAll('#fagverkPlaceSources a').length, 4);
  assert.ok([...document.querySelectorAll('#fagverkPlaceLenses a')].every((link) => (
    link.href.includes('subject=by') && link.href.includes('place=bispelokket') && link.href.includes('emne=em_by_')
  )));
  assert.deepEqual(
    [...document.querySelectorAll('#fagverkPlaceSources a')].map((link) => link.href),
    place.fagverk.source_urls
  );
  assert.ok([...document.querySelectorAll('#fagverkPlaceSources a, #fagverkPlaceTraces a')].every((link) => (
    link.target === '_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer')
  )));
  dom.window.close();
});

test('Grønland Basarene renderer terskelundersøkelser med operative fag- og kildelenker', async () => {
  const place = JSON.parse(fs.readFileSync('data/places/by/oslo/places/gronland_basarene.json', 'utf8'));
  const emners = place.fagverk.emne_ids.map((id, index) => ({
    id,
    domainId: `gronland_basarene_dom_${index}`,
    title: `By-emne ${index + 1}`,
    definition: `Canonical By-definisjon ${index + 1}.`,
    concepts: [place.fagverk.concepts[index]],
    keyQuestions: []
  }));
  const dom = await render(place, modelFixture('by', emners));
  const { document } = dom.window;
  assert.match(document.querySelector('#fagverkPlaceCoverageStatus').textContent, /kuratert stedsfagverk/i);
  assert.equal(document.querySelector('#fagverkPlaceUnfinished').hidden, true);
  assert.equal(document.querySelectorAll('#fagverkPlaceLenses a').length, 4);
  assert.equal(document.querySelectorAll('#fagverkPlaceQuestions li').length, 5);
  assert.equal(document.querySelectorAll('#fagverkPlaceTraces article').length, 3);
  assert.equal(document.querySelectorAll('#fagverkPlaceSources a').length, 4);
  assert.ok([...document.querySelectorAll('#fagverkPlaceLenses a')].every((link) => (
    link.href.includes('subject=by') && link.href.includes('place=gronland_basarene') && link.href.includes('emne=em_by_')
  )));
  assert.deepEqual(
    [...document.querySelectorAll('#fagverkPlaceSources a')].map((link) => link.href),
    place.fagverk.source_urls
  );
  assert.ok([...document.querySelectorAll('#fagverkPlaceSources a, #fagverkPlaceTraces a')].every((link) => (
    link.target === '_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer')
  )));
  dom.window.close();
});

test('ufullført sted får ærlig status og ingen avledede linser eller spørsmål', async () => {
  const emners = [{
    id: 'em_by_gentrifisering_eiendom',
    domainId: 'by_transformasjon',
    title: 'Gentrifisering og eiendom',
    definition: 'Canonical definisjon fra By-faget.',
    concepts: ['gentrifisering'],
    keyQuestions: ['Hvordan endrer eierskap og investering stedet?']
  }];
  const dom = await render({
    id: 'ufullfort_sted',
    name: 'Ufullført sted',
    category: 'by',
    desc: 'Redigert ingress for et ufullført sted.',
    popupDesc: 'Redigert stedsartikkel for et ufullført sted.',
    emne_ids: emners.map((emne) => emne.id)
  }, modelFixture('by', emners));
  const { document } = dom.window;
  assert.equal(document.querySelectorAll('#fagverkPlaceLenses a').length, 0);
  assert.equal(document.querySelector('#fagverkPlaceLensesSection').hidden, true);
  assert.equal(document.querySelector('#fagverkPlaceQuestionsSection').hidden, true);
  assert.equal(document.querySelector('#fagverkPlaceArticleSection').hidden, true);
  assert.equal(document.querySelector('#fagverkPlaceTracesSection').hidden, true);
  assert.equal(document.querySelector('#fagverkPlaceUnfinished').hidden, false);
  assert.match(document.querySelector('#fagverkPlaceUnfinished').textContent, /ikke ferdig/i);
  assert.match(document.querySelector('#fagverkPlaceCoverageStatus').textContent, /under produksjon/i);
  assert.match(document.querySelector('#fagverkPlaceLead').textContent, /mangler fortsatt stedsspesifikke/i);
  assert.equal(document.querySelectorAll('#fagverkPlaceEmner a').length, 1);
  assert.match(document.querySelector('#fagverkPlaceEmner a').href, /subject=by.*domain=by_transformasjon.*emne=em_by_gentrifisering_eiendom/);
  dom.window.close();
});

test('tverrfaglig Place-innhold løser hvert kort mot riktig canonical fag', async () => {
  const politikkEmne = { id: 'em_pol_institusjoner_styring', domainId: 'institusjoner', title: 'Institusjoner og styring', concepts: ['institusjon'] };
  const byEmne = { id: 'em_by_styring_forvaltning_planmakt', domainId: 'byforvaltning', title: 'Planmakt', concepts: ['planmakt'] };
  const fagverk = {
    schema: 'history_go_place_fagverk_v2',
    level: 'micro',
    status: 'curated',
    intro: 'En stedsspesifikk inngang som undersøker møtet mellom institusjonell styring og planmakt i det bygde miljøet.',
    article: [],
    subject_ids: ['politikk', 'by'],
    emne_ids: [politikkEmne.id, byEmne.id],
    chapter_ids: [],
    lenses: [
      { id: 'politikk', title: 'Institusjonell styring', prompt: 'Hvordan organiseres myndighet på dette konkrete stedet?', subject_id: 'politikk', emne_id: politikkEmne.id, evidence: 'Sammenlign synlige funksjoner med dokumenterte mandater.' },
      { id: 'by', title: 'Planmakt i byrommet', prompt: 'Hvordan viser stedet resultatet av konkrete planvalg?', subject_id: 'by', emne_id: byEmne.id, evidence: 'Sammenhold fysisk form med vedtatte planer.' }
    ],
    guiding_questions: ['Hvilket observerbart spor skiller de to faglige forklaringene?'],
    concepts: ['institusjon', 'planmakt'],
    observable_traces: [{ title: 'Avgrenset spor', observation: 'Registrer grensen mellom offentlig rom og institusjonsareal.', interpretation_boundary: 'Grensen viser arealbruk, men beviser ikke myndighetsfordeling.', source_urls: ['https://example.org/kilde'] }],
    source_urls: ['https://example.org/kilde'],
    verified_at: '2026-08-31'
  };
  const dom = await render({
    id: 'tverrfaglig_sted',
    name: 'Tverrfaglig sted',
    category: 'politikk',
    fagverk,
    externalLinks: [{ label: 'Kontrollert kilde', url: 'https://example.org/kilde' }]
  }, new Map([
    ['politikk', modelFixture('politikk', [politikkEmne])],
    ['by', modelFixture('by', [byEmne])]
  ]));
  const { document } = dom.window;
  const lensHrefs = [...document.querySelectorAll('#fagverkPlaceLenses a')].map((link) => link.href);
  assert.equal(lensHrefs.length, 2);
  assert.ok(lensHrefs.some((href) => href.includes('subject=politikk') && href.includes(`emne=${politikkEmne.id}`)));
  assert.ok(lensHrefs.some((href) => href.includes('subject=by') && href.includes(`emne=${byEmne.id}`)));
  assert.equal(document.querySelectorAll('#fagverkPlaceBadgePath .fagverk-canonical-domain-grid > a').length, 2);
  assert.equal(document.querySelectorAll('#fagverkPlaceEmner a').length, 2);
  dom.window.close();
});
