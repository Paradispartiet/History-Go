#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PLACE_ID = "etne_pumptrack"
STORY_ID = "st_etne_pumptrack_opning_med_sykkelkjetting"
ARTICLE_PATH = "data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json"
STORY_PATH = "data/stories/stories_etnesjoen_sport_rounds_batch1.json"


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def write(path, value):
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def upsert(rows, item, key="id"):
    marker = item[key]
    for index, row in enumerate(rows):
        if isinstance(row, dict) and row.get(key) == marker:
            rows[index] = item
            return
    rows.append(item)


place_path = "data/places/sport/vestland/etne/etne_pumptrack.json"
places = read(place_path)
assert len(places) == 1 and places[0]["id"] == PLACE_ID
place = places[0]
place.update({
    "externalLinks": [
        {
            "type": "official",
            "label": "Shapers – Etne pumptrack",
            "url": "https://www.shapers.no/prosjekter/etne-pumptrack",
            "lang": "nb",
            "verifiedAt": "2026-07-19",
            "note": "Prosjektsida dokumenterer over 1 200 m² asfalt, wallride, to table tops og bruk med sykkel, sparkesykkel og skateboard."
        },
        {
            "type": "news",
            "label": "Grannar – Flyg høgt på BMX-sykkel",
            "url": "https://www.grannar.no/nyhende/flyg-hogt-pa-bmx-sykkel/153573",
            "lang": "nn",
            "verifiedAt": "2026-07-19",
            "note": "Reportasje frå opninga 15. juni 2024 med ordførar, brukarar og ein av dei som bygde banen."
        },
        {
            "type": "official",
            "label": "Etne kommune – idrett og friluftsliv",
            "url": "https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/",
            "lang": "nn",
            "verifiedAt": "2026-07-19",
            "note": "Kommunen fører pumptrackbanen som ein eigen anleggstype ved sida av skateparkar og utandørs idrettsanlegg."
        }
    ],
    "emne_ids": [
        "em_sport_idrettsarena_sted",
        "em_sport_treningsinfrastruktur",
        "em_sport_idrettsopplaring",
        "em_sport_teknikk",
        "em_sport_trening_oving",
        "em_sport_frivillighet_organisering"
    ],
    "underbadge_ids": [
        "sykling",
        "skate",
        "naermiljoanlegg",
        "balanse",
        "romlesing",
        "koordinasjon",
        "utendors_trening",
        "lokalidrett"
    ],
    "training_profile": {
        "title": "Trygg første flyt i Etne pumptrack",
        "summary": "Tre lågterskeløvingar for å lese køyreretninga, pumpe roleg gjennom dei minste kulane og avslutte linja kontrollert utan hopp eller konkurransefart.",
        "safety": "Bruk hjelm og nødvendig beskyttelse. Kontroller at asfaltflata er tørr, heil og fri for grus. Sjå kva veg dei andre køyrer, vent til linja er heilt fri, og start på den lettaste delen. Hald god avstand, ikkje stopp midt i banen, og gå ut av avslutningssona straks runden er ferdig. Barn og uerfarne brukarar bør ha med ein ansvarleg vaksen eller erfaren rettleiar. Ingen av øvingane krev hopp, wallride eller høg fart.",
        "exercises": [
            {
                "id": "etne_pumptrack_les_flyten",
                "title": "Les banen frå utsida",
                "instruction": "Stå utanfor asfalten og følg éi samanhengande linje med blikket. Finn start, køyreretning, blinde punkt, utgang og ei trygg ventesone før du går inn.",
                "duration_minutes": 5,
                "intensity": "svært lett",
                "why": "Ei pumptrack blir tryggare når brukaren forstår flyten og veit kvar andre kan kome inn i linja."
            },
            {
                "id": "etne_pumptrack_rull_og_stopp",
                "title": "Rull og stopp på flat sone",
                "instruction": "På ei fri og flat tilkomstflate rullar du i gangfart og stoppar kontrollert før eit sjølvvalt punkt. Gjenta tre gonger før du vurderer sjølve banen.",
                "duration_minutes": 6,
                "intensity": "lett",
                "why": "Kontrollert bremsing må sitje før brukaren går inn i ein samanhengande pumptracklinje."
            },
            {
                "id": "etne_pumptrack_lav_flyt",
                "title": "Låg flyt gjennom lettaste linje",
                "instruction": "Vent til banen er fri. Rull roleg gjennom den lettaste synlege linja, hald begge hjula i bakken og bruk mjuke arm- og beinrørsler over kulane. Gå heilt ut før neste brukar startar.",
                "duration_minutes": 8,
                "intensity": "lett",
                "why": "Øvinga lærer pumpetrackrytme og sambruk utan hopp, wallride eller konkurransefart."
            }
        ]
    },
    "works": [
        {
            "id": "etne_pumptrack_1200_kvadratmeter",
            "title": "Over 1 200 m² samanhengande asfaltbane",
            "type": "idrettsanlegg",
            "kind": "large_asphalt_pumptrack",
            "year": 2024,
            "desc": "Shapers dokumenterer eit pumptrackanlegg på over 1 200 kvadratmeter for sykkel, sparkesykkel og skateboard.",
            "why_here": "Storleiken og den samanhengande asfaltflata skil anlegget frå både ein vanleg sykkelsti og den eldre BMX-/skateparken.",
            "source_note": "Shapers, kontrollert 19. juli 2026."
        },
        {
            "id": "etne_pumptrack_wallride_og_tabletops",
            "title": "Wallride og to table tops",
            "type": "banedesign",
            "kind": "pumptrack_features",
            "year": 2024,
            "desc": "Prosjektsida framhevar flytlinjer, ein wallride og to table tops som sentrale formelement.",
            "why_here": "Elementa viser korleis høgde, kurver og rytme blir bygde inn i asfalten for å skape fart utan tradisjonell tråkking.",
            "source_note": "Shapers. Rundingsinnhaldet dokumenterer elementa, men gir ikkje trikkinstruksjon."
        },
        {
            "id": "etne_pumptrack_opning_15_juni_2024",
            "title": "Opna 15. juni 2024",
            "type": "opning",
            "kind": "public_opening",
            "year": 2024,
            "desc": "Grannar rapporterte frå den offentlege opninga laurdag 15. juni 2024, der opningssnora var ei sykkelkjetting.",
            "why_here": "Datoen høyrer til den nye pumptracken og skal ikkje flyttast til den separate BMX- og skateparken.",
            "source_note": "Grannar, publisert 15. juni 2024 og oppdatert 18. juni 2024."
        },
        {
            "id": "etne_pumptrack_uorganisert_aktivitet",
            "title": "Arena for uorganisert hjulaktivitet",
            "type": "lokalt_aktivitetstilbod",
            "kind": "self_organised_wheel_sports",
            "year": 2024,
            "desc": "Ved opninga la kommunen vekt på at barn og unge også treng arenaer for aktivitet utan fast lag, treningstid eller konkurranseoppsett.",
            "why_here": "Plasseringa nær skule, skatepark og kunstgrasbane gjer pumptracken til eit lågterskeltilbod i det samla aktivitetsområdet.",
            "source_note": "Grannar og Etne kommune."
        }
    ],
    "civication_store": [
        {
            "id": "etne_pumptrack_flytmodell",
            "title": "Flytmodellen av Etne pumptrack",
            "type": "banemodell",
            "kind": "physical_object",
            "desc": "Ein fysisk miniatyr av ei samanhengande pumptracklinje med kulerekke, dosert sving, wallride og to markerte table tops.",
            "placeSpecificReason": "Kombinasjonen av stor asfaltflate og dei dokumenterte formelementa representerer akkurat Etne pumptrack.",
            "historicalFunction": "Gjer 2024-utvidinga av det lokale aktivitetsområdet synleg som ein ny type eigenorganisert idrettsanlegg.",
            "physicalObject": True,
            "placeSpecific": True,
            "storePrice": 45,
            "currency": "PC",
            "collection": PLACE_ID,
            "collectable": True,
            "civicationUse": ["baneforstaing", "flyt", "anleggsdesign"]
        },
        {
            "id": "etne_pumptrack_sykkelkjettingkort",
            "title": "Opningskortet med sykkelkjetting",
            "type": "opningsminne",
            "kind": "physical_object",
            "desc": "Eit fysisk samlarkort forma rundt sykkelkjettingen som blei brukt som opningssnor 15. juni 2024.",
            "placeSpecificReason": "Den uvanlege opningssnora er dokumentert direkte frå opningsdagen i Etne.",
            "historicalFunction": "Koplar den symbolske opningshandlinga til kommunens satsing på uorganisert aktivitet.",
            "physicalObject": True,
            "placeSpecific": True,
            "storePrice": 25,
            "currency": "PC",
            "collection": PLACE_ID,
            "collectable": True,
            "civicationUse": ["lokalhistorie", "opningsritual", "hjulidrett"]
        }
    ],
    "brands": [
        {
            "id": "shapers_norge",
            "name": "Shapers",
            "brand_kind": "facility_builder",
            "brand_type": "pumptrack_design_and_construction"
        },
        {
            "id": "etne_kommune",
            "name": "Etne kommune",
            "brand_kind": "public_actor",
            "brand_type": "municipal_facility_actor"
        },
        {
            "id": "etne_pumptrack_anlegg",
            "name": "Etne pumptrack",
            "brand_kind": "facility_identity",
            "brand_type": "local_pumptrack"
        }
    ],
    "for_na": {
        "title": "Frå idrettsområde til samanhengande hjulpark",
        "before": "Området hadde kunstgrasbane og ein separat BMX-/skatepark, men ikkje den store, samanhengande asfalt-pumptracken som finst i dag.",
        "now": "Etne pumptrack er eit eige anlegg på over 1 200 m² med flytlinjer, wallride og to table tops, ope for sykkel, sparkesykkel og skateboard.",
        "change": "Opninga i juni 2024 utvida det lokale idrettsområdet med ei ny lågterskelform for uorganisert hjulaktivitet, utan å erstatte den eldre skateparken eller hovudstadionet.",
        "lookFor": [
            "den samanhengande rytmen mellom kulane",
            "wallriden og dei to table tops-elementa",
            "kvar start, utgang og ventesoner ligg",
            "skiljet mot BMX-/skateparken",
            "nærleiken til skule og kunstgrasbane"
        ],
        "sources": [
            "https://www.shapers.no/prosjekter/etne-pumptrack",
            "https://www.grannar.no/nyhende/flyg-hogt-pa-bmx-sykkel/153573",
            "https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/"
        ]
    }
})
for forbidden in ("rounds", "rundinger", "routes", "tasks_profile", "play", "nature_profile"):
    place.pop(forbidden, None)
