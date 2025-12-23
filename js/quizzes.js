function runQuizFlow({ title, targetId, questions, onEnd }) {
  ensureQuizUI();

  const qs = {
    title: document.getElementById("quizTitle"),
    q: document.getElementById("quizQuestion"),
    choices: document.getElementById("quizChoices"),
    progress: document.getElementById("quizProgress"),
    feedback: document.getElementById("quizFeedback")
  };
  qs.title.textContent = title || "Quiz";

  let i = 0;
  let correct = 0;

  // --- META (LOCKED CONTRACT) ---
  const correctAnswers = [];   // [{question, answer}]
  const conceptsCorrect = [];  // string[]
  const emnerTouched = [];     // string[]

  function step() {
    const q = questions[i];

    const options = q.options || q.choices || [];
    const answerIndex =
      typeof q.answerIndex === "number"
        ? q.answerIndex
        : options.findIndex((o) => o === q.answer);

    qs.q.textContent = q.question || q.text || "";
    qs.choices.innerHTML = options
      .map((opt, idx) => `<button data-idx="${idx}">${opt}</button>`)
      .join("");

    qs.progress.textContent = `${i + 1}/${questions.length}`;
    qs.feedback.textContent = "";

    const bar = document.querySelector(".quiz-progress .bar");
    if (bar) bar.style.width = `${((i + 1) / questions.length) * 100}%`;

    qs.choices.querySelectorAll("button").forEach((btn) => {
      btn.onclick = () => {
        const chosenIdx = Number(btn.dataset.idx);
        const ok = chosenIdx
