/* History Go: botanically differentiated flower studies – detail pass 01.
 * No generic daisy template: individual corolla, calyx, stem, leaf, habit and inflorescence.
 * Schematic field-guide drawings; observational reference, not definitive identification.
 */
(function(){
"use strict";
const old=window.HG_NATURE_ILLUSTRATIONS;
if(!old||typeof old.resolve!=="function")return;
const ids=Object.freeze({
 emne_flora_enghumleblom:"rivale",
 emne_flora_engkarse:"pratensis",
 emne_flora_engknoppurt:"jacea",
 emne_flora_engsmelle:"vulgaris",
 emne_flora_engsoleie:"acris",
 emne_flora_engtjaereblom:"viscaria",
 emne_flora_prestekrage:"leucanthemum",
 emne_flora_balderbra:"tripleurospermum"
});
const p=(d,f="none",a="")=>'<path d="'+d+'" fill="'+f+'" '+a+'/>';
const el=(x,y,rx,ry,f,rot=0,a="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'" transform="rotate('+rot+' '+x+' '+y+')" '+a+'/>';
const circle=(x,y,r,f,a="")=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'" '+a+'/>';
const line=(x,y,u,v,c="#6f8160",w=2)=>p("M"+x+" "+y+"L"+u+" "+v,"none",'stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"');
const G=(x,y,angle,art)=>'<g transform="translate('+x+' '+y+') rotate('+angle+')">'+art+'</g>';
const fmt=n=>Math.round(n*10)/10;
function stem(x,y,base=399,col="#667d5c",w=5){
 return p("M"+x+" "+base+"Q"+(x-16)+" "+fmt((y+base)/2)+" "+(x+3)+" "+y,"none",'stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round"');
}
function leaf(x,y,angle,len=57,width=23,shade="url(#leaf)",serrate=false){
 const d=serrate
 ?"M0 0Q"+fmt(-width*.6)+" "+fmt(-len*.23)+" "+fmt(-width)+" "+fmt(-len*.36)+"l-4 -8 7 -6q-5 -6 2 -12l8 -3q-3 -8 7 -10L0 "+(-len)+"Q"+width+" "+fmt(-len*.67)+" "+fmt(width*.65)+" "+fmt(-len*.33)+"Z"
 :"M0 0Q"+(-width)+" "+fmt(-len*.3)+" "+fmt(-width*.76)+" "+fmt(-len*.7)+"Q"+fmt(-width*.42)+" "+fmt(-len*.96)+" 0 "+(-len)+"Q"+fmt(width*.85)+" "+fmt(-len*.76)+" "+width+" "+fmt(-len*.42)+"Q"+fmt(width*.65)+" "+fmt(-len*.14)+" 0 0Z";
 let a=p(d,shade,'stroke="#64805d" stroke-width="1.5" stroke-linejoin="round"');
 a+=line(0,-2,0,-len+5,"#a5b995",1.4);
 for(let j=1;j<=5;j++){let yy=-len*j/6,xw=width*Math.sin(j*Math.PI/6)*.75;
  a+=line(0,yy,-fmt(xw),fmt(yy-len*.105),"#8ea887",.8)+line(0,yy,fmt(xw),fmt(yy-len*.09),"#8ea887",.8);}
 return G(x,y,angle,a);
}
function lobedLeaf(x,y,angle=0,scale=1){
 let a=p("M0 0Q-14 -24 -30 -38L-19 -45L-30 -62L-16 -65L-20 -87L-6 -77L0 -103L11 -80L21 -85L16 -63L34 -65L22 -48L32 -36L15 -26Z","url(#leaf)",'stroke="#537951" stroke-width="2"');
 a+=p("M0 -4L0 -89M0 -40L-25 -54M0 -57L18 -69M0 -23L21 -42","none",'stroke="#8bac7d" stroke-width="1.7"');
 return '<g transform="translate('+x+' '+y+') rotate('+angle+') scale('+scale+')">'+a+'</g>';
}
function bloomPetal(cx,cy,ang,wide,length,color){
 const d="M0 0C"+(-wide*.65)+" "+(-length*.18)+" "+(-wide*1.2)+" "+(-length*.58)+" "+(-wide*.82)+" "+(-length*.88)+"Q0 "+(-length*1.08)+" "+(wide*.77)+" "+(-length*.9)+"C"+(wide*1.24)+" "+(-length*.55)+" "+(wide*.75)+" "+(-length*.17)+" 0 0Z";
 let a=p(d,color,'stroke="#a9a575" stroke-width=".6"');
 a+=p("M0 -3Q-2 "+fmt(-length*.46)+" 0 "+fmt(-length*.85),'none','stroke="#fff4b0" stroke-width="1" opacity=".65"');
 for(let i=-1;i<=1;i++)a+=p("M0 "+fmt(-length*.23)+"Q"+fmt(i*wide*.48)+" "+fmt(-length*.54)+" "+fmt(i*wide*.58)+" "+fmt(-length*.72),'none','stroke="#fff2ca" opacity=".34" stroke-width=".65"');
 return G(cx,cy,ang,a);
}
function stalkHair(x,y){let a="";for(let j=0;j<32;j++){const yy=y+j*5.3,s=j%2?1:-1;
 a+=line(x+s*(j%3)*.4,yy,x+s*(3+j%3),yy-3,"#b3a58e",.6);}return a;}
function basal(x,y,small=false){
 let a=lobedLeaf(x-8,y+8,-37,small?.66:.9)+lobedLeaf(x+14,y+10,42,small?.62:.9)+lobedLeaf(x+6,y,-4,small?.53:.76);
 return a;
}
function rivale(){
 let a="",loc=[[180,122,1],[318,86,1.07],[431,156,.83]];
 for(const [x,y,s] of loc){
  a+=p("M"+x+" 402Q"+(x-12)+" 276 "+(x+11)+" "+(y-14)+"Q"+(x+26)+" "+(y-44)+" "+(x+31)+" "+(y+10),"none",'stroke="#758067" stroke-width="'+(5*s)+'" stroke-linecap="round"');
  a+=stalkHair(x+8,y+20);
  a+=G(x-6,298,-66,leaf(0,0,0,69*s,22,"url(#leaf)",true))+G(x+8,254,59,leaf(0,0,0,46*s,18,"url(#leaf)",true));
  const fx=x+31,fy=y+23;
  // Dark reddish sepals form a pendant cup; pale petals remain mostly enclosed.
  a+=G(fx,fy,0,el(0,25,27*s,30*s,"url(#calyx)",0,'stroke="#745251" stroke-width="1.5"'));
  for(let j=0;j<5;j++){
   const dx=(j-2)*10*s,ang=(j-2)*12;
   a+=G(fx+dx,fy+13,ang,
    p("M0 0Q"+(-10*s)+" "+(18*s)+" "+(-7*s)+" "+(40*s)+"Q0 "+(59*s)+" "+(8*s)+" "+(40*s)+"Q"+(10*s)+" "+(18*s)+" 0 0Z","url(#apricot)",'stroke="#b87857" stroke-width="1.4"')+
    p("M0 11Q-3 34 0 44","none",'stroke="#cc765e" stroke-width="1.1" opacity=".8"'));
  }
  for(let j=0;j<5;j++){let xx=fx+(j-2)*12*s;
   a+=p("M"+fx+" "+(fy+3)+"Q"+xx+" "+(fy+31)+" "+(xx+(j-2)*3)+" "+(fy+59),"none",'stroke="#7d4852" stroke-width="3.5" stroke-linecap="round"');
  }
  for(let j=0;j<8;j++)a+=line(fx-12+j*3,fy+55,fx-10+j*3,fy+67,"#c5a166",1);
 }
 a+=basal(253,392)+basal(359,392,true);
 return a;
}
function pratensis(){
 let a="";const stems=[[270,127],[368,182],[186,221]];
 for(const [x,y] of stems){
  a+=p("M"+(x+8)+" 404Q"+(x-17)+" 271 "+x+" "+(y+13)+"L"+x+" "+y,"none",'stroke="#738e69" stroke-width="3.4"');
  for(let j=0;j<6;j++){const yy=y+26+j*25,side=j%2?1:-1;
   a+=line(x,yy,x+side*(19+j%3*4),yy-11,"#80946c",2);
   a+=leaf(x+side*20,yy-9,side*65,22,7,"url(#leaf)");
  }
 }
 // Numerous delicate four-petalled pale lavender flowers on terminal racemes.
 const flowers=[[272,122,1.05],[248,102,.8],[305,109,.72],[278,76,.61],[374,183,.88],[349,160,.64],[398,167,.58],[187,223,.72],[211,206,.58],[162,210,.52]];
 for(const [x,y,s] of flowers){
  for(let j=0;j<4;j++){
   const angle=j*90+(j%2?2:-4);
   a+=G(x,y,angle,'<g transform="scale('+s+')">'+p("M0 -3Q-14 -15 -16 -29Q-10 -47 0 -48Q12 -45 17 -29Q11 -12 0 -3Z","url(#lavender)",'stroke="#a899b1" stroke-width=".9"')+
    p("M0 -6Q1 -28 0 -43","none",'stroke="#b39ac6" opacity=".7" stroke-width="1.1"')+'</g>');
  }
  for(let j=0;j<6;j++){const t=j*Math.PI/3;
   a+=line(x,y,x+Math.cos(t)*8*s,y+Math.sin(t)*8*s,"#c0a75d",1.2);
   a+=circle(fmt(x+Math.cos(t)*9*s),fmt(y+Math.sin(t)*9*s),1.7*s,"#d6bf6d");
  }
  a+=circle(x,y,2.9*s,"#a9bc73");
 }
 for(let j=0;j<8;j++)a+=basal(176+j*29,395,true);
 return a;
}
function headKnoppurt(x,y,s){
 let a="";
 // Involucre: brown overlapping scale-like bracts under the cap.
 a+=el(x,y+20*s,33*s,31*s,"url(#bracts)",0,'stroke="#7c6555" stroke-width="2"');
 for(let j=0;j<5;j++)for(let k=0;k<4;k++){
  const xx=x+(j-2)*12*s+(k%2)*5*s,yy=y+(k*9+8)*s;
  a+=p("M"+xx+" "+yy+"l"+(7*s)+" "+(4*s)+"l"+(-2*s)+" "+(9*s)+"l"+(-8*s)+" "+(-1*s)+"Z",j%2?"#74694d":"#9c8965",'stroke="#b0a083" stroke-width=".6"');
 }
 // Distinctive radiating highly fringed magenta tubular florets, NOT simple round petals.
 for(let j=0;j<40;j++){
  const t=j*2.399,rx=25*s*Math.cos(t),ry=17*s*Math.sin(t),xx=x+rx,yy=y+ry;
  const length=(j%6===0?35:21+(j%5)*3)*s,spread=Math.cos(t)*length, rise=length*(.45+Math.abs(Math.sin(t))*.38);
  a+=p("M"+fmt(xx)+" "+fmt(yy)+"Q"+fmt(xx+spread*.33)+" "+fmt(yy-rise*.7)+" "+fmt(xx+spread)+" "+fmt(yy-rise),"none",'stroke="'+(j%4?"#b16b9c":"#7f416d")+'" stroke-width="'+(j%3?3:4.3)*s+'" stroke-linecap="round"');
  for(let k=-1;k<=1;k++)a+=line(fmt(xx+spread*.75),fmt(yy-rise*.91),fmt(xx+spread*.98+k*3*s),fmt(yy-rise-5*s),"#bc75a4",.8);
 }
 for(let j=0;j<50;j++){const t=j*2.399,r=(j%5)*4.3*s;
  a+=circle(fmt(x+Math.cos(t)*r),fmt(y-4*s+Math.sin(t)*r*.6),1.5*s,j%3?"#a66d91":"#cf9ac1");}
 return a;
}
function jacea(){
 let a="";const branches=[[280,135,1.28],[436,205,.81],[164,218,.67]];
 for(const [x,y,s] of branches){
  a+=p("M299 399Q"+(x-15)+" 309 "+x+" "+(y+29*s),"none",'stroke="#71855b" stroke-width="'+(4.5*s)+'"');
  a+=leaf(x-10,y+115,-60,60*s,13,"url(#leaf)")+leaf(x+12,y+84,58,65*s,13,"url(#leaf)");
  a+=headKnoppurt(x,y,s);
 }
 a+=leaf(265,373,-67,87,16,"url(#leaf)")+leaf(305,355,65,91,17,"url(#leaf)");
 return a;
}
function bladder(x,y,s=1,rotation=0){
 // net-veined inflated calyx is the dominant identifying feature.
 let b=el(0,0,22*s,32*s,"url(#bladder)",0,'stroke="#789477" stroke-width="1.8"');
 for(let j=-3;j<=3;j++){
  const off=j*5*s;
  b+=p("M"+fmt(off*.22)+" "+(-27*s)+"Q"+fmt(off*1.6)+" 0 "+fmt(off*.65)+" "+(26*s),"none",'stroke="#8caa89" stroke-width=".9" opacity=".72"');
 }
 for(let j=-2;j<=2;j++)b+=p("M"+(-18*s)+" "+(j*9*s)+"Q0 "+fmt((j+1)*8*s)+" "+(18*s)+" "+(j*9*s),"none",'stroke="#9bb396" stroke-width=".7" opacity=".6"');
 // Five narrow white petals with cleft tips, protruding beyond balloon calyx.
 for(let j=0;j<5;j++){
  const xx=(j-2)*8*s;
  b+=G(xx,-31*s,(j-2)*16,
   p("M0 0Q-7 -12 -10 -22Q-7 -30 -1 -25L0 -33L4 -25Q9 -31 12 -22Q10 -11 0 0Z","url(#ivory)",'stroke="#c9c5b9" stroke-width=".9"'));
 }
 for(let j=0;j<7;j++)b+=line((j-3)*3*s,-23*s,(j-3)*4*s,-43*s,"#c8c5ac",.8);
 return G(x,y,rotation,b);
}
function vulgaris(){
 let a="";const branches=[[170,201,.75,-35],[297,125,1.05,12],[410,189,.9,39],[353,270,.68,75]];
 for(const [x,y,s,rotation] of branches){
  a+=p("M298 403Q"+(x-19)+" 301 "+(x-10)+" "+(y+38)+"L"+x+" "+y,"none",'stroke="#738d6f" stroke-width="'+(3.4*s)+'"');
  const yy=y+105*s;
  a+=leaf(x-10,yy,-69,68*s,13,"url(#leaf)")+leaf(x+10,yy,65,71*s,12,"url(#leaf)");
  a+=bladder(x,y,s,rotation);
  a+=p("M"+(x-9)+" "+(y+45*s)+"L"+(x-3)+" "+(y+45*s),"none",'stroke="#a0b096" stroke-width="2"');
 }
 for(let j=0;j<4;j++)a+=leaf(283+j*16,375,(j%2?1:-1)*43,51,10,"url(#leaf)");
 return a;
}
function yellowHead(x,y,s=1,tilt=0){
 let a="";
 for(let j=0;j<5;j++)a+=bloomPetal(x,y,(j*72+tilt),21*s,48*s,"url(#gold)");
 a+=circle(x,y,14*s,"#d9a625");
 for(let j=0;j<28;j++){
  const t=j*2.399,r=(j%5+1)*2.4*s;
  a+=el(fmt(x+Math.cos(t)*r),fmt(y+Math.sin(t)*r),1.65*s,2.35*s,j%3?"#edc341":"#986d26",j*31);
 }
 return a;
}
function acris(){
 let a="";
 for(const [x,y,s,tilt] of [[214,167,.98,-11],[365,109,1.1,8],[463,227,.69,19]]){
  a+=p("M295 402Q"+(x-27)+" 302 "+(x+9)+" "+(y+29)+"L"+x+" "+y,"none",'stroke="#63885c" stroke-width="'+(4*s)+'"');
  a+=yellowHead(x,y,s,tilt);
  a+=leaf(x+5,y+91,74,42*s,9,"url(#leaf)");
 }
 // Deeply cleft palmate basal leaves, NOT the generic oval daisy leaves.
 for(let j=0;j<7;j++){const x=171+j*42,y=401-(j%3)*14;
  a+=lobedLeaf(x,y,(j-3)*13,.65+(j%3)*.1);}
 for(let j=0;j<3;j++){const x=135+j*176,y=254+j%2*34;a+=stem(x,y,398,"#6d8b5c",2.5)+circle(x,y,6,"#7f9660");}
 return a;
}
function sticky(){
 let a="";
 const flowers=[[201,145,.9],[295,101,1],[398,181,.72],[274,176,.63],[374,117,.55]];
 for(const [x,y,s] of flowers){
  a+=p("M"+x+" 404Q"+(x-16)+" 290 "+x+" "+y,"none",'stroke="#6d8058" stroke-width="'+(4.5*s)+'"');
  for(let q=0;q<4;q++){const yy=y+65+q*45;a+=line(x-5,yy,x+5,yy,"#493e48",7);a+=leaf(x,yy,q%2?69:-74,54*s,9,"url(#leaf)");}
  for(let j=0;j<5;j++)a+=G(x,y,(j*72),p("M0 -3Q-7 -18 -16 -31Q-6 -51 -1 -40L0 -29L5 -40Q14 -47 17 -30Q11 -16 0 -3Z","url(#magenta)",'stroke="#a24677" stroke-width="1"'));
  a+=circle(x,y,7*s,"#f6e1d8");
  for(let j=0;j<8;j++)a+=circle(x+Math.cos(j*2.4)*4,y+Math.sin(j*2.4)*4,1.2,"#d08d63");
 }
 return a;
}
function daisy(k){
 let a="";
 for(const [x,y,s] of [[251,156,1],[399,218,.74],[130,238,.58]]){
  a+=p("M"+x+" 398Q"+(x-13)+" 300 "+x+" "+y,"none",'stroke="#648352" stroke-width="4"');
  for(let j=0;j<(k==="leucanthemum"?20:17);j++){
   const ang=j*360/(k==="leucanthemum"?20:17);
   a+=G(x,y,ang,p("M-4 -9Q-10 -25 -7 -41Q-3 -57 0 -55Q7 -57 10 -43Q9 -25 4 -9Z","url(#ivory)",'stroke="#cbcabe" stroke-width=".7"'));
  }
  a+=el(x,y,18*s,16*s,"url(#disk)");
  for(let j=0;j<66;j++){const t=j*2.399,r=Math.sqrt(j/66)*16*s;
   a+=circle(fmt(x+Math.cos(t)*r),fmt(y+Math.sin(t)*r*.86),1.4,j%4?"#d7a52e":"#806826");}
  if(k==="tripleurospermum"){
   // finely dissected thread-like mayweed foliage
   for(let q=0;q<5;q++){const yy=245+q*27;
    a+=line(x,yy,x-23,yy-12,"#678c61",1.7)+line(x,yy,x+28,yy-14,"#678c61",1.7);
    for(let h=0;h<5;h++)a+=line(x-18+h*8,yy-12,x-23+h*8,yy-23,"#82a272",.8);
   }
  }else{
   a+=lobedLeaf(x-4,364,-64,.61)+lobedLeaf(x+5,330,55,.55);
  }
 }
 return a;
}
function render(k){
 const image= k==="rivale"?rivale():k==="pratensis"?pratensis():k==="jacea"?jacea():k==="vulgaris"?vulgaris():k==="acris"?acris():k==="viscaria"?sticky():daisy(k);
 const defs='<defs>'+
 '<linearGradient id="bg" x2=".13" y2="1"><stop stop-color="#faf9f4"/><stop offset=".55" stop-color="#f1f3eb"/><stop offset="1" stop-color="#e6ece0"/></linearGradient>'+
 '<linearGradient id="leaf" x2=".85" y2="1"><stop stop-color="#b4c99e"/><stop offset=".48" stop-color="#71966c"/><stop offset="1" stop-color="#4e765c"/></linearGradient>'+
 '<linearGradient id="apricot" x2=".15" y2="1"><stop stop-color="#e7bc81"/><stop offset=".53" stop-color="#b97050"/><stop offset="1" stop-color="#e7c99c"/></linearGradient>'+
 '<linearGradient id="calyx" x2="1" y2=".8"><stop stop-color="#6a3e4d"/><stop offset=".5" stop-color="#af6d65"/><stop offset="1" stop-color="#6a4c52"/></linearGradient>'+
 '<linearGradient id="lavender" x2="1" y2="1"><stop stop-color="#f8f6f3"/><stop offset=".57" stop-color="#e1d5eb"/><stop offset="1" stop-color="#b8a4d4"/></linearGradient>'+
 '<linearGradient id="bracts" x2="1" y2="1"><stop stop-color="#a69e79"/><stop offset="1" stop-color="#695b54"/></linearGradient>'+
 '<linearGradient id="bladder" x2="1" y2=".9"><stop stop-color="#f0efe1"/><stop offset=".43" stop-color="#b2c8a7"/><stop offset="1" stop-color="#7e9d84"/></linearGradient>'+
 '<linearGradient id="ivory" x2=".6" y2="1"><stop stop-color="#fffdf2"/><stop offset=".6" stop-color="#f0eee6"/><stop offset="1" stop-color="#cfcdbd"/></linearGradient>'+
 '<linearGradient id="gold" x2=".8" y2="1"><stop stop-color="#fff278"/><stop offset=".38" stop-color="#e9bb21"/><stop offset=".8" stop-color="#e8a618"/><stop offset="1" stop-color="#ffd651"/></linearGradient>'+
 '<linearGradient id="magenta" x2="1" y2=".7"><stop stop-color="#df82ad"/><stop offset=".5" stop-color="#bb4d88"/><stop offset="1" stop-color="#e4aac6"/></linearGradient>'+
 '<radialGradient id="disk"><stop stop-color="#a78123"/><stop offset=".73" stop-color="#dfae32"/><stop offset="1" stop-color="#b58930"/></radialGradient>'+
 '</defs>';
 let haze="";
 for(let j=0;j<25;j++){const x=(j*89)%600,y=(j*37)%416;
  haze+=el(x,y,30+(j%4)*18,16+(j%5)*9,j%2?"#d8e5d4":"#f9f0de",j*27,'opacity=".09"');}
 return '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420" role="img" data-botanical-species="'+k+'">'+defs+
 '<rect width="600" height="420" fill="url(#bg)"/>'+haze+'<g stroke-linejoin="round" stroke-linecap="round">'+image+'</g></svg>';
}
function resolve(id){
 const key=ids[String(id)];
 return key?"data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(render(key)):old.resolve(id);
}
window.HG_NATURE_ILLUSTRATIONS=Object.freeze({has:id=>Boolean(ids[String(id)])||old.has(id),resolve,count:old.count});
})();
