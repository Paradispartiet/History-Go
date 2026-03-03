(function () {

  function markSeen(emne_id) {
    if (!emne_id) return;

    window.KnowledgeLearning?.setSeen?.(emne_id);

    window.dispatchEvent(new Event("learning:updated"));
  }

  function markUnderstood(emne_id) {
    if (!emne_id) return;

    window.KnowledgeLearning?.setUnderstood?.(emne_id);

    window.dispatchEvent(new Event("learning:updated"));
  }

  function markApplied(emne_id) {
    if (!emne_id) return;

    window.KnowledgeLearning?.setApplied?.(emne_id);

    window.dispatchEvent(new Event("learning:updated"));
  }

  window.HG_LearningEvents = {
    markSeen,
    markUnderstood,
    markApplied
  };

})();
