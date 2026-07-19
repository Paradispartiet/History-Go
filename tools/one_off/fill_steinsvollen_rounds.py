from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]

BANAR = "https://www.etnecup.no/cup-info/banar"
REGLAR = "https://www.etnecup.no/cup-info/turneringsreglar"
CONTACT = "https://www.etnecup.no/kontakt-oss"
NFF_CLUB = "https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=819"
NFF_2021 = "https://www.fotball.no/finn-klubbturneringer/turneringssoknad/?tournamentApplicationId=1079"
NFF_2023 = "https://www.fotball.no/finn-klubbturneringer/turneringssoknad/?tournamentApplicationId=146700"
NFF_2024 = "https://www.fotball.no/finn-klubbturneringer/turneringssoknad/?tournamentApplicationId=210984"
NFF_2025 = "https://www.fotball.no/finn-klubbturneringer/turneringssoknad/?tournamentApplicationId=337732"
NFF_2026 = "https://www.fotball.no/finn-klubbturneringer/turneringssoknad/?tournamentApplicationId=486544"


def load_json(relative_path):
    return json.loads((ROOT / relative_path).read_text(encoding="utf-8"))


def save_json(relative_path, value):
    path = ROOT / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def append_by_id(rows, item):
    if not any(row.get("id") == item["id"] for row in rows):
        rows.append(item)


