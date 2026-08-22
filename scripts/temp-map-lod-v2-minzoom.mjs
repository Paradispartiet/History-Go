import { promises as fs } from 'node:fs';

const read = (p) => fs.readFile(p, 'utf8');
const write = (p, s) => fs.writeFile(p, s, 'utf8');

function replaceOnce(source, from, to, label) {
  const first = source.indexOf(from);
  if (first < 0) throw new Error(`Missing patch anchor: ${label}`);
  if (source.indexOf(from, first + from.length) >= 0) throw new Error(`Patch anchor is not unique: ${label}`);
  return source.slice(0, first) + to + source.slice(first + from.length);
}

let map = await read('js/map.ts');
map = replaceOnce(
  map,
  `  const PLACE_AREA_LOD_FILTER: any = ["in", ["get", "mapLod"], ["literal", [PLACE_MAP_LOD_OVERVIEW, PLACE_MAP_LOD_AREA]]];\n  const PLACE_DETAIL_POINT_FILTER: any = ["all", ["==", ["get", "mapLod"], PLACE_MAP_LOD_DETAIL], [">=", ["zoom"], PLACE_DETAIL_MIN_ZOOM]];\n  const PLACE_DETAIL_HIT_FILTER: any = ["all", ["==", ["get", "mapLod"], PLACE_MAP_LOD_DETAIL], [">=", ["zoom"], PLACE_DETAIL_HIT_MIN_ZOOM]];\n  const PLACE_DETAIL_LABEL_FILTER: any = ["all", ["==", ["get", "mapLod"], PLACE_MAP_LOD_DETAIL], [">=", ["zoom"], PLACE_DETAIL_LABEL_MIN_ZOOM]];`,
  `  const PLACE_AREA_LOD_FILTER: any = ["in", ["get", "mapLod"], ["literal", [PLACE_MAP_LOD_OVERVIEW, PLACE_MAP_LOD_AREA]]];\n  const PLACE_DETAIL_LOD_FILTER: any = ["==", ["get", "mapLod"], PLACE_MAP_LOD_DETAIL];`,
  'detail LOD filters'
);
for (const [id, minzoom, oldFilter] of [
  ['L_GLOW', 'PLACE_DETAIL_MIN_ZOOM', 'PLACE_DETAIL_POINT_FILTER'],
  ['L_DOTS', 'PLACE_DETAIL_MIN_ZOOM', 'PLACE_DETAIL_POINT_FILTER'],
  ['L_LAB', 'PLACE_DETAIL_LABEL_MIN_ZOOM', 'PLACE_DETAIL_LABEL_FILTER'],
  ['L_HIT', 'PLACE_DETAIL_HIT_MIN_ZOOM', 'PLACE_DETAIL_HIT_FILTER']
]) {
  map = replaceOnce(
    map,
    `      id: ${id},\n      filter: ${oldFilter},`,
    `      id: ${id},\n      minzoom: ${minzoom},\n      filter: PLACE_DETAIL_LOD_FILTER,`,
    `${id} minzoom`
  );
}
await write('js/map.ts', map);

let test = await read('tests/map-place-area-lod.test.mjs');
test = replaceOnce(
  test,
  `  assert.match(source, /filter: PLACE_AREA_LOD_FILTER/);\n  assert.match(source, /filter: PLACE_DETAIL_POINT_FILTER/);\n  assert.match(source, /filter: PLACE_DETAIL_HIT_FILTER/);\n  assert.match(source, /filter: PLACE_DETAIL_LABEL_FILTER/);`,
  `  assert.match(source, /filter: PLACE_AREA_LOD_FILTER/);\n  assert.match(source, /PLACE_DETAIL_LOD_FILTER/);\n  assert.match(source, /id: L_GLOW,[\\s\\S]*?minzoom: PLACE_DETAIL_MIN_ZOOM,[\\s\\S]*?filter: PLACE_DETAIL_LOD_FILTER/);\n  assert.match(source, /id: L_DOTS,[\\s\\S]*?minzoom: PLACE_DETAIL_MIN_ZOOM,[\\s\\S]*?filter: PLACE_DETAIL_LOD_FILTER/);\n  assert.match(source, /id: L_LAB,[\\s\\S]*?minzoom: PLACE_DETAIL_LABEL_MIN_ZOOM,[\\s\\S]*?filter: PLACE_DETAIL_LOD_FILTER/);\n  assert.match(source, /id: L_HIT,[\\s\\S]*?minzoom: PLACE_DETAIL_HIT_MIN_ZOOM,[\\s\\S]*?filter: PLACE_DETAIL_LOD_FILTER/);\n  assert.doesNotMatch(source, /PLACE_DETAIL_(?:POINT|HIT|LABEL)_FILTER/);`,
  'LOD minzoom regression assertions'
);
await write('tests/map-place-area-lod.test.mjs', test);

console.log('TEMP map LOD minzoom refinement applied.');
