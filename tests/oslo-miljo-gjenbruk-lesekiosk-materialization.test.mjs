import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ENV_DIR=path.join(ROOT,'data/places/natur/oslo/miljo_gjenbruk');
const KIOSK_DIR=path.join(ROOT,'data/places/litteratur/oslo/lesekiosk');
const PROD_DIR=path.join(ROOT,'data/places/production');
const SOURCE_INVENTORY=path.join(ROOT,'reports/lesekiosker-oslo-2026/lesekiosker-oslo-litteratur-inventory.json');

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const jsonFiles=dir=>fs.existsSync(dir)?fs.readdirSync(dir).filter(name=>name.endsWith('.json')).sort():[];

const expectedReuseIds=new Set([
  'grefsen_gjenvinningsstasjon','haraldrud_gjenvinningsstasjon','ryen_gjenvinningsstasjon','smestad_gjenvinningsstasjon','lindeberg_gjenvinningsstasjon','kampen_gjenvinningsstasjon','romsas_gjenvinningsstasjon','sofienbergparken_gjenvinningsstasjon','trosterud_gjenvinningsstasjon','haraldrud_ombrukstelt','gronmo_ombrukstelt'
]);

test('Oslo Miljø & gjenbruk materialiserer nøyaktig 11 canonical Places',()=>{
  const files=jsonFiles(ENV_DIR);
  assert.equal(files.length,11,'Miljø & gjenbruk skal ha nøyaktig 11 materialiserte steder');
  const places=files.map(file=>read(path.join(ENV_DIR,file)));
  assert.deepEqual(new Set(places.map(place=>place.id)),expectedReuseIds);
  for(const place of places){
    assert.equal(place.category,'natur',`${place.id} må beholde Natur-hovedkategori`);
    assert.equal(place.subcategory_id,'miljo_gjenbruk',`${place.id} må bruke canonical underkategori`);
    assert.equal(place.placeTier,'micro',`${place.id} skal bruke redusert canonical mikrostedkontrakt`);
    assert.equal(place.micro_place_profile?.schema,'history_go_micro_place_profile_v1');
    assert.equal(place.micro_place_profile?.quizMode,'none');
    assert.equal(place.place_card_profile,undefined,`${place.id} skal ikke ha et kunstig fireflaters PlaceCard`);
    for(const key of ['reuse','materials','environment','systems']) assert.ok(Array.isArray(place.circular_profile?.[key])&&place.circular_profile[key].length>0,`${place.id} mangler circular_profile.${key}`);
    assert.ok(Number.isFinite(place.lat)&&Number.isFinite(place.lon),`${place.id} mangler koordinater`);
    const packet=read(path.join(PROD_DIR,`${place.id}.json`));
    assert.equal(packet.status,'ready_v4_2',`${place.id} mangler ferdig 4.2-produksjonspakke`);
    assert.equal(packet.quizReadiness?.questions?.length,0,`${place.id} skal ikke få konstruert quiz`);
    assert.equal(packet.reviews?.factual?.status,'passed');
    assert.equal(packet.reviews?.editorial?.status,'passed');
  }
});

