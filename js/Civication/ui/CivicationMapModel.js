// CivicationMapModel.js
// Civication Map v2.2 – Oslo-skjelett model for Civication playboard city map.
(function () {
  const DISTRICTS = [
    {
      id: "sentrum", name: "Sentrum", type: "makt/offentlighet/handel", role: "civic_core", primaryFunction: "power", secondaryFunctions: ["store", "debate", "work", "people"],
      visualWeight: 1, density: 0.95, mood: "formal_pressure", districtScale: 1.04, labelPriority: 10, blockDensity: 0.95, landmarkPriority: 1, corridorWeight: 1,
      center: [0.50, 0.68],
      shape: [[0.44,0.61],[0.57,0.61],[0.60,0.68],[0.56,0.74],[0.49,0.76],[0.42,0.72],[0.41,0.66]],
      style: { fill: "#d8c29e", stroke: "#715a43", blockFill:"rgba(39,39,45,0.42)", blockStroke:"rgba(255,245,226,0.24)", labelFill:"#fff7e2", labelSize:16, pattern:"dense_grid", landmarkStyle:{shape:"civic"} },
      functions: { work: 0.9, housing: 0.3, store: 0.95, debate: 0.95, people: 0.85, leisure: 0.65 },
      blocks: "dense_grid", labels: [{ text: "Sentrum", dx: 0, dy: -16 }], buildings: ["radhus", "storting", "oslo_s", "akershus"]
    },
    { id:"grunerlokka", name:"Grünerløkka", type:"kultur/subkultur", role:"creative_cluster", primaryFunction:"people", secondaryFunctions:["leisure","debate","store"], visualWeight:0.85, density:0.82, mood:"creative_friction", districtScale:0.95, labelPriority:9, blockDensity:0.82, landmarkPriority:2, corridorWeight:0.84, center:[0.54,0.53], shape:[[0.46,0.41],[0.60,0.42],[0.63,0.49],[0.58,0.55],[0.50,0.56],[0.45,0.49]], style:{fill:"#c7b3d8",stroke:"#5b436d",blockFill:"rgba(45,30,56,0.30)",blockStroke:"rgba(247,228,255,0.22)",labelFill:"#f3e8ff",labelSize:15,pattern:"creative_mix",landmarkStyle:{shape:"culture"}}, functions:{work:0.6,housing:0.55,store:0.6,debate:0.8,people:0.88,leisure:0.95}, blocks:"creative_mix", labels:[{text:"Grünerløkka",dx:0,dy:-13}], buildings:["kulturhus","scene"] },
    { id:"frogner", name:"Frogner", type:"status/handel/bolig", role:"status_commerce", primaryFunction:"store", secondaryFunctions:["housing","people"], visualWeight:0.82, density:0.62, mood:"curated_status", districtScale:0.96, labelPriority:8, blockDensity:0.62, landmarkPriority:3, corridorWeight:0.74, center:[0.34,0.64], shape:[[0.22,0.57],[0.40,0.57],[0.43,0.65],[0.38,0.72],[0.28,0.74],[0.20,0.67]], style:{fill:"#e2d5c0",stroke:"#78634a",blockFill:"rgba(58,52,41,0.23)",blockStroke:"rgba(255,247,235,0.2)",labelFill:"#fff5e6",labelSize:14,pattern:"villa_blocks",landmarkStyle:{shape:"commerce"}}, functions:{work:0.7,housing:0.8,store:0.85,debate:0.5,people:0.6,leisure:0.7}, blocks:"villa_blocks", labels:[{text:"Frogner",dx:-2,dy:-13}], buildings:["handelshus"] },
    { id:"sagene", name:"Sagene", type:"bolig/nabolag/historie", role:"residential_legacy", primaryFunction:"housing", secondaryFunctions:["people","leisure"], visualWeight:0.74, density:0.78, mood:"stable_neighborhood", districtScale:0.91, labelPriority:7, blockDensity:0.78, landmarkPriority:6, corridorWeight:0.72, center:[0.53,0.44], shape:[[0.44,0.34],[0.59,0.35],[0.62,0.43],[0.58,0.49],[0.50,0.51],[0.42,0.45]], style:{fill:"#d7c39d",stroke:"#705837",blockFill:"rgba(54,45,30,0.24)",blockStroke:"rgba(255,245,221,0.2)",labelFill:"#fff1d6",labelSize:13,pattern:"residential_rows",landmarkStyle:{shape:"housing"}}, functions:{work:0.45,housing:0.92,store:0.45,debate:0.5,people:0.65,leisure:0.6}, blocks:"residential_rows", labels:[{text:"Sagene",dx:0,dy:-12}], buildings:["boligblokk","sagene_mill"] },
    { id:"gamle_oslo", name:"Gamle Oslo", type:"overgang/byutvikling/arbeid", role:"transition_growth", primaryFunction:"work", secondaryFunctions:["housing","debate"], visualWeight:0.88, density:0.73, mood:"in_transition", districtScale:0.98, labelPriority:8, blockDensity:0.73, landmarkPriority:4, corridorWeight:0.88, center:[0.62,0.70], shape:[[0.55,0.62],[0.70,0.62],[0.73,0.71],[0.69,0.79],[0.62,0.82],[0.54,0.75]], style:{fill:"#cabda9",stroke:"#645749",blockFill:"rgba(49,41,35,0.25)",blockStroke:"rgba(251,241,227,0.2)",labelFill:"#fff1df",labelSize:14,pattern:"mixed_transition",landmarkStyle:{shape:"work"}}, functions:{work:0.78,housing:0.62,store:0.55,debate:0.6,people:0.65,leisure:0.5}, blocks:"mixed_transition", labels:[{text:"Gamle Oslo",dx:0,dy:-14}], buildings:["kontor","plass","barcode"] },
    { id:"alna", name:"Alna", type:"arbeid/logistikk/industri", role:"industry_logistics", primaryFunction:"work", secondaryFunctions:["store"], visualWeight:0.83, density:0.58, mood:"productive_pressure", districtScale:1.02, labelPriority:8, blockDensity:0.58, landmarkPriority:2, corridorWeight:0.98, center:[0.75,0.52], shape:[[0.66,0.43],[0.86,0.43],[0.89,0.53],[0.83,0.61],[0.72,0.63],[0.65,0.53]], style:{fill:"#b8bdc3",stroke:"#4d5560",blockFill:"rgba(31,38,49,0.34)",blockStroke:"rgba(236,243,255,0.2)",labelFill:"#edf4ff",labelSize:14,pattern:"industry_yards",landmarkStyle:{shape:"industry"}}, functions:{work:0.98,housing:0.25,store:0.35,debate:0.45,people:0.5,leisure:0.3}, blocks:"industry_yards", labels:[{text:"Alna",dx:0,dy:-12}], buildings:["industri","logistikk"] },
    { id:"nordstrand", name:"Nordstrand", type:"grønt/bolig/ro", role:"green_residential", primaryFunction:"leisure", secondaryFunctions:["housing"], visualWeight:0.77, density:0.48, mood:"calm_green", districtScale:1.03, labelPriority:7, blockDensity:0.48, landmarkPriority:5, corridorWeight:0.76, center:[0.72,0.84], shape:[[0.62,0.76],[0.81,0.76],[0.88,0.86],[0.84,0.95],[0.72,0.98],[0.60,0.89]], style:{fill:"#9fbe8f",stroke:"#3f5d37",blockFill:"rgba(29,57,32,0.21)",blockStroke:"rgba(235,255,238,0.18)",labelFill:"#ecffe9",labelSize:14,pattern:"green_living",landmarkStyle:{shape:"green"}}, functions:{work:0.32,housing:0.9,store:0.35,debate:0.3,people:0.45,leisure:0.92}, blocks:"green_living", labels:[{text:"Nordstrand",dx:0,dy:-14}], buildings:["park","boligblokk","ekeberg"] },
    { id:"st_hanshaugen", name:"St. Hanshaugen", type:"kultur/kafé/litteratur", role:"culture_cafe", primaryFunction:"debate", secondaryFunctions:["leisure","people"], visualWeight:0.78, density:0.76, mood:"reflective_urban", districtScale:0.9, labelPriority:8, blockDensity:0.76, landmarkPriority:4, corridorWeight:0.72, center:[0.45,0.58], shape:[[0.36,0.51],[0.51,0.51],[0.54,0.59],[0.48,0.65],[0.38,0.65],[0.34,0.58]], style:{fill:"#d8c4a0",stroke:"#725c3e",blockFill:"rgba(58,41,24,0.25)",blockStroke:"rgba(255,245,226,0.2)",labelFill:"#fff2de",labelSize:13,pattern:"cafe_grid",landmarkStyle:{shape:"culture"}}, functions:{work:0.55,housing:0.65,store:0.6,debate:0.78,people:0.7,leisure:0.84}, blocks:"cafe_grid", labels:[{text:"St. Hanshaugen",dx:0,dy:-14}], buildings:["bibliotek","kulturhus"] },
    { id:"ullern", name:"Ullern", type:"kapital/bolig/status", role:"capital_residential", primaryFunction:"housing", secondaryFunctions:["work","store"], visualWeight:0.74, density:0.55, mood:"private_capital", districtScale:1.01, labelPriority:7, blockDensity:0.55, landmarkPriority:5, corridorWeight:0.7, center:[0.21,0.66], shape:[[0.08,0.58],[0.30,0.58],[0.32,0.69],[0.26,0.77],[0.16,0.79],[0.07,0.70]], style:{fill:"#d9d2c5",stroke:"#6f6658",blockFill:"rgba(61,56,47,0.2)",blockStroke:"rgba(255,248,238,0.2)",labelFill:"#fff7ef",labelSize:13,pattern:"villa_blocks",landmarkStyle:{shape:"status"}}, functions:{work:0.62,housing:0.86,store:0.55,debate:0.35,people:0.48,leisure:0.58}, blocks:"villa_blocks", labels:[{text:"Ullern",dx:0,dy:-14}], buildings:["kontor","boligblokk"] },
    { id:"stovner", name:"Stovner", type:"lokalmiljø/grønt/avstand", role:"edge_local", primaryFunction:"housing", secondaryFunctions:["leisure","people"], visualWeight:0.7, density:0.5, mood:"edge_distance", districtScale:0.97, labelPriority:6, blockDensity:0.5, landmarkPriority:6, corridorWeight:0.66, center:[0.83,0.30], shape:[[0.74,0.21],[0.93,0.21],[0.97,0.30],[0.93,0.38],[0.83,0.41],[0.73,0.33]], style:{fill:"#a8bf9a",stroke:"#4a6142",blockFill:"rgba(34,54,35,0.2)",blockStroke:"rgba(235,253,233,0.18)",labelFill:"#f0ffea",labelSize:13,pattern:"open_quarters",landmarkStyle:{shape:"green"}}, functions:{work:0.4,housing:0.75,store:0.35,debate:0.35,people:0.5,leisure:0.82}, blocks:"open_quarters", labels:[{text:"Stovner",dx:0,dy:-12}], buildings:["park","plass","stovner_node"] }
  ];

  const CONNECTIONS = [["ullern","frogner"],["frogner","sentrum"],["sagene","grunerlokka"],["grunerlokka","sentrum"],["sentrum","gamle_oslo"],["gamle_oslo","alna"],["alna","stovner"],["sentrum","nordstrand"],["gamle_oslo","nordstrand"],["frogner","st_hanshaugen"],["st_hanshaugen","grunerlokka"],["grunerlokka","gamle_oslo"],["st_hanshaugen","sentrum"],["alna","sentrum"]];
  const LANDMARKS = [
    {id:"radhus",kind:"power",district:"sentrum",offset:[-16,10]},{id:"oslo_s",kind:"transport",district:"sentrum",offset:[18,10]},{id:"akershus",kind:"fortress",district:"sentrum",offset:[-4,22]},
    {id:"barcode",kind:"skyline",district:"gamle_oslo",offset:[15,4]},{id:"industri",kind:"industry",district:"alna",offset:[8,6]},{id:"logistikk",kind:"industry",district:"alna",offset:[-16,-8]},
    {id:"ekeberg",kind:"green",district:"nordstrand",offset:[8,-2]},{id:"sagene_mill",kind:"industry",district:"sagene",offset:[10,8]},
    {id:"kulturhus",kind:"culture",district:"grunerlokka",offset:[-12,10]},{id:"handelshus",kind:"commerce",district:"frogner",offset:[8,2]},
    {id:"bibliotek",kind:"culture",district:"st_hanshaugen",offset:[8,4]},{id:"stovner_node",kind:"public",district:"stovner",offset:[-8,5]}
  ];

  const OSLO_SKELETON = {
    anchors: {
      sentrum:[0.50,0.68], radhus_fjord:[0.45,0.74], oslo_s:[0.56,0.70], akerselva_mouth:[0.50,0.74],
      grunerlokka:[0.54,0.53], sagene:[0.53,0.44], frogner:[0.34,0.64], ullern:[0.21,0.66],
      gamle_oslo:[0.62,0.70], alna:[0.75,0.52], nordstrand:[0.72,0.84], stovner:[0.83,0.30]
    }
  };

  const OSLO_LANDSCAPE = {
    markaNorth:[[0.00,0.00],[1.00,0.00],[1.00,0.38],[0.86,0.34],[0.72,0.36],[0.58,0.33],[0.44,0.36],[0.30,0.32],[0.16,0.35],[0.00,0.30]],
    cityBasin:[[0.05,0.30],[0.16,0.26],[0.30,0.29],[0.44,0.27],[0.58,0.31],[0.72,0.28],[0.86,0.33],[0.95,0.45],[0.93,0.80],[0.82,0.89],[0.64,0.92],[0.50,0.86],[0.38,0.90],[0.20,0.88],[0.06,0.78]],
    ekebergRidge:[[0.61,0.66],[0.80,0.68],[0.87,0.84],[0.76,0.94],[0.61,0.89],[0.58,0.76]],
    fjord:[[0.00,0.70],[1.00,0.73],[1.00,1.00],[0.00,1.00]],
    innerFjordArm:[[0.33,0.74],[0.45,0.67],[0.56,0.68],[0.70,0.74],[0.64,0.84],[0.47,0.88],[0.31,0.83]],
    akerselva:[[0.52,0.31],[0.53,0.37],[0.53,0.43],[0.54,0.50],[0.53,0.57],[0.52,0.63],[0.51,0.69],[0.50,0.75]]
  };

  const OSLO_CORRIDORS = [
    { id:"west_corridor", from:"ullern", to:"sentrum", via:["frogner"], style:"west" },
    { id:"east_corridor", from:"sentrum", to:"alna", via:["gamle_oslo"], style:"east" },
    { id:"grorud_corridor", from:"alna", to:"stovner", style:"grorud" },
    { id:"southeast_corridor", from:"sentrum", to:"nordstrand", via:["gamle_oslo"], style:"southeast" },
    { id:"river_corridor", from:"sagene", to:"sentrum", via:["grunerlokka"], style:"river" },
    { id:"inner_ring", ring:["frogner","st_hanshaugen","grunerlokka","gamle_oslo","sentrum"], style:"ring" }
  ];

  const BLOCK_PATTERNS = { dense_grid:{cols:9,rows:6,size:[10,7],gap:3,variant:"dense_grid"}, creative_mix:{cols:7,rows:5,size:[10,8],gap:4,variant:"creative_mix"}, villa_blocks:{cols:5,rows:3,size:[13,10],gap:6,variant:"villa_blocks"}, residential_rows:{cols:9,rows:4,size:[10,6],gap:3,variant:"residential_rows"}, mixed_transition:{cols:7,rows:4,size:[11,7],gap:4,variant:"mixed_transition"}, industry_yards:{cols:6,rows:3,size:[15,10],gap:6,variant:"industry_yards"}, green_living:{cols:5,rows:3,size:[12,8],gap:7,variant:"green_living"}, cafe_grid:{cols:7,rows:4,size:[10,7],gap:4,variant:"cafe_grid"}, open_quarters:{cols:4,rows:3,size:[11,8],gap:8,variant:"open_quarters"} };

  window.CIVI_MAP_DISTRICTS = DISTRICTS;
  window.CIVI_MAP_CONNECTIONS = CONNECTIONS;
  window.CIVI_MAP_LANDMARKS = LANDMARKS;
  window.CIVI_MAP_BLOCK_PATTERNS = BLOCK_PATTERNS;
  window.CIVI_OSLO_SKELETON = OSLO_SKELETON;
  window.CIVI_OSLO_LANDSCAPE = OSLO_LANDSCAPE;
  window.CIVI_OSLO_CORRIDORS = OSLO_CORRIDORS;
  window.CIVI_OSLO_ANCHORS = OSLO_SKELETON.anchors;
})();
