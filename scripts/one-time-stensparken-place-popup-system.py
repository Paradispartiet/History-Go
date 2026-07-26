from __future__ import annotations

import json
from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


js_path = Path("js/ui/place-popup-v2.js")
js = js_path.read_text(encoding="utf-8")
insert = Path("scripts/one-time-place-popup-sections.js.txt").read_text(encoding="utf-8").rstrip() + "\n\n"
marker = "  function personMeta(person) {"
if "function renderSpatialSection(place, routeLength)" not in js:
    js = replace_once(js, marker, insert + marker, "popup helper insertion")

current_facts = '''    const factsHtml = [
      renderFact("År", year),
      renderFact("Stedstype", placeType),
      renderFact("Utstrekning", formatDistance(routeLength)),
      renderFact("Personer", people.length ? String(people.length) : ""),
      renderFact("Fortellinger", stories.length ? String(stories.length) : "")
    ].filter(Boolean).join("");'''
new_facts = '''    const spatial = spatialProfile(place);
    const temporal = temporalProfile(place);
    const highestPoint = objectValue(spatial.highest_point || spatial.highestPoint);
    const displayExtent = numberValue(spatial.linear_extent_m || spatial.linearExtentM) || routeLength;
    const factsHtml = [
      renderFact("År", year),
      renderFact("Stedstype", placeType),
      renderFact("Areal", formatArea(spatial.area_m2 || spatial.areaM2)),
      renderFact("Høyeste punkt", firstText(highestPoint.name, highestPoint.title)),
      renderFact("Høyde", formatElevation(highestPoint.elevation_masl || highestPoint.elevationMasl || spatial.elevation_masl || spatial.elevationMasl)),
      renderFact("Byggehøyde", formatHeight(spatial.height_m || spatial.heightM)),
      renderFact("Utstrekning", formatDistance(displayExtent)),
      renderFact("Ferdigstilt", firstText(temporal.completed_year, temporal.completedYear)),
      renderFact("Personer", people.length ? String(people.length) : ""),
      renderFact("Fortellinger", stories.length ? String(stories.length) : "")
    ].filter(Boolean).join("");'''
if "const spatial = spatialProfile(place);" not in js:
    js = replace_once(js, current_facts, new_facts, "popup fact block")

current_sections = '''          <div class="hg-place-context-grid">
            ${renderFeatureSection("Særtrekk", profile?.signature_features, "hg-place-signatures-section")}
            ${renderFeatureSection("Se etter på stedet", profile?.must_include, "hg-place-look-section")}
          </div>

          ${renderRouteSection(place, routeLength)}
          ${renderPeopleSection(people)}
          ${renderRelationsSection(relations)}
          ${renderWonderkammer(place)}
          ${renderKnowledgeSection(place)}
          ${renderEvents ? renderEvents(events) : ""}
          ${renderStories ? renderStories(stories) : ""}
          ${renderObservationsSection(observations)}'''
replacement_sections = '''          ${renderSpatialSection(place, routeLength)}
          ${renderSubplacesSection(place)}
          ${renderHistoryTimeline(place)}
          ${renderNatureLandscape(place)}

          <div class="hg-place-context-grid">
            ${renderFeatureSection("Særtrekk", profile?.signature_features, "hg-place-signatures-section")}
            ${renderFeatureSection("Se etter på stedet", profile?.must_include, "hg-place-look-section")}
          </div>

          ${renderRouteSection(place, routeLength)}
          ${renderPeopleSection(people)}
          ${renderRelationsSection(relations)}
          ${renderWonderkammer(place)}
          ${renderKnowledgeSection(place)}
          ${renderEvents ? renderEvents(events) : ""}
          ${renderStories ? renderStories(stories) : ""}
          ${renderSourceSummary(place)}
          ${renderObservationsSection(observations)}'''
if "renderSubplacesSection(place)" not in js[js.find("function showPlacePopupV2"):]:
    js = replace_once(js, current_sections, replacement_sections, "popup section sequence")
