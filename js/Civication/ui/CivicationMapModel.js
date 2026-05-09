// CivicationMapModel.js
// Map v2 model for Civication playboard city map.
(function () {
  const DISTRICTS = [
    { id:"sentrum", name:"Sentrum", type:"makt/offentlighet/handel", center:[0.49,0.56], shape:[[0.41,0.50],[0.57,0.50],[0.59,0.60],[0.48,0.65],[0.40,0.61]], style:{fill:"#d8c29e",stroke:"#6d5841"}, functions:{work:0.9,housing:0.3,store:0.95,debate:0.95,people:0.85,leisure:0.65}, blocks:"dense_grid", labels:[{text:"Sentrum",dx:0,dy:-12}], buildings:["radhus","storting"] },
    { id:"grunerlokka", name:"Grünerløkka", type:"kultur/subkultur", center:[0.46,0.44], shape:[[0.39,0.38],[0.53,0.38],[0.56,0.47],[0.48,0.52],[0.38,0.48]], style:{fill:"#c7b3d8",stroke:"#5b436d"}, functions:{work:0.6,housing:0.55,store:0.6,debate:0.8,people:0.88,leisure:0.95}, blocks:"creative_mix", labels:[{text:"Grünerløkka",dx:0,dy:-14}], buildings:["kulturhus","scene"] },
    { id:"frogner", name:"Frogner", type:"status/handel/bolig", center:[0.34,0.55], shape:[[0.24,0.50],[0.41,0.49],[0.42,0.60],[0.30,0.64],[0.22,0.59]], style:{fill:"#e2d5c0",stroke:"#78634a"}, functions:{work:0.7,housing:0.8,store:0.85,debate:0.5,people:0.6,leisure:0.7}, blocks:"villa_blocks", labels:[{text:"Frogner",dx:-2,dy:-14}], buildings:["handelshus"] },
    { id:"sagene", name:"Sagene", type:"bolig/nabolag/historie", center:[0.43,0.34], shape:[[0.35,0.28],[0.50,0.28],[0.53,0.38],[0.44,0.42],[0.33,0.37]], style:{fill:"#d7c39d",stroke:"#705837"}, functions:{work:0.45,housing:0.92,store:0.45,debate:0.5,people:0.65,leisure:0.6}, blocks:"residential_rows", labels:[{text:"Sagene",dx:0,dy:-12}], buildings:["boligblokk"] },
    { id:"gamle_oslo", name:"Gamle Oslo", type:"overgang/byutvikling/arbeid", center:[0.55,0.61], shape:[[0.48,0.54],[0.64,0.54],[0.66,0.66],[0.58,0.71],[0.48,0.66]], style:{fill:"#cabda9",stroke:"#645749"}, functions:{work:0.78,housing:0.62,store:0.55,debate:0.6,people:0.65,leisure:0.5}, blocks:"mixed_transition", labels:[{text:"Gamle Oslo",dx:0,dy:-14}], buildings:["kontor","plass"] },
    { id:"alna", name:"Alna", type:"arbeid/logistikk/industri", center:[0.62,0.43], shape:[[0.54,0.36],[0.74,0.36],[0.75,0.49],[0.63,0.54],[0.54,0.48]], style:{fill:"#b8bdc3",stroke:"#4d5560"}, functions:{work:0.98,housing:0.25,store:0.35,debate:0.45,people:0.5,leisure:0.3}, blocks:"industry_yards", labels:[{text:"Alna",dx:0,dy:-12}], buildings:["industri","logistikk"] },
    { id:"nordstrand", name:"Nordstrand", type:"grønt/bolig/ro", center:[0.57,0.76], shape:[[0.48,0.70],[0.67,0.70],[0.72,0.84],[0.58,0.90],[0.47,0.83]], style:{fill:"#9fbe8f",stroke:"#3f5d37"}, functions:{work:0.32,housing:0.9,store:0.35,debate:0.3,people:0.45,leisure:0.92}, blocks:"green_living", labels:[{text:"Nordstrand",dx:0,dy:-14}], buildings:["park","boligblokk"] },
    { id:"st_hanshaugen", name:"St. Hanshaugen", type:"kultur/kafé/litteratur", center:[0.40,0.49], shape:[[0.33,0.44],[0.47,0.43],[0.49,0.52],[0.41,0.56],[0.32,0.52]], style:{fill:"#d8c4a0",stroke:"#725c3e"}, functions:{work:0.55,housing:0.65,store:0.6,debate:0.78,people:0.7,leisure:0.84}, blocks:"cafe_grid", labels:[{text:"St. Hanshaugen",dx:0,dy:-14}], buildings:["bibliotek","kulturhus"] },
    { id:"ullern", name:"Ullern", type:"kapital/bolig/status", center:[0.28,0.58], shape:[[0.17,0.52],[0.36,0.52],[0.37,0.64],[0.27,0.70],[0.16,0.63]], style:{fill:"#d9d2c5",stroke:"#6f6658"}, functions:{work:0.62,housing:0.86,store:0.55,debate:0.35,people:0.48,leisure:0.58}, blocks:"villa_blocks", labels:[{text:"Ullern",dx:0,dy:-14}], buildings:["kontor","boligblokk"] },
    { id:"stovner", name:"Stovner", type:"lokalmiljø/grønt/avstand", center:[0.65,0.22], shape:[[0.56,0.15],[0.76,0.15],[0.80,0.27],[0.68,0.33],[0.56,0.27]], style:{fill:"#a8bf9a",stroke:"#4a6142"}, functions:{work:0.4,housing:0.75,store:0.35,debate:0.35,people:0.5,leisure:0.82}, blocks:"open_quarters", labels:[{text:"Stovner",dx:0,dy:-12}], buildings:["park","plass"] }
  ];

  const CONNECTIONS = [
    ["stovner","alna"],["alna","gamle_oslo"],["gamle_oslo","sentrum"],["sentrum","frogner"],["sentrum","grunerlokka"],["grunerlokka","sagene"],["sentrum","nordstrand"],["st_hanshaugen","sentrum"],["ullern","frogner"]
  ];
  const LANDMARKS = [
    {id:"radhus",kind:"power",district:"sentrum",offset:[14,10]},{id:"storting",kind:"power",district:"sentrum",offset:[-18,-4]},
    {id:"industri",kind:"industry",district:"alna",offset:[8,6]},{id:"logistikk",kind:"industry",district:"alna",offset:[-16,-8]},
    {id:"park",kind:"green",district:"nordstrand",offset:[0,8]},{id:"bibliotek",kind:"culture",district:"st_hanshaugen",offset:[8,4]},
    {id:"kulturhus",kind:"culture",district:"grunerlokka",offset:[-12,10]},{id:"handelshus",kind:"commerce",district:"frogner",offset:[8,2]},
    {id:"kontor",kind:"work",district:"gamle_oslo",offset:[-8,8]},{id:"plass",kind:"public",district:"gamle_oslo",offset:[12,-6]},
    {id:"boligblokk",kind:"housing",district:"sagene",offset:[0,8]},{id:"scene",kind:"culture",district:"grunerlokka",offset:[10,-8]}
  ];

  const BLOCK_PATTERNS = {
    dense_grid:{cols:8,rows:5,size:[10,7],gap:3}, creative_mix:{cols:7,rows:4,size:[10,8],gap:4}, villa_blocks:{cols:5,rows:3,size:[12,9],gap:5},
    residential_rows:{cols:8,rows:4,size:[9,6],gap:3}, mixed_transition:{cols:7,rows:4,size:[11,7],gap:4}, industry_yards:{cols:6,rows:3,size:[14,9],gap:5},
    green_living:{cols:5,rows:3,size:[11,8],gap:6}, cafe_grid:{cols:6,rows:4,size:[10,7],gap:4}, open_quarters:{cols:5,rows:3,size:[10,7],gap:6}
  };

  window.CIVI_MAP_DISTRICTS = DISTRICTS;
  window.CIVI_MAP_CONNECTIONS = CONNECTIONS;
  window.CIVI_MAP_LANDMARKS = LANDMARKS;
  window.CIVI_MAP_BLOCK_PATTERNS = BLOCK_PATTERNS;
})();
