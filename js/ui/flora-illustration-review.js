/* Manual botanical visual review. Never modifies the game or publishes approval. */
(() => {
  "use strict";
  const KEY = "hg_flora_visual_review_v1";
  const illustrationApi = window.HG_NATURE_ILLUSTRATIONS;
  const photoApi = window.HG_NATURE_FLORA_PHOTOS;
  const approvedApi = window.HG_NATURE_FLORA_APPROVED;
  // Uploaded drawings are candidates only; the production image gate is separate.
  const newCandidates = new Map();
  const fields = [
    ["leaf", "Bladform og bladstilling"],
    ["flower", "Blomst, frukt, kongle eller sporer"],
    ["habit", "Vekstform og naturlige proporsjoner"],
    ["reference", "Sammenlignet med artsbestemt kilde"],
    ["transparent", "Ekte gjennomsiktig bakgrunn kontrollert på sort flate"]
  ];
  const statuses = {
    pending: "Ikke vurdert",
    redraw: "Må tegnes om",
    candidate: "Godkjenningskandidat (ikke publisert)"
  };
  const gallery = document.getElementById("gallery");
  const search = document.getElementById("query");
  const filter = document.getElementById("filter");
  const summary = document.getElementById("summary");
  const more = document.getElementById("more");
  const saved = (() => {
    try {
      const obj = JSON.parse(localStorage.getItem(KEY) || "{}");
      return obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {};
    } catch { return {}; }
  })();
  let species = [];
  let shown = 30;
  const make = (tag, cls, value) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined && value !== null) el.textContent = String(value);
    return el;
  };
  const textList = x => Array.isArray(x) ? x.filter(Boolean).map(String) : x ? [String(x)] : [];
  const label = a => String(a.taxonomy?.norsk_navn || a.title || a.name || a.id);
  const latin = a => String(a.latin || a.taxonomy?.latin_navn || "");
  const review = id => {
    const old = saved[id] || {};
    return {
      status: ["pending","redraw","candidate"].includes(old.status) ? old.status : "pending",
      checks: Object.fromEntries(fields.map(([k]) => [k, old.checks?.[k] === true])),
      source: typeof old.source === "string" ? old.source : "",
      notes: typeof old.notes === "string" ? old.notes : ""
    };
  };
  const persist = (id, entry) => {
    saved[id] = entry;
    try { localStorage.setItem(KEY, JSON.stringify(saved)); }
    catch { summary.textContent = "Lokal lagring utilgjengelig. Eksporter gjennomgangen for å ta vare på vurderingene."; }
  };
  const evidenceValid = r =>
    fields.every(([key]) => r.checks[key]) &&
    /^https:\/\/\S+/.test(r.source.trim()) &&
    r.notes.trim().length >= 24;
  const openLink = (caption, address) => {
    const a = make("a", "", caption);
    a.href = address; a.target = "_blank"; a.rel = "noopener noreferrer";
    return a;
  };
  const photoSearchUrl = scientific => "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=" + encodeURIComponent(scientific);
  const imagePanel = (title, url, alt) => {
    const pane = make("div", "visual");
    pane.appendChild(make("span", "image-title", title));
    if (!url) { pane.appendChild(make("div", "empty", "Ingen dokumentert artsfoto ennå")); return pane; }
    const img = make("img"); img.src=url; img.alt=alt; img.loading="lazy";
    img.addEventListener("error", () => { img.replaceWith(make("div", "empty", "Bildet kunne ikke lastes")); });
    pane.appendChild(img);
    return pane;
  };
  const addField = (container, title, input) => {
    const labelEl = make("label", "", title);
    labelEl.appendChild(input);
    container.appendChild(labelEl);
    return input;
  };
  const card = a => {
    const id=String(a.id), r=review(id);
    const photo=photoApi?.get(id);
    const result=make("article", "card");
    const head=make("header");
    head.appendChild(make("h2", "", label(a)));
    head.appendChild(make("em", "", latin(a)));
    head.appendChild(make("small", "", id));
    result.appendChild(head);
    const compare=make("div", "compare");
    compare.appendChild(imagePanel("Illustrasjon · ikke godkjent", illustrationApi.resolve(id), "Ikke godkjent illustrasjon av " + label(a)));
    compare.appendChild(imagePanel("Artsfoto · referanse", photo?.src || "", "Fotografi av " + label(a)));
    result.appendChild(compare);
    const latest = newCandidates.get(id);
    if (latest) {
      const isPublished=approvedApi?.get(id)?.src===latest.src;
      const preview = imagePanel(isPublished?"Botanisk godkjent · brukes i Finn Flora":"Transparent kandidat · ikke godkjent", latest.src, "Botanisk illustrasjon av " + label(a));
      preview.classList.add("candidate-preview");
      result.appendChild(preview);
    }
    const links=make("div", "photo-links");
    if (photo) {
      links.appendChild(openLink("Fotokilde og lisens · "+photo.creator, photo.source));
      links.appendChild(openLink(photo.license, photo.licenseUrl));
    } else links.appendChild(openLink("Finn artsbilder på Commons", photoSearchUrl(latin(a))));
    const source=textList(a.source_urls).find(url => /^https:\/\//.test(url));
    if (source) links.appendChild(openLink("Artsfaglig kilde", source));
    result.appendChild(links);
    const detail=make("div", "detail");
    const traits=textList(a.kjennetegn);
    detail.appendChild(make("p", "", traits.length ? "Kjennetegn: " + traits.join(" · ") : "Kjennetegn må vurderes mot en faglig artskilde."));
    const state=make("p", "review-status", statuses[r.status]);
    detail.appendChild(state);
    const checks=make("div", "checklist");
    const buttons=[];
    const update=() => {
      if (r.status==="candidate" && !evidenceValid(r)) r.status="pending";
      state.textContent=statuses[r.status];
      result.classList.toggle("approved", r.status==="candidate");
      result.classList.toggle("redraw", r.status==="redraw");
      for (const b of buttons) {
        b.el.setAttribute("aria-pressed", String(b.status===r.status));
        if (b.status==="candidate") b.el.disabled=!evidenceValid(r);
      }
      persist(id,r);
      totals();
    };
    for (const [key, text] of fields) {
      const labelEl=make("label");
      const checkbox=make("input");checkbox.type="checkbox";checkbox.checked=r.checks[key];
      labelEl.appendChild(checkbox);labelEl.appendChild(document.createTextNode(text));
      checkbox.addEventListener("change", () => { r.checks[key]=checkbox.checked; update(); });
      checks.appendChild(labelEl);
    }
    detail.appendChild(checks);
    const urlInput=make("input");urlInput.type="url";urlInput.placeholder="https://... (botanisk referanse)";urlInput.value=r.source || photo?.source || source || "";
    if(!r.source)r.source=urlInput.value;
    urlInput.addEventListener("input", () => { r.source=urlInput.value;update(); });
    addField(detail, "Botanisk referanse brukt i vurderingen", urlInput);
    const notes=make("textarea");notes.placeholder="Beskriv konkrete likheter, avvik og artskjennetegn (minst 24 tegn).";notes.value=r.notes;
    notes.addEventListener("input", () => {r.notes=notes.value;update();});
    addField(detail, "Begrunnelse", notes);
    const actions=make("div", "review-actions");
    for (const status of ["pending","redraw","candidate"]) {
      const button=make("button", "", statuses[status]);button.type="button";
      button.addEventListener("click", () => {if(status==="candidate"&&!evidenceValid(r))return;r.status=status;update();});
      buttons.push({el:button,status});actions.appendChild(button);
    }
    detail.appendChild(actions);
    detail.appendChild(make("p", "", "Lokal vurdering. Kandidatstatus gjør ikke illustrasjonen synlig i Finn Flora."));
    result.appendChild(detail);
    state.textContent=statuses[r.status];
    update();
    return result;
  };
  function totals(){
    if(!species.length)return;
    const counts={pending:0,redraw:0,candidate:0};
    for(const a of species)counts[review(a.id).status]++;
    summary.textContent=species.length+" illustrasjoner · "+counts.pending+" ikke vurdert · "+counts.redraw+" må tegnes om · "+counts.candidate+" lokale kandidater · "+(approvedApi?.count||0)+" publiseringsgodkjenninger";
  }
  function render(){
    const term=search.value.trim().toLocaleLowerCase("nb");
    const subset=species.filter(a => (filter.value==="all"||review(a.id).status===filter.value) &&
      (!term||[label(a),latin(a),a.id,...textList(a.kjennetegn)].join(" ").toLocaleLowerCase("nb").includes(term)));
    const fragment=document.createDocumentFragment();
    for(const a of subset.slice(0,shown))fragment.appendChild(card(a));
    gallery.replaceChildren(fragment);
    more.hidden=subset.length<=shown;
    more.textContent="Vis flere ("+Math.min(shown+30,subset.length)+"/"+subset.length+")";
    totals();
  }
  search.addEventListener("input", () => {shown=30;render();});
  filter.addEventListener("change", () => {shown=30;render();});
  more.addEventListener("click", () => {shown+=30;render();});
  document.getElementById("export").addEventListener("click", () => {
    const payload={
      schema:"history-go-flora-manual-review-v1",
      exportedAt:new Date().toISOString(),
      purpose:"Review evidence only; never a published approval list",
      species:species.map(a=>({id:String(a.id),name:label(a),latin:latin(a),...review(a.id)}))
    };
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
    const a=make("a");a.href=url;a.download="history-go-flora-review.json";
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  });
  async function load(){
    try {
      if (!illustrationApi?.has || !photoApi?.get)throw Error("Illustrasjon- eller fotoregister ble ikke lastet");
      const manifestRes=await fetch("data/runtime/nature-all.json");
      if(!manifestRes.ok)throw Error("Artsmanifestet kunne ikke lastes");
      const manifest=await manifestRes.json();
      const list=manifest?.groups?.flora;
      if(!Array.isArray(list)||!list.length)throw Error("Flora mangler i artsmanifestet");
      const data=await Promise.all(list.map(async path => {
        if(typeof path!=="string"||!path.startsWith("data/runtime/nature-all/"))throw Error("Uventet katalogsti");
        const res=await fetch(path);
        if(!res.ok)throw Error("Kunne ikke laste "+path);
        return res.json();
      }));
      const unique=new Map();
      for(const group of data.flat()){
        for(const a of group?.kind==="emne_pack"&&Array.isArray(group.items)?group.items:[group]){
          if(a?.id&&illustrationApi.has(String(a.id)))unique.set(String(a.id),a);
        }
      }
      species=Array.from(unique.values()).sort((a,b)=>label(a).localeCompare(label(b),"nb"));
      for (const batch of ["01","02","03","04","05","06"]) {
        try {
          const response=await fetch("data/natur/flora/illustration-candidates-batch"+batch+".json");
          if(!response.ok) continue;
          const candidateData=await response.json();
          for(const candidate of candidateData?.items||[]){
            if(candidate?.catalogId && candidate.approvedForPublication===false &&
              typeof candidate.src==="string" &&
              candidate.src.startsWith("bilder/natur/flora/illustrasjonskandidater/b"+batch+"/"))
              newCandidates.set(candidate.catalogId,candidate);
          }
        } catch(err) { console.warn("[FloraReview] Kandidatbilder utilgjengelige i bolk "+batch,err); }
      }
      render();
    } catch (err) {
      summary.textContent="Kunne ikke laste botanisk gjennomgang: "+String(err?.message||err);
      gallery.replaceChildren();
      more.hidden=true;
    }
  }
  load();
})();
