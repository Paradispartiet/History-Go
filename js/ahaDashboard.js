(function (globalScope) {
  "use strict";

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
    status.textContent = viewModel.message;
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

  const api = { createAhaManualSyncAuditViewModel, renderAhaManualSyncAuditResult };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.AhaDashboard = api;
})(typeof window !== "undefined" ? window : globalThis);
