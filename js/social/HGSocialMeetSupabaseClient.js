(function(){
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;

  function trim(value){ return String(value || '').trim(); }

  function readMeta(name){
    try { return trim(root.document?.querySelector?.(`meta[name="${name}"]`)?.getAttribute?.('content')); }
    catch { return ''; }
  }

  function readConfig(){
    const cfg = root.HG_SOCIAL_MEET_SUPABASE || root.HG_SUPABASE_CONFIG || {};
    const url = trim(cfg.url || cfg.supabaseUrl || readMeta('hg-supabase-url'));
    const anonKey = trim(cfg.anonKey || cfg.supabaseAnonKey || readMeta('hg-supabase-anon-key'));
    const enabled = cfg.enabled === true || trim(cfg.backend || cfg.mode).toLowerCase() === 'supabase' || (url && anonKey && cfg.enabled !== false);
    return { enabled: Boolean(enabled), url, anonKey, hasCredentials: Boolean(url && anonKey) };
  }

  function getClient(){
    const config = readConfig();
    if (!config.enabled) return { ok:false, reason:'supabase_not_enabled', config };
    if (!config.hasCredentials) return { ok:false, reason:'missing_supabase_config', config };
    if (!root.supabase?.createClient) return { ok:false, reason:'supabase_sdk_missing', config };
    if (!root.__HG_SOCIAL_MEET_SUPABASE_CLIENT__) {
      root.__HG_SOCIAL_MEET_SUPABASE_CLIENT__ = root.supabase.createClient(config.url, config.anonKey);
    }
    return { ok:true, client: root.__HG_SOCIAL_MEET_SUPABASE_CLIENT__, config };
  }

  function health(){
    const config = readConfig();
    const sdkLoaded = Boolean(root.supabase?.createClient);
    return { ok: !config.enabled || (config.hasCredentials && sdkLoaded), enabled: config.enabled, hasCredentials: config.hasCredentials, sdkLoaded, reason: !config.enabled ? 'supabase_not_enabled' : (!config.hasCredentials ? 'missing_supabase_config' : (!sdkLoaded ? 'supabase_sdk_missing' : null)) };
  }

  root.HG_SocialMeetSupabaseClient = { readConfig, getClient, health };
}());
