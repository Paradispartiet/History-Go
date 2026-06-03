// Lim inn MapTiler browser-key her, ikke hele style-URL-en.
window.HG_MAPTILER_KEY = "Yi8j8sLhEo4NyPygVmbN";

// Detaljert kartstil: bruk MapTiler style-id her, f.eks. "streets-v4", "outdoor-v2" eller "basic-v2".
// Ikke legg API-key her.
// Ikke legg viewer-URL her.
window.HG_NATURTRO_STYLE_ID = "streets-v4";

// Kunst-settmanifest: merge data/quiz/manifest_kunst.json inn i hovedmanifestet
// før js/quizzes.js leser data/quiz/manifest.json.
(function () {
  "use strict";

  const originalFetch = window.fetch.bind(window);
  const MAIN_MANIFEST = "data/quiz/manifest.json";
  const KUNST_MANIFEST = "data/quiz/manifest_kunst.json";

  function isMainManifestUrl(input) {
    try {
      const raw = typeof input === "string" ? input : input?.url || "";
      const url = new URL(raw, document.baseURI);
      return url.pathname.endsWith("/" + MAIN_MANIFEST);
    } catch {
      return false;
    }
  }

  function uniqueSetKey(item) {
    return [item?.targetId || "", item?.set_id || "", item?.file || "", item?.order || ""].join("::");
  }

  window.fetch = async function hgFetchWithKunstManifest(input, init) {
    const response = await originalFetch(input, init);

    if (!isMainManifestUrl(input)) {
      return response;
    }

    try {
      const main = await response.clone().json();
      const kunstResponse = await originalFetch(KUNST_MANIFEST, { cache: "no-store" });
      if (!kunstResponse.ok) return response;

      const kunst = await kunstResponse.json();
      const files = Array.isArray(main.files) ? main.files.slice() : [];
      const sets = Array.isArray(main.sets) ? main.sets.slice() : [];

      const seen = new Set(sets.map(uniqueSetKey));
      for (const item of Array.isArray(kunst.sets) ? kunst.sets : []) {
        const key = uniqueSetKey(item);
        if (!seen.has(key)) {
          seen.add(key);
          sets.push(item);
        }
      }

      return new Response(JSON.stringify({ files, sets }), {
        status: response.status,
        statusText: response.statusText,
        headers: { "content-type": "application/json" }
      });
    } catch (e) {
      console.warn("[HG] kunst manifest merge failed", e);
      return response;
    }
  };
})();
