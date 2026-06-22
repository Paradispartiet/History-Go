(function(){
  'use strict';
  const root=typeof window!=='undefined'?window:globalThis;
  const ID='hgSocialMatchGraphPanel';
  function doc(){return root.document;}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function panel(){return doc()?.getElementById?.(ID)||null;}
  function isEnabled(){return !!root.HG_SocialMatchGraph;}
  function html(){const g=root.HG_SocialMatchGraph?.buildMatchGraph?.({limit:10})||{self:{},matches:[],warnings:['match_graph_missing'],privacy:{}}; const top=(g.matches||[]).slice(0,5); const placeId=(root.PLACES||[])[0]?.id||g.self?.favoritePlaces?.[0]||''; const place=placeId?root.HG_SocialMatchGraph.getMatchesForPlace(placeId,{limit:10}).slice(0,3):[]; return `<h2>HG Social Match Graph</h2><section><h3>Self profile</h3><p>${esc(g.self?.avatarEmoji)} ${esc(g.self?.displayName)} · ${esc(g.self?.matchVisibility||'preview')}</p></section><section><h3>Top matches</h3>${top.length?top.map(m=>`<article><strong>${esc(m.candidate?.avatarEmoji)} ${esc(m.candidate?.displayName)}</strong> · ${m.score}<br><span>${esc((m.reasons||[])[0]||'Kunnskapsmatch')}</span></article>`).join(''):'<p>Ingen matcher ennå.</p>'}</section><section><h3>Place matches</h3>${place.length?place.map(m=>`<div>${esc(m.candidate?.displayName)} · ${esc((m.reasons||[])[0]||'Kunnskapsmatch')}</div>`).join(''):'<p>Ingen stedsspesifikke matcher.</p>'}</section><section><h3>Privacy</h3><p>Lokal kunnskapsmatch uten backend, posisjonssporing, sanntidsstatus eller kontaktmetrikk.</p></section><section><h3>Warnings</h3><ul>${(g.warnings||[]).map(w=>`<li>${esc(w)}</li>`).join('')||'<li>Ingen</li>'}</ul></section><button type="button" data-hg-smg-refresh>Oppdater</button><button type="button" data-hg-smg-close>Skjul</button>`;}
  function bind(el){el.querySelector('[data-hg-smg-refresh]')?.addEventListener('click',refresh); el.querySelector('[data-hg-smg-close]')?.addEventListener('click',remove);}
  function render(mount){if(!doc()||!isEnabled())return null; let el=mount||panel(); if(!el){el=doc().createElement('aside'); el.id=ID; el.style=el.style||{}; el.style.cssText='position:fixed;left:16px;top:16px;z-index:2147483646;max-width:430px;max-height:calc(100vh - 32px);overflow:auto;background:#fff;color:#111;border:1px solid #ccc;border-radius:12px;padding:12px;font:14px system-ui'; doc().body?.appendChild(el);} el.innerHTML=html(); bind(el); return el;}
  function refresh(){return render(panel());}
  function remove(){panel()?.remove?.();}
  root.HG_SocialMatchGraphPanel={render,refresh,remove,isEnabled};
  root.HGSocialMatchGraphPanel=root.HG_SocialMatchGraphPanel;
}());
