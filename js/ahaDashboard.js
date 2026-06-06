(function (globalScope) {
  "use strict";

  const DETAILS_MISSING_MESSAGE = "Selected run was not found.";
  const DETAILS_ERROR_MESSAGE = "Manual sync run details could not be built.";
  const SECRET_TEXT_PATTERN = /(authorization|bearer|token|password|passwd|secret|api[_-]?key|credential|connection\s*string|postgres(?:ql)?:\/\/|supabase[_-]?key)/i;

  function createAhaManualSyncAuditViewModel(result) {
    const auditStatus = result?.auditStatus || "not_configured";
    const message = auditStatus === "success"
      ? "Audit log written"
      : auditStatus === "not_configured"
        ? "Audit log not configured"
        : "Audit log write failed";
    return {
      auditStatus,
      auditId: result?.auditId || null,
      resultStatus: result?.resultStatus || result?.status || "unknown",
      writeStatus: result?.writeStatus || "not_started",
      rollbackStatus: result?.rollbackStatus || "not_available",
      message,
      error: auditStatus === "failed" ? (result?.errors || []).join(" ") : ""
    };
  }

  function renderAhaManualSyncAuditResult(element, result) {
    if (!element) return null;
    const viewModel = createAhaManualSyncAuditViewModel(result);
    element.dataset.auditStatus = viewModel.auditStatus;
    element.replaceChildren();
    const status = element.ownerDocument.createElement("p");
    status.textContent = `${viewModel.message}. Result: ${viewModel.resultStatus}; write: ${viewModel.writeStatus}; rollback: ${viewModel.rollbackStatus}.`;
    element.appendChild(status);
    if (viewModel.auditId) {
      const id = element.ownerDocument.createElement("small");
      id.textContent = `Audit ID: ${viewModel.auditId}`;
      element.appendChild(id);
    }
    if (viewModel.error) {
      const error = element.ownerDocument.createElement("p");
      error.setAttribute("role", "alert");
      error.textContent = viewModel.error;
      element.appendChild(error);
    }
    return viewModel;
  }

  function safeText(value, fallback, maxLength) {
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return fallback;
    const text = String(value).trim().slice(0, maxLength || 300);
    return text && !SECRET_TEXT_PATTERN.test(text) ? text : fallback;
  }

  function safeStrings(value) {
    if (!Array.isArray(value)) return [];
    return value.map((item) => safeText(item, "", 300)).filter(Boolean).slice(0, 50);
  }

  function safeCounts(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.entries(value).reduce((result, [key, count]) => {
      const safeKey = safeText(key, "", 100);
      const number = Number(count);
      if (safeKey && Number.isFinite(number) && number >= 0) result[safeKey] = Math.floor(number);
      return result;
    }, {});
  }

  function safeSummary(value, allowedKeys) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    return allowedKeys.reduce((result, key) => {
      const item = source[key];
      if (typeof item === "boolean") result[key] = item;
      if (typeof item === "number" && Number.isFinite(item)) result[key] = item;
      if (typeof item === "string") result[key] = safeText(item, "", 200);
      return result;
    }, {});
  }

  function sourceAuditEntry(run) {
    if (!run || typeof run !== "object" || Array.isArray(run)) return {};
    if (!run.runId && run.payload && typeof run.payload === "object" && !Array.isArray(run.payload)) {
      return { ...run.payload, auditId: run.auditId || run.id, recordedAt: run.payload.recordedAt || run.created_at };
    }
    return run;
  }

  function sanitizeAhaManualSyncAuditRunForDetails(run) {
    const source = sourceAuditEntry(run);
    const payloadSummary = source.payloadSummary && typeof source.payloadSummary === "object" && !Array.isArray(source.payloadSummary)
      ? source.payloadSummary
      : {};
    const confirmationSummary = source.confirmationSummary && typeof source.confirmationSummary === "object" && !Array.isArray(source.confirmationSummary)
      ? source.confirmationSummary
      : {};
    const itemCounts = safeCounts(source.itemCounts);
    const totalItemsValue = Number(source.totalItems);

    return {
      runId: safeText(source.runId, "", 200),
      recordedAt: safeText(source.recordedAt || source.timestamp, null, 100),
      schemaVersion: safeText(source.schemaVersion, "unknown", 50),
      trigger: safeText(source.trigger, "manual", 50),
      target: safeText(source.target, "unknown", 200),
      targetStatus: safeText(source.targetStatus, "unknown", 100),
      resultStatus: safeText(source.resultStatus || source.status, "unknown", 100),
      writeStatus: safeText(source.writeStatus, "not_started", 100),
      rollbackStatus: safeText(source.rollbackStatus, "not_available", 100),
      auditStatus: safeText(source.auditStatus, "unknown", 100),
      auditId: safeText(source.auditId, null, 250),
      includedModules: safeStrings(source.includedModules),
      excludedModules: safeStrings(source.excludedModules),
      itemCounts,
      totalItems: Number.isFinite(totalItemsValue) && totalItemsValue >= 0
        ? Math.floor(totalItemsValue)
        : Object.values(itemCounts).reduce((total, count) => total + count, 0),
      readinessStatus: safeText(source.readinessStatus, "unknown", 100),
      validationSummary: safeSummary(source.validationSummary, ["ok", "checked", "errorCount", "warningCount", "status"]),
      checklistSummary: safeSummary(source.checklistSummary, ["ok", "completed", "total", "status"]),
      payloadSummary: {
        moduleIds: safeStrings(payloadSummary.moduleIds),
        itemCounts: safeCounts(payloadSummary.itemCounts),
        totalItems: Number.isFinite(Number(payloadSummary.totalItems)) && Number(payloadSummary.totalItems) >= 0
          ? Math.floor(Number(payloadSummary.totalItems))
          : 0,
        checksum: safeText(payloadSummary.checksum, null, 200),
        checksumScope: safeText(payloadSummary.checksumScope, null, 200)
      },
      confirmationSummary: {
        confirmed: confirmationSummary.confirmed === true,
        confirmedAt: safeText(confirmationSummary.confirmedAt, null, 100)
      },
      warnings: safeStrings(source.warnings),
      errors: safeStrings(source.errors),
      resultMessage: safeText(source.resultMessage || source.message, null, 300)
    };
  }

  function createAhaManualSyncHistoryState(runs) {
    return {
      runs: Array.isArray(runs) ? runs : [],
      selectedHistoryRunId: null,
      detailsOpen: false
    };
  }

  function openAhaManualSyncHistoryDetails(state, runId) {
    const nextState = state || createAhaManualSyncHistoryState();
    nextState.selectedHistoryRunId = safeText(runId, null, 200);
    nextState.detailsOpen = true;
    return nextState;
  }

  function closeAhaManualSyncHistoryDetails(state) {
    const nextState = state || createAhaManualSyncHistoryState();
    nextState.selectedHistoryRunId = null;
    nextState.detailsOpen = false;
    return nextState;
  }

  function findSelectedHistoryRun(state) {
    const runs = Array.isArray(state?.runs) ? state.runs : [];
    return runs.find((run) => sanitizeAhaManualSyncAuditRunForDetails(run).runId === state?.selectedHistoryRunId) || null;
  }

  function appendTextElement(parent, tagName, text, className) {
    const element = parent.ownerDocument.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function formatSummary(summary) {
    const parts = Object.entries(summary || {}).map(([key, value]) => `${key}: ${value}`);
    return parts.length ? parts.join(", ") : "Not recorded";
  }

  function appendDetail(parent, label, value) {
    const row = parent.ownerDocument.createElement("div");
    row.className = "aha-sync-history-detail-row";
    appendTextElement(row, "dt", label);
    appendTextElement(row, "dd", value === null || value === "" ? "Not recorded" : String(value));
    parent.appendChild(row);
  }

  function renderAhaManualSyncHistoryDetails(element, state, onClose) {
    if (!element) return null;
    element.replaceChildren();
    if (!state?.detailsOpen) {
      element.hidden = true;
      return null;
    }

    element.hidden = false;
    element.setAttribute("aria-label", "Manual sync run details");
    appendTextElement(element, "h3", "Manual sync run details");
    appendTextElement(element, "p", "Read-only audit details. No sync is performed.", "aha-sync-history-read-only");
    const closeButton = appendTextElement(element, "button", "Close");
    closeButton.type = "button";
    closeButton.addEventListener("click", () => {
      closeAhaManualSyncHistoryDetails(state);
      if (typeof onClose === "function") onClose(state);
      renderAhaManualSyncHistoryDetails(element, state, onClose);
    });

    const selectedRun = findSelectedHistoryRun(state);
    if (!selectedRun) {
      const missing = appendTextElement(element, "p", DETAILS_MISSING_MESSAGE);
      missing.setAttribute("role", "alert");
      return { ok: false, error: DETAILS_MISSING_MESSAGE };
    }

    try {
      const details = sanitizeAhaManualSyncAuditRunForDetails(selectedRun);
      const list = element.ownerDocument.createElement("dl");
      appendDetail(list, "Run ID", details.runId || "Not recorded");
      appendDetail(list, "Recorded at", details.recordedAt);
      appendDetail(list, "Schema version", details.schemaVersion);
      appendDetail(list, "Trigger", details.trigger);
      appendDetail(list, "Target", details.target);
      appendDetail(list, "Target status", details.targetStatus);
      appendDetail(list, "Result status", details.resultStatus);
      appendDetail(list, "Write status", details.writeStatus);
      appendDetail(list, "Rollback status", details.rollbackStatus);
      appendDetail(list, "Audit status", details.auditStatus);
      appendDetail(list, "Audit ID", details.auditId);
      appendDetail(list, "Included modules", details.includedModules.join(", ") || "None");
      appendDetail(list, "Excluded modules", details.excludedModules.join(", ") || "None");
      appendDetail(list, "Item counts", formatSummary(details.itemCounts));
      appendDetail(list, "Total items", details.totalItems);
      appendDetail(list, "Readiness", details.readinessStatus);
      appendDetail(list, "Validation", formatSummary(details.validationSummary));
      appendDetail(list, "Checklist", formatSummary(details.checklistSummary));
      appendDetail(list, "Payload summary", `Modules: ${details.payloadSummary.moduleIds.join(", ") || "none"}; counts: ${formatSummary(details.payloadSummary.itemCounts)}; total: ${details.payloadSummary.totalItems}; checksum: ${details.payloadSummary.checksum || "not recorded"}`);
      appendDetail(list, "Confirmation", details.confirmationSummary.confirmed ? `Confirmed${details.confirmationSummary.confirmedAt ? ` at ${details.confirmationSummary.confirmedAt}` : ""}` : "Not confirmed");
      appendDetail(list, "Warnings", details.warnings.join("; ") || "None");
      appendDetail(list, "Errors", details.errors.join("; ") || "None");
      appendDetail(list, "Result message", details.resultMessage);
      element.appendChild(list);
      return { ok: true, details };
    } catch (_error) {
      const error = appendTextElement(element, "p", DETAILS_ERROR_MESSAGE);
      error.setAttribute("role", "alert");
      return { ok: false, error: DETAILS_ERROR_MESSAGE };
    }
  }

  function renderAhaManualSyncHistory(element, runs, state) {
    if (!element) return null;
    const viewState = state || createAhaManualSyncHistoryState(runs);
    viewState.runs = Array.isArray(runs) ? runs : [];
    element.replaceChildren();
    appendTextElement(element, "h2", "Manual sync history");
    appendTextElement(element, "p", "Read-only audit history. No sync is performed.");

    const list = element.ownerDocument.createElement("div");
    list.className = "aha-sync-history-list";
    if (!viewState.runs.length) appendTextElement(list, "p", "No manual sync runs found.");
    viewState.runs.forEach((run) => {
      const details = sanitizeAhaManualSyncAuditRunForDetails(run);
      const row = element.ownerDocument.createElement("article");
      row.className = "aha-sync-history-run";
      appendTextElement(row, "strong", details.runId || "Unknown run");
      appendTextElement(row, "span", `${details.recordedAt || "Timestamp unavailable"} · ${details.resultStatus}`);
      const button = appendTextElement(row, "button", "Details");
      button.type = "button";
      button.addEventListener("click", () => {
        openAhaManualSyncHistoryDetails(viewState, details.runId);
        renderAhaManualSyncHistoryDetails(detailsPanel, viewState);
      });
      list.appendChild(row);
    });
    element.appendChild(list);

    const detailsPanel = element.ownerDocument.createElement("aside");
    detailsPanel.className = "aha-sync-history-details";
    element.appendChild(detailsPanel);
    renderAhaManualSyncHistoryDetails(detailsPanel, viewState);
    return viewState;
  }

  const api = {
    DETAILS_MISSING_MESSAGE,
    createAhaManualSyncAuditViewModel,
    renderAhaManualSyncAuditResult,
    sanitizeAhaManualSyncAuditRunForDetails,
    buildAhaManualSyncHistoryRunDetails: sanitizeAhaManualSyncAuditRunForDetails,
    createAhaManualSyncHistoryState,
    openAhaManualSyncHistoryDetails,
    closeAhaManualSyncHistoryDetails,
    renderAhaManualSyncHistory,
    renderAhaManualSyncHistoryDetails
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.AhaDashboard = api;
})(typeof window !== "undefined" ? window : globalThis);