js_path.write_text(js, encoding="utf-8")

css_path = Path("css/place-popup-v2.css")
css = css_path.read_text(encoding="utf-8")
if "STRUCTURED PLACE-TYPE SECTIONS" not in css:
    css_insert = Path("scripts/one-time-place-popup-sections.css.txt").read_text(encoding="utf-8")
    css = css.rstrip() + "\n" + css_insert.strip() + "\n"
css_path.write_text(css, encoding="utf-8")

place_path = Path("data/places/by/oslo/places/stensparken.json")
place = json.loads(place_path.read_text(encoding="utf-8"))
spatial_profile = {
    "area_m2": 48000,
    "linear_extent_m": 500,
    "highest_point": {
        "name": "Blåsen",
        "elevation_masl": 81
    },
    "terrain_type": "kalksteinsrygg",
    "landform": "langstrakt høydepark",
    "boundary_description": "Mellom Pilestredet, Stensgata, Thereses gate og Sporveisgata.",
    "measurement_status": "source_verified",
    "sources": [
        {
            "source": "Oslo kommune – Stensparken",
            "url": "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/stensparken/",
            "supports": ["highest_point", "elevation_masl", "facilities"]
        },
        {
            "source": "Oslo byleksikon – Stensparken",
            "url": "https://oslobyleksikon.no/side/Stensparken",
            "supports": ["area_m2", "linear_extent_m", "terrain_type", "completed_year"]
        }
    ]
}
temporal_profile = {
    "official_name_year": 1891,
    "development_period": "1890–1900",
    "completed_year": 1943
}
updated_place = {}
for key, value in place.items():
    updated_place[key] = value
    if key == "popupDesc":
        updated_place["spatial_profile"] = spatial_profile
        updated_place["temporal_profile"] = temporal_profile
if "spatial_profile" not in updated_place:
    updated_place["spatial_profile"] = spatial_profile
    updated_place["temporal_profile"] = temporal_profile
place = updated_place

popup_desc = str(place.get("popupDesc", ""))
old_sentence = "Høyden gir utsyn over byen, mens den kalkrike berggrunnen"
new_sentence = "Blåsen er parkens høyeste punkt, 81 meter over havet. Høyden gir utsyn over byen, mens den kalkrike berggrunnen"
if old_sentence in popup_desc and "81 meter over havet" not in popup_desc:
    place["popupDesc"] = popup_desc.replace(old_sentence, new_sentence, 1)

timeline = {
    "kalksteinsrygg": ("Geologisk grunnlag", 10),
    "sten_gard_nonneseter": ("Middelalderen", 20),
    "jens_bjelke_christiania_bymark": ("1629", 30),
    "avfallssted_gravplass_fyrstikkfabrikk": ("Før 1890", 40),
    "natmandshaugen": ("Før 1891", 45),
    "parkopparbeiding_1890_1900": ("1890–1900", 50),
    "fagerborg_kirke_motstandshistorie": ("1903–1945", 60),
    "kjaerlighetskarusellen_skeiv_historie": ("1937–2023", 70),
    "ferdigstilt_park_1943": ("1943", 80),
    "sigrid_undset_skulpturen": ("1991", 90)
}
layers = []
for layer in place.get("history_layers", []):
    if not isinstance(layer, dict):
        layers.append(layer)
        continue
    period, sort_order = timeline.get(layer.get("id"), (layer.get("period"), layer.get("sort_order")))
    rebuilt = {}
    for key, value in layer.items():
        rebuilt[key] = value
        if key == "title":
            if period:
                rebuilt["period"] = period
            if sort_order is not None:
                rebuilt["sort_order"] = sort_order
    if "period" not in rebuilt and period:
        rebuilt["period"] = period
    if "sort_order" not in rebuilt and sort_order is not None:
        rebuilt["sort_order"] = sort_order
    layers.append(rebuilt)
