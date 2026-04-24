// js/ui/story-quiz-modal.js
// HGStoryQuiz — lett quiz-runner for fortellinger.
// Bruker HGStoryQuizGenerator til å lage spørsmål, viser dem én og én
// i en modal. Ikke koblet til QuizEngine/kategorier/poeng — dette er
// "test deg selv på det du nettopp leste".
//
// Bruk: window.openStoryQuiz(story, entityLabel?, peopleList?)

(function () {
  "use strict";

  const MODAL_ID = "storyQuizModal";

  function ensureModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "story-quiz-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";

    modal.innerHTML = `
      <div class="story-quiz-inner" role="dialog" aria-modal="true">
        <button class="story-quiz-close" type="button" aria-label="Lukk">✕</button>
        <div class="story-quiz-header">
          <div class="story-quiz-kicker">📖 Test deg selv</div>
          <div class="story-quiz-title"></div>
          <div class="story-quiz-progress"></div>
        </div>
        <div class="story-quiz-body"></div>
        <div class="story-quiz-footer"></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    modal.querySelector(".story-quiz-close").addEventListener("click", close);
    return modal;
  }

  function close() {
    const m = document.getElementById(MODAL_ID);
    if (!m) return;
    m.style.display = "none";
    m.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) { if (e.key === "Escape") close(); }

  function escHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function renderQuestion(modal, q, idx, total, onAnswer) {
    const body = modal.querySelector(".story-quiz-body");
    const progress = modal.querySelector(".story-quiz-progress");
    const footer = modal.querySelector(".story-quiz-footer");

    progress.textContent = `Spørsmål ${idx + 1} av ${total}`;
    footer.innerHTML = "";

    body.innerHTML = `
      <div class="story-quiz-question">${escHtml(q.question)}</div>
      ${q.story_excerpt ? `<div class="story-quiz-excerpt">${escHtml(q.story_excerpt)}</div>` : ""}
      <div class="story-quiz-options">
        ${q.options.map((opt, i) => `
          <button class="story-quiz-opt" type="button" data-i="${i}">${escHtml(opt)}</button>
        `).join("")}
      </div>
    `;

    body.querySelectorAll(".story-quiz-opt").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        if (body.dataset.locked === "1") return;
        body.dataset.locked = "1";

        const chosen = q.options[i];
        const correct = chosen === q.answer;

        body.querySelectorAll(".story-quiz-opt").forEach((b, bi) => {
          if (q.options[bi] === q.answer) b.classList.add("is-correct");
          if (bi === i && !correct) b.classList.add("is-wrong");
          b.disabled = true;
        });

        const nextBtn = document.createElement("button");
        nextBtn.className = "story-quiz-next";
        nextBtn.type = "button";
        nextBtn.textContent = (idx + 1 >= total) ? "Se resultat" : "Neste →";
        nextBtn.addEventListener("click", () => {
          body.dataset.locked = "";
          onAnswer(correct);
        });
        footer.appendChild(nextBtn);
      });
    });
  }

  function renderResult(modal, score, total, storyTitle) {
    const body = modal.querySelector(".story-quiz-body");
    const progress = modal.querySelector(".story-quiz-progress");
    const footer = modal.querySelector(".story-quiz-footer");

    progress.textContent = "Ferdig";
    const pct = Math.round((score / total) * 100);
    const tone = pct === 100 ? "🏆" : pct >= 60 ? "✨" : "📚";
    const msg = pct === 100 ? "Perfekt!" : pct >= 60 ? "Bra jobbet" : "God prøving — les én gang til";

    body.innerHTML = `
      <div class="story-quiz-result">
        <div class="story-quiz-result-icon">${tone}</div>
        <div class="story-quiz-result-score">${score} / ${total}</div>
        <div class="story-quiz-result-msg">${escHtml(msg)}</div>
        ${storyTitle ? `<div class="story-quiz-result-sub">— fra "${escHtml(storyTitle)}"</div>` : ""}
      </div>
    `;

    footer.innerHTML = "";
    const closeBtn = document.createElement("button");
    closeBtn.className = "story-quiz-next";
    closeBtn.type = "button";
    closeBtn.textContent = "Lukk";
    closeBtn.addEventListener("click", close);
    footer.appendChild(closeBtn);
  }

  function open(story, entityLabel, peopleList) {
    if (!story || !window.HGStoryQuizGenerator) return;

    const label = String(entityLabel || "denne fortellingen").trim();
    const stories = [story];
    let questions = window.HGStoryQuizGenerator.generateQuizFromStories(stories, label, peopleList || []);
    questions = (questions || []).filter(q => q && Array.isArray(q.options) && q.options.length >= 2);

    if (!questions.length) {
      try { window.showToast?.("Kan ikke lage quiz fra denne fortellingen ennå."); } catch {}
      return;
    }

    const modal = ensureModal();
    modal.querySelector(".story-quiz-title").textContent = story.title || "Fortelling";
    modal.style.display = "";
    modal.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", onKey);

    let idx = 0;
    let score = 0;

    function step() {
      if (idx >= questions.length) {
        renderResult(modal, score, questions.length, story.title);
        return;
      }
      renderQuestion(modal, questions[idx], idx, questions.length, (ok) => {
        if (ok) score++;
        idx++;
        step();
      });
    }
    step();
  }

  window.openStoryQuiz = open;
  window.closeStoryQuiz = close;
})();
