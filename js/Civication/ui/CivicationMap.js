// CivicationMap.js
(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const zoneIndex = () => Object.fromEntries((window.CIVI_MAP_DISTRICTS || []).map((d) => [d.id, d]));
  const node = (t) => document.createElementNS(SVG_NS, t);

  function polygonPoints(shape, w, h) {
    return shape.map(([x, y]) => `${x * w},${y * h}`).join(" ");
  }

  function setupSvg(host, w, h) {
    const svg = node("svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", "100%"); svg.setAttribute("height", "100%");
    ["terrain", "water-green", "districts", "roads-transit", "blocks", "landmarks", "functional-zones", "labels", "dynamic"].forEach((id) => {
      const g = node("g");
      g.setAttribute("id", id === "districts" ? "civi-map-districts" : id === "blocks" ? "civi-map-blocks" : id === "landmarks" ? "civi-map-landmarks" : id === "labels" ? "civi-map-labels" : `civi-map-${id}`);
      svg.appendChild(g);
    });
    host.appendChild(svg);
    return svg;
  }

  function renderBase(svg, w, h) {
    const terrain = svg.querySelector("#civi-map-terrain");
    const waterGreen = svg.querySelector("#civi-map-water-green");
    const bg = node("rect"); bg.setAttribute("width", w); bg.setAttribute("height", h); bg.setAttribute("fill", "#1a242f"); terrain.appendChild(bg);
    const city = node("rect"); city.setAttribute("x", 20); city.setAttribute("y", 30); city.setAttribute("width", w - 40); city.setAttribute("height", h - 60); city.setAttribute("rx", 20); city.setAttribute("fill", "#253442"); terrain.appendChild(city);
    const fjord = node("path"); fjord.setAttribute("d", `M ${w*0.12} ${h*0.78} Q ${w*0.34} ${h*0.92} ${w*0.88} ${h*0.82} L ${w*0.88} ${h} L ${w*0.12} ${h} Z`); fjord.setAttribute("fill", "#3875a8"); waterGreen.appendChild(fjord);
  }

  function renderDistricts(svg, w, h) {
    const layer = svg.querySelector("#civi-map-districts");
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => {
      const p = node("polygon"); p.setAttribute("points", polygonPoints(d.shape, w, h)); p.setAttribute("fill", d.style.fill); p.setAttribute("stroke", d.style.stroke); p.setAttribute("stroke-width", "2"); p.setAttribute("opacity", "0.95");
      layer.appendChild(p);
    });
  }

  function renderRoads(svg, w, h) {
    const roads = svg.querySelector("#civi-map-roads-transit");
    const idx = zoneIndex();
    (window.CIVI_MAP_CONNECTIONS || []).forEach(([a, b]) => {
      if (!idx[a] || !idx[b]) return;
      const r = node("line");
      r.setAttribute("x1", idx[a].center[0] * w); r.setAttribute("y1", idx[a].center[1] * h);
      r.setAttribute("x2", idx[b].center[0] * w); r.setAttribute("y2", idx[b].center[1] * h);
      r.setAttribute("stroke", "rgba(245,245,245,0.35)"); r.setAttribute("stroke-width", "5"); r.setAttribute("stroke-linecap", "round");
      roads.appendChild(r);
    });
  }

  function renderBlocks(svg, w, h) {
    const layer = svg.querySelector("#civi-map-blocks");
    (window.CIVI_MAP_DISTRICTS || []).forEach((d, di) => {
      const p = window.CIVI_MAP_BLOCK_PATTERNS?.[d.blocks]; if (!p) return;
      const [bw, bh] = p.size; const x0 = d.center[0] * w - ((p.cols * bw + (p.cols - 1) * p.gap) / 2); const y0 = d.center[1] * h - ((p.rows * bh + (p.rows - 1) * p.gap) / 2);
      for (let y = 0; y < p.rows; y++) for (let x = 0; x < p.cols; x++) {
        if ((x + y + di) % 7 === 0) continue;
        const r = node("rect"); r.setAttribute("x", x0 + x * (bw + p.gap)); r.setAttribute("y", y0 + y * (bh + p.gap)); r.setAttribute("width", bw); r.setAttribute("height", bh); r.setAttribute("fill", "rgba(33,38,45,0.45)"); r.setAttribute("stroke", "rgba(255,255,255,0.18)"); r.setAttribute("stroke-width", "0.7");
        layer.appendChild(r);
      }
    });
  }

  function renderLandmarks(svg, w, h) {
    const layer = svg.querySelector("#civi-map-landmarks"); const idx = zoneIndex();
    const colors = { power: "#f0cf91", commerce: "#7ca8d9", work: "#95a4b4", industry: "#8f9499", green: "#79b67d", culture: "#b08cd9", housing: "#d2b183", public: "#ddd" };
    (window.CIVI_MAP_LANDMARKS || []).forEach((m) => {
      const d = idx[m.district]; if (!d) return; const [dx, dy] = m.offset || [0, 0];
      const g = node("rect"); g.setAttribute("x", d.center[0] * w + dx - 7); g.setAttribute("y", d.center[1] * h + dy - 7); g.setAttribute("width", 14); g.setAttribute("height", 14); g.setAttribute("rx", 3); g.setAttribute("fill", colors[m.kind] || "#ccc"); g.setAttribute("stroke", "#1e1e1e");
      layer.appendChild(g);
    });
  }

  function renderFunctionalAndLabels(svg, w, h) {
    const fnLayer = svg.querySelector("#civi-map-functional-zones");
    const labels = svg.querySelector("#civi-map-labels");
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => {
      const ring = node("circle"); ring.setAttribute("cx", d.center[0] * w); ring.setAttribute("cy", d.center[1] * h); ring.setAttribute("r", 9 + d.functions.work * 6); ring.setAttribute("fill", "none"); ring.setAttribute("stroke", "rgba(255,255,255,0.20)"); fnLayer.appendChild(ring);
      (d.labels || []).forEach((l) => { const t = node("text"); t.textContent = l.text; t.setAttribute("x", d.center[0] * w + (l.dx || 0)); t.setAttribute("y", d.center[1] * h + (l.dy || 0)); t.setAttribute("fill", "#fff"); t.setAttribute("font-size", "13"); t.setAttribute("font-weight", "700"); t.setAttribute("text-anchor", "middle"); labels.appendChild(t); });
    });
  }

  function render() {
    const host = document.getElementById("civiMapWorld"); if (!host) return;
    host.querySelector("svg")?.remove();
    const w = host.clientWidth || 960; const h = host.clientHeight || 640;
    const svg = setupSvg(host, w, h);
    renderBase(svg, w, h); renderDistricts(svg, w, h); renderRoads(svg, w, h); renderBlocks(svg, w, h); renderLandmarks(svg, w, h); renderFunctionalAndLabels(svg, w, h);
  }

  document.addEventListener("DOMContentLoaded", render);
  window.addEventListener("resize", () => setTimeout(render, 60));
  window.CivicationMap = { render };
})();
