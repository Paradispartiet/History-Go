#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const repoRoot = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

function runScript(window, rel) {
  vm.runInContext(read(rel), window.__ctx, { filename: rel });
}

function click(window, selector, label = selector) {
  const el = window.document.querySelector(selector);
  assert(el, `Missing clickable element: ${label}`);
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  return el;
}

function textOf(node) {
  return String(node?.textContent || '').replace(/\s+/g, ' ').trim();
}

function makeDom(html, url) {
  const dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  window.__ctx = dom.getInternalVMContext();
  window.console = console;
  window.showToast = () => {};
  return window;
}

function assertNoForbiddenUi(scope, label) {
  const html = scope.innerHTML.toLowerCase();
  const forbidden = ['live location', 'live-posisjon', 'free chat', 'fritekst-chat', 'nearby users', 'last seen', 'followers', 'feed'];
  for (const term of forbidden) {
    assert(!html.includes(term), `${label} must not expose forbidden UI/copy: ${term}`);
  }
  assert(!scope.querySelector('[data-social-feed], [data-followers], [data-nearby], [data-live-location], textarea, input[type="text"]'), `${label} must not expose social feed/follower/nearby/live-location/free-chat controls`);
}

const profileSource = read('profile.html');
const profileStatic = makeDom(profileSource, 'http://localhost/profile.html');

const socialTab = profileStatic.document.querySelector('.profile-tabs [data-tab="socialmeet"]');
assert(socialTab, 'Social Meet tab is present in the top-level profile tablist');
assert.strictEqual(textOf(socialTab), 'Social Meet', 'Social Meet tab label is top-level text');
assert(profileStatic.document.querySelector('.profile-tab-panel[data-panel="socialmeet"] #spotmeeting-inbox'), 'Social Meet panel owns spotmeeting-inbox');

const settingsMount = profileStatic.document.querySelector('#profileSettingsSocialMount');
assert(settingsMount, 'profile settings social mount exists');
assert(settingsMount.querySelector('#social-privacy-settings'), 'settings contains social privacy controls mount');
assert(!settingsMount.querySelector('#meet-invite-inbox, #spotmeeting-inbox, #confirmed-meets, #learning-circles, #circle-activity, #social-history'), 'settings mount only contains privacy controls, not Social Meet feature panels');
assertNoForbiddenUi(profileStatic.document.querySelector('.profile-tab-panel[data-panel="socialmeet"]'), 'profile Social Meet panel');
assertNoForbiddenUi(settingsMount, 'profile settings mount');

const appWindow = makeDom('<!doctype html><body><main><div id="placeCard" data-current-place-id="factory_memory"></div></main></body>', 'http://localhost/index.html');
appWindow.localStorage.setItem('HG_TEST_MODE', '1');
runScript(appWindow, 'js/social/HGSocialDemo.js');
runScript(appWindow, 'js/social/HGSocialDemoAdapter.js');
runScript(appWindow, 'js/social/HGSpotmeeting.js');
runScript(appWindow, 'js/ui/place-card.js');
runScript(appWindow, 'js/social/HGSpotmeetingPlaceCardDemo.js');

appWindow.HG_SocialDemo.seed({ resetFirst: true });
appWindow.PLACES = [{ id: 'factory_memory', name: 'Factory Memory' }];
const placeCard = appWindow.document.getElementById('placeCard');
placeCard.innerHTML = appWindow.renderHGSpotmeetingPlaceCardSection(appWindow.PLACES[0]);

assert(placeCard.querySelector('.pc-spotmeeting'), 'opened PlaceCard contains the Social Meet / Spotmeeting block');
assert.strictEqual(textOf(placeCard.querySelector('[data-hg-spotmeeting-action="quiz"]')), 'Foreslå quiz', 'PlaceCard exposes the quiz preset action');
const beforePending = appWindow.HG_Spotmeeting.getSpotmeetingInbox().pending.length;

click(appWindow, '[data-hg-spotmeeting-action="quiz"]', 'Kunnskapsmøte → Foreslå quiz');
const candidateButton = appWindow.document.querySelector('[data-hg-spotmeeting-send]');
assert(candidateButton, 'TEST_MODE renders demo candidates with Send forslag buttons');
assert.strictEqual(textOf(candidateButton), 'Send forslag', 'demo candidate can be selected via Send forslag');
click(appWindow, '[data-hg-spotmeeting-send]', 'Send forslag');

