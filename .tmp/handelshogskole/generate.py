#!/usr/bin/env python3
from pathlib import Path
from collections import defaultdict
import importlib.util
import json
import re

ROOT = Path.cwd()
BASE = ROOT / "data/fag/naeringsliv"
PLAN_PATH = ROOT / ".tmp/handelshogskole/plans.py"
spec = importlib.util.spec_from_file_location("handelshogskole_plans", PLAN_PATH)
plans = importlib.util.module_from_spec(spec)
spec.loader.exec_module(plans)
TRACKS = plans.TRACKS
PLANS = plans.MODULES


def slug(value):
    value = value.lower().replace("æ", "ae").replace("ø", "o").replace("å", "a")
    value = re.sub(r"[^a-z0-9]+", "_", value).strip("_")
    return value


def title_from_id(value):
    specials = {"roic": "ROIC", "mva": "MVA", "clv": "CLV", "wbs": "WBS", "mape": "MAPE", "spi": "SPI", "cpi": "CPI", "eac": "EAC", "vrio": "VRIO", "cage": "CAGE"}
    words = [specials.get(word, word) for word in value.split("_")]
    text = " ".join(words)
    return text[:1].upper() + text[1:]


def write(name, data):
    (BASE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


module_records = []
theories = []
methods = []
models = []
measure_by_id = {}
dataset_by_id = {}
track_module_ids = defaultdict(list)
track_theory_ids = defaultdict(list)
track_method_ids = defaultdict(list)
track_model_ids = defaultdict(list)
track_measure_ids = defaultdict(list)
track_dataset_ids = defaultdict(list)

for index, plan in enumerate(PLANS, start=1):
    module_id = plan["id"]
    track_id = plan["track"]
    short = module_id.removeprefix("mod_naering_")
    theory_ids = [f"th_{short}_hovedmodell", f"th_{short}_kritisk_perspektiv"]
    method_ids = [f"met_{short}_analyse", f"met_{short}_robusthet"]
    model_ids = [f"modell_{short}_beslutning", f"modell_{short}_scenario"]
    measure_ids = [f"mal_{short}_{slug(name)}" for name in plan["measures"]]
    dataset_ids = [f"data_{slug(name)}" for name in plan["datasets"]]

    track_module_ids[track_id].append(module_id)
    track_theory_ids[track_id].extend(theory_ids)
    track_method_ids[track_id].extend(method_ids)
    track_model_ids[track_id].extend(model_ids)
    track_measure_ids[track_id].extend(measure_ids)
    track_dataset_ids[track_id].extend(dataset_ids)

    theories.extend([
      {
        "theory_id": theory_ids[0],
        "title": f"{plan['title']}: faglig hovedmodell",
        "track_ids": [track_id],
        "tradition_or_origin": f"Kanoniske perspektiver fra {TRACKS[track_id]['title'].lower()} anvendt på {plan['title'].lower()}.",
        "core_claims": [
          f"{plan['title']} må analyseres gjennom {plan['focus']} og ikke som en løs fagetikett.",
          f"En faglig konklusjon krever dokumentasjon for {plan['unit']} og den eksplisitte beregningen: {plan['calc']}."
        ],
        "key_concepts": [x.strip() for x in plan["focus"].replace(" og ", ", ").split(",") if x.strip()][:8],
        "mechanism": f"Modellen forklarer hvordan endringer i {plan['focus']} påvirker beslutninger og resultater i {plan['unit']}. Mekanismen skal operasjonaliseres med modulens mål, datasett og beregningsoppgave før den brukes i quiz eller analyse.",
        "assumptions": ["analyseenheten er presist avgrenset", "begreper og måleenheter er konsistente mellom kildene"],
        "observable_implications": [f"minst ett målbart utfall endres når {plan['focus']} endres", f"alternative forklaringer kan testes mot datagrunnlaget for {plan['unit']}"],
        "best_fit_cases": [plan["title"], plan["unit"]],
        "competing_theories": [theory_ids[1], "institusjonelle og historiske forklaringer"],
        "major_criticisms": ["kan bli mekanisk dersom profesjonelt skjønn ignoreres", "kan overvurdere målbare størrelser på bekostning av rettslige, etiske eller organisatoriske forhold"],
        "limits": [f"gjelder bare når caset faktisk dokumenterer {plan['focus']}"],
        "mapped_module_ids": [module_id]
      },
      {
        "theory_id": theory_ids[1],
        "title": f"{plan['title']}: kritisk styrings- og profesjonsperspektiv",
        "track_ids": [track_id],
        "tradition_or_origin": "Profesjonsetikk, styringskritikk, institusjonell analyse og beslutning under usikkerhet.",
        "core_claims": [
          f"Valg i {plan['title']} fordeler risiko, kontroll, informasjon og kostnader mellom aktører.",
          f"Konflikten mellom {plan['conflict']} kan ikke avgjøres av ett nøkkeltall alene."
        ],
        "key_concepts": ["makt", "ansvar", "usikkerhet", "profesjonelt skjønn", "interessent", "konklusjonsgrense"],
        "mechanism": f"Perspektivet undersøker hvem som får beslutningsmakt og gevinst, hvem som bærer risiko og feil, og hvordan regler, data og styringssystemer former utfallet når {plan['conflict']}.",
        "assumptions": ["berørte aktører og interesser kan identifiseres", "usikkerhet og alternative handlingsvalg kan synliggjøres"],
        "observable_implications": ["samme økonomiske resultat kan gi ulike fordelings- eller etterlevelsesvirkninger", "endrede kontroll- eller informasjonsforhold påvirker beslutningsprosessen"],
        "best_fit_cases": [plan["title"], "beslutninger med profesjonsansvar eller motstridende hensyn"],
        "competing_theories": [theory_ids[0], "ren resultat- eller effektivitetsstyring"],
        "major_criticisms": ["kan bli normativt uten tydelige vurderingskriterier", "kan undervurdere behovet for standardisering og beslutningshastighet"],
        "limits": ["må skille dokumenterte virkninger fra normative vurderinger"],
        "mapped_module_ids": [module_id]
      }
    ])

    methods.extend([
      {
        "method_id": method_ids[0], "title": f"{plan['title']}: analyseprotokoll", "track_ids": [track_id],
        "problemstilling": f"Hvordan kan problemet i {plan['title']} undersøkes med dokumenterte data, fagbegreper og beregninger?",
        "enhet_og_avgrensning": plan["unit"],
        "begrepsdefinisjoner": [x.strip() for x in plan["focus"].replace(" og ", ", ").split(",") if x.strip()][:5],
        "operasjonalisering": {"variabler": measure_ids[:3], "indikatorer": measure_ids},
        "datakilder": dataset_ids,
        "utvalg_eller_sammenligningsgrunnlag": "Velg enheter, perioder eller parter før resultatet undersøkes, og dokumenter hvorfor sammenligningen er relevant.",
        "analysetrinn": ["formuler problem og konklusjonsgrense", "avgrens enhet, periode og aktører", "definer begreper og variabler", "kontroller datakilder og metadata", f"gjennomfør beregningen: {plan['calc']}", "tolk resultatet mot minst én alternativ forklaring"],
        "beregninger_eller_koding": plan["calc"],
        "alternative_forklaringer": ["endret sammensetning eller seleksjon", "målefeil eller ufullstendig dokumentasjon", plan["conflict"]],
        "feilkilder_og_usikkerhet": ["uklar enhet eller periode", "inkonsistente definisjoner", "modell-, rettskilde- eller skjønnsavhengige valg"],
        "gyldighetsomraade": f"Dokumenterte virksomhetscase som faktisk inneholder {plan['focus']}.",
        "konklusjonsgrense": f"Konkluder bare om den avgrensede enheten og det undersøkte alternativet; analysen kan ikke alene avgjøre konflikten mellom {plan['conflict']}.",
        "mapped_module_ids": [module_id]
      },
      {
        "method_id": method_ids[1], "title": f"{plan['title']}: robusthets- og profesjonskontroll", "track_ids": [track_id],
        "problemstilling": f"Hvor robust er anbefalingen i {plan['title']} når antakelser, data, regelverk, scenario og berørte interesser endres?",
        "enhet_og_avgrensning": plan["unit"],
        "begrepsdefinisjoner": ["scenario", "sensitivitet", "alternativ forklaring", "profesjonsansvar", "beslutningskriterium"],
        "operasjonalisering": {"variabler": measure_ids[1:], "indikatorer": measure_ids},
        "datakilder": dataset_ids,
        "utvalg_eller_sammenligningsgrunnlag": "Test minst to plausible scenarioer eller spesifikasjoner mot samme beslutningsproblem.",
        "analysetrinn": ["identifiser kritiske antakelser", "bygg basis- og stresscenario", "varier sentrale parametre", "kontroller rettslige, etiske og organisatoriske begrensninger", "sammenlign beslutningsalternativer", "rapporter robusthet og restusikkerhet"],
        "beregninger_eller_koding": f"Gjenta {plan['calc']} under minst to alternative forutsetninger og vis hvilke valg som driver konklusjonen.",
        "alternative_forklaringer": ["samtidige endringer", "strategisk rapportering eller gaming", "manglende data om berørte grupper"],
        "feilkilder_og_usikkerhet": ["for smalt scenarioområde", "skjult vekting av kriterier", "manglende etterprøving av rettslig eller faglig grunnlag"],
        "gyldighetsomraade": "Beslutninger med dokumenterbare alternativer, risikoer og kriterier.",
        "konklusjonsgrense": "Robusthetskontrollen kan vise hvor anbefalingen er sårbar, men kan ikke erstatte ansvarlig skjønn eller bindende rettslig vurdering.",
        "mapped_module_ids": [module_id]
      }
    ])

    models.extend([
      {
        "model_id": model_ids[0], "title": f"{plan['title']}: beslutningsmodell", "track_ids": [track_id],
        "purpose": f"Kobler {plan['focus']} til et dokumentert beslutningsproblem.",
        "formula_or_logic": plan["calc"], "variables": measure_ids + ["beslutningsalternativ"],
        "unit": "oppgis eksplisitt per variabel, periode og analyseenhet",
        "assumptions": ["variablene er konsistent definert", "alternativene er reelt gjennomførbare"],
        "interpretation": f"Brukes til å vurdere handlingsalternativer i {plan['title']} uten å skjule {plan['conflict']}.",
        "misuse_guards": ["ikke tolk modellresultat som automatisk kausal effekt", "ikke skjul vekter, klassifikasjon eller sensitivitet"],
        "minimum_evidence": dataset_ids,
        "progression": ["intro: identifiser variabler og enheter", "mellom: gjennomfør beregning og sammenligning", "avansert: test scenario, robusthet og profesjonsansvar"],
        "mapped_module_ids": [module_id]
      },
      {
        "model_id": model_ids[1], "title": f"{plan['title']}: scenario- og kontrollmodell", "track_ids": [track_id],
        "purpose": "Synliggjør usikkerhet, kontrollpunkter og hvordan alternative antakelser endrer anbefalingen.",
        "formula_or_logic": f"Kjør basis-, oppside- og stresscenario for {plan['calc']} og registrer beslutningsskifte.",
        "variables": measure_ids + ["scenario", "kontrollpunkt"],
        "unit": "scenario, prosent, valuta, tid, forholdstall eller indeks",
        "assumptions": ["scenarioene er plausible og dokumenterte", "kontrollpunktene kan observeres eller etterprøves"],
        "interpretation": f"Viser om beslutningen er robust når {plan['conflict']} får ulike vekter eller utfall.",
        "misuse_guards": ["ikke gjøre ønsket utfall til basisscenario", "ikke aggregere bort fordelings-, regel- eller kvalitetsvirkninger"],
        "minimum_evidence": dataset_ids,
        "progression": ["intro: bygg tre scenarioer", "mellom: beregn beslutningsskifte", "avansert: kombiner scenario med kontroll- og etikkvurdering"],
        "mapped_module_ids": [module_id]
      }
    ])

    for measure_id, measure_title in zip(measure_ids, plan["measures"]):
        measure_by_id[measure_id] = {
          "measure_id": measure_id, "title": measure_title, "track_ids": [track_id],
          "definition": f"Mål for {measure_title.lower()} i den avgrensede analysen av {plan['title']}.",
          "calculation": f"Beregn {measure_title.lower()} fra dokumenterte variabler; oppgi formel, teller, nevner eller scenario, periode, enhet og datakilde.",
          "unit": "prosent, valuta, tid, forholdstall eller indeks etter eksplisitt definisjon",
          "interpretation": f"Tolkes sammen med modulens øvrige mål og konflikten mellom {plan['conflict']}.",
          "limits": ["kan ikke tolkes uten definert enhet og periode", "kan påvirkes av klassifikasjon, utvalg, regelverk eller scenario"],
          "preferred_sources": dataset_ids,
          "mapped_module_ids": [module_id]
        }

    for dataset_id, dataset_title in zip(dataset_ids, plan["datasets"]):
        row = dataset_by_id.setdefault(dataset_id, {
          "dataset_id": dataset_id, "title": dataset_title,
          "owner_or_source": "virksomhet, offentlig register, myndighet, forsknings- eller markedsdatakilde etter dokumentert opphav",
          "use": f"Faktagrunnlag for profesjonsanalyse av {plan['title']}.",
          "minimum_metadata": ["periode", "enhet eller populasjon", "variabeldefinisjon", "kilde og uttrekksdato", "versjons- eller revisjonsstatus"],
          "access_and_ethics": ["dokumenter tilgangsgrunnlag", "minimer person- og forretningssensitiv informasjon", "oppgi aggregering, begrensninger og formål"],
          "fact_source": True, "mapped_module_ids": []
        })
        if module_id not in row["mapped_module_ids"]:
            row["mapped_module_ids"].append(module_id)

    problem = f"Hvordan kan {plan['focus']} analyseres og brukes i en ansvarlig beslutning for {plan['unit']}?"
    module_records.append({
      "module_id": module_id, "track_id": track_id, "sequence": ((index - 1) % 5) + 1,
      "title": plan["title"], "status": "canonical_professional_module",
      "purpose": f"Modulen dekker {plan['focus']} som et selvstendig profesjonsfag og kobler begreper, dokumentasjon, beregning og beslutningsansvar.",
      "professional_problem": problem, "empirical_unit": plan["unit"], "calculation_exercise": plan["calc"],
      "professional_conflict": plan["conflict"],
      "core_concepts": [x.strip() for x in plan["focus"].replace(" og ", ", ").split(",") if x.strip()],
      "university_prerequisite_emne_ids": plan["prereq"],
      "theory_ids": theory_ids, "method_protocol_ids": method_ids, "model_ids": model_ids,
      "measure_ids": measure_ids, "dataset_ids": dataset_ids,
      "level_ladder": {
        "introductory": {
          "activity": f"Avgrens {plan['unit']}. Forklar de sentrale begrepene i {plan['focus']} med ett dokumentert case, og gjennomfør den grunnleggende oppgaven: {plan['calc']}.",
          "assessment_product": f"{plan['title']}: kontrollert caseark med datakilder, enheter, grunnberegning og kort faglig tolkning."
        },
        "intermediate": {
          "activity": f"Sammenlign to perioder, enheter eller alternativer i {plan['title']}. Bruk begge metodeprotokollene, minst tre datakilder og test én alternativ forklaring.",
          "assessment_product": f"{plan['title']}: komparativ analyse med metodevedlegg, beregninger, datakvalitetskontroll og tydelig konklusjonsgrense."
        },
        "advanced": {
          "activity": f"Test modulens faglige hovedmodell mot det kritiske profesjonsperspektivet. Bruk begge modellene, gjennomfør sensitivitets- eller robusthetsanalyse og vurder konflikten: {plan['conflict']}.",
          "assessment_product": f"{plan['title']}: profesjonsmemorandum med beslutningsalternativer, modell, usikkerhet, rettslige eller etiske begrensninger og anbefaling."
        }
      },
      "evidence_requirements": [f"dokumenter analyseenheten: {plan['unit']}", f"bruk minst datakildene {', '.join(plan['datasets'])}", f"vis beregningen eller kodingen: {plan['calc']}", f"skill funn fra vurderingen av konflikten: {plan['conflict']}"],
      "misconception_guards": [f"ikke behandle {plan['measures'][0]} som en fullstendig forklaring", "ikke bruke en modell uten antakelser, enheter og gyldighetsområde", f"ikke skjule at {plan['conflict']} krever flere kriterier enn ett økonomisk resultat"],
      "quiz_targets": {"bridge": [f"velg riktig dokumentasjon eller beregning for {plan['title']}", f"tolk {plan['measures'][0]} med én konkret begrensning"], "final": ["skille hovedmodell fra kritisk profesjonsperspektiv", f"bruke beslutningsmodellen til å vurdere {plan['conflict']}"]},
      "quiz_phase_guard": "kan bare brukes etter de første 2x7 normale, konkrete spørsmålene og når caset har dokumentert faglig grunnlag"
    })

for track_id, track in TRACKS.items():
    track["module_ids"] = track_module_ids[track_id]
    track["theory_requirements"] = sorted(set(track_theory_ids[track_id]))
    track["method_requirements"] = sorted(set(track_method_ids[track_id]))
    track["model_requirements"] = sorted(set(track_model_ids[track_id]))
    track["measure_requirements"] = sorted(set(track_measure_ids[track_id]))
    track["dataset_requirements"] = sorted(set(track_dataset_ids[track_id]))
    track["progression"] = ["introductory", "intermediate", "advanced"]

assessment_profiles = []
rubric = [
  {"dimension": "faglig presisjon", "weight": 20},
  {"dimension": "datagrunnlag og kildekritikk", "weight": 20},
  {"dimension": "beregning, metode eller rettsanvendelse", "weight": 20},
  {"dimension": "alternativer og usikkerhet", "weight": 15},
  {"dimension": "beslutningsrelevans og profesjonsetikk", "weight": 15},
  {"dimension": "kommunikasjon og etterprøvbarhet", "weight": 10}
]
for track_id, track in TRACKS.items():
    for level, verbs in [("introductory", ["identifisere", "forklare", "beregne", "dokumentere"]), ("intermediate", ["anvende", "sammenligne", "analysere", "kontrollere"]), ("advanced", ["modellere", "evaluere", "syntetisere", "anbefale"])]:
        assessment_profiles.append({
          "profile_id": f"{track_id}_{level}", "track_id": track_id, "level": level,
          "required_verbs": verbs,
          "task_contract": f"Løs et dokumentert virksomhetsproblem i {track['title']} på {level}-nivå med eksplisitte kilder, beregninger og konklusjonsgrense.",
          "rubric": rubric,
          "automatic_failures": ["manglende eller oppdiktede kilder", "uklar analyseenhet eller periode", "beregning uten formel, variabler eller enhet", "juridisk konklusjon uten rettskilder når relevant", "kausal påstand uten identifikasjonsgrunnlag", "anbefaling uten risiko, etikk eller begrensning"]
        })

framework = {
  "version": "1.0.0", "status": "canonical_business_school_extension", "type": "business_school_framework",
  "subject_id": "naeringsliv", "display_name": "Økonomi og næringsliv – handelshøyskolelaget", "updated_at": "2026-07-26",
  "relationship_to_university_core": {"foundation_file": "universitetsramme_okonomi_og_naeringsliv_v1.json", "academic_tracks": 6, "academic_core_emners": 36, "professional_tracks": 5, "professional_modules": 25, "total_tracks": 11, "total_learning_units": 61, "principle": "De 36 kjerneemnene forklarer økonomiske fenomener; de 25 profesjonsmodulene gir separate verktøy- og beslutningsfag."},
  "coverage_goal": "Dekke den brede obligatoriske kjernen i en norsk bachelor i økonomi og administrasjon eller handelshøyskoleutdanning uten å hevde studiepoeng, autorisasjon eller akkreditert grad.",
  "required_tracks": list(TRACKS.keys()),
  "professional_learning_outcomes": {
    "knowledge": ["forklare regnskaps-, markeds-, strategi-, analyse-, retts-, operations-, internasjonaliserings- og prosjektfaglige sammenhenger", "forstå hvordan modeller, rettsregler, datasystemer og styringssystemer påvirker beslutninger", "skille analyse, profesjonelt skjønn, rettslig plikt og ledelsesbeslutning"],
    "skills": ["føre, avstemme, analysere og modellere økonomiske data", "gjennomføre markeds-, strategi-, statistikk-, juridiske-, operations- og prosjektanalyser", "bruke programmering, scenario, optimering og sensitivitetsanalyse", "utforme beslutningsgrunnlag med alternativer, risiko, etikk og konklusjonsgrense"],
    "general_competence": ["kommunisere etterprøvbare analyser til ulike interessenter", "forstå profesjonsansvar, personvern og compliance", "integrere økonomisk, juridisk, teknisk og organisatorisk kunnskap i konkrete case"]
  },
  "progression_contract": {"introductory": "konkret case, grunnbegrep, datakilde og enkel beregning eller klassifisering", "intermediate": "komparativ analyse, flere kilder, metode og kvalitetskontroll", "advanced": "modell- eller rettsanvendelse, robusthet, profesjonsetikk og anbefaling"},
  "quiz_integration": {"normal_opening_questions_preserved": 14, "professional_layer_position": ["bridge", "final"], "requirements": ["konkret virksomhetscase", "dokumentert kilde eller datasett", "metode, modell eller rettskilde", "plausible svaralternativer"], "forbidden": ["profesjonsjargong i de første fjorten spørsmålene", "formel uten virksomhetstall", "juridisk etikett uten rettslig faktum", "strategimodell uten dokumentert marked"]},
  "non_degree_guard": {"is_accredited_degree": False, "awards_credits": False, "claims_professional_authorization": False, "statement": "Dette er en faglig og pedagogisk modell for History Go, ikke et akkreditert studieprogram."},
  "canonical_files": {"tracks": "handelshogskolespor_okonomi_og_naeringsliv_v1.json", "modules": "handelshogskolemoduler_okonomi_og_naeringsliv_v1.json", "theories": "handelshogskoleteori_okonomi_og_naeringsliv_v1.json", "methods": "handelshogskolemetoder_okonomi_og_naeringsliv_v1.json", "models": "handelshogskolemodeller_okonomi_og_naeringsliv_v1.json", "measures": "handelshogskolemal_okonomi_og_naeringsliv_v1.json", "datasets": "handelshogskolekilder_okonomi_og_naeringsliv_v1.json", "assessment": "handelshogskolevurdering_okonomi_og_naeringsliv_v1.json"}
}

write("handelshogskoleramme_okonomi_og_naeringsliv_v1.json", framework)
write("handelshogskolespor_okonomi_og_naeringsliv_v1.json", {"version": "1.0.0", "status": "canonical_business_school_tracks", "type": "business_school_tracks", "subject_id": "naeringsliv", "track_count": 5, "tracks": TRACKS})
write("handelshogskolemoduler_okonomi_og_naeringsliv_v1.json", {"version": "1.0.0", "status": "canonical_business_school_modules", "type": "business_school_modules", "subject_id": "naeringsliv", "module_count": 25, "modules": module_records})
write("handelshogskoleteori_okonomi_og_naeringsliv_v1.json", {"version": "1.0.0", "status": "canonical_business_school_theory_registry", "type": "business_school_theory_registry", "subject_id": "naeringsliv", "theory_count": len(theories), "cards": theories})
write("handelshogskolemetoder_okonomi_og_naeringsliv_v1.json", {"version": "1.0.0", "status": "canonical_business_school_method_registry", "type": "business_school_method_registry", "subject_id": "naeringsliv", "method_count": len(methods), "protocols": methods})
write("handelshogskolemodeller_okonomi_og_naeringsliv_v1.json", {"version": "1.0.0", "status": "canonical_business_school_model_registry", "type": "business_school_model_registry", "subject_id": "naeringsliv", "model_count": len(models), "models": models})
write("handelshogskolemal_okonomi_og_naeringsliv_v1.json", {"version": "1.0.0", "status": "canonical_business_school_measure_registry", "type": "business_school_measure_registry", "subject_id": "naeringsliv", "measure_count": len(measure_by_id), "measures": list(measure_by_id.values())})
write("handelshogskolekilder_okonomi_og_naeringsliv_v1.json", {"version": "1.0.0", "status": "canonical_business_school_dataset_registry", "type": "business_school_dataset_registry", "subject_id": "naeringsliv", "dataset_count": len(dataset_by_id), "datasets": list(dataset_by_id.values())})
write("handelshogskolevurdering_okonomi_og_naeringsliv_v1.json", {"version": "1.0.0", "status": "canonical_business_school_assessment", "type": "business_school_assessment_matrix", "subject_id": "naeringsliv", "profile_count": len(assessment_profiles), "profiles": assessment_profiles})

framework_path = BASE / "universitetsramme_okonomi_og_naeringsliv_v1.json"
university = json.loads(framework_path.read_text(encoding="utf-8"))
university["version"] = "2.0.0"
university["updated_at"] = "2026-07-26"
university["academic_scope"].update({"professional_track_count": 5, "professional_module_count": 25, "total_track_count": 11, "total_learning_unit_count": 61})
university["professional_business_core"] = [TRACKS[track]["title"] for track in TRACKS]
university["canonical_files"].update({"professional_framework": "handelshogskoleramme_okonomi_og_naeringsliv_v1.json", "professional_tracks": "handelshogskolespor_okonomi_og_naeringsliv_v1.json", "professional_modules": "handelshogskolemoduler_okonomi_og_naeringsliv_v1.json"})
university["implementation"]["phase"] = "university_and_business_school_v2"
for item in ["fem profesjonsrettede handelshøyskolespor definert", "25 selvstendige profesjonsmoduler etablert", "regnskap, markedsføring, analytics, forretningsjus og operations gjort til egne fagområder"]:
    if item not in university["implementation"]["completed"]:
        university["implementation"]["completed"].append(item)
framework_path.write_text(json.dumps(university, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

quality_path = BASE / "universitetskvalitet_okonomi_og_naeringsliv_v2.json"
quality = json.loads(quality_path.read_text(encoding="utf-8"))
quality["version"] = "4.0.0"
quality["updated_at"] = "2026-07-26"
quality["purpose"] = "Individuelt universitetslag for 36 kjerneemner, supplert med et kanonisk handelshøyskolelag med 25 profesjonsmoduler."
quality["professional_extension"] = {"professional_tracks": 5, "professional_modules": 25, "professional_theories": len(theories), "professional_methods": len(methods), "professional_models": len(models), "professional_measures": len(measure_by_id), "professional_datasets": len(dataset_by_id), "professional_assessment_profiles": len(assessment_profiles)}
quality["coverage"].update({"professional_tracks": 5, "professional_modules": 25, "total_tracks": 11, "total_learning_units": 61})
quality_path.write_text(json.dumps(quality, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

manifest_path = ROOT / "data/fag/fag_manifest.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["naeringsliv"]["universityFramework"] = "naeringsliv/universitetsramme_okonomi_og_naeringsliv_v1.json"
manifest["naeringsliv"]["businessSchoolExtension"] = {"framework": "naeringsliv/handelshogskoleramme_okonomi_og_naeringsliv_v1.json", "tracks": "naeringsliv/handelshogskolespor_okonomi_og_naeringsliv_v1.json", "modules": "naeringsliv/handelshogskolemoduler_okonomi_og_naeringsliv_v1.json", "theories": "naeringsliv/handelshogskoleteori_okonomi_og_naeringsliv_v1.json", "methods": "naeringsliv/handelshogskolemetoder_okonomi_og_naeringsliv_v1.json", "models": "naeringsliv/handelshogskolemodeller_okonomi_og_naeringsliv_v1.json", "measures": "naeringsliv/handelshogskolemal_okonomi_og_naeringsliv_v1.json", "datasets": "naeringsliv/handelshogskolekilder_okonomi_og_naeringsliv_v1.json", "assessment": "naeringsliv/handelshogskolevurdering_okonomi_og_naeringsliv_v1.json", "status": "canonical_professional_extension"}
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

quiz_path = BASE / "supersetQUIZMAL_naeringsliv.json"
quiz = json.loads(quiz_path.read_text(encoding="utf-8"))
quiz["version"] = "4.0"
quiz["governance"]["business_school_framework"] = "data/fag/naeringsliv/handelshogskoleramme_okonomi_og_naeringsliv_v1.json"
quiz["input_roles"]["businessSchoolFramework"] = "profesjonsrettede fagspor og moduler for regnskap, marked og strategi, analytics, jus og operations/prosjekt"
rule = "Handelshøyskolelaget brukes bare i bro- og sluttfasen, etter de første to settene med vanlig konkret quiz, og bare når stedet eller virksomheten har dokumenterte data, rettslige fakta, markedsforhold eller prosesser som bærer analysen."
if rule not in quiz["category_rules"]:
    quiz["category_rules"].append(rule)
quiz_path.write_text(json.dumps(quiz, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

audit_path = ROOT / "scripts/audit-category-governance.mjs"
audit = audit_path.read_text(encoding="utf-8")
needle = '  {\n    name: "Økonomi og næringsliv individual emne revision",\n    module: "../tools/validate-okonomi-naeringsliv-emnerevisjon.mjs"\n  }'
insert = needle + ',\n  {\n    name: "Økonomi og næringsliv business-school coverage",\n    module: "../tools/validate-okonomi-naeringsliv-handelshogskole.mjs"\n  }'
if "validate-okonomi-naeringsliv-handelshogskole.mjs" not in audit:
    if needle not in audit:
        raise SystemExit("Category audit insertion anchor missing")
    audit = audit.replace(needle, insert, 1)
audit_path.write_text(audit, encoding="utf-8")

print(f"Generated 5 tracks, {len(module_records)} modules, {len(theories)} theories, {len(methods)} methods, {len(models)} models, {len(measure_by_id)} measures, {len(dataset_by_id)} datasets and {len(assessment_profiles)} assessment profiles")
