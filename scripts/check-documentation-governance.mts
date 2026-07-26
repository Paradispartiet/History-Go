import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  normalize,
  relative,
  resolve,
  sep,
} from "node:path";

const repoRoot = resolve(process.env.GITHUB_WORKSPACE ?? process.cwd());
const registryPath = resolve(repoRoot, "docs/documentation_registry.json");
const reportDir = resolve(repoRoot, "reports/documentation-governance");

const allowedStatuses = new Set([
  "canonical",
  "operational",
  "transitional",
  "historical",
  "local",
]);

const activeStatuses = new Set(["canonical", "operational", "transitional"]);
const ignoredDirectories = new Set([
  ".git",
  ".cache",
  "node_modules",
  "dist",
  "coverage",
]);

interface DocumentationEntry {
  path: string;
  status: string;
  role: string;
  owns: string[];
  last_verified?: string;
  superseded_by?: string[];
  historical_reason?: string;
  debt?: string;
}

interface DocumentationRegistry {
  schema_version: number;
  registry_status: string;
  owner: string;
  last_verified: string;
  priority_order: string[];
  documents: DocumentationEntry[];
}

interface HistoricalLink {
  source: string;
  target: string;
  target_status: string;
}

interface DocumentationInventory {
  generated_at: string;
  totals: {
    documentation_like_files: number;
    registered_files: number;
    unregistered_governance_candidates: number;
    suspicious_filenames: number;
    active_links_to_historical_documents: number;
    duplicate_basename_groups: number;
  };
  by_location: Record<string, number>;
  suspicious_files: string[];
  active_links_to_historical_documents: HistoricalLink[];
  unregistered_governance_candidates: string[];
  duplicate_basenames: Record<string, string[]>;
}

const failures: string[] = [];
const warnings: string[] = [];

function fail(message: string): void {
  failures.push(message);
}

function warn(message: string): void {
  warnings.push(message);
}

function toRepoPath(absolutePath: string): string {
  return relative(repoRoot, absolutePath).split(sep).join("/");
}

function repoPathExists(relativePath: string): boolean {
  return existsSync(resolve(repoRoot, relativePath));
}

function parseRegistry(): DocumentationRegistry {
  if (!existsSync(registryPath)) {
    throw new Error(`Mangler docs/documentation_registry.json under repo-roten ${repoRoot}`);
  }

  const parsed = JSON.parse(readFileSync(registryPath, "utf8")) as DocumentationRegistry;
  if (parsed.schema_version !== 1) {
    fail(`Ustøttet documentation registry schema: ${String(parsed.schema_version)}`);
  }
  if (parsed.registry_status !== "canonical") {
    fail("documentation_registry.json må ha registry_status=canonical");
  }
  if (!Array.isArray(parsed.documents) || parsed.documents.length === 0) {
    fail("documentation_registry.json har ingen documents-poster");
  }
  return parsed;
}

function validateRegistry(registry: DocumentationRegistry): void {
  const seenPaths = new Set<string>();
  const owners = new Map<string, string>();

  for (const entry of registry.documents) {
    if (!entry.path || !entry.role || !Array.isArray(entry.owns)) {
      fail(`Ufullstendig dokumentpost: ${JSON.stringify(entry)}`);
      continue;
    }

    if (seenPaths.has(entry.path)) {
      fail(`Duplisert dokumentpath i registeret: ${entry.path}`);
    }
    seenPaths.add(entry.path);

    if (!allowedStatuses.has(entry.status)) {
      fail(`Ugyldig status for ${entry.path}: ${entry.status}`);
    }

    if (!repoPathExists(entry.path)) {
      fail(`Registrert dokument finnes ikke: ${entry.path}`);
      continue;
    }

    if (activeStatuses.has(entry.status) && !entry.last_verified) {
      fail(`${entry.path} mangler last_verified`);
    }

    if (entry.status === "historical" && !entry.historical_reason && !(entry.superseded_by?.length)) {
      fail(`${entry.path} er historical uten historical_reason eller superseded_by`);
    }

    for (const replacement of entry.superseded_by ?? []) {
      if (!repoPathExists(replacement)) {
        fail(`${entry.path} peker til manglende superseded_by: ${replacement}`);
      }
    }

    if (entry.status === "canonical" || entry.status === "transitional") {
      for (const ownedArea of entry.owns) {
        const previous = owners.get(ownedArea);
        if (previous) {
          fail(`Parallell sannhet for '${ownedArea}': ${previous} og ${entry.path}`);
        } else {
          owners.set(ownedArea, entry.path);
        }
      }
    }

    const name = entry.path.split("/").at(-1) ?? entry.path;
    if (name.endsWith(".")) {
      fail(`Registrert dokument har filnavn som ender med punktum: ${entry.path}`);
    }
    if (!extname(name) && name !== "AGENTS" && name !== "README") {
      warn(`Registrert dokument uten filendelse: ${entry.path}`);
    }
  }

  for (const priorityPath of registry.priority_order ?? []) {
    if (!seenPaths.has(priorityPath)) {
      fail(`priority_order peker til uregistrert dokument: ${priorityPath}`);
    }
  }
}