place_path = "data/places/sport/vestland/etne/steinsvollen_fotballanlegg.json"
place_rows = load_json(place_path)
place = next(row for row in place_rows if row.get("id") == "steinsvollen_fotballanlegg")
place.update({
    "externalLinks": [
        {
            "type": "official",
            "label": "Etnecup – banar",
            "url": BANAR,
            "lang": "nn",
            "verifiedAt": "2026-07-19",
            "note": "Banekartet fører fem nummererte Steinsvollen-flater, 51–55, fordelt på 7er og 9er."
        },
        {
            "type": "official",
            "label": "Etnecup – turneringsreglar",
            "url": REGLAR,
            "lang": "nn",
            "verifiedAt": "2026-07-19",
            "note": "Reglane legg nokre 7er-kampar og alle kampane i klasse 9 og 10 utanom finalen til Steinsvollen."
        },
        {
            "type": "official",
            "label": "Etnecup – kontakt og turneringsleiing",
            "url": CONTACT,
            "lang": "nn",
            "verifiedAt": "2026-07-19",
            "note": "Pål Askvig er oppført med ansvar for påmelding, kampoppsett, kampavvikling og dommararbeid."
        },
        {
            "type": "federation",
            "label": "NFF – Etnecup 2026",
            "url": NFF_2026,
            "lang": "nb",
            "verifiedAt": "2026-07-19",
            "note": "NFF fører Steinsvollen som ein av fire arenaer for turneringa 12.–14. juni 2026."
        },
        {
            "type": "federation",
            "label": "NFF – Etne Idrettslag og baneanlegg",
            "url": NFF_CLUB,
            "lang": "nb",
            "verifiedAt": "2026-07-19",
            "note": "Klubbsida fører Steinsvollen 7er A, 7er B og 9er som eigne registrerte baneflater."
        },
        {
            "type": "federation",
            "label": "NFF – Etnecup 2021",
            "url": NFF_2021,
            "lang": "nb",
            "verifiedAt": "2026-07-19",
            "note": "Den eldste NFF-kjelda i denne batchen dokumenterer fem Steinsvollen-flater i 2021; året er ikkje brukt som opningsår."
        },
        {
            "type": "federation",
            "label": "NFF – Etnecup 2023",
            "url": NFF_2023,
            "lang": "nb",
            "verifiedAt": "2026-07-19"
        },
        {
            "type": "federation",
            "label": "NFF – Etnecup 2024",
            "url": NFF_2024,
            "lang": "nb",
            "verifiedAt": "2026-07-19"
        },
        {
            "type": "federation",
            "label": "NFF – Etnecup 2025",
            "url": NFF_2025,
            "lang": "nb",
            "verifiedAt": "2026-07-19"
        }
    ],
    "emne_ids": [
        "em_sport_idrettsarena_sted",
        "em_sport_treningsinfrastruktur",
        "em_sport_turnering_format",
        "em_sport_frivillighet_dugnad",
        "em_sport_idrettsopplaring",
        "em_sport_trening_oving"
    ],
    "underbadge_ids": [
        "fotball",
        "idrettsarenaer",
        "idrettslag",
        "lokalidrett",
        "turneringer",
        "frivillighet",
        "utendors_trening",
        "koordinasjon"
    ],
    "training_profile": {
        "title": "Trygg lågterskeløkt på Steinsvollen",
        "summary": "Tre enkle øvingar som lærer brukaren å lese 7er- og 9er-oppsettet, halde kontroll på ballen og bruke ei ledig grasflate utan å forstyrre kamp, trening eller banestell.",
        "safety": "Bruk berre ei grasflate som er open, tørr, ledig og uttrykkeleg tillaten å bruke. Følg booking, skilting og beskjedar frå Etnecup, Etne IL og grunneigar. Gå aldri inn under kamp, organisert trening, oppmerking eller vedlikehald. Ikkje bruk våt eller stengd grasbane, hald god avstand til andre grupper, og bruk ikkje harde skot eller lange pasningar nær menneske, mål, veg eller parkerte køyretøy.",
        "exercises": [
            {
                "id": "steinsvollen_les_51_55",
                "title": "Les banenettet frå utsida",
                "instruction": "Stå utanfor aktive speleflater og bruk banekartet til å peike ut kor 51–55 ligg, kva flater som er 7er og 9er, og kvar sikre gangliner og ventesoner går.",
                "duration_minutes": 7,
                "intensity": "svært lett",
                "why": "Steinsvollen fungerer som fleire kampflater under cupen, men er eitt samla fysisk anlegg i History Go."
            },
            {
                "id": "steinsvollen_korte_pasningar",
                "title": "Korte pasningar gjennom port",
                "instruction": "Når ei tillaten grasflate er heilt fri, set to eigne markørar som ei brei port og spel ti rolige pasningar gjennom henne frå kort avstand. Stopp ballen før kvar ny pasning.",
                "duration_minutes": 8,
                "intensity": "lett",
                "why": "Øvinga trenar pasningsretning og mottak utan skot, taklingar eller bruk av heile kampflata."
            },
            {
                "id": "steinsvollen_sidelinjeintervall",
                "title": "Gange og roleg jogg langs fri sidelinje",
                "instruction": "På utsida av ei open og ledig bane går du eitt minutt og joggar roleg eitt minutt langs ei trygg sidelinje. Snu før målsona og gjenta tre gonger utan å krysse andre sine aktivitetar.",
                "duration_minutes": 8,
                "intensity": "lett",
                "why": "Den lange grasbanekanten gir ei enkel kondisjonsøkt som ikkje krev kamp eller bruk av mål."
            }
        ]
    },
    "works": [
        {
            "id": "steinsvollen_kampflater_51_55",
            "title": "Fem nummererte cupflater: 51–55",
            "type": "turneringsinfrastruktur",
            "kind": "numbered_match_surfaces",
            "year": None,
            "desc": "Etnecup sitt offisielle banekart deler Steinsvollen inn i fem kampflater: 51, 52, 53, 54 og 55.",
            "why_here": "Nummereringa viser korleis eitt grasområde blir gjort om til eit presist kamp- og logistikksystem under turneringa.",
            "source_note": "Etnecup – Banar, kontrollert 19. juli 2026."
        },
        {
            "id": "steinsvollen_7er_og_9er",
            "title": "7er- og 9er-fotball på same område",
            "type": "kampformat",
            "kind": "multi_format_football_area",
            "year": None,
            "desc": "Banekartet fører tre 7er-flater og to 9er-flater på Steinsvollen, medan NFF registrerer Steinsvollen 7er A, 7er B og 9er.",
            "why_here": "Kombinasjonen av speleformat er den viktigaste fysiske og organisatoriske eigenskapen ved anlegget.",
            "source_note": "Etnecup og NFF."
        },
        {
            "id": "steinsvollen_klasse_9_10",
            "title": "Kampstad for klasse 9 og 10",
            "type": "turneringsavvikling",
            "kind": "age_class_match_venue",
            "year": 2026,
            "desc": "Dei publiserte turneringsreglane legg alle kampane i klasse 9 og 10 utanom finalen, og enkelte 7er-kampar, til Steinsvollen.",
            "why_here": "Regelen gjer Steinsvollen til ein nødvendig del av cupavviklinga, ikkje berre ei reserveflate.",
            "source_note": "Etnecup – Turneringsreglar, kontrollert 19. juli 2026."
        },
        {
            "id": "steinsvollen_cuparena_2021_2026",
            "title": "Dokumentert cupbruk i 2021 og 2023–2026",
            "type": "turneringshistorikk",
            "kind": "recurring_tournament_venue",
            "year": 2021,
            "desc": "NFF sine turneringssøknader dokumenterer Steinsvollen som arena i 2021 og igjen i kvar tilgjengeleg årsoversikt frå 2023 til 2026.",
            "why_here": "Kjelderekka viser gjenteken bruk over fleire år utan å late som 2021 er anleggets opningsår.",
            "source_note": "NFF-turneringssøknader for 2021, 2023, 2024, 2025 og 2026."
        }
    ],
    "civication_store": [
        {
            "id": "steinsvollen_banekart_51_55",
            "title": "Foldekartet Steinsvollen 51–55",
            "type": "turneringskart",
            "kind": "physical_object",
            "desc": "Eit fysisk foldekart med dei fem nummererte kampflatene, markert som 7er eller 9er, og ein tydeleg merknad om at området er eitt History Go-stadobjekt.",
            "placeSpecificReason": "Nummerrekkja 51–55 og fordelinga mellom 7er og 9er kjem direkte frå Etnecup sitt Steinsvollen-kart.",
            "historicalFunction": "Gjer den årlege omforminga frå grasområde til organisert turneringsnett synleg.",
            "physicalObject": True,
            "placeSpecific": True,
            "storePrice": 30,
            "currency": "PC",
            "collection": "steinsvollen_fotballanlegg",
            "collectable": True,
            "civicationUse": ["kampplanlegging", "baneforstaing", "turneringslogistikk"],
            "source_urls": [BANAR]
        },
        {
            "id": "steinsvollen_fem_minutt_skilt",
            "title": "Steinsvollen-skiltet: 5 minutt",
            "type": "arenaorientering",
            "kind": "physical_object",
            "desc": "Eit fysisk retningsskilt som viser Steinsvollen som separat kampstad om lag fem minutt frå hovudområdet.",
            "placeSpecificReason": "Etnecup sitt banekart merkar Steinsvollen med «5min» og bruker avstanden som del av turneringsorienteringa.",
            "historicalFunction": "Viser at Etnecup fungerer som eit geografisk nett av arenaer og transport, ikkje berre eitt stadion.",
            "physicalObject": True,
            "placeSpecific": True,
            "storePrice": 22,
            "currency": "PC",
            "collection": "steinsvollen_fotballanlegg",
            "collectable": True,
            "civicationUse": ["orientering", "transportplanlegging", "stadssystem"],
            "source_urls": [BANAR, REGLAR]
        }
    ],
    "brands": [
        {
            "id": "etnecup",
            "name": "Etnecup",
            "brand_kind": "sports_tournament",
            "brand_type": "local_youth_football_tournament"
        },
        {
            "id": "etne_idrettslag",
            "name": "Etne Idrettslag",
            "brand_kind": "sports_club",
            "brand_type": "tournament_organiser_and_facility_user"
        },
        {
            "id": "nff_rogaland",
            "name": "NFF Rogaland",
            "brand_kind": "sports_federation",
            "brand_type": "regional_football_association"
        }
    ],
    "for_na": {
        "title": "Frå dokumentert grasområde til presist cupnett",
        "before": "Den eldste NFF-kjelda i denne batchen viser fem Steinsvollen-flater i Etnecup 2021. Kjeldene dokumenterer ikkje når sjølve fotballområdet blei bygd eller opna, og 2021 skal derfor ikkje brukast som anleggsår.",
        "now": "Etnecup fører Steinsvollen som fem nummererte kampflater, 51–55, med både 7er- og 9er-format. Turneringsreglane flyttar enkelte 7er-kampar og alle klasse 9–10-kampar utanom finalen hit.",
        "change": "Den tydelegaste endringa i kjeldene er organisatorisk: same samla grasområde blir digitalt nummerert, formatdelt og knytt til kampoppsett og transport i eit større turneringsnett.",
        "lookFor": [
            "korleis eitt grasområde kan delast i fleire kampflater",
            "merking for 7er- og 9er-format",
            "trygge gangliner mellom kampflatene",
            "kvar lag og publikum kan vente utanfor spelearealet",
            "skiljet mellom Steinsvollen og Etne idrettsanlegg"
        ],
        "sources": [BANAR, REGLAR, NFF_2021, NFF_2026]
    }
})
save_json(place_path, place_rows)

