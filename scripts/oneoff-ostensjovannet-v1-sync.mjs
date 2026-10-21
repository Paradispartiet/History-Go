#!/usr/bin/env node
// Temporary single-place source/image/i18n materialization; removed by CI before merge.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {placeSourceHash} from './check-place-i18n-freshness.mjs';
const pid='ostensjovannet',p='data/places/natur/oslo/places_oslo_natur_hovedsteder/ostensjovannet.json';
const imageDir='bilder/places',front=imageDir+'/ostensjovannet_front_portrait.webp',landscape=imageDir+'/ostensjovannet_landscape.webp';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const place=JSON.parse(fs.readFileSync(p,'utf8'));
if(place.id!==pid||place.fagverk?.status!=='curated')throw Error('Østensjøvannet canonical Fagverk not found');
for(const f of [front,landscape])if(!fs.existsSync(f)||fs.statSync(f).size<12000)throw Error('WebP photo not built: '+f);
place.frontImage=front;place.image=landscape;
place.frontImageMeta={source:'wikimedia_commons',
 sourcePage:'https://commons.wikimedia.org/wiki/File:%C3%98stensj%C3%B8vannet_Abilds%C3%B8.jpg',
 creator:'Kjetil Ree',credit:'Kjetil Ree / Wikimedia Commons',license:'CC BY-SA 3.0',
 licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/',capturedAt:'2008-06-24',verifiedAt:'2026-10-21',
 outputDimensions:[600,800],sourceImageDimensions:[2304,3072],orientation:'portrait',
 sourceSha256:hash('/tmp/ostensjovannet-front.jpg'),outputSha256:hash(front),
 transformation:'Centered 3:4 real landscape/urban-edge photograph cropped to separate portrait WebP, no elements synthesized.',
 visualReview:'pending_real_app_browser'};
place.imageMeta={source:'wikimedia_commons',
 sourcePage:'https://commons.wikimedia.org/wiki/File:%C3%98stensj%C3%B8vannet_B%C3%B8ler.jpg',
 creator:'Kjetil Ree',credit:'Kjetil Ree / Wikimedia Commons',license:'CC BY-SA 3.0',
 licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/',capturedAt:'2008-05-25',verifiedAt:'2026-10-21',
 outputDimensions:[1400,900],sourceImageDimensions:[3888,2592],orientation:'landscape',
 sourceSha256:hash('/tmp/ostensjovannet-landscape.jpg'),outputSha256:hash(landscape),
 transformation:'Centered 1400×900 WebP from an original documentary photo of Østensjøvannet with Bøler high-rises; no elements synthesized.',
 visualReview:'pending_real_app_browser'};
