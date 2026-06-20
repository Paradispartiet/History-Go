// scripts/audit-civication-historygo-map.mjs
// Audit av History Go-steder for Civication Oslo-miniatyrkartet.
// Speiler logikken i js/Civication/ui/CivicationHistoryGoPlaceLayer.js (uten DOM).
//
// Kjør:  node scripts/audit-civication-historygo-map.mjs
//
// Skriver:
//   reports/civication-historygo-map-audit.json
//   reports/civication-historygo-map-audit.md

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const PLACES_DIR = path.join(ROOT, "data", "places");
const MANIFEST = path.join(PLACES_DIR, "manifest.json");
const REPORTS_DIR = path.join(ROOT, "reports");

const OSLO_BOUNDS = { minLat: 59.80, maxLat: 60.02, minLon: 10.55, maxLon: 10.90 };
const OSLO_FILTER = { minLat: 59.75, maxLat: 60.10, minLon: 10.45, maxLon: 11.00 };

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function placesFromFileData(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.places)) return data.places;
  return [];
}

function inBox(lat, lon, box) {
  return lat != null && lon != null &&
    lat >= box.minLat && lat <= box.maxLat &&
    lon >= box.minLon && lon <= box.maxLon;
}

function isOslo(p) {
  if (inBox(p.lat, p.lon, OSLO_FILTER)) return true;
  const cm = p.civiMap;
  if (cm && String(cm.region || "").toLowerCase() === "oslo") return true;
  if (String(p.city || "").toLowerCase() === "oslo") return true;
  return false;
}

function hasManualCiviXY(p) {
  const cm = p.civiMap;
  return !!(cm && typeof cm.x === "number" && typeof cm.y === "number" &&
    cm.x >= 0 && cm.x <= 1 && cm.y >= 0 && cm.y <= 1);
}

// Forenklet asset-type-resolusjon (eksplisitt kilde finnes / finnes ikke).
function explicitAssetType(p) {
  const cm = p.civiMap;
  if (cm && cm.assetType) return cm.assetType;
  if (p.mapAssetType) return p.mapAssetType;
  const qp = p.quiz_profile || {};
  const pt = String(qp.place_type || qp.subtype || "").trim();
  if (pt) return `quiz:${pt}`;
  return null;
}

