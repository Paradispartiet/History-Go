from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATE = "2026-07-19"
PLACE_ID = "kuba_parken"

PLACE_PATH = ROOT / "data/places/natur/oslo/places_oslo_natur_akerselvarute/kuba_parken.json"
INDEX_PATH = ROOT / "data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json"
MANIFEST_PATH = ROOT / "data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json"
QUIZ_PATH = ROOT / "data/quiz/natur/kuba_parken_sets.json"
STORY_PATH = ROOT / "data/stories/stories_kuba_parken.json"
STORY_MANIFEST_PATH = ROOT / "data/stories/stories_manifest_natur_batch_01.json"
LEKSIKON_PATH = ROOT / "data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json"
REPORT_PATH = ROOT / "reports/kubaparken-nature-rounds-batch1.md"
TEST_PATH = ROOT / "tests/kubaparken-nature-rounds-batch1.test.js"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def source(label: str, url: str, source_type: str = "reference"):
    return {
        "label": label,
        "url": url,
        "type": source_type,
        "lang": "nb",
        "verifiedAt": DATE,
    }


SOURCES = [
    source("Oslo byleksikon – Kuba", "https://oslobyleksikon.no/side/Kuba"),
    source("Oslo byleksikon – Akerselva miljøpark", "https://oslobyleksikon.no/side/Akerselva_miljøpark"),
    source("Lokalhistoriewiki – Kuba (Oslo)", "https://lokalhistoriewiki.no/wiki/Kuba_(Oslo)"),
    source("Lokalhistoriewiki – Christiania Seildugsfabrik", "https://lokalhistoriewiki.no/wiki/Christiania_Seildugsfabrik"),
    source("Oslo byleksikon – Kuba bru", "https://oslobyleksikon.no/side/Kuba_bru"),
    source("Industrimuseum – Kuba park", "https://www.industrimuseum.no/kulturminne/kuba-park", "industrial_history"),
    source("OsloMet Arc! – studentboligene i siloen", "https://www.oslomet.no/om/nyheter/arc-studentboliger-silo-kuba", "architecture"),
    source("Oslo kommune – Akerselva", "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/turstier-og-turveier/akerselva/", "official"),
    source("OpenStreetMap – parkgeometri for Kuba", "https://www.openstreetmap.org/search?query=Kuba%20Oslo", "geometry"),
]

