import fs from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { pathToFileURL } from "node:url";

const files = [
  "scripts/history-phase5-builder.part1.b64",
  "scripts/history-phase5-builder.part2.b64",
  "scripts/history-phase5-builder.part3.b64"
];
const encoded = files.map((file) => fs.readFileSync(file, "utf8").trim()).join("");
if (encoded.length !== 9628) throw new Error(`History phase 5 builder transport length mismatch: ${encoded.length}`);
const source = gunzipSync(Buffer.from(encoded, "base64"));
const hash = createHash("sha256").update(source).digest("hex");
if (hash !== "49b29cc552273448c44d610c60bd329358cc7ede003794f34fb7cd6b92cdc565") {
  throw new Error(`History phase 5 builder SHA mismatch: ${hash}`);
}
const target = "/tmp/history-phase5-builder.mjs";
fs.writeFileSync(target, source);
await import(pathToFileURL(target).href);
