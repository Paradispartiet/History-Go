import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const by = (...parts) => path.join(root, "data", "fag", "by", ...parts);
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const partPaths = fs.readdirSync(by()).filter((name) => name.startsWith(".editorial_patch_by_v4_6.part")).sort((a, b) => Number(a.split("part")[1]) - Number(b.split("part")[1]));
const encodedPatch = partPaths.map((name) => fs.readFileSync(by(name), "utf8").trim()).join("");
const patch = JSON.parse(zlib.gunzipSync(Buffer.from(encodedPatch, "base64")).toString("utf8"));

function applyFields(target, fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === null) delete target[key];
    else target[key] = value;
  }
}

function patchArrayById(items, idKey, patches, label) {
  const index = new Map(items.map((item) => [item[idKey], item]));
  for (const [id, fields] of Object.entries(patches)) {
    const target = index.get(id);
    if (!target) throw new Error(`Missing ${label} ${id}`);
    applyFields(target, fields);
  }
  return items;
}

const activeEmner = read(by("emner_by.json"));
patchArrayById(activeEmner, "emne_id", patch.emner, "emne");
write(by("emner_by.json"), activeEmner);
write(by("emner_by_canonical_v4_5.json"), activeEmner);

const methods = read(by("methods_by.json"));
applyFields(methods, patch.methods.top_level);
patchArrayById(methods.methods, "method_id", patch.methods.by_id, "method");
write(by("methods_by.json"), methods);

const fagkart = read(by("fagkart_by.json"));
applyFields(fagkart, patch.fagkart.top_level);
patchArrayById(fagkart.categories, "id", patch.fagkart.categories_by_id, "fagkart category");
write(by("fagkart_by.json"), fagkart);

const matrix = read(by("bypensum_matrix.json"));
applyFields(matrix, patch.matrix.top_level);
patchArrayById(matrix.domains, "domain_id", patch.matrix.domains_by_id, "matrix domain");
write(by("bypensum_matrix.json"), matrix);

console.log("Materialized BY editorial v4.6 files.");
