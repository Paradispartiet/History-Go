#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const writeJson = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(value, null, 2) + '\n');
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const writeText = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), value);
const replaceOnce = (text, from, to, label) => {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, got ${count}`);
  return text.replace(from, to);
};

const key = 'litteratur/litteraturkritiker';
const worldPath = 'data/Civication/roleWorlds/litteratur/litteratur_litteraturkritiker.json';
const narrativePath = 'data/Civication/narratives/leisure/litteratur_litteraturkritiker.json';
const roleScope = 'litteratur_litteraturkritiker';
const themes = ['professional_culture','status_anxiety','shame_reputation','class_power','public_private_leakage','social_mask','alienation','local_knowledge_vs_system'];
const axes = [
  ['question','kritisk spørsmål før dom'],
  ['close_reading','nærlesing og tekstlig belegg'],
  ['history','litteraturhistorisk plassering'],
  ['comparison','sammenligning og tradisjon'],
  ['concepts','presise begreper uten sjargongskjold'],
  ['theory','teori som verktøy, ikke autoritetsmerke'],
  ['canon','kanondannelse og utelukkelse'],
  ['ideology','ideologi, normer og sosiale premisser'],
  ['form','form og stil som del av argumentet'],
  ['argument','påstand, belegg og motargument'],
  ['metacriticism','kritikk av kritikk og faglig uenighet'],
  ['position','kritikerposisjon, institusjon og makt'],
  ['longform','langformet kritisk resonnement'],
  ['revision','reviserbarhet og myndighetsgrense']
];

const topics = [
  ['sporsmalet_for_dom','decision',['personal','leisure'],'Notatblokken','Hva er egentlig spørsmålet?','Du kjenner en sterk reaksjon på et verk og merker hvor lett det er å hoppe rett til en dom.','Litteraturkritikk blir mer enn smak når den formulerer et undersøkbart spørsmål om tekst, form, historie eller virkning.','Kritikerrollen begynner derfor med å gjøre problemet tydelig før konklusjonen låses.','Formulere ett presist spørsmål og la dommen vente til teksten er undersøkt.','Bestemme konklusjonen først og lete etter formuleringer som bekrefter den.',['question','inquiry','role_clarity'],['confirmation_bias','status_pressure','authority_drift'],'Valget gjør kritikken undersøkende før den blir dømmende.','Valget gjør teksten til bevismateriale for en dom som allerede er bestemt.','reputation_risk'],
  ['linjen_som_ikke_slipper','task',['personal','leisure'],'Teksten','Påstanden må tilbake til teksten','Et avsnitt eller bilde virker avgjørende for argumentet ditt, men førsteinntrykket er vanskelig å skille fra det som faktisk står der.','Nærlesing krever at påstander kan føres tilbake til konkrete språklige, formelle eller strukturelle trekk.','Litteraturkritikk kan tolke vidt, men må kunne vise hvor tolkningen får motstand og støtte i verket.','Gå tilbake til passasjen, beskrive hva teksten faktisk gjør og skille observasjon fra slutning.','Beholde tolkningen fordi den høres plausibel ut, uten å kontrollere hva teksten gjør.',['close_reading','evidence','role_clarity'],['overclaim','borrowed_authority','evidence_gap'],'Valget gjør tekstlig belegg synlig og etterprøvbart.','Valget lar en elegant tolkning flyte fri fra verket.','reputation_risk'],
  ['verket_i_sin_tid','story',['personal','leisure'],'Arkivet','Et verk svarer på noe','En eldre tekst blir lest som om den var skrevet direkte inn i dagens debatt.','Litteraturhistorisk plassering kan vise hvilke sjangre, institusjoner, konflikter og forventninger et verk faktisk møtte.','Kontekst forklarer ikke alt, men den kan hindre at nåtiden blir eneste målestokk.','Finne et dokumentert historisk holdepunkt som endrer eller presiserer spørsmålet du stiller teksten.','Bruke dagens kategorier som hele forklaringen og behandle historisk avstand som støy.',['history','context','evidence'],['presentism','context_loss','overclaim'],'Valget lar historisk kontekst komplisere kritikken uten å erstatte teksten.','Valget gjør nåtidens språk til en usynlig universell norm.','reputation_risk'],
  ['sammenligningen_som_ma_baere','decision',['personal','people'],'Boksamtalen','«Det minner om ...» er ikke nok','Du vil sammenligne verket med en eldre roman, en sjangertradisjon eller et annet forfatterskap.','Sammenligning kan gjøre form og historiske forskjeller tydelige, men bare hvis det forklares hva som faktisk sammenlignes.','Navnedropping er ikke det samme som komparativ argumentasjon.','Avgrense sammenligningen til et konkret trekk og forklare både likhet og forskjell.','Nevne flere prestisjetunge referanser uten å vise hva de gjør i argumentet.',['comparison','tradition','evidence'],['name_dropping','status_display','argument_gap'],'Valget gjør tradisjon til analytisk relasjon fremfor kulturell pynt.','Valget bruker referanser som statusmarkører i stedet for belegg.','reputation_risk'],
  ['begrepet_som_ma_defineres','task',['personal','leisure'],'Utkastet','Når ett ord gjør for mye arbeid','Du bruker et kritisk begrep som «realisme», «modernisme», «ironi» eller «polyfoni», men merker at argumentet avhenger av hva ordet betyr.','Fagbegreper kan komprimere analyse, men de blir tomme autoritetsmarkører hvis definisjonen og anvendelsen forblir skjult.','Presisjon krever ikke maksimal sjargong; det krever at leseren kan følge bruken.','Definere begrepet slik du bruker det og vise ett konkret sted der det faktisk klargjør teksten.','La begrepet stå udefinert fordi faglig språk i seg selv gir argumentet tyngde.',['concepts','definition','role_clarity'],['jargon_shield','status_display','argument_gap'],'Valget gjør begrepet til et verktøy leseren kan etterprøve.','Valget bruker fagterminologi som skjold mot spørsmål.','reputation_risk'],
  ['teorien_som_brille','decision',['personal','leisure'],'Lesningen','Når teorien ser alt','En teoretisk ramme åpner interessante mønstre i verket, og fristelsen er å la den forklare resten også.','Teori velger ut fenomener og spørsmål; derfor kan samme tekst belyses annerledes fra andre rammer.','Litteraturkritikeren må vise hva teorien gjør mulig å se, og hva den ikke avgjør.','Bruke teorien eksplisitt som ett perspektiv og teste hvor den møter motstand i teksten.','Behandle teorien som en nøkkel som på forhånd avgjør hva teksten egentlig betyr.',['theory','method','limits'],['theory_capture','certainty','authority_drift'],'Valget gjør teori til metode med synlige begrensninger.','Valget gjør metode til en på forhånd gitt fasit.','reputation_risk'],
  ['hvem_som_ble_kanon','story',['people','leisure'],'Litteraturhistorien','Listen har også en historie','En etablert kanon presenteres som om den alltid har vært den naturlige oversikten over periodens viktigste litteratur.','Kanoner formes gjennom skole, kritikk, forlag, arkiv, priser, språk, klasse, kjønn, oversettelse og institusjonell makt.','Å analysere kanondannelse betyr ikke at alle verk må vurderes likt; det betyr å undersøke hvordan utvalg blir varige.','Spørre hvilke institusjoner og kriterier som gjorde enkelte verk synlige og andre mindre tilgjengelige.','Forklare kanon bare med at de beste verkene naturlig overlevde.',['canon','institutions','selection'],['naturalization','exclusion_blindness','authority_drift'],'Valget gjør kanon til et historisk og institusjonelt fenomen som kan undersøkes.','Valget skjuler seleksjonsmekanismer bak en selvbekreftende kvalitetsforklaring.','reputation_risk'],
  ['normen_i_fortellingen','task',['personal','leisure'],'Analysen','Hva tas for gitt?','Fortellingen framstiller noen roller, verdier eller samfunnsordninger som selvsagte, mens andre blir markert som avvik.','Kritikk kan undersøke slike premisser uten å redusere verket til et politisk slagord eller dikte opp forfatterens motiv.','Det relevante er hva teksten organiserer, synliggjør og naturaliserer — ikke å lese tanker hos personen bak den.','Beskrive det tekstlige mønsteret og skille mellom verkets struktur, historisk kontekst og påstander om forfatteren.','Tilskrive forfatteren et bestemt motiv fordi teksten inneholder et problematisk mønster.',['ideology','norms','work_person_boundary'],['motive_speculation','reduction','overclaim'],'Valget gjør ideologikritikken tekstlig og historisk forankret.','Valget erstatter analyse med spekulasjon om personlige motiver.','reputation_risk'],
  ['formen_er_ikke_emballasje','story',['personal','leisure'],'Utkastet','Hvordan teksten gjør det den gjør','Argumentet ditt handler mest om tema, men du merker at rytme, perspektiv, struktur og sjanger påvirker hva verket faktisk kan si.','I litterær kritikk er form ikke pynt rundt et innhold; form organiserer tid, oppmerksomhet, stemme og forholdet mellom leser og stoff.','En sterk kritikk må derfor kunne vise hvordan form og betydning virker sammen.','Revidere argumentet slik at minst ett formelt grep blir en del av forklaringen.','Behandle formen som stilistisk overflate og la tema alene bære hele tolkningen.',['form','style','evidence'],['content_reduction','formal_blindness','argument_gap'],'Valget lar selve måten verket er skrevet på inngå i argumentet.','Valget gjør kritikken blind for hvordan betydningen faktisk produseres.','reputation_risk'],
  ['motargumentet','decision',['personal','people'],'Arbeidsbordet','Den sterkeste innvendingen','Du ser en tolkning som utfordrer din egen og som ikke enkelt kan avvises som misforståelse.','Kritisk argumentasjon blir sterkere når motargumentet gjengis i sin beste form før forskjellen begrunnes.','Uenighet er ikke svakhet i kritikken; den viser hvor belegg, premisser eller vektlegging skiller lag.','Formulere motargumentet rettferdig og vise nøyaktig hvor ditt resonnement tar en annen vei.','Karikere motposisjonen slik at din egen lesning framstår uimotsagt.',['argument','counterargument','evidence'],['strawman','status_defense','argument_gap'],'Valget gjør uenighet etterprøvbar i stedet for teatralsk.','Valget vinner retorisk ved å svekke argumentet som faktisk må møtes.','relationship_risk'],
  ['kritikken_av_kritikken','story',['people','leisure'],'Kritikersamtalen','Når kollegaen leser annerledes','En annen kritiker peker på et hull i resonnementet ditt og gjør det offentlig uten å avvise hele prosjektet.','Kritikk er også en samtale mellom lesninger, metoder og institusjonelle tradisjoner.','Faglig uenighet kan avklare premisser uten at enhver forskjell blir en kamp om status.','Undersøke innvendingen og svare på premisset eller belegget den faktisk gjelder.','Forsvare posisjonen først og fremst fordi en offentlig korreksjon føles som statustap.',['metacriticism','peer_disagreement','revision'],['status_defense','shame_reputation','social_mask'],'Valget gjør kritikk av kritikk til en del av den intellektuelle praksisen.','Valget gjør offentlig status viktigere enn om argumentet holder.','reputation_risk'],
  ['kritikerens_stol','task',['people','leisure'],'Offentligheten','Hvem får definere samtalen?','Du blir invitert inn i en samtale der kritikeren får mer taletid og definisjonsmakt enn vanlige lesere.','Kritikere kan ha faglig og institusjonell posisjon, men den posisjonen er situert: redaksjon, publikum, språk og tilgang former hvem som blir hørt.','Å erkjenne makt betyr ikke å late som argumenter ikke kan være bedre eller dårligere begrunnet.','Gjøre rolle og premisser tydelige og skille mellom institusjonell plass og styrken i argumentet.','Bruke plattformen som bevis på at egen tolkning har høyere verdi uavhengig av belegg.',['position','institution','power'],['platform_authority','class_power','authority_drift'],'Valget gjør kritikerens posisjon synlig uten å avskaffe argumentets krav.','Valget forveksler tilgang til offentligheten med sannhet eller kvalitet.','reputation_risk'],
  ['essayet_som_ma_holde','task',['personal','leisure'],'Langteksten','Fra enkel dom til sammenhengende argument','Du skal skrive en lengre kritisk tekst der flere observasjoner må henge sammen over tid, ikke bare munne ut i en kort vurdering.','Langformet kritikk trenger en problemstilling, disposisjon, forbindelser mellom avsnitt og en konklusjon som faktisk følger av analysen.','Dette skiller kritikerpraksisen fra Anmelder-verdenens enkeltanmeldelse, score, spoilerhensyn og oppdragslogikk.','Bygge en tydelig argumentkjede der hver del gjør nødvendig arbeid for hovedpåstanden.','Stable gode enkeltobservasjoner uten å vise hvordan de henger sammen i ett resonnement.',['longform','structure','argument'],['fragmentation','rhetorical_display','argument_gap'],'Valget gjør kritikken til et sammenhengende resonnement fremfor en serie treffende kommentarer.','Valget lar stil og enkeltpoenger skjule at hovedargumentet mangler struktur.','stress_risk'],
  ['kritikk_som_kan_revideres','decision',['personal','people'],'Arkivet','En gammel tekst møter nytt belegg','Du leser en kritikk du publiserte tidligere og ser at ny forskning, en ny utgave eller en bedre motlesning endrer premissene.','Kritisk autoritet blir ikke sterkere av å late som tidligere dommer er ufeilbarlige; den krever sporbar begrunnelse og mulighet for revisjon.','Litteraturkritiker er en employment-independent professional_practice, men gir ingen automatisk jobb, lønn, redaktør-, forsknings-, akademisk eller institusjonell myndighet.','Korrigere eller nyansere den tidligere posisjonen og forklare hva som faktisk endret seg.','Forsvare den gamle teksten fordi revisjon kan se ut som svakhet eller tap av autoritet.',['revision','authority_boundary','role_clarity'],['status_defense','fixed_authority','identity_drift'],'Valget gjør revisjon til styrke i en etterprøvbar kritisk praksis.','Valget gjør omdømmevern viktigere enn argumentets holdbarhet.','reputation_risk']
];

const storylets = topics.map((row) => ({
  id: row[0], message_type: row[1], time_slot: row[2], from: row[3], subject: row[4],
  situation: [row[5], row[6], row[7]],
  choices: [
    { id: 'A', label: row[8], effect: 1, tags: row[10], feedback: row[12] },
    { id: 'B', label: row[9], effect: -1, tags: row[11], feedback: row[13] }
  ],
  opens_streams: [], adds_flags: [`litcrit_${row[0]}`], risk_links: [row[14]], links: []
}));
const narrative = {
  schema: 'civication_narrative_stream_v1', id: 'litteratur_litteraturkritiker_stream', type: 'leisure', title: 'Litteraturkritiker',
  sociological_theme: 'langsom_offentlig_litteraturkritikk_narlesing_historie_teori_kanon_ideologi_form_argumentasjon_og_myndighetsgrense',
  applies_when: { any_tags: ['litteratur:litteraturkritiker'] }, time_slots: ['personal','home','people','leisure'], storylets
};
writeJson(narrativePath, narrative);

const people = [
  {id:'medkritikeren',social_function:'gjør faglig uenighet og kritikk av kritikk konkret',class_position:'uavhengig eller redaksjonelt tilknyttet litteraturkritiker',status:'feltstatus med situert offentlig tyngde',power_over_player:'kan utfordre argument, premisser og omdømme',wants:'en kritisk samtale som tåler motlesning',conceals:'at også kritikere kan beskytte egen status',speech_style:'argumenterende, tekstnær og eksplisitt om premisser',teaches_player:'at uenighet må møtes på argumentets sterkeste punkt'},
  {id:'litteraturhistorikeren',social_function:'gjør historisk plassering og dokumentert kontekst konkret',class_position:'fagperson med historisk spesialisering',status:'feltavgrenset akademisk ekspertise',power_over_player:'kan korrigere historiske feil uten å eie den litterære dommen',wants:'presis bruk av historisk kontekst',conceals:'at faglig kontekst heller ikke uttømmer verket',speech_style:'kildebevisst og forbeholden',teaches_player:'at kontekst kan begrense og utvide en tolkning uten å erstatte teksten'},
  {id:'teorileseren',social_function:'gjør metodevalg og teoretiske rammer synlige',class_position:'leser eller forsker med tydelig teoretisk orientering',status:'metodisk kunnskapsfordel',power_over_player:'kan åpne nye spørsmål eller gjøre teori til statusmarkør',wants:'at begreper og metode brukes presist',conceals:'at enhver ramme også velger bort noe',speech_style:'begrepspresis og spørrende',teaches_player:'at teori er et synlig verktøy med begrensninger'},
  {id:'redaktoren',social_function:'representerer den offentlige flaten uten å eie kritikerens argument',class_position:'redaksjonell yrkesrolle',status:'institusjonell publiseringsmakt',power_over_player:'kan gi plass, ramme og redigere, men ikke overføre sannhetsautoritet',wants:'en sammenhengende, lesbar og ansvarlig kritisk tekst',conceals:'at format og profil påvirker hvilke argumenter som får plass',speech_style:'strukturert og offentlighetsorientert',teaches_player:'at redaksjonell posisjon og kritisk begrunnelse er ulike former for makt'},
  {id:'forfatteren',social_function:'holder skillet mellom verk, offentlig mottakelse og person åpent',class_position:'skapende praksis og mulig offentlig person',status:'varierende kulturell status',power_over_player:'kan svare, korrigere fakta og påvirke offentligheten',wants:'at verket møtes på reelt grunnlag',conceals:'at kritikk av verk kan oppleves personlig selv når personmotiver ikke tilskrives',speech_style:'direkte og verkorientert',teaches_player:'at kritikk ikke gir lisens til motivspekulasjon'},
  {id:'den_grundige_leseren',social_function:'representerer et oppmerksomt publikum uten profesjonelt kritikerembete',class_position:'engasjert leser',status:'ingen formell institusjonell myndighet',power_over_player:'kan etterprøve sitater, logikk og tekstlige observasjoner',wants:'å kunne følge hvordan konklusjonen ble til',conceals:'at publikumslesning også har egne premisser og blinde felt',speech_style:'konkret, nysgjerrig og lite imponert av sjargong',teaches_player:'at offentlig kritikk må kunne leses som argument, ikke bare autoritet'}
];
const phases = ['morning','lunch','afternoon','evening'];
const coverage = [];
for (let i = 0; i < axes.length; i += 1) {
  const day = i + 1, axis = axes[i][0], meaning = axes[i][1], storyletId = storylets[i].id;
  for (const phase of phases) {
    let beatType, summary, threadIds;
    if (phase === 'morning') { beatType = 'info'; summary = `Dag ${day}: ${meaning}. Morgenen synliggjør tekstgrunnlaget, metoden eller problemet før argumentet bygges.`; threadIds = [axis]; }
    else if (phase === 'lunch') { beatType = 'conversation'; summary = `Dag ${day}: ${meaning}. Midt på dagen møter kritikken en motlesning, faglig stemme eller offentlig forventning.`; threadIds = [axis]; }
    else {
      beatType = phase === 'afternoon' ? 'decision' : 'private_consequence';
      const prev1 = axes[(i + 13) % 14][0], prev2 = axes[(i + 12) % 14][0];
      threadIds = [prev2, prev1, axis];
      summary = phase === 'afternoon'
        ? `Dag ${day}: ${meaning}. Ettermiddagen krever et konkret valg om belegg, metode, argument eller myndighetsgrense.`
        : `Dag ${day}: ${meaning}. Kvelden viser hvordan valget endrer argumentets holdbarhet, offentlig rolle eller neste lesning.`;
    }
    coverage.push({ day, phase, beat_type: beatType, summary, thread_ids: threadIds, materialization_refs: [`${narrativePath}#${storyletId}`] });
  }
}
const threads = axes.map(([id, relationship], i) => {
  const days = [i + 1, ((i + 1) % 14) + 1, ((i + 2) % 14) + 1];
  return { id, relationship, beat_refs: days.flatMap((day) => [`${day}/afternoon`, `${day}/evening`]) };
});
const world = {
  schema:'civication_role_world_v1',version:1,category:'litteratur',role_scope:roleScope,subject_type:'life_position',
  life_position_ref:{badge_id:'litteratur',id:'litteraturkritiker',label:'Litteraturkritiker'},
  title:'Litteraturkritiker — fortolkning, argument, historie og offentlig dømmekraft',status:'role_world_complete',
  sociological_core:{
    main_problem:'å utvikle offentlig litterær fortolkning og dømmekraft som kan vise spørsmål, tekstlig belegg, historisk plassering, metode og motargument uten at sjargong, plattform, teori eller kulturell status blir erstatning for argumentet',
    description:'Litteraturkritiker er en employment-independent professional_practice for vedvarende offentlig kritisk fortolkning: nærlesing, litteraturhistorie, sammenligning, begrepsarbeid, teori, kanondannelse, ideologi, form, argumentasjon, metakritikk og langform. Rollen er tydelig forskjellig fra Anmelder: den overtar ikke enkeltanmeldelsens oppdragslogikk, frieksemplar/habilitet, spoilerhensyn, poengscore eller redaksjonelle deadlineflyt. Den gir ingen automatisk jobb eller lønn og ingen automatisk redaktør-, forsknings-, akademisk eller institusjonell myndighet, og introduserer ingen ny runtime.'
  },
  theme_ids:themes,
  social_environments:['langformet kulturkritikk i tidsskrift, avis og essayistiske offentligheter','kritikersamtaler der lesninger, metoder og premisser blir utfordret','bibliotek, arkiv og faglige ressurser som gir historisk og tekstlig kontekst','litterære arrangementer der kritikerens plattform og feltposisjon blir synlig','lese- og arbeidsrom der nærlesing, sammenligning og begrepsarbeid skjer over tid','offentlige debatter om kanon, form, ideologi, tradisjon og kulturell verdi'],
  recurring_people_archetypes:people,
  slow_axes:axes.map(([id, meaning]) => ({id, meaning, runtime_binding:'editorial_only_until_governed'})),
  season:{days:14,day_phases:phases,coverage},
  primary_threads:threads,
  private_aftermath:[
    {id:'sporsmal_for_dom',description:'Kritiske konklusjoner begynner oftere med et presist spørsmål enn med en ferdig dom.',materialization_refs:[`${narrativePath}#sporsmalet_for_dom`]},
    {id:'tekstlig_sporbarhet',description:'Påstander blir lettere å føre tilbake til konkrete trekk i teksten.',materialization_refs:[`${narrativePath}#linjen_som_ikke_slipper`]},
    {id:'metodisk_beskjedenhet',description:'Teori og begreper brukes med tydeligere begrensninger og definisjoner.',materialization_refs:[`${narrativePath}#teorien_som_brille`]},
    {id:'synlig_kritikerposisjon',description:'Plattform, institusjon og kulturell kapital skilles tydeligere fra argumentets styrke.',materialization_refs:[`${narrativePath}#kritikerens_stol`]},
    {id:'reviserbar_autoritet',description:'Tidligere kritikk kan korrigeres uten at revisjon behandles som identitetstap.',materialization_refs:[`${narrativePath}#kritikk_som_kan_revideres`]}
  ],
  delayed_consequences:[
    {id:'sporsmalet_returnerer',setup_ref:'1/afternoon',return_ref:'10/evening',domains:['psyche','reputation']},
    {id:'historien_returnerer',setup_ref:'3/afternoon',return_ref:'7/evening',domains:['narrative','reputation']},
    {id:'teorien_returnerer',setup_ref:'6/afternoon',return_ref:'9/evening',domains:['psyche','narrative']},
    {id:'kanonen_returnerer',setup_ref:'7/afternoon',return_ref:'12/evening',domains:['reputation','narrative']},
    {id:'motargumentet_returnerer',setup_ref:'10/afternoon',return_ref:'13/evening',domains:['relationship','reputation']},
    {id:'revisjonen_returnerer',setup_ref:'11/lunch',return_ref:'14/afternoon',domains:['psyche','reputation']}
  ],
  materialization:{no_new_runtime:true,source_refs:storylets.map((entry) => `${narrativePath}#${entry.id}`)}
};
writeJson(worldPath, world);

