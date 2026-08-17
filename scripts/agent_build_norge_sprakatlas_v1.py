#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_text(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write_text(path: str, content: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def read_json(path: str):
    return json.loads(read_text(path))


def write_json(path: str, data) -> None:
    write_text(path, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def src(label: str, url: str, note: str = "") -> dict:
    row = {"label": label, "url": url}
    if note:
        row["note"] = note
    return row


GENERAL = [
    src("Store norske leksikon – inndeling av dialekter i Noreg", "https://snl.no/dialekter_i_Noreg_-_inndeling"),
    src("Store norske leksikon – dialektgrenser", "https://snl.no/dialektgrenser"),
]

atlas = {
    "schema": "history_go_language_atlas_v1",
    "title": "Språkatlas Norge",
    "verified_at": "2026-08-18",
    "scope": "Norge",
    "mode": "schematic_reference_map",
    "notes": "Kartet er en faglig navigasjonsflate, ikke et kart over faste språkgrenser. Dialekttrekk følger isoglosser, glidende overganger, generasjoner og sosiale miljøer. Et områdeanker sier aldri hvordan alle som bor der snakker.",
    "editorial_principles": [
        "De fire hovedgruppene brukes som grov nasjonal orientering: austlandsk, vestlandsk, trøndersk og nordnorsk.",
        "Underregionene er pedagogiske soner og skal ikke behandles som administrative grenser eller som uttømmende lokale dialekter.",
        "Stedseierskap betyr dokumentert relevans, ikke at et ord eller trekk er unikt for stedet.",
        "Sosiolekter, bymål og multietniske talestiler legges som egne overlegg og skal ikke gjøres til egenskaper ved alle beboere.",
        "Samiske språk og nasjonale minoritetsspråk er egne språk og skal aldri plasseres som norske dialekter."
    ],
    "macro_regions": [
        {
            "id": "austlandsk",
            "name": "Austlandsk",
            "map_label": "Østlandsk",
            "summary": "Dialekter på Østlandet. Jamvektsloven, kløyvd infinitiv, lågtone og tjukk l er sentrale historiske målmerker, men ikke alle trekk finnes overalt.",
            "feature_labels": ["jamvekt", "kløyvd infinitiv", "lågtone", "tjukk l"],
            "sources": [src("Store norske leksikon – østlandsk", "https://snl.no/%C3%B8stlandsk"), *GENERAL]
        },
        {
            "id": "vestlandsk",
            "name": "Vestlandsk",
            "map_label": "Vestlandsk",
            "summary": "Dialekter fra Agder gjennom Vestlandet til Romsdal. Området mangler jamvektssystemet og har flere a-, e- og e/a-mål; høgtone er et viktig overordnet trekk.",
            "feature_labels": ["høgtone", "a-/e-infinitiv", "uten jamvektssystem", "stor kyst–innlandsvariasjon"],
            "sources": [src("Store norske leksikon – vestlandsk", "https://snl.no/vestlandsk"), *GENERAL]
        },
        {
            "id": "trondersk",
            "name": "Trøndersk",
            "map_label": "Trøndersk",
            "summary": "Dialekter i Trøndelag, på Nordmøre og i det meste av Bindal. Jamvekt, apokope, tjukk l og ofte palatalisering er sentrale trekk, med stor forskjell mellom indre og ytre mål.",
            "feature_labels": ["jamvekt", "apokope", "tjukk l", "palatalisering"],
            "sources": [src("Store norske leksikon – trøndersk", "https://snl.no/tr%C3%B8ndersk"), *GENERAL]
        },
        {
            "id": "nordnorsk",
            "name": "Nordnorsk",
            "map_label": "Nordnorsk",
            "summary": "Dialekter i Nordland, Troms og Finnmark. Nordnorsk har som hovedregel ikke jamvektssystemet, har høgtone og viser omfattende variasjon i apokope, pronomen, palatalisering og kontakt med andre språk.",
            "feature_labels": ["høgtone", "apokope", "ikke jamvektssystem", "språkkontakt"],
            "sources": [src("Store norske leksikon – nordnorsk", "https://snl.no/nordnorsk"), *GENERAL]
        }
    ],
    "dialect_regions": [
        {
            "id": "vikvaersk",
            "macro_region_id": "austlandsk",
            "name": "Vikværsk",
            "area_summary": "Østfold, Vestfold og Grenland, med enkelte bredere avgrensninger i faglitteraturen.",
            "feature_labels": ["-ær i tradisjonelt flertall", "tjukk l", "jamvekt i store deler av området"],
            "sources": [src("Store norske leksikon – vikværsk", "https://snl.no/vikv%C3%A6rsk"), src("Store norske leksikon – dialekter i Østfold", "https://snl.no/dialekter_i_%C3%98stfold")]
        },
        {
            "id": "midtostlandsk",
            "macro_region_id": "austlandsk",
            "name": "Midtøstlandsk",
            "area_summary": "Oslo, Akershus, Ringerike og områdene rundt indre Oslofjord i den vanlige dialektologiske inndelingen.",
            "feature_labels": ["kløyvd infinitiv", "tjukk l", "tostava bestemt flertall som gutta"],
            "sources": [src("Store norske leksikon – midtøstlandsk", "https://snl.no/midt%C3%B8stlandsk"), src("Store norske leksikon – dialekter i Akershus", "https://snl.no/dialekter_i_Akershus")]
        },
        {
            "id": "opplandsmal",
            "macro_region_id": "austlandsk",
            "name": "Opplandsmål",
            "area_summary": "Indre deler av Østlandet nord for det midtøstlandske området, med betydelig lokal variasjon.",
            "feature_labels": ["jamvekt", "palatalisering i flere områder", "dativ i tradisjonelle mål"],
            "sources": [src("Store norske leksikon – østlandsk", "https://snl.no/%C3%B8stlandsk"), src("Store norske leksikon – dialekter i Oppland", "https://snl.no/dialekter_i_Oppland")]
        },
        {
            "id": "midlandsmal",
            "macro_region_id": "austlandsk",
            "name": "Midlandsmål",
            "area_summary": "Vestlige østlandske fjelldaler fra Telemark i sør til Nord-Gudbrandsdal i nord.",
            "feature_labels": ["fullvokaler", "eldre bøyningstrekk", "stor dalvariasjon"],
            "sources": [src("Store norske leksikon – midlandsmål", "https://snl.no/midlandsm%C3%A5l"), src("Store norske leksikon – dialekter i Telemark", "https://snl.no/dialekter_i_Telemark")]
        },
        {
            "id": "sorleg_e_mal",
            "macro_region_id": "vestlandsk",
            "name": "Sørleg e-mål",
            "area_summary": "Sørvest-Telemark, gamle Aust-Agder og vestover til Mandal.",
            "feature_labels": ["-e i infinitiv", "-e i svake hunkjønnsord", "kyst–innlandsforskjeller"],
            "sources": [src("Store norske leksikon – sørleg e-mål", "https://snl.no/s%C3%B8rleg_e-m%C3%A5l"), src("Store norske leksikon – dialekter på Agder", "https://snl.no/dialekter_p%C3%A5_Agder")]
        },
        {
            "id": "sorleg_ea_mal",
            "macro_region_id": "vestlandsk",
            "name": "Sørleg e/a-mål",
            "area_summary": "Et tradisjonelt overgangsområde omkring Lindesnes og Lista.",
            "feature_labels": ["-e i infinitiv", "-a i svake hunkjønnsord", "overgangssone"],
            "sources": [src("Store norske leksikon – sørleg e/a-mål", "https://snl.no/s%C3%B8rleg_e/a-m%C3%A5l"), src("Store norske leksikon – dialekter på Agder", "https://snl.no/dialekter_p%C3%A5_Agder")]
        },
        {
            "id": "sorvestlandsk_a_mal",
            "macro_region_id": "vestlandsk",
            "name": "Sørvestlandsk a-mål",
            "area_summary": "Fra vestre Agder gjennom Rogaland og store deler av Hordaland til indre Sogn.",
            "feature_labels": ["-a i infinitiv", "-a i svake hunkjønnsord", "blaute konsonanter i deler av sørkysten"],
            "sources": [src("Store norske leksikon – sørvestlandsk a-mål", "https://snl.no/s%C3%B8rvestlandsk_a-m%C3%A5l"), src("Store norske leksikon – dialekter på Jæren", "https://snl.no/dialekter_p%C3%A5_J%C3%A6ren")]
        },
        {
            "id": "nordvestlandsk_e_mal",
            "macro_region_id": "vestlandsk",
            "name": "Nordvestlandsk e-mål",
            "area_summary": "Fra Ytre Sogn nordover gjennom Sunnfjord, Nordfjord og Sunnmøre til og med Romsdal.",
            "feature_labels": ["-e i infinitiv", "palatalisering i flere områder", "høgtone"],
            "sources": [src("Store norske leksikon – nordvestlandsk e-mål", "https://snl.no/nordvestlandsk_e-m%C3%A5l"), src("Store norske leksikon – dialekter i Møre og Romsdal", "https://snl.no/dialekter_i_M%C3%B8re_og_Romsdal")]
        },
        {
            "id": "inntrondersk",
            "macro_region_id": "trondersk",
            "name": "Inntrøndersk",
            "area_summary": "Indre trøndermål, særlig dal- og fjordbygder i det indre Trøndelag.",
            "feature_labels": ["utjamning i jamvektsord", "vårrå/låvvå-typer", "dativ i tradisjonelle mål"],
            "sources": [src("Store norske leksikon – trøndersk", "https://snl.no/tr%C3%B8ndersk"), src("Store norske leksikon – dialekter i Sør-Trøndelag", "https://snl.no/dialekter_i_S%C3%B8r-Tr%C3%B8ndelag")]
        },
        {
            "id": "uttrondersk",
            "macro_region_id": "trondersk",
            "name": "Uttrøndersk",
            "area_summary": "Ytre trøndermål, inkludert fosenmål og nordmørsmål som viktige underområder.",
            "feature_labels": ["tiljamning", "værra/vækka-typer", "apokope"],
            "sources": [src("Store norske leksikon – trøndersk", "https://snl.no/tr%C3%B8ndersk"), src("Store norske leksikon – dialekter på Nordmøre", "https://snl.no/Dialekter_p%C3%A5_Nordm%C3%B8re")]
        },
        {
            "id": "nordland",
            "macro_region_id": "nordnorsk",
            "name": "Nordland",
            "area_summary": "Nordnorske mål i Nordland. Sør-Helgeland har enkelte overgangstrekk mot trøndersk, mens resten av fylket viser stor intern variasjon.",
            "feature_labels": ["apokope i mange områder", "høgtone", "overgang mot trøndersk i sør"],
            "sources": [src("Store norske leksikon – nordnorsk", "https://snl.no/nordnorsk"), src("Store norske leksikon – inndeling av dialekter i Noreg", "https://snl.no/dialekter_i_Noreg_-_inndeling")]
        },
        {
            "id": "troms",
            "macro_region_id": "nordnorsk",
            "name": "Troms",
            "area_summary": "Tromsmålet strekker seg fra grensa mot Nordland til Loppa, med tydelige kyst–innlandsforskjeller og flere kontaktområder.",
            "feature_labels": ["æ/e-variasjon", "dåkker/dæm", "palatalisering", "språkkontakt"],
            "sources": [src("Store norske leksikon – dialekter og språk i Troms", "https://snl.no/dialekter_og_spr%C3%A5k_i_Troms"), src("Store norske leksikon – nordnorsk", "https://snl.no/nordnorsk")]
        },
        {
            "id": "finnmark",
            "macro_region_id": "nordnorsk",
            "name": "Finnmark",
            "area_summary": "Finnmarksmål med store kyst-, fjord- og innlandsforskjeller og historisk kontakt med samiske språk og kvensk/finsk.",
            "feature_labels": ["æ/mæ/dæ i mange områder", "høgtone", "kontakt med samisk og kvensk", "stor lokal variasjon"],
            "sources": [src("Store norske leksikon – dialekter og språk i Finnmark", "https://snl.no/dialekter_og_spr%C3%A5k_i_Finnmark"), src("Store norske leksikon – nordnorsk", "https://snl.no/nordnorsk")]
        }
    ],
    "urban_overlays": [
        {
            "id": "oslo_folkemal",
            "name": "Tradisjonelt Oslo-folkemål",
            "summary": "Historisk folkemålsvariant i Oslo, særlig forbundet med arbeiderstrøk, men ikke avgrenset til én bydel.",
            "sources": [src("Store norske leksikon – dialekter og språk i Oslo", "https://snl.no/dialekter_og_spr%C3%A5k_i_Oslo"), src("Språkrådet – språket i Oslo", "https://sprakradet.no/spraksporsmal-og-svar/er-spraket-i-oslo-dialekt-eller-bokmal/")]
        },
        {
            "id": "oslo_vestkant_historisk",
            "name": "Historisk vestkantmål / dannet dagligtale",
            "summary": "Historisk riksmålsnær Oslo-variant med vestlig sosial og geografisk tyngde, i dag med langt mer flytende grenser.",
            "sources": [src("Store norske leksikon – dialekter og språk i Oslo", "https://snl.no/dialekter_og_spr%C3%A5k_i_Oslo"), src("Språkrådet – språket i Oslo", "https://sprakradet.no/spraksporsmal-og-svar/er-spraket-i-oslo-dialekt-eller-bokmal/")]
        },
        {
            "id": "oslo_multietnisk_norsk",
            "name": "Multietnisk norsk i Oslo",
            "summary": "Kontaktbaserte talestiler og repertoarer i flerspråklige miljøer. Dette er ikke en «Holmlia-dialekt» og ikke en språkform alle i bestemte bydeler bruker.",
            "sources": [src("Store norske leksikon – dialekter og språk i Oslo", "https://snl.no/dialekter_og_spr%C3%A5k_i_Oslo"), src("Store norske leksikon – sosiolekt", "https://snl.no/sosiolekt")]
        },
        {
            "id": "trondheim_bymal",
            "name": "Trondheim bymål",
            "summary": "Et klart trøndersk bymål med trekk fra omliggende bygdemål og historiske sosiale variasjoner mellom folkelig og mer standardnære register.",
            "sources": [src("Store norske leksikon – Trondheim bymål", "https://snl.no/Trondheim_bym%C3%A5l"), src("Store norske leksikon – trøndersk", "https://snl.no/tr%C3%B8ndersk")]
        }
    ],
    "language_status_layers": [
        {
            "id": "nordsamisk",
            "name": "Nordsamisk",
            "kind": "language",
            "group": "urfolksspråk",
            "status": "aktivt i Norge",
            "not_norwegian_dialect": True,
            "sources": [src("Språkrådet – samiske språk", "https://sprakradet.no/spraklova/urfolkssprak-og-nasjonale-minoritetssprak/samiske-sprak/")]
        },
        {
            "id": "lulesamisk",
            "name": "Lulesamisk",
            "kind": "language",
            "group": "urfolksspråk",
            "status": "aktivt i Norge",
            "not_norwegian_dialect": True,
            "sources": [src("Språkrådet – samiske språk", "https://sprakradet.no/spraklova/urfolkssprak-og-nasjonale-minoritetssprak/samiske-sprak/")]
        },
        {
            "id": "sorsamisk",
            "name": "Sørsamisk",
            "kind": "language",
            "group": "urfolksspråk",
            "status": "aktivt i Norge",
            "not_norwegian_dialect": True,
            "sources": [src("Språkrådet – samiske språk", "https://sprakradet.no/spraklova/urfolkssprak-og-nasjonale-minoritetssprak/samiske-sprak/")]
        },
        {
            "id": "pitesamisk",
            "name": "Pitesamisk",
            "kind": "language",
            "group": "urfolksspråk",
            "status": "tradisjonelt språkområde / revitalisering",
            "not_norwegian_dialect": True,
            "sources": [src("Språkrådet – samiske språk", "https://sprakradet.no/spraklova/urfolkssprak-og-nasjonale-minoritetssprak/samiske-sprak/")]
        },
        {
            "id": "umesamisk",
            "name": "Umesamisk",
            "kind": "language",
            "group": "urfolksspråk",
            "status": "tradisjonelt språkområde / revitalisering",
            "not_norwegian_dialect": True,
            "sources": [src("Språkrådet – samiske språk", "https://sprakradet.no/spraklova/urfolkssprak-og-nasjonale-minoritetssprak/samiske-sprak/")]
        },
        {
            "id": "skoltesamisk",
            "name": "Skoltesamisk",
            "kind": "language",
            "group": "urfolksspråk",
            "status": "tradisjonelt språkområde / revitalisering",
            "not_norwegian_dialect": True,
            "sources": [src("Språkrådet – samiske språk", "https://sprakradet.no/spraklova/urfolkssprak-og-nasjonale-minoritetssprak/samiske-sprak/")]
        },
        {
            "id": "kvensk",
            "name": "Kvensk",
            "kind": "language",
            "group": "nasjonalt minoritetsspråk",
            "status": "vernet og fremmet etter språkloven",
            "not_norwegian_dialect": True,
            "sources": [src("Språkrådet – nasjonale minoritetsspråk", "https://sprakradet.no/spraklova/urfolkssprak-og-nasjonale-minoritetssprak/nasjonale-minoritetssprak/")]
        },
        {
            "id": "romani",
            "name": "Romani",
            "kind": "language",
            "group": "nasjonalt minoritetsspråk",
            "status": "vernet og fremmet etter språkloven",
            "not_norwegian_dialect": True,
            "sources": [src("Språkrådet – nasjonale minoritetsspråk", "https://sprakradet.no/spraklova/urfolkssprak-og-nasjonale-minoritetssprak/nasjonale-minoritetssprak/")]
        },
        {
            "id": "romanes",
            "name": "Romanes",
            "kind": "language",
            "group": "nasjonalt minoritetsspråk",
            "status": "vernet og fremmet etter språkloven",
            "not_norwegian_dialect": True,
            "sources": [src("Språkrådet – nasjonale minoritetsspråk", "https://sprakradet.no/spraklova/urfolkssprak-og-nasjonale-minoritetssprak/nasjonale-minoritetssprak/")]
        }
    ],
    "sources": GENERAL + [
        src("Språkrådet – samiske språk", "https://sprakradet.no/spraklova/urfolkssprak-og-nasjonale-minoritetssprak/samiske-sprak/"),
        src("Språkrådet – nasjonale minoritetsspråk", "https://sprakradet.no/spraklova/urfolkssprak-og-nasjonale-minoritetssprak/nasjonale-minoritetssprak/")
    ]
}
write_json("data/leksikon/sprak/norge_atlas_v1.json", atlas)

atlas_schema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://history-go.local/schemas/sprakatlas-norge-v1.json",
    "title": "History Go Språkatlas Norge v1",
    "type": "object",
    "required": ["schema", "title", "verified_at", "scope", "macro_regions", "dialect_regions", "language_status_layers"],
    "properties": {
        "schema": {"const": "history_go_language_atlas_v1"},
        "title": {"type": "string", "minLength": 1},
        "verified_at": {"type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$"},
        "scope": {"const": "Norge"},
        "macro_regions": {"type": "array", "minItems": 4},
        "dialect_regions": {"type": "array", "minItems": 10},
        "urban_overlays": {"type": "array"},
        "language_status_layers": {"type": "array", "minItems": 6}
    },
    "additionalProperties": True
}
write_json("data/leksikon/sprak/atlas_schema_v1.json", atlas_schema)