const afterPending = appWindow.HG_Spotmeeting.getSpotmeetingInbox().pending.length;
assert.strictEqual(afterPending, beforePending + 1, 'creating a preset invite increments pending inbox count in storage');
const pendingInvite = appWindow.HG_Spotmeeting.getSpotmeetingInbox().pending[0];
assert.strictEqual(pendingInvite.context.title, 'Factory Memory', 'pending invite stores context title');
assert.strictEqual(pendingInvite.context.contextType, 'quiz', 'pending invite stores context type');
assert.strictEqual(pendingInvite.presetLabel, 'Vil du ta denne quizen sammen?', 'pending invite stores preset label');
assertNoForbiddenUi(placeCard.querySelector('.pc-spotmeeting'), 'PlaceCard Spotmeeting block');

const storedSpotmeeting = appWindow.localStorage.getItem('hg_spotmeeting_v1');
const profileWindow = makeDom(`<!doctype html><body>
  <nav class="profile-tabs" role="tablist" aria-label="Profilfaner">
    <button class="profile-tab is-active" role="tab" aria-selected="true" data-tab="oversikt">Oversikt</button>
    <button class="profile-tab" role="tab" aria-selected="false" data-tab="socialmeet">Social Meet</button>
  </nav>
  <section class="profile-tab-panels">
    <div class="profile-tab-panel is-active" data-panel="oversikt"></div>
    <div class="profile-tab-panel" data-panel="socialmeet"><section id="profileSocialLayer"><div id="spotmeeting-inbox" aria-live="polite"></div></section></div>
  </section>
</body>`, 'http://localhost/profile.html');
profileWindow.localStorage.setItem('HG_TEST_MODE', '1');
profileWindow.localStorage.setItem('hg_spotmeeting_v1', storedSpotmeeting);
runScript(profileWindow, 'js/social/HGSpotmeeting.js');
runScript(profileWindow, 'js/profile.js');
profileWindow.initProfileTabs?.();

const renderInline = profileSource.match(/<script>\s*\(function\(\)\{([\s\S]*?window\.renderSpotmeetingInbox = renderSpotmeetingInbox;)[\s\S]*?\}\)\(\);\s*<\/script>/);
assert(renderInline, 'profile.html exposes renderSpotmeetingInbox');
vm.runInContext(`(function(){${renderInline[1]}; renderSpotmeetingInbox();}())`, profileWindow.__ctx, { filename: 'profile.html#renderSpotmeetingInbox' });
click(profileWindow, '.profile-tab[data-tab="socialmeet"]', 'Social Meet profile tab');

const profileInbox = profileWindow.document.getElementById('spotmeeting-inbox');
const pendingCard = profileInbox.querySelector('[data-spotmeeting-card][data-spotmeeting-status="pending"]');
assert(pendingCard, 'profile.html renders a pending invite card');
assert(pendingCard.textContent.includes('Factory Memory'), 'pending card shows context title');
assert(pendingCard.textContent.includes('quiz'), 'pending card shows context type');
assert(pendingCard.textContent.includes('Vil du ta denne quizen sammen?'), 'pending card shows preset label');
assert(pendingCard.querySelector('[data-spotmeeting-action="accept"]'), 'pending card renders accept action');
assert(pendingCard.querySelector('[data-spotmeeting-action="decline"]'), 'pending card renders decline action');
assert(pendingCard.querySelector('[data-spotmeeting-action="cancel"]'), 'pending card renders creator cancel action');
assert(!pendingCard.querySelector('[data-spotmeeting-action="complete"]'), 'pending card does not render complete action');
click(profileWindow, '[data-spotmeeting-action="accept"]', 'Godta pending spotmeeting');
const acceptedCard = profileInbox.querySelector('[data-spotmeeting-card][data-spotmeeting-status="accepted"]');
assert(acceptedCard, 'clicking accept moves the invite to accepted cards');
assert(acceptedCard.querySelector('[data-spotmeeting-action="complete"]'), 'accepted card renders complete action');
assert(acceptedCard.querySelector('[data-spotmeeting-action="cancel"]'), 'accepted card renders cancel action');
assert(!acceptedCard.querySelector('[data-spotmeeting-action="accept"]'), 'accepted card does not render accept action');
click(profileWindow, '[data-spotmeeting-action="complete"]', 'Marker gjennomført');
const completedCard = profileInbox.querySelector('[data-spotmeeting-card][data-spotmeeting-status="completed"]');
assert(completedCard, 'clicking complete moves the invite to completed cards');
assert(!completedCard.querySelector('[data-spotmeeting-action]'), 'completed card is read-only');
assert(profileWindow.document.querySelector('.profile-tab-panel[data-panel="socialmeet"]').classList.contains('is-active'), 'Social Meet tab opens its panel');
assertNoForbiddenUi(profileInbox, 'rendered spotmeeting inbox');

console.log('Social Meet Spotmeeting browser smoke passed (automated via jsdom).');