write(place_path, places)

people = [
    (
        "data/people/politikk/vestland/etne/mette_heidi_ekrheim_bergsvaag.json",
        {
            "id": "mette_heidi_ekrheim_bergsvaag",
            "name": "Mette Heidi Ekrheim Bergsvåg",
            "initials": "MHEB",
            "visual": {"designCode": "person_politics_miniature"},
            "desc": "Ordføraren som opna Etne pumptrack 15. juni 2024 ved å klippe ei sykkelkjetting som opningssnor.",
            "tags": ["politikk", "ordforar", "Etne", "pumptrack", "opning", "uorganisert_aktivitet"],
            "placeId": PLACE_ID,
            "places": [PLACE_ID],
            "category": "politikk",
            "year": 2024,
            "period": "Offisiell opning av Etne pumptrack i 2024",
            "popupDesc": "Grannar dokumenterte Mette Heidi Ekrheim Bergsvåg som ordførar ved opninga av den nye pumptracken 15. juni 2024. Ho klipte ei sykkelkjetting i staden for ei vanleg snor og framheva verdien av uorganisert aktivitet nær skateparken og kunstgrasbanen. Kortet dokumenterer rolla hennar på opningsdagen, ikkje eit seinare eller noverande verv.",
            "image": "",
            "cardImage": "",
            "source_urls": ["https://www.grannar.no/nyhende/flyg-hogt-pa-bmx-sykkel/153573"],
            "verifiedAt": "2026-07-19"
        }
    ),
    (
        "data/people/sport/vestland/etne/dzintrs_vitols.json",
        {
            "id": "dzintrs_vitols",
            "name": "Dzintrs Vitols",
            "initials": "DV",
            "visual": {"designCode": "person_athlete_miniature"},
            "desc": "Latvisk BMX-utøvar med lang baneerfaring som Grannar dokumenterte både som brukar og medbyggjar av pumptracken i Etne.",
            "tags": ["sport", "BMX", "pumptrack", "banebygging", "Etne", "Latvia"],
            "placeId": PLACE_ID,
            "places": [PLACE_ID],
            "category": "sport",
            "year": 2024,
            "period": "Bygging og opning av Etne pumptrack i 2024",
            "popupDesc": "I Grannar si opningsreportasje blir Dzintrs Vitols omtalt som ein latvisk BMX-utøvar med 16 års erfaring frå slike baner og som ein av dei som hadde vore med på å byggje banen i Etne. People-kortet avgrensar seg til den dokumenterte rolla ved bygginga og opningsdagen.",
            "image": "",
            "cardImage": "",
            "source_urls": ["https://www.grannar.no/nyhende/flyg-hogt-pa-bmx-sykkel/153573"],
            "verifiedAt": "2026-07-19"
        }
    )
]
manifest = read("data/people/manifest.json")
for path, person in people:
    write(path, [person])
    relative = path.removeprefix("data/")
    if relative not in manifest["files"]:
        manifest["files"].append(relative)
