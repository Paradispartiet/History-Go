/* History Go Nature Atlas – batch 05. Original stylized field-guide illustrations, not identification photographs. */
(function(){
"use strict";
const previous=window.HG_NATURE_ILLUSTRATIONS;
if(!previous || typeof previous.resolve!=="function")return;
const SPEC={
 emne_flora_hagelupin:["plant","lupin","#7774b6"],
 emne_flora_kanadagullris:["plant","goldenrod","#e5bd47"],
 emne_flora_kjempespringfro:["plant","balsam","#cd72a5"],
 emne_flora_skvallerkaal:["plant","groundelder","#f6f1e2"],
 emne_flora_kjempebjornkjeks:["plant","hogweed","#fff7df"],
 emne_flora_parkslirekne:["plant","knotweed","#f4eadb"],
 emne_flora_prydkirsebaer:["plant","cherry","#eaa4bd"],
 emne_flora_syrin:["plant","lilac","#9776b9"],
 emne_flora_mahonia:["plant","mahonia","#e6bf41"],
 emne_flora_berberis:["plant","barberry","#c94442"],
 emne_flora_tuja:["plant","thuja","#568968"],
 emne_flora_sitkagran:["plant","sitka","#4d7c6a"],
 emne_flora_rynkesurbaer:["plant","chokeberry","#424354"],
 emne_flora_buskmure:["plant","cinquefoil","#f0cd4c"],
 emne_flora_hagegullregn:["plant","laburnum","#eac046"],
 emne_fauna_stokkand:["bird","mallard","#397664"],
 emne_fauna_knoppsvane:["bird","swan","#f6f4eb"],
 emne_fauna_graahegre:["bird","heron","#92a3ae"],
 emne_fauna_stillits:["bird","goldfinch","#bc9e84"],
 emne_fauna_linerle:["bird","wagtail","#a9b1b5"],
 emne_fauna_taarnseiler:["bird","swift","#37444d"],
 emne_fauna_vipe:["bird","lapwing","#42645a"],
 emne_fauna_tjeld:["bird","oystercatcher","#242e33"],
 emne_fauna_fossekall:["bird","dipper","#464a4d"],
 emne_fauna_stankelbein:["other","cranefly","#9d7e62"],
 emne_fauna_vannloper:["other","waterstrider","#59675e"],
 emne_fauna_solvkre:["other","silverfish","#a3adb5"],
 emne_fauna_baksvommer:["other","backswimmer","#a5a68a"],
 emne_fauna_nise:["other","porpoise","#798c97"],
 emne_fauna_al:["other","eel","#6f8568"]
};
const P=(d,fill,attrs="")=>'<path d="'+d+'" fill="'+fill+'" '+attrs+'/>';
const E=(x,y,rx,ry,fill,rot=0,attrs="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+rot+' '+x+' '+y+')" fill="'+fill+'" '+attrs+'/>';
const C=(x,y,r,fill,attrs="")=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" '+attrs+'/>';
const L=(x,y,X,Y,col="#63795e",w=4)=>P("M"+x+" "+y+"L"+X+" "+Y,"none",'stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round"');
const leaf=(x,y,r,c,rot=0)=>E(x,y,r*.58,r,c,rot,'stroke="#4d7559" stroke-width="1"');
function flower(x,y,n,size,c,center="#d6a83e"){let s="";for(let i=0;i<n;i++){const a=i*Math.PI*2/n;s+=E(x+Math.sin(a)*size*.72,y-Math.cos(a)*size*.72,size*.37,size*.72,c,a*180/Math.PI);}return s+C(x,y,size*.32,center);}
function umbel(x,y,scale,c){let a=L(x,y+46*scale,x,y+4*scale,"#7d9969",4);for(let i=-4;i<=4;i++){const xx=x+i*14*scale, yy=y+Math.abs(i)*3*scale;a+=L(x,y+3*scale,xx,yy-9*scale,"#739768",2);for(let j=0;j<3;j++)a+=C(xx+(j-1)*5*scale,yy-(j%2)*5*scale,3.5*scale,c);}return a;}
function shrub(k,col){
 let a=P("M295 389Q287 258 295 169M297 294Q223 234 159 201M300 276Q370 230 442 175","none",'stroke="#796c53" stroke-width="10"');
 if(k==="sitka"||k==="thuja"){
  a=P("M295 382L300 80","none",'stroke="#75644e" stroke-width="13"');
  for(let j=0;j<10;j++){
   const y=93+j*27,w=24+j*15;
   if(k==="sitka"){a+=P("M298 "+y+"L"+(298-w)+" "+(y+58)+"Q298 "+(y+36)+" "+(298+w)+" "+(y+58)+"Z",j%3?"#457765":col);for(let i=-3;i<=3;i++)a+=L(298+i*w/4,y+45,298+i*w/4-5,y+56,"#89ab93",1);}
   else{a+=P("M298 "+y+"Q"+(298-w)+" "+(y+20)+" "+(298-w)+" "+(y+49)+"Q295 "+(y+60)+" "+(298+w)+" "+(y+49)+"Q"+(298+w)+" "+(y+20)+" 298 "+y+"Z",j%2?col:"#397c57");for(let i=-3;i<=3;i++)a+=L(298+i*w/4,y+42,298+i*w/4+4,y+28,"#a2b99d",2);}
  }
  if(k==="sitka")for(let i=0;i<13;i++)a+=E(205+(i*41)%195,175+(i*27)%139,6,12,"#977c58",i*19);
  return a;
 }
 if(k==="cherry"){a=P("M292 392L304 251Q249 204 199 172M305 256Q365 219 415 156M298 295Q302 202 309 132","none",'stroke="#887663" stroke-width="12"');}
 for(let i=0;i<46;i++){
  const angle=i*2.399, x=301+Math.cos(angle)*(45+(i%6)*24),y=213+Math.sin(angle)*(28+(i%5)*22);
  if(k==="cherry")a+=flower(x,y,5,9+(i%3)*2,col,"#dfb64c");
  else if(k==="lilac"){a+=E(x,y,12,23,i%3?"#ac8bc2":"#765b9e",i*21);for(let t=0;t<4;t++)a+=C(x+(t%2?5:-5),y+((t>>1)?6:-6),2.5,"#e2d3eb");}
  else if(k==="chokeberry"){a+=leaf(x,y,18,i%4?"#627f5b":"#9d6f54",i*27);if(i%2===0)a+=C(x+9,y+8,6,i%5?"#343a45":"#4c4352");}
  else if(k==="barberry"){a+=leaf(x,y,15,i%3?"#9f7352":"#bb5354",i*35);if(i%2===0)a+=E(x+8,y+11,4,9,col,20);}
  else if(k==="mahonia"){a+=leaf(x,y,22,i%3?"#345e57":"#4a7764",i*26);if(i%3===0)a+=C(x+8,y+8,5,"#344c7b");if(i%5===0)a+=flower(x-7,y-8,5,9,col);}
  else if(k==="cinquefoil"){a+=leaf(x,y,16,"#769f6c",i*24);if(i%3===0)a+=flower(x,y,5,13,col);}
  else if(k==="laburnum"){a+=leaf(x,y,17,"#659763",i*22);if(i%4===0){for(let t=0;t<6;t++)a+=E(x+4,y+6+t*12,6,9,col,22);}}
 }
 if(k==="barberry")for(let j=0;j<12;j++)a+=P("M"+(179+j*19)+" "+(224+j%4*17)+"l-7 -12 12 7Z","#66533e");
 return a;
}
function tallPlant(k,col){
 let a="";
 const height=k==="hogweed"?83:k==="knotweed"?102:131;
 const n=k==="groundelder"?5:k==="hogweed"?4:6;
 for(let j=0;j<n;j++){
  const x=110+j*(380/(n-1)), top=height+(j%3)*29,sc=1-(j%3)*.12;
  a+=P("M"+x+" 391Q"+(x-13)+" 266 "+x+" "+top,"none",'stroke="'+(k==="knotweed"?"#8b9165":"#60875f")+'" stroke-width="'+(k==="hogweed"?11:6)+'"');
  if(k==="lupin"){
   for(let t=0;t<12;t++){const yy=top+t*13;const rr=21-(t*.9);for(let h=-1;h<=1;h++)a+=E(x+h*rr,yy,6+(t%3),9+(t%2),t%4?"#807ac7":"#e2a2c9",h*29);}
   for(let t=0;t<3;t++){const y=282+t*31;for(let h=0;h<7;h++){const v=h*6.28/7;a+=leaf(x+Math.cos(v)*30,y+Math.sin(v)*16,19,"#74a274",v*57.3);}}
  } else if(k==="goldenrod"){
   for(let t=0;t<11;t++){const yy=top+20+t*12,w=45-t*2;for(let h=-1;h<=1;h++){a+=L(x,yy,x+h*w,yy-12,"#6b935e",2);for(let m=0;m<3;m++)a+=C(x+h*w*(m/3),yy-10-(m%2)*5,3.5,col);}}
   for(let t=0;t<5;t++)a+=leaf(x+(t%2?28:-27),255+t*24,24,"#709a68",t%2?48:-48);
  } else if(k==="balsam"){
   for(let t=0;t<7;t++){const yy=top+24+t*30;const xx=x+(t%2?24:-23);a+=leaf(xx,yy+13,25,"#6f9d75",t%2?58:-58);
    a+=P("M"+xx+" "+(yy-17)+"Q"+(xx-22)+" "+(yy-30)+" "+(xx-22)+" "+yy+"Q"+(xx+5)+" "+(yy+14)+" "+xx+" "+(yy-17)+"Z",col)+E(xx-6,yy-7,10,14,"#e69bc3",-20);}
  } else if(k==="groundelder"){a+=umbel(x,top,sc,col);for(let t=0;t<5;t++){const yy=218+t*29;for(let h=-1;h<=1;h++)a+=leaf(x+h*20,yy-(h%2)*7,17,"#74a267",h*35);}}
  else if(k==="hogweed"){a+=umbel(x,top,1.9*sc,col);for(let t=0;t<3;t++){const yy=257+t*42;a+=P("M"+x+" "+yy+"Q"+(x-100)+" "+(yy-82)+" "+(x-62)+" "+(yy+22)+"Q"+x+" "+(yy+37)+" "+(x+61)+" "+(yy+16)+"Q"+(x+91)+" "+(yy-71)+" "+x+" "+yy+"Z","#74a26d",'stroke="#497850" stroke-width="2"');}}
  else if(k==="knotweed"){
   for(let t=0;t<6;t++){const yy=top+38+t*38;const dir=t%2?1:-1; a+=L(x-5,yy,x+6,yy,"#9e655c",5);a+=P("M"+x+" "+yy+"Q"+(x+dir*75)+" "+(yy-46)+" "+(x+dir*67)+" "+(yy+28)+"Q"+(x+dir*25)+" "+(yy+58)+" "+x+" "+yy+"Z","#6e9d70");}
   for(let t=0;t<8;t++)a+=C(x+(t%2?23:-21),top+20+t*16,5,col);
  }
 }
 return a;
}
function flora(k,col){
 if(["cherry","lilac","mahonia","barberry","thuja","sitka","chokeberry","cinquefoil","laburnum"].includes(k))return shrub(k,col);
 return tallPlant(k,col);
}
function beak(x,y,len,color){return P("M"+x+" "+(y-6)+"l-"+len+" 8 "+len+" 5Z",color);}
function waterBird(k,col){
 let a=P("M0 354Q150 340 300 358T600 352","none",'stroke="#94bdbd" stroke-width="5"');
 if(k==="swan"){
  a+=E(340,278,135,64,"#f5f4ed",-8,'stroke="#cdd3d0" stroke-width="4"');
  a+=P("M244 269Q196 228 225 160L240 83Q259 48 283 83Q301 106 274 139L260 235L301 265Z","#f6f5ee",'stroke="#cdd0c9" stroke-width="4"');
  a+=P("M232 88Q189 78 168 112L224 114Z","#e18447")+P("M221 89Q244 79 256 95L241 107Z","#262e30");
  a+=C(251,92,6,"#182628");
  for(let i=0;i<7;i++)a+=E(297+i*18,272+i%3*4,27,13,"#e3e8e3",-20);
 } else {
  a+=E(315,259,117,76,k==="mallard"?"#a58e70":"#f6f4ed",-6,'stroke="#6f7d74" stroke-width="3"');
  a+=P("M379 239L477 204L451 274L383 296Z",k==="mallard"?"#746b59":"#dcded7");
  a+=P("M234 263Q213 242 224 183L245 151Q265 135 280 154L276 217L304 246Z",col,'stroke="#61746e" stroke-width="3"');
  a+=E(247,152,43,45,col)+C(230,144,6,"#f4e4ab")+C(229,143,3,"#222");
  a+=beak(209,165,66,"#ddb44e");
  a+=P("M271 187Q275 218 283 226","none",'stroke="#f4f4e9" stroke-width="10"');
  a+=E(325,253,76,33,"#d2c8b5",-19);
  a+=E(347,251,41,17,"#5c777a",-23)+L(347,253,373,250,"#f2e5d4",2);
 }
 return a;
}
function smallBird(k,col){
 const perch=k!=="lapwing"&&k!=="swift"&&k!=="oystercatcher";
 let a=perch?P("M66 356Q302 349 540 362","none",'stroke="#8d795d" stroke-width="12"'):"";
 if(k==="swift"){
  a+=P("M282 220Q198 140 57 145Q160 220 250 246Q314 320 328 329L341 258Q449 209 542 104Q411 124 316 203Z",col,'stroke="#273841" stroke-width="5"');
  a+=P("M288 236L340 296L327 248Z","#62707a")+C(303,226,5,"#e0dfd0");
  return a;
 }
 if(k==="heron"){
  a+=P("M398 212Q429 239 490 274L398 278Z",col)+E(335,230,89,55,col,14);
  a+=P("M276 233Q231 203 268 126L283 55Q302 42 318 65L305 177L326 213Z","#a6b5bd",'stroke="#617481" stroke-width="4"');
  a+=P("M278 66L142 85L276 83Z","#d2a762")+C(290,63,5,"#203039");
  a+=P("M295 55L319 24L328 48Z","#303f4d");
  a+=L(345,276,320,392,"#af8b59",6)+L(379,270,392,392,"#b69461",6);
  for(let i=0;i<7;i++)a+=L(312+i*11,230,319+i*11,249,"#d9ded9",2);return a;
 }
 if(k==="oystercatcher"){
  a+=E(311,257,114,73,"#222c31",-9)+E(298,277,67,39,"#f6f6ee",-12)+E(207,174,54,48,"#273136");
  a+=P("M160 172L59 170L160 189Z","#e77948")+C(194,162,7,"#db7452");
  a+=L(278,316,271,391,"#d56f54",7)+L(350,315,359,391,"#d56f54",7);
  a+=P("M381 234L490 289L421 300Z","#273136");return a;
 }
 if(k==="lapwing"){
  a+=E(310,262,111,73,col,-10)+E(310,288,77,43,"#eeeae2",-18)+E(203,171,56,46,"#283435");
  a+=P("M222 144Q256 49 241 35M228 140Q287 86 278 41","none",'stroke="#253138" stroke-width="5"');
  a+=E(323,226,87,24,"#64857a",-18)+beak(163,177,50,"#8e8062")+C(183,159,5,"#e5dccb");
  a+=L(276,315,264,388,"#a38268",6)+L(341,312,354,388,"#a38268",6);return a;
 }
 const tail=k==="wagtail"?507:465;
 a+=P("M355 227L"+tail+" 303L"+(tail-17)+" 320L340 292Z",k==="wagtail"?"#242b31":col);
 a+=E(308,245,118,74,col,-9,'stroke="#535c59" stroke-width="4"');
 a+=E(330,260,76,35,k==="goldfinch"?"#dac6a6":k==="dipper"?"#ece6d9":"#f0efe8",-14);
 a+=E(203,165,57,49,k==="goldfinch"?"#f6ebd8":k==="dipper"?"#544c4b":"#303841");
 a+=beak(151,169,k==="dipper"?48:58,k==="goldfinch"?"#cbb291":"#9e9372");
 a+=C(190,152,6,"#1f2627")+C(188,150,2,"#fff");
 if(k==="goldfinch"){a+=E(187,181,28,23,"#bf3f3a",-17)+P("M240 209L345 240L374 282L305 260Z","#f1d34a")+P("M171 134Q211 120 236 148","none",'stroke="#232c31" stroke-width="11"');}
 if(k==="wagtail"){a+=P("M167 143Q209 140 242 167","none",'stroke="#f2f1eb" stroke-width="13"')+E(283,270,67,41,"#e1e1de");}
 if(k==="dipper"){a+=E(244,245,49,46,"#faf7ee",-21)+P("M255 205Q307 213 341 236L290 268Z","#63544d");}
 a+=L(281,304,264,356,"#796958",5)+L(335,305,351,356,"#796958",5);
 return a;
}
function other(k,c){
 if(k==="porpoise"){
  return P("M102 241Q210 152 339 201L381 147L398 207Q463 211 507 260L550 238L539 296L492 281Q384 311 305 292L236 333L245 286Q166 277 102 241Z",c,'stroke="#5a7581" stroke-width="5"')+
  E(181,227,5,5,"#263944")+P("M210 286Q299 312 367 282","none",'stroke="#d6dee0" stroke-width="7"');
 }
 if(k==="eel"){
  let a=P("M74 246C90 119 232 140 285 222C341 320 465 347 522 233L546 195L535 289L555 323L524 309C478 388 330 382 273 282C211 164 139 191 124 254Z",c,'stroke="#4d6859" stroke-width="5"');
  a+=P("M119 243C155 207 218 220 264 289C352 385 458 349 520 269","none",'stroke="#d3c99f" stroke-width="9"')+C(107,221,7,"#202f2b");return a;
 }
 if(k==="silverfish"){
  let a=P("M164 210Q300 110 448 208Q350 309 182 260Z",c,'stroke="#637782" stroke-width="5"');
  for(let i=0;i<11;i++){const x=215+i*20;a+=P("M"+x+" "+(161-i%3*5)+"Q"+(x-16)+" 223 "+x+" "+(274+i%4*2),"none",'stroke="#dee3e1" stroke-width="4"');}
  for(let i=0;i<7;i++){a+=L(230+i*28,259,199+i*30,303+i%3*14,"#869ba4",4);a+=L(230+i*28,178,197+i*30,140-i%3*13,"#869ba4",4);}
  a+=P("M442 209Q500 205 560 178M446 211Q517 235 559 252M446 214Q514 270 540 308","none",'stroke="#a0aab1" stroke-width="4"');
  a+=P("M174 215Q112 169 89 142M177 218Q127 206 77 214","none",'stroke="#8c9aa0" stroke-width="4"')+C(181,216,6,"#23363b");return a;
 }
 if(k==="waterstrider"){
  let a=P("M0 324Q294 305 600 321","none",'stroke="#8bbabe" stroke-width="4"');
  a+=E(306,218,91,24,"#53635c")+E(213,211,40,29,"#3b514e")+C(201,204,5,"#d5d8b9");
  for(let j=0;j<3;j++){const x=235+j*58;a+=P("M"+x+" 222Q"+(x-96)+" "+(246-j*16)+" "+(x-108)+" "+(319-j*12),"none",'stroke="#576e65" stroke-width="5"');a+=P("M"+x+" 220Q"+(x+95)+" "+(250-j*12)+" "+(x+110)+" "+(313+j*6),"none",'stroke="#576e65" stroke-width="5"');}
  for(let j=0;j<6;j++){const x=134+j*67;a+=E(x,325+(j%3)*3,23,3,"#bee0de");}
  return a+L(194,194,159,167,"#4d655e",3)+L(214,192,210,155,"#4d655e",3);
 }
 if(k==="backswimmer"){
  let a=P("M0 303Q300 291 600 309","none",'stroke="#92c4c7" stroke-width="5"');
  a+=E(304,237,110,55,c,-8,'stroke="#68796d" stroke-width="5"')+E(222,227,38,35,"#717d67");
  for(let i=0;i<8;i++)a+=P("M"+(263+i*12)+" 200L"+(267+i*12)+" 272","none",'stroke="'+(i%2?"#606956":"#d9caa7")+'" stroke-width="4"');
  a+=L(260,258,112,329,"#707f74",6)+L(345,254,484,336,"#707f74",6);
  a+=L(252,213,190,157,"#69786d",3)+L(341,209,404,152,"#69786d",3)+C(214,216,5,"#18262a");
  return a;
 }
 if(k==="cranefly"){
  let a=E(325,213,104,18,c,-8)+E(213,211,29,26,"#796652")+E(252,208,31,21,"#8c735f");
  a+=E(301,157,110,23,"#dce5dd",-25,'opacity=".72" stroke="#a9c9c2" stroke-width="3"')+E(360,156,111,22,"#dce5dd",19,'opacity=".75" stroke="#a9c9c2" stroke-width="3"');
  for(let i=0;i<3;i++){const x=244+i*37;a+=P("M"+x+" 219Q"+(x-65)+" 244 "+(x-126)+" 369","none",'stroke="#8f7b60" stroke-width="4"');a+=P("M"+x+" 217Q"+(x+73)+" 238 "+(x+133)+" 374","none",'stroke="#8f7b60" stroke-width="4"');}
  a+=L(205,193,163,161,"#796753",3)+L(215,191,230,156,"#796753",3)+C(200,207,5,"#273033");return a;
 }
 return "";
}
function resolve(id){
 const entry=SPEC[String(id)];
 if(!entry)return previous.resolve(id);
 const [family,kind,color]=entry;
 const drawing=family==="plant"?flora(kind,color):family==="bird"?(kind==="swan"||kind==="mallard"?waterBird(kind,color):smallBird(kind,color)):other(kind,color);
 const wet=family!=="plant"&&["swan","mallard","heron","oystercatcher","waterstrider","backswimmer","porpoise","eel"].includes(kind);
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="paper5" x2="0" y2="1"><stop stop-color="'+(wet?"#e3f3f3":"#faf8ed")+'"/><stop offset="1" stop-color="'+(wet?"#c3e1df":"#deeadb")+'"/></linearGradient></defs><rect width="600" height="420" fill="url(#paper5)"/><path d="M0 393Q300 372 600 389V420H0Z" fill="'+(wet?"#a6cfce":"#c9dfbf")+'" opacity=".55"/><g stroke-linecap="round" stroke-linejoin="round">'+drawing+'</g></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
window.HG_NATURE_ILLUSTRATIONS=Object.freeze({
 has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id))||previous.has(id),
 resolve,
 count:previous.count+Object.keys(SPEC).length
});
})();
