#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, 'data/places/manifest.json');

function distMeters(a, b) {
  const R = 6371000;
  const toRad = (n) => (n * Math.PI) / 180;
  const dLat = toRad(Number(b.lat) - Number(a.lat));
  const dLon = toRad(Number(b.lon) - Number(a.lon));
  const lat1 = toRad(Number(a.lat));
  const lat2 = toRad(Number(b.lat));
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function getPlaceDistanceTargets(place) {
  const placeLat = Number(place?.lat);
  const placeLon = Number(place?.lon);
  const placeRadius = Number(place?.r || 150);
  const fallbackRadius = Number.isFinite(placeRadius) && placeRadius > 0 ? placeRadius : 150;
  const validAnchorTypes = new Set(['unlock_anchor', 'route_point', 'entrance', 'viewpoint', 'area_anchor', 'midpoint']);
  const anchors = Array.isArray(place?.anchors) ? place.anchors : [];
  const normalized = anchors.map((anchor, idx) => {
    const lat = Number(anchor?.lat);
    const lon = Number(anchor?.lon);
    const r = Number(anchor?.r);
    const type = String(anchor?.type || '').trim();
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (!Number.isFinite(r) || r <= 0) return null;
    if (!validAnchorTypes.has(type)) return null;
    return { id: String(anchor?.id || `anchor_${idx + 1}`), name: String(anchor?.name || place?.name || `Anchor ${idx + 1}`), lat, lon, r, type };
  }).filter(Boolean);
  if (normalized.length) return normalized;
  if (!Number.isFinite(placeLat) || !Number.isFinite(placeLon)) return [];
  return [{ id: String(place?.id || 'place'), name: String(place?.name || 'Place'), lat: placeLat, lon: placeLon, r: fallbackRadius, type: 'unlock_anchor' }];
}

function readPlaces() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const files = Array.isArray(manifest?.files) ? manifest.files : [];
  const all = [];
  for (const rel of files) {
    const full = path.join(repoRoot, 'data', rel);
    const json = JSON.parse(fs.readFileSync(full, 'utf8'));
    if (Array.isArray(json)) all.push(...json);
  }
  return all;
}

function nearestDistance(pos, place) {
  const targets = getPlaceDistanceTargets(place);
  let best = Infinity;
  let bestTarget = null;
  for (const t of targets) {
    const d = distMeters(pos, { lat: t.lat, lon: t.lon });
    if (d < best) {
      best = d;
      bestTarget = t;
    }
  }
  return { d: best, target: bestTarget };
}

const places = readPlaces().filter(p => p && !p.hidden && !p.stub);
const withAnchors = places.find(p => Array.isArray(p.anchors) && p.anchors.length > 0);
const withoutAnchors = places.find(p => !Array.isArray(p.anchors) || p.anchors.length === 0);

let failures = 0;

if (!withAnchors) {
  console.log('FAIL: Fant ingen places med anchors.');
  failures++;
} else {
  const targets = getPlaceDistanceTargets(withAnchors);
  const anchorTarget = targets.find(t => String(t.id) !== String(withAnchors.id)) || targets[0];
  const pos = { lat: anchorTarget.lat, lon: anchorTarget.lon };
  const nearest = nearestDistance(pos, withAnchors);
  const mainDist = distMeters(pos, { lat: withAnchors.lat, lon: withAnchors.lon });
  const pickedAnchor = String(nearest.target?.id || '') !== String(withAnchors.id || '');
  const unlockAtAnchor = nearest.d <= Number(nearest.target?.r || 0);
  console.log(`[anchor] place=${withAnchors.id} nearestTarget=${nearest.target?.id} nearest=${Math.round(nearest.d)}m main=${Math.round(mainDist)}m unlock=${unlockAtAnchor}`);
  if (!pickedAnchor || !(nearest.d <= mainDist)) {
    console.log('FAIL: Nærmeste target ble ikke anchor for place med anchors.');
    failures++;
  }
  if (!unlockAtAnchor) {
    console.log('FAIL: Unlock innenfor anchor-radius feilet.');
    failures++;
  }
}

if (!withoutAnchors) {
  console.log('FAIL: Fant ingen places uten anchors.');
  failures++;
} else {
  const targets = getPlaceDistanceTargets(withoutAnchors);
  const isFallback = targets.length === 1 && String(targets[0].id) === String(withoutAnchors.id);
  const pos = { lat: withoutAnchors.lat, lon: withoutAnchors.lon };
  const nearest = nearestDistance(pos, withoutAnchors);
  const unlockAtPoint = nearest.d <= Number(targets[0]?.r || 0);
  console.log(`[fallback] place=${withoutAnchors.id} targets=${targets.length} nearest=${Math.round(nearest.d)}m unlock=${unlockAtPoint}`);
  if (!isFallback) {
    console.log('FAIL: Fallback target for place uten anchors er feil.');
    failures++;
  }
  if (!unlockAtPoint) {
    console.log('FAIL: Fallback unlock ved hovedpunkt feilet.');
    failures++;
  }
}

if (failures > 0) {
  console.log(`\nRESULT: FAIL (${failures})`);
  process.exit(1);
}
console.log('\nRESULT: PASS');
