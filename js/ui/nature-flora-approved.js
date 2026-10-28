/* Species-reviewed and visually accepted botanical artwork only.
 * Candidates in data/natur/flora/illustration-candidates-*.json do NOT
 * grant publication. No generated SVG may bypass this register.
 */
(function () {
  "use strict";
  const images = Object.freeze({
    // Add individually accepted images only after recording botanical evidence,
    // dark-background visual QA, and a verified immutable Git blob SHA.
  });
  const get = id => images[String(id)] || null;
  window.HG_NATURE_FLORA_APPROVED = Object.freeze({get,has:id=>Boolean(get(id)),count:Object.keys(images).length});
})();
