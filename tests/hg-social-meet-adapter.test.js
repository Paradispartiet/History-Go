const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function boot(extra = {}) {
  global.window = global;
  global.document = { querySelector(){ return null; } };
  for (const key of [
    'HG_SocialMeetSupabaseClient',
    'HG_SocialMeetAdapter',
    'HG_SocialMeetBackend',
    'HG_SocialMeetFastApiClient',
    'HG_SOCIAL_MEET_BACKEND',
    'HG_SOCIAL_MEET_API',
    'HG_SOCIAL_MEET_SUPABASE',
    'HG_SUPABASE_CONFIG',
    'supabase',
    '__HG_SOCIAL_MEET_SUPABASE_CLIENT__',
    'HistoryGoAHAAuth'
  ]) delete global[key];
  Object.assign(global, extra);
  vm.runInThisContext(fs.readFileSync('js/social/HGSocialMeetSupabaseClient.js', 'utf8'), { filename:'HGSocialMeetSupabaseClient.js' });
  vm.runInThisContext(fs.readFileSync('js/social/HGSocialMeetAdapter.js', 'utf8'), { filename:'HGSocialMeetAdapter.js' });
  return global.HG_SocialMeetAdapter;
}

let adapter = boot();
assert.strictEqual(adapter.backendMode(), 'local');
assert(adapter.health().ok, 'local mode is healthy without production backend config');

adapter = boot({
  HistoryGoAHAAuth:{
    getSession:async()=>({access_token:'aha-token',user:{id:'aha-user'}})
  }
});
const ahaAuth = global.HG_SocialMeetSupabaseClient.getClient();
assert.strictEqual(ahaAuth.ok, true);
assert.strictEqual(ahaAuth.authSource, 'aha');
assert.strictEqual(global.HG_SocialMeetSupabaseClient.health().ahaAuthAvailable, true);

assert.strictEqual(adapter.normalizeContext({contextType:'place',contextId:'oslo',title:'Oslo'}).ok, true);
assert.strictEqual(adapter.normalizeContext({contextType:'place',contextId:'oslo',latitude:59}).reason, 'forbidden_privacy_field');
assert.strictEqual(adapter.normalizeContext({contextType:'person',contextId:'x'}).reason, 'invalid_context_type');

const mapped = adapter.mapInvite({
  inviteId:'i1',
  senderProfileId:'sender-profile',
  recipientProfileId:'recipient-profile',
  counterpartDisplayName:'Bjørn',
  context:{contextType:'place',contextId:'p1',title:'Place'},
  presetMessageId:'quiz_together',
  state:'pending'
});
assert.strictEqual(mapped.presetLabel, 'Vil du ta denne quizen sammen?');
assert.strictEqual(mapped.targetDisplayName, 'Bjørn');
assert(!JSON.stringify(mapped).includes('authUserId'));

adapter = boot({
  HG_SOCIAL_MEET_BACKEND:'supabase',
  HG_SOCIAL_MEET_SUPABASE:{
    enabled:true,
    url:'https://example.supabase.co',
    anonKey:'anon'
  },
  supabase:{
    createClient(){
      return { auth:{ getSession:async()=>({data:{session:{access_token:'legacy-token'}}}) } };
    }
  }
});
const dedicatedAuth = global.HG_SocialMeetSupabaseClient.getClient();
assert.strictEqual(dedicatedAuth.ok, true);
assert.strictEqual(dedicatedAuth.authSource, 'social-meet-supabase');
assert.strictEqual(adapter.backendMode(), 'local', 'invite/discovery writes no longer use direct Supabase mode');

(async()=>{
  const result = await adapter.createInvite(
    {contextType:'place',contextId:'p1',title:'Place',sourceSurface:'test'},
    'target',
    'quiz_together'
  );
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'backend_not_enabled');

  const bad = await adapter.createInvite(
    {contextType:'place',contextId:'p1'},
    'target',
    'Hei fritekst'
  );
  assert.strictEqual(bad.reason, 'invalid_preset_message');
  console.log('hg-social-meet-adapter ok');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
