import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DATE = "2026-07-23";
const placeId = "radmannsgarden_og_anatomibygget";
const scopePath = "reports/visitoslo-galleries-audit-20260723/priority-tranche/scope-resolution.json";
const scope = JSON.parse(readFileSync(scopePath, "utf8"));
const reuse = scope.existingPhysicalReuse?.find?.((row) => row.placeId === placeId)
  ?? scope.reuseExistingPhysicalPlaces?.find?.((row) => row.placeId === placeId)
  ?? scope.results?.find?.((row) => row.placeId === placeId || row.resolvedPlaceId === placeId);

// The merged scope is authoritative even if its machine-readable field name changes.
const scopeText = JSON.stringify(scope);
if (!scopeText.includes("oslo_kunstforening") || !scopeText.includes(placeId)) {
  throw new Error("Merged gallery scope does not contain the locked Oslo Kunstforening -> Rådmannsgården reuse decision.");
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const indexed = places.find((place) => place.id === placeId);
if (!indexed) throw new Error(`Missing canonical ${placeId} on current main.`);
if (!indexed.sourceFile) throw new Error(`${placeId} has no sourceFile in runtime index.`);

const sourceFile = path.join("data", indexed.sourceFile);
const raw = JSON.parse(readFileSync(sourceFile, "utf8"));

function updateRecord(record) {
  if (!record || record.id !== placeId) return false;

  const institutionalParagraph = "Siden 1936 har Oslo Kunstforening holdt til i andre etasje av Rådmannsgården i Rådhusgata 19. Foreningen ble etablert i 1836 og er et ikke-kommersielt, medlemsbasert visningssted for samtidskunst. I History Go behandles dette som et nåværende institusjons- og brukslag i den allerede canonical historiske bygningsidentiteten, ikke som en ny overlappende markør.";
  const currentPopup = String(record.popupDesc ?? "").trim();
  if (!currentPopup.includes("Oslo Kunstforening")) {
    record.popupDesc = currentPopup ? `${currentPopup}\n\n${institutionalParagraph}` : institutionalParagraph;
  }

  const currentDesc = String(record.desc ?? "").trim();
  if (currentDesc && !currentDesc.includes("Oslo Kunstforening")) {
    record.desc = `${currentDesc} Bygningen rommer også Oslo Kunstforening, som har hatt fast tilhold her siden 1936.`;
  }

  const links = Array.isArray(record.externalLinks) ? record.externalLinks : [];
  if (!links.some((link) => String(link?.url ?? "").includes("oslokunstforening.no"))) {
    links.push({
      type: "official",
      label: "Oslo Kunstforening – om institusjonen",
      url: "https://www.oslokunstforening.no/om-oss",
      lang: "nb",
      verifiedAt: DATE
    });
  }
  record.externalLinks = links;

  if (record.quiz_profile && typeof record.quiz_profile === "object") {
    const signatures = Array.isArray(record.quiz_profile.signature_features) ? record.quiz_profile.signature_features : [];
    const feature = "Oslo Kunstforening har holdt til i Rådmannsgården siden 1936";
    if (!signatures.includes(feature)) signatures.push(feature);
    record.quiz_profile.signature_features = signatures;

    const mustInclude = Array.isArray(record.quiz_profile.must_include) ? record.quiz_profile.must_include : [];
    const must = "dagens bruk som hjem for Oslo Kunstforening siden 1936";
    if (!mustInclude.includes(must)) mustInclude.push(must);
    record.quiz_profile.must_include = mustInclude;
  }

  return true;
}

let updated = false;
if (Array.isArray(raw)) {
  for (const record of raw) updated = updateRecord(record) || updated;
} else if (raw && Array.isArray(raw.places)) {
  for (const record of raw.places) updated = updateRecord(record) || updated;
} else {
  updated = updateRecord(raw);
}
if (!updated) throw new Error(`Could not find ${placeId} inside ${sourceFile}.`);

writeFileSync(sourceFile, `${JSON.stringify(raw, null, 2)}\n`, "utf8");

const reportDir = "reports/visitoslo-galleries-audit-20260723/priority-tranche";
mkdirSync(reportDir, { recursive: true });
writeFileSync(`${reportDir}/oslo-kunstforening-reuse-enrichment.json`, `${JSON.stringify({
  version: DATE,
  sourceItem: "Oslo Kunstforening",
  decision: "reuse_and_enrich_existing_physical_place",
  placeId,
  sourceFile: indexed.sourceFile,
  institutionFounded: 1836,
  institutionAtCurrentBuildingSince: 1936,
  officialAddress: "Rådhusgata 19, 0158 Oslo",
  rationale: "Oslo Kunstforening is a durable non-commercial institution, but it occupies the already canonical Rådmannsgården physical identity. The institutional use is added as a current layer instead of creating an overlapping marker.",
  officialSource: "https://www.oslokunstforening.no/om-oss",
  sourceScopeReport: scopePath,
  scopeFieldHint: reuse ? "explicit_machine_readable_match" : "validated_by_locked_scope_text"
}, null, 2)}\n`, "utf8");

console.log(`Enriched ${placeId} with Oslo Kunstforening current institutional layer.`);
console.log(`Source file: ${sourceFile}`);
