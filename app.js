function drawPlaceMarkers() {
  if (!MAP || !PLACES.length) return;

  // Bygg GeoJSON
  const fc = {
    type: "FeatureCollection",
    features: PLACES
      .filter(p => p && typeof p.lat === "number" && typeof p.lon === "number")
      .map(p => {
        const isVisited = !!visited[p.id];
        const base = catColor(p.category);
        const fill = isVisited ? lighten(base, 0.35) : base;
        const border = isVisited ? "#ffd700" : "#ffffff";

        return {
          type: "Feature",
          properties: {
            id: p.id,
            name: p.name || "",
            visited: isVisited ? 1 : 0,
            fill,
            border
          },
          geometry: {
            type: "Point",
            coordinates: [p.lon, p.lat]
          }
        };
      })
  };

  // Source
  if (MAP.getSource("places")) {
    MAP.getSource("places").setData(fc);
  } else {
    MAP.addSource("places", { type: "geojson", data: fc });

    // Glow (bak)
    MAP.addLayer({
      id: "places-glow",
      type: "circle",
      source: "places",
      paint: {
        "circle-radius": [
          "interpolate", ["linear"], ["zoom"],
          10, 1.0,
          12, 1.4,
          14, 2.6,
          16, 5.5,
          18, 10.0
        ],
        "circle-color": "rgba(255,255,255,0.20)",
        "circle-blur": 0.9
      }
    });

    // Prikkene (foran)
    MAP.addLayer({
      id: "places",
      type: "circle",
      source: "places",
      paint: {
        // ✅ bitte små på lav zoom, vokser med zoom (+ litt større hvis visited)
        "circle-radius": [
          "interpolate", ["linear"], ["zoom"],
          10, ["+", 1.0, ["*", 0.35, ["get", "visited"]]],
          12, ["+", 1.4, ["*", 0.45, ["get", "visited"]]],
          14, ["+", 2.6, ["*", 0.60, ["get", "visited"]]],
          16, ["+", 5.2, ["*", 0.85, ["get", "visited"]]],
          18, ["+", 9.0, ["*", 1.10, ["get", "visited"]]]
        ],
        "circle-color": ["get", "fill"],
        "circle-stroke-color": ["get", "border"],
        "circle-stroke-width": 1.6,
        "circle-opacity": 1
      }
    });

    // Hover tooltip (enkel)
    const tip = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10
    });

    MAP.on("mouseenter", "places", (e) => {
      MAP.getCanvas().style.cursor = "pointer";
      const f = e.features && e.features[0];
      if (!f) return;

      const name = f.properties.name || "";
      const v = String(f.properties.visited) === "1";
      tip
        .setLngLat(e.lngLat)
        .setHTML(v ? `✅ ${name}` : name)
        .addTo(MAP);
    });

    MAP.on("mouseleave", "places", () => {
      MAP.getCanvas().style.cursor = "";
      tip.remove();
    });

    // Click → åpne ditt eksisterende placeCard (samme som før)
    MAP.on("click", "places", (e) => {
      const f = e.features && e.features[0];
      if (!f) return;
      const id = f.properties.id;
      const p = PLACES.find(x => x.id === id);
      if (p) openPlaceCard(p);
    });
  }
}
