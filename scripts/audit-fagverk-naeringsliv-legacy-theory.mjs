import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY = 'data/fag/naeringsliv/merke_naeringsliv (1).html';
const MANIFEST = 'data/fag/fag_manifest.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const OWNED_ROOTS = ['data/fag/naeringsliv/', 'data/fagverk/naeringsliv/'];

const POLICY = Object.freeze({
  felt: [['arbeid'],['produksjon'],['verdiskaping'],['industri'],['handel'],['tjenester'],['innovasjon'],['teknologi'],['plattform'],['kapital'],['eierskap'],['organisasjon']],
  normativ: [['vekst'],['konkurranse'],['effektivitet'],['produktivitet'],['profesjonalitet','profesjon','kompetanse','yrkesmessig skjønn'],['arbeidsdisiplin','arbeid'],['innovasjon'],['marked']],
  doxa: [['økonomi'],['sosial'],['politikk'],['kultur'],['teknologi'],['historie'],['makt'],['pris'],['lønn'],['arbeidstid']],
  metode: [['økonomisk modell','modell'],['statistikk'],['arbeidsliv'],['profesjon'],['organisasjonsanalyse','organisasjon'],['innovasjon'],['teknologistudier','teknologi'],['logistikk'],['verdikjede'],['forbruker'],['markedsadferd','marked']],
  materiell: [['fabrikk'],['kontor'],['butikk'],['logistikk'],['havn'],['vei'],['jernbane'],['lager'],['server'],['nettverk'],['plattform'],['maskin'],['programvare'],['algoritme']],
  sosial: [['arbeider'],['eier'],['leder'],['gründer'],['fagforening'],['bransje'],['profesjon'],['forbruk'],['hierarki'],['arbeidskultur'],['arbeid'],['kapital']],
  geografisk: [['industristrøk','industri'],['havn'],['logistikk'],['finans'],['kontor'],['handel'],['by'],['akerselva','akerselvas'],['barcode']],
  temporal: [['industriell revolusjon','industrialisering'],['mekanisering'],['offshoring','globalisering','global verdikjede','globale verdikjeder','internasjonal økonomi','internasjonal handel'],['digitalisering'],['automatisering'],['arbeidsliv'],['plattform'],['økonomisk krise','krise'],['omstilling']],
  blindsoner: [['usynlig arbeid','uformell økonomi','omsorg'],['miljøkostnad','miljø'],['ressursbruk'],['ulikhet'],['ekskludering'],['kapital'],['eierskap'],['produktiv'],['datasenter'],['lager']],
  begreper: [['verdiskaping'],['arbeid'],['kapital'],['infrastruktur'],['produksjon'],['distribusjon'],['innovasjon'],['forbruk']]
});

