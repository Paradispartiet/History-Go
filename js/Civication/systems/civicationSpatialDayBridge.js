// js/Civication/systems/civicationSpatialDayBridge.js
// Spatial projection of Civication's existing day/mail truth onto the city map.
// Does not own day progression: NextActionSelector + DayProgression remain authoritative.
(function (globalScope) {
  "use strict";

  const W = /** @type {any} */ (globalScope);
  const PHASES = ["morning", "forenoon", "workday", "lunch", "afternoon", "dinner", "evening", "day_end"];
  const ROOT_ID = "civiSpatialDayLayer";
  const PLAN_ID = "civiSpatialDayPlan";
  const ACTION_ID = "civiSpatialActionContext";
  const PATCH = Symbol.for("civicationSpatialDayBridgePatch");

  function norm(value) { return String(value == null ? "" : value).trim(); }
  function cleanObject(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
  function humanize(value) {
    return norm(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ").replace(/^./, (c) => c.toUpperCase());
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function first() {
    for (let i = 0; i < arguments.length; i += 1) {
      const value = norm(arguments[i]);
      if (value) return value;
    }
    return "";
  }
  function eventOf(item) { return item?.event || item || {}; }
  function phaseOf(mail) {
    return first(mail?.phase, mail?.phase_tag, mail?.daily_mail_meta?.phase, mail?.phaseId).toLowerCase();
  }
  function statusOf(row) { return first(row?.status, row?.event?.status, "queued").toLowerCase(); }
  function isOpenStatus(status) { return ["queued", "pending", "delivered", "open"].includes(norm(status).toLowerCase()); }
  function activePosition() {
    try { return W.CivicationState?.getActivePosition?.() || null; } catch { return null; }
  }
  function homeSnapshot() {
    try { return W.CivicationHome?.getState?.() || null; } catch { return null; }
  }
  function homeDistrict() {
    const home = homeSnapshot();
    return first(home?.currentDistrictId, home?.home?.district, home?.currentDistrict?.id);
  }
  function homeLabel() {
    const id = homeDistrict();
    if (!id) return "Hjemme";
    const districts = Array.isArray(W.CIVI_MAP_DISTRICTS) ? W.CIVI_MAP_DISTRICTS : [];
    const hit = districts.find((row) => norm(row?.id) === id);
    return hit?.name ? `Hjemme i ${hit.name}` : `Hjemme i ${humanize(id)}`;
  }
  function employerDistrict(active) {
    const ctx = cleanObject(active?.employer_context);
    return first(ctx.district, ctx.districtId, ctx.mapZone, active?.district_id, active?.mapZone);
  }
  function employerPlace(active) {
    const ctx = cleanObject(active?.employer_context);
    return first(ctx.place_id, ctx.placeId, ctx.sourcePlaceId, active?.brand_place_id, active?.place_id, active?.workplace_place_id);
  }
  function employerLabel(active) {
    return first(active?.brand_name, active?.workplace, active?.employer_name, active?.title, "Arbeidsplassen");
  }
  function isWorkMail(mail, phase) {
    const text = [mail?.mail_class, mail?.channel, mail?.messageChannel, mail?.source_type, mail?.role_scope, mail?.task_domain]
      .map((v) => norm(v).toLowerCase()).join(" ");
    if (mail?.go_to_work === true) return true;
    if (/daily_workday|\bjob\b|planned|workday/.test(text)) return true;
    return ["forenoon", "workday"].includes(phase);
  }
  function inferPurpose(mail, phase) {
    const text = [mail?.purpose, mail?.mail_type, mail?.task_domain, mail?.slot, mail?.daily_mail_meta?.slot]
      .map((v) => norm(v).toLowerCase()).join(" ");
    if (mail?.go_to_work || /go_to_work|workday|job/.test(text)) return "work";
    if (/meeting|people|social|coffee|lunch/.test(text)) return "meeting";
    if (/shop|store|commercial|handel/.test(text)) return "errand";
    if (/culture|event|debate/.test(text)) return "event";
    if (["morning", "dinner", "day_end"].includes(phase)) return "home";
    return "activity";
  }

  function normalizeMapContext(value) {
    const src = cleanObject(value);
    const placeId = first(src.place_id, src.placeId, src.sourcePlaceId);
    const districtId = first(src.district_id, src.districtId, src.mapZone);
    const label = first(src.label, src.place_label, src.placeName, src.location_label, placeId ? humanize(placeId) : "", districtId ? humanize(districtId) : "");
    if (!placeId && !districtId && !label) return null;
    return {
      place_id: placeId || null,
      district_id: districtId || null,
      label: label || null,
      purpose: first(src.purpose, "activity"),
      relevance: first(src.relevance, "contextual"),
      action_label: first(src.action_label, src.actionLabel, "Vis på kart"),
      source: first(src.source, "explicit")
    };
  }

  function resolveMailContext(mail, activeOverride) {
    const ev = eventOf(mail);
    const active = activeOverride || activePosition() || {};
    const explicit = normalizeMapContext(ev.map_context || mail?.map_context);
    if (explicit) return explicit;

    const taskPayload = cleanObject(ev.task_payload || mail?.task_payload);
    const phase = phaseOf(ev) || phaseOf(mail);
    const placeId = first(
      ev.place_id, ev.placeId, ev.sourcePlaceId, ev.brand_place_id, ev.target_place_id,
      taskPayload.place_id, taskPayload.placeId,
      ev.location?.place_id, ev.location?.placeId, ev.location?.sourcePlaceId
    );
    const districtId = first(
      ev.district_id, ev.districtId, ev.mapZone, ev.map_zone,
      ev.location?.district_id, ev.location?.districtId, ev.location?.mapZone
    );
    const directLabel = first(ev.place_name, ev.placeName, ev.location_label, ev.location?.label, ev.location?.name);
    if (placeId || districtId) {
      return {
        place_id: placeId || null,
        district_id: districtId || null,
        label: directLabel || (placeId ? humanize(placeId) : humanize(districtId)),
        purpose: inferPurpose(ev, phase),
        relevance: ev.required === false || ev.optional === true ? "optional" : "required",
        action_label: "Vis på kart",
        source: "mail"
      };
    }

    if (isWorkMail(ev, phase)) {
      const workPlace = employerPlace(active);
      const workDistrict = employerDistrict(active);
      if (workPlace || workDistrict || active?.title || active?.brand_name) {
        return {
          place_id: workPlace || null,
          district_id: workDistrict || null,
          label: employerLabel(active),
          purpose: ev.go_to_work === true ? "commute" : "work",
          relevance: "required",
          action_label: ev.go_to_work === true ? "Gå til jobb" : "Vis arbeidssted",
          source: "active_position"
        };
      }
    }

    if (["morning", "dinner", "day_end"].includes(phase)) {
      const district = homeDistrict();
      return {
        place_id: null,
        district_id: district || null,
        label: homeLabel(),
        purpose: "home",
        relevance: "contextual",
        action_label: "Vis hjemme",
        source: "home"
      };
    }

    return null;
  }

  function rawRuntimeRows() {
    try {
      const runtime = W.CivicationDailyMailBuilder?.inspect?.()?.runtime;
      return Array.isArray(runtime?.items) ? runtime.items : [];
    } catch { return []; }
  }
  function inboxRows() {
    try {
      const rows = W.CivicationMailEngine?.getInbox?.() || W.CivicationState?.getInbox?.() || [];
      return Array.isArray(rows) ? rows : [];
    } catch { return []; }
  }
  function findRawMailById(id) {
    const wanted = norm(id);
    if (!wanted) return null;
    for (const row of rawRuntimeRows()) {
      const ev = eventOf(row);
      if (norm(ev?.id || row?.id) === wanted) return ev;
    }
    for (const row of inboxRows()) {
      const ev = eventOf(row);
      if (norm(ev?.id || row?.id) === wanted) return ev;
    }
    return null;
  }

  function enrichAction(action) {
    if (!action || typeof action !== "object") return action;
    if (action.map_context) return action;
    let task = null;
    try { task = W.CivicationTaskEngine?.getTaskByMailId?.(action.id) || null; } catch {}
    const fromTask = normalizeMapContext(task?.map_context);
    const raw = findRawMailById(action.id) || action;
    const mapContext = fromTask || resolveMailContext(raw) || resolveMailContext(task);
    return mapContext ? { ...action, map_context: mapContext } : action;
  }

  function phaseRank(value) {
    const idx = PHASES.indexOf(norm(value).toLowerCase());
    return idx < 0 ? 99 : idx;
  }
  function getCurrentAction() {
    try { return enrichAction(W.CivicationNextActionSelector?.getCurrent?.() || null); } catch { return null; }
  }
  function getDayPlan() {
    const current = getCurrentAction();
    const currentId = norm(current?.id);
    const rows = rawRuntimeRows()
      .filter((row) => isOpenStatus(statusOf(row)))
      .map((row, index) => {
        const ev = eventOf(row);
        const id = norm(ev?.id || row?.id);
        const phase = phaseOf(ev) || phaseOf(row);
        return {
          id,
          subject: first(ev?.subject, row?.subject, "Hendelse"),
          phase,
          status: statusOf(row),
          map_context: resolveMailContext(ev),
          index
        };
      })
      .filter((row) => row.id && row.map_context)
      .sort((a, b) => phaseRank(a.phase) - phaseRank(b.phase) || a.index - b.index);

    let ordered = rows;
    const currentIndex = rows.findIndex((row) => row.id === currentId);
    if (currentIndex > 0) ordered = rows.slice(currentIndex).concat(rows.slice(0, currentIndex));

    const out = [];
    if (current?.map_context) {
      out.push({ state: "now", id: currentId, subject: current.subject || "Neste handling", phase: current.phase || "", map_context: current.map_context, action: current });
    }
    for (const row of ordered) {
      if (row.id === currentId) continue;
      if (out.length >= 3) break;
      out.push({ state: out.length === 0 ? "now" : (out.length === 1 ? "next" : "later"), ...row });
    }
    return out.slice(0, 3).map((row, index) => ({ ...row, state: index === 0 ? "now" : index === 1 ? "next" : "later" }));
  }

  function contextAnchor(context) {
    const ctx = normalizeMapContext(context);
    if (!ctx) return null;
    return { sourcePlaceId: ctx.place_id || null, mapZone: ctx.district_id || null };
  }

  function openMap(context) {
    document.body?.classList.add("civi-mapmode");
    try { W.CivicationSystemMap?.render?.(); } catch {}
    try { W.CivicationSystemMap?.scheduleRender?.(); } catch {}
    try {
      W.dispatchEvent(new CustomEvent("civi:spatialFocusChanged", { detail: { map_context: normalizeMapContext(context), ts: Date.now() } }));
    } catch {}
    scheduleRender();
    return true;
  }
  function openAction(action) {
    const enriched = enrichAction(action || getCurrentAction());
    if (!enriched?.map_context) return false;
    return openMap(enriched.map_context);
  }

  function persistTaskMapContext(task, mail, active) {
    if (!task || task.map_context) return task;
    const mapContext = resolveMailContext(mail, active);
    if (!mapContext) return task;
    const engine = W.CivicationTaskEngine;
    if (!engine?.getStore || !engine?.setStore || !task.id) return { ...task, map_context: mapContext };
    try {
      const store = engine.getStore();
      if (!store?.byId?.[task.id]) return { ...task, map_context: mapContext };
      const nextTask = { ...store.byId[task.id], map_context: mapContext };
      store.byId[task.id] = nextTask;
      engine.setStore(store);
      return nextTask;
    } catch { return { ...task, map_context: mapContext }; }
  }

  function backfillOpenTaskContexts() {
    const engine = W.CivicationTaskEngine;
    if (!engine?.getStore || !engine?.setStore) return 0;
    try {
      const store = engine.getStore();
      const ids = Array.isArray(store?.order) ? store.order : Object.keys(store?.byId || {});
      let changed = 0;
      ids.forEach((id) => {
        const task = store?.byId?.[id];
        if (!task || task.status !== "open" || task.map_context) return;
        const mail = findRawMailById(task.mail_id) || task;
        const ctx = resolveMailContext(mail);
        if (!ctx) return;
        store.byId[id] = { ...task, map_context: ctx };
        changed += 1;
      });
      if (changed) engine.setStore(store);
      return changed;
    } catch { return 0; }
  }

  function patchTaskEngine() {
    const engine = W.CivicationTaskEngine;
    if (!engine || engine[PATCH]) return false;
    ["createTaskForMail", "ensureTaskForMail"].forEach((name) => {
      const original = engine[name];
      if (typeof original !== "function") return;
      engine[name] = function (mail, active, options) {
        return persistTaskMapContext(original.call(engine, mail, active, options), mail, active);
      };
    });
    engine[PATCH] = true;
    backfillOpenTaskContexts();
    return true;
  }

  function patchNextActionSelector() {
    const selector = W.CivicationNextActionSelector;
    if (!selector || selector[PATCH] || typeof selector.getCurrent !== "function") return false;
    const original = selector.getCurrent;
    selector.getCurrent = function () { return enrichAction(original.call(selector)); };
    selector[PATCH] = true;
    return true;
  }

  function ensureStyles() {
    if (document.getElementById("civiSpatialDayStyles")) return;
    const style = document.createElement("style");
    style.id = "civiSpatialDayStyles";
    style.textContent = `
      #${ROOT_ID}{position:absolute;inset:0;z-index:55;pointer-events:none}
      #${ROOT_ID} .civi-spatial-marker{position:absolute;transform:translate(-50%,-115%);pointer-events:auto;border:1px solid rgba(255,255,255,.28);background:rgba(9,12,18,.9);color:#fff;border-radius:999px;padding:5px 9px;font:700 11px/1.2 system-ui;box-shadow:0 8px 26px rgba(0,0,0,.38);white-space:nowrap}
      #${ROOT_ID} .civi-spatial-marker[data-state="now"]{outline:2px solid rgba(255,209,102,.72)}
      #${ROOT_ID} .civi-spatial-marker[data-state="next"]{opacity:.88}
      #${ROOT_ID} .civi-spatial-marker[data-state="later"]{opacity:.64}
      #${ROOT_ID} .civi-spatial-dock{position:absolute;left:12px;bottom:12px;pointer-events:auto;max-width:min(430px,calc(100% - 24px));background:rgba(9,12,18,.92);border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:8px;color:#fff;font:12px/1.35 system-ui}
      #${ROOT_ID} .civi-spatial-dock strong{display:block;margin-bottom:3px}
      .civi-spatial-context{margin:10px 0 0;padding:9px 10px;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:rgba(255,255,255,.035)}
      .civi-spatial-context-line{display:flex;align-items:center;justify-content:space-between;gap:10px}.civi-spatial-context-label{min-width:0}.civi-spatial-context-label small{display:block;opacity:.68}.civi-spatial-context-label strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .civi-spatial-map-btn{border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:inherit;border-radius:8px;padding:6px 9px;font:inherit;cursor:pointer;white-space:nowrap}
      #${PLAN_ID}{margin-top:12px;padding:10px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.025)}
      #${PLAN_ID} h4{margin:0 0 7px}#${PLAN_ID} ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}#${PLAN_ID} li{display:flex;align-items:center;gap:8px}#${PLAN_ID} .civi-spatial-state{width:54px;opacity:.7;font-size:11px;text-transform:uppercase}#${PLAN_ID} .civi-spatial-copy{flex:1;min-width:0}#${PLAN_ID} .civi-spatial-copy strong,#${PLAN_ID} .civi-spatial-copy small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#${PLAN_ID} .civi-spatial-copy small{opacity:.65}
    `;
    document.head.appendChild(style);
  }

  function positionMarker(marker, context) {
    const ctx = normalizeMapContext(context);
    const loc = contextAnchor(ctx);
    const resolver = W.CivicationCityLayer?.resolveLocationAnchor;
    let anchor = loc && typeof resolver === "function" ? resolver(loc) : null;

    // ThreeMap can project world coordinates, while CityLayer cannot always
    // resolve a History Go place directly in 3D. Use ThreeMap's own real place
    // projection as the final exact anchor before docking an unanchored item.
    if (!anchor && ctx?.place_id && W.CivicationThreeMap?.isActive?.()) {
      try {
        const debug = W.CivicationThreeMap.getProjectionDebug?.(ctx.place_id);
        const normalized = debug?.found ? debug.normalized : null;
        const screen = normalized && W.CivicationThreeMap.projectNormalizedToScreen?.(normalized.x, normalized.y);
        if (screen && Number.isFinite(screen.x) && Number.isFinite(screen.y)) {
          anchor = { mode: "screen", x: screen.x, y: screen.y };
        }
      } catch {}
    }

    if (!anchor) return false;
    if (anchor.mode === "screen") {
      marker.style.left = `${anchor.x.toFixed(1)}px`;
      marker.style.top = `${anchor.y.toFixed(1)}px`;
    } else {
      marker.style.left = `${(anchor.x * 100).toFixed(2)}%`;
      marker.style.top = `${(anchor.y * 100).toFixed(2)}%`;
    }
    return true;
  }

  function renderMapLayer() {
    if (typeof document === "undefined") return null;
    const host = document.getElementById("civiMapWorld");
    if (!host) return null;
    ensureStyles();
    let layer = document.getElementById(ROOT_ID);
    if (!layer) {
      layer = document.createElement("div");
      layer.id = ROOT_ID;
      layer.setAttribute("aria-label", "Dagens steder");
      host.appendChild(layer);
    }
    layer.innerHTML = "";
    const plan = getDayPlan();
    const unanchored = [];
    const labels = { now: "Nå", next: "Neste", later: "Senere" };
    plan.forEach((row) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "civi-spatial-marker";
      button.dataset.state = row.state;
      button.dataset.spatialMailId = row.id || "";
      button.textContent = `${labels[row.state]} · ${row.map_context.label || row.subject}`;
      button.title = `${row.subject} · ${row.map_context.label || ""}`;
      if (row.state !== "now") button.setAttribute("aria-label", `${labels[row.state]}: ${row.subject}`);
      if (!positionMarker(button, row.map_context)) { unanchored.push(row); return; }
      layer.appendChild(button);
    });
    if (unanchored.length) {
      const dock = document.createElement("div");
      dock.className = "civi-spatial-dock";
      dock.innerHTML = `<strong>Dagens steder</strong>${unanchored.map((row) => `${escapeHtml(labels[row.state])}: ${escapeHtml(row.map_context.label || row.subject)}`).join(" · ")}`;
      layer.appendChild(dock);
    }
    return layer;
  }

  function mapContextHtml(action) {
    const ctx = action?.map_context;
    if (!ctx) return "";
    const purpose = ctx.purpose ? humanize(ctx.purpose) : "Sted";
    return `<div id="${ACTION_ID}" class="civi-spatial-context"><div class="civi-spatial-context-line"><div class="civi-spatial-context-label"><small>${escapeHtml(purpose)}</small><strong>📍 ${escapeHtml(ctx.label || ctx.place_id || ctx.district_id || "Sted")}</strong></div><button type="button" class="civi-spatial-map-btn" data-civi-spatial-open-map="1">${escapeHtml(ctx.action_label || "Vis på kart")}</button></div></div>`;
  }

  function decorateNextAction() {
    const body = document.getElementById("civiNextActionModalBody");
    if (!body) return false;
    body.querySelector(`#${ACTION_ID}`)?.remove();
    const action = getCurrentAction();
    const html = mapContextHtml(action);
    if (!html) return false;
    const card = body.querySelector(".civi-next-action-card") || body;
    card.insertAdjacentHTML("beforeend", html);
    return true;
  }

  function stateLabel(value) { return value === "now" ? "Nå" : value === "next" ? "Neste" : "Senere"; }
  function decorateMinDay() {
    const panel = document.getElementById("civiLifestoryPanel");
    if (!panel) return false;
    panel.querySelector(`#${PLAN_ID}`)?.remove();
    const plan = getDayPlan();
    if (!plan.length) return false;
    const section = document.createElement("section");
    section.id = PLAN_ID;
    section.setAttribute("aria-label", "Dagens steder");
    section.innerHTML = `<h4>Dagens steder</h4><ul>${plan.map((row) => `<li><span class="civi-spatial-state">${stateLabel(row.state)}</span><span class="civi-spatial-copy"><strong>${escapeHtml(row.subject)}</strong><small>📍 ${escapeHtml(row.map_context.label || row.map_context.place_id || row.map_context.district_id || "Sted")}</small></span><button type="button" class="civi-spatial-map-btn" data-civi-spatial-plan-id="${escapeHtml(row.id || "")}">Kart</button></li>`).join("")}</ul>`;
    panel.appendChild(section);
    return true;
  }

  function patchNextActionUI() {
    const ui = W.CivicationNextActionUI;
    if (!ui || ui[PATCH]) return false;
    ["open", "render", "refresh"].forEach((name) => {
      const original = ui[name];
      if (typeof original !== "function") return;
      ui[name] = function () {
        const result = original.apply(ui, arguments);
        setTimeout(() => { try { decorateNextAction(); } catch {} }, 0);
        return result;
      };
    });
    ui[PATCH] = true;
    return true;
  }

  function renderAll() {
    patchTaskEngine();
    backfillOpenTaskContexts();
    patchNextActionSelector();
    patchNextActionUI();
    renderMapLayer();
    decorateNextAction();
    decorateMinDay();
  }
  let queued = false;
  function scheduleRender() {
    if (queued) return;
    queued = true;
    setTimeout(() => { queued = false; try { renderAll(); } catch (error) { if (W.DEBUG) console.warn("[CivicationSpatialDayBridge] render", error); } }, 0);
  }

  function findPlanRow(id) {
    const wanted = norm(id);
    return getDayPlan().find((row) => norm(row.id) === wanted) || null;
  }
  function handleClick(event) {
    const target = event?.target;
    if (!target?.closest) return;
    const mapBtn = target.closest("[data-civi-spatial-open-map]");
    if (mapBtn) { event.preventDefault(); openAction(getCurrentAction()); return; }
    const planBtn = target.closest("[data-civi-spatial-plan-id]");
    if (planBtn) {
      event.preventDefault();
      const row = findPlanRow(planBtn.getAttribute("data-civi-spatial-plan-id"));
      if (row?.map_context) openMap(row.map_context);
      return;
    }
    const marker = target.closest("[data-spatial-mail-id]");
    if (marker) {
      event.preventDefault();
      const id = marker.getAttribute("data-spatial-mail-id");
      const row = findPlanRow(id);
      if (row?.state === "now") W.CivicationNextActionUI?.open?.();
      else if (row?.map_context) openMap(row.map_context);
    }
  }

  function boot() {
    if (typeof document === "undefined") return false;
    document.addEventListener("click", handleClick);
    ["civi:dataReady", "civi:booted", "civi:dayPhaseChanged", "civi:inboxChanged", "civi:lifestoryChanged", "civi:mapRendered", "civi:canvasMapTransformChanged", "civi:threeMapTransformChanged", "updateProfile", "resize"].forEach((name) => W.addEventListener(name, scheduleRender));
    [0, 120, 500, 1400].forEach((ms) => setTimeout(scheduleRender, ms));
    return true;
  }

  const api = {
    PHASES,
    normalizeMapContext,
    resolveMailContext,
    enrichAction,
    getDayPlan,
    contextAnchor,
    openMap,
    openAction,
    persistTaskMapContext,
    backfillOpenTaskContexts,
    patchTaskEngine,
    patchNextActionSelector,
    patchNextActionUI,
    renderMapLayer,
    decorateNextAction,
    decorateMinDay,
    scheduleRender,
    boot
  };
  W.CivicationSpatialDayBridge = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
    else boot();
  }
})(typeof window !== "undefined" ? window : globalThis);
