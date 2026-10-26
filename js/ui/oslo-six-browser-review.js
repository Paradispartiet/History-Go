/* Read-only History Go editorial review. This must never call progress or map runtime. */
(function () {
  'use strict';
  const raw=document.getElementById('review-data');
  if(!raw) return;
  const data=JSON.parse(raw.textContent);
  if(data.schema!=='history_go_six_place_browser_review_v1'||
     data.status!=='BLOCKED_REVIEW_ONLY'||data.noScorePersistence!==true||
     data.noMapMarkers!==true||data.places.length!==6)
    throw Error('Unsafe History Go review source');
  const $=id=>document.getElementById(id);
  const esc=x=>String(x==null?'':x).replaceAll('&','&amp;')
    .replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const paragraphs=x=>String(x||'').split(/\n\s*\n/).filter(Boolean)
    .map(t=>'<p>'+esc(t)+'</p>').join('');
  const links=a=>[...new Set(a||[])].filter(u=>/^https:\/\//.test(u))
    .map((u,i)=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(u)+'">Kilde '+(i+1)+'</a>').join(' ');
  const sections=[['story','Fortelling'],['quizcard','QuizCard (10)'],
    ['fullquiz','Fullquiz'],['fagverk','Fagverk']];
  let placeIndex=0,tab='story',questionIndex=0,answered=false,mediaRole='lead';
  const nav=$('place-nav'),tabs=$('review-tabs'),content=$('review-content');
  function current(){return data.places[placeIndex];}
  function qaPhoto(p){
    if(!p.image)
      return '<div class="warning" id="missing-image">Ingen sikkert identifisert teglverksfoto – hovedbilde sperret.</div>';
    const image=p.image,src=image[mediaRole];
    return '<figure><img id="place-image" class="hero" src="'+esc(src)+'" alt="'+esc(p.name)+' – kildebelagt stedsfoto" />'+
      '<figcaption class="credit">Foto: '+esc(image.author)+' · '+esc(image.license)+' · utsnitt av originalfoto. '+
      '<a href="'+esc(image.source_page)+'" target="_blank" rel="noopener noreferrer">Original</a> · '+
      '<a href="'+esc(image.license_url)+'" target="_blank" rel="noopener noreferrer">Lisens</a></figcaption>'+
      '</figure><div class="media-roles" aria-label="Bildeutsnitt">'+
      ['lead','card','popup'].map(r=>'<button type="button" data-media-role="'+r+'" aria-pressed="'+(r===mediaRole)+'">'+
        (r==='lead'?'Hovedbilde':r==='card'?'Kortbilde':'Popupbilde')+'</button>').join('')+'</div>';
  }
  function currentQuestions(){return tab==='quizcard'?current().quizcard:current().fullquiz;}
  function quizPanel(){
    const qs=currentQuestions(),q=qs[questionIndex];
    return '<p class="muted">Uverifiserte quizkandidater · Spørsmål '+(questionIndex+1)+' av '+qs.length+'</p>'+
      '<div class="question" data-question-id="'+esc(q.id)+'"><h2>'+esc(q.question)+'</h2>'+
      '<div class="options">'+q.options.map((o,i)=>
        '<button type="button" data-option="'+i+'" aria-label="Svaralternativ '+(i+1)+'">'+esc(o)+'</button>').join('')+
      '</div><div class="answer" id="answer" role="status" aria-live="polite" hidden></div></div>'+
      '<div class="actions"><button type="button" id="prev-question"'+(questionIndex===0?' disabled':'')+'>Forrige</button>'+
      '<span class="muted">Ingen poeng lagres</span>'+
      '<button type="button" id="next-question"'+(questionIndex===qs.length-1?' disabled':'')+'>Neste</button></div>';
  }
  function fagverkPanel(){
    const f=current().fagverk;
    return '<h2>Fagverk · faglig utkast</h2><p class="lede">'+esc(f.intro||'')+'</p>'+
      '<div class="paras">'+(f.article||[]).map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>'+
      '<h3>Undersøk stedet</h3>'+(f.lenses||[]).map(x=>
        '<section class="learning-lens"><h3>'+esc(x.title)+'</h3><p>'+esc(x.prompt)+'</p></section>').join('')+
      '<p class="source">'+links(f.source_urls)+'</p>';
  }
  function render(){
    const p=current();
    nav.innerHTML=data.places.map((x,i)=>'<button type="button" data-place-index="'+i+
      '" aria-current="'+(i===placeIndex)+'">'+esc(x.name)+'</button>').join('');
    tabs.innerHTML=sections.map(([key,title])=>'<button type="button" role="tab" aria-selected="'+
      (tab===key)+'" data-tab="'+key+'">'+esc(title)+'</button>').join('');
    $('place-title').textContent=p.name;
    $('place-intro').textContent=p.desc;
    $('current-place').textContent=(placeIndex+1)+' / '+data.places.length;
    $('place-photo').innerHTML=qaPhoto(p);
    $('place-meta').textContent=(p.visitorAddress||'Ingen bekreftet besøksadresse')+' · GPS: HOLD';
    content.innerHTML=tab==='story'?
      '<h2>Stedets historie</h2><div class="paras">'+paragraphs(p.popupDesc)+'</div>':
      tab==='fagverk'?fagverkPanel():quizPanel();
  }
  document.addEventListener('click',event=>{
    // An EventTarget is not necessarily a DOM Element (e.g. a text node).
    // Narrow once before using closest, dataset and id in this review-only UI.
    if(!(event.target instanceof Element))return;
    const target=event.target;
    const place=target.closest('[data-place-index]');
    if(place instanceof HTMLElement){
      placeIndex=Number(place.dataset.placeIndex);tab='story';
      questionIndex=0;answered=false;mediaRole='lead';render();return;
    }
    const t=target.closest('[data-tab]');
    if(t instanceof HTMLElement){tab=t.dataset.tab;questionIndex=0;answered=false;render();return;}
    const mr=target.closest('[data-media-role]');
    if(mr instanceof HTMLElement){mediaRole=mr.dataset.mediaRole;render();return;}
    if(target.id==='next-question'||target.id==='prev-question'){
      const direction=target.id==='next-question'?1:-1;
      questionIndex=Math.max(0,Math.min(currentQuestions().length-1,questionIndex+direction));
      answered=false;render();return;
    }
    const option=target.closest('[data-option]');
    if(option instanceof HTMLElement&&!answered){
      answered=true;
      const q=currentQuestions()[questionIndex],answer=$('answer');
      const correct=Number(option.dataset.option)===q.answerIndex;
      answer.hidden=false;
      answer.textContent=(correct?'Riktig. ':'Ikke riktig. ')+
        'Fasit: '+q.options[q.answerIndex]+'. '+q.knowledge;
      const sources=document.createElement('div');
      sources.className='source';sources.innerHTML=links(q.source_urls);
      answer.appendChild(sources);
      content.querySelectorAll('[data-option]').forEach(b=>b.disabled=true);
    }
  });
  window.__HG_SIX_REVIEW__={
    get state(){return {placeId:current().id,tab,questionIndex,answered,mediaRole};},
    selectPlace(id){
      const i=data.places.findIndex(p=>p.id===id);
      if(i<0)throw Error('Unknown QA place');
      placeIndex=i;tab='story';questionIndex=0;answered=false;mediaRole='lead';render();
    },
    selectTab(next){
      if(!sections.some(x=>x[0]===next))throw Error('Unknown QA tab');
      tab=next;questionIndex=0;answered=false;render();
    }
  };
  render();
})();