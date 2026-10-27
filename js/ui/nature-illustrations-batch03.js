/* Nature atlas illustration batch 03. Original schematic SVGs; not an identification guide. */
(function(){
"use strict";
const older=window.HG_NATURE_ILLUSTRATIONS;
if(!older||typeof older.resolve!=="function")return;
const SPEC={
 emne_ved_hassel:["tree","hazel","#789655"],emne_ved_alm:["tree","elm","#73935d"],
 emne_ved_svartor:["tree","blackAlder","#4b7356"],emne_ved_lerk:["tree","larch","#81a766"],
 emne_ved_sotkirsebaer:["tree","cherry","#619359"],emne_ved_barlind:["tree","yew","#3f6a4b"],
 emne_ved_hvitpil:["tree","willow","#92ad70"],emne_ved_hagtorn_treform:["tree","hawthorn","#73945b"],
 emne_flora_forglemmegei:["flower","forgetMeNot","#83b4dc"],emne_flora_skogstorkenebb:["flower","cranesbill","#a477c5"],
 emne_flora_snoklokke:["flower","snowdrop","#f7f8f0"],emne_flora_engkarse:["flower","cuckooFlower","#e6daeb"],
 emne_flora_tveskjeggveronika:["flower","speedwell","#668fc7"],emne_flora_rodknapp:["flower","knapweed","#b86598"],
 emne_flora_rynkerose:["flower","rugosaRose","#cd6997"],
 emne_fauna_kattugle:["bird","owl","#947452"],emne_fauna_lovsanger:["bird","warbler","#80976b"],
 emne_fauna_rodvingetrost:["bird","redwing","#795d51"],emne_fauna_roedstilk:["bird","redshank","#9f907a"],
 emne_fauna_aerfugl:["bird","eider","#f4f1e4"],emne_fauna_havoern:["bird","eagle","#765c4d"],
 emne_fauna_gulsanger:["bird","icterine","#b6af63"],emne_fauna_jernspurv:["bird","dunnock","#7e7775"],
 emne_fauna_bille_oldenborre:["insect","cockchafer","#9d6f4c"],
 emne_fauna_bille_neshornbille:["insect","rhinoceros","#87533b"],
 emne_fauna_bille_sankthansoldenborre:["insect","juneBeetle","#926b4f"],
 emne_fauna_aakerhumle:["insect","fieldBumblebee","#e3bc4d"],
 emne_fauna_trehumle:["insect","treeBumblebee","#b87144"],
 emne_fauna_tysk_veps:["insect","germanWasp","#eac03e"],
 emne_fauna_humleblomsterfluer:["insect","hoverfly","#d2aa45"]
};
const P=(d,fill,extra="")=>'<path d="'+d+'" fill="'+fill+'" '+extra+'/>';
const E=(x,y,rx,ry,fill,rot=0,extra="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+rot+' '+x+' '+y+')" fill="'+fill+'" '+extra+'/>';
const L=(x,y,a,b,col="#596e55",w=4)=>P("M"+x+" "+y+"L"+a+" "+b,"none",'stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round"');
function tree(kind,c){
 let a=P("M290 386Q291 302 293 145L308 145Q312 270 319 386Z",kind==="elm"?"#9c8871":"#816b55",'stroke="#6d5a4a" stroke-width="4"');
 if(kind==="larch"||kind==="yew"){
  for(let j=0;j<10;j++){
   const y=83+j*30,w=27+j*15;
   a+=P("M302 "+y+"L"+(302+w)+" "+(y+54)+"L302 "+(y+37)+"L"+(302-w)+" "+(y+54)+"Z",j%2?c:"#55845a");
   for(let k=0;k<6;k++)a+=L(302-w+k*w/3,y+47,306-w+k*w/3,y+57,c,2);
  }
  if(kind==="yew")for(let j=0;j<28;j++)a+=E(192+(j*43)%224,174+(j*29)%130,5,5,"#bb4941");
  return a;
 }
 for(let j=0;j<7;j++){
  const x=192+j*33;
  a+=P("M300 269Q"+x+" "+(211+j%3*9)+" "+x+" "+(139+j%4*12),"none",'stroke="#81674d" stroke-width="7"');
 }
 for(let i=0;i<61;i++){
  const x=300+Math.cos(i*2.399)*((i%6)*20+24),y=193+Math.sin(i*2.399)*(32+(i%5)*15);
  a+=E(x,y,kind==="elm"?20:kind==="willow"?12:23,kind==="willow"?24:16,i%5?c:"#afbd88",i*23%180);
 }
 if(kind==="hazel"){
  for(let j=-2;j<=2;j++)a+=P("M303 384Q"+(300+j*25)+" 251 "+(276+j*39)+" 179","none",'stroke="#846b4f" stroke-width="8"');
  for(let i=0;i<21;i++)a+=E(196+(i*49)%218,152+(i*31)%140,4,19,"#c5a96a",24);
 }
 if(kind==="blackAlder")for(let i=0;i<23;i++)a+=E(203+(i*41)%214,135+(i*29)%135,5,12,"#4f5840",15);
 if(kind==="cherry")for(let i=0;i<25;i++)a+=E(190+(i*51)%228,136+(i*37)%143,6,7,"#b44148");
 if(kind==="willow")for(let i=0;i<19;i++){
  const x=192+(i*53)%228,y=150+(i*17)%84;
  a+=P("M"+x+" "+y+"Q"+(x-20)+" "+(y+60)+" "+(x-7)+" "+(y+114),"none",'stroke="#7c9970" stroke-width="3"');
 }
 if(kind==="hawthorn")for(let i=0;i<25;i++){
  const x=192+(i*47)%219,y=140+(i*31)%130;
  a+=E(x,y,5,5,"#f4eee4")+E(x+6,y+6,4,5,"#f4eee4");
  if(i%3===0)a+=E(x+10,y+15,5,5,"#b6413e");
 }
 if(kind==="elm")for(let i=0;i<5;i++)a+=P("M299 279Q"+(189+i*51)+" "+(176-i*7)+" "+(189+i*51)+" "+(103+i*12),"none",'stroke="#77634f" stroke-width="4"');
 return a;
}
function flower(kind,c){
 let a="";
 for(let j=0;j<4;j++){
  const x=160+j*96,y=[187,133,221,162][j],q=[1,.83,.71,.65][j];
  a+=P("M"+x+" "+y+"Q"+(x-17)+" 306 "+(x+5)+" 393","none",'stroke="#60875d" stroke-width="6"');
  a+=E(x-25,315,26,11,"#86a374",-30)+E(x+20,346,25,10,"#6b965e",31);
  if(kind==="snowdrop"){
   a+=P("M"+x+" "+y+"Q"+(x+18)+" "+(y-20)+" "+(x+19)+" "+(y+6),"none",'stroke="#658b65" stroke-width="4"');
   for(let k=0;k<3;k++)a+=E(x+19+(k-1)*8,y+18,8*q,20*q,"#f5f6ee",(k-1)*22);
   a+=E(x+19,y+9,5,5,"#a5b77a");continue;
  }
  if(kind==="knapweed"){
   a+=E(x,y,18*q,21*q,"#69835b");
   for(let k=0;k<26;k++){const t=k*Math.PI*2/26;a+=E(x+Math.cos(t)*18*q,y+Math.sin(t)*20*q,5*q,14*q,c,t*180/Math.PI);}
  }else{
   const n=kind==="cuckooFlower"||kind==="speedwell"?4:5;
   for(let k=0;k<n;k++){const t=k*Math.PI*2/n;a+=E(x+Math.sin(t)*20*q,y-Math.cos(t)*19*q,
    (kind==="forgetMeNot"?9:kind==="rugosaRose"?19:13)*q,
    (kind==="forgetMeNot"?13:kind==="rugosaRose"?25:20)*q,c,t*180/Math.PI);}
   a+=E(x,y,kind==="rugosaRose"?13:8,kind==="rugosaRose"?13:8,kind==="forgetMeNot"?"#eed263":"#e1c65f");
  }
  if(kind==="rugosaRose"){
   a+=E(x+31,y+89,12,16,"#ba4a44");
   for(let k=0;k<4;k++)a+=E(x+21+k*6,y+74,9,4,"#688d5e",k*26);
  }
  if(kind==="cranesbill")for(let k=0;k<5;k++)a+=L(x,y,x+Math.cos(k*1.256)*28,y+Math.sin(k*1.256)*28,"#8b6296",1);
 }
 return a;
}
function bird(kind,c){
 if(kind==="owl"){
  let a=P("M85 366Q300 348 515 367","none",'stroke="#826951" stroke-width="12"');
  a+=E(302,256,95,115,c,0,'stroke="#6b5845" stroke-width="5"')+E(300,150,98,96,"#b49b7b",0,'stroke="#755f4b" stroke-width="5"');
  for(let i=0;i<2;i++){const x=264+i*74;
   a+=E(x,151,43,46,"#d7bc90")+E(x,153,17,19,"#b88a43")+E(x,151,9,14,"#242524");}
  a+=P("M287 184L313 182L300 200Z","#c9a24a");
  for(let i=0;i<20;i++)a+=E(247+(i*37)%108,235+(i*21)%99,5,11,"#79644d",i*17);
  return a;
 }
 const water=kind==="eider"||kind==="redshank";
 let a=P("M75 369Q310 354 529 372","none",'stroke="'+(water?"#8db4b3":"#8e7757")+'" stroke-width="12"');
 a+=P("M345 233Q444 228 470 316L357 278Z",c);
 a+=E(302,236,120,79,c,-11,'stroke="#526057" stroke-width="4"');
 a+=E(333,247,75,42,kind==="eider"?"#f7f4eb":kind==="warbler"||kind==="icterine"?"#e8dc98":"#c0a998",-18);
 a+=E(192,167,54,50,c,0,'stroke="#546056" stroke-width="3"');
 a+=P("M146 169L"+(kind==="redshank"?"60":"96")+" 179L148 188Z",kind==="eagle"?"#ddbc62":"#ac9568");
 a+=E(172,158,7,7,"#1b2626")+E(170,156,2,2,"#fff");
 a+=L(266,294,255,357,kind==="redshank"?"#c77c50":"#746959",5)+L(343,293,351,357,kind==="redshank"?"#c77c50":"#746959",5);
 if(kind==="redshank"){
  a+=L(255,357,244,397,"#c77c50",6)+L(351,357,365,397,"#c77c50",6);
  for(let j=0;j<20;j++)a+=E(234+(j*29)%125,220+(j*13)%66,3,4,"#796a5a");
 }
 if(kind==="redwing"){
  a+=E(279,244,66,35,"#ba744b",-18);
  for(let j=0;j<20;j++)a+=E(238+(j*33)%117,222+(j*21)%58,3,4,"#5d4f44");
 }
 if(kind==="warbler"||kind==="icterine")a+=P("M150 151Q183 140 227 153","none",'stroke="#f3e5b4" stroke-width="5"');
 if(kind==="eider"){
  a+=E(282,230,89,58,"#f7f4eb",-12)+P("M303 208Q343 212 386 239L340 258Z","#252d32");
  a+=E(191,167,51,42,"#f5f3ea")+E(210,180,20,11,"#699783");
 }
 if(kind==="eagle"){
  a+=E(193,171,47,47,"#d3c7a7");
  a+=P("M149 177Q115 186 142 207L169 181Z","#d7b34e");
  a+=P("M289 202Q380 112 500 223L373 253Z","#71584a");
 }
 if(kind==="dunnock"){
  a+=E(192,165,48,44,"#999997");
  for(let j=0;j<19;j++)a+=L(272+(j*17)%115,206+(j*11)%54,282+(j*17)%115,221+(j*11)%54,"#594d45",2.5);
 }
 return a;
}
function insect(kind,c){
 const bumble=kind==="fieldBumblebee"||kind==="treeBumblebee";
 if(bumble||kind==="germanWasp"||kind==="hoverfly"){
  let a=E(318,236,122,72,bumble?"#383b34":"#e7c341",-6,'stroke="#554939" stroke-width="6"');
  a+=E(217,217,44,43,kind==="treeBumblebee"?"#b97449":"#393e37");
  if(bumble){
   a+=P("M266 170Q248 232 274 296M326 166Q309 235 329 303","none",'stroke="#eac447" stroke-width="22"');
   a+=E(419,244,29,51,kind==="treeBumblebee"?"#efe9df":"#e9e0d4");
   if(kind==="treeBumblebee")a+=E(265,223,24,43,"#ba7449");
  }else{
   for(let j=0;j<4;j++)a+=P("M"+(275+j*33)+" 175Q"+(261+j*33)+" 237 "+(278+j*33)+" 290","none",'stroke="#303634" stroke-width="15"');
   if(kind==="hoverfly")a+=E(217,213,40,38,"#9e744c");
  }
  a+=E(286,150,80,27,"#e0efeb",-27,'opacity=".8" stroke="#a6bbb2" stroke-width="3"');
  a+=E(355,153,80,27,"#e0efeb",22,'opacity=".8" stroke="#a6bbb2" stroke-width="3"');
  for(let j=0;j<3;j++)a+=L(246+j*51,283,222+j*61,337,"#444239",5);
  a+=E(199,208,6,6,"#1f2525");
  return a;
 }
 let a=E(300,236,109,120,c,0,'stroke="#58473a" stroke-width="7"');
 a+=E(300,143,67,47,kind==="rhinoceros"?"#744831":"#896044");
 a+=L(300,170,300,349,"#53463b",5);
 if(kind==="rhinoceros")a+=P("M282 128Q251 37 293 49Q276 93 320 118Z","#704530");
 if(kind==="cockchafer")for(let j=0;j<5;j++)a+=E(237+j*11,101+j*3,6,13,"#b48b5d",j*29);
 if(kind==="juneBeetle")for(let j=0;j<22;j++)a+=E(218+(j*41)%164,172+(j*27)%135,3,4,"#d9b67e");
 for(let j=0;j<3;j++){
  a+=L(211,184+j*54,142,151+j*69,"#6e5844",6)+L(390,184+j*54,456,151+j*69,"#6e5844",6);
 }
 a+=E(276,134,5,6,"#1d2525")+E(327,134,5,6,"#1d2525");
 return a;
}
function resolve(id){
 const entry=SPEC[String(id)];if(!entry)return older.resolve(id);
 const [family,kind,color]=entry;
 const drawing=family==="tree"?tree(kind,color):family==="flower"?flower(kind,color):family==="bird"?bird(kind,color):insect(kind,color);
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#fbf8ec"/><stop offset="1" stop-color="#e2e9d9"/></linearGradient></defs><rect width="600" height="420" fill="url(#bg)"/><path d="M0 393Q300 363 600 392V420H0Z" fill="#d0ddc2"/><g stroke-linecap="round" stroke-linejoin="round">'+drawing+'</g></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
window.HG_NATURE_ILLUSTRATIONS=Object.freeze({has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id))||older.has(id),resolve,count:older.count+Object.keys(SPEC).length});
})();
