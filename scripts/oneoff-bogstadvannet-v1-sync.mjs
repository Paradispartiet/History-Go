#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {placeSourceHash} from './check-place-i18n-freshness.mjs';
const pid='bogstadvannet',source='data/places/natur/oslo/places_natur/bogstadvannet.json';
const front='bilder/places/bogstadvannet_front_portrait.webp',hero='bilder/places/bogstadvannet_landscape.webp';
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const place=JSON.parse(fs.readFileSync(source,'utf8'));
for(const file of [front,hero])if(!fs.existsSync(file)||fs.statSync(file).size<12000)throw Error('Missing WebP '+file);
place.frontImage=front;place.image=hero;
place.frontImageMeta={
 source:'wikimedia_commons',sourcePage:'https://commons.wikimedia.org/wiki/File:Bogstadvannet-20060527.jpg',
 creator:'Steinar Midtskogen',credit:'Steinar Midtskogen / Wikimedia Commons',license:'Public domain',
 licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/',capturedAt:'2006-05-27',verifiedAt:'2026-10-21',
 sourceImageDimensions:[3904,2602],outputDimensions:[600,800],orientation:'portrait',
 sourceSha256:sha('/tmp/bogstadvannet-front.jpg'),outputSha256:sha(front),
 transformation:'600x800 center crop of genuine 2006 lakescape; no synthesis',
 visualReview:'pending_real_app_browser'};
place.imageMeta={
 source:'wikimedia_commons',sourcePage:'https://commons.wikimedia.org/wiki/File:Tur_til_Oslo_og_Bogstad_sommeren_2022_-_Bogstadvannet_-_2.jpg',
 creator:'Øyvind Holmstad',credit:'Øyvind Holmstad / Wikimedia Commons',license:'CC BY-SA 4.0',
 licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',capturedAt:'2022-07-01',verifiedAt:'2026-10-21',
 sourceImageDimensions:[6000,4000],outputDimensions:[1400,900],orientation:'landscape',
 sourceSha256:sha('/tmp/bogstadvannet-landscape.jpg'),outputSha256:sha(hero),
 transformation:'1400x900 center crop of genuine 2022 evening lakescape; no synthesis',
 visualReview:'pending_real_app_browser'};