place = read_json(PLACE_PATH)
place.update({
    "name": "Kuba-parken",
    "lat": 59.925251,
    "lon": 10.754117,
    "r": 180,
    "category": "natur",
    "year": 1991,
    "desc": "Elvepark i et industriformet terreng mellom Akerselva, Telthusbakken og det tidligere seilduksfabrikkområdet.",
    "popupDesc": "Kuba-parken ligger på østsiden av Akerselva mellom Maridalsveien, Telthusbakken og elva. Parken ble anlagt som del av Akerselva miljøpark i 1991, i et terreng som lenge var preget av Christiania Seildugsfabrik og annen industri langs vannet.\n\nI dag består stedet av åpne gressflater, skråninger, trær og en vegetert elvekant. Den tidligere siloen er ombygd til studentboliger, og gangbrua binder parken til vestsiden av elva. Natur-rundingen viser både hengebjørk og de seks fugleartene som allerede er kartlagt for stedet i History Go.",
    "primary_category": "natur",
    "secondary_category": "historie",
    "hybrid": True,
    "coordStatus": "verified_geometry",
    "coordType": "osm_area_midpoint",
    "coordVerifiedAt": DATE,
    "coordinateVerification": {
        "locatorType": "public_park_polygon",
        "sourceProvider": "OpenStreetMap",
        "sourceObjectId": "name=Kuba;leisure=park",
        "geocodeAccuracy": "verified_geometry",
        "coordRole": "park_area_midpoint",
        "coordStatus": "verified_geometry",
        "coordVerifiedAt": DATE,
        "geometryBounds": {
            "north": 59.9256847,
            "south": 59.9248168,
            "east": 10.7553151,
            "west": 10.7529187,
        },
    },
    "tags": [
        "park", "elvepark", "akerselva", "industrilandskap", "grøntdrag",
        "elvebredde", "studentboliger", "kuba_bru"
    ],
    "emne_ids": [
        "em_natur_urban_gronn_korridor",
        "em_by_parker_som_sosial_infrastruktur",
        "em_by_industriomforming_til_offentlig_rom",
    ],
    "quiz_profile": {
        "place_type": "elvepark i tidligere industrilandskap",
        "subtype": "akerselva_rute",
        "signature_features": [
            "parkanlegg fra 1991",
            "Christiania Seildugsfabrik fra 1856",
            "Kuba bru gjenåpnet for gående i 1999",
            "silo ombygd til studentboliger i 2001",
            "hengebjørk og seks kartlagte fuglearter",
        ],
        "primary_angles": [
            "natur_elvekorridor", "industri_og_arbeid", "byutvikling_transformasjon",
            "urbant_artsliv", "offentlig_grøntrom"
        ],
        "question_families": [
            "historisk_endring", "stedsspesifikk_funksjon", "artsobservasjon",
            "landskapslesning", "sammenligning_langs_elva"
        ],
        "avoid_angles": [
            "generisk_tursti", "arter_som_ikke_finnes_i_aktive_kart", "dagsaktuelle_arrangementer"
        ],
        "must_include": [
            "overgangen fra fabrikkrand til offentlig elvepark",
            "de sju artene i de aktive naturkartene",
            "sammenhengen mellom park, bru, silo og Akerselva",
        ],
        "contrast_targets": ["myralokka", "beierbrua", "nedre_foss"],
        "notes": "Bruk dokumentert parkhistorie og bare arter som finnes i aktive History Go-kart.",
    },
    "underbadge_ids": [
        "urbannatur", "park_og_hage", "kulturlandskap", "ravine_og_dal",
        "elv", "elvebredde", "kantvegetasjon", "biologisk_mangfold",
        "fugler", "artsregistrering", "grontdrag", "bypark"
    ],
    "nature_profile": {
        "type": "urban elvepark / skråningspark / grønn korridor",
        "title": "Elveparken mellom fabrikkspor og studentboliger",
        "summary": "Kuba-parken er et flernivå parkrom der åpne gressflater og trær ligger høyere enn Akerselvas vegeterte kant. Skråningene gjør overgangen fra bygate til vann synlig og skaper variasjon mellom solrike plenflater, trekroner, skygge og fuktigere elvenære soner. Parken er samtidig formet av industrien: Christiania Seildugsfabrik ble etablert her i 1856, og fabrikklandskapet satte preg på terreng, bygninger og ferdselslinjer. Da Kuba ble anlagt som del av Akerselva miljøpark i 1991, ble et tidligere produksjonsområde omgjort til offentlig grøntrom. Gangbrua fra 1999 og studentboligene i den ombygde siloen fra 2001 viser at park, bolig og elverute nå virker sammen. De aktive naturkartene dokumenterer hengebjørk, svarttrost, gråspurv, kjøttmeis, ringdue, skjære og gråmåke. Natur-rundingen viser derfor både vegetasjon, fugleliv, elvekorridor og hvordan historisk industri kan bli ramme for dagens bynatur.",
        "themes": [
            "åpen plen og spredte parktrær",
            "hengebjørk i det urbane parkmiljøet",
            "svarttrost, gråspurv og meiser i grøntrommet",
            "ringdue, skjære og gråmåke mellom park og by",
            "vegetert elvebredde langs Akerselva",
            "skråninger og nivåforskjeller mot vannet",
            "grønn korridor gjennom tett by",
            "industriformet terreng og gjenbrukte bygg",
            "offentlig ferdsel over Kuba bru",
            "balansen mellom opphold, slitasje og kantvegetasjon",
        ],
        "documented_species": {
            "flora": ["hengebjork"],
            "fauna": ["svarttrost", "graaspurv", "kjottmeis", "ringdue", "skjaere", "graamaake"],
            "source": "aktive History Go-naturkart",
        },
        "nearby_place_ids": ["myralokka", "beierbrua", "nedre_foss"],
    },
    "externalLinks": SOURCES,
    "tasks_profile": {
        "title": "Les Kuba som natur og industrilandskap",
        "summary": "Fire oppgaver som kan løses fra offentlig sti, bru og robuste parkflater.",
        "tasks": [
            {
                "id": "kuba_oppgave_nivaer",
                "title": "Les parkens nivåer",
                "instruction": "Stå på en offentlig ganglinje og finn tre nivåer: øvre parkflate, skråning og elvekant. Beskriv hvordan vegetasjon og bruk endrer seg ned mot vannet.",
                "why": "Kuba er ikke en flat park; nivåforskjellene skaper ulike natur- og oppholdssoner.",
            },
            {
                "id": "kuba_oppgave_industrispor",
                "title": "Finn industrien i parkbildet",
                "instruction": "Se etter siloen, fabrikkbygninger og terrenglinjer rundt parken. Pek ut minst to spor som viser at dette var et produksjonsområde før det ble park.",
                "why": "Parkens form forstås best når industrilandskapet leses sammen med dagens grøntrom.",
            },
            {
                "id": "kuba_oppgave_artsjakt",
                "title": "Finn arter fra artskartet",
                "instruction": "Se etter hengebjørk og lytt eller se etter svarttrost, gråspurv, kjøttmeis, ringdue, skjære og gråmåke. Registrer bare arter du faktisk observerer.",
                "why": "Alle sju artene finnes allerede i stedets aktive History Go-kart og kan derfor brukes som konkret observasjonsgrunnlag.",
            },
            {
                "id": "kuba_oppgave_bru_korridor",
                "title": "Test den grønne forbindelsen",
                "instruction": "Følg offentlig sti fra parken til Kuba bru. Noter hvordan brua forbinder park, elvebredde og ruta videre uten å gå inn i sårbar kantvegetasjon.",
                "why": "Bruforbindelsen gjør Kuba til både oppholdssted og del av en sammenhengende elvekorridor.",
            },
        ],
    },
    "training_profile": {
        "title": "Tørr parkøkt på Kuba",
        "summary": "En lett økt på offentlige og robuste flater som bruker parkens nivåer uten å gå ned på elvebredden.",
        "safety": "Hold deg på offentlig sti eller tørr, jevn gressflate. Unngå glatte skråninger, trapper i høy fart, elvekant og vegeterte randsoner. Ta hensyn til andre parkbrukere.",
        "exercises": [
            {
                "id": "kuba_trening_rolig_runde",
                "title": "Rolig park- og brurunde",
                "instruction": "Gå rolig i åtte minutter på offentlig sti rundt øvre park og fram til Kuba bru. Snu før underlaget blir smalt eller glatt.",
                "duration_minutes": 8,
                "intensity": "rolig",
                "why": "Runden viser hvordan park og bru inngår i samme ferdselsnett.",
            },
            {
                "id": "kuba_trening_gangintervall",
                "title": "Tre flate gangintervaller",
                "instruction": "Finn en tørr, flat og oversiktlig ganglinje. Gå raskt i 90 sekunder og rolig i 90 sekunder, tre ganger.",
                "duration_minutes": 9,
                "intensity": "moderat",
                "why": "Intervallene bruker robust parkgrunn uten å gjøre skråningen eller elvekanten til treningsarena.",
            },
            {
                "id": "kuba_trening_bevegelighet",
                "title": "Bevegelighet ved øvre plen",
                "instruction": "Avslutt på tørr og jevn gressflate med rolige ankel-, hofte- og skulderbevegelser i fem minutter.",
                "duration_minutes": 5,
                "intensity": "lett",
                "why": "Den åpne parkflaten gir et trygt avslutningspunkt når den er tørr og ikke opptatt.",
            },
        ],
    },
    "civication_store": [
        {
            "id": "kuba_seilduksfabrikk_relief",
            "title": "Relieff av Christiania Seildugsfabrik",
            "type": "bordrelieff",
            "kind": "physical_object",
            "desc": "Et fysisk relieff som viser fabrikkfronten, elva og parkflaten i samme snitt.",
            "placeSpecificReason": "Objektet knytter Kuba direkte til seilduksfabrikken som ble etablert her i 1856.",
            "historicalFunction": "Viser overgangen fra industristed til offentlig park.",
            "physicalObject": True,
            "placeSpecific": True,
            "storePrice": 45,
            "currency": "PC",
            "collection": "kuba_parken",
            "collectable": True,
        },
        {
            "id": "kuba_silo_modell",
            "title": "Siloen før og etter 2001",
            "type": "todelt_bygningsmodell",
            "kind": "physical_object",
            "desc": "En fysisk modell med industrisilo på den ene siden og studentboliger på den andre.",
            "placeSpecificReason": "Kuba-siloens ombygging er et markant gjenbruksspor ved parken.",
            "historicalFunction": "Forklarer hvordan industribygninger kan få ny boligfunksjon.",
            "physicalObject": True,
            "placeSpecific": True,
            "storePrice": 50,
            "currency": "PC",
            "collection": "kuba_parken",
            "collectable": True,
        },
        {
            "id": "kuba_bru_minatyr",
            "title": "Kuba bru i miniatyr",
            "type": "brumodell",
            "kind": "physical_object",
            "desc": "En liten fysisk modell av gangbrua som ble gjenåpnet i 1999.",
            "placeSpecificReason": "Brua forbinder Kuba-parken med vestsiden av Akerselva og elveruta.",
            "historicalFunction": "Viser hvordan forbindelser ble gjenåpnet i miljøparken.",
            "physicalObject": True,
            "placeSpecific": True,
            "storePrice": 30,
            "currency": "PC",
            "collection": "kuba_parken",
            "collectable": True,
        },
        {
            "id": "kuba_artshjul",
            "title": "Kuba-parkens artshjul",
            "type": "dreiekort",
            "kind": "physical_object",
            "desc": "Et fysisk dreiekort med hengebjørk og de seks kartlagte fugleartene.",
            "placeSpecificReason": "Artshjulet bruker nøyaktig stedets aktive History Go-artskart.",
            "historicalFunction": "Knytter dagens bynatur til parkens nye funksjon etter industriperioden.",
            "physicalObject": True,
            "placeSpecific": True,
            "storePrice": 25,
            "currency": "PC",
            "collection": "kuba_parken",
            "collectable": True,
        },
    ],
    "brands": [
        {
            "id": "christiania_seildugsfabrik",
            "name": "Christiania Seildugsfabrik",
            "type": "historisk_bedrift",
            "role": "Etablert ved Akerselva i 1856 og sentral for industrilandskapet rundt Kuba.",
        },
        {
            "id": "myrens_verksted",
            "name": "Myrens Verksted",
            "type": "historisk_bedrift",
            "role": "Industribedrift nord for parken som inngår i den større fabrikkorridoren.",
        },
        {
            "id": "oslo_kommune",
            "name": "Oslo kommune",
            "type": "offentlig_forvalter",
            "role": "Forvalter park, turvei og den offentlige delen av Akerselva miljøpark.",
        },
        {
            "id": "akerselva_miljopark",
            "name": "Akerselva miljøpark",
            "type": "parkprogram",
            "role": "Rammen for parkopparbeidelsen som ga Kuba ny offentlig funksjon i 1991.",
        },
        {
            "id": "studentsamskipnaden_siO",
            "name": "Studentsamskipnaden SiO",
            "type": "boligaktor",
            "role": "Studentboligaktør knyttet til den ombygde siloen ved Kuba.",
        },
        {
            "id": "hrtb_arkitekter",
            "name": "HRTB Arkitekter",
            "type": "arkitektkontor",
            "role": "Arkitektmiljø knyttet til ombyggingen av siloen til studentboliger.",
        },
        {
            "id": "norsk_teknisk_museum",
            "name": "Norsk Teknisk Museum / Industrimuseum",
            "type": "museum",
            "role": "Dokumenterer industriminnene langs Akerselva og Kuba-området.",
        },
    ],
    "for_na": {
        "title": "Fra fabrikkrand til offentlig elvepark",
        "before": "Fra 1856 lå Christiania Seildugsfabrik i industrilandskapet ved Kuba. Elvekanten, fabrikkbygningene og siloen inngikk i en produksjonskorridor der Akerselva var kraft-, transport- og lokaliseringsfaktor.",
        "now": "Siden parkopparbeidelsen i 1991 har Kuba vært offentlig grøntrom. Gangbrua, studentboligene i siloen, plenene, trærne og den vegeterte elvekanten gjør området til både nabolagspark og del av Akerselva-ruta.",
        "look_for": [
            "siloen som er ombygd til studentboliger",
            "Kuba bru over Akerselva",
            "nivåforskjellen mellom øvre plen og elvekant",
            "fabrikkbygninger rundt parkrommet",
            "hengebjørk og kartlagte fuglearter",
        ],
    },
})
for forbidden in ("rounds", "rundinger", "flora", "fauna"):
    place.pop(forbidden, None)
