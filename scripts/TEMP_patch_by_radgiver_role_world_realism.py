#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROLE_SCOPE = "by_radgiver_plan"
INSTITUTION = "oslo_kommune_planavdeling_001"
UNIT = "lillebekk_planteam"
CASE_ID = "by_radgiver_lillebekk_plan_case_001"
APPROVAL_ID = "by_radgiver_lillebekk_approval_001"
ESCALATION_ID = "by_radgiver_lillebekk_escalation_001"
KNOWLEDGE_MAIL_ID = "by_radgiver_realism_knowledge_radhus_001"


def write_json(rel: str, data: dict) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def work_context(deadline_ref: str) -> dict:
    return {
        "object_ids": [CASE_ID],
        "institution_id": INSTITUTION,
        "deadline_ref": deadline_ref,
    }


def authority_context() -> dict:
    return {
        "institution_id": INSTITUTION,
        "unit_id": UNIT,
        "role_scope": ROLE_SCOPE,
        "reporting_line": ["elin_plansjef"],
        "peer_functions": ["nora_planjuss", "signe_byokolog", "maja_utvalgssekretaer"],
        "external_counterparts": ["ivar_utbygger", "hanne_beboer"],
        "goals_pressures": [
            "politisk_utvalgsfrist",
            "lovlighet_og_etterprovbarhet",
            "boligmal_og_gjennomforbarhet",
            "medvirkning_og_lokalkunnskap",
        ],
        "approval_points": [
            {
                "approval_id": "lillebekk_utvalgsgodkjenning",
                "action_id": "send_lillebekk_til_politisk_behandling",
                "approver_actor_id": "elin_plansjef",
                "approval_object_id": APPROVAL_ID,
            }
        ],
        "authority_rules": [
            {
                "action_id": "send_lillebekk_til_politisk_behandling",
                "authority": "approval_required",
                "approval_id": "lillebekk_utvalgsgodkjenning",
                "escalation_id": "lillebekk_frist_eskalering",
                "requires_resources": ["planjuridisk_kapasitet"],
            },
            {
                "action_id": "skriv_faglig_anbefaling",
                "authority": "influence_only",
                "requires_resources": ["planjuridisk_kapasitet"],
            },
            {
                "action_id": "love_utbygger_planutfall",
                "authority": "forbidden",
                "requires_resources": [],
            },
        ],
        "resources": [
            {
                "resource_id": "planjuridisk_kapasitet",
                "baseline_state": "limited",
            }
        ],
        "escalation_paths": [
            {
                "escalation_id": "lillebekk_frist_eskalering",
                "action_id": "send_lillebekk_til_politisk_behandling",
                "target_actor_id": "elin_plansjef",
                "escalation_object_id": ESCALATION_ID,
            }
        ],
    }


def main_case_create() -> dict:
    return {
        "op": "create",
        "event_id": "by_radgiver_lillebekk_case_opened",
        "work_object": {
            "work_object_id": CASE_ID,
            "kind": "reguleringssak",
            "role_scope": ROLE_SCOPE,
            "institution_id": INSTITUTION,
            "title": "Lillebekk detaljregulering — skolevei, grøntdrag og fortetting",
            "status": "open",
            "phase": "stedsanalyse_og_kunnskapsgrunnlag",
            "people_refs": [
                "elin_plansjef",
                "ivar_utbygger",
                "hanne_beboer",
                "signe_byokolog",
                "nora_planjuss",
                "maja_utvalgssekretaer",
            ],
            "place_refs": ["oslo_radhus", "skolevei_lillebekk", "grontdrag_lillebekk"],
            "knowledge_refs": [
                "reguleringsplan",
                "medvirkning",
                "rekkefolgekrav",
                "politisk_lesbarhet",
                "juridisk_presisjon",
            ],
            "open_questions": [
                "Hvordan skal faktisk skolevei dokumenteres i planens kunnskapsgrunnlag?",
                "Hvilken funksjon har grøntdraget for overvann og lokal bruk?",
                "Hva er administrasjonens faglige anbefaling, og hva må overlates til politisk valg?",
            ],
            "deadline": "utvalg_etter_rework",
            "confidentiality": "offentlig_saksforberedelse_med_interne_arbeidsnotater",
            "flags": ["skolevei_ikke_dokumentert", "politisk_grense_ikke_eksplisitt"],
            "shared": True,
        },
    }


def catalog(mail_type: str, family_id: str, purpose: str, learning_focus: list[str], mails: list[dict]) -> dict:
    return {
        "schema": "civication_mail_family_catalog_v1",
        "version": 1,
        "category": "by",
        "role_scope": ROLE_SCOPE,
        "mail_type": mail_type,
        "families": [
            {
                "id": family_id,
                "purpose": purpose,
                "learning_focus": learning_focus,
                "mails": mails,
            }
        ],
    }


def build_job() -> dict:
    mail = {
        "id": "by_radgiver_realism_case_open_001",
        "mail_type": "job",
        "mail_family": "role_world_realism_lillebekk_case",
        "role_scope": ROLE_SCOPE,
        "phase": "advanced",
        "day_phase": "morning",
        "priority": 112,
        "cooldown": 8,
        "repeatable": False,
        "stage": "stable",
        "from": "Elin, plansjef",
        "person_id": "elin_plansjef",
        "place_id": "radhuset_planavdeling",
        "thread_key": "by_radgiver_lillebekk_realism_001",
        "subject": "Lillebekk blir din sak: skoleveien finnes i hverdagen, men ikke i beslutningsgrunnlaget",
        "summary": "Elin gir deg ansvar for å gjøre Lillebekk behandlingsklar. Det formelle kartet ser ryddig ut, men befaring og medvirkning viser en faktisk skolevei og et grøntdrag med overvannsfunksjon som ikke er godt nok dokumentert.",
        "purpose": "Åpne én vedvarende plansak som må overleve gjennom analyse, godkjenning, History Go-læring, rework og politisk oversendelse.",
        "stakes": "Hvis saken behandles som en serie enkeltmailer kan ansvar og usikkerhet forsvinne. Hvis den holdes som én sak må hvert senere valg stå i et spor som andre kan etterprøve.",
        "situation": [
            "Utbygger trenger forutsigbarhet før prosjekteringen går videre.",
            "Hanne har dokumentert faktisk skolevei, mens Signe peker på at grøntdraget også fungerer som flomvei.",
            "Elin ber deg eie det faglige grunnlaget, men minner om at du ikke eier det politiske vedtaket.",
        ],
        "task_domain": "vedvarende_reguleringssak",
        "task_kind": "job",
        "competency": "stedsanalyse_og_saksansvar",
        "pressure": "utvalgsfrist_vs_ufullstendig_kunnskapsgrunnlag",
        "choice_axis": "dokumenter_faktisk_bruk_vs_glatt_over_avviket",
        "consequence_axis": "sporbar_sak_vs_sen_klagerisiko",
        "narrative_arc": "lillebekk_fra_kunnskapsgrunnlag_til_politisk_behandling",
        "interaction_mode": "decision",
        "work_context": work_context("utvalg_etter_rework"),
        "effects": {"work_object_ops": [main_case_create()]},
        "choices": [
            {
                "id": "A",
                "label": "Registrer skolevei og grøntdrag som åpne faglige premisser før du anbefaler løsning",
                "reply": "Jeg gjør faktisk bruk, overvannsfunksjon og dokumentasjonsmangler eksplisitte i saken før vi låser anbefalingen.",
                "effect": 1,
                "tags": ["persistent_case", "local_knowledge", "traceability"],
                "feedback": "Saken blir mer krevende, men det blir synlig hva som faktisk må avklares.",
                "effects": {
                    "stats": {"quality": 3, "trust": 2, "risk": -2, "energy": -1},
                    "work_object_ops": [
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_grounding_started",
                            "work_object_id": CASE_ID,
                            "to_status": "in_progress",
                            "to_phase": "lokalkunnskap_og_teknisk_grunnlag",
                            "note": "Faktisk skolevei og grøntdragets funksjon er løftet inn som eksplisitte premisser i samme plansak.",
                        },
                        {
                            "op": "add_flag",
                            "event_id": "by_radgiver_lillebekk_local_knowledge_visible",
                            "work_object_id": CASE_ID,
                            "flag": "lokalkunnskap_som_evidens",
                        },
                    ],
                },
            },
            {
                "id": "B",
                "label": "Hold saken på kartgrunnlaget og noter at lokale forhold kan avklares i høringen",
                "reply": "Jeg holder første anbefaling på det formelle kartgrunnlaget og lar medvirkningsrunden ta resten.",
                "effect": -1,
                "tags": ["formal_map_only", "deferred_uncertainty"],
                "feedback": "Framdriften ser bedre ut, men du skyver et kjent kunnskapsgap inn i en senere og dyrere fase.",
                "effects": {
                    "stats": {"quality": -2, "trust": -1, "risk": 3, "energy": 1},
                    "work_object_ops": [
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_grounding_deferred",
                            "work_object_id": CASE_ID,
                            "to_status": "in_progress",
                            "to_phase": "formelt_grunnlag_med_utsatt_lokalkunnskap",
                            "note": "Kjent lokal kunnskap er skjøvet til senere høring i stedet for å bli integrert i første faglige grunnlag.",
                        },
                        {
                            "op": "add_flag",
                            "event_id": "by_radgiver_lillebekk_rework_risk",
                            "work_object_id": CASE_ID,
                            "flag": "sen_rework_risiko",
                        },
                    ],
                },
            },
        ],
    }
    return catalog(
        "job",
        "role_world_realism_lillebekk_case",
        "Åpne Lillebekk som én vedvarende plansak med eksplisitt kunnskapsgrunnlag, ansvar og senere beslutningsspor.",
        ["persistent_work_case", "lokalkunnskap", "stedsanalyse", "sporbarhet"],
        [mail],
    )


