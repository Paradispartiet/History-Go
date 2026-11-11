import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const json = (path) => JSON.parse(read(path).toString('utf8'));
function assertWebp(path) {
  assert.ok(existsSync(new URL(path, root)), path + ' missing from repository');
  const bytes = read(path);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', path);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', path);
  assert.ok(bytes.length > 1000, path);
}

test('Historie: 14 active originals and all 56 translations exist on main', () => {
  const badge = json('data/badges/historie.json');
  assert.equal(badge.sub.length, 14);
  assert.deepEqual(Object.keys(badge.subBadgeImages), badge.sub);
  for (const id of badge.sub) {
    assertWebp(badge.subBadgeImages[id]);
    for (const lang of ['en','es','pt','fr']) {
      assertWebp(`bilder/merker/historie/locales/${lang}/${id}.webp`);
    }
  }
});

test('Previously integrated By, Film/TV and Scenekunst image files remain present', () => {
  for (const [category, expected] of [['by',10],['film_tv',12],['scenekunst',7]]) {
    const badge = json(`data/badges/${category}.json`);
    assert.equal(Object.keys(badge.subBadgeImages).length,expected,category);
    for (const path of Object.values(badge.subBadgeImages)) assertWebp(path);
  }
});

test('The catalog and Fagverk provide visible access to registered, not necessarily earned, underbadges', () => {
  const catalog = read('badge-kontaktark.html').toString('utf8');
  const portal = read('js/fagverk-forside.js').toString('utf8');
  const subject = read('js/fagverk-ia-v3-badge-progress.js').toString('utf8');
  assert.match(catalog,/registeredUnderbadgeGroups/);
  assert.match(catalog,/subBadgeImages/);
  assert.match(catalog,/registrert med en bildefil/i);
  assert.match(portal,/Vis \$\{activeUnderbadgeCount\} undermerker/);
  assert.match(subject,/rows\.some\(\(row\) => row\.image\)/);
});
