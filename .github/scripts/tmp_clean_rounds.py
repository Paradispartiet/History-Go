from pathlib import Path
import re

ROOT = Path('.')

def read(path):
    return (ROOT / path).read_text(encoding='utf-8')

def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')

README = r'''# History GO — canonical PlaceCard-rundinger

Status: **eneste autoritative rundingskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-07-28**

Denne filen er det eneste dokumentet som bestemmer **hva som er en PlaceCard-runding og hvordan rundingssettet velges**. Andre dokumenter og schemaer skal peke hit, ikke gjenta en egen palett eller layoutregel.

> **Rundingen er en visuell inngang til innholdet bak. Preview-bildet er for syns skyld og skal aldri filtrere eller redefinere samlingen.**

## 1. Fast layout

Et PlaceCard viser **alltid nøyaktig fire rundinger** i et 2 × 2-felt.

- ingen 6-rundersvariant;
- ingen 9-/12-rundersvariant;
- ingen femte filler-runding;
- `badges` / Merker er alltid med;
- rundingene skal bruke et faktisk bilde/preview når dataene er produksjonsklare.

## 2. Canonical rundingspool

Dette er hele poolen:

```text
badges
people
objects
nature
brands
flora
fauna
```

`flora` og `fauna` er **naturspesifikke rundinger** og brukes bare på natursteder.

Følgende er uttrykkelig **ikke** rundinger:

- `works` / Verk;
- `details` / Detaljer;
- `spots` / Punkter;
- Civication;
- Før/nå;
- Fortellinger/Stories;
- Leksikon;
- Lek;
- Trening;
- Oppgaver;
- Events;
- Quiz;
- Observer;
- Notat;
- Rute;
- Wonderkammer.

## 3. Natursteder

Et canonical natursted bruker alltid dette rundingssettet:

```text
badges · nature · flora · fauna
```

På natursteder tar **Flora** og **Fauna** plassene som ellers kan brukes av **People** og **Gjenstander**. Natursteder skal derfor ikke bruke `people` eller `objects` som PlaceCard-rundinger.

Flora og Fauna skal lese eksisterende canonical naturdata (`place.flora` / `place.fauna`, naturmapping og de lastede `window.FLORA` / `window.FAUNA`-registrene). Rundingsarbeid skal ikke lage et parallelt artsregister.

`nature` er stedets overordnede naturinngang. Flora og Fauna er artsinnganger og skal ikke blandes inn i Nature-popupen som duplikatlister når de har egne rundinger.

## 4. Merker (`badges`)

Merker er obligatorisk og viser stedets canonical hovedkategori/underbadges. Klikk leder til stedets fagverkside etter Fagverk-kontrakten.

## 5. People (`people`)

People er navngitte personer med dokumentert konkret stedstilknytning etter People-kontraktene.

### Preview er aldri personfilter

People-rundingen viser ett representativt portrett i sirkelen. Dette bildet bestemmer **ikke** hvem som finnes bak rundingen.

- alle canonical personer med gyldig stedstilknytning skal fortsatt kunne vises i People-popupen;
- ikke bruk `people_ids`, lokal kuratering eller previewvalg til å snevre inn People-popupen;
- en eventuell produktbeslutning om redaksjonelt avgrensede People-sett må tas separat.

### Verk ligger under personen

Personens verk hører i personprofilen/People-popupen, for eksempel bibliografi, filmografi, diskografi, komposisjoner, roller eller arkitekturverk.

`works` er ikke PlaceCard-runding.

## 6. Gjenstander (`objects`)

Gjenstander er fysiske, identifiserbare ting med dokumentert stedstilknytning. Dette omfatter blant annet:

- artefakter og funn;
- maskiner, kjøretøy, våpen og instrumenter;
- klær, pokaler, dokumentobjekter og museumsgjenstander;
- billedkunstverk;
- skulpturer og statuer;
- installasjoner og annen fysisk offentlig kunst.

Et fysisk kunstverk er altså **Gjenstand**, ikke Verk-runding.

Canonical felt for ny/revidert produksjon er `place.objects`. Legacy `artifacts` og fysisk kvalifiserte Civication-elementer kan leses som compatibility-kilder, men skal ikke bli en ny rundingstype.

## 7. Natur (`nature`)

Nature er den overordnede naturinngangen. Den kan bruke `nature_profile` og øvrige canonical naturdata, men artslistene skilles ut i Flora/Fauna på natursteder.

## 8. Brands (`brands`)

Brands betyr fortsatt **bedrifter og kjente merker med dokumentert stedskobling**. Det er ikke en generell aktørkategori.

- gjenbruk canonical Brand;
- bruk korrekt logo/brandbilde;
- ikke legg klubber, institusjoner, personer, skilt eller andre objekter i Brands bare for å fylle en runding.

## 9. Detaljer og Punkter er ikke rundinger

Eksisterende strukturer som `place.details`, `visual_details`, `site_details`, `place.spots`, `subplaces` eller `subPlaces` kan fortsatt være nyttige steddata. De er **ikke PlaceCard-rundinger**.

Denne kontrakten bestemmer ikke en ny presentasjonsflate for dem. Ikke flytt dem til en annen UI-flate uten en eksplisitt produktbeslutning.

## 10. Events og forestillinger

En forestilling, teateroppsetning, konsert, visning eller annen tidsbundet produksjon ved stedet er et **Event** og hører under **Events i På stedet-baren**.

Historiske forestillinger kan i tillegg omtales i Historie/Stories når de er dokumenterte historiske episoder. Event-identiteten endres ikke av dette.

## 11. `rounds` og legacy

For nye/reviderte steder kan `place.rounds` brukes til eksplisitt kuratering når kategorien ikke har det faste natursettet.

Krav:

- nøyaktig fire unike canonical IDs;
- `badges` er med;
- `flora` og `fauna` brukes ikke utenfor natursteder;
- natursteder bruker alltid `badges · nature · flora · fauna`;
- `rundinger` er legacy alias;
- gamle IDs som Works, Details, Spots, Civication, Leksikon, Før/nå, Fortellinger, Lek, Trening og Oppgaver er compatibility-støy og skal ikke produseres på nytt.

## 12. Produksjonsgate

Et sted er rundingsklart når:

1. PlaceCard viser nøyaktig fire rundinger;
2. Merker er med;
3. natursteder viser `badges · nature · flora · fauna`;
4. andre steder bruker bare canonical IDs fra poolen;
5. previewbildene er reelle og stedsspesifikke;
6. People-preview filtrerer ikke People-popupen;
7. relevante rundings-/datagater passerer.
'''
write('data/places/README_place_rounds.md', README)

