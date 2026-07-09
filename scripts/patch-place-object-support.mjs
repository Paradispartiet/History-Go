import { readFile, writeFile } from 'node:fs/promises';

async function patchFile(path, replacements) {
  let text = await readFile(path, 'utf8');
  for (const [from, to] of replacements) {
    if (!text.includes(from)) continue;
    text = text.replace(from, to);
  }
  await writeFile(path, text, 'utf8');
}

await patchFile('tools/build_places_index.mts', [[
  `    const places = Array.isArray(data) ? data : (hasObjectType(data) && Array.isArray(data.places) ? data.places : []);`,
  `    const places = Array.isArray(data)\n      ? data\n      : (hasObjectType(data) && Array.isArray(data.places)\n        ? data.places\n        : (isPlaceRow(data) && typeof data.id === 'string' ? [data] : []));`,
]]);

await patchFile('js/dataHub.js', [
  [
    `async function filterActivePlaces(places, opts = {}) {\n  const disabled = await loadPlaceExclusions(opts);\n  if (!disabled || !disabled.size) return Array.isArray(places) ? places : [];\n  return (Array.isArray(places) ? places : []).filter((p) => {\n    const id = String(p?.id || "").trim();\n    return !id || !disabled.has(id);\n  });\n}\n`,
    `async function filterActivePlaces(places, opts = {}) {\n  const disabled = await loadPlaceExclusions(opts);\n  if (!disabled || !disabled.size) return Array.isArray(places) ? places : [];\n  return (Array.isArray(places) ? places : []).filter((p) => {\n    const id = String(p?.id || "").trim();\n    return !id || !disabled.has(id);\n  });\n}\n\nfunction placesFromPlaceData(data) {\n  if (Array.isArray(data)) return data;\n  if (Array.isArray(data?.places)) return data.places;\n  if (data && typeof data === "object" && !Array.isArray(data) && typeof data.id === "string") return [data];\n  return [];\n}\n`,
  ],
  [
    `    if (Array.isArray(data)) places.push(...data);\n    else if (Array.isArray(data?.places)) places.push(...data.places);`,
    `    places.push(...placesFromPlaceData(data));`,
  ],
  [
    `        const places = Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : []);`,
    `        const places = placesFromPlaceData(data);`,
  ],
  [
    `    const places = Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : []);`,
    `    const places = placesFromPlaceData(data);`,
  ],
]);

console.log('Patched plain-object place file support.');
