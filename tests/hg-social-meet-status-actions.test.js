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
function tick(window) { return new Promise(resolve => window.setTimeout(resolve, 0)); }
function text(node) { return String(node?.textContent || '').replace(/\s+/g, ' ').trim(); }
function assertNoForbidden(scope) {
  const html = String(scope.innerHTML || '').toLowerCase();
  for (const term of ['chat', 'freetext', 'fritekst', 'live-posisjon', 'live position', 'nearby', 'feed', 'followers', 'dating']) {
    assert(!html.includes(term), `forbidden social/privacy term found: ${term}`);
  }
  assert(!scope.querySelector('textarea, input[type="text"], [data-social-feed], [data-followers], [data-nearby], [data-live-location]'), 'forbidden controls must not render');
}
function buttonsFor(card) { return [...card.querySelectorAll('[data-hg-social-meet-action]')].map(button => text(button)); }

(async () => {
  const window = makeWindow('<!doctype html><body><div id="placeCard" data-current-place-id="p1"></div><div id="pcEventsBox"><div class="pc-events-spotmeeting">Kunnskapsmøte Se kunnskapsmatcher Inviter til quiz Inviter til observasjon Inviter til rute</div></div></body>');
  let invites = [
    { inviteId: 'pending-1', status: 'pending', targetDisplayName: 'Pia', context: { contextId: 'p1', contextType: 'place', title: 'Pending sted' }, presetLabel: 'Vil du møtes rundt dette temaet?' },
    { inviteId: 'accepted-1', status: 'accepted', targetDisplayName: 'Ari', context: { contextId: 'p1', contextType: 'place', title: 'Accepted sted' }, presetLabel: 'Vil du gå denne ruten en dag?' },
    { inviteId: 'completed-1', status: 'completed', targetDisplayName: 'Com', context: { contextId: 'p1', contextType: 'place', title: 'Completed sted' }, presetLabel: 'Vil du ta denne quizen sammen?' },
    { inviteId: 'declined-1', status: 'declined', targetDisplayName: 'Dee', context: { contextId: 'p1', contextType: 'place', title: 'Declined sted' }, presetLabel: 'Vil du gjøre en felles observasjon her?' },
    { inviteId: 'cancelled-1', status: 'cancelled', targetDisplayName: 'Can', context: { contextId: 'p1', contextType: 'place', title: 'Cancelled sted' }, presetLabel: 'Vil du sammenligne hva vi har lært om dette stedet?' }
  ];
  const calls = [];
  window.HG_SocialMeetAdapter = {
    async listInvites() { calls.push(['list']); return { ok: true, invites }; },
    async acceptInvite(id) { calls.push(['accept', id]); invites = invites.map(invite => invite.inviteId === id ? { ...invite, status: 'accepted' } : invite); return { ok: true }; },
    async declineInvite(id) { calls.push(['decline', id]); invites = invites.map(invite => invite.inviteId === id ? { ...invite, status: 'declined' } : invite); return { ok: true }; },
    async cancelInvite(id) { calls.push(['cancel', id]); invites = invites.map(invite => invite.inviteId === id ? { ...invite, status: 'cancelled' } : invite); return { ok: true }; },
    async completeInvite(id) { calls.push(['complete', id]); invites = invites.map(invite => invite.inviteId === id ? { ...invite, status: 'completed' } : invite); return { ok: true }; },
    health() { return { ok: true, mode: 'test' }; }
  };
  window.HG_SocialMeetBackend = window.HG_SocialMeetAdapter;
  const events = [];
  window.addEventListener('hg:spotmeetingChanged', event => events.push(['changed', event.detail]));
  window.addEventListener('updateProfile', event => events.push(['profile', event.detail]));

  run(window, 'js/social/HGSocialMeetUI.js');
  await window.HG_SocialMeetUI.open({ filter: 'all', sourceSurface: 'globalMenu' });
  let sheet = window.document.getElementById('hgSocialMeetSheet');

  const cardByTitle = title => [...sheet.querySelectorAll('.hg-social-card')].find(card => card.textContent.includes(title));
  assert.deepStrictEqual(buttonsFor(cardByTitle('Pending sted')), ['Godta', 'Avslå'], 'pending invite shows accept and decline actions');
  assert.deepStrictEqual(buttonsFor(cardByTitle('Accepted sted')), ['Marker gjennomført', 'Avbryt'], 'accepted invite shows complete and cancel actions');
  assert.deepStrictEqual(buttonsFor(cardByTitle('Completed sted')), [], 'completed invite shows no actions');
  assert.deepStrictEqual(buttonsFor(cardByTitle('Declined sted')), [], 'declined invite shows no actions');
  assert.deepStrictEqual(buttonsFor(cardByTitle('Cancelled sted')), [], 'cancelled invite shows no actions');
  assert(sheet.textContent.includes('Gjennomført.'), 'completed invite shows completed status');
  assert(sheet.textContent.includes('Avslått.'), 'declined invite shows declined status');
  assert(sheet.textContent.includes('Avbrutt.'), 'cancelled invite shows cancelled status');

  cardByTitle('Pending sted').querySelector('[data-hg-social-meet-action="accept"]').click();
  await tick(window); await tick(window);
  assert(calls.some(call => call[0] === 'accept' && call[1] === 'pending-1'), 'Godta calls adapter acceptInvite');
  assert(events.some(([type, detail]) => type === 'changed' && detail.source === 'socialMeetStatusAction' && detail.inviteId === 'pending-1' && detail.status === 'accepted'), 'hg:spotmeetingChanged fires after status change');
  assert(events.some(([type, detail]) => type === 'profile' && detail.source === 'socialMeetStatusAction'), 'updateProfile fires after status change');
  sheet = window.document.getElementById('hgSocialMeetSheet');
  assert(buttonsFor(cardByTitle('Pending sted')).includes('Marker gjennomført'), 'popup rerenders after status change');

  cardByTitle('Accepted sted').querySelector('[data-hg-social-meet-action="cancel"]').click();
  await tick(window); await tick(window);
  assert(calls.some(call => call[0] === 'cancel' && call[1] === 'accepted-1'), 'Avbryt calls adapter cancelInvite');

  cardByTitle('Pending sted').querySelector('[data-hg-social-meet-action="complete"]').click();
  await tick(window); await tick(window);
  assert(calls.some(call => call[0] === 'complete' && call[1] === 'pending-1'), 'Marker gjennomført calls adapter completeInvite');

  invites = [{ inviteId: 'decline-1', status: 'pending', targetDisplayName: 'Ny', context: { contextId: 'p1', contextType: 'place', title: 'Decline me' }, presetLabel: 'Vil du møtes rundt dette temaet?' }];
  await window.HG_SocialMeetUI.open({ filter: 'all', sourceSurface: 'globalMenu' });
  sheet = window.document.getElementById('hgSocialMeetSheet');
  cardByTitle('Decline me').querySelector('[data-hg-social-meet-action="decline"]').click();
  await tick(window); await tick(window);
  assert(calls.some(call => call[0] === 'decline' && call[1] === 'decline-1'), 'Avslå calls adapter declineInvite');

  const onsiteText = text(window.document.getElementById('pcEventsBox'));
  assert(onsiteText.includes('Social Meet'), 'På stedet keeps Social Meet status/link');
  assert(onsiteText.includes('Åpne Social Meet'), 'På stedet keeps open Social Meet link');
  assert(!onsiteText.includes('Se kunnskapsmatcher'), 'Kunnskapsmøte grid does not return to På stedet');
  assert(!onsiteText.includes('Inviter til quiz'), 'quiz invite shortcut does not return to På stedet');
  assertNoForbidden(sheet);

  const fallbackWindow = makeWindow();
  let localStatus = 'pending';
  const localCalls = [];
  fallbackWindow.HG_Spotmeeting = {
    getSpotmeetingInbox: () => ({ pending: localStatus === 'pending' ? [{ inviteId: 'local-1', status: 'pending', targetDisplayName: 'Lokal', context: { contextId: 'local', title: 'Lokal' }, presetLabel: 'Preset' }] : [], accepted: localStatus === 'accepted' ? [{ inviteId: 'local-1', status: 'accepted', targetDisplayName: 'Lokal', context: { contextId: 'local', title: 'Lokal' }, presetLabel: 'Preset' }] : [], completed: [], declined: [], cancelled: [], declinedCancelled: [] }),
    acceptSpotmeetingInvite(id) { localCalls.push(['localAccept', id]); localStatus = 'accepted'; return { ok: true }; },
    declineSpotmeetingInvite(id) { localCalls.push(['localDecline', id]); localStatus = 'declined'; return { ok: true }; },
    cancelSpotmeetingInvite(id) { localCalls.push(['localCancel', id]); localStatus = 'cancelled'; return { ok: true }; },
    confirmSpotmeetingCompleted(id) { localCalls.push(['localComplete', id]); localStatus = 'completed'; return { ok: true }; }
  };
  run(fallbackWindow, 'js/social/HGSocialMeetUI.js');
  await fallbackWindow.HG_SocialMeetUI.open({ filter: 'all', sourceSurface: 'globalMenu' });
  fallbackWindow.document.querySelector('[data-hg-social-meet-action="accept"]').click();
  await tick(fallbackWindow); await tick(fallbackWindow);
  assert.deepStrictEqual(localCalls[0], ['localAccept', 'local-1'], 'local fallback is used when adapter is missing');

  console.log('hg-social-meet-status-actions ok');
})().catch(err => { console.error(err); process.exit(1); });
