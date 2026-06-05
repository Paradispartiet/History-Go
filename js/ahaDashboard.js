(function () {
  "use strict";

  const MOUNT_ID = "aha-sync-hub-status";
  const PANEL_ID = "aha-sync-hub-panel";
  const DISABLED_REASON_ID = "aha-manual-sync-disabled-reason";

  const PAYLOAD_KEY = "aha_import_payload_v1";

  const MODULES = [
    { key: "hg_learning_log_v1", label: "Learning log", type: "array" },
    { key: "hg_insights_events_v1", label: "Insights events", type: "array" },
    { key: "knowledge_universe", label: "Knowledge universe", type: "object" },
    { key: "visited_places", label: "Visited places", type: "object" },
    { key: "merits_by_category", label: "Merits", type: "object" }
  ];

  const FUTURE_REQUIREMENTS = [
    "readiness must be ready",
    "validation errors must be zero",
    "payload preview must include at least one module",
    "operator checklist must have no blocked items",
    "explicit manual sync implementation must be added in a future PR"
  ];

  let expanded = false;
  let prepared = false;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function readJson(key, fallback) {
    try {
      const raw = window.localStorage?.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function countValue(value, type) {
    if (type === "array") return Array.isArray(value) ? value.length : 0;
    if (value && typeof value === "object" && !Array.isArray(value)) return Object.keys(value).length;
    return 0;
  }

  function readPayload() {
    const payload = readJson(PAYLOAD_KEY, null);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    return payload;
  }

  function buildPayloadPreview(payload) {
    return MODULES.map((module) => {
      const count = payload ? countValue(payload[module.key], module.type) : 0;
      return {
        ...module,
        count,
        included: count > 0
      };
    });
  }

  function buildValidation(payload, preview) {
    const errors = [];
    const warnings = [];

    if (!payload) {
      errors.push("No existing aha_import_payload_v1 payload is available for preview.");
    }

    if (payload && payload.source !== "historygo") {
      warnings.push("Payload source is not marked as historygo.");
    }

    if (payload && !payload.exported_at) {
      warnings.push("Payload has no exported_at timestamp.");
    }

    if (!preview.some((item) => item.included)) {
      errors.push("Payload preview has no included modules.");
    }

    return { errors, warnings };
  }

  function buildOperatorChecklist(validation, preview) {
    const includedCount = preview.filter((item) => item.included).length;

    return [
      {
        label: "Dry-run plan reviewed",
        state: prepared ? "review" : "blocked",
        detail: prepared ? "Dry-run plan is visible in this panel." : "Open the dry-run plan with Forbered sync."
      },
      {
        label: "Validation has no errors",
        state: validation.errors.length === 0 ? "ready" : "blocked",
        detail: validation.errors.length === 0 ? "No validation errors found." : `${validation.errors.length} validation error(s) must be resolved.`
      },
      {
        label: "Warnings reviewed",
        state: validation.warnings.length === 0 ? "ready" : "review",
        detail: validation.warnings.length === 0 ? "No warnings found." : `${validation.warnings.length} warning(s) require operator review.`
      },
      {
        label: "Payload includes modules",
        state: includedCount > 0 ? "ready" : "blocked",
        detail: includedCount > 0 ? `${includedCount} module(s) included in preview.` : "Payload preview must include at least one module."
      },
      {
        label: "Manual sync implementation exists",
        state: "blocked",
        detail: "Manual sync is intentionally not implemented in this PR."
      }
    ];
  }

  function buildReadiness(validation, preview, checklist) {
    const reasons = [];

    if (validation.errors.length > 0) reasons.push("readiness is blocked by validation errors");
    if (validation.warnings.length > 0) reasons.push("warnings must be reviewed");
    if (!preview.some((item) => item.included)) reasons.push("payload preview is missing included modules");

    checklist
      .filter((item) => item.state === "blocked")
      .forEach((item) => reasons.push(`operator checklist blocked: ${item.label}`));

    reasons.push("manual sync is not enabled in code yet");

    return {
      state: "blocked",
      label: "Blocked",
      reasons: Array.from(new Set(reasons))
    };
  }

  function getViewModel() {
    const payload = readPayload();
    const preview = buildPayloadPreview(payload);
    const validation = buildValidation(payload, preview);
    const checklist = buildOperatorChecklist(validation, preview);
    const readiness = buildReadiness(validation, preview, checklist);

    return { payload, preview, validation, checklist, readiness };
  }

  function renderList(items, emptyText, className) {
    if (!items.length) return `<p class="aha-sync-muted">${escapeHtml(emptyText)}</p>`;
    return `<ul class="${escapeHtml(className || "aha-sync-list")}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function renderDryRun(viewModel) {
    const included = viewModel.preview.filter((item) => item.included);
    const lines = [
      "Read existing AHA payload for preview only.",
      `Inspect ${viewModel.preview.length} known payload module(s).`,
      `Include ${included.length} module(s) with data in the preview.`,
      "Keep manual sync disabled; no data changes are performed."
    ];

    return `
      <section class="aha-sync-section">
        <h3>Dry-run planner</h3>
        ${renderList(lines, "No dry-run steps available.", "aha-sync-list")}
      </section>
    `;
  }

  function renderValidation(validation) {
    return `
      <section class="aha-sync-section">
        <h3>Validation</h3>
        <div class="aha-sync-validation-grid">
          <div>
            <strong>Errors: ${validation.errors.length}</strong>
            ${renderList(validation.errors, "No validation errors.", "aha-sync-list aha-sync-errors")}
          </div>
          <div>
            <strong>Warnings: ${validation.warnings.length}</strong>
            ${renderList(validation.warnings, "No warnings.", "aha-sync-list aha-sync-warnings")}
          </div>
        </div>
      </section>
    `;
  }

  function renderReadiness(readiness) {
    return `
      <section class="aha-sync-section aha-sync-readiness" aria-live="polite">
        <h3>Readiness gate</h3>
        <p><strong>${escapeHtml(readiness.label)}</strong> — Manual sync is gated and not enabled yet.</p>
        ${renderList(readiness.reasons, "No gate reasons.", "aha-sync-list aha-sync-gate-reasons")}
      </section>
    `;
  }

  function renderPayloadPreview(preview) {
    return `
      <section class="aha-sync-section">
        <h3>Payload preview</h3>
        <ul class="aha-sync-module-list">
          ${preview.map((item) => `
            <li class="${item.included ? "is-included" : "is-empty"}">
              <span>${escapeHtml(item.label)}</span>
              <strong>${item.count}</strong>
            </li>
          `).join("")}
        </ul>
      </section>
    `;
  }

  function renderChecklist(checklist) {
    return `
      <section class="aha-sync-section">
        <h3>Operator checklist</h3>
        <ul class="aha-sync-checklist">
          ${checklist.map((item) => `
            <li class="is-${escapeHtml(item.state)}">
              <span class="aha-sync-check-state">${escapeHtml(item.state)}</span>
              <span><strong>${escapeHtml(item.label)}</strong><br><small>${escapeHtml(item.detail)}</small></span>
            </li>
          `).join("")}
        </ul>
      </section>
    `;
  }

  function renderManualGate(readiness) {
    const mainReason = readiness.reasons[0] || "manual sync is not enabled in code yet";

    return `
      <section class="aha-sync-section aha-sync-manual-gate">
        <div class="aha-sync-manual-row">
          <button class="aha-sync-manual-button" type="button" disabled aria-disabled="true" aria-describedby="${DISABLED_REASON_ID}">Manual sync</button>
          <div id="${DISABLED_REASON_ID}" class="aha-sync-disabled-reason" tabindex="-1">
            <strong>Manual sync is gated and not enabled yet.</strong>
            <p>Main reason: ${escapeHtml(mainReason)}.</p>
          </div>
        </div>
        ${renderList(readiness.reasons, "Manual sync is disabled by policy for this PR.", "aha-sync-list aha-sync-gate-reasons")}
      </section>
    `;
  }

  function renderFutureRequirements() {
    return `
      <section class="aha-sync-section aha-sync-future-requirements">
        <h3>Before manual sync can be enabled</h3>
        ${renderList(FUTURE_REQUIREMENTS, "No future requirements listed.", "aha-sync-list")}
      </section>
    `;
  }

  function renderPanel(viewModel) {
    if (!expanded) return "";

    return `
      <div id="${PANEL_ID}" class="aha-sync-panel">
        ${renderDryRun(viewModel)}
        ${renderValidation(viewModel.validation)}
        ${renderReadiness(viewModel.readiness)}
        ${renderPayloadPreview(viewModel.preview)}
        ${renderChecklist(viewModel.checklist)}
        ${renderManualGate(viewModel.readiness)}
        ${renderFutureRequirements()}
      </div>
    `;
  }

  function render() {
    const mount = document.getElementById(MOUNT_ID);
    if (!mount) return;

    const viewModel = getViewModel();
    const includedCount = viewModel.preview.filter((item) => item.included).length;
    const statusText = viewModel.payload ? `${includedCount} module(s) in current preview` : "No payload preview available";

    mount.innerHTML = `
      <section class="aha-sync-hub-card" aria-labelledby="aha-sync-hub-title">
        <div class="aha-sync-hub-card-head">
          <div>
            <p class="aha-sync-eyebrow">AHA Sync Hub</p>
            <h2 id="aha-sync-hub-title">Read-only sync control</h2>
            <p class="aha-sync-muted">${escapeHtml(statusText)}. Manual sync remains disabled.</p>
          </div>
          <span class="aha-sync-status-pill is-blocked">Blocked</span>
        </div>
        <button id="aha-sync-prepare-button" class="aha-sync-prepare-button" type="button" aria-expanded="${expanded ? "true" : "false"}" aria-controls="${PANEL_ID}">
          Forbered sync
        </button>
        ${renderPanel(viewModel)}
      </section>
    `;

    const prepareButton = document.getElementById("aha-sync-prepare-button");
    prepareButton?.addEventListener("click", () => {
      prepared = true;
      expanded = true;
      render();
      document.getElementById(PANEL_ID)?.focus?.();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, { once: true });
  } else {
    render();
  }

  window["AHASyncHubDashboard"] = {
    render,
    getViewModel
  };
})();
