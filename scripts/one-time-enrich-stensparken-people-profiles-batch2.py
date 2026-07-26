from __future__ import annotations

import json
from pathlib import Path

VERIFIED_AT = "2026-07-26"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def replace_person(path: Path, person_id: str, replacement: dict) -> None:
    people = read_json(path)
    index = next(
        (index for index, entry in enumerate(people) if entry.get("id") == person_id),
        None,
    )
    if index is None:
        raise SystemExit(f"{person_id} was not found in {path}")
    people[index] = replacement
    write_json(path, people)


def upsert_person(path: Path, person_id: str, replacement: dict) -> None:
    people = read_json(path)
    index = next(
        (index for index, entry in enumerate(people) if entry.get("id") == person_id),
        None,
    )
    if index is None:
        people.append(replacement)
    else:
        people[index] = replacement
    write_json(path, people)


history_path = Path("data/people/historie/oslo/people_historie_oslo.json")
art_path = Path("data/people/kunst/oslo/people_kunst_oslo.json")
stensparken_path = Path("data/places/by/oslo/places/stensparken.json")

jo_visdal = {
    "id": "jo_visdal",
    "visual": {
        "designCode": "person_artist_miniature",
    },
    "name": "Jo Visdal",
    "initials": "JV",
    "desc": "Naturalistisk billedhugger og portrettkunstner; utførte Korsfestelsen i Fagerborg kirkes altertavle ved Stensparken.",
    "tags": [
        "kunst",
        "billedhugger",
        "portrettkunst",
        "naturalisme",
        "relieff",
        "tre",
        "bronse",
        "marmor",
        "medaljekunst",
        "myntkunst",
        "stensparken",
        "fagerborg_kirke",
    ],
    "placeId": "stensparken",
    "category": "kunst",
    "kindLabel": "Billedhugger / portrett og relieff",
    "birth_date": "1861-11-02",
    "death_date": "1923-12-26",
    "birth_place": "Vågå",
    "active_place": "Kristiania og Asker",
    "year": 1904,
    "education": [
        "Treskjæring i Vågå og håndverkslære i Kristiania",
        "Den kongelige Tegneskole under Julius Middelthun, omkring 1883–1887",
        "Den kongelige Tegneskole under Oscar Wergeland, 1889–1890",
        "Studieopphold i Paris i 1888 og 1890–1891",
    ],
    "materials": [
        "tre",
        "bronse",
        "marmor",
        "stein",
        "gips",
        "sølv",
    ],
    "themes": [
        "naturalistisk portrett",
        "minnesmerker",
        "karakterstudier",
        "kirkelig relieff",
        "offentlig utsmykking",
        "mynt- og medaljekunst",
    ],
    "works": [
        {
            "id": "edvard_munch_byste",
            "title": "Edvard Munch",
            "year": 1886,
            "material": "bronse",
            "place": "Nasjonalmuseet og MUNCH",
            "summary": "Tidlig portrettbyste med presis naturalistisk modellering og sterk karakteristikk av den unge maleren.",
        },
        {
            "id": "knud_knudsen_byste",
            "title": "Knud Knudsen",
            "year": 1889,
            "material": "marmor og bronse",
            "place": "Nasjonalmuseet og Nationaltheatret",
            "summary": "Portrettbyste som viser Visdals nøkterne og håndverksmessig grundige portrettkunst.",
        },
        {
            "id": "nationaltheatret_gutefigurer",
            "title": "Gutefigurer til Nationaltheatret",
            "year": 1899,
            "material": "stein",
            "place": "Nationaltheatret, Oslo",
            "summary": "Grupper av unge gutter utført som del av teaterbygningens utvendige skulpturprogram.",
        },
        {
            "id": "fagerborg_korsfestelsen",
            "title": "Korsfestelsen",
            "year": 1904,
            "material": "utskåret tre",
            "place": "Fagerborg kirke, Stensparken",
            "summary": "Alterrelieff med den korsfestede Kristus flankert av to tilbedende kvinnefigurer.",
        },
        {
            "id": "haakon_7_myntportrett",
            "title": "Haakon 7 – portrett til mynter",
            "year": 1907,
            "material": "modellert portrettrelieff",
            "place": "Norske mynter",
            "summary": "Kongeportrett modellert til den nye norske myntrekken etter unionsoppløsningen.",
        },
        {
            "id": "carsten_anker_monument",
            "title": "Carsten Anker-monumentet",
            "year": "1913–1914",
            "material": "bronse og stein",
            "place": "Eidsvollsbygningen",
            "summary": "Monumental helfigur foran en høy obelisk, utformet med stram arkitektonisk holdning.",
        },
    ],
    "emne_ids": [
        "em_kunst_offentlig_kunst_monumenter",
        "em_kunst_teknologi_og_materialitet",
        "em_kunst_arbeidsformer_og_prosess",
        "em_kunst_sjanger_stil_og_posisjonering",
    ],
    "popupDesc": "Jo Visdal, egentlig John Visdal, ble født i Vågå 2. november 1861 og døde i Asker 26. desember 1923. Han begynte som treskjærer, kom til Kristiania i 1880 og fikk opplæring ved Den kongelige Tegneskole og gjennom studieopphold i Paris. Håndverket fra treskjæringen ble et grunnlag for en presis og samvittighetsfull naturalisme.\n\nVisdal gjorde sin største innsats som portrettkunstner. Byster og relieffer av blant andre Edvard Munch, Henrik Ibsen, Arne Garborg, Sofie Parelius og ekteparet Jonas og Thomasine Lie viser hvordan han kombinerte likhet, materialbehandling og karakterstudium. Han modellerte også Haakon 7s portrett til norske mynter og utførte Carsten Anker-monumentet ved Eidsvollsbygningen.\n\nVed Stensparken er Visdal knyttet til Fagerborg kirke. Til altertavlen utførte han trerelieffet «Korsfestelsen» i 1904. Verket står sammen med Hagbarth Schytte-Bergs arkitektur og Miksa Róths glassmaleri og gjør kirkerommet til et møte mellom norsk skulptur, europeisk glasskunst, jugendstil og religiøs ikonografi.",
    "places": [
        "stensparken",
    ],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {
            "type": "source",
            "label": "Norsk kunstnerleksikon – Jo Visdal",
            "url": "https://nkl.snl.no/Jo_Visdal",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Store norske leksikon – Jo Visdal",
            "url": "https://snl.no/Jo_Visdal",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Store norske leksikon – Fagerborg kirke",
            "url": "https://snl.no/Fagerborg_kirke",
            "verifiedAt": VERIFIED_AT,
        },
    ],
}

