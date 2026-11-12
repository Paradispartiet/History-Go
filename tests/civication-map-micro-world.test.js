// Verify the miniature-world module without WebGL or network access.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationMapMicroWorld.js"), "utf8");
const browser = {};
const districtSource = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationMicroWorldDistricts.js"), "utf8");
vm.runInNewContext(districtSource, { window: browser });
vm.runInNewContext(source, { window: browser });
const kit = browser.CivicationMapMicroWorld;

test("mikroliv er deterministisk, stedsspesifikt og innenfor kartet", () => {
  const a = kit.getBlueprint();
  const b = kit.getBlueprint();
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(a.length, 158);
  assert.equal(new Set(a.map((x) => x.area)).size, 25);
  assert.equal(new Set(a.map((x) => x.kind)).size, 15);
  for (const item of a) {
    assert.ok(item.x > 0 && item.x < 1, "x på kartet");
    assert.ok(item.y > 0 && item.y < 1, "y på kartet");
    assert.ok(kit.validKinds().includes(item.kind), "gyldig propstype");
  }
  assert.equal(new Set(a.map((x) => x.x + ":" + x.y)).size, a.length);
});

test("bygger små dekorobjekter uten å opprette klikkbare steder", () => {
  class Group {
    constructor() {
      this.children = [];
      this.userData = {};
      this.position = { x: 0, y: 0, z: 0, set: (x, y, z) => { this.position.x=x; this.position.y=y; this.position.z=z; } };
      this.rotation = { y: 0 };
    }
    add(child) { this.children.push(child); }
  }
  class Mesh extends Group {
    constructor(geo, material) { super(); this.geometry = geo; this.material = material; }
  }
  class Geo { constructor(...args) { this.args = args; } }
  class Material { constructor(config) { this.config = config; } }
  const THREE = {
    Group, Mesh, BoxGeometry: Geo, CylinderGeometry: Geo,
    IcosahedronGeometry: Geo, TorusGeometry: Geo, MeshStandardMaterial: Material
  };
  assert.equal(kit.create({ THREE }), null, "mangler koordinatprojeksjon");
  const built = kit.create({
    THREE, nx2x: (x) => (x - 0.5) * 30, ny2z: (y) => (y - 0.5) * 30, groundY: 0.12
  });
  assert.equal(built.count, 158);
  assert.equal(built.areas.length, 25);
  assert.equal(built.group.children.length, 158);
  assert.equal(built.baseCount, 107);
  assert.equal(built.fineCount, 51);
  assert.equal(built.group.children.filter((item) => item.visible === false).length, 51);
  assert.equal(built.group.userData.decorativeOnly, true);
  for (const miniature of built.group.children) {
    assert.equal(miniature.userData.placeId, undefined);
    assert.ok(miniature.position.y > 0.12);
    assert.ok(miniature.children.length >= 1);
  }
  const pedestrians = built.group.children.filter((item) => item.name.endsWith("-person"));
  assert.ok(pedestrians.length > 0, "miniatyrverden har mennesker");
  assert.ok(pedestrians.every((item) => item.children.length >= 10),
    "mennesker har tydelig hode, overkropp, armer, bein og sko");
});

