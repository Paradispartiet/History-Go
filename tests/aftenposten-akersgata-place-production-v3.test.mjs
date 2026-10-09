import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import sharp from 'sharp';
import { deriveSelectedCollections, deriveWorkflowState, loadWorkflowRecord } from '../scripts/place-production-v3-lib.mjs';
import { validatePacket } from '../scripts/validate-place-description-production-v4_2.mjs';

const id = 'aftenposten_akersgata';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const place = read(`data/places/media/oslo/places_oslo_media/${id}.json`);
const workflow = loadWorkflowRecord(id);
const runtime = read(`data/runtime/place-open/${id}.json`);

test('Aftenposten preserves the verified 51 anchor and the Eilertsen correction', () => {
  assert.equal(place.address.number, '51');
  assert.equal(place.coordRole, 'historical_anchor');
  assert.equal(place.coordStatus, 'verified_historical_source');
  assert.equal(place.sourceObjectId, 'aftenposten:akersgata51:1876-2003');
  assert.equal(place.lat, 59.91475521441622);
  assert.equal(place.lon, 10.743249924327655);
  assert.equal(runtime.people.some(person => person.id === 'trine_eilertsen'), false);
  const peopleDocument = read('data/people/media/oslo/people_media_oslo.json');
  const people = Array.isArray(peopleDocument) ? peopleDocument : peopleDocument.people;
  const eilertsen = people.find(person => person.id === 'trine_eilertsen');
  assert.equal(eilertsen.placeId, 'vg_huset');
});

test('Aftenposten has factual text and a consistent declared production state', () => {
  const packet = read(`data/places/production/${id}.json`);
  const result = validatePacket({ packet, place });
  const issues = result.issues.filter(issue => !['popup_below_minimum', 'desc_outside_normal_range'].includes(issue.code));
  assert.deepEqual(issues, []);
  assert.equal(workflow.profile.status, 'confirmed');
  assert.equal(workflow.profile.id, 'major');
  assert.equal(workflow.state, deriveWorkflowState(workflow));
  if (workflow.state !== 'complete') assert.notEqual(place.production_status, 'complete');
  else assert.equal(place.production_status, 'complete');
  assert.deepEqual(place.place_card_profile.collection_ids, deriveSelectedCollections(workflow));
  assert.deepEqual(runtime.place.place_card_profile, place.place_card_profile);
});

test('The published Aftenposten collections resolve real local member images', async () => {
  for (const collection of deriveSelectedCollections(workflow)) {
    if (collection === 'objects') {
      assert.ok(place.objects.length > 0);
      for (const object of place.objects) {
        assert.equal(object.physicalObject, true);
        assert.equal(object.placeSpecific, true);
        assert.ok(fs.existsSync(object.image));
        const meta = await sharp(object.image).metadata();
        assert.ok(meta.width > 0 && meta.height > 0);
      }
    }
    if (collection === 'brands') {
      const brandIds = read('data/brands/brands_by_place.json')[id];
      assert.ok(brandIds.length > 0);
      const brands = read('data/brands/brands_master.json');
      for (const brandId of brandIds) {
        const brand = brands.find(candidate => candidate.id === brandId);
        assert.ok(fs.existsSync(brand.logo));
        assert.equal(brand.logoMeta.noEndorsement, true);
        assert.match(brand.logoMeta.sourcePage, /^https:\/\//u);
        assert.equal(brand.logoMeta.reviewStatus, 'verified');
        const meta = await sharp(brand.logo).metadata();
        assert.ok(meta.width > 0 && meta.height > 0);
      }
    }
  }
  assert.notEqual(place.image, place.frontImage);
  assert.notEqual(place.imageMeta.fileTitle, place.frontImageMeta.source.fileTitle);
  const front = await sharp(place.frontImage).metadata();
  assert.ok(front.height > front.width, 'frontImage must be an actual portrait file');
  assert.equal('cardImage' in place, false);
});

test('Aftenposten language and chronology stay with their canonical owners', () => {
  const manifest = read('data/leksikon/sprak/manifest.json');
  const language = read(manifest.place_files[id]);
  assert.equal(language.place_id, id);
  assert.ok(language.entries.length > 0);
  assert.ok(language.entries.every(entry => entry.layer !== 'dialect' && !entry.dialect_area));
  const lex = read('data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json');
  const years = lex.find(entry => entry.id === `${id}_hovedartikkel`).chronology.map(entry => entry.year);
  assert.deepEqual(years, [...years].sort((a, b) => a - b));
  assert.ok(years.every(year => year >= 1876 && year <= 2003), '51 timeline must not absorb the 2014 move to 55');
  const epochs = read('data/epoker/epoke-place-index.json').domains.historie.epochs;
  const milestones = Object.values(epochs).flatMap(epoch => epoch.places)
    .filter(candidate => candidate.place_id === id).flatMap(candidate => candidate.milestones);
  assert.ok(milestones.length > 0);
  assert.ok(milestones.every(milestone => milestone.year >= 1876 && milestone.year <= 2003),
    'all generated evidence lanes must preserve the historical address boundary');
  assert.equal(milestones.some(milestone => milestone.claim_id === 'claim_aftenposten_return'), false);
  const index = read('data/fagverk/fagverk_registry.json').placeLinks[id];
  assert.equal(index.field, 'fagverk');
  assert.equal('article' in index, false, 'registry must not duplicate place-owned learning content');
});