place.imageComposition={portraitPosition:'50% 54%',heroPosition:'50% 50%',portraitRatio:'3:4'};
place.externalLinks=(place.externalLinks||[]).filter(x=>!String(x.url).includes('Bogstadvannet_IMG_1611')&&!String(x.url).includes('2021-03-25'));
for(const [label,url] of [
 ['Steinar Midtskogen – Bogstadvannet 2006 (public domain)',place.frontImageMeta.sourcePage],
 ['Øyvind Holmstad – Bogstadvannet 2022 (CC BY-SA 4.0)',place.imageMeta.sourcePage]
])if(!place.externalLinks.some(x=>x.url===url))place.externalLinks.push({label,url,type:'reference',verifiedAt:'2026-10-21'});
fs.writeFileSync(source,JSON.stringify(place,null,2)+'\n');
const shared={
en:[
 'Bogstadvannet was once a working waterway for floating timber and powering sawmills, not only a place to swim. Its level was regulated at the outlet; later rowing, golf and other recreation became part of the lakeshore landscape between Oslo and Bærum.',
 'Logs that travelled down Sørkedalselva still had to cross Bogstadvannet before they could reach the sawmills. In calm water the timber had to be rowed on. The lake connected the forests and estates of Sørkedalen with mills further down Lysakerelva. The water was part of a busy working landscape long before it became a leisure destination.\n\nThe lake was previously called Fåd- or Fåvannet, after an older name for Lysakerelva. Sørkedalselva enters from the north, with Åborbekken and Jegersborgbekken as additional tributaries. To the south, the outlet continues as Lysakerelva. Bogstad manor on the eastern shore eventually gave the lake its modern name, but the lake has its own story.\n\nPeople changed the level of the water. Around 1869, Osdammen was used to support sawmill activity at the outlet. Øvre Fossum sag, also known as Ossaga, operated here from around 1870 to 1913. A new stone dam was built in 1913. Water levels, timber and industry were tied to the same landscape.\n\nLater, recreation grew. Voksen farm cut natural ice until the 1930s. Bogstad golf course opened in 1924 and the campsite opened in 1959. Christiania Roklub uses the lake for rowing, and beaches and open recreational areas occupy parts of its shores. The water still flows from Sørkedalen into Lysakerelva. Forest, history and public recreation meet around this one lake.'
],
es:[
 'Bogstadvannet fue una ruta de trabajo para la madera y la energía de los aserraderos, además de un lugar de baño. En el desagüe se regulaba el nivel del agua; después llegaron el remo, el golf y otras actividades recreativas entre Oslo y Bærum.',
 'Los troncos que bajaban por Sørkedalselva todavía debían atravesar Bogstadvannet para llegar a los aserraderos. En las zonas tranquilas había que mover la madera remando. El lago unía los bosques de Sørkedalen con las industrias de Lysakerelva, mucho antes de ser un destino de ocio.\n\nEl antiguo nombre era Fåd- o Fåvannet, por un nombre anterior de Lysakerelva. Sørkedalselva entra por el norte, con Åborbekken y Jegersborgbekken como afluentes menores. Al sur, el agua continúa hacia Lysakerelva. El lago recibió su nombre actual de la finca Bogstad en la orilla oriental, aunque tiene una historia propia.\n\nAlrededor de 1869, la presa de Osdammen elevó el nivel para aprovechar el agua en un aserradero. Øvre Fossum sag, llamado Ossaga, funcionó cerca de la salida desde aproximadamente 1870 hasta 1913. En 1913 se construyó una nueva presa de piedra. Así, el agua era parte de un sistema de industria y paisaje.\n\nCon el tiempo el ocio transformó sus orillas. La granja Voksen cortaba hielo natural hasta los años treinta. El campo de golf de Bogstad abrió en 1924 y el camping en 1959. Christiania Roklub utiliza el lago para remar. El agua todavía conecta Sørkedalen con Lysakerelva, mientras las orillas reúnen bosques, playas y lugares históricos.'
],
pt:[
 'Bogstadvannet foi uma via de trabalho para transportar madeira e fornecer energia às serrarias, não apenas um local para banhos. A água era regulada na saída do lago; mais tarde surgiram o remo, o golfe e outras formas de lazer entre Oslo e Bærum.',
 'Os troncos que desciam pelo rio Sørkedalselva ainda precisavam de atravessar Bogstadvannet antes de chegarem às serrarias. Nas zonas calmas era preciso remar a madeira. O lago ligava as florestas de Sørkedalen às serrarias ao longo de Lysakerelva muito antes de se tornar um local de lazer.\n\nO antigo nome era Fåd- ou Fåvannet, vindo de um nome anterior de Lysakerelva. Sørkedalselva entra pelo norte, com Åborbekken e Jegersborgbekken como outros afluentes. A sul, a água segue por Lysakerelva. O nome moderno veio da quinta Bogstad, na margem oriental, mas o próprio lago tem uma história distinta.\n\nPor volta de 1869, a barragem de Osdammen elevou o nível da água para apoiar a serraria na saída. Øvre Fossum sag, também chamada Ossaga, funcionou aproximadamente entre 1870 e 1913. Em 1913 foi construída uma nova barragem de pedra. Água, madeira e indústria estavam ligadas.\n\nMais tarde, o lazer ganhou importância. A quinta Voksen extraía gelo natural até à década de 1930. O campo de golfe de Bogstad abriu em 1924 e o parque de campismo em 1959. Christiania Roklub utiliza o lago para remo. A água continua a ligar Sørkedalen a Lysakerelva, enquanto nas margens coexistem floresta, património e espaços de recreação.'
]};
const sourceHash=placeSourceHash(place);
for(const [lang,[desc,popupDesc]] of Object.entries(shared)){
 const file='data/i18n/content/places/'+lang+'.json';
 const map=JSON.parse(fs.readFileSync(file,'utf8'));
 map[pid]={_sourceHash:sourceHash,_status:'machine_translated',name:place.name,desc,popupDesc};
 fs.writeFileSync(file,JSON.stringify(map,null,2)+'\n');
}
fs.writeFileSync('reports/place-production/bogstadvannet-v1-images-20261021.json',JSON.stringify({
 schema:'history-go-bogstadvannet-v1-documentary-qa',
 status:'local_webp_built_browser_qa_pending',
 assets:[
 {kind:'frontImage',file:front,author:'Steinar Midtskogen',license:'Public domain',source:place.frontImageMeta.sourcePage,sha256:sha(front),size:[600,800],appReview:false},
 {kind:'image',file:hero,author:'Øyvind Holmstad',license:'CC BY-SA 4.0',source:place.imageMeta.sourcePage,sha256:sha(hero),size:[1400,900],appReview:false}
 ],note:'Two independently sourced genuine lake photos; actual application browser acceptance pending.'
},null,2)+'\n');
fs.appendFileSync('reports/place-production/bogstadvannet-v1-read-first-20261021.md',
 '\n## Bildevalg oppdatert ved materialisering\nEt vinterfoto med person og et vinterpanorama ble forkastet som svake hovedmotiver. Lokal WebP skal komme fra Steinar Midtskogen 2006 (public domain; https://commons.wikimedia.org/wiki/File:Bogstadvannet-20060527.jpg) og Øyvind Holmstad 2022 (CC BY-SA 4.0; https://commons.wikimedia.org/wiki/File:Tur_til_Oslo_og_Bogstad_sommeren_2022_-_Bogstadvannet_-_2.jpg). Bildene er fortsatt underlagt reell PlaceCard/quiz-/Fagverk-QA.\n');
console.log('Materialized Bogstadvannet source photos, translations, source hash:',sourceHash);

