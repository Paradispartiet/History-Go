// ============================================================
// === HISTORY GO – UI.JS (v3.4, stabil og komplett) ==========
// ============================================================
//
//  • Viser og skjuler toasts, sheets og modaler
//  • Har myke overganger og bakgrunnsslør
//  • Brukes av app.js, quiz.js og profile.js
//
// ============================================================

const ui = (() => {

  // ----------------------------------------------------------
  // 1) INITIERING
  // ----------------------------------------------------------
  function initUI() {
    console.log("🎨 UI-modul initialisert");
    const toast = document.getElementById("toast");
    if (toast) toast.style.display = "none"; // start skjult
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

    toast.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      fill: "forwards",
      easing: "ease-out"
    });

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 400,
        fill: "forwards",
        easing: "ease-in"
      }).onfinish = () => (toast.style.display = "none");
    }, ms);
  }

  // ----------------------------------------------------------
  // 3) SHEETS (bunnark)
  // ----------------------------------------------------------
  function openSheet(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.add("sheet-open");
    el.animate(
      [
        { transform: "translateY(100%)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 }
      ],
      { duration: 250, fill: "forwards", easing: "ease-out" }
    );

    // Varsle om åpning (for backdrop)
    document.dispatchEvent(new Event("sheetOpened"));
  }

  function closeSheet(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: "translateY(100%)", opacity: 0 }
      ],
      { duration: 200, fill: "forwards", easing: "ease-in" }
    ).onfinish = () => {
      el.classList.remove("sheet-open");
      document.dispatchEvent(new Event("sheetClosed"));
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
    fadeIn(modal, 180);
  }

  function closeModal() {
    const modal = document.getElementById("modal");
    if (!modal) return;
    fadeOut(modal, 180);
    setTimeout(() => modal.setAttribute("aria-hidden", "true"), 200);
  }

  // ----------------------------------------------------------
  // 5) VISUELLE HJELPEFUNKSJONER
  // ----------------------------------------------------------
  function fadeIn(el, duration = 250) {
    if (!el) return;
    el.style.display = "block";
    el.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration,
      fill: "forwards",
      easing: "ease-out"
    });
  }

  function fadeOut(el, duration = 250) {
    if (!el) return;
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration,
      fill: "forwards",
      easing: "ease-in"
    }).onfinish = () => (el.style.display = "none");
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
// GLOBALT: Lukking og initiering
// ----------------------------------------------------------
document.addEventListener("click", (e) => {
  if (e.target.id === "closeModal") ui.closeModal();
});
document.addEventListener("DOMContentLoaded", () => ui.initUI());

// ----------------------------------------------------------
// 7) BAKGRUNNSSLØR FOR SHEETS
// ----------------------------------------------------------
(function setupBackdropControl() {
  if (!document.getElementById("backdrop")) {
    const b = document.createElement("div");
    b.id = "backdrop";
    b.className = "backdrop";
    document.body.appendChild(b);
  }

  const backdrop = document.getElementById("backdrop");

  document.addEventListener("sheetOpened", () => {
    backdrop.classList.add("active");
  });

  document.addEventListener("sheetClosed", () => {
    backdrop.classList.remove("active");
  });

  backdrop.addEventListener("click", () => {
    backdrop.classList.remove("active");
    document.querySelectorAll(".sheet.sheet-open").forEach(el => {
      el.classList.remove("sheet-open");
      el.style.transform = "translateY(100%)";
    });
  });
})();