const abs = f => path.join(ROOT, f);
const exists = f => fs.existsSync(abs(f));
const read = f => fs.readFileSync(abs(f), 'utf8');
const json = f => JSON.parse(read(f));
const txt = v => String(v ?? '').trim();
const norm = v => txt(v).toLocaleLowerCase('nb-NO').normalize('NFKC').replace(/[«»“”„"'’`´]/g,'').replace(/[^a-zæøå0-9]+/gi,' ').replace(/\s+/g,' ').trim();

function flatten(v,out=[]){ if(typeof v==='string') out.push(v); else if(Array.isArray(v)) for(const x of v) flatten(x,out); else if(v&&typeof v==='object') for(const x of Object.values(v)) flatten(x,out); return out; }
function repoPath(p){ const r=path.relative(ROOT,path.resolve(p)).replaceAll('\\','/'); return !r||r.startsWith('../')||path.isAbsolute(r)?'':r; }
function owned(f){ return f.endsWith('.json') && OWNED_ROOTS.some(r=>f.startsWith(r)); }
function resolveRef(from,raw){ const v=txt(raw).replaceAll('\\','/').split(/[?#]/)[0]; if(!v.endsWith('.json')) return ''; const c=[]; if(v.startsWith('data/')) c.push(path.join(ROOT,v)); c.push(path.join(ROOT,path.dirname(from),v)); if(!v.startsWith('../')) { c.push(path.join(ROOT,'data/fag',v)); c.push(path.join(ROOT,'data/fagverk',v)); } for(const p of c){ const f=repoPath(p); if(f&&owned(f)&&exists(f)) return f; } return ''; }
function graph(seed){ const q=[...new Set(seed.filter(f=>f&&owned(f)&&exists(f)))], seen=new Set(), strings=[]; while(q.length){ const f=q.shift(); if(seen.has(f)) continue; seen.add(f); const v=json(f), ss=flatten(v); strings.push(...ss); for(const s of ss){ const r=resolveRef(f,s); if(r&&!seen.has(r)) q.push(r); } } return {files:[...seen].sort(),strings}; }
function stripHtml(v){ return v.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim(); }
function sections(html){ const out=[]; for(const m of html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)){ const cls=m[1].match(/class=["']([^"']+)["']/i)?.[1]||''; if(!cls.split(/\s+/).includes('merke-blokk')) continue; const id=m[1].match(/id=["']([^"']+)["']/i)?.[1]||''; const heading=stripHtml(m[2].match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1]||id); if(id) out.push({id,heading,text:stripHtml(m[2])}); } return out; }

export function auditNaeringslivLegacyTheory(){
  for(const f of [LEGACY,MANIFEST,REGISTRY,PORTAL]) if(!exists(f)) throw new Error(`Mangler ${f}`);
  const legacySections=sections(read(LEGACY));
  const expected=[...Object.keys(POLICY),'bidrag'];
  if(JSON.stringify(legacySections.map(s=>s.id))!==JSON.stringify(expected)) throw new Error(`Uventet Næringsliv-seksjonsstruktur: ${legacySections.map(s=>s.id).join(', ')}`);

  const manifestSubject=json(MANIFEST).naeringsliv || {};
  const manifestSeed=[...new Set(flatten(manifestSubject).map(v=>resolveRef(MANIFEST,v)).filter(Boolean))].sort();
  if(manifestSeed.length < 4) throw new Error(`For få manifesteide Næringsliv-filer: ${manifestSeed.length}`);
  const manifestGraph=graph(manifestSeed);

  const registry=json(REGISTRY);
  const reg=registry.subjects?.naeringsliv;
  if(!reg) throw new Error('Næringsliv mangler i Fagverk-registeret.');
  const chapterCount=Array.isArray(reg.chapters)?reg.chapters.length:0;
  if(chapterCount!==12) throw new Error(`Næringsliv-registry skal ha 12 kapitler, fant ${chapterCount}.`);
  const regSeed=flatten(reg).map(v=>resolveRef(REGISTRY,v)).filter(Boolean);
  const regGraph=graph(regSeed);

  const corpus=norm([...manifestGraph.strings,...flatten(reg),...regGraph.strings].join(' '));
  if(corpus.length<100000) throw new Error('Canonical Næringsliv-korpus er uventet lite.');

  const rows=legacySections.map(s=>{
    if(s.id==='bidrag') return {id:s.id,heading:s.heading,role:'legacy_product_copy',legacyCharacterCount:s.text.length,anchorCount:0,foundCount:0,anchorCoverage:1,missingAnchors:[],contentStatus:'legacy_product_copy_no_canonical_migration_required'};
    const anchors=POLICY[s.id].map(alts=>({alternatives:alts,found:alts.find(a=>corpus.includes(norm(a)))||null}));
    const foundCount=anchors.filter(a=>a.found).length;
    const missingAnchors=anchors.filter(a=>!a.found).map(a=>a.alternatives);
    const anchorCoverage=Number((foundCount/anchors.length).toFixed(3));
    return {id:s.id,heading:s.heading,role:'knowledge',legacyCharacterCount:s.text.length,anchorCount:anchors.length,foundCount,anchorCoverage,anchors,missingAnchors,contentStatus:anchorCoverage===1?'canonical_anchor_coverage_complete_claim_review_pending':'canonical_anchor_gaps_manual_review_required'};
  });

  const portal=json(PORTAL); const p=portal.categories?.find(x=>x.id==='naeringsliv');
  if(!p) throw new Error('Næringsliv mangler i portalen.');
  if(p.badgePage!==LEGACY) throw new Error(`Audit-tranchen skal være pre-redirect; badgePage=${p.badgePage}`);
  const knowledge=rows.filter(r=>r.role==='knowledge'); const manual=knowledge.filter(r=>r.anchorCoverage<1).map(r=>r.id);
  return {schema:'history_go_fagverk_naeringsliv_legacy_theory_audit_v1',subject:'naeringsliv',legacy:{badgePage:LEGACY,sectionCount:rows.length,knowledgeSectionCount:knowledge.length},canonical:{manifestSeedFiles:manifestSeed,manifestGraphFileCount:manifestGraph.files.length,registryChapterCount:chapterCount,registryGraphFileCount:regGraph.files.length,corpusCharacterCount:corpus.length},navigation:{badgePage:p.badgePage,subjectPage:p.subjectPage,preRedirectLocked:true},summary:{knowledgeSectionCount:knowledge.length,anchorCompleteCount:knowledge.filter(r=>r.anchorCoverage===1).length,manualReviewCount:manual.length,manualReview:manual,redirectReady:false,redirectBlockReason:'Anchor coverage establishes only candidate canonical ownership. Næringsliv redirect remains blocked until explicit editorial adjudication and any proven semantic gaps are resolved.'},rows};
}

const report=auditNaeringslivLegacyTheory();
process.stdout.write(`${JSON.stringify(report,null,2)}\n`);