write_json(PLACE_PATH, place)

index = read_json(INDEX_PATH)
for row in index:
    if row.get("id") == PLACE_ID:
        row.update({
            "name": "Kuba-parken",
            "category": "natur",
            "lat": 59.925251,
            "lon": 10.754117,
            "r": 180,
            "year": 1991,
            "coordStatus": "verified_geometry",
            "coordType": "osm_area_midpoint",
        })
        break
else:
    raise RuntimeError("Kuba-parken mangler i ruteindeksen")
write_json(INDEX_PATH, index)

manifest = read_json(MANIFEST_PATH)
manifest["generated_at"] = "2026-07-19T23:30:00+02:00"
place_bytes = PLACE_PATH.read_bytes()
place_sha = hashlib.sha256(place_bytes).hexdigest()
for row in manifest.get("places", []):
    if row.get("id") == PLACE_ID:
        row.update({"name": "Kuba-parken", "category": "natur", "sha256": place_sha})
        break
else:
    raise RuntimeError("Kuba-parken mangler i rutemanifestet")
write_json(MANIFEST_PATH, manifest)

quiz_sources = [item["url"] for item in SOURCES[:8]]

def q(set_no: int, q_no: int, question: str, answer: str, wrong_1: str, wrong_2: str,
      knowledge: str, tags: list[str], scope: str = "place", qtype: str = "stedskonkret"):
    return {
        "id": f"kuba_parken_s{set_no}_q{q_no}",
        "quiz_id": f"natur_kuba_parken_set_{set_no}_q{q_no}",
        "categoryId": "natur",
        "placeId": PLACE_ID,
        "targetId": PLACE_ID,
        "question_scope": scope,
        "question": question,
        "options": [answer, wrong_1, wrong_2],
        "answer": answer,
        "answerIndex": 0,
        "knowledge": knowledge,
        "difficulty": 1 if set_no <= 2 else (2 if set_no <= 4 else 3),
        "question_type": qtype,
        "question_layer": ["intro_story", "place_life", "foundation", "advanced_place", "advanced_emne", "concept"][set_no - 1],
        "tags": tags,
        "source": quiz_sources,
        "claim_basis": "verified_sources",
    }

