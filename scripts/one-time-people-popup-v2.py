from __future__ import annotations

import json
from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


# Load the V2 renderer immediately after the generic popup runtime.
app_path = Path("js/app.js")
app = app_path.read_text(encoding="utf-8")
load_anchor = '    await safeRun("loadPopupUtils", () => loadScriptOnce("js/ui/popup-utils.js"));'
load_line = '    await safeRun("loadPersonPopupV2", () => loadScriptOnce("js/ui/person-popup-v2.js"));'
if load_line not in app:
    app = replace_once(app, load_anchor, load_anchor + "\n" + load_line, "app person popup loader")
app_path.write_text(app, encoding="utf-8")

# Load dedicated styling after the general popup polish layer.
index_path = Path("index.html")
index = index_path.read_text(encoding="utf-8")
css_anchor = '  <link rel="stylesheet" href="css/popup-polish.css">'
css_line = '  <link rel="stylesheet" href="css/person-popup-v2.css">'
if css_line not in index:
    index = replace_once(index, css_anchor, css_anchor + "\n" + css_line, "index person popup css")
index_path.write_text(index, encoding="utf-8")

# Dedupe source links by URL when both externalLinks and source_urls contain the same source.
runtime_path = Path("js/ui/person-popup-v2.js")
runtime = runtime_path.read_text(encoding="utf-8")
old_dedupe = '      const key = `${entry.url}|${entry.label}`;'
new_dedupe = '      const key = entry.url ? `url:${entry.url}` : `label:${entry.label}`;'
if old_dedupe in runtime:
    runtime = replace_once(runtime, old_dedupe, new_dedupe, "person source dedupe")
runtime_path.write_text(runtime, encoding="utf-8")

# Enrich the person shown in the reported screenshot so the new information surface is real.
people_path = Path("data/people/kunst/oslo/people_kunst_oslo.json")
people = json.loads(people_path.read_text(encoding="utf-8"))
person = next((item for item in people if item.get("id") == "kjersti_wexelsen_goksoyr"), None)
if person is None:
    raise SystemExit("kjersti_wexelsen_goksoyr not found")

