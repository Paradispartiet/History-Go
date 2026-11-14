import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const source = read('js/ui/place-card.js');
const css = read('css/placeCard.css');
const html = read('index.html');
const sw = read('sw.js');
const active = JSON.parse(read('data/badges/vitenskap.json'));

test('PlaceCard badge icon uses badge-specific uncropped image styling', () => {
  const match = source.match(/badgesIcon\.innerHTML\s*=\s*[^\n]+/);
  assert.ok(match, 'Could not locate badge-circle image markup');
  assert.match(match[0], /class="pc-badge-round-img"/);
  assert.doesNotMatch(match[0], /class="pc-person-img"/);
  assert.equal((match[0].match(/escapePlaceCardHTML\(label\)/g) || []).length, 2);

  // People portraits continue using their own styles.
  assert.match(source, /class="pc-person-img"/);
  // The badge image still comes from the registered place-specific category.
  assert.match(source, /placeBadge\?\.subBadgeImages\?\.\[preferredSubBadgeId\]/);
});

test('specific badge rules override shared portrait cover without clipping woven rim', () => {
  const specific = css.match(/#placeCard \.pc-title-row > #pcBadgesIcon > img\.pc-badge-round-img\s*\{([^}]+)\}/);
  assert.ok(specific, 'Missing specific badge override after portrait rule');
  assert.match(specific[1], /object-fit:\s*contain\s*;/);
  assert.match(specific[1], /transform:\s*none\s*;/);

  const shared = css.match(/#placeCard \.pc-title-row > #pcPeopleIcon > img,\s*#placeCard \.pc-title-row > #pcBadgesIcon > img\s*\{([^}]+)\}/);
  assert.ok(shared, 'Missing original shared People/Badge portrait rule');
  assert.match(shared[1], /object-fit:\s*cover\s*;/);
  assert.ok(css.indexOf('#placeCard .pc-title-row > #pcBadgesIcon > img.pc-badge-round-img') >
    css.indexOf('#placeCard .pc-title-row > #pcBadgesIcon > img {'),
    'The badge override must be after the shared portrait rule');

  const base = css.match(/#placeCard #pcBadgesIcon \.pc-badge-round-img\s*\{([^}]+)\}/);
  assert.ok(base, 'Missing base badge image style');
  assert.match(base[1], /object-fit:\s*contain\s*;/);
  assert.match(css, /#placeCard \.pc-title-row > #pcBadgesIcon[\s\S]*?width:\s*52px/);
  assert.match(css, /@media\s*\(max-width:\s*520px\)[\s\S]*?#placeCard \.pc-title-row > #pcBadgesIcon[\s\S]*?width:\s*38px/);
});

test('cache references update without activating v7 candidates', () => {
  assert.match(html, /js\/app\.js\?v=20261114-badge-full-rim-class1/);
  assert.match(sw, /hg-sw-2026-11-14-[^"]*full-rim-v2/);
  assert.equal(Object.keys(active.subBadgeImages).length, 16);
  for (const filename of Object.values(active.subBadgeImages)) {
    assert.match(filename, /^bilder\/merker\/vitenskap\/brodert\/[^/]+\.webp$/);
  }
});
