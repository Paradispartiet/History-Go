(function(){

  const DESIGN_WIDTH  = 800;
  const DESIGN_HEIGHT = 1280;

  let shell = null;
  let rafId = null;
  let lastScale = null;

  function getViewport(){
    const vv = window.visualViewport;
    if (vv && vv.width && vv.height){
      return {
        width: vv.width,
        height: vv.height,
        offsetLeft: vv.offsetLeft || 0,
        offsetTop: vv.offsetTop || 0
      };
    }

    const de = document.documentElement;
    return {
      width: de.clientWidth,
      height: de.clientHeight,
      offsetLeft: 0,
      offsetTop: 0
    };
  }

  function calculateScale(vw, vh){
    return Math.min(vw / DESIGN_WIDTH, vh / DESIGN_HEIGHT);
  }

  function apply(scale){
    if (!shell) return;
    if (Math.abs(scale - lastScale) < 0.001) return;

    const { width: vw, height: vh, offsetLeft, offsetTop } = getViewport();

    const scaledW = DESIGN_WIDTH  * scale;
    const scaledH = DESIGN_HEIGHT * scale;

    // X: sentrer, men aldri negativ (hindrer “ut til venstre”)
    const x = Math.max(0, (vw - scaledW) / 2);

    // Y: bunn-align (footer “låses” nederst)
    const y = Math.max(0, (vh - scaledH));

    // Bruk visualViewport-offset bare når shell er fixed (top/left=0)
    const tx = Math.round(offsetLeft + x);
    const ty = Math.round(offsetTop  + y);

    shell.style.width  = DESIGN_WIDTH  + "px";
    shell.style.height = DESIGN_HEIGHT + "px";
    shell.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;

    lastScale = scale;

    requestAnimationFrame(() => {
      if (window.hgMap?.resize) window.hgMap.resize();
    });
  }

  function update(){
    rafId = null;
    const { width, height } = getViewport();
    apply(calculateScale(width, height));
  }

  function schedule(){
    if (rafId !== null) return;
    rafId = requestAnimationFrame(update);
  }

  function init(){
    shell = document.querySelector(".app-shell");
    if (!shell) return;

    // 2-pass init: iPad kan endre visualViewport rett etter første paint
    update();
    requestAnimationFrame(update);

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    if (window.visualViewport){
      window.visualViewport.addEventListener("resize", schedule);
      window.visualViewport.addEventListener("scroll", schedule);
    }
  }

  window.ViewportManager = { init };

})();