place["history_layers"] = layers
place_path.write_text(json.dumps(place, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

docs_readme_path = Path("docs/README.md")
docs_readme = docs_readme_path.read_text(encoding="utf-8")
docs_readme = docs_readme.replace("Sist kontrollert: **2026-07-25**", "Sist kontrollert: **2026-07-26**", 1)
readme_anchor = "6. [`PLACE_STANDARD.md`](./PLACE_STANDARD.md) — canonical produktstandard for et History GO-sted"
popup_line = "7. [`PLACE_POPUP_SYSTEM.md`](./PLACE_POPUP_SYSTEM.md) — canonical presentasjons- og stedstypekontrakt for den rike stedspopupen"
if popup_line not in docs_readme:
    docs_readme = replace_once(docs_readme, readme_anchor, readme_anchor + "\n" + popup_line, "docs README popup link")
docs_readme_path.write_text(docs_readme, encoding="utf-8")

standard_path = Path("docs/PLACE_STANDARD.md")
standard = standard_path.read_text(encoding="utf-8")
contract_anchor = "- `docs/APP_STRUCTURE_INDEX.md`"
popup_contract = "- `docs/PLACE_POPUP_SYSTEM.md`"
if popup_contract not in standard:
    standard = replace_once(standard, contract_anchor, contract_anchor + "\n" + popup_contract, "PLACE_STANDARD contract list")
old_complete = "  quiz_profile,\n  people_ids,"
new_complete = "  quiz_profile,\n  spatial_profile,\n  temporal_profile,\n  subplaces,\n  history_layers,\n  nature_profile,\n  source_summary,\n  people_ids,"
if "  spatial_profile," not in standard:
    standard = replace_once(standard, old_complete, new_complete, "PLACE_STANDARD rich fields")
placecard_anchor = "`index.html` eier PlaceCard/bottom sheet og quiz modal flow. `MapView` skal koordinere eksisterende DOM/runtime, ikke erstatte place card, kartmotor eller quizmotor."
popup_paragraph = "\nDen rike stedspopupen følger den bindende type- og presentasjonskontrakten i `docs/PLACE_POPUP_SYSTEM.md`. PlaceCard skal forbli kompakt; popupen kan vise `popupDesc`, strukturerte mål, delsteder, historiske lag, naturprofil og kildeoversikt når place-dataene faktisk finnes.\n"
if "Den rike stedspopupen følger" not in standard:
    standard = replace_once(standard, placecard_anchor, placecard_anchor + popup_paragraph, "PLACE_STANDARD popup pointer")
standard_path.write_text(standard, encoding="utf-8")

registry_path = Path("docs/documentation_registry.json")
registry = json.loads(registry_path.read_text(encoding="utf-8"))
registry["last_verified"] = "2026-07-26"
popup_path = "docs/PLACE_POPUP_SYSTEM.md"
priority = registry.setdefault("priority_order", [])
if popup_path not in priority:
    try:
        index = priority.index("docs/DATA_PRODUCTION_CONTRACT.md") + 1
    except ValueError:
        index = len(priority)
    priority.insert(index, popup_path)
documents = registry.setdefault("documents", [])
if not any(item.get("path") == popup_path for item in documents if isinstance(item, dict)):
    entry = {
        "path": popup_path,
        "status": "canonical",
        "role": "Bindende presentasjons-, felt- og stedstypekontrakt for den rike stedspopupen",
        "owns": ["place_popup_presentation_contract", "place_type_popup_profiles"],
        "last_verified": "2026-07-26"
    }
    place_standard_index = next((i for i, item in enumerate(documents) if item.get("path") == "docs/PLACE_STANDARD.md"), None)
    if place_standard_index is None:
        data_index = next((i for i, item in enumerate(documents) if item.get("path") == "docs/DATA_PRODUCTION_CONTRACT.md"), len(documents) - 1)
        documents.insert(data_index + 1, entry)
    else:
        documents.insert(place_standard_index + 1, entry)
registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