def approval_create_op() -> dict:
    return {
        "op": "create",
        "event_id": "by_radgiver_lillebekk_approval_requested",
        "work_object": {
            "work_object_id": APPROVAL_ID,
            "kind": "approval",
            "role_scope": ROLE_SCOPE,
            "institution_id": INSTITUTION,
            "title": "Plansjefens godkjenning av Lillebekk før politisk oversendelse",
            "status": "pending",
            "phase": "ledergjennomgang",
            "people_refs": ["elin_plansjef", "nora_planjuss"],
            "place_refs": ["oslo_radhus"],
            "knowledge_refs": ["politisk_lesbarhet", "juridisk_presisjon"],
            "open_questions": ["Er lovkrav, faglig skjønn og politisk valg skilt tydelig nok?"],
            "flags": ["venter_pa_leder"],
            "shared": True,
        },
    }


def escalation_create_op() -> dict:
    return {
        "op": "create",
        "event_id": "by_radgiver_lillebekk_deadline_escalated",
        "work_object": {
            "work_object_id": ESCALATION_ID,
            "kind": "escalation",
            "role_scope": ROLE_SCOPE,
            "institution_id": INSTITUTION,
            "title": "Frist- og kapasitetskonflikt i Lillebekk",
            "status": "open",
            "phase": "plansjef_prioritering",
            "people_refs": ["elin_plansjef", "nora_planjuss"],
            "place_refs": [],
            "knowledge_refs": ["kapasitetsstyring", "juridisk_kvalitetssikring"],
            "open_questions": ["Skal utvalgsfristen flyttes, eller må annen sak vike for juridisk kontroll?"],
            "flags": ["utvalgsfrist_i_fare"],
            "shared": True,
        },
    }