person["kindLabel"] = "Billedhugger / offentlig kunst"
person["birth_date"] = "1945-12-15"
person["birth_place"] = "Oslo"
person["active_place"] = "Nittedal"
person["occupation"] = "Billedhugger"
person["education"] = [
    "Statens håndverks- og kunstindustriskole, 1977–1979",
    "Statens kunstakademi, 1979–1984"
]
person["materials"] = ["stein", "tre", "metall", "bronse"]
person["themes"] = [
    "offentlig kunst",
    "portrett",
    "minnekultur",
    "figurativ skulptur",
    "utsmykking"
]
person["works"] = [
    "Sigrid Undset / Styrke, Stensparken (utført 1990, avduket 1991)",
    "Skjult, Borg videregående skole (1992)",
    "Stille Fryd, Luftforsvarets høgskole i Stavern (1993)",
    "Mot lyset, gave til Nelson Mandela (1994)",
    "Ufødt løve, Suldal kommune (1995)",
    "Enhet, Erkebispegården i Trondheim (1997)"
]
person["desc"] = "Norsk billedhugger kjent for stiliserte og uttrykksfulle menneskefigurer i stein og metall. I Oslo er hun særlig knyttet til Sigrid Undset-monumentet i Stensparken, der offentlig kunst, litteraturhistorie og kvinnelig minnekultur møtes."
person["popupDesc"] = (
    "Kjersti Wexelsen Goksøyr er en norsk billedhugger, født i Oslo 15. desember 1945. "
    "Hun studerte ved Statens håndverks- og kunstindustriskole fra 1977 til 1979 og ved Statens kunstakademi fra 1979 til 1984, blant annet under Per Palle Storm og Boge Berg. "
    "Hun arbeider med stein, tre, metall og bronse og er særlig kjent for stiliserte, uttrykksfulle menneskehoder og figurer. Formspråket forenkler kroppen uten å gjøre den anonym: holdning, tyngde og ansiktsform bærer mye av uttrykket.\n\n"
    "I Stensparken står hennes monument over Sigrid Undset. Skulpturen ble utført i 1990 og avduket i 1991. Den ranke granittfiguren fremstiller forfatteren i et forenklet og konsentrert formspråk. Plasseringen gjør verket til mer enn et portrett: det knytter Undsets litterære ettermæle til et byområde hun kjente fra oppveksten, og gir parken et tydelig lag av kvinnelig litteratur- og minnehistorie. I History GO kan spilleren dermed møte både kunstneren, den avbildede forfatteren, materialet og selve parkrommet i samme stedsfortelling.\n\n"
    "Wexelsen Goksøyr har utført en rekke offentlige utsmykninger. Blant arbeidene er Skjult i svart granitt ved Borg videregående skole, steinrelieffene Stille Fryd i Stavern, Ufødt løve i Suldal og Enhet ved Erkebispegården i Trondheim. Skulpturen Mot lyset ble kjøpt inn av Utenriksdepartementet og overrakt Nelson Mandela i forbindelse med presidentinnsettelsen i 1994. Samlet viser verkene hvordan hun bruker monumentale, forenklede figurer til å uttrykke styrke, sårbarhet, fellesskap og menneskelig nærvær i offentlige rom."
)
person["externalLinks"] = [
    {
        "type": "source",
        "label": "Store norske leksikon – Kjersti Wexelsen Goksøyr",
        "url": "https://snl.no/Kjersti_Wexelsen_Goks%C3%B8yr",
        "verifiedAt": "2026-07-26"
    },
    {
        "type": "source",
        "label": "Norsk kunstnerleksikon – Kjersti Goksøyr",
        "url": "https://nkl.snl.no/Kjersti_Goks%C3%B8yr",
        "verifiedAt": "2026-07-26"
    },
    {
        "type": "official",
        "label": "Kunstnerens nettsted",
        "url": "https://kjersti-wexelsen-goksoyr.no/",
        "verifiedAt": "2026-07-26"
    },
    {
        "type": "source",
        "label": "Oslo byleksikon – Stensparken",
        "url": "https://oslobyleksikon.no/side/Stensparken",
        "verifiedAt": "2026-07-26"
    }
]
person["source_urls"] = [item["url"] for item in person["externalLinks"]]
people_path.write_text(json.dumps(people, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Add the canonical documentation entry.
docs_readme_path = Path("docs/README.md")
docs_readme = docs_readme_path.read_text(encoding="utf-8")
place_popup_line = "7. [`PLACE_POPUP_SYSTEM.md`](./PLACE_POPUP_SYSTEM.md) — canonical presentasjons- og stedstypekontrakt for den rike stedspopupen"
people_popup_line = "8. [`PEOPLE_POPUP_SYSTEM.md`](./PEOPLE_POPUP_SYSTEM.md) — canonical presentasjons- og innholdskontrakt for den rike people-popupen"
if people_popup_line not in docs_readme:
    docs_readme = replace_once(docs_readme, place_popup_line, place_popup_line + "\n" + people_popup_line, "docs people popup link")
docs_readme_path.write_text(docs_readme, encoding="utf-8")

registry_path = Path("docs/documentation_registry.json")
registry = json.loads(registry_path.read_text(encoding="utf-8"))
registry["last_verified"] = "2026-07-26"
people_doc = "docs/PEOPLE_POPUP_SYSTEM.md"
priority = registry.setdefault("priority_order", [])
if people_doc not in priority:
    try:
        index = priority.index("docs/PLACE_POPUP_SYSTEM.md") + 1
    except ValueError:
        index = len(priority)
    priority.insert(index, people_doc)

documents = registry.setdefault("documents", [])
if not any(isinstance(item, dict) and item.get("path") == people_doc for item in documents):
    entry = {
        "path": people_doc,
        "status": "canonical",
        "role": "Bindende presentasjons-, felt- og handlingskontrakt for den rike people-popupen",
        "owns": ["people_popup_presentation_contract"],
        "last_verified": "2026-07-26"
    }
    place_index = next((i for i, item in enumerate(documents) if isinstance(item, dict) and item.get("path") == "docs/PLACE_POPUP_SYSTEM.md"), None)
    documents.insert((place_index + 1) if place_index is not None else len(documents), entry)
registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