lars_utne = {
    "id": "lars_utne",
    "visual": {
        "designCode": "person_artist_miniature",
    },
    "name": "Lars Utne",
    "initials": "LU",
    "desc": "Billedhugger, bygningsskulptør og lærer; skapte den nyromanske døpefonten i hvit marmor i Fagerborg kirke.",
    "tags": [
        "kunst",
        "billedhugger",
        "bygningsskulptur",
        "monumentalkunst",
        "naturalisme",
        "nybarokk",
        "bronse",
        "marmor",
        "stein",
        "kunstutdanning",
        "stensparken",
        "fagerborg_kirke",
    ],
    "placeId": "stensparken",
    "category": "kunst",
    "kindLabel": "Billedhugger / bygnings- og monumentalskulptur",
    "birth_date": "1862-11-24",
    "death_date": "1922-08-08",
    "birth_place": "Utne, Ullensvang",
    "active_place": "Kristiania, Berlin og Asker",
    "year": 1903,
    "education": [
        "Lære hos treskjæreren Lars Kinsarvik",
        "Den kongelige Tegneskole i Kristiania fra 1880",
        "Studieopphold i Paris",
        "Arbeid og videre læring hos Otto Lessing i Berlin",
    ],
    "materials": [
        "marmor",
        "bronse",
        "granitt",
        "sandstein",
        "kleberstein",
        "gips",
    ],
    "themes": [
        "allegorisk bygningsskulptur",
        "naturalistisk figurstudium",
        "monumental utsmykking",
        "portrettkunst",
        "kunst og arkitektur",
        "skulpturundervisning",
    ],
    "works": [
        {
            "id": "nationaltheatret_skulpturprogram",
            "title": "Skulpturprogrammet på Nationaltheatret",
            "year": "1896–1901",
            "material": "bronse og sandstein",
            "place": "Nationaltheatret, Oslo",
            "summary": "Figurer, ornamenter og gavlgruppen «Sigurd Fåvnesbanes død» integrert i Henrik Bulls teaterbygning.",
        },
        {
            "id": "historisk_museum_dekorasjoner",
            "title": "Dekorative steinarbeider på Historisk museum",
            "year": 1902,
            "material": "stein",
            "place": "Historisk museum, Oslo",
            "summary": "Bygningsintegrert skulptur som binder monumentalkunst til museets fasade.",
        },
        {
            "id": "fagerborg_dopefont",
            "title": "Døpefonten i Fagerborg kirke",
            "year": 1903,
            "material": "hvit marmor",
            "place": "Fagerborg kirke, Stensparken",
            "summary": "Nyromansk døpefont laget til kirkens innvielse og tilpasset det helhetlige kirkeinteriøret.",
        },
        {
            "id": "harald_hardrade_relief",
            "title": "Harald Hardråde",
            "year": 1905,
            "material": "bronserelieff",
            "place": "Harald Hårdrådes plass, Oslo",
            "summary": "Historisk portrettrelieff på bautaen i Gamlebyen.",
        },
        {
            "id": "arbeid_og_fred",
            "title": "Arbeid og Fred",
            "year": 1906,
            "material": "kleberstein",
            "place": "Norges Bank, Bankplassen",
            "summary": "To kolossalfigurer utført som allegorisk skulptur for bankbygningen.",
        },
        {
            "id": "gutten_med_beltet",
            "title": "Gutten med beltet",
            "year": 1915,
            "material": "bronse",
            "place": "Nasjonalmuseet",
            "summary": "Intimskulptur der et naturalistisk kroppsstudium møter enkel, klassisk plastisitet.",
        },
    ],
    "emne_ids": [
        "em_kunst_offentlig_kunst_monumenter",
        "em_kunst_teknologi_og_materialitet",
        "em_kunst_arbeidsformer_og_prosess",
        "em_kunst_sjanger_stil_og_posisjonering",
    ],
    "popupDesc": "Lars Utne ble født på Utne i Ullensvang 24. november 1862 og døde i Asker 8. august 1922. Etter lære hos treskjæreren Lars Kinsarvik kom han til Tegneskolen i Kristiania. Studie- og arbeidsopphold i Paris, København og Berlin ga ham erfaring med europeisk monumentalkunst, og hos Otto Lessing arbeidet han med dekorativ skulptur til store offentlige bygg.\n\nEtter hjemkomsten ble Utne en sentral bygningsskulptør. Han bidro omfattende til Nationaltheatret, Historisk museum, Justisbygningen og Norges Bank. Samtidig laget han portrettbyster, medaljer og mindre skulpturer. «Gutten med beltet» regnes som et hovedverk fordi den kombinerer naturalistisk observasjon med rolig og klassisk form. Som lærer ved Tegneskolen fikk han stor betydning for yngre norske billedhuggere.\n\nI Fagerborg kirke ved Stensparken står Utnes døpefont i hvit marmor. Den nyromanske fonten ble laget til innvielsen i 1903 og inngår i et interiør der skulptur, glassmaleri, trearbeid og arkitektur er utformet som en helhet. Fonten viser hvordan et liturgisk bruksobjekt også kan være materialkunst og bygningsintegrert skulptur.",
    "places": [
        "stensparken",
    ],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {
            "type": "source",
            "label": "Store norske leksikon – Lars Utne",
            "url": "https://snl.no/Lars_Utne",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Norsk kunstnerleksikon – Lars Utne",
            "url": "https://nkl.snl.no/Lars_Utne",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Norsk biografisk leksikon – Lars Utne",
            "url": "https://nbl.snl.no/Lars_Utne",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Oslo byleksikon – Fagerborg kirke",
            "url": "https://oslobyleksikon.no/side/Fagerborg_kirke",
            "verifiedAt": VERIFIED_AT,
        },
    ],
}

