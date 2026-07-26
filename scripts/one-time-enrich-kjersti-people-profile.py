from __future__ import annotations

import json
from pathlib import Path

people_path = Path("data/people/kunst/oslo/people_kunst_oslo.json")
people = json.loads(people_path.read_text(encoding="utf-8"))

person_index = next(
    (index for index, entry in enumerate(people) if entry.get("id") == "kjersti_wexelsen_goksoyr"),
    None,
)
if person_index is None:
    raise SystemExit("Kjersti Wexelsen Goksøyr was not found in canonical people data")

people[person_index] = {
    "id": "kjersti_wexelsen_goksoyr",
    "name": "Kjersti Wexelsen Goksøyr",
    "initials": "KWG",
    "desc": "Norsk billedhugger kjent for stiliserte menneskefigurer og offentlige utsmykninger i stein og metall; skapte Sigrid Undset-monumentet i Stensparken.",
    "tags": [
        "kunst",
        "historie",
        "billedhugger",
        "offentlig_kunst",
        "offentlig_utsmykking",
        "skulptur",
        "granitt",
        "bronse",
        "menneskefigur",
        "minnekultur",
        "stensparken",
        "sigrid_undset",
    ],
    "placeId": "stensparken",
    "category": "kunst",
    "kindLabel": "Billedhugger / offentlig kunst",
    "birth_date": "1945-12-15",
    "birth_place": "Oslo",
    "active_place": "Nittedal",
    "year": 1991,
    "education": [
        "Statens håndverks- og kunstindustriskole, 1977–1979",
        "Statens kunstakademi, 1979–1984 (Per Palle Storm og Boge Berg)",
    ],
    "materials": [
        "stein",
        "granitt",
        "tre",
        "metall",
        "bronse",
    ],
    "themes": [
        "stiliserte menneskehoder",
        "menneskefigurer",
        "offentlig utsmykking",
        "portrett og monument",
        "minnekultur",
    ],
    "works": [
        {
            "id": "sigrid_undset_monumentet",
            "title": "Sigrid Undset-monumentet",
            "year": "1990–1991",
            "material": "granitt",
            "place": "Stensparken, Oslo",
            "summary": "En rank og stilisert fremstilling av Sigrid Undset, utført i 1990 og avduket i Stensparken i 1991.",
        },
        {
            "id": "skjult",
            "title": "Skjult",
            "year": 1992,
            "material": "svart granitt",
            "place": "Borg videregående skole, Sarpsborg",
            "summary": "Uteskulptur utført som offentlig utsmykning.",
        },
        {
            "id": "stille_fryd",
            "title": "Stille Fryd",
            "year": 1993,
            "material": "stein",
            "place": "Luftforsvarets høgskole, Stavern",
            "summary": "To store steinrelieffer ved inngangen til skoleanlegget.",
        },
        {
            "id": "mot_lyset",
            "title": "Mot lyset",
            "year": 1994,
            "place": "Utenriksdepartementets kunstsamling",
            "summary": "Innkjøpt av Utenriksdepartementet og overrakt Nelson Mandela ved presidentinnsettelsen i 1994.",
        },
        {
            "id": "ufodt_love",
            "title": "Ufødt løve",
            "year": 1995,
            "material": "stein",
            "place": "Suldal kommune",
            "summary": "Uteskulptur utført som offentlig utsmykning.",
        },
        {
            "id": "enhet",
            "title": "Enhet",
            "year": 1997,
            "material": "stein",
            "place": "Erkebispegården, Trondheim",
            "summary": "Uteskulptur laget for Erkebispegårdens historiske anlegg.",
        },
    ],
    "emne_ids": [
        "em_kunst_offentlig_kunst_monumenter",
        "em_kunst_teknologi_og_materialitet",
        "em_kunst_arbeidsformer_og_prosess",
        "em_kunst_sjanger_stil_og_posisjonering",
    ],
    "popupDesc": "Kjersti Wexelsen Goksøyr er en norsk billedhugger, født i Oslo 15. desember 1945 og med virkested i Nittedal. Hun studerte ved Statens håndverks- og kunstindustriskole fra 1977 til 1979 og ved Statens kunstakademi fra 1979 til 1984, blant annet under Per Palle Storm og Boge Berg. Kunstnerskapet er særlig kjent for stiliserte og uttrykksfulle menneskehoder og figurer, utført i materialer som stein, tre, metall og bronse.\n\nI History Go er hun først og fremst knyttet til Sigrid Undset-monumentet i Stensparken. Den ranke granittfiguren ble utført i 1990 og avduket i 1991. Verket kobler billedhuggerkunst til litteraturhistorie, kvinnelig minnekultur og offentlig utsmykking, samtidig som plasseringen gjør skulpturen til en del av parkens daglige byliv.\n\nGoksøyr har også utført en rekke andre offentlige arbeider, blant annet «Skjult» i svart granitt, steinrelieffene «Stille Fryd», «Ufødt løve» og «Enhet». Skulpturen «Mot lyset» ble kjøpt inn av Utenriksdepartementet og overrakt Nelson Mandela da han ble innsatt som president i 1994.",
    "places": [
        "stensparken",
    ],
    "externalLinks": [
        {
            "type": "source",
            "label": "Store norske leksikon – Kjersti Wexelsen Goksøyr",
            "url": "https://snl.no/Kjersti_Wexelsen_Goks%C3%B8yr",
            "verifiedAt": "2026-07-26",
        },
        {
            "type": "source",
            "label": "Norsk kunstnerleksikon – Kjersti Goksøyr",
            "url": "https://nkl.snl.no/Kjersti_Goks%C3%B8yr",
            "verifiedAt": "2026-07-26",
        },
        {
            "type": "source",
            "label": "Kunstnerforbundet – Kjersti Wexelsen Goksøyr",
            "url": "https://kunstnerforbundet.no/kunstnere/110/kjersti-wexelsen-goksoeyr",
            "verifiedAt": "2026-07-26",
        },
        {
            "type": "source",
            "label": "Store norske leksikon – Sigrid Undset",
            "url": "https://snl.no/Sigrid_Undset",
            "verifiedAt": "2026-07-26",
        },
    ],
}

