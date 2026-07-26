from __future__ import annotations

import json
from pathlib import Path

VERIFIED_AT = "2026-07-26"
ROOT = Path("data")
MANIFEST = ROOT / "people" / "manifest.json"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def manifest_paths() -> list[Path]:
    manifest = read_json(MANIFEST)
    return [ROOT / relative for relative in manifest["files"]]


def find_person(person_id: str | None = None, name: str | None = None):
    matches = []
    for path in manifest_paths():
        data = read_json(path)
        entries = data if isinstance(data, list) else [data]
        for index, entry in enumerate(entries):
            if not isinstance(entry, dict):
                continue
            if (person_id and entry.get("id") == person_id) or (name and entry.get("name") == name):
                matches.append((path, data, index, entry))
    if len(matches) != 1:
        raise SystemExit(f"Expected one canonical match for {person_id or name}, found {len(matches)}")
    return matches[0]


def replace_person(profile: dict, *, person_id: str | None = None, name: str | None = None) -> str:
    path, data, index, existing = find_person(person_id=person_id, name=name)
    profile = dict(profile)
    profile.setdefault("id", existing["id"])
    profile.setdefault("visual", existing.get("visual", {"designCode": "person_politician_miniature"}))
    profile.setdefault("image", existing.get("image", ""))
    profile.setdefault("cardImage", existing.get("cardImage", profile.get("image", "")))
    profile.setdefault("verifiedAt", VERIFIED_AT)
    data[index] = profile
    write_json(path, data)
    return profile["id"]


albert = {
    "id": "albert_nordengen",
    "name": "Albert Nordengen",
    "initials": "AN",
    "desc": "Oslos lengstsittende ordfører, kjent som «Albert», som gjorde rådhuset og byen til en åpen offentlig scene fra 1976 til 1990.",
    "tags": ["by", "politikk", "ordforer", "lokaldemokrati", "bypatriot", "oslo_radhus", "radhusplassen", "kulturpolitikk", "byutvikling"],
    "placeId": "radhusplassen",
    "places": ["radhusplassen", "oslo_radhus"],
    "category": "by",
    "kindLabel": "Ordfører / byrepresentasjon og lokaldemokrati",
    "birth_date": "1923-05-02",
    "death_date": "2004-12-18",
    "birth_place": "Våler i Østfold",
    "active_place": "Oslo rådhus og Rådhusplassen",
    "year": 1976,
    "period": "ordforer_i_oslo_1976_1990",
    "education": ["Treiders Handelsskole", "Examen artium som privatist ved Grimelands skole", "Bankakademiet og bankpraksis i København"],
    "themes": ["ordførerrollen som byens ansikt", "lokaldemokrati og representasjon", "kommunal kulturpolitikk", "tunnel- og miljøprosjekter", "Oslo-identitet og bypatriotisme", "overgangen til parlamentarisk bystyre"],
    "works": [
        {"id": "albert_ordforerperioden", "title": "Ordfører i Oslo", "year": "1976–1990", "place": "Oslo rådhus", "summary": "Fjorten år som hovedstadens fremste folkevalgte representant gjorde ham til Oslos lengstsittende ordfører."},
        {"id": "albert_bystyret", "title": "Oslo bystyre og formannskap", "year": "1952–1991", "place": "Oslo rådhus", "summary": "Nesten fire tiår i bystyret og fra 1956 i formannskapet ga ham en uvanlig lang kommunal erfaring."},
        {"id": "albert_tunnelprosjekter", "title": "Byens tunnelprosjekter", "year": "1970- og 1980-årene", "place": "Oslo", "summary": "Som ordfører var han med på å realisere store kommunale tunnelprosjekter som endret trafikk og byrom."},
        {"id": "albert_veas", "title": "Oslofjordens Avløpsselskap", "year": "1970- og 1980-årene", "place": "Oslofjorden", "summary": "Det store renseprosjektet ble en sentral del av moderniseringen av hovedstadens miljøinfrastruktur."},
        {"id": "albert_holmenkollen", "title": "Moderniseringen av Holmenkollanlegget", "year": "1970- og 1980-årene", "place": "Holmenkollen", "summary": "Han støttet oppgraderingen av et av Oslos viktigste idretts- og representasjonssteder."},
        {"id": "albert_oslo_spektrum", "title": "Oslo Spektrum", "year": 1990, "place": "Oslo sentrum", "summary": "Arenaen åpnet ved slutten av ordførerperioden og ble folkelig omtalt som «Albert Hall»."},
        {"id": "albert_kulturverv", "title": "Kulturinstitusjonene", "year": "1974–1990", "place": "Oslo", "summary": "Styreverv ved Nationaltheatret, Oslo Nye Teater, Oslo Konserthus og Oslo Kinematografer knyttet ordførergjerningen til byens kulturliv."},
        {"id": "albert_oslo_boker", "title": "Bøker om Oslo", "year": "1991–2003", "place": "Oslo", "summary": "Fra mitt tårn, Oslo, min egen by og Ikke bare et smil videreførte bypatriotrollen etter politikken."}
    ],
    "popupDesc": "Albert Emil Nordengen ble født i Våler i Østfold 2. mai 1923 og døde i Oslo 18. desember 2004. Som fjortenåring flyttet han til Tøyen, gikk på handelsskole, tok examen artium som privatist og utdannet seg videre i bankfaget. Han ble valgt inn i Oslo bystyre i 1952 og satt der frem til 1991.\n\nFra 1976 til 1990 var Nordengen ordfører i Oslo. Han ble kjent som «Albert» og som en uvanlig tilgjengelig representant for byen. Kontoret i rådhuset, talene, mottakelsene og møtene på Rådhusplassen gjorde ordførerrollen synlig i hverdagen. Samtidig var han involvert i store kommunale prosjekter innen tunneler, avløpsrensing, Holmenkollen og Oslo Spektrum.\n\nI 1986 gikk Oslo over til kommunal parlamentarisme, og mye av den utøvende makten ble flyttet fra ordføreren til byrådslederen. Nordengen fortsatte likevel som byens ansikt utad. Etter politikken ledet han NOAS, skrev bøker om Oslo og mottok både St. Hallvard-medaljen og hedersprisen Bypatrioten.",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Albert Nordengen", "url": "https://snl.no/Albert_Nordengen", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – tidligere ordførere", "url": "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/om-ordforeren/tidligere-ordforere/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – ordførerens rolle", "url": "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo Spektrum – arenaens historie", "url": "https://oslospektrum.no/en/about-us/", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Albert_Nordengen", "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/om-ordforeren/tidligere-ordforere/"]
}