function extractMarkdownLinks(markdown: string): string[] {
  const links: string[] = [];
  const linkPattern = /!?(?:\[[^\]]*\])\(([^)]+)\)/g;
  for (const match of markdown.matchAll(linkPattern)) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    const target = raw.startsWith("<") && raw.endsWith(">") ? raw.slice(1, -1) : raw;
    links.push(target.split(/\s+["']/u)[0] ?? target);
  }
  return links;
}

function localLinkTarget(sourcePath: string, rawTarget: string): string | null {
  if (
    rawTarget.startsWith("#") ||
    rawTarget.startsWith("http://") ||
    rawTarget.startsWith("https://") ||
    rawTarget.startsWith("mailto:") ||
    rawTarget.startsWith("tel:") ||
    rawTarget.startsWith("data:") ||
    rawTarget.includes("${{")
  ) {
    return null;
  }

  const withoutFragment = rawTarget.split("#", 1)[0]?.split("?", 1)[0] ?? "";
  if (!withoutFragment) return null;

  let decoded = withoutFragment;
  try {
    decoded = decodeURIComponent(withoutFragment);
  } catch {
    fail(`${sourcePath} har ugyldig URL-koding i lenke: ${rawTarget}`);
  }

  if (isAbsolute(decoded) || decoded.startsWith("/")) {
    return normalize(decoded.replace(/^\/+/, "")).split(sep).join("/");
  }

  return normalize(
    resolve(dirname(resolve(repoRoot, sourcePath)), decoded).slice(repoRoot.length + 1),
  ).split(sep).join("/");
}

function validateEntryLinks(sourcePaths: string[]): void {
  for (const sourcePath of sourcePaths) {
    const absoluteSource = resolve(repoRoot, sourcePath);
    if (!existsSync(absoluteSource)) {
      fail(`Mangler inngangsdokument for lenkekontroll: ${sourcePath}`);
      continue;
    }

    const markdown = readFileSync(absoluteSource, "utf8");
    for (const rawTarget of extractMarkdownLinks(markdown)) {
      const target = localLinkTarget(sourcePath, rawTarget);
      if (!target) continue;
      const absoluteTarget = resolve(repoRoot, target);
      if (!absoluteTarget.startsWith(repoRoot)) {
        fail(`${sourcePath} peker utenfor repoet: ${rawTarget}`);
        continue;
      }
      if (!existsSync(absoluteTarget)) {
        fail(`Brutt lokal lenke i ${sourcePath}: ${rawTarget} -> ${target}`);
      }
    }
  }
}

function validateDocumentationIndex(registry: DocumentationRegistry): void {
  const indexPath = resolve(repoRoot, "docs/README.md");
  const index = readFileSync(indexPath, "utf8");

  for (const entry of registry.documents) {
    if (entry.status !== "canonical" && entry.status !== "transitional") continue;
    const name = entry.path.split("/").at(-1) ?? entry.path;
    if (!index.includes(entry.path) && !index.includes(name)) {
      fail(`docs/README.md omtaler ikke aktivt dokument: ${entry.path}`);
    }
  }
}

function validateNoDirectoryEntries(registry: DocumentationRegistry): void {
  for (const entry of registry.documents) {
    const absolute = resolve(repoRoot, entry.path);
    if (existsSync(absolute) && statSync(absolute).isDirectory()) {
      fail(`Dokumentregisteret peker til mappe, ikke fil: ${entry.path}`);
    }
  }
}

function isDocumentationLike(relativePath: string): boolean {
  const name = basename(relativePath);
  const lower = name.toLowerCase();
  const extension = extname(lower);

  if (extension === ".md" || extension === ".mdx") return true;
  if (lower.includes("readme")) return true;

  return /(?:^|[_-])(docs?|documentation|changelog|status|roadmap|plan|audit|contract|architecture|migration)(?:[_\-.]|$)/i.test(name);
}

function collectDocumentationFiles(directory: string, result: string[] = []): string[] {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      collectDocumentationFiles(absolute, result);
      continue;
    }

    const relativePath = toRepoPath(absolute);
    if (isDocumentationLike(relativePath)) result.push(relativePath);
  }

  return result;
}

function locationBucket(path: string): string {
  if (!path.includes("/")) return "root";
  if (path.startsWith("README/")) return "README";
  if (path.startsWith("docs/")) return "docs";
  if (path.startsWith("reports/")) return "reports";
  if (path.startsWith("data/")) return "data-local";
  if (path.startsWith("js/")) return "code-local";
  if (path.startsWith("backend/")) return "backend-local";
  if (path.startsWith(".github/")) return "github";
  return "other";
}

