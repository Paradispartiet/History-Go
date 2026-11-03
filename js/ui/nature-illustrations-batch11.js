/* History Go – Nature Atlas / batch 11. Original schematic SVGs; not taxonomic identification keys. */
(function(){
"use strict";
const prior=window.HG_NATURE_ILLUSTRATIONS;if(!prior||typeof prior.resolve!=="function")return;
const SPEC={
 emne_kratt_svarthyll:["shrub","elder","#3e3b57","#6b9664"],
 emne_kratt_mahonia:["shrub","mahonia","#ebcc55","#5d976c"],
 emne_kratt_hassel:["shrub","hazel","#b28e62","#7b9f68"],
 emne_kratt_syrin:["shrub","lilac","#b38dc3","#719d6a"],
 emne_kratt_villrose:["shrub","rose","#df8fa2","#78a16f"],
 emne_mose_etasjemose:["moss","stair","#68986b","#a9c692"],
 emne_mose_bjornemose:["moss","haircap","#659265","#b4c189"],
 emne_mose_putemose:["moss","cushion","#8bab76","#c2d7a9"],
 emne_mose_hvitmose:["moss","sphagnum","#b8cdb3","#d6ddbe"],
 emne_lav_kartlav:["lichen","map","#e5b74f","#a3a68b"],
 emne_lav_begerlav:["lichen","cup","#9caf91","#c0c2ac"],
 emne_lav_gubbeskjegg:["lichen","beard","#b5c6a6","#91a78d"],
 emne_ved_edelgran:["tree","fir","#3c7958","#809f70"],
 emne_ved_hageeple:["tree","apple","#d64b44","#79a06d"],
 emne_bregne_bjonnkam:["fern","fern","#649469","#a3bd90"],
 emne_fauna_baandblomsterfluer:["fly","hover","#e7c650","#3b4241"],
 emne_fauna_husflue:["fly","house","#7c8787","#5f6667"],
 emne_fauna_klegg:["fly","horse","#a0866c","#676460"],
 emne_fauna_rosenbladlus:["bug","aphid","#83aa67","#527e56"],
 emne_fauna_tege_gronn_stinktege:["bug","shield","#6ba165","#b5b879"],
 emne_fauna_sikade_skumsikader:["bug","froghopper","#a98b64","#6f7b60"],
 emne_fauna_odonata_bla_vannymfer:["odonata","damselfly","#5b9fb9","#3f6882"],
 emne_fauna_odonata_rode_libeller:["odonata","dragonfly","#c76043","#d3a26c"],
 emne_fauna_bille_brodbiller:["beetle","drugstore","#91664a","#b3987c"],
 emne_fauna_graveveps:["wasp","digger","#e3bb4a","#363e3e"],
 emne_fauna_lyresjomus:["marine","urchin","#c39c80","#e2c5a9"],
 emne_fauna_raudaate:["marine","copepod","#c57873","#ead1c8"],
 emne_fauna_langarmet_slangestjerne:["marine","star","#a9947d","#d7bda4"],
 emne_fauna_mendicula_ferruginosa:["marine","bivalve","#ceb3a3","#8f7c72"],
 emne_fauna_nephtys_hystricis:["marine","worm","#b38278","#d8b5a5"]
};
const P=(d,f,a="")=>'<path d="'+d+'" fill="'+f+'" '+a+'/>';
const E=(x,y,rx,ry,f,r=0,a="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+r+' '+x+' '+y+')" fill="'+f+'" '+a+'/>';
const C=(x,y,r,f)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"/>';
const L=(x,y,u,v,c="#668c63",w=4)=>P("M"+x+" "+y+"L"+u+" "+v,"none",'stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"');
function petal(x,y,col,r=20,n=5){let a="";for(let j=0;j<n;j++){const t=j*2*Math.PI/n;a+=E(x+Math.sin(t)*r*.65,y+Math.cos(t)*r*.65,r*.4,r*.64,col,t*180/Math.PI);}return a+C(x,y,r*.27,"#e6bf69");}
function leaf(x,y,s,c,r=17){return P("M"+x+" "+y+"Q"+(x+s*r)+" "+(y-r*1.6)+" "+(x+s*r*2.3)+" "+(y-r*.2)+"Q"+(x+s*r)+" "+(y+r)+" "+x+" "+y+"Z",c,'stroke="#638b5a" stroke-width="1.5"')+L(x,y,x+s*r*1.8,y-r*.25,"#638b5a",1);}
function flora(k,c,g,family){
 let a="";
 if(family==="shrub"){
  a=P("M299 396Q306 252 291 145M291 323Q186 202 113 179M297 294Q386 207 484 153M297 359Q176 318 98 263M300 354Q430 310 519 259","none",'stroke="#846c51" stroke-width="9"');
  for(let j=0;j<44;j++){const t=j*2.4,rad=32+(j%6)*18,x=Math.round(299+Math.cos(t)*rad*1.6),y=Math.round(222+Math.sin(t)*rad*.81);
   a+=k==="mahonia"?P("M"+x+" "+y+"l10 -20 17 5 14 -9 -6 24 -30 10Z",g,'stroke="#5b7d5b" stroke-width="2"'):E(x,y,k==="hazel"?24:18,k==="hazel"?15:12,g,j*31%165);
  }
  for(let j=0;j<21;j++){const t=j*2.399,x=299+Math.cos(t)*(44+(j%5)*26)*1.52,y=211+Math.sin(t)*(44+(j%5)*26)*.76;
   if(k==="elder")a+=C(x,y,8,c)+C(x+11,y+7,7,"#434056")+C(x-9,y+5,7,"#37384d");
   else if(k==="mahonia")a+=j%3?C(x,y,9,"#4d516e"):petal(x,y,c,10,6);
   else if(k==="hazel")a+=E(x,y,7,22,c,15);
   else if(k==="lilac")for(let q=0;q<3;q++)a+=petal(x+(q-1)*12,y+(q%2)*9,c,9,4);
   else a+=petal(x,y,c,22,5);
  }return a;
 }
 if(family==="moss"){
  if(k==="cushion"){for(let j=0;j<12;j++){const x=65+j*42,y=337+(j%3)*11;a+=E(x,y,39,27,j%2?c:g);for(let q=0;q<8;q++)a+=L(x+(q%4-1)*14,y,x+(q%4-1)*14,y-15-(q%3)*8,"#729773",2);}return a;}
  for(let j=0;j<15;j++){const x=55+j*34,top=165+j%4*26;a+=L(x,390,x,top,"#729564",4);
   for(let q=0;q<8;q++){const y=top+q*22,s=q%2?1:-1;
    a+=k==="haircap"?L(x,y,x+s*26,y-11,g,3):E(x+s*13,y,12,8,k==="sphagnum"?g:c,s*24);
    if(k==="stair")a+=E(x-s*10,y+9,12,7,g,-s*34);
   }
   if(k==="haircap")a+=E(x+8,top-30,5,14,"#ae8666");
  }return a;
 }
 if(family==="lichen"){
  if(k==="beard"){a+=P("M79 79Q297 101 518 79","none",'stroke="#756e5d" stroke-width="12"');
   for(let j=0;j<25;j++){const x=102+j*16,y=240+(j%6)*22;
    a+=P("M"+x+" 89Q"+(x-25)+" 158 "+(x+7)+" "+y+"Q"+(x+27)+" "+(y+12)+" "+x+" "+(y+25),"none",'stroke="'+(j%2?c:g)+'" stroke-width="'+(j%3+3)+'" stroke-linecap="round"');
   }return a;
  }
  a+=P("M55 332Q65 203 183 209Q287 131 369 199Q493 168 543 281L543 373H55Z","#b1b3a3",'stroke="#939b8c" stroke-width="5"');
  for(let j=0;j<30;j++){const x=92+(j*41)%430,y=224+(j*47)%123;
   if(k==="map")a+=P("M"+x+" "+y+"q18 -15 30 1q17 11 1 25q-25 10 -31 -26Z",c,'stroke="#e9d67e" stroke-width="2"');
   else {a+=L(x,y+33,x,y-7,c,5);a+=E(x,y-12,13,5,g,0,'stroke="#708d70" stroke-width="2"');}
  }return a;
 }
 if(family==="tree"){
  a=P("M286 396L292 136L311 135L319 396Z","#896c53",'stroke="#695541" stroke-width="5"');
  if(k==="fir"){for(let j=0;j<8;j++){const y=63+j*37,r=32+j*21;a+=P("M300 "+y+"L"+(300-r)+" "+(y+79)+"Q300 "+(y+66)+" "+(300+r)+" "+(y+79)+"Z",j%2?c:g,'stroke="#3d7256" stroke-width="3"');}return a;}
  a+=P("M303 243Q231 170 175 164M309 228Q398 153 478 165","none",'stroke="#84694d" stroke-width="10"');
  for(let j=0;j<50;j++){const t=j*2.399,r=35+(j%6)*19,x=301+Math.cos(t)*r*1.3,y=188+Math.sin(t)*r*.73;a+=E(x,y,27,17,g,j*37%170);}
  for(let j=0;j<21;j++){const x=155+(j*51)%300,y=133+(j*37)%112;a+=j%4===0?petal(x,y,"#f8eee5",14):C(x,y,11,c);}
  return a;
 }
 // Fern: narrow, pointed evergreen leaf fronds on a basal rosette.
 for(let j=0;j<9;j++){const tip=115+j*43;a+=P("M300 394Q"+(tip-60)+" 250 "+tip+" 96","none",'stroke="#668e62" stroke-width="5"');
  for(let q=0;q<14;q++){const t=q/14,x=300+(tip-300)*(1-t),y=394+(96-394)*(1-t),s=q%2?1:-1,r=16+16*(1-Math.abs(.5-t));a+=leaf(x,y,s,q%3?c:g,r);}
 }
 return a;
}
function fly(k,c,g){let a=E(345,245,k==="horse"?125:109,70,k==="hover"?c:g,-4,'stroke="#5e6057" stroke-width="4"')+E(214,218,54,50,g);
 if(k==="hover")for(let j=0;j<4;j++)a+=P("M"+(260+j*42)+" 197q-12 45 2 94","none",'stroke="#303c3d" stroke-width="17"');
 else for(let j=0;j<6;j++)a+=L(277+j*29,193,281+j*29,291,c,3);
 a+=E(308,153,87,29,"#dce9e8",-30,'stroke="#9ab9bd" stroke-width="3" opacity=".77"')+E(377,151,92,29,"#e5efec",25,'stroke="#9ab9bd" stroke-width="3" opacity=".76"');
 for(let j=0;j<3;j++){a+=L(263+j*49,279,211+j*59,354,"#5c5852",4)+L(276+j*52,285,324+j*57,360,"#5c5852",4);}
 a+=E(193,198,23,29,k==="horse"?"#9c705d":"#9a6153")+E(234,198,23,29,k==="horse"?"#9c705d":"#9a6153");
 return a+C(190,197,7,"#253035")+C(228,197,7,"#253035");
}
function bug(k,c,g){
 if(k==="shield"){let a=P("M187 149Q299 99 414 151L458 236Q437 323 301 383Q160 326 142 239Z",c,'stroke="#527a59" stroke-width="6"')+
 P("M213 183L388 183L300 271Z","#a7c28b",'stroke="#64855e" stroke-width="4"');
 for(let s of [-1,1])for(let j=0;j<3;j++)a+=L(301+s*97,210+j*42,301+s*173,177+j*54,"#5c855c",5);
 return a+L(280,151,246,101,"#628d65",4)+L(317,151,347,99,"#628d65",4)+C(268,167,7,"#2a3634")+C(331,167,7,"#2a3634");
 }
 let a=E(350,241,k==="aphid"?106:124,k==="aphid"?75:65,c)+E(226,213,52,44,g);
 for(let j=0;j<3;j++){a+=L(265+j*51,273,225+j*59,350,g,4)+L(285+j*48,270,330+j*57,355,g,4);}
 if(k==="aphid"){a+=L(404,191,429,156,c,8)+L(378,182,393,146,c,8);
  for(let j=0;j<12;j++)a+=E(298+(j*31)%100,198+(j*23)%70,5,7,"#b6d79c");
 }else{a+=P("M261 178Q342 144 439 210L371 244L286 225Z","#bca984",'stroke="#8a765d" stroke-width="2"');}
 return a+C(202,201,6,"#2b3734")+L(201,177,172,139,c,3)+L(233,174,247,139,c,3);
}
function dragon(k,c,g){
 const thin=k==="damselfly";let a=E(299,248,thin?13:22,112,c)+E(299,136,34,29,g);
 for(let j=0;j<9;j++)a+=L(287,202+j*13,312,202+j*13,"#9db9b1",2);
 for(let s of [-1,1])for(let j=0;j<2;j++){a+=E(299+s*119,169+j*41,thin?113:131,thin?19:28,"#d7e9eb",s*(j?18:-23),'opacity=".81" stroke="#9dbfc4" stroke-width="3"');}
 for(let i=0;i<3;i++){a+=L(279,152+i*20,235,173+i*33,g,3)+L(324,153+i*19,370,174+i*33,g,3);}
 return a+C(286,128,11,"#c5dddb")+C(315,128,11,"#c5dddb");
}
function beetle(c,g){
 let a=E(303,257,102,127,c,0,'stroke="#5d4940" stroke-width="5"')+E(302,156,74,51,g)+E(303,96,43,36,c);
 for(let j=0;j<3;j++){let y=190+j*53;a+=L(240,y,136-j*10,y-52,g,8)+L(369,y,472+j*10,y-52,g,8);}
 a+=L(302,161,302,376,"#624736",3)+L(283,72,250,36,"#7f614c",3)+L(324,72,367,40,"#7f614c",3);
 for(let j=0;j<26;j++){let x=249+(j%4)*35,y=185+Math.floor(j/4)*30;a+=L(x,y,x+8,y+13,g,2);}
 return a+C(277,90,4,"#eee6d7");
}
function wasp(c,g){
 let a=E(363,250,123,39,g,-9)+E(227,217,48,42,g)+P("M255 219Q280 207 306 232","none",'stroke="#4e5248" stroke-width="9"');
 for(let j=0;j<5;j++)a+=P("M"+(296+j*31)+" 219Q"+(286+j*31)+" 260 "+(300+j*31)+" 277","none",'stroke="'+c+'" stroke-width="12"');
 a+=E(319,146,88,25,"#e0edeb",-27,'opacity=".75" stroke="#9fbfbd" stroke-width="3"')+E(377,145,91,26,"#e4f0ee",24,'opacity=".75" stroke="#9fbfbd" stroke-width="3"');
 for(let j=0;j<3;j++){a+=L(269+j*47,283,213+j*54,351,g,4)+L(285+j*47,283,331+j*55,357,g,4);}
 return a+L(210,180,185,148,g,3)+L(237,180,248,148,g,3)+C(202,202,6,"#293334");
}
function marine(k,c,g){
 if(k==="star"){let a="";
  for(let j=0;j<5;j++){const t=j*2*Math.PI/5-.95,xx=300+Math.cos(t)*215,yy=217+Math.sin(t)*168;
   a+=P("M300 218Q"+(300+Math.cos(t+.16)*124)+" "+(218+Math.sin(t+.16)*108)+" "+xx+" "+yy,"none",'stroke="'+c+'" stroke-width="14" stroke-linecap="round"');
   for(let q=1;q<8;q++){const x=300+Math.cos(t+.12)*q*25,y=218+Math.sin(t+.12)*q*23;a+=L(x,y,x+Math.cos(t+1.6)*12,y+Math.sin(t+1.6)*12,g,2);}
  }return a+C(300,218,43,c);
 }
 if(k==="urchin"){let a=E(301,234,124,104,c,0,'stroke="#957f69" stroke-width="5"');
  for(let j=0;j<68;j++){const t=j*2.399,rr=25+(j%6)*17,x=301+Math.cos(t)*rr,y=234+Math.sin(t)*rr*.86;a+=L(x,y,x+Math.cos(t)*34,y+Math.sin(t)*30,g,2.5);}
  return a;
 }
 if(k==="bivalve"){let a=P("M300 372Q149 295 135 222Q136 155 223 155Q263 103 300 148Q346 112 393 149Q484 150 466 243Q439 325 300 372Z",c,'stroke="#9d8575" stroke-width="6"');
  for(let s of [-1,1])for(let j=1;j<=8;j++)a+=P("M299 359Q"+(300+s*j*19)+" 269 "+(300+s*j*22)+" 168","none",'stroke="'+(j%2?g:"#f1e0cc")+'" stroke-width="3"');return a;
 }
 if(k==="copepod"){let a=E(302,196,48,79,c);
  for(let j=0;j<10;j++){const y=248+j*13;a+=E(303,y,43-j*3.7,13,j%2?c:g);
   if(j<7)for(let s of [-1,1])a+=L(303+s*(36-j*2),y,303+s*(80-j*2),y+20,g,2);}
  a+=P("M282 135Q194 62 159 85M322 135Q411 61 441 91","none",'stroke="#ba8a7c" stroke-width="4"');
  return a+C(285,182,8,"#333a3e")+C(320,182,8,"#333a3e");
 }
 let a="";for(let j=0;j<21;j++){const x=76+j*22,y=239+Math.sin(j*.31)*37;
  a+=E(x,y,20,29,j%3?c:g,j*4,'stroke="#a77e72" stroke-width="1.5"');
  for(let s of [-1,1]){a+=L(x,y+s*22,x+12,y+s*54,g,2);a+=L(x-7,y+s*20,x-16,y+s*42,"#b48e83",2);}
 }
 return a+E(72,241,28,22,c)+C(64,237,4,"#2e383a");
}
function resolve(id){
 const entry=SPEC[String(id)];if(!entry)return prior.resolve(id);
 const [family,kind,c,g]=entry;
 const art=family==="shrub"||family==="moss"||family==="lichen"||family==="tree"||family==="fern"?flora(kind,c,g,family):
 family==="fly"?fly(kind,c,g):family==="bug"?bug(kind,c,g):family==="odonata"?dragon(kind,c,g):
 family==="beetle"?beetle(c,g):family==="wasp"?wasp(c,g):marine(kind,c,g);
 const water=family==="marine"||family==="odonata";
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="hg11" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+(water?"#eaf2f1":"#fbf8ee")+'"/><stop offset="1" stop-color="'+(water?"#c8e0e0":"#e4eedf")+'"/></linearGradient></defs><rect width="600" height="420" fill="url(#hg11)"/><path d="M0 399Q300 380 600 399V420H0Z" fill="'+(water?"#a4c8c9":"#bbd0ad")+'" opacity=".45"/><g stroke-linecap="round" stroke-linejoin="round">'+art+'</g></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
window.HG_NATURE_ILLUSTRATIONS=Object.freeze({has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id))||prior.has(id),resolve,count:prior.count+Object.keys(SPEC).length});
})();
