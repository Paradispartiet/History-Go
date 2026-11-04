// CivicationMapMicroWorld.js
// Rolig, dekorativt miniatyrliv for 3D-Oslo. Ingen spilltilstand eller klikkmål.
(function (root) {
  "use strict";

  // Posisjonene er normalisert mot samme Oslo-brett som CivicationThreeMap.
  // Objektene er håndplassert i eksisterende parker, torg og promenader.
  const CLUSTERS = [
    { id: "st_hanshaugen", x: 0.455, y: 0.515, items: [
      ["bench", -0.006, -0.003, 0.4], ["bench", 0.006, 0.004, -0.8],
      ["person", -0.002, 0.006, 0], ["person", 0.005, -0.005, 1.4],
      ["lamp", -0.009, 0.004, 0], ["lamp", 0.010, -0.003, 0],
      ["planter", 0.001, -0.009, 0.2]
    ] },
    { id: "toyenparken", x: 0.625, y: 0.485, items: [
      ["bench", -0.007, 0.004, -0.6], ["bench", 0.006, -0.004, 0.7],
      ["person", 0.002, 0.007, 0.5], ["person", -0.002, -0.005, -0.6],
      ["lamp", -0.009, -0.004, 0], ["bicycle", 0.009, 0.003, 0.2],
      ["planter", 0, -0.008, 0]
    ] },
    { id: "botanisk", x: 0.610, y: 0.505, items: [
      ["bench", -0.004, 0.003, 0.5], ["person", 0.004, -0.002, -0.7],
      ["planter", 0, 0.006, -0.3], ["planter", -0.004, -0.004, 0.4],
      ["lamp", 0.007, 0.002, 0]
    ] },
    { id: "aker_brygge", x: 0.405, y: 0.665, items: [
      ["bench", -0.004, 0.001, 0.1], ["person", 0.003, -0.004, 0.7],
      ["person", 0.006, 0.003, -1], ["bicycle", -0.006, -0.003, 0.8],
      ["lamp", 0.008, 0.001, 0], ["bollard", -0.009, 0.003, 0],
      ["bollard", 0.010, -0.004, 0]
    ] },
    { id: "bjorvika", x: 0.610, y: 0.665, items: [
      ["lamp", -0.007, 0.001, 0], ["lamp", 0.008, -0.002, 0],
      ["person", 0.004, 0.004, 0.6], ["bicycle", -0.003, -0.004, -0.3],
      ["bench", -0.001, 0.003, 0.3], ["bollard", 0.010, 0.004, 0]
    ] },
    { id: "toyen_torg", x: 0.626, y: 0.518, items: [
      ["market", 0, 0, -0.15], ["person", -0.005, -0.002, 0.6],
      ["person", 0.005, 0.002, -0.6], ["planter", -0.007, 0.005, 0],
      ["lamp", 0.007, -0.005, 0]
    ] },
    { id: "lokka_torg", x: 0.555, y: 0.485, items: [
      ["market", 0, 0, 0.4], ["person", 0.006, 0.002, 0.3],
      ["bicycle", -0.007, -0.002, 0.3], ["planter", 0.006, -0.006, 0.2],
      ["lamp", -0.006, 0.005, 0]
    ] },
    { id: "sagene", x: 0.515, y: 0.395, items: [
      ["bench", -0.006, 0.003, 0.2], ["bench", 0.008, -0.004, -0.1],
      ["person", 0.003, 0.005, 0.9], ["person", -0.003, -0.004, -0.3],
      ["lamp", 0.010, 0.006, 0], ["bicycle", -0.010, -0.003, 0.3],
      ["planter", 0.002, -0.010, 0], ["cafe_table", -0.005, 0.009, 0.2]
    ] },
    { id: "kampen", x: 0.655, y: 0.605, items: [
      ["bench", 0.002, 0.007, -0.4], ["person", -0.006, 0.002, 1],
      ["person", 0.009, -0.004, -0.5], ["dog", -0.003, -0.005, 0.5],
      ["planter", 0.004, -0.009, 0], ["lamp", -0.009, 0.009, 0],
      ["bicycle", 0.009, 0.008, 0.2]
    ] },
    { id: "majorstuen", x: 0.345, y: 0.505, items: [
      ["transit_stop", 0.000, 0.002, 0.4], ["person", -0.007, -0.006, 0],
      ["person", 0.008, 0.006, -0.4], ["bicycle", 0.009, -0.008, 0.3],
      ["bollard", -0.009, 0.007, 0], ["lamp", 0.004, -0.009, 0]
    ] },
    { id: "frogner", x: 0.372, y: 0.505, items: [
      ["bench", 0, -0.003, -0.5], ["person", 0.006, 0.001, 0],
      ["lamp", -0.007, 0.003, 0], ["planter", 0.006, 0.005, 0.2]
    ] }
  ];
  const COLORS = Object.freeze({
    wood: 0x827262, stone: 0xa69e8b, steel: 0x535c5f,
    fabric: 0x8a9081, coat: 0x687983, coatAlt: 0x8d776c,
    skin: 0xc0a88e, leaf: 0x637b5c, leafAlt: 0x74856c,
    lamp: 0xd4c9a9, earth: 0x746452, canopy: 0xa6a18c
  });
  const VALID_KINDS = new Set(["bench", "person", "lamp", "bicycle", "planter", "bollard", "market", "cafe_table", "dog", "transit_stop"]);

  function getBlueprint() {
    const result = [];
    for (const area of CLUSTERS) {
      for (const item of area.items) {
        result.push({
          area: area.id, kind: item[0],
          x: Number((area.x + item[1]).toFixed(5)),
          y: Number((area.y + item[2]).toFixed(5)),
          rotation: item[3] || 0
        });
      }
    }
    return result;
  }

  // Landemerker beholder luft rundt seg: hold miniatyrliv utenfor de samme
  // normaliserte klareringssonene som det kanoniske 3D-kartet bruker.
  function safeBlueprint(clearZones, margin = 0.005) {
    const zones = Array.isArray(clearZones) ? clearZones : [];
    const safeMargin = Number.isFinite(margin) ? Math.max(0, margin) : 0.005;
    return getBlueprint().filter((item) => !zones.some((z) => (
      z && Number.isFinite(z.x) && Number.isFinite(z.y) && Number.isFinite(z.r)
      && Math.hypot(item.x - z.x, item.y - z.y) < Math.max(0, z.r) + safeMargin
    )));
  }

  // Delte geometrier og materialer gjør mange små detaljer rimelige å rendre.
  function create(options) {
    const opts = options || {};
    const THREE = opts.THREE;
    if (!THREE || typeof opts.nx2x !== "function" || typeof opts.ny2z !== "function") return null;
    const group = new THREE.Group();
    group.name = "CivicationMicroWorld";
    group.userData.decorativeOnly = true;
    const ground = Number.isFinite(opts.groundY) ? opts.groundY : 0.12;
    const materials = new Map();
    const geometries = new Map();

    function material(color) {
      if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({
        color, roughness: 0.92, metalness: 0.02
      }));
      return materials.get(color);
    }
    function geometry(key, make) {
      if (!geometries.has(key)) geometries.set(key, make());
      return geometries.get(key);
    }
    function add(parent, geo, color, x, y, z, rot) {
      const mesh = new THREE.Mesh(geo, material(color));
      mesh.position.set(x || 0, y || 0, z || 0);
      if (rot) mesh.rotation.y = rot;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      parent.add(mesh);
      return mesh;
    }
    function cube(parent, w, h, d, color, x, y, z) {
      return add(parent, geometry("b:" + w + ":" + h + ":" + d,
        () => new THREE.BoxGeometry(w, h, d)), color, x, y, z);
    }
    function cylinder(parent, r, h, color, x, y, z) {
      return add(parent, geometry("c:" + r + ":" + h,
        () => new THREE.CylinderGeometry(r, r, h, 7)), color, x, y, z);
    }
    function ball(parent, r, color, x, y, z) {
      return add(parent, geometry("s:" + r,
        () => new THREE.IcosahedronGeometry(r, 1)), color, x, y, z);
    }
    function makePiece(kind, index) {
      const g = new THREE.Group();
      if (kind === "bench") {
        cube(g, 0.23, 0.027, 0.075, COLORS.wood, 0, 0.105, 0);
        cube(g, 0.23, 0.075, 0.018, COLORS.wood, 0, 0.152, 0.041);
        cube(g, 0.018, 0.09, 0.025, COLORS.steel, -0.09, 0.055, 0);
        cube(g, 0.018, 0.09, 0.025, COLORS.steel, 0.09, 0.055, 0);
      } else if (kind === "person") {
        const jacket = index % 3 ? COLORS.coat : COLORS.coatAlt;
        cylinder(g, 0.025, 0.082, jacket, 0, 0.115, 0);
        ball(g, 0.027, COLORS.skin, 0, 0.187, 0);
        cube(g, 0.017, 0.052, 0.017, COLORS.steel, -0.012, 0.035, 0);
        cube(g, 0.017, 0.052, 0.017, COLORS.steel, 0.012, 0.035, 0);
      } else if (kind === "lamp") {
        cylinder(g, 0.011, 0.28, COLORS.steel, 0, 0.14, 0);
        ball(g, 0.03, COLORS.lamp, 0, 0.292, 0);
        cylinder(g, 0.044, 0.012, COLORS.steel, 0, 0.322, 0);
      } else if (kind === "bicycle") {
        const wheel = geometry("wheel", () => new THREE.TorusGeometry(0.055, 0.007, 4, 10));
        add(g, wheel, COLORS.steel, -0.08, 0.063, 0);
        add(g, wheel, COLORS.steel, 0.08, 0.063, 0);
        cube(g, 0.15, 0.012, 0.012, COLORS.fabric, 0, 0.125, 0);
        cube(g, 0.013, 0.08, 0.013, COLORS.steel, -0.012, 0.112, 0);
        cube(g, 0.065, 0.012, 0.014, COLORS.steel, -0.04, 0.165, 0);
      } else if (kind === "planter") {
        cube(g, 0.18, 0.075, 0.08, COLORS.earth, 0, 0.04, 0);
        for (let i = -1; i <= 1; i++) {
          ball(g, 0.037, i === 0 ? COLORS.leafAlt : COLORS.leaf, i * 0.055, 0.1, 0);
        }
      } else if (kind === "bollard") {
        cylinder(g, 0.018, 0.115, COLORS.stone, 0, 0.058, 0);
      } else if (kind === "cafe_table") {
        cylinder(g, 0.064, 0.013, COLORS.stone, 0, 0.14, 0);
        cylinder(g, 0.009, 0.13, COLORS.steel, 0, 0.067, 0);
        cube(g, 0.035, 0.075, 0.045, COLORS.wood, 0.115, 0.065, 0);
        cube(g, 0.035, 0.075, 0.045, COLORS.wood, -0.115, 0.065, 0);
      } else if (kind === "dog") {
        cube(g, 0.095, 0.044, 0.035, COLORS.earth, 0, 0.07, 0);
        ball(g, 0.031, COLORS.earth, 0.056, 0.093, 0);
        cube(g, 0.012, 0.05, 0.012, COLORS.wood, -0.032, 0.025, -0.014);
        cube(g, 0.012, 0.05, 0.012, COLORS.wood, 0.030, 0.025, 0.014);
      } else if (kind === "transit_stop") {
        cube(g, 0.29, 0.013, 0.14, COLORS.canopy, 0, 0.29, 0);
        for (const x of [-0.125, 0.125]) {
          cube(g, 0.013, 0.28, 0.013, COLORS.steel, x, 0.14, -0.055);
        }
        cube(g, 0.12, 0.018, 0.054, COLORS.wood, 0, 0.09, -0.035);
        cube(g, 0.052, 0.073, 0.015, COLORS.fabric, -0.105, 0.23, -0.045);
      } else if (kind === "market") {
        cube(g, 0.21, 0.10, 0.13, COLORS.wood, 0, 0.08, 0);
        cube(g, 0.28, 0.025, 0.20, COLORS.canopy, 0, 0.245, 0);
        cube(g, 0.012, 0.17, 0.012, COLORS.steel, -0.10, 0.18, -0.04);
        cube(g, 0.012, 0.17, 0.012, COLORS.steel, 0.10, 0.18, -0.04);
      }
      return g;
    }

    const objects = safeBlueprint(opts.clearZones, opts.clearMargin);
    const batching = typeof THREE.InstancedMesh === "function";
    const batches = new Map();
    objects.forEach((item, index) => {
      if (!VALID_KINDS.has(item.kind)) return;
      const miniature = makePiece(item.kind, index);
      miniature.name = "decor-" + item.area + "-" + item.kind;
      const park = item.area === "st_hanshaugen" || item.area === "toyenparken" || item.area === "botanisk";
      const quay = item.area === "aker_brygge" || item.area === "bjorvika";
      const surfaceOffset = park ? 0.103 : (quay ? 0.065 : 0.073);
      miniature.position.set(opts.nx2x(item.x), ground + surfaceOffset, opts.ny2z(item.y));
      miniature.rotation.y = item.rotation;
      if (!batching) {
        group.add(miniature);
      } else {
        miniature.updateMatrixWorld(true);
        for (const part of miniature.children) {
          let byMaterial = batches.get(part.geometry);
          if (!byMaterial) { byMaterial = new Map(); batches.set(part.geometry, byMaterial); }
          let batch = byMaterial.get(part.material);
          if (!batch) { batch = []; byMaterial.set(part.material, batch); }
          batch.push(part.matrixWorld.clone());
        }
      }
    });
    // Instancing: én draw call per felles geometri/materiale i stedet for
    // én draw call per del av hver benk, person og sykkel.
    if (batching) {
      for (const [geo, byMaterial] of batches) {
        for (const [mat, matrices] of byMaterial) {
          const instance = new THREE.InstancedMesh(geo, mat, matrices.length);
          matrices.forEach((matrix, i) => instance.setMatrixAt(i, matrix));
          instance.instanceMatrix.needsUpdate = true;
          // Objektene er spredt over kartet; bevar alle også ved panorering.
          instance.frustumCulled = false;
          instance.castShadow = false;
          instance.receiveShadow = false;
          group.add(instance);
        }
      }
    }
    return {
      group, count: objects.length, drawGroups: group.children.length,
      skipped: getBlueprint().length - objects.length, batched: batching,
      areas: Array.from(new Set(objects.map((item) => item.area)))
    };
  }

  root.CivicationMapMicroWorld = { create, getBlueprint, safeBlueprint, validKinds: () => Array.from(VALID_KINDS) };
})(typeof window !== "undefined" ? window : globalThis);
