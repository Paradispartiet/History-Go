import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const imagePath = 'bilder/merker/film_tv/undermerker/filmfestivaler-brodert-v3.webp';
const expectedSHA = 'ec1c62d99acdcddd0e5275624dd2e878430e9ea5cfe1acdac7b7dad83cc4276d';

test('Filmfestivaler v3 is activated with verified original WebP', () => {
  const film = read('data/badges/film_tv.json');
  const manifest = read('data/badges/underbadge_batch01_production.json');
  const badge = manifest.families.film_tv.assets.find(x => x.id === 'filmfestivaler');
  assert.equal(film.color.toUpperCase(), '#C2188B');
  assert.equal(film.secondaryColor.toUpperCase(), '#E7F8FF');
  assert.equal(film.subBadgeImages.filmfestivaler, imagePath);
  assert.equal(badge.status, 'integrated');
  assert.equal(badge.selectedImage, imagePath);
  assert.deepEqual(badge.quality, {visualApproved: true, technicalApproved: true});
  assert.equal(badge.productionBrief.topLabel, 'FILMFESTIVALER');
  assert.equal(badge.productionBrief.bottomLabel, 'FILM & TV');
  assert.equal(badge.sha256, expectedSHA);
  const bytes = readFileSync(new URL('../' + imagePath, import.meta.url));
  assert.equal(bytes.length, 404368);
  assert.equal(bytes.subarray(0,4).toString('ascii'), 'RIFF');
  assert.equal(bytes.subarray(8,12).toString('ascii'), 'WEBP');
  assert.equal(bytes.subarray(12,16).toString('ascii'), 'VP8X');
  assert.ok((bytes[20] & 0x10) !== 0, 'WebP alpha flag');
  assert.equal(bytes.readUIntLE(24,3)+1, 1024);
  assert.equal(bytes.readUIntLE(27,3)+1, 1024);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedSHA);
});

test('seven previous Film & TV badges and all seven Scenekunst badges are preserved', () => {
  const film = read('data/badges/film_tv.json');
  const stage = read('data/badges/scenekunst.json');
  assert.deepEqual(film.subBadgeImages, {
    spillefilm:'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
    kortfilm:'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
    dokumentarfilm:'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp',
    tv_serier:'bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp',
    nyheter_og_reportasje:'bilder/merker/film_tv/undermerker/nyheter_og_reportasje-brodert-v1.webp',
    klassikere:'bilder/merker/film_tv/undermerker/klassikere-brodert-v1.webp',
    norsk_film_og_tv:'bilder/merker/film_tv/undermerker/norsk_film_og_tv-brodert-v1.webp',
    filmfestivaler:imagePath,
    filmlocations:'bilder/merker/film_tv/undermerker/filmlocations-brodert-v3.webp',
    film_og_tv_produksjon:'bilder/merker/film_tv/undermerker/film_og_tv_produksjon-brodert-v1.webp',
    arkiv_og_kanon:'bilder/merker/film_tv/undermerker/arkiv_og_kanon-brodert-v1.webp'
  });
  assert.equal(Object.keys(stage.subBadgeImages).length,7);
  for (const id of stage.sub) assert.ok(stage.subBadgeImages[id]);
});