# Register atlas metadata on the already approved area-owned dialect articles.
article_mappings = {
    "data/leksikon/sprak/places/europe/norway/oslo/frogner.json": (["austlandsk", "midtostlandsk"], ["oslo_vestkant_historisk"]),
    "data/leksikon/sprak/places/europe/norway/oslo/sagene.json": (["austlandsk", "midtostlandsk"], ["oslo_folkemal"]),
    "data/leksikon/sprak/places/europe/norway/oslo/vaalerenga.json": (["austlandsk", "midtostlandsk"], ["oslo_folkemal"]),
    "data/leksikon/sprak/places/europe/norway/oslo/holmlia.json": (["austlandsk", "midtostlandsk"], ["oslo_multietnisk_norsk"]),
    "data/leksikon/sprak/places/europe/norway/vestland/etne/etnesjoen_tettstad.json": (["vestlandsk", "sorvestlandsk_a_mal"], []),
}
for path, (region_ids, overlay_ids) in article_mappings.items():
    data = read_json(path)
    data["atlas_region_ids"] = region_ids
    if overlay_ids:
        data["atlas_overlay_ids"] = overlay_ids
    else:
        data.pop("atlas_overlay_ids", None)
    write_json(path, data)

# Add a real trøndersk area-owned anchor using the existing Svartlamon area Place.
svartlamon = {
    "place_id": "svartlamon_trondheim",
    "title": "Språkleksikon: Svartlamon / Trondheim",
    "verified_at": "2026-08-18",
    "dialect_area": "Trondheim bymål / trøndersk",
    "atlas_region_ids": ["trondersk"],
    "atlas_overlay_ids": ["trondheim_bymal"],
    "notes": "Svartlamon brukes som områdeanker inne i Trondheim, ikke som påstand om en egen Svartlamon-dialekt. Oppføringene beskriver dokumenterte trekk i Trondheim bymål og bredere trøndersk, og de kan brukes langt utenfor dette nabolaget.",
    "entries": [
        {
            "id": "svartlamon_ae",
            "term": "æ",
            "type": "pronomen",
            "layer": "dialect",
            "meaning": "Første person entall: «jeg/eg» i folkelig Trondheimsmål og mange trønderske mål.",
            "dialect_area": "Trondheim bymål / trøndersk",
            "status": "common",
            "usage": "Et bredt trøndersk trekk, ikke et særtrekk ved Svartlamon.",
            "context": "Store norske leksikon beskriver «æ» som del av folkelig Trondheimsmål og viser samme form i trønderske eksempler. Områdeankeret gjør språkhistorien synlig i Trondheim uten å tillegge alle beboere samme register.",
            "linked_to": {"kind": "place", "id": "svartlamon_trondheim"},
            "tags": ["dialekt", "trøndersk", "trondheim", "pronomen"],
            "sources": [src("Store norske leksikon – norske bymål", "https://snl.no/norske_bym%C3%A5l"), src("Store norske leksikon – Trondheim bymål", "https://snl.no/Trondheim_bym%C3%A5l"), src("Store norske leksikon – trøndersk", "https://snl.no/tr%C3%B8ndersk")]
        },
        {
            "id": "svartlamon_mae",
            "term": "mæ",
            "type": "pronomen",
            "layer": "dialect",
            "meaning": "Objektsform av første person entall: «meg» i folkelig Trondheimsmål og mange trønderske mål.",
            "dialect_area": "Trondheim bymål / trøndersk",
            "status": "common",
            "usage": "Bredt trøndersk og ikke unikt for Trondheim eller Svartlamon.",
            "context": "SNL omtaler «æ, mæ» som kjente former i folkelig Trondheimsmål. Formen skal presenteres som del av et større trøndersk talemålslandskap.",
            "linked_to": {"kind": "place", "id": "svartlamon_trondheim"},
            "tags": ["dialekt", "trøndersk", "trondheim", "pronomen"],
            "sources": [src("Store norske leksikon – norske bymål", "https://snl.no/norske_bym%C3%A5l"), src("Store norske leksikon – Trondheim bymål", "https://snl.no/Trondheim_bym%C3%A5l"), src("Store norske leksikon – trøndersk", "https://snl.no/tr%C3%B8ndersk")]
        },
        {
            "id": "svartlamon_itj",
            "term": "itj",
            "type": "ordform",
            "layer": "dialect",
            "meaning": "Trøndersk nektingsord tilsvarende «ikke». Formen står i dag side om side med andre varianter i bymål.",
            "dialect_area": "Trondheim bymål / trøndersk",
            "status": "common",
            "usage": "Vanlig trøndersk form og ikke en markør for ett bestemt Trondheim-nabolag.",
            "context": "SNL bruker «itj» i trønderske eksempler og beskriver at «ikke» også kommer inn i trønderske bymål. Det gjør formen egnet til å vise både kontinuitet og språkendring.",
            "linked_to": {"kind": "place", "id": "svartlamon_trondheim"},
            "tags": ["dialekt", "trøndersk", "trondheim", "nekting"],
            "sources": [src("Store norske leksikon – trøndersk", "https://snl.no/tr%C3%B8ndersk"), src("Store norske leksikon – norske bymål", "https://snl.no/norske_bym%C3%A5l"), src("Store norske leksikon – Trondheim bymål", "https://snl.no/Trondheim_bym%C3%A5l")]
        },
        {
            "id": "svartlamon_kjaemm",
            "term": "kjæmm",
            "type": "ordform",
            "layer": "dialect",
            "meaning": "Kort presensform av «kommer», dokumentert i Trondheimsmål og andre trønderske mål.",
            "dialect_area": "Trondheim bymål / trøndersk",
            "status": "common",
            "usage": "Et regionalt trøndersk trekk, ikke en lokal Svartlamon-form.",
            "context": "SNL beskriver kort presens av sterke verb som «kjæmm» som et trekk Trondheim bymål deler med omkringliggende trønderske bygdemål.",
            "linked_to": {"kind": "place", "id": "svartlamon_trondheim"},
            "tags": ["dialekt", "trøndersk", "trondheim", "verb"],
            "sources": [src("Store norske leksikon – dialekter i Sør-Trøndelag", "https://snl.no/dialekter_i_S%C3%B8r-Tr%C3%B8ndelag"), src("Store norske leksikon – Trondheim bymål", "https://snl.no/Trondheim_bym%C3%A5l"), src("Store norske leksikon – trøndersk", "https://snl.no/tr%C3%B8ndersk")]
        }
    ]
}
svartlamon_path = "data/leksikon/sprak/places/europe/norway/trondelag/svartlamon_trondheim.json"
write_json(svartlamon_path, svartlamon)
manifest = read_json("data/leksikon/sprak/manifest.json")
manifest.setdefault("place_files", {})["svartlamon_trondheim"] = svartlamon_path
write_json("data/leksikon/sprak/manifest.json", manifest)

