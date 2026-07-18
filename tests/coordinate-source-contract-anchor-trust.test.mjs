import assert from 'node:assert/strict';
import { validateCoordinateSource } from '../dist/tools/coordinate-source-contract.mjs';
const g={id:'g',lat:59.91535,lon:10.75335,r:180,locatorType:'street',sourceProvider:'manual_research',sourceObjectId:'s:g',geocodeAccuracy:'semantic_anchor',coordRole:'line_anchor',coordType:'street_midpoint',coordStatus:'verified_geometry',coordNote:'Dokumentert linjeanker med eksplisitte ruteankre.',anchors:[{id:'a',name:'A',type:'route_point',lat:59.91,lon:10.75,r:50}]};assert.equal(validateCoordinateSource(g).trust,'verified');
const h={id:'h',lat:59.90806,lon:10.75528,r:220,locatorType:'historic_site',sourceProvider:'manual_research',sourceObjectId:'s:h',geocodeAccuracy:'historical_approximation',coordRole:'historical_anchor',coordType:'historic_site_anchor',coordStatus:'verified_historical_source',coordNote:'Historisk anker for et dokumentert, revet anlegg.'};assert.equal(validateCoordinateSource(h).trust,'verified');assert.notEqual(validateCoordinateSource({...g,coordRole:'display_marker',anchors:[]}).trust,'verified');console.log('coordinate-source-contract anchor trust: PASS');

const historicalSemanticAnchor = {
  id: 'test_historic_semantic', lat: 59.9107593, lon: 10.7265121, r: 260,
  locatorType: 'historic_site', sourceProvider: 'manual_research', sourceObjectId: 'source:test-historic-semantic',
  geocodeAccuracy: 'semantic_anchor', coordRole: 'area_anchor', coordType: 'historic_site_anchor',
  coordStatus: 'verified_historical_source', coordNote: 'Dokumentert historisk områdeanker støttet av flere fysiske markører.',
  anchors: [{ id: 'h1', name: 'Historisk markør', type: 'historic_marker', lat: 59.9108, lon: 10.7265, r: 25 }]
};
assert.equal(validateCoordinateSource(historicalSemanticAnchor).trust, 'verified');