def build_event() -> dict:
    authority = authority_context()
    approval_mail = {
        "id": "by_radgiver_realism_approval_request_001",
        "mail_type": "event",
        "mail_family": "role_world_realism_authority",
        "role_scope": ROLE_SCOPE,
        "phase": "advanced",
        "day_phase": "afternoon",
        "priority": 111,
        "cooldown": 8,
        "repeatable": False,
        "stage": "stable",
        "from": "Maja, utvalgssekretær",
        "person_id": "maja_utvalgssekretaer",
        "place_id": "politisk_utvalg_moterom",
        "thread_key": "by_radgiver_lillebekk_realism_001",
        "subject": "Utvalgsfristen står: hvem kan faktisk sende Lillebekk videre?",
        "summary": "Maja trenger en behandlingsklar sak, men ditt faglige mandat er å anbefale og dokumentere. Plansjefen må eie den formelle administrative godkjenningen før saken sendes til politisk behandling.",
        "purpose": "Gjør forskjellen mellom faglig anbefaling, ledergodkjenning, eskalering og politisk vedtak spillbar.",
        "stakes": "Et uformelt ja kan bli lest som et løfte. En skjult kapasitetskonflikt kan gi dårlig juss. En reell godkjenningskjede koster tid, men gjør ansvaret etterprøvbart.",
        "situation": [
            "Nora har bare begrenset kapasitet til siste juridiske kontroll før fristen.",
            "Ivar vil vite om høyden 'i praksis er avklart'.",
            "Maja trenger et tydelig skille mellom hva administrasjonen anbefaler og hva utvalget skal velge.",
        ],
        "task_domain": "institusjonell_myndighet_og_godkjenning",
        "task_kind": "event",
        "competency": "mandat_eskalering_og_saksflyt",
        "pressure": "utvalgsfrist_vs_juridisk_kapasitet",
        "choice_axis": "godkjenningsspor_vs_uformelt_signal_vs_eskalering",
        "consequence_axis": "etterprovbar_myndighet_vs_skjult_forventning",
        "narrative_arc": "lillebekk_fra_kunnskapsgrunnlag_til_politisk_behandling",
        "interaction_mode": "decision",
        "work_context": work_context("utvalg_etter_rework"),
        "authority_context": authority,
        "choices": [
            {
                "id": "A",
                "label": "Send saksgrunnlaget til Elin for eksplisitt ledergodkjenning",
                "reply": "Jeg sender faglig anbefaling, åpne forbehold og juridiske kontrollpunkter til plansjefen for formell godkjenning før oversendelse.",
                "effect": 1,
                "authority_action": {"action_id": "send_lillebekk_til_politisk_behandling", "intent": "request_approval"},
                "tags": ["approval", "authority_boundary", "traceability"],
                "feedback": "Du gjør ledelsesansvaret eksplisitt og lar godkjenningen få et vedvarende spor.",
                "effects": {
                    "stats": {"quality": 2, "trust": 2, "risk": -2, "energy": -1},
                    "work_object_ops": [
                        approval_create_op(),
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_waiting_for_approval",
                            "work_object_id": CASE_ID,
                            "to_status": "awaiting_approval",
                            "to_phase": "leder_og_planjuss_gjennomgang",
                            "note": "Saksgrunnlaget er sendt til plansjef og planjurist; formell oversendelse venter på godkjenning.",
                        },
                        {
                            "op": "add_flag",
                            "event_id": "by_radgiver_lillebekk_document_handoff",
                            "work_object_id": CASE_ID,
                            "flag": "dokument_handover_til_leder_og_planjuss",
                        },
                    ],
                },
            },
            {
                "id": "B",
                "label": "Skriv om anbefalingen først: skill lovkrav, faglig skjønn og politisk valg før godkjenning",
                "reply": "Jeg gjør en målrettet rework før ledergjennomgangen, slik at utvalget kan se hvilke deler som er bundet, hvilke som er faglige vurderinger, og hvilke som er reelle politiske valg.",
                "effect": 1,
                "authority_action": {"action_id": "skriv_faglig_anbefaling", "intent": "recommend"},
                "tags": ["rework", "professional_recommendation", "political_readability"],
                "feedback": "Du bruker en ekstra arbeidsrunde, men gjør mandatgrensen lesbar før dokumentet flyttes videre.",
                "effects": {
                    "stats": {"quality": 3, "trust": 1, "risk": -2, "energy": -2},
                    "work_object_ops": [
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_targeted_rework",
                            "work_object_id": CASE_ID,
                            "to_status": "in_progress",
                            "to_phase": "rework_lov_fag_politikk",
                            "note": "Saksframlegget er sendt tilbake til målrettet revisjon for å skille lovkrav, faglig skjønn og politisk valg.",
                        },
                        {
                            "op": "add_flag",
                            "event_id": "by_radgiver_lillebekk_rework_visible",
                            "work_object_id": CASE_ID,
                            "flag": "rework_lov_fag_politikk",
                        },
                    ],
                },
            },
            {
                "id": "C",
                "label": "Eskaler frist–kapasitetskonflikten til Elin i stedet for å kutte juridisk kontroll",
                "reply": "Jeg eskalerer at utvalgsfristen og tilgjengelig planjuridisk kapasitet ikke går opp, slik at leder må prioritere mellom frist, omfordeling og kvalitet.",
                "effect": 1,
                "authority_action": {"action_id": "send_lillebekk_til_politisk_behandling", "intent": "escalate"},
                "tags": ["escalation", "capacity", "managerial_choice"],
                "feedback": "Du gjør kapasitetsproblemet til en lederbeslutning i stedet for en skjult kvalitetsreduksjon.",
                "effects": {
                    "stats": {"quality": 2, "trust": 2, "risk": -1, "energy": -1},
                    "work_object_ops": [
                        escalation_create_op(),
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_capacity_escalated",
                            "work_object_id": CASE_ID,
                            "to_status": "blocked",
                            "to_phase": "venter_pa_prioritering_av_kapasitet",
                            "note": "Utvalgsfrist og juridisk kapasitet er eskalert til plansjef for eksplisitt prioritering.",
                        },
                    ],
                },
            },
        ],
    }

    send_mail = {
        "id": "by_radgiver_realism_formal_send_001",
        "mail_type": "event",
        "mail_family": "role_world_realism_authority",
        "role_scope": ROLE_SCOPE,
        "phase": "mastery",
        "day_phase": "day_end",
        "priority": 108,
        "cooldown": 10,
        "repeatable": False,
        "stage": "stable",
        "from": "Maja, utvalgssekretær",
        "person_id": "maja_utvalgssekretaer",
        "place_id": "politisk_utvalg_moterom",
        "thread_key": "by_radgiver_lillebekk_realism_001",
        "subject": "Lillebekk er klar til oversendelse — hvis riktig myndighet faktisk har godkjent",
        "summary": "Beslutningsgrunnlaget er ferdig. Nå er forskjellen mellom å anbefale og å sende formelt avgjørende: oversendelse kan bare skje når ledergodkjenningen står som gitt.",
        "purpose": "Bevise at formell handling er blokkert av myndighetskontrakten før persistent godkjenning er gitt, men åpnes etter godkjenning.",
        "stakes": "Å sende før godkjenning gjør et faglig arbeidsprodukt til en uautorisert institusjonell handling. Å vente uten grunn kan på sin side koste fristen.",
        "situation": [
            "Maja har satt opp saken til neste politiske møte.",
            "Saksframlegget har nå et eksplisitt skille mellom lovkrav, faglig anbefaling og politiske alternativer.",
            "Den siste kontrollen er ikke innholdsmessig, men institusjonell: finnes den nødvendige ledergodkjenningen?",
        ],
        "task_domain": "formell_oversendelse",
        "task_kind": "event",
        "competency": "myndighetsgrense",
        "pressure": "frist_vs_formell_myndighet",
        "choice_axis": "send_med_godkjenning_vs_vent",
        "consequence_axis": "legitim_oversendelse_vs_uautorisert_handling",
        "narrative_arc": "lillebekk_fra_kunnskapsgrunnlag_til_politisk_behandling",
        "interaction_mode": "decision",
        "work_context": work_context("politisk_utvalg"),
        "authority_context": authority,
        "choices": [
            {
                "id": "A",
                "label": "Send den godkjente saken til politisk behandling",
                "reply": "Jeg sender den godkjente administrative anbefalingen og de åpne politiske alternativene til utvalget.",
                "effect": 1,
                "authority_action": {"action_id": "send_lillebekk_til_politisk_behandling", "intent": "execute"},
                "tags": ["authorized_execution", "political_handoff", "case_closure"],
                "feedback": "Du avslutter administrasjonens saksforberedelse uten å late som du eier det politiske utfallet.",
                "effects": {
                    "stats": {"quality": 3, "trust": 3, "risk": -3, "energy": -1},
                    "work_object_ops": [
                        {
                            "op": "close",
                            "event_id": "by_radgiver_lillebekk_sent_to_committee",
                            "work_object_id": CASE_ID,
                            "outcome": "sendt_til_politisk_behandling_med_sporbart_administrativt_fagspor",
                        }
                    ],
                },
            },
            {
                "id": "B",
                "label": "Vent på godkjenning hvis den fortsatt ikke er registrert",
                "reply": "Jeg lar saken stå i oversendelseskøen til ledergodkjenningen faktisk finnes som et spor i saken.",
                "effect": 0,
                "authority_action": {"action_id": "send_lillebekk_til_politisk_behandling", "intent": "wait"},
                "tags": ["waiting", "approval_dependency"],
                "feedback": "Du behandler venting som reell arbeidsflyt, ikke som tom tekst: saken blir stående åpen fordi en avhengighet mangler.",
                "effects": {
                    "work_object_ops": [
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_waiting_before_send",
                            "work_object_id": CASE_ID,
                            "to_status": "awaiting_approval",
                            "to_phase": "venter_pa_registrert_ledergodkjenning",
                            "note": "Formell oversendelse er utsatt til godkjenningen er persistent registrert.",
                        }
                    ]
                },
            },
        ],
    }

    return catalog(
        "event",
        "role_world_realism_authority",
        "Gjør linjeledelse, approval points, begrenset kapasitet, eskalering og formell oversendelsesmyndighet spillbar i Lillebekk-saken.",
        ["authority_boundary", "approval", "escalation", "capacity", "political_handoff"],
        [approval_mail, send_mail],
    )


