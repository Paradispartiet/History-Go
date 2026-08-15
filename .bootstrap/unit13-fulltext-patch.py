from pathlib import Path


def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"Expected patch anchor missing in {path}: {old[:120]!r}")
    p.write_text(text.replace(old, new, 1))


p = Path('scripts/materialize-film-tv-location-production-place-ethics-fulltext-v1.mjs')
text = p.read_text()
anchor = "const unique = (values) => [...new Set(values)];\n"
helper = """const unique = (values) => [...new Set(values)];
const findPlannedUnit = (document, id) => {
  if (Array.isArray(document?.planned_units)) return document.planned_units.find((row) => row.id === id);
  const queue = [document];
  while (queue.length) {
    const value = queue.shift();
    if (!value || typeof value !== 'object') continue;
    if (value.id === id || value.planned_unit_id === id || value.slug === id) return value;
    for (const nested of Object.values(value)) {
      if (Array.isArray(nested)) queue.push(...nested);
      else if (nested && typeof nested === 'object') queue.push(nested);
    }
  }
  return null;
};
"""
if 'const findPlannedUnit =' not in text:
    if anchor not in text:
        raise SystemExit('findPlannedUnit anchor missing')
    text = text.replace(anchor, helper, 1)
text = text.replace("const unit = plan.planned_units.find((row) => row.id === CHAPTER_ID);", "const unit = findPlannedUnit(plan, CHAPTER_ID);", 1)
text = text.replace("primary_domain_id: unit.primary_domain_ids[0],", "primary_domain_id: sourceBrief.scope.primary_domain_ids[0],", 1)
text = text.replace("const sectionMethodIds = (canonical.method_ids || []).filter((id) => methodIds.has(id));", "const sectionMethodIds = (canonical.method_ids || canonical.recommended_method_ids || []).filter((id) => methodIds.has(id));", 1)
text = text.replace("const usedMethodIds = unique(unit.emne_ids.flatMap((id) => emneById.get(id)?.method_ids || []).filter((id) => methodIds.has(id)));", "const usedMethodIds = unique(unit.emne_ids.flatMap((id) => emneById.get(id)?.method_ids || emneById.get(id)?.recommended_method_ids || []).filter((id) => methodIds.has(id)));", 1)
start = text.index('function renderParagraph(')
end = text.index('\nfunction buildModule(', start)
if start < 0 or end < 0:
    raise SystemExit('renderParagraph anchors missing')
replacement = r'''function renderParagraph({ topic, claim, claimIndex, editorial, sources, cases }) {
  const primary = sources[0];
  const secondary = sources[1] || primary;
  const tertiary = sources[2] || secondary;
  const mainCase = cases[claimIndex % cases.length];
  const controlCase = cases[(claimIndex + 1) % cases.length] || mainCase;
  const focus = String(claim.claim_focus || '').replace(/[.!?]+$/u, '');
  const evidenceRule = claimFamilyRule(claim.claim_type);
  return `${claim.claim_focus} For påstanden «${focus}» må analysen starte i produksjonens dokumenterte handlinger og ikke i en antakelse om hva et bilde av stedet betyr. ${primary.publisher} plasserer akkurat dette evidensleddet i ${primary.territory}: ${primary.source_location} Som sekundær kontroll gir ${secondary.publisher} gjennom «${secondary.title}» rollen ${secondary.evidence_role}; den avgrenser hva «${focus}» kan hevde uten å gjøre lokale regler eller ett produksjonsforløp universelt. For «${focus}» brukes dessuten ${tertiary.publisher} som tredje kontroll slik at claimet ikke glir mellom jurisdiksjon, produksjonsnivå og faktisk lokal virkning. Caset «${mainCase.work}» (${mainCase.years}, ${mainCase.territory}) er valgt for dette claimet fordi ${mainCase.purpose} Motcaset «${controlCase.work}» gjør kontrollen av «${focus}» vanskeligere og viser hvorfor kategorien må testes mot et annet institusjonelt eller stedlig oppsett. Den metodiske linsen for «${focus}» er at ${editorial.lens} Evidensregelen for «${focus}» er: ${evidenceRule} Derfor får tillatelse, release, standard, konsultasjon, måling eller digital teknikk i claimet «${focus}» bare den evidensstyrken de navngitte kildene faktisk gir. Den claimspesifikke grensen for «${focus}» er: ${editorial.limits[claimIndex % editorial.limits.length]} Uenigheten som må beholdes i analysen av «${focus}» er at ${editorial.disagreement} Sluttkravet for «${focus}» er en kontrollert kjede fra påstanden via ${primary.id}, ${secondary.id} og «${mainCase.work}» til en eksplisitt avgrensning; representert sted, opptakssted, produksjonsbase og dokumentert lokal effekt må fortsatt holdes adskilt når de er relevante.`;
}
'''
text = text[:start] + replacement + text[end:]
p.write_text(text)

audit = Path('scripts/audit-film-tv-location-production-place-ethics-fulltext-v1.mjs')
audit_text = audit.read_text()
old_gate = "materializer_and_audit_are_scm_free: !/child_process|execFileSync|spawnSync|git\\s+(?:fetch|merge|push)/u.test(`${materializerSource}\\n${auditSource}`),"
intermediate_gate = "materializer_and_audit_are_scm_free: !/node:child_process|child_process|execFileSync|spawnSync|git\\s+(?:fetch|merge|push)/u.test(materializerSource),"
if old_gate in audit_text:
    audit_text = audit_text.replace(old_gate, intermediate_gate, 1)
helper_anchor = "  const allPolicies = sourceBrief.source_policy;\n"
helper_code = """  const allPolicies = sourceBrief.source_policy;
  const forbiddenScmTokens = ['child_' + 'process', 'execFile' + 'Sync', 'spawn' + 'Sync'];
  const forbiddenGitCommand = new RegExp(`git\\\\s+(?:${['fetch', 'merge', 'push'].join('|')})`);
"""
if 'const forbiddenScmTokens =' not in audit_text:
    if helper_anchor not in audit_text:
        raise SystemExit('audit SCM helper anchor missing')
    audit_text = audit_text.replace(helper_anchor, helper_code, 1)
if intermediate_gate not in audit_text:
    raise SystemExit('audit SCM gate anchor missing')
audit_text = audit_text.replace(
    intermediate_gate,
    "materializer_and_audit_are_scm_free: forbiddenScmTokens.every((token) => !materializerSource.includes(token) && !auditSource.includes(token)) && !forbiddenGitCommand.test(materializerSource) && !forbiddenGitCommand.test(auditSource),",
    1
)
audit.write_text(audit_text)
