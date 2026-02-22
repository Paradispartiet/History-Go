// CivicationMap.js
(function () {
  function svgEl(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  function render() {
    const host = document.getElementById("civiMapWorld");
    if (!host) return;

    host.innerHTML = "";

    const w = host.clientWidth || 900;
    const h = host.clientHeight || 500;

    const svg = svgEl("svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.display = "block";

    // Bakgrunn
    const bg = svgEl("rect");
    bg.setAttribute("x", "0");
    bg.setAttribute("y", "0");
    bg.setAttribute("width", w);
    bg.setAttribute("height", h);
    bg.setAttribute("rx", "18");
    bg.setAttribute("fill", "rgba(0,0,0,0.25)");
    bg.setAttribute("stroke", "rgba(255,255,255,0.10)");
    svg.appendChild(bg);

    // Sentrum (deg)
    const cx = w * 0.5;
    const cy = h * 0.52;

    function node(x, y, r, label) {
      const g = svgEl("g");

      const c = svgEl("circle");
      c.setAttribute("cx", x);
      c.setAttribute("cy", y);
      c.setAttribute("r", r);
      c.setAttribute("fill", "rgba(255,255,255,0.10)");
      c.setAttribute("stroke", "rgba(255,255,255,0.20)");
      c.setAttribute("stroke-width", "2");
      g.appendChild(c);

      const t = svgEl("text");
      t.setAttribute("x", x);
      t.setAttribute("y", y + 5);
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("font-size", "14");
      t.setAttribute("fill", "rgba(255,255,255,0.90)");
      t.textContent = label;
      g.appendChild(t);

      return g;
    }

    function link(x1, y1, x2, y2) {
      const l = svgEl("line");
      l.setAttribute("x1", x1);
      l.setAttribute("y1", y1);
      l.setAttribute("x2", x2);
      l.setAttribute("y2", y2);
      l.setAttribute("stroke", "rgba(255,255,255,0.18)");
      l.setAttribute("stroke-width", "2");
      return l;
    }

    const nodes = [
      { x: cx, y: cy, r: 34, label: "Du" },
      { x: cx, y: h * 0.18, r: 26, label: "Arbeid" },
      { x: w * 0.20, y: cy, r: 26, label: "Nabolag" },
      { x: w * 0.80, y: cy, r: 26, label: "Sosial" },
      { x: cx, y: h * 0.86, r: 26, label: "Kultur" }
    ];

    // Lenker fra sentrum
    const center = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      svg.appendChild(link(center.x, center.y, nodes[i].x, nodes[i].y));
    }

    // Noder
    for (const n of nodes) {
      svg.appendChild(node(n.x, n.y, n.r, n.label));
    }

    host.appendChild(svg);
  }

  function init() {
    render();
    window.addEventListener("resize", render, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
