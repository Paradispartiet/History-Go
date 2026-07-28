// @ts-nocheck
(function installFagverkPlaceTheme(global){
  'use strict';
  const CONTRACT_URL='data/fagverk/category_place_design.json';
  const text=(value)=>String(value==null?'':value).trim();
  const list=(value)=>Array.isArray(value)?value:[];

  async function fetchJson(url){const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`${response.status} ${url}`);return response.json();}
  function canonicalCategory(contract,place){const raw=text(place?.category||place?.domain||place?.subject);return text(contract?.aliases?.[raw]||raw);}
  function imageValue(place,priority){for(const field of list(priority)){const value=text(place?.[field]);if(value)return {field,value};}return {field:'',value:''};}
  function applyTokens(design){const root=document.documentElement;root.style.setProperty('--place-accent',text(design?.accent)||'#f1c84b');root.style.setProperty('--place-accent-secondary',text(design?.accentSecondary)||'#a989ff');root.style.setProperty('--place-surface',text(design?.surface)||'#11131a');root.style.setProperty('--place-glow',text(design?.glow)||'rgba(241,200,75,.2)');}
  function addInstructionPanel(category,design){const host=document.getElementById('fagverkPlaceBadgePath');if(!host||host.querySelector('[data-place-design-instruction]'))return;const panel=document.createElement('aside');panel.className='fagverk-place-design-note';panel.dataset.placeDesignInstruction='1';panel.innerHTML=`<p class="fagverk-kicker">${text(design?.label)||category}</p><h3>Slik leses dette stedet</h3><p>${text(design?.imageDirection)}</p>`;host.insertAdjacentElement('afterend',panel);}
  async function init(){
    const placeId=text(new URLSearchParams(global.location.search).get('place'));
    if(!placeId||!global.DataHub)return;
    const [contract,place]=await Promise.all([fetchJson(CONTRACT_URL),global.DataHub.loadFullPlace(placeId,{bust:true}).catch(()=>null)]);
    if(!place)return;
    const category=canonicalCategory(contract,place);
    const design=contract?.categories?.[category]||{};
    const image=imageValue(place,contract?.principles?.imageFieldPriority);
    document.body.dataset.placeCategory=category||'ukjent';
    document.body.dataset.placeTitleStyle=text(design?.titleStyle)||'editorial_serif';
    document.body.dataset.placeImageTreatment=text(design?.imageTreatment)||'documentary';
    document.body.dataset.placeHasImage=image.value?'1':'0';
    document.body.dataset.placeImageField=image.field;
    applyTokens(design);
    addInstructionPanel(category,design);
    const imageEl=document.getElementById('fagverkPlaceImage');
    if(imageEl){imageEl.dataset.treatment=text(design?.imageTreatment)||'documentary';if(!image.value)imageEl.hidden=true;}
  }
  const start=()=>global.setTimeout(()=>init().catch((error)=>console.error('[fagverk-place-theme]',error)),100);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
