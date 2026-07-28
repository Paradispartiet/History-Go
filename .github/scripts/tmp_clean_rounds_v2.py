from pathlib import Path
import re

ROOT = Path('.')

def read(path):
    return (ROOT / path).read_text(encoding='utf-8')

def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')

README = '''# History GO — canonical PlaceCard-rundinger

Status: **eneste autoritative rundingskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-07-28**

Denne filen er det eneste dokumentet som bestemmer **hva som er en PlaceCard-runding, hvor mange rundinger et sted har og hvilke rundinger som brukes**. Andre dokumenter og schemaer skal peke hit og skal ikke vedlikeholde egne rundingslister.

> **Rundingen er en visuell inngang. Previewet er for syns skyld og skal aldri filtrere eller redefinere innholdet bak.**

## 1. Fast regel: alltid fire

Et PlaceCard viser **alltid nøyaktig fire rundinger** i et 2 × 2-felt.

Det finnes ikke en 6-, 9- eller 12-rundersvariant.

## 2. Vanlige steder

Vanlige steder bruker dette faste settet:

```text
badges · people · objects · brands
```

- `badges` = Merker;
- `people` = People;
- `objects` = Gjenstander;
- `brands` = bedrifter/kjente merker med dokumentert stedskobling.

## 3. Natursteder

Canonical natursteder bruker dette faste settet:

```text
badges · map · flora · fauna
```

På natursteder erstatter **Flora** og **Fauna** People og Gjenstander. Natursteder bruker derfor ikke `people` eller `objects` som PlaceCard-rundinger.

### Kart på natursteder

`map` er et **eget turkart eller detaljert stedskart** for naturstedet.

Kartet skal være mer detaljert enn History GOs generelle hovedkart og skal, når relevant og kildegrunnlaget tillater det, vise stedsspesifikke naturelementer som for eksempel:

- stier, turtraséer og innfallsporter;
- vann, bekker, våtmark eller strandsoner;
- terreng/topografi og tydelige landskapsformer;
- vernegrenser eller naturtypeflater;
- utsiktspunkter, observasjonssoner eller andre dokumenterte naturpunkter;
- andre relevante naturelementer som faktisk hører til stedet.

**Et generisk hovedkart som bare zoomes inn på place-koordinaten oppfyller ikke kart-rundingen.** Runtime skal ikke bruke dette som fallback.

Artsmappingen som eies av `README/nature_mapping_workflow.md` og `js/nature_place_map_bridge.js` er kilde for Flora/Fauna-koblinger. Den er **ikke** i seg selv et turkart eller detaljkart.

## 4. Hele canonical rundingspoolen

```text
badges
people
objects
brands
map
flora
fauna
```

`map`, `flora` og `fauna` er naturspesifikke rundinger.

Følgende er uttrykkelig **ikke** rundinger:

- `nature`;
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

## 5. People er en inngang, ikke et filter

People-rundingen viser ett representativt portrett i sirkelen. Previewet bestemmer **ikke** hvem som finnes bak rundingen.

- alle canonical personer med gyldig stedstilknytning skal fortsatt kunne vises i People-popupen;
- ikke bruk `people_ids`, lokal kuratering eller previewvalg til å snevre inn People-popupen;
- en eventuell produktbeslutning om et redaksjonelt avgrenset People-sett må tas separat.

### Verk ligger under personen

Personens verk hører i personprofilen/People-popupen, for eksempel bibliografi, filmografi, diskografi, komposisjoner, roller eller arkitekturverk.

`works` er ikke PlaceCard-runding.

## 6. Gjenstander

`objects` er fysiske, identifiserbare ting med dokumentert stedstilknytning, blant annet artefakter, funn, maskiner, instrumenter, dokumentobjekter, museumsgjenstander, billedkunst, skulpturer, statuer og installasjoner.

Et fysisk kunstverk er **Gjenstand**, ikke Verk-runding.

Canonical felt for ny/revidert produksjon er `place.objects`. Legacy `artifacts` og fysisk kvalifiserte Civication-elementer kan leses som compatibility-kilder uten at Civication blir en runding.

## 7. Brands

Brands betyr **bedrifter og kjente merker med dokumentert stedskobling**. Det er ikke en generell aktørkategori.

- gjenbruk canonical Brand;
- bruk korrekt logo/brandbilde;
- ikke legg klubber, institusjoner, personer, skilt eller andre objekter i Brands for å fylle innhold.

## 8. Flora og Fauna

Flora/Fauna skal bruke eksisterende canonical naturarter og place-level naturmapping. Ikke opprett et parallelt artsregister i PlaceCard.

Sensitive arter eller lokaliteter skal ikke få presis kartplassering bare for å fylle kart- eller artsflaten.

## 9. Detaljer og Punkter er steddata, ikke rundinger

Eksisterende strukturer som `place.details`, `visual_details`, `site_details`, `place.spots`, `subplaces` eller `subPlaces` kan fortsatt være nyttige steddata. De er **ikke PlaceCard-rundinger**.

Denne kontrakten flytter dem ikke automatisk til en annen UI-flate.

## 10. Events og forestillinger

En forestilling, teateroppsetning, konsert, visning eller annen tidsbundet produksjon ved stedet er et **Event** og hører under **Events i På stedet-baren**.

Historiske forestillinger kan i tillegg omtales i Historie/Stories når de er dokumenterte historiske episoder. Event-identiteten endres ikke av dette.

## 11. Legacy `rounds`

`place.rounds`, `rundinger` og `rounds_exclude` er legacy presentasjonsgjeld. Nye/reviderte steder skal ikke bruke disse feltene til å finne opp egne rundingssett.

Runtime bruker de to faste profilene i denne kontrakten:

```text
vanlig: badges · people · objects · brands
natur:  badges · map · flora · fauna
```

Gamle round-ID-er skal ikke få gjenoppstå som canonical typer via aliaser eller fallback.

## 12. Produksjonsgate

Et sted er rundingsklart når:

1. PlaceCard viser nøyaktig fire rundinger;
2. rundingssettet er den faste profilen for vanlig sted eller natursted;
3. previewene er reelle og egnede;
4. People-preview filtrerer ikke People-popupen;
5. naturstedets kart er et faktisk tur-/detaljkart og ikke generisk hovedkart-zoom;
6. Flora/Fauna bruker canonical naturdata;
7. relevante rundings-/datagater passerer.
'''
write('data/places/README_place_rounds.md', README)

