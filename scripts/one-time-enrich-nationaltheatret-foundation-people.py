from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERIFIED_AT = "2026-07-26"


def read_json(relative: str):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def write_json(relative: str, data) -> None:
    path = ROOT / relative
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def replace_person(relative: str, person_id: str, replacement: dict) -> None:
    data = read_json(relative)
    rows = data if isinstance(data, list) else [data]
    matches = [index for index, row in enumerate(rows) if isinstance(row, dict) and row.get("id") == person_id]
    if len(matches) != 1:
        raise SystemExit(f"Expected exactly one {person_id} in {relative}, found {len(matches)}")
    old = rows[matches[0]]
    replacement = {**replacement}
    if old.get("visual") and not replacement.get("visual"):
        replacement["visual"] = old["visual"]
    rows[matches[0]] = replacement
    write_json(relative, rows if isinstance(data, list) else rows[0])


henrik_bull = {
    "id": "henrik_bull",
    "visual": {"designCode": "person_architect_miniature"},
    "name": "Henrik Bull",
    "initials": "HB",
    "desc": "Arkitekt og formgiver bak Nationaltheatret, Historisk museum og den første regjeringsbygningen i det moderne Regjeringskvartalet.",
    "tags": [
        "by", "litteratur", "scenekunst", "arkitektur", "jugendstil", "historisme",
        "monumentalarkitektur", "totaldesign", "interiørarkitektur", "kulturminnevern",
        "nationaltheatret", "regjeringskvartalet", "historisk_museum"
    ],
    "placeId": "nationaltheatret",
    "category": "by",
    "kindLabel": "Arkitekt og formgiver",
    "birth_date": "1864-03-28",
    "death_date": "1953-06-02",
    "birth_place": "Christiania (Oslo)",
    "active_place": "Kristiania og Oslo",
    "year": 1899,
    "education": [
        "Hospitant ved Kristiania tekniske skole og elev ved Den kongelige Tegneskole, 1883–1884",
        "Arkitektutdannelse ved Königlich Technische Hochschule i Berlin, 1884–1887",
        "Studier ved Akademie der Künste i Berlin under Johannes Otzen, 1888"
    ],
    "materials": [
        "tegl og mur", "naturstein", "pussete fasader", "tre og utskåret inventar",
        "smijern og metallarbeid", "møbler og integrerte interiører"
    ],
    "themes": [
        "monumentale institusjonsbygg", "jugendstil og art nouveau", "sen historisme",
        "norsk dragestil og byggeskikk", "arkitektur som totaldesign", "byrom og representasjon",
        "kulturminnevern og oppmåling"
    ],
    "works": [
        {
            "id": "nationaltheatret_henrik_bull",
            "title": "Nationaltheatret",
            "year": "1891–1899",
            "material": "mur, naturstein, metall og spesialtegnet interiør",
            "place": "Studenterlunden, Oslo",
            "summary": "Monumentalt teaterbygg som ga den nye nasjonale scenen en tydelig plass i hovedstadens byrom."
        },
        {
            "id": "paulus_kirke_henrik_bull",
            "title": "Paulus kirke",
            "year": "1889–1892",
            "material": "mur og tegl",
            "place": "Grünerløkka, Oslo",
            "summary": "Tidlig nygotisk hovedverk reist etter Bulls førstepremie i arkitektkonkurransen."
        },
        {
            "id": "historisk_museum_henrik_bull",
            "title": "Historisk museum",
            "year": 1901,
            "material": "mur, naturstein og integrert dekor",
            "place": "Tullinløkka, Oslo",
            "summary": "Jugendbygning der monumental museumsarkitektur, ornament og samlingspresentasjon ble tenkt som en helhet."
        },
        {
            "id": "g_blokka_henrik_bull",
            "title": "Den gamle regjeringsbygningen (G-blokka)",
            "year": "1898–1906",
            "material": "naturstein, mur, smijern og spesialtegnet inventar",
            "place": "Regjeringskvartalet, Oslo",
            "summary": "Første etappe i det moderne Regjeringskvartalet og et hovedverk i norsk jugendarkitektur."
        },
        {
            "id": "villa_otium_henrik_bull",
            "title": "Villa Otium",
            "year": "1909–1912",
            "material": "mur, stein, tre og helhetlig interiør",
            "place": "Nobels gate, Oslo",
            "summary": "Monumental privatbolig som regnes som et hovedverk i tidens norske villaarkitektur."
        },
        {
            "id": "jubileumsutstillingen_1914_henrik_bull",
            "title": "Jubileumsutstillingen 1914",
            "year": 1914,
            "material": "midlertidig utstillingsarkitektur, tre, mur og dekor",
            "place": "Frogner, Oslo",
            "summary": "Bull var utstillingens bygningssjef og tegnet blant annet industribygning, maskinhall, bro og maritime anlegg."
        },
        {
            "id": "lohengrin_henrik_bull",
            "title": "Lohengrin-sjokoladen",
            "year": 1911,
            "material": "industridesign og sjokoladeform",
            "place": "Freia, Oslo",
            "summary": "Et lite totaldesignverk der stiliserte roser kombinerte jugendstil og norsk dragestil."
        },
        {
            "id": "centralbanken_henrik_bull",
            "title": "Centralbankens bankpalass",
            "year": "1915–1921",
            "material": "mur og naturstein",
            "place": "Kirkegata, Oslo",
            "summary": "Bull fullførte det monumentale bankanlegget etter Waldemar Hansteen."
        }
    ],
    "popupDesc": "Henrik Bull ble født i Christiania 28. mars 1864 og døde i Oslo 2. juni 1953. Han studerte ved Kristiania tekniske skole og Den kongelige Tegneskole før han fikk sin fulle arkitektutdannelse i Berlin. Impulsene fra tysk murarkitektur, historisme og den nye jugendstilen ble senere blandet med norske material- og håndverkstradisjoner.\n\nBull arbeidet ikke bare med fasader og bygningsvolumer. Han tegnet møbler, lysarmaturer, dørvridere, smijern, ovner, sølvarbeider og industridesign, og behandlet bygningen som et samlet kunstverk. Nationaltheatret, Historisk museum, Regjeringsbygningen og Villa Otium viser hvordan han kunne forene monumental form, ornament og praktisk institusjonsbruk.\n\nNationaltheatret ble tegnet gjennom 1890-årene og åpnet i 1899. Bygningen gjorde den nye nasjonale scenen synlig mellom Karl Johans gate og Studenterlunden, samtidig som sal, foajeer, fasader og dekor ga institusjonen en representativ ramme. Bull knytter derfor teaterets historie direkte til arkitektur, byrom, håndverk og nasjonal kulturbygging.",
    "places": ["nationaltheatret", "universitetsplassen", "regjeringskvartalet", "centralbanken_kirkegata"],
    "image": "bilder/kort/people/henrik_bull.PNG",
    "cardImage": "bilder/kort/people/henrik_bull.PNG",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Henrik Bull", "url": "https://snl.no/Henrik_Bull", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – Henrik Bull", "url": "https://nbl.snl.no/Henrik_Bull_-_1864%E2%80%931953", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk kunstnerleksikon – Henrik Bull", "url": "https://nkl.snl.no/Henrik_Bull", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Nationaltheatret – historien", "url": "https://www.nationaltheatret.no/om-oss/organisasjon/historie/historien-bak-nationaltheatret", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Regjeringen – den gamle regjeringsbygningen", "url": "https://www.regjeringen.no/no/dep/fin/dep/om-den-gamle-regjeringsbygningen-g-blokka/id450008/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oppdag Kvadraturen – Centralbanken", "url": "https://www.oppdagkvadraturen.no/stoppesteder/kirkegata-14-16-18-banpalass-stil-og-arkitektur", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": [
        "https://snl.no/Henrik_Bull",
        "https://nbl.snl.no/Henrik_Bull_-_1864%E2%80%931953",
        "https://nkl.snl.no/Henrik_Bull",
        "https://www.nationaltheatret.no/om-oss/organisasjon/historie/historien-bak-nationaltheatret"
    ],
    "verifiedAt": VERIFIED_AT
}