question_sets = [
    [
        ("Når ble Kuba-parken anlagt som del av Akerselva miljøpark?", "I 1991", "I 1856", "I 2007", "Parken ble anlagt i 1991 i et tidligere industripreget område.", ["1991", "akerselva_miljopark"]),
        ("Hva lå sentralt i industrilandskapet ved Kuba fra 1856?", "Christiania Seildugsfabrik", "Et kongelig slott", "En flyplass", "Christiania Seildugsfabrik ble etablert ved Akerselva i 1856.", ["christiania_seildugsfabrik", "1856"]),
        ("Hva kjennetegner parkens terreng?", "Nivåer med plen, skråning og elvekant", "En helt flat asfaltplass", "Et høyfjellsplatå", "Kuba har tydelige nivåforskjeller mellom øvre parkrom og elva.", ["skråning", "elvebredde"]),
        ("Hva binder Kuba til vestsiden av Akerselva?", "Kuba bru", "En motorveitunnel", "En taubane", "Kuba bru er en gangforbindelse over elva.", ["kuba_bru", "forbindelse"]),
        ("Hvilket tidligere industriobjekt er blitt studentboliger?", "Siloen", "Elvebredden", "Gangbrua", "Siloen ved Kuba ble ombygd til studentboliger i 2001.", ["silo", "studentboliger", "2001"]),
        ("Hvilken plante er kartlagt for Kuba i History Go?", "Hengebjørk", "Kokospalme", "Baobab", "Hengebjørk er floraarten i det aktive stedskartet.", ["hengebjork", "flora"]),
        ("Hva er den beste korte beskrivelsen av Kuba i dag?", "En offentlig elvepark i et tidligere industrilandskap", "En lukket fabrikk", "En urørt villmark", "Kuba kombinerer park, elvekorridor, industrispor og boligbruk.", ["elvepark", "industrilandskap"]),
    ],
    [
        ("Hva viser overgangen fra 1856 til 1991?", "Fra fabrikklandskap til offentlig park", "Fra skog til flyplass", "Fra park til gruve", "Seilduksfabrikken og miljøparken representerer to ulike brukslag.", ["transformasjon", "1856", "1991"]),
        ("Hvorfor er skråningen viktig for naturen?", "Den skaper ulike lys-, fukt- og vegetasjonssoner", "Den fjerner alle forskjeller", "Den gjør elva usynlig overalt", "Nivåforskjellen gir variasjon mellom plen, trær og elvekant.", ["mikrohabitat", "skråning"]),
        ("Hvilken av disse er en kartlagt fugl ved Kuba?", "Svarttrost", "Pingvin", "Struts", "Svarttrost finnes i det aktive fauna-kartet for stedet.", ["svarttrost", "fugler"]),
        ("Hvilken småfugl er kartlagt sammen med svarttrost?", "Gråspurv", "Albatross", "Kongeørn", "Gråspurv er en av de seks kartlagte fugleartene.", ["graaspurv", "fugler"]),
        ("Hva skjedde med Kuba bru i 1999?", "Den ble gjenåpnet som gangbru", "Den ble flyttet til Bergen", "Den ble et fabrikkgulv", "Gjenåpningen styrket forbindelsen på tvers av elva.", ["kuba_bru", "1999"]),
        ("Hvorfor hører siloen til Før/nå-rundingen?", "Den viser fysisk gjenbruk fra industri til bolig", "Den er en naturlig fjellform", "Den ble aldri brukt", "Ombyggingen i 2001 gjør transformasjonen synlig i én bygning.", ["gjenbruk", "silo", "2001"]),
        ("Hva bør spilleren gjøre ved artsjakt?", "Registrere bare arter som faktisk observeres", "Krysse av alle arter uten å se", "Gå ned i sårbar elvekant", "Stedets kart gir kandidater, men observasjonen må være reell.", ["artsregistrering", "feltpraksis"]),
    ],
    [
        ("Hva er en grønn korridor?", "En sammenhengende struktur som gir rom for arter og ferdsel", "En lukket kontorgang", "En parkeringskjeller", "Kuba inngår i Akerselvas sammenhengende blågrønne struktur.", ["gronn_korridor"], "emne", "definition"),
        ("Hva betyr industriformet bynatur?", "Natur og terreng som virker i et område preget av tidligere produksjon", "Natur helt uten menneskespor", "Et annet ord for motorvei", "Kuba viser at bynatur kan vokse fram i omformede industrilandskap.", ["industriformet_bynatur"], "emne", "definition"),
        ("Hva er kantvegetasjon?", "Vegetasjon i overgangen mellom land og vann", "Planter midt i et kjøpesenter", "Bare trær på fjellet", "Langs Akerselva bidrar kantvegetasjon med skjul, skygge og stabilitet.", ["kantvegetasjon"], "emne", "definition"),
        ("Hva betyr adaptiv gjenbruk?", "Å gi en eksisterende bygning ny funksjon", "Å rive alt og bygge likt", "Å la bygg stå tomme", "Siloen ved Kuba er et eksempel på gjenbruk fra industri til studentbolig.", ["adaptiv_gjenbruk"], "emne", "definition"),
        ("Hva er et parkhabitat?", "Et leveområde skapt av parkens trær, plen, busker og kanter", "Et rom uten liv", "Bare en benk", "Kuba har flere små habitatsoner innenfor samme park.", ["habitat", "bypark"], "emne", "definition"),
        ("Hva er stedlesning?", "Å bruke synlige spor til å forstå stedets natur og historie", "Å svare uten å se", "Å lese bare gatenavn", "På Kuba kan bru, silo, skråning og arter leses sammen.", ["stedlesning"], "emne", "definition"),
        ("Hva er biologisk mangfold i denne sammenhengen?", "Variasjon av arter og leveområder i park og elvekant", "Antall parkeringsplasser", "Bare størrelsen på plenen", "De sju kartlagte artene er ett dokumentert lag i parkens mangfold.", ["biologisk_mangfold"], "emne", "definition"),
    ],
    [
        ("Hvordan leses Kuba mest presist som landskap?", "Som et samspill mellom industrispor, parksoner, elv og bolig", "Som bare plen", "Som bare fabrikk", "Stedets styrke ligger i at flere brukslag er synlige samtidig.", ["landskapslesning", "transformasjon"]),
        ("Hvorfor bør trening holdes på robuste flater?", "For å unngå slitasje og glatte skråninger ved elva", "Fordi gress alltid er forbudt", "Fordi parken ikke har stier", "Tørr sti og flat plen er tryggere for både bruker og vegetasjon.", ["sikkerhet", "slitasje"]),
        ("Hva gjør hengebjørka relevant på Kuba?", "Den er den dokumenterte floraarten i det aktive stedskartet", "Den er et fabrikknavn", "Den finnes bare i tropene", "Artsrundingen skal bygge på dokumenterte kartkoblinger.", ["hengebjork", "artskart"]),
        ("Hvilket fuglepar viser både småfugl og større parkfugl?", "Kjøttmeis og ringdue", "Pingvin og emu", "Struts og pelikan", "Begge er aktivt kartlagt for Kuba, men bruker parkrommet forskjellig.", ["kjottmeis", "ringdue"]),
        ("Hva forteller gråmåka om parkens plassering?", "At parken inngår i en by der elv, tak og åpne flater ligger tett", "At Kuba ligger på høyfjellet", "At parken er under havet", "Gråmåke bruker urbane miljøer og er kartlagt ved stedet.", ["graamaake", "urbannatur"]),
        ("Hvordan endret gangbrua parkens funksjon?", "Den bandt parkrommet bedre til ruta på begge sider av elva", "Den stengte all ferdsel", "Den gjorde parken privat", "Forbindelsen fra 1999 styrket Kuba som gjennomgangs- og oppholdssted.", ["kuba_bru", "grøntdrag"]),
        ("Hva er den viktigste kildekritiske regelen her?", "Skill dokumenterte arter og årstall fra antakelser og dagsaktuelle forhold", "Finn på sjeldne arter", "Behandle alle nettsider som like", "Kuba-innholdet bygger på varige kilder og aktive kart.", ["kildekritikk"], "place", "kildekritikk"),
    ],
    [
        ("Hvorfor kan en tidligere fabrikkrand bli viktig bynatur?", "Omforming kan åpne elvekant, bevare bygg og skape nye habitater", "Industri og natur kan aldri møtes", "Parker trenger ingen historie", "Kuba viser hvordan ny offentlig bruk kan vokse fram uten at alle eldre spor forsvinner.", ["byomforming", "habitat"], "emne", "emne_avansert"),
        ("Hva er forskjellen mellom Kuba og Myraløkka?", "Kuba er tett knyttet til fabrikkbygg og bru; Myraløkka til en åpen industriformet parkdal", "De er samme sted", "Ingen av dem ligger ved elva", "Begge er elveparker, men landskapsform og historiske spor er forskjellige.", ["myralokka", "sammenligning"], "emne", "sammenligning"),
        ("Hva gjør Kuba til sosial infrastruktur?", "Gratis rom for ferdsel, møte, opphold og naturkontakt", "At alle må kjøpe billett", "At området er lukket", "Parken er et tilgjengelig hverdagsrom i tett by.", ["sosial_infrastruktur"], "emne", "emne_avansert"),
        ("Hvordan virker bolig og park sammen etter 2001?", "Studentboligene gir daglig bruk rundt et offentlig grøntrom", "Boligene fjernet parken", "Siloen ble en foss", "Gjenbruken knytter industribygg til dagens nabolagsliv.", ["studentboliger", "2001"], "emne", "emne_avansert"),
        ("Hvorfor er elvebredden mer enn en parkgrense?", "Den er habitat, ferdselskant og del av hele vassdraget", "Den er bare et gjerde", "Den har ingen økologisk funksjon", "Kantsonen binder lokalt parkmiljø til Akerselvas større system.", ["elvebredde", "vassdrag"], "emne", "emne_avansert"),
        ("Hva viser artslisten faglig?", "Et dokumentert utsnitt av arter knyttet til stedet, ikke en komplett inventering", "Alle arter som noen gang har levd i Oslo", "Bare sjeldne arter", "Aktive kart viser sju arter, men feltobservasjon kan variere.", ["artsregistrering", "kildekritikk"], "emne", "emne_avansert"),
        ("Hva er hovedlæringen i Før/nå-sporet?", "Byomforming kan bevare lesbare industrispor samtidig som offentlig naturbruk bygges ut", "Fortiden forsvinner alltid helt", "Parker er natur uten historie", "Kuba gjør flere tidslag synlige i samme parkbilde.", ["før_nå", "transformasjon"], "emne", "emne_avansert"),
    ],
    [
        ("Hvilket begrep beskriver Kuba som del av Akerselvas sammenhengende natur- og ferdselsstruktur?", "Grønn korridor", "Privat lager", "Høyfjellsvidde", "Kuba er ett ledd i grøntdraget langs elva.", ["gronn_korridor"], "concept", "concept"),
        ("Hvilket begrep beskriver ombyggingen av siloen?", "Adaptiv gjenbruk", "Naturlig erosjon", "Sesongtrekk", "En industribygning fikk ny boligfunksjon i 2001.", ["adaptiv_gjenbruk"], "concept", "concept"),
        ("Hvilket begrep beskriver vegetasjonen langs overgangen til elva?", "Kantvegetasjon", "Takbelegg", "Asfaltørken", "Elvekanten er en egen overgangssone.", ["kantvegetasjon"], "concept", "concept"),
        ("Hvilket begrepspar forklarer Kuba best?", "Industrilandskap og elvepark", "Flyplass og høyfjell", "Ørken og havis", "Stedet kombinerer produksjonshistorie og offentlig grøntrom.", ["industrilandskap", "elvepark"], "concept", "concept_pair"),
        ("Hva kalles systematisk registrering av arter på et sted?", "Artsregistrering", "Bygningsriving", "Trafikktelling", "Kuba-rundingen skiller kartlagte arter fra tilfeldige antakelser.", ["artsregistrering"], "concept", "concept"),
        ("Hva beskriver variasjonen mellom plen, trær, skråning og elvekant?", "Habitatmosaikk", "Monokultur uten kanter", "Kun arkitektur", "Flere små soner gir ulike forhold innen kort avstand.", ["habitatmosaikk"], "concept", "concept"),
        ("Hva kalles et gratis offentlig rom som støtter hverdagsmøter og aktivitet?", "Sosial infrastruktur", "Privat produksjonslinje", "Lukket medlemsrom", "Kuba fungerer både økologisk og sosialt i nabolaget.", ["sosial_infrastruktur"], "concept", "concept"),
    ],
]