person_path = "data/people/sport/vestland/etne/pal_askvig.json"
person = {
    "id": "pal_askvig",
    "name": "Pål Askvig",
    "initials": "PA",
    "visual": {"designCode": "person_athlete_miniature"},
    "desc": "Medlem av turneringsleiinga i Etnecup med dokumentert ansvar for påmelding, kampoppsett, kampavvikling og dommararbeid.",
    "tags": ["sport", "fotball", "etnecup", "turneringsleiing", "kampoppsett", "etne"],
    "placeId": "steinsvollen_fotballanlegg",
    "places": ["steinsvollen_fotballanlegg"],
    "category": "sport",
    "year": None,
    "period": "Dagens turneringsorganisering i Etnecup",
    "popupDesc": "Etnecup oppgir Pål Askvig med ansvar for påmelding, kampoppsett, kampavvikling og dommararbeid. NFF fører han som ansvarleg kontaktperson og fair play-ansvarleg for Etnecup i 2021 og 2023–2026. People-kortet er forankra i Steinsvollen fordi arenaen gjer den geografiske kamp- og transportlogistikken særleg synleg. Koplinga betyr ikkje at Askvig bygde anlegget eller eig grasflatene.",
    "image": "",
    "cardImage": "",
    "source_urls": [CONTACT, NFF_2021, NFF_2023, NFF_2024, NFF_2025, NFF_2026],
    "verifiedAt": "2026-07-19"
}
save_json(person_path, [person])

