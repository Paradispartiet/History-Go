/* Fifty-three individually sourced photographs for Finn Flora.
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
 emne_flora_markjordbaer:["Fragaria vesca","Fragaria vesca RF.jpg","Robert Flogaus-Faust","BY-4.0"],
 emne_flora_tveskjeggveronika:["Veronica chamaedrys","Veronica chamaedrys.jpg","Metju12","BY-SA-3.0"],
 emne_flora_skogfiol:["Viola riviniana","Viola riviniana sl4.jpg","Stefan.lefnaer","BY-SA-4.0"],
 emne_flora_prikkperikum:["Hypericum perforatum","Hypericum perforatum kz03.jpg","Krzysztof Ziarnek, Kenraiz","BY-SA-4.0"],
 emne_flora_reinfann:["Tanacetum vulgare","Tanacetum vulgare.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_rodtvetann:["Lamium purpureum","Lamium purpureum plant.jpg","Arthur Badel","BY-SA-4.0"],
 emne_flora_smalkjempe:["Plantago lanceolata","Plantago lanceolata.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_gulmaure:["Galium verum","Galium verum 02.jpg","Bjoertvedt","BY-SA-3.0"],
 emne_flora_penstorkenebb:["Geranium robertianum","Geranium robertianum.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_vassarve:["Stellaria media","Stellaria media ENBLA01.jpeg","Enrico Blasutto","BY-SA-3.0"],
 emne_flora_krypsoleie:["Ranunculus repens","Ranunculus repens sl20.jpg","Stefan.lefnaer","BY-SA-4.0"],
 emne_flora_snoklokke:["Galanthus nivalis","Snowdrop - Galanthus nivalis.jpg","Nino Barbieri","BY-SA-3.0"],
 emne_flora_humleblom:["Geum urbanum","Geum urbanum.jpg","Badlydrawnboy22","BY-SA-3.0"],
 emne_flora_jordreve:["Glechoma hederacea","Glechoma hederacea.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_gjetertaske:["Capsella bursa-pastoris","Capsella bursa-pastoris.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_rodknapp:["Knautia arvensis","Knautia arvensis.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_smaengkall:["Rhinanthus minor","Rhinanthus minor.jpeg","Kristian Peters","BY-SA-3.0"],
 emne_flora_rosslyng:["Calluna vulgaris","Callúna vulgáris.JPG","Simo Räsänen (Ximonic)","BY-SA-3.0"],
 emne_flora_prikktvetann:["Lamium maculatum","Lamium maculatum 28042026.jpg","Fornax","BY-SA-3.0"],
 emne_flora_kattefot:["Antennaria dioica","Antennaria dioica 001.jpg","Meneerke bloem","BY-SA-3.0"],
 emne_flora_firkantperikum:["Hypericum maculatum","Hypericum maculatum s. str.jpg","Danny S.","BY-SA-4.0"],
 emne_flora_varkaal:["Ficaria verna","Ficaria verna 115300058.jpg","dcourtine","BY-4.0"],
 emne_flora_russblaastjerne:["Scilla siberica","Scilla siberica.jpg","Adventice2000","BY-SA-3.0"],
 emne_flora_varerteknapp:["Lathyrus vernus","Lathyrus vernus02.jpg","Meneerke bloem","BY-SA-3.0"]
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
 "emne_flora_markjordbaer": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Fragaria_vesca_RF.jpg/960px-Fragaria_vesca_RF.jpg",
 "emne_flora_tveskjeggveronika": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Veronica_chamaedrys.jpg/640px-Veronica_chamaedrys.jpg",
 "emne_flora_skogfiol": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Viola_riviniana_sl4.jpg/640px-Viola_riviniana_sl4.jpg",
 "emne_flora_prikkperikum": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Hypericum_perforatum_kz03.jpg/640px-Hypericum_perforatum_kz03.jpg",
 "emne_flora_reinfann": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Tanacetum_vulgare.jpeg/640px-Tanacetum_vulgare.jpeg",
 "emne_flora_rodtvetann": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Lamium_purpureum_plant.jpg/640px-Lamium_purpureum_plant.jpg",
 "emne_flora_smalkjempe": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Plantago_lanceolata.jpeg/640px-Plantago_lanceolata.jpeg",
 "emne_flora_gulmaure": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Galium_verum_02.jpg/640px-Galium_verum_02.jpg",
 "emne_flora_penstorkenebb": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Geranium_robertianum.jpeg/640px-Geranium_robertianum.jpeg",
 "emne_flora_vassarve": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Stellaria_media_ENBLA01.jpeg/640px-Stellaria_media_ENBLA01.jpeg",
 "emne_flora_krypsoleie": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ranunculus_repens_sl20.jpg/640px-Ranunculus_repens_sl20.jpg",
 "emne_flora_snoklokke": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Snowdrop_-_Galanthus_nivalis.jpg/640px-Snowdrop_-_Galanthus_nivalis.jpg",
 "emne_flora_humleblom": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Geum_urbanum.jpg/640px-Geum_urbanum.jpg",
 "emne_flora_jordreve": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Glechoma_hederacea.jpeg/640px-Glechoma_hederacea.jpeg",
 "emne_flora_gjetertaske": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Capsella_bursa-pastoris.jpeg/640px-Capsella_bursa-pastoris.jpeg",
 "emne_flora_rodknapp": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Knautia_arvensis.jpeg/640px-Knautia_arvensis.jpeg",
 "emne_flora_smaengkall": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Rhinanthus_minor.jpeg/640px-Rhinanthus_minor.jpeg",
 "emne_flora_rosslyng": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Call%C3%BAna_vulg%C3%A1ris.JPG/640px-Call%C3%BAna_vulg%C3%A1ris.JPG",
 "emne_flora_prikktvetann": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Lamium_maculatum_28042026.jpg/640px-Lamium_maculatum_28042026.jpg",
 "emne_flora_kattefot": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Antennaria_dioica_001.jpg/640px-Antennaria_dioica_001.jpg",
 "emne_flora_firkantperikum": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Hypericum_maculatum_s._str.jpg/640px-Hypericum_maculatum_s._str.jpg",
 "emne_flora_varkaal": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Ficaria_verna_115300058.jpg/640px-Ficaria_verna_115300058.jpg",
 "emne_flora_russblaastjerne": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Scilla_siberica.jpg/640px-Scilla_siberica.jpg",
 "emne_flora_varerteknapp": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Lathyrus_vernus02.jpg/640px-Lathyrus_vernus02.jpg"
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