function main() {
  if (!fs.existsSync(MANIFEST)) {
    console.error(`Fant ikke ${MANIFEST}`);
    process.exit(1);
  }
  const manifest = readJSON(MANIFEST);
  const files = Array.isArray(manifest?.files) ? manifest.files : [];

  const report = {
    generated_at: new Date().toISOString(),
    total_files: files.length,
    total_places: 0,
    oslo_places: 0,
    counts: {},
    buckets: {
      missing_lat_lon: [],
      non_oslo_skipped: [],
      missing_asset_type: [],
      projected_from_lat_lon: [],
      uses_manual_civiMap: [],
      duplicate_ids: []
    }
  };

  const idSeen = new Map(); // id -> [files]

  for (const rel of files) {
    const abs = path.join(PLACES_DIR, rel.replace(/^places\//, ""));
    let data;
    try {
      data = readJSON(abs);
    } catch (e) {
      console.warn(`Hoppet over ${rel}: ${e.message}`);
      continue;
    }
    const intendedOslo = !/\/europe\//.test(rel) && !/europe\//.test(rel);

    for (const raw of placesFromFileData(data)) {
      const id = String(raw?.id || "").trim();
      if (!id) continue;
      report.total_places++;

      idSeen.set(id, [...(idSeen.get(id) || []), rel]);

      const p = {
        id,
        name: raw.name || raw.title || id,
        category: raw.category || "unknown",
        lat: num(raw.lat),
        lon: num(raw.lon),
        civiMap: raw.civiMap || null,
        city: raw.city,
        mapAssetType: raw.mapAssetType,
        quiz_profile: raw.quiz_profile
      };

      const oslo = isOslo(p);

      if (!oslo) {
        // Ikke-Oslo (f.eks. Lisboa) hoppes over på Oslo-kartet.
        if (!intendedOslo || (p.lat != null && p.lon != null)) {
          report.buckets.non_oslo_skipped.push({ id, file: rel, lat: p.lat, lon: p.lon });
          continue;
        }
        // Intendert Oslo, men mangler koordinater -> rapporteres som missing_lat_lon under.
      }

      if (p.lat == null || p.lon == null) {
        report.buckets.missing_lat_lon.push({ id, file: rel, category: p.category });
        continue;
      }

      report.oslo_places++;

      if (hasManualCiviXY(p)) {
        report.buckets.uses_manual_civiMap.push({ id, file: rel, x: p.civiMap.x, y: p.civiMap.y });
      } else {
        report.buckets.projected_from_lat_lon.push({ id, file: rel, lat: p.lat, lon: p.lon });
      }

      if (!explicitAssetType(p)) {
        report.buckets.missing_asset_type.push({ id, file: rel, category: p.category, name: p.name });
      }
    }
  }

  for (const [id, inFiles] of idSeen.entries()) {
    if (inFiles.length > 1) report.buckets.duplicate_ids.push({ id, files: inFiles });
  }

  // Tellinger
  report.counts = Object.fromEntries(
    Object.entries(report.buckets).map(([k, v]) => [k, v.length])
  );

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const jsonPath = path.join(REPORTS_DIR, "civication-historygo-map-audit.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n", "utf8");

  const md = renderMarkdown(report);
  const mdPath = path.join(REPORTS_DIR, "civication-historygo-map-audit.md");
  fs.writeFileSync(mdPath, md, "utf8");

  console.log("Civication History Go map audit:");
  for (const [k, n] of Object.entries(report.counts)) console.log(`  ${k}: ${n}`);
  console.log(`Oslo-steder plassert: ${report.oslo_places} / ${report.total_places}`);
  console.log(`Skrev ${path.relative(ROOT, jsonPath)} og ${path.relative(ROOT, mdPath)}`);
}

function sample(arr, n = 25) {
  return arr.slice(0, n);
}

function renderMarkdown(r) {
  const lines = [];
  lines.push("# Civication – History Go map audit");
  lines.push("");
  lines.push(`Generert: ${r.generated_at}`);
  lines.push("");
  lines.push("## Sammendrag");
  lines.push("");
  lines.push(`- Filer i manifest: **${r.total_files}**`);
  lines.push(`- Steder totalt: **${r.total_places}**`);
  lines.push(`- Oslo-steder plassert på kartet: **${r.oslo_places}**`);
  lines.push("");
  lines.push("| Kategori | Antall |");
  lines.push("| --- | ---: |");
  for (const [k, n] of Object.entries(r.counts)) lines.push(`| ${k} | ${n} |`);
  lines.push("");

  const section = (title, key, fmt) => {
    const arr = r.buckets[key];
    lines.push(`## ${title} (${arr.length})`);
    lines.push("");
    if (!arr.length) { lines.push("_Ingen._", ""); return; }
    for (const item of sample(arr)) lines.push(`- ${fmt(item)}`);
    if (arr.length > 25) lines.push(`- … og ${arr.length - 25} til (se JSON).`);
    lines.push("");
  };

  section("Mangler lat/lon", "missing_lat_lon", (i) => `\`${i.id}\` (${i.category}) – ${i.file}`);
  section("Ikke-Oslo, hoppet over", "non_oslo_skipped", (i) => `\`${i.id}\` – ${i.file}`);
  section("Mangler eksplisitt assetType (bruker heuristikk)", "missing_asset_type", (i) => `\`${i.id}\` (${i.category}) – ${i.name}`);
  section("Projisert fra lat/lon (trenger evt. manuell civiMap.x/y)", "projected_from_lat_lon", (i) => `\`${i.id}\` – lat ${i.lat}, lon ${i.lon}`);
  section("Bruker manuell civiMap.x/y", "uses_manual_civiMap", (i) => `\`${i.id}\` – (${i.x}, ${i.y})`);
  section("Duplikate IDer", "duplicate_ids", (i) => `\`${i.id}\` – ${i.files.join(", ")}`);

  return lines.join("\n") + "\n";
}

main();
