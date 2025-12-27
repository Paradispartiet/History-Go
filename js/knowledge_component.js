/* ======================================================================
   KNOWLEDGE COMPONENT
   Viser kunnskap fra knowledge.js på merkesider
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
    // ✅ Ny: branch-basert rendering hvis tilgjengelig
    if (typeof window.renderKnowledgeSectionAsync === "function") {
      container.innerHTML = `<div class="muted">Laster kunnskap…</div>`;
      const html = await window.renderKnowledgeSectionAsync(categoryId);
      container.innerHTML = html;
      return;
    }

    // Fallback: gammel rendering
    if (typeof renderKnowledgeSection === "function") {
      container.innerHTML = renderKnowledgeSection(categoryId);
      return;
    }

    container.innerHTML = `<div class="muted">Knowledge-systemet er ikke lastet.</div>`;
  } catch (e) {
    console.warn("[knowledge_component] render failed", e);
    container.innerHTML = `<div class="muted">Kunne ikke rendere knowledge.</div>`;
  }
});