# Make atlas fields explicit in the language article schema without changing the area-only dialect rule.
schema_path = "data/leksikon/sprak/schema_v2.json"
schema = read_json(schema_path)
props = schema.setdefault("properties", {})
props["atlas_region_ids"] = {
    "type": "array",
    "items": {"type": "string", "minLength": 1},
    "uniqueItems": True
}
props["atlas_overlay_ids"] = {
    "type": "array",
    "items": {"type": "string", "minLength": 1},
    "uniqueItems": True
}
write_json(schema_path, schema)

# Runtime: load and render the national atlas inside the existing Språk tab.
js_path = "js/ui/place-language-layer.js"
js = read_text(js_path)
if 'const ATLAS_PATH = "data/leksikon/sprak/norge_atlas_v1.json";' not in js:
    js = js.replace(
        '  const MANIFEST_PATH = "data/leksikon/sprak/manifest.json";\n',
        '  const MANIFEST_PATH = "data/leksikon/sprak/manifest.json";\n  const ATLAS_PATH = "data/leksikon/sprak/norge_atlas_v1.json";\n'
    )
if "  let atlasPromise = null;" not in js:
    js = js.replace("  let manifestPromise = null;\n", "  let manifestPromise = null;\n  let atlasPromise = null;\n")

load_atlas = '''\n  async function loadAtlas() {\n    if (atlasPromise) return atlasPromise;\n    atlasPromise = fetch(ATLAS_PATH, { cache: "default" })\n      .then(response => response.ok ? response.json() : null)\n      .catch(() => null);\n    return atlasPromise;\n  }\n\n'''
if "  async function loadAtlas()" not in js:
    js = js.replace("  async function loadForPlace(placeId) {\n", load_atlas + "  async function loadForPlace(placeId) {\n")

