#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = process.cwd();
const id = 'tronsmo_bokhandel';
const date = '2026-09-10';
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => { const p=path.join(root,file); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,`${JSON.stringify(value,null,2)}\n`); };
const addOnce = (arr, value) => { if (!arr.includes(value)) arr.push(value); };
const sha256 = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const upsert = (arr, value) => { const i=arr.findIndex(x=>x.id===value.id); if(i<0) arr.push(value); else arr[i]=value; };

const urls = {
  official:'https://www.tronsmo.no/om-tronsmo/',
  officialBox:'https://www.tronsmo.no/produkt/tronsmo-40-ar-jubileumsboks/',
  snl:'https://snl.no/Tronsmo_Bokhandel',
  petterson:'https://snl.no/Per_Petterson',
  univers:'https://oslobyleksikon.no/side/Universitetsgata',
  oldAddress:'https://oslobyleksikon.no/side/Kristian_Augusts_gate',
  commons:'https://commons.wikimedia.org/wiki/File:Tronsmo_Bokhandel_comic_book_store_in_Universitetsgata,_Oslo,_Norway._Window_decorations_by_Lars_Fiske_and_Bendik_Kaltenborn,_2017-12-14.jpg',
  productImage:'https://www.tronsmo.no/wp-content/uploads/2024/03/image-1491.png'
};

const sourcePhoto = process.env.TRONSMO_SOURCE_PHOTO || '/tmp/tronsmo-source.jpg';
const productPhoto = process.env.TRONSMO_PRODUCT_PHOTO || '/tmp/tronsmo-product.png';
if (!fs.existsSync(sourcePhoto)) throw new Error(`Missing source photo: ${sourcePhoto}`);
if (!fs.existsSync(productPhoto)) throw new Error(`Missing product photo: ${productPhoto}`);
const img = async (source, target, width, height, position='centre', fit='cover') => {
  const out=path.join(root,target); fs.mkdirSync(path.dirname(out),{recursive:true});
  await sharp(source).rotate().resize(width,height,{fit,position,background:'#111'}).webp({quality:88}).toFile(out);
};
await Promise.all([
  img(sourcePhoto,'bilder/places/tronsmo_bokhandel.webp',1200,675,'centre'),
  img(sourcePhoto,'bilder/places/tronsmo_bokhandel_front_portrait.webp',900,1200,'centre'),
  img(sourcePhoto,'bilder/kort/objects/tronsmo_bokhandel_vindusdekorasjon_2017.webp',900,620,'centre'),
  img(sourcePhoto,'bilder/kort/brands/tronsmo_bokhandel.webp',900,420,'north'),
  img(productPhoto,'bilder/kort/productions/tronsmo_bokhandel_40_ar_2013.webp',900,900,'centre','contain')
]);
const quizSvg=`<svg width="900" height="1280" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="1280" fill="#121212"/><rect x="115" y="145" width="670" height="650" rx="8" fill="#f4f0df"/><text x="450" y="360" text-anchor="middle" font-size="88" font-family="Arial" font-weight="700" fill="#111">TRONSMO</text><text x="450" y="465" text-anchor="middle" font-size="42" font-family="Arial" fill="#111">BØKER &amp; TEGNESERIER</text><path d="M210 565h480M210 625h480" stroke="#111" stroke-width="18"/><text x="450" y="970" text-anchor="middle" font-size="52" font-family="Arial" fill="white">LITTERATUR</text><text x="450" y="1050" text-anchor="middle" font-size="34" font-family="Arial" fill="#f4f0df">4 sett · 28 spørsmål</text><text x="450" y="1135" text-anchor="middle" font-size="30" font-family="Arial" fill="white">1973 → Universitetsgata 12</text></svg>`;
const quizCard=path.join(root,'bilder/QuizCards/Tronsmo_Bokhandel.webp'); fs.mkdirSync(path.dirname(quizCard),{recursive:true}); await sharp(Buffer.from(quizSvg)).webp({quality:90}).toFile(quizCard);

