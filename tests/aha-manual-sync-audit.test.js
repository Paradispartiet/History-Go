const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Adapter = require('../js/ahaManualSyncAdapter.js');
const Repository = require('../js/ahaManualSyncAuditRepository.js');
const Dashboard = require('../js/ahaDashboard.js');

const baseRun = {
  runId: 'run-123',
  timestamp: '2026-06-06T10:00:00.000Z',
  target: 'aha_imports',
  targetStatus: 'ready',
  includedModules: ['lists', 'paths'],
  excludedModules: ['avisa'],
  itemCounts: { lists: 2, paths: 3, avisa: 99 },
  readinessStatus: 'ready',
  validationSummary: { ok: true, checked: 5 },
  checklistSummary: { ok: true, completed: 4, total: 4 },
  confirmation: { confirmed: true, confirmedAt: '2026-06-06T09:59:59.000Z' },
  payload: {
    lists: [{ id: 'one' }, { id: 'two' }],
    paths: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    avisa: [{ id: 'excluded' }],
    accessToken: 'must-not-enter-audit',
    connectionString: 'postgres://must-not-enter-audit',
    nested: { password: 'must-not-enter-audit-either' }
  }
};

function run(overrides = {}, suffix = Math.random().toString(16).slice(2)) {
  return {
    ...baseRun,
    ...overrides,
    runId: overrides.runId || `${baseRun.runId}-${suffix}`,
    confirmation: overrides.confirmation || { ...baseRun.confirmation, confirmedAt: `${baseRun.confirmation.confirmedAt}-${suffix}` }
  };
}

function successfulAuditResult(entry) {
  return {
    ok: true,
    status: 'success',
    auditId: `audit-${entry.runId}-${entry.phase}`,
    runId: entry.runId,
    target: entry.target,
    phase: entry.phase,
    writtenAt: '2026-06-06T10:00:01.000Z',
    errors: [],
    warnings: []
  };
}

async function executeWithAudit(runInput, writeTarget, auditOverride) {
  const entries = [];
  const result = await Adapter.executeAhaManualSyncRun(runInput, {
    writeTarget,
    auditWriter: async (entry) => {
      entries.push(entry);
      return auditOverride ? auditOverride(entry, entries.length) : successfulAuditResult(entry);
    }
  });
  return { result, entries };
}