function suspiciousFilename(path: string): boolean {
  const name = basename(path);
  const lower = name.toLowerCase();
  return (
    name.endsWith(".") ||
    !extname(name) ||
    /rradme|readmmee|documeash|\s\(\d+\)/i.test(name) ||
    (lower.includes("readme") && !lower.endsWith(".md") && !lower.endsWith(".mdx"))
  );
}

function normalizedBasename(path: string): string {
  return basename(path)
    .replace(/\.(md|mdx)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9æøå]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function findActiveHistoricalLinks(registry: DocumentationRegistry): HistoricalLink[] {
  const byPath = new Map(registry.documents.map((entry) => [entry.path, entry]));
  const links: HistoricalLink[] = [];

  for (const source of registry.documents) {
    if (!activeStatuses.has(source.status) || !repoPathExists(source.path)) continue;
    if (extname(source.path).toLowerCase() !== ".md") continue;

    const markdown = readFileSync(resolve(repoRoot, source.path), "utf8");
    for (const rawTarget of extractMarkdownLinks(markdown)) {
      const target = localLinkTarget(source.path, rawTarget);
      if (!target) continue;
      const targetEntry = byPath.get(target);
      if (targetEntry?.status !== "historical") continue;

      links.push({
        source: source.path,
        target,
        target_status: targetEntry.status,
      });
    }
  }

  const unique = new Map(links.map((link) => [`${link.source}\n${link.target}`, link]));
  return [...unique.values()].sort((a, b) =>
    `${a.source}:${a.target}`.localeCompare(`${b.source}:${b.target}`),
  );
}

function buildInventory(registry: DocumentationRegistry): DocumentationInventory {
  const documentationFiles = collectDocumentationFiles(repoRoot).sort();
  const registeredPaths = new Set(registry.documents.map((entry) => entry.path));
  const suspiciousFiles = documentationFiles.filter(suspiciousFilename);
  const activeHistoricalLinks = findActiveHistoricalLinks(registry);
  const byLocation: Record<string, number> = {};
  const basenameGroups = new Map<string, string[]>();

  for (const path of documentationFiles) {
    const bucket = locationBucket(path);
    byLocation[bucket] = (byLocation[bucket] ?? 0) + 1;

    const normalizedName = normalizedBasename(path);
    if (!normalizedName) continue;
    const group = basenameGroups.get(normalizedName) ?? [];
    group.push(path);
    basenameGroups.set(normalizedName, group);
  }

  const duplicateBasenames: Record<string, string[]> = {};
  for (const [name, paths] of [...basenameGroups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (paths.length < 2) continue;
    duplicateBasenames[name] = paths.sort();
  }

  const unregisteredGovernanceCandidates = documentationFiles.filter(
    (path) =>
      !registeredPaths.has(path) &&
      (!path.includes("/") || path.startsWith("README/") || path.startsWith("docs/")),
  );

  return {
    generated_at: new Date().toISOString(),
    totals: {
      documentation_like_files: documentationFiles.length,
      registered_files: registry.documents.length,
      unregistered_governance_candidates: unregisteredGovernanceCandidates.length,
      suspicious_filenames: suspiciousFiles.length,
      active_links_to_historical_documents: activeHistoricalLinks.length,
      duplicate_basename_groups: Object.keys(duplicateBasenames).length,
    },
    by_location: Object.fromEntries(
      Object.entries(byLocation).sort(([a], [b]) => a.localeCompare(b)),
    ),
    suspicious_files: suspiciousFiles,
    active_links_to_historical_documents: activeHistoricalLinks,
    unregistered_governance_candidates: unregisteredGovernanceCandidates,
    duplicate_basenames: duplicateBasenames,
  };
}

function writeInventory(inventory: DocumentationInventory): void {
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(
    resolve(reportDir, "inventory.json"),
    `${JSON.stringify(inventory, null, 2)}\n`,
    "utf8",
  );
}

const registry = parseRegistry();
validateRegistry(registry);
validateNoDirectoryEntries(registry);
validateEntryLinks(["README.md", "DOCS.md", "docs/README.md", "AGENTS.md"]);
validateDocumentationIndex(registry);

const inventory = buildInventory(registry);
writeInventory(inventory);

for (const link of inventory.active_links_to_historical_documents) {
  warn(`Aktivt dokument lenker til historisk snapshot: ${link.source} -> ${link.target}`);
}

console.log(
  `Documentation inventory: ${inventory.totals.documentation_like_files} dokumentlignende filer, ` +
    `${inventory.totals.registered_files} registrert, ` +
    `${inventory.totals.unregistered_governance_candidates} uregistrerte globale kandidater, ` +
    `${inventory.totals.suspicious_filenames} mistenkelige filnavn.`,
);

for (const message of warnings) {
  console.warn(`DOCS WARNING: ${message}`);
}

if (failures.length > 0) {
  for (const message of failures) {
    console.error(`DOCS ERROR: ${message}`);
  }
  console.error(`Documentation governance feilet med ${failures.length} feil.`);
  process.exit(1);
}

console.log(`Documentation governance OK: ${registry.documents.length} registrerte dokumenter.`);
