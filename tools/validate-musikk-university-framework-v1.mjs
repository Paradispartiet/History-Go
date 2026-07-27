#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const REV = "musikk-university-framework-v1-2026-07-27";
const BASE = process.env.MUSIKK_UNIVERSITY_BASE || "data/fag/musikk/musikkvitenskap_canonical_v1/university_v1";
const SCIENTIFIC_INDEX = process.env.MUSIKK_SCIENTIFIC_INDEX || "data/fag/musikk/musikkvitenskap_canonical_v1/index.json";
const SCIENTIFIC_PACKAGE = process.env.MUSIKK_SCIENTIFIC_PACKAGE || "data/fag/musikk/scientific_package.json";
const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
let pass = 0;
const ok = (value, message) => {
  if (!value) throw new Error(`FAIL | ${message}`);
  console.log(`PASS | ${message}`);
  pass++;
};

const index = read(path.join(BASE, "index.json"));
const outcomes = read(path.join(BASE, index.files.programme_learning_outcomes));
const courseFiles = index.files.course_files.map(file => read(path.join(BASE, file)));
const courses = courseFiles.flatMap(file => file.courses);
const assessment = read(path.join(BASE, index.files.assessment_framework));
const writing = read(path.join(BASE, index.files.research_and_writing_standard));
const benchmarks = read(path.join(BASE, index.files.benchmark_sources));
const quality = read(path.join(BASE, index.files.quality_assurance));
const scientificIndex = read(SCIENTIFIC_INDEX);
const scientificPackage = read(SCIENTIFIC_PACKAGE);

for (const file of [
  index.files.programme_learning_outcomes,
  ...index.files.course_files,
  index.files.assessment_framework,
  index.files.research_and_writing_standard,
  index.files.benchmark_sources,
  index.files.quality_assurance
]) ok(fs.existsSync(path.join(BASE, file)), `Universitetsfil finnes: ${file}`);

ok(index.revision === REV, "Indeks har riktig revisjon");
ok(index.status === "canonical_university_level_curriculum_model", "Universitetsstatus er canonical");
ok(index.formal_accreditation === false, "Ingen falsk akkrediteringspåstand");
ok(index.qualification_alignment.nkr === "6.2", "NKR 6.2 er mål");
ok(index.qualification_alignment.eqf === 6, "EQF 6 er mål");
ok(index.qualification_alignment.qf_ehea === "first_cycle", "QF-EHEA første syklus er mål");
ok(index.qualification_alignment.ects === 180, "Universitetsrammen er 180 studiepoeng");

const groups = outcomes.programme_learning_outcomes;
const outcomeList = Object.values(groups).flat();
const outcomeIds = outcomeList.map(x => x.outcome_id);
ok(groups.knowledge.length >= 8, "Minst åtte kunnskapsutbytter");
ok(groups.skills.length >= 8, "Minst åtte ferdighetsutbytter");
ok(groups.general_competence.length >= 8, "Minst åtte generelle kompetanser");
ok(new Set(outcomeIds).size === outcomeIds.length, "Programlæringsutbytter har unike ID-er");
for (const outcome of outcomeList) ok(outcome.statement.length >= 45, `${outcome.outcome_id} er substansielt`);

