// CivicationMap.js
(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const STORE = { home:"civi_home_v1", active:"hg_active_position_v1", state:"hg_civi_state_v1", inbox:"hg_civi_inbox_v1", mail:"hg_civi_mail_v1", capital:"hg_capital_v1" };
  const node = (t) => document.createElementNS(SVG_NS, t);
  const zoneIndex = () => Object.fromEntries((window.CIVI_MAP_DISTRICTS || []).map((d) => [d.id, d]));
  const hash = (s="") => Array.from(String(s)).reduce((n, ch) => ((n << 5) - n + ch.charCodeAt(0)) | 0, 0);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const read = (k, fallback) => { try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };

  function polygonPoints(shape, w, h) { return shape.map(([x, y]) => `${x * w},${y * h}`).join(" "); }

  function ensureLegend(host) {
    if (host.querySelector(".civi-map-legend")) return;
    const el = document.createElement("aside");
    el.className = "civi-map-legend";
    el.innerHTML = '<button class="civi-map-legend-toggle" type="button" aria-expanded="true">Karttegn</button><div class="civi-map-legend-body"><span data-kind="work">Arbeid</span><span data-kind="housing">Bolig</span><span data-kind="store">Handel</span><span data-kind="debate">Kultur/debatt</span><span data-kind="leisure">Grønt/ro</span><span data-kind="power">Makt/offentlighet</span></div>';
    el.querySelector(".civi-map-legend-toggle")?.addEventListener("click", (e) => {
      const expanded = e.currentTarget.getAttribute("aria-expanded") === "true";
      e.currentTarget.setAttribute("aria-expanded", String(!expanded));
      el.classList.toggle("is-collapsed", expanded);
    });
    host.appendChild(el);
  }

  function setupSvg(host, w, h) {
    const svg = node("svg"); svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.setAttribute("width", "100%"); svg.setAttribute("height", "100%");
    ["terrain","water","districts","corridors","blocks","functions","landmarks","labels","state"].forEach((id) => {
      const g = node("g");
      const map = { districts:"civi-map-districts", blocks:"civi-map-blocks", landmarks:"civi-map-landmarks", labels:"civi-map-labels" };
      g.setAttribute("id", map[id] || `civi-map-${id}`); svg.appendChild(g);
    });
    host.appendChild(svg); return svg;
  }

  function renderTerrain(svg, w, h) {
    const layer = svg.querySelector("#civi-map-terrain");
    const bg = node("rect"); bg.setAttribute("width", w); bg.setAttribute("height", h); bg.setAttribute("fill", "#151d26"); layer.appendChild(bg);
    const city = node("path"); city.setAttribute("d", `M ${w*0.08} ${h*0.22} Q ${w*0.22} ${h*0.08} ${w*0.5} ${h*0.1} Q ${w*0.78} ${h*0.12} ${w*0.9} ${h*0.28} L ${w*0.92} ${h*0.72} Q ${w*0.78} ${h*0.9} ${w*0.5} ${h*0.9} Q ${w*0.2} ${h*0.9} ${w*0.08} ${h*0.74} Z`); city.setAttribute("fill", "#223241"); layer.appendChild(city);
  }
  function renderWater(svg, w, h) {
    const layer = svg.querySelector("#civi-map-water");
    const fjord = node("path"); fjord.setAttribute("d", `M ${w*0.1} ${h*0.78} Q ${w*0.32} ${h*0.96} ${w*0.9} ${h*0.84} L ${w} ${h} L ${w*0.05} ${h} Z`); fjord.setAttribute("fill", "#32658f"); fjord.setAttribute("opacity", "0.75"); layer.appendChild(fjord);
  }
  function renderDistricts(svg, w, h) {
    const layer = svg.querySelector("#civi-map-districts");
    (window.CIVI_MAP_DISTRICTS || []).slice().sort((a,b) => (a.visualWeight||0)-(b.visualWeight||0)).forEach((d) => {
      const p = node("polygon"); p.setAttribute("points", polygonPoints(d.shape, w, h)); p.setAttribute("fill", d.style.fill); p.setAttribute("stroke", d.style.stroke); p.setAttribute("stroke-width", 1.6 + (d.visualWeight || 0.5)); p.setAttribute("opacity", "0.96"); layer.appendChild(p);
    });
  }
  function renderConnections(svg, w, h) {
    const layer = svg.querySelector("#civi-map-corridors"); const idx = zoneIndex();
    (window.CIVI_MAP_CONNECTIONS || []).forEach(([a,b]) => {
      if (!idx[a] || !idx[b]) return;
      const wgt = ((idx[a].corridorWeight || 0.6) + (idx[b].corridorWeight || 0.6)) / 2;
      const x1 = idx[a].center[0] * w, y1 = idx[a].center[1] * h, x2 = idx[b].center[0] * w, y2 = idx[b].center[1] * h;
      const c = node("path"); c.setAttribute("d", `M ${x1} ${y1} Q ${(x1+x2)/2} ${(y1+y2)/2 - (8 + wgt*4)} ${x2} ${y2}`); c.setAttribute("stroke", "rgba(228,236,245,0.35)"); c.setAttribute("stroke-width", 4 + wgt*5); c.setAttribute("fill", "none"); c.setAttribute("stroke-linecap", "round"); layer.appendChild(c);
    });
  }
  function renderBlocks(svg, w, h) {
    const layer = svg.querySelector("#civi-map-blocks");
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => {
      const p = window.CIVI_MAP_BLOCK_PATTERNS?.[d.blocks]; if (!p) return;
      const [bw,bh] = p.size; const sx = d.center[0]*w - ((p.cols*bw + (p.cols-1)*p.gap)/2); const sy = d.center[1]*h - ((p.rows*bh + (p.rows-1)*p.gap)/2);
      const seed = Math.abs(hash(d.id));
      for (let y=0;y<p.rows;y++) for (let x=0;x<p.cols;x++) {
        const skip = (x*7 + y*11 + seed) % 9 === 0; if (skip) continue;
        const r = node("rect");
        let rw = bw, rh = bh;
        if (p.variant === "industry_yards" && x % 2 === 0) rw += 5;
        if (p.variant === "villa_blocks" && y % 2 === 0) rh += 2;
        if (p.variant === "creative_mix" && (x + y) % 3 === 0) rw -= 2;
        if (p.variant === "open_quarters" && (x + y) % 2 === 1) continue;
        r.setAttribute("x", sx + x*(bw+p.gap)); r.setAttribute("y", sy + y*(bh+p.gap)); r.setAttribute("width", clamp(rw, 6, 24)); r.setAttribute("height", clamp(rh, 5, 20));
        r.setAttribute("fill", d.style.blockFill || "rgba(35,35,35,0.35)"); r.setAttribute("stroke", d.style.blockStroke || "rgba(255,255,255,0.2)"); r.setAttribute("stroke-width", "0.7"); layer.appendChild(r);
      }
    });
  }
  function renderFunctionalZones(svg, w, h) {
    const layer = svg.querySelector("#civi-map-functions");
    const fn = {work:"#9fb5ce",housing:"#dcbf97",store:"#83aede",debate:"#c5a0e8",people:"#f3e6a8",leisure:"#86be8f",power:"#f1ce91"};
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => {
      const entries = Object.entries(d.functions || {}).sort((a,b)=>b[1]-a[1]).slice(0,3);
      entries.forEach(([key,val],i)=>{ const rect=node("rect"); rect.setAttribute("x", d.center[0]*w - 18 + i*12); rect.setAttribute("y", d.center[1]*h + 12 + i*2); rect.setAttribute("width", 10); rect.setAttribute("height", Math.max(4, 6+val*10)); rect.setAttribute("fill", fn[key] || "#ddd"); rect.setAttribute("opacity", "0.55"); layer.appendChild(rect); });
      const primary = node("path"); primary.setAttribute("d", `M ${d.center[0]*w - 22} ${d.center[1]*h - 18} L ${d.center[0]*w + 22} ${d.center[1]*h - 18}`); primary.setAttribute("stroke", fn[d.primaryFunction] || "#fff"); primary.setAttribute("stroke-width", 2.2); primary.setAttribute("opacity", "0.65"); layer.appendChild(primary);
    });
  }
  function renderLandmarks(svg, w, h) {
    const layer = svg.querySelector("#civi-map-landmarks"); const idx = zoneIndex(); const colors = { power:"#f0cf91", commerce:"#7ca8d9", work:"#95a4b4", industry:"#8f9499", green:"#79b67d", culture:"#b08cd9", housing:"#d2b183", public:"#ddd" };
    (window.CIVI_MAP_LANDMARKS || []).forEach((m) => { const d = idx[m.district]; if (!d) return; const [dx,dy] = m.offset || [0,0]; const g = node("rect"); g.setAttribute("x", d.center[0]*w+dx-7); g.setAttribute("y", d.center[1]*h+dy-7); g.setAttribute("width", 14); g.setAttribute("height", 14); g.setAttribute("rx", m.kind === "industry" ? 1 : 3); g.setAttribute("fill", colors[m.kind] || "#ccc"); g.setAttribute("stroke", "#1e1e1e"); layer.appendChild(g); });
  }
  function renderLabels(svg, w, h) {
    const layer = svg.querySelector("#civi-map-labels");
    (window.CIVI_MAP_DISTRICTS || []).slice().sort((a,b)=>(b.labelPriority||0)-(a.labelPriority||0)).forEach((d) => {
      (d.labels || []).forEach((l) => { const t = node("text"); t.textContent = l.text; t.setAttribute("x", d.center[0]*w + (l.dx || 0)); t.setAttribute("y", d.center[1]*h + (l.dy || 0)); t.setAttribute("fill", d.style.labelFill || "#fff"); t.setAttribute("font-size", d.style.labelSize || 13); t.setAttribute("font-weight", "800"); t.setAttribute("text-anchor", "middle"); layer.appendChild(t); });
    });
  }
  function renderDynamicState(svg, w, h) {
    const layer = svg.querySelector("#civi-map-state"); const idx = zoneIndex();
    const homeId = read(STORE.home, {})?.home?.district; const active = read(STORE.active, null) || read(STORE.state, {})?.active_role_key; const inbox = read(STORE.mail, null)?.items?.length || (Array.isArray(read(STORE.inbox, [])) ? read(STORE.inbox, []).length : 0); const cap = read(STORE.capital, {}); const capSum = ["economic","cultural","social","symbolic","political"].reduce((n,k)=>n+Number(cap[k]||0),0);
    if (homeId && idx[homeId]) { const c = node("circle"); c.setAttribute("cx", idx[homeId].center[0]*w); c.setAttribute("cy", idx[homeId].center[1]*h); c.setAttribute("r", 26); c.setAttribute("fill", "none"); c.setAttribute("stroke", "rgba(115,198,126,0.8)"); c.setAttribute("stroke-width", "2.5"); layer.appendChild(c); }
    if (active) { const aid = (window.CIVI_MAP_DISTRICTS || []).find((d) => JSON.stringify(active).toLowerCase().includes(d.id.replace("_",""))); if (aid) { const r = node("rect"); r.setAttribute("x", aid.center[0]*w - 24); r.setAttribute("y", aid.center[1]*h - 24); r.setAttribute("width", 48); r.setAttribute("height", 48); r.setAttribute("fill", "none"); r.setAttribute("stroke", "rgba(130,175,224,0.85)"); r.setAttribute("stroke-width", "2"); layer.appendChild(r); } }
    if (inbox > 0 && idx.sentrum) { const p = node("circle"); p.setAttribute("cx", idx.sentrum.center[0]*w + 30); p.setAttribute("cy", idx.sentrum.center[1]*h - 22); p.setAttribute("r", 7 + Math.min(inbox, 6)); p.setAttribute("fill", "rgba(255,213,120,0.45)"); layer.appendChild(p); }
    if (capSum > 30 && idx.ullern) { const glow = node("circle"); glow.setAttribute("cx", idx.ullern.center[0]*w); glow.setAttribute("cy", idx.ullern.center[1]*h); glow.setAttribute("r", 20); glow.setAttribute("fill", "rgba(247,223,173,0.22)"); layer.appendChild(glow); }
  }

  function render() {
    const host = document.getElementById("civiMapWorld"); if (!host) return;
    host.querySelector("svg")?.remove(); ensureLegend(host);
    const w = host.clientWidth || 960; const h = host.clientHeight || 640; const svg = setupSvg(host, w, h);
    renderTerrain(svg, w, h); renderWater(svg, w, h); renderDistricts(svg, w, h); renderConnections(svg, w, h); renderBlocks(svg, w, h); renderFunctionalZones(svg, w, h); renderLandmarks(svg, w, h); renderLabels(svg, w, h); renderDynamicState(svg, w, h);
  }

  document.addEventListener("DOMContentLoaded", render);
  window.addEventListener("resize", () => setTimeout(render, 70));
  ["civi:booted","civi:dataReady","civi:homeChanged","storage"].forEach((ev) => window.addEventListener(ev, render));
  window.CivicationMap = { render };
})();
