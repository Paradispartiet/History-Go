// js/quiz-audit.js — Quiz ID Audit (for History GO)
// Bruk: QuizAudit.run()
(function () {
  "use strict";

  async function fetchJson(url) {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.json();
  }

  function norm(x) {
    return String(x || "").trim();
  }

  async function run() {
    const manifestUrl = "data/quiz/manifest.json";

    let manifest;
    try {
      manifest = await fetchJson(manifestUrl);
    } catch (e) {
      console.error("[QuizAudit] manifest load failed", e);
      return { ok: false, step: "manifest", manifestUrl, error: String(e) };
    }

    const files = Array.isArray(manifest?.files) ? manifest.files : [];
    if (!files.length) {
      return { ok: false, step: "manifest.files", manifestUrl, manifest };
    }

    const loads = await Promise.all(
      files.map(async (f) => {
        try {
          const data = await fetchJson(f);
          return { file: f, ok: true, count: Array.isArray(data) ? data.length : 0, items: Array.isArray(data) ? data : [] };
        } catch (e) {
          return { file: f, ok: false, count: 0, items: [], error: String(e) };
        }
      })
    );

    const all = loads.flatMap((x) => x.items);
    const byFile = loads.map((x) => ({ file: x.file, ok: x.ok, count: x.count, error: x.error || null }));

    // TargetIds i quiz
    const quizTargets = new Set();
    const bad = [];
    for (const q of all) {
      const pid = norm(q?.personId);
      const plc = norm(q?.placeId);
      const key = pid || plc;
      if (!key) bad.push({ quizId: norm(q?.id), reason: "missing personId/placeId" });
      else quizTargets.add(key);
    }

    // PEOPLE/PLACES ids
    const people = Array.isArray(window.PEOPLE) ? window.PEOPLE : [];
    const places = Array.isArray(window.PLACES) ? window.PLACES : [];
    const peopleIds = new Set(people.map((p) => norm(p.id)).filter(Boolean));
    const placeIds = new Set(places.map((p) => norm(p.id)).filter(Boolean));

    const missingTargets = [];
    for (const tid of quizTargets) {
      if (!peopleIds.has(tid) && !placeIds.has(tid)) missingTargets.push(tid);
    }

    const summary = {
      manifestUrl,
      filesCount: files.length,
      quizCount: all.length,
      targetsInQuiz: quizTargets.size,
      peopleCount: people.length,
      placesCount: places.length,
      missingTargetsCount: missingTargets.length
    };

    console.log("[QuizAudit] summary", summary);
    console.log("[QuizAudit] byFile", byFile);
    console.log("[QuizAudit] missingTargets (first 80)", missingTargets.slice(0, 80));
    console.log("[QuizAudit] bad (first 40)", bad.slice(0, 40));

    return { ok: true, summary, byFile, missingTargets, bad };
  }

  window.QuizAudit = { run };
})();
