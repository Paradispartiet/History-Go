/* ======================================================================
   KNOWLEDGE COMPONENT
   Viser kunnskap fra knowledge.js på merkesider
   ====================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("knowledgeComponent");
  if (!container) return;

  // Finn kategori basert på body-klasse: merke-historie, merke-by, merke-sport...
  const body = document.body;
  const cls = [...body.classList].find(c => c.startsWith("merke-"));
  if (!cls) {
    container.innerHTML = `<div class="muted">Fant ikke kategori.</div>`;
    return;
  }

  const categoryId = cls.replace("merke-", ""); // merke-by → by

  // Hent render-funksjon fra knowledge.js
  if (typeof renderKnowledgeSection === "function") {
    const html = renderKnowledgeSection(categoryId);
    container.innerHTML = html;
  } else {
    container.innerHTML = `<div class="muted">Knowledge-systemet er ikke lastet.</div>`;
  }
});