test('alle 21 Lesekiosker er egne litteratursteder med egne stabile ID-er',()=>{
  const source=read(SOURCE_INVENTORY);
  assert.equal(source.candidates?.length,21,'autoritativ Lesekiosk-inventory skal fortsatt være 21');
  const files=jsonFiles(KIOSK_DIR);
  assert.equal(files.length,21,'det skal materialiseres nøyaktig 21 Lesekiosker');
  const places=files.map(file=>read(path.join(KIOSK_DIR,file)));
  const sourceIds=new Set(source.candidates.map(candidate=>candidate.id));
  const materializedIds=new Set(places.map(place=>place.id));
  assert.equal(materializedIds.size,21,'alle Lesekiosk-ID-er må være unike');
  assert.deepEqual(materializedIds,sourceIds,'materialisering skal følge intake-inventoryen uten tillegg eller frafall');
  for(const place of places){
    assert.equal(place.category,'litteratur',`${place.id} må gi litteraturprikk`);
    assert.equal(place.subcategory_id,'lesekiosk',`${place.id} må være Lesekiosk-underkategori`);
    assert.equal(place.placeTier,'micro',`${place.id} skal være canonical mikrosted`);
    assert.equal(place.micro_place_profile?.kind,'lesekiosk');
    assert.equal(place.micro_place_profile?.quizMode,'none');
    assert.equal(place.place_card_profile,undefined,`${place.id} skal bruke forenklet PlaceCard`);
    assert.ok(Number.isFinite(place.lat)&&Number.isFinite(place.lon),`${place.id} mangler kartanker`);
    assert.equal(place.sourceProvider,'official_map');
    assert.equal(place.coordStatus,'needs_manual_visual_qa');
    const packet=read(path.join(PROD_DIR,`${place.id}.json`));
    assert.equal(packet.status,'ready_v4_2',`${place.id} mangler ferdig 4.2-produksjonspakke`);
    assert.equal(packet.quizReadiness?.questions?.length,0,`${place.id} skal ikke få konstruert quiz`);
  }
});

test('manifestet inneholder alle 32 nye canonical Place-filer uten duplikat-ID',()=>{
  const manifest=read(path.join(ROOT,'data/places/manifest.json'));
  const expected=[...expectedReuseIds].map(id=>`places/natur/oslo/miljo_gjenbruk/${id}.json`);
  const source=read(SOURCE_INVENTORY);
  expected.push(...source.candidates.map(candidate=>`places/litteratur/oslo/lesekiosk/${candidate.id}.json`));
  for(const rel of expected) assert.ok(manifest.files.includes(rel),`manifest mangler ${rel}`);
  assert.equal(new Set(expected).size,32);
  const index=read(path.join(ROOT,'data/places/places_index.json'));
  const expectedIds=new Set([...expectedReuseIds,...source.candidates.map(candidate=>candidate.id)]);
  const indexed=index.filter(place=>expectedIds.has(place.id));
  assert.equal(indexed.length,32,'hver ny ID skal finnes nøyaktig én gang i kartindeksen');
  assert.equal(new Set(indexed.map(place=>place.id)).size,32,'ingen ny ID kan kollidere i kartindeksen');
  for(const place of indexed){
    assert.equal(place.placeTier,'micro',`${place.id} må beholde Micro Place-tier i kartindeksen`);
    assert.equal(place.micro_place_profile?.schema,'history_go_micro_place_profile_v1');
    assert.ok(place.lat>=59&&place.lat<=61&&place.lon>=9&&place.lon<=12,`${place.id} må ha gyldig Oslo-kartanker`);
  }
});

test('Sagene 70 og 71 forblir to separate canonical litteraturmarkører',()=>{
  const seventy=read(path.join(KIOSK_DIR,'lesekiosk_70_sagene_kirke.json'));
  const seventyOne=read(path.join(KIOSK_DIR,'lesekiosk_71_sagene_kirke.json'));
  assert.notEqual(seventy.id,seventyOne.id);
  assert.match(seventy.name,/70/);
  assert.match(seventyOne.name,/71/);
  assert.equal(seventy.category,'litteratur');
  assert.equal(seventyOne.category,'litteratur');
});

test('materialisering kan ikke godkjenne sin egen review',()=>{
  const materializer=fs.readFileSync(path.join(ROOT,'tools/materialize-oslo-micro-places.mjs'),'utf8');
  assert.doesNotMatch(materializer,/status:\s*['"]ready_v4_2['"]/u);
  assert.doesNotMatch(materializer,/factual:\s*\{status:\s*['"]passed['"]/u);
  assert.match(materializer,/factual:\s*\{status:\s*['"]pending['"]/u);
  const report=read(path.join(ROOT,'reports/oslo-micro-places-2026/review-integrity-report.json'));
  assert.equal(report.passed,true);
  assert.equal(report.placeCount,32);
  assert.doesNotMatch(report.reviewer,/generator|materializer/iu);
});
