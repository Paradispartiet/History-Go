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

    el.classList.remove("is-open", "is-collapsed", "is-hidden");

    switch(next){
      case STATES.OPEN:
        el.classList.add("is-open");
        el.setAttribute("aria-hidden", "false");
        break;

      case STATES.COLLAPSED:
        el.classList.add("is-collapsed");
        el.setAttribute("aria-hidden", "true");
        break;

      case STATES.HIDDEN:
        el.classList.add("is-hidden");
        el.setAttribute("aria-hidden", "true");
        break;
    }

    state = next;
  }

  function bindCollapseButton(){
    const button = document.getElementById("pcCollapseBtn");
    if (!button || button.dataset.hgBottomSheetCollapseBound === "1") return;

    button.dataset.hgBottomSheetCollapseBound = "1";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (typeof window.collapsePlaceCard === "function") {
        window.collapsePlaceCard();
      } else {
        collapse();
      }
    });
  }

  function open(){
    bindCollapseButton();
    console.trace("[bottomSheetController] open");
    setState(STATES.OPEN);
  }

  function collapse(){
  console.trace("[bottomSheetController] collapse");
  setState(STATES.COLLAPSED);
}

function hide(){
  console.trace("[bottomSheetController] hide");
  setState(STATES.HIDDEN);
}

  function toggle(){
    if (state === STATES.OPEN){
      collapse();
    } else {
      open();
    }
  }

  function init(){
    const nextEl = document.getElementById("placeCard");
    if (!nextEl) return;

    // bootBackground calls init() again after the first PlaceCard may have
    // opened. Rebinding must never reset the existing sheet to hidden.
    if (el === nextEl) {
      bindCollapseButton();
      return;
    }

    el = nextEl;
    bindCollapseButton();

    // Preserve an already open sheet if a new DOM node was mounted.
    if (el.classList.contains("is-open") && el.dataset.currentPlaceId) {
      el.setAttribute("aria-hidden", "false");
      state = STATES.OPEN;
      return;
    }

    el.classList.remove("is-open", "is-collapsed", "is-hidden");
    el.classList.add("is-hidden");
    el.setAttribute("aria-hidden", "true");
    state = STATES.HIDDEN;
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
