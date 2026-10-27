// Read-only explorer for both canonical flora/fauna shards.
// Never writes to hg_nature_unlocks_v2. Quiz progression remains authoritative.
(() => {
"use strict";
const kind = document.body.dataset.natureKind;
if (!["fauna","flora"].includes(kind)) return;
const icon = kind === "fauna" ? "🐾" : "🌿";
const grid=document.getElementById("natureGrid"),stats=document.getElementById("natureStats"),count=document.getElementById("natureCount"),
 search=/** @type {HTMLInputElement} */ (document.getElementById("natureSearch")),message=document.getElementById("natureMessage"),more=document.getElementById("natureMore"),
 dialog=/** @type {HTMLDialogElement} */ (document.getElementById("natureDialog")),details=document.getElementById("natureDetails");
let all=[],activeFilter="all",limit=36,atlas=null;
const illustrationFor = a => atlas?.images?.[String(a.id)] ?? null;
function addSpeciesArt(parent,a,decorative=false){
 const fallback=()=>{parent.replaceChildren(node("span","ne-image-placeholder",icon));};
 const direct=photo(a);
 if(direct){const img=node("img","ne-direct-image");img.src=direct;img.alt=decorative?"":name(a);
 img.loading="lazy";img.decoding="async";img.addEventListener("error",fallback,{once:true});parent.appendChild(img);return;}
 const info=illustrationFor(a),sprite=atlas?.sprite;
 if(!info || !sprite || !Number.isInteger(info.index)){fallback();return;}
 const cols=Number(sprite.columns),rows=Number(sprite.rows),i=info.index;
 if(!Number.isInteger(cols)||!Number.isInteger(rows)||cols<1||rows<1||i<0||i>=cols*rows){fallback();return;}
 const crop=node("span","ne-sprite-crop");
 const img=node("img","ne-sprite-image");
 img.src=sprite.src;img.alt=decorative?"":name(a)+" – KI-generert illustrasjon";img.loading="lazy";img.decoding="async";
 img.style.width=(cols*100)+"%";img.style.height=(rows*100)+"%";
 img.style.left=(-(i%cols)*100)+"%";img.style.top=(-Math.floor(i/cols)*100)+"%";
 img.addEventListener("error",fallback,{once:true});
 crop.appendChild(img);parent.appendChild(crop);
}

const node=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!=null)x.textContent=String(txt);return x;};
const list=(v)=>Array.isArray(v)?v.filter(Boolean).map(String):v?[String(v)]:[];
const name=(a)=>String(a.taxonomy?.norsk_navn || a.title || a.name || a.id || "Ukjent art");
const latin=(a)=>String(a.latin || a.taxonomy?.latin_navn || "");
function collected(){
 try{const db=JSON.parse(localStorage.getItem("hg_nature_unlocks_v2")||"{}");return new Set(list(db?.collected?.[kind]));}
 catch{return new Set();}
}
function photo(a){
 const src=a.image || a.imageCard || a.img;
 return typeof src==="string" && /^(https:\/\/|\.?\.?\/|bilder\/|assets\/)/.test(src) ? src : "";
}
function appendImage(parent,src,alt){
 const img=node("img");img.alt=alt;img.loading="lazy";img.src=src;
 img.addEventListener("error",()=>img.remove(),{once:true});parent.appendChild(img);
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
 details.appendChild(node("p","ne-detail-eyebrow",kind==="flora"?"NATURATLAS · FLORA":"NATURATLAS · FAUNA"));
 const h=node("h2","",name(a));h.id="natureDetailTitle";details.appendChild(h);
 if(latin(a))details.appendChild(node("p","ne-detail-latin",latin(a)));
 details.appendChild(node("p","ne-detail-status",collected().has(String(a.id))?"✓ Samlet gjennom quiz":"Ikke samlet ennå"));
 const media=node("div","ne-modal-media");addSpeciesArt(media,a,false);details.appendChild(media);
 if(illustrationFor(a) && !photo(a))details.appendChild(node("p","ne-art-credit","KI-generert illustrasjon · Veiledende motiv, ikke dokumentasjon av et funn."));
 const traits=list(a.kjennetegn);if(traits.length)details.appendChild(node("p","ne-trait-intro",traits[0]));
 section("Kjennetegn",a.kjennetegn);
 section("Leveområder",a.habitat?.biotop||a.bykontekst?.typiske_steder);
 section("Observasjonstips",a.observasjonstips);
 section("Blomstring og sesong",a.fenologi?.blomstring);
 section("Økologisk rolle",a.økologi?.rolle);
 section("Typiske steder i byen",a.bykontekst?.typiske_steder);
 section("Familie",a.taxonomy?.familie);
 const source=list(a.source_urls).find(v=>v.startsWith("https://"));
 if(source){const s=node("section","ne-detail-section");s.appendChild(node("h3","","Kilde"));
  const aLink=node("a","","Se artskilde ↗");aLink.href=source;aLink.target="_blank";aLink.rel="noopener noreferrer";s.appendChild(aLink);details.appendChild(s);}
 if(typeof dialog.showModal==="function")dialog.showModal();
 else dialog.setAttribute("open","");
}
function card(a,have){
 const b=node("button","ne-card");b.type="button";b.setAttribute("aria-label",name(a)+(have?", samlet":", ikke samlet"));
 const image=node("div","ne-photo");addSpeciesArt(image,a,true);
 if(illustrationFor(a) && !photo(a))image.appendChild(node("span","ne-image-kind","ILLUSTRASJON"));
 b.appendChild(image);
 const body=node("div","ne-card-body");body.appendChild(node("span","ne-card-title",name(a)));
 if(latin(a))body.appendChild(node("span","ne-latin",latin(a)));
 const traits=list(a.kjennetegn);if(traits.length)body.appendChild(node("span","ne-card-trait",traits[0]));
 body.appendChild(node("span","ne-status"+(have?" collected":""),have?"✓ Samlet":"Ikke samlet"));
 b.appendChild(body);b.addEventListener("click",()=>openArt(a));return b;
}
function render(){
 const unlocked=collected();
 const term=search.value.trim().toLocaleLowerCase("nb");
 const matches=all.filter(a=>{
  if(activeFilter==="collected"&&!unlocked.has(String(a.id)))return false;
  return !term||[name(a),latin(a),...list(a.kjennetegn),...list(a.habitat?.biotop)].join(" ").toLocaleLowerCase("nb").includes(term);
 });
 const held=all.filter(a=>unlocked.has(String(a.id))).length;
 stats.textContent=all.length+" arter · "+held+" samlet";
 count.textContent=matches.length+" treff";
 const fragment=document.createDocumentFragment();
 matches.slice(0,limit).forEach(a=>fragment.appendChild(card(a,unlocked.has(String(a.id)))));
 grid.replaceChildren(fragment);
 message.hidden=matches.length>0;
 if(!matches.length)message.textContent=activeFilter==="collected"&&!term
  ?"Ingen arter samlet ennå. Utforsk steder og ta quiz i History Go.":"Ingen arter passer søket.";
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
  try{
   const ar=await fetch("data/nature-illustrations.json");
   if(ar.ok){
    const candidate=await ar.json();
    if(candidate?.schema==="history-go-nature-illustrations-v1" &&
       /^assets\/nature\/illustrations\/[a-z0-9-]+\.webp$/.test(candidate?.sprite?.src||"") &&
       candidate.images && typeof candidate.images==="object")atlas=candidate;
   }
  }catch(e){console.warn("[NatureExplorer] Illustrasjonspakke utilgjengelig",e);}
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
document.getElementById("natureBack").addEventListener("click",()=>{
 try{if(document.referrer&&new URL(document.referrer).origin===location.origin&&history.length>1){history.back();return;}}
 catch{}
 location.href="index.html";
});
window.addEventListener("pageshow",()=>{if(all.length)render();});
load();
})();
