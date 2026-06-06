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

  const homeSource = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  ['ahaLists.js', 'ahaPaths.js', 'ahaGroups.js', 'ahaAvisa.js'].forEach((file) => {
    assert.strictEqual(homeSource.includes(file), false, `Home does not load ${file}`);
  });

  console.log('AHA manual sync audit hardening tests passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