bjorn_bjornson = {
    "id": "bjorn_bjornson",
    "name": "Bjørn Bjørnson",
    "initials": "BB",
    "desc": "Skuespiller, instruktør, dramatiker og Nationaltheatrets første teatersjef; en hovedkraft bak teaterets reisning og første ensemble.",
    "tags": [
        "litteratur", "scenekunst", "teater", "skuespiller", "regissor", "dramatiker",
        "teatersjef", "institusjonsbygging", "realisme", "ensemble", "folketeater", "nasjonal_scene"
    ],
    "placeId": "nationaltheatret",
    "category": "litteratur",
    "kindLabel": "Skuespiller, instruktør, dramatiker og teatersjef",
    "birth_date": "1859-11-15",
    "death_date": "1942-04-14",
    "birth_place": "Kristiania (Oslo)",
    "active_place": "Kristiania, Oslo og europeiske teaterscener",
    "year": 1899,
    "education": [
        "Scenisk utdannelse i Wien",
        "Debut og ensembletrening ved hertugen av Sachsen-Meiningens selskap, 1880",
        "Ledende instruktør med kunstnerisk hovedansvar ved Christiania Theater, 1885–1893"
    ],
    "materials": [
        "skuespillerarbeid", "regi", "ensembleledelse", "scenearrangement",
        "repertoarbygging", "dramatikk og erindringsprosa"
    ],
    "themes": [
        "realistisk menneskeskildring", "norsk dramatikk", "klassisk og moderne europeisk repertoar",
        "ensemblebygging", "folketeater og publikumsutvikling", "nasjonal institusjonsbygging",
        "teaterledelse mellom kunst og økonomi"
    ],
    "works": [
        {"id": "nationaltheatrets_reisning_bjornson", "title": "Nationaltheatrets reisning og åpning", "year": 1899, "place": "Nationaltheatret, Oslo", "summary": "Ledet det langvarige forarbeidet og forestod innvielsen 1. september 1899."},
        {"id": "forste_sjefsperiode_bjornson", "title": "Første sjefsperiode ved Nationaltheatret", "year": "1899–1907", "place": "Nationaltheatret, Oslo", "summary": "Bygget det nye ensemblet og innledet perioden som senere er blitt kalt norsk teaters gullalder."},
        {"id": "andre_sjefsperiode_bjornson", "title": "Andre sjefsperiode ved Nationaltheatret", "year": "1923–1927", "place": "Nationaltheatret, Oslo", "summary": "Gjenopptok ledelsen, åpnet for eksperimenterende dramatikk og rekrutterte nye skuespillere."},
        {"id": "professor_tygesen_bjornson", "title": "Professor Tygesen i Geografi og kjærlighet", "year": "1880-årene–1929", "place": "Skandinaviske og tyskspråklige scener", "summary": "Signaturrolle han spilte mer enn 200 ganger og avsluttet sin Nationaltheatret-karriere med på 70-årsdagen."},
        {"id": "johanne_bjornson", "title": "Johanne", "year": 1898, "material": "skuespill", "place": "Christiania Theater", "summary": "Drama om kvinnelig selvstendighet som også ble oversatt og oppført i München."},
        {"id": "en_torst_kamel_bjornson", "title": "En tørst kamel", "year": 1919, "material": "lystspill", "place": "Nationaltheatret", "summary": "Bjørnsons største sceniske forfattersuksess, spilt 39 ganger på Nationaltheatret."},
        {"id": "kongsemnerne_regi_bjornson", "title": "Kongsemnerne", "year": 1938, "material": "regi", "place": "Nationaltheatret", "summary": "En av hans siste store iscenesettelser på hovedscenen."},
        {"id": "det_gamle_teater_bjornson", "title": "Det gamle teater", "year": 1937, "material": "erindringsbok", "summary": "Kulturhistoriske minner om teaterkunsten, institusjonene og menneskene han hadde arbeidet med."}
    ],
    "popupDesc": "Bjørn Bjørnson ble født i Kristiania 15. november 1859 og døde i Oslo 14. april 1942. Han fikk scenisk utdannelse i Wien, debuterte ved det berømte Sachsen-Meiningen-ensemblet i 1880 og ble senere ledende instruktør ved Christiania Theater. Der arbeidet han for å erstatte deklamasjon med realistisk menneskeskildring og for å samle skuespill, statisteri og scenebilde til én troverdig helhet.\n\nLivsverket var reisningen av Nationaltheatret. Bjørnson ledet forarbeidet, forestod åpningen 1. september 1899 og var teaterets første sjef frem til 1907. Han smeltet et ungt og uensartet personale sammen til et ensemble, lot Ibsen og Bjørnson danne en norsk grunnstamme og kombinerte dette med klassisk, moderne og europeisk dramatikk, opera og operette. Egne forestillinger for fagforeninger og skoleungdom viser ambisjonen om at hovedscenen også skulle være et folketeater.\n\nHan kom tilbake som teatersjef i 1923–1927 og fortsatte senere som skuespiller og instruktør. Rollen som professor Tygesen i Geografi og kjærlighet ble spilt mer enn 200 ganger, mens skuespill som Johanne og En tørst kamel viser ham som dramatiker. Da nazistene arresterte fire styremedlemmer i 1941, nektet han å gå inn i Nationaltheatret igjen.",
    "places": ["nationaltheatret"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Bjørn Bjørnson", "url": "https://snl.no/Bj%C3%B8rn_Bj%C3%B8rnson", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – Bjørn Bjørnson", "url": "https://nbl.snl.no/Bj%C3%B8rn_Bj%C3%B8rnson", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Nationaltheatret – historie", "url": "https://www.nationaltheatret.no/om-oss/organisasjon/historie/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Nationaltheatrets FOREST – Bjørn Bjørnson", "url": "https://forest.nationaltheatret.no/person/bjorn-bjornson", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Bj%C3%B8rn_Bj%C3%B8rnson", "https://nbl.snl.no/Bj%C3%B8rn_Bj%C3%B8rnson", "https://www.nationaltheatret.no/om-oss/organisasjon/historie/"],
    "verifiedAt": VERIFIED_AT
}

johanne_dybwad = {
    "id": "johanne_dybwad",
    "name": "Johanne Dybwad",
    "initials": "JD",
    "desc": "Skuespiller og instruktør som preget Nationaltheatret i nær fem tiår og utviklet en scenekunst fra realistisk menneskeskildring til monumental stil.",
    "tags": [
        "litteratur", "scenekunst", "teater", "skuespiller", "regissor", "ibsen",
        "shakespeare", "gresk_tragedie", "realisme", "monumental_stil", "kvinnelig_pioner", "minnekultur"
    ],
    "placeId": "nationaltheatret",
    "category": "litteratur",
    "kindLabel": "Skuespiller og instruktør",
    "birth_date": "1867-08-02",
    "death_date": "1950-03-04",
    "birth_place": "Christiania (Oslo)",
    "active_place": "Bergen, Kristiania, Oslo og nordiske scener",
    "year": 1899,
    "education": [
        "Debut ved Den Nationale Scene under Gunnar Heiberg, 1887",
        "Stort rollerepertoar og kunstnerisk utvikling ved Christiania Theater, 1888–1899",
        "Selvstudier av Ibsen, Shakespeare og europeisk teater, med veiledning fra Bjørn Bjørnson"
    ],
    "materials": [
        "skuespillerkunst", "regi", "stemme og teksttolkning", "bevegelse og dans",
        "ensemblearbeid", "klassisk og moderne dramatikk"
    ],
    "themes": [
        "realistisk menneskeskildring", "monumental spillestil", "Ibsens kvinneskikkelser",
        "gresk tragedie", "Shakespeare", "kvinnelig kunstnerisk autoritet", "europeisk modernisme og ekspresjonisme"
    ],
    "works": [
        {"id": "fanchon_dybwad", "title": "Fanchon i En liden Hex", "year": 1888, "material": "rolle", "place": "Den Nationale Scene og Christiania Theater", "summary": "Gjennombruddsrollen der hennes dans og naturlige spill markerte fremveksten av en ny scenekunstner."},
        {"id": "klara_sang_dybwad", "title": "Klara Sang i Over Ævne I", "year": 1899, "material": "rolle", "place": "Nationaltheatret", "summary": "Den første store seieren hennes på Nationaltheatrets nye scene."},
        {"id": "puck_dybwad", "title": "Puck i En sommernattsdrøm", "year": 1903, "material": "rolle", "place": "Nationaltheatret", "summary": "En fysisk og fantasirik Shakespeare-tolkning kjent for akrobatisk teknikk og spenst."},
        {"id": "anne_pedersdotter_dybwad", "title": "Anne Pedersdotter", "year": "1908–1924", "material": "tittelrolle og regi", "place": "Nationaltheatret", "summary": "En av hennes mest gripende norske rollefigurer, senere også iscenesatt av henne selv."},
        {"id": "medea_dybwad", "title": "Medea", "year": 1918, "material": "rolle og regi", "place": "Nationaltheatret", "summary": "Møte med gresk tragedie og scenograf Oliver Neerland som fikk stor betydning for den monumentale registilen hennes."},
        {"id": "gengangere_dybwad", "title": "Gengangere", "year": 1925, "material": "Fru Alving og regi", "place": "Nationaltheatret", "summary": "Forente hennes modne Ibsen-tolkning med ansvar for hele iscenesettelsen."},
        {"id": "barabbas_dybwad", "title": "Barabbas", "year": 1927, "material": "regi", "place": "Nationaltheatret", "summary": "Nordahl Grieg-oppsetning der impulser fra tysk ekspresjonisme ble synlige."},
        {"id": "mor_aase_dybwad", "title": "Mor Aase i Peer Gynt", "year": "1936–1947", "material": "rolle", "place": "Nationaltheatret og Paris", "summary": "Folkekjær signaturrolle brukt ved Paris-gjestespillet og 60-årsjubileet før avskjeden i 1947."}
    ],
    "popupDesc": "Johanne Dybwad, født Johanne Juell, kom til verden i Christiania 2. august 1867 og døde i Oslo 4. mars 1950. Hun debuterte ved Den Nationale Scene i 1887 og fikk gjennombruddet som Fanchon året etter. På Christiania Theater utviklet hun seg gjennom et stort repertoar, samtidig som hun studerte Ibsen, Shakespeare og utenlandske teaterimpulser på egen hånd.\n\nDa Nationaltheatret åpnet i 1899, var Dybwad allerede en av landets sterkeste scenekunstnere. Hun spilte de fleste av Ibsens store kvinneskikkelser, fra Nora og Rebekka West til fru Alving, Solveig og Mor Aase, men arbeidet også med Bjørnson, Heiberg, Shakespeare, gresk tragedie og moderne europeisk dramatikk. Spillestilen beveget seg fra naturalistisk sannhet mot strengere monumentalitet, uten at den psykologiske intensiteten forsvant.\n\nDybwad satte i scene mer enn førti stykker. Medea, Rosmersholm, Gengangere, Maria Stuart, Barabbas og Vår ære og vår makt viser både klassisk spennvidde og åpenhet for nye europeiske ideer. Hun var knyttet til Nationaltheatret nesten sammenhengende frem til 1947, og statuen foran bygningen gjør forbindelsen mellom kunstneren, institusjonen og byrommet fysisk synlig.",
    "places": ["nationaltheatret"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Johanne Dybwad", "url": "https://snl.no/Johanne_Dybwad", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – Johanne Dybwad", "url": "https://nbl.snl.no/Johanne_Dybwad", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Nationaltheatret – historie", "url": "https://www.nationaltheatret.no/om-oss/organisasjon/historie/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "FOREST – Peer Gynt 1945 og Dybwads jubileum", "url": "https://forest.nationaltheatret.no/produksjon/peer-gynt-19450901", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Johanne_Dybwad", "https://nbl.snl.no/Johanne_Dybwad", "https://www.nationaltheatret.no/om-oss/organisasjon/historie/"],
    "verifiedAt": VERIFIED_AT
}

halfdan_christensen = {
    "id": "halfdan_christensen",
    "name": "Halfdan Christensen",
    "initials": "HC",
    "desc": "Skuespiller, instruktør, dramatiker og teatersjef som ledet Nationaltheatret gjennom en sentral del av gullalderen og senere Fri Norsk Scene i Sverige.",
    "tags": [
        "litteratur", "scenekunst", "teater", "skuespiller", "regissor", "dramatiker",
        "teatersjef", "ibsen", "monumentalrealisme", "sceneteknikk", "fri_norsk_scene", "institusjonsbygging"
    ],
    "placeId": "nationaltheatret",
    "category": "litteratur",
    "kindLabel": "Skuespiller, instruktør, dramatiker og teatersjef",
    "birth_date": "1873-12-12",
    "death_date": "1950-09-17",
    "birth_place": "Porsgrunn",
    "active_place": "Bergen, Kristiania, Oslo og Sverige",
    "year": 1911,
    "education": [
        "Middelskoleeksamen ved Aars og Voss skole",
        "Utdanning ved Kristiania Handelsgymnasium",
        "Studiereise til Danmark og Tyskland, 1894",
        "Skuespillerdebut ved Den Nationale Scene, 1896"
    ],
    "materials": [
        "skuespillerarbeid", "regi", "teaterledelse", "Ibsen-tolkning",
        "scenebilde og monumentalrealisme", "dramatikk og erindringsprosa"
    ],
    "themes": [
        "klassisk repertoar", "norsk og utenlandsk samtidsdramatikk", "psykologisk realisme",
        "monumental scenisk billedvirkning", "sceneteknisk modernisering", "kunstnerisk ledelse under økonomisk press",
        "eksilteater og kulturell motstand"
    ],
    "works": [
        {"id": "nationaltheatret_ensemble_christensen", "title": "Nationaltheatrets første ensemble", "year": 1899, "place": "Nationaltheatret", "summary": "Kom fra Den Nationale Scene ved åpningen og ble en sentral skuespiller i det nye ensemblet."},
        {"id": "ibsen_rollene_christensen", "title": "Osvald, Eilert Løvborg og Peer Gynt", "year": "1899–1900-årene", "material": "roller", "place": "Nationaltheatret", "summary": "Tidlige hovedroller som etablerte ham som lyrisk og psykologisk karakterskuespiller."},
        {"id": "agilulf_den_vise_christensen", "title": "Agilulf den vise", "year": 1909, "material": "regi", "place": "Nationaltheatret", "summary": "Gjorde Christensen til den første norske regissøren som satte opp Hans E. Kincks poetiske dramaer."},
        {"id": "teatersjef_1911_1923_christensen", "title": "Teatersjef ved Nationaltheatret", "year": "1911–1923", "place": "Nationaltheatret", "summary": "Ledet institusjonen gjennom kunstnerisk fremgang, sceneteknisk modernisering og krevende økonomiske år."},
        {"id": "dreiescenen_christensen", "title": "Innføringen av dreiescenen", "year": "1911–1923", "material": "sceneteknisk ledelse", "place": "Nationaltheatret", "summary": "I første sjefsperiode ble en dreiescene installert, slik at teateret kunne følge europeisk sceneteknisk utvikling."},
        {"id": "et_dukkehjem_1923_christensen", "title": "Et dukkehjem", "year": 1923, "material": "regi", "place": "Nationaltheatret", "summary": "Psykologisk og intim Ibsen-iscenesettelse som ble en markant teaterbegivenhet."},
        {"id": "ansiktet_paa_ruten_christensen", "title": "Ansiktet på ruten", "year": 1925, "material": "skuespill, regi og hovedrolle", "place": "Nationaltheatret", "summary": "Christensens største forfattersuksess, iscenesatt av ham selv med ham i hovedrollen."},
        {"id": "fri_norsk_scene_christensen", "title": "Fri Norsk Scene", "year": "1944–1945", "material": "teaterledelse og regi", "place": "Sverige", "summary": "Etablert og ledet med Gerda Ring for norske scenekunstnere i eksil under okkupasjonen."}
    ],
    "popupDesc": "Halfdan Christensen ble født i Porsgrunn 12. desember 1873 og døde i Oslo 17. september 1950. Etter skolegang i Kristiania og en kort bankkarriere reiste han til Danmark og Tyskland for å studere teater. Han debuterte ved Den Nationale Scene i 1896 og ble raskt kjent for stemme, mimikk og et lyrisk, varmt skuespill.\n\nVed Nationaltheatrets åpning i 1899 gikk Christensen inn i det nye ensemblet. Roller som Osvald, Eilert Løvborg og Peer Gynt ble fulgt av et stadig større ansvar som instruktør. Sammen med Johanne Dybwad utviklet han en monumentalrealistisk regi med sterk scenisk billedvirkning. Som teatersjef fra 1911 til 1923 ledet han institusjonen gjennom både kunstnerisk oppgang og økonomisk motgang, og dreiescenen ble installert i denne perioden.\n\nChristensen arbeidet hele livet med Ibsen, klassikere og samtidsdramatikk, men skrev også egne stykker. Ansiktet på ruten ble en stor suksess i 1925. Under okkupasjonen flyktet han og Gerda Ring til Sverige, der han tok initiativ til Fri Norsk Scene og holdt norsk dramatikk levende i eksil. Etter frigjøringen vendte han tilbake til Nationaltheatret med nye regioppgaver.",
    "places": ["nationaltheatret"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Halfdan Christensen", "url": "https://snl.no/Halfdan_Christensen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – Halfdan Christensen", "url": "https://nbl.snl.no/Halfdan_Christensen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Nationaltheatret – historie", "url": "https://www.nationaltheatret.no/om-oss/organisasjon/historie/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Nationaltheatrets FOREST – Halfdan Christensen", "url": "https://forest.nationaltheatret.no/person/halfdan-christensen", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Halfdan_Christensen", "https://nbl.snl.no/Halfdan_Christensen", "https://www.nationaltheatret.no/om-oss/organisasjon/historie/"],
    "verifiedAt": VERIFIED_AT
}

replace_person("data/people/by/oslo/people_by_oslo.json", "henrik_bull", henrik_bull)
replace_person("data/people/litteratur/oslo/nationaltheatret/bjorn_bjornson.json", "bjorn_bjornson", bjorn_bjornson)
replace_person("data/people/litteratur/oslo/nationaltheatret/johanne_dybwad.json", "johanne_dybwad", johanne_dybwad)
replace_person("data/people/litteratur/oslo/nationaltheatret/halfdan_christensen.json", "halfdan_christensen", halfdan_christensen)

manifest_path = "data/people/manifest.json"
manifest = read_json(manifest_path)
duplicate_entry = "people/litteratur/oslo/nationaltheatret/henrik_bull.json"
if duplicate_entry not in manifest.get("files", []):
    raise SystemExit(f"Missing duplicate manifest entry: {duplicate_entry}")
manifest["files"] = [entry for entry in manifest["files"] if entry != duplicate_entry]
write_json(manifest_path, manifest)

duplicate_path = ROOT / "data/people/litteratur/oslo/nationaltheatret/henrik_bull.json"
if not duplicate_path.exists():
    raise SystemExit(f"Missing duplicate file: {duplicate_path}")
duplicate_path.unlink()

print("Enriched Nationaltheatret foundation people and removed duplicate Henrik Bull identity.")
