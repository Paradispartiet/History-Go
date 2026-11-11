import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
const image='bilder/productions/toyen_trafo_oslo_teatersenter_provelokaler.webp';
const vector='bilder/productions/source/toyen_trafo_provelokaler_schematic.svg';
const placeFile='data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json';
const workcardFile='reports/place-production/toyen-trafo-workcard-current.json';
const sourceUrl='https://osloteatersenter.no/booking/';
const municipality='https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/toyen-trafo/';
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#18283c"/><stop offset="1" stop-color="#0a1525"/></linearGradient>
    <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#bd996f"/><stop offset="1" stop-color="#665240"/></linearGradient>
    <radialGradient id="beam"><stop stop-color="#fff0ce" stop-opacity=".46"/><stop offset="1" stop-color="#fff0ce" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="900" height="520" fill="url(#bg)"/>
  <path d="M0 84 H900 M0 415 H900" stroke="#d4a56b" stroke-opacity=".35" stroke-width="2"/>
  <text x="46" y="52" fill="#d5b27f" font-family="DejaVu Sans, sans-serif" font-size="18" letter-spacing="3">TØYEN TRAFO  ·  OSLO TEATERSENTER</text>
  <text x="46" y="128" fill="#ffffff" font-family="DejaVu Sans, sans-serif" font-size="52" font-weight="700">PRØVELOKALER</text>
  <text x="48" y="169" fill="#dce4eb" font-family="DejaVu Sans, sans-serif" font-size="24">Fem studioer for fri og frivillig scenekunst</text>
  <g transform="translate(42,203)">
    <rect width="534" height="250" rx="16" fill="#263548" stroke="#69849b" stroke-width="2"/>
    <rect x="40" y="28" width="454" height="177" rx="12" fill="#101a29" stroke="#d2a56d" stroke-width="2"/>
    <path d="M40 29 C85 85 84 154 40 204 L82 204 C119 145 122 86 82 29 Z" fill="#722f36"/>
    <path d="M494 29 C450 85 450 154 494 204 L452 204 C414 145 411 86 452 29 Z" fill="#722f36"/>
    <ellipse cx="267" cy="112" rx="145" ry="110" fill="url(#beam)"/>
    <path d="M121 187 L416 187 L462 226 L80 226 Z" fill="url(#floor)"/>
    <rect x="184" y="150" width="52" height="34" rx="3" fill="#d7d9d8" opacity=".82"/>
    <path d="M184 151 L169 142 L218 142 L236 151" fill="#9aa9b6"/>
    <circle cx="187" cy="34" r="10" fill="#f2cc80"/><circle cx="267" cy="34" r="10" fill="#f2cc80"/><circle cx="347" cy="34" r="10" fill="#f2cc80"/>
    <text x="267" y="243" text-anchor="middle" fill="#dae2e9" font-size="14" font-family="DejaVu Sans, sans-serif">Skjematisk romillustrasjon – ikke fotografi</text>
  </g>
  <g font-family="DejaVu Sans, sans-serif" transform="translate(602,204)">
    <text x="0" y="15" fill="#d5b27f" font-size="19" font-weight="700">FEM NAVNGITTE ROM</text>
    <g fill="#ffffff" font-size="20">
      <text x="0" y="58">SCENESAL</text><text x="0" y="95">SPEILROM</text>
      <text x="0" y="132">TVILLINGROM 1</text><text x="0" y="169">TVILLINGROM 2</text><text x="0" y="206">TÅRNROM</text>
    </g>
    <g stroke="#d1a36e" stroke-opacity=".65"><path d="M0 67 H240 M0 104 H240 M0 141 H240 M0 178 H240 M0 215 H240"/></g>
  </g>
  <text x="48" y="496" fill="#c8d3df" font-family="DejaVu Sans, sans-serif" font-size="16">Dokumentert tjeneste · illustrasjon av tilbudet, ikke faktisk romplan</text>
