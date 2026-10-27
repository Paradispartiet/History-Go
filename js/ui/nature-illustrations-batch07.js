/* History Go – Nature Atlas illustration batch 07.
 * Original educational SVG silhouettes with species-specific visual features;
 * not photographs and not sufficient for reliable species identification.
 */
(function(){
"use strict";
const prior=window.HG_NATURE_ILLUSTRATIONS;
if(!prior||typeof prior.resolve!=="function")return;
const SPEC={
 emne_flora_haredylle:["plant","hawk","#edc64b","#709b58"],
 emne_flora_hvitmaure:["plant","bedstraw","#f5f3e8","#709868"],
 emne_flora_knoppurt:["plant","knapweed","#ad6094","#617b50"],
 emne_flora_krypveronika:["plant","speedwell","#5c8fca","#698e60"],
 emne_flora_meldestokk:["plant","goosefoot","#8f9d75","#69835b"],
 emne_flora_penstorkenebb:["plant","geranium","#cb82ac","#659461"],
 emne_flora_prikktvetann:["plant","deadnettle","#b477ae","#618c64"],
 emne_flora_rodjonsokblom:["plant","campion","#d35d83","#6e9b63"],
 emne_flora_russblaastjerne:["plant","squill","#5c84c9","#63925d"],
 emne_flora_smalkjempe:["plant","plantain","#93816b","#5e915c"],
 emne_flora_smaengkall:["plant","rattle","#e2c05c","#789758"],
 emne_flora_strandvindel:["plant","bindweed","#f6f3e8","#65996b"],
 emne_flora_stemorsblomst_forvillet:["plant","pansy","#8063a9","#78985e"],
 emne_flora_taklok:["plant","houseleek","#90a877","#648963"],
 emne_flora_timian:["plant","thyme","#af80bb","#668b60"],
 emne_fauna_sildemaake:["bird","gull","#475967","#d5be4b"],
 emne_fauna_maaltrost:["bird","thrush","#97765b","#e7d7c1"],
 emne_fauna_kaie:["bird","jackdaw","#363d45","#a4aab0"],
 emne_fauna_hvitkinngaas:["bird","barnacle","#3b464b","#eceadf"],
 emne_fauna_kvinand:["bird","goldeneye","#242d32","#eceee5"],
 emne_fauna_sjoorre:["bird","scoter","#2c3135","#e6e7db"],
 emne_fauna_trepigget_stingsild:["fish","stickleback","#88a096","#d06b57"],
 emne_fauna_sandflyndre:["fish","dab","#a98c6d","#d7bd94"],
 emne_fauna_skrubbe:["fish","flounder","#93886a","#bfaa81"],
 emne_fauna_lys_jordhumle:["insect","bumble-pale","#d3b44e","#e6e5d9"],
 emne_fauna_markhumle:["insect","bumble-orange","#e0b749","#d57643"],
 emne_fauna_metallbie:["insect","metalbee","#538b88","#abd5c6"],
 emne_fauna_jordveps:["insect","wasp","#efc24c","#34393b"],
 emne_fauna_stikkmygg:["insect","mosquito","#8a8d84","#4b5859"],
 emne_fauna_maur:["insect","ant","#75463c","#ad6c4c"]
};
const P=(d,c,a="")=>'<path d="'+d+'" fill="'+c+'" '+a+'/>';
const E=(x,y,rx,ry,c,rotation=0,a="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+rotation+' '+x+' '+y+')" fill="'+c+'" '+a+'/>';
const C=(x,y,r,c)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
const L=(x,y,xx,yy,c="#62885c",w=4)=>P("M"+x+" "+y+"L"+xx+" "+yy,"none",'stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"');
function bloom(x,y,n,size,c,mid="#d8a746",elongate=1){
 let a="";
 for(let i=0;i<n;i++){
  const t=i*2*Math.PI/n;const xx=x+Math.sin(t)*size*.75, yy=y-Math.cos(t)*size*.75;
  a+=E(xx,yy,size*.39,size*.68*elongate,c,t*180/Math.PI);
 }
 return a+C(x,y,size*.26,mid);
}
function plant(form,c,green){
 let a="";
 if(form==="houseleek"){
  for(let j=0;j<3;j++){
   const x=168+j*133,y=303+j%2*17;
   for(let i=0;i<14;i++){const t=i*2*Math.PI/14;const rx=x+Math.sin(t)*59,ry=y-Math.cos(t)*48;
    a+=P("M"+x+" "+y+"Q"+(x+Math.sin(t-.19)*38)+" "+(y-Math.cos(t-.19)*32)+" "+rx+" "+ry+"Q"+(x+Math.sin(t+.19)*42)+" "+(y-Math.cos(t+.19)*35)+" "+x+" "+y+"Z",i%3?"#849f77":"#b2c09a",'stroke="#628963" stroke-width="2"');
   }
   a+=C(x,y,12,"#b6bda2");
  }
  return a;
 }
 if(form==="bindweed"){
  a+=P("M64 373Q220 230 344 295T555 133","none",'stroke="#66875b" stroke-width="8"');
  for(let j=0;j<6;j++){
   const x=114+j*82,y=340-j*31;
   a+=P("M"+x+" "+y+"q-62 -88 -55 4q32 26 55 -4Z","#82a66c");
   a+=P("M"+x+" "+y+"q55 -90 70 -18q-22 37 -70 18Z","#729a65");
   if(j===1||j===3||j===5){
    a+=P("M"+x+" "+(y-10)+"Q"+(x-36)+" "+(y-94)+" "+(x+3)+" "+(y-105)+"Q"+(x+51)+" "+(y-101)+" "+(x+34)+" "+(y-31)+"Z",c,'stroke="#d9d5bd" stroke-width="3"');
    a+=E(x+6,y-52,14,24,"#f2e7a4");
   }
  }
  return a;
 }
 if(form==="thyme"){
  for(let j=0;j<12;j++){
   const x=110+j*34,y=270+j%3*17;
   a+=P("M"+x+" 392Q"+(x-12)+" "+(y+28)+" "+x+" "+y,"none",'stroke="#73845d" stroke-width="3"');
   for(let k=0;k<3;k++)a+=E(x+(k-1)*16,y+k*17,13,5,"#759b67",k*45);
   for(let k=0;k<4;k++)a+=bloom(x+(k%2?10:-8),y-14-Math.floor(k/2)*18,4,9,c,"#ead0bd");
  }return a;
 }
 const stems=form==="plantain"?4:form==="speedwell"?5:3;
 for(let j=0;j<stems;j++){
  const x=170+j*(stems===5?64:109),y=136+(j%3)*36;
  a+=P("M"+x+" "+y+"Q"+(x-13)+" 285 "+(x+11)+" 392","none",'stroke="'+green+'" stroke-width="'+(form==="goosefoot"?7:5)+'" stroke-linecap="round"');
  for(let k=0;k<3;k++){
   const yy=247+k*43,s=k%2===0?-1:1;
   if(form==="plantain"){
    a+=P("M"+x+" 389Q"+(x+s*35)+" 270 "+(x+s*83)+" 280Q"+(x+s*66)+" 376 "+x+" 390Z","#709967",'stroke="#5a8357" stroke-width="2"');
   }else if(form==="goosefoot"){
    a+=P("M"+x+" "+yy+"Q"+(x+s*47)+" "+(yy-45)+" "+(x+s*67)+" "+(yy-12)+"L"+(x+s*39)+" "+(yy+18)+"Z","#87a273");
   }else if(form==="deadnettle"){
    a+=P("M"+x+" "+yy+"Q"+(x+s*48)+" "+(yy-36)+" "+(x+s*64)+" "+yy+"Q"+(x+s*33)+" "+(yy+8)+" "+x+" "+yy+"Z","#729862");
   }else{
    a+=E(x+s*30,yy,31,12,k%2?"#7aa263":"#6d975f",s*35);
   }
  }
  if(form==="hawk"){
   for(let k=0;k<2;k++)a+=bloom(x+(k?21:-19),y+(k?27:0),24,22,c,"#a37d35",.83);
  }else if(form==="bedstraw"){
   for(let k=0;k<6;k++){const xx=x+(k%3-1)*23, yy=y+Math.floor(k/3)*20;a+=bloom(xx,yy,4,9,c,"#d4cf9f");}
  }else if(form==="knapweed"){
   a+=E(x,y+18,25,30,"#728061");
   for(let k=0;k<30;k++){const t=k*2*Math.PI/30;a+=E(x+Math.sin(t)*24,y+Math.cos(t)*19,4,18,c,t*180/Math.PI);}
  }else if(form==="speedwell"){
   a+=bloom(x,y,4,19,c,"#f3eee1");a+=E(x,y+8,6,5,"#efdd91");
  }else if(form==="goosefoot"){
   for(let k=0;k<23;k++){const xx=x+Math.sin(k*2.4)*(8+k%4*6),yy=y+Math.cos(k*2.4)*(7+k%3*13);a+=E(xx,yy,5,8,k%3?"#a9ab79":"#779466");}
  }else if(form==="geranium"){
   a+=bloom(x,y,5,30,c,"#e6e8d8");a+=bloom(x+24,y+48,5,14,c);
  }else if(form==="deadnettle"){
   for(let k=0;k<5;k++){
    const yy=y+k*19;
    a+=P("M"+(x-7)+" "+yy+"Q"+(x-33)+" "+(yy-27)+" "+(x-20)+" "+(yy+15)+"L"+x+" "+(yy+4)+"Z",c);
    a+=P("M"+(x+7)+" "+yy+"Q"+(x+32)+" "+(yy-25)+" "+(x+20)+" "+(yy+15)+"L"+x+" "+(yy+4)+"Z",c);
   }
  }else if(form==="campion"){
   for(let k=0;k<3;k++)a+=bloom(x+(k-1)*21,y+(k%2)*17,5,22,c,"#e6d5be");
  }else if(form==="squill"){
   for(let k=0;k<3;k++){const xx=x+(k-1)*20, yy=y+k*22;a+=bloom(xx,yy,6,21,c,"#faf3d8");}
  }else if(form==="plantain"){
   a+=P("M"+x+" "+(y-33)+"Q"+(x-20)+" "+(y+10)+" "+x+" "+(y+51)+"Q"+(x+18)+" "+(y+17)+" "+x+" "+(y-33)+"Z","#786d55",'stroke="#615b49" stroke-width="3"');
   for(let k=0;k<9;k++)a+=L(x-17,y-18+k*7,x+17,y-21+k*7,"#a79b77",2);
  }else if(form==="rattle"){
   for(let k=0;k<5;k++){
    const yy=y+k*22;a+=E(x-13,yy,14,19,c,-17)+E(x+13,yy+5,12,17,"#caad55",19);
    a+=P("M"+(x-8)+" "+(yy+1)+"Q"+x+" "+(yy-8)+" "+(x+7)+" "+(yy+1),"none",'stroke="#8d7645" stroke-width="2"');
   }
  }else if(form==="pansy"){
   a+=E(x,y-27,22,27,c)+E(x-24,y,23,26,"#70529a",-19)+E(x+24,y,23,26,"#71529e",19);
   a+=E(x-17,y+26,19,25,"#f0df84",-27)+E(x+17,y+26,19,25,"#ede0a7",27)+C(x,y+10,8,"#55406f");
   for(let k=0;k<5;k++)a+=L(x,y+12,x+(k-2)*7,y+30,"#6e547e",1);
  }
 }return a;
}
function bird(form,color,accent){
 const goose=form==="barnacle",duck=["goldeneye","scoter"].includes(form);
 let a=P("M64 380Q310 360 550 380","none",'stroke="'+(goose||duck?"#8ab0b5":"#947f62")+'" stroke-width="9"');
 a+=E(327,262,goose?142:form==="scoter"?146:117,duck||goose?78:70,color,-6,'stroke="#56676d" stroke-width="4"');
 a+=P("M415 225L"+(duck||goose?513:474)+" "+(duck||goose?309:288)+"L401 281Z",form==="gull"?"#404e59":color);
 if(goose){
  a+=P("M235 247Q177 154 205 108L235 106Q271 181 301 240Z","#333b40");
  a+=E(214,115,49,48,"#353b3c")+P("M164 101Q200 54 249 82Q263 111 241 133L172 130Z","#eeece0");
 }else{
  a+=P("M225 230Q197 203 207 176L227 162Q256 180 281 232Z",form==="thrush"?"#96775e":form==="jackdaw"?"#3b4146":form==="gull"?"#e5e8e4":color);
  a+=E(214,159,form==="thrush"?44:47,44,form==="jackdaw"?"#43494b":color);
 }
 const hx=goose?203:205,hy=goose?103:157;
 if(form==="gull"){
  a+=E(342,263,81,43,"#566977",-14);a+=P("M332 243Q390 221 430 272","none",'stroke="#323e47" stroke-width="8"');
 }else if(form==="thrush"){
  a+=E(292,278,76,52,accent,-18);
  for(let k=0;k<18;k++)a+=E(255+(k*37)%109,256+(k*19)%58,4,9,"#624c3d",k*37);
 }else if(form==="jackdaw"){
  a+=P("M200 156Q235 115 275 144L263 192L214 206Z",accent);
  a+=E(340,262,76,45,"#31373f",-10);
 }else if(goose){
  a+=E(355,264,93,48,"#b7bcb5",-10);
  for(let k=0;k<8;k++)a+=E(304+k*13,276-(k%2)*11,9,18,"#7b8280",k*13);
 }else if(form==="goldeneye"){
  a+=E(336,272,86,52,"#f1f2eb",-12);
  a+=E(213,160,47,45,"#24353a")+C(183,173,13,"#f5f4e4");
 }else if(form==="scoter"){
  a+=E(349,264,92,49,"#303439",-13)+P("M307 248Q347 225 383 251L358 263Z","#f2f0e2");
 }
 a+=P("M"+(hx-43)+" "+(hy+5)+"L"+(hx-(goose?104:91))+" "+(hy+18)+"L"+(hx-43)+" "+(hy+20)+"Z",form==="jackdaw"?"#4b4d4e":form==="gull"?"#e4bd42":form==="scoter"?"#d38b51":"#aaa087");
 a+=C(hx-16,hy-9,7,form==="jackdaw"?"#d9e7e8":"#223337")+C(hx-17,hy-10,2,"#ffffff");
 if(!duck&&!goose){a+=L(286,312,281,367,"#987958",6)+L(345,312,355,367,"#987958",6);}
 return a;
}
function fish(form,c,accent){
 if(form==="stickleback"){
  let a=P("M106 239Q243 188 422 225L499 166L485 245L501 316L422 274Q250 307 106 249L64 242Z",c,'stroke="#627974" stroke-width="5"');
  for(let k=0;k<3;k++){const x=275+k*29;a+=P("M"+x+" 207L"+(x+6)+" 154L"+(x+14)+" 209Z","#6b7463",'stroke="#4d6c64" stroke-width="2"');}
  a+=E(297,270,95,29,accent,-5)+L(187,260,405,255,"#d7dfc7",4);
  for(let k=0;k<12;k++)a+=E(240+k*13,239,3,7,"#c6d3bd");
  return a+C(141,239,7,"#243539")+P("M109 257L130 261","none",'stroke="#455b56" stroke-width="3"');
 }
 let a=P("M300 86Q442 121 470 241Q423 363 300 375Q166 335 147 242Q167 124 300 86Z",c,'stroke="#706858" stroke-width="6"');
 for(let k=0;k<36;k++){const xx=193+(k*43)%214,yy=151+(k*37)%180;a+=E(xx,yy,form==="dab"?3:5,form==="dab"?5:7,k%3?accent:"#786f56",k*22);}
 a+=E(261,160,16,16,"#e2d2b9")+C(260,160,9,"#2d3433")+E(303,178,15,15,"#e2d2b9")+C(302,178,9,"#2d3433");
 a+=P("M220 203L168 220L225 233","none",'stroke="#756c58" stroke-width="4"');
 if(form==="dab")a+=P("M220 185Q272 210 324 195","none",'stroke="#dcc59f" stroke-width="4"');
 else for(let k=0;k<8;k++)a+=P("M"+(221+k*20)+" 290l-3 14","none",'stroke="#5c5547" stroke-width="3"');
 return a;
}
function insect(form,c,accent){
 if(form==="mosquito"){
  let a=E(348,260,88,20,c,-19)+E(249,210,31,30,"#666e67",-13)+E(210,196,25,23,"#70766c");
  a+=P("M190 203L111 217","none",'stroke="#474f50" stroke-width="4"');
  a+=E(283,169,98,25,"#dce8e5",-32,'opacity=".7" stroke="#91b4b6" stroke-width="3"')+E(345,161,99,25,"#dce8e5",16,'opacity=".65" stroke="#91b4b6" stroke-width="3"');
  for(let k=0;k<3;k++){a+=L(249+k*31,241,161+k*41,351,"#515a5a",3)+L(253+k*33,228,350+k*42,332,"#515a5a",3);}
  a+=L(194,187,175,156,"#626b66",2)+C(200,194,4,"#262e30");return a;
 }
 if(form==="ant"){
  let a=E(377,225,78,69,c)+E(291,219,42,34,accent)+E(218,217,43,39,c);
  for(let k=0;k<3;k++){const x=286+k*30;a+=L(x,226,x-64,304,"#69433b",5)+L(x,210,x+39,138,"#69433b",5);}
  a+=P("M192 192Q153 138 139 163M213 191Q233 149 255 152","none",'stroke="#714940" stroke-width="4"')+C(206,207,5,"#282f2e");return a;
 }
 const wasp=form==="wasp", metal=form==="metalbee", pale=form==="bumble-pale";
 let a=E(340,241,wasp?110:metal?103:126,wasp?53:metal?53:76,wasp?"#edc448":metal?"#508f86":"#353636",-5,'stroke="#5d5950" stroke-width="5"')+
 E(214,209,wasp?38:48,wasp?36:45,metal?"#6b9f92":"#45413a");
 if(wasp){
  for(let k=0;k<4;k++)a+=P("M"+(274+k*36)+" 192Q"+(259+k*36)+" 233 "+(280+k*36)+" 280","none",'stroke="#343635" stroke-width="13"');
  a+=P("M442 227L504 242L447 256Z","#47483b");
 }else if(metal){
  for(let k=0;k<6;k++)a+=L(293+k*20,207,296+k*20,263,"#bad9c8",3);
  a+=E(358,257,39,22,"#7db6ac");
 }else{
  a+=P("M268 185Q257 246 273 293M341 176Q327 244 346 306","none",'stroke="#e9bd49" stroke-width="29"');
  a+=E(441,243,25,52,pale?"#e7e4de":"#d67346");
  for(let k=0;k<19;k++)a+=L(282+(k*17)%130,180+(k*11)%125,286+(k*17)%130,172+(k*11)%125,"#e8c28b",2);
 }
 a+=E(302,147,93,29,"#deefec",-26,'opacity=".73" stroke="#98c2be" stroke-width="3"');
 a+=E(366,142,90,28,"#e2f0ef",21,'opacity=".74" stroke="#98c2be" stroke-width="3"');
 for(let k=0;k<3;k++){a+=L(274+k*48,270,224+k*62,342,"#574e42",4)+L(284+k*46,270,329+k*51,337,"#574e42",4);}
 return a+C(198,207,6,"#252e2f")+P("M205 176L188 146M222 172L232 139","none",'stroke="#5b5b4b" stroke-width="3"');
}
function resolve(id){
 const spec=SPEC[String(id)];
 if(!spec)return prior.resolve(id);
 const [family,form,color,accent]=spec;
 const drawing=family==="plant"?plant(form,color,accent):family==="bird"?bird(form,color,accent):family==="fish"?fish(form,color,accent):insect(form,color,accent);
 const water=family==="fish"||family==="bird";
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="atlas7" x2="0" y2="1"><stop stop-color="'+(water?"#edf4f1":"#fbf8ed")+'"/><stop offset="1" stop-color="'+(water?"#c4dcdd":"#e2eddc")+'"/></linearGradient></defs><rect width="600" height="420" fill="url(#atlas7)"/><path d="M0 393Q290 370 600 396V420H0Z" fill="'+(water?"#9fbfc4":"#c6d8bc")+'" opacity=".48"/><g stroke-linecap="round" stroke-linejoin="round">'+drawing+'</g></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
window.HG_NATURE_ILLUSTRATIONS=Object.freeze({
 has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id))||prior.has(id),
 resolve,
 count:prior.count+Object.keys(SPEC).length
});
})();