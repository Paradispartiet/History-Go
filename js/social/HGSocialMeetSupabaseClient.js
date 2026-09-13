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

  function ahaAuthBridge(){
    if (typeof root.HistoryGoAHAAuth?.getSession !== 'function') return null;
    return {
      auth: {
        getSession: async () => {
          try {
            const session = await root.HistoryGoAHAAuth.getSession();
            return { data: { session: session || null }, error: null };
          } catch (error) {
            return { data: { session: null }, error };
          }
        },
        getUser: async () => {
          try {
            const session = await root.HistoryGoAHAAuth.getSession();
            return { data: { user: session?.user || null }, error: null };
          } catch (error) {
            return { data: { user: null }, error };
          }
        }
      }
    };
  }

  function getClient(){
    const config = readConfig();
    if (config.enabled) {
      if (!config.hasCredentials) return { ok:false, reason:'missing_supabase_config', config };
      if (!root.supabase?.createClient) return { ok:false, reason:'supabase_sdk_missing', config };
      if (!root.__HG_SOCIAL_MEET_SUPABASE_CLIENT__) {
        root.__HG_SOCIAL_MEET_SUPABASE_CLIENT__ = root.supabase.createClient(config.url, config.anonKey);
      }
      return { ok:true, client: root.__HG_SOCIAL_MEET_SUPABASE_CLIENT__, config, authSource:'social-meet-supabase' };
    }

    const ahaClient = ahaAuthBridge();
    if (ahaClient) {
      return {
        ok:true,
        client:ahaClient,
        config:{ ...config, enabled:false },
        authSource:'aha'
      };
    }

    return { ok:false, reason:'supabase_not_enabled', config };
  }

  function health(){
    const config = readConfig();
    const sdkLoaded = Boolean(root.supabase?.createClient);
    const ahaAvailable = typeof root.HistoryGoAHAAuth?.getSession === 'function';
    const explicitOk = config.enabled && config.hasCredentials && sdkLoaded;
    return {
      ok: explicitOk || ahaAvailable || !config.enabled,
      enabled: config.enabled,
      hasCredentials: config.hasCredentials,
      sdkLoaded,
      ahaAuthAvailable: ahaAvailable,
      authSource: explicitOk ? 'social-meet-supabase' : (ahaAvailable ? 'aha' : 'none'),
      reason: explicitOk || ahaAvailable ? null : (!config.enabled ? 'supabase_not_enabled' : (!config.hasCredentials ? 'missing_supabase_config' : 'supabase_sdk_missing'))
    };
  }

  root.HG_SocialMeetSupabaseClient = { readConfig, getClient, health };
}());