people_manifest_path = "data/people/manifest.json"
people_manifest = load_json(people_manifest_path)
manifest_relative = "people/sport/vestland/etne/pal_askvig.json"
if manifest_relative not in people_manifest["files"]:
    people_manifest["files"].append(manifest_relative)
save_json(people_manifest_path, people_manifest)

relations_path = "data/relations.json"
relations = load_json(relations_path)
append_by_id(relations, {
    "id": "rel_pal_askvig_steinsvollen_fotballanlegg",
    "type": "turneringsleiing_og_kampavvikling",
    "place": "steinsvollen_fotballanlegg",
    "person": "pal_askvig",
    "why": "Etnecup oppgir Pål Askvig med ansvar for påmelding, kampoppsett, kampavvikling og dommararbeid, og NFF fører han som ansvarleg kontaktperson for turneringa som bruker Steinsvollen.",
    "source": CONTACT
})
save_json(relations_path, relations)

story_path = "data/stories/stories_etnesjoen_sport_rounds_batch1.json"
stories = load_json(story_path)
story = {
    "id": "st_steinsvollen_fem_baner_i_turneringsnettet",
    "type": "distributed_youth_tournament_venue",
    "title": "Fem baner i det store turneringsnettet",
    "year": 2021,
    "place_id": "steinsvollen_fotballanlegg",
    "person_id": "pal_askvig",
    "summary": "Steinsvollen blir under Etnecup delt i fem nummererte 7er- og 9er-flater og tek imot kampar som hovudanlegget ikkje kan bere åleine.",
    "story": "Steinsvollen er ikkje ein underpost inne i Etne stadion. Etnecup sitt banekart gir området eigne nummer, 51–55, og deler dei fem grasflatene mellom 7er- og 9er-fotball. Kartet merkar også Steinsvollen som ein separat kampstad om lag fem minutt frå hovudområdet. I History Go blir dei fem kampflatene samla til eitt stadobjekt fordi dei ligg i same fysiske fotballområde.\n\nTurneringsreglane viser kvifor anlegget er nødvendig. Nokre 7er-kampar og alle kampane i klasse 9 og 10 utanom finalen blir lagde til Steinsvollen. NFF si 2026-oversikt fører Etne stadion, Etne kunstgress, Engebane og Steinsvollen som turneringsarenaer og garanterer minst fem kampar per lag. Steinsvollen er dermed ein planlagd del av avviklinga, ikkje ei tilfeldig reservebane.\n\nNFF-kjeldene dokumenterer Steinsvollen i Etnecup 2021 og igjen i 2023, 2024, 2025 og 2026. Denne kjelderekka viser gjenteken bruk, men ho fortel ikkje når anlegget blei bygd eller opna. Pål Askvig er dokumentert i turneringsleiinga med ansvar for påmelding, kampoppsett, kampavvikling og dommararbeid. People-koplinga handlar derfor om den organisatoriske innsatsen som får fem kampflater, lag, dommarar og transport til å fungere som eitt system.",
    "sources": [
        {"title": "Etnecup: Banar", "url": BANAR},
        {"title": "Etnecup: Turneringsreglar", "url": REGLAR},
        {"title": "Etnecup: Kontakt oss", "url": CONTACT},
        {"title": "NFF: Etnecup 2021", "url": NFF_2021},
        {"title": "NFF: Etnecup 2023", "url": NFF_2023},
        {"title": "NFF: Etnecup 2024", "url": NFF_2024},
        {"title": "NFF: Etnecup 2025", "url": NFF_2025},
        {"title": "NFF: Etnecup 2026", "url": NFF_2026},
        {"title": "NFF: Etne Idrettslag", "url": NFF_CLUB}
    ],
    "tags": ["Steinsvollen", "Etnecup", "7er", "9er", "kampoppsett", "turneringslogistikk"],
    "related_people": ["pal_askvig"],
    "related_places": ["etne_idrettsanlegg", "engebanen_etne"],
    "score": {"narrative": 4, "historical": 4, "source": 5, "play_value": 5, "originality": 4, "total": 22},
    "arc": {
        "start": "Eitt grasområde blir delt i fem nummererte kampflater.",
        "middle": "7er- og 9er-kampar blir fordelte hit frå hovudområdet.",
        "end": "Gjentekne NFF-registreringar viser Steinsvollen som ein varig del av Etnecup-nettet."
    },
    "next_scenes": [
        {"place_id": "etne_idrettsanlegg", "reason": "Hovudanlegget viser stadion- og kunstgrasflatene som cupnettet blir organisert rundt."},
        {"place_id": "engebanen_etne", "reason": "Engebanen er den andre separate grasarenaen som avlastar hovudanlegget under Etnecup."}
    ]
}
append_by_id(stories, story)
save_json(story_path, stories)

