// ============================================================
// HISTORY GO – PROFILE NEXTUP
// Viser lagret NextUp-data på profile.html, ikke som global topplinje.
// ============================================================

(function () {
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[ch]));
  }

  function readNextUp() {
    let tri = {};

    try {
      tri = JSON.parse(localStorage.getItem("hg_nextup_tri") || "{}");
    } catch {
      tri = {};
    }

    return {
      tri: tri && typeof tri === "object" ? tri : {},
      because: String(localStorage.getItem("hg_nextup_because") || "").trim()
    };
  }

  function ensureSection() {
    let section = document.getElementById("profileNextUpSection");
    if (section) return section;

    const profileCard = document.getElementById("profileCard");
    if (!profileCard) return null;

    section = document.createElement("section");
    section.id = "profileNextUpSection";
    section.className = "profile-section profile-nextup";
    section.style.display = "none";
    section.innerHTML = `
      <div class="section-head">
        <h2>Neste steg</h2>
        <span class="section-meta">Anbefalt videre i History Go</span>
      </div>

      <div id="profileNextUp" class="profile-nextup-card"></div>
    `;

    profileCard.insertAdjacentElement("afterend", section);
    return section;
  }

  function placeById(id) {
    const key = String(id || "").trim();
    if (!key) return null;

    return (Array.isArray(window.PLACES) ? window.PLACES : [])
      .find(place => String(place?.id || "").trim() === key) || null;
  }

  function openPlace(id) {
    const place = placeById(id);

    if (place && typeof window.showPlacePopup === "function") {
      window.showPlacePopup(place);
      return;
    }

    if (place && typeof window.openPlaceCard === "function") {
      window.openPlaceCard(place);
      return;
    }

    if (typeof window.showToast === "function") {
      window.showToast("Fant ikke stedet");
    }
  }

  function renderProfileNextUp() {
    const section = ensureSection();
    const mount = document.getElementById("profileNextUp");
    if (!section || !mount) return;

    const { tri, because } = readNextUp();

    const spatial = tri.spatial || null;
    const wk = tri.wk || null;
    const narrative = tri.narrative || null;
    const concept = tri.concept || null;

    if (!spatial && !wk && !narrative && !concept && !because) {
      section.style.display = "none";
      mount.innerHTML = "";
      return;
    }

    section.style.display = "";

    mount.innerHTML = `
      ${spatial ? `
        <button class="profile-nextup-item" type="button" data-nextup-place="${esc(spatial.place_id)}">
          <span class="profile-nextup-icon">🧭</span>
          <span class="profile-nextup-copy">
            <strong>Neste sted</strong>
            <small>${esc(spatial.label)}</small>
          </span>
        </button>
      ` : ""}

      ${wk ? `
        <button class="profile-nextup-item" type="button" disabled title="${esc(wk.because || "")}">
          <span class="profile-nextup-icon">🗃️</span>
          <span class="profile-nextup-copy">
            <strong>Wonderkammer</strong>
            <small>${esc(wk.label)}</small>
          </span>
        </button>
      ` : ""}

      ${narrative ? `
        <button class="profile-nextup-item" type="button" data-nextup-place="${esc(narrative.next_place_id)}">
          <span class="profile-nextup-icon">📖</span>
          <span class="profile-nextup-copy">
            <strong>Neste scene</strong>
            <small>${esc(narrative.label)}</small>
          </span>
        </button>
      ` : ""}

      ${concept ? `
        <a class="profile-nextup-item" href="${concept.knowledge_href || `knowledge_by.html#${encodeURIComponent(concept.emne_id || "")}`}">
          <span class="profile-nextup-icon">🧠</span>
          <span class="profile-nextup-copy">
            <strong>Forstå</strong>
            <small>${esc(concept.label)}</small>
          </span>
        </a>
      ` : ""}

      ${because ? `
        <div class="profile-nextup-why">
          Fordi: ${esc(because)}
        </div>
      ` : ""}
    `;

    mount.querySelectorAll("[data-nextup-place]").forEach(btn => {
      btn.addEventListener("click", () => openPlace(btn.dataset.nextupPlace));
    });
  }

  function bootProfileNextUp() {
    renderProfileNextUp();
    window.setTimeout(renderProfileNextUp, 250);
    window.setTimeout(renderProfileNextUp, 900);
  }

  window.renderProfileNextUp = renderProfileNextUp;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootProfileNextUp);
  } else {
    bootProfileNextUp();
  }

  window.addEventListener("load", renderProfileNextUp);
  window.addEventListener("updateProfile", renderProfileNextUp);
})();
