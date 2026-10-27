/* Thirty individually sourced photographs for Finn Flora.
 * Photo identity follows the Wikimedia Commons file description, not a generated
 * SVG template or an automatic species-name search. This is a photographic
 * reference pilot, not a completed botanical-identification audit.
 * Add only files after checking species, photographer, source page and license.
 */
(function () {
"use strict";
const licenses=Object.freeze({
 "BY-4.0":["CC BY 4.0","https://creativecommons.org/licenses/by/4.0/"],
 "BY-SA-2.0":["CC BY-SA 2.0","https://creativecommons.org/licenses/by-sa/2.0/"],
 "BY-SA-3.0":["CC BY-SA 3.0","https://creativecommons.org/licenses/by-sa/3.0/"],
 "BY-SA-4.0":["CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"],
 "BY-SA-2.5-CA":["CC BY-SA 2.5 Canada","https://creativecommons.org/licenses/by-sa/2.5/ca/"]
});
const FILES=Object.freeze({
 emne_flora_enghumleblom:["Geum rivale","Geum rivale flowers.jpg","Meneerke bloem","BY-SA-3.0"],
 emne_flora_engkarse:["Cardamine pratensis","Cardamine pratensis flower.jpg","El Grafo","BY-SA-3.0"],
 emne_flora_engknoppurt:["Centaurea jacea","Centaurea jacea.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_engsmelle:["Silene vulgaris","Silene vulgaris flower.jpg","MurielBendel","BY-SA-4.0"],
 emne_flora_engsoleie:["Ranunculus acris","RanunculusAcris.jpg","Christian Fischer","BY-SA-3.0"],
 emne_flora_engtjaereblom:["Viscaria vulgaris","Viscaria vulgaris sl66.jpg","Stefan.lefnaer","BY-SA-4.0"],
 emne_flora_prestekrage:["Leucanthemum vulgare","Leucanthemum vulgare.jpeg","The Cosmonaut","BY-SA-2.5-CA"],
 emne_flora_balderbra:["Tripleurospermum inodorum","Tripleurospermum inodorum.jpg","Thayne Tuason","BY-SA-4.0"],
 emne_flora_ballblom:["Trollius europaeus","Trollius europaeus.jpg","Steve Law","BY-SA-2.0"],
 emne_flora_bekkeblom:["Caltha palustris","Caltha palustris.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_bergmynte:["Origanum vulgare","Origanum vulgare.jpg","Raul654","BY-SA-3.0"],
 emne_flora_bitterbergknapp:["Sedum acre","Sedum acre.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_blaknapp:["Succisa pratensis","Succisa pratensis.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_blaveis:["Hepatica nobilis","Hepatica nobilis.JPG","Archenzo","BY-SA-3.0"],
 emne_flora_blodstorkenebb:["Geranium sanguineum","Geranium sanguineum.jpg","Bouba","BY-SA-3.0"],
 emne_flora_burot:["Artemisia vulgaris","Artemisia vulgaris.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_geitrams:["Chamerion angustifolium","Chamaenerion angustifolium.jpg","Nozhnici","BY-SA-4.0"],
 emne_flora_hestehov:["Tussilago farfara","Tussilago farfara.JPG","Archenzo","BY-SA-3.0"],
 emne_flora_hvitveis:["Anemone nemorosa","Anemone nemorosa-Anémone des bois-Fleur-20170322.jpg","Daniel VILLAFRUELA","BY-SA-4.0"],
 emne_flora_rodkløver:["Trifolium pratense","Trifolium pratense, known as red clover.jpg","Katee87","BY-SA-4.0"],
 emne_flora_tiriltunge:["Lotus corniculatus","Lotus corniculatus 05052026.jpg","Fornax","BY-SA-3.0"],
 emne_flora_hvitklover:["Trifolium repens","Trifolium repens flowers.jpg","MurielBendel","BY-SA-4.0"],
 emne_flora_hvittvetann:["Lamium album","Lamium album.jpg","Metju12","BY-SA-3.0"],
 emne_flora_rodjonsokblom:["Silene dioica","SileneDioica.jpg","Christian Fischer","BY-SA-3.0"],
 emne_flora_hvitbergknapp:["Sedum album","Sedum album 01.jpg","Bjoertvedt","BY-SA-3.0"],
 emne_flora_groblad:["Plantago major","Plantago major subsp. major.jpg","Krzysztof Ziarnek, Kenraiz","BY-SA-4.0"],
 emne_flora_ormehode:["Echium vulgare","Echium vulgare.jpg","Jose381","BY-SA-3.0"],
 emne_flora_skogstorkenebb:["Geranium sylvaticum","Geranium sylvaticum 02 Oslo.jpg","Bjoertvedt","BY-SA-3.0"],
 emne_flora_gullstjerne:["Gagea lutea","Gagea lutea sl2.jpg","Stefan.lefnaer","BY-SA-4.0"],
 emne_flora_markjordbaer:["Fragaria vesca","Fragaria vesca RF.jpg","Robert Flogaus-Faust","BY-4.0"]
});
const PHOTO_URLS=Object.freeze({
 "emne_flora_enghumleblom": "https://upload.wikimedia.org/wikipedia/commons/0/0a/Geum_rivale_flowers.jpg",
 "emne_flora_engkarse": "https://upload.wikimedia.org/wikipedia/commons/4/46/Cardamine_pratensis_flower.jpg",
 "emne_flora_engknoppurt": "https://upload.wikimedia.org/wikipedia/commons/6/66/Centaurea_jacea.jpeg",
 "emne_flora_engsmelle": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Silene_vulgaris_flower.jpg/960px-Silene_vulgaris_flower.jpg",
 "emne_flora_engsoleie": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/RanunculusAcris.jpg/960px-RanunculusAcris.jpg",
 "emne_flora_engtjaereblom": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Viscaria_vulgaris_sl66.jpg/960px-Viscaria_vulgaris_sl66.jpg",
 "emne_flora_prestekrage": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Leucanthemum_vulgare.jpeg/960px-Leucanthemum_vulgare.jpeg",
 "emne_flora_balderbra": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Tripleurospermum_inodorum.jpg/960px-Tripleurospermum_inodorum.jpg",
 "emne_flora_ballblom": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Trollius_europaeus.jpg/960px-Trollius_europaeus.jpg",
 "emne_flora_bekkeblom": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Caltha_palustris.jpeg",
 "emne_flora_bergmynte": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Origanum_vulgare.jpg/960px-Origanum_vulgare.jpg",
 "emne_flora_bitterbergknapp": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Sedum_acre.jpeg",
 "emne_flora_blaknapp": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Succisa_pratensis.jpeg",
 "emne_flora_blaveis": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Hepatica_nobilis.JPG/960px-Hepatica_nobilis.JPG",
 "emne_flora_blodstorkenebb": "https://upload.wikimedia.org/wikipedia/commons/8/87/Geranium_sanguineum.jpg",
 "emne_flora_burot": "https://upload.wikimedia.org/wikipedia/commons/7/70/Artemisia_vulgaris.jpeg",
 "emne_flora_geitrams": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Chamaenerion_angustifolium.jpg/960px-Chamaenerion_angustifolium.jpg",
 "emne_flora_hestehov": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tussilago_farfara.JPG/960px-Tussilago_farfara.JPG",
 "emne_flora_hvitveis": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Anemone_nemorosa-An%C3%A9mone_des_bois-Fleur-20170322.jpg/960px-Anemone_nemorosa-An%C3%A9mone_des_bois-Fleur-20170322.jpg",
 "emne_flora_rodkløver": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Trifolium_pratense%2C_known_as_red_clover.jpg/960px-Trifolium_pratense%2C_known_as_red_clover.jpg",
 "emne_flora_tiriltunge": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Lotus_corniculatus_05052026.jpg/960px-Lotus_corniculatus_05052026.jpg",
 "emne_flora_hvitklover": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Trifolium_repens_flowers.jpg/960px-Trifolium_repens_flowers.jpg",
 "emne_flora_hvittvetann": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Lamium_album.jpg/960px-Lamium_album.jpg",
 "emne_flora_rodjonsokblom": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/SileneDioica.jpg/960px-SileneDioica.jpg",
 "emne_flora_hvitbergknapp": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sedum_album_01.jpg/960px-Sedum_album_01.jpg",
 "emne_flora_groblad": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Plantago_major_subsp._major.jpg/960px-Plantago_major_subsp._major.jpg",
 "emne_flora_ormehode": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Echium_vulgare.jpg/960px-Echium_vulgare.jpg",
 "emne_flora_skogstorkenebb": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Geranium_sylvaticum_02_Oslo.jpg/960px-Geranium_sylvaticum_02_Oslo.jpg",
 "emne_flora_gullstjerne": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Gagea_lutea_sl2.jpg/960px-Gagea_lutea_sl2.jpg",
 "emne_flora_markjordbaer": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Fragaria_vesca_RF.jpg/960px-Fragaria_vesca_RF.jpg"
});
function get(id){
 const entry=FILES[String(id)];if(!entry)return null;
 const [scientificName,fileName,creator,licenseKey]=entry;
 const [license,licenseUrl]=licenses[licenseKey];
 const encoded=encodeURIComponent(fileName.replace(/ /g,"_"));
 return Object.freeze({
  scientificName,creator,license,licenseUrl,
  source:"https://commons.wikimedia.org/wiki/File:"+encoded,
  src:PHOTO_URLS[String(id)],
  type:"photo"
 });
}
window.HG_NATURE_FLORA_PHOTOS=Object.freeze({get,count:Object.keys(FILES).length});
})();
