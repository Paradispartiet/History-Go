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

  function ensureMeta(store) {
    if (!store.meta || typeof store.meta !== "object") store.meta = {};
    if (!store.meta.delivery || typeof store.meta.delivery !== "object") {
      store.meta.delivery = { byKey: {}, byWeek: {}, byType: {} };
    }
    const d = store.meta.delivery;
    if (!d.byKey || typeof d.byKey !== "object") d.byKey = {};
    if (!d.byWeek || typeof d.byWeek !== "object") d.byWeek = {};
    if (!d.byType || typeof d.byType !== "object") d.byType = {};
  }

  function normalizeStoreShape(store) {
    const next = (store && typeof store === "object") ? store : { version: 1, items: [] };
    if (!Array.isArray(next.items)) next.items = [];
    ensureMeta(next);
    return next;
  }

  function getStore() {
    const parsed = safeParse(localStorage.getItem(LS_MAIL), null);
    if (parsed && Array.isArray(parsed.items)) return normalizeStoreShape(parsed);
    return normalizeStoreShape({ version: 1, items: [] });
  }

  function saveStore(store) {
    ensureMeta(store);
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
    const next = normalizeStoreShape({ version: 1, items });
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
    canDeliver(mailKey, options) {
      const key = String(mailKey || "").trim();
      const opts = options && typeof options === "object" ? options : {};
      const store = migrateOldInboxIfNeeded();
      ensureMeta(store);
      if (key && this.hasReceived(key)) return false;

      const guardType = String(opts.guardType || opts.type || "").trim();
      const weekKey = String(opts.weekKey || "").trim();
      const maxPending = Number(opts.maxPending || 0);

      if (maxPending > 0 && guardType) {
        const pending = (store.items || []).filter(function (m) {
          return m && !m.archived && !m.deleted && m.status === "pending" && String(m.type || "") === guardType;
        }).length;
        if (pending >= maxPending) return false;
      }

      if (guardType && weekKey) {
        const stamp = store.meta.delivery.byWeek[guardType + "::" + weekKey];
        if (stamp) return false;
      }
      return true;
    },
    sendMail(mailOrEvent) {
      const event = mailOrEvent?.event || mailOrEvent;
      const key = String(event?.mail_key || event?.id || "").trim();
      const guardType = String(event?.mail_type || event?.type || "system");
      const guardWeek = String(event?.week_key || event?.calendar_week || "").trim();
      if (key && !this.canDeliver(key, { guardType, weekKey: guardWeek })) return { ok: false, reason: "duplicate_key" };
      const store = migrateOldInboxIfNeeded();
      const envelope = normalizeEnvelope(mailOrEvent);
      store.items = [envelope].concat(store.items || []).slice(0, MAX_INBOX);
      ensureMeta(store);
      if (envelope.key) store.meta.delivery.byKey[envelope.key] = envelope.createdAt;
      if (guardType) store.meta.delivery.byType[guardType] = envelope.createdAt;
      if (guardType && guardWeek) store.meta.delivery.byWeek[guardType + "::" + guardWeek] = envelope.createdAt;
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
      const mail = this.getMail(mailId);
      const eventId = mail?.event?.id || mailId;
      if (window.HG_CiviEngine?.answer) return window.HG_CiviEngine.answer(eventId, choiceId);
      return { ok: false, reason: "no_event_engine" };
    },
    replaceInbox(items) {
      const store = migrateOldInboxIfNeeded();
      store.items = (Array.isArray(items) ? items : []).map(normalizeEnvelope).slice(0, MAX_INBOX);
      saveStore(store);
      return store.items;
    },
    migrateOldInboxIfNeeded
  };

  window.CivicationMailEngine = api;
})();
