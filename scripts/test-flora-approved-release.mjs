import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const older = JSON.parse(read("data/natur/flora/illustration-quality-review-20261028.json"));
const batch = JSON.parse(read("data/natur/flora/illustration-quality-batch01-20261028.json"));
const candidates = JSON.parse(read("data/natur/flora/illustration-candidates-batch01.json"));
const revision = JSON.parse(read("data/natur/flora/illustration-revision-batch04.json"));
const review06 = JSON.parse(read("data/natur/flora/illustration-quality-batch06-20261028.json"));
const review07 = JSON.parse(read("data/natur/flora/illustration-quality-batch07-20261028.json"));
const review08 = JSON.parse(read("data/natur/flora/illustration-quality-batch08-20261030.json"));
const bekkeblomReview = JSON.parse(read("data/natur/flora/illustration-quality-bekkeblom-20261031.json"));
const bergmynteReview = JSON.parse(read("data/natur/flora/illustration-quality-bergmynte-20261031.json"));
const bitterbergknappReview = JSON.parse(read("data/natur/flora/illustration-quality-bitterbergknapp-20261031.json"));
const blodstorkenebbReview = JSON.parse(read("data/natur/flora/illustration-quality-blodstorkenebb-20261031.json"));
const blaknappReview = JSON.parse(read("data/natur/flora/illustration-quality-blaknapp-20261031.json"));
const burotReview = JSON.parse(read("data/natur/flora/illustration-quality-burot-20261031.json"));
const enghumleblomReview = JSON.parse(read("data/natur/flora/illustration-quality-enghumleblom-20261101.json"));
const engknoppurtReview = JSON.parse(read("data/natur/flora/illustration-quality-engknoppurt-20261101.json"));
const engsmelleReview = JSON.parse(read("data/natur/flora/illustration-quality-engsmelle-20261101.json"));
const engtjaereblomReview = JSON.parse(read("data/natur/flora/illustration-quality-engtjaereblom-20261101.json"));
const firkantperikumReview = JSON.parse(read("data/natur/flora/illustration-quality-firkantperikum-20261101.json"));
const forglemmegeiReview = JSON.parse(read("data/natur/flora/illustration-quality-forglemmegei-20261101.json"));
const gjetertaskeReview = JSON.parse(read("data/natur/flora/illustration-quality-gjetertaske-20261101.json"));
const gulaksReview = JSON.parse(read("data/natur/flora/illustration-quality-gulaks-20261101.json"));
const nyresoleierReview = JSON.parse(read("data/natur/flora/illustration-quality-nyresoleier-20261101.json"));
const gullstjerneReview = JSON.parse(read("data/natur/flora/illustration-quality-gullstjerne-20261101.json"));
const gulmaureReview = JSON.parse(read("data/natur/flora/illustration-quality-gulmaure-20261101.json"));
const haredylleReview = JSON.parse(read("data/natur/flora/illustration-quality-haredylle-20261101.json"));
const hvitbergknappReview = JSON.parse(read("data/natur/flora/illustration-quality-hvitbergknapp-20261102.json"));
const hvittvetannReview = JSON.parse(read("data/natur/flora/illustration-quality-hvittvetann-20261102.json"));
const hvitmaureReview = JSON.parse(read("data/natur/flora/illustration-quality-hvitmaure-20261102.json"));
const hagegullregnReview = JSON.parse(read("data/natur/flora/illustration-quality-hagegullregn-20261110.json"));
const buskmureReview = JSON.parse(read("data/natur/flora/illustration-quality-buskmure-20261110.json"));
const syrinReview = JSON.parse(read("data/natur/flora/illustration-quality-syrin-20261110.json"));
const mispelReview = JSON.parse(read("data/natur/flora/illustration-quality-mispel-20261110.json"));
const spireaReview = JSON.parse(read("data/natur/flora/illustration-quality-spirea-20261110.json"));
const berberisReview = JSON.parse(read("data/natur/flora/illustration-quality-berberis-20261110.json"));
const mahoniaReview = JSON.parse(read("data/natur/flora/illustration-quality-mahonia-20261110.json"));
const snobaerReview = JSON.parse(read("data/natur/flora/illustration-quality-snobaer-20261110.json"));
const gravbergknappReview = JSON.parse(read("data/natur/flora/illustration-quality-gravbergknapp-20261110.json"));
const kjempespringfroReview = JSON.parse(read("data/natur/flora/illustration-quality-kjempespringfro-20261110.json"));
const parkslirekneReview = JSON.parse(read("data/natur/flora/illustration-quality-parkslirekne-20261106.json"));
const kanadagullrisReview = JSON.parse(read("data/natur/flora/illustration-quality-kanadagullris-20261106.json"));
const kjempebjornkjeksReview = JSON.parse(read("data/natur/flora/illustration-quality-kjempebjornkjeks-20261106.json"));
const skvallerkaalReview = JSON.parse(read("data/natur/flora/illustration-quality-skvallerkaal-20261106.json"));
const hagelupinReview = JSON.parse(read("data/natur/flora/illustration-quality-hagelupin-20261106.json"));
const rynkeroseReview = JSON.parse(read("data/natur/flora/illustration-quality-rynkerose-20261106.json"));
const svalerotReview = JSON.parse(read("data/natur/flora/illustration-quality-svalerot-20261105.json"));
const rosslyngReview = JSON.parse(read("data/natur/flora/illustration-quality-rosslyng-20261105.json"));
const rodtvetannReview = JSON.parse(read("data/natur/flora/illustration-quality-rodtvetann-20261105.json"));
const rodknappReview = JSON.parse(read("data/natur/flora/illustration-quality-rodknapp-20261105.json"));
const balderbraReview = JSON.parse(read("data/natur/flora/illustration-quality-balderbra-20261105.json"));
const akervindelReview = JSON.parse(read("data/natur/flora/illustration-quality-akervindel-20261105.json"));
const akerveronikaReview = JSON.parse(read("data/natur/flora/illustration-quality-akerveronika-20261104.json"));
const akerdylleReview = JSON.parse(read("data/natur/flora/illustration-quality-akerdylle-20261104.json"));
const varpengeurtReview = JSON.parse(read("data/natur/flora/illustration-quality-varpengeurt-20261104.json"));
const varmureReview = JSON.parse(read("data/natur/flora/illustration-quality-varmure-20261104.json"));
const varkaalReview = JSON.parse(read("data/natur/flora/illustration-quality-varkaal-20261104.json"));
const varerteknappReview = JSON.parse(read("data/natur/flora/illustration-quality-varerteknapp-20261104.json"));
const vararveReview = JSON.parse(read("data/natur/flora/illustration-quality-vararve-20261104.json"));
const villkarseReview = JSON.parse(read("data/natur/flora/illustration-quality-villkarse-20261104.json"));
const veihaukeskjeggReview = JSON.parse(read("data/natur/flora/illustration-quality-veihaukeskjegg-20261103.json"));
const vassarveReview = JSON.parse(read("data/natur/flora/illustration-quality-vassarve-20261103.json"));
const tyskhonsetarmReview = JSON.parse(read("data/natur/flora/illustration-quality-tyskhonsetarm-20261103.json"));
const tveskjeggveronikaReview = JSON.parse(read("data/natur/flora/illustration-quality-tveskjeggveronika-20261103.json"));
const timianReview = JSON.parse(read("data/natur/flora/illustration-quality-timian-20261103.json"));
const taklokReview = JSON.parse(read("data/natur/flora/illustration-quality-taklok-20261103.json"));
const strandvindelReview = JSON.parse(read("data/natur/flora/illustration-quality-strandvindel-20261103.json"));
const stemorsblomstReview = JSON.parse(read("data/natur/flora/illustration-quality-stemorsblomst-20261103.json"));
const snoklokkeReview = JSON.parse(read("data/natur/flora/illustration-quality-snoklokke-20261103.json"));
const smaengkallReview = JSON.parse(read("data/natur/flora/illustration-quality-smaengkall-20261103.json"));
const smorbukkReview = JSON.parse(read("data/natur/flora/illustration-quality-smorbukk-20261103.json"));
const smalkjempeReview = JSON.parse(read("data/natur/flora/illustration-quality-smalkjempe-20261103.json"));
const skogstorkenebbReview = JSON.parse(read("data/natur/flora/illustration-quality-skogstorkenebb-20261103.json"));
const skogfiolReview = JSON.parse(read("data/natur/flora/illustration-quality-skogfiol-20261103.json"));
const sandarveReview = JSON.parse(read("data/natur/flora/illustration-quality-sandarve-20261102.json"));
const russblastjerneReview = JSON.parse(read("data/natur/flora/illustration-quality-russblastjerne-20261102.json"));
const reinfannReview = JSON.parse(read("data/natur/flora/illustration-quality-reinfann-20261102.json"));
const prikktvetannReview = JSON.parse(read("data/natur/flora/illustration-quality-prikktvetann-20261102.json"));
const prikkperikumReview = JSON.parse(read("data/natur/flora/illustration-quality-prikkperikum-20261102.json"));
const perleblomstReview = JSON.parse(read("data/natur/flora/illustration-quality-perleblomst-20261102.json"));
const stankstorkenebbReview = JSON.parse(read("data/natur/flora/illustration-quality-stankstorkenebb-20261102.json"));
const ormehodeReview = JSON.parse(read("data/natur/flora/illustration-quality-ormehode-20261102.json"));
const meldestokkReview = JSON.parse(read("data/natur/flora/illustration-quality-meldestokk-20261102.json"));
const markjordbaerReview = JSON.parse(read("data/natur/flora/illustration-quality-markjordbaer-20261102.json"));
const lungeurtReview = JSON.parse(read("data/natur/flora/illustration-quality-lungeurt-20261102.json"));
const kusymreReview = JSON.parse(read("data/natur/flora/illustration-quality-kusymre-20261102.json"));
const marianokleblomReview = JSON.parse(read("data/natur/flora/illustration-quality-marianokleblom-20261102.json"));
const krypveronikaReview = JSON.parse(read("data/natur/flora/illustration-quality-krypveronika-20261102.json"));
const krypsoleieReview = JSON.parse(read("data/natur/flora/illustration-quality-krypsoleie-20261102.json"));
const kattefotReview = JSON.parse(read("data/natur/flora/illustration-quality-kattefot-20261102.json"));
const jordreveReview = JSON.parse(read("data/natur/flora/illustration-quality-jordreve-20261102.json"));
const humleblomReview = JSON.parse(read("data/natur/flora/illustration-quality-humleblom-20261101.json"));
const review05 = JSON.parse(read("data/natur/flora/illustration-quality-batch05-20261028.json"));
const pending05 = JSON.parse(read("data/natur/flora/illustration-revision-batch05.json"));
const env = {window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env,{timeout:2000});
const approved = env.window.HG_NATURE_FLORA_APPROVED;
const expected = [
  ["emne_flora_hagegullregn","Laburnum anagyroides"],
  ["emne_flora_buskmure","Dasiphora fruticosa"],
  ["emne_flora_syrin","Syringa vulgaris"],
  ["emne_flora_mispel","Cotoneaster spp."],
  ["emne_flora_spirea","Spiraea spp."],
  ["emne_flora_berberis","Berberis spp."],
  ["emne_flora_mahonia","Mahonia aquifolium"],
  ["emne_flora_snobaer","Symphoricarpos albus"],
  ["emne_flora_gravbergknapp","Phedimus spurius"],
  ["emne_flora_kjempespringfro","Impatiens glandulifera"],
  ["emne_flora_parkslirekne","Reynoutria japonica"],
  ["emne_flora_kanadagullris","Solidago canadensis"],
  ["emne_flora_kjempebjornkjeks","Heracleum mantegazzianum"],
  ["emne_flora_skvallerkaal","Aegopodium podagraria"],
  ["emne_flora_hagelupin","Lupinus polyphyllus"],
  ["emne_flora_rynkerose","Rosa rugosa"],
  ["emne_flora_svalerot","Vincetoxicum hirundinaria"],
  ["emne_flora_rosslyng","Calluna vulgaris"],
  ["emne_flora_rodtvetann","Lamium purpureum"],
  ["emne_flora_rodknapp","Knautia arvensis"],
  ["emne_flora_balderbra","Tripleurospermum inodorum"],
  ["emne_flora_akervindel","Convolvulus arvensis"],
  ["emne_flora_akerveronika","Veronica arvensis"],
  ["emne_flora_akerdylle","Sonchus arvensis"],
  ["emne_flora_hestehov","Tussilago farfara"],
  ["emne_flora_hvitveis","Anemone nemorosa"],
  ["emne_flora_blaveis","Hepatica nobilis"],
  ["emne_flora_engkarse","Cardamine pratensis"],
  ["emne_flora_ballblom","Trollius europaeus"],
  ["emne_flora_engsoleie","Ranunculus acris"],
  ["emne_flora_lovetann","Taraxacum officinale agg."],
  ["emne_flora_rodjonsokblom","Silene dioica"],
  ["emne_flora_prestekrage","Leucanthemum vulgare"],
  ["emne_flora_geitrams","Chamerion angustifolium"],
  ["emne_flora_groblad","Plantago major"],
  ["emne_flora_ryllik","Achillea millefolium"],
  ["emne_flora_hvitklover","Trifolium repens"],
  ["emne_flora_blaklokke","Campanula rotundifolia"],
  ["emne_flora_tiriltunge","Lotus corniculatus"],
  ["emne_flora_rodkløver","Trifolium pratense"],
  ["emne_flora_bekkeblom","Caltha palustris"],
  ["emne_flora_bergmynte","Origanum vulgare"],
  ["emne_flora_bitterbergknapp","Sedum acre"],
  ["emne_flora_blodstorkenebb","Geranium sanguineum"],
  ["emne_flora_blaknapp","Succisa pratensis"],
  ["emne_flora_burot","Artemisia vulgaris"],
  ["emne_flora_enghumleblom","Geum rivale"],
  ["emne_flora_engknoppurt","Centaurea jacea"],
  ["emne_flora_engsmelle","Silene vulgaris"],
  ["emne_flora_engtjaereblom","Viscaria vulgaris"],
  ["emne_flora_firkantperikum","Hypericum maculatum"],
  ["emne_flora_forglemmegei","Myosotis spp."],
  ["emne_flora_gjetertaske","Capsella bursa-pastoris"],
  ["emne_flora_gulaks","Anthoxanthum odoratum"],
  ["emne_flora_gullsoleie","Ranunculus auricomus agg."],
  ["emne_flora_gullstjerne","Gagea lutea"],
  ["emne_flora_gulmaure","Galium verum"],
  ["emne_flora_haredylle","Crepis capillaris"],
  ["emne_flora_humleblom","Geum urbanum"],
  ["emne_flora_hvitbergknapp","Sedum album"],
  ["emne_flora_hvittvetann","Lamium album"],
  ["emne_flora_hvitmaure","Galium boreale"],
  ["emne_flora_jordreve","Glechoma hederacea"],
  ["emne_flora_kattefot","Antennaria dioica"],
  ["emne_flora_krypsoleie","Ranunculus repens"],
  ["emne_flora_krypveronika","Veronica filiformis"],
  ["emne_flora_kusymre_marianokleblom","Primula vulgaris"],
  ["emne_flora_marianokleblom","Primula veris"],
  ["emne_flora_lungeurt","Pulmonaria spp."],
  ["emne_flora_markjordbaer","Fragaria vesca"],
  ["emne_flora_meldestokk","Chenopodium album"],
  ["emne_flora_ormehode","Echium vulgare"],
  ["emne_flora_penstorkenebb","Geranium robertianum"],
  ["emne_flora_perleblomst","Muscari spp."],
  ["emne_flora_prikkperikum","Hypericum perforatum"],
  ["emne_flora_prikktvetann","Lamium maculatum"],
  ["emne_flora_reinfann","Tanacetum vulgare"],
  ["emne_flora_russblaastjerne","Scilla siberica"],
  ["emne_flora_sandarve","Arenaria serpyllifolia"],
  ["emne_flora_skogfiol","Viola riviniana"],
  ["emne_flora_skogstorkenebb","Geranium sylvaticum"],
  ["emne_flora_smalkjempe","Plantago lanceolata"],
  ["emne_flora_smor_bukk","Hylotelephium maximum"],
  ["emne_flora_smaengkall","Rhinanthus minor"],
  ["emne_flora_snoklokke","Galanthus nivalis"],
  ["emne_flora_stemorsblomst_forvillet","Viola tricolor m.fl."],
  ["emne_flora_strandvindel","Calystegia sepium"],
  ["emne_flora_taklok","Sempervivum spp."],
  ["emne_flora_timian","Thymus serpyllum"],
  ["emne_flora_tveskjeggveronika","Veronica chamaedrys"],
  ["emne_flora_tyskhonsetarm","Stellaria pallida"],
  ["emne_flora_vassarve","Stellaria media"],
  ["emne_flora_veihaukeskjegg","Crepis tectorum"],
  ["emne_flora_villkarse","Cardamine hirsuta"],
  ["emne_flora_vararve","Draba verna"],
  ["emne_flora_varerteknapp","Lathyrus vernus"],
  ["emne_flora_varkaal","Ficaria verna"],
  ["emne_flora_varmure","Potentilla verna"],
  ["emne_flora_varpengeurt","Noccaea caerulescens"]
];
assert.equal(approved.count,expected.length,"publication count changed without species QA");
assert.equal(approved.get("emne_kratt_syrin")?.src,approved.get("emne_flora_syrin")?.src,"Syrin flora/kratt cards must share one original");
assert.equal(approved.get("emne_kratt_syrin")?.gitBlobSha,approved.get("emne_flora_syrin")?.gitBlobSha);
assert.equal(approved.get("emne_kratt_mispel")?.src,approved.get("emne_flora_mispel")?.src,"Mispel flora and kratt must share one original");
assert.equal(approved.get("emne_kratt_mispel")?.gitBlobSha,approved.get("emne_flora_mispel")?.gitBlobSha);
assert(!approved.get("emne_flora_blankmispel")||approved.get("emne_flora_blankmispel")?.src!==approved.get("emne_flora_mispel")?.src,"Do not automatically alias distinct Cotoneaster species");
assert.equal(approved.get("emne_kratt_berberis")?.src,approved.get("emne_flora_berberis")?.src,"Berberis flora/kratt cards must share one original");
assert.notEqual(approved.get("emne_flora_hostberberis")?.src,approved.get("emne_flora_berberis")?.src,"Høstberberis must not inherit generic Berberis artwork");
assert.equal(approved.get("emne_flora_tysk_honsetarm")?.src, approved.get("emne_flora_tyskhonsetarm")?.src, "Tysk hønsetarm aliases must reuse one illustration");
assert.equal(approved.get("emne_kratt_snobaer")?.src,approved.get("emne_flora_snobaer")?.src,"Kratt Snøbær must reuse the same species artwork");
assert.equal(approved.get("emne_flora_knoppurt")?.src, approved.get("emne_flora_engknoppurt")?.src, "Knoppurt must reuse Engknoppurt illustration");
assert.equal(approved.get("emne_flora_knoppurt")?.gitBlobSha, approved.get("emne_flora_engknoppurt")?.gitBlobSha, "Knoppurt alias must not add a duplicate image");
assert.equal(batch.items.length,15);
assert.equal(batch.items.filter(a=>a.approvedForPublication).length,2);
const allReviews=[...hagegullregnReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...buskmureReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...syrinReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...mispelReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...spireaReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...berberisReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...mahoniaReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...snobaerReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...gravbergknappReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...kjempespringfroReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...parkslirekneReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...kanadagullrisReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...kjempebjornkjeksReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...skvallerkaalReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...hagelupinReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...rynkeroseReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...svalerotReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...rosslyngReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...rodtvetannReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...rodknappReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...balderbraReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...akervindelReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...akerveronikaReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...akerdylleReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...varpengeurtReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...varmureReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...varkaalReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...varerteknappReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...vararveReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...villkarseReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...veihaukeskjeggReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...vassarveReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...tyskhonsetarmReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...tveskjeggveronikaReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...timianReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...taklokReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...strandvindelReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...stemorsblomstReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...snoklokkeReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...smaengkallReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...smorbukkReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...smalkjempeReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...skogstorkenebbReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...skogfiolReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...sandarveReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...russblastjerneReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...reinfannReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...prikktvetannReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...prikkperikumReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...perleblomstReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...stankstorkenebbReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...ormehodeReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...meldestokkReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...markjordbaerReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...lungeurtReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...kusymreReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...marianokleblomReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...krypveronikaReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...krypsoleieReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...kattefotReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...jordreveReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...hvitmaureReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...hvittvetannReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...hvitbergknappReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...humleblomReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...haredylleReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...gulmaureReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...gullstjerneReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...nyresoleierReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...gulaksReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...gjetertaskeReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...forglemmegeiReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...firkantperikumReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...engtjaereblomReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...engsmelleReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...engknoppurtReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...enghumleblomReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...burotReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...blaknappReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...blodstorkenebbReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...bitterbergknappReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...bergmynteReview.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...bekkeblomReview.items.map(a=>({...a,candidate:a.candidate||a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...review08.items.filter(a=>a.approvedForPublication).map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...review07.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...review06.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...review05.items.map(a=>({...a,candidate:a.src,candidateGitBlobSha:a.gitBlobSha,evidence:a.sourceReferences})),...revision.items.map(a=>({
  ...a,catalogId:a.id,candidate:a.newSrc,candidateGitBlobSha:a.newGitBlobSha,
  approvedForPublication:a.productionApproval,reviewStatus:a.botanicalVisualDecision==="passed"?"approved":"pending",
  visualChecks:{transparent:true,blackBackgroundReviewed:true},evidence:a.sourceReferences
})),...older.species,...batch.items];
const catalog=JSON.parse(read("data/runtime/nature-all/flora-001.json"))
  .flatMap(a=>a.kind==="emne_pack"?a.items:[a]);
const photographed={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-photographs.js"),photographed,{timeout:2000});
for(const [id,latin] of expected){
  const asset=approved.get(id);
  const entry=allReviews.find(a=>a.catalogId===id);
  assert(asset && entry && entry.approvedForPublication,"missing approved evidence: "+id);
  assert.equal(asset.scientificName,latin);
  assert.equal(entry.scientificName,latin);
  assert.equal(asset.src,entry.candidate);
  assert.equal(asset.gitBlobSha,entry.candidateGitBlobSha||entry.gitBlobSha);
  if(id==="emne_flora_hestehov"){
    assert.equal(entry.botanicalReview,"passed");
    assert.equal(entry.visualReview,"passed");
    assert(entry.visualChecks.alpha && entry.visualChecks.blackBackground);
  }else{
    assert.equal(entry.reviewStatus,"approved");
    assert(entry.visualChecks.transparent && entry.visualChecks.blackBackgroundReviewed);
  }
  assert((entry.references||entry.evidence).length>=2,"missing botanical evidence");
  assert.equal(catalog.find(x=>x.id===id)?.latin,latin,"catalog mismatch: "+id);
  // Photographic source material remains private to the QA gallery, not public.
  const bin=fs.readFileSync(new URL("../"+asset.src,import.meta.url));
  assert(bin.length>15000,"empty image");
  assert.equal(bin.toString("ascii",0,4),"RIFF");
  assert.equal(bin.toString("ascii",8,12),"WEBP");
  assert.equal(bin.toString("ascii",12,16),"VP8X");
  assert((bin[20]&0x10)!==0,"missing alpha channel: "+id);
  const hash=crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+bin.length+"\0"),bin])).digest("hex");
  assert.equal(hash,asset.gitBlobSha,"approved image changed: "+id);
}
for(const x of batch.items){
  const source=candidates.items.find(a=>a.key===x.key);
  assert(source && source.gitBlobSha===x.gitBlobSha);
  assert.equal(approved.get(x.catalogId||x.key)?.src===x.candidate,x.approvedForPublication,"unapproved historical image leaked: "+x.key);
}
for(const id of ["emne_flora_engkarse","emne_flora_ballblom"]){
  assert(approved.has(id),"the v3 version should now be approved");
  assert(older.species.some(a=>a.catalogId===id && a.botanicalReview==="needs_redraw"),"historical v2 rejection must remain");
}
const html=read("finn-flora.html"),js=read("js/ui/nature-explorer.js"),css=read("css/nature-explorer.css");
assert(/src="js\/ui\/nature-flora-approved\.js\?v=\d{8}-\d+"/.test(html));
assert(!html.includes('src="js/ui/nature-flora-photographs.js'),"No source photograph registry in the public atlas");
assert(html.indexOf("nature-flora-approved.js")<html.indexOf("nature-explorer.js"));
assert(js.includes('const art=approvedFloraIllustrations?.get(id)?.src'));
assert(!js.includes("photoCredit") && !js.includes("floraPhotos"),"No photo runtime fallback");
assert(js.includes('Illustrasjon under arbeid'),"No artwork placeholder required");
assert(js.includes('wrap.firstChild.classList.add("ne-dialog-image")'));
assert(css.includes('body[data-nature-kind="flora"] .ne-photo,') && css.includes('background:#000!important'));
assert(css.includes('.ne-transparent-art{object-fit:contain!important;background:transparent!important}'));
assert(!js.includes("localStorage.setItem"));
// Batch 05 documents rejected artwork only; it must never make images live.
assert.equal(pending05.batch,"05");
assert.equal(pending05.approvedForPublication,false);
assert.equal(pending05.originalApprovedSpeciesCount,6);
assert.equal(pending05.items.length,4);
for(const x of pending05.items){
  const previous=batch.items.find(a=>a.key===x.key);
  const manifest=candidates.items.find(a=>a.key===x.key);
  assert(previous && manifest,"missing historical candidate: "+x.key);
  assert.equal(previous.reviewStatus,"needs_redraw","historical rejection changed: "+x.key);
  assert.equal(x.releaseStatus,"needs_redraw");
  assert.equal(x.visualReview,"failed_morphology");
  assert.equal(x.newAssetSrc,null);
  assert.equal(x.src,previous.candidate);
  assert.equal(x.gitBlobSha,manifest.gitBlobSha);
  assert(x.requiredRedraw.length>=3 && x.sourceReferences.length>=1);
  assert.notEqual(approved.get(x.catalogId)?.src,x.src,"historical rejected batch 05 image leaked: "+x.catalogId);
  const bin=fs.readFileSync(new URL("../"+x.src,import.meta.url));
  const hash=crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+bin.length),Buffer.from([0]),bin])).digest("hex");
  assert.equal(hash,x.gitBlobSha,"reviewed original image changed: "+x.key);
}
const preview05=read("flora-illustrasjoner-bolk05.html");
for(const x of pending05.items)assert(preview05.includes(x.src),"review page missing: "+x.key);
assert(read("flora-illustration-review.html").includes('href="flora-illustrasjoner-bolk05.html"'));
console.log("Flora release: "+approved.count+" verified illustration entries, black-only flora, no public photographs.");

assert.equal(approved.get("emne_flora_rodkløver")?.src,"bilder/natur/flora/illustrasjonskandidater/b08/01_rodklover_v4.webp","Only reviewed v4 may publish");
assert(review08.items.some(a=>a.key==="01_rodklover_v3" && a.approvedForPublication===false),"Historical rejected v3 must remain in review");
for(const x of review05.items){
 const b=fs.readFileSync(new URL("../"+x.src,import.meta.url));
 assert.equal(crypto.createHash("sha256").update(b).digest("hex"),x.sha256);
 assert.equal(b.length,x.sizeBytes);
 assert.deepEqual(x.dimensions,[1024,1536]);
 assert((b[20]&0x10)!==0);
 const w=1+b.readUIntLE(24,3),h=1+b.readUIntLE(27,3);
 assert.deepEqual([w,h],x.dimensions,"WebP dimensions differ");
 assert.equal(approved.get(x.catalogId)?.src===x.src,x.approvedForPublication);
 assert(x.observations.length>100 && x.sourceReferences.length>=2);
 assert(preview05.includes(x.src));
}
