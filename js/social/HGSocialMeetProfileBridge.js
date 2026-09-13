(function installSocialMeetProfileBridge(root){
  'use strict';

  const CONSENT_VERSION = 'social_meet_identity_v1';
  const STATUS_ID = 'social-meet-server-status';
  const STATE_KEY = 'hg_social_meet_server_profile_state_v1';
  let lastState = null;
  let refreshPromise = null;

  const text = value => String(value == null ? '' : value).trim();
  const list = value => Array.isArray(value) ? value.filter(Boolean) : [];
  const unique = (values, max = 24) => Array.from(new Set(list(values).map(text).filter(Boolean))).slice(0, max);
  const escapeHTML = value => String(value == null ? '' : value)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  function adapter(){
    return root.HG_SocialMeetAdapter || root.HG_SocialMeetBackend || null;
  }

  function backendConfigured(){
    return adapter()?.backendMode?.() === 'fastapi';
  }

  function localPrivacy(){
    try { return root.getPrivacySettings?.() || {}; }
    catch { return {}; }
  }

  function publicModel(){
    try { return root.HG_PublicProfileReadModel?.getReadModel?.() || null; }
    catch { return null; }
  }

  function socialSeed(){
    try { return root.HG_SocialSignals?.getPublicProfileSeed?.() || {}; }
    catch { return {}; }
  }

  function displayName(){
    const modelName = text(publicModel()?.identity?.displayName);
    if (modelName) return modelName;
    const profileName = text(root.HGUserProfile?.getDisplayName?.());
    if (profileName) return profileName;
    try {
      const cached = JSON.parse(root.localStorage?.getItem?.('aha_profile_cache_v1') || '{}');
      const ahaName = text(cached?.display_name || cached?.name);
      if (ahaName) return ahaName;
    } catch {}
    return 'Historieutforsker';
  }

  function buildProfilePayload(visibility = 'discoverable'){
    const model = publicModel();
    const validation = root.HG_PublicProfileReadModel?.validate?.(model || {});
    if (validation && validation.publicSafe === false) {
      return { ok:false, reason:'privacy_validation_failed', validation };
    }

    const seed = socialSeed();
    const themes = unique(seed.knowledgeDomains, 24);
    const topics = unique(seed.learnedConcepts, 24);
    const places = unique(seed.favoritePlaces, 24);
    const quizzes = unique(list(seed.quizStrengths).map(item => item?.quizId), 24);

    return {
      ok:true,
      payload:{
        displayName: displayName(),
        avatarRef: null,
        shortBio: null,
        preferredThemes: themes,
        favoriteEras: [],
        interestPlaces: places,
        learningGoals: [],
        fingerprintInputs: {
          themeTags: themes,
          eraTags: [],
          topicTags: topics,
          routeCategoryTags: [],
          quizTopicTags: quizzes,
          learningGoalTags: []
        },
        profileVisibility: visibility,
        consentVersion: visibility === 'discoverable' ? CONSENT_VERSION : null,
        previewConfirmed: visibility === 'discoverable'
      }
    };
  }

  function persistState(state){
    lastState = state || null;
    try { root.localStorage?.setItem?.(STATE_KEY, JSON.stringify({ state:lastState, updatedAt:new Date().toISOString() })); } catch {}
    root.dispatchEvent?.(new root.CustomEvent('hg:social-meet-profile-state', { detail:lastState }));
    return lastState;
  }

  function cachedState(){
    if (lastState) return lastState;
    try {
      const parsed = JSON.parse(root.localStorage?.getItem?.(STATE_KEY) || '{}');
      return parsed?.state || null;
    } catch {
      return null;
    }
  }

  function stateVisibility(state){
    return text(state?.profileVisibility || state?.profile_visibility || state?.profile?.profileVisibility || state?.profile?.profile_visibility).toLowerCase();
  }

  function statusSummary(){
    const health = adapter()?.health?.() || {};
    const state = cachedState();
    const visibility = stateVisibility(state);
    const privacy = localPrivacy();
    const localOptIn = privacy.publicProfile === true && privacy.visibleInMatchLists === true && privacy.allowMeetInvites === true;

    if (!backendConfigured()) {
      return {
        code:'backend_not_configured',
        ready:false,
        label:'Ekte personmatching er ikke koblet til server ennå.',
        detail:'Møtes kan åpnes, men live-versjonen kan ikke hente eller sende forslag til andre brukere før FastAPI er aktivert.',
        visibility,
        localOptIn,
        health
      };
    }
    if (visibility === 'discoverable') {
      return {
        code:'discoverable',
        ready:true,
        label:'Du er oppdagbar for kunnskapsmatcher.',
        detail:'Andre kan finne profilen din via felles kunnskap og interesser. Ingen live-posisjon deles.',
        visibility,
        localOptIn,
        health
      };
    }
    return {
      code:'profile_not_published',
      ready:false,
      label:'Social Meet-profilen din er ikke oppdagbar ennå.',
      detail:'Publiser den eksplisitt for å kunne finne og bli funnet av kunnskapsmatcher.',
      visibility,
      localOptIn,
      health
    };
  }

  async function refresh(){
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
      if (!backendConfigured()) {
        render();
        return { ok:false, reason:'backend_not_configured' };
      }
      const api = adapter();
      if (typeof api?.getMyProfile !== 'function') {
        render();
        return { ok:false, reason:'profile_api_missing' };
      }
      try {
        const result = await api.getMyProfile();
        if (result?.ok) persistState(result.profile || result.data || result);
        else if (['not_authenticated','supabase_auth_unavailable','auth_session_error'].includes(text(result?.reason))) persistState({ error:result.reason });
        render();
        return result;
      } finally {
        refreshPromise = null;
      }
    })();
    return refreshPromise;
  }

  async function publish(){
    if (!backendConfigured()) {
      render();
      return { ok:false, reason:'backend_not_configured' };
    }
    const built = buildProfilePayload('discoverable');
    if (!built.ok) return built;
    const api = adapter();
    if (typeof api?.upsertMyProfile !== 'function') return { ok:false, reason:'profile_api_missing' };
    const result = await api.upsertMyProfile(built.payload);
    if (result?.ok) {
      persistState(result.profile || result.data || result);
      root.savePrivacySettings?.(undefined, {
        publicProfile:true,
        visibleInMatchLists:true,
        allowMeetInvites:true
      });
    }
    render();
    return result;
  }

  async function unpublish(){
    if (!backendConfigured()) {
      render();
      return { ok:false, reason:'backend_not_configured' };
    }
    const api = adapter();
    if (typeof api?.unpublishMyProfile !== 'function') return { ok:false, reason:'unpublish_api_missing' };
    const result = await api.unpublishMyProfile();
    if (result?.ok) {
      persistState(result.profile || result.data || result);
      root.savePrivacySettings?.(undefined, {
        publicProfile:false,
        visibleInMatchLists:false,
        allowMeetInvites:false
      });
    }
    render();
    return result;
  }

  function render(){
    const mount = root.document?.getElementById?.(STATUS_ID);
    if (!mount) return null;
    const summary = statusSummary();
    const state = cachedState();
    const visibility = stateVisibility(state);
    const discoverable = visibility === 'discoverable';
    const backend = backendConfigured();

    const preview = buildProfilePayload('discoverable');
    const profile = preview.ok ? preview.payload : null;
    const previewBits = profile ? [
      profile.displayName,
      profile.preferredThemes.length ? `${profile.preferredThemes.length} kunnskapsfelt` : '',
      profile.interestPlaces.length ? `${profile.interestPlaces.length} interesse-steder` : ''
    ].filter(Boolean).join(' · ') : 'Profilen kan ikke publiseres før personvernkontrollen er grønn';

    mount.innerHTML = `
      <div class="hg-social-meet-server-card" aria-label="Social Meet serverstatus">
        <div class="section-head">
          <h2>Folk å møte</h2>
          <span class="section-meta">${backend ? 'Serverkoblet' : 'Ikke serverkoblet'}</span>
        </div>
        <p><strong>${escapeHTML(summary.label)}</strong></p>
        <p class="muted">${escapeHTML(summary.detail)}</p>
        <div class="hg-social-meet-profile-preview">
          <strong>Dette blir synlig i matcher</strong>
          <span>${escapeHTML(previewBits)}</span>
        </div>
        <p class="muted">History Go viser kun frivillige kunnskaps- og interessematcher — ikke hvem som fysisk er på stedet, GPS, avstand eller sist sett.</p>
        <div class="profile-action-row">
          ${backend && !discoverable ? '<button type="button" class="collection-action primary" data-hg-social-profile-publish>Bekreft og gjør profilen oppdagbar</button>' : ''}
          ${backend && discoverable ? '<button type="button" class="collection-action" data-hg-social-profile-unpublish>Skjul profilen fra matcher</button>' : ''}
          ${backend ? '<button type="button" class="collection-action" data-hg-social-profile-refresh>Oppdater status</button>' : ''}
        </div>
      </div>
    `;

    mount.querySelector?.('[data-hg-social-profile-publish]')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = 'Publiserer …';
      const result = await publish();
      if (!result?.ok) root.showToast?.('Kunne ikke gjøre Social Meet-profilen oppdagbar.');
    });
    mount.querySelector?.('[data-hg-social-profile-unpublish]')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = 'Skjuler …';
      const result = await unpublish();
      if (!result?.ok) root.showToast?.('Kunne ikke skjule Social Meet-profilen.');
    });
    mount.querySelector?.('[data-hg-social-profile-refresh]')?.addEventListener('click', () => void refresh());
    return mount;
  }

  function health(){
    const summary = statusSummary();
    return {
      ok:true,
      backendConfigured:backendConfigured(),
      status:summary.code,
      discoverable:summary.code === 'discoverable',
      privacyBoundary:'knowledge_matches_only_no_presence',
      consentVersion:CONSENT_VERSION,
      serverState:cachedState()
    };
  }

  function bind(){
    render();
    root.addEventListener?.('aha:auth-ready', () => void refresh());
    root.addEventListener?.('hg:publicProfileSettingsChanged', () => render());
    root.addEventListener?.('hg:social-meet-profile-state', () => render());
    if (backendConfigured()) void refresh();
  }

  root.HG_SocialMeetProfileBridge = {
    CONSENT_VERSION,
    buildProfilePayload,
    backendConfigured,
    statusSummary,
    refresh,
    publish,
    unpublish,
    render,
    health,
    bind
  };

  if (root.document?.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', bind, { once:true });
  else bind();
})(typeof window !== 'undefined' ? window : globalThis);
