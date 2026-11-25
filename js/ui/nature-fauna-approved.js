/* Finn Fauna: strictly individually approved WebP originals. Existing SVG schematics remain the fallback for other fauna. */
(function () {
 "use strict";
 const images=Object.freeze({
  emne_fauna_hvitryggspett:Object.freeze({
   scientificName:"Dendrocopos leucotos",
   src:"bilder/natur/fauna/godkjent/42_hvitryggspett_v1.webp",
   gitBlobSha:"995aee26570d954ba33bfb34d6252b06234edbf1",
   reviewedAt:"2026-11-25",
   stage:"adult_male_red_crown_white_lower_back_barred_wings_streaked_underparts_pink_vent_birch_trunk",
   evidence:"data/natur/fauna/illustration-quality-hvitryggspett-20261125.json"
  }),
  emne_fauna_jernspurv:Object.freeze({
   scientificName:"Prunella modularis",
   src:"bilder/natur/fauna/godkjent/41_jernspurv_v1.webp",
   gitBlobSha:"09aec68b4055d7c4aa6a60d97a6a1f9ae09c2d58",
   reviewedAt:"2026-11-25",
   stage:"adult_grey_head_neck_breast_brown_streaked_back_thin_dark_bill_pink_legs_lichen_branch",
   evidence:"data/natur/fauna/illustration-quality-jernspurv-20261125.json"
  }),
  emne_fauna_rodvingetrost:Object.freeze({
   scientificName:"Turdus iliacus",
   src:"bilder/natur/fauna/godkjent/40_rodvingetrost_v1.webp",
   gitBlobSha:"1f83145ebdb08968d523c58e3b39c3e43a4d9e70",
   reviewedAt:"2026-11-25",
   stage:"adult_brown_upperparts_cream_supercilium_streaked_breast_rust_red_flanks_lichen_twig",
   evidence:"data/natur/fauna/illustration-quality-rodvingetrost-20261125.json"
  }),
  emne_fauna_gulsanger:Object.freeze({
   scientificName:"Hippolais icterina",
   src:"bilder/natur/fauna/godkjent/39_gulsanger_v1.webp",
   gitBlobSha:"e78100653356fdcfd3f6a5dbcef5ac094ec0b31c",
   reviewedAt:"2026-11-25",
   stage:"adult_olive_green_back_lemon_yellow_underparts_pale_supercilium_pale_wing_panel_grey_legs_on_leafy_lichen_branch",
   evidence:"data/natur/fauna/illustration-quality-gulsanger-20261125.json"
  }),
  emne_fauna_svarthvit_fluesnapper:Object.freeze({
   scientificName:"Ficedula hypoleuca",
   src:"bilder/natur/fauna/godkjent/38_svarthvit_fluesnapper_v1.webp",
   gitBlobSha:"90b25e78ef79b3e9e7f8a04624fb4122c2ede371",
   reviewedAt:"2026-11-25",
   stage:"adult_male_black_white_breeding_small_white_forehead_spot_large_white_wing_patch_lichen_branch",
   evidence:"data/natur/fauna/illustration-quality-svarthvit-fluesnapper-20261125.json"
  }),
  emne_fauna_lovsanger:Object.freeze({
   scientificName:"Phylloscopus trochilus",
   src:"bilder/natur/fauna/godkjent/37_lovsanger_v1.webp",
   gitBlobSha:"a8cfb708899e9cb77476c378a6395c38d0c1c0ed",
   reviewedAt:"2026-11-25",
   stage:"adult_olive_brown_cream_yellow_supercilium_long_wings_pale_legs_lichen_branch",
   evidence:"data/natur/fauna/illustration-quality-lovsanger-20261125.json"
  }),
  emne_fauna_sjoorre:Object.freeze({
   scientificName:"Melanitta fusca",
   src:"bilder/natur/fauna/godkjent/36_sjoorre_v1.webp",
   gitBlobSha:"e88b63fdaf4d9635982597568cd424f314fe607d",
   reviewedAt:"2026-11-25",
   stage:"adult_male_velvet_black_plumage_pale_eye_white_crescent_yellow_orange_black_bill_white_speculum_floating",
   evidence:"data/natur/fauna/illustration-quality-sjoorre-20261125.json"
  }),
  emne_fauna_kvinand:Object.freeze({
   scientificName:"Bucephala clangula",
   src:"bilder/natur/fauna/godkjent/35_kvinand_v1.webp",
   gitBlobSha:"d043e1ee98cdfd91dd686b89be0dd5ca8037f6f1",
   reviewedAt:"2026-11-24",
   stage:"adult_male_iridescent_green_black_head_yellow_eye_white_cheek_spot_black_white_wings_floating",
   evidence:"data/natur/fauna/illustration-quality-kvinand-20261124.json"
  }),
  emne_fauna_tjeld:Object.freeze({
   scientificName:"Haematopus ostralegus",
   src:"bilder/natur/fauna/godkjent/34_tjeld_v1.webp",
   gitBlobSha:"c5bc1284a129192d52ed8e756834bac3dbbba9b6",
   reviewedAt:"2026-11-21",
   stage:"adult_black_white_eurasian_oystercatcher_orange_red_bill_eye_ring_pink_red_legs_pebbly_shore",
   evidence:"data/natur/fauna/illustration-quality-tjeld-20261121.json"
  }),
  emne_fauna_hvitkinngaas:Object.freeze({
   scientificName:"Branta leucopsis",
   src:"bilder/natur/fauna/godkjent/33_hvitkinngaas_v1.webp",
   gitBlobSha:"700c304c91f3cf64a109d5ae37081913746b6542",
   reviewedAt:"2026-11-21",
   stage:"adult_cream_white_face_black_head_neck_breast_grey_barred_wings_pale_underparts_black_bill_legs",
   evidence:"data/natur/fauna/illustration-quality-hvitkinngaas-20261121.json"
  }),
  emne_fauna_taarnseiler:Object.freeze({
   scientificName:"Apus apus",
   src:"bilder/natur/fauna/godkjent/32_taarnseiler_v1.webp",
   gitBlobSha:"49822981f3584d594d6ae43fcd475563f2f1f4bd",
   reviewedAt:"2026-11-21",
   stage:"adult_sooty_brown_in_flight_scythe_shaped_wings_small_pale_throat_short_forked_tail",
   evidence:"data/natur/fauna/illustration-quality-taarnseiler-20261121.json"
  }),
  emne_fauna_bokfink:Object.freeze({
   scientificName:"Fringilla coelebs",
   src:"bilder/natur/fauna/godkjent/31_bokfink_v1.webp",
   gitBlobSha:"f48fafe915612bc0b520af1388e62230901d3060",
   reviewedAt:"2026-11-21",
   stage:"adult_male_blue_grey_crown_rose_orange_breast_white_wing_bars_olive_rump_lichen_perch",
   evidence:"data/natur/fauna/illustration-quality-bokfink-20261121.json"
  }),
  emne_fauna_staer:Object.freeze({
   scientificName:"Sturnus vulgaris",
   src:"bilder/natur/fauna/godkjent/30_staer_v1.webp",
   gitBlobSha:"6e90951b0ee9b22674b0e9556013f09fbc87c2fd",
   reviewedAt:"2026-11-16",
   stage:"adult_transition_iridescent_purple_green_plumage_white_speckled_feather_tips_yellow_bill_pink_legs_on_lichen_branch",
   evidence:"data/natur/fauna/illustration-quality-staer-20261116.json"
  }),
  emne_fauna_kaie:Object.freeze({
   scientificName:"Coloeus monedula",
   src:"bilder/natur/fauna/godkjent/29_kaie_v1.webp",
   gitBlobSha:"20e8714069a9bbd29100b1aaa73e4f497ab0bdcd",
   reviewedAt:"2026-11-16",
   stage:"adult_black_cap_silvery_grey_nape_pale_ice_blue_eye_short_black_bill_dark_iridescent_wings_on_lichen_branch",
   evidence:"data/natur/fauna/illustration-quality-kaie-20261116.json"
  }),
  emne_fauna_stillits:Object.freeze({
   scientificName:"Carduelis carduelis",
   src:"bilder/natur/fauna/godkjent/28_stillits_v1.webp",
   gitBlobSha:"c73db3e8a990927dbc03da3d9df884a9b77f50e9",
   reviewedAt:"2026-11-16",
   stage:"adult_red_face_mask_black_white_head_bright_yellow_wing_bar_cream_breast_black_white_tail_perched_on_thistle",
   evidence:"data/natur/fauna/illustration-quality-stillits-20261116.json"
  }),
  emne_fauna_pilfink:Object.freeze({
   scientificName:"Passer montanus",
   src:"bilder/natur/fauna/godkjent/27_pilfink_v1.webp",
   gitBlobSha:"6337492c57f28ef5d640336fc72db29f0dbe0bc9",
   reviewedAt:"2026-11-16",
   stage:"adult_chestnut_crown_white_cheeks_black_cheek_spots_small_black_bib_white_collar_brown_streaked_wings_perched",
   evidence:"data/natur/fauna/illustration-quality-pilfink-20261116.json"
  }),
  emne_fauna_notteskrike:Object.freeze({
   scientificName:"Garrulus glandarius",
   src:"bilder/natur/fauna/godkjent/26_notteskrike_v1.webp",
   gitBlobSha:"a0ae529e88ba334447fb5a4a3e0efceb4cc050fd",
   reviewedAt:"2026-11-16",
   stage:"adult_pink_brown_black_moustache_streaked_crown_bright_blue_black_barred_wing_dark_tail_oak_branch_acorns",
   evidence:"data/natur/fauna/illustration-quality-notteskrike-20261116.json"
  }),
  emne_fauna_maaltrost:Object.freeze({
   scientificName:"Turdus philomelos",
   src:"bilder/natur/fauna/godkjent/25_maaltrost_v1.webp",
   gitBlobSha:"428e21d71d9c16a0718f330775fec34c25040aba",
   reviewedAt:"2026-11-16",
   stage:"adult_warm_brown_upperparts_creamy_white_belly_dark_heart_arrowhead_breast_spots_brown_yellow_bill_pink_legs_perched_on_lichen_branch",
   evidence:"data/natur/fauna/illustration-quality-maaltrost-20261116.json"
  }),
  emne_fauna_spettmeis:Object.freeze({
   scientificName:"Sitta europaea",
   src:"bilder/natur/fauna/godkjent/24_spettmeis_v1.webp",
   gitBlobSha:"70244f32ad0ce67ac7f3e9a469e25aeadba62d3e",
   reviewedAt:"2026-11-16",
   stage:"adult_blue_grey_upperparts_black_eye_stripe_white_throat_buff_orange_flanks_short_tail_pointed_bill_headfirst_down_tree",
   evidence:"data/natur/fauna/illustration-quality-spettmeis-20261116.json"
  }),
  emne_fauna_linerle:Object.freeze({
   scientificName:"Motacilla alba",
   src:"bilder/natur/fauna/godkjent/23_linerle_v1.webp",
   gitBlobSha:"a8a23c43089d3624a0630397ca2bba28e120370f",
   reviewedAt:"2026-11-16",
   stage:"alba_summer_black_crown_and_bib_white_face_grey_mantle_wing_bars_long_white_edged_tail_stone_and_walking",
   evidence:"data/natur/fauna/illustration-quality-linerle-20261116.json"
  }),
  emne_fauna_graatrost:Object.freeze({
   scientificName:"Turdus pilaris",
   src:"bilder/natur/fauna/godkjent/22_graatrost_v1.webp",
   gitBlobSha:"c3d967ffa6afe2b384ff1433a7af7beec4829bdb",
   reviewedAt:"2026-11-16",
   stage:"adult_grey_head_chestnut_mantle_grey_rump_black_tail_yellow_black_tipped_bill_black_spotted_orange_buff_breast_lichen_branch",
   evidence:"data/natur/fauna/illustration-quality-graatrost-20261116.json"
  }),
  emne_fauna_rodstrupe:Object.freeze({
   scientificName:"Erithacus rubecula",
   src:"bilder/natur/fauna/godkjent/21_rodstrupe_v1.webp",
   gitBlobSha:"f867a24c8608f1a3d8b8ec50fb47d54375738f1b",
   reviewedAt:"2026-11-16",
   stage:"adult_orange_red_face_breast_grey_side_band_brown_back_pale_belly_dark_eye_fine_bill_perched_on_lichen_branch",
   evidence:"data/natur/fauna/illustration-quality-rodstrupe-20261116.json"
  }),
  emne_fauna_gronnfink:Object.freeze({
   scientificName:"Chloris chloris",
   src:"bilder/natur/fauna/godkjent/20_gronnfink_v1.webp",
   gitBlobSha:"4e6ee9392ca010aad7a06e23a0191fc5f89432cc",
   reviewedAt:"2026-11-16",
   stage:"adult_male_olive_yellow_green_female_muted_brown_olive_both_stout_pale_bills_yellow_wing_and_tail_edges_perched",
   evidence:"data/natur/fauna/illustration-quality-gronnfink-20261116.json"
  }),
  emne_fauna_flaggspett:Object.freeze({
   scientificName:"Dendrocopos major",
   src:"bilder/natur/fauna/godkjent/19_flaggspett_v1.webp",
   gitBlobSha:"4c43cdf4db47f2c652d43128d030189b300d1604",
   reviewedAt:"2026-11-16",
   stage:"adult_male_red_nape_female_black_nape_both_large_white_shoulder_patches_crimson_undertail_clinging_to_trunk",
   evidence:"data/natur/fauna/illustration-quality-flaggspett-20261116.json"
  }),
  emne_fauna_graahegre:Object.freeze({
   scientificName:"Ardea cinerea",
   src:"bilder/natur/fauna/godkjent/18_graahegre_v1.webp",
   gitBlobSha:"0c0a153a98ad3a9ac830ca255ecb171020675faa",
   reviewedAt:"2026-11-16",
   stage:"adult_slate_grey_white_black_head_plumes_yellow_bill_grey_yellow_legs_standing_and_neck_retracted_in_flight",
   evidence:"data/natur/fauna/illustration-quality-graahegre-20261116.json"
  }),
  emne_fauna_sildemaake:Object.freeze({
   scientificName:"Larus fuscus",
   src:"bilder/natur/fauna/godkjent/17_sildemaake_v1.webp",
   gitBlobSha:"b89f8cc442174a9d0ea5be345c29c91c7e0ad68f",
   reviewedAt:"2026-11-16",
   stage:"adult_breeding_slate_dark_back_white_head_yellow_legs_yellow_bill_red_gonys_black_primary_mirrors_standing_and_flying",
   evidence:"data/natur/fauna/illustration-quality-sildemaake-20261116.json"
  }),
  emne_fauna_hettemaake:Object.freeze({
   scientificName:"Chroicocephalus ridibundus",
   src:"bilder/natur/fauna/godkjent/16_hettemaake_v1.webp",
   gitBlobSha:"111882da9a8bf94e18f8eb942901cdfa7c5faef0",
   reviewedAt:"2026-11-15",
   stage:"breeding_adult_chocolate_brown_hood_white_eye_crescents_red_bill_legs_pale_grey_wings_black_primary_tips_standing_and_in_flight",
   evidence:"data/natur/fauna/illustration-quality-hettemaake-20261115.json"
  }),
  emne_fauna_storskarv:Object.freeze({
   scientificName:"Phalacrocorax carbo",
   src:"bilder/natur/fauna/godkjent/15_storskarv_v1.webp",
   gitBlobSha:"9eff35583a3797062cb579e5e072de9736022ff4",
   reviewedAt:"2026-11-15",
   stage:"adult_breeding_dark_iridescent_wing_drying_hooked_bill_white_thigh_patches_webbed_feet",
   evidence:"data/natur/fauna/illustration-quality-storskarv-20261115.json"
  }),
  emne_fauna_sothone:Object.freeze({
   scientificName:"Fulica atra",
   src:"bilder/natur/fauna/godkjent/14_sothone_v1.webp",
   gitBlobSha:"b9bffe1eaed401a4e21fbe959f50464ac95bca57",
   reviewedAt:"2026-11-14",
   stage:"adult_black_head_slate_body_white_frontal_shield_bill_red_iris_lobed_toes",
   evidence:"data/natur/fauna/illustration-quality-sothone-20261114.json"
  }),
  emne_fauna_toppand:Object.freeze({
   scientificName:"Aythya fuligula",
   src:"bilder/natur/fauna/godkjent/13_toppand_v1.webp",
   gitBlobSha:"9069d83c932b0ae316f03b367b7f3ce95a1788b1",
   reviewedAt:"2026-11-14",
   stage:"adult_male_black_white_flanks_long_crest_female_brown_short_crest_yellow_eyes",
   evidence:"data/natur/fauna/illustration-quality-toppand-20261114.json"
  }),
  emne_fauna_graagas:Object.freeze({
   scientificName:"Anser anser",
   src:"bilder/natur/fauna/godkjent/12_graagaas_v1.webp",
   gitBlobSha:"63289e4f9134a0b0e959b52c59a543e85476f556",
   reviewedAt:"2026-11-14",
   stage:"adult_standing_and_in_flight_grey_brown_plumage_orange_bill_pink_legs",
   evidence:"data/natur/fauna/illustration-quality-graagaas-20261114.json"
  }),
  emne_fauna_knoppsvane:Object.freeze({
   scientificName:"Cygnus olor",
   src:"bilder/natur/fauna/godkjent/11_knoppsvane_v1.webp",
   gitBlobSha:"dc1692279b0c32f955dadd3a33a48faaf3615f9e",
   reviewedAt:"2026-11-13",
   stage:"adult_white_s_curved_neck_orange_bill_black_knob_and_grey_cygnet",
   evidence:"data/natur/fauna/illustration-quality-knoppsvane-20261113.json"
  }),
  emne_fauna_fiskemaake:Object.freeze({
   scientificName:"Larus canus",
   src:"bilder/natur/fauna/godkjent/10_fiskemaake_v1.webp",
   gitBlobSha:"6a0895456fbd3d990c291b1c14f108b1695d0494",
   reviewedAt:"2026-11-13",
   stage:"adult_perched_and_flying_yellow_green_legs_dark_eyes_no_red_bill_spot",
   evidence:"data/natur/fauna/illustration-quality-fiskemaake-20261113.json"
  }),
  emne_fauna_graamaake:Object.freeze({
   scientificName:"Larus argentatus",
   src:"bilder/natur/fauna/godkjent/09_graamaake_v1.webp",
   gitBlobSha:"775189e54b00b13a6859670401da027ebb766cc9",
   reviewedAt:"2026-11-13",
   stage:"adult_perched_and_flying_summer_pink_legs_red_gonys_spot",
   evidence:"data/natur/fauna/illustration-quality-graamaake-20261113.json"
  }),
  emne_fauna_stokkand:Object.freeze({
   scientificName:"Anas platyrhynchos",
   src:"bilder/natur/fauna/godkjent/08_stokkand_v1.webp",
   gitBlobSha:"b16e4e48f6264a0a318f2b20128bc8d2e559505c",
   reviewedAt:"2026-11-13",
   stage:"adult_breeding_male_and_female_woodland_pond_both_blue_specula",
   evidence:"data/natur/fauna/illustration-quality-stokkand-20261113.json"
  }),
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