write("data/people/manifest.json", manifest)

relations = read("data/relations.json")
upsert(relations, {
    "id": "rel_mette_heidi_ekrheim_bergsvaag_etne_pumptrack",
    "type": "offisiell_opning",
    "place": PLACE_ID,
    "person": "mette_heidi_ekrheim_bergsvaag",
    "label": "Opna pumptracken 15. juni 2024",
    "why": "Grannar dokumenterte ordføraren som den som klipte sykkelkjettingen ved den offentlege opninga.",
    "source": "https://www.grannar.no/nyhende/flyg-hogt-pa-bmx-sykkel/153573"
})
upsert(relations, {
    "id": "rel_dzintrs_vitols_etne_pumptrack",
    "type": "medbyggjar_og_bmxutovar",
    "place": PLACE_ID,
    "person": "dzintrs_vitols",
    "label": "Med på å byggje og demonstrere banen",
    "why": "Grannar omtala Vitols som erfaren BMX-utøvar og som ein av dei som hadde vore med på å byggje banen i Etne.",
    "source": "https://www.grannar.no/nyhende/flyg-hogt-pa-bmx-sykkel/153573"
})
write("data/relations.json", relations)

stories = read(STORY_PATH)
story = {
    "id": STORY_ID,
    "type": "public_opening_of_self_organised_sports_facility",
    "title": "Sykkelkjettingen som opningssnor",
    "year": 2024,
    "date": "2024-06-15",
    "place_id": PLACE_ID,
    "person_ids": ["mette_heidi_ekrheim_bergsvaag", "dzintrs_vitols"],
    "summary": "Den nye pumptracken opna 15. juni 2024 med ei sykkelkjetting som snor og demonstrasjonar frå erfarne BMX-køyrarar.",
    "story": "Laurdag 15. juni 2024 blei den nye pumptracken i Etne offisielt opna. I staden for ei vanleg raud snor fekk ordførar Mette Heidi Ekrheim Bergsvåg ei sykkelkjetting å klippe. Grannar knytte opningshandlinga direkte til bodskapen om at barn og unge også treng gode arenaer for aktivitet som ikkje er organisert gjennom faste lag og treningstider.\n\nBanen var samtidig meir enn eit symbol. Shapers dokumenterer over 1 200 kvadratmeter samanhengande asfalt, med flytlinjer, wallride og to table tops for sykkel, sparkesykkel og skateboard. I opningsreportasjen viste erfarne køyrarar kor mykje fart og høgde forma kunne gi. Dzintrs Vitols frå Latvia blei omtalt både som erfaren BMX-utøvar og som ein av dei som hadde vore med på å byggje banen.\n\nHistory Go skil pumptracken strengt frå BMX- og skateparken ved sida av. Pumptracken er 2024-anlegget med samanhengande asfaltflyt. Den eldre BMX-/skatearenaen er eit anna stadobjekt med ei anna historie. Nærleiken mellom dei er likevel ein del av poenget: saman med skulen og kunstgrasbanen dannar dei eit breitt aktivitetsområde der organisert idrett og eigenorganisert hjulaktivitet møtest.",
    "sources": [
        {"title": "Grannar: Flyg høgt på BMX-sykkel", "url": "https://www.grannar.no/nyhende/flyg-hogt-pa-bmx-sykkel/153573"},
        {"title": "Shapers: Etne pumptrack", "url": "https://www.shapers.no/prosjekter/etne-pumptrack"},
        {"title": "Etne kommune: Idrett og friluftsliv", "url": "https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/"}
    ],
    "tags": ["Etne pumptrack", "opning", "sykkelkjetting", "BMX", "uorganisert aktivitet", "2024"],
    "related_people": ["mette_heidi_ekrheim_bergsvaag", "dzintrs_vitols"],
    "related_places": ["etne_bmx_og_skatepark", "etne_idrettsanlegg", "skakke_kultursenter_etne"],
    "score": {"narrative": 5, "historical": 4, "source": 4, "play_value": 5, "originality": 5, "total": 23},
    "arc": {
        "start": "Ei ny asfaltbane blir ferdig midt i aktivitetsområdet.",
        "middle": "Ordføraren klipper ei sykkelkjetting medan erfarne køyrarar demonstrerer banen.",
        "end": "Pumptracken blir eit nytt lågterskeltilbod for hjulaktivitet ved sida av skatepark og kunstgras."
    },
    "next_scenes": [
        {"place_id": "etne_bmx_og_skatepark", "reason": "Den separate skateparken viser den eldre hjulidrettsarenaen som pumptracken ikkje skal blandast saman med."},
        {"place_id": "etne_idrettsanlegg", "reason": "Hovudanlegget viser kontrasten mellom lagidrett og den friare pumptrackbruken."},
        {"place_id": "skakke_kultursenter_etne", "reason": "Skule- og kulturmiljøet forklarer kvifor pumptracken ligg så tett på kvardagsrutene til barn og unge."}
    ]
}
upsert(stories, story)
write(STORY_PATH, stories)