rolf = {
    "id": "rolf_stranger",
    "name": "Rolf Stranger",
    "initials": "RS",
    "desc": "Forretningsmann og Oslo-politiker som overrakte det første ordførerkjedet ved rådhusåpningen og senere ble ordfører i to perioder.",
    "tags": ["politikk", "lokaldemokrati", "ordforer", "radhusets_apning", "oslo_radhus", "radhusplassen", "norges_varemesse", "kulturpolitikk", "oslo_hoyre"],
    "placeId": "oslo_radhus",
    "places": ["oslo_radhus", "radhusplassen", "norges_varemesse"],
    "category": "politikk",
    "kindLabel": "Ordfører / rådhusåpning og Oslos offentlige liv",
    "birth_date": "1891-01-15",
    "death_date": "1990-06-18",
    "birth_place": "Kristiania",
    "active_place": "Oslo rådhus, Rådhusplassen og Norges Varemesse",
    "year": 1950,
    "period": "radhusets_apning_og_ordforerperiodene",
    "education": ["Examen artium ved St. Hanshaugen skole, 1909", "Cand.jur., 1914", "Disponent i familiebedriften Hanssen & Bergh A/S, 1917–1962"],
    "themes": ["kommunal representasjon", "ordførerembetet", "Oslo Høyres organisasjon", "handel og varemesser", "teater- og kulturpolitikk", "byhistorie og erindring"],
    "works": [
        {"id": "rolf_ordforerkjedet", "title": "Det første ordførerkjedet", "year": 1950, "place": "Oslo rådhus", "summary": "Som opposisjonsleder overrakte han St. Hallvardkjedet til ordfører Halvdan Eyvind Stokke under rådhusåpningen 15. mai."},
        {"id": "rolf_ordforer", "title": "Ordfører i Oslo", "year": "1956–1959 og 1962–1963", "place": "Oslo rådhus", "summary": "To ordførerperioder befestet posisjonen som en av etterkrigstidens mest synlige Oslo-politikere."},
        {"id": "rolf_bystyret", "title": "Oslo bystyre", "year": "1926–1967", "place": "Oslo", "summary": "Mer enn førti år i bystyret gjorde ham til en kontinuerlig aktør gjennom store deler av byens 1900-tallshistorie."},
        {"id": "rolf_stortinget", "title": "Stortingsrepresentant for Oslo", "year": "1945–1953", "place": "Stortinget", "summary": "I finanskomiteen bidro han til utformingen av moderne Høyre-politikk i etterkrigstiden."},
        {"id": "rolf_oslo_hoyre", "title": "Formann i Oslo Høyre", "year": "1939–1970", "place": "Oslo", "summary": "Over tre tiår som partileder ga ham en dominerende organisatorisk rolle i hovedstadspolitikken."},
        {"id": "rolf_oslo_nye", "title": "Oslo Nye Teater", "year": "1959–1984", "place": "Oslo Nye Teater", "summary": "Lang tid som styreformann knyttet kommunalpolitikken til teater- og kulturinstitusjonene."},
        {"id": "rolf_varemessen", "title": "Norges Varemesse", "year": "1900-tallet", "place": "Norges Varemesse", "summary": "Handels- og messearbeidet bandt sammen næringsliv, representasjon og byens utstillingskultur."},
        {"id": "rolf_kulturfond", "title": "Rolf Strangers kulturfond", "year": 1982, "place": "Oslo", "summary": "Fondet støtter forskning på Oslos historie og kulturhistorie."}
    ],
    "popupDesc": "Rolf Stranger ble født i Kristiania 15. januar 1891 og døde i Oslo 18. juni 1990. Han tok juridisk embetseksamen i 1914 og arbeidet som disponent i familiebedriften Hanssen & Bergh. Fra 1926 til 1967 satt han i Oslo bystyre, og fra 1939 til 1970 ledet han Oslo Høyre.\n\nVed åpningen av Oslo rådhus 15. mai 1950 var Stranger opposisjonsleder. På vegne av bystyrets partier overrakte han Norges første ordførerkjede, St. Hallvardkjedet, til ordfører Halvdan Eyvind Stokke. Senere var han selv ordfører i periodene 1956–1959 og 1962–1963. Rådhuset og den delen av Rådhusplassen som senere fikk navnet Rolf Strangers plass, er derfor direkte knyttet til hans politiske liv.\n\nStranger var også stortingsrepresentant, næringslivsleder og en sterk kulturpolitisk aktør. Han ledet Oslo Nye Teater i 25 år, arbeidet med Norges Varemesse og opprettet Rolf Strangers kulturfond. Erindringsboken Mitt hjertes Oslo oppsummerte et liv der politikk, handel, teater og byhistorie hang tett sammen.",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Rolf Stranger", "url": "https://snl.no/Rolf_Stranger", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – ordførerkjedet", "url": "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/ordforerkjedet/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – tidligere ordførere", "url": "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/om-ordforeren/tidligere-ordforere/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norges Varemesse – stedets History GO-kildegrunnlag", "url": "https://snl.no/Norges_Varemesse", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Rolf_Stranger", "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/ordforerkjedet/"]
}

