/* Individually botanically verified AND visually approved Finn Flora images.
 * This registry is the sole publication gate. Review candidates, old SVG
 * templates and local review state cannot activate an artskort illustration.
 */
(function () {
  "use strict";
  const images = Object.freeze({
    emne_flora_hestehov: Object.freeze({
      scientificName: "Tussilago farfara",
      src: "bilder/natur/flora/illustrasjonskandidater/b03/01_hestehov_var.webp",
      gitBlobSha: "f23ea2f496921dd4e077f0c3aa4bb303c2fd6dea",
      reviewedAt: "2026-10-28",
      stage: "vårblomstring",
      evidence: "data/natur/flora/illustration-quality-review-20261028.json"
    })
  });
  const get = id => images[String(id)] || null;
  window.HG_NATURE_FLORA_APPROVED = Object.freeze({get,has:id=>Boolean(get(id)),count:Object.keys(images).length});
})();
