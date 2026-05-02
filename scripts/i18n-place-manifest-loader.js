const fs = require("fs");
const path = require("path");

function createPlaceManifestLoader(rootDir, label) {
  const MANIFEST_PATH = "data/places/manifest.json";

  function readJson(relativePath) {
    const filePath = path.join(rootDir, relativePath);
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  }

  function loadManifestPlaceFiles() {
    const manifestFullPath = path.join(rootDir, MANIFEST_PATH);
    if (!fs.existsSync(manifestFullPath)) {
      throw new Error(`[${label}] Missing manifest file: ${MANIFEST_PATH}`);
    }

    const manifest = readJson(MANIFEST_PATH);
    if (!manifest || !Array.isArray(manifest.files)) {
      throw new Error(`[${label}] Invalid manifest format in ${MANIFEST_PATH}. Expected { files: string[] }.`);
    }

    return manifest.files.map((manifestPath, index) => {
      const rel = String(manifestPath || "").trim();
      if (!rel) {
        throw new Error(`[${label}] Invalid empty manifest path at index ${index} in ${MANIFEST_PATH}.`);
      }
      if (!rel.endsWith(".json")) {
        throw new Error(`[${label}] Manifest path must point to a JSON file: ${rel}`);
      }

      const normalized = path.posix.normalize(rel);
      if (normalized.startsWith("../") || normalized.includes("/../")) {
        throw new Error(`[${label}] Manifest path escapes data directory: ${rel}`);
      }

      const resolvedRelativePath = path.posix.join("data", normalized);
      const resolvedFullPath = path.join(rootDir, resolvedRelativePath);

      if (!fs.existsSync(resolvedFullPath)) {
        throw new Error(`[${label}] Manifest points to missing file: ${resolvedRelativePath}`);
      }

      return resolvedRelativePath;
    });
  }

  return {
    manifestPath: MANIFEST_PATH,
    readJson,
    loadManifestPlaceFiles
  };
}

module.exports = {
  createPlaceManifestLoader
};
