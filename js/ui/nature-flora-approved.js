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
    }),
    emne_flora_hvitveis: Object.freeze({
      scientificName: "Anemone nemorosa",
      src: "bilder/natur/flora/illustrasjonskandidater/b01/01_hvitveis.webp",
      gitBlobSha: "1375dbae20ac510a53b3c9bd1fc2eaa92c54ff4c",
      reviewedAt: "2026-10-28",
      stage: "vårblomstring",
      evidence: "data/natur/flora/illustration-quality-batch01-20261028.json"
    }),
    emne_flora_engkarse: Object.freeze({
      scientificName: "Cardamine pratensis",
      src: "bilder/natur/flora/illustrasjonskandidater/b04/01_engkarse_v3.webp",
      gitBlobSha: "346744f204310f1ff066dedaad90721d1e39270a",
      reviewedAt: "2026-10-28",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-revision-batch04.json"
    }),
    emne_flora_ballblom: Object.freeze({
      scientificName: "Trollius europaeus",
      src: "bilder/natur/flora/illustrasjonskandidater/b04/02_ballblom_v3.webp",
      gitBlobSha: "69d93fa920043aec97204528ebaa160cd57f733d",
      reviewedAt: "2026-10-28",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-revision-batch04.json"
    }),
    emne_flora_engsoleie: Object.freeze({
      scientificName: "Ranunculus acris",
      src: "bilder/natur/flora/illustrasjonskandidater/b04/03_engsoleie_v3.webp",
      gitBlobSha: "a63657dea3251934afcd8b8669cace9899cf169a",
      reviewedAt: "2026-10-28",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-revision-batch04.json"
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
