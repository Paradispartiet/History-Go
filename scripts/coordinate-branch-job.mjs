import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const read = async (p) => JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const write = async (p,v) => { const f=path.join(root,p); await fs.mkdir(path.dirname(f),{recursive:true}); await fs.writeFile(f,JSON.stringify(v,null,2)+'\n'); };
const addUnique = (arr,row,key) => { if(!arr.some(x=>key(x)===key(row))) arr.push(row); };

const paths = {
  etneelva:'data/places/natur/vestland/etneelva.json',
  krokavatnet_etneforkastningen:'data/places/natur/vestland/etne/krokavatnet_etneforkastningen.json',
  terrasselandskapet_etne:'data/places/natur/vestland/etne/terrasselandskapet_etne.json'
};
const P={};
for(const [id,p] of Object.entries(paths)){ const a=await read(p); if(a?.[0]?.id!==id) throw new Error('bad place '+id); P[id]=a[0]; }

const profiles={
  etneelva:{
    tasks:['Finn retninga mot Etnepollen','Finn ope vatn, vasskant og kantvegetasjon','Sjå etter spor etter overvaking frå trygg offentleg grunn','Teikn med blikket korleis to tilløp blir til éi nedre elv'],
    taskWhy:['Straumretninga viser elva som siste ledd mot fjorden.','Elva er meir enn fisk; kantsonene er del av økosystemet.','Etneelva er både naturstad og langsiktig forskingssystem.','Stordalselva og Litledalselva forklarer korleis Etneelva blir danna.'],
    safety:'Bruk berre offentleg veg, bru eller sti. Hald god avstand til glatt eller bratt elvekant og gå aldri inn på driftsområde.',
    training:['Ti minutt roleg elvevandring','Tre observasjonsintervall for lyd, straum og vegetasjon','Enkel balanseøving på flat og tørr grunn'],
    civ:['Samløpsmodell for Etneelva','Etneelva 2003-skjold','Oppvandringsfella i miniatyr','Vandringsbrikke – elv til fjord'],
    brands:[['etne_elveeigarlag','Etne Elveeigarlag','organisation'],['havforskningsinstituttet','Havforskningsinstituttet','research_institution'],['nve','Noregs vassdrags- og energidirektorat','public_authority'],['nasjonale_laksevassdrag','Nasjonale laksevassdrag','protection_system'],['etne_kommune','Etne kommune','public_authority']],
    forna:['Frå lakseelv til verna og målbar bestand','Etneelva var lenge kjend som lakse- og sjøaureelv, men oppvandringa kunne ikkje lesast som nær full teljing av enkeltfisk.','Etnevassdraget har vore nasjonalt laksevassdrag sidan 2003, og moderne overvaking i nedre elv gir detaljerte data om vandrande fisk.','Elva er framleis eit levande naturstad, men også eit langsiktig forvaltnings- og kunnskapssystem.'],
    story:['Elva som blei teljande',2003,'Etneelva er både eit levande laksevassdrag og eit system der vandrande fisk kan følgjast gjennom langsiktig overvaking.','Etneelva byrjar ikkje som eitt einsleg løp. Ved Samkomehølen møtest Stordalselva og Litledalselva, og derfrå går den nedre elva gjennom Etnebygda mot Etnepollen. Denne samanhengen mellom tilløp, elv og fjord gjer staden til meir enn ein lokal lakseplass.\n\nI 2003 fekk Etnevassdraget status som nasjonalt laksevassdrag. Vernet handlar om å ta vare på viktige bestandar og leveområde, men Etneelva har også fått ei særleg rolle som forskings- og overvakingsstad. I den nedre elva blir oppvandrande laks og sjøaure registrert, og data kan vise både villfisk, rømt oppdrettsfisk og endringar over tid.\n\nDet gjer elva til eit møte mellom to måtar å kjenne naturen på. Den eine er direkte: straumen, kantvegetasjonen, retninga mot fjorden og årstidene. Den andre er målt: teljingar, prøvar og lange dataseriar. Ingen av dei erstattar den andre.\n\nHistory Go-rundinga held derfor avstand til både elvekant og driftsområde. Oppgåva er å forstå systemet frå trygge, offentlege punkt: kor vatnet kjem frå, kor det skal, og kvifor ei levande elv også kan vere eit presist kunnskapssystem.'],
    wiki:['Etneelva blir danna når Stordalselva og Litledalselva møtest ved Samkomehølen og renn vidare mot Etnepollen.','Elva er del av Etnevassdraget og har status som nasjonalt laksevassdrag frå 2003.','Den nedre elva er eit viktig overvakingsområde for oppvandrande laks og sjøaure.','Havforskningsinstituttet bruker overvakinga til å følgje villfisk og påverknader over tid.','History Go-staden er eit representativt linjeanker for nedre Etneelva, ikkje eit presist punkt for fiskefella eller heile vassdraget.'],
    facts:['To tilløp dannar Etneelva','Elva renn mot Etnepollen','Nasjonalt laksevassdrag frå 2003','Langsiktig overvaking av oppvandrande fisk','Villfisk og rømt fisk kan registrerast','Elva bind ferskvatn og fjord','Data blir brukte i forsking og forvaltning','Kartmarkøren er eit linjeanker','Observasjon skal skje frå trygg offentleg ferdsel','Samløpet er nøkkelen til den nedre elva'],
    sources:[['Havforskningsinstituttet – overvåking i Etneelva','https://www.hi.no/hi/forskning/marine-data-forskningsdata/overvaking-elv/etneelva'],['Store norske leksikon – Etneelva','https://snl.no/Etneelva'],['NVE – nasjonale laksevassdrag','https://webfileservice.nve.no/API/PublishedFiles/Download/201304021/2208116']],
    design:'article_nature_river_miniature'
  },
  krokavatnet_etneforkastningen:{
    tasks:['Følg landskapslinja langs Krokavatnet','Skil det synlege terrenget frå prosessar på djupet','Finn tre berggrunnstrekk frå trygg ferdselslinje','Teikn ein enkel modell med terreng over og svakheitssone under'],
    taskWhy:['Forkastningssoner kan påverke retningar i landskapet.','Kartmarkøren er ikkje jordskjelvets hyposenter.','Berggrunn kan lesast utan å ta prøvar.','Modellen gjer skiljet mellom observasjon og tolking tydeleg.'],
    safety:'Bruk berre etablert sti eller trygg ferdselslinje. Ikkje gå ut på glatt svaberg, bratte skrentar eller utrygg vasskant.',
    training:['Retningsgang langs trygg ferdselslinje','Hald ei landskapslinje mellom to faste punkt','Stabil ståing på flat og tørr grunn'],
    civ:['Etneforkastningen – relieffmodell','Etnejordskjelvet 1989-brikke','Landskapslinjal','Djup og overflate – todelt modell'],
    brands:[['kringom','Kringom','knowledge_service'],['kartverket','Kartverket','public_authority'],['etneforkastningen','Etneforkastningen','geological_feature'],['etnejordskjelvet_1989','Etnejordskjelvet 1989','historical_event']],
    forna:['Frå usynleg svakheitssone til lesbart landskap','Forkastningssona fanst lenge før moderne seismologi kunne knyte jordskjelv til rørsler på djupet.','Krokavatnet og landskapsdraget kan i dag brukast som visuelt anker for å forstå Etneforkastningen og jordskjelvet i 1989.','Landskapet kan lesast geologisk når synlege former og djup geofysisk tolking blir haldne tydeleg frå kvarandre.'],
    story:['Den usynlege linja under landskapet',1989,'Krokavatnet gjer ei djup geologisk svakheitssone lesbar gjennom retninga i landskapet og minnet om jordskjelvet i 1989.','Ein forkastning er ikkje nødvendigvis ei open sprekk ein kan peike på i dagen. Ved Krokavatnet er det i staden landskapet som gir sporet: vatnet og terrengdraget følgjer ei retning som blir knytt til Etneforkastningen og held fram mot Bjørndalsvida.\n\nI januar 1989 blei Etne råka av eit jordskjelv. Kringom knyter hendinga til rørsle langs forkastningssona på fleire kilometers djup. Det betyr ikkje at kartmarkøren viser eit eksakt jordskjelvsenter, og heller ikkje at ein kan sjå eit ferskt overflatebrot frå hendinga.\n\nDet er nettopp dette skiljet som gjer staden god for læring. På overflata kan ein lese retningar, vatn, søkk, ryggar og berggrunn. Under bakken må geologar og seismologar bruke målingar og modellar for å forstå kvar rørsla skjedde.\n\nHistory Go-rundinga handlar derfor om å halde to tankar samtidig: landskapet kan bere spor av gamle strukturar, men det synlege landskapet er ikkje det same som eit kart over jordskjelvets djupaste punkt.'],
    wiki:['Krokavatnet ligg i eit markert landskapsdrag som blir knytt til Etneforkastningen.','Landskapsdraget held fram sørover mot Bjørndalsvida.','Etnejordskjelvet i januar 1989 blei knytt til rørsle langs forkastningssona på fleire kilometers djup.','Det synlege terrenget er ikkje det same som jordskjelvets nøyaktige hyposenter eller ei dokumentert fersk bruddflate.','Staden eignar seg til å lære skiljet mellom landskapsobservasjon og geologisk tolking.'],
    facts:['Krokavatnet er innsjøankeret','Landskapsdraget blir knytt til Etneforkastningen','Retninga held fram mot Bjørndalsvida','Etne blei råka av jordskjelv i 1989','Rørsla skjedde på fleire kilometers djup','Kartmarkøren er ikkje hyposenteret','Landskapslinjer kan observerast direkte','Staden handlar om berggrunn og forkastningar','Ingen fersk overflatebrudd-påstand blir gjort','Ferdsel skal skje frå trygg rute'],
    sources:[['Kringom – Krokavatnet og Etneforkastningen','https://kringom.no/nb/sunnhordland/etne/krokavatnet']],
    design:'article_nature_geology_miniature'
  },
  terrasselandskapet_etne:{
    tasks:['Finn ei flat terrasse og ein skrå terrassekant','Peik ut retninga mot Stordalsvatnet og fjorden','Finn to synlege høgdenivå','Vis med hendene korleis sediment kan byggje ei flate framfor ein iskant'],
    taskWhy:['Terrassane blir lesbare gjennom flater og kantar.','NVE skildrar eit isranddelta mellom vatnet og fjorden.','Fleire nivå viser korleis landskapet er bygd og seinare skore.','Ein modell forklarer prosessen utan inngrep i bakken.'],
    safety:'Bruk offentleg veg, fortau eller annan lovleg ferdselslinje. Gå ikkje inn på dyrka mark, private tun eller bratte terrassekantar.',
    training:['Nivåvandring langs offentleg ferdselslinje','Langsam horisontskanning etter tre nivå','Vend kroppen mellom retninga mot vatnet, fjorden og ein terrassekant'],
    civ:['Etne-isranddeltaet i relieff','Sedimentkjerne – sand og grus','Yngre Dryas-brikke','Terrassenivå-kart'],
    brands:[['etne_kommune','Etne kommune','public_authority'],['nve','Noregs vassdrags- og energidirektorat','public_authority'],['yngre_dryas','Yngre Dryas','geological_period'],['etnevassdraget','Etnevassdraget','natural_system']],
    forna:['Frå isranddelta til levd Etnebygd','Ved slutten av siste istid bygde smeltevatn og sediment opp eit stort delta- og terrasselandskap mellom Stordalsvatnet og fjorden.','Dei same flate nivåa og terrassekantane er i dag del av busetnad, jordbruk og vegar i Etnebygda.','Eit landskap skapt av is og smeltevatn er seinare teke i bruk av menneske, men formene er framleis lesbare.'],
    story:['Dalen som blei bygd lag for lag',null,'Terrasselandskapet viser korleis smeltevatn og sediment bygde store flater som seinare blei del av busetnad og jordbruk.','Den nedre Etnebygda kan sjå ut som eit vanleg ope dal- og jordbrukslandskap. Men dei flate nivåa og brattare kantane er spor etter ein langt eldre byggeprosess.\n\nEtne kommune framhevar breelvavsetningane som mellom dei største og mest innhaldsrike i fylket. NVE skildrar eit stort isranddelta mellom Stordalsvatnet og fjorden, med randmorener knytte til Yngre Dryas over delar av avsetninga.\n\nEit slikt landskap blir bygd når is, smeltevatn og sediment verkar saman. Vatn transporterer sand, grus og anna materiale. Når energien minkar, blir materialet lagt att, og over tid kan store flater og nivå byggjast opp.\n\nEtter istida blei desse formene tekne i bruk til ferdsel, busetnad og jordbruk. Dermed ligg naturhistoria og kulturbruken oppå kvarandre. History Go-markøren er eit stort semantisk områdeanker: rundinga skal lære blikket å finne nivå, kantar og retninga mellom Stordalsvatnet og fjorden utan å sende spelaren inn på åkrar eller private tun.'],
    wiki:['Etne kommune framhevar breelvavsetningane i Etne som mellom dei største og mest innhaldsrike i fylket.','NVE skildrar eit stort isranddelta mellom Stordalsvatnet og fjorden.','Randmorener over delar av avsetninga blir knytte til Yngre Dryas.','Terrassane blei bygde av prosessar knytte til is, smeltevatn og sedimenttransport ved slutten av siste istid.','Dagens busetnad, jordbruk og vegar ligg i og over det same geologiske landskapet.','History Go-markøren er eit semantisk områdeanker og ikkje ei eksakt avgrensing av alle avsetningane.'],
    facts:['Store breelvavsetningar','Eit stort isranddelta','Landskapet ligg mellom Stordalsvatnet og fjorden','Randmorener ligg over delar av avsetninga','Randmorenene blir knytte til Yngre Dryas','Smeltevatn transporterte sediment','Terrassekantar viser nivåforskjellar','Landskapet er i dag busett og dyrka','Kartpunktet er eit semantisk områdeanker','Observasjon skal skje utan inngrep på privat eller dyrka grunn'],
    sources:[['Etne kommune – naturforvaltning','https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/naturforvaltning/'],['NVE – Etnevassdraget','https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/041-1-etnevassdraget/']],
    design:'article_nature_geology_miniature'
  }
};