atlas_helpers = r'''\n  function atlasIds(article, field) {\n    return unique(article?.[field]);\n  }\n\n  function renderAtlasMacroCard(macro, atlas, activeIds) {\n    const regions = list(atlas?.dialect_regions).filter(region => text(region?.macro_region_id) === text(macro?.id));\n    const activeMacro = activeIds.has(text(macro?.id)) || regions.some(region => activeIds.has(text(region?.id)));\n    return `\n      <article class="hg-language-atlas-macro${activeMacro ? " is-active" : ""}" data-atlas-macro="${esc(macro?.id)}">\n        <header><strong>${esc(macro?.name)}</strong><span>${regions.length} soner</span></header>\n        <p>${esc(macro?.summary)}</p>\n        ${list(macro?.feature_labels).length ? `<div class="hg-language-atlas-features">${list(macro.feature_labels).map(label => `<span>${esc(label)}</span>`).join("")}</div>` : ""}\n        <div class="hg-language-atlas-regions">${regions.map(region => `<span class="${activeIds.has(text(region?.id)) ? "is-active" : ""}">${esc(region?.name)}</span>`).join("")}</div>\n        ${sourceLinks({ sources: macro?.sources })}\n      </article>\n    `;\n  }\n\n  function renderLanguageAtlas(article, atlas) {\n    const macros = list(atlas?.macro_regions);\n    if (!macros.length) return "";\n    const activeIds = new Set([\n      ...atlasIds(article, "atlas_region_ids"),\n      ...atlasIds(article, "atlas_overlay_ids")\n    ]);\n    const regions = list(atlas?.dialect_regions);\n    const overlays = list(atlas?.urban_overlays);\n    const languageLayers = list(atlas?.language_status_layers);\n    const activeNames = [\n      ...macros.filter(row => activeIds.has(text(row?.id))),\n      ...regions.filter(row => activeIds.has(text(row?.id))),\n      ...overlays.filter(row => activeIds.has(text(row?.id)))\n    ].map(row => text(row?.name)).filter(Boolean);\n    const isMacroActive = id => activeIds.has(id) || regions.some(region => text(region?.macro_region_id) === id && activeIds.has(text(region?.id)));\n    const mapBlock = (id, label, className) => `<div class="hg-language-atlas-map-region ${className}${isMacroActive(id) ? " is-active" : ""}" data-atlas-map-region="${esc(id)}"><strong>${esc(label)}</strong></div>`;\n    return `\n      <section class="hg-language-atlas" data-language-atlas>\n        <header class="hg-language-atlas-head">\n          <div class="hg-language-kicker">Språkatlas Norge</div>\n          <strong>Fra lokale språkspor til hele dialektlandskapet</strong>\n          <p>Skjematisk oversikt. Dialektgrenser er glidende, og et områdeanker beskriver aldri alle som bor der.</p>\n        </header>\n        <div class="hg-language-atlas-map" role="img" aria-label="Skjematisk språkkart over de fire norske hovedgruppene">\n          ${mapBlock("nordnorsk", "Nordnorsk", "is-north")}\n          ${mapBlock("trondersk", "Trøndersk", "is-trondelag")}\n          ${mapBlock("vestlandsk", "Vestlandsk", "is-west")}\n          ${mapBlock("austlandsk", "Østlandsk", "is-east")}\n        </div>\n        ${activeNames.length ? `<p class="hg-language-atlas-current"><strong>Koblet til dette stedet:</strong> ${esc(unique(activeNames).join(" · "))}</p>` : ""}\n        <details class="hg-language-atlas-details">\n          <summary>Utforsk hele Norge</summary>\n          <div class="hg-language-atlas-grid">${macros.map(macro => renderAtlasMacroCard(macro, atlas, activeIds)).join("")}</div>\n          ${overlays.length ? `<section class="hg-language-atlas-overlays"><h3>Bymål og sosiale språkoverlegg</h3><div>${overlays.map(row => `<article class="${activeIds.has(text(row?.id)) ? "is-active" : ""}"><strong>${esc(row?.name)}</strong><p>${esc(row?.summary)}</p>${sourceLinks({ sources: row?.sources })}</article>`).join("")}</div></section>` : ""}\n          ${languageLayers.length ? `<section class="hg-language-atlas-languages"><h3>Egne språk – ikke norske dialekter</h3><p>Urfolksspråk og nasjonale minoritetsspråk vises separat slik at atlaset ikke gjør dem til undergrupper av norsk.</p><div>${languageLayers.map(row => `<span><strong>${esc(row?.name)}</strong>${row?.status ? ` · ${esc(row.status)}` : ""}</span>`).join("")}</div></section>` : ""}\n        </details>\n      </section>\n    `;\n  }\n\n'''
if "  function renderLanguageAtlas(article, atlas)" not in js:
    js = js.replace("  function countByType(entries) {\n", atlas_helpers + "  function countByType(entries) {\n")

