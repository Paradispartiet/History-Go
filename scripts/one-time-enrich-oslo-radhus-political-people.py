from __future__ import annotations

import json
from pathlib import Path

VERIFIED_AT = "2026-07-26"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def replace_person(path: Path, person_id: str, replacement: dict) -> None:
    people = read_json(path)
    index = next((i for i, entry in enumerate(people) if entry.get("id") == person_id), None)
    if index is None:
        raise SystemExit(f"{person_id} was not found in {path}")
    people[index] = replacement
    write_json(path, people)


def replace_or_append(path: Path, person_id: str, replacement: dict) -> None:
    people = read_json(path)
    index = next((i for i, entry in enumerate(people) if entry.get("id") == person_id), None)
    if index is None:
        people.append(replacement)
    else:
        people[index] = replacement
    write_json(path, people)


by_path = Path("data/people/by/oslo/people_by_oslo.json")
politics_path = Path("data/people/politikk/oslo/people_politikk_oslo.json")
expansion_path = Path("data/people/politikk/oslo/people_politikk_oslo_place_expansion_batch_03.json")

albert_nordengen = {
    "id": "albert_nordengen",
    "visual": {"designCode": "person_politician_miniature"},
    "name": "Albert Nordengen",
    "initials": "AN",
    "desc": "Oslos lengstsittende ordfører, kjent som en tilgjengelig bypatriot og drivkraft bak store kommunale prosjekter.",
    "tags": ["by", "politikk", "ordforer", "lokaldemokrati", "kommunal_ledelse", "oslo", "radhusplassen", "oslo_radhus", "bypatriot"],
    "placeId": "radhusplassen",
    "places": ["radhusplassen", "oslo_radhus"],
    "category": "by",
    "kindLabel": "Ordfører / kommunal leder og byrepresentant",
    "birth_date": "1923-05-02",
    "death_date": "2004-12-18",
    "birth_place": "Våler i Solør",
    "active_place": "Oslo",
    "year": 1976,
    "education": [
        "Treiders Handelsskole i Oslo",
        "Examen artium som privatist",
        "Bankakademiet"
    ],
    "themes": [
        "lokaldemokrati", "ordførerrollen", "kommunal infrastruktur", "vann og avløp",
        "idrettsanlegg", "kulturinstitusjoner", "byrepresentasjon", "kommunal parlamentarisme"
    ],
    "works": [
        {"id": "nordengen_bystyret", "title": "Oslo bystyre og formannskap", "year": "1952–1991", "place": "Oslo rådhus", "summary": "Langvarig kommunal tjeneste, med plass i formannskapet fra 1956 og bred erfaring før ordførervervet."},
        {"id": "nordengen_ordforer", "title": "Ordfører i Oslo", "year": "1976–1990", "place": "Oslo rådhus og Rådhusplassen", "summary": "Fjorten år som hovedstadens ordfører gjorde ham til byens lengstsittende og mest synlige kommunale representant."},
        {"id": "nordengen_tunneler", "title": "Kommunale tunnelprosjekter", "year": "1970- og 1980-årene", "place": "Oslo", "summary": "Bidro politisk til realiseringen av flere store tunnelprosjekter som endret trafikk og bystruktur."},
        {"id": "nordengen_veas", "title": "Oslofjordens Avløpsselskap (VEAS)", "year": "1970- og 1980-årene", "place": "Oslofjorden", "summary": "Støttet det omfattende interkommunale vannrensingsprosjektet som reduserte forurensningen i fjorden."},
        {"id": "nordengen_holmenkollen", "title": "Modernisering av Holmenkollanlegget", "year": "1980-årene", "place": "Holmenkollen", "summary": "Var med på å sikre politisk støtte til modernisering av et av Oslos viktigste idretts- og representasjonsanlegg."},
        {"id": "nordengen_spektrum", "title": "Oslo Spektrum", "year": 1990, "place": "Vaterland, Oslo", "summary": "Arbeidet for arenaen som tidlig fikk folkenavnet «Albert Hall» etter den profilerte ordføreren."},
        {"id": "nordengen_kultur", "title": "Ledelse av byens kulturinstitusjoner", "year": "1974–1990", "place": "Oslo", "summary": "Hadde styreverv ved blant annet Nationaltheatret, Oslo Nye Teater, Oslo Konserthus og Oslo Kinematografer."}
    ],
    "popupDesc": "Albert Nordengen ble født i Våler i Solør 2. mai 1923 og døde i Oslo 18. desember 2004. Som fjortenåring flyttet han til hovedstaden, tok handelsskole, examen artium og Bankakademiet og bygget en yrkeskarriere i Spareskillingsbanken. Parallelt gikk han inn i Oslo-politikken og satt i bystyret fra begynnelsen av 1950-årene til 1991.\n\nFra 1976 til 1990 var Nordengen ordfører i Oslo. Han ble kjent for en åpen kontordør, sterk bypatriotisme og en representasjonsform som gjorde ordføreren synlig både i Rådhuset og ute blant innbyggerne. Rådhusplassen er derfor et presist hovedanker: her møtes kommunens institusjonelle makt, offentlige seremonier, folkeliv og byens ansikt mot fjorden.\n\nI ordførertiden var Nordengen knyttet til store kommunale oppgaver som tunnelutbygging, VEAS-anlegget, modernisering av Holmenkollen og byggingen av Oslo Spektrum. Han engasjerte seg også sterkt i kulturinstitusjonene. Da kommunal parlamentarisme ble innført i 1986, mistet ordføreren mye formell makt til byrådslederen, men Nordengens personlige autoritet gjorde fortsatt ordførervervet til en sentral offentlig rolle.",
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Albert Nordengen", "url": "https://snl.no/Albert_Nordengen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – tidligere ordførere", "url": "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/om-ordforeren/tidligere-ordforere/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Byarkivet/Tobias – Hele Oslos Albert", "url": "https://www.oslo.kommune.no/OBA/tobias/tobiasartikler/pdf_arkiv/tobias2021.pdf", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Albert_Nordengen", "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/om-ordforeren/tidligere-ordforere/"],
    "verifiedAt": VERIFIED_AT
}

