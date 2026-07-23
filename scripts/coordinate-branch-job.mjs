import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const payload = path.join(root, "scripts/.etne-batch9-production.mjs.gz");
const decoded = path.join(root, "scripts/.etne-batch9-production-decoded.mjs");
const expectedGzipSha = "350d0e6fed8658d62f6564a2c8a98c74b864e45712dfde4dcd73a345093c4a20";
const expectedSourceSha = "fe0581ee8d4e46212bd5c565661333938b26c39faddc212670d628486a729864";
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
