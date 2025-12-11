// emnerLoader.js
// Felles, enkel loader for emne-filer (History Go / AHA)

window.Emner = (function () {
  // Kart over alle emne-filer per fagfelt / merke-id
  const EMNER_INDEX = {
    historie:       "/emner/emner_historie.json",
    by:             "/emner/emner_by.json",
    kunst:          "/emner/emner_kunst.json",
    musikk:         "/emner/emner_musikk.json",
    natur:          "/emner/emner_natur.json",
    vitenskap:      "/emner/emner_vitenskap.json",
    litteratur:     "/emner/emner_litteratur.json",
    populaerkultur: "/emner/emner_populaerkultur.json",
    naeringsliv:    "/emner/emner_naeringsliv.json",
    sport:          "/emner/emner_sport.json",
    politikk:       "/emner/emner_politikk.json",
    subkultur:      "/emner/emner_subkultur.json",
    psykologi:      "/emner/emner_psykologi.json"
  };

  // Enkelt-cache så vi slipper å hente samme fil flere ganger
  const cache = {};

  async function loadForSubject(subjectId) {
    const url = EMNER_INDEX[subjectId];
    if (!url) {
      console.warn("Ingen emne-fil definert for subjectId:", subjectId);
      return [];
    }

    // Returner fra cache hvis vi allerede har lastet
    if (cache[subjectId]) {
      return cache[subjectId];
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn("Kunne ikke laste emner for", subjectId, res.status);
        return [];
      }
      const data = await res.json();
      cache[subjectId] = data;
      return data;
    } catch (e) {
      console.warn("Feil ved lasting av emner for", subjectId, e);
      return [];
    }
  }

  // Hent flere fagfelt i en smell (returnerer { subjectId: [emner...] })
  async function loadForSubjects(subjectIds = []) {
    const result = {};
    for (const id of subjectIds) {
      result[id] = await loadForSubject(id);
    }
    return result;
  }

  // Liste over alle støttede subjectId-er
  function listSubjects() {
    return Object.keys(EMNER_INDEX);
  }

  return {
    loadForSubject,
    loadForSubjects,
    listSubjects
  };
})();
