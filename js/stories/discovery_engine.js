(function () {
  function uniqBy(arr, keyFn) {
    const seen = new Set();
    return arr.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  window.HGDiscovery = {
    candidates: {
      people: [],
      places: [],
      stories: []
    },

    scanText(text, relatedPlace = null) {
      const names = text.match(/[A-ZÆØÅ][a-zæøå]+ [A-ZÆØÅ][a-zæøå]+/g) || [];
      const years = text.match(/\b(18|19|20)\d{2}\b/g) || [];

      names.forEach(name => {
        this.candidates.people.push({
          name,
          reason: "Oppdaget i tekst",
          source: "scanText",
          confidence: 0.5
        });
      });

      if (relatedPlace && years.length) {
        this.candidates.stories.push({
          title: `Historie ved ${relatedPlace}`,
          related_place: relatedPlace,
          confidence: 0.55
        });
      }

      this.candidates.people = uniqBy(this.candidates.people, item => item.name.toLowerCase());
      this.candidates.stories = uniqBy(this.candidates.stories, item => `${item.title}__${item.related_place}`);
    },

    addPlace(name, reason, confidence = 0.6) {
      this.candidates.places.push({
        name,
        reason,
        source: "manual_add",
        confidence
      });

      this.candidates.places = uniqBy(this.candidates.places, item => item.name.toLowerCase());
    },

    addStory(title, place, confidence = 0.6) {
      this.candidates.stories.push({
        title,
        related_place: place,
        confidence
      });

      this.candidates.stories = uniqBy(this.candidates.stories, item => `${item.title}__${item.related_place}`);
    },

    getCandidates() {
      return this.candidates;
    },

    reset() {
      this.candidates = {
        people: [],
        places: [],
        stories: []
      };
    }
  };
})();
