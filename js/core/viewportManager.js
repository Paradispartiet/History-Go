(function(){

  const DESIGN_WIDTH  = 800;
  const DESIGN_HEIGHT = 1280;

  let shell = null;
  let rafId = null;
  let lastScale = null;

  function getViewportSize(){
  const vv = window.visualViewport;

  if (vv && vv.width && vv.height){
    return { width: vv.width, height: vv.height };
  }

  const de = document.documentElement;
  return {
    width: de.clientWidth,
    height: de.clientHeight
  };
}

  function calculateScale(vw, vh){
    const scaleX = vw / DESIGN_WIDTH;
    const scaleY = vh / DESIGN_HEIGHT;
    return Math.min(scaleX, scaleY);
  }

  function applyScale(scale){
  if (!shell) return;
  if (Math.abs(scale - lastScale) < 0.001) return;

  const { width: vw, height: vh } = getViewportSize();

  const scaledWidth  = DESIGN_WIDTH  * scale;
  const scaledHeight = DESIGN_HEIGHT * scale;

  // Horisontalt: sentrer
  const offsetX = (vw - scaledWidth) / 2;

  // Vertikalt: bunn-align (ingen gap under footer)
  const offsetY = Math.max(0, (vh - scaledHeight));

  shell.style.width  = DESIGN_WIDTH  + "px";
  shell.style.height = DESIGN_HEIGHT + "px";

  shell.style.transform =
    `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

  lastScale = scale;

  requestAnimationFrame(() => {
    if (window.hgMap?.resize) window.hgMap.resize();
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
