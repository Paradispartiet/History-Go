(function () {
  function ensureArray(v) {
    return Array.isArray(v) ? v : [];
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function makeSummaryQuestion(story, entityLabel) {
    const distractors = [
      "En bybrann som la sentrum øde",
      "Et kongelig bryllup med folkemasser",
      "Åpningen av en ny jernbanestasjon",
      "Byggingen av et nytt rådhus"
    ];

    return {
      type: "story_summary",
      question: `Hva skjedde i historien om ${entityLabel}?`,
      story_excerpt: story.summary || story.story,
      options: shuffle([story.summary, ...distractors.slice(0, 3)]),
      answer: story.summary
    };
  }

  function makeYearQuestion(story) {
    if (!story.year || typeof story.year !== "number") return null;

    const year = story.year;
    return {
      type: "story_year",
      question: "Når skjedde denne hendelsen?",
      story_excerpt: story.summary,
      options: shuffle([year, year - 10, year + 5, year - 3]),
      answer: year
    };
  }

  function makePersonQuestion(story, peopleList) {
    if (!story.related_people?.length) return null;

    const correct = story.related_people[0];
    const others = shuffle(peopleList)
      .filter(person => person !== correct)
      .slice(0, 3);

    return {
      type: "story_person",
      question: "Hvem er knyttet til denne historien?",
      story_excerpt: story.summary,
      options: shuffle([correct, ...others]),
      answer: correct
    };
  }

  window.HGStoryQuizGenerator = {
    generateQuizFromStories(stories, entityLabel, peopleList = []) {
      const questions = [];

      for (const story of ensureArray(stories)) {
        questions.push(makeSummaryQuestion(story, entityLabel));

        const yearQuestion = makeYearQuestion(story);
        if (yearQuestion) questions.push(yearQuestion);

        const personQuestion = makePersonQuestion(story, peopleList);
        if (personQuestion) questions.push(personQuestion);
      }

      return shuffle(questions);
    }
  };
})();
