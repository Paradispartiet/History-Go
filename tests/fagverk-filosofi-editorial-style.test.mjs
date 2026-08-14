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
  em_filosofi_indisk_buddhistisk_filosofi:{allowed:['nagarjuna','vasubandhu','shankara','ramanuja','dharmakirti'],sources:['sep-indian-epistemology','sep-nagarjuna']},
  em_filosofi_islamsk_jodisk_filosofi:{allowed:['al_farabi','ibn_rushd','al_ghazali','maimonides'],sources:['sep-islamic-metaphysics','sep-medieval-philosophy','sep-maimonides']},
  em_filosofi_afrikansk_filosofi_ubuntu:{allowed:['anton_wilhelm_amo','sophie_oluwole','kwasi_wiredu'],sources:['sep-africana','sep-african-sage','sep-akan-person']},
  em_filosofi_latinamerikansk_dekolonial_filosofi:{allowed:['enrique_dussel','anibal_quijano'],sources:['sep-latin-american','sep-latin-american-history']}
};

const banned=[
  /dersom .*\. først og fremst er et historisk, fenomenologisk eller normativt spørsmål/i,
  /Metoden skal brukes på et eksplisitt argument, begrep, tekst, case, observasjon eller dokumentert stedlig forhold\. Metoden skal brukes/i,
  /Artikkelen behandler derfor begrepet som et analytisk redskap som må gjøre en forskjell i argumentet, ikke som pynt eller navnegjetting/i,
  /\bcanonicale?\b/i,
  /\b[a-zæøå]+_[a-zæøå_]+\b/
];

test('Filosofi-prosa er fri for kjente maskinmønstre og rå ID-er',()=>{
  for(const article of articles){
    const prose=article.sections.flatMap((s)=>s.paragraphs||[]).join('\n');
    for(const pattern of banned) assert.doesNotMatch(prose,pattern,`${article.id} treffer stilforbud ${pattern}`);
  }
});

test('argumentrekonstruksjonen gjentar ikke identisk kontrollsetning',()=>{
  for(const article of articles){
    const arg=article.sections.find((s)=>s.id==='argument');
    assert.ok(arg);
    const normalized=arg.paragraphs.map((p)=>p.replace(/^P\d:|^K:/,'').trim());
    assert.equal(new Set(normalized).size,normalized.length,`${article.id} har dupliserte argumentavsnitt`);
  }
});

test('globale tradisjoner har tradisjonsspesifikke tenkere før komparasjon',()=>{
  for(const [id,rule] of Object.entries(GLOBAL)){
    const article=byId.get(id);
    assert.ok(article,`mangler global artikkel ${id}`);
    assert.ok(article.thinker_refs.length>=2,`${id} har for få relevante tenkere`);
    assert.ok(article.thinker_refs.every((x)=>rule.allowed.includes(x)),`${id} har irrelevant tenker: ${article.thinker_refs.join(', ')}`);
    assert.deepEqual([...article.source_ids].sort(),[...rule.sources].sort(),`${id} har feil tradisjonsspesifikke kilder`);
    const theory=article.sections.find((s)=>s.id==='teorihistorie');
    assert.ok(theory?.paragraphs?.length>=3,`${id} mangler eksplisitt tradisjonsrelevans`);
  }
});

test('begrepsavsnitt er faktisk forklarende og ikke bare etiketter',()=>{
  for(const article of articles){
    const section=article.sections.find((s)=>s.id==='begreper');
    assert.ok(section);
    for(const p of section.paragraphs){
      assert.ok(p.split(/\s+/).length>=45,`${article.id} har for tynt begrepsavsnitt`);
      assert.match(p,/typisk feil|skal særlig holdes fra|må skilles/i,`${article.id} mangler begrepsavgrensning`);
      assert.match(p,/premiss|kriterium|grensetilfelle|eksempel|uenighet/i,`${article.id} mangler begrepsanvendelse`);
    }
  }
});
