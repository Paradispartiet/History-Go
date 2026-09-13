const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const script = fs.readFileSync('js/social/HGSocialMeetProfileBridge.js', 'utf8');

async function tick(){ await new Promise(resolve => setTimeout(resolve, 0)); }

async function run(){
  const dom = new JSDOM('<!doctype html><body><div id="social-meet-server-status"></div></body>', {
    url:'https://history-go.test/',
    runScripts:'outside-only'
  });
  const w = dom.window;
  let published = null;
  let unpublished = false;
  let privacyPatch = null;

  w.HGUserProfile = { getDisplayName: () => 'Ada Historiker' };
  w.HG_SocialSignals = {
    getPublicProfileSeed: () => ({
      knowledgeDomains:['historie','politikk'],
      learnedConcepts:['grunnlov','demokrati'],
      favoritePlaces:['eidsvolls_plass'],
      quizStrengths:[{quizId:'q1',strength:3}]
    })
  };
  w.HG_PublicProfileReadModel = {
    getReadModel: () => ({identity:{displayName:'Ada Historiker'},privacy:{publicSafe:true}}),
    validate: () => ({publicSafe:true})
  };
  w.getPrivacySettings = () => ({publicProfile:false,visibleInMatchLists:false,allowMeetInvites:false});
  w.savePrivacySettings = (_userId, patch) => { privacyPatch = patch; return patch; };
  w.HG_SocialMeetAdapter = {
    backendMode: () => 'fastapi',
    health: () => ({ok:true,mode:'fastapi'}),
    getMyProfile: async () => ({ok:true,profile:{profileVisibility:'private'}}),
    upsertMyProfile: async payload => {
      published = payload;
      return {ok:true,profile:{profileVisibility:'discoverable',profileId:'p1'}};
    },
    unpublishMyProfile: async () => {
      unpublished = true;
      return {ok:true,profile:{profileVisibility:'private',profileId:'p1'}};
    }
  };

  w.eval(script);
  await tick();

  const bridge = w.HG_SocialMeetProfileBridge;
  assert(bridge);
  const built = bridge.buildProfilePayload('discoverable');
  assert.strictEqual(built.ok, true);
  assert.strictEqual(built.payload.displayName, 'Ada Historiker');
  assert.strictEqual(built.payload.profileVisibility, 'discoverable');
  assert.strictEqual(built.payload.consentVersion, 'social_meet_identity_v1');
  assert.strictEqual(built.payload.previewConfirmed, true);
  assert.deepStrictEqual(Array.from(built.payload.preferredThemes), ['historie','politikk']);
  assert.deepStrictEqual(Array.from(built.payload.interestPlaces), ['eidsvolls_plass']);
  const serialized = JSON.stringify(built.payload).toLowerCase();
  for (const forbidden of ['latitude','longitude','gps','presence','lastseen','distance','nearby']) {
    assert(!serialized.includes(forbidden), 'payload must not contain '+forbidden);
  }

  const publish = await bridge.publish();
  assert.strictEqual(publish.ok, true);
  assert(published);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(privacyPatch)), {
    publicProfile:true,
    visibleInMatchLists:true,
    allowMeetInvites:true
  });
  assert.strictEqual(bridge.health().discoverable, true);
  assert(w.document.getElementById('social-meet-server-status').textContent.includes('ikke hvem som fysisk er på stedet'));

  const unpublish = await bridge.unpublish();
  assert.strictEqual(unpublish.ok, true);
  assert.strictEqual(unpublished, true);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(privacyPatch)), {
    publicProfile:false,
    visibleInMatchLists:false,
    allowMeetInvites:false
  });

  dom.window.close();

  const localDom = new JSDOM('<!doctype html><body><div id="social-meet-server-status"></div></body>', {
    url:'https://history-go.test/',
    runScripts:'outside-only'
  });
  localDom.window.HG_SocialMeetAdapter = {backendMode:()=> 'local',health:()=>({ok:true,mode:'local'})};
  localDom.window.eval(script);
  assert(localDom.window.document.body.textContent.includes('Ekte personmatching er ikke koblet til server ennå.'));
  localDom.window.close();

  console.log('Social Meet profile bridge tests passed.');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
