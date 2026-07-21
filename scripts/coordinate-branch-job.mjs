#!/usr/bin/env node

const query = `[out:json][timeout:60];(
  way["natural"="water"]["name"~"^(Alungsjøen|Alnsjøen)$"](around:2000,59.96549,10.85129);
  relation["natural"="water"]["name"~"^(Alungsjøen|Alnsjøen)$"](around:2000,59.96549,10.85129);
  way["waterway"](around:1500,59.96549,10.85129);
);out body geom;`;
const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!response.ok) throw new Error(`Overpass feilet: HTTP ${response.status}`);
const payload = await response.json();
console.log('ALUNGSJOEN_ALNA_TOPOLOGY=' + JSON.stringify(payload));
throw new Error('Diagnostic only: no canonical data changed.');
