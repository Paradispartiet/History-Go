#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, 'data');
const PLACES_ROOT = path.join(DATA_ROOT, 'places');
const MANIFEST_PATH = path.join(PLACES_ROOT, 'manifest.json');
const AUDIT_PATH = path.join(ROOT, 'reports/place-split-manifest-category-move-audit.json');
const CLEANUP_REPORT_PATH = path.join(ROOT, 'reports/place_split_manifest_category_move_cleanup_report.json');
const WRITE = process.argv.includes('--write');

type Obj = Record<string, any>;
type Place = Obj & { id?: string; category?: string; name?: string };
type ManifestRecord = {
  manifestEntry: string;
  manifestFullPath: string;
  splitManifestPath?: string;
  splitIndexPath?: string;
  aggregatePlaces: Place[];
  splitRows: Obj[];
};

function rel(p: string): string { return path.relative(ROOT, p).split(path.sep).join('/'); }
function dataRel(p: string): string { return path.relative(DATA_ROOT, p).split(path.sep).join('/'); }
function readJson(p: string): any { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p: string, data: any): void { fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`); }
function exists(p: string): boolean { return fs.existsSync(p); }
function sha256(p: string): string { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }
function splitManifestPathFor(sourcePath: string): string { const parsed = path.parse(sourcePath); return path.join(parsed.dir, `${parsed.name}_manifest${parsed.ext || '.json'}`); }
function splitIndexPathFor(sourcePath: string): string { const parsed = path.parse(sourcePath); return path.join(parsed.dir, `${parsed.name}_index${parsed.ext || '.json'}`); }
function isObject(v: any): v is Obj { return !!v && typeof v === 'object' && !Array.isArray(v); }
function placesFrom(data: any): Place[] {
  if (Array.isArray(data)) return data.filter(isObject);
  if (isObject(data) && Array.isArray(data.places)) return data.places.filter(isObject);
  if (isObject(data) && typeof data.id === 'string') return [data];
  return [];
}
function categoryFromDataRel(file: string): string { return file.split('/')[1] || ''; }

const manifest = readJson(MANIFEST_PATH);
const files = Array.isArray(manifest.files) ? manifest.files.map((f: any) => String(f).trim()).filter(Boolean) : [];
const records: ManifestRecord[] = [];

for (const manifestEntry of files) {
  const manifestFullPath = path.join(DATA_ROOT, manifestEntry);
  const aggregatePlaces = placesFrom(readJson(manifestFullPath));
  const smp = splitManifestPathFor(manifestFullPath);
  const splitManifestPath = exists(smp) ? smp : undefined;
  const sip = splitIndexPathFor(manifestFullPath);
  const splitIndexPath = exists(sip) ? sip : undefined;
  let splitRows: Obj[] = [];
  if (splitManifestPath) {
    const sm = readJson(splitManifestPath);
    if (isObject(sm) && Array.isArray(sm.places)) splitRows = sm.places.filter(isObject);
  }
  records.push({ manifestEntry, manifestFullPath, splitManifestPath, splitIndexPath, aggregatePlaces, splitRows });
}

const healthActive = new Map<string, { place: Place; sourceFile: string; manifestEntry: string; category: string }[]>();
for (const rec of records) {
  for (const place of rec.aggregatePlaces) {
    if (!place.id) continue;
    const sourceFile = rec.manifestEntry;
    const arr = healthActive.get(place.id) || [];
    arr.push({ place, sourceFile, manifestEntry: rec.manifestEntry, category: String(place.category || categoryFromDataRel(sourceFile)) });
    healthActive.set(place.id, arr);
  }
}

const generatorActive = new Map<string, { place: Place; sourceFile: string; manifestEntry: string; category: string }[]>();
for (const rec of records) {
  if (rec.splitManifestPath) {
    const dir = path.dirname(rec.splitManifestPath);
    for (const row of rec.splitRows) {
      if (typeof row.file !== 'string' || !row.file.trim()) continue;
      const childPath = path.join(dir, row.file.trim());
      if (!exists(childPath)) continue;
      for (const place of placesFrom(readJson(childPath))) {
        if (!place.id) continue;
        const sourceFile = dataRel(childPath);
        const arr = generatorActive.get(place.id) || [];
        arr.push({ place, sourceFile, manifestEntry: rec.manifestEntry, category: String(place.category || row.category || categoryFromDataRel(sourceFile)) });
        generatorActive.set(place.id, arr);
      }
    }
  } else {
    for (const place of rec.aggregatePlaces) {
      if (!place.id) continue;
      const sourceFile = rec.manifestEntry;
      const arr = generatorActive.get(place.id) || [];
      arr.push({ place, sourceFile, manifestEntry: rec.manifestEntry, category: String(place.category || categoryFromDataRel(sourceFile)) });
      generatorActive.set(place.id, arr);
    }
  }
}

function canonicalFor(id: string, oldManifestEntry: string, oldCategory: string) {
  const choices = (healthActive.get(id) || []).filter((s) => s.manifestEntry !== oldManifestEntry && s.category !== oldCategory);
  return choices[0] || null;
}

const auditById = new Map<string, Obj>();
const duplicateActivePlaceIds = [...generatorActive.entries()].filter(([, v]) => v.length > 1).length;
let staleSplitManifestRows = 0;
let splitRowsMissingFromAggregate = 0;
let aggregateRowsMissingFromSplitManifest = 0;
let movedPlacesStillActiveInOldCategory = 0;
const touchedIds = new Set<string>();

for (const rec of records) {
  if (!rec.splitManifestPath) continue;
  const aggregateIds = new Set(rec.aggregatePlaces.map((p) => p.id).filter(Boolean));
  const splitIds = new Set(rec.splitRows.map((row) => String(row.id || '').trim()).filter(Boolean));
  const oldCategory = categoryFromDataRel(rec.manifestEntry);

  for (const row of rec.splitRows) {
    const id = String(row.id || '').trim();
    if (!id) continue;
    const missing = !aggregateIds.has(id);
    const oldGen = (generatorActive.get(id) || []).find((s) => s.manifestEntry === rec.manifestEntry);
    const canonical = canonicalFor(id, rec.manifestEntry, oldCategory);
    if (missing) splitRowsMissingFromAggregate += 1;
    if (missing && canonical) staleSplitManifestRows += 1;
    if (oldGen && canonical) movedPlacesStillActiveInOldCategory += 1;
    if (canonical || missing) {
      const child = typeof row.file === 'string' ? dataRel(path.join(path.dirname(rec.splitManifestPath), row.file)) : null;
      auditById.set(id, {
        placeId: id,
        oldAggregate: rec.manifestEntry,
        oldSplitChild: child,
        oldSplitManifestEntry: rel(rec.splitManifestPath),
        newCanonicalFile: canonical?.sourceFile || null,
        oldCategory,
        newCategory: canonical?.category || null,
        activeSourceInGenerator: (generatorActive.get(id) || []).map((s) => s.sourceFile),
        activeSourceInHealthPlaces: (healthActive.get(id) || []).map((s) => s.sourceFile),
        recommendedAction: canonical ? 'remove old aggregate/split-manifest/split-index row and delete obsolete split child' : 'inspect missing split-manifest row without canonical replacement'
      });
    }
  }

  for (const place of rec.aggregatePlaces) {
    const id = String(place.id || '').trim();
    if (!id) continue;
    const canonical = canonicalFor(id, rec.manifestEntry, oldCategory);
    const missingFromSplit = !splitIds.has(id);

    if (missingFromSplit) {
      aggregateRowsMissingFromSplitManifest += 1;
      if (!canonical) {
        auditById.set(id, {
          placeId: id,
          oldAggregate: rec.manifestEntry,
          oldSplitChild: null,
          oldSplitManifestEntry: rel(rec.splitManifestPath),
          newCanonicalFile: null,
          oldCategory,
          newCategory: null,
          activeSourceInGenerator: (generatorActive.get(id) || []).map((s) => s.sourceFile),
          activeSourceInHealthPlaces: (healthActive.get(id) || []).map((s) => s.sourceFile),
          recommendedAction: 'add the active aggregate record to the sibling split manifest/index and create or restore its split child; do not delete the aggregate record'
        });
      }
    }

    if (canonical) {
      movedPlacesStillActiveInOldCategory += 1;
      auditById.set(id, {
        placeId: id,
        oldAggregate: rec.manifestEntry,
        oldSplitChild: null,
        oldSplitManifestEntry: rec.splitManifestPath ? rel(rec.splitManifestPath) : null,
        newCanonicalFile: canonical.sourceFile,
        oldCategory,
        newCategory: canonical.category,
        activeSourceInGenerator: (generatorActive.get(id) || []).map((s) => s.sourceFile),
        activeSourceInHealthPlaces: (healthActive.get(id) || []).map((s) => s.sourceFile),
        recommendedAction: 'remove moved row from old aggregate and related split files'
      });
    }
  }
}

const before = {
  duplicateActivePlaceIds,
  staleSplitManifestRows,
  splitRowsMissingFromAggregate,
  aggregateRowsMissingFromSplitManifest,
  movedPlacesStillActiveInOldCategory
};
fs.mkdirSync(path.dirname(AUDIT_PATH), { recursive: true });
if (auditById.size > 0 || !exists(AUDIT_PATH)) {
  writeJson(AUDIT_PATH, { generatedAt: new Date().toISOString(), before, places: [...auditById.values()].sort((a,b)=>a.placeId.localeCompare(b.placeId)) });
}

const changedAggregates = new Set<string>();
const changedManifests = new Set<string>();
const changedIndexes = new Set<string>();
const deletedChildren: string[] = [];

if (WRITE) {
  for (const rec of records) {
    if (!rec.splitManifestPath) continue;
    const oldCategory = categoryFromDataRel(rec.manifestEntry);
    const removeIds = new Set<string>();
    for (const row of rec.splitRows) {
      const id = String(row.id || '').trim();
      if (id && (canonicalFor(id, rec.manifestEntry, oldCategory) || !new Set(rec.aggregatePlaces.map((p) => p.id).filter(Boolean)).has(id))) removeIds.add(id);
    }
    for (const place of rec.aggregatePlaces) {
      const id = String(place.id || '').trim();
      if (id && canonicalFor(id, rec.manifestEntry, oldCategory)) removeIds.add(id);
    }
    if (!removeIds.size) continue;
    for (const id of removeIds) touchedIds.add(id);
    const newAgg = rec.aggregatePlaces.filter((p) => !removeIds.has(String(p.id || '').trim()));
    if (newAgg.length !== rec.aggregatePlaces.length) { writeJson(rec.manifestFullPath, newAgg); changedAggregates.add(rec.manifestEntry); }
    const sm = readJson(rec.splitManifestPath);
    const oldRows = Array.isArray(sm.places) ? sm.places : [];
    const removedRows = oldRows.filter((r: Obj) => removeIds.has(String(r.id || '').trim()));
    sm.places = oldRows.filter((r: Obj) => !removeIds.has(String(r.id || '').trim())).map((r: Obj, order: number) => ({ ...r, order }));
    sm.place_count = sm.places.length;
    sm.source_sha256 = sha256(rec.manifestFullPath);
    for (const r of sm.places) {
      if (typeof r.file === 'string') {
        const cp = path.join(path.dirname(rec.splitManifestPath), r.file);
        if (exists(cp)) r.sha256 = sha256(cp);
      }
    }
    writeJson(rec.splitManifestPath, sm); changedManifests.add(rel(rec.splitManifestPath));
    if (rec.splitIndexPath) {
      const idx = readJson(rec.splitIndexPath);
      if (Array.isArray(idx)) { const n = idx.filter((r: Obj) => !removeIds.has(String(r.id || '').trim())); writeJson(rec.splitIndexPath, n); changedIndexes.add(rel(rec.splitIndexPath)); }
    }
    for (const r of removedRows) {
      if (typeof r.file === 'string') {
        const cp = path.join(path.dirname(rec.splitManifestPath), r.file);
        const dr = dataRel(cp);
        const stillRef = records.some((other) => other !== rec && other.splitRows.some((orow) => other.splitManifestPath && dataRel(path.join(path.dirname(other.splitManifestPath), String(orow.file || ''))) === dr));
        if (exists(cp) && !stillRef) { fs.unlinkSync(cp); deletedChildren.push(dr); }
      }
    }
  }
  const afterRun = JSON.parse(execFileSync(process.execPath, [new URL(import.meta.url).pathname], { cwd: ROOT, encoding: 'utf8' }).trim() || '{}');
  writeJson(CLEANUP_REPORT_PATH, {
    status: 'applied',
    diagnosis: { indexGeneratorUsesSplitManifests: true, healthPlacesUsesAggregateEntries: true, blindIndexRebuildWouldCreateDuplicates: true },
    before,
    placesFixed: [...touchedIds].sort(),
    aggregateFilesChanged: [...changedAggregates].sort(),
    splitManifestsChanged: [...changedManifests].sort(),
    splitIndexesChanged: [...changedIndexes].sort(),
    obsoleteSplitChildFilesDeleted: deletedChildren.sort(),
    canonicalReplacementFilesChanged: false,
    placeContentChanged: false,
    peopleDataChanged: false,
    quizDataChanged: false,
    civicationDataChanged: false,
    after: afterRun.counts,
    validation: { placesIndexBuildStatus: 'pending', placesIndexCheckStatus: 'pending', healthPlacesStatus: 'pending', coordinateIntakeStatus: 'pending', peopleAuditStatus: 'pending', quizManifestV2AuditStatus: 'pending', toolsCheckStatus: 'pending' },
    notes: []
  });
}

const counts = WRITE ? undefined : before;
const out = {
  status: before.duplicateActivePlaceIds || before.staleSplitManifestRows || before.splitRowsMissingFromAggregate || before.aggregateRowsMissingFromSplitManifest || before.movedPlacesStillActiveInOldCategory ? 'failed' : 'passed',
  counts: before,
  auditReport: rel(AUDIT_PATH)
};
console.log(JSON.stringify(out, null, 2));
if (!WRITE && out.status !== 'passed') process.exit(1);
