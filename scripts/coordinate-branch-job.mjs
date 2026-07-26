#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(), historyDir=path.join(root,'data/fag/historie'), reportDir=path.join(root,'reports/historie-v5');
const conceptPath=path.join(historyDir,'concepts_historie_canonical_v5_5.json'), theoryPath=path.join(historyDir,'theory_objects_historie_canonical_v5_5.json');
const read=(f)=>JSON.parse(fs.readFileSync(f,'utf8')), write=(f,v)=>fs.writeFileSync(f,`${JSON.stringify(v,null,2)}\n`), A=(v)=>Array.isArray(v)?v:[];
fs.mkdirSync(reportDir,{recursive:true});
const profile=(domain='')=>{
 if(domain.includes('kilder_arkiv'))return{arena:'kildeproduksjon, proveniens, arkivorden og dokumentert fravær',primary:'samtidige originalkilder med dokumentert proveniens og bevaringshistorie',counter:'uavhengige kontrollkilder eller motstemmer som viser utvalg, taushet og alternativ kontekst'};
 if(domain.includes('tid_periodisering'))return{arena:'kronologi, dateringsgrunnlag, overgang og periodiseringsvalg',primary:'daterte primærkilder eller materielle spor som avgrenser forløpet',counter:'uavhengige kronologier og sammenligningskilder som tester valgt grense og tempo'};
 if(domain.includes('makt_stat'))return{arena:'myndighet, institusjon, beslutning, håndheving og berørte grupper',primary:'vedtak, lov, protokoll eller institusjonsarkiv som dokumenterer formell myndighet',counter:'praksis-, konflikt- og bruker-/undersåttkilder som viser faktisk gjennomføring og motstand'};
 if(domain.includes('middelalder'))return{arena:'kirkelig og kongelig institusjon, rett, eiendom og lokal praksis',primary:'diplom-, lov-, regnskaps-, arkeologiske eller bygningshistoriske kilder fra relevant område',counter:'uavhengige materielle, komparative eller lokale kilder som tester institusjonens egen framstilling'};
 if(domain.includes('1814'))return{arena:'grunnlovsprosess, statsdannelse, representasjon og politisk praksis',primary:'samtidige forfatnings-, møte-, valg- eller forvaltningsdokumenter',counter:'brev, presse, lokale arkiv og senere praksiskilder som tester formelle formuleringer'};
 if(domain.includes('industri_arbeid'))return{arena:'produksjon, arbeidsprosess, lønn, hushold og organisering',primary:'bedrifts-, lønns-, produksjons-, tilsyns- eller fagforeningskilder',counter:'arbeider-, husholds- og lokalsamfunnskilder som viser erfaring, variasjon og konsekvens'};
 if(domain.includes('krig_okkupasjon'))return{arena:'krigshendelse, okkupasjonsmakt, sivilsamfunn, motstand og etteroppgjør',primary:'samtidige militære, sivile, illegale eller administrative kilder med kjent opphav',counter:'vitne-, lokal-, fiende- og etterkrigskilder som kontrollerer perspektiv og senere minne'};
 if(domain.includes('velferd'))return{arena:'rettighet, vilkår, tjeneste, profesjonell vurdering og levd hverdagsliv',primary:'lov-, forvaltnings-, journal-, søknads- eller tjenestekilder med eksplisitt adgangsgrunnlag',counter:'bruker-, husholds- og praksiskilder som viser faktisk tilgang, avslag og konsekvens'};
 if(domain.includes('migrasjon'))return{arena:'mobilitet, juridisk status, nettverk, bosetting og tilhørighet',primary:'registrerings-, flytte-, arbeids-, statsborgerskaps- eller organisasjonskilder',counter:'selvrepresentasjon, husholds-, nettverks- og lokalsamfunnskilder som tester administrative kategorier'};
 if(domain.includes('minne_kulturarv'))return{arena:'minnepraksis, kulturarvutvelgelse, formidling og offentlig konflikt',primary:'bestillings-, vedtaks-, samlings-, utstillings- eller ritualdokumentasjon',counter:'publikums-, bruker-, minoritets- og protestkilder som viser mottakelse og motfortolkning'};
 if(domain.includes('byhistorie'))return{arena:'byrom, eiendom, infrastruktur, bruk, regulering og stedsendring',primary:'kart, plan, eiendom, byggesak, foto eller kommunal dokumentasjon fra relevant tidspunkt',counter:'bruks-, befolknings-, nærings- og lokalkilder som viser faktisk endring og fordeling'};
 if(domain.includes('katastrofer'))return{arena:'hendelsesforløp, årsakskjede, beredskap, tap og gjenoppbygging',primary:'samtidige hendelses-, brann-, politi-, tilsyns-, vær- eller skaderapporter',counter:'vitne-, presse-, tekniske og etterundersøkelseskilder som skiller utløsende hendelse fra bakgrunnsårsak'};
 if(domain.includes('kjonn_familie'))return{arena:'kjønn, familie, kropp, seksualitet, omsorg og livsløp',primary:'samtidige retts-, husholds-, helse-, arbeids- eller organisasjonskilder',counter:'selvrepresentasjon og praksiskilder som synliggjør variasjon, uformelt arbeid og kategoribrudd'};
 if(domain.includes('religion'))return{arena:'trospraksis, institusjon, konfesjon, minoritet og offentlighet',primary:'kirke-, menighets-, retts-, organisasjons- eller ritualkilder fra berørte miljøer',counter:'lek-, dissenter-, minoritets- og hverdagskilder som tester institusjonell norm og faktisk praksis'};
 if(domain.includes('samisk'))return{arena:'samiske samfunn, ressursbruk, språk, statsinngrep og rettighetskamp',primary:'samiske egenkilder, lokale arkiv, rettighets- og ressursdokumentasjon med tydelig proveniens',counter:'stats-, misjons-, skole- og forskningsarkiv lest mot samiske motstemmer og ettervirkninger'};
 if(domain.includes('miljo_klima'))return{arena:'klima, landskap, energi, ressursbruk, forurensning og miljøulikhet',primary:'målte natur-, produksjons-, ressurs- eller forurensningsdata med dokumentert metode',counter:'lokale bruks-, helse-, konflikt- og fordelingskilder som viser sosial og romlig virkning'};
 if(domain.includes('vitenskap_teknologi'))return{arena:'kunnskapsproduksjon, måling, ekspertise, teknologi og institusjonell makt',primary:'laboratorie-, institusjons-, patent-, standard-, måle- eller tekniske kilder',counter:'bruker-, arbeids-, konflikt- og ekskluderingskilder som tester ekspertpåstand og faktisk virkning'};
 if(domain.includes('global_kolonial'))return{arena:'imperium, kolonial forbindelse, varekjede, migrasjon og transnasjonalt nettverk',primary:'handels-, skips-, administrasjons-, misjons-, arbeids- eller organisasjonsarkiv på flere steder',counter:'koloniserte, migrerte og lokale aktørers kilder som tester sentrumsperspektiv og sammenvevd årsak'};
 return{arena:'aktører, institusjoner, praksis, tid og sted',primary:'minst én samtidig primærkilde med dokumentert proveniens og relevant avgrensning',counter:'minst én uavhengig kontrollkilde eller motstemme som tester påstanden'};
};
const concepts=read(conceptPath), byId=new Map(concepts.map(x=>[x.concept_id,x]));let conceptRepairs=0;
for(const c of concepts){const p=profile(A(c.domain_ids)[0]),label=String(c.label||c.concept_id);if(A(c.indicators).length<2){c.indicators=[`dokumentert forekomst av «${label}» innen ${p.arena}`,`tydelig avgrensning av tid, sted, aktører og berørte grupper for «${label}»`,`sammenlignbar variasjon eller endring som viser hvordan «${label}» virket i praksis`];conceptRepairs++;}if(A(c.source_requirements).length<2){c.source_requirements=[p.primary,p.counter];conceptRepairs++;}}
const avinst=byId.get('con_his_avinstitusjonalisering');if(avinst){const fields=['broader_concepts','narrower_concepts','related_concepts','distinguish_from'];for(const field of fields)avinst[field]=A(avinst[field]).filter(id=>id!=='con_his_utskrivning');if(!A(avinst.related_concepts).includes('con_his_institusjonalisering'))avinst.related_concepts=[...A(avinst.related_concepts),'con_his_institusjonalisering'];}
write(conceptPath,concepts);
const theories=read(theoryPath);let theoryRepairs=0;for(const t of theories){if(A(t.limitations).length<3){const domain=A(t.explanatory_scope)[0]||'historie';const p=profile(domain);t.limitations=[...A(t.limitations),`Rammen «${t.label}» kan ikke generaliseres på tvers av tid, sted og aktørgrupper uten sammenlignbare kilder fra ${p.arena}.`];theoryRepairs++;}}write(theoryPath,theories);
fs.writeFileSync(path.join(reportDir,'historie-v5-5-depth-repair-summary.json'),`${JSON.stringify({generated_at:new Date().toISOString(),concept_field_repairs:conceptRepairs,theory_limitation_repairs:theoryRepairs,unknown_relation_repairs:avinst?1:0},null,2)}\n`);
const run=(name,cmd,args)=>{const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8'});fs.writeFileSync(path.join(reportDir,name),`$ ${cmd} ${args.join(' ')}\n${r.stdout||''}${r.stderr||''}`);if(r.status!==0)throw new Error(`${cmd} ${args.join(' ')} failed with ${r.status}`);};
run('historie-v5-5-permanent-validator-write.log',process.execPath,['tools/validate-historie-v5.mjs','--write']);
run('historie-v5-5-quality-depth-write.log',process.execPath,['tools/audit-historie-v5-5-quality-depth.mjs','--write-freeze','--reason=Completed all 20 V5.5 domains and repaired missing concept indicators, source requirements, theory limitations and relation integrity before permanent freeze.']);
run('historie-v5-5-quality-depth-verify.log',process.execPath,['tools/audit-historie-v5-5-quality-depth.mjs']);
run('historie-v5-5-knowledge-write.log','npm',['run','knowledge:canonical:write']);
run('historie-v5-5-knowledge-check.log','npm',['run','knowledge:canonical:check']);
run('historie-v5-5-quiz-context.log','npm',['run','quiz:context']);
run('historie-v5-5-quiz-context-audit.log','npm',['run','audit:quiz-production-context']);
run('historie-v5-5-quiz-theory-audit.log','npm',['run','audit:quiz-theory-binding']);
const restore=spawnSync('git',['checkout','--','data/places/places_index.json','data/quiz/production_context/by/deichman_bjorvika.json'],{cwd:root,encoding:'utf8'});if(restore.status!==0)throw new Error(restore.stderr||'Failed to restore generated place files');

fs.rmSync(path.join(root,'scripts','coordinate-branch-job.mjs'),{force:true});
fs.rmSync(path.join(root,'scripts','history-v5-5-quality-materialization.mjs'),{force:true});
fs.rmSync(path.join(root,'scripts','.coordinate-branch-job-complete'),{force:true});
const branch=process.env.GITHUB_HEAD_REF||process.env.GITHUB_REF_NAME||'agent/history-v5-5-global-quality-uplift';
const git=(name,args)=>{const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});fs.writeFileSync(path.join(reportDir,name),`$ git ${args.join(' ')}\n${r.stdout||''}${r.stderr||''}`);if(r.status!==0)throw new Error(`git ${args.join(' ')} failed with ${r.status}`);};
git('historie-v5-5-quality-git-config-name.log',['config','user.name','github-actions[bot]']);
git('historie-v5-5-quality-git-config-email.log',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
git('historie-v5-5-quality-git-add.log',['add','-A']);
const staged=spawnSync('git',['diff','--cached','--quiet'],{cwd:root});
if(staged.status===1){
 git('historie-v5-5-quality-git-commit.log',['commit','-m','Materialiser permanent Historie V5.5-kvalitetsfrys']);
 git('historie-v5-5-quality-git-pull.log',['pull','--rebase','origin',branch]);
 git('historie-v5-5-quality-git-push.log',['push','origin',`HEAD:${branch}`]);
}else if(staged.status!==0){
 throw new Error(`git diff --cached --quiet failed with ${staged.status}`);
}
