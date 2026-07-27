from __future__ import annotations

import json
from pathlib import Path

VERIFIED_AT = "2026-07-27"
ROOT = Path(__file__).resolve().parents[1]


def source(label: str, url: str) -> dict[str, str]:
    return {"type": "source", "label": label, "url": url, "verifiedAt": VERIFIED_AT}


def work(work_id: str, title: str, year: int, material: str, place: str, summary: str) -> dict[str, object]:
    return {
        "id": work_id,
        "title": title,
        "year": year,
        "material": material,
        "place": place,
        "summary": summary,
    }


def write_person(relative_path: str, profile: dict[str, object]) -> None:
    path = ROOT / relative_path
    path.write_text(json.dumps([profile], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


alfred = {
    "id": "alfred_maurstad",
    "visual": {"designCode": "person_stage_actor_miniature"},
    "name": "Alfred Maurstad",
    "initials": "AM",
    "desc": "Skuespiller, regissør, teatersjef og hardingfelespiller som bandt nynorsk scenekunst, Nationaltheatret, folkemusikk og norsk film sammen.",
    "tags": [
        "litteratur", "scenekunst", "teater", "skuespiller", "regissor", "teatersjef",
        "hardingfele", "folkemusikk", "film", "peer_gynt", "det_norske_teatret", "nationaltheatret",
    ],
    "placeId": "nationaltheatret",
    "category": "litteratur",
    "kindLabel": "Skuespiller / regissør, teatersjef og hardingfelespiller",
    "birth_date": "1896-07-26",
    "death_date": "1967-09-05",
    "birth_place": "Bryggja i Davik, Nordfjord",
    "active_place": "Bergen, Kristiania/Oslo, Trondheim og norske turnéscener",
    "year": 1931,
    "education": [
        "Underoffiserskolen i Bergen, 1916–1917",
        "Prøvespill og praktisk skuespilleropplæring ved Det Norske Teatret under Amund Rydland fra 1920",
        "Folkemusikalsk læring i Nordfjordmiljøet og gjennom turneer for Noregs Ungdomslag",
    ],
    "materials": [
        "skuespillerarbeid", "sceneregi", "filmregi", "hardingfele", "plateinnspilling", "dramatisk tekst",
    ],
    "themes": [
        "nynorsk scenekunst", "folkekultur og modernitet", "Peer Gynt-tradisjonen",
        "overgangen fra scene til film", "nasjonal stjernekultur", "komedie og fantastroller",
    ],
    "works": [
        work("laeraren_1921_maurstad", "Læraren", 1921, "skuespillerarbeid", "Det Norske Teatret", "Scenedebut som Gudleik i Arne Garborgs skuespill."),
        work("fossegrimen_1926_maurstad", "Fossegrimen", 1926, "skuespillerarbeid og hardingfele", "Det Norske Teatret", "Gjennombrudd som Torgeir, med Fanitullen som sentralt musikalsk nummer."),
        work("peer_gynt_1936_maurstad", "Peer Gynt", 1936, "skuespillerarbeid", "Nationaltheatret", "Det store scenegjennombruddet i tittelrollen mot Johanne Dybwads Mor Åse."),
        work("fant_1937_maurstad", "Fant", 1937, "filmskuespill", "Norsk spillefilm", "Rollen som Fændrik gjorde den sceniske energien hans til filmhistorie."),
        work("gjest_baardsen_1939_maurstad", "Gjest Baardsen", 1939, "filmskuespill og sang", "Norsk spillefilm", "Tittelrollen befestet posisjonen som Norges første store filmstjerne."),
        work("en_herre_med_bart_1942", "En herre med bart", 1942, "filmregi", "Norsk spillefilm", "Publikumssuksess med Wenche Foss og Per Aabel."),
        work("den_stundeslose_1948_maurstad", "Den stundesløse", 1948, "sceneregi", "Nationaltheatret", "Holberg-oppsetning som senere gjestet Dramaten i Stockholm."),
        work("lang_dags_ferd_1961_maurstad", "Lang dags ferd mot natt", 1961, "skuespillerarbeid", "Det Norske Teatret", "Siste store scenetriumf, spilt sammen med Tordis og Toralv Maurstad."),
    ],
    "popupDesc": "Alfred Jentoft Maurstad ble født på Bryggja i Nordfjord 26. juli 1896 og døde i Oslo 5. september 1967. Han gikk på underoffisersskolen i Bergen, arbeidet som kontorist og bokholder og utviklet samtidig hardingfelespillet i et levende folkemusikkmiljø. Etter prøvespill for Det Norske Teatret flyttet han til Kristiania og debuterte i Læraren i 1921.\n\nVed Det Norske Teatret slo han gjennom i Fossegrimen, der skuespill og hardingfele ble én scenisk figur. Etter arbeid ved Det Nye Teater kom han til Nationaltheatret i 1931. Tittelrollen i Peer Gynt i 1936 gjorde ham til en nasjonal stjerne. Maurstad kombinerte overskudd, fantasi, komikk og folkelig spillestil med presisjon nok for både klassisk scene og filmkamera. Fant og Gjest Baardsen gjorde ham til et tidlig ikon i norsk film, og han arbeidet også som filmregissør.\n\nNationaltheatret er hovedankeret fordi Peer Gynt-gjennombruddet, etterkrigsrollene og regiarbeidet hører hjemme der. Det Norske Teatret er samtidig avgjørende: der debuterte han, der ble hardingfela en del av den profesjonelle scenekunsten, og der kom den siste triumfen i Lang dags ferd mot natt. Den samlede profilen viser hvordan folkemusikk, nynorsk teater, hovedscene og populærfilm kunne møtes i én kunstnerkarriere.",
    "places": ["nationaltheatret", "det_norske_teatret"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        source("Store norske leksikon – Alfred Maurstad", "https://snl.no/Alfred_Maurstad"),
        source("Sceneweb – Alfred Maurstad", "https://sceneweb.no/nb/artist/16582/Alfred_Maurstad"),
        source("Sceneweb – Peer Gynt (Nationaltheatret)", "https://sceneweb.no/nb/production/41946/Peer_Gynt"),
        source("Sceneweb – Den stundesløse (1948)", "https://sceneweb.no/nb/production/16933/Den_stundesl%C3%B8se"),
    ],
    "source_urls": [
        "https://snl.no/Alfred_Maurstad",
        "https://sceneweb.no/nb/artist/16582/Alfred_Maurstad",
        "https://sceneweb.no/nb/production/16933/Den_stundesl%C3%B8se",
    ],
    "verifiedAt": VERIFIED_AT,
}

gerd = {
    "id": "gerd_grieg",
    "visual": {"designCode": "person_stage_actor_miniature"},
    "name": "Gerd Grieg",
    "initials": "GG",
    "desc": "Skuespiller og instruktør som fornyet Ibsen-spillet, bar Nationaltheatrets mellomkrigsensemble og formidlet norsk dramatikk under krigen.",
    "tags": [
        "litteratur", "scenekunst", "teater", "skuespiller", "instruktor", "ibsen",
        "nordahl_grieg", "motstandshistorie", "film", "mellomkrigstid", "nationaltheatret",
    ],
    "placeId": "nationaltheatret",
    "category": "litteratur",
    "kindLabel": "Skuespiller / instruktør og Ibsen-tolker",
    "birth_date": "1895-04-21",
    "death_date": "1988-08-09",
    "birth_place": "Bergen",
    "active_place": "Kristiania/Oslo, Berlin, London og norske turnéscener",
    "year": 1910,
    "education": [
        "Tidlig sceneopplæring gjennom Nationaltheatrets ensemble før debuten i 1910",
        "Praktisk filmarbeid ved Egede-Nissen Film Comp i Tyskland, 1918–1922",
        "Instruktør- og repertoararbeid ved Nationaltheatret fra 1930-årene",
    ],
    "materials": [
        "skuespillerarbeid", "sceneregi", "dramatisk tekst", "opplesning", "stumfilm", "ensemblearbeid",
    ],
    "themes": [
        "moderne Ibsen-tolkning", "kvinnelig handlekraft", "politisk dramatikk",
        "tragedie og lystspill", "krig og eksil", "bevaring av Nordahl Griegs forfatterskap",
    ],
    "works": [
        work("kongens_hjerte_1910_grieg", "Kongens hjerte", 1910, "skuespillerarbeid", "Nationaltheatret", "Debut som Lersol i Barbra Rings barnekomedie."),
        work("pan_1922_grieg", "Pan", 1922, "filmskuespill", "Norsk spillefilm", "Spilte Edvarda i Harald Schwenzens filmatisering av Hamsuns roman."),
        work("hedda_gabler_1932_grieg", "Hedda Gabler", 1932, "skuespillerarbeid", "Nationaltheatret", "En sentral Ibsen-tolkning som bidro til å fornye rollen."),
        work("lysistrata_1933_grieg", "Kvinnenes opprør – Lysistrata", 1933, "skuespillerarbeid", "Nationaltheatret", "Tittelrollen viste spennvidden som komedienne og ensemblekraft."),
        work("var_aere_1935_grieg", "Vår ære og vår makt", 1935, "skuespillerarbeid", "Nationaltheatret", "Spilte Kvinnen i Nordahl Griegs politiske drama."),
        work("familien_turbin_1936_grieg", "Familien Turbin", 1936, "skuespillerarbeid", "Nationaltheatret", "Elena Vasiljevna Turbin i en av mellomkrigstidens mest omstridte forestillinger."),
        work("tora_parsberg_1939_grieg", "Paul Lange og Tora Parsberg", 1939, "skuespillerarbeid", "Nationaltheatret", "Tora Parsberg ga henne Kritikerprisen for sesongen 1940–1941."),
        work("var_aere_1951_grieg", "Vår ære og vår makt", 1951, "sceneregi", "Nationaltheatret", "Etterkrigsoppsetning som holdt Nordahl Griegs politiske dramatikk levende."),
    ],
    "popupDesc": "Gerd Egede-Nissen Grieg ble født i Bergen 21. april 1895 og døde i Oslo 9. august 1988. Hun vokste opp i en stor teaterfamilie og debuterte ved Nationaltheatret allerede i 1910. Etter åtte år på scenen arbeidet hun med søstrene i Egede-Nissen Film Comp i Tyskland, før hun vendte tilbake til norsk teater som en mer erfaren film- og scenekunstner.\n\nFra returen til Nationaltheatret i 1928 ble hun en av mellomkrigstidens bærende krefter. Hun fornyet Ibsen-roller som Hedda Gabler, Irene, Ella Rentheim og Rebekka West, men behersket også Shakespeare, Holberg, operette og politisk samtidsdramatikk. Rollen som Tora Parsberg ble særlig berømt. Som instruktør arbeidet hun blant annet med operette og med Nordahl Griegs Vår ære og vår makt.\n\nUnder krigen levde hun i Storbritannia sammen med Nordahl Grieg og spilte, instruerte og holdt opplesninger for norske soldater og sjøfolk. Etter hans død ble formidlingen av forfatterskapet en viktig del av arbeidet hennes. Nationaltheatret er hovedankeret fordi hele spennvidden – fra barnedebut og Ibsen-fornyelse til politisk teater og etterkrigsregi – kan leses gjennom denne scenen.",
    "places": ["nationaltheatret"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        source("Store norske leksikon – Gerd Grieg", "https://snl.no/Gerd_Grieg"),
        source("Norsk biografisk leksikon – Gerd Grieg", "https://nbl.snl.no/Gerd_Grieg"),
        source("Sceneweb – Gerd Egede Nissen Grieg", "https://sceneweb.no/nb/artist/11409/Gerd_Egede%20Nissen%20Grieg"),
        source("Sceneweb – Vår ære og vår makt (1951)", "https://sceneweb.no/nb/production/16987/V%C3%A5r_%C3%A6re%20og%20v%C3%A5r%20makt"),
    ],
    "source_urls": [
        "https://snl.no/Gerd_Grieg",
        "https://nbl.snl.no/Gerd_Grieg",
        "https://sceneweb.no/nb/artist/11409/Gerd_Egede%20Nissen%20Grieg",
    ],
    "verifiedAt": VERIFIED_AT,
}

lillebil = {
    "id": "lillebil_ibsen",
    "visual": {"designCode": "person_stage_actor_miniature"},
    "name": "Lillebil Ibsen",
    "initials": "LI",
    "desc": "Danser og skuespiller med internasjonal ballettbakgrunn, elegant komediekunst og sterke moderne karakterroller på Nationaltheatret.",
    "tags": [
        "litteratur", "scenekunst", "teater", "dans", "ballett", "skuespiller",
        "komedie", "moderne_drama", "ibsen", "film", "nationaltheatret", "oslo_nye_teater",
    ],
    "placeId": "nationaltheatret",
    "category": "litteratur",
    "kindLabel": "Danser / skuespiller og komedienne",
    "birth_date": "1899-08-06",
    "death_date": "1989-08-22",
    "birth_place": "Kristiania",
    "active_place": "Kristiania/Oslo, Berlin, København, London, Paris og New York",
    "year": 1911,
    "education": [
        "Ballettundervisning hos moren Gyda Christensen",
        "Studier hos ballettmester Hans Beck ved Det Kongelige Teater i København",
        "Studier hos koreograf Michel Fokine og scenepraksis hos Max Reinhardt i Berlin",
    ],
    "materials": [
        "dans", "pantomime", "skuespillerarbeid", "stemme", "kropp", "komisk timing", "film",
    ],
    "themes": [
        "overgangen fra ballett til taleteater", "elegant komedie", "moderne psykologisk drama",
        "Ibsen-roller", "internasjonal scenekunst", "stjernepersonlighet og publikumskontakt",
    ],
    "works": [
        work("prinsessen_pa_erten_1911_ibsen", "Prinsessen på erten", 1911, "dans og pantomime", "Nationaltheatret", "Debuterte som tolvåring i ballettpantomimen."),
        work("den_lille_uskikkelige_1915", "Den lille uskikkelige prinsesse", 1915, "skuespillerarbeid", "Nationaltheatret", "Første talerolle på scenen."),
        work("das_mirakel_1917_ibsen", "Das Mirakel", 1917, "dans og pantomime", "Max Reinhardts scene, Berlin", "Spilte nonnen i Reinhardts store pantomimeproduksjon."),
        work("peer_gynt_anitra_1923_ibsen", "Peer Gynt", 1923, "dans", "Theatre Guild, New York", "Danset Anitra under en internasjonal Peer Gynt-oppsetning."),
        work("livets_spill_1929_ibsen", "Livets spill", 1929, "skuespillerarbeid", "Det Nye Teater", "Spilte Teresita ved åpningen av teateret."),
        work("kjaere_lognhals_1961_ibsen", "Kjære løgnhals", 1961, "skuespillerarbeid", "Nationaltheatret", "Mrs. Patrick Campbell i den langvarige suksessen mot Per Aabel; rollen ga Kritikerprisen."),
        work("virginia_woolf_1964_ibsen", "Hvem er redd for Virginia Woolf?", 1964, "skuespillerarbeid", "Nationaltheatret", "Martha ble en kraftfull moderne karakterrolle."),
        work("arsenikk_1968_ibsen", "Arsenikk og gamle kniplinger", 1968, "skuespillerarbeid", "Nationaltheatret", "Abby Brewster i den siste rollen som fast ansatt ved teateret."),
    ],
    "popupDesc": "Lillebil Ibsen, født Sofie Parelius Monrad Krohn i Kristiania 6. august 1899, døde i Oslo 22. august 1989. Hun fikk ballettundervisning av moren Gyda Christensen og studerte videre hos Hans Beck i København, Michel Fokine og Max Reinhardt. Allerede som tolvåring debuterte hun på Nationaltheatret, og før hun var voksen hadde hun en internasjonal karriere innen ballett og pantomime.\n\nEtter utenlandsårene gikk hun gradvis over til taleteater. Hun arbeidet ved Centralteatret og Det Nye Teater, behersket revy, operette, komedie og Ibsen-drama og utviklet en scenepersonlighet preget av presis kroppskontroll, replikkunst, eleganse og stor publikumskontakt. Ved Nationaltheatret fra 1956 til 1969 kombinerte hun klassisk komedie med krevende moderne roller som Martha i Hvem er redd for Virginia Woolf?.\n\nNationaltheatret er hovedankeret fordi både dansedebuten, skuespillerdebuten og den sene kunstneriske fordypningen fant sted der. Centralteatret og Oslo Nye Teaters hovedscene viser mellomleddet: overgangen fra internasjonal danser til en av Norges mest allsidige skuespillere. Kjære løgnhals samlet hele registeret hennes og ble spilt i flere tiår.",
    "places": ["nationaltheatret", "centralteatret", "oslo_nye_teater_hovedscenen"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        source("Store norske leksikon – Lillebil Ibsen", "https://snl.no/Lillebil_Ibsen"),
        source("Norsk biografisk leksikon – Lillebil Ibsen", "https://nbl.snl.no/Lillebil_Ibsen"),
        source("Sceneweb – Lillebil Ibsen", "https://sceneweb.no/nb/artist/21283/Lillebil_Ibsen"),
        source("Sceneweb – Arsenikk og gamle kniplinger", "https://sceneweb.no/nb/production/40221/Arsenikk_og%20gamle%20kniplinger"),
    ],
    "source_urls": [
        "https://snl.no/Lillebil_Ibsen",
        "https://nbl.snl.no/Lillebil_Ibsen",
        "https://sceneweb.no/nb/artist/21283/Lillebil_Ibsen",
    ],
    "verifiedAt": VERIFIED_AT,
}

tore = {
    "id": "tore_segelcke",
    "visual": {"designCode": "person_stage_actor_miniature"},
    "name": "Tore Segelcke",
    "initials": "TS",
    "desc": "Klassisk tragedienne for en moderne tid, kjent for Nora, Medea, Maria Stuart og mer enn førti år som ledende kraft ved Nationaltheatret.",
    "tags": [
        "litteratur", "scenekunst", "teater", "skuespiller", "tragedie", "ibsen",
        "klassisk_drama", "moderne_drama", "turne", "nationaltheatret", "det_norske_teatret",
    ],
    "placeId": "nationaltheatret",
    "category": "litteratur",
    "kindLabel": "Skuespiller / klassisk tragedienne",
    "birth_date": "1901-04-23",
    "death_date": "1979-09-22",
    "birth_place": "Fredrikstad",
    "active_place": "Fredrikstad, Oslo, Bergen og internasjonale gjestespill",
    "year": 1928,
    "education": [
        "Amatørdebut ved Sommerteatret i Fredrikstad",
        "Prøvespill og praktisk sceneopplæring ved Det Norske Teatret, 1921–1924",
        "Kunstnerisk veiledning hos Agnes Mowinckel og ensemblepraksis ved Den Nationale Scene",
    ],
    "materials": [
        "skuespillerarbeid", "stemme", "kropp", "klassisk tragedie", "moderne dramatikk", "opplesning", "turné",
    ],
    "themes": [
        "kvinnelig frigjøring", "tragedie i moderne spillestil", "Ibsen-tolkning",
        "klassisk og moderne repertoar", "morsroller", "internasjonal formidling av norsk teater",
    ],
    "works": [
        work("ran_1921_segelcke", "Ran", 1921, "skuespillerarbeid", "Det Norske Teatret", "Debuterte under navnet Torelil Løkkeberg."),
        work("den_praktfulle_hanrei_1924", "Den praktfulle hanrei", 1924, "skuespillerarbeid", "Det Frie Teater", "Gjennombruddet som Stella i Agnes Mowinckels regi."),
        work("konkylien_1929_segelcke", "Konkylien", 1929, "skuespillerarbeid", "Nationaltheatret", "Sonja ble en tidlig hovedrolle i Helge Krogs moderne drama."),
        work("et_dukkehjem_1936_segelcke", "Et dukkehjem", 1936, "skuespillerarbeid", "Nationaltheatret", "Nora ble en signaturrolle som hun tok med på omfattende internasjonale gjestespill."),
        work("anne_pedersdotter_1941_segelcke", "Anne Pedersdotter", 1941, "skuespillerarbeid", "Nationaltheatret", "Tittelrollen forente historisk drama med moderne tragediekunst."),
        work("medea_1952_segelcke", "Medea", 1952, "skuespillerarbeid", "Nationaltheatret", "Anouilhs Medea ble også del av hennes internasjonale en-kvinne-turné."),
        work("maria_stuart_1964_segelcke", "Maria Stuart", 1964, "skuespillerarbeid", "Nationaltheatret", "Schillers dronningrolle viste den monumentale klassiske siden av kunsten hennes."),
        work("moren_1972_segelcke", "Moren", 1972, "skuespillerarbeid", "Nationaltheatret", "Tittelrollen i Brechts drama førte tragedienne-tradisjonen inn i politisk teater."),
    ],
    "popupDesc": "Tore Dyveke Segelcke ble født i Fredrikstad 23. april 1901 og døde i Oslo 22. september 1979. Etter amatørteater i hjembyen avla hun prøve ved Det Norske Teatret og debuterte der i 1921. Agnes Mowinckel oppdaget det dramatiske potensialet hennes og regisserte gjennombruddet som Stella i Den praktfulle hanrei i 1924. Fire år ved Den Nationale Scene ga et bredt repertoar før hun kom til Nationaltheatret i 1928.\n\nVed Nationaltheatret utviklet Segelcke en spillestil som bar den klassiske tragediens stemme og format inn i moderne psykologisk drama. Hun spilte Ibsen, Bjørnson, Shakespeare, O'Neill, Anouilh, Brecht og moderne norsk dramatikk. Nora i Et dukkehjem ble en internasjonal signaturrolle, mens Medea, Maria Stuart, Anne Pedersdotter og de mange morsskikkelsene viste den monumentale kraften hennes.\n\nNationaltheatret er hovedankeret for mer enn førti år som ledende ensemblekraft. Det Norske Teatret viser starten og forbindelsen til Agnes Mowinckels scenefornyelse. Gjennom nordiske, europeiske og amerikanske turneer gjorde Segelcke norsk scenekunst synlig internasjonalt og demonstrerte at klassisk tragedie kunne fungere i filmens og fjernsynets tidsalder.",
    "places": ["nationaltheatret", "det_norske_teatret"],
    "image": "",
    "cardImage": "",
    "externalLinks": [
        source("Store norske leksikon – Tore Segelcke", "https://snl.no/Tore_Segelcke"),
        source("Norsk biografisk leksikon – Tore Segelcke", "https://nbl.snl.no/Tore_Segelcke"),
        source("Sceneweb – Tore Segelcke", "https://sceneweb.no/nb/artist/19546/Tore_Segelcke"),
        source("Sceneweb – Et dukkehjem", "https://sceneweb.no/nb/production/16658/Et_dukkehjem"),
    ],
    "source_urls": [
        "https://snl.no/Tore_Segelcke",
        "https://nbl.snl.no/Tore_Segelcke",
        "https://sceneweb.no/nb/artist/19546/Tore_Segelcke",
    ],
    "verifiedAt": VERIFIED_AT,
}

write_person("data/people/litteratur/oslo/nationaltheatret/alfred_maurstad.json", alfred)
write_person("data/people/litteratur/oslo/nationaltheatret/gerd_grieg.json", gerd)
write_person("data/people/litteratur/oslo/nationaltheatret/lillebil_ibsen.json", lillebil)
write_person("data/people/litteratur/oslo/nationaltheatret/tore_segelcke.json", tore)

duplicate = ROOT / "data/people/musikk/oslo/det_norske_teatret/alfred_maurstad_det_norske_teatret.json"
if duplicate.exists():
    duplicate.unlink()

manifest_path = ROOT / "data/people/manifest.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
duplicate_entry = "people/musikk/oslo/det_norske_teatret/alfred_maurstad_det_norske_teatret.json"
manifest["files"] = [entry for entry in manifest["files"] if entry != duplicate_entry]
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print("Completed Alfred Maurstad, Gerd Grieg, Lillebil Ibsen and Tore Segelcke")
