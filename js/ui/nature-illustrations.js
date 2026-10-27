/* Original simplified species-specific vector art. Not a diagnostic identification guide. */
(function atlas() {
 "use strict";
 const SPEC={
  emne_ved_gran:["fir","#2e6144"],emne_ved_furu:["pine","#447858"],emne_ved_dunbjoerk:["birch","#7faa73"],emne_ved_rogn:["rowan","#689350"],emne_ved_osp:["aspen","#7db077"],emne_ved_einer:["juniper","#436852"],emne_ved_eik:["oak","#648d4e"],emne_ved_selje:["willow","#88ad77"],emne_ved_lind:["linden","#82a96a"],
  emne_flora_rosslyng:["heather","#bf7ba4"],emne_flora_hvitveis:["anemone","#fcf9ec"],emne_flora_lovetann:["dandelion","#edc545"],emne_flora_geitrams:["fireweed","#d96d9e"],emne_flora_prestekrage:["daisy","#fdfbf3"],emne_flora_rodkløver:["clover","#ca699d"],
  emne_fauna_ekorn:["squirrel","#bc7645"],emne_fauna_rodstrupe:["bird","#b69a7f","#e17735"],emne_fauna_kjottmeis:["bird","#303d3f","#edd044"],emne_fauna_blaameis:["bird","#4a77ac","#e4d252"],emne_fauna_bokfink:["bird","#657a84","#c5836d"],emne_fauna_graaspurv:["bird","#8a654e","#cbb194"],emne_fauna_skjaere:["bird","#22343a","#fbfaf4"],emne_fauna_kraake:["bird","#333d45","#777c7c"],emne_fauna_fiskemaake:["bird","#8a9ca7","#faf9f3"],emne_fauna_storskarv:["bird","#313d43","#44484d"],
  emne_fauna_bille_sjuprikket_marihone:["ladybird","#da4539"],emne_fauna_honningbie:["bee","#e1b850"],emne_fauna_libeller:["dragonfly","#4b8f96"],emne_fauna_orret:["fish","#96996c","#d4c6a0"],emne_fauna_laks:["fish","#8da9ba","#c5c7c1"]
 };
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
 function resolve(id){
  const s=SPEC[String(id)];if(!s)return "";
  const [type,color,detail]=s;
  const drawing=["fir","pine","juniper","birch","rowan","aspen","oak","willow","linden"].includes(type)?tree(type,color):["anemone","daisy","dandelion","fireweed","heather","clover"].includes(type)?flower(type,color):fauna(type,color,detail,String(id));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="paper" x2="0" y2="1"><stop stop-color="#faf7ec"/><stop offset="1" stop-color="#e0e9da"/></linearGradient></defs><rect width="600" height="420" fill="url(#paper)"/><circle cx="481" cy="80" r="60" fill="#ead9ae" opacity=".2"/><path d="M0 375Q155 344 315 371T600 365V420H0Z" fill="#c6d9bf" opacity=".4"/><g stroke-linecap="round" stroke-linejoin="round">${drawing}</g></svg>`;
  return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
 }
 window.HG_NATURE_ILLUSTRATIONS=Object.freeze({has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id)),resolve,count:Object.keys(SPEC).length});
})();