miksa_roth = {
    "id": "miksa_roth",
    "visual": {
        "designCode": "person_artist_miniature",
    },
    "name": "Miksa Róth",
    "initials": "MR",
    "desc": "Ungarsk glassmaler og mosaikkunstner, pioner i historisme og secesjon; skapte glassmaleriet over alteret i Fagerborg kirke.",
    "tags": [
        "kunst",
        "glasskunst",
        "glassmaleri",
        "mosaikk",
        "kunsthåndverk",
        "historisme",
        "secesjon",
        "jugendstil",
        "tiffanyglass",
        "middelaldertradisjon",
        "stensparken",
        "fagerborg_kirke",
        "budapest",
    ],
    "placeId": "stensparken",
    "category": "kunst",
    "kindLabel": "Glasskunst / secesjon og mosaikk",
    "birthYear": 1865,
    "deathYear": 1944,
    "birth_place": "Pest, Ungarn",
    "active_place": "Budapest",
    "year": 1903,
    "education": [
        "Opplæring i familiens glassverksted",
        "Internasjonale studiereiser i europeisk glasskunst",
        "Eget verksted i Budapest fra 1885",
    ],
    "materials": [
        "farget glass",
        "blyinnfatning",
        "opalescent glass",
        "Tiffany-glass",
        "glassmosaikk",
        "keramikk og emalje",
    ],
    "themes": [
        "lys og farge i arkitektur",
        "middelalderens glassmaleritradisjon",
        "historisme",
        "ungarsk secesjon",
        "symbolikk og ornament",
        "verksted og kunstnerisk samarbeid",
    ],
    "works": [
        {
            "id": "ungarns_parlament_glass",
            "title": "Glassmalerier i Ungarns parlamentsbygning",
            "year": "1890-årene",
            "material": "farget glass og bly",
            "place": "Budapest",
            "summary": "Monumentale vinduer utført for Imre Steindls nygotiske parlamentsbygning.",
        },
        {
            "id": "fagerborg_oppstandelsen",
            "title": "Oppstandelsen",
            "year": 1903,
            "material": "glassmaleri",
            "place": "Fagerborg kirke, Stensparken",
            "summary": "Stort altervindu med Kristus i mandorla, engel, soldater og gotisk ornamentikk.",
        },
        {
            "id": "zeneakademia_glass",
            "title": "Glassmalerier i Liszt-akademiet",
            "year": "1904–1907",
            "material": "farget glass",
            "place": "Musikkakademiet, Budapest",
            "summary": "Sentrale secesjonsarbeider der glasskunst er integrert i konsertbygningens arkitektur.",
        },
        {
            "id": "gresham_palace_glass",
            "title": "Glassmalerier i Gresham-palasset",
            "year": 1907,
            "material": "farget glass",
            "place": "Budapest",
            "summary": "Dekorative vinduer for forsikringsselskapets secesjonsbygning.",
        },
        {
            "id": "palace_of_culture_targu_mures",
            "title": "Glassmalerier i Kulturpalasset",
            "year": 1907,
            "material": "farget glass",
            "place": "Târgu Mureș, Romania",
            "summary": "Monumentale glassarbeider utviklet i samarbeid med sentrale ungarske kunstnere og arkitekter.",
        },
        {
            "id": "ernst_museum_glass",
            "title": "Glassmalerier i Ernst-museet",
            "year": 1911,
            "material": "farget glass",
            "place": "Budapest",
            "summary": "Secesjonsarbeider utført i samarbeid med maleren József Rippl-Rónai.",
        },
    ],
    "emne_ids": [
        "em_kunst_teknologi_og_materialitet",
        "em_kunst_arbeidsformer_og_prosess",
        "em_kunst_sjanger_stil_og_posisjonering",
        "em_kunst_epoker_og_kunsthistorisk_narrativ",
    ],
    "popupDesc": "Miksa Róth ble født i Pest i 1865 og døde i Budapest i 1944. Han kom fra en familie med lange tradisjoner i glasshåndverk, etablerte eget verksted som tjueåring og utviklet seg til en ledende glassmaler og mosaikkunstner. Verkstedet hans kombinerte håndverkskunnskap, internasjonale impulser og samarbeid med arkitekter og kunstnere.\n\nRóth arbeidet både innen historismen og den ungarske secesjonen. Han videreførte middelalderens forståelse av farget glass, men tok også i bruk opalescent og såkalt Tiffany-glass, nye mosaikkteknikker og moderne ornamentikk. Arbeider fra parlamentsbygningen, Musikkakademiet, Gresham-palasset, Ernst-museet og Kulturpalasset i Târgu Mureș gjorde verkstedet internasjonalt kjent.\n\nFagerborg kirke gir Róth et konkret norsk sted. Det store glassmaleriet over alteret fremstiller oppstandelsen med Kristus i en lysende mandorla. Vinduet ble kjøpt til kirkens innvielse i 1903. Sammen med Jo Visdals alterrelieff og Hagbarth Schytte-Bergs granittarkitektur gjør det Stensparken til et møtested mellom norsk kirkearkitektur og sentraleuropeisk glasskunst.",
    "places": [
        "stensparken",
    ],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {
            "type": "source",
            "label": "Róth Miksa Memorial House – Collection",
            "url": "https://www.rothmuzeum.hu/english/collection/",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Museum of Applied Arts Budapest – Miksa Róth",
            "url": "https://collections.imm.hu/kereses/alkoto/roth-miksa/44910",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Store norske leksikon – Fagerborg kirke",
            "url": "https://snl.no/Fagerborg_kirke",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Hungarian Parliament – Róth Miksa",
            "url": "https://www.parlament.hu/en/web/orszaghaz/konyv-jelzo?_hu_parlament_nemzetfotere_konyvjelzo_KonyvJelzoPortlet_articleId=1030668",
            "verifiedAt": VERIFIED_AT,
        },
    ],
}

