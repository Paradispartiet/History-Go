import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifacts=path.join(root,"artifacts","flora-approval");
fs.mkdirSync(artifacts,{recursive:true});
const mime={".html":"text/html",".js":"application/javascript",".json":"application/json",".css":"text/css",".webp":"image/webp",".png":"image/png",".svg":"image/svg+xml"};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url||"/","http://127.0.0.1").pathname);
  const filename=path.resolve(root,"."+pathname);
  if(!filename.startsWith(root+path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()){
    res.writeHead(404);res.end();return;
  }
  res.writeHead(200,{"Content-Type":mime[path.extname(filename)]||"application/octet-stream"});
  fs.createReadStream(filename).pipe(res);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port;
let browser;
const photoStub=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9YxxF64AAAAASUVORK5CYII=","base64");
try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const subjects=[
    {name:"sitkagran",label:"Sitkagran",term:"Sitkagran",path:"b09/85_sitkagran_v1.webp"},
    {name:"tuja",label:"Tuja",term:"Tuja",path:"b09/84_tuja_v1.webp"},
    {name:"sotmispel",label:"Søtmispel",term:"Søtmispel",path:"b09/83_sotmispel_v1.webp"},
    {name:"prydpaere",label:"Prydpære",term:"Prydpære",path:"b09/82_prydpaere_v2.webp"},
    {name:"prydkirsebaer",label:"Prydkirsebær",term:"Prydkirsebær",path:"b09/81_prydkirsebaer_v1.webp"},
    {name:"platanlonn",label:"Platanlønn",term:"Platanlønn",path:"b09/80_platanlonn_v1.webp"},
    {name:"sibirsk-ertebusk",label:"Sibirsk ertebusk",term:"Sibirsk ertebusk",path:"b09/79_sibirsk_ertebusk_v1.webp"},
    {name:"russekaal",label:"Russekål",term:"Russekål",path:"b09/78_russekaal_v1.webp"},
    {name:"hagegullregn",label:"Hagegullregn",term:"Hagegullregn",path:"b09/77_hagegullregn_v1.webp"},
    {name:"buskmure",label:"Buskmure",term:"Buskmure",path:"b09/76_buskmure_v1.webp"},
    {name:"syrin",label:"Syrin",term:"Syrin",path:"b09/75_syrin_v1.webp"},
    {name:"mispel",label:"Mispel",term:"Mispel",path:"b09/74_mispel_v1.webp"},
    {name:"spirea",label:"Spirea",term:"Spirea",path:"b09/73_spirea_v1.webp"},
    {name:"berberis",label:"Berberis",term:"Berberis",path:"b09/72_berberis_v1.webp"},
    {name:"mahonia",label:"Mahonia",term:"Mahonia",path:"b09/71_mahonia_v1.webp"},
    {name:"snobaer",label:"Snøbær",term:"Snøbær",path:"b09/70_snobaer_v1.webp"},
    {name:"gravbergknapp",label:"Gravbergknapp",term:"Gravbergknapp",path:"b09/69_gravbergknapp_v1.webp"},
    {name:"kjempespringfro",label:"Kjempespringfrø",term:"Kjempespringfrø",path:"b09/68_kjempespringfro_v1.webp"},
    {name:"parkslirekne",label:"Parkslirekne",term:"Parkslirekne",path:"b09/67_parkslirekne_v1.webp"},
    {name:"kanadagullris",label:"Kanadagullris",term:"Kanadagullris",path:"b09/66_kanadagullris_v1.webp"},
    {name:"kjempebjornkjeks",label:"Kjempebjørnekjeks",term:"Kjempebjørnekjeks",path:"b09/65_kjempebjornkjeks_v1.webp"},
    {name:"skvallerkaal",label:"Skvallerkål",term:"Skvallerkål",path:"b09/64_skvallerkaal_v1.webp"},
    {name:"hagelupin",label:"Hagelupin",term:"Hagelupin",path:"b09/63_hagelupin_v1.webp"},
    {name:"rynkerose",label:"Rynkerose",term:"Rynkerose",path:"b09/62_rynkerose_v1.webp"},
    {name:"svalerot",label:"Svalerot",term:"Svalerot",path:"b09/61_svalerot_v1.webp"},
    {name:"rosslyng",label:"Røsslyng",term:"Røsslyng",path:"b09/60_rosslyng_v1.webp"},
    {name:"rodtvetann",label:"Rød tvetann",term:"Rød tvetann",path:"b09/59_rodtvetann_v1.webp"},
    {name:"rodknapp",label:"Rødknapp",term:"Rødknapp",path:"b09/58_rodknapp_v1.webp"},
    {name:"balderbra",label:"Balderbrå",term:"Balderbrå",path:"b09/57_balderbra_v1.webp"},
    {name:"hestehov",path:"b03/01_hestehov_var.webp"},
    {name:"hvitveis",path:"b01/01_hvitveis.webp"},
    {name:"blaveis",term:"blåveis",path:"b01/07_blaveis.webp"},
    {name:"engkarse",path:"b04/01_engkarse_v3.webp"},
    {name:"ballblom",path:"b04/02_ballblom_v3.webp"},
    {name:"engsoleie",path:"b04/03_engsoleie_v3.webp"},
    {name:"lovetann",label:"Løvetann",term:"løvetann",path:"b05/01_lovetann_v2.webp"},
    {name:"rodjonsokblom",label:"Rød jonsokblom",term:"jonsok",path:"b05/02_rodjonsokblom_v2.webp"},
    {name:"prestekrage",path:"b05/03_prestekrage_v2.webp"},
    {name:"geitrams",path:"b06/02_geitrams.webp"},
    {name:"groblad",path:"b06/03_groblad.webp"},
    {name:"ryllik",path:"b06/01_ryllik.webp"},
    {name:"hvitklover",label:"Hvitkløver",term:"hvitkløver",path:"b07/03_hvitklover.webp"},
    {name:"blaklokke",label:"Blåklokke",term:"blåklokke",path:"b07/04_blaklokke.webp"},
    {name:"tiriltunge",label:"Tiriltunge",term:"tiriltunge",path:"b07/02_tiriltunge_v2.webp"},
    {name:"rodkløver",label:"Rødkløver",term:"rødkløver",path:"b08/01_rodklover_v4.webp"},
    {name:"bekkeblom",label:"Bekkeblom",term:"bekkeblom",path:"b08/02_bekkeblom_v1.webp"},
    {name:"bergmynte",label:"Bergmynte",term:"bergmynte",path:"b08/03_bergmynte_v1.webp"},
    {name:"bitterbergknapp",label:"Bitter bergknapp",term:"bitter bergknapp",path:"b08/04_bitterbergknapp_v1.webp"},
    {name:"blodstorkenebb",label:"Blodstorkenebb",term:"blodstorkenebb",path:"b08/05_blodstorkenebb_v1.webp"},
    {name:"blaknapp",label:"Blåknapp",term:"blåknapp",path:"b08/06_blaknapp_v1.webp"},
    {name:"burot",label:"Burot",term:"burot",path:"b08/07_burot_v1.webp"},
    {name:"enghumleblom",label:"Enghumleblom",term:"enghumleblom",path:"b09/01_enghumleblom_v2.webp"},
    {name:"engknoppurt",label:"Engknoppurt",term:"engknoppurt",path:"b09/02_engknoppurt_v2.webp"},
    {name:"engsmelle",label:"Engsmelle",term:"engsmelle",path:"b09/03_engsmelle_v1.webp"},
    {name:"engtjaereblom",label:"Engtjæreblom",term:"engtjæreblom",path:"b09/04_engtjaereblom_v1.webp"},
    {name:"firkantperikum",label:"Firkantperikum",term:"firkantperikum",path:"b09/05_firkantperikum_v1.webp"},
    {name:"forglemmegei",label:"Forglemmegei",term:"forglemmegei",path:"b09/06_forglemmegei_v1.webp"},
    {name:"gjetertaske",label:"Gjetertaske",term:"gjetertaske",path:"b09/07_gjetertaske_v1.webp"},
    {name:"gulaks",label:"Gulaks",term:"gulaks",path:"b09/08_gulaks_v1.webp"},
    {name:"nyresoleier",label:"Nyresoleier",term:"nyresoleier",path:"b09/09_nyresoleier_v1.webp"},
    {name:"gullstjerne",label:"Gullstjerne",term:"gullstjerne",path:"b09/10_gullstjerne_v1.webp"},
    {name:"gulmaure",label:"Gulmaure",term:"gulmaure",path:"b09/11_gulmaure_v1.webp"},
    {name:"haredylle",label:"Haredylle",term:"haredylle",path:"b09/12_haredylle_v1.webp"},
    {name:"humleblom",label:"Humleblom",term:"humleblom",path:"b09/13_humleblom_v1.webp"},
    {name:"hvitbergknapp",label:"Hvit bergknapp",term:"hvit bergknapp",path:"b09/14_hvitbergknapp_v1.webp"},
    {name:"hvittvetann",label:"Hvit tvetann",term:"hvit tvetann",path:"b09/15_hvittvetann_v1.webp"},
    {name:"hvitmaure",label:"Hvitmaure",term:"hvitmaure",path:"b09/16_hvitmaure_v1.webp"},
    {name:"jordreve",label:"Jordreve",term:"jordreve",path:"b09/17_jordreve_v1.webp"},
    {name:"kattefot",label:"Kattefot",term:"kattefot",path:"b09/18_kattefot_v1.webp"},
    {name:"krypsoleie",label:"Krypsoleie",term:"krypsoleie",path:"b09/19_krypsoleie_v1.webp"},
    {name:"krypveronika",label:"Krypveronika",term:"krypveronika",path:"b09/20_krypveronika_v1.webp"},
    {name:"kusymre",label:"Kusymre",term:"kusymre",path:"b09/21_kusymre_v1.webp"},
    {name:"marianokleblom",label:"Marianøkleblom",term:"marianøkleblom",path:"b09/22_marianokleblom_v1.webp"},
    {name:"lungeurt",label:"Lungeurt",term:"lungeurt",path:"b09/23_lungeurt_v1.webp"},
    {name:"markjordbaer",label:"Markjordbær",term:"markjordbær",path:"b09/24_markjordbaer_v1.webp"},
    {name:"meldestokk",label:"Meldestokk",term:"meldestokk",path:"b09/25_meldestokk_v1.webp"},
    {name:"ormehode",label:"Ormehode",term:"ormehode",path:"b09/26_ormehode_v1.webp"},
    {name:"stankstorkenebb",label:"Stankstorkenebb",term:"stankstorkenebb",path:"b09/27_stankstorkenebb_v1.webp"},
    {name:"perleblomst",label:"Perleblomst",term:"perleblomst",path:"b09/28_perleblomst_v1.webp"},
    {name:"prikkperikum",label:"Prikkperikum",term:"prikkperikum",path:"b09/29_prikkperikum_v1.webp"},
    {name:"prikktvetann",label:"Prikktvetann",term:"prikktvetann",path:"b09/30_prikktvetann_v1.webp"},
    {name:"reinfann",label:"Reinfann",term:"reinfann",path:"b09/31_reinfann_v1.webp"},
    {name:"russblastjerne",label:"Russblåstjerne",term:"Russblåstjerne",path:"b09/32_russblastjerne_v1.webp"},
    {name:"sandarve",label:"Sandarve",term:"sandarve",path:"b09/33_sandarve_v1.webp"},
    {name:"skogfiol",label:"Skogfiol",term:"Skogfiol",path:"b09/34_skogfiol_v1.webp"},
    {name:"skogstorkenebb",label:"Skogstorkenebb",term:"Skogstorkenebb",path:"b09/35_skogstorkenebb_v1.webp"},
    {name:"smalkjempe",label:"Smalkjempe",term:"Smalkjempe",path:"b09/36_smalkjempe_v1.webp"},
    {name:"smorbukk",label:"Smørbukk",term:"Smørbukk",path:"b09/37_smorbukk_v1.webp"},
    {name:"smaengkall",label:"Småengkall",term:"Småengkall",path:"b09/38_smaengkall_v1.webp"},
    {name:"snoklokke",label:"Snøklokke",term:"Snøklokke",path:"b09/39_snoklokke_v1.webp"},
    {name:"stemorsblomst",label:"Stemorsblomst \\(forvillet\\)",term:"Stemorsblomst",path:"b09/40_stemorsblomst_v1.webp"},
    {name:"strandvindel",label:"Strandvindel",term:"Strandvindel",path:"b09/41_strandvindel_v1.webp"},
    {name:"taklok",label:"Takløk",term:"Takløk",path:"b09/42_taklok_v1.webp"},
    {name:"timian",label:"Timian",term:"Timian",path:"b09/43_timian_v1.webp"},
    {name:"tveskjeggveronika",label:"Tveskjeggveronika",term:"Tveskjeggveronika",path:"b09/44_tveskjeggveronika_v1.webp"},
    {name:"tyskhonsetarm",label:"Tysk hønsetarm",term:"Tysk hønsetarm",path:"b09/45_tysk_honsetarm_v1.webp"},
    {name:"vassarve",label:"Vassarve",term:"Vassarve",path:"b09/46_vassarve_v1.webp"},
    {name:"veihaukeskjegg",label:"Veihaukeskjegg",term:"Veihaukeskjegg",path:"b09/47_veihaukeskjegg_v1.webp"},
    {name:"villkarse",label:"Villkarse",term:"Villkarse",path:"b09/48_villkarse_v1.webp"},
    {name:"vararve",label:"Vårarve",term:"Vårarve",path:"b09/49_vararve_v1.webp"},
    {name:"varerteknapp",label:"Vårerteknapp",term:"Vårerteknapp",path:"b09/50_varerteknapp_v1.webp"},
    {name:"varkaal",label:"Vårkål[^,]*",term:"Vårkål",path:"b09/51_varkaal_v1.webp"},
    {name:"varmure",label:"Vårmure",term:"Vårmure",path:"b09/52_varmure_v1.webp"},
    {name:"akervindel",label:"Åkervindel",term:"Åkervindel",path:"b09/56_akervindel_v1.webp"},
    {name:"akerveronika",label:"Åkerveronika",term:"Åkerveronika",path:"b09/55_akerveronika_v1.webp"},
    {name:"akerdylle",label:"Åkerdylle",term:"Åkerdylle",path:"b09/54_akerdylle_v1.webp"},
    {name:"varpengeurt",label:"Vårpengeurt",term:"Vårpengeurt",path:"b09/53_varpengeurt_v1.webp"},
  ];
  for(const width of [390,1440]){
    for(const species of subjects){
    const context=await browser.newContext({viewport:{width,height:900}});
    await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await context.route("https://upload.wikimedia.org/**",r=>r.fulfill({contentType:"image/png",body:photoStub}));
    const page=await context.newPage();
    await page.goto("http://127.0.0.1:"+port+"/finn-flora.html",{waitUntil:"domcontentloaded"});
    await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
    await page.locator("#natureSearch").fill(species.term||species.name);
    const title=species.label||species.term||species.name;
    const card=page.locator("#natureGrid").getByRole("button",{name:new RegExp("^"+title+",","i")}).first();
    await card.waitFor();
    if(species.name==="berberis"){
      const both=page.locator("#natureGrid").getByRole("button",{name:/^Berberis,/i});
      assert.equal(await both.count(),2,"Berberis must have separate flora and kratt cards");
      for(const entry of await both.all())
        assert((await entry.locator("img").getAttribute("src")).endsWith(species.path),"Both Berberis entries must use the one genus original");
    }
    if(species.name==="mahonia"){
      const both=page.locator("#natureGrid").getByRole("button",{name:/^Mahonia,/i});
      assert.equal(await both.count(),2,"Mahonia must have separate flora and kratt cards");
      for(const entry of await both.all())
        assert((await entry.locator("img").getAttribute("src")).endsWith(species.path),"Both Mahonia entries must use the one approved original");
    }
    await card.locator("img").evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await card.locator("img").getAttribute("src")).endsWith(species.path));
    assert.equal((await card.locator(".ne-image-label").innerText()).trim(),"Illustrasjon");
    assert.equal(await card.locator("img").evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    await card.screenshot({path:path.join(artifacts,species.name+"-kort-"+width+".png")});
    await card.click();
    const dialog=page.locator("#natureDialog");
    await dialog.waitFor({state:"visible"});
    await page.waitForFunction(()=>document.querySelector(".ne-dialog-image")?.naturalWidth>0);
    assert.equal(await dialog.locator(".ne-dialog-image").evaluate(el=>el.classList.contains("ne-transparent-art")),true);
    const bounds=await dialog.boundingBox();
    assert(bounds && bounds.width<=width,"dialog overflow at "+width);
    await dialog.screenshot({path:path.join(artifacts,species.name+"-dialog-"+width+".png")});
    await context.close();

    const failure=await browser.newContext({viewport:{width,height:900}});
    await failure.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await failure.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await failure.route("https://upload.wikimedia.org/**",r=>r.abort("failed"));
    await failure.route("**/bilder/natur/flora/illustrasjonskandidater/"+species.path,r=>r.abort("failed"));
    const test=await failure.newPage();
    await test.goto("http://127.0.0.1:"+port+"/finn-flora.html",{waitUntil:"domcontentloaded"});
    await test.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
    await test.locator("#natureSearch").fill(species.term||species.name);
    const fallback=test.locator("#natureGrid").getByRole("button",{name:new RegExp("^"+title+",","i")}).first();
    await fallback.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:20000});
    assert.equal(await fallback.locator("img").count(),0);
    await fallback.click();
    await test.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:20000});
    await failure.close();
    console.log(species.name+" viewport "+width+": illustrated card/dialog and no photo fallback OK.");
    }
    // Held candidates remain outside Finn Flora; the dedicated review shows all four.
    const held=await browser.newContext({viewport:{width,height:900}});
    await held.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await held.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await held.route("https://upload.wikimedia.org/**",r=>r.fulfill({contentType:"image/png",body:photoStub}));
    const page=await held.newPage();
    await page.goto("http://127.0.0.1:"+port+"/finn-flora.html",{waitUntil:"domcontentloaded"});
    await page.locator("#natureGrid .ne-card").first().waitFor();
    await page.locator("#natureSearch").fill("tiriltunge");
    const illustrated=page.locator("#natureGrid").getByRole("button",{name:/^Tiriltunge,/i});
    await illustrated.locator(".ne-image-label").getByText("Illustrasjon").waitFor();
    assert((await illustrated.locator("img").getAttribute("src")).endsWith("b07/02_tiriltunge_v2.webp"));
    await page.goto("http://127.0.0.1:"+port+"/flora-illustrasjoner-bolk06.html",{waitUntil:"domcontentloaded"});
    assert.equal(await page.locator(".species img").count(),4);
    for(const img of await page.locator(".species img").all()){
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
      assert.equal(await img.evaluate(el=>el.naturalWidth),1024);
    }
    assert(await page.getByText("Artsform vurdert · mangler artsoppføring",{exact:true}).isVisible());
    assert(await page.getByText("Må tegnes om · ikke publisert",{exact:true}).isVisible());
    await page.screenshot({path:path.join(artifacts,"batch06-gallery-"+width+".png"),fullPage:true});
    await held.close();
    console.log("Batch 06 viewport "+width+": historic rejected tiriltunge image preserved alongside new v2.");
  }
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
