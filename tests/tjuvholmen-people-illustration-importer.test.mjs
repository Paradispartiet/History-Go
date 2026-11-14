#!/usr/bin/env node
// This test checks the importer and never publishes portraits.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const src=path.join(root,"scripts/stage-tjuvholmen-people-illustrations.py");
assert.ok(fs.existsSync(src));
const help=spawnSync("python3",[src,"--help"],{cwd:root,encoding:"utf8"});
assert.equal(help.status,0,help.stderr);
assert.match(help.stdout,/--stage/);
assert.match(help.stdout,/--package/);
const missing=spawnSync("python3",[src,"--package","does-not-exist-tjuvholmen-import.zip"],{cwd:root,encoding:"utf8"});
assert.notEqual(missing.status,0,"Importer must fail closed on missing media");
const m=JSON.parse(fs.readFileSync(path.join(root,"reports/place-production/tjuvholmen-generated-people-illustration-candidates-20261112.json"),"utf8"));
assert.equal(m.status,"THREE_V1_CANDIDATES_IN_QUARANTINE_MELGAARD_V3_EDITORIAL_ACTIVE");
assert.equal(m.new_published_portrait_count,1);
const rt=JSON.parse(fs.readFileSync(path.join(root,"data/runtime/place-open/tjuvholmen.json"),"utf8"));
for(const id of ["stephen_butkus","hans_rasmus_astrup"]){
 const p=rt.people.find(p=>p.id===id);
 assert.ok(p,id+" missing");
 assert.equal(p.image,"",id+" must stay text-only");
 assert.equal(p.cardImage,"",id+" must stay text-only");
}
const source=fs.readFileSync(src,"utf8");
assert.match(source,/STAGING_DIR = "bilder\/kort\/people\/candidates\/tjuvholmen"/);
assert.match(source,/sha256\(blob\)/);
assert.match(source,/img\.format != "WEBP"/);
assert.match(source,/VISUAL_IDENTITY_REVIEW_REQUIRED/);
console.log("TJUVHOLMEN_SAFE_STAGING_IMPORTER_PASS: staging remains candidate-only, user-approved Melgaard v3 separately activated");
