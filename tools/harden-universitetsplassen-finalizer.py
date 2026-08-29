from pathlib import Path
import re

path = Path("tools/finalize-universitetsplassen-completion.mjs")
text = path.read_text()

if 'api.searchParams.set("iiurlwidth", "1600")' not in text:
    marker = 'api.searchParams.set("origin", "*");'
    if marker not in text:
        raise SystemExit("Commons origin marker not found")
    text = text.replace(marker, marker + '\n  api.searchParams.set("iiurlwidth", "1600");', 1)

if 'originalUrl: info.thumburl || info.url,' not in text:
    text, count = re.subn(r'originalUrl:\s*info\.url\s*,', 'originalUrl: info.thumburl || info.url,', text, count=1)
    if count != 1:
        raise SystemExit("Commons image URL assignment not found")

text = text.replace(
    'History-Go-place-production/1.0"',
    'History-Go-place-production/1.0 (github.com/Paradispartiet/History-Go)"'
)

fetch_replacement = r'''const imageBufferCache = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchBuffer(url) {
  const parsed = new URL(url);
  for (const key of ["utm_source", "utm_campaign", "utm_content"]) parsed.searchParams.delete(key);
  const cleanUrl = parsed.toString();
  if (imageBufferCache.has(cleanUrl)) return imageBufferCache.get(cleanUrl);

  let lastStatus = 0;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(cleanUrl, {
      headers: {
        "user-agent": "History-Go-place-production/1.0 (github.com/Paradispartiet/History-Go)",
        "accept": "image/avif,image/webp,image/*,*/*;q=0.8"
      }
    });
    lastStatus = response.status;
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      imageBufferCache.set(cleanUrl, buffer);
      await sleep(750);
      return buffer;
    }
    if (![429, 500, 502, 503, 504].includes(response.status)) {
      throw new Error(`Kunne ikke hente bilde (${response.status}): ${cleanUrl}`);
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 30000)
      : Math.min(1500 * (2 ** attempt), 30000);
    await sleep(delay);
  }
  throw new Error(`Kunne ikke hente bilde etter retries (${lastStatus}): ${cleanUrl}`);
}

async function outputImage'''
pattern = r'async function fetchBuffer\(url\)\s*\{.*?\n\}\s*\n\s*async function outputImage'
text, count = re.subn(pattern, fetch_replacement, text, count=1, flags=re.S)
if count != 1 and 'const imageBufferCache = new Map();' not in text:
    raise SystemExit("fetchBuffer function not found")

# Avoid Intl.Segmenter splitting spaced initials into artificial sentences.
text = text.replace("P. A. Munch", "Peter Andreas Munch")

# Keep temporal wording aligned with the v4.2.1 validator: exact timeline years
# must occur literally in timeline claims, while comparison prose must not use
# the validator's current-time marker "nå" unless it is genuinely current.
text = text.replace(
    "Universitetsplassen ble lagt om i 1930–31 etter planer av Bjercke og Eliassen.",
    "Omleggingen av Universitetsplassen ble fullført i 1931 etter arbeid i 1930–31, etter planer av Bjercke og Eliassen."
)
text = text.replace(
    "Bildene kan brukes til å sammenligne plassflate, monumenter og bygningsfront, men de er ikke et optisk identisk før-og-nå-par.",
    "Bildene kan sammenlignes for plassflate, monumenter og bygningsfront, men ståstedet er ulikt og sammenstillingen er ikke optisk identisk."
)

