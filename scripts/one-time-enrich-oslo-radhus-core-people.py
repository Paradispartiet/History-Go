from __future__ import annotations

import json
from pathlib import Path

VERIFIED_AT = "2026-07-26"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def replace_person(path: Path, person_id: str, replacement: dict) -> None:
    people = read_json(path)
    index = next((i for i, entry in enumerate(people) if entry.get("id") == person_id), None)
    if index is None:
        raise SystemExit(f"{person_id} was not found in {path}")
    people[index] = replacement
    write_json(path, people)


by_path = Path("data/people/by/oslo/people_by_oslo.json")
art_path = Path("data/people/kunst/oslo/people_kunst_oslo.json")

arnstein_arneberg = {
    "id": "arnstein_arneberg",
    "visual": {"designCode": "person_architect_miniature"},
    "name": "Arnstein Arneberg",
    "initials": "AA",
    "desc": "Norsk arkitekt som formet Oslo rådhus sammen med Magnus Poulsson og skapte monumentale bygg, restaureringer og offentlige interiører.",
    "tags": [
        "by", "arkitektur", "offentlig_arkitektur", "monumentalarkitektur",
        "nasjonalromantikk", "nybarokk", "restaurering", "interiørarkitektur",
        "materialkunst", "oslo_radhus", "vikingskipshuset", "akershus_slott"
    ],
    "placeId": "oslo_radhus",
    "category": "by",
    "kindLabel": "Arkitekt / monumental offentlig arkitektur",
    "birth_date": "1882-07-06",
    "death_date": "1961-06-09",
    "birth_place": "Fredrikshald (Halden)",
    "active_place": "Oslo og Østlandet",
    "year": 1950,
    "education": [
        "Den kongelige Tegneskole under Herman Major Schirmer, 1899–1902",
        "Kungliga Tekniska Högskolan i Stockholm, 1904–1906",
        "Assistent hos Erik Lallerstedt i Stockholm, 1906–1907"
    ],
    "materials": ["tegl", "naturstein", "tre", "pusset mur", "bronse", "edle interiørmaterialer"],
    "themes": [
        "nasjonalt forankret arkitektur", "monumentale offentlige bygg", "arkitektur og billedkunst",
        "restaurering og kulturminnevern", "representasjonsrom", "nordisk renessanse og barokk"
    ],
    "works": [
        {
            "id": "oslo_radhus_arneberg",
            "title": "Oslo rådhus",
            "year": "1916–1950",
            "material": "tegl, naturstein, tre, metall og kunstintegrerte interiører",
            "place": "Oslo",
            "summary": "Tegnet sammen med Magnus Poulsson gjennom en lang prosess fra konkurranseutkast til ferdig rådhus."
        },
        {
            "id": "telegrafbygningen_arneberg",
            "title": "Telegrafbygningen",
            "year": "1916–1924",
            "material": "labradorstein, tegl og integrert kunst",
            "place": "Kongens gate, Oslo",
            "summary": "Monumentalt kommunikasjonsbygg tegnet med Poulsson, med tett samspill mellom arkitektur og utsmykning."
        },
        {
            "id": "vikingskipshuset",
            "title": "Vikingskipshuset",
            "year": "1914–1932",
            "material": "pusset mur og tre",
            "place": "Bygdøy, Oslo",
            "summary": "Museumsbygning som gir de historiske skipene en dramatisk og presis arkitektonisk ramme."
        },
        {
            "id": "skaugum",
            "title": "Skaugum",
            "year": "1930–1932",
            "material": "pusset mur og tre",
            "place": "Asker",
            "summary": "Gjenoppført for kronprinsparet i et forenklet og mer moderne formspråk etter brann."
        },
        {
            "id": "akershus_slott_restaurering",
            "title": "Restaureringen av Akershus slott",
            "year": "1938–1955",
            "material": "stein, tre og historiske interiørmaterialer",
            "place": "Akershus festning, Oslo",
            "summary": "Omfattende restaurering, nyinnredning av Slottskirken og utforming av Det kongelige gravkapell."
        },
        {
            "id": "fn_sikkerhetsradssal",
            "title": "FNs sikkerhetsrådssal",
            "year": 1950,
            "material": "tre, tekstil, metall og spesialtegnede møbler",
            "place": "FN-bygningen, New York",
            "summary": "Helhetlig interiør der møbler, materialer og kunst gir rommet en tydelig norsk identitet."
        },
        {
            "id": "elsero",
            "title": "Elsero",
            "year": "1918–1922",
            "material": "pusset mur",
            "place": "Madserud, Oslo",
            "summary": "Villa med stram komposisjon, renessansepreg og nært samspill mellom bolig og hage."
        }
    ],
    "popupDesc": "Arnstein Rynning Arneberg ble født i Fredrikshald 6. juli 1882 og døde på Biri 9. juni 1961. Han studerte ved Den kongelige Tegneskole i Kristiania og Kungliga Tekniska Högskolan i Stockholm. Studiene av eldre norsk trearkitektur og nordiske renessanse- og barokkformer ble et varig grunnlag for arkitekturen hans.\n\nArneberg tegnet villaer, kirker, museer og offentlige institusjoner, og arbeidet også omfattende med restaurering og interiør. Vikingskipshuset, Skaugum, Akershus slott og FNs sikkerhetsrådssal viser bredden: fra historiske bygg og nasjonale monumenter til moderne diplomatisk representasjon. Han la stor vekt på håndverk, materialvirkning og samarbeid med billedkunstnere.\n\nOslo rådhus ble livsverket han delte med Magnus Poulsson. De vant konkurransen i 1918 etter et første utkast i 1916, og bearbeidet bygningen gjennom skiftende stilperioder frem til åpningen i 1950. Rådhuset samler monumental teglarkitektur, byplan, kunst, politisk representasjon og hverdagslig kommunal bruk i ett helhetlig verk.",
    "places": ["oslo_radhus", "eidsvolls_plass"],
    "image": "bilder/kort/people/arnstein_arneberg.PNG",
    "cardImage": "bilder/kort/people/arnstein_arneberg.PNG",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Arnstein Arneberg", "url": "https://snl.no/Arnstein_Arneberg", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – Arnstein Arneberg", "url": "https://nbl.snl.no/Arnstein_Arneberg", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk kunstnerleksikon – Arnstein Rynning Arneberg", "url": "https://nkl.snl.no/Arnstein_Rynning_Arneberg", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Store norske leksikon – Oslo rådhus", "url": "https://snl.no/Oslo_r%C3%A5dhus", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Arnstein_Arneberg", "https://nbl.snl.no/Arnstein_Arneberg", "https://snl.no/Oslo_r%C3%A5dhus"]
}

