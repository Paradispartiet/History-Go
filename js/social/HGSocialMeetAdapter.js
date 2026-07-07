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
    return { ok:true, context:{ contextType, contextId, title:str(context?.title || context?.contextTitle || context?.context_title), sourceSurface:str(context?.sourceSurface || context?.source_surface) } };
  }

  function mapInvite(row){
    if (!row) return null;
    const presetMessageId = row.preset_message_id || row.presetMessageId;
    return {
      inviteId: row.id || row.inviteId,
      createdByUserId: row.created_by || row.createdByUserId,
      targetUserId: row.target_user_id || row.targetUserId,
      targetDisplayName: row.targetDisplayName || '',
      context: { contextType: row.context_type || row.context?.contextType, contextId: row.context_id || row.context?.contextId, title: row.context_title || row.context?.title || '', sourceSurface: row.source_surface || row.context?.sourceSurface || '' },
      presetMessageId,
      presetLabel: presetLabel(presetMessageId),
      status: row.status,
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt,
      private: true,
      backend: 'supabase'
    };
  }

  function backendMode(){
    const cfg = root.HG_SOCIAL_MEET_BACKEND || root.HG_SOCIAL_MEET_SUPABASE?.backend || root.HG_SOCIAL_MEET_SUPABASE?.mode;
    return String(cfg || '').toLowerCase() === 'supabase' ? 'supabase' : 'local';
  }

  async function getUserId(client){
    const res = await client.auth?.getUser?.();
    return res?.data?.user?.id || null;
  }

  function sb(){
    const res = root.HG_SocialMeetSupabaseClient?.getClient?.() || { ok:false, reason:'supabase_client_missing' };
    if (!res.ok) throw Object.assign(new Error(res.reason), { reason: res.reason, config: res.config });
    return res.client;
  }

  async function getMyProfile(){
    const client = sb(); const userId = await getUserId(client); if (!userId) return { ok:false, reason:'not_authenticated' };
    const { data, error } = await client.from('hg_profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) return { ok:false, reason:'supabase_error', error };
    return { ok:true, profile:data || null };
  }

  async function upsertMyProfile(profile){
    const privacy = scanForbiddenFields(profile); if (!privacy.ok) return { ok:false, reason:'forbidden_privacy_field', privacy };
    const client = sb(); const userId = await getUserId(client); if (!userId) return { ok:false, reason:'not_authenticated' };
    const payload = { user_id:userId, display_name:profile?.displayName ?? profile?.display_name ?? null, avatar_url:profile?.avatarUrl ?? profile?.avatar_url ?? null, public_home_place_id:profile?.publicHomePlaceId ?? profile?.public_home_place_id ?? null };
    const { data, error } = await client.from('hg_profiles').upsert(payload).select('*').single();
    if (error) return { ok:false, reason:'supabase_error', error };
    return { ok:true, profile:data };
  }

  async function createInvite(context, targetUserId, presetMessageId){
    const normalized = normalizeContext(context); if (!normalized.ok) return normalized;
    if (!PRESETS.some(p => p.presetMessageId === presetMessageId)) return { ok:false, reason:'invalid_preset_message' };
    const target = str(targetUserId); if (!target) return { ok:false, reason:'missing_target_user' };
    const client = sb(); const userId = await getUserId(client); if (!userId) return { ok:false, reason:'not_authenticated' };
    const c = normalized.context;
    const payload = { created_by:userId, target_user_id:target, context_type:c.contextType, context_id:c.contextId, context_title:c.title || null, source_surface:c.sourceSurface || null, preset_message_id:presetMessageId, status:'pending' };
    const { data, error } = await client.from('hg_spotmeeting_invites').insert(payload).select('*').single();
    if (error) return { ok:false, reason:'supabase_error', error };
    return { ok:true, invite:mapInvite(data) };
  }

  async function listInvites(options = {}){
    const client = sb();
    const { data, error } = await client.from('hg_spotmeeting_invites').select('*').order('created_at', { ascending:false });
    if (error) return { ok:false, reason:'supabase_error', error, invites:[] };
    const mapped = list(data).map(mapInvite).filter(Boolean);
    const filter = String(options?.filter || '').toLowerCase();
    const placeId = str(options?.placeId || options?.contextId);
    const invites = filter === 'place' && placeId ? mapped.filter(invite => String(invite?.context?.contextId || '') === placeId) : mapped;
    return { ok:true, invites };
  }

  async function transitionInvite(id, nextStatus){
    if (!STATUSES.includes(nextStatus)) return { ok:false, reason:'invalid_status' };
    const client = sb(); const userId = await getUserId(client); if (!userId) return { ok:false, reason:'not_authenticated' };
    const current = await client.from('hg_spotmeeting_invites').select('*').eq('id', id).single();
    if (current.error) return { ok:false, reason:'supabase_error', error:current.error };
    const row = current.data;
    const isCreator = row.created_by === userId; const isTarget = row.target_user_id === userId;
    const allowed = (nextStatus === 'accepted' || nextStatus === 'declined') ? isTarget && row.status === 'pending' : nextStatus === 'cancelled' ? isCreator && ['pending','accepted'].includes(row.status) : nextStatus === 'completed' ? (isCreator || isTarget) && row.status === 'accepted' : false;
    if (!allowed) return { ok:false, reason:'invalid_invite_transition', status:row.status, nextStatus };
    const { data, error } = await client.from('hg_spotmeeting_invites').update({ status:nextStatus }).eq('id', id).select('*').single();
    if (error) return { ok:false, reason:'supabase_error', error };
    return { ok:true, invite:mapInvite(data) };
  }

  const acceptInvite = id => transitionInvite(id, 'accepted');
  const declineInvite = id => transitionInvite(id, 'declined');
  const cancelInvite = id => transitionInvite(id, 'cancelled');
  const completeInvite = id => transitionInvite(id, 'completed');

  async function listCircles(){ const client=sb(); const {data,error}=await client.from('hg_learning_circles').select('*').order('created_at',{ascending:false}); return error?{ok:false,reason:'supabase_error',error,circles:[]}:{ok:true,circles:list(data)}; }
  async function joinCircle(id){ const client=sb(); const userId=await getUserId(client); if(!userId)return{ok:false,reason:'not_authenticated'}; const {data,error}=await client.from('hg_learning_circle_members').insert({circle_id:id,user_id:userId,role:'member'}).select('*').single(); return error?{ok:false,reason:'supabase_error',error}:{ok:true,membership:data}; }
  async function leaveCircle(id){ const client=sb(); const userId=await getUserId(client); if(!userId)return{ok:false,reason:'not_authenticated'}; const {error}=await client.from('hg_learning_circle_members').delete().eq('circle_id',id).eq('user_id',userId); return error?{ok:false,reason:'supabase_error',error}:{ok:true}; }
  async function listActivity(){ const client=sb(); const {data,error}=await client.from('hg_social_activity').select('*').order('created_at',{ascending:false}); return error?{ok:false,reason:'supabase_error',error,activity:[]}:{ok:true,activity:list(data)}; }

  function health(){ const clientHealth = root.HG_SocialMeetSupabaseClient?.health?.() || { ok:false, reason:'supabase_client_missing' }; const mode = backendMode(); return { ok: mode === 'local' || clientHealth.ok, mode, backend:mode, supabase:clientHealth, privacyFieldsBlocked:true, presetOnly:true, statusMachine:'client_enforced' }; }

  const api = { backendMode, scanForbiddenFields, normalizeContext, mapInvite, presetMessages:clone(PRESETS), getMyProfile, upsertMyProfile, createInvite, listInvites, acceptInvite, declineInvite, cancelInvite, completeInvite, listCircles, joinCircle, leaveCircle, listActivity, health };
  root.HG_SocialMeetAdapter = api;
  root.HG_SocialMeetBackend = root.HG_SocialMeetBackend || api;
}());
