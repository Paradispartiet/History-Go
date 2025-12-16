async function loadAllQuizzes() {
  const files = [
    "quiz_by.json",
    "quiz_historie.json",
    "quiz_kunst.json",
    "quiz_litteratur.json",
    "quiz_musikk.json",
    "quiz_naeringsliv.json",
    "quiz_natur.json",
    "quiz_politikk.json",
    "quiz_populaerkultur.json",
    "quiz_sport.json",
    "quiz_subkultur.json",
    "quiz_vitenskap.json"
  ];

  let all = [];

  for (const file of files) {
    const res = await fetch(`data/${file}`);
    const json = await res.json();
    all = all.concat(json);
  }

  window.QUIZZES = all;
}

loadAllQuizzes();