writeText('tests/civication-litteraturkritiker-role-world.test.js', `#!/usr/bin/env node\n'use strict';\nconst assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));const world=read('${worldPath}'),stream=read('${narrativePath}');assert.equal(world.schema,'civication_role_world_v1');assert.equal(world.category,'litteratur');assert.equal(world.role_scope,'${roleScope}');assert.equal(world.subject_type,'life_position');assert.deepEqual(world.life_position_ref,{badge_id:'litteratur',id:'litteraturkritiker',label:'Litteraturkritiker'});assert.equal(world.status,'role_world_complete');assert.equal(world.materialization.no_new_runtime,true);assert.deepEqual(stream.applies_when.any_tags,['litteratur:litteraturkritiker']);assert.equal(stream.storylets.length,14);assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);assert.equal(world.season.days,14);assert.equal(world.season.coverage.length,56);assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);assert.equal(world.primary_threads.length,14);assert.equal(world.recurring_people_archetypes.length,6);assert.equal(world.private_aftermath.length,5);assert.equal(world.delayed_consequences.length,6);assert.equal(world.materialization.source_refs.length,14);const ids=new Set(stream.storylets.map(x=>x.id)),prefix='${narrativePath}#';for(const beat of world.season.coverage){assert.ok(beat.thread_ids.length>=1);for(const ref of beat.materialization_refs){assert.ok(ref.startsWith(prefix));assert.ok(ids.has(ref.slice(prefix.length)));}}for(const t of world.primary_threads){assert.ok(t.beat_refs.length>=5&&t.beat_refs.length<=10);assert.ok(new Set(t.beat_refs.map(r=>Number(r.split('/')[0]))).size>=3);for(const ref of t.beat_refs){const b=world.season.coverage.find(x=>x.day+'/'+x.phase===ref);assert.ok(b&&b.thread_ids.includes(t.id));}}const required=['id','social_function','class_position','status','power_over_player','wants','conceals','speech_style','teaches_player'];for(const p of world.recurring_people_archetypes)for(const f of required)assert.ok(String(p[f]||'').trim());assert.match(world.sociological_core.description,/employment-independent professional_practice/i);assert.match(world.sociological_core.description,/tydelig forskjellig fra Anmelder/i);for(const term of ['nærlesing','litteraturhistorie','teori','kanondannelse','ideologi','langform'])assert.ok(world.sociological_core.description.includes(term));for(const forbiddenBoundary of ['frieksemplar','spoilerhensyn','poengscore','deadlineflyt'])assert.ok(world.sociological_core.description.includes(forbiddenBoundary));assert.match(world.sociological_core.description,/ingen automatisk jobb eller lønn/i);assert.match(world.sociological_core.description,/ingen ny runtime/i);console.log('Litteraturkritiker Role World gate ok: 14 storylets / 56 beats / 14 threads / 6 people / 5 aftermath / 6 delayed');\n`);
writeText('tests/civication-litteraturkritiker-life-position-readiness.test.js', `#!/usr/bin/env node\n'use strict';\nconst assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));const badge=read('data/badges/litteratur.json'),audit=read('data/Civication/lifePositionRoleWorldReadiness.json'),index=read('data/Civication/roleWorlds/index.json'),streamPath='${narrativePath}';const tier=badge.tiers.find(x=>x.life_position&&x.life_position.id==='litteraturkritiker');assert.ok(tier);assert.equal(tier.threshold,85);assert.equal(tier.life_position.kind,'professional_practice');assert.equal(tier.life_position.employment_independent,true);const row=audit.positions.find(x=>x.key==='${key}');assert.ok(row);assert.equal(row.classification,'ready');assert.equal(row.role_world_status,'role_world_complete');assert.equal(row.role_world_path,'${worldPath}');assert.equal(row.authored_depth.exact_source_ref_count,1);assert.equal(row.authored_depth.max_narrative_depth,14);assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);assert.ok(!audit.queue.some(x=>x.key===row.key));const indexed=index.roles.find(x=>x.life_position_key==='${key}');assert.ok(indexed);assert.equal(indexed.role_scope,'${roleScope}');assert.equal(audit.first_ready,null);assert.equal(audit.summary.pending_ready_positions,0);console.log('Litteraturkritiker readiness gate ok');\n`);