# Sted-for-sted-oppskriften skal route til rundingskontrakten, ikke kopiere den.
p = 'docs/PLACE_PRODUCTION_CHECKLIST.md'
s = read(p)
s = s.replace('MÅL FOR RUNDINGER: 4 / 6', 'MÅL FOR RUNDINGER: 4')
s = s.replace('WORKS-KANDIDATER:\n', '')
new_round_section = r'''# DEL D — RUNDINGER

## 8. Kontroller de fire PlaceCard-rundingene

**LES FØRST — obligatorisk:** `data/places/README_place_rounds.md`

Denne sjekklisten gjentar ikke rundingspalett, kategoriutvalg eller naturunntak. **Rundingskontrakten eier hele rundingsmodellen.**

- [ ] PlaceCard viser nøyaktig fire rundinger;
- [ ] rundingssettet følger den canonical rundingskontrakten;
- [ ] hvert preview er reelt og egnet;
- [ ] People-preview brukes ikke som innholdsfilter;
- [ ] gammel 6-/9-/12-runderslogikk er ikke brukt som produksjonsgrunnlag;
- [ ] Works, Detaljer og Punkter behandles ikke som PlaceCard-rundinger.

---

'''
s, n = re.subn(r'# DEL D — RUNDINGER[\s\S]*?(?=# DEL E —)', new_round_section, s, count=1)
if n != 1:
    raise SystemExit('Fant ikke DEL D i PLACE_PRODUCTION_CHECKLIST')
s = s.replace('# DEL F — PEOPLE, WORKS, BRANDS OG RELASJONER', '# DEL F — PEOPLE, BRANDS OG RELASJONER')
s = re.sub(r'## 13\. Works og Brands[\s\S]*?(?=---\n\n## 14\.)', '''## 13. Brands\n\n- [ ] søk eksisterende Brands-data;\n- [ ] gjenbruk eksisterende ID;\n- [ ] dokumenter bedrift-/merke–sted-koblingen;\n- [ ] korrekt logo;\n- [ ] ingen omklassifisering av andre aktørtyper til Brands.\n\nPersonverk håndteres i People-profilen etter People-kontrakten, ikke som PlaceCard-runding.\n\n---\n\n''', s, count=1)
s = s.replace('- [ ] nøyaktig 4 eller 6 rundinger;', '- [ ] nøyaktig fire rundinger;')
s = s.replace('- [ ] nøyaktig 4 eller 6;', '- [ ] nøyaktig fire;')
write(p, s)

# Place Standard skal bare peke til subsystemets eierfil.
p = 'docs/PLACE_STANDARD.md'
s = read(p)
replacement = '''### Rundinger\n\nRundingsmodellen eies **kun** av `data/places/README_place_rounds.md`. Denne filen vedlikeholder ikke en egen palett, kategori-matrise eller antallsregel.\n\n### På stedet'''
s, n = re.subn(r'### Rundinger[\s\S]*?### På stedet', replacement, s, count=1)
if n != 1:
    raise SystemExit('Fant ikke Rundinger-seksjon i PLACE_STANDARD')
s = s.replace('- 4 eller 6 rundinger;', '- fire rundinger etter rundingskontrakten;')
s = s.replace('- `rounds` = eksplisitt 4/6-kuratering;', '- `rounds` = eksplisitt kuratering etter rundingskontrakten;')
write(p, s)

# Popup-kontrakten skal ikke eie rundingspaletten.
p = 'docs/PLACE_POPUP_SYSTEM.md'
s = read(p)
s = s.replace('Fysiske Objects/Details/Spots skal ikke parkeres permanent i Mer bare fordi riktig rundingsdata mangler.', 'Fysiske stedselementer skal ikke parkeres permanent i Mer bare fordi riktig presentasjonsflate mangler.')
s, n = re.subn(r'## 14\. Rundinger[\s\S]*?(?=## 15\. Wonderkammer)', '''## 14. Rundinger\n\nRundingsmodellen eies **kun** av `data/places/README_place_rounds.md`. Popup-kontrakten gjentar ikke palett, antall eller kategoriutvalg.\n\n''', s, count=1)
if n != 1:
    raise SystemExit('Fant ikke Rundinger-seksjon i PLACE_POPUP_SYSTEM')
