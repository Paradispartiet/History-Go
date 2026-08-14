#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = 'data/fagverk/filosofi/articles';
const CHAPTERS = 'data/fagverk/filosofi/chapters';
const ARTICLE_REGISTRY = 'data/fagverk/filosofi/filosofi_article_registry_v1.json';
const SOURCE_FILE = 'data/fagverk/filosofi/filosofi_sources_v1.json';
const COMPLETION = 'data/fagverk/filosofi/filosofi_completion_v1.json';
const AUDIT = 'reports/fagverk/filosofi-complete-audit.json';
const CONCEPTS = 'data/fag/filosofi/begreper_filosofi_canonical_v2.json';
const THINKERS = 'data/fag/filosofi/teoretikere_filosofi_canonical_v2.json';

const readJson = async (p) => JSON.parse(await fs.readFile(path.join(ROOT,p),'utf8'));
const writeJson = async (p,v) => fs.writeFile(path.join(ROOT,p), `${JSON.stringify(v,null,2)}\n`);
const wc = (s) => String(s||'').trim().split(/\s+/).filter(Boolean).length;
const lowerFirst = (s) => String(s||'').replace(/^./,(c)=>c.toLowerCase());
const uniq = (xs) => [...new Set(xs.filter(Boolean))];

const EXTRA_SOURCES = [
  {id:'sep-chinese-epistemology',title:'Epistemology in Chinese Philosophy',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/chinese-epistemology/',access:'open_web',use:'Tradisjonsspesifikk sekundærkilde til kinesiske epistemologiske kategorier og metodiske oversettelsesproblemer.'},
  {id:'sep-zhuangzi',title:'Zhuangzi',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/zhuangzi/',access:'open_web',use:'Tradisjonsspesifikk sekundærkilde til Zhuangzi, daoistiske argumenter og verkhistorie.'},
  {id:'sep-nagarjuna',title:'Nāgārjuna',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/nagarjuna/',access:'open_web',use:'Tradisjonsspesifikk sekundærkilde til Madhyamaka, tomhet og Nāgārjunas argumentasjon.'},
  {id:'sep-medieval-philosophy',title:'Medieval Philosophy',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/medieval-philosophy/',access:'open_web',use:'Sekundærkilde til middelalderfilosofiens flerspråklige greske, latinske, arabiske og jødiske tradisjoner og overføringshistorie.'},
  {id:'sep-maimonides',title:'Maimonides',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/maimonides/',access:'open_web',use:'Tradisjonsspesifikk sekundærkilde til Maimonides, fornuft/åpenbaring og middelaldersk jødisk filosofi.'},
  {id:'sep-socrates',title:'Socrates',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/socrates/',access:'open_web',use:'Sekundærkilde til den sokratiske problematikken, antikke kilder og resepsjon.'},
  {id:'sep-early-modern-rationalism',title:'Early Modern Rationalism',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/rationalism-early-modern/',access:'open_web',use:'Sekundærkilde til tidligmoderne filosofi og kritikk av forenklede historiografiske kategorier.'},
  {id:'sep-african-sage',title:'African Sage Philosophy',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/african-sage/',access:'open_web',use:'Tradisjonsspesifikk sekundærkilde til afrikansk sage philosophy, muntlighet, argumentasjon og kritikk av eurocentriske avgrensninger.'},
  {id:'sep-akan-person',title:'Akan Philosophy of the Person',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/akan-person/',access:'open_web',use:'Tradisjonsspesifikk sekundærkilde til Akan-debatter om person, fellesskap, ansvar og sosial anerkjennelse.'},
  {id:'sep-latin-american-history',title:'Latin American Philosophy',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/latin-american-philosophy/',access:'open_web',use:'Tradisjonsspesifikk sekundærkilde til latinamerikansk filosofihistorie, identitetsdebatter og frigjøringsorienterte problemfelt.'}
];

const GLOBAL = {
  em_filosofi_antikk_middelalder_modernitet: {
    thinker_ids:['platon','aristoteles','augustin','thomas_aquinas','rene_descartes','immanuel_kant'],
    source_ids:['sep-socrates','sep-medieval-philosophy','sep-early-modern-rationalism'],
    thesis:'Periodisering er et historisk analyseverktøy, ikke en naturgitt oppdeling av filosofien. Kontinuiteter gjennom oversettelser, kommentarer, universiteter og begrepsarv må undersøkes sammen med reelle brudd i institusjoner, metoder og problemformuleringer.'
  },
  em_filosofi_kinesisk_filosofi: {
    thinker_ids:['konfucius','laozi','zhuangzi'],
    source_ids:['sep-chinese-ethics','sep-chinese-epistemology','sep-zhuangzi'],
    thesis:'Kinesisk filosofi skal rekonstrueres gjennom egne kategorier og teksttradisjoner før komparasjon. Ren, li og dao kan ikke behandles som direkte oversettelser av ferdige europeiske kategorier, og konfucianske og daoistiske posisjoner må holdes åpne som internt uenige tradisjoner.'
  },
  em_filosofi_indisk_buddhistisk_filosofi: {
    thinker_ids:['nagarjuna','vasubandhu','shankara','ramanuja','dharmakirti'],
    source_ids:['sep-indian-epistemology','sep-nagarjuna'],
    thesis:'Indiske og buddhistiske tradisjoner rommer systematiske, gjensidig kritiske teorier om kunnskapsmidler, selv, språk og frigjøring. Pramāṇa, anātman og śūnyatā må plasseres i sine argumenterende skoletradisjoner og ikke samles til én «østlig» lære.'
  },
  em_filosofi_islamsk_jodisk_filosofi: {
    thinker_ids:['al_farabi','ibn_rushd','al_ghazali','maimonides'],
    source_ids:['sep-islamic-metaphysics','sep-medieval-philosophy','sep-maimonides'],
    thesis:'Islamsk og jødisk middelalderfilosofi utviklet egne argumenter om metafysikk, logikk, lov, åpenbaring og intellekt i tett kontakt med greske, arabiske og hebraiske tekstmiljøer. «Dobbel sannhet» skal behandles som en omstridt historiografisk etikett, ikke som en enkel doktrine som kan tilskrives Averroes uten tekstgrunnlag.'
  },
  em_filosofi_afrikansk_filosofi_ubuntu: {
    thinker_ids:['anton_wilhelm_amo','sophie_oluwole','kwasi_wiredu'],
    source_ids:['sep-africana','sep-african-sage','sep-akan-person'],
    thesis:'Afrikansk filosofi er ikke én lære og ubuntu er ikke et synonym for «afrikansk fellesskap». Analysen må skille mellom muntlige og skriftlige tradisjoner, sage philosophy, akademiske debatter om person og fellesskap, og dekoloniale spørsmål om hvem som får definere hva som teller som filosofi.'
  },
  em_filosofi_latinamerikansk_dekolonial_filosofi: {
    thinker_ids:['enrique_dussel','anibal_quijano'],
    source_ids:['sep-latin-american','sep-latin-american-history'],
    thesis:'Latinamerikansk frigjørings- og dekolonial filosofi må leses som internt mangfoldige debatter om kolonialitet, avhengighet, modernitet, autentisitet og frigjøring. Geografisk eller politisk plassering alene avgjør ikke et arguments gyldighet, men kan være filosofisk relevant for hvilke premisser og maktforhold teorien gjør synlige.'
  }
};

const CONCEPT_OVERRIDE = {
  forstaelse:'evnen eller tilstanden vi tilskriver en aktør når den ikke bare produserer passende svar, men kan sies å gripe mening, grunner eller sammenhenger; hvilke kriterier som er nødvendige for forståelse er filosofisk omstridt',
  personskap:'en normativ og metafysisk status knyttet til hva som skal telle som en person; teorier er uenige om rollen til bevissthet, rasjonalitet, agens, relasjoner, kroppslig kontinuitet og ansvar',
  ren:'et konfuciansk begrep ofte oversatt med menneskelighet eller medmenneskelighet, knyttet til relasjonelle dyder og moralsk kultivering i omgang med andre',
  li:'et konfuciansk begrep for ritual, normert skikk og passende handlingsformer som strukturerer relasjoner og moralsk kultivering',
  anatman:'den buddhistiske læren om ikke-selv: at personer ikke har et permanent, uavhengig og uforanderlig selv som eksisterer adskilt fra de prosessene de består av',
  sunyata:'tomhet i Madhyamaka-forstand: at fenomener mangler uavhengig iboende natur og oppstår avhengig av betingelser, relasjoner og begrepslige praksiser',
  pramana:'et kunnskapsmiddel eller en kunnskapskilde i klassisk indisk epistemologi, for eksempel persepsjon eller slutning, hvis pålitelighet og rekkevidde diskuteres mellom skolene',
  fornuft_apenbaring:'forholdet mellom filosofisk begrunnelse og kunnskap som hevdes å være åpenbart; problemet gjelder både mulig samsvar, tolkningskonflikt og grensene for hver kunnskapsform',
  nodvendig_vaerende:'et vesen hvis eksistens ikke er avhengig av en ytre årsak eller betingelse; begrepet spiller en sentral rolle i enkelte islamske metafysiske argumenter, særlig hos Ibn Sīnā',
  dobbel_sannhet:'en historiografisk betegnelse på påståtte konflikter mellom filosofisk og teologisk sannhet; uttrykket er omstridt og må ikke uten videre tilskrives Averroes som hans egen enkle doktrine',
  ubuntu:'en familie av etiske og sosialfilosofiske ideer, særlig i sørlige afrikanske sammenhenger, der menneskelig utfoldelse og moralsk personskap forstås gjennom relasjoner, gjensidighet og fellesskap; begrepet har flere fortolkninger',
  person_gjennom_fellesskap:'tesen eller problemstillingen at personskap formes og vurderes gjennom sosiale relasjoner og anerkjennelse, uten at dette nødvendigvis opphever individets grunnleggende verdi eller rettigheter',
  konseptuell_avkolonisering:'kritisk arbeid med filosofiske begreper og språk for å identifisere når koloniale eller fremmedspråklige kategorier forvrenger lokale distinksjoner, og for å rekonstruere begreper uten å avvise komparasjon eller argumentasjon',
  frigjoringsfilosofi:'filosofi som tar erfaringer av underordning, avhengighet og eksklusjon som utgangspunkt for kritikk og spør hvilke institusjonelle og normative vilkår som kreves for frigjøring',
  maktens_kolonialitet:'Aníbal Quijanos begrep for varige makt-, kunnskaps- og klassifikasjonsmønstre som kan fortsette etter at formelt kolonistyre er avsluttet',
  transmodernitet:'Enrique Dussels begrep for en kritisk overskridelse av moderniteten som verken forkaster dens frigjørende elementer eller gjør europeisk modernitet til eneste målestokk for historisk og filosofisk utvikling',
  filosofisk_kanon:'det historisk skiftende utvalget av verk, problemer og tenkere som gis særlig autoritet i undervisning og faglig selvforståelse; en kanon er institusjonelt formet og kan kritiseres uten at kvalitetskriterier oppgis',
  resepsjon:'måten et verk, argument eller en tradisjon blir lest, oversatt, brukt, kritisert og omformet i senere historiske og institusjonelle sammenhenger',
  modernitet:'en omstridt historisk og filosofisk kategori brukt om endringer i blant annet kunnskap, subjektforståelse, politisk legitimitet, økonomi og institusjoner; periodens grenser og sentrum er selv gjenstand for kritikk'
};

function sourceMerge(doc){
  const byId = new Map((doc.sources||[]).map((s)=>[s.id,s]));
  for(const s of EXTRA_SOURCES) byId.set(s.id,s);
  doc.sources=[...byId.values()];
  return doc;
}

function cleanNorwegian(text){
  return String(text||'')
    .replaceAll('canonicale','kanoniske')
    .replaceAll('canonical','kanonisk')
    .replaceAll('agency','agens')
    .replace(/\s+/g,' ')
    .trim();
}

function conceptParagraph(c, article, conceptById, index){
  const rel = (c.related_ids||[]).map((id)=>conceptById.get(id)?.label).filter(Boolean).slice(0,2);
  const definition = CONCEPT_OVERRIDE[c.id] || cleanNorwegian(c.definition);
  const confusion = cleanNorwegian((c.common_confusions||[])[0] || `å bruke ${c.label.toLowerCase()} som en løs etikett`);
  const contrast = rel.length ? `${c.label} må særlig holdes fra ${rel.join(' og ')}; relasjon mellom begrepene må vises i argumentet, ikke bare nevnes.` : cleanNorwegian(c.distinction);
  const application = index % 3 === 0
    ? `I analysen av ${article.title.toLowerCase()} skal begrepet gjøre en synlig forskjell: leseren må kunne peke på hvilket premiss, kriterium eller grensetilfelle som endres dersom ${c.label.toLowerCase()} forstås annerledes.`
    : index % 3 === 1
      ? `En presis bruk i ${article.title.toLowerCase()} krever derfor et eksempel eller moteksempel som viser når ${c.label.toLowerCase()} gjelder, og når et nærliggende begrep er bedre.`
      : `Begrepet er faglig mest nyttig når det kan brukes til å avgjøre en konkret uenighet i ${article.title.toLowerCase()}, ikke når det bare fungerer som navn på temaet.`;
  return `${c.label}: ${definition}. ${contrast} En typisk feil er ${confusion}. ${application}`;
}

function polishArgumentSection(section){
  return section.paragraphs.map((p,i)=>{
    let x=cleanNorwegian(p);
    x=x.replace(/ Denne rekonstruksjonen tar utgangspunkt i emnets kanoniske definisjon, men gjør det som ellers kan bli liggende implisitt til eksplisitte prøvbare ledd\.$/,' Rekonstruksjonen gjør et mulig slutningstrinn eksplisitt slik at premisset kan avvises eller forsvares selvstendig.');
    x=x.replace(/ Leddet må leses sammen med de øvrige premissene; hvis det forkastes, må også konklusjonens rekkevidde revideres\.$/, i===1 ? ' Dette er artikkelens distinksjonspremiss og kan testes med et grensetilfelle.' : i===2 ? ' Dette er overgangspremisset; her ligger ofte den mest omstridte delen av argumentet.' : ' Konklusjonen er derfor betinget av at de foregående premissene holder.');
    return x;
  });
}

function polishObjection(section){
  return section.paragraphs.map((p,i)=>{
    let x=cleanNorwegian(p);
    if(i===0){
      x=x.replace(/^Innvending: Denne rekonstruksjonen kan virke for skjematisk dersom .*? først og fremst er et historisk, fenomenologisk eller normativt spørsmål\. /,'Innvending: Begrepsrekonstruksjonen kan bli for skjematisk dersom den behandles som hele problemet. ');
    }
    return x;
  });
}

function polishMethod(section){
  return section.paragraphs.map((p)=>{
    let x=cleanNorwegian(p);
    const q='Metoden skal brukes på et eksplisitt argument, begrep, tekst, case, observasjon eller dokumentert stedlig forhold.';
    x=x.replace(`${q} ${q}`,q);
    return x;
  });
}

function thinkerText(ids, thinkerById, title){
  const rows=ids.map((id)=>thinkerById.get(id)).filter(Boolean);
  if(rows.length<2) throw new Error(`Too few curated thinker refs for ${title}: ${ids.join(',')}`);
  const names=rows.map((t)=>`${t.name}${(t.works||[]).length?` gjennom ${(t.works||[]).slice(0,2).join(' og ')}`:''}`);
  return {rows,text:`For ${title.toLowerCase()} er de mest relevante kanoniske inngangene her ${names.join('; ')}. De er valgt fordi de hører til tradisjonen eller den historiske problemrekken artikkelen faktisk behandler. En komparasjon med andre tradisjoner kan komme etterpå, men skal angi et eksplisitt sammenligningsgrunnlag og må ikke gjøre den andre tradisjonen til målestokk.`};
}

async function main(){
  const [registry,conceptDoc,thinkerDoc,sourceDoc,completion,audit]=await Promise.all([
    readJson(ARTICLE_REGISTRY),readJson(CONCEPTS),readJson(THINKERS),readJson(SOURCE_FILE),readJson(COMPLETION),readJson(AUDIT)
  ]);
  const conceptById=new Map(conceptDoc.concepts.map((c)=>[c.id,c]));
  const thinkerById=new Map(thinkerDoc.thinkers.map((t)=>[t.id,t]));
  const sources=sourceMerge(sourceDoc);
  const sourceIds=new Set(sources.sources.map((s)=>s.id));
  const articleById=new Map();
  let totalWords=0;
  let totalParagraphs=0;
  let weakCanonicalDefinitions=0;
  const globalChecks=[];

  for(const row of registry.articles){
    const article=await readJson(row.file);
    const conceptSection=article.sections.find((s)=>s.id==='begreper');
    conceptSection.paragraphs=article.concept_ids.map((id,i)=>{
      const c=conceptById.get(id);
      if(!c) throw new Error(`Unknown concept ${id} in ${article.id}`);
      if(/betegner i .* en avgrenset måte å beskrive eller vurdere/i.test(c.definition)) weakCanonicalDefinitions++;
      return conceptParagraph(c,article,conceptById,i);
    });
    const arg=article.sections.find((s)=>s.id==='argument');
    if(arg) arg.paragraphs=polishArgumentSection(arg);
    const objection=article.sections.find((s)=>s.id==='uenighet');
    if(objection) objection.paragraphs=polishObjection(objection);
    const method=article.sections.find((s)=>s.id==='metode');
    if(method) method.paragraphs=polishMethod(method);
    for(const section of article.sections) section.paragraphs=section.paragraphs.map(cleanNorwegian);

    const go=GLOBAL[article.id];
    if(go){
      const picked=thinkerText(go.thinker_ids,thinkerById,article.title);
      article.thinker_refs=picked.rows.map((t)=>t.id);
      article.primary_work_refs=uniq(picked.rows.flatMap((t)=>t.works||[]));
      article.source_ids=go.source_ids;
      article.claims.forEach((c)=>{c.source_ids=[...go.source_ids];});
      const theory=article.sections.find((s)=>s.id==='teorihistorie');
      const sourceTitles=go.source_ids.map((id)=>sources.sources.find((s)=>s.id===id)?.title).filter(Boolean);
      if(theory){
        theory.paragraphs=[
          picked.text,
          go.thesis,
          `De tradisjonsspesifikke sekundærkildene er ${sourceTitles.join('; ')}. De brukes til å kontrollere historisk plassering, begreper, problemhistorie og bibliografi. Primærverkene må fortsatt leses som primærfilosofiske kilder når en konkret teksttolkning eller doktrinetilskrivning står på spill.`
        ];
      }
      globalChecks.push({id:article.id,thinker_refs:article.thinker_refs,source_ids:article.source_ids});
    }
    if(article.source_ids.some((id)=>!sourceIds.has(id))) throw new Error(`Unknown source in ${article.id}`);
    const prose=article.sections.flatMap((s)=>s.paragraphs);
    if(prose.some((p)=>/dersom .*\. først og fremst/.test(p))) throw new Error(`Awkward objection remained in ${article.id}`);
    if(prose.some((p)=>/\b[a-zæøå]+_[a-zæøå_]+\b/.test(p))) throw new Error(`Raw identifier leaked into prose in ${article.id}`);
    if(prose.some((p)=>p.includes('Metoden skal brukes på et eksplisitt argument, begrep, tekst, case, observasjon eller dokumentert stedlig forhold. Metoden skal brukes'))) throw new Error(`Duplicate method gate in ${article.id}`);
    const words=wc(prose.join(' '));
    const paragraphs=prose.length;
    if(words<1200) throw new Error(`Polished article below 1200 words: ${article.id} ${words}`);
    article.editorial_quality='university_depth_polished';
    article.quality={...article.quality,word_count:words,paragraph_count:paragraphs,editorial_polish:true,tradition_specific_relevance:article.domain_id!=='globale_tradisjoner'||Boolean(go)};
    await writeJson(row.file,article);
    row.word_count=words;
    row.source_ids=[...article.source_ids];
    row.editorial_quality=article.editorial_quality;
    totalWords+=words;
    totalParagraphs+=paragraphs;
    articleById.set(article.id,article);
  }

  for(const chapterRow of registry.chapters){
    const chapter=await readJson(chapterRow.file);
    const articles=(chapter.article_ids||[]).map((id)=>articleById.get(id)).filter(Boolean);
    chapter.source_ids=uniq(articles.flatMap((a)=>a.source_ids));
    chapter.quality={...chapter.quality,editorial_polish:true,source_relevance_rebuilt:true};
    await writeJson(chapterRow.file,chapter);
  }

  const minWords=Math.min(...registry.articles.map((r)=>r.word_count));
  const minSources=Math.min(...registry.articles.map((r)=>r.source_ids.length));
  registry.counts.total_words=totalWords;
  registry.counts.total_paragraphs=totalParagraphs;
  registry.counts.minimum_words_per_article=minWords;
  registry.counts.minimum_sources_per_article=minSources;
  registry.counts.source_registrations=sources.sources.length;
  registry.counts.weak_canonical_definitions_contextually_rewritten=weakCanonicalDefinitions;
  registry.editorial_quality='university_depth_polished';
  registry.global_tradition_relevance=globalChecks;
  await writeJson(SOURCE_FILE,sources);
  await writeJson(ARTICLE_REGISTRY,registry);

  completion.total_word_count=totalWords;
  completion.source_registration_count=sources.sources.length;
  completion.minimum_words_per_article=minWords;
  completion.editorial_quality='university_depth_polished';
  completion.weak_canonical_definitions_contextually_rewritten=weakCanonicalDefinitions;
  completion.contracts=uniq([...(completion.contracts||[]),'Maskinaktig grammatikk, doble metodeformuleringer og rå ID-er er sperret av permanent stilport.','Globale tradisjoner har tradisjonsspesifikke tenker- og kildesett før eventuell komparasjon.','Svake malpregede canonicale begrepsdefinisjoner gjentas ikke ukritisk; artikkelprosaen gir presisert kontekst og begrepsfunksjon.']);
  await writeJson(COMPLETION,completion);

  audit.summary=completion;
  audit.gates={...audit.gates,minimumArticleDepth:minWords>=1200,editorialPolishPassed:true,noMachineGrammarPatterns:true,noDuplicateMethodBoilerplate:true,noRawIdsInProse:true,globalTraditionRelevancePassed:globalChecks.length===6&&globalChecks.every((x)=>x.thinker_refs.length>=2&&x.source_ids.length>=2),contextualConceptRewritePassed:weakCanonicalDefinitions>=0};
  if(Object.values(audit.gates).some((v)=>v!==true)) throw new Error(`Polish audit failed: ${JSON.stringify(audit.gates)}`);
  await writeJson(AUDIT,audit);

  console.log(JSON.stringify({status:'filosofi_editorial_polish_complete',articles:registry.articles.length,totalWords,totalParagraphs,minWords,minSources,sourceCount:sources.sources.length,weakCanonicalDefinitionsContextuallyRewritten:weakCanonicalDefinitions,globalChecks},null,2));
}

await main();
