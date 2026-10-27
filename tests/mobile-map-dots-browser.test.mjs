import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chromium, webkit } from "playwright";
import http from "node:http";

// Run the actual browser bundle, not a VM approximation, through cold start
// with a zero-sized/hidden map and then a Detaljert style switch.
const bundle = readFileSync(new URL("../js/map.js", import.meta.url), "utf8");
const mapCss = readFileSync(new URL("../css/map.css", import.meta.url), "utf8");
const fixture = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%}#map{position:relative;width:100%;height:100%;background:#f3efe5;overflow:hidden}.maplibregl-marker{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}</style></head><body class="hg-app"><div id="map"></div><div class="map-controls"></div></body></html>';
const server = http.createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(fixture);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
let browser;
try {
  for (const engine of [chromium, webkit]) {
    browser = await engine.launch({ headless: true });
    // iPad Pro landscape can exceed the tablet-width breakpoint.
    for (const { width, touch } of [
      { width: 390, touch: true },
      { width: 820, touch: true },
      { width: 1024, touch: true },
      { width: 1194, touch: true },
      { width: 1366, touch: true },
      { width: 1440, touch: false }
    ]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, hasTouch: touch });
    await page.goto("http://127.0.0.1:" + address.port + "/");
    await page.addStyleTag({ content: mapCss });
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
    const usesNativeDots = width <= 1199 || touch;
    const first = await page.evaluate(() => {
      const el = document.querySelector(".hg-place-detail-marker");
      const rect = el?.getBoundingClientRect();
      const css = el ? getComputedStyle(el) : null;
      return {
        count: document.querySelectorAll(".hg-place-detail-marker").length,
        width: rect?.width, opacity: css?.opacity,
        outline: css?.borderTopColor,
        name: el?.querySelector(".hg-place-detail-label")?.textContent,
        nameDisplay: el?.querySelector(".hg-place-detail-label")?.style.display,
        nameColor: el?.querySelector(".hg-place-detail-label") ? getComputedStyle(el.querySelector(".hg-place-detail-label")).color : null,
        nameTextTransform: el?.querySelector(".hg-place-detail-label") ? getComputedStyle(el.querySelector(".hg-place-detail-label")).textTransform : null,
        nameShadow: el?.querySelector(".hg-place-detail-label") ? getComputedStyle(el.querySelector(".hg-place-detail-label")).textShadow : null,
        nameBackground: el?.querySelector(".hg-place-detail-label") ? getComputedStyle(el.querySelector(".hg-place-detail-label")).backgroundColor : null,
        namePadding: el?.querySelector(".hg-place-detail-label") ? getComputedStyle(el.querySelector(".hg-place-detail-label")).padding : null,
        markerCssPosition: css?.position,
        nameCssPosition: el?.querySelector(".hg-place-detail-label")
          ? getComputedStyle(el.querySelector(".hg-place-detail-label")).position : null,
        vector: !!window.__testMap.getLayer("hg-places-dots")
      };
    });
    assert.equal(first.count, usesNativeDots ? 1 : 0, "dot before style.load, width=" + width);
    if (usesNativeDots) {
      assert.ok(first.width >= 3 && first.width <= 7, "compact dot visible on phone and iPad at zoom 13");
      assert.equal(first.opacity, "1");
      assert.notEqual(first.outline, "rgb(255, 255, 255)", "contrasting outline");
      assert.equal(first.vector, false, "native renderer does not await vector style");
      assert.equal(first.name, "Torggata", "a visible place name must accompany native dots");
      assert.equal(first.nameDisplay, "block", "touch name is visible before style.load");
      assert.equal(first.nameColor, "rgb(0, 0, 0)", "phone and iPad names must render in actual black, not white");
      assert.equal(first.nameTextTransform, "uppercase", "phone and iPad must render place names in uppercase without changing their stored spelling");
      assert.equal(first.nameShadow, "none", "place name must not have the white halo that made text look white");
      assert.equal(first.nameBackground, "rgba(0, 0, 0, 0)", "touch labels must not have a visible background");
      assert.equal(first.namePadding, "0px", "touch labels must not have a padded box");
      assert.equal(first.nameCssPosition, "absolute", "label is anchored to marker without changing dot size");
      assert.equal(first.markerCssPosition, "absolute", "MapLibre must retain absolute coordinates");
    }
    await page.evaluate(() => {
      window.__originalDot = document.querySelector(".hg-place-detail-marker");
      window.__testMap.finishStyle();
    });
    const firstStyle = await page.evaluate(() => ({
      visibility: window.__testMap.getLayer("hg-places-dots")?.layout?.visibility,
      dotCount: document.querySelectorAll(".hg-place-detail-marker").length,
      vectorLabelVisibility: window.__testMap.getLayer("hg-places-label")?.layout?.visibility,
      detailTextTransform: window.__testMap.getLayer("hg-places-label")?.layout?.["text-transform"],
      areaTextTransform: window.__testMap.getLayer("hg-place-areas-label")?.layout?.["text-transform"]
    }));
    assert.equal(firstStyle.detailTextTransform, "uppercase", "detail vector labels must be uppercase on desktop");
    assert.equal(firstStyle.areaTextTransform, "uppercase", "area vector labels must be uppercase");
    assert.equal(firstStyle.visibility, usesNativeDots ? "none" : "visible");
    assert.equal(firstStyle.dotCount, usesNativeDots ? 1 : 0);
    assert.equal(firstStyle.vectorLabelVisibility, usesNativeDots ? "none" : "visible",
      "do not overlap native touch names with duplicate WebGL labels");
    if (usesNativeDots) {
      const zoomSizes = await page.evaluate(() => {
        const map = window.__testMap;
        const dot = document.querySelector(".hg-place-detail-marker");
        const widths = [];
        const nameDisplay = [];
        for (const zoom of [10, 12, 14, 16]) {
          map.zoom = zoom;
          map.emit("zoom");
          widths.push(Number(dot.style.width.replace("px", "")));
          nameDisplay.push(dot.querySelector(".hg-place-detail-label")?.style.display);
        }
        return { widths, nameDisplay, setCount: map.nativeMarkers.find(m =>
          m.element.classList.contains("hg-place-detail-marker")).setCount };
      });
      assert.ok(zoomSizes.widths.every((v, i, a) => i === 0 || v > a[i - 1]),
        "dots grow smoothly when zooming in on phone and iPad");
      assert.ok(zoomSizes.widths[0] < 5 && zoomSizes.widths.at(-1) <= 8.5,
        "dots shrink into smaller points when zoomed out");
      assert.equal(zoomSizes.setCount, 1, "zoom does not reposition or recreate markers");
      assert.deepEqual(zoomSizes.nameDisplay, ["none", "none", "block", "block"],
        "place names show only at detail zoom and return without marker recreation");

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
        visibility: window.__testMap.getLayer("hg-places-dots")?.layout?.visibility,
        label: document.querySelector(".hg-place-detail-label")?.textContent,
        labelVisible: document.querySelector(".hg-place-detail-label")?.style.display,
        labelColor: getComputedStyle(document.querySelector(".hg-place-detail-label")).color
      }));
      assert.deepEqual(after, {
        sameDot: true, count: 1, calls: 1, visibility: "none",
        label: "Torggata", labelVisible: "block", labelColor: "rgb(0, 0, 0)"
      },
        "style changes must not blink or duplicate dots at width=" + width);
    }
    await page.close();
    }
    await browser.close();
    browser = null;
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
