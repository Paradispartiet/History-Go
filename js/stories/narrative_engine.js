(function () {
  const PATH = "/data/stories/narratives.json";

  window.HGNarratives = {
    ready: false,
    all: [],
    byPlace: {},
    byStory: {},

    async init() {
      if (this.ready) return this;

      const res = await fetch(PATH);
      if (!res.ok) {
        throw new Error(`Kunne ikke laste narratives.json: ${res.status}`);
      }

      const data = await res.json();
      this.all = data.narratives || [];
      this.buildIndex();
      this.ready = true;
      return this;
    },

    buildIndex() {
      this.byPlace = {};
      this.byStory = {};

      this.all.forEach(narrative => {
        (narrative.place_ids || []).forEach(placeId => {
          if (!this.byPlace[placeId]) this.byPlace[placeId] = [];
          this.byPlace[placeId].push(narrative);
        });

        (narrative.story_ids || []).forEach(storyId => {
          if (!this.byStory[storyId]) this.byStory[storyId] = [];
          this.byStory[storyId].push(narrative);
        });
      });
    },

    getByPlace(placeId) {
      return this.byPlace[placeId] || [];
    },

    getByStory(storyId) {
      return this.byStory[storyId] || [];
    }
  };
})();
