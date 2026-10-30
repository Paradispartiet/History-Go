/* Individually botanically verified AND visually approved Finn Flora images.
 * This registry is the sole publication gate. Review candidates, old SVG
 * templates and local review state cannot activate an artskort illustration.
 */
(function () {
  "use strict";
  const images = Object.freeze({
    emne_flora_geitrams: Object.freeze({
      "scientificName": "Chamerion angustifolium",
      "src": "bilder/natur/flora/illustrasjonskandidater/b06/02_geitrams.webp",
      "gitBlobSha": "1962c3082ad500cd52b419334d6470235a2c66b0",
      "reviewedAt": "2026-10-28",
      "stage": "blomstring",
      "evidence": "data/natur/flora/illustration-quality-batch06-20261028.json"
    }),
    emne_flora_ryllik: Object.freeze({
      scientificName: "Achillea millefolium",
      src: "bilder/natur/flora/illustrasjonskandidater/b06/01_ryllik.webp",
      gitBlobSha: "5b593314041bb8122f401f78695977fc7db8f31c",
      reviewedAt: "2026-10-29",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-batch07-20261028.json"
    }),
    emne_flora_groblad: Object.freeze({
      "scientificName": "Plantago major",
      "src": "bilder/natur/flora/illustrasjonskandidater/b06/03_groblad.webp",
      "gitBlobSha": "23e2dcadfcb4750312c4fe9c17cd39e701a9139b",
      "reviewedAt": "2026-10-28",
      "stage": "blomstring",
      "evidence": "data/natur/flora/illustration-quality-batch06-20261028.json"
    }),

    emne_flora_lovetann: Object.freeze({
      "scientificName": "Taraxacum officinale agg.",
      "src": "bilder/natur/flora/illustrasjonskandidater/b05/01_lovetann_v2.webp",
      "gitBlobSha": "df3e933959180185025c33657c4c71cc00fd61c7",
      "reviewedAt": "2026-10-28",
      "stage": "blomstring",
      "evidence": "data/natur/flora/illustration-quality-batch05-20261028.json"
    }),
    emne_flora_rodjonsokblom: Object.freeze({
      "scientificName": "Silene dioica",
      "src": "bilder/natur/flora/illustrasjonskandidater/b05/02_rodjonsokblom_v2.webp",
      "gitBlobSha": "feaad9255b0c8288423cb4a99f8d5a9472dfcd14",
      "reviewedAt": "2026-10-28",
      "stage": "blomstring",
      "evidence": "data/natur/flora/illustration-quality-batch05-20261028.json"
    }),
    emne_flora_prestekrage: Object.freeze({
      "scientificName": "Leucanthemum vulgare",
      "src": "bilder/natur/flora/illustrasjonskandidater/b05/03_prestekrage_v2.webp",
      "gitBlobSha": "d343ff4a96d828e8d02f1c350cd98e253bd0db1a",
      "reviewedAt": "2026-10-28",
      "stage": "blomstring",
      "evidence": "data/natur/flora/illustration-quality-batch05-20261028.json"
    }),

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
