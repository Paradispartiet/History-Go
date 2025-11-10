// ============================================================
// === HISTORY GO – UI.JS (v3.1, stabil) ======================
// ============================================================
//
//  • Viser toasts, sheets og modaler
//  • Kontroll på fade-effekter, overganger og brukermeldinger
//  • Brukes av app.js, quiz.js og profile.js
// ============================================================

const ui = (() => {

  // ----------------------------------------------------------
  // 1) INITIERING
  // ----------------------------------------------------------
  function initUI() {
    console.log("🎨 UI-modul initialisert");
    // sørg for at toast starter skjult
    const toast = document.getElementById("toast");
    if (toast) toast.style.display = "none";
  }

  // ----------------------------------------------------------
  // 2) TOASTS (meldinger)
  // ----------------------------------------------------------
  function showToast(msg, ms = 2500) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = msg;
    toast.style.display = "block";
    toast.style.opacity = "0";

    // Fade inn
    toast.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: "forwards" });

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" })
        .onfinish = () => (toast.style.display = "none");
    }, ms);
  }

  // ----------------------------------------------------------
  // 3) SHEETS (bunnark)
  // ----------------------------------------------------------
  function openSheet(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("sheet-open");
    el.style.transform = "translateY(0)";
    el.style.opacity = "1";
  }

  function closeSheet(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" })
      .onfinish = () => {
        el.classList.remove("sheet-open");
        el.style.transform = "translateY(100%)";
      };
  }

  // ----------------------------------------------------------
  // 4) MODALER
  // ----------------------------------------------------------
  function openModal(title = "", contentHTML = "") {
    const modal = document.getElementById("modal");
    if (!modal) return;

    const titleEl = modal.querySelector("#modalTitle");
    const contentEl = modal.querySelector("#modalContent");
    if (titleEl) titleEl.textContent = title;
    if (contentEl) contentEl.innerHTML = contentHTML;

    modal.setAttribute("aria-hidden", "false");
    fadeIn(modal, 200);
  }

  function closeModal() {
    const modal = document.getElementById("modal");
    if (!modal) return;
    fadeOut(modal, 200);
    setTimeout(() => modal.setAttribute("aria-hidden", "true"), 220);
  }

  // ----------------------------------------------------------
  // 5) VISUELLE HJELPEFUNKSJONER
  // ----------------------------------------------------------
  function fadeIn(el, duration = 250) {
    if (!el) return;
    el.style.display = "block";
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration, fill: "forwards" });
  }

  function fadeOut(el, duration = 250) {
    if (!el) return;
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration, fill: "forwards" })
      .onfinish = () => (el.style.display = "none");
  }

  // ----------------------------------------------------------
  // 6) EKSPORT
  // ----------------------------------------------------------
  return {
    initUI,
    showToast,
    openSheet,
    closeSheet,
    openModal,
    closeModal,
    fadeIn,
    fadeOut
  };
})();

// ----------------------------------------------------------
// GLOBAL LYTTERE
// ----------------------------------------------------------

// Lukkeknapp for modal (X)
document.addEventListener("click", (e) => {
  if (e.target.id === "closeModal") ui.closeModal();
});

// Automatisk initiering
document.addEventListener("DOMContentLoaded", () => ui.initUI());
