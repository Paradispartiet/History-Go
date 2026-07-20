(function(){
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const CONTEXT_TYPES = Object.freeze(['place','quiz','route','observation','topic','circle']);
  const STATUSES = Object.freeze(['pending','accepted','declined','cancelled','completed']);
  const PRESETS = Object.freeze([
    {presetMessageId:'quiz_together',label:'Vil du ta denne quizen sammen?'},
    {presetMessageId:'route_one_day',label:'Vil du gå denne ruten en dag?'},
    {presetMessageId:'compare_place_learning',label:'Vil du sammenligne hva vi har lært om dette stedet?'},
    {presetMessageId:'shared_observation',label:'Vil du gjøre en felles observasjon her?'},
    {presetMessageId:'meet_topic',label:'Vil du møtes rundt dette temaet?'}
  ]);
  const FORBIDDEN = Object.freeze(['gps','latitude','longitude','coords','liveLocation','lastSeen','nearby','distance','followers','following','feed','chat','freeText','message','body','comment','chatText','publicVisitHistory','visitedPlaces']);
  const FORBIDDEN_LOOKUP = new Set(FORBIDDEN.map(x => x.toLowerCase()));
  const MATCH_REASON_LABELS = Object.freeze({
    contextInterestPlace:'Har valgt dette stedet som interesse',
    contextTheme:'Matcher temaet her',
    contextEra:'Deler interesse for epoken',
    contextTopic:'Matcher kunnskapstemaet',
    contextRouteCategory:'Matcher rutetemaet',
    contextQuizTopic:'Matcher quiztemaet',
    contextLearningGoal:'Har relevant læringsmål',
    sharedTheme:'Dere deler tema-interesser',
    sharedEra:'Dere deler epoke-interesser',
    sharedLearningGoal:'Dere deler læringsmål'
  });
  let fastApiLoadPromise = null;

  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function list(v){ return Array.isArray(v) ? v : []; }
  function str(v){ return String(v || '').trim(); }
  function presetLabel(id){ return PRESETS.find(p => p.presetMessageId === id)?.label || id; }

  function scanForbiddenFields(value){
    const found=[]; const seen=new WeakSet();
    (function scan(v,path){
      if(!v || typeof v !== 'object' || seen.has(v)) return;
      seen.add(v);
      Object.keys(v).forEach(k => { const p = path ? `${path}.${k}` : k; if (FORBIDDEN_LOOKUP.has(String(k).toLowerCase())) found.push({ field:k, path:p }); scan(v[k], p); });
    }(value,''));
    return { ok: found.length === 0, blockers: found };
  }

  function normalizeContext(context){
    const privacy = scanForbiddenFields(context);
    if (!privacy.ok) return { ok:false, reason:'forbidden_privacy_field', privacy };
    const contextType = str(context?.contextType || context?.context_type);
    const contextId = str(context?.contextId || context?.context_id);
    if (!CONTEXT_TYPES.includes(contextType)) return { ok:false, reason:'invalid_context_type' };
    if (!contextId) return { ok:false, reason:'missing_context_id' };
    return {
      ok:true,
      context:{
        contextType,
        contextId,
        title:str(context?.title || context?.contextTitle || context?.context_title || contextId),
        reason:str(context?.reason || context?.contextReason || context?.context_reason || 'Kunnskapsmøte rundt denne History GO-konteksten'),
        sourceSurface:str(context?.sourceSurface || context?.source_surface || 'socialMeet')
      }
    };
  }

  function mapInvite(row){
    if (!row) return null;
    const presetMessageId = row.preset_message_id || row.presetMessageId;
    const senderProfileId = row.sender_profile_id || row.senderProfileId || row.created_by || row.createdByUserId;
    const recipientProfileId = row.recipient_profile_id || row.recipientProfileId || row.target_user_id || row.targetUserId;
    return {
      inviteId: row.id || row.inviteId,
      createdByUserId: senderProfileId || '',
      targetUserId: recipientProfileId || '',
      senderProfileId: senderProfileId || '',
      recipientProfileId: recipientProfileId || '',
      targetDisplayName: row.targetDisplayName || '',
      context: {
        contextType: row.context_type || row.context?.contextType,
        contextId: row.context_id || row.context?.contextId,
        title: row.context_title || row.context?.title || '',
        reason: row.context_reason || row.context?.reason || '',
        sourceSurface: row.source_surface || row.context?.sourceSurface || ''
      },
      presetMessageId,
      presetLabel: presetLabel(presetMessageId),
      status: row.state || row.status,
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt,
      expiresAt: row.expires_at || row.expiresAt,
      version: row.version,
      syncVersion: row.sync_version || row.syncVersion,
      actorCanAct: row.actor_can_act || row.actorCanAct || {},
      private: true,
      backend: row.backend || 'fastapi'
    };
  }

  function configuredBackend(){
    return str(root.HG_SOCIAL_MEET_BACKEND || root.HG_SOCIAL_MEET_API?.backend || root.HG_SOCIAL_MEET_SUPABASE?.backend || root.HG_SOCIAL_MEET_SUPABASE?.mode).toLowerCase();
  }

  function wantsFastApi(){
    const config = root.HG_SOCIAL_MEET_API || root.HG_BACKEND_CONFIG || {};
    return configuredBackend() === 'fastapi' || config.enabled === true || Boolean(str(config.baseUrl || config.apiBaseUrl || config.url));
  }

  function backendMode(){
    return wantsFastApi() ? 'fastapi' : 'local';
  }

  function ensureFastApiClient(){
    if (root.HG_SocialMeetFastApiClient) return Promise.resolve(root.HG_SocialMeetFastApiClient);
    if (!wantsFastApi()) return Promise.resolve(null);
    if (fastApiLoadPromise) return fastApiLoadPromise;
    if (!root.document?.createElement) return Promise.resolve(null);

    fastApiLoadPromise = new Promise(resolve => {
      const script = root.document.createElement('script');
      script.src = 'dist/web/hgSocialMeetFastApiClient.js';
      script.async = true;
      script.dataset.hgSocialMeetFastapiClient = '1';
      const finish = () => resolve(root.HG_SocialMeetFastApiClient || null);
      script.addEventListener('load', finish, { once:true });
      script.addEventListener('error', finish, { once:true });
      (root.document.head || root.document.documentElement)?.appendChild(script);
    });
    return fastApiLoadPromise;
  }

  function fastApi(){
    const client = root.HG_SocialMeetFastApiClient;
    const health = client?.health?.() || { ok:false, reason:'fastapi_client_missing' };
    if (!client || !health.ok || !health.enabled) {
      return { ok:false, reason:health.reason || 'backend_not_enabled', health };
    }
    return { ok:true, client, health };
  }

  async function resolveFastApi(){
    await ensureFastApiClient();
    return fastApi();
  }

  function sb(){
    const res = root.HG_SocialMeetSupabaseClient?.getClient?.() || { ok:false, reason:'supabase_client_missing' };
    if (!res.ok) throw Object.assign(new Error(res.reason), { reason: res.reason, config: res.config });
    return res.client;
  }

  function apiResult(result, key, mapper){
    if (!result?.ok) return { ok:false, reason:result?.reason || 'backend_error', status:result?.status, detail:result?.detail };
    return { ok:true, [key]: mapper ? mapper(result.data) : result.data };
  }

  async function getUserId(client){
    const res = await client.auth?.getUser?.();
    return res?.data?.user?.id || null;
  }

  async function getMyProfile(){
    if (backendMode() === 'fastapi') {
      const resolved = await resolveFastApi();
      if (!resolved.ok) return resolved;
      return apiResult(await resolved.client.getMe(), 'profile');
    }
    const client = sb(); const userId = await getUserId(client); if (!userId) return { ok:false, reason:'not_authenticated' };
    const { data, error } = await client.from('hg_profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) return { ok:false, reason:'supabase_error', error };
    return { ok:true, profile:data || null };
  }

  async function upsertMyProfile(profile){
    const privacy = scanForbiddenFields(profile); if (!privacy.ok) return { ok:false, reason:'forbidden_privacy_field', privacy };
    if (backendMode() === 'fastapi') {
      const resolved = await resolveFastApi();
      if (!resolved.ok) return resolved;
      const displayName = str(profile?.displayName || profile?.display_name);
      if (!displayName) return { ok:false, reason:'missing_display_name' };
      const payload = {
        displayName,
        avatarRef: profile?.avatarRef ?? profile?.avatar_ref ?? profile?.avatarUrl ?? profile?.avatar_url ?? null,
        shortBio: profile?.shortBio ?? profile?.short_bio ?? null,
        preferredThemes: list(profile?.preferredThemes ?? profile?.preferred_themes),
        favoriteEras: list(profile?.favoriteEras ?? profile?.favorite_eras),
        interestPlaces: list(profile?.interestPlaces ?? profile?.interest_places),
        learningGoals: list(profile?.learningGoals ?? profile?.learning_goals),
        fingerprintInputs: profile?.fingerprintInputs ?? profile?.fingerprint_inputs ?? {},
        profileVisibility: profile?.profileVisibility ?? profile?.profile_visibility ?? 'draft',
        consentVersion: profile?.consentVersion ?? profile?.consent_version ?? null,
        previewConfirmed: profile?.previewConfirmed === true || profile?.preview_confirmed === true
      };
      return apiResult(await resolved.client.upsertProfile(payload), 'profile');
    }
    const client = sb(); const userId = await getUserId(client); if (!userId) return { ok:false, reason:'not_authenticated' };
    const payload = { user_id:userId, display_name:profile?.displayName ?? profile?.display_name ?? null, avatar_url:profile?.avatarUrl ?? profile?.avatar_url ?? null, public_home_place_id:profile?.publicHomePlaceId ?? profile?.public_home_place_id ?? null };
    const { data, error } = await client.from('hg_profiles').upsert(payload).select('*').single();
    if (error) return { ok:false, reason:'supabase_error', error };
    return { ok:true, profile:data };
  }

  function discoveryReason(reasons){
    const labels = list(reasons).map(reason => MATCH_REASON_LABELS[String(reason)]).filter(Boolean);
    return labels.slice(0, 2).join(' · ') || 'Deler relevante History GO-interesser';
  }

  async function discoverCandidates(context, options = {}){
    const normalized = normalizeContext(context); if (!normalized.ok) return { ...normalized, suggestions:[] };
    const resolved = await resolveFastApi(); if (!resolved.ok) return { ...resolved, suggestions:[] };
    const signals = options?.signals || context?.discoverySignals || {};
    const payload = {
      context: {
        contextType: normalized.context.contextType,
        contextId: normalized.context.contextId,
        themeTags: list(signals.themeTags || signals.theme_tags),
        eraTags: list(signals.eraTags || signals.era_tags),
        topicTags: list(signals.topicTags || signals.topic_tags),
        routeCategoryTags: list(signals.routeCategoryTags || signals.route_category_tags),
        quizTopicTags: list(signals.quizTopicTags || signals.quiz_topic_tags),
        learningGoalTags: list(signals.learningGoalTags || signals.learning_goal_tags)
      },
      limit: Number(options?.limit || 10)
    };
    const result = await resolved.client.discoverCandidates(payload);
    if (!result?.ok) return { ok:false, reason:result?.reason || 'backend_error', status:result?.status, detail:result?.detail, suggestions:[] };
    const data = result.data || {};
    const suggestions = list(data.candidates).map(candidate => {
      const profile = candidate?.profile || {};
      const profileId = str(profile.profileId || profile.profile_id);
      return {
        targetUserId: profileId,
        profileId,
        displayName: str(profile.displayName || profile.display_name || 'History GO-spiller'),
        reason: discoveryReason(candidate?.matchReasons || candidate?.match_reasons),
        matchReasons: list(candidate?.matchReasons || candidate?.match_reasons),
        profile,
        backend:'fastapi'
      };
    }).filter(candidate => candidate.profileId);
    return {
      ok:true,
      context:normalized.context,
      suggestions,
      generatedAt:data.generatedAt || data.generated_at,
      staleAfterSeconds:data.staleAfterSeconds || data.stale_after_seconds,
      backend:'fastapi'
    };
  }

  function createIdempotencyKey(){
    try {
      if (root.crypto?.randomUUID) return `spotmeeting-${root.crypto.randomUUID()}`;
    } catch {}
    return `spotmeeting-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }

  async function createInvite(context, targetUserId, presetMessageId){
    const normalized = normalizeContext(context); if (!normalized.ok) return normalized;
    if (!PRESETS.some(p => p.presetMessageId === presetMessageId)) return { ok:false, reason:'invalid_preset_message' };
    const target = str(targetUserId); if (!target) return { ok:false, reason:'missing_target_user' };
    const resolved = await resolveFastApi(); if (!resolved.ok) return resolved;
    const result = await resolved.client.createInvite({
      recipientProfileId:target,
      context:normalized.context,
      presetMessageId,
      idempotencyKey:createIdempotencyKey()
    });
    return apiResult(result, 'invite', mapInvite);
  }

  async function listInvites(options = {}){
    const resolved = await resolveFastApi(); if (!resolved.ok) return { ...resolved, invites:[] };
    const query = { cursor:options.cursor || 0, limit:options.limit || 100 };
    if (options.state) query.state = options.state;
    const result = await resolved.client.listInbox(query);
    if (!result?.ok) return { ok:false, reason:result?.reason || 'backend_error', status:result?.status, detail:result?.detail, invites:[] };
    const mapped = list(result.data?.invites).map(mapInvite).filter(Boolean);
    const filter = String(options?.filter || '').toLowerCase();
    const placeId = str(options?.placeId || options?.contextId);
    const invites = filter === 'place' && placeId ? mapped.filter(invite => String(invite?.context?.contextId || '') === placeId) : mapped;
    return { ok:true, invites, cursor:result.data?.cursor || 0, hasMore:result.data?.hasMore || result.data?.has_more || false, backend:'fastapi' };
  }

  async function transitionInvite(id, nextStatus, expectedVersion = null){
    if (!STATUSES.includes(nextStatus)) return { ok:false, reason:'invalid_status' };
    const action = nextStatus === 'accepted' ? 'accept' : nextStatus === 'declined' ? 'decline' : nextStatus === 'cancelled' ? 'cancel' : nextStatus === 'completed' ? 'complete' : '';
    if (!action) return { ok:false, reason:'invalid_status' };
    const resolved = await resolveFastApi(); if (!resolved.ok) return resolved;
    const result = await resolved.client.transitionInvite(id, action, expectedVersion);
    return apiResult(result, 'invite', mapInvite);
  }

  const acceptInvite = (id, version) => transitionInvite(id, 'accepted', version);
  const declineInvite = (id, version) => transitionInvite(id, 'declined', version);
  const cancelInvite = (id, version) => transitionInvite(id, 'cancelled', version);
  const completeInvite = (id, version) => transitionInvite(id, 'completed', version);

  async function listCircles(){ const client=sb(); const {data,error}=await client.from('hg_learning_circles').select('*').order('created_at',{ascending:false}); return error?{ok:false,reason:'supabase_error',error,circles:[]}:{ok:true,circles:list(data)}; }
  async function joinCircle(id){ const client=sb(); const userId=await getUserId(client); if(!userId)return{ok:false,reason:'not_authenticated'}; const {data,error}=await client.from('hg_learning_circle_members').insert({circle_id:id,user_id:userId,role:'member'}).select('*').single(); return error?{ok:false,reason:'supabase_error',error}:{ok:true,membership:data}; }
  async function leaveCircle(id){ const client=sb(); const userId=await getUserId(client); if(!userId)return{ok:false,reason:'not_authenticated'}; const {error}=await client.from('hg_learning_circle_members').delete().eq('circle_id',id).eq('user_id',userId); return error?{ok:false,reason:'supabase_error',error}:{ok:true}; }
  async function listActivity(){ const client=sb(); const {data,error}=await client.from('hg_social_activity').select('*').order('created_at',{ascending:false}); return error?{ok:false,reason:'supabase_error',error,activity:[]}:{ok:true,activity:list(data)}; }

  function health(){
    const mode = backendMode();
    const apiHealth = root.HG_SocialMeetFastApiClient?.health?.() || { ok:false, enabled:wantsFastApi(), reason:'fastapi_client_loading' };
    const supabaseHealth = root.HG_SocialMeetSupabaseClient?.health?.() || { ok:false, reason:'supabase_client_missing' };
    return {
      ok: mode === 'local' || apiHealth.ok,
      mode,
      backend:mode,
      fastapi:apiHealth,
      supabase:supabaseHealth,
      privacyFieldsBlocked:true,
      presetOnly:true,
      statusMachine:mode === 'fastapi' ? 'server_enforced' : 'local_demo'
    };
  }

  const api = { backendMode, scanForbiddenFields, normalizeContext, mapInvite, presetMessages:clone(PRESETS), getMyProfile, upsertMyProfile, discoverCandidates, createInvite, listInvites, acceptInvite, declineInvite, cancelInvite, completeInvite, listCircles, joinCircle, leaveCircle, listActivity, health };
  root.HG_SocialMeetAdapter = api;
  root.HG_SocialMeetBackend = api;
  if (wantsFastApi()) void ensureFastApiClient();
}());
