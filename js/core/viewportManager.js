(function () {
  const DESIGN_WIDTH = 1000;
  const DESIGN_HEIGHT = 1430;

  let shell = null;
  let mapLayer = null;
  let rafId = null;
  let last = { scale: null, x: null, y: null, w: null, h: null };

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
      Math.abs(y - last.y) < 0.5 &&
      Math.abs(scaledW - last.w) < 0.5 &&
      Math.abs(scaledH - last.h) < 0.5
    ) {
      return;
    }

    // UI-skallet: fortsatt design-canvas som skaleres
    shell.style.width = DESIGN_WIDTH + "px";
    shell.style.height = DESIGN_HEIGHT + "px";
    shell.style.position = "fixed";
    shell.style.top = "0";
    shell.style.left = "0";
    shell.style.transformOrigin = "top left";
    shell.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

    // Kartlaget: IKKE scale-transform, bare samme synlige rektangel
    if (mapLayer) {
      mapLayer.style.position = "fixed";
      mapLayer.style.left = `${x}px`;
      mapLayer.style.top = `${y}px`;
      mapLayer.style.width = `${scaledW}px`;
      mapLayer.style.height = `${scaledH}px`;
      mapLayer.style.transform = "none";
      mapLayer.style.overflow = "hidden";
    }

    window.HGViewport = {
      scale,
      x,
      y,
      designWidth: DESIGN_WIDTH,
      designHeight: DESIGN_HEIGHT,
      visibleWidth: scaledW,
      visibleHeight: scaledH
    };

    if (window.HGMap?.resize) {
      window.HGMap.resize();
    }

    last = { scale, x, y, w: scaledW, h: scaledH };
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
    mapLayer = document.getElementById("mapLayer");
    if (!shell) return;

    update();

    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", schedule, { passive: true });
      vv.addEventListener("scroll", schedule, { passive: true });
    }
  }

  window.ViewportManager = { init };
})();
