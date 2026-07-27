#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERIFIED = "2026-07-27"
BASE = Path("data/people/litteratur/oslo/nationaltheatret")

profiles = {
    "anders_mordal.json": {
        "id": "anders_mordal",
        "visual": {"designCode": "person_stage_actor_miniature"},
        "name": "Anders Mordal",
        "initials": "AM",
        "desc": "Skuespiller og regissør som har arbeidet ved Nationaltheatret siden 1997, med spenn fra Ibsen og samtidsdramatikk til Torshovteatrets ensemblelaboratorier og familieforestillinger.",
        "tags": ["litteratur", "scenekunst", "teater", "skuespiller", "regissor", "ibsen", "torshovteatret", "komilab", "film", "tv"],
        "placeId": "nationaltheatret",
        "category": "litteratur",
        "kindLabel": "Skuespiller / regissør og ensembleskaper",
        "birth_date": "1963-03-03",
        "birth_place": "Norge",
        "active_place": "Bergen, Oslo og Trondheim",
        "year": 1997,
        "education": [
            "Statens Teaterhøgskole, 1988–1991",
            "Studentproduksjoner ved Statens Teaterhøgskole, blant annet En midtsommernattsdrøm og Stilperioden i 1990",
            "Praktisk ensemble- og rollearbeid ved Den Nationale Scene før ansettelsen ved Nationaltheatret i 1997"
        ],
        "materials": ["skuespillerarbeid", "sceneregi", "ensembleutvikling", "dramatisk tekst", "komedie", "film og TV"],
        "themes": ["Ibsen i samtid", "ensemblelaboratorium", "karakterkomedie", "barneteater", "scene og skjerm", "institusjonsteater og turné"],
        "works": [
            {"id": "varnatt_1976_mordal", "title": "Vårnatt", "year": 1976, "material": "filmskuespill", "place": "Norsk spillefilm", "summary": "Tidlig filmrolle som Hallstein i adaptasjonen av Tarjei Vesaas' roman."},
            {"id": "jeppe_pa_bjerget_1996_mordal", "title": "Jeppe på Bjerget", "year": 1996, "material": "skuespillerarbeid", "place": "Den Nationale Scene", "summary": "Tittelrollen markerte ham i klassisk komedie før overgangen til Nationaltheatret."},
            {"id": "kroplingen_1997_mordal", "title": "Krøplingen", "year": 1997, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Spilte Bartley i Martin McDonaghs mørke øykomedie i den første Nationaltheatret-sesongen."},
            {"id": "linus_i_svingen_2004_mordal", "title": "Linus i Svingen", "year": 2004, "material": "TV-skuespill", "place": "NRK", "summary": "Rollen som pappa Marvin gjorde ham kjent for et stort barne- og familiepublikum."},
            {"id": "en_folkefiende_2010_mordal", "title": "En folkefiende", "year": 2010, "material": "skuespillerarbeid", "place": "Trøndelag Teater", "summary": "Doktor Stockmann ga ham Heddaprisen for beste mannlige hovedrolle."},
            {"id": "ti_liv_2011_mordal", "title": "Ti liv! – Komilab nr. 3", "year": 2011, "material": "ensemble- og skuespillerarbeid", "place": "Nationaltheatret / Torshovteatret", "summary": "Komilab-prosjekt som utviklet komedie gjennom kollektivt laboratoriearbeid."},
            {"id": "visning_2014_mordal", "title": "Visning", "year": 2014, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Spilte Mikael i Cecilie Løveids drama om hjem, eierskap og oppløsning."},
            {"id": "enemy_of_the_duck_2016_mordal", "title": "Vildanden + En folkefiende: Enemy of the Duck", "year": 2016, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Aslaksen i en sammensmeltning av to Ibsen-stykker som undersøkte sannhet og flertallsmakt."}
        ],
        "popupDesc": "Anders Mordal ble født 3. mars 1963 og er utdannet ved Statens Teaterhøgskole fra 1988 til 1991. Før den formelle utdanningen hadde han allerede møtt filmkameraet som ungdom i Vårnatt. Etter studiene arbeidet han ved Den Nationale Scene, der tittelrollen i Jeppe på Bjerget viste et sterkt grep om både fysisk komedie og klassisk tekst.\n\nI 1997 ble Mordal ansatt ved Nationaltheatret. Der har han arbeidet på tvers av hovedscene, Torshovteatret, familieforestillinger og eksperimentelle ensembleprosjekter. Krøplingen, Ti liv!, Visning og Enemy of the Duck viser bredden fra mørk samtidskomedie til Ibsen-bearbeidelse. Han har også regissert og deltatt i Komilab, der skuespillernes kollektive prøverom ble gjort til en egen kunstnerisk metode.\n\nNationaltheatret er hovedankeret fordi den lange ansettelsen og de mange produksjonene gjør ham til en tydelig institusjonsbærer. Samtidig viser Heddaprisen for doktor Stockmann ved Trøndelag Teater og TV-rollene i Linus i Svingen og Jul i Svingen hvordan arbeidet beveger seg mellom hovedscene, regionale teatre og et bredt publikum. Profilen gjør derfor ensemblearbeid, komedie og moderne Ibsen-formidling synlig i samme karriere.",
        "places": ["nationaltheatret"],
        "image": "",
        "cardImage": "",
        "externalLinks": [
            {"type": "source", "label": "Store norske leksikon – Anders Mordal", "url": "https://snl.no/Anders_Mordal", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Sceneweb – Anders Mordal", "url": "https://sceneweb.no/nb/artist/5692/Anders_Mordal", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Nationaltheatret Forest – Anders Mordal", "url": "https://forest.nationaltheatret.no/person/anders-mordal", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Nationaltheatret Forest – Anders Mordal, arkivprofil", "url": "https://forest.nationaltheatret.no/Persons/Details/4eab9bfb-b56d-4b8a-b60e-eaa78cdaf39f", "verifiedAt": VERIFIED}
        ],
        "source_urls": ["https://snl.no/Anders_Mordal", "https://sceneweb.no/nb/artist/5692/Anders_Mordal", "https://forest.nationaltheatret.no/person/anders-mordal"],
        "verifiedAt": VERIFIED
    },
    "andrine_saether.json": {
        "id": "andrine_saether",
        "visual": {"designCode": "person_stage_actor_miniature"},
        "name": "Andrine Sæther",
        "initials": "AS",
        "desc": "Skuespiller ved Nationaltheatret siden 1995, særlig kjent for presise tolkninger av Jon Fosse, Henrik Ibsen, klassisk dramatikk og nyere ensemblebasert scenekunst.",
        "tags": ["litteratur", "scenekunst", "teater", "skuespiller", "jon_fosse", "ibsen", "torshovteatret", "oversettelse", "film", "tv"],
        "placeId": "nationaltheatret",
        "category": "litteratur",
        "kindLabel": "Skuespiller / Fosse- og Ibsentolker",
        "birth_date": "1964-09-07",
        "birth_place": "Oslo",
        "active_place": "Oslo og norske film- og TV-produksjoner",
        "year": 1995,
        "education": [
            "Statens Teaterhøgskole, 1992–1995",
            "Praktisk repertoar- og ensemblearbeid ved Nationaltheatret fra 1995",
            "Kunstnerisk ledelsesarbeid i Torshovgruppa ved Torshovteatret, 1998–2000"
        ],
        "materials": ["skuespillerarbeid", "dramatisk tekst", "ensemblearbeid", "oversettelse", "film", "TV-drama"],
        "themes": ["Jon Fosses sceniske språk", "Ibsens kvinneroller", "klassisk repertoar", "samtidsdramatikk", "Torshovteatrets kollektiv", "scene og skjerm"],
        "works": [
            {"id": "gengangere_1993_saether", "title": "Gengangere", "year": 1993, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Spilte Regine i Ibsens familiedrama før avsluttet teaterutdanning."},
            {"id": "barnet_1996_saether", "title": "Barnet", "year": 1996, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Sjukesøstra i en tidlig Nationaltheatret-oppsetning av Jon Fosse."},
            {"id": "lille_eyolf_1998_saether", "title": "Lille Eyolf", "year": 1998, "material": "skuespillerarbeid", "place": "Nationaltheatret / Torshovteatret", "summary": "Spilte Asta i Torshovgruppas Ibsen-arbeid og senere Rottejomfruen i nye versjoner."},
            {"id": "caravan_1999_saether", "title": "Caravan", "year": 1999, "material": "skuespillerarbeid og oversettelse", "place": "Nationaltheatret", "summary": "Spilte Kim og oversatte Helen Blakemans samtidstekst til norsk scene."},
            {"id": "draum_om_hausten_1999_saether", "title": "Draum om hausten", "year": 1999, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Kvinne i Jon Fosses konsentrerte møte mellom kjærlighet, familie og død."},
            {"id": "fruen_fra_havet_2000_saether", "title": "Fruen fra havet", "year": 2000, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Spilte Bolette i Ibsens drama om valg, frihet og binding."},
            {"id": "dodsvariasjonar_2001_saether", "title": "Dødsvariasjonar", "year": 2001, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Den unge kvinna i Jon Fosses formeksperiment om sorg og tid."},
            {"id": "faderen_2010_saether", "title": "Faderen", "year": 2010, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Laura i Strindbergs maktkamp mellom ektefeller og virkelighetsbilder."},
            {"id": "la_deg_vaere_2016_saether", "title": "La deg være", "year": 2016, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Rollen som Venn ga Heddaprisnominasjon for beste kvinnelige medspiller."}
        ],
        "popupDesc": "Andrine Sæther ble født i Oslo 7. september 1964 og gikk ved Statens Teaterhøgskole fra 1992 til 1995. Allerede under utdanningen spilte hun Regine i Gengangere på Nationaltheatret. Etter eksamen ble hun fast ansatt ved teateret, og den tidlige overgangen fra skole til institusjon ga henne et langt, sammenhengende arbeid med klassikere og ny dramatikk.\n\nSæther har vært særlig viktig i møtet mellom Nationaltheatret og Jon Fosses dramatikk. Barnet, Draum om hausten og Dødsvariasjonar krever lytting, rytme og presisjon i pauser og gjentakelser. Samtidig har hun tolket Ibsen, Holberg, Tsjekhov og Strindberg, arbeidet med oversettelse i Caravan og vært del av den kunstneriske ledelsen ved Torshovteatret. Dermed rommer praksisen både tekstnær rollebygging og kollektiv scenekunst.\n\nNationaltheatret er hovedankeret fordi ansettelsen fra 1995 binder hele karrieren til huset, Torshovscenen og et repertoar som stadig skifter mellom kanon og samtid. Film- og TV-rollene, fra Budbringeren og Evas øye til Berlinerpoplene og Dag Johan Haugeruds filmer, viser samtidig hvordan den sceniske konsentrasjonen virker foran kamera. Profilen gjør henne til et tydelig bindeledd mellom Fosse, Ibsen, ensemblearbeid og moderne norsk skjermdrama.",
        "places": ["nationaltheatret"],
        "image": "",
        "cardImage": "",
        "externalLinks": [
            {"type": "source", "label": "Store norske leksikon – Andrine Sæther", "url": "https://snl.no/Andrine_S%C3%A6ther", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Nationaltheatret – Andrine Sæther", "url": "https://www.nationaltheatret.no/om-oss/ensemble/andrine-sather", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Sceneweb – Andrine Sæther", "url": "https://sceneweb.no/nb/artist/312/Andrine_S%C3%A6ther", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Nationaltheatret Forest – Andrine Sæther", "url": "https://forest.nationaltheatret.no/person/andrine-sether", "verifiedAt": VERIFIED}
        ],
        "source_urls": ["https://snl.no/Andrine_S%C3%A6ther", "https://www.nationaltheatret.no/om-oss/ensemble/andrine-sather", "https://sceneweb.no/nb/artist/312/Andrine_S%C3%A6ther"],
        "verifiedAt": VERIFIED
    },
    "anne_krigsvoll.json": {
        "id": "anne_krigsvoll",
        "visual": {"designCode": "person_stage_actor_miniature"},
        "name": "Anne Krigsvoll",
        "initials": "AK",
        "desc": "Prisbelønt skuespiller med Nationaltheatret som hovedscene fra 1982, kjent for krevende klassiske og moderne kvinneroller på teater, film og fjernsyn.",
        "tags": ["litteratur", "scenekunst", "teater", "skuespiller", "ibsen", "jon_fosse", "samuel_beckett", "heddaprisen", "amandaprisen", "film"],
        "placeId": "nationaltheatret",
        "category": "litteratur",
        "kindLabel": "Skuespiller / klassiker- og samtidsdramatikktolker",
        "birth_date": "1957-02-04",
        "birth_place": "Trondheim",
        "active_place": "Oslo, Trondheim og norsk film og fjernsyn",
        "year": 1982,
        "education": [
            "Statens teaterskole, fullført 1982",
            "Praktisk ensemble- og repertoararbeid ved Nationaltheatret fra debuten i 1982",
            "Videre scene- og kamerapraksis ved Fjernsynsteatret 1985–1986 og Trøndelag Teater 1986–1987"
        ],
        "materials": ["skuespillerarbeid", "klassisk dramatikk", "samtidsdramatikk", "film", "TV-drama", "monologisk scenespråk"],
        "themes": ["kvinneroller med motstand", "Ibsen og Strindberg", "Jon Fosse", "psykologisk realisme", "absurd teater", "scene og kamera"],
        "works": [
            {"id": "camino_real_1982_krigsvoll", "title": "Camino Real", "year": 1982, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Scenedebut i en musikkdramaversjon av Tennessee Williams' stykke."},
            {"id": "trojanerinner_1984_krigsvoll", "title": "Trojanerinner", "year": 1984, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Kassandra i en særpreget oppsetning av Evripides' krigsdrama."},
            {"id": "av_maneskin_gror_1987_krigsvoll", "title": "Av måneskinn gror det ingenting", "year": 1987, "material": "TV-skuespill", "place": "Fjernsynsteatret", "summary": "Hovedrollen i Torborg Nedreaas-adaptasjonen ga Amandaprisen i 1988."},
            {"id": "skammen_1999_krigsvoll", "title": "Skammen", "year": 1999, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Idun Hov i dramatiseringen av Bergljot Hobæk Haffs roman ga Heddaprisen."},
            {"id": "virginia_woolf_2002_krigsvoll", "title": "Hvem er redd for Virginia Woolf?", "year": 2002, "material": "skuespillerarbeid", "place": "Oslo Nye Teater", "summary": "Martha i Albees ekteskapsdrama, senere også vist på TV."},
            {"id": "john_gabriel_borkman_2004_krigsvoll", "title": "John Gabriel Borkman", "year": 2004, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Ella Rentheim i Ibsens sene drama om makt, tap og forsakelse."},
            {"id": "meg_naer_2019_krigsvoll", "title": "Meg nær", "year": 2019, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Rollene En fremmed og En annen fremmed ga Heddaprisen for beste kvinnelige medspiller."},
            {"id": "lykkedager_2020_krigsvoll", "title": "Lykkedager", "year": 2020, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Winnie i Becketts krevende stykke om utholdenhet, språk og tid."}
        ],
        "popupDesc": "Anne Katharine Krigsvoll ble født i Trondheim 4. februar 1957 og gikk ut av Statens teaterskole i 1982. Samme år debuterte hun ved Nationaltheatret i Camino Real. Etter de første sesongene fulgte perioder ved Fjernsynsteatret og Trøndelag Teater før hun vendte tilbake til Nationaltheatret i 1987 og utviklet en lang karriere med store roller.\n\nKrigsvolls arbeid kjennetegnes av presis psykologisk observasjon og en vilje til å stå i roller med konflikt, skam, makt og utsatthet. Kassandra i Trojanerinner, Idun Hov i Skammen, Ella Rentheim i John Gabriel Borkman og Winnie i Lykkedager viser et spenn fra antikk tragedie til Ibsen og Beckett. På film og TV har hun blant annet vunnet Amanda for Av måneskinn gror det ingenting og Kvinner i for store herreskjorter.\n\nNationaltheatret er hovedankeret fordi debuten, den lange ansettelsen og flere av Heddapris-arbeidene er knyttet til huset. Gjestespillet som Martha i Hvem er redd for Virginia Woolf? kobler henne også til Oslo Nye Teater, mens periodene i Trondheim og Fjernsynsteatret viser en karriere som beveger seg mellom institusjoner og medier. Profilen samler klassisk tragedie, norsk samtidsdramatikk, absurd teater og kameraarbeid i én tydelig skuespillerpraksis.",
        "places": ["nationaltheatret", "oslo_nye_teater_hovedscenen"],
        "image": "",
        "cardImage": "",
        "externalLinks": [
            {"type": "source", "label": "Store norske leksikon – Anne Krigsvoll", "url": "https://snl.no/Anne_Krigsvoll", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Nationaltheatret – Anne Krigsvoll", "url": "https://www.nationaltheatret.no/om-oss/arkiv-skuespillere-og-kunstnerisk-lag/anne-krigsvoll", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Sceneweb – Anne Krigsvoll", "url": "https://sceneweb.no/nb/artist/7431/Anne_Krigsvoll", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Nationaltheatret Forest – Anne Krigsvoll", "url": "https://forest.nationaltheatret.no/person/anne-krigsvoll", "verifiedAt": VERIFIED}
        ],
        "source_urls": ["https://snl.no/Anne_Krigsvoll", "https://www.nationaltheatret.no/om-oss/arkiv-skuespillere-og-kunstnerisk-lag/anne-krigsvoll", "https://sceneweb.no/nb/artist/7431/Anne_Krigsvoll"],
        "verifiedAt": VERIFIED
    },
    "anne_marie_ottersen.json": {
        "id": "anne_marie_ottersen",
        "visual": {"designCode": "person_stage_actor_miniature"},
        "name": "Anne Marie Ottersen",
        "initials": "AMO",
        "desc": "Skuespiller ved Nationaltheatret fra 1970 som har forent oppsøkende teater, sterke kvinnefigurer, komedie, barneteater, film, fjernsyn og radio gjennom mer enn fem tiår.",
        "tags": ["litteratur", "scenekunst", "teater", "skuespiller", "oppsokende_teater", "jenteloven", "hustruer", "komedie", "barneteater", "radio"],
        "placeId": "nationaltheatret",
        "category": "litteratur",
        "kindLabel": "Skuespiller / ensemble- og kvinnefortellingstolker",
        "birth_date": "1945-04-29",
        "birth_place": "Kongsberg",
        "active_place": "Oslo, Kongsberg og norske scene- og medieproduksjoner",
        "year": 1970,
        "education": [
            "Examen artium på Kongsberg, 1964",
            "Ett år som lærer ved Vestsiden skole før teaterutdanningen",
            "Statens Teaterhøgskole fra 1966",
            "Elev ved Oslo Nye Teater, 1968–1969"
        ],
        "materials": ["skuespillerarbeid", "oppsøkende teater", "improvisasjon", "film", "TV-drama", "radioteater"],
        "themes": ["selvstendige kvinner", "kollektiv historieskriving", "arbeidsliv og hverdagsliv", "komedie og absurditet", "barneteater", "scene og medier"],
        "works": [
            {"id": "sandkassen_1970_ottersen", "title": "Sandkassen", "year": 1970, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Nationaltheatret-debut som Kirsten i Kent Anderssons stykke."},
            {"id": "tolvskillingsoperaen_1973_ottersen", "title": "Tolvskillingsoperaen", "year": 1973, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Spilte Polly Peachum og Betty i Brechts musikkteater."},
            {"id": "jenteloven_1974_ottersen", "title": "Jenteloven", "year": 1974, "material": "oppsøkende ensembleteater", "place": "Nationaltheatret / turné", "summary": "Spilte Ella i en kollektivt utviklet forestilling basert på innsamlede kvinnehistorier."},
            {"id": "virginia_woolf_1974_ottersen", "title": "Hvem er redd for Virginia Woolf?", "year": 1974, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Spilte Honey; senere tolket hun Martha ved Den Nationale Scene."},
            {"id": "hustruer_1975_ottersen", "title": "Hustruer", "year": 1975, "material": "filmskuespill", "place": "Norsk spillefilm", "summary": "Mie Jacobsen i Anja Breiens film, videreført i to oppfølgere."},
            {"id": "kollisjonen_1978_ottersen", "title": "Kollisjonen", "year": 1978, "material": "skuespillerarbeid", "place": "Oslo Nye Teater", "summary": "Den ensomme Sonja viste den poetiske siden av rollearbeidet."},
            {"id": "hustruer_ti_ar_1985_ottersen", "title": "Hustruer – ti år etter", "year": 1985, "material": "filmskuespill", "place": "Norsk spillefilm", "summary": "Mie-rollen ga Amandaprisen for beste kvinnelige hovedrolle i 1986."},
            {"id": "revisoren_2015_ottersen", "title": "Revisoren", "year": 2015, "material": "skuespillerarbeid", "place": "Nationaltheatret", "summary": "Spilte Anna, borgermesterens kone, i Gogols samfunnssatire."}
        ],
        "popupDesc": "Anne Marie Ottersen ble født på Kongsberg 29. april 1945. Etter examen artium i 1964 arbeidet hun ett år som lærer ved Vestsiden skole før hun kom inn på Teaterhøgskolen i 1966. Hun var elev ved Oslo Nye Teater i 1968–1969 og ble ansatt ved Nationaltheatret i 1970, der hun debuterte som Kirsten i Sandkassen.\n\nOttersen kom inn i teateret som del av en ny og politisk orientert generasjon. I Jenteloven samlet ensemblet historier, spilte på turné og lot samtalen med publikum være en del av arbeidet. På scenen har hun senere beveget seg mellom realistiske kvinnefigurer, Brecht, Ibsen, komedie og barneteater. Som Mie i Hustruer-filmene ble det kollektive kvinneperspektivet videreført til filmen, og rollen ga henne Amanda for Hustruer – ti år etter.\n\nNationaltheatret er hovedankeret fordi huset har vært den faste arbeidsplassen gjennom størstedelen av karrieren. Oslo Nye Teater, Det Norske Teatret, Fjernsynsteatret og Radioteatret viser samtidig bredden i praksisen. Et stort stemmeregister, improvisasjonsevne og sans for både det absurde og det hverdagslige gjør at profilen binder oppsøkende 1970-tallsteater til populær film, radio, TV og nyere klassikeroppsetninger.",
        "places": ["nationaltheatret", "oslo_nye_teater_hovedscenen", "det_norske_teatret"],
        "image": "",
        "cardImage": "",
        "externalLinks": [
            {"type": "source", "label": "Store norske leksikon – Anne Marie Ottersen", "url": "https://snl.no/Anne_Marie_Ottersen", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Sceneweb – Anne Marie Ottersen", "url": "https://sceneweb.no/nb/artist/20761/Anne_Marie%20Ottersen", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Nationaltheatret Forest – Anne Marie Ottersen", "url": "https://forest.nationaltheatret.no/person/anne-marie-ottersen", "verifiedAt": VERIFIED},
            {"type": "source", "label": "Nationaltheatret Forest – Jenteloven (1974)", "url": "https://forest.nationaltheatret.no/produksjon/jenteloven-19740116", "verifiedAt": VERIFIED}
        ],
        "source_urls": ["https://snl.no/Anne_Marie_Ottersen", "https://sceneweb.no/nb/artist/20761/Anne_Marie%20Ottersen", "https://forest.nationaltheatret.no/person/anne-marie-ottersen"],
        "verifiedAt": VERIFIED
    }
}

for filename, person in profiles.items():
    target = ROOT / BASE / filename
    target.write_text(json.dumps([person], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(f"Updated {len(profiles)} Nationaltheatret profiles")