article_path = "data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json"
articles = load_json(article_path)
article = {
    "place_id": "steinsvollen_fotballanlegg",
    "title": "Steinsvollen som cup- og fleirbaneanlegg",
    "version": 1,
    "visual": {"designCode": "article_sports_history_miniature"},
    "popupDesc": "Det separate grasområdet der Etnecup deler Steinsvollen inn i fem nummererte 7er- og 9er-flater.",
    "wikiText": [
        "Steinsvollen fotballanlegg er eit eige grasområde utanfor Etne idrettsanlegg. Etnecup sitt offisielle banekart fører fem kampflater, nummererte 51–55. Tre er oppførte som 7er og to som 9er, medan NFF si klubboversikt registrerer Steinsvollen 7er A, 7er B og 9er. Dei ulike namna er operative baneinndelingar, ikkje fem sjølvstendige History Go-stader.",
        "Turneringsreglane legg enkelte 7er-kampar og alle kampane i klasse 9 og 10 utanom finalen til Steinsvollen. Banekartet oppgir om lag fem minutt frå hovudområdet. Anlegget viser derfor korleis ein stor barne- og ungdomsturnering må fordelast mellom stadion, kunstgras, Enge og Steinsvollen, med kampoppsett og transport som bind stadene saman.",
        "NFF dokumenterer Steinsvollen som Etnecup-arena i 2021 og i dei tilgjengelege årsoversiktene 2023–2026. Dette viser gjenteken turneringsbruk, men ikkje eit opnings- eller byggeår. People-rundinga bruker Pål Askvig som organisatorisk anker fordi både Etnecup og NFF dokumenterer ansvaret hans for kampoppsett og avvikling."
    ],
    "summary": {
        "one_liner": "Steinsvollen er fem nummererte cupflater samla i eitt fysisk grasområde og eitt History Go-stadobjekt.",
        "themes": ["fleirbaneanlegg", "Etnecup", "7er og 9er", "turneringslogistikk", "breiddefotball"],
        "tone": ["idrettsfagleg", "stadsspesifikk", "kjeldeforsiktig"]
    },
    "facts": [
        {"id": "fact_steinsvollen_01", "label": "Fem kampflater", "desc": "Etnecup nummererer Steinsvollen 51–55.", "confidence": "high", "sources": ["Etnecup"]},
        {"id": "fact_steinsvollen_02", "label": "Både 7er og 9er", "desc": "Banekartet og NFF dokumenterer begge speleformene på området.", "confidence": "high", "sources": ["Etnecup", "NFF"]},
        {"id": "fact_steinsvollen_03", "label": "Eigne aldersklassar", "desc": "Alle kampane i klasse 9 og 10 utanom finalen blir lagde hit etter dei publiserte reglane.", "confidence": "high", "sources": ["Etnecup"]},
        {"id": "fact_steinsvollen_04", "label": "Fast del av cupnettet", "desc": "NFF dokumenterer arenaen i 2021 og 2023–2026.", "confidence": "high", "sources": ["NFF"]}
    ],
    "chronology": [
        {"id": "chrono_steinsvollen_01", "year": 2021, "period": "Eldste kjelde i batchen", "desc": "NFF-turneringssøknaden listar fem Steinsvollen-flater. Året er ikkje eit opningsår.", "confidence": "high", "sources": ["NFF"]},
        {"id": "chrono_steinsvollen_02", "year": 2023, "period": "Gjenteken cupbruk", "desc": "Steinsvollen står igjen som arena i NFF-oversiktene for 2023, 2024, 2025 og 2026.", "confidence": "high", "sources": ["NFF"]},
        {"id": "chrono_steinsvollen_03", "year": 2026, "period": "Dokumentert turneringsrolle", "desc": "NFF og Etnecup dokumenterer arenaen, kampformat og ansvarsorganisering for 2026-turneringa.", "confidence": "high", "sources": ["NFF", "Etnecup"]}
    ],
    "built_environment": {
        "built_year": None,
        "architects": [],
        "materials": ["naturgras"],
        "style": ["fleirbanesområde for breiddefotball"],
        "original_function": None,
        "current_function": "Separat 7er- og 9er-arena i Etnecup sitt banenett",
        "changes": [
            "grasområdet blir delt i fem nummererte kampflater under cupen",
            "kampformat og aldersklassar blir fordelte gjennom turneringsreglane",
            "digitale kampoppsett og arenaoversikter knyter Steinsvollen til hovudområdet"
        ]
    },
    "stories": [
        {
            "id": "story_steinsvollen_01",
            "entry_id": "st_steinsvollen_fem_baner_i_turneringsnettet",
            "title": "Fem baner i det store turneringsnettet",
            "one_liner": "Steinsvollen gjer eitt grasområde om til fem operative cupflater.",
            "confidence": "high",
            "sources": ["Etnecup", "NFF"]
        }
    ],
    "interpretation": {
        "what_to_notice": [
            "korleis linjer og mål kan forme fleire kampflater på same grasområde",
            "forskjellen mellom 7er- og 9er-format",
            "nummereringa 51–55 i kampoppsettet",
            "ventesoner og gangliner utanfor speleflata",
            "den geografiske avstanden til Etne idrettsanlegg"
        ],
        "why_it_matters": [
            "Anlegget viser at store breiddeturneringar er avhengige av eit nett av lokale baner",
            "Steinsvollen gjer kampoppsett, dommararbeid og transport til ein synleg del av idrettshistoria"
        ],
        "counterpoints": [
            "Kjeldene dokumenterer ikkje når fotballanlegget blei bygd eller opna",
            "Dei fem kampflatene skal ikkje opprettast som fem separate History Go-stader",
            "2021 er den eldste kjelda i batchen, ikkje eit anleggsår"
        ]
    },
    "links": {
        "entry_ids": ["st_steinsvollen_fem_baner_i_turneringsnettet"],
        "related_places": ["etne_idrettsanlegg", "engebanen_etne"],
        "related_people": ["pal_askvig"]
    },
    "sources": [
        {"title": "Etnecup: Banar", "url": BANAR},
        {"title": "Etnecup: Turneringsreglar", "url": REGLAR},
        {"title": "Etnecup: Kontakt oss", "url": CONTACT},
        {"title": "NFF: Etne Idrettslag", "url": NFF_CLUB},
        {"title": "NFF: Etnecup 2021", "url": NFF_2021},
        {"title": "NFF: Etnecup 2023", "url": NFF_2023},
        {"title": "NFF: Etnecup 2024", "url": NFF_2024},
        {"title": "NFF: Etnecup 2025", "url": NFF_2025},
        {"title": "NFF: Etnecup 2026", "url": NFF_2026}
    ],
    "ui": {
        "mini_panel": {
            "show": True,
            "highlights": ["fact_steinsvollen_01", "fact_steinsvollen_03", "story_steinsvollen_01"],
            "max_items": 6
        }
    }
}
if not any(row.get("place_id") == article["place_id"] for row in articles):
    articles.append(article)
