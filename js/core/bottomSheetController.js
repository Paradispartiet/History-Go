(function(){

  const STATES = {
    HIDDEN: "hidden",      // brukes bare av LayerManager
    OPEN: "open",
    COLLAPSED: "collapsed"
  };

  let el = null;
  let state = STATES.COLLAPSED;

  function setState(next){
    if (!el) return;
    if (next === state) return;

    el.classList.remove("is-open", "is-collapsed", "is-hidden");

switch(next){
  case STATES.OPEN:
    el.classList.add("is-open");
    break;

  case STATES.COLLAPSED:
    el.classList.add("is-collapsed");
    break;

  case STATES.HIDDEN:
    el.classList.add("is-hidden");
    break;
}

    state = next;
  }

  function open(){
    setState(STATES.OPEN);
    if (el) el.setAttribute("aria-hidden", "false");
  }

  function collapse(){
  setState(STATES.COLLAPSED);
  if (el) el.setAttribute("aria-hidden", "true");
}

function hide(){
  setState(STATES.HIDDEN);
  if (el) el.setAttribute("aria-hidden", "true");
}

  function toggle(){
    if (state === STATES.OPEN){
      collapse();
    } else {
      open();
    }
  }

  function init(){
    el = document.getElementById("placeCard");
    if (!el) return;

    // start collapsed
    el.classList.add("is-collapsed");
    el.setAttribute("aria-hidden", "true");
  }

  window.bottomSheetController = {
  init,
  open,
  collapse,
  hide,
  toggle,
  setState
};

})();
