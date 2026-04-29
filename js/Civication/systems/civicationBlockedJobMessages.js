(function initCivicationBlockedJobMessages(globalScope) {
  const STORAGE_KEY = 'hg_blocked_job_messages_v1';
  const COOLDOWN_MS = 24 * 60 * 60 * 1000;

  function normalize(v) { return String(v || '').trim(); }
  function lower(v) { return normalize(v).toLowerCase(); }

  function getInbox() {
    if (globalScope.HG_CiviEngine?.getInbox) return globalScope.HG_CiviEngine.getInbox() || [];
    if (globalScope.CivicationState?.getInbox) return globalScope.CivicationState.getInbox() || [];
    return [];
  }

  function setInbox(inbox) {
    if (globalScope.HG_CiviEngine?.setInbox) return globalScope.HG_CiviEngine.setInbox(inbox);
    if (globalScope.CivicationState?.setInbox) return globalScope.CivicationState.setInbox(inbox);
    return null;
  }

  function loadHistory() {
    try {
      const raw = globalScope.localStorage?.getItem?.(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveHistory(next) {
    try {
      globalScope.localStorage?.setItem?.(STORAGE_KEY, JSON.stringify(next || {}));
    } catch (_) {}
  }

  function historyKey(params) {
    return [lower(params?.career_id), lower(params?.role_scope), lower(params?.reason)].join(':');
  }

  function hasPendingMessage(params) {
    const key = historyKey(params);
    return getInbox().some(function (msg) {
      if (!msg || lower(msg.status || 'pending') !== 'pending') return false;
      const payload = msg && typeof msg === 'object' && msg.event && typeof msg.event === 'object'
        ? msg.event
        : msg;
      return historyKey(payload) === key;
    });
  }

  function hasRecentNoUnlockedBrandEmployerMessage(params) {
    const key = historyKey({ ...params, reason: 'no_unlocked_brand_employer' });
    const history = loadHistory();
    const entry = history[key];
    if (!entry?.last_iso) return false;
    const lastTime = Date.parse(entry.last_iso);
    if (!Number.isFinite(lastTime)) return false;
    return (Date.now() - lastTime) < COOLDOWN_MS;
  }

  function buildMessage(params) {
    const nowIso = new Date().toISOString();
    const stamp = nowIso.slice(0, 13).replace(/[-:T]/g, '');
    return {
      id: 'blocked_job_no_brand_naeringsliv_ekspeditor_' + stamp,
      source: 'Civication',
      source_type: 'blocked_job',
      mail_class: 'opportunity_blocked',
      career_id: lower(params?.career_id) || 'naeringsliv',
      role_scope: lower(params?.role_scope) || 'ekspeditor',
      reason: 'no_unlocked_brand_employer',
      subject: 'Du mangler en konkret arbeidsgiver',
      situation: [
        'Du har begynt å bygge Næringsliv-kompetanse, men Civication kan ikke tilby deg en ekspeditørjobb uten en faktisk arbeidsgiver.',
        'Jobber hentes ikke tilfeldig fra brand-katalogen. Du må først låse opp, besøke eller fullføre et sted som har relevante Brands.',
        'Når du har åpnet tilgang til et brand som kan fungere som arbeidsgiver, kan jobbtilbudet komme tilbake med en konkret butikk og arbeidsgiver.'
      ],
      choices: [{
        id: 'A',
        label: 'Se etter steder med relevante Brands',
        effect: 0,
        tags: ['brand_access', 'job_blocked', 'naeringsliv'],
        feedback: 'Du trenger en konkret arbeidsgiver før denne rollen kan bli en faktisk jobb.'
      }],
      feedback: 'Du mangler foreløpig en tilgjengelig arbeidsgiver.'
    };
  }

  function enqueueNoUnlockedBrandEmployerMessage(params) {
    const normalized = {
      career_id: lower(params?.career_id) || 'naeringsliv',
      role_scope: lower(params?.role_scope) || 'ekspeditor',
      reason: 'no_unlocked_brand_employer'
    };

    if (hasPendingMessage(normalized)) return { ok: true, skipped: 'already_pending' };
    if (hasRecentNoUnlockedBrandEmployerMessage(normalized)) return { ok: true, skipped: 'cooldown' };

    const inbox = getInbox().slice();
    const message = buildMessage(normalized);
    inbox.unshift({
      status: 'pending',
      createdAt: Date.now(),
      event: message
    });
    setInbox(inbox);

    const key = historyKey(normalized);
    const history = loadHistory();
    const prevCount = Number(history[key]?.count || 0);
    history[key] = { last_iso: new Date().toISOString(), count: prevCount + 1 };
    saveHistory(history);
    return { ok: true, enqueued: true, id: message.id };
  }

  function inspect() {
    return { storage_key: STORAGE_KEY, cooldown_ms: COOLDOWN_MS, history: loadHistory() };
  }

  const api = {
    enqueueNoUnlockedBrandEmployerMessage,
    hasRecentNoUnlockedBrandEmployerMessage,
    inspect
  };

  globalScope.CivicationBlockedJobMessages = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
