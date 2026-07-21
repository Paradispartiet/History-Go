#!/usr/bin/env node

const query = `[out:json][timeout:40];(
  node["amenity"="bird_hide"](around:1500,59.8878,10.8301);
  way["amenity"="bird_hide"](around:1500,59.8878,10.8301);
  relation["amenity"="bird_hide"](around:1500,59.8878,10.8301);
  node["man_made"="tower"]["tower:type"="observation"](around:1500,59.8878,10.8301);
  way["man_made"="tower"]["tower:type"="observation"](around:1500,59.8878,10.8301);
  relation["man_made"="tower"]["tower:type"="observation"](around:1500,59.8878,10.8301);
);out center tags;`;
const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!response.ok) throw new Error(`Overpass feilet: HTTP ${response.status}`);
const payload = await response.json();
console.log('OSTENSJOVANNET_FUGLETARN_OVERPASS=' + JSON.stringify(payload));
throw new Error('Diagnostic only: no canonical data changed.');
