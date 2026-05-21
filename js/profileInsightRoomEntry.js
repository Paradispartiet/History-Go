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
    if (document.getElementById("btnOpenPsychologyRoom")) return;

    const actions = document.querySelector(".profile-hero-actions-v2");
    if (!actions) return;

    const button = document.createElement("button");
    button.id = "btnOpenPsychologyRoom";
    button.type = "button";
    button.className = "btn";
    button.textContent = "Psykologrommet";
    button.title = "Åpne screening, refleksjon og innsiktsprofil";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openRoom();
    });

    const ahaButton = document.getElementById("btnOpenAHA");
    if (ahaButton && ahaButton.parentElement === actions) {
      ahaButton.insertAdjacentElement("afterend", button);
    } else {
      actions.appendChild(button);
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
