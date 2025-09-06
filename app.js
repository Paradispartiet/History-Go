// =============== History Go – v11 (kompakt, ryddig) ===============

const App = {
  // ---------- Konfig ----------
  CFG: {
    NEARBY_LIMIT: 2,
    FEEDBACK_MS: 2500,
    CAT_COLORS: {
      "Historie": "#1976d2",
      "Kultur": "#e63946",
      "Sport": "#2a9d8f",
      "Natur": "#4caf50",
      "Urban Life": "#ffb703"
    },
    MERIT_THRESHOLDS: { bronse: 10, sølv: 25, gull: 50 }
  },

  // ---------- State ----------
  state: {
    places: [],
    people: [],
    quizzes: [],
    pos: null,
    visited: JSON.parse(localStorage.getItem("visited_places") || "{}"),
    merits: JSON.parse(localStorage.getItem("merits_by_category") || "{}"),
    peopleCollected: JSON.parse(localStorage.getItem("people_collected") || "{}"),
    mapMode: false,
    placeById: {},
    peopleByPlace: {},
    quizByPerson: {}
  },

  // ---------- Utils ----------
  toast(msg="OK"){
    const t = document.getElementById("toast");
    t.textContent = msg; t.style.display = "block";
    setTimeout(()=> t.style.display="none", 1600);
  },
  colorFor(cat){ return this.CFG.CAT_COLORS[cat] || "#888"; },
  hav(a,b){
    const R=6371e3, toRad=d=>d*Math.PI/180;
    const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
    const la1=toRad(a.lat), la2=toRad(b.lat);
    const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
    return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  },
  distLabel(m){ return m<1000 ? `${Math.round(m)} m unna` : `${(m/1000).toFixed(1)} km unna`; },
  tierFor(n){
    const t=this.CFG.MERIT_THRESHOLDS;
    if(n>=t.gull) return "gull";
    if(n>=t.sølv) return "sølv";
    if(n>=t.bronse) return "bronse";
    return null;
  },
  tierEmoji(t){ return t==="gull"?"🥇":t==="sølv"?"🥈":t==="bronse"?"🥉":""; },
  save(){
    localStorage.setItem("visited_places", JSON.stringify(this.state.visited));
    localStorage.setItem("merits_by_category", JSON.stringify(this.state.merits));
    localStorage.setItem("people_collected", JSON.stringify(this.state.peopleCollected));
  },

  // ---------- Data (med fallback /data -> rot) ----------
  async fetchJson(path){
    try { return await fetch(path).then(r=>r.json()); }
    catch{ return await fetch(path.replace(/^\.\/data\//,'./')).then(r=>r.json()); }
  },
  async loadData(){
    const [places, people, quizzes] = await Promise.all([
      this.fetchJson("./data/places.json"),
      this.fetchJson("./data/people.json"),
      this.fetchJson("./data/quizzes.json")
    ]);
    this.state.places = Array.isArray(places)?places:[];
    this.state.people = Array.isArray(people)?people:[];
    this.state.quizzes= Array.isArray(quizzes)?quizzes:[];
    // Indekser
    this.state.placeById = Object.fromEntries(this.state.places.map(p=>[p.id,p]));
    const perPlace = {};
    for(const pr of this.state.people){
      if(!perPlace[pr.placeId]) perPlace[pr.placeId]=[];
      perPlace[pr.placeId].push(pr);
    }
    this.state.peopleByPlace = perPlace;
    const quizByPerson = {};
    for(const q of this.state.quizzes){
      if(!quizByPerson[q.personId]) quizByPerson[q.personId]=[];
      quizByPerson[q.personId].push(q);
    }
    this.state.quizByPerson = quizByPerson;
  },

  // ---------- Map ----------
  Map: {
    map:null, userMarker:null, placeLayer:null, peopleLayer:null,

    init(app){
      this.map = L.map('map',{zoomControl:false, attributionControl:false}).setView([59.9139,10.7522],13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(this.map);
      this.placeLayer = L.layerGroup().addTo(this.map);
      this.peopleLayer= L.layerGroup().addTo(this.map);
      this.drawPlaces(app);
      this.drawPeople(app);
    },

    // liten visuell prikk + skjult stor hitbox (for touch)
    addMarkerWithHitbox(lat, lon, color, onClick){
      const dot = L.circleMarker([lat,lon],{radius:6,weight:2,color:"#111",fillColor:color,fillOpacity:.95,opacity:1});
      const hit = L.circleMarker([lat,lon],{radius:18,weight:0,opacity:0,fillOpacity:0}); // større treffflate
      hit.on('click', onClick);
      dot.on('click', onClick);
      return {dot,hit};
    },

    drawPlaces(app){
      this.placeLayer.clearLayers();
      for(const p of app.state.places){
        const color = app.colorFor(p.category);
        const {dot,hit} = this.addMarkerWithHitbox(p.lat,p.lon,color, ()=> app.openPlaceCard(p.id));
        dot.addTo(this.placeLayer); hit.addTo(this.placeLayer);
      }
    },

    drawPeople(app){
      this.peopleLayer.clearLayers();
      // (kan brukes senere til spesielle “event”-markører)
    },

    setUser(pos){
      if(!this.map) return;
      const {lat,lon}=pos;
      if(!this.userMarker){
        this.userMarker = L.circleMarker([lat,lon],{radius:8,weight:2,color:"#fff",fillColor:"#00e676",fillOpacity:1})
          .addTo(this.map).bindPopup("Du er her");
      } else {
        this.userMarker.setLatLng([lat,lon]);
      }
      this.map.setView([lat,lon], this.map.getZoom(), {animate:true});
    }
  },

  // ---------- UI: render ----------
  renderNearby(){
    const root = document.getElementById("nearbyList"); root.innerHTML="";
    const base = this.state.places.slice();
    const pos = this.state.pos;
    const enriched = pos
      ? base.map(p=>({...p, d:this.hav(pos,{lat:p.lat,lon:p.lon})})).sort((a,b)=>(a.d??1e12)-(b.d??1e12))
      : base;

    const list = enriched.slice(0,this.CFG.NEARBY_LIMIT);
    list.forEach(p=>{
      const el=document.createElement("article");
      el.className="card";
      const d = p.d!=null ? `<div class="dist">${this.distLabel(p.d)}</div>` : "";
      el.innerHTML = `
        <div class="name">${p.name}</div>
        <div class="meta" style="color:${this.colorFor(p.category)}">${p.category}</div>
        <p class="desc">${p.desc||""}</p>
        ${d}
      `;
      el.onclick=()=> this.openPlaceCard(p.id);
      root.appendChild(el);
    });

    // “Se flere” sheet
    document.getElementById("btnSeeMoreNearby").onclick = ()=>{
      const body = document.getElementById("sheetNearbyBody"); body.innerHTML="";
      const rest = enriched.slice(this.CFG.NEARBY_LIMIT);
      if(!rest.length){ body.innerHTML = `<div class="muted">Ingen flere i nærheten akkurat nå.</div>`; }
      rest.forEach(p=>{
        const item=document.createElement("div");
        item.className="card";
        const d = p.d!=null ? `<div class="dist">${this.distLabel(p.d)}</div>` : "";
        item.innerHTML=`
          <div class="name">${p.name}</div>
          <div class="meta" style="color:${this.colorFor(p.category)}">${p.category}</div>
          <p class="desc">${p.desc||""}</p>
          ${d}
        `;
        item.onclick=()=>{ this.openPlaceCard(p.id); this.closeSheet("#sheetNearby"); };
        body.appendChild(item);
      });
      this.openSheet("#sheetNearby");
    };
  },

  renderCollection(){
    const grid = document.getElementById("collectionGrid");
    const ids = Object.keys(this.state.visited).filter(id=>this.state.visited[id]);
    const items = ids.map(id=>this.state.placeById[id]).filter(Boolean);
    grid.innerHTML="";

    const firstRow = items.slice(0, (items.length?Math.min(items.length,6):0));
    firstRow.forEach(p=>{
      const chip = document.createElement("span");
      chip.className="badge";
      chip.style.background = this.colorFor(p.category) + "CC"; // mildere
      chip.textContent = p.name;
      grid.appendChild(chip);
    });

    const more = items.length - firstRow.length;
    document.getElementById("collectionCount").textContent = items.length;
    const btn = document.getElementById("btnMoreCollection");
    btn.style.display = more>0 ? "" : "none";
    btn.onclick = ()=>{
      const body = document.getElementById("sheetCollectionBody"); body.innerHTML="";
      items.forEach(p=>{
        const chip = document.createElement("span");
        chip.className="badge";
        chip.style.background = this.colorFor(p.category) + "CC";
        chip.textContent = p.name;
        body.appendChild(chip);
      });
      this.openSheet("#sheetCollection");
    };
  },

  renderMerits(){
    const root = document.getElementById("merits"); root.innerHTML="";
    const cats = ["Historie","Kultur","Sport","Natur","Urban Life"];
    cats.forEach(cat=>{
      const pts = this.state.merits[cat]||0;
      const tier = this.tierFor(pts);
      const box = document.createElement("div");
      box.className = `merit ${tier||""}`;
      box.innerHTML = `
        <div class="stripe"></div>
        <div class="name">${cat} ${tier?`<span class="tier ${tier}">${this.tierEmoji(tier)} ${tier.toUpperCase()}</span>`:""}</div>
        <div class="meta">${pts} poeng</div>
        <p class="desc">Svar på quiz og lås opp personer og steder for å øke nivået.</p>
      `;
      root.appendChild(box);
    });
  },

  renderGallery(){
    const root = document.getElementById("gallery"); root.innerHTML="";
    const gotIds = Object.keys(this.state.peopleCollected).filter(id=>this.state.peopleCollected[id]);
    const items = gotIds.map(id=> this.findPerson(id)).filter(Boolean);
    if(!items.length){
      root.innerHTML = `<div class="muted">Samle personer ved å besøke steder og klare quiz.</div>`;
      return;
    }
    items.forEach(p=>{
      const card = document.createElement("article");
      card.className="person-card";
      card.innerHTML = `
        <div class="avatar" style="background:${this.colorFor(this.placeFor(p)?.category||"Historie")}">${(p.initials||p.name?.slice(0,2)||"").toUpperCase()}</div>
        <div class="info">
          <div class="name">${p.name}</div>
          <div class="sub">${p.desc||""}</div>
        </div>
        <button class="person-btn">Samlet</button>
      `;
      root.appendChild(card);
    });
  },

  // ---------- Place card ----------
  openPlaceCard(placeId){
    const p = this.state.placeById[placeId]; if(!p) return;
    const card = document.getElementById("placeCard");
    document.getElementById("pcTitle").textContent = p.name;
    document.getElementById("pcMeta").textContent  = `${p.category} • radius ${p.r||120} m`;
    document.getElementById("pcDesc").textContent  = p.desc || "";

    // personer på stedet
    const peopleWrap = document.getElementById("pcPeople");
    peopleWrap.innerHTML = "";
    const here = this.state.peopleByPlace[placeId] || [];
    if(here.length){
      here.forEach(pr=>{
        const avaColor = this.colorFor(this.placeFor(pr)?.category||"Historie");
        const box = document.createElement("div");
        box.className="pc-person";
        box.innerHTML = `
          <div class="pp-ava" style="background:${avaColor}">${(pr.initials||pr.name?.slice(0,2)||"").toUpperCase()}</div>
          <div class="pp-name">${pr.name}</div>
          <button class="pp-quiz">Quiz</button>
        `;
        box.querySelector(".pp-quiz").onclick = ()=> this.startQuiz(pr.id);
        peopleWrap.appendChild(box);
      });
    }

    // handlinger
    document.getElementById("pcMore").onclick   = ()=> window.open(`https://www.google.com/search?q=${encodeURIComponent(p.name+" Oslo")}`,'_blank');
    document.getElementById("pcUnlock").onclick = ()=> this.awardPlace(p);

    card.setAttribute("aria-hidden","false");
    document.getElementById("pcClose").onclick = ()=> card.setAttribute("aria-hidden","true");
  },

  // ---------- Game logic ----------
  awardPlace(p){
    if(this.state.visited[p.id]){ this.toast("Allerede låst opp ✅"); return; }
    this.state.visited[p.id] = Date.now();
    // bonus: +1 poeng til kategori for hvert sted
    this.state.merits[p.category] = (this.state.merits[p.category]||0) + 1;
    this.save();
    this.toast(`Låst opp: ${p.name} ✅`);
    this.renderCollection(); this.renderMerits();
  },

  startQuiz(personId){
    const quizzes = this.state.quizByPerson[personId]||[];
    if(!quizzes.length){ this.toast("Ingen quiz her ennå"); return; }
    const q = {...quizzes[0]}; // én for nå
    this._quiz = { idx:0, q, correct:0, personId };
    this.showQuiz();
  },

  showQuiz(){
    const m = document.getElementById("quizModal");
    const {q, idx} = this._quiz;
    const item = q.questions[idx];
    document.getElementById("quizTitle").textContent = q.title;
    document.getElementById("quizQuestion").textContent = item.text;
    document.getElementById("quizProgress").textContent = `Spørsmål ${idx+1} av ${q.questions.length}`;
    const wrap = document.getElementById("quizChoices"); wrap.innerHTML="";
    item.choices.forEach((c,i)=>{
      const btn=document.createElement("button");
      btn.textContent=c;
      btn.onclick = ()=> this.answerQuiz(i);
      wrap.appendChild(btn);
    });
    document.getElementById("quizFeedback").textContent = "";
    document.getElementById("quizClose").onclick = ()=> m.setAttribute("aria-hidden","true");
    m.setAttribute("aria-hidden","false");
  },

  answerQuiz(i){
    const fb = document.getElementById("quizFeedback");
    const {q, idx} = this._quiz;
    const cur = q.questions[idx];
    const correct = (i === cur.answerIndex);
    if(correct) this._quiz.correct++;
    fb.textContent = correct ? `Riktig! ${cur.explanation||""}` : `Feil. ${cur.explanation||""}`;

    setTimeout(()=>{
      // neste
      this._quiz.idx++;
      if(this._quiz.idx < q.questions.length){
        this.showQuiz();
      } else {
        // ferdig
        const person = this.findPerson(this._quiz.personId);
        if(this._quiz.correct === q.questions.length){
          // samler personen + poeng til kategori
          this.state.peopleCollected[person.id] = Date.now();
          this.state.merits[q.category] = (this.state.merits[q.category]||0) + (q.reward?.points||1);
          this.save();
          this.toast(`Samlet: ${person.name} ✅`);
          this.renderGallery(); this.renderMerits();
        }else{
          this.toast("Prøv igjen – du kan ta quiz ubegrenset 😊");
        }
        document.getElementById("quizModal").setAttribute("aria-hidden","true");
      }
    }, this.CFG.FEEDBACK_MS); // behold feedback lenge nok
  },

  // ---------- Helpers for people/place ----------
  placeFor(person){ return this.state.placeById[person.placeId]; },
  findPerson(id){ return this.state.people.find(p=>p.id===id); },

  // ---------- Sheets ----------
  openSheet(sel){ document.querySelector(sel).setAttribute("aria-hidden","false"); }
  closeSheet(sel){ document.querySelector(sel).setAttribute("aria-hidden","true"); },

  // ---------- Geolokasjon ----------
  requestLocation(){
    if(!("geolocation" in navigator)){
      document.getElementById("status").textContent = "Geolokasjon støttes ikke.";
      this.renderNearby(); return;
    }
    document.getElementById("status").textContent = "Henter posisjon…";
    navigator.geolocation.getCurrentPosition(pos=>{
      this.state.pos = {lat:pos.coords.latitude, lon:pos.coords.longitude};
      document.getElementById("status").textContent = "Posisjon funnet.";
      this.Map.setUser(this.state.pos);
      this.renderNearby();
    }, err=>{
      document.getElementById("status").textContent = "Kunne ikke hente posisjon.";
      this.renderNearby();
    }, {enableHighAccuracy:true,timeout:8000,maximumAge:10000});
  },

  // ---------- Map toggle ----------
  toggleMap(on){
    this.state.mapMode = !!on;
    document.body.classList.toggle("map-only", !!on);
    // i kartmodus viser vi Exit/Sentrer-knapper (styres av CSS-klassen)
  },

  // ---------- Init / wiring ----------
  wireUI(){
    document.getElementById("btnSeeMap").onclick  = ()=> this.toggleMap(true);
    document.getElementById("btnExitMap").onclick = ()=> this.toggleMap(false);
    document.getElementById("btnCenter").onclick  = ()=> this.state.pos && this.Map.setUser(this.state.pos);

    document.querySelectorAll("[data-close]").forEach(btn=>{
      btn.addEventListener("click", ()=> this.closeSheet(btn.getAttribute("data-close")));
    });

    // Place card close via overlay X
    document.getElementById("pcClose").onclick = ()=> document.getElementById("placeCard").setAttribute("aria-hidden","true");

    // Testmodus (hopper til Oslo S-ish og åpner kart om ønsket)
    document.getElementById("testToggle").addEventListener("change",(e)=>{
      if(e.target.checked){
        this.state.pos = {lat:59.911, lon:10.752};
        document.getElementById("status").textContent = "Testmodus: Oslo S";
        this.Map.setUser(this.state.pos);
        this.renderNearby();
        this.toast("Testmodus PÅ");
      } else {
        this.toast("Testmodus AV");
        this.requestLocation();
      }
    });
  },

  async boot(){
    await this.loadData();
    this.Map.init(this);
    this.requestLocation();
    this.renderNearby();
    this.renderCollection();
    this.renderMerits();
    this.renderGallery();
    this.wireUI();
  }
};

document.addEventListener("DOMContentLoaded", ()=> App.boot());
