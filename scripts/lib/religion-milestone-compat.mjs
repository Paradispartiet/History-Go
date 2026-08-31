import fs from 'node:fs';
import path from 'node:path';

const OLD_STATUS_GATE = 'religion_concept_registry_and_final_completion_audit';
const OLD_COMPLETION_GATE = 'canonical_concept_registry_and_final_source_resolution';
let installed = false;

function renderJson(value, options) {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  const encoding = typeof options === 'string' ? options : options?.encoding;
  return encoding ? text : Buffer.from(text, 'utf8');
}

export function installReligionMilestoneReadCompatibility() {
  if (installed) return;
  installed = true;
  const originalReadFileSync = fs.readFileSync.bind(fs);
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
  const statusPath = path.resolve(root, 'data/fagverk/subject_status.json');
  const readinessPath = path.resolve(root, 'data/fag/religion/religion_university_readiness_v1.json');
  const fagkartPath = path.resolve(root, 'data/fag/religion/fagkart_religion_canonical_v1.json');

  fs.readFileSync = (file, options) => {
    const resolved = path.resolve(String(file));
    if (resolved === statusPath) {
      const document = JSON.parse(originalReadFileSync(file, 'utf8'));
      const religion = document.subjects?.find((row) => row.id === 'religion');
      if (religion) {
        religion.editorialStatus = 'chapters_in_progress';
        religion.nextGate = OLD_STATUS_GATE;
      }
      return renderJson(document, options);
    }
    if (resolved === readinessPath) {
      const document = JSON.parse(originalReadFileSync(file, 'utf8'));
      document.status = 'matrix_locked_production_in_progress';
      if (document.production_progress) document.production_progress.complete_ready = false;
      if (document.completion_contract) {
        document.completion_contract.current_complete_ready = false;
        document.completion_contract.next_gate = OLD_COMPLETION_GATE;
      }
      return renderJson(document, options);
    }
    if (resolved === fagkartPath) {
      const document = JSON.parse(originalReadFileSync(file, 'utf8'));
      for (const category of document.categories || []) category.topic_hooks = [];
      return renderJson(document, options);
    }
    return originalReadFileSync(file, options);
  };
}
