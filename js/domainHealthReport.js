// js/domainHealthReport.js
// ───────────────────────────────────────────────
// Domain Health Report
// Sjekker at alle domener i DomainRegistry har:
//  - emner/emner_<id>.json
//  - data/quiz/quiz_<id>.json (eller alias-fil som peker til samme canonical)
//  - merker/merke_<id>.html (eller alias-fil som peker til samme canonical)
//  - data/quiz/manifest.json finnes og kan parses (best effort)
//
// Ingen directory listing trengs: vi tester filer via fetch().
// ───────────────────────────────────────────────

(function () {
  async function exists(url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      // 200–299 = OK
      if (res.ok) return { ok: true, status: res.status };
      return { ok: false, status: res.status };
    } catch (e) {
      return { ok: false, status: 0, error: String(e) };
    }
  }

  function aliasesForCanonical(canonicalId) {
    const map = (window.DomainRegistry && DomainRegistry.aliasMap && DomainRegistry.aliasMap()) || {};
    return Object.keys(map).filter(a => map[a] === canonicalId);
  }

  async function checkKind(kind, canonicalId) {
    // Primær: canonical filnavn (strengt)
    const primary = DomainRegistry.file(kind, canonicalId);
    const p = await exists(primary);

    if (p.ok) {
      return {
        kind,
        canonicalId,
        status: "OK",
        file: primary,
        note: ""
      };
    }

    // Sekundær: se om et alias-filnavn finnes (f.eks quiz_populaerkultur.json)
    const aliasKeys = aliasesForCanonical(canonicalId);

    for (const a of aliasKeys) {
      const candidate =
        kind === "quiz"
          ? `data/quiz/quiz_${a}.json`
          : kind === "emner"
          ? `emner/emner_${a}.json`
          : kind === "merke"
          ? `merker/merke_${a}.html`
          : null;

      if (!candidate) continue;

      const c = await exists(candidate);
      if (c.ok) {
        return {
          kind,
          canonicalId,
          status: "ALIAS_FILE",
          file: candidate,
          note: `Filen bruker alias-navn (${a}) men canonical er (${canonicalId}). Anbefalt: gi filen canonical navn eller legg explicit override.`
        };
      }
    }

    return {
      kind,
      canonicalId,
      status: "MISSING",
      file: primary,
      note: `Mangler. Forventet: ${primary}`
    };
  }

  async function loadQuizManifest() {
    const url = "data/quiz/manifest.json";
    const r = await exists(url);
    if (!r.ok) {
      return { ok: false, url, status: r.status, parsed: null, note: "Fant ikke manifest.json" };
    }

    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      return { ok: true, url, status: res.status, parsed: json, note: "Manifest lastet" };
    } catch (e) {
      return { ok: false, url, status: 0, parsed: null, note: "Manifest finnes, men kunne ikke parses som JSON: " + String(e) };
    }
  }

  function summarizeRows(rows) {
    const count = (s) => rows.filter(r => r.status === s).length;
    return {
      OK: count("OK"),
      ALIAS_FILE: count("ALIAS_FILE"),
      MISSING: count("MISSING"),
      TOTAL: rows.length
    };
  }

  async function run({ toast = false } = {}) {
    if (!window.DomainRegistry) {
      const msg = "[DomainHealthReport] DomainRegistry mangler. Last domainRegistry.js før domainHealthReport.js";
      console.error(msg);
      if (toast && window.API?.showToast) API.showToast(msg);
      return null;
    }

    const domains = DomainRegistry.list();
    const rows = [];

    // manifest (best effort)
    const manifest = await loadQuizManifest();

    for (const id of domains) {
      rows.push(await checkKind("emner", id));
      rows.push(await checkKind("quiz", id));
      rows.push(await checkKind("merke", id));
    }

    const summary = summarizeRows(rows);

    // Pretty output
    console.groupCollapsed(
      `%cDomain Health Report`,
      "font-weight:bold"
    );
    console.log("Summary:", summary);
    console.log("Quiz manifest:", manifest);
    console.table(rows);
    console.groupEnd();

    // Optional toast (kort)
    if (toast && window.API?.showToast) {
      const msg = `Domene-sjekk: OK ${summary.OK}, alias ${summary.ALIAS_FILE}, mangler ${summary.MISSING}`;
      API.showToast(msg);
    }

    return { summary, rows, manifest };
  }

  // Eksponer globalt
  window.DomainHealthReport = { run };
})();
