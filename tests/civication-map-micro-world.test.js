// Verify the miniature-world module without WebGL or network access.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationMapMicroWorld.js"), "utf8");
const browser = {};
vm.runInNewContext(source, { window: browser });
const kit = browser.CivicationMapMicroWorld;

test("mikroliv er deterministisk, stedsspesifikt og innenfor kartet", () => {
  const a = kit.getBlueprint();
  const b = kit.getBlueprint();
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(a.length, 46);
  assert.equal(new Set(a.map((x) => x.area)).size, 8);
  assert.equal(new Set(a.map((x) => x.kind)).size, 7);
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
  assert.equal(built.count, 46);
  assert.equal(built.areas.length, 8);
  assert.equal(built.group.children.length, 46);
  assert.equal(built.group.userData.decorativeOnly, true);
  for (const miniature of built.group.children) {
    assert.equal(miniature.userData.placeId, undefined);
    assert.ok(miniature.position.y > 0.12);
    assert.ok(miniature.children.length >= 1);
  }
});

test("rich map laster modulen før 3D og faller tilbake ved feil", () => {
  const loader = fs.readFileSync(path.join(__dirname, "../js/Civication/civicationShellLoader.js"), "utf8");
  const renderer = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationThreeMap.js"), "utf8");
  const rich = loader.slice(loader.indexOf("const RICH_MAP_SCRIPTS"), loader.indexOf("const LEGACY_DEBUG_SCRIPTS"));
  assert.ok(rich.indexOf("CivicationMapMicroWorld.js") < rich.indexOf("CivicationThreeMap.js"));
  assert.match(renderer, /buildMicroWorld\(\);/);
  assert.match(renderer, /CIVICATION_MICROWORLD_ENABLED === false/);
  assert.match(renderer, /microWorldObjects: _stats\.microWorldObjects/);
  assert.match(renderer, /mikroliv feilet; kartet fortsetter/);
});