save_json(article_path, articles)

report = """# Steinsvollen fotballanlegg – rundingsbatch 1

## Omfang

Alle ni rundinger i sportprofilen er fylt: people, training, badges, works, civication, brands, før_nå, fortellinger og leksikon.

## Kilde- og avgrensningsvalg

- Etnecup nummererer fem Steinsvollen-flater 51–55 og fordeler dem mellom 7er og 9er.
- Turneringsreglene legger enkelte 7er-kamper og alle kampene i klasse 9 og 10 utenom finalen til Steinsvollen.
- NFF dokumenterer arenaen i 2021 og i tilgjengelige årsoversikter 2023–2026.
- 2021 brukes som eldste kilde i batchen, aldri som bygge- eller åpningsår.
- De fem kampflatene beholdes som ett samlet fysisk History Go-sted.
- Pål Askvig brukes som dokumentert organisatorisk people-anker, ikke som eier eller anleggsbygger.

## Trygghet

Treningsinnholdet krever åpen, tørr, ledig og tillatt grasflate. Det forbyr bruk under kamp, organisert trening, oppmerking og vedlikehold, og unngår harde skudd, lange pasninger og kontaktspill.

## Validering

Den midlertidige generator-workflowen kjører stedstesten, arvede sportstester, PlaceCard-auditer, people-manifestkontroll, TypeScript tools/web og `git diff --check` før den skriver den rene batchen tilbake til feature-grenen.
"""
report_path = ROOT / "reports/steinsvollen-rounds-batch1.md"
report_path.parent.mkdir(parents=True, exist_ok=True)
report_path.write_text(report, encoding="utf-8")
