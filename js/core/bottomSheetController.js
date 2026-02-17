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

    el.classList.remove("is-open", "is-collapsed");

    switch(next){
      case STATES.OPEN:
        el.classList.add("is-open");
        break;

      case STATES.COLLAPSED:
        el.classList.add("is-collapsed");
        break;
    }

    state = next;
  }

  function open(){
    setState(STATES.OPEN);
  }

  function collapse(){
    setState(STATES.COLLAPSED);
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
  }

  window.bottomSheetController = {
    init,
    open,
    collapse,
    toggle,
    setState
  };

})();
