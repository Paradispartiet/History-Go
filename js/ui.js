// ============================================================
// === HISTORY GO – UI.JS (v3.0, overlays og toasts) ==========
// ============================================================
//
// Ansvar:
//  • Vise og skjule toasts, sheets og modaler
//  • Kontrollere overgangseffekter og brukeropplevelse
//  • Brukes av app.js, quiz.js og profile.js
//
// ============================================================

const ui = (() => {

  // ----------------------------------------------------------
  // 1) INITIERING
  // ----------------------------------------------------------
  function initUI() {
    console.log("🎨 UI-modul initialisert");
  }

  // ----------------------------------------------------------
  // 2) TOASTS (meldinger)
  // ----------------------------------------------------------
  function showToast(msg, ms = 2500) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = "0";
    toast.style.display = "block";

    // Fade-in
    toast.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "forwards" });

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      // Fade-out
      toast.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" })
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
    modal.querySelector("#modalTitle").textContent = title;
    modal.querySelector("#modalContent").innerHTML = contentHTML;
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    const modal = document.getElementById("modal");
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
  }

  // ----------------------------------------------------------
  // 5) VISUELLE HJELPEFUNKSJONER
  // ----------------------------------------------------------
  function fadeIn(el, duration = 250) {
    el.style.display = "block";
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration, fill: "forwards" });
  }

  function fadeOut(el, duration = 250) {
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
    fadeOut,
  };
})();

// Lukkeknapp for modal (X)
document.addEventListener("click", (e) => {
  if (e.target.id === "closeModal") ui.closeModal();
});
