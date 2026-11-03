/* History Go – Nature Atlas: illustration batch 09 (15 flora, 15 fauna).
 * Original schematic SVG illustrations, not a substitute for species identification.
 * Existing species, quiz and collection records are unchanged.
 */
(function(){
"use strict";
const previous=window.HG_NATURE_ILLUSTRATIONS;
if(!previous||typeof previous.resolve!=="function")return;
const SPEC={
 emne_flora_tyskhonsetarm:["plant","chickweed","#f8f3e7","#79a477"],
 emne_flora_vararve:["plant","springwort","#fffaf0","#71a17c"],
 emne_flora_varmure:["plant","cinquefoil","#efcb49","#72945d"],
 emne_flora_varpengeurt:["plant","pennycress","#f8f7ed","#7ca16a"],
 emne_flora_snobaer:["shrub","snowberry","#edece0","#659b75"],
 emne_flora_spirea:["shrub","spirea","#fcf7ee","#7c9c6a"],
 emne_flora_sibirsk_ertebusk:["shrub","peashrub","#edc948","#789653"],
 emne_flora_platanlonn:["tree","maple","#7fa46c","#d4a858"],
 emne_flora_prydpaere:["tree","pear","#f9f6eb","#739977"],
 emne_flora_sotmispel:["tree","serviceberry","#f9f6ed","#6d9877"],
 emne_gress_timotei:["grass","timothy","#9eab73","#84a66d"],
 emne_gress_hundegras:["grass","orchard","#91a37c","#79a36c"],
 emne_siv_knappsiv:["grass","rush","#9b8864","#63936f"],
 emne_ror_takror:["grass","reed","#b3a080","#6b9770"],
 emne_urt_tettegras:["plant","butterwort","#a27cbe","#7baf75"],
 emne_fauna_munk:["bird","blackcap","#797c77","#4d5151"],
 emne_fauna_storlom:["bird","loon","#333b40","#e7ece7"],
 emne_fauna_laksand:["bird","goosander","#3e5555","#e5ebe1"],
 emne_fauna_siland:["bird","redbreast","#a97b65","#66777c"],
 emne_fauna_svarthvit_fluesnapper:["bird","flycatcher","#31373a","#faf8ed"],
 emne_fauna_hvitryggspett:["bird","woodpecker","#30383c","#f4f2e6"],
 emne_fauna_dvergspett:["bird","lesserwoodpecker","#454648","#f0efdf"],
 emne_fauna_svartbak:["bird","blackback","#30383d","#f2f0e8"],
 emne_fauna_skjaerpiplerke:["bird","rockpipit","#796e62","#ddd2b8"],
 emne_fauna_kanadagaas:["bird","canadagoose","#6c655d","#e8e6dc"],
 emne_fauna_smaatorvlibelle:["insect","dragonfly","#9f725b","#4e6c6d"],
 emne_fauna_blagratt_kveldfly:["insect","moth","#6e7381","#a5adbf"],
 emne_fauna_lange:["marine","ling","#958774","#cab99a"],
 emne_fauna_grov_mudderslangestjerne:["marine","brittlestar","#a7896d","#dbc7ac"],
 emne_fauna_eledoneblekksprut:["marine","octopus","#b47c69","#d6aaa0"]
};
const P=(d,fill,attr="")=>'<path d="'+d+'" fill="'+fill+'" '+attr+'/>';
const E=(x,y,rx,ry,c,rot=0,attr="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+rot+' '+x+' '+y+')" fill="'+c+'" '+attr+'/>';
const C=(x,y,r,c,attr="")=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'" '+attr+'/>';
const L=(x,y,x2,y2,c="#678d65",w=4)=>P("M"+x+" "+y+"L"+x2+" "+y2,"none",'stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"');
function blossom(x,y,n,r,c,mid="#ddb755"){
 let a="";for(let j=0;j<n;j++){const t=j*2*Math.PI/n;a+=E(x+Math.sin(t)*r*.6,y-Math.cos(t)*r*.6,r*.44,r*.7,c,t*180/Math.PI);}
 return a+C(x,y,r*.27,mid);
}
function leaf(x,y,s=1,r=20,green="#7b9b70",serrated=false){
 const xx=x+s*r*2,yy=y-r*.3;
 let a=P("M"+x+" "+y+"Q"+(x+s*r)+" "+(y-r*1.2)+" "+xx+" "+yy+"Q"+(x+s*r*1.7)+" "+(y+r*.3)+" "+x+" "+y+"Z",green,'stroke="#5e855b" stroke-width="1.6"');
 if(serrated){for(let z=0;z<3;z++)a+=L(x+s*(8+z*9),y-(z%2)*4,x+s*(9+z*9),y-7-(z%2)*4,"#739d6c",1);}
 return a+L(x,y,xx-s*3,yy+2,"#598558",1.2);
}
function plant(k,c,g){
 let a="";
 if(k==="butterwort"){
  for(let j=0;j<3;j++){let x=176+j*124,y=315+j%2*17;
   for(let n=0;n<12;n++){let t=n*Math.PI/6;a+=E(x+Math.cos(t)*32,y+Math.sin(t)*24,35,15,n%3?"#9ebf77":"#83ab7b",n*30,'stroke="#72966d" stroke-width="1.5"');}
   for(let n=0;n<14;n++)a+=C(x+Math.sin(n*2.4)*32,y+Math.cos(n*2.4)*25,2.2,"#e3c784");
   a+=P("M"+x+" "+(y-15)+"Q"+(x-18)+" "+(y-90)+" "+x+" "+(y-146),"none",'stroke="#729c6b" stroke-width="4"');
   a+=E(x,y-149,14,24,c,-25)+E(x+12,y-158,11,19,c,23)+C(x+2,y-147,5,"#e9dc9e");
  }return a;
 }
 const small=k==="chickweed"||k==="springwort";
 for(let j=0;j<(small?7:5);j++){
  const x=108+j*(small?62:94),top=(small?234:145)+j%3*16;
  a+=P("M"+x+" "+top+"Q"+(x-22)+" "+(top+70)+" "+(x+8)+" 394","none",'stroke="'+g+'" stroke-width="'+(small?3:5)+'"');
  for(let i=0;i<(small?2:3);i++){const yy=295+i*30;a+=leaf(x,yy,i%2?1:-1,small?10:18,g,k==="cinquefoil");}
  if(k==="pennycress"){
   for(let i=0;i<3;i++){a+=L(x,top+30+i*27,x+38,top+17+i*27,g,2.2);a+=C(x+43,top+15+i*27,9,"#b2b99a",'stroke="#829875" stroke-width="2"');}
   a+=blossom(x,top,4,17,c);
  }else if(k==="cinquefoil"){
   for(let i=0;i<3;i++)a+=blossom(x+(i-1)*18,top+i%2*20,5,18,c);
  }else{
   for(let i=0;i<4;i++)a+=blossom(x+((i%2)*2-1)*13,top+i*13,k==="springwort"?4:5,small?10:12,c,"#c8c68b");
  }
 }
 return a;
}
function shrub(k,c,g){
 let a=P("M292 398Q307 261 292 174M292 299Q186 218 135 158M300 275Q388 202 458 137M296 342Q184 306 110 253M298 329Q417 298 506 245","none",'stroke="#776b52" stroke-width="9" stroke-linecap="round"');
 for(let j=0;j<36;j++){
  const t=j*2.399, rr=27+(j%6)*18,x=302+Math.cos(t)*rr*1.85,y=228+Math.sin(t)*rr;
  a+=E(Math.round(x),Math.round(y),23,13,g,(j*41)%170,'stroke="#678b64" stroke-width="1.4"');
 }
 for(let j=0;j<21;j++){
  const t=j*2.399,rr=40+(j%5)*22,x=Math.round(304+Math.cos(t)*rr*1.65),y=Math.round(228+Math.sin(t)*rr*.94);
  if(k==="snowberry")a+=C(x,y,9,j%3?"#f1efe7":"#e3e4d8",'stroke="#a6b4a5" stroke-width="2"')+C(x-3,y-2,1.6,"#a5aaa2");
  else if(k==="spirea")a+=blossom(x,y,5,10,c,"#d9ba72");
  else{a+=E(x,y,13,17,c,42);if(j%4===0)a+=P("M"+x+" "+(y+18)+"q9 23 -2 44","none",'stroke="#988b56" stroke-width="3"');}
 }
 return a;
}
function tree(k,c,g){
 let a=P("M275 402L281 233Q279 193 267 152L288 144Q322 206 317 243L324 402Z","#88725f",'stroke="#735f4e" stroke-width="4"');
 a+=P("M299 243Q215 188 156 172M307 221Q386 160 464 161M298 184L298 95","none",'stroke="#826956" stroke-width="12" stroke-linecap="round"');
 for(let j=0;j<45;j++){
  const t=j*2.399,r=37+(j%7)*18,x=Math.round(307+Math.cos(t)*r*1.21),y=Math.round(189+Math.sin(t)*r*.64);
  a+=E(x,y,27,19,j%5?"#7ea676":"#a6bd84",(j*29)%170,'stroke="#648c63" stroke-width="1"');
 }
 if(k==="maple"){
  for(let j=0;j<13;j++){const x=206+(j*53)%205,y=113+(j*37)%146;
   a+=P("M"+x+" "+(y-21)+"l8 11 14 -5 -5 15 14 4 -17 9 -6 18 -5 -18 -19 -8 14 -5 -7 -14 14 2Z",g);
   if(j%3===0)a+=P("M"+x+" "+(y+12)+"q-33 -20 -38 0q25 1 38 3q15 -12 38 -4q-11 -13 -38 1Z","#c5a16b");
  }
 }else{
  for(let j=0;j<30;j++){const x=184+(j*53)%246,y=102+(j*31)%167;a+=blossom(x,y,5,k==="pear"?13:10,c,"#e6bf6a");}
  if(k==="serviceberry")for(let j=0;j<13;j++){const x=201+(j*71)%221,y=177+(j*37)%105;a+=C(x,y,8,j%2?"#404c69":"#69516f");}
 }
 return a;
}
function grass(k,c,g){
 let a="";
 for(let j=0;j<11;j++){
  const x=74+j*45,top=88+(j%5)*32;
  a+=P("M"+x+" 396Q"+(x-23)+" 290 "+(x+5)+" "+top,"none",'stroke="'+g+'" stroke-width="'+(k==="reed"?6:4)+'" stroke-linecap="round"');
  for(let h=0;h<3;h++){const y=265+h*43;a+=P("M"+x+" "+y+"Q"+(x-37)+" "+(y-32)+" "+(x-45)+" "+(y-57)+"Q"+(x-15)+" "+(y-51)+" "+x+" "+y+"Z",g);}
  if(k==="timothy")a+=E(x+4,top,9,41,c,-4,'stroke="#738c63" stroke-width="2"');
  else if(k==="orchard"){for(let z=0;z<4;z++){const y=top+z*20;a+=L(x+4,y,x+((z%2)?1:-1)*25,y-12,g,2)+E(x+(z%2?24:-22),y-14,15,8,c,-20);}}
  else if(k==="rush"){a+=E(x+13,top+53,14,8,c,23)+E(x+21,top+60,8,6,c);for(let z=0;z<4;z++)a+=L(x+14,top+51,x+10+(z-1)*14,top+23+z*8,c,2);}
  else {for(let z=0;z<13;z++){let xx=x+Math.sin(z*2.4)*16,yy=top+z*5;a+=E(xx,yy,5,19,z%3?"#b59f82":c,(z*39)%120);}}
 }
 return a;
}
function bird(k,c,accent){
 const water=["loon","goosander","redbreast","blackback","canadagoose"].includes(k);
 const longneck=k==="canadagoose",large=k==="loon"||longneck;
 let a=water?P("M0 332Q154 322 313 332T600 328V420H0Z","#b2d2d8",'opacity=".65"'):P("M78 355Q298 344 522 359","none",'stroke="#8b7055" stroke-width="15" stroke-linecap="round"');
 const bx=longneck?310:305,by=longneck?269:236;
 a+=P("M378 "+(by+12)+"Q462 "+(by+18)+" 489 "+(by+79)+"L374 "+(by+47)+"Z",c);
 a+=E(bx,by,large?138:119,large?85:74,k==="flycatcher"?"#f0f0e8":k==="loon"?"#353e43":k==="blackback"?"#f2f2eb":accent,-5,'stroke="#4f6059" stroke-width="4"');
 a+=E(332,by+8,88,42,c,-17,'stroke="#50605a" stroke-width="2.7"');
 const headx=longneck?178:187,heady=longneck?103:160;
 if(longneck){
  a+=P("M208 280Q164 220 164 93L207 88Q203 189 251 243Z","#30383a");
 }else if(k==="loon"){
  a+=P("M228 235Q162 211 164 165L209 147Q209 194 259 221Z","#333e41");
 }
 a+=E(headx,heady,longneck?46:52,longneck?47:49,k==="goosander"?"#2f4d45":k==="redbreast"?"#986a59":k==="loon"?"#30373a":k==="flycatcher"?"#31373a":c);
 if(k==="blackcap")a+=P("M145 149Q169 89 226 141Z","#272d30");
 if(k==="canadagoose")a+=P("M145 94Q175 127 205 91L213 118Q181 142 153 115Z","#f1f0e8");
 if(k==="flycatcher")a+=P("M253 190Q321 163 382 213L345 234L271 231Z","#f8f7ed");
 if(k==="loon"){
  for(let j=0;j<36;j++){const x=270+(j*53)%152,y=205+(j*29)%109;a+=E(x,y,4,8,"#edf0e7",25);}
  a+=L(177,201,225,203,"#f0efe4",5);
 }
 if(k==="woodpecker"||k==="lesserwoodpecker"){
  a+=P("M270 185Q308 201 358 201L349 297Q290 274 275 216Z","#f5f3e8");
  for(let j=0;j<9;j++)a+=L(285+(j%3)*29,215+Math.floor(j/3)*22,304+(j%3)*29,231+Math.floor(j/3)*22,"#444b4d",4);
  a+=P("M165 118Q190 107 203 117L214 149L173 149Z","#b94c42");
 }
 if(k==="blackback")a+=E(331,231,82,37,"#333b43",-11);
 if(k==="rockpipit"){for(let j=0;j<13;j++)a+=L(244+(j%4)*26,224+Math.floor(j/4)*16,254+(j%4)*26,244+Math.floor(j/4)*16,"#615548",3);}
 if(k==="redbreast")for(let z=0;z<6;z++)a+=P("M"+(161+z*7)+" 135l5 -25 8 25Z","#85614e");
 if(k==="goosander")a+=E(240,231,51,56,"#f0eee5");
 if(k==="blackcap")a+=E(211,239,41,44,"#adaaa0");
 const billLong=["loon","goosander","redbreast"].includes(k);
 a+=P("M"+(headx-44)+" "+(heady+3)+"L"+(headx-(billLong?122:85))+" "+(heady+12)+"L"+(headx-44)+" "+(heady+19)+"Z",billLong?"#b65c52":"#bd9c61",'stroke="#6c6a54" stroke-width="2"');
 a+=C(headx-14,heady-11,7,"#1f2d2e")+C(headx-16,heady-13,2,"#f9faf4");
 if(!water){a+=L(269,289,264,348,"#796d59",5)+L(336,284,340,350,"#796d59",5)+L(264,348,241,356,"#796d59",4)+L(340,350,361,358,"#796d59",4);}
 else {a+=E(279,329,38,7,"#a4c9d0",0,'opacity=".65"')+E(386,326,44,7,"#a4c9d0",0,'opacity=".65"');}
 return a;
}
function insect(k,c,accent){
 let a="";
 if(k==="dragonfly"){
  a+=E(300,243,25,114,c)+E(300,142,35,33,"#526965")+C(290,136,9,"#dfe4d9")+C(315,136,9,"#dfe4d9");
  for(let j=0;j<4;j++){const s=j%2?1:-1,y=197+Math.floor(j/2)*44;
   a+=E(300+s*116,y,137,29,"#dce9e5",s*17,'stroke="#89afaf" stroke-width="3" opacity=".78"');
   for(let z=0;z<4;z++)a+=L(310+s*z*29,y-9,330+s*z*37,y+11,"#80a8a8",1);
  }
  for(let j=0;j<8;j++)a+=L(279,218+j*13,324,218+j*13,accent,2.3);
 }else{
  a+=P("M298 160Q183 80 89 156L194 341Q260 321 302 274Q347 323 404 342L511 155Q408 79 303 160Z",c,'stroke="#515d67" stroke-width="5"');
  for(let side of [-1,1]){
   const x=300+side*116;
   for(let j=0;j<10;j++){const yy=170+j*12;a+=E(x+side*(j%3)*19,yy,9,15,j%2?accent:"#9897a7",j*27);}
   a+=P("M300 163Q"+(300+side*68)+" 246 "+(300+side*105)+" 333","none",'stroke="#9ca7a7" stroke-width="5"');
  }
  a+=E(300,230,20,63,"#99978d")+E(300,161,33,27,"#92908a");
  a+=L(287,151,258,106,"#737879",3)+L(312,151,340,104,"#737879",3);
 }
 return a;
}
function marine(k,c,accent){
 if(k==="ling"){
  let a=P("M80 244Q164 139 335 172Q438 193 528 243L560 279L494 288Q368 344 183 304Q114 295 80 244Z",c,'stroke="#66685c" stroke-width="5"');
  a+=P("M189 189Q313 116 454 205L496 241Q310 195 189 189Z","#7c826e");
  a+=P("M473 263Q525 256 572 222L548 273L574 321Q524 302 482 290Z",c);
  a+=P("M260 302Q239 354 312 331Z",accent)+C(133,231,7,"#272e30")+C(131,229,2,"#fff");
  a+=L(103,273,110,297,"#777868",3)+P("M99 266Q124 272 155 264","none",'stroke="#595f57" stroke-width="3"');
  for(let i=0;i<27;i++)a+=E(171+(i*31)%309,233+(i*17)%63,3,2,"#c1b8a5");return a;
 }
 if(k==="brittlestar"){
  let a="";
  for(let j=0;j<5;j++){
   const t=j*2*Math.PI/5-Math.PI/2,x=300+Math.cos(t)*186,y=218+Math.sin(t)*165;
   a+=P("M300 219Q"+(300+Math.cos(t+.22)*97)+" "+(218+Math.sin(t+.22)*96)+" "+x+" "+y,"none",'stroke="'+c+'" stroke-width="17" stroke-linecap="round"');
   for(let q=1;q<=7;q++){const xx=300+Math.cos(t+.16)*q*22, yy=218+Math.sin(t+.16)*q*20;a+=L(xx,yy,xx+Math.cos(t+1.3)*11,yy+Math.sin(t+1.3)*11,accent,2);}
  }
  a+=C(300,218,49,c,'stroke="#755e50" stroke-width="4"');for(let j=0;j<22;j++)a+=C(299+Math.sin(j*2.4)*j*1.5,218+Math.cos(j*2.4)*j*1.2,2,accent);return a;
 }
 let a=E(300,167,87,87,c)+E(300,225,69,58,accent);
 for(let j=0;j<8;j++){
  const t=j*Math.PI/4+.2,xx=300+Math.cos(t)*78,yy=257+Math.sin(t)*37;
  const x2=300+Math.cos(t)*181,y2=261+Math.sin(t)*127;
  a+=P("M"+xx+" "+yy+"Q"+(xx+Math.cos(t+.35)*90)+" "+(yy+Math.sin(t+.35)*96)+" "+x2+" "+y2,"none",'stroke="'+c+'" stroke-width="20" stroke-linecap="round"');
  for(let z=0;z<3;z++){const px=xx+(x2-xx)*(z+1)/4,py=yy+(y2-yy)*(z+1)/4;a+=C(px,py+9,5,"#e2b8a7");}
 }
 a+=E(266,184,17,23,"#ece4d6")+E(336,184,17,23,"#ece4d6")+C(268,182,8,"#323c40")+C(336,182,8,"#323c40");
 return a;
}
function resolve(id){
 const entry=SPEC[String(id)];
 if(!entry)return previous.resolve(id);
 const [family,kind,color,accent]=entry;
 const drawing=family==="plant"?plant(kind,color,accent):family==="shrub"?shrub(kind,color,accent):family==="tree"?tree(kind,color,accent):family==="grass"?grass(kind,color,accent):family==="bird"?bird(kind,color,accent):family==="insect"?insect(kind,color,accent):marine(kind,color,accent);
 const blue=family==="marine"||(["loon","goosander","redbreast","blackback","canadagoose"].includes(kind));
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="hg9" x1="0" x2="0" y1="0" y2="1"><stop stop-color="'+(blue?"#e5f2f0":"#fcf9ef")+'"/><stop offset="1" stop-color="'+(blue?"#c7e3e3":"#e6eee0")+'"/></linearGradient></defs><rect width="600" height="420" fill="url(#hg9)"/><path d="M0 402Q280 382 600 399V420H0Z" fill="'+(blue?"#9dbfc2":"#c3d4b9")+'" opacity=".65"/><g stroke-linecap="round" stroke-linejoin="round">'+drawing+'</g></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
window.HG_NATURE_ILLUSTRATIONS=Object.freeze({
 has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id))||previous.has(id),
 resolve,
 count:previous.count+Object.keys(SPEC).length
});
})();
