(function(){

  const STATES = {
    HIDDEN: "hidden",
    OPEN: "open"
  };

  let el = null;
  let state = STATES.HIDDEN;

  function setState(next){
    if (!el) return;
    if (next === state) return;

    el.classList.remove("is-open", "is-hidden");

    switch(next){
      case STATES.OPEN:
        el.classList.add("is-open");
        el.setAttribute("aria-hidden", "false");
        break;

      case STATES.HIDDEN:
        el.classList.add("is-hidden");
        el.setAttribute("aria-hidden", "true");
        break;
    }

    state = next;
  }

  function open(){
    setState(STATES.OPEN);
  }

  function hide(){
    setState(STATES.HIDDEN);
  }

  function toggle(){
    if (state === STATES.OPEN){
      hide();
    } else {
      open();
    }
  }

  function init(){
    el = document.getElementById("placeCard");
    if (!el) return;

    el.classList.add("is-hidden");
    el.setAttribute("aria-hidden", "true");
  }

  window.bottomSheetController = {
    init,
    open,
    hide,
    toggle,
    setState
  };

})();
