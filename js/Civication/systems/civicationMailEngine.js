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


  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function slugifyKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  }

  // Avklaringspakkene (micro/followup/knowledge/consequence) er varianter av
  // samme story-node per narrative_arc og deler derfor tråd. Speiler
  // threadKeyForMail i civicationDailyMailBuilder (builderen stempler
  // thread_key ved bygging; dette er lesesiden for mailer fra andre motorer
  // og gamle saves som mangler feltet).
  const CASE_THREAD_MAIL_TYPES = new Set(["micro", "followup", "knowledge", "consequence"]);

  function threadKeyOf(mailOrEvent) {
    const event = mailOrEvent?.event || mailOrEvent || {};
    const explicit = String(event.thread_key || event.threadKey || mailOrEvent?.thread_key || "").trim();
    if (explicit) return explicit;
    const scope = slugifyKey(event.role_scope) || "role";
    const arc = slugifyKey(event.narrative_arc);
    const type = String(event.mail_type || event.type || "").trim();
    if (arc && CASE_THREAD_MAIL_TYPES.has(type)) return scope + ".case." + arc;
    const id = slugifyKey(event.source_mail_id || event.id || mailOrEvent?.id);
    return id ? scope + ".mail." + id : "";
  }

  function isActiveThreadItem(m) {
    if (!m || m.deleted === true || m.archived === true || m.resolved === true) return false;
    const status = String(m.status || "pending").toLowerCase();
    return status !== "resolved" && status !== "suppressed";
  }

  function suppressEnvelope(m, now) {
    return {
      ...m,
      read: true,
      archived: true,
      suppressed_duplicate: true,
      suppressedAt: now,
      status: "suppressed"
    };
  }

  function isJobRelatedMail(event) {
    const ev = event || {};
    if (typeof window.CivicationEventChannels?.getMessageChannel === "function") {
      return window.CivicationEventChannels.getMessageChannel(ev) === "job";
    }

    const explicit = normalizeText(ev.channel || ev.messageChannel);
    const type = normalizeText(ev.mail_type || ev.type || ev.kind);
    const mailClass = normalizeText(ev.mail_class);
    const sourceType = normalizeText(ev.source_type);
    const track = normalizeText(ev.track || ev.arc);

    return (
      explicit === "job" ||
      explicit === "jobmail" ||
      type === "job" ||
      type === "jobmail" ||
      track === "career" ||
      track === "job" ||
      mailClass === "job_message" ||
      mailClass === "opportunity_blocked" ||
      mailClass === "career_outcome" ||
      mailClass === "daily_workday" ||
      sourceType === "blocked_job" ||
      sourceType === "workday" ||
      sourceType === "daily_generated" ||
      sourceType === "daily_extra" ||
      sourceType === "brand_progression" ||
      sourceType === "role_outcome" ||
      !!ev.role_content_meta ||
      !!ev.mail_plan_meta ||
      !!ev.career_outcome_meta ||
      !!ev.career_id ||
      !!ev.role_key ||
      !!ev.brand_id ||
      !!ev.brand_name
    );
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

  // Parse-cache nøklet på den rå strengen: getInbox/getMail/hasReceived/canDeliver
  // leser mail-storet tusenvis av ganger under ett svar. Enhver skriver som endrer
  // strengen buster cachen automatisk.
  let _mailCacheRaw = null;
  let _mailCacheParsed = null;
  function parseMailStore() {
    const raw = getRawMailStore();
    if (raw === _mailCacheRaw) return _mailCacheParsed;
    const parsed = safeParse(raw, null);
    _mailCacheRaw = raw;
    _mailCacheParsed = parsed;
    return parsed;
  }

  function getStore() {
    const parsed = parseMailStore();
    if (parsed && Array.isArray(parsed.items)) return normalizeStoreShape(parsed);
    return normalizeStoreShape({ version: 1, items: [] });
  }

  function saveStore(store, options) {
    const opts = options && typeof options === "object" ? options : {};
    ensureMeta(store);
    const serialized = JSON.stringify(store);
    localStorage.setItem(LS_MAIL, serialized);
    // Prim cachen med det vi skrev, så neste lesning slipper re-parse.
    _mailCacheRaw = serialized;
    _mailCacheParsed = store;
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

  // Engangsopprydding per økt for eksisterende saves: gamle lagre kan allerede
  // inneholde flere AKTIVE mailer med samme threadKey (bygd før tråd-dedupe).
  // Eldste aktive instans beholdes; senere aktive duplikater undertrykkes.
  // Besvart/arkivert historikk røres ikke.
  let threadCleanupDone = false;
  function cleanupDuplicateActiveThreadsOnce(store) {
    if (threadCleanupDone) return store;
    threadCleanupDone = true;

    const items = Array.isArray(store?.items) ? store.items : [];
    const oldestByThread = new Map();
    for (const m of items) {
      if (!isActiveThreadItem(m)) continue;
      const threadKey = threadKeyOf(m);
      if (!threadKey) continue;
      const current = oldestByThread.get(threadKey);
      if (!current || String(m.createdAt || "") < String(current.createdAt || "")) {
        oldestByThread.set(threadKey, m);
      }
    }

    let changed = false;
    const now = new Date().toISOString();
    store.items = items.map((m) => {
      if (!isActiveThreadItem(m)) return m;
      const threadKey = threadKeyOf(m);
      if (!threadKey || oldestByThread.get(threadKey) === m) return m;
      changed = true;
      console.warn("[Civication mail dedupe] duplicate threadKey suppressed", threadKey, m?.event?.id || m?.id);
      return suppressEnvelope(m, now);
    });

    if (changed) saveStore(store, { silent: true });
    return store;
  }

  function migrateOldInboxIfNeeded() {
    const parsedMailStore = parseMailStore();

    // If the new mail store already exists, even with an empty items array,
    // this is not a migration case. Returning here prevents read-only calls
    // from repeatedly saving an empty store and dispatching civi:inboxChanged.
    if (parsedMailStore && typeof parsedMailStore === "object" && Array.isArray(parsedMailStore.items)) {
      return cleanupDuplicateActiveThreadsOnce(normalizeStoreShape(parsedMailStore));
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
    return cleanupDuplicateActiveThreadsOnce(next);
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

  function markJobMailIdsRead(ids) {
    const normalized = (Array.isArray(ids) ? ids : [])
      .map(function (value) { return String(value || "").trim(); })
      .filter(Boolean);
    if (!normalized.length) return;
    window.CivicationState?.markJobMailsRead?.(Array.from(new Set(normalized)));
  }

  function markResolved(mailId, eventId, choiceId) {
    const store = migrateOldInboxIfNeeded();
    const now = new Date().toISOString();
    let changed = false;
    const readIds = [mailId, eventId];
    const resolvedThreadKeys = new Set();

    store.items = (store.items || []).map((m) => {
      if (!resolveMailMatch(m, mailId, eventId)) return m;
      changed = true;
      readIds.push(m?.id, m?.event?.id, m?.key);
      const threadKey = threadKeyOf(m);
      if (threadKey) resolvedThreadKeys.add(threadKey);
      return {
        ...m,
        read: true,
        resolved: true,
        resolvedAt: now,
        status: "resolved",
        answeredChoiceId: choiceId || m.answeredChoiceId || null
      };
    });

    // Andre aktive instanser av samme tråd skal ikke bli liggende som åpne
    // saker når casen er besvart — de undertrykkes (arkiveres), historikk
    // som allerede er besvart beholdes urørt.
    if (resolvedThreadKeys.size) {
      store.items = (store.items || []).map((m) => {
        if (resolveMailMatch(m, mailId, eventId)) return m;
        if (!isActiveThreadItem(m)) return m;
        const threadKey = threadKeyOf(m);
        if (!threadKey || !resolvedThreadKeys.has(threadKey)) return m;
        changed = true;
        console.warn("[Civication mail dedupe] duplicate threadKey suppressed", threadKey, m?.event?.id || m?.id);
        return suppressEnvelope(m, now);
      });
    }

    if (changed) {
      saveStore(store);
      markJobMailIdsRead(readIds);
    }
    return changed;
  }

  function suppressDuplicateMail(mailId, threadKey) {
    const id = String(mailId || "").trim();
    if (!id) return false;
    const store = migrateOldInboxIfNeeded();
    const now = new Date().toISOString();
    let changed = false;
    store.items = (store.items || []).map((m) => {
      if (!resolveMailMatch(m, id, id)) return m;
      if (!isActiveThreadItem(m)) return m;
      changed = true;
      console.warn("[Civication mail dedupe] duplicate threadKey suppressed", threadKey || threadKeyOf(m), m?.event?.id || m?.id);
      return suppressEnvelope(m, now);
    });
    if (changed) saveStore(store);
    return changed;
  }


  function mergeByIdPreserveHistory(existingItems, incomingItems) {
    const existing = Array.isArray(existingItems) ? existingItems.slice() : [];
    const incoming = Array.isArray(incomingItems) ? incomingItems : [];
    if (!incoming.length) return existing.slice(0, MAX_INBOX);

    const map = new Map();
    existing.forEach((item) => {
      const id = String(item?.id || item?.event?.id || '').trim();
      if (id) map.set(id, item);
    });

    const mergedIncoming = [];
    incoming.forEach((item) => {
      const normalized = normalizeEnvelope(item);
      const id = String(normalized?.id || normalized?.event?.id || '').trim();
      if (!id) return;
      const prev = map.get(id) || null;
      const next = prev ? { ...prev, ...normalized, event: { ...(prev.event || {}), ...(normalized.event || {}) } } : normalized;
      map.set(id, next);
      mergedIncoming.push(next);
    });

    const seen = new Set();
    const ordered = [];
    for (const item of mergedIncoming) {
      const id = String(item?.id || item?.event?.id || '').trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      ordered.push(item);
    }
    for (const item of existing) {
      const id = String(item?.id || item?.event?.id || '').trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      ordered.push(item);
    }

    return ordered.slice(0, MAX_INBOX);
  }

  // Defensivt sikkerhetsnett når meldingslisten bygges: skulle to AKTIVE
  // mailer med samme threadKey likevel finnes samtidig (generator-bug,
  // race, gammel save midt i en økt), vises kun den eldste. Hovedfiksen er
  // at generatorene ikke lager duplikater — dette er bare siste skanse.
  const warnedInboxThreadKeys = new Set();
  function dedupeActiveInboxItems(items) {
    const oldestByThread = new Map();
    for (const m of items) {
      if (!isActiveThreadItem(m)) continue;
      const threadKey = threadKeyOf(m);
      if (!threadKey) continue;
      const current = oldestByThread.get(threadKey);
      if (!current || String(m.createdAt || "") < String(current.createdAt || "")) {
        oldestByThread.set(threadKey, m);
      }
    }
    return items.filter((m) => {
      if (!isActiveThreadItem(m)) return true;
      const threadKey = threadKeyOf(m);
      if (!threadKey || oldestByThread.get(threadKey) === m) return true;
      if (!warnedInboxThreadKeys.has(threadKey)) {
        warnedInboxThreadKeys.add(threadKey);
        console.warn("[Civication mail dedupe] duplicate threadKey suppressed", threadKey, m?.event?.id || m?.id);
      }
      return false;
    });
  }

  const api = {
    getInbox() {
      const store = migrateOldInboxIfNeeded();
      return dedupeActiveInboxItems((store.items || []).filter((m) => !m.deleted && !m.archived))
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
      // Tråd-vakt: så lenge en AKTIV mail med samme threadKey ligger i
      // innboksen, avvises nye instanser av samme case (re-send av samme id
      // er lov — det er en oppdatering, ikke et duplikat).
      const threadKey = threadKeyOf(mailOrEvent);
      if (threadKey) {
        const existingStore = migrateOldInboxIfNeeded();
        const eventId = String(event?.id || "").trim();
        const activeSameThread = (existingStore.items || []).find((m) =>
          isActiveThreadItem(m) &&
          threadKeyOf(m) === threadKey &&
          String(m?.event?.id || m?.id || "").trim() !== eventId
        );
        if (activeSameThread) {
          console.warn("[Civication mail dedupe] duplicate threadKey suppressed", threadKey, event?.id || event?.subject);
          return { ok: false, reason: "duplicate_thread", threadKey };
        }
      }
      const store = migrateOldInboxIfNeeded();
      const envelope = normalizeEnvelope(mailOrEvent);
      store.items = mergeByIdPreserveHistory(store.items || [], [envelope]);
      ensureMeta(store);
      if (envelope.key) store.meta.delivery.byKey[envelope.key] = envelope.createdAt;
      if (guardType) store.meta.delivery.byType[guardType] = envelope.createdAt;
      if (guardType && guardWeek) store.meta.delivery.byWeek[guardType + "::" + guardWeek] = envelope.createdAt;
      saveStore(store);
      if (isJobRelatedMail(envelope.event)) {
        window.CivicationState?.markJobMailUnread?.(envelope.id || envelope.event?.id);
      }
      return { ok: true, mail: envelope };
    },
    markRead(mailId) {
      const store = migrateOldInboxIfNeeded();
      const readIds = [mailId];
      store.items = (store.items || []).map((m) => {
        if (m.id !== mailId && m?.event?.id !== mailId) return m;
        readIds.push(m?.id, m?.event?.id, m?.key);
        return { ...m, read: true };
      });
      saveStore(store);
      markJobMailIdsRead(readIds);
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
    async answerMail(mailId, choiceId) {
      const mail = this.getMail(mailId);
      const eventId = mail?.event?.id || mailId;
      const result = /** @type {{ ok?: unknown, dailyRuntimeAnswered?: unknown }} */ (window.HG_CiviEngine?.answer
        ? await window.HG_CiviEngine.answer(eventId, choiceId)
        : { ok: false, reason: "no_event_engine" });

      if (result?.ok !== false && result?.dailyRuntimeAnswered !== true) {
        markResolved(mailId, eventId, choiceId);
      }

      return result;
    },
    markResolved,
    suppressDuplicateMail,
    deriveThreadKey: threadKeyOf,
    replaceInbox(items) {
      const store = migrateOldInboxIfNeeded();
      store.items = mergeByIdPreserveHistory(store.items || [], Array.isArray(items) ? items : []);
      saveStore(store);
      return store.items;
    },
    migrateOldInboxIfNeeded
  };

  window.CivicationMailEngine = api;
})();