def build_knowledge() -> dict:
    mail = {
        "id": KNOWLEDGE_MAIL_ID,
        "mail_type": "knowledge",
        "mail_family": "role_world_realism_history_go",
        "role_scope": ROLE_SCOPE,
        "phase": "advanced",
        "day_phase": "afternoon",
        "priority": 110,
        "cooldown": 8,
        "repeatable": False,
        "stage": "stable",
        "from": "Elin, plansjef",
        "person_id": "elin_plansjef",
        "place_id": "radhuset_planavdeling",
        "thread_key": "by_radgiver_lillebekk_realism_001",
        "subject": "Gå til Oslo rådhus i History Go: administrasjonen forbereder, politikken vedtar",
        "summary": "Elin ber deg bruke den canonicale History Go-profilen for Oslo rådhus til å kontrollere en avgjørende grense i Lillebekk-saken: bystyret og andre folkevalgte organer eier politiske vedtak, mens administrasjonen skal gjøre premisser, lovkrav, faglige vurderinger og alternativer etterprøvbare.",
        "purpose": "La konkret History Go-kunnskap om kommunal institusjon og lokaldemokrati endre et senere profesjonelt handlingsrom i samme plansak.",
        "stakes": "Hvis administrativ anbefaling skrives som om den var vedtak, skjules politikk i fagspråk. Hvis alt omtales som politikk, forsvinner lovkrav og faglig ansvar. Begge feil gjør saken vanskeligere å etterprøve.",
        "situation": [
            "Oslo rådhus er et canonicalt History Go-sted knyttet til bystyre, byråd, kommunal administrasjon og lokaldemokrati.",
            "Du skal bruke stedet som institusjonell læringsflate, ikke som fiktiv arbeidsplass i Lillebekk-saken.",
            "Når du kommer tilbake skal du kunne markere hva som er lovbundet, hva administrasjonen anbefaler, og hva politikerne faktisk skal velge.",
        ],
        "task_domain": "kommunal_myndighet_og_politisk_beslutning",
        "task_kind": "knowledge",
        "competency": "administrasjon_politikk_grense",
        "pressure": "politisk_lesbarhet_vs_skjult_styring",
        "choice_axis": "skille_lov_fag_politikk_vs_skrive_alt_som_en_konklusjon",
        "consequence_axis": "etterprovbart_beslutningsgrunnlag_vs_skult_myndighetsutovelse",
        "narrative_arc": "lillebekk_fra_kunnskapsgrunnlag_til_politisk_behandling",
        "interaction_mode": "task",
        "task_contract": {
            "task_id": "by_radgiver_history_go_oslo_radhus",
            "completion_rule": "history_go_payload_completed",
            "failure_rule": "remain_open",
            "evidence_refs": [
                "data/places/politikk/oslo/places_politikk/oslo_radhus.json",
                "data/quiz/politikk/oslo_radhus_sets.json",
            ],
        },
        "task_payload": {
            "task_kind": "history_go_place",
            "target_type": "place",
            "place_id": "oslo_radhus",
            "completion_mode": "open_place",
            "title": "Les Oslo rådhus som kommunalt makt- og beslutningssted",
            "description": "Åpne Oslo rådhus og bruk profilen til å skille kommunal administrasjon, folkevalgte vedtak og den offentlige beslutningsarenaen før du går tilbake til Lillebekk-saken.",
            "return_context": {
                "source": "civication",
                "mail_id": KNOWLEDGE_MAIL_ID,
                "role_scope": ROLE_SCOPE,
                "place_id": "oslo_radhus",
                "quiz_ref": "data/quiz/politikk/oslo_radhus_sets.json",
            },
        },
        "work_context": work_context("ledergjennomgang"),
        "choices": [
            {
                "id": "A",
                "label": "Bruk rådhusprofilen til å skrive tre eksplisitte kolonner: lovkrav, administrativ anbefaling og politisk valg",
                "reply": "Jeg bruker History Go-konteksten til å gjøre myndighetsgrensen synlig i Lillebekk: det bundne, det faglig anbefalte og det politisk valgbare får hver sin status.",
                "effect": 1,
                "tags": ["history_go_place", "authority_literacy", "political_readability"],
                "feedback": "Du omsetter stedskunnskap til et konkret profesjonelt grep uten å gjøre History Go til ny formell myndighet.",
                "effects": {
                    "stats": {"quality": 3, "trust": 2, "risk": -3, "energy": -1},
                    "work_object_ops": [
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_history_go_applied",
                            "work_object_id": CASE_ID,
                            "to_status": "in_progress",
                            "to_phase": "myndighetsgrense_og_alternativer_revidert",
                            "note": "History Go-læringen fra Oslo rådhus er brukt til å skille lovkrav, administrativ anbefaling og politisk valg i beslutningsgrunnlaget.",
                        },
                        {
                            "op": "add_flag",
                            "event_id": "by_radgiver_lillebekk_authority_literacy",
                            "work_object_id": CASE_ID,
                            "flag": "history_go_myndighetsgrense_anvendt",
                        },
                    ],
                },
            },
            {
                "id": "B",
                "label": "Bruk rådhusprofilen som generell bakgrunn, men behold ett samlet administrativt forslag",
                "reply": "Jeg har forstått institusjonen, men holder saken kort ved å presentere én samlet anbefaling uten å skille eksplisitt mellom bundet og politisk valgbart.",
                "effect": -1,
                "tags": ["history_go_context_only", "authority_blur"],
                "feedback": "Du lærer noe om institusjonen, men omsetter det ikke til et bedre profesjonelt beslutningsgrunnlag.",
                "effects": {
                    "stats": {"quality": -1, "trust": -1, "risk": 2},
                    "work_object_ops": [
                        {
                            "op": "add_flag",
                            "event_id": "by_radgiver_lillebekk_authority_blur",
                            "work_object_id": CASE_ID,
                            "flag": "politisk_grense_fortsatt_uklar",
                        }
                    ],
                },
            },
        ],
    }
    return catalog(
        "knowledge",
        "role_world_realism_history_go",
        "Bruk et canonicalt kommunalt maktsted i History Go til å trene en profesjonell myndighetsgrense som senere åpner et bedre valg.",
        ["History Go", "oslo_radhus", "lokaldemokrati", "administrasjon_vs_politikk"],
        [mail],
    )


