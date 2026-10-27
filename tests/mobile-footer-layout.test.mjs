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

test('phone footer stays a single row with 44px tap targets', () => {
  const { vars, classes, viewport } = renderViewport(390, 844);
  assert.equal(classes.has('hg-phone'), true);
  assert.equal(viewport.footerHeight, 60);
  assert.equal(vars.get('--hg-visual-footer-height'), '60px');
  assert.equal(vars.get('--hg-design-footer-offset'), `${60 / viewport.scale}px`);
  assert.match(footerCSS, /body\.hg-app\.hg-phone \.app-footer\s*\{[^}]*padding:\s*6px 8px calc\(6px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  assert.match(footerCSS, /body\.hg-app\.hg-phone \.pc-mini\s*\{[^}]*width:\s*48px;[^}]*height:\s*48px;[^}]*flex:\s*0 0 48px/);
  assert.match(footerCSS, /body\.hg-app\.hg-phone \.app-actions button\s*\{[^}]*height:\s*44px/);
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
  assert.match(footerCSS, /body\.hg-app \.app-footer\s*\{[^}]*background:\s*var\(--hg-toolbar-bg\)/);
  assert.doesNotMatch(indexHTML, /id="pcInfo"/);
  for (const id of ["pcQuiz", "pcVisit", "pcRoute", "pcObserve", "pcNote"]) {
    assert.match(footerCSS, new RegExp("#" + id + "::before\\s*\\{[^}]*background-image:"));
  }
  assert.match(indexHTML, /<footer class="site-footer app-footer"[\s\S]*?<div class="app-actions"/);
  assert.equal((indexHTML.match(/<footer class="site-footer app-footer"/g) || []).length, 1);
});

test('unframed header/footer icons retain accessible labels, seven glyphs and structural dividers', () => {
  assert.match(indexHTML, /id="pcOnSiteFooter" class="pc-onsite-footer"/);
  assert.match(footerCSS, /--hg-toolbar-yellow:\s*var\(--yellow, #f6c800\)/);
  assert.doesNotMatch(footerCSS, /--hg-toolbar-edge:/);
  assert.match(footerCSS, /body\.hg-app \.site-header\s*\{[^}]*border-bottom:\s*1px solid var\(--hg-toolbar-yellow\)/);
  assert.match(footerCSS, /body\.hg-app \.app-footer\s*\{[^}]*border-top:\s*1px solid var\(--hg-toolbar-yellow\)/);
  assert.match(footerCSS, /\.pc-mini\s*\{[^}]*border:\s*0;/);
  // Header action controls and footer actions must not draw icon circles.
  assert.match(footerCSS, /body\.hg-app \.site-header \.iconbtn,[\s\S]*?body\.hg-app \.site-header #miniProfile\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent;/);
  assert.match(footerCSS, /body\.hg-app \.app-footer \.app-actions button,[\s\S]*?body\.hg-app \.app-footer \.app-actions \.pc-action\s*\{[^}]*border:\s*0;[^}]*border-radius:\s*0;[^}]*background:\s*transparent;/);
  assert.match(footerCSS, /body\.hg-app \.app-footer \.pc-onsite-footer \.pc-onsite-action\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent;/);
  assert.match(footerCSS, /\.pc-route-menu button\s*\{[^}]*border:\s*0;[^}]*border-radius:\s*0;/);
  // Accessible focus stays visible as an underline, not a drawn circle.
  assert.match(footerCSS, /body\.hg-app \.site-header #miniProfile:focus-visible\s*\{[^}]*box-shadow:\s*inset 0 -2px 0 var\(--hg-toolbar-yellow\)/);
  assert.match(footerCSS, /body\.hg-app \.app-footer \.app-actions button:focus-visible\s*\{[^}]*box-shadow:\s*inset 0 -2px 0 var\(--hg-toolbar-yellow\)/);
  assert.doesNotMatch(footerCSS, /(?:-webkit-)?mask-image:/);
  for (const [id, label] of [
    ['pcQuiz','Ta quiz'], ['pcVisit','Registrer besøk'],
    ['pcRoute','Rute'], ['pcObserve','Observer'], ['pcNote','Notat']
  ]) {
    assert.match(indexHTML, new RegExp('id="' + id + '"[^>]*>' + label + '</button>'),
      id + ' retains its accessible text fallback');
    assert.match(footerCSS, new RegExp('#' + id + '::before\\s*\\{[^}]*background-image:'),
      id + ' has a dedicated icon');
  }
  assert.match(footerCSS, /\.app-footer \.app-actions :is\(#pcQuiz, #pcRoute, #pcObserve, #pcNote\)\s*\{[^}]*font-size:\s*0;/);
  assert.match(footerCSS, /\.pc-onsite-action-events \.pc-onsite-action-label\s*\{[^}]*display:\s*none;/);
  assert.doesNotMatch(footerCSS, /\.pc-onsite-action-meet \.pc-onsite-action-label\s*\{[^}]*display:\s*none;/);
  for (const action of ['events','meet']) {
    assert.match(footerCSS, new RegExp('\\.pc-onsite-action-' + action + ' \\.pc-onsite-action-icon::before\\s*\\{[^}]*background-image:'));
  }
  const encoded = [...footerCSS.matchAll(/background-image:\s*url\("data:image\/svg\+xml,([^"]+)"\)/g)];
  assert.equal(encoded.length, 7, 'all seven footer actions have brand-new pictograms');
  const svgs = encoded.map(([, data]) => decodeURIComponent(data));
  assert.equal(new Set(svgs).size, 7, 'different icons for every action');
  for (const svg of svgs) {
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(svg, /#f6c800/, 'header yellow is used in the icon');
    assert.match(svg, /#f8f8f1/, 'crisp white linework complements the yellow');
  }
  assert.match(footerCSS, /\.app-actions \.pc-onsite-footer \.pc-onsite-action-count\s*\{[^}]*background:\s*var\(--hg-toolbar-yellow\)/);
  const surface = readFileSync(new URL('../js/ui/place-onsite-surface.js', import.meta.url), 'utf8');
  assert.match(surface, /function syncFooterActions\(place, force = false\)/);
  assert.match(surface, /footerOwnsCore/);
  assert.match(surface, /if \(!actions.length\) return ""/);
});
