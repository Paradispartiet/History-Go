(function (globalScope) {
  "use strict";

  const AHA_SYNC_HUB_MOUNT_ID = "aha-sync-hub-status";
  const DETAILS_MISSING_MESSAGE = "No details available.";
  const DETAILS_ERROR_MESSAGE = "Could not read run details.";
  const SECRET_TEXT_PATTERN = /(authorization|bearer|token|password|passwd|secret|api[_-]?key|credential|connection\s*string|postgres(?:ql)?:\/\/|supabase[_-]?key)/i;

  function createAhaManualSyncAuditViewModel(result) {
    const auditStatus = result?.auditStatus || "not_configured";
    const message = auditStatus === "success"
      ? "Audit log written"
      : auditStatus === "not_configured"
        ? "Audit log not configured"
        : "Audit write failed";
    return {
      auditStatus,
      auditId: result?.auditId || null,
      resultStatus: result?.resultStatus || result?.status || "unknown",
      writeStatus: result?.writeStatus || "not_started",
      rollbackStatus: result?.rollbackStatus || "not_available",
      message,
      error: auditStatus === "failed" ? "Audit status unavailable." : ""
    };
  }

  function renderAhaManualSyncAuditResult(element, result) {
    if (!element) return null;
    const viewModel = createAhaManualSyncAuditViewModel(result);
    element.dataset.auditStatus = viewModel.auditStatus;
    element.replaceChildren();
    const status = element.ownerDocument.createElement("p");
    status.textContent = `${viewModel.message}. Result: ${humanStatus(viewModel.resultStatus)}; write: ${humanStatus(viewModel.writeStatus)}; rollback: ${humanStatus(viewModel.rollbackStatus)}.`;
    element.appendChild(status);
    if (viewModel.auditId) {
      const id = element.ownerDocument.createElement("small");
      id.textContent = `Audit ID: ${viewModel.auditId}`;
      element.appendChild(id);
    }
    if (viewModel.error) {
      const error = element.ownerDocument.createElement("p");
      error.setAttribute("role", "alert");
      error.className = "aha-sync-error-state";
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
    const retryEligibility = source.retryEligibility && typeof source.retryEligibility === "object" && !Array.isArray(source.retryEligibility)
      ? source.retryEligibility
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
      retryEligibility: {
        status: safeText(retryEligibility.status, "not_available", 100),
        reasons: safeStrings(retryEligibility.reasons || retryEligibility.blockers)
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
    const parts = Object.entries(summary || {}).map(([key, value]) => {
      const label = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
      const displayLabel = label.replace(/^./, (letter) => letter.toUpperCase());
      const displayValue = key.toLowerCase().includes("status") ? humanStatus(value) : value;
      return `${displayLabel}: ${displayValue}`;
    });
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
    element.setAttribute("aria-label", "Manual sync details");
    appendTextElement(element, "h3", "Manual sync details");
    appendTextElement(element, "p", "Read-only diagnostics.", "aha-sync-help-text");
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
      missing.className = "aha-sync-error-state";
      return { ok: false, error: DETAILS_MISSING_MESSAGE };
    }

    try {
      const details = sanitizeAhaManualSyncAuditRunForDetails(selectedRun);
      const list = element.ownerDocument.createElement("dl");
      appendDetail(list, "Run ID", details.runId || "Not recorded");
      appendDetail(list, "Recorded at", details.recordedAt);
      appendDetail(list, "Target", details.target);
      appendDetail(list, "Target status", humanStatus(details.targetStatus));
      appendDetail(list, "Result status", humanStatus(details.resultStatus));
      appendDetail(list, "Write status", humanStatus(details.writeStatus));
      appendDetail(list, "Rollback status", humanStatus(details.rollbackStatus));
      appendDetail(list, "Audit status", humanStatus(details.auditStatus));
      appendDetail(list, "Audit ID", details.auditId);
      appendDetail(list, "Included modules", details.includedModules.join(", ") || "No module data found.");
      appendDetail(list, "Items", details.totalItems);
      appendDetail(list, "Readiness", humanStatus(details.readinessStatus));
      appendDetail(list, "Validation", formatSummary(details.validationSummary));
      appendDetail(list, "Checklist", formatSummary(details.checklistSummary));
      appendDetail(list, "Warnings", details.warnings.join("; ") || "No warnings.");
      appendDetail(list, "Errors", details.errors.join("; ") || "No errors.");
      appendDetail(list, "Retry eligibility", `${humanStatus(details.retryEligibility.status)}${details.retryEligibility.reasons.length ? ` — ${details.retryEligibility.reasons.join("; ")}` : ""}`);
      appendDetail(list, "Confirmation", details.confirmationSummary.confirmed ? `Confirmed${details.confirmationSummary.confirmedAt ? ` at ${details.confirmationSummary.confirmedAt}` : ""}` : "Not confirmed");
      appendDetail(list, "Result message", details.resultMessage);
      element.appendChild(list);
      return { ok: true, details };
    } catch (_error) {
      const error = appendTextElement(element, "p", DETAILS_ERROR_MESSAGE);
      error.setAttribute("role", "alert");
      error.className = "aha-sync-error-state";
      return { ok: false, error: DETAILS_ERROR_MESSAGE };
    }
  }

  function renderAhaManualSyncHistory(element, runs, state) {
    if (!element) return null;
    const viewState = state || createAhaManualSyncHistoryState(runs);
    viewState.runs = Array.isArray(runs) ? runs : [];
    element.replaceChildren();
    appendTextElement(element, "h2", "Manual sync history");
    appendTextElement(element, "p", "Latest manual sync runs.", "aha-sync-help-text");

    const list = element.ownerDocument.createElement("div");
    list.className = "aha-sync-history-list";
    if (!viewState.runs.length) appendTextElement(list, "p", "No manual sync runs yet.", "aha-sync-empty-state");
    viewState.runs.forEach((run) => {
      const details = sanitizeAhaManualSyncAuditRunForDetails(run);
      const row = element.ownerDocument.createElement("article");
      row.className = "aha-sync-history-run";
      appendTextElement(row, "strong", details.runId || "Unknown");
      appendTextElement(row, "span", details.recordedAt || "Timestamp unavailable");
      appendTextElement(row, "span", `Status: ${humanStatus(details.resultStatus)}`);
      appendTextElement(row, "span", `Target: ${details.target === "unknown" ? "Unknown" : details.target}`);
      appendTextElement(row, "span", `Items: ${details.totalItems}`);
      appendTextElement(row, "span", `Modules: ${details.includedModules.length}`);
      const button = appendTextElement(row, "button", "View details");
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

  function collectCriticalIssues(input) {
    const source = input && typeof input === "object" ? input : {};
    const validation = source.validationSummary || {};
    const issues = safeStrings(source.blockers);
    if (validation.ok === false || Number(validation.errorCount) > 0) issues.push("Validation errors must be resolved before sync.");
    if (source.readinessStatus === "blocked") issues.push("Sync readiness is blocked.");
    if (!source.target || source.targetStatus === "not_configured") issues.push("Target is not configured.");
    if (source.auditStatus === "failed" || source.auditStatus === "not_configured") issues.push(source.auditStatus === "failed" ? "Audit logging failed." : "Audit logging is not configured.");
    if (source.writeStatus === "failed") issues.push("The last write failed.");
    if (source.confirmationRequired === true && source.confirmation?.confirmed !== true) issues.push("Explicit confirmation is required.");
    const lastStatus = source.lastRun?.resultStatus || source.lastRun?.status;
    if (lastStatus === "failed" || lastStatus === "partial_success") issues.push(`Last run requires attention: ${lastStatus}.`);
    return [...new Set(issues)];
  }

  function normalizeManualStatus(input, criticalIssues) {
    const explicit = safeText(input?.manualSyncStatus, "", 50).toLowerCase();
    if (["ready", "blocked", "needs review", "warning", "missing", "unknown", "success", "failed"].includes(explicit)) {
      return humanStatus(explicit);
    }
    if (explicit === "not configured") return "Missing";
    if (!input?.target || input?.targetStatus === "not_configured" || input?.auditStatus === "not_configured") return "Missing";
    if (criticalIssues.length) return "Blocked";
    const warnings = safeStrings(input?.warnings);
    if (warnings.length || Number(input?.validationSummary?.warningCount) > 0) return "Needs review";
    return input?.readinessStatus === "ready" ? "Ready" : "Needs review";
  }

  function createAhaSyncHubState(input) {
    const source = input && typeof input === "object" ? input : {};
    const modules = safeStrings(source.includedModules);
    const counts = safeCounts(source.itemCounts);
    const totalValue = Number(source.totalItems);
    const criticalIssues = collectCriticalIssues(source);
    return {
      advancedOpen: source.advancedOpen === true || (source.advancedOpen !== false && criticalIssues.length > 0),
      confirmationOpen: source.confirmationOpen === true,
      historyState: source.historyState || createAhaManualSyncHistoryState(source.historyRuns),
      target: safeText(source.target, "Target not configured.", 200),
      targetStatus: safeText(source.targetStatus, "not_configured", 100),
      readinessStatus: safeText(source.readinessStatus, "unknown", 100),
      includedModules: modules,
      totalItems: Number.isFinite(totalValue) && totalValue >= 0
        ? Math.floor(totalValue)
        : Object.values(counts).reduce((total, count) => total + count, 0),
      lastRun: source.lastRun ? sanitizeAhaManualSyncAuditRunForDetails(source.lastRun) : null,
      manualSyncStatus: normalizeManualStatus(source, criticalIssues),
      criticalIssues,
      warnings: safeStrings(source.warnings),
      canOpenConfirmation: source.canOpenConfirmation === true,
      canConfirm: source.canConfirm === true,
      auditStatus: safeText(source.auditStatus, "not_configured", 100),
      historyRuns: Array.isArray(source.historyRuns) ? source.historyRuns : [],
      diagnostics: {
        dryRun: safeSummary(source.dryRunSummary, ["status", "ok", "itemCount", "moduleCount"]),
        validation: safeSummary(source.validationSummary, ["ok", "checked", "errorCount", "warningCount", "status"]),
        readiness: safeSummary(source.readinessSummary || { status: source.readinessStatus }, ["ok", "status", "blockerCount"]),
        payloadSample: safeSummary(source.payloadSummary, ["totalItems", "checksum", "checksumScope"]),
        checklist: safeSummary(source.checklistSummary, ["ok", "completed", "total", "status"]),
        target: safeSummary(source.targetSummary || { status: source.targetStatus }, ["ok", "status", "configured"]),
        audit: safeSummary(source.auditSummary || { status: source.auditStatus }, ["ok", "status", "required"]),
        adapter: safeSummary(source.adapterSummary, ["ok", "status", "canExecute", "canWrite"]),
        stateMachine: safeSummary(source.stateMachineSummary, ["ok", "status", "state"]),
        run: safeSummary(source.runSummary, ["status", "resultStatus", "writeStatus", "auditStatus"]),
        retry: safeSummary(source.retryEligibility, ["ok", "status", "eligible"]),
        retryReasons: safeStrings(source.retryEligibility?.reasons || source.retryEligibility?.blockers)
      }
    };
  }

  function humanStatus(value) {
    const status = safeText(value, "unknown", 100).toLowerCase().replace(/[\s-]+/g, "_");
    const labels = {
      ready: "Ready",
      ready_to_sync: "Ready",
      needs_review: "Needs review",
      partial_success: "Needs review",
      blocked: "Blocked",
      warning: "Warning",
      missing: "Missing",
      not_configured: "Missing",
      empty: "Empty",
      not_started: "Empty",
      unknown: "Unknown",
      not_available: "Unknown",
      success: "Success",
      succeeded: "Success",
      failed: "Failed",
      error: "Failed",
      eligible_preview: "Needs review"
    };
    return labels[status] || status.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
  }

  function appendSummaryItem(parent, label, value) {
    const item = parent.ownerDocument.createElement("div");
    item.className = "aha-sync-summary-item";
    appendTextElement(item, "dt", label);
    appendTextElement(item, "dd", value);
    parent.appendChild(item);
  }

  function renderDiagnostics(parent, diagnostics) {
    const list = parent.ownerDocument.createElement("dl");
    list.className = "aha-sync-diagnostics-list";
    appendDetail(list, "Dry run", formatSummary(diagnostics.dryRun));
    appendDetail(list, "Validation", formatSummary(diagnostics.validation));
    appendDetail(list, "Readiness", formatSummary(diagnostics.readiness));
    appendDetail(list, "Payload summary", formatSummary(diagnostics.payloadSample));
    appendDetail(list, "Checklist", formatSummary(diagnostics.checklist));
    appendDetail(list, "Target", formatSummary(diagnostics.target));
    appendDetail(list, "Audit", formatSummary(diagnostics.audit));
    appendDetail(list, "Adapter", formatSummary(diagnostics.adapter));
    appendDetail(list, "State machine", formatSummary(diagnostics.stateMachine));
    appendDetail(list, "Last run", formatSummary(diagnostics.run));
    appendDetail(list, "Retry eligibility", `${formatSummary(diagnostics.retry)}${diagnostics.retryReasons.length ? `; reasons: ${diagnostics.retryReasons.join("; ")}` : ""}`);
    parent.appendChild(list);
  }

  function renderAhaSyncConfirmation(element, state, handlers) {
    if (!element) return null;
    element.replaceChildren();
    element.hidden = !state.confirmationOpen;
    if (!state.confirmationOpen) return state;
    element.className = "aha-sync-confirmation";
    element.setAttribute("role", "dialog");
    element.setAttribute("aria-modal", "true");
    element.setAttribute("aria-label", "Confirm manual sync");
    appendTextElement(element, "h2", "Confirm manual sync");
    appendTextElement(element, "p", `Sync ${state.totalItems} items from ${state.includedModules.length} modules to ${state.target}.`);
    appendTextElement(element, "p", `Audit status: ${humanStatus(state.auditStatus)}.`);
    const review = element.ownerDocument.createElement("div");
    review.className = "aha-sync-confirmation-review";
    const notices = state.criticalIssues.length ? state.criticalIssues : state.warnings;
    appendTextElement(review, "strong", state.criticalIssues.length ? "Blockers" : state.warnings.length ? "Warnings" : "Blockers");
    appendTextElement(review, "p", notices.join(" ") || "No active blockers.", notices.length ? "" : "aha-sync-empty-state");
    element.appendChild(review);

    const advanced = element.ownerDocument.createElement("details");
    appendTextElement(advanced, "summary", "View diagnostics");
    renderDiagnostics(advanced, state.diagnostics);
    element.appendChild(advanced);

    const actions = element.ownerDocument.createElement("div");
    actions.className = "aha-sync-confirmation-actions";
    const cancel = appendTextElement(actions, "button", "Cancel");
    cancel.type = "button";
    cancel.addEventListener("click", () => {
      state.confirmationOpen = false;
      if (typeof handlers?.onCancelConfirmation === "function") handlers.onCancelConfirmation(state);
      renderAhaSyncConfirmation(element, state, handlers);
    });
    const confirm = appendTextElement(actions, "button", "Confirm sync");
    confirm.type = "button";
    confirm.disabled = !state.canConfirm;
    confirm.setAttribute("aria-disabled", String(!state.canConfirm));
    confirm.addEventListener("click", () => {
      if (state.canConfirm && typeof handlers?.onConfirm === "function") handlers.onConfirm(state);
    });
    element.appendChild(actions);
    return state;
  }

  function renderAhaSyncHub(element, input, handlers) {
    if (!element) return null;
    const state = input?.historyState && input?.diagnostics && Object.prototype.hasOwnProperty.call(input, "advancedOpen")
      ? input
      : createAhaSyncHubState(input);
    element.replaceChildren();
    element.className = "aha-sync-hub";
    element.dataset.manualSyncStatus = state.manualSyncStatus.toLowerCase().replace(/\s+/g, "-");

    const header = element.ownerDocument.createElement("header");
    header.className = "aha-sync-hub-header";
    appendTextElement(header, "p", "Manual only. No auto-sync.", "aha-sync-manual-only");
    appendTextElement(header, "h1", "Sync Hub");
    appendTextElement(header, "p", "Review readiness and recent manual runs.", "aha-sync-help-text");
    element.appendChild(header);

    const summary = element.ownerDocument.createElement("section");
    summary.className = "aha-sync-top-summary";
    appendTextElement(summary, "h2", "System health");
    const summaryList = element.ownerDocument.createElement("dl");
    summaryList.className = "aha-sync-summary-grid";
    appendSummaryItem(summaryList, "Data readiness", state.readinessStatus === "ready" ? "Ready" : humanStatus(state.readinessStatus));
    appendSummaryItem(summaryList, "Target", state.target);
    appendSummaryItem(summaryList, "Modules", String(state.includedModules.length));
    appendSummaryItem(summaryList, "Items", String(state.totalItems));
    appendSummaryItem(summaryList, "Last run", state.lastRun ? `${humanStatus(state.lastRun.resultStatus)} · ${state.lastRun.recordedAt || "Time unavailable"}` : "No manual sync runs yet.");
    appendSummaryItem(summaryList, "Manual sync", state.manualSyncStatus);
    summary.appendChild(summaryList);
    element.appendChild(summary);

    const action = element.ownerDocument.createElement("section");
    action.className = "aha-sync-primary-action";
    appendTextElement(action, "h2", "Manual sync");
    appendTextElement(action, "p", "Prepare and confirm each sync manually.", "aha-sync-help-text");
    if (state.criticalIssues.length) {
      const alert = element.ownerDocument.createElement("div");
      alert.className = "aha-sync-critical-blockers";
      alert.setAttribute("role", "alert");
      appendTextElement(alert, "strong", "Blocked");
      state.criticalIssues.forEach((issue) => appendTextElement(alert, "p", issue));
      action.appendChild(alert);
    } else if (state.warnings.length) {
      appendTextElement(action, "p", state.warnings.join(" "), "aha-sync-warning");
    } else {
      appendTextElement(action, "p", "No active blockers.", "aha-sync-empty-state");
    }
    const manualButton = appendTextElement(action, "button", "Manual sync");
    manualButton.type = "button";
    manualButton.disabled = !state.canOpenConfirmation;
    manualButton.setAttribute("aria-disabled", String(!state.canOpenConfirmation));
    action.appendChild(manualButton);
    element.appendChild(action);

    const confirmation = element.ownerDocument.createElement("section");
    confirmation.className = "aha-sync-confirmation-slot";
    element.appendChild(confirmation);
    manualButton.addEventListener("click", () => {
      if (!state.canOpenConfirmation) return;
      state.confirmationOpen = true;
      if (typeof handlers?.onOpenConfirmation === "function") handlers.onOpenConfirmation(state);
      renderAhaSyncConfirmation(confirmation, state, handlers);
    });
    renderAhaSyncConfirmation(confirmation, state, handlers);

    const history = element.ownerDocument.createElement("section");
    history.className = "aha-sync-history-section";
    element.appendChild(history);
    renderAhaManualSyncHistory(history, state.historyRuns, state.historyState);

    const advanced = element.ownerDocument.createElement("section");
    advanced.className = "aha-sync-advanced";
    const toggle = appendTextElement(advanced, "button", "Advanced diagnostics");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", String(state.advancedOpen));
    appendTextElement(advanced, "p", "Read-only diagnostics.", "aha-sync-help-text");
    const panel = element.ownerDocument.createElement("div");
    panel.className = "aha-sync-advanced-panel";
    panel.hidden = !state.advancedOpen;
    renderDiagnostics(panel, state.diagnostics);
    toggle.addEventListener("click", () => {
      state.advancedOpen = !state.advancedOpen;
      toggle.setAttribute("aria-expanded", String(state.advancedOpen));
      panel.hidden = !state.advancedOpen;
    });
    advanced.appendChild(panel);
    element.appendChild(advanced);
    return state;
  }

  function mountAhaSyncHub(documentRef, input, handlers) {
    const mount = documentRef?.getElementById?.(AHA_SYNC_HUB_MOUNT_ID);
    return mount ? renderAhaSyncHub(mount, input, handlers) : null;
  }

  const api = {
    AHA_SYNC_HUB_MOUNT_ID,
    DETAILS_MISSING_MESSAGE,
    createAhaManualSyncAuditViewModel,
    renderAhaManualSyncAuditResult,
    sanitizeAhaManualSyncAuditRunForDetails,
    buildAhaManualSyncHistoryRunDetails: sanitizeAhaManualSyncAuditRunForDetails,
    createAhaManualSyncHistoryState,
    openAhaManualSyncHistoryDetails,
    closeAhaManualSyncHistoryDetails,
    renderAhaManualSyncHistory,
    renderAhaManualSyncHistoryDetails,
    collectAhaSyncCriticalIssues: collectCriticalIssues,
    createAhaSyncHubState,
    renderAhaSyncConfirmation,
    renderAhaSyncHub,
    mountAhaSyncHub
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.AhaDashboard = api;
})(typeof window !== "undefined" ? window : globalThis);
