import { readFile, writeFile, mkdir, rename, rm, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

const ROOT = () => process.cwd();
const PEOPLE_DIR = () => path.join(ROOT(), 'data', 'people');
const MANIFEST = () => path.join(PEOPLE_DIR(), 'manifest.json');
const CANDIDATES = () => path.join(PEOPLE_DIR(), 'people_image_candidates.json');
const ATTRIBUTIONS = () => path.join(PEOPLE_DIR(), 'people_image_attributions.json');
const IMAGE_DIR = () => path.join(ROOT(), 'bilder', 'kort', 'people');
const UA = 'History-Go people-image-rights-pipeline/1.0 (https://github.com/Paradispartiet/History-Go; contact: maintainers)';

type Person = Record<string, unknown> & { id?: string; name?: string; image?: string; cardImage?: string; wikidataId?: string; imageMeta?: Record<string, unknown> };
type Entry = { file: string; abs: string; index: number | null; person: Person; container: unknown; mode: 'array' | 'people' | 'single' };
type Candidate = { personId: string; personName: string; sourceFile: string; personIndex: number | null; pointer: string; wikidataId: string; commonsFileName: string; originalImageUrl: string; commonsPage: string; creator: string; credit: string; license: string; licenseUrl: string; width: number; height: number; approved: boolean; reason: string; score: number };

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const reqStr = (v: unknown) => typeof v === 'string' && v.trim() ? v.trim() : '';

export function isAllowedLicense(license: unknown): boolean {
  const l = reqStr(license).toLowerCase().replace(/[_-]/g, ' ');
  if (!l) return false;
  if (/(^|\b)(nc|noncommercial|non commercial|nd|no derivatives|no derivative)(\b|$)/.test(l)) return false;
  if (/all rights reserved|editorial|unknown|copyrighted|fair use/.test(l)) return false;
  return /public domain|\bpd\b|\bcc0\b|cc by(?!.*\b(?:nc|nd)\b)|creative commons attribution(?!.*noncommercial|.*no derivatives)/.test(l);
}

function assertCommonsUrl(u: string): void {
  const url = new URL(u);
  if (!/^(upload\.wikimedia\.org|commons\.wikimedia\.org)$/.test(url.hostname)) throw new Error(`Image URL is not Wikimedia Commons: ${u}`);
}
function safeId(id: string): string { const s = id.toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, ''); if (!s) throw new Error('Unsafe empty person id'); return s; }
function manifestPathToAbs(p: string): string {
  if (!p.startsWith('people/') || p.includes('\0')) throw new Error(`Manifest path must start with people/: ${p}`);
  const abs = path.resolve(PEOPLE_DIR(), p.slice('people/'.length));
  const rel = path.relative(PEOPLE_DIR(), abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`Manifest path escapes data/people: ${p}`);
  return abs;
}
async function exists(p: string): Promise<boolean> { try { await access(p); return true; } catch { return false; } }
async function readJson(p: string): Promise<unknown> { return JSON.parse(await readFile(p, 'utf8')); }
async function writeJsonAtomic(p: string, v: unknown): Promise<void> { const tmp = `${p}.${process.pid}.tmp`; await writeFile(tmp, `${JSON.stringify(v, null, 2)}\n`); await rename(tmp, p); }

export async function loadPeople(): Promise<Entry[]> {
  const manifest = await readJson(MANIFEST());
  const files = Array.isArray((manifest as any).files) ? (manifest as any).files : [];
  const out: Entry[] = [];
  for (const f of files) {
    if (typeof f !== 'string') continue;
    const abs = manifestPathToAbs(f); if (!(await exists(abs))) continue;
    const json = await readJson(abs);
    const push = (p: unknown, i: number | null, mode: Entry['mode']) => { if (isObj(p)) out.push({ file: `data/people/${f.slice('people/'.length)}`, abs, index: i, person: p as Person, container: json, mode }); };
    if (Array.isArray(json)) json.forEach((p, i) => push(p, i, 'array'));
    else if (isObj(json) && Array.isArray(json.people)) json.people.forEach((p, i) => push(p, i, 'people'));
    else push(json, null, 'single');
  }
  return out;
}