magnus_poulsson = {
    "id": "magnus_poulsson",
    "visual": {"designCode": "person_architect_miniature"},
    "name": "Magnus Poulsson",
    "initials": "MP",
    "desc": "Arkitekt som forente norsk byggeskikk, kraftig materialbruk og moderne funksjoner; skapte Oslo rådhus sammen med Arnstein Arneberg.",
    "tags": [
        "by", "arkitektur", "offentlig_arkitektur", "boligbygging", "hageby",
        "nasjonalromantikk", "nybarokk", "funksjonalisme", "trearkitektur",
        "kulturminnevern", "oslo_radhus", "voienvolden", "hoyres_hus"
    ],
    "placeId": "oslo_radhus",
    "category": "by",
    "kindLabel": "Arkitekt / norsk byggeskikk og rådhus",
    "birth_date": "1881-07-14",
    "death_date": "1958-03-18",
    "birth_place": "Drammen",
    "active_place": "Kristiania, Oslo og Bærum",
    "year": 1950,
    "education": [
        "Den kongelige Kunst- og Haandværksskole i Kristiania, 1900–1903",
        "Kungliga Tekniska Högskolan i Stockholm, 1903–1905",
        "Assistent hos Carl Westman, 1905–1909"
    ],
    "materials": ["laftet tømmer", "tegl", "labradorstein", "huggen naturstein", "bronse", "smijern"],
    "themes": [
        "norsk byggeskikk", "stedstilpasning og landskap", "arbeiderboliger og hageby",
        "monumentale offentlige bygg", "antikvarisk arbeid", "nasjonal funksjonalisme"
    ],
    "works": [
        {
            "id": "oslo_radhus_poulsson",
            "title": "Oslo rådhus",
            "year": "1916–1950",
            "material": "tegl, naturstein, metall og kunstintegrerte interiører",
            "place": "Oslo",
            "summary": "Livsverk tegnet sammen med Arnstein Arneberg, utviklet fra nasjonalromantisk konkurranseutkast til monumentalt moderne rådhus."
        },
        {
            "id": "lille_toyen_hageby",
            "title": "Lille Tøyen hageby",
            "year": "1916–1922",
            "material": "tre og mur",
            "place": "Oslo",
            "summary": "Arbeiderboliger organisert som et helhetlig hagebymiljø med småskala gater og grønne rom."
        },
        {
            "id": "telegrafbygningen_poulsson",
            "title": "Telegrafbygningen",
            "year": "1916–1924",
            "material": "labradorstein og tegl",
            "place": "Oslo",
            "summary": "Nordisk nybarokt kommunikasjonsbygg tegnet sammen med Arneberg."
        },
        {
            "id": "voienvolden_ombygging",
            "title": "Ombyggingen av Vøienvolden",
            "year": 1917,
            "material": "tre",
            "place": "Sagene, Oslo",
            "summary": "Tilpasset den historiske gården til ny bruk med respekt for eldre bygningsstruktur."
        },
        {
            "id": "baerum_radhus",
            "title": "Bærum rådhus",
            "year": "1925–1926, utvidet 1958",
            "material": "hvitpusset tegl, naturstein og bronse",
            "place": "Sandvika",
            "summary": "Rådhus med kraftig tårn og ornamentikk som knytter lokal administrasjon til monumental arkitektur."
        },
        {
            "id": "hoyres_hus",
            "title": "Høyres Hus",
            "year": "1934–1935",
            "material": "mur, stein og metall",
            "place": "Stortingsgata, Oslo",
            "summary": "Parti- og kontorbygg i et strammere mellomkrigsformspråk."
        },
        {
            "id": "gravberget_kirke",
            "title": "Gravberget kirke",
            "year": 1955,
            "material": "tre",
            "place": "Våler i Solør",
            "summary": "Aldersverk som viderefører Poulssons interesse for værbitt trearkitektur og norsk byggeskikk."
        }
    ],
    "popupDesc": "Magnus Poulsson ble født i Drammen 14. juli 1881 og døde i Asker 18. mars 1958. Han studerte ved Kunst- og håndverksskolen i Kristiania og Kungliga Tekniska Högskolan i Stockholm, før han arbeidet hos Carl Westman. Oppmåling av gamle gårder og nærkontakt med norsk trearkitektur formet synet hans på materialer, landskap og stedstilhørighet.\n\nPoulsson tegnet boliger, hagebyer, gårdsanlegg, rådhus, kontorbygg og kirker. Lille Tøyen hageby viser den sosiale siden av praksisen, mens Bærum rådhus, Høyres Hus og Gravberget kirke viser spennet fra monumental murarkitektur til folkelig trebygging. Ombyggingen av Vøienvolden viser også den antikvariske interessen og evnen til å gi eldre bygg ny bruk.\n\nSamarbeidet med Arnstein Arneberg om Oslo rådhus strakte seg over mer enn tre tiår. Prosjektet endret seg mens arkitekturen gikk fra nasjonalromantikk og nybarokk mot funksjonalisme. Det ferdige rådhuset beholdt Poulssons sans for kraftige volumer, huggen stein, bronse, ornament og historiske motiver, samtidig som det fungerte som en moderne kommunal arbeidsplass.",
    "places": ["oslo_radhus", "voien_gard_voienvolden", "hoyres_hus"],
    "image": "bilder/kort/people/magnus_poulsson.PNG",
    "cardImage": "bilder/kort/people/magnus_poulsson.PNG",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Magnus Poulsson", "url": "https://snl.no/Magnus_Poulsson", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – Magnus Poulsson", "url": "https://nbl.snl.no/Magnus_Poulsson", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk kunstnerleksikon – Magnus Poulsson", "url": "https://nkl.snl.no/Magnus_Poulsson", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Store norske leksikon – Oslo rådhus", "url": "https://snl.no/Oslo_r%C3%A5dhus", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Fortidsminneforeningen – Vøienvolden", "url": "https://fortidsminneforeningen.no/en/museum/voienvolden/", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Magnus_Poulsson", "https://nbl.snl.no/Magnus_Poulsson", "https://snl.no/Oslo_r%C3%A5dhus"],
    "verifiedAt": VERIFIED_AT
}

