// js/Civication/ui/CivicationBrandJobUI.js
// Presentasjonslag for brand-jobb-state.
// Leser kun eksisterende state og injiserer en kompakt blokk i Aktiv rolle-panelet.

(function () {
  "use strict";

  const BRAND_STATE_KEY = "hg_brand_job_state_v1";
  const PROGRESSION_KEY = "hg_brand_job_progression_v1";
  const BLOCK_ID = "civiBrandJobStateBlock";

  const METRIC_LABELS = {
    brand_tillit: "Brand-tillit",
    leder_tillit: "Leder",
    kollega_tillit: "Kollega",
    kundetillit: "Kunder",
    faglighet: "Faglighet",
    driftsflyt: "Driftsflyt",
    salgserfaring: "Salg",
    stress: "Stress",
    risiko: "Risiko",
    integritet: "Integritet"
  };

  const BRAND_METRICS = {
    norli: ["kundetillit", "faglighet", "brand_tillit", "risiko", "stress"],
    narvesen: ["kundetillit", "driftsflyt", "brand_tillit", "risiko", "stress"]
  };

  function safeParse(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function norm(value) {
    return String(value || "").trim();
  }

  function slugify(value) {
    return norm(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getActivePosition() {
    return window.CivicationState?.getActivePosition?.() || safeParse("hg_active_position_v1", null);
  }

  function resolveRoleScope(active) {
    const resolved = window.CivicationCareerRoleResolver?.resolveCareerRoleScope?.(active);
    if (resolved && resolved !== "unknown") return slugify(resolved);
    const roleId = slugify(active?.role_id || active?.role_key || active?.title || "");
    if (roleId.includes("ekspedit")) return "ekspeditor";
    if (roleId.includes("fagarbeider")) return "fagarbeider";
    if (roleId.includes("mellomleder")) return "mellomleder";
    return roleId;
  }

  function getBrandRoleEntry(active) {
    const brandId = slugify(active?.brand_id || active?.employer_context?.brand_id || "");
    if (!brandId) return null;
    const roleScope = resolveRoleScope(active);
    if (!roleScope) return null;

    const state = window.CivicationBrandJobState?.getState?.() || safeParse(BRAND_STATE_KEY, null);
    const byBrandRole = state?.byBrandRole && typeof state.byBrandRole === "object" ? state.byBrandRole : {};
    const key = `${brandId}:${roleScope}`;

    return {
      key,
      brand_id: brandId,
      brand_name: norm(active?.brand_name || active?.employer_context?.brand_name || byBrandRole[key]?.brand_name || brandId),
      role_scope: roleScope,
      entry: byBrandRole[key] || null
    };
  }

  function getProgressionItems(activeInfo) {
    if (!activeInfo?.brand_id || !activeInfo?.role_scope) return [];

    const progression = window.CivicationBrandJobProgression?.getState?.() || safeParse(PROGRESSION_KEY, null);
    const triggered = progression?.triggered && typeof progression.triggered === "object" ? progression.triggered : {};

    return Object.values(triggered)
      .filter(function (item) {
        return slugify(item?.brand_id) === activeInfo.brand_id && slugify(item?.role_scope) === activeInfo.role_scope;
      })
      .sort(function (a, b) {
        return new Date(b?.at || 0).getTime() - new Date(a?.at || 0).getTime();
      });
  }

  function metricClass(value) {
    const n = Number(value || 0);
    if (n >= 3) return "is-high";
    if (n <= -2) return "is-low";
    if (n > 0) return "is-positive";
    if (n < 0) return "is-negative";
    return "is-neutral";
  }

  function renderMetrics(activeInfo) {
    const metrics = activeInfo?.entry?.metrics || {};
    const preferred = BRAND_METRICS[activeInfo.brand_id] || ["kundetillit", "brand_tillit", "risiko", "stress"];

    return preferred.map(function (key) {
      const value = Number(metrics?.[key] || 0);
      return `
        <div class="civi-brand-metric ${metricClass(value)}">
          <span>${escapeHTML(METRIC_LABELS[key] || key)}</span>
          <strong>${value}</strong>
        </div>
      `;
    }).join("");
  }

  function renderMilestone(activeInfo) {
    const items = getProgressionItems(activeInfo);
    const latest = items[0] || null;

    if (!latest) {
      return `
        <div class="civi-brand-milestone is-empty">
          <span>Milestone</span>
          <strong>Ingen utløst ennå</strong>
          <small>Brandmail-valg kan åpne mer ansvar, advarsler eller nye situasjoner.</small>
        </div>
      `;
    }

    const when = latest.at ? new Date(latest.at).toLocaleDateString("no-NO") : "—";
    const metric = METRIC_LABELS[latest.metric] || latest.metric || "Metric";
    const label = latest.mail_id
      ? latest.mail_id
          .replace(/^brand_progress_/, "")
          .replace(/_/g, " ")
      : "Milestone";

    return `
      <div class="civi-brand-milestone">
        <span>Siste milestone</span>
        <strong>${escapeHTML(label)}</strong>
        <small>${escapeHTML(metric)} ${Number(latest.value ?? latest.threshold ?? 0)} · ${escapeHTML(when)}</small>
      </div>
    `;
  }

  function renderBlock() {
    const host = document.getElementById("activeJobCard");
    if (!host) return false;

    const active = getActivePosition();
    const existing = document.getElementById(BLOCK_ID);

    if (!active || !active.brand_id) {
      if (existing) existing.remove();
      return false;
    }

    const activeInfo = getBrandRoleEntry(active);
    if (!activeInfo) {
      if (existing) existing.remove();
      return false;
    }

    const answered = Array.isArray(activeInfo.entry?.answered_mail_ids)
      ? activeInfo.entry.answered_mail_ids.length
      : 0;

    const blockHTML = `
      <div id="${BLOCK_ID}" class="civi-brand-job-state" aria-label="Brand-jobbstatus">
        <div class="civi-brand-head">
          <div>
            <span>Arbeidsgiver</span>
            <strong>${escapeHTML(activeInfo.brand_name)}</strong>
          </div>
          <small>${escapeHTML(activeInfo.role_scope)} · ${answered} brandvalg</small>
        </div>

        <div class="civi-brand-metrics">
          ${renderMetrics(activeInfo)}
        </div>

        ${renderMilestone(activeInfo)}
      </div>
    `;

    if (existing) {
      existing.outerHTML = blockHTML;
    } else {
      host.insertAdjacentHTML("beforeend", blockHTML);
    }

    return true;
  }

  function refresh() {
    window.setTimeout(renderBlock, 0);
  }

  function boot() {
    refresh();
  }

  window.CivicationBrandJobUI = {
    boot,
    refresh,
    render: renderBlock,
    inspect() {
      const active = getActivePosition();
      const activeInfo = active ? getBrandRoleEntry(active) : null;
      return {
        active,
        activeInfo,
        progression: activeInfo ? getProgressionItems(activeInfo) : []
      };
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  ["updateProfile", "civi:booted", "civi:dataReady", "civi:inboxChanged"].forEach(function (eventName) {
    window.addEventListener(eventName, refresh);
  });
})();