# Produksjonsoppskriften peker til én rundingskontrakt og kopierer ikke reglene.
p = 'docs/PLACE_PRODUCTION_CHECKLIST.md'
s = read(p)
s = s.replace('MÅL FOR RUNDINGER: 4 / 6', 'MÅL FOR RUNDINGER: 4')
new = '''# DEL D — RUNDINGER

## 8. Kontroller PlaceCard-rundingene

**LES FØRST — obligatorisk:** `data/places/README_place_rounds.md`

Denne oppskriften gjentar ikke rundingspalett, profiler eller naturkartkrav. **Rundingskontrakten eier hele rundingsmodellen.**

- [ ] stedet følger canonical rundingskontrakt;
- [ ] runtime og data bruker ikke legacy 6-/9-/12-rundersmodell;
- [ ] preview brukes ikke som innholdsfilter;
- [ ] gammel place-spesifikk `rounds`-kuratering brukes ikke som ny standard.

---

'''
s, n = re.subn(r'# DEL D — RUNDINGER[\s\S]*?(?=# DEL E —)', new, s, count=1)
if n != 1: raise SystemExit('Fant ikke DEL D i PLACE_PRODUCTION_CHECKLIST')
s = s.replace('# DEL F — PEOPLE, WORKS, BRANDS OG RELASJONER', '# DEL F — PEOPLE, BRANDS OG RELASJONER')
s = re.sub(r'## 13\. Works og Brands[\s\S]*?(?=---\n\n## 14\.)', '''## 13. Brands\n\n- [ ] søk eksisterende Brands-data;\n- [ ] gjenbruk eksisterende ID;\n- [ ] dokumenter bedrift-/merke–sted-koblingen;\n- [ ] korrekt logo;\n- [ ] ingen omklassifisering av andre aktørtyper til Brands.\n\nPersonverk håndteres i People-profilen etter People-kontrakten, ikke som PlaceCard-runding.\n\n---\n\n''', s, count=1)
s = s.replace('- [ ] nøyaktig 4 eller 6 rundinger;', '- [ ] rundingssettet følger `data/places/README_place_rounds.md`;')
s = s.replace('- [ ] nøyaktig 4 eller 6;', '- [ ] rundingssettet følger canonical rundingskontrakt;')
write(p, s)

# Øvrige dokumenter eier ikke egne rundingslister.
p = 'docs/PLACE_STANDARD.md'
s = read(p)
s, n = re.subn(r'### Rundinger[\s\S]*?### På stedet', '''### Rundinger\n\nRundingsmodellen eies **kun** av `data/places/README_place_rounds.md`. Denne filen vedlikeholder ikke egen palett, profil eller antallsregel.\n\n### På stedet''', s, count=1)
if n != 1: raise SystemExit('Fant ikke Rundinger-seksjon i PLACE_STANDARD')
s = re.sub(r'- 4 eller 6 rundinger;', '- rundingssett etter canonical rundingskontrakt;', s)
s = re.sub(r'- `rounds` = eksplisitt 4/6-kuratering;', '- `rounds` = legacy presentasjonsfelt; rundingsvalg eies av canonical rundingskontrakt;', s)
write(p, s)

