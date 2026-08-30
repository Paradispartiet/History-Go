(function (root) {
  "use strict";

  function sourceAnswerIndex(question, options) {
    if (Number.isInteger(question?.answerIndex)) return question.answerIndex;
    return options.findIndex((option) => option === question?.answer);
  }

  function shuffleQuestion(question, rng = Math.random) {
    const sourceOptions = Array.isArray(question?.options)
      ? question.options
      : (Array.isArray(question?.choices) ? question.choices : []);
    const originalOptions = sourceOptions.slice();
    const originalAnswerIndex = sourceAnswerIndex(question, originalOptions);

    if (originalAnswerIndex < 0 || originalAnswerIndex >= originalOptions.length) {
      return { options: originalOptions, answerIndex: originalAnswerIndex };
    }

    const entries = originalOptions.map((option, originalIndex) => ({ option, originalIndex }));
    for (let i = entries.length - 1; i > 0; i -= 1) {
      const raw = Number(rng());
      const bounded = Number.isFinite(raw)
        ? Math.min(Math.max(raw, 0), 0.9999999999999999)
        : 0;
      const j = Math.floor(bounded * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    return {
      options: entries.map((entry) => entry.option),
      answerIndex: entries.findIndex((entry) => entry.originalIndex === originalAnswerIndex)
    };
  }

  root.HGQuizAnswerShuffle = Object.freeze({ shuffleQuestion });
})(typeof window !== "undefined" ? window : globalThis);