sets = []
for set_no, rows in enumerate(question_sets, start=1):
    questions = []
    for q_no, row in enumerate(rows, start=1):
        question, answer, wrong_1, wrong_2, knowledge, tags, *extra = row
        scope = extra[0] if len(extra) > 0 else "place"
        qtype = extra[1] if len(extra) > 1 else "stedskonkret"
        questions.append(q(set_no, q_no, question, answer, wrong_1, wrong_2, knowledge, tags, scope, qtype))
    sets.append({
        "set_id": f"natur_kuba_parken_set_{set_no}",
        "level": set_no,
        "order": set_no,
        "xp": 40 + set_no * 10,
        "mode": ["place_intro_story", "place_life_people_events", "emne_based_foundation", "place_concrete_advanced", "emne_based_advanced", "concept_based"][set_no - 1],
        "questions": questions,
    })

quiz_doc = {
    "targetId": PLACE_ID,
    "categoryId": "natur",
    "generator_version": "chatgpt_history_go_verified_sources_v1",
    "generated_from": [
        str(PLACE_PATH.relative_to(ROOT)),
        str(LEKSIKON_PATH.relative_to(ROOT)),
        "data/natur/nature_oslo_expansion_place_map.json",
        "data/quiz/regler/SET_MAL_README_v3.md",
    ],
    "manual_production_notes": {
        "quality_direction": "sted → observasjon → dokumentert historie → naturfaglig forståelse",
        "hold_back": [
            "Ingen arter utover de aktive naturkartene.",
            "Ingen dagsaktuelle arrangementer eller driftsopplysninger.",
            "Ingen aktivitet i elvekant eller glatte skråninger.",
        ],
    },
    "sets": sets,
}
write_json(QUIZ_PATH, quiz_doc)