jens_bjelke = {
    "id": "jens_bjelke",
    "name": "Jens Bjelke",
    "initials": "JB",
    "desc": "Norges rikes kansler 1614–1659, jurist, forfatter og en av landets største godseiere; Sten gård ved dagens Stensparken var forlenet til ham.",
    "tags": [
        "historie",
        "politikk",
        "adel",
        "kansler",
        "rettsvesen",
        "embetsstat",
        "godseier",
        "lovarbeid",
        "forfatter",
        "nonneseter",
        "sten_gard",
        "stensparken",
        "toyen_hovedgard",
        "den_gamle_krigsskolen",
        "bypale",
        "kvadraturen",
    ],
    "placeId": "toyen_torg",
    "category": "historie",
    "kindLabel": "Kansler / rettsvesen og adelsmakt",
    "birth_date": "1580-02-02",
    "death_date": "1659-11-07",
    "birth_place": "Austrått, Ørland",
    "active_place": "Christiania, Elingård og norske len",
    "year": 1629,
    "education": [
        "Katedralskolen i Trondheim",
        "Universitetet i Rostock fra 1600 – medisin og klassisk verselære",
        "Videre studier ved universitetene i Leipzig og Leiden",
    ],
    "themes": [
        "adel og godseierskap",
        "kanslerembetet og rettsvesenet",
        "forvaltning i Danmark-Norge",
        "lovarbeid og juridisk språk",
        "klostergods og krongods",
        "Christianias bymark og bypaléer",
    ],
    "works": [
        {
            "id": "relation_om_gronland",
            "title": "Relation om Grønland",
            "year": "omkring 1605",
            "summary": "Rimet historisk-topografisk skrift om Grønland og Christian 4.s ekspedisjoner.",
        },
        {
            "id": "een_bon_for_alle_staender",
            "title": "Een Bøn, for alle Stænder sangvis",
            "year": 1622,
            "summary": "Religiøst skrift som viser Bjelkes omfattende virksomhet som forfatter.",
        },
        {
            "id": "lovens_summariske_indhold",
            "title": "Den danske og norske lovs summariske innhold",
            "year": 1634,
            "summary": "Versifisert lovsammendrag med juridisk ordliste, regnet som den første trykte norske ordboken.",
        },
        {
            "id": "den_gamle_krigsskolen_bypale",
            "title": "Bypaléet i Tollbugata 10",
            "year": "1630-årene",
            "place": "Den gamle Krigsskolen, Oslo",
            "summary": "Bjelke lot den første gården på stedet oppføre som et herskapelig bypalé i Christiania.",
        },
        {
            "id": "bjelkekommisjonen",
            "title": "Bjelkekommisjonen",
            "year": 1632,
            "summary": "Forvaltningsgransking som undersøkte futenes embetsførsel og bidro til reformer i lønn og kontroll.",
        },
        {
            "id": "akershus_arkivarbeid",
            "title": "Registreringen av arkivet på Akershus",
            "year": "1600-tallet",
            "place": "Akershus festning",
            "summary": "Bjelkes brevregistrering bevarte kunnskap om dokumentene fra Værne, Nonneseter og Hovedøya klostre.",
        },
    ],
    "emne_ids": [
        "em_his_stat_institusjoner",
        "em_his_embetsstat_forvaltning",
        "em_his_kongemakt_kirke_konflikt",
    ],
    "popupDesc": "Jens Bjelke ble født på Austrått 2. februar 1580 og døde på Sande i Tune 7. november 1659. Han studerte ved katedralskolen i Trondheim og universitetene i Rostock, Leipzig og Leiden. Etter tjeneste i Danske kanselli ble han i 1614 utnevnt til Norges rikes kansler, et embete han beholdt til sin død. Som kansler var han øverste leder for det norske rettsvesenet.\n\nBjelke deltok i et stort antall kommisjoner og arbeidet med lovgivning, skatter, forsvar og embetskontroll. Lovsammendraget fra 1634 inneholdt en ordliste over juridiske uttrykk som regnes som den første trykte norske ordboken. Han var også en omfattende religiøs og historisk forfatter og en av landets største adelige godseiere.\n\nI Oslo knyttes han til Tøyen hovedgård, bypaléet i Tollbugata 10 og Sten gård ved dagens Stensparken. Sten hadde vært klostergods under Nonneseter og var forlenet til Bjelke da gården ble lagt ut som bymark for Christiania i 1629. Denne forbindelsen gjør Stensparken til et spor etter klostergods, krongods, adelsmakt og byens tidlige arealpolitikk.",
    "places": [
        "toyen_torg",
        "den_gamle_krigsskolen",
        "stensparken",
    ],
    "image": "bilder/kort/people/jens_bjelke.PNG",
    "cardImage": "bilder/kort/people/jens_bjelke.PNG",
    "externalLinks": [
        {
            "type": "source",
            "label": "Store norske leksikon – Jens Bjelke",
            "url": "https://snl.no/Jens_Bjelke",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Oslo byleksikon – Sten gård",
            "url": "https://oslobyleksikon.no/side/Sten_g%C3%A5rd",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Oppdag Kvadraturen – Den gamle Krigsskolen",
            "url": "https://www.oppdagkvadraturen.no/stoppesteder/den-gamle-krigsskolen",
            "verifiedAt": VERIFIED_AT,
        },
    ],
    "source_urls": [
        "https://snl.no/Jens_Bjelke",
        "https://oslobyleksikon.no/side/Sten_g%C3%A5rd",
        "https://www.oppdagkvadraturen.no/stoppesteder/den-gamle-krigsskolen",
    ],
    "verifiedAt": VERIFIED_AT,
}

