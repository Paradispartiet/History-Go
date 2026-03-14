(function () {
  function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function uniq(arr) {
    return [...new Set(arr.filter(Boolean))];
  }

  function makeEventQuestion(story) {
    const distractors = uniq([
      "En stor bybrann i sentrum",
      "En kongelig prosesjon gjennom byen",
      "En ny jernbanestasjon i vest",
      "En privat kunstauksjon"
    ]).filter(item => item !== story.summary);

    return {
      type: "story_event",
      story_id: story.id,
      question: `Hva handlet historien "${story.title}" om?`,
      correct: story.summary,
      options: shuffle([story.summary, ...distractors.slice(0, 3)])
    };
  }

  function makeYearQuestion(story) {
    if (!story.year || typeof story.year !== "number") return null;

    const year = story.year;
    const options = uniq([year, year - 5, year + 10, year - 20]);

    return {
      type: "story_year",
      story_id: story.id,
      question: `Når skjedde hendelsen "${story.title}"?`,
      correct: year,
      options: shuffle(options)
    };
  }

  function makeTypeQuestion(story) {
    const fallbackTypes = ["political", "conflict", "cultural", "turning_point", "strange"];
    const options = shuffle(uniq([story.type, ...fallbackTypes.filter(type => type !== story.type).slice(0, 3)]));

    return {
      type: "story_type",
      story_id: story.id,
      question: `Hva slags historie er "${story.title}"?`,
      correct: story.type,
      options
    };
  }

  function buildQuizFromStories(stories) {
    const quiz = [];

    stories.forEach(story => {
      quiz.push(makeEventQuestion(story));
      const yearQuestion = makeYearQuestion(story);
      if (yearQuestion) quiz.push(yearQuestion);
      quiz.push(makeTypeQuestion(story));
    });

    return shuffle(quiz);
  }

  window.HGStoryQuiz = {
    generateForPlace(placeId) {
      const stories = window.HGStories?.getByPlace(placeId) || [];
      return buildQuizFromStories(stories);
    },

    generateForPerson(personId) {
      const stories = window.HGStories?.getByPerson(personId) || [];
      return buildQuizFromStories(stories);
    }
  };
})();