place.imageComposition={portraitPosition:'50% 50%',heroPosition:'50% 50%',portraitRatio:'3:4'};
place.externalLinks ||= [];
for(const [label,url] of [
 ['Kjetil Ree – Østensjøvannet mot Abildsø, CC BY-SA 3.0',place.frontImageMeta.sourcePage],
 ['Kjetil Ree – Østensjøvannet med Bøler i bakgrunnen, CC BY-SA 3.0',place.imageMeta.sourcePage]
]){
 if(!place.externalLinks.some(entry=>entry.url===url))place.externalLinks.push({label,url,type:'reference',verifiedAt:'2026-10-21'});
}
fs.writeFileSync(p,JSON.stringify(place,null,2)+'\n');
const translations={
en:{
 desc:"After the Second World War, housing estates spread towards Østensjøvannet, bringing pollution and plans that threatened its wetlands and birds. Local residents fought to protect the lake. In 1992 the water and Bogerudmyra became a nature reserve, followed by the larger Østensjø environmental park in 2002.",
 popupDesc:"At Østensjøvannet, the birds are often heard before they are seen. The shallow lake lies between postwar housing estates and older farmland, with reed beds and wetland plants sheltering abundant wildlife. The Bølerbekken stream carries water from Ulsrudvann into the lake, and the Østensjøbekken outlet eventually joins the Alna river. The lake has never been a wilderness untouched by people: generations have worked and played here.\n\nAfter 1945, new neighbourhoods rose on the shores. The lake suffered from pollution, and in the 1950s car races were even held on its ice. During work in the southern marshes between 1960 and 1965, channels were excavated and islands formed that offered nesting and resting sites for waterbirds. People were transforming the landscape at the same time that naturalists were discovering its extraordinary ecological value.\n\nPlans in 1983 to build on fields belonging to Abildsø farm brought neighbours together to defend the area. The association Østensjøvannets Venner was formally established in 1988 after renewed proposals for housing and a cemetery. Volunteers argued that the lake, marshes and surrounding cultural landscape had to be considered together. They were not merely protecting a view, but the habitats on which birds and other animals depend.\n\nOn 2 October 1992, Østensjøvannet and Bogerudmyra were designated a nature reserve. The original reserve comprised 539 decares of water and land. Conservation work did not end there: in 2002 Oslo City Council adopted the larger Østensjø environmental park. Visitors can now watch waterbirds from paths and viewpoints without entering the most vulnerable wetland habitats. Its survival tells a story of knowledge, urban conflict and citizens who insisted that nature also belongs in a growing city."
},
es:{
 desc:"Tras la Segunda Guerra Mundial, nuevos barrios se extendieron hacia Østensjøvannet y la contaminación y los proyectos urbanísticos amenazaron sus humedales y aves. Los vecinos lucharon para proteger el lago. En 1992, el lago y Bogerudmyra fueron declarados reserva natural; en 2002 se aprobó el parque ambiental más amplio de Østensjø.",
 popupDesc:"En Østensjøvannet a menudo se oyen las aves antes de verlas. El lago poco profundo está situado entre barrios construidos después de la guerra y antiguas tierras agrícolas. Sus carrizales y zonas húmedas dan refugio a una fauna variada. El arroyo Bølerbekken trae agua desde Ulsrudvann y la salida por Østensjøbekken conecta finalmente con el río Alna. Nunca fue un territorio ajeno a las personas: las orillas se utilizaron para trabajar y divertirse.\n\nDespués de 1945 crecieron los barrios alrededor del lago, y con ellos la contaminación. En los años cincuenta llegaron a celebrarse carreras de automóviles sobre el hielo. Entre 1960 y 1965 se excavaron canales en los pantanos meridionales y se formaron islas que ofrecían lugares de descanso y nidificación para aves acuáticas. Mientras los seres humanos modificaban el lugar, aumentaba el conocimiento de su valor ecológico.\n\nEn 1983, los planes para construir viviendas en los campos de la granja Abildsø reunieron a vecinos decididos a defenderlos. La asociación Østensjøvannets Venner se fundó oficialmente en 1988, tras nuevos proyectos de viviendas y un cementerio. Los participantes insistieron en que el lago, las marismas y el paisaje cultural circundante debían protegerse como un conjunto. No se trataba solo de conservar unas vistas, sino de los hábitats que necesitan las aves.\n\nEl 2 de octubre de 1992, Østensjøvannet y Bogerudmyra fueron protegidos como reserva natural. La reserva original tenía 539 decáreas de agua y tierra. La defensa del paisaje continuó, y en 2002 el Ayuntamiento de Oslo aprobó el parque ambiental de Østensjø, más amplio que la reserva. Hoy es posible observar aves desde senderos y puntos de observación sin entrar en las zonas más frágiles. El lugar muestra cómo el conocimiento y la acción vecinal pueden influir en el crecimiento de una ciudad."
},
pt:{
 desc:"Depois da Segunda Guerra Mundial, os bairros cresceram junto de Østensjøvannet, e a poluição e novos projetos de construção ameaçaram as zonas húmidas e as aves. Os moradores lutaram para proteger o lago. Em 1992, a água e Bogerudmyra passaram a integrar uma reserva natural; em 2002 foi criado o parque ambiental mais amplo de Østensjø.",
 popupDesc:"Em Østensjøvannet é frequente ouvir as aves antes de as ver. O lago pouco profundo fica entre bairros construídos no pós-guerra e antigas áreas agrícolas, com caniçais e vegetação de zonas húmidas que abrigam muitos animais. O ribeiro Bølerbekken leva água desde Ulsrudvann até ao lago; a água sai por Østensjøbekken e segue para o rio Alna. Este não é um lugar que os habitantes nunca tenham usado: as margens fizeram parte da vida de trabalho e lazer.\n\nDepois de 1945 surgiram bairros residenciais junto ao lago e aumentaram os problemas de poluição. Nos anos cinquenta houve até corridas de automóveis sobre o gelo. Entre 1960 e 1965 foram escavados canais nos pântanos a sul, formando ilhas usadas pelas aves aquáticas para descansar e nidificar. Ao mesmo tempo que as pessoas transformavam a paisagem, crescia o reconhecimento do seu valor ecológico.\n\nEm 1983, os planos de construção de habitações nos campos da quinta Abildsø levaram os moradores a mobilizar-se. A associação Østensjøvannets Venner foi formalmente criada em 1988, após novas propostas de habitação e de um cemitério. Os defensores da natureza argumentaram que o lago, os pântanos e os campos envolventes deviam ser considerados em conjunto. A disputa não dizia respeito apenas à paisagem, mas aos habitats de que as aves e outros animais dependem.\n\nEm 2 de outubro de 1992, Østensjøvannet e Bogerudmyra foram classificados como reserva natural. A reserva original abrangia 539 decares de água e terra. A proteção continuou, e em 2002 a Câmara de Oslo aprovou o parque ambiental mais amplo de Østensjø. Hoje, os visitantes podem observar aves a partir de trilhos e miradouros sem entrar nas zonas mais sensíveis. A história do lago mostra como o conhecimento e a participação dos cidadãos influenciam o crescimento da cidade."
}};
const sourceHash=placeSourceHash(place);
for(const [lang,entry] of Object.entries(translations)){
 const file='data/i18n/content/places/'+lang+'.json';
 const map=JSON.parse(fs.readFileSync(file,'utf8'));
 if(!map[pid])throw Error('Missing place translation: '+lang);
 map[pid]={_sourceHash:sourceHash,_status:'machine_translated',name:'Østensjøvannet',desc:entry.desc,popupDesc:entry.popupDesc};
 fs.writeFileSync(file,JSON.stringify(map,null,2)+'\n');
}
fs.writeFileSync('reports/place-production/ostensjovannet-v1-images-20261021.json',JSON.stringify({
 schema:'history-go-ostensjovannet-v1-documentary-qa',status:'local_webp_built_browser_qa_pending',
 assets:[
 {kind:'frontImage',file:front,author:'Kjetil Ree',license:'CC BY-SA 3.0',source:place.frontImageMeta.sourcePage,sha256:hash(front),size:[600,800],appReview:false},
 {kind:'image',file:landscape,author:'Kjetil Ree',license:'CC BY-SA 3.0',source:place.imageMeta.sourcePage,sha256:hash(landscape),size:[1400,900],appReview:false}
 ],note:'Two separately sourced documentary photographs, correctly attributed, local WebP. Actual app browser acceptance pending.'
},null,2)+'\n');
console.log('Østensjøvannet photo materialization, translations and source hash written.',sourceHash);
