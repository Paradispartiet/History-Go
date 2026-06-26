(function () {
  const REGISTRY_PATH = "data/historygo/shared/game_registry.json";

  function esc(value) {
    return String(value ?? "").replace(/[&<>\"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[ch]));
  }

  function iconFor(gameId) {
    return {
      hgFootballManager: "⚽",
      hgFilmProducer: "🎬",
      hgArtSchool: "🎨",
      hgWritingAcademy: "✍️"
    }[gameId] || "🎮";
  }

  function isExternal(path) {
    return /^https?:\/\//i.test(String(path || ""));
  }

  function renderGameRegistry(registry) {
    const grid = document.querySelector(".profile-games-grid");
    if (!grid || !Array.isArray(registry?.games)) return;

    grid.innerHTML = registry.games.map((game) => {
      const href = game.entryPath || game.route || "#";
      const externalAttrs = isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
      const readCount = Array.isArray(game.readsFromHistoryGo) ? game.readsFromHistoryGo.length : 0;
      const writeCount = Array.isArray(game.writesBackToProfile) ? game.writesBackToProfile.length : 0;
      return `
        <a class="profile-game-card" href="${esc(href)}"${externalAttrs} data-game-id="${esc(game.gameId)}">
          <span class="profile-game-heading">
            <span class="profile-game-icon" aria-hidden="true">${esc(iconFor(game.gameId))}</span>
            <span class="profile-game-title">${esc(game.displayName)}</span>
          </span>
          <span class="profile-game-stats" aria-label="${esc(game.status)}">
            <span><strong>${esc(game.status)}</strong></span>
            <span>${readCount} HG-kilder</span>
            <span>${writeCount} profilfelt</span>
          </span>
          <span class="muted">${esc(game.shortDescription)}</span>
        </a>`;
    }).join("");
  }

  async function loadGameRegistry() {
    const response = await fetch(REGISTRY_PATH, { cache: "no-store" });
    if (!response.ok) throw new Error(`Kunne ikke laste ${REGISTRY_PATH}: ${response.status}`);
    return response.json();
  }

  window.HGGameRegistry = { loadGameRegistry, renderGameRegistry, registryPath: REGISTRY_PATH };

  document.addEventListener("DOMContentLoaded", () => {
    loadGameRegistry()
      .then(renderGameRegistry)
      .catch((error) => console.warn("[HGGameRegistry]", error));
  });
}());