const index = readJson('data/Civication/roleWorlds/index.json');
if (!index.roles.some((row) => row.life_position_key === key)) index.roles.push({category:'litteratur',role_scope:roleScope,subject_type:'life_position',life_position_ref:{badge_id:'litteratur',id:'litteraturkritiker',label:'Litteraturkritiker'},status:'role_world_complete',path:worldPath,life_position_key:key});
index.status='186_role_worlds_materialized';index.summary.role_worlds_total=186;index.summary.career_role_worlds=85;index.summary.life_position_role_worlds=101;index.career_role_world_count=85;index.life_position_role_world_count=101;writeJson('data/Civication/roleWorlds/index.json',index);
const taxonomy=readJson('data/Civication/nonCareerRoleTaxonomy.json');taxonomy.canonical_counts.life_position_role_worlds=101;taxonomy.canonical_counts.total_role_worlds=186;if(!taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes(key))taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.push(key);writeJson('data/Civication/nonCareerRoleTaxonomy.json',taxonomy);
const policy=readJson('data/Civication/roleWorldPolicy.json');policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds=101;writeJson('data/Civication/roleWorldPolicy.json',policy);
const checklist=readJson('data/Civication/roleWorldAuthoringChecklist.json');if(!checklist.reference_worlds.includes(worldPath))checklist.reference_worlds.push(worldPath);writeJson('data/Civication/roleWorldAuthoringChecklist.json',checklist);
const themeBank=readJson('data/Civication/roleWorldThemeBank.json');themeBank.reference_profiles['litteratur/litteratur_litteraturkritiker']=themes;writeJson('data/Civication/roleWorldThemeBank.json',themeBank);