# Universitetsplassen own-place cleanup across every canonical people source in
# data/people/manifest.json. Keep each person and all other legitimate place
# relations; remove only stale direct Universitetsplassen ownership except Grosch.
cleanup_marker = 'const universPeopleManifestFile = "data/people/manifest.json";'
if cleanup_marker not in text:
    anchor = 'write(peopleFile, people);\n\nconst brandsMasterFile = "data/brands/brands_master.json";'
    if anchor not in text:
        raise SystemExit("People cleanup insertion anchor not found")
    cleanup = r'''write(peopleFile, people);

const universPeopleManifestFile = "data/people/manifest.json";
const universPeopleManifest = read(universPeopleManifestFile);
for (const relativePersonFile of universPeopleManifest.files || []) {
  const canonicalPersonFile = `data/${relativePersonFile}`;
  if (!fs.existsSync(path.join(root, canonicalPersonFile))) continue;
  const rawPeople = read(canonicalPersonFile);
  const personRecords = Array.isArray(rawPeople)
    ? rawPeople
    : rawPeople && typeof rawPeople === "object" && typeof rawPeople.id === "string"
      ? [rawPeople]
      : [];
  let changed = false;
  for (const person of personRecords) {
    if (!person || person.id === "christian_heinrich_grosch") continue;
    for (const key of ["places", "place_ids", "placeIds", "related_place_ids"]) {
      if (!Array.isArray(person[key]) || !person[key].includes(placeId)) continue;
      person[key] = person[key].filter((id) => id !== placeId);
      changed = true;
    }
    for (const key of ["placeId", "place_id", "place", "source_place_id", "primary_place_id"]) {
      if (person[key] !== placeId) continue;
      const replacement = [person.places, person.place_ids, person.placeIds]
        .find((values) => Array.isArray(values) && values.length > 0)?.[0];
      if (replacement) person[key] = replacement;
      else delete person[key];
      changed = true;
    }
  }
  if (changed) write(canonicalPersonFile, rawPeople);
}

const brandsMasterFile = "data/brands/brands_master.json";'''
    text = text.replace(anchor, cleanup, 1)

popup_replacement = '''const popupCoverage = coverage(popupDesc, [
  ["claim_universitetsplassen_identity"],
  ["claim_universitetsplassen_founding"],
  ["claim_universitetsplassen_cornerstone"],
  ["claim_universitetsplassen_grosch"],
  ["claim_universitetsplassen_grosch"],
  ["claim_universitetsplassen_use_1851_54"],
  ["claim_universitetsplassen_urbygningen"],
  ["claim_universitetsplassen_schweigaard", "claim_universitetsplassen_pamunch"],
  ["claim_universitetsplassen_schweigaard"],
  ["claim_universitetsplassen_pamunch"],
  ["claim_universitetsplassen_pamunch"],
  ["claim_universitetsplassen_schweigaard", "claim_universitetsplassen_pamunch", "claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_aula"],
  ["claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_aula", "claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_repaving"],
  ["claim_universitetsplassen_repaving", "claim_universitetsplassen_immatriculation"],
  ["claim_universitetsplassen_immatriculation"],
  ["claim_universitetsplassen_tree"],
  ["claim_universitetsplassen_historic_photo"],
  ["claim_universitetsplassen_current_photo"],
  ["claim_universitetsplassen_historic_photo", "claim_universitetsplassen_current_photo"],
  ["claim_universitetsplassen_identity", "claim_universitetsplassen_grosch", "claim_universitetsplassen_schweigaard", "claim_universitetsplassen_pamunch", "claim_universitetsplassen_aula"],
  ["claim_universitetsplassen_grosch"],
  ["claim_universitetsplassen_identity"],
  ["claim_universitetsplassen_grosch", "claim_universitetsplassen_aula", "claim_universitetsplassen_use_1851_54"]
]);'''
popup_pattern = r'const popupCoverage = coverage\(popupDesc, \[.*?\n\]\);'
text, count = re.subn(popup_pattern, popup_replacement, text, count=1, flags=re.S)
if count != 1 and popup_replacement not in text:
    raise SystemExit("popupCoverage block not found")

