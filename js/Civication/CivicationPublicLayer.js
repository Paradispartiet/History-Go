(function(){

  const FEED_KEY = "civi_public_feed";

  function getFeed() {
    return JSON.parse(localStorage.getItem(FEED_KEY) || "[]");
  }

  function saveFeed(feed) {
    localStorage.setItem(FEED_KEY, JSON.stringify(feed));
  }

  function announceCollapse(event) {
    const feed = getFeed();

    feed.unshift({
      type: "collapse",
      collapseType: event.type,
      playerId: event.playerId,
      district: event.district,
      timestamp: event.timestamp
    });

    // Begrens størrelse
    if (feed.length > 50) feed.length = 50;

    saveFeed(feed);

    window.dispatchEvent(new Event("civiPublicUpdated"));
  }

  window.HG_CivicationPublic = {
    announceCollapse,
    getFeed
  };

})();
