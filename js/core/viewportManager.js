const DESIGN_WIDTH  = 800;
const DESIGN_HEIGHT = 1280;
  
  let shell = null;
  let rafId = null;
  let lastScale = null;

  function getViewportSize(){
    return {
      width:  window.innerWidth,
      height: window.innerHeight
    };
  }

  function calculateScale(vw, vh){
  const { w, h } = getDesignSize();

  const scaleX = vw / w;
  const scaleY = vh / h;

  return Math.min(scaleX, scaleY);
}

  function applyScale(scale){
  if (!shell) return;
  if (Math.abs(scale - lastScale) < 0.001) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const { w, h } = getDesignSize();

  const scaledWidth  = w * scale;
  const scaledHeight = h * scale;

  const offsetX = (vw - scaledWidth)  / 2;
  const offsetY = (vh - scaledHeight) / 2;

  shell.style.width  = w + "px";
  shell.style.height = h + "px";

  shell.style.transform =
    `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

  lastScale = scale;

  requestAnimationFrame(() => {
    if (window.hgMap?.resize) {
      window.hgMap.resize();
    }
  });
}

  function update(){
    rafId = null;

    const { width, height } = getViewportSize();
    const scale = calculateScale(width, height);

    applyScale(scale);
  }

  function scheduleUpdate(){
    if (rafId !== null) return;
    rafId = requestAnimationFrame(update);
  }

  function init(){
    shell = document.querySelector(".app-shell");
    if (!shell) return;

    update();

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("orientationchange", scheduleUpdate);

    if (window.visualViewport){
      window.visualViewport.addEventListener("resize", scheduleUpdate);
    }
  }

  window.ViewportManager = { init };

})();
