/* Eight explicitly sourced photographs for the Finn Flora pilot.
 * Photo identity follows the Wikimedia Commons file description, not a generated
 * SVG template or an automatic species-name search. This is a photographic
 * reference pilot, not a completed botanical-identification audit.
 * Add only files after checking species, photographer, source page and license.
 */
(function () {
"use strict";
const licenses=Object.freeze({
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
 emne_flora_balderbra:["Tripleurospermum inodorum","Tripleurospermum inodorum.jpg","Thayne Tuason","BY-SA-4.0"]
});
function get(id){
 const entry=FILES[String(id)];if(!entry)return null;
 const [scientificName,fileName,creator,licenseKey]=entry;
 const [license,licenseUrl]=licenses[licenseKey];
 const encoded=encodeURIComponent(fileName.replace(/ /g,"_"));
 return Object.freeze({
  scientificName,creator,license,licenseUrl,
  source:"https://commons.wikimedia.org/wiki/File:"+encoded,
  src:"https://commons.wikimedia.org/wiki/Special:FilePath/"+encoded+"?width=960",
  type:"photo"
 });
}
window.HG_NATURE_FLORA_PHOTOS=Object.freeze({get,count:Object.keys(FILES).length});
})();
