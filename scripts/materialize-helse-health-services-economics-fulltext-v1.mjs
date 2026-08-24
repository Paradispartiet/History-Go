#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';import{isDeepStrictEqual}from'node:util';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ID='helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk',DIR='data/fagverk/helse/'+ID,INPUT='rehabilitation_function_full_chapter_complete_next_domain_source_brief',OUTPUT='health_services_economics_full_chapter_complete_strict_proof_next',FINAL='complete';
const P={source:'data/fag/helse/health_services_economics_source_claim_brief_v1.json',safety:'data/fag/helse/clinical_safety_contract_helse_v1.json',pensum:'data/fag/helse/helsepensum_canonical_v1.json',emners:'data/fag/helse/emner_helse_canonical_v1.json',methods:'data/fag/helse/methods_helse_canonical_v1.json',chapter:DIR+'.json',brief:DIR+'/brief.json',claims:DIR+'/claims.json',assessment:DIR+'/assessment.json',manifest:'data/fag/fag_manifest.json',inventory:'data/fagverk/subject_inventory.json',registry:'data/fagverk/fagverk_registry.json',status:'data/fagverk/subject_status.json'};
const OUTPUTS={
  "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk.json": {
    "schema": "history_go_fagverk_chapter_v1",
    "version": "1.0.0",
    "subject": "helse",
    "subject_id": "helse",
    "id": "helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk",
    "chapter_id": "helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk",
    "primary_domain_id": "helsetjenester_helseokonomi",
    "editorialStatus": "chapter_ready",
    "claimTraceRequired": true,
    "sourceFirst": true,
    "emne_ids": [
      "em_helse_helsetjenester_helseokonomi"
    ],
    "method_ids": [
      "met_helse_tjenesteanalyse",
      "met_helse_ulikhetsanalyse",
      "met_helse_evidenssyntese",
      "met_helse_populasjonsanalyse"
    ],
    "title": "Helsetjenester og helseøkonomi: organisering, kvalitet, prioritering og ressursbruk",
    "subtitle": "Fra systemfunksjoner og tilgang til finansiering, HTA, prioritering, likeverd og styringsdata",
    "lead": "Kapittelet analyserer helsetjenester og helseøkonomi på generelt systemnivå og gir aldri individuell diagnose, behandling, rettighetsavgjørelse, refusjonsråd eller budsjettinstruks for en konkret institusjon.",
    "learningObjectives": [
      "Systemfunksjoner, tjenestenivåer og primary care",
      "Tilgang, kontinuitet, integrasjon og universell dekning",
      "Kvalitet, pasientsikkerhet og ytelsesmål",
      "Finansiering: inntekter, pooling og purchasing",
      "Helseøkonomi: kostnad, effekt og mulighetskostnad",
      "HTA, prioritering og helsepakker",
      "Likeverd, finansiell beskyttelse og ulikhet",
      "Styringsdata, benchmarking og kausal tolkning"
    ],
    "diagnosticQuestions": [
      {
        "question": "Hva er riktig om primary care og primary health care?",
        "answer": "Primary care er en kjerne i førstelinjens kliniske tjenester, mens primary health care er en bredere tilnærming som også omfatter multisektorielle og samfunnsrettede komponenter. Skillet er viktig fordi klinisk førstelinjearbeid kan være sterkt samtidig som forebygging, folkehelsetiltak eller tverrsektorielle betingelser er svake, og omvendt."
      },
      {
        "question": "Hvorfor er formell tjenestedekning ikke det samme som faktisk tilgang?",
        "answer": "Universell helsedekning innebærer tilgang til nødvendige tjenester av tilstrekkelig kvalitet uten økonomisk ruin; formell dekning alene dokumenterer ikke faktisk tilgang. For analyse betyr dette at dekningsgrad må suppleres med spørsmål om behov, faktisk brukbarhet, tjenestekvalitet og økonomisk risiko for befolkningen."
      },
      {
        "question": "Hva kan en kvalitetsindikator ikke gjøre alene?",
        "answer": "En kvalitetsindikator beskriver et målt mønster, men er ikke alene en kausal forklaring på hvorfor resultatet oppstod. Kausal tolkning krever blant annet tidsrekkefølge, relevante sammenligninger, mulige confoundere og forståelse av hvordan selve målingen er konstruert."
      },
      {
        "question": "Hva er riktig om betalingsinsentiver?",
        "answer": "Betalings- og kontraktsordninger kan skape insentiver, men bestemmer ikke mekanisk profesjonell atferd eller pasientutfall. Atferdsresponsen avhenger også av profesjonsnormer, informasjon, kapasitet, regulering og hvordan flere insentiver virker sammen, og empirisk effekt må derfor måles fremfor antas."
      }
    ],
    "relatedPlaces": [
      {
        "id": "helsedirektoratet",
        "name": "Helsedirektoratet",
        "role": "Knytte norsk prioritering, kvalitetsarbeid og tjenesteorganisering til nasjonal systemkontekst uten enkeltsaksråd."
      },
      {
        "id": "folkehelseinstituttet",
        "name": "Folkehelseinstituttet",
        "role": "Knytte systemindikatorer, ulikhet, populasjonsdata og sammenligninger til metode- og folkehelsekontekst."
      },
      {
        "id": "institutt-for-helse-og-samfunn-uio",
        "name": "Institutt for helse og samfunn, Universitetet i Oslo",
        "role": "Knytte helsetjenesteforskning, helseøkonomi, prioritering og evaluering til universitetskontekst."
      }
    ],
    "workCases": [
      {
        "id": "scenario-coverage-access",
        "title": "Formell dekning uten faktisk tilgang",
        "purpose": "Analysere hypotetiske økonomiske, geografiske og organisatoriske barrierer uten å vurdere en enkeltpersons rettigheter.",
        "source_ids": [
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection",
          "hse13-oecd-health-at-glance-2025"
        ]
      },
      {
        "id": "scenario-primary-care-continuity",
        "title": "Kontinuitet på tvers av tjenestenivåer",
        "purpose": "Analysere primary-care-funksjoner, koordinering og overgang mellom nivåer uten individuell behandlingsplan.",
        "source_ids": [
          "hse04-who-phc-framework-2020",
          "hse05-who-primary-care",
          "hse01-who-hspa-2026"
        ]
      },
      {
        "id": "scenario-quality-case-mix",
        "title": "Samme indikator, ulike forklaringer",
        "purpose": "Sammenligne hypotetiske kvalitetsindikatorer med ulik case-mix og datakvalitet uten å rangere en konkret institusjon.",
        "source_ids": [
          "hse06-who-quality-services-2020",
          "hse07-quality-imperative-2019",
          "hse13-oecd-health-at-glance-2025"
        ]
      },
      {
        "id": "scenario-payment-incentive",
        "title": "Betalingsinsentiv uten mekanisk effekt",
        "purpose": "Analysere hvordan en betalingsordning kan endre insentiver uten å anta deterministisk profesjonsatferd eller pasientutfall.",
        "source_ids": [
          "hse02-who-health-financing",
          "hse01-who-hspa-2026",
          "hse03-who-uhc-2025"
        ]
      },
      {
        "id": "scenario-cea-budget-impact",
        "title": "Kostnadseffektivitet og budsjettvirkning",
        "purpose": "Skille relativ kostnadseffektivitet fra samlet budsjettvirkning i et generelt hypotetisk eksempel uten konkret innkjøpsråd.",
        "source_ids": [
          "hse10-who-health-economics",
          "hse09-who-hta-2021",
          "hse11-who-benefit-packages-2021"
        ]
      },
      {
        "id": "scenario-priority-tradeoff",
        "title": "Nytte, ressurs, alvorlighet og likeverd",
        "purpose": "Analysere en generell prioriteringsavveiing i norsk policykontekst uten individuell rettighets- eller behandlingsavgjørelse.",
        "source_ids": [
          "hse14-helsedirektoratet-prioritering",
          "hse15-helsedirektoratet-municipal-priority-2025",
          "hse11-who-benefit-packages-2021"
        ]
      }
    ],
    "moduleFiles": [
      "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/01-system-og-tilgang.json",
      "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/02-kvalitet-og-finansiering.json",
      "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/03-helseokonomi-og-prioritering.json",
      "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/04-equity-og-systemytelse.json"
    ],
    "briefFile": "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/brief.json",
    "claimsFile": "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/claims.json",
    "assessmentFile": "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/assessment.json",
    "sourceBriefFile": "data/fag/helse/health_services_economics_source_claim_brief_v1.json",
    "safetyContractFile": "data/fag/helse/clinical_safety_contract_helse_v1.json"
  },
  "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/brief.json": {
    "schema": "history_go_fagverk_chapter_brief_v1",
    "version": "1.0.0",
    "subject_id": "helse",
    "chapter_id": "helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk",
    "primary_domain_id": "helsetjenester_helseokonomi",
    "purpose": "Lære helsetjenester og helseøkonomi gjennom systemfunksjoner, tilgang, kvalitet, sikkerhet, finansiering, mulighetskostnad, HTA, prioritering, likeverd og benchmarking uten individuell helsehjelp, rettighetsavgjørelser eller institusjonsspesifikke budsjettinstrukser.",
    "sourceStrategy": {
      "sourceBriefFile": "data/fag/helse/health_services_economics_source_claim_brief_v1.json",
      "externalSourceCount": 15,
      "paragraphLevelClaimTrace": true,
      "everyPlannedClaimResolved": true,
      "allUsedSourcesInspectable": true
    },
    "requiredCriticalDistinctions": [
      "dekning vs faktisk tilgang",
      "tilgang vs kvalitet eller utfall",
      "tjenestebruk vs behov",
      "primary care vs bredere primary health care",
      "integrasjon vs organisatorisk sammenslåing",
      "flerdimensjonal kvalitet vs enkeltindikator",
      "indikator vs kausal forklaring",
      "pasientsikkerhetshendelse vs samlet systemrangering",
      "finansieringsfunksjon vs leveransemodell",
      "betalingsinsentiv vs deterministisk atferd",
      "pooling vs tjenestekvalitet",
      "finansiell beskyttelse vs null egenbetaling overalt",
      "mulighetskostnad vs bokført pris",
      "lav kostnad vs kostnadseffektivitet",
      "kostnadseffektivitet vs budsjettvirkning",
      "økonomisk modell vs automatisk beslutningsregel",
      "HTA-beslutningsstøtte vs beslutning",
      "prioritering vs billigste alternativ",
      "norske prioriteringskriterier vs universell lov",
      "effektivitet vs likeverd",
      "gruppedata vs individuell prediksjon",
      "benchmark vs kausal kontrafaktisk",
      "utgifter vs garanterte utfall"
    ],
    "safety": {
      "contractFile": "data/fag/helse/clinical_safety_contract_helse_v1.json",
      "individualDiagnosis": false,
      "individualPrognosis": false,
      "individualTriage": false,
      "individualTreatmentAdvice": false,
      "individualRiskCalculation": false,
      "individualTestOrImageInterpretation": false,
      "individualMedicationSelection": false,
      "individualDosing": false,
      "individualLegalAdvice": false,
      "individualBudgetInstruction": false,
      "individualCrisisInstruction": false
    },
    "qa": {
      "topicCoverage": "8/8",
      "plannedClaimResolution": "32/32",
      "moduleCount": 4,
      "sectionCount": 8,
      "paragraphCount": 32,
      "assessmentQuestionCount": 8
    }
  },
  "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/claims.json": {
    "schema": "history_go_fagverk_chapter_claims_v1",
    "version": "1.0.0",
    "subject_id": "helse",
    "chapter_id": "helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk",
    "sourceBriefFile": "data/fag/helse/health_services_economics_source_claim_brief_v1.json",
    "sources": [
      {
        "id": "hse01-who-hspa-2026",
        "publisher": "World Health Organization",
        "title": "Health system performance assessment: renewed global framework to guide policy-making",
        "url": "https://www.who.int/publications/b/75024",
        "type": "international-health-system-performance-framework",
        "evidence_role": "health-system-functions-performance-equity-efficiency",
        "source_location": "WHO renewed HSPA framework, 2026; system functions, performance pathways and goals.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization – Health system performance assessment: renewed global framework to guide policy-making"
      },
      {
        "id": "hse02-who-health-financing",
        "publisher": "World Health Organization",
        "title": "Health financing",
        "url": "https://www.who.int/health-topics/health-financing",
        "type": "international-health-financing-reference",
        "evidence_role": "revenue-raising-pooling-purchasing-financial-protection",
        "source_location": "WHO Health financing overview; revenue raising, pooling, purchasing, coverage and financial protection.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization – Health financing"
      },
      {
        "id": "hse03-who-uhc-2025",
        "publisher": "World Health Organization",
        "title": "Universal health coverage (UHC)",
        "url": "https://www.who.int/news-room/fact-sheets/detail/universal-health-coverage-%28uhc%29",
        "type": "international-uhc-reference",
        "evidence_role": "needed-quality-services-financial-hardship",
        "source_location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization – Universal health coverage (UHC)"
      },
      {
        "id": "hse04-who-phc-framework-2020",
        "publisher": "World Health Organization and UNICEF",
        "title": "Operational framework for primary health care: transforming vision into action",
        "url": "https://www.who.int/publications/i/item/9789240017832",
        "type": "international-primary-health-care-framework",
        "evidence_role": "integrated-services-governance-financing-workforce",
        "source_location": "WHO/UNICEF PHC Operational Framework, 2020; integrated people-centred PHC and system levers.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization and UNICEF – Operational framework for primary health care: transforming vision into action"
      },
      {
        "id": "hse05-who-primary-care",
        "publisher": "World Health Organization",
        "title": "Primary care",
        "url": "https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/primary-care",
        "type": "international-primary-care-reference",
        "evidence_role": "first-contact-continuity-coordination-comprehensiveness-person-centredness",
        "source_location": "WHO Primary care overview; five core primary-care functions and distinction from broader PHC.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization – Primary care"
      },
      {
        "id": "hse06-who-quality-services-2020",
        "publisher": "World Health Organization",
        "title": "Quality health services: a planning guide",
        "url": "https://www.who.int/publications/i/item/9789240011632/",
        "type": "international-quality-improvement-guide",
        "evidence_role": "quality-measurement-system-improvement",
        "source_location": "WHO Quality health services planning guide, 2020; system levels, measurement and improvement.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization – Quality health services: a planning guide"
      },
      {
        "id": "hse07-quality-imperative-2019",
        "publisher": "World Health Organization, OECD and World Bank",
        "title": "Delivering quality health services: a global imperative for universal health coverage",
        "url": "https://www.who.int/publications/i/item/9789241513906",
        "type": "international-quality-framework",
        "evidence_role": "effective-safe-people-centred-timely-equitable-integrated-efficient",
        "source_location": "WHO/OECD/World Bank, 2019; multidimensional quality framework.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization, OECD and World Bank – Delivering quality health services: a global imperative for universal health coverage"
      },
      {
        "id": "hse08-who-patient-safety-2021",
        "publisher": "World Health Organization",
        "title": "Global Patient Safety Action Plan 2021-2030",
        "url": "https://www.who.int/publications/i/item/9789240032705",
        "type": "international-patient-safety-strategy",
        "evidence_role": "avoidable-harm-systems-learning-governance",
        "source_location": "WHO Global Patient Safety Action Plan 2021–2030; system actions to reduce avoidable harm.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization – Global Patient Safety Action Plan 2021-2030"
      },
      {
        "id": "hse09-who-hta-2021",
        "publisher": "World Health Organization",
        "title": "Institutionalizing health technology assessment mechanisms: a how to guide",
        "url": "https://www.who.int/publications/i/item/9789240020665",
        "type": "international-hta-governance-guide",
        "evidence_role": "assessment-appraisal-coverage-priority-decision-support",
        "source_location": "WHO HTA guide, 2021; governance, assessment, appraisal and use in coverage/priority decisions.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization – Institutionalizing health technology assessment mechanisms: a how to guide"
      },
      {
        "id": "hse10-who-health-economics",
        "publisher": "World Health Organization",
        "title": "Health economics",
        "url": "https://www.who.int/health-topics/health-economics",
        "type": "international-health-economics-reference",
        "evidence_role": "costing-budget-impact-cost-effectiveness-hta-resource-allocation",
        "source_location": "WHO Health economics overview; efficiency, costing, budget impact, CEA, HTA and allocation.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization – Health economics"
      },
      {
        "id": "hse11-who-benefit-packages-2021",
        "publisher": "World Health Organization",
        "title": "Principles of health benefit packages",
        "url": "https://www.who.int/publications/i/item/9789240020689",
        "type": "international-benefit-package-priority-framework",
        "evidence_role": "transparent-priority-setting-benefit-package-equity-evidence",
        "source_location": "WHO Principles of health benefit packages, 2021; systematic evidence-based transparent priority setting.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization – Principles of health benefit packages"
      },
      {
        "id": "hse12-who-financial-protection",
        "publisher": "World Health Organization",
        "title": "Financial protection",
        "url": "https://www.who.int/health-topics/financial-protection",
        "type": "international-financial-protection-reference",
        "evidence_role": "out-of-pocket-hardship-impoverishment-coverage",
        "source_location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection.",
        "retrieval_status": "verified_2026-08-23",
        "label": "World Health Organization – Financial protection"
      },
      {
        "id": "hse13-oecd-health-at-glance-2025",
        "publisher": "OECD",
        "title": "Health at a Glance 2025: OECD Indicators",
        "url": "https://www.oecd.org/en/publications/health-at-a-glance-2025_8f9e3f98-en.html",
        "type": "international-comparative-health-system-report",
        "evidence_role": "access-quality-spending-resources-outcomes-benchmarking",
        "source_location": "OECD Health at a Glance 2025; comparative access, quality, spending, resources and outcomes indicators.",
        "retrieval_status": "verified_2026-08-23",
        "label": "OECD – Health at a Glance 2025: OECD Indicators"
      },
      {
        "id": "hse14-helsedirektoratet-prioritering",
        "publisher": "Helsedirektoratet",
        "title": "Prioritering i helse- og omsorgstjenesten",
        "url": "https://www.helsedirektoratet.no/forebygging-diagnose-og-behandling/organisering-og-tjenestetilbud/prioritering-i-helsetjenesten",
        "type": "norwegian-national-priority-reference",
        "evidence_role": "benefit-resource-severity-national-priority-context",
        "source_location": "Helsedirektoratet; norsk prioriteringskontekst med nytte-, ressurs- og alvorlighetskriteriene.",
        "retrieval_status": "verified_2026-08-23",
        "label": "Helsedirektoratet – Prioritering i helse- og omsorgstjenesten"
      },
      {
        "id": "hse15-helsedirektoratet-municipal-priority-2025",
        "publisher": "Helsedirektoratet",
        "title": "Prioriteringer i kommunale helse- og omsorgstjenester",
        "url": "https://www.helsedirektoratet.no/veiledere/prioriteringer-i-kommunale-helse-og-omsorgstjenester",
        "type": "norwegian-municipal-priority-guide",
        "evidence_role": "benefit-resource-severity-equity-local-context",
        "source_location": "Helsedirektoratet, first published 10 April 2025; combined benefit/resource/severity assessment, unequal access and local context.",
        "retrieval_status": "verified_2026-08-23",
        "label": "Helsedirektoratet – Prioriteringer i kommunale helse- og omsorgstjenester"
      }
    ],
    "claims": [
      {
        "id": "hse-c01",
        "claim": "Helsesystemer kan analyseres gjennom funksjoner som styring, finansiering, ressursgenerering og tjenesteleveranse; funksjonene er analytiske og trenger ikke være separate organisasjoner.",
        "paragraph_id": "hse-p-01",
        "topic_id": "systemfunksjoner-og-tjenestenivaer",
        "source_ids": [
          "hse01-who-hspa-2026",
          "hse04-who-phc-framework-2020",
          "hse05-who-primary-care"
        ],
        "source_locators": [
          {
            "source_id": "hse01-who-hspa-2026",
            "location": "WHO renewed HSPA framework, 2026; system functions, performance pathways and goals."
          },
          {
            "source_id": "hse04-who-phc-framework-2020",
            "location": "WHO/UNICEF PHC Operational Framework, 2020; integrated people-centred PHC and system levers."
          },
          {
            "source_id": "hse05-who-primary-care",
            "location": "WHO Primary care overview; five core primary-care functions and distinction from broader PHC."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c02",
        "claim": "Primary care er en kjerne i førstelinjens kliniske tjenester, mens primary health care er en bredere tilnærming som også omfatter multisektorielle og samfunnsrettede komponenter.",
        "paragraph_id": "hse-p-02",
        "topic_id": "systemfunksjoner-og-tjenestenivaer",
        "source_ids": [
          "hse01-who-hspa-2026",
          "hse04-who-phc-framework-2020",
          "hse05-who-primary-care"
        ],
        "source_locators": [
          {
            "source_id": "hse01-who-hspa-2026",
            "location": "WHO renewed HSPA framework, 2026; system functions, performance pathways and goals."
          },
          {
            "source_id": "hse04-who-phc-framework-2020",
            "location": "WHO/UNICEF PHC Operational Framework, 2020; integrated people-centred PHC and system levers."
          },
          {
            "source_id": "hse05-who-primary-care",
            "location": "WHO Primary care overview; five core primary-care functions and distinction from broader PHC."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c03",
        "claim": "Førstekontakt, kontinuitet, koordinering, bredde og personsentrering er sentrale primary-care-funksjoner, men én sterk funksjon garanterer ikke samlet systemytelse.",
        "paragraph_id": "hse-p-03",
        "topic_id": "systemfunksjoner-og-tjenestenivaer",
        "source_ids": [
          "hse01-who-hspa-2026",
          "hse04-who-phc-framework-2020",
          "hse05-who-primary-care"
        ],
        "source_locators": [
          {
            "source_id": "hse01-who-hspa-2026",
            "location": "WHO renewed HSPA framework, 2026; system functions, performance pathways and goals."
          },
          {
            "source_id": "hse04-who-phc-framework-2020",
            "location": "WHO/UNICEF PHC Operational Framework, 2020; integrated people-centred PHC and system levers."
          },
          {
            "source_id": "hse05-who-primary-care",
            "location": "WHO Primary care overview; five core primary-care functions and distinction from broader PHC."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c04",
        "claim": "Integrerte tjenester krever samordning av funksjoner og forløp; integrasjon er ikke synonymt med organisatorisk sammenslåing.",
        "paragraph_id": "hse-p-04",
        "topic_id": "systemfunksjoner-og-tjenestenivaer",
        "source_ids": [
          "hse01-who-hspa-2026",
          "hse04-who-phc-framework-2020",
          "hse05-who-primary-care"
        ],
        "source_locators": [
          {
            "source_id": "hse01-who-hspa-2026",
            "location": "WHO renewed HSPA framework, 2026; system functions, performance pathways and goals."
          },
          {
            "source_id": "hse04-who-phc-framework-2020",
            "location": "WHO/UNICEF PHC Operational Framework, 2020; integrated people-centred PHC and system levers."
          },
          {
            "source_id": "hse05-who-primary-care",
            "location": "WHO Primary care overview; five core primary-care functions and distinction from broader PHC."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c05",
        "claim": "Universell helsedekning innebærer tilgang til nødvendige tjenester av tilstrekkelig kvalitet uten økonomisk ruin; formell dekning alene dokumenterer ikke faktisk tilgang.",
        "paragraph_id": "hse-p-05",
        "topic_id": "tilgang-kontinuitet-integrasjon-og-uhc",
        "source_ids": [
          "hse03-who-uhc-2025",
          "hse05-who-primary-care",
          "hse12-who-financial-protection"
        ],
        "source_locators": [
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse05-who-primary-care",
            "location": "WHO Primary care overview; five core primary-care functions and distinction from broader PHC."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c06",
        "claim": "Tilgang kan begrenses av økonomi, geografi, ventetid, organisering, språk og andre barrierer selv når en tjeneste finnes.",
        "paragraph_id": "hse-p-06",
        "topic_id": "tilgang-kontinuitet-integrasjon-og-uhc",
        "source_ids": [
          "hse03-who-uhc-2025",
          "hse05-who-primary-care",
          "hse12-who-financial-protection"
        ],
        "source_locators": [
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse05-who-primary-care",
            "location": "WHO Primary care overview; five core primary-care functions and distinction from broader PHC."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c07",
        "claim": "Tjenestebruk er ikke det samme som behov; både underbruk og overbruk kan forekomme og krever kontekstuell analyse.",
        "paragraph_id": "hse-p-07",
        "topic_id": "tilgang-kontinuitet-integrasjon-og-uhc",
        "source_ids": [
          "hse03-who-uhc-2025",
          "hse05-who-primary-care",
          "hse12-who-financial-protection"
        ],
        "source_locators": [
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse05-who-primary-care",
            "location": "WHO Primary care overview; five core primary-care functions and distinction from broader PHC."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c08",
        "claim": "Overganger mellom tjenestenivåer og kontinuitetsindikatorer må tolkes i kontekst; en overgang er ikke i seg selv bevis på god eller dårlig kvalitet.",
        "paragraph_id": "hse-p-08",
        "topic_id": "tilgang-kontinuitet-integrasjon-og-uhc",
        "source_ids": [
          "hse03-who-uhc-2025",
          "hse05-who-primary-care",
          "hse12-who-financial-protection"
        ],
        "source_locators": [
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse05-who-primary-care",
            "location": "WHO Primary care overview; five core primary-care functions and distinction from broader PHC."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c09",
        "claim": "Helsetjenestekvalitet er flerdimensjonal og omfatter blant annet effekt, sikkerhet, personsentrering, rettidighet, likeverd, integrasjon og effektivitet.",
        "paragraph_id": "hse-p-09",
        "topic_id": "kvalitet-pasientsikkerhet-og-ytelsesmaal",
        "source_ids": [
          "hse06-who-quality-services-2020",
          "hse07-quality-imperative-2019",
          "hse08-who-patient-safety-2021"
        ],
        "source_locators": [
          {
            "source_id": "hse06-who-quality-services-2020",
            "location": "WHO Quality health services planning guide, 2020; system levels, measurement and improvement."
          },
          {
            "source_id": "hse07-quality-imperative-2019",
            "location": "WHO/OECD/World Bank, 2019; multidimensional quality framework."
          },
          {
            "source_id": "hse08-who-patient-safety-2021",
            "location": "WHO Global Patient Safety Action Plan 2021–2030; system actions to reduce avoidable harm."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c10",
        "claim": "Pasientsikkerhet krever systematisk forebygging og læring; én uønsket hendelse kan være alvorlig uten å være et komplett mål på hele systemets kvalitet.",
        "paragraph_id": "hse-p-10",
        "topic_id": "kvalitet-pasientsikkerhet-og-ytelsesmaal",
        "source_ids": [
          "hse06-who-quality-services-2020",
          "hse07-quality-imperative-2019",
          "hse08-who-patient-safety-2021"
        ],
        "source_locators": [
          {
            "source_id": "hse06-who-quality-services-2020",
            "location": "WHO Quality health services planning guide, 2020; system levels, measurement and improvement."
          },
          {
            "source_id": "hse07-quality-imperative-2019",
            "location": "WHO/OECD/World Bank, 2019; multidimensional quality framework."
          },
          {
            "source_id": "hse08-who-patient-safety-2021",
            "location": "WHO Global Patient Safety Action Plan 2021–2030; system actions to reduce avoidable harm."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c11",
        "claim": "Struktur-, prosess- og utfallsindikatorer belyser ulike deler av kvalitet og kan ikke uten videre erstatte hverandre.",
        "paragraph_id": "hse-p-11",
        "topic_id": "kvalitet-pasientsikkerhet-og-ytelsesmaal",
        "source_ids": [
          "hse06-who-quality-services-2020",
          "hse07-quality-imperative-2019",
          "hse08-who-patient-safety-2021"
        ],
        "source_locators": [
          {
            "source_id": "hse06-who-quality-services-2020",
            "location": "WHO Quality health services planning guide, 2020; system levels, measurement and improvement."
          },
          {
            "source_id": "hse07-quality-imperative-2019",
            "location": "WHO/OECD/World Bank, 2019; multidimensional quality framework."
          },
          {
            "source_id": "hse08-who-patient-safety-2021",
            "location": "WHO Global Patient Safety Action Plan 2021–2030; system actions to reduce avoidable harm."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c12",
        "claim": "En kvalitetsindikator beskriver et målt mønster, men er ikke alene en kausal forklaring på hvorfor resultatet oppstod.",
        "paragraph_id": "hse-p-12",
        "topic_id": "kvalitet-pasientsikkerhet-og-ytelsesmaal",
        "source_ids": [
          "hse06-who-quality-services-2020",
          "hse07-quality-imperative-2019",
          "hse08-who-patient-safety-2021"
        ],
        "source_locators": [
          {
            "source_id": "hse06-who-quality-services-2020",
            "location": "WHO Quality health services planning guide, 2020; system levels, measurement and improvement."
          },
          {
            "source_id": "hse07-quality-imperative-2019",
            "location": "WHO/OECD/World Bank, 2019; multidimensional quality framework."
          },
          {
            "source_id": "hse08-who-patient-safety-2021",
            "location": "WHO Global Patient Safety Action Plan 2021–2030; system actions to reduce avoidable harm."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c13",
        "claim": "Helsefinansiering kan deles analytisk i inntektsinnhenting, pooling av forhåndsbetalte midler og kjøp/allokering av tjenester.",
        "paragraph_id": "hse-p-13",
        "topic_id": "finansiering-inntekter-pooling-og-kjop",
        "source_ids": [
          "hse02-who-health-financing",
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection"
        ],
        "source_locators": [
          {
            "source_id": "hse02-who-health-financing",
            "location": "WHO Health financing overview; revenue raising, pooling, purchasing, coverage and financial protection."
          },
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c14",
        "claim": "Pooling kan spre finansiell risiko og muliggjøre omfordeling; graden av pooling er ikke det samme som kvaliteten på tjenestene som leveres.",
        "paragraph_id": "hse-p-14",
        "topic_id": "finansiering-inntekter-pooling-og-kjop",
        "source_ids": [
          "hse02-who-health-financing",
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection"
        ],
        "source_locators": [
          {
            "source_id": "hse02-who-health-financing",
            "location": "WHO Health financing overview; revenue raising, pooling, purchasing, coverage and financial protection."
          },
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c15",
        "claim": "Betalings- og kontraktsordninger kan skape insentiver, men bestemmer ikke mekanisk profesjonell atferd eller pasientutfall.",
        "paragraph_id": "hse-p-15",
        "topic_id": "finansiering-inntekter-pooling-og-kjop",
        "source_ids": [
          "hse02-who-health-financing",
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection"
        ],
        "source_locators": [
          {
            "source_id": "hse02-who-health-financing",
            "location": "WHO Health financing overview; revenue raising, pooling, purchasing, coverage and financial protection."
          },
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c16",
        "claim": "Finansiell beskyttelse handler om å redusere økonomiske barrierer og belastning ved nødvendig helsehjelp; den er ikke synonym med null egenbetaling for alt.",
        "paragraph_id": "hse-p-16",
        "topic_id": "finansiering-inntekter-pooling-og-kjop",
        "source_ids": [
          "hse02-who-health-financing",
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection"
        ],
        "source_locators": [
          {
            "source_id": "hse02-who-health-financing",
            "location": "WHO Health financing overview; revenue raising, pooling, purchasing, coverage and financial protection."
          },
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c17",
        "claim": "Knapphet innebærer mulighetskostnad: ressurser brukt på ett tiltak kan ikke samtidig brukes på beste alternative anvendelse.",
        "paragraph_id": "hse-p-17",
        "topic_id": "helseokonomi-kostnad-effekt-og-mulighetskostnad",
        "source_ids": [
          "hse09-who-hta-2021",
          "hse10-who-health-economics",
          "hse11-who-benefit-packages-2021"
        ],
        "source_locators": [
          {
            "source_id": "hse09-who-hta-2021",
            "location": "WHO HTA guide, 2021; governance, assessment, appraisal and use in coverage/priority decisions."
          },
          {
            "source_id": "hse10-who-health-economics",
            "location": "WHO Health economics overview; efficiency, costing, budget impact, CEA, HTA and allocation."
          },
          {
            "source_id": "hse11-who-benefit-packages-2021",
            "location": "WHO Principles of health benefit packages, 2021; systematic evidence-based transparent priority setting."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c18",
        "claim": "Kostnadseffektivitet sammenligner ressursbruk og effekt relativt til alternativer; lav kostnad alene betyr ikke høy kostnadseffektivitet.",
        "paragraph_id": "hse-p-18",
        "topic_id": "helseokonomi-kostnad-effekt-og-mulighetskostnad",
        "source_ids": [
          "hse09-who-hta-2021",
          "hse10-who-health-economics",
          "hse11-who-benefit-packages-2021"
        ],
        "source_locators": [
          {
            "source_id": "hse09-who-hta-2021",
            "location": "WHO HTA guide, 2021; governance, assessment, appraisal and use in coverage/priority decisions."
          },
          {
            "source_id": "hse10-who-health-economics",
            "location": "WHO Health economics overview; efficiency, costing, budget impact, CEA, HTA and allocation."
          },
          {
            "source_id": "hse11-who-benefit-packages-2021",
            "location": "WHO Principles of health benefit packages, 2021; systematic evidence-based transparent priority setting."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c19",
        "claim": "Et kostnadseffektivt tiltak kan ha stor samlet budsjettvirkning; budsjettpåvirkning og kostnadseffektivitet er ulike beslutningsdimensjoner.",
        "paragraph_id": "hse-p-19",
        "topic_id": "helseokonomi-kostnad-effekt-og-mulighetskostnad",
        "source_ids": [
          "hse09-who-hta-2021",
          "hse10-who-health-economics",
          "hse11-who-benefit-packages-2021"
        ],
        "source_locators": [
          {
            "source_id": "hse09-who-hta-2021",
            "location": "WHO HTA guide, 2021; governance, assessment, appraisal and use in coverage/priority decisions."
          },
          {
            "source_id": "hse10-who-health-economics",
            "location": "WHO Health economics overview; efficiency, costing, budget impact, CEA, HTA and allocation."
          },
          {
            "source_id": "hse11-who-benefit-packages-2021",
            "location": "WHO Principles of health benefit packages, 2021; systematic evidence-based transparent priority setting."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c20",
        "claim": "Økonomiske modeller bygger på antakelser, perspektiv, tidshorisont og usikkerhet; modellresultater er ikke automatiske beslutningsregler.",
        "paragraph_id": "hse-p-20",
        "topic_id": "helseokonomi-kostnad-effekt-og-mulighetskostnad",
        "source_ids": [
          "hse09-who-hta-2021",
          "hse10-who-health-economics",
          "hse11-who-benefit-packages-2021"
        ],
        "source_locators": [
          {
            "source_id": "hse09-who-hta-2021",
            "location": "WHO HTA guide, 2021; governance, assessment, appraisal and use in coverage/priority decisions."
          },
          {
            "source_id": "hse10-who-health-economics",
            "location": "WHO Health economics overview; efficiency, costing, budget impact, CEA, HTA and allocation."
          },
          {
            "source_id": "hse11-who-benefit-packages-2021",
            "location": "WHO Principles of health benefit packages, 2021; systematic evidence-based transparent priority setting."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c21",
        "claim": "HTA kan systematisere vurdering av effekt, sikkerhet, kostnader og andre konsekvenser, men erstatter ikke en legitim beslutnings- og prioriteringsprosess.",
        "paragraph_id": "hse-p-21",
        "topic_id": "hta-prioritering-og-helsepakker",
        "source_ids": [
          "hse09-who-hta-2021",
          "hse11-who-benefit-packages-2021",
          "hse14-helsedirektoratet-prioritering"
        ],
        "source_locators": [
          {
            "source_id": "hse09-who-hta-2021",
            "location": "WHO HTA guide, 2021; governance, assessment, appraisal and use in coverage/priority decisions."
          },
          {
            "source_id": "hse11-who-benefit-packages-2021",
            "location": "WHO Principles of health benefit packages, 2021; systematic evidence-based transparent priority setting."
          },
          {
            "source_id": "hse14-helsedirektoratet-prioritering",
            "location": "Helsedirektoratet; norsk prioriteringskontekst med nytte-, ressurs- og alvorlighetskriteriene."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c22",
        "claim": "Helsepakker gjør prioritering eksplisitt: ingen systemer kan tilby alle mulige tjenester til alle, og transparente prosesser kan redusere vilkårlig eller skjult rasjonering.",
        "paragraph_id": "hse-p-22",
        "topic_id": "hta-prioritering-og-helsepakker",
        "source_ids": [
          "hse09-who-hta-2021",
          "hse11-who-benefit-packages-2021",
          "hse14-helsedirektoratet-prioritering"
        ],
        "source_locators": [
          {
            "source_id": "hse09-who-hta-2021",
            "location": "WHO HTA guide, 2021; governance, assessment, appraisal and use in coverage/priority decisions."
          },
          {
            "source_id": "hse11-who-benefit-packages-2021",
            "location": "WHO Principles of health benefit packages, 2021; systematic evidence-based transparent priority setting."
          },
          {
            "source_id": "hse14-helsedirektoratet-prioritering",
            "location": "Helsedirektoratet; norsk prioriteringskontekst med nytte-, ressurs- og alvorlighetskriteriene."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c23",
        "claim": "I norsk helse- og omsorgstjeneste inngår nytte, ressurs og alvorlighet som prioriteringskriterier; dette er nasjonal normativ kontekst, ikke universell naturregel.",
        "paragraph_id": "hse-p-23",
        "topic_id": "hta-prioritering-og-helsepakker",
        "source_ids": [
          "hse11-who-benefit-packages-2021",
          "hse14-helsedirektoratet-prioritering",
          "hse15-helsedirektoratet-municipal-priority-2025"
        ],
        "source_locators": [
          {
            "source_id": "hse11-who-benefit-packages-2021",
            "location": "WHO Principles of health benefit packages, 2021; systematic evidence-based transparent priority setting."
          },
          {
            "source_id": "hse14-helsedirektoratet-prioritering",
            "location": "Helsedirektoratet; norsk prioriteringskontekst med nytte-, ressurs- og alvorlighetskriteriene."
          },
          {
            "source_id": "hse15-helsedirektoratet-municipal-priority-2025",
            "location": "Helsedirektoratet, first published 10 April 2025; combined benefit/resource/severity assessment, unequal access and local context."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c24",
        "claim": "Prioritering er ikke det samme som å velge billigst; forventet nytte, ressursbruk, alvorlighet, likeverd og kontekst kan inngå i samlet vurdering.",
        "paragraph_id": "hse-p-24",
        "topic_id": "hta-prioritering-og-helsepakker",
        "source_ids": [
          "hse11-who-benefit-packages-2021",
          "hse14-helsedirektoratet-prioritering",
          "hse15-helsedirektoratet-municipal-priority-2025"
        ],
        "source_locators": [
          {
            "source_id": "hse11-who-benefit-packages-2021",
            "location": "WHO Principles of health benefit packages, 2021; systematic evidence-based transparent priority setting."
          },
          {
            "source_id": "hse14-helsedirektoratet-prioritering",
            "location": "Helsedirektoratet; norsk prioriteringskontekst med nytte-, ressurs- og alvorlighetskriteriene."
          },
          {
            "source_id": "hse15-helsedirektoratet-municipal-priority-2025",
            "location": "Helsedirektoratet, first published 10 April 2025; combined benefit/resource/severity assessment, unequal access and local context."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c25",
        "claim": "Likeverd krever analyse av hvem som får tilgang, hvilken kvalitet de mottar og hvilke utfall som oppnås, ikke bare gjennomsnitt for hele befolkningen.",
        "paragraph_id": "hse-p-25",
        "topic_id": "equity-finansiell-beskyttelse-og-ulikhet",
        "source_ids": [
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection",
          "hse13-oecd-health-at-glance-2025"
        ],
        "source_locators": [
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          },
          {
            "source_id": "hse13-oecd-health-at-glance-2025",
            "location": "OECD Health at a Glance 2025; comparative access, quality, spending, resources and outcomes indicators."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c26",
        "claim": "Finansiell belastning fra egenbetaling kan være sosialt skjevt fordelt; økonomisk tilgang er derfor en egen dimensjon av universell dekning.",
        "paragraph_id": "hse-p-26",
        "topic_id": "equity-finansiell-beskyttelse-og-ulikhet",
        "source_ids": [
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection",
          "hse13-oecd-health-at-glance-2025"
        ],
        "source_locators": [
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          },
          {
            "source_id": "hse13-oecd-health-at-glance-2025",
            "location": "OECD Health at a Glance 2025; comparative access, quality, spending, resources and outcomes indicators."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c27",
        "claim": "Forskjeller mellom befolkningsgrupper er gruppedata og kan ikke brukes som sikker prediksjon om enkeltpersoners behov, bruk eller utfall.",
        "paragraph_id": "hse-p-27",
        "topic_id": "equity-finansiell-beskyttelse-og-ulikhet",
        "source_ids": [
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection",
          "hse13-oecd-health-at-glance-2025"
        ],
        "source_locators": [
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          },
          {
            "source_id": "hse13-oecd-health-at-glance-2025",
            "location": "OECD Health at a Glance 2025; comparative access, quality, spending, resources and outcomes indicators."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c28",
        "claim": "Effektivitet og likeverd kan støtte hverandre, men er ikke identiske mål; aggregert effektivitet kan kreve separat vurdering av fordeling.",
        "paragraph_id": "hse-p-28",
        "topic_id": "equity-finansiell-beskyttelse-og-ulikhet",
        "source_ids": [
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection",
          "hse15-helsedirektoratet-municipal-priority-2025"
        ],
        "source_locators": [
          {
            "source_id": "hse03-who-uhc-2025",
            "location": "WHO UHC fact sheet, 2025; needed quality services without financial hardship."
          },
          {
            "source_id": "hse12-who-financial-protection",
            "location": "WHO Financial protection overview; out-of-pocket payment, hardship and UHC financial protection."
          },
          {
            "source_id": "hse15-helsedirektoratet-municipal-priority-2025",
            "location": "Helsedirektoratet, first published 10 April 2025; combined benefit/resource/severity assessment, unequal access and local context."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c29",
        "claim": "Sammenlignbare indikatorer kan avdekke mønstre i tilgang, kvalitet, ressursbruk og utfall, men definisjoner, datakvalitet og case-mix påvirker tolkningen.",
        "paragraph_id": "hse-p-29",
        "topic_id": "styringsdata-benchmarking-og-kausal-tolkning",
        "source_ids": [
          "hse01-who-hspa-2026",
          "hse06-who-quality-services-2020",
          "hse13-oecd-health-at-glance-2025"
        ],
        "source_locators": [
          {
            "source_id": "hse01-who-hspa-2026",
            "location": "WHO renewed HSPA framework, 2026; system functions, performance pathways and goals."
          },
          {
            "source_id": "hse06-who-quality-services-2020",
            "location": "WHO Quality health services planning guide, 2020; system levels, measurement and improvement."
          },
          {
            "source_id": "hse13-oecd-health-at-glance-2025",
            "location": "OECD Health at a Glance 2025; comparative access, quality, spending, resources and outcomes indicators."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c30",
        "claim": "Mer helseutgifter garanterer ikke bedre helseutfall; nivå, sammensetning, priser, behov, organisering og effektivitet påvirker forholdet mellom ressursbruk og resultater.",
        "paragraph_id": "hse-p-30",
        "topic_id": "styringsdata-benchmarking-og-kausal-tolkning",
        "source_ids": [
          "hse01-who-hspa-2026",
          "hse06-who-quality-services-2020",
          "hse13-oecd-health-at-glance-2025"
        ],
        "source_locators": [
          {
            "source_id": "hse01-who-hspa-2026",
            "location": "WHO renewed HSPA framework, 2026; system functions, performance pathways and goals."
          },
          {
            "source_id": "hse06-who-quality-services-2020",
            "location": "WHO Quality health services planning guide, 2020; system levels, measurement and improvement."
          },
          {
            "source_id": "hse13-oecd-health-at-glance-2025",
            "location": "OECD Health at a Glance 2025; comparative access, quality, spending, resources and outcomes indicators."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c31",
        "claim": "Et land- eller regionsnitt er et benchmark, ikke en kausal kontrafaktisk; forskjeller mellom systemer kan skyldes mange samtidige faktorer.",
        "paragraph_id": "hse-p-31",
        "topic_id": "styringsdata-benchmarking-og-kausal-tolkning",
        "source_ids": [
          "hse01-who-hspa-2026",
          "hse06-who-quality-services-2020",
          "hse13-oecd-health-at-glance-2025"
        ],
        "source_locators": [
          {
            "source_id": "hse01-who-hspa-2026",
            "location": "WHO renewed HSPA framework, 2026; system functions, performance pathways and goals."
          },
          {
            "source_id": "hse06-who-quality-services-2020",
            "location": "WHO Quality health services planning guide, 2020; system levels, measurement and improvement."
          },
          {
            "source_id": "hse13-oecd-health-at-glance-2025",
            "location": "OECD Health at a Glance 2025; comparative access, quality, spending, resources and outcomes indicators."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      },
      {
        "id": "hse-c32",
        "claim": "Styringsdata bør brukes til læring, prioritering og forbedring sammen med faglig og kontekstuell kunnskap; én rangering eller indikator bør ikke alene avgjøre systemkvalitet.",
        "paragraph_id": "hse-p-32",
        "topic_id": "styringsdata-benchmarking-og-kausal-tolkning",
        "source_ids": [
          "hse01-who-hspa-2026",
          "hse06-who-quality-services-2020",
          "hse13-oecd-health-at-glance-2025"
        ],
        "source_locators": [
          {
            "source_id": "hse01-who-hspa-2026",
            "location": "WHO renewed HSPA framework, 2026; system functions, performance pathways and goals."
          },
          {
            "source_id": "hse06-who-quality-services-2020",
            "location": "WHO Quality health services planning guide, 2020; system levels, measurement and improvement."
          },
          {
            "source_id": "hse13-oecd-health-at-glance-2025",
            "location": "OECD Health at a Glance 2025; comparative access, quality, spending, resources and outcomes indicators."
          }
        ],
        "classification": "verified_general_health_services_economics_synthesis",
        "status": "verified",
        "verified_at": "2026-08-23"
      }
    ]
  },
  "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/assessment.json": {
    "schema": "history_go_fagverk_health_chapter_assessment_v1",
    "version": "1.0.0",
    "subject_id": "helse",
    "chapter_id": "helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk",
    "status": "audited",
    "questions": [
      {
        "id": "helse-hse-q01",
        "question": "Hva er riktig om primary care og primary health care?",
        "options": [
          "De er identiske begreper",
          "Primary care er en klinisk kjerne, mens PHC er en bredere system- og samfunnstilnærming",
          "PHC betyr bare sykehusbehandling",
          "Primary care omfatter alltid alle sektorer"
        ],
        "answer": "Primary care er en klinisk kjerne, mens PHC er en bredere system- og samfunnstilnærming",
        "answerIndex": 1,
        "question_type": "analysis",
        "difficulty": "medium",
        "emne_id": "em_helse_helsetjenester_helseokonomi",
        "claim_id": "hse-c02",
        "source": [
          "hse01-who-hspa-2026",
          "hse04-who-phc-framework-2020",
          "hse05-who-primary-care"
        ],
        "knowledge": "Primary care er en kjerne i førstelinjens kliniske tjenester, mens primary health care er en bredere tilnærming som også omfatter multisektorielle og samfunnsrettede komponenter. Skillet er viktig fordi klinisk førstelinjearbeid kan være sterkt samtidig som forebygging, folkehelsetiltak eller tverrsektorielle betingelser er svake, og omvendt.",
        "safety_mode": "general_non_individualizing"
      },
      {
        "id": "helse-hse-q02",
        "question": "Hvorfor er formell tjenestedekning ikke det samme som faktisk tilgang?",
        "options": [
          "Fordi dekning aldri kan måles",
          "Fordi barrierer, kvalitet, behov og økonomisk belastning fortsatt kan hindre reell bruk",
          "Fordi tilgang bare handler om geografi",
          "Fordi UHC ikke omfatter kvalitet"
        ],
        "answer": "Fordi barrierer, kvalitet, behov og økonomisk belastning fortsatt kan hindre reell bruk",
        "answerIndex": 1,
        "question_type": "analysis",
        "difficulty": "medium",
        "emne_id": "em_helse_helsetjenester_helseokonomi",
        "claim_id": "hse-c05",
        "source": [
          "hse03-who-uhc-2025",
          "hse05-who-primary-care",
          "hse12-who-financial-protection"
        ],
        "knowledge": "Universell helsedekning innebærer tilgang til nødvendige tjenester av tilstrekkelig kvalitet uten økonomisk ruin; formell dekning alene dokumenterer ikke faktisk tilgang. For analyse betyr dette at dekningsgrad må suppleres med spørsmål om behov, faktisk brukbarhet, tjenestekvalitet og økonomisk risiko for befolkningen.",
        "safety_mode": "general_non_individualizing"
      },
      {
        "id": "helse-hse-q03",
        "question": "Hva kan en kvalitetsindikator ikke gjøre alene?",
        "options": [
          "Beskrive et mønster",
          "Støtte forbedringsarbeid",
          "Bevise den kausale forklaringen på resultatet",
          "Sammenlignes med en definert referanse"
        ],
        "answer": "Bevise den kausale forklaringen på resultatet",
        "answerIndex": 2,
        "question_type": "analysis",
        "difficulty": "medium",
        "emne_id": "em_helse_helsetjenester_helseokonomi",
        "claim_id": "hse-c12",
        "source": [
          "hse06-who-quality-services-2020",
          "hse07-quality-imperative-2019",
          "hse08-who-patient-safety-2021"
        ],
        "knowledge": "En kvalitetsindikator beskriver et målt mønster, men er ikke alene en kausal forklaring på hvorfor resultatet oppstod. Kausal tolkning krever blant annet tidsrekkefølge, relevante sammenligninger, mulige confoundere og forståelse av hvordan selve målingen er konstruert.",
        "safety_mode": "general_non_individualizing"
      },
      {
        "id": "helse-hse-q04",
        "question": "Hva er riktig om betalingsinsentiver?",
        "options": [
          "De bestemmer klinisk atferd mekanisk",
          "De kan påvirke atferd, men effekten avhenger av flere forhold og må undersøkes empirisk",
          "De har aldri effekt",
          "De bestemmer pasientutfall direkte"
        ],
        "answer": "De kan påvirke atferd, men effekten avhenger av flere forhold og må undersøkes empirisk",
        "answerIndex": 1,
        "question_type": "analysis",
        "difficulty": "hard",
        "emne_id": "em_helse_helsetjenester_helseokonomi",
        "claim_id": "hse-c15",
        "source": [
          "hse02-who-health-financing",
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection"
        ],
        "knowledge": "Betalings- og kontraktsordninger kan skape insentiver, men bestemmer ikke mekanisk profesjonell atferd eller pasientutfall. Atferdsresponsen avhenger også av profesjonsnormer, informasjon, kapasitet, regulering og hvordan flere insentiver virker sammen, og empirisk effekt må derfor måles fremfor antas.",
        "safety_mode": "general_non_individualizing"
      },
      {
        "id": "helse-hse-q05",
        "question": "Hva skiller kostnadseffektivitet fra budsjettvirkning?",
        "options": [
          "Ingenting",
          "Kostnadseffektivitet er relativ verdi per ressurs, mens budsjettvirkning gjelder samlet finansieringsbelastning",
          "Budsjettvirkning måler bare effekt",
          "Kostnadseffektivitet er alltid lav kostnad"
        ],
        "answer": "Kostnadseffektivitet er relativ verdi per ressurs, mens budsjettvirkning gjelder samlet finansieringsbelastning",
        "answerIndex": 1,
        "question_type": "analysis",
        "difficulty": "hard",
        "emne_id": "em_helse_helsetjenester_helseokonomi",
        "claim_id": "hse-c19",
        "source": [
          "hse09-who-hta-2021",
          "hse10-who-health-economics",
          "hse11-who-benefit-packages-2021"
        ],
        "knowledge": "Et kostnadseffektivt tiltak kan ha stor samlet budsjettvirkning; budsjettpåvirkning og kostnadseffektivitet er ulike beslutningsdimensjoner. Dette skillet er sentralt fordi beslutningstakere både må vurdere verdi per ressursenhet og om den totale innføringen faktisk kan finansieres innen tilgjengelig budsjett.",
        "safety_mode": "general_non_individualizing"
      },
      {
        "id": "helse-hse-q06",
        "question": "Hva er en viktig grense for HTA?",
        "options": [
          "HTA erstatter politiske og legitime prioriteringsprosesser",
          "HTA gir beslutningsstøtte, men erstatter ikke appraisal og legitim beslutning",
          "HTA vurderer bare pris",
          "HTA avgjør individuelle behandlingsrettigheter"
        ],
        "answer": "HTA gir beslutningsstøtte, men erstatter ikke appraisal og legitim beslutning",
        "answerIndex": 1,
        "question_type": "analysis",
        "difficulty": "hard",
        "emne_id": "em_helse_helsetjenester_helseokonomi",
        "claim_id": "hse-c21",
        "source": [
          "hse09-who-hta-2021",
          "hse11-who-benefit-packages-2021",
          "hse14-helsedirektoratet-prioritering"
        ],
        "knowledge": "HTA kan systematisere vurdering av effekt, sikkerhet, kostnader og andre konsekvenser, men erstatter ikke en legitim beslutnings- og prioriteringsprosess. En robust prosess skiller mellom teknisk assessment og normativ eller institusjonell appraisal, slik at evidensgrunnlaget er synlig samtidig som verdier og legitime kriterier behandles eksplisitt.",
        "safety_mode": "general_non_individualizing"
      },
      {
        "id": "helse-hse-q07",
        "question": "Hvorfor er prioritering ikke det samme som å velge billigst?",
        "options": [
          "Fordi pris aldri er relevant",
          "Fordi nytte, ressurs, alvorlighet, likeverd og kontekst kan inngå i samlet vurdering",
          "Fordi bare alvorlighet teller",
          "Fordi prioritering ikke bruker evidens"
        ],
        "answer": "Fordi nytte, ressurs, alvorlighet, likeverd og kontekst kan inngå i samlet vurdering",
        "answerIndex": 1,
        "question_type": "analysis",
        "difficulty": "hard",
        "emne_id": "em_helse_helsetjenester_helseokonomi",
        "claim_id": "hse-c24",
        "source": [
          "hse11-who-benefit-packages-2021",
          "hse14-helsedirektoratet-prioritering",
          "hse15-helsedirektoratet-municipal-priority-2025"
        ],
        "knowledge": "Prioritering er ikke det samme som å velge billigst; forventet nytte, ressursbruk, alvorlighet, likeverd og kontekst kan inngå i samlet vurdering. Den faglige oppgaven er å gjøre avveiningene etterprøvbare og begrunne hvordan kriterier er veid, ikke å redusere prioritering til én pris, én rangering eller ett terskeltall.",
        "safety_mode": "general_non_individualizing"
      },
      {
        "id": "helse-hse-q08",
        "question": "Hva er riktig om benchmarking mellom helsesystemer?",
        "options": [
          "Et benchmark er en kausal kontrafaktisk",
          "Forskjeller beviser hvilken reform som virker",
          "Benchmarking kan identifisere mønstre, men flere samtidige faktorer kan forklare forskjellene",
          "Case-mix er irrelevant"
        ],
        "answer": "Benchmarking kan identifisere mønstre, men flere samtidige faktorer kan forklare forskjellene",
        "answerIndex": 2,
        "question_type": "analysis",
        "difficulty": "hard",
        "emne_id": "em_helse_helsetjenester_helseokonomi",
        "claim_id": "hse-c31",
        "source": [
          "hse01-who-hspa-2026",
          "hse06-who-quality-services-2020",
          "hse13-oecd-health-at-glance-2025"
        ],
        "knowledge": "Et land- eller regionsnitt er et benchmark, ikke en kausal kontrafaktisk; forskjeller mellom systemer kan skyldes mange samtidige faktorer. Benchmarking er best brukt til å formulere nye spørsmål og identifisere avvik som fortjener analyse; det etablerer ikke hva samme system ville oppnådd under en alternativ organisering.",
        "safety_mode": "general_non_individualizing"
      }
    ]
  },
  "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/01-system-og-tilgang.json": {
    "schema": "history_go_fagverk_health_module_v1",
    "version": "1.0.0",
    "id": "01-system-og-tilgang",
    "title": "System, tjenestenivåer og tilgang",
    "sections": [
      {
        "id": "hse-systemfunksjoner-og-tjenestenivaer",
        "title": "Systemfunksjoner, tjenestenivåer og primary care",
        "topic_id": "systemfunksjoner-og-tjenestenivaer",
        "emne_ids": [
          "em_helse_helsetjenester_helseokonomi"
        ],
        "method_ids": [
          "met_helse_tjenesteanalyse"
        ],
        "boundary": "Analytiske systemfunksjoner skilles fra konkrete organisasjonskart og fra individuell behandling.",
        "paragraphIds": [
          "hse-p-01",
          "hse-p-02",
          "hse-p-03",
          "hse-p-04"
        ],
        "paragraphs": [
          "Helsesystemer kan analyseres gjennom funksjoner som styring, finansiering, ressursgenerering og tjenesteleveranse; funksjonene er analytiske og trenger ikke være separate organisasjoner. Denne funksjonsinndelingen gjør det mulig å undersøke hvor i systemet en flaskehals oppstår uten å anta at én etat eller ett organisatorisk nivå alene eier årsaken.",
          "Primary care er en kjerne i førstelinjens kliniske tjenester, mens primary health care er en bredere tilnærming som også omfatter multisektorielle og samfunnsrettede komponenter. Skillet er viktig fordi klinisk førstelinjearbeid kan være sterkt samtidig som forebygging, folkehelsetiltak eller tverrsektorielle betingelser er svake, og omvendt.",
          "Førstekontakt, kontinuitet, koordinering, bredde og personsentrering er sentrale primary-care-funksjoner, men én sterk funksjon garanterer ikke samlet systemytelse. Ved vurdering av systemytelse må funksjonene derfor sees i sammenheng: god tilgjengelighet uten kontinuitet eller koordinering kan fortsatt gi fragmenterte forløp.",
          "Integrerte tjenester krever samordning av funksjoner og forløp; integrasjon er ikke synonymt med organisatorisk sammenslåing. Samordning kan skje gjennom delte standarder, informasjonsflyt, ansvarsoverføring og koordinerte forløp selv når organisasjonene fortsatt er juridisk og administrativt separate."
        ],
        "paragraphClaimIds": [
          [
            "hse-c01"
          ],
          [
            "hse-c02"
          ],
          [
            "hse-c03"
          ],
          [
            "hse-c04"
          ]
        ],
        "keyPoints": [
          "Helsesystemer kan analyseres gjennom funksjoner som styring, finansiering, ressursgenerering og tjenesteleveranse; funksjonene er analytiske og trenger ikke være separate organisasjoner.",
          "Integrerte tjenester krever samordning av funksjoner og forløp; integrasjon er ikke synonymt med organisatorisk sammenslåing."
        ],
        "keyPointClaimIds": [
          [
            "hse-c01"
          ],
          [
            "hse-c04"
          ]
        ],
        "source_ids": [
          "hse01-who-hspa-2026",
          "hse04-who-phc-framework-2020",
          "hse05-who-primary-care"
        ]
      },
      {
        "id": "hse-tilgang-kontinuitet-integrasjon-og-uhc",
        "title": "Tilgang, kontinuitet, integrasjon og universell dekning",
        "topic_id": "tilgang-kontinuitet-integrasjon-og-uhc",
        "emne_ids": [
          "em_helse_helsetjenester_helseokonomi"
        ],
        "method_ids": [
          "met_helse_tjenesteanalyse",
          "met_helse_ulikhetsanalyse"
        ],
        "boundary": "Formell dekning, faktisk tilgang, bruk, kontinuitet og utfall holdes analytisk adskilt.",
        "paragraphIds": [
          "hse-p-05",
          "hse-p-06",
          "hse-p-07",
          "hse-p-08"
        ],
        "paragraphs": [
          "Universell helsedekning innebærer tilgang til nødvendige tjenester av tilstrekkelig kvalitet uten økonomisk ruin; formell dekning alene dokumenterer ikke faktisk tilgang. For analyse betyr dette at dekningsgrad må suppleres med spørsmål om behov, faktisk brukbarhet, tjenestekvalitet og økonomisk risiko for befolkningen.",
          "Tilgang kan begrenses av økonomi, geografi, ventetid, organisering, språk og andre barrierer selv når en tjeneste finnes. Barrierene kan virke samtidig og ulikt mellom grupper, slik at et gjennomsnittlig tilgjengelighetstall kan skjule betydelige fordelingsproblemer.",
          "Tjenestebruk er ikke det samme som behov; både underbruk og overbruk kan forekomme og krever kontekstuell analyse. Lav bruk kan skyldes lavt behov, men også barrierer; høy bruk kan avspeile stort behov, god tilgang eller uønsket overbruk, og dataene må derfor tolkes mot klinisk og sosial kontekst.",
          "Overganger mellom tjenestenivåer og kontinuitetsindikatorer må tolkes i kontekst; en overgang er ikke i seg selv bevis på god eller dårlig kvalitet. Overgangsdata bør kobles til hva som skjedde før og etter overføringen, om nødvendig informasjon fulgte med og om ansvar og oppfølging var tydelige."
        ],
        "paragraphClaimIds": [
          [
            "hse-c05"
          ],
          [
            "hse-c06"
          ],
          [
            "hse-c07"
          ],
          [
            "hse-c08"
          ]
        ],
        "keyPoints": [
          "Universell helsedekning innebærer tilgang til nødvendige tjenester av tilstrekkelig kvalitet uten økonomisk ruin; formell dekning alene dokumenterer ikke faktisk tilgang.",
          "Overganger mellom tjenestenivåer og kontinuitetsindikatorer må tolkes i kontekst; en overgang er ikke i seg selv bevis på god eller dårlig kvalitet."
        ],
        "keyPointClaimIds": [
          [
            "hse-c05"
          ],
          [
            "hse-c08"
          ]
        ],
        "source_ids": [
          "hse03-who-uhc-2025",
          "hse05-who-primary-care",
          "hse12-who-financial-protection"
        ]
      }
    ]
  },
  "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/02-kvalitet-og-finansiering.json": {
    "schema": "history_go_fagverk_health_module_v1",
    "version": "1.0.0",
    "id": "02-kvalitet-og-finansiering",
    "title": "Kvalitet, sikkerhet og finansiering",
    "sections": [
      {
        "id": "hse-kvalitet-pasientsikkerhet-og-ytelsesmaal",
        "title": "Kvalitet, pasientsikkerhet og ytelsesmål",
        "topic_id": "kvalitet-pasientsikkerhet-og-ytelsesmaal",
        "emne_ids": [
          "em_helse_helsetjenester_helseokonomi"
        ],
        "method_ids": [
          "met_helse_tjenesteanalyse",
          "met_helse_populasjonsanalyse"
        ],
        "boundary": "Kvalitet behandles flerdimensjonalt; indikatorer og enkelthendelser blir ikke kausale totaldommer.",
        "paragraphIds": [
          "hse-p-09",
          "hse-p-10",
          "hse-p-11",
          "hse-p-12"
        ],
        "paragraphs": [
          "Helsetjenestekvalitet er flerdimensjonal og omfatter blant annet effekt, sikkerhet, personsentrering, rettidighet, likeverd, integrasjon og effektivitet. Dimensjonene kan trekke i ulike retninger, og en tjeneste som er effektiv på ett mål kan samtidig ha problemer med sikkerhet, rettidighet eller likeverd.",
          "Pasientsikkerhet krever systematisk forebygging og læring; én uønsket hendelse kan være alvorlig uten å være et komplett mål på hele systemets kvalitet. Sikkerhetsarbeid bruker derfor hendelser som signaler for læring, mønstergjenkjenning og systemforbedring fremfor som isolerte bevis på samlet organisatorisk kvalitet.",
          "Struktur-, prosess- og utfallsindikatorer belyser ulike deler av kvalitet og kan ikke uten videre erstatte hverandre. For eksempel kan en ressurs eller struktur legge til rette for god praksis uten å bevise at praksisen faktisk utføres, mens et utfall påvirkes av både prosess, pasientmiks og forhold utenfor tjenesten.",
          "En kvalitetsindikator beskriver et målt mønster, men er ikke alene en kausal forklaring på hvorfor resultatet oppstod. Kausal tolkning krever blant annet tidsrekkefølge, relevante sammenligninger, mulige confoundere og forståelse av hvordan selve målingen er konstruert."
        ],
        "paragraphClaimIds": [
          [
            "hse-c09"
          ],
          [
            "hse-c10"
          ],
          [
            "hse-c11"
          ],
          [
            "hse-c12"
          ]
        ],
        "keyPoints": [
          "Helsetjenestekvalitet er flerdimensjonal og omfatter blant annet effekt, sikkerhet, personsentrering, rettidighet, likeverd, integrasjon og effektivitet.",
          "En kvalitetsindikator beskriver et målt mønster, men er ikke alene en kausal forklaring på hvorfor resultatet oppstod."
        ],
        "keyPointClaimIds": [
          [
            "hse-c09"
          ],
          [
            "hse-c12"
          ]
        ],
        "source_ids": [
          "hse06-who-quality-services-2020",
          "hse07-quality-imperative-2019",
          "hse08-who-patient-safety-2021"
        ]
      },
      {
        "id": "hse-finansiering-inntekter-pooling-og-kjop",
        "title": "Finansiering: inntekter, pooling og purchasing",
        "topic_id": "finansiering-inntekter-pooling-og-kjop",
        "emne_ids": [
          "em_helse_helsetjenester_helseokonomi"
        ],
        "method_ids": [
          "met_helse_tjenesteanalyse"
        ],
        "boundary": "Finansieringsfunksjoner og leveransemodeller holdes adskilt; insentiver behandles som påvirkning, ikke determinisme.",
        "paragraphIds": [
          "hse-p-13",
          "hse-p-14",
          "hse-p-15",
          "hse-p-16"
        ],
        "paragraphs": [
          "Helsefinansiering kan deles analytisk i inntektsinnhenting, pooling av forhåndsbetalte midler og kjøp/allokering av tjenester. Funksjonene påvirker hverandre: hvordan penger samles inn og pooles bestemmer hvilke midler som kan kjøpes tjenester for, mens purchasing bestemmer hvilke leverandør- og aktivitetsinsentiver som skapes.",
          "Pooling kan spre finansiell risiko og muliggjøre omfordeling; graden av pooling er ikke det samme som kvaliteten på tjenestene som leveres. Risiko- og ressursdeling kan redusere koblingen mellom den enkeltes betalingsevne og tilgang til helsehjelp, men sier lite alene om bemanning, sikkerhet eller klinisk kvalitet.",
          "Betalings- og kontraktsordninger kan skape insentiver, men bestemmer ikke mekanisk profesjonell atferd eller pasientutfall. Atferdsresponsen avhenger også av profesjonsnormer, informasjon, kapasitet, regulering og hvordan flere insentiver virker sammen, og empirisk effekt må derfor måles fremfor antas.",
          "Finansiell beskyttelse handler om å redusere økonomiske barrierer og belastning ved nødvendig helsehjelp; den er ikke synonym med null egenbetaling for alt. Systemer kan bruke ulike kombinasjoner av skatter, forsikring og egenbetaling; vurderingen av finansiell beskyttelse handler om om betaling hindrer nødvendig bruk eller skaper urimelig økonomisk belastning."
        ],
        "paragraphClaimIds": [
          [
            "hse-c13"
          ],
          [
            "hse-c14"
          ],
          [
            "hse-c15"
          ],
          [
            "hse-c16"
          ]
        ],
        "keyPoints": [
          "Helsefinansiering kan deles analytisk i inntektsinnhenting, pooling av forhåndsbetalte midler og kjøp/allokering av tjenester.",
          "Finansiell beskyttelse handler om å redusere økonomiske barrierer og belastning ved nødvendig helsehjelp; den er ikke synonym med null egenbetaling for alt."
        ],
        "keyPointClaimIds": [
          [
            "hse-c13"
          ],
          [
            "hse-c16"
          ]
        ],
        "source_ids": [
          "hse02-who-health-financing",
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection"
        ]
      }
    ]
  },
  "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/03-helseokonomi-og-prioritering.json": {
    "schema": "history_go_fagverk_health_module_v1",
    "version": "1.0.0",
    "id": "03-helseokonomi-og-prioritering",
    "title": "Helseøkonomi, HTA og prioritering",
    "sections": [
      {
        "id": "hse-helseokonomi-kostnad-effekt-og-mulighetskostnad",
        "title": "Helseøkonomi: kostnad, effekt og mulighetskostnad",
        "topic_id": "helseokonomi-kostnad-effekt-og-mulighetskostnad",
        "emne_ids": [
          "em_helse_helsetjenester_helseokonomi"
        ],
        "method_ids": [
          "met_helse_tjenesteanalyse",
          "met_helse_evidenssyntese"
        ],
        "boundary": "Økonomiske mål brukes som beslutningsinformasjon, ikke som individuelle behandlingsråd eller universelle terskler.",
        "paragraphIds": [
          "hse-p-17",
          "hse-p-18",
          "hse-p-19",
          "hse-p-20"
        ],
        "paragraphs": [
          "Knapphet innebærer mulighetskostnad: ressurser brukt på ett tiltak kan ikke samtidig brukes på beste alternative anvendelse. Mulighetskostnaden er dermed ikke bare bokført pris, men verdien av den beste helsen eller tjenesten som kunne vært oppnådd med de samme knappe ressursene i et realistisk alternativ.",
          "Kostnadseffektivitet sammenligner ressursbruk og effekt relativt til alternativer; lav kostnad alene betyr ikke høy kostnadseffektivitet. Et billig tiltak med svært liten effekt kan være mindre kostnadseffektivt enn et dyrere tiltak med stor merverdi, og sammenligningen må alltid angi relevant alternativ.",
          "Et kostnadseffektivt tiltak kan ha stor samlet budsjettvirkning; budsjettpåvirkning og kostnadseffektivitet er ulike beslutningsdimensjoner. Dette skillet er sentralt fordi beslutningstakere både må vurdere verdi per ressursenhet og om den totale innføringen faktisk kan finansieres innen tilgjengelig budsjett.",
          "Økonomiske modeller bygger på antakelser, perspektiv, tidshorisont og usikkerhet; modellresultater er ikke automatiske beslutningsregler. Resultater bør derfor ledsages av sensitivitets- og usikkerhetsanalyse og tydelig angivelse av hvilke kostnader, effekter og fordelingshensyn modellen inkluderer eller utelater."
        ],
        "paragraphClaimIds": [
          [
            "hse-c17"
          ],
          [
            "hse-c18"
          ],
          [
            "hse-c19"
          ],
          [
            "hse-c20"
          ]
        ],
        "keyPoints": [
          "Knapphet innebærer mulighetskostnad: ressurser brukt på ett tiltak kan ikke samtidig brukes på beste alternative anvendelse.",
          "Økonomiske modeller bygger på antakelser, perspektiv, tidshorisont og usikkerhet; modellresultater er ikke automatiske beslutningsregler."
        ],
        "keyPointClaimIds": [
          [
            "hse-c17"
          ],
          [
            "hse-c20"
          ]
        ],
        "source_ids": [
          "hse09-who-hta-2021",
          "hse10-who-health-economics",
          "hse11-who-benefit-packages-2021"
        ]
      },
      {
        "id": "hse-hta-prioritering-og-helsepakker",
        "title": "HTA, prioritering og helsepakker",
        "topic_id": "hta-prioritering-og-helsepakker",
        "emne_ids": [
          "em_helse_helsetjenester_helseokonomi"
        ],
        "method_ids": [
          "met_helse_tjenesteanalyse",
          "met_helse_evidenssyntese"
        ],
        "boundary": "Evidensvurdering, appraisal og legitime prioriteringskriterier holdes adskilt; norsk normativ kontekst generaliseres ikke globalt.",
        "paragraphIds": [
          "hse-p-21",
          "hse-p-22",
          "hse-p-23",
          "hse-p-24"
        ],
        "paragraphs": [
          "HTA kan systematisere vurdering av effekt, sikkerhet, kostnader og andre konsekvenser, men erstatter ikke en legitim beslutnings- og prioriteringsprosess. En robust prosess skiller mellom teknisk assessment og normativ eller institusjonell appraisal, slik at evidensgrunnlaget er synlig samtidig som verdier og legitime kriterier behandles eksplisitt.",
          "Helsepakker gjør prioritering eksplisitt: ingen systemer kan tilby alle mulige tjenester til alle, og transparente prosesser kan redusere vilkårlig eller skjult rasjonering. Eksplisitte pakker kan også gjøre utelatelser synlige og etterprøvbare, men de må oppdateres når evidens, priser, sykdomsbyrde eller samfunnets prioriteringer endres.",
          "I norsk helse- og omsorgstjeneste inngår nytte, ressurs og alvorlighet som prioriteringskriterier; dette er nasjonal normativ kontekst, ikke universell naturregel. I norsk kontekst skal kriteriene brukes etter gjeldende prioriteringsrammer og med relevant tjenestekontekst; de kan ikke kopieres ukritisk til andre land eller brukes som individuell juridisk fasit.",
          "Prioritering er ikke det samme som å velge billigst; forventet nytte, ressursbruk, alvorlighet, likeverd og kontekst kan inngå i samlet vurdering. Den faglige oppgaven er å gjøre avveiningene etterprøvbare og begrunne hvordan kriterier er veid, ikke å redusere prioritering til én pris, én rangering eller ett terskeltall."
        ],
        "paragraphClaimIds": [
          [
            "hse-c21"
          ],
          [
            "hse-c22"
          ],
          [
            "hse-c23"
          ],
          [
            "hse-c24"
          ]
        ],
        "keyPoints": [
          "HTA kan systematisere vurdering av effekt, sikkerhet, kostnader og andre konsekvenser, men erstatter ikke en legitim beslutnings- og prioriteringsprosess.",
          "Prioritering er ikke det samme som å velge billigst; forventet nytte, ressursbruk, alvorlighet, likeverd og kontekst kan inngå i samlet vurdering."
        ],
        "keyPointClaimIds": [
          [
            "hse-c21"
          ],
          [
            "hse-c24"
          ]
        ],
        "source_ids": [
          "hse09-who-hta-2021",
          "hse11-who-benefit-packages-2021",
          "hse14-helsedirektoratet-prioritering",
          "hse15-helsedirektoratet-municipal-priority-2025"
        ]
      }
    ]
  },
  "data/fagverk/helse/helsetjenester-helseokonomi-organisering-kvalitet-prioritering-og-ressursbruk/04-equity-og-systemytelse.json": {
    "schema": "history_go_fagverk_health_module_v1",
    "version": "1.0.0",
    "id": "04-equity-og-systemytelse",
    "title": "Likeverd, finansiell beskyttelse og systemytelse",
    "sections": [
      {
        "id": "hse-equity-finansiell-beskyttelse-og-ulikhet",
        "title": "Likeverd, finansiell beskyttelse og ulikhet",
        "topic_id": "equity-finansiell-beskyttelse-og-ulikhet",
        "emne_ids": [
          "em_helse_helsetjenester_helseokonomi"
        ],
        "method_ids": [
          "met_helse_ulikhetsanalyse",
          "met_helse_populasjonsanalyse"
        ],
        "boundary": "Populasjonsforskjeller brukes til systemanalyse, aldri som individuell prognose eller stereotypi.",
        "paragraphIds": [
          "hse-p-25",
          "hse-p-26",
          "hse-p-27",
          "hse-p-28"
        ],
        "paragraphs": [
          "Likeverd krever analyse av hvem som får tilgang, hvilken kvalitet de mottar og hvilke utfall som oppnås, ikke bare gjennomsnitt for hele befolkningen. Fordelingsanalyse kan derfor sammenligne behov, ventetid, bruk, kvalitet og utfall mellom grupper og undersøke om systemet reduserer eller forsterker eksisterende forskjeller.",
          "Finansiell belastning fra egenbetaling kan være sosialt skjevt fordelt; økonomisk tilgang er derfor en egen dimensjon av universell dekning. To systemer med samme gjennomsnittlige dekning kan gi ulik økonomisk risiko dersom egenbetaling og inntekt er skjevt fordelt, og aggregater bør suppleres med fordelingsmål.",
          "Forskjeller mellom befolkningsgrupper er gruppedata og kan ikke brukes som sikker prediksjon om enkeltpersoners behov, bruk eller utfall. Slike data er nyttige for å identifisere strukturelle mønstre og målrette systemforbedring, men de sier ikke sikkert hvordan et bestemt individ vil bruke tjenester eller hvilket utfall personen får.",
          "Effektivitet og likeverd kan støtte hverandre, men er ikke identiske mål; aggregert effektivitet kan kreve separat vurdering av fordeling. En effektiv ressursallokering kan derfor trenge eksplisitt korreksjon eller vekting dersom gevinstene systematisk tilfaller grupper som allerede har best tilgang eller lavest sykdomsbyrde."
        ],
        "paragraphClaimIds": [
          [
            "hse-c25"
          ],
          [
            "hse-c26"
          ],
          [
            "hse-c27"
          ],
          [
            "hse-c28"
          ]
        ],
        "keyPoints": [
          "Likeverd krever analyse av hvem som får tilgang, hvilken kvalitet de mottar og hvilke utfall som oppnås, ikke bare gjennomsnitt for hele befolkningen.",
          "Effektivitet og likeverd kan støtte hverandre, men er ikke identiske mål; aggregert effektivitet kan kreve separat vurdering av fordeling."
        ],
        "keyPointClaimIds": [
          [
            "hse-c25"
          ],
          [
            "hse-c28"
          ]
        ],
        "source_ids": [
          "hse03-who-uhc-2025",
          "hse12-who-financial-protection",
          "hse13-oecd-health-at-glance-2025",
          "hse15-helsedirektoratet-municipal-priority-2025"
        ]
      },
      {
        "id": "hse-styringsdata-benchmarking-og-kausal-tolkning",
        "title": "Styringsdata, benchmarking og kausal tolkning",
        "topic_id": "styringsdata-benchmarking-og-kausal-tolkning",
        "emne_ids": [
          "em_helse_helsetjenester_helseokonomi"
        ],
        "method_ids": [
          "met_helse_tjenesteanalyse",
          "met_helse_populasjonsanalyse"
        ],
        "boundary": "Systemindikatorer beskrives med definisjon, datakvalitet, case-mix og kontekst; benchmarking blir ikke kausal inferens.",
        "paragraphIds": [
          "hse-p-29",
          "hse-p-30",
          "hse-p-31",
          "hse-p-32"
        ],
        "paragraphs": [
          "Sammenlignbare indikatorer kan avdekke mønstre i tilgang, kvalitet, ressursbruk og utfall, men definisjoner, datakvalitet og case-mix påvirker tolkningen. Før sammenligning bør indikatorens numerator, denominator, kodingspraksis, populasjonsgrunnlag og eventuelle risikojustering avklares, ellers kan rangeringen være et målefenomen mer enn en reell systemforskjell.",
          "Mer helseutgifter garanterer ikke bedre helseutfall; nivå, sammensetning, priser, behov, organisering og effektivitet påvirker forholdet mellom ressursbruk og resultater. Utgiftsnivå må derfor analyseres sammen med hva som kjøpes, enhetspriser, befolkningsbehov, produktivitet, forebygging og organisering før man trekker slutninger om effektivitet.",
          "Et land- eller regionsnitt er et benchmark, ikke en kausal kontrafaktisk; forskjeller mellom systemer kan skyldes mange samtidige faktorer. Benchmarking er best brukt til å formulere nye spørsmål og identifisere avvik som fortjener analyse; det etablerer ikke hva samme system ville oppnådd under en alternativ organisering.",
          "Styringsdata bør brukes til læring, prioritering og forbedring sammen med faglig og kontekstuell kunnskap; én rangering eller indikator bør ikke alene avgjøre systemkvalitet. God styring kombinerer indikatorer med kvalitativ kunnskap, klinisk innsikt, brukerperspektiv og evaluering av tiltak, og dokumenterer usikkerhet før data brukes til prioritering eller forbedring."
        ],
        "paragraphClaimIds": [
          [
            "hse-c29"
          ],
          [
            "hse-c30"
          ],
          [
            "hse-c31"
          ],
          [
            "hse-c32"
          ]
        ],
        "keyPoints": [
          "Sammenlignbare indikatorer kan avdekke mønstre i tilgang, kvalitet, ressursbruk og utfall, men definisjoner, datakvalitet og case-mix påvirker tolkningen.",
          "Styringsdata bør brukes til læring, prioritering og forbedring sammen med faglig og kontekstuell kunnskap; én rangering eller indikator bør ikke alene avgjøre systemkvalitet."
        ],
        "keyPointClaimIds": [
          [
            "hse-c29"
          ],
          [
            "hse-c32"
          ]
        ],
        "source_ids": [
          "hse01-who-hspa-2026",
          "hse06-who-quality-services-2020",
          "hse13-oecd-health-at-glance-2025"
        ]
      }
    ]
  }
};
const abs=f=>path.join(ROOT,f),read=f=>JSON.parse(fs.readFileSync(abs(f),'utf8')),write=(f,v)=>{fs.mkdirSync(path.dirname(abs(f)),{recursive:true});fs.writeFileSync(abs(f),JSON.stringify(v,null,2)+'\n');},assert=(v,m)=>{if(!v)throw new Error(m);},updateRaw=(f,fn)=>{const v=fn(fs.readFileSync(abs(f),'utf8'));JSON.parse(v);fs.writeFileSync(abs(f),v);};
function validateSourceBoundOutputs(source){
 const chapter=OUTPUTS[P.chapter],brief=OUTPUTS[P.brief],claimsDoc=OUTPUTS[P.claims],assessment=OUTPUTS[P.assessment],planned=source.topic_briefs.flatMap(t=>t.planned_claims.map(c=>c.id)),claimIds=claimsDoc.claims.map(c=>c.id),sourceIds=source.sources.map(s=>s.id),outputSourceIds=claimsDoc.sources.map(s=>s.id);
 assert(source.status==='source_claim_brief_complete_full_chapter_next','Helsetjenester/helseøkonomi source brief er ikke fullført');assert(source.topic_briefs.length===8&&planned.length===32&&new Set(planned).size===32,'Source brief skal ha 8 topics og 32 unike claims');assert(isDeepStrictEqual(planned,claimIds),'Materialiserte claims avviker fra source brief');assert(isDeepStrictEqual(sourceIds,outputSourceIds)&&sourceIds.length===15,'Materialiserte kilder avviker fra source brief');assert(chapter.sourceBriefFile===P.source&&brief.sourceStrategy.sourceBriefFile===P.source&&claimsDoc.sourceBriefFile===P.source,'Source-first binding mangler');assert(isDeepStrictEqual(chapter.method_ids,source.allowed_method_ids),'Canonical metodebinding avviker');assert(isDeepStrictEqual(chapter.workCases,source.decision_scenarios),'Dokumenterte scenarioer avviker fra source brief');assert(isDeepStrictEqual(chapter.moduleFiles,source.fulltext_structure.map(m=>DIR+'/'+m.module_id+'.json')),'Modulplan avviker fra source brief');assert(chapter.moduleFiles.every(file=>OUTPUTS[file]),'Materializer mangler chapter-owned moduloutput');assert(assessment.questions.length===8&&assessment.questions.every(q=>claimIds.includes(q.claim_id)),'Assessment mangler claimbinding');
}
export function build(){
 const source=read(P.source),safety=read(P.safety),manifest=read(P.manifest),inventory=read(P.inventory),registry=read(P.registry),status=read(P.status),health=status.subjects.find(x=>x.id==='helse');assert([INPUT,OUTPUT,FINAL].includes(health.nextGate),'Feil gate '+health.nextGate);assert(safety.status==='blocking','Klinisk sikkerhetskontrakt må være blocking');validateSourceBoundOutputs(source);for(const [file,value] of Object.entries(OUTPUTS))write(file,value);
 const chapter=OUTPUTS[P.chapter],claims=OUTPUTS[P.claims].claims,assessment=OUTPUTS[P.assessment],moduleFiles=chapter.moduleFiles;manifest.helse.sourceClaimBriefs=[...new Set([...(manifest.helse.sourceClaimBriefs||[]),P.source])];manifest.helse.chapters=[...new Set([...(manifest.helse.chapters||[]),P.chapter])];const inv=inventory.subjects.find(x=>x.id==='helse');inv.optionalManifestFields=[...new Set([...(inv.optionalManifestFields||[]),'sourceClaimBriefs','chapters'])];
 const reg=registry.subjects.helse;reg.canonicalModel.twelfthSourceClaimBrief=P.source;reg.canonicalModel.twelfthFulltextChapter=P.chapter;reg.canonicalModel.note='Alle tolv Helse-domener er nå fulltekstmaterialisert source-first. Helsetjenester og helseøkonomi tilfører systemfunksjoner, tilgang, kvalitet, pasientsikkerhet, finansiering, mulighetskostnad, HTA, prioritering, finansiell beskyttelse, likeverd og benchmarking med 8 seksjoner, 32 claimsporede avsnitt, 32 verifiserte claims, 15 inspiserbare kilder og 8 vurderingsoppgaver. Strict proof gjenstår før complete kan hevdes.';reg.editorialPlan.completedSourceBriefCount=12;reg.editorialPlan.registeredChapterCount=12;reg.editorialPlan.nextGate='prove_health_strict_completion_after_all_twelve_fulltext_domains';reg.chapters=[...reg.chapters.filter(x=>x.id!==ID),{id:ID,title:chapter.title,subtitle:chapter.subtitle,file:P.chapter,primary_domain_id:'helsetjenester_helseokonomi',emne_ids:chapter.emne_ids,claimsFile:P.claims,briefFile:P.brief,assessmentFile:P.assessment,safetyContractFile:P.safety}];
 health.nextGate=OUTPUT;health.note='Helse har 12 av 12 domener fulltekstmaterialisert. Helsetjenester og helseøkonomi tilfører 8 seksjoner, 32 claimsporede avsnitt, 32 verifiserte claims, 15 inspiserbare kilder og 8 auditerte oppgaver. Dekning, tilgang, kvalitet, finansiering, kostnadseffektivitet, HTA, prioritering, likeverd og benchmarking holdes analytisk adskilt og avgrenset fra individuelle helse-, rettighets- og budsjettavgjørelser. Helse forblir chapters_in_progress til strict proof er bestått.';write(P.manifest,manifest);write(P.inventory,inventory);write(P.registry,registry);write(P.status,status);
 updateRaw(P.pensum,raw=>raw.replace(/("domain_id"\s*:\s*"helsetjenester_helseokonomi"[\s\S]*?"status"\s*:\s*")(?:planned|materialized)(")/,'$1materialized$2'));updateRaw(P.emners,raw=>raw.replace(/("emne_id"\s*:\s*"em_helse_helsetjenester_helseokonomi"[\s\S]*?"status"\s*:\s*")(?:planned|materialized)(")/,'$1materialized$2'));for(const id of source.allowed_method_ids)updateRaw(P.methods,raw=>raw.replace(new RegExp('("method_id"\\s*:\\s*"'+id+'"[\\s\\S]*?"canonical_status"\\s*:\\s*")(?:planned|materialized)(")'),'$1materialized$2'));
 return{chapter,claims,assessment,moduleFiles};
}
try{const b=build();console.log('Helse Helsetjenester/helseøkonomi materialisert: '+b.moduleFiles.length+' moduler, '+b.claims.length+' claims, '+b.assessment.questions.length+' oppgaver.');}catch(e){console.error('Helse Helsetjenester/helseøkonomi materialisering FEIL: '+e.message);process.exitCode=1;}
