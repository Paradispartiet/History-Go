(function () {
  "use strict";

  const LS_MAIL = "hg_civi_mail_v1";
  const LS_INBOX = "hg_civi_inbox_v1";
  const MAX_INBOX = 80;

  function safeParse(raw, fallback) {
    if (raw === null || raw === undefined || raw === "") return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function getLegacyInbox() {
    const parsed = safeParse(localStorage.getItem(LS_INBOX), []);
    return Array.isArray(parsed) ? parsed : [];
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
      resolved: !!input?.resolved || String(input?.status || "") === "resolved",
      resolvedAt: input?.resolvedAt || input?.resolved_at || null,
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

  function getRawMailStore() {
    return localStorage.getItem(LS_MAIL);
  }

  function getStore() {
    const parsed = safeParse(getRawMailStore(), null);
    if (parsed && Array.isArray(parsed.items)) return normalizeStoreShape(parsed);
    return normalizeStoreShape({ version: 1, items: [] });
  }

  function saveStore(store, options) {
    const opts = options && typeof options === "object" ? options : {};
    ensureMeta(store);
    localStorage.setItem(LS_MAIL, JSON.stringify(store));
    const legacy = (store.items || [])
      .filter((m) => !m.deleted && !m.archived)
      .map((m) => ({
        status: m.status,
        read: !!m.read,
        resolved: !!m.resolved,
        resolvedAt: m.resolvedAt || null,
        enqueued_at: m.createdAt,
        event: m.event
      }));
    setLegacyInbox(legacy.slice(0, MAX_INBOX));
    if (!opts.silent) {
      try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
    }
  }

  function migrateOldInboxIfNeeded() {
    const rawMailStore = getRawMailStore();
    const parsedMailStore = safeParse(rawMailStore, null);

    // If the new mail store already exists, even with an empty items array,
    // this is not a migration case. Returning here prevents read-only calls
    // from repeatedly saving an empty store and dispatching civi:inboxChanged.
    if (parsedMailStore && typeof parsedMailStore === "object" && Array.isArray(parsedMailStore.items)) {
      return normalizeStoreShape(parsedMailStore);
    }

    const legacy = getLegacyInbox();

    // No new store and no legacy inbox means there is nothing to migrate.
    // Return an empty normalized store without writing or dispatching events.
    // This avoids a render → getInbox → saveStore → inboxChanged → render loop.
    if (!legacy.length) {
      return normalizeStoreShape({ version: 1, items: [] });
    }

    const items = legacy.map(normalizeEnvelope);
    const next = normalizeStoreShape({ version: 1, items });
    saveStore(next, { silent: true });
    return next;
  }

  function resolveMailMatch(m, mailId, eventId) {
    const mid = String(mailId || "").trim();
    const eid = String(eventId || "").trim();
    return (
      (mid && String(m?.id || "").trim() === mid) ||
      (eid && String(m?.event?.id || "").trim() === eid) ||
      (eid && String(m?.key || "").trim() === eid)
    );
  }

  function markResolved(mailId, eventId, choiceId) {
    const store = migrateOldInboxIfNeeded();
    const now = new Date().toISOString();
    let changed = false;

    store.items = (store.items || []).map((m) => {
      if (!resolveMailMatch(m, mailId, eventId)) return m;
      changed = true;
      return {
        ...m,
        read: true,
        resolved: true,
        resolvedAt: now,
        status: "resolved",
        answeredChoiceId: choiceId || m.answeredChoiceId || null
      };
    });

    if (changed) saveStore(store);
    return changed;
  }

  const api = {
    getInbox() {
      const store = migrateOldInboxIfNeeded();
      return (store.items || []).filter((m) => !m.deleted && !m.archived)
        .map((m) => ({
          status: m.status,
          read: !!m.read,
          resolved: !!m.resolved,
          resolvedAt: m.resolvedAt || null,
          enqueued_at: m.createdAt,
          event: m.event
        }));
    },
    getMail(mailId) {
      const store = migrateOldInboxIfNeeded();
      return (store.items || []).find((m) => m.id === mailId || m?.event?.id === mailId) || null;
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
          return m && !m.archived && !m.deleted && !m.resolved && m.status === "pending" && String(m.type || "") === guardType;
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
      store.items = (store.items || []).map((m) => m.id === mailId || m?.event?.id === mailId ? { ...m, read: true } : m);
      saveStore(store);
    },
    markUnread(mailId) {
      const store = migrateOldInboxIfNeeded();
      store.items = (store.items || []).map((m) => m.id === mailId || m?.event?.id === mailId ? { ...m, read: false } : m);
      saveStore(store);
    },
    archiveMail(mailId) {
      const store = migrateOldInboxIfNeeded();
      store.items = (store.items || []).map((m) => m.id === mailId || m?.event?.id === mailId ? { ...m, archived: true } : m);
      saveStore(store);
    },
    deleteMail(mailId) {
      const store = migrateOldInboxIfNeeded();
      store.items = (store.items || []).map((m) => m.id === mailId || m?.event?.id === mailId ? { ...m, deleted: true } : m);
      saveStore(store);
    },
    answerMail(mailId, choiceId) {
      const mail = this.getMail(mailId);
      const eventId = mail?.event?.id || mailId;
      const result = window.HG_CiviEngine?.answer
        ? window.HG_CiviEngine.answer(eventId, choiceId)
        : { ok: false, reason: "no_event_engine" };

      if (result?.ok !== false) {
        markResolved(mailId, eventId, choiceId);
      }

      return result;
    },
    markResolved,
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