p = 'docs/PLACE_POPUP_SYSTEM.md'
s = read(p)
s = s.replace('Fysiske Objects/Details/Spots skal ikke parkeres permanent i Mer bare fordi riktig rundingsdata mangler.', 'Fysiske stedselementer skal ikke parkeres permanent i Mer bare fordi riktig presentasjonsflate mangler.')
s, n = re.subn(r'## 14\. Rundinger[\s\S]*?(?=## 15\. Wonderkammer)', '''## 14. Rundinger\n\nRundingsmodellen eies **kun** av `data/places/README_place_rounds.md`. Popup-kontrakten gjentar ikke palett, profiler, antall eller naturkartkrav.\n\n''', s, count=1)
if n != 1: raise SystemExit('Fant ikke Rundinger-seksjon i PLACE_POPUP_SYSTEM')
s = s.replace('Legacy-innhold migreres etter faktisk type til Objects, Details, Spots, People, Works, Nature, På stedet, relations/NextUp, Historie eller Stories.', 'Legacy-innhold migreres etter faktisk type til subsystemet som eier innholdet. Personverk hører i People-profilen, fysiske kunstverk kan være Objects, og tidsbundne produksjoner hører i Events/På stedet.')
write(p, s)

for p in ['docs/DATA_PRODUCTION_CONTRACT.md', 'docs/HISTORY_GO_PRODUCT_MAP.md']:
    s = read(p)
    s = re.sub(r'Et ferdig PlaceCard viser nøyaktig \*\*4 eller 6\*\* rundinger\.[^\n]*', 'PlaceCard-rundinger følger `data/places/README_place_rounds.md`; denne filen gjentar ikke rundingsreglene.', s)
    s = re.sub(r'ferdig sted viser nøyaktig 4 eller 6;', 'rundingssettet følger `data/places/README_place_rounds.md`;', s)
    s = re.sub(r'4 eller 6 rundinger', 'rundinger etter canonical rundingskontrakt', s)
    write(p, s)

p = 'schemas/place.ts'
s = read(p)
s = s.replace('/** Små visuelle detaljer som skilt, symboler, inskripsjoner, ornamenter og fysiske spor. */', '/** Små stedsspesifikke detaljer. Place-data, ikke PlaceCard-runding. */')
s = s.replace('/** Fysiske delpunkter/delsteder som ikke nødvendigvis er egne canonical Places. */', '/** Fysiske delpunkter/delsteder. Place-data, ikke PlaceCard-runding. */')
s, n = re.subn(r'  /\*\*\n   \* Canonical PlaceCard-rundinger[\s\S]*?   \*/\n  rounds\?: string\[\];', '''  /**\n   * Legacy presentasjonsfelt. Hele rundingskontrakten eies av\n   * data/places/README_place_rounds.md; schemaet gjentar ikke profiler eller palett.\n   */\n  rounds?: string[];''', s, count=1)
if n != 1: raise SystemExit('Fant ikke rounds-kommentar i schemas/place.ts')
s = s.replace('/** Kan fjerne en valgfri standardrunding; `badges` kan ikke ekskluderes. */', '/** Legacy presentasjonsfelt; skal ikke styre nye/reviderte canonical rundingssett. */')
write(p, s)

