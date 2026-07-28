import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const contract=JSON.parse(fs.readFileSync('data/fagverk/category_place_design.json','utf8'));
const page=fs.readFileSync('fagverk-sted.html','utf8');
const runtime=fs.readFileSync('js/fagverk-place-theme.js','utf8');
const css=fs.readFileSync('css/fagverk-place-category-themes.css','utf8');
const designProfiles=['by','historie','kunst','scenekunst','litteratur','musikk','naeringsliv','natur','politikk','popkultur','psykologi','religion','sport','subkultur','vitenskap'];

test('alle aktive kategori- og badgeprofiler har egne stedssideinstrukser',()=>{
  assert.equal(contract.schema,'history_go_fagverk_place_design_v1');
  assert.deepEqual(new Set(Object.keys(contract.categories)),new Set(designProfiles));
  for(const id of designProfiles){
    const design=contract.categories[id];
    for(const key of ['label','accent','accentSecondary','surface','glow','titleStyle','imageTreatment','imageDirection'])assert.ok(String(design[key]||'').trim(),`${id}: ${key}`);
    assert.ok(Array.isArray(design.contentPriority)&&design.contentPriority.length>=4,`${id}: contentPriority`);
  }
});

test('legacy place-category ids har eksplisitte aliaser',()=>{
  assert.equal(contract.aliases.media,'popkultur');
  assert.equal(contract.aliases.film_tv,'popkultur');
  assert.equal(contract.aliases.populaerkultur,'popkultur');
});

test('bildekontrakten krever reelt stedsbilde',()=>{
  assert.equal(contract.principles.realPlaceImageRequired,true);
  assert.equal(contract.principles.decorativeFallbackDoesNotCount,true);
  assert.deepEqual(contract.principles.imageFieldPriority,['popupImage','cardImage','image']);
  for(const design of Object.values(contract.categories))assert.match(design.imageDirection,/sted|stedsbilde|stedet|arena|anlegg|naturtypen|produksjonssted|spillestedet|innspillingssted|institusjonen|laboratorium|teatret|kirken/i);
});

test('stedssiden laster kategori-CSS og runtime etter basisdesignet',()=>{
  assert.match(page,/css\/fagverk-premium\.css[\s\S]*css\/fagverk-place-category-themes\.css/);
  assert.match(page,/js\/fagverk-sted\.js[\s\S]*js\/fagverk-place-theme\.js/);
  assert.match(runtime,/dataset\.placeCategory/);
  assert.match(runtime,/dataset\.placeHasImage/);
  assert.match(runtime,/--place-accent/);
});

test('manglende bilder lager ikke tom høyrekolonne',()=>{
  assert.match(css,/\[data-place-has-image="0"\] \.fagverk-place-hero\s*\{grid-template-columns:1fr/);
  assert.match(css,/BILDE MANGLER \/ PRODUKSJONSKRAV/);
});

test('kategoriinstruksene påvirker både farge, typografi og bildebehandling',()=>{
  assert.match(css,/--place-accent/);
  assert.match(css,/data-place-title-style/);
  assert.match(css,/data-treatment="natural_true_color"/);
  assert.match(css,/data-treatment="institutional_documentary"/);
  assert.match(css,/data-treatment="street_texture"/);
});
