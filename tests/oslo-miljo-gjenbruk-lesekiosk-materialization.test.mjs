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
    assert.deepEqual(place.place_card_profile?.collection_ids,['reuse','materials','environment','systems']);
    for(const key of ['reuse','materials','environment','systems']) assert.ok(Array.isArray(place.circular_profile?.[key])&&place.circular_profile[key].length>0,`${place.id} mangler circular_profile.${key}`);
    assert.ok(Number.isFinite(place.lat)&&Number.isFinite(place.lon),`${place.id} mangler koordinater`);
    const packet=read(path.join(PROD_DIR,`${place.id}.json`));
    assert.equal(packet.status,'ready_v4_2',`${place.id} mangler ferdig 4.2-produksjonspakke`);
    assert.ok(packet.quizReadiness?.questions?.length>=8,`${place.id} mangler obligatorisk quiz`);
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
    assert.deepEqual(place.place_card_profile?.collection_ids,['people','objects','brands','productions']);
    assert.ok(Number.isFinite(place.lat)&&Number.isFinite(place.lon),`${place.id} mangler kartanker`);
    assert.equal(place.sourceProvider,'official_map');
    assert.equal(place.coordStatus,'needs_manual_visual_qa');
    const packet=read(path.join(PROD_DIR,`${place.id}.json`));
    assert.equal(packet.status,'ready_v4_2',`${place.id} mangler ferdig 4.2-produksjonspakke`);
    assert.ok(packet.quizReadiness?.questions?.length>=8,`${place.id} mangler obligatorisk quiz`);
  }
});

test('manifestet inneholder alle 32 nye canonical Place-filer uten duplikat-ID',()=>{
  const manifest=read(path.join(ROOT,'data/places/manifest.json'));
  const expected=[...expectedReuseIds].map(id=>`places/natur/oslo/miljo_gjenbruk/${id}.json`);
  const source=read(SOURCE_INVENTORY);
  expected.push(...source.candidates.map(candidate=>`places/litteratur/oslo/lesekiosk/${candidate.id}.json`));
  for(const rel of expected) assert.ok(manifest.files.includes(rel),`manifest mangler ${rel}`);
  assert.equal(new Set(expected).size,32);
});
