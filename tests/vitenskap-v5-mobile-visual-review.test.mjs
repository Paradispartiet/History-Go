import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const file = name => readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const active = JSON.parse(file('data/badges/vitenskap.json'));
const manifest = JSON.parse(file('data/badges/vitenskap_v5_candidates_20261112.json'));

test('PlaceCard renders the complete badge without the former 12% zoom', () => {
  const css = file('css/placeCard.css');
  const badgeRule = css.match(/#placeCard #pcBadgesIcon \.pc-badge-round-img\s*\{([^}]+)\}/);
  assert.ok(badgeRule, 'Missing PlaceCard round badge rule');
  assert.match(badgeRule[1], /object-fit:\s*contain\s*;/);
  assert.match(badgeRule[1], /transform:\s*none\s*;/);
  assert.doesNotMatch(badgeRule[1], /scale\(/);
  const heroRule = css.match(/#placeCard \.pc-title-row > #pcBadgesIcon > img\.pc-badge-round-img\s*\{([^}]+)\}/);
  assert.ok(heroRule, 'Badge-specific hero rule must override portrait cover');
  assert.match(heroRule[1], /object-fit:\s*contain\s*;/);
  assert.match(heroRule[1], /transform:\s*none\s*;/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*?#placeCard \.pc-title-row > #pcBadgesIcon\s*\{[\s\S]*?width:\s*38px/);
  assert.match(css, /#placeCard \.pc-title-row > #pcBadgesIcon\s*\{[\s\S]*?width:\s*52px/);
  assert.match(css, /\.pc-underbadge-thumb\s*\{[\s\S]*?width:\s*38px/);
});

test('Visual comparison page is a non-activating reader for all five science topics', () => {
  const html = file('vitenskap-v5-review.html');
  assert.match(html, /Vitenskap &amp; teknologi – v5-gjennomgang/);
  assert.match(html, /Ikke aktive merker/);
  assert.match(html, /id="topic"/);
  assert.match(html, /id="language"/);
  assert.match(html, /id="size"/);
  for (const size of [38, 52, 96, 160, 320]) {
    assert.match(html, new RegExp('value="' + size + '"'));
  }
  assert.match(html, /vitenskap_v5_candidates_20261112\.json/);
  assert.match(html, /vitenskap_v2_localization_20261112\.json/);
  assert.match(html, /row\.source/);
  assert.match(html, /row\.path/);
  assert.match(html, /dialog\.showModal\(\)/);
  assert.doesNotMatch(html, /data\/badges\/vitenskap\.json/);
  const inline = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(inline, 'Missing review script');
  assert.doesNotThrow(() => new Script(inline[1], {filename:'vitenskap-v5-review.html'}));
  assert.equal(manifest.status, 'twenty_v5_candidates_stored_not_approved_or_active');
  assert.equal(manifest.items.length, 20);
  assert.equal(new Set(manifest.items.map(item=>item.id)).size, 5);
  assert.equal(new Set(manifest.items.map(item=>item.locale)).size, 4);
  assert.equal(Object.keys(active.subBadgeImages).length, 16);
  assert.ok(Object.values(active.subBadgeImages).every(path=>!path.includes('-v5-')));
});
