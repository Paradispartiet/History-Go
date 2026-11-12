/* Finn Fauna: strictly individually approved WebP originals. Existing SVG schematics remain the fallback for other fauna. */
(function () {
 "use strict";
 const images=Object.freeze({
  emne_fauna_graaspurv:Object.freeze({
   scientificName:"Passer domesticus",
   src:"bilder/natur/fauna/godkjent/01_graaspurv_v1.webp",
   gitBlobSha:"468b3c17af9a0b90aebe7ce1cdd6866f9224687f",
   reviewedAt:"2026-11-12",
   stage:"adult_male_and_female_spring_plumage",
   evidence:"data/natur/fauna/illustration-quality-graaspurv-20261112.json"
  })
 });
 const get=id=>images[String(id)]||null;
 window.HG_NATURE_FAUNA_APPROVED=Object.freeze({get,has:id=>Boolean(get(id)),count:Object.keys(images).length});
})();
