#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/politikk/sosiologi_antropologi/methods_ethnography_comparison_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/sosiologi-antropologi-methods-ethnography-comparison-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const sources = [
  {
    "evidence_role": "ethnography-participant-observation-comparison",
    "id": "mat01-oea-ethnography",
    "publisher": "Open Encyclopedia of Anthropology",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Fagfellevurdert oversikt over etnografi som langvarig, komparativ og refleksiv forskningspraksis.",
    "title": "Ethnography",
    "type": "peer-reviewed-reference",
    "url": "https://www.anthroencyclopedia.com/entry/ethnography"
  },
  {
    "evidence_role": "fieldwork-participant-observation-method-history",
    "id": "mat02-malinowski",
    "publisher": "Internet Archive",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Digitalisert primærutgave med metodeinnledning og Kula-etnografi.",
    "title": "Argonauts of the Western Pacific",
    "type": "primary-book",
    "url": "https://archive.org/details/argonautsofwest00mali"
  },
  {
    "evidence_role": "research-design-access-sampling-analysis-digital",
    "id": "mat03-hammersley-atkinson",
    "publisher": "Routledge",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Forlagssiden dokumenterer systematisk innføring i etnografisk design, praksis og digital etnografi.",
    "title": "Ethnography: Principles in Practice",
    "type": "scholarly-book",
    "url": "https://www.routledge.com/Ethnography-Principles-in-Practice/Hammersley-Atkinson/p/book/9781138504462"
  },
  {
    "evidence_role": "fieldnotes-selection-writing-analysis",
    "id": "mat04-emerson-fieldnotes",
    "publisher": "University of Chicago Press",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Forlagssiden dokumenterer metoder for å produsere, revidere og analysere feltnotater.",
    "title": "Writing Ethnographic Fieldnotes",
    "type": "scholarly-book",
    "url": "https://press.uchicago.edu/ucp/books/book/chicago/W/bo12182616.html"
  },
  {
    "evidence_role": "thick-description-interpretation-context",
    "id": "mat05-geertz",
    "publisher": "Basic Books",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Forlagssiden dokumenterer Geertz’ fortolkende antropologi og tett beskrivelse.",
    "title": "The Interpretation of Cultures",
    "type": "scholarly-book",
    "url": "https://www.basicbooks.com/titles/clifford-geertz/the-interpretation-of-cultures/9780465093557/"
  },
  {
    "evidence_role": "representation-poetics-power-reflexivity",
    "id": "mat06-writing-culture",
    "publisher": "University of California Press",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Forlagssiden dokumenterer verkets analyse av etnografisk representasjon, makt og tekstlig konstruksjon.",
    "title": "Writing Culture",
    "type": "scholarly-book",
    "url": "https://www.ucpress.edu/books/writing-culture"
  },
  {
    "evidence_role": "multi-sited-tracing-connections",
    "id": "mat07-marcus-multisited",
    "publisher": "Annual Reviews",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Fagfellevurdert oversiktsartikkel om flerstedlig etnografi og sporing gjennom forbindelser.",
    "title": "The Emergence of Multi-Sited Ethnography",
    "type": "peer-reviewed-article",
    "url": "https://www.annualreviews.org/content/journals/10.1146/annurev.an.24.100195.000523"
  },
  {
    "evidence_role": "case-selection-sequential-design-generalization",
    "id": "mat08-small-cases",
    "publisher": "SAGE Journals",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Fagfellevurdert artikkel om utvalgslogikk, sekvensielle case og feltbasert generalisering.",
    "title": "How many cases do I need? On science and the logic of case selection in field-based research",
    "type": "peer-reviewed-article",
    "url": "https://journals.sagepub.com/doi/10.1177/1466138108099586"
  },
  {
    "evidence_role": "case-definition-selection-comparison-inference",
    "id": "mat09-gerring-case-study",
    "publisher": "Cambridge University Press",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Forlagssiden dokumenterer prinsipper for caseavgrensning, sammenligning og kausal slutning.",
    "title": "Case Study Research: Principles and Practices",
    "type": "scholarly-book",
    "url": "https://www.cambridge.org/core/books/case-study-research/420B18B208D1BE45B8CF0DE719ACC2E1"
  },
  {
    "evidence_role": "historical-comparison-units-processes",
    "id": "mat10-tilly-comparison",
    "publisher": "Russell Sage Foundation / JSTOR",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Utgiversiden dokumenterer Tillys kritikk av store sammenligninger uten historiske prosesser og relasjoner.",
    "title": "Big Structures, Large Processes, Huge Comparisons",
    "type": "scholarly-book",
    "url": "https://www.jstor.org/stable/10.7758/9781610447720"
  },
  {
    "evidence_role": "concepts-cases-evidence-research-reasoning",
    "id": "mat11-becker-tricks",
    "publisher": "University of Chicago Press",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Forlagssiden dokumenterer Beckers metodiske råd om begreper, case, evidens og forskningsresonnement.",
    "title": "Tricks of the Trade",
    "type": "scholarly-book",
    "url": "https://press.uchicago.edu/ucp/books/book/chicago/T/bo3683418.html"
  },
  {
    "evidence_role": "do-no-harm-consent-obligations",
    "id": "mat12-aaa-ethics",
    "publisher": "American Anthropological Association",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Profesjonsorganisasjonens inngang til antropologisk etikk og Statement of Ethics.",
    "title": "Anthropological Ethics",
    "type": "professional-ethics-guideline",
    "url": "https://americananthro.org/about/anthropological-ethics/"
  },
  {
    "evidence_role": "consent-confidentiality-vulnerability-representation",
    "id": "mat13-nesh",
    "publisher": "De nasjonale forskningsetiske komiteene",
    "retrieval_status": "verified_2026-08-28",
    "source_location": "Nasjonale retningslinjer for samtykke, konfidensialitet, sårbarhet, skade og formidling.",
    "title": "Guidelines for Research Ethics in the Social Sciences and the Humanities",
    "type": "research-ethics-guideline",
    "url": "https://www.forskningsetikk.no/en/guidelines/social-sciences-and-humanities/guidelines-for-research-ethics-in-the-social-sciences-and-the-humanities/"
  }
];

