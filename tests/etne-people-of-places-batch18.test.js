const assert = require('assert');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(repo, rel), 'utf8'));
const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const expectedFile = 'people/sport/vestland/etne/people_sjokanten_trivsel_batch1.json';
const placeId = 'sjokanten_trivsel_skanevik';
const people = [
  {id:'heidi_wannberg',name:'Heidi Wannberg',aliases:['Heidi Wannberg','H. Wannberg'],year:2018,tag:'initiativ',text:'fekk ideen om å byggje noko liknande',limit:'ikkje at Wannberg åleine teikna, bygde eller finansierte anlegget'},
  {id:'arne_tveit',name:'Arne Tveit',aliases:['Arne Tveit','A. Tveit','Arne Tveit frå Vikebygd'],year:null,tag:'arkitektur',text:'personen som teikna bassenget',limit:'ikkje at Tveit leidde dugnaden'},
  {id:'jarle_vik',name:'Jarle Vik',aliases:['Jarle Vik','J. Vik'],year:null,tag:'grunnarbeid',text:'sat åleine time etter time og flytta massar',limit:'ikkje at Vik utførte all graving'}
];
const sources = ['https://www.grannar.no/nyhende/basseng-bragda-i-skanevik/236807','https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=47'];
const manifest = readJson('data/people/manifest.json');
assert.strictEqual(manifest.files.filter((f)=>f===expectedFile).length,1,'Batch 18-fila skal stå nøyaktig ein gong i manifestet');
const batch = readJson(`data/${expectedFile}`);
assert.strictEqual(batch.length,3,'Batch 18 skal berre ha dei tre dokumenterte prosjektrollene');
for(const expected of people){
  const person=batch.find((p)=>p.id===expected.id);
  assert(person,`${expected.id} manglar`);
  assert.strictEqual(person.name,expected.name);
  assert.strictEqual(person.placeId,placeId);
  assert.deepStrictEqual(person.places,[placeId]);
  assert.strictEqual(person.category,'sport');
  assert.strictEqual(person.year,expected.year);
  assert(person.tags.includes(expected.tag));
  assert(person.popupDesc.includes(expected.text));
  assert(person.popupDesc.includes(expected.limit));
  for(const source of sources) assert(person.source_urls.includes(source));
  assert.strictEqual(person.verifiedAt,'2026-07-18');
}
const activePlaces=new Set(readJson('data/places/places_index.json').map((p)=>p.id));
assert(activePlaces.has(placeId),'Batch 18 peikar på eit inaktivt place');
const identityHits=new Map(people.map((p)=>[p.id,[]]));
const placeHits=[];
for(const file of manifest.files){
  const raw=readJson(`data/${file}`); const entries=Array.isArray(raw)?raw:[raw];
  for(const candidate of entries){
    const fields=[candidate.id,candidate.name,...(candidate.aliases||[])].map(normalize);
    for(const expected of people){
      const aliases=[expected.id,...expected.aliases].map(normalize);
      if(fields.some((field)=>aliases.includes(field))) identityHits.get(expected.id).push({file,id:candidate.id,name:candidate.name});
    }
    if(candidate.placeId===placeId||(candidate.places||[]).includes(placeId)) placeHits.push({file,id:candidate.id,name:candidate.name});
  }
}
for(const expected of people) assert.deepStrictEqual(identityHits.get(expected.id),[{file:expectedFile,id:expected.id,name:expected.name}],`${expected.name} skal finnast nøyaktig ein gong`);
assert.deepStrictEqual(placeHits,people.map((p)=>({file:expectedFile,id:p.id,name:p.name})),'Sjøkanten Trivsel skal få sine første people-lenkjer i batch 18');
console.log('Etne People of Places batch 18 OK (3 named physical project roles, 1 newly covered swimming facility, 3 canonical identities)');
