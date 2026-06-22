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
//   dist/web/<out>.js  (gitignored generert build-output; ikke commit)
//   HTML-sider som er migrert peker på dist/web/... og krever `npm run build:web`.

import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "dist/web");

/**
 * Migrerte browser-entrypoints. Legg til en linje per fil som konverteres
 * fra klassisk js/<navn>.js til js/<navn>.ts. `out` er filnavnet (uten .js)
 * som havner i dist/web/ og som tilhørende HTML-side skal peke på.
 *
 * @type {{ in: string; out: string }[]}
 */
const ENTRIES = [
  { in: "js/fagkartLoader.ts", out: "fagkartLoader" },
  { in: "js/fagHealthReport.ts", out: "fagHealthReport" },
  { in: "js/hgKnowledgeEngine.ts", out: "hgKnowledgeEngine" },
  { in: "js/hgSocialPrivacy.ts", out: "hgSocialPrivacy" },
  { in: "js/hgModeration.ts", out: "hgModeration" },
  { in: "js/emnerLoader.ts", out: "emnerLoader" },
  { in: "js/hgInsights.ts", out: "hgInsights" },
  { in: "js/knowledge.ts", out: "knowledge" },
  { in: "js/profileInsightRoomEntry.ts", out: "profileInsightRoomEntry" }
];

const watch = process.argv.includes("--watch");

async function run() {
  const ctxOptions = {
    entryPoints: ENTRIES.map((e) => ({ in: path.join(ROOT, e.in), out: e.out })),
    outdir: OUT_DIR,
    bundle: true,
    format: "iife",
    target: ["es2019"],
    platform: "browser",
    sourcemap: true,
    logLevel: "info"
  };

  if (watch) {
    const { context } = await import("esbuild");
    const ctx = await context(ctxOptions);
    await ctx.watch();
    console.log(`[build:web] watching ${ENTRIES.length} entry/entries -> dist/web`);
    return;
  }

  await build(ctxOptions);
  console.log(`[build:web] built ${ENTRIES.length} entry/entries -> dist/web`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
