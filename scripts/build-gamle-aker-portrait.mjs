#!/usr/bin/env node
// Reproducible, genuine raster portrait crop of the public-domain documentary photograph.
// Source: https://commons.wikimedia.org/wiki/File:Gamle_Aker_kirke_S.jpg (Mahlum, 10 Feb 2008).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const source = "bilder/places/auto/gamle_aker_kirke__sorsiden.jpg";
const output = "bilder/places/gamle_aker_kirke_front_portrait.webp";
const reportFile = "reports/place-production/gamle-aker-kirke-v1-portrait-photo.json";
const crop = { left: 350, top: 0, width: 600, height: 800 };
const bytes = fs.readFileSync(source);
const input = await sharp(bytes).metadata();
if (input.width !== 1200 || input.height !== 800) {
  throw new Error(`Unexpected canonical photo dimensions: ${input.width} × ${input.height}`);
}
const portrait = await sharp(bytes)
  .extract(crop)
  .webp({ quality: 86, effort: 6 })
  .toBuffer();
const details = await sharp(portrait).metadata();
if (details.width !== 600 || details.height !== 800 || details.format !== "webp") {
  throw new Error("Portrait transform did not produce a 600 × 800 WebP");
}
const hash = contents => crypto.createHash("sha256").update(contents).digest("hex");
const report = {
  schema: "history-go-documentary-portrait-v1",
  placeId: "gamle_aker_kirke",
  sourceFile: source,
  outputFile: output,
  sourcePage: "https://commons.wikimedia.org/wiki/File:Gamle_Aker_kirke_S.jpg",
  creator: "Mahlum",
  photographDate: "2008-02-10",
  license: "Public domain",
  sourceDimensions: [input.width, input.height],
  outputDimensions: [details.width, details.height],
  crop,
  transformation: "Physical 600 × 800 raster crop of locally stored public-domain photo, encoded as WebP quality 86. No generative alteration.",
  sourceSha256: hash(bytes),
  outputSha256: hash(portrait)
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.mkdirSync(path.dirname(reportFile), { recursive: true });
fs.writeFileSync(output, portrait);
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
console.log("Generated documentary Gamle Aker portrait:", output, report.outputSha256);
