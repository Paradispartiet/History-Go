/* Nature atlas illustration batch 04: original schematic species/group studies, not diagnostic identification art. */
(function(){
"use strict";
const older=window.HG_NATURE_ILLUSTRATIONS;
if(!older || typeof older.resolve!=="function")return;
const SPEC={
 emne_flora_balderbra:["plant","mayweed","#f8f8f2"],
 emne_flora_bergmynte:["plant","oregano","#d68aaf"],
 emne_flora_bitterbergknapp:["plant","stonecrop","#edca48"],
 emne_flora_blaknapp:["plant","devilsbit","#879bca"],
 emne_flora_blodstorkenebb:["plant","cranesbill","#ba4f9e"],
 emne_flora_enghumleblom:["plant","avens","#c87a49"],
 emne_flora_engsmelle:["plant","bladder","#f6f0ee"],
 emne_flora_firkantperikum:["plant","stjohn","#e9bf37"],
 emne_flora_gjetertaske:["plant","shepherd","#f4f5ee"],
 emne_flora_groblad:["plant","plantain","#719a6c"],
 emne_flora_gulaks:["plant","sweetgrass","#c7ab59"],
 emne_flora_gullstjerne:["plant","yellowstar","#ebbf43"],
 emne_flora_hvitklover:["plant","whiteclover","#e9e7dd"],
 emne_flora_lungeurt:["plant","lungwort","#798fcb"],
 emne_flora_perleblomst:["plant","grapehyacinth","#607fbe"],
 emne_fauna_murerbie:["insect","masonbee","#c67d45"],
 emne_fauna_bladskjaererbie:["insect","leafcutter","#a77a4d"],
 emne_fauna_stokkmaur:["insect","carpenterant","#643e35"],
 emne_fauna_bille_langhornbiller_trebukker:["insect","longhorn","#8e5f40"],
 emne_fauna_bille_vannkalver:["insect","divingbeetle","#374a47"],
 emne_fauna_blomsterflue_vanlig:["insect","hoverfly","#e6b93f"],
 emne_fauna_sild:["fish","herring","#a9c5cf"],
 emne_fauna_makrell:["fish","mackerel","#668c91"],
 emne_fauna_blaaskjell:["marine","mussel","#344b68"],
 emne_fauna_sjokreps:["marine","langoustine","#d48766"],
 emne_fauna_spekkhogger:["marine","orca","#2e3f48"],
 emne_fauna_oter:["marine","otter","#7f6049"],
 emne_fauna_storstrandsnegl:["marine","whelk","#b59a75"],
 emne_fauna_smaaflekket_rodhai:["fish","catshark","#9b9984"],
 emne_fauna_vanlig_uer:["fish","redfish","#c9654e"]
};
const P=(d,fill,attrs="")=>'<path d="'+d+'" fill="'+fill+'" '+attrs+'/>';
const E=(x,y,rx,ry,fill,r=0,attrs="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+r+' '+x+' '+y+')" fill="'+fill+'" '+attrs+'/>';
const L=(x,y,X,Y,c="#5b785e",w=4)=>P("M"+x+" "+y+"L"+X+" "+Y,"none",'stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"');
const ring=(x,y,n,rad,rx,ry,c)=>{let s="";for(let i=0;i<n;i++){const a=2*Math.PI*i/n;s+=E(x+Math.sin(a)*rad,y-Math.cos(a)*rad,rx,ry,c,a*180/Math.PI);}return s;};
const dot=(x,y,r,c)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
function head(k,x,y,sc,c){
 let a="",r=22*sc;
 if(k==="mayweed"){a+=ring(x,y,16,25*sc,6*sc,23*sc,c)+dot(x,y,15*sc,"#d9b436");for(let i=0;i<10;i++)a+=dot(x-10*sc+(i%5)*5*sc,y-6*sc+Math.floor(i/5)*9*sc,1.6*sc,"#866e2a");}
 else if(k==="stonecrop"||k==="stjohn"||k==="yellowstar"){const n=k==="yellowstar"?6:5;a+=ring(x,y,n,19*sc,10*sc,(k==="yellowstar"?23:17)*sc,c)+dot(x,y,8*sc,"#cf9d2f");if(k==="stjohn")for(let i=0;i<14;i++){const t=i*.449;a+=L(x,y,x+Math.cos(t)*19*sc,y+Math.sin(t)*19*sc,"#8d6633",1);}}
 else if(k==="devilsbit"||k==="whiteclover"){a+=E(x,y,25*sc,22*sc,k==="whiteclover"?"#a4b395":"#829a7b");for(let i=0;i<26;i++){const t=i*2.399,rr=(i%4)*5*sc+7*sc;a+=E(x+Math.cos(t)*rr,y+Math.sin(t)*rr,4*sc,8*sc,c,t*180/Math.PI);}}
 else if(k==="grapehyacinth"){for(let i=0;i<21;i++){const row=Math.floor(i/5),pos=i%5,xx=x+(pos-2)*9*sc+row*2*sc,yy=y+row*12*sc;a+=E(xx,yy,6*sc,7*sc,i%4===0?"#92a5d5":c);a+=L(xx-3*sc,yy+4*sc,xx+3*sc,yy+4*sc,"#bfc4ea",1);}}
 else if(k==="sweetgrass"){for(let i=0;i<11;i++){const yy=y+i*9*sc,xx=x+Math.sin(i*1.1)*11*sc;a+=E(xx,yy,5*sc,10*sc,i%3===0?"#9f8a57":c,i*17);}}
 else if(k==="plantain"){a+=E(x,y+16*sc,13*sc,46*sc,"#7f946d");for(let i=0;i<30;i++){const yy=y-13*sc+i*3*sc;a+=L(x-10*sc,yy,x+12*sc,yy-2*sc,i%2?"#d1d4a9":"#a1b58a",1);}}
 else if(k==="shepherd"){a+=ring(x,y,4,7*sc,5*sc,9*sc,c)+dot(x,y,3*sc,"#e5c958");}
 else if(k==="lungwort"){a+=ring(x,y,5,16*sc,10*sc,17*sc,c)+dot(x-12*sc,y+18*sc,7*sc,"#c979a3")+dot(x,y,6*sc,"#f4e7bb");}
 else if(k==="oregano"){for(let i=0;i<18;i++)a+=dot(x+Math.cos(i*2.399)*(i%5)*5*sc,y+Math.sin(i*2.399)*(i%4)*6*sc,5*sc,i%3?"#c57d9e":c);}
 else if(k==="bladder"){a+=E(x,y+10*sc,13*sc,19*sc,"#99ab7e");a+=ring(x,y-13*sc,5,12*sc,7*sc,15*sc,c);}
 else if(k==="avens"){a+=ring(x,y,5,16*sc,10*sc,17*sc,c)+dot(x,y,9*sc,"#a36b47");}
 else if(k==="cranesbill"){a+=ring(x,y,5,21*sc,13*sc,19*sc,c)+dot(x,y,8*sc,"#ecd8ac");for(let i=0;i<5;i++){const t=i*1.256;a+=L(x,y,x+Math.cos(t)*24*sc,y+Math.sin(t)*24*sc,"#753d76",1.5);}}
 return a;
}
function plant(k,c){
 let a="";
 if(k==="plantain"){
  for(let i=0;i<9;i++){let x=178+i*30;a+=E(x,334,17,58,i%3?"#7b9b6e":"#8dae7c",(i-4)*10);a+=L(x,372,x+(i-4)*8,299,"#527950",2);}
 }
 if(k==="sweetgrass"){for(let i=0;i<20;i++){let x=130+i*17;a+=P("M300 396Q"+x+" "+(170+i%5*24)+" "+(x+15)+" 151","none",'stroke="'+(i%3?"#6a8e5d":"#a4a66b")+'" stroke-width="4"');}}
 for(let j=0;j<4;j++){
  const x=154+j*95,y=[145,184,111,164][j],sc=[1,.78,.72,.66][j];
  if(k==="sweetgrass"||k==="plantain"&&j>1)continue;
  a+=P("M"+x+" "+y+"Q"+(x+12)+" 301 "+(x+5)+" 391","none",'stroke="#67895c" stroke-width="5"');
  a+=E(x-22,306,30,11,k==="stonecrop"?"#9aa975":"#80a56d",-36)+E(x+21,341,29,11,"#6a985f",37);
  if(k==="whiteclover"){for(let t=0;t<3;t++){const dx=(t-1)*12;a+=E(x+dx,315-9*(t%2),12,13,"#85a66b",t*33);}}
  if(k==="lungwort"){for(let t=0;t<7;t++)a+=dot(x-26+(t%3)*18,307+Math.floor(t/3)*16,3,"#d9e3bb");}
  if(k==="bladder")a+=E(x,y+36,17,26,"#92b18a");
  if(k==="shepherd"){for(let t=0;t<6;t++){const yy=y+37+t*27;const xx=x+(t%2?15:-14);a+=P("M"+x+" "+yy+"L"+xx+" "+(yy-9)+"Q"+(xx+15)+" "+(yy-19)+" "+xx+" "+(yy+1)+"Z","#a9ae7e");}}
  if(k==="oregano")for(let t=0;t<7;t++)a+=E(x+(t%2?13:-12),y+27+t*22,15,8,"#7ba16d",t%2?28:-30);
  a+=head(k,x,y,sc,c);
 }
 return a;
}
function insect(k,c){
 if(k==="carpenterant"){
  let a=E(401,241,94,68,"#322b2a")+E(301,234,56,51,"#884a39")+E(211,220,47,43,"#38302e");
  for(let i=0;i<3;i++){a+=L(270+i*39,253,220+i*35,343,"#55403a",6)+L(295+i*38,250,369+i*36,336,"#55403a",6);}
  a+=L(179,191,150,155,"#46332f",4)+L(215,185,234,154,"#46332f",4)+dot(183,213,5,"#e6b88c");return a;
 }
 if(k==="divingbeetle"||k==="longhorn"){
  let a=E(304,239,k==="divingbeetle"?99:91,117,c,0,'stroke="#51483b" stroke-width="6"')+E(303,148,60,48,k==="divingbeetle"?"#3a514a":"#6c4a38");
  a+=L(303,174,303,349,"#4b4037",4);
  if(k==="divingbeetle"){a+=E(287,244,19,88,"#7c9691",-10,'opacity=".35"')+E(335,243,18,88,"#a5b9a9",14,'opacity=".3"');}
  for(let i=0;i<3;i++){a+=L(222,179+i*52,152,157+i*67,"#5b4a3c",5)+L(385,179+i*52,455,157+i*67,"#5b4a3c",5);}
  if(k==="longhorn"){a+=P("M272 127Q135 4 92 70M337 128Q457 6 523 55","none",'stroke="#5b4533" stroke-width="6"');for(let i=0;i<7;i++){a+=L(185+i*15,55+i*9,179+i*15,40+i*10,"#614831",2);}}
  return a+dot(281,130,5,"#171f20")+dot(327,130,5,"#171f20");
 }
 const hover=k==="hoverfly",leaf=k==="leafcutter";
 let a=E(357,238,119,69,hover?"#f0c64d":leaf?"#77745f":"#925f42",-7,'stroke="#554a3d" stroke-width="5"');
 if(hover){for(let i=0;i<4;i++)a+=P("M"+(294+i*36)+" 175Q"+(282+i*36)+" 236 "+(298+i*36)+" 303","none",'stroke="#343534" stroke-width="15"');}
 else{for(let i=0;i<4;i++)a+=P("M"+(302+i*31)+" 175Q"+(287+i*31)+" 236 "+(302+i*31)+" 302","none",'stroke="'+(leaf?"#c7a574":"#d5aa60")+'" stroke-width="17"');}
 a+=E(240,216,53,51,hover?"#bc8b43":leaf?"#777361":"#c77b45");
 a+=E(325,142,96,30,"#dcebe7",-25,'opacity=".8" stroke="#a1b9b4" stroke-width="2"')+E(379,151,87,28,"#d9e9e5",22,'opacity=".76" stroke="#a1b9b4" stroke-width="2"');
 for(let i=0;i<3;i++){a+=L(273+i*47,287,251+i*50,339,"#55493a",5)+L(315+i*44,287,341+i*45,337,"#55493a",5);}
 a+=dot(214,208,6,"#22272a")+L(207,175,191,152,"#51453b",3);
 if(k==="masonbee")a+=E(454,249,15,29,"#c99568");
 if(k==="leafcutter")a+=E(431,251,25,46,"#dfccae");
 return a;
}
function fish(k,c){
 const shark=k==="catshark",red=k==="redfish",mackerel=k==="mackerel";
 let a="";
 a+=P("M453 230L548 153L537 315Z",c,'stroke="#607982" stroke-width="4"');
 a+=P("M178 228Q270 "+(shark?158:174)+" 457 224Q492 258 453 281Q306 316 178 260L104 243Z",c,'stroke="#55737b" stroke-width="5"');
 a+=P("M299 183L"+(shark?"337 117 355 191":red?"316 107 384 195":"335 137 376 199")+"Z",c,'stroke="#617c78" stroke-width="4"');
 a+=P("M300 270L364 330L378 276Z",c);
 a+=E(165,227,8,8,"#1c2f39")+dot(163,225,2,"#fff");
 a+=P("M110 245Q144 250 165 241","none",'stroke="#69828b" stroke-width="3"');
 if(k==="herring")a+=P("M178 221Q312 200 459 227","none",'stroke="#eff4ee" stroke-width="16" opacity=".8"');
 if(mackerel){a+=P("M160 229Q284 160 456 223Q345 224 181 237Z","#427b83");for(let i=0;i<12;i++)a+=P("M"+(202+i*19)+" "+(193+i%3*4)+"l-8 31 23 -12","none",'stroke="#273f57" stroke-width="4"');}
 if(shark){for(let i=0;i<38;i++)a+=E(190+(i*47)%267,212+(i*19)%56,3,3,"#615e50");a+=P("M198 247L164 261L184 246Z","#c3b7a0");}
 if(red){for(let i=0;i<11;i++)a+=P("M"+(249+i*13)+" 176l6 -23 6 24Z","#d87b58");a+=E(226,244,67,42,"#d87e5a");}
 return a;
}
function marine(k,c){
 if(k==="orca"){
  return P("M77 227Q161 168 253 166L309 67L338 157Q439 161 509 228L550 254L486 272Q371 249 304 258L208 302L154 283L106 269Z",c)+
    P("M251 254Q305 204 383 229Q351 277 270 280Z","#f2f2ed")+
    E(180,208,25,11,"#f4f4ee",-20)+dot(146,223,4,"#e5ebe8")+
    P("M460 219L536 159L514 239L542 311L456 270Z",c);
 }
 if(k==="otter"){
  let a=P("M90 260Q156 205 256 205Q351 190 432 237Q481 264 548 258L541 287Q480 307 419 284Q312 348 214 313Q118 310 90 260Z",c);
  a+=E(169,243,59,47,"#7b5c45")+E(132,230,14,16,"#876a52")+E(209,257,40,28,"#d6b79a");
  a+=dot(143,230,6,"#252c2c")+dot(204,249,7,"#292b2a")+L(215,263,250,269,"#6e4e3b",3);
  a+=P("M263 302L244 348L290 349L313 315ZM402 280L416 330L455 315L449 269Z",c);return a;
 }
 if(k==="mussel"){
  let a=P("M300 95Q465 157 454 346Q300 396 158 348Q128 167 300 95Z",c,'stroke="#172d40" stroke-width="7"');
  for(let i=0;i<15;i++)a+=P("M300 100Q"+(143+i*22)+" 246 "+(166+i*19)+" "+(348-i%3*7),"none",'stroke="'+(i%3?"#617b91":"#99a1b4")+'" stroke-width="3" opacity=".58"');
  return a+E(307,105,18,12,"#a0a9b5");
 }
 if(k==="whelk"){
  let a=P("M318 68Q429 93 447 190Q456 271 370 310L395 352L353 366L313 329Q198 342 162 284Q129 187 209 136Q258 100 318 68Z",c,'stroke="#796750" stroke-width="6"');
  for(let i=0;i<6;i++)a+=P("M"+(235+i*23)+" "+(103+i%2*11)+"Q"+(160+i*12)+" "+(221+i*8)+" "+(221+i*20)+" "+(307-i%3*7),"none",'stroke="#d6c5a4" stroke-width="4"');
  return a+P("M333 151C273 124 218 173 243 245C272 305 353 280 356 215C357 176 315 174 298 206C288 232 307 248 325 237","none",'stroke="#695947" stroke-width="11" stroke-linecap="round"');
 }
 let a=P("M250 210Q337 182 449 227L516 244L445 263Q340 297 252 268Z",c,'stroke="#ab684b" stroke-width="4"')+E(203,236,60,47,c);
 for(let i=0;i<7;i++){const xx=280+i*25;a+=P("M"+xx+" 266Q"+(xx+18)+" 301 "+(xx+5)+" 326","none",'stroke="#bd7155" stroke-width="4"');}
 for(let i=0;i<5;i++)a+=P("M176 "+(235+i*7)+"Q100 "+(183+i*15)+" "+(87-i*7)+" "+(155+i*12),"none",'stroke="#d69b80" stroke-width="3"');
 a+=P("M207 237Q115 175 111 126L86 119L105 163L76 177L139 227","none",'stroke="#c97c5e" stroke-width="8"');
 a+=P("M210 246Q116 305 100 358L76 365L107 323L75 308L150 260","none",'stroke="#c97c5e" stroke-width="8"');
 return a+dot(188,225,5,"#1d2527");
}
function resolve(id){
 const spec=SPEC[String(id)];if(!spec)return older.resolve(id);
 const [family,kind,color]=spec;
 const art=family==="plant"?plant(kind,color):family==="insect"?insect(kind,color):family==="fish"?fish(kind,color):marine(kind,color);
 const sea=family==="fish"||family==="marine"&&kind!=="otter";
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="'+(sea?"#e7f3f0":"#faf7eb")+'"/><stop offset="1" stop-color="'+(sea?"#9cc4c9":"#e2ebd9")+'"/></linearGradient></defs><rect width="600" height="420" fill="url(#bg)"/><path d="M0 394Q300 371 600 391V420H0Z" fill="'+(sea?"#80aeb4":"#c9dabe")+'" opacity=".5"/><g stroke-linejoin="round" stroke-linecap="round">'+art+'</g></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
window.HG_NATURE_ILLUSTRATIONS=Object.freeze({has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id))||older.has(id),resolve,count:older.count+Object.keys(SPEC).length});
})();