test("rich map laster modulen før 3D og faller tilbake ved feil", () => {
  const loader = fs.readFileSync(path.join(__dirname, "../js/Civication/civicationShellLoader.js"), "utf8");
  const renderer = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationThreeMap.js"), "utf8");
  const rich = loader.slice(loader.indexOf("const RICH_MAP_SCRIPTS"), loader.indexOf("const LEGACY_DEBUG_SCRIPTS"));
  assert.ok(rich.indexOf("CivicationMicroWorldDistricts.js") < rich.indexOf("CivicationMapMicroWorld.js"));
  assert.ok(rich.indexOf("CivicationMapMicroWorld.js") < rich.indexOf("CivicationThreeMap.js"));
  assert.match(renderer, /buildMicroWorld\(\);/);
  assert.match(renderer, /CIVICATION_MICROWORLD_ENABLED === false/);
  assert.match(renderer, /microWorldObjects: _stats\.microWorldObjects/);
  assert.match(renderer, /clearZones: LANDMARK_CLEAR_ZONES/);
  assert.match(renderer, /microWorldSetPeriod\(period\)/);
  assert.match(renderer, /microWorldSetDetailVisible\(zoom >= 2\.1\)/);
  assert.match(renderer, /nearBuildingGroup.visible = zoom >= 2\.1/);
  assert.match(renderer, /nearRoadGroup.visible = zoom >= 2\.1/);
  assert.match(renderer, /const doors = new THREE\.InstancedMesh/);
  assert.match(renderer, /const canopies = new THREE\.InstancedMesh/);
  assert.match(renderer, /nearRoadGroup\.add\(extrudeShape\(ribbonPolygon\(points, width \* 1\.62\)/);
  assert.match(renderer, /crossing: true/);
  assert.match(renderer, /nearBuildingEntrances: _stats\.nearBuildingEntrances/);
  assert.match(renderer, /nearRoadCrossings: _stats\.nearRoadCrossings/);
  assert.match(renderer, /mikroliv feilet; kartet fortsetter/);
});


test("steder i miniatyrverden respekterer eksisterende landemerkers klareringssoner", () => {
  const renderer = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationThreeMap.js"), "utf8");
  const match = renderer.match(/const LANDMARK_CLEAR_ZONES = (\[[\s\S]*?\n  \]);/);
  assert.ok(match, "kartets kanoniske landemerke-soner eksisterer");
  const zones = vm.runInNewContext("(" + match[1] + ")");
  const available = kit.safeBlueprint(zones);
  assert.equal(available.length, 158, "alle 158 mikrodetaljer er på trygge steder");
  for (const item of available) {
    assert.ok(zones.every(zone =>
      Math.hypot(item.x - zone.x, item.y - zone.y) >= zone.r + 0.005
    ), "dekor ligger utenfor landemerke-soner: " + item.area + "/" + item.kind);
  }
  // Hvis et fremtidig kartlag legger en interaktiv plass oppå en detalj,
  // skal den dekorative miniatyren vike uten å endre spilltilstand.
  const artificial = kit.safeBlueprint([{ x: available[0].x, y: available[0].y, r: 0.012 }]);
  assert.ok(artificial.length < available.length);
  assert.ok(!artificial.some(x => x.x === available[0].x && x.y === available[0].y));
});

test("instanserte dekordeler reduserer draw groups uten å miste geometri", () => {
  class Group {
    constructor() {
      this.children = [];
      this.userData = {};
      this.position = { set() {} };
      this.rotation = { y: 0 };
      this.matrixWorld = { clone: () => ({}) };
    }
    add(item) { this.children.push(item); }
    updateMatrixWorld() { for (const child of this.children) child.updateMatrixWorld(); }
  }
  class Mesh extends Group {
    constructor(geo, material) { super(); this.geometry = geo; this.material = material; }
  }
  class InstancedMesh extends Mesh {
    constructor(geo, material, count) {
      super(geo, material);
      this.count = count;
      this.matrices = [];
      this.instanceMatrix = { needsUpdate: false };
    }
    setMatrixAt(i, matrix) { this.matrices[i] = matrix; }
  }
  class Geometry {}
  class Material { constructor(config) { Object.assign(this, config); } }
  const base = {
    Group, Mesh, BoxGeometry: Geometry, CylinderGeometry: Geometry,
    IcosahedronGeometry: Geometry, TorusGeometry: Geometry,
    MeshStandardMaterial: Material
  };
  const options = { nx2x: x => (x - 0.5) * 30, ny2z: y => (y - 0.5) * 30, groundY: 0.12 };
  const fallback = kit.create({ ...options, THREE: base });
  const instanced = kit.create({ ...options, THREE: { ...base, InstancedMesh } });
  const sourceMeshes = fallback.group.children.reduce((sum, entry) => sum + entry.children.length, 0);
  const renderInstances = instanced.group.children.reduce((sum, batch) => sum + batch.count, 0);
  assert.equal(instanced.batched, true);
  assert.equal(instanced.count, fallback.count);
  assert.equal(renderInstances, sourceMeshes);
  assert.ok(instanced.drawGroups < sourceMeshes, "færre tegnegrupper ved instansering");
  assert.ok(instanced.group.children.every(batch => batch.instanceMatrix.needsUpdate));
  assert.equal(instanced.baseCount, 107);
  assert.equal(instanced.fineCount, 51);
  assert.equal(instanced.group.children.filter(batch => batch.visible === false).length > 0, true);
  instanced.setDetailVisible(true);
  assert.ok(instanced.group.children.every(batch => batch.visible !== false),
    "ekstra miniatyrer blir synlige på høy zoom");
  instanced.setDetailVisible(false);
  assert.ok(instanced.group.children.some(batch => batch.visible === false),
    "ekstra miniatyrer skjules på lav zoom");
  const lamp = instanced.group.children.find(batch => batch.material.color === 0xd4c9a9);
  assert.ok(lamp, "lyktglass er en separat, gjenbrukt materialgruppe");
  assert.equal(lamp.material.emissiveIntensity, 0.065);
  instanced.setPeriod("night");
  assert.equal(lamp.material.emissiveIntensity, 0.32, "svak varm nattglød");
  instanced.setPeriod("day");
  assert.equal(lamp.material.emissiveIntensity, 0.018, "nesten usynlig på dagtid");
});