s = s.replace('Legacy-innhold migreres etter faktisk type til Objects, Details, Spots, People, Works, Nature, På stedet, relations/NextUp, Historie eller Stories.', 'Legacy-innhold migreres etter faktisk type til det canonical subsystemet som eier innholdet. Personverk hører i People-profilen, fysiske kunstverk kan være Objects, og tidsbundne produksjoner hører i Events/På stedet.')
write(p, s)

# Overordnede dokumenter peker til rundingskontrakten i stedet for å kopiere layoutregler.
for p in ['docs/DATA_PRODUCTION_CONTRACT.md', 'docs/HISTORY_GO_PRODUCT_MAP.md']:
    s = read(p)
    s = re.sub(r'Et ferdig PlaceCard viser nøyaktig \*\*4 eller 6\*\* rundinger\.[^\n]*', 'PlaceCard-rundinger følger `data/places/README_place_rounds.md`; denne filen gjentar ikke rundingsantall eller palett.', s)
    s = re.sub(r'ferdig sted viser nøyaktig 4 eller 6;', 'rundingssettet følger `data/places/README_place_rounds.md`;', s)
    write(p, s)

# Schema beskriver felt, ikke en parallell rundingskontrakt.
p = 'schemas/place.ts'
s = read(p)
s = s.replace('/** Små visuelle detaljer som skilt, symboler, inskripsjoner, ornamenter og fysiske spor. */', '/** Små stedsspesifikke detaljer. Dette er place-data, ikke en PlaceCard-runding. */')
s = s.replace('/** Fysiske delpunkter/delsteder som ikke nødvendigvis er egne canonical Places. */', '/** Fysiske delpunkter/delsteder. Dette er place-data, ikke en PlaceCard-runding. */')
s, n = re.subn(r'  /\*\*\n   \* Canonical PlaceCard-rundinger[\s\S]*?   \*/\n  rounds\?: string\[\];', '''  /**\n   * Eksplisitt PlaceCard-kuratering. Hele rundingskontrakten eies av\n   * data/places/README_place_rounds.md; schemaet gjentar ikke palett eller layout.\n   */\n  rounds?: string[];''', s, count=1)
if n != 1:
    raise SystemExit('Fant ikke rounds-kommentar i schemas/place.ts')
write(p, s)