alf_rolfsen = {
    "id": "alf_rolfsen",
    "visual": {"designCode": "person_artist_miniature"},
    "name": "Alf Rolfsen",
    "initials": "AR",
    "desc": "Maler, grafiker og kunstskribent som gjorde fresken til et arkitektonisk billedspråk; skapte tre store veggpartier i Oslo rådhus.",
    "tags": [
        "kunst", "fresko", "monumentalmaleri", "offentlig_kunst", "arkitektonisk_maleri",
        "grafikk", "portrett", "arbeidsliv", "okkupasjonshistorie", "st_hallvard", "oslo_radhus"
    ],
    "placeId": "oslo_radhus",
    "category": "kunst",
    "kindLabel": "Monumentalmaler / fresko og billedrom",
    "birth_date": "1895-01-28",
    "death_date": "1979-11-10",
    "birth_place": "Kristiania",
    "active_place": "Oslo, Paris og Italia",
    "year": 1950,
    "education": [
        "Kunstakademiet i København under Peter Rostrup Bøyesen, 1913–1916",
        "Studieopphold i Paris, 1919–1920",
        "Senere studiereiser i Frankrike, Italia, Hellas og Spania"
    ],
    "materials": ["fresko på våt kalkpuss", "oljemaling", "fargelitografi", "akvarell", "tegning", "kartong og skisse"],
    "themes": [
        "arbeid og samfunn", "okkupasjon og frigjøring", "byhistorie og symboler",
        "arkitektur og maleri", "figurkomposisjon", "litterær og historisk ikonografi"
    ],
    "works": [
        {"id": "telegrafbygningen_freske", "title": "Telegrafbygningens ekspedisjonshall", "year": 1922, "material": "fresko", "place": "Oslo", "summary": "Tidlig monumentalfrise om telegrafen, arbeid og kommunikasjon gjennom landet."},
        {"id": "laugssalen", "title": "Laugssalen", "year": "1924–1926", "material": "fresko", "place": "Oslo Håndverks- og Industriforening", "summary": "Illusjonistisk billedrom med håndverkere og laug integrert i salens arkitektur."},
        {"id": "vestre_krematorium", "title": "Utsmykningen av Vestre krematorium", "year": "1932–1937", "material": "fresko", "place": "Oslo", "summary": "Livsløpsmotiv og stjernehimmel i et helhetlig samspill mellom arkitektur, sorg og billedfortelling."},
        {"id": "oslo_radhus_rolfsen", "title": "Arbeidets Norge, Okkupasjonsfrisen og St. Hallvard", "year": "1938–1950", "material": "fresko", "place": "Rådhushallen, Oslo", "summary": "Tre monumentale veggpartier om arbeidsliv, krig, frigjøring, byen og byens skytshelgen."},
        {"id": "haugesund_radhus_rolfsen", "title": "Havets rikdommer og Årets gang", "year": "1952–1954", "material": "fresko", "place": "Haugesund rådhus", "summary": "Monumental utsmykning som kobler sjø, natur, næring og tidens syklus."},
        {"id": "kongeteppet", "title": "Kartong til Kongeteppet", "year": 1955, "material": "kartong for billedvev", "place": "Det kongelige slott", "summary": "Forarbeid til et representativt tekstilverk for Slottet."},
        {"id": "peer_gynt_fresken", "title": "Peer Gynt-fresken", "year": 1967, "material": "fresko", "place": "Hansa-salen, Bergen", "summary": "Rolfsens siste freskomaleri, bygget rundt Ibsens litterære figurverden."}
    ],
    "emne_ids": ["em_kunst_offentlig_kunst_monumenter", "em_kunst_epoker_og_kunsthistorisk_narrativ", "em_kunst_teknologi_og_materialitet", "em_kunst_arbeidsformer_og_prosess"],
    "popupDesc": "Alf Rolfsen ble født i Kristiania 28. januar 1895 og døde i Oslo 10. november 1979. Han studerte ved Kunstakademiet i København og videre i Paris. Møtet med kubisme, fransk modernisme og italiensk renessansekunst førte ham mot et arkitektonisk maleri der figurer, symboler og farge ble ordnet etter rommets struktur.\n\nRolfsen arbeidet med fresko, staffelimaleri, grafikk, illustrasjon og kunstteori. Telegrafbygningen, Laugssalen og Vestre krematorium etablerte ham som en ledende monumentalmaler. I freskene kombinerte han naturalistisk tegning med geometrisk organisering og historiske, litterære og sosiale motiver.\n\nI Oslo rådhus dekorerte Rolfsen tre vegger i Rådhushallen. Nordveggen viser arbeidslivet, østveggen følger okkupasjonen og frigjøringen, og vestveggen tolker byen gjennom St. Hallvard og byvåpenet. Verkene gjør hallen til en offentlig billedhistorie om arbeid, krig, frihet og Oslos identitet.",
    "places": ["oslo_radhus"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Alf Rolfsen", "url": "https://snl.no/Alf_Rolfsen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – Alf Rolfsen", "url": "https://nbl.snl.no/Alf_Rolfsen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk kunstnerleksikon – Alf Rolfsen", "url": "https://nkl.snl.no/Alf_Rolfsen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Store norske leksikon – Oslo rådhus", "url": "https://snl.no/Oslo_r%C3%A5dhus", "verifiedAt": VERIFIED_AT}
    ]
}

