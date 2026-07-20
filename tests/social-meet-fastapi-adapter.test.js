#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const repoRoot = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

function makeWindow(html = '<!doctype html><body></body>') {
  const dom = new JSDOM(html, {
    url: 'http://localhost/index.html',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.__ctx = dom.getInternalVMContext();
  window.console = console;
  window.showToast = () => {};
  return window;
}

function runScript(window, rel) {
  vm.runInContext(read(rel), window.__ctx, { filename: rel });
}

function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function fakeFastApiClient(overrides = {}) {
  return {
    health: () => ({ ok: true, enabled: true, hasBaseUrl: true, baseUrl: 'https://api.example.test' }),
    getMe: async () => ({ ok: true, status: 200, data: { profileId: 'profile-me' } }),
    upsertProfile: async (payload) => ({ ok: true, status: 200, data: payload }),
    discoverCandidates: async () => ({
      ok: true,
      status: 200,
      data: {
        contextType: 'place',
        contextId: 'akershus_festning',
        generatedAt: '2026-07-20T18:00:00Z',
        staleAfterSeconds: 300,
        candidates: [
          {
            profile: {
              profileId: '11111111-1111-4111-8111-111111111111',
              displayName: 'Ada',
              preferredThemes: ['history']
            },
            matchReasons: ['contextTheme', 'sharedLearningGoal']
          }
        ]
      }
    }),
    createInvite: async (payload) => ({
      ok: true,
      status: 201,
      data: {
        inviteId: '22222222-2222-4222-8222-222222222222',
        senderProfileId: '33333333-3333-4333-8333-333333333333',
        recipientProfileId: payload.recipientProfileId,
        context: payload.context,
        presetMessageId: payload.presetMessageId,
        state: 'pending',
        createdAt: '2026-07-20T18:00:00Z',
        updatedAt: '2026-07-20T18:00:00Z',
        expiresAt: '2026-08-03T18:00:00Z',
        version: 1,
        syncVersion: 10,
        actorCanAct: { canCancel: true }
      }
    }),
    listInbox: async () => ({ ok: true, status: 200, data: { invites: [], cursor: 0, hasMore: false } }),
    transitionInvite: async () => ({ ok: false, status: 409, reason: 'conflict' }),
    ...overrides
  };
}

async function testAdapterUsesPublicProfileIdsAndFastApiPayloads() {
  const window = makeWindow();
  window.HG_SOCIAL_MEET_BACKEND = 'fastapi';
  window.HG_SOCIAL_MEET_API = { enabled: true, baseUrl: 'https://api.example.test' };
  let createdPayload = null;
  window.HG_SocialMeetFastApiClient = fakeFastApiClient({
    createInvite: async (payload) => {
      createdPayload = payload;
      return fakeFastApiClient().createInvite(payload);
    }
  });

  runScript(window, 'js/social/HGSocialMeetAdapter.js');

  assert.strictEqual(window.HG_SocialMeetAdapter.backendMode(), 'fastapi');
  const discovery = await window.HG_SocialMeetAdapter.discoverCandidates(
    {
      contextType: 'place',
      contextId: 'akershus_festning',
      title: 'Akershus festning',
      reason: 'Kunnskapsmøte rundt festningen',
      sourceSurface: 'placeCardPeople'
    },
    { signals: { themeTags: ['history'], learningGoalTags: ['architecture'] } }
  );

  assert.strictEqual(discovery.ok, true);
  assert.strictEqual(discovery.suggestions.length, 1);
  assert.strictEqual(
    discovery.suggestions[0].targetUserId,
    '11111111-1111-4111-8111-111111111111',
    'candidate target is the public profile id'
  );
  assert(discovery.suggestions[0].reason.includes('Matcher temaet her'));
  assert(!JSON.stringify(discovery).includes('authUserId'));

  const invite = await window.HG_SocialMeetAdapter.createInvite(
    {
      contextType: 'place',
      contextId: 'akershus_festning',
      title: 'Akershus festning',
      reason: 'Kunnskapsmøte rundt festningen',
      sourceSurface: 'placeCardPeople'
    },
    discovery.suggestions[0].targetUserId,
    'compare_place_learning'
  );

  assert.strictEqual(invite.ok, true);
  assert(createdPayload, 'FastAPI invite payload was captured');
  assert.strictEqual(createdPayload.recipientProfileId, discovery.suggestions[0].targetUserId);
  assert.strictEqual(createdPayload.context.reason, 'Kunnskapsmøte rundt festningen');
  assert(String(createdPayload.idempotencyKey).startsWith('spotmeeting-'));
  assert.strictEqual(invite.invite.targetUserId, discovery.suggestions[0].targetUserId);
  assert.strictEqual(invite.invite.backend, 'fastapi');
}

async function testLazyLoadsTypedClientOnce() {
  const window = makeWindow();
  window.HG_SOCIAL_MEET_BACKEND = 'fastapi';
  window.HG_SOCIAL_MEET_API = { enabled: true, baseUrl: 'https://api.example.test' };
  const originalAppend = window.document.head.appendChild.bind(window.document.head);
  let scriptLoads = 0;

  window.document.head.appendChild = (node) => {
    if (node?.dataset?.hgSocialMeetFastapiClient === '1') {
      scriptLoads += 1;
      assert(node.src.endsWith('/dist/web/hgSocialMeetFastApiClient.js'));
      window.HG_SocialMeetFastApiClient = fakeFastApiClient();
      queueMicrotask(() => node.dispatchEvent(new window.Event('load')));
    }
    return originalAppend(node);
  };

  runScript(window, 'js/social/HGSocialMeetAdapter.js');
  const first = await window.HG_SocialMeetAdapter.getMyProfile();
  const second = await window.HG_SocialMeetAdapter.getMyProfile();

  assert.strictEqual(first.ok, true);
  assert.strictEqual(second.ok, true);
  assert.strictEqual(scriptLoads, 1, 'typed FastAPI client bundle is loaded only once');
}

async function testProductionFailureDoesNotCreateLocalInvite() {
  const window = makeWindow(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="factory_memory"></div>
  </body>`);
  window.HG_SOCIAL_MEET_BACKEND = 'fastapi';
  window.HG_SOCIAL_MEET_API = { enabled: true, baseUrl: 'https://api.example.test' };
  window.PLACES = [{ id: 'factory_memory', name: 'Factory Memory', category: 'historie' }];
  window.HG_SocialMeetFastApiClient = fakeFastApiClient({
    createInvite: async () => ({ ok: false, status: 429, reason: 'rate_limited' })
  });

  runScript(window, 'js/social/HGSpotmeeting.js');
  runScript(window, 'js/social/HGSocialMeetAdapter.js');
  runScript(window, 'js/social/HGSpotmeetingUI.js');

  window.HG_SpotmeetingUI.open({
    contextType: 'place',
    contextId: 'factory_memory',
    title: 'Factory Memory',
    reason: 'Kunnskapsmøte rundt dette stedet',
    sourceSurface: 'placeCardPeople'
  });
  await tick();
  await tick();

  const sendButton = window.document.querySelector('[data-hg-spotmeeting-send]');
  assert(sendButton, 'production FastAPI discovery renders a send button');
  const before = window.HG_Spotmeeting.getSpotmeetingInbox().pending.length;
  sendButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await tick();
  await tick();

  const after = window.HG_Spotmeeting.getSpotmeetingInbox().pending.length;
  assert.strictEqual(after, before, 'server failure must not create a local production invite');
  assert(window.document.getElementById('hgSpotmeetingSheet').textContent.includes('Kunne ikke sende møteforslag'));
}

(async () => {
  await testAdapterUsesPublicProfileIdsAndFastApiPayloads();
  await testLazyLoadsTypedClientOnce();
  await testProductionFailureDoesNotCreateLocalInvite();
  console.log('Social Meet FastAPI adapter tests passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
