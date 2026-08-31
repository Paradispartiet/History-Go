import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFagverk } from '../scripts/audit-fagverk-place-pages.mjs';

test('substansauditen avviser generisk, uløst og kildefattig ferdigpåstand', () => {
  const place = {
    id: 'teststed',
    desc: 'Dette er den vanlige stedsbeskrivelsen.',
    popupDesc: 'Dette er den vanlige stedsbeskrivelsen.',
    externalLinks: [],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Generisk eksempeltekst som skal se ferdig ut uten å være stedsspesifikk eller kildebelagt.',
      article: ['Dette er den vanlige stedsbeskrivelsen.'],
      subject_ids: ['politikk'],
      emne_ids: ['em_pol_finnes_ikke'],
      chapter_ids: [],
      lenses: [],
      guiding_questions: ['Hva ser du?'],
      concepts: [],
      observable_traces: [],
      source_urls: ['https://example.org/uten-navngitt-kilde'],
      verified_at: '2026-08-31'
    }
  };
  const indexEntry = {
    sourceFile: 'places/teststed.json',
    field: 'fagverk',
    schema: 'history_go_place_fagverk_v2',
    level: 'standard',
    status: 'curated'
  };
  const errors = validateFagverk(place, 'places/teststed.json', indexEntry).join('\n');
  assert.match(errors, /plassholder- eller generisk språk/);
  assert.match(errors, /uløst canonical emne_id/);
  assert.match(errors, /mangler navngitt operativ externalLinks-oppføring/);
  assert.match(errors, /fagartikkelen mangler substans/);
  assert.match(errors, /antall linser passer ikke nivået/);
  assert.match(errors, /vanlig stedsbeskrivelse er kopiert ordrett/);
});

test('registryindeksen kan ikke ta tilbake stedlig innhold', () => {
  const place = {
    id: 'mikrotest',
    externalLinks: [{ label: 'Kilde', url: 'https://example.org/kilde' }],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'micro',
      status: 'in_production',
      intro: 'Et avgrenset stedlig læringsspor som fortsatt er under redaksjonell produksjon og ikke erklæres ferdig.',
      article: [],
      subject_ids: ['politikk'],
      emne_ids: ['em_pol_institusjoner_styring'],
      chapter_ids: [],
      lenses: [],
      guiding_questions: [],
      concepts: [],
      observable_traces: [],
      source_urls: ['https://example.org/kilde'],
      verified_at: '2026-08-31'
    }
  };
  const indexEntry = {
    sourceFile: 'places/mikrotest.json',
    field: 'fagverk',
    schema: 'history_go_place_fagverk_v2',
    level: 'micro',
    status: 'in_production',
    lenses: [{ title: 'Ulovlig registryinnhold' }]
  };
  const errors = validateFagverk(place, 'places/mikrotest.json', indexEntry).join('\n');
  assert.match(errors, /registry-indeksen har ulovlig felt lenses/);
  assert.match(errors, /registryet eier fortsatt stedlig innhold i lenses/);
});
