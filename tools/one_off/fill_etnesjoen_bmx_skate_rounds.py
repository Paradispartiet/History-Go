#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PLACE_ID = "etne_bmx_og_skatepark"
PERSON_ID = "etne_bmx_og_skatefellesskapet"
STORY_ID = "st_etne_bmx_skate_eigen_arena_i_stadionvegen"


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def write(path, value):
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def append_unique(rows, item, key="id"):
    marker = item.get(key)
    for index, row in enumerate(rows):
        if isinstance(row, dict) and row.get(key) == marker:
            rows[index] = item
            return
    rows.append(item)


place_path = "data/places/sport/vestland/etne/etne_bmx_og_skatepark.json"
places = read(place_path)
assert len(places) == 1 and places[0]["id"] == PLACE_ID
place = places[0]
place.update({
    "externalLinks": [
        {
            "type": "official",
            "label": "Brønnøysundregistrene – Etne BMX og Skatepark",
            "url": "https://virksomhet.brreg.no/nb/oppslag/enheter/899086112",
            "lang": "nb",
            "verifiedAt": "2026-07-19"
        },
        {
            "type": "official",
            "label": "Etne kommune – fritidstilbod",
            "url": "https://www.etne.kommune.no/mittetne/framside/fritidstilbod.14232.aspx",
            "lang": "nn",
            "verifiedAt": "2026-07-19"
        },
        {
            "type": "official",
            "label": "Etne kommune – idrett og friluftsliv",
            "url": "https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/",
            "lang": "nn",
            "verifiedAt": "2026-07-19"
        },
        {
            "type": "official",
            "label": "Etne Idrettslag – Anlegg i Etne 2035",
            "url": "https://www.etneil.no/verktoykasse/anlegg-2035",
            "lang": "nn",
            "verifiedAt": "2026-07-19"
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
        "skate", "sykling", "skatepark", "naermiljoanlegg", "balanse",
        "skatebalanse", "koordinasjon", "utendors_trening", "lokalidrett", "frivillighet"
    ],
    "training_profile": {
        "title": "Trygg innføring i BMX- og skateparken",
        "summary": "Tre lågterskeløvingar som lærer brukaren å lese anlegget, halde balansen og dele køyrerommet utan hopp eller avanserte triks.",
        "safety": "Bruk hjelm og nødvendig beskyttelse. Sjekk at anlegget er ope, tørt og fritt for skadar og lause gjenstandar. Gå aldri inn i ei aktiv køyrelinje, vent til førre brukar er heilt ute, og start berre på flat mark eller den lettaste synlege linja. Barn og uerfarne brukarar bør ha med ein ansvarleg vaksen eller erfaren rettleiar.",
        "exercises": [
            {
                "id": "etne_bmx_skate_les_linja_til_fots",
                "title": "Les linja til fots",
                "instruction": "Stå utanfor køyreflata og følg éi enkel linje med blikket frå start til utgang. Peik ut inngang, fartsområde, utgang og trygg ventesone.",
                "duration_minutes": 5,
                "intensity": "svært lett",
                "why": "Øvinga lærer romlesing og trygg samhandling før hjul eller brett blir tekne i bruk."
            },
            {
                "id": "etne_bmx_skate_balanse_og_brems",
                "title": "Balanse og kontrollert stopp",
                "instruction": "På ei fri, flat og tørr flate rullar du i gangfart mellom to punkt og stoppar kontrollert før endepunktet. Gjenta tre gonger utan hopp.",
                "duration_minutes": 6,
                "intensity": "lett",
                "why": "Balanse og bremsing er grunnlaget for å bruke anlegget utan å miste kontroll."
            },
            {
                "id": "etne_bmx_skate_ein_og_ein",
                "title": "Éin brukar gjennom linja",
                "instruction": "Vel den lettaste opne linja. Vent til ho er heilt fri, køyr roleg gjennom utan triks, og gå ut av avslutningssona før neste brukar startar.",
                "duration_minutes": 8,
                "intensity": "lett",
                "why": "Øvinga trenar flyt, køkultur og tydeleg veksling mellom brukarar."
            }
        ]
    },
    "works": [
        {
            "id": "etne_bmx_skate_registrert_foreining",
            "title": "Registrert BMX- og skateforeining",
            "type": "idrettsorganisering",
            "kind": "registered_sports_facility_association",
            "year": None,
            "desc": "Brønnøysundregistrene fører Etne BMX og Skatepark som foreining med drift av idrettsanlegg som registrert aktivitet.",
            "why_here": "Organiseringa gir BMX- og skatearenaen eit eige institusjonelt anker.",
            "source_note": "Brønnøysundregistrene, kontrollert 19. juli 2026."
        },
        {
            "id": "etne_bmx_skate_stadionvegen_12",
            "title": "BMX- og skatearenaen i Stadionvegen 12",
            "type": "idrettsanlegg",
            "kind": "bmx_and_skate_facility",
            "year": None,
            "desc": "Den registrerte adressa plasserer arenaen i Stadionvegen-korridoren.",
            "why_here": "Stadobjektet omfattar BMX- og skatefunksjonen, ikkje stadion, tennis eller pumptrack.",
            "source_note": "Brønnøysundregistrene og Etne kommune, kontrollert 19. juli 2026."
        },
        {
            "id": "etne_bmx_skate_kommunalt_tilbod",
            "title": "Eige kommunalt fritidstilbod",
            "type": "lokalt_aktivitetstilbod",
            "kind": "municipal_leisure_listing",
            "year": None,
            "desc": "Etne kommune fører BMX- og skateparken som eit eige fritids- og idrettstilbod.",
            "why_here": "Oppføringa stadfestar den sjølvstendige lokale aktivitetsfunksjonen.",
            "source_note": "Etne kommune, kontrollert 19. juli 2026."
        },
        {
            "id": "etne_bmx_skate_anlegg_2035",
            "title": "Eigen aktør i lokal anleggsplanlegging",
            "type": "anleggsutvikling",
            "kind": "local_facility_planning_actor",
            "year": None,
            "desc": "Etne IL si anleggsplanlegging behandlar Etne BMX og Skatepark som eit eige miljø.",
            "why_here": "Arenaen inngår i lokal samordning utan å bli redusert til ein del av fotballanlegget.",
            "source_note": "Etne Idrettslag: Anlegg i Etne 2035."
        }
    ],
    "civication_store": [
        {
            "id": "etne_bmx_skate_anleggsminiatyr",
            "title": "Miniatyren av BMX- og skatearenaen",
            "type": "anleggsmodell",
            "kind": "physical_object",
            "desc": "Ein fysisk samlarmodell med innkøyring, ventesoner og køyrelinjer.",
            "placeSpecificReason": "Modellen representerer den avgrensa BMX- og skateflata, ikkje pumptracken eller stadion.",
            "historicalFunction": "Gjer utvidinga frå tradisjonell lagidrett til eigenorganisert hjulidrett synleg.",
            "physicalObject": True,
            "placeSpecific": True,
            "storePrice": 40,
            "currency": "PC",
            "collection": PLACE_ID,
            "collectable": True,
            "civicationUse": ["anleggsforstaing", "hjulidrett", "stadavgrensing"]
        },
        {
            "id": "etne_bmx_skate_stadionvegen_skiljekort",
            "title": "Skiljekortet for Stadionvegen",
            "type": "stadskort",
            "kind": "physical_object",
            "desc": "Eit fysisk vendekort som skil BMX- og skateparken frå pumptracken, tennisbanene og hovudstadion.",
            "placeSpecificReason": "Stadene ligg tett, men har ulike flater, rørsler og organisasjonsformer.",
            "historicalFunction": "Hindrar at pumptrackens opningsår 2024 blir feilført på BMX- og skateparken.",
            "physicalObject": True,
            "placeSpecific": True,
            "storePrice": 25,
            "currency": "PC",
            "collection": PLACE_ID,
            "collectable": True,
            "civicationUse": ["kjelderydding", "stadssamanlikning", "trygg_ruteplanlegging"]
        }
    ],
    "brands": [
        {"id": "etne_bmx_og_skatepark_foreining", "name": "Etne BMX og Skatepark", "brand_kind": "sports_association", "brand_type": "registered_facility_actor"},
        {"id": "etne_kommune", "name": "Etne kommune", "brand_kind": "public_actor", "brand_type": "municipal_sports_actor"},
        {"id": "etne_idrettslag", "name": "Etne Idrettslag", "brand_kind": "sports_club", "brand_type": "local_facility_planning_actor"}
    ],
    "for_na": {
        "title": "Frå tradisjonelt idrettsområde til eigen hjulidrettsarena",
        "before": "BMX og skating høyrde ikkje til den tradisjonelle gras-, kunstgras- og friidrettsfunksjonen ved hovudanlegget. Kjeldene gir ikkje eit sikkert opningsår for dagens park.",
        "now": "Etne BMX og Skatepark er registrert som eiga foreining og blir ført som eit eige fritidstilbod. Arenaen skal lesast separat frå pumptracken som opna i 2024.",
        "change": "Det lokale idrettslandskapet har fått ein eigen arena for BMX, skating og sjølvorganisert hjulaktivitet, medan den eksakte byggjekronologien står open.",
        "lookFor": ["avgrensinga rundt BMX- og skateflata", "start og slutt på køyrelinjene", "ventesoner", "skiljet mot pumptracken", "korleis brukarar deler arenaen"],
        "sources": [
            "https://virksomhet.brreg.no/nb/oppslag/enheter/899086112",
            "https://www.etne.kommune.no/mittetne/framside/fritidstilbod.14232.aspx",
            "https://www.etneil.no/verktoykasse/anlegg-2035"
        ]
    }
})
for forbidden in ("rounds", "rundinger", "routes", "tasks_profile", "play", "nature_profile"):
    place.pop(forbidden, None)
write(place_path, places)

person_path = "data/people/sport/vestland/etne/etne_bmx_og_skatefellesskapet.json"
person = {
    "id": PERSON_ID,
    "name": "BMX- og skatefellesskapet i Etne",
    "initials": "BS",
    "desc": "Kollektivt miljøanker for utøvarane, frivilligheita og den registrerte foreininga rundt BMX- og skatearenaen.",
    "tags": ["sport", "BMX", "skate", "eigenorganisert_idrett", "kollektivt_miljoanker", "Etne"],
    "placeId": PLACE_ID,
    "places": [PLACE_ID],
    "category": "sport",
    "year": None,
    "period": "Dagens BMX- og skatemiljø i Etne",
    "popupDesc": "Dette er eit kollektivt miljøanker, ikkje ei tilskriving av anlegget til ein tilfeldig noverande leiar. Kjeldene dokumenterer eit eige BMX- og skatetilbod, men ikkje éin person som åleine bygde parken eller eit sikkert opningsår.",
    "image": "",
    "cardImage": "",
    "source_urls": [
        "https://virksomhet.brreg.no/nb/oppslag/enheter/899086112",
        "https://www.etne.kommune.no/mittetne/framside/fritidstilbod.14232.aspx",
        "https://www.etneil.no/verktoykasse/anlegg-2035"
    ],
    "verifiedAt": "2026-07-19"
}
write(person_path, [person])
people_manifest = read("data/people/manifest.json")
manifest_entry = "people/sport/vestland/etne/etne_bmx_og_skatefellesskapet.json"
if manifest_entry not in people_manifest["files"]:
    people_manifest["files"].append(manifest_entry)
write("data/people/manifest.json", people_manifest)

relations = read("data/relations.json")
append_unique(relations, {
    "id": "rel_etne_bmx_skatefellesskapet_etne_bmx_og_skatepark",
    "type": "kollektivt_bmx_og_skatefellesskap",
    "place": PLACE_ID,
    "person": PERSON_ID,
    "label": "Fellesskapet rundt BMX- og skatearenaen",
    "why": "Foreininga og kommunen dokumenterer eit eige BMX- og skatetilbod; people-ankeret representerer miljøet kollektivt.",
    "source": "https://virksomhet.brreg.no/nb/oppslag/enheter/899086112"
})
write("data/relations.json", relations)

story_path = "data/stories/stories_etnesjoen_sport_rounds_batch1.json"
stories = read(story_path)
story = {
    "id": STORY_ID,
    "type": "self_organised_wheel_sports_facility",
    "title": "Ein eigen arena i Stadionvegen",
    "year": None,
    "place_id": PLACE_ID,
    "person_id": PERSON_ID,
    "summary": "Etne BMX- og skatepark gjer eigenorganisert hjulidrett synleg som eit eige anlegg ved sida av stadion, tennisbanene og den nyare pumptracken.",
    "story": "Brønnøysundregistrene fører Etne BMX og Skatepark som ei foreining knytt til drift av idrettsanlegg, med Stadionvegen 12 som registrert adresse. Etne kommune fører samtidig BMX- og skateparken som eit eige fritidstilbod. Kjeldene stadfestar organisasjonen og den sjølvstendige aktivitetsfunksjonen, men ikkje eit sikkert byggje- eller opningsår for dagens fysiske park.\n\nStadene i Stadionvegen må haldast frå kvarandre. Hovudanlegget representerer fotball og friidrett, tennisanlegget har to racketbaner, og pumptracken er eit eige asfaltanlegg som opna i 2024. BMX- og skateparken er den separate arenaen for BMX, skating og delte køyrelinjer. 2024 skal derfor ikkje flyttast over som opningsår for denne parken.\n\nArenaen viser korleis eigenorganisert idrett krev både fridom og sjølvregulering. Brukaren må lese linja, vurdere underlaget, vente på tur og tilpasse fart og nivå til andre.",
    "sources": [
        {"title": "Brønnøysundregistrene: Etne BMX og Skatepark", "url": "https://virksomhet.brreg.no/nb/oppslag/enheter/899086112"},
        {"title": "Etne kommune: Fritidstilbod", "url": "https://www.etne.kommune.no/mittetne/framside/fritidstilbod.14232.aspx"},
        {"title": "Etne kommune: Idrett og friluftsliv", "url": "https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/"},
        {"title": "Etne Idrettslag: Anlegg i Etne 2035", "url": "https://www.etneil.no/verktoykasse/anlegg-2035"}
    ],
    "tags": ["Etne BMX og Skatepark", "BMX", "skating", "eigenorganisert idrett", "Stadionvegen", "trygg sambruk"],
    "related_people": [PERSON_ID],
    "related_places": ["etne_pumptrack", "etne_idrettsanlegg", "etne_tennisanlegg"],
    "score": {"narrative": 4, "historical": 3, "source": 4, "play_value": 5, "originality": 4, "total": 20},
    "arc": {
        "start": "Eit eige BMX- og skatemiljø blir synleg som registrert anleggsaktør.",
        "middle": "Kommunen og lokal anleggsplanlegging behandlar arenaen som eit sjølvstendig tilbod.",
        "end": "Stedet lærer brukaren å skilje hjulidrettsarenaen frå stadion, tennis og pumptrack."
    },
    "next_scenes": [
        {"place_id": "etne_pumptrack", "reason": "Pumptracken opna i 2024 og viser ein nyare, separat type hjulidrettsanlegg."},
        {"place_id": "etne_idrettsanlegg", "reason": "Hovudanlegget viser kontrasten mellom lagidrett og eigenorganisert bruk."},
        {"place_id": "etne_tennisanlegg", "reason": "Tennisbanene har booking, nett og avgrensa racketflater som ein annan brukskultur."}
    ]
}
append_unique(stories, story)
write(story_path, stories)

leksikon_path = "data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json"
articles = read(leksikon_path)
article = {
    "place_id": PLACE_ID,
    "title": "Etne BMX- og skatepark",
    "version": 1,
    "visual": {"designCode": "article_sports_history_miniature"},
    "popupDesc": "Ein sjølvstendig BMX- og skatearena i Stadionvegen for eigenorganisert hjulidrett.",
    "wikiText": [
        "Etne BMX- og skatepark er registrert som eit eige idrettsanleggsmiljø med Stadionvegen 12 som adresse. Brønnøysundregistrene knyter foreininga til drift av idrettsanlegg, og Etne kommune fører parken som eit eige fritidstilbod.",
        "Stedet må avgrensast mot dei andre aktivitetane i same korridor. Etne idrettsanlegg samlar stadion og friidrett, tennisanlegget har to eigne baner, og Etne pumptrack er eit separat asfaltanlegg som opna i 2024. Kjeldene gir ikkje eit sikkert opningsår for BMX- og skateparken.",
        "BMX- og skateparken viser korleis eigenorganisert idrett krev både fridom og sjølvregulering. Brukaren må lese køyrelinjer, vente til flata er fri, tilpasse nivået og verne andre sine utgangssoner."
    ],
    "summary": {
        "one_liner": "Den separate arenaen for BMX og skating i Stadionvegen – ikkje stadionet og ikkje pumptracken frå 2024.",
        "themes": ["BMX", "skating", "eigenorganisert idrett", "anleggsavgrensing", "trygg sambruk"],
        "tone": ["idrettsfagleg", "stadsspesifikk", "kjeldeforsiktig"]
    },
    "facts": [
        {"id": "fact_etne_bmx_skate_01", "label": "Registrert anleggsforeining", "desc": "Etne BMX og Skatepark er registrert som foreining med drift av idrettsanlegg og Stadionvegen 12 som adresse.", "confidence": "high", "sources": ["Brønnøysundregistrene"]},
        {"id": "fact_etne_bmx_skate_02", "label": "Eige kommunalt fritidstilbod", "desc": "Etne kommune fører BMX- og skateparken som eit eige lokalt tilbod.", "confidence": "high", "sources": ["Etne kommune"]},
        {"id": "fact_etne_bmx_skate_03", "label": "Ikkje pumptracken frå 2024", "desc": "BMX- og skateparken er eit anna stadobjekt enn Etne pumptrack.", "confidence": "high", "sources": ["Etne kommune"]}
    ],
    "chronology": [
        {"id": "chrono_etne_bmx_skate_01", "year": None, "period": "Registrert og kommunalt lista anlegg", "desc": "Kjeldene dokumenterer eit eige BMX- og skatetilbod, men ikkje opningsåret til dagens park.", "confidence": "high", "sources": ["Brønnøysundregistrene", "Etne kommune"]},
        {"id": "chrono_etne_bmx_skate_02", "year": 2024, "period": "Ny pumptrack i nærleiken", "desc": "Den separate Etne pumptrack opnar i 2024. Året skal ikkje brukast som opningsår for BMX- og skateparken.", "confidence": "high", "sources": ["Etne kommune"]}
    ],
    "built_environment": {
        "built_year": None,
        "architects": [],
        "materials": [],
        "style": ["funksjonelt BMX- og skateanlegg"],
        "original_function": None,
        "current_function": "Arena for BMX, skating og eigenorganisert hjulaktivitet",
        "changes": ["BMX- og skatefunksjonen er etablert som eige stadobjekt", "kommunen fører arenaen som eige fritidstilbod", "ein separat pumptrack opna i nærleiken i 2024"]
    },
    "stories": [
        {"id": "story_etne_bmx_skate_01", "entry_id": STORY_ID, "title": "Ein eigen arena i Stadionvegen", "one_liner": "Arenaen utvida det lokale idrettslandskapet med eigenorganisert hjulaktivitet.", "confidence": "high", "sources": ["Brønnøysundregistrene", "Etne kommune", "Etne Idrettslag"]}
    ],
    "interpretation": {
        "what_to_notice": ["kvar BMX- og skateflata sluttar", "inngang og utgang på køyrelinjene", "ventepunkt", "skiljet mot pumptracken", "skiljet mot stadion og tennis"],
        "why_it_matters": ["Arenaen viser at lokal idrett også omfattar sjølvorganiserte aktivitetar", "presis stadavgrensing er nødvendig når fleire anlegg ligg tett"],
        "counterpoints": ["Opningsåret for dagens park er ikkje sikkert dokumentert", "Pumptrack-fakta og året 2024 skal ikkje flyttast til dette stadobjektet", "Leksikonet gir ikkje opplæring i hopp eller risikofylte triks"]
    },
    "links": {"entry_ids": [STORY_ID], "related_places": ["etne_pumptrack", "etne_idrettsanlegg", "etne_tennisanlegg"], "related_people": [PERSON_ID]},
    "sources": [
        {"title": "Brønnøysundregistrene: Etne BMX og Skatepark", "url": "https://virksomhet.brreg.no/nb/oppslag/enheter/899086112"},
        {"title": "Etne kommune: Fritidstilbod", "url": "https://www.etne.kommune.no/mittetne/framside/fritidstilbod.14232.aspx"},
        {"title": "Etne kommune: Idrett og friluftsliv", "url": "https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/"},
        {"title": "Etne Idrettslag: Anlegg i Etne 2035", "url": "https://www.etneil.no/verktoykasse/anlegg-2035"}
    ],
    "ui": {"mini_panel": {"show": True, "highlights": ["fact_etne_bmx_skate_01", "fact_etne_bmx_skate_03", "story_etne_bmx_skate_01"], "max_items": 6}}
}
append_unique(articles, article, key="place_id")
write(leksikon_path, articles)

assert place["year"] is None
assert all(key not in place for key in ("rounds", "rundinger", "routes", "tasks_profile", "play", "nature_profile"))
assert len(place["training_profile"]["exercises"]) == 3
assert len(place["works"]) == 4
assert len(place["civication_store"]) == 2
assert len(place["brands"]) == 3
assert any(row.get("id") == STORY_ID for row in stories)
assert any(row.get("place_id") == PLACE_ID for row in articles)

report = ROOT / "reports/etnesjoen-bmx-skate-rounds-batch1.md"
report.write_text("""# Etnesjøen BMX- og skatepark – rundingsbatch 1

Alle ni rundingar i den dokumenterte sportprofilen er fylte: `people`, `training`, `badges`, `works`, `civication`, `brands`, `før_nå`, `fortellinger` og `leksikon`.

- People bruker eit kollektivt miljøanker, ikkje ein tilfeldig noverande styreleiar.
- Det blir ikkje hevda eit udokumentert byggje- eller opningsår.
- Pumptracken er eit eige stadobjekt; opningsåret 2024 blir ikkje flytta til BMX- og skateparken.
- Treninga er avgrensa til romlesing, balanse, bremsing og trygg veksling.
- Ingen manuell rundingsoverstyring eller irrelevante natur-, oppgåve-, leike- eller ruterundingar.
""", encoding="utf-8")

print("Etnesjøen BMX/skate round data generated and self-checked")
