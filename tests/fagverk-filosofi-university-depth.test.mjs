import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=(p)=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const registry=json('data/fagverk/filosofi/filosofi_article_registry_v1.json');
const sources=json('data/fagverk/filosofi/filosofi_sources_v1.json');
const completion=json('data/fagverk/filosofi/filosofi_completion_v1.json');
const articles=registry.articles.map((row)=>json(row.file));
const byId=new Map(articles.map((article)=>[article.id,article]));
const sourceIds=new Set(sources.sources.map((source)=>source.id));

const REFERENCE_CASES={
  em_filosofi_normativ_etikk:{
    thinkers:['John Stuart Mill','Immanuel Kant','Aristoteles'],
    anchors:['konsekvensetikk','pliktetikk','dydsetikk','Mill','Kant','Aristoteles'],
    sources:['sep-consequentialism','sep-deontology','sep-virtue-ethics']
  },
  em_filosofi_epistemisk_urettferdighet_standpunkt:{
    thinkers:['Miranda Fricker','Sandra Harding','Donna Haraway'],
    anchors:['Fricker','testimonial urettferdighet','hermeneutisk urettferdighet','standpunkt','situert kunnskap'],
    sources:['sep-social-epistemology','sep-feminist-epistemology','sep-testimony']
  },
  em_filosofi_rase_kolonialitet_dekolonisering:{
    thinkers:['Frantz Fanon','Aníbal Quijano'],
    anchors:['Fanon','Quijano','kolonialitet','rasialisering','dekolonisering'],
    sources:['sep-colonialism','sep-frantz-fanon','sep-latin-american']
  },
  em_filosofi_ai_intelligens_personskap:{
    thinkers:['Alan Turing','John Searle'],
    anchors:['Turing','Searle','kinesiske rom','funksjonalisme','forståelse','personskap'],
    sources:['sep-artificial-intelligence','sep-turing-test','sep-chinese-room']
  }
};

const genericArgumentPatterns=[
  /En analyse av .* må angi hva som teller som/i,
  /kan de ikke behandles som synonymer uten videre argument/i,
  /En overgang fra disse begrepskriteriene til en påstand om/i,
  /må derfor gjøre begrepsgrensene eksplisitte, vise slutningstrinnene/i
];

const textOf=(article,sectionIds=['argument','uenighet','teorihistorie'])=>article.sections
  .filter((section)=>sectionIds.includes(section.id))
  .flatMap((section)=>section.paragraphs||[])
  .join(' ');

test('ingen Filosofi-artikkel kan lenger være selvdeklarert university_depth_polished',()=>{
  assert.equal(articles.filter((article)=>article.editorial_quality==='university_depth_polished').length,0);
});

test('de fire artiklene som avslørte den falske porten er substansielt universitetsreviewet',()=>{
  for(const [id,rule] of Object.entries(REFERENCE_CASES)){
    const article=byId.get(id);
    assert.ok(article,`mangler referanseartikkel ${id}`);
    assert.equal(article.editorial_quality,'university_depth_reviewed',`${id} er ikke universitetsreviewet`);
    const quality=article.university_quality;
    assert.equal(quality?.schema,'history_go_filosofi_university_quality_v1',`${id} mangler kvalitetskontrakt`);
    assert.ok(quality.debate?.length>=80,`${id} mangler navngitt fagdebatt`);
    assert.ok(quality.debate_thinkers?.length>=2,`${id} mangler debattaktører`);
    for(const thinker of rule.thinkers) assert.ok(quality.debate_thinkers.includes(thinker),`${id} mangler ${thinker}`);
    for(const source of rule.sources) assert.ok(article.source_ids.includes(source),`${id} mangler emnespesifikk kilde ${source}`);
    const substantive=textOf(article).toLocaleLowerCase('nb');
    for(const anchor of rule.anchors) assert.ok(substantive.includes(anchor.toLocaleLowerCase('nb')),`${id} mangler faglig anker ${anchor}`);
  }
});

test('hver universitetsreviewet artikkel har reelt rekonstruerbart argument, rival og kilder',()=>{
  const reviewed=articles.filter((article)=>article.editorial_quality==='university_depth_reviewed');
  assert.ok(reviewed.length>=Object.keys(REFERENCE_CASES).length,'for få universitetsreviewede artikler');
  for(const article of reviewed){
    const quality=article.university_quality;
    assert.ok(quality?.required_anchors?.length>=3,`${article.id} mangler eksplisitte fagankere`);
    assert.ok(quality?.debate_thinkers?.length>=2,`${article.id} mangler navngitte posisjoner/tenkere`);
    assert.ok(article.primary_work_refs?.length>=2,`${article.id} mangler primærverk`);
    assert.ok(article.source_ids?.length>=3,`${article.id} mangler emnespesifikke sekundærkilder`);
    assert.ok(article.source_ids.every((id)=>sourceIds.has(id)),`${article.id} har uløst kilde`);

    const argument=article.sections.find((section)=>section.id==='argument');
    assert.ok(argument?.paragraphs?.length>=4,`${article.id} har for tynt argument`);
    assert.match(argument.paragraphs[0],/^P1:/,`${article.id} mangler P1`);
    assert.match(argument.paragraphs[1],/^P2:/,`${article.id} mangler P2`);
    assert.match(argument.paragraphs[2],/^P3:/,`${article.id} mangler P3`);
    assert.match(argument.paragraphs.at(-1),/^K:/,`${article.id} mangler konklusjon`);
    const disagreement=article.sections.find((section)=>section.id==='uenighet')?.paragraphs.join(' ')||'';
    assert.match(disagreement,/Innvending:/i,`${article.id} mangler reell innvending`);
    assert.match(disagreement,/Svar:/i,`${article.id} mangler svar på innvending`);

    const substantive=textOf(article);
    for(const anchor of quality.required_anchors) assert.ok(substantive.toLocaleLowerCase('nb').includes(String(anchor).toLocaleLowerCase('nb')),`${article.id} deklarerer uten å bruke faganker ${anchor}`);
    for(const pattern of genericArgumentPatterns) assert.doesNotMatch(argument.paragraphs.join(' '),pattern,`${article.id} består med gammel metamal`);
  }
});

test('claim-mønster er ikke lenger mekanisk 54 ganger seks',()=>{
  assert.ok(new Set(articles.map((article)=>article.claims.length)).size>=2,'alle artikler har fortsatt identisk claim-antall');
  const reviewed=articles.filter((article)=>article.editorial_quality==='university_depth_reviewed');
  assert.ok(reviewed.every((article)=>article.claims.some((claim)=>['position_reconstruction','concept_distinction','historical_position'].includes(claim.type))), 'reviewede artikler mangler substansielle claim-typer');
});

test('Filosofi kan ikke være komplett før 54 av 54 har bestått samme port',()=>{
  const reviewed=articles.filter((article)=>article.editorial_quality==='university_depth_reviewed');
  assert.equal(completion.reviewed_article_count,reviewed.length);
  assert.equal(completion.complete_ready,reviewed.length===54);
  if(reviewed.length<54){
    assert.notEqual(completion.status,'complete');
    assert.equal(completion.editorial_quality,'university_depth_review_in_progress');
  } else {
    assert.equal(completion.editorial_quality,'university_depth_reviewed');
  }
});