execFileSync(process.execPath,[path.join(ROOT,'scripts/audit-civication-life-position-role-world-readiness.mjs'),'--write'],{cwd:ROOT,stdio:'inherit'});
const readiness=readJson('data/Civication/lifePositionRoleWorldReadiness.json');
if(readiness.summary.classifications.ready!==101||readiness.summary.classifications.needs_authored_depth!==58||readiness.summary.classifications.not_a_standalone_world!==40||readiness.summary.life_position_role_world_complete!==101)throw new Error(`Unexpected readiness summary: ${JSON.stringify(readiness.summary)}`);
const row=readiness.positions.find((entry)=>entry.key===key);if(!row||row.classification!=='ready'||row.role_world_status!=='role_world_complete'||row.role_world_path!==worldPath||row.authored_depth.exact_source_ref_count!==1||row.authored_depth.max_narrative_depth!==14||!row.evidence.exact_source_refs.includes(narrativePath))throw new Error(`Unexpected Litteraturkritiker readiness row: ${JSON.stringify(row)}`);
if((readiness.queue||[]).some((entry)=>entry.key===key))throw new Error('Litteraturkritiker must leave readiness queue');

let readinessTest=readText('tests/civication-life-position-role-world-readiness.test.js');
readinessTest=replaceOnce(readinessTest,'  ready: 100,\n  needs_authored_depth: 59,','  ready: 101,\n  needs_authored_depth: 58,','readiness classification counts');
readinessTest=replaceOnce(readinessTest,'assert.equal(audit.summary.completed_life_position_role_worlds, 100);','assert.equal(audit.summary.completed_life_position_role_worlds, 101);','readiness completed count');
readinessTest=replaceOnce(readinessTest,'assert.equal(audit.summary.positions_with_exact_governed_sources, 100);','assert.equal(audit.summary.positions_with_exact_governed_sources, 101);','readiness exact source count');
readinessTest=replaceOnce(readinessTest,'assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 100);','assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 101);','readiness narrative count');
const previousQueue="assert.ok(!(audit.queue || []).some((row) => row.key === 'litteratur/litteraturinteressert'));";
const criticBlock=`${previousQueue}\nconst litteraturkritiker = audit.positions.find((row) => row.key === '${key}');\nassert.ok(litteraturkritiker);\nassert.equal(litteraturkritiker.classification, 'ready');\nassert.equal(litteraturkritiker.role_world_status, 'role_world_complete');\nassert.equal(litteraturkritiker.role_world_path, '${worldPath}');\nassert.equal(litteraturkritiker.authored_depth.exact_source_ref_count, 1);\nassert.equal(litteraturkritiker.authored_depth.max_narrative_depth, 14);\nassert.deepEqual(litteraturkritiker.evidence.exact_source_refs, ['${narrativePath}']);\nassert.ok(!(audit.queue || []).some((row) => row.key === '${key}'));`;
readinessTest=replaceOnce(readinessTest,previousQueue,criticBlock,'readiness Litteraturkritiker assertion block');
readinessTest=replaceOnce(readinessTest,"console.log('civication life-position Role World readiness v2 ok: 100 ready / 59 authored-depth / 40 not-standalone; 100 complete / no pending-ready');","console.log('civication life-position Role World readiness v2 ok: 101 ready / 58 authored-depth / 40 not-standalone; 101 complete / no pending-ready');",'readiness console summary');
writeText('tests/civication-life-position-role-world-readiness.test.js',readinessTest);

