#!/usr/bin/env node
// Verifies that the independent History Go game registry is complete,
// profile-wired and renderable without pulling the games into Civication.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.resolve(__dirname, "..");
const registryPath = path.join(repoRoot, "data/historygo/shared/game_registry.json");
const sourcePath = path.join(repoRoot, "js/historyGoGameRegistry.js");
const profilePath = path.join(repoRoot, "profile.html");

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const source = fs.readFileSync(sourcePath, "utf8");
const profileHtml = fs.readFileSync(profilePath, "utf8");

const expectedGameIds = [
  "hgFootballManager",
  "hgFilmProducer",
  "hgArtSchool",
  "hgWritingAcademy"
];

assert.strictEqual(registry.owner, "History Go", "shared game registry is owned by History Go");
assert.match(
  registry.profileUpdateContract,
  /window\.dispatchEvent\(new Event\("updateProfile"\)\)/,
  "registry documents the profile update event contract"
);
assert.deepStrictEqual(
  registry.games.map((game) => game.gameId),
  expectedGameIds,
  "registry exposes the four independent learning games in the expected order"
);

for (const game of registry.games) {
  assert.ok(game.displayName, `${game.gameId} has displayName`);
  assert.ok(game.shortDescription, `${game.gameId} has shortDescription`);
  assert.ok(game.entryPath, `${game.gameId} has entryPath`);
  assert.ok(Array.isArray(game.readsFromHistoryGo) && game.readsFromHistoryGo.length > 0, `${game.gameId} reads shared History Go collections`);
  assert.ok(Array.isArray(game.writesBackToProfile) && game.writesBackToProfile.length > 0, `${game.gameId} writes progress back to profile/AHA`);
  assert.match(game.independenceRule, /Civication kan lenke/i, `${game.gameId} may be surfaced from Civication`);
  assert.match(game.independenceRule, /ikke være motor/i, `${game.gameId} is not owned by Civication`);
}

assert.match(profileHtml, /class="profile-games-grid"/, "profile.html has a games grid target");
assert.match(profileHtml, /<script src="js\/historyGoGameRegistry\.js"><\/script>/, "profile.html loads the registry renderer");
assert.match(source, /const REGISTRY_PATH = "data\/historygo\/shared\/game_registry\.json"/, "renderer points to the shared registry path");
assert.match(source, /normalizeProfileGamesTab/, "renderer normalizes the profile games tab away from the legacy civication key");
assert.doesNotMatch(source + profileHtml, /My Rating|Date Added|Date Read|Private Notes/, "Goodreads-private fields are not exposed in the profile game surface");

(async () => {
  let requestedUrl = null;
  const warnings = [];
  const grid = { innerHTML: "" };
  const gameTab = { textContent: "Spill", dataset: { tab: "civication" } };
  const gamePanel = { dataset: { panel: "civication" } };
  const gamesSection = {
    closest(selector) {
      assert.strictEqual(selector, ".profile-tab-panel", "games section searches for its profile panel");
      return gamePanel;
    }
  };
  const documentStub = {
    querySelector(selector) {
      if (selector === ".profile-games-grid") return grid;
      if (selector === '.profile-tab[data-tab="civication"]') return gameTab;
      if (selector === ".profile-games-section") return gamesSection;
      return null;
    },
    addEventListener() {}
  };

  const context = {
    window: {},
    document: documentStub,
    console: { ...console, warn: (...args) => warnings.push(args.join(" ")) },
    fetch: async (url, options) => {
      requestedUrl = url;
      assert.deepStrictEqual(options, { cache: "no-store" }, "registry fetch avoids stale cached data");
      return { ok: true, json: async () => registry };
    }
  };

  vm.runInNewContext(source, context, { filename: sourcePath });

  assert.ok(context.window.HGGameRegistry, "renderer exposes window.HGGameRegistry");
  assert.strictEqual(context.window.HGGameRegistry.registryPath, "data/historygo/shared/game_registry.json", "registry path is public for diagnostics");
  assert.strictEqual(typeof context.window.HGGameRegistry.normalizeProfileGamesTab, "function", "tab normalizer is exposed for tests/diagnostics");

  context.window.HGGameRegistry.normalizeProfileGamesTab();
  assert.strictEqual(gameTab.dataset.tab, "spill", "profile games tab uses spill as runtime key");
  assert.strictEqual(gamePanel.dataset.panel, "spill", "profile games panel uses spill as runtime key");

  const loaded = await context.window.HGGameRegistry.loadGameRegistry();
  assert.strictEqual(requestedUrl, "data/historygo/shared/game_registry.json", "loader fetches the shared registry file");
  assert.strictEqual(loaded, registry, "loader returns registry JSON");

  context.window.HGGameRegistry.renderGameRegistry(registry);

  for (const gameId of expectedGameIds) {
    assert.match(grid.innerHTML, new RegExp(`data-game-id="${gameId}"`), `${gameId} rendered as profile game card`);
  }

  assert.match(grid.innerHTML, /HG Football Manager/, "Football Manager title rendered");
  assert.match(grid.innerHTML, /HG Film Producer/, "Film Producer title rendered");
  assert.match(grid.innerHTML, /Kunstskolen/, "Kunstskolen title rendered");
  assert.match(grid.innerHTML, /Skrivekunstakademiet/, "Skrivekunstakademiet title rendered");
  assert.match(grid.innerHTML, /target="_blank" rel="noopener noreferrer"/, "external game links are opened safely");
  assert.doesNotMatch(grid.innerHTML, /My Rating|Date Added|Date Read|Private Notes/, "rendered cards do not leak private Goodreads fields");
  assert.deepStrictEqual(warnings, [], "registry render/load completed without warnings");

  console.log("History Go game registry renders independent learning games.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