def build_followup() -> dict:
    mail = {
        "id": "by_radgiver_realism_approval_grant_001",
        "mail_type": "followup",
        "mail_family": "role_world_realism_approval_followup",
        "role_scope": ROLE_SCOPE,
        "phase": "mastery",
        "day_phase": "morning",
        "priority": 109,
        "cooldown": 8,
        "repeatable": False,
        "stage": "stable",
        "from": "Elin, plansjef",
        "person_id": "elin_plansjef",
        "place_id": "radhuset_planavdeling",
        "thread_key": "by_radgiver_lillebekk_realism_001",
        "subject": "Godkjent med ett vilkår: usikkerheten og det politiske valget skal følge saken helt inn i utvalget",
        "summary": "Etter leder- og planjuridisk gjennomgang godkjenner Elin oversendelsen, men bare dersom saken beholder den dokumenterte skoleveien, grøntdragets funksjon og skillet mellom administrativ anbefaling og politisk valg.",
        "purpose": "La en persistent approval gå fra pending til granted i en senere scene og vise at dokumentet har flyttet seg gjennom lederlinje og fagkontroll.",
        "stakes": "Godkjenningen er ikke et signal om at alle faglige spørsmål er løst. Den betyr at administrasjonen står for beslutningsgrunnlaget slik det nå er avgrenset.",
        "situation": [
            "Nora har kontrollert at rekkefølgekravet er juridisk lesbart.",
            "Elin godkjenner at saken kan sendes når forbeholdene står synlig.",
            "Godkjenningen skal være et varig arbeidsobjekt, ikke bare en setning som glemmes før siste scene.",
        ],
        "task_domain": "ledergodkjenning_og_dokumentflyt",
        "task_kind": "followup",
        "competency": "arbeidsflyt_og_sporbarhet",
        "pressure": "frist_vs_vilkar_for_godkjenning",
        "choice_axis": "bevar_vilkar_vs_glatt_over_forbehold",
        "consequence_axis": "sporbar_godkjenning_vs_skjult_usikkerhet",
        "narrative_arc": "lillebekk_fra_kunnskapsgrunnlag_til_politisk_behandling",
        "interaction_mode": "decision",
        "work_context": work_context("politisk_utvalg"),
        "choices": [
            {
                "id": "A",
                "label": "Registrer godkjenningen og behold alle tre vilkårene i oversendelsen",
                "reply": "Jeg registrerer ledergodkjenningen og lar skolevei, grøntdrag og myndighetsgrense følge saken som eksplisitte premisser.",
                "effect": 1,
                "tags": ["approval_granted", "conditions_preserved", "document_flow"],
                "feedback": "Godkjenningen blir et persistent spor, og dokumentet beholder vilkårene som gjorde godkjenningen mulig.",
                "effects": {
                    "stats": {"quality": 3, "trust": 3, "risk": -2},
                    "work_object_ops": [
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_approval_granted",
                            "work_object_id": APPROVAL_ID,
                            "to_status": "granted",
                            "to_phase": "godkjent_med_vilkar",
                            "note": "Plansjefen har godkjent oversendelsen med eksplisitt krav om at dokumenterte forbehold og politiske alternativer bevares.",
                        },
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_ready_after_approval",
                            "work_object_id": CASE_ID,
                            "to_status": "awaiting_submission",
                            "to_phase": "ledergodkjent_beslutningsgrunnlag",
                            "note": "Saken har passert leder- og planjuridisk kontroll og venter på siste faglige formulering før oversendelse.",
                        },
                        {
                            "op": "add_flag",
                            "event_id": "by_radgiver_lillebekk_approval_conditions_visible",
                            "work_object_id": CASE_ID,
                            "flag": "ledergodkjenning_med_synlige_vilkar",
                        },
                    ],
                },
            },
            {
                "id": "B",
                "label": "Registrer godkjenningen, men forkort forbeholdene i sammendraget",
                "reply": "Jeg registrerer godkjenningen, men komprimerer forbeholdene for å gjøre saken raskere å lese.",
                "effect": 0,
                "tags": ["approval_granted", "compression_risk"],
                "feedback": "Saken kan sendes, men politisk lesbarhet blir kjøpt med en risiko for at viktige premisser forsvinner i sammendraget.",
                "effects": {
                    "stats": {"quality": 0, "trust": 1, "risk": 2},
                    "work_object_ops": [
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_approval_granted_compressed",
                            "work_object_id": APPROVAL_ID,
                            "to_status": "granted",
                            "to_phase": "godkjent_med_komprimert_sammendrag",
                            "note": "Formell ledergodkjenning er gitt, men sammendraget bærer økt risiko for å skjule premisser.",
                        },
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_ready_with_summary_risk",
                            "work_object_id": CASE_ID,
                            "to_status": "awaiting_submission",
                            "to_phase": "ledergodkjent_med_sammendragsrisiko",
                        },
                        {
                            "op": "add_flag",
                            "event_id": "by_radgiver_lillebekk_summary_risk",
                            "work_object_id": CASE_ID,
                            "flag": "forbehold_komprimert_i_sammendrag",
                        },
                    ],
                },
            },
        ],
    }
    return catalog(
        "followup",
        "role_world_realism_approval_followup",
        "La leder- og planjuridisk kontroll komme tilbake som en senere, persistent godkjenning med vilkår og dokumentflyt.",
        ["approval_granted", "rework", "document_handoff", "waiting"],
        [mail],
    )


def build_consequence() -> dict:
    gate = {
        "history_go": {
            "task_mail_ids": [KNOWLEDGE_MAIL_ID],
            "require_task_completed": True,
            "require_history_go_correct": True,
            "min_effect": 1,
        }
    }
    mail = {
        "id": "by_radgiver_realism_return_to_case_001",
        "mail_type": "consequence",
        "mail_family": "role_world_realism_return_to_case",
        "role_scope": ROLE_SCOPE,
        "phase": "mastery",
        "day_phase": "afternoon",
        "priority": 109,
        "cooldown": 8,
        "repeatable": False,
        "stage": "stable",
        "from": "Maja, utvalgssekretær",
        "person_id": "maja_utvalgssekretaer",
        "place_id": "politisk_utvalg_moterom",
        "thread_key": "by_radgiver_lillebekk_realism_001",
        "subject": "Tilbake til Lillebekk: utvalget må se hva administrasjonen vet, anbefaler og ikke kan bestemme",
        "summary": "Saken kommer tilbake etter History Go-læring og ledergjennomgang. Du skal nå velge hvordan beslutningsgrunnlaget skiller lovkrav, lokal evidens, faglig anbefaling og politiske alternativer.",
        "purpose": "Bevise at konkret, korrekt anvendt History Go-læring åpner et materiell bedre profesjonelt valg i samme vedvarende arbeidssak.",
        "stakes": "Et lesbart sammendrag kan fortsatt skjule hvem som eier hvilke vurderinger. Den beste løsningen er ikke mer tekst, men en eksplisitt myndighets- og evidensstruktur som følger saken videre.",
        "situation": [
            "Skolevei og grøntdrag er nå dokumentert som faktiske premisser.",
            "Ledergodkjenningen krever at politiske alternativer ikke skjules i administrativt språk.",
            "History Go-øvelsen kan gi deg et bedre grep, men bare dersom den er fullført og anvendt profesjonelt.",
        ],
        "task_domain": "politisk_lesbart_beslutningsgrunnlag",
        "task_kind": "consequence",
        "competency": "evidens_myndighet_og_alternativstruktur",
        "pressure": "kort_sammendrag_vs_etterprovbar_ansvarsdeling",
        "choice_axis": "eksplisitt_lov_fag_politikk_vs_samlet_anbefaling",
        "consequence_axis": "bedre_politisk_valgrom_vs_skjult_administrativ_styring",
        "narrative_arc": "lillebekk_fra_kunnskapsgrunnlag_til_politisk_behandling",
        "interaction_mode": "decision",
        "work_context": work_context("politisk_utvalg"),
        "authority_context": authority_context(),
        "choices": [
            {
                "id": "A",
                "label": "Behold ett tydelig administrativt hovedforslag og list forbeholdene under",
                "reply": "Jeg gir utvalget ett hovedforslag, men gjør usikkerheten og de viktigste forbeholdene synlige under anbefalingen.",
                "effect": 1,
                "authority_action": {"action_id": "skriv_faglig_anbefaling", "intent": "recommend"},
                "tags": ["baseline_good", "visible_caveats"],
                "feedback": "Dette er faglig forsvarlig, men utvalgets reelle valgpunkter kan fortsatt ligge tett på administrasjonens foretrukne løsning.",
                "effects": {
                    "stats": {"quality": 2, "trust": 2, "risk": -1},
                    "work_object_ops": [
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_baseline_basis",
                            "work_object_id": CASE_ID,
                            "to_status": "awaiting_submission",
                            "to_phase": "faglig_anbefaling_med_synlige_forbehold",
                            "note": "Administrasjonens anbefaling og forbehold er synlige, men politiske alternativer er ikke fullt separert som eget valgrom.",
                        }
                    ],
                },
            },
            {
                "id": "B",
                "label": "Komprimer saken til anbefalt løsning og de to viktigste konsekvensene",
                "reply": "Jeg gjør saken kortest mulig rundt én anbefalt løsning og to hovedkonsekvenser.",
                "effect": -1,
                "authority_action": {"action_id": "skriv_faglig_anbefaling", "intent": "recommend"},
                "tags": ["compression", "political_choice_blur"],
                "feedback": "Dokumentet blir raskt å lese, men det blir vanskeligere å se hvilke alternativer administrasjonen har gjort mindre synlige.",
                "effects": {
                    "stats": {"quality": -2, "trust": -1, "risk": 3},
                    "work_object_ops": [
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_blurred_basis",
                            "work_object_id": CASE_ID,
                            "to_status": "awaiting_submission",
                            "to_phase": "forenklet_saksgrunnlag_med_skjult_valgrom",
                        },
                        {
                            "op": "add_flag",
                            "event_id": "by_radgiver_lillebekk_choice_blur",
                            "work_object_id": CASE_ID,
                            "flag": "politisk_valgrom_delvis_skjult",
                        },
                    ],
                },
            },
            {
                "id": "C",
                "label": "Bruk rådhus-læringen: skill bindende lovkrav, dokumentert lokal evidens, administrativ anbefaling og eksplisitte politiske alternativer",
                "reply": "Jeg strukturerer saken slik at utvalget kan se hva som er juridisk bundet, hva kunnskapsgrunnlaget faktisk viser, hva administrasjonen anbefaler, og hvilke verdibaserte alternativer som fortsatt tilhører politikken.",
                "effect": 2,
                "affordance": gate,
                "authority_action": {"action_id": "skriv_faglig_anbefaling", "intent": "recommend"},
                "tags": ["learned_authority_boundary", "evidence_structure", "political_choice_space"],
                "feedback": "History Go-kunnskapen blir profesjonell kompetanse: den gir ikke mer myndighet, men gjør beslutningsgrunnlaget bedre og mindre styrende.",
                "effects": {
                    "stats": {"quality": 5, "trust": 4, "risk": -4, "energy": -1},
                    "work_object_ops": [
                        {
                            "op": "transition",
                            "event_id": "by_radgiver_lillebekk_learned_basis",
                            "work_object_id": CASE_ID,
                            "to_status": "awaiting_submission",
                            "to_phase": "kunnskapsforankret_beslutningsgrunnlag_med_eksplisitt_myndighetsgrense",
                            "note": "Lovkrav, lokal evidens, administrativ anbefaling og politiske alternativer er separert eksplisitt før oversendelse.",
                        },
                        {
                            "op": "remove_flag",
                            "event_id": "by_radgiver_lillebekk_remove_authority_blur",
                            "work_object_id": CASE_ID,
                            "flag": "politisk_grense_ikke_eksplisitt",
                        },
                        {
                            "op": "remove_flag",
                            "event_id": "by_radgiver_lillebekk_remove_summary_blur",
                            "work_object_id": CASE_ID,
                            "flag": "forbehold_komprimert_i_sammendrag",
                        },
                        {
                            "op": "add_flag",
                            "event_id": "by_radgiver_lillebekk_explicit_authority_boundary",
                            "work_object_id": CASE_ID,
                            "flag": "lov_fag_politikk_eksplisitt_adskilt",
                        },
                    ],
                },
            },
        ],
    }
    return catalog(
        "consequence",
        "role_world_realism_return_to_case",
        "Returner til samme Lillebekk-sak og la korrekt anvendt History Go-kunnskap åpne et bedre, men ikke mer myndig, profesjonelt valg.",
        ["return_to_case", "choice_affordance", "political_readability", "authority_boundary"],
        [mail],
    )


