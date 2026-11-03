import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const read = p => JSON.parse(readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const imagePath = 'bilder/merker/film_tv/undermerker/norsk_film_og_tv-brodert-v1.webp';
const expectedSHA256 = 'b8c23b45bbf20f0308c82abea852d6a43ffda28cf11fe44344a5bf402f4efd77';

test('Norsk film og TV has the integrated original embroidered WebP', () => {
  const f = read('data/badges/film_tv.json');
  const m = read('data/badges/underbadge_batch01_production.json');
  const a = m.families.film_tv.assets.find(x => x.id === 'norsk_film_og_tv');
  const b = a.productionBrief;
  assert.equal(f.color.toUpperCase(), '#C2188B');
  assert.equal(f.secondaryColor.toUpperCase(), '#E7F8FF');
  assert.equal(a.status, 'integrated');
  assert.equal(a.selectedImage, imagePath);
  assert.deepEqual(a.quality, {visualApproved: true, technicalApproved: true});
  assert.equal(f.subBadgeImages.norsk_film_og_tv, imagePath);
  assert.equal(b.topLabel, 'NORSK FILM OG TV');
  assert.equal(b.bottomLabel, 'FILM & TV');
  assert.equal(b.bottomRelativeSize, 0.48);
  assert.equal(b.status, 'fulfilled_v1_active');
  assert.equal(b.visualApproved, true);
  assert.equal(b.technicalApproved, true);
  assert.equal(b.selectedImage, imagePath);
  assert.equal(b.sha256, expectedSHA256);
  assert.ok(b.avoid.includes('ANIMASJON_label'));
  assert.ok(b.requirements.includes('visual_review_before_activation'));

  const image = readFileSync(new URL('../' + imagePath, import.meta.url));
  assert.equal(image.length, 532784);
  assert.equal(image.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(image.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.equal(image.subarray(12, 16).toString('ascii'), 'VP8X');
  assert.ok((image[20] & 0x10) !== 0, 'VP8X alpha flag must be set');
  assert.equal(image.readUIntLE(24, 3) + 1, 1024);
  assert.equal(image.readUIntLE(27, 3) + 1, 1024);
  assert.equal(createHash('sha256').update(image).digest('hex'), expectedSHA256);
});

test('all six previous Film & TV and seven Scenekunst underbadges stay unchanged', () => {
  const f = read('data/badges/film_tv.json');
  const s = read('data/badges/scenekunst.json');
  const expected = {
    spillefilm: 'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
    kortfilm: 'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
    dokumentarfilm: 'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp',
    tv_serier: 'bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp',
    nyheter_og_reportasje: 'bilder/merker/film_tv/undermerker/nyheter_og_reportasje-brodert-v1.webp',
    klassikere: 'bilder/merker/film_tv/undermerker/klassikere-brodert-v1.webp',
    norsk_film_og_tv: imagePath
  };
  for (const [id, value] of Object.entries(expected)) assert.equal(f.subBadgeImages[id], value, id);
  assert.equal(Object.keys(f.subBadgeImages).length, 12);
  assert.equal(Object.keys(s.subBadgeImages).length, 7);
  for (const id of s.sub) assert.ok(s.subBadgeImages[id]);
});