async function wikidataSearch(name: string, fetcher: Fetcher): Promise<string> {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=1&search=${encodeURIComponent(name)}`;
  const j: any = await (await fetcher(url, { headers: { 'User-Agent': UA } })).json();
  return j.search?.[0]?.id || '';
}
async function wikidataP18(qid: string, fetcher: Fetcher): Promise<string> {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(qid)}.json`;
  const j: any = await (await fetcher(url, { headers: { 'User-Agent': UA } })).json();
  return j.entities?.[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value || '';
}
async function commonsMeta(file: string, fetcher: Fetcher): Promise<any> {
  const title = file.startsWith('File:') ? file : `File:${file}`;
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|mime|size|extmetadata&titles=${encodeURIComponent(title)}`;
  const j: any = await (await fetcher(url, { headers: { 'User-Agent': UA } })).json();
  const page = Object.values(j.query?.pages || {})[0] as any; return page?.imageinfo?.[0];
}
function cleanHtml(s: unknown): string { return reqStr(s).replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'); }
function candidateFromMeta(e: Entry, qid: string, file: string, info: any): Candidate | null {
  const ext = info?.extmetadata || {}; const license = cleanHtml(ext.LicenseShortName?.value || ext.UsageTerms?.value);
  const url = reqStr(info?.url); if (!url || !isAllowedLicense(license)) return null;
  try { assertCommonsUrl(url); } catch { return null; }
  const commons = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/^File:/, '').replace(/ /g, '_'))}`;
  return { personId: reqStr(e.person.id), personName: reqStr(e.person.name), sourceFile: e.file, personIndex: e.index, pointer: e.index === null ? '/' : `/${e.index}`, wikidataId: qid, commonsFileName: file.replace(/^File:/, ''), originalImageUrl: url, commonsPage: commons, creator: cleanHtml(ext.Artist?.value || ext.Credit?.value), credit: cleanHtml(ext.Credit?.value || ext.Attribution?.value || ext.Artist?.value), license, licenseUrl: reqStr(ext.LicenseUrl?.value), width: Number(info.width || 0), height: Number(info.height || 0), approved: false, reason: 'Wikidata P18 image with Commons metadata and allowed license', score: 100 };
}
export async function buildCandidates(args: string[], fetcher: Fetcher = fetch): Promise<void> {
  const limit = Number((args.find(a => a.startsWith('--limit=')) || '--limit=25').split('=')[1]); const idsArg = args.find(a => a.startsWith('--ids=')); const ids = idsArg ? new Set(idsArg.split('=')[1].split(',').filter(Boolean)) : null; const include = args.includes('--include-existing');
  const entries = (await loadPeople()).filter(e => reqStr(e.person.id) && reqStr(e.person.name) && (include || !reqStr(e.person.image)) && (!ids || ids.has(reqStr(e.person.id))));
  const candidates: Candidate[] = [];
  const maxAttempts = Math.min(entries.length, Math.max(limit * 20, limit));
  let consecutiveFailures = 0;
  for (const e of entries.slice(0, maxAttempts)) { if (candidates.length >= limit) break; try { const qid = reqStr(e.person.wikidataId) || await wikidataSearch(reqStr(e.person.name), fetcher); if (!qid) continue; await sleep(120); const file = await wikidataP18(qid, fetcher); if (!file) continue; await sleep(120); const meta = await commonsMeta(file, fetcher); const c = candidateFromMeta(e, qid, file, meta); if (c) candidates.push(c); consecutiveFailures = 0; } catch (err) { consecutiveFailures++; console.warn(`Skipping ${e.person.id}: ${(err as Error).message}`); if (consecutiveFailures >= 10) { console.warn('Stopping candidate fetch after 10 consecutive failures; check network access.'); break; } } }
  await writeJsonAtomic(CANDIDATES(), candidates); console.log(`Wrote ${candidates.length} candidates to ${path.relative(ROOT(), CANDIDATES())}`);
}
function validateCandidate(c: any): asserts c is Candidate {
  for (const k of ['personId','personName','sourceFile','wikidataId','commonsFileName','originalImageUrl','commonsPage','creator','credit','license','licenseUrl']) if (!reqStr(c[k])) throw new Error(`Candidate missing ${k}`);
  if (c.approved !== true) throw new Error(`Candidate ${c.personId} is not manually approved`); if (!isAllowedLicense(c.license)) throw new Error(`Candidate ${c.personId} has disallowed license: ${c.license}`); assertCommonsUrl(c.originalImageUrl); if (!c.commonsPage.startsWith('https://commons.wikimedia.org/wiki/File:')) throw new Error('Invalid Commons page');
}
function extFromMime(mime: string): string { if (mime.includes('png')) return '.png'; if (mime.includes('webp')) return '.webp'; if (mime.includes('gif')) return '.gif'; return '.jpg'; }
async function download(url: string, destBase: string, fetcher: Fetcher): Promise<string> { const res = await fetcher(url, { headers: { 'User-Agent': UA } }); if (!res.ok || !res.body) throw new Error(`Download failed ${res.status}`); const ext = extFromMime(res.headers.get('content-type') || 'image/jpeg'); const dest = destBase + ext; if (await exists(dest)) throw new Error(`Refusing to overwrite existing image: ${dest}`); const tmp = `${dest}.${process.pid}.tmp`; try { await pipeline(res.body as any, createWriteStream(tmp, { flags: 'wx' })); await rename(tmp, dest); return path.relative(ROOT(), dest).replace(/\\/g, '/'); } catch (e) { await rm(tmp, { force: true }); throw e; } }
async function regenerateAttributions(entries: Entry[], write: boolean): Promise<void> { const rows = entries.filter(e => reqStr(e.person.image) && isObj(e.person.imageMeta)).map(e => ({ personId: reqStr(e.person.id), name: reqStr(e.person.name), file: reqStr(e.person.image), source: reqStr(e.person.imageMeta?.source), sourcePage: reqStr(e.person.imageMeta?.sourcePage), creator: reqStr(e.person.imageMeta?.creator), credit: reqStr(e.person.imageMeta?.credit), license: reqStr(e.person.imageMeta?.license), licenseUrl: reqStr(e.person.imageMeta?.licenseUrl) })).filter(r => r.source === 'wikimedia_commons').sort((a,b) => a.personId.localeCompare(b.personId) || a.file.localeCompare(b.file)); const unique = Array.from(new Map(rows.map(r => [`${r.personId}\0${r.file}`, r])).values()); if (write) await writeJsonAtomic(ATTRIBUTIONS(), unique); }
export async function applyCandidates(args: string[], fetcher: Fetcher = fetch): Promise<void> { const write = args.includes('--write'); const candidates = (await readJson(CANDIDATES()) as any[]); const entries = await loadPeople(); const byFile = new Set(entries.map(e => e.file)); const changed = new Set<string>(); await mkdir(IMAGE_DIR(), { recursive: true }); for (const c of candidates) { validateCandidate(c); if (!byFile.has(c.sourceFile)) throw new Error(`Candidate source not in manifest: ${c.sourceFile}`); const matches = entries.filter(e => e.file === c.sourceFile && reqStr(e.person.id) === c.personId && (c.personIndex === null || e.index === c.personIndex)); if (matches.length !== 1) throw new Error(`Candidate ${c.personId} did not match exactly one person`); if (!write) { console.log(`[dry-run] would apply ${c.personId}`); continue; } const e = matches[0]; const local = await download(c.originalImageUrl, path.join(IMAGE_DIR(), safeId(c.personId)), fetcher); e.person.image = local; e.person.cardImage = local; e.person.wikidataId = c.wikidataId; e.person.imageMeta = { source: 'wikimedia_commons', sourcePage: c.commonsPage, creator: c.creator, credit: c.credit, license: c.license, licenseUrl: c.licenseUrl, retrievedAt: new Date().toISOString().slice(0,10), reviewStatus: 'manually_approved' }; changed.add(e.abs); }
  if (write) { for (const abs of changed) { const entry = entries.find(e => e.abs === abs)!; await writeJsonAtomic(abs, entry.container); } await regenerateAttributions(await loadPeople(), true); } else await regenerateAttributions(entries, false); }
export async function auditPeople(): Promise<number> { const entries = await loadPeople(); let external = 0, noMeta = 0, badLic = 0, missing = 0; const files = new Map<string,string[]>(); for (const e of entries) { const img = reqStr(e.person.image); if (!img) continue; if (/^https?:/.test(img)) external++; else { files.set(img, [...(files.get(img) || []), reqStr(e.person.id)]); if (!(await exists(path.join(ROOT(), img)))) missing++; } if (!isObj(e.person.imageMeta)) noMeta++; else if (!isAllowedLicense(e.person.imageMeta.license)) badLic++; } const dup = [...files.values()].filter(v => v.length > 1).length; const noImage = entries.filter(e => !reqStr(e.person.image)).length; console.log(JSON.stringify({ totalPeople: entries.length, peopleWithoutImage: noImage, externalImageUrls: external, localImagesWithoutImageMeta: noMeta, unknownOrDisallowedLicenses: badLic, missingLocalImageFiles: missing, duplicateOrCollidingImageFiles: dup }, null, 2)); return external || noMeta || badLic || missing || dup ? 1 : 0; }
async function main() { const [cmd, ...args] = process.argv.slice(2); if (cmd === 'candidates') await buildCandidates(args); else if (cmd === 'apply') await applyCandidates(args); else if (cmd === 'audit') process.exitCode = await auditPeople(); else { console.error('Usage: people-image-pipeline <candidates|apply|audit>'); process.exitCode = 2; } }
if (import.meta.url === `file://${process.argv[1]}`) main().catch(e => { console.error(e); process.exit(1); });