RUNTIME = r'''// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical PlaceCard-rundinger. Regler eies kun av data/places/README_place_rounds.md.
(function installCanonicalPlaceRounds(global) {
  "use strict";

  const DEFS = Object.freeze([
    { id:"badges",  label:"Merker",      fallbackIcon:"🏅", iconId:"pcBadgesIcon",  listId:"pcBadgesList",  kind:"badges" },
    { id:"people",  label:"Personer",    fallbackIcon:"👥", iconId:"pcPeopleIcon",  listId:"pcPeopleList",  kind:"people" },
    { id:"objects", label:"Gjenstander", fallbackIcon:"🏺", iconId:"pcObjectsIcon", listId:"pcObjectsList", kind:"objects" },
    { id:"brands",  label:"Brands",      fallbackIcon:"🏷️", iconId:"pcBrandsIcon",  listId:"pcBrandsList",  kind:"brands" },
    { id:"map",     label:"Kart",        fallbackIcon:"🗺️", iconId:"pcNatureMapIcon", listId:"pcNatureMapList", kind:"nature-map" },
    { id:"flora",   label:"Flora",       fallbackIcon:"🌱", iconId:"pcFloraIcon",   listId:"pcFloraList",   kind:"flora" },
    { id:"fauna",   label:"Fauna",       fallbackIcon:"🐾", iconId:"pcFaunaIcon",   listId:"pcFaunaList",   kind:"fauna" }
  ]);
  const BY_ID = new Map(DEFS.map(def => [def.id, def]));
  const GENERAL_ROUNDS = Object.freeze(["badges", "people", "objects", "brands"]);
  const NATURE_ROUNDS = Object.freeze(["badges", "map", "flora", "fauna"]);
  const s = value => String(value == null ? "" : value).trim();
  const arr = value => Array.isArray(value) ? value : [];
  const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  let scheduled = false;
  let badgeBound = false;

  function isNature(place) { return s(place?.category).toLowerCase() === "natur"; }
  function selectedIds(place) { return [...(isNature(place) ? NATURE_ROUNDS : GENERAL_ROUNDS)]; }
  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? arr(global.PLACES).find(place => s(place?.id) === id) || null : null;
  }
  function imageFor(item) {
    return item && typeof item === "object" ? s(item.imageCard || item.cardImage || item.image || item.img || item.photo || item.thumbnail || item.cover || item.logo) : "";
  }
  function normalizeItem(item, index, sourceKind) {
    if (typeof item === "string") return { id:item, title:item, description:"", image:"", sourceKind };
    if (!item || typeof item !== "object") return null;
    const id=s(item.id || item.slug || item.key || `${sourceKind}_${index}`);
    return { id:id || s(item.title || item.name), title:s(item.title || item.name || item.label || item.id || `${sourceKind} ${index+1}`), description:s(item.description || item.desc || item.summary || item.placeSpecificDetail || item.whatToNotice || item.whereToFind), image:imageFor(item), sourceKind };
  }
  function dedupe(items) {
    const seen=new Set();
    return items.filter(Boolean).filter(item=>{const key=s(item.id || item.title).toLowerCase();if(!key||seen.has(key))return false;seen.add(key);return true;});
  }
  function civicationItems(place) {
    const id=s(place?.id);
    return [...arr(global.CIVICATION_STORE_BY_PLACE?.[id]),...arr(place?.civication_store),...arr(place?.civicationStore),...arr(place?.civication_items),...arr(place?.civicationItems)];
  }
  function physicalCivication(item) {
    if (!item || typeof item !== "object" || !imageFor(item)) return false;
    return Boolean(item.physicalObject === true || item.physical === true || item.isPhysical === true || s(item.objectType || item.object_type || item.material || item.historicalFunction || item.historical_function));
  }
  function objectItems(place) {
    return dedupe([
      ...arr(place?.objects).map((x,i)=>normalizeItem(x,i,"objects")),
      ...arr(place?.artifacts).map((x,i)=>normalizeItem(x,i,"artifacts")),
      ...civicationItems(place).filter(physicalCivication).map((x,i)=>normalizeItem(x,i,"civication"))
    ]);
  }
  async function natureItems(place, kind) {
    const fromBridge = await global.HGNaturePlaceMap?.getForPlace?.(place).catch?.(()=>null) || null;
    const items = kind === "flora" ? fromBridge?.floraItems : fromBridge?.faunaItems;
    if (arr(items).length) return arr(items).map((x,i)=>normalizeItem(x,i,kind)).filter(Boolean);
    const registry = kind === "flora" ? arr(global.FLORA) : arr(global.FAUNA);
    const ids = arr(place?.[kind]);
    return ids.map((id,i)=>normalizeItem(registry.find(row=>s(row?.id)===s(id)) || id,i,kind)).filter(Boolean);
  }
  function ensureDom() {
    const card=document.getElementById("placeCard"), grid=card?.querySelector(".pc-icons-quad"), body=card?.querySelector(".pc-body");
    if (!card || !grid || !body) return;
    for (const def of DEFS.filter(d=>["objects","map","flora","fauna"].includes(d.id))) {
      if (!document.getElementById(def.iconId)) { const el=document.createElement("div"); el.id=def.iconId; el.className="pc-round"; el.hidden=true; el.setAttribute("role","button"); el.tabIndex=0; el.setAttribute("aria-label",def.label); grid.appendChild(el); }
      if (!document.getElementById(def.listId)) { const el=document.createElement("div"); el.id=def.listId; el.hidden=true; el.setAttribute("aria-hidden","true"); body.appendChild(el); }
    }
  }
  function renderRows(items, def) {
    const attr = def.id === "flora" ? "data-flora" : def.id === "fauna" ? "data-fauna" : "data-visual-round-item";
    return items.length ? items.map(x=>`<button type="button" class="pc-person pc-visual-round-item" ${attr}="${esc(x.id)}">${x.image?`<img src="${esc(x.image)}" class="pc-person-img" alt="">`:""}<span class="pc-person-meta"><span class="pc-person-name">${esc(x.title)}</span>${x.description?`<span class="pc-person-desc">${esc(x.description)}</span>`:""}</span></button>`).join("") : `<div class="pc-empty">Ingen ${esc(def.label.toLowerCase())} registrert ennå</div>`;
  }
  async function renderCustom(place, def) {
    const icon=document.getElementById(def.iconId), list=document.getElementById(def.listId); if (!icon || !list) return;
    if (def.id === "map") {
      const preview = await Promise.resolve(global.HGNatureDetailedMap?.getPreview?.(place)).catch(()=>"");
      icon.innerHTML = preview ? `<img src="${esc(preview)}" class="pc-person-img" alt="Detaljert naturkart">` : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span></div>`;
      list.innerHTML = `<div class="pc-empty">Detaljert naturkart åpnes fra kart-rundingen.</div>`;
      icon.dataset.roundReady = preview || typeof global.HGNatureDetailedMap?.openPlace === "function" ? "true" : "false";
      return;
    }
    const items = def.id === "objects" ? objectItems(place) : await natureItems(place, def.id);
    list.innerHTML=renderRows(items,def);
    const preview=items.find(x=>x.image);
    icon.innerHTML=preview?.image ? `<img src="${esc(preview.image)}" class="pc-person-img" alt="${esc(preview.title)}">` : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span></div>`;
    icon.dataset.roundReady = preview?.image ? "true" : "false";
  }
  function showMissingDetailedMap(place) {
    global.showPlaceCardRoundPopup?.({
      title:"Kart",
      subtitle:s(place?.name || place?.title),
      kind:"nature-map",
      place,
      html:'<div class="pc-empty">Detaljert tur-/naturkart er ikke produsert for dette stedet ennå. History GO bruker ikke det generelle hovedkartet som fallback her.</div>'
    });
  }
  async function openNatureMap(place) {
    if (typeof global.HGNatureDetailedMap?.openPlace === "function") {
      await global.HGNatureDetailedMap.openPlace(place);
      return;
    }
    showMissingDetailedMap(place);
  }
  function bindCustom(def) {
    const icon=document.getElementById(def.iconId); if (!icon || icon.dataset.canonicalRoundBound === "1") return; icon.dataset.canonicalRoundBound="1";
    const open=async event=>{
      if(event?.type==="keydown"&&!["Enter"," "].includes(event.key))return;
      event?.preventDefault?.();event?.stopPropagation?.();
      const place=currentPlace();if(!place)return;
      if(def.id==="map"){await openNatureMap(place);return;}
      await renderCustom(place,def);
      const html=s(document.getElementById(def.listId)?.innerHTML)||'<div class="pc-empty">Ingen innhold ennå</div>';
      global.showPlaceCardRoundPopup?.({title:def.label,subtitle:s(place.name||place.title),html,place,kind:def.kind});
    };
    icon.addEventListener("click",open);icon.addEventListener("keydown",open);
  }
  function bindBadge() {
    if (badgeBound) return; badgeBound=true;
    document.addEventListener("click",event=>{const target=event.target instanceof Element?event.target.closest("#pcBadgesIcon"):null;if(!target)return;const id=s(currentPlace()?.id);if(!id)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();global.location.href=`fagverk-sted.html?place=${encodeURIComponent(id)}`;},true);
  }
  async function apply(place=currentPlace()) {
    const card=document.getElementById("placeCard");if(!card||!place)return;
    ensureDom();bindBadge();
    for(const def of DEFS.filter(d=>["objects","map","flora","fauna"].includes(d.id))){await renderCustom(place,def);bindCustom(def);}
    const selected=selectedIds(place);const allowed=new Set(selected.map(id=>BY_ID.get(id)?.iconId).filter(Boolean));const grid=card.querySelector(".pc-icons-quad");
    card.dataset.roundMode=isNature(place)?"nature-four":"standard-four";card.dataset.roundCount="4";
    if(grid){grid.querySelectorAll(".pc-round").forEach(icon=>{const show=allowed.has(icon.id);icon.hidden=!show;icon.setAttribute("aria-hidden",show?"false":"true");const def=DEFS.find(item=>item.iconId===icon.id);icon.style.order=show&&def?String(selected.indexOf(def.id)):"";});grid.dataset.roundMode=card.dataset.roundMode;grid.dataset.roundCount="4";grid.style.gridTemplateColumns="repeat(2, var(--place-card-orb-size))";grid.style.gridTemplateRows="repeat(2, var(--place-card-orb-size))";}
  }
  function scheduleApply(){if(scheduled)return;scheduled=true;const run=()=>{scheduled=false;apply();};if(typeof global.requestAnimationFrame==="function")global.requestAnimationFrame(run);else global.setTimeout(run,0);}
  function patchOpenPlaceCard(){const original=global.openPlaceCard;if(typeof original!=="function")return false;if(original.__canonicalFourRoundsPatched)return true;const patched=async function(...args){const result=await original.apply(this,args);scheduleApply();return result;};patched.__canonicalFourRoundsPatched=true;global.openPlaceCard=patched;return true;}
  function installApi(){const byId=Object.fromEntries(DEFS.map(def=>[def.id,def]));global.HGPlaceRounds={registry:[...DEFS],defaults:[...GENERAL_ROUNDS],profiles:{standard:[...GENERAL_ROUNDS],natur:[...NATURE_ROUNDS]},byId,get:place=>selectedIds(place).map(id=>BY_ID.get(id)),apply,__canonicalFourRounds:true};global.getPlaceRounds=global.HGPlaceRounds.get;}
  function init(){ensureDom();installApi();bindBadge();patchOpenPlaceCard();scheduleApply();if(typeof global.openPlaceCard!=="function"){let attempts=0;const timer=global.setInterval(()=>{attempts+=1;if(patchOpenPlaceCard()||attempts>=80)global.clearInterval(timer);},100);}}

  global.HGVisualPlaceRounds={ids:DEFS.map(def=>def.id),registry:[...DEFS],standardRounds:[...GENERAL_ROUNDS],natureRounds:[...NATURE_ROUNDS],get:selectedIds,apply};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
  ["hg:appReady","hg:place-selected","hg:places-ready","hg:placesUpdated","updateProfile"].forEach(name=>global.addEventListener?.(name,()=>{patchOpenPlaceCard();scheduleApply();}));
})(window);
'''
write('js/ui/place-rounds-visual-collections.js', RUNTIME)