RUNTIME = r'''// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical PlaceCard-rundinger: alltid fire. Rundingskontrakten eies av
// data/places/README_place_rounds.md.
(function installVisualPlaceRounds(global) {
  "use strict";

  const DEFS = Object.freeze([
    { id:"badges",  label:"Merker",      fallbackIcon:"🏅", iconId:"pcBadgesIcon",  listId:"pcBadgesList",  kind:"badges" },
    { id:"people",  label:"Personer",    fallbackIcon:"👥", iconId:"pcPeopleIcon",  listId:"pcPeopleList",  kind:"people" },
    { id:"objects", label:"Gjenstander", fallbackIcon:"🏺", iconId:"pcObjectsIcon", listId:"pcObjectsList", kind:"objects" },
    { id:"nature",  label:"Natur",       fallbackIcon:"🌿", iconId:"pcNatureIcon",  listId:"pcNatureList",  kind:"nature" },
    { id:"brands",  label:"Brands",      fallbackIcon:"🏷️", iconId:"pcBrandsIcon",  listId:"pcBrandsList",  kind:"brands" },
    { id:"flora",   label:"Flora",       fallbackIcon:"🌱", iconId:"pcFloraIcon",   listId:"pcFloraList",   kind:"flora" },
    { id:"fauna",   label:"Fauna",       fallbackIcon:"🐾", iconId:"pcFaunaIcon",   listId:"pcFaunaList",   kind:"fauna" }
  ]);

  const IDS = DEFS.map(def => def.id);
  const ID_SET = new Set(IDS);
  const BY_ID = new Map(DEFS.map(def => [def.id, def]));
  const NATURE_ROUNDS = Object.freeze(["badges", "nature", "flora", "fauna"]);
  const NON_NATURE_IDS = new Set(["badges", "people", "objects", "nature", "brands"]);

  // Beholder kategoriens relative prioritering fra den siste visuelle modellen,
  // men fjerner typene som ikke lenger er rundinger. Output er alltid fire.
  const PRIORITIES = Object.freeze({
    historie:["badges","people","objects","brands","nature"],
    historisk:["badges","people","objects","brands","nature"],
    kunst:["badges","people","objects","brands","nature"],
    politikk:["badges","people","objects","brands","nature"],
    musikk:["badges","people","objects","brands","nature"],
    litteratur:["badges","people","objects","brands","nature"],
    sport:["badges","people","objects","brands","nature"],
    natur:[...NATURE_ROUNDS],
    vitenskap:["badges","people","objects","brands","nature"],
    teknologi:["badges","objects","people","brands","nature"],
    filosofi:["badges","people","objects","brands","nature"],
    film_tv:["badges","people","objects","brands","nature"],
    by:["badges","people","objects","brands","nature"],
    lekeplass:["badges","objects","nature","people","brands"],
    trening:["badges","people","objects","brands","nature"],
    media:["badges","people","objects","brands","nature"],
    psykologi:["badges","people","objects","brands","nature"],
    religion:["badges","people","objects","brands","nature"],
    scenekunst:["badges","people","objects","brands","nature"],
    subkultur:["badges","people","objects","brands","nature"],
    naeringsliv:["badges","brands","people","objects","nature"],
    transport:["badges","objects","people","brands","nature"]
  });

  const s = value => String(value == null ? "" : value).trim();
  const arr = value => Array.isArray(value) ? value : [];
  const uniq = values => [...new Set(arr(values).map(s).filter(Boolean))];
  const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  let scheduled = false;
  let badgeBound = false;
  let natureLoad = null;

  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? arr(global.PLACES).find(place => s(place?.id) === id) || null : null;
  }
  function category(placeOrCategory) {
    return s(typeof placeOrCategory === "string" ? placeOrCategory : placeOrCategory?.category || "by").toLowerCase();
  }
  function priority(placeOrCategory) {
    const cat = category(placeOrCategory);
    return PRIORITIES[cat] || PRIORITIES.by;
  }
  function imageFor(item) {
    return item && typeof item === "object" ? s(item.imageCard || item.cardImage || item.image || item.img || item.photo || item.thumbnail || item.cover || item.logo) : "";
  }
  function iconHasImage(id) {
    return Boolean(s(document.getElementById(BY_ID.get(id)?.iconId)?.querySelector("img[src]")?.getAttribute("src")));
  }
  function civicationItems(place) {
    const id = s(place?.id);
    return [...arr(global.CIVICATION_STORE_BY_PLACE?.[id]), ...arr(place?.civication_store), ...arr(place?.civicationStore), ...arr(place?.civication_items), ...arr(place?.civicationItems)];
  }
  function physicalCivication(item) {
    if (!item || typeof item !== "object" || !imageFor(item)) return false;
    return Boolean(s(item.placeSpecificReason || item.place_specific_reason || item.historicalFunction || item.historical_function || item.material || item.objectType || item.object_type || item.kind || item.type) || item.physicalObject === true || item.physical === true || item.isPhysical === true);
  }
  function normalizeItem(item, index, sourceKind) {
    if (typeof item === "string") return { id:item, title:item, description:"", image:"", sourceKind, raw:item };
    if (!item || typeof item !== "object") return null;
    const id = s(item.id || item.slug || item.key || `${sourceKind}_${index}`);
    const title = s(item.title || item.name || item.label || item.common_name || item.norwegian_name || item.id || `${sourceKind} ${index + 1}`);
    return { id:id || title, title, description:s(item.description || item.desc || item.summary || item.placeSpecificDetail || item.whatToNotice || item.whereToFind), image:imageFor(item), sourceKind, raw:item };
  }
  function dedupe(items) {
    const seen = new Set();
    return items.filter(Boolean).filter(item => { const key=s(item.id || item.title).toLowerCase(); if (!key || seen.has(key)) return false; seen.add(key); return true; });
  }
  function speciesRaw(place, kind) {
    const direct = arr(place?.[kind]);
    if (direct.length) return direct;
    return arr(place?.nature_profile?.species_inventory?.[kind]);
  }
  function speciesItems(place, kind) {
    const registry = kind === "fauna" ? arr(global.FAUNA) : arr(global.FLORA);
    return dedupe(speciesRaw(place, kind).map((item, index) => {
      if (item && typeof item === "object") return normalizeItem(item, index, kind);
      const found = registry.find(row => s(row?.id) === s(item));
      return normalizeItem(found || item, index, kind);
    }));
  }
  function objectItems(place) {
    return dedupe([
      ...arr(place?.objects).map((x,i)=>normalizeItem(x,i,"objects")),
      ...arr(place?.artifacts).map((x,i)=>normalizeItem(x,i,"artifacts")),
      ...civicationItems(place).filter(physicalCivication).map((x,i)=>normalizeItem(x,i,"civication"))
    ]);
  }
  function getItems(place, id) {
    if (id === "objects") return objectItems(place);
    if (id === "flora" || id === "fauna") return speciesItems(place, id);
    return [];
  }
  function brandReady(place) {
    if (iconHasImage("brands")) return true;
    const id = s(place?.id);
    return [...arr(place?.brands), ...arr(place?.brand_ids), ...arr(global.BRANDS_BY_PLACE?.[id])].some(item => {
      if (item && typeof item === "object") return Boolean(imageFor(item));
      return Boolean(imageFor(global.HGBrands?.getById?.(item)));
    });
  }
  function imageReady(place, id) {
    if (!place || !ID_SET.has(id)) return false;
    if (id === "badges") return iconHasImage(id) || arr(global.BADGES).some(b => s(b?.id) === s(place.category) && imageFor(b));
    if (id === "people") return iconHasImage(id) || arr(place.people).some(x => imageFor(x));
    if (id === "objects") return objectItems(place).some(x => Boolean(x.image));
    if (id === "nature") return iconHasImage(id) || Boolean(imageFor(place.nature_profile)) || arr(place.nature).some(x => imageFor(x));
    if (id === "brands") return brandReady(place);
    if (id === "flora" || id === "fauna") return speciesItems(place,id).some(x => Boolean(x.image));
    return false;
  }
  function explicitIds(place) {
    if (category(place) === "natur") return [...NATURE_ROUNDS];
    const declared = arr(place?.rounds).length ? place.rounds : arr(place?.rundinger);
    return uniq(declared).filter(id => NON_NATURE_IDS.has(id));
  }
  function validExplicit(place) {
    const ids = explicitIds(place);
    return category(place) !== "natur" && ids.length === 4 && ids.includes("badges");
  }
  function selectedIds(place) {
    if (category(place) === "natur") return [...NATURE_ROUNDS];
    const explicit = explicitIds(place);
    if (validExplicit(place)) return explicit;
    const p = priority(place).filter(id => NON_NATURE_IDS.has(id));
    const excluded = new Set(uniq(place?.rounds_exclude).filter(id => id !== "badges"));
    const ready = p.filter(id => id === "badges" || (!excluded.has(id) && imageReady(place,id)));
    const fallback = p.filter(id => id === "badges" || !excluded.has(id));
    const candidates = uniq([...ready, ...fallback, ...p, "badges","people","objects","brands","nature"]);
    const out = candidates.slice(0,4);
    if (!out.includes("badges")) out.unshift("badges");
    return uniq(out).slice(0,4);
  }
  function readiness(place, ids = selectedIds(place)) {
    const selected = uniq(ids);
    const missingImages = selected.filter(id => !imageReady(place,id));
    return { selected, ready:selected.filter(id=>!missingImages.includes(id)), missingImages, complete:selected.length === 4 && missingImages.length === 0 };
  }
  function ensureDom() {
    const card=document.getElementById("placeCard"), grid=card?.querySelector(".pc-icons-quad"), body=card?.querySelector(".pc-body");
    if (!card || !grid || !body) return;
    for (const def of DEFS.filter(d=>["objects","flora","fauna"].includes(d.id))) {
      if (!document.getElementById(def.iconId)) { const el=document.createElement("div"); el.id=def.iconId; el.className="pc-round"; el.hidden=true; el.setAttribute("role","button"); el.tabIndex=0; el.setAttribute("aria-label",def.label); grid.appendChild(el); }
      if (!document.getElementById(def.listId)) { const el=document.createElement("div"); el.id=def.listId; el.hidden=true; el.setAttribute("aria-hidden","true"); body.appendChild(el); }
    }
  }
  function renderCustom(place, def) {
    const icon=document.getElementById(def.iconId), list=document.getElementById(def.listId); if (!icon || !list) return;
    const items=getItems(place,def.id);
    const natureAttr = def.id === "flora" ? "data-flora" : def.id === "fauna" ? "data-fauna" : "data-visual-round-item";
    list.innerHTML=items.length ? items.map(x=>`<button type="button" class="pc-person pc-visual-round-item" ${natureAttr}="${esc(x.id)}">${x.image?`<img src="${esc(x.image)}" class="pc-person-img" alt="">`:""}<span class="pc-person-meta"><span class="pc-person-name">${esc(x.title)}</span>${x.description?`<span class="pc-person-desc">${esc(x.description)}</span>`:""}</span></button>`).join("") : `<div class="pc-empty">Ingen ${esc(def.label.toLowerCase())} registrert ennå</div>`;
    const preview=items.find(x=>x.image);
    icon.innerHTML=preview?.image ? `<img src="${esc(preview.image)}" class="pc-person-img" alt="${esc(preview.title)}">` : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span></div>`;
  }
  function bindCustom(def) {
    const icon=document.getElementById(def.iconId); if (!icon || icon.dataset.visualRoundBound === "1") return; icon.dataset.visualRoundBound="1";
    const open=event=>{ if (event?.type === "keydown" && !["Enter"," "].includes(event.key)) return; event?.preventDefault?.(); event?.stopPropagation?.(); const place=currentPlace(); if (!place) return; renderCustom(place,def); const html=s(document.getElementById(def.listId)?.innerHTML) || `<div class="pc-empty">Ingen innhold ennå</div>`; global.showPlaceCardRoundPopup?.({title:def.label,subtitle:s(place.name || place.title),html,place,kind:def.kind}); };
    icon.addEventListener("click",open); icon.addEventListener("keydown",open);
  }
  function bindBadge() {
    if (badgeBound) return; badgeBound=true;
    document.addEventListener("click",event=>{ const target=event.target instanceof Element ? event.target.closest("#pcBadgesIcon") : null; if (!target) return; const id=s(currentPlace()?.id); if (!id) return; event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); global.location.href=`fagverk-sted.html?place=${encodeURIComponent(id)}`; },true);
  }
  function loadNatureIfNeeded(place) {
    if (category(place) !== "natur" || !global.DataHub?.loadNature) return;
    if (arr(global.FLORA).length && arr(global.FAUNA).length) return;
    if (natureLoad) return;
    natureLoad = Promise.resolve(global.DataHub.loadNature()).then(()=>{ natureLoad=null; scheduleApply(); },()=>{ natureLoad=null; });
  }
  function stripSpeciesFromNaturePopup(place) {
    if (category(place) !== "natur") return;
    const list=document.getElementById("pcNatureList");
    if (list && global.HGPlaceNatureProfile?.render) list.innerHTML=global.HGPlaceNatureProfile.render(place);
  }
  function apply(place=currentPlace()) {
    const card=document.getElementById("placeCard"); if (!card || !place) return;
    ensureDom(); bindBadge(); loadNatureIfNeeded(place); stripSpeciesFromNaturePopup(place);
    for (const def of DEFS.filter(d=>["objects","flora","fauna"].includes(d.id))) { renderCustom(place,def); bindCustom(def); }
    const selected=selectedIds(place), state=readiness(place,selected), allowed=new Set(selected.map(id=>BY_ID.get(id)?.iconId).filter(Boolean));
    const grid=card.querySelector(".pc-icons-quad");
    card.dataset.roundMode="canonical-four"; card.dataset.roundCount="4"; card.dataset.roundReadiness=state.complete?"ready":"incomplete"; card.dataset.roundMissingImages=state.missingImages.join(",");
    if (grid) {
      grid.querySelectorAll(".pc-round").forEach(icon=>{ const show=allowed.has(icon.id); icon.hidden=!show; icon.setAttribute("aria-hidden",show?"false":"true"); icon.dataset.roundSurface=show?"canonical-round":"outside-round-grid"; const def=DEFS.find(item=>item.iconId===icon.id); icon.style.order=show&&def?String(selected.indexOf(def.id)):""; });
      grid.dataset.roundMode="canonical-four"; grid.dataset.roundCount="4"; grid.style.gridTemplateColumns="repeat(2, var(--place-card-orb-size))"; grid.style.gridTemplateRows="repeat(2, var(--place-card-orb-size))";
    }
  }
  function scheduleApply() { if (scheduled) return; scheduled=true; const run=()=>{scheduled=false; apply();}; if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(run); else global.setTimeout(run,0); }
  function patchOpenPlaceCard() {
    const original=global.openPlaceCard; if (typeof original !== "function") return false; if (original.__canonicalFourRoundsPatched) return true;
    const patched=async function(...args){ const result=await original.apply(this,args); scheduleApply(); return result; };
    patched.__canonicalFourRoundsPatched=true; patched.__canonicalFourRoundsOriginal=original; global.openPlaceCard=patched; return true;
  }
  function installApi() {
    const byId=Object.fromEntries(DEFS.map(def=>[def.id,def]));
    global.HGPlaceRounds={ registry:[...DEFS], profiles:PRIORITIES, defaults:[...PRIORITIES.by].slice(0,4), byId, get:place=>selectedIds(place).map(id=>BY_ID.get(id)).filter(Boolean), apply, visualIds:[...IDS], visualRegistry:[...DEFS], visualPriorities:PRIORITIES, recommendVisual:place=>selectedIds(typeof place === "string" ? {category:place} : place || {}), getVisualReadiness:readiness, __canonicalFourRounds:true };
    global.getPlaceRounds=global.HGPlaceRounds.get;
  }
  function init() {
    ensureDom(); installApi(); bindBadge(); patchOpenPlaceCard(); scheduleApply();
    if (typeof global.openPlaceCard !== "function") { let attempts=0; const timer=global.setInterval(()=>{attempts+=1;if(patchOpenPlaceCard()||attempts>=80)global.clearInterval(timer);},100); }
  }

  global.HGVisualPlaceRounds={ ids:[...IDS], registry:[...DEFS], priorities:PRIORITIES, natureRounds:[...NATURE_ROUNDS], get:selectedIds, recommend:place=>selectedIds(typeof place === "string" ? {category:place} : place || {}), readiness, isImageReady:imageReady, getItems, apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
  ["hg:appReady","hg:place-selected","hg:places-ready","hg:placesUpdated","hg:visitedUpdated","updateProfile"].forEach(name=>global.addEventListener?.(name,()=>{patchOpenPlaceCard();scheduleApply();}));
})(window);
'''
write('js/ui/place-rounds-visual-collections.js', RUNTIME)

