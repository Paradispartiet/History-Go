#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const fullPath = path.join(repoRoot, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function run() {
  global.window = global;

  loadScript('js/Civication/systems/civicationEventChannels.js');

  const plannedRoleMail = {
    status: 'pending',
    event: {
      id: 'ekspeditor_story_001',
      source_type: 'planned',
      mail_type: 'story',
      subject: 'Første arbeidsdag',
      career_id: 'naeringsliv',
      role_id: 'naer_ekspeditor',
      role_content_meta: {
        role_id: 'naer_ekspeditor',
        role_scope: 'ekspeditor'
      }
    }
  };

  const workdayMail = {
    status: 'pending',
    event: {
      id: 'workday_001',
      source_type: 'workday',
      mail_type: 'job_micro',
      task_domain: 'cash_desk',
      career_id: 'naeringsliv'
    }
  };

  const careerOutcomeMail = {
    status: 'pending',
    event: {
      id: 'ekspeditor_outcome_001',
      source_type: 'role_outcome',
      mail_type: 'job_outcome',
      mail_class: 'career_outcome',
      career_id: 'naeringsliv',
      role_id: 'naer_ekspeditor',
      career_outcome_meta: {
        status: 'STAGNATED',
        role_scope: 'ekspeditor',
        role_plan_id: 'ekspeditor_naeringsliv_v1'
      }
    }
  };

  const privateLifeMail = {
    status: 'pending',
    event: {
      id: 'life_001',
      source_type: 'life',
      mail_type: 'personal',
      phase_tag: 'evening'
    }
  };

  const explicitPrivateMail = {
    status: 'pending',
    event: {
      id: 'private_001',
      channel: 'private',
      mail_class: 'private_message'
    }
  };

  const systemMail = {
    status: 'pending',
    event: {
      id: 'system_001',
      source_type: 'system',
      mail_type: 'status'
    }
  };

  assert.strictEqual(
    global.CivicationEventChannels.getMessageChannel(plannedRoleMail.event),
    'job',
    'planned role/story mails with role binding must be jobmail'
  );

  assert.strictEqual(
    global.CivicationEventChannels.getMessageChannel(workdayMail.event),
    'job',
    'workday events must be jobmail'
  );

  assert.strictEqual(
    global.CivicationEventChannels.getMessageChannel(careerOutcomeMail.event),
    'job',
    'career outcome mails must stay in Jobbmail'
  );

  assert.strictEqual(
    global.CivicationEventChannels.getMessageChannel(privateLifeMail.event),
    'private',
    'life/evening mails must be private messages'
  );

  assert.strictEqual(
    global.CivicationEventChannels.getMessageChannel(explicitPrivateMail.event),
    'private',
    'explicit private channel must stay private'
  );

  const split = global.CivicationEventChannels.splitInboxByMessageChannel([
    plannedRoleMail,
    workdayMail,
    careerOutcomeMail,
    privateLifeMail,
    explicitPrivateMail,
    systemMail
  ]);

  assert.strictEqual(split.job.length, 3, 'Expected three jobmail items');
  assert.strictEqual(split.private.length, 2, 'Expected two private message items');
  assert.strictEqual(split.system.length, 1, 'Expected one system item');

  const inspect = global.CivicationEventChannels.inspect([
    plannedRoleMail,
    workdayMail,
    careerOutcomeMail,
    privateLifeMail,
    explicitPrivateMail,
    systemMail
  ]);

  assert.strictEqual(inspect.counts.job, 3, 'Inspect should expose job channel count');
  assert.strictEqual(inspect.counts.private, 2, 'Inspect should expose private channel count');

  console.log('PASS: Civication inbox channel split test completed.');
}

run();
