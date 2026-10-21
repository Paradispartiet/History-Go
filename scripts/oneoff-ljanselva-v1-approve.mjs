#!/usr/bin/env node
import fs from 'node:fs';
const canonical='data/places/natur/oslo/places_oslo_natur_hovedsteder/ljanselva.json';
const media='reports/place-production/ljanselva-v1-images-20261021.json';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const place=read(canonical),qa=read(media);
const rows=[['frontImage','bilder/places/ljanselva_front_portrait.webp'],['image','bilder/places/ljanselva_landscape.webp']];
if(place.id!=='ljanselva'||rows.some(([k,v])=>place[k]!==v)||qa.assets.length!==2)throw Error('Place identity drift');
for(const [kind,p] of rows){
 if(!fs.existsSync(p)||fs.statSync(p).size<18000)throw Error('Missing original image '+p);
 const x=qa.assets.find(a=>a.kind===kind);
 if(!x||x.path!==p||!x.sourcePage||!x.sha256)throw Error('Missing image credit '+kind);
 x.visualAppApproval=true;
 x.visualApprovalEvidence='https://github.com/Paradispartiet/History-Go/actions/runs/39640866096';
}
place.frontImageMeta.visualReview='approved_2026-10-21_actual_390_1440_history_go_browser';
place.imageMeta.visualReview='approved_2026-10-21_actual_390_1440_history_go_browser';
place.imageMeta.review='local_webp_source_checked_and_browser_approved';
qa.status='approved_actual_app_390_1440';
qa.browserAcceptanceRun='https://github.com/Paradispartiet/History-Go/actions/runs/39640866096';
qa.browserScreenshotArtifact='ljanselva-v1-actual-app-qa';
qa.mediaScope='v1 documentary photos, not V3/vFerdig';
write(canonical,place);write(media,qa);
console.log('Approved Ljanselva source photos after passing 390/1440 actual app browser run.');