rolf_stranger = {
    "id": "rolf_stranger",
    "visual": {"designCode": "person_politician_miniature"},
    "name": "Rolf Stranger",
    "initials": "RS",
    "desc": "Forretningsmann og Oslo-politiker som overrakte det første ordførerkjedet ved rådhusåpningen og senere ble ordfører.",
    "tags": ["politikk", "lokaldemokrati", "ordforer", "radhusets_apning", "oslo_radhus", "oslo_hoyre", "kulturpolitikk"],
    "placeId": "oslo_radhus",
    "places": ["oslo_radhus"],
    "category": "politikk",
    "kindLabel": "Ordfører / lokalpolitiker og kulturpolitisk institusjonsbygger",
    "birth_date": "1891-01-15",
    "death_date": "1990-06-18",
    "birth_place": "Kristiania",
    "active_place": "Oslo",
    "year": 1950,
    "period": "radhusets_apning_og_oslo_ordforer",
    "education": [
        "Skolegang i Kristiania",
        "Juridiske studier ved Det Kongelige Frederiks Universitet",
        "Cand.jur. 1914"
    ],
    "themes": [
        "lokaldemokrati", "ordførerrollen", "opposisjonsledelse", "parlamentarisk arbeid",
        "kulturpolitikk", "teaterinstitusjoner", "byhistorie", "kommunal representasjon"
    ],
    "works": [
        {"id": "stranger_ordforerkjedet", "title": "Det første ordførerkjedet", "year": 1950, "place": "Oslo rådhus", "summary": "Som opposisjonsleder overrakte Stranger St. Hallvardkjedet til ordfører Halvdan Eyvind Stokke ved åpningen 15. mai."},
        {"id": "stranger_bystyret", "title": "Oslo bystyre", "year": "1926–1967", "place": "Oslo", "summary": "Mer enn førti år i bystyret gjorde ham til en av det 20. århundrets mest erfarne Oslo-politikere."},
        {"id": "stranger_ordforer", "title": "Ordfører i Oslo", "year": "1956–1959 og 1962–1963", "place": "Oslo rådhus", "summary": "Ledet bystyret og representerte hovedstaden i to perioder."},
        {"id": "stranger_stortinget", "title": "Stortingsrepresentant", "year": "1945–1953", "place": "Stortinget", "summary": "Representerte Oslo og arbeidet blant annet i finanskomiteen i den første etterkrigstiden."},
        {"id": "stranger_oslo_hoyre", "title": "Leder i Oslo Høyre", "year": "1939–1970", "place": "Oslo", "summary": "Ledet hovedstadspartiet gjennom krig, gjenreisning og omfattende kommunal vekst."},
        {"id": "stranger_oslo_nye", "title": "Styreleder for Oslo Nye Teater", "year": "1959–1984", "place": "Oslo Nye Teater", "summary": "Langvarig institusjonsledelse som knyttet kommunalpolitikken til byens scenekunst."},
        {"id": "stranger_kulturfond", "title": "Rolf Strangers kulturfond", "year": 1982, "place": "Oslo", "summary": "Opprettet et fond som støttet kunstneriske og kulturhistoriske tiltak i hovedstaden."},
        {"id": "stranger_mitt_hjertes_oslo", "title": "Mitt hjertes Oslo", "year": 1987, "place": "Oslo", "summary": "Erindringsbok om oppvekst, politikk, næringsliv og byliv i Kristiania og Oslo."}
    ],
    "popupDesc": "Rolf Stranger ble født i Kristiania 15. januar 1891 og døde i Oslo 18. juni 1990. Han tok juridisk embetseksamen i 1914, arbeidet i familiebedriften og gikk samtidig inn i kommunalpolitikken. Fra 1926 til 1967 satt han i Oslo bystyre, og han ledet Oslo Høyre gjennom mer enn tre tiår.\n\nVed åpningen av Oslo rådhus på St. Hallvards dag 15. mai 1950 hadde Stranger rollen som opposisjonsleder. På vegne av alle partiene overrakte han Norges første ordførerkjede til ordfører Halvdan Eyvind Stokke. Handlingen gjør koblingen til Rådhuset konkret: han var en sentral deltaker i seremonien som tok bygningen i politisk og representativ bruk.\n\nStranger var senere ordfører i periodene 1956–1959 og 1962–1963. Han satt også på Stortinget, ledet en rekke kulturinstitusjoner og var styreleder for Oslo Nye Teater i 25 år. Kulturfondet og erindringsboken Mitt hjertes Oslo viser hvordan han gjorde lokalpolitikk, kultur og byhistorie til deler av samme offentlige prosjekt.",
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Rolf Stranger", "url": "https://snl.no/Rolf_Stranger", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – ordførerkjedet", "url": "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/ordforerkjedet/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – tidligere ordførere", "url": "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/om-ordforeren/tidligere-ordforere/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – 80 år med kunst i byen", "url": "https://aktuelt.oslo.kommune.no/det-felles-eide-80-ar-med-kunst-i-byen", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://www.oslo.kommune.no/politikk/bystyret/ordforeren/ordforerkjedet/", "https://snl.no/Rolf_Stranger"],
    "verifiedAt": VERIFIED_AT
}

