(function () {
  "use strict";

  const BATCH_KINDS = new Set(["morning", "workday", "evening", "role_arc", "private_arc"]);
  const PHASE_TAGS = new Set(["morning", "work", "lunch", "afternoon", "evening", "day_end"]);
  const EVENT_TYPES = new Set(["workday", "job_task", "job_consequence", "job_offer", "private_message", "evening_problem", "milestone", "system"]);
  const OUTCOMES = new Set(["promotion", "fired", "stagnation", "warning", "stable"]);

  function safe(fn, fallback) { try { return fn(); } catch (err) { if (window.DEBUG) console.warn("[CiviFlow]", err); return fallback; } }
  function norm(value) { return String(value || "").trim().toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : (value ? [value] : []); }
  function eventOf(item) { return item && item.event ? item.event : item; }
  function idOf(value) { return String(value?.id || value?.event?.id || "").trim(); }
  function getInbox() {
    const fromMail = safe(function () { return window.CivicationMailEngine?.getInbox?.(); }, null);
    if (Array.isArray(fromMail)) return fromMail;
    const fromState = safe(function () { return window.CivicationState?.getInbox?.(); }, null);
    return Array.isArray(fromState) ? fromState : [];
  }
  function pendingOnly(items) { return (Array.isArray(items) ? items : []).filter(function (item) { return String(item?.status || "pending") === "pending"; }); }
  function channelOf(item) {
    const ev = eventOf(item) || {};
    if (norm(ev.channel || ev.messageChannel) === "system" || window.CivicationEventChannels?.classifyEvent?.(ev) === "system") return "system";
    return window.CivicationEventChannels?.getMessageChannel?.(ev) || norm(ev.channel) || "private";
  }
  function withFlowMeta(event, meta) {
    const ev = Object.assign({}, event || {});
    const m = meta || {};
    if (m.batch_id != null && ev.batch_id == null) ev.batch_id = m.batch_id;
    if (BATCH_KINDS.has(norm(m.batch_kind)) && ev.batch_kind == null) ev.batch_kind = norm(m.batch_kind);
    if (Number.isFinite(Number(m.sequence_index)) && ev.sequence_index == null) ev.sequence_index = Number(m.sequence_index);
    if ((m.channel === "job" || m.channel === "private" || m.channel === "system") && ev.channel == null) ev.channel = m.channel;
    if (ev.phase_tag == null && norm(m.phase_tag)) ev.phase_tag = norm(m.phase_tag);
    if (EVENT_TYPES.has(norm(m.event_type)) && ev.event_type == null) ev.event_type = norm(m.event_type);
    return ev;
  }
  function getPendingByChannel(channel) {
    const want = norm(channel);
    return pendingOnly(getInbox()).filter(function (item) { return channelOf(item) === want; });
  }
  function getPendingJobMails() { return getPendingByChannel("job"); }
  function getPendingPrivateMessages() { return getPendingByChannel("private"); }
  function isPrivatePhase(ev) { return [ev?.phase_tag, ev?.phase, ev?.slot, ev?.mail_class, ev?.event_type].map(norm).some(function (v) { return v === "private" || v === "evening" || v === "life" || v === "private_message" || v === "evening_problem"; }); }
  function getActiveWorkdayItem() {
    return pendingOnly(getInbox()).find(function (item) {
      const ev = eventOf(item) || {};
      if (isPrivatePhase(ev) || channelOf(item) !== "job") return false;
      return ev.event_type === "workday" || ev.event_type === "job_task" || window.CivicationEventChannels?.isWorkdayEvent?.(ev) === true || !!(ev.task_id || ev.task_domain || ev.task_kind);
    }) || null;
  }
  function enqueueBatch(batch, options) {
    const list = Array.isArray(batch) ? batch : asArray(batch?.events || batch?.items || batch?.mails);
    const opts = Object.assign({}, batch && !Array.isArray(batch) ? batch : {}, options || {});
    const batchId = opts.batch_id || opts.id || `batch_${Date.now()}`;
    const sent = [];
    list.forEach(function (event, index) {
      const ev = withFlowMeta(eventOf(event), Object.assign({}, opts, { batch_id: batchId, sequence_index: event?.sequence_index ?? index }));
      const res = window.CivicationMailEngine?.sendMail?.(ev);
      if (res?.ok) sent.push(res.mail || ev);
    });
    return { ok: true, batch_id: batchId, sent: sent };
  }
  function findFollowupEvent(followupId, sourceEvent, choice, result) {
    const fid = String(followupId || "").trim();
    if (!fid) return null;
    const pools = [result?.followups, result?.events, sourceEvent?.followups, sourceEvent?.threads, sourceEvent?.consequence_threads, window["CivicationIncomingFollowups"], window["CivicationMailCatalog"], window["CivicationEventCatalog"]];
    for (const pool of pools) {
      if (Array.isArray(pool)) { const hit = pool.find(function (e) { return idOf(e) === fid; }); if (hit) return eventOf(hit); }
      else if (pool && typeof pool === "object" && pool[fid]) return eventOf(pool[fid]);
    }
    if (window.CivicationThreadBridge?.enqueueThread) return { id: fid, __threadBridgeOnly: true };
    return null;
  }
  function followupIdFor(event, choiceId, choice) {
    const cid = String(choiceId || choice?.id || "").trim();
    return choice?.followup_on_choice || choice?.next_on_choice || choice?.triggers_on_choice || event?.followup_on_choice?.[cid] || event?.next_on_choice?.[cid] || event?.triggers_on_choice?.[cid];
  }
  function enqueueFollowup(eventId, choiceId, result) {
    const item = getInbox().find(function (row) { return idOf(row) === String(eventId || ""); });
    const event = eventOf(item) || result?.event || {};
    const choice = (event.choices || []).find(function (c) { return String(c?.id) === String(choiceId); }) || result?.choice || {};
    const fid = followupIdFor(event, choiceId, choice);
    if (!fid) return { ok: false, reason: "no_followup" };
    if (choice?.triggers_on_choice === fid && window.CivicationThreadBridge?.enqueueThread) return window.CivicationThreadBridge.enqueueThread(fid, { triggeredBy: eventId, choiceId: choiceId });
    const followup = findFollowupEvent(fid, event, choice, result);
    if (followup?.__threadBridgeOnly && window.CivicationThreadBridge?.enqueueThread) return window.CivicationThreadBridge.enqueueThread(fid, { triggeredBy: eventId, choiceId: choiceId });
    if (!followup) return { ok: false, reason: "missing_followup" };
    const ev = withFlowMeta(followup, { channel: followup.channel || channelOf(event), phase_tag: followup.phase_tag || event.phase_tag, batch_id: event.batch_id, batch_kind: event.batch_kind, event_type: followup.event_type || (channelOf(event) === "job" ? "job_consequence" : "private_message") });
    return window.CivicationMailEngine?.sendMail?.(ev) || { ok: false, reason: "no_mail_engine" };
  }
  function mergeDelta(out, delta) { if (!delta || typeof delta !== "object") return; Object.keys(delta).forEach(function (k) { const n = Number(delta[k]); out[k] = (out[k] || 0) + (Number.isFinite(n) ? n : 0); }); }
  function normalizeConsequences(event, choice, result) {
    const delta = {};
    [event?.delta, choice?.delta, result?.delta, event?.brand_consequence?.delta, choice?.brand_consequence?.delta, result?.brand_consequence?.delta, event?.consequences, choice?.consequences, result?.consequences, event?.psyche_delta, choice?.psyche_delta, result?.psyche_delta, event?.career_delta, choice?.career_delta, result?.career_delta, event?.capital_delta, choice?.capital_delta, result?.capital_delta, event?.relationship_delta, choice?.relationship_delta, result?.relationship_delta].forEach(function (d) { mergeDelta(delta, d); });
    const rawOutcome = norm(result?.career_outcome || result?.job_outcome || result?.role_outcome || result?.stability || choice?.career_outcome || choice?.job_outcome || choice?.role_outcome || choice?.stability || event?.career_outcome || event?.job_outcome || event?.role_outcome || event?.stability);
    return { delta: delta, outcome: OUTCOMES.has(rawOutcome) ? rawOutcome : null, entries: Object.keys(delta).map(function (key) { return { key: key, delta: delta[key] }; }) };
  }
  function shouldWriteConsequences(result) {
    return result?.applyConsequences === true || result?.consequences_applied === false || result?.effects_applied === false;
  }
  function applyConsequences(event, choice, result) {
    const model = normalizeConsequences(event, choice, result);
    if (!shouldWriteConsequences(result)) return Object.assign({ ok: true, read_only: true, applied: false }, model);
    safe(function () { window.CivicationPsyche?.applyDelta?.(model.delta); }, null);
    safe(function () { window.CivicationState?.applyDelta?.(model.delta); }, null);
    safe(function () { window.CivicationState?.applyCareerDelta?.(model.delta); }, null);
    safe(function () { window["HG_CapitalEngine"]?.applyDelta?.(model.delta); }, null);
    return Object.assign({ ok: true, read_only: false, applied: true }, model);
  }
  function inspect() { const inbox = getInbox(); return { inbox: inbox, pending: pendingOnly(inbox), job: getPendingJobMails(), private: getPendingPrivateMessages(), activeWorkday: getActiveWorkdayItem(), channels: window.CivicationEventChannels?.inspect?.(inbox) || null }; }

  window["CivicationIncomingFlow"] = { getInbox, getPendingByChannel, getPendingJobMails, getPendingPrivateMessages, getActiveWorkdayItem, enqueueBatch, enqueueFollowup, applyConsequences, normalizeConsequences, inspect };
})();
