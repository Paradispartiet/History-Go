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


by_path = Path("data/people/by/oslo/people_by_oslo.json")
literature_path = Path("data/people/litteratur/oslo/people_litteratur_oslo.json")
art_path = Path("data/people/kunst/oslo/people_kunst_oslo.json")

sigrid_undset = {
    "id": "sigrid_undset",
    "name": "Sigrid Undset",
    "visual": {
        "designCode": "person_writer_miniature",
    },
    "initials": "SU",
    "desc": "Nobelprisvinnende forfatter som forente samtidsskildring, middelalderromaner, tro og psykologisk dybde; minnet i Stensparken gjennom skulpturen fra 1991.",
    "tags": [
        "litteratur",
        "historie",
        "forfatter",
        "nobelpris",
        "historisk_roman",
        "middelalder",
        "kvinneliv",
        "tro",
        "psykologi",
        "minnekultur",
        "stensparken",
        "sigrid_undset_statuen",
        "bjerkebaek",
        "lillehammer",
    ],
    "placeId": "stensparken",
    "category": "litteratur",
    "kindLabel": "Forfatter / historisk roman og minnekultur",
    "birth_date": "1882-05-20",
    "death_date": "1949-06-10",
    "birth_place": "Kalundborg, Danmark",
    "active_place": "Kristiania og Lillehammer",
    "year": 1991,
    "education": [
        "Handelsskole i Kristiania",
    ],
    "themes": [
        "kvinners liv og handlingsrom",
        "middelalderens samfunn",
        "tro, skyld og moral",
        "familie og kjærlighet",
        "psykologisk realisme",
        "historisk kunnskap og fortelling",
    ],
    "works": [
        {
            "id": "fru_marta_oulie",
            "title": "Fru Marta Oulie",
            "year": 1907,
            "summary": "Debutromanen åpner med en kompromissløs bekjennelse og undersøker ekteskap, skyld og kvinnelig selvforståelse.",
        },
        {
            "id": "jenny",
            "title": "Jenny",
            "year": 1911,
            "summary": "Roman om kunstnerliv, kjærlighet, frihet og sosialt press i Kristiania og Roma.",
        },
        {
            "id": "kristin_lavransdatter",
            "title": "Kristin Lavransdatter",
            "year": "1920–1922",
            "summary": "Middelaldertrilogien følger Kristin gjennom kjærlighet, familie, tro og ansvar og ble sentral for Nobelprisen i 1928.",
        },
        {
            "id": "olav_audunsson",
            "title": "Olav Audunssøn",
            "year": "1925–1927",
            "summary": "To romanverk om ære, skyld, ekteskap og liv i norsk middelalder.",
        },
        {
            "id": "gymnadenia",
            "title": "Gymnadenia",
            "year": 1929,
            "summary": "Samtidsroman om Paul Selmers liv, troskrise og søken etter retning.",
        },
        {
            "id": "den_brennende_busk",
            "title": "Den brennende busk",
            "year": 1930,
            "summary": "Fortsettelsen av Paul Selmers historie, med katolsk tro, samvittighet og moderne liv som hovedspørsmål.",
        },
    ],
    "popupDesc": "Sigrid Undset ble født i Kalundborg 20. mai 1882, vokste opp i Kristiania og døde på Lillehammer 10. juni 1949. Etter handelsskole arbeidet hun på kontor mens hun skrev om kveldene. De tidlige romanene undersøkte samtidens kvinneliv, kjærlighet, arbeid og frihet, før hun vendte seg mot historiske romaner med middelalderen som ramme.\n\nI 1928 mottok Undset Nobelprisen i litteratur, særlig for de kraftfulle skildringene av nordisk middelalderliv. «Kristin Lavransdatter» og verkene om Olav Audunssøn kombinerer historisk kunnskap med psykologisk innsikt og spørsmål om tro, skyld, familie og ansvar. Bjerkebæk ved Lillehammer ble hjemmet og arbeidsstedet hennes fra 1919.\n\nStensparken knytter forfatteren tilbake til Oslo. Hun hadde barndomstilknytning til Fagerborg-området, og Kjersti Wexelsen Goksøyrs granittskulptur av Undset ble avduket i parken i 1991. Dermed møtes biografi, litteraturhistorie, kvinnelig minnekultur og offentlig kunst i samme byrom.",
    "places": [
        "stensparken",
        "sigrid_undset_statue",
        "bjerkebaek_undset",
    ],
    "image": "bilder/people/Sigrid_Undset.JPG",
    "externalLinks": [
        {
            "type": "source",
            "label": "Nobel Prize – Sigrid Undset facts",
            "url": "https://www.nobelprize.org/prizes/literature/1928/undset/facts/",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Store norske leksikon – Sigrid Undset",
            "url": "https://snl.no/Sigrid_Undset",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Norsk biografisk leksikon – Sigrid Undset",
            "url": "https://nbl.snl.no/Sigrid_Undset",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Store norske leksikon – Bjerkebæk",
            "url": "https://snl.no/Bjerkeb%C3%A6k",
            "verifiedAt": VERIFIED_AT,
        },
    ],
}

