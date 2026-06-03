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

  function pathFromInput(input) {
    try {
      const raw = typeof input === "string" ? input : input?.url || "";
      return new URL(raw, document.baseURI).pathname;
    } catch {
      return "";
    }
  }

  function isMainManifestUrl(input) {
    return pathFromInput(input).endsWith("/" + MAIN_MANIFEST);
  }

  function isKunstSetUrl(input) {
    const path = pathFromInput(input);
    return path.includes("/data/quiz/kunst/") && path.endsWith("_sets.json");
  }

  function uniqueSetKey(item) {
    return [item?.targetId || "", item?.set_id || "", item?.file || "", item?.order || ""].join("::");
  }

  function makeKnowledge(q, targetId) {
    const placeName = String(targetId || "kunststedet").replace(/_/g, " ");
    const answer = Array.isArray(q?.options) ? q.options[q.answerIndex || 0] : q?.answer;
    if (q?.emne_id === "em_kunst_institusjoner_kanon") {
      return `${placeName} kan leses som kunstinstitusjon: stedet velger, rammer inn og gir kunst offentlig betydning.`;
    }
    if (q?.emne_id === "em_kunst_okonomi_og_finansiering") {
      return `${placeName} viser hvordan kunst også henger sammen med eierskap, finansiering og symbolsk verdi.`;
    }
    if (q?.emne_id === "em_kunst_publikum_klasse_og_kapital") {
      return `${placeName} viser hvordan publikum møter kunst gjennom rom, tilgang, språk og bykontekst.`;
    }
    if (q?.emne_id === "em_kunst_offentlig_kunst_monumenter") {
      return `${placeName} viser hvordan kunst kan virke i offentlig rom og få mening gjennom sted.`;
    }
    if (q?.emne_id === "em_kunst_distribusjon_og_plattformisering") {
      return `${placeName} viser hvordan kunst sirkulerer gjennom museer, byrom og visningsplattformer.`;
    }
    if (q?.emne_id === "em_kunst_arbeidsformer_og_prosess") {
      return `${placeName} gjør det mulig å se prosess, materiale og plassering som del av kunstverket.`;
    }
    return answer ? `Riktig svar er ${answer}.` : "Spørsmålet trener kunstbegreper, sted og observasjon.";
  }

  function normalizeKunstSetFile(data) {
    if (!data || !Array.isArray(data.sets)) return data;
    const targetId = data.targetId || "kunst";
    const sets = data.sets.map((setBlock, setIndex) => {
      const setId = setBlock?.set_id || `kunst_${targetId}_set_${setIndex + 1}`;
      const questions = Array.isArray(setBlock?.questions) ? setBlock.questions.map((q, questionIndex) => {
        const answerIndex = Number.isInteger(q?.answerIndex) ? q.answerIndex : 0;
        const options = Array.isArray(q?.options) ? q.options : [];
        return {
          ...q,
          id: q?.id || `${targetId}_quiz_${setIndex + 1}_${questionIndex + 1}`,
          quiz_id: q?.quiz_id || `${setId}_q${questionIndex + 1}`,
          categoryId: q?.categoryId || data.categoryId || "kunst",
          targetId: q?.targetId || targetId,
          answerIndex,
          answer: q?.answer || options[answerIndex] || options[0] || "",
          knowledge: q?.knowledge || makeKnowledge(q, targetId)
        };
      }) : [];
      return { ...setBlock, set_id: setId, order: setBlock?.order || (setIndex + 1), questions };
    });
    return { ...data, categoryId: data.categoryId || "kunst", sets };
  }

  window.fetch = async function hgFetchWithKunstManifest(input, init) {
    const response = await originalFetch(input, init);

    if (isKunstSetUrl(input)) {
      try {
        const data = await response.clone().json();
        const normalized = normalizeKunstSetFile(data);
        return new Response(JSON.stringify(normalized), {
          status: response.status,
          statusText: response.statusText,
          headers: { "content-type": "application/json" }
        });
      } catch (e) {
        console.warn("[HG] kunst set normalize failed", e);
        return response;
      }
    }

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
