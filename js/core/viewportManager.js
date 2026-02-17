(function(){

  const DESIGN_WIDTH  = 1280;
  const DESIGN_HEIGHT = 800;

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
    return vw / DESIGN_WIDTH;
  }

  function applyScale(scale){
    if (!shell) return;
    if (scale === lastScale) return;

    shell.style.transform =
      `translate(-50%, -50%) scale(${scale})`;

    lastScale = scale;

    // Resize kart etter transform
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