for(const [id,c] of Object.entries(profiles)){
  const p=P[id];
  p.tasks_profile={title:c.tasks[0],summary:'Fire trygge, stedsspesifikke observasjonar.',tasks:c.tasks.map((t,i)=>({id:`${id}_task_${i+1}`,title:t,instruction:t+'. Gjennomfør berre frå trygg og lovleg ferdselslinje.',why:c.taskWhy[i]}))};
  p.training_profile={title:'Trygg felttrening',summary:'Tre lågintensive øvingar knytte til landskapslesing.',safety:c.safety,exercises:c.training.map((t,i)=>({id:`${id}_training_${i+1}`,title:t,instruction:t+'. Stopp dersom underlag, vêr eller tilgang ikkje er trygg.',duration_minutes:[10,5,4][i],intensity:'lett',why:'Øvinga trener observasjon og kroppskontroll utan å gjere sårbart eller risikofylt terreng til treningsarena.'}))};
  p.civication_store=c.civ.map((t,i)=>({id:`${id}_civ_${i+1}`,title:t,type:['relieffmodell','metallbrikke','miniatyr','feltkart'][i],kind:'physical_object',desc:`Eit fysisk samleobjekt knytt til ${p.name}.`,placeSpecificReason:`Objektet byggjer direkte på dokumenterte kjenneteikn ved ${p.name}.`,historicalFunction:'Gjer den stadsspesifikke naturhistorien fysisk og samlbar utan inngrep på staden.',physicalObject:true,placeSpecific:true,storePrice:[40,25,35,20][i],currency:'PC',collection:id,collectable:true,civicationUse:p.nature_profile.themes.slice(0,3),source_urls:c.sources.map(x=>x[1])}));
  p.brands=c.brands.map(([id,name,kind])=>({id,name,brand_kind:kind,brand_type:'place_specific_actor_or_context'}));
  p.for_na={title:c.forna[0],before:c.forna[1],now:c.forna[2],change:c.forna[3],lookFor:p.nature_profile.themes.slice(0,4),sources:c.sources.map(x=>x[1])};
  await write(paths[id],[p]);
}

