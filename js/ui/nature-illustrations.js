/* Original simplified species-specific vector art. Not a diagnostic identification guide. */
(function atlas() {
 "use strict";
 const SPEC={
  emne_ved_gran:["fir","#2e6144"],emne_ved_furu:["pine","#447858"],emne_ved_dunbjoerk:["birch","#7faa73"],emne_ved_rogn:["rowan","#689350"],emne_ved_osp:["aspen","#7db077"],emne_ved_einer:["juniper","#436852"],emne_ved_eik:["oak","#648d4e"],emne_ved_selje:["willow","#88ad77"],emne_ved_lind:["linden","#82a96a"],
  emne_flora_rosslyng:["heather","#bf7ba4"],emne_flora_hvitveis:["anemone","#fcf9ec"],emne_flora_lovetann:["dandelion","#edc545"],emne_flora_geitrams:["fireweed","#d96d9e"],emne_flora_prestekrage:["daisy","#fdfbf3"],emne_flora_rodkløver:["clover","#ca699d"],
  emne_fauna_ekorn:["squirrel","#bc7645"],emne_fauna_rodstrupe:["bird","#b69a7f","#e17735"],emne_fauna_kjottmeis:["bird","#303d3f","#edd044"],emne_fauna_blaameis:["bird","#4a77ac","#e4d252"],emne_fauna_bokfink:["bird","#657a84","#c5836d"],emne_fauna_graaspurv:["bird","#8a654e","#cbb194"],emne_fauna_skjaere:["bird","#22343a","#fbfaf4"],emne_fauna_kraake:["bird","#333d45","#777c7c"],emne_fauna_fiskemaake:["bird","#8a9ca7","#faf9f3"],emne_fauna_storskarv:["bird","#313d43","#44484d"],
  emne_fauna_bille_sjuprikket_marihone:["ladybird","#da4539"],emne_fauna_honningbie:["bee","#e1b850"],emne_fauna_libeller:["dragonfly","#4b8f96"],emne_fauna_orret:["fish","#96996c","#d4c6a0"],emne_fauna_laks:["fish","#8da9ba","#c5c7c1"]
 };
 Object.assign(SPEC,{
  emne_ved_graor:["v2-tree","#73936e","alder"],
  emne_ved_hengebjoerk:["v2-tree","#82a971","birch"],
  emne_ved_hestekastanje:["v2-tree","#5c9359","chestnut"],
  emne_ved_ask:["v2-tree","#88a675","ash"],
  emne_ved_bok:["v2-tree","#6f9654","beech"],
  emne_ved_spisslonn:["v2-tree","#74a35b","maple"],
  emne_ved_hegg:["v2-tree","#74a26c","cherry"],
  emne_flora_blaveis:["v2-flower","#718fc7","hepatica"],
  emne_flora_ballblom:["v2-flower","#ebbc42","globeflower"],
  emne_flora_bekkeblom:["v2-flower","#f2c53b","marsh"],
  emne_flora_engsoleie:["v2-flower","#e9c23a","buttercup"],
  emne_flora_hestehov:["v2-flower","#f5cd43","coltsfoot"],
  emne_flora_markjordbaer:["v2-flower","#fcf8ed","strawberry"],
  emne_flora_skogfiol:["v2-flower","#8266bd","violet"],
  emne_flora_tiriltunge:["v2-flower","#e5b42d","trefoil"],
  emne_fauna_svarttrost:["v2-bird","#292c31","blackbird"],
  emne_fauna_ringdue:["v2-bird","#88939d","pigeon"],
  emne_fauna_flaggspett:["v2-bird","#252e32","woodpecker"],
  emne_fauna_gronnfink:["v2-bird","#859c51","greenfinch"],
  emne_fauna_graatrost:["v2-bird","#888c82","fieldfare"],
  emne_fauna_spettmeis:["v2-bird","#6689a0","nuthatch"],
  emne_fauna_notteskrike:["v2-bird","#bb937c","jay"],
  emne_fauna_pilfink:["v2-bird","#a57953","treeSparrow"],
  emne_fauna_staer:["v2-bird","#2b494e","starling"],
  emne_fauna_jordhumle:["v2-insect","#edc443","earthBumblebee"],
  emne_fauna_steinhumle:["v2-insect","#282e31","redTailedBumblebee"],
  emne_fauna_hagehumle:["v2-insect","#e5bc45","gardenBumblebee"],
  emne_fauna_vanlig_veps:["v2-insect","#e8ba3c","wasp"],
  emne_fauna_bille_gullbasse:["v2-insect","#40866c","roseChafer"],
  emne_fauna_skogsmaur:["v2-insect","#8d543c","woodAnt"]
 });
 const P=(d,fill,extra="")=>`<path d="${d}" fill="${fill}" ${extra}/>`;
 const E=(x,y,rx,ry,fill,rotate=0,extra="")=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${rotate} ${x} ${y})" ${extra}/>`;
 const L=(x,y,x2,y2,color="#49684c",w=4)=>P(`M${x} ${y}L${x2} ${y2}`,"none",`stroke="${color}" stroke-width="${w}" stroke-linecap="round"`);
 function tree(type,color){
  let art=P("M291 374L290 145L310 145L316 374Z",type==="birch"?"#eeeae0":"#806650",`stroke="#655744" stroke-width="4"`);
  if(type==="fir"||type==="pine"||type==="juniper"){
   if(type==="fir")for(let i=0;i<7;i++){let y=84+i*35,w=43+i*18;art+=P(`M300 ${y}L${300+w} ${y+57}Q300 ${y+45} ${300-w} ${y+57}Z`,i%2?color:"#427d58",`stroke="#3b6650" stroke-width="3"`);}
   else if(type==="pine"){for(let i=0;i<14;i++){let angle=i*2.4,x=300+Math.cos(angle)*(i%4)*23,y=163+Math.sin(angle)*(i%5)*13;art+=E(x,y,102,25,color,(i*33)%165,`stroke="#4b6e51" stroke-width="1.5"`);}}
   else for(let i=0;i<38;i++){let a=i*2.4,x=300+Math.cos(a)*(40+(i%5)*13),y=185+Math.sin(a)*(24+(i%5)*17);art+=E(x,y,26,14,i%3?"#3e6951":color,i*17);if(i%6===0)art+=E(x+8,y+12,6,7,"#47648c");}
  }else{
   art+=P("M303 235Q258 176 211 163M304 229Q341 169 396 150M299 209L300 105","none",`stroke="#83664b" stroke-width="12" stroke-linecap="round"`);
   for(let i=0;i<52;i++){let a=i*2.4,x=300+Math.cos(a)*(36+(i%6)*19),y=183+Math.sin(a)*(30+(i%5)*17);art+=E(x,y,27,18,i%4===0?"#b1bb70":color,(i*29)%170,`stroke="#51764c" stroke-width="1"`);}
   if(type==="birch"){art+=P("M289 371L292 170L308 171L319 371Z","#f6f2e6");for(let i=0;i<13;i++)art+=L(291+(i%3)*3,202+i*12,306,203+i*12,"#555449",2.5);}
   if(type==="rowan")for(let j=0;j<23;j++){let x=218+(j%7)*28,y=152+Math.floor(j/7)*41;art+=E(x,y,6,6,"#b64735");}
   if(type==="willow")for(let i=0;i<17;i++){let x=187+i*14,y=205+Math.sin(i*2)*51;art+=E(x,y,7,16,"#ddcea2",28);}
  }
  return art;
 }
 function flower(type,color){
  let art="";
  if(type==="fireweed"||type==="heather"){
   for(let j=0;j<5;j++){let x=190+j*56, top=91+(j%3)*16;art+=P(`M${x} 382Q${x+14} 260 ${x+5} ${top}`,"none",`stroke="#56805a" stroke-width="6"`);for(let i=0;i<10;i++)art+=E(x+(i%2?10:-10),top+i*22,type==="heather"?8:13,type==="heather"?12:17,i%3===0?"#e6abc9":color,(i%2?30:-30));}
   return art;
  }
  const cfg={anemone:[7,20,13],daisy:[18,26,8],dandelion:[24,23,7],clover:[17,15,9]};
  const [n,rad,rx]=cfg[type]||[8,22,12];
  for(let j=0;j<4;j++){
   let x=197+j*70, y=[154,225,130,238][j],scale=[1.0,.81,.72,.68][j];
   art+=P(`M${x} ${y+11}Q${x-23} 300 ${x-5} 390`,"none",`stroke="#5f8b63" stroke-width="7"`);
   art+=E(x-35,309,30,13,"#8fa86a",-37)+E(x+14,336,30,13,"#8fa86a",39);
   for(let i=0;i<n;i++){let a=i*2*Math.PI/n;art+=E(x+Math.sin(a)*rad*scale,y-Math.cos(a)*rad*scale,rx*scale,type==="clover"?20*scale:31*scale,i%5===0&&type==="clover"?"#edb3cc":color,a*180/Math.PI,`stroke="#bca87e" stroke-width="1"`);}
   art+=E(x,y,type==="clover"?9:15,type==="clover"?9:15,type==="anemone"?"#d9c151":type==="clover"?"#b05683":"#e7be36");
   for(let t=0;t<7;t++){let a=t*Math.PI*2/7;art+=E(x+Math.cos(a)*7,y+Math.sin(a)*7,2,2,"#7c6431");}
  }
  return art;
 }
 function bird(wing,chest,type){
  let art=P("M105 367Q295 349 502 368","none",`stroke="#8d7558" stroke-width="11"`);
  const dark=wing;
  art+=P("M355 236Q449 258 469 327L360 289Z",wing,`stroke="#40554b" stroke-width="4"`);
  art+=E(292,230,126,82,chest,-9,`stroke="#3f544a" stroke-width="5"`);
  art+=E(333,247,87,42,wing,-20,`stroke="#39504c" stroke-width="3"`);
  art+=E(185,169,56,52,wing,0,`stroke="#394943" stroke-width="4"`);
  if(type==="emne_fauna_rodstrupe")art+=E(215,241,59,55,"#ed7d3a",-20);
  if(type==="emne_fauna_blaameis")art+=P("M142 143Q173 105 211 144Z","#407ab8");
  if(type==="emne_fauna_kjottmeis")art+=P("M277 166L297 310","none",`stroke="#263733" stroke-width="13"`);
  if(type==="emne_fauna_skjaere")art+=P("M307 211Q332 250 360 222","none",`stroke="#f8f6ed" stroke-width="17"`);
  if(type==="emne_fauna_storskarv")art+=P("M185 187Q132 158 142 75L166 88Q154 150 197 162Z","#303b42");
  art+=P("M135 170L83 187L136 190Z",type==="emne_fauna_fiskemaake"?"#dfad46":"#b7a05f",`stroke="#655c3a" stroke-width="2"`);
  art+=E(164,157,6.2,6.2,"#152424")+E(162,155,2,2,"#fff");
  art+=L(248,295,239,357,"#6c6a57",5)+L(326,295,331,357,"#6c6a57",5);
  art+=L(239,357,218,363,"#6c6a57",4)+L(331,357,351,363,"#6c6a57",4);
  return art;
 }
 function fauna(type,col,chest,id){
  if(type==="bird")return bird(col,chest,id);
  if(type==="squirrel")return P("M340 332C465 370 514 247 447 157C401 100 362 139 398 189C445 246 399 283 352 254C383 179 390 131 438 122C515 103 561 216 521 302C485 402 367 392 340 332Z","#ba7a48",`stroke="#76513c" stroke-width="5"`)+E(281,274,104,70,col,-17,`stroke="#78543d" stroke-width="5"`)+E(220,208,54,55,col,0,`stroke="#78543d" stroke-width="5"`)+P("M174 180L181 128L214 158L232 130L251 185Z",col)+E(194,195,6,6,"#243029")+E(166,220,5,5,"#302c24")+E(252,297,55,31,"#e9d1a5",-13)+L(235,341,219,379,"#70503b",10)+L(320,337,332,379,"#70503b",10);
  if(type==="fish"){
   let art=P("M123 230L59 161L63 300Z",col,`stroke="#4e6561" stroke-width="5"`)+P("M110 230Q199 132 355 179Q436 191 479 231Q425 281 341 290Q189 321 110 230Z",col,`stroke="#4d605b" stroke-width="5"`)+P("M137 254Q301 315 448 250Q318 291 137 254Z",chest)+P("M261 181L320 121L350 190Z",col,`stroke="#4d605b" stroke-width="5"`)+E(442,218,7,7,"#1c2d2a");
   for(let i=0;i<(id.includes("orret")?31:14);i++)art+=E(169+(i*61)%238,203+(i*37)%62,3.4,3.4,id.includes("orret")?"#584a35":"#587487");
   return art;
  }
  if(type==="ladybird"){
   let art=E(300,234,114,100,col,0,`stroke="#352f2b" stroke-width="8"`)+E(300,144,49,35,"#293332")+L(300,146,300,324,"#313431",5);
   [[251,191],[357,197],[227,236],[356,263],[265,291],[320,294],[299,231]].forEach(([x,y])=>art+=E(x,y,12,13,"#263230"));
   for(let i=0;i<3;i++)art+=L(194,182+i*44,139,195+i*49,"#343d35",5)+L(405,182+i*44,465,195+i*49,"#343d35",5);
   return art;
  }
  if(type==="bee")return E(284,229,118,66,col,-7,`stroke="#564738" stroke-width="6"`)+P("M245 172Q231 230 241 283M301 166Q288 230 300 283M353 185Q345 222 354 271","none",`stroke="#4b4138" stroke-width="21"`)+E(213,216,37,35,"#343b36")+E(201,208,5,5,"#fff")+E(280,157,77,26,"#d8e9e9",-24,`opacity=".74" stroke="#8da8a4" stroke-width="3"`)+E(335,160,76,26,"#e3f0ee",22,`opacity=".75" stroke="#8da8a4" stroke-width="3"`)+L(239,282,219,320,"#4a493b",5)+L(304,282,294,320,"#4a493b",5);
  let art=L(300,105,300,346,col,13)+E(300,172,18,34,col)+E(300,258,17,55,col);
  [[205,177,-20],[396,177,20],[205,236,20],[396,236,-20]].forEach(([x,y,r])=>art+=E(x,y,107,29,"#d9eeee",r,`opacity=".8" stroke="#70a6a7" stroke-width="3"`));
  for(let i=0;i<3;i++)art+=L(290,226+i*28,231,238+i*31,col,4)+L(310,226+i*28,368,238+i*31,col,4);
  return art;
 }

/* Batch 02: individual traits for 30 more common Norwegian taxa.
 * Educational illustrations, not diagnostic identification photography. */
function v2Tree(kind,green){
 let a=P("M0 380Q300 359 600 382V420H0Z","#c5d8bc");
 const pale=kind==="birch";
 a+=P("M281 384Q292 297 283 167L309 132Q305 260 321 383Z",pale?"#eeeae0":kind==="beech"?"#999b91":"#846950",'stroke="#665c4e" stroke-width="4"');
 if(kind==="birch")for(let i=0;i<14;i++)a+=L(289+(i%3)*3,178+i*13,307,180+i*13,"#595c57",2.4);
 const b=kind==="ash"?"#79634c":"#80654b";
 for(const [x,y,z,w] of [[296,264,202,203],[302,253,391,183],[298,219,265,146],[304,209,348,131],[290,303,225,249],[310,300,395,257]])a+=P("M"+x+" "+y+"Q"+z+" "+w+" "+z+" "+(w-22),"none",'stroke="'+b+'" stroke-width="8"');
 if(kind==="birch"){
  for(let i=0;i<60;i++){const x=180+(i*47)%250,y=106+(i*43)%158;
   a+=E(x,y,14,8,i%3===0?"#acc38b":green,(i*31)%170);
   if(i%4===0)a+=L(x,y,x+4,y+35,"#867557",1.8);}
 }else if(kind==="ash"){
  for(let i=0;i<29;i++){const x=184+(i*79)%238,y=108+(i*43)%151;
   for(let j=0;j<5;j++)a+=E(x+(j%2?10:-10),y+j*7,10,5,i%3?"#65985c":green,(j%2?40:-40));}
 }else if(kind==="maple"){
  for(let i=0;i<39;i++){const x=176+(i*59)%255,y=106+(i*41)%166;
   a+=P("M"+x+" "+(y-19)+"l7 9 14-6-5 14 10 11-16 0-10 14-5-13-17-1 12-10-4-13 15 5Z",i%4?"#78a663":green);}
 }else{
  for(let i=0;i<60;i++){const x=172+(i*61)%260,y=109+(i*47)%170;
   a+=E(x,y,kind==="beech"?24:20,kind==="beech"?15:13,i%4===0?"#a8b87b":green,(i*19)%180);}
 }
 if(kind==="alder")for(let i=0;i<16;i++){const x=198+(i*83)%207,y=163+(i*31)%119;a+=E(x,y,8,11,"#5f6242",25)+E(x+10,y+10,4,13,"#a99965",36);}
 if(kind==="chestnut")for(let i=0;i<18;i++){const x=195+(i*73)%205,y=127+(i*29)%138;a+=E(x,y,5,13,"#f5e9c9",15)+E(x+5,y-6,3,8,"#ffffff",20);}
 if(kind==="cherry")for(let i=0;i<17;i++){const x=187+(i*79)%218,y=134+(i*43)%135;a+=L(x,y,x+5,y+36,"#829166",2);for(let j=0;j<4;j++)a+=E(x+(j%2?6:-6),y+j*9,5,5,"#f6f6e8");}
 return a;
}
function v2Flower(kind,color){
 let a=P("M0 387Q300 370 600 389V420H0Z","#c9dbc3");
 for(let j=0;j<3;j++){
  const x=190+j*111, y=[181,121,205][j],sc=[1,.8,.68][j];
  a+=P("M"+x+" "+y+"Q"+(x-24)+" 320 "+(x+6)+" 393","none",'stroke="#548451" stroke-width="6"');
  a+=E(x-32,310,31,12,"#75a36b",-30)+E(x+31,339,29,12,"#6e9d65",30);
  if(kind==="globeflower"){
   for(let k=0;k<11;k++){const t=k*Math.PI*2/11;a+=E(x+Math.sin(t)*14*sc,y+Math.cos(t)*14*sc,17*sc,23*sc,k%3?"#ebbe47":"#f6d361",t*180/Math.PI);}
  }else if(kind==="coltsfoot"){
   for(let k=0;k<29;k++){const t=k*Math.PI*2/29;a+=E(x+Math.sin(t)*24*sc,y-Math.cos(t)*24*sc,5*sc,22*sc,"#f4cb37",t*180/Math.PI);}
  }else if(kind==="trefoil"){
   for(let k=0;k<6;k++){const t=k*Math.PI*2/6;a+=E(x+Math.sin(t)*19*sc,y-Math.cos(t)*18*sc,11*sc,16*sc,k%3?"#e5b837":"#eccb62",t*180/Math.PI);}
  }else{
   const n=kind==="buttercup"||kind==="marsh"||kind==="strawberry"||kind==="violet"?5:7;
   for(let k=0;k<n;k++){const t=k*Math.PI*2/n;a+=E(x+Math.sin(t)*20*sc,y-Math.cos(t)*19*sc,13*sc,19*sc,kind==="strawberry"?"#fffdf4":color,t*180/Math.PI,'stroke="#c4ae70" stroke-width="1"');}
  }
  a+=E(x,y,kind==="globeflower"?5:12,kind==="globeflower"?6:12,kind==="hepatica"?"#eef0e6":kind==="violet"?"#f1d16f":"#d0a53a");
  if(kind==="marsh")a+=E(x-42,326,30,22,"#709c59",-20)+E(x+32,322,29,21,"#659451",17);
  if(kind==="violet")a+=P("M"+(x-14)+" "+(y+13)+"Q"+x+" "+(y+45)+" "+(x+9)+" "+(y+17)+"Z","#f0df92");
  if(kind==="strawberry"){a+=E(x+41,282,12,15,"#c84c3b");for(let k=0;k<8;k++)a+=E(x+37+(k%3)*5,276+Math.floor(k/3)*7,1.5,1.5,"#f8d67b");}
 }
 return a;
}
function v2Bird(kind,color){
 const wood=kind==="woodpecker";
 let a=wood?P("M360 38Q345 240 363 420L416 420Q392 219 400 38Z","#8d755d",'stroke="#77634e" stroke-width="4"'):
    P("M60 367Q300 351 540 375","none",'stroke="#937b5b" stroke-width="13"');
 const cx=wood?316:306,cy=wood?227:229;
 a+=P("M"+(cx+45)+" "+(cy+10)+"Q450 236 469 338L"+(cx+48)+" "+(cy+71)+"Z",color,'stroke="#4c5350" stroke-width="4"');
 a+=E(cx,cy,wood?62:119,wood?118:80,color,wood?-23:-10,'stroke="#515850" stroke-width="4"');
 a+=E(cx+29,cy+14,wood?42:81,wood?86:43,kind==="pigeon"?"#b48d98":kind==="fieldfare"?"#c7b1a0":color,wood?-25:-22);
 const hx=wood?272:191,hy=wood?129:169;
 a+=E(hx,hy,wood?43:55,wood?45:52,color,0,'stroke="#45504a" stroke-width="3"');
 a+=P("M"+(hx-47)+" "+(hy+3)+"l-48 16 49 12Z",kind==="blackbird"||kind==="starling"?"#dfac3d":"#a28a62",'stroke="#6d6846" stroke-width="2"');
 a+=E(hx-16,hy-11,6.6,6.6,"#151f20")+E(hx-18,hy-13,2.2,2.2,"#fff");
 if(!wood){a+=L(cx-27,cy+69,cx-39,354,"#6b6551",5)+L(cx+38,cy+64,cx+43,354,"#6b6551",5);}
 else{a+=L(cx+48,cy+55,385,270,"#77705b",6)+L(cx+47,cy-14,394,194,"#77705b",6);}
 if(kind==="blackbird")a+=E(309,247,83,42,"#22272d",-16);
 if(kind==="pigeon")a+=P("M217 170Q237 195 247 202","none",'stroke="#f3eee2" stroke-width="12"')+E(231,181,13,7,"#5b947f",-10);
 if(wood){a+=P("M290 103Q315 83 333 105L316 129Z","#d3423c");a+=E(311,207,23,80,"#eee9dd",-25);a+=E(328,240,21,66,"#262e31",-25);}
 if(kind==="greenfinch"){a+=P("M285 241Q343 253 377 276","none",'stroke="#ead856" stroke-width="17"');a+=E(248,268,30,18,"#d4cb6c",-20);}
 if(kind==="fieldfare"){a+=E(195,161,29,26,"#8799a8");for(let i=0;i<12;i++)a+=E(244+(i*47)%114,255+(i*19)%32,3.5,5,"#67564c");}
 if(kind==="nuthatch"){a+=P("M149 162Q194 146 235 160","none",'stroke="#313b3a" stroke-width="11"');a+=E(281,244,75,40,"#cba987",-17);}
 if(kind==="jay"){a+=P("M302 201L361 238 336 272 276 255Z","#4382a4");for(let i=0;i<6;i++)a+=L(295+i*8,216+i*3,310+i*8,238+i*4,"#272e32",4);a+=P("M173 135l24-26 12 29Z","#313431");}
 if(kind==="treeSparrow"){a+=P("M146 143Q193 105 234 148Z","#79513e");a+=E(216,214,11,15,"#303331");a+=E(289,243,73,42,"#c4aa87",-16);}
 if(kind==="starling")for(let i=0;i<30;i++)a+=E(247+(i*37)%133,193+(i*19)%89,2.8,3.6,i%3?"#f2e7cb":"#b2cbba");
 return a;
}
function v2Insect(kind,color){
 const ant=kind==="woodAnt",beetle=kind==="roseChafer",wasp=kind==="wasp";
 let a=P("M0 383Q300 367 600 385V420H0Z","#d6dfc9");
 if(ant){
  a+=E(384,230,79,60,"#83533d")+E(289,224,54,41,"#a75d3f")+E(205,220,43,38,"#704236");
  for(let i=0;i<3;i++){a+=L(277+i*38,247,208+i*20,321+i*11,"#573d32",6);a+=L(290+i*36,238,386+i*25,318+i*10,"#573d32",6);}
  a+=L(179,197,151,164,"#573d32",4)+L(199,192,213,156,"#573d32",4);a+=E(184,212,5,5,"#202521");return a;
 }
 if(beetle){
  a+=E(302,237,111,117,color,0,'stroke="#385c49" stroke-width="7"');
  a+=E(302,150,68,43,"#39765a")+L(302,173,302,341,"#315b4c",6);
  a+=E(266,228,35,69,"#66aa7a",-12,'opacity=".58"')+E(335,232,29,70,"#89b983",12,'opacity=".4"');
  for(let i=0;i<3;i++){a+=L(209,184+i*56,157,161+i*63,"#426451",6);a+=L(398,184+i*56,449,161+i*63,"#426451",6);}
  a+=L(267,124,242,97,"#355746",4)+L(342,124,360,96,"#355746",4);return a;
 }
 if(wasp){
  a+=E(352,235,112,57,"#efc849",-5,'stroke="#514a3d" stroke-width="5"');
  for(let i=0;i<4;i++)a+=P("M"+(310+i*29)+" 183Q"+(302+i*29)+" 228 "+(310+i*29)+" 282","none",'stroke="#373a35" stroke-width="12"');
  a+=E(257,222,54,47,"#313b37")+E(185,210,41,40,"#dfbf55");
  a+=P("M463 233L516 244 468 254Z","#48433a");
 }else{
  a+=E(336,231,120,70,kind==="redTailedBumblebee"?"#303437":"#3b3931",-5,'stroke="#514a40" stroke-width="5"');
  const band=kind==="gardenBumblebee"?2:1;
  for(let i=0;i<band;i++)a+=P("M"+(282+i*48)+" 164Q"+(266+i*48)+" 230 "+(281+i*48)+" 297","none",'stroke="#e5bb43" stroke-width="26"');
  a+=E(416,240,28,55,kind==="redTailedBumblebee"?"#c35c3f":"#ecece0",0);
  a+=E(232,214,46,48,kind==="redTailedBumblebee"?"#303437":"#393f39");
 }
 a+=E(295,150,83,25,"#e2f1ef",-26,'opacity=".8" stroke="#9ebcbb" stroke-width="3"');
 a+=E(355,149,77,25,"#e1f0ec",21,'opacity=".79" stroke="#9ebcbb" stroke-width="3"');
 for(let i=0;i<3;i++){a+=L(276+i*38,279,248+i*44,329,"#46413b",5);a+=L(310+i*40,278,330+i*42,328,"#46413b",5);}
 a+=E(wasp?171:213,205,5,5,"#202b29");a+=L(207,182,194,161,"#42433a",3);
 return a;
}
function v2Drawing(type,color,kind){
 if(type==="v2-tree")return v2Tree(kind,color);
 if(type==="v2-flower")return v2Flower(kind,color);
 if(type==="v2-bird")return v2Bird(kind,color);
 if(type==="v2-insect")return v2Insect(kind,color);
 return "";
}

 function resolve(id){
  const s=SPEC[String(id)];if(!s)return "";
  const [type,color,detail]=s;
  const drawing=type.startsWith("v2-")?v2Drawing(type,color,detail):["fir","pine","juniper","birch","rowan","aspen","oak","willow","linden"].includes(type)?tree(type,color):["anemone","daisy","dandelion","fireweed","heather","clover"].includes(type)?flower(type,color):fauna(type,color,detail,String(id));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="paper" x2="0" y2="1"><stop stop-color="#faf7ec"/><stop offset="1" stop-color="#e0e9da"/></linearGradient></defs><rect width="600" height="420" fill="url(#paper)"/><circle cx="481" cy="80" r="60" fill="#ead9ae" opacity=".2"/><path d="M0 375Q155 344 315 371T600 365V420H0Z" fill="#c6d9bf" opacity=".4"/><g stroke-linecap="round" stroke-linejoin="round">${drawing}</g></svg>`;
  return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
 }
 window.HG_NATURE_ILLUSTRATIONS=Object.freeze({has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id)),resolve,count:Object.keys(SPEC).length});
})();