let taxonomyTest=readText('tests/civication-noncareer-role-taxonomy.test.js');
taxonomyTest=replaceOnce(taxonomyTest,"assert.equal(roleWorldIndex.roles.length, 185, 'Role World-indeksen skal ha 85 karriereverdener + 100 life-position worlds');","assert.equal(roleWorldIndex.roles.length, 186, 'Role World-indeksen skal ha 85 karriereverdener + 101 life-position worlds');",'taxonomy total count');
taxonomyTest=replaceOnce(taxonomyTest,"assert.equal(lifePositionWorlds.length, 100, '100 canonical life-position worlds skal være materialisert, inkludert Litteraturinteressert');","assert.equal(lifePositionWorlds.length, 101, '101 canonical life-position worlds skal være materialisert, inkludert Litteraturkritiker');",'taxonomy life count');
const previousAssertions="assert.deepEqual(lifeWorldByKey.get('litteratur/litteraturinteressert').life_position_ref, { badge_id: 'litteratur', id: 'litteraturinteressert', label: 'Litteraturinteressert' });\nassert.equal(lifeWorldByKey.get('litteratur/litteraturinteressert').role_scope, 'litteratur_litteraturinteressert');";
const criticAssertions=`${previousAssertions}\nassert.deepEqual(lifeWorldByKey.get('${key}').life_position_ref, { badge_id: 'litteratur', id: 'litteraturkritiker', label: 'Litteraturkritiker' });\nassert.equal(lifeWorldByKey.get('${key}').role_scope, '${roleScope}');`;
taxonomyTest=replaceOnce(taxonomyTest,previousAssertions,criticAssertions,'taxonomy Litteraturkritiker assertions');
taxonomyTest=replaceOnce(taxonomyTest,"assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 185, career_role_worlds: 85, life_position_role_worlds: 100 });","assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 186, career_role_worlds: 85, life_position_role_worlds: 101 });",'taxonomy summary');
taxonomyTest=replaceOnce(taxonomyTest,'  life_position_role_worlds: 100,\n  total_role_worlds: 185,','  life_position_role_worlds: 101,\n  total_role_worlds: 186,','taxonomy expected counts');
taxonomyTest=replaceOnce(taxonomyTest,"console.log('civication non-career role taxonomy ok: 199 selectable life positions / 85 career Role Worlds + 100 life-position worlds / layers remain separate');","console.log('civication non-career role taxonomy ok: 199 selectable life positions / 85 career Role Worlds + 101 life-position worlds / layers remain separate');",'taxonomy console summary');
writeText('tests/civication-noncareer-role-taxonomy.test.js',taxonomyTest);

let contractTest=readText('tests/civication-role-world-contract.test.js');
contractTest=replaceOnce(contractTest,'assert.equal(index.life_position_role_world_count, 100);\nassert.equal(index.roles.length, 185);','assert.equal(index.life_position_role_world_count, 101);\nassert.equal(index.roles.length, 186);','role world contract counts');
writeText('tests/civication-role-world-contract.test.js',contractTest);

for(const test of ['tests/civication-litteraturkritiker-role-world.test.js','tests/civication-litteraturkritiker-life-position-readiness.test.js','tests/civication-life-position-role-world-readiness.test.js','tests/civication-noncareer-role-taxonomy.test.js','tests/civication-role-world-contract.test.js'])execFileSync(process.execPath,[path.join(ROOT,test)],{cwd:ROOT,stdio:'inherit'});
console.log('Litteraturkritiker canonical sync generated: 186 total / 101 life-position Role Worlds.');