const storyFile='data/stories/stories_etne_natur_rounds_batch5.json';
const stories=Object.entries(profiles).map(([id,c])=>({
  id:`st_${id}_batch5`,type:'environmental',title:c.story[0],year:c.story[1],place_id:id,person_id:null,summary:c.story[2],story:c.story[3],
  sources:c.sources.map(([title,url])=>({title,url})),tags:P[id].tags,related_people:[],related_places:P[id].nature_profile.nearby_place_ids,
  score:{narrative:5,historical:5,source:5,play_value:5,originality:4,total:24},
  arc:{start:c.story[2],middle:c.forna[3],end:P[id].quiz_profile.notes},
  next_scenes:P[id].nature_profile.nearby_place_ids.slice(0,2).map(place_id=>({place_id,reason:`Neste landskapsledd frå ${P[id].name}.`}))
}));
await write(storyFile,stories);

const lexFile='data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch5.json';
const leksikon=Object.entries(profiles).map(([id,c])=>({
  place_id:id,visual:{designCode:c.design},version:2,title:P[id].name,popupDesc:c.story[2],wikiText:c.wiki,
  summary:{one_liner:c.story[2],themes:P[id].nature_profile.themes,tone:['nøktern','faglig','stedsspesifikk','kildeavgrenset']},
  facts:c.facts.map((desc,i)=>({id:`fact_${id}_${String(i+1).padStart(2,'0')}`,label:desc,desc,confidence:'high',sources:[c.sources[0][0]]})),
  chronology:[{id:`chrono_${id}_01`,year:c.story[1],period:P[id].period,desc:c.forna[1],confidence:'high',sources:[c.sources[0][0]]},{id:`chrono_${id}_02`,year:2026,period:'Komplett rundingsprofil',desc:'History Go samlar trygg feltobservasjon, naturfagleg tolking, forteljing og leksikon.',confidence:'high',sources:['History Go place data']}],
  sources:c.sources.map(([label,url],i)=>({id:`source_${id}_${i+1}`,label,type:'external_reference',url,confidence:'high'})),
  interpretation:{what_to_notice:P[id].nature_profile.themes.slice(0,5),why_it_matters:[c.story[2],c.forna[3]],counterpoints:[P[id].quiz_profile.notes,P[id].coordNote]},
  links:{entry_ids:[`st_${id}_batch5`],related_places:P[id].nature_profile.nearby_place_ids,related_people:[]}
}));
await write(lexFile,leksikon);

