import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const viewportSource = readFileSync(new URL('../js/core/viewportManager.js', import.meta.url), 'utf8');
const footerCSS = readFileSync(new URL('../css/footer.css', import.meta.url), 'utf8');
const layoutCSS = readFileSync(new URL('../css/layout.css', import.meta.url), 'utf8');
const indexHTML = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function renderViewport(width, height) {
  const vars = new Map();
  const classes = new Set();
  const element = () => ({ style: {} });
  const shell = element();
  const mapLayer = element();
  const visualViewport = {
    width,
    height,
    addEventListener() {},
  };
  const window = {
    visualViewport,
    addEventListener() {},
  };
  const document = {
    activeElement: null,
    body: {
      classList: {
        toggle(name, enabled) {
          if (enabled) classes.add(name);
          else classes.delete(name);
        },
      },
    },
    documentElement: {
      style: {
        setProperty(name, value) { vars.set(name, value); },
      },
    },
    querySelector(selector) { return selector === '.app-shell' ? shell : null; },
    getElementById(id) { return id === 'mapLayer' ? mapLayer : null; },
    addEventListener() {},
  };
  vm.runInNewContext(viewportSource, {
    window,
    document,
    requestAnimationFrame() { throw new Error('unexpected deferred layout'); },
  });
  window.ViewportManager.init();
  return { vars, classes, viewport: window.HGViewport };
}

test('phone footer is one 48px row plus 12px control padding', () => {
  const { vars, classes, viewport } = renderViewport(390, 844);
  assert.equal(classes.has('hg-phone'), true);
  assert.equal(viewport.footerHeight, 60);
  assert.equal(vars.get('--hg-visual-footer-height'), '60px');
  assert.equal(vars.get('--hg-design-footer-offset'), `${60 / viewport.scale}px`);
  assert.match(footerCSS, /body\.hg-app\.hg-phone \.app-footer\s*\{[^}]*padding:\s*6px 8px calc\(6px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  assert.match(footerCSS, /body\.hg-app\.hg-phone \.pc-mini\s*\{[^}]*width:\s*48px;[^}]*height:\s*48px;[^}]*flex:\s*0 0 48px/);
  assert.match(footerCSS, /body\.hg-app\.hg-phone \.app-actions button\s*\{[^}]*height:\s*48px/);
});

test('tablet footer keeps original height', () => {
  const { vars, classes, viewport } = renderViewport(768, 1024);
  assert.equal(classes.has('hg-tablet'), true);
  assert.equal(viewport.footerHeight, 72);
  assert.equal(vars.get('--hg-visual-footer-height'), '72px');
});

test('footer safe area is counted once and buttons remain in one scrolling row', () => {
  assert.match(layoutCSS, /--hg-bottom-nav-content-height:\s*var\(--hg-visual-footer-height, 72px\)/);
  assert.match(layoutCSS, /--hg-bottom-nav-height:\s*calc\(\s*var\(--hg-bottom-nav-content-height\) \+ var\(--hg-safe-area-bottom\)/);
  assert.match(footerCSS, /\.app-actions\s*\{[^}]*min-width:\s*0;[^}]*overflow-x:\s*auto/);
  assert.match(footerCSS, /body\.hg-app\.hg-phone \.app-actions\s*\{[^}]*overflow-x:\s*auto/);
  assert.match(footerCSS, /body\.hg-app \.app-footer\s*\{[^}]*background:\s*#000/);
  assert.doesNotMatch(indexHTML, /id="pcInfo"/);
  for (const id of ["pcQuiz", "pcVisit", "pcRoute", "pcObserve", "pcNote"]) {
    assert.match(footerCSS, new RegExp("#" + id + "::before\\s*\\{[^}]*background-image:"));
  }
  assert.match(indexHTML, /<footer class="site-footer app-footer"[\s\S]*?<div class="app-actions"/);
  assert.equal((indexHTML.match(/<footer class="site-footer app-footer"/g) || []).length, 1);
});

test('footer is black with seven distinct polychrome SVG illustrations', () => {
  assert.match(indexHTML, /id="pcOnSiteFooter" class="pc-onsite-footer"/);
  assert.match(footerCSS, /body\.hg-app \.app-footer\s*\{[^}]*background:\s*#000/);
  assert.doesNotMatch(footerCSS, /(?:-webkit-)?mask-image:/);
  for (const selector of [
    '#pcQuiz::before', '#pcVisit::before', '#pcRoute::before',
    '#pcObserve::before', '#pcNote::before'
  ]) {
    assert.match(footerCSS, new RegExp(selector + '\\s*\\{[^}]*background-image:'));
  }
  assert.match(footerCSS, /\.pc-onsite-action-events \.pc-onsite-action-icon::before\s*\{[^}]*background-image:/);
  assert.match(footerCSS, /\.pc-onsite-action-meet \.pc-onsite-action-icon::before\s*\{[^}]*background-image:/);
  const dataImages = [...footerCSS.matchAll(/background-image:\s*url\("data:image\/svg\+xml,([^"]+)"\)/g)];
  assert.equal(dataImages.length, 7, 'seven illustrated SVGs, including Quiz and Visit');
  const art = dataImages.map(([, raw]) => decodeURIComponent(raw));
  assert.equal(new Set(art).size, 7, 'no generic reused artwork');
  for (const svg of art) {
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.ok(new Set(svg.match(/#[a-fA-F0-9]{6}/g) || []).size >= 4,
      'each illustrated icon has multiple saturated colours');
  }
  const surface = readFileSync(new URL('../js/ui/place-onsite-surface.js', import.meta.url), 'utf8');
  assert.match(surface, /function syncFooterActions\(place, force = false\)/);
  assert.match(surface, /footerOwnsCore/);
  assert.match(surface, /if \(!actions.length\) return ""/);
});