replace_person(history_path, "jens_bjelke", jens_bjelke)
upsert_person(art_path, "jo_visdal", jo_visdal)
upsert_person(art_path, "lars_utne", lars_utne)
upsert_person(art_path, "miksa_roth", miksa_roth)

stensparken = read_json(stensparken_path)
seeds = stensparken.get("people_relations_seed", [])
replaced_roth = False
for seed in seeds:
    if seed.get("person_id") == "max_roth":
        seed["person_id"] = "miksa_roth"
        replaced_roth = True
if not replaced_roth and not any(seed.get("person_id") == "miksa_roth" for seed in seeds):
    raise SystemExit("Expected Max/Miksa Róth relation seed was not found")
write_json(stensparken_path, stensparken)

profiles_test = Path("tests/stensparken-people-profiles-batch2.test.js")
profiles_test.write_text(
    '''const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const TARGETS = [
  {
    id: "jo_visdal",
    file: "data/people/kunst/oslo/people_kunst_oslo.json",
    works: 6,
    sources: 3,
    expected: ["Korsfestelsen", "1904", "Fagerborg kirke"]
  },
  {
    id: "lars_utne",
    file: "data/people/kunst/oslo/people_kunst_oslo.json",
    works: 6,
    sources: 4,
    expected: ["Døpefonten i Fagerborg kirke", "hvit marmor", "Gutten med beltet"]
  },
  {
    id: "miksa_roth",
    file: "data/people/kunst/oslo/people_kunst_oslo.json",
    works: 6,
    sources: 4,
    expected: ["Oppstandelsen", "Pest", "secesjon"]
  },
  {
    id: "jens_bjelke",
    file: "data/people/historie/oslo/people_historie_oslo.json",
    works: 6,
    sources: 3,
    expected: ["Norges rikes kansler", "Sten gård", "1629"]
  }
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function getPerson(target) {
  return readJson(target.file).find(entry => entry.id === target.id);
}

test("Stensparken batch 2 contains four unique canonical people profiles", () => {
  const manifest = readJson("data/people/manifest.json");
  const seen = new Map();
  for (const relative of manifest.files) {
    const file = path.join("data", relative);
    const data = readJson(file);
    const entries = Array.isArray(data) ? data : [data];
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") continue;
      if (!TARGETS.some(target => target.id === entry.id)) continue;
      assert.equal(seen.has(entry.id), false, `duplicate canonical person: ${entry.id}`);
      seen.set(entry.id, file);
    }
  }
  assert.deepEqual([...seen.keys()].sort(), TARGETS.map(target => target.id).sort());
});

test("each batch 2 profile has rich popup data, works, places and inspectable sources", () => {
  for (const target of TARGETS) {
    const person = getPerson(target);
    assert.ok(person, `${target.id} missing from ${target.file}`);
    assert.ok(person.places.includes("stensparken"));
    assert.ok(String(person.popupDesc || "").split(/\\n\\s*\\n/).length >= 3);
    assert.ok(Array.isArray(person.works) && person.works.length >= target.works);
    assert.ok(Array.isArray(person.themes) && person.themes.length >= 5);
    assert.ok(Array.isArray(person.externalLinks) && person.externalLinks.length >= target.sources);
    assert.ok(person.externalLinks.every(source => /^https:\\/\\//.test(source.url)));
    const serialized = JSON.stringify(person);
    for (const value of target.expected) assert.match(serialized, new RegExp(value));
  }
});

test("the incorrect Max Roth seed is migrated to canonical Miksa Róth", () => {
  const stensparken = readJson("data/places/by/oslo/places/stensparken.json");
  const seeds = stensparken.people_relations_seed || [];
  assert.equal(seeds.some(seed => seed.person_id === "max_roth"), false);
  assert.equal(seeds.some(seed => seed.person_id === "miksa_roth" && seed.work === "glassmaleri"), true);
  const person = getPerson(TARGETS.find(target => target.id === "miksa_roth"));
  assert.equal(person.name, "Miksa Róth");
  assert.equal(person.initials, "MR");
  assert.equal(person.image, "");
  assert.equal(person.cardImage, "");
});

test("Jens Bjelke keeps Tøyen as primary place while gaining the Sten farm relation", () => {
  const person = getPerson(TARGETS.find(target => target.id === "jens_bjelke"));
  assert.equal(person.placeId, "toyen_torg");
  assert.ok(person.places.includes("den_gamle_krigsskolen"));
  assert.ok(person.places.includes("stensparken"));
  assert.equal(person.birth_date, "1580-02-02");
  assert.equal(person.death_date, "1659-11-07");
});
''',
    encoding="utf-8",
)

