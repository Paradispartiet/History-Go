// js/knowledgePage.js — canonical Knowledge V2 browser for Min samling
(function () {
  "use strict";

  const LANGUAGE_COLLECTION_ID = "language";
  const AHA_URL = "https://paradispartiet.github.io/AHA-EchoNet/?source=historygo&intent=collection";
  const SUBJECT_ICONS = Object.freeze({
    historie:"⌛", vitenskap:"✦", kunst:"◇", natur:"♧", musikk:"♫",
    populaerkultur:"★", subkultur:"⚡", sport:"●", by:"▦", politikk:"◎",
    naeringsliv:"↗", litteratur:"¶", psykologi:"◉"
  });
  const LANGUAGE_DIMENSION_LABELS = Object.freeze({
    word:"Ord", expression:"Uttrykk", dialect_feature:"Dialekttrekk",
    pronunciation:"Uttale", place_name:"Stedsnavn", language_history:"Språkhistorie",
    structural_feature:"Strukturelt trekk", social_variation:"Sosial variasjon",
    language_change:"Språkendring", contact_history:"Kontakt-/språkhistorie",
    corpus_basis:"Korpusgrunnlag", term:"Begrep"
  });

  let activeProfile = null;
  let activeSubjectId = "";
  let activeCollectionId = "";

  const s = value => String(value == null ? "" : value).trim();
  const esc = value => s(value)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  const unique = values => [...new Set((Array.isArray(values) ? values : []).map(s).filter(Boolean))];

  function pct(value){ const n=Number(value||0); return Math.max(0,Math.min(100,Number.isFinite(n)?Math.round(n):0)); }
  function humanizeId(value){ return s(value).replace(/^em_[a-z]+_/i,"").replace(/[_-]+/g," ").replace(/\s+/g," ").trim(); }
  function subjectHref(id){ return `knowledge.html?subject=${encodeURIComponent(id)}`; }
  function collectionHref(id){ return `knowledge.html?collection=${encodeURIComponent(id)}`; }
  function subjectIcon(id){ return SUBJECT_ICONS[s(id)] || "•"; }

  function isLanguageEntry(entry){
    const type=s(entry?.source?.type);
    return type === "language_lexicon" || type === "language_atlas" || s(entry?.collection_kind) === LANGUAGE_COLLECTION_ID || s(entry?.kind) === LANGUAGE_COLLECTION_ID;
  }

  function sortedSubjects(profile){
    return Object.values(profile?.subjects || {}).sort((a,b)=>Number(b.knowledge_count||0)-Number(a.knowledge_count||0)||s(a.label).localeCompare(s(b.label),"nb"));
  }

  function allEntries(profile){
    return sortedSubjects(profile).flatMap(subject => (subject.entries || []).map(entry => ({...entry,_subject_id:subject.subject_id,_subject_label:subject.label})));
  }

  function languageEntries(profile){ return allEntries(profile).filter(isLanguageEntry); }

  function sourceLabel(entry){
    const source=entry?.source||{};
    if(s(source.type)==="language_atlas"){
      const profile=s(source.atlas_profile_id||entry?.atlas_provenance?.atlas_profile_name||entry?.atlas_provenance?.atlas_profile_id);
      return profile ? `Språkatlas · ${humanizeId(profile)}` : "Språkatlas";
    }
    if(s(source.type)==="language_lexicon"){
      const target=source.place_id||source.target_id;
      return target ? `Språkleksikon · ${humanizeId(target)}` : "Språkleksikon";
    }
    if(source.place_id) return `Sted · ${humanizeId(source.place_id)}`;
    if(source.person_id) return `Person · ${humanizeId(source.person_id)}`;
    if(source.target_id) return `Kilde · ${humanizeId(source.target_id)}`;
    if(source.quiz_id) return `Quiz · ${humanizeId(source.quiz_id)}`;
    return source.type === "legacy_quiz_knowledge" ? "Eldre quizkunnskap" : "Knowledge V2";
  }

  function safeHttps(value){
    try{ const url=new URL(s(value),location.origin); return url.protocol==="https:" ? url.href : ""; }catch{return "";}
  }

  function sourceUrls(entry){
    const candidates=[
      ...(Array.isArray(entry?.sources)?entry.sources:[]).map(row=>typeof row==="string"?row:row?.url),
      ...(Array.isArray(entry?.source?.source_urls)?entry.source.source_urls:[]),
      ...(Array.isArray(entry?.atlas_provenance?.source_urls)?entry.atlas_provenance.source_urls:[])
    ];
    return unique(candidates.map(safeHttps).filter(Boolean));
  }

  function provenanceRows(entry){
    const source=entry?.source||{};
    const atlas=entry?.atlas_provenance||{};
    const geo=atlas?.geographic_scope||{};
    return [
      ["Fag", entry?._subject_label || entry?.subject_id || entry?.fagkart_category_id],
      ["Sted", source.place_id || (geo.place_names||[])[0] || ""],
      ["Atlasprofil", atlas.atlas_profile_name || atlas.atlas_profile_id || source.atlas_profile_id || ""],
      ["Belegg", atlas.evidence_label || atlas.feature_evidence_id || source.feature_evidence_id || source.unit_id || ""],
      ["Tid", atlas.time_scope || entry?.historical_period || ""],
      ["Verifisert", atlas.evidence_last_verified || ""],
      ["Kilde-eier", atlas.owner || source.type || ""],
      ["Kildedata", source.source_file || ""]
    ].filter(([,value])=>Array.isArray(value)?value.length:Boolean(s(value)));
  }

  function dimensionLabel(entry){
    const dimension=s(entry?.dimension||"generelt");
    return isLanguageEntry(entry) ? (LANGUAGE_DIMENSION_LABELS[dimension] || humanizeId(dimension) || "Språk") : humanizeId(dimension);
  }

  function entryHref(entry){
    return isLanguageEntry(entry) ? collectionHref(LANGUAGE_COLLECTION_ID) : subjectHref(entry?._subject_id||entry?.subject_id||entry?.fagkart_category_id||"");
  }

  function renderEntry(entry){
    const emneIds=Array.isArray(entry?.resolved_emne_ids)?entry.resolved_emne_ids:[];
    const concepts=Array.isArray(entry?.concepts)?entry.concepts:[];
    const provenance=provenanceRows(entry);
    const urls=sourceUrls(entry);
    const placeId=s(entry?.source?.place_id || entry?.atlas_provenance?.geographic_scope?.place_ids?.[0]);
    return `
      <article class="kv2-entry" data-knowledge-entry-id="${esc(entry?.id||entry?.knowledge_unit_id||"")}">
        <div class="kv2-entry-head"><strong>${esc(entry?.topic||"Kunnskap")}</strong><span>${esc(dimensionLabel(entry))}</span></div>
        <p>${esc(entry?.text||"")}</p>
        ${concepts.length?`<div class="kv2-entry-concepts">${concepts.map(c=>`<span>${esc(c)}</span>`).join("")}</div>`:""}
        <div class="kv2-entry-source"><span>${esc(sourceLabel(entry))}</span>${emneIds.length?`<span>${emneIds.map(id=>esc(humanizeId(id))).join(" · ")}</span>`:isLanguageEntry(entry)?`<span>Samlet språkspor</span>`:`<span class="kv2-warning-text">Ikke plassert i emne</span>`}</div>
        ${provenance.length||urls.length||placeId?`<div class="knowledge-entry-provenance">
          <div class="knowledge-entry-provenance-row">${provenance.map(([label,value])=>`<span><strong>${esc(label)}:</strong> ${esc(Array.isArray(value)?value.join(" · "):value)}</span>`).join("")}</div>
          <div class="knowledge-entry-actions">
            ${placeId?`<a href="index.html?collectionPlace=${encodeURIComponent(placeId)}">Vis stedet på kartet</a>`:""}
            ${urls.map((url,index)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Kilde${urls.length>1?` ${index+1}`:""} ↗</a>`).join("")}
          </div>
        </div>`:""}
      </article>`;
  }

  function renderSummary(profile){
    const root=document.getElementById("knowledgeSummary"); if(!root)return;
    const summary=profile?.summary||{};
    root.innerHTML=`<article class="kv2-stat"><strong>${Number(summary.knowledge_count||0)}</strong><span>kunnskapsenheter</span></article><article class="kv2-stat"><strong>${Number(summary.subject_count||0)}</strong><span>fag</span></article><article class="kv2-stat"><strong>${Number(summary.concept_count||0)}</strong><span>begreper</span></article><article class="kv2-stat"><strong>${languageEntries(profile).length}</strong><span>språkspor</span></article>`;
  }

  function renderSubjectNav(profile,selectedSubject,selectedCollection){
    const root=document.getElementById("knowledgeSubjectNav"); if(!root)return;
    const subjects=sortedSubjects(profile); const languageCount=languageEntries(profile).length;
    root.innerHTML=[`<a class="kv2-subject-pill ${selectedSubject||selectedCollection?"":"is-active"}" href="knowledge.html">Alle</a>`,languageCount?`<a class="kv2-subject-pill ${selectedCollection===LANGUAGE_COLLECTION_ID?"is-active":""}" href="${collectionHref(LANGUAGE_COLLECTION_ID)}"><span>Språk</span><small>${languageCount}</small></a>`:"",...subjects.map(subject=>`<a class="kv2-subject-pill ${!selectedCollection&&selectedSubject===subject.subject_id?"is-active":""}" href="${subjectHref(subject.subject_id)}"><span>${esc(subject.label)}</span><small>${Number(subject.knowledge_count||0)}</small></a>`)].join("");
  }

  function renderConcepts(concepts,limit=24){
    const rows=Array.isArray(concepts)?concepts.slice(0,limit):[];
    return rows.length?`<div class="kv2-concepts">${rows.map(c=>`<span class="kv2-concept">${esc(c.label)}<small>${Number(c.count||0)}</small></span>`).join("")}</div>`:`<p class="kv2-empty">Ingen begreper er koblet til kunnskapen ennå.</p>`;
  }

  function recentEntries(profile,limit=7){
    return allEntries(profile).sort((a,b)=>(Date.parse(b.last_seen_at||b.learned_at||0)||0)-(Date.parse(a.last_seen_at||a.learned_at||0)||0)).slice(0,limit);
  }

  function renderRecent(profile){
    const rows=recentEntries(profile);
    return rows.length?`<div class="kv2-recent-list">${rows.map(entry=>`<article class="kv2-recent-item"><span class="kv2-recent-meta">${esc(entry._subject_label)} · ${esc(sourceLabel(entry))}</span><a href="${entryHref(entry)}">${esc(entry.topic||"Kunnskap")}</a><p>${esc(entry.text||"")}</p></article>`).join("")}</div>`:`<p class="kv2-empty">Ingen kunnskap er samlet ennå.</p>`;
  }

  function renderSubjectRows(profile){
    return `<div class="kv2-subject-list">${sortedSubjects(profile).map(subject=>{const linked=Number(subject.linked_count||0),total=Number(subject.knowledge_count||0),linkedPercent=total?pct((linked/total)*100):0;return `<a class="kv2-subject-row" href="${subjectHref(subject.subject_id)}"><div class="kv2-subject-row-main"><div class="kv2-subject-row-title"><span aria-hidden="true">${subjectIcon(subject.subject_id)}</span><strong>${esc(subject.label)}</strong></div><p>${linked} av ${total} plassert i emner</p><div class="kv2-progress"><span style="width:${linkedPercent}%"></span></div></div><strong class="kv2-subject-row-count">${total}</strong></a>`;}).join("")}</div>`;
  }

  function renderAll(profile){
    const root=document.getElementById("knowledgeContent"); if(!root)return;
    const language=languageEntries(profile);
    root.innerHTML=`<div class="kv2-overview-grid"><section class="kv2-panel"><div class="kv2-panel-head"><div><span class="kv2-eyebrow">Fag</span><h2>Kunnskapskartet ditt</h2></div><span class="kv2-panel-meta">Kunnskap organiseres etter faktiske History Go-fag, ikke etter UI-samlingstype.</span></div>${renderSubjectRows(profile)}</section><div class="kv2-side-stack">${language.length?`<section class="kv2-panel"><div class="kv2-panel-head"><div><span class="kv2-eyebrow">Samling</span><h2>Språk</h2></div></div><a class="kv2-subject-row" href="${collectionHref(LANGUAGE_COLLECTION_ID)}"><div class="kv2-subject-row-main"><div class="kv2-subject-row-title"><span>Aa</span><strong>Språksamlingen din</strong></div><p>${language.length} dokumenterte språkspor</p></div><strong class="kv2-subject-row-count">${language.length}</strong></a></section>`:""}<section class="kv2-panel"><div class="kv2-panel-head"><div><span class="kv2-eyebrow">Nylig samlet</span><h2>Siste kunnskap</h2></div></div>${renderRecent(profile)}</section><section class="kv2-panel"><div class="kv2-panel-head"><div><span class="kv2-eyebrow">Begreper</span><h2>Det du møter oftest</h2></div></div>${renderConcepts(profile?.concepts||[],18)}</section></div></div>`;
  }

  function renderEmner(subject){
    const linked=(subject?.emner||[]).filter(e=>Number(e.knowledge_count||0)>0);
    if(!linked.length)return `<p class="kv2-empty">Kunnskap finnes i dette faget, men mangler sikker emneplassering.</p>`;
    const seen=new Set();
    return `<div class="kv2-emne-list">${linked.map((emne,index)=>{const entries=(emne.entries||[]).filter(entry=>{const key=s(entry?.id)||`${s(entry?.topic)}|${s(entry?.text)}`;if(!key||seen.has(key))return false;seen.add(key);return true;});if(!entries.length)return "";return `<details class="kv2-emne" ${index===0?"open":""}><summary><span><strong>${esc(emne.title)}</strong><small>${entries.length} kunnskapsenhet${entries.length===1?"":"er"}</small></span><span class="kv2-emne-toggle">＋</span></summary><div class="kv2-emne-body">${emne.description?`<p class="kv2-muted">${esc(emne.description)}</p>`:""}${entries.map(entry=>renderEntry({...entry,_subject_id:subject.subject_id,_subject_label:subject.label})).join("")}</div></details>`;}).join("")}</div>`;
  }

  function renderSubject(subject){
    const root=document.getElementById("knowledgeContent"); if(!root)return;
    const unresolved=(subject?.entries||[]).filter(e=>!(e?.resolved_emne_ids||[]).length);
    root.innerHTML=`<section class="kv2-panel kv2-subject-hero"><a class="kv2-back" href="knowledge.html">← All kunnskap</a><span class="kv2-eyebrow">${subjectIcon(subject.subject_id)} Fag</span><h2>${esc(subject.label)}</h2><div class="kv2-subject-metrics"><span>${Number(subject.knowledge_count||0)} kunnskapsenheter</span><span>${Number(subject.concepts?.length||0)} begreper</span><span>${Number(subject.linked_count||0)} plassert i emner</span></div>${Number(subject.unresolved_count||0)?`<div class="kv2-warning">${Number(subject.unresolved_count||0)} enheter er bevart, men mangler sikker emnekobling.</div>`:""}</section><section class="kv2-panel"><div class="kv2-panel-head"><div><span class="kv2-eyebrow">Emner</span><h2>Hvor kunnskapen hører hjemme</h2></div></div>${renderEmner(subject)}</section>${subject.concepts?.length?`<section class="kv2-panel"><div class="kv2-panel-head"><div><span class="kv2-eyebrow">Begreper</span><h2>Begrepene i dette faget</h2></div></div>${renderConcepts(subject.concepts,36)}</section>`:""}${unresolved.length?`<section class="kv2-panel"><div class="kv2-panel-head"><div><span class="kv2-eyebrow">Uplassert</span><h2>Mangler emnekobling</h2></div></div><div class="kv2-unresolved-list">${unresolved.map(entry=>renderEntry({...entry,_subject_id:subject.subject_id,_subject_label:subject.label})).join("")}</div></section>`:""}`;
  }

  function groupLanguage(entries){
    const map=new Map(); entries.forEach(entry=>{const place=s(entry?.source?.place_id||entry?.atlas_provenance?.geographic_scope?.place_ids?.[0]||entry?.source?.atlas_profile_id)||"uten_sted";const rows=map.get(place)||[];rows.push(entry);map.set(place,rows);});
    return [...map.entries()].map(([placeId,entries])=>({placeId,label:humanizeId(placeId),entries})).sort((a,b)=>a.label.localeCompare(b.label,"nb"));
  }

  function renderLanguageCollection(profile){
    const root=document.getElementById("knowledgeContent"); if(!root)return;
    const entries=languageEntries(profile),groups=groupLanguage(entries),dimensions=new Set(entries.map(e=>s(e.dimension)).filter(Boolean));
    root.innerHTML=`<section class="kv2-panel kv2-subject-hero"><a class="kv2-back" href="knowledge.html">← All kunnskap</a><span class="kv2-eyebrow">Aa Samling</span><h2>Språksamlingen din</h2><p>Dokumenterte ord, uttrykk, dialekttrekk, språkendring og andre språkspor du eksplisitt har samlet.</p><div class="kv2-subject-metrics"><span>${entries.length} språkspor</span><span>${groups.length} sted/profil${groups.length===1?"":"er"}</span><span>${dimensions.size} typer</span></div></section><section class="kv2-panel"><div class="kv2-panel-head"><div><span class="kv2-eyebrow">Proveniens</span><h2>Språk du har samlet</h2></div><span class="kv2-panel-meta">Atlasprofilen eller Språkleksikonet beholder eierskapet til kildedataene.</span></div>${groups.length?`<div class="kv2-emne-list">${groups.map((group,index)=>`<details class="kv2-emne" ${index===0?"open":""}><summary><span><strong>${esc(group.label)}</strong><small>${group.entries.length} språkspor</small></span><span class="kv2-emne-toggle">＋</span></summary><div class="kv2-emne-body">${group.entries.map(renderEntry).join("")}</div></details>`).join("")}</div>`:`<p class="kv2-empty">Du har ikke samlet språkspor ennå.</p>`}</section>`;
  }

  function entryMatches(entry,query){
    const hay=[entry?._subject_label,entry?.topic,entry?.text,entry?.dimension,entry?.collection_kind,entry?.source?.type,sourceLabel(entry),entry?.source?.place_id,entry?.source?.atlas_profile_id,entry?.atlas_provenance?.evidence_label,...(entry?.concepts||[]),...(entry?.tags||[]),...(entry?.resolved_emne_ids||[]).map(humanizeId)].map(s).join(" ").toLowerCase();
    return hay.includes(query);
  }

  function renderSearch(profile,raw){
    const root=document.getElementById("knowledgeContent"); if(!root)return;
    const query=s(raw).toLowerCase(); if(!query)return renderCurrentView();
    const entries=(activeCollectionId===LANGUAGE_COLLECTION_ID?languageEntries(profile):allEntries(profile)).filter(e=>entryMatches(e,query)).slice(0,60);
    root.innerHTML=`<section class="kv2-panel"><div class="kv2-panel-head"><div><span class="kv2-eyebrow">Søk</span><h2>${entries.length} treff på «${esc(raw)}»</h2></div></div>${entries.length?`<div class="kv2-search-results">${entries.map(renderEntry).join("")}</div>`:`<p class="kv2-empty">Ingen kunnskap matcher søket.</p>`}</section>`;
  }

  function renderCurrentView(){
    if(!activeProfile)return;
    if(activeCollectionId){ if(activeCollectionId===LANGUAGE_COLLECTION_ID)return renderLanguageCollection(activeProfile); return renderAll(activeProfile); }
    if(!activeSubjectId)return renderAll(activeProfile);
    const subject=activeProfile.subjects?.[activeSubjectId]; subject?renderSubject(subject):renderAll(activeProfile);
  }

  function bindSearch(){
    const input=document.getElementById("knowledgeSearch"); if(!(input instanceof HTMLInputElement))return;
    input.addEventListener("input",()=>{const q=s(input.value);q.length<2?renderCurrentView():renderSearch(activeProfile,q);});
  }

  async function openAha(){
    let state=null; try{state=await window.HistoryGoAHAAuth?.refresh?.();}catch{}
    if(!state?.signed_in){
      if(typeof window.HGUserProfile?.openLoginPopup==="function") return window.HGUserProfile.openLoginPopup();
      if(typeof window.HistoryGoAHAAuth?.openAhaLogin==="function") return window.HistoryGoAHAAuth.openAhaLogin();
    }
    try{window.exportHistoryGoData?.();}catch{}
    location.href=AHA_URL;
  }

  async function boot(){
    const loading=document.getElementById("knowledgeLoading"),error=document.getElementById("knowledgeError");
    const params=new URLSearchParams(location.search);activeCollectionId=s(params.get("collection"));activeSubjectId=activeCollectionId?"":s(params.get("subject"));
    document.querySelector("[data-knowledge-aha]")?.addEventListener("click",()=>void openAha());
    if(!window.HGKnowledgeV2?.buildProfile){if(loading)loading.hidden=true;if(error){error.hidden=false;error.textContent="Kunnskapssiden kunne ikke lastes.";}return;}
    try{activeProfile=await window.HGKnowledgeV2.buildProfile();window.hgKnowledgeProfileV2=activeProfile;renderSummary(activeProfile);renderSubjectNav(activeProfile,activeSubjectId,activeCollectionId);renderCurrentView();bindSearch();window.HGKnowledgeV2.renderQuizMemoryOverview?.(activeProfile);if(loading)loading.hidden=true;}catch(err){console.error("[KnowledgePage]",err);if(loading)loading.hidden=true;if(error){error.hidden=false;error.textContent="Kunne ikke bygge kunnskapen akkurat nå.";}}
  }

  document.addEventListener("DOMContentLoaded",boot);
})();
