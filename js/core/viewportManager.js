(function () {
  const DESIGN_WIDTH = 900;
  const DESIGN_HEIGHT = 1230;

  let shell = null;
  let rafId = null;
  let last = { scale: null, x: null, y: null };

  function getViewport() {
    const vv = window.visualViewport;
    if (vv) return { w: vv.width, h: vv.height };
    return { w: window.innerWidth, h: window.innerHeight };
  }

  function calculateScale(vw, vh) {
    const sx = vw / DESIGN_WIDTH;
    const sy = vh / DESIGN_HEIGHT;
    return Math.min(sx, sy);
  }
  
  
  function apply(scale, vw, vh) {
  if (!shell) return;

  const scaledW = DESIGN_WIDTH * scale;
  const scaledH = DESIGN_HEIGHT * scale;

  const x = Math.max(0, (vw - scaledW) / 2);
  const y = 0;

  if (
    last.scale !== null &&
    Math.abs(scale - last.scale) < 0.001 &&
    Math.abs(x - last.x) < 0.5 &&
    Math.abs(y - last.y) < 0.5
  ) {
    return;
  }

  shell.style.width = DESIGN_WIDTH + "px";
  shell.style.height = DESIGN_HEIGHT + "px";

  shell.style.position = "fixed";
  shell.style.top = "0";
  shell.style.left = "0";
  shell.style.transformOrigin = "top left";
  shell.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

  if (window.HGMap?.resize) {
    window.HGMap.resize();
  }

  last = { scale, x, y };
}


  function update() {
    rafId = null;
    const { w, h } = getViewport();
    const scale = calculateScale(w, h);
    apply(scale, w, h);
  }

  
  function schedule() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(update);
  }

  
  function init() {
    shell = document.querySelector(".app-shell");
    if (!shell) return;

    update();

    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", schedule, { passive: true });
      vv.addEventListener("scroll", schedule, { passive: true }); // iOS toolbar/offset
    }
  }

  window.ViewportManager = { init };
})();
