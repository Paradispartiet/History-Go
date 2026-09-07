#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const stable = value => {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
};
const canon = value => JSON.stringify(stable(value));
const equal = (a, b) => canon(a) === canon(b);
const plain = value => value && typeof value === 'object' && !Array.isArray(value);

function showJson(ref, file) {
  return JSON.parse(execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
}

function mergeShared(oldBase, finalRef, files) {
  const identityCandidates = ['id','key','path','file','filename','place_id','placeId','slug','name','target','quiz_file','quizFile','value'];
  const identity = (item, path) => {
    if (!plain(item)) return `$value:${canon(item)}`;
    if (path.endsWith('.sets') && typeof item.targetId === 'string' && item.targetId.trim() && typeof item.file === 'string' && item.file.trim()) {
      return `targetId:${item.targetId.trim()}|file:${item.file.trim()}`;
    }
    for (const key of identityCandidates) {
      const value = item[key];
      if (typeof value === 'string' && value.trim()) return `${key}:${value.trim()}`;
      if (typeof value === 'number' || typeof value === 'boolean') return `${key}:${String(value)}`;
    }
    return `$value:${canon(item)}`;
  };
  const toUniqueMap = (values, path) => {
    const map = new Map();
    for (const item of values) {
      const key = identity(item, path);
      if (map.has(key)) throw new Error(`duplicate array identity at ${path}: ${key}`);
      map.set(key, item);
    }
    return map;
  };
  const mergeValue = (base, ours, theirs, path) => {
    if (equal(theirs, base)) return ours;
    if (equal(ours, base)) return theirs;
    if (equal(ours, theirs)) return ours;
    if (Array.isArray(base) && Array.isArray(ours) && Array.isArray(theirs)) {
      const b = toUniqueMap(base, path);
      const o = toUniqueMap(ours, path);
      const t = toUniqueMap(theirs, path);
      const out = [...ours];
      const indexOf = key => out.findIndex(item => identity(item, path) === key);
      for (const [key, baseItem] of b) {
        if (!t.has(key)) {
          if (!o.has(key)) continue;
          if (!equal(o.get(key), baseItem)) throw new Error(`semantic conflict removing ${path}[${key}]`);
          out.splice(indexOf(key), 1);
          continue;
        }
        const theirItem = t.get(key);
        if (equal(theirItem, baseItem)) continue;
        if (!o.has(key)) throw new Error(`semantic conflict: current removed changed item ${path}[${key}]`);
        out[indexOf(key)] = mergeValue(baseItem, o.get(key), theirItem, `${path}[${key}]`);
      }
      for (const [key, theirItem] of t) {
        if (b.has(key)) continue;
        if (!o.has(key)) out.push(theirItem);
        else if (!equal(o.get(key), theirItem)) throw new Error(`semantic conflict adding existing ${path}[${key}]`);
      }
      return out;
    }
    if (plain(base) && plain(ours) && plain(theirs)) {
      const result = { ...ours };
      const keys = new Set([...Object.keys(base), ...Object.keys(ours), ...Object.keys(theirs)]);
      for (const key of keys) {
        const bHas = Object.hasOwn(base, key), oHas = Object.hasOwn(ours, key), tHas = Object.hasOwn(theirs, key);
        const sub = path ? `${path}.${key}` : key;
        if (!bHas && !tHas) continue;
        if (!bHas && tHas) {
          if (!oHas) result[key] = theirs[key];
          else if (!equal(ours[key], theirs[key])) throw new Error(`semantic conflict adding ${sub}`);
          continue;
        }
        if (bHas && !tHas) {
          if (!oHas) continue;
          if (!equal(ours[key], base[key])) throw new Error(`semantic conflict removing ${sub}`);
          delete result[key];
          continue;
        }
        if (!oHas) {
          if (equal(theirs[key], base[key])) continue;
          throw new Error(`semantic conflict: current removed changed key ${sub}`);
        }
        result[key] = mergeValue(base[key], ours[key], theirs[key], sub);
      }
      return result;
    }
    throw new Error(`semantic scalar/type conflict at ${path}`);
  };

  for (const file of files) {
    const merged = mergeValue(showJson(oldBase, file), JSON.parse(fs.readFileSync(file, 'utf8')), showJson(finalRef, file), file);
    fs.writeFileSync(file, `${JSON.stringify(merged, null, 2)}\n`);
    console.log(`semantic merge OK: ${file}`);
  }
}

function syncHistory(lockedFile) {
  const lockedIndex = JSON.parse(fs.readFileSync(lockedFile, 'utf8'));
  const index = JSON.parse(fs.readFileSync('data/epoker/epoke-place-index.json', 'utf8'));
  const testFile = 'tests/epoke-place-index.test.mjs';
  let source = fs.readFileSync(testFile, 'utf8');

  const rows = (payload, evidenceType) => {
    const out = [];
    for (const [epochId, epoch] of Object.entries(payload?.domains?.historie?.epochs || {})) {
      for (const place of Array.isArray(epoch?.places) ? epoch.places : []) {
        for (const milestone of Array.isArray(place?.milestones) ? place.milestones : []) {
          if (milestone?.evidence_type === evidenceType) out.push({ epochId, placeId: place?.place_id || '', milestone });
        }
      }
    }
    return out;
  };
  const multisetExtra = (left, right) => {
    const counts = new Map();
    for (const row of right) counts.set(canon(row), (counts.get(canon(row)) || 0) + 1);
    const extra = [];
    for (const row of left) {
      const k = canon(row), count = counts.get(k) || 0;
      if (count > 0) counts.set(k, count - 1); else extra.push(row);
    }
    return extra;
  };
  const lane = (type, statKey) => {
    const l = rows(lockedIndex, type), a = rows(index, type);
    const ls = lockedIndex?.stats?.[statKey], as = index?.stats?.[statKey];
    if (!Number.isInteger(ls) || !Number.isInteger(as) || l.length !== ls || a.length !== as) throw new Error(`${statKey} stats/materialization mismatch`);
    const lv = l.filter(x => x.placeId === 'vaalerenga'), av = a.filter(x => x.placeId === 'vaalerenga');
    const lo = l.filter(x => x.placeId !== 'vaalerenga'), ao = a.filter(x => x.placeId !== 'vaalerenga');
    if (multisetExtra(lo, ao).length || multisetExtra(ao, lo).length) throw new Error(`${type} changed outside Vålerenga`);
    if (av.length <= lv.length) throw new Error(`${type} did not add Vålerenga evidence`);
    return { lockedStat: ls, actualStat: as, lockedV: lv.length, actualV: av.length };
  };
  const production = lane('verified_place_production_claim', 'verified_place_production_milestone_count');
  const stories = lane('canonical_story', 'canonical_story_milestone_count');

  const lc = lockedIndex?.domains?.historie?.oslo_coverage, ac = index?.domains?.historie?.oslo_coverage;
  if (!lc || !ac) throw new Error('Missing Oslo coverage block');
  if (lc.canonical_place_count !== ac.canonical_place_count || lc.documented_case_place_count !== ac.documented_case_place_count) throw new Error('Unexpected Oslo coverage cardinality change');
  const lm = new Map((lc.places || []).map(x => [x.place_id, x.status])), am = new Map((ac.places || []).map(x => [x.place_id, x.status]));
  if (lm.size !== am.size) throw new Error('Oslo coverage place set changed');
  for (const [id, status] of lm) {
    if (!am.has(id)) throw new Error(`Oslo coverage lost ${id}`);
    if (id !== 'vaalerenga' && am.get(id) !== status) throw new Error(`Oslo coverage changed outside Vålerenga: ${id}`);
  }
  if (lm.get('vaalerenga') !== 'awaiting_source_backed_history' || am.get('vaalerenga') !== 'dated_evidence') throw new Error(`Unexpected Vålerenga coverage transition ${lm.get('vaalerenga')} -> ${am.get('vaalerenga')}`);
  if (ac.dated_evidence_place_count !== lc.dated_evidence_place_count + 1 || ac.awaiting_source_backed_history_count !== lc.awaiting_source_backed_history_count - 1) throw new Error('Unexpected Oslo coverage count delta');

  const sync = (pattern, lockedExpected, actualExpected, label) => {
    const matches = [...source.matchAll(pattern)];
    if (matches.length !== 1) throw new Error(`Expected one ${label} assertion, found ${matches.length}`);
    const observed = Number(matches[0][1]);
    if (observed !== lockedExpected) throw new Error(`${label} assertion stale before replay: expected ${lockedExpected}, got ${observed}`);
    source = source.replace(pattern, m => m.replace(String(observed), String(actualExpected)));
  };
  sync(/assert\.equal\(index\.stats\.canonical_story_milestone_count, (\d+)\);/g, stories.lockedStat, stories.actualStat, 'story');
  sync(/assert\.equal\(index\.stats\.verified_place_production_milestone_count, (\d+)\);/g, production.lockedStat, production.actualStat, 'production');
  sync(/assert\.equal\(coverage\.dated_evidence_place_count, (\d+)\);/g, lc.dated_evidence_place_count, ac.dated_evidence_place_count, 'dated coverage');
  sync(/assert\.equal\(coverage\.awaiting_source_backed_history_count, (\d+)\);/g, lc.awaiting_source_backed_history_count, ac.awaiting_source_backed_history_count, 'awaiting coverage');
  fs.writeFileSync(testFile, source);
  console.log(JSON.stringify({ production, stories, coverage: { dated: [lc.dated_evidence_place_count, ac.dated_evidence_place_count], awaiting: [lc.awaiting_source_backed_history_count, ac.awaiting_source_backed_history_count] } }, null, 2));
}

const [command, ...args] = process.argv.slice(2);
if (command === 'merge') {
  const [oldBase, finalRef, ...files] = args;
  if (!oldBase || !finalRef || files.length === 0) throw new Error('usage: helper merge <oldBase> <finalRef> <files...>');
  mergeShared(oldBase, finalRef, files);
} else if (command === 'sync-history') {
  const [lockedFile] = args;
  if (!lockedFile) throw new Error('usage: helper sync-history <locked-index-file>');
  syncHistory(lockedFile);
} else {
  throw new Error(`unknown command: ${command}`);
}