const sm=await read('data/stories/stories_manifest.json'); sm.files=sm.files||[];
for(const id of Object.keys(profiles)) addUnique(sm.files,{category:'natur',entity_id:id,path:storyFile},x=>`${x.category}|${x.entity_id}|${x.path}`);
await write('data/stories/stories_manifest.json',sm);
const lm=await read('data/leksikon/manifest.json'); lm.files=[...new Set([...(lm.files||[]),lexFile])]; await write('data/leksikon/manifest.json',lm);

const test=`const fs=require('fs'),assert=require('assert');\nconst paths=${JSON.stringify(paths)};\nconst ids=Object.keys(paths);\nfor(const id of ids){const p=JSON.parse(fs.readFileSync(paths[id],'utf8'))[0];assert.ok(p.tasks_profile.tasks.length>=4,id+' tasks');assert.ok(p.nature_profile.summary.length>=100,id+' nature');assert.ok(p.underbadge_ids.length>=4,id+' badges');assert.ok(p.training_profile.exercises.length>=3,id+' training');assert.ok(p.civication_store.length>=4,id+' civication');assert.ok(p.brands.length>=4,id+' brands');assert.ok(p.for_na.before&&p.for_na.now&&p.for_na.change,id+' for_na');assert.ok(!p.rounds&&!p.rundinger,id+' override');}\nconst s=JSON.parse(fs.readFileSync('${storyFile}','utf8')),l=JSON.parse(fs.readFileSync('${lexFile}','utf8'));for(const id of ids){assert.ok(s.some(x=>x.place_id===id&&x.story.length>=900),id+' story');const a=l.find(x=>x.place_id===id);assert.ok(a&&a.wikiText.length>=5&&a.facts.length>=10,id+' leksikon');}\nconsole.log('Etne nature rounds batch 5 OK');\n`;
await fs.writeFile(path.join(root,'tests/etne-natur-rounds-batch5.test.js'),test);
await fs.mkdir(path.join(root,'reports/etne-natur-rounds-batch5/validation'),{recursive:true});
await write('reports/etne-natur-rounds-batch5/summary.json',{batch:5,places:Object.keys(profiles),contract:['tasks','nature','badges','training','civication','brands','for_na','fortellinger','leksikon'],source_boundaries:{etneelva:'Line anchor is not the fish trap or the whole watercourse.',krokavatnet_etneforkastningen:'Landscape anchor is not the earthquake hypocentre.',terrasselandskapet_etne:'Semantic area anchor is not an exact polygon or permission to enter farmland.'}});
await fs.writeFile(path.join(root,'reports/etne-natur-rounds-batch5/README.md'),'# Etne natur – rundingsproduksjon batch 5\n\nKomplette naturprofiler for Etneelva, Krokavatnet og Etneforkastningen og Terrasselandskapet i Etne.\n');
const out=execFileSync(process.execPath,['tests/etne-natur-rounds-batch5.test.js'],{cwd:root,encoding:'utf8'});await fs.writeFile(path.join(root,'reports/etne-natur-rounds-batch5/validation/round-content-test.txt'),out);console.log(out.trim());
