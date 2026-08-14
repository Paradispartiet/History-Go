// Viser den omvendte Career Knowledge Bridge-koblingen på Fagverkets fagside.
(function (root) {
  "use strict";

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderCard(description) {
    const tasks = Array.isArray(description?.sections?.what_you_do)
      ? description.sections.what_you_do.slice(0, 3)
      : [];
    const topics = Array.isArray(description?.sections?.what_you_must_understand)
      ? description.sections.what_you_must_understand.slice(0, 4)
      : [];
    const badgeTitles = Array.isArray(description?.badge_titles) ? description.badge_titles : [];
    return `
      <article class="fagverk-career-card">
        <p class="fagverk-kicker">Arbeidsverden</p>
        <h4>${escapeHtml(description?.shared_work_world_title || description?.title)}</h4>
        <p>${escapeHtml(description?.summary)}</p>
        ${badgeTitles.length ? `<p class="fagverk-career-titles"><strong>Stillinger:</strong> ${badgeTitles.map(escapeHtml).join(", ")}</p>` : ""}
        ${tasks.length ? `<h5>Typiske oppgaver</h5><ul>${tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul>` : ""}
        ${topics.length ? `<h5>Kunnskap i bruk</h5><ul>${topics.map((topic) => `<li>${escapeHtml(topic.title)}</li>`).join("")}</ul>` : ""}
        <a class="fagverk-career-link" href="Civication.html">Utforsk karrieren i Civication</a>
      </article>`;
  }

  async function render() {
    const section = document.getElementById("fagverkCareerUses");
    const host = document.getElementById("fagverkCareerRoles");
    const bridge = root.CivicationCareerKnowledgeBridge;
    if (!section || !host || !bridge?.getRolesForKnowledge || !bridge?.buildJobDescription) return false;

    const subjectId = text(new URLSearchParams(root.location?.search || "").get("subject"));
    if (!subjectId) return false;
    try {
      const roles = await bridge.getRolesForKnowledge({ subject_id: subjectId });
      const descriptions = (await Promise.all(roles.map((role) => bridge.buildJobDescription(role)))).filter(Boolean);
      if (!descriptions.length) return false;
      host.innerHTML = descriptions.map(renderCard).join("");
      section.hidden = false;
      return true;
    } catch (error) {
      if (root.DEBUG) console.warn("[FagverkCareerUses] kunne ikke bygge jobbkoblingen", error);
      return false;
    }
  }

  root.HGFagverkCareerUses = { render, renderCard };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, { once: true });
  else void render();
})(typeof window !== "undefined" ? window : globalThis);
