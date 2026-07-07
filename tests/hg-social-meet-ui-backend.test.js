#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const repoRoot = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

function makeWindow(html = '<!doctype html><body></body>') {
  const dom = new JSDOM(html, { url: 'http://localhost/index.html', runScripts: 'outside-only', pretendToBeVisual: true });
  const window = dom.window;
  window.__ctx = dom.getInternalVMContext();
  window.console = console;
  return window;
}
function run(window, rel) { vm.runInContext(read(rel), window.__ctx, { filename: rel }); }
function text(node) { return String(node?.textContent || '').replace(/\s+/g, ' ').trim(); }
function assertNoForbidden(scope) {
  const html = String(scope.innerHTML || '').toLowerCase();
  for (const term of ['chat', 'fritekst-chat', 'live location', 'nearby users', 'followers', 'feed', 'dating']) {
    assert(!html.includes(term), `forbidden UI term found: ${term}`);
  }
  assert(!scope.querySelector('textarea, input[type="text"], [data-social-feed], [data-followers], [data-nearby], [data-live-location]'), 'forbidden social controls must not render');
}

(async () => {
  const fallbackWindow = makeWindow();
  fallbackWindow.HG_Spotmeeting = { getSpotmeetingInbox: () => ({ pending: [{ status: 'pending', targetDisplayName: 'Demo', context: { contextId: 'p1', contextType: 'place', title: 'Demo sted' }, presetLabel: 'Vil du sammenligne hva vi har lært om dette stedet?' }], accepted: [], completed: [], declined: [], cancelled: [], declinedCancelled: [] }) };
  run(fallbackWindow, 'js/social/HGSocialMeetUI.js');
  let result = await fallbackWindow.HG_SocialMeetUI.open({ filter: 'all', sourceSurface: 'globalMenu' });
  let sheet = fallbackWindow.document.getElementById('hgSocialMeetSheet');
  assert(result.ok, 'Social Meet UI opens without Supabase/backend config');
  assert(sheet && !sheet.hidden, 'Social Meet sheet is visible without backend config');
  assert(sheet.textContent.includes('Social Meet'), 'popup renders Social Meet title');
  for (const id of ['hg-meet-invite-inbox', 'hg-spotmeeting-inbox', 'hg-confirmed-meets', 'hg-social-progression', 'hg-learning-circles', 'hg-circle-activity', 'hg-social-history', 'hg-social-smoke-panel']) {
    assert(fallbackWindow.document.getElementById(id), `popup renders profile-like block: ${id}`);
  }
  assert(sheet.textContent.includes('MiniProfile'), 'popup keeps MiniProfile anchor');
  assert(sheet.textContent.includes('Demo sted'), 'local fallback data renders when backend is missing');
  assertNoForbidden(sheet);

  const backendWindow = makeWindow('<!doctype html><body><div id="placeCard" data-current-place-id="p1"></div><div id="pcEventsBox"><div class="pc-events-spotmeeting">Kunnskapsmøte</div></div></body>');
  backendWindow.PLACES = [{ id: 'p1', name: 'Backendplassen' }];
  const calls = [];
  backendWindow.HG_SocialMeetBackend = {
    async listInvites(options) {
      calls.push(options);
      return { ok: true, invites: [
        { status: 'pending', targetDisplayName: 'A', context: { contextId: 'p1', contextType: 'place', title: 'Backendplassen' }, presetLabel: 'Vil du møtes rundt dette temaet?' },
        { status: 'accepted', targetDisplayName: 'B', context: { contextId: 'p2', contextType: 'place', title: 'Annet sted' }, presetLabel: 'Vil du gå denne ruten en dag?' }
      ] };
    },
    health() { return { ok: true, mode: 'supabase' }; }
  };
  run(backendWindow, 'js/social/HGSocialMeetUI.js');
  result = await backendWindow.HG_SocialMeetUI.open({ filter: 'place', placeId: 'p1', sourceSurface: 'placeCardOnSite' });
  sheet = backendWindow.document.getElementById('hgSocialMeetSheet');
  assert(result.ok, 'Social Meet UI opens with backend adapter');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(calls[0])), { filter: 'place', placeId: 'p1', sourceSurface: 'placeCardOnSite' }, 'place filter sends correct placeId/sourceSurface to adapter');
  assert(sheet.textContent.includes('Backendplassen'), 'adapter invite for place renders');
  assert(!sheet.textContent.includes('Annet sted'), 'place-filtered popup excludes other places');
  const onsite = backendWindow.document.querySelector('[data-hg-social-meet-onsite="1"]');
  assert(onsite, 'På stedet renders Social Meet card');
  assert(onsite.textContent.includes('Social Meet'), 'På stedet card shows Social Meet');
  assert(onsite.textContent.includes('Åpne Social Meet'), 'På stedet card shows open link');
  assert(!text(backendWindow.document.getElementById('pcEventsBox')).includes('Kunnskapsmøte'), 'På stedet removes Kunnskapsmøte grid/content');
  await new Promise(resolve => backendWindow.setTimeout(resolve, 0));
  assert(backendWindow.document.querySelector('[data-hg-social-meet-onsite="1"]').textContent.includes('1 forslag venter her'), 'På stedet status updates from adapter');

  let changedCalls = calls.length;
  backendWindow.dispatchEvent(new backendWindow.CustomEvent('hg:spotmeetingChanged'));
  await new Promise(resolve => backendWindow.setTimeout(resolve, 0));
  assert(calls.length > changedCalls, 'hg:spotmeetingChanged refreshes open popup/status through adapter');

  const errorWindow = makeWindow();
  errorWindow.HG_SocialMeetBackend = { async listInvites() { throw new Error('supabase exploded with details'); } };
  errorWindow.HG_Spotmeeting = { getSpotmeetingInbox: () => ({ pending: [{ status: 'pending', context: { contextId: 'local', title: 'Lokal demo' }, presetLabel: 'Vil du ta denne quizen sammen?' }], accepted: [], completed: [], declined: [], cancelled: [], declinedCancelled: [] }) };
  run(errorWindow, 'js/social/HGSocialMeetUI.js');
  await errorWindow.HG_SocialMeetUI.open({ filter: 'all', sourceSurface: 'globalMenu' });
  sheet = errorWindow.document.getElementById('hgSocialMeetSheet');
  assert(sheet.textContent.includes('Kunne ikke laste Social Meet. Viser lokal demo hvis tilgjengelig.'), 'backend errors show friendly fallback text');
  assert(!sheet.textContent.includes('supabase exploded'), 'technical backend errors are hidden from user');
  assert(sheet.textContent.includes('Lokal demo'), 'local fallback renders after backend error');

  console.log('hg-social-meet-ui-backend ok');
})().catch(err => { console.error(err); process.exit(1); });
