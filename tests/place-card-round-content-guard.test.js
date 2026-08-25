const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const guardJs = fs.readFileSync(path.join(repo, 'js/ui/place-card-round-content-guard.js'), 'utf8');
const statusSurfaceJs = fs.readFileSync(path.join(repo, 'js/ui/place-card-status-surface.js'), 'utf8');

for (const id of [
  'pcPeopleList',
  'pcNatureList',
  'pcWorksList',
  'pcBadgesList',
  'pcTasksList',
  'pcCivicationStoreList',
  'pcBrandsList',
  'pcForNaList',
  'pcFortellingerList',
  'pcLeksikonList',
  'pcPlayList',
  'pcTrainingList'
]) {
  assert(guardJs.includes(`"${id}"`), `${id} skal omfattes av rundingsvakten`);
}

assert(guardJs.includes('el.hidden = true'), 'Rundingslistene skal skjules fra stedskortets hovedflate');
assert(guardJs.includes('el.setAttribute("aria-hidden", "true")'), 'Skjulte rundingslister skal også skjules semantisk');
assert(guardJs.includes('el.classList.remove("is-open")'), 'Legacy inline-toggle skal ikke kunne åpne tekst under rundingene');
assert(guardJs.includes('document.addEventListener("click", openNatureRound, true)'), 'Natur-rundingen skal fanges før gammel klikkbehandler');
assert(guardJs.includes('event.stopImmediatePropagation()'), 'Gammel naturbehandler skal ikke erstatte full naturvisning med bare profilen');
assert(guardJs.includes('target.closest("#pcNatureIcon")'), 'Vakthåndtereren skal bare overstyre natur-rundingen');
assert(guardJs.includes('window.HGNaturePlaceMap.applyToPlaceCard(place)'), 'Naturinnholdet skal oppdateres før popupen åpnes');
assert(guardJs.includes('s(natureEl?.innerHTML)'), 'Natur-popupen skal hente hele pcNatureList med profil, flora og fauna');
assert(guardJs.includes('window.showPlaceCardRoundPopup({'), 'Naturinnholdet skal åpnes i rundingspopupen');
assert(guardJs.includes('kind: "nature"'), 'Popupen skal beholde canonical nature-kind');
assert(guardJs.includes('new MutationObserver(() => hideInlineRoundLists())'), 'Senere DOM-oppdateringer skal ikke lekke rundingsinnhold under stedskortet');

assert(statusSurfaceJs.includes('function loadRoundContentGuard()'), 'PlaceCard-bootstrap skal ha egen loader for rundingsvakten');
assert(/script\.src\s*=\s*["']js\/ui\/place-card-round-content-guard\.js["']/.test(statusSurfaceJs), 'PlaceCard-bootstrap skal laste rundingsvakten');
assert(statusSurfaceJs.includes('global.__HG_PLACE_CARD_ROUND_CONTENT_GUARD_REQUESTED__'), 'Loaderen skal hindre dobbel lasting av rundingsvakten');
assert(statusSurfaceJs.includes('loadRoundContentGuard();'), 'Rundingsvakten skal startes når PlaceCard-statusflaten lastes');

console.log('PlaceCard round content guard audit OK');
