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
 emne_fauna_bille_neshornbille:["beetle","rhinoceros","#6d463b","#9b745b"],
 emne_fauna_bille_oldenborre:["beetle","chafer","#95744c","#c5a876"],
 emne_fauna_bille_langhornbiller_trebukker:["beetle","longhorn","#765443","#a48a69"],
 emne_fauna_bille_vannkalver:["beetle","diving","#3d5555","#71989b"],
 emne_fauna_bille_bladbiller:["beetle","leaf","#3d8c75","#95b7a0"],
 emne_fauna_trehumle:["bee","treebumble","#c18a56","#f2f0de"],
 emne_fauna_bladskjaererbie:["bee","leafcutter","#666257","#b9b29c"],
 emne_fauna_gul_engmaur:["ant","meadow","#c5a55a","#dbc983"],
 emne_fauna_stokkmaur:["ant","carpenter","#313a3e","#6d6357"],
 emne_fauna_sjoorre:["bird","scoter","#252d33","#e8e6db"],
 emne_fauna_lovsanger:["bird","warbler","#8c9d70","#e4e6c5"],
 emne_fauna_kattugle:["bird","owl","#897861","#dbc9a9"],
 emne_fauna_roye:["fish","char","#526e70","#de8164"],
 emne_fauna_al:["fish","eel","#756c4d","#a99a73"],
 emne_fauna_fossekall:["bird","dipper","#4b4842","#f2f1e7"]
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
 const long=k==="longhorn",horn=k==="rhinoceros",water=k==="diving",round=k==="leaf";
 let a="";
 for(let j=0;j<3;j++){let yy=176+j*63;
  a+=P("M252 "+yy+"Q183 "+(yy-16)+" "+(130-j*11)+" "+(yy-50),"none",'stroke="#454642" stroke-width="8" stroke-linecap="round"');
  a+=P("M351 "+yy+"Q415 "+(yy-24)+" "+(467+j*10)+" "+(yy-54),"none",'stroke="#454642" stroke-width="8" stroke-linecap="round"');
 }
 a+=E(301,261,round?105:horn?110:88,round?99:136,col,0,'stroke="#3a4040" stroke-width="5"');
 a+=E(302,150,horn?86:65,horn?59:50,col,0,'stroke="#454340" stroke-width="5"');
 a+=E(303,92,50,44,horn?"#4b3530":accent);
 a+=L(302,165,302,388,"#2d3736",4);
 for(let z=0;z<18;z++){const xx=247+(z%3)*51,yy=200+Math.floor(z/3)*31;a+=E(xx,yy,k==="leaf"?6:3.4,k==="leaf"?11:5.2,accent,(z*37)%165);}
 if(horn){a+=P("M291 72Q282 28 266 21Q309 27 331 88Z","#49352e",'stroke="#392f2e" stroke-width="4"');a+=P("M270 66Q255 33 230 29","none",'stroke="#58443b" stroke-width="9"');}
 if(long){a+=P("M273 76Q186 3 87 43M328 76Q428 -4 524 43","none",'stroke="#73634e" stroke-width="7" stroke-linecap="round"');for(let j=0;j<9;j++){a+=L(274-j*18,77-j*6,266-j*19,57-j*7,accent,2)+L(330+j*18,76-j*5,340+j*19,54-j*6,accent,2);}}
 else if(k==="chafer"){for(let z=0;z<6;z++){a+=E(260+z*7,53+z*2,21,6,"#a89268",z*12)+E(349-z*7,53+z*2,21,6,"#a89268",-z*12);}}
 else {a+=P("M269 69Q236 21 211 34M337 69Q369 25 393 35","none",'stroke="#5d6258" stroke-width="5"');}
 if(water){for(let j=0;j<3;j++){a+=E(159,240+j*41,45,8,"#7a9d9e",32)+E(443,240+j*41,45,8,"#7a9d9e",-32);}a+=E(279,244,23,96,"#afcfbe",-8,'opacity=".25"');}
 return a+C(283,86,5,"#e5e8d6")+C(324,86,5,"#e5e8d6");
}
function bee(k,col,accent){
 const leafcut=k==="leafcutter";
 let a=E(351,243,125,62,leafcut?"#69685b":"#383b3b",-5,'stroke="#565950" stroke-width="4"')+
  E(223,211,50,48,leafcut?"#665e53":"#bd8354",0,'stroke="#575149" stroke-width="4"');
 if(!leafcut){
  a+=P("M304 181Q294 246 313 299","none",'stroke="#b88452" stroke-width="31"');
  a+=E(450,250,25,46,"#f0eee1");
 }else{
  for(let j=0;j<6;j++)a+=E(315+j*26,267,9,15,"#d8ae64",j*29);
  a+=P("M188 241L161 256L186 218Z","#4d4a3d")+P("M241 246L255 269L238 216Z","#4d4a3d");
 }
 a+=E(324,146,88,29,"#dcece9",-26,'stroke="#99b8b3" stroke-width="3" opacity=".79"')+
 E(370,143,91,26,"#e0edec",24,'stroke="#99b8b3" stroke-width="3" opacity=".79"');
 for(let j=0;j<3;j++){a+=L(268+j*45,273,219+j*57,354,"#494c48",4)+L(279+j*49,273,319+j*53,354,"#494c48",4);}
 return a+C(204,203,7,"#292d30")+L(201,174,177,145,"#5b5145",3)+L(238,177,248,144,"#5b5145",3);
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
function bird(k,col,accent){
 if(k==="owl"){
  let a=E(307,240,124,149,col)+E(218,178,76,95,col,-18)+E(391,178,76,95,col,18);
  a+=E(240,177,66,75,"#c4b29a")+E(373,177,66,75,"#c4b29a");
  for(let x of [251,365]){a+=C(x,169,29,"#78664f")+C(x,169,19,"#252f32")+C(x-4,164,7,"#f2eee3");}
  a+=P("M301 197L283 218L312 239L323 213Z","#c89d54");
  for(let j=0;j<38;j++){const x=224+(j*41)%165,y=258+(j*23)%99;a+=E(x,y,8,20,j%3?accent:col,j*22);}
  return a+L(267,361,263,391,"#8b785b",8)+L(346,361,350,391,"#8b785b",8);
 }
 const duck=k==="scoter";
 let a=duck?P("M0 348Q280 328 600 345V420H0Z","#a9cbd0"):P("M79 361Q299 351 515 357","none",'stroke="#87725d" stroke-width="13"');
 a+=P("M360 233Q450 255 479 315L368 280Z",col);
 a+=E(305,238,duck?137:117,duck?80:75,col,-7,'stroke="#586459" stroke-width="4"');
 a+=E(329,236,83,41,k==="warbler"?"#859d75":col,-15);
 a+=E(193,161,duck?62:49,duck?58:46,col);
 if(k==="warbler"){a+=P("M153 148Q182 124 218 140","none",'stroke="#eae9ca" stroke-width="9"');a+=E(226,246,48,38,accent);}
 if(k==="dipper"){a+=E(250,237,69,56,"#f5f3eb",-11);a+=P("M142 150Q170 127 208 157","none",'stroke="#e1d9ca" stroke-width="4"');}
 if(duck){a+=P("M293 205Q344 190 402 225L375 253L309 253Z","#ecece8");a+=P("M142 162L77 176L146 201Z","#d6a56d");}
 else a+=P("M151 166L98 176L151 190Z","#a79866");
 a+=C(174,158,7,"#1e2b2c")+C(172,156,2,"#f7faf3");
 if(!duck){a+=L(276,291,268,358,"#746f5e",5)+L(346,284,347,357,"#746f5e",5);}
 else a+=E(304,335,122,9,"#8fbabd",0,'opacity=".55"');
 return a;
}
function fish(k,col,accent){
 if(k==="eel"){
  let a=P("M87 294Q147 162 263 216Q380 270 426 161Q470 74 515 158Q548 233 503 288Q481 304 456 281Q511 259 495 208Q479 163 450 215Q381 335 275 264Q151 181 87 294Z",col,'stroke="#615f4e" stroke-width="5"');
  a+=P("M165 235Q258 198 317 252T447 244","none",'stroke="#b6b18d" stroke-width="7"');
  return a+C(118,265,7,"#2b3230")+P("M106 276Q142 284 154 281","none",'stroke="#454641" stroke-width="3"');
 }
 let a=P("M78 234Q150 144 298 167Q412 162 482 234L558 179L532 246L558 320L473 272Q352 327 191 291Q104 287 78 234Z",col,'stroke="#56665f" stroke-width="5"');
 a+=P("M223 166L280 121L348 161M261 298L226 338L311 294M365 295L400 331L417 279","none",'stroke="#f4e7d6" stroke-width="8" stroke-linejoin="round"');
 a+=E(306,257,154,34,accent,-3,'opacity=".68"');
 for(let j=0;j<38;j++){const x=172+(j*43)%276,y=191+(j*31)%76;a+=E(x,y,4,6,j%4?"#f4ddbd":"#e3eee6",27);}
 a+=C(132,229,8,"#263438")+C(130,227,2,"#fcfbef");
 return a+P("M110 261Q136 271 162 264","none",'stroke="#566057" stroke-width="3"');
}
function resolve(id){
 const spec=SPEC[String(id)];if(!spec)return prior.resolve(id);
 const [family,form,color,accent]=spec;
 const drawing=family==="herb"?herb(form,color,accent):family==="shrub"?shrub(form,color,accent):
  family==="grass"?grass(form,color,accent):family==="beetle"?beetle(form,color,accent):
  family==="bee"?bee(form,color,accent):family==="ant"?ant(form,color,accent):
  family==="bird"?bird(form,color,accent):fish(form,color,accent);
 const water=form==="scoter"||form==="char"||form==="eel"||form==="dipper"||form==="diving"||form==="bottlesedge"||form==="soft-rush";
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="hg10" x1="0" x2="0" y1="0" y2="1"><stop stop-color="'+(water?"#e8f4f3":"#fbf9ed")+'"/><stop offset="1" stop-color="'+(water?"#c5dcdd":"#e0ebd9")+'"/></linearGradient></defs><rect width="600" height="420" fill="url(#hg10)"/><path d="M0 398Q290 383 600 398V420H0Z" fill="'+(water?"#9cbdc0":"#b6d0aa")+'" opacity=".48"/><g stroke-linecap="round" stroke-linejoin="round">'+drawing+'</g></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
window.HG_NATURE_ILLUSTRATIONS=Object.freeze({
 has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id))||prior.has(id),
 resolve,
 count:prior.count+Object.keys(SPEC).length
});
})();