stokke = {
    "name": "Halvdan Eyvind Stokke",
    "initials": "HES",
    "desc": "Den første ordføreren i det sammenslåtte Oslo, som ledet byjubileet og åpningen av rådhuset i 1950 før han moderniserte NSB.",
    "tags": ["politikk", "ordforer", "lokaldemokrati", "oslo_aker_sammenslaing", "radhusets_apning", "oslo_radhus", "jernbane", "nsb", "elektrifisering"],
    "placeId": "oslo_radhus",
    "places": ["oslo_radhus"],
    "category": "politikk",
    "kindLabel": "Ordfører / rådhusåpning og jernbanemodernisering",
    "birth_date": "1900-11-20",
    "death_date": "1977-12-15",
    "birth_place": "Fredrikstad",
    "active_place": "Oslo rådhus og Norges Statsbaner",
    "year": 1950,
    "period": "ordforer_i_nye_oslo_1948_1950",
    "education": ["Middelskoleeksamen, 1917", "Telegrafskolen med radioteknikk, 1919–1920", "Arbeid i Telegrafverket og senere Samferdselsdepartementet"],
    "themes": ["sammenslåingen av Oslo og Aker", "rådhuset som demokratisk sentrum", "kommunal representasjon", "Nordmarka som friluftsområde", "jernbanens elektrifisering", "rasjonalisering av offentlig transport"],
    "works": [
        {"id": "stokke_aker_ordforer", "title": "Ordfører i Aker", "year": "1945–1947", "place": "Aker", "summary": "Han ble Akers første arbeiderpartiordfører og ledet kommunen frem mot sammenslåingen med Oslo."},
        {"id": "stokke_nye_oslo", "title": "Første ordfører i den nye storkommunen", "year": "1948–1950", "place": "Oslo", "summary": "Da Oslo og Aker ble slått sammen 1. januar 1948, ble Stokke ordfører for den nye kommunen."},
        {"id": "stokke_radhusapningen", "title": "Åpningen av Oslo rådhus", "year": 1950, "place": "Oslo rådhus", "summary": "Som sittende ordfører ledet han byen ved åpningen på St. Hallvards dag 15. mai."},
        {"id": "stokke_ordforerkjedet", "title": "Mottok St. Hallvardkjedet", "year": 1950, "place": "Oslo rådhus", "summary": "Rolf Stranger overrakte Norges første ordførerkjede til Stokke under åpningsseremonien."},
        {"id": "stokke_byjubileet", "title": "Oslos 900-årsjubileum", "year": 1950, "place": "Oslo", "summary": "Byjubileet og rådhusåpningen var de største representative oppgavene i hans ordførertid."},
        {"id": "stokke_nordmarka", "title": "Nordmarka-avtalen", "year": 1950, "place": "Nordmarka", "summary": "Avtalen med grunneierne sikret viktige friluftsområder for hovedstadens befolkning."},
        {"id": "stokke_nsb", "title": "Generaldirektør i NSB", "year": "1951–1966", "place": "Norges jernbanenett", "summary": "Femten år som generaldirektør satte fart i modernisering, elektrifisering og omstilling."},
        {"id": "stokke_vekk_med_dampen", "title": "«Vekk med dampen»", "year": "1950- og 1960-årene", "place": "Norges jernbanenett", "summary": "Programmet erstattet dampdrift med elektriske tog og diesellokomotiver og endret norsk jernbane."}
    ],
    "popupDesc": "Halvdan Eyvind Stokke ble født i Fredrikstad 20. november 1900 og døde 15. desember 1977. Etter Telegrafskolen arbeidet han i Telegrafverket, ble fagforeningsleder og gikk inn i Arbeiderpartiet. Han var ordfører i Aker fra 1945 og ble den første ordføreren i den sammenslåtte storkommunen Oslo i 1948.\n\nStokke var ordfører da Oslo rådhus åpnet på St. Hallvards dag 15. mai 1950. Under seremonien mottok han St. Hallvardkjedet fra opposisjonsleder Rolf Stranger. Samme år ledet han også Oslos 900-årsjubileum og arbeidet med avtalen som sikret Nordmarka som friluftsområde for hovedstaden.\n\nEtter ordførertiden ble Stokke generaldirektør i NSB fra 1951 til 1966. Han drev gjennom programmet «Vekk med dampen», elektrifiserte sentrale baner, innførte diesellokomotiver og reduserte bemanningen. Profilen binder derfor rådhusets kommunale modernisering sammen med etterkrigstidens store transportomstilling.",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Halvdan Eyvind Stokke", "url": "https://snl.no/Halvdan_Eyvind_Stokke", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – ordførerkjedet", "url": "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/ordforerkjedet/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – tidligere ordførere", "url": "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/om-ordforeren/tidligere-ordforere/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Store norske leksikon – Oslo byråd og bystyre", "url": "https://snl.no/Oslo_byr%C3%A5d_og_bystyre", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Halvdan_Eyvind_Stokke", "https://www.oslo.kommune.no/politikk/bystyret/ordforeren/ordforerkjedet/"]
}

