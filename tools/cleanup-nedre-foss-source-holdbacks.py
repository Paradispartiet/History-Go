import json
from pathlib import Path


def read(path: str):
    return json.loads(Path(path).read_text())


def write(path: str, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


place_path = "data/places/natur/oslo/places_oslo_natur_akerselvarute/nedre_foss.json"
place = read(place_path)
assert place["id"] == "nedre_foss"
assert place["year"] == 1220

unresolved_ids = {"nedre_foss_current_businesses", "nedre_foss_precise_geology_claims"}
place["research_notes"] = [
    note for note in place.get("research_notes", []) if note.get("id") in unresolved_ids
]
assert {note["id"] for note in place["research_notes"]} == unresolved_ids

external_links = place.setdefault("externalLinks", [])
additions = [
    {
        "type": "reference",
        "label": "Oslo kommune – Nedre Foss park",
        "url": "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/nedre-foss-park",
        "lang": "nb",
        "verifiedAt": "2026-07-19",
    },
    {
        "type": "reference",
        "label": "Store norske leksikon – Friedrich Grüner",
        "url": "https://snl.no/Friedrich_Gr%C3%BCner",
        "lang": "nb",
        "verifiedAt": "2026-07-19",
    },
]
existing_urls = {link.get("url") for link in external_links}
for link in additions:
    if link["url"] not in existing_urls:
        external_links.append(link)
        existing_urls.add(link["url"])

place["source_summary"] = {
    "safe_sources": [link["label"] for link in external_links],
    "resolved_research": [
        "Møllekronologien som brukes app-facing er nå kildekontrollert mot Store norske leksikon, Oslo byleksikon og Industrimuseum.",
        "Bygningsspesifikke hovedfakta om hovedbygningen og den tidligere kornsiloen er nå kildekontrollert.",
        "Friedrich Grüners kjøp av Nedre Foss i 1672 er kildekontrollert.",
    ],
    "remaining_holdbacks": [
        "Skiftende nåværende virksomheter skal ikke hardkodes uten ny kildekontroll.",
        "Presise geologipåstander krever egen geologisk fagkilde.",
    ],
}
write(place_path, place)

article_path = "data/leksikon/places/oslo/historie/leksikon_oslo_historie_nedre_foss.json"
article = read(article_path)
assert article["place_id"] == "nedre_foss"
article.setdefault("interpretation", {})["counterpoints"] = [
    "1220 er første dokumenterte omtale av kverna i kildene som brukes her, ikke nødvendigvis et sikkert etableringsår for den første mølla på stedet.",
    "Nåværende virksomheter i området er tidssensitive og bør ikke hardkodes uten ny kildekontroll.",
    "Presise geologipåstander om synlig berg ved fossen krever en egen geologisk fagkilde.",
]
write(article_path, article)

person_path = "data/people/historie/oslo/akerselva/friedrich_gruner.json"
people = read(person_path)
assert len(people) == 1 and people[0]["id"] == "friedrich_gruner"
person = people[0]
person["source_urls"] = [
    "https://snl.no/Friedrich_Gr%C3%BCner",
    "https://snl.no/Foss_-_Oslo",
    "https://oslobyleksikon.no/side/Foss_g%C3%A5rd",
]
person["externalLinks"] = [
    {
        "type": "reference",
        "label": "Store norske leksikon – Friedrich Grüner",
        "url": "https://snl.no/Friedrich_Gr%C3%BCner",
        "lang": "nb",
        "verifiedAt": "2026-07-19",
    },
    {
        "type": "reference",
        "label": "Store norske leksikon – Foss (Oslo)",
        "url": "https://snl.no/Foss_-_Oslo",
        "lang": "nb",
        "verifiedAt": "2026-07-19",
    },
    {
        "type": "reference",
        "label": "Oslo byleksikon – Foss gård",
        "url": "https://oslobyleksikon.no/side/Foss_g%C3%A5rd",
        "lang": "nb",
        "verifiedAt": "2026-07-19",
    },
]
write(person_path, people)

Path("reports/nedre-foss-source-cleanup.md").write_text(
    """# Nedre Foss – source holdback cleanup

Dato: 2026-07-19

## Formål

PR #2530 fylte Nedre Foss med kildebelagt møllekronologi, bygningshistorie og Friedrich Grüner-relasjon. Eldre research-holdbacks i place-data og leksikon stod likevel igjen og sa at de samme opplysningene fortsatt manglet kildekontroll.

Denne cleanupen fjerner den interne selvmotsigelsen uten å endre canonical år, koordinater, radius, rundinger eller gameplay.

## Endringer

- fjerner de to løste research-holdbackene for møllekronologi og bygningshistorie
- beholder de reelt uløste holdbackene for skiftende virksomheter og presis geologi
- oppdaterer `source_summary` til faktisk sluttstatus
- erstatter det foreldede leksikon-counterpointet med kildekritisk presisering om at 1220 er første dokumenterte omtale, ikke nødvendigvis etableringsåret
- legger eksplisitte kildelenker på canonical `friedrich_gruner`
- legger Oslo kommune og SNL Friedrich Grüner inn blant stedets eksterne kilder
"""
)