people_path.write_text(
    json.dumps(people, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)

test_path = Path("tests/person-popup-v2.test.js")
test_source = test_path.read_text(encoding="utf-8")
old_block = '''test("renders Kjersti from canonical data without inventing missing works or images", async () => {
  const { window, captured } = createHarness({ hasQuiz: true });
  const people = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "data", "people", "kunst", "oslo", "people_kunst_oslo.json"),
    "utf8"
  ));
  const person = people.find(item => item.id === "kjersti_wexelsen_goksoyr");
  assert.ok(person);

  window.showPersonPopup(person);
  await new Promise(resolve => setImmediate(resolve));

  assert.match(captured.html, /Kjersti Wexelsen Goksøyr/);
  assert.match(captured.html, /Offentlig kunst \/ skulptur/);
  assert.match(captured.html, /1991/);
  assert.match(captured.html, /Om personen/);
  assert.match(captured.html, /Stensparken/);
  assert.match(captured.html, /Temaer/);
  assert.match(captured.html, /Portrett ikke registrert/);
  assert.doesNotMatch(captured.html, /Verk og bidrag/);
  assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
});'''
new_block = '''test("renders the enriched Kjersti profile without requiring a portrait", async () => {
  const { window, captured } = createHarness({ hasQuiz: true });
  const people = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "data", "people", "kunst", "oslo", "people_kunst_oslo.json"),
    "utf8"
  ));
  const person = people.find(item => item.id === "kjersti_wexelsen_goksoyr");
  assert.ok(person);

  window.showPersonPopup(person);
  await new Promise(resolve => setImmediate(resolve));

  assert.match(captured.html, /Kjersti Wexelsen Goksøyr/);
  assert.match(captured.html, /Billedhugger \/ offentlig kunst/);
  assert.match(captured.html, /15\. desember 1945/);
  assert.match(captured.html, /Nittedal/);
  assert.match(captured.html, /Om personen/);
  assert.match(captured.html, /Verk og bidrag/);
  assert.match(captured.html, /Sigrid Undset-monumentet/);
  assert.match(captured.html, /Utdanning og faglig bakgrunn/);
  assert.match(captured.html, /Materialer og uttrykk/);
  assert.match(captured.html, /Stensparken/);
  assert.match(captured.html, /Kilder og videre lesning/);
  assert.match(captured.html, /Portrett ikke registrert/);
  assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
});'''

if old_block not in test_source:
    raise SystemExit("Expected Kjersti popup regression block was not found")

test_path.write_text(test_source.replace(old_block, new_block, 1), encoding="utf-8")
