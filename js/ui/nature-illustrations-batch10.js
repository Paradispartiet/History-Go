/* History Go – Nature Atlas, illustration batch 10: 15 flora + 15 fauna.
 * Original schematic vector studies; images are not diagnostic identification keys.
 * Existing species and quiz data remain authoritative and unchanged.
 */
(function() {
"use strict";
const prior=window.HG_NATURE_ILLUSTRATIONS;
if(!prior||typeof prior.resolve!=="function")return;
const SPEC={
 emne_flora_aakersvineblom:["herb","ragwort","#e3c03c","#82986a"],
 emne_flora_russesvalerot:["herb","vine","#e7ded1","#709466"],
 emne_flora_legepestrot:["herb","butterbur","#dc9aab","#7c996a"],
 emne_flora_kirsebaerlaurbaer:["shrub","laurel","#f8f7e8","#427856"],
 emne_flora_hostberberis:["shrub","barberry","#c54b4b","#668e57"],
 emne_flora_blankmispel:["shrub","cotoneaster","#de6851","#477e52"],
 emne_flora_amerikahagtorn:["shrub","hawthorn","#f8f6ee","#678a5b"],
 emne_gress_engsvingel:["grass","meadowfescue","#999c72","#83a56d"],
 emne_gress_engrapp:["grass","bluegrass","#9ba98d","#79a16a"],
 emne_gress_kveke:["grass","couch","#b2ae7d","#7c9867"],
 emne_gress_rodsvingel:["grass","redfescue","#bb8c81","#809968"],
 emne_gress_raigras_plen:["grass","ryegrass","#bcae76","#75a26d"],
 emne_gress_hundesvingel_tuet:["grass","sheepfescue","#a5af91","#718d6f"],
 emne_siv_vassiv:["grass","soft-rush","#b29d74","#709771"],
 emne_starr_flaskestarr:["grass","bottlesedge","#ad8859","#648d66"],
 emne_fauna_bille_marihoner:["beetle","ladybird","#c94c3c","#343839"],
 emne_fauna_bille_kornbiller:["beetle","grain","#6b4a35","#9a7e5d"],
 emne_fauna_bille_vedbiller:["beetle","wood","#53463c","#98826d"],
 emne_fauna_bille_lovbiller:["beetle","leafdark","#567f7b","#94baa2"],
 emne_fauna_bille_bladbiller:["beetle","leaf","#3d8c75","#95b7a0"],
 emne_fauna_myriapoda_flate_tusenbein:["myriapod","flatmillipede","#836952","#b3a088"],
 emne_fauna_myriapoda_jord_hundrebein:["myriapod","centipede","#a78162","#cfb593"],
 emne_fauna_gul_engmaur:["ant","meadow","#c5a55a","#dbc983"],
 emne_fauna_roed_skogsmaur:["ant","woodant","#914736","#343838"],
 emne_fauna_isopoda_kule_skrukketroll:["isopod","pillbug","#747c7d","#b4c0b9"],
 emne_fauna_isopoda_flate_skrukketroll:["isopod","woodlouse","#998d7e","#cfbfa8"],
 emne_fauna_norsk_storkrill:["crustacean","krill","#bf8677","#a55251"],
 emne_fauna_brosme:["fish","tusk","#81755f","#c3b5a0"],
 emne_fauna_hvitting:["fish","whiting","#91a5af","#d5d9d4"],
 emne_fauna_faraomaur:["ant","pharaoh","#b79067","#dfc49a"]
};
const P=(d,c,extra="")=>'<path d="'+d+'" fill="'+c+'" '+extra+'/>';
const E=(x,y,rx,ry,c,rot=0,extra="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+rot+' '+x+' '+y+')" fill="'+c+'" '+extra+'/>';
const C=(x,y,r,c,extra="")=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'" '+extra+'/>';
const L=(x,y,x2,y2,c="#678e69",w=4)=>P("M"+x+" "+y+"L"+x2+" "+y2,"none",'stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"');
function flower(x,y,n,r,color,center="#ddba54"){
 let a="";for(let t=0;t<n;t++){const v=t*2*Math.PI/n;a+=E(x+Math.sin(v)*r*.64,y-Math.cos(v)*r*.64,r*.36,r*.66,color,v*180/Math.PI);}
 return a+C(x,y,r*.24,center);
}
function leaf(x,y,s,size,c="#7f9e70",gloss=false){
 const shape=P("M"+x+" "+y+"Q"+(x+s*size)+" "+(y-size)+" "+(x+s*2*size)+" "+(y-size*.2)+"Q"+(x+s*size*1.2)+" "+(y+size*.6)+" "+x+" "+y+"Z",c,'stroke="#56805c" stroke-width="1.6"');
 return shape+L(x,y,x+s*size*1.8,y-size*.19,gloss?"#c9d2a4":"#678c60",gloss?2:1.2);
}
function herb(k,col,green){
 let a="";
 if(k==="butterbur"){
  for(let j=0;j<3;j++){const x=165+j*134;
   a+=P("M"+x+" 399Q"+(x-17)+" 302 "+x+" 153","none",'stroke="#819a74" stroke-width="9"');
   a+=P("M"+x+" 298Q"+(x-114)+" 219 "+(x-105)+" 137Q"+(x-28)+" 96 "+(x+44)+" 141Q"+(x+97)+" 211 "+x+" 298Z","#99b17a",'stroke="#6b8d62" stroke-width="4"');
   for(let r=0;r<5;r++)a+=L(x,282,x-79+r*35,147+r%2*15,"#6c9464",2);
   for(let n=0;n<17;n++){const xx=x+(n%5-2)*12,yy=125+Math.floor(n/5)*21;a+=E(xx,yy,9,14,n%2?col:"#efc7cd",n*37);}
  }return a;
 }
 if(k==="vine"){
  a+=P("M64 376Q162 282 244 306T542 112","none",'stroke="#699569" stroke-width="8"');
  for(let j=0;j<7;j++){const x=91+j*74,y=359-j*32;
   a+=leaf(x,y,j%2?-1:1,19,green);
   for(let n=0;n<5;n++){const xx=x+(n%3-1)*12,yy=y-52+Math.floor(n/3)*18;a+=flower(xx,yy,5,9,col,"#d3bc89");}
   if(j%2===0)a+=P("M"+(x+15)+" "+(y-28)+"q21 18 32 38q-27 3 -32 -38Z","#acc096");
  }return a;
 }
 for(let j=0;j<5;j++){
  const x=125+j*87,top=110+j%3*29;
  a+=P("M"+x+" 397Q"+(x+16)+" 254 "+x+" "+top,"none",'stroke="#779365" stroke-width="6"');
  for(let z=0;z<3;z++){const y=276+z*32;a+=leaf(x,y,z%2?1:-1,20,green);}
  for(let z=0;z<4;z++){const xx=x+(z%2?1:-1)*16,yy=top+z*21;
   if(k==="ragwort")a+=flower(xx,yy,19,15,col,"#a98539");
  }
  if(k==="ragwort"){for(let z=0;z<6;z++){const t=z*Math.PI/3;a+=L(x,top-31,x+Math.sin(t)*19,top-31-Math.cos(t)*19,"#ebebdb",1);}}
 }
 return a;
}
function shrub(k,col,green){
 let a=P("M290 398Q299 252 285 143M298 336Q228 206 124 155M301 270Q399 171 478 119M293 355Q204 300 96 255M301 341Q415 278 515 259","none",'stroke="#75674d" stroke-width="9" stroke-linecap="round"');
 for(let j=0;j<40;j++){
  const t=j*2.3999,rr=25+(j%7)*15,x=Math.round(296+Math.cos(t)*rr*1.65),y=Math.round(227+Math.sin(t)*rr*.92);
  a+=leaf(x,y,j%2?1:-1,k==="laurel"?19:13,green,k==="laurel"||k==="cotoneaster");
 }
 for(let j=0;j<23;j++){
  const t=j*2.3999,rr=45+(j%4)*23,x=Math.round(297+Math.cos(t)*rr*1.72),y=Math.round(214+Math.sin(t)*rr*.9);
  if(k==="barberry"){a+=E(x,y,6,11,col,15)+L(x-7,y-7,x-18,y-26,"#98734b",2);}
  if(k==="cotoneaster"){a+=C(x,y,8,j%3?"#ce4c42":"#ac443d");}
  if(k==="hawthorn"){a+=flower(x,y,5,12,col,"#d9b255");if(j%3===0)a+=L(x+5,y+7,x+21,y+20,"#8b8161",2);}
  if(k==="laurel"){if(j%4===0){for(let z=0;z<6;z++)a+=flower(x+(z%2?8:-8),y-35+z*13,5,7,col,"#dad5a1");}else a+=C(x,y,4,"#514e56");}
 }
 return a;
}
function grass(k,col,green){
 let a="";
 const bunch=k==="sheepfescue",sedge=k==="bottlesedge",rush=k==="soft-rush",upright=k==="couch"||k==="ryegrass";
 for(let j=0;j<11;j++){
  const x=65+j*46,top=96+j%4*23;
  a+=P("M"+x+" 402Q"+(x-15+j%3*9)+" 285 "+(x+4)+" "+top,"none",'stroke="'+green+'" stroke-width="'+(bunch?2.1:rush?5:3.5)+'" stroke-linecap="round"');
  for(let z=0;z<3;z++){
   const side=z%2?1:-1,yy=300+z*28;
   a+=P("M"+x+" "+yy+"Q"+(x+side*31)+" "+(yy-60)+" "+(x+side*58)+" "+(yy-72)+"Q"+(x+side*29)+" "+(yy-34)+" "+x+" "+yy+"Z",green,'opacity=".88"');
  }
  if(bunch){for(let z=0;z<6;z++)a+=L(x,392,x+(z-3)*13,197+(z%3)*34,green,1.6);}
  else if(sedge){for(let z=0;z<3;z++)a+=E(x+z*5,top+z*25,11,25,z%2?"#988359":col,2,'stroke="#756e4d" stroke-width="1.7"');}
  else if(rush){a+=E(x+15,top+62,12,7,col,27);for(let z=0;z<5;z++)a+=L(x+15,top+63,x+2+z*6,top+25+z*5,col,2);}
  else if(upright){for(let z=0;z<7;z++){const yy=top+z*17;a+=E(x+(-1)**z*9,yy,15,5,col,(-1)**z*28);}}
  else{for(let z=0;z<8;z++){let dir=z%2?1:-1,xx=x+dir*(7+z*6), yy=top+z*10;a+=L(x,top+18,xx,yy,green,1.7)+E(xx,yy,12,5,col,z*18);}}
 }
 return a;
}
function beetle(k,col,accent){
 const round=k==="ladybird"||k==="leaf"||k==="leafdark",narrow=k==="grain"||k==="wood";
 let a="";
 for(let j=0;j<3;j++){const y=183+j*52;
  a+=P("M240 "+y+"Q180 "+(y-17)+" "+(126-j*7)+" "+(y-53),"none",'stroke="#50544a" stroke-width="8" stroke-linecap="round"');
  a+=P("M361 "+y+"Q421 "+(y-17)+" "+(474+j*7)+" "+(y-53),"none",'stroke="#50544a" stroke-width="8" stroke-linecap="round"');
 }
 a+=E(300,246,round?119:narrow?82:99,round?113:134,col,0,'stroke="#394543" stroke-width="5"');
 a+=L(300,149,300,358,"#323b3a",4);
 a+=E(300,151,round?83:70,55,k==="ladybird"?"#373c40":accent,0,'stroke="#414943" stroke-width="5"');
 a+=E(300,91,48,42,k==="ladybird"?"#3e4243":"#6b6257");
 a+=C(275,88,5,"#f7f6ea")+C(326,88,5,"#f7f6ea");
 if(k==="ladybird"){
  for(let j=0;j<7;j++){let x=245+(j%3)*55,y=196+Math.floor(j/3)*55;
   a+=C(x,y,12,"#282f32");}
  a+=C(301,313,13,"#282f32");
 }else if(k==="grain"){
  a+=P("M279 63Q265 21 291 8L308 8Q333 23 320 65Z","#77634a",'stroke="#4b493c" stroke-width="3"');
  for(let j=0;j<18;j++)a+=L(247+(j%3)*51,194+Math.floor(j/3)*30,254+(j%3)*51,208+Math.floor(j/3)*30,accent,2);
 }else if(k==="wood"){
  for(let j=0;j<16;j++)a+=P("M"+(243+(j%4)*34)+" "+(196+Math.floor(j/4)*36)+"q19 -10 29 2","none",'stroke="'+accent+'" stroke-width="4"');
  a+=P("M286 114L274 89M316 114L329 89","none",'stroke="#463b32" stroke-width="6"');
 }else {
  for(let j=0;j<16;j++){const x=237+(j%4)*43,y=191+Math.floor(j/4)*39;
   a+=E(x,y,8,13,j%3===0?"#bdd3b3":accent,17);}
  a+=E(269,250,28,90,"#bcd6cc",-10,'opacity=".25"');
 }
 a+=P("M266 65L230 35M333 65L373 32","none",'stroke="#575b51" stroke-width="4"');
 return a;
}
function ant(k,col,accent){
 let a=E(410,238,k==="carpenter"?94:75,k==="carpenter"?82:69,col)+
 E(298,229,39,30,accent)+E(212,219,k==="carpenter"?57:46,k==="carpenter"?52:43,col);
 for(let z=0;z<3;z++){
  a+=P("M"+(273+z*22)+" "+(210+z*11)+"Q"+(230+z*22)+" 154 "+(185+z*28)+" "+(124+z*6),"none",'stroke="'+col+'" stroke-width="6" stroke-linecap="round"');
  a+=P("M"+(280+z*26)+" "+(246+z*12)+"Q"+(232+z*34)+" 318 "+(182+z*40)+" 357","none",'stroke="'+col+'" stroke-width="6" stroke-linecap="round"');
 }
 a+=P("M192 196Q161 139 124 160M231 190Q227 132 272 128","none",'stroke="'+col+'" stroke-width="5"');
 for(let j=0;j<7;j++)a+=E(394+(j%3)*10,215+Math.floor(j/3)*15,5,6,accent);
 return a+C(195,215,5,"#efe6c9");
}
function myriapod(k,col,accent){
 const fast=k==="centipede",segments=fast?23:17,step=fast?16:19,headX=126;
 let a="";
 for(let j=0;j<segments;j++){
  const x=headX+j*step,y=230+Math.sin(j*.43)*31,w=fast?9:13;
  a+=E(x,y,w,fast?22:34,j%3===0?accent:col,j*2-10,'stroke="#675b4f" stroke-width="1.5"');
  for(const dir of [-1,1]){
   a+=P("M"+x+" "+(y+dir*13)+"Q"+(x+dir*11)+" "+(y+dir*43)+" "+(x+dir*5)+" "+(y+dir*(fast?73:54)),"none",'stroke="'+(fast?"#b99f7d":"#80664f")+'" stroke-width="'+(fast?3.7:3)+'" stroke-linecap="round"');
  }
 }
 const hy=230+Math.sin(0)*31;
 a+=E(headX-6,hy,21,21,col)+C(headX-16,hy-6,4,"#262c2d");
 a+=P("M"+(headX-20)+" "+hy+"Q"+(headX-55)+" "+(hy-45)+" "+(headX-77)+" "+(hy-30)+"M"+(headX-20)+" "+hy+"Q"+(headX-58)+" "+(hy+37)+" "+(headX-76)+" "+(hy+27),"none",'stroke="'+col+'" stroke-width="4"');
 return a;
}
function isopod(k,col,accent){
 const ball=k==="pillbug";
 let a="";
 if(ball){
  a+=E(304,238,132,129,col,0,'stroke="#57635f" stroke-width="5"');
  for(let j=0;j<8;j++){const x=213+j*27;
   a+=P("M"+x+" "+(148+Math.abs(j-4)*7)+"Q"+(x+13)+" 243 "+x+" "+(335-Math.abs(j-4)*8),"none",'stroke="'+accent+'" stroke-width="7"');
  }
  for(let j=0;j<6;j++)a+=C(265+(j%3)*30,178+Math.floor(j/3)*116,5,"#e3dfd3");
 }else{
  for(let j=0;j<10;j++){
   const x=135+j*34,y=237+Math.sin(j*.46)*21;
   a+=E(x,y,30,61,j%3?col:accent,5,'stroke="#726e61" stroke-width="4"');
   for(let d of [-1,1])a+=P("M"+x+" "+(y+d*36)+"Q"+(x+14)+" "+(y+d*82)+" "+(x+20)+" "+(y+d*97),"none",'stroke="#94877a" stroke-width="4"');
  }
  a+=E(136,227,40,42,"#7d796b")+C(123,211,5,"#222d2e")+C(156,211,5,"#222d2e");
  a+=L(119,218,83,178,"#827b68",3)+L(156,218,192,178,"#827b68",3);
 }
 return a;
}
function krill(col,accent){
 let a="";
 for(let j=0;j<11;j++){
  const x=161+j*26,y=240+Math.sin(j*.35)*10;
  a+=E(x,y,28-(j*.9),32-(j*.6),j%3?col:accent,-7,'stroke="#a3645f" stroke-width="2"');
  for(let d of [-1,1]){
   a+=L(x,y+d*20,x+18,y+d*(59+j%3*11),accent,2);
  }
 }
 a+=E(144,219,44,38,col,-18)+C(135,212,11,"#272e30")+C(131,208,4,"#e9e8e3");
 a+=P("M119 219Q64 137 27 150M125 220Q52 201 21 243","none",'stroke="#a86b64" stroke-width="3"');
 a+=P("M429 247L511 203L472 258L519 298Z",col,'stroke="#a66e65" stroke-width="3"');
 return a;
}
function fish(k,col,accent){
 const tusk=k==="tusk";
 let a=P("M80 245Q167 165 303 168Q417 160 491 228L559 181L535 245L559 318L486 276Q343 316 189 299Q104 286 80 245Z",col,'stroke="#59665f" stroke-width="5"');
 if(tusk){
  a+=P("M181 190Q250 119 322 146Q397 145 478 219L473 229Q351 170 181 190Z","#666e60");
  a+=P("M174 295Q235 352 317 300","none",'stroke="#c3bba0" stroke-width="8"');
  a+=P("M121 278Q110 310 120 316","none",'stroke="#81765a" stroke-width="4"');
 }else{
  for(let j=0;j<3;j++)a+=P("M"+(197+j*71)+" 177q22 -48 59 -29l-8 47Z","#879da4",'stroke="#6e8e94" stroke-width="3"');
  a+=E(267,264,103,33,"#e3e6df",-2,'opacity=".63"');
  a+=C(258,237,13,"#3a4342");
 }
 for(let j=0;j<28;j++)a+=E(181+(j*43)%277,204+(j*23)%62,3.2,2.1,j%2?accent:"#e6ddd0",j*13);
 a+=C(132,231,8,"#202f31")+C(131,229,2.3,"#fff");
 return a+P("M104 264Q133 274 159 266","none",'stroke="#61685d" stroke-width="3"');
}
function resolve(id){
 const spec=SPEC[String(id)];if(!spec)return prior.resolve(id);
 const [family,form,color,accent]=spec;
 const drawing=family==="herb"?herb(form,color,accent):family==="shrub"?shrub(form,color,accent):
  family==="grass"?grass(form,color,accent):family==="beetle"?beetle(form,color,accent):
  family==="myriapod"?myriapod(form,color,accent):family==="isopod"?isopod(form,color,accent):
  family==="crustacean"?krill(color,accent):family==="ant"?ant(form,color,accent):fish(form,color,accent);
 const water=form==="tusk"||form==="whiting"||form==="krill"||form==="bottlesedge"||form==="soft-rush";
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="hg10" x1="0" x2="0" y1="0" y2="1"><stop stop-color="'+(water?"#e8f4f3":"#fbf9ed")+'"/><stop offset="1" stop-color="'+(water?"#c5dcdd":"#e0ebd9")+'"/></linearGradient></defs><rect width="600" height="420" fill="url(#hg10)"/><path d="M0 398Q290 383 600 398V420H0Z" fill="'+(water?"#9cbdc0":"#b6d0aa")+'" opacity=".48"/><g stroke-linecap="round" stroke-linejoin="round">'+drawing+'</g></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
window.HG_NATURE_ILLUSTRATIONS=Object.freeze({
 has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id))||prior.has(id),
 resolve,
 count:prior.count+Object.keys(SPEC).length
});
})();