kirsten_sand = {
    "id": "kirsten_sand",
    "visual": {"designCode": "person_architect_miniature"},
    "name": "Kirsten Sand",
    "initials": "KS",
    "desc": "Arkitekt, boligplanlegger og gjenreisningspioner; den første kvinnen som fullførte full arkitektutdanning ved NTH.",
    "tags": ["by", "arkitektur", "kvinner_i_arkitektur", "boligplanlegging", "gjenreisning", "nord_norge", "hverdagsarkitektur"],
    "category": "by",
    "kindLabel": "Arkitekt / boligplanlegging og gjenreisning",
    "birth_date": "1895-11-27",
    "death_date": "1996-05-12",
    "birth_place": "Kristiania",
    "active_place": "Oslo, Skjervøy og Tromsø",
    "year": 1919,
    "education": [
        "Arkitektstudiet ved Norges tekniske høgskole (NTH)",
        "Full arkitekteksamen i 1919 som første kvinne ved NTH",
        "Praksis ved private og offentlige arkitekt- og reguleringskontorer"
    ],
    "materials": ["tre", "mur", "standardiserte boligelementer", "plan- og kartmateriale", "interiørløsninger", "klimatilpassede konstruksjoner"],
    "themes": [
        "boligsak", "kvinner i arkitekturen", "hverdagsliv uten hushjelp", "gjenreisning etter krig",
        "regional planlegging", "hygiene og helse", "småhus", "musikkopplæring"
    ],
    "works": [
        {"id": "sand_nth", "title": "Første kvinne med full arkitektutdanning fra NTH", "year": 1919, "place": "Trondheim", "summary": "Brøt en institusjonell kjønnsgrense og åpnet et nytt profesjonelt rom for kvinnelige arkitekter."},
        {"id": "sand_oslo_praksis", "title": "Egen arkitektpraksis i Oslo", "year": "1928–1938", "place": "Oslo og Aker", "summary": "Tegnet særlig småhus og hytter, med praktiske planløsninger tilpasset vanlige husholdninger."},
        {"id": "sand_helserad", "title": "Boligarbeid i Oslo Helseråd", "year": "fra 1936/1938", "place": "Oslo", "summary": "Arbeidet med boligforhold, hygiene og funksjonelle løsninger som en del av kommunens helsearbeid."},
        {"id": "sand_vann_husmodrene", "title": "Vann til husmødrene", "year": 1939, "place": "Østkantutstillingen, Oslo", "summary": "Bidro til utstilling om vann, boligstandard og husarbeidets praktiske vilkår."},
        {"id": "sand_boligundersokelse", "title": "Oslo Byes Vels boligundersøkelse", "year": 1942, "place": "Oslo", "summary": "Deltok i kartleggingen av boliger og levekår under krigen."},
        {"id": "sand_gjenreisning", "title": "Gjenreisingen av Nord-Troms", "year": "1945–1966", "place": "Skjervøy og Nord-Troms", "summary": "Arbeidet som distriktsarkitekt og Husbank-arkitekt med planlegging og boligbygging etter nedbrenningen."},
        {"id": "sand_mellomveien_130", "title": "Egen bolig i Mellomveien 130", "year": 1952, "material": "tre", "place": "Tromsø", "summary": "Eksperimenthus planlagt for effektivt familieliv uten hushjelp; boligen er senere fredet."},
        {"id": "sand_musikk", "title": "Musikkopplæring og barneorkestre", "year": "etterkrigstiden", "place": "Tromsø", "summary": "Kombinerte arkitektvirket med omfattende arbeid for barns musikkopplæring."}
    ],
    "popupDesc": "Kirsten Sand ble født i Kristiania 27. november 1895 og døde i Tromsø 12. mai 1996. I 1919 ble hun den første kvinnen som fullførte den fulle arkitektutdanningen ved NTH. Etter praksis ved flere kontorer drev hun egen arkitektvirksomhet i Oslo fra 1928 til 1938, særlig med småhus og hytter i Aker.\n\nGjennom Oslo Helseråd, utstillingen Vann til husmødrene og Oslo Byes Vels boligundersøkelse arbeidet Sand med sammenhengen mellom arkitektur, helse, husarbeid og sosial boligstandard. Etter krigen fikk hun en nøkkelrolle i gjenreisingen av Nord-Troms. Som distriktsarkitekt arbeidet hun mellom lokale behov, statlige ordninger og knapp tilgang på materialer og fagfolk.\n\nBoligen hun tegnet til seg selv i Mellomveien 130 i Tromsø i 1952 viser ideene i konkret form: et hverdagsorientert hus med løsninger som skulle lette arbeidet i familier uten hushjelp. Den tidligere repo-koblingen til Universitetsplassen og Oslo rådhus er fjernet fordi den var tematisk og ikke dokumenterte at Sand arbeidet, bodde eller utførte et konkret oppdrag der. Profilen står derfor uten aktivt History Go-stedsanker til et direkte dokumentert Sand-sted er opprettet.",
    "places": [],
    "placeLinkStatus": "awaiting_direct_canonical_place",
    "image": "bilder/kort/people/kirsten_sand.PNG",
    "cardImage": "bilder/kort/people/kirsten_sand.PNG",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Kirsten Sand", "url": "https://snl.no/Kirsten_Sand", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk kunstnerleksikon – Kirsten Sand", "url": "https://nkl.snl.no/Kirsten_Sand", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Nordlit – Kirsten Sand. Arkitekt for sin tid", "url": "https://septentrio.uit.no/index.php/nordlit/article/view/3697", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "UiT Arkitekturguide – Mellomveien 130", "url": "https://arkitekturguide.uit.no/index.php/items/show/871", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Kirsten_Sand", "https://nkl.snl.no/Kirsten_Sand", "https://septentrio.uit.no/index.php/nordlit/article/view/3697"],
    "verifiedAt": VERIFIED_AT
}

