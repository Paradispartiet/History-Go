(function () {
  const QUIZ_MANIFEST_PATH = "/data/quiz/manifest.json";
  const QUIZ_MANIFEST_ADDITIONS_PATH = "data/quiz/manifest_additions.json";

  function installQuizManifestAdditions() {
    if (window.__HG_QUIZ_MANIFEST_ADDITIONS_INSTALLED__) return;
    if (typeof window.fetch !== "function") return;

    const originalFetch = window.fetch.bind(window);
    let additionsPromise = null;

    function requestUrl(input) {
      try {
        const raw = typeof input === "string" ? input : input?.url;
        return raw ? new URL(raw, document.baseURI) : null;
      } catch {
        return null;
      }
    }

    function isQuizManifestRequest(input) {
      const url = requestUrl(input);
      return !!url && url.pathname.endsWith(QUIZ_MANIFEST_PATH);
    }

    function loadAdditions() {
      if (!additionsPromise) {
        const url = new URL(QUIZ_MANIFEST_ADDITIONS_PATH, document.baseURI).toString();
        additionsPromise = originalFetch(url, { cache: "no-store" })
          .then((response) => {
            if (!response.ok) throw new Error(`${response.status} ${url}`);
            return response.json();
          })
          .catch((error) => {
            if (window.DEBUG) console.warn("[quiz-manifest-additions] load failed", error);
            return { files: [], sets: [] };
          });
      }
      return additionsPromise;
    }

    function mergeManifest(manifest, additions) {
      const files = Array.isArray(manifest?.files) ? manifest.files.slice() : [];
      const sets = Array.isArray(manifest?.sets) ? manifest.sets.slice() : [];

      for (const file of Array.isArray(additions?.files) ? additions.files : []) {
        if (typeof file === "string" && file.trim() && !files.includes(file)) files.push(file);
      }

      const seen = new Set(sets.map((entry) => [
        String(entry?.targetId || "").trim(),
        String(entry?.file || "").trim(),
        String(entry?.set_id || "").trim()
      ].join("::")));

      for (const entry of Array.isArray(additions?.sets) ? additions.sets : []) {
        const targetId = String(entry?.targetId || "").trim();
        const file = String(entry?.file || "").trim();
        const setId = String(entry?.set_id || "").trim();
        if (!targetId || !file) continue;

        const key = [targetId, file, setId].join("::");
        if (seen.has(key)) continue;
        seen.add(key);
        sets.push({ ...entry, targetId, file });
      }

      return { ...(manifest || {}), files, sets };
    }

    window.fetch = async function fetchWithQuizManifestAdditions(input, init) {
      const response = await originalFetch(input, init);
      if (!response.ok || !isQuizManifestRequest(input)) return response;

      try {
        const [manifest, additions] = await Promise.all([
          response.clone().json(),
          loadAdditions()
        ]);
        const merged = mergeManifest(manifest, additions);
        const headers = new Headers(response.headers);
        headers.delete("content-length");
        headers.delete("content-encoding");
        headers.delete("etag");
        headers.set("content-type", "application/json; charset=utf-8");
        return new Response(JSON.stringify(merged), {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      } catch (error) {
        if (window.DEBUG) console.warn("[quiz-manifest-additions] merge failed", error);
        return response;
      }
    };

    window.HGQuizManifestAdditions = { mergeManifest, loadAdditions };
    window.__HG_QUIZ_MANIFEST_ADDITIONS_INSTALLED__ = true;
  }

  installQuizManifestAdditions();

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
