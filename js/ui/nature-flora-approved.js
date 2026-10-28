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
    })    ,
    emne_flora_hvitveis: Object.freeze({
      scientificName: "Anemone nemorosa",
      src: "bilder/natur/flora/illustrasjonskandidater/b01/01_hvitveis.webp",
      gitBlobSha: "1375dbae20ac510a53b3c9bd1fc2eaa92c54ff4c",
      reviewedAt: "2026-10-28",
      stage: "vårblomstring",
      evidence: "data/natur/flora/illustration-quality-batch01-20261028.json"
    }),
    emne_flora_blaveis: Object.freeze({
      scientificName: "Hepatica nobilis",
      src: "bilder/natur/flora/illustrasjonskandidater/b01/07_blaveis.webp",
      gitBlobSha: "8ed2ce6edbf4444e8b9102d34b8b47ae9390d6d6",
      reviewedAt: "2026-10-28",
      stage: "vårblomstring",
      evidence: "data/natur/flora/illustration-quality-batch01-20261028.json"
    })

  });
  const get = id => images[String(id)] || null;
  window.HG_NATURE_FLORA_APPROVED = Object.freeze({get,has:id=>Boolean(get(id)),count:Object.keys(images).length});
})();
