#!/usr/bin/env node
import process from "node:process";
import {
  MANIFEST_PATH,
  PACKAGE_SCHEMA_PATH,
  asArray,
  buildQuizProductionContext,
  collectQuestions,
  curriculumIndexes,
  exists,
  hasText,
  hookThinker,
  isCli,
  loadProductionInputs,
  loadProductionTarget,
  readFileRecord,
  readJson
} from "./quiz-production-lib.mjs";

function sameValues(a, b) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

function addFailure(failures, file, reason, details = {}) {
  failures.push({ file, reason, ...details });
}

function validateRequiredFields({ value, requiredFields, file, scope, failures }) {
  for (const field of requiredFields) {
    const present = Array.isArray(value?.[field])
      ? true
      : value?.[field] !== undefined && value?.[field] !== null && value?.[field] !== "";
    if (!present) addFailure(failures, file, `${scope} mangler ${field}`);
  }
}

function validateQuestionClaim({ question, claim, file, failures }) {
  if (!claim) {
    addFailure(failures, file, "spørsmål viser til ukjent claim_id", {
      questionId: question.id,
      claimId: question.claim_id
    });
    return;
  }
  if ((question.claim_basis || question.knowledge) !== claim.statement) {
    addFailure(failures, file, "claim_basis avviker fra kildegrunnlaget", {
      questionId: question.id,
      claimId: question.claim_id
    });
  }
  if (!sameValues(asArray(question.source), asArray(claim.source_ids))) {
    addFailure(failures, file, "spørsmålets kilder avviker fra kildegrunnlaget", {
      questionId: question.id,
      claimId: question.claim_id
    });
  }
  for (const field of ["emne_id", "method_id", "topic_hook_id", "thinker_id", "work"]) {
    if (claim[field] !== undefined && question[field] !== claim[field]) {
      addFailure(failures, file, `spørsmålet avviker fra claim.${field}`, {
        questionId: question.id,
        claimId: question.claim_id,
        expected: claim[field],
        actual: question[field]
      });
    }
  }
}