story = {
    "id": "st_kubaparken_fra_fabrikkrand_til_elvepark",
    "place_id": PLACE_ID,
    "person_id": None,
    "category": "natur",
    "title": "Mellom fabrikk og elvepark",
    "subtitle": "Hvordan produksjonslandskapet ved Akerselva ble et offentlig grøntrom",
    "hook": "På Kuba står ikke naturen etter historien. Parken er bygd inn i sporene etter fabrikken.",
    "summary": "Christiania Seildugsfabrik etablerte seg ved Akerselva i 1856. Etter nedleggelsen i 1960 ble området gradvis del av en ny offentlig elvekorridor. Kuba-parken ble anlagt i 1991, gangbrua gjenåpnet i 1999 og siloen ombygd til studentboliger i 2001.",
    "text": [
        "I 1856 ble Christiania Seildugsfabrik etablert ved Akerselva. Plasseringen bandt produksjonen til elva og til den voksende industrikorridoren som også omfattet Myrens Verksted lenger nord.",
        "Da fabrikkdriften opphørte i 1960, stod bygninger, silo, skråninger og elvekant igjen som et tydelig industrilandskap. Området var ikke tomt; det ventet på en ny sammenheng.",
        "Akerselva miljøpark gjorde elva mer tilgjengelig som sammenhengende offentlig rom. Kuba-parken ble anlagt i 1991. Plen, trær og ganglinjer la et nytt lag over fabrikkranden uten å viske ut alle sporene.",
        "Kuba bru ble gjenåpnet for gående i 1999. To år senere ble siloen ombygd til studentboliger. Dermed ble produksjonsbygningen en del av hverdagslivet rundt parken.",
        "I dag kan stedet leses gjennom både arter og arkitektur. Hengebjørk, svarttrost, gråspurv, kjøttmeis, ringdue, skjære og gråmåke bruker et parkrom som fortsatt er omgitt av fabrikkhistorie.",
    ],
    "tags": ["kuba_parken", "akerselva", "industrilandskap", "elvepark", "byomforming", "artsliv"],
    "related_places": ["myralokka", "beierbrua", "nedre_foss", "vulkan_industriomrade"],
    "sources": SOURCES,
}
write_json(STORY_PATH, [story])

story_manifest = read_json(STORY_MANIFEST_PATH)
story_rel = str(STORY_PATH.relative_to(ROOT))
files = story_manifest.setdefault("files", [])
found = False
for entry in files:
    if isinstance(entry, dict) and entry.get("path") == story_rel:
        entry.update({"category": "natur", "place_id": PLACE_ID})
        found = True
    elif isinstance(entry, str) and entry == story_rel:
        found = True
if not found:
    files.append({"path": story_rel, "category": "natur", "place_id": PLACE_ID})
write_json(STORY_MANIFEST_PATH, story_manifest)

