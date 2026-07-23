import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const payload = path.join(root, "scripts/.etne-batch9-production.mjs.gz");
const decoded = path.join(root, "scripts/.etne-batch9-production-decoded.mjs");
const expectedGzipSha = "4e670473e32ac3111d15c88985093b2d8ecc4d81a4a23ab885e2c283416472c5";
const expectedSourceSha = "164d408f1360d7b4aab752df3b7c64e6655dae24113cee327f72dfe7cc12dea9";
const gzipBytes = fs.readFileSync(payload);
const gzipSha = crypto.createHash("sha256").update(gzipBytes).digest("hex");
if (gzipSha !== expectedGzipSha) throw new Error(`Batch 9 gzip SHA mismatch: ${gzipSha}`);
const source = zlib.gunzipSync(gzipBytes);
const sourceSha = crypto.createHash("sha256").update(source).digest("hex");
if (sourceSha !== expectedSourceSha) throw new Error(`Batch 9 source SHA mismatch: ${sourceSha}`);
fs.writeFileSync(decoded, source);
try {
  await import(`${pathToFileURL(decoded).href}?run=${Date.now()}`);
} finally {
  for (const rel of [
    "scripts/.etne-batch9-production-decoded.mjs",
    "scripts/.etne-batch9-production.mjs.gz",
    "scripts/.etne-batch9-production.mjs.gz.b64",
    "scripts/.etne-batch9-payload-1.b64",
    "scripts/.batch9-connector-test",
    "scripts/.placeholder-never-used",
    "scripts/.tree-fix-marker",
    "scripts/.oops-cleanup-needed",
    "scripts/.do-not-keep"
  ]) {
    try { fs.rmSync(path.join(root, rel)); } catch {}
  }
}
