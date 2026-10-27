/* History Go Nature Atlas, batch 06: schematic illustrations (not verified identification images). */
(function(){
"use strict";
const prior=window.HG_NATURE_ILLUSTRATIONS;
if(!prior || typeof prior.resolve!=="function")return;
const SPEC={
 emne_flora_burot:["flora","mugwort","#839875"],
 emne_flora_engknoppurt:["flora","knapweed","#b36ba5"],
 emne_flora_engtjaereblom:["flora","campion","#cf5f9a"],
 emne_flora_gullsoleie:["flora","buttercup","#efd044"],
 emne_flora_gulmaure:["flora","bedstraw","#e7d067"],
 emne_flora_hvitbergknapp:["flora","sedum","#f6f4df"],
 emne_flora_hvittvetann:["flora","deadnettle","#f7f3ed"],
 emne_flora_humleblom:["flora","avens","#efcb62"],
 emne_flora_jordreve:["flora","groundivy","#8b86b7"],
 emne_flora_kattefot:["flora","catsfoot","#e8bac6"],
 emne_flora_krypsoleie:["flora","creepingbuttercup","#eacd38"],
 emne_flora_kusymre_marianokleblom:["flora","primrose","#edce55"],
 emne_flora_ormehode:["flora","viper","#5574bb"],
 emne_flora_prikkperikum:["flora","hypericum","#eec348"],
 emne_flora_reinfann:["flora","tansy","#d8bd41"],
 emne_fauna_sandbie:["insect","miningbee","#a9805b"],
 emne_fauna_roedveps:["insect","redwasp","#c58a4f"],
 emne_fauna_bladlus:["insect","aphid","#78ab6e"],
 emne_fauna_vannymfer:["insect","damselfly","#58959b"],
 emne_fauna_skjeggkre:["insect","bristletail","#8e9492"],
 emne_fauna_graamaake:["bird","herringgull","#aeb9be"],
 emne_fauna_hettemaake:["bird","blackheadedgull","#e7e7e2"],
 emne_fauna_graagas:["bird","greylag","#8e826e"],
 emne_fauna_toppand:["bird","tuftedduck","#313b43"],
 emne_fauna_sothone:["bird","coot","#30393a"],
 emne_fauna_makrellterne:["bird","tern","#dadbd8"],
 emne_fauna_roye:["fish","arcticchar","#83978d"],
 emne_fauna_havmus:["fish","chimaera","#a3a8ab"],
 emne_fauna_glassvar:["fish","megrim","#ac977c"],
 emne_fauna_brisling:["fish","sprat","#90b0bd"]
};
const P=(d,c,e="")=>'<path d="'+d+'" fill="'+c+'" '+e+'/>';
const E=(x,y,rx,ry,c,r=0,e="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+r+' '+x+' '+y+')" fill="'+c+'" '+e+'/>';
const D=(x,y,r,c)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
const L=(x,y,u,v,c="#60845c",w=4)=>P("M"+x+" "+y+"L"+u+" "+v,"none",'stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"');
function blossom(x,y,n,r,c,center="#d8ad39"){
 let a="";for(let i=0;i<n;i++){const t=2*Math.PI*i/n;a+=E(x+Math.sin(t)*r*.7,y-Math.cos(t)*r*.7,r*.37,r*.7,c,t*180/Math.PI);}
 return a+D(x,y,r*.32,center);
}
function flora(type,c){
 let a="";
 const creeper=["sedum","groundivy","creepingbuttercup","catsfoot"].includes(type);
 if(creeper){for(let j=0;j<5;j++)a+=P("M"+(95+j*98)+" 378Q"+(160+j*79)+" "+(310+j%2*18)+" "+(230+j*53)+" 388","none",'stroke="#709565" stroke-width="6"');}
 for(let j=0;j<4;j++){
  const x=150+j*99,y=(creeper?201:112)+j%3*35,s=[1,.89,.72,.68][j];
  a+=P("M"+x+" "+y+"Q"+(x-22)+" "+(290+j*9)+" "+(x+5)+" 392","none",'stroke="#678b5b" stroke-width="'+(type==="viper"?8:5)+'"');
  for(let b=0;b<3;b++){
   const yy=252+b*41,side=b%2?-1:1;
   if(type==="mugwort"){
    a+=P("M"+x+" "+yy+"Q"+(x+side*65)+" "+(yy-37)+" "+(x+side*78)+" "+(yy+11)+"Q"+(x+side*30)+" "+(yy+8)+" "+x+" "+yy+"Z","#6c8d6d");
    for(let v=0;v<3;v++)a+=E(x+side*(35+v*12),yy-16+v*12,10,7,"#c5cfac");
   } else if(type==="sedum"){
    for(let k=0;k<5;k++)a+=E(x+(k-2)*15,yy+8,11,19,k%2?"#879f73":"#9cb185",k*16);
   } else if(type==="catsfoot"){
    a+=E(x+side*29,yy+6,15,10,"#b9c0b2",side*35);
   } else if(type==="primrose"){
    for(let v=-2;v<=2;v++)a+=E(x+v*17,343+Math.abs(v)*3,15,50,"#7fa674",v*14);
   } else if(type==="groundivy"||type==="creepingbuttercup"){
    a+=E(x+side*25,yy+4,25,20,"#7fa26c",side*15);a+=E(x+side*39,yy+8,11,12,"#698f63");
   } else {
    a+=E(x+side*23,yy+3,27,10,"#719964",side*34);
    if(type==="deadnettle")for(let t=0;t<4;t++)a+=P("M"+(x+side*(20+t*11))+" "+(yy-10)+"l"+side*6+" -6 2 9Z","#6c965c");
    if(type==="bedstraw"||type==="tansy")for(let t=0;t<5;t++)a+=E(x+Math.cos(t*1.256)*22,yy+Math.sin(t*1.256)*18,16,4,"#86a776",t*72);
   }
  }
  if(type==="mugwort"){
   for(let z=0;z<22;z++){const xx=x+Math.sin(z*2.4)*(6+z%4*8), yy=y+Math.cos(z*2.4)*(8+z%3*19);a+=E(xx,yy,4,9,"#b7aa7a",z*17);}
  } else if(type==="knapweed"){
   a+=E(x,y,20*s,26*s,"#728454");for(let z=0;z<24;z++){const t=z*Math.PI*2/24;a+=E(x+Math.sin(t)*22*s,y-Math.cos(t)*23*s,5*s,17*s,c,t*180/Math.PI);}
  } else if(type==="campion"){
   for(let z=0;z<5;z++){const t=z*6.28/5;a+=blossom(x+Math.cos(t)*32*s,y+Math.sin(t)*19*s,5,18*s,c);}
   for(let z=0;z<5;z++)a+=L(x,y+41+z*26,x+9,y+45+z*26,"#775e53",2);
  } else if(type==="buttercup"||type==="creepingbuttercup"){
   a+=blossom(x,y,5,29*s,c,"#cba133");if(type==="buttercup")a+=blossom(x+19*s,y+43*s,4,13*s,c);
  } else if(type==="bedstraw"){
   for(let z=0;z<18;z++){const xx=x+(z%6-2.5)*12, yy=y+Math.floor(z/6)*14;a+=blossom(xx,yy,4,5*s,c);}
  } else if(type==="sedum"){
   for(let z=0;z<7;z++){const xx=x+(z%4-1.5)*23,yy=y+Math.floor(z/4)*19;a+=blossom(xx,yy,5,13*s,c);}
  } else if(type==="deadnettle"){
   for(let z=0;z<6;z++){const yy=y+z*17;a+=P("M"+(x-15)+" "+yy+"Q"+(x-30)+" "+(yy-10)+" "+(x-22)+" "+(yy+8)+"Q"+(x-4)+" "+(yy+14)+" "+x+" "+yy+"Z",c);
    a+=P("M"+(x+15)+" "+yy+"Q"+(x+30)+" "+(yy-12)+" "+(x+23)+" "+(yy+8)+"Q"+(x+5)+" "+(yy+14)+" "+x+" "+yy+"Z",c);}
  } else if(type==="avens"){
   a+=blossom(x,y,5,20*s,c);a+=E(x+26,y+49,11,12,"#977b65");for(let z=0;z<8;z++){const t=z*6.28/8;a+=L(x+26,y+49,x+26+Math.cos(t)*17,y+49+Math.sin(t)*17,"#917453",2);}
  } else if(type==="groundivy"){
   for(let z=0;z<4;z++){a+=E(x+(z%2?12:-12),y+z*17,13,17,c,z*23)+E(x+9,y+9+z*17,5,8,"#e5e0ed");}
  } else if(type==="catsfoot"){
   for(let z=0;z<8;z++){const xx=x+(z%4-1.5)*13,yy=y+Math.floor(z/4)*18;a+=E(xx,yy,8*s,12*s,z%3?c:"#f0ebdf");}
  } else if(type==="primrose"){
   for(let z=0;z<6;z++){const t=z*Math.PI/3;const xx=x+Math.cos(t)*21*s,yy=y+Math.sin(t)*16*s;a+=P("M"+xx+" "+yy+"Q"+(xx+8)+" "+(yy-7)+" "+(xx+4)+" "+(yy-23)+"L"+(xx-7)+" "+(yy-24)+"Q"+(xx-15)+" "+(yy-8)+" "+xx+" "+yy+"Z",c);}
   a+=D(x,y,6,"#cf9345");
  } else if(type==="viper"){
   for(let z=0;z<16;z++){const xx=x+(z%2?12:-12)+Math.sin(z*2.4)*8, yy=y+z*12;a+=E(xx,yy,9,14,z%3?"#5574bb":"#bd7dc1",z%2?28:-28);a+=L(xx,yy-7,xx+6,yy+6,"#d7dad1",1);}
  } else if(type==="hypericum"){
   a+=blossom(x,y,5,31*s,c);for(let z=0;z<14;z++){const t=z*Math.PI*2/14;a+=L(x,y,x+Math.sin(t)*19,y+Math.cos(t)*18,"#966e3b",1);a+=D(x+Math.sin(t)*25,y+Math.cos(t)*25,1.5,"#533f2b");}
  } else if(type==="tansy"){
   for(let z=0;z<11;z++){const xx=x+(z%4-1.5)*21,yy=y+Math.floor(z/4)*19;a+=E(xx,yy,12*s,10*s,c);a+=E(xx,yy,7*s,3*s,"#e9d36c");}
  }
 }
 return a;
}
function insects(k,c){
 if(k==="bristletail"){
  let a=P("M173 213Q286 133 437 217Q375 306 181 252Z",c,'stroke="#657371" stroke-width="5"');
  for(let z=0;z<11;z++){const xx=205+z*19;a+=L(xx,167+z%3*3,xx+4,276-z%3*3,"#ced0c6",3);a+=L(xx,247,xx-39,300,"#6b7673",3);a+=L(xx,181,xx-37,140,"#6b7673",3);}
  a+=P("M429 222Q504 180 559 161M432 224Q502 238 558 251M425 231Q496 281 524 335M184 215Q124 157 90 147M177 219Q117 214 82 224","none",'stroke="#899390" stroke-width="4"');return a+D(178,214,5,"#1c282a");
 }
 if(k==="damselfly"){
  let a=P("M287 191Q309 238 313 373","none",'stroke="#438c95" stroke-width="14"');
  for(let z=0;z<8;z++)a+=L(303+z%2*2,241+z*17,311,248+z*17,"#abd4d0",2);
  a+=E(290,199,20,47,c)+E(275,153,31,32,c);
  a+=E(246,140,17,20,"#83bbc2")+E(293,140,17,20,"#83bbc2");
  a+=E(236,248,37,123,"#d4e6e6",-33,'opacity=".68" stroke="#88afb3" stroke-width="3"')+E(350,245,36,121,"#d8e9e6",32,'opacity=".68" stroke="#88afb3" stroke-width="3"');
  for(let z=0;z<3;z++){a+=L(273,200+z*17,217,235+z*23,"#4d7778",3);a+=L(302,202+z*17,357,234+z*23,"#4d7778",3);}return a;
 }
 if(k==="aphid"){
  let a=E(331,226,111,83,c,0,'stroke="#5e8f5b" stroke-width="5"')+E(217,206,55,44,"#8eb783");
  for(let z=0;z<6;z++)a+=E(291+(z%3)*26,207+Math.floor(z/3)*40,8,15,z%2?"#c4d8ae":"#81b581",z*37);
  for(let z=0;z<3;z++){a+=L(266+z*51,276,200+z*65,337,"#688d64",5);a+=L(266+z*51,171,195+z*65,135,"#688d64",5);}
  a+=L(396,175,425,132,"#71966d",6)+L(433,185,458,147,"#71966d",6)+L(189,171,150,147,"#6c8e63",3)+L(227,163,240,129,"#6c8e63",3);
  return a+D(198,203,6,"#273e2c");
 }
 const wasp=k==="redwasp";
 let a=E(345,232,118,67,wasp?"#d7aa47":"#a88769",-5,'stroke="#665341" stroke-width="5"')+
 E(219,212,49,48,wasp?"#ae6b4d":"#956f53");
 if(wasp){
  for(let z=0;z<4;z++)a+=P("M"+(279+z*39)+" 178Q"+(269+z*39)+" 225 "+(284+z*39)+" 290","none",'stroke="#343634" stroke-width="14"');
  a+=P("M451 214L511 233L453 250Z","#433e34");
 }else{
  for(let z=0;z<4;z++)a+=P("M"+(276+z*35)+" 172Q"+(262+z*35)+" 238 "+(277+z*35)+" 296","none",'stroke="#dfbd84" stroke-width="16"');
  for(let z=0;z<16;z++)a+=L(198+(z*19)%71,178+(z*17)%59,207+(z*19)%71,165+(z*17)%59,"#d1a970",2);
 }
 a+=E(314,145,91,29,"#d8e9e2",-28,'opacity=".78" stroke="#9bbebb" stroke-width="2"')+
 E(381,154,87,29,"#e2eeeb",25,'opacity=".78" stroke="#9bbebb" stroke-width="2"');
 for(let z=0;z<3;z++){a+=L(247+z*56,268,227+z*63,338,"#5d4c40",5);a+=L(281+z*52,275,302+z*55,342,"#5d4c40",5);}
 return a+D(200,205,6,"#2b2e2b");
}
function bird(k,c){
 const water=["greylag","tuftedduck","coot"].includes(k);
 let a=water?P("M50 374Q300 347 550 371","none",'stroke="#8ab4b9" stroke-width="9"'):
 P("M90 369Q290 359 540 368","none",'stroke="#877966" stroke-width="11"');
 const torso=k==="greylag"?[324,258,137,82]:[304,251,118,75];
 a+=E(...torso,k==="tuftedduck"?"#31383b":k==="coot"?"#30383b":k==="greylag"?"#928670":"#f2f1e7",-7,'stroke="#647676" stroke-width="4"');
 const tern=k==="tern";
 const tail=tern?515:k==="greylag"?473:463;
 a+=P("M378 231L"+tail+" "+(tern?314:291)+"L399 286Z",tern?"#b6bcb7":k==="tuftedduck"?"#282b2f":c);
 let hx=199,hy=170;
 if(k==="greylag"){a+=P("M229 226Q188 182 205 105L226 102Q257 167 280 230Z","#8b816e");hy=102;hx=215;}
 a+=E(hx,hy,tern?43:54,tern?40:49,k==="greylag"?"#867a66":k==="blackheadedgull"?"#624f49":k==="coot"?"#303538":k==="tuftedduck"?"#292f32":c,0,'stroke="#596a68" stroke-width="3"');
 a+=P("M"+(hx-46)+" "+(hy+2)+"L"+(hx-(tern?129:96))+" "+(hy+10)+"L"+(hx-44)+" "+(hy+16)+"Z",tern?"#cd664f":k==="blackheadedgull"?"#b96757":k==="greylag"?"#cc986a":k==="coot"?"#f1f0e4":"#d3b049");
 a+=D(hx-14,hy-11,6,k==="coot"?"#b43738":"#243138")+D(hx-16,hy-13,2,"#fff");
 if(k==="herringgull"){
  a+=E(321,260,83,47,"#abb9be",-12)+P("M294 225Q337 222 378 253","none",'stroke="#f7f8f4" stroke-width="11"');
  a+=P("M140 176L77 194L144 192Z","#deb745")+D(85,189,4,"#a9473a");
 }else if(k==="blackheadedgull"){
  a+=E(316,254,84,45,"#a8b4bd",-13)+E(207,176,45,43,"#5e4a46");
 }else if(k==="greylag"){
  for(let z=0;z<14;z++)a+=E(277+(z*41)%134,240+(z*17)%55,12,8,z%3?"#c7b49b":"#786f62",z*17);
 }else if(k==="tuftedduck"){
  a+=E(330,259,91,49,"#f4f2e8",-10)+P("M229 137Q262 122 261 166L240 171Z","#252c31")+E(199,166,49,49,"#252c31")+D(182,162,6,"#d7bf4d");
 }else if(k==="coot"){
  a+=P("M155 157Q164 114 193 114L207 157Z","#f3f1e8")+E(299,256,86,50,"#454948");
 }else if(tern){
  a+=P("M157 146Q189 111 239 149L235 170L158 170Z","#292f32");
  a+=P("M299 220L430 201L363 268Z","#a7afb3");
  a+=P("M409 255L526 242L449 271L535 292L405 280Z","#dfe5e3");
 }
 if(!water){a+=L(268,307,262,366,k==="blackheadedgull"?"#bf6354":"#ad8662",5)+L(348,306,355,367,k==="blackheadedgull"?"#bf6354":"#ad8662",5);}
 return a;
}
function fish(k,c){
 if(k==="megrim"){
  let a=P("M302 82Q455 141 465 253Q431 346 303 367Q153 309 155 231Q163 125 302 82Z",c,'stroke="#766b59" stroke-width="6"');
  for(let z=0;z<37;z++)a+=D(190+(z*47)%235,145+(z*29)%161,2+(z%3),z%3?"#8e735d":"#c0af92");
  a+=E(267,141,13,13,"#eee2c1")+D(267,141,7,"#272a2b")+E(303,166,13,13,"#eee2c1")+D(303,166,7,"#272a2b");
  a+=P("M224 186L175 206L220 218","none",'stroke="#665b50" stroke-width="4"');return a;
 }
 if(k==="chimaera"){
  let a=P("M130 245Q209 166 331 189Q450 203 541 142Q510 243 559 317Q456 281 340 274Q208 313 130 245Z",c,'stroke="#697c86" stroke-width="5"');
  a+=P("M260 207Q284 95 314 96L311 207Z","#778f9a");
  a+=P("M267 266Q236 338 138 357L195 260Z","#a7b7bd")+P("M320 264Q420 315 449 373L345 280Z","#a4b2b9");
  a+=E(189,225,22,23,"#dbe4e1")+D(189,225,13,"#344349");
  a+=P("M130 249L69 270L138 263Z","#87969b");return a;
 }
 const char=k==="arcticchar";
 let a=P("M146 232Q266 161 440 216L525 151L509 251L532 326L433 281Q267 325 146 258L78 245Z",c,'stroke="#5c7375" stroke-width="5"');
 a+=P("M266 198L333 126L366 209Z",c,'stroke="#748a83" stroke-width="4"');
 a+=P("M290 273L329 337L351 273Z",char?"#d87955":"#98bec8");
 a+=E(172,230,8,8,"#202f39")+D(170,228,2,"#e2ece9");
 if(char){
  a+=E(299,272,100,34,"#d97d5e",-9);
  for(let z=0;z<32;z++)a+=D(218+(z*47)%186,200+(z*19)%73,2.8,"#e8e0bd");
  a+=L(291,310,315,315,"#eae4d7",6);
 }else{
  a+=P("M185 230Q314 209 456 234","none",'stroke="#e6f0ef" stroke-width="17" opacity=".8"');
  for(let z=0;z<9;z++)a+=P("M"+(220+z*23)+" 215l-8 18 22 -12","none",'stroke="#53748a" stroke-width="2"');
 }
 return a;
}
function resolve(id){
 const spec=SPEC[String(id)];if(!spec)return prior.resolve(id);
 const [family,kind,color]=spec;
 const draw=family==="flora"?flora(kind,color):family==="insect"?insects(kind,color):family==="bird"?bird(kind,color):fish(kind,color);
 const water=family==="fish" || family==="bird";
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="nature6" x2="0" y2="1"><stop stop-color="'+(water?"#e7f2f0":"#fbf9ed")+'"/><stop offset="1" stop-color="'+(water?"#bfdcda":"#e1ebdc")+'"/></linearGradient></defs><rect width="600" height="420" fill="url(#nature6)"/><path d="M0 389Q290 370 600 390V420H0Z" fill="'+(water?"#a2c8c7":"#cbddbd")+'" opacity=".55"/><g stroke-linejoin="round" stroke-linecap="round">'+draw+'</g></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
window.HG_NATURE_ILLUSTRATIONS=Object.freeze({
 has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id))||prior.has(id),
 resolve,
 count:prior.count+Object.keys(SPEC).length
});
})();