def update_plan() -> None:
    path = ROOT / "data/Civication/mailPlans/by/by_radgiver_plan_plan.json"
    plan = json.loads(path.read_text(encoding="utf-8"))
    pilot_families = {
        "role_world_realism_lillebekk_case",
        "role_world_realism_authority",
        "role_world_realism_history_go",
        "role_world_realism_approval_followup",
        "role_world_realism_return_to_case",
    }
    sequence = []
    for row in plan.get("sequence", []):
        allowed = set(row.get("allowed_families") or [])
        if allowed & pilot_families:
            continue
        sequence.append(row)
    next_step = max((int(row.get("step", 0)) for row in sequence), default=0) + 1
    additions = [
        ("job", "advanced", "Åpne Lillebekk som én persistent plansak der lokal kunnskap, dokumenter og ansvar må overleve gjennom flere scener.", "role_world_realism_lillebekk_case"),
        ("event", "advanced", "Gjør lederlinje, begrenset juridisk kapasitet, approval point og eskalering til reelle handlinger i samme sak.", "role_world_realism_authority"),
        ("knowledge", "advanced", "Bruk Oslo rådhus i History Go til å lære den konkrete grensen mellom administrativ anbefaling og politisk vedtak.", "role_world_realism_history_go"),
        ("followup", "mastery", "La leder- og planjuridisk gjennomgang komme tilbake som persistent godkjenning etter venting og rework.", "role_world_realism_approval_followup"),
        ("consequence", "mastery", "Returner til Lillebekk og la korrekt anvendt History Go-læring åpne et bedre beslutningsgrunnlag uten å gi ny formell myndighet.", "role_world_realism_return_to_case"),
        ("event", "mastery", "Avslutt først når den persistent registrerte ledergodkjenningen faktisk gjør formell oversendelse lovlig i myndighetskontrakten.", "role_world_realism_authority"),
    ]
    for offset, (mail_type, phase, goal, family) in enumerate(additions):
        sequence.append({
            "step": next_step + offset,
            "type": mail_type,
            "phase": phase,
            "step_goal": goal,
            "allowed_families": [family],
            "fallback_types": [],
        })
    plan["sequence"] = sequence
    path.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_test() -> None:
    content = r'''#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const workWorldFactory = require(path.join(root, 'js/Civication/core/civicationWorkWorld.js'));
const authority = require(path.join(root, 'js/Civication/core/civicationInstitutionAuthority.js'));
const affordance = require(path.join(root, 'js/Civication/core/civicationChoiceAffordance.js'));

const roleScope = 'by_radgiver_plan';
const caseId = 'by_radgiver_lillebekk_plan_case_001';
const approvalId = 'by_radgiver_lillebekk_approval_001';
const knowledgeMailId = 'by_radgiver_realism_knowledge_radhus_001';

function catalog(type, suffix) {
  return readJson(`data/Civication/mailFamilies/by/${type}/by_radgiver_plan_realism_${suffix}.json`);
}
function mail(data, id) {
  return data.families.flatMap(f => f.mails || []).find(m => m.id === id);
}
function makeState(initial = {}) {
  let state = JSON.parse(JSON.stringify(initial));
  const deepMerge = (target, patch) => {
    const out = { ...(target || {}) };
    for (const [key, value] of Object.entries(patch || {})) {
      if (value && typeof value === 'object' && !Array.isArray(value)) out[key] = deepMerge(out[key] || {}, value);
      else out[key] = value;
    }
    return out;
  };
  return {
    getState() { return JSON.parse(JSON.stringify(state)); },
    setState(patch) { state = deepMerge(state, patch || {}); return this.getState(); }
  };
}
function applyScene(adapter, scene, choiceId, at) {
  const choice = scene.choices.find(c => c.id === choiceId);
  assert(choice, `${scene.id} choice ${choiceId}`);
  adapter.applyOperations(scene.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
  adapter.applyOperations(choice.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
}

const jobCatalog = catalog('job', 'job');
const eventCatalog = catalog('event', 'event');
const knowledgeCatalog = catalog('knowledge', 'knowledge');
const followupCatalog = catalog('followup', 'followup');
const consequenceCatalog = catalog('consequence', 'consequence');

const openCase = mail(jobCatalog, 'by_radgiver_realism_case_open_001');
const requestApproval = mail(eventCatalog, 'by_radgiver_realism_approval_request_001');
const historyGo = mail(knowledgeCatalog, knowledgeMailId);
const managerGrant = mail(followupCatalog, 'by_radgiver_realism_approval_grant_001');
const returnToCase = mail(consequenceCatalog, 'by_radgiver_realism_return_to_case_001');
const formalSend = mail(eventCatalog, 'by_radgiver_realism_formal_send_001');
for (const scene of [openCase, requestApproval, historyGo, managerGrant, returnToCase, formalSend]) assert(scene, 'all realism pilot scenes exist');

// Same persistent case identity survives the whole vertical.
for (const scene of [openCase, requestApproval, historyGo, managerGrant, returnToCase, formalSend]) {
  assert.deepEqual(scene.work_context.object_ids, [caseId]);
  assert.equal(scene.work_context.institution_id, 'oslo_kommune_planavdeling_001');
}
assert.equal(openCase.effects.work_object_ops[0].work_object.work_object_id, caseId);
assert.equal(openCase.effects.work_object_ops[0].work_object.shared, true);
assert(openCase.effects.work_object_ops[0].work_object.people_refs.includes('hanne_beboer'));
assert(openCase.effects.work_object_ops[0].work_object.people_refs.includes('nora_planjuss'));

// Canonical History Go evidence is real and relevant to the institutional distinction being trained.
const radhus = readJson('data/places/politikk/oslo/places_politikk/oslo_radhus.json');
assert.equal(radhus.id, 'oslo_radhus');
assert(radhus.emne_ids.includes('em_pol_lokaldemokrati'));
assert(radhus.emne_ids.includes('em_pol_byrakrati_forvaltning'));
assert.equal(historyGo.interaction_mode, 'task');
assert.equal(historyGo.task_contract.completion_rule, 'history_go_payload_completed');
assert.equal(historyGo.task_payload.place_id, 'oslo_radhus');
assert.equal(historyGo.task_payload.return_context.role_scope, roleScope);
assert.deepEqual(historyGo.work_context.object_ids, [caseId]);

// Authority contract: recommendation is allowed, formal send is blocked before approval.
assert.equal(requestApproval.authority_context.role_scope, roleScope);
assert.equal(requestApproval.authority_context.reporting_line[0], 'elin_plansjef');
assert(requestApproval.authority_context.peer_functions.includes('nora_planjuss'));
assert(requestApproval.authority_context.external_counterparts.includes('ivar_utbygger'));
assert.equal(requestApproval.authority_context.resources[0].baseline_state, 'limited');
const requestChoice = requestApproval.choices.find(c => c.id === 'A');
assert.equal(requestChoice.authority_action.intent, 'request_approval');
assert.equal(requestChoice.effects.work_object_ops[0].work_object.work_object_id, approvalId);
assert.equal(requestChoice.effects.work_object_ops[0].work_object.status, 'pending');
const escalationChoice = requestApproval.choices.find(c => c.id === 'C');
assert.equal(escalationChoice.authority_action.intent, 'escalate');
assert.equal(escalationChoice.effects.work_object_ops[0].work_object.kind, 'escalation');
assert.equal(escalationChoice.effects.work_object_ops[0].work_object.status, 'open');

const state = makeState({ untouched: { sentinel: true } });
const adapter = workWorldFactory.createAdapter(state);
const executeChoice = formalSend.choices.find(c => c.id === 'A');
const blocked = authority.evaluate(formalSend.authority_context, executeChoice.authority_action, { role_scope: roleScope, work_world: adapter });
assert.equal(blocked.allowed, false);
assert.equal(blocked.reason, 'approval_required');

applyScene(adapter, openCase, 'A', '2026-08-23T08:00:00.000Z');
assert.equal(adapter.getWorkObject(caseId).phase, 'lokalkunnskap_og_teknisk_grunnlag');
applyScene(adapter, requestApproval, 'A', '2026-08-23T10:00:00.000Z');
assert.equal(adapter.getWorkObject(approvalId).status, 'pending');
assert.equal(adapter.getWorkObject(caseId).status, 'awaiting_approval');
const waiting = authority.evaluate(formalSend.authority_context, formalSend.choices.find(c => c.id === 'B').authority_action, { role_scope: roleScope, work_world: adapter });
assert.equal(waiting.allowed, true);
assert.equal(waiting.reason, 'waiting_for_approval');

// History Go learning expands choice space, but only after completion + correct professional application.
const learnedChoice = returnToCase.choices.find(c => c.id === 'C');
assert.deepEqual(learnedChoice.affordance.history_go.task_mail_ids, [knowledgeMailId]);
assert.equal(learnedChoice.effect, 2);
assert(Number(learnedChoice.effect) > Number(returnToCase.choices.find(c => c.id === 'A').effect));
const noTask = { getTaskByMailId() { return null; } };
assert.deepEqual(affordance.availableChoices(returnToCase, noTask).map(c => c.id), ['A', 'B']);
const evidenceOnly = { getTaskByMailId(id) { return id === knowledgeMailId ? { mail_id: id, status: 'open', history_go: { correct: true }, result: null } : null; } };
assert.deepEqual(affordance.availableChoices(returnToCase, evidenceOnly).map(c => c.id), ['A', 'B']);
const learnedTask = { getTaskByMailId(id) { return id === knowledgeMailId ? { mail_id: id, status: 'completed', history_go: { correct: true }, result: { effect: 1 } } : null; } };
assert.deepEqual(affordance.availableChoices(returnToCase, learnedTask).map(c => c.id), ['A', 'B', 'C']);

applyScene(adapter, historyGo, 'A', '2026-08-23T13:00:00.000Z');
assert(adapter.getWorkObject(caseId).flags.includes('history_go_myndighetsgrense_anvendt'));
applyScene(adapter, managerGrant, 'A', '2026-08-24T08:00:00.000Z');
assert.equal(adapter.getWorkObject(approvalId).status, 'granted');
assert.equal(adapter.getWorkObject(caseId).status, 'awaiting_submission');
const allowed = authority.evaluate(formalSend.authority_context, executeChoice.authority_action, { role_scope: roleScope, work_world: adapter });
assert.equal(allowed.allowed, true);
assert.equal(allowed.reason, 'approval_granted');
assert.equal(allowed.capacity[0].state, 'limited');

applyScene(adapter, returnToCase, 'C', '2026-08-24T11:00:00.000Z');
const ready = adapter.getWorkObject(caseId);
assert.equal(ready.phase, 'kunnskapsforankret_beslutningsgrunnlag_med_eksplisitt_myndighetsgrense');
assert(ready.flags.includes('lov_fag_politikk_eksplisitt_adskilt'));
assert(!ready.flags.includes('politisk_grense_ikke_eksplisitt'));
applyScene(adapter, formalSend, 'A', '2026-08-24T15:00:00.000Z');
const closed = adapter.getWorkObject(caseId);
assert.equal(closed.status, 'closed');
assert.equal(closed.outcome, 'sendt_til_politisk_behandling_med_sporbart_administrativt_fagspor');
assert.ok(closed.history.length >= 12, 'one work case accumulates cross-scene history including rework/approval/knowledge/send');
assert.deepEqual(state.getState().untouched, { sentinel: true });

// Mail plan owns the actual gameplay ordering; the pilot is not an unreachable data demo.
const plan = readJson('data/Civication/mailPlans/by/by_radgiver_plan_plan.json');
const pilotFamilies = [
  'role_world_realism_lillebekk_case',
  'role_world_realism_authority',
  'role_world_realism_history_go',
  'role_world_realism_approval_followup',
  'role_world_realism_return_to_case'
];
const pilotSteps = plan.sequence.filter(row => (row.allowed_families || []).some(id => pilotFamilies.includes(id)));
assert.equal(pilotSteps.length, 6);
for (let i = 1; i < pilotSteps.length; i += 1) assert(pilotSteps[i - 1].step < pilotSteps[i].step);
assert.equal(pilotSteps[0].allowed_families[0], 'role_world_realism_lillebekk_case');
assert.equal(pilotSteps[1].allowed_families[0], 'role_world_realism_authority');
assert.equal(pilotSteps[2].allowed_families[0], 'role_world_realism_history_go');
assert.equal(pilotSteps[3].allowed_families[0], 'role_world_realism_approval_followup');
assert.equal(pilotSteps[4].allowed_families[0], 'role_world_realism_return_to_case');
assert.equal(pilotSteps[5].allowed_families[0], 'role_world_realism_authority');

// Registry parity proves all shared contracts survive compilation.
const registry = readJson('data/Civication/compiledSceneRegistryV1.json');
for (const scene of [openCase, requestApproval, historyGo, managerGrant, returnToCase, formalSend]) {
  const entry = registry.entries.find(row => row.id === scene.id);
  assert(entry, `${scene.id} compiled`);
  assert.deepEqual(entry.scene.work_context.object_ids, [caseId]);
  assert.deepEqual(entry.compatibility_projection.work_context.object_ids, [caseId]);
}
const compiledAuthority = registry.entries.find(row => row.id === requestApproval.id);
assert.equal(compiledAuthority.scene.authority_context.approval_points[0].approval_object_id, approvalId);
assert.equal(compiledAuthority.compatibility_projection.choices.find(c => c.id === 'A').authority_action.intent, 'request_approval');
const compiledLearning = registry.entries.find(row => row.id === historyGo.id);
assert.equal(compiledLearning.scene.task_payload.place_id, 'oslo_radhus');
const compiledReturn = registry.entries.find(row => row.id === returnToCase.id);
assert.deepEqual(compiledReturn.scene.choices.find(c => c.id === 'C').affordance.history_go.task_mail_ids, [knowledgeMailId]);
const compiledSend = registry.entries.find(row => row.id === formalSend.id);
assert.equal(compiledSend.scene.choices.find(c => c.id === 'A').authority_action.intent, 'execute');

console.log('✓ By-rådgiver Role World realism pilot: persistent case → authority/approval → History Go learning → rework/grant → better choice → authorized political handoff');
'''
    path = ROOT / "tests/civication-by-radgiver-role-world-realism-pilot.test.js"
    path.write_text(content, encoding="utf-8")


