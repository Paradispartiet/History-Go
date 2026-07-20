// build/build-web.mjs
// esbuild-bygg for browser-runtime som migreres til TypeScript.
//
// Bakgrunn: History GO var historisk en "vanilla" app uten bundler. Prosjektet
// har besluttet å innføre esbuild som bundler slik at browser-filene kan bli
// ekte TypeScript (.ts) ESM-moduler. Migreringen skjer som en strangler:
// én og én klassisk global-scope-fil konverteres til en .ts ESM-modul og
// bundles her, mens resten fortsatt lastes som klassiske <script>-tagger.
//
// Interop-kontrakt (VIKTIG):
//   Hver migrert modul som tidligere eksponerte en global (window.X) MÅ fortsatt
//   publisere den samme globalen som en sideeffekt ved last, slik at klassiske
//   (ikke-migrerte) konsumenter fungerer uendret. Bundles bygges derfor som
//   `iife` (kjøres ved last, ingen import nødvendig i HTML).
//
// Output:
//   dist/web/<out>.js
//   Deploy-kritiske bundles committes når de lastes direkte av den statiske appen.

import { copyFile } from "node:fs/promises";
import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "dist/web");

/** @type {{ in: string; out: string }[]} */
const SOURCE_MAPPED_ENTRIES = [
  { in: "js/fagkartLoader.ts", out: "fagkartLoader" },
  { in: "js/fagHealthReport.ts", out: "fagHealthReport" },
  { in: "js/hgKnowledgeEngine.ts", out: "hgKnowledgeEngine" },
  { in: "js/hgSocialPrivacy.ts", out: "hgSocialPrivacy" },
  { in: "js/hgModeration.ts", out: "hgModeration" },
  { in: "js/emnerLoader.ts", out: "emnerLoader" },
  { in: "js/hgInsights.ts", out: "hgInsights" },
  { in: "js/knowledge.ts", out: "knowledge" },
  { in: "js/trivia.ts", out: "trivia" },
  { in: "js/courses.ts", out: "courses" },
  { in: "js/emneDekning.ts", out: "emneDekning" }
];

// Startup-runtimes that are still loaded from legacy script paths. They are
// authored in TypeScript and built to dist/web; the compatibility plugin copies
// the exact generated bundle to the old URL until app.js itself is migrated.
const STARTUP_ENTRIES = [
  { in: "js/map-controls-runtime.ts", out: "map-controls-runtime" },
  { in: "js/core/categories.ts", out: "categories" },
  { in: "js/core/layerManager.ts", out: "layerManager" },
  { in: "js/map.ts", out: "map" }
];

const RUNTIME_COMPATIBILITY_OUTPUTS = [
  { out: "categories", target: "js/core/categories.js" },
  { out: "layerManager", target: "js/core/layerManager.js" },
  { out: "map", target: "js/map.js" }
];

const compatibilityOutputPlugin = {
  name: "history-go-runtime-compatibility-outputs",
  setup(esbuild) {
    esbuild.onEnd(async (result) => {
      if (result.errors.length) return;
      await Promise.all(
        RUNTIME_COMPATIBILITY_OUTPUTS.map(({ out, target }) =>
          copyFile(path.join(OUT_DIR, `${out}.js`), path.join(ROOT, target))
        )
      );
    });
  }
};

const watch = process.argv.includes("--watch");

function buildOptions(entries, sourcemap, plugins = []) {
  return {
    entryPoints: entries.map((entry) => ({
      in: path.join(ROOT, entry.in),
      out: entry.out
    })),
    outdir: OUT_DIR,
    bundle: true,
    format: "iife",
    target: ["es2019"],
    platform: "browser",
    sourcemap,
    plugins,
    logLevel: "info"
  };
}

async function run() {
  const mappedOptions = buildOptions(SOURCE_MAPPED_ENTRIES, true);
  const startupOptions = buildOptions(STARTUP_ENTRIES, false, [compatibilityOutputPlugin]);

  if (watch) {
    const { context } = await import("esbuild");
    const [mappedContext, startupContext] = await Promise.all([
      context(mappedOptions),
      context(startupOptions)
    ]);
    await Promise.all([
      mappedContext.watch(),
      startupContext.watch()
    ]);
    console.log(`[build:web] watching ${SOURCE_MAPPED_ENTRIES.length + STARTUP_ENTRIES.length} entry/entries -> dist/web`);
    return;
  }

  await build(mappedOptions);
  await build(startupOptions);
  console.log(`[build:web] built ${SOURCE_MAPPED_ENTRIES.length + STARTUP_ENTRIES.length} entry/entries -> dist/web`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
