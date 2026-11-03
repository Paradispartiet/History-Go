#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

const app = fs.readFileSync('js/app.js', 'utf8');
assert(app.includes('loadHGSocialMeetProfileBridge'), 'Map must load the existing Social Meet profile consent bridge');
assert(app.indexOf('loadHGSocialMeetProfileBridge') < app.indexOf('loadHGSpotmeetingUI'), 'Consent bridge must be available before Møtes UI');

async function tick(win) {
  await new Promise(resolve => win.setTimeout(resolve, 10));
}

async function run() {
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'https://paradispartiet.github.io/History-Go/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const win = dom.window;
  let published = false;
  let publishCalls = 0;
  win.HG_Spotmeeting = {};
  win.HG_SocialMeetBackend = {
    backendMode: () => 'fastapi',
    getMyProfile: async () => ({ ok: true, profile: { profileVisibility: published ? 'discoverable' : 'draft' } }),
    discoverCandidates: async () => ({ ok: false, reason: 'backend_not_enabled', suggestions: [] })
  };
  win.HG_SocialMeetProfileBridge = {
    publish: async () => {
      publishCalls++;
      published = true;
      return { ok: true, profile: { profileVisibility: 'discoverable' } };
    }
  };
  win.eval(fs.readFileSync('js/social/HGSpotmeetingUI.js', 'utf8'));
  win.HG_SpotmeetingUI.open({
    contextType: 'place',
    contextId: 'test_place',
    title: 'Teststed',
    sourceSurface: 'placeCardOnSite',
    preferredAction: 'here'
  });
  await tick(win);
  const sheet = win.document.getElementById('hgSpotmeetingSheet');
  const consentButton = sheet.querySelector('[data-hg-social-profile-publish-here]');
  assert(consentButton, 'Møtes must offer explicit profile publication when the profile is private');
  assert.match(sheet.textContent, /Profilen din er ikke synlig ennå/);
  assert.match(sheet.textContent, /Stedsstatus er et separat, frivillig valg/);
  assert.equal(publishCalls, 0, 'Opening Møtes must never auto-publish an account');
  assert.equal(sheet.querySelector('[data-hg-place-status-set]'), null, 'Place sharing must be unavailable until the profile is published');

  consentButton.click();
  await tick(win);
  assert.equal(publishCalls, 1, 'Only a deliberate click publishes the profile');
  assert(sheet.querySelector('[data-hg-place-status-set]'), 'After publication a separate, voluntary place-status action becomes available');
  assert.match(sheet.textContent, /Personmatching er ikke aktivert på serveren ennå/);
  assert.equal(win.document.querySelector('input[type="text"]'), null, 'No free-text person search or GPS fields');
  dom.window.close();

  const noServerDom = new JSDOM('<!doctype html><body></body>', {
    url: 'https://paradispartiet.github.io/History-Go/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const noServer = noServerDom.window;
  noServer.HG_Spotmeeting = {};
  noServer.HG_SocialMeetBackend = {
    backendMode: () => 'fastapi',
    getMyProfile: async () => ({ ok: false, reason: 'backend_not_enabled' }),
    discoverCandidates: async () => ({ ok: false, reason: 'backend_not_enabled', suggestions: [] })
  };
  noServer.eval(fs.readFileSync('js/social/HGSpotmeetingUI.js', 'utf8'));
  noServer.HG_SpotmeetingUI.open({
    contextType: 'place', contextId: 'test_place', title: 'Teststed', preferredAction: 'here'
  });
  await tick(noServer);
  assert.match(noServer.document.body.textContent, /Andre kontoer kan ikke vises før dette er klart/);
  assert.equal(noServer.document.querySelector('[data-hg-social-profile-publish-here]'), null, 'Do not offer account publication when server is disabled');
  noServerDom.window.close();
  console.log('hg-social-meet-map-opt-in ok');
}

run().catch(error => { console.error(error); process.exitCode = 1; });
