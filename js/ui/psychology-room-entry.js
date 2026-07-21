(function () {
  function loadQuizKnowledgeMemoryLayer() {
    if (window.HGQuizKnowledgeMemory) return;
    if (document.getElementById("quiz-knowledge-memory-script")) return;

    const script = document.createElement("script");
    script.id = "quiz-knowledge-memory-script";
    script.src = "js/quizKnowledgeMemory.js";
    script.async = false;
    document.head.appendChild(script);
  }

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
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "psychology-room-script";
      script.src = "js/psychologyRoom.js";
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  function closeHeaderMenu() {
    const root = document.getElementById("headerMenu");
    const button = document.getElementById("headerMenuButton");
    const panel = document.getElementById("headerMenuPanel");

    root?.classList.remove("is-open");
    if (panel) panel.hidden = true;
    button?.setAttribute("aria-expanded", "false");
    button?.setAttribute("aria-label", "Åpne meny");
  }

  async function openRoom() {
    closeHeaderMenu();
    ensureCss();

    try {
      await loadRoomScript();
      window.PsychologyRoom?.open?.();
    } catch (error) {
      console.warn("[psychology-room-entry]", error);
      window.showToast?.("Psykologirommet kunne ikke lastes");
    }
  }

  function init() {
    loadQuizKnowledgeMemoryLayer();

    const button = document.getElementById("btnOpenPsychologyRoom");
    if (!button || button.dataset.hgPsychologyRoomBound === "1") return;

    button.dataset.hgPsychologyRoomBound = "1";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openRoom();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