js = js.replace("  function renderLanguagePanel(place, article) {\n", "  function renderLanguagePanel(place, article, atlas = null) {\n")
needle = '''        ${dialectEntries.length ? `\n          <section class="hg-language-dialect-intro" aria-label="Dialektlag">\n            <div class="hg-language-kicker">Dialektlag</div>\n            <strong>${esc(dialectArea || place?.name || "Lokalt talemål")}</strong>\n            <p>Disse språksporene er kildebelagt som del av talemålet i området. Et ord kan også finnes i andre dialektområder; lokal attestasjon betyr ikke at formen er unik her.</p>\n          </section>\n        ` : ""}\n        ${filters ?'''
if needle in js and "${renderLanguageAtlas(article, atlas)}" not in js:
    js = js.replace(needle, needle.replace("        ${filters ?", "        ${renderLanguageAtlas(article, atlas)}\n        ${filters ?"))

if "    const atlas = await loadAtlas();" not in js:
    js = js.replace(
        "    const entries = list(loaded.article?.entries).filter(entry => isAllowedLanguageEntry(entry, loaded.article, place));\n    if (!entries.length) return;\n",
        "    const entries = list(loaded.article?.entries).filter(entry => isAllowedLanguageEntry(entry, loaded.article, place));\n    if (!entries.length) return;\n    const atlas = await loadAtlas();\n"
    )