const courseIds = courses.map(c => c.course_id);
ok(new Set(courseIds).size === courseIds.length, "Emnekoder er unike");
ok(courses.length === index.summary.course_count, "Emneantall matcher indeks");
ok(courses.reduce((s,c) => s + c.ects, 0) === 180, "Studieløpet summerer til 180 studiepoeng");
ok(courses.filter(c => c.status === "required").reduce((s,c) => s + c.ects, 0) === 150, "Obligatorisk del summerer til 150 studiepoeng");
ok(courses.filter(c => c.status === "elective").reduce((s,c) => s + c.ects, 0) === 30, "Valgfri del summerer til 30 studiepoeng");
for (let semester = 1; semester <= 6; semester++) {
  ok(courses.filter(c => c.semester === semester).reduce((s,c) => s + c.ects, 0) === 30, `Semester ${semester} summerer til 30 studiepoeng`);
}
for (const course of courses) {
  ok(course.ects > 0, `${course.course_id} har studiepoeng`);
  ok(Array.isArray(course.prerequisites), `${course.course_id} har eksplisitt forkunnskapsfelt`);
  for (const prereq of course.prerequisites.filter(x => x.startsWith("HG-"))) ok(courseIds.includes(prereq), `${course.course_id} har gyldig forkunnskapsreferanse ${prereq}`);
  ok(course.content.length >= 3, `${course.course_id} har faglig innhold`);
  ok(course.teaching_and_learning.length >= 2, `${course.course_id} har varierte læringsformer`);
  ok(course.compulsory_activities.length >= 2, `${course.course_id} har arbeidskrav`);
  ok(course.assessment?.components?.length >= 1, `${course.course_id} har vurderingskomponent`);
  for (const outcomeId of course.programme_outcome_ids) ok(outcomeIds.includes(outcomeId), `${course.course_id} refererer gyldig læringsutbytte ${outcomeId}`);
}
for (const outcomeId of outcomeIds) {
  ok(courses.some(c => c.programme_outcome_ids.includes(outcomeId)), `${outcomeId} dekkes av minst ett emne`);
  ok(courses.some(c => c.semester >= 4 && c.programme_outcome_ids.includes(outcomeId)), `${outcomeId} vurderes på høyere progresjonsnivå`);
}

const thesis = courses.find(c => c.course_id === "HG-MUS390");
ok(!!thesis, "Bacheloroppgaven finnes");
ok(thesis.ects === 15, "Bacheloroppgaven er 15 studiepoeng");
ok(thesis.prerequisites.includes("120_ects_completed"), "Bacheloroppgaven krever 120 studiepoeng");
ok(thesis.assessment.external_examiner_required === true, "Bacheloroppgaven krever ekstern sensor");
ok(assessment.bachelor_thesis_contract.oral_defence_required === true, "Bacheloroppgaven krever muntlig forsvar");
ok(assessment.bachelor_thesis_contract.supervision_minimum_meetings >= 2, "Bacheloroppgaven krever veiledning");

ok(assessment.rubric_dimensions.length >= 8, "Vurderingsrammen har minst åtte dimensjoner");
ok(assessment.assessment_security.authorship_controls.length >= 3, "Forfatterskapskontroll er definert");
ok(writing.academic_writing_standard.required_moves.length >= 8, "Akademisk skrivekontrakt er komplett");
ok(writing.research_training.information_literacy.length >= 5, "Informasjonskompetanse er definert");
ok(writing.ai_and_academic_integrity.student_responsibility.length >= 3, "AI-ansvar er eksplisitt");
ok(benchmarks.sources.length >= 10, "Minst ti offisielle benchmarkkilder");
for (const source of benchmarks.sources) {
  ok(source.url.startsWith("https://"), `${source.source_id} har inspectable URL`);
  ok(source.criteria_used.length >= 2, `${source.source_id} har eksplisitt bruk`);
}
ok(quality.annual_quality_cycle.length >= 6, "Årlig kvalitetskrets er komplett");
ok(quality.external_review.interval_years <= 3, "Ekstern fagfellevurdering skjer minst hvert tredje år");
for (const [gate, value] of Object.entries(quality.coverage_gates)) ok(value === true, `Kvalitetsport aktiv: ${gate}`);

const modesByYear = new Map([[1,new Set()],[2,new Set()],[3,new Set()]]);
for (const course of courses) modesByYear.get(Math.ceil(course.semester/2)).add(course.assessment.type);
for (const [year, modes] of modesByYear) ok(modes.size >= 2, `Studieår ${year} har minst to vurderingsformer`);

ok(scientificIndex.summary.domain_count === 8, "Universitetsrammen bygger på åtte vitenskapelige domener");
ok(scientificIndex.files.university_framework === "university_v1/index.json", "Vitenskapelig indeks peker på universitetsrammen");
ok(scientificPackage.active_scientific_package === "musikkvitenskap_canonical_v1/index.json", "Vitenskapelig kjerne er fortsatt aktiv autoritet");
ok(scientificPackage.active_university_framework === "musikkvitenskap_canonical_v1/university_v1/index.json", "Fagpakken aktiverer universitetsrammen");
ok(!fs.existsSync(path.join(BASE, "overlay")), "Ingen universitets-overlay finnes");
console.log(`PASS: ${pass}`);
console.log("RESULTAT: PASS");
