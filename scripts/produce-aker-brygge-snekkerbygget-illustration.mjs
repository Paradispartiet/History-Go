#!/usr/bin/env node
/**
 * Snekkerbygget, Bryggegata 9 — authored architectural illustration candidate.
 * Original procedural SVG, NOT a photograph, trace, or official facade survey.
 * Only creates an archival candidate; no live PlaceCard or Structures change.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const sourcePath="bilder/kort/structures/source/aker_brygge/snekkerbygget_architectural_illustration.svg";
const candidatePath="bilder/kort/structures/candidates/aker_brygge/snekkerbygget_architectural_illustration.webp";
const reportPath="reports/place-production/aker-brygge-snekkerbygget-illustration-candidate-2026-11-19.json";
const hash=(data)=>crypto.createHash("sha256").update(data).digest("hex");
const audit=JSON.parse(await fs.readFile("reports/place-production/aker-brygge-structures-source-audit-2026-11-19.json","utf8"));
if(!audit.candidates?.some(x=>x.id==="aker_brygge_snekkerbygget") || audit.publishable!==false) throw new Error("Snekkerbygget audit changed; refuse export");

const parts=[];
const add=(s)=>parts.push(s);
const rand=(n)=>{const x=Math.sin((n+82.7)*78.233)*43758.5453123;return x-Math.floor(x)};
const rect=(x,y,w,h,fill,more="")=>add('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" '+more+'/>');
const pathSvg=(d,fill,more="")=>add('<path d="'+d+'" fill="'+fill+'" '+more+'/>');

add('<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900" role="img" aria-label="Illustrasjon av Snekkerbygget ved Aker Brygge, Oslo">');
add('<defs>'+
 '<linearGradient id="sky" x1="0" x2="0.85" y1="0" y2="1"><stop stop-color="#91c5ec"/><stop offset=".65" stop-color="#eaf3f1"/><stop offset="1" stop-color="#f8eee0"/></linearGradient>'+
 '<linearGradient id="stucco" x1="0" y1="0" x2="1" y2=".55"><stop stop-color="#b65d4c"/><stop offset=".5" stop-color="#d98063"/><stop offset="1" stop-color="#f1a47f"/></linearGradient>'+
 '<linearGradient id="gable" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dc8d70"/><stop offset="1" stop-color="#bd694d"/></linearGradient>'+
 '<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bfd9df"/><stop offset=".4" stop-color="#e2e7df"/><stop offset="1" stop-color="#678ba0"/></linearGradient>'+
 '<pattern id="paving" width="130" height="65" patternUnits="userSpaceOnUse"><path d="M0 0H130M0 32H130M65 0V32M0 32V65M130 32V65" stroke="#b1ac9d" stroke-width="2" opacity=".50" fill="none"/></pattern>'+
 '<pattern id="plaster" width="37" height="26" patternUnits="userSpaceOnUse"><path d="M0 24H37M10 0V4M22 11V14" stroke="#8a443d" opacity=".08" fill="none"/></pattern>'+
 '<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="2" seed="8" result="noise"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".08"/></feComponentTransfer></filter>'+
 '</defs>');
rect(0,0,1400,900,"url(#sky)");
for(let i=0;i<12;i++){const x=70+i*126,y=50+rand(i)*155;add('<ellipse cx="'+x+'" cy="'+y+'" rx="'+(65+rand(i+5)*55)+'" ry="'+(12+rand(i+3)*24)+'" fill="#ffffff" opacity=".18"/>');}
// Contemporary glazed additions sit behind the old industrial fabric.
for(const [x,y,w,h] of [[80,205,215,425],[255,163,222,385],[1035,120,310,435]]) {
 rect(x,y,w,h,"#7d8e9a", 'opacity=".35"');
 rect(x+8,y+7,w-16,h-17,"url(#glass)");
 for(let j=1;j<Math.floor(w/44);j++)rect(x+j*44,y+6,2,h-20,"#536979",'opacity=".65"');
 for(let j=1;j<Math.floor(h/53);j++)rect(x+8,y+j*53,w-16,2,"#728a99",'opacity=".55"');
}
// Urban pavement in perspective, under building.
pathSvg("M0 648L1400 665V900H0Z","#d5d0c5");
pathSvg("M0 648L1400 665V900H0Z","url(#paving)");
for(let i=0;i<17;i++){const y=676+i*i*.86;add('<path d="M0 '+y+' L1400 '+(y+1.5*i)+'" stroke="#a79f92" stroke-width="'+(.7+.12*i)+'" opacity=".30"/>');}
// Long street-facing workshop volume.
pathSvg("M80 297L850 222L850 718L80 743Z","url(#stucco)",'stroke="#935548" stroke-width="3"');
pathSvg("M80 297L850 222L850 718L80 743Z","url(#plaster)");
pathSvg("M80 296L850 222L850 238L80 311Z","#844a40");
pathSvg("M80 307L850 237L850 247L80 321Z","#e9ac8c");
pathSvg("M80 720L850 700L850 725L80 752Z","#c4a58a");
pathSvg("M80 724L850 710L850 738L80 770Z","#7d7470",'opacity=".25"');
// Centerpiece gabled front, connected but separate from adjoining modern buildings.
pathSvg("M850 228L1135 150L1355 311L1355 748L850 718Z","url(#gable)",'stroke="#954d3e" stroke-width="4"');
pathSvg("M850 228L1135 150L1355 311L1349 326L1133 169L850 244Z","#7f493f");
pathSvg("M866 240L1133 165L1347 320","#f4b394",'stroke="#dca180" stroke-width="4"');
pathSvg("M850 228L1135 150L1355 311L1355 748L850 718Z","url(#plaster)");
pathSvg("M850 712L1355 740L1355 771L850 740Z","#a58c7a");
pathSvg("M850 718L1355 747L1355 765L850 736Z","#807d77",'opacity=".3"');
// Pilasters of gable and downpipes.
for(const x of [855,1012,1170,1342])rect(x,324,5,398,"#924b40",'opacity=".47"');
rect(853,230,10,488,"#6c5951",'opacity=".65"');
rect(862,235,3,465,"#ead2bf",'opacity=".55"');
// Original-design window: white timber mullions and light reflecting glass.
function windowAt(x,y,w,h,mode="sash"){
 rect(x+4,y+5,w,h,"#824c43",'rx="4" opacity=".45"');
 rect(x,y,w,h,"#e4d9c5",'stroke="#f8edda" stroke-width="4" rx="2"');
 rect(x+7,y+7,w-14,h-14,"url(#glass)");
 rect(x+w/2-1.6,y+5,3.2,h-10,"#f6f1e8");
 rect(x+6,y+h*.50,w-12,3.4,"#f6f1e8");
 if(mode==="sash"){rect(x+w*.25,y+5,2.3,h-10,"#f9efe2");rect(x+w*.75,y+5,2.3,h-10,"#f9efe2");}
 rect(x+5,y+4,w-10,2.4,"#fff6e5");
 rect(x-6,y+h+2,w+12,7,"#cda28a");
}
// Side facade: 3 levels with windows scaling slightly toward distant vanishing point.
for(let col=0;col<11;col++){
 const x=126+col*67,w=25+col*.85,drift=4.0*col;
 for(let row=0;row<3;row++) windowAt(x,356+row*111-drift,w,65+row*1.7);
}
// End elevation windows in stable perspective for recognizability.
for(const row of [0,1,2]){
 const y=362+row*113;
 for(const x of [938,1072,1206])windowAt(x,y,73,74);
}
windowAt(1093,210,75,74);
// Roof and architectural shadow details.
add('<path d="M77 300L848 223" stroke="#f5c1a5" stroke-width="8" opacity=".55"/>');
add('<path d="M847 228L1137 150L1358 311" stroke="#6d4a3f" stroke-width="7" fill="none" stroke-linecap="round"/>');
rect(100,745,1225,14,"#8d7467",'opacity=".35"');
// Realistic planters at foreground edge, not hiding the facade.
for(const [i,x,y,scale] of [[1,90,771,1.15],[2,340,794,.86],[3,1300,788,.8]]) {
 add('<g transform="translate('+x+' '+y+') scale('+scale+')">');
 pathSvg("M-65 -7L62 -7L48 35L-50 35Z","#b59b7f",'stroke="#7f745e" stroke-width="3"');
 for(let k=0;k<16;k++){const px=-55+k*7;add('<path d="M'+px+' -5Q'+(px-17)+' -30 '+(px+(k%3)*9-14)+' -54" stroke="#536e44" fill="none" stroke-width="2"/>');}
 for(let k=0;k<13;k++){const px=-52+k*9,yy=-34-rand(i*24+k)*23;add('<ellipse cx="'+px+'" cy="'+yy+'" rx="12" ry="8" fill="'+(["#708b52","#90a965","#466f4a","#b1bd78"][k%4])+'" opacity=".9"/>');}
 add('</g>');
}
// Image texture and vignette retain architectural linework.
rect(0,0,1400,900,"#ffffff",'filter="url(#grain)" opacity=".38"');
add('</svg>');
const svg=Buffer.from(parts.join("\n"),"utf8");
const webp=await sharp(svg).resize(1200,800,{fit:"contain",background:"#f4f1e9"}).webp({quality:94,effort:6}).toBuffer();
const meta=await sharp(webp).metadata();
if(meta.width!==1200||meta.height!==800||meta.format!=="webp")throw new Error("Invalid image export");
for(const p of [sourcePath,candidatePath,reportPath])await fs.mkdir(path.dirname(p),{recursive:true});
await fs.writeFile(sourcePath,svg);
await fs.writeFile(candidatePath,webp);
const report={
 schema:"history_go_aker_brygge_architectural_illustration_candidate_v1",
 placeId:"aker_brygge",structureId:"aker_brygge_snekkerbygget",title:"Snekkerbygget, Bryggegata 9 – arkitektonisk illustrasjon",
 assetKind:"original_architectural_illustration_not_a_photograph",
 provenance:"Procedural vector artwork authored specifically for History Go; original SVG archived",
 visualReferences:[
  {url:"https://www.norwegianproperty.no/en/properties/central-business-district/bryggegata-7-9",role:"Corporate owner facade photo supports terracotta walls and white sash windows; not downloaded or reproduced as pixels"},
  {url:"https://darkarkitekter.no/prosjekt/snekkerbygget",role:"Architect source identifies historic Snekkerbygget as separate from connected Administrasjonsbygget"},
  {url:"https://akershuseiendom.no/lokaler/snekkerbygget",role:"Commercial property listing confirms Bryggegata 9 identity and historical carpentry workshop use"}
 ],
 likenessLimit:"Designed from general documented form, color and materials; NOT verified as an exact facade elevation, window count, camera angle, or building outline. Do not caption as actual photograph.",
 sourcePath,sourceSha256:hash(svg),sourceBytes:svg.length,sourceDimensions:[1400,900],
 candidatePath,candidateSha256:hash(webp),candidateBytes:webp.length,candidateDimensions:[1200,800],
 transformation:"Original SVG to high-resolution 1200×800 WebP with full composition, no crop or zoom",
 credit:"History Go – original digital illustration",license:"Project-owned original illustration; not sourced photograph",
 visualApproval:false,publishable:false,placecardStructuresEnabled:false,reviewStatus:"SOURCE_BOUNDED_ARCHITECTURAL_ILLUSTRATION_CANDIDATE_HOLD",
 exactBuildingPhotographicMatch:false,vFerdig:false,
 notes:["Always visibly label ILLUSTRASJON in UI when/if approved.","Municipal Havnepromenade planning document places Snekkerverkstedet broadly in the early 1900s; do not use the 1854 shipyard relocation as building construction year.","No quiz, PlaceCard, current brand assets or other places modified."]
};
await fs.writeFile(reportPath,JSON.stringify(report,null,2)+"\n");
console.log("Archived original Snekkerbygget illustration candidate",JSON.stringify({svgSha256:report.sourceSha256,webpSha256:report.candidateSha256,sourceBytes:report.sourceBytes,webpBytes:report.candidateBytes}));
