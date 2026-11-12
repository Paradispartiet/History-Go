/* Finn Fauna: strictly individually approved WebP originals. Existing SVG schematics remain the fallback for other fauna. */
(function () {
 "use strict";
 const images=Object.freeze({
  emne_fauna_ringdue:Object.freeze({
   scientificName:"Columba palumbus",
   src:"bilder/natur/fauna/godkjent/07_ringdue_v1.webp",
   gitBlobSha:"643eea93e2803fb1de8fcaaf6fba378aa7d61e74",
   reviewedAt:"2026-11-12",
   stage:"adult_perched_and_flying_white_neck_and_wing_bars",
   evidence:"data/natur/fauna/illustration-quality-ringdue-20261112.json"
  }),
  emne_fauna_kjottmeis:Object.freeze({
   scientificName:"Parus major",
   src:"bilder/natur/fauna/godkjent/06_kjottmeis_v1.webp",
   gitBlobSha:"3cb439a66db0b59072f13413fd9d2b2c01e4d816",
   reviewedAt:"2026-11-12",
   stage:"adult_male_broad_black_belly_stripe_and_female_narrow_stripe",
   evidence:"data/natur/fauna/illustration-quality-kjottmeis-20261112.json"
  }),
  emne_fauna_blaameis:Object.freeze({
   scientificName:"Cyanistes caeruleus",
   src:"bilder/natur/fauna/godkjent/05_blaameis_v1.webp",
   gitBlobSha:"038718c8ba46ee769d5c5cc76920229ed9d4171d",
   reviewedAt:"2026-11-12",
   stage:"adult_perched_and_hanging_blue_crown_yellow_breast",
   evidence:"data/natur/fauna/illustration-quality-blaameis-20261112.json"
  }),
  emne_fauna_svarttrost:Object.freeze({
   scientificName:"Turdus merula",
   src:"bilder/natur/fauna/godkjent/04_svarttrost_v1.webp",
   gitBlobSha:"61278635c130708fda7e42c958576db5a98040e5",
   reviewedAt:"2026-11-12",
   stage:"adult_male_black_female_brown_breast_streaks",
   evidence:"data/natur/fauna/illustration-quality-svarttrost-20261112.json"
  }),
  emne_fauna_skjaere:Object.freeze({
   scientificName:"Pica pica",
   src:"bilder/natur/fauna/godkjent/03_skjaere_v1.webp",
   gitBlobSha:"e3da752bce1c4f637b80198559b805c98c1d82c7",
   reviewedAt:"2026-11-12",
   stage:"adult_perched_and_flying_green_tail",
   evidence:"data/natur/fauna/illustration-quality-skjaere-20261112.json"
  }),
  emne_fauna_kraake:Object.freeze({
   scientificName:"Corvus cornix",
   src:"bilder/natur/fauna/godkjent/02_kraake_v1.webp",
   gitBlobSha:"efbf5b4d09143192cb5c7405e07f04eadd15f1a1",
   reviewedAt:"2026-11-12",
   stage:"adult_hooded_crow_perched_and_in_flight",
   evidence:"data/natur/fauna/illustration-quality-kraake-20261112.json"
  }),
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
