(() => {
  // js/ui/collectionList.ts
  var win = window;
  function render() {
    const grid = document.getElementById("collectionGrid");
    if (!grid) return;
    const places = Array.isArray(win.PLACES) ? win.PLACES : [];
    const visited = win.visited || {};
    grid.innerHTML = "";
    for (const place of places.filter((entry) => visited[entry.id])) {
      const image = place.cardImage || place.image || "";
      const item = document.createElement("div");
      item.className = "collection-item";
      item.innerHTML = `
      <img src="${image}" alt="${place.name || ""}">
      <div>${place.name || ""}</div>
    `;
      item.addEventListener("click", () => {
        if (typeof win.openPlaceCard === "function") {
          win.openPlaceCard(place);
        }
      });
      grid.appendChild(item);
    }
  }
  var api = { render };
  win.HGCollectionList = api;
  win.renderCollection = render;
})();
