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
        // Emner må være lastet/tilgjengelig via EmnerLoader.js
        if (!window.Emner || typeof window.Emner.getBySubject !== "function") {
          emnerMount.innerHTML = `<div class="muted">Emner er ikke lastet.</div>`;
          return;
        }

        // Hent emner for faget (categoryId brukes som subject_id i ditt system)
        const emner = window.Emner.getBySubject(categoryId) || [];

        if (!emner.length) {
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

        // Bygg enkel, spillbar accordion-liste
        emnerMount.innerHTML = `
          <div class="hg-emner">
            ${emner.map(emne => {
              const emneId = String(emne.emne_id || emne.id || "").trim();
              const title = emne.title || emne.name || emneId || "Uten tittel";
              const short = emne.short_label || emne.short || "";
              const desc  = emne.description || "";

              // dekning: hvis computeEmneDekning returnerer map { emne_id: {score/...} } eller lignende
              let pill = "";
              if (coverage && emneId && coverage[emneId]) {
                const c = coverage[emneId];
                const pct = (c.pct != null) ? `${Math.round(c.pct)}%` : (c.score != null ? String(c.score) : "");
                if (pct) pill = `<span class="hg-pill">${pct}</span>`;
              }

              return `
                <details class="hg-emne" data-emne="${emneId}">
                  <summary>
                    <span class="hg-emne-title">${title}</span>
                    ${short ? `<span class="hg-emne-short">${short}</span>` : ``}
                    ${pill}
                  </summary>

                  ${desc ? `<div class="hg-emne-desc">${escapeHtml(desc)}</div>` : ``}

                  <div class="hg-emne-actions">
                    ${emneId ? `<button type="button" class="hg-btn" data-emne-open="${emneId}">Åpne</button>` : ``}
                    ${emneId ? `<button type="button" class="hg-btn primary" data-emne-quiz="${emneId}">Ta quiz</button>` : ``}
                  </div>
                </details>
              `;
            }).join("")}
          </div>
        `;

        // Wire knapper (åpne/quiz) uten å tvinge ny struktur
        emnerMount.querySelectorAll("[data-emne-open]").forEach(btn => {
          btn.addEventListener("click", () => {
            const emneId = btn.getAttribute("data-emne-open");
            // hvis du har en emneside / modal, bruk den, ellers bare toast
            if (typeof window.openEmne === "function") return window.openEmne(emneId);
            window.showToast?.(`Emne: ${emneId}`);
          });
        });

        emnerMount.querySelectorAll("[data-emne-quiz]").forEach(btn => {
          btn.addEventListener("click", () => {
            const emneId = btn.getAttribute("data-emne-quiz");
            // hvis du har emne->quiz mapping: bruk den. Hvis ikke, la dette være en tydelig fallback.
            if (window.QuizEngine && typeof window.QuizEngine.start === "function") {
              // NB: start forventer ofte placeId/personId – hvis du har emne-quiz senere, bytt til QuizEngine.startEmne(emneId)
              if (typeof window.QuizEngine.startEmne === "function") return window.QuizEngine.startEmne(emneId);
            }
            window.showToast?.("Quiz for emne er ikke koblet ennå.");
          });
        });

      } catch (e) {
        console.warn("[emner fill]", e);
        emnerMount.innerHTML = `<div class="muted">Kunne ikke laste emner.</div>`;
      }
    }

  } catch (e) {
    console.warn("[knowledge_component] render failed", e);
    container.innerHTML = `<div class="muted">Kunne ikke rendere knowledge.</div>`;
  }
});

// Minimal HTML-escape for descriptions
function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
