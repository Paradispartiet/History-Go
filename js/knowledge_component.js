/* ======================================================================
   KNOWLEDGE COMPONENT
   Viser kunnskap fra knowledge.js på merkesider
   (KURS + CHIPS + EMNER + KUNNSKAP)
   ====================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("knowledgeComponent");
  if (!container) return;

  const body = document.body;
  const cls = [...body.classList].find(c => c.startsWith("merke-"));
  if (!cls) {
    container.innerHTML = `<div class="muted">Fant ikke kategori.</div>`;
    return;
  }

  const categoryId = cls.replace("merke-", "");

  try {
    if (typeof renderKnowledgeSection !== "function") {
      container.innerHTML = `<div class="muted">Knowledge-systemet er ikke lastet.</div>`;
      return;
    }

    // 1) Render skeleton (kurs + chips + emner + kunnskap)
    container.innerHTML = renderKnowledgeSection(categoryId);

    // 2) Kurs (async fill)
    if (window.HGCourseUI && typeof window.HGCourseUI.init === "function") {
      try { await window.HGCourseUI.init(categoryId); } catch (e) { console.warn("[HGCourseUI.init]", e); }
    }

    // 3) Chips (async fill) — mount: #hgChipsMount
    const chipsMount = document.getElementById("hgChipsMount");
    if (chipsMount) {
      if (window.HGChips && typeof window.HGChips.init === "function") {
        try {
          await window.HGChips.init({
            categoryId,
            mountId: "hgChipsMount"
          });
        } catch (e) {
          console.warn("[HGChips.init]", e);
          chipsMount.innerHTML = `<div class="muted">Kunne ikke laste chips.</div>`;
        }
      } else {
        chipsMount.innerHTML = `<div class="muted">Chips-modul ikke lastet.</div>`;
      }
    }

    // 4) Emner (async fill) — mount: #hgEmnerMount
const emnerMount = document.getElementById("hgEmnerMount");
if (emnerMount) {
  try {
    // ✅ RIKTIG: din loader eksponerer loadForSubject()
    if (!window.Emner || typeof window.Emner.loadForSubject !== "function") {
      emnerMount.innerHTML = `<div class="muted">Emner-loader er ikke lastet.</div>`;
      return;
    }

    // Hent emner for faget (categoryId = subject_id)
    const emner = await window.Emner.loadForSubject(categoryId);

    if (!Array.isArray(emner) || !emner.length) {
      emnerMount.innerHTML = `<div class="muted">Ingen emner registrert ennå.</div>`;
      return;
    }

    // (valgfritt) dekning/progresjon hvis du har computeEmneDekning
    let coverage = null;
    if (typeof window.computeEmneDekning === "function") {
      try {
        coverage = window.computeEmneDekning(categoryId);
      } catch (e) {
        console.warn("[computeEmneDekning]", e);
        coverage = null;
      }
    }

    // Gruppér på temaområde (area_id/area_label) hvis de finnes
    const groups = new Map();
    for (const e of emner) {
      const areaId = String(e?.area_id || "").trim() || "tema";
      const areaLabel = String(e?.area_label || "").trim() || "Temaområder";
      const key = areaId + "||" + areaLabel;
      if (!groups.has(key)) groups.set(key, { areaId, areaLabel, items: [] });
      groups.get(key).items.push(e);
    }

    const groupList = [...groups.values()].sort((a, b) =>
      a.areaLabel.localeCompare(b.areaLabel, "no")
    );

    groupList.forEach(g => {
      g.items.sort((a, b) => {
        const ta = String(a?.title || a?.name || a?.emne_id || "");
        const tb = String(b?.title || b?.name || b?.emne_id || "");
        return ta.localeCompare(tb, "no");
      });
    });

    // Render: temaområde -> emner (accordion)
    emnerMount.innerHTML = `
      <div class="hg-emner">
        ${groupList
          .map(g => `
            <details class="hg-area" data-area="${escapeHtml(g.areaId)}">
              <summary>
                <span class="hg-area-title">${escapeHtml(g.areaLabel)}</span>
                <span class="hg-area-count">${g.items.length}</span>
              </summary>

              <div class="hg-area-items">
                ${g.items
                  .map(emne => {
                    const emneId = String(emne?.emne_id || emne?.id || "").trim();
                    const title = emne?.title || emne?.name || emneId || "Uten tittel";
                    const short = emne?.short_label || emne?.short || "";
                    const desc = emne?.description || "";

                    // pill fra dekning (hvis den finnes)
                    let pill = "";
                    if (coverage && emneId && coverage[emneId]) {
                      const c = coverage[emneId];
                      const pct = (c.pct != null)
                        ? `${Math.round(c.pct)}%`
                        : (c.score != null ? String(c.score) : "");
                      if (pct) pill = `<span class="hg-pill">${escapeHtml(pct)}</span>`;
                    }

                    // core_concepts som “chips”
                    const concepts = Array.isArray(emne?.core_concepts) ? emne.core_concepts : [];
                    const chipsHtml = concepts.length
                      ? `<div class="hg-chips-row">
                           ${concepts.slice(0, 10).map(c => `<span class="hg-chip">${escapeHtml(c)}</span>`).join("")}
                         </div>`
                      : ``;

                    return `
                      <details class="hg-emne" data-emne="${escapeHtml(emneId)}">
                        <summary>
                          <span class="hg-emne-title">${escapeHtml(title)}</span>
                          ${short ? `<span class="hg-emne-short">${escapeHtml(short)}</span>` : ``}
                          ${pill}
                        </summary>

                        ${desc ? `<div class="hg-emne-desc">${escapeHtml(desc)}</div>` : ``}
                        ${chipsHtml}

                        <div class="hg-emne-actions">
                          ${emneId ? `<button type="button" class="hg-btn" data-emne-open="${escapeHtml(emneId)}">Åpne</button>` : ``}
                          ${emneId ? `<button type="button" class="hg-btn primary" data-emne-quiz="${escapeHtml(emneId)}">Ta quiz</button>` : ``}
                        </div>
                      </details>
                    `;
                  })
                  .join("")}
              </div>
            </details>
          `)
          .join("")}
      </div>
    `;

    // Wire "Åpne"
    emnerMount.querySelectorAll("[data-emne-open]").forEach(btn => {
      btn.addEventListener("click", () => {
        const emneId = btn.getAttribute("data-emne-open");
        if (typeof window.openEmne === "function") return window.openEmne(emneId, categoryId);
        window.showToast?.(`Emne: ${emneId}`);
      });
    });

    // Wire "Ta quiz" (emne-quiz hvis du har det)
    emnerMount.querySelectorAll("[data-emne-quiz]").forEach(btn => {
      btn.addEventListener("click", () => {
        const emneId = btn.getAttribute("data-emne-quiz");

        if (window.QuizEngine) {
          if (typeof window.QuizEngine.startEmne === "function") {
            return window.QuizEngine.startEmne(emneId, categoryId);
          }
        }

        window.showToast?.("Quiz for emne er ikke koblet ennå.");
      });
    });

  } catch (e) {
    console.warn("[emner fill]", e);
    emnerMount.innerHTML = `<div class="muted">Kunne ikke laste emner.</div>`;
  }
}

// Minimal HTML-escape for descriptions
function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
