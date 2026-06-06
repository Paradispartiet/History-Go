(function (globalScope) {
  "use strict";

  const AUDIT_SOURCE_APP = "historygo_manual_sync_audit";
  const AUDIT_RECORD_PREFIX = "historygo_manual_sync_audit_";
  const SENSITIVE_KEY_PATTERN = /(authorization|cookie|credential|password|secret|session|token|api[_-]?key|access[_-]?key|private[_-]?key)/i;
  const DISALLOWED_PAYLOAD_KEYS = new Set(["payload", "fullPayload", "rawPayload"]);

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function cleanValue(value, key, seen) {
    if (SENSITIVE_KEY_PATTERN.test(String(key || "")) || DISALLOWED_PAYLOAD_KEYS.has(String(key || ""))) {
      return undefined;
    }
    if (value == null || typeof value === "boolean" || typeof value === "number") return value;
    if (typeof value === "string") return value.slice(0, 2000);
    if (typeof value !== "object") return String(value).slice(0, 2000);
    if (seen.has(value)) return "[circular]";

    seen.add(value);
    if (Array.isArray(value)) {
      const cleaned = value.slice(0, 200).map((item) => cleanValue(item, "", seen)).filter((item) => item !== undefined);
      seen.delete(value);
      return cleaned;
    }

    const cleaned = {};
    Object.entries(value).slice(0, 200).forEach(([childKey, childValue]) => {
      const safeValue = cleanValue(childValue, childKey, seen);
      if (safeValue !== undefined) cleaned[childKey] = safeValue;
    });
    seen.delete(value);
    return cleaned;
  }

  function sanitizeAhaManualSyncAuditEntry(entry) {
    const clean = cleanValue(entry && typeof entry === "object" ? entry : {}, "", new WeakSet());
    return {
      runId: String(clean.runId || "").trim(),
      timestamp: clean.timestamp || new Date().toISOString(),
      trigger: "manual",
      target: clean.target || null,
      targetStatus: clean.targetStatus || "unknown",
      includedModules: asArray(clean.includedModules),
      excludedModules: asArray(clean.excludedModules),
      itemCounts: clean.itemCounts && typeof clean.itemCounts === "object" ? clean.itemCounts : {},
      totalItems: Number.isFinite(Number(clean.totalItems)) ? Number(clean.totalItems) : 0,
      readinessStatus: clean.readinessStatus || "unknown",
      validationSummary: clean.validationSummary && typeof clean.validationSummary === "object" ? clean.validationSummary : {},
      checklistSummary: clean.checklistSummary && typeof clean.checklistSummary === "object" ? clean.checklistSummary : {},
      payloadSummary: clean.payloadSummary && typeof clean.payloadSummary === "object" ? clean.payloadSummary : {},
      confirmation: clean.confirmation && typeof clean.confirmation === "object" ? clean.confirmation : { confirmed: false, confirmedAt: null },
      resultStatus: clean.resultStatus || "unknown",
      writeStatus: clean.writeStatus || "not_started",
      writeResult: clean.writeResult && typeof clean.writeResult === "object" ? clean.writeResult : {},
      rollbackStatus: clean.rollbackStatus || "not_required",
      warnings: asArray(clean.warnings).map(String),
      errors: asArray(clean.errors).map(String)
    };
  }

  function errorMessage(error) {
    return error && (error.message || error.error_description) ? String(error.message || error.error_description) : String(error || "Unknown audit write error");
  }

  async function writeAhaManualSyncAuditLog(entry, dependencies) {
    const deps = dependencies || {};
    const auth = deps.auth || globalScope.HistoryGoAHAAuth;
    const sanitizedEntry = sanitizeAhaManualSyncAuditEntry(entry);
    const runId = sanitizedEntry.runId;
    const target = sanitizedEntry.target;

    if (!runId) {
      return { ok: false, status: "invalid", auditId: null, runId, target, writtenAt: null, errors: ["Audit runId is required."], warnings: [] };
    }
    if (!auth || typeof auth.getClient !== "function") {
      return { ok: false, status: "not_configured", auditId: null, runId, target, writtenAt: null, errors: ["Audit log writer is not configured."], warnings: [] };
    }

    try {
      const client = deps.client || await auth.getClient();
      if (!client || typeof client.from !== "function") {
        return { ok: false, status: "not_configured", auditId: null, runId, target, writtenAt: null, errors: ["Audit log writer is not configured."], warnings: [] };
      }

      const session = typeof auth.getSession === "function" ? await auth.getSession() : null;
      const profileId = session?.user?.id || (typeof auth.getProfileIdSync === "function" ? auth.getProfileIdSync() : null);
      const auditId = `${AUDIT_RECORD_PREFIX}${runId}`;
      const writtenAt = new Date().toISOString();
      const record = {
        id: auditId,
        profile_id: profileId || null,
        source_app: AUDIT_SOURCE_APP,
        payload: sanitizedEntry,
        counts: sanitizedEntry.itemCounts,
        created_at: writtenAt
      };
      const query = client.from("aha_imports").upsert(record, { onConflict: "id" });
      const response = typeof query.select === "function" ? await query.select().single() : await query;
      if (response?.error) throw response.error;

      return {
        ok: true,
        status: "success",
        auditId: response?.data?.id || auditId,
        runId,
        target,
        writtenAt: response?.data?.created_at || writtenAt,
        errors: [],
        warnings: profileId ? [] : ["Audit entry was written without a profile id."]
      };
    } catch (error) {
      return { ok: false, status: "failed", auditId: null, runId, target, writtenAt: null, errors: [errorMessage(error)], warnings: [] };
    }
  }

  const api = { writeAhaManualSyncAuditLog, sanitizeAhaManualSyncAuditEntry };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.AhaManualSyncAuditRepository = api;
})(typeof window !== "undefined" ? window : globalThis);