# Fjern den gamle 9/12-runders runtime-blokken fra place-card.js. Den nye runtimefilen eier HGPlaceRounds.
p = 'js/ui/place-card.js'
s = read(p)
s, n = re.subn(r'\n// ============================================================\n// PLACE ROUNDS —[\s\S]*?window\.getPlaceRounds = getPlaceRounds;\n', '\n', s, count=1)
if n != 1:
    raise SystemExit('Fant ikke legacy PLACE ROUNDS-blokk i place-card.js')
s = s.replace('applyPlaceRounds(place);', 'window.HGVisualPlaceRounds?.apply?.(place);')
write(p, s)

# 2x2-layout er nå eneste layout.
p = 'js/ui/place-rounds-fill-layout.js'
s = read(p)
s = s.replace('// Maksimerer 4/6-rundingsgridet i feltet ved siden av frontImage uten MutationObserver-loop.', '// Maksimerer det faste 4-rundingsgridet i feltet ved siden av frontImage uten MutationObserver-loop.')
s = s.replace('if (count !== 4 && count !== 6) {', 'if (count !== 4) {')
s = s.replace('const cols = count === 4 ? 2 : 3;', 'const cols = 2;')
write(p, s)

p = 'css/place-rounds-fill-layout.css'
s = read(p)
s = re.sub(r'\n#placeCard \.pc-icons-quad\[data-round-count="6"\]\{[\s\S]*?\}\n', '\n', s, count=1)
s = s.replace('#placeCard .pc-icons-quad[data-round-count="4"] .pc-round:not([hidden]),\n#placeCard .pc-icons-quad[data-round-count="6"] .pc-round:not([hidden]){', '#placeCard .pc-icons-quad[data-round-count="4"] .pc-round:not([hidden]){')
write(p, s)