popup_test_path = Path("tests/person-popup-v2.test.js")
popup_source = popup_test_path.read_text(encoding="utf-8")
marker = 'test("removes quiz action and empty sections when data is absent", async () => {'
if marker not in popup_source:
    raise SystemExit("Expected person popup insertion marker was not found")

popup_batch_test = '''test("renders the second Stensparken batch as rich people profiles", async () => {
  const targets = [
    ["data/people/kunst/oslo/people_kunst_oslo.json", "jo_visdal"],
    ["data/people/kunst/oslo/people_kunst_oslo.json", "lars_utne"],
    ["data/people/kunst/oslo/people_kunst_oslo.json", "miksa_roth"],
    ["data/people/historie/oslo/people_historie_oslo.json", "jens_bjelke"]
  ];

  for (const [relativePath, personId] of targets) {
    const { window, captured } = createHarness({ hasQuiz: true });
    const people = JSON.parse(fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8"));
    const person = people.find(item => item.id === personId);
    assert.ok(person, personId);

    window.showPersonPopup(person);
    await new Promise(resolve => setImmediate(resolve));

    assert.match(captured.html, new RegExp(person.name));
    assert.match(captured.html, /Verk og bidrag/);
    assert.match(captured.html, /Stensparken/);
    assert.match(captured.html, /Kilder og videre lesning/);
    assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
  }
});

'''

if 'renders the second Stensparken batch as rich people profiles' not in popup_source:
    popup_source = popup_source.replace(marker, popup_batch_test + marker, 1)
    popup_test_path.write_text(popup_source, encoding="utf-8")