article = {
    "place_id": PLACE_ID,
    "title": "Kuba-parken – elvepark mellom industri og boligby",
    "visual": {"designCode": "article_nature_route_miniature"},
    "version": 2,
    "popupDesc": "Kuba-parken er en elvepark i et tidligere industrilandskap ved Akerselva. Parken ble anlagt i 1991 og knytter i dag plen, skråninger, elvekant, gangbru, studentboliger og eldre fabrikkbygninger sammen.",
    "wikiText": [
        "Kuba ligger på østsiden av Akerselva mellom Maridalsveien, Telthusbakken og elva. Navnet er tradisjonelt forklart med at elvesvingen i området kunne minne om Cuba på et kart.",
        "Christiania Seildugsfabrik ble etablert ved elva i 1856 og var en sentral del av industrimiljøet. Fabrikken ble nedlagt i 1960. Parken ble senere anlagt som del av Akerselva miljøpark i 1991.",
        "Kuba bru ble gjenåpnet som gangforbindelse i 1999. Den tidligere siloen ble ombygd til 226 studentboliger i 2001, slik at et markant industriobjekt fikk ny bruk.",
        "Parkens natur består av flere små soner: øvre plen, trær, skråning og vegetert elvekant. De aktive History Go-kartene knytter hengebjørk, svarttrost, gråspurv, kjøttmeis, ringdue, skjære og gråmåke til stedet.",
        "Kuba viser hvordan en elvepark kan være både naturkorridor, hverdagsrom og arkiv over industribyens fysiske spor.",
    ],
    "summary": {
        "one_liner": "Kuba-parken er et offentlig grøntrom fra 1991 i landskapet etter Christiania Seildugsfabrik.",
        "themes": ["elvepark", "industrilandskap", "byomforming", "artsregistrering", "adaptiv gjenbruk"],
        "tone": ["nøktern", "stedsspesifikk", "kildebelagt"],
    },
    "classification": {
        "tags": ["Kuba", "Akerselva", "Christiania Seildugsfabrik", "Kuba bru", "Siloen", "urbannatur"],
    },
    "facts": [
        {
            "id": "kuba_fact_1856",
            "label": "Fabrikken",
            "desc": "Christiania Seildugsfabrik ble etablert ved Akerselva i 1856.",
            "confidence": "high",
            "sources": SOURCES[0:4],
        },
        {
            "id": "kuba_fact_1991",
            "label": "Parken",
            "desc": "Kuba-parken ble anlagt som del av Akerselva miljøpark i 1991.",
            "confidence": "high",
            "sources": SOURCES[0:3],
        },
        {
            "id": "kuba_fact_1999",
            "label": "Gangbrua",
            "desc": "Kuba bru ble gjenåpnet som gangforbindelse i 1999.",
            "confidence": "high",
            "sources": [SOURCES[4]],
        },
        {
            "id": "kuba_fact_2001",
            "label": "Siloen",
            "desc": "Den tidligere siloen ble ombygd til 226 studentboliger i 2001.",
            "confidence": "high",
            "sources": [SOURCES[6]],
        },
        {
            "id": "kuba_fact_species",
            "label": "Kartlagte arter",
            "desc": "Aktive History Go-kart viser hengebjørk og seks fuglearter ved Kuba.",
            "confidence": "high",
            "sources": [{"label": "History Go – aktive naturkart", "path": "data/natur/nature_oslo_expansion_place_map.json"}],
        },
    ],
    "chronology": [
        {"id": "kuba_chrono_1856", "year": 1856, "period": "Industrialisering", "desc": "Christiania Seildugsfabrik etableres ved Akerselva.", "confidence": "high", "sources": SOURCES[0:4]},
        {"id": "kuba_chrono_1960", "year": 1960, "period": "Industrinedleggelse", "desc": "Seilduksfabrikken avslutter driften.", "confidence": "high", "sources": SOURCES[2:4]},
        {"id": "kuba_chrono_1991", "year": 1991, "period": "Miljøpark", "desc": "Kuba-parken anlegges som offentlig grøntrom.", "confidence": "high", "sources": SOURCES[0:3]},
        {"id": "kuba_chrono_1999", "year": 1999, "period": "Forbindelse", "desc": "Kuba bru gjenåpnes for gående.", "confidence": "high", "sources": [SOURCES[4]]},
        {"id": "kuba_chrono_2001", "year": 2001, "period": "Gjenbruk", "desc": "Siloen tas i bruk som studentboliger.", "confidence": "high", "sources": [SOURCES[6]]},
    ],
    "sources": SOURCES,
}
leksikon = read_json(LEKSIKON_PATH)
replaced = False
for idx, row in enumerate(leksikon):
    if row.get("place_id") == PLACE_ID:
        leksikon[idx] = article
        replaced = True
        break
if not replaced:
    leksikon.append(article)
write_json(LEKSIKON_PATH, leksikon)

REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
REPORT_PATH.write_text("""# Kuba-parken – naturrundinger batch 1

Dato: 2026-07-19

## Identitets- og koordinatkontroll

Det tekniske stedet `kuba_parken` beholder ID og visningsnavnet `Kuba-parken`.
Markøren er flyttet omtrent 111 meter fra `59.92472, 10.75244` til midtpunktet i den dokumenterte parkgeometrien: `59.925251, 10.754117`.

## Fylte naturrundinger

- Oppgaver: fire konkrete stedshandlinger
- Natur: parksoner, elvekorridor, industrilandskap og alle sju aktive arter
- Merker: tolv kanoniske natur-underbadges
- Trening: tre tørre og sikre øvelser på offentlig og robust underlag
- Civication: fire fysiske, stedsspesifikke objekter
- Aktører: fabrikk, verksted, kommune, miljøpark, studentboliger, arkitekt og museum
- Før/nå: fra fabrikkrand til elvepark og boligmiljø
- Fortellinger: `Mellom fabrikk og elvepark`
- Leksikon: kildebelagt artikkel med fakta og kronologi

Ingen manuell `rounds`- eller `rundinger`-override er lagt inn. Ingen direkte `flora`- eller `fauna`-lister er lagt i stedfilen.

## Dokumenterte arter

Flora:
- hengebjørk

Fauna:
- svarttrost
- gråspurv
- kjøttmeis
- ringdue
- skjære
- gråmåke

## Dokumenterte hovedpunkter

- Christiania Seildugsfabrik etablert i 1856
- fabrikkdriften avsluttet i 1960
- Kuba-parken anlagt i 1991
- Kuba bru gjenåpnet for gående i 1999
- siloen ombygd til 226 studentboliger i 2001

## Kilder

Oslo byleksikon, Lokalhistoriewiki, Industrimuseum, OsloMet Arc!, Oslo kommune og OpenStreetMap.
""", encoding="utf-8")