# Fjern gammel 9/12-runders runtime fra place-card.js; den nye runtimefilen er eneste eier.
p = 'js/ui/place-card.js'
s = read(p)
s, n = re.subn(r'\n// ============================================================\n// PLACE ROUNDS —[\s\S]*?window\.getPlaceRounds = getPlaceRounds;\n', '\n', s, count=1)
if n != 1: raise SystemExit('Fant ikke legacy PLACE ROUNDS-blokk i place-card.js')
s = s.replace('applyPlaceRounds(place);', 'window.HGVisualPlaceRounds?.apply?.(place);')
write(p, s)

p = 'js/ui/place-rounds-fill-layout.js'
s = read(p)
s = s.replace('// Maksimerer 4/6-rundingsgridet i feltet ved siden av frontImage uten MutationObserver-loop.', '// Maksimerer det faste fire-rundingsgridet i feltet ved siden av frontImage uten MutationObserver-loop.')
s = s.replace('if (count !== 4 && count !== 6) {', 'if (count !== 4) {')
s = s.replace('const cols = count === 4 ? 2 : 3;', 'const cols = 2;')
write(p, s)

p = 'css/place-rounds-fill-layout.css'
s = read(p)
s = re.sub(r'\n#placeCard \.pc-icons-quad\[data-round-count="6"\]\{[\s\S]*?\}\n', '\n', s, count=1)
s = s.replace('#placeCard .pc-icons-quad[data-round-count="4"] .pc-round:not([hidden]),\n#placeCard .pc-icons-quad[data-round-count="6"] .pc-round:not([hidden]){', '#placeCard .pc-icons-quad[data-round-count="4"] .pc-round:not([hidden]){')
write(p, s)