# Governance skal vokte den eneste aktive runtimeen og dokumenteierne.
p = '.github/workflows/place-rounds-governance.yml'
s = read(p)
for needle in ['      - "js/ui/place-card.js"\n', '      - "docs/PLACE_PRODUCTION_CHECKLIST.md"\n', '      - "docs/PLACE_STANDARD.md"\n', '      - "docs/PLACE_POPUP_SYSTEM.md"\n', '      - "docs/DATA_PRODUCTION_CONTRACT.md"\n', '      - "docs/HISTORY_GO_PRODUCT_MAP.md"\n', '      - "tests/place-card-rounds-runtime-audit.test.js"\n']:
    if needle.strip() not in s:
        anchor = '      - "data/places/README_place_rounds.md"\n'
        s = s.replace(anchor, anchor + needle)
s = s.replace('Test 4/6 visual round contract', 'Test canonical four-round contract')
write(p, s)

VISUAL_TEST = r'''import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-visual-collections.js"), "utf8");
const windows = new Set();
afterEach(()=>{ for (const w of windows) w.close(); windows.clear(); });

const BASE_ICONS=["pcPeopleIcon","pcNatureIcon","pcBadgesIcon","pcWorksIcon","pcBrandsIcon","pcForNaIcon","pcFortellingerIcon","pcLeksikonIcon","pcPlayIcon","pcTrainingIcon","pcTasksIcon","pcCivicationStoreIcon"];
const BASE_LISTS=["pcPeopleList","pcNatureList","pcBadgesList","pcWorksList","pcBrandsList"];
function make(place, globals={}) {
  const dom=new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="${place.id}"><div class="pc-body"><div class="pc-icons-quad">${BASE_ICONS.map(id=>`<div id="${id}" class="pc-round" hidden></div>`).join("")}</div>${BASE_LISTS.map(id=>`<div id="${id}"></div>`).join("")}</div></div></body>`,{url:"https://history-go.test/",runScripts:"outside-only"});
  const {window}=dom; windows.add(window); window.PLACES=[place]; window.BADGES=[{id:place.category,image:"badge.png"}]; Object.assign(window,globals); window.eval(source); window.document.dispatchEvent(new window.Event("DOMContentLoaded",{bubbles:true})); window.HGVisualPlaceRounds.apply(place); return window;
}
const arr=x=>Array.from(x||[]);

test("canonical pool has only the seven approved ids",()=>{
  const w=make({id:"p1",category:"historie"});
  assert.deepEqual(arr(w.HGVisualPlaceRounds.ids),["badges","people","objects","nature","brands","flora","fauna"]);
  for (const id of ["works","details","spots","civication","før_nå","fortellinger","leksikon","play","training","tasks"]) assert.ok(!w.HGVisualPlaceRounds.ids.includes(id),id);
});

test("every non-nature place renders exactly four rounds",()=>{
  const p={id:"p2",category:"historie",people:[{image:"person.jpg"}],objects:[{id:"o",image:"object.jpg"}],brands:[{id:"b",image:"brand.jpg"}]};
  const w=make(p); assert.equal(arr(w.HGVisualPlaceRounds.get(p)).length,4); assert.equal(w.document.querySelector(".pc-icons-quad").dataset.roundCount,"4");
});

test("nature places are fixed to badges nature flora fauna",()=>{
  const p={id:"p3",category:"natur",flora:["f1"],fauna:["a1"],people:[{image:"person.jpg"}],objects:[{image:"object.jpg"}]};
  const w=make(p,{FLORA:[{id:"f1",name:"Plante",image:"flora.jpg"}],FAUNA:[{id:"a1",name:"Dyr",image:"fauna.jpg"}]});
  assert.deepEqual(arr(w.HGVisualPlaceRounds.get(p)),["badges","nature","flora","fauna"]);
  assert.ok(!arr(w.HGVisualPlaceRounds.get(p)).includes("people")); assert.ok(!arr(w.HGVisualPlaceRounds.get(p)).includes("objects"));
  assert.ok(w.document.getElementById("pcFloraIcon").querySelector("img")); assert.ok(w.document.getElementById("pcFaunaIcon").querySelector("img"));
});

test("six-item explicit legacy config is never accepted",()=>{
  const p={id:"p4",category:"historie",rounds:["badges","people","objects","nature","brands","works"]};
  const w=make(p); assert.equal(arr(w.HGVisualPlaceRounds.get(p)).length,4); assert.ok(!arr(w.HGVisualPlaceRounds.get(p)).includes("works"));
});

test("People preview does not define a person subset",()=>{
  assert.ok(!source.includes("people_ids"));
});
'''
write('tests/place-rounds-visual-collections.test.mjs', VISUAL_TEST)