TEST_PATH.parent.mkdir(parents=True, exist_ok=True)
TEST_PATH.write_text(r'''const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repo = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(repo, rel), 'utf8'));
const expectedRounds = ['tasks', 'nature', 'badges', 'training', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];

const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/natur:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha naturprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'Kuba-parken skal bruke de ni natur-rundingene');

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/kuba_parken.json';
const place = readJson(placePath);
const storiesPath = 'data/stories/stories_kuba_parken.json';
const story = readJson(storiesPath).find(row => row.id === 'st_kubaparken_fra_fabrikkrand_til_elvepark');
const articlePath = 'data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json';
const article = readJson(articlePath).find(row => row.place_id === place.id);
const validBadges = new Set(readJson('data/badges/natur.json').sub);
const placeIds = new Set(readJson('data/places/places_index.json').map(row => row.id));
const storyManifest = readJson('data/stories/stories_manifest_natur_batch_01.json');
const routeIndex = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json');
const routeManifest = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json');

assert.strictEqual(place.id, 'kuba_parken');
assert.strictEqual(place.name, 'Kuba-parken');
assert.strictEqual(place.category, 'natur');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.925251, 10.754117, 180, 1991]);
assert.strictEqual(place.coordStatus, 'verified_geometry');
assert.strictEqual(place.coordType, 'osm_area_midpoint');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'works', 'people', 'play_profile', 'flora', 'fauna']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Kuba-parken skal ikke ha ${forbidden}`);
}

const manifestEntry = routeManifest.places.find(row => row.id === place.id);
const indexEntry = routeIndex.find(row => row.id === place.id);
assert(indexEntry && indexEntry.lat === place.lat && indexEntry.lon === place.lon && indexEntry.year === 1991, 'Ruteindeksen skal følge stedfilen');
assert(manifestEntry && manifestEntry.sha256 === crypto.createHash('sha256').update(fs.readFileSync(path.join(repo, placePath))).digest('hex'), 'Rutemanifestet skal ha riktig SHA');
assert(storyManifest.files.some(entry => (typeof entry === 'string' ? entry : entry.path) === storiesPath), 'Story-filen skal være manifestlastet');
assert(story && story.place_id === place.id && story.person_id === null, 'Fortellingen skal være stedskoblet uten oppdiktet person');
assert(article && article.place_id === place.id, 'Leksikon-rundingen skal ha egen artikkel');

const roundContent = {
  tasks: place.tasks_profile,
  nature: place.nature_profile,
  badges: place.underbadge_ids,
  training: place.training_profile,
  civication: place.civication_store,
  brands: place.brands,
  før_nå: place.for_na,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds);
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Kuba-parken mangler ${roundId}`);
}

assert(place.externalLinks.length >= 8 && place.externalLinks.every(link => /^https:\/\//.test(link.url)), 'Kildelenker skal være komplette HTTPS-lenker');
assert(place.underbadge_ids.length >= 10 && place.underbadge_ids.every(id => validBadges.has(id)), 'Natur-underbadges skal være kanoniske');
assert(place.tasks_profile.tasks.length >= 4, 'Oppgaver-rundingen skal ha minst fire stedsspesifikke oppgaver');
assert(place.training_profile.exercises.length >= 3 && /offentlig/i.test(place.training_profile.safety) && /tørr/i.test(place.training_profile.safety) && /glatte/i.test(place.training_profile.safety), 'Trening skal være tørr og sikker');
assert(place.civication_store.length >= 4 && place.civication_store.every(item => item.physicalObject && item.placeSpecific), 'Civication skal ha fysiske stedsspesifikke objekter');
assert(place.brands.length >= 7, 'Aktør-rundingen skal dekke historisk og moderne forvaltning');
assert(typeof place.for_na.before === 'string' && typeof place.for_na.now === 'string' && place.for_na.look_for.length >= 5, 'Før/nå skal være runtime-lesbar');
assert(place.nature_profile.summary.length >= 500 && place.nature_profile.themes.length >= 8, 'Natur-rundingen skal være fyldig');
assert.strictEqual(new Set(place.nature_profile.themes).size, place.nature_profile.themes.length, 'Naturtemaene skal være unike');
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['myralokka', 'beierbrua', 'nedre_foss']);
for (const id of place.nature_profile.nearby_place_ids) assert(placeIds.has(id), `Ukjent nærkobling ${id}`);

const mapFiles = [
  'data/natur/nature_place_map.json',
  'data/natur/nature_bird_place_map.json',
  'data/natur/nature_oslo_expansion_place_map.json',
  'data/natur/nature_routes_place_map.json',
  'data/natur/nature_etne_place_map.json'
];
const mapped = { flora: [], fauna: [] };
for (const file of mapFiles) {
  const raw = readJson(file);
  const entry = (raw.places || raw)[place.id];
  if (!entry) continue;
  mapped.flora.push(...(entry.flora || []));
  mapped.fauna.push(...(entry.fauna || []));
}
const actualSpecies = [...new Set([...mapped.flora, ...mapped.fauna])].sort();
assert.deepStrictEqual(actualSpecies, ['graamaake', 'graaspurv', 'hengebjork', 'kjottmeis', 'ringdue', 'skjaere', 'svarttrost']);
const combinedNature = JSON.stringify(place.nature_profile);
for (const id of actualSpecies) assert(combinedNature.includes(id), `Natur-rundingen mangler kartlagt art ${id}`);

assert(story.sources.length >= 8 && story.related_places.includes('nedre_foss'), 'Fortellingen skal være kildebelagt og rutekoblet');
assert(article.sources.length >= 8 && article.facts.length >= 5 && article.chronology.length >= 5, 'Leksikonartikkelen skal være komplett');
const quiz = readJson('data/quiz/natur/kuba_parken_sets.json');
assert.strictEqual(quiz.sets.length, 6, 'Kuba-parken skal ha seks quizsett');
for (const set of quiz.sets) {
  assert.strictEqual(set.questions.length, 7, `${set.set_id} skal ha sju spørsmål`);
  for (const question of set.questions) {
    assert.strictEqual(question.claim_basis, 'verified_sources', `${question.id} skal være kildeverifisert`);
    assert(Array.isArray(question.source) && question.source.length >= 4, `${question.id} skal ha kilder`);
  }
}

const combined = JSON.stringify({ place, story, article, quiz });
for (const year of ['1856', '1960', '1991', '1999', '2001']) assert(combined.includes(year), `Kuba-parken skal dokumentere ${year}`);
for (const token of ['Christiania Seildugsfabrik', 'Kuba bru', 'studentboliger', 'hengebjørk']) assert(combined.includes(token), `Kuba-parken mangler ${token}`);

console.log('Kuba-parken nature rounds batch 1 OK');
''', encoding="utf-8")

print("Produced Kuba-parken nature rounds batch 1")
