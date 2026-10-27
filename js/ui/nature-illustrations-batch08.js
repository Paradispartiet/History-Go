/* History Go – Nature Atlas, original illustration batch 08.
 * Schematic editorial drawings only; never a diagnostic species ID reference.
 * 15 flora + 15 fauna. The pre-existing atlas remains authoritative for other IDs.
 */
(function(){
"use strict";
const previous=window.HG_NATURE_ILLUSTRATIONS;
if(!previous||typeof previous.resolve!=="function")return;
const SPEC={
 emne_flora_rodtvetann:["flora","nettle","#b077b1"],
 emne_flora_sandarve:["flora","sandwort","#f8f7ea"],
 emne_flora_smor_bukk:["flora","pimpinella","#f7f1dd"],
 emne_flora_svalerot:["flora","toothwort","#d9a1b1"],
 emne_flora_vassarve:["flora","chickweed","#f6f5eb"],
 emne_flora_veihaukeskjegg:["flora","hawksbeard","#f0c441"],
 emne_flora_villkarse:["flora","bittercress","#f2f2e4"],
 emne_flora_varerteknapp:["flora","vetchling","#a16cb5"],
 emne_flora_varkaal:["flora","celandine","#e7bb31"],
 emne_flora_akerdylle:["flora","sowthistle","#eac044"],
 emne_flora_akerveronika:["flora","speedwell","#668dd0"],
 emne_flora_akervindel:["flora","bindweed","#f2cdd7"],
 emne_flora_gravbergknapp:["flora","stonecrop","#d17691"],
 emne_flora_russekaal:["flora","yellowcress","#ecd04e"],
 emne_flora_kjempeslirekne:["flora","knotweed","#eee5d4"],
 emne_fauna_bille_lovsnutebiller:["beetle","weevil","#6c7153"],
 emne_fauna_bille_jordbiller:["beetle","ground","#313a41"],
 emne_fauna_bille_barkbiller:["beetle","bark","#7a5040"],
 emne_fauna_bille_praktbiller:["beetle","jewel","#4d9b84"],
 emne_fauna_bille_mokkbiller:["beetle","dung","#4f433a"],
 emne_fauna_bille_vannbiller:["beetle","water","#586869"],
 emne_fauna_bille_teppebiller:["beetle","carpet","#887b66"],
 emne_fauna_enghumle:["bee","bumble","#d6b34b"],
 emne_fauna_murveps:["bee","masonwasp","#e0be4f"],
 emne_fauna_sandveps:["bee","sandwasp","#c78059"],
 emne_fauna_svart_jordmaur:["ant","black","#36383a"],
 emne_fauna_blomsterflue_stor:["fly","hover","#e8bd4a"],
 emne_fauna_spyflue:["fly","blow","#528e99"],
 emne_fauna_hjortelusflue:["fly","deerked","#8d624e"],
 emne_fauna_stankelbein_samle:["fly","cranefly","#a08a77"]
};
const P=(d,f,extra="")=>'<path d="'+d+'" fill="'+f+'" '+extra+'/>';
const E=(x,y,rx,ry,f,rot=0,extra="")=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+rot+' '+x+' '+y+')" fill="'+f+'" '+extra+'/>';
const C=(x,y,r,f)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"/>';
const L=(x,y,u,v,color="#668c68",width=4)=>P("M"+x+" "+y+"L"+u+" "+v,"none",'stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round"');
function bloom(x,y,n,r,col,mid="#d9aa42"){
 let a="";for(let i=0;i<n;i++){const t=i*Math.PI*2/n;a+=E(x+Math.sin(t)*r*.69,y-Math.cos(t)*r*.69,r*.39,r*.69,col,t*180/Math.PI);}
 return a+C(x,y,r*.27,mid);
}
function leaf(x,y,side=1,r=28,fill="#79a16b",broad=false){
 return P("M"+x+" "+y+"Q"+(x+side*r*1.6)+" "+(y-r*.9)+" "+(x+side*r*2)+" "+(y-r*.2)+"Q"+(x+side*r*1.1)+" "+(y+r*.6)+" "+x+" "+y+"Z",fill)+
 L(x,y,x+side*r*1.7,y-r*.12,"#5e8656",1.5);
}
function flora(k,col){
 let a="";
 if(k==="bindweed"){
  a+=P("M66 355Q177 215 290 288T553 125","none",'stroke="#6f9967" stroke-width="8"');
  for(let j=0;j<6;j++){const x=115+j*79,y=324-j*31;a+=leaf(x,y,j%2?-1:1,23,"#70a36c",true);}
  for(const [x,y] of [[207,228],[359,185],[484,134]]){
   a+=P("M"+(x-40)+" "+(y+12)+"Q"+(x-49)+" "+(y-41)+" "+x+" "+(y-47)+"Q"+(x+49)+" "+(y-36)+" "+(x+40)+" "+(y+15)+"Q"+x+" "+(y+28)+" "+(x-40)+" "+(y+12)+"Z",col,'stroke="#d5aab8" stroke-width="4"');
   a+=E(x,y-1,16,22,"#f5e9d5")+C(x,y+3,6,"#e6bb66");
  }return a;
 }
 if(k==="stonecrop"){
  for(let j=0;j<6;j++){const x=123+j*72,y=249+j%2*15;
   a+=L(x,393,x,y+5,"#7d9772",6);
   for(let z=0;z<5;z++){const yy=291+z*21;a+=E(x-14,yy,10,21,z%2?"#8bad86":"#9dbd8c",-36)+E(x+14,yy+3,10,21,"#8ca783",36);}
   for(let z=0;z<6;z++){const xx=x+(z%3-1)*19,yy=y-Math.floor(z/3)*21;a+=bloom(xx,yy,5,12,col,"#f2e5ce");}
  }return a;
 }
 if(k==="knotweed"){
  for(let j=0;j<5;j++){const x=155+j*78,y=88+j%3*25;
   a+=P("M"+x+" 391L"+(x+6)+" "+y,"none",'stroke="#7e8f62" stroke-width="10"');
   for(let z=0;z<5;z++){const yy=166+z*40,side=z%2?1:-1;
    a+=P("M"+x+" "+yy+"Q"+(x+side*70)+" "+(yy-80)+" "+(x+side*110)+" "+(yy-21)+"Q"+(x+side*60)+" "+(yy+20)+" "+x+" "+yy+"Z","#79a16a",'stroke="#688c5b" stroke-width="2"');
    a+=L(x,yy,x+side*82,yy-27,"#6e8f5b",2);
   }
   for(let z=0;z<12;z++){const xx=x+(z%3-1)*9,yy=y+Math.floor(z/3)*11;a+=E(xx,yy,5,8,z%3?"#faf7e8":"#e6e3d2");}
  }return a;
 }
 if(k==="toothwort"){
  for(let j=0;j<6;j++){const x=140+j*68,y=97+j%3*35;
   a+=P("M"+x+" 394Q"+(x+22)+" 254 "+x+" "+y,"none",'stroke="#bb9697" stroke-width="9"');
   for(let z=0;z<8;z++){const yy=178+z*27; a+=E(x-9,yy,13,24,"#d6b1ac",-36)+E(x+13,yy+8,13,22,"#e5c3bf",37);}
   for(let z=0;z<7;z++)a+=E(x+(z%2?-11:11),y+z*11,8,13,col,z%2?-19:19);
  }return a;
 }
 const vines=["chickweed","sandwort","bittercress"].includes(k);
 const big=["sowthistle","hawksbeard","yellowcress"].includes(k);
 const xs=vines?[115,192,276,360,440,513]:[158,249,350,448];
 for(let j=0;j<xs.length;j++){
  const x=xs[j],y=(vines?197:big?96:144)+j%3*30;
  a+=P("M"+x+" "+y+"Q"+(x-22)+" 274 "+(x+7)+" 392","none",'stroke="'+(k==="pimpinella"?"#9aaa80":"#709768")+'" stroke-width="'+(vines?3.2:5.4)+'" stroke-linecap="round"');
  for(let z=0;z<(vines?2:3);z++){
   const yy=245+z*44,side=z%2?1:-1,lf=k==="celandine"?"#8eaf6f":k==="vetchling"?"#76a16e":"#7e9e70";
   a+=leaf(x,yy,side,k==="vetchling"?27:k==="sowthistle"?30:vines?13:20,lf);
   if(k==="vetchling")a+=L(x,yy-8,x+side*54,yy-42,"#648f62",2);
  }
  if(k==="nettle"){
   for(let z=0;z<5;z++){const yy=y+z*15;
    a+=P("M"+(x-20)+" "+yy+"Q"+(x-37)+" "+(yy-30)+" "+(x-13)+" "+(yy-12)+"L"+x+" "+(yy+7)+"Z",col);
    a+=P("M"+(x+19)+" "+yy+"Q"+(x+34)+" "+(yy-28)+" "+(x+14)+" "+(yy-12)+"L"+x+" "+(yy+7)+"Z",col);
   }
  }else if(k==="sandwort"||k==="chickweed"){
   const r=k==="sandwort"?14:17;
   for(let z=0;z<3;z++){const xx=x+(z-1)*13,yy=y+z*17;
    a+=bloom(xx,yy,5,r,col,"#b8bd84");
    if(k==="chickweed")for(let m=0;m<5;m++){const t=m*Math.PI*2/5;a+=L(xx+Math.cos(t)*9,yy+Math.sin(t)*9,xx+Math.cos(t)*20,yy+Math.sin(t)*20,"#7b977e",1);}
   }
  }else if(k==="pimpinella"){
   for(let t=0;t<7;t++){const ang=t*6.28/7;const xx=x+Math.sin(ang)*34,yy=y-Math.cos(ang)*22;
    a+=L(x,y+18,xx,yy,"#7b956a",2);
    a+=bloom(xx,yy,5,7,col,"#d6c89a");
   }
  }else if(k==="hawksbeard"||k==="sowthistle"){
   a+=bloom(x,y,27,big?31:23,col,"#aa8e36");
   for(let z=0;z<3;z++)a+=P("M"+(x-18+z*17)+" "+(y+31)+"l-8 17 14 -8Z","#6f875b");
  }else if(k==="bittercress"){
   for(let z=0;z<3;z++)a+=bloom(x+(z-1)*17,y+z*12,4,11,col,"#deb85f");
   for(let z=0;z<4;z++)a+=P("M"+(x+z*9-19)+" "+(y+52)+"l"+(z%2?9:-9)+" -58","none",'stroke="#7e9e70" stroke-width="3"');
  }else if(k==="vetchling"){
   a+=P("M"+x+" "+(y+7)+"Q"+(x-30)+" "+(y-28)+" "+(x-4)+" "+(y-35)+"Q"+(x+20)+" "+(y-48)+" "+(x+22)+" "+y+"Q"+x+" "+(y+25)+" "+x+" "+(y+7)+"Z",col,'stroke="#846493" stroke-width="2"');
   a+=E(x+24,y+18,17,13,"#c49dca",28)+C(x+7,y,4,"#f5e6c1");
  }else if(k==="celandine"){
   a+=bloom(x,y,8,30,col,"#e3a03e");
   for(let z=0;z<4;z++)a+=E(x+(z-1)*16,339,24,15,"#83a96e",z*23);
  }else if(k==="speedwell"){
   a+=bloom(x,y,4,20,col,"#f2f0e8")+E(x,y+11,5,6,"#faf4c8");
  }else if(k==="yellowcress"){
   for(let z=0;z<5;z++)a+=bloom(x+(z%3-1)*18,y+Math.floor(z/3)*19,4,12,col,"#d7ae47");
  }
 }return a;
}
function beetle(k,col){
 const narrow=["weevil","bark","jewel"].includes(k),round=["dung","carpet"].includes(k);
 let a="";
 // Six legs anchored on the abdomen, with anatomy emphasized over realism.
 for(let j=0;j<3;j++){const yy=180+j*53;
  a+=P("M237 "+yy+"Q175 "+(yy-24)+" "+(122-j*10)+" "+(yy-56),"none",'stroke="#4b5048" stroke-width="8" stroke-linecap="round"');
  a+=P("M365 "+yy+"Q431 "+(yy-24)+" "+(479+j*10)+" "+(yy-58),"none",'stroke="#4b5048" stroke-width="8" stroke-linecap="round"');
 }
 const rx=narrow?93:round?119:108,ry=round?112:134;
 a+=E(301,249,rx,ry,col,0,'stroke="#343d3d" stroke-width="6"');
 if(k==="jewel")a+=P("M299 118Q226 167 230 294Q271 347 299 381Q329 337 371 287Q387 182 299 118Z","#60b19a",'opacity=".78"');
 a+=L(301,129,301,378,k==="jewel"?"#227c79":"#313a39",4);
 a+=E(301,149,narrow?63:78,56,k==="carpet"?"#584b40":k==="jewel"?"#4a998d":k==="ground"?"#34393e":col,0,'stroke="#333b38" stroke-width="5"');
 a+=E(300,92,k==="bark"?44:53,k==="bark"?39:48,k==="jewel"?"#47877f":"#504b41");
 a+=C(270,92,5,"#f1f2e8")+C(329,92,5,"#f1f2e8");
 a+=P("M270 65L228 27M332 65L377 28","none",'stroke="#616452" stroke-width="5" stroke-linecap="round"');
 if(k==="weevil"){
  a+=P("M279 73Q269 21 285 8L316 8Q331 25 322 74Z","#777a55",'stroke="#535644" stroke-width="4"');
  a+=C(278,96,7,"#222d2d")+C(323,96,7,"#222d2d");
 }else if(k==="ground"){
  for(let z=0;z<18;z++){const xx=247+(z%3)*48,yy=191+Math.floor(z/3)*27;a+=L(xx,yy,xx-3,yy+15,"#68757a",1.7);}
 }else if(k==="bark"){
  for(let z=0;z<12;z++)a+=L(249+(z%3)*50,197+Math.floor(z/3)*37,258+(z%3)*50,210+Math.floor(z/3)*37,"#a07859",3);
 }else if(k==="jewel"){
  for(let z=0;z<9;z++)a+=E(250+(z%3)*49,202+Math.floor(z/3)*57,8,17,z%2?"#c3d7a0":"#226b85",z*20);
 }else if(k==="dung"){
  a+=P("M270 69L240 16L286 50M333 68L370 16L320 51","none",'stroke="#443d33" stroke-width="12"');
  for(let z=0;z<20;z++)a+=E(247+(z%5)*29,205+Math.floor(z/5)*30,4,7,"#7f7256");
 }else if(k==="water"){
  for(let z=0;z<3;z++){a+=E(173-z*12,223+z*51,44,9,"#87918a",32)+E(423+z*12,223+z*51,44,9,"#87918a",-32);}
  a+=E(257,249,33,94,"#798f89",-12,'opacity=".38"');
 }else if(k==="carpet"){
  for(let z=0;z<42;z++)a+=E(238+(z*43)%123,166+(z*29)%173,4+z%3,8,z%3?"#c7b59c":"#4e5d5d",z*31);
 }
 return a;
}
function bee(k,col){
 const wasp=k!=="bumble",slender=k==="sandwasp";
 let a=E(357,246,slender?116:wasp?102:126,slender?36:wasp?46:70,wasp?"#e1bd54":"#3f4140",-7,'stroke="#5b5347" stroke-width="5"')+
 E(218,211,wasp?43:48,wasp?42:47,wasp?"#434344":"#403c34");
 if(k==="bumble"){
  a+=P("M269 187Q253 239 278 311M343 179Q327 240 343 316","none",'stroke="#e3b74f" stroke-width="29"');
  a+=E(449,255,26,49,"#d07d53");
  for(let z=0;z<18;z++)a+=L(268+z*10,176+(z%3)*28,269+z*10,169+(z%3)*28,"#f2d69d",2);
 }else{
  for(let z=0;z<4;z++)a+=P("M"+(278+z*39)+" 207Q"+(270+z*39)+" 246 "+(284+z*39)+" 274","none",'stroke="#343d3e" stroke-width="'+(slender?10:14)+'"');
  a+=P("M463 236L518 246L463 259Z","#42413d");
  if(slender)a+=E(332,247,64,15,"#be644b");
 }
 a+=E(312,145,89,29,"#deedeb",-28,'opacity=".76" stroke="#9dbdb8" stroke-width="3"')+
 E(372,148,86,28,"#e4f1eb",25,'opacity=".75" stroke="#9dbdb8" stroke-width="3"');
 for(let z=0;z<3;z++){a+=L(260+z*53,275,233+z*65,344,"#4c4a40",4)+L(277+z*54,271,312+z*59,343,"#4c4a40",4);}
 a+=C(202,204,6,"#253230")+L(200,178,176,145,"#595951",3)+L(231,178,240,141,"#595951",3);
 return a;
}
function ant(col){
 let a=E(396,233,87,77,col)+E(298,231,39,30,"#4e4f4f")+E(216,219,52,45,col);
 for(let z=0;z<3;z++){
  a+=P("M"+(282+z*27)+" "+(215+z*8)+"Q"+(228+z*26)+" "+(152-z*7)+" "+(182+z*43)+" "+(140-z*7),"none",'stroke="#444443" stroke-width="5" stroke-linecap="round"');
  a+=P("M"+(288+z*29)+" "+(244+z*6)+"Q"+(240+z*40)+" 310 "+(206+z*55)+" 355","none",'stroke="#444443" stroke-width="5" stroke-linecap="round"');
 }
 a+=P("M187 193Q150 128 129 161M216 184Q224 134 260 146","none",'stroke="#474646" stroke-width="4"');
 return a+C(191,214,6,"#d0d0b8");
}
function fly(k,col){
 if(k==="cranefly"){
  let a=E(330,229,101,20,col,-12)+E(226,214,36,34,"#99887a")+E(180,201,22,21,"#a99986");
  a+=E(278,166,91,26,"#d8e8e7",-29,'opacity=".72" stroke="#a4c0c2" stroke-width="2"')+
 E(352,153,101,25,"#deebe7",19,'opacity=".72" stroke="#a4c0c2" stroke-width="2"');
  for(let z=0;z<3;z++){a+=P("M"+(255+z*37)+" 238L"+(190+z*28)+" 337L"+(123+z*29)+" 378","none",'stroke="#736d61" stroke-width="3"');
   a+=P("M"+(255+z*37)+" 233L"+(360+z*35)+" 336L"+(409+z*31)+" 388","none",'stroke="#736d61" stroke-width="3"');}
  return a+L(164,199,114,178,"#68675d",2);
 }
 const hover=k==="hover",blow=k==="blow",ked=k==="deerked";
 let a=E(329,239,ked?90:111,ked?77:75,hover?"#e9bb4a":blow?"#5499a6":"#936b54",-4,'stroke="#62574e" stroke-width="5"');
 a+=E(216,213,ked?65:54,ked?59:55,ked?"#8b624c":"#66574c");
 if(hover){for(let z=0;z<3;z++)a+=P("M"+(274+z*42)+" 177Q"+(264+z*42)+" 244 "+(279+z*42)+" 296","none",'stroke="#3b4242" stroke-width="19"');}
 if(blow){for(let z=0;z<6;z++)a+=L(269+z*22,180,274+z*22,294,"#a4d6cf",3);}
 if(ked){for(let z=0;z<3;z++)a+=E(280+z*35,215+z%2*50,15,18,"#bc9f81");}
 a+=E(293,154,92,31,"#e1eef0",-29,'opacity=".74" stroke="#92b8bc" stroke-width="3"')+
 E(358,150,90,30,"#d7eced",22,'opacity=".74" stroke="#92b8bc" stroke-width="3"');
 for(let z=0;z<3;z++){a+=L(260+z*48,285,210+z*56,351,"#605647",4)+L(274+z*45,283,318+z*56,346,"#605647",4);}
 a+=E(181,198,ked?17:23,ked?26:32,ked?"#482f2b":"#9c4840")+
 E(226,198,ked?17:23,ked?26:32,ked?"#482f2b":"#9c4840");
 return a+L(194,164,181,143,"#726156",2);
}
function resolve(id){
 const entry=SPEC[String(id)];
 if(!entry)return previous.resolve(id);
 const [family,kind,color]=entry;
 const art=family==="flora"?flora(kind,color):family==="beetle"?beetle(kind,color):family==="bee"?bee(kind,color):family==="ant"?ant(color):fly(kind,color);
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="atlas8" x2="0" y2="1"><stop stop-color="'+(family==="flora"?"#fbf8ed":"#edf3ee")+'"/><stop offset="1" stop-color="'+(family==="flora"?"#e3eddc":"#d5e5de")+'"/></linearGradient></defs><rect width="600" height="420" fill="url(#atlas8)"/><path d="M0 397Q300 374 600 398V420H0Z" fill="#b8ceb2" opacity=".42"/><g stroke-linecap="round" stroke-linejoin="round">'+art+'</g></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
window.HG_NATURE_ILLUSTRATIONS=Object.freeze({
 has:id=>Object.prototype.hasOwnProperty.call(SPEC,String(id))||previous.has(id),
 resolve,
 count:previous.count+Object.keys(SPEC).length
});
})();