articles = read(ARTICLE_PATH)
article = {
    "place_id": PLACE_ID,
    "title": "Etne pumptrack",
    "version": 1,
    "visual": {"designCode": "article_sports_history_miniature"},
    "popupDesc": "Det store asfaltanlegget som opna i 2024 og gjorde pumptrack til ein eigen del av aktivitetsområdet ved Skakke og stadion.",
    "wikiText": [
        "Etne pumptrack er eit over 1 200 kvadratmeter stort asfaltanlegg for sykkel, sparkesykkel og skateboard. Shapers framhevar samanhengande flyt, wallride og to table tops. Forma gjer at brukaren kan skape og halde fart gjennom vektoverføring i kular og doserte svingar, men History Go-rundinga held seg til trygg romlesing og låg fart.",
        "Anlegget blei offisielt opna 15. juni 2024. Grannar dokumenterte at ordførar Mette Heidi Ekrheim Bergsvåg klipte ei sykkelkjetting som opningssnor og la vekt på behovet for uorganisert aktivitet. Reportasjen omtala også BMX-utøvaren Dzintrs Vitols som ein av dei som hadde vore med på å byggje banen.",
        "Pumptracken ligg nær skule, skatepark og kunstgrasbane, men er eit eige stadobjekt. Året 2024, den store asfaltflata og Shapers-elementa høyrer til pumptracken. Dei skal ikkje brukast som opningshistorie for den separate BMX- og skateparken."
    ],
    "summary": {
        "one_liner": "Eit stort 2024-anlegg for samanhengande hjulflyt, opna med ei sykkelkjetting som snor.",
        "themes": ["pumptrack", "eigenorganisert idrett", "banedesign", "ungdomsaktivitet", "lokal anleggsutvikling"],
        "tone": ["idrettsfagleg", "stadsspesifikk", "tryggleiksmedviten"]
    },
    "facts": [
        {"id": "fact_etne_pumptrack_01", "label": "Over 1 200 m² asfalt", "desc": "Shapers oppgir at anlegget har meir enn 1 200 kvadratmeter asfaltbane.", "confidence": "high", "sources": ["Shapers"]},
        {"id": "fact_etne_pumptrack_02", "label": "Wallride og to table tops", "desc": "Dei dokumenterte formelementa inngår i den samanhengande pumptrackflyten.", "confidence": "high", "sources": ["Shapers"]},
        {"id": "fact_etne_pumptrack_03", "label": "Opna 15. juni 2024", "desc": "Grannar rapporterte frå opninga med sykkelkjetting som snor.", "confidence": "high", "sources": ["Grannar"]},
        {"id": "fact_etne_pumptrack_04", "label": "Tre typar hjulbruk", "desc": "Anlegget er presentert for sykkel, sparkesykkel og skateboard.", "confidence": "high", "sources": ["Shapers"]}
    ],
    "chronology": [
        {"id": "chrono_etne_pumptrack_01", "year": 2024, "date": "2024-06-15", "period": "Offisiell opning", "desc": "Pumptracken opnar med ordførar, sykkelkjetting og demonstrasjonar i banen.", "confidence": "high", "sources": ["Grannar"]},
        {"id": "chrono_etne_pumptrack_02", "year": 2025, "period": "Dokumentert som ferdig prosjekt", "desc": "Shapers fører Etne pumptrack i prosjektoversikta si og dokumenterer storleik, bruk og formelement.", "confidence": "high", "sources": ["Shapers"]}
    ],
    "built_environment": {
        "built_year": 2024,
        "architects": [],
        "builders": ["Shapers"],
        "materials": ["asfalt", "forma terrengmassar"],
        "style": ["samanhengande pumptrack med doserte svingar og kular"],
        "original_function": "Pumptrack for eigenorganisert hjulaktivitet",
        "current_function": "Pumptrack for sykkel, sparkesykkel og skateboard",
        "changes": ["nytt separat asfaltanlegg opna i 2024", "integrert i aktivitetsområdet ved skule, skatepark og kunstgras"]
    },
    "stories": [
        {"id": "story_etne_pumptrack_01", "entry_id": STORY_ID, "title": "Sykkelkjettingen som opningssnor", "one_liner": "Ei sykkelkjetting gjorde opninga til eit lokalt ritual for den nye hjulidrettsarenaen.", "confidence": "high", "sources": ["Grannar", "Shapers"]}
    ],
    "interpretation": {
        "what_to_notice": ["korleis kulane dannar rytme", "wallriden og dei to table tops", "køyreretning og ventesoner", "avstanden til skateparken", "plasseringa mellom skule- og idrettsfunksjonar"],
        "why_it_matters": ["Pumptracken viser korleis kommunen kan gi uorganisert aktivitet ein permanent og synleg arena", "Anlegget utvidar idrettsområdet utan å erstatte dei eksisterande stadene rundt"],
        "counterpoints": ["2024 er ikkje opningsåret til BMX- og skateparken", "Dokumentasjon av wallride og hopp er ikkje det same som trikkinstruksjon", "Aktuelle driftsreglar og banestatus må alltid kontrollerast på staden"]
    },
    "links": {"entry_ids": [STORY_ID], "related_places": ["etne_bmx_og_skatepark", "etne_idrettsanlegg", "skakke_kultursenter_etne"], "related_people": ["mette_heidi_ekrheim_bergsvaag", "dzintrs_vitols"]},
    "sources": [
        {"title": "Shapers: Etne pumptrack", "url": "https://www.shapers.no/prosjekter/etne-pumptrack"},
        {"title": "Grannar: Flyg høgt på BMX-sykkel", "url": "https://www.grannar.no/nyhende/flyg-hogt-pa-bmx-sykkel/153573"},
        {"title": "Etne kommune: Idrett og friluftsliv", "url": "https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/"}
    ],
    "ui": {"mini_panel": {"show": True, "highlights": ["fact_etne_pumptrack_01", "fact_etne_pumptrack_03", "story_etne_pumptrack_01"], "max_items": 6}}
}
upsert(articles, article, key="place_id")
write(ARTICLE_PATH, articles)

report = ROOT / "reports/etne-pumptrack-rounds-batch1.md"
report.write_text("""# Etne pumptrack – rundingsbatch 1

## Resultat

Alle ni rundingar i den dokumenterte sportprofilen er fylte: `people`, `training`, `badges`, `works`, `civication`, `brands`, `før_nå`, `fortellinger` og `leksikon`.

## Avgrensingar

- Pumptracken er det separate asfaltanlegget som opna 15. juni 2024.
- Årstalet og Shapers-elementa blir ikkje flytta til BMX- og skateparken.
- People-rundinga dokumenterer rollene på byggje- og opningsdagen, ikkje seinare verv.
- Treninga er avgrensa til romlesing, bremsing og låg flyt med hjula i bakken.
- Ingen manuell rundingsoverstyring eller irrelevante natur-, oppgåve-, leike- eller ruterundingar.

## Kjelder

- Shapers: Etne pumptrack
- Grannar: Flyg høgt på BMX-sykkel, 15. juni 2024
- Etne kommune: idrett og friluftsliv
""", encoding="utf-8")

print("Etne pumptrack round data generated")
