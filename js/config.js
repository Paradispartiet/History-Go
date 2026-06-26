window.HG_MAPTILER_KEY = "Yi8j8sLhEo4NyPygVmbN";
window.HG_NATURTRO_STYLE_ID = "streets-v4";
(function(){
  let tries = 0;
  function run(){
    if (window.HG_DailyObjectives && window.HG_RuntimeHealth) {
      if (document.querySelector('script[src="js/objectives/HGDailyObjectivesRuntimeGuard.js"]')) return;
      const script = document.createElement("script");
      script.src = "js/objectives/HGDailyObjectivesRuntimeGuard.js";
      script.defer = true;
      document.head.appendChild(script);
      return;
    }
    tries += 1;
    if (tries < 160) window.setTimeout(run, 25);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
}());
