(function (globalScope) {
  "use strict";

  const AHA_MANUAL_SYNC_AUDIT_SCHEMA_VERSION = "1.0.0";
  const AUDIT_NOT_CONFIGURED_REASON = "Audit log writer is not configured.";
  const DUPLICATE_RUN_REASON = "This manual sync run and confirmation have already been submitted.";
  const SENSITIVE_KEY_PATTERN = /(authorization|bearer|cookie|credential|password|secret|session|token|api[_-]?key|access[_-]?key|private[_-]?key|connection[_-]?string|database[_-]?url|dsn)/i;
  const activeOrCompletedExecutions = new Set();

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

  function uniqueStrings(values) {
    return [...new Set(asArray(values).filter(Boolean).map(String))];
  }

  function messageOf(value) {
    if (typeof value === "string") return value;
    if (value && typeof value.message === "string") return value.message;
    return String(value || "Unknown error");
  }

  function normalizeItemCounts(itemCounts, includedModules) {
    const included = new Set(uniqueStrings(includedModules));
    return Object.entries(itemCounts && typeof itemCounts === "object" ? itemCounts : {}).reduce((out, [key, value]) => {
      if (!included.has(String(key))) return out;
      const count = Number(value);
      out[String(key)] = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
      return out;
    }, {});
  }

  function checksum(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
  }

  function buildIncludedPayload(payload, includedModules) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    return uniqueStrings(includedModules).reduce((result, moduleId) => {
      if (Object.prototype.hasOwnProperty.call(payload, moduleId)) result[moduleId] = payload[moduleId];
      return result;
    }, {});
  }

  function buildAhaManualSyncAuditPayloadSummary(payload, includedModules, itemCounts) {
    const moduleIds = uniqueStrings(includedModules);
    const counts = normalizeItemCounts(itemCounts, moduleIds);
    const moduleShape = moduleIds.map((moduleId) => {
      const value = payload && typeof payload === "object" ? payload[moduleId] : undefined;
      return {
        moduleId,
        count: counts[moduleId] || 0,
        payloadType: Array.isArray(value) ? "array" : (value === null ? "null" : typeof value)
      };
    });
    const serializedShape = JSON.stringify(moduleShape);
    return {
      moduleIds,
      itemCounts: counts,
      totalItems: Object.values(counts).reduce((sum, count) => sum + count, 0),
      checksum: checksum(serializedShape),
      checksumScope: "module_ids_counts_and_types"
    };
  }

  function summarizeObject(value, allowedKeys) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    return allowedKeys.reduce((result, key) => {
      if (!Object.prototype.hasOwnProperty.call(source, key) || SENSITIVE_KEY_PATTERN.test(key)) return result;
      const item = source[key];
      if (item == null || typeof item === "boolean" || typeof item === "number") result[key] = item;
      else if (typeof item === "string") result[key] = item.slice(0, 500);
      return result;
    }, {});
  }

  function createAhaManualSyncAuditEntry(input) {
    const includedModules = uniqueStrings(input.includedModules);
    const itemCounts = normalizeItemCounts(input.itemCounts, includedModules);
    const recordedAt = input.recordedAt || input.timestamp || new Date().toISOString();
    return {
      schemaVersion: AHA_MANUAL_SYNC_AUDIT_SCHEMA_VERSION,
      runId: String(input.runId || "").trim(),
      recordedAt,
      timestamp: recordedAt,
      trigger: "manual",
      phase: input.phase || "attempt",
      target: input.target || null,
      targetStatus: input.targetStatus || "unknown",
      includedModules,
      excludedModules: uniqueStrings(input.excludedModules).filter((moduleId) => !includedModules.includes(moduleId)),
      itemCounts,
      totalItems: Object.values(itemCounts).reduce((sum, count) => sum + count, 0),
      readinessStatus: input.readinessStatus || "unknown",
      validationSummary: summarizeObject(input.validationSummary, ["ok", "checked", "errorCount", "warningCount", "status"]),
      checklistSummary: summarizeObject(input.checklistSummary, ["ok", "completed", "total", "status"]),
      payloadSummary: buildAhaManualSyncAuditPayloadSummary(input.payload, includedModules, itemCounts),
      confirmationSummary: {
        confirmed: input.confirmation?.confirmed === true,
        confirmedAt: input.confirmation?.confirmedAt || null
      },
      resultStatus: input.resultStatus || "blocked",
      writeStatus: input.writeStatus || "not_started",
      rollbackStatus: "not_available",
      warnings: uniqueStrings(input.warnings).map(redactAuditText).slice(0, 100),
      errors: uniqueStrings(input.errors).map(redactAuditText).slice(0, 100)
    };
  }

  function resolveAuditWriter(dependencies) {
    if (typeof dependencies.auditWriter === "function") return dependencies.auditWriter;
    const repository = dependencies.auditRepository || globalScope.AhaManualSyncAuditRepository;
    return typeof repository?.writeAhaManualSyncAuditLog === "function" ? repository.writeAhaManualSyncAuditLog.bind(repository) : null;
  }

  function resolveTargetWriter(dependencies) {
    if (typeof dependencies.writeTarget === "function") return dependencies.writeTarget;
    const auth = dependencies.auth || globalScope.HistoryGoAHAAuth;
    return typeof auth?.syncHistoryGoPayload === "function" ? auth.syncHistoryGoPayload.bind(auth) : null;
  }

  function blockedReasons(input, includedPayload) {
    const reasons = [];
    const includedModules = uniqueStrings(input.includedModules);
    if (input.readinessStatus !== "ready") reasons.push("Manual sync is not ready.");
    if (!input.target) reasons.push("A sync target must be selected.");
    if (input.targetStatus !== "ready") reasons.push("The selected sync target is not ready.");
    if (input.confirmation?.confirmed !== true) reasons.push("Manual sync confirmation is required.");
    if (input.validationSummary?.ok !== true) reasons.push("Manual sync validation failed.");
    if (input.checklistSummary?.ok !== true) reasons.push("Manual sync checklist is incomplete.");
    if (includedModules.length === 0) reasons.push("At least one module must be included.");
    if (!includedPayload || includedModules.some((moduleId) => !Object.prototype.hasOwnProperty.call(includedPayload, moduleId))) {
      reasons.push("Manual sync payload is invalid for the included modules.");
    }
    return uniqueStrings(reasons);
  }

  function executionKey(input) {
    const runId = String(input.runId || "").trim();
    const confirmedAt = String(input.confirmation?.confirmedAt || "confirmed").trim();
    return runId ? `${runId}::${confirmedAt}` : "";
  }

  async function writeAudit(auditWriter, entry) {
    try {
      const result = await auditWriter(entry);
      return result && typeof result === "object"
        ? result
        : { ok: false, status: "failed", auditId: null, errors: ["Audit writer returned an invalid result."], warnings: [] };
    } catch (error) {
      return { ok: false, status: "failed", auditId: null, errors: [messageOf(error)], warnings: [] };
    }
  }

  function auditStatusOf(result) {
    return result?.status || (result?.ok ? "success" : "failed");
  }

  async function auditBlockedRun(auditWriter, base, errors, writeStatus) {
    if (!auditWriter) return { ok: false, status: "not_configured", auditId: null, errors: [], warnings: [] };
    return writeAudit(auditWriter, createAhaManualSyncAuditEntry({
      ...base,
      phase: "blocked",
      resultStatus: "blocked",
      writeStatus: writeStatus || "not_started",
      errors
    }));
  }

  async function executeAhaManualSyncRun(input, dependencyInput) {
    const dependencies = dependencyInput || {};
    const now = dependencies.now || (() => new Date().toISOString());
    const runIdFactory = dependencies.runIdFactory || (() => `aha-manual-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    const runId = String(input?.runId || runIdFactory()).trim();
    const recordedAt = input?.recordedAt || input?.timestamp || now();
    const auditWriter = resolveAuditWriter(dependencies);
    const targetWriter = resolveTargetWriter(dependencies);
    const base = { ...(input || {}), runId, recordedAt, timestamp: recordedAt };
    const includedPayload = buildIncludedPayload(base.payload, base.includedModules);
    const gateErrors = blockedReasons(base, includedPayload);
    const duplicateKey = executionKey(base);

    if (!auditWriter) {
      return { ok: false, status: "blocked", resultStatus: "blocked", reason: AUDIT_NOT_CONFIGURED_REASON, runId, target: base.target || null, writeStatus: "not_started", rollbackStatus: "not_available", auditStatus: "not_configured", auditId: null, errors: uniqueStrings([...gateErrors, AUDIT_NOT_CONFIGURED_REASON]), warnings: [] };
    }

    if (duplicateKey && activeOrCompletedExecutions.has(duplicateKey)) gateErrors.unshift(DUPLICATE_RUN_REASON);

    if (gateErrors.length) {
      const auditResult = await auditBlockedRun(auditWriter, base, gateErrors, "not_started");
      return {
        ok: false,
        status: "blocked",
        resultStatus: "blocked",
        reason: gateErrors[0],
        runId,
        target: base.target || null,
        writeStatus: "not_started",
        rollbackStatus: "not_available",
        auditStatus: auditStatusOf(auditResult),
        auditId: auditResult.auditId || null,
        errors: uniqueStrings([...gateErrors, ...asArray(auditResult.errors).map(messageOf)]),
        warnings: uniqueStrings(asArray(auditResult.warnings).map(messageOf))
      };
    }

    if (!targetWriter) {
      const errors = ["Manual sync target writer is not configured."];
      const auditResult = await auditBlockedRun(auditWriter, base, errors, "not_configured");
      return { ok: false, status: "blocked", resultStatus: "blocked", reason: errors[0], runId, target: base.target, writeStatus: "not_configured", rollbackStatus: "not_available", auditStatus: auditStatusOf(auditResult), auditId: auditResult.auditId || null, errors: uniqueStrings([...errors, ...asArray(auditResult.errors).map(messageOf)]), warnings: uniqueStrings(asArray(auditResult.warnings).map(messageOf)) };
    }

    if (duplicateKey) activeOrCompletedExecutions.add(duplicateKey);

    // Audit is fail-closed: a durable attempt must succeed before the domain write starts.
    const attemptAudit = await writeAudit(auditWriter, createAhaManualSyncAuditEntry({
      ...base,
      phase: "attempt",
      resultStatus: "pending",
      writeStatus: "not_started"
    }));
    if (!attemptAudit.ok) {
      if (duplicateKey) activeOrCompletedExecutions.delete(duplicateKey);
      const auditErrors = asArray(attemptAudit.errors).map(messageOf);
      return {
        ok: false,
        status: "blocked",
        resultStatus: "blocked",
        reason: "Audit attempt could not be recorded.",
        runId,
        target: base.target,
        writeStatus: "not_started",
        rollbackStatus: "not_available",
        auditStatus: auditStatusOf(attemptAudit),
        auditId: attemptAudit.auditId || null,
        errors: uniqueStrings(["Audit attempt could not be recorded.", ...auditErrors]),
        warnings: uniqueStrings(asArray(attemptAudit.warnings).map(messageOf))
      };
    }

    let writeResult;
    try {
      writeResult = await targetWriter(includedPayload, { runId, target: base.target, trigger: "manual", confirmation: base.confirmation });
    } catch (error) {
      writeResult = { ok: false, status: "failed", errors: [messageOf(error)] };
    }

    const writeOk = writeResult?.ok === true;
    const writeStatus = writeOk ? "success" : "failed";
    const writeErrors = uniqueStrings([...(asArray(writeResult?.errors).map(messageOf)), ...(writeResult?.error ? [messageOf(writeResult.error)] : [])]);
    const writeWarnings = uniqueStrings(asArray(writeResult?.warnings).map(messageOf));
    const outcomeAudit = await writeAudit(auditWriter, createAhaManualSyncAuditEntry({
      ...base,
      phase: writeOk ? "outcome" : "failed",
      resultStatus: writeOk ? "success" : "failed",
      writeStatus,
      errors: writeErrors,
      warnings: writeWarnings
    }));
    const auditStatus = auditStatusOf(outcomeAudit);
    const auditErrors = asArray(outcomeAudit.errors).map(messageOf);
    const allErrors = uniqueStrings([...writeErrors, ...auditErrors]);
    const allWarnings = uniqueStrings([...writeWarnings, ...asArray(outcomeAudit.warnings).map(messageOf)]);
    const status = writeOk && outcomeAudit.ok ? "success" : (writeOk ? "partial_success" : "failed");

    return {
      ok: status === "success",
      status,
      resultStatus: status,
      runId,
      target: base.target,
      writeStatus,
      writeResult: { ok: writeOk, status: writeStatus, errors: writeErrors, warnings: writeWarnings },
      rollbackStatus: "not_available",
      auditStatus,
      auditId: outcomeAudit.auditId || attemptAudit.auditId || null,
      attemptAuditId: attemptAudit.auditId || null,
      auditWrittenAt: outcomeAudit.writtenAt || null,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  function resetAhaManualSyncDuplicateGuardForTests() {
    activeOrCompletedExecutions.clear();
  }

  const api = {
    AHA_MANUAL_SYNC_AUDIT_SCHEMA_VERSION,
    AUDIT_NOT_CONFIGURED_REASON,
    DUPLICATE_RUN_REASON,
    buildAhaManualSyncAuditPayloadSummary,
    createAhaManualSyncAuditEntry,
    createPayloadSummary: buildAhaManualSyncAuditPayloadSummary,
    executeAhaManualSyncRun,
    resetAhaManualSyncDuplicateGuardForTests
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.AhaManualSyncAdapter = api;
})(typeof window !== "undefined" ? window : globalThis);