js = js.replace("    panel.innerHTML = renderLanguagePanel(place, loaded.article);\n", "    panel.innerHTML = renderLanguagePanel(place, loaded.article, atlas);\n")
if "    loadAtlas," not in js:
    js = js.replace("  global.HGLanguageLayer = {\n    loadForPlace,\n", "  global.HGLanguageLayer = {\n    loadForPlace,\n    loadAtlas,\n")
write_text(js_path, js)

# Visual language atlas inside the existing Språk tab.
css_path = "css/place-language-layer.css"
css = read_text(css_path)
atlas_css = r'''\n\n/* Språkatlas Norge: skjematisk nasjonal orientering inne i eksisterende Språk-fane. */\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas{\n  display:grid;\n  gap:12px;\n  padding:15px;\n  border:1px solid rgba(255,255,255,.1);\n  border-radius:20px;\n  background:linear-gradient(150deg,rgba(255,255,255,.035),rgba(0,0,0,.2));\n}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-head{display:grid;gap:5px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-head>strong{color:#fff;font-size:15px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-head>p,\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-current{margin:0;color:rgba(255,255,255,.66);font-size:12px;line-height:1.5}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-current strong{color:rgba(255,255,255,.86)}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-map{\n  display:grid;\n  grid-template-columns:1fr 1fr;\n  gap:7px;\n  min-height:210px;\n  padding:12px;\n  border:1px solid rgba(255,255,255,.07);\n  border-radius:18px;\n  background:rgba(0,0,0,.18);\n}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-map-region{\n  display:flex;\n  align-items:center;\n  justify-content:center;\n  min-height:44px;\n  padding:9px;\n  border:1px solid rgba(255,255,255,.11);\n  border-radius:15px;\n  background:rgba(255,255,255,.035);\n  color:rgba(255,255,255,.7);\n  text-align:center;\n}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-map-region.is-north{grid-column:1/3;width:58%;justify-self:end}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-map-region.is-trondelag{grid-column:1/3;width:46%;justify-self:center}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-map-region.is-west{grid-column:1;min-height:78px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-map-region.is-east{grid-column:2;min-height:78px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-map-region.is-active{border-color:rgba(246,200,0,.62);background:rgba(246,200,0,.13);color:#ffe168;box-shadow:0 0 0 1px rgba(246,200,0,.08) inset}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-details{border-top:1px solid rgba(255,255,255,.07);padding-top:10px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-details>summary{cursor:pointer;color:#ffe168;font-size:12px;font-weight:900}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-grid{display:grid;gap:10px;margin-top:12px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-macro{display:grid;gap:8px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(0,0,0,.14)}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-macro.is-active{border-color:rgba(246,200,0,.34)}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-macro>header{display:flex;justify-content:space-between;gap:10px;align-items:baseline}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-macro>header strong{color:#fff}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-macro>header span{color:rgba(255,255,255,.45);font-size:10px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-macro>p,\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-overlays p,\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-languages>p{margin:0;color:rgba(255,255,255,.66);font-size:11px;line-height:1.5}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-features,\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-regions,\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-languages>div{display:flex;flex-wrap:wrap;gap:6px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-features span,\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-regions span,\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-languages>div>span{padding:5px 7px;border:1px solid rgba(255,255,255,.075);border-radius:999px;color:rgba(255,255,255,.58);font-size:10px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-regions span.is-active{border-color:rgba(246,200,0,.38);background:rgba(246,200,0,.09);color:#ffe168}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-overlays,\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-languages{display:grid;gap:9px;margin-top:15px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-overlays h3,\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-languages h3{margin:0;color:#fff;font-size:13px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-overlays>div{display:grid;gap:8px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-overlays article{display:grid;gap:5px;padding:10px;border:1px solid rgba(255,255,255,.07);border-radius:14px}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-overlays article.is-active{border-color:rgba(246,200,0,.34);background:rgba(246,200,0,.05)}\nbody.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-overlays article strong{color:rgba(255,255,255,.88);font-size:12px}\n'''
if ".hg-language-atlas-map-region" not in css:
    css += atlas_css