(async () => {
  Adapter.resetAhaManualSyncDuplicateGuardForTests();

  // Loading modules and creating UI view models are side-effect free.
  let auditCalls = 0;
  Dashboard.createAhaManualSyncAuditViewModel({ auditStatus: 'not_configured' });
  ({ ...baseRun, target: 'another_target' });
  ({ ...baseRun, confirmation: { confirmed: false } });
  assert.strictEqual(auditCalls, 0, 'page load, Sync Hub open, target select, and modal open do not sync or audit');

  let writtenPayload = null;
  const successRun = run({}, 'success');
  const successExecution = await executeWithAudit(successRun, async (payload) => {
    writtenPayload = payload;
    return { ok: true, status: 'success' };
  });
  const { result: success, entries: successEntries } = successExecution;
  assert.deepStrictEqual(successEntries.map((entry) => entry.phase), ['attempt', 'outcome'], 'attempt is audited before outcome');
  assert.strictEqual(success.status, 'success');
  assert.strictEqual(success.resultStatus, 'success');
  assert.strictEqual(success.writeStatus, 'success');
  assert.strictEqual(success.rollbackStatus, 'not_available');
  assert.strictEqual(success.auditStatus, 'success');
  assert.deepStrictEqual(Object.keys(writtenPayload).sort(), ['lists', 'paths'], 'only included modules are written');
  assert.strictEqual(Object.prototype.hasOwnProperty.call(writtenPayload, 'avisa'), false, 'excluded modules are never written');

  const outcomeEntry = successEntries[1];
  const requiredFields = [
    'schemaVersion', 'runId', 'recordedAt', 'timestamp', 'trigger', 'phase', 'target', 'targetStatus',
    'includedModules', 'excludedModules', 'itemCounts', 'totalItems', 'readinessStatus', 'validationSummary',
    'checklistSummary', 'payloadSummary', 'confirmationSummary', 'resultStatus', 'writeStatus',
    'rollbackStatus', 'warnings', 'errors'
  ];
  requiredFields.forEach((field) => assert(Object.prototype.hasOwnProperty.call(outcomeEntry, field), `audit schema includes ${field}`));
  assert.strictEqual(outcomeEntry.schemaVersion, Adapter.AHA_MANUAL_SYNC_AUDIT_SCHEMA_VERSION);
  assert.deepStrictEqual(outcomeEntry.includedModules, ['lists', 'paths']);
  assert.deepStrictEqual(outcomeEntry.excludedModules, ['avisa']);
  assert.deepStrictEqual(outcomeEntry.itemCounts, { lists: 2, paths: 3 });
  assert.strictEqual(outcomeEntry.totalItems, 5);
  assert.deepStrictEqual(outcomeEntry.payloadSummary.moduleIds, ['lists', 'paths']);
  assert.deepStrictEqual(outcomeEntry.payloadSummary.itemCounts, { lists: 2, paths: 3 });
  assert(outcomeEntry.payloadSummary.checksum, 'payload summary has a checksum');
  assert.strictEqual(Object.prototype.hasOwnProperty.call(outcomeEntry, 'payload'), false, 'full payload is not stored');
  const outcomeJson = JSON.stringify(outcomeEntry);
  ['must-not-enter-audit', 'postgres://', 'password', 'accessToken', 'connectionString'].forEach((secret) => {
    assert.strictEqual(outcomeJson.includes(secret), false, `audit excludes ${secret}`);
  });

  let blockedWrites = 0;
  const blockedCases = [
    ['no confirmation', { confirmation: { confirmed: false, confirmedAt: null } }],
    ['not configured target', { target: null, targetStatus: 'not_configured' }],
    ['validation errors', { validationSummary: { ok: false, errorCount: 1 } }],
    ['readiness blocked', { readinessStatus: 'blocked' }],
    ['zero modules', { includedModules: [], itemCounts: {} }],
    ['invalid payload', { payload: { lists: [] }, includedModules: ['lists', 'paths'] }]
  ];
  for (const [name, overrides] of blockedCases) {
    const blockedExecution = await executeWithAudit(run(overrides, name.replace(/ /g, '-')), async () => {
      blockedWrites += 1;
      return { ok: true };
    });
    assert.strictEqual(blockedExecution.result.status, 'blocked', `${name} is blocked`);
    assert.strictEqual(blockedExecution.result.writeStatus, 'not_started');
    assert.strictEqual(blockedExecution.entries.length, 1, `${name} creates one blocked audit`);
    assert.strictEqual(blockedExecution.entries[0].phase, 'blocked');
  }
  assert.strictEqual(blockedWrites, 0, 'blocked runs never call the domain writer');

  const attemptFailure = await executeWithAudit(run({}, 'attempt-failure'), async () => {
    throw new Error('domain writer must not run after attempt audit failure');
  }, async (_entry, callNumber) => callNumber === 1
    ? { ok: false, status: 'failed', errors: ['attempt audit unavailable'], warnings: [] }
    : successfulAuditResult(_entry));
  assert.strictEqual(attemptFailure.result.status, 'blocked');
  assert.strictEqual(attemptFailure.result.writeStatus, 'not_started');
  assert.strictEqual(attemptFailure.result.auditStatus, 'failed');
  assert(attemptFailure.result.errors.includes('attempt audit unavailable'));

  const outcomeFailure = await executeWithAudit(run({}, 'outcome-failure'), async () => ({ ok: true, status: 'success' }), async (entry, callNumber) => {
    if (callNumber === 1) return successfulAuditResult(entry);
    return { ok: false, status: 'failed', errors: ['outcome audit unavailable'], warnings: [] };
  });
  assert.strictEqual(outcomeFailure.result.status, 'partial_success', 'write success plus audit failure is not clean success');
  assert.strictEqual(outcomeFailure.result.ok, false);
  assert.strictEqual(outcomeFailure.result.writeStatus, 'success');
  assert.strictEqual(outcomeFailure.result.auditStatus, 'failed');
  assert(outcomeFailure.result.errors.includes('outcome audit unavailable'));

  const domainFailure = await executeWithAudit(run({}, 'domain-failure'), async () => ({
    ok: false,
    status: 'failed',
    error: new Error('target failed'),
    rollbackStatus: 'rolled_back'
  }));
  assert.strictEqual(domainFailure.result.status, 'failed');
  assert.strictEqual(domainFailure.result.writeStatus, 'failed');
  assert.strictEqual(domainFailure.result.rollbackStatus, 'not_available', 'rollback is never claimed when not implemented');
  assert.strictEqual(domainFailure.entries[1].phase, 'failed');
  assert.strictEqual(domainFailure.entries[1].resultStatus, 'failed');
  assert(domainFailure.result.errors.includes('target failed'));

  const missingRequiredWriter = await Adapter.executeAhaManualSyncRun(run({}, 'missing-audit'), {
    writeTarget: async () => ({ ok: true }),
    auditRepository: {},
    requireAuditWriter: true
  });
  assert.strictEqual(missingRequiredWriter.status, 'blocked');
  assert.strictEqual(missingRequiredWriter.reason, 'Audit log writer is not configured.');
  assert.strictEqual(missingRequiredWriter.auditStatus, 'not_configured');

  const duplicateInput = run({}, 'duplicate');
  let duplicateWrites = 0;
  const duplicateDependencies = {
    writeTarget: async () => { duplicateWrites += 1; return { ok: true, status: 'success' }; },
    auditWriter: async (entry) => successfulAuditResult(entry)
  };
  const firstDuplicate = await Adapter.executeAhaManualSyncRun(duplicateInput, duplicateDependencies);
  const secondDuplicate = await Adapter.executeAhaManualSyncRun(duplicateInput, duplicateDependencies);
  assert.strictEqual(firstDuplicate.status, 'success');
  assert.strictEqual(secondDuplicate.status, 'blocked');
  assert.strictEqual(secondDuplicate.reason, Adapter.DUPLICATE_RUN_REASON);
  assert.strictEqual(duplicateWrites, 1, 'duplicate runId/confirmation writes only once');

  const rawAudit = {
    ...outcomeEntry,
    payload: { forbidden: true },
    fullPayload: { forbidden: true },
    password: 'nope',
    connectionString: 'postgres://nope',
    validationSummary: { ok: true, token: 'nope', unknownObject: { dump: 'nope' } },
    nested: { apiKey: 'nope', safe: 'should-not-be-whitelisted' },
    warnings: ['token=warning-secret'],
    errors: ['password=error-secret', 'safe error']
  };
  const sanitized = Repository.redactAhaManualSyncAuditEntry(rawAudit);
  const sanitizedJson = JSON.stringify(sanitized);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(sanitized, 'payload'), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(sanitized, 'fullPayload'), false);
  assert.strictEqual(sanitizedJson.includes('nope'), false);
  assert.strictEqual(sanitizedJson.includes('forbidden'), false);
  assert.strictEqual(sanitizedJson.includes('should-not-be-whitelisted'), false, 'unknown fields are not dumped');
  assert.strictEqual(sanitizedJson.includes('warning-secret'), false, 'secret-like warning text is redacted');
  assert.strictEqual(sanitizedJson.includes('error-secret'), false, 'secret-like error text is redacted');

  const detailsInput = {
    id: 'historygo_manual_sync_audit_run-123_outcome',
    created_at: '2026-06-06T10:00:02.000Z',
    payload: {
      ...outcomeEntry,
      auditStatus: 'success',
      message: 'Five items synchronized.',
      payload: { forbidden: 'full item data' },
      fullPayload: { forbidden: true },
      token: 'secret-token',
      password: 'secret-password',
      connectionString: 'postgres://secret',
      warnings: ['safe warning', 'token=warning-secret'],
      errors: ['safe error', 'password=error-secret']
    }
  };
  const details = Dashboard.buildAhaManualSyncHistoryRunDetails(detailsInput);
  assert.strictEqual(details.runId, successRun.runId);
  assert.strictEqual(details.recordedAt, outcomeEntry.recordedAt);
  assert.strictEqual(details.target, 'aha_imports');
  assert.strictEqual(details.resultStatus, 'success');
  assert.strictEqual(details.writeStatus, 'success');
  assert.deepStrictEqual(details.includedModules, ['lists', 'paths']);
  assert.deepStrictEqual(details.itemCounts, { lists: 2, paths: 3 });
  assert.strictEqual(details.totalItems, 5);
  assert.deepStrictEqual(details.warnings, ['safe warning']);
  assert.deepStrictEqual(details.errors, ['safe error']);
  assert.strictEqual(details.auditId, detailsInput.id);
  assert.deepStrictEqual(Object.keys(details).sort(), [
    'auditId', 'auditStatus', 'checklistSummary', 'confirmationSummary', 'errors', 'excludedModules',
    'includedModules', 'itemCounts', 'payloadSummary', 'readinessStatus', 'recordedAt', 'resultMessage',
    'retryEligibility',
    'resultStatus', 'rollbackStatus', 'runId', 'schemaVersion', 'target', 'targetStatus', 'totalItems',
    'trigger', 'validationSummary', 'warnings', 'writeStatus'
  ].sort(), 'details builder returns only whitelisted fields');
  const detailsJson = JSON.stringify(details);
  ['full item data', 'secret-token', 'secret-password', 'postgres://secret', 'warning-secret', 'error-secret'].forEach((secret) => {
    assert.strictEqual(detailsJson.includes(secret), false, `history details exclude ${secret}`);
  });
  ['payload', 'fullPayload', 'token', 'password', 'connectionString'].forEach((field) => {
    assert.strictEqual(Object.prototype.hasOwnProperty.call(details, field), false, `history details do not expose ${field}`);
  });

  const sparseDetails = Dashboard.sanitizeAhaManualSyncAuditRunForDetails({ runId: 'sparse-run' });
  assert.strictEqual(sparseDetails.runId, 'sparse-run');
  assert.deepStrictEqual(sparseDetails.includedModules, []);
  assert.deepStrictEqual(sparseDetails.itemCounts, {});
  assert.strictEqual(sparseDetails.totalItems, 0);
  assert.doesNotThrow(() => Dashboard.sanitizeAhaManualSyncAuditRunForDetails('unknown audit shape'));
  assert.deepStrictEqual(Dashboard.sanitizeAhaManualSyncAuditRunForDetails(null).warnings, []);

  let syncCallsFromDetails = 0;
  let auditWritesFromDetails = 0;
  let databaseWritesFromDetails = 0;
  const historyState = Dashboard.createAhaManualSyncHistoryState([detailsInput]);
  Dashboard.openAhaManualSyncHistoryDetails(historyState, successRun.runId);
  assert.strictEqual(historyState.selectedHistoryRunId, successRun.runId);
  assert.strictEqual(historyState.detailsOpen, true);
  assert.strictEqual(syncCallsFromDetails, 0, 'opening details does not start sync');
  assert.strictEqual(auditWritesFromDetails, 0, 'opening details does not write audit log');
  assert.strictEqual(databaseWritesFromDetails, 0, 'opening details does not write to the database');
  Dashboard.closeAhaManualSyncHistoryDetails(historyState);
  assert.strictEqual(historyState.selectedHistoryRunId, null);
  assert.strictEqual(historyState.detailsOpen, false);

  class FakeElement {
    constructor(tagName, ownerDocument) {
      this.tagName = tagName;
      this.ownerDocument = ownerDocument;
      this.children = [];
      this.attributes = {};
      this.dataset = {};
      this.hidden = false;
      this.textContent = '';
    }
    appendChild(child) { this.children.push(child); return child; }
    replaceChildren(...children) { this.children = children; }
    setAttribute(name, value) { this.attributes[name] = value; }
    addEventListener(name, handler) { this[`on${name}`] = handler; }
  }
  const fakeDocument = { createElement: (tagName) => new FakeElement(tagName, fakeDocument) };
  const missingDetailsElement = new FakeElement('aside', fakeDocument);
  const missingState = Dashboard.createAhaManualSyncHistoryState([]);
  Dashboard.openAhaManualSyncHistoryDetails(missingState, 'missing-run');
  const missingView = Dashboard.renderAhaManualSyncHistoryDetails(missingDetailsElement, missingState);
  assert.deepStrictEqual(missingView, { ok: false, error: Dashboard.DETAILS_MISSING_MESSAGE });
  assert.strictEqual(missingDetailsElement.children.some((child) => child.textContent === 'Selected run was not found.'), true);

  function descendants(element) {
    return [element, ...(element.children || []).flatMap(descendants)];
  }
  function findText(element, text) {
    return descendants(element).find((child) => child.textContent === text);
  }
  function findButton(element, text) {
    return descendants(element).find((child) => child.tagName === 'button' && child.textContent === text);
  }
  function findClass(element, className) {
    return descendants(element).find((child) => child.className === className);
  }

  let confirmCalls = 0;
  const hubElement = new FakeElement('section', fakeDocument);
  const hubState = Dashboard.renderAhaSyncHub(hubElement, {
    target: 'aha_imports',
    targetStatus: 'ready',
    readinessStatus: 'ready',
    includedModules: ['lists', 'paths'],
    itemCounts: { lists: 2, paths: 3 },
    validationSummary: { ok: true, checked: 5, warningCount: 0 },
    checklistSummary: { ok: true, completed: 4, total: 4 },
    auditStatus: 'success',
    canOpenConfirmation: true,
    canConfirm: false,
    historyRuns: [detailsInput],
    lastRun: detailsInput
  }, { onConfirm: () => { confirmCalls += 1; } });
  assert.strictEqual(Dashboard.AHA_SYNC_HUB_MOUNT_ID, 'aha-sync-hub-status');
  ['Sync readiness', 'Target', 'Modules', 'Items', 'Last run', 'Manual sync'].forEach((label) => {
    assert(findText(hubElement, label), `top summary renders ${label}`);
  });
  assert(findText(hubElement, 'Manual only'), 'manual-only status remains prominent');
  assert(findText(hubElement, 'Manual sync history'), 'history panel remains visible');
  assert.strictEqual(hubState.advancedOpen, false, 'Advanced diagnostics is collapsed by default without critical errors');
  const advancedToggle = findText(hubElement, 'Advanced diagnostics');
  assert(advancedToggle, 'Advanced diagnostics toggle renders');
  advancedToggle.onclick();
  assert.strictEqual(hubState.advancedOpen, true, 'Advanced diagnostics can be opened using local UI state');
  advancedToggle.onclick();
  assert.strictEqual(hubState.advancedOpen, false, 'Advanced diagnostics can be closed using local UI state');

  const manualButton = findButton(hubElement, 'Manual sync');
  manualButton.onclick();
  const confirmButton = findButton(hubElement, 'Confirm sync');
  assert(confirmButton, 'existing Manual sync / Confirm flow remains available');
  assert.strictEqual(confirmButton.disabled, true, 'Confirm remains gated by canConfirm');
  assert(findText(hubElement, 'Sync 5 items from 2 modules to aha_imports.'), 'confirmation leads with sync scope and target');
  assert(findText(hubElement, 'Audit status: success.'), 'confirmation keeps audit status visible');
  confirmButton.onclick();
  assert.strictEqual(confirmCalls, 0, 'disabled confirmation cannot execute a handler');

  const blockedHubElement = new FakeElement('section', fakeDocument);
  const blockedState = Dashboard.renderAhaSyncHub(blockedHubElement, {
    target: null,
    targetStatus: 'not_configured',
    readinessStatus: 'blocked',
    includedModules: [],
    totalItems: 0,
    validationSummary: { ok: false, errorCount: 2 },
    auditStatus: 'failed',
    writeStatus: 'failed',
    confirmationRequired: true,
    confirmation: { confirmed: false },
    lastRun: { runId: 'failed-run', resultStatus: 'failed' },
    historyRuns: []
  });
  assert.strictEqual(blockedState.advancedOpen, true, 'critical errors may open Advanced diagnostics by default');
  const expectedBlockers = [
    'Validation errors must be resolved before sync.',
    'Sync readiness is blocked.',
    'Target is not configured.',
    'Audit logging failed.',
    'The last write failed.',
    'Explicit confirmation is required.',
    'Last run requires attention: failed.'
  ];
  const blockerPanel = findClass(blockedHubElement, 'aha-sync-critical-blockers');
  assert(blockerPanel, 'critical blocker panel renders outside Advanced diagnostics');
  const blockerTexts = descendants(blockerPanel).map((child) => child.textContent);
  expectedBlockers.forEach((message) => assert(blockerTexts.includes(message), `${message} is visible outside Advanced diagnostics`));

  const historyElement = new FakeElement('section', fakeDocument);
  Dashboard.renderAhaManualSyncHistory(historyElement, [detailsInput]);
  ['Target: aha_imports', 'Items: 5', 'Modules: 2'].forEach((text) => {
    assert(findText(historyElement, text), `history row renders ${text}`);
  });
  findButton(historyElement, 'Details').onclick();
  const detailsText = descendants(historyElement).map((child) => child.textContent).join(' ');
  assert(detailsText.includes('Retry eligibility'), 'details drawer keeps retry eligibility visible');
  ['full item data', 'secret-token', 'secret-password', 'postgres://secret'].forEach((secret) => {
    assert.strictEqual(detailsText.includes(secret), false, `rendered Sync Hub excludes ${secret}`);
  });

  let readTable = null;
  let readSelect = null;
  let readFilter = null;
  let readOrder = null;
  let readLimit = null;
  let readWriteCalls = 0;
  const readResponse = { data: [detailsInput], error: null };
  const readQuery = {
    select(columns) { readSelect = columns; return this; },
    eq(column, value) { readFilter = [column, value]; return this; },
    order(column, options) { readOrder = [column, options]; return this; },
    limit(value) { readLimit = value; return this; },
    upsert() { readWriteCalls += 1; throw new Error('history reader must not write'); },
    then(resolve) { return Promise.resolve(readResponse).then(resolve); }
  };
  const historyRead = await Repository.readAhaManualSyncAuditHistory({ limit: 10 }, {
    auth: { getClient: async () => ({ from(table) { readTable = table; return readQuery; } }) }
  });
  assert.strictEqual(historyRead.ok, true);
  assert.strictEqual(historyRead.runs.length, 1);
  assert.strictEqual(historyRead.runs[0].runId, successRun.runId);
  assert.strictEqual(readTable, 'aha_imports');
  assert.strictEqual(readSelect, 'id,payload,counts,created_at');
  assert.deepStrictEqual(readFilter, ['source_app', 'historygo_manual_sync_audit']);
  assert.deepStrictEqual(readOrder, ['created_at', { ascending: false }]);
  assert.strictEqual(readLimit, 10);
  assert.strictEqual(readWriteCalls, 0, 'history reader never performs a database write');

  const storedRecords = [];
  const fakeClient = {
    from(table) {
      assert.strictEqual(table, 'aha_imports', 'audit reuses the existing database target');
      return {
        upsert(record) {
          storedRecords.push(record);
          return {
            select() {
              return { single: async () => ({ data: { id: record.id, created_at: record.created_at }, error: null }) };
            }
          };
        }
      };
    }
  };
  for (const entry of successEntries) {
    const repositoryResult = await Repository.writeAhaManualSyncAuditLog({ ...entry, password: 'nope' }, {
      auth: {
        getClient: async () => fakeClient,
        getSession: async () => ({ user: { id: 'profile-1' } })
      }
    });
    assert.strictEqual(repositoryResult.ok, true);
  }
  assert.strictEqual(storedRecords.length, 2);
  assert.notStrictEqual(storedRecords[0].id, storedRecords[1].id, 'attempt and outcome have distinct durable ids');
  assert(storedRecords[0].id.endsWith('_attempt'));
  assert(storedRecords[1].id.endsWith('_outcome'));
  assert.strictEqual(JSON.stringify(storedRecords).includes('nope'), false, 'repository never persists secrets');
  assert.strictEqual(storedRecords[0].payload.schemaVersion, Repository.AUDIT_SCHEMA_VERSION);

  const dashboardSource = fs.readFileSync(path.join(__dirname, '../js/ahaDashboard.js'), 'utf8');
  assert.strictEqual(/getClient|\.from\(|writeAhaManualSyncAuditLog|syncHistoryGoPayload/.test(dashboardSource), false, 'dashboard does not write directly to audit/database');
  const dashboardView = Dashboard.createAhaManualSyncAuditViewModel(success);
  assert.deepStrictEqual(dashboardView, {
    auditStatus: 'success',
    auditId: `audit-${successRun.runId}-outcome`,
    resultStatus: 'success',
    writeStatus: 'success',
    rollbackStatus: 'not_available',
    message: 'Audit log written',
    error: ''
  });
  assert.strictEqual(Dashboard.createAhaManualSyncAuditViewModel(missingRequiredWriter).message, 'Audit log not configured');
  assert(Dashboard.createAhaManualSyncAuditViewModel(outcomeFailure.result).error.includes('outcome audit unavailable'));

  const adapterSource = fs.readFileSync(path.join(__dirname, '../js/ahaManualSyncAdapter.js'), 'utf8');
  const repositorySource = fs.readFileSync(path.join(__dirname, '../js/ahaManualSyncAuditRepository.js'), 'utf8');
  const combinedSyncSource = `${adapterSource}\n${repositorySource}\n${dashboardSource}`;
  assert.strictEqual(/localStorage\.setItem/.test(combinedSyncSource), false, 'sync execution state is not persisted in localStorage');
  assert.strictEqual(/createClient\s*\(|new\s+SupabaseClient/.test(combinedSyncSource), false, 'no new database client is introduced');
  assert.strictEqual(/(postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@|sk_live_|service_role\s*[:=])/.test(combinedSyncSource), false, 'no credentials are hardcoded');
  assert.strictEqual(/payload\s*:\s*(entry|input|base)\.payload/.test(repositorySource), false, 'repository does not dump full input payload');
  assert.strictEqual(/JSON\.stringify/.test(dashboardSource), false, 'dashboard never stringifies a full audit entry');
  assert.strictEqual(/localStorage\.setItem/.test(dashboardSource), false, 'details state is not persisted');
  assert.strictEqual(/autoSync|syncFromDatabase/.test(dashboardSource), false, 'details UI does not introduce auto-sync');
  assert.strictEqual(/appendDetail\([^\n]*(rawPayload|fullPayload|connectionString|password|token)/.test(dashboardSource), false, 'details UI does not render sensitive fields');

  const homeSource = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  ['ahaLists.js', 'ahaPaths.js', 'ahaGroups.js', 'ahaAvisa.js'].forEach((file) => {
    assert.strictEqual(homeSource.includes(file), false, `Home does not load ${file}`);
  });

  console.log('AHA manual sync audit hardening tests passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