haakon_vii = {
    "id": "haakon_vii",
    "visual": {"designCode": "person_historical_miniature"},
    "name": "Haakon VII",
    "initials": "HV",
    "desc": "Norges konge 1905–1957, konstitusjonelt statsoverhode og samlende symbol for motstanden under andre verdenskrig.",
    "tags": ["politikk", "monarki", "kongehuset", "statsoverhode", "1905", "andre_verdenskrig", "kongens_nei", "slottet", "oslo_radhus"],
    "placeId": "slottet",
    "places": ["slottet", "oslo_radhus", "akershus_festning"],
    "category": "politikk",
    "kindLabel": "Konge / konstitusjonelt statsoverhode",
    "birth_date": "1872-08-03",
    "death_date": "1957-09-21",
    "birth_place": "Charlottenlund slott ved København",
    "active_place": "Norge, Oslo og London",
    "year": 1905,
    "education": [
        "Privatundervisning ved det danske hoffet",
        "Marineoffisersutdanning fra 1886",
        "Sjøkrigsskolen fullført i 1893"
    ],
    "themes": [
        "konstitusjonelt monarki", "unionsoppløsningen", "parlamentarisme", "nasjonal motstand",
        "eksilregjeringen", "gjenreisning", "nasjonal representasjon", "monarkiets modernisering"
    ],
    "works": [
        {"id": "haakon_folkeavstemning", "title": "Folkeavstemningen om monarkiet", "year": 1905, "place": "Norge", "summary": "Prins Carl krevde folkelig tilslutning før han tok imot den norske tronen."},
        {"id": "haakon_valgt", "title": "Valgt til Norges konge", "year": 1905, "place": "Stortinget og Vippetangen", "summary": "Stortinget valgte ham 18. november; kongefamilien ankom Kristiania 25. november."},
        {"id": "haakon_kroning", "title": "Kroningen i Nidarosdomen", "year": 1906, "place": "Trondheim", "summary": "Den siste norske kroningen knyttet det nye kongehuset til eldre norsk kongshistorie."},
        {"id": "haakon_hornsrud", "title": "Utnevnelsen av Hornsrud-regjeringen", "year": 1928, "place": "Slottet", "summary": "Fulgte parlamentariske prinsipper og ba Arbeiderpartiets Christopher Hornsrud danne regjering."},
        {"id": "haakon_kongens_nei", "title": "Kongens nei", "year": 1940, "place": "Elverum og Nybergsund", "summary": "Avviste det tyske kravet om å utnevne Vidkun Quisling og ble et symbol på lovlig motstand."},
        {"id": "haakon_london", "title": "Konge i eksil", "year": "1940–1945", "place": "London", "summary": "Arbeidet med eksilregjeringen og talte til befolkningen gjennom radiosendinger."},
        {"id": "haakon_hjemkomst", "title": "Hjemkomsten 7. juni", "year": 1945, "place": "Oslo", "summary": "Vendte tilbake sammen med kongefamilien og ble mottatt som samlingssymbol etter frigjøringen."},
        {"id": "haakon_radhus", "title": "Åpningen av Oslo rådhus", "year": 1950, "place": "Oslo rådhus", "summary": "Kongen og kongefamilien deltok da rådhuset ble åpnet på byens 900-årsjubileum 15. mai."},
        {"id": "haakon_mausoleum", "title": "Det kongelige mausoleum", "year": 1957, "place": "Akershus slott", "summary": "Ble gravlagt i mausoleet etter sin død på Slottet 21. september 1957."}
    ],
    "popupDesc": "Haakon VII ble født som prins Carl av Danmark på Charlottenlund slott 3. august 1872. Han fullførte dansk sjøkrigsskole i 1893 og gjorde tjeneste som marineoffiser. Etter unionsoppløsningen krevde han at nordmennene skulle få stemme over monarkiet. Stortinget valgte ham til konge 18. november 1905, og kongefamilien gikk i land på Vippetangen en uke senere.\n\nSom konstitusjonell monark la Haakon vekt på at politisk makt skulle ligge hos de folkevalgte. Utnevnelsen av Hornsrud-regjeringen i 1928 ble en viktig prøve på parlamentarismen. Under det tyske angrepet i 1940 avviste han kravet om en Quisling-regjering. Fra London virket kongen sammen med eksilregjeringen og ble et samlende symbol for motstanden.\n\nEtter hjemkomsten 7. juni 1945 reiste Haakon gjennom landet og fulgte gjenreisningen. Han var til stede sammen med kongefamilien ved åpningen av Oslo rådhus 15. mai 1950, en dokumentert hendelseskobling som begrunner stedet i profilen. Slottet er hovedankeret for regjeringstidens arbeid og representasjon, mens Akershus festning er direkte knyttet til gravstedet i Det kongelige mausoleum.",
    "image": "bilder/kort/people/haakon_vii.PNG",
    "cardImage": "bilder/kort/people/haakon_vii.PNG",
    "externalLinks": [
        {"type": "source", "label": "Det norske kongehus – Kong Haakon VIIs biografi", "url": "https://www.kongehuset.no/monarkiet/historie/alt-for-norge/kong-haakon-vii/biografi", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Det norske kongehus – krigsårene 1940–1945", "url": "https://www.kongehuset.no/monarkiet/historie/krigsarene-1940-1945", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Store norske leksikon – Haakon 7.", "url": "https://snl.no/Haakon_7.", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Store norske leksikon – Oslo rådhus", "url": "https://snl.no/Oslo_r%C3%A5dhus", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://www.kongehuset.no/monarkiet/historie/alt-for-norge/kong-haakon-vii/biografi", "https://snl.no/Haakon_7.", "https://snl.no/Oslo_r%C3%A5dhus"],
    "verifiedAt": VERIFIED_AT
}

halvdan_stokke = {
    "id": "halvdan_eyvind_stokke",
    "visual": {"designCode": "person_politician_miniature"},
    "name": "Halvdan Eyvind Stokke",
    "initials": "HES",
    "desc": "Den første ordføreren i det sammenslåtte Oslo og Aker; åpnet rådhuset i 1950 og ledet senere moderniseringen av NSB.",
    "tags": ["politikk", "lokaldemokrati", "ordforer", "oslo_radhus", "oslo_aker_sammenslaing", "samferdsel", "nsb"],
    "placeId": "oslo_radhus",
    "places": ["oslo_radhus"],
    "category": "politikk",
    "kindLabel": "Ordfører / kommunal leder og samferdselsmodernisator",
    "birth_date": "1900-11-20",
    "death_date": "1977-12-15",
    "birth_place": "Fredrikstad",
    "active_place": "Aker, Oslo og Norges Statsbaner",
    "year": 1950,
    "education": [
        "Middelskoleeksamen 1917",
        "Praktisk sjø- og marinetjeneste",
        "Telegrafskolen 1919–1920, med tidlig radioutdanning"
    ],
    "themes": [
        "kommunesammenslåing", "lokaldemokrati", "rådhusets åpning", "markaforvaltning",
        "telekommunikasjon", "jernbanemodernisering", "elektrifisering", "offentlig administrasjon"
    ],
    "works": [
        {"id": "stokke_telegrafverket", "title": "Telegrafverket", "year": "1920–1945", "place": "Norge", "summary": "Arbeidet i teknisk og organisatorisk telekommunikasjonsvirksomhet før den politiske lederkarrieren."},
        {"id": "stokke_aker_ordforer", "title": "Ordfører i Aker", "year": "1945–1947", "place": "Aker", "summary": "Ledet kommunen i overgangen fra krig til gjenreisning og frem mot sammenslåingen med Oslo."},
        {"id": "stokke_stor_oslo", "title": "Første ordfører i det sammenslåtte Oslo", "year": "1948–1950", "place": "Oslo", "summary": "Ledet den nye storkommunen etter at Aker ble innlemmet i Oslo."},
        {"id": "stokke_jubileum", "title": "Oslos 900-årsjubileum", "year": 1950, "place": "Oslo", "summary": "Hadde ordføreransvar under jubileumsåret med store offentlige markeringer."},
        {"id": "stokke_radhus", "title": "Åpningen av Oslo rådhus", "year": 1950, "place": "Oslo rådhus", "summary": "Åpnet rådhuset 15. mai og mottok St. Hallvardkjedet fra opposisjonsleder Rolf Stranger."},
        {"id": "stokke_nordmarka", "title": "Nordmarka-avtalen", "year": 1950, "place": "Nordmarka", "summary": "Bidro til kommunens avtale som sikret viktige friluftsinteresser i Marka."},
        {"id": "stokke_nsb", "title": "Generaldirektør i NSB", "year": "1951–1966", "place": "Norge", "summary": "Ledet modernisering, elektrifisering og overgang fra damplokomotiver til elektrisk og dieseldrevet trafikk."},
        {"id": "stokke_vekk_med_dampen", "title": "«Vekk med dampen»", "year": "1950- og 1960-årene", "place": "Norges jernbanenett", "summary": "Ble slagordet for Stokkes tekniske og organisatoriske modernisering av jernbanen."}
    ],
    "popupDesc": "Halvdan Eyvind Stokke ble født i Fredrikstad 20. november 1900 og døde 15. desember 1977. Etter middelskole, sjøtjeneste og Telegrafskolen arbeidet han i Telegrafverket fra 1920 til 1945. Den tekniske bakgrunnen ble senere kombinert med kommunalpolitikk og ledelse i Arbeiderpartiet.\n\nStokke ble ordfører i Aker etter frigjøringen og deretter den første ordføreren i det sammenslåtte Oslo fra 1948. Han ledet kommunen gjennom integreringen av Oslo og Aker, byens 900-årsjubileum og åpningen av det nye rådhuset. Den 15. mai 1950 mottok han Norges første ordførerkjede fra opposisjonsleder Rolf Stranger og tok rådhuset i bruk som den nye storkommunens politiske sentrum.\n\nI 1951 gikk Stokke over til stillingen som generaldirektør i NSB. Frem til 1966 ledet han en omfattende modernisering av jernbanen med elektrifisering, dieselmateriell og avvikling av dampdriften. Profilen knytter derfor sammen kommunesammenslåing, rådhusets institusjonelle åpning og etterkrigstidens tekniske utbygging.",
    "image": "",
    "cardImage": "",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Halvdan Eyvind Stokke", "url": "https://snl.no/Halvdan_Eyvind_Stokke", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – ordførerkjedet", "url": "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/ordforerkjedet/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – tidligere ordførere", "url": "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/om-ordforeren/tidligere-ordforere/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Store norske leksikon – Oslo rådhus", "url": "https://snl.no/Oslo_r%C3%A5dhus", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Halvdan_Eyvind_Stokke", "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/ordforerkjedet/"],
    "verifiedAt": VERIFIED_AT
}

replace_person(by_path, "albert_nordengen", albert_nordengen)
replace_person(by_path, "kirsten_sand", kirsten_sand)
replace_person(politics_path, "haakon_vii", haakon_vii)
replace_person(expansion_path, "rolf_stranger", rolf_stranger)
replace_or_append(expansion_path, "halvdan_eyvind_stokke", halvdan_stokke)

profiles_test = Path("tests/oslo-radhus-political-people-profiles.test.js")
profiles_test.write_text(r'''const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const TARGETS = [
  { id: "albert_nordengen", file: "data/people/by/oslo/people_by_oslo.json", minWorks: 7, minSources: 3 },
  { id: "rolf_stranger", file: "data/people/politikk/oslo/people_politikk_oslo_place_expansion_batch_03.json", minWorks: 8, minSources: 4 },
  { id: "kirsten_sand", file: "data/people/by/oslo/people_by_oslo.json", minWorks: 8, minSources: 4 },
  { id: "haakon_vii", file: "data/people/politikk/oslo/people_politikk_oslo.json", minWorks: 9, minSources: 4 },
  { id: "halvdan_eyvind_stokke", file: "data/people/politikk/oslo/people_politikk_oslo_place_expansion_batch_03.json", minWorks: 8, minSources: 4 }
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}
function getPerson(target) {
  return readJson(target.file).find(entry => entry.id === target.id);
}

test("political and municipal batch contains five unique canonical profiles", () => {
  const manifest = readJson("data/people/manifest.json");
  const seen = new Map();
  for (const relative of manifest.files) {
    const file = path.join("data", relative);
    const data = readJson(file);
    for (const entry of Array.isArray(data) ? data : [data]) {
      if (!entry || !TARGETS.some(target => target.id === entry.id)) continue;
      assert.equal(seen.has(entry.id), false, `duplicate canonical person: ${entry.id}`);
      seen.set(entry.id, file);
    }
  }
  assert.deepEqual([...seen.keys()].sort(), TARGETS.map(target => target.id).sort());
});

test("each profile has rich biography, education, contributions and inspectable sources", () => {
  for (const target of TARGETS) {
    const person = getPerson(target);
    assert.ok(person, target.id);
    assert.ok(String(person.popupDesc).split(/\n\s*\n/).length >= 3, target.id);
    assert.ok(person.works.length >= target.minWorks, target.id);
    assert.ok(person.education.length >= 3, target.id);
    assert.ok(person.themes.length >= 6, target.id);
    assert.ok(person.externalLinks.length >= target.minSources, target.id);
    assert.ok(person.externalLinks.every(source => /^https:\/\//.test(source.url)), target.id);
    assert.match(person.birth_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(person.death_date, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("Rådhus profiles use direct place evidence", () => {
  for (const id of ["albert_nordengen", "rolf_stranger", "haakon_vii", "halvdan_eyvind_stokke"]) {
    const person = getPerson(TARGETS.find(target => target.id === id));
    assert.ok(person.placeId === "oslo_radhus" || person.places.includes("oslo_radhus"), id);
  }
  const haakon = getPerson(TARGETS.find(target => target.id === "haakon_vii"));
  assert.deepEqual(haakon.places, ["slottet", "oslo_radhus", "akershus_festning"]);
});

test("Kirsten Sand no longer has invented Oslo rådhus or Universitetsplassen links", () => {
  const person = getPerson(TARGETS.find(target => target.id === "kirsten_sand"));
  assert.equal(Object.hasOwn(person, "placeId"), false);
  assert.deepEqual(person.places, []);
  assert.equal(person.placeLinkStatus, "awaiting_direct_canonical_place");
  assert.doesNotMatch(JSON.stringify({ placeId: person.placeId, places: person.places }), /oslo_radhus|universitetsplassen/);
  assert.equal(person.image, "bilder/kort/people/kirsten_sand.PNG");
});

test("Halvdan Stokke is the documented opening mayor, not a duplicate seed", () => {
  const person = getPerson(TARGETS.find(target => target.id === "halvdan_eyvind_stokke"));
  assert.equal(person.placeId, "oslo_radhus");
  assert.match(JSON.stringify(person), /Det første ordførerkjedet|ordførerkjede|St\. Hallvardkjedet/);
  assert.match(JSON.stringify(person), /15\. mai 1950/);
});
''', encoding="utf-8")

popup_test_path = Path("tests/person-popup-v2.test.js")
popup_source = popup_test_path.read_text(encoding="utf-8")
marker = 'test("removes quiz action and empty sections when data is absent", async () => {'
if marker not in popup_source:
    raise SystemExit("Expected popup insertion marker not found")

popup_batch_test = r'''test("renders the Rådhus political batch and the corrected Kirsten Sand profile", async () => {
  const targets = [
    ["data/people/by/oslo/people_by_oslo.json", "albert_nordengen", /Oslo rådhus|Rådhusplassen/],
    ["data/people/politikk/oslo/people_politikk_oslo_place_expansion_batch_03.json", "rolf_stranger", /Oslo rådhus/],
    ["data/people/politikk/oslo/people_politikk_oslo.json", "haakon_vii", /Oslo rådhus/],
    ["data/people/politikk/oslo/people_politikk_oslo_place_expansion_batch_03.json", "halvdan_eyvind_stokke", /Oslo rådhus/],
    ["data/people/by/oslo/people_by_oslo.json", "kirsten_sand", /Gjenreisingen av Nord-Troms/]
  ];
  for (const [relativePath, personId, expected] of targets) {
    const { window, captured } = createHarness({ hasQuiz: true });
    const people = JSON.parse(fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8"));
    const person = people.find(item => item.id === personId);
    assert.ok(person, personId);
    window.showPersonPopup(person);
    await new Promise(resolve => setImmediate(resolve));
    assert.match(captured.html, new RegExp(person.name));
    assert.match(captured.html, /Verk og bidrag/);
    assert.match(captured.html, expected);
    assert.match(captured.html, /Kilder og videre lesning/);
    assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
  }
});

'''
if 'renders the Rådhus political batch and the corrected Kirsten Sand profile' not in popup_source:
    popup_test_path.write_text(popup_source.replace(marker, popup_batch_test + marker, 1), encoding="utf-8")