write_text(css_path, css)

# Documentation: national atlas is reference/navigation, while dialect entries remain area-owned.
doc_path = "docs/SPRAKLEKSIKON.md"
doc = read_text(doc_path)
section = '''\n\n## Språkatlas Norge v1\n\nSpråkleksikonet har et nasjonalt, skjematisk språkatlas i `data/leksikon/sprak/norge_atlas_v1.json`. Atlaset bruker fire grove hovedgrupper – **austlandsk, vestlandsk, trøndersk og nordnorsk** – og deler dem videre i pedagogiske soner. Dette er navigasjon og faglig kontekst, ikke polygoner som påstår at en dialekt stopper ved en kommunegrense. Dialektgrenser er glidende, og målmerker krysser regioninndelingene.\n\nPlace-artikler kan peke inn i atlaset med `atlas_region_ids` og `atlas_overlay_ids`. Det endrer **ikke** eierskapsregelen: konkrete oppføringer med `layer: "dialect"` må fortsatt eies av et canonical Place med `placeScope: "area"`. Et områdeanker betyr dokumentert relevans, aldri at alle beboere snakker slik eller at formen er unik på stedet.\n\nBymål, historiske sosiolekter og multietniske talestiler ligger som egne overlegg. Samiske språk og de nasjonale minoritetsspråkene kvensk, romani og romanes ligger i et separat språkstatuslag og skal aldri behandles som norske dialekter.\n'''
if "## Språkatlas Norge v1" not in doc:
    doc += section