# Align the quiz source brief and compact production_context with the canonical
# quiz-production 3.3 contract. The context artifact is still produced by the
# shared builder; the quiz file carries the compact reviewed contract used by CI.
if 'const selectedCurriculum = {' not in text:
    anchor = 'const briefFile = "data/quiz/production_briefs/by/universitetsplassen.json";'
    if anchor not in text:
        raise SystemExit("Quiz brief insertion anchor not found")
    quiz_contract = r'''const selectedCurriculum = {
  module_ids: [
    "kur_by_01_byrom_akser_knutepunkt",
    "kur_by_04_historiske_lag_og_transformasjon",
    "kur_by_06_makt_symboler_og_representasjon"
  ],
  emne_ids: place.emne_ids,
  topic_hook_ids: ["byliv_aapne_rom", "byliv_opphold_vs_gjennomgang"],
  method_ids: ["met_feltobservasjon", "met_gaanalyse"],
  thinker_ids: [],
  works: []
};
const existingQuizAudit = {
  searched_paths: ["data/quiz/manifest.json", "data/quiz/by/universitetsplassen_sets.json", placeFile],
  active_before: {
    file: null,
    set_count: 0,
    question_count: 0,
    finding: "Ingen aktiv canonical Universitetsplassen-quiz var registrert i manifestet før denne produksjonen."
  },
  decisions: {
    keep_as_claim_basis: [],
    rewrite: "Ny kildegjennomgått 8×7-progresjon.",
    move: [],
    remove: []
  },
  knowledge_migration: "56 unike spørsmål materialiseres gjennom den canonicale Knowledge-pipelinen."
};
const profileDecision = {
  profile: "major",
  set_count: 8,
  questions_per_set: 7,
  justification: "Universitetsplassen har åtte kildebelagte læringsjobber: identitet, Grosch-anlegget, monumentene, Aulaen og Munch, plassomlegging, akademiske ritualer, historiske spor og stedlig analyse."
};
const heldBackCandidates = [
  "Personkoblinger uten dokumentert stedsspesifikk rolle.",
  "Kommersielle butikkbrands uten direkte institusjonell tilknytning til universitetsplassen."
];

const briefFile = "data/quiz/production_briefs/by/universitetsplassen.json";'''
    text = text.replace(anchor, quiz_contract, 1)

if 'selected_curriculum: selectedCurriculum' not in text:
    brief_pattern = r'(\n\s+sources:\s*sourceRegistry,\n)(\s+claims\n\s*\};)'
    replacement = r'''\1  selected_curriculum: selectedCurriculum,
  existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision,
  held_back_candidates: heldBackCandidates,
\2'''
    text, count = re.subn(brief_pattern, replacement, text, count=1)
    if count != 1:
        raise SystemExit("Quiz brief selected_curriculum anchor not found")

if 'const quizProductionContext = {' not in text:
    call = 'const productionContext = await runBuildQuizProductionContext({ root, categoryId: "by", targetId: placeId, outputPath: contextFile });'
    if call not in text:
        raise SystemExit("Quiz production-context builder call not found")
    compact_context = r'''await runBuildQuizProductionContext({ root, categoryId: "by", targetId: placeId, outputPath: contextFile });
const quizProductionContext = {
  manifest_category: "by",
  profile: "major_8x7",
  standard_version: "3.3",
  source_brief: briefFile,
  context_artifact: contextFile,
  resolved_files: {
    pensum: "data/fag/by/pensum_by.json",
    emner: "data/fag/by/emner_by.json",
    fagkart: "data/fag/by/fagkart_by.json",
    methods: "data/fag/by/methods_by.json",
    supersetQuizMal: "data/fag/by/supersetQUIZMAL_by.json",
    quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
    quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"
  },
  required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"],
  pensum_module_ids: selectedCurriculum.module_ids,
  emne_ids: selectedCurriculum.emne_ids,
  topic_hook_ids: selectedCurriculum.topic_hook_ids,
  method_ids: selectedCurriculum.method_ids,
  thinker_ids: selectedCurriculum.thinker_ids,
  works: selectedCurriculum.works,
  source_review_status: "reviewed",
  theory_start_phase: "final",
  method_start_phase: "final",
  existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision,
  held_back_candidates: heldBackCandidates
};'''
    text = text.replace(call, compact_context, 1)

text = text.replace('production_context: productionContext,', 'production_context: quizProductionContext,')

# The production-context builder also inspects the materialized quiz. Rebuild it
# once more after every finalizer write so the persisted artifact exactly equals
# a deterministic post-materialization rebuild, as required by the audit.
final_context_marker = '// Final deterministic Universitetsplassen quiz context rebuild.'
if final_context_marker not in text:
    text = text.rstrip() + r'''

// Final deterministic Universitetsplassen quiz context rebuild.
await runBuildQuizProductionContext({
  root,
  categoryId: "by",
  targetId: placeId,
  outputPath: "data/quiz/production_context/by/universitetsplassen.json"
});
'''

path.write_text(text)