</svg>`;
fs.mkdirSync('bilder/productions/source',{recursive:true});
fs.writeFileSync(vector,svg);
fs.mkdirSync('bilder/productions',{recursive:true});
await sharp(Buffer.from(svg)).webp({quality:92,effort:6}).toFile(image);
const rendered=fs.readFileSync(image),m=await sharp(rendered).metadata();
if(m.width!==900||m.height!==520||m.format!=='webp')throw Error('Wrong service preview dimensions');
const place=JSON.parse(fs.readFileSync(placeFile,'utf8'));
if(place.id!=='toyen_trafo'||place.frontImage!=='bilder/places/toyen_trafo_front_portrait.webp')throw Error('Expected published Tøyen trafo portrait and identity');
const record={
 id:'toyen_trafo_oslo_teatersenter_provelokaler',
 name:'Utleie av prøvelokaler ved Oslo teatersenter',
 title:'Utleie av prøvelokaler',
 type:'cultural_rehearsal_studio_rental_service',kind:'service',
 ownerBrandId:'oslo_teatersenter',placeId:'toyen_trafo',status:'active_documented_2026',
 desc:'Oslo teatersenter leier ut fem navngitte prøverom i Tøyen trafo til scenekunst, prøver, kurs og workshops. Rommene ligger i bygningens tredje etasje.',
 description:'Fem bookbare studioer i Tøyen trafo: Scenesal, Speilrom, Tvillingrom 1, Tvillingrom 2 og Tårnrom. Oslo teatersenter drifter utleietilbudet i Hovinveien 1.',
 popupDesc:'Oslo teatersenter tilbyr leie av fem prøvelokaler i Hovinveien 1: Scenesal, Speilrom, Tvillingrom 1, Tvillingrom 2 og Tårnrom. Lokalene brukes blant annet til prøver, scenekunst, dans, kurs og workshops. Oslo teatersenters egne sider beskriver rommenes mål, utstyr og bookingvilkår. Dette er en nåværende, dokumentert tjeneste i den tidligere transformatorstasjonen, ikke en påstand om bestemte teaterproduksjoner eller om hva lokalet tilbød i 1975.',
 image,cardImage:image,
 imageAlt:'Original skjematisk illustrasjon av Oslo teatersenters fem prøverom, med romnavn; ikke et fotografi eller romplan.',
 imageKind:'illustration',
 imageMeta:{
  imageKind:'original_schematic_service_infographic',creator:'History Go',credit:'History Go – original fagillustrasjon basert på Oslo teatersenters romliste',
  source:'history_go_original_schematic',sourcePage:sourceUrl,sourceUrl,
  schematicSourceFile:vector,sourceFactuality:'Only room names and general theatre usage are documented; drawing is generic and not a plan of any actual studio',
  copyright:'History Go original; does not reproduce studio photographs',
  mediaType:'image/webp',width:m.width,height:m.height,sha256:sha256(rendered),bytes:rendered.length,
  disclosure:'Illustrasjon – ikke fotografi eller rekonstruksjon av et konkret rom. De fem romnavnene er hentet fra Oslo teatersenters offisielle utleieside.',
  verifiedAt:'2026-11-05'
 },
 source_urls:[sourceUrl,'https://osloteatersenter.no/ots/',municipality],
 verifiedAt:'2026-11-05'
};
place.productions=[record];
place.place_card_profile.collection_ids=['people','objects','brands','productions'];
place.place_card_profile.reason='Tøyen trafo har fire reelle kilde- og bildeklare samlinger: People (Thorvald Astrup og Kari Rolfsen), Objects (arkivdokumenterte elektriske driftsgjenstander), Brands (Oslo teatersenter og UKS med autentisk, tidsavgrenset identitet) og Næringslivs kategoriuttrykk Productions: Oslo teatersenters dokumenterte utleie av fem prøverom. Siste medlem er en selvstendig tjeneste med tydelig merket skjematisk illustrasjon, ikke et oppdiktet teaterverk eller en falsk romfotografi. Full vFerdig avventer samlet release-QA.';
place.place_card_profile.verifiedAt='2026-11-05';
fs.writeFileSync(placeFile,JSON.stringify(place,null,2)+'\n');
const workcard=JSON.parse(fs.readFileSync('reports/place-production/toyen-trafo-workcard-current.json','utf8'));
workcard.active_phase='People, Objects, Brands og Næringslivs dokumenterte service-produksjon kilde- og bildeklare; sluttkontroll av samlet vFerdig gjenstår.';
workcard.active_file_scope='Materialisere reell, kildebelagt OTS prøvelokaleutleie i Place.productions med ærlig, original skjematisk WebP, kontrollere det fjerde PlaceCard-medlemmet og UI.';
workcard.collection_ids=['people','objects','brands','productions'];
workcard.collection_status.category_expression='PASS – selvstendig, stedsegen utleietjeneste: fem navngitte prøvelokaler dokumentert på offisiell OTS-bookingside, vist med original, tydelig skjematisk illustrasjon uten påstand om fotografisk form. Ingen fiktive forestillinger.';
workcard.profile_status='four_source_and_image_ready_collections_pending_final_release_review';
workcard.remaining_before_vferdig=['Endelig samlet PlaceCard-vurdering på mobil og desktop og QuizCard-flip','Review av universal core og publish-commit etter siste samlingsendring','Formell signert vFerdig-godkjenning etter sluttkontroll'];
workcard.editorial_status='not_vferdig_pending_release';
fs.writeFileSync('reports/place-production/toyen-trafo-workcard-current.json',JSON.stringify(workcard,null,2)+'\n');
fs.writeFileSync('reports/place-production/toyen-trafo-service-production-20261105.json',JSON.stringify({
 place_id:place.id,date:'2026-11-05',status:'one_verified_place_specific_service_integrated',service_id:record.id,
 service_title:record.title,operator:'Oslo teatersenter',
 service_scope:'Five named rehearsal rooms offered for hire within Hovinveien 1; services only, not invented performances',
 source_urls:record.source_urls,rooms:['Scenesal','Speilrom','Tvillingrom 1','Tvillingrom 2','Tårnrom'],
 image,vector,imageSha256:sha256(rendered),imageBytes:rendered.length,dimensions:[900,520],
 imageBoundary:'Original schematic illustration – not a photo, not an actual room floor plan',
 collection_ids:place.place_card_profile.collection_ids,
 vFerdig:'pending_final_release_QA'
},null,2)+'\n');
console.log('Real OTS service integrated '+m.width+'×'+m.height+' SHA-256='+sha256(rendered));