write_text(doc_path, doc)

# Permanent regression coverage for national scope and anti-stereotype semantics.
test_path = "tests/place-language-dialect-scope.test.mjs"
test = read_text(test_path)
atlas_test = r'''\n\ntest("Språkatlas Norge dekker hele dialektlandskapet uten å gjøre språkgrenser eller mennesker absolutte", () => {\n  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");\n  assert.equal(atlas.schema, "history_go_language_atlas_v1");\n  assert.equal(atlas.scope, "Norge");\n\n  const macroIds = new Set((atlas.macro_regions || []).map(row => text(row.id)));\n  assert.deepEqual(macroIds, new Set(["austlandsk", "vestlandsk", "trondersk", "nordnorsk"]));\n\n  const regionIds = new Set((atlas.dialect_regions || []).map(row => text(row.id)));\n  for (const required of [\n    "vikvaersk", "midtostlandsk", "opplandsmal", "midlandsmal",\n    "sorleg_e_mal", "sorleg_ea_mal", "sorvestlandsk_a_mal", "nordvestlandsk_e_mal",\n    "inntrondersk", "uttrondersk", "nordland", "troms", "finnmark"\n  ]) assert.ok(regionIds.has(required), `Språkatlaset mangler ${required}`);\n\n  for (const region of atlas.dialect_regions || []) {\n    assert.ok(macroIds.has(text(region.macro_region_id)), `${region.id}: ukjent hovedgruppe`);\n    assert.ok(text(region.area_summary), `${region.id}: mangler geografisk/faglig avgrensing`);\n    assert.ok(Array.isArray(region.sources) && region.sources.length >= 2, `${region.id}: trenger flere kildebelegg`);\n    for (const source of region.sources) assert.match(String(source?.url || ""), /^https:\/\//, `${region.id}: kilde må være HTTPS`);\n  }\n\n  const languageIds = new Set((atlas.language_status_layers || []).map(row => text(row.id)));\n  for (const required of ["nordsamisk", "lulesamisk", "sorsamisk", "pitesamisk", "umesamisk", "skoltesamisk", "kvensk", "romani", "romanes"]) {\n    assert.ok(languageIds.has(required), `Atlaset mangler separat språkstatus for ${required}`);\n  }\n  for (const language of atlas.language_status_layers || []) {\n    assert.equal(language.kind, "language", `${language.id}: urfolks-/minoritetsspråk må modelleres som språk`);\n    assert.equal(language.not_norwegian_dialect, true, `${language.id}: må eksplisitt være skilt fra norsk dialektinndeling`);\n  }\n\n  assert.match(String(atlas.notes || ""), /ikke et kart over faste språkgrenser/i);\n  assert.ok((atlas.editorial_principles || []).some(value => /aldri.*alle|alle.*aldri/i.test(String(value))), "Atlaset må avvise generalisering fra område til alle beboere");\n});\n\ntest("Place-artikler kobler seg til Språkatlas Norge uten å lage en ny PlaceCard-runding", () => {\n  const expected = new Map([\n    ["frogner", ["austlandsk", "midtostlandsk"]],\n    ["sagene", ["austlandsk", "midtostlandsk"]],\n    ["vaalerenga", ["austlandsk", "midtostlandsk"]],\n    ["holmlia", ["austlandsk", "midtostlandsk"]],\n    ["etnesjoen_tettstad", ["vestlandsk", "sorvestlandsk_a_mal"]],\n    ["svartlamon_trondheim", ["trondersk"]]\n  ]);\n  for (const [placeId, regionIds] of expected) {\n    const relative = languageManifest.place_files?.[placeId];\n    assert.ok(relative, `${placeId}: må være registrert i Språkleksikon-manifestet`);\n    const article = json(relative);\n    assert.deepEqual(article.atlas_region_ids, regionIds, `${placeId}: feil atlaskobling`);\n  }\n\n  const places = loadPlacesById();\n  assert.equal(places.get("svartlamon_trondheim")?.placeScope, "area", "Trondheim-piloten må fortsatt være area-eid");\n  const trondheim = json(languageManifest.place_files.svartlamon_trondheim);\n  assert.ok((trondheim.entries || []).length >= 4, "Trondheim-piloten skal ha reelt språkinnhold");\n  for (const entry of trondheim.entries || []) {\n    assert.equal(entry.layer, "dialect");\n    assert.ok(Array.isArray(entry.sources) && entry.sources.length >= 2, `${entry.id}: trenger flere kildebelegg`);\n  }\n\n  const runtime = read("js/ui/place-language-layer.js");\n  const css = read("css/place-language-layer.css");\n  assert.match(runtime, /ATLAS_PATH\s*=\s*["']data\/leksikon\/sprak\/norge_atlas_v1\.json["']/);\n  assert.match(runtime, /function\s+renderLanguageAtlas\s*\(/);\n  assert.match(runtime, /Språkatlas Norge/);\n  assert.match(runtime, /hg-language-atlas-map/);\n  assert.match(runtime, /Egne språk – ikke norske dialekter/);\n  assert.match(css, /hg-language-atlas-map-region/);\n  assert.doesNotMatch(runtime, /data-place-tab=["']atlas["']/i);\n});\n'''
if 'test("Språkatlas Norge dekker hele dialektlandskapet' not in test:
    test += atlas_test
write_text(test_path, test)

print("Nasjonalt språkatlas v1 materialisert")
