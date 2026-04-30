(function () {
  "use strict";

  const LS_MAIL = "hg_civi_mail_v1";
  const LS_INBOX = "hg_civi_inbox_v1";
  const MAX_INBOX = 80;

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function getLegacyInbox() {
    return safeParse(localStorage.getItem(LS_INBOX), []);
  }

  function setLegacyInbox(items) {
    localStorage.setItem(LS_INBOX, JSON.stringify(Array.isArray(items) ? items : []));
  }

  function normalizeEnvelope(input) {
    const event = input?.event || input || {};
    const id = String(event?.id || input?.id || `mail_${Date.now()}`).trim();
    const key = String(event?.mail_key || event?.id || id).trim();
    return {
      id,
      key,
      type: String(event?.mail_type || event?.type || "system"),
      from: String(event?.from || event?.source || "Civication"),
      subject: String(event?.subject || "Melding"),
      body: Array.isArray(event?.situation) ? event.situation.join("\n") : String(event?.summary || ""),
      createdAt: String(input?.enqueued_at || event?.createdAt || new Date().toISOString()),
      read: !!input?.read,
      archived: !!input?.archived,
      deleted: !!input?.deleted,
      resolved: !!input?.resolved,
      resolvedAt: input?.resolvedAt || null,
      status: String(input?.status || "pending"),
      event
    };
  }

  function getStore() {
    const parsed = safeParse(localStorage.getItem(LS_MAIL), null);
    if (parsed && Array.isArray(parsed.items)) return parsed;
    return { version: 1, items: [] };
  }

  function saveStore(store) {
    localStorage.setItem(LS_MAIL, JSON.stringify(store));
    const legacy = (store.items || [])
      .filter((m) => !m.deleted && !m.archived)
      .map((m) => ({ status: m.status, enqueued_at: m.createdAt, event: m.event }));
    setLegacyInbox(legacy.slice(0, MAX_INBOX));
    try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
  }

  function migrateOldInboxIfNeeded() {
    const store = getStore();
    if (Array.isArray(store.items) && store.items.length) return store;
    const legacy = getLegacyInbox();
    const items = legacy.map(normalizeEnvelope);
    const next = { version: 1, items };
    saveStore(next);
    return next;
  }

  const api = {
    getInbox() {
      const store = migrateOldInboxIfNeeded();
      return (store.items || []).filter((m) => !m.deleted && !m.archived)
        .map((m) => ({ status: m.status, enqueued_at: m.createdAt, event: m.event }));
    },
    getMail(mailId) {
      const store = migrateOldInboxIfNeeded();
      return (store.items || []).find((m) => m.id === mailId) || null;
    },
    hasReceived(mailKey) {
      const key = String(mailKey || "").trim();
      if (!key) return false;
      const store = migrateOldInboxIfNeeded();
      return (store.items || []).some((m) => m.key === key);
    },
    canDeliver(mailKey) {
      return !this.hasReceived(mailKey);
    },
    sendMail(mailOrEvent) {
      const event = mailOrEvent?.event || mailOrEvent;
      const key = String(event?.mail_key || event?.id || "").trim();
      if (key && !this.canDeliver(key)) return { ok: false, reason: "duplicate_key" };
      const store = migrateOldInboxIfNeeded();
      const envelope = normalizeEnvelope(mailOrEvent);
      store.items = [envelope].concat(store.items || []).slice(0, MAX_INBOX);
      saveStore(store);
      return { ok: true, mail: envelope };
    },
    markRead(mailId) {
      const store = migrateOldInboxIfNeeded();
      store.items = (store.items || []).map((m) => m.id === mailId ? { ...m, read: true } : m);
      saveStore(store);
    },
    markUnread(mailId) {
      const store = migrateOldInboxIfNeeded();
      store.items = (store.items || []).map((m) => m.id === mailId ? { ...m, read: false } : m);
      saveStore(store);
    },
    archiveMail(mailId) {
      const store = migrateOldInboxIfNeeded();
      store.items = (store.items || []).map((m) => m.id === mailId ? { ...m, archived: true } : m);
      saveStore(store);
    },
    deleteMail(mailId) {
      const store = migrateOldInboxIfNeeded();
      store.items = (store.items || []).map((m) => m.id === mailId ? { ...m, deleted: true } : m);
      saveStore(store);
    },
    answerMail(mailId, choiceId) {
      if (window.HG_CiviEngine?.answer) return window.HG_CiviEngine.answer(mailId, choiceId);
      return { ok: false, reason: "no_event_engine" };
    },
    migrateOldInboxIfNeeded
  };

  window.CivicationMailEngine = api;
})();