VISUAL_TEST = r'''import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const source=fs.readFileSync(path.join(__dirname,"../js/ui/place-rounds-visual-collections.js"),"utf8");
const windows=new Set();afterEach(()=>{for(const w of windows)w.close();windows.clear();});
const ICONS=["People","Badges","Brands","Nature","Works","CivicationStore","ForNa","Fortellinger","Leksikon","Play","Training","Tasks"];
function make(place,globals={}){const dom=new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="${place.id}"><div class="pc-body"><div class="pc-icons-quad">${ICONS.map(x=>`<div id="pc${x}Icon" class="pc-round" hidden></div>`).join("")}</div><div id="pcPeopleList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div></div></div></body>`,{url:"https://history-go.test/",runScripts:"outside-only"});const w=dom.window;windows.add(w);w.PLACES=[place];Object.assign(w,globals);w.eval(source);w.document.dispatchEvent(new w.Event("DOMContentLoaded",{bubbles:true}));return w;}
const ids=(w,p)=>Array.from(w.HGPlaceRounds.get(p),d=>d.id);

test("canonical pool contains only approved round types",()=>{const p={id:"x",category:"historie"};const w=make(p);assert.deepEqual(Array.from(w.HGVisualPlaceRounds.ids),["badges","people","objects","brands","map","flora","fauna"]);for(const bad of ["nature","works","details","spots","civication","før_nå","fortellinger","leksikon","play","training","tasks"])assert.ok(!w.HGVisualPlaceRounds.ids.includes(bad),bad);});
test("ordinary places always use badges people objects brands",()=>{const p={id:"x",category:"historie",rounds:["works","nature"]};const w=make(p);assert.deepEqual(ids(w,p),["badges","people","objects","brands"]);});
test("nature places always use badges map flora fauna",()=>{const p={id:"n",category:"natur",people:[{}],objects:[{}]};const w=make(p);assert.deepEqual(ids(w,p),["badges","map","flora","fauna"]);});
test("nature map never falls back to generic main-map navigation",()=>{assert.ok(!/flyToPlace|HGMapView|\.flyTo\s*\(/.test(source));assert.ok(source.includes("HGNatureDetailedMap"));assert.ok(source.includes("generelle hovedkartet som fallback"));});
test("People preview does not create people_ids filtering",()=>{assert.ok(!source.includes("people_ids"));});
'''
write('tests/place-rounds-visual-collections.test.mjs', VISUAL_TEST)