henrik_sorensen = {
    "id": "henrik_sorensen",
    "visual": {"designCode": "person_artist_miniature"},
    "name": "Henrik Sørensen",
    "initials": "HS",
    "desc": "Ekspressiv maler, monumentalmaler og kulturdebattant; skapte den mer enn 300 kvadratmeter store fondveggen i Oslo rådhus.",
    "tags": [
        "kunst", "maleri", "monumentalmaleri", "offentlig_kunst", "ekspresjonisme",
        "fauvisme", "pasifisme", "arbeidsliv", "natur", "religios_kunst", "oslo_radhus"
    ],
    "placeId": "oslo_radhus",
    "category": "kunst",
    "kindLabel": "Maler / ekspressivt monumentalmaleri",
    "birth_date": "1882-02-12",
    "death_date": "1962-02-24",
    "birth_place": "Fryksände, Sverige",
    "active_place": "Oslo, Holmsbu og Vinje",
    "year": 1950,
    "education": [
        "Handelsskole og arbeid som kontorist på Lillestrøm",
        "Kveldsundervisning ved Den kongelige Tegneskole, 1904 og 1906–1908",
        "Korreksjon hos Harriet Backer, 1906",
        "Elev av Henri Matisse i Paris, 1908–1910"
    ],
    "materials": ["oljemaling", "monumentalmaleri", "tegning", "akvarell", "bokillustrasjon", "skisse og kartong"],
    "themes": [
        "menneske og natur", "tro, lidelse og håp", "krig og pasifisme",
        "arbeid og fellesskap", "Telemark og folkelig kultur", "ekspressivt portrett"
    ],
    "works": [
        {"id": "svartbaekken", "title": "Svartbækken", "year": 1908, "material": "oljemaleri", "place": "Bergen Kunstmuseum", "summary": "Tidlig gjennombruddsverk med en flyktning i skoglandskap og sterk ekspressiv spenning."},
        {"id": "getsemane_golgata", "title": "Getsemane og Golgata", "year": "1921–1925", "material": "oljemaleri", "place": "Nasjonalmuseet", "summary": "Religiøse og menneskelige lidelsesbilder preget av ekspressiv farge og monumental forenkling."},
        {"id": "myllarguten", "title": "Myllarguten", "year": 1926, "material": "oljemaleri", "place": "Holmsbu Billedgalleri", "summary": "Telemarksmotiv der musikk, landskap og folkelig mytestoff smelter sammen."},
        {"id": "drommen_om_den_evige_fred", "title": "Drømmen om den evige fred", "year": 1939, "material": "monumentalmaleri", "place": "FN i Genève", "summary": "Pasifistisk billedvisjon laget for Folkeforbundspalasset."},
        {"id": "oslo_radhus_sorensen", "title": "Arbeid, administrasjon og fest", "year": "1938–1950", "material": "monumentalmaleri", "place": "Rådhushallen, Oslo", "summary": "Mer enn 300 kvadratmeter stor fondvegg om arbeid, fellesskap, bystyre og offentlig fest."},
        {"id": "jodene", "title": "Jødene (Israels folk)", "year": 1943, "material": "oljemaleri", "place": "Holmsbu Billedgalleri", "summary": "Krigsbilde med redselsslagne kvinner, malt under okkupasjonen."},
        {"id": "hamar_domkirke_altertavle", "title": "Altertavlen i Hamar domkirke", "year": 1954, "material": "maleri", "place": "Hamar domkirke", "summary": "Sen kirkelig utsmykning der religiøs symbolikk møter Sørensens ekspressive figurstil."}
    ],
    "emne_ids": ["em_kunst_offentlig_kunst_monumenter", "em_kunst_institusjoner_kanon", "em_kunst_arbeidsformer_og_prosess", "em_kunst_sjanger_stil_og_posisjonering"],
    "popupDesc": "Henrik Ingvar Sørensen ble født i Fryksände i Sverige 12. februar 1882 og døde i Oslo 24. februar 1962. Han vokste opp på Lillestrøm, gikk handelsskole og arbeidet som kontorist før kunstutdanningen tok over. Kveldsundervisning ved Tegneskolen, korreksjon hos Harriet Backer og studier hos Henri Matisse i Paris førte ham inn i et fargesterkt og ekspressivt maleri.\n\nSørensen malte landskap, religiøse scener, portretter, antikrigsbilder og monumentale offentlige verk. Telemark, Holmsbu og menneskets møte med naturen ble gjennomgående motivområder. Som erklært pasifist brukte han også kunsten til å undersøke vold, lidelse og håpet om fred, blant annet i verket for Folkeforbundet i Genève.\n\nFondveggen i Oslo rådhus ble utført fra 1938 til 1950 og dekker mer enn 300 kvadratmeter. Motivet samler arbeid, administrasjon og fest i én monumental offentlig scene. Under okkupasjonen brukte Sørensen atelieret sitt i det uferdige rådhuset til hemmelige samtaler, slik at stedet også knytter kunstnerskapet til krigshistorie og motstand.",
    "places": ["oslo_radhus"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Henrik Sørensen", "url": "https://snl.no/Henrik_S%C3%B8rensen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk biografisk leksikon – Henrik Sørensen", "url": "https://nbl.snl.no/Henrik_S%C3%B8rensen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk kunstnerleksikon – Henrik Sørensen", "url": "https://nkl.snl.no/Henrik_S%C3%B8rensen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Store norske leksikon – Oslo rådhus", "url": "https://snl.no/Oslo_r%C3%A5dhus", "verifiedAt": VERIFIED_AT}
    ]
}

