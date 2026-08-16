import fs from "node:fs";
import path from "node:path";

const manifest = JSON.parse(fs.readFileSync("data/places/manifest.json", "utf8"));
const areaQuizTypes = new Set([
  "omrade", "område", "boligomrade", "boligområde", "bydel", "by", "tettstad",
  "ladested", "ladested_og_ferdselssted", "alternativ_bydel"
]);
const allowedScopes = new Set(["area"]);
const errors = [];
const scoped = [];

for (const rel of manifest.files || []) {
  const file = path.join("data", rel);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const items = Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : [data];
  for (const place of items) {
    if (!place || typeof place !== "object" || (!place.id && !place.name)) continue;
    const scope = String(place.placeScope || "").trim().toLowerCase();
    const coordType = String(place.coordType || "").trim().toLowerCase();
    const quizType = String(place.quiz_profile?.place_type || "").trim().toLowerCase();
    const legacyExplicitArea = coordType === "district_anchor" || areaQuizTypes.has(quizType);

    if (scope && !allowedScopes.has(scope)) {
      errors.push(`${rel}/${place.id || place.name}: ukjent placeScope ${JSON.stringify(scope)}`);
    }
    if (legacyExplicitArea && scope !== "area") {
      errors.push(`${rel}/${place.id || place.name}: eksplisitt områdeklassifikasjon mangler placeScope=area`);
    }
    if (scope === "area") {
      scoped.push({ id: place.id || "", name: place.name || "", file: rel });
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`placeScope audit ok: ${scoped.length} eksplisitte område-Places`);
