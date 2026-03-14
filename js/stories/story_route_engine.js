(function () {
  function uniq(arr) {
    return [...new Set(arr.filter(Boolean))];
  }

  function routeScore(route) {
    return route.stories.length * 2 + route.places.length;
  }

  window.HGStoryRoutes = {
    async buildRoutesForPlace(placeId) {
      const stories = window.HGStories?.getByPlace(placeId) || [];
      const narratives = window.HGNarratives?.getByPlace(placeId) || [];

      const routes = [];

      for (const narrative of narratives) {
        const narrativeStories = (narrative.story_ids || [])
          .map(storyId => window.HGStories?.getById(storyId))
          .filter(Boolean);

        routes.push({
          id: narrative.id,
          title: narrative.title,
          places: uniq(narrative.place_ids || []),
          stories: narrativeStories.map(story => story.id),
          tags: narrative.tags || [],
          score: routeScore({
            places: narrative.place_ids || [],
            stories: narrativeStories
          })
        });
      }

      if (!routes.length && stories.length) {
        routes.push({
          id: `route_${placeId}`,
          title: `Historier rundt ${placeId}`,
          places: uniq([placeId, ...stories.flatMap(story => story.related_places || [])]),
          stories: stories.map(story => story.id),
          tags: uniq(stories.flatMap(story => story.tags || [])),
          score: routeScore({
            places: [placeId, ...stories.flatMap(story => story.related_places || [])],
            stories
          })
        });
      }

      return routes.sort((a, b) => b.score - a.score);
    }
  };
})();
