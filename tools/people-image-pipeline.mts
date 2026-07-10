#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const MANIFEST_PATH = "data/people/manifest.json";
const CANDIDATES_PATH = "data/people/people_image_candidates.json";
const ATTRIBUTION_PATH = "data/people/people_image_attributions.json";
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "HistoryGoPeopleImageBot/1.0 (https://github.com/Paradispartiet/History-Go)";
const ALLOWED_LICENSES = [
  /public domain/i,
  /^cc0/i,
  /^cc by(?:-|\s)/i,
  /^cc by-sa(?:-|\s)/i
];

const args = process.argv.slice(2);
const command = args.find(arg => !arg.startsWith("--")) || "audit";
const WRITE = args.includes("--write");
const INCLUDE_EXISTING = args.includes("--include-existing");
const LIMIT_ARG = args.find(arg => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Math.max(0, Number(LIMIT_ARG.split("=")[1]) || 0) : 0;
const IDS_ARG = args.find(arg => arg.startsWith("--ids="));
const IDS = IDS_ARG
  ? new Set(IDS_ARG.split("=")[1].split(",").map(value => value.trim()).filter(Boolean))
  : null;

const abs = (relativePath: string) => path.join(ROOT, relativePath);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const hasText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

async function readJson(relativePath: string): Promise<any> {
  return JSON.parse(await fs.readFile(abs(relativePath), "utf8"));
}

async function writeJson(relativePath: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(abs(relativePath)), { recursive: true });
  await fs.writeFile(abs(relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function peopleFromDocument(document: any): any[] {
  if (Array.isArray(document)) return document;
  if (Array.isArray(document?.people)) return document.people;
  if (document && typeof document === "object" && hasText(document.id)) return [document];
  return [];
}

function resolveManifestPath(entry: string): string {
  if (!entry.startsWith("people/")) throw new Error(`Ugyldig people manifest-entry: ${entry}`);
  return `data/${entry}`;
}

async function loadPeople(): Promise<Array<{ person: any; filePath: string }>> {
  const manifest = await readJson(MANIFEST_PATH);
  const files = Array.isArray(manifest) ? manifest : manifest.files;
  if (!Array.isArray(files)) throw new Error(`${MANIFEST_PATH} mangler files-array`);
  const loaded: Array<{ person: any; filePath: string }> = [];
  for (const entry of files) {
    const filePath = resolveManifestPath(String(entry));
    const document = await readJson(filePath);
    for (const person of peopleFromDocument(document)) {
      if (!person || !hasText(person.id) || !hasText(person.name)) continue;
      loaded.push({ person, filePath });
    }
  }
  return loaded;
}

function stripHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").trim();
}

function apiUrl(base: string, params: Record<string, unknown>): URL {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

async function fetchJson(url: URL): Promise<any> {
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}: ${url.origin}`);
  return response.json();
}

function licenseAllowed(shortName: string): boolean {
  return ALLOWED_LICENSES.some(pattern => pattern.test(shortName.trim()));
}

function safeExtension(mime: string, sourceUrl: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("jpeg")) return "jpg";
  const match = sourceUrl.toLowerCase().split("?")[0].match(/\.(jpg|jpeg|png|webp)$/);
  return match ? (match[1] === "jpeg" ? "jpg" : match[1]) : "jpg";
}

async function searchWikidata(person: any): Promise<any[]> {
  const yearHint = Number.isFinite(Number(person.year)) ? ` ${person.year}` : "";
  const data = await fetchJson(apiUrl(WIKIDATA_API, {
    action: "wbsearchentities",
    format: "json",
    language: "no",
    uselang: "no",
    type: "item",
    limit: 5,
    search: `${person.name}${yearHint}`
  }));
  return Array.isArray(data?.search) ? data.search : [];
}

async function wikidataEntity(id: string): Promise<any> {
  const data = await fetchJson(apiUrl(WIKIDATA_API, {
    action: "wbgetentities",
    format: "json",
    ids: id,
    props: "claims|labels|descriptions",
    languages: "no|nb|en"
  }));
  return data?.entities?.[id] || null;
}

async function commonsInfo(filename: string): Promise<any> {
  const title = filename.startsWith("File:") ? filename : `File:${filename}`;
  const data = await fetchJson(apiUrl(COMMONS_API, {
    action: "query",
    format: "json",
    formatversion: "2",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiurlwidth: 900,
    iiextmetadatafilter: "Artist|Credit|LicenseShortName|LicenseUrl|UsageTerms"
  }));
  const page = data?.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  if (!info?.url) return null;
  const metadata = info.extmetadata || {};
  const license = stripHtml(metadata.LicenseShortName?.value || metadata.UsageTerms?.value || "");
  return {
    fileTitle: page.title,
    originalUrl: info.url,
    previewUrl: info.thumburl || info.url,
    sourcePage: info.descriptionurl,
    mime: info.mime || "",
    width: Number(info.width || 0),
    height: Number(info.height || 0),
    creator: stripHtml(metadata.Artist?.value || ""),
    credit: stripHtml(metadata.Credit?.value || ""),
    license,
    licenseUrl: stripHtml(metadata.LicenseUrl?.value || ""),
    licenseAllowed: licenseAllowed(license)
  };
}

function candidateScore(person: any, searchResult: any, entity: any): number {
  const expected = String(person.name).toLowerCase();
  const label = String(searchResult.label || "").toLowerCase();
  let score = label === expected ? 100 : label.includes(expected) || expected.includes(label) ? 78 : 45;
  if (entity?.claims?.P31?.some((claim: any) => claim?.mainsnak?.datavalue?.value?.id === "Q5")) score += 15;
  if (entity?.claims?.P18?.length) score += 20;
  return score;
}

async function buildCandidates(): Promise<void> {
  const all = await loadPeople();
  const selected = all.filter(({ person }) => {
    if (IDS && !IDS.has(person.id)) return false;
    if (!INCLUDE_EXISTING && (hasText(person.image) || hasText(person.cardImage))) return false;
    return true;
  }).slice(0, LIMIT || undefined);

  const entries: any[] = [];
  for (const [index, { person, filePath }] of selected.entries()) {
    try {
      const searchResults = await searchWikidata(person);
      const candidates: any[] = [];
      for (const result of searchResults.slice(0, 3)) {
        const entity = await wikidataEntity(result.id);
        const filename = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
        if (!filename) continue;
        const image = await commonsInfo(filename);
        if (!image) continue;
        candidates.push({
          wikidataId: result.id,
          label: result.label,
          description: result.description || "",
          score: candidateScore(person, result, entity),
          approved: false,
          ...image
        });
        await sleep(100);
      }
      entries.push({
        personId: person.id,
        name: person.name,
        year: person.year ?? null,
        sourceFile: filePath,
        status: candidates.length ? "needs_review" : "no_candidate",
        candidates: candidates.sort((a, b) => b.score - a.score)
      });
    } catch (error) {
      entries.push({
        personId: person.id,
        name: person.name,
        sourceFile: filePath,
        status: "lookup_error",
        error: error instanceof Error ? error.message : String(error),
        candidates: []
      });
    }
    console.log(`[${index + 1}/${selected.length}] ${person.id}`);
    await sleep(150);
  }

  await writeJson(CANDIDATES_PATH, {
    schema: "history-go.people-image-candidates.v1",
    generatedAt: new Date().toISOString(),
    policy: {
      requiresExplicitApproval: true,
      allowedLicenses: ["Public Domain", "CC0", "CC BY", "CC BY-SA"],
      googleImagesAllowedAsProductionSource: false
    },
    entries
  });
  console.log(`Skrev ${entries.length} kandidater til ${CANDIDATES_PATH}`);
}

async function audit(): Promise<void> {
  const all = await loadPeople();
  const report = {
    totalPeople: all.length,
    withImage: all.filter(({ person }) => hasText(person.image) || hasText(person.cardImage)).length,
    withImageMeta: all.filter(({ person }) => person.imageMeta && typeof person.imageMeta === "object").length,
    missingImage: all.filter(({ person }) => !hasText(person.image) && !hasText(person.cardImage)).map(({ person }) => person.id),
    remoteImageUrls: all.filter(({ person }) => /^https?:\/\//i.test(person.image || "") || /^https?:\/\//i.test(person.cardImage || "")).map(({ person }) => person.id),
    missingAttribution: all.filter(({ person }) => (hasText(person.image) || hasText(person.cardImage)) && !(person.imageMeta && typeof person.imageMeta === "object")).map(({ person }) => person.id)
  };
  console.log(JSON.stringify(report, null, 2));
  if (report.remoteImageUrls.length) process.exitCode = 1;
}

async function download(url: string, targetPath: string): Promise<void> {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`Kunne ikke laste ned bilde: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(abs(targetPath)), { recursive: true });
  await fs.writeFile(abs(targetPath), bytes);
}

async function applyApproved(): Promise<void> {
  const candidateFile = await readJson(CANDIDATES_PATH);
  const approvedByPerson = new Map<string, any>();
  for (const entry of candidateFile.entries || []) {
    const approved = (entry.candidates || []).find((candidate: any) => candidate.approved === true);
    if (!approved) continue;
    if (!approved.licenseAllowed || !licenseAllowed(String(approved.license || ""))) {
      throw new Error(`${entry.personId}: godkjent kandidat har ikke tillatt lisens`);
    }
    approvedByPerson.set(entry.personId, approved);
  }

  const manifest = await readJson(MANIFEST_PATH);
  const files: string[] = Array.isArray(manifest) ? manifest : manifest.files;
  const attributions: any[] = [];
  let changedPeople = 0;

  for (const entry of files) {
    const filePath = resolveManifestPath(entry);
    const document = await readJson(filePath);
    const people = peopleFromDocument(document);
    let changed = false;
    for (const person of people) {
      const candidate = approvedByPerson.get(person.id);
      if (!candidate) continue;
      const extension = safeExtension(candidate.mime || "", candidate.originalUrl || "");
      const localPath = `bilder/kort/people/${person.id}.${extension}`;
      person.image = localPath;
      person.cardImage = localPath;
      person.wikidataId = candidate.wikidataId;
      person.imageMeta = {
        source: "wikimedia_commons",
        sourcePage: candidate.sourcePage,
        creator: candidate.creator || "",
        credit: candidate.credit || "",
        license: candidate.license,
        licenseUrl: candidate.licenseUrl || "",
        retrievedAt: new Date().toISOString().slice(0, 10),
        reviewStatus: "manually_approved"
      };
      attributions.push({ personId: person.id, name: person.name, image: localPath, ...person.imageMeta });
      changed = true;
      changedPeople += 1;
      if (WRITE) await download(candidate.originalUrl, localPath);
    }
    if (changed && WRITE) await writeJson(filePath, document);
  }

  if (WRITE) await writeJson(ATTRIBUTION_PATH, {
    schema: "history-go.people-image-attributions.v1",
    generatedAt: new Date().toISOString(),
    entries: attributions
  });
  console.log(`${WRITE ? "Skrev" : "Dry-run:"} ${changedPeople} godkjente people-bilder`);
  if (!WRITE) console.log("Ingen filer ble endret. Kjør med --write etter kontroll.");
}

if (command === "audit") await audit();
else if (command === "candidates") await buildCandidates();
else if (command === "apply") await applyApproved();
else throw new Error(`Ukjent kommando: ${command}. Bruk audit, candidates eller apply.`);