GRID_TEST = r'''import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const source=fs.readFileSync(path.join(__dirname,"../js/ui/place-rounds-visual-collections.js"),"utf8");

test("legacy PlaceCard nodes cannot leak more than four rounds", async()=>{
 const dom=new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="p1"><div class="pc-body"><div class="pc-icons-quad">${["People","Nature","Badges","Works","CivicationStore","Brands","ForNa","Fortellinger","Leksikon","Play","Training","Tasks"].map(x=>`<div id="pc${x}Icon" class="pc-round"></div>`).join("")}</div><div id="pcPeopleList"></div><div id="pcNatureList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div></div></div></body>`,{url:"https://history-go.test/",runScripts:"outside-only"});
 const {window}=dom; window.PLACES=[{id:"p1",category:"historie",people:[{image:"p.jpg"}],objects:[{image:"o.jpg"}],brands:[{image:"b.jpg"}]}]; window.BADGES=[{id:"historie",image:"badge.png"}]; window.openPlaceCard=async()=>window.document.querySelectorAll(".pc-round").forEach(el=>el.hidden=false); window.eval(source); window.document.dispatchEvent(new window.Event("DOMContentLoaded",{bubbles:true})); await window.openPlaceCard(window.PLACES[0]); await new Promise(r=>window.setTimeout(r,20));
 const visible=[...window.document.querySelectorAll(".pc-icons-quad .pc-round")].filter(el=>!el.hidden); assert.equal(visible.length,4); assert.equal(window.document.querySelector(".pc-icons-quad").dataset.roundCount,"4"); dom.window.close();
});
'''
write('tests/place-rounds-grid-exclusivity.test.mjs', GRID_TEST)

