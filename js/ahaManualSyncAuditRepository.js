(function (globalScope) {
  "use strict";

  const AUDIT_SOURCE_APP = "historygo_manual_sync_audit";
  const AUDIT_RECORD_PREFIX = "historygo_manual_sync_audit_";
  const AUDIT_SCHEMA_VERSION = "1.0.0";
  const SENSITIVE_KEY_PATTERN = /(authorization|bearer|cookie|credential|password|secret|session|token|api[_-]?key|access[_-]?key|private[_-]?key|connection[_-]?string|database[_-]?url|dsn)/i;
  const ALLOWED_PHASES = new Set(["attempt", "outcome", "blocked", "failed"]);

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function redactAuditText(value) {
    return String(value || "")
      .replace(/(bearer\s+)[^\s,;]+/gi, "$1[redacted]")
      .replace(/([a-z][a-z0-9+.-]*:\/\/)[^\s/@:]+:[^\s/@]+@/gi, "$1[redacted]@")
      .replace(/((?:password|secret|token|api[_-]?key|connection[_-]?string)\s*[=:]\s*)[^\s,;]+/gi, "$1[redacted]")
      .slice(0, 1000);
  }

  function safeStrings(value) {
    return asArray(value).filter((item) => typeof item === "string" || typeof item === "number").map(redactAuditText).slice(0, 100);
  }

  function safeScalarObject(value, allowedKeys) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    return allowedKeys.reduce((result, key) => {
      if (!Object.prototype.hasOwnProperty.call(source, key) || SENSITIVE_KEY_PATTERN.test(key)) return result;
      const item = source[key];
      if (item == null || typeof item === "boolean" || typeof item === "number") result[key] = item;
      else if (typeof item === "string") result[key] = item.slice(0, 500);
      return result;
    }, {});
  }

  function safeCounts(value) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    return Object.entries(source).slice(0, 100).reduce((result, [key, count]) => {
      if (SENSITIVE_KEY_PATTERN.test(key)) return result;
      const number = Number(count);
      result[String(key)] = Number.isFinite(number) && number >= 0 ? Math.floor(number) : 0;
      return result;
    }, {});
  }

  function redactAhaManualSyncAuditEntry(entry) {
    const source = entry && typeof entry === "object" && !Array.isArray(entry) ? entry : {};
    const recordedAt = typeof source.recordedAt === "string"
      ? source.recordedAt
      : (typeof source.timestamp === "string" ? source.timestamp : new Date().toISOString());
    const phase = ALLOWED_PHASES.has(source.phase) ? source.phase : "failed";
    const includedModules = safeStrings(source.includedModules);
    const excludedModules = safeStrings(source.excludedModules).filter((moduleId) => !includedModules.includes(moduleId));
    const itemCounts = safeCounts(source.itemCounts);
    const payloadSummarySource = source.payloadSummary && typeof source.payloadSummary === "object" ? source.payloadSummary : {};

    return {
      schemaVersion: AUDIT_SCHEMA_VERSION,
      runId: String(source.runId || "").trim(),
      recordedAt,
      timestamp: recordedAt,
      trigger: "manual",
      phase,
      target: typeof source.target === "string" ? source.target.slice(0, 200) : null,
      targetStatus: typeof source.targetStatus === "string" ? source.targetStatus.slice(0, 100) : "unknown",
      includedModules,
      excludedModules,
      itemCounts,
      totalItems: Number.isFinite(Number(source.totalItems)) ? Math.max(0, Math.floor(Number(source.totalItems))) : 0,
      readinessStatus: typeof source.readinessStatus === "string" ? source.readinessStatus.slice(0, 100) : "unknown",
      validationSummary: safeScalarObject(source.validationSummary, ["ok", "checked", "errorCount", "warningCount", "status"]),
      checklistSummary: safeScalarObject(source.checklistSummary, ["ok", "completed", "total", "status"]),
      payloadSummary: {
        moduleIds: safeStrings(payloadSummarySource.moduleIds),
        itemCounts: safeCounts(payloadSummarySource.itemCounts),
        totalItems: Number.isFinite(Number(payloadSummarySource.totalItems)) ? Math.max(0, Math.floor(Number(payloadSummarySource.totalItems))) : 0,
        checksum: typeof payloadSummarySource.checksum === "string" ? payloadSummarySource.checksum.slice(0, 200) : null,
        checksumScope: typeof payloadSummarySource.checksumScope === "string" ? payloadSummarySource.checksumScope.slice(0, 200) : null
      },
      confirmationSummary: {
        confirmed: source.confirmationSummary?.confirmed === true,
        confirmedAt: typeof source.confirmationSummary?.confirmedAt === "string" ? source.confirmationSummary.confirmedAt.slice(0, 100) : null
      },
      resultStatus: typeof source.resultStatus === "string" ? source.resultStatus.slice(0, 100) : "failed",
      writeStatus: typeof source.writeStatus === "string" ? source.writeStatus.slice(0, 100) : "not_started",
      rollbackStatus: "not_available",
      warnings: safeStrings(source.warnings),
      errors: safeStrings(source.errors)
    };
  }

  function errorMessage(error) {
    return error && (error.message || error.error_description) ? String(error.message || error.error_description) : String(error || "Unknown audit write error");
  }

  async function writeAhaManualSyncAuditLog(entry, dependencies) {
    const deps = dependencies || {};
    const auth = deps.auth || globalScope.HistoryGoAHAAuth;
    const sanitizedEntry = redactAhaManualSyncAuditEntry(entry);
    const runId = sanitizedEntry.runId;
    const target = sanitizedEntry.target;

    if (!runId) {
      return { ok: false, status: "invalid", auditId: null, runId, target, phase: sanitizedEntry.phase, writtenAt: null, errors: ["Audit runId is required."], warnings: [] };
    }
    if (!auth || typeof auth.getClient !== "function") {
      return { ok: false, status: "not_configured", auditId: null, runId, target, phase: sanitizedEntry.phase, writtenAt: null, errors: ["Audit log writer is not configured."], warnings: [] };
    }

    try {
      const client = deps.client || await auth.getClient();
      if (!client || typeof client.from !== "function") {
        return { ok: false, status: "not_configured", auditId: null, runId, target, phase: sanitizedEntry.phase, writtenAt: null, errors: ["Audit log writer is not configured."], warnings: [] };
      }

      const session = typeof auth.getSession === "function" ? await auth.getSession() : null;
      const profileId = session?.user?.id || (typeof auth.getProfileIdSync === "function" ? auth.getProfileIdSync() : null);
      const auditId = `${AUDIT_RECORD_PREFIX}${runId}_${sanitizedEntry.phase}`;
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
        phase: sanitizedEntry.phase,
        writtenAt: response?.data?.created_at || writtenAt,
        errors: [],
        warnings: profileId ? [] : ["Audit entry was written without a profile id."]
      };
    } catch (error) {
      return { ok: false, status: "failed", auditId: null, runId, target, phase: sanitizedEntry.phase, writtenAt: null, errors: [errorMessage(error)], warnings: [] };
    }
  }

  const api = {
    AUDIT_SCHEMA_VERSION,
    writeAhaManualSyncAuditLog,
    redactAhaManualSyncAuditEntry,
    sanitizeAhaManualSyncAuditEntry: redactAhaManualSyncAuditEntry
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.AhaManualSyncAuditRepository = api;
})(typeof window !== "undefined" ? window : globalThis);
