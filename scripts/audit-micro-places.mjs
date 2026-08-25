import fs from "node:fs/promises";
import path from "node:path";
import { validateMicroPlace } from "./lib/micro-place-contract.mjs";

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, "data");
const manifest = JSON.parse(await fs.readFile(path.join(DATA_ROOT, "places/manifest.json"), "utf8"));
const categoryContract = JSON.parse(await fs.readFile(path.join(DATA_ROOT, "categories/category_contract.json"), "utf8"));

const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const rowsFrom = (value) => {
  if (Array.isArray(value)) return value.filter(isObject);
  if (isObject(value) && Array.isArray(value.places)) return value.places.filter(isObject);
  if (isObject(value) && typeof value.id === "string") return [value];
  return [];
};

const results = [];
for (const rel of Array.isArray(manifest.files) ? manifest.files : []) {
  const sourceFile = String(rel || "").trim();
  if (!sourceFile) continue;
  let data;
  try {
    data = JSON.parse(await fs.readFile(path.join(DATA_ROOT, sourceFile), "utf8"));
  } catch (error) {
    results.push({ sourceFile, id: null, errors: [{ field: "sourceFile", message: error instanceof Error ? error.message : String(error) }] });
    continue;
  }
  for (const place of rowsFrom(data)) {
    if (place.placeTier !== "micro") continue;
    results.push({ sourceFile, id: place.id || null, errors: validateMicroPlace(place, categoryContract) });
  }
}

const failures = results.filter((row) => row.errors.length);
const report = {
  status: failures.length ? "failed" : "passed",
  microPlacesChecked: results.length,
  failures
};
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