FILL_TEST = r'''import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const script=fs.readFileSync(path.join(__dirname,"../js/ui/place-rounds-fill-layout.js"),"utf8");
const css=fs.readFileSync(path.join(__dirname,"../css/place-rounds-fill-layout.css"),"utf8");
test("four rounds use a 2x2 fill layout",()=>{const dom=new JSDOM('<body><div id="placeCard"><div class="pc-icons-quad" data-round-count="4"></div></div></body>',{runScripts:"outside-only"});const w=dom.window,g=w.document.querySelector('.pc-icons-quad');g.getBoundingClientRect=()=>({width:330,height:220});Object.defineProperty(g,'clientWidth',{value:330});Object.defineProperty(g,'clientHeight',{value:220});w.getComputedStyle=()=>({gap:'10px'});w.ResizeObserver=undefined;w.eval(script);w.HGPlaceRoundsFillLayout.layout();assert.equal(g.style.getPropertyValue('--hg-round-fill-size'),'105px');dom.window.close();});
test("six-round layout no longer exists",()=>{assert.doesNotMatch(css,/data-round-count="6"/);assert.match(css,/data-round-count="4"[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);assert.doesNotMatch(script,/count !== 4 && count !== 6/);});
'''
write('tests/place-rounds-fill-layout.test.mjs', FILL_TEST)

RUNTIME_AUDIT = r'''const assert=require('assert');const fs=require('fs');const path=require('path');const repo=path.resolve(__dirname,'..');const card=fs.readFileSync(path.join(repo,'js/ui/place-card.js'),'utf8');const rounds=fs.readFileSync(path.join(repo,'js/ui/place-rounds-visual-collections.js'),'utf8');assert(!card.includes('const PLACE_ROUND_REGISTRY = ['),'Legacy 9/12-rundersregister skal være fjernet fra place-card.js');assert(!card.includes('CATEGORY_ROUND_PROFILES'),'Legacy kategoriprofiler skal være fjernet fra place-card.js');assert(!card.includes('applyPlaceRounds(place);'),'place-card.js skal ikke håndheve gammel rundingsruntime');for(const id of ['works','details','spots','civication','før_nå','fortellinger','leksikon','play','training','tasks'])assert(!new RegExp(`id:\\s*["']${id}["']`).test(rounds),`${id} skal ikke være canonical rundingsdefinisjon`);assert(rounds.includes('NATURE_ROUNDS')&&rounds.includes('"flora"')&&rounds.includes('"fauna"'));assert(rounds.includes('dataset.roundCount="4"'));console.log('Canonical four-round runtime audit OK');'''
write('tests/place-card-rounds-runtime-audit.test.js', RUNTIME_AUDIT + '\n')

# Batchtester skal ikke eie den avviklede runtimekontrakten.
for p in ['tests/beierbrua-rounds-batch1.test.js','tests/nedre-foss-rounds-batch1.test.js','tests/kuba-parken-nature-rounds-batch1.test.js']:
    s=read(p)
    s=re.sub(r'\nconst runtime(?:Source)? = fs\.readFileSync\([\s\S]*?(?=\nconsole\.log\()', '\n', s, count=1)
    s=s.replace("const vm = require('vm');\n",'')
    write(p,s)

p='tests/oslo-blue-plaques-2026-round-content.test.js'
s=read(p)
s=s.replace("const vm = require('vm');\n",'')
s=re.sub(r"const runtimeSource = fs\.readFileSync\([^\n]+\);\n",'',s,count=1)
s=re.sub(r'\nfunction extractRoundsRuntime[\s\S]*?(?=\nconsole\.log\()', '\n', s, count=1)
write(p,s)

# En-linjes sportsbatchtest: fjern bare gammel profil-/rundingskontrakt, behold datakontrollene.
p='tests/skanevik-idrettsanlegg-batch1-round-content.test.js'
if (ROOT/p).exists():
    s=read(p)
    s=re.sub(r"const src=fs\.readFileSync\(path\.join\(repo,'js/ui/place-card\.js'\),'utf8'\);const m=src\.match\([\s\S]*?assert\.deepStrictEqual\(profiles\.sport,expected\);",'',s,count=1)
    s=re.sub(r"const rounds=\{people:rel,[\s\S]*?assert\.deepStrictEqual\(Object\.keys\(rounds\),expected\);",'',s,count=1)
    write(p,s)

# Permanente guards: den gamle modellen skal ikke snike seg tilbake i eierdokumentene.
owners=['data/places/README_place_rounds.md','docs/PLACE_PRODUCTION_CHECKLIST.md','docs/PLACE_STANDARD.md','docs/PLACE_POPUP_SYSTEM.md','docs/DATA_PRODUCTION_CONTRACT.md','docs/HISTORY_GO_PRODUCT_MAP.md','schemas/place.ts']
for p in owners:
    t=read(p)
    if re.search(r'4 eller 6|fire eller seks|3.?x.?2|seks rundinger',t,re.I):
        raise SystemExit(f'Stale 4/6-regel står igjen i {p}')
if 'details\n' in README or 'spots\n' in README or 'works\n' in README:
    raise SystemExit('Ikke-rundinger står fortsatt i canonical pool')
