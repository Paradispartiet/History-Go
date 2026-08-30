// @ts-nocheck
(function installCanonicalPlaceFagverk(global){
  'use strict';

  const text=(v)=>String(v==null?'':v).trim();
  const list=(v)=>Array.isArray(v)?v:[];
  const esc=(v)=>String(v==null?'':v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');

  function hasPolitikkIdentity(place){
    const category=text(place?.category||place?.domain||place?.subject);
    const emneIds=list(place?.emne_ids||place?.emneIds).map(text);
    const secondaryBadges=list(place?.secondaryBadgeIds||place?.secondary_badge_ids).map(text);
    return category==='politikk'||emneIds.some((id)=>id.startsWith('em_pol_'))||secondaryBadges.includes('politikk');
  }

  async function init(){
    const placeId=text(new URLSearchParams(global.location.search).get('place'));
    if(!placeId||!global.HGPolitikkFagModel||!global.DataHub)return;

    const place=await global.DataHub.loadFullPlace(placeId,{bust:true}).catch(()=>null);
    if(!place||!hasPolitikkIdentity(place))return;

    const[core,places]=await Promise.all([
      global.HGPolitikkFagModel.loadCore(),
      global.DataHub.loadPlacesBase({bust:true}).catch(()=>[])
    ]);
    const model=global.HGPolitikkFagModel.resolvePlace(core,place);
    if(model.subject!=='politikk')return;
    const progress=global.HGPolitikkFagModel.readProgress(core,places);

    const path=document.getElementById('fagverkPlaceBadgePath');
    if(path){
      path.innerHTML=`<h2>Fra merke til fag</h2><p>Undermerkene organiserer stedene. Emnene og fagområdene gir den faglige forklaringen.</p><div class="fagverk-canonical-underbadges">${model.underbadges.map((x)=>`<a href="fagverk.html?subject=politikk#underbadge-${esc(x.id)}">${esc(x.label)}</a>`).join('')}</div><div class="fagverk-canonical-domain-grid">${model.domains.map((d)=>`<a class="fagverk-case" href="${esc(global.HGPolitikkFagModel.domainUrl(d.domain_id,{place:placeId}))}"><strong>${esc(d.label)}</strong><span>${esc(d.tagline)}</span><small>Åpne fagområdet →</small></a>`).join('')}</div>`;
      path.hidden=false;
    }

    const chapters=document.getElementById('fagverkPlaceChapters');
    if(chapters)chapters.innerHTML=model.chapters.map((c)=>`<a class="fagverk-case" href="${esc(global.HGPolitikkFagModel.chapterUrl(c.id,{place:placeId}))}"><strong>${esc(c.title)}</strong><span>${esc(c.subtitle)}</span><small>Les lærekapitlet →</small></a>`).join('');

    const concepts=document.getElementById('fagverkPlaceConcepts');
    if(concepts)concepts.innerHTML=model.concepts.slice(0,36).map((x)=>{
      const owner=model.emners.find((e)=>global.HGPolitikkFagModel.conceptsForEmne(e).includes(x));
      return `<a href="${esc(global.HGPolitikkFagModel.emneUrl(owner?.emne_id||'',{place:placeId,concept:x}))}">${esc(x)}</a>`;
    }).join('');

    const emners=document.getElementById('fagverkPlaceEmner');
    if(emners)emners.innerHTML=model.emners.map((e)=>{
      const row=progress.coverageById.get(text(e.emne_id))||{};
      return `<a href="${esc(global.HGPolitikkFagModel.emneUrl(e.emne_id,{place:placeId}))}">${esc(e.title)} <small>${Number(row.percent||0)}%</small></a>`;
    }).join('');
  }

  const start=()=>global.setTimeout(()=>init().catch((e)=>console.error('[fagverk-place-canonical]',e)),80);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
