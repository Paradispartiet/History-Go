// Read-only explorer for both canonical flora/fauna shards.
// Never writes to hg_nature_unlocks_v2. Quiz progression remains authoritative.
(() => {
"use strict";
const kind = document.body.dataset.natureKind;
if (!["fauna","flora"].includes(kind)) return;
const icon = kind === "fauna" ? "🐾" : "🌿";
const drawings = window.HG_NATURE_ILLUSTRATIONS;
const grid=document.getElementById("natureGrid"),stats=document.getElementById("natureStats"),count=document.getElementById("natureCount"),
 search=/** @type {HTMLInputElement} */ (document.getElementById("natureSearch")),message=document.getElementById("natureMessage"),more=document.getElementById("natureMore"),
 dialog=/** @type {HTMLDialogElement} */ (document.getElementById("natureDialog")),details=document.getElementById("natureDetails");
let all=[],activeFilter="all",limit=36;
const node=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!=null)x.textContent=String(txt);return x;};
const list=(v)=>Array.isArray(v)?v.filter(Boolean).map(String):v?[String(v)]:[];
const name=(a)=>String(a.taxonomy?.norsk_navn || a.title || a.name || a.id || "Ukjent art");
const latin=(a)=>String(a.latin || a.taxonomy?.latin_navn || "");
function collected(){
 try{const db=JSON.parse(localStorage.getItem("hg_nature_unlocks_v2")||"{}");return new Set(list(db?.collected?.[kind]));}
 catch{return new Set();}
}
function photo(a){
 const art=drawings?.resolve(String(a.id));
 if(art)return art;
 const src=a.image || a.imageCard || a.img;
 if(typeof src==="string" && /^(https:\/\/|\.?\.?\/|bilder\/|assets\/)/.test(src))return src;
 return "";
}
function illustrated(a){return Boolean(drawings?.has(String(a.id)));}
function fallback(parent){parent.replaceChildren(node("span","ne-image-fallback",icon));}
function appendImage(parent,src,alt){
 const img=node("img");img.alt=alt;img.loading="lazy";img.src=src;
 img.addEventListener("error",()=>fallback(parent),{once:true});parent.appendChild(img);
}
function section(title,values){
 const vals=list(values);
 if(!vals.length)return;
 const s=node("section","ne-detail-section");s.appendChild(node("h3","",title));
 if(vals.length===1)s.appendChild(node("p","",vals[0]));
 else{const ul=node("ul");vals.forEach(v=>ul.appendChild(node("li","",v)));s.appendChild(ul);}
 details.appendChild(s);
}
function openArt(a){
 details.replaceChildren();
 details.appendChild(node("div","",icon));
 const h=node("h2","",name(a));h.id="natureDetailTitle";details.appendChild(h);
 if(latin(a))details.appendChild(node("p","ne-detail-latin",latin(a)));
 details.appendChild(node("p","ne-detail-status",collected().has(String(a.id))?"✓ Samlet gjennom quiz":"Ikke samlet ennå"));
 if(photo(a)){
  const wrap=node("div","ne-detail-artwork");appendImage(wrap,photo(a),"Illustrasjon av "+name(a));
  if(wrap.firstChild?.tagName==="IMG")wrap.firstChild.className="ne-dialog-image";
  if(illustrated(a))wrap.appendChild(node("p","ne-image-credit","Forenklet originalillustrasjon · ikke et artsbestemmelsesfoto"));
  details.appendChild(wrap);
 }
 section("Kjennetegn",a.kjennetegn);
 section("Leveområder",a.habitat?.biotop||a.bykontekst?.typiske_steder);
 section("Observasjonstips",a.observasjonstips);
 section("Når kan du se arten?",a.fenologi?.blomstring || a.fenologi?.sesong);
 section("Økologisk rolle",a.økologi?.rolle);
 section("I Oslo",a.bykontekst?.typiske_steder);
 section("Familie",a.taxonomy?.familie);
 const source=list(a.source_urls).find(v=>v.startsWith("https://"));
 if(source){const s=node("section","ne-detail-section");s.appendChild(node("h3","","Kilde"));
  const aLink=node("a","","Se artskilde ↗");aLink.href=source;aLink.target="_blank";aLink.rel="noopener noreferrer";s.appendChild(aLink);details.appendChild(s);}
 if(typeof dialog.showModal==="function")dialog.showModal();
 else dialog.setAttribute("open","");
}
function card(a,have){
 const b=node("button","ne-card");b.type="button";b.setAttribute("aria-label",name(a)+(have?", samlet":", ikke samlet"));
 const image=node("div","ne-photo",icon);
 if(photo(a)){image.textContent="";appendImage(image,photo(a),"");}
 if(illustrated(a))image.appendChild(node("span","ne-image-label","Illustrasjon"));
 b.appendChild(image);
 const body=node("div","ne-card-body");body.appendChild(node("span","ne-card-title",name(a)));
 if(latin(a))body.appendChild(node("span","ne-latin",latin(a)));
 body.appendChild(node("span","ne-status"+(have?" collected":""),have?"✓ Samlet":"Ikke samlet"));
 b.appendChild(body);b.addEventListener("click",()=>openArt(a));return b;
}
function render(){
 const unlocked=collected();
 const term=search.value.trim().toLocaleLowerCase("nb");
 const matches=all.filter(a=>{
  if(activeFilter==="collected"&&!unlocked.has(String(a.id)))return false;
  if(activeFilter==="illustrated"&&!illustrated(a))return false;
  return !term||[name(a),latin(a),a.taxonomy?.familie,...list(a.kjennetegn),...list(a.habitat?.biotop),...list(a.observasjonstips),...list(a.bykontekst?.typiske_steder)].join(" ").toLocaleLowerCase("nb").includes(term);
 });
 const held=all.filter(a=>unlocked.has(String(a.id))).length;
 stats.textContent=all.length+" oppføringer · "+held+" samlet · "+all.filter(illustrated).length+" illustrert";
 count.textContent=matches.length+" treff";
 const fragment=document.createDocumentFragment();
 matches.slice(0,limit).forEach(a=>fragment.appendChild(card(a,unlocked.has(String(a.id)))));
 grid.replaceChildren(fragment);
 message.hidden=matches.length>0;
 if(!matches.length)message.textContent=activeFilter==="collected"&&!term
  ?"Ingen arter samlet ennå. Utforsk steder og ta quiz i History Go.":activeFilter==="illustrated"&&!term ? "Ingen illustrasjoner er publisert ennå.":"Ingen arter passer søket.";
 more.hidden=matches.length<=limit;
}
async function load(){
 try{
  const res=await fetch("data/runtime/nature-all.json");
  if(!res.ok)throw new Error("Kunne ikke laste artsmanifestet");
  const manifest=await res.json();
  const files=manifest?.groups?.[kind];
  if(!Array.isArray(files)||!files.length)throw new Error("Manglende artsgruppe");
  const chunks=await Promise.all(files.map(async path=>{
   if(typeof path!=="string"||!path.startsWith("data/runtime/nature-all/"))throw new Error("Uventet artsfil");
   const r=await fetch(path);if(!r.ok)throw new Error("Kunne ikke laste artsfil");
   const data=await r.json();if(!Array.isArray(data))throw new Error("Ugyldige artsdata");
   return data;
  }));
  const byId=new Map();
  chunks.flat().forEach(x=>{
   const items=x?.kind==="emne_pack"&&Array.isArray(x.items)?x.items:[x];
   items.forEach(a=>{if(a&&typeof a==="object"&&a.id)byId.set(String(a.id),a);});
  });
  all=Array.from(byId.values()).sort((a,b)=>name(a).localeCompare(name(b),"nb"));
  render();
 }catch(error){
  console.warn("[NatureExplorer]",error);
  stats.textContent="Artsoversikten er utilgjengelig";
  count.textContent="";message.hidden=false;
  message.textContent="Kunne ikke laste arter. Oppdater siden og prøv igjen.";
  more.hidden=true;
 }
}
search.addEventListener("input",()=>{limit=36;render();});
document.querySelectorAll("[data-filter]").forEach(btn=>btn.addEventListener("click",()=>{
 activeFilter=btn.dataset.filter;limit=36;
 document.querySelectorAll("[data-filter]").forEach(x=>{const on=x===btn;x.classList.toggle("active",on);x.setAttribute("aria-pressed",String(on));});
 render();
}));
more.addEventListener("click",()=>{limit+=36;render();});
const closeDialog=()=>{if(typeof dialog.close==="function")dialog.close();else dialog.removeAttribute("open");};
document.getElementById("natureClose").addEventListener("click",closeDialog);
dialog.addEventListener("click",e=>{if(e.target===dialog)closeDialog();});
const toggle=document.getElementById("natureMenuToggle"),nav=document.getElementById("natureMenu");
const closeMenu=()=>{nav.hidden=true;toggle.setAttribute("aria-expanded","false");};
toggle.addEventListener("click",()=>{nav.hidden=!nav.hidden;toggle.setAttribute("aria-expanded",String(!nav.hidden));});
document.addEventListener("click",e=>{if (!(e.target instanceof Element) || !e.target.closest(".ne-menu-wrap")) closeMenu();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu();});
// Back navigation is owned by the shared header module on nature pages.
window.addEventListener("pageshow",()=>{if(all.length)render();});
load();
})();