def write_report() -> None:
    content = f'''# Civication By-rådgiver — Role World realism pilot

## Scope

This is the second full Role World realism pilot after the History archive vertical. It deliberately reuses the existing `by/by_radgiver_plan` Lillebekk world instead of inventing a parallel career or engine.

The pilot proves one connected professional life-world:

```text
persistent planning case
→ local evidence and professional judgment
→ institutional authority / limited legal capacity
→ real approval request or escalation
→ History Go learning at Oslo rådhus
→ targeted rework and later manager approval
→ return to the same case with a better learned option
→ formal political handoff only when authority is actually granted
```

## Persistent work case

The shared case is `{CASE_ID}`. It is a single `CivicationWorkWorld` object that accumulates:

- school-route and green-corridor evidence;
- handoff to manager and plan-law review;
- visible rework of law / professional judgment / political choice;
- History Go application;
- approval conditions;
- the final decision-basis structure;
- closure only at authorized political submission.

The case references recurring By-rådgiver actors already present in the Role World: Elin (plansjef), Ivar (developer), Hanne (resident), Signe (urban ecologist), Nora (plan-law specialist), and Maja (committee secretary).

## Institution and authority

Static authority is authored on the relevant scenes:

- institution: `{INSTITUTION}`;
- unit: `{UNIT}`;
- reporting line: `elin_plansjef`;
- peer functions: plan law, urban ecology and committee preparation;
- external counterparts: developer and resident;
- approval point: formal submission to political treatment;
- scarce resource: `planjuridisk_kapasitet` with `limited` baseline;
- escalation path: deadline/capacity conflict to the plansjef.

Dynamic state remains in WorkWorld:

- `{APPROVAL_ID}` is created as `pending` and later becomes `granted`;
- `{ESCALATION_ID}` is created as an `open` escalation if the player chooses that path;
- the main case visibly waits or enters rework instead of pretending every mail is an isolated decision.

The player may recommend within professional influence. Formal political submission is `approval_required`; the authority resolver blocks execution before approval and permits it after the persistent approval object is granted.

## History Go changes professional affordance

The learning scene `{KNOWLEDGE_MAIL_ID}` sends the player to the canonical `oslo_radhus` place. That place explicitly covers local democracy, municipal administration, city council/city government and the difference between local and national authority.

The task is completed through the existing History Go completion bridge and TaskEngine. Civication does not copy raw History Go progression into a new store.

After completion **and** a positive professional application (`effect >= 1`), the later Lillebekk consequence scene gains a third choice. The learned option explicitly separates:

1. binding legal requirements;
2. documented local evidence;
3. the administration's professional recommendation;
4. the political alternatives that remain for elected decision-makers.

This option is materially better (`effect = 2`) than the ordinary good baseline (`effect = 1`) but does **not** grant new formal authority. The formal send still requires the plansjef's approval.

## Realism represented without a new work-rhythm engine

This pilot intentionally demonstrates concrete rhythm inside the existing Scene Pipeline before Phase 4 is generalized:

- document handoff to manager and plan-law specialist;
- waiting for approval;
- limited specialist capacity;
- escalation instead of hidden quality cuts;
- targeted rework;
- later approval response;
- return to the same work object;
- final handoff to political treatment.

No new scheduler, day engine, reputation engine or institution state store is introduced.

## Regression proof

`tests/civication-by-radgiver-role-world-realism-pilot.test.js` proves:

- one persistent Lillebekk case across all pilot scenes;
- canonical Oslo rådhus evidence and task contract;
- approval request, waiting, escalation and limited capacity contracts;
- formal execution blocked before approval and allowed after grant;
- History Go evidence alone does not unlock the improved option;
- completed + correct + positively applied learning does unlock it;
- learned option creates a different persistent case phase/flags;
- the plan orders all pilot scenes so this is reachable gameplay, not an orphaned data demo;
- compiled registry parity for work context, authority actions, History Go task and affordance.

## Roadmap position

This completes the planned **second full realism pilot**. It does not declare the wider Role World Realism roadmap complete. The next shared implementation layer remains the generalized Phase 4 work-rhythm/backlog/rework contract, followed by situated reputation and a structurally different role pilot before broad rollout resumes.
'''
    path = ROOT / "reports/civication-by-radgiver-role-world-realism-pilot.md"
    path.write_text(content, encoding="utf-8")


def run() -> None:
    write_json("data/Civication/mailFamilies/by/job/by_radgiver_plan_realism_job.json", build_job())
    write_json("data/Civication/mailFamilies/by/event/by_radgiver_plan_realism_event.json", build_event())
    write_json("data/Civication/mailFamilies/by/knowledge/by_radgiver_plan_realism_knowledge.json", build_knowledge())
    write_json("data/Civication/mailFamilies/by/followup/by_radgiver_plan_realism_followup.json", build_followup())
    write_json("data/Civication/mailFamilies/by/consequence/by_radgiver_plan_realism_consequence.json", build_consequence())
    update_plan()
    write_test()
    write_report()
    print("By-rådgiver Role World realism pilot patched")


if __name__ == "__main__":
    run()