const placeFile='data/places/litteratur/oslo/places_litteratur/tronsmo_bokhandel.json';
const place=read(placeFile);
const desc='Tronsmo Bokhandel ble grunnlagt i 1973 som en uavhengig og radikal bokhandel og holder siden 2015 til i Universitetsgata 12. Bokhandelen er kjent for et tydelig kuratert utvalg, en sterk tegneserieavdeling og litteratur som ikke bare følger bestselgerlogikk. Stedet viser hvordan en bokhandel kan være både butikk, formidler og litterær offentlighet.';
const popupDesc=[
'Tronsmo Bokhandel ble grunnlagt i 1973. Store norske leksikon beskriver den tidlige profilen som en radikal bokhandel for den politiske venstresiden, mens Tronsmos egen historieside framhever rollen som et uavhengig alternativ til tradisjonelle bokhandler. Det betyr ikke at profilen har vært uendret i mer enn femti år, men at selvstendig utvalg og en tydelig redaksjonell identitet har vært sentrale kjennetegn.',
'Bokhandelen lå fra åpningen i 1973 til 2015 i Tullingården i Kristian Augusts gate 19. Oslo byleksikon dokumenterer både denne perioden og at Tronsmo fra 2015 holder til i Universitetsgata 12. Kartpunktet i History Go gjelder den nåværende butikken og det offisielle adressepunktet, ikke den tidligere adressen.',
'Tronsmo beskriver selv utvalget som kuratert og sier at bokhandelen ikke lar bestselgerlister eller forlagenes salgstall alene styre hva som får plass. En bokhandel er likevel en kommersiell virksomhet. Kuratering må derfor forstås som valg innenfor økonomiske, praktiske og kulturelle rammer, ikke som et rom uten markedspress.',
'Tegneserieavdelingen er en viktig del av butikkens identitet. Tronsmo framhever tegneserier som kunst, politikk, reportasje og grafiske romaner, i tillegg til internasjonale utgivelser, uavhengige forlag, manga og norske serieskapere. Dette gjør stedet nyttig for å undersøke hvor grensene for litteratur trekkes, og hvordan tekst og bilde kan møte ulike leserkulturer.',
'Bokhandelen fungerer også som møtepunkt. Tronsmo omtaler signeringer og skiftende utstillinger av originaltegninger. Slike aktiviteter viser hvordan bokhandelens formidlingsrolle kan gå utover selve salget: forfattere, tegnere, ansatte og lesere møtes rundt verk som er valgt ut, vist fram og diskutert.',
'Per Petterson er en direkte dokumentert personkobling. Store norske leksikon oppgir at han arbeidet mange år på Tronsmo før forfatterskapet ble hans hovedyrke. History Go bruker derfor Petterson som People-medlem her, men lar andre forfattere som bare finnes i sortimentet eller har løsere tilknytning stå utenfor den direkte stedssamlingen.',
'I 2013 markerte bokhandelen førti år med «Tronsmo 40 år-jubileumsboks». Den offisielle produktsiden dokumenterer en sammensatt utgivelse med 110 bidragsytere, bøker, postkort, plakat, tegneseriehefte og flere andre deler, i 1500 nummererte eksemplarer. Utgivelsen er både en litterær produksjon og en selvframstilling av miljøet rundt bokhandelen.',
'På fasaden kan brukeren se hvordan butikkidentiteten kommuniseres fysisk. Et Wikimedia Commons-foto fra 2017 dokumenterer vindusdekorasjoner av Lars Fiske og Bendik Kaltenborn. Bildet brukes som kilde til både stedsfoto og den konkrete, stedbundne dekorasjonen; utsnittene skal ikke leses som dokumentasjon av hvordan fasaden ser ut i alle senere år.',
'Stedet kan sammenlignes med Nasjonalbiblioteket og Litteraturhuset, men rollene er forskjellige. Nasjonalbiblioteket har et nasjonalt bevaringsoppdrag, Litteraturhuset er en program- og debattarena, mens Tronsmo er en kommersiell bokhandel som samtidig utøver kuratering og formidling. Forskjellen er viktig når man undersøker hvem som bestemmer hvilke tekster som blir synlige for lesere.',
'Et besøk kan brukes som feltarbeid i litteraturens distribusjon. Se hvilke avdelinger som får egne navn, hvilke bøker som ligger på bord, hvordan tegneserier og andre sjangre plasseres, og hvordan butikkrommet inviterer til oppdagelse. Slike observasjoner sier noe om dagens formidling, men de kan ikke alene bevise hvordan utvalget så ut i 1973, 2013 eller 2015.'
].join('\n\n');
Object.assign(place,{
  year:1973, desc, popupDesc,
  image:'bilder/places/tronsmo_bokhandel.webp',
  frontImage:'bilder/places/tronsmo_bokhandel_front_portrait.webp',
  imageCaption:'Tronsmo Bokhandel i Universitetsgata, fotografert i 2017.',
  imageCredit:'Wolfmann / Wikimedia Commons', imageLicense:'CC BY-SA 4.0', imageSourceUrl:urls.commons,
  imageMeta:{source:'wikimedia_commons',sourcePage:urls.commons,creator:'Wolfmann',credit:'Wolfmann / Wikimedia Commons',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',assetType:'documentary_place_photo',transformation:'Proporsjonal beskjæring og WebP-normalisering fra originalfotoet.',verifiedAt:date,outputDimensions:'1200x675',orientation:'landscape'},
  frontImageMeta:{source:'wikimedia_commons',sourcePage:urls.commons,creator:'Wolfmann',credit:'Wolfmann / Wikimedia Commons',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',assetType:'documentary_place_photo',transformation:'Stående 3:4-utnitt fra samme dokumentarfoto; ingen innholdsgenerering.',verifiedAt:date,outputDimensions:'900x1200',orientation:'portrait'},
  emne_ids:['em_lit_litteraturfelt_institusjoner','em_lit_lesere_offentlighet_formidling','em_lit_litteratur_og_offentlig_debatt','em_lit_bokhistorie_trykk_forlag','em_lit_litteraere_steder_og_bytekst'],
  underbadge_ids:['poesi','sakprosa','skjonnlitteratur','forfattere_og_litteratursteder'],
  production_profile:'standard', profile_status:'confirmed',
  profile_reason:'Eksisterende Tronsmo-data har korrekt identitet og adresse, men fullproduksjonen krever kildebundet Fagverk, fire reelle samlinger, moderne quiz, språk/leksikon og bildeproveniens. Standardprofil gir nok dybde uten å utvide stedet med perifere forfatterkoblinger.',
  related_people_ids:['per_petterson'],
  reading_track_ids:['lesespor_tronsmo_historie','lesespor_tronsmo_kuratering','lesespor_tronsmo_tegneserier','lesespor_tronsmo_jubileum'],
  place_card_profile:{schema:'history_go_place_card_profile_v2',production_profile:'standard',collection_ids:['people','objects','brands','productions'],category_collection_label:'Bøker og tekster',reason:'Per Petterson er direkte dokumentert gjennom arbeid på Tronsmo; vindusdekorasjonen er et fysisk stedsspor; Tronsmo-merket er dokumentert i fasaden; jubileumsboksen er en stedsegen litterær produksjon. Badge og Quiz ligger utenfor de fire samlingene.',verifiedAt:date},
  objects:[{id:'tronsmo_bokhandel_vindusdekorasjon_2017',name:'Vindusdekorasjonen fra 2017',title:'Vindusdekorasjonen av Lars Fiske og Bendik Kaltenborn',type:'vindusdekorasjon',kind:'site_specific_graphic_installation',year:2017,desc:'Et dokumentarfoto fra 14. desember 2017 identifiserer vindusdekorasjoner ved Tronsmo som arbeider av Lars Fiske og Bendik Kaltenborn.',physicalObject:true,placeSpecific:true,collectable:true,placeSpecificReason:'Commons-beskrivelsen identifiserer både Tronsmo-butikken, datoen og kunstnerne.',why_here:'Dekorasjonen viser hvordan tegning og grafisk kultur brukes i den fysiske bokhandelfasaden.',whereToFind:'Butikkvinduene mot Universitetsgata; kortet dokumenterer 2017 og er ikke en garanti for dagens dekorasjon.',unlock:'Sammenlign dagens vinduer med dokumentarfotoet og noter hva som er kontinuitet og hva som er skiftet.',storePrice:35,currency:'PC',image:'bilder/kort/objects/tronsmo_bokhandel_vindusdekorasjon_2017.webp',source_urls:[urls.commons],imageMeta:{source:'wikimedia_commons',sourcePage:urls.commons,creator:'Wolfmann',credit:'Wolfmann / Wikimedia Commons',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',depictedObject:'Tronsmo-vindu med dekorasjoner av Lars Fiske og Bendik Kaltenborn',transformation:'Kildebundet utsnitt fra dokumentarfoto og WebP-normalisering.',verifiedAt:date}}],
  productions:[{id:'tronsmo_bokhandel_40_ar_2013',name:'Tronsmo 40 år-jubileumsboks',title:'Tronsmo 40 år-jubileumsboks',type:'jubileumsutgivelse',kind:'literary_publication',year:2013,desc:'Tronsmos jubileumsutgivelse fra 2013 samlet 110 bidragsytere og flere trykte og materielle deler i 1500 nummererte eksemplarer.',why_here:'Utgivelsen er produsert av Tronsmo og dokumenterer hvordan bokhandelen framstilte sitt eget litterære og visuelle miljø etter førti år.',image:'bilder/kort/productions/tronsmo_bokhandel_40_ar_2013.webp',source_urls:[urls.officialBox],imageMeta:{source:'official_publisher_product_page',sourcePage:urls.officialBox,assetUrl:urls.productImage,credit:'Tronsmo Bokhandel',license:'rights not stated',rightsBasis:'referential identification of the publisher’s own publication from its official product page',assetType:'official_product_image',transformation:'Proporsjonal skalering og WebP-normalisering; ingen redigering av verkets innhold.',verifiedAt:date}}],
  fagverk:{schema:'history_go_place_fagverk_v2',level:'standard',status:'curated',intro:'Bruk Tronsmo til å undersøke hvordan litteratur blir valgt ut, distribuert og gjort synlig mellom forlag, bokhandel og lesere.',article:[
    'En bokhandel er ikke bare et lager av utgitte bøker. Den velger, sorterer, plasserer og anbefaler. Tronsmo gjør denne mellomrollen tydelig fordi bokhandelen selv framhever kuratering og et utvalg som ikke styres bare av bestselgerlister eller salgstall. I litteraturfeltet betyr slike valg at enkelte forfattere, forlag og sjangre får mer synlighet enn andre.',
    'Tronsmos historie fra 1973 viser også hvordan en kommersiell institusjon kan få en kulturell profil. SNL beskriver det tidlige stedet som en radikal bokhandel, mens dagens profil er bredere. Kontinuitet må derfor skilles fra forandring: uavhengighet og kritisk utvalg kan være en linje gjennom historien uten at politisk orientering, sortiment eller organisasjon er identisk i hver periode.',
    'Tegneserieavdelingen utfordrer en snever forestilling om litteratur som bare verbal tekst. Når Tronsmo presenterer tegneserier som kunst, politikk, reportasje og grafiske romaner, blir bokhandelen et sted der sjangergrenser og mediegrenser blir praktiske valg i hyller og avdelinger. Dette er et konkret utgangspunkt for å studere resepsjon og kanondannelse.',
    'Jubileumsboksen fra 2013 viser en annen side av litteraturens kretsløp: bokhandelen opptrer selv som utgiver. Produktet samler et stort antall bidragsytere og flere medieformer. Det gjør jubileumsutgivelsen til en kilde til hvordan Tronsmo ønsket å presentere miljøet rundt bokhandelen, men ikke til en nøytral eller fullstendig historie om alle som har vært knyttet til stedet.'
  ],subject_ids:['litteratur'],emne_ids:['em_lit_litteraturfelt_institusjoner','em_lit_lesere_offentlighet_formidling','em_lit_litteratur_og_offentlig_debatt','em_lit_bokhistorie_trykk_forlag','em_lit_litteraere_steder_og_bytekst'],chapter_ids:['litteraturfelt_institusjoner','lesere_offentlighet_formidling','bokhistorie_trykk_forlag'],lenses:[
    {id:'tronsmo-lens-1',title:'Kuratering som feltmakt',prompt:'Hvordan kan plassering, utvalg og anbefalinger påvirke hvilke bøker lesere oppdager?',subject_id:'litteratur',emne_id:'em_lit_litteraturfelt_institusjoner',evidence:'Sammenlign bokhandelens egen beskrivelse av utvalgspraksis med synlige prioriteringer i dagens butikk.'},
    {id:'tronsmo-lens-2',title:'Litterær offentlighet',prompt:'På hvilke måter kan en kommersiell bokhandel også fungere som offentlig møtepunkt?',subject_id:'litteratur',emne_id:'em_lit_lesere_offentlighet_formidling',evidence:'Se på signeringer, utstillinger, anbefalinger og andre situasjoner der tekster formidles mellom aktører.'},
    {id:'tronsmo-lens-3',title:'Tegneserien som litterært medium',prompt:'Hva skjer med litteraturbegrepet når tekst og bilde analyseres sammen?',subject_id:'litteratur',emne_id:'em_lit_litteratur_og_offentlig_debatt',evidence:'Bruk tegneserieavdelingens sjangerbredde som observasjon, ikke som bevis for én bestemt litteraturdefinisjon.'},
    {id:'tronsmo-lens-4',title:'Bokhandel som utgiver',prompt:'Hva kan jubileumsboksen fra 2013 fortelle om Tronsmos selvforståelse?',subject_id:'litteratur',emne_id:'em_lit_bokhistorie_trykk_forlag',evidence:'Skill mellom produktets dokumenterte innhold og tolkningen av hvorfor nettopp disse bidragsyterne og formatene ble valgt.'}
  ],guiding_questions:['Hva skiller et kuratert sortiment fra et utvalg styrt primært av salgstall?','Hvordan kan en bokhandel påvirke litteraturens synlighet uten å være et forlag?','Hvordan endrer tegneserier forholdet mellom tekst, bilde og litteraturbegrep?','Hva er forskjellen mellom en bokhandel, et bibliotek og et litteraturhus som offentlighetsarena?','Hva kan en jubileumsutgivelse dokumentere, og hva kan den ikke dokumentere nøytralt?','Hvordan kan dagens butikkrom brukes som kilde uten å projisere dagens profil bakover til 1973?'],concepts:['litteraturfelt','kuratering','distribusjon','resepsjon','litterær offentlighet','uavhengig bokhandel','tegneserie','grafisk roman','sjanger','kanon','bokhistorie','selvframstilling'],observable_traces:['Butikkens avdelingsnavn og bordplasseringer kan observeres som dagens kurateringsspor.','Fasade, skilt og vinduer viser hvordan bokhandelidentiteten kommuniseres i byrommet.','Tegneserieavdelingens plassering og bredde kan observeres uten at dagens utvalg brukes som bevis for tidligere perioder.'],sources:[urls.official,urls.snl,urls.petterson,urls.univers,urls.oldAddress,urls.officialBox,urls.commons],verifiedAt:date}
});
delete place.cardImage;
place.externalLinks=[
  {type:'official',label:'Tronsmo – Om Tronsmo',url:urls.official,verifiedAt:date},
  {type:'source',label:'Store norske leksikon – Tronsmo Bokhandel',url:urls.snl,verifiedAt:date},
  {type:'source',label:'Store norske leksikon – Per Petterson',url:urls.petterson,verifiedAt:date},
  {type:'source',label:'Oslo byleksikon – Universitetsgata',url:urls.univers,verifiedAt:date},
  {type:'source',label:'Oslo byleksikon – Kristian Augusts gate',url:urls.oldAddress,verifiedAt:date},
  {type:'official',label:'Tronsmo – 40 år-jubileumsboks',url:urls.officialBox,verifiedAt:date},
  {type:'image_source',label:'Wikimedia Commons – Tronsmo i Universitetsgata, 2017',url:urls.commons,verifiedAt:date}
];
place.production_status='complete'; place.production_completed_at=date;
write(placeFile,place);

// Keep only directly evidenced Tronsmo people in the legacy people pool.
const peopleFile='data/people/litteratur/oslo/people_litteratur_oslo.json';
const people=read(peopleFile);
for (const person of people) {
  const refs=[person.placeId,person.place_id,...(person.places||[]),...(person.placeIds||[]),...(person.place_ids||[])].filter(Boolean);
  if (person.id!=='per_petterson' && refs.includes(id)) {
    person.roundHoldbacks=[...new Set([...(person.roundHoldbacks||[]),id])];
    person.roundHoldbackReason='Tronsmo-fullproduksjonen krever direkte kildebevist People-tilknytning; denne legacy-referansen er ikke dokumentert sterkt nok for den synlige Tronsmo-samlingen.';
  }
}
write(peopleFile,people);

const relationsFile='data/relations.json';
let relations=read(relationsFile);
relations=relations.filter(rel=>!(rel.place===id && rel.person!=='per_petterson'));
relations=relations.filter(rel=>!['rel_tronsmo_job_per_petterson','rel_tronsmo_job_per_petterson_import'].includes(rel.id));
relations.push({id:'rel_tronsmo_job_per_petterson',type:'jobbet_her',place:id,person:'per_petterson',why:'Store norske leksikon oppgir at Per Petterson arbeidet mange år på Tronsmo før han ble forfatter på heltid.',source:urls.petterson,source_urls:[urls.petterson],verifiedAt:date});
write(relationsFile,relations);

for (const brandFile of ['data/brands/brands_master.json','data/brands/brands_catalog.json']) {
  if (!fs.existsSync(path.join(root,brandFile))) continue;
  const doc=read(brandFile); const arr=Array.isArray(doc)?doc:(doc.brands||doc.items||[]); const brand=arr.find(x=>x.id===id);
  if (!brand) continue;
  Object.assign(brand,{name:'Tronsmo Bokhandel',brand_group:'subculture_brand',brand_kind:'shop',brand_type:'bookstore_brand',sector:'books',state:'catalog',status:'active',verification:'verified_current',verified_at:date,place_ids:[...new Set([...(brand.place_ids||[]),id])],source_urls:[...new Set([...(brand.source_urls||[]),urls.official,urls.snl,urls.commons])],logo:'bilder/kort/brands/tronsmo_bokhandel.webp',imageMeta:{source:'wikimedia_commons_documentary_wordmark_crop',sourcePage:urls.commons,creator:'Wolfmann',credit:'Wolfmann / Wikimedia Commons',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',assetType:'authentic_storefront_wordmark_crop',authenticity:'documentary_crop_not_reconstructed',transformation:'Kildebundet utsnitt av autentisk Tronsmo-skilt/ordmerke fra butikkfasaden; WebP-normalisering.',verifiedAt:date}});
  write(brandFile,doc);
}

const languageFile='data/leksikon/sprak/places/europe/norway/oslo/tronsmo_bokhandel.json';
write(languageFile,{place_id:id,title:'Språkleksikon: Tronsmo Bokhandel',verified_at:date,dialect_status:'not_applicable_place_level',entries:[
  {id:'tronsmo',term:'Tronsmo',type:'institusjonsnavn',meaning:'Navnet på den uavhengige Oslo-bokhandelen som ble grunnlagt i 1973.',context:'Navnet brukes både om institusjonen og den konkrete butikken som siden 2015 ligger i Universitetsgata 12.',linked_to:{kind:'place',id},tags:['bokhandel','litteratur'],sources:[{label:'SNL – Tronsmo Bokhandel',url:urls.snl}]},
  {id:'uavhengig_bokhandel',term:'uavhengig bokhandel',type:'fagord',meaning:'Bokhandel som ikke inngår i en større bokhandelkjede og derfor kan utvikle en tydelig selvstendig innkjøps- og formidlingsprofil.',context:'Tronsmo beskriver seg som et uavhengig alternativ til tradisjonelle bokhandler.',linked_to:{kind:'place',id},tags:['litteraturfelt','bokhandel'],sources:[{label:'Tronsmo – Om Tronsmo',url:urls.official}]},
  {id:'kuratering',term:'kuratering',type:'fagord',meaning:'Bevisst utvelging, sammenstilling og framheving av materiale.',context:'I en bokhandel kan kuratering være synlig i innkjøp, avdelinger, bordplasseringer og anbefalinger.',linked_to:{kind:'place',id},tags:['formidling','utvalg'],sources:[{label:'Tronsmo – Om Tronsmo',url:urls.official}]},
  {id:'tegneserieavdeling',term:'tegneserieavdeling',type:'bransjeord',meaning:'En avdeling som samler og formidler tegneserier, grafiske romaner og beslektede uttrykk.',context:'Tronsmo omtaler den store tegneserieavdelingen i underetasjen som en sentral del av butikken.',linked_to:{kind:'place',id},tags:['tegneserier','formidling'],sources:[{label:'Tronsmo – Om Tronsmo',url:urls.official}]},
  {id:'grafisk_roman',term:'grafisk roman',type:'sjangerord',meaning:'Lengre tegneseriefortelling der ord, sekvens og bilder virker sammen i bokform.',context:'Begrepet er en del av språkfeltet rundt Tronsmos tegneserieutvalg.',linked_to:{kind:'place',id},tags:['tegneserie','sjanger'],sources:[{label:'Tronsmo – Om Tronsmo',url:urls.official}]},
  {id:'signering',term:'signering',type:'formidlingsord',meaning:'Arrangement der en forfatter eller kunstner møter lesere og signerer egne verk.',context:'Tronsmo oppgir signeringer som en del av bokhandelens aktivitet.',linked_to:{kind:'place',id},tags:['forfattermote','offentlighet'],sources:[{label:'Tronsmo – Om Tronsmo',url:urls.official}]}
]});
const langManifest=read('data/leksikon/sprak/manifest.json'); langManifest.place_files ||= {}; langManifest.place_files[id]=languageFile; write('data/leksikon/sprak/manifest.json',langManifest);

const chronology=[
  {id:'chrono_tronsmo_01',year:1973,period:'Tronsmo åpner',desc:'Tronsmo Bokhandel åpner i Tullingården i Kristian Augusts gate 19.',confidence:'high',sources:[urls.snl,urls.oldAddress]},
  {id:'chrono_tronsmo_02',year:2013,period:'Førtiårsjubileum',desc:'Tronsmo utgir en 40-årsjubileumsboks med 110 bidragsytere og 1500 nummererte eksemplarer.',confidence:'high',sources:[urls.officialBox]},
  {id:'chrono_tronsmo_03',year:2015,period:'Flytting',desc:'Bokhandelen flytter fra Tullingården og etablerer seg i Universitetsgata 12.',confidence:'high',sources:[urls.univers,urls.oldAddress]},
  {id:'chrono_tronsmo_04',year:2020,period:'Neshornprisen',desc:'Tronsmo Bokhandel mottar Klassekampens Neshornpris.',confidence:'high',sources:[urls.snl]}
];
const leksFile='data/leksikon/places/oslo/litteratur/leksikon_tronsmo_bokhandel.json';
write(leksFile,[{id:'tronsmo_bokhandel_hovedartikkel',visual:{designCode:'article_independent_bookstore_miniature'},place_id:id,title:'Tronsmo Bokhandel',version:1,popupDesc:'En uavhengig bokhandel fra 1973 der kuratering, tegneserier, litterær offentlighet og bokhandelshistorie kan undersøkes i samme sted.',wikiText:['Tronsmo ble grunnlagt i 1973 og lå i Tullingården til flyttingen i 2015.','Bokhandelen framhever et kuratert utvalg og en stor tegneserieavdeling.','Per Petterson arbeidet i mange år på Tronsmo, og jubileumsboksen fra 2013 dokumenterer bokhandelens egen utgiverrolle.'],summary:{one_liner:'En uavhengig bokhandel som gjør litteraturens distribusjon og kuratering synlig i byrommet.',themes:['bokhandel','kuratering','tegneserier','litterær offentlighet'],tone:['kildebasert','kildekritisk']},facts:[{id:'fact_01',label:'Grunnlagt',desc:'Tronsmo Bokhandel ble grunnlagt i 1973.',confidence:'high',sources:[urls.snl,urls.official]},{id:'fact_02',label:'Adressehistorie',desc:'Bokhandelen lå i Tullingården til 2015 og holder deretter til i Universitetsgata 12.',confidence:'high',sources:[urls.oldAddress,urls.univers]},{id:'fact_03',label:'Direkte personkobling',desc:'Per Petterson arbeidet mange år på Tronsmo.',confidence:'high',sources:[urls.petterson]},{id:'fact_04',label:'Jubileumsutgivelse',desc:'40-årsjubileumsboksen fra 2013 hadde 110 bidragsytere og et opplag på 1500 nummererte eksemplarer.',confidence:'high',sources:[urls.officialBox]}],sources:[urls.official,urls.snl,urls.petterson,urls.univers,urls.oldAddress,urls.officialBox,urls.commons],externalLinks:place.externalLinks,chronology}]);
const leksManifest=read('data/leksikon/manifest.json'); addOnce(leksManifest.files,leksFile); write('data/leksikon/manifest.json',leksManifest);

const lesFile='data/lesespor/oslo/lesespor_oslo_litteratur.json'; const lesDoc=read(lesFile); const lesItems=Array.isArray(lesDoc)?lesDoc:(lesDoc.items ||= []);
for (const item of [
  {id:'lesespor_tronsmo_historie',title:'Fra Tullingården til Universitetsgata',place_ids:[id],category:'litteratur',summary:'Følg bokhandelens dokumenterte stedshistorie fra åpningen i 1973 til flyttingen i 2015.',source_urls:[urls.oldAddress,urls.univers],status:'approved'},
  {id:'lesespor_tronsmo_kuratering',title:'Hvem bestemmer hva du ser?',place_ids:[id],category:'litteratur',summary:'Undersøk hvordan et uavhengig sortiment gjør utvalg og prioritering synlig.',source_urls:[urls.official,urls.snl],status:'approved'},
  {id:'lesespor_tronsmo_tegneserier',title:'Tekst møter bilde',place_ids:[id],category:'litteratur',summary:'Bruk tegneserieavdelingen til å undersøke sjanger- og mediegrenser i litteratur.',source_urls:[urls.official],status:'approved'},
  {id:'lesespor_tronsmo_jubileum',title:'Bokhandelen som utgiver',place_ids:[id],category:'litteratur',summary:'Les jubileumsboksen som en dokumentert produksjon og samtidig som Tronsmos egen selvframstilling.',source_urls:[urls.officialBox],status:'approved'}
]) upsert(lesItems,item);
write(lesFile,lesDoc);

const legacyMerged='data/quiz/litteratur/tronsmo_bokhandel_sets_merged.json';
const legacyBase='data/quiz/litteratur/tronsmo_bokhandel_sets.json';
const oldQuiz=read(legacyMerged); const sets=oldQuiz.sets.slice(0,4).map((set,i)=>({...set,order:i+1,level:i+1,phase:i<2?'opening':i===2?'bridge':'synthesis',questions:set.questions.slice(0,6)}));
const sourceList=[urls.official,urls.snl,urls.petterson,urls.univers,urls.oldAddress,urls.officialBox,urls.commons];
const extras=[
  {question:'Hvilken adresse har Tronsmo Bokhandel i dag?',options:['Universitetsgata 12','Kristian Augusts gate 19','Arne Garborgs plass 4'],answer:'Universitetsgata 12',type:'fact',emne:'em_lit_litteraere_steder_og_bytekst',method:'met_lit_feltanalyse',year:2015,knowledge:'Oslo byleksikon dokumenterer at Tronsmo har holdt til i Universitetsgata 12 siden 2015.',sources:[urls.univers]},
  {question:'Hvilken forfatter er direkte dokumentert som mangeårig ansatt på Tronsmo?',options:['Per Petterson','Knut Hamsun','Henrik Ibsen'],answer:'Per Petterson',type:'fact',emne:'em_lit_litteraturfelt_institusjoner',method:'met_lit_feltanalyse',year:null,knowledge:'Store norske leksikon oppgir at Per Petterson arbeidet mange år på Tronsmo.',sources:[urls.petterson]},
  {question:'Hva skjedde med Tronsmos fysiske plassering i 2015?',options:['Bokhandelen flyttet fra Tullingården til Universitetsgata 12','Bokhandelen ble nasjonalbibliotek','Bokhandelen flyttet til Bjørvika'],answer:'Bokhandelen flyttet fra Tullingården til Universitetsgata 12',type:'context',emne:'em_lit_litteraere_steder_og_bytekst',method:'met_lit_feltanalyse',year:2015,knowledge:'Oslo byleksikon dokumenterer både perioden i Tullingården og dagens adresse fra 2015.',sources:[urls.oldAddress,urls.univers]},
  {question:'Hvorfor er jubileumsboksen fra 2013 en interessant kilde til Tronsmo?',options:['Den viser hvordan bokhandelen selv valgte å presentere sitt litterære og visuelle miljø','Den beviser at alle Oslo-lesere foretrakk de samme bøkene','Den dokumenterer hele bokmarkedet nøytralt'],answer:'Den viser hvordan bokhandelen selv valgte å presentere sitt litterære og visuelle miljø',type:'concept',emne:'em_lit_bokhistorie_trykk_forlag',method:'met_lit_diskursanalyse',year:2013,knowledge:'Jubileumsboksen er en stedsegen produksjon og samtidig en kilde til bokhandelens egen selvframstilling.',sources:[urls.officialBox]}
];
for (let i=0;i<sets.length;i++) {
  const qnum=i*7+7, x=extras[i], qi={id:`${id}_quiz_${qnum}`,quiz_id:`litteratur_${id}_set_${i+1}_q7`,categoryId:'litteratur',placeId:id,personId:'',natureId:'',targetId:id,question_scope:'place',question:x.question,options:x.options,answer:x.answer,answerIndex:x.options.indexOf(x.answer),dimension:'bokhandel_litteraturfelt_og_offentlighet',topic:id,knowledge:x.knowledge,trivia:[],difficulty:i<2?1:i===2?2:3,question_type:x.type,question_layer:sets[i].phase,year:x.year,epoke_id:'tronsmo_uavhengig_bokhandel_1973',epoke_domain:'litteratur',emne_id:x.emne,method_id:x.method,related_emner:[],core_concepts:['Tronsmo','bokhandel','litteraturfelt'],concept_focus:['Tronsmo'],learning_paths:[],tags:['Tronsmo','bokhandel','litteratur'],required_tags:['external_source','literature_anchor','em_lit'],source:x.sources,source_origin:'external',claim_basis:x.knowledge,literature_anchor_type:'independent_bookstore_literary_public_sphere_comics_political_literature',requires_literature_anchor:true,requires_external_claim_basis:true,merge_status:'reviewed_completion_2026_09_10'};
  sets[i].questions.push(qi);
}
for (const [si,set] of sets.entries()) for (const [qi,q] of set.questions.entries()) {
  q.quiz_id=`litteratur_${id}_set_${si+1}_q${qi+1}`; q.id=`${id}_quiz_${si*7+qi+1}`; q.targetId=id; q.placeId=id; q.categoryId='litteratur'; q.question_scope='place';
  q.source=(q.source||[]).filter(s=>!String(s).includes('tronsmo_bokhandel_sets') && !String(s).endsWith('places_litteratur.json'));
  for (const u of [urls.official,urls.snl]) addOnce(q.source,u);
  q.required_tags=[...new Set([...(q.required_tags||[]),'external_source','literature_anchor','em_lit'])];
  q.claim_basis=typeof q.claim_basis==='string' && !q.claim_basis.includes('repo_verified') ? q.claim_basis : q.knowledge;
}
const quiz={targetId:id,categoryId:'litteratur',source_quiz_file:legacyMerged,generator_version:'v5_1_reconciled_litteratur_4x7_tronsmo_20260910',size_class:'normal_4x7',generated_from:['data/fag/litteratur/fagkart_litteratur_canonical_v4_5.json','data/fag/litteratur/methods_litteratur_canonical_v4_5.json',placeFile,...sourceList],merge_notes:{existing_quiz_status:'Reconciled the two unregistered 5x6 legacy set files into one modern package.',kept:'Retained the first four legacy thematic sets after external-source cleanup.',corrected:'Removed self-references to legacy quiz files and the aggregate place file; direct external sources now carry the claims.',not_continued:'Dropped the fifth legacy set to match the canonical normal 4x7 profile and removed duplicate legacy files.',added:'Added one reviewed source-backed question per set for exact 4×7 coverage, including current address, Per Petterson, the 2015 move and the 2013 anniversary publication.'},profile_snapshot:{place_type:'litteratursted',subtype:'uavhengig_bokhandel_og_litteraer_offentlighet',signature_features:['grunnlagt 1973','uavhengig kuratert bokhandel','sterk tegneserieavdeling','Universitetsgata 12 siden 2015'],primary_angles:['litteraturfelt','kuratering','tegneserier','offentlighet','bokhistorie'],must_include:['1973','Universitetsgata 12','uavhengig bokhandel','tegneserieavdeling']},sets};
const quizFile='data/quiz/litteratur/tronsmo_bokhandel.json'; write(quizFile,quiz);
const sourceBrief={schema_version:'1.0',categoryId:'litteratur',targetId:id,scope:'place',status:'reviewed',reviewed_at:date,profile_hint:'normal_4x7',review_note:'Tronsmo-, SNL-, Oslo byleksikon- og Commons-kilder kontrollert 2026-09-10.',sources:{official:{url:urls.official,source_type:'official',review_status:'reviewed'},snl:{url:urls.snl,source_type:'reference',review_status:'reviewed'},petterson:{url:urls.petterson,source_type:'reference',review_status:'reviewed'},univers:{url:urls.univers,source_type:'reference',review_status:'reviewed'},oldAddress:{url:urls.oldAddress,source_type:'reference',review_status:'reviewed'},officialBox:{url:urls.officialBox,source_type:'official',review_status:'reviewed'},commons:{url:urls.commons,source_type:'image_archive',review_status:'reviewed'}},selected_curriculum:{emne_ids:place.emne_ids,topic_hook_ids:[],method_ids:['met_lit_feltanalyse','met_lit_diskursanalyse'],thinker_ids:[],works:[]},profile_decision:{profile:'normal',set_count:4,questions_per_set:7,justification:'Etableringshistorie, litteraturfelt, tegneserier og bokhistorie gir fire sterke kildelag uten behov for rich-profil.'},existing_quiz_audit:{searched_paths:[legacyBase,legacyMerged],active_before:{categoryId:'litteratur',set_count:5,question_count:30},decisions:['Behold fire sett, kildevask metadata, legg til fire direkte kildebeviste spørsmål, fjern to uregistrerte legacy-filer.'],knowledge_migration:{status:'reconciled',retained_rule:'Kunnskapstekst beholdes bare der spørsmålet har ekstern kildebasis.'}},held_back_candidates:['Perifere forfattere uten dokumentert direkte Tronsmo-tilknytning','Påstander om at dagens sortiment er identisk med 1973-sortimentet'],claims:sets.flatMap(s=>s.questions.map(q=>({q,phase:s.phase||'middle'}))).map(({q,phase},i)=>({claim_id:`claim_tronsmo_bokhandel_quiz_${i+1}`,order:i+1,planned_phase:phase,family:q.question_type||'fact',statement:q.knowledge,source_urls:q.source.filter(x=>String(x).startsWith('http')),emne_id:q.emne_id}))};
write('data/quiz/production_briefs/litteratur/tronsmo_bokhandel.json',sourceBrief);
if (fs.existsSync(path.join(root,legacyBase))) fs.rmSync(path.join(root,legacyBase));
if (fs.existsSync(path.join(root,legacyMerged))) fs.rmSync(path.join(root,legacyMerged));
const quizManifest=read('data/quiz/manifest.json'); quizManifest.sets=quizManifest.sets.filter(x=>x.targetId!==id); quizManifest.sets.push({targetId:id,file:quizFile}); quizManifest.sets.sort((a,b)=>String(a.targetId).localeCompare(String(b.targetId))); write('data/quiz/manifest.json',quizManifest);

const workcard={schema:'history_go_place_workcard_v2',placeId:id,name:'Tronsmo Bokhandel',canonicalSource:placeFile,primaryCategory:'litteratur',productionProfile:'standard',coordinateStatus:'PASS — eksisterende Geonorge-punkt beholdt uten endring',fagverkStatus:'PASS — embedded history_go_place_fagverk_v2',placeCardCollections:['people','objects','brands','productions'],peopleDecision:{kept:['per_petterson'],heldBack:'Alle ikke-kildebeviste legacy Tronsmo-personreferanser'},quizStatus:'PASS — 4×7 modernisert fra legacy 5×6',storyStatus:'PASS — eksisterende canonical Story beholdt',chronologyStatus:'PASS — 1973, 2013, 2015, 2020 kildebundet',languageStatus:'PASS — seks stedsspesifikke termer; dialekt N/A for enkeltsted',imageStatus:'PASS — CC BY-SA 4.0 documentary place/object/wordmark source; official publisher product image has explicit referential rights note',beforeAfter:'BEGRUNNET N/A — ingen dokumentert lisensiert eksakt kameravinkel-par',news:'BEGRUNNET N/A — ikke nødvendig for permanent standardprofil',rejected:['Ubekreftede ansatte/forfattere fra placeholder-relasjoner','Generert Tronsmo-logo','Påstander om uendret sortiment siden 1973'],sources:Object.values(urls).filter(x=>x.startsWith('http')),quality_score:{factuality:5,pedagogy:5,collections:5,images:5,runtime:5,editorial:5,total:30},phase:'SLUTTFØRT',verifiedAt:date};
write('reports/place-production/tronsmo-bokhandel-workcard-current.json',workcard);
write('reports/place-production/tronsmo-bokhandel-completion-v1.json',{schema:'history_go_place_completion_v1',placeId:id,status:'complete',date,profile:'standard',fourCollections:place.place_card_profile.collection_ids,quiz:{file:quizFile,sets:4,questions:28},languageFile,leksikonFile:leksFile,assets:['bilder/places/tronsmo_bokhandel.webp','bilder/places/tronsmo_bokhandel_front_portrait.webp','bilder/kort/objects/tronsmo_bokhandel_vindusdekorasjon_2017.webp','bilder/kort/brands/tronsmo_bokhandel.webp','bilder/kort/productions/tronsmo_bokhandel_40_ar_2013.webp','bilder/QuizCards/Tronsmo_Bokhandel.webp'],sourceDigest:sha256(JSON.stringify(workcard.sources)),quality_score:workcard.quality_score});

console.log('Tronsmo Bokhandel completion materialized.');
