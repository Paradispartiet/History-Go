// js/fagHealthReport.js
// Validerer data/fag/fag_manifest.json og alle erklærte fagfiler.

(function () {
  const FIELDS = ["pensum", "emner", "fagkart", "methods", "supersetQuizMal"];

  function createReport() {
    return {
      ok: true,
      summary: {
        subjects: 0,
        activeFiles: 0,
        nullFields: 0,
        fetched: 0,
        validJson: 0,
        errors: 0,
        warnings: 0,
        courseReadySubjects: 0,
        domainOnlySubjects: 0
      },
      subjects: {},
      errors: [],
      warnings: []
    };
  }

  function warn(report, message, context) {
    report.summary.warnings += 1;
    report.warnings.push({ message: message, context: context || null });
  }

  function error(report, message, context) {
    report.summary.errors += 1;
    report.errors.push({ message: message, context: context || null });
    report.ok = false;
  }

  function normalizePath(relPath) {
    const clean = String(relPath || "").trim();
    return clean.startsWith("data/fag/") ? clean : "data/fag/" + clean;
  }

  function isValidManifestPath(relPath) {
    const raw = String(relPath || "").trim();
    if (!raw) return false;
    if (/^(?:[a-z]+:)?\/\//i.test(raw)) return false;
    if (raw.startsWith("/")) return false;
    if (raw.includes("..")) return false;
    return true;
  }

  async function fetchJsonFile(filePath) {
    const result = {
      filePath: filePath,
      status: null,
      ok: false,
      empty: false,
      parsed: false,
      json: null,
      parseError: null
    };

    try {
      const res = await fetch(filePath, { cache: "no-store" });
      result.status = res.status;
      result.ok = res.ok;
      if (!res.ok) return result;

      const text = await res.text();
      if (!text || !text.trim()) {
        result.empty = true;
        return result;
      }

      result.json = JSON.parse(text);
      result.parsed = true;
      return result;
    } catch (e) {
      result.parseError = String(e);
      return result;
    }
  }

  function resolveSubject(subjectId) {
    if (!window.DomainRegistry || typeof window.DomainRegistry.resolve !== "function") {
      return { canonical: subjectId, usedRegistry: false };
    }
    try {
      return { canonical: window.DomainRegistry.resolve(subjectId), usedRegistry: true };
    } catch (_e) {
      return { canonical: subjectId, usedRegistry: true, resolveError: true };
    }
  }

  function validateSubjectIdMatch(foundValue, manifestSubjectId, context, report) {
    if (typeof foundValue !== "string" || !foundValue.trim()) return;
    const expected = resolveSubject(manifestSubjectId).canonical;
    const found = resolveSubject(foundValue).canonical;
    if (expected !== found) {
      warn(report, "subject_id mismatch", {
        where: context,
        manifestSubjectId: manifestSubjectId,
        expectedCanonical: expected,
        foundSubjectId: foundValue,
        foundCanonical: found
      });
    }
  }

  function validateManifest(manifest) {
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
      return { ok: false, message: "Manifest må være et objekt." };
    }
    return { ok: true };
  }

  async function run(opts) {
    const options = opts || {};
    const report = createReport();

    let manifest;
    try {
      if (window.DataHub && typeof window.DataHub.loadFagManifest === "function") {
        manifest = await window.DataHub.loadFagManifest(options);
      } else {
        const res = await fetch("data/fag/fag_manifest.json", { cache: "no-store" });
        if (!res.ok) {
          error(report, "Kunne ikke laste manifest", { status: res.status, url: "data/fag/fag_manifest.json" });
          return report;
        }
        manifest = await res.json();
      }
    } catch (e) {
      error(report, "Feil ved lasting av manifest", { error: String(e) });
      return report;
    }

    const manifestValidation = validateManifest(manifest);
    if (!manifestValidation.ok) {
      error(report, manifestValidation.message);
      return report;
    }

    const subjectIds = Object.keys(manifest);
    report.summary.subjects = subjectIds.length;

    for (const subjectId of subjectIds) {
      const entry = manifest[subjectId];
      report.subjects[subjectId] = {};

      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        error(report, "Subject entry må være objekt", { subjectId: subjectId });
        continue;
      }

      for (const field of FIELDS) {
        const value = entry[field];
        const fieldReport = { status: "not_declared" };
        report.subjects[subjectId][field] = fieldReport;

        if (value === null) {
          fieldReport.status = "missing_declared_null";
          report.summary.nullFields += 1;
          continue;
        }

        if (typeof value !== "string") {
          if (typeof value !== "undefined") {
            error(report, "Felt må være string eller null", { subjectId: subjectId, field: field, type: typeof value });
            fieldReport.status = "invalid_declaration";
          }
          continue;
        }

        if (!isValidManifestPath(value)) {
          fieldReport.status = "invalid_path";
          error(report, "Ugyldig manifest-path", { subjectId: subjectId, field: field, value: value });
          continue;
        }

        const path = normalizePath(value);
        fieldReport.path = path;
        report.summary.activeFiles += 1;

        const fetched = await fetchJsonFile(path);
        report.summary.fetched += 1;
        fieldReport.httpStatus = fetched.status;

        if (!fetched.ok) {
          fieldReport.status = "http_error";
          error(report, "Klarte ikke hente fil", { subjectId: subjectId, field: field, path: path, status: fetched.status });
          continue;
        }

        if (fetched.empty) {
          fieldReport.status = "empty_file";
          error(report, "Tom fil", { subjectId: subjectId, field: field, path: path });
          continue;
        }

        if (!fetched.parsed) {
          fieldReport.status = "invalid_json";
          error(report, "Ugyldig JSON", { subjectId: subjectId, field: field, path: path, error: fetched.parseError });
          continue;
        }

        fieldReport.status = "ok";
        report.summary.validJson += 1;

        const json = fetched.json;

        if (field === "emner") {
          if (!Array.isArray(json)) {
            fieldReport.status = "invalid_structure";
            error(report, "emner må være array", { subjectId: subjectId, path: path });
            continue;
          }
          fieldReport.emnerCount = json.length;
          const emneIdCount = json.filter(function (item) { return item && item.emne_id; }).length;
          fieldReport.withEmneId = emneIdCount;
          if (emneIdCount === 0 && json.length > 0) {
            warn(report, "emner har ingen entries med emne_id", { subjectId: subjectId, path: path });
          }
          for (const item of json) {
            if (item && typeof item === "object" && Object.prototype.hasOwnProperty.call(item, "subject_id")) {
              validateSubjectIdMatch(item.subject_id, subjectId, "emner", report);
            }
          }
        } else if (field === "pensum") {
          if (!json || typeof json !== "object" || Array.isArray(json)) {
            fieldReport.status = "invalid_structure";
            error(report, "pensum må være objekt", { subjectId: subjectId, path: path });
            continue;
          }
          const modulesCount = Array.isArray(json.modules) ? json.modules.length : 0;
          const domainsCount = Array.isArray(json.domains) ? json.domains.length : 0;
          fieldReport.modules = modulesCount;
          fieldReport.domains = domainsCount;
          fieldReport.course_ready = modulesCount > 0;
          fieldReport.domain_only = domainsCount > 0 && modulesCount === 0;
          if (fieldReport.course_ready) report.summary.courseReadySubjects += 1;
          if (fieldReport.domain_only) report.summary.domainOnlySubjects += 1;
        } else if (field === "fagkart") {
          if (!json || typeof json !== "object" || Array.isArray(json)) {
            fieldReport.status = "invalid_structure";
            error(report, "fagkart må være objekt", { subjectId: subjectId, path: path });
            continue;
          }
          fieldReport.categories = Array.isArray(json.categories) ? json.categories.length : 0;
          if (typeof json.type === "string" && json.type !== "fagkart") {
            warn(report, "fagkart.type avviker", { subjectId: subjectId, found: json.type });
          }
          if (Object.prototype.hasOwnProperty.call(json, "subject_id")) {
            validateSubjectIdMatch(json.subject_id, subjectId, "fagkart", report);
          }
        } else if (field === "methods") {
          if (!json || typeof json !== "object" || Array.isArray(json)) {
            fieldReport.status = "invalid_structure";
            error(report, "methods må være objekt", { subjectId: subjectId, path: path });
            continue;
          }
          fieldReport.methodsCount = Array.isArray(json.methods) ? json.methods.length : 0;
          if (typeof json.type === "string" && json.type !== "methods") {
            warn(report, "methods.type avviker", { subjectId: subjectId, found: json.type });
          }
          if (Object.prototype.hasOwnProperty.call(json, "subject_id")) {
            validateSubjectIdMatch(json.subject_id, subjectId, "methods", report);
          }
        } else if (field === "supersetQuizMal") {
          if (!(Array.isArray(json) || (json && typeof json === "object"))) {
            fieldReport.status = "invalid_structure";
            error(report, "supersetQuizMal må være objekt eller array", { subjectId: subjectId, path: path });
            continue;
          }
          fieldReport.shape = Array.isArray(json) ? "array" : "object";
        }
      }
    }

    console.group("[FagHealthReport]");
    const rows = subjectIds.map(function (subjectId) {
      const s = report.subjects[subjectId] || {};
      return {
        subjectId: subjectId,
        pensum: (s.pensum && s.pensum.status) || "-",
        emner: (s.emner && s.emner.status) || "-",
        fagkart: (s.fagkart && s.fagkart.status) || "-",
        methods: (s.methods && s.methods.status) || "-",
        supersetQuizMal: (s.supersetQuizMal && s.supersetQuizMal.status) || "-",
        modules: (s.pensum && s.pensum.modules) || 0,
        domains: (s.pensum && s.pensum.domains) || 0,
        emnerCount: (s.emner && s.emner.emnerCount) || 0,
        warnings: report.warnings.filter(function (w) { return w.context && w.context.subjectId === subjectId; }).length,
        errors: report.errors.filter(function (e) { return e.context && e.context.subjectId === subjectId; }).length
      };
    });
    console.table(rows);
    report.warnings.forEach(function (w) { console.warn("[FagHealthReport]", w.message, w.context || ""); });
    report.errors.forEach(function (e) { console.error("[FagHealthReport]", e.message, e.context || ""); });
    console.groupEnd();

    return report;
  }

  window.FagHealthReport = {
    run: run,
    validateManifest: validateManifest
  };
})();
