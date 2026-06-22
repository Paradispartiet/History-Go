(() => {
  // js/courses.ts
  (function() {
    "use strict";
    function dlog(...a) {
      if (window.DEBUG) console.log("[HGCourses]", ...a);
    }
    function dwarn(...a) {
      if (window.DEBUG) console.warn("[HGCourses]", ...a);
    }
    function s(x) {
      return String(x != null ? x : "").trim();
    }
    function arr(x) {
      return Array.isArray(x) ? x : [];
    }
    function safeParse(key, fallback) {
      try {
        const v = JSON.parse(localStorage.getItem(key) || "null");
        return v == null ? fallback : v;
      } catch (e) {
        dwarn("bad json in", key, e);
        return fallback;
      }
    }
    function absUrl(path) {
      return new URL(String(path || ""), document.baseURI).toString();
    }
    async function fetchJson(path) {
      const url = absUrl(path);
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return await r.json();
    }
    const LEARNING_KEY = "hg_learning_log_v1";
    function getLearningLog() {
      const v = safeParse(LEARNING_KEY, []);
      return Array.isArray(v) ? v : [];
    }
    function buildLearningIndex(log) {
      const emneHits = /* @__PURE__ */ new Set();
      const conceptCounts = /* @__PURE__ */ new Map();
      const perfectByCat = /* @__PURE__ */ new Map();
      for (const evt of arr(log)) {
        const type = s(evt == null ? void 0 : evt.type);
        const cat = s(evt == null ? void 0 : evt.categoryId);
        if (type === "quiz_perfect" && cat) {
          perfectByCat.set(cat, (perfectByCat.get(cat) || 0) + 1);
        }
        for (const eid of arr(evt == null ? void 0 : evt.related_emner)) {
          const k = s(eid);
          if (k) emneHits.add(k);
        }
        for (const c of arr(evt == null ? void 0 : evt.concepts)) {
          const k = s(c);
          if (!k) continue;
          conceptCounts.set(k, (conceptCounts.get(k) || 0) + 1);
        }
      }
      return { emneHits, conceptCounts, perfectByCat };
    }
    function getUserConceptsFromIndex(conceptCounts) {
      return Array.from(conceptCounts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => (b.count || 0) - (a.count || 0));
    }
    async function loadPensum(subjectId) {
      var _a, _b;
      let sid = s(subjectId);
      if (!sid) throw new Error("subjectId missing");
      try {
        if ((_a = window.DomainRegistry) == null ? void 0 : _a.resolve) sid = s(window.DomainRegistry.resolve(sid));
      } catch (e) {
      }
      if ((_b = window.DataHub) == null ? void 0 : _b.loadPensum) {
        try {
          const fromHub = await window.DataHub.loadPensum(sid);
          if (fromHub && typeof fromHub === "object") return fromHub;
        } catch (e) {
          dwarn("DataHub.loadPensum failed for", sid, e);
        }
      }
      const primary = `data/fag/${sid}/pensum_${sid}.json`;
      try {
        const p = await fetchJson(primary);
        if (p && typeof p === "object") return p;
      } catch (e) {
        dwarn("could not load", primary, e);
      }
      throw new Error(`Fant ikke pensumfil: ${primary}`);
    }
    function normalizePensumForCourses(pensum, subjectId) {
      const source = pensum && typeof pensum === "object" ? pensum : {};
      const modules = arr(source.modules);
      if (modules.length) return source;
      const domains = arr(source.domains);
      if (!domains.length) return source;
      const sid = s(subjectId);
      const mappedModules = domains.map((domain, index) => {
        const originalDomainId = s(domain == null ? void 0 : domain.domain_id) || s(domain == null ? void 0 : domain.id) || "";
        const moduleId = originalDomainId || `${sid || "subject"}_domain_${index + 1}`;
        const title = s(domain == null ? void 0 : domain.title) || s(domain == null ? void 0 : domain.label) || s(domain == null ? void 0 : domain.name) || `Domain ${index + 1}`;
        return {
          module_id: moduleId,
          title,
          emner: arr(domain == null ? void 0 : domain.emne_ids),
          methods: arr(domain == null ? void 0 : domain.method_ids),
          hooks: arr(domain == null ? void 0 : domain.hook_ids),
          cases: arr(domain == null ? void 0 : domain.recommended_oslo_cases).length ? arr(domain == null ? void 0 : domain.recommended_oslo_cases) : arr(domain == null ? void 0 : domain.recommended_cases),
          description: s(domain == null ? void 0 : domain.description) || s(domain == null ? void 0 : domain.definition),
          source: "domains_adapter",
          domain_id: originalDomainId || null
        };
      });
      return {
        ...source,
        modules: mappedModules,
        course_adapter: {
          source: "domains",
          generated_modules: mappedModules.length,
          reason: "pensum_has_domains_without_modules"
        }
      };
    }
    function computeEmneCoverageForModule(module, userConcepts, emnerAll, emneHits) {
      const moduleEmner = arr(module == null ? void 0 : module.emner).map(s).filter(Boolean);
      if (!moduleEmner.length) {
        return {
          moduleEmner,
          directHitCount: 0,
          coveredCount: 0,
          requiredCount: 0,
          percentAvg: 0,
          detail: []
        };
      }
      const emneObjs = arr(emnerAll).filter((e) => moduleEmner.includes(s(e == null ? void 0 : e.emne_id)));
      const threshold = Number.isFinite(module == null ? void 0 : module.pass_percent) ? module.pass_percent : 70;
      let detail = [];
      if (typeof window.computeEmneDekningV2 === "function") {
        detail = window.computeEmneDekningV2(userConcepts, emneObjs, { emneHits });
      } else if (typeof window.computeEmneDekning === "function") {
        detail = window.computeEmneDekning(userConcepts, emneObjs);
      } else {
        detail = emneObjs.map((e) => ({
          emne_id: s(e == null ? void 0 : e.emne_id),
          title: e == null ? void 0 : e.title,
          matchCount: 0,
          total: arr(e == null ? void 0 : e.core_concepts).length,
          percent: 0,
          missing: arr(e == null ? void 0 : e.core_concepts),
          directHit: !!(s(e == null ? void 0 : e.emne_id) && emneHits.has(s(e == null ? void 0 : e.emne_id)))
        }));
      }
      const requiredCount = moduleEmner.length;
      const directHitCount = detail.filter((x) => x.directHit).length;
      const coveredCount = detail.filter((x) => (Number(x.percent) || 0) >= threshold || x.directHit).length;
      const percentAvg = detail.length ? Math.round(detail.reduce((a, x) => a + (Number(x.percent) || 0), 0) / detail.length) : 0;
      return {
        moduleEmner,
        directHitCount,
        coveredCount,
        requiredCount,
        percentAvg,
        threshold,
        detail
      };
    }
    function computeConceptCoverageForModule(module, conceptCounts) {
      const required = arr(module == null ? void 0 : module.konsepter).map(s).filter(Boolean);
      if (!required.length) {
        return { required, hit: 0, requiredCount: 0, missing: [] };
      }
      let hit = 0;
      const missing = [];
      for (const k of required) {
        if (conceptCounts.has(k)) hit++;
        else missing.push(k);
      }
      const requiredCount = required.length;
      return { required, hit, requiredCount, missing };
    }
    function computeModuleStatus(module, subjectId, idx, emnerAll) {
      const moduleId = s(module == null ? void 0 : module.module_id);
      const title = s(module == null ? void 0 : module.title) || moduleId || "Modul";
      const minPerfectQuizzes = Number.isFinite(module == null ? void 0 : module.min_perfect_quizzes) ? module.min_perfect_quizzes : 1;
      const passPercent = Number.isFinite(module == null ? void 0 : module.pass_percent) ? module.pass_percent : 70;
      const byCat = idx.perfectByCat.get(s(subjectId)) || 0;
      const userConcepts = getUserConceptsFromIndex(idx.conceptCounts);
      const emneCoverage = computeEmneCoverageForModule(module, userConcepts, emnerAll, idx.emneHits);
      const conceptCoverage = computeConceptCoverageForModule(module, idx.conceptCounts);
      const conceptMinPct = Number.isFinite(module == null ? void 0 : module.concept_min_percent) ? module.concept_min_percent : 35;
      const conceptPct = conceptCoverage.requiredCount ? Math.round(conceptCoverage.hit / conceptCoverage.requiredCount * 100) : 0;
      const emnerOk = emneCoverage.requiredCount ? emneCoverage.coveredCount >= emneCoverage.requiredCount : true;
      const conceptsOk = conceptCoverage.requiredCount ? conceptPct >= conceptMinPct : true;
      const quizOk = byCat >= minPerfectQuizzes;
      const completed = !!(emnerOk && conceptsOk && quizOk);
      return {
        module_id: moduleId,
        title,
        level: Number((module == null ? void 0 : module.level) || 0),
        estimated_minutes: Number((module == null ? void 0 : module.estimated_minutes) || 0),
        rule: {
          passPercent,
          conceptMinPct,
          minPerfectQuizzes
        },
        stats: {
          perfectQuizzesInCategory: byCat,
          emner: emneCoverage,
          concepts: {
            ...conceptCoverage,
            percent: conceptPct
          }
        },
        completed
      };
    }
    function computeCourseProgress(pensum, subjectId, idx, emnerAll) {
      const modules = arr(pensum == null ? void 0 : pensum.modules);
      const statuses = modules.map((m) => computeModuleStatus(m, subjectId, idx, emnerAll));
      const done = statuses.filter((x) => x.completed).length;
      const total = statuses.length;
      const percent = total ? Math.round(done / total * 100) : 0;
      return { done, total, percent, modules: statuses };
    }
    function computeDiplomaStatus(courseProgress) {
      const ok = !!(courseProgress && courseProgress.total > 0 && courseProgress.done === courseProgress.total);
      return {
        eligible: ok,
        done: (courseProgress == null ? void 0 : courseProgress.done) || 0,
        total: (courseProgress == null ? void 0 : courseProgress.total) || 0,
        percent: (courseProgress == null ? void 0 : courseProgress.percent) || 0
      };
    }
    const HGCourses = {};
    HGCourses.loadPensum = loadPensum;
    HGCourses.compute = async function({ subjectId, emnerAll }) {
      const sid = s(subjectId);
      const pensumRaw = await loadPensum(sid);
      const pensum = normalizePensumForCourses(pensumRaw, sid);
      const log = getLearningLog();
      const idx = buildLearningIndex(log);
      const course = computeCourseProgress(pensum, sid, idx, arr(emnerAll));
      const diploma = computeDiplomaStatus(course);
      return {
        subjectId: sid,
        pensum,
        learning: {
          logCount: log.length,
          emneHitsCount: idx.emneHits.size,
          topConcepts: getUserConceptsFromIndex(idx.conceptCounts).slice(0, 15)
        },
        course,
        diploma
      };
    };
    window.HGCourses = HGCourses;
  })();
})();
//# sourceMappingURL=courses.js.map
