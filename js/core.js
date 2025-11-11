async function boot() {
  debug("🔄 Starter History Go ...");

  // Korrekt bane (data ligger alltid rett under prosjektet)
  const basePath = "data/";

  try {
    const settings = await fetchJSON(`${basePath}settings.json`);
    window.appSettings = settings || {};

    const [places, people, badges, routes] = await Promise.all([
      fetchJSON(`${basePath}places.json`),
      fetchJSON(`${basePath}people.json`),
      fetchJSON(`${basePath}badges.json`),
      fetchJSON(`${basePath}routes.json`),
    ]);

    window.HG = window.HG || {};
    HG.data = { places, people, badges, routes };
    window.data = HG.data;

    console.log("DATA:", HG.data);
    debug(`✅ Data lastet (${places?.length || 0} steder)`);

    if (window.app?.initApp) app.initApp();
    else if (typeof initApp === "function") initApp();
    else if (window.map?.initMap && HG.data.places)
      map.initMap(HG.data.places, HG.data.routes || []);
  } catch (err) {
    console.error("💥 BOOT FEIL:", err);
  }
}

window.addEventListener("load", () => {
  setTimeout(() => {
    const d = document.createElement("div");
    d.style.cssText = "position:fixed;bottom:4px;left:4px;background:#0008;color:#0f0;padding:6px 10px;font:12px monospace;z-index:99999;border-radius:6px;";
    const count = HG?.data?.places?.length || 0;
    d.textContent = count ? `✅ HG.data lastet (${count} steder)` : `⚠️ HG.data tom`;
    document.body.appendChild(d);
  }, 1500);
});

document.addEventListener("DOMContentLoaded", boot);