GRID_TEST = r'''import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";import {JSDOM} from "jsdom";const __dirname=path.dirname(fileURLToPath(import.meta.url));const source=fs.readFileSync(path.join(__dirname,"../js/ui/place-rounds-visual-collections.js"),"utf8");test("legacy nodes cannot leak more than four rounds",async()=>{const dom=new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="p"><div class="pc-body"><div class="pc-icons-quad">${["People","Nature","Badges","Works","CivicationStore","Brands","ForNa","Fortellinger","Leksikon","Play","Training","Tasks"].map(x=>`<div id="pc${x}Icon" class="pc-round"></div>`).join("")}</div><div id="pcPeopleList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div></div></div></body>`,{url:"https://history-go.test/",runScripts:"outside-only"});const w=dom.window;w.PLACES=[{id:"p",category:"historie"}];w.eval(source);w.document.dispatchEvent(new w.Event("DOMContentLoaded",{bubbles:true}));await w.HGVisualPlaceRounds.apply(w.PLACES[0]);const visible=[...w.document.querySelectorAll(".pc-icons-quad .pc-round")].filter(el=>!el.hidden);assert.equal(visible.length,4);assert.equal(w.document.querySelector(".pc-icons-quad").dataset.roundCount,"4");dom.window.close();});
'''
write('tests/place-rounds-grid-exclusivity.test.mjs', GRID_TEST)

FILL_TEST = r'''import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";import {JSDOM} from "jsdom";const __dirname=path.dirname(fileURLToPath(import.meta.url));const script=fs.readFileSync(path.join(__dirname,"../js/ui/place-rounds-fill-layout.js"),"utf8");const css=fs.readFileSync(path.join(__dirname,"../css/place-rounds-fill-layout.css"),"utf8");test("four rounds use 2x2 fill layout",()=>{const dom=new JSDOM('<body><div id="placeCard"><div class="pc-icons-quad" data-round-count="4"></div></div></body>',{runScripts:"outside-only"});const w=dom.window,g=w.document.querySelector('.pc-icons-quad');g.getBoundingClientRect=()=>({width:330,height:220});Object.defineProperty(g,'clientWidth',{value:330});Object.defineProperty(g,'clientHeight',{value:220});w.getComputedStyle=()=>({gap:'10px'});w.ResizeObserver=undefined;w.eval(script);w.HGPlaceRoundsFillLayout.layout();assert.equal(g.style.getPropertyValue('--hg-round-fill-size'),'105px');dom.window.close();});test("six-round layout is removed",()=>{assert.doesNotMatch(css,/data-round-count="6"/);assert.doesNotMatch(script,/count !== 4 && count !== 6/);assert.match(css,/data-round-count="4"[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);});
'''
write('tests/place-rounds-fill-layout.test.mjs', FILL_TEST)