harald_aars = {
    "id": "harald_aars",
    "visual": {
        "designCode": "person_architect_miniature",
    },
    "name": "Harald Aars",
    "initials": "HA",
    "desc": "Arkitekt og byarkitekt i Kristiania/Oslo 1920–1940; tegnet kommunale bygg, boliganlegg og Kjærlighetskarusellen i Stensparken.",
    "tags": [
        "by",
        "arkitektur",
        "historie",
        "byarkitekt",
        "kommunal_arkitektur",
        "boligbygging",
        "offentlig_hygiene",
        "funksjonalisme",
        "nybarokk",
        "skeiv_historie",
        "stensparken",
        "kjaerlighetskarusellen",
    ],
    "placeId": "stensparken",
    "category": "by",
    "kindLabel": "Byarkitekt / offentlig arkitektur",
    "birth_date": "1875-05-31",
    "death_date": "1945-06-04",
    "birth_place": "Christiania",
    "active_place": "Kristiania og Oslo",
    "year": 1937,
    "education": [
        "Kristiania Tekniske Skole, 1895",
        "Royal College of Art, London, 1898",
    ],
    "materials": [
        "tegl",
        "granitt",
        "pusset mur",
        "tre",
    ],
    "themes": [
        "kommunal arkitektur",
        "boligbygging",
        "skoler og offentlige bad",
        "kirker og institusjonsbygg",
        "hverdagsinfrastruktur",
        "nordisk nybarokk og funksjonalisme",
    ],
    "works": [
        {
            "id": "fagerborggata_13",
            "title": "Fagerborggata 13",
            "year": 1911,
            "material": "pusset tegl",
            "place": "Oslo",
            "summary": "Aars' egen bolig, preget av interessen for britisk og norsk boligarkitektur.",
        },
        {
            "id": "pipervikskirken",
            "title": "Pipervikskirken",
            "year": 1911,
            "place": "Oslo",
            "summary": "Kirke i Munkedamsveien som senere mottok Houens fonds diplom; bygningen ble revet i 1959.",
        },
        {
            "id": "lovisenberg_kirke",
            "title": "Lovisenberg kirke",
            "year": 1912,
            "material": "tegl og granitt",
            "place": "Oslo",
            "summary": "Nyromansk kirke med tydelig britisk påvirkning og asymmetrisk tårn.",
        },
        {
            "id": "bislett_bad",
            "title": "Bislett bad",
            "year": "1918–1920",
            "place": "Oslo",
            "summary": "Offentlig badeanlegg tegnet sammen med Lorentz Harboe Ree etter konkurranseseier.",
        },
        {
            "id": "hersleb_skole",
            "title": "Hersleb skole",
            "year": 1922,
            "place": "Oslo",
            "summary": "Kommunalt skolebygg fra den tidlige delen av Aars' periode som byarkitekt.",
        },
        {
            "id": "kjaerlighetskarusellen",
            "title": "Kjærlighetskarusellen",
            "year": 1937,
            "material": "pusset mur og metall",
            "place": "Stensparken, Oslo",
            "summary": "Funksjonalistisk offentlig urinal som senere ble et viktig minnespor i Oslos skeive historie.",
        },
    ],
    "popupDesc": "Harald Aars ble født i Christiania 31. mai 1875 og døde i Oslo 4. juni 1945. Han studerte ved Kristiania Tekniske Skole og Royal College of Art i London. Fra 1904 drev han egen praksis, og fra 1920 til 1940 var han byarkitekt i Kristiania og Oslo med stor innflytelse på kommunale boliger, skoler, bad og andre offentlige bygg.\n\nAars arbeidet i spenningsfeltet mellom britisk steinarkitektur, norsk tretradisjon, nordisk nybarokk og en mer funksjonalistisk kommunal arkitektur. Lovisenberg kirke, Bislett bad, Hersleb skole og flere store boligprosjekter viser bredden i praksisen hans. Han var også sentral i arkitektorganisasjoner og byens offentlige kulturarbeid.\n\nI Stensparken er Aars knyttet til det runde offentlige urinalet fra 1937, senere kjent som Kjærlighetskarusellen. Den lille bygningen viser hvordan hverdagsinfrastruktur kan få stor sosial og historisk betydning. Som møtested for homofile menn ble den del av Oslos skeive historie, og arkitekturen fikk en rolle langt utover den opprinnelige funksjonen.",
    "places": [
        "stensparken",
        "voienvolden",
    ],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {
            "type": "source",
            "label": "Store norske leksikon – Harald Aars",
            "url": "https://snl.no/Harald_Aars",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Norsk biografisk leksikon – Harald Aars",
            "url": "https://nbl.snl.no/Harald_Aars",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Norsk kunstnerleksikon – Harald Aars",
            "url": "https://nkl.snl.no/Harald_Aars",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Oslo kommunes kunstsamling – Kjærlighetskarusellen",
            "url": "https://www.kunstsamlingen.no/aktuelt/kjaerlighetskarusellen-en-kunstinstallasjon-av-per-barclay-vises-i-stensparken",
            "verifiedAt": VERIFIED_AT,
        },
    ],
}

