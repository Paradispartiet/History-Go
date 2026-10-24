import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import http from "node:http";

// Run the actual browser bundle, not a VM approximation, through cold start
// with a zero-sized/hidden map and then a Detaljert style switch.
const bundle = readFileSync(new URL("../js/map.js", import.meta.url), "utf8");
const fixture = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%}#map{position:relative;width:100%;height:100%;background:#f3efe5;overflow:hidden}.maplibregl-marker{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}</style></head><body><div id="map"></div><div class="map-controls"></div></body></html>';
const server = http.createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(fixture);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const width of [390, 691, 1024]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto("http://127.0.0.1:" + address.port + "/");
    await page.evaluate(() => {
      const container = document.getElementById("map");
      window.maplibregl = {
        NavigationControl: class {},
        Map: class {
          constructor() {
            this.layers = new Map();
            this.sources = new Map();
            this.handlers = new Map();
            this.styleReady = false;
            this.zoom = 13;
            this.nativeMarkers = [];
            this.container = container;
            window.__testMap = this;
          }
          on(type, callback) {
            if (typeof callback !== "function") return;
            const handlers = this.handlers.get(type) || [];
            handlers.push(callback);
            this.handlers.set(type, handlers);
          }
          off(type, callback) {
            this.handlers.set(type, (this.handlers.get(type) || []).filter(fn => fn !== callback));
          }
          emit(type) { for (const callback of this.handlers.get(type) || []) callback(); }
          resize() { this.wasResized = true; }
          getZoom() { return this.zoom; }
          getBounds() { return { contains: () => this.wasResized === true }; }
          getCenter() { return { lng: 10.75, lat: 59.91 }; }
          getCanvas() { return this.container; }
          getStyle() { return { layers: [] }; }
          isStyleLoaded() { return this.styleReady; }
          queryRenderedFeatures() { return []; }
          getLayer(id) { return this.layers.get(id) || null; }
          addLayer(obj) { this.layers.set(obj.id, obj); }
          removeLayer(id) { this.layers.delete(id); }
          getSource(id) { return this.sources.get(id) || null; }
          addSource(id, config) {
            this.sources.set(id, { ...config, setData(data) { this.data = data; } });
          }
          removeSource(id) { this.sources.delete(id); }
          moveLayer() {}
          addControl() {}
          setStyle(url) {
            this.lastStyle = url;
            this.styleReady = false;
            this.layers.clear();
            this.sources.clear();
          }
          finishStyle() {
            this.styleReady = true;
            this.emit("style.load");
            this.emit("load");
            this.emit("idle");
          }
        },
        Marker: class {
          constructor({ element }) {
            this.element = element;
            element.classList.add("maplibregl-marker");
            this.setCount = 0;
          }
          setLngLat(coords) { this.coords = coords; this.setCount++; return this; }
          addTo(map) {
            this.map = map;
            map.nativeMarkers.push(this);
            map.container.appendChild(this.element);
            return this;
          }
          remove() { this.element.remove(); }
        }
      };
      localStorage.clear();
      window.HG_MAPTILER_KEY = "test-only";
    });
    await page.addScriptTag({ content: bundle });
    await page.evaluate(() => {
      window.HGMap.initMap();
      window.HGMap.setPlaces([{
        id: "torggata", name: "Torggata", category: "by",
        lat: 59.917, lon: 10.7533, r: 180
      }]);
    });
    const isMobile = width <= 699;
    const first = await page.evaluate(() => {
      const el = document.querySelector(".hg-place-detail-marker");
      const rect = el?.getBoundingClientRect();
      const css = el ? getComputedStyle(el) : null;
      return {
        count: document.querySelectorAll(".hg-place-detail-marker").length,
        width: rect?.width, opacity: css?.opacity,
        outline: css?.borderTopColor,
        vector: !!window.__testMap.getLayer("hg-places-dots")
      };
    });
    assert.equal(first.count, isMobile ? 1 : 0, "dot before style.load, width=" + width);
    if (isMobile) {
      assert.ok(first.width >= 9, "dot visible even while map bounds are stale");
      assert.equal(first.opacity, "1");
      assert.notEqual(first.outline, "rgb(255, 255, 255)", "contrasting outline");
      assert.equal(first.vector, false, "native renderer does not await vector style");
    }
    await page.evaluate(() => {
      window.__originalDot = document.querySelector(".hg-place-detail-marker");
      window.__testMap.finishStyle();
    });
    const firstStyle = await page.evaluate(() => ({
      visibility: window.__testMap.getLayer("hg-places-dots")?.layout?.visibility,
      dotCount: document.querySelectorAll(".hg-place-detail-marker").length
    }));
    assert.equal(firstStyle.visibility, isMobile ? "none" : "visible");
    assert.equal(firstStyle.dotCount, isMobile ? 1 : 0);
    if (isMobile) {
      await page.evaluate(() => {
        window.HGMap.resize();
        window.HGMap.refreshMarkers();
        document.querySelector('.hg-map-style-btn[data-mode="satellite"]').click();
        if (!window.__testMap.lastStyle?.includes("maptiler.com")) {
          throw new Error("Detaljert click never requested a real style switch");
        }
        window.__testMap.finishStyle();
        window.HGMap.refreshMarkers();
      });
      const after = await page.evaluate(() => ({
        sameDot: document.querySelector(".hg-place-detail-marker") === window.__originalDot,
        count: document.querySelectorAll(".hg-place-detail-marker").length,
        calls: window.__testMap.nativeMarkers.find(m =>
          m.element.classList.contains("hg-place-detail-marker")).setCount,
        visibility: window.__testMap.getLayer("hg-places-dots")?.layout?.visibility
      }));
      assert.deepEqual(after, { sameDot: true, count: 1, calls: 1, visibility: "none" },
        "style changes must not blink or duplicate dots at width=" + width);
    }
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
