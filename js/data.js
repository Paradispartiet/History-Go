// Laster datafiler – med fallback slik at appen alltid har noe å vise
(async function loadData(){
  HG.data = {
    places : await safe("data/places.json", [
      { id:"observatoriet", name:"Observatoriet", category:"vitenskap", year:1833, lat:59.917, lon:10.726, desc:"Tidligere hovedsete for norsk astronomi." }
    ]),
    people : await safe("data/people.json", []),
    badges : await safe("data/badges.json", []),
    routes : await safe("data/routes.json", [])
  };
})();

async function safe(path, fallback){
  try{ const r = await fetch(path); if(!r.ok) throw 0; return await r.json(); }
  catch(e){ console.warn("Mangler/feil data:", path, "- bruker fallback"); return fallback; }
}
