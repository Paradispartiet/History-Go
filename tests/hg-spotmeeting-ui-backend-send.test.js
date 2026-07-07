#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const repoRoot = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

function makeWindow() {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="factory_memory"></div></body>', { url: 'http://localhost/index.html', runScripts: 'outside-only', pretendToBeVisual: true });
  const window = dom.window;
  window.__ctx = dom.getInternalVMContext();
  window.console = console;
  window.showToast = () => {};
  window.localStorage.setItem('HG_TEST_MODE', '1');
  for (const rel of ['js/social/HGSocialDemo.js', 'js/social/HGSocialDemoAdapter.js', 'js/social/HGSpotmeeting.js', 'js/social/HGSpotmeetingUI.js']) {
    vm.runInContext(read(rel), window.__ctx, { filename: rel });
  }
  window.HG_SocialDemo.seed({ resetFirst: true });
  return window;
}

function firstSendButton(window) {
  const button = window.document.querySelector('[data-hg-spotmeeting-send]');
  assert(button, 'renders a Send forslag button');
  return button;
}

(async () => {
  const backendWindow = makeWindow();
  let backendCall = null;
  let changed = 0;
  let profileUpdated = 0;
  let socialMeetOpenOptions = null;
  backendWindow.addEventListener('hg:spotmeetingChanged', event => {
    changed += 1;
    assert.strictEqual(event.detail.presetMessageId, 'quiz_together', 'changed event carries presetMessageId');
  });
  backendWindow.addEventListener('updateProfile', () => { profileUpdated += 1; });
  backendWindow.HG_SocialMeetBackend = {
    backendMode: () => 'supabase',
    createInvite(context, targetUserId, presetMessageId) {
      backendCall = { context, targetUserId, presetMessageId };
      return { ok: true, invite: { inviteId: 'backend-1', targetUserId, context, presetMessageId, status: 'pending' } };
    }
  };
  backendWindow.HG_SocialMeetUI = { open(options) { socialMeetOpenOptions = options; return { ok: true }; } };
  backendWindow.HG_SpotmeetingUI.open({ contextType: 'place', contextId: 'factory_memory', title: 'Factory Memory', sourceSurface: 'placeCardPeople', preferredAction: 'quiz' });
  const beforeLocal = backendWindow.HG_Spotmeeting.getSpotmeetingInbox().pending.length;
  await backendWindow.HG_SpotmeetingUI.sendInvite(firstSendButton(backendWindow));
  assert(backendCall, 'HGSpotmeetingUI uses HG_SocialMeetBackend.createInvite when backend exists');
  assert.strictEqual(backendCall.targetUserId, 'demo-industrial-historian', 'targetUserId is forwarded to backend');
  assert.strictEqual(backendCall.presetMessageId, 'quiz_together', 'presetMessageId is forwarded to backend');
  assert.strictEqual(JSON.stringify(backendCall.context), JSON.stringify({ contextType: 'quiz', contextId: 'factory_memory', title: 'Factory Memory', sourceSurface: 'placeCardPeople' }), 'normalized context is forwarded to backend');
  assert(!('message' in backendCall.context), 'no message/free text field is sent');
  assert(!('body' in backendCall.context), 'no body/free text field is sent');
  assert(!('chat_text' in backendCall.context), 'no chat_text/free text field is sent');
  assert.strictEqual(backendWindow.HG_Spotmeeting.getSpotmeetingInbox().pending.length, beforeLocal, 'backend send does not also create a local invite');
  assert.strictEqual(changed, 1, 'hg:spotmeetingChanged fires after backend send');
  assert.strictEqual(profileUpdated, 1, 'updateProfile fires after backend send');
  assert(backendWindow.document.getElementById('hgSpotmeetingSheet').textContent.includes('Forslag sendt. Følg opp i Social Meet.'), 'sent state is shown after backend send');
  backendWindow.document.querySelector('[data-hg-spotmeeting-social-followup]').dispatchEvent(new backendWindow.MouseEvent('click', { bubbles: true, cancelable: true }));
  assert.strictEqual(JSON.stringify(socialMeetOpenOptions), JSON.stringify({ filter: 'all', sourceSurface: 'spotmeetingSent' }), 'quiz context opens Social Meet with all filter');

  const fallbackWindow = makeWindow();
  fallbackWindow.HG_SpotmeetingUI.open({ contextType: 'place', contextId: 'factory_memory', title: 'Factory Memory', sourceSurface: 'placeCardPeople', preferredAction: 'quiz' });
  const fallbackBefore = fallbackWindow.HG_Spotmeeting.getSpotmeetingInbox().pending.length;
  await fallbackWindow.HG_SpotmeetingUI.sendInvite(firstSendButton(fallbackWindow));
  assert.strictEqual(fallbackWindow.HG_Spotmeeting.getSpotmeetingInbox().pending.length, fallbackBefore + 1, 'falls back to HG_Spotmeeting.createSpotmeetingInvite when backend is missing');

  const failingBackendWindow = makeWindow();
  failingBackendWindow.HG_SocialMeetBackend = { backendMode: () => 'supabase', createInvite() { return { ok: false, reason: 'not_authenticated' }; } };
  failingBackendWindow.HG_SpotmeetingUI.open({ contextType: 'place', contextId: 'factory_memory', title: 'Factory Memory', sourceSurface: 'placeCardPeople', preferredAction: 'quiz' });
  const failBefore = failingBackendWindow.HG_Spotmeeting.getSpotmeetingInbox().pending.length;
  await failingBackendWindow.HG_SpotmeetingUI.sendInvite(firstSendButton(failingBackendWindow));
  assert.strictEqual(failingBackendWindow.HG_Spotmeeting.getSpotmeetingInbox().pending.length, failBefore + 1, 'falls back to local when backend is unavailable/not authenticated');

  const source = read('js/social/HGSpotmeetingUI.js');
  for (const forbidden of ['nearby-users', 'followers', 'data-social-feed', 'data-live-location']) {
    assert(!source.includes(forbidden), `does not introduce forbidden social/privacy feature: ${forbidden}`);
  }
  console.log('hg-spotmeeting-ui-backend-send ok');
})().catch(error => { console.error(error); process.exit(1); });