haakon = {
    "id": "haakon_vii",
    "name": "Haakon VII",
    "initials": "HVII",
    "desc": "Norges konge fra 1905 til 1957, som forankret det nye monarkiet i folkeavstemning og ble et symbol på motstand under okkupasjonen.",
    "tags": ["politikk", "kongehuset", "monarki", "statsoverhode", "1905", "andre_verdenskrig", "kongens_nei", "slottet", "akershus_festning", "oslo_radhus"],
    "placeId": "slottet",
    "places": ["slottet", "oslo_radhus", "eidsvolls_plass", "akershus_festning"],
    "category": "politikk",
    "kindLabel": "Konge / konstitusjonelt monarki og motstand",
    "birth_date": "1872-08-03",
    "death_date": "1957-09-21",
    "birth_place": "Charlottenlund slott, Danmark",
    "active_place": "Det kongelige slott, Norge og London",
    "year": 1905,
    "period": "norges_konge_1905_1957",
    "education": ["Privatundervisning ved det danske hoffet", "Sjøkrigsskolen i Danmark, fullført 1893", "Tjeneste som offiser i den danske marinen"],
    "themes": ["folkevalgt monarki i 1905", "parlamentarisme og konstitusjon", "nasjonal identitet", "motstand mot okkupasjon", "regjeringen i eksil", "kongelig representasjon og samhold"],
    "works": [
        {"id": "haakon_1905", "title": "Valgt til norsk konge", "year": 1905, "place": "Norge", "summary": "Prins Carl aksepterte kronen etter stortingsvedtak og folkeavstemning og tok navnet Haakon VII."},
        {"id": "haakon_alt_for_norge", "title": "«Alt for Norge»", "year": 1905, "place": "Det kongelige slott", "summary": "Valgspråket uttrykte ønsket om et norsk og konstitusjonelt forankret monarki."},
        {"id": "haakon_parlamentarisme", "title": "Konstitusjonell konge", "year": "1905–1957", "place": "Slottet og Stortinget", "summary": "Han tilpasset monarkiet til parlamentarismen og bygget en rolle som samlende statsoverhode."},
        {"id": "haakon_kongens_nei", "title": "Kongens nei", "year": 1940, "place": "Elverum og Nybergsund", "summary": "Avvisningen av det tyske kravet om å utnevne Vidkun Quisling fikk stor symbolkraft i motstandskampen."},
        {"id": "haakon_london", "title": "Konge i eksil", "year": "1940–1945", "place": "London", "summary": "Fra Storbritannia støttet han regjeringen og holdt radiosendinger til det okkuperte Norge."},
        {"id": "haakon_hjemkomsten", "title": "Hjemkomsten", "year": 1945, "place": "Oslo", "summary": "Kongen vendte tilbake 7. juni 1945 og ble mottatt som et symbol på frigjøring og kontinuitet."},
        {"id": "haakon_etterkrigstiden", "title": "Etterkrigstidens statsoverhode", "year": "1945–1957", "place": "Det kongelige slott og Oslo", "summary": "Han representerte staten gjennom gjenreisningen og den første etterkrigstiden, mens Oslo rådhus ble tatt i bruk som hovedstadens demokratiske representasjonsbygg."},
        {"id": "haakon_mausoleet", "title": "Det kongelige mausoleum", "year": 1957, "place": "Akershus slott", "summary": "Etter dødsfallet på Slottet ble han gravlagt i det kongelige mausoleet på Akershus."}
    ],
    "popupDesc": "Haakon VII ble født som prins Carl av Danmark på Charlottenlund slott 3. august 1872. Han ble utdannet marineoffiser og giftet seg med prinsesse Maud av Storbritannia. Etter unionsoppløsningen i 1905 ble han valgt til norsk konge og tok det historiske kongenavnet Haakon og valgspråket «Alt for Norge».\n\nSom konge utviklet han en konstitusjonell rolle tilpasset parlamentarismen. Under det tyske angrepet i 1940 avviste han kravet om å utnevne Vidkun Quisling. Kongens nei, flukten fra hovedstaden og årene med regjeringen i London gjorde ham til et samlende symbol for motstand og norsk statsrettslig kontinuitet.\n\nHaakon VII vendte tilbake til Oslo 7. juni 1945. I etterkrigstiden representerte han staten under gjenreisningen og mens nye demokratiske institusjonsbygg, blant dem Oslo rådhus, ble tatt i bruk. Han døde på Det kongelige slott 21. september 1957 og ble gravlagt i Det kongelige mausoleum på Akershus slott.",
    "externalLinks": [
        {"type": "source", "label": "Kongehuset – Kong Haakon VIIs biografi", "url": "https://www.kongehuset.no/monarkiet/historie/alt-for-norge/kong-haakon-vii/biografi", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Store norske leksikon – Haakon VII", "url": "https://snl.no/Haakon_7.", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Oslo kommune – Oslo rådhus", "url": "https://www.oslo.kommune.no/radhuset/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Kongehuset – Slottets historie og arkitektur", "url": "https://www.kongehuset.no/kongelige-eiendommer/det-kongelige-slott/slottets-historie-og-arkitektur", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://www.kongehuset.no/monarkiet/historie/alt-for-norge/kong-haakon-vii/biografi", "https://snl.no/Haakon_7."]
}

kirsten = {
    "id": "kirsten_sand",
    "name": "Kirsten Sand",
    "initials": "KS",
    "desc": "Norges første kvinne med full arkitektutdannelse, boligpioner og en drivende kraft i gjenreisningen av Nord-Troms etter 1945.",
    "tags": ["by", "arkitektur", "kvinner_i_arkitektur", "boligarkitektur", "gjenreisning", "nord_troms", "husbanken", "hverdagsliv", "musikkpedagogikk"],
    "placeId": "universitetsplassen",
    "places": ["universitetsplassen"],
    "category": "by",
    "kindLabel": "Arkitekt / boligstandard og gjenreisning",
    "birth_date": "1895-11-27",
    "death_date": "1996-05-12",
    "birth_place": "Kristiania",
    "active_place": "Oslo, Skjervøy og Tromsø",
    "year": 1919,
    "period": "arkitekt_og_gjenreisningspioner_1919_1966",
    "education": ["Examen artium i Oslo, 1914", "Arkitektavdelingen ved Norges tekniske høgskole, 1919", "Oppmålingsarbeid og studiereiser i Sverige, Danmark, Göteborg og Berlin"],
    "materials": ["tre", "mur", "standardiserte bygningsdeler", "typetegninger", "kjellerløse boligløsninger", "funksjonelle kjøkken- og arbeidsrom"],
    "themes": ["kvinner i arkitektutdanningen", "boligstandard og folkehelse", "husmorens arbeid og hverdagsfunksjon", "gjenreisning etter krig", "regional tilpasning i Nord-Norge", "arkitektur og musikkpedagogikk"],
    "works": [
        {"id": "kirsten_nth", "title": "Første kvinne med full arkitektutdannelse fra NTH", "year": 1919, "place": "Trondheim", "summary": "Eksamenen brøt en tydelig kjønnsbarriere i norsk arkitektutdanning."},
        {"id": "kirsten_oslo_praksis", "title": "Egen arkitektpraksis i Oslo", "year": "1928–1938", "place": "Oslo og Aker", "summary": "Hun tegnet småhus og hytter og arbeidet med boliger tilpasset vanlige husholdninger."},
        {"id": "kirsten_oslo_helserad", "title": "Boligarbeid i Oslo Helseråd", "year": "fra 1936/1938", "place": "Oslo", "summary": "Arbeidet koblet arkitektur til helse, boligstandard og daglig husarbeid."},
        {"id": "kirsten_vann_husmodrene", "title": "«Vann til husmødrene»", "year": 1939, "place": "Østkantutstillingen, Oslo", "summary": "Utstillingsarbeidet gjorde vannforsyning og husarbeid til et offentlig boligpolitisk spørsmål."},
        {"id": "kirsten_boligundersokelse", "title": "Oslo Byes Vels boligundersøkelse", "year": 1942, "place": "Oslo", "summary": "Hun deltok fra starten i kartleggingen som dokumenterte boligforhold og reformbehov."},
        {"id": "kirsten_gjenreisning", "title": "Gjenreisningen av Nord-Troms", "year": "1945–1952", "place": "Skjervøy og Nord-Troms", "summary": "Som distriktsarkitekt ledet hun kontorer og utformet rundt 30 typetegninger for brente lokalsamfunn."},
        {"id": "kirsten_mellomveien", "title": "Egen bolig i Mellomveien 130", "year": 1952, "place": "Tromsø", "summary": "Det kjellerløse eksperimenthuset viser ideene hennes om rasjonell planløsning og lettet husarbeid."},
        {"id": "kirsten_musikkskolen", "title": "Orkesterskole og musikkundervisning", "year": "fra 1952", "place": "Tromsø", "summary": "Hun startet en orkesterskole for barn som ble en forløper til den kommunale musikkskolen."}
    ],
    "popupDesc": "Kirsten Eleonore Helena Sand ble født i Kristiania 27. november 1895 og døde i Tromsø 12. mai 1996. I 1919 ble hun den første kvinnen med full arkitektutdannelse fra Norges tekniske høgskole. Etter arbeid hos arkitektkontorer, Ingeniørvåpenet og Akers reguleringsvesen drev hun egen praksis i Oslo fra 1928 til 1938.\n\nSand arbeidet særlig med boliger, folkehelse og hverdagsliv. I Oslo Helseråd, Østkantutstillingen og Oslo Byes Vels boligundersøkelse undersøkte hun vannforsyning, boligstandard og hvordan planløsningen påvirket husmorens arbeid. Etter 1945 ble hun en sentral leder i gjenreisningen av Nord-Troms og Finnmark og utformet typetegninger som også påvirket nasjonal boligpolitikk.\n\nI Tromsø tegnet hun sitt eget eksperimenthus i Mellomveien 130, senere fredet som et viktig 1950-tallshus. Hun var dessuten musiker og musikkpedagog, startet orkesterskole for barn og bidro til utviklingen av Tromsøs musikkskole. Den tidligere Rådhus-koblingen er fjernet: profilen handler nå om hennes faktiske arkitektur-, bolig- og gjenreisningsarbeid.",
    "externalLinks": [
        {"type": "source", "label": "Store norske leksikon – Kirsten Sand", "url": "https://snl.no/Kirsten_Sand", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Norsk kunstnerleksikon – Kirsten Sand", "url": "https://nkl.snl.no/Kirsten_Sand", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Riksantikvaren – Kirsten Sands hus", "url": "https://www.riksantikvaren.no/kulturhistorie/fredning-i-100-aar/", "verifiedAt": VERIFIED_AT},
        {"type": "source", "label": "Tromsø kulturskole – Kirsten Sand-kurset", "url": "https://www.kulturskolentromso.no/ledige-plasser/ledige-plasser-musikk/", "verifiedAt": VERIFIED_AT}
    ],
    "source_urls": ["https://snl.no/Kirsten_Sand", "https://nkl.snl.no/Kirsten_Sand", "https://www.riksantikvaren.no/kulturhistorie/fredning-i-100-aar/"]
}

replace_person(albert, person_id="albert_nordengen")
replace_person(rolf, person_id="rolf_stranger")
stokke_id = replace_person(stokke, name="Halvdan Eyvind Stokke")
replace_person(haakon, person_id="haakon_vii")
replace_person(kirsten, person_id="kirsten_sand")

profiles_test = Path("tests/oslo-radhus-political-people-profiles.test.js")
profiles_test.write_text(r'''const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data/people/manifest.json"), "utf8"));
const targets = ["albert_nordengen", "rolf_stranger", "haakon_vii", "kirsten_sand"];

function allPeople() {
  const result = [];
  for (const relative of manifest.files) {
    const file = path.join(ROOT, "data", relative);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const entry of Array.isArray(data) ? data : [data]) result.push({ entry, file });
  }
  return result;
}

function byId(id) {
  return allPeople().filter(item => item.entry?.id === id);
}
function byName(name) {
  return allPeople().filter(item => item.entry?.name === name);
}

test("political and municipal batch remains canonical and unique", () => {
  for (const id of targets) assert.equal(byId(id).length, 1, id);
  assert.equal(byName("Halvdan Eyvind Stokke").length, 1);
});

test("four documented Rådhus profiles expose rich popup data", () => {
  const people = [
    byId("albert_nordengen")[0].entry,
    byId("rolf_stranger")[0].entry,
    byName("Halvdan Eyvind Stokke")[0].entry,
    byId("haakon_vii")[0].entry
  ];
  for (const person of people) {
    assert.ok(person.places.includes("oslo_radhus"), person.name);
    assert.ok(String(person.popupDesc).split(/\n\s*\n/).length >= 3, person.name);
    assert.ok(person.works.length >= 7, person.name);
    assert.ok(person.education.length >= 3, person.name);
    assert.ok(person.themes.length >= 6, person.name);
    assert.ok(person.externalLinks.length >= 4, person.name);
    assert.ok(person.externalLinks.every(source => /^https:\/\//.test(source.url)), person.name);
  }
});

test("Kirsten Sand is corrected to documented work rather than a false Rådhus relation", () => {
  const person = byId("kirsten_sand")[0].entry;
  assert.equal(person.places.includes("oslo_radhus"), false);
  assert.equal(person.placeId, "universitetsplassen");
  assert.equal(person.birth_date, "1895-11-27");
  assert.ok(person.works.length >= 8);
  assert.match(JSON.stringify(person), /Gjenreisningen av Nord-Troms/);
  assert.match(JSON.stringify(person), /Mellomveien 130/);
  assert.ok(person.materials.length >= 6);
  assert.ok(person.externalLinks.length >= 4);
});

test("existing person-image identities are preserved", () => {
  assert.equal(byId("kirsten_sand")[0].entry.image, "bilder/kort/people/kirsten_sand.PNG");
  assert.equal(byId("haakon_vii")[0].entry.image, "bilder/kort/people/haakon_vii.PNG");
});
''', encoding="utf-8")

popup_test_path = Path("tests/person-popup-v2.test.js")
popup_source = popup_test_path.read_text(encoding="utf-8")
marker = 'test("removes quiz action and empty sections when data is absent", async () => {'
if marker not in popup_source:
    raise SystemExit("Expected popup insertion marker not found")
popup_batch_test = r'''test("renders the Rådhus political and municipal profiles with contributions and sources", async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data/people/manifest.json"), "utf8"));
  const all = [];
  for (const relative of manifest.files) {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", relative), "utf8"));
    all.push(...(Array.isArray(data) ? data : [data]));
  }
  const people = [
    all.find(item => item.id === "albert_nordengen"),
    all.find(item => item.id === "rolf_stranger"),
    all.find(item => item.name === "Halvdan Eyvind Stokke"),
    all.find(item => item.id === "haakon_vii"),
    all.find(item => item.id === "kirsten_sand")
  ];
  for (const person of people) {
    assert.ok(person, "missing profile");
    const { window, captured } = createHarness({ hasQuiz: true });
    window.showPersonPopup(person);
    await new Promise(resolve => setImmediate(resolve));
    assert.match(captured.html, new RegExp(person.name));
    assert.match(captured.html, /Verk og bidrag/);
    assert.match(captured.html, /Kilder og videre lesning/);
    assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
  }
});

'''
if 'renders the Rådhus political and municipal profiles' not in popup_source:
    popup_test_path.write_text(popup_source.replace(marker, popup_batch_test + marker, 1), encoding="utf-8")

print(json.dumps({"halvdan_stokke_id": stokke_id}, ensure_ascii=False))
