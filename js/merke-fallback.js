// @ts-nocheck
(function installGenericBadgeRedirect(global){
  'use strict';
  const text=(value)=>String(value==null?'':value).trim();
  const fetchJson=async(url)=>{const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`${response.status} ${url}`);return response.json();};
  function resolveBadgeId(rawId,contract){const raw=text(rawId);if((contract.runtimeCategories||[]).includes(raw))return raw;const alias=text(contract.aliases?.[raw]);return (contract.runtimeCategories||[]).includes(alias)?alias:'';}
  async function init(){
    const params=new URLSearchParams(global.location.search);
    const requestedId=text(params.get('badge'));
    const error=document.getElementById('genericBadgeError');
    const loading=document.getElementById('genericBadgeLoading');
    try{
      const [contract,portal]=await Promise.all([fetchJson('data/categories/category_contract.json'),fetchJson('data/fagverk/fagverk_portal.json')]);
      const id=resolveBadgeId(requestedId,contract);
      if(!id)throw new Error(`Ukjent merke: ${requestedId||'(mangler id)'}`);
      const item=(portal.categories||[]).find((row)=>text(row.id)===id);
      if(!item||text(item.subjectStatus)!=='materialized'||!text(item.subjectPage))throw new Error(`Faget ${id} er ikke materialisert.`);
      const target=`${text(item.subjectPage)}#fagverkIaProgresjon`;
      global.location.replace(target);
    }catch(err){
      if(loading)loading.hidden=true;
      if(error){error.hidden=false;error.textContent=`Merkevisningen kunne ikke åpne fagets progresjon: ${err.message}`;}
      console.error('[generic-badge-redirect]',err);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else void init();
})(window);
