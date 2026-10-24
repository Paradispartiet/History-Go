import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const distanceMetres = (a,b) => {
  const rad = Math.PI / 180;
  const dLat = (b.lat-a.lat)*rad, dLon=(b.lon-a.lon)*rad;
  const x=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;
  return 6371000 * 2*Math.asin(Math.sqrt(x));
};

test('independently listed Ekeberg restaurant POIs agree, but candidate is not an entrance pin', () => {
  const pack=load('reports/place-production/oslo-six-geolocation-candidates-20261022.json');
  const geo=load('reports/place-production/oslo-six-geo-entrance-source-audit-20261022.json');
  assert.equal(pack.status,'RESEARCH_CANDIDATES_NO_CANONICAL_COORDINATES');
  const p=pack.places.find(p=>p.place_id==='ekebergrestauranten');
  assert.equal(p.evidence.length,3);
  assert.ok(distanceMetres(p.evidence[0],p.evidence[1])<p.cross_source_agreement_m_max);
  assert.ok(distanceMetres(p.evidence[0],p.evidence[2])>20);
  assert.ok(distanceMetres(p.evidence[0],p.provisional_poi)<5);
  assert.equal(p.visitor_radius_m,null);
  assert.equal(p.public_entrance_coordinate_verified,false);
  assert.ok(p.evidence.every(e=>e.source.startsWith('https://')));
  const hold=geo.places.find(x=>x.place_id===p.place_id);
  assert.equal(hold.coordinate,null);
  assert.equal(hold.radius_m,null);
  assert.equal(hold.coordinate_status,'HOLD');
});

test('Sarabråten ruin place must not be merged with the separate memorial viewpoint', () => {
  const pack=load('reports/place-production/oslo-six-geolocation-candidates-20261022.json');
  const geo=load('reports/place-production/oslo-six-geo-entrance-source-audit-20261022.json');
  const p=pack.places.find(p=>p.place_id==='sarabraten');
  assert.equal(p.evidence.length,3);
  assert.ok(distanceMetres(p.evidence[0],p.evidence[1])>10);
  assert.ok(distanceMetres(p.evidence[0],p.evidence[1])<30);
  assert.ok(distanceMetres(p.evidence[0],p.evidence[2])>60);
  assert.deepEqual(p.provisional_poi,{lat:59.89177,lon:10.87884});
  assert.match(p.evidence[2].accuracy_statement,/not a verified location for former villa ruins/i);
  assert.equal(p.public_entrance_coordinate_verified,false);
  assert.equal(p.visitor_radius_m,null);
  const hold=geo.places.find(x=>x.place_id===p.place_id);
  assert.equal(hold.coordinate,null);
  assert.equal(hold.radius_m,null);
  assert.equal(hold.coordinate_status,'HOLD');
});

test('2026-10-23 Ekeberg footprint and Sarabråten approach evidence remain separate from the playable visitor anchor',()=>{
  const pack=load('reports/place-production/oslo-six-geolocation-candidates-20261022.json');
  const ek=pack.places.find(p=>p.place_id==='ekebergrestauranten');
  const sar=pack.places.find(p=>p.place_id==='sarabraten');
  assert.equal(ek.building_footprint_candidate.upstream_osm_way_id,115901265);
  assert.ok(distanceMetres(ek.provisional_poi,ek.building_footprint_candidate)<15);
  assert.ok(distanceMetres(ek.provisional_poi,ek.building_footprint_candidate)>5);
  assert.equal(ek.building_footprint_candidate.usable_as_canonical_visitor_point,false);
  assert.equal(ek.building_footprint_candidate.usable_as_radius_basis,false);
  assert.equal(ek.official_public_approach_evidence.exact_public_entrance_location,null);
  assert.equal(ek.official_public_approach_evidence.safe_gps_release,false);
  assert.match(sar.documented_walkway_approach.approach,/Ulsrudvannet/);
  assert.match(sar.documented_walkway_approach.approach,/Nøklevann/);
  assert.equal(sar.documented_walkway_approach.exact_ruin_site_trail_waypoint,null);
  assert.equal(sar.documented_walkway_approach.safe_gps_release,false);
  assert.equal(sar.public_entrance_coordinate_verified,false);
  assert.equal(ek.public_entrance_coordinate_verified,false);
});