export async function auditQuizProductionContext({ root = process.cwd() } = {}) {
  const manifest = await readJson(root, MANIFEST_PATH);
  const packageSchema = await readJson(root, PACKAGE_SCHEMA_PATH);
  const failures = [];
  const checked = [];

  for (const [categoryId, entry] of Object.entries(manifest)) {
    if (!entry?.quizProduction) continue;

    let loaded;
    try {
      loaded = await loadProductionInputs({ root, categoryId });
    } catch (error) {
      addFailure(failures, MANIFEST_PATH, error.message, { categoryId });
      continue;
    }
    const indexes = curriculumIndexes(loaded.records);
    const targets = entry.quizProduction.targets;
    if (!targets || typeof targets !== "object" || Array.isArray(targets)) {
      addFailure(failures, MANIFEST_PATH, "quizProduction.targets mangler", { categoryId });
      continue;
    }

    for (const targetId of Object.keys(targets)) {
      let targetProduction;
      try {
        targetProduction = await loadProductionTarget({ root, loaded, targetId });
      } catch (error) {
        addFailure(failures, MANIFEST_PATH, error.message, { categoryId, targetId });
        continue;
      }

      const { paths, brief, briefRecord } = targetProduction;
      const quizPath = paths.quiz_file;
      validateRequiredFields({
        value: brief,
        requiredFields: packageSchema.source_brief_contract.required_fields,
        file: paths.source_brief,
        scope: "source_brief",
        failures
      });
      for (const [sourceId, source] of Object.entries(brief.sources)) {
        validateRequiredFields({
          value: source,
          requiredFields: packageSchema.source_brief_contract.source_required_fields,
          file: paths.source_brief,
          scope: `source_brief.sources.${sourceId}`,
          failures
        });
      }
      for (const claim of brief.claims) {
        validateRequiredFields({
          value: claim,
          requiredFields: packageSchema.source_brief_contract.claim_required_fields,
          file: paths.source_brief,
          scope: `source_brief.claims.${claim.claim_id || "uten_id"}`,
          failures
        });
      }
      if (!(await exists(root, quizPath))) {
        addFailure(failures, quizPath, "auditert quizfil mangler", { categoryId, targetId });
        continue;
      }

      const quizRecord = await readFileRecord(root, quizPath);
      const quiz = quizRecord.data;
      const context = quiz.production_context;
      const questions = collectQuestions(quiz);
      const claimById = new Map(asArray(brief.claims).map((claim) => [claim.claim_id, claim]));
      checked.push({ categoryId, file: quizPath, targetId, questions: questions.length });

      validateRequiredFields({
        value: quiz,
        requiredFields: packageSchema.required_top_fields,
        file: quizPath,
        scope: "quizpakken",
        failures
      });
      validateRequiredFields({
        value: context,
        requiredFields: packageSchema.production_context.required_fields,
        file: quizPath,
        scope: "production_context",
        failures
      });

      if (!context) continue;
      if (quiz.targetId !== targetId || quiz.categoryId !== categoryId || context.manifest_category !== categoryId) {
        addFailure(failures, quizPath, "kategori eller mål stemmer ikke med manifestet", {
          categoryId,
          targetId,
          quizCategory: quiz.categoryId,
          quizTarget: quiz.targetId,
          manifestCategory: context.manifest_category
        });
      }
      if (context.source_brief !== paths.source_brief) {
        addFailure(failures, quizPath, "production_context.source_brief er feil", {
          expected: paths.source_brief,
          actual: context.source_brief
        });
      }
      if (context.context_artifact !== paths.context_artifact) {
        addFailure(failures, quizPath, "production_context.context_artifact er feil", {
          expected: paths.context_artifact,
          actual: context.context_artifact
        });
      }
      if (context.source_review_status !== brief.status) {
        addFailure(failures, quizPath, "source_review_status avviker fra kildegrunnlaget", {
          expected: brief.status,
          actual: context.source_review_status
        });
      }
      if (!sameValues(asArray(context.required_inputs_loaded), loaded.requiredInputs)) {
        addFailure(failures, quizPath, "required_inputs_loaded stemmer ikke med manifestet", {
          expected: loaded.requiredInputs,
          actual: context.required_inputs_loaded
        });
      }

      for (const [key, metadata] of Object.entries(loaded.resolvedFiles)) {
        if (context.resolved_files?.[key] !== metadata.path) {
          addFailure(failures, quizPath, `production_context.resolved_files.${key} er feil`, {
            expected: metadata.path,
            actual: context.resolved_files?.[key]
          });
        }
      }

      for (const moduleId of asArray(context.pensum_module_ids)) {
        if (!indexes.moduleById.has(moduleId)) addFailure(failures, quizPath, "ukjent pensummodul", { moduleId });
      }
      for (const emneId of asArray(context.emne_ids)) {
        if (!indexes.emneById.has(emneId)) addFailure(failures, quizPath, "ukjent emne", { emneId });
      }
      for (const methodId of asArray(context.method_ids)) {
        if (!indexes.methodById.has(methodId)) addFailure(failures, quizPath, "ukjent metode", { methodId });
      }
      for (const hookId of asArray(context.topic_hook_ids)) {
        if (!indexes.hookById.has(hookId)) addFailure(failures, quizPath, "ukjent teorihook", { hookId });
      }
      for (const thinkerId of asArray(context.thinker_ids)) {
        const found = asArray(context.topic_hook_ids).some((hookId) => hookThinker(indexes, hookId, thinkerId).thinker);
        if (!found) addFailure(failures, quizPath, "teoretiker finnes ikke i valgte hooks", { thinkerId });
      }
      for (const work of asArray(context.works)) {
        const found = asArray(context.topic_hook_ids).some((hookId) => {
          const hook = indexes.hookById.get(hookId);
          return asArray(hook?.canon?.thinkers).some((thinker) => asArray(thinker.works).includes(work));
        });
        if (!found) addFailure(failures, quizPath, "verk finnes ikke i valgte hooks", { work });
      }

      const seenClaims = new Set();
      for (const question of questions) {
        if (!hasText(question.claim_id)) {
          addFailure(failures, quizPath, "spørsmål mangler claim_id", { questionId: question.id });
        } else {
          validateQuestionClaim({
            question,
            claim: claimById.get(question.claim_id),
            file: quizPath,
            failures
          });
          if (seenClaims.has(question.claim_id)) {
            addFailure(failures, quizPath, "flere spørsmål bruker samme claim_id", {
              questionId: question.id,
              claimId: question.claim_id
            });
          }
          seenClaims.add(question.claim_id);
        }
        if (!indexes.emneById.has(question.emne_id)) {
          addFailure(failures, quizPath, "spørsmål har ukjent emne_id", {
            questionId: question.id,
            emneId: question.emne_id
          });
        }
        for (const sourceId of asArray(question.source)) {
          const sourceReview = brief.sources[sourceId];
          if (!sourceReview) {
            addFailure(failures, quizPath, "spørsmål viser til ukjent kilde-ID", {
              questionId: question.id,
              sourceId
            });
          } else if (sourceReview.review_status !== "reviewed") {
            addFailure(failures, paths.source_brief, "publisert spørsmål bruker kilde som ikke er ferdig gjennomgått", {
              questionId: question.id,
              sourceId,
              reviewStatus: sourceReview.review_status
            });
          }
          if (quiz.sources?.[sourceId] !== sourceReview?.url) {
            addFailure(failures, quizPath, "quizens kilde-URL avviker fra kildegrunnlaget", {
              questionId: question.id,
              sourceId
            });
          }
        }
      }
      if (seenClaims.size !== claimById.size) {
        addFailure(failures, quizPath, "quizen dekker ikke alle godkjente påstander én gang", {
          quizClaims: seenClaims.size,
          briefClaims: claimById.size
        });
      }

      if (!(await exists(root, paths.context_artifact))) {
        addFailure(failures, paths.context_artifact, "context_artifact mangler");
        continue;
      }

      const artifact = await readJson(root, paths.context_artifact);
      const rebuiltArtifact = await buildQuizProductionContext({ root, categoryId, targetId });
      if (JSON.stringify(artifact) !== JSON.stringify(rebuiltArtifact)) {
        addFailure(failures, paths.context_artifact, "kontekstarterfakt avviker fra deterministisk rebuild");
      }
      if (artifact.categoryId !== categoryId || artifact.targetId !== targetId) {
        addFailure(failures, paths.context_artifact, "kontekstarterfakt peker til feil mål", {
          expectedCategory: categoryId,
          expectedTarget: targetId,
          actualCategory: artifact.categoryId,
          actualTarget: artifact.targetId
        });
      }
      if (artifact.profile !== context.profile) {
        addFailure(failures, paths.context_artifact, "profil avviker fra quizpakken", {
          expected: context.profile,
          actual: artifact.profile
        });
      }
      if (artifact.source_review_status !== brief.status) {
        addFailure(failures, paths.context_artifact, "kildegjennomgangsstatus avviker fra source_brief");
      }
      if (artifact.planned_quiz_file !== quizPath) {
        addFailure(failures, paths.context_artifact, "planlagt quizfil avviker fra manifestet");
      }
      if (
        artifact.source_files?.brief?.path !== paths.source_brief
        || artifact.source_files?.brief?.bytes !== briefRecord.bytes
        || artifact.source_files?.brief?.sha256 !== briefRecord.sha256
      ) {
        addFailure(failures, paths.context_artifact, "kildegrunnlagets resolverbevis er utdatert");
      }

      for (const [key, metadata] of Object.entries(loaded.resolvedFiles)) {
        const artifactMetadata = artifact.resolved_files?.[key];
        if (
          artifactMetadata?.path !== metadata.path
          || artifactMetadata?.bytes !== metadata.bytes
          || artifactMetadata?.sha256 !== metadata.sha256
        ) {
          addFailure(failures, paths.context_artifact, `resolverbevis er utdatert for ${key}`);
        }
      }

      const selectionPairs = [
        ["pensum_module_ids", "module_ids"],
        ["emne_ids", "emne_ids"],
        ["topic_hook_ids", "topic_hook_ids"],
        ["method_ids", "method_ids"],
        ["thinker_ids", "thinker_ids"],
        ["works", "works"]
      ];
      for (const [contextKey, artifactKey] of selectionPairs) {
        if (!sameValues(asArray(context[contextKey]), asArray(artifact.selected_curriculum?.[artifactKey]))) {
          addFailure(failures, paths.context_artifact, `valgt fagkontekst avviker: ${contextKey}`);
        }
      }
      if (asArray(artifact.claim_bank).length !== questions.length) {
        addFailure(failures, paths.context_artifact, "påstandsbanken dekker ikke alle spørsmål", {
          claims: asArray(artifact.claim_bank).length,
          questions: questions.length
        });
      }

      for (const [index, set] of asArray(quiz.sets).entries()) {
        const plannedSet = artifact.set_plan?.[index];
        const actualClaimIds = asArray(set.questions).map((question) => question.claim_id);
        if (
          plannedSet?.set_id !== set.set_id
          || plannedSet?.phase !== set.phase
          || JSON.stringify(asArray(plannedSet?.claim_ids)) !== JSON.stringify(actualClaimIds)
        ) {
          addFailure(failures, paths.context_artifact, "sett følger ikke den forhåndsbygde påstandsplanen", {
            setId: set.set_id
          });
        }
      }
    }
  }

  return {
    status: failures.length ? "failed" : "passed",
    categoriesWithQuizProduction: Object.values(manifest).filter((entry) => entry?.quizProduction).length,
    quizFilesChecked: checked.length,
    checked,
    failures
  };
}

async function main() {
  const report = await auditQuizProductionContext();
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.status === "passed" ? 0 : 1;
}

if (isCli(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
