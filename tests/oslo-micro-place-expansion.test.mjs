import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCoverage, validateDuplicateText } from '../scripts/promote-oslo-micro-place-review.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
const intake=read('reports/oslo-micro-place-expansion-2026/intake.json');
const report=read('reports/oslo-micro-place-expansion-2026/materialized-canonical-places.json');
const audit=read('reports/oslo-micro-place-expansion-2026/review-audit.json');
const review=read('reports/oslo-micro-place-expansion-2026/review-integrity-report.json');

test('utvidelsen låser nøyaktig 16 miljøpunkter, sju blå skilt og seks kuraterte snublesteiner',()=>{
  assert.equal(intake.places.length,29);
  const counts=Object.fromEntries(['miljo_gjenbruk','bla_skilt','snublestein'].map(group=>[group,intake.places.filter(row=>row.group===group).length]));
  assert.deepEqual(counts,{miljo_gjenbruk:16,bla_skilt:7,snublestein:6});
  assert.deepEqual(report.counts,counts);
  assert.equal(report.newPlaceCount,29);
  assert.equal(new Set(intake.places.map(row=>row.id)).size,29);
});

test('alle 29 er separate canonical Micro Places med riktig kategori, underkategori og kartpunkt',()=>{
  const manifest=read('data/places/manifest.json');
  const index=read('data/places/places_index.json');
  for(const row of report.places){
    const place=read(row.placeFile);
    assert.equal(place.id,row.id);
    assert.equal(place.placeTier,'micro');
    assert.equal(place.micro_place_profile?.schema,'history_go_micro_place_profile_v1');
    assert.equal(place.micro_place_profile?.quizMode,'none');
    assert.equal(place.place_card_profile,undefined);
    assert.equal(place.category,row.category);
    assert.equal(place.subcategory_id,row.subcategory_id);
    assert.ok(Number.isFinite(place.lat)&&Number.isFinite(place.lon));
    assert.ok(place.lat>=59&&place.lat<=61&&place.lon>=9&&place.lon<=12);
    assert.ok(manifest.files.includes(row.placeFile.replace(/^data\//u,'')));
    assert.equal(index.filter(item=>item.id===row.id).length,1,`${row.id} må finnes én gang i index`);
    const packet=read(`data/places/production/${row.id}.json`);
    assert.equal(packet.status,'ready_v4_2');
    assert.equal(packet.quizReadiness?.questions?.length,0);
    assert.equal(packet.reviews?.factual?.status,'passed');
    assert.equal(packet.reviews?.editorial?.status,'passed');
  }
});

test('miljøutvidelsen bruker circular_profile og ærlige driftsstatuser',()=>{
  for(const row of report.places.filter(item=>item.group==='miljo_gjenbruk')){
    const place=read(row.placeFile);
    assert.equal(place.category,'natur');
    assert.equal(place.subcategory_id,'miljo_gjenbruk');
    assert.ok(place.circular_profile);
    assert.equal(place.circular_profile.operation_status,row.status);
    for(const key of ['reuse','materials','environment','systems'])assert.ok(place.circular_profile[key]?.length>0);
  }
  const kringsja=read('data/places/natur/oslo/miljo_gjenbruk/kringsja_miljostasjon.json');
  const haraldrud=read('data/places/natur/oslo/miljo_gjenbruk/haraldrud_ombrukstelt.json');
  assert.equal(kringsja.micro_place_profile.currentStatus,'temporary_unavailable');
  assert.equal(haraldrud.micro_place_profile.currentStatus,'temporary_unavailable');
  assert.equal(haraldrud.circular_profile.operation_status,'temporary_unavailable');
  assert.match(haraldrud.popupDesc,/Brobekkveien 101/);
  assert.match(haraldrud.popupDesc,/midlertidig utilgjengelig/u);
  const hoybraten=read('data/places/natur/oslo/miljo_gjenbruk/hoybraten_miljostasjon.json');
  assert.equal(hoybraten.micro_place_profile.currentStatus,'active');
  assert.equal(hoybraten.circular_profile.operation_status,'active');
  assert.equal(hoybraten.address.street,'Fredheimveien');
});

test('blå skilt og snublesteiner bevarer én fysisk identitet per Place',()=>{
  const plaques=report.places.filter(row=>row.group==='bla_skilt').map(row=>read(row.placeFile));
  const stones=report.places.filter(row=>row.group==='snublestein').map(row=>read(row.placeFile));
  assert.equal(plaques.length,7);
  assert.deepEqual(new Set(plaques.map(row=>row.id)),new Set([
    'bla_skilt_gartnerlokka_urtegata_50',
    'bla_skilt_cathinka_guldberg_lovisenberggata_15a',
    'bla_skilt_sulpen_keysers_gate_5',
    'bla_skilt_vebjorn_tandberg_kongens_gate_15',
    'bla_skilt_kjeglebanen_briskebyveien_21',
    'bla_skilt_fredrikke_qvam_pilestredet_81',
    'bla_skilt_sophie_borchgrevink_cort_adelers_gate_33'
  ]));
  assert.deepEqual(new Set(plaques.map(row=>row.category)),new Set(['by','helse','politikk','sport','vitenskap']));
  assert.ok(plaques.every(row=>row.subcategory_id==='bla_skilt'&&row.micro_place_profile.kind==='minneskilt'));
  assert.equal(stones.length,6);
  assert.ok(stones.every(row=>row.category==='historie'&&row.subcategory_id==='snublestein'&&row.micro_place_profile.kind==='snublestein'));
  assert.equal(new Set(stones.map(row=>row.id)).size,6);
  assert.equal(new Set(stones.map(row=>`${row.lat},${row.lon}`)).size,6);
  assert.ok(stones.every(row=>!row.id.includes('calmeyer')),'Calmeyers gate skal ikke masseimporteres');
  const plaque=read('data/places/sport/oslo/bla_skilt/bla_skilt_kjeglebanen_briskebyveien_21.json');
  assert.notEqual(plaque.id,'kjeglebanen_langgaardslokken');
  assert.equal(plaque.parent_place_id,'kjeglebanen_langgaardslokken');
  assert.equal(plaque.micro_place_profile.parent_place_id,'kjeglebanen_langgaardslokken');
  assert.equal(plaque.category,'sport');
});

test('underkategoriene er registrert uten nye toppkategorier',()=>{
  const contract=read('data/categories/category_contract.json');
  assert.ok(contract.canonicalPlaceSubcategories.historie.some(row=>row.id==='snublestein'));
  for(const category of ['by','helse','politikk','sport','vitenskap'])assert.ok(contract.canonicalPlaceSubcategories[category].some(row=>row.id==='bla_skilt'));
  assert.ok(contract.runtimeCategories.includes('historie'));
  assert.ok(!contract.runtimeCategories.includes('snublestein'));
  assert.ok(!contract.runtimeCategories.includes('bla_skilt'));
});

test('materialiseringen kan ikke godkjenne seg selv, mens separat audit dekker alle 30 pakker',()=>{
  const source=fs.readFileSync(path.join(ROOT,'tools/materialize-oslo-micro-place-expansion.mjs'),'utf8');
  assert.doesNotMatch(source,/status:\s*['"]ready_v4_2['"]/u);
  assert.doesNotMatch(source,/factual:\s*\{status:\s*['"]passed['"]/u);
  assert.match(source,/factual:\s*\{status:\s*['"]pending['"]/u);
  assert.equal(audit.places.length,30);
  assert.deepEqual(new Set(audit.places.map(row=>row.placeId)),new Set([...report.places.map(row=>row.id),'haraldrud_ombrukstelt']));
  assert.doesNotMatch(audit.reviewer,/generator|materializer/iu);
  assert.equal(review.passed,true);
  assert.equal(review.placeCount,30);
});

test('review-integriteten avviser svake claims og gjenbrukt generisk tekst',()=>{
  const weakIssues=[];
  validateCoverage({id:'svak',desc:'En helt annen setning.',popupDesc:'En helt annen setning.'},{claims:[{id:'c1',claim:'Dokumentert kioskidentitet',sourceUrl:'https://example.test',sourceLocation:'rad 1',verifiedAt:'2026-08-26',status:'verified',evidenceMode:'direct',temporalStatus:'current'}],sentenceCoverage:{desc:[{sentence:1,claimIds:['c1']}],popupDesc:[{sentence:1,claimIds:['c1']}]}},weakIssues);
  assert.ok(weakIssues.some(issue=>issue.code==='weak_claim_relevance'));
  const duplicateIssues=[];
  const repeated='Dette er en dokumentert og fullstendig generisk tekst om et fysisk sted i Oslo.';
  validateDuplicateText([{place:{id:'a',desc:repeated,popupDesc:repeated}},{place:{id:'b',desc:repeated,popupDesc:repeated}}],duplicateIssues);
  assert.ok(duplicateIssues.some(issue=>['duplicate_sentence','generic_cross_place_text'].includes(issue.code)));
});
