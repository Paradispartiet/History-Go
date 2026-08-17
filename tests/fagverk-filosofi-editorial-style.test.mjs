import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=(p)=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const registry=json('data/fagverk/filosofi/filosofi_article_registry_v1.json');
const articles=registry.articles.map((row)=>json(row.file));
const byId=new Map(articles.map((a)=>[a.id,a]));

const GLOBAL={
  em_filosofi_antikk_middelalder_modernitet:{allowed:['platon','aristoteles','augustin','thomas_aquinas','rene_descartes','immanuel_kant'],sources:['sep-socrates','sep-medieval-philosophy','sep-early-modern-rationalism']},
  em_filosofi_kinesisk_filosofi:{allowed:['konfucius','laozi','zhuangzi'],sources:['sep-chinese-ethics','sep-chinese-epistemology','sep-zhuangzi']},
  em_filosofi_indisk_buddhistisk_filosofi:{allowed:['nagarjuna','vasubandhu','shankara','ramanuja','dharmakirti'],sources:['sep-indian-epistemology','sep-nagarjuna','iep-nagarjuna']},
  em_filosofi_islamsk_jodisk_filosofi:{allowed:['al_farabi','ibn_rushd','al_ghazali','maimonides'],sources:['sep-islamic-metaphysics','sep-medieval-philosophy','sep-maimonides']},
  em_filosofi_afrikansk_filosofi_ubuntu:{allowed:['anton_wilhelm_amo','sophie_oluwole','kwasi_wiredu'],sources:['sep-africana','sep-african-sage','sep-akan-person']},
  em_filosofi_latinamerikansk_dekolonial_filosofi:{allowed:['enrique_dussel','anibal_quijano'],sources:['sep-latin-american','sep-latin-american-history','sep-latin-american-philosophy','sep-philosophy-liberation']}
};

const banned=[
  /dersom .*\. først og fremst er et historisk, fenomenologisk eller normativt spørsmål/i,
  /Metoden skal brukes på et eksplisitt argument, begrep, tekst, case, observasjon eller dokumentert stedlig forhold\. Metoden skal brukes/i,
  /Artikkelen behandler derfor begrepet som et analytisk redskap som må gjøre en forskjell i argumentet, ikke som pynt eller navnegjetting/i,
  /\bcanonicale?\b/i,
  /\b[a-zæøå]+_[a-zæøå_]+\b/
];

const genericArgumentPatterns=[
  /En analyse av .* må angi hva som teller som/i,
  /kan de ikke behandles som synonymer uten videre argument/i,
  /En overgang fra disse begrepskriteriene til en påstand om/i,
  /må derfor gjøre begrepsgrensene eksplisitte, vise slutningstrinnene/i
];

const normalize=(value)=>String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('nb').replace(/[^a-z0-9æøå]+/g,' ').trim();

test('Filosofi-prosa er fri for kjente maskinmønstre og rå ID-er',()=>{
  for(const article of articles){
    const prose=article.sections.flatMap((s)=>s.paragraphs||[]).join('\n');
    for(const pattern of banned) assert.doesNotMatch(prose,pattern,`${article.id} treffer stilforbud ${pattern}`);
  }
});

test('argumentrekonstruksjonen gjentar ikke identisk kontrollsetning i samme artikkel',()=>{
  for(const article of articles){
    const arg=article.sections.find((s)=>s.id==='argument');
    assert.ok(arg);
    const normalized=arg.paragraphs.map((p)=>p.replace(/^P\d:|^K:/,'').trim());
    assert.equal(new Set(normalized).size,normalized.length,`${article.id} har dupliserte argumentavsnitt`);
  }
});

test('universitetsreviewede artikler får ikke bruke den gamle metamalens argument',()=>{
  const reviewed=articles.filter((article)=>article.editorial_quality==='university_depth_reviewed');
  for(const article of reviewed){
    const argument=article.sections.find((s)=>s.id==='argument')?.paragraphs.join(' ')||'';
    for(const pattern of genericArgumentPatterns){
      assert.doesNotMatch(argument,pattern,`${article.id} bruker gammel metamal ${pattern}`);
    }
  }
  const signatures=reviewed.map((article)=>article.sections.find((s)=>s.id==='argument')?.paragraphs.join(' ').toLocaleLowerCase('nb'));
  assert.equal(new Set(signatures).size,signatures.length,'reviewede artikler deler identisk argumentrekonstruksjon');
});

test('globale tradisjoner har tradisjonsspesifikke debattaktører, primærankre og eksplisitt universitetsdybde før komparasjon',()=>{
  for(const [id,rule] of Object.entries(GLOBAL)){
    const article=byId.get(id);
    assert.ok(article,`mangler global artikkel ${id}`);

    const quality=article.university_quality;
    const integrity=article.quality?.source_integrity;
    const debateActors=quality?.debate_thinkers??[];
    const anchors=integrity?.primary_work_anchors??[];
    const theory=article.sections.find((s)=>s.id==='teorihistorie');
    const theoryText=(theory?.paragraphs??[]).join(' ');

    assert.ok(debateActors.length>=2,`${id} har for få eksplisitte debattaktører`);
    assert.equal(integrity?.state,'reviewed',`${id} mangler reviewet source-integrity`);
    assert.deepEqual(integrity?.debate_actors,debateActors,`${id} har stale debattaktører i source-integrity`);
    assert.deepEqual(integrity?.canonical_thinker_refs,article.thinker_refs,`${id} har stale canonical thinker refs`);
    assert.ok(article.thinker_refs.every((x)=>rule.allowed.includes(x)),`${id} har irrelevant canonical tenker: ${article.thinker_refs.join(', ')}`);

    assert.ok(anchors.length>=2,`${id} har for få debattspesifikke primærverkankre`);
    const debateKeys=new Set(debateActors.map(normalize));
    for(const anchor of anchors){
      assert.ok(debateKeys.has(normalize(anchor.actor)),`${id} har primæranker for aktør utenfor debatten: ${anchor.actor}`);
      assert.ok(normalize(theoryText).includes(normalize(anchor.actor)),`${id} bruker ikke primæranker-aktøren ${anchor.actor} i teorihistorien`);
      assert.ok(normalize(theoryText).includes(normalize(anchor.work)),`${id} bruker ikke primærverket ${anchor.work} i teorihistorien`);
    }

    assert.ok(rule.sources.length>=3,`${id} har for svak permanent kildekontrakt`);
    assert.deepEqual([...article.source_ids].sort(),[...rule.sources].sort(),`${id} har feil tradisjonsspesifikke kilder`);
    assert.ok(theory?.paragraphs?.length>=3,`${id} mangler eksplisitt tradisjonsrelevans`);
  }
});

test('begrepsavsnitt forklarer begreper uten å tvinges inn i én boilerplate-formel',()=>{
  for(const article of articles){
    const section=article.sections.find((s)=>s.id==='begreper');
    assert.ok(section);
    for(const paragraph of section.paragraphs){
      assert.ok(paragraph.split(/\s+/).length>=45,`${article.id} har for tynt begrepsavsnitt`);
    }
  }
});