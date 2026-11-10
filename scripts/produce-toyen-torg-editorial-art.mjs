/* History Go: original editorial illustrations of Tøyen torg; independently authored, no embedded source photography. */
(async function painter(){
  const fs=await import('node:fs/promises');
  const path=await import('node:path');
  const crypto=await import('node:crypto');
  const sharp=(await import('sharp')).default;
  const check=process.argv.includes('--check');
  const e=(s)=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
  const R=(x,y,w,h,fill,rx=0,stroke='',sw=1)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''}/>`;
  const C=(x,y,r,fill,stroke='',sw=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''}/>`;
  const P=(points,fill,stroke='',sw=1)=>`<polygon points="${points}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''}/>`;
  const L=(x1,y1,x2,y2,stroke,width=3)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
  const T=(x,y,sz,txt,col='#28343a',weight=700)=>`<text x="${x}" y="${y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${sz}" font-weight="${weight}" fill="${col}" letter-spacing="1.2">${e(txt)}</text>`;
  const building=(x,y,w,h,shade='#b76e55')=>{
    let s=R(x,y,w,h,shade)+R(x,y,w,h,'url(#brick)',0,'#795143',3)+R(x,y-13,w,15,'#78554d');
    const cols=Math.max(2,Math.floor((w-42)/78)),rows=Math.max(2,Math.floor((h-45)/86));
    const dx=w/(cols+1),dy=h/(rows+1);
    for(let j=1;j<=rows;j++)for(let i=1;i<=cols;i++){const xx=x+dx*i-23,yy=y+dy*j-26;
      s+=R(xx,yy,44,54,'#465a68',2,'#e5b89a',5)+R(xx+5,yy+5,34,40,'#7b9ba6')+L(xx+22,yy+3,xx+22,yy+49,'#3b505b',3)+L(xx+3,yy+31,xx+42,yy+31,'#3b505b',3);}
    return s;
  };
  const tree=(x,y,scale=1)=>{
    let s=`<g transform="translate(${x} ${y}) scale(${scale})">`+`<path d="M0 0 C-5 -75 -8 -125 -13 -165 M-7 -90 L-64 -151 M-3 -117 L58 -176" fill="none" stroke="#796048" stroke-width="17" stroke-linecap="round"/>`;
    for(const [cx,cy,r,fill] of [[-56,-170,43,'#739957'],[-13,-204,48,'#8bac63'],[38,-169,44,'#6f9657'],[-76,-136,31,'#9bb670'],[20,-133,43,'#86a85e'],[68,-145,24,'#a2ba7e']])s+=C(cx,cy,r,fill,'#547c4d',2);
    return s+'</g>';
  };
  const lamp=(x,y,scale=1)=>{
    let s=`<g transform="translate(${x} ${y}) scale(${scale})">`;
    s+=`<path d="M0 0 L0 -285 Q0 -299 12 -311 L29 -327 M2 -239 Q-18 -261 -42 -267" stroke="#97603e" stroke-width="14" fill="none" stroke-linecap="round"/>`;
    s+=`<path d="M0 -290 L0 -9" stroke="#dd9b62" stroke-width="5" opacity=".75"/>`;
    for(const [cx,cy,r] of [[40,-332,34],[-51,-270,28]])s+=C(cx,cy,r,'#dce9e7','#6b7671',5)+C(cx-9,cy-9,r*.43,'#fffef2')+L(cx,cy+r-7,cx,cy+r+10,'#ab7b46',4);
    return s+'</g>';
  };
  const planter=(x,y,scale=1)=>{
    let s=`<g transform="translate(${x} ${y}) scale(${scale})">`;
    s+=P('-72,-30 78,-30 60,18 -61,18','#b56b56','#864e43',3);
    s+=R(-76,-37,156,15,'#d09578',2);
    for(let i=0;i<8;i++){const xx=-56+i*16; s+=`<path d="M${xx} -33 q -14 -25 ${i%2?-8:7} -63" fill="none" stroke="#547a45" stroke-width="5"/>`+C(xx+(i%2?8:-5),-74-(i%3)*8,12,['#9eb95d','#8dab52','#7ca353'][i%3]);}
    return s+'</g>';
  };
  const paving=(y,w,h)=>{
    let s=P(`0,${y} ${w},${y} ${w},${h} 0,${h}`,'#d59375')+P(`0,${y+80} ${w},${y+8} ${w},${h} 0,${h}`,'url(#pavers)');
    const pts=`0,${y+115} ${Math.round(w*.18)},${y+95} ${Math.round(w*.35)},${y+155} ${Math.round(w*.55)},${y+100} ${Math.round(w*.78)},${y+160} ${w},${y+130} ${w},${y+225} ${Math.round(w*.75)},${y+250} ${Math.round(w*.53)},${y+195} ${Math.round(w*.32)},${y+255} ${Math.round(w*.12)},${y+207} 0,${y+238}`;
    return s+P(pts,'#b75e50')+P(`0,${y+170} ${Math.round(w*.19)},${y+159} ${Math.round(w*.35)},${y+206} ${Math.round(w*.54)},${y+156} ${Math.round(w*.78)},${y+214} ${w},${y+180} ${w},${y+207} ${Math.round(w*.78)},${y+237} ${Math.round(w*.54)},${y+178} ${Math.round(w*.35)},${y+229} ${Math.round(w*.18)},${y+184} 0,${y+199}`,'#efbc88');
  };
  const footer=(w,h,label)=>R(0,h-64,w,64,'#263e44')+T(24,h-24,20,label.toUpperCase(),'#fff6e8',700);
  const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>
  <linearGradient id="sky" x1="0" x2=".25" y1="0" y2="1"><stop stop-color="#acd6e9"/><stop offset="1" stop-color="#f2e5cf"/></linearGradient>
  <pattern id="brick" width="45" height="24" patternUnits="userSpaceOnUse"><path d="M0 0H45M0 12H45M23 0V12M0 12V24" stroke="#e8b599" stroke-width="1.6" opacity=".4"/></pattern>
  <pattern id="pavers" width="68" height="38" patternUnits="userSpaceOnUse"><path d="M0 0H68M0 19H68M34 0V19M0 19V38" stroke="#a55446" stroke-width="2.4" opacity=".5"/><path d="M2 2H28" stroke="#f6c8a3" stroke-width="3" opacity=".6"/></pattern>
  <pattern id="stone" width="22" height="18" patternUnits="userSpaceOnUse"><path d="M0 0H22M0 9H22M11 0V9M0 9V18" stroke="#be715c" opacity=".4" stroke-width="1.1"/></pattern>
  </defs>${body}</svg>`;
  function view(kind,w,h){
    if(kind==='hero'||kind==='front'||kind==='card'){
      const portrait=kind==='front',square=kind==='card';
      const ground=portrait?735:(square?550:410);
      let s=R(0,0,w,h,'url(#sky)')+C(w*.78,102,64,'#fff3d2');
      if(portrait){
        s+=building(-60,345,340,430,'#ad6951')+building(450,315,515,505,'#bd8063')+building(275,405,220,318,'#ad755b');
        s+=paving(ground,w,h)+tree(158,845,1.15)+tree(746,817,.95)+lamp(665,826,1.5)+planter(315,1030,1.7)+planter(734,1120,1.1);
      }else{
        s+=building(-40,190,355,280,'#b47458')+building(w-365,155,415,340,'#bd7d5d')+building(w*.39,230,w*.26,220,'#a96751');
        s+=paving(ground,w,h)+tree(240,495,.78)+tree(w-214,500,.82)+lamp(w*.66,523,.9)+planter(w*.42,h-73,1.0);
        if(square){s+=lamp(186,550,.64)+planter(800,730,1.1);}
      }
      s+=R(24,21,portrait?490:435,62,'#243a40',12)+T(45,65,portrait?38:35,'TØYEN TORG','#fff3df');
      s+=footer(w,h,'Redaksjonell illustrasjon · ikke fotografi');
      return svg(w,h,s);
    }
    if(kind==='paving'){
      let s=R(0,0,w,h,'#d9987b')+R(0,0,w,h,'url(#stone)');
      const colors=['#b55c50','#d3755a','#e9ab79','#dcb482','#a95e55','#e7c2a1','#c37962','#f1c392'];
      for(let row=0;row<19;row++)for(let col=0;col<19;col++){const x=col*58-22+(row%2?26:0),y=row*55-20;
        const k=(Math.abs(row-9)<3||Math.abs(col-9)<3||(row+col)%7===0)?(row*3+col)%colors.length:(row+col)%colors.length;
        s+=R(x,y,54,49,colors[k],0,'#99594b',2);}
      s+=P('80,730 280,510 508,660 735,310 970,500 770,770 525,815 284,940','#824d47','#fff0c8',7);
      s+=P('170,725 294,600 506,733 740,405 877,508 730,670 515,739 305,860','#efc68f');
      s+=R(24,21,w-48,64,'#273c42',10)+T(49,65,35,'TØYENTEPPENE · TEGLMØNSTER','#fff6e3');
      return svg(w,h,s+footer(w,h,'Skjematisk illustrasjon · ikke fotografi'));
    }
    if(kind==='lamps'){
      let s=R(0,0,w,h,'url(#sky)')+C(742,157,90,'#fff1d2')+building(-55,414,344,485,'#af725a')+building(709,365,390,580,'#bb7455');
      s+=paving(724,w,h)+tree(196,700,.9)+tree(835,712,.77);
      s+=lamp(560,883,2.02)+lamp(318,856,.82)+planter(806,903,1.25);
      s+=R(20,21,w-40,64,'#273c42',10)+T(47,64,35,'LYSMASTER · KOBBER OG GLASS','#fff6e3');
      return svg(w,h,s+footer(w,h,'Skjematisk illustrasjon · ikke fotografi'));
    }
    if(kind==='structure'){
      let s=R(0,0,w,h,'url(#sky)')+building(0,240,420,620,'#ac705b')+building(608,188,420,662,'#b2775b')+building(355,355,305,455,'#9e634e');
      s+=R(412,522,198,288,'#526b72',0,'#e1b69d',11)+R(456,565,112,237,'#bdcec6');
      s+=paving(760,w,h)+tree(195,851,.9)+tree(820,846,.8)+lamp(535,895,.6);
      s+=R(20,21,w-40,64,'#273c42',10)+T(46,64,37,'TØYENSENTERET · BYROMSRAMME','#fff6e3');
      return svg(w,h,s+footer(w,h,'Redaksjonell illustrasjon · ikke fotografi'));
    }
    throw Error('unknown illustration kind '+kind);
  }
  const work=[
    ['hero',1200,675,'bilder/places/toyen_torg.webp'],
    ['front',900,1200,'bilder/places/toyen_torg_front_portrait.webp'],
    ['card',900,900,'bilder/kort/places/toyen_torg.webp'],
    ['paving',1024,1024,'bilder/kort/objects/toyen_torg_toyenteppene.webp'],
    ['lamps',1024,1024,'bilder/kort/objects/toyen_torg_lysmaster.webp'],
    ['structure',1024,1024,'bilder/kort/structures/toyen_torg_toyensenteret.webp']
  ];
  for(const [kind,w,h,file] of work){
    const art=view(kind,w,h);
    const buf=await sharp(Buffer.from(art)).webp({quality:87,effort:5}).toBuffer();
    if(check){const old=await fs.readFile(file);if(!old.equals(buf))throw Error(file+' is not synchronized with the original artwork script');}
    else {await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,buf);}
    console.log(kind,w,h,buf.length,crypto.createHash('sha256').update(buf).digest('hex').slice(0,16),file);
  }
})().catch(e=>{console.error(e);process.exitCode=1});
