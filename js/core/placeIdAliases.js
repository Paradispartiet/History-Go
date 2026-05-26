(function(){
  "use strict";
  const PLACE_ID_ALIASES = Object.freeze({
    sagene_film: "sagene",
    kampen_film: "kampen",
    psykologirommet_oslo: "psykologisk_institutt_uio"
  });
  function normalizePlaceId(id){
    const key = String(id || "").trim();
    return PLACE_ID_ALIASES[key] || key;
  }
  function getPlaceIdAliases(){ return PLACE_ID_ALIASES; }
  window.HGPlaceIds = { normalizePlaceId, getPlaceIdAliases };
})();
