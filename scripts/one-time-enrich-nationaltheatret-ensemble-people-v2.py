from __future__ import annotations

import json
from pathlib import Path

VERIFIED_AT = "2026-07-26"
ROOT = Path(".")
NATIONAL = Path("data/people/litteratur/oslo/nationaltheatret")


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_single(path: Path, person: dict) -> None:
    write_json(path, [person])


agnes = {
    "id": "agnes_mowinckel",
    "visual": {"designCode": "person_stage_director_miniature"},
    "name": "Agnes Mowinckel",
    "initials": "AM",
    "desc": "Skuespiller og Norges første profesjonelle sceneinstruktør, kjent for visuelt helhetsteater, nytt repertoar og kunstnerisk fornyelse.",
    "tags": ["litteratur", "scenekunst", "teater", "skuespiller", "regissor", "sceneinstruktor", "modernisme", "lysdesign", "scenografi", "folketeater", "det_norske_teatret", "nationaltheatret"],
    "placeId": "nationaltheatret",
    "category": "litteratur",
    "kindLabel": "Skuespiller / sceneinstruktør og teaterfornyer",
    "birth_date": "1875-08-25",
    "death_date": "1963-04-01",
    "birth_place": "Bergen",
    "active_place": "Bergen, Kristiania/Oslo og norske turnéscener",
    "year": 1922,
    "education": [
        "Middelskole i Bergen",
        "Tegnelære ved Kunst- og håndverksskolen i Kristiania, 1894",
        "Studieopphold i London og Paris, 1912, med møte med europeisk eksperimentteater"
    ],
    "materials": ["scenelys", "kostyme", "scenografi", "skuespillerinstruksjon", "dramatisk tekst", "samtidsmusikk"],
    "themes": ["visuelt helhetsteater", "psykologisk personregi", "moderne dramatikk", "kunstnerisk risiko", "folketeater og publikumsutvidelse", "samarbeid mellom teater, maleri og musikk"],
    "works": [
        {"id": "kong_midas_mowinckel", "title": "Kong Midas", "year": 1899, "material": "skuespillerarbeid", "place": "Den Nationale Scene, Bergen", "summary": "Scenedebut som Anna Hielm i Gunnar Heibergs drama."},
        {"id": "maria_stuart_mowinckel", "title": "Maria Stuart", "year": 1899, "material": "skuespillerarbeid", "place": "Secondteatret, Kristiania", "summary": "Tittelrolle i det nyåpnede Secondteatrets første sesong."},
        {"id": "varbrytning_1922", "title": "Vårbrytning", "year": 1922, "material": "regi, lys og scenisk komposisjon", "place": "Intimteatret, Kristiania", "summary": "Instruktørdebuten som plasserte henne i første rekke blant norske regissører."},
        {"id": "myrkemakti_1923", "title": "Myrkemakti", "year": 1923, "material": "regi", "place": "Det Norske Teatret", "summary": "Første produksjon som fast instruktør ved teateret."},
        {"id": "keisaren_av_portugalia_1923", "title": "Keisaren av Portugalia", "year": 1923, "material": "regi", "place": "Det Norske Teatret", "summary": "Lagerlöf-dramatisering som også ble sendt på turné."},
        {"id": "rur_1924", "title": "R.U.R.", "year": 1924, "material": "regi og modernistisk scenebilde", "place": "Det Norske Teatret", "summary": "Norgespremiere på Čapeks science-fiction-drama om kunstige arbeidere."},
        {"id": "kongsemnerne_1950_mowinckel", "title": "Kongsemnerne", "year": 1950, "material": "regi, musikk og scenisk helhet", "place": "Det Norske Teatret", "summary": "Ibsen-oppsetning med musikk av Pauline Hall."},
        {"id": "tante_ulrikke_1952", "title": "Tante Ulrikke", "year": 1952, "material": "regi", "place": "Folketeateret", "summary": "Åpningsforestillingen i Folketeaterbygningen, med Ragnhild Hald i tittelrollen."}
    ],
    "popupDesc": "Agnes Mowinckel ble født i Bergen 25. august 1875 og døde i Oslo 1. april 1963. Hun tok tegneutdanning i Kristiania og arbeidet som tegnelærer før hun debuterte ved Den Nationale Scene i 1899. Tegnebakgrunnen, studiereisene til London og Paris og den frie bevegelsen mellom teatre og turneer ga henne et uvanlig visuelt og internasjonalt utgangspunkt.\n\nSom skuespiller arbeidet Mowinckel ved en rekke norske scener. Som instruktør ble hun en nyskaper: hun brukte lys som selvstendig kunstnerisk virkemiddel, inviterte malere inn i teaterproduksjonen, bestilte musikk av samtidskomponister og behandlet tekst, skuespillere, rom, farge og rytme som én helhet. Vårbrytning i 1922 og produksjonene ved Det Norske Teatret gjorde henne sentral i norsk teatermodernisme.\n\nNationaltheatret er hovedankeret i profilen, men karrieren kan ikke forstås uten Det Norske Teatret og Folketeateret. Hun bidro til Det Norske Teatrets kunstneriske gjennombrudd på 1920-tallet og regisserte Folketeaterets åpningsforestilling Tante Ulrikke i 1952. Slik knytter hun de tre scenene sammen gjennom regikunst, kulturpolitikk og ønsket om et teater for et bredere publikum.",
    "places": ["nationaltheatret", "det_norske_teatret", "folketeateret"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Agnes Mowinckel", "url": "https://snl.no/Agnes_Mowinckel", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – Agnes Mowinckel", "url": "https://nbl.snl.no/Agnes_Mowinckel", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Sceneweb – Agnes Mowinckel", "url": "https://sceneweb.no/nb/artist/20085/Agnes_Mowinckel", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Sceneweb – R.U.R. (1924)", "url": "https://sceneweb.no/nb/production/87771/R.U.R.", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Sceneweb – Tante Ulrikke (1952)", "url": "https://sceneweb.no/nb/production/22132/Tante_Ulrikke", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Agnes_Mowinckel", "https://nbl.snl.no/Agnes_Mowinckel", "https://sceneweb.no/nb/artist/20085/Agnes_Mowinckel"],
    "verifiedAt": VERIFIED_AT
}

ragna = {
    "id": "ragna_wettergreen",
    "visual": {"designCode": "person_actor_miniature"},
    "name": "Ragna Wettergreen",
    "initials": "RW",
    "desc": "Karakterskuespiller som bar Nationaltheatrets tidlige ensemble gjennom Ibsen, Strindberg, samtidsdramatikk og lystspill.",
    "tags": ["litteratur", "scenekunst", "teater", "skuespiller", "karakterskuespill", "ibsen", "strindberg", "gullalder", "stumfilm", "nationaltheatret"],
    "placeId": "nationaltheatret",
    "category": "litteratur",
    "kindLabel": "Skuespiller / karakterroller og Ibsen",
    "birth_date": "1864-09-19",
    "death_date": "1958-06-27",
    "birth_place": "Christiania",
    "active_place": "Christiania/Oslo, Sverige og Danmark",
    "year": 1899,
    "education": [
        "Privat teaterstudium og rollelesning hos skuespilleren Lucie Wolf",
        "Debut ved Christiania Theater som Hermina i En hovmester, 1886",
        "Ensembleutvikling ved Christiania Theater, Nationaltheatret og Fahlstrøms Theater"
    ],
    "materials": ["stemmeføring", "dialogrytme", "kroppsarbeid", "kostymespill", "ensemblearbeid", "stumfilmspill"],
    "themes": ["sterke kvinneskikkelser", "Ibsens kvinneroller", "Strindbergs familiekonflikter", "samtidsdramatikk", "karakterkomedie", "lang scenisk kontinuitet"],
    "works": [
        {"id": "en_hovmester_1886", "title": "En hovmester", "year": 1886, "material": "skuespillerarbeid", "place": "Christiania Theater", "summary": "Debut som Hermina under kunstnernavnet Ragna Rynning."},
        {"id": "fru_inger_wettergreen", "title": "Fru Inger til Østråt", "year": "før 1934", "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "En av hennes sentrale Ibsen-tittelroller."},
        {"id": "hedda_gabler_wettergreen", "title": "Hedda Gabler", "year": "før 1934", "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Tittelrolle i Ibsens moderne karakterdrama."},
        {"id": "vildanden_wettergreen", "title": "Vildanden", "year": "før 1934", "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Gina Ekdal ble regnet som en av hennes mest gripende og presise Ibsen-tolkninger."},
        {"id": "rosmersholm_wettergreen", "title": "Rosmersholm", "year": "før 1934", "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Rebekka West i et spill preget av temperament og nyansert teknikk."},
        {"id": "samfundets_stotter_1916", "title": "Samfundets støtter", "year": 1916, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Spilte Lona Hessel mot Egil Eides Karsten Bernick."},
        {"id": "faderen_1931_wettergreen", "title": "Faderen", "year": 1931, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Laura i Strindbergs intense ekteskaps- og maktdrama."},
        {"id": "eventyret_wettergreen", "title": "Eventyret", "year": "1915–1954", "material": "skuespillerarbeid", "place": "Nationaltheatret og Den Nationale Scene", "summary": "Glansrollen som bestemoren ble gjenopptatt i høy alder og spilt for fulle hus over to sesonger."}
    ],
    "popupDesc": "Ragna Marie Wettergreen ble født i Christiania 19. september 1864 og døde i Oslo 27. juni 1958. Hun studerte privat hos Lucie Wolf og debuterte ved Christiania Theater i 1886 under navnet Ragna Rynning. Da teatret ble nedlagt i 1899, fulgte hun ensemblet over til Nationaltheatret.\n\nWettergreen utviklet seg til en sterk karakterskuespiller med særlig tyngde i Ibsen og Strindberg. Hun spilte blant annet Fru Inger, Hedda Gabler, Rebekka West, Gina Ekdal og Laura i Faderen. Samtidig behersket hun lystspill og samtidens komedier. Spillestilen kombinerte temperament og scenisk sjarm med knapp form, tydelig rytme og en evne til å gjøre rollene overraskende levende.\n\nKarrieren ved Nationaltheatret strakte seg fra åpningsåret, via et opphold ved Fahlstrøms Theater, til fast ansettelse frem til 1934 og senere gjestespill. I 1952 vendte hun tilbake, nær 88 år gammel, som bestemoren i Eventyret. Rollen ble en publikumssuksess og bandt teatrets første generasjon sammen med et nytt etterkrigspublikum.",
    "places": ["nationaltheatret"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Ragna Marie Wettergreen", "url": "https://snl.no/Ragna_Marie_Wettergreen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – Ragna Wettergreen", "url": "https://nbl.snl.no/Ragna_Wettergreen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Sceneweb – Ragna Wettergreen", "url": "https://sceneweb.no/nb/artist/19721/Ragna_Wettergreen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Sceneweb – Samfundets støtter (1916)", "url": "https://sceneweb.no/en/production/16414/Pillars_of%20Society", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Ragna_Marie_Wettergreen", "https://nbl.snl.no/Ragna_Wettergreen", "https://sceneweb.no/nb/artist/19721/Ragna_Wettergreen"],
    "verifiedAt": VERIFIED_AT
}

egil = {
    "id": "egil_eide",
    "visual": {"designCode": "person_actor_miniature"},
    "name": "Egil Næss Eide",
    "initials": "ENE",
    "desc": "Lyrisk-dramatisk skuespiller, oppleser og stumfilmregissør som var en bærende kraft ved Nationaltheatret fra 1899.",
    "tags": ["litteratur", "scenekunst", "teater", "skuespiller", "regissor", "ibsen", "bjornson", "shakespeare", "stumfilm", "opplesning", "nationaltheatret"],
    "placeId": "nationaltheatret",
    "category": "litteratur",
    "kindLabel": "Skuespiller / lyrisk drama og stumfilm",
    "birth_date": "1868-08-24",
    "death_date": "1946-12-13",
    "birth_place": "Haugesund",
    "active_place": "Bergen, Kristiania/Oslo og svensk film",
    "year": 1899,
    "education": [
        "Middelskoleeksamen i Haugesund",
        "Arbeids- og livserfaring i USA før scenedebuten",
        "Debut ved Den Nationale Scene som Axel i Axel og Valborg, 1894"
    ],
    "materials": ["stemme og deklamasjon", "lyrisk-dramatisk spill", "fysisk intensitet", "ensemblearbeid", "stumfilmkamera", "filmregi"],
    "themes": ["Ibsens mannsroller", "Bjørnsons historiske drama", "Shakespeare-tragedie", "lidenskap og fantasi", "opplesningskunst", "teater og tidlig film"],
    "works": [
        {"id": "axel_og_valborg_1894", "title": "Axel og Valborg", "year": 1894, "material": "skuespillerarbeid", "place": "Den Nationale Scene", "summary": "Scenedebut som Axel."},
        {"id": "romeo_1898_eide", "title": "Romeo og Julie", "year": 1898, "material": "skuespillerarbeid", "place": "Christiania Theater", "summary": "Romeo-rollen viste det kraftige naturtalentet før Nationaltheatret åpnet."},
        {"id": "brand_1904_eide", "title": "Brand", "year": 1904, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Spilte tittelrollen ved den norske uroppførelsen av Ibsens drama."},
        {"id": "en_folkefiende_eide", "title": "En folkefiende", "year": "1900-tallet", "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Doktor Stockmann ble en av hans sentrale Ibsen-roller."},
        {"id": "samfundets_stotter_eide", "title": "Samfundets støtter", "year": 1916, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Karsten Bernick mot Ragna Wettergreens Lona Hessel."},
        {"id": "kong_lear_1937_eide", "title": "Kong Lear", "year": 1937, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Sen monumental tittelrolle i Shakespeare-tragedien."},
        {"id": "synnove_solbakken_1919", "title": "Synnøve Solbakken", "year": 1919, "material": "stumfilmspill", "place": "Svensk filmproduksjon", "summary": "Spilte Sæmund Granlien i John Brunius' store kinosuksess."},
        {"id": "fru_bonnets_felsteg_1917", "title": "Fru Bonnets felsteg", "year": 1917, "material": "filmregi", "place": "Sverige", "summary": "En av to stumfilmer Eide regisserte i Sverige."}
    ],
    "popupDesc": "Egil Næss Eide ble født i Haugesund 24. august 1868 og døde der 13. desember 1946. Etter middelskole og noen år i USA debuterte han ved Den Nationale Scene i 1894. Han kom deretter via Fahlstrøms teater og Christiania Theater til Nationaltheatret ved åpningen i 1899.\n\nEide var en av teatrets bærende krefter i nær førti år. Han hadde særlig styrke i lyrisk-dramatiske roller preget av fantasi, lidenskap og stor stemmebruk. Repertoaret spente fra Ibsens Brand og doktor Stockmann til Bjørnsons historiske skikkelser, Strindberg, Schiller og Shakespeare. Han var også en etterspurt oppleser.\n\nKarrieren gikk samtidig mellom scene og film. Eide spilte i flere svenske stumfilmer for sentrale regissører og regisserte selv to filmer i 1917. Profilen viser derfor Nationaltheatret ikke bare som en lukket sceneinstitusjon, men som et knutepunkt mellom dramatikk, opplesningskunst og den tidlige nordiske filmkulturen.",
    "places": ["nationaltheatret"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Egil Næss Eide", "url": "https://snl.no/Egil_N%C3%A6ss_Eide", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – Egil Eide", "url": "https://nbl.snl.no/Egil_Eide", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Sceneweb – Egil Eide", "url": "https://sceneweb.no/nb/artist/33407/Egil_Eide", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Sceneweb – Samfundets støtter (1916)", "url": "https://sceneweb.no/en/production/16414/Pillars_of%20Society", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Egil_N%C3%A6ss_Eide", "https://nbl.snl.no/Egil_Eide", "https://sceneweb.no/nb/artist/33407/Egil_Eide"],
    "verifiedAt": VERIFIED_AT
}

august = {
    "id": "august_oddvar",
    "visual": {"designCode": "person_actor_miniature"},
    "name": "August Oddvar",
    "initials": "AO",
    "desc": "Monumental og intenst stiliserende skuespiller som var knyttet til Nationaltheatret gjennom hele sin seksti år lange karriere.",
    "tags": ["litteratur", "scenekunst", "teater", "skuespiller", "ibsen", "shakespeare", "schiller", "ekspresjonisme", "monumental_spillestil", "nationaltheatret"],
    "placeId": "nationaltheatret",
    "category": "litteratur",
    "kindLabel": "Skuespiller / monumental og stilisert spillestil",
    "birth_date": "1877-08-01",
    "death_date": "1964-03-17",
    "birth_place": "Kristiania",
    "active_place": "Nationaltheatret, Kristiania/Oslo",
    "year": 1899,
    "education": [
        "Typograflære i Kristiania",
        "Teaterskole hos Thora Lundh",
        "Rollelesning og forberedelse med Bjørn Bjørnson før Nationaltheatrets åpning"
    ],
    "materials": ["stemmeføring", "patos og deklamasjon", "stilisert kropp", "monumental gestikk", "ensemblearbeid", "rollefigurens rytme"],
    "themes": ["Ibsens idealister og maktmennesker", "klassisk tragedie", "Shakespeare og Schiller", "ekspresjonistisk teater", "store følelsesregistre", "langvarig institusjonstilhørighet"],
    "works": [
        {"id": "ottar_birting_1899", "title": "Sigurd Jorsalfar", "year": 1899, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Debuterte som Ottar Birting i Nationaltheatrets åpningssesong."},
        {"id": "haabet_1902", "title": "Haabet", "year": 1902, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Gjennombrudd som den unge fiskergutten i Heijermans drama."},
        {"id": "kongsemnerne_oddvar", "title": "Kongsemnerne", "year": "1900-tallet", "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Skule Jarl ble en av hans monumentale Ibsen-skikkelser."},
        {"id": "brand_oddvar", "title": "Brand", "year": 1942, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Spilte tittelrollen i Hans Jacob Nilsens oppsetning under okkupasjonen."},
        {"id": "john_gabriel_borkman_oddvar", "title": "John Gabriel Borkman", "year": 1954, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Sen Ibsen-tittelrolle med konsentrert monumentalitet."},
        {"id": "en_idealist_1949", "title": "En idealist", "year": 1949, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Herodes ved 50-årsjubileet som skuespiller."},
        {"id": "caesar_og_cleopatra_1951", "title": "Cæsar og Kleopatra", "year": 1951, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Tittelrollen som Julius Cæsar i Bernard Shaws drama."},
        {"id": "han_som_sa_nei_1959", "title": "Han som sa nei", "year": 1959, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Oberst Grayson markerte seksti år som aktiv skuespiller."}
    ],
    "popupDesc": "August Martinius Oddvar ble født i Kristiania 1. august 1877 og døde i Oslo 17. mars 1964. Han var i typograflære da han begynte på teaterskole hos Thora Lundh. Bjørn Bjørnson oppdaget ham på en elevmatiné, leste roller med ham og engasjerte ham til Nationaltheatrets åpningssesong i 1899.\n\nOddvar utviklet en særpreget spillestil med intensitet, patos, stilisert kropp og stor scenisk fantasi. Han søkte ikke først og fremst realistiske detaljer, men monumental form. Det gjorde ham særlig egnet til Ibsens idealister og maktmennesker, Shakespeare, Schiller og senere ekspresjonistisk dramatikk. Johanne Dybwad valgte ham fra 1904 som fast motspiller.\n\nHele den seksti år lange karrieren var knyttet til Nationaltheatret. Han gikk fra Ottar Birting i åpningssesongen via Skule, Brand og Borkman til Herodes, Julius Cæsar og obersten i Han som sa nei. Profilen gjør dermed én skuespillerkarriere til et sammenhengende spor gjennom flere epoker i Nationaltheatrets historie.",
    "places": ["nationaltheatret"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – August Oddvar", "url": "https://snl.no/August_Oddvar", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – August Oddvar", "url": "https://nbl.snl.no/August_Oddvar", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Sceneweb – August Oddvar", "url": "https://sceneweb.no/nb/artist/11387/August_Oddvar", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Sceneweb – Brand (1942)", "url": "https://sceneweb.no/nb/production/16713/Brand", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/August_Oddvar", "https://nbl.snl.no/August_Oddvar", "https://sceneweb.no/nb/artist/11387/August_Oddvar"],
    "verifiedAt": VERIFIED_AT
}

write_single(NATIONAL / "agnes_mowinckel.json", agnes)
write_single(NATIONAL / "ragna_wettergreen.json", ragna)
write_single(NATIONAL / "egil_eide.json", egil)
write_single(NATIONAL / "august_oddvar.json", august)

duplicate = Path("data/people/musikk/oslo/det_norske_teatret/agnes_mowinckel_det_norske_teatret.json")
if duplicate.exists():
    duplicate.unlink()

manifest_path = Path("data/people/manifest.json")
manifest = read_json(manifest_path)
duplicate_entry = "people/musikk/oslo/det_norske_teatret/agnes_mowinckel_det_norske_teatret.json"
manifest["files"] = [entry for entry in manifest["files"] if entry != duplicate_entry]
write_json(manifest_path, manifest)


test_path = Path("tests/nationaltheatret-ensemble-people-v2.test.js")
test_path.write_text(r'''const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const TARGETS = [
  ["agnes_mowinckel", "data/people/litteratur/oslo/nationaltheatret/agnes_mowinckel.json", ["R.U.R.", "Tante Ulrikke"]],
  ["ragna_wettergreen", "data/people/litteratur/oslo/nationaltheatret/ragna_wettergreen.json", ["Vildanden", "Eventyret"]],
  ["egil_eide", "data/people/litteratur/oslo/nationaltheatret/egil_eide.json", ["Brand", "Kong Lear"]],
  ["august_oddvar", "data/people/litteratur/oslo/nationaltheatret/august_oddvar.json", ["Sigurd Jorsalfar", "Han som sa nei"]]
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function person(relativePath) {
  const data = readJson(relativePath);
  assert.equal(data.length, 1);
  return data[0];
}

test("Nationaltheatret ensemble batch has four unique canonical identities", () => {
  const manifest = readJson("data/people/manifest.json");
  const found = new Map();
  for (const relative of manifest.files) {
    const file = path.join("data", relative);
    const data = readJson(file);
    for (const entry of Array.isArray(data) ? data : [data]) {
      if (!entry || !TARGETS.some(([id]) => id === entry.id)) continue;
      assert.equal(found.has(entry.id), false, `duplicate canonical person: ${entry.id}`);
      found.set(entry.id, file);
    }
  }
  assert.deepEqual([...found.keys()].sort(), TARGETS.map(([id]) => id).sort());
  assert.equal(manifest.files.some(value => value.includes("agnes_mowinckel_det_norske_teatret")), false);
  assert.equal(fs.existsSync(path.join(ROOT, "data/people/musikk/oslo/det_norske_teatret/agnes_mowinckel_det_norske_teatret.json")), false);
});

test("all four profiles satisfy the complete people-popup contract", () => {
  for (const [id, relativePath, expected] of TARGETS) {
    const entry = person(relativePath);
    assert.equal(entry.id, id);
    assert.equal(entry.placeId, "nationaltheatret");
    assert.ok(entry.places.includes("nationaltheatret"));
    assert.ok(entry.kindLabel.length > 12);
    assert.match(entry.birth_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(entry.death_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(entry.popupDesc.split(/\n\s*\n/).length >= 3);
    assert.ok(entry.education.length >= 3);
    assert.ok(entry.materials.length >= 6);
    assert.ok(entry.themes.length >= 6);
    assert.ok(entry.works.length >= 8);
    assert.ok(entry.externalLinks.length >= 4);
    assert.ok(entry.externalLinks.every(source => source.type === "source" && /^https:\/\//.test(source.url)));
    assert.equal(entry.image, "");
    assert.equal(entry.cardImage, "");
    const serialized = JSON.stringify(entry);
    for (const value of expected) assert.match(serialized, new RegExp(value));
  }
});

test("Agnes Mowinckel carries all three documented Oslo theatre anchors", () => {
  const entry = person(TARGETS[0][1]);
  assert.deepEqual(entry.places, ["nationaltheatret", "det_norske_teatret", "folketeateret"]);
  assert.match(JSON.stringify(entry.works), /Myrkemakti/);
  assert.match(JSON.stringify(entry.works), /Tante Ulrikke/);
});
''', encoding="utf-8")