RUNTIME_AUDIT = '''const assert=require('assert');const fs=require('fs');const path=require('path');const repo=path.resolve(__dirname,'..');const card=fs.readFileSync(path.join(repo,'js/ui/place-card.js'),'utf8');const rounds=fs.readFileSync(path.join(repo,'js/ui/place-rounds-visual-collections.js'),'utf8');assert(!card.includes('const PLACE_ROUND_REGISTRY = ['));assert(!card.includes('CATEGORY_ROUND_PROFILES'));assert(!card.includes('applyPlaceRounds(place);'));for(const id of ['nature','works','details','spots','civication','før_nå','fortellinger','leksikon','play','training','tasks'])assert(!new RegExp(`id:\\s*["']${id}["']`).test(rounds),id);assert(rounds.includes('GENERAL_ROUNDS = Object.freeze(["badges", "people", "objects", "brands"])'));assert(rounds.includes('NATURE_ROUNDS = Object.freeze(["badges", "map", "flora", "fauna"])'));assert(rounds.includes('roundCount="4"')||rounds.includes('roundCount="4"'));console.log('Canonical four-round runtime audit OK');\n'''
write('tests/place-card-rounds-runtime-audit.test.js', RUNTIME_AUDIT)

# Stedsspesifikke tester skal ikke eie den gamle rundingsruntime-kontrakten.
for p in ['tests/beierbrua-rounds-batch1.test.js','tests/nedre-foss-rounds-batch1.test.js','tests/kuba-parken-nature-rounds-batch1.test.js','tests/oslo-blue-plaques-2026-round-content.test.js']:
    s=read(p)
    s=s.replace("const vm = require('vm');\n",'')
    s=re.sub(r"const runtimeSource = fs\.readFileSync\([^\n]+\);\n",'',s)
    s=re.sub(r"const runtime = fs\.readFileSync\([^\n]+\);\n",'',s)
    s=re.sub(r'\nfunction extractRoundsRuntime[\s\S]*?(?=\nconsole\.log\()', '\n', s, count=1)
    s=re.sub(r'\nconst runtimeStart = [\s\S]*?(?=\nconsole\.log\()', '\n', s, count=1)
    s=re.sub(r'\nconst start = runtime\.indexOf[\s\S]*?(?=\nconsole\.log\()', '\n', s, count=1)
    write(p,s)

# Governance følger den eneste canonical kontrakten.
p='.github/workflows/place-rounds-governance.yml'
s=read(p)
paths=['js/ui/place-card.js','docs/PLACE_PRODUCTION_CHECKLIST.md','docs/PLACE_STANDARD.md','docs/PLACE_POPUP_SYSTEM.md','docs/DATA_PRODUCTION_CONTRACT.md','docs/HISTORY_GO_PRODUCT_MAP.md','tests/place-card-rounds-runtime-audit.test.js']
for path in paths:
    line=f'      - "{path}"\n'
    if line not in s:
        s=s.replace('      - "data/places/README_place_rounds.md"\n','      - "data/places/README_place_rounds.md"\n'+line)
s=s.replace('Test 4/6 visual round contract','Test canonical four-round contract')
s=s.replace('node --test tests/place-rounds-visual-collections.test.mjs tests/place-rounds-grid-exclusivity.test.mjs tests/place-rounds-fill-layout.test.mjs','node --test tests/place-rounds-visual-collections.test.mjs tests/place-rounds-grid-exclusivity.test.mjs tests/place-rounds-fill-layout.test.mjs\n          node tests/place-card-rounds-runtime-audit.test.js')
write(p,s)

# Hard guards mot ny dokumentasjonsdrift.
owners=['data/places/README_place_rounds.md','docs/PLACE_PRODUCTION_CHECKLIST.md','docs/PLACE_STANDARD.md','docs/PLACE_POPUP_SYSTEM.md','docs/DATA_PRODUCTION_CONTRACT.md','docs/HISTORY_GO_PRODUCT_MAP.md','schemas/place.ts']
for p in owners:
    t=read(p)
    if re.search(r'4 eller 6|fire eller seks|3.?×.?2|3.?x.?2|seks rundinger',t,re.I):
        raise SystemExit(f'Stale 4/6-regel står igjen i {p}')
for p in ['docs/PLACE_STANDARD.md','docs/PLACE_POPUP_SYSTEM.md','docs/DATA_PRODUCTION_CONTRACT.md','docs/HISTORY_GO_PRODUCT_MAP.md','schemas/place.ts']:
    t=read(p)
    if re.search(r'badges\s*[·,].*people.*objects',t,re.I):
        raise SystemExit(f'Duplisert rundingspalett står igjen i {p}')
'''