replace_person(by_path, "arnstein_arneberg", arnstein_arneberg)
replace_person(by_path, "magnus_poulsson", magnus_poulsson)
replace_person(art_path, "alf_rolfsen", alf_rolfsen)
replace_person(art_path, "henrik_sorensen", henrik_sorensen)

profiles_test = Path("tests/oslo-radhus-core-people-profiles.test.js")
profiles_test.write_text(r'''const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const TARGETS = [
  { id: "arnstein_arneberg", file: "data/people/by/oslo/people_by_oslo.json", works: 7, sources: 4, expected: ["Vikingskipshuset", "FNs sikkerhetsrådssal"] },
  { id: "magnus_poulsson", file: "data/people/by/oslo/people_by_oslo.json", works: 7, sources: 5, expected: ["Lille Tøyen hageby", "Vøienvolden"] },
  { id: "alf_rolfsen", file: "data/people/kunst/oslo/people_kunst_oslo.json", works: 7, sources: 4, expected: ["Okkupasjonsfrisen", "St. Hallvard"] },
  { id: "henrik_sorensen", file: "data/people/kunst/oslo/people_kunst_oslo.json", works: 7, sources: 4, expected: ["Drømmen om den evige fred", "Arbeid, administrasjon og fest"] }
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}
function getPerson(target) {
  return readJson(target.file).find(entry => entry.id === target.id);
}

test("Oslo rådhus core batch contains four unique canonical profiles", () => {
  const manifest = readJson("data/people/manifest.json");
  const seen = new Map();
  for (const relative of manifest.files) {
    const file = path.join("data", relative);
    const data = readJson(file);
    for (const entry of Array.isArray(data) ? data : [data]) {
      if (!entry || !TARGETS.some(target => target.id === entry.id)) continue;
      assert.equal(seen.has(entry.id), false, `duplicate canonical person: ${entry.id}`);
      seen.set(entry.id, file);
    }
  }
  assert.deepEqual([...seen.keys()].sort(), TARGETS.map(target => target.id).sort());
});

test("each Rådhus profile has rich popup data, works and sources", () => {
  for (const target of TARGETS) {
    const person = getPerson(target);
    assert.ok(person, target.id);
    assert.equal(person.placeId, "oslo_radhus");
    assert.ok(person.places.includes("oslo_radhus"));
    assert.ok(String(person.popupDesc).split(/\n\s*\n/).length >= 3);
    assert.ok(person.works.length >= target.works);
    assert.ok(person.education.length >= 3);
    assert.ok(person.materials.length >= 6);
    assert.ok(person.themes.length >= 6);
    assert.ok(person.externalLinks.length >= target.sources);
    assert.ok(person.externalLinks.every(source => /^https:\/\//.test(source.url)));
    const serialized = JSON.stringify(person);
    for (const value of target.expected) assert.match(serialized, new RegExp(value));
  }
});

test("existing portraits are preserved and missing portraits remain explicit", () => {
  const arneberg = getPerson(TARGETS[0]);
  const poulsson = getPerson(TARGETS[1]);
  const rolfsen = getPerson(TARGETS[2]);
  const sorensen = getPerson(TARGETS[3]);
  assert.equal(arneberg.image, "bilder/kort/people/arnstein_arneberg.PNG");
  assert.equal(poulsson.image, "bilder/kort/people/magnus_poulsson.PNG");
  assert.equal(rolfsen.image, "");
  assert.equal(sorensen.image, "");
});
''', encoding="utf-8")

popup_test_path = Path("tests/person-popup-v2.test.js")
popup_source = popup_test_path.read_text(encoding="utf-8")
marker = 'test("removes quiz action and empty sections when data is absent", async () => {'
if marker not in popup_source:
    raise SystemExit("Expected popup insertion marker not found")

popup_batch_test = r'''test("renders the Oslo rådhus core people as rich profiles", async () => {
  const targets = [
    ["data/people/by/oslo/people_by_oslo.json", "arnstein_arneberg"],
    ["data/people/by/oslo/people_by_oslo.json", "magnus_poulsson"],
    ["data/people/kunst/oslo/people_kunst_oslo.json", "alf_rolfsen"],
    ["data/people/kunst/oslo/people_kunst_oslo.json", "henrik_sorensen"]
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
    assert.match(captured.html, /Oslo rådhus/);
    assert.match(captured.html, /Kilder og videre lesning/);
    assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
  }
});

'''
if 'renders the Oslo rådhus core people as rich profiles' not in popup_source:
    popup_test_path.write_text(popup_source.replace(marker, popup_batch_test + marker, 1), encoding="utf-8")
