#!/usr/bin/env node
/**
 * Source discovery only. This script never edits canonical Brands, PlaceCard or images.
 * It identifies on-page logo resource URLs from official sites for human review.
 */
import fs from "node:fs/promises";
import path from "node:path";

const SITES = [
  ["olivia", "https://oliviarestauranter.no/"],
  ["lund_hagem", "https://www.lundhagem.no/"],
  ["simonsen_vogt_wiig", "https://svw.no/"],
  ["wiersholm", "https://wiersholm.no/"],
  ["haavind", "https://haavind.no/"]
];
const outPath="reports/place-production/aker-brygge-official-logo-discovery-2026-11-19.json";
function clean(s) { return s.replace(/&amp;/g,"&").replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&#x27;/g,"'"); }
function normalize(raw, base) {
  if(!raw || raw.startsWith("data:") || raw.startsWith("#") || raw.startsWith("javascript:"))return null;
  try {
    const u=new URL(clean(raw.trim()),base);
    if(!["http:","https:"].includes(u.protocol))return null;
    u.hash="";
    return u.href;
  } catch {return null;}
}
function candidates(html,base) {
  const found=new Map();
  for(const match of html.matchAll(/<(?:img|image|link|source|meta)\b[^>]{0,3000}>/gi)) {
    const tag=match[0];
    const attrs=Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)].map(a=>[a[1].toLowerCase(),a[3]??a[4]??""]));
    const context=[attrs.alt,attrs.title,attrs.class,attrs.id,attrs.rel,attrs.property,attrs.name,tag].join(" ").slice(0,500);
    if(!/logo|brand|wordmark|header|navbar|og:image|primary|identity/i.test(context))continue;
    for(const key of ["src","data-src","href","content","srcset","data-srcset"]) {
      const raw=attrs[key];
      if(!raw)continue;
      const urls=key.includes("srcset")?raw.split(",").map(v=>v.trim().split(/\s+/)[0]):[raw];
      for(const value of urls){
        const url=normalize(value,base);
        if(!url || !/\.(?:png|webp|jpe?g|svg)(?:\?|$)|\/uploads\/|\/media\//i.test(url))continue;
        const score=(/logo|wordmark|logotype/i.test(url)?5:0)+(/logo|wordmark/i.test(context)?4:0)+(/\.svg(?:\?|$)/i.test(url)?3:0)+(/header|nav|site-brand/i.test(context)?1:0);
        const prev=found.get(url);
        if(!prev || prev.score<score)found.set(url,{url,score,via:key,context:context.replace(/\s+/g," ").slice(0,180)});
      }
    }
  }
  const naked=[...html.matchAll(/["']([^"'<>]{0,260}(?:logo|wordmark)[^"'<>]{0,260}\.(?:svg|png|webp))["']/gi)];
  for(const m of naked) {
    const url=normalize(m[1],base);
    if(url && !found.has(url) && /\/.*(?:logo|wordmark)/i.test(url)) found.set(url,{url,score:5,via:"html-text",context:"logo-associated HTML source"});
  }
  return [...found.values()].sort((a,b)=>b.score-a.score).slice(0,30);
}
const result={schema:"history_go_aker_brygge_official_logo_discovery_v1",placeId:"aker_brygge",date:"2026-11-19",brandCount:5,usage:"research_only",noImagesPublished:true,sites:[]};
for(const [id,url] of SITES) {
  let status="FETCH_ERROR",assets=[],error=null,finalUrl=url;
  try {
    const res=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{"User-Agent":"Mozilla/5.0 (compatible; HistoryGoLogoAudit/1.0)",Accept:"text/html"}});
    status="HTTP_"+res.status;finalUrl=res.url;
    const body=await res.text();
    if(res.ok)assets=candidates(body,finalUrl);
  } catch (e) {error=String(e).slice(0,240);}
  const record={brandId:id,sourcePage:url,finalUrl,status,assets,error,verification:"UNVERIFIED_DISCOVERY_ONLY",publishable:false};
  result.sites.push(record);
  console.log(id+": "+status+"; candidates="+assets.length);
  for (const a of assets.slice(0,8))console.log("  "+a.score+" "+a.url);
}
await fs.mkdir(path.dirname(outPath),{recursive:true});
await fs.writeFile(outPath,JSON.stringify(result,null,2)+"\n");
