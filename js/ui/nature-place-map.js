// @ts-nocheck
// Dedicated hiking/nature map for nature places.
// This is deliberately separate from the ordinary History GO main map.
(function installNaturePlaceMap(global) {
  "use strict";

  const ROOT_ID="hgNaturePlaceMap";
  const styleId="hgNaturePlaceMapStyles";

  function s(value){return String(value==null?"":value).trim();}
  function esc(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}

  function isNaturePlace(place){return s(place?.category).toLowerCase()==="natur";}

  function norgeskartUrl(place){
    const query=encodeURIComponent(s(place?.name || place?.title || place?.id));
    // `project=norgeskart` is Kartverket's outdoor/topographic Norgeskart context.
    // Search text is used instead of inventing a coordinate transform for the external client.
    return `https://norgeskart.no/?project=norgeskart&sok=${query}`;
  }

  function artskartUrl(){return "https://artskart.artsdatabanken.no/";}
  function naturbaseUrl(){return "https://geocortex02.miljodirektoratet.no/Html5Viewer/?viewer=naturbase";}

  function ensureStyles(){
    if(document.getElementById(styleId)) return;
    const style=document.createElement("style");
    style.id=styleId;
    style.textContent=`
      #${ROOT_ID}[hidden]{display:none!important}
      #${ROOT_ID}{position:fixed;inset:0;z-index:10050;background:#070707;color:#fff;display:flex;flex-direction:column}
      #${ROOT_ID} .hg-nature-map-head{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.22);background:#090909}
      #${ROOT_ID} .hg-nature-map-title{min-width:0;flex:1;font:700 16px/1.2 system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #${ROOT_ID} .hg-nature-map-close{border:1px solid rgba(255,255,255,.55);background:#111;color:#fff;border-radius:999px;width:38px;height:38px;font-size:22px;line-height:1;cursor:pointer}
      #${ROOT_ID} .hg-nature-map-frame{border:0;width:100%;flex:1;min-height:0;background:#ece9df}
      #${ROOT_ID} .hg-nature-map-foot{padding:8px 10px 10px;border-top:1px solid rgba(255,255,255,.18);background:#090909;display:grid;gap:7px}
      #${ROOT_ID} .hg-nature-map-note{font:12px/1.35 system-ui,sans-serif;color:#d6d6d6}
      #${ROOT_ID} .hg-nature-map-links{display:flex;gap:8px;overflow-x:auto;padding-bottom:1px}
      #${ROOT_ID} .hg-nature-map-link{flex:0 0 auto;color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.36);border-radius:999px;padding:7px 10px;font:600 12px/1 system-ui,sans-serif}
    `;
    document.head.appendChild(style);
  }

  function ensureRoot(){
    ensureStyles();
    let root=document.getElementById(ROOT_ID);
    if(root) return root;
    root=document.createElement("section");
    root.id=ROOT_ID;
    root.hidden=true;
    root.setAttribute("role","dialog");
    root.setAttribute("aria-modal","true");
    root.setAttribute("aria-label","Turkart");
    root.innerHTML=`
      <header class="hg-nature-map-head">
        <div class="hg-nature-map-title" data-nature-map-title>Turkart</div>
        <button class="hg-nature-map-close" type="button" data-nature-map-close aria-label="Lukk kart">×</button>
      </header>
      <iframe class="hg-nature-map-frame" data-nature-map-frame title="Tur- og naturkart" loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      <footer class="hg-nature-map-foot">
        <div class="hg-nature-map-note">Turkart fra Kartverket/Norgeskart. Bruk Friluftsliv-lagene for merkede turruter og tilrettelegging. Naturbase og Artskart er separate fagkilder for naturtyper, vern og artsobservasjoner.</div>
        <div class="hg-nature-map-links">
          <a class="hg-nature-map-link" data-nature-map-open target="_blank" rel="noopener">Åpne Norgeskart</a>
          <a class="hg-nature-map-link" href="https://www.kartverket.no/api-og-data/friluftsliv" target="_blank" rel="noopener">Turrutedata</a>
          <a class="hg-nature-map-link" data-naturbase-open target="_blank" rel="noopener">Naturbase</a>
          <a class="hg-nature-map-link" data-artskart-open target="_blank" rel="noopener">Artskart</a>
        </div>
        <div class="hg-nature-map-note">Kartgrunnlag: © Kartverket. Arts- og naturdata følger vilkårene hos sine respektive dataeiere.</div>
      </footer>
    `;
    document.body.appendChild(root);
    root.querySelector("[data-nature-map-close]")?.addEventListener("click",close);
    root.addEventListener("keydown",event=>{if(event.key==="Escape") close();});
    return root;
  }

  function open(place){
    if(!isNaturePlace(place)){
      global.showToast?.("Turkart finnes bare på natursteder");
      return false;
    }
    const root=ensureRoot();
    const url=norgeskartUrl(place);
    const title=s(place?.name || place?.title || "Natursted");
    root.querySelector("[data-nature-map-title]").textContent=`Turkart · ${title}`;
    const frame=root.querySelector("[data-nature-map-frame]");
    if(frame && frame.getAttribute("src")!==url) frame.setAttribute("src",url);
    const openLink=root.querySelector("[data-nature-map-open]");
    if(openLink) openLink.setAttribute("href",url);
    root.querySelector("[data-naturbase-open]")?.setAttribute("href",naturbaseUrl());
    root.querySelector("[data-artskart-open]")?.setAttribute("href",artskartUrl());
    root.hidden=false;
    document.documentElement.classList.add("hg-nature-map-open");
    root.querySelector("[data-nature-map-close]")?.focus();
    return true;
  }

  function close(){
    const root=document.getElementById(ROOT_ID);
    if(!root) return;
    root.hidden=true;
    document.documentElement.classList.remove("hg-nature-map-open");
  }

  global.HGNaturePlaceMap={open,close,isNaturePlace,norgeskartUrl};
})(window);
