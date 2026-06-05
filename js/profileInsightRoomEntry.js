// js/profileInsightRoomEntry.js
// Flytter inngangen til Psykologrommet fra stedskortet til profilsiden.
(function () {
  function ensureCss() {
    if (document.getElementById("psychology-room-css")) return;
    const link = document.createElement("link");
    link.id = "psychology-room-css";
    link.rel = "stylesheet";
    link.href = "css/psychologyRoom.css";
    document.head.appendChild(link);
  }

  function loadRoomScript() {
    return new Promise((resolve, reject) => {
      if (window.PsychologyRoom?.open) {
        resolve();
        return;
      }

      const existing = document.getElementById("psychology-room-script");
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "psychology-room-script";
      script.src = "js/psychologyRoom.js";
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async function openRoom() {
    ensureCss();
    try {
      await loadRoomScript();
      window.PsychologyRoom?.open?.();
    } catch (error) {
      console.warn("[profileInsightRoomEntry]", error);
      window.showToast?.("Psykologrommet kunne ikke lastes");
    }
  }

  function addButton() {
    let button = document.getElementById("btnOpenPsychologyRoom");
    const tabs = document.querySelector('.profile-tabs[role="tablist"][aria-label="Profilfaner"]')
      || document.querySelector(".profile-tabs");
    if (!tabs) return;

    if (!button) {
      button = document.createElement("button");
      button.id = "btnOpenPsychologyRoom";
      button.type = "button";
      button.textContent = "R";
      button.setAttribute("aria-label", "Psykologrommet");
      button.title = "Åpne screening, refleksjon og innsiktsprofil";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openRoom();
      });
    }

    button.className = "btn profile-icon-button profile-room-button profile-tabs-room-button";
    if (button.parentElement !== tabs) {
      tabs.appendChild(button);
    }
  }

  function init() {
    addButton();
    window.addEventListener("updateProfile", addButton);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
