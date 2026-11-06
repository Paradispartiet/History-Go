/* Individually botanically verified AND visually approved Finn Flora images.
 * This registry is the sole publication gate. Review candidates, old SVG
 * templates and local review state cannot activate an artskort illustration.
 */
(function () {
  "use strict";
  const images = Object.freeze({
    emne_flora_skvallerkaal: Object.freeze({
      scientificName: "Aegopodium podagraria",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/64_skvallerkaal_v1.webp",
      gitBlobSha: "27b6c73f26c53ed7c3840565605416b01480fad6",
      reviewedAt: "2026-11-06",
      stage: "sommerblomstring_med_jordstengler",
      evidence: "data/natur/flora/illustration-quality-skvallerkaal-20261106.json"
    }),
    emne_flora_hagelupin: Object.freeze({
      scientificName: "Lupinus polyphyllus",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/63_hagelupin_v1.webp",
      gitBlobSha: "389ac8dc3a6e2a948695de1586f92ccee85c6ee4",
      reviewedAt: "2026-11-06",
      stage: "sommerblomstring_og_skolm",
      evidence: "data/natur/flora/illustration-quality-hagelupin-20261106.json"
    }),
    emne_flora_rynkerose: Object.freeze({
      scientificName: "Rosa rugosa",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/62_rynkerose_v1.webp",
      gitBlobSha: "b66382b7a76f60773eef79ad46b3ecb425c41b9b",
      reviewedAt: "2026-11-06",
      stage: "sommerblomstring_og_nyper",
      evidence: "data/natur/flora/illustration-quality-rynkerose-20261106.json"
    }),
    emne_flora_svalerot: Object.freeze({
      scientificName: "Vincetoxicum hirundinaria",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/61_svalerot_v1.webp",
      gitBlobSha: "f60778d725256fd3bb8d91f293f605d1a0781e72",
      reviewedAt: "2026-11-05",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-svalerot-20261105.json"
    }),
    emne_flora_rosslyng: Object.freeze({
      scientificName: "Calluna vulgaris",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/60_rosslyng_v1.webp",
      gitBlobSha: "ba6314781c3b81b6d775c05f1bffe109d0ab457b",
      reviewedAt: "2026-11-05",
      stage: "sensommerblomstring",
      evidence: "data/natur/flora/illustration-quality-rosslyng-20261105.json"
    }),
    emne_flora_rodtvetann: Object.freeze({
      scientificName: "Lamium purpureum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/59_rodtvetann_v1.webp",
      gitBlobSha: "9b28b062f2da609ef83eccbf59662401eb09eeec",
      reviewedAt: "2026-11-05",
      stage: "varblomstring",
      evidence: "data/natur/flora/illustration-quality-rodtvetann-20261105.json"
    }),
    emne_flora_rodknapp: Object.freeze({
      scientificName: "Knautia arvensis",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/58_rodknapp_v1.webp",
      gitBlobSha: "e7f9f81c22c7a5abaafb972d75622602625bb737",
      reviewedAt: "2026-11-05",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-rodknapp-20261105.json"
    }),
    emne_flora_balderbra: Object.freeze({
      scientificName: "Tripleurospermum inodorum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/57_balderbra_v1.webp",
      gitBlobSha: "ef76d51b2127e62c0df2a11ff65b70154c6c6001",
      reviewedAt: "2026-11-05",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-balderbra-20261105.json"
    }),
    emne_flora_akervindel: Object.freeze({
      scientificName: "Convolvulus arvensis",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/56_akervindel_v1.webp",
      gitBlobSha: "914150925a8e8f59cbbbbc31660317f2ac783360",
      reviewedAt: "2026-11-05",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-akervindel-20261105.json"
    }),
    emne_flora_akerveronika: Object.freeze({
      scientificName: "Veronica arvensis",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/55_akerveronika_v1.webp",
      gitBlobSha: "0f5502735919f07ba0e8eb863c004c2afb21553a",
      reviewedAt: "2026-11-04",
      stage: "var_og_forsommerblomstring",
      evidence: "data/natur/flora/illustration-quality-akerveronika-20261104.json"
    }),
    emne_flora_akerdylle: Object.freeze({
      scientificName: "Sonchus arvensis",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/54_akerdylle_v1.webp",
      gitBlobSha: "de93f9b14a7aa7a049f40b344e5284ddfbfd90f9",
      reviewedAt: "2026-11-04",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-akerdylle-20261104.json"
    }),
    emne_flora_varpengeurt: Object.freeze({
      scientificName: "Noccaea caerulescens",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/53_varpengeurt_v1.webp",
      gitBlobSha: "949882e56dd3786be44bfe0323bf60dba15ea348",
      reviewedAt: "2026-11-04",
      stage: "varblomstring",
      evidence: "data/natur/flora/illustration-quality-varpengeurt-20261104.json"
    }),
    emne_flora_varmure: Object.freeze({
      scientificName: "Potentilla verna",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/52_varmure_v1.webp",
      gitBlobSha: "b5c91c9233a2aea1eb42466eccd9d85e00bd4e3c",
      reviewedAt: "2026-11-04",
      stage: "var_og_forsommerblomstring",
      evidence: "data/natur/flora/illustration-quality-varmure-20261104.json"
    }),
    emne_flora_varkaal: Object.freeze({
      scientificName: "Ficaria verna",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/51_varkaal_v1.webp",
      gitBlobSha: "0e1778c94ab078fdf8408e93048338a2a0580c22",
      reviewedAt: "2026-11-04",
      stage: "var_og_forsommerblomstring",
      evidence: "data/natur/flora/illustration-quality-varkaal-20261104.json"
    }),
    emne_flora_varerteknapp: Object.freeze({
      scientificName: "Lathyrus vernus",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/50_varerteknapp_v1.webp",
      gitBlobSha: "4f5a386eb138d1ff6f6aacb8e8798a6ff73d3256",
      reviewedAt: "2026-11-04",
      stage: "var_og_forsommerblomstring",
      evidence: "data/natur/flora/illustration-quality-varerteknapp-20261104.json"
    }),
    emne_flora_vararve: Object.freeze({
      scientificName: "Draba verna",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/49_vararve_v1.webp",
      gitBlobSha: "6194f3d09af4bf90efa038ff7534a56b5a1d24ca",
      reviewedAt: "2026-11-04",
      stage: "var_og_forsommerblomstring",
      evidence: "data/natur/flora/illustration-quality-vararve-20261104.json"
    }),
    emne_flora_villkarse: Object.freeze({
      scientificName: "Cardamine hirsuta",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/48_villkarse_v1.webp",
      gitBlobSha: "fc13c33ad601be3209de7a9724f5ab3192b344cf",
      reviewedAt: "2026-11-04",
      stage: "var_og_forsommerblomstring",
      evidence: "data/natur/flora/illustration-quality-villkarse-20261104.json"
    }),
    emne_flora_veihaukeskjegg: Object.freeze({
      scientificName: "Crepis tectorum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/47_veihaukeskjegg_v1.webp",
      gitBlobSha: "4c005ceb93577864ab2d70b087518d73d3ef7e59",
      reviewedAt: "2026-11-04",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-veihaukeskjegg-20261103.json"
    }),
    emne_flora_vassarve: Object.freeze({
      scientificName: "Stellaria media",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/46_vassarve_v1.webp",
      gitBlobSha: "54069d8d04a4c9a27e03f1f6733785ac1b7efee6",
      reviewedAt: "2026-11-03",
      stage: "var_og_forsommerblomstring",
      evidence: "data/natur/flora/illustration-quality-vassarve-20261103.json"
    }),
    emne_flora_tyskhonsetarm: Object.freeze({
      scientificName: "Stellaria pallida",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/45_tysk_honsetarm_v1.webp",
      gitBlobSha: "293651ec74359a58d1cf1c23a4b3c53fa7133b92",
      reviewedAt: "2026-11-03",
      stage: "var_og_forsommerblomstring",
      evidence: "data/natur/flora/illustration-quality-tyskhonsetarm-20261103.json"
    }),
    emne_flora_tveskjeggveronika: Object.freeze({
      scientificName: "Veronica chamaedrys",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/44_tveskjeggveronika_v1.webp",
      gitBlobSha: "f722f50caf8ebd23a0bb51b20d98a3bc00ae6367",
      reviewedAt: "2026-11-03",
      stage: "var_og_forsommerblomstring",
      evidence: "data/natur/flora/illustration-quality-tveskjeggveronika-20261103.json"
    }),

    emne_flora_timian: Object.freeze({
      scientificName: "Thymus serpyllum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/43_timian_v1.webp",
      gitBlobSha: "8afe4243f368358688ff53ef77261a1f63bc0a1e",
      reviewedAt: "2026-11-03",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-timian-20261103.json"
    }),

    emne_flora_taklok: Object.freeze({
      scientificName: "Sempervivum spp.",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/42_taklok_v1.webp",
      gitBlobSha: "7f113e39c77246b0108639ea0b0826289be752be",
      reviewedAt: "2026-11-03",
      stage: "blomstring_og_rosetter",
      evidence: "data/natur/flora/illustration-quality-taklok-20261103.json"
    }),

    emne_flora_strandvindel: Object.freeze({
      scientificName: "Calystegia sepium",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/41_strandvindel_v1.webp",
      gitBlobSha: "060b5c4b85715031bb3be1311874ac84217b480f",
      reviewedAt: "2026-11-03",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-strandvindel-20261103.json"
    }),
    emne_flora_stemorsblomst_forvillet: Object.freeze({
      scientificName: "Viola tricolor m.fl.",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/40_stemorsblomst_v1.webp",
      gitBlobSha: "4400ff7a9d88ad738b8634e937284e128240fd03",
      reviewedAt: "2026-11-03",
      stage: "blomstring_og_knopper",
      evidence: "data/natur/flora/illustration-quality-stemorsblomst-20261103.json"
    }),
    emne_flora_snoklokke: Object.freeze({
      scientificName: "Galanthus nivalis",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/39_snoklokke_v1.webp",
      gitBlobSha: "dda093727954c14ffa0a66c68619293ae0e74ab8",
      reviewedAt: "2026-11-03",
      stage: "sen_vinter_tidlig_vårblomstring",
      evidence: "data/natur/flora/illustration-quality-snoklokke-20261103.json"
    }),
    emne_flora_smaengkall: Object.freeze({
      scientificName: "Rhinanthus minor",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/38_smaengkall_v1.webp",
      gitBlobSha: "6d1e5faea142ec030d3eb0daeb9605a22bd626c2",
      reviewedAt: "2026-11-03",
      stage: "sommerblomstring_og_modne_frokapsler",
      evidence: "data/natur/flora/illustration-quality-smaengkall-20261103.json"
    }),
    emne_flora_smor_bukk: Object.freeze({
      scientificName: "Hylotelephium maximum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/37_smorbukk_v1.webp",
      gitBlobSha: "28dc7efcb0b3083acda652756346a4d5a28778cc",
      reviewedAt: "2026-11-03",
      stage: "sensommerblomstring",
      evidence: "data/natur/flora/illustration-quality-smorbukk-20261103.json"
    }),
    emne_flora_smalkjempe: Object.freeze({
      scientificName: "Plantago lanceolata",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/36_smalkjempe_v1.webp",
      gitBlobSha: "2dfbf434b6a84354fc014dac0934c443ebfe9177",
      reviewedAt: "2026-11-03",
      stage: "sommerblomstring_og_fruktsetting",
      evidence: "data/natur/flora/illustration-quality-smalkjempe-20261103.json"
    }),
    emne_flora_skogstorkenebb: Object.freeze({
      scientificName: "Geranium sylvaticum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/35_skogstorkenebb_v1.webp",
      gitBlobSha: "f260e6747c79fff07b0b777e9419049dd373fd76",
      reviewedAt: "2026-11-03",
      stage: "sommerblomstring_og_fruktsetting",
      evidence: "data/natur/flora/illustration-quality-skogstorkenebb-20261103.json"
    }),
    emne_flora_skogfiol: Object.freeze({
      scientificName: "Viola riviniana",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/34_skogfiol_v1.webp",
      gitBlobSha: "a28a6281ec9ecf7aac3ad38efb86fb8e98dc3f5c",
      reviewedAt: "2026-11-03",
      stage: "vårblomstring",
      evidence: "data/natur/flora/illustration-quality-skogfiol-20261103.json"
    }),
    emne_flora_sandarve: Object.freeze({
      scientificName: "Arenaria serpyllifolia",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/33_sandarve_v1.webp",
      gitBlobSha: "098a4c460c4b289e79b651e5da7de582e75b7728",
      reviewedAt: "2026-11-02",
      stage: "blomstring_og_frostander",
      evidence: "data/natur/flora/illustration-quality-sandarve-20261102.json"
    }),
    emne_flora_russblaastjerne: Object.freeze({
      scientificName: "Scilla siberica",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/32_russblastjerne_v1.webp",
      gitBlobSha: "a89e49d8f90fa26f7e5c8ed5b2d63ae0ca3b5f4c",
      reviewedAt: "2026-11-02",
      stage: "vårblomstring",
      evidence: "data/natur/flora/illustration-quality-russblastjerne-20261102.json"
    }),
    emne_flora_reinfann: Object.freeze({
      scientificName: "Tanacetum vulgare",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/31_reinfann_v1.webp",
      gitBlobSha: "5efb130ebf1da42f34b09e7aa30174647e76022b",
      reviewedAt: "2026-11-02",
      stage: "sensommerblomstring",
      evidence: "data/natur/flora/illustration-quality-reinfann-20261102.json"
    }),
    emne_flora_prikktvetann: Object.freeze({
      scientificName: "Lamium maculatum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/30_prikktvetann_v1.webp",
      gitBlobSha: "6fd16ab8d8473c97b12eaa5f06e0d40d2be08c46",
      reviewedAt: "2026-11-02",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-prikktvetann-20261102.json"
    }),
    emne_flora_prikkperikum: Object.freeze({
      scientificName: "Hypericum perforatum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/29_prikkperikum_v1.webp",
      gitBlobSha: "efb9ee18fb2da3f799064cfdfe6429be46ac0a76",
      reviewedAt: "2026-11-02",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-prikkperikum-20261102.json"
    }),
    emne_flora_perleblomst: Object.freeze({
      scientificName: "Muscari spp.",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/28_perleblomst_v1.webp",
      gitBlobSha: "1bc873a3e3a30d552e2e77d25f21319c5a1ce93b",
      reviewedAt: "2026-11-02",
      stage: "vårblomstring",
      taxonomicScope: "genus-representative",
      evidence: "data/natur/flora/illustration-quality-perleblomst-20261102.json"
    }),
    emne_flora_penstorkenebb: Object.freeze({
      scientificName: "Geranium robertianum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/27_stankstorkenebb_v1.webp",
      gitBlobSha: "a057aae517028ebb753b97f76eb11a44bb83ed50",
      reviewedAt: "2026-11-02",
      stage: "blomstring og fruktsetting",
      evidence: "data/natur/flora/illustration-quality-stankstorkenebb-20261102.json"
    }),
    emne_flora_ormehode: Object.freeze({
      scientificName: "Echium vulgare",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/26_ormehode_v1.webp",
      gitBlobSha: "7f83fcce4e1ba246dea7c73a1d31bc2589b8bc08",
      reviewedAt: "2026-11-02",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-ormehode-20261102.json"
    }),
    emne_flora_meldestokk: Object.freeze({
      scientificName: "Chenopodium album",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/25_meldestokk_v1.webp",
      gitBlobSha: "bbbb6dd2f5149629016ddb138f8fdc6806a00875",
      reviewedAt: "2026-11-02",
      stage: "blomstring og frøsetting",
      evidence: "data/natur/flora/illustration-quality-meldestokk-20261102.json"
    }),
    emne_flora_markjordbaer: Object.freeze({
      scientificName: "Fragaria vesca",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/24_markjordbaer_v1.webp",
      gitBlobSha: "c08bbd0f1b98b6c10c6755e0915e4844e43caae8",
      reviewedAt: "2026-11-02",
      stage: "blomstring og fruktsetting",
      evidence: "data/natur/flora/illustration-quality-markjordbaer-20261102.json"
    }),
    emne_flora_lungeurt: Object.freeze({
      scientificName: "Pulmonaria spp.",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/23_lungeurt_v1.webp",
      gitBlobSha: "747b129ec71ed52ff69f51bdac8843f741c093a0",
      reviewedAt: "2026-11-02",
      stage: "vårblomstring",
      taxonomicScope: "genus-representative",
      evidence: "data/natur/flora/illustration-quality-lungeurt-20261102.json"
    }),
    emne_flora_kusymre_marianokleblom: Object.freeze({
      scientificName: "Primula vulgaris",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/21_kusymre_v1.webp",
      gitBlobSha: "10a493cfb508782d0660afcf33596ff9aaf77889",
      reviewedAt: "2026-11-02",
      stage: "vårblomstring",
      evidence: "data/natur/flora/illustration-quality-kusymre-20261102.json"
    }),
    emne_flora_marianokleblom: Object.freeze({
      scientificName: "Primula veris",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/22_marianokleblom_v1.webp",
      gitBlobSha: "337836c6e473e66c1e1e00e6163047f5ff8ff0c7",
      reviewedAt: "2026-11-02",
      stage: "vårblomstring",
      evidence: "data/natur/flora/illustration-quality-marianokleblom-20261102.json"
    }),

    emne_flora_krypveronika: Object.freeze({
      scientificName: "Veronica filiformis",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/20_krypveronika_v1.webp",
      gitBlobSha: "85110ad6d12e4ef371726d4f9ff999f4abfe814e",
      reviewedAt: "2026-11-02",
      stage: "vårblomstring",
      evidence: "data/natur/flora/illustration-quality-krypveronika-20261102.json"
    }),
    emne_flora_krypsoleie: Object.freeze({
      scientificName: "Ranunculus repens",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/19_krypsoleie_v1.webp",
      gitBlobSha: "3eb62d0fe328cd08854bd6529c03f8955c82af29",
      reviewedAt: "2026-11-02",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-krypsoleie-20261102.json"
    }),
    emne_flora_kattefot: Object.freeze({
      scientificName: "Antennaria dioica",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/18_kattefot_v1.webp",
      gitBlobSha: "e28389f70fcfc55beacf7a22d4b64bbaed2a9178",
      reviewedAt: "2026-11-02",
      stage: "hunnplante i blomstring",
      evidence: "data/natur/flora/illustration-quality-kattefot-20261102.json"
    }),
    emne_flora_jordreve: Object.freeze({
      scientificName: "Glechoma hederacea",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/17_jordreve_v1.webp",
      gitBlobSha: "c63341e153213897a685ce9c8693841ceee771f8",
      reviewedAt: "2026-11-02",
      stage: "vårblomstring",
      evidence: "data/natur/flora/illustration-quality-jordreve-20261102.json"
    }),
    emne_flora_hvitmaure: Object.freeze({
      scientificName: "Galium boreale",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/16_hvitmaure_v1.webp",
      gitBlobSha: "9fa573ed27d6d8a61fe4ab5ac49f41d04926f7c8",
      reviewedAt: "2026-11-02",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-hvitmaure-20261102.json"
    }),
    emne_flora_hvittvetann: Object.freeze({
      scientificName: "Lamium album",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/15_hvittvetann_v1.webp",
      gitBlobSha: "44a541b7931cf837fc14a0c2b1d599f1bfef3d4e",
      reviewedAt: "2026-11-02",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-hvittvetann-20261102.json"
    }),
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
    emne_flora_engknoppurt: Object.freeze({
      scientificName: "Centaurea jacea",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/02_engknoppurt_v2.webp",
      gitBlobSha: "c26069fcd15e182ccebca3ed52e9e88458005fc7",
      reviewedAt: "2026-11-01",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-engknoppurt-20261101.json"
    }),
    emne_flora_gjetertaske: Object.freeze({
      scientificName: "Capsella bursa-pastoris",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/07_gjetertaske_v1.webp",
      gitBlobSha: "6cdbe644470909f7b8ade074534413a84b444fcb",
      reviewedAt: "2026-11-01",
      stage: "blomstring og frøsetting",
      evidence: "data/natur/flora/illustration-quality-gjetertaske-20261101.json"
    }),
    emne_flora_hvitbergknapp: Object.freeze({
      scientificName: "Sedum album",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/14_hvitbergknapp_v1.webp",
      gitBlobSha: "eaab16110ecafcd5ebddde8e72b6cd67e95ae30d",
      reviewedAt: "2026-11-02",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-hvitbergknapp-20261102.json"
    }),
    emne_flora_humleblom: Object.freeze({
      scientificName: "Geum urbanum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/13_humleblom_v1.webp",
      gitBlobSha: "50fe2553702e114d6ed56902bbaaafaee0c7c005",
      reviewedAt: "2026-11-01",
      stage: "blomstring og frøsetting",
      evidence: "data/natur/flora/illustration-quality-humleblom-20261101.json"
    }),
    emne_flora_haredylle: Object.freeze({
      scientificName: "Crepis capillaris",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/12_haredylle_v1.webp",
      gitBlobSha: "3f81267f338ce635c8de0296fa61f9647d72bcc2",
      reviewedAt: "2026-11-01",
      stage: "blomstring og frøsetting",
      evidence: "data/natur/flora/illustration-quality-haredylle-20261101.json"
    }),
    emne_flora_gulmaure: Object.freeze({
      scientificName: "Galium verum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/11_gulmaure_v1.webp",
      gitBlobSha: "6f1d1d29598a30cc04cff7ccc85c0fc9dfa8756c",
      reviewedAt: "2026-11-01",
      stage: "sommerblomstring",
      evidence: "data/natur/flora/illustration-quality-gulmaure-20261101.json"
    }),
    emne_flora_gullstjerne: Object.freeze({
      scientificName: "Gagea lutea",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/10_gullstjerne_v1.webp",
      gitBlobSha: "1ca9b46b49dd48977b8b463e667412018bf96c0e",
      reviewedAt: "2026-11-01",
      stage: "vårblomstring",
      evidence: "data/natur/flora/illustration-quality-gullstjerne-20261101.json"
    }),
    emne_flora_gullsoleie: Object.freeze({
      scientificName: "Ranunculus auricomus agg.",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/09_nyresoleier_v1.webp",
      gitBlobSha: "0384f753c644e46dbb868ab796f84b1c8e8d2238",
      reviewedAt: "2026-11-01",
      stage: "blomstring",
      taxonomicScope: "species-complex-representative",
      evidence: "data/natur/flora/illustration-quality-nyresoleier-20261101.json"
    }),
    emne_flora_gulaks: Object.freeze({
      scientificName: "Anthoxanthum odoratum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/08_gulaks_v1.webp",
      gitBlobSha: "5e79619f6cca4e531f9daa56b7e0d5f7de6b2bc5",
      reviewedAt: "2026-11-01",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-gulaks-20261101.json"
    }),
    emne_flora_forglemmegei: Object.freeze({
      scientificName: "Myosotis spp.",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/06_forglemmegei_v1.webp",
      gitBlobSha: "de59258e141b0b922424d31a167a16b16335fae6",
      reviewedAt: "2026-11-01",
      stage: "blomstring",
      taxonomicScope: "genus-representative",
      evidence: "data/natur/flora/illustration-quality-forglemmegei-20261101.json"
    }),
    emne_flora_firkantperikum: Object.freeze({
      scientificName: "Hypericum maculatum",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/05_firkantperikum_v1.webp",
      gitBlobSha: "ea1d0ad4f916927f3b4da59a1817353fc8b4686e",
      reviewedAt: "2026-11-01",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-firkantperikum-20261101.json"
    }),
    emne_flora_engtjaereblom: Object.freeze({
      scientificName: "Viscaria vulgaris",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/04_engtjaereblom_v1.webp",
      gitBlobSha: "2e25e6c9a06c6ae9817b1afd2c081a4f5e01096c",
      reviewedAt: "2026-11-01",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-engtjaereblom-20261101.json"
    }),
    emne_flora_engsmelle: Object.freeze({
      scientificName: "Silene vulgaris",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/03_engsmelle_v1.webp",
      gitBlobSha: "1afbc358c9fee5ab1c7cccff5e08dadfc05b9902",
      reviewedAt: "2026-11-01",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-engsmelle-20261101.json"
    }),
    emne_flora_enghumleblom: Object.freeze({
      scientificName: "Geum rivale",
      src: "bilder/natur/flora/illustrasjonskandidater/b09/01_enghumleblom_v2.webp",
      gitBlobSha: "1ce0c45d3af070907db440977ccb6de0889aefe2",
      reviewedAt: "2026-11-01",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-enghumleblom-20261101.json"
    }),
    emne_flora_burot: Object.freeze({
      scientificName: "Artemisia vulgaris",
      src: "bilder/natur/flora/illustrasjonskandidater/b08/07_burot_v1.webp",
      gitBlobSha: "dbb1eb58fcbf93c4e81c41dee607192f69d5f50a",
      reviewedAt: "2026-10-31",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-burot-20261031.json"
    }),
    emne_flora_blaknapp: Object.freeze({
      scientificName: "Succisa pratensis",
      src: "bilder/natur/flora/illustrasjonskandidater/b08/06_blaknapp_v1.webp",
      gitBlobSha: "2bbdcb67f0730a62db8bd81408a6033cdb19e305",
      reviewedAt: "2026-10-31",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-blaknapp-20261031.json"
    }),
    emne_flora_blodstorkenebb: Object.freeze({
      scientificName: "Geranium sanguineum",
      src: "bilder/natur/flora/illustrasjonskandidater/b08/05_blodstorkenebb_v1.webp",
      gitBlobSha: "cceb3134562f3eabc3f5700091777ecf59f78558",
      reviewedAt: "2026-10-31",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-blodstorkenebb-20261031.json"
    }),
    emne_flora_bitterbergknapp: Object.freeze({
      scientificName: "Sedum acre",
      src: "bilder/natur/flora/illustrasjonskandidater/b08/04_bitterbergknapp_v1.webp",
      gitBlobSha: "8d71e52d3ce87394903e1726a0915c75e5bc9d13",
      reviewedAt: "2026-10-31",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-bitterbergknapp-20261031.json"
    }),
    emne_flora_bergmynte: Object.freeze({
      scientificName: "Origanum vulgare",
      src: "bilder/natur/flora/illustrasjonskandidater/b08/03_bergmynte_v1.webp",
      gitBlobSha: "735048d4298361f0fd02bd5104dda28080381a58",
      reviewedAt: "2026-10-31",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-bergmynte-20261031.json"
    }),
    emne_flora_bekkeblom: Object.freeze({
      scientificName: "Caltha palustris",
      src: "bilder/natur/flora/illustrasjonskandidater/b08/02_bekkeblom_v1.webp",
      gitBlobSha: "3607fad83fde319a8c6e3478f14c425c5b72798f",
      reviewedAt: "2026-10-31",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-bekkeblom-20261031.json"
    }),
    emne_flora_rodkløver: Object.freeze({
      scientificName: "Trifolium pratense",
      src: "bilder/natur/flora/illustrasjonskandidater/b08/01_rodklover_v4.webp",
      gitBlobSha: "4aa2d6b97fd263caee0340286f2b876daa129c25",
      reviewedAt: "2026-10-30",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-batch08-20261030.json"
    }),
    emne_flora_tiriltunge: Object.freeze({
      scientificName: "Lotus corniculatus",
      src: "bilder/natur/flora/illustrasjonskandidater/b07/02_tiriltunge_v2.webp",
      gitBlobSha: "7000ad3263a04817f297896e8206c2b959de94fa",
      reviewedAt: "2026-10-30",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-batch07-20261028.json"
    }),
    emne_flora_hvitklover: Object.freeze({
      scientificName: "Trifolium repens",
      src: "bilder/natur/flora/illustrasjonskandidater/b07/03_hvitklover.webp",
      gitBlobSha: "66aefcd7d3ea4ba4bfc5b272cfe8f6914a748a51",
      reviewedAt: "2026-10-30",
      stage: "blomstring",
      evidence: "data/natur/flora/illustration-quality-batch07-20261028.json"
    }),
    emne_flora_blaklokke: Object.freeze({
      scientificName: "Campanula rotundifolia",
      src: "bilder/natur/flora/illustrasjonskandidater/b07/04_blaklokke.webp",
      gitBlobSha: "cf2580139a5359b7c2687cfd3a100a911756704b",
      reviewedAt: "2026-10-30",
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
  // One scientific species appears twice in the public catalog; reuse the same approved artwork.
  const aliases = Object.freeze({ emne_flora_knoppurt: "emne_flora_engknoppurt", emne_flora_tysk_honsetarm: "emne_flora_tyskhonsetarm" });
  const get = id => images[aliases[String(id)] || String(id)] || null;
  window.HG_NATURE_FLORA_APPROVED = Object.freeze({get,has:id=>Boolean(get(id)),count:Object.keys(images).length});
})();
