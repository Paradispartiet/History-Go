#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const stable = (value) => {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
};
const canon = (value) => JSON.stringify(stable(value));
const equal = (a, b) => canon(a) === canon(b);
const plain = (value) => value && typeof value === 'object' && !Array.isArray(value);
const showJson = (ref, file) => JSON.parse(execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));

function mergeShared(oldBase, finalRef, files) {
  const ids = ['id','key','path','file','filename','place_id','placeId','slug','name','target','quiz_file','quizFile','value'];
  const identity = (item, path) => {
    if (!plain(item)) return `$value:${canon(item)}`;
    if (path.endsWith('.sets') && typeof item.targetId === 'string' && item.targetId.trim() && typeof item.file === 'string' && item.file.trim()) {
      return `targetId:${item.targetId.trim()}|file:${item.file.trim()}`;
    }
    for (const key of ids) {
      const value = item[key];
      if (typeof value === 'string' && value.trim()) return `${key}:${value.trim()}`;
      if (typeof value === 'number' || typeof value === 'boolean') return `${key}:${String(value)}`;
    }
    return `$value:${canon(item)}`;
  };
  const uniqueMap = (values, path) => {
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
      const b = uniqueMap(base, path), o = uniqueMap(ours, path), t = uniqueMap(theirs, path);
      const out = [...ours];
      const indexOf = (key) => out.findIndex((item) => identity(item, path) === key);
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
        const bh = Object.hasOwn(base, key), oh = Object.hasOwn(ours, key), th = Object.hasOwn(theirs, key);
        const sub = path ? `${path}.${key}` : key;
        if (!bh && !th) continue;
        if (!bh && th) {
          if (!oh) result[key] = theirs[key];
          else if (!equal(ours[key], theirs[key])) throw new Error(`semantic conflict adding ${sub}`);
          continue;
        }
        if (bh && !th) {
          if (!oh) continue;
          if (!equal(ours[key], base[key])) throw new Error(`semantic conflict removing ${sub}`);
          delete result[key];
          continue;
        }
        if (!oh) {
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

function repairVaalerenga() {
  const placePath = 'data/places/by/oslo/places/vaalerenga.json';
  const packetPath = 'data/places/production/vaalerenga.json';
  const place = JSON.parse(fs.readFileSync(placePath, 'utf8'));
  const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
  const replaceExact = (value, before, after, label) => {
    const count = value.split(before).length - 1;
    if (count !== 1) throw new Error(`Expected one ${label}, found ${count}`);
    return value.replace(before, after);
  };
  place.popupDesc = replaceExact(place.popupDesc, 'mens området ennå lå utenfor Christianias bygrense.', 'mens området fortsatt lå utenfor Christianias bygrense.', 'temporal wording');
  place.popupDesc = replaceExact(place.popupDesc, 'Vålerenga skole i Islands gate ble tatt i bruk i 1895 og var ved åpningen byens største skole.', 'Vålerenga skole i Islands gate ble tatt i bruk i 1895.', 'school wording');
  place.popupDesc = replaceExact(place.popupDesc, 'Synnøve Finden er derfor både en dokumentert person', 'Synnøve Finden er både en dokumentert person', 'Synnøve wording');
  place.popupDesc = replaceExact(place.popupDesc, 'Vålerenga kan derfor leses gjennom flere konkrete spor samtidig:', 'Vålerenga kan leses gjennom flere konkrete spor samtidig:', 'summary wording');

  const claims = new Map(packet.claims.map((claim) => [claim.id, claim]));
  const setClaim = (id, text) => {
    const claim = claims.get(id);
    if (!claim) throw new Error(`Missing ${id}`);
    claim.claim = text;
  };
  setClaim('claim_vaalerenga_text_04', 'Vålerenga vokste fram som forstad langs Strømsveien fra 1830-årene, mens området fortsatt lå utenfor Christianias bygrense.');
  setClaim('claim_vaalerenga_text_08', 'Vålerenga skole i Islands gate ble tatt i bruk i 1895.');
  setClaim('claim_vaalerenga_text_12', 'Synnøve Finden er både en dokumentert person i nabolagets næringshistorie og opphavet til en merkeidentitet som senere ble landsdekkende.');
  setClaim('claim_vaalerenga_text_21', 'Vålerenga kan leses gjennom flere konkrete spor samtidig: trehusene viser forstadens tidlige boligform, grensesteinen viser byutvidelsen, skolen og kirken viser institusjonsbygging, Danmarks gate 41 viser småskala næringsliv, og endringen av Strømsveien viser hvordan transportpolitikk kan endre et boligområdes hverdagsrom.');

  const sourceTypeMap = new Map([
    ['institutional_reference', 'institutional'],
    ['primary_institutional', 'institutional'],
    ['edited_reference', 'reputable_secondary']
  ]);
  let normalized = 0;
  for (const claim of packet.claims) {
    const mapped = sourceTypeMap.get(claim.sourceType);
    if (mapped) { claim.sourceType = mapped; normalized += 1; }
  }
  if (normalized !== 21) throw new Error(`Expected 21 sourceType normalizations, got ${normalized}`);
  const questions = packet?.quizReadiness?.questions;
  if (!Array.isArray(questions) || questions.length !== 6) throw new Error(`Expected 6 packet questions, got ${questions?.length}`);
  questions.push(
    { type: 'når', question: 'Når ble Vålerenga skole i Islands gate tatt i bruk?', answer: '1895', normalKnowledgeQuestion: true, claimIds: ['claim_vaalerenga_text_08'] },
    { type: 'når', question: 'Når ble Vålerenga kirke vigslet på nytt etter gjenoppbyggingen?', answer: '2. desember 1984', normalKnowledgeQuestion: true, claimIds: ['claim_vaalerenga_text_16'] }
  );
  const sha256 = (value) => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
  packet.textHashes = { algorithm: 'sha256', desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) };
  if (packet.textHashes.popupDesc !== '7393793342e6c30a3ebb91a097c227d68ce1fa35de99798d8a55f22765ec20b4') throw new Error(`Unexpected popup hash ${packet.textHashes.popupDesc}`);
  fs.writeFileSync(placePath, `${JSON.stringify(place, null, 2)}\n`);
  fs.writeFileSync(packetPath, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(`repair OK: ${normalized} source types, ${questions.length} packet questions`);
}

function syncHistory(lockedFile) {
  const locked = JSON.parse(fs.readFileSync(lockedFile, 'utf8'));
  const actual = JSON.parse(fs.readFileSync('data/epoker/epoke-place-index.json', 'utf8'));
  let testSource = fs.readFileSync('tests/epoke-place-index.test.mjs', 'utf8');
  const rows = (payload, type) => Object.entries(payload?.domains?.historie?.epochs || {}).flatMap(([epochId, epoch]) =>
    (Array.isArray(epoch?.places) ? epoch.places : []).flatMap((place) =>
      (Array.isArray(place?.milestones) ? place.milestones : []).filter((m) => m?.evidence_type === type).map((milestone) => ({ epochId, placeId: place?.place_id || '', milestone }))));
  const extra = (left, right) => {
    const counts = new Map();
    for (const row of right) counts.set(canon(row), (counts.get(canon(row)) || 0) + 1);
    const out = [];
    for (const row of left) {
      const k = canon(row), n = counts.get(k) || 0;
      if (n) counts.set(k, n - 1); else out.push(row);
    }
    return out;
  };
  const lane = (type, statKey) => {
    const l = rows(locked, type), a = rows(actual, type);
    const ls = locked?.stats?.[statKey], as = actual?.stats?.[statKey];
    if (!Number.isInteger(ls) || !Number.isInteger(as) || l.length !== ls || a.length !== as) throw new Error(`${statKey} stats/materialization mismatch`);
    const lv = l.filter((x) => x.placeId === 'vaalerenga'), av = a.filter((x) => x.placeId === 'vaalerenga');
    const lo = l.filter((x) => x.placeId !== 'vaalerenga'), ao = a.filter((x) => x.placeId !== 'vaalerenga');
    if (extra(lo, ao).length || extra(ao, lo).length) throw new Error(`${type} changed outside Vålerenga`);
    if (av.length <= lv.length) throw new Error(`${type} did not add Vålerenga evidence`);
    return { lockedStat: ls, actualStat: as, lockedV: lv.length, actualV: av.length };
  };
  const production = lane('verified_place_production_claim', 'verified_place_production_milestone_count');
  const stories = lane('canonical_story', 'canonical_story_milestone_count');
  const lc = locked?.domains?.historie?.oslo_coverage, ac = actual?.domains?.historie?.oslo_coverage;
  if (!lc || !ac || lc.canonical_place_count !== ac.canonical_place_count || lc.documented_case_place_count !== ac.documented_case_place_count) throw new Error('Unexpected Oslo coverage cardinality change');
  const lm = new Map((lc.places || []).map((x) => [x.place_id, x.status])), am = new Map((ac.places || []).map((x) => [x.place_id, x.status]));
  if (lm.size !== am.size) throw new Error('Oslo coverage place set changed');
  for (const [id, status] of lm) {
    if (!am.has(id)) throw new Error(`Oslo coverage lost ${id}`);
    if (id !== 'vaalerenga' && am.get(id) !== status) throw new Error(`Oslo coverage changed outside Vålerenga: ${id}`);
  }
  if (lm.get('vaalerenga') !== 'awaiting_source_backed_history' || am.get('vaalerenga') !== 'dated_evidence') throw new Error(`Unexpected Vålerenga coverage transition ${lm.get('vaalerenga')} -> ${am.get('vaalerenga')}`);
  if (ac.dated_evidence_place_count !== lc.dated_evidence_place_count + 1 || ac.awaiting_source_backed_history_count !== lc.awaiting_source_backed_history_count - 1) throw new Error('Unexpected Oslo coverage delta');
  const sync = (pattern, expected, next, label) => {
    const matches = [...testSource.matchAll(pattern)];
    if (matches.length !== 1) throw new Error(`Expected one ${label} assertion, found ${matches.length}`);
    const current = Number(matches[0][1]);
    if (current !== expected) throw new Error(`${label} assertion stale before replay: ${current} != ${expected}`);
    testSource = testSource.replace(pattern, (m) => m.replace(String(current), String(next)));
  };
  sync(/assert\.equal\(index\.stats\.canonical_story_milestone_count, (\d+)\);/g, stories.lockedStat, stories.actualStat, 'story');
  sync(/assert\.equal\(index\.stats\.verified_place_production_milestone_count, (\d+)\);/g, production.lockedStat, production.actualStat, 'production');
  sync(/assert\.equal\(coverage\.dated_evidence_place_count, (\d+)\);/g, lc.dated_evidence_place_count, ac.dated_evidence_place_count, 'dated coverage');
  sync(/assert\.equal\(coverage\.awaiting_source_backed_history_count, (\d+)\);/g, lc.awaiting_source_backed_history_count, ac.awaiting_source_backed_history_count, 'awaiting coverage');
  fs.writeFileSync('tests/epoke-place-index.test.mjs', testSource);
  console.log(JSON.stringify({ production, stories, coverage: { dated: [lc.dated_evidence_place_count, ac.dated_evidence_place_count], awaiting: [lc.awaiting_source_backed_history_count, ac.awaiting_source_backed_history_count] } }, null, 2));
}

function updateBacklog(auditFile) {
  const file = 'data/places/place_image_backlog_summary.json';
  const backlog = JSON.parse(fs.readFileSync(file, 'utf8'));
  const audit = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
  backlog.generatedAt = '2026-09-07';
  backlog.generatedFromCommit = 'vaalerenga_replay_20260907';
  backlog.totalPlaces = audit.totalPlaces;
  backlog.summary = { validLocal: audit.summary.local, validRemote: audit.summary.remote, optionalMissing: audit.summary.optional, missing: audit.summary.missing, invalidLocalPath: audit.summary.invalid, remaining: audit.summary.missing + audit.summary.invalid };
  for (const [category, row] of Object.entries(audit.byCategory)) backlog.byCategory[category] = { ...backlog.byCategory[category], total: row.total, valid: row.local + row.remote, optional: row.optional, missing: row.missing, invalid: row.invalid };
  fs.writeFileSync(file, `${JSON.stringify(backlog, null, 2)}\n`);
}

const [command, ...args] = process.argv.slice(2);
if (command === 'merge') mergeShared(args[0], args[1], args.slice(2));
else if (command === 'repair') repairVaalerenga();
else if (command === 'sync-history') syncHistory(args[0]);
else if (command === 'backlog') updateBacklog(args[0]);
else throw new Error(`Unknown command ${command}`);