hagbarth_schytte_berg = {
    "id": "hagbarth_schytte_berg",
    "visual": {
        "designCode": "person_architect_miniature",
    },
    "name": "Hagbarth Schytte-Berg",
    "initials": "HSB",
    "desc": "Arkitekt som arbeidet fra historisme og jugend til klassisisme; Fagerborg kirke ved Stensparken regnes som et hovedverk.",
    "tags": [
        "by",
        "arkitektur",
        "historie",
        "kirkearkitektur",
        "historisme",
        "jugendstil",
        "nasjonalromantikk",
        "granitt",
        "gjenreisingsarkitektur",
        "stensparken",
        "fagerborg_kirke",
    ],
    "placeId": "stensparken",
    "category": "by",
    "kindLabel": "Arkitekt / kirke- og byarkitektur",
    "birth_date": "1860-07-25",
    "death_date": "1944-11-13",
    "birth_place": "Buksnes, Lofoten",
    "active_place": "Skien, Kristiania, Ålesund og Trondheim",
    "year": 1903,
    "education": [
        "Trondhjems tekniske læreanstalt, eksamen 1879",
        "Polytechnische Hochschule, Hannover, 1882–1883",
        "Königlich Technische Hochschule, Berlin, kirkearkitektur 1889–1890",
    ],
    "materials": [
        "granitt",
        "tegl",
        "huggen stein",
        "pusset mur",
    ],
    "themes": [
        "kirkearkitektur",
        "historisme og nygotikk",
        "jugendstil",
        "nasjonal byggeskikk",
        "gjenreisingsarkitektur",
        "overgangen mot klassisisme og funksjonalisme",
    ],
    "works": [
        {
            "id": "skien_kirke",
            "title": "Skien kirke",
            "year": "1887–1894",
            "material": "rød glasert tegl",
            "place": "Skien",
            "summary": "Gotisk inspirert basilika oppført etter bybrannen og et tidlig hovedverk i Schytte-Bergs praksis.",
        },
        {
            "id": "skien_radhus",
            "title": "Skien rådhus",
            "year": "1888–1894",
            "place": "Skien",
            "summary": "Monumentalt rådhus tegnet i samarbeid med Peter Lowzow.",
        },
        {
            "id": "fagerborg_kirke",
            "title": "Fagerborg kirke",
            "year": "1900–1903",
            "material": "østfoldgranitt",
            "place": "Stensparken, Oslo",
            "summary": "Asymmetrisk granittkirke med romanske, gotiske og amerikanske huggensteinsforbilder; regnes som et hovedverk.",
        },
        {
            "id": "sagene_folkebad",
            "title": "Sagene folkebad",
            "year": 1903,
            "place": "Oslo",
            "summary": "Offentlig badebygg som kobler arkitektur til helse, hygiene og kommunal infrastruktur.",
        },
        {
            "id": "svaneapoteket",
            "title": "Svaneapoteket",
            "year": 1905,
            "place": "Ålesund",
            "summary": "Jugendbygning fra gjenreisningen etter bybrannen, i dag del av Jugendstilsenteret.",
        },
        {
            "id": "statsarkivet_trondheim",
            "title": "Statsarkivet i Trondheim",
            "year": "1922–1927",
            "material": "granittkledd mur",
            "place": "Trondheim",
            "summary": "Klassisistisk arkivbygning med kompakt form og monumental tyngde.",
        },
    ],
    "popupDesc": "Hagbarth Martin Schytte-Berg ble født i Buksnes i Lofoten 25. juli 1860 og døde i Trondheim 13. november 1944. Han studerte bygningsteknikk i Trondheim, videre i Hannover og senere kirkearkitektur i Berlin. Praksisen hans fulgte store deler av arkitekturens stilutvikling fra slutten av 1800-tallet: historisme, nygotikk, jugendstil, nasjonalromantikk, klassisisme og tidlige funksjonalistiske trekk.\n\nEtter bybrannen i Skien tegnet han blant annet Skien kirke og rådhuset. Senere arbeidet han i Kristiania, under gjenreisningen av Ålesund og i Trondheim. Svaneapoteket i Ålesund og Statsarkivet i Trondheim viser hvordan han tilpasset formspråket til ulike byer, materialer og institusjoner.\n\nFagerborg kirke ved Stensparken ble oppført og vigslet i 1903 og regnes som et hovedverk. Østfoldgranitten, det asymmetriske tårnet og blandingen av romanske, gotiske og amerikanske steinarkitektoniske forbilder gjør kirken til et tydelig landemerke. Gjennom Schytte-Berg blir Stensparken også et sted for arkitekturhistorie og nabolagsidentitet.",
    "places": [
        "stensparken",
    ],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {
            "type": "source",
            "label": "Store norske leksikon – Hagbarth Martin Schytte-Berg",
            "url": "https://snl.no/Hagbarth_Martin_Schytte-Berg",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Norsk biografisk leksikon – Hagbarth Schytte-Berg",
            "url": "https://nbl.snl.no/Hagbarth_Schytte-Berg",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Norsk kunstnerleksikon – Hagbarth Schytte-Berg",
            "url": "https://nkl.snl.no/Hagbarth_Schytte-Berg",
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

per_barclay = {
    "id": "per_barclay",
    "visual": {
        "designCode": "person_artist_miniature",
    },
    "name": "Per Barclay",
    "initials": "PB",
    "desc": "Norsk installasjonskunstner kjent for stedsspesifikke rom, oljerom, fotografi og lysinstallasjonen i Kjærlighetskarusellen.",
    "tags": [
        "kunst",
        "samtidskunst",
        "installasjon",
        "stedsspesifikk_kunst",
        "fotografi",
        "skulptur",
        "oljerom",
        "lysinstallasjon",
        "arkitektur",
        "refleksjon",
        "skeiv_historie",
        "stensparken",
        "kjaerlighetskarusellen",
    ],
    "placeId": "stensparken",
    "category": "kunst",
    "kindLabel": "Installasjonskunst / stedsspesifikk kunst",
    "birthYear": 1955,
    "birth_place": "Oslo",
    "active_place": "Torino og Oslo",
    "year": 2022,
    "education": [
        "Kunsthistorie ved Universitetet i Bergen",
        "Istituto Statale d’Arte, Firenze, 1979–1981",
        "Accademia di Belle Arti, Bologna, 1981–1983",
        "Accademia di Belle Arti, Roma, 1983–1985",
    ],
    "materials": [
        "motorolje",
        "glass",
        "aluminium",
        "stål",
        "lys",
        "fotografi",
    ],
    "themes": [
        "arkitektur og forandret persepsjon",
        "refleksjon og speiling",
        "spenning og sårbarhet",
        "stedsspesifikke rom",
        "natur og kultur",
        "skeiv erindring i offentlig rom",
    ],
    "works": [
        {
            "id": "untitled_1993",
            "title": "Uten tittel",
            "year": 1993,
            "material": "glass, aluminium, motorolje og motoriserte trommer",
            "place": "Nasjonalmuseets samling",
            "summary": "Lukket glasshus over olje med hengende trommer; et rom preget av lyd, spenning og fysisk uro.",
        },
        {
            "id": "oil_rooms",
            "title": "Oljerom / Oil Rooms",
            "year": "1980-årene–",
            "material": "reflekterende væske og arkitektur",
            "summary": "Stedsspesifikke rom der olje eller andre væsker speiler og forandrer opplevelsen av arkitekturen.",
        },
        {
            "id": "house_of_oil_and_water",
            "title": "The House of Oil and Water",
            "year": 2019,
            "place": "Redwood Library & Athenæum, USA",
            "summary": "Installasjon som viderefører undersøkelsen av hus, væske, refleksjon og romlig utrygghet.",
        },
        {
            "id": "kjaerlighetskarusellen_lysinstallasjon",
            "title": "Kjærlighetskarusellen",
            "year": 2022,
            "material": "lysinstallasjon",
            "place": "Stensparken, Oslo",
            "summary": "Stedsspesifikt lysverk i det fredede urinalet, laget for Skeivt kulturår og knyttet til byggets historie som møtested for homofile menn.",
        },
        {
            "id": "soft_sweet_vortex",
            "title": "Soft Sweet Vortex",
            "year": 2023,
            "place": "Henie Onstad Kunstsenter",
            "summary": "Omfattende presentasjon av Barclays installasjoner, skulpturer og fotografiske romarbeider.",
        },
    ],
    "emne_ids": [
        "em_kunst_offentlig_kunst_monumenter",
        "em_kunst_teknologi_og_materialitet",
        "em_kunst_arbeidsformer_og_prosess",
        "em_kunst_sjanger_stil_og_posisjonering",
    ],
    "popupDesc": "Per Barclay er en norsk billedkunstner, født i Oslo i 1955, som bor og arbeider i Torino og Oslo. Han studerte kunsthistorie i Bergen og kunst ved akademier i Firenze, Bologna og Roma. Møtet med italiensk arte povera ble viktig for en praksis som beveger seg mellom skulptur, installasjon og fotografi.\n\nBarclay er særlig kjent for stedsspesifikke oljerom der motorolje eller andre væsker dekker gulvet og speiler arkitekturen. Glass, metall, lyd, lys og fotografi brukes til å gjøre rom vakre, urolige og fysisk tvetydige. Verkene undersøker spenninger mellom beskyttelse og fare, natur og kultur, stillhet og bevegelse.\n\nI 2022 tok Barclay initiativ til restaurering av Kjærlighetskarusellen i Stensparken og laget en temporær lysinstallasjon i bygget under Skeivt kulturår. Oslo kommunes kunstsamling kjøpte det stedsspesifikke verket. Installasjonen løftet frem urinalets historie som møtested for homofile menn og gjorde arkitektur, kunst og skeiv erindring synlig i det offentlige rommet.",
    "places": [
        "stensparken",
    ],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {
            "type": "source",
            "label": "Oslo kommunes kunstsamling – Kjærlighetskarusellen",
            "url": "https://www.kunstsamlingen.no/aktuelt/kjaerlighetskarusellen-en-kunstinstallasjon-av-per-barclay-vises-i-stensparken",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "OSL contemporary – Per Barclay",
            "url": "https://oslcontemporary.com/artists/per-barclay",
            "verifiedAt": VERIFIED_AT,
        },
        {
            "type": "source",
            "label": "Nasjonalmuseet – Per Barclay: Uten tittel",
            "url": "https://www.nasjonalmuseet.no/en/collection/object/MS-04145-1998",
            "verifiedAt": VERIFIED_AT,
        },
    ],
}

replace_person(literature_path, "sigrid_undset", sigrid_undset)
replace_person(by_path, "harald_aars", harald_aars)
replace_person(by_path, "hagbarth_schytte_berg", hagbarth_schytte_berg)
upsert_person(art_path, "per_barclay", per_barclay)

profiles_test = Path("tests/stensparken-people-profiles.test.js")
profiles_test.write_text(
    '''const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const TARGETS = [
  {
    id: "sigrid_undset",
    file: "data/people/litteratur/oslo/people_litteratur_oslo.json",
    works: 6,
    sources: 4,
    expected: ["Kristin Lavransdatter", "Nobel Prize"]
  },
  {
    id: "harald_aars",
    file: "data/people/by/oslo/people_by_oslo.json",
    works: 6,
    sources: 4,
    expected: ["Kjærlighetskarusellen", "Royal College of Art"]
  },
  {
    id: "hagbarth_schytte_berg",
    file: "data/people/by/oslo/people_by_oslo.json",
    works: 6,
    sources: 4,
    expected: ["Fagerborg kirke", "Hannover"]
  },
  {
    id: "per_barclay",
    file: "data/people/kunst/oslo/people_kunst_oslo.json",
    works: 5,
    sources: 3,
    expected: ["Kjærlighetskarusellen", "motorolje"]
  }
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function getPerson(target) {
  return readJson(target.file).find(entry => entry.id === target.id);
}

test("Stensparken batch contains four unique canonical people profiles", () => {
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

test("each Stensparken profile has rich popup data, works and inspectable sources", () => {
  for (const target of TARGETS) {
    const person = getPerson(target);
    assert.ok(person, `${target.id} missing from ${target.file}`);
    assert.equal(person.placeId, "stensparken");
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

test("Per Barclay uses the canonical initial fallback without an invented portrait", () => {
  const person = getPerson(TARGETS.find(target => target.id === "per_barclay"));
  assert.equal(person.initials, "PB");
  assert.equal(person.image, "");
  assert.equal(person.cardImage, "");
  assert.equal(person.birthYear, 1955);
  assert.equal(person.active_place, "Torino og Oslo");
});
''',
    encoding="utf-8",
)

popup_test_path = Path("tests/person-popup-v2.test.js")
popup_source = popup_test_path.read_text(encoding="utf-8")
marker = 'test("removes quiz action and empty sections when data is absent", async () => {'
if marker not in popup_source:
    raise SystemExit("Expected person popup insertion marker was not found")

popup_batch_test = '''test("renders the four Stensparken people as rich profiles", async () => {
  const targets = [
    ["data/people/litteratur/oslo/people_litteratur_oslo.json", "sigrid_undset"],
    ["data/people/by/oslo/people_by_oslo.json", "harald_aars"],
    ["data/people/by/oslo/people_by_oslo.json", "hagbarth_schytte_berg"],
    ["data/people/kunst/oslo/people_kunst_oslo.json", "per_barclay"]
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

if 'renders the four Stensparken people as rich profiles' not in popup_source:
    popup_source = popup_source.replace(marker, popup_batch_test + marker, 1)
    popup_test_path.write_text(popup_source, encoding="utf-8")
