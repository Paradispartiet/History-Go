// CivicationMicroWorldDistricts.js
// Kuratert, rolig mikroliv. Normaliserte koordinater i eksisterende 3D-kart.
// Disse er kun dekorasjon: ingen nye steder, knapper eller spillhendelser.
(function (root) {
  "use strict";
  if (root.CivicationMicroWorldDistricts) return;

  // Tier 1 sees already at normal map zoom, tier 2 is an optional closer look.
  const districts = [
    { id: "sentrum_passasje", x: 0.506, y: 0.550, tier: 1, items: [
      ["person", -0.009, -0.005, 0.2], ["person", 0.006, 0.003, 1.1],
      ["kiosk", 0.001, -0.003, 0.1], ["bicycle", -0.004, 0.007, 0.5],
      ["waste_bin", 0.010, -0.005, 0], ["lamp", -0.010, 0.006, 0],
      ["planter", 0.005, 0.009, 0.4]
    ] },
    { id: "torggata", x: 0.528, y: 0.535, tier: 1, items: [
      ["cafe_table", -0.007, 0.002, -0.3], ["cafe_table", 0.006, -0.006, 0.7],
      ["person", 0.003, 0.007, 1.1], ["flower_stand", -0.004, -0.007, 0.2],
      ["waste_bin", 0.010, 0.002, 0], ["bicycle", -0.010, -0.005, 0.2],
      ["lamp", 0.009, -0.004, 0]
    ] },
    { id: "grunerlokka_bakgate", x: 0.574, y: 0.447, tier: 1, items: [
      ["kiosk", -0.004, 0.001, 0.8], ["person", 0.007, 0.005, 0.5],
      ["person", -0.006, -0.006, -0.5], ["bicycle", 0.003, -0.009, 0],
      ["planter", -0.009, 0.005, 0.3], ["lamp", 0.010, -0.005, 0]
    ] },
    { id: "frogner_alle", x: 0.345, y: 0.546, tier: 1, items: [
      ["bench", -0.009, 0.005, 0.5], ["person", 0.008, -0.004, 0.2],
      ["planter", -0.004, -0.007, 0], ["planter", 0.004, 0.009, 0],
      ["lamp", -0.011, -0.003, 0], ["dog", 0.010, 0.007, 0.5],
      ["waste_bin", 0.001, -0.011, 0]
    ] },
    { id: "gamle_oslo", x: 0.620, y: 0.571, tier: 1, items: [
      ["market", -0.007, 0.002, -0.3], ["person", 0.004, -0.007, 0.7],
      ["person", 0.011, 0.003, -1.1], ["bicycle", -0.006, -0.009, 0.2],
      ["flower_stand", 0.004, 0.008, 0.4], ["lamp", -0.012, 0.009, 0],
      ["waste_bin", 0.011, -0.006, 0]
    ] },
    { id: "alna_arbeid", x: 0.762, y: 0.521, tier: 1, items: [
      ["transit_stop", -0.009, 0.006, 0.3], ["person", 0.003, 0.009, 0.4],
      ["bicycle", 0.008, -0.007, 0.5], ["bollard", -0.011, -0.005, 0],
      ["waste_bin", 0.012, 0.002, 0], ["lamp", 0.009, 0.007, 0]
    ] },
    // Small discoveries that become visible only when the player zooms closer.
    { id: "st_hanshaugen_sor", x: 0.472, y: 0.552, tier: 2, items: [
      ["fountain", 0, 0, 0], ["person", 0.008, 0.006, 0],
      ["bench", -0.009, -0.005, 0.2], ["lamp", -0.008, 0.008, 0],
      ["planter", 0.009, -0.008, 0.7], ["dog", 0.004, -0.010, -0.4]
    ] },
    { id: "bygdoy_sti", x: 0.190, y: 0.714, tier: 2, items: [
      ["bench", -0.008, 0.003, 0.3], ["person", 0.003, 0.007, 0.8],
      ["dog", -0.003, -0.007, 0.2], ["lamp", 0.010, -0.006, 0],
      ["waste_bin", -0.010, -0.005, 0], ["planter", 0.009, 0.006, 0]
    ] },
    { id: "ekeberg_lia", x: 0.716, y: 0.666, tier: 2, items: [
      ["bench", -0.008, 0.002, 0.6], ["person", 0.003, -0.008, 0.7],
      ["dog", 0.009, -0.003, -0.4], ["planter", -0.007, -0.008, 0],
      ["lamp", 0.009, 0.009, 0], ["bicycle", -0.003, 0.009, 0.8]
    ] },
    { id: "ulleval_kant", x: 0.437, y: 0.318, tier: 2, items: [
      ["transit_stop", 0.001, -0.004, 0.4], ["person", -0.010, 0.002, -0.3],
      ["person", 0.009, 0.006, 0.2], ["waste_bin", 0.010, -0.007, 0],
      ["bicycle", -0.007, -0.009, 0.7], ["lamp", -0.003, 0.009, 0]
    ] },
    { id: "nordstrand_tun", x: 0.746, y: 0.733, tier: 2, items: [
      ["bench", 0.001, 0.005, 0.3], ["person", 0.009, -0.005, 0.8],
      ["dog", -0.008, -0.004, 0.4], ["planter", -0.009, 0.007, 0],
      ["planter", 0.007, 0.008, 0.2], ["lamp", -0.004, -0.010, 0],
      ["waste_bin", 0.009, 0.003, 0]
    ] },
    { id: "sagene_elvebred", x: 0.494, y: 0.419, tier: 2, items: [
      ["bench", -0.008, 0.006, -0.4], ["bench", 0.009, -0.002, 0.6],
      ["person", 0.002, 0.008, 0.5], ["person", -0.002, -0.006, -0.3],
      ["flower_stand", 0.008, 0.009, 0.1], ["planter", -0.010, -0.006, 0],
      ["lamp", 0.009, -0.009, 0]
    ] },
    { id: "majorstuen_sidegate", x: 0.319, y: 0.534, tier: 2, items: [
      ["cafe_table", -0.007, 0.001, 0], ["parasol", 0.003, -0.002, 0.4],
      ["person", -0.002, -0.010, 0.5], ["waste_bin", 0.011, 0.005, 0],
      ["bicycle", -0.010, -0.007, 0.2], ["lamp", 0.010, -0.009, 0]
    ] },
    { id: "bjorvika_passasje", x: 0.634, y: 0.581, tier: 2, items: [
      ["parasol", -0.005, 0.002, 0], ["cafe_table", 0.006, -0.004, 0.5],
      ["person", 0.003, 0.008, 0.8], ["planter", -0.009, -0.007, 0.2],
      ["bollard", 0.011, 0.005, 0], ["waste_bin", 0.010, -0.008, 0],
      ["lamp", -0.010, 0.009, 0]
    ] }
  ];

  root.CivicationMicroWorldDistricts = districts;
})(typeof window !== "undefined" ? window : globalThis);