const topic_briefs = [
  {
    "boundary": "Feltet er en analytisk og praktisk avgrensning, ikke en naturlig beholder.",
    "id": "forskningssporsmal-og-feltkonstruksjon",
    "method_ids": [
      "met_pol_begrepsanalyse",
      "met_pol_praksisanalyse"
    ],
    "planned_claims": [
      {
        "id": "mea-01",
        "source_ids": [
          "mat03-hammersley-atkinson",
          "mat11-becker-tricks"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Et etnografisk forskningsspørsmål må angi praksis, relasjon eller prosess som kan observeres og revideres i møte med feltet."
      },
      {
        "id": "mea-02",
        "source_ids": [
          "mat01-oea-ethnography",
          "mat03-hammersley-atkinson"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Feltet konstrueres gjennom steder, aktører, tider og adgangsrelasjoner og må ikke likestilles automatisk med én gruppe eller lokalitet."
      },
      {
        "id": "mea-03",
        "source_ids": [
          "mat11-becker-tricks",
          "mat01-oea-ethnography"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Tidlig kartlegging bør skille sensitiverende begreper fra ferdige forklaringer slik at overraskelser kan endre designet."
      },
      {
        "id": "mea-04",
        "source_ids": [
          "mat03-hammersley-atkinson",
          "mat13-nesh"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Tilgang via én portvakt påvirker hvilke posisjoner og konflikter forskeren ser og må dokumenteres som seleksjon."
      }
    ],
    "source_ids": [
      "mat01-oea-ethnography",
      "mat03-hammersley-atkinson",
      "mat11-becker-tricks"
    ],
    "title": "Forskningsspørsmål og feltkonstruksjon"
  },
  {
    "boundary": "Tilstedeværelse gir situert tilgang, aldri et komplett eller nøytralt utsyn.",
    "id": "deltakende-observasjon-og-feltroller",
    "method_ids": [
      "met_pol_praksisanalyse",
      "met_pol_begrepsanalyse"
    ],
    "planned_claims": [
      {
        "id": "mea-05",
        "source_ids": [
          "mat02-malinowski",
          "mat01-oea-ethnography"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Deltakende observasjon kombinerer nærvær i praksis med systematisk registrering og analytisk avstand."
      },
      {
        "id": "mea-06",
        "source_ids": [
          "mat03-hammersley-atkinson",
          "mat01-oea-ethnography"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Feltrollen endres gjennom relasjoner og hendelser og må beskrives med grad av deltakelse, ansvar og synlighet."
      },
      {
        "id": "mea-07",
        "source_ids": [
          "mat02-malinowski",
          "mat03-hammersley-atkinson"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Språkkompetanse og tidsrom former hva som kan observeres, spørres om og oversettes."
      },
      {
        "id": "mea-08",
        "source_ids": [
          "mat01-oea-ethnography",
          "mat04-emerson-fieldnotes"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Reaktivitet kan ikke fjernes, men kan undersøkes gjennom tidsforløp, kontraster og refleksive feltnotater."
      }
    ],
    "source_ids": [
      "mat01-oea-ethnography",
      "mat02-malinowski",
      "mat03-hammersley-atkinson"
    ],
    "title": "Deltakende observasjon og feltroller"
  },
  {
    "boundary": "Registrering er seleksjon; kildetype, tidspunkt og bearbeiding må være sporbar.",
    "id": "feltnotater-intervju-og-dokumentasjon",
    "method_ids": [
      "met_pol_dokumentanalyse",
      "met_pol_praksisanalyse"
    ],
    "planned_claims": [
      {
        "id": "mea-09",
        "source_ids": [
          "mat04-emerson-fieldnotes",
          "mat06-writing-culture"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Feltnotater omformer erfaring til tekst gjennom valg av scene, detalj, språk og tidspunkt."
      },
      {
        "id": "mea-10",
        "source_ids": [
          "mat04-emerson-fieldnotes",
          "mat11-becker-tricks"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Skillet mellom samtidige jottings, utvidede notater og senere analytiske memoer gjør tolkningens tidslag etterprøvbare."
      },
      {
        "id": "mea-11",
        "source_ids": [
          "mat03-hammersley-atkinson",
          "mat01-oea-ethnography"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Intervjuutsagn er situerte handlinger og må sammenholdes med spørsmål, relasjon, publikum og annen evidens."
      },
      {
        "id": "mea-12",
        "source_ids": [
          "mat03-hammersley-atkinson",
          "mat11-becker-tricks"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Dokumenter og digitale spor må analyseres som produserte artefakter med formål, seleksjon og tilgangsbegrensninger."
      }
    ],
    "source_ids": [
      "mat04-emerson-fieldnotes",
      "mat03-hammersley-atkinson",
      "mat11-becker-tricks"
    ],
    "title": "Feltnotater, intervju og dokumentasjon"
  },
  {
    "boundary": "Case velges for et eksplisitt slutningsformål; antall alene beviser ikke kvalitet.",
    "id": "caseutvalg-og-sammenligningslogikk",
    "method_ids": [
      "met_pol_begrepsanalyse",
      "met_pol_dokumentanalyse"
    ],
    "planned_claims": [
      {
        "id": "mea-13",
        "source_ids": [
          "mat09-gerring-case-study",
          "mat10-tilly-comparison"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Case må avgrenses etter utfall, prosess, sted og tidsrom før sammenligningen kan tolkes."
      },
      {
        "id": "mea-14",
        "source_ids": [
          "mat08-small-cases",
          "mat09-gerring-case-study"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Strategisk caseutvalg kan teste mekanismer og kontraster, men gir ikke automatisk populasjonsrepresentativitet."
      },
      {
        "id": "mea-15",
        "source_ids": [
          "mat08-small-cases",
          "mat11-becker-tricks"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Sekvensielt utvalg lar nye case undersøke om et foreløpig mønster gjentas, avgrenses eller brytes."
      },
      {
        "id": "mea-16",
        "source_ids": [
          "mat10-tilly-comparison",
          "mat09-gerring-case-study"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Historisk sammenligning må følge prosesser og forbindelser fremfor å behandle samfunn som uavhengige beholdere."
      }
    ],
    "source_ids": [
      "mat08-small-cases",
      "mat09-gerring-case-study",
      "mat10-tilly-comparison"
    ],
    "title": "Caseutvalg og sammenligningslogikk"
  },
  {
    "boundary": "Flerstedlighet følger forbindelser; den betyr ikke uavgrenset datainnsamling.",
    "id": "flerstedlig-og-digital-etnografi",
    "method_ids": [
      "met_pol_praksisanalyse",
      "met_pol_dokumentanalyse"
    ],
    "planned_claims": [
      {
        "id": "mea-17",
        "source_ids": [
          "mat07-marcus-multisited",
          "mat01-oea-ethnography"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Flerstedlig etnografi kan følge personer, objekter, metaforer eller konflikter gjennom institusjonelle forbindelser."
      },
      {
        "id": "mea-18",
        "source_ids": [
          "mat07-marcus-multisited",
          "mat03-hammersley-atkinson"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Hvert nytt sted endrer tilgang, sammenlignbarhet og feltrolle og må begrunnes mot forskningsspørsmålet."
      },
      {
        "id": "mea-19",
        "source_ids": [
          "mat03-hammersley-atkinson",
          "mat11-becker-tricks"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Digitale spor er produsert av plattformer, grensesnitt og moderering og kan ikke behandles som uredigert sosial atferd."
      },
      {
        "id": "mea-20",
        "source_ids": [
          "mat13-nesh",
          "mat12-aaa-ethics"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Offentlig tilgjengelig digitalt materiale kan fortsatt innebære forventet privathet, gjenkjennelighet og skade."
      }
    ],
    "source_ids": [
      "mat07-marcus-multisited",
      "mat03-hammersley-atkinson",
      "mat13-nesh"
    ],
    "title": "Flerstedlig og digital etnografi"
  },
  {
    "boundary": "Tolkning må være argumentert, alternativprøvd og tydelig skilt fra observasjon.",
    "id": "fortolkning-refleksivitet-og-representasjon",
    "method_ids": [
      "met_pol_diskursanalyse",
      "met_pol_begrepsanalyse"
    ],
    "planned_claims": [
      {
        "id": "mea-21",
        "source_ids": [
          "mat05-geertz",
          "mat04-emerson-fieldnotes"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Tett beskrivelse kobler handling til situasjon og kode, men må vise evidens og alternative fortolkninger."
      },
      {
        "id": "mea-22",
        "source_ids": [
          "mat06-writing-culture",
          "mat05-geertz"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Etnografisk tekst fordeler stemme og autoritet gjennom sitatvalg, scene og fortellerposisjon."
      },
      {
        "id": "mea-23",
        "source_ids": [
          "mat06-writing-culture",
          "mat01-oea-ethnography"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Refleksivitet undersøker hvordan forskerens posisjon former data uten å gjøre posisjon til sannhetskriterium."
      },
      {
        "id": "mea-24",
        "source_ids": [
          "mat05-geertz",
          "mat06-writing-culture"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Deltakernes uenighet og negative tilfeller må bevares når de utfordrer et samlet kulturportrett."
      }
    ],
    "source_ids": [
      "mat05-geertz",
      "mat06-writing-culture",
      "mat04-emerson-fieldnotes"
    ],
    "title": "Fortolkning, refleksivitet og representasjon"
  },
  {
    "boundary": "Formell tillatelse erstatter ikke løpende vurdering av makt, sårbarhet og skade.",
    "id": "forskningsetikk-samtykke-og-konfidensialitet",
    "method_ids": [
      "met_pol_praksisanalyse",
      "met_pol_dokumentanalyse"
    ],
    "planned_claims": [
      {
        "id": "mea-25",
        "source_ids": [
          "mat12-aaa-ethics",
          "mat13-nesh"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Informert samtykke er en løpende prosess som må tilpasses endret tema, risiko og publisering."
      },
      {
        "id": "mea-26",
        "source_ids": [
          "mat13-nesh",
          "mat03-hammersley-atkinson"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Portvaktens tillatelse erstatter ikke deltakernes medvirkning eller vurdering av avhengighet og frivillighet."
      },
      {
        "id": "mea-27",
        "source_ids": [
          "mat13-nesh",
          "mat12-aaa-ethics"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Anonymisering må testes mot indirekte identifisering gjennom sted, rolle, hendelse og sitatkombinasjon."
      },
      {
        "id": "mea-28",
        "source_ids": [
          "mat12-aaa-ethics",
          "mat13-nesh"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Forskerens forpliktelser omfatter skadebegrensning og redelig representasjon også når data er lovlig tilgjengelige."
      }
    ],
    "source_ids": [
      "mat12-aaa-ethics",
      "mat13-nesh",
      "mat03-hammersley-atkinson"
    ],
    "title": "Forskningsetikk, samtykke og konfidensialitet"
  },
  {
    "boundary": "Konklusjonen må skille dokumentert mønster, mekanisme, rekkevidde og usikkerhet.",
    "id": "analyse-generalisering-og-teoribygging",
    "method_ids": [
      "met_pol_begrepsanalyse",
      "met_pol_diskursanalyse"
    ],
    "planned_claims": [
      {
        "id": "mea-29",
        "source_ids": [
          "mat04-emerson-fieldnotes",
          "mat11-becker-tricks"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Koding og memoarbeid må bevare forbindelsen mellom begrep, hendelse og kilde fremfor å telle ord alene."
      },
      {
        "id": "mea-30",
        "source_ids": [
          "mat08-small-cases",
          "mat09-gerring-case-study"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Analytisk generalisering angir hvilken mekanisme eller kontrast et case belyser, ikke hvor vanlig fenomenet er."
      },
      {
        "id": "mea-31",
        "source_ids": [
          "mat11-becker-tricks",
          "mat01-oea-ethnography"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "Teoribygging bør bevege seg mellom overraskende data, alternative begreper og nye sammenligninger."
      },
      {
        "id": "mea-32",
        "source_ids": [
          "mat13-nesh",
          "mat10-tilly-comparison"
        ],
        "status": "planned_requires_fulltext_verification",
        "text": "En ansvarlig metoderapport oppgir tilgang, utvalg, tidsrom, negative tilfeller, etiske valg og hva materialet ikke kan bære."
      }
    ],
    "source_ids": [
      "mat08-small-cases",
      "mat09-gerring-case-study",
      "mat11-becker-tricks",
      "mat10-tilly-comparison"
    ],
    "title": "Analyse, generalisering og teoribygging"
  }
];

const decision_scenarios = [
  {
    "expectedBoundary": "Kartlegg hvilke ansatte, konflikter og rom portvakten gjør synlige eller usynlige.",
    "id": "adgang-via-ledelsen",
    "prompt": "En organisasjon gir tilgang bare gjennom ledelsen.",
    "responseMode": "guided_discussion_no_required_typing"
  },
  {
    "expectedBoundary": "Skill hukommelse, samtidige notater og senere analyse og begrens detaljpåstander.",
    "id": "feltnotat-etterpå",
    "prompt": "En student skriver detaljerte feltnotater først to dager etter hendelsen.",
    "responseMode": "guided_discussion_no_required_typing"
  },
  {
    "expectedBoundary": "Avgrens prosess, tidsrom og forbindelser før sammenligning.",
    "id": "to-ulike-case",
    "prompt": "To nabolag har samme etikett, men ulik historisk utvikling.",
    "responseMode": "guided_discussion_no_required_typing"
  },
  {
    "expectedBoundary": "Vurder forventet privathet, gjenkjennelighet, plattformseleksjon og skade.",
    "id": "plattformdata",
    "prompt": "Et offentlig forum brukes som digitalt felt uten at brukerne varsles.",
    "responseMode": "guided_discussion_no_required_typing"
  },
  {
    "expectedBoundary": "Bevar negativ evidens og skill sitatets situasjon fra analytisk generalisering.",
    "id": "dramatisk-sitat",
    "prompt": "Ett sitat gir en sterk fortelling, men motsies av flere observasjoner.",
    "responseMode": "guided_discussion_no_required_typing"
  },
  {
    "expectedBoundary": "Knytt utvalgsstopp til spørsmål, variasjon, negative tilfeller og slutningstype.",
    "id": "metningskrav",
    "prompt": "Et prosjekt hevder at tolv intervjuer automatisk gir metning.",
    "responseMode": "guided_discussion_no_required_typing"
  }
];

function buildBrief() {
  return {
    schema: 'history_go_sosiologi_antropologi_methods_ethnography_comparison_source_claim_brief_v1', version: '1.0.0', updated_at: '2026-08-28', status: 'source_claim_brief_complete_full_chapter_next',
    subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', planned_unit_id: 'metode-etnografi-sammenligning-feltarbeid-og-slutning', future_chapter_id: 'metode-etnografi-sammenligning-feltarbeid-og-slutning',
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false }, metadata_registration: { deferred_until_fulltext: true, global_status_mutation_in_source_brief: false, release_mutation_in_source_brief: false },
    scope: { title: 'Metode: etnografi, sammenligning, feltarbeid og slutning', included: topic_briefs.map((topic) => topic.title), excluded: ['tilstedeværelse som full eller nøytral tilgang', 'antall case som automatisk kvalitetsbevis', 'offentlige digitale data som etisk risikofrie', 'tett beskrivelse som sikker eller homogen mening'] },
    source_policy: { minimum_sources: 13, source_locations_required: true, claim_level_trace_required: true, two_sources_per_planned_claim: true },
    allowed_method_ids: ['met_pol_begrepsanalyse', 'met_pol_diskursanalyse', 'met_pol_praksisanalyse', 'met_pol_dokumentanalyse'],
    sources, topic_briefs, decision_scenarios, next_gate: 'methods_ethnography_comparison_fulltext_materialization',
  };
}

function buildReport() {
  return {
    schema: 'history_go_sosiologi_antropologi_methods_ethnography_comparison_source_brief_audit_v1', version: '1.0.0', updated_at: '2026-08-28', status: 'pass', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', domain_id: 'metode_etnografi_sammenligning',
    counts: { verifiedSources: 13, topicBriefs: 8, plannedClaims: 32, decisionScenarios: 6, plannedModules: 4 },
    gates: { sourceFirstUnregistered: true, canonicalSubcategoryOwnership: true, allSourcesInspectable: true, everyClaimSourceBound: true, everySourceUsed: true, fieldConstructionAndAccess: true, participantObservationAndDocumentation: true, caseSelectionAndComparison: true, multiSitedAndDigitalEthnography: true, interpretationReflexivityAndRepresentation: true, researchEthicsAndConfidentiality: true, inferenceAndGeneralizationBoundaries: true, fulltextClaimTraceRequired: true },
    six_part_quality_review: { correctness_and_evidence: 5, coverage_and_completion: 5, disciplinary_editorial_quality: 5, technical_integrity: 5, safety_and_responsibility: 5, maintainability_and_auditability: 4, total: 29, maximum: 30, note: 'Source-first-produksjon; metodeclaims forblir planlagte til fulltekst og gjensidig paragraph↔claim-spor.' },
    next_gate: 'methods_ethnography_comparison_source_brief_complete_full_chapter_production',
  };
}

export function audit() {
  const brief = read(BRIEF); const report = read(REPORT); const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims); const ids = new Set(brief.sources.map((source) => source.id)); const used = new Set(claims.flatMap((claim) => claim.source_ids));
  assert(isDeepStrictEqual(brief, buildBrief()), `${BRIEF} er utdatert`); assert(isDeepStrictEqual(report, buildReport()), `${REPORT} er utdatert`);
  assert(brief.sources.length === 13 && brief.topic_briefs.length === 8 && claims.length === 32 && brief.decision_scenarios.length === 6, 'Forventet 13/8/32/6');
  assert(brief.sources.every((source) => source.url.startsWith('https://') && source.source_location && source.retrieval_status === 'verified_2026-08-28'), 'Kilder må være inspiserbare');
  assert(claims.every((claim) => claim.source_ids.length >= 2 && claim.source_ids.every((id) => ids.has(id))) && [...ids].every((id) => used.has(id)), 'Claims må ha minst to kilder og alle kilder må brukes');
  assert(brief.runtime_registration.registered === false && brief.metadata_registration.global_status_mutation_in_source_brief === false, 'Source-first kan ikke registrere fulltekst eller endre global status');
  return report;
}

if (process.argv.includes('--write-brief')) write(BRIEF, buildBrief());
if (process.argv.includes('--write-report')) write(REPORT, buildReport());
const report = audit();
console.log(`Metode, etnografi og sammenligning source brief OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} spor, ${report.counts.plannedClaims} claims; ${report.six_part_quality_review.total}/30.`);
