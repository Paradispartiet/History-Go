// hgConceptIndex.js
window.HGConceptIndex = (function () {

  const map = new Map(); // key -> conceptNode

  function ensureConcept(key) {
    const norm = key.toLowerCase().trim();
    if (!norm) return null;
    let c = map.get(norm);
    if (!c) {
      c = {
        key: norm,
        fields: new Set(),
        emner: new Set(),
        persons: new Set(),
        places: new Set(),
        knowledgeIds: new Set(),
        quizIds: new Set(),
        dimensions: new Set(),
        analysis_axes: new Set()
      };
      map.set(norm, c);
    }
    return c;
  }

  function addFromFieldProfile(fieldId, profile) {
    (profile.coreConcepts || []).forEach(k => {
      const c = ensureConcept(k);
      if (!c) return;
      c.fields.add(fieldId);
    });
  }

  function addFromEmne(emne) {
    (emne.core_concepts || []).forEach(k => {
      const c = ensureConcept(k);
      if (!c) return;
      c.emner.add(emne.emne_id);
      (emne.dimensions || []).forEach(d => c.dimensions.add(d));
      (emne.analysis_axes || []).forEach(a => c.analysis_axes.add(a));
    });
  }

  function addFromKnowledge(kp) {
    (kp.concepts || []).forEach(k => {
      const c = ensureConcept(k);
      if (!c) return;
      c.knowledgeIds.add(kp.id);
      if (kp.merkeId) c.fields.add(kp.merkeId);
      if (kp.emneId) c.emner.add(kp.emneId);
      if (kp.personId) c.persons.add(kp.personId);
      if (kp.placeId) c.places.add(kp.placeId);
    });
  }

  function addFromQuiz(q) {
    (q.core_concepts || []).forEach(k => {
      const c = ensureConcept(k);
      if (!c) return;
      c.quizIds.add(q.id);
      if (q.categoryId) c.fields.add(q.categoryId);
      if (q.emneId) c.emner.add(q.emneId);
      if (q.personId) c.persons.add(q.personId);
      if (q.placeId) c.places.add(q.placeId);
    });
  }

  // Kalles etter at universet er lastet
  function buildIndex({ fieldProfiles, emner, knowledgePieces, quizzes }) {
    map.clear();
    Object.entries(fieldProfiles || {}).forEach(([id, prof]) =>
      addFromFieldProfile(id, prof)
    );
    (emner || []).forEach(addFromEmne);
    (knowledgePieces || []).forEach(addFromKnowledge);
    (quizzes || []).forEach(addFromQuiz);
  }

  function getConcept(key) {
    const norm = key.toLowerCase().trim();
    const c = map.get(norm);
    if (!c) return null;

    // returner med arrays, ikke Sets
    return {
      key: c.key,
      fields: Array.from(c.fields),
      emner: Array.from(c.emner),
      persons: Array.from(c.persons),
      places: Array.from(c.places),
      knowledgeIds: Array.from(c.knowledgeIds),
      quizIds: Array.from(c.quizIds),
      dimensions: Array.from(c.dimensions),
      analysis_axes: Array.from(c.analysis_axes)
    };
  }

  function listAllConcepts() {
    return Array.from(map.values()).map(c => getConcept(c.key));
  }

  return {
    buildIndex,
    getConcept,
    listAllConcepts
  };
})();
