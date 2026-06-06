(function (globalScope) {
  "use strict";

  const AUDIT_NOT_CONFIGURED_REASON = "Audit log writer is not configured.";
  const SENSITIVE_KEY_PATTERN = /(authorization|cookie|credential|password|secret|session|token|api[_-]?key|access[_-]?key|private[_-]?key)/i;

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function uniqueStrings(values) {
    return [...new Set(asArray(values).filter(Boolean).map(String))];
  }

  function messageOf(value) {
    if (typeof value === "string") return value;
    if (value && typeof value.message === "string") return value.message;
    return String(value || "Unknown error");
  }

  function stableSummaryValue(value, seen) {
    if (value == null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return value;
    if (typeof value !== "object") return String(value);
    if (seen.has(value)) return "[circular]";
    seen.add(value);
    const result = Array.isArray(value)
      ? value.map((item) => stableSummaryValue(item, seen))
      : Object.keys(value).sort().reduce((out, key) => {
          if (!SENSITIVE_KEY_PATTERN.test(key)) out[key] = stableSummaryValue(value[key], seen);
          return out;
        }, {});
    seen.delete(value);
    return result;
  }

  function checksum(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
  }

  function createPayloadSummary(payload) {
    const value = payload && typeof payload === "object" ? payload : {};
    const safeValue = stableSummaryValue(value, new WeakSet());
    const serialized = JSON.stringify(safeValue);
    return {
      type: Array.isArray(value) ? "array" : typeof value,
      topLevelKeys: Array.isArray(value) ? [] : Object.keys(value).filter((key) => !SENSITIVE_KEY_PATTERN.test(key)).sort(),
      topLevelItemCount: Array.isArray(value) ? value.length : Object.keys(value).length,
      serializedBytes: serialized.length,
      checksum: checksum(serialized)
    };
  }

  function normalizeItemCounts(itemCounts) {
    return Object.entries(itemCounts && typeof itemCounts === "object" ? itemCounts : {}).reduce((out, [key, value]) => {
      const count = Number(value);
      out[String(key)] = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
      return out;
    }, {});
  }

  function createAhaManualSyncAuditEntry(input) {
    const itemCounts = normalizeItemCounts(input.itemCounts);
    return {
      runId: input.runId,
      timestamp: input.timestamp,
      trigger: "manual",
      target: input.target || null,
      targetStatus: input.targetStatus || "unknown",
      includedModules: uniqueStrings(input.includedModules),
      excludedModules: uniqueStrings(input.excludedModules),
      itemCounts,
      totalItems: Object.values(itemCounts).reduce((sum, count) => sum + count, 0),
      readinessStatus: input.readinessStatus || "unknown",
      validationSummary: input.validationSummary || {},
      checklistSummary: input.checklistSummary || {},
      payloadSummary: createPayloadSummary(input.payload),
      confirmation: {
        confirmed: input.confirmation?.confirmed === true,
        confirmedAt: input.confirmation?.confirmedAt || null
      },
      resultStatus: input.resultStatus || "attempted",
      writeStatus: input.writeStatus || "not_started",
      writeResult: input.writeResult || {},
      rollbackStatus: input.rollbackStatus || "not_required",
      warnings: uniqueStrings(input.warnings),
      errors: uniqueStrings(input.errors)
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

  function blockedReasons(input) {
    const reasons = [];
    if (input.readinessStatus !== "ready") reasons.push("Manual sync is not ready.");
    if (!input.target) reasons.push("A sync target must be selected.");
    if (input.targetStatus !== "ready") reasons.push("The selected sync target is not ready.");
    if (input.confirmation?.confirmed !== true) reasons.push("Manual sync confirmation is required.");
    if (input.validationSummary?.ok === false) reasons.push("Manual sync validation failed.");
    if (input.checklistSummary?.ok === false) reasons.push("Manual sync checklist is incomplete.");
    return reasons;
  }

  async function writeAudit(auditWriter, entry) {
    try {
      const result = await auditWriter(entry);
      return result && typeof result === "object" ? result : { ok: false, status: "failed", errors: ["Audit writer returned an invalid result."], warnings: [] };
    } catch (error) {
      return { ok: false, status: "failed", auditId: null, errors: [messageOf(error)], warnings: [] };
    }
  }

  async function executeAhaManualSyncRun(input, dependencyInput) {
    const dependencies = dependencyInput || {};
    const now = dependencies.now || (() => new Date().toISOString());
    const runIdFactory = dependencies.runIdFactory || (() => `aha-manual-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    const runId = String(input?.runId || runIdFactory());
    const timestamp = input?.timestamp || now();
    const requireAuditWriter = dependencies.requireAuditWriter !== false;
    const auditWriter = resolveAuditWriter(dependencies);
    const targetWriter = resolveTargetWriter(dependencies);
    const base = { ...(input || {}), runId, timestamp };
    const gateErrors = blockedReasons(base);

    if (!auditWriter && requireAuditWriter) {
      return { ok: false, status: "blocked", reason: AUDIT_NOT_CONFIGURED_REASON, runId, target: base.target || null, writeStatus: "not_started", rollbackStatus: "not_required", auditStatus: "not_configured", auditId: null, errors: [...gateErrors, AUDIT_NOT_CONFIGURED_REASON], warnings: [] };
    }

    if (gateErrors.length) {
      let auditResult = { ok: false, status: "not_configured", auditId: null, errors: [], warnings: [] };
      if (auditWriter) {
        auditResult = await writeAudit(auditWriter, createAhaManualSyncAuditEntry({ ...base, resultStatus: "blocked", writeStatus: "not_started", errors: gateErrors }));
      }
      return {
        ok: false,
        status: "blocked",
        reason: gateErrors[0],
        runId,
        target: base.target || null,
        writeStatus: "not_started",
        rollbackStatus: "not_required",
        auditStatus: auditResult.status || (auditResult.ok ? "success" : "failed"),
        auditId: auditResult.auditId || null,
        errors: uniqueStrings([...gateErrors, ...asArray(auditResult.errors)]),
        warnings: uniqueStrings(auditResult.warnings)
      };
    }

    if (!targetWriter) {
      gateErrors.push("Manual sync target writer is not configured.");
      const auditResult = auditWriter
        ? await writeAudit(auditWriter, createAhaManualSyncAuditEntry({ ...base, resultStatus: "blocked", writeStatus: "not_configured", errors: gateErrors }))
        : { status: "not_configured", errors: [], warnings: [] };
      return { ok: false, status: "blocked", reason: gateErrors[0], runId, target: base.target, writeStatus: "not_configured", rollbackStatus: "not_required", auditStatus: auditResult.status, auditId: auditResult.auditId || null, errors: uniqueStrings([...gateErrors, ...asArray(auditResult.errors)]), warnings: uniqueStrings(auditResult.warnings) };
    }

    let writeResult;
    try {
      writeResult = await targetWriter(base.payload, { runId, target: base.target, trigger: "manual" });
    } catch (error) {
      writeResult = { ok: false, status: "failed", errors: [messageOf(error)] };
    }

    const writeOk = writeResult?.ok === true;
    const writeStatus = writeResult?.status || (writeOk ? "success" : "failed");
    const rollbackStatus = writeResult?.rollbackStatus || (writeOk ? "not_required" : "not_available");
    const writeErrors = uniqueStrings([...(asArray(writeResult?.errors).map(messageOf)), ...(writeResult?.error ? [messageOf(writeResult.error)] : [])]);
    const writeWarnings = uniqueStrings(asArray(writeResult?.warnings).map(messageOf));
    const auditEntry = createAhaManualSyncAuditEntry({
      ...base,
      resultStatus: writeOk ? "success" : "failed",
      writeStatus,
      writeResult: { ok: writeOk, status: writeStatus },
      rollbackStatus,
      errors: writeErrors,
      warnings: writeWarnings
    });
    const auditResult = auditWriter
      ? await writeAudit(auditWriter, auditEntry)
      : { ok: false, status: "not_configured", auditId: null, errors: [], warnings: [] };
    const auditStatus = auditResult.status || (auditResult.ok ? "success" : "failed");
    const auditErrors = asArray(auditResult.errors).map(messageOf);
    const allErrors = uniqueStrings([...writeErrors, ...auditErrors]);
    const allWarnings = uniqueStrings([...writeWarnings, ...asArray(auditResult.warnings).map(messageOf)]);
    const status = writeOk && auditResult.ok ? "success" : (writeOk ? "partial_success" : "failed");

    return {
      ok: status === "success",
      status,
      runId,
      target: base.target,
      writeStatus,
      writeResult,
      rollbackStatus,
      auditStatus,
      auditId: auditResult.auditId || null,
      auditWrittenAt: auditResult.writtenAt || null,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  const api = { AUDIT_NOT_CONFIGURED_REASON, createAhaManualSyncAuditEntry, createPayloadSummary, executeAhaManualSyncRun };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.AhaManualSyncAdapter = api;
})(typeof window !== "undefined" ? window : globalThis);